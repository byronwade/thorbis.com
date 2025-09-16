import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auto services-specific portal access schemas
const AutoPortalAccessSchema = z.object({
  customer_id: z.string().uuid(),
  access_type: z.enum(['fleet_manager', 'individual_owner', 'dealership', 'insurance_company']).default('individual_owner'),
  
  // Auto-specific permissions
  permissions: z.object({
    // Vehicle and service access
    can_view_vehicle_history: z.boolean().default(true),
    can_schedule_service: z.boolean().default(true),
    can_request_estimates: z.boolean().default(true),
    can_view_service_records: z.boolean().default(true),
    can_update_vehicle_info: z.boolean().default(false),
    can_add_vehicles: z.boolean().default(false),
    
    // Repair and maintenance
    can_view_repair_orders: z.boolean().default(true),
    can_approve_repairs: z.boolean().default(false),
    can_view_parts_used: z.boolean().default(true),
    can_request_parts_quotes: z.boolean().default(true),
    can_view_labor_details: z.boolean().default(true),
    
    // Financial and billing
    can_view_invoices: z.boolean().default(true),
    can_view_estimates: z.boolean().default(true),
    can_make_payments: z.boolean().default(true),
    can_view_payment_history: z.boolean().default(true),
    can_setup_payment_plans: z.boolean().default(false),
    
    // Diagnostics and reports
    can_view_diagnostic_reports: z.boolean().default(true),
    can_request_inspections: z.boolean().default(true),
    can_view_warranty_info: z.boolean().default(true),
    can_download_reports: z.boolean().default(true),
    
    // Communication and support
    can_message_service_advisor: z.boolean().default(true),
    can_receive_service_updates: z.boolean().default(true),
    can_rate_service: z.boolean().default(true),
    can_request_pickup_delivery: z.boolean().default(false),
  }).default({}),
  
  // Auto-specific customization
  branding: z.object({
    show_shop_logo: z.boolean().default(true),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#DC2626'), // Auto red
    shop_name: z.string().max(100).optional(),
    welcome_message: z.string().max(500).optional(),
    show_manufacturer_logos: z.boolean().default(true),
  }).optional(),
  
  // Auto-specific settings
  auto_settings: z.object({
    specialties: z.array(z.enum([
      'general_repair', 'engine_work', 'transmission', 'brakes', 'electrical',
      'air_conditioning', 'body_work', 'paint', 'tires', 'alignment',
      'diagnostic', 'oil_change', 'tune_up', 'inspection', 'warranty_work'
    ])).optional(),
    manufacturers_serviced: z.array(z.string()).optional(), // e.g., ['Ford', 'Toyota', 'BMW']
    service_types: z.array(z.enum(['maintenance', 'repair', 'diagnostic', 'inspection', 'body_work', 'detailing'])).optional(),
    operating_hours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional(),
    }).optional(),
    offers_loaner_vehicles: z.boolean().default(false),
    offers_pickup_delivery: z.boolean().default(false),
    warranty_provider: z.boolean().default(false),
  }).optional(),
  
  // Notification preferences (auto-specific)
  notifications: z.object({
    notify_service_reminders: z.boolean().default(true),
    notify_service_completion: z.boolean().default(true),
    notify_estimate_ready: z.boolean().default(true),
    notify_parts_arrival: z.boolean().default(true),
    notify_warranty_expiration: z.boolean().default(true),
    notify_recall_notices: z.boolean().default(true),
    notify_appointment_reminders: z.boolean().default(true),
  }).default({}),
  
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

// Auto service request schema
const AutoServiceRequestSchema = z.object({
  portal_access_token: z.string().min(32).max(64),
  
  // Vehicle information
  vehicle_id: z.string().uuid().optional(),
  vehicle_info: z.object({
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().length(17).optional(),
    license_plate: z.string().max(20).optional(),
    mileage: z.number().min(0).optional(),
    color: z.string().max(30).optional(),
    engine_type: z.string().max(50).optional(),
  }),
  
  // Service request details
  service_type: z.enum(['maintenance', 'repair', 'diagnostic', 'inspection', 'estimate', 'warranty_work']),
  service_category: z.array(z.enum([
    'engine', 'transmission', 'brakes', 'electrical', 'air_conditioning',
    'suspension', 'steering', 'exhaust', 'cooling_system', 'fuel_system',
    'tires', 'alignment', 'body_work', 'paint', 'interior', 'other'
  ])).min(1),
  
  // Problem description
  symptoms_description: z.string().min(10).max(2000),
  when_problem_occurs: z.enum(['always', 'startup', 'driving', 'braking', 'turning', 'parking', 'intermittent']).optional(),
  problem_duration: z.enum(['just_started', 'few_days', 'few_weeks', 'few_months', 'ongoing']).optional(),
  
  // Service preferences
  preferred_appointment_date: z.string().date().optional(),
  preferred_time_slot: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  urgency: z.enum(['routine', 'soon', 'urgent', 'emergency']).default('routine'),
  
  // Additional services
  additional_services: z.object({
    needs_loaner_car: z.boolean().default(false),
    needs_pickup_delivery: z.boolean().default(false),
    needs_rental_discount: z.boolean().default(false),
    ok_with_aftermarket_parts: z.boolean().default(true),
    warranty_work_only: z.boolean().default(false),
  }).optional(),
  
  // Budget and approval
  estimated_budget: z.number().min(0).optional(),
  auto_approve_under: z.number().min(0).optional(), // Auto-approve repairs under this amount
  requires_estimate_approval: z.boolean().default(true),
  
  // Contact and communication
  contact_preferences: z.object({
    preferred_method: z.enum(['phone', 'email', 'sms', 'portal']).default('phone'),
    can_contact_at_work: z.boolean().default(true),
    best_time_to_contact: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
    emergency_contact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    }).optional(),
  }).optional(),
  
  // Insurance information
  insurance_info: z.object({
    is_insurance_claim: z.boolean().default(false),
    insurance_company: z.string().optional(),
    claim_number: z.string().optional(),
    deductible_amount: z.number().min(0).optional(),
    has_rental_coverage: z.boolean().default(false),
  }).optional(),
  
  notes: z.string().optional(),
});

const AutoPortalQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  access_type: z.enum(['fleet_manager', 'individual_owner', 'dealership', 'insurance_company']).optional(),
  specialties: z.string().optional(),
  manufacturer: z.string().optional(),
  is_active: z.boolean().optional(),
  
  sort: z.enum(['created_at', 'last_login_at', 'shop_name', 'access_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  include_customer_details: z.boolean().default(true),
  include_vehicle_history: z.boolean().default(false),
});

// Helper functions
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

async function validateAutoPortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('auto.customer_portal_access')
    .select('
      *,
      customer:customer_id(id, first_name, last_name, email, phone, company_name)
    ')
    .eq('access_token', accessToken)
    .eq('is_active', true)
    .single();

  if (!portalAccess) return null;

  if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
    return null;
  }

  return portalAccess;
}

function generatePortalToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = ';
  for (const i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function logAutoPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('auto.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/auto/portal - List auto portal access configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AutoPortalQuerySchema.parse(Object.fromEntries(searchParams));

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

    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    let supabaseQuery = supabase
      .from('auto.customer_portal_access`)
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
            customer_type
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

    if (query.search && query.include_customer_details) {
      supabaseQuery = supabaseQuery.or(
        'customer.company_name.ilike.%${query.search}%,customer.first_name.ilike.%${query.search}%,customer.last_name.ilike.%${query.search}%'
      );
    }

    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: portalAccess, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch auto portal access configurations' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    const { data: allAccess } = await supabase
      .from('auto.customer_portal_access')
      .select('access_type, is_active, last_login_at, auto_settings')
      .eq('organization_id', organizationId);

    const summary = {
      total_portal_access: count || 0,
      active_access: allAccess?.filter(p => p.is_active).length || 0,
      by_access_type: allAccess?.reduce((acc, access) => {
        acc[access.access_type] = (acc[access.access_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_specialties: allAccess?.reduce((acc, access) => {
        const specialties = access.auto_settings?.specialties || [];
        specialties.forEach((specialty: string) => {
          acc[specialty] = (acc[specialty] || 0) + 1;
        });
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
    console.error('GET /api/v1/auto/portal error:', error);
    
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

// POST /api/v1/auto/portal - Create auto portal access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessData = AutoPortalAccessSchema.parse(body);

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

    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('auto.customers')
      .select('id, first_name, last_name, email, company_name')
      .eq('id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Auto customer not found or access denied' },
        { status: 404 }
      );
    }

    // Check for existing portal access
    const { data: existingAccess } = await supabase
      .from('auto.customer_portal_access')
      .select('id')
      .eq('customer_id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'Auto portal access already exists for this customer' },
        { status: 409 }
      );
    }

    const accessToken = generatePortalToken();
    const portalUrl = '${process.env.NEXT_PUBLIC_APP_URL}/auto/portal/${accessToken}';

    // Create auto portal access
    const { data: portalAccess, error } = await supabase
      .from('auto.customer_portal_access')
      .insert({
        customer_id: accessData.customer_id,
        access_token: accessToken,
        access_type: accessData.access_type,
        permissions: accessData.permissions,
        branding: accessData.branding,
        auto_settings: accessData.auto_settings,
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
        { error: 'Failed to create auto portal access' },
        { status: 500 }
      );
    }

    await logAutoPortalActivity(
      portalAccess.id,
      'auto_portal_access_created`,
      `Auto portal access created for: ${customer.company_name || '${customer.first_name} ${customer.last_name}'}',
      {
        customer_id: customer.id,
        access_type: accessData.access_type,
        specialties: accessData.auto_settings?.specialties,
        manufacturers: accessData.auto_settings?.manufacturers_serviced,
      },
      organizationId,
      user.id
    );

    return NextResponse.json({
      portal_access: {
        ...portalAccess,
        access_token: undefined, // Don't expose token
      },
      customer: customer,
      portal_url: portalUrl,
      message: 'Auto portal access created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/auto/portal error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid auto portal access data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}