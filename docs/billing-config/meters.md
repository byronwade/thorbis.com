# Thorbis Metering Strategy

Comprehensive usage metering for the Thorbis Business OS platform with base subscription + pay-as-you-go pricing model.

## 📊 Pricing Overview

**Base Plan**: $50/month
- Includes baseline usage allowances for small businesses
- All core features and integrations
- Standard support

**Pay-as-you-go**: Usage beyond included allowances
- Transparent per-unit pricing
- Monthly aggregation and billing
- Real-time usage tracking

## 🔢 Metering Dimensions

### 1. Active App Users (AAU)
**Definition**: Unique users who perform any action in the Thorbis app within a calendar month

**What Counts**:
- ✅ Dashboard logins and interactions
- ✅ Mobile app usage 
- ✅ API calls made by authenticated users
- ✅ Field staff using job management features
- ✅ Customer portal interactions

**What Doesn't Count**:
- ❌ Anonymous website visitors
- ❌ Webhook deliveries
- ❌ System background processes
- ❌ Failed login attempts

**Tracking Method**:
```sql
-- Daily unique user aggregation
INSERT INTO usage_metrics (tenant_id, metric_type, date, value)
SELECT 
  business_id,
  'active_app_users',
  CURRENT_DATE,
  COUNT(DISTINCT user_id)
FROM user_activity_log 
WHERE date = CURRENT_DATE
GROUP BY business_id;
```

**Pricing**:
- **Included**: 10 AAU/month
- **Overage**: $8/AAU/month
- **Billing**: Sum of daily unique users per month (not average)

---

### 2. AI Embeddings
**Definition**: Vector embeddings generated for search, recommendations, and AI features

**What Counts**:
- ✅ Customer data embeddings (for search/matching)
- ✅ Document embeddings (invoices, estimates, job descriptions)
- ✅ Business profile embeddings (for Truth Layer discovery)
- ✅ Review and feedback embeddings
- ✅ Re-embedding when data changes

**What Doesn't Count**:
- ❌ Cached embedding retrievals
- ❌ Failed embedding requests
- ❌ System-generated embeddings (not tenant-specific)

**Tracking Method**:
```typescript
// Track embedding requests
await recordUsage({
  tenantId,
  metric: 'embeddings',
  quantity: embeddingRequests.length,
  metadata: {
    model: 'voyage-large-2',
    totalTokens: response.usage.total_tokens
  }
})
```

**Pricing**:
- **Included**: 10,000 embeddings/month
- **Overage**: $0.10/1,000 embeddings
- **Billing**: Total embeddings generated per month

---

### 3. Vector Search Operations
**Definition**: Semantic search queries against embedded data

**What Counts**:
- ✅ Customer search and matching
- ✅ Business discovery (Truth Layer searches)
- ✅ Document similarity searches
- ✅ AI-powered recommendations
- ✅ Duplicate detection queries

**What Doesn't Count**:
- ❌ Simple text/SQL searches
- ❌ Cached search results
- ❌ Failed search requests
- ❌ Health check searches

**Tracking Method**:
```typescript
// Track vector search operations
await recordUsage({
  tenantId,
  metric: 'vector_search',
  quantity: 1,
  metadata: {
    resultCount: results.length,
    queryVector: vectorQuery.length,
    similarityThreshold: 0.8
  }
})
```

**Pricing**:
- **Included**: 25,000 searches/month
- **Overage**: $0.50/1,000 searches
- **Billing**: Total search operations per month

---

### 4. Template Rendering
**Definition**: PDF and document generation for invoices, estimates, reports

**What Counts**:
- ✅ Invoice PDF generation
- ✅ Estimate PDF generation  
- ✅ Job report generation
- ✅ Custom form rendering
- ✅ Marketing material generation

**What Doesn't Count**:
- ❌ Email HTML templates
- ❌ Failed render attempts
- ❌ Preview/draft renders (not finalized)
- ❌ System report templates

**Tracking Method**:
```typescript
// Track document rendering
await recordUsage({
  tenantId,
  metric: 'template_render',
  quantity: 1,
  metadata: {
    templateType: 'invoice',
    outputFormat: 'pdf',
    pageCount: 2,
    fileSize: 245678
  }
})
```

**Pricing**:
- **Included**: 500 renders/month
- **Overage**: $0.25/render
- **Billing**: Total document renders per month

---

### 5. SMS Messages
**Definition**: Text messages sent to customers and staff

**What Counts**:
- ✅ Appointment confirmations
- ✅ Job status updates
- ✅ Payment reminders
- ✅ Emergency notifications
- ✅ Two-factor authentication codes

**What Doesn't Count**:
- ❌ Failed delivery attempts
- ❌ SMS received (inbound)
- ❌ System test messages
- ❌ Messages to Thorbis support

**Tracking Method**:
```typescript
// Track SMS delivery
await recordUsage({
  tenantId,
  metric: 'sms',
  quantity: 1,
  metadata: {
    provider: 'twilio',
    messageType: 'appointment_reminder',
    deliveryStatus: 'delivered',
    segments: 1
  }
})
```

**Pricing**:
- **Included**: 100 SMS/month
- **Overage**: $0.05/SMS
- **Billing**: Total SMS sent per month

---

### 6. Email Messages
**Definition**: Emails sent to customers, staff, and business contacts

**What Counts**:
- ✅ Invoice and estimate emails
- ✅ Appointment notifications
- ✅ Marketing campaigns
- ✅ System notifications
- ✅ Password reset emails

**What Doesn't Count**:
- ❌ Failed delivery attempts
- ❌ Emails received (inbound)
- ❌ System test emails
- ❌ Emails to Thorbis support

**Tracking Method**:
```typescript
// Track email delivery
await recordUsage({
  tenantId,
  metric: 'email',
  quantity: recipients.length,
  metadata: {
    provider: 'sendgrid',
    emailType: 'invoice',
    deliveryStatus: 'delivered',
    hasAttachments: true
  }
})
```

**Pricing**:
- **Included**: 2,500 emails/month
- **Overage**: $0.02/email
- **Billing**: Total emails sent per month

---

### 7. Storage Usage
**Definition**: Total data storage across all tenant resources

**What Counts**:
- ✅ Customer and business data
- ✅ Document and file storage
- ✅ Image and media storage
- ✅ Database storage (tables, indexes)
- ✅ Backup and archive storage

**What Doesn't Count**:
- ❌ System tables and metadata
- ❌ Temporary/cache storage
- ❌ Failed upload attempts
- ❌ Shared system resources

**Tracking Method**:
```sql
-- Daily storage calculation
INSERT INTO usage_metrics (tenant_id, metric_type, date, value)
SELECT 
  business_id,
  'storage_gb',
  CURRENT_DATE,
  SUM(storage_bytes) / (1024 * 1024 * 1024)::float
FROM tenant_storage_summary
WHERE date = CURRENT_DATE
GROUP BY business_id;
```

**Pricing**:
- **Included**: 25 GB/month
- **Overage**: $0.10/GB/month
- **Billing**: Peak storage usage per month

---

### 8. Webhook Deliveries
**Definition**: HTTP webhook calls delivered to external systems

**What Counts**:
- ✅ Truth Layer API webhooks
- ✅ Integration webhooks (QuickBooks, etc.)
- ✅ Customer notification webhooks
- ✅ Third-party system updates
- ✅ Retry attempts for failed deliveries

**What Doesn't Count**:
- ❌ Internal system events
- ❌ Health check webhooks
- ❌ Test webhook deliveries
- ❌ Webhooks from external systems to Thorbis

**Tracking Method**:
```typescript
// Track webhook delivery
await recordUsage({
  tenantId,
  metric: 'webhook_delivery',
  quantity: 1,
  metadata: {
    webhookType: 'booking.confirmed',
    endpoint: webhook.url,
    statusCode: response.status,
    retryAttempt: attempt,
    responseTime: responseTime
  }
})
```

**Pricing**:
- **Included**: 10,000 webhooks/month
- **Overage**: $0.01/webhook
- **Billing**: Total webhook deliveries per month

---

## 📈 Usage Aggregation Strategy

### Daily Collection
```sql
-- Collect daily usage metrics
CREATE TABLE usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES businesses(id),
  metric_type text NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one record per tenant per metric per day
  UNIQUE(tenant_id, metric_type, date)
);
```

### Monthly Aggregation
```sql
-- Monthly billing calculation
CREATE OR REPLACE VIEW monthly_usage AS
SELECT 
  tenant_id,
  metric_type,
  DATE_TRUNC('month', date) as billing_month,
  
  -- Different aggregation strategies per metric
  CASE 
    -- Peak usage metrics (storage)
    WHEN metric_type = 'storage_gb' THEN MAX(value)
    -- Sum metrics (everything else)  
    ELSE SUM(value)
  END as total_usage,
  
  COUNT(*) as days_active,
  MIN(date) as first_usage_date,
  MAX(date) as last_usage_date
  
FROM usage_metrics
GROUP BY tenant_id, metric_type, DATE_TRUNC('month', date);
```

### Real-time Tracking
```typescript
interface UsageTracker {
  // Record usage immediately
  recordUsage(params: {
    tenantId: string
    metric: MeterType
    quantity: number
    metadata?: Record<string, any>
    timestamp?: Date
  }): Promise<void>
  
  // Get current usage
  getCurrentUsage(tenantId: string, month?: string): Promise<UsageData>
  
  // Check if approaching limits
  checkUsageLimits(tenantId: string): Promise<UsageLimitStatus>
}
```

---

## 🔍 Usage Examples

### Customer Journey Usage
```typescript
// New customer created
await recordUsage({
  tenantId: 'business-123',
  metric: 'embeddings', 
  quantity: 3, // Name, address, preferences
  metadata: { source: 'customer_creation' }
})

// Invoice generated  
await recordUsage({
  tenantId: 'business-123',
  metric: 'template_render',
  quantity: 1,
  metadata: { 
    templateType: 'invoice',
    amount: 485.50,
    pageCount: 2
  }
})

// Email sent
await recordUsage({
  tenantId: 'business-123', 
  metric: 'email',
  quantity: 1,
  metadata: {
    type: 'invoice_delivery',
    hasAttachment: true
  }
})

// SMS confirmation
await recordUsage({
  tenantId: 'business-123',
  metric: 'sms', 
  quantity: 1,
  metadata: {
    type: 'payment_confirmation'
  }
})
```

### Search and AI Usage
```typescript
// Customer searches for "plumber near me"
await recordUsage({
  tenantId: 'business-123',
  metric: 'vector_search',
  quantity: 1,
  metadata: {
    searchType: 'business_discovery',
    results: 12
  }
})

// AI generates estimate
await recordUsage({
  tenantId: 'business-123',
  metric: 'embeddings',
  quantity: 5, // Job description, customer history, pricing context
  metadata: { source: 'estimate_generation' }
})
```

---

## 📊 Reporting and Analytics

### Usage Dashboard Data
```sql
-- Current month usage summary
SELECT 
  m.metric_type,
  m.total_usage,
  p.included_quantity,
  GREATEST(0, m.total_usage - p.included_quantity) as overage_quantity,
  GREATEST(0, m.total_usage - p.included_quantity) * p.overage_rate as overage_cost
FROM monthly_usage m
JOIN pricing_tiers p ON p.metric_type = m.metric_type
WHERE m.tenant_id = $1 
  AND m.billing_month = DATE_TRUNC('month', CURRENT_DATE);
```

### Usage Trends
```sql
-- 6-month usage trends
SELECT 
  billing_month,
  metric_type,
  total_usage,
  LAG(total_usage) OVER (
    PARTITION BY metric_type 
    ORDER BY billing_month
  ) as previous_month,
  total_usage - LAG(total_usage) OVER (
    PARTITION BY metric_type 
    ORDER BY billing_month  
  ) as month_over_month_change
FROM monthly_usage
WHERE tenant_id = $1
  AND billing_month >= CURRENT_DATE - INTERVAL '6 months'
ORDER BY billing_month DESC, metric_type;
```

---

## 🚨 Cost Optimization Tips

### For Businesses
1. **Monitor AAU Growth**: Track user adoption vs. business growth
2. **Optimize Embeddings**: Batch similar operations, cache when possible
3. **Efficient Searches**: Use filters to reduce vector search volume
4. **Template Reuse**: Design reusable templates to minimize renders
5. **Communication Strategy**: Balance SMS vs. email based on urgency
6. **Storage Management**: Regular cleanup of old files and documents
7. **Webhook Efficiency**: Batch notifications when possible

### For Developers
1. **Lazy Loading**: Only generate embeddings when needed
2. **Caching Strategy**: Cache search results and embeddings
3. **Batch Operations**: Group similar operations together  
4. **Efficient Queries**: Optimize vector search parameters
5. **Smart Triggers**: Only send notifications when necessary
6. **Compression**: Optimize file storage and transfer
7. **Error Handling**: Avoid retry storms on webhook failures

This metering strategy provides transparent, predictable billing while encouraging efficient usage patterns and supporting business growth.
