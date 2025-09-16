# Thorbis Business OS - Billing & Metering System

Comprehensive usage-based billing system with base subscription + pay-as-you-go metering, budget guardrails, and transparent cost controls.

## 📁 Files Overview

- **`meters.md`** - Complete metering strategy and usage definitions
- **`stripe-products.json`** - Stripe products/pricing configuration  
- **`invoicing-flow.md`** - Monthly billing process with examples
- **`budget-guardrails.md`** - Cost control thresholds and notifications
- **`examples.ts`** - End-to-end usage scenarios with SDK examples
- **`README.md`** - This implementation guide

## 💰 Pricing Model

### Base Plan: $50/month
**Includes:**
- 10 Active App Users
- 10K AI Embeddings  
- 25K Vector Searches
- 500 Template Renders
- 100 SMS Messages
- 2.5K Email Messages
- 25 GB Storage
- 10K Webhook Deliveries

### Pay-as-you-go Overages
| Metric | Rate | Billing |
|--------|------|---------|
| **Active App Users** | $8.00/user | Peak daily users per month |
| **AI Embeddings** | $0.10/1K | Total generated per month |
| **Vector Searches** | $0.50/1K | Total operations per month |
| **Template Renders** | $0.25/render | Total documents per month |
| **SMS Messages** | $0.05/SMS | Total sent per month |
| **Email Messages** | $0.02/email | Total sent per month |
| **Storage** | $0.10/GB | Peak usage per month |
| **Webhooks** | $0.01/webhook | Total delivered per month |

## 🎯 Cost Examples

### Small Business ($50-75/month)
```typescript
// Light usage - stays within included allowances
const usage = {
  active_app_users: 6,      // Within 10 included
  embeddings: 7500,         // Within 10K included
  template_render: 350,     // Within 500 included
  // ... other metrics within limits
}
// Total: $50 base + $0 overages = $50/month
```

### Growing Business ($200-350/month)
```typescript
// Moderate overages across multiple metrics
const usage = {
  active_app_users: 15,     // 5 over × $8 = $40
  embeddings: 32000,        // 22K over × $0.10/1K = $2.20
  vector_search: 78000,     // 53K over × $0.50/1K = $26.50
  template_render: 850,     // 350 over × $0.25 = $87.50
  // ... 
}
// Total: $50 base + $285 overages = $335/month
```

### Enterprise Business ($1000-2000+/month)
```typescript
// High volume usage with tiered pricing benefits
const usage = {
  active_app_users: 45,     // 35 over × $8 = $280
  embeddings: 250000,       // Tiered pricing applies
  vector_search: 500000,    // Volume discounts apply
  // ...
}
// Total: $50 base + $1500+ overages
```

## 🚦 Budget Guardrails

### Threshold System
```typescript
const thresholds = {
  warning_75: 0.75,    // 75% usage → Email alert
  warning_90: 0.90,    // 90% usage → SMS + email alert  
  soft_limit: 1.0,     // 100% usage → Service restrictions
  hard_limit: 1.25,    // 125% usage → Service paused
  emergency_stop: 2.0  // 200% usage → Hard stop
}
```

### Automatic Actions
- **75% usage**: Email notification with projections
- **90% usage**: SMS + email alerts with cost estimates
- **100% usage**: Soft restrictions (cache more, queue non-critical)
- **125% usage**: Hard pause with override options
- **200% usage**: Emergency stop (prevents runaway costs)

### Override Options
- **One-time**: Allow single operation ($0.25-$8.00)
- **Remainder of month**: Continue until billing cycle ends
- **Increase limits**: Permanent allowance increase
- **Emergency approval**: SMS/email quick approval for urgent needs

## 🧮 Invoice Generation

### Monthly Process
1. **Days 1-28**: Continuous usage collection
2. **Day 29**: Usage aggregation and calculation  
3. **Day 30**: Invoice generation and delivery
4. **Day 31**: Payment processing and next cycle start

### Invoice Example
```json
{
  "business": "Austin HVAC Pros",
  "period": "February 2024",
  "lineItems": [
    {
      "description": "Thorbis Business OS - Base Plan",
      "amount": 50.00
    },
    {
      "description": "Active App Users Overage",
      "details": "5 additional users × $8.00",
      "amount": 40.00
    },
    {
      "description": "Template Rendering Overage", 
      "details": "350 additional renders × $0.25",
      "amount": 87.50
    }
  ],
  "subtotal": 177.50,
  "tax": 14.65,
  "total": 192.15
}
```

## 🛠️ Implementation Guide

### 1. Stripe Setup
```bash
# Create Stripe products and prices
curl -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer sk_test_..." \
  -d "name=Thorbis Business OS" \
  -d "type=service"

# Create usage-based prices
curl -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer sk_test_..." \
  -d "product=prod_..." \
  -d "unit_amount=800" \
  -d "currency=usd" \
  -d "recurring[interval]=month" \
  -d "recurring[usage_type]=metered" \
  -d "recurring[aggregate_usage]=sum"
```

### 2. Usage Tracking Implementation
```typescript
// Record usage with automatic threshold checking
export async function recordUsage(
  tenantId: string,
  metric: MeterType,
  quantity: number
) {
  // 1. Record usage in database
  await db.query(`
    INSERT INTO usage_metrics (tenant_id, metric_type, value, date)
    VALUES ($1, $2, $3, CURRENT_DATE)
    ON CONFLICT (tenant_id, metric_type, date) 
    DO UPDATE SET value = usage_metrics.value + $3
  `, [tenantId, metric, quantity])
  
  // 2. Check thresholds
  const currentUsage = await getCurrentMonthUsage(tenantId, metric)
  const limits = await getUsageLimits(tenantId, metric)
  
  await checkUsageThresholds(tenantId, metric, currentUsage, limits)
  
  // 3. Report to Stripe
  if (isMeteredUsage(metric)) {
    await reportStripeUsage(tenantId, metric, quantity)
  }
}

// Real-time usage retrieval
export async function getCurrentUsage(tenantId: string) {
  const billingPeriod = getCurrentBillingPeriod()
  
  const usage = await db.query(`
    SELECT 
      metric_type,
      CASE 
        WHEN metric_type IN ('active_app_users', 'storage_gb') 
        THEN MAX(value)
        ELSE SUM(value)
      END as total_usage
    FROM usage_metrics 
    WHERE tenant_id = $1 
      AND date >= $2 
      AND date < $3
    GROUP BY metric_type
  `, [tenantId, billingPeriod.start, billingPeriod.end])
  
  return formatUsageResponse(usage, billingPeriod)
}
```

### 3. Budget Enforcement
```typescript
// Soft limit implementation
export async function applySoftLimit(tenantId: string, metric: MeterType) {
  const actions = {
    embeddings: () => enableAggressiveCaching(tenantId),
    template_render: () => queueNonCriticalRenders(tenantId),
    sms: () => enableSMSBatching(tenantId),
    webhook_delivery: () => batchNonCriticalWebhooks(tenantId)
  }
  
  await actions[metric]?.()
  
  // Send notification
  await sendUsageAlert({
    tenantId,
    metric,
    type: 'soft_limit_reached',
    allowOverride: true
  })
}

// Hard limit implementation
export async function applyHardLimit(tenantId: string, metric: MeterType) {
  // Pause service
  await updateTenantSettings(tenantId, {
    [`${metric}_paused`]: true,
    paused_reason: 'hard_limit_reached'
  })
  
  // Send urgent notification with override options
  await sendUrgentAlert({
    tenantId,
    metric,
    type: 'hard_limit_reached',
    overrideOptions: [
      'one_time_continue',
      'remainder_of_month',
      'increase_budget'
    ]
  })
}
```

### 4. Dashboard Integration
```typescript
// Real-time usage dashboard
export const UsageDashboard = () => {
  const { tenantId } = useAuth()
  const { data: usage, error } = useSWR(
    `/api/billing/usage/${tenantId}`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )
  
  if (error) return <ErrorMessage />
  if (!usage) return <LoadingSpinner />
  
  return (
    <div className="usage-dashboard">
      <div className="overview-cards">
        <BudgetCard 
          totalBudget={usage.budget}
          projectedCost={usage.projectedCost}
          status={usage.budgetStatus}
        />
        
        <AlertsCard alerts={usage.alerts} />
      </div>
      
      <div className="metrics-grid">
        {Object.entries(usage.metrics).map(([metric, data]) => (
          <MetricCard
            key={metric}
            metric={metric}
            data={data}
            onPause={() => pauseService(metric)}
            onOverride={() => requestOverride(metric)}
            onAdjustBudget={(newLimit) => updateBudget(metric, newLimit)}
          />
        ))}
      </div>
    </div>
  )
}
```

## 📊 Monitoring & Analytics

### Key Metrics Dashboard
```sql
-- Monthly usage summary by tenant
SELECT 
  t.name as business_name,
  DATE_TRUNC('month', um.date) as billing_month,
  json_object_agg(
    um.metric_type,
    json_build_object(
      'usage', um.total_usage,
      'overage', um.overage_usage,
      'cost', um.overage_cost
    )
  ) as usage_summary,
  SUM(um.overage_cost) as total_overage_cost
FROM usage_monthly_summary um
JOIN tenants t ON t.id = um.tenant_id
WHERE um.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
GROUP BY t.name, DATE_TRUNC('month', um.date)
ORDER BY billing_month DESC, total_overage_cost DESC;

-- Usage trends and predictions
WITH usage_trends AS (
  SELECT 
    tenant_id,
    metric_type,
    DATE_TRUNC('month', date) as month,
    SUM(value) as monthly_usage,
    LAG(SUM(value)) OVER (
      PARTITION BY tenant_id, metric_type 
      ORDER BY DATE_TRUNC('month', date)
    ) as prev_month_usage
  FROM usage_metrics
  WHERE date >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY tenant_id, metric_type, DATE_TRUNC('month', date)
)
SELECT 
  tenant_id,
  metric_type,
  month,
  monthly_usage,
  CASE 
    WHEN prev_month_usage > 0 
    THEN ((monthly_usage - prev_month_usage) / prev_month_usage::float) * 100
    ELSE 0
  END as month_over_month_growth_percent
FROM usage_trends
WHERE prev_month_usage IS NOT NULL
ORDER BY tenant_id, metric_type, month DESC;
```

### Cost Optimization Insights
```typescript
// Generate usage optimization recommendations
export async function generateOptimizationRecommendations(tenantId: string) {
  const usage = await getUsageHistory(tenantId, 6) // 6 months
  const recommendations = []
  
  for (const [metric, history] of Object.entries(usage.metrics)) {
    // High variance suggests optimization opportunities
    const variance = calculateVariance(history.map(h => h.usage))
    const trend = calculateTrend(history.map(h => h.usage))
    const avgOverage = history.reduce((sum, h) => sum + h.overage, 0) / history.length
    
    if (avgOverage > 0) {
      if (trend > 0.2) {
        // Growing usage - recommend plan upgrade
        recommendations.push({
          metric,
          type: 'upgrade_plan',
          message: `Consider upgrading ${metric} allowance`,
          impact: `Could save $${(avgOverage * getOverageRate(metric) * 0.3).toFixed(2)}/month`,
          priority: 'high'
        })
      } else if (variance > avgOverage * 0.5) {
        // High variance - recommend usage smoothing
        recommendations.push({
          metric,
          type: 'smooth_usage',
          message: `${metric} usage is inconsistent - consider batching`,
          impact: 'More predictable billing',
          priority: 'medium'
        })
      }
    }
    
    // Specific metric recommendations
    if (metric === 'embeddings' && avgOverage > 5000) {
      recommendations.push({
        metric,
        type: 'optimize_caching',
        message: 'Implement aggressive embedding caching',
        impact: `Could reduce usage by 30-50%`,
        priority: 'high'
      })
    }
    
    if (metric === 'vector_search' && avgOverage > 10000) {
      recommendations.push({
        metric,
        type: 'optimize_search',
        message: 'Cache search results and use filters',
        impact: `Could reduce search volume by 40%`,
        priority: 'high'
      })
    }
  }
  
  return recommendations
}
```

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] Stripe products and prices configured
- [ ] Usage tracking implemented for all metrics
- [ ] Budget thresholds configured per business type
- [ ] Email/SMS notification templates ready
- [ ] Dashboard UI components tested
- [ ] Invoice generation tested with real data
- [ ] Override approval workflows implemented

### Launch
- [ ] Migrate existing customers to new billing system
- [ ] Set appropriate budget defaults based on historical usage
- [ ] Monitor usage spikes and threshold crossings
- [ ] Customer communication about new billing structure
- [ ] Support team trained on usage explanations and overrides

### Post-Launch
- [ ] Monitor billing accuracy and customer feedback
- [ ] Analyze usage patterns for pricing optimization
- [ ] Implement usage optimization recommendations
- [ ] Scale infrastructure for high-volume usage tracking
- [ ] Regular review of budget thresholds and limits

## 📞 Support & Troubleshooting

### Common Issues

**Q: Usage seems higher than expected**
```sql
-- Debug query to trace usage sources
SELECT 
  date,
  metric_type,
  value,
  metadata->>'source' as source,
  metadata->>'operation' as operation
FROM usage_metrics 
WHERE tenant_id = $1 
  AND metric_type = $2
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, value DESC;
```

**Q: Budget alerts not triggering**
```typescript
// Check threshold configuration
const thresholds = await getUsageThresholds(tenantId)
const currentUsage = await getCurrentUsage(tenantId)

console.log('Threshold check:', {
  usage: currentUsage,
  thresholds: thresholds,
  shouldAlert: currentUsage.percentage >= thresholds.warning_75
})
```

**Q: Invoice amounts don't match dashboard**
```sql
-- Compare dashboard vs invoice calculations
SELECT 
  'dashboard' as source,
  metric_type,
  total_usage,
  overage_usage,
  overage_cost
FROM usage_dashboard_summary 
WHERE tenant_id = $1 AND month = $2

UNION ALL

SELECT 
  'invoice' as source,
  metric_type, 
  billed_usage,
  billed_overage,
  billed_cost
FROM stripe_invoice_items
WHERE customer_id = $1 AND billing_month = $2;
```

### Emergency Procedures

**Service Pause Override**
```bash
# Emergency service resume (owner approval required)
curl -X POST /api/billing/emergency-resume \
  -H "Authorization: Bearer owner_token" \
  -d '{"tenant_id": "...", "metric": "...", "duration_hours": 24}'
```

**Budget Emergency Increase**
```typescript
// Temporary budget increase (auto-expires)
await emergencyBudgetIncrease({
  tenantId: 'tenant_id',
  metric: 'template_render',
  additionalAmount: 200,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  approvedBy: 'business_owner',
  reason: 'month_end_invoicing'
})
```

This comprehensive billing system provides transparent, predictable, and controllable usage-based pricing for the Thorbis Business OS platform while maintaining excellent user experience and preventing unexpected billing surprises.
