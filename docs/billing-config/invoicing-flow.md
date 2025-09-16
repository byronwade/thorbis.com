# Thorbis Invoicing Flow

Comprehensive monthly billing process for Thorbis Business OS with detailed examples and calculations.

## 📋 Invoice Composition Overview

**Monthly Invoice Structure**:
1. **Base Subscription** - Fixed $50/month  
2. **Usage Charges** - Metered overages beyond included allowances
3. **Taxes** - Automatic tax calculation based on business location
4. **Credits/Adjustments** - Prorated changes, refunds, or credits
5. **Total Amount Due** - Sum of all charges

## 🔄 Billing Cycle Process

### Day 1-28: Usage Collection
```typescript
// Daily usage aggregation
interface DailyUsage {
  tenantId: string
  date: string
  metrics: {
    active_app_users: number        // Unique users that day
    embeddings: number              // Total embeddings generated
    vector_search: number           // Search operations performed
    template_render: number         // Documents rendered
    sms: number                     // SMS messages sent
    email: number                   // Emails sent
    storage_gb: number             // Peak storage used
    webhook_delivery: number        // Webhooks delivered
  }
}

// Example daily collection
const dailyUsage: DailyUsage = {
  tenantId: 'biz_smith_plumbing_123',
  date: '2024-02-15',
  metrics: {
    active_app_users: 8,           // 8 unique users active
    embeddings: 450,               // 450 embeddings generated
    vector_search: 1200,           // 1200 searches performed
    template_render: 25,           // 25 PDFs generated
    sms: 15,                       // 15 SMS sent
    email: 85,                     // 85 emails sent  
    storage_gb: 28.5,              // 28.5 GB peak storage
    webhook_delivery: 320          // 320 webhooks delivered
  }
}
```

### Day 29-31: Monthly Aggregation
```sql
-- Calculate monthly totals per tenant
WITH monthly_aggregation AS (
  SELECT 
    tenant_id,
    DATE_TRUNC('month', date) as billing_month,
    
    -- AAU: Maximum daily unique users (not sum)
    MAX(CASE WHEN metric_type = 'active_app_users' THEN value ELSE 0 END) as aau_peak,
    
    -- Most metrics: Sum of daily values
    SUM(CASE WHEN metric_type = 'embeddings' THEN value ELSE 0 END) as embeddings_total,
    SUM(CASE WHEN metric_type = 'vector_search' THEN value ELSE 0 END) as vector_search_total,
    SUM(CASE WHEN metric_type = 'template_render' THEN value ELSE 0 END) as template_render_total,
    SUM(CASE WHEN metric_type = 'sms' THEN value ELSE 0 END) as sms_total,
    SUM(CASE WHEN metric_type = 'email' THEN value ELSE 0 END) as email_total,
    SUM(CASE WHEN metric_type = 'webhook_delivery' THEN value ELSE 0 END) as webhook_delivery_total,
    
    -- Storage: Peak usage during the month
    MAX(CASE WHEN metric_type = 'storage_gb' THEN value ELSE 0 END) as storage_gb_peak
    
  FROM usage_metrics 
  WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND date < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY tenant_id, DATE_TRUNC('month', date)
)
SELECT * FROM monthly_aggregation;
```

### Day 1: Invoice Generation
```typescript
interface MonthlyInvoice {
  tenantId: string
  billingPeriod: {
    start: string
    end: string
    month: string
  }
  baseSubscription: {
    plan: 'thorbis_business_os_base'
    amount: number
    includedUsage: UsageAllowances
  }
  usageCharges: UsageCharge[]
  subtotal: number
  taxes: TaxBreakdown[]
  credits: CreditItem[]
  total: number
  dueDate: string
}

// Generate invoice for tenant
async function generateMonthlyInvoice(
  tenantId: string, 
  billingMonth: string
): Promise<MonthlyInvoice> {
  
  // 1. Get monthly usage totals
  const usage = await getMonthlyUsage(tenantId, billingMonth)
  
  // 2. Calculate overages
  const overages = calculateOverages(usage)
  
  // 3. Generate Stripe invoice
  const invoice = await stripe.invoices.create({
    customer: tenantId,
    auto_advance: false,
    collection_method: 'charge_automatically',
    
    // Base subscription line item
    subscription: subscriptionId,
    
    // Usage-based line items
    invoice_items: overages.map(overage => ({
      price: overage.priceId,
      quantity: overage.quantity,
      description: overage.description
    }))
  })
  
  return formatInvoice(invoice)
}
```

---

## 🧮 Detailed Calculation Examples

### Example 1: Light Usage Business
**Business**: Smith Plumbing Co  
**Billing Period**: February 2024  
**Plan**: Thorbis Business OS Base ($50/month)

#### Usage Summary
```typescript
const februaryUsage = {
  active_app_users: 6,           // Peak daily users
  embeddings: 7500,              // Total for month
  vector_search: 18000,          // Total for month
  template_render: 350,          // Total for month
  sms: 75,                       // Total for month
  email: 1800,                   // Total for month
  storage_gb: 20.5,              // Peak during month
  webhook_delivery: 6500         // Total for month
}

const includedAllowances = {
  active_app_users: 10,
  embeddings: 10000,
  vector_search: 25000,
  template_render: 500,
  sms: 100,
  email: 2500,
  storage_gb: 25,
  webhook_delivery: 10000
}
```

#### Overage Calculations
```typescript
const overages = {
  active_app_users: Math.max(0, 6 - 10) = 0,
  embeddings: Math.max(0, 7500 - 10000) = 0,
  vector_search: Math.max(0, 18000 - 25000) = 0,
  template_render: Math.max(0, 350 - 500) = 0,
  sms: Math.max(0, 75 - 100) = 0,
  email: Math.max(0, 1800 - 2500) = 0,
  storage_gb: Math.max(0, 20.5 - 25) = 0,
  webhook_delivery: Math.max(0, 6500 - 10000) = 0
}
```

#### Final Invoice
```json
{
  "tenantId": "biz_smith_plumbing_123",
  "billingPeriod": {
    "start": "2024-02-01",
    "end": "2024-02-29", 
    "month": "February 2024"
  },
  "lineItems": [
    {
      "description": "Thorbis Business OS - Base Plan",
      "type": "subscription",
      "amount": 50.00,
      "details": "Includes: 10 AAU, 10K embeddings, 25K searches, 500 renders, 100 SMS, 2.5K emails, 25GB storage, 10K webhooks"
    }
  ],
  "subtotal": 50.00,
  "taxes": [
    {
      "description": "Texas Sales Tax (8.25%)",
      "rate": 0.0825,
      "amount": 4.13
    }
  ],
  "credits": [],
  "total": 54.13,
  "dueDate": "2024-03-01"
}
```

---

### Example 2: Growing Business
**Business**: Austin HVAC Pros  
**Billing Period**: February 2024  
**Plan**: Thorbis Business OS Base ($50/month)

#### Usage Summary
```typescript
const februaryUsage = {
  active_app_users: 15,          // Exceeds 10 included
  embeddings: 32000,             // Exceeds 10K included  
  vector_search: 78000,          // Exceeds 25K included
  template_render: 850,          // Exceeds 500 included
  sms: 250,                      // Exceeds 100 included
  email: 4500,                   // Exceeds 2.5K included
  storage_gb: 45.2,              // Exceeds 25GB included
  webhook_delivery: 18000        // Exceeds 10K included
}
```

#### Overage Calculations
```typescript
const overages = {
  active_app_users: {
    overage: 15 - 10 = 5,
    rate: 8.00,
    cost: 5 × 8.00 = 40.00
  },
  embeddings: {
    overage: 32000 - 10000 = 22000,
    rate: 0.10 / 1000,  // $0.10 per 1K
    cost: (22000 / 1000) × 0.10 = 2.20
  },
  vector_search: {
    overage: 78000 - 25000 = 53000,
    rate: 0.50 / 1000,  // $0.50 per 1K
    cost: (53000 / 1000) × 0.50 = 26.50
  },
  template_render: {
    overage: 850 - 500 = 350,
    rate: 0.25,
    cost: 350 × 0.25 = 87.50
  },
  sms: {
    overage: 250 - 100 = 150, 
    rate: 0.05,
    cost: 150 × 0.05 = 7.50
  },
  email: {
    overage: 4500 - 2500 = 2000,
    rate: 0.02,
    cost: 2000 × 0.02 = 40.00
  },
  storage_gb: {
    overage: 45.2 - 25 = 20.2,
    rate: 0.10,
    cost: 20.2 × 0.10 = 2.02
  },
  webhook_delivery: {
    overage: 18000 - 10000 = 8000,
    rate: 0.01,
    cost: 8000 × 0.01 = 80.00
  }
}

const totalOverageCost = 40.00 + 2.20 + 26.50 + 87.50 + 7.50 + 40.00 + 2.02 + 80.00 = 285.72
```

#### Final Invoice
```json
{
  "tenantId": "biz_austin_hvac_456", 
  "billingPeriod": {
    "start": "2024-02-01",
    "end": "2024-02-29",
    "month": "February 2024"
  },
  "lineItems": [
    {
      "description": "Thorbis Business OS - Base Plan",
      "type": "subscription",
      "amount": 50.00
    },
    {
      "description": "Active App Users Overage",
      "type": "usage",
      "usage": "5 additional users",
      "rate": "$8.00 per user",
      "amount": 40.00
    },
    {
      "description": "AI Embeddings Overage", 
      "type": "usage",
      "usage": "22,000 additional embeddings",
      "rate": "$0.10 per 1,000 embeddings",
      "amount": 2.20
    },
    {
      "description": "Vector Search Overage",
      "type": "usage", 
      "usage": "53,000 additional searches",
      "rate": "$0.50 per 1,000 searches",
      "amount": 26.50
    },
    {
      "description": "Template Rendering Overage",
      "type": "usage",
      "usage": "350 additional renders", 
      "rate": "$0.25 per render",
      "amount": 87.50
    },
    {
      "description": "SMS Messages Overage",
      "type": "usage",
      "usage": "150 additional SMS",
      "rate": "$0.05 per SMS",
      "amount": 7.50
    },
    {
      "description": "Email Messages Overage",
      "type": "usage",
      "usage": "2,000 additional emails",
      "rate": "$0.02 per email", 
      "amount": 40.00
    },
    {
      "description": "Storage Overage",
      "type": "usage",
      "usage": "20.2 additional GB",
      "rate": "$0.10 per GB",
      "amount": 2.02
    },
    {
      "description": "Webhook Deliveries Overage",
      "type": "usage", 
      "usage": "8,000 additional webhooks",
      "rate": "$0.01 per webhook",
      "amount": 80.00
    }
  ],
  "subtotal": 335.72,
  "taxes": [
    {
      "description": "Texas Sales Tax (8.25%)",
      "rate": 0.0825,
      "amount": 27.70
    }
  ],
  "credits": [],
  "total": 363.42,
  "dueDate": "2024-03-01"
}
```

---

### Example 3: Enterprise Business with Credits
**Business**: Metro Field Services  
**Billing Period**: February 2024  
**Plan**: Thorbis Business OS Base ($50/month)

#### Mid-Month Plan Changes
```typescript
// February 15th: Added 10 additional AAU allowance due to growth
const midMonthCredit = {
  description: "Mid-month AAU allowance increase",
  type: "plan_upgrade",
  amount: -80.00,  // Credit for remaining half month
  prorationDetails: {
    originalAllowance: 10,
    newAllowance: 20, 
    upgradeDate: "2024-02-15",
    daysRemaining: 14,
    dailyCost: (10 * 8.00) / 28 // $2.86 per day
  }
}
```

#### Usage Summary (High Volume)
```typescript
const februaryUsage = {
  active_app_users: 22,          // Peak users (now 20 included due to upgrade)
  embeddings: 125000,            // High AI usage
  vector_search: 320000,         // Heavy search volume  
  template_render: 1800,         // Lots of document generation
  sms: 950,                      // High SMS volume
  email: 15000,                  // Large email campaigns
  storage_gb: 125.5,             // Substantial data storage
  webhook_delivery: 85000        // Heavy integration usage
}

// Adjusted allowances due to mid-month upgrade
const adjustedAllowances = {
  active_app_users: 20,          // Upgraded from 10
  embeddings: 10000,             // Still base allowance
  vector_search: 25000,          // Still base allowance
  template_render: 500,          // Still base allowance
  sms: 100,                      // Still base allowance
  email: 2500,                   // Still base allowance
  storage_gb: 25,                // Still base allowance
  webhook_delivery: 10000        // Still base allowance
}
```

#### Tiered Pricing Calculations
```typescript
// Embeddings with tiered pricing
const embeddingsOverage = 125000 - 10000 = 115000
const embeddingsCost = calculateTieredCost(115000, [
  { upTo: 100000, rate: 0.10 / 1000 },  // First 100K at $0.10/1K
  { upTo: Infinity, rate: 0.08 / 1000 }  // Next tier at $0.08/1K  
])
// = (100000 / 1000) × 0.10 + (15000 / 1000) × 0.08 = 10.00 + 1.20 = 11.20

// Vector Search with tiered pricing  
const searchOverage = 320000 - 25000 = 295000
const searchCost = calculateTieredCost(295000, [
  { upTo: 100000, rate: 0.50 / 1000 },  // First 100K at $0.50/1K
  { upTo: 1000000, rate: 0.40 / 1000 }  // Next 900K at $0.40/1K
])
// = (100000 / 1000) × 0.50 + (195000 / 1000) × 0.40 = 50.00 + 78.00 = 128.00
```

#### Final Invoice with Credits
```json
{
  "tenantId": "biz_metro_field_789",
  "billingPeriod": {
    "start": "2024-02-01", 
    "end": "2024-02-29",
    "month": "February 2024"
  },
  "lineItems": [
    {
      "description": "Thorbis Business OS - Base Plan",
      "type": "subscription",
      "amount": 50.00
    },
    {
      "description": "Active App Users Overage",
      "type": "usage",
      "usage": "2 additional users (22 peak vs 20 included)",
      "rate": "$8.00 per user",
      "amount": 16.00
    },
    {
      "description": "AI Embeddings Overage (Tiered)",
      "type": "usage",
      "usage": "115,000 additional embeddings",
      "rateDetails": "First 100K at $0.10/1K, next 15K at $0.08/1K",
      "amount": 11.20
    },
    {
      "description": "Vector Search Overage (Tiered)",
      "type": "usage", 
      "usage": "295,000 additional searches",
      "rateDetails": "First 100K at $0.50/1K, next 195K at $0.40/1K",
      "amount": 128.00
    },
    {
      "description": "Template Rendering Overage",
      "type": "usage",
      "usage": "1,300 additional renders",
      "rate": "$0.25 per render",
      "amount": 325.00
    },
    {
      "description": "SMS Messages Overage", 
      "type": "usage",
      "usage": "850 additional SMS",
      "rate": "$0.05 per SMS", 
      "amount": 42.50
    },
    {
      "description": "Email Messages Overage",
      "type": "usage",
      "usage": "12,500 additional emails",
      "rate": "$0.02 per email",
      "amount": 250.00
    },
    {
      "description": "Storage Overage",
      "type": "usage",
      "usage": "100.5 additional GB",
      "rate": "$0.10 per GB",
      "amount": 10.05
    },
    {
      "description": "Webhook Deliveries Overage",
      "type": "usage",
      "usage": "75,000 additional webhooks", 
      "rate": "$0.01 per webhook",
      "amount": 750.00
    }
  ],
  "subtotal": 1582.75,
  "credits": [
    {
      "description": "Mid-month AAU allowance upgrade credit",
      "type": "proration_credit",
      "details": "Prorated credit for 14 days at upgraded rate",
      "amount": -40.00
    }
  ],
  "adjustedSubtotal": 1542.75,
  "taxes": [
    {
      "description": "Texas Sales Tax (8.25%)",
      "rate": 0.0825,
      "amount": 127.28
    }
  ],
  "total": 1670.03,
  "dueDate": "2024-03-01",
  "paymentTerms": "Net 0 - Due upon receipt"
}
```

---

## 📊 Invoice Processing Workflow

### 1. Pre-Generation Validation
```typescript
async function validateBillingData(tenantId: string, billingMonth: string) {
  // Check data completeness
  const usageRecords = await getUsageRecords(tenantId, billingMonth)
  if (usageRecords.length === 0) {
    throw new Error(`No usage data found for ${tenantId} in ${billingMonth}`)
  }
  
  // Validate subscription status
  const subscription = await getActiveSubscription(tenantId)
  if (!subscription) {
    throw new Error(`No active subscription for ${tenantId}`)
  }
  
  // Check for billing holds or credits
  const billingStatus = await getBillingStatus(tenantId)
  if (billingStatus.onHold) {
    throw new Error(`Billing on hold for ${tenantId}: ${billingStatus.reason}`)
  }
  
  return { valid: true, subscription, billingStatus }
}
```

### 2. Usage Aggregation
```sql
-- Comprehensive monthly usage query
WITH daily_metrics AS (
  SELECT 
    tenant_id,
    DATE_TRUNC('day', created_at) as usage_date,
    metric_type,
    SUM(value) as daily_total
  FROM usage_metrics 
  WHERE DATE_TRUNC('month', created_at) = $billing_month
    AND tenant_id = $tenant_id
  GROUP BY tenant_id, DATE_TRUNC('day', created_at), metric_type
),
monthly_totals AS (
  SELECT 
    tenant_id,
    metric_type,
    CASE 
      -- Peak metrics (AAU, Storage)
      WHEN metric_type IN ('active_app_users', 'storage_gb') 
      THEN MAX(daily_total)
      -- Sum metrics (everything else)
      ELSE SUM(daily_total)
    END as monthly_usage
  FROM daily_metrics
  GROUP BY tenant_id, metric_type
)
SELECT 
  mt.tenant_id,
  json_object_agg(
    mt.metric_type, 
    json_build_object(
      'usage', mt.monthly_usage,
      'included', pt.included_quantity,
      'overage', GREATEST(0, mt.monthly_usage - pt.included_quantity),
      'overage_cost', GREATEST(0, mt.monthly_usage - pt.included_quantity) * pt.overage_rate
    )
  ) as usage_summary
FROM monthly_totals mt
JOIN pricing_tiers pt ON pt.metric_type = mt.metric_type
GROUP BY mt.tenant_id;
```

### 3. Stripe Invoice Creation
```typescript
async function createStripeInvoice(
  tenantId: string,
  usageSummary: UsageSummary,
  billingPeriod: BillingPeriod
) {
  const customer = await stripe.customers.retrieve(tenantId)
  
  // Create usage records for metered billing
  const usageRecords = []
  for (const [metricType, usage] of Object.entries(usageSummary)) {
    if (usage.overage > 0) {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        getSubscriptionItemId(metricType),
        {
          quantity: Math.ceil(usage.overage),
          timestamp: Math.floor(billingPeriod.end.getTime() / 1000),
          action: 'set'
        }
      )
      usageRecords.push(usageRecord)
    }
  }
  
  // Generate the invoice
  const invoice = await stripe.invoices.create({
    customer: tenantId,
    auto_advance: false,
    collection_method: 'charge_automatically',
    description: `Thorbis Business OS - ${billingPeriod.month}`,
    metadata: {
      billing_month: billingPeriod.month,
      usage_period: `${billingPeriod.start} to ${billingPeriod.end}`,
      tenant_id: tenantId
    }
  })
  
  return { invoice, usageRecords }
}
```

### 4. Invoice Finalization
```typescript
async function finalizeInvoice(invoiceId: string) {
  // Finalize the invoice (makes it immutable)
  const invoice = await stripe.invoices.finalizeInvoice(invoiceId, {
    auto_advance: true
  })
  
  // Send to customer
  await stripe.invoices.sendInvoice(invoiceId)
  
  // Record in internal systems
  await recordInvoiceGenerated({
    invoiceId: invoice.id,
    tenantId: invoice.customer,
    amount: invoice.total,
    status: invoice.status,
    dueDate: new Date(invoice.due_date * 1000)
  })
  
  return invoice
}
```

---

## 🔔 Customer Communication

### Invoice Delivery Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Thorbis Invoice is Ready</title>
</head>
<body>
    <h2>Invoice for February 2024</h2>
    
    <p>Hi {{business_name}},</p>
    
    <p>Your Thorbis Business OS invoice for February 2024 is now available.</p>
    
    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <h3>Invoice Summary</h3>
        <ul>
            <li><strong>Base Plan:</strong> $50.00</li>
            {{#if hasUsageCharges}}
            <li><strong>Usage Charges:</strong> ${{usageCharges}}</li>
            {{/if}}
            <li><strong>Total:</strong> ${{total}}</li>
        </ul>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
    </div>
    
    {{#if hasOverages}}
    <h3>Usage This Month</h3>
    <p>You exceeded your included allowances in the following areas:</p>
    <ul>
        {{#each overages}}
        <li>{{name}}: {{usage}} ({{overage}} over limit) - ${{cost}}</li>
        {{/each}}
    </ul>
    {{/if}}
    
    <p>
        <a href="{{invoiceUrl}}" style="background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View & Pay Invoice
        </a>
    </p>
    
    <p>Questions? Reply to this email or visit our support center.</p>
    
    <p>Thanks for using Thorbis!</p>
</body>
</html>
```

### Usage Alert Notifications
```typescript
// Send alerts when approaching limits
async function checkUsageThresholds(tenantId: string) {
  const currentUsage = await getCurrentMonthUsage(tenantId)
  const limits = await getBudgetLimits(tenantId)
  
  for (const [metric, usage] of Object.entries(currentUsage)) {
    const limit = limits[metric]
    const percentage = usage.current / usage.included
    
    if (percentage >= 0.90 && !usage.alertSent) {
      await sendUsageAlert({
        tenantId,
        metric,
        percentage: Math.round(percentage * 100),
        projectedCost: calculateProjectedOverage(usage.current, usage.remaining),
        recommendedAction: getRecommendation(metric, percentage)
      })
      
      await markAlertSent(tenantId, metric)
    }
  }
}
```

This invoicing flow ensures transparent, accurate billing with detailed breakdowns and proactive communication to help businesses understand and manage their Thorbis costs.
