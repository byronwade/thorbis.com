import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Estimate validation schema
const EstimateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  
  // Service address
  service_address_line_1: z.string().min(1).max(255),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100),
  service_state_province: z.string().min(1).max(100),
  service_postal_code: z.string().min(1).max(20),
  
  // Estimate details
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  work_scope: z.string().optional(),
  
  // Pricing (will be calculated from items)
  subtotal: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  
  // Terms and conditions
  terms_and_conditions: z.string().optional(),
  warranty_terms: z.string().optional(),
  payment_terms: z.string().max(100).optional(),
  
  // Validity
  valid_until: z.string().date().optional(),
  requires_approval: z.boolean().default(false),
  
  // Line items
  items: z.array(z.object({
    item_type: z.enum(['labor', 'material', 'equipment', 'fee']),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unit: z.string().max(20).default('each'),
    unit_price: z.number().min(0),
    total_price: z.number().min(0),
    markup_percentage: z.number().min(0).default(0),
    labor_hours: z.number().min(0).optional(),
    hourly_rate: z.number().min(0).optional(),
    product_code: z.string().max(100).optional(),
    manufacturer: z.string().max(100).optional(),
    line_order: z.number().default(0),
  })).default([]),
});

const EstimateQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired']).optional(),
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  created_from: z.string().date().optional(),
  created_to: z.string().date().optional(),
  valid_until_from: z.string().date().optional(),
  valid_until_to: z.string().date().optional(),
  amount_min: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  amount_max: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  sort: z.enum(['created_at', 'estimate_number', 'total_amount', 'valid_until', 'status']).default('created_at'),
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

// Helper function to generate estimate number
async function generateEstimateNumber(organizationId: string): Promise<string> {
  const { data: estimates } = await supabase
    .from('hs.estimates')
    .select('estimate_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1);

  const currentYear = new Date().getFullYear();
  let nextNumber = 1;

  if (estimates && estimates.length > 0) {
    const lastNumber = estimates[0].estimate_number;
    const match = lastNumber.match(/EST-(\d{4})-(\d+)/);
    if (match && parseInt(match[1]) === currentYear) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }

  return 'EST-${currentYear}-${nextNumber.toString().padStart(6, '0')}';
}

// Helper function to calculate totals
function calculateEstimateTotals(items: unknown[], taxRate: number = 0, discountAmount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
  };
}

// GET /api/v1/hs/estimates - List estimates with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = EstimateQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.estimates')
      .select('
        id,
        estimate_number,
        customer_id,
        work_order_id,
        service_address_line_1,
        service_address_line_2,
        service_city,
        service_state_province,
        service_postal_code,
        title,
        description,
        work_scope,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        total_amount,
        terms_and_conditions,
        warranty_terms,
        payment_terms,
        valid_until,
        requires_approval,
        approved_by,
        approved_at,
        status,
        sent_to_customer_at,
        customer_viewed_at,
        customer_accepted_at,
        converted_to_work_order,
        follow_up_date,
        follow_up_notes,
        created_at,
        updated_at,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        work_orders:work_order_id(
          work_order_number,
          problem_description,
          status
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.work_order_id) {
      supabaseQuery = supabaseQuery.eq('work_order_id', query.work_order_id);
    }
    
    if (query.created_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.created_from);
    }
    
    if (query.created_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.created_to);
    }
    
    if (query.valid_until_from) {
      supabaseQuery = supabaseQuery.gte('valid_until', query.valid_until_from);
    }
    
    if (query.valid_until_to) {
      supabaseQuery = supabaseQuery.lte('valid_until', query.valid_until_to);
    }
    
    if (query.amount_min !== undefined) {
      supabaseQuery = supabaseQuery.gte('total_amount', query.amount_min);
    }
    
    if (query.amount_max !== undefined) {
      supabaseQuery = supabaseQuery.lte('total_amount', query.amount_max);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'estimate_number.ilike.%${query.search}%,title.ilike.%${query.search}%,description.ilike.%${query.search}%,work_scope.ilike.%${query.search}%,service_address_line_1.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: estimates, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch estimates' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      estimates: estimates || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/estimates error:', error);
    
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

// POST /api/v1/hs/estimates - Create new estimate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const estimateData = EstimateSchema.parse(body);

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
    if (estimateData.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id')
        .eq('id', estimateData.customer_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        );
      }
    }

    // Validate work order exists if provided
    if (estimateData.work_order_id) {
      const { data: workOrder } = await supabase
        .from('hs.work_orders')
        .select('id')
        .eq('id', estimateData.work_order_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 400 }
        );
      }
    }

    // Calculate totals from items
    const calculatedTotals = calculateEstimateTotals(
      estimateData.items, 
      estimateData.tax_rate, 
      estimateData.discount_amount
    );

    // Generate estimate number
    const estimateNumber = await generateEstimateNumber(organizationId);

    // Set valid_until to 30 days from now if not provided
    const validUntil = estimateData.valid_until || 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Prepare estimate data (without items)
    const { items, ...estimateDataWithoutItems } = estimateData;

    // Create estimate
    const { data: estimate, error } = await supabase
      .from('hs.estimates')
      .insert({
        ...estimateDataWithoutItems,
        ...calculatedTotals,
        estimate_number: estimateNumber,
        valid_until: validUntil,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create estimate' },
        { status: 500 }
      );
    }

    // Create estimate items if provided
    if (items && items.length > 0) {
      const estimateItems = items.map((item, index) => ({
        ...item,
        estimate_id: estimate.id,
        line_order: item.line_order || index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('hs.estimate_items')
        .insert(estimateItems);

      if (itemsError) {
        console.error('Database error creating items:', itemsError);
        // Don't fail the estimate creation, just log the error
      }
    }

    // Fetch complete estimate with items
    const { data: completeEstimate } = await supabase
      .from('hs.estimates')
      .select('
        *,
        estimate_items(*),
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        )
      ')
      .eq('id', estimate.id)
      .single();

    return NextResponse.json(
      { estimate: completeEstimate || estimate },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/estimates error:', error);
    
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