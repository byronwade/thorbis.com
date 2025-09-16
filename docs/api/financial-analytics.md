# Financial Analytics API Documentation

## Overview

The Financial Analytics API provides comprehensive real-time financial data and insights for Thorbis organizations across all industry verticals. This API powers the Financial Dashboard with detailed metrics, forecasting, and industry benchmarking capabilities.

## Base URL

```
/api/v1/analytics/financial
```

## Authentication

All financial analytics endpoints require organization-level authentication through Supabase RLS (Row Level Security). Users must have appropriate permissions to access financial data for the requested organization.

## Core Endpoints

### GET /api/v1/analytics/financial

**Description**: Returns comprehensive financial analytics including revenue, expenses, profit, cash flow, and KPI metrics.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `organization_id` | UUID | Required | Organization identifier |
| `date_range` | Enum | `30d` | Time period: `7d`, `30d`, `90d`, `12m`, `ytd`, `all` |
| `metric_types` | Array | `['revenue','expenses','profit']` | Metrics to include |
| `granularity` | Enum | `daily` | Data granularity: `hourly`, `daily`, `weekly`, `monthly` |
| `compare_to` | Enum | - | Comparison period: `previous_period`, `previous_year`, `industry_avg` |
| `include_forecasts` | Boolean | `false` | Include financial forecasting data |
| `currency` | String | `USD` | Currency code (ISO 4217) |

**Example Request**:
```bash
GET /api/v1/analytics/financial?organization_id=550e8400-e29b-41d4-a716-446655440001&date_range=30d&include_forecasts=true
```

**Example Response**:
```json
{
  "data": {
    "organization_id": "550e8400-e29b-41d4-a716-446655440001",
    "date_range": {
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-31T23:59:59.999Z",
      "period_display": "Last 30 days"
    },
    "metrics": {
      "revenue": {
        "total_cents": 2508100,
        "time_series": [
          {
            "timestamp": "2024-01-01T00:00:00.000Z",
            "value_cents": 32500
          }
        ],
        "sources": {
          "subscriptions_cents": 1504860,
          "one_time_payments_cents": 752430,
          "other_cents": 250810
        }
      },
      "expenses": {
        "total_cents": 1673400,
        "time_series": [...],
        "categories": {
          "operational_cents": 669360,
          "personnel_cents": 585690,
          "marketing_cents": 251010,
          "other_cents": 167340
        }
      },
      "profit": {
        "total_cents": 834700,
        "margin_percentage": 33.28,
        "time_series": [...]
      }
    },
    "kpis": {
      "customer_acquisition_cost_cents": 12800,
      "lifetime_value_cents": 245600,
      "ltv_cac_ratio": 19.19,
      "monthly_churn_rate_percentage": 2.1,
      "gross_margin_percentage": 33.28,
      "operating_margin_percentage": 28.45
    },
    "summary": {
      "total_revenue_cents": 2508100,
      "total_expenses_cents": 1673400,
      "net_profit_cents": 834700,
      "profit_margin": 33.28,
      "transaction_count": 2847,
      "active_subscriptions": 234,
      "monthly_recurring_revenue_cents": 1567800,
      "cash_position_cents": 45678900,
      "burn_rate_cents": 234500,
      "runway_months": 194.8
    },
    "display_info": {
      "currency_symbol": "$",
      "total_revenue_formatted": "$25,081.00",
      "net_profit_formatted": "$8,347.00",
      "mrr_formatted": "$15,678.00",
      "cash_position_formatted": "$456,789.00",
      "profit_trend": "up",
      "revenue_trend": "up"
    }
  },
  "meta": {
    "generated_at": "2024-01-31T14:30:00.000Z",
    "query_parameters": {
      "organization_id": "550e8400-e29b-41d4-a716-446655440001",
      "date_range": "30d",
      "granularity": "daily"
    },
    "currency": "USD"
  }
}
```

### GET /api/v1/analytics/financial/revenue

**Description**: Detailed revenue analytics with breakdown by source, industry, customer segment, or geography.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `organization_id` | UUID | Required | Organization identifier |
| `date_range` | Enum | `30d` | Time period |
| `granularity` | Enum | `daily` | Data granularity |
| `breakdown_by` | Enum | `source` | Breakdown type: `source`, `industry`, `customer_segment`, `geography` |
| `currency` | String | `USD` | Currency code |

**Example Response**:
```json
{
  "data": {
    "breakdown": {
      "type": "source",
      "segments": [
        {
          "segment_name": "Subscription Revenue",
          "amount_cents": 1567800,
          "percentage": 62.5,
          "growth_rate": 8.2,
          "transaction_count": 234
        },
        {
          "segment_name": "One-time Payments",
          "amount_cents": 756900,
          "percentage": 30.2,
          "growth_rate": -2.1,
          "transaction_count": 1843
        }
      ]
    },
    "top_customers": [
      {
        "customer_id": "cust_001",
        "customer_name": "ABC Plumbing Corp",
        "revenue_cents": 234500,
        "transaction_count": 12,
        "customer_segment": "Enterprise"
      }
    ],
    "conversion_metrics": {
      "lead_to_customer_rate": 23.4,
      "quote_to_close_rate": 67.8,
      "average_sales_cycle_days": 14,
      "upsell_rate": 15.6
    }
  }
}
```

## Data Models

### Financial Summary
```typescript
interface FinancialSummary {
  total_revenue_cents: number;
  total_expenses_cents: number;
  net_profit_cents: number;
  profit_margin: number;
  transaction_count: number;
  active_subscriptions: number;
  monthly_recurring_revenue_cents: number;
  cash_position_cents: number;
  burn_rate_cents: number;
  runway_months: number;
}
```

### KPI Metrics
```typescript
interface KPIMetrics {
  customer_acquisition_cost_cents: number;
  lifetime_value_cents: number;
  ltv_cac_ratio: number;
  monthly_churn_rate_percentage: number;
  gross_margin_percentage: number;
  operating_margin_percentage: number;
}
```

### Time Series Data Point
```typescript
interface TimeSeriesPoint {
  timestamp: string; // ISO 8601 format
  value_cents: number;
  transaction_count?: number;
  additional_metrics?: Record<string, number>;
}
```

## Error Handling

The API returns standard HTTP status codes and structured error responses:

### 400 Bad Request
```json
{
  "error": "Invalid query parameters",
  "details": {
    "organization_id": {
      "_errors": ["Invalid UUID format"]
    },
    "date_range": {
      "_errors": ["Invalid enum value. Expected '7d' | '30d' | '90d' | '12m' | 'ytd' | 'all'"]
    }
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Valid organization access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "User does not have access to financial data for this organization"
}
```

### 404 Not Found
```json
{
  "error": "Organization not found",
  "message": "The specified organization does not exist or is not accessible"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred while processing the request"
}
```

## Rate Limits

- **Standard users**: 100 requests per minute
- **Premium users**: 500 requests per minute
- **Enterprise users**: 1000 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Caching

Financial analytics data is cached to improve performance:

- **Real-time metrics**: Cached for 5 minutes
- **Historical data**: Cached for 1 hour
- **Industry benchmarks**: Cached for 24 hours

Cache status is indicated in response headers:
```
X-Cache: HIT
X-Cache-TTL: 300
```

## Security Considerations

### Data Access Control
- All endpoints enforce Row Level Security (RLS) through Supabase
- Users can only access data for organizations they have permissions for
- Financial data is considered highly sensitive and requires appropriate role-based access

### Data Privacy
- Personal identifiers are masked in aggregate reports
- Customer data is anonymized in industry benchmarking
- PII redaction is applied to all logged data

### Input Validation
- All query parameters are validated using Zod schemas
- SQL injection protection through parameterized queries
- Rate limiting prevents abuse and DoS attacks

## Usage Examples

### Basic Financial Dashboard
```javascript
// Fetch 30-day financial overview
const response = await fetch('/api/v1/analytics/financial?' + new URLSearchParams({
  organization_id: 'your-org-id',
  date_range: '30d',
  include_forecasts: 'true'
}));

const financialData = await response.json();
console.log(`Revenue: ${financialData.data.display_info.total_revenue_formatted}`);
console.log(`Profit Margin: ${financialData.data.summary.profit_margin.toFixed(1)}%`);
```

### Revenue Breakdown Analysis
```javascript
// Get revenue breakdown by source
const revenueResponse = await fetch('/api/v1/analytics/financial/revenue?' + new URLSearchParams({
  organization_id: 'your-org-id',
  date_range: '90d',
  breakdown_by: 'source',
  granularity: 'weekly'
}));

const revenueData = await revenueResponse.json();
revenueData.data.breakdown.segments.forEach(segment => {
  console.log(`${segment.segment_name}: ${segment.percentage}% (${segment.growth_rate}% growth)`);
});
```

### Industry Comparison
```javascript
// Compare performance to industry benchmarks
const benchmarkResponse = await fetch('/api/v1/analytics/financial?' + new URLSearchParams({
  organization_id: 'your-org-id',
  date_range: '12m',
  compare_to: 'industry_avg'
}));

const benchmarkData = await benchmarkResponse.json();
const profitMargin = benchmarkData.data.summary.profit_margin;
const industryAvg = benchmarkData.data.industry_benchmarks.profit_margin_percentage;

console.log(`Your profit margin: ${profitMargin}% vs Industry: ${industryAvg}%`);
```

## Changelog

### Version 1.0.0 (2024-01-31)
- Initial release of Financial Analytics API
- Core financial metrics and KPI calculations
- Revenue breakdown and analysis endpoints
- Industry benchmarking capabilities
- Real-time data caching and optimization

## Support

For API support and questions:
- Documentation: [https://docs.thorbis.com/api/financial-analytics](https://docs.thorbis.com/api/financial-analytics)
- Support Email: api-support@thorbis.com
- Developer Slack: #api-support channel