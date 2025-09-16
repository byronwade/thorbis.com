# @thorbis/billing

Comprehensive billing and subscription management package for Thorbis Business OS with Stripe integration.

## Features

- ✅ **$50/month Base Subscription** with API usage overages
- ✅ **Real-time Usage Tracking** with automatic billing
- ✅ **Multi-tenant Architecture** with organization isolation
- ✅ **Complete Stripe Integration** with webhooks
- ✅ **TypeScript Support** with full type safety
- ✅ **Production Ready** with comprehensive error handling

## Installation

```bash
pnpm add @thorbis/billing
```

## Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Quick Start

### Initialize the Wrapper

```typescript
import { createThorbisStripe } from '@thorbis/billing';

// Using environment variables (recommended)
const stripe = createThorbisStripe();

// Or with custom configuration
const stripe = createThorbisStripe({
  stripeSecretKey: 'sk_test_...',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseServiceRoleKey: 'service_role_key',
  environment: 'test',
  debugMode: true,
});
```

### Create a Customer

```typescript
const customer = await stripe.createCustomer({
  organizationId: 'org-123',
  email: 'billing@company.com',
  name: 'ACME Corporation',
  address: {
    line1: '123 Business St',
    city: 'Denver',
    state: 'CO',
    postal_code: '80202',
    country: 'US',
  },
});
```

### Create a Subscription

```typescript
const subscription = await stripe.createSubscription({
  organizationId: 'org-123',
  planId: 'plan-pro-monthly', // $150/month with 5,000 API calls
  trialDays: 14, // Optional 14-day trial
});
```

### Track API Usage

```typescript
// Report API calls
await stripe.reportUsage({
  organizationId: 'org-123',
  meterName: 'api_calls',
  quantity: 100,
});

// Report data exports
await stripe.reportUsage({
  organizationId: 'org-123',
  meterName: 'data_exports',
  quantity: 5,
});
```

### Check Billing Status

```typescript
const status = await stripe.getBillingStatus('org-123');

console.log(`Plan: ${status.currentPlan}`);
console.log(`Usage: ${status.monthlyApiUsage}/${status.apiQuota}`);
console.log(`Overage: ${status.overageCount} calls`);
console.log(`Estimated Cost: $${status.estimatedOverageCost}`);
```

## Subscription Plans

| Plan | Price/Month | API Calls Included | Overage Rate |
|------|-------------|-------------------|--------------|
| **Basic** | $50 | 1,000 calls | $0.01/call |
| **Professional** | $150 | 5,000 calls | $0.01/call |
| **Enterprise** | $500 | 20,000 calls | $0.01/call |

### Additional Usage Charges

- **Data Exports**: $0.10 per export
- **AI Requests**: $0.05 per request
- **API Calls**: $0.01 per call (beyond quota)

## API Routes Examples

### Create Subscription Endpoint

```typescript
// /api/billing/create-subscription/route.ts
import { createThorbisStripe } from '@thorbis/billing';

const stripe = createThorbisStripe();

export async function POST(req: Request) {
  const { organizationId, planId } = await req.json();
  
  const subscription = await stripe.createSubscription({
    organizationId,
    planId,
  });
  
  return Response.json({ subscription });
}
```

### Usage Tracking Endpoint

```typescript
// /api/billing/usage/route.ts
import { createThorbisStripe, withUsageTracking } from '@thorbis/billing';

const stripe = createThorbisStripe();

const trackUsage = withUsageTracking(stripe, {
  extractOrgId: (req) => req.headers.get('x-org-id'),
  billable: true,
  meterCategory: 'api_calls',
});

export const GET = trackUsage(async (req) => {
  // This request will be automatically tracked for billing
  return Response.json({ data: 'API response' });
});
```

### Stripe Webhooks

```typescript
// /api/webhooks/stripe/route.ts
import { StripeWebhookHandler } from '@thorbis/billing';

const webhookHandler = new StripeWebhookHandler({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  const result = await webhookHandler.processWebhook(body, signature);
  
  return Response.json(result);
}
```

## Usage Tracking Middleware

### Automatic Usage Tracking

```typescript
import { withUsageTracking, extractionHelpers, usageConfigs } from '@thorbis/billing';

const trackUsage = withUsageTracking(tracker, {
  extractOrgId: extractionHelpers.fromHeader('x-org-id'),
  extractUserId: extractionHelpers.fromHeader('x-user-id'),
  ...usageConfigs.standardApi,
});

// Wrap your API handler
export const GET = trackUsage(async (req) => {
  // Your API logic here
  return Response.json({ data: 'success' });
});
```

### Custom Usage Categories

```typescript
// Different usage categories with different rates
const configs = {
  apiCalls: { billable: true, meterCategory: 'api_calls' },
  dataExports: { billable: true, meterCategory: 'data_exports' },
  aiRequests: { billable: true, meterCategory: 'ai_requests' },
  webhooks: { billable: false, meterCategory: 'webhooks' },
};
```

## Payment Methods

### Setup Payment Method

```typescript
// Create setup intent for adding payment method
const setupIntent = await stripe.createSetupIntent('org-123');
// Use setupIntent.client_secret on frontend with Stripe Elements
```

### List Payment Methods

```typescript
const paymentMethods = await stripe.listPaymentMethods('org-123');
paymentMethods.forEach((pm) => {
  console.log(`**** **** **** ${pm.card?.last4} (${pm.card?.brand})`);
});
```

### Set Default Payment Method

```typescript
await stripe.setDefaultPaymentMethod('org-123', 'pm_1234567890');
```

## Invoicing

### Create Usage Invoice

```typescript
// Generate invoice for overage charges
const invoice = await stripe.createUsageInvoice(
  'org-123',
  'Monthly API usage overage charges'
);

console.log(`Invoice: ${invoice.id}`);
console.log(`Amount: ${stripe.formatAmount(invoice.amount_due)}`);
```

### Calculate Overage Charges

```typescript
const overage = await stripe.calculateOverageCharges('org-123');

console.log(`Total Overage: ${overage.totalOverage} units`);
console.log(`Total Cost: $${overage.totalCost.toFixed(2)}`);

overage.breakdown.forEach((item) => {
  console.log(`${item.meterName}: ${item.overage} units = $${item.cost}`);
});
```

## Error Handling

```typescript
try {
  const subscription = await stripe.createSubscription({
    organizationId: 'org-123',
    planId: 'plan-pro-monthly',
  });
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Handle card errors
    console.error('Card error:', error.message);
  } else if (error.type === 'StripeInvalidRequestError') {
    // Handle invalid request
    console.error('Invalid request:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Utilities

### Check Subscription Status

```typescript
const hasActive = await stripe.hasActiveSubscription('org-123');
if (!hasActive) {
  // Redirect to subscription page
}
```

### Get Available Plans

```typescript
// All plans
const allPlans = await stripe.getSubscriptionPlans();

// Industry-specific plans
const hsPlans = await stripe.getSubscriptionPlans('hs');
```

### Format Currency

```typescript
const formatted = stripe.formatAmount(5000); // "$50.00"
const euros = stripe.formatAmount(5000, 'EUR'); // "€50.00"
```

## Database Schema

The package requires the following database schema (automatically created with migrations):

- `stripe_customers` - Customer records
- `subscription_plans` - Available plans
- `subscriptions` - Active subscriptions
- `api_usage_meters` - Usage tracking
- `api_usage_logs` - Detailed usage logs
- `invoices` - Invoice records
- `payments` - Payment records
- `stripe_webhook_events` - Webhook event log

## Testing

```typescript
// Use test API key for development
const stripe = createThorbisStripe({
  environment: 'test',
  debugMode: true,
});

// Test with Stripe test cards
// 4242424242424242 - Visa
// 4000000000000002 - Card declined
// 4000000000009995 - Insufficient funds
```

## Production Deployment

1. **Set environment to 'live'**:
```typescript
const stripe = createThorbisStripe({
  environment: 'live',
  debugMode: false,
});
```

2. **Use live Stripe keys**:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Configure webhook endpoint**:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: All billing events
   - Include `stripe-signature` header

4. **Monitor usage and billing**:
```typescript
// Set up monitoring alerts
const status = await stripe.getBillingStatus('org-123');
if (status.overageCount > 1000) {
  // Send alert
}
```

## Support

For issues and questions:
- Check the examples in `/src/examples/`
- Review the API documentation
- Test with the provided test data

## License

MIT License - see LICENSE file for details.