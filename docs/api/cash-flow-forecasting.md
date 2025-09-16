# Cash Flow Forecasting and Working Capital API

Advanced financial forecasting and working capital optimization system with predictive analytics, scenario modeling, and optimization recommendations.

## Overview

The Cash Flow Forecasting and Working Capital API provides:

- **Predictive Cash Flow Modeling**: AI-driven forecasting based on historical patterns and seasonal trends
- **Working Capital Analysis**: Comprehensive efficiency metrics and optimization opportunities
- **Scenario Planning**: Multiple forecast scenarios with probability-weighted outcomes
- **Risk Assessment**: Identification of cash flow risks and mitigation strategies
- **Optimization Recommendations**: Actionable insights to improve working capital efficiency
- **Industry Benchmarking**: Performance comparison against industry standards

## Authentication

All endpoints require valid organization-level authentication:

```bash
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

## Base URL

```
https://api.thorbis.com/v1/finance/cash-flow
```

---

## Endpoints

### 1. Generate Cash Flow Forecast

Generate a standard cash flow forecast for specified period.

**GET** `/api/v1/finance/cash-flow`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string (UUID) | ✅ | Organization identifier |
| `forecast_type` | string | ❌ | Forecast type (`standard`, `detailed`, `conservative`) |
| `period_months` | integer | ❌ | Forecast period in months (1-24, default: 12) |

#### Response

```json
{
  "data": {
    "cash_flow_forecast": {
      "forecastPeriods": [
        {
          "month": 1,
          "projected_inflows": 125000,
          "projected_outflows": 95000,
          "net_flow": 30000,
          "cumulative_cash": 85000,
          "confidence_level": 85,
          "key_assumptions": [
            "Seasonal adjustment: 105.2%",
            "Growth factor: 102.1%",
            "Based on 3 months of data"
          ]
        }
      ],
      "cashPositions": [85000, 115000, 140000],
      "totalProjectedInflow": 1500000,
      "totalProjectedOutflow": 1140000,
      "methodology": "Historical trend analysis with seasonal adjustments",
      "dataQuality": 78
    },
    "working_capital_metrics": {
      "working_capital": 75000,
      "working_capital_ratio": 2.1,
      "current_ratio": 2.1,
      "quick_ratio": 1.8,
      "cash_conversion_cycle": {
        "days_sales_outstanding": 32,
        "days_inventory_outstanding": 45,
        "days_payable_outstanding": 28,
        "total_cycle_days": 49
      },
      "cash_to_working_capital": 0.15,
      "working_capital_turnover": 4.2
    },
    "industry_benchmarks": {
      "cash_conversion_cycle": 45,
      "days_sales_outstanding": 30,
      "working_capital_ratio": 2.1,
      "seasonal_variation": 0.25
    },
    "forecast_summary": {
      "forecast_period": "12 months",
      "forecast_generated_at": "2024-01-15T14:30:00Z",
      "cash_position_projection": 360000,
      "key_insights": [
        {
          "type": "opportunity",
          "category": "efficiency",
          "message": "Cash conversion cycle could be optimized to improve cash flow",
          "impact": "medium"
        }
      ],
      "risk_factors": [
        {
          "risk_type": "cash_decline",
          "severity": "low",
          "description": "Minor seasonal cash flow variation expected in Q2",
          "estimated_impact": 15000,
          "mitigation_required": false
        }
      ],
      "recommended_actions": [
        {
          "category": "collections",
          "priority": "medium",
          "action": "Optimize accounts receivable collection processes",
          "potential_impact": "Reduce DSO by 3-5 days",
          "implementation_time": "30-45 days"
        }
      ]
    },
    "scenarios": [
      {
        "scenario_name": "Conservative",
        "revenue_growth": -5,
        "expense_growth": 0,
        "description": "5% revenue decline, stable expenses",
        "probability": 25
      },
      {
        "scenario_name": "Base Case",
        "revenue_growth": 5,
        "expense_growth": 2,
        "description": "5% revenue growth, 2% expense inflation",
        "probability": 50
      },
      {
        "scenario_name": "Optimistic",
        "revenue_growth": 15,
        "expense_growth": 5,
        "description": "15% revenue growth, 5% expense growth",
        "probability": 25
      }
    ]
  },
  "meta": {
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "forecast_type": "standard",
    "data_period": "12 months",
    "confidence_level": "medium",
    "last_updated": "2024-01-15T14:30:00Z"
  }
}
```

---

### 2. Create Advanced Forecast

Create a detailed forecast with custom scenarios and advanced configuration.

**POST** `/api/v1/finance/cash-flow/forecast`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "forecast_config": {
    "forecast_period_months": 18,
    "confidence_level": "high",
    "include_scenarios": true,
    "seasonal_adjustments": true,
    "industry_benchmarks": true,
    "vertical": "hs"
  },
  "historical_periods": {
    "include_months": 24,
    "exclude_outliers": true,
    "weight_recent_data": true
  },
  "forecast_scenarios": [
    {
      "scenario_name": "Market Expansion",
      "scenario_type": "custom",
      "revenue_adjustment": 25,
      "expense_adjustment": 15,
      "seasonal_factors": {
        "Q1": 0.9,
        "Q2": 1.1,
        "Q3": 1.2,
        "Q4": 1.0
      },
      "one_time_events": [
        {
          "event_name": "Equipment Purchase",
          "impact_amount_cents": -5000000,
          "impact_month": 6,
          "category": "capital_expenditure"
        }
      ]
    }
  ]
}
```

#### Request Schema

```typescript
interface AdvancedForecastRequest {
  organization_id: string; // UUID format
  forecast_config: {
    forecast_period_months: number; // 1-24 months
    confidence_level: 'low' | 'medium' | 'high';
    include_scenarios: boolean;
    seasonal_adjustments: boolean;
    industry_benchmarks: boolean;
    vertical?: 'hs' | 'auto' | 'rest' | 'ret';
  };
  historical_periods?: {
    include_months: number; // 3-36 months
    exclude_outliers: boolean;
    weight_recent_data: boolean;
  };
  forecast_scenarios?: ForecastScenario[];
}

interface ForecastScenario {
  scenario_name: string; // 1-100 characters
  scenario_type: 'conservative' | 'optimistic' | 'pessimistic' | 'custom';
  revenue_adjustment: number; // -100 to +200 (percentage)
  expense_adjustment: number; // -50 to +100 (percentage)
  seasonal_factors?: Record<string, number>;
  one_time_events?: OneTimeEvent[];
}

interface OneTimeEvent {
  event_name: string;
  impact_amount_cents: number;
  impact_month: number; // 1-24
  category: 'revenue' | 'expense' | 'capital_expenditure';
}
```

#### Response

```json
{
  "data": {
    "forecast_id": "forecast_12345678-1234-1234-1234-123456789abc",
    "cash_flow_forecast": {
      "forecastPeriods": [...],
      "scenarios": [
        {
          "scenario_name": "Market Expansion",
          "scenario_type": "custom",
          "revenue_adjustment": 25,
          "expense_adjustment": 15,
          "forecast": [
            {
              "month": 1,
              "projected_inflows": 156250,
              "projected_outflows": 109250,
              "net_flow": 47000,
              "cumulative_cash": 102000
            }
          ]
        }
      ],
      "confidence_intervals": [
        {
          "month": 1,
          "lower_bound": 72250,
          "upper_bound": 97750,
          "confidence_level": 95
        }
      ],
      "sensitivity_analysis": {
        "revenue_sensitivity": [
          {
            "change_percent": -10,
            "impact_on_final_cash": -36000
          },
          {
            "change_percent": 10,
            "impact_on_final_cash": 36000
          }
        ],
        "expense_sensitivity": [
          {
            "change_percent": -10,
            "impact_on_final_cash": 11400
          },
          {
            "change_percent": 10,
            "impact_on_final_cash": -11400
          }
        ]
      }
    },
    "working_capital_analysis": {
      "working_capital": 75000,
      "working_capital_ratio": 2.1,
      "trend_analysis": {
        "6_month_trend": "improving",
        "average_monthly_change": 2500,
        "volatility_score": 0.15
      },
      "optimization_score": 78,
      "peer_comparison": {
        "percentile_rank": 65,
        "industry_average": {
          "working_capital_ratio": 1.9,
          "cash_conversion_cycle": 52
        }
      }
    },
    "cash_optimization_plan": {
      "immediate_actions": [
        {
          "action": "Accelerate invoice processing",
          "impact": "Reduce DSO by 3 days",
          "timeline": "14 days",
          "effort": "low"
        }
      ],
      "medium_term_initiatives": [
        {
          "action": "Negotiate supplier payment terms",
          "impact": "Extend DPO by 7 days",
          "timeline": "60 days",
          "effort": "medium"
        }
      ],
      "long_term_strategy": {
        "focus_areas": ["inventory_optimization", "payment_automation"],
        "projected_improvement": {
          "working_capital_freed": 45000,
          "roi_percentage": 18
        }
      },
      "investment_opportunities": [
        {
          "opportunity": "Automated invoicing system",
          "investment_required": 25000,
          "payback_period_months": 8,
          "annual_savings": 38000
        }
      ]
    },
    "validation_metrics": {
      "confidence_score": 82,
      "data_quality_score": 78,
      "forecast_accuracy_estimate": 85
    }
  },
  "message": "Advanced cash flow forecast generated successfully"
}
```

---

### 3. Working Capital Optimization

Perform comprehensive working capital analysis and optimization.

**PUT** `/api/v1/finance/cash-flow/working-capital`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "analysis_config": {
    "analysis_period_months": 12,
    "optimization_focus": "cash_conversion",
    "include_benchmarks": true,
    "target_cash_days": 30,
    "target_dso": 25,
    "target_dpo": 35
  },
  "cash_management_preferences": {
    "minimum_cash_buffer_cents": 5000000,
    "maximum_idle_cash_cents": 20000000,
    "investment_risk_tolerance": "moderate",
    "credit_utilization_target": 0.25
  }
}
```

#### Request Schema

```typescript
interface WorkingCapitalOptimizationRequest {
  organization_id: string; // UUID format
  analysis_config: {
    analysis_period_months: number; // 1-24 months
    optimization_focus: 'cash_conversion' | 'liquidity' | 'growth' | 'stability';
    include_benchmarks: boolean;
    target_cash_days?: number; // 0-365
    target_dso?: number; // 0-120
    target_dpo?: number; // 0-120
  };
  cash_management_preferences?: {
    minimum_cash_buffer_cents: number; // Minimum 0
    maximum_idle_cash_cents: number; // Minimum 0
    investment_risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
    credit_utilization_target: number; // 0-1 (percentage as decimal)
  };
}
```

#### Response

```json
{
  "data": {
    "working_capital_analysis": {
      "working_capital": 125000,
      "working_capital_ratio": 2.3,
      "current_ratio": 2.3,
      "quick_ratio": 1.9,
      "cash_conversion_cycle": {
        "days_sales_outstanding": 28,
        "days_inventory_outstanding": 42,
        "days_payable_outstanding": 31,
        "total_cycle_days": 39
      },
      "cash_to_working_capital": 0.18,
      "working_capital_turnover": 4.8,
      "trend_analysis": {
        "trend_direction": "improving",
        "monthly_average_change": 3200,
        "volatility": 0.12,
        "seasonal_patterns": {
          "Q1": 0.95,
          "Q2": 1.05,
          "Q3": 1.08,
          "Q4": 0.92
        }
      },
      "optimization_score": 82,
      "peer_comparison": {
        "industry_percentile": 72,
        "vs_industry_average": {
          "working_capital_ratio": "+0.4",
          "cash_conversion_cycle": "-6 days"
        }
      }
    },
    "optimization_opportunities": [
      {
        "opportunity_id": "opt_001",
        "category": "collections",
        "title": "Automate Invoice Follow-up",
        "description": "Implement automated reminder system for overdue invoices",
        "impact_estimate": {
          "dso_reduction_days": 4,
          "cash_flow_improvement_cents": 2800000,
          "implementation_complexity": "low"
        },
        "timeline": "30-45 days",
        "priority": "high"
      },
      {
        "opportunity_id": "opt_002", 
        "category": "payables",
        "title": "Optimize Payment Timing",
        "description": "Align supplier payments with cash flow cycles",
        "impact_estimate": {
          "dpo_extension_days": 6,
          "cash_flow_improvement_cents": 1500000,
          "implementation_complexity": "medium"
        },
        "timeline": "60-90 days",
        "priority": "medium"
      }
    ],
    "implementation_roadmap": {
      "phase_1": {
        "timeline": "0-30 days",
        "actions": [
          "Set up automated invoice reminders",
          "Review aged receivables report",
          "Identify payment term optimization opportunities"
        ],
        "expected_impact": "15% working capital efficiency improvement"
      },
      "phase_2": {
        "timeline": "30-90 days", 
        "actions": [
          "Negotiate extended payment terms with suppliers",
          "Implement inventory optimization system",
          "Set up cash flow monitoring dashboard"
        ],
        "expected_impact": "25% working capital efficiency improvement"
      },
      "phase_3": {
        "timeline": "90-180 days",
        "actions": [
          "Deploy AI-powered demand forecasting",
          "Establish revolving credit facility",
          "Implement dynamic pricing strategy"
        ],
        "expected_impact": "35% working capital efficiency improvement"
      }
    },
    "impact_projections": {
      "6_month_projection": {
        "working_capital_improvement_cents": 4500000,
        "cash_conversion_cycle_reduction_days": 8,
        "working_capital_ratio_improvement": 0.3
      },
      "12_month_projection": {
        "working_capital_improvement_cents": 7200000,
        "cash_conversion_cycle_reduction_days": 12,
        "working_capital_ratio_improvement": 0.5
      },
      "roi_analysis": {
        "implementation_cost_cents": 15000000,
        "annual_savings_cents": 54000000,
        "payback_period_months": 3.3,
        "net_present_value_cents": 162000000
      }
    },
    "current_metrics": {
      "cash_conversion_cycle": 39,
      "days_sales_outstanding": 28,
      "days_inventory_outstanding": 42,
      "days_payable_outstanding": 31,
      "working_capital_ratio": 2.3
    },
    "benchmarks": {
      "industry_average": {
        "cash_conversion_cycle": 45,
        "working_capital_ratio": 1.9,
        "days_sales_outstanding": 32
      },
      "top_quartile": {
        "cash_conversion_cycle": 28,
        "working_capital_ratio": 2.8,
        "days_sales_outstanding": 22
      },
      "your_position": {
        "percentile_rank": 72,
        "areas_of_strength": ["collections", "liquidity"],
        "improvement_opportunities": ["inventory_management", "supplier_terms"]
      }
    }
  },
  "message": "Working capital analysis completed successfully"
}
```

---

## Forecast Methodology

### Historical Analysis

The API analyzes historical transaction data to identify:

- **Monthly Patterns**: Average inflows and outflows by month
- **Seasonal Trends**: Recurring seasonal variations (1-12 confidence scoring)
- **Growth Trends**: Month-over-month growth rates and trajectory analysis
- **Volatility Patterns**: Cash flow consistency and risk factors

### Predictive Modeling

Forecasting uses multiple techniques:

1. **Trend Extrapolation**: Linear and exponential trend projection
2. **Seasonal Adjustment**: Historical seasonal pattern application
3. **Growth Modeling**: Compound growth rate calculations
4. **Scenario Weighting**: Probability-weighted outcome modeling

### Confidence Scoring

Confidence levels are calculated based on:

- **Data Quality** (0-100): Volume, consistency, and completeness of historical data
- **Time Horizon** (decay factor): Confidence decreases with forecast distance
- **Market Volatility** (stability factor): Industry and economic stability indicators
- **Pattern Recognition** (correlation factor): Strength of identified patterns

## Working Capital Metrics

### Core Ratios

| Metric | Formula | Healthy Range |
|--------|---------|---------------|
| **Working Capital Ratio** | Current Assets ÷ Current Liabilities | 1.5 - 3.0 |
| **Current Ratio** | Current Assets ÷ Current Liabilities | 1.5 - 3.0 |
| **Quick Ratio** | (Current Assets - Inventory) ÷ Current Liabilities | 1.0 - 2.0 |
| **Cash Conversion Cycle** | DSO + DIO - DPO | 30-60 days |

### Efficiency Metrics

- **Days Sales Outstanding (DSO)**: Average collection period for receivables
- **Days Inventory Outstanding (DIO)**: Average time inventory is held
- **Days Payable Outstanding (DPO)**: Average payment period for suppliers
- **Working Capital Turnover**: Revenue ÷ Average Working Capital

---

## Industry Benchmarks

### Home Services (`hs`)
```json
{
  "cash_conversion_cycle": 45,
  "days_sales_outstanding": 30,
  "working_capital_ratio": 2.1,
  "seasonal_variation": 0.25,
  "typical_growth_rate": 0.08
}
```

### Auto Services (`auto`)
```json
{
  "cash_conversion_cycle": 35,
  "days_sales_outstanding": 25,
  "working_capital_ratio": 1.8,
  "seasonal_variation": 0.15,
  "typical_growth_rate": 0.06
}
```

### Restaurant (`rest`)
```json
{
  "cash_conversion_cycle": 15,
  "days_sales_outstanding": 5,
  "working_capital_ratio": 1.5,
  "seasonal_variation": 0.3,
  "typical_growth_rate": 0.12
}
```

### Retail (`ret`)
```json
{
  "cash_conversion_cycle": 60,
  "days_sales_outstanding": 20,
  "working_capital_ratio": 2.0,
  "seasonal_variation": 0.4,
  "typical_growth_rate": 0.10
}
```

---

## Scenario Modeling

### Standard Scenarios

The API automatically generates three standard scenarios:

1. **Conservative Scenario** (25% probability)
   - Revenue decline: 5-10%
   - Expense stability: 0-2% increase
   - Market conditions: Challenging

2. **Base Case Scenario** (50% probability)
   - Revenue growth: 3-8%
   - Expense inflation: 2-4%
   - Market conditions: Stable

3. **Optimistic Scenario** (25% probability)
   - Revenue growth: 12-20%
   - Expense growth: 5-8%
   - Market conditions: Favorable

### Custom Scenarios

Create custom scenarios with:
- Revenue and expense adjustments
- Seasonal variation factors
- One-time events (equipment purchases, loans, etc.)
- Market condition modifiers

---

## Risk Assessment

### Risk Categories

| Risk Type | Description | Severity Levels |
|-----------|-------------|-----------------|
| **Liquidity Risk** | Insufficient cash to meet obligations | Low, Medium, High |
| **Collection Risk** | Delayed receivables collection | Low, Medium, High |
| **Market Risk** | Demand or pricing fluctuations | Low, Medium, High |
| **Operational Risk** | Business disruption or inefficiencies | Low, Medium, High |
| **Seasonal Risk** | Seasonal cash flow variations | Low, Medium, High |

### Risk Indicators

- **Negative Cash Months**: Projected periods of negative cash flow
- **Low Cash Buffers**: Periods with insufficient cash reserves
- **High Variability**: Excessive cash flow volatility
- **Trend Deterioration**: Declining cash position trends

---

## Optimization Strategies

### Cash Flow Optimization

1. **Accelerate Receivables**
   - Automated invoicing and follow-up
   - Early payment discounts
   - Electronic payment options

2. **Optimize Payables**
   - Negotiate extended payment terms
   - Take advantage of early payment discounts
   - Align payments with cash inflow cycles

3. **Inventory Management**
   - Just-in-time inventory systems
   - Demand forecasting improvements
   - Slow-moving inventory liquidation

4. **Revenue Enhancement**
   - Recurring revenue development
   - Dynamic pricing strategies
   - Upselling and cross-selling initiatives

### Working Capital Efficiency

1. **Collection Improvements**
   - Credit policy optimization
   - Customer credit monitoring
   - Collection process automation

2. **Supplier Management**
   - Payment term negotiations
   - Vendor relationship optimization
   - Supply chain efficiency

3. **Cash Management**
   - Cash pooling and netting
   - Short-term investment strategies
   - Credit facility optimization

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Invalid Configuration
```json
{
  "error": "Invalid forecast configuration",
  "details": {
    "forecast_config": {
      "forecast_period_months": {
        "_errors": ["Number must be between 1 and 24"]
      }
    }
  }
}
```

#### 400 Bad Request - Insufficient Data
```json
{
  "error": "Insufficient historical data for forecasting",
  "message": "At least 3 months of transaction data required for reliable forecasting"
}
```

#### 404 Not Found - Organization Not Found
```json
{
  "error": "Organization not found",
  "message": "No organization found with ID org_12345..."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to generate cash flow forecast",
  "message": "An unexpected error occurred during forecast generation"
}
```

---

## SDK Integration Examples

### JavaScript/TypeScript
```typescript
import { ThorbisCashFlow } from '@thorbis/cash-flow-sdk';

const cashFlow = new ThorbisCashFlow({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Generate standard forecast
const forecast = await cashFlow.forecast.generate({
  organizationId: 'org_...',
  periodMonths: 12,
  forecastType: 'standard'
});

// Create advanced forecast with scenarios
const advancedForecast = await cashFlow.forecast.createAdvanced({
  organizationId: 'org_...',
  forecastConfig: {
    forecastPeriodMonths: 18,
    confidenceLevel: 'high',
    includeScenarios: true,
    seasonalAdjustments: true
  },
  forecastScenarios: [{
    scenarioName: 'Market Expansion',
    scenarioType: 'custom',
    revenueAdjustment: 25,
    expenseAdjustment: 15
  }]
});

// Optimize working capital
const optimization = await cashFlow.workingCapital.optimize({
  organizationId: 'org_...',
  analysisConfig: {
    analysisPeriodMonths: 12,
    optimizationFocus: 'cash_conversion',
    includeBenchmarks: true
  }
});
```

### Python
```python
from thorbis_cash_flow import ThorbisCashFlow

cash_flow = ThorbisCashFlow(api_key='your-api-key')

# Generate forecast
forecast = cash_flow.forecast.generate(
    organization_id='org_...',
    period_months=12,
    forecast_type='standard'
)

# Working capital analysis
optimization = cash_flow.working_capital.optimize(
    organization_id='org_...',
    analysis_config={
        'analysis_period_months': 12,
        'optimization_focus': 'cash_conversion',
        'include_benchmarks': True
    }
)
```

### cURL Examples

#### Generate Standard Forecast
```bash
curl -X GET "https://api.thorbis.com/v1/finance/cash-flow?organization_id=org_87654321&period_months=12" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

#### Create Advanced Forecast
```bash
curl -X POST https://api.thorbis.com/v1/finance/cash-flow/forecast \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "forecast_config": {
      "forecast_period_months": 18,
      "confidence_level": "high",
      "include_scenarios": true,
      "seasonal_adjustments": true
    }
  }'
```

---

## Best Practices

### Forecast Accuracy

1. **Data Quality**: Ensure consistent, complete transaction data
2. **Regular Updates**: Refresh forecasts monthly or when business changes
3. **Scenario Planning**: Use multiple scenarios for comprehensive planning
4. **Validation**: Compare forecasts to actual results for model improvement

### Working Capital Management

1. **Regular Monitoring**: Track working capital metrics weekly
2. **Benchmark Comparison**: Compare performance to industry standards
3. **Optimization Focus**: Prioritize high-impact, low-effort improvements
4. **Automation**: Implement automated processes where possible

### Risk Management

1. **Early Warning Systems**: Set up alerts for cash flow risks
2. **Contingency Planning**: Prepare for negative scenarios
3. **Credit Facilities**: Establish backup financing before needed
4. **Cash Reserves**: Maintain appropriate cash buffers

---

## Limits and Quotas

| Resource | Limit | Notes |
|----------|-------|-------|
| Forecast Period | 24 months maximum | Accuracy decreases with longer periods |
| Historical Data | 36 months maximum | More data improves accuracy |
| Custom Scenarios | 10 per forecast | Contact support for higher limits |
| API Calls | 1,000 per hour | Per organization |
| Stored Forecasts | 50 per organization | Automatic cleanup after 90 days |

---

## Support and Resources

### Documentation
- **API Reference**: [https://api-docs.thorbis.com/cash-flow](https://api-docs.thorbis.com/cash-flow)
- **Best Practices Guide**: [https://docs.thorbis.com/cash-flow/best-practices](https://docs.thorbis.com/cash-flow/best-practices)
- **Industry Benchmarks**: [https://docs.thorbis.com/benchmarks](https://docs.thorbis.com/benchmarks)

### Support Channels
- **Technical Support**: cash-flow-api@thorbis.com
- **Financial Consulting**: finance-consulting@thorbis.com
- **Emergency Support**: 24/7 hotline for critical cash flow issues
- **Community Forum**: [https://community.thorbis.com/cash-flow](https://community.thorbis.com/cash-flow)

---

## Changelog

### Version 1.0.0 - January 2024
- Initial release of Cash Flow Forecasting API
- Basic forecasting with historical trend analysis
- Working capital metrics and benchmarking
- Standard scenario generation

### Version 1.1.0 - February 2024
- Advanced forecasting with custom scenarios
- Enhanced working capital optimization
- Industry-specific benchmarks and insights
- Risk assessment and mitigation recommendations

### Version 1.2.0 - March 2024
- Predictive analytics with machine learning
- Real-time cash flow monitoring
- Automated optimization recommendations
- Integration with accounting systems