import { Invoice, Customer, Payment } from '@/types/accounting'

export interface PaymentPrediction {
  invoice_id: string
  predicted_payment_date: string
  confidence: number
  probability_of_payment: number
  risk_factors: string[]
  recommended_actions: string[]
}

export interface FollowUpWorkflow {
  id: string
  invoice_id: string
  workflow_type: 'gentle_reminder' | 'firm_reminder' | 'final_notice' | 'collections'
  trigger_days_past_due: number
  is_automated: boolean
  message_template: string
  next_action_date: string
  status: 'pending' | 'sent' | 'completed' | 'skipped'
}

export interface CustomerPaymentProfile {
  customer_id: string
  average_days_to_pay: number
  payment_consistency: number // 0-1 score
  preferred_payment_method: string
  credit_score_estimate: number
  payment_history: PaymentHistoryEntry[]
  risk_level: 'low' | 'medium' | 'high'
}

export interface PaymentHistoryEntry {
  invoice_id: string
  invoice_amount: number
  days_to_pay: number
  payment_method: string
  was_late: boolean
  date: string
}

export interface AgingReport {
  customer_id: string
  customer_name: string
  current: number // 0-30 days
  days_31_60: number
  days_61_90: number
  days_over_90: number
  total_outstanding: number
  last_payment_date?: string
  credit_limit?: number
  payment_terms: number
}

export class AccountsReceivable {
  private invoices: Invoice[] = []
  private customers: Customer[] = []
  private payments: Payment[] = []

  constructor(invoices: Invoice[], customers: Customer[], payments: Payment[] = []) {
    this.invoices = invoices
    this.customers = customers
    this.payments = payments
  }

  // AI-powered payment prediction
  predictPaymentDate(invoice: Invoice): PaymentPrediction {
    const customer = this.customers.find(c => c.id === invoice.customer_id)
    if (!customer) {
      return {
        invoice_id: invoice.id,
        predicted_payment_date: invoice.due_date,
        confidence: 0.3,
        probability_of_payment: 0.5,
        risk_factors: ['Customer not found'],
        recommended_actions: ['Verify customer information']
      }
    }

    const profile = this.getCustomerPaymentProfile(customer.id)
    const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate predicted payment date based on customer history
    const predictedDays = Math.max(0, profile.average_days_to_pay - customer.payment_terms)
    const predictedDate = new Date(invoice.due_date)
    predictedDate.setDate(predictedDate.getDate() + predictedDays)

    // Calculate risk factors
    const riskFactors: string[] = []
    const recommendedActions: string[] = []

    if (profile.average_days_to_pay > customer.payment_terms + 15) {
      riskFactors.push('Customer historically pays late')
      recommendedActions.push('Send early payment reminder')
    }

    if (profile.payment_consistency < 0.7) {
      riskFactors.push('Inconsistent payment pattern')
      recommendedActions.push('Consider requiring upfront payment or shorter terms')
    }

    if (invoice.total_amount > (customer.credit_limit || 50000)) {
      riskFactors.push('Invoice amount exceeds typical credit limit')
      recommendedActions.push('Review credit terms and consider payment plan')
    }

    const currentOutstanding = this.getCustomerOutstandingBalance(customer.id)
    if (currentOutstanding > (customer.credit_limit || 50000) * 0.8) {
      riskFactors.push('Customer approaching credit limit')
      recommendedActions.push('Review credit status and consider credit check')
    }

    // Calculate confidence and probability
    const confidence = 0.8
    confidence *= profile.payment_consistency
    confidence *= Math.min(1, (customer.credit_limit || 50000) / invoice.total_amount)

    const probability = Math.max(0.1, Math.min(0.99, 
      profile.payment_consistency * (1 - (riskFactors.length * 0.1))
    ))

    return {
      invoice_id: invoice.id,
      predicted_payment_date: predictedDate.toISOString().split('T')[0],
      confidence,
      probability_of_payment: probability,
      risk_factors: riskFactors,
      recommended_actions: recommendedActions
    }
  }

  // Generate automated follow-up workflows
  generateFollowUpWorkflows(invoice: Invoice): FollowUpWorkflow[] {
    const workflows: FollowUpWorkflow[] = []
    const customer = this.customers.find(c => c.id === invoice.customer_id)
    const profile = this.getCustomerPaymentProfile(invoice.customer_id)

    // Customize workflows based on customer risk profile
    const baseWorkflows = profile.risk_level === 'high' ? [
      { days: 0, type: 'gentle_reminder', message: 'Friendly payment reminder for invoice #{invoice_number}' },
      { days: 7, type: 'firm_reminder', message: 'Second notice: Payment overdue for invoice #{invoice_number}' },
      { days: 15, type: 'final_notice', message: 'Final notice: Immediate payment required for invoice #{invoice_number}' },
      { days: 30, type: 'collections', message: 'Account referred to collections for invoice #{invoice_number}' }
    ] : [
      { days: 5, type: 'gentle_reminder', message: 'Friendly reminder: Invoice #{invoice_number} is due soon' },
      { days: 15, type: 'firm_reminder', message: 'Payment reminder for overdue invoice #{invoice_number}' },
      { days: 30, type: 'final_notice', message: 'Final notice for invoice #{invoice_number}' }
    ]

    baseWorkflows.forEach((workflow, index) => {
      const actionDate = new Date(invoice.due_date)
      actionDate.setDate(actionDate.getDate() + workflow.days)

      workflows.push({
        id: 'workflow_${invoice.id}_${index}',
        invoice_id: invoice.id,
        workflow_type: workflow.type as FollowUpWorkflow['workflow_type'],
        trigger_days_past_due: workflow.days,
        is_automated: workflow.type !== 'collections', // Collections require manual review
        message_template: workflow.message.replace('{invoice_number}', invoice.invoice_number),
        next_action_date: actionDate.toISOString().split('T')[0],
        status: 'pending'
      })
    })

    return workflows
  }

  // Get customer payment profile with AI analysis
  getCustomerPaymentProfile(customerId: string): CustomerPaymentProfile {
    const customerInvoices = this.invoices.filter(inv => inv.customer_id === customerId && inv.status === 'paid')
    const customerPayments = this.payments.filter(pay => pay.customer_id === customerId)

    if (customerInvoices.length === 0) {
      return {
        customer_id: customerId,
        average_days_to_pay: 30,
        payment_consistency: 0.5,
        preferred_payment_method: 'unknown',
        credit_score_estimate: 650,
        payment_history: [],
        risk_level: 'medium'
      }
    }

    // Calculate payment history
    const paymentHistory: PaymentHistoryEntry[] = customerInvoices.map(invoice => {
      const payment = customerPayments.find(pay => pay.invoice_id === invoice.id)
      const paymentDate = payment?.date || invoice.updated_at
      const invoiceDate = invoice.date
      const daysToPay = Math.ceil((new Date(paymentDate).getTime() - new Date(invoiceDate).getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        invoice_id: invoice.id,
        invoice_amount: invoice.total_amount,
        days_to_pay: daysToPay,
        payment_method: payment?.method || 'unknown',
        was_late: daysToPay > (this.customers.find(c => c.id === customerId)?.payment_terms || 30),
        date: paymentDate
      }
    })

    // Calculate metrics
    const averageDaysToPay = paymentHistory.reduce((sum, entry) => sum + entry.days_to_pay, 0) / paymentHistory.length
    const onTimePayments = paymentHistory.filter(entry => !entry.was_late).length
    const paymentConsistency = onTimePayments / paymentHistory.length

    // Determine preferred payment method
    const paymentMethods = paymentHistory.reduce((acc, entry) => {
      acc[entry.payment_method] = (acc[entry.payment_method] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const preferredMethod = Object.entries(paymentMethods).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'

    // Estimate credit score based on payment behavior
    const creditScore = 650
    if (paymentConsistency > 0.9) creditScore += 100
    else if (paymentConsistency > 0.7) creditScore += 50
    else if (paymentConsistency < 0.3) creditScore -= 100

    if (averageDaysToPay <= 30) creditScore += 50
    else if (averageDaysToPay > 60) creditScore -= 50

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (paymentConsistency > 0.8 && averageDaysToPay <= 35) riskLevel = 'low'
    else if (paymentConsistency < 0.5 || averageDaysToPay > 60) riskLevel = 'high'

    return {
      customer_id: customerId,
      average_days_to_pay: averageDaysToPay,
      payment_consistency: paymentConsistency,
      preferred_payment_method: preferredMethod,
      credit_score_estimate: Math.max(300, Math.min(850, creditScore)),
      payment_history: paymentHistory,
      risk_level: riskLevel
    }
  }

  // Generate aging report with AI insights
  generateAgingReport(asOfDate?: string): AgingReport[] {
    const reportDate = asOfDate ? new Date(asOfDate) : new Date()
    
    return this.customers.map(customer => {
      const customerInvoices = this.invoices.filter(inv => 
        inv.customer_id === customer.id && 
        inv.status !== 'paid' && 
        inv.status !== 'voided'
      )

      const aging = {
        current: 0,
        days_31_60: 0,
        days_61_90: 0,
        days_over_90: 0
      }

      customerInvoices.forEach(invoice => {
        const daysPastDue = Math.ceil((reportDate.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysPastDue <= 30) aging.current += invoice.balance
        else if (daysPastDue <= 60) aging.days_31_60 += invoice.balance
        else if (daysPastDue <= 90) aging.days_61_90 += invoice.balance
        else aging.days_over_90 += invoice.balance
      })

      const lastPayment = this.payments
        .filter(pay => pay.customer_id === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      return {
        customer_id: customer.id,
        customer_name: customer.name,
        current: aging.current,
        days_31_60: aging.days_31_60,
        days_61_90: aging.days_61_90,
        days_over_90: aging.days_over_90,
        total_outstanding: aging.current + aging.days_31_60 + aging.days_61_90 + aging.days_over_90,
        last_payment_date: lastPayment?.date,
        credit_limit: customer.credit_limit,
        payment_terms: customer.payment_terms
      }
    }).filter(report => report.total_outstanding > 0)
  }

  // AI-powered collection strategy recommendations
  recommendCollectionStrategy(customer: Customer, outstandingAmount: number): {
    strategy: 'gentle' | 'standard' | 'aggressive' | 'legal'
    actions: string[]
    timeline: string
    success_probability: number
  } {
    const profile = this.getCustomerPaymentProfile(customer.id)
    const agingReport = this.generateAgingReport().find(r => r.customer_id === customer.id)

    let strategy: 'gentle' | 'standard' | 'aggressive' | 'legal' = 'standard'
    const actions: string[] = []
    let timeline = '2-4 weeks'
    let successProbability = 0.7

    // Determine strategy based on risk profile and amount
    if (profile.risk_level === 'low' && outstandingAmount < 5000) {
      strategy = 'gentle'
      actions.push('Send friendly payment reminder')
      actions.push('Offer payment plan if needed')
      timeline = '1-2 weeks'
      successProbability = 0.85
    } else if (profile.risk_level === 'high' || outstandingAmount > 20000) {
      strategy = 'aggressive'
      actions.push('Immediate phone call to discuss payment')
      actions.push('Request payment schedule confirmation')
      actions.push('Consider placing account on hold')
      timeline = '3-5 days'
      successProbability = 0.6
    } else if (agingReport && agingReport.days_over_90 > 10000) {
      strategy = 'legal'
      actions.push('Send formal demand letter')
      actions.push('Consider legal action')
      actions.push('Review account for write-off')
      timeline = '30+ days'
      successProbability = 0.3
    }

    // Add AI-personalized actions
    if (profile.preferred_payment_method === 'credit_card') {
      actions.push('Offer automatic payment setup')
    }
    
    if (profile.payment_consistency > 0.8) {
      actions.push('Reference positive payment history')
      successProbability += 0.1
    }

    return {
      strategy,
      actions,
      timeline,
      success_probability: Math.min(0.95, successProbability)
    }
  }

  // Generate automated follow-up messages with AI personalization
  generateFollowUpMessage(invoice: Invoice, workflowType: FollowUpWorkflow['workflow_type`]): string {
    const customer = this.customers.find(c => c.id === invoice.customer_id)
    const profile = this.getCustomerPaymentProfile(invoice.customer_id)
    
    const baseMessages = {
      gentle_reminder: `Hi {customer_name}, this is a friendly reminder that invoice {invoice_number} for {amount} was due on {due_date}. We appreciate your business and look forward to receiving your payment.`,
      firm_reminder: `Dear {customer_name}, invoice {invoice_number} for {amount} is now {days_overdue} days past due. Please remit payment immediately to avoid any service interruptions.`,
      final_notice: `FINAL NOTICE: {customer_name}, despite previous reminders, invoice {invoice_number} for {amount} remains unpaid. Payment must be received within 5 business days to avoid collection proceedings.',
      collections: '{customer_name}, your account has been referred to our collections department for invoice {invoice_number}. Contact us immediately to resolve this matter.'
    }

    let message = baseMessages[workflowType]
    
    // AI personalization based on customer profile
    if (profile.payment_consistency > 0.8 && workflowType === 'gentle_reminder') {
      message = message.replace('this is a friendly reminder', 'we noticed this might have been overlooked')
    }

    const daysOverdue = Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
    
    return message
      .replace('{customer_name}', customer?.name || 'Customer')
      .replace('{invoice_number}', invoice.invoice_number)
      .replace('{amount}', '$${invoice.total_amount.toLocaleString()}')
      .replace('{due_date}', invoice.due_date)
      .replace('{days_overdue}', daysOverdue.toString())
  }

  // Calculate key AR metrics
  getReceivablesMetrics(asOfDate?: string): {
    totalOutstanding: number
    averageDaysOutstanding: number
    turnoverRatio: number
    badDebtPercentage: number
    collectionEfficiency: number
  } {
    const outstanding = this.invoices.filter(inv => 
      inv.status !== 'paid' && inv.status !== 'voided'
    )
    
    const totalOutstanding = outstanding.reduce((sum, inv) => sum + inv.balance, 0)
    
    // Calculate average days outstanding
    const totalDaysOutstanding = outstanding.reduce((sum, inv) => {
      const days = Math.ceil((new Date().getTime() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24))
      return sum + (days * inv.balance)
    }, 0)
    const averageDaysOutstanding = totalOutstanding > 0 ? totalDaysOutstanding / totalOutstanding : 0

    // Calculate turnover ratio (annual revenue / average receivables)
    const paidInvoices = this.invoices.filter(inv => inv.status === 'paid')
    const annualRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const turnoverRatio = totalOutstanding > 0 ? annualRevenue / totalOutstanding : 0

    // Estimate bad debt percentage
    const voidedInvoices = this.invoices.filter(inv => inv.status === 'voided')
    const badDebtAmount = voidedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const badDebtPercentage = annualRevenue > 0 ? (badDebtAmount / annualRevenue) * 100 : 0

    // Collection efficiency
    const totalBilled = this.invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const collectionEfficiency = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0

    return {
      totalOutstanding,
      averageDaysOutstanding,
      turnoverRatio,
      badDebtPercentage,
      collectionEfficiency
    }
  }

  // Get customer's current outstanding balance'
  getCustomerOutstandingBalance(customerId: string): number {
    return this.invoices
      .filter(inv => inv.customer_id === customerId && inv.status !== 'paid' && inv.status !== 'voided')
      .reduce((sum, inv) => sum + inv.balance, 0)
  }

  // AI-powered early warning system
  getEarlyWarningAlerts(): Array<{
    type: 'credit_limit_exceeded' | 'payment_pattern_change' | 'large_outstanding' | 'aging_concern'
    customer_id: string
    customer_name: string
    description: string
    severity: 'low' | 'medium' | 'high'
    recommended_action: string
  }> {
    const alerts: Array<{
      type: 'credit_limit_exceeded' | 'payment_pattern_change' | 'large_outstanding' | 'aging_concern'
      customer_id: string
      customer_name: string
      description: string
      severity: 'low' | 'medium' | 'high'
      recommended_action: string
    }> = []

    this.customers.forEach(customer => {
      const outstanding = this.getCustomerOutstandingBalance(customer.id)
      const profile = this.getCustomerPaymentProfile(customer.id)

      // Credit limit alerts
      if (customer.credit_limit && outstanding > customer.credit_limit) {
        alerts.push({
          type: 'credit_limit_exceeded',
          customer_id: customer.id,
          customer_name: customer.name,
          description: 'Outstanding balance $${outstanding.toLocaleString()} exceeds credit limit $${customer.credit_limit.toLocaleString()}',
          severity: 'high',
          recommended_action: 'Review credit terms and consider payment plan'
        })
      }

      // Payment pattern changes
      if (profile.payment_consistency < 0.5 && profile.payment_history.length >= 5) {
        alerts.push({
          type: 'payment_pattern_change',
          customer_id: customer.id,
          customer_name: customer.name,
          description: 'Payment consistency dropped to ${Math.round(profile.payment_consistency * 100)}%',
          severity: 'medium',
          recommended_action: 'Contact customer to discuss payment arrangements'
        })
      }

      // Large outstanding amounts
      if (outstanding > 25000) {
        alerts.push({
          type: 'large_outstanding',
          customer_id: customer.id,
          customer_name: customer.name,
          description: 'Large outstanding balance: $${outstanding.toLocaleString()}',
          severity: outstanding > 50000 ? 'high' : 'medium',
          recommended_action: 'Implement payment plan or require collateral'
        })
      }
    })

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }
}

// Utility functions
export function calculateDSO(totalReceivables: number, totalSales: number, days: number = 365): number {
  return totalSales > 0 ? (totalReceivables / totalSales) * days : 0
}

export function formatPaymentTerms(days: number): string {
  if (days === 0) return 'Due on receipt'
  if (days <= 15) return 'Net ${days} days'
  if (days === 30) return 'Net 30'
  return 'Net ${days} days'
}

export function getPaymentRiskColor(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
  }
}