import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Portal access schemas
const PortalAccessSchema = z.object({
  customer_id: z.string().uuid(),
  access_type: z.enum(['full', 'limited', 'view_only']).default('limited'),
  
  // Feature permissions
  permissions: z.object({
    can_view_work_orders: z.boolean().default(true),
    can_view_invoices: z.boolean().default(true),
    can_view_estimates: z.boolean().default(true),
    can_view_photos: z.boolean().default(true),
    can_view_documents: z.boolean().default(false),
    can_view_payment_history: z.boolean().default(true),
    
    can_request_service: z.boolean().default(true),
    can_approve_estimates: z.boolean().default(false),
    can_make_payments: z.boolean().default(true),
    can_schedule_appointments: z.boolean().default(false),
    can_upload_documents: z.boolean().default(false),
    can_communicate: z.boolean().default(true),
    
    can_view_technician_location: z.boolean().default(false),
    can_rate_service: z.boolean().default(true),
    can_update_profile: z.boolean().default(true),
    can_manage_contacts: z.boolean().default(false),
  }).default({}),
  
  // Access restrictions
  restrictions: z.object({
    ip_whitelist: z.array(z.string().ip()).optional(),
    time_restrictions: z.object({
      allowed_hours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
      allowed_days: z.array(z.number().min(0).max(6)).optional(), // 0 = Sunday
    }).optional(),
    max_sessions: z.number().min(1).max(10).default(3),
    session_timeout_minutes: z.number().min(15).max(480).default(120),
  }).default({}),
  
  // Customization
  branding: z.object({
    logo_url: z.string().url().optional(),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    company_name: z.string().max(100).optional(),
    welcome_message: z.string().max(500).optional(),
  }).optional(),
  
  // Notification preferences
  notifications: z.object({
    email_enabled: z.boolean().default(true),
    sms_enabled: z.boolean().default(false),
    push_enabled: z.boolean().default(false),
    
    notify_work_order_updates: z.boolean().default(true),
    notify_appointment_reminders: z.boolean().default(true),
    notify_invoice_ready: z.boolean().default(true),
    notify_payment_due: z.boolean().default(true),
    notify_service_complete: z.boolean().default(true),
  }).default({}),
  
  // Expiration and status
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

const PortalQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  // Filters
  access_type: z.enum(['full', 'limited', 'view_only']).optional(),
  is_active: z.boolean().optional(),
  has_recent_activity: z.boolean().optional(),
  expires_soon: z.boolean().optional(), // Within 30 days
  
  // Date filters
  created_from: z.string().datetime().optional(),
  created_to: z.string().datetime().optional(),
  last_login_from: z.string().datetime().optional(),
  last_login_to: z.string().datetime().optional(),
  
  // Sorting
  sort: z.enum(['created_at', 'last_login_at', 'customer_name', 'access_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Include options
  include_customer_details: z.boolean().default(true),
  include_activity_stats: z.boolean().default(false),
  include_recent_sessions: z.boolean().default(false),
});

// Service request schema for portal users
const ServiceRequestSchema = z.object({
  service_type: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  
  preferred_date: z.string().date().optional(),
  preferred_time_slot: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  
  location: z.object({
    is_primary_address: z.boolean().default(true),
    address: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional(),
    postal_code: z.string().optional(),
    special_instructions: z.string().optional(),
  }).default({}),
  
  attachments: z.array(z.object({
    filename: z.string(),
    file_type: z.string(),
    file_size: z.number(),
    description: z.string().optional(),
  })).optional(),
  
  contact_preferences: z.object({
    preferred_method: z.enum(['phone', 'email', 'sms']).default('phone'),
    best_time_to_contact: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
    phone_number: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
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

// Helper function to generate portal access token
function generatePortalToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = ';
  for (const i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Helper function to log portal activity
async function logPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/portal - List portal access configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PortalQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Build query
    let supabaseQuery = supabase
      .from('hs.customer_portal_access`)
      .select('
        *,
        ${query.include_customer_details ? '
          customer:customer_id(
            id,
            first_name,
            last_name,
            company_name,
            email,
            phone,
            customer_type,
            status
          ),
        ' : '}
        created_by_user:created_by(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.access_type) {
      supabaseQuery = supabaseQuery.eq('access_type', query.access_type);
    }
    
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    
    if (query.expires_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      supabaseQuery = supabaseQuery
        .not('expires_at', 'is', null)
        .lte('expires_at', thirtyDaysFromNow.toISOString());
    }

    // Date filters
    if (query.created_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.created_from);
    }
    
    if (query.created_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.created_to);
    }
    
    if (query.last_login_from) {
      supabaseQuery = supabaseQuery.gte('last_login_at', query.last_login_from);
    }
    
    if (query.last_login_to) {
      supabaseQuery = supabaseQuery.lte('last_login_at', query.last_login_to);
    }

    // Apply search
    if (query.search && query.include_customer_details) {
      supabaseQuery = supabaseQuery.or(
        'customer.first_name.ilike.%${query.search}%,customer.last_name.ilike.%${query.search}%,customer.company_name.ilike.%${query.search}%,customer.email.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: portalAccess, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch portal access configurations' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get portal statistics
    const { data: allAccess } = await supabase
      .from('hs.customer_portal_access')
      .select('access_type, is_active, last_login_at, expires_at')
      .eq('organization_id', organizationId);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const summary = {
      total_portal_access: count || 0,
      active_access: allAccess?.filter(p => p.is_active).length || 0,
      recent_logins: allAccess?.filter(p => 
        p.last_login_at && new Date(p.last_login_at) > thirtyDaysAgo
      ).length || 0,
      expiring_soon: allAccess?.filter(p => 
        p.expires_at && new Date(p.expires_at) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      ).length || 0,
      
      by_access_type: allAccess?.reduce((acc, access) => {
        acc[access.access_type] = (acc[access.access_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      portal_access: portalAccess || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/portal error:', error);
    
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

// POST /api/v1/hs/portal - Create portal access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessData = PortalAccessSchema.parse(body);

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

    // Verify customer exists and belongs to organization
    const { data: customer, error: customerError } = await supabase
      .from('hs.customers')
      .select('id, first_name, last_name, email')
      .eq('id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Check if portal access already exists for this customer
    const { data: existingAccess } = await supabase
      .from('hs.customer_portal_access')
      .select('id')
      .eq('customer_id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'Portal access already exists for this customer' },
        { status: 409 }
      );
    }

    // Generate access token and URL
    const accessToken = generatePortalToken();
    const portalUrl = '${process.env.NEXT_PUBLIC_APP_URL}/portal/${accessToken}';

    // Create portal access
    const { data: portalAccess, error } = await supabase
      .from('hs.customer_portal_access')
      .insert({
        customer_id: accessData.customer_id,
        access_token: accessToken,
        access_type: accessData.access_type,
        permissions: accessData.permissions,
        restrictions: accessData.restrictions,
        branding: accessData.branding,
        notifications: accessData.notifications,
        expires_at: accessData.expires_at,
        is_active: accessData.is_active,
        notes: accessData.notes,
        portal_url: portalUrl,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create portal access' },
        { status: 500 }
      );
    }

    // Log portal access creation
    await logPortalActivity(
      portalAccess.id,
      'portal_access_created',
      'Portal access created for customer: ${customer.first_name} ${customer.last_name}',
      {
        customer_id: customer.id,
        access_type: accessData.access_type,
        permissions: Object.keys(accessData.permissions || {}).filter(key => 
          accessData.permissions?.[key as keyof typeof accessData.permissions]
        ),
      },
      organizationId,
      user.id
    );

    return NextResponse.json({
      portal_access: {
        ...portalAccess,
        access_token: undefined, // Don't expose token in response
      },
      customer: customer,
      portal_url: portalUrl,
      message: 'Portal access created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/portal error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid portal access data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}