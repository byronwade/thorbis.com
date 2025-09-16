# Thorbis Business OS - Service Level Objectives (SLOs)

Comprehensive Service Level Objectives for the Thorbis Business OS platform to ensure reliable, performant service delivery.

## 📊 SLO Overview

| SLO | Target | Measurement Window | Error Budget |
|-----|--------|-------------------|--------------|
| **API Availability** | 99.9% | 30 days | 43.2 minutes |
| **Tool Latency (p95)** | <700ms | 24 hours | 5% of requests |
| **Template Generation (p99)** | <3s | 24 hours | 1% of requests |
| **Mean Time To Recovery** | <2h | Per incident | N/A |

## 🎯 Detailed SLO Specifications

### 1. API Availability SLO

**Objective**: 99.9% uptime for all customer-facing APIs over a 30-day period

```yaml
slo_name: "api_availability"
target: 0.999
measurement_window: "30d"
error_budget: "43.2_minutes_per_month"

service_level_indicator:
  type: "availability"
  definition: |
    Success Rate = (Total Requests - Error Requests) / Total Requests
    Where Error Requests = HTTP 5xx responses OR request timeout >30s

measurement_query: |
  sum(rate(thorbis_http_requests_total{job="thorbis-api"}[5m])) -
  sum(rate(thorbis_http_requests_total{job="thorbis-api", code=~"5.."}[5m])) -
  sum(rate(thorbis_http_request_timeouts_total{job="thorbis-api"}[5m]))
  /
  sum(rate(thorbis_http_requests_total{job="thorbis-api"}[5m]))

included_endpoints:
  - "/api/businesses/*"
  - "/api/availability/*" 
  - "/api/price-bands/*"
  - "/api/reviews/*"
  - "/api/bookings/*"
  - "/api/estimates/*"
  - "/api/payments/*"
  - "/api/tools/*"
  - "/api/webhooks/*"

excluded_endpoints:
  - "/api/health"
  - "/api/metrics"
  - "/api/debug/*"
  - "/api/admin/*"

error_conditions:
  - "HTTP 5xx responses"
  - "Request timeouts >30 seconds"
  - "DNS resolution failures"
  - "Connection refused errors"
  - "Circuit breaker open state"

acceptable_downtime:
  - "Planned maintenance windows (max 30min/month)"
  - "Third-party service outages (Supabase, Stripe)"
  - "Force majeure events"
```

#### Error Budget Policy
- **Green (0-25% consumed)**: All changes allowed, focus on feature velocity
- **Yellow (25-75% consumed)**: Freeze risky deployments, focus on reliability
- **Red (75-100% consumed)**: Emergency fixes only, postmortem required
- **Exhausted (>100%)**: All feature work stops until SLO is restored

### 2. Tool Latency SLO (p95)

**Objective**: 95% of AI tool calls complete within 700ms over a 24-hour period

```yaml
slo_name: "tool_latency_p95"
target: 700 # milliseconds
measurement_window: "24h"
percentile: 95

service_level_indicator:
  type: "latency"
  definition: |
    95th percentile of tool execution time from request to response
    
measurement_query: |
  histogram_quantile(0.95,
    sum(rate(thorbis_tool_execution_duration_seconds_bucket{job="thorbis-tools"}[5m]))
    by (le, tool_name)
  ) * 1000

included_tools:
  - "ping"
  - "whoAmI"
  - "getCapabilities"
  - "searchEntities"
  - "vectorSearch"
  - "getEntityById"
  - "createEstimate"
  - "generateInvoice"
  - "sendNotification"

performance_tiers:
  fast_tools: # <200ms p95
    - "ping"
    - "whoAmI"
    - "getCapabilities"
  
  medium_tools: # <500ms p95
    - "searchEntities"
    - "getEntityById"
    - "sendNotification"
  
  heavy_tools: # <700ms p95
    - "vectorSearch"
    - "createEstimate"
    - "generateInvoice"

latency_breakdown:
  - "Request parsing: <10ms"
  - "Authentication: <50ms"
  - "Database queries: <200ms"
  - "AI/ML processing: <300ms"
  - "Response serialization: <20ms"
  - "Network overhead: <120ms"
```

#### Performance Budget
- **Fast Path (p50)**: <200ms for 50% of requests
- **Normal Path (p95)**: <700ms for 95% of requests  
- **Slow Path (p99)**: <2s for 99% of requests
- **Timeout Threshold**: 10s hard timeout

### 3. Template Generation SLO (p99)

**Objective**: 99% of template generations complete within 3 seconds over a 24-hour period

```yaml
slo_name: "template_generation_p99"
target: 3000 # milliseconds
measurement_window: "24h"
percentile: 99

service_level_indicator:
  type: "latency"
  definition: |
    99th percentile of template generation time from request to PDF delivery
    
measurement_query: |
  histogram_quantile(0.99,
    sum(rate(template_generation_duration_seconds_bucket{job="thorbis-templates"}[5m]))
    by (le, template_type)
  ) * 1000

template_types:
  simple_templates: # <1s p99
    - "receipt"
    - "quote_simple"
    - "work_order"
  
  standard_templates: # <2s p99  
    - "invoice"
    - "estimate"
    - "contract_basic"
  
  complex_templates: # <3s p99
    - "detailed_report"
    - "compliance_document" 
    - "multi_page_contract"

generation_stages:
  - "Template selection: <100ms"
  - "Data fetching: <300ms"
  - "Variable substitution: <200ms"  
  - "PDF rendering: <2000ms"
  - "Storage upload: <300ms"
  - "Delivery: <100ms"

optimization_strategies:
  - "Template caching (24h TTL)"
  - "Image pre-processing"
  - "Parallel data fetching"
  - "PDF streaming for large documents"
  - "CDN delivery for generated files"
```

#### Template Performance Tiers
- **Tier 1 (Simple)**: 1-2 pages, minimal graphics, <1s p99
- **Tier 2 (Standard)**: 2-5 pages, standard formatting, <2s p99  
- **Tier 3 (Complex)**: 5+ pages, charts/images, <3s p99
- **Emergency Tier**: Critical templates (invoices) get priority queue

### 4. Mean Time To Recovery (MTTR) SLO

**Objective**: Restore service within 2 hours for any production incident

```yaml
slo_name: "mean_time_to_recovery"
target: 120 # minutes
measurement_window: "per_incident"

service_level_indicator:
  type: "recovery_time"
  definition: |
    Time from incident detection to service restoration
    MTTR = Total Recovery Time / Number of Incidents
    
measurement_method: "manual_tracking"
incident_lifecycle:
  - "Detection: Automated alert or customer report"
  - "Acknowledgment: On-call engineer responds <15min"
  - "Investigation: Root cause analysis begins"
  - "Mitigation: Immediate fix or workaround deployed"
  - "Resolution: Full service restoration confirmed"
  - "Postmortem: Incident review within 48h"

incident_severity_levels:
  p0_critical: # <30min recovery
    description: "Complete service outage or data loss"
    examples:
      - "API completely down"
      - "Database corruption"
      - "Security breach"
    escalation: "Immediate CEO notification"
    
  p1_high: # <2h recovery
    description: "Major feature degradation"
    examples:
      - "Template generation failing"
      - "Payment processing errors"
      - "Webhook delivery failures"
    escalation: "Engineering manager notification"
    
  p2_medium: # <8h recovery
    description: "Minor feature issues"
    examples:
      - "Search performance degraded"
      - "Non-critical API errors"
      - "Dashboard display issues"
    escalation: "Team lead notification"
    
  p3_low: # <24h recovery
    description: "Cosmetic or edge case issues"
    examples:
      - "UI inconsistencies"
      - "Documentation errors"
      - "Minor performance regressions"
    escalation: "Normal development workflow"

recovery_strategies:
  immediate_actions:
    - "Rollback to last known good deployment"
    - "Enable circuit breakers"
    - "Scale up infrastructure"
    - "Activate backup systems"
    
  investigation_tools:
    - "Real-time metrics dashboards"
    - "Distributed tracing"
    - "Log aggregation and search"
    - "Database performance monitoring"
    
  communication_plan:
    - "Status page updates within 5min"
    - "Customer notifications for >30min outages"
    - "Internal Slack alerts"
    - "Postmortem sharing within 48h"
```

## 📈 SLO Measurement & Reporting

### Data Collection

```typescript
// SLO measurement implementation
interface SLOMeasurement {
  sloName: string
  timestamp: Date
  value: number
  target: number
  errorBudget: number
  errorBudgetRemaining: number
  status: 'healthy' | 'warning' | 'critical'
}

// API Availability calculation
async function measureAPIAvailability(timeWindow: string): Promise<SLOMeasurement> {
  const query = `
    (
      sum(rate(http_requests_total{job="thorbis-api"}[${timeWindow}])) -
      sum(rate(http_requests_total{job="thorbis-api", code=~"5.."}[${timeWindow}])) -
      sum(rate(http_request_timeouts_total{job="thorbis-api"}[${timeWindow}]))
    ) / sum(rate(http_requests_total{job="thorbis-api"}[${timeWindow}]))
  `
  
  const availability = await prometheus.query(query)
  const errorBudget = 1 - 0.999 // 0.1% error budget
  const errorBudgetUsed = 1 - availability
  
  return {
    sloName: 'api_availability',
    timestamp: new Date(),
    value: availability,
    target: 0.999,
    errorBudget: errorBudget,
    errorBudgetRemaining: errorBudget - errorBudgetUsed,
    status: availability >= 0.999 ? 'healthy' : 
            availability >= 0.995 ? 'warning' : 'critical'
  }
}

// Tool latency p95 calculation
async function measureToolLatency(): Promise<SLOMeasurement> {
  const query = `
    histogram_quantile(0.95,
      sum(rate(tool_execution_duration_seconds_bucket{job="thorbis-tools"}[24h]))
      by (le)
    ) * 1000
  `
  
  const p95Latency = await prometheus.query(query)
  
  return {
    sloName: 'tool_latency_p95',
    timestamp: new Date(),
    value: p95Latency,
    target: 700,
    errorBudget: 0.05, // 5% of requests can exceed
    errorBudgetRemaining: calculateLatencyErrorBudget(p95Latency),
    status: p95Latency <= 700 ? 'healthy' : 
            p95Latency <= 1000 ? 'warning' : 'critical'
  }
}
```

### SLO Dashboard

```json
{
  "slo_dashboard": {
    "title": "Thorbis SLO Overview",
    "refresh": "30s",
    "panels": [
      {
        "title": "SLO Status Summary",
        "type": "stat",
        "targets": [
          {
            "expr": "slo_status{slo_name='api_availability'}",
            "legendFormat": "API Availability"
          },
          {
            "expr": "slo_status{slo_name='tool_latency_p95'}",
            "legendFormat": "Tool Latency"
          },
          {
            "expr": "slo_status{slo_name='template_generation_p99'}",
            "legendFormat": "Template Generation"
          }
        ],
        "fieldConfig": {
          "thresholds": [
            {"color": "red", "value": 0},
            {"color": "yellow", "value": 0.95},
            {"color": "green", "value": 0.999}
          ]
        }
      },
      {
        "title": "Error Budget Burn Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "slo_error_budget_remaining{slo_name='api_availability'}",
            "legendFormat": "API Error Budget"
          }
        ]
      }
    ]
  }
}
```

## 🚨 SLO Violation Response

### Immediate Actions

**API Availability Below 99.9%**
1. **Alert**: Immediate PagerDuty notification
2. **Check**: Service health endpoints and infrastructure
3. **Action**: Enable circuit breakers, scale resources
4. **Communicate**: Status page update within 5 minutes

**Tool Latency p95 Above 700ms**
1. **Alert**: Slack notification to engineering team
2. **Check**: Database performance and AI service status  
3. **Action**: Enable caching, review slow queries
4. **Optimize**: Analyze tool performance patterns

**Template Generation p99 Above 3s**
1. **Alert**: Template team notification
2. **Check**: PDF rendering service and storage
3. **Action**: Clear render queue, check template complexity
4. **Scale**: Add additional rendering workers

### Escalation Matrix

```yaml
escalation_paths:
  api_availability:
    level_1: "On-call SRE (immediate)"
    level_2: "Engineering Manager (15min)"
    level_3: "CTO (30min)"
    level_4: "CEO (1h for P0 incidents)"
    
  performance_degradation:
    level_1: "Performance Team Lead (15min)"
    level_2: "Engineering Manager (1h)"
    level_3: "CTO (4h for sustained issues)"
    
  recovery_time_exceeded:
    level_1: "Incident Commander (immediate)"
    level_2: "Engineering Director (30min)"
    level_3: "All-hands incident response (2h)"
```

## 📊 SLO Reporting

### Weekly SLO Report
```typescript
interface WeeklySLOReport {
  week: string
  slos: {
    apiAvailability: {
      achievement: number      // 99.95%
      errorBudgetUsed: number // 50%
      incidents: number       // 2
      downtimeMinutes: number // 21.6
    }
    toolLatency: {
      p95Achievement: number  // 650ms
      violationRate: number   // 2%
      slowestTool: string     // "vectorSearch"
    }
    templateGeneration: {
      p99Achievement: number  // 2.8s
      violationRate: number   // 0.5%
      averageSize: string     // "2.3MB"
    }
    mttr: {
      averageMinutes: number  // 95min
      incidents: number       // 3
      fastest: number         // 35min
      slowest: number         // 140min
    }
  }
  trends: {
    improving: string[]       // ["toolLatency"]
    degrading: string[]       // ["templateGeneration"]
    stable: string[]          // ["apiAvailability", "mttr"]
  }
  recommendations: string[]   // Action items
}
```

### Monthly Business Review
- **SLO Achievement**: Overall platform reliability score
- **Customer Impact**: Correlation between SLO violations and support tickets
- **Investment Areas**: Resource allocation for reliability improvements
- **Competitive Analysis**: Industry benchmark comparisons

This comprehensive SLO framework ensures Thorbis maintains high reliability standards while providing clear visibility into service performance and improvement opportunities.
