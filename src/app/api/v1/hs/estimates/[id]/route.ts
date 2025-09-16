import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Estimate update schema
const EstimateUpdateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  
  // Service address
  service_address_line_1: z.string().min(1).max(255).optional(),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100).optional(),
  service_state_province: z.string().min(1).max(100).optional(),
  service_postal_code: z.string().min(1).max(20).optional(),
  
  // Estimate details
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  work_scope: z.string().optional(),
  
  // Pricing
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  
  // Terms and conditions
  terms_and_conditions: z.string().optional(),
  warranty_terms: z.string().optional(),
  payment_terms: z.string().max(100).optional(),
  
  // Validity
  valid_until: z.string().date().optional(),
  requires_approval: z.boolean().optional(),
  
  // Status updates
  status: z.enum(['draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired']).optional(),
  follow_up_date: z.string().date().optional(),
  follow_up_notes: z.string().optional(),
});

// Status update schema for workflow actions
const StatusUpdateSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired']),
  action: z.enum(['submit_for_approval', 'approve', 'send_to_customer', 'mark_viewed', 'accept', 'reject', 'expire']).optional(),
  notes: z.string().optional(),
  customer_email: z.string().email().optional(), // For sending
});

// Convert to work order schema
const ConvertToWorkOrderSchema = z.object({
  work_order_type: z.enum(['service_call', 'maintenance', 'installation', 'repair', 'inspection', 'emergency']).default('service_call'),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).default('normal'),
  scheduled_date: z.string().date().optional(),
  scheduled_time_start: z.string().time().optional(),
  scheduled_time_end: z.string().time().optional(),
  primary_technician_id: z.string().uuid().optional(),
  customer_approval_required: z.boolean().default(false),
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

// Helper function to verify estimate access
async function verifyEstimateAccess(estimateId: string, organizationId: string) {
  const { data: estimate } = await supabase
    .from('hs.estimates')
    .select('id')
    .eq('id', estimateId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!estimate;
}

// Helper function to calculate totals from items
async function recalculateEstimateTotals(estimateId: string, taxRate: number = 0, discountAmount: number = 0) {
  const { data: items } = await supabase
    .from('hs.estimate_items')
    .select('total_price')
    .eq('estimate_id', estimateId);

  const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
  };
}

// GET /api/v1/hs/estimates/[id] - Get specific estimate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;

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

    // Verify estimate access
    if (!(await verifyEstimateAccess(estimateId, organizationId))) {
      return NextResponse.json(
        { error: 'Estimate not found or access denied' },
        { status: 404 }
      );
    }

    // Get estimate with related data
    const { data: estimate, error } = await supabase
      .from('hs.estimates')
      .select('
        *,
        estimate_items(*),
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone,
          address_line_1,
          address_line_2,
          city,
          state_province,
          postal_code,
          preferred_contact_method
        ),
        work_orders:work_order_id(
          id,
          work_order_number,
          problem_description,
          work_requested,
          status,
          primary_technician_id
        ),
        approved_by_user:approved_by(
          first_name,
          last_name
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch estimate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ estimate });

  } catch (error) {
    console.error('GET /api/v1/hs/estimates/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/estimates/[id] - Update estimate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;
    const body = await request.json();
    const updateData = EstimateUpdateSchema.parse(body);

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

    // Verify estimate access
    if (!(await verifyEstimateAccess(estimateId, organizationId))) {
      return NextResponse.json(
        { error: 'Estimate not found or access denied' },
        { status: 404 }
      );
    }

    // Check if estimate is in a state that allows editing
    const { data: currentEstimate } = await supabase
      .from('hs.estimates')
      .select('status, converted_to_work_order')
      .eq('id', estimateId)
      .single();

    if (currentEstimate?.converted_to_work_order) {
      return NextResponse.json(
        { error: 'Cannot edit estimate that has been converted to work order' },
        { status: 409 }
      );
    }

    if (currentEstimate?.status === 'accepted' && !updateData.status) {
      return NextResponse.json(
        { error: 'Cannot edit accepted estimate without changing status' },
        { status: 409 }
      );
    }

    // Validate customer exists if being changed
    if (updateData.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id')
        .eq('id', updateData.customer_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        );
      }
    }

    // Validate work order exists if being changed
    if (updateData.work_order_id) {
      const { data: workOrder } = await supabase
        .from('hs.work_orders')
        .select('id')
        .eq('id', updateData.work_order_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 400 }
        );
      }
    }

    // Recalculate totals if tax rate or discount changed
    let calculatedTotals = {};
    if (updateData.tax_rate !== undefined || updateData.discount_amount !== undefined) {
      const currentTaxRate = updateData.tax_rate ?? 0;
      const currentDiscountAmount = updateData.discount_amount ?? 0;
      calculatedTotals = await recalculateEstimateTotals(estimateId, currentTaxRate, currentDiscountAmount);
    }

    // Update estimate
    const { data: estimate, error } = await supabase
      .from('hs.estimates')
      .update({
        ...updateData,
        ...calculatedTotals,
      })
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update estimate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ estimate });

  } catch (error) {
    console.error('PUT /api/v1/hs/estimates/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid estimate data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/hs/estimates/[id]/status - Update estimate status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;
    const body = await request.json();
    const statusData = StatusUpdateSchema.parse(body);

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

    // Get current estimate status for validation
    const { data: currentEstimate } = await supabase
      .from('hs.estimates')
      .select('status, converted_to_work_order, customer_id')
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentEstimate) {
      return NextResponse.json(
        { error: 'Estimate not found or access denied' },
        { status: 404 }
      );
    }

    if (currentEstimate.converted_to_work_order) {
      return NextResponse.json(
        { error: 'Cannot change status of estimate converted to work order' },
        { status: 409 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'draft': ['pending_approval', 'sent'],
      'pending_approval': ['draft', 'sent'],
      'sent': ['viewed', 'accepted', 'rejected', 'expired'],
      'viewed': ['accepted', 'rejected', 'expired'],
      'accepted': [], // Final state unless converted
      'rejected': ['draft'], // Can be revised
      'expired': ['draft'], // Can be renewed
    };

    const currentStatus = currentEstimate.status;
    const newStatus = statusData.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status transition from ${currentStatus} to ${newStatus}' },
        { status: 400 }
      );
    }

    // Prepare update data with automatic timestamps
    const updateData: unknown = { status: newStatus };

    switch (newStatus) {
      case 'pending_approval':
        // No additional fields needed
        break;
      case 'sent':
        updateData.sent_to_customer_at = new Date().toISOString();
        break;
      case 'viewed':
        updateData.customer_viewed_at = new Date().toISOString();
        break;
      case 'accepted':
        updateData.customer_accepted_at = new Date().toISOString();
        break;
      case 'approved':
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
        break;
    }

    // Update estimate status
    const { data: estimate, error } = await supabase
      .from('hs.estimates')
      .update(updateData)
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update estimate status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      estimate,
      message: 'Estimate status updated to ${newStatus}' 
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/estimates/[id]/status error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/estimates/[id] - Delete estimate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;

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

    // Get current estimate to check constraints
    const { data: currentEstimate } = await supabase
      .from('hs.estimates')
      .select('status, converted_to_work_order')
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentEstimate) {
      return NextResponse.json(
        { error: 'Estimate not found or access denied' },
        { status: 404 }
      );
    }

    // Check if estimate can be deleted
    if (currentEstimate.converted_to_work_order) {
      return NextResponse.json(
        { error: 'Cannot delete estimate that has been converted to work order' },
        { status: 409 }
      );
    }

    if (currentEstimate.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot delete accepted estimate' },
        { status: 409 }
      );
    }

    // Delete estimate (cascade will handle items)
    const { error } = await supabase
      .from('hs.estimates')
      .delete()
      .eq('id', estimateId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete estimate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Estimate deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/estimates/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}