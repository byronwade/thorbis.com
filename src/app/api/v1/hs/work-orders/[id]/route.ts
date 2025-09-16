import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Work Order update schema
const WorkOrderUpdateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  
  // Service address
  service_address_line_1: z.string().min(1).max(255).optional(),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100).optional(),
  service_state_province: z.string().min(1).max(100).optional(),
  service_postal_code: z.string().min(1).max(20).optional(),
  
  // Work order details
  work_order_type: z.enum(['service_call', 'maintenance', 'installation', 'repair', 'inspection', 'emergency']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  service_category: z.string().max(100).optional(),
  problem_description: z.string().min(1).optional(),
  work_requested: z.string().optional(),
  
  // Scheduling
  requested_date: z.string().date().optional(),
  requested_time_start: z.string().time().optional(),
  requested_time_end: z.string().time().optional(),
  scheduled_date: z.string().date().optional(),
  scheduled_time_start: z.string().time().optional(),
  scheduled_time_end: z.string().time().optional(),
  estimated_duration: z.number().min(1).optional(),
  
  // Assignment
  primary_technician_id: z.string().uuid().optional(),
  additional_technician_ids: z.array(z.string().uuid()).optional(),
  crew_size: z.number().min(1).optional(),
  
  // Status and workflow
  status: z.enum(['new', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
  substatus: z.string().max(50).optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  
  // Work completion
  work_started_at: z.string().datetime().optional(),
  work_completed_at: z.string().datetime().optional(),
  actual_duration: z.number().min(1).optional(),
  work_description: z.string().optional(),
  work_performed: z.string().optional(),
  
  // Pricing
  estimate_total: z.number().min(0).optional(),
  estimate_labor_hours: z.number().min(0).optional(),
  estimate_materials_cost: z.number().min(0).optional(),
  estimate_valid_until: z.string().datetime().optional(),
  
  // Customer interaction
  customer_approval_required: z.boolean().optional(),
  customer_approved_at: z.string().datetime().optional(),
  customer_notes: z.string().optional(),
  
  // Quality and warranty
  quality_check_required: z.boolean().optional(),
  quality_check_completed_at: z.string().datetime().optional(),
  warranty_period: z.number().min(0).optional(),
  
  // Financial
  invoice_created: z.boolean().optional(),
  payment_status: z.enum(['pending', 'partial', 'paid', 'overdue']).optional(),
});

// Status transition schema for specific status updates
const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  completion_percentage: z.number().min(0).max(100).optional(),
  work_started_at: z.string().datetime().optional(),
  work_completed_at: z.string().datetime().optional(),
  actual_duration: z.number().min(1).optional(),
  work_performed: z.string().optional(),
  notes: z.string().optional(),
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

// Helper function to verify work order access
async function verifyWorkOrderAccess(workOrderId: string, organizationId: string) {
  const { data: workOrder } = await supabase
    .from('hs.work_orders')
    .select('id')
    .eq('id', workOrderId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!workOrder;
}

// GET /api/v1/hs/work-orders/[id] - Get specific work order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;

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

    // Verify work order access
    if (!(await verifyWorkOrderAccess(workOrderId, organizationId))) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Get work order with related data
    const { data: workOrder, error } = await supabase
      .from('hs.work_orders')
      .select('
        *,
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          phone,
          email,
          preferred_contact_method,
          special_instructions,
          access_instructions
        ),
        technicians:primary_technician_id(
          id,
          first_name,
          last_name,
          phone,
          specializations,
          current_status
        ),
        work_order_items(*),
        appointments(*)
      ')
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch work order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workOrder });

  } catch (error) {
    console.error('GET /api/v1/hs/work-orders/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/work-orders/[id] - Update work order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;
    const body = await request.json();
    const updateData = WorkOrderUpdateSchema.parse(body);

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

    // Verify work order access
    if (!(await verifyWorkOrderAccess(workOrderId, organizationId))) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
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

    // Validate technician exists if being changed
    if (updateData.primary_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', updateData.primary_technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 400 }
        );
      }
    }

    // Update work order
    const { data: workOrder, error } = await supabase
      .from('hs.work_orders')
      .update(updateData)
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update work order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workOrder });

  } catch (error) {
    console.error('PUT /api/v1/hs/work-orders/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid work order data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/hs/work-orders/[id]/status - Update work order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;
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

    // Verify work order access and get current status
    const { data: currentWorkOrder } = await supabase
      .from('hs.work_orders')
      .select('status, completion_percentage')
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentWorkOrder) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Validate status transitions (business logic)
    const validTransitions: Record<string, string[]> = {
      'new': ['scheduled', 'cancelled'],
      'scheduled': ['dispatched', 'cancelled', 'on_hold'],
      'dispatched': ['in_progress', 'cancelled', 'on_hold'],
      'in_progress': ['completed', 'cancelled', 'on_hold'],
      'on_hold': ['scheduled', 'dispatched', 'in_progress', 'cancelled'],
      'completed': ['on_hold'], // Allow reopening completed work orders
      'cancelled': [], // Cancelled work orders cannot be changed
    };

    const currentStatus = currentWorkOrder.status;
    const newStatus = statusData.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status transition from ${currentStatus} to ${newStatus}' },
        { status: 400 }
      );
    }

    // Prepare update data with automatic fields based on status
    const updateData: unknown = { ...statusData };

    // Auto-set timestamps based on status
    if (newStatus === 'in_progress' && !statusData.work_started_at) {
      updateData.work_started_at = new Date().toISOString();
    }
    
    if (newStatus === 'completed' && !statusData.work_completed_at) {
      updateData.work_completed_at = new Date().toISOString();
      updateData.completion_percentage = 100;
    }

    // Update work order
    const { data: workOrder, error } = await supabase
      .from('hs.work_orders')
      .update(updateData)
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update work order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workOrder });

  } catch (error) {
    console.error('PATCH /api/v1/hs/work-orders/[id]/status error:', error);
    
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

// DELETE /api/v1/hs/work-orders/[id] - Cancel work order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;

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

    // Verify work order access and get current status
    const { data: currentWorkOrder } = await supabase
      .from('hs.work_orders')
      .select('status')
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentWorkOrder) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if work order can be cancelled
    if (currentWorkOrder.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed work order' },
        { status: 409 }
      );
    }

    if (currentWorkOrder.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Work order is already cancelled' },
        { status: 409 }
      );
    }

    // Cancel work order
    const { data: workOrder, error } = await supabase
      .from('hs.work_orders')
      .update({ 
        status: 'cancelled',
        completion_percentage: 0
      })
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to cancel work order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Work order cancelled successfully',
      workOrder 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/work-orders/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}