/**
 * Subscription Plans Management API
 * Manages subscription plans across all Thorbis verticals
 * 
 * Security: Organization-level access, RLS enforced
 * Features: Industry-specific plans, flexible pricing models, usage-based billing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schemas
const CreateSubscriptionPlanSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  service_type: z.string().min(1),
  service_category: z.string().min(1),
  pricing_model: z.enum(['fixed', 'tiered', 'usage_based', 'per_unit']),
  base_price_cents: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
  billing_cycles_available: z.array(z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'])),
  trial_period_days: z.number().int().min(0).max(365).default(0),
  setup_fee_cents: z.number().int().min(0).default(0),
  features: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    included: z.boolean().default(true),
    limit_value: z.number().optional(),
    limit_unit: z.string().optional()
  })).optional(),
  contract_terms: z.object({
    minimum_term_months: z.number().int().min(1).default(1),
    cancellation_policy: z.enum(['immediate', 'end_of_period', 'contract_end']).default('end_of_period'),
    auto_renewal: z.boolean().default(true),
    early_termination_fee_cents: z.number().int().min(0).default(0)
  }),
  availability: z.object({
    is_active: z.boolean().default(true),
    is_public: z.boolean().default(true),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    max_subscribers: z.number().int().min(1).optional()
  }).optional(),
  metadata: z.record(z.string()).optional()
});

const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'name', 'base_price_cents', 'subscriber_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// GET /api/v1/subscription-plans
export async function GET(request: NextRequest) {
  try {
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
    const serviceType = searchParams.get('service_type');
    const serviceCategory = searchParams.get('service_category');
    const pricingModel = searchParams.get('pricing_model');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('subscription_plans')
      .select('
        id,
        organization_id,
        name,
        description,
        service_type,
        service_category,
        pricing_model,
        base_price_cents,
        currency,
        billing_cycles_available,
        trial_period_days,
        setup_fee_cents,
        features,
        contract_terms,
        availability,
        metadata,
        created_at,
        updated_at,
        organization:organizations(
          id,
          name,
          industry,
          business_type
        )
      ', { count: 'exact' });

    // Apply filters
    if (organizationId) query = query.eq('organization_id', organizationId);
    if (serviceType) query = query.eq('service_type', serviceType);
    if (serviceCategory) query = query.eq('service_category', serviceCategory);
    if (pricingModel) query = query.eq('pricing_model', pricingModel);
    if (search) {
      query = query.or('name.ilike.%${search}%,description.ilike.%${search}%,service_type.ilike.%${search}%');
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: plans, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Transform plans for client consumption
    const transformedPlans = plans?.map(plan => ({
      ...plan,
      display_info: {
        formatted_price: formatCurrency(plan.base_price_cents, plan.currency),
        has_trial: plan.trial_period_days > 0,
        trial_display: plan.trial_period_days > 0 ? '${plan.trial_period_days} day${plan.trial_period_days > 1 ? 's' : '} free' : null,
        setup_fee_display: plan.setup_fee_cents > 0 ? formatCurrency(plan.setup_fee_cents, plan.currency) : null,
        feature_count: plan.features?.length || 0,
        is_usage_based: plan.pricing_model === 'usage_based' || plan.pricing_model === 'tiered',
        billing_options: plan.billing_cycles_available.map((cycle: string) => ({
          cycle,
          display: formatBillingCycle(cycle),
          price: calculatePriceForCycle(plan.base_price_cents, cycle)
        }))
      }
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: transformedPlans,
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

// POST /api/v1/subscription-plans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = CreateSubscriptionPlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid subscription plan data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization exists
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, status')
      .eq('id', data.organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (organization.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot create plans for inactive organization' },
        { status: 400 }
      );
    }

    // Create subscription plan
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        organization_id: data.organization_id,
        name: data.name,
        description: data.description,
        service_type: data.service_type,
        service_category: data.service_category,
        pricing_model: data.pricing_model,
        base_price_cents: data.base_price_cents,
        currency: data.currency,
        billing_cycles_available: data.billing_cycles_available,
        trial_period_days: data.trial_period_days,
        setup_fee_cents: data.setup_fee_cents,
        features: data.features || [],
        contract_terms: data.contract_terms,
        availability: data.availability || {},
        metadata: data.metadata || {}
      })
      .select('
        id,
        organization_id,
        name,
        description,
        service_type,
        service_category,
        pricing_model,
        base_price_cents,
        currency,
        billing_cycles_available,
        trial_period_days,
        features,
        contract_terms,
        created_at,
        organization:organizations(id, name)
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: plan,
      message: 'Subscription plan created successfully'
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

function calculatePriceForCycle(basePriceCents: number, cycle: string): number {
  // This assumes base price is monthly - adjust multipliers as needed
  switch (cycle) {
    case 'weekly':
      return Math.round(basePriceCents / 4.33);
    case 'bi_weekly':
      return Math.round(basePriceCents / 2.17);
    case 'monthly':
      return basePriceCents;
    case 'quarterly':
      return Math.round(basePriceCents * 3);
    case 'semi_annual':
      return Math.round(basePriceCents * 6);
    case 'annual':
      return Math.round(basePriceCents * 12);
    default:
      return basePriceCents;
  }
}