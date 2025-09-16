/**
 * Thorbis Stripe Wrapper Usage Examples
 * Comprehensive examples showing how to use the Stripe wrapper
 */

import { ThorbisStripeWrapper, createThorbisStripe } from '../stripe-wrapper';

// =============================================================================
// INITIALIZATION EXAMPLES
// =============================================================================

// Option 1: Use default configuration with environment variables
const stripe = createThorbisStripe();

// Option 2: Custom configuration
const stripeCustom = new ThorbisStripeWrapper({
  stripeSecretKey: '***REMOVED***',
  supabaseUrl: 'your-supabase-url',
  supabaseServiceRoleKey: 'your-service-role-key',
  environment: 'test',
  debugMode: true,
});

// =============================================================================
// CUSTOMER MANAGEMENT EXAMPLES
// =============================================================================

async function createCustomerExample() {
  try {
    // Create a new customer for an organization
    const customer = await stripe.createCustomer({
      organizationId: 'hs-001-uuid-a1b2c3d4e5f6',
      email: 'billing@acmeplumbing.com',
      name: 'ACME Plumbing Services',
      phone: '+1-555-123-4567',
      address: {
        line1: '123 Main Street',
        city: 'Denver',
        state: 'CO',
        postal_code: '80202',
        country: 'US',
      },
      metadata: {
        industry: 'home_services',
        company_size: 'medium',
      },
    });

    console.log('Created customer:', customer.id);
    return customer;
  } catch (error) {
    console.error('Failed to create customer:', error);
  }
}

async function updateCustomerExample() {
  try {
    // Update customer information
    const customer = await stripe.updateCustomer(
      'hs-001-uuid-a1b2c3d4e5f6',
      {
        name: 'ACME Plumbing & Heating',
        address: {
          line1: '456 New Address',
          city: 'Denver',
          state: 'CO',
          postal_code: '80203',
          country: 'US',
        },
      }
    );

    console.log('Updated customer:', customer.id);
    return customer;
  } catch (error) {
    console.error('Failed to update customer:', error);
  }
}

// =============================================================================
// SUBSCRIPTION MANAGEMENT EXAMPLES
// =============================================================================

async function createSubscriptionExample() {
  try {
    // Create a subscription for the Professional plan
    const subscription = await stripe.createSubscription({
      organizationId: 'hs-001-uuid-a1b2c3d4e5f6',
      planId: 'plan-pro-monthly',
      trialDays: 14, // 14-day free trial
      metadata: {
        source: 'website_signup',
        referral_code: 'FRIEND20',
      },
    });

    console.log('Created subscription:', subscription.id);
    console.log('Subscription status:', subscription.status);
    
    // If subscription requires payment confirmation
    if (subscription.status === 'incomplete') {
      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent;
      
      if (paymentIntent) {
        console.log('Payment intent client secret:', paymentIntent.client_secret);
        // Use this client secret on the frontend to complete payment
      }
    }

    return subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
  }
}

async function cancelSubscriptionExample() {
  try {
    // Cancel subscription at the end of the current period
    const subscription = await stripe.cancelSubscription(
      'hs-001-uuid-a1b2c3d4e5f6',
      true // Cancel at period end
    );

    console.log('Canceled subscription:', subscription.id);
    console.log('Will cancel at:', new Date(subscription.current_period_end * 1000));
    return subscription;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
}

// =============================================================================
// PAYMENT METHODS EXAMPLES
// =============================================================================

async function setupPaymentMethodExample() {
  try {
    // Create setup intent for adding a payment method
    const setupIntent = await stripe.createSetupIntent('hs-001-uuid-a1b2c3d4e5f6');
    
    console.log('Setup intent client secret:', setupIntent.client_secret);
    // Use this client secret on the frontend with Stripe Elements
    
    return setupIntent;
  } catch (error) {
    console.error('Failed to create setup intent:', error);
  }
}

async function listPaymentMethodsExample() {
  try {
    // Get all payment methods for organization
    const paymentMethods = await stripe.listPaymentMethods('hs-001-uuid-a1b2c3d4e5f6');
    
    console.log('Payment methods:');
    paymentMethods.forEach((pm) => {
      console.log(`- ${pm.id}: **** **** **** ${pm.card?.last4} (${pm.card?.brand})`);
    });
    
    return paymentMethods;
  } catch (error) {
    console.error('Failed to list payment methods:', error);
  }
}

async function setDefaultPaymentMethodExample() {
  try {
    // Set a payment method as default
    const customer = await stripe.setDefaultPaymentMethod(
      'hs-001-uuid-a1b2c3d4e5f6',
      'pm_1234567890' // Payment method ID
    );
    
    console.log('Updated default payment method for customer:', customer.id);
    return customer;
  } catch (error) {
    console.error('Failed to set default payment method:', error);
  }
}

// =============================================================================
// USAGE TRACKING & BILLING EXAMPLES
// =============================================================================

async function reportApiUsageExample() {
  try {
    // Report API usage for billing
    await stripe.reportUsage({
      organizationId: 'hs-001-uuid-a1b2c3d4e5f6',
      meterName: 'api_calls',
      quantity: 50, // 50 API calls
    });

    // Report data export usage
    await stripe.reportUsage({
      organizationId: 'hs-001-uuid-a1b2c3d4e5f6',
      meterName: 'data_exports',
      quantity: 3, // 3 data exports
    });

    console.log('Reported usage successfully');
  } catch (error) {
    console.error('Failed to report usage:', error);
  }
}

async function getBillingStatusExample() {
  try {
    // Get current billing status
    const status = await stripe.getBillingStatus('hs-001-uuid-a1b2c3d4e5f6');
    
    if (status) {
      console.log('Billing Status:');
      console.log(`- Plan: ${status.currentPlan}`);
      console.log(`- Status: ${status.subscriptionStatus}`);
      console.log(`- API Usage: ${status.monthlyApiUsage} / ${status.apiQuota}`);
      console.log(`- Overage: ${status.overageCount} calls`);
      console.log(`- Estimated Overage Cost: $${status.estimatedOverageCost.toFixed(2)}`);
      console.log(`- Next Billing: ${status.billingCycleEnd.toDateString()}`);
    }
    
    return status;
  } catch (error) {
    console.error('Failed to get billing status:', error);
  }
}

async function calculateOverageExample() {
  try {
    // Calculate current overage charges
    const overage = await stripe.calculateOverageCharges('hs-001-uuid-a1b2c3d4e5f6');
    
    console.log('Overage Charges:');
    console.log(`- Total Overage: ${overage.totalOverage} units`);
    console.log(`- Total Cost: $${overage.totalCost.toFixed(2)}`);
    
    console.log('Breakdown:');
    overage.breakdown.forEach((item) => {
      console.log(`  ${item.meterName}:`);
      console.log(`    Usage: ${item.usage} / ${item.quota}`);
      console.log(`    Overage: ${item.overage} units`);
      console.log(`    Cost: $${item.cost.toFixed(2)}`);
    });
    
    return overage;
  } catch (error) {
    console.error('Failed to calculate overage charges:', error);
  }
}

// =============================================================================
// INVOICING EXAMPLES
// =============================================================================

async function createUsageInvoiceExample() {
  try {
    // Create invoice for overage charges
    const invoice = await stripe.createUsageInvoice(
      'hs-001-uuid-a1b2c3d4e5f6',
      'Monthly API usage overage charges'
    );
    
    console.log('Created usage invoice:', invoice.id);
    console.log('Invoice status:', invoice.status);
    console.log('Amount due:', stripe.formatAmount(invoice.amount_due));
    
    return invoice;
  } catch (error) {
    console.error('Failed to create usage invoice:', error);
  }
}

// =============================================================================
// UTILITY EXAMPLES
// =============================================================================

async function checkSubscriptionStatusExample() {
  try {
    // Check if organization has active subscription
    const hasActive = await stripe.hasActiveSubscription('hs-001-uuid-a1b2c3d4e5f6');
    
    console.log('Has active subscription:', hasActive);
    
    if (!hasActive) {
      console.log('Organization needs to subscribe to continue using the service');
    }
    
    return hasActive;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
  }
}

async function getAvailablePlansExample() {
  try {
    // Get all available plans
    const allPlans = await stripe.getSubscriptionPlans();
    console.log('All plans:', allPlans.length);
    
    // Get plans for specific industry
    const hsPlans = await stripe.getSubscriptionPlans('hs');
    console.log('Home services plans:', hsPlans.length);
    
    hsPlans.forEach((plan) => {
      console.log(`- ${plan.name}: ${stripe.formatAmount(plan.amount)} / ${plan.billing_interval}`);
      console.log(`  API Quota: ${plan.api_quota} calls/month`);
    });
    
    return { allPlans, hsPlans };
  } catch (error) {
    console.error('Failed to get subscription plans:', error);
  }
}

// =============================================================================
// COMPLETE WORKFLOW EXAMPLE
// =============================================================================

async function completeOnboardingWorkflow() {
  try {
    console.log('🚀 Starting complete onboarding workflow...\n');
    
    const organizationId = 'hs-new-uuid-' + Date.now();
    
    // Step 1: Create customer
    console.log('📝 Step 1: Creating customer...');
    const customer = await stripe.createCustomer({
      organizationId,
      email: 'owner@newbusiness.com',
      name: 'New Business LLC',
      address: {
        line1: '789 Business Ave',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        country: 'US',
      },
    });
    console.log(`✅ Customer created: ${customer.id}\n`);
    
    // Step 2: Create setup intent for payment method
    console.log('💳 Step 2: Creating setup intent for payment...');
    const setupIntent = await stripe.createSetupIntent(organizationId);
    console.log(`✅ Setup intent created: ${setupIntent.client_secret}\n`);
    
    // Step 3: Create subscription (would normally wait for payment method)
    console.log('📊 Step 3: Creating subscription...');
    const subscription = await stripe.createSubscription({
      organizationId,
      planId: 'plan-basic-monthly',
      trialDays: 14,
      metadata: {
        source: 'api_example',
      },
    });
    console.log(`✅ Subscription created: ${subscription.id}\n`);
    
    // Step 4: Simulate API usage
    console.log('📈 Step 4: Simulating API usage...');
    await stripe.reportUsage({
      organizationId,
      meterName: 'api_calls',
      quantity: 1500, // Exceed basic quota of 1000
    });
    console.log('✅ Usage reported\n');
    
    // Step 5: Check billing status
    console.log('💰 Step 5: Checking billing status...');
    const status = await stripe.getBillingStatus(organizationId);
    if (status) {
      console.log(`✅ Current usage: ${status.monthlyApiUsage}/${status.apiQuota}`);
      console.log(`✅ Overage cost: $${status.estimatedOverageCost.toFixed(2)}\n`);
    }
    
    console.log('🎉 Onboarding workflow completed successfully!');
    
    return {
      customer,
      setupIntent,
      subscription,
      billingStatus: status,
    };
  } catch (error) {
    console.error('❌ Onboarding workflow failed:', error);
    throw error;
  }
}

// =============================================================================
// EXPORT EXAMPLES FOR USAGE
// =============================================================================

export const examples = {
  // Customer management
  createCustomerExample,
  updateCustomerExample,
  
  // Subscription management
  createSubscriptionExample,
  cancelSubscriptionExample,
  
  // Payment methods
  setupPaymentMethodExample,
  listPaymentMethodsExample,
  setDefaultPaymentMethodExample,
  
  // Usage tracking & billing
  reportApiUsageExample,
  getBillingStatusExample,
  calculateOverageExample,
  
  // Invoicing
  createUsageInvoiceExample,
  
  // Utilities
  checkSubscriptionStatusExample,
  getAvailablePlansExample,
  
  // Complete workflow
  completeOnboardingWorkflow,
};

// Example of running all examples (for testing)
export async function runAllExamples() {
  console.log('🧪 Running Stripe Wrapper Examples...\n');
  
  try {
    // Run examples in sequence
    await createCustomerExample();
    await createSubscriptionExample();
    await reportApiUsageExample();
    await getBillingStatusExample();
    await getAvailablePlansExample();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Examples failed:', error);
  }
}

// Default export for easy importing
export default { stripe, examples };