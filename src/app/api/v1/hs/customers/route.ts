import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Customer validation schemas
const CustomerSchema = z.object({
  customer_type: z.enum(['residential', 'commercial', 'property_management']).default('residential'),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  company_name: z.string().max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  secondary_phone: z.string().max(20).optional(),
  
  // Address information
  address_line_1: z.string().max(255).optional(),
  address_line_2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).default('US'),
  
  // Service address (if different)
  service_address_line_1: z.string().max(255).optional(),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().max(100).optional(),
  service_state_province: z.string().max(100).optional(),
  service_postal_code: z.string().max(20).optional(),
  
  // Preferences
  preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).default('phone'),
  preferred_appointment_time: z.string().max(50).optional(),
  special_instructions: z.string().optional(),
  access_instructions: z.string().optional(),
  
  // Status
  customer_status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  customer_rating: z.number().min(1).max(5).optional(),
  internal_notes: z.string().optional(),
});

const CustomerUpdateSchema = CustomerSchema.partial();

const CustomerQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  customer_type: z.enum(['residential', 'commercial', 'property_management']).optional(),
  customer_status: z.enum(['active', 'inactive', 'blocked']).optional(),
  sort: z.enum(['created_at', 'last_name', 'total_revenue', 'last_service_date']).default('created_at'),
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

// GET /api/v1/hs/customers - List customers with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = CustomerQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.customers')
      .select('
        id,
        customer_type,
        first_name,
        last_name,
        company_name,
        email,
        phone,
        secondary_phone,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        country,
        service_address_line_1,
        service_address_line_2,
        service_city,
        service_state_province,
        service_postal_code,
        preferred_contact_method,
        preferred_appointment_time,
        customer_status,
        customer_since,
        total_jobs,
        total_revenue,
        last_service_date,
        customer_rating,
        created_at,
        updated_at
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.customer_type) {
      supabaseQuery = supabaseQuery.eq('customer_type', query.customer_type);
    }
    
    if (query.customer_status) {
      supabaseQuery = supabaseQuery.eq('customer_status', query.customer_status);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,company_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: customers, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/customers error:', error);
    
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

// POST /api/v1/hs/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerData = CustomerSchema.parse(body);

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

    // Create customer
    const { data: customer, error } = await supabase
      .from('hs.customers')
      .insert({
        ...customerData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { customer },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/customers error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}