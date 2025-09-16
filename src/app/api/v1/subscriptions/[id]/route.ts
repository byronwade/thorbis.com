/**
 * Individual Subscription Management API
 * Handle specific subscription operations (view, update, pause, resume, cancel)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const UpdateSubscriptionSchema = z.object({
  subscription_plan_id: z.string().uuid().optional(),
  payment_method_id: z.string().uuid().optional(),
  billing_details: z.object({
    billing_cycle: z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']).optional(),
    billing_anchor: z.string().optional(),
    proration_behavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
    collection_method: z.enum(['charge_automatically', 'send_invoice']).optional(),
    days_until_due: z.number().int().min(1).max(180).optional()
  }).optional(),
  service_details: z.object({
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
    }).optional(),
    special_instructions: z.string().optional()
  }).optional(),
  contract_details: z.object({
    auto_renewal: z.boolean().optional(),
    cancellation_policy: z.enum(['immediate', 'end_of_period', 'contract_end']).optional()
  }).optional(),
  metadata: z.record(z.string()).optional()
});

const SubscriptionActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'reactivate']),
  effective_date: z.string().optional(),
  reason: z.string().optional(),
  proration_behavior: z.enum(['create_prorations', 'none']).default('create_prorations'),
  cancel_at_period_end: z.boolean().default(true)
});

// GET /api/v1/subscriptions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch subscription with detailed information
    const { data: subscription, error } = await supabase
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
        billing_anchor,
        collection_method,
        days_until_due,
        base_amount_cents,
        currency,
        trial_start,
        trial_end,
        canceled_at,
        cancel_at_period_end,
        service_details,
        contract_details,
        metadata,
        created_at,
        updated_at,
        organization:organizations(
          id,
          name,
          industry,
          business_type,
          address,
          phone,
          email
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
          service_category,
          pricing_model,
          base_price_cents,
          trial_period_days
        ),
        payment_method:customer_payment_methods(
          id,
          type,
          card_brand,
          card_last4,
          ach_bank_name,
          ach_last4
        )
      ')
      .eq('id', subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...subscription,
        display_info: {
          formatted_amount: formatCurrency(subscription.base_amount_cents, subscription.currency),
          billing_cycle_display: formatBillingCycle(subscription.billing_cycle),
          status_display: formatSubscriptionStatus(subscription.status),
          next_billing_formatted: formatDate(subscription.next_billing_date),
          days_until_renewal: getDaysUntilDate(subscription.next_billing_date),
          is_trial: subscription.status === 'trialing',
          trial_days_remaining: subscription.trial_end ? 
            getDaysUntilDate(subscription.trial_end) : null,
          payment_method_display: getPaymentMethodDisplay(subscription.payment_method)
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

// PUT /api/v1/subscriptions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    const body = await request.json();
    const validationResult = UpdateSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Check if subscription exists and get current state
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('customer_subscriptions')
      .select('id, status, organization_id, customer_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (['canceled', 'incomplete'].includes(existingSubscription.status)) {
      return NextResponse.json(
        { error: 'Cannot update canceled or incomplete subscription' },
        { status: 400 }
      );
    }

    // Update subscription using database function
    const { error: updateError } = await supabase.rpc(
      'update_customer_subscription',
      {
        p_subscription_id: subscriptionId,
        p_subscription_plan_id: data.subscription_plan_id,
        p_payment_method_id: data.payment_method_id,
        p_billing_details: data.billing_details || {},
        p_service_details: data.service_details || {},
        p_contract_details: data.contract_details || {},
        p_metadata: data.metadata || {}
      }
    );

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Fetch updated subscription
    const { data: updatedSubscription } = await supabase
      .from('customer_subscriptions')
      .select('
        id,
        status,
        billing_cycle,
        base_amount_cents,
        currency,
        next_billing_date,
        updated_at,
        subscription_plan:subscription_plans(id, name),
        customer:customers(id, name, email)
      ')
      .eq('id', subscriptionId)
      .single();

    return NextResponse.json({
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/subscriptions/[id]/actions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    const body = await request.json();
    const validationResult = SubscriptionActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid action data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { action, effective_date, reason, proration_behavior, cancel_at_period_end } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Check if subscription exists
    const { data: subscription, error: fetchError } = await supabase
      .from('customer_subscriptions')
      .select('id, status, current_period_end')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Validate action against current status
    const validTransitions: Record<string, string[]> = {
      'active': ['pause', 'cancel'],
      'trialing': ['cancel'],
      'paused': ['resume', 'cancel'],
      'canceled': ['reactivate'],
      'past_due': ['resume', 'cancel']
    };

    if (!validTransitions[subscription.status]?.includes(action)) {
      return NextResponse.json(
        { error: 'Cannot ${action} subscription with status ${subscription.status}' },
        { status: 400 }
      );
    }

    // Execute subscription action using database function
    const { data: result, error: actionError } = await supabase.rpc(
      'execute_subscription_action',
      {
        p_subscription_id: subscriptionId,
        p_action: action,
        p_effective_date: effective_date || null,
        p_reason: reason || null,
        p_proration_behavior: proration_behavior,
        p_cancel_at_period_end: cancel_at_period_end
      }
    );

    if (actionError) {
      console.error('Database error:`, actionError);
      return NextResponse.json(
        { error: `Failed to ${action} subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result,
      message: 'Subscription ${action} completed successfully',
      action_details: {
        action_taken: action,
        effective_date: effective_date || 'immediate',
        reason: reason,
        cancel_at_period_end: cancel_at_period_end
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

function formatSubscriptionStatus(status: string): string {
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

function getDaysUntilDate(dateString: string): number {
  const targetDate = new Date(dateString);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getPaymentMethodDisplay(paymentMethod: unknown): string {
  if (!paymentMethod) return 'No payment method';
  
  if (paymentMethod.type === 'card') {
    return '${paymentMethod.card_brand?.toUpperCase()} ****${paymentMethod.card_last4}';
  } else if (paymentMethod.type === 'ach') {
    return '${paymentMethod.ach_bank_name} ****${paymentMethod.ach_last4}';
  }
  
  return paymentMethod.type.replace('_', ' ').toUpperCase();
}