/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for billing management
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export interface WebhookHandlerConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  debugMode?: boolean;
}

export class StripeWebhookHandler {
  private stripe: Stripe;
  private supabase;
  private webhookSecret: string;
  private debugMode: boolean;

  constructor(config: WebhookHandlerConfig) {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-09-30.acacia', // Latest stable API version (Stripe Node SDK v17)
      typescript: true, // Enable TypeScript support
      maxNetworkRetries: 3,
      timeout: 30000,
    });

    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    this.webhookSecret = config.stripeWebhookSecret;
    this.debugMode = config.debugMode || false;
  }

  /**
   * Process webhook event from Stripe
   */
  async processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      if (this.debugMode) {
        console.log('[StripeWebhook] Processing event:', event.type, event.id);
      }

      // Log webhook event
      await this.logWebhookEvent(event);

      // Process event based on type
      await this.handleEvent(event);

      return { success: true };
    } catch (error) {
      console.error('[StripeWebhook] Error processing webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Log webhook event to database
   */
  private async logWebhookEvent(event: Stripe.Event): Promise<void> {
    const { error } = await this.supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        api_version: event.api_version,
        event_data: event.data,
        object_id: event.data.object.id,
        object_type: event.data.object.object,
        processed: false,
        processing_attempts: 0,
      });

    if (error) {
      console.error('[StripeWebhook] Failed to log webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle different webhook event types
   */
  private async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.created':
        await this.handleCustomerCreated(event);
        break;

      case 'customer.updated':
        await this.handleCustomerUpdated(event);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;

      case 'invoice.created':
        await this.handleInvoiceCreated(event);
        break;

      case 'invoice.finalized':
        await this.handleInvoiceFinalized(event);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event);
        break;

      case 'setup_intent.succeeded':
        await this.handleSetupIntentSucceeded(event);
        break;

      default:
        if (this.debugMode) {
          console.log('[StripeWebhook] Unhandled event type:', event.type);
        }
        break;
    }

    // Mark event as processed
    await this.markEventProcessed(event.id);
  }

  /**
   * Handle customer created
   */
  private async handleCustomerCreated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;

    // Find organization by email or metadata
    const organizationId = customer.metadata?.organization_id;
    if (!organizationId) {
      console.warn('[StripeWebhook] No organization_id in customer metadata');
      return;
    }

    const { error } = await this.supabase
      .from('stripe_customers')
      .insert({
        organization_id: organizationId,
        stripe_customer_id: customer.id,
        email: customer.email,
        name: customer.name,
        billing_address: customer.address,
        currency: customer.currency,
        balance: customer.balance,
        delinquent: customer.delinquent,
        metadata: customer.metadata,
      });

    if (error) {
      console.error('[StripeWebhook] Failed to create customer record:', error);
      throw error;
    }
  }

  /**
   * Handle customer updated
   */
  private async handleCustomerUpdated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;

    const { error } = await this.supabase
      .from('stripe_customers')
      .update({
        email: customer.email,
        name: customer.name,
        billing_address: customer.address,
        currency: customer.currency,
        balance: customer.balance,
        delinquent: customer.delinquent,
        metadata: customer.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customer.id);

    if (error) {
      console.error('[StripeWebhook] Failed to update customer record:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    // Get organization from customer
    const { data: customerData } = await this.supabase
      .from('stripe_customers')
      .select('organization_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!customerData) {
      console.warn('[StripeWebhook] Customer not found for subscription');
      return;
    }

    // Get plan from Stripe price ID
    const priceId = subscription.items.data[0]?.price.id;
    const { data: planData } = await this.supabase
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', priceId)
      .single();

    if (!planData) {
      console.warn('[StripeWebhook] Plan not found for price ID:', priceId);
      return;
    }

    const { error } = await this.supabase
      .from('subscriptions')
      .insert({
        organization_id: customerData.organization_id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        plan_id: planData.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start 
          ? new Date(subscription.trial_start * 1000).toISOString() 
          : null,
        trial_end: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
        cancel_at: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : null,
        canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        collection_method: subscription.collection_method,
        default_payment_method: subscription.default_payment_method as string,
        metadata: subscription.metadata,
      });

    if (error) {
      console.error('[StripeWebhook] Failed to create subscription record:', error);
      throw error;
    }

    // Update organization subscription status
    await this.updateOrganizationSubscription(
      customerData.organization_id,
      subscription.status
    );
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await this.supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start 
          ? new Date(subscription.trial_start * 1000).toISOString() 
          : null,
        trial_end: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
        cancel_at: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : null,
        canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        collection_method: subscription.collection_method,
        default_payment_method: subscription.default_payment_method as string,
        metadata: subscription.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('[StripeWebhook] Failed to update subscription record:', error);
      throw error;
    }

    // Get organization ID and update status
    const { data: subData } = await this.supabase
      .from('subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subData) {
      await this.updateOrganizationSubscription(
        subData.organization_id,
        subscription.status
      );
    }
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    // Get organization ID before updating
    const { data: subData } = await this.supabase
      .from('subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    const { error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('[StripeWebhook] Failed to update canceled subscription:', error);
      throw error;
    }

    if (subData) {
      await this.updateOrganizationSubscription(subData.organization_id, 'canceled');
    }
  }

  /**
   * Handle invoice created
   */
  private async handleInvoiceCreated(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    await this.upsertInvoice(invoice);
  }

  /**
   * Handle invoice finalized
   */
  private async handleInvoiceFinalized(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    await this.upsertInvoice(invoice);
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    await this.upsertInvoice(invoice);
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    await this.upsertInvoice(invoice);

    // TODO: Send notification about failed payment
    console.warn('[StripeWebhook] Invoice payment failed:', invoice.id);
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await this.upsertPayment(paymentIntent);
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await this.upsertPayment(paymentIntent);
  }

  /**
   * Handle setup intent succeeded (for saving payment methods)
   */
  private async handleSetupIntentSucceeded(event: Stripe.Event): Promise<void> {
    const setupIntent = event.data.object as Stripe.SetupIntent;
    
    if (setupIntent.payment_method) {
      // TODO: Update payment method record if needed
      console.log('[StripeWebhook] Setup intent succeeded for payment method:', setupIntent.payment_method);
    }
  }

  /**
   * Upsert invoice record
   */
  private async upsertInvoice(invoice: Stripe.Invoice): Promise<void> {
    // Get organization from customer
    const { data: customerData } = await this.supabase
      .from('stripe_customers')
      .select('organization_id')
      .eq('stripe_customer_id', invoice.customer as string)
      .single();

    if (!customerData) {
      console.warn('[StripeWebhook] Customer not found for invoice');
      return;
    }

    // Get subscription ID if available
    let subscriptionId = null;
    if (invoice.subscription) {
      const { data: subData } = await this.supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', invoice.subscription as string)
        .single();
      subscriptionId = subData?.id;
    }

    const { error } = await this.supabase
      .from('invoices')
      .upsert({
        stripe_invoice_id: invoice.id,
        organization_id: customerData.organization_id,
        stripe_customer_id: invoice.customer as string,
        subscription_id: subscriptionId,
        invoice_number: invoice.number,
        status: invoice.status,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        amount_remaining: invoice.amount_remaining,
        subtotal: invoice.subtotal,
        tax: invoice.tax || 0,
        total: invoice.total,
        currency: invoice.currency,
        period_start: invoice.period_start 
          ? new Date(invoice.period_start * 1000).toISOString() 
          : null,
        period_end: invoice.period_end 
          ? new Date(invoice.period_end * 1000).toISOString() 
          : null,
        due_date: invoice.due_date 
          ? new Date(invoice.due_date * 1000).toISOString() 
          : null,
        finalized_at: invoice.status_transitions?.finalized_at 
          ? new Date(invoice.status_transitions.finalized_at * 1000).toISOString() 
          : null,
        paid_at: invoice.status_transitions?.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
          : null,
        voided_at: invoice.status_transitions?.voided_at 
          ? new Date(invoice.status_transitions.voided_at * 1000).toISOString() 
          : null,
        payment_intent_id: invoice.payment_intent as string,
        collection_method: invoice.collection_method,
        billing_reason: invoice.billing_reason,
        line_items: invoice.lines?.data || [],
        metadata: invoice.metadata,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'stripe_invoice_id' 
      });

    if (error) {
      console.error('[StripeWebhook] Failed to upsert invoice:', error);
      throw error;
    }
  }

  /**
   * Upsert payment record
   */
  private async upsertPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Get organization from customer
    const { data: customerData } = await this.supabase
      .from('stripe_customers')
      .select('organization_id')
      .eq('stripe_customer_id', paymentIntent.customer as string)
      .single();

    if (!customerData) {
      console.warn('[StripeWebhook] Customer not found for payment intent');
      return;
    }

    // Get invoice ID if available
    let invoiceId = null;
    if (paymentIntent.invoice) {
      const { data: invoiceData } = await this.supabase
        .from('invoices')
        .select('id')
        .eq('stripe_invoice_id', paymentIntent.invoice as string)
        .single();
      invoiceId = invoiceData?.id;
    }

    const { error } = await this.supabase
      .from('payments')
      .upsert({
        stripe_payment_intent_id: paymentIntent.id,
        organization_id: customerData.organization_id,
        stripe_customer_id: paymentIntent.customer as string,
        invoice_id: invoiceId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method_id: paymentIntent.payment_method as string,
        receipt_email: paymentIntent.receipt_email,
        description: paymentIntent.description,
        failure_code: paymentIntent.last_payment_error?.code,
        failure_message: paymentIntent.last_payment_error?.message,
        metadata: paymentIntent.metadata,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'stripe_payment_intent_id' 
      });

    if (error) {
      console.error('[StripeWebhook] Failed to upsert payment:', error);
      throw error;
    }
  }

  /**
   * Update organization subscription status
   */
  private async updateOrganizationSubscription(
    organizationId: string,
    status: string
  ): Promise<void> {
    const subscriptionStatus = this.mapStripeStatusToOrg(status);

    const { error } = await this.supabase
      .from('organizations')
      .update({
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (error) {
      console.error('[StripeWebhook] Failed to update organization subscription status:', error);
      throw error;
    }
  }

  /**
   * Map Stripe subscription status to organization status
   */
  private mapStripeStatusToOrg(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'trialing': 'trialing',
      'canceled': 'canceled',
      'incomplete': 'canceled',
      'incomplete_expired': 'canceled',
      'past_due': 'past_due',
      'unpaid': 'past_due',
    };

    return statusMap[stripeStatus] || 'canceled';
  }

  /**
   * Mark webhook event as processed
   */
  private async markEventProcessed(eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from('stripe_webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', eventId);

    if (error) {
      console.error('[StripeWebhook] Failed to mark event as processed:', error);
    }
  }
}