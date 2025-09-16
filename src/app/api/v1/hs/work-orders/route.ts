import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Work Order validation schemas
const WorkOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  
  // Service address (required)
  service_address_line_1: z.string().min(1).max(255),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100),
  service_state_province: z.string().min(1).max(100),
  service_postal_code: z.string().min(1).max(20),
  
  // Work order details
  work_order_type: z.enum(['service_call', 'maintenance', 'installation', 'repair', 'inspection', 'emergency']),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).default('normal'),
  service_category: z.string().max(100).optional(),
  problem_description: z.string().min(1),
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
  crew_size: z.number().min(1).default(1),
  
  // Pricing
  estimate_total: z.number().min(0).optional(),
  estimate_labor_hours: z.number().min(0).optional(),
  estimate_materials_cost: z.number().min(0).optional(),
  estimate_valid_until: z.string().datetime().optional(),
  
  // Customer interaction
  customer_approval_required: z.boolean().default(false),
  customer_notes: z.string().optional(),
  
  // Quality and warranty
  quality_check_required: z.boolean().default(false),
  warranty_period: z.number().min(0).optional(),
});

const WorkOrderQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['new', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  work_order_type: z.enum(['service_call', 'maintenance', 'installation', 'repair', 'inspection', 'emergency']).optional(),
  technician_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  scheduled_date_from: z.string().date().optional(),
  scheduled_date_to: z.string().date().optional(),
  sort: z.enum(['created_at', 'scheduled_date', 'priority', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
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

// GET /api/v1/hs/work-orders - List work orders with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = WorkOrderQuerySchema.parse(Object.fromEntries(searchParams));
    
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

    // Build the query
    let supabaseQuery = supabase
      .from('hs.work_orders')
      .select('
        id,
        work_order_number,
        customer_id,
        service_address_line_1,
        service_address_line_2,
        service_city,
        service_state_province,
        service_postal_code,
        work_order_type,
        priority,
        service_category,
        problem_description,
        work_requested,
        requested_date,
        requested_time_start,
        requested_time_end,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        estimated_duration,
        primary_technician_id,
        crew_size,
        estimate_total,
        estimate_labor_hours,
        estimate_materials_cost,
        status,
        completion_percentage,
        work_started_at,
        work_completed_at,
        customer_approval_required,
        customer_approved_at,
        quality_check_required,
        quality_check_completed_at,
        warranty_period,
        invoice_created,
        payment_status,
        created_at,
        updated_at,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          phone,
          email
        ),
        technicians:primary_technician_id(
          first_name,
          last_name,
          phone
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.priority) {
      supabaseQuery = supabaseQuery.eq('priority', query.priority);
    }
    
    if (query.work_order_type) {
      supabaseQuery = supabaseQuery.eq('work_order_type', query.work_order_type);
    }
    
    if (query.technician_id) {
      supabaseQuery = supabaseQuery.eq('primary_technician_id', query.technician_id);
    }
    
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.scheduled_date_from) {
      supabaseQuery = supabaseQuery.gte('scheduled_date', query.scheduled_date_from);
    }
    
    if (query.scheduled_date_to) {
      supabaseQuery = supabaseQuery.lte('scheduled_date', query.scheduled_date_to);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'work_order_number.ilike.%${query.search}%,problem_description.ilike.%${query.search}%,work_requested.ilike.%${query.search}%,service_address_line_1.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: workOrders, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch work orders' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      workOrders: workOrders || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/work-orders error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/work-orders - Create new work order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const workOrderData = WorkOrderSchema.parse(body);

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

    // Validate customer exists if provided
    if (workOrderData.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id')
        .eq('id', workOrderData.customer_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        );
      }
    }

    // Validate technician exists if provided
    if (workOrderData.primary_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', workOrderData.primary_technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 400 }
        );
      }
    }

    // Create work order (work_order_number will be auto-generated by trigger)
    const { data: workOrder, error } = await supabase
      .from('hs.work_orders')
      .insert({
        ...workOrderData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create work order' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { workOrder },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/work-orders error:', error);
    
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