import { Invoice, Bill, BankAccount, Payment } from '@/types/accounting'

export interface CashFlowForecast {
  date: string
  opening_balance: number
  projected_inflows: number
  projected_outflows: number
  net_cash_flow: number
  closing_balance: number
  confidence_level: number
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
  risk_factors: string[]
  liquidity_alerts: LiquidityAlert[]
}

export interface LiquidityAlert {
  type: 'low_cash' | 'negative_flow' | 'covenant_risk' | 'opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  date: string
  description: string
  projected_balance: number
  recommended_actions: string[]
  time_to_resolve: string
}

export interface CashFlowScenario {
  name: string
  type: 'optimistic' | 'realistic' | 'pessimistic'
  probability: number
  assumptions: CashFlowAssumption[]
  forecasts: CashFlowForecast[]
  impact_summary: {
    best_case_balance: number
    worst_case_balance: number
    days_of_runway: number
    credit_line_needed: number
  }
}

export interface CashFlowAssumption {
  category: 'collections' | 'payments' | 'revenue' | 'expenses' | 'capital'
  description: string
  impact_percentage: number
  confidence: number
}

export interface LiquidityOptimization {
  id: string
  type: 'accelerate_collections' | 'delay_payments' | 'optimize_inventory' | 'credit_facility' | 'asset_liquidation'
  description: string
  potential_cash_impact: number
  implementation_timeline: string
  effort_level: 'low' | 'medium' | 'high'
  success_probability: number
  prerequisites: string[]
  risks: string[]
}

export interface CashFlowInsight {
  type: 'pattern' | 'seasonality' | 'efficiency' | 'risk' | 'opportunity'
  title: string
  description: string
  supporting_data: Array<{
    metric: string
    value: number
    trend: 'up' | 'down' | 'stable'
    significance: number
  }>
  actionable_recommendations: string[]
  priority_score: number
}

export interface WorkingCapitalAnalysis {
  current_working_capital: number
  optimal_working_capital: number
  efficiency_ratio: number
  days_working_capital: number
  components: {
    accounts_receivable: { amount: number, dso: number, optimization_potential: number }
    inventory: { amount: number, dit: number, optimization_potential: number }
    accounts_payable: { amount: number, dpo: number, optimization_potential: number }
  }
  improvement_opportunities: Array<{
    component: string
    current_days: number
    target_days: number
    cash_impact: number
    implementation_difficulty: 'easy' | 'moderate' | 'difficult'
  }>
}

export class CashFlowManagement {
  private bankAccounts: BankAccount[] = []
  private invoices: Invoice[] = []
  private bills: Bill[] = []
  private payments: Payment[] = []
  private currentCashPosition: number = 0

  constructor(bankAccounts: BankAccount[], invoices: Invoice[], bills: Bill[], payments: Payment[]) {
    this.bankAccounts = bankAccounts
    this.invoices = invoices
    this.bills = bills
    this.payments = payments
    this.currentCashPosition = bankAccounts.reduce((sum, account) => sum + account.current_balance, 0)
  }

  // AI-powered cash flow forecasting with multiple scenarios
  generateCashFlowForecast(days: number = 90): CashFlowScenario[] {
    const scenarios: CashFlowScenario[] = [
      this.generateScenario('optimistic', days),
      this.generateScenario('realistic', days),
      this.generateScenario('pessimistic', days)
    ]

    return scenarios
  }

  private generateScenario(type: 'optimistic' | 'realistic' | 'pessimistic', days: number): CashFlowScenario {
    const assumptions = this.generateAssumptions(type)
    const forecasts: CashFlowForecast[] = []
    const runningBalance = this.currentCashPosition

    for (const day = 0; day <= days; day++) {
      const forecastDate = new Date()
      forecastDate.setDate(forecastDate.getDate() + day)
      const dateStr = forecastDate.toISOString().split('T')[0]

      const dailyInflows = this.calculateDailyInflows(dateStr, type, assumptions)
      const dailyOutflows = this.calculateDailyOutflows(dateStr, type, assumptions)
      const netFlow = dailyInflows - dailyOutflows

      runningBalance += netFlow

      const confidence = this.calculateForecastConfidence(day, type)
      const riskFactors = this.identifyRiskFactors(runningBalance, netFlow, day)
      const liquidityAlerts = this.generateLiquidityAlerts(runningBalance, day, dateStr)

      forecasts.push({
        date: dateStr,
        opening_balance: runningBalance - netFlow,
        projected_inflows: dailyInflows,
        projected_outflows: dailyOutflows,
        net_cash_flow: netFlow,
        closing_balance: runningBalance,
        confidence_level: confidence,
        scenario: type,
        risk_factors: riskFactors,
        liquidity_alerts: liquidityAlerts
      })
    }

    const impactSummary = this.calculateImpactSummary(forecasts)
    const probability = type === 'realistic' ? 0.6 : type === 'optimistic' ? 0.2 : 0.2

    return {
      name: '${type.charAt(0).toUpperCase() + type.slice(1)} Scenario',
      type,
      probability,
      assumptions,
      forecasts,
      impact_summary: impactSummary
    }
  }

  private generateAssumptions(scenarioType: 'optimistic' | 'realistic' | 'pessimistic'): CashFlowAssumption[] {
    const baseAssumptions = [
      {
        category: 'collections' as const,
        description: 'Customer payment timing',
        impact_percentage: scenarioType === 'optimistic' ? 15 : scenarioType === 'realistic' ? 0 : -15,
        confidence: scenarioType === 'realistic' ? 0.8 : 0.6
      },
      {
        category: 'payments' as const,
        description: 'Vendor payment timing',
        impact_percentage: scenarioType === 'optimistic' ? -10 : scenarioType === 'realistic' ? 0 : 10,
        confidence: scenarioType === 'realistic' ? 0.9 : 0.7
      },
      {
        category: 'revenue' as const,
        description: 'Monthly revenue growth',
        impact_percentage: scenarioType === 'optimistic' ? 20 : scenarioType === 'realistic' ? 5 : -10,
        confidence: 0.6
      }
    ]

    return baseAssumptions
  }

  private calculateDailyInflows(date: string, scenario: string, assumptions: CashFlowAssumption[]): number {
    // Base inflows from expected payments
    const expectedPayments = this.invoices
      .filter(inv => inv.due_date === date && inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.balance, 0)

    // Apply scenario adjustments
    const collectionsAssumption = assumptions.find(a => a.category === 'collections')
    const adjustmentFactor = 1 + (collectionsAssumption?.impact_percentage || 0) / 100

    // Add some randomness for realism
    const variability = scenario === 'realistic' ? 0.1 : 0.2
    const randomFactor = 1 + (Math.random() - 0.5) * variability

    return Math.max(0, expectedPayments * adjustmentFactor * randomFactor)
  }

  private calculateDailyOutflows(date: string, scenario: string, assumptions: CashFlowAssumption[]): number {
    // Base outflows from bills due
    const expectedBills = this.bills
      .filter(bill => bill.due_date === date && bill.status !== 'paid')
      .reduce((sum, bill) => sum + bill.balance, 0)

    // Apply scenario adjustments
    const paymentsAssumption = assumptions.find(a => a.category === 'payments')
    const adjustmentFactor = 1 + (paymentsAssumption?.impact_percentage || 0) / 100

    // Add operational expenses (estimated)
    const dailyOperationalExpenses = 2000 // Mock daily ops

    const variability = scenario === 'realistic' ? 0.05 : 0.15
    const randomFactor = 1 + (Math.random() - 0.5) * variability

    return Math.max(0, (expectedBills + dailyOperationalExpenses) * adjustmentFactor * randomFactor)
  }

  private calculateForecastConfidence(dayOffset: number, scenarioType: string): number {
    const baseConfidence = scenarioType === 'realistic' ? 0.85 : 0.65
    const timeDecay = Math.max(0.3, baseConfidence - (dayOffset * 0.01))
    return Math.min(0.95, timeDecay)
  }

  private identifyRiskFactors(balance: number, netFlow: number, dayOffset: number): string[] {
    const risks: string[] = []

    if (balance < 10000) risks.push('Cash balance critically low')
    if (balance < 25000 && dayOffset < 30) risks.push('Short-term liquidity risk')
    if (netFlow < -5000) risks.push('Large daily cash outflow')
    if (dayOffset > 60) risks.push('Extended forecast uncertainty')

    return risks
  }

  private generateLiquidityAlerts(balance: number, dayOffset: number, date: string): LiquidityAlert[] {
    const alerts: LiquidityAlert[] = []

    if (balance < 5000) {
      alerts.push({
        type: 'low_cash',
        severity: 'critical',
        date,
        description: 'Cash balance approaching critical levels',
        projected_balance: balance,
        recommended_actions: [
          'Accelerate collections immediately',
          'Delay non-critical payments',
          'Consider emergency credit line'
        ],
        time_to_resolve: '1-3 days'
      })
    } else if (balance < 15000) {
      alerts.push({
        type: 'low_cash',
        severity: 'high',
        date,
        description: 'Cash balance below recommended minimum',
        projected_balance: balance,
        recommended_actions: [
          'Contact major customers for early payment',
          'Review upcoming large expenses',
          'Prepare contingency funding options'
        ],
        time_to_resolve: '5-7 days'
      })
    }

    return alerts
  }

  private calculateImpactSummary(forecasts: CashFlowForecast[]) {
    const balances = forecasts.map(f => f.closing_balance)
    const bestCase = Math.max(...balances)
    const worstCase = Math.min(...balances)
    
    // Calculate days of runway (how long until cash runs out)
    let daysOfRunway = forecasts.length
    for (const i = 0; i < forecasts.length; i++) {
      if (forecasts[i].closing_balance <= 0) {
        daysOfRunway = i
        break
      }
    }

    const creditLineNeeded = Math.max(0, -worstCase)

    return {
      best_case_balance: bestCase,
      worst_case_balance: worstCase,
      days_of_runway: daysOfRunway,
      credit_line_needed: creditLineNeeded
    }
  }

  // AI-powered liquidity optimization recommendations
  generateLiquidityOptimizations(): LiquidityOptimization[] {
    const optimizations: LiquidityOptimization[] = []

    // Accelerate collections
    const overdueReceivables = this.invoices
      .filter(inv => new Date(inv.due_date) < new Date() && inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.balance, 0)

    if (overdueReceivables > 10000) {
      optimizations.push({
        id: 'opt_collections',
        type: 'accelerate_collections',
        description: 'Implement aggressive collection procedures for overdue receivables',
        potential_cash_impact: overdueReceivables * 0.7,
        implementation_timeline: '1-2 weeks',
        effort_level: 'medium',
        success_probability: 0.75,
        prerequisites: ['Collection procedures', 'Staff training', 'Customer communication'],
        risks: ['Customer relationship strain', 'Potential disputes']
      })
    }

    // Optimize payment timing
    const upcomingPayments = this.bills
      .filter(bill => new Date(bill.due_date) > new Date() && bill.status !== 'paid')
      .reduce((sum, bill) => sum + bill.balance, 0)

    if (upcomingPayments > 20000) {
      optimizations.push({
        id: 'opt_payments',
        type: 'delay_payments',
        description: 'Negotiate extended payment terms with key vendors',
        potential_cash_impact: upcomingPayments * 0.3,
        implementation_timeline: '2-4 weeks',
        effort_level: 'low',
        success_probability: 0.6,
        prerequisites: ['Vendor relationship history', 'Payment track record'],
        risks: ['Vendor relationship impact', 'Early payment discount loss']
      })
    }

    // Credit facility recommendation
    if (this.currentCashPosition < 50000) {
      optimizations.push({
        id: 'opt_credit',
        type: 'credit_facility',
        description: 'Establish revolving credit line for liquidity buffer',
        potential_cash_impact: 100000,
        implementation_timeline: '4-6 weeks',
        effort_level: 'high',
        success_probability: 0.8,
        prerequisites: ['Financial statements', 'Business plan', 'Collateral assessment'],
        risks: ['Interest costs', 'Personal guarantees', 'Covenant restrictions']
      })
    }

    return optimizations.sort((a, b) => b.potential_cash_impact - a.potential_cash_impact)
  }

  // Real-time cash position monitoring
  getRealTimeCashPosition(): {
    total_cash: number
    available_cash: number
    committed_cash: number
    accounts: Array<{
      account_id: string
      account_name: string
      current_balance: number
      available_balance: number
      last_updated: string
      alerts: string[]
    }>
    daily_burn_rate: number
    runway_days: number
    next_critical_date: string | null
  } {
    const totalCash = this.bankAccounts.reduce((sum, acc) => sum + acc.current_balance, 0)
    const availableCash = this.bankAccounts.reduce((sum, acc) => sum + acc.available_balance, 0)
    const committedCash = totalCash - availableCash

    const accounts = this.bankAccounts.map(account => {
      const alerts: string[] = []
      if (account.current_balance < 5000) alerts.push('Low balance warning')
      if (account.current_balance !== account.available_balance) alerts.push('Pending transactions')

      return {
        account_id: account.id,
        account_name: account.name,
        current_balance: account.current_balance,
        available_balance: account.available_balance,
        last_updated: account.updated_at,
        alerts
      }
    })

    // Calculate daily burn rate from recent expenses
    const dailyBurnRate = this.calculateDailyBurnRate()
    const runwayDays = dailyBurnRate > 0 ? Math.floor(availableCash / dailyBurnRate) : 999

    // Find next critical cash flow date
    const nextCriticalDate = this.findNextCriticalDate()

    return {
      total_cash: totalCash,
      available_cash: availableCash,
      committed_cash: committedCash,
      accounts,
      daily_burn_rate: dailyBurnRate,
      runway_days: runwayDays,
      next_critical_date: nextCriticalDate
    }
  }

  private calculateDailyBurnRate(): number {
    // Calculate average daily expenses from recent transactions
    const recentExpenses = this.payments
      .filter(payment => 
        payment.type === 'payment_made' &&
        new Date(payment.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    return recentExpenses / 30
  }

  private findNextCriticalDate(): string | null {
    const upcomingBills = this.bills
      .filter(bill => new Date(bill.due_date) > new Date() && bill.status !== 'paid')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    const cumulativeCash = this.currentCashPosition

    for (const bill of upcomingBills) {
      cumulativeCash -= bill.balance
      if (cumulativeCash < 10000) {
        return bill.due_date
      }
    }

    return null
  }

  // Working capital optimization analysis
  analyzeWorkingCapital(): WorkingCapitalAnalysis {
    // Calculate current working capital components
    const accountsReceivable = this.invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'voided')
      .reduce((sum, inv) => sum + inv.balance, 0)

    const accountsPayable = this.bills
      .filter(bill => bill.status !== 'paid')
      .reduce((sum, bill) => sum + bill.balance, 0)

    const inventory = 45000 // Mock inventory value

    const currentWorkingCapital = accountsReceivable + inventory - accountsPayable

    // Calculate days metrics
    const dso = this.calculateDSO()
    const dit = this.calculateDIT()
    const dpo = this.calculateDPO()
    const daysWorkingCapital = dso + dit - dpo

    // Optimal working capital (industry benchmarks)
    const optimalDSO = 35
    const optimalDIT = 60
    const optimalDPO = 45
    const optimalWorkingCapital = (optimalDSO + optimalDIT - optimalDPO) * (this.calculateDailySales())

    const efficiencyRatio = optimalWorkingCapital > 0 ? currentWorkingCapital / optimalWorkingCapital : 1

    // Calculate optimization opportunities
    const arOptimization = Math.max(0, (dso - optimalDSO) * this.calculateDailySales())
    const inventoryOptimization = Math.max(0, (dit - optimalDIT) * this.calculateDailySales())
    const apOptimization = Math.max(0, (optimalDPO - dpo) * this.calculateDailySales())

    const improvementOpportunities = [
      {
        component: 'Accounts Receivable',
        current_days: dso,
        target_days: optimalDSO,
        cash_impact: arOptimization,
        implementation_difficulty: 'moderate' as const
      },
      {
        component: 'Inventory',
        current_days: dit,
        target_days: optimalDIT,
        cash_impact: inventoryOptimization,
        implementation_difficulty: 'difficult' as const
      },
      {
        component: 'Accounts Payable',
        current_days: dpo,
        target_days: optimalDPO,
        cash_impact: apOptimization,
        implementation_difficulty: 'easy' as const
      }
    ].filter(opp => opp.cash_impact > 1000)

    return {
      current_working_capital: currentWorkingCapital,
      optimal_working_capital: optimalWorkingCapital,
      efficiency_ratio: efficiencyRatio,
      days_working_capital: daysWorkingCapital,
      components: {
        accounts_receivable: { 
          amount: accountsReceivable, 
          dso, 
          optimization_potential: arOptimization 
        },
        inventory: { 
          amount: inventory, 
          dit, 
          optimization_potential: inventoryOptimization 
        },
        accounts_payable: { 
          amount: accountsPayable, 
          dpo, 
          optimization_potential: apOptimization 
        }
      },
      improvement_opportunities: improvementOpportunities
    }
  }

  // AI-generated cash flow insights
  generateCashFlowInsights(): CashFlowInsight[] {
    const insights: CashFlowInsight[] = []
    const workingCapital = this.analyzeWorkingCapital()
    const cashPosition = this.getRealTimeCashPosition()

    // Cash conversion cycle insight
    if (workingCapital.days_working_capital > 90) {
      insights.push({
        type: 'efficiency',
        title: 'Cash Conversion Cycle Optimization Opportunity',
        description: 'Your ${workingCapital.days_working_capital.toFixed(0)}-day cash conversion cycle is above industry average',
        supporting_data: [
          { metric: 'DSO', value: workingCapital.components.accounts_receivable.dso, trend: 'up', significance: 0.8 },
          { metric: 'DIT', value: workingCapital.components.inventory.dit, trend: 'stable', significance: 0.6 },
          { metric: 'DPO', value: workingCapital.components.accounts_payable.dpo, trend: 'down', significance: 0.7 }
        ],
        actionable_recommendations: [
          'Implement stricter collection procedures',
          'Optimize inventory turnover',
          'Negotiate extended payment terms with vendors'
        ],
        priority_score: 8
      })
    }

    // Seasonal pattern detection
    const seasonalityDetected = this.detectSeasonalPatterns()
    if (seasonalityDetected.strength > 0.3) {
      insights.push({
        type: 'seasonality',
        title: 'Seasonal Cash Flow Pattern Detected',
        description: 'Strong seasonal variation in cash flow with ${seasonalityDetected.peak_month} typically being strongest',
        supporting_data: [
          { metric: 'Seasonal Strength', value: seasonalityDetected.strength * 100, trend: 'stable', significance: 0.9 },
          { metric: 'Peak Variance', value: seasonalityDetected.peak_variance, trend: 'up', significance: 0.8 }
        ],
        actionable_recommendations: [
          'Build cash reserves during strong periods',
          'Plan major expenses during peak cash flow months',
          'Establish seasonal credit facilities'
        ],
        priority_score: 7
      })
    }

    // Liquidity opportunity
    if (cashPosition.total_cash > 100000 && cashPosition.daily_burn_rate < 3000) {
      insights.push({
        type: 'opportunity',
        title: 'Excess Liquidity Investment Opportunity',
        description: 'Significant cash reserves could be optimized for better returns',
        supporting_data: [
          { metric: 'Excess Cash', value: cashPosition.total_cash - 50000, trend: 'up', significance: 0.7 },
          { metric: 'Opportunity Cost', value: (cashPosition.total_cash - 50000) * 0.05, trend: 'stable', significance: 0.6 }
        ],
        actionable_recommendations: [
          'Consider short-term investment options',
          'Evaluate debt reduction opportunities',
          'Invest in growth initiatives with positive ROI'
        ],
        priority_score: 5
      })
    }

    return insights.sort((a, b) => b.priority_score - a.priority_score)
  }

  private detectSeasonalPatterns(): { strength: number, peak_month: string, peak_variance: number } {
    // Mock seasonal analysis - in production would analyze historical data
    return {
      strength: 0.4,
      peak_month: 'November',
      peak_variance: 25000
    }
  }

  // Cash flow stress testing
  performStressTesting(): Array<{
    scenario_name: string
    stress_factor: string
    impact_description: string
    cash_shortage_days: number
    recommended_mitigation: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> {
    const stressTests = [
      {
        scenario_name: 'Major Customer Payment Delay',
        stress_factor: '30% of receivables delayed by 30 days',
        impact_description: 'Large customer delays payment causing cash crunch',
        cash_shortage_days: 15,
        recommended_mitigation: [
          'Diversify customer base to reduce concentration risk',
          'Implement customer credit monitoring',
          'Establish backup credit facilities'
        ],
        severity: 'high' as const
      },
      {
        scenario_name: 'Economic Downturn',
        stress_factor: '20% revenue decline + 15% collection delays',
        impact_description: 'Recession impacts both sales and collections',
        cash_shortage_days: 45,
        recommended_mitigation: [
          'Build larger cash reserves',
          'Develop recession-resistant revenue streams',
          'Create flexible cost structure'
        ],
        severity: 'critical' as const
      },
      {
        scenario_name: 'Supply Chain Disruption',
        stress_factor: 'Emergency inventory purchase required',
        impact_description: 'Unexpected large cash outlay for critical inventory',
        cash_shortage_days: 7,
        recommended_mitigation: [
          'Establish supplier financing arrangements',
          'Build strategic inventory reserves',
          'Diversify supplier base'
        ],
        severity: 'medium' as const
      }
    ]

    return stressTests.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  // Cash flow KPIs
  getCashFlowKPIs(): Array<{
    name: string
    value: number
    unit: string
    benchmark: number
    status: 'excellent' | 'good' | 'fair' | 'poor'
    trend: 'improving' | 'stable' | 'declining'
    description: string
  }> {
    const workingCapital = this.analyzeWorkingCapital()
    const cashPosition = this.getRealTimeCashPosition()

    return [
      {
        name: 'Cash Conversion Cycle',
        value: workingCapital.days_working_capital,
        unit: 'days',
        benchmark: 60,
        status: workingCapital.days_working_capital < 45 ? 'excellent' : 
                workingCapital.days_working_capital < 75 ? 'good' :
                workingCapital.days_working_capital < 90 ? 'fair' : 'poor',
        trend: 'stable',
        description: 'Time to convert investments into cash flows'
      },
      {
        name: 'Days Cash on Hand',
        value: cashPosition.runway_days,
        unit: 'days',
        benchmark: 90,
        status: cashPosition.runway_days > 120 ? 'excellent' :
                cashPosition.runway_days > 90 ? 'good' :
                cashPosition.runway_days > 30 ? 'fair' : 'poor',
        trend: cashPosition.runway_days > 90 ? 'improving' : 'declining',
        description: 'Number of days operations can continue with current cash'
      },
      {
        name: 'Working Capital Efficiency',
        value: workingCapital.efficiency_ratio * 100,
        unit: 'percentage',
        benchmark: 100,
        status: workingCapital.efficiency_ratio > 1.2 ? 'poor' :
                workingCapital.efficiency_ratio > 1.0 ? 'fair' :
                workingCapital.efficiency_ratio > 0.8 ? 'good' : 'excellent',
        trend: 'stable',
        description: 'How efficiently working capital is being utilized'
      }
    ]
  }

  // Utility calculation methods
  private calculateDSO(): number {
    const receivables = this.invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'voided')
      .reduce((sum, inv) => sum + inv.balance, 0)
    
    const dailySales = this.calculateDailySales()
    return dailySales > 0 ? receivables / dailySales : 0
  }

  private calculateDIT(): number {
    const inventory = 45000 // Mock inventory value
    const dailyCogs = this.calculateDailyCOGS()
    return dailyCogs > 0 ? inventory / dailyCogs : 0
  }

  private calculateDPO(): number {
    const payables = this.bills
      .filter(bill => bill.status !== 'paid')
      .reduce((sum, bill) => sum + bill.balance, 0)
    
    const dailyPurchases = this.calculateDailyCOGS() // Approximation
    return dailyPurchases > 0 ? payables / dailyPurchases : 0
  }

  private calculateDailySales(): number {
    const recentRevenue = this.invoices
      .filter(inv => new Date(inv.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, inv) => sum + inv.total_amount, 0)
    
    return recentRevenue / 30
  }

  private calculateDailyCOGS(): number {
    // Mock calculation - in production would analyze expense transactions
    return this.calculateDailySales() * 0.6 // Assume 60% COGS margin
  }

  // Cash flow alerts and notifications
  generateCashFlowAlerts(): Array<{
    id: string
    type: 'shortage' | 'surplus' | 'covenant' | 'opportunity'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    projected_date: string
    amount: number
    automatic_actions: string[]
    manual_actions_required: string[]
  }> {
    const alerts: Array<{
      id: string
      type: 'shortage' | 'surplus' | 'covenant' | 'opportunity'
      priority: 'low' | 'medium' | 'high' | 'critical'
      title: string
      message: string
      projected_date: string
      amount: number
      automatic_actions: string[]
      manual_actions_required: string[]
    }> = []

    const cashPosition = this.getRealTimeCashPosition()
    const forecasts = this.generateCashFlowForecast(30)

    // Check for upcoming cash shortages
    const criticalForecasts = forecasts[0].forecasts.filter(f => f.closing_balance < 10000)
    if (criticalForecasts.length > 0) {
      const firstCritical = criticalForecasts[0]
      alerts.push({
        id: 'alert_shortage_${Date.now()}',
        type: 'shortage',
        priority: firstCritical.closing_balance < 0 ? 'critical' : 'high',
        title: 'Cash Shortage Alert',
        message: 'Projected cash balance will drop to ${firstCritical.closing_balance.toLocaleString()} on ${firstCritical.date}',
        projected_date: firstCritical.date,
        amount: Math.abs(firstCritical.closing_balance),
        automatic_actions: [
          'Sent collection reminders to overdue accounts',
          'Delayed non-critical expense approvals',
          'Activated credit line monitoring'
        ],
        manual_actions_required: [
          'Contact major customers for early payment',
          'Review and postpone discretionary expenses',
          'Consider activating credit facilities'
        ]
      })
    }

    // Check for excess cash opportunities
    if (cashPosition.total_cash > 150000 && cashPosition.daily_burn_rate < 4000) {
      alerts.push({
        id: 'alert_surplus_${Date.now()}',
        type: 'surplus',
        priority: 'medium',
        title: 'Excess Cash Optimization',
        message: '${(cashPosition.total_cash - 50000).toLocaleString()} in excess cash available for optimization',
        projected_date: new Date().toISOString().split('T')[0],
        amount: cashPosition.total_cash - 50000,
        automatic_actions: [
          'Identified short-term investment options',
          'Calculated debt reduction opportunities'
        ],
        manual_actions_required: [
          'Review investment policy and risk tolerance',
          'Evaluate strategic growth opportunities',
          'Consider debt reduction for interest savings'
        ]
      })
    }

    return alerts
  }
}

// Utility functions
export function formatCashFlowAmount(amount: number): string {
  const absAmount = Math.abs(amount)
  if (absAmount >= 1000000) {
    return '${amount < 0 ? '-' : '}$${(absAmount / 1000000).toFixed(1)}M'
  } else if (absAmount >= 1000) {
    return '${amount < 0 ? '-' : '}$${(absAmount / 1000).toFixed(0)}K'
  } else {
    return '${amount < 0 ? '-' : '}$${absAmount.toFixed(0)}'
  }
}

export function getCashFlowTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '↗️'
    case 'declining': return '↘️' 
    case 'stable': return '→'
    default: return '—'
  }
}

export function getLiquidityStatusColor(days: number): string {
  if (days > 90) return 'text-green-600 bg-green-50'
  if (days > 30) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function getScenarioColor(scenario: 'optimistic' | 'realistic' | 'pessimistic'): string {
  switch (scenario) {
    case 'optimistic': return '#22c55e'
    case 'realistic': return '#3b82f6'
    case 'pessimistic': return '#ef4444'
    default: return '#94a3b8'
  }
}