# Thorbis Business OS - Observability Configuration

Comprehensive observability, monitoring, and audit export system for the Thorbis Business OS platform.

## 📁 Configuration Files

### Core Observability
- **`slos.md`** - Service Level Objectives with 99.9% API availability, p95 tool latency <700ms, p99 template <3s, MTTR <2h
- **`dashboards.json`** - Grafana dashboard configurations with real metric names for API performance, tool latency, AI costs, cache hit rates, and infrastructure health  
- **`alerts.yaml`** - Prometheus alerting rules with runbooks for rate spikes, webhook failures, schema drift, and budget exhaustion
- **`audit-export-spec.md`** - Cryptographically signed CSV/JSON export specification with event hash chains

### Supporting Documentation
- **`README.md`** - This implementation guide

## 🎯 Service Level Objectives

### Production SLOs
| Metric | Target | Measurement | Error Budget |
|--------|--------|-------------|--------------|
| **API Availability** | 99.9% | 30 days | 43.2 min/month |
| **Tool Latency (p95)** | <700ms | 24 hours | 5% violations |
| **Template Generation (p99)** | <3s | 24 hours | 1% violations |
| **Mean Time To Recovery** | <2h | Per incident | N/A |

### SLO Monitoring Queries

```promql
# API Availability
(sum(rate(thorbis_http_requests_total[5m])) - 
 sum(rate(thorbis_http_requests_total{code=~"5.."}[5m]))) /
sum(rate(thorbis_http_requests_total[5m]))

# Tool Latency p95  
histogram_quantile(0.95,
  sum(rate(thorbis_tool_execution_duration_seconds_bucket[5m])) by (le)
) * 1000

# Template Generation p99
histogram_quantile(0.99,
  sum(rate(thorbis_template_generation_duration_seconds_bucket[5m])) by (le)
) * 1000
```

## 📊 Dashboard Overview

### 6 Production Dashboards

1. **Platform Overview** - SLO status, API metrics, overall health
2. **Tools Performance** - Per-tool latency, errors, success rates
3. **AI & Token Usage** - Token spend, model usage, efficiency metrics
4. **Caching Performance** - Hit rates, latency, memory usage by cache type
5. **Infrastructure Health** - Database, queues, webhook delivery
6. **Business Metrics** - Active tenants, usage patterns, billing alerts

### Key Metrics Referenced

```typescript
// Real metric names used in dashboards
const METRICS = {
  // API Performance
  'thorbis_http_requests_total': 'HTTP request counter',
  'thorbis_http_request_duration_seconds': 'Request latency histogram',
  
  // Tool Performance
  'thorbis_tool_execution_duration_seconds': 'Tool execution time',
  'thorbis_tool_execution_errors_total': 'Tool error counter',
  
  // AI & Costs
  'thorbis_ai_tokens_consumed_total': 'AI tokens used',
  'thorbis_ai_cost_usd_total': 'AI costs in USD',
  
  // Caching
  'thorbis_cache_hits_total': 'Cache hit counter',
  'thorbis_cache_misses_total': 'Cache miss counter',
  
  // Infrastructure  
  'thorbis_db_connections_active': 'Active DB connections',
  'thorbis_template_queue_size': 'Template generation queue'
}
```

## 🚨 Alerting Rules

### 4 Alert Categories with Runbooks

#### 1. API Availability & Performance
- **SLO Breach**: API availability <99.9% → Critical escalation
- **High Latency**: p95 >1000ms → Warning with optimization steps
- **Tool Latency SLO**: p95 >700ms → Investigation runbook

#### 2. Rate Spikes & Traffic
- **Traffic Spike High**: 3x normal rate → Auto-scaling actions
- **Traffic Spike Critical**: 10x normal rate → DDoS protection

#### 3. Webhook Failures
- **High Failure Rate**: >10% failures → Retry queue analysis
- **Delivery Stalled**: No deliveries + queue >10 → Service restart

#### 4. Schema Drift & Security
- **Version Mismatch**: Multiple schema versions → Migration rollback
- **Unauthorized Changes**: Schema changes outside maintenance → Security lockdown

### Runbook Example
```bash
# API Availability Breach - Immediate Actions
1. Check service health:
   curl -s https://api.thorbis.com/health | jq .

2. Check error rates:
   kubectl logs -n thorbis-production deployment/thorbis-api --tail=100 | grep ERROR

3. Rollback if needed:
   kubectl rollout undo deployment/thorbis-api -n thorbis-production
```

## 🔐 Audit Export System

### Cryptographic Integrity
- **Event Hashing**: SHA-256 chain with previous event hash
- **File Signing**: RSASSA-PSS signatures for tamper detection  
- **Chain Verification**: Complete audit trail validation

### Export Formats
```typescript
// CSV Export
id,timestamp,tenant_id,user_id,action,resource_type,content_hash,chain_hash,signature

// JSON Export with Metadata
{
  "export_metadata": {
    "tenant_id": "biz_123",
    "generated_at": "2024-02-15T14:30:00.000Z",
    "total_events": 15847,
    "file_hash": "a1b2c3d4...",
    "signature": "9f8e7d6c..."
  },
  "events": [...],
  "integrity_verification": {
    "chain_start_hash": "0000...",
    "chain_end_hash": "6e5d...",
    "verification_passed": true
  }
}
```

### Integrity Verification
```bash
# Verify export file
node scripts/verify-export.js \
  --file="audit-export.json" \
  --signature="export.sig" \
  --public-key="thorbis-public.pem"

# Output
✅ File Hash Valid
✅ Signature Valid  
✅ Chain Valid
✅ Overall Valid: 15,847 events verified
```

## 🛠️ Implementation Guide

### 1. Prometheus Metrics Setup

```typescript
// Instrument API endpoints
const httpRequestDuration = new prometheus.Histogram({
  name: 'thorbis_http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'endpoint', 'status', 'tenant_id'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
})

// Tool execution metrics
const toolExecutionDuration = new prometheus.Histogram({
  name: 'thorbis_tool_execution_duration_seconds', 
  help: 'Tool execution duration',
  labelNames: ['tool_name', 'tenant_id'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30]
})

// AI cost tracking
const aiCostTotal = new prometheus.Counter({
  name: 'thorbis_ai_cost_usd_total',
  help: 'Total AI cost in USD',
  labelNames: ['model_name', 'service_name', 'tenant_id']
})
```

### 2. Dashboard Deployment

```bash
# Deploy Grafana dashboards
kubectl create configmap thorbis-dashboards \
  --from-file=dashboards.json \
  -n monitoring

# Update Grafana deployment
kubectl patch deployment grafana \
  -p '{"spec":{"template":{"metadata":{"annotations":{"dashboards/reload":"$(date +%s)"}}}}}'
```

### 3. Alert Rules Deployment

```bash
# Deploy Prometheus rules
kubectl apply -f alerts.yaml

# Verify rules loaded
kubectl exec -n monitoring prometheus-0 -- \
  promtool query instant 'ALERTS{alertname="ThorbisSLOAPIAvailabilityBreach"}'
```

### 4. Audit Export Service

```typescript
// Express.js audit export service
app.post('/api/audit/exports', async (req, res) => {
  const exportJob = await createExportJob({
    tenant_id: req.body.tenant_id,
    format: req.body.format, // 'csv' | 'json'
    period: req.body.period,
    filters: req.body.filters
  })
  
  await queueExportJob(exportJob)
  
  res.json({
    export_id: exportJob.id,
    download_url: `/api/audit/exports/${exportJob.id}/download`,
    status_url: `/api/audit/exports/${exportJob.id}/status`
  })
})
```

## 📈 Monitoring Best Practices

### SLO Error Budget Management
- **Green (0-25% consumed)**: Full development velocity
- **Yellow (25-75% consumed)**: Freeze risky deployments  
- **Red (75-100% consumed)**: Emergency fixes only
- **Exhausted (>100%)**: All feature work stops

### Alert Fatigue Prevention
- **Severity Levels**: Critical (PagerDuty) → Warning (Slack) → Info (Email)
- **Smart Grouping**: Group by service + severity, not individual alerts
- **Escalation Paths**: Auto-escalate unacknowledged critical alerts

### Performance Optimization
- **Cache First**: Monitor cache hit rates >90% for performance-critical paths
- **Query Optimization**: Alert on slow database queries >1s p95
- **Resource Scaling**: Auto-scale based on CPU >70% and memory >80%

## 🔍 Troubleshooting

### Common Issues

**High API Latency**
```bash
# Check slowest endpoints
kubectl exec prometheus-0 -- promtool query instant \
  'topk(5, histogram_quantile(0.95, sum(rate(thorbis_http_request_duration_seconds_bucket[5m])) by (le, endpoint)) * 1000)'

# Scale if needed
kubectl scale deployment/thorbis-api --replicas=8
```

**Missing Metrics**
```bash
# Check metric ingestion
kubectl logs -n monitoring prometheus-0 | grep thorbis

# Verify service discovery
kubectl get servicemonitors -n thorbis-production
```

**Alert Not Firing**
```bash
# Test alert expression
kubectl exec prometheus-0 -- promtool query instant \
  'sum(rate(thorbis_http_requests_total{code=~"5.."}[5m])) / sum(rate(thorbis_http_requests_total[5m])) * 100'

# Check alerting rules
kubectl exec prometheus-0 -- promtool rules test alerts.yaml
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] Metrics instrumentation added to all services
- [ ] Dashboard JSON files validated with Grafana API
- [ ] Alert rules tested with promtool
- [ ] Audit export API endpoints implemented
- [ ] Cryptographic signing keys generated and secured

### Post-Deployment  
- [ ] SLO dashboards show realistic data
- [ ] Test alerts fire correctly with sample conditions
- [ ] Audit export generates valid signed files
- [ ] Export integrity verification works end-to-end
- [ ] On-call runbooks tested with actual scenarios

### Ongoing Operations
- [ ] Weekly SLO review meetings scheduled
- [ ] Error budget burn rate monitoring automated
- [ ] Audit export retention policies configured  
- [ ] Alert escalation paths documented and tested
- [ ] Performance optimization recommendations tracked

This comprehensive observability system provides production-ready monitoring, alerting, and audit capabilities for the Thorbis Business OS platform.
