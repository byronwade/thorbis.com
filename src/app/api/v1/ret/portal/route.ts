import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Retail-specific portal access schemas
const RetailPortalAccessSchema = z.object({
  customer_id: z.string().uuid(),
  access_type: z.enum(['wholesale_buyer', 'retail_customer', 'business_account', 'vip_customer']).default('retail_customer'),
  
  // Retail-specific permissions
  permissions: z.object({
    // Shopping and orders
    can_browse_catalog: z.boolean().default(true),
    can_place_orders: z.boolean().default(true),
    can_modify_orders: z.boolean().default(false),
    can_cancel_orders: z.boolean().default(true),
    can_reorder_items: z.boolean().default(true),
    can_save_favorites: z.boolean().default(true),
    can_create_wishlists: z.boolean().default(true),
    
    // Pricing and discounts
    can_view_wholesale_prices: z.boolean().default(false),
    can_view_member_prices: z.boolean().default(false),
    can_apply_discount_codes: z.boolean().default(true),
    can_view_price_history: z.boolean().default(false),
    can_request_price_match: z.boolean().default(false),
    
    // Account management
    can_view_order_history: z.boolean().default(true),
    can_download_receipts: z.boolean().default(true),
    can_track_shipments: z.boolean().default(true),
    can_manage_addresses: z.boolean().default(true),
    can_manage_payment_methods: z.boolean().default(true),
    can_view_loyalty_points: z.boolean().default(true),
    
    // Returns and exchanges
    can_initiate_returns: z.boolean().default(true),
    can_exchange_items: z.boolean().default(true),
    can_view_return_policy: z.boolean().default(true),
    can_print_return_labels: z.boolean().default(true),
    
    // Communication and support
    can_contact_support: z.boolean().default(true),
    can_chat_with_sales: z.boolean().default(true),
    can_schedule_appointments: z.boolean().default(false),
    can_request_product_demos: z.boolean().default(false),
    can_leave_reviews: z.boolean().default(true),
  }).default({}),
  
  // Retail-specific customization
  branding: z.object({
    show_store_logo: z.boolean().default(true),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#059669'), // Retail green
    store_name: z.string().max(100).optional(),
    welcome_message: z.string().max(500).optional(),
    show_seasonal_themes: z.boolean().default(true),
    show_sale_banners: z.boolean().default(true),
  }).optional(),
  
  // Retail-specific settings
  retail_settings: z.object({
    store_categories: z.array(z.string()).optional(), // e.g., ['electronics', 'clothing', 'home']
    preferred_brands: z.array(z.string()).optional(),
    size_preferences: z.object({
      clothing_size: z.string().optional(),
      shoe_size: z.string().optional(),
    }).optional(),
    shopping_preferences: z.object({
      preferred_payment_method: z.enum(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay']).optional(),
      preferred_shipping_method: z.enum(['standard', 'express', 'overnight', 'pickup']).default('standard'),
      email_marketing_consent: z.boolean().default(true),
      sms_marketing_consent: z.boolean().default(false),
    }).optional(),
    loyalty_program: z.object({
      member_level: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('bronze'),
      points_balance: z.number().min(0).default(0),
      member_since: z.string().date().optional(),
    }).optional(),
  }).optional(),
  
  // Notification preferences (retail-specific)
  notifications: z.object({
    notify_order_updates: z.boolean().default(true),
    notify_shipping_updates: z.boolean().default(true),
    notify_delivery_updates: z.boolean().default(true),
    notify_sales_promotions: z.boolean().default(true),
    notify_new_arrivals: z.boolean().default(false),
    notify_back_in_stock: z.boolean().default(true),
    notify_price_drops: z.boolean().default(false),
    notify_loyalty_rewards: z.boolean().default(true),
  }).default({}),
  
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

// Retail order request schema
const RetailOrderRequestSchema = z.object({
  portal_access_token: z.string().min(32).max(64),
  
  // Order type and details
  order_type: z.enum(['purchase', 'quote_request', 'custom_order', 'bulk_order']).default('purchase'),
  
  // Items
  items: z.array(z.object({
    product_id: z.string().uuid().optional(),
    product_name: z.string().min(1).max(255),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
    variant: z.string().optional(), // e.g., "Large, Blue, Cotton"
    unit_price: z.number().min(0).optional(),
    notes: z.string().optional(),
  })).min(1),
  
  // Shipping and delivery
  shipping_address: z.object({
    is_primary_address: z.boolean().default(true),
    recipient_name: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    delivery_instructions: z.string().optional(),
  }).default({}),
  
  shipping_method: z.enum(['standard', 'express', 'overnight', 'pickup', 'white_glove']).default('standard'),
  preferred_delivery_date: z.string().date().optional(),
  
  // Payment preferences
  payment_method: z.enum(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'store_credit', 'layaway']).optional(),
  use_store_credit: z.boolean().default(false),
  use_loyalty_points: z.boolean().default(false),
  payment_plan_requested: z.boolean().default(false),
  
  // Discounts and promotions
  discount_codes: z.array(z.string()).optional(),
  employee_discount: z.boolean().default(false),
  price_match_request: z.object({
    competitor_name: z.string(),
    competitor_price: z.number().min(0),
    competitor_url: z.string().url().optional(),
  }).optional(),
  
  // Special requirements
  special_requirements: z.object({
    gift_wrap: z.boolean().default(false),
    gift_message: z.string().optional(),
    assembly_required: z.boolean().default(false),
    installation_requested: z.boolean().default(false),
    eco_friendly_packaging: z.boolean().default(false),
  }).optional(),
  
  // Communication preferences
  order_updates_method: z.enum(['email', 'sms', 'phone', 'portal']).default('email'),
  
  notes: z.string().optional(),
});

const RetailPortalQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  access_type: z.enum(['wholesale_buyer', 'retail_customer', 'business_account', 'vip_customer']).optional(),
  store_category: z.string().optional(),
  loyalty_level: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  is_active: z.boolean().optional(),
  
  sort: z.enum(['created_at', 'last_login_at', 'store_name', 'access_type', 'loyalty_points']).default('created_at'),
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

async function validateRetailPortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('ret.customer_portal_access')
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

async function logRetailPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('ret.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/ret/portal - List retail portal access configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = RetailPortalQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('ret.customer_portal_access`)
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

    if (query.loyalty_level) {
      supabaseQuery = supabaseQuery.eq('retail_settings->loyalty_program->member_level', query.loyalty_level);
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
        { error: 'Failed to fetch retail portal access configurations' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    const { data: allAccess } = await supabase
      .from('ret.customer_portal_access')
      .select('access_type, is_active, last_login_at, retail_settings')
      .eq('organization_id', organizationId);

    const summary = {
      total_portal_access: count || 0,
      active_access: allAccess?.filter(p => p.is_active).length || 0,
      vip_customers: allAccess?.filter(p => p.access_type === 'vip_customer').length || 0,
      business_accounts: allAccess?.filter(p => p.access_type === 'business_account').length || 0,
      
      by_access_type: allAccess?.reduce((acc, access) => {
        acc[access.access_type] = (acc[access.access_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_loyalty_level: allAccess?.reduce((acc, access) => {
        const level = access.retail_settings?.loyalty_program?.member_level || 'bronze';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      total_loyalty_points: allAccess?.reduce((sum, access) => {
        return sum + (access.retail_settings?.loyalty_program?.points_balance || 0);
      }, 0) || 0,
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
    console.error('GET /api/v1/ret/portal error:', error);
    
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

// POST /api/v1/ret/portal - Create retail portal access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessData = RetailPortalAccessSchema.parse(body);

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
      .from('ret.customers')
      .select('id, first_name, last_name, email, company_name')
      .eq('id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Retail customer not found or access denied' },
        { status: 404 }
      );
    }

    // Check for existing portal access
    const { data: existingAccess } = await supabase
      .from('ret.customer_portal_access')
      .select('id')
      .eq('customer_id', accessData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'Retail portal access already exists for this customer' },
        { status: 409 }
      );
    }

    const accessToken = generatePortalToken();
    const portalUrl = '${process.env.NEXT_PUBLIC_APP_URL}/ret/portal/${accessToken}';

    // Create retail portal access
    const { data: portalAccess, error } = await supabase
      .from('ret.customer_portal_access')
      .insert({
        customer_id: accessData.customer_id,
        access_token: accessToken,
        access_type: accessData.access_type,
        permissions: accessData.permissions,
        branding: accessData.branding,
        retail_settings: accessData.retail_settings,
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
        { error: 'Failed to create retail portal access' },
        { status: 500 }
      );
    }

    await logRetailPortalActivity(
      portalAccess.id,
      'retail_portal_access_created`,
      `Retail portal access created for: ${customer.company_name || '${customer.first_name} ${customer.last_name}'}',
      {
        customer_id: customer.id,
        access_type: accessData.access_type,
        store_categories: accessData.retail_settings?.store_categories,
        loyalty_level: accessData.retail_settings?.loyalty_program?.member_level,
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
      message: 'Retail portal access created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/ret/portal error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid retail portal access data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}