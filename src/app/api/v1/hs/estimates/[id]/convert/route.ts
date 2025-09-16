import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Convert to work order schema
const ConvertToWorkOrderSchema = z.object({
  work_order_type: z.enum(['service_call', 'maintenance', 'installation', 'repair', 'inspection', 'emergency']).default('service_call'),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).default('normal'),
  service_category: z.string().max(100).optional(),
  
  // Scheduling
  scheduled_date: z.string().date().optional(),
  scheduled_time_start: z.string().time().optional(),
  scheduled_time_end: z.string().time().optional(),
  estimated_duration: z.number().min(1).optional(),
  
  // Assignment
  primary_technician_id: z.string().uuid().optional(),
  additional_technician_ids: z.array(z.string().uuid()).optional(),
  crew_size: z.number().min(1).default(1),
  
  // Customer interaction
  customer_approval_required: z.boolean().default(false),
  customer_notes: z.string().optional(),
  
  // Quality and follow-up
  quality_check_required: z.boolean().default(false),
  warranty_period: z.number().min(0).optional(),
  
  // Override estimate details if needed
  problem_description: z.string().optional(),
  work_requested: z.string().optional(),
});

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to generate work order number
async function generateWorkOrderNumber(organizationId: string): Promise<string> {
  const { data: workOrders } = await supabase
    .from('hs.work_orders')
    .select('work_order_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1);

  const currentYear = new Date().getFullYear();
  let nextNumber = 1;

  if (workOrders && workOrders.length > 0) {
    const lastNumber = workOrders[0].work_order_number;
    const match = lastNumber.match(/WO-(\d{4})-(\d+)/);
    if (match && parseInt(match[1]) === currentYear) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }

  return 'WO-${currentYear}-${nextNumber.toString().padStart(6, '0')}';
}

// POST /api/v1/hs/estimates/[id]/convert - Convert estimate to work order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;
    const body = await request.json();
    const conversionData = ConvertToWorkOrderSchema.parse(body);

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Get estimate with all details
    const { data: estimate, error: estimateError } = await supabase
      .from('hs.estimates')
      .select('
        *,
        estimate_items(*)
      ')
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .single();

    if (estimateError || !estimate) {
      return NextResponse.json(
        { error: 'Estimate not found or access denied' },
        { status: 404 }
      );
    }

    // Check if estimate can be converted
    if (estimate.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted estimates can be converted to work orders' },
        { status: 409 }
      );
    }

    if (estimate.converted_to_work_order) {
      return NextResponse.json(
        { error: 'Estimate has already been converted to a work order' },
        { status: 409 }
      );
    }

    // Validate technician if provided
    if (conversionData.primary_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', conversionData.primary_technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Primary technician not found' },
          { status: 400 }
        );
      }
    }

    // Validate additional technicians if provided
    if (conversionData.additional_technician_ids && conversionData.additional_technician_ids.length > 0) {
      const { data: additionalTechnicians } = await supabase
        .from('hs.technicians')
        .select('id')
        .in('id', conversionData.additional_technician_ids)
        .eq('organization_id', organizationId);
      
      if (!additionalTechnicians || additionalTechnicians.length !== conversionData.additional_technician_ids.length) {
        return NextResponse.json(
          { error: 'One or more additional technicians not found' },
          { status: 400 }
        );
      }
    }

    // Generate work order number
    const workOrderNumber = await generateWorkOrderNumber(organizationId);

    // Create work order from estimate data
    const workOrderData = {
      work_order_number: workOrderNumber,
      organization_id: organizationId,
      customer_id: estimate.customer_id,
      
      // Service address from estimate
      service_address_line_1: estimate.service_address_line_1,
      service_address_line_2: estimate.service_address_line_2,
      service_city: estimate.service_city,
      service_state_province: estimate.service_state_province,
      service_postal_code: estimate.service_postal_code,
      
      // Work order details
      work_order_type: conversionData.work_order_type,
      priority: conversionData.priority,
      service_category: conversionData.service_category,
      problem_description: conversionData.problem_description || estimate.description || estimate.title,
      work_requested: conversionData.work_requested || estimate.work_scope,
      
      // Scheduling
      scheduled_date: conversionData.scheduled_date,
      scheduled_time_start: conversionData.scheduled_time_start,
      scheduled_time_end: conversionData.scheduled_time_end,
      estimated_duration: conversionData.estimated_duration,
      
      // Assignment
      primary_technician_id: conversionData.primary_technician_id,
      additional_technician_ids: conversionData.additional_technician_ids,
      crew_size: conversionData.crew_size,
      
      // Pricing from estimate
      estimate_total: estimate.total_amount,
      estimate_labor_hours: null, // Will be calculated from items
      estimate_materials_cost: null, // Will be calculated from items
      estimate_created_at: new Date().toISOString(),
      estimate_valid_until: estimate.valid_until,
      
      // Customer interaction
      customer_approval_required: conversionData.customer_approval_required,
      customer_notes: conversionData.customer_notes,
      
      // Quality and warranty
      quality_check_required: conversionData.quality_check_required,
      warranty_period: conversionData.warranty_period,
      
      // Status
      status: 'new',
      
      // Audit
      created_by: user.id,
    };

    // Create work order
    const { data: workOrder, error: workOrderError } = await supabase
      .from('hs.work_orders')
      .insert(workOrderData)
      .select()
      .single();

    if (workOrderError) {
      console.error('Work order creation error:', workOrderError);
      return NextResponse.json(
        { error: 'Failed to create work order from estimate' },
        { status: 500 }
      );
    }

    // Convert estimate items to work order items
    if (estimate.estimate_items && estimate.estimate_items.length > 0) {
      const workOrderItems = estimate.estimate_items.map((item: unknown) => ({
        work_order_id: workOrder.id,
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: item.total_price,
        markup_percentage: item.markup_percentage,
        labor_hours: item.labor_hours,
        hourly_rate: item.hourly_rate,
        product_code: item.product_code,
        manufacturer: item.manufacturer,
        status: 'pending',
      }));

      const { error: itemsError } = await supabase
        .from('hs.work_order_items')
        .insert(workOrderItems);

      if (itemsError) {
        console.error('Work order items creation error:', itemsError);
        // Don't fail the conversion, just log the error
      }
    }

    // Mark estimate as converted
    const { error: updateError } = await supabase
      .from('hs.estimates')
      .update({ 
        converted_to_work_order: true,
        work_order_id: workOrder.id 
      })
      .eq('id', estimateId);

    if (updateError) {
      console.error('Estimate update error:', updateError);
      // Don't fail the conversion, just log the error
    }

    // Return complete work order with items
    const { data: completeWorkOrder } = await supabase
      .from('hs.work_orders')
      .select('
        *,
        work_order_items(*),
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:primary_technician_id(
          first_name,
          last_name,
          phone
        )
      ')
      .eq('id', workOrder.id)
      .single();

    return NextResponse.json({
      message: 'Estimate successfully converted to work order',
      work_order: completeWorkOrder || workOrder,
      estimate_id: estimateId,
      conversion_details: {
        work_order_number: workOrderNumber,
        items_converted: estimate.estimate_items?.length || 0,
        total_amount: estimate.total_amount,
      }
    });

  } catch (error) {
    console.error('POST /api/v1/hs/estimates/[id]/convert error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid conversion data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}