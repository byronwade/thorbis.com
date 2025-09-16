# Thorbis Billing Monitoring System

## Overview

The Thorbis Billing Monitoring System provides comprehensive real-time monitoring, alerting, and analytics for the billing infrastructure. It tracks API usage, monitors subscription health, detects anomalies, and sends intelligent alerts through multiple channels.

## Architecture

### Components

1. **BillingMonitor** - Core monitoring engine
2. **AlertManager** - Alert routing and notification orchestration
3. **Alert Handlers** - Channel-specific notification handlers
4. **Database Schema** - Persistent storage for alerts and metrics

### Key Features

- **Real-time Usage Tracking** - Monitor API calls, data exports, and AI requests
- **Intelligent Alerting** - Smart threshold-based alerts with deduplication
- **Multi-channel Notifications** - Email, Slack, webhooks, and console logging
- **Anomaly Detection** - Automatic detection of unusual usage patterns
- **Health Monitoring** - System-wide health checks and uptime tracking
- **Usage Analytics** - Comprehensive usage reporting and trend analysis

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Configure required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Notification Configuration
ENABLE_EMAIL_ALERTS=true
EMAIL_API_KEY=your_email_service_api_key
FROM_EMAIL=billing@thorbis.com

ENABLE_SLACK_ALERTS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#billing-alerts
```

### 2. Database Migration

Apply the billing monitoring schema:

```bash
# Apply the billing alerts migration
psql -d your_database -f supabase/migrations/20250131000004_billing_alerts_schema.sql
```

### 3. Start Monitoring

```bash
# Start the billing monitor
npm run billing-monitor

# Or run specific commands
npm run billing-monitor:health   # Check system health
npm run billing-monitor:report   # Generate system report
npm run billing-monitor:test     # Test alert system
```

## Configuration

### Notification Channels

#### Email Alerts
Configure email notifications for billing alerts:

```typescript
const emailConfig = {
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: 'billing@thorbis.com',
  replyTo: 'support@thorbis.com'
};
```

#### Slack Integration
Set up Slack webhook for team notifications:

```typescript
const slackConfig = {
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  channel: '#billing-alerts'
};
```

#### Custom Webhooks
Configure custom webhook endpoints:

```env
CUSTOM_WEBHOOKS=https://api.yourapp.com/webhooks/billing,https://api.another.com/alerts
```

### Alert Thresholds

The system uses configurable thresholds:

- **Usage Warning**: 80% of quota
- **Usage Critical**: 95% of quota
- **Cost Spike**: 150% increase from previous period
- **Health Check**: Every 30 seconds
- **Webhook Timeout**: 5 minutes

## Alert Types

### Usage Threshold Alerts
Triggered when API usage approaches or exceeds quota limits.

```json
{
  "type": "usage_threshold",
  "severity": "medium",
  "title": "API Usage Warning",
  "message": "API usage at 85% of quota. Consider upgrading your plan.",
  "data": {
    "usage": { "current": 4250, "quota": 5000, "percentage": 85 }
  }
}
```

### Overage Detection
Alerts when usage exceeds subscription limits.

```json
{
  "type": "overage_detected",
  "severity": "high",
  "title": "API Overage Detected",
  "message": "250 API calls over quota. Additional charges apply.",
  "data": { "overage": 250 }
}
```

### Payment Failures
Notifications for failed payment attempts.

```json
{
  "type": "payment_failed",
  "severity": "critical",
  "title": "Payment Failed",
  "message": "Monthly subscription payment failed. Please update payment method.",
  "actionRequired": true
}
```

### System Health
Monitoring system connectivity and health.

```json
{
  "type": "system_error",
  "severity": "critical",
  "title": "Billing System Critical Error",
  "message": "Stripe connectivity lost. Billing operations may be impacted.",
  "actionRequired": true
}
```

## API Reference

### BillingMonitor Class

```typescript
import { BillingMonitor } from '@thorbis/billing';

const monitor = new BillingMonitor({
  supabaseUrl: 'your_supabase_url',
  supabaseServiceKey: 'your_service_key',
  stripeWrapper: stripeInstance
});

// Start monitoring
monitor.startMonitoring();

// Get health status
const health = await monitor.getBillingHealth();

// Get usage metrics
const metrics = await monitor.getUsageMetrics('org-id');

// Get active alerts
const alerts = await monitor.getActiveAlerts('org-id');

// Generate usage report
const report = await monitor.generateUsageReport(
  'org-id',
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

### Alert Management

```typescript
import { AlertManager } from '@thorbis/billing';

const alertManager = new AlertManager({
  email: { /* email config */ },
  slack: { /* slack config */ },
  webhooks: ['https://api.example.com/alerts']
});

// Handle alerts
monitor.onAlert((alert) => {
  alertManager.handleAlert(alert);
});

// Resolve alerts
await monitor.resolveAlert('alert-id', 'Resolved by admin');
```

## Database Functions

### Health Score Calculation
```sql
SELECT * FROM shared.calculate_billing_health_score('org-id');
```

### Anomaly Detection
```sql
SELECT * FROM shared.detect_usage_anomalies(24, 2.0); -- 24 hours, 2x threshold
```

### Dashboard Metrics
```sql
SELECT * FROM shared.get_billing_dashboard_metrics('org-id');
```

### Auto-resolve Stale Alerts
```sql
SELECT shared.auto_resolve_stale_alerts(); -- Returns count of resolved alerts
```

## Monitoring Dashboard

The system includes a comprehensive monitoring dashboard available at `/billing` in your application.

### Dashboard Features

- **Real-time Usage Metrics** - Current API usage, costs, and trends
- **Alert Management** - View, filter, and resolve active alerts
- **Usage Analytics** - Historical usage charts and breakdowns
- **Subscription Management** - Current plan details and upgrade options
- **Health Status** - System connectivity and uptime metrics

### Usage Reports

Generate detailed usage reports with:

- Daily usage breakdowns
- Cost analysis and trends
- Usage recommendations
- Compliance metrics

## Troubleshooting

### Common Issues

#### Monitor Won't Start
```bash
# Check environment variables
npm run billing-monitor:health

# Verify database connectivity
psql -d your_database -c "SELECT 1;"

# Test Stripe connectivity
node -e "
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.accounts.retrieve().then(console.log).catch(console.error);
"
```

#### Alerts Not Sending
```bash
# Test alert system
npm run billing-monitor:test

# Check notification configuration
echo $SLACK_WEBHOOK_URL
echo $EMAIL_API_KEY
```

#### Database Errors
```sql
-- Check for missing tables
SELECT tablename FROM pg_tables WHERE schemaname = 'shared' AND tablename LIKE 'billing%';

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename LIKE 'billing%';
```

### Logs and Debugging

The monitoring system provides detailed logging:

```bash
# Start with debug logging
DEBUG=billing:* npm run billing-monitor

# View system health
npm run billing-monitor:health

# Generate diagnostic report
npm run billing-monitor:report
```

## Production Deployment

### Environment Variables
Set production environment variables:

```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_your_live_key
ENABLE_EMAIL_ALERTS=true
EMAIL_API_KEY=your_production_email_key
SLACK_WEBHOOK_URL=your_production_slack_webhook
HEALTH_CHECK_INTERVAL=30000
```

### Process Management
Use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start monitoring
pm2 start "npm run billing-monitor" --name "billing-monitor"

# Monitor logs
pm2 logs billing-monitor

# Restart on file changes
pm2 restart billing-monitor
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "billing-monitor"]
```

### Health Checks
Configure health check endpoints:

```bash
# Health check endpoint
curl http://localhost:3000/api/health/billing

# Metrics endpoint
curl http://localhost:3000/api/metrics/billing
```

## Security Considerations

### API Keys
- Store sensitive keys in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Monitor for leaked keys

### Database Security
- Use row-level security (RLS) policies
- Limit database access with service roles
- Encrypt sensitive data at rest
- Regular security audits

### Webhook Security
- Validate webhook signatures
- Use HTTPS for all webhook endpoints
- Implement retry logic with exponential backoff
- Monitor webhook delivery success rates

## Performance Optimization

### Database Indexes
The system includes optimized indexes:

```sql
-- Usage logs index for time-series queries
CREATE INDEX CONCURRENTLY idx_api_usage_logs_org_time ON shared.api_usage_logs(organization_id, created_at DESC);

-- Alerts index for dashboard queries  
CREATE INDEX CONCURRENTLY idx_billing_alerts_unresolved ON shared.billing_alerts(organization_id) WHERE resolved_at IS NULL;
```

### Caching Strategy
- Cache health status for 30 seconds
- Cache usage metrics for 5 minutes
- Cache alert counts for 1 minute
- Use Redis for high-traffic scenarios

### Monitoring Performance
- Track database query performance
- Monitor memory usage and CPU
- Set up alerting for system resource usage
- Use connection pooling for database connections

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review active alerts and resolve stale ones
2. **Monthly**: Analyze usage trends and adjust thresholds
3. **Quarterly**: Review and update alert configurations
4. **Annually**: Security audit and key rotation

### Backup and Recovery

- Database backups include all billing and alert data
- Configuration backups for notification settings
- Test disaster recovery procedures regularly
- Document rollback procedures

### Getting Help

For issues with the billing monitoring system:

1. Check the troubleshooting section above
2. Review system logs and error messages
3. Run diagnostic commands: `npm run billing-monitor:health`
4. Contact support with diagnostic report output

---

**Next Steps:**

After setting up the monitoring system, consider:

1. Setting up custom alert rules for your specific needs
2. Integrating with your existing monitoring infrastructure
3. Creating custom dashboards for stakeholders
4. Implementing automated responses to common alerts