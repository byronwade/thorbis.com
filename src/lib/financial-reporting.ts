import { ChartOfAccount, Transaction, Customer, Vendor } from '@/types/accounting'

export interface FinancialStatement {
  id: string
  name: string
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'statement_of_equity'
  period_start: string
  period_end: string
  accounts: FinancialStatementAccount[]
  totals: FinancialStatementTotals
  ai_insights: ReportInsight[]
  generated_at: string
}

export interface FinancialStatementAccount {
  account_id: string
  account_code: string
  account_name: string
  account_type: string
  current_period: number
  prior_period: number
  variance: number
  variance_percentage: number
  ai_analysis?: {
    trend: 'increasing' | 'decreasing' | 'stable'
    significance: 'high' | 'medium' | 'low'
    explanation: string
  }
}

export interface FinancialStatementTotals {
  total_assets?: number
  total_liabilities?: number
  total_equity?: number
  total_revenue?: number
  total_expenses?: number
  net_income?: number
  operating_cash_flow?: number
  investing_cash_flow?: number
  financing_cash_flow?: number
  net_cash_change?: number
}

export interface ReportInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'benchmark'
  title: string
  description: string
  confidence: number
  impact_score: number
  recommendation?: string
  data_points: Array<{
    metric: string
    value: number
    benchmark?: number
    trend_direction: 'up' | 'down' | 'stable'
  }>
}

export interface KPIMetric {
  name: string
  value: number
  unit: 'currency' | 'percentage' | 'ratio' | 'days' | 'count'
  benchmark_value?: number
  trend: 'improving' | 'declining' | 'stable'
  category: 'profitability' | 'liquidity' | 'efficiency' | 'leverage' | 'growth'
  ai_interpretation: string
}

export interface TrendAnalysis {
  metric_name: string
  time_series: Array<{
    period: string
    value: number
    projected?: boolean
  }>
  trend_strength: number
  seasonality_detected: boolean
  forecast_confidence: number
  next_period_prediction: number
  risk_factors: string[]
}

export interface BenchmarkComparison {
  company_metric: number
  industry_average: number
  top_quartile: number
  variance_from_industry: number
  ranking_percentile: number
  improvement_potential: number
  ai_recommendations: string[]
}

export class FinancialReporting {
  private accounts: ChartOfAccount[] = []
  private transactions: Transaction[] = []
  private customers: Customer[] = []
  private vendors: Vendor[] = []

  constructor(accounts: ChartOfAccount[], transactions: Transaction[], customers: Customer[] = [], vendors: Vendor[] = []) {
    this.accounts = accounts
    this.transactions = transactions
    this.customers = customers
    this.vendors = vendors
  }

  // Generate AI-enhanced Balance Sheet
  generateBalanceSheet(periodEnd: string, priorPeriodEnd?: string): FinancialStatement {
    const assetAccounts = this.getAccountsByType('asset', periodEnd, priorPeriodEnd)
    const liabilityAccounts = this.getAccountsByType('liability', periodEnd, priorPeriodEnd)
    const equityAccounts = this.getAccountsByType('equity', periodEnd, priorPeriodEnd)

    const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.current_period, 0)
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.current_period, 0)
    const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.current_period, 0)

    const accounts = [...assetAccounts, ...liabilityAccounts, ...equityAccounts]
    const insights = this.generateBalanceSheetInsights(accounts, totalAssets, totalLiabilities, totalEquity)

    return {
      id: 'bs_${Date.now()}',
      name: 'Balance Sheet',
      type: 'balance_sheet',
      period_start: priorPeriodEnd || periodEnd,
      period_end: periodEnd,
      accounts,
      totals: {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity
      },
      ai_insights: insights,
      generated_at: new Date().toISOString()
    }
  }

  // Generate AI-enhanced Income Statement
  generateIncomeStatement(periodStart: string, periodEnd: string, priorPeriodStart?: string, priorPeriodEnd?: string): FinancialStatement {
    const revenueAccounts = this.getAccountsByType('revenue', periodEnd, priorPeriodEnd, periodStart, priorPeriodStart)
    const expenseAccounts = this.getAccountsByType('expense', periodEnd, priorPeriodEnd, periodStart, priorPeriodStart)

    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.current_period, 0)
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.current_period, 0)
    const netIncome = totalRevenue - totalExpenses

    const accounts = [...revenueAccounts, ...expenseAccounts]
    const insights = this.generateIncomeStatementInsights(accounts, totalRevenue, totalExpenses, netIncome)

    return {
      id: 'is_${Date.now()}',
      name: 'Income Statement',
      type: 'income_statement',
      period_start: periodStart,
      period_end: periodEnd,
      accounts,
      totals: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_income: netIncome
      },
      ai_insights: insights,
      generated_at: new Date().toISOString()
    }
  }

  // Generate AI-enhanced Cash Flow Statement
  generateCashFlowStatement(periodStart: string, periodEnd: string): FinancialStatement {
    const operatingCashFlow = this.calculateOperatingCashFlow(periodStart, periodEnd)
    const investingCashFlow = this.calculateInvestingCashFlow(periodStart, periodEnd)
    const financingCashFlow = this.calculateFinancingCashFlow(periodStart, periodEnd)
    const netCashChange = operatingCashFlow + investingCashFlow + financingCashFlow

    const accounts = this.getCashFlowAccounts(periodStart, periodEnd)
    const insights = this.generateCashFlowInsights(operatingCashFlow, investingCashFlow, financingCashFlow)

    return {
      id: 'cf_${Date.now()}',
      name: 'Cash Flow Statement',
      type: 'cash_flow',
      period_start: periodStart,
      period_end: periodEnd,
      accounts,
      totals: {
        operating_cash_flow: operatingCashFlow,
        investing_cash_flow: investingCashFlow,
        financing_cash_flow: financingCashFlow,
        net_cash_change: netCashChange
      },
      ai_insights: insights,
      generated_at: new Date().toISOString()
    }
  }

  private getAccountsByType(
    type: string, 
    periodEnd: string, 
    priorPeriodEnd?: string, 
    periodStart?: string, 
    priorPeriodStart?: string
  ): FinancialStatementAccount[] {
    return this.accounts
      .filter(account => account.type === type)
      .map(account => {
        const currentBalance = this.calculateAccountBalance(account.id, periodEnd, periodStart)
        const priorBalance = priorPeriodEnd ? this.calculateAccountBalance(account.id, priorPeriodEnd, priorPeriodStart) : 0
        const variance = currentBalance - priorBalance
        const variancePercentage = priorBalance !== 0 ? (variance / Math.abs(priorBalance)) * 100 : 0

        return {
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          account_type: account.type,
          current_period: currentBalance,
          prior_period: priorBalance,
          variance,
          variance_percentage: variancePercentage,
          ai_analysis: this.analyzeAccountTrend(account, currentBalance, priorBalance, variance)
        }
      })
  }

  private calculateAccountBalance(accountId: string, endDate: string, startDate?: string): number {
    const accountTransactions = this.transactions.filter(tx => 
      tx.entries.some(entry => entry.account_id === accountId) &&
      tx.date <= endDate &&
      (startDate ? tx.date >= startDate : true) &&
      tx.status === 'posted'
    )

    return accountTransactions.reduce((balance, tx) => {
      const entry = tx.entries.find(e => e.account_id === accountId)!
      return balance + (entry.debit_amount - entry.credit_amount)
    }, 0)
  }

  private analyzeAccountTrend(account: ChartOfAccount, current: number, prior: number, variance: number) {
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    let significance: 'high' | 'medium' | 'low' = 'low'
    let explanation = '

    const changePercent = Math.abs(variance / (prior || current || 1)) * 100

    if (changePercent > 25) significance = 'high'
    else if (changePercent > 10) significance = 'medium'

    if (variance > 0) {
      trend = 'increasing'
      explanation = account.type === 'revenue' ? 
        'Revenue increased by ${changePercent.toFixed(1)}%, indicating business growth' :
        account.type === 'expense` ?
        `Expenses increased by ${changePercent.toFixed(1)}%, monitor for cost control' :
        '${account.type} increased by ${changePercent.toFixed(1)}%'
    } else if (variance < 0) {
      trend = 'decreasing'
      explanation = account.type === 'revenue' ? 
        'Revenue decreased by ${changePercent.toFixed(1)}%, requires attention' :
        account.type === 'expense` ?
        `Expenses decreased by ${changePercent.toFixed(1)}%, showing cost efficiency` :
        `${account.type} decreased by ${changePercent.toFixed(1)}%'
    } else {
      explanation = '${account.type} remained stable with minimal change'
    }

    return { trend, significance, explanation }
  }

  // AI-powered report insights generation
  private generateBalanceSheetInsights(accounts: FinancialStatementAccount[], totalAssets: number, totalLiabilities: number, totalEquity: number): ReportInsight[] {
    const insights: ReportInsight[] = []

    // Liquidity analysis
    const currentAssets = accounts.filter(acc => acc.account_name.includes('Cash') || acc.account_name.includes('Receivable')).reduce((sum, acc) => sum + acc.current_period, 0)
    const currentLiabilities = accounts.filter(acc => acc.account_name.includes('Payable') || acc.account_name.includes('Accrued')).reduce((sum, acc) => sum + acc.current_period, 0)
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

    if (currentRatio < 1.2) {
      insights.push({
        type: 'warning',
        title: 'Low Liquidity Warning',
        description: 'Current ratio of ${currentRatio.toFixed(2)} indicates potential cash flow issues',
        confidence: 0.85,
        impact_score: 8,
        recommendation: 'Consider improving cash collection or securing additional credit facilities',
        data_points: [
          { metric: 'Current Ratio', value: currentRatio, benchmark: 1.5, trend_direction: 'down' },
          { metric: 'Current Assets', value: currentAssets, trend_direction: 'stable' },
          { metric: 'Current Liabilities', value: currentLiabilities, trend_direction: 'up' }
        ]
      })
    }

    // Debt analysis
    const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : 0
    if (debtToEquityRatio > 2) {
      insights.push({
        type: 'warning',
        title: 'High Leverage Risk',
        description: 'Debt-to-equity ratio of ${debtToEquityRatio.toFixed(2)} exceeds recommended levels',
        confidence: 0.9,
        impact_score: 7,
        recommendation: 'Consider reducing debt or increasing equity financing',
        data_points: [
          { metric: 'Debt-to-Equity', value: debtToEquityRatio, benchmark: 1.5, trend_direction: 'up' },
          { metric: 'Total Debt', value: totalLiabilities, trend_direction: 'up' }
        ]
      })
    }

    // Growth opportunities
    const cashAccounts = accounts.filter(acc => acc.account_name.toLowerCase().includes('cash'))
    const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.current_period, 0)
    if (totalCash > totalAssets * 0.15) {
      insights.push({
        type: 'opportunity',
        title: 'Excess Cash Opportunity',
        description: '${(totalCash / totalAssets * 100).toFixed(1)}% of assets in cash - consider investment opportunities',
        confidence: 0.8,
        impact_score: 6,
        recommendation: 'Evaluate strategic investments or debt reduction opportunities',
        data_points: [
          { metric: 'Cash-to-Assets', value: totalCash / totalAssets * 100, benchmark: 10, trend_direction: 'up' }
        ]
      })
    }

    return insights
  }

  private generateIncomeStatementInsights(accounts: FinancialStatementAccount[], totalRevenue: number, totalExpenses: number, netIncome: number): ReportInsight[] {
    const insights: ReportInsight[] = []

    // Profitability analysis
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - this.getCostOfGoodsSold(accounts)) / totalRevenue) * 100 : 0
    if (grossMargin < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Gross Margin',
        description: 'Gross margin of ${grossMargin.toFixed(1)}% is below industry standards',
        confidence: 0.9,
        impact_score: 9,
        recommendation: 'Review pricing strategy and cost optimization opportunities',
        data_points: [
          { metric: 'Gross Margin %', value: grossMargin, benchmark: 40, trend_direction: 'down' }
        ]
      })
    }

    // Revenue growth analysis
    const revenueAccounts = accounts.filter(acc => acc.account_type === 'revenue')
    const avgRevenueGrowth = revenueAccounts.reduce((sum, acc) => sum + (acc.variance_percentage || 0), 0) / revenueAccounts.length
    
    if (avgRevenueGrowth > 20) {
      insights.push({
        type: 'opportunity',
        title: 'Strong Revenue Growth',
        description: 'Average revenue growth of ${avgRevenueGrowth.toFixed(1)}% indicates strong business momentum',
        confidence: 0.85,
        impact_score: 8,
        recommendation: 'Consider scaling operations to support continued growth',
        data_points: [
          { metric: 'Revenue Growth %', value: avgRevenueGrowth, benchmark: 10, trend_direction: 'up' }
        ]
      })
    }

    // Expense ratio analysis
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
    if (expenseRatio > 85) {
      insights.push({
        type: 'warning',
        title: 'High Expense Ratio',
        description: 'Expenses represent ${expenseRatio.toFixed(1)}% of revenue',
        confidence: 0.8,
        impact_score: 7,
        recommendation: 'Identify cost reduction opportunities and improve operational efficiency',
        data_points: [
          { metric: 'Expense Ratio %', value: expenseRatio, benchmark: 75, trend_direction: 'up' }
        ]
      })
    }

    return insights
  }

  private generateCashFlowInsights(operating: number, investing: number, financing: number): ReportInsight[] {
    const insights: ReportInsight[] = []

    // Operating cash flow analysis
    if (operating < 0) {
      insights.push({
        type: 'warning',
        title: 'Negative Operating Cash Flow',
        description: 'Operations are consuming cash rather than generating it',
        confidence: 0.95,
        impact_score: 9,
        recommendation: 'Focus on improving collections and managing expenses',
        data_points: [
          { metric: 'Operating Cash Flow', value: operating, benchmark: 0, trend_direction: 'down' }
        ]
      })
    }

    // Investment activity analysis
    if (Math.abs(investing) > Math.abs(operating) * 0.5 && operating > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Significant Investment Activity',
        description: 'High investing cash flow relative to operations indicates growth investments',
        confidence: 0.8,
        impact_score: 6,
        recommendation: 'Monitor ROI on investments and ensure sustainable cash flow',
        data_points: [
          { metric: 'Investing Cash Flow', value: investing, trend_direction: 'down' },
          { metric: 'Investment-to-Operations Ratio', value: Math.abs(investing) / operating * 100, benchmark: 30, trend_direction: 'up' }
        ]
      })
    }

    return insights
  }

  private getCostOfGoodsSold(accounts: FinancialStatementAccount[]): number {
    return accounts
      .filter(acc => acc.account_name.toLowerCase().includes('cost') && acc.account_type === 'expense')
      .reduce((sum, acc) => sum + acc.current_period, 0)
  }

  private calculateOperatingCashFlow(periodStart: string, periodEnd: string): number {
    // Simplified calculation - in production this would be more sophisticated
    const operatingTransactions = this.transactions.filter(tx => 
      tx.date >= periodStart && 
      tx.date <= periodEnd &&
      tx.status === 'posted' &&
      (tx.type === 'income' || tx.type === 'expense')
    )

    return operatingTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  }

  private calculateInvestingCashFlow(periodStart: string, periodEnd: string): number {
    // Mock calculation for investing activities
    return Math.random() * -50000 - 10000 // Typically negative (cash outflow)
  }

  private calculateFinancingCashFlow(periodStart: string, periodEnd: string): number {
    // Mock calculation for financing activities
    return Math.random() * 30000 - 15000 // Can be positive or negative
  }

  private getCashFlowAccounts(periodStart: string, periodEnd: string): FinancialStatementAccount[] {
    // Simplified - return key cash flow categories
    return [
      {
        account_id: 'cf_operating',
        account_code: '1000',
        account_name: 'Net Cash from Operating Activities',
        account_type: 'cash_flow',
        current_period: this.calculateOperatingCashFlow(periodStart, periodEnd),
        prior_period: 0,
        variance: 0,
        variance_percentage: 0
      },
      {
        account_id: 'cf_investing',
        account_code: '2000',
        account_name: 'Net Cash from Investing Activities',
        account_type: 'cash_flow',
        current_period: this.calculateInvestingCashFlow(periodStart, periodEnd),
        prior_period: 0,
        variance: 0,
        variance_percentage: 0
      },
      {
        account_id: 'cf_financing',
        account_code: '3000',
        account_name: 'Net Cash from Financing Activities',
        account_type: 'cash_flow',
        current_period: this.calculateFinancingCashFlow(periodStart, periodEnd),
        prior_period: 0,
        variance: 0,
        variance_percentage: 0
      }
    ]
  }

  // Calculate comprehensive KPI metrics with AI analysis
  calculateKPIMetrics(periodStart: string, periodEnd: string): KPIMetric[] {
    const balanceSheet = this.generateBalanceSheet(periodEnd)
    const incomeStatement = this.generateIncomeStatement(periodStart, periodEnd)

    const totalAssets = balanceSheet.totals.total_assets || 0
    const totalLiabilities = balanceSheet.totals.total_liabilities || 0
    const totalRevenue = incomeStatement.totals.total_revenue || 0
    const netIncome = incomeStatement.totals.net_income || 0

    const metrics: KPIMetric[] = []

    // Profitability KPIs
    const netProfitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
    metrics.push({
      name: 'Net Profit Margin',
      value: netProfitMargin,
      unit: 'percentage',
      benchmark_value: 15,
      trend: netProfitMargin > 15 ? 'improving' : 'declining',
      category: 'profitability',
      ai_interpretation: '${netProfitMargin.toFixed(1)}% net margin ${netProfitMargin > 15 ? 'exceeds' : 'below'} industry benchmark of 15%'
    })

    const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0
    metrics.push({
      name: 'Return on Assets (ROA)',
      value: roa,
      unit: 'percentage',
      benchmark_value: 8,
      trend: roa > 8 ? 'improving' : 'declining',
      category: 'efficiency',
      ai_interpretation: '${roa.toFixed(1)}% ROA indicates ${roa > 8 ? 'efficient' : 'room for improvement in'} asset utilization'
    })

    // Liquidity KPIs
    const currentAssets = this.getCurrentAssets()
    const currentLiabilities = this.getCurrentLiabilities()
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

    metrics.push({
      name: 'Current Ratio',
      value: currentRatio,
      unit: 'ratio',
      benchmark_value: 2.0,
      trend: currentRatio > 2 ? 'improving' : currentRatio > 1.2 ? 'stable' : 'declining',
      category: 'liquidity',
      ai_interpretation: 'Current ratio of ${currentRatio.toFixed(2)} indicates ${currentRatio > 2 ? 'strong' : currentRatio > 1.2 ? 'adequate' : 'concerning'} liquidity position'
    })

    // Efficiency KPIs
    const receivables = this.getAccountsReceivable()
    const dso = totalRevenue > 0 ? (receivables / totalRevenue) * 365 : 0
    metrics.push({
      name: 'Days Sales Outstanding (DSO)',
      value: dso,
      unit: 'days',
      benchmark_value: 45,
      trend: dso < 45 ? 'improving' : 'declining',
      category: 'efficiency',
      ai_interpretation: '${dso.toFixed(0)} days DSO ${dso < 45 ? 'shows efficient' : 'indicates slow'} collection processes'
    })

    return metrics
  }

  // Generate trend analysis with forecasting
  generateTrendAnalysis(metric: string, periods: number = 12): TrendAnalysis {
    const timeSeriesData = this.generateTimeSeriesData(metric, periods)
    
    // Calculate trend strength using linear regression
    const trendStrength = this.calculateTrendStrength(timeSeriesData.map(d => d.value))
    
    // Simple seasonality detection
    const seasonalityDetected = this.detectSeasonality(timeSeriesData.map(d => d.value))
    
    // Forecast next period using simple trend extrapolation
    const recentValues = timeSeriesData.slice(-3).map(d => d.value)
    const avgRecentGrowth = (recentValues[2] - recentValues[0]) / 2
    const nextPeriodPrediction = recentValues[2] + avgRecentGrowth

    // Identify risk factors
    const riskFactors: string[] = []
    const volatility = this.calculateVolatility(timeSeriesData.map(d => d.value))
    if (volatility > 0.2) riskFactors.push('High volatility in metric')
    if (trendStrength < -0.5) riskFactors.push('Strong declining trend')

    const forecastConfidence = Math.max(0.3, 0.9 - volatility)

    // Add forecast point
    const lastPeriod = timeSeriesData[timeSeriesData.length - 1]
    const nextPeriod = this.getNextPeriod(lastPeriod.period)
    timeSeriesData.push({
      period: nextPeriod,
      value: nextPeriodPrediction,
      projected: true
    })

    return {
      metric_name: metric,
      time_series: timeSeriesData,
      trend_strength: trendStrength,
      seasonality_detected: seasonalityDetected,
      forecast_confidence: forecastConfidence,
      next_period_prediction: nextPeriodPrediction,
      risk_factors: riskFactors
    }
  }

  private generateTimeSeriesData(metric: string, periods: number): Array<{ period: string, value: number, projected?: boolean }> {
    const data: Array<{ period: string, value: number }> = []
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const period = date.toISOString().slice(0, 7) // YYYY-MM format
      
      // Mock data with realistic variations
      const value = 50000 + Math.sin(i * 0.5) * 10000 + (Math.random() - 0.5) * 5000
      if (metric.includes('Revenue')) value *= 2
      if (metric.includes('Expense')) value *= 0.8
      
      data.push({ period, value: Math.round(value) })
    }
    
    return data
  }

  private calculateTrendStrength(values: number[]): number {
    if (values.length < 3) return 0
    
    // Simple linear trend calculation
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const avgValue = sumY / n
    
    // Normalize slope relative to average value
    return avgValue > 0 ? slope / avgValue : 0
  }

  private detectSeasonality(values: number[]): boolean {
    if (values.length < 12) return false
    
    // Simple seasonality detection - check for recurring patterns
    const quarterlyValues: number[] = []
    for (const q = 0; q < 4; q++) {
      const quarterSum = values.filter((_, i) => i % 4 === q).reduce((sum, val) => sum + val, 0)
      quarterlyValues.push(quarterSum)
    }
    
    const avgQuarterly = quarterlyValues.reduce((sum, val) => sum + val, 0) / 4
    const variance = quarterlyValues.reduce((sum, val) => sum + Math.pow(val - avgQuarterly, 2), 0) / 4
    const coefficient = Math.sqrt(variance) / avgQuarterly
    
    return coefficient > 0.15 // If quarterly variance is significant
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0
    
    const returns = []
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        returns.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]))
      }
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    
    return Math.sqrt(variance)
  }

  private getNextPeriod(currentPeriod: string): string {
    const date = new Date(currentPeriod + '-01')
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().slice(0, 7)
  }

  // Industry benchmark comparison
  performBenchmarkAnalysis(metric: string, value: number, industry: string = 'general'): BenchmarkComparison {
    // Mock industry benchmarks - in production this would come from external data
    const benchmarks: Record<string, { industry_avg: number, top_quartile: number }> = {
      'net_profit_margin': { industry_avg: 12, top_quartile: 20 },
      'current_ratio': { industry_avg: 1.8, top_quartile: 2.5 },
      'debt_to_equity': { industry_avg: 1.2, top_quartile: 0.8 },
      'roa': { industry_avg: 6, top_quartile: 12 },
      'dso': { industry_avg: 45, top_quartile: 30 }
    }

    const benchmark = benchmarks[metric] || { industry_avg: value, top_quartile: value * 1.2 }
    const varianceFromIndustry = ((value - benchmark.industry_avg) / benchmark.industry_avg) * 100
    const rankingPercentile = value > benchmark.top_quartile ? 90 : 
                             value > benchmark.industry_avg ? 60 : 
                             value > benchmark.industry_avg * 0.8 ? 40 : 20

    const improvementPotential = Math.max(0, benchmark.top_quartile - value)

    const recommendations: string[] = []
    if (value < benchmark.industry_avg * 0.8) {
      recommendations.push('Performance significantly below industry average')
      recommendations.push('Implement immediate improvement initiatives')
      recommendations.push('Consider engaging external consultants')
    } else if (value < benchmark.industry_avg) {
      recommendations.push('Room for improvement to reach industry average')
      recommendations.push('Focus on operational efficiency gains')
    } else if (value < benchmark.top_quartile) {
      recommendations.push('Strong performance with room to reach top quartile')
      recommendations.push('Implement best practices from industry leaders')
    } else {
      recommendations.push('Top quartile performance - maintain excellence')
      recommendations.push('Consider sharing best practices with peers')
    }

    return {
      company_metric: value,
      industry_average: benchmark.industry_avg,
      top_quartile: benchmark.top_quartile,
      variance_from_industry: varianceFromIndustry,
      ranking_percentile: rankingPercentile,
      improvement_potential: improvementPotential,
      ai_recommendations: recommendations
    }
  }

  // Generate comprehensive financial health score
  calculateFinancialHealthScore(periodStart: string, periodEnd: string): {
    overall_score: number
    component_scores: {
      profitability: number
      liquidity: number
      efficiency: number
      leverage: number
    }
    strengths: string[]
    weaknesses: string[]
    priority_actions: string[]
  } {
    const kpis = this.calculateKPIMetrics(periodStart, periodEnd)
    
    // Extract component scores from KPIs
    const profitabilityKPIs = kpis.filter(kpi => kpi.category === 'profitability')
    const liquidityKPIs = kpis.filter(kpi => kpi.category === 'liquidity')
    const efficiencyKPIs = kpis.filter(kpi => kpi.category === 'efficiency')
    const leverageKPIs = kpis.filter(kpi => kpi.category === 'leverage')

    const profitabilityScore = this.calculateCategoryScore(profitabilityKPIs)
    const liquidityScore = this.calculateCategoryScore(liquidityKPIs)
    const efficiencyScore = this.calculateCategoryScore(efficiencyKPIs)
    const leverageScore = this.calculateCategoryScore(leverageKPIs)

    const overallScore = (profitabilityScore + liquidityScore + efficiencyScore + leverageScore) / 4

    const strengths: string[] = []
    const weaknesses: string[] = []
    const priorityActions: string[] = []

    if (profitabilityScore > 80) strengths.push('Strong profitability performance')
    else if (profitabilityScore < 60) {
      weaknesses.push('Below-average profitability')
      priorityActions.push('Focus on revenue growth and cost optimization')
    }

    if (liquidityScore > 80) strengths.push('Excellent liquidity position')
    else if (liquidityScore < 60) {
      weaknesses.push('Liquidity concerns')
      priorityActions.push('Improve cash collection and manage working capital')
    }

    if (efficiencyScore > 80) strengths.push('Highly efficient operations')
    else if (efficiencyScore < 60) {
      weaknesses.push('Operational inefficiencies')
      priorityActions.push('Streamline processes and improve asset utilization')
    }

    return {
      overall_score: overallScore,
      component_scores: {
        profitability: profitabilityScore,
        liquidity: liquidityScore,
        efficiency: efficiencyScore,
        leverage: leverageScore
      },
      strengths,
      weaknesses,
      priority_actions: priorityActions
    }
  }

  private calculateCategoryScore(kpis: KPIMetric[]): number {
    if (kpis.length === 0) return 70 // Default score

    return kpis.reduce((sum, kpi) => {
      const score = kpi.benchmark_value ? 
        Math.min(100, (kpi.value / kpi.benchmark_value) * 100) :
        70 // Default if no benchmark
      return sum + score
    }, 0) / kpis.length
  }

  // Utility methods for KPI calculations
  private getCurrentAssets(): number {
    return this.accounts
      .filter(acc => acc.type === 'asset' && (acc.subtype === 'current_asset' || acc.name.toLowerCase().includes('cash')))
      .reduce((sum, acc) => sum + acc.balance, 0)
  }

  private getCurrentLiabilities(): number {
    return this.accounts
      .filter(acc => acc.type === 'liability' && acc.subtype === 'current_liability')
      .reduce((sum, acc) => sum + acc.balance, 0)
  }

  private getAccountsReceivable(): number {
    return this.accounts
      .filter(acc => acc.name.toLowerCase().includes('receivable'))
      .reduce((sum, acc) => sum + acc.balance, 0)
  }

  // AI-powered report recommendations
  generateReportRecommendations(reportType: string, insights: ReportInsight[]): Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    expected_impact: string
    timeline: string
    resources_required: string[]
  }> {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low'
      action: string
      expected_impact: string
      timeline: string
      resources_required: string[]
    }> = []

    // High-impact recommendations based on insights
    const highImpactInsights = insights.filter(insight => insight.impact_score >= 8)
    highImpactInsights.forEach(insight => {
      if (insight.type === 'warning' && insight.title.includes('Liquidity')) {
        recommendations.push({
          priority: 'high',
          action: 'Implement cash flow forecasting and accelerated collection procedures',
          expected_impact: 'Improve liquidity position by 15-25%',
          timeline: '30-60 days',
          resources_required: ['Finance team', 'Collection procedures', 'Cash flow tools']
        })
      }

      if (insight.type === 'opportunity' && insight.title.includes('Growth')) {
        recommendations.push({
          priority: 'medium',
          action: 'Develop growth strategy and capacity planning',
          expected_impact: 'Sustain revenue growth while maintaining margins',
          timeline: '60-90 days',
          resources_required: ['Strategic planning', 'Operations team', 'Investment capital']
        })
      }
    })

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'Continue monitoring financial metrics and maintain current performance',
        expected_impact: 'Sustained financial health',
        timeline: 'Ongoing',
        resources_required: ['Regular monitoring', 'Periodic review']
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

// Utility functions
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return '${value.toFixed(decimals)}%'
}

export function getInsightColor(type: ReportInsight['type']): string {
  switch (type) {
    case 'warning': return 'text-red-600 bg-red-50 border-red-200'
    case 'opportunity': return 'text-green-600 bg-green-50 border-green-200'
    case 'anomaly': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'trend': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'benchmark': return 'text-purple-600 bg-purple-50 border-purple-200'
    default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
  }
}

export function getTrendIcon(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving': return '📈'
    case 'declining': return '📉'
    case 'stable': return '➡️'
    default: return '—'
  }
}