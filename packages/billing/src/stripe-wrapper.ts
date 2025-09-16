/**
 * Thorbis Stripe Wrapper
 * Production-ready Stripe integration for $50/month + API usage billing
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export interface StripeWrapperConfig {
  stripeSecretKey: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  webhookSecret?: string;
  environment?: 'test' | 'live';
  debugMode?: boolean;
}

export interface CreateCustomerParams {
  organizationId: string;
  email: string;
  name: string;
  phone?: string;
  address?: Stripe.AddressParam;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  organizationId: string;
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface UsageReportParams {
  organizationId: string;
  meterName: string;
  quantity: number;
  timestamp?: Date;
  action?: 'increment' | 'set';
}

export interface BillingStatus {
  subscriptionStatus: string;
  currentPlan: string;
  billingCycleEnd: Date;
  monthlyApiUsage: number;
  apiQuota: number;
  overageCount: number;
  estimatedOverageCost: number;
}

export class ThorbisStripeWrapper {
  private stripe: Stripe;
  private supabase;
  private config: Required<StripeWrapperConfig>;

  constructor(config: StripeWrapperConfig) {
    this.config = {
      environment: 'test',
      debugMode: false,
      webhookSecret: '',
      ...config,
    };

    // Initialize Stripe with latest stable API version
    this.stripe = new Stripe(this.config.stripeSecretKey, {
      apiVersion: '2024-09-30.acacia',
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 30000,
      telemetry: false,
    });

    // Initialize Supabase client
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    if (this.config.debugMode) {
      console.log('[ThorbisStripe] Initialized with environment:', this.config.environment);
    }
  }

  // =============================================================================
  // CUSTOMER MANAGEMENT
  // =============================================================================

  /**
   * Create or retrieve Stripe customer for organization
   */
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists in our database
      const { data: existingCustomer } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', params.organizationId)
        .single();

      if (existingCustomer) {
        // Return existing customer
        return await this.stripe.customers.retrieve(existingCustomer.stripe_customer_id) as Stripe.Customer;
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        address: params.address,
        metadata: {
          organization_id: params.organizationId,
          environment: this.config.environment,
          ...params.metadata,
        },
      });

      // Save customer to our database
      await this.supabase
        .from('stripe_customers')
        .insert({
          organization_id: params.organizationId,
          stripe_customer_id: customer.id,
          email: customer.email,
          name: customer.name,
          billing_address: customer.address,
          currency: customer.currency,
          metadata: customer.metadata,
        });

      if (this.config.debugMode) {
        console.log('[ThorbisStripe] Created customer:', customer.id);
      }

      return customer;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(
    organizationId: string,
    updates: Partial<Stripe.CustomerUpdateParams>
  ): Promise<Stripe.Customer> {
    try {
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found');
      }

      const customer = await this.stripe.customers.update(
        customerData.stripe_customer_id,
        updates
      );

      // Update our database
      await this.supabase
        .from('stripe_customers')
        .update({
          email: customer.email,
          name: customer.name,
          billing_address: customer.address,
          metadata: customer.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId);

      return customer;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to update customer:', error);
      throw error;
    }
  }

  // =============================================================================
  // SUBSCRIPTION MANAGEMENT
  // =============================================================================

  /**
   * Create subscription for organization
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    try {
      // Get customer
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', params.organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found. Create customer first.');
      }

      // Get plan details
      const { data: planData } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', params.planId)
        .single();

      if (!planData) {
        throw new Error('Subscription plan not found');
      }

      // Create subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerData.stripe_customer_id,
        items: [{
          price: planData.stripe_price_id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          organization_id: params.organizationId,
          plan_id: params.planId,
          environment: this.config.environment,
          ...params.metadata,
        },
      };

      if (params.paymentMethodId) {
        subscriptionParams.default_payment_method = params.paymentMethodId;
      }

      if (params.trialDays) {
        subscriptionParams.trial_period_days = params.trialDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      // Save subscription to our database
      await this.supabase
        .from('subscriptions')
        .insert({
          organization_id: params.organizationId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerData.stripe_customer_id,
          plan_id: params.planId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_start: subscription.trial_start 
            ? new Date(subscription.trial_start * 1000).toISOString() 
            : null,
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : null,
          collection_method: subscription.collection_method,
          metadata: subscription.metadata,
        });

      if (this.config.debugMode) {
        console.log('[ThorbisStripe] Created subscription:', subscription.id);
      }

      return subscription;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    organizationId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const { data: subData } = await this.supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      if (!subData) {
        throw new Error('Active subscription not found');
      }

      const subscription = await this.stripe.subscriptions.update(
        subData.stripe_subscription_id,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
        }
      );

      // Update our database
      await this.supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      return subscription;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to cancel subscription:', error);
      throw error;
    }
  }

  // =============================================================================
  // PAYMENT METHODS
  // =============================================================================

  /**
   * Create setup intent for adding payment method
   */
  async createSetupIntent(organizationId: string): Promise<Stripe.SetupIntent> {
    try {
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found');
      }

      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerData.stripe_customer_id,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          organization_id: organizationId,
          environment: this.config.environment,
        },
      });

      return setupIntent;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to create setup intent:', error);
      throw error;
    }
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(organizationId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found');
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerData.stripe_customer_id,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to list payment methods:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    organizationId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    try {
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found');
      }

      const customer = await this.stripe.customers.update(
        customerData.stripe_customer_id,
        {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        }
      );

      return customer;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to set default payment method:', error);
      throw error;
    }
  }

  // =============================================================================
  // USAGE TRACKING & BILLING
  // =============================================================================

  /**
   * Report API usage for billing
   */
  async reportUsage(params: UsageReportParams): Promise<void> {
    try {
      // Update usage in our database
      await this.supabase.rpc('increment_api_usage', {
        p_organization_id: params.organizationId,
        p_meter_name: params.meterName,
        p_increment: params.quantity,
      });

      if (this.config.debugMode) {
        console.log('[ThorbisStripe] Reported usage:', params);
      }
    } catch (error) {
      console.error('[ThorbisStripe] Failed to report usage:', error);
      throw error;
    }
  }

  /**
   * Get billing status for organization
   */
  async getBillingStatus(organizationId: string): Promise<BillingStatus | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_billing_status', {
        p_organization_id: organizationId,
      });

      if (error) throw error;

      const status = data?.[0];
      if (!status) return null;

      return {
        subscriptionStatus: status.subscription_status,
        currentPlan: status.current_plan,
        billingCycleEnd: new Date(status.billing_cycle_end),
        monthlyApiUsage: status.monthly_api_usage,
        apiQuota: status.api_quota,
        overageCount: status.overage_count,
        estimatedOverageCost: status.estimated_overage_cost_cents / 100, // Convert to dollars
      };
    } catch (error) {
      console.error('[ThorbisStripe] Failed to get billing status:', error);
      throw error;
    }
  }

  /**
   * Calculate overage charges for current period
   */
  async calculateOverageCharges(organizationId: string): Promise<{
    totalOverage: number;
    totalCost: number;
    breakdown: Array<{
      meterName: string;
      usage: number;
      quota: number;
      overage: number;
      cost: number;
    }>;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_api_overage', {
        p_organization_id: organizationId,
        p_billing_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        p_billing_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      });

      if (error) throw error;

      let totalOverage = 0;
      let totalCost = 0;

      const breakdown = data.map((item: any) => {
        totalOverage += item.overage_count;
        totalCost += item.overage_cost_cents;

        return {
          meterName: item.meter_name,
          usage: item.total_usage,
          quota: item.quota_included,
          overage: item.overage_count,
          cost: item.overage_cost_cents / 100, // Convert to dollars
        };
      });

      return {
        totalOverage,
        totalCost: totalCost / 100, // Convert to dollars
        breakdown,
      };
    } catch (error) {
      console.error('[ThorbisStripe] Failed to calculate overage charges:', error);
      throw error;
    }
  }

  // =============================================================================
  // INVOICING
  // =============================================================================

  /**
   * Create invoice for usage charges
   */
  async createUsageInvoice(
    organizationId: string,
    description?: string
  ): Promise<Stripe.Invoice> {
    try {
      const { data: customerData } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      if (!customerData) {
        throw new Error('Customer not found');
      }

      // Calculate overage charges
      const overageData = await this.calculateOverageCharges(organizationId);

      if (overageData.totalCost === 0) {
        throw new Error('No overage charges to invoice');
      }

      // Create invoice items for each meter
      for (const item of overageData.breakdown) {
        if (item.overage > 0) {
          await this.stripe.invoiceItems.create({
            customer: customerData.stripe_customer_id,
            amount: Math.round(item.cost * 100), // Convert to cents
            currency: 'usd',
            description: `${item.meterName} overage: ${item.overage} units`,
            metadata: {
              organization_id: organizationId,
              meter_name: item.meterName,
              overage_count: item.overage.toString(),
              environment: this.config.environment,
            },
          });
        }
      }

      // Create invoice
      const invoice = await this.stripe.invoices.create({
        customer: customerData.stripe_customer_id,
        description: description || `Usage charges for ${new Date().toLocaleDateString()}`,
        collection_method: 'charge_automatically',
        auto_advance: true,
        metadata: {
          organization_id: organizationId,
          invoice_type: 'usage_charges',
          environment: this.config.environment,
        },
      });

      // Finalize invoice
      await this.stripe.invoices.finalizeInvoice(invoice.id);

      if (this.config.debugMode) {
        console.log('[ThorbisStripe] Created usage invoice:', invoice.id);
      }

      return invoice;
    } catch (error) {
      console.error('[ThorbisStripe] Failed to create usage invoice:', error);
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if organization has active subscription
   */
  async hasActiveSubscription(organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('status')
        .eq('organization_id', organizationId)
        .in('status', ['active', 'trialing'])
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(industry?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (industry) {
        query = query.in('industry', [industry, 'all']);
      } else {
        query = query.eq('industry', 'all');
      }

      const { data, error } = await query.order('amount', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ThorbisStripe] Failed to get subscription plans:', error);
      throw error;
    }
  }

  /**
   * Format amount in dollars
   */
  formatAmount(cents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  /**
   * Get Stripe instance (for advanced usage)
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

// Export default configuration for easy setup
export const createThorbisStripe = (config: Partial<StripeWrapperConfig> = {}) => {
  const defaultConfig: StripeWrapperConfig = {
    stripeSecretKey: '***REMOVED***',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    environment: 'test',
    debugMode: process.env.NODE_ENV === 'development',
    ...config,
  };

  return new ThorbisStripeWrapper(defaultConfig);
};