/**
 * Subscription Management API
 * Comprehensive subscription system for recurring billing across all Thorbis verticals
 * 
 * Security: PCI DSS compliant, customer authentication, RLS enforced
 * Features: Flexible billing cycles, prorations, trial periods, usage-based billing
 * Integrations: Stripe Subscriptions, Treasury, Connect
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schemas
const CreateSubscriptionSchema = z.object({
  organization_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  subscription_plan_id: z.string().uuid(),
  payment_method_id: z.string().uuid(),
  billing_details: z.object({
    billing_cycle: z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']),
    billing_anchor: z.string().optional(),
    proration_behavior: z.enum(['create_prorations', 'none', 'always_invoice']).default('create_prorations'),
    collection_method: z.enum(['charge_automatically', 'send_invoice']).default('charge_automatically'),
    days_until_due: z.number().int().min(1).max(180).default(30)
  }),
  trial_details: z.object({
    trial_period_days: z.number().int().min(0).max(365).optional(),
    trial_end: z.string().optional()
  }).optional(),
  pricing_details: z.object({
    base_amount_cents: z.number().int().min(0),
    currency: z.string().length(3).default('USD'),
    usage_based: z.boolean().default(false),
    usage_pricing: z.array(z.object({
      tier_start: z.number().int().min(0),
      tier_end: z.number().int().optional(),
      unit_price_cents: z.number().int().min(0),
      unit_type: z.string()
    })).optional()
  }),
  service_details: z.object({
    service_type: z.string(),
    service_category: z.string(),
    service_frequency: z.string().optional(),
    service_location: z.object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    }),
    special_instructions: z.string().optional()
  }),
  contract_details: z.object({
    contract_term_months: z.number().int().min(1).max(120).optional(),
    auto_renewal: z.boolean().default(true),
    cancellation_policy: z.enum(['immediate', 'end_of_period', 'contract_end']).default('end_of_period'),
    early_termination_fee_cents: z.number().int().min(0).default(0)
  }),
  metadata: z.record(z.string()).optional()
});

const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'next_billing_date', 'amount_cents', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// GET /api/v1/subscriptions
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const paginationResult = PaginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order')
    });

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: paginationResult.error.format() },
        { status: 400 }
      );
    }

    const { page, limit, sort_by, sort_order } = paginationResult.data;
    const offset = (page - 1) * limit;

    // Additional filters
    const organizationId = searchParams.get('organization_id');
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const serviceType = searchParams.get('service_type');
    const billingCycle = searchParams.get('billing_cycle');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('customer_subscriptions')
      .select('
        id,
        organization_id,
        customer_id,
        subscription_plan_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        next_billing_date,
        billing_cycle,
        base_amount_cents,
        currency,
        trial_end,
        created_at,
        updated_at,
        canceled_at,
        organization:organizations(
          id,
          name,
          industry,
          business_type
        ),
        customer:customers(
          id,
          email,
          name,
          phone
        ),
        subscription_plan:subscription_plans(
          id,
          name,
          description,
          service_type,
          service_category
        )
      ', { count: 'exact' });

    // Apply filters
    if (organizationId) query = query.eq('organization_id', organizationId);
    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);
    if (serviceType) query = query.eq('subscription_plan.service_type', serviceType);
    if (billingCycle) query = query.eq('billing_cycle', billingCycle);
    if (search) {
      query = query.or('customer.name.ilike.%${search}%,customer.email.ilike.%${search}%,subscription_plan.name.ilike.%${search}%');
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Transform subscriptions for client consumption
    const transformedSubscriptions = subscriptions?.map(subscription => ({
      ...subscription,
      display_info: {
        formatted_amount: formatCurrency(subscription.base_amount_cents, subscription.currency),
        billing_cycle_display: formatBillingCycle(subscription.billing_cycle),
        status_display: formatStatus(subscription.status),
        service_name: subscription.subscription_plan?.name || 'Unknown Service',
        customer_name: subscription.customer?.name || 'Unknown Customer',
        next_billing_formatted: formatDate(subscription.next_billing_date),
        days_until_renewal: getDaysUntilRenewal(subscription.next_billing_date),
        is_trial: subscription.status === 'trialing',
        trial_days_remaining: subscription.trial_end ? 
          getDaysUntilRenewal(subscription.trial_end) : null
      }
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: transformedSubscriptions,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/subscriptions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = CreateSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization and customer exist
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, name, status')
      .eq('id', data.organization_id)
      .single();

    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, name, status')
      .eq('id', data.customer_id)
      .single();

    if (!organization || !customer) {
      return NextResponse.json(
        { error: 'Organization or customer not found' },
        { status: 404 }
      );
    }

    // Create subscription using database function
    const { data: subscriptionId, error } = await supabase.rpc(
      'create_customer_subscription',
      {
        p_organization_id: data.organization_id,
        p_customer_id: data.customer_id,
        p_subscription_plan_id: data.subscription_plan_id,
        p_payment_method_id: data.payment_method_id,
        p_billing_details: data.billing_details,
        p_trial_details: data.trial_details || {},
        p_pricing_details: data.pricing_details,
        p_service_details: data.service_details,
        p_contract_details: data.contract_details,
        p_metadata: data.metadata || {}
      }
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Fetch the complete subscription data
    const { data: subscription } = await supabase
      .from('customer_subscriptions')
      .select('
        id,
        organization_id,
        customer_id,
        subscription_plan_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        next_billing_date,
        billing_cycle,
        base_amount_cents,
        currency,
        trial_end,
        created_at,
        organization:organizations(id, name),
        customer:customers(id, email, name),
        subscription_plan:subscription_plans(id, name, description)
      ')
      .eq('id', subscriptionId)
      .single();

    return NextResponse.json({
      data: subscription,
      message: 'Subscription created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(cents / 100);
}

function formatBillingCycle(cycle: string): string {
  const cycles = {
    weekly: 'Weekly',
    bi_weekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semi_annual: 'Semi-annual',
    annual: 'Annual'
  };
  return cycles[cycle as keyof typeof cycles] || cycle;
}

function formatStatus(status: string): string {
  const statuses = {
    active: 'Active',
    trialing: 'In Trial',
    canceled: 'Canceled',
    paused: 'Paused',
    past_due: 'Past Due',
    incomplete: 'Incomplete'
  };
  return statuses[status as keyof typeof statuses] || status;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getDaysUntilRenewal(dateString: string): number {
  const renewalDate = new Date(dateString);
  const now = new Date();
  const diffTime = renewalDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}