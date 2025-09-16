/**
 * Individual Subscription Plan Management API
 * Handle specific subscription plan operations (view, update, delete, archive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const UpdateSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  base_price_cents: z.number().int().min(0).optional(),
  billing_cycles_available: z.array(z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'])).optional(),
  trial_period_days: z.number().int().min(0).max(365).optional(),
  setup_fee_cents: z.number().int().min(0).optional(),
  features: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    included: z.boolean().default(true),
    limit_value: z.number().optional(),
    limit_unit: z.string().optional()
  })).optional(),
  contract_terms: z.object({
    minimum_term_months: z.number().int().min(1).optional(),
    cancellation_policy: z.enum(['immediate', 'end_of_period', 'contract_end']).optional(),
    auto_renewal: z.boolean().optional(),
    early_termination_fee_cents: z.number().int().min(0).optional()
  }).optional(),
  availability: z.object({
    is_active: z.boolean().optional(),
    is_public: z.boolean().optional(),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    max_subscribers: z.number().int().min(1).optional()
  }).optional(),
  metadata: z.record(z.string()).optional()
});

// GET /api/v1/subscription-plans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch subscription plan with detailed information
    const { data: plan, error } = await supabase
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
          business_type,
          status
        )
      ')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...plan,
        display_info: {
          formatted_price: formatCurrency(plan.base_price_cents, plan.currency),
          price_breakdown: plan.billing_cycles_available.map((cycle: string) => ({
            cycle,
            display: formatBillingCycle(cycle),
            price_cents: calculatePriceForCycle(plan.base_price_cents, cycle),
            formatted_price: formatCurrency(calculatePriceForCycle(plan.base_price_cents, cycle), plan.currency)
          })),
          has_trial: plan.trial_period_days > 0,
          trial_display: plan.trial_period_days > 0 ? '${plan.trial_period_days} day${plan.trial_period_days > 1 ? 's' : '} free' : null,
          setup_fee_display: plan.setup_fee_cents > 0 ? formatCurrency(plan.setup_fee_cents, plan.currency) : 'No setup fee',
          feature_count: plan.features?.length || 0,
          is_usage_based: plan.pricing_model === 'usage_based' || plan.pricing_model === 'tiered',
          availability_status: getAvailabilityStatus(plan.availability),
          service_display: '${plan.service_category} - ${plan.service_type}'.toLowerCase()
        }
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

// PUT /api/v1/subscription-plans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    const body = await request.json();
    const validationResult = UpdateSubscriptionPlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid plan data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Check if plan exists
    const { data: existingPlan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('id, organization_id, availability')
      .eq('id', planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check for active subscriptions if making significant changes
    if (data.base_price_cents || data.billing_cycles_available) {
      const { data: activeSubscriptions } = await supabase
        .from('customer_subscriptions')
        .select('id')
        .eq('subscription_plan_id', planId)
        .eq('status', 'active');

      if (activeSubscriptions && activeSubscriptions.length > 0 && data.base_price_cents) {
        return NextResponse.json(
          { 
            error: 'Cannot change pricing for plans with active subscriptions',
            active_subscriptions: activeSubscriptions.length,
            suggestion: 'Create a new plan version instead'
          },
          { status: 400 }
        );
      }
    }

    // Update plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update({
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.base_price_cents && { base_price_cents: data.base_price_cents }),
        ...(data.billing_cycles_available && { billing_cycles_available: data.billing_cycles_available }),
        ...(data.trial_period_days !== undefined && { trial_period_days: data.trial_period_days }),
        ...(data.setup_fee_cents !== undefined && { setup_fee_cents: data.setup_fee_cents }),
        ...(data.features && { features: data.features }),
        ...(data.contract_terms && { contract_terms: data.contract_terms }),
        ...(data.availability && { availability: data.availability }),
        ...(data.metadata && { metadata: data.metadata }),
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select('
        id,
        name,
        description,
        base_price_cents,
        currency,
        billing_cycles_available,
        trial_period_days,
        features,
        updated_at,
        organization:organizations(id, name)
      ')
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedPlan,
      message: 'Subscription plan updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/subscription-plans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    const supabase = createRouteHandlerClient({ cookies });

    // Check if plan exists
    const { data: plan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .eq('id', planId)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check for active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('customer_subscriptions')
      .select('id, customer_id')
      .eq('subscription_plan_id', planId)
      .in('status', ['active', 'trialing', 'paused']);

    if (activeSubscriptions && activeSubscriptions.length > 0 && !forceDelete) {
      return NextResponse.json(
        { 
          error: 'Cannot delete plan with active subscriptions',
          active_subscriptions: activeSubscriptions.length,
          affected_customers: activeSubscriptions.map(sub => sub.customer_id),
          suggestion: 'Archive the plan instead or use force=true to delete'
        },
        { status: 400 }
      );
    }

    // Archive the plan (soft delete)
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .update({ 
        availability: { 
          is_active: false, 
          is_public: false,
          archived_at: new Date().toISOString(),
          archived_reason: forceDelete ? 'Force deleted' : 'Archived'
        }
      })
      .eq('id', planId);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to archive subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Subscription plan archived successfully',
      plan_id: planId,
      plan_name: plan.name,
      action: 'archived',
      affected_subscriptions: activeSubscriptions?.length || 0
    });

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

function getAvailabilityStatus(availability: unknown): string {
  if (!availability) return 'active';
  
  if (!availability.is_active) return 'inactive';
  if (!availability.is_public) return 'private';
  
  const now = new Date();
  if (availability.available_from && new Date(availability.available_from) > now) return 'scheduled';
  if (availability.available_until && new Date(availability.available_until) < now) return 'expired';
  
  return 'active';
}