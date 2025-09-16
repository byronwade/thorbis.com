import { Bill, Vendor, Payment } from '@/types/accounting'

export interface PaymentOptimization {
  bill_id: string
  optimal_payment_date: string
  cash_flow_impact: number
  early_payment_discount?: {
    discount_percent: number
    discount_deadline: string
    savings_amount: number
  }
  recommended_action: 'pay_immediately' | 'pay_on_due_date' | 'negotiate_terms' | 'delay_payment'
  confidence: number
}

export interface VendorAnalytics {
  vendor_id: string
  total_spend_ytd: number
  average_order_value: number
  payment_terms_adherence: number
  quality_score: number
  delivery_performance: number
  price_competitiveness: number
  recommended_relationship_status: 'preferred' | 'standard' | 'review' | 'terminate'
}

export interface CashFlowForecast {
  date: string
  expected_payments: number
  expected_receipts: number
  net_cash_flow: number
  cumulative_balance: number
  confidence: number
  risk_factors: string[]
}

export interface VendorPaymentStrategy {
  vendor_id: string
  strategy_type: 'early_payment' | 'on_time' | 'negotiate_extension' | 'partial_payment'
  reasoning: string
  potential_savings: number
  implementation_steps: string[]
  success_probability: number
}

export interface ApprovalWorkflow {
  id: string
  bill_id: string
  current_step: number
  total_steps: number
  approvers: Array<{
    user_id: string
    role: string
    approval_limit: number
    status: 'pending' | 'approved' | 'rejected'
    timestamp?: string
    comments?: string
  }>
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  ai_risk_assessment: {
    fraud_score: number
    duplicate_risk: number
    compliance_issues: string[]
  }
}

export class AccountsPayable {
  private bills: Bill[] = []
  private vendors: Vendor[] = []
  private payments: Payment[] = []
  private currentCashBalance: number = 50000

  constructor(bills: Bill[], vendors: Vendor[], payments: Payment[] = [], cashBalance: number = 50000) {
    this.bills = bills
    this.vendors = vendors
    this.payments = payments
    this.currentCashBalance = cashBalance
  }

  // AI-powered payment optimization
  optimizePaymentSchedule(bills: Bill[]): PaymentOptimization[] {
    return bills.map(bill => this.optimizeIndividualPayment(bill))
  }

  private optimizeIndividualPayment(bill: Bill): PaymentOptimization {
    const vendor = this.vendors.find(v => v.id === bill.vendor_id)!
    const daysUntilDue = Math.ceil((new Date(bill.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate early payment discount if available
    const earlyPaymentDiscount = this.calculateEarlyPaymentDiscount(bill, vendor)
    
    // Assess cash flow impact
    const cashFlowImpact = this.assessCashFlowImpact(bill.total_amount, daysUntilDue)
    
    // Determine optimal strategy
    let recommendedAction: PaymentOptimization['recommended_action'] = 'pay_on_due_date'
    let confidence = 0.8
    let optimalDate = bill.due_date

    if (earlyPaymentDiscount && earlyPaymentDiscount.savings_amount > 100) {
      recommendedAction = 'pay_immediately'
      optimalDate = earlyPaymentDiscount.discount_deadline
      confidence = 0.9
    } else if (cashFlowImpact < -10000) {
      recommendedAction = 'negotiate_terms'
      confidence = 0.75
    } else if (this.getVendorAnalytics(vendor.id).quality_score < 0.7) {
      recommendedAction = 'delay_payment'
      optimalDate = new Date(new Date(bill.due_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      confidence = 0.65
    }

    return {
      bill_id: bill.id,
      optimal_payment_date: optimalDate,
      cash_flow_impact: cashFlowImpact,
      early_payment_discount: earlyPaymentDiscount,
      recommended_action: recommendedAction,
      confidence
    }
  }

  // Calculate early payment discounts
  private calculateEarlyPaymentDiscount(bill: Bill, vendor: Vendor): PaymentOptimization['early_payment_discount'] | undefined {
    // Mock logic - in real implementation, this would check vendor terms
    const vendorTerms = this.getVendorTerms(vendor.id)
    
    if (vendorTerms.early_payment_discount && vendorTerms.early_payment_days) {
      const discountDeadline = new Date(bill.date)
      discountDeadline.setDate(discountDeadline.getDate() + vendorTerms.early_payment_days)
      
      if (new Date() <= discountDeadline) {
        const savingsAmount = bill.total_amount * (vendorTerms.early_payment_discount / 100)
        
        return {
          discount_percent: vendorTerms.early_payment_discount,
          discount_deadline: discountDeadline.toISOString().split('T')[0],
          savings_amount: savingsAmount
        }
      }
    }
    
    return undefined
  }

  // Mock vendor terms - in production this would come from vendor master data
  private getVendorTerms(vendorId: string) {
    const defaultTerms = {
      early_payment_discount: 2, // 2% discount
      early_payment_days: 10,    // if paid within 10 days
      standard_terms: 30
    }
    
    // Some vendors might have different terms
    const specialTerms: Record<string, unknown> = {
      'vendor_1': { early_payment_discount: 3, early_payment_days: 7, standard_terms: 30 },
      'vendor_2': { early_payment_discount: 1.5, early_payment_days: 15, standard_terms: 45 }
    }
    
    return specialTerms[vendorId] || defaultTerms
  }

  // Assess cash flow impact of payment timing
  private assessCashFlowImpact(paymentAmount: number, daysUntilDue: number): number {
    const projectedCashFlow = this.generateCashFlowForecast(30)
    const paymentDate = new Date()
    paymentDate.setDate(paymentDate.getDate() + Math.max(0, daysUntilDue))
    
    // Find cash position on payment date
    const forecastForDate = projectedCashFlow.find(forecast => 
      new Date(forecast.date).toDateString() === paymentDate.toDateString()
    )
    
    if (!forecastForDate) return 0
    
    return forecastForDate.cumulative_balance - paymentAmount
  }

  // Generate vendor analytics and performance metrics
  getVendorAnalytics(vendorId: string): VendorAnalytics {
    const vendorBills = this.bills.filter(bill => bill.vendor_id === vendorId)
    const vendorPayments = this.payments.filter(payment => payment.vendor_id === vendorId)
    
    if (vendorBills.length === 0) {
      return {
        vendor_id: vendorId,
        total_spend_ytd: 0,
        average_order_value: 0,
        payment_terms_adherence: 1.0,
        quality_score: 0.8,
        delivery_performance: 0.8,
        price_competitiveness: 0.8,
        recommended_relationship_status: 'standard'
      }
    }

    // Calculate spend metrics
    const totalSpendYtd = vendorBills.reduce((sum, bill) => sum + bill.total_amount, 0)
    const averageOrderValue = totalSpendYtd / vendorBills.length

    // Calculate payment terms adherence
    const onTimePayments = vendorPayments.filter(payment => {
      const relatedBill = vendorBills.find(bill => bill.id === payment.bill_id)
      return relatedBill && payment.date <= relatedBill.due_date
    }).length
    const paymentTermsAdherence = vendorPayments.length > 0 ? onTimePayments / vendorPayments.length : 1.0

    // Mock quality and performance scores (in production, these would come from feedback/ratings)
    const qualityScore = Math.random() * 0.4 + 0.6 // 0.6 - 1.0
    const deliveryPerformance = Math.random() * 0.3 + 0.7 // 0.7 - 1.0
    const priceCompetitiveness = Math.random() * 0.5 + 0.5 // 0.5 - 1.0

    // Determine relationship status
    let recommendedStatus: VendorAnalytics['recommended_relationship_status'] = 'standard'
    const overallScore = (qualityScore + deliveryPerformance + priceCompetitiveness) / 3

    if (overallScore >= 0.9 && totalSpendYtd >= 10000) {
      recommendedStatus = 'preferred'
    } else if (overallScore < 0.6 || paymentTermsAdherence < 0.8) {
      recommendedStatus = 'review'
    } else if (overallScore < 0.4) {
      recommendedStatus = 'terminate'
    }

    return {
      vendor_id: vendorId,
      total_spend_ytd: totalSpendYtd,
      average_order_value: averageOrderValue,
      payment_terms_adherence: paymentTermsAdherence,
      quality_score: qualityScore,
      delivery_performance: deliveryPerformance,
      price_competitiveness: priceCompetitiveness,
      recommended_relationship_status: recommendedStatus
    }
  }

  // Generate cash flow forecast with AI
  generateCashFlowForecast(days: number): CashFlowForecast[] {
    const forecasts: CashFlowForecast[] = []
    const cumulativeBalance = this.currentCashBalance

    for (const i = 0; i <= days; i++) {
      const forecastDate = new Date()
      forecastDate.setDate(forecastDate.getDate() + i)
      const dateStr = forecastDate.toISOString().split('T')[0]

      // Calculate expected payments (bills due)
      const expectedPayments = this.bills
        .filter(bill => bill.due_date === dateStr && bill.status !== 'paid')
        .reduce((sum, bill) => sum + bill.balance, 0)

      // Mock expected receipts (would integrate with AR in production)
      const expectedReceipts = i === 0 ? 0 : Math.random() * 10000

      const netCashFlow = expectedReceipts - expectedPayments
      cumulativeBalance += netCashFlow

      // Calculate confidence based on historical accuracy
      const confidence = Math.max(0.3, 0.95 - (i * 0.02)) // Decreases over time

      // Identify risk factors
      const riskFactors: string[] = []
      if (cumulativeBalance < 10000) riskFactors.push('Low cash balance projected')
      if (expectedPayments > expectedReceipts * 2) riskFactors.push('Heavy payment obligations')
      if (i > 15 && confidence < 0.7) riskFactors.push('Forecast uncertainty increases')

      forecasts.push({
        date: dateStr,
        expected_payments: expectedPayments,
        expected_receipts: expectedReceipts,
        net_cash_flow: netCashFlow,
        cumulative_balance: cumulativeBalance,
        confidence,
        risk_factors: riskFactors
      })
    }

    return forecasts
  }

  // AI-powered vendor payment strategies
  generatePaymentStrategies(vendor: Vendor): VendorPaymentStrategy[] {
    const analytics = this.getVendorAnalytics(vendor.id)
    const outstandingBills = this.bills.filter(bill => 
      bill.vendor_id === vendor.id && bill.status !== 'paid'
    )
    
    const strategies: VendorPaymentStrategy[] = []

    // Early payment strategy
    if (analytics.quality_score > 0.8) {
      const potentialSavings = outstandingBills.reduce((sum, bill) => {
        const earlyDiscount = this.calculateEarlyPaymentDiscount(bill, vendor)
        return sum + (earlyDiscount?.savings_amount || 0)
      }, 0)

      if (potentialSavings > 0) {
        strategies.push({
          vendor_id: vendor.id,
          strategy_type: 'early_payment',
          reasoning: 'High-quality vendor offering early payment discounts',
          potential_savings: potentialSavings,
          implementation_steps: [
            'Review cash flow for early payment feasibility',
            'Process payments before discount deadline',
            'Set up automated early payment for future bills'
          ],
          success_probability: 0.9
        })
      }
    }

    // Term negotiation strategy
    if (analytics.total_spend_ytd > 50000 && analytics.payment_terms_adherence > 0.9) {
      strategies.push({
        vendor_id: vendor.id,
        strategy_type: 'negotiate_extension',
        reasoning: 'High spend volume and excellent payment history provide negotiation leverage',
        potential_savings: analytics.total_spend_ytd * 0.02, // 2% cash flow benefit
        implementation_steps: [
          'Prepare spend analysis and payment history report',
          'Schedule meeting with vendor account manager',
          'Propose extended terms (e.g., Net 45 instead of Net 30)'
        ],
        success_probability: 0.75
      })
    }

    return strategies
  }

  // AI-powered approval workflow management
  createApprovalWorkflow(bill: Bill): ApprovalWorkflow {
    const aiRiskAssessment = this.assessBillRisk(bill)
    
    // Determine approval requirements based on amount and risk
    const approvers: ApprovalWorkflow['approvers'] = []
    
    if (bill.total_amount > 1000) {
      approvers.push({
        user_id: 'manager_1',
        role: 'Department Manager',
        approval_limit: 10000,
        status: 'pending'
      })
    }
    
    if (bill.total_amount > 10000 || aiRiskAssessment.fraud_score > 0.3) {
      approvers.push({
        user_id: 'cfo_1',
        role: 'CFO',
        approval_limit: 100000,
        status: 'pending'
      })
    }
    
    if (bill.total_amount > 50000) {
      approvers.push({
        user_id: 'ceo_1',
        role: 'CEO', 
        approval_limit: Infinity,
        status: 'pending'
      })
    }

    return {
      id: 'workflow_${bill.id}',
      bill_id: bill.id,
      current_step: 1,
      total_steps: approvers.length,
      approvers,
      status: 'pending',
      ai_risk_assessment: aiRiskAssessment
    }
  }

  // AI risk assessment for bills
  private assessBillRisk(bill: Bill): ApprovalWorkflow['ai_risk_assessment'] {
    const fraudScore = 0
    let duplicateRisk = 0
    const complianceIssues: string[] = []

    // Check for fraud indicators
    if (bill.total_amount > 50000) fraudScore += 0.2
    
    const vendor = this.vendors.find(v => v.id === bill.vendor_id)
    if (!vendor || !vendor.is_active) {
      fraudScore += 0.5
      complianceIssues.push('Vendor not found or inactive')
    }

    // Check for duplicates
    const similarBills = this.bills.filter(existingBill =>
      existingBill.vendor_id === bill.vendor_id &&
      Math.abs(existingBill.total_amount - bill.total_amount) < 0.01 &&
      Math.abs(new Date(existingBill.date).getTime() - new Date(bill.date).getTime()) < 7 * 24 * 60 * 60 * 1000
    )
    
    if (similarBills.length > 0) {
      duplicateRisk = 0.8
      complianceIssues.push('Potential duplicate bill detected')
    }

    // Compliance checks
    if (!bill.bill_number) {
      complianceIssues.push('Missing bill number')
    }
    
    if (bill.line_items.length === 0) {
      complianceIssues.push('No line items specified')
    }

    return {
      fraud_score: Math.min(1, fraudScore),
      duplicate_risk: Math.min(1, duplicateRisk),
      compliance_issues: complianceIssues
    }
  }

  // Generate payment recommendations for cash flow optimization
  getPaymentRecommendations(horizonDays: number = 30): Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    bills: Bill[]
    potential_savings: number
    cash_flow_impact: number
  }> {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low'
      action: string
      bills: Bill[]
      potential_savings: number
      cash_flow_impact: number
    }> = []

    const unpaidBills = this.bills.filter(bill => bill.status !== 'paid')
    
    // Early payment opportunities
    const earlyPaymentBills = unpaidBills.filter(bill => {
      const optimization = this.optimizeIndividualPayment(bill)
      return optimization.early_payment_discount && optimization.early_payment_discount.savings_amount > 50
    })

    if (earlyPaymentBills.length > 0) {
      const totalSavings = earlyPaymentBills.reduce((sum, bill) => {
        const optimization = this.optimizeIndividualPayment(bill)
        return sum + (optimization.early_payment_discount?.savings_amount || 0)
      }, 0)

      recommendations.push({
        priority: 'high',
        action: 'Take advantage of early payment discounts',
        bills: earlyPaymentBills,
        potential_savings: totalSavings,
        cash_flow_impact: -earlyPaymentBills.reduce((sum, bill) => sum + bill.balance, 0)
      })
    }

    // Overdue bills
    const overdueBills = unpaidBills.filter(bill => new Date(bill.due_date) < new Date())
    if (overdueBills.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Pay overdue bills to maintain vendor relationships',
        bills: overdueBills,
        potential_savings: 0,
        cash_flow_impact: -overdueBills.reduce((sum, bill) => sum + bill.balance, 0)
      })
    }

    // Term negotiation opportunities
    const highVolumeVendors = this.vendors.filter(vendor => {
      const analytics = this.getVendorAnalytics(vendor.id)
      return analytics.total_spend_ytd > 25000 && analytics.payment_terms_adherence > 0.9
    })

    if (highVolumeVendors.length > 0) {
      const negotiableBills = unpaidBills.filter(bill =>
        highVolumeVendors.some(vendor => vendor.id === bill.vendor_id)
      )

      recommendations.push({
        priority: 'medium',
        action: 'Negotiate extended payment terms with high-volume vendors',
        bills: negotiableBills,
        potential_savings: negotiableBills.reduce((sum, bill) => sum + bill.total_amount, 0) * 0.02,
        cash_flow_impact: 0 // Neutral immediate impact, positive future impact
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Calculate key AP metrics
  getPayableMetrics(): {
    totalOutstanding: number
    averageDaysPayable: number
    turnoverRatio: number
    earlyPaymentOpportunities: number
    overdueAmount: number
  } {
    const outstanding = this.bills.filter(bill => bill.status !== 'paid')
    const totalOutstanding = outstanding.reduce((sum, bill) => sum + bill.balance, 0)

    // Calculate average days payable
    const totalDaysOutstanding = outstanding.reduce((sum, bill) => {
      const days = Math.ceil((new Date().getTime() - new Date(bill.date).getTime()) / (1000 * 60 * 60 * 24))
      return sum + (days * bill.balance)
    }, 0)
    const averageDaysPayable = totalOutstanding > 0 ? totalDaysOutstanding / totalOutstanding : 0

    // Calculate turnover ratio
    const paidBills = this.bills.filter(bill => bill.status === 'paid')
    const annualPurchases = paidBills.reduce((sum, bill) => sum + bill.total_amount, 0)
    const turnoverRatio = totalOutstanding > 0 ? annualPurchases / totalOutstanding : 0

    // Early payment opportunities
    const earlyPaymentOpportunities = outstanding.reduce((sum, bill) => {
      const optimization = this.optimizeIndividualPayment(bill)
      return sum + (optimization.early_payment_discount?.savings_amount || 0)
    }, 0)

    // Overdue amount
    const overdueAmount = outstanding
      .filter(bill => new Date(bill.due_date) < new Date())
      .reduce((sum, bill) => sum + bill.balance, 0)

    return {
      totalOutstanding,
      averageDaysPayable,
      turnoverRatio,
      earlyPaymentOpportunities,
      overdueAmount
    }
  }

  // AI-powered vendor performance scoring
  scoreVendorPerformance(vendorId: string): {
    overall_score: number
    categories: {
      quality: number
      delivery: number
      pricing: number
      payment_terms: number
      responsiveness: number
    }
    improvement_areas: string[]
    strengths: string[]
  } {
    const analytics = this.getVendorAnalytics(vendorId)
    
    const categories = {
      quality: analytics.quality_score,
      delivery: analytics.delivery_performance,
      pricing: analytics.price_competitiveness,
      payment_terms: analytics.payment_terms_adherence,
      responsiveness: Math.random() * 0.4 + 0.6 // Mock data
    }

    const overallScore = Object.values(categories).reduce((sum, score) => sum + score, 0) / Object.values(categories).length

    const improvementAreas: string[] = []
    const strengths: string[] = []

    Object.entries(categories).forEach(([category, score]) => {
      if (score < 0.7) {
        improvementAreas.push(category)
      } else if (score > 0.9) {
        strengths.push(category)
      }
    })

    return {
      overall_score: overallScore,
      categories,
      improvement_areas: improvementAreas,
      strengths: strengths
    }
  }
}

// Utility functions
export function calculateDPO(totalPayables: number, totalPurchases: number, days: number = 365): number {
  return totalPurchases > 0 ? (totalPayables / totalPurchases) * days : 0
}

export function getVendorRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.8) return 'low'
  if (score >= 0.6) return 'medium'
  return 'high'
}

export function formatPaymentTermsDisplay(terms: number): string {
  if (terms === 0) return 'COD'
  if (terms <= 15) return 'Net ${terms}'
  if (terms === 30) return 'Net 30'
  return 'Net ${terms} days'
}