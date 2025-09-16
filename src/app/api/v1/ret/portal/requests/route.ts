import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Retail order request schema for portal users
const RetailOrderRequestSchema = z.object({
  portal_access_token: z.string().min(32).max(64),
  
  // Order type and details
  order_type: z.enum(['purchase', 'quote_request', 'custom_order', 'bulk_order', 'layaway']).default('purchase'),
  order_source: z.enum(['online_portal', 'in_store_kiosk', 'mobile_app', 'phone_order']).default('online_portal'),
  
  // Items
  items: z.array(z.object({
    product_id: z.string().uuid().optional(),
    product_sku: z.string().optional(),
    product_name: z.string().min(1).max(255),
    brand: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
    style: z.string().optional(),
    variant_details: z.string().optional(), // JSON string of additional variant info
    unit_price: z.number().min(0).optional(),
    discounted_price: z.number().min(0).optional(),
    product_url: z.string().url().optional(),
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
    country: z.string().default('US'),
    delivery_instructions: z.string().optional(),
    is_business_address: z.boolean().default(false),
    requires_signature: z.boolean().default(false),
  }).default({}),
  
  shipping_method: z.enum(['standard', 'express', 'overnight', 'two_day', 'pickup', 'white_glove', 'freight']).default('standard'),
  preferred_delivery_date: z.string().date().optional(),
  preferred_delivery_time: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  
  // Payment preferences
  payment_method: z.enum([
    'credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 
    'store_credit', 'gift_card', 'layaway', 'financing', 'buy_now_pay_later'
  ]).optional(),
  use_store_credit: z.boolean().default(false),
  store_credit_amount: z.number().min(0).optional(),
  use_loyalty_points: z.boolean().default(false),
  loyalty_points_amount: z.number().min(0).optional(),
  payment_plan_requested: z.boolean().default(false),
  financing_term_months: z.number().min(3).max(60).optional(),
  
  // Discounts and promotions
  discount_codes: z.array(z.string()).optional(),
  employee_discount: z.boolean().default(false),
  student_discount: z.boolean().default(false),
  military_discount: z.boolean().default(false),
  senior_discount: z.boolean().default(false),
  price_match_request: z.object({
    competitor_name: z.string(),
    competitor_price: z.number().min(0),
    competitor_url: z.string().url().optional(),
    competitor_store_location: z.string().optional(),
    proof_image_url: z.string().url().optional(),
  }).optional(),
  
  // Special requirements and services
  special_requirements: z.object({
    gift_wrap: z.boolean().default(false),
    gift_wrap_style: z.enum(['standard', 'premium', 'holiday', 'birthday']).optional(),
    gift_message: z.string().max(500).optional(),
    gift_receipt: z.boolean().default(false),
    assembly_required: z.boolean().default(false),
    installation_requested: z.boolean().default(false),
    installation_type: z.enum(['basic', 'professional', 'white_glove']).optional(),
    eco_friendly_packaging: z.boolean().default(false),
    fragile_items: z.boolean().default(false),
    age_verification_required: z.boolean().default(false),
  }).optional(),
  
  // Customer preferences
  customer_preferences: z.object({
    email_receipts: z.boolean().default(true),
    sms_updates: z.boolean().default(false),
    marketing_emails: z.boolean().default(true),
    product_recommendations: z.boolean().default(true),
    save_payment_method: z.boolean().default(false),
    save_shipping_address: z.boolean().default(true),
  }).optional(),
  
  // Communication preferences
  order_updates_method: z.enum(['email', 'sms', 'phone', 'portal', 'push_notification']).default('email'),
  preferred_contact_time: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  
  // Order urgency and priority
  urgency: z.enum(['standard', 'rush', 'urgent', 'next_day']).default('standard'),
  is_gift: z.boolean().default(false),
  occasion: z.enum(['birthday', 'anniversary', 'holiday', 'graduation', 'wedding', 'other']).optional(),
  
  notes: z.string().max(1000).optional(),
});

const RetailRequestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  // Filters
  status: z.enum([
    'submitted', 'processing', 'payment_pending', 'confirmed', 'picking', 
    'packing', 'shipped', 'out_for_delivery', 'delivered', 'completed', 
    'cancelled', 'returned', 'refunded'
  ]).optional(),
  order_type: z.enum(['purchase', 'quote_request', 'custom_order', 'bulk_order', 'layaway']).optional(),
  urgency: z.enum(['standard', 'rush', 'urgent', 'next_day']).optional(),
  shipping_method: z.enum(['standard', 'express', 'overnight', 'two_day', 'pickup', 'white_glove', 'freight']).optional(),
  payment_method: z.enum([
    'credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 
    'store_credit', 'gift_card', 'layaway', 'financing', 'buy_now_pay_later'
  ]).optional(),
  
  // Product filters
  product_category: z.string().optional(),
  product_brand: z.string().optional(),
  
  // Date filters
  submitted_from: z.string().datetime().optional(),
  submitted_to: z.string().datetime().optional(),
  delivery_date_from: z.string().date().optional(),
  delivery_date_to: z.string().date().optional(),
  
  // Value filters
  min_order_value: z.number().min(0).optional(),
  max_order_value: z.number().min(0).optional(),
  
  // Special filters
  is_gift: z.boolean().optional(),
  needs_installation: z.boolean().optional(),
  price_match_request: z.boolean().optional(),
  loyalty_points_used: z.boolean().optional(),
  
  // Sorting
  sort: z.enum(['submitted_at', 'delivery_date', 'order_value', 'status', 'urgency']).default('submitted_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Include options
  include_customer_details: z.boolean().default(true),
  include_product_details: z.boolean().default(true),
  include_shipping_details: z.boolean().default(false),
});

// Helper function to validate retail portal access
async function validateRetailPortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('ret.customer_portal_access')
    .select('
      *,
      customer:customer_id(id, first_name, last_name, email, phone)
    ')
    .eq('access_token', accessToken)
    .eq('is_active', true)
    .single();

  if (!portalAccess) {
    return null;
  }

  // Check if access has expired
  if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
    return null;
  }

  // Check permissions
  if (!portalAccess.permissions?.can_place_orders) {
    return null;
  }

  return portalAccess;
}

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

// Helper function to calculate order totals
function calculateOrderTotals(items: unknown[], discounts: unknown = {}) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.discounted_price || item.unit_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const discountAmount = 0;
  // Apply various discounts (simplified calculation)
  if (discounts.employee_discount) discountAmount += subtotal * 0.15;
  if (discounts.student_discount) discountAmount += subtotal * 0.10;
  if (discounts.military_discount) discountAmount += subtotal * 0.10;
  if (discounts.senior_discount) discountAmount += subtotal * 0.05;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = 0.0875; // Example tax rate
  const taxAmount = discountedSubtotal * taxRate;
  const total = discountedSubtotal + taxAmount;

  return {
    subtotal,
    discount_amount: discountAmount,
    discounted_subtotal: discountedSubtotal,
    tax_amount: taxAmount,
    total,
  };
}

// Helper function to log retail portal activity
async function logRetailPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string
) {
  await supabase
    .from('ret.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
    });
}

// GET /api/v1/ret/portal/requests - List retail orders (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = RetailRequestQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user (admin/staff)
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
      .from('ret.portal_orders`)
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
        portal_access:portal_access_id(access_type),
        assigned_to_user:assigned_to(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.order_type) {
      supabaseQuery = supabaseQuery.eq('order_type', query.order_type);
    }
    
    if (query.urgency) {
      supabaseQuery = supabaseQuery.eq('urgency', query.urgency);
    }
    
    if (query.shipping_method) {
      supabaseQuery = supabaseQuery.eq('shipping_method', query.shipping_method);
    }
    
    if (query.payment_method) {
      supabaseQuery = supabaseQuery.eq('payment_method', query.payment_method);
    }

    // Product filters
    if (query.product_category) {
      supabaseQuery = supabaseQuery.contains('items', [{ category: query.product_category }]);
    }

    // Date filters
    if (query.submitted_from) {
      supabaseQuery = supabaseQuery.gte('submitted_at', query.submitted_from);
    }
    
    if (query.submitted_to) {
      supabaseQuery = supabaseQuery.lte('submitted_at', query.submitted_to);
    }
    
    if (query.delivery_date_from) {
      supabaseQuery = supabaseQuery.gte('preferred_delivery_date', query.delivery_date_from);
    }
    
    if (query.delivery_date_to) {
      supabaseQuery = supabaseQuery.lte('preferred_delivery_date', query.delivery_date_to);
    }

    // Value filters
    if (query.min_order_value) {
      supabaseQuery = supabaseQuery.gte('order_totals->total', query.min_order_value);
    }
    
    if (query.max_order_value) {
      supabaseQuery = supabaseQuery.lte('order_totals->total', query.max_order_value);
    }

    // Special filters
    if (query.is_gift !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_gift', query.is_gift);
    }
    
    if (query.needs_installation !== undefined) {
      supabaseQuery = supabaseQuery.eq('special_requirements->installation_requested', query.needs_installation);
    }
    
    if (query.price_match_request !== undefined) {
      if (query.price_match_request) {
        supabaseQuery = supabaseQuery.not('price_match_request', 'is', null);
      } else {
        supabaseQuery = supabaseQuery.is('price_match_request', null);
      }
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: orders, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch retail orders' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get order statistics
    const { data: allOrders } = await supabase
      .from('ret.portal_orders')
      .select('status, urgency, submitted_at, order_type, order_totals, is_gift, special_requirements')
      .eq('organization_id', organizationId);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const summary = {
      total_orders: count || 0,
      pending_orders: allOrders?.filter(o => o.status === 'submitted' || o.status === 'processing').length || 0,
      urgent_orders: allOrders?.filter(o => o.urgency === 'urgent' || o.urgency === 'next_day').length || 0,
      gift_orders: allOrders?.filter(o => o.is_gift).length || 0,
      installation_orders: allOrders?.filter(o => o.special_requirements?.installation_requested).length || 0,
      
      orders_last_24h: allOrders?.filter(o => 
        new Date(o.submitted_at) > twentyFourHoursAgo
      ).length || 0,
      orders_last_7d: allOrders?.filter(o => 
        new Date(o.submitted_at) > sevenDaysAgo
      ).length || 0,
      
      total_revenue: allOrders?.reduce((sum, order) => {
        return sum + (order.order_totals?.total || 0);
      }, 0) || 0,
      
      by_status: allOrders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_urgency: allOrders?.reduce((acc, order) => {
        acc[order.urgency] = (acc[order.urgency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_order_type: allOrders?.reduce((acc, order) => {
        acc[order.order_type] = (acc[order.order_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      orders: orders || [],
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
    console.error('GET /api/v1/ret/portal/requests error:', error);
    
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

// POST /api/v1/ret/portal/requests - Submit retail order (customer portal)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderData = RetailOrderRequestSchema.parse(body);

    // Validate portal access
    const portalAccess = await validateRetailPortalAccess(orderData.portal_access_token);
    if (!portalAccess) {
      return NextResponse.json(
        { error: 'Invalid or expired portal access' },
        { status: 401 }
      );
    }

    const customer = portalAccess.customer;
    const organizationId = portalAccess.organization_id;

    // Determine shipping location
    let shippingLocation = {};
    if (orderData.shipping_address?.is_primary_address) {
      // Use customer's primary address
      const { data: customerData } = await supabase
        .from('ret.customers')
        .select('address, city, state_province, postal_code, country')
        .eq('id', customer.id)
        .single();
        
      shippingLocation = {
        recipient_name: '${customer.first_name} ${customer.last_name}',
        address_line_1: customerData?.address,
        city: customerData?.city,
        state_province: customerData?.state_province,
        postal_code: customerData?.postal_code,
        country: customerData?.country || 'US',
        delivery_instructions: orderData.shipping_address?.delivery_instructions,
        is_business_address: orderData.shipping_address?.is_business_address,
        requires_signature: orderData.shipping_address?.requires_signature,
      };
    } else {
      shippingLocation = orderData.shipping_address;
    }

    // Calculate order totals
    const discounts = {
      employee_discount: orderData.employee_discount,
      student_discount: orderData.student_discount,
      military_discount: orderData.military_discount,
      senior_discount: orderData.senior_discount,
    };
    
    const orderTotals = calculateOrderTotals(orderData.items, discounts);

    // Generate order number
    const orderNumber = 'RO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}';

    // Determine initial status based on order type and payment method
    let initialStatus = 'submitted';
    if (orderData.order_type === 'quote_request') {
      initialStatus = 'quote_pending';
    } else if (orderData.payment_method === 'layaway') {
      initialStatus = 'layaway_pending';
    }

    // Create retail order
    const { data: order, error } = await supabase
      .from('ret.portal_orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        portal_access_id: portalAccess.id,
        order_type: orderData.order_type,
        order_source: orderData.order_source,
        items: orderData.items,
        shipping_address: shippingLocation,
        shipping_method: orderData.shipping_method,
        preferred_delivery_date: orderData.preferred_delivery_date,
        preferred_delivery_time: orderData.preferred_delivery_time,
        payment_method: orderData.payment_method,
        use_store_credit: orderData.use_store_credit,
        store_credit_amount: orderData.store_credit_amount,
        use_loyalty_points: orderData.use_loyalty_points,
        loyalty_points_amount: orderData.loyalty_points_amount,
        payment_plan_requested: orderData.payment_plan_requested,
        financing_term_months: orderData.financing_term_months,
        discount_codes: orderData.discount_codes,
        employee_discount: orderData.employee_discount,
        student_discount: orderData.student_discount,
        military_discount: orderData.military_discount,
        senior_discount: orderData.senior_discount,
        price_match_request: orderData.price_match_request,
        special_requirements: orderData.special_requirements,
        customer_preferences: orderData.customer_preferences,
        order_updates_method: orderData.order_updates_method,
        preferred_contact_time: orderData.preferred_contact_time,
        urgency: orderData.urgency,
        is_gift: orderData.is_gift,
        occasion: orderData.occasion,
        notes: orderData.notes,
        order_totals: orderTotals,
        status: initialStatus,
        submitted_at: new Date().toISOString(),
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit retail order' },
        { status: 500 }
      );
    }

    // Update customer loyalty points if used
    if (orderData.use_loyalty_points && orderData.loyalty_points_amount) {
      await supabase
        .from('ret.customer_portal_access')
        .update({
          'retail_settings.loyalty_program.points_balance': portalAccess.retail_settings?.loyalty_program?.points_balance - orderData.loyalty_points_amount
        })
        .eq('id', portalAccess.id);
    }

    // Update portal access last activity
    await supabase
      .from('ret.customer_portal_access')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', portalAccess.id);

    // Log portal activity
    await logRetailPortalActivity(
      portalAccess.id,
      'retail_order_submitted',
      'Retail order submitted: ${orderData.order_type} with ${orderData.items.length} items',
      {
        order_id: order.id,
        order_number: orderNumber,
        order_type: orderData.order_type,
        item_count: orderData.items.length,
        order_total: orderTotals.total,
        urgency: orderData.urgency,
        is_gift: orderData.is_gift,
        shipping_method: orderData.shipping_method,
      },
      organizationId
    );

    // Determine estimated processing time based on order type and urgency
    let estimatedProcessingTime = '1-2 business days';
    if (orderData.urgency === 'next_day') estimatedProcessingTime = '24 hours';
    else if (orderData.urgency === 'urgent') estimatedProcessingTime = '4-6 hours';
    else if (orderData.urgency === 'rush') estimatedProcessingTime = '8-12 hours';
    else if (orderData.order_type === 'custom_order') estimatedProcessingTime = '3-5 business days';
    else if (orderData.order_type === 'bulk_order') estimatedProcessingTime = '2-3 business days';

    return NextResponse.json({
      order: {
        ...order,
        customer: {
          id: customer.id,
          name: '${customer.first_name} ${customer.last_name}',
          email: customer.email,
        },
      },
      message: 'Retail order submitted successfully',
      order_number: orderNumber,
      estimated_processing_time: estimatedProcessingTime,
      next_steps: [
        'Your order has been received and assigned a tracking number',
        'Order will be processed within ${estimatedProcessingTime}',
        'You will receive an email confirmation with order details',
        orderData.payment_method === 'layaway' ? 'Layaway payment schedule will be provided separately' : 'Payment will be processed once order is confirmed',
        orderData.special_requirements?.installation_requested ? 'Installation will be scheduled after delivery' : ',
        orderData.is_gift ? 'Gift processing and wrapping will be applied as requested' : ',
        'You can track your order status through the customer portal',
      ].filter(Boolean),
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/ret/portal/requests error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid retail order data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}