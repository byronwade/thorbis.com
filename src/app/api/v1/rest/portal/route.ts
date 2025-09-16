import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Restaurant-specific portal access schemas
const RestaurantPortalAccessSchema = z.object({
  customer_id: z.string().uuid(),
  access_type: z.enum(['vendor', 'partner', 'franchise', 'corporate']).default('vendor'),
  
  // Restaurant-specific permissions
  permissions: z.object({
    // Ordering and inventory
    can_view_orders: z.boolean().default(true),
    can_place_orders: z.boolean().default(true),
    can_modify_orders: z.boolean().default(false),
    can_view_inventory_levels: z.boolean().default(false),
    can_view_menu_items: z.boolean().default(true),
    can_suggest_menu_items: z.boolean().default(false),
    
    // Financial
    can_view_invoices: z.boolean().default(true),
    can_view_payment_history: z.boolean().default(true),
    can_make_payments: z.boolean().default(true),
    can_view_pricing: z.boolean().default(true),
    can_negotiate_pricing: z.boolean().default(false),
    
    // Delivery and logistics
    can_view_delivery_status: z.boolean().default(true),
    can_schedule_deliveries: z.boolean().default(false),
    can_track_drivers: z.boolean().default(false),
    can_update_delivery_address: z.boolean().default(true),
    
    // Quality and compliance
    can_view_quality_reports: z.boolean().default(false),
    can_submit_quality_feedback: z.boolean().default(true),
    can_view_certifications: z.boolean().default(true),
    can_request_inspections: z.boolean().default(false),
    
    // Communication
    can_communicate_with_account_manager: z.boolean().default(true),
    can_access_support_tickets: z.boolean().default(true),
    can_view_announcements: z.boolean().default(true),
    can_participate_in_promotions: z.boolean().default(true),
  }).default({}),
  
  // Restaurant-specific customization
  branding: z.object({
    show_restaurant_logo: z.boolean().default(true),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FF6B35'), // Restaurant orange
    restaurant_name: z.string().max(100).optional(),
    welcome_message: z.string().max(500).optional(),
    show_seasonal_themes: z.boolean().default(true),
  }).optional(),
  
  // Restaurant-specific settings
  restaurant_settings: z.object({
    cuisine_type: z.array(z.string()).optional(),
    dietary_restrictions: z.array(z.enum(['vegetarian', 'vegan', 'gluten_free', 'kosher', 'halal', 'nut_free'])).optional(),
    service_type: z.array(z.enum(['dine_in', 'takeout', 'delivery', 'catering'])).optional(),
    operating_hours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional(),
    }).optional(),
    delivery_radius_miles: z.number().min(0).max(50).optional(),
    minimum_order_amount: z.number().min(0).optional(),
  }).optional(),
  
  // Notification preferences (restaurant-specific)
  notifications: z.object({
    notify_new_menu_items: z.boolean().default(true),
    notify_price_changes: z.boolean().default(true),
    notify_delivery_updates: z.boolean().default(true),
    notify_quality_alerts: z.boolean().default(true),
    notify_seasonal_promotions: z.boolean().default(true),
    notify_account_manager_messages: z.boolean().default(true),
  }).default({}),
  
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

// Restaurant order request schema
const RestaurantOrderRequestSchema = z.object({
  portal_access_token: z.string().min(32).max(64),
  
  // Order details
  order_type: z.enum(['supply', 'ingredients', 'equipment', 'maintenance']).default('supply'),
  requested_delivery_date: z.string().date(),
  requested_delivery_time: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  
  // Items
  items: z.array(z.object({
    item_id: z.string().uuid().optional(),
    item_name: z.string().min(1).max(255),
    quantity: z.number().min(1),
    unit: z.string().max(50), // e.g., 'cases', 'lbs', 'gallons'
    specifications: z.string().optional(), // Special requirements
    estimated_price: z.number().min(0).optional(),
  })).min(1),
  
  // Delivery details
  delivery_location: z.object({
    is_primary_address: z.boolean().default(true),
    address: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional(),
    postal_code: z.string().optional(),
    delivery_instructions: z.string().optional(),
    dock_number: z.string().optional(),
    contact_person: z.string().optional(),
    contact_phone: z.string().optional(),
  }).default({}),
  
  // Special requirements
  special_requirements: z.object({
    temperature_controlled: z.boolean().default(false),
    requires_inspection: z.boolean().default(false),
    fragile_items: z.boolean().default(false),
    rush_order: z.boolean().default(false),
    recurring_order: z.boolean().default(false),
  }).optional(),
  
  // Budget and approval
  budget_limit: z.number().min(0).optional(),
  requires_manager_approval: z.boolean().default(false),
  cost_center: z.string().optional(),
  
  notes: z.string().optional(),
});

const RestaurantPortalQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  access_type: z.enum(['vendor', 'partner', 'franchise', 'corporate']).optional(),
  cuisine_type: z.string().optional(),
  service_type: z.enum(['dine_in', 'takeout', 'delivery', 'catering']).optional(),
  is_active: z.boolean().optional(),
  
  sort: z.enum(['created_at', 'last_login_at', 'restaurant_name', 'access_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  include_customer_details: z.boolean().default(true),
  include_order_history: z.boolean().default(false),
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

async function validateRestaurantPortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('rest.customer_portal_access')
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

async function logRestaurantPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('rest.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/rest/portal - List restaurant portal access configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = RestaurantPortalQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('rest.customer_portal_access`)
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
        { error: 'Failed to fetch restaurant portal access configurations' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    const { data: allAccess } = await supabase
      .from('rest.customer_portal_access')
      .select('access_type, is_active, last_login_at, restaurant_settings')
      .eq('organization_id', organizationId);

    const summary = {
      total_portal_access: count || 0,
      active_access: allAccess?.filter(p => p.is_active).length || 0,
      by_access_type: allAccess?.reduce((acc, access) => {
        acc[access.access_type] = (acc[access.access_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_cuisine_type: allAccess?.reduce((acc, access) => {
        const cuisines = access.restaurant_settings?.cuisine_type || [];
        cuisines.forEach((cuisine: string) => {
          acc[cuisine] = (acc[cuisine] || 0) + 1;
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
    console.error('GET /api/v1/rest/portal error:', error);
    
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

// POST /api/v1/rest/portal - Create restaurant portal access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessData = RestaurantPortalAccessSchema.parse(body);

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
      .from('rest.customers')
      .select('id, first_name, last_name, email, company_name')
      .eq('id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Restaurant customer not found or access denied' },
        { status: 404 }
      );
    }

    // Check for existing portal access
    const { data: existingAccess } = await supabase
      .from('rest.customer_portal_access')
      .select('id')
      .eq('customer_id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'Restaurant portal access already exists for this customer' },
        { status: 409 }
      );
    }

    const accessToken = generatePortalToken();
    const portalUrl = '${process.env.NEXT_PUBLIC_APP_URL}/rest/portal/${accessToken}';

    // Create restaurant portal access
    const { data: portalAccess, error } = await supabase
      .from('rest.customer_portal_access')
      .insert({
        customer_id: accessData.customer_id,
        access_token: accessToken,
        access_type: accessData.access_type,
        permissions: accessData.permissions,
        branding: accessData.branding,
        restaurant_settings: accessData.restaurant_settings,
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
        { error: 'Failed to create restaurant portal access' },
        { status: 500 }
      );
    }

    await logRestaurantPortalActivity(
      portalAccess.id,
      'restaurant_portal_access_created`,
      `Restaurant portal access created for: ${customer.company_name || '${customer.first_name} ${customer.last_name}'}',
      {
        customer_id: customer.id,
        access_type: accessData.access_type,
        cuisine_types: accessData.restaurant_settings?.cuisine_type,
        service_types: accessData.restaurant_settings?.service_type,
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
      message: 'Restaurant portal access created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/rest/portal error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid restaurant portal access data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}