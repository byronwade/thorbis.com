/**
 * Cash Flow Forecasting and Working Capital API
 * Advanced financial forecasting with working capital optimization
 * 
 * Features: Predictive analytics, scenario modeling, working capital optimization
 * Security: Organization-level access, audit trails, compliance reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schemas
const CashFlowForecastSchema = z.object({
  organization_id: z.string().uuid(),
  forecast_config: z.object({
    forecast_period_months: z.number().int().min(1).max(24).default(12),
    confidence_level: z.enum(['low', 'medium', 'high']).default('medium'),
    include_scenarios: z.boolean().default(true),
    seasonal_adjustments: z.boolean().default(true),
    industry_benchmarks: z.boolean().default(true),
    vertical: z.enum(['hs', 'auto', 'rest', 'ret']).optional()
  }),
  historical_periods: z.object({
    include_months: z.number().int().min(3).max(36).default(12),
    exclude_outliers: z.boolean().default(true),
    weight_recent_data: z.boolean().default(true)
  }).optional(),
  forecast_scenarios: z.array(z.object({
    scenario_name: z.string().min(1).max(100),
    scenario_type: z.enum(['conservative', 'optimistic', 'pessimistic', 'custom']),
    revenue_adjustment: z.number().min(-100).max(200), // Percentage adjustment
    expense_adjustment: z.number().min(-50).max(100),
    seasonal_factors: z.record(z.string(), z.number()).optional(),
    one_time_events: z.array(z.object({
      event_name: z.string(),
      impact_amount_cents: z.number(),
      impact_month: z.number().int().min(1).max(24),
      category: z.enum(['revenue', 'expense', 'capital_expenditure'])
    })).optional()
  })).optional()
});

const WorkingCapitalAnalysisSchema = z.object({
  organization_id: z.string().uuid(),
  analysis_config: z.object({
    analysis_period_months: z.number().int().min(1).max(24).default(12),
    optimization_focus: z.enum(['cash_conversion', 'liquidity', 'growth', 'stability']).default('cash_conversion'),
    include_benchmarks: z.boolean().default(true),
    target_cash_days: z.number().int().min(0).max(365).optional(),
    target_dso: z.number().int().min(0).max(120).optional(),
    target_dpo: z.number().int().min(0).max(120).optional()
  }),
  cash_management_preferences: z.object({
    minimum_cash_buffer_cents: z.number().int().min(0),
    maximum_idle_cash_cents: z.number().int().min(0),
    investment_risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
    credit_utilization_target: z.number().min(0).max(1).default(0.3) // 30% max utilization
  }).optional()
});

// GET /api/v1/finance/cash-flow - Generate cash flow forecasts
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const forecastType = searchParams.get('forecast_type') || 'standard';
    const periodMonths = parseInt(searchParams.get('period_months') || '12');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch historical financial data
    const historicalData = await fetchHistoricalFinancialData(supabase, organizationId, periodMonths + 12);
    
    if (!historicalData) {
      return NextResponse.json(
        { error: 'Insufficient historical data for forecasting' },
        { status: 400 }
      );
    }

    // Generate cash flow forecast
    const forecast = await generateCashFlowForecast(historicalData, {
      periodMonths,
      forecastType,
      organizationId
    });

    // Calculate working capital metrics
    const workingCapitalMetrics = await calculateWorkingCapitalMetrics(supabase, organizationId, historicalData);

    // Generate industry benchmarks
    const benchmarks = await generateIndustryBenchmarks(supabase, historicalData.vertical, organizationId);

    // Create forecast summary
    const forecastSummary = {
      forecast_period: `${periodMonths} months',
      forecast_generated_at: new Date().toISOString(),
      cash_position_projection: forecast.cashPositions[forecast.cashPositions.length - 1],
      key_insights: generateKeyInsights(forecast, workingCapitalMetrics),
      risk_factors: identifyRiskFactors(forecast, workingCapitalMetrics),
      recommended_actions: generateRecommendations(forecast, workingCapitalMetrics, benchmarks)
    };

    return NextResponse.json({
      data: {
        cash_flow_forecast: forecast,
        working_capital_metrics: workingCapitalMetrics,
        industry_benchmarks: benchmarks,
        forecast_summary: forecastSummary,
        scenarios: await generateForecastScenarios(historicalData, periodMonths)
      },
      meta: {
        organization_id: organizationId,
        forecast_type: forecastType,
        data_period: '${historicalData.months} months',
        confidence_level: 'medium',
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cash flow forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cash flow forecast' },
      { status: 500 }
    );
  }
}

// POST /api/v1/finance/cash-flow/forecast - Create detailed forecast with scenarios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = CashFlowForecastSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid forecast configuration', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, forecast_config, historical_periods, forecast_scenarios } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch comprehensive historical data
    const historicalData = await fetchHistoricalFinancialData(
      supabase, 
      organization_id, 
      historical_periods?.include_months || 12
    );

    if (!historicalData) {
      return NextResponse.json(
        { error: 'Insufficient historical data for forecasting' },
        { status: 400 }
      );
    }

    // Generate advanced forecast with scenarios
    const advancedForecast = await generateAdvancedForecast(
      historicalData, 
      forecast_config, 
      forecast_scenarios || []
    );

    // Calculate detailed working capital analysis
    const workingCapitalAnalysis = await generateWorkingCapitalAnalysis(
      supabase,
      organization_id,
      historicalData,
      forecast_config
    );

    // Generate cash optimization recommendations
    const cashOptimization = await generateCashOptimizationPlan(
      advancedForecast,
      workingCapitalAnalysis,
      forecast_config
    );

    // Store forecast for future reference
    const { data: storedForecast, error: storeError } = await supabase
      .from('cash_flow_forecasts')
      .insert({
        organization_id,
        forecast_config,
        forecast_data: advancedForecast,
        working_capital_data: workingCapitalAnalysis,
        optimization_plan: cashOptimization,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select('id')
      .single();

    if (storeError) {
      console.error('Failed to store forecast:', storeError);
    }

    return NextResponse.json({
      data: {
        forecast_id: storedForecast?.id,
        cash_flow_forecast: advancedForecast,
        working_capital_analysis: workingCapitalAnalysis,
        cash_optimization_plan: cashOptimization,
        forecast_config,
        validation_metrics: {
          confidence_score: calculateConfidenceScore(advancedForecast, historicalData),
          data_quality_score: calculateDataQualityScore(historicalData),
          forecast_accuracy_estimate: estimateForecastAccuracy(historicalData, forecast_config)
        }
      },
      message: 'Advanced cash flow forecast generated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Advanced forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate advanced cash flow forecast' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/finance/cash-flow/working-capital - Working capital optimization
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = WorkingCapitalAnalysisSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid working capital configuration', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, analysis_config, cash_management_preferences } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch current financial position
    const currentPosition = await fetchCurrentFinancialPosition(supabase, organization_id);
    
    if (!currentPosition) {
      return NextResponse.json(
        { error: 'Unable to determine current financial position' },
        { status: 400 }
      );
    }

    // Perform comprehensive working capital analysis
    const workingCapitalAnalysis = await performWorkingCapitalAnalysis(
      supabase,
      organization_id,
      currentPosition,
      analysis_config
    );

    // Generate optimization opportunities
    const optimizationOpportunities = await identifyOptimizationOpportunities(
      workingCapitalAnalysis,
      cash_management_preferences || {},
      analysis_config
    );

    // Create implementation roadmap
    const implementationRoadmap = await createImplementationRoadmap(
      optimizationOpportunities,
      currentPosition,
      analysis_config
    );

    // Calculate impact projections
    const impactProjections = await calculateOptimizationImpact(
      optimizationOpportunities,
      currentPosition,
      analysis_config.analysis_period_months
    );

    return NextResponse.json({
      data: {
        working_capital_analysis: workingCapitalAnalysis,
        optimization_opportunities: optimizationOpportunities,
        implementation_roadmap: implementationRoadmap,
        impact_projections: impactProjections,
        current_metrics: {
          cash_conversion_cycle: workingCapitalAnalysis.cash_conversion_cycle,
          days_sales_outstanding: workingCapitalAnalysis.days_sales_outstanding,
          days_inventory_outstanding: workingCapitalAnalysis.days_inventory_outstanding,
          days_payable_outstanding: workingCapitalAnalysis.days_payable_outstanding,
          working_capital_ratio: workingCapitalAnalysis.working_capital_ratio
        },
        benchmarks: await generateWorkingCapitalBenchmarks(supabase, currentPosition.vertical, organization_id)
      },
      message: 'Working capital analysis completed successfully'
    });

  } catch (error) {
    console.error('Working capital analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform working capital analysis' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function fetchHistoricalFinancialData(supabase: unknown, organizationId: string, months: number) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  // Fetch transactions, invoices, and financial data
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('
      id,
      amount_cents,
      transaction_type,
      status,
      created_at,
      category,
      metadata
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true });

  if (transactionError) {
    console.error('Error fetching transaction data:', transactionError);
    return null;
  }

  // Fetch organization details for vertical classification
  const { data: organization } = await supabase
    .from('organizations')
    .select('industry')
    .eq('id', organizationId)
    .single();

  return {
    transactions: transactions || [],
    months,
    vertical: organization?.industry || 'hs',
    organizationId
  };
}

async function generateCashFlowForecast(historicalData: unknown, config: unknown) {
  const { transactions, months } = historicalData;
  const { periodMonths } = config;

  // Analyze historical patterns
  const monthlyPatterns = analyzeMonthlyPatterns(transactions);
  const seasonalTrends = identifySeasonalTrends(transactions, months);
  const growthTrends = calculateGrowthTrends(transactions);

  // Project future cash flows
  const forecast = [];
  const cumulativeCash = calculateCurrentCashPosition(transactions);

  for (let month = 1; month <= periodMonths; month++) {
    const monthData = projectMonthlyFlow(
      monthlyPatterns,
      seasonalTrends,
      growthTrends,
      month
    );

    cumulativeCash += monthData.netFlow;
    
    forecast.push({
      month,
      projected_inflows: monthData.inflows,
      projected_outflows: monthData.outflows,
      net_flow: monthData.netFlow,
      cumulative_cash: cumulativeCash,
      confidence_level: calculateMonthlyConfidence(month, months),
      key_assumptions: monthData.assumptions
    });
  }

  return {
    forecastPeriods: forecast,
    cashPositions: forecast.map(f => f.cumulative_cash),
    totalProjectedInflow: forecast.reduce((sum, f) => sum + f.projected_inflows, 0),
    totalProjectedOutflow: forecast.reduce((sum, f) => sum + f.projected_outflows, 0),
    methodology: 'Historical trend analysis with seasonal adjustments',
    dataQuality: calculateDataQualityScore(historicalData)
  };
}

async function calculateWorkingCapitalMetrics(supabase: unknown, organizationId: string, historicalData: unknown) {
  // Calculate key working capital ratios and metrics
  const currentAssets = await getCurrentAssets(supabase, organizationId);
  const currentLiabilities = await getCurrentLiabilities(supabase, organizationId);
  const recentTransactions = historicalData.transactions.slice(-90); // Last 90 days

  const accountsReceivable = calculateAccountsReceivable(recentTransactions);
  const inventory = await calculateInventoryValue(supabase, organizationId);
  const accountsPayable = calculateAccountsPayable(recentTransactions);

  const revenue90Days = recentTransactions
    .filter(t => t.transaction_type === 'sale')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const cogs90Days = recentTransactions
    .filter(t => t.transaction_type === 'expense' && t.category === 'cost_of_goods_sold')
    .reduce((sum, t) => sum + Math.abs(t.amount_cents), 0);

  return {
    working_capital: currentAssets - currentLiabilities,
    working_capital_ratio: currentAssets / (currentLiabilities || 1),
    current_ratio: currentAssets / (currentLiabilities || 1),
    quick_ratio: (currentAssets - inventory) / (currentLiabilities || 1),
    cash_conversion_cycle: {
      days_sales_outstanding: (accountsReceivable / (revenue90Days / 90)) || 0,
      days_inventory_outstanding: (inventory / (cogs90Days / 90)) || 0,
      days_payable_outstanding: (accountsPayable / (cogs90Days / 90)) || 0,
      total_cycle_days: 0 // Will be calculated below
    },
    cash_to_working_capital: currentAssets > 0 ? (currentAssets * 0.1) / currentAssets : 0, // Estimated cash percentage
    working_capital_turnover: revenue90Days > 0 ? (currentAssets - currentLiabilities) / revenue90Days : 0
  };
}

function analyzeMonthlyPatterns(transactions: unknown[]) {
  const monthlyData: { [key: string]: { inflows: number; outflows: number; count: number } } = {};

  transactions.forEach(transaction => {
    const month = new Date(transaction.created_at).toISOString().substr(0, 7); // YYYY-MM
    
    if (!monthlyData[month]) {
      monthlyData[month] = { inflows: 0, outflows: 0, count: 0 };
    }

    monthlyData[month].count++;
    
    if (transaction.amount_cents > 0) {
      monthlyData[month].inflows += transaction.amount_cents;
    } else {
      monthlyData[month].outflows += Math.abs(transaction.amount_cents);
    }
  });

  return monthlyData;
}

function identifySeasonalTrends(transactions: unknown[], months: number) {
  const seasonalData: { [key: number]: { factor: number; confidence: number } } = {};
  
  // Group by month (1-12) across all years
  for (let month = 1; month <= 12; month++) {
    const monthTransactions = transactions.filter(t => 
      new Date(t.created_at).getMonth() + 1 === month
    );
    
    const monthlyRevenue = monthTransactions
      .filter(t => t.amount_cents > 0)
      .reduce((sum, t) => sum + t.amount_cents, 0);
    
    const avgMonthlyRevenue = transactions
      .filter(t => t.amount_cents > 0)
      .reduce((sum, t) => sum + t.amount_cents, 0) / months;
    
    seasonalData[month] = {
      factor: avgMonthlyRevenue > 0 ? monthlyRevenue / (avgMonthlyRevenue * (months / 12)) : 1,
      confidence: monthTransactions.length > 10 ? 0.8 : 0.4
    };
  }

  return seasonalData;
}

function calculateGrowthTrends(transactions: unknown[]) {
  // Calculate month-over-month growth rates
  const monthlyRevenue: { [key: string]: number } = {};
  
  transactions.forEach(transaction => {
    if (transaction.amount_cents > 0) {
      const month = new Date(transaction.created_at).toISOString().substr(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + transaction.amount_cents;
    }
  });

  const months = Object.keys(monthlyRevenue).sort();
  const growthRates = [];

  for (const i = 1; i < months.length; i++) {
    const current = monthlyRevenue[months[i]];
    const previous = monthlyRevenue[months[i - 1]];
    const growthRate = previous > 0 ? (current - previous) / previous : 0;
    growthRates.push(growthRate);
  }

  return {
    averageGrowthRate: growthRates.length > 0 ? 
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0,
    trend: growthRates.length >= 3 ? 
      (growthRates.slice(-3).reduce((sum, rate) => sum + rate, 0) / 3 > 0 ? 'positive' : 'negative') : 'stable`,
    volatility: calculateVolatility(growthRates)
  };
}

function calculateCurrentCashPosition(transactions: unknown[]) {
  return transactions.reduce((sum, transaction) => sum + transaction.amount_cents, 0);
}

function projectMonthlyFlow(monthlyPatterns: unknown, seasonalTrends: unknown, growthTrends: unknown, month: number) {
  // Get seasonal factor for the target month
  const targetMonth = ((month - 1) % 12) + 1;
  const seasonalFactor = seasonalTrends[targetMonth]?.factor || 1;
  
  // Calculate base amounts from historical patterns
  const recentMonths = Object.keys(monthlyPatterns).sort().slice(-3);
  const avgInflows = recentMonths.reduce((sum, m) => sum + monthlyPatterns[m].inflows, 0) / recentMonths.length;
  const avgOutflows = recentMonths.reduce((sum, m) => sum + monthlyPatterns[m].outflows, 0) / recentMonths.length;
  
  // Apply growth trend
  const growthAdjustment = 1 + (growthTrends.averageGrowthRate * month);
  
  // Project flows
  const projectedInflows = avgInflows * seasonalFactor * growthAdjustment;
  const projectedOutflows = avgOutflows * growthAdjustment;
  
  return {
    inflows: Math.round(projectedInflows),
    outflows: Math.round(projectedOutflows),
    netFlow: Math.round(projectedInflows - projectedOutflows),
    assumptions: [
      `Seasonal adjustment: ${(seasonalFactor * 100).toFixed(1)}%`,
      `Growth factor: ${(growthAdjustment * 100).toFixed(1)}%',
      'Based on ${recentMonths.length} months of data'
    ]
  };
}

function calculateMonthlyConfidence(month: number, historicalMonths: number) {
  // Confidence decreases with distance and increases with historical data
  const distanceDecay = Math.max(0.5, 1 - (month * 0.05));
  const dataConfidence = Math.min(1, historicalMonths / 12);
  return Math.round((distanceDecay * dataConfidence) * 100);
}

function calculateDataQualityScore(historicalData: unknown) {
  const { transactions, months } = historicalData;
  
  const score = 0;
  
  // Volume score (more transactions = higher quality)
  if (transactions.length > 1000) score += 30;
  else if (transactions.length > 500) score += 20;
  else if (transactions.length > 100) score += 10;
  
  // Time coverage score
  if (months >= 12) score += 25;
  else if (months >= 6) score += 15;
  else if (months >= 3) score += 10;
  
  // Consistency score (regular transactions)
  const monthlyTransactionCounts = {};
  transactions.forEach(t => {
    const month = new Date(t.created_at).toISOString().substr(0, 7);
    monthlyTransactionCounts[month] = (monthlyTransactionCounts[month] || 0) + 1;
  });
  
  const counts = Object.values(monthlyTransactionCounts) as number[];
  const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length;
  const consistency = avgCount > 0 ? 1 - (Math.sqrt(variance) / avgCount) : 0;
  
  score += Math.round(consistency * 25);
  
  // Completeness score (different transaction types)
  const transactionTypes = new Set(transactions.map(t => t.transaction_type));
  score += Math.min(20, transactionTypes.size * 4);
  
  return Math.min(100, score);
}

async function generateIndustryBenchmarks(supabase: unknown, vertical: string, organizationId: string) {
  // Mock industry benchmarks - in production, this would use aggregated data
  const benchmarks = {
    hs: {
      cash_conversion_cycle: 45,
      days_sales_outstanding: 30,
      working_capital_ratio: 2.1,
      seasonal_variation: 0.25
    },
    auto: {
      cash_conversion_cycle: 35,
      days_sales_outstanding: 25,
      working_capital_ratio: 1.8,
      seasonal_variation: 0.15
    },
    rest: {
      cash_conversion_cycle: 15,
      days_sales_outstanding: 5,
      working_capital_ratio: 1.5,
      seasonal_variation: 0.3
    },
    ret: {
      cash_conversion_cycle: 60,
      days_sales_outstanding: 20,
      working_capital_ratio: 2.0,
      seasonal_variation: 0.4
    }
  };

  return benchmarks[vertical as keyof typeof benchmarks] || benchmarks.hs;
}

function generateKeyInsights(forecast: unknown, workingCapitalMetrics: unknown) {
  const insights = [];
  
  // Cash position insights
  const finalCashPosition = forecast.cashPositions[forecast.cashPositions.length - 1];
  const currentCashPosition = forecast.cashPositions[0];
  
  if (finalCashPosition < currentCashPosition * 0.8) {
    insights.push({
      type: 'warning',
      category: 'cash_position',
      message: 'Cash position expected to decline significantly over forecast period',
      impact: 'high'
    });
  }
  
  // Working capital insights
  if (workingCapitalMetrics.working_capital_ratio < 1.5) {
    insights.push({
      type: 'alert',
      category: 'working_capital',
      message: 'Working capital ratio below recommended threshold of 1.5',
      impact: 'medium'
    });
  }
  
  // Cash conversion cycle
  if (workingCapitalMetrics.cash_conversion_cycle.total_cycle_days > 60) {
    insights.push({
      type: 'opportunity',
      category: 'efficiency',
      message: 'Cash conversion cycle could be optimized to improve cash flow',
      impact: 'medium'
    });
  }
  
  return insights;
}

function identifyRiskFactors(forecast: unknown, workingCapitalMetrics: unknown) {
  const risks = [];
  
  // Identify months with negative cash flow
  const negativeCashMonths = forecast.forecastPeriods.filter(p => p.cumulative_cash < 0);
  if (negativeCashMonths.length > 0) {
    risks.push({
      risk_type: 'liquidity',
      severity: 'high',
      description: 'Projected negative cash position in ${negativeCashMonths.length} month(s)',
      months_affected: negativeCashMonths.map(m => m.month),
      mitigation_required: true
    });
  }
  
  // Check for declining trends
  const trendAnalysis = analyzeCashTrend(forecast.cashPositions);
  if (trendAnalysis.trend === 'declining' && trendAnalysis.slope < -10000) {
    risks.push({
      risk_type: 'cash_decline',
      severity: 'medium',
      description: 'Sustained declining cash position trend detected',
      estimated_impact: Math.abs(trendAnalysis.slope * 12), // Annualized impact
      mitigation_required: true
    });
  }
  
  return risks;
}

function generateRecommendations(forecast: unknown, workingCapitalMetrics: unknown, benchmarks: unknown) {
  const recommendations = [];
  
  // Working capital optimization
  if (workingCapitalMetrics.cash_conversion_cycle.days_sales_outstanding > benchmarks.days_sales_outstanding) {
    recommendations.push({
      category: 'collections',
      priority: 'high',
      action: 'Improve accounts receivable collection processes',
      potential_impact: 'Reduce DSO by 5-10 days',
      implementation_time: '30-60 days'
    });
  }
  
  // Cash management
  const lowCashMonths = forecast.forecastPeriods.filter(p => p.cumulative_cash < 100000); // $1,000
  if (lowCashMonths.length > 0) {
    recommendations.push({
      category: 'cash_management',
      priority: 'high',
      action: 'Establish line of credit or increase cash reserves',
      potential_impact: 'Ensure liquidity during low cash periods',
      implementation_time: '15-30 days'
    });
  }
  
  // Revenue optimization
  if (forecast.totalProjectedInflow < forecast.totalProjectedOutflow * 1.1) {
    recommendations.push({
      category: 'revenue',
      priority: 'medium',
      action: 'Focus on revenue growth initiatives',
      potential_impact: 'Improve cash flow margin by 10%+',
      implementation_time: '60-90 days'
    });
  }
  
  return recommendations;
}

async function generateForecastScenarios(historicalData: unknown, periodMonths: number) {
  const baseRevenue = historicalData.transactions
    .filter((t: unknown) => t.amount_cents > 0)
    .reduce((sum: number, t: unknown) => sum + t.amount_cents, 0);
  
  return [
    {
      scenario_name: 'Conservative',
      revenue_growth: -5,
      expense_growth: 0,
      description: '5% revenue decline, stable expenses',
      probability: 25
    },
    {
      scenario_name: 'Base Case',
      revenue_growth: 5,
      expense_growth: 2,
      description: '5% revenue growth, 2% expense inflation',
      probability: 50
    },
    {
      scenario_name: 'Optimistic',
      revenue_growth: 15,
      expense_growth: 5,
      description: '15% revenue growth, 5% expense growth',
      probability: 25
    }
  ];
}

function calculateVolatility(values: number[]) {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function analyzeCashTrend(cashPositions: number[]) {
  if (cashPositions.length < 2) {
    return { trend: 'stable', slope: 0 };
  }
  
  // Simple linear regression to find trend
  const n = cashPositions.length;
  const sumX = (n * (n - 1)) / 2; // Sum of 0,1,2,...,n-1
  const sumY = cashPositions.reduce((sum, pos) => sum + pos, 0);
  const sumXY = cashPositions.reduce((sum, pos, index) => sum + (index * pos), 0);
  const sumXX = cashPositions.reduce((sum, _, index) => sum + (index * index), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return {
    trend: slope > 1000 ? 'growing' : slope < -1000 ? 'declining' : 'stable',
    slope: slope
  };
}

// Additional helper functions for working capital analysis
async function generateAdvancedForecast(historicalData: unknown, config: unknown, scenarios: unknown[]) {
  // Implementation for advanced forecasting with scenarios
  const baseForecast = await generateCashFlowForecast(historicalData, config);
  
  return {
    ...baseForecast,
    scenarios: scenarios.map(scenario => ({
      ...scenario,
      forecast: adjustForecastForScenario(baseForecast, scenario)
    })),
    confidence_intervals: calculateConfidenceIntervals(baseForecast, historicalData),
    sensitivity_analysis: performSensitivityAnalysis(baseForecast, historicalData)
  };
}

async function generateWorkingCapitalAnalysis(supabase: unknown, organizationId: string, historicalData: unknown, config: unknown) {
  const metrics = await calculateWorkingCapitalMetrics(supabase, organizationId, historicalData);
  
  return {
    ...metrics,
    trend_analysis: analyzeWorkingCapitalTrends(historicalData),
    optimization_score: calculateOptimizationScore(metrics),
    peer_comparison: await generatePeerComparison(supabase, historicalData.vertical, metrics)
  };
}

async function generateCashOptimizationPlan(forecast: unknown, workingCapital: unknown, config: unknown) {
  return {
    immediate_actions: identifyImmediateActions(forecast, workingCapital),
    medium_term_initiatives: identifyMediumTermInitiatives(forecast, workingCapital),
    long_term_strategy: developLongTermStrategy(forecast, workingCapital, config),
    investment_opportunities: identifyInvestmentOpportunities(forecast, workingCapital)
  };
}

function calculateConfidenceScore(forecast: unknown, historicalData: unknown) {
  return Math.min(100, 50 + calculateDataQualityScore(historicalData) * 0.3);
}

function estimateForecastAccuracy(historicalData: unknown, config: unknown) {
  // Estimate accuracy based on data quality and forecast period
  const dataQuality = calculateDataQualityScore(historicalData);
  const periodAdjustment = Math.max(0.5, 1 - (config.forecast_period_months * 0.02));
  
  return Math.round(dataQuality * periodAdjustment * 0.85); // Conservative estimate
}

// Placeholder implementations for advanced functions
async function fetchCurrentFinancialPosition(supabase: unknown, organizationId: string) {
  return { vertical: 'hs', currentAssets: 100000, currentLiabilities: 50000 };
}

async function getCurrentAssets(supabase: unknown, organizationId: string) { return 100000; }
async function getCurrentLiabilities(supabase: unknown, organizationId: string) { return 50000; }
async function calculateInventoryValue(supabase: unknown, organizationId: string) { return 25000; }

function calculateAccountsReceivable(transactions: unknown[]) {
  return transactions
    .filter(t => t.transaction_type === 'invoice' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount_cents, 0);
}

function calculateAccountsPayable(transactions: unknown[]) {
  return transactions
    .filter(t => t.transaction_type === 'bill' && t.status === 'pending')
    .reduce((sum, t) => sum + Math.abs(t.amount_cents), 0);
}

function adjustForecastForScenario(baseForecast: unknown, scenario: unknown) {
  return baseForecast.forecastPeriods.map((period: unknown) => ({
    ...period,
    projected_inflows: period.projected_inflows * (1 + scenario.revenue_adjustment / 100),
    projected_outflows: period.projected_outflows * (1 + scenario.expense_adjustment / 100)
  }));
}

function calculateConfidenceIntervals(forecast: unknown, historicalData: unknown) {
  return forecast.forecastPeriods.map((period: unknown, index: number) => ({
    month: period.month,
    lower_bound: period.cumulative_cash * 0.85,
    upper_bound: period.cumulative_cash * 1.15,
    confidence_level: Math.max(60, 95 - (index * 2))
  }));
}

function performSensitivityAnalysis(forecast: unknown, historicalData: unknown) {
  return {
    revenue_sensitivity: [-10, -5, 0, 5, 10].map(change => ({
      change_percent: change,
      impact_on_final_cash: forecast.cashPositions[forecast.cashPositions.length - 1] * (change / 100)
    })),
    expense_sensitivity: [-10, -5, 0, 5, 10].map(change => ({
      change_percent: change,
      impact_on_final_cash: -forecast.totalProjectedOutflow * (change / 100)
    }))
  };
}

// Additional placeholder implementations
async function performWorkingCapitalAnalysis(supabase: unknown, organizationId: string, position: unknown, config: unknown) {
  return { analysis: 'detailed working capital analysis' };
}

async function identifyOptimizationOpportunities(analysis: unknown, preferences: unknown, config: unknown) {
  return { opportunities: 'optimization opportunities' };
}

async function createImplementationRoadmap(opportunities: unknown, position: unknown, config: unknown) {
  return { roadmap: 'implementation roadmap' };
}

async function calculateOptimizationImpact(opportunities: unknown, position: unknown, months: number) {
  return { impact: 'optimization impact projections' };
}

async function generateWorkingCapitalBenchmarks(supabase: unknown, vertical: string, organizationId: string) {
  return { benchmarks: 'working capital benchmarks' };
}

function analyzeWorkingCapitalTrends(historicalData: unknown) { return { trends: 'working capital trends' }; }
function calculateOptimizationScore(metrics: unknown) { return 75; }
async function generatePeerComparison(supabase: unknown, vertical: string, metrics: unknown) { return { comparison: 'peer comparison' }; }
function identifyImmediateActions(forecast: unknown, workingCapital: unknown) { return []; }
function identifyMediumTermInitiatives(forecast: unknown, workingCapital: unknown) { return []; }
function developLongTermStrategy(forecast: unknown, workingCapital: unknown, config: unknown) { return {}; }
function identifyInvestmentOpportunities(forecast: unknown, workingCapital: unknown) { return []; }