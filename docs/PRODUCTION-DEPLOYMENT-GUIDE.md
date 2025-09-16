# Thorbis Billing System - Production Deployment Guide

## Overview

This guide covers the complete production deployment of the Thorbis Billing System, including the monitoring infrastructure, database setup, and security configurations.

## Prerequisites

### Required Tools
- Node.js 20+
- npm 10+
- Supabase CLI
- Vercel CLI
- Docker & Docker Compose (for containerized deployment)
- Git

### Required Accounts & Services
- Supabase Project (Production)
- Stripe Account (Live keys)
- Vercel Account (for hosting)
- Email Service (SendGrid, Mailgun, etc.)
- Slack (for alerts, optional)
- Custom webhook endpoints (optional)

## Deployment Options

### Option 1: Automated Deployment Script

The quickest way to deploy is using our automated deployment script:

```bash
# Set required environment variables
export SUPABASE_PROJECT_ID="your-supabase-project-id"
export STRIPE_SECRET_KEY="sk_live_your_live_stripe_key"
export VERCEL_PROJECT_ID="your-vercel-project-id"

# Run deployment script
./scripts/deploy-billing-system.sh production
```

### Option 2: Manual Deployment

Follow these steps for manual deployment with full control:

#### 1. Environment Configuration

Create production environment file:

```bash
# Create production environment
cp .env.example .env.production

# Configure production variables
vim .env.production
```

Required production variables:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring Configuration
ENABLE_EMAIL_ALERTS=true
EMAIL_API_KEY=your-email-api-key
FROM_EMAIL=billing@thorbis.com
REPLY_TO_EMAIL=support@thorbis.com

ENABLE_SLACK_ALERTS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#billing-alerts

# Performance Settings
HEALTH_CHECK_INTERVAL=30000
```

#### 2. Database Deployment

Deploy database schema and apply migrations:

```bash
# Link to production Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# Push database migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > types/database.types.ts
```

#### 3. Application Build & Deployment

Build and deploy the application:

```bash
# Install production dependencies
npm ci --only=production

# Build the application
NODE_ENV=production npm run build

# Deploy to Vercel
vercel --prod
```

#### 4. Stripe Webhook Configuration

Configure Stripe webhooks in the Stripe Dashboard:

**Webhook Endpoint:** `https://thorbis.com/api/webhooks/stripe`

**Required Events:**
- `customer.created`
- `customer.updated`
- `customer.deleted`
- `invoice.created`
- `invoice.updated`
- `invoice.paid`
- `invoice.payment_failed`
- `subscription.created`
- `subscription.updated`
- `subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Option 3: Docker Deployment

For containerized deployment with full monitoring stack:

#### 1. Prepare Configuration

```bash
# Create production configuration directory
mkdir -p config/{nginx,grafana,prometheus}

# Copy sample configurations
cp docker-compose.billing.yml docker-compose.yml
```

#### 2. Configure Services

Create necessary configuration files:

**Nginx Configuration (`config/nginx/nginx.conf`):**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream billing-app {
        server billing-app:3000;
    }

    server {
        listen 80;
        server_name thorbis.com;
        
        location / {
            proxy_pass http://billing-app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/webhooks/stripe {
            proxy_pass http://billing-app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Increase body size for Stripe webhooks
            client_max_body_size 1M;
        }
    }
}
```

**Prometheus Configuration (`config/prometheus.yml`):**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'billing-app'
    static_configs:
      - targets: ['billing-app:3000']
    metrics_path: '/api/metrics'

  - job_name: 'billing-monitor'
    static_configs:
      - targets: ['billing-monitor:3000']
```

#### 3. Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f billing-app

# Check service status
docker-compose ps
```

## Post-Deployment Configuration

### 1. DNS Configuration

Configure DNS records for your domain:

```
A     @              your-server-ip
CNAME www            thorbis.com
CNAME api            thorbis.com
```

### 2. SSL Certificate Setup

For production, configure SSL certificates:

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d thorbis.com -d www.thorbis.com
```

### 3. Monitoring Setup

#### Access Monitoring Dashboards

- **Application:** https://thorbis.com
- **Billing Dashboard:** https://thorbis.com/billing
- **Grafana:** https://thorbis.com:3001 (admin/admin)
- **Prometheus:** https://thorbis.com:9090

#### Configure Grafana Dashboards

1. Import billing system dashboard
2. Set up alerts for critical metrics
3. Configure notification channels

### 4. Security Hardening

#### Application Security
```bash
# Enable security headers
export SECURITY_HEADERS=true

# Configure rate limiting
export RATE_LIMIT_ENABLED=true
export RATE_LIMIT_MAX_REQUESTS=100
export RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

#### Database Security
- Enable RLS policies
- Configure backup retention
- Set up read replicas
- Enable audit logging

#### API Security
- Rotate API keys regularly
- Implement IP whitelisting
- Enable webhook signature verification
- Monitor for unusual activity

## Monitoring & Alerting

### Health Checks

The system includes comprehensive health checks:

```bash
# Application health
curl https://thorbis.com/api/health

# Billing system health  
curl https://thorbis.com/api/health/billing

# Database connectivity
curl https://thorbis.com/api/health/database
```

### Alert Configuration

Configure alerts for critical events:

**Email Alerts:**
- Payment failures
- System errors
- Usage threshold breaches
- Subscription cancellations

**Slack Alerts:**
- Real-time billing events
- System health issues
- Anomaly detection

**Custom Webhooks:**
- Integration with external systems
- Custom notification workflows

### Monitoring Commands

```bash
# Check billing monitor status
npm run billing-monitor:health

# Generate system report
npm run billing-monitor:report

# Test alert system
npm run billing-monitor:test
```

## Backup & Recovery

### Database Backups

Configure automated backups:

```bash
# Daily backup script
#!/bin/bash
pg_dump -h your-db-host -U postgres thorbis > backups/thorbis-$(date +%Y%m%d).sql
aws s3 cp backups/ s3://your-backup-bucket/ --recursive
```

### Application Backups

- Code repository (Git)
- Environment configurations
- SSL certificates
- Monitoring configurations

### Recovery Procedures

Document recovery procedures for:
- Database corruption
- Application failures
- Security incidents
- Data migration

## Performance Optimization

### Database Optimization

```sql
-- Enable connection pooling
SHOW max_connections;

-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_billing_performance ON shared.api_usage_logs(organization_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM shared.stripe_subscriptions WHERE status = 'active';
```

### Application Optimization

```bash
# Enable production optimizations
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Configure caching
export REDIS_URL=redis://localhost:6379
export CACHE_TTL=300
```

### CDN Configuration

Configure CDN for static assets:
- Enable gzip compression
- Set appropriate cache headers
- Configure edge locations
- Monitor cache hit rates

## Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Session management with Redis
- Database read replicas
- Container orchestration

### Vertical Scaling

- Monitor resource usage
- Optimize database queries
- Implement caching layers
- Review alert thresholds

## Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Verify environment variables
env | grep -E "(STRIPE|SUPABASE)"

# Test database connectivity
psql -h your-db-host -U postgres -d thorbis -c "SELECT 1;"
```

#### Billing System Issues
```bash
# Check Stripe connectivity
node -e "
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.accounts.retrieve().then(console.log).catch(console.error);
"

# Verify webhook configuration
curl -X POST https://thorbis.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

#### Monitoring Issues
```bash
# Check monitor logs
docker-compose logs billing-monitor

# Test alert system
npm run billing-monitor:test

# Verify notification channels
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
export DEBUG=billing:*
export LOG_LEVEL=debug
npm run billing-monitor
```

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Review system health
- Check for new alerts
- Monitor resource usage

**Weekly:**
- Review billing reports
- Update dependencies
- Check security alerts

**Monthly:**
- Review and rotate API keys
- Update system documentation
- Performance optimization review

**Quarterly:**
- Security audit
- Disaster recovery testing
- System architecture review

### Update Procedures

```bash
# Update dependencies
npm audit
npm update

# Update database schema
supabase db push

# Deploy updates
./scripts/deploy-billing-system.sh production
```

## Support & Documentation

### Getting Help

For production issues:

1. Check system health: `npm run billing-monitor:health`
2. Review application logs
3. Check monitoring dashboards
4. Contact support with diagnostic information

### Documentation

- [Billing Monitoring Guide](./BILLING-MONITORING-GUIDE.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [Security Guide](./SECURITY-GUIDE.md)

### Emergency Contacts

- **Development Team:** dev@thorbis.com
- **Infrastructure Team:** infra@thorbis.com
- **On-call Support:** +1-XXX-XXX-XXXX

---

## Conclusion

This guide provides comprehensive instructions for deploying the Thorbis Billing System to production. Follow the security and monitoring guidelines carefully to ensure a robust, scalable deployment.

For questions or issues, refer to the troubleshooting section or contact the development team.