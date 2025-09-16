import { Invoice, Customer, Payment } from '@/types/accounting'

export interface InvoiceAutomation {
  id: string
  invoice_id: string
  automation_type: 'payment_reminder' | 'collection_strategy' | 'follow_up' | 'escalation' | 'dunning'
  status: 'active' | 'paused' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  schedule: AutomationSchedule
  strategy: CollectionStrategy
  performance_metrics: AutomationMetrics
  ai_recommendations: AIRecommendation[]
}

export interface AutomationSchedule {
  trigger_type: 'days_after_due' | 'days_before_due' | 'amount_threshold' | 'payment_behavior' | 'custom'
  trigger_value: number | string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  max_attempts: number
  escalation_rules: EscalationRule[]
  time_restrictions: {
    business_hours_only: boolean
    timezone: string
    excluded_days: string[]
    preferred_times: { start: string, end: string }[]
  }
}

export interface CollectionStrategy {
  strategy_type: 'gentle' | 'standard' | 'aggressive' | 'legal' | 'custom'
  communication_channels: ('email' | 'sms' | 'phone' | 'letter' | 'portal')[]
  message_templates: MessageTemplate[]
  payment_incentives: PaymentIncentive[]
  legal_actions: LegalAction[]
  customer_segmentation: {
    segment: string
    criteria: Record<string, unknown>
    strategy_adjustments: Record<string, unknown>
  }
}

export interface MessageTemplate {
  id: string
  name: string
  channel: 'email' | 'sms' | 'phone' | 'letter' | 'portal'
  subject: string
  content: string
  personalization_fields: string[]
  ai_optimization: {
    tone: 'friendly' | 'professional' | 'urgent' | 'formal' | 'empathetic'
    urgency_level: number
    response_rate_prediction: number
    optimal_send_time: string
    a_b_test_variants: MessageVariant[]
  }
  compliance_checked: boolean
  legal_approved: boolean
}

export interface MessageVariant {
  variant_id: string
  subject: string
  content: string
  performance_data: {
    open_rate: number
    response_rate: number
    payment_rate: number
    unsubscribe_rate: number
  }
}

export interface PaymentIncentive {
  type: 'early_payment_discount' | 'payment_plan' | 'fee_waiver' | 'service_credit'
  description: string
  value: number
  expiration_date: string
  terms_conditions: string
  success_rate: number
  cost_benefit_analysis: {
    cost_to_company: number
    expected_recovery: number
    roi: number
  }
}

export interface LegalAction {
  action_type: 'demand_letter' | 'collection_agency' | 'small_claims' | 'litigation' | 'lien'
  threshold_amount: number
  prerequisite_steps: string[]
  estimated_cost: number
  estimated_recovery_rate: number
  recommended_timing: string
  legal_requirements: string[]
}

export interface EscalationRule {
  step: number
  trigger_condition: string
  days_since_last_action: number
  action_type: string
  automation_changes: Record<string, unknown>
  notification_recipients: string[]
  approval_required: boolean
}

export interface AutomationMetrics {
  total_invoices_processed: number
  total_amount_recovered: number
  recovery_rate: number
  average_days_to_payment: number
  response_rates: {
    email: number
    sms: number
    phone: number
    portal: number
  }
  cost_per_recovery: number
  customer_satisfaction_impact: number
  automation_efficiency: number
  manual_intervention_rate: number
}

export interface AIRecommendation {
  type: 'strategy_optimization' | 'timing_adjustment' | 'message_improvement' | 'segmentation_update'
  title: string
  description: string
  expected_improvement: number
  confidence_level: number
  implementation_effort: 'low' | 'medium' | 'high'
  supporting_data: Array<{
    metric: string
    current_value: number
    projected_value: number
    significance: number
  }>
  action_items: string[]
  estimated_roi: number
}

export interface CollectionCampaign {
  id: string
  name: string
  description: string
  target_criteria: {
    amount_range: { min: number, max: number }
    days_overdue_range: { min: number, max: number }
    customer_segments: string[]
    risk_scores: { min: number, max: number }
  }
  automation_rules: InvoiceAutomation[]
  performance_tracking: CampaignMetrics
  ai_optimization: {
    learning_enabled: boolean
    optimization_goals: ('recovery_rate' | 'customer_satisfaction' | 'cost_efficiency' | 'speed')[]
    testing_variants: number
    confidence_threshold: number
  }
}

export interface CampaignMetrics {
  start_date: string
  end_date: string | null
  invoices_targeted: number
  total_amount_targeted: number
  amount_recovered: number
  recovery_rate: number
  average_resolution_time: number
  cost_per_dollar_recovered: number
  customer_complaints: number
  automation_success_rate: number
  manual_intervention_required: number
}

export interface CustomerPaymentBehavior {
  customer_id: string
  payment_history: {
    average_days_to_pay: number
    payment_reliability_score: number
    preferred_payment_methods: string[]
    seasonal_patterns: Record<string, number>
    communication_preferences: {
      channel: string
      time_of_day: string
      frequency_tolerance: string
    }
  }
  risk_assessment: {
    default_probability: number
    credit_score: number | null
    payment_capacity: 'high' | 'medium' | 'low'
    relationship_quality: number
    collection_difficulty: 'easy' | 'moderate' | 'difficult'
  }
  ai_insights: {
    optimal_collection_strategy: string
    predicted_payment_date: string
    recommended_incentives: string[]
    escalation_recommendations: string[]
    success_probability_by_channel: Record<string, number>
  }
}

export interface AutomationWorkflow {
  id: string
  name: string
  description: string
  trigger_conditions: WorkflowTrigger[]
  workflow_steps: WorkflowStep[]
  success_criteria: SuccessCriterion[]
  failure_handling: FailureHandling
  monitoring: WorkflowMonitoring
}

export interface WorkflowTrigger {
  type: 'invoice_overdue' | 'payment_received' | 'customer_response' | 'threshold_reached' | 'date_based'
  condition: string
  parameters: Record<string, unknown>
}

export interface WorkflowStep {
  step_id: string
  step_type: 'send_message' | 'update_status' | 'create_task' | 'escalate' | 'apply_incentive' | 'ai_analysis'
  configuration: Record<string, unknown>
  delay_before: number
  conditions: string[]
  success_actions: string[]
  failure_actions: string[]
  ai_optimized: boolean
}

export interface SuccessCriterion {
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '=' | '!= ''
  value: number
  weight: number
}

export interface FailureHandling {
  max_retries: number
  retry_delay: number
  escalation_path: string[]
  fallback_strategy: string
  notification_recipients: string[]
}

export interface WorkflowMonitoring {
  kpis: string[]
  alert_thresholds: Record<string, number>
  reporting_frequency: string
  dashboard_widgets: string[]
}

export class InvoiceAutomationEngine {
  private automations: InvoiceAutomation[] = []
  private campaigns: CollectionCampaign[] = []
  private customerBehaviors: Map<string, CustomerPaymentBehavior> = new Map()
  private messageTemplates: MessageTemplate[] = []
  private workflows: AutomationWorkflow[] = []
  private aiEngine: AICollectionEngine

  constructor() {
    this.aiEngine = new AICollectionEngine()
    this.initializeDefaultTemplates()
    this.initializeDefaultWorkflows()
  }

  // AI-powered automation creation
  createSmartAutomation(
    invoice: Invoice,
    customer: Customer,
    options?: {
      strategy_preference?: 'gentle' | 'standard' | 'aggressive'
      budget_constraints?: { max_cost: number }
      timeline_requirements?: { max_days: number }
      compliance_requirements?: string[]
    }
  ): InvoiceAutomation {
    const customerBehavior = this.analyzeCustomerBehavior(customer.id)
    const aiStrategy = this.aiEngine.generateOptimalStrategy(invoice, customer, customerBehavior, options)
    const schedule = this.createOptimizedSchedule(invoice, customer, aiStrategy)

    const automation: InvoiceAutomation = {
      id: 'auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      invoice_id: invoice.id,
      automation_type: 'collection_strategy',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      schedule,
      strategy: aiStrategy,
      performance_metrics: this.initializeMetrics(),
      ai_recommendations: []
    }

    this.automations.push(automation)
    return automation
  }

  // Intelligent message personalization
  generatePersonalizedMessage(
    template: MessageTemplate,
    invoice: Invoice,
    customer: Customer,
    context: {
      attempt_number: number
      days_overdue: number
      previous_responses: string[]
      payment_history: any
    }
  ): {
    personalized_content: string
    optimizations_applied: string[]
    predicted_effectiveness: number
    recommended_send_time: string
    alternative_channels: string[]
  } {
    const customerBehavior = this.customerBehaviors.get(customer.id)
    const aiOptimizations = this.aiEngine.optimizeMessage(template, invoice, customer, context, customerBehavior)

    // Apply personalization
    let personalizedContent = template.content
    const replacements = {
      '{{customer_name}}': customer.name,
      '{{invoice_number}}': invoice.invoice_number,
      '{{invoice_amount}}': '$${invoice.total_amount.toLocaleString()}',
      '{{due_date}}': new Date(invoice.due_date).toLocaleDateString(),
      '{{days_overdue}}': context.days_overdue.toString(),
      '{{payment_link}}': this.generatePaymentLink(invoice.id),
      '{{company_name}}': 'Thorbis Books',
      '{{personalized_greeting}}': this.generatePersonalizedGreeting(customer, customerBehavior),
      '{{incentive_offer}}': this.generateContextualIncentive(invoice, customer, context),
      '{{next_steps}}': this.generateNextSteps(invoice, customer, context)
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value)
    })

    // Apply AI tone adjustments
    personalizedContent = this.aiEngine.adjustTone(
      personalizedContent,
      aiOptimizations.recommended_tone,
      context.attempt_number,
      customer
    )

    return {
      personalized_content: personalizedContent,
      optimizations_applied: aiOptimizations.optimizations_applied,
      predicted_effectiveness: aiOptimizations.predicted_effectiveness,
      recommended_send_time: aiOptimizations.optimal_send_time,
      alternative_channels: aiOptimizations.alternative_channels
    }
  }

  // Payment behavior analysis
  analyzeCustomerBehavior(customerId: string): CustomerPaymentBehavior {
    const existingBehavior = this.customerBehaviors.get(customerId)
    if (existingBehavior) {
      return this.updateBehaviorAnalysis(existingBehavior)
    }

    // Create new behavior analysis
    const behavior: CustomerPaymentBehavior = {
      customer_id: customerId,
      payment_history: {
        average_days_to_pay: 25,
        payment_reliability_score: 7.5,
        preferred_payment_methods: ['bank_transfer', 'credit_card'],
        seasonal_patterns: { 'Q1': 1.2, 'Q2': 0.9, 'Q3': 1.0, 'Q4': 1.1 },
        communication_preferences: {
          channel: 'email',
          time_of_day: '09:00',
          frequency_tolerance: 'moderate'
        }
      },
      risk_assessment: {
        default_probability: 0.15,
        credit_score: null,
        payment_capacity: 'medium',
        relationship_quality: 8.0,
        collection_difficulty: 'moderate'
      },
      ai_insights: {
        optimal_collection_strategy: 'standard',
        predicted_payment_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        recommended_incentives: ['2% early payment discount'],
        escalation_recommendations: ['Phone call after 3 email attempts'],
        success_probability_by_channel: {
          'email': 0.65,
          'phone': 0.78,
          'sms': 0.45,
          'portal': 0.55
        }
      }
    }

    this.customerBehaviors.set(customerId, behavior)
    return behavior
  }

  // Campaign management
  createCollectionCampaign(
    name: string,
    targetCriteria: CollectionCampaign['target_criteria`],
    strategy: CollectionStrategy
  ): CollectionCampaign {
    const campaign: CollectionCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      name,
      description: 'AI-optimized collection campaign targeting ${strategy.strategy_type} approach',
      target_criteria: targetCriteria,
      automation_rules: [],
      performance_tracking: {
        start_date: new Date().toISOString(),
        end_date: null,
        invoices_targeted: 0,
        total_amount_targeted: 0,
        amount_recovered: 0,
        recovery_rate: 0,
        average_resolution_time: 0,
        cost_per_dollar_recovered: 0,
        customer_complaints: 0,
        automation_success_rate: 0,
        manual_intervention_required: 0
      },
      ai_optimization: {
        learning_enabled: true,
        optimization_goals: ['recovery_rate', 'customer_satisfaction'],
        testing_variants: 3,
        confidence_threshold: 0.8
      }
    }

    this.campaigns.push(campaign)
    return campaign
  }

  // Real-time automation monitoring
  monitorAutomations(): {
    active_automations: number
    success_rate: number
    pending_actions: number
    revenue_recovered_today: number
    customer_satisfaction_score: number
    performance_alerts: Array<{
      type: 'performance_drop' | 'high_complaint_rate' | 'low_response_rate' | 'budget_exceeded'
      message: string
      automation_id: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      recommended_action: string
    }>
    ai_recommendations: AIRecommendation[]
  } {
    const activeAutomations = this.automations.filter(a => a.status === 'active')
    const totalMetrics = this.aggregateMetrics(activeAutomations)

    const performanceAlerts = this.detectPerformanceIssues(activeAutomations)
    const aiRecommendations = this.aiEngine.generateSystemRecommendations(totalMetrics, performanceAlerts)

    return {
      active_automations: activeAutomations.length,
      success_rate: totalMetrics.recovery_rate,
      pending_actions: this.countPendingActions(),
      revenue_recovered_today: this.calculateDailyRecovery(),
      customer_satisfaction_score: totalMetrics.customer_satisfaction_impact,
      performance_alerts: performanceAlerts,
      ai_recommendations: aiRecommendations
    }
  }

  // A/B testing for message optimization
  runMessageABTest(
    template: MessageTemplate,
    variants: MessageVariant[],
    testParams: {
      sample_size: number
      duration_days: number
      success_metric: 'open_rate' | 'response_rate' | 'payment_rate'
      confidence_level: number
    }
  ): {
    test_id: string
    status: 'running' | 'completed' | 'paused'
    results: Array<{
      variant_id: string
      performance: number
      confidence: number
      recommendation: 'adopt' | 'reject' | 'continue_testing'
    }>
    winning_variant: string | null
    statistical_significance: boolean
  } {
    // Implementation for A/B testing
    return {
      test_id: 'test_${Date.now()}',
      status: 'running',
      results: variants.map(variant => ({
        variant_id: variant.variant_id,
        performance: variant.performance_data.payment_rate,
        confidence: Math.random() * 0.4 + 0.6, // Mock confidence
        recommendation: variant.performance_data.payment_rate > 0.3 ? 'adopt' : 'continue_testing'
      })),
      winning_variant: variants.length > 0 ? variants[0].variant_id : null,
      statistical_significance: true
    }
  }

  // Payment plan automation
  createAutomatedPaymentPlan(
    invoice: Invoice,
    customer: Customer,
    planOptions: {
      number_of_installments: number
      first_payment_date: string
      interest_rate?: number
      late_fee_structure?: { amount: number, after_days: number }
      automatic_setup: boolean
    }
  ): {
    plan_id: string
    installments: Array<{
      installment_number: number
      amount: number
      due_date: string
      status: 'scheduled' | 'paid' | 'overdue' | 'failed'
    }>
    automation_rules: InvoiceAutomation[]
    success_probability: number
    estimated_recovery_timeline: string
  } {
    const planId = 'plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
    const installmentAmount = invoice.total_amount / planOptions.number_of_installments
    
    const installments = Array.from({ length: planOptions.number_of_installments }, (_, i) => {
      const dueDate = new Date(planOptions.first_payment_date)
      dueDate.setMonth(dueDate.getMonth() + i)
      
      return {
        installment_number: i + 1,
        amount: installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'scheduled' as const
      }
    })

    const automationRules = this.createPaymentPlanAutomations(planId, installments, customer)
    const successProbability = this.calculatePaymentPlanSuccessProbability(customer, planOptions)

    return {
      plan_id: planId,
      installments,
      automation_rules: automationRules,
      success_probability: successProbability,
      estimated_recovery_timeline: '${planOptions.number_of_installments} months'
    }
  }

  // Helper methods
  private initializeDefaultTemplates() {
    this.messageTemplates = [
      {
        id: 'gentle_reminder',
        name: 'Gentle Payment Reminder',
        channel: 'email',
        subject: 'Friendly Reminder: Invoice {{invoice_number}} Payment Due',
        content: 'Hi {{customer_name}},

{{personalized_greeting}}

We hope this message finds you well. This is a friendly reminder that Invoice {{invoice_number}} for {{invoice_amount}} was due on {{due_date}}.

We understand that things can get busy, so we wanted to send you a gentle reminder. If you've already sent the payment, please disregard this message.'

{{incentive_offer}}

If you have any questions or need to discuss payment arrangements, please don't hesitate to reach out to us.'

{{payment_link}}

Thank you for your business!

Best regards,
The Thorbis Books Team',
        personalization_fields: ['customer_name', 'invoice_number', 'invoice_amount', 'due_date'],
        ai_optimization: {
          tone: 'friendly',
          urgency_level: 2,
          response_rate_prediction: 0.65,
          optimal_send_time: '09:00',
          a_b_test_variants: []
        },
        compliance_checked: true,
        legal_approved: true
      },
      {
        id: 'standard_followup',
        name: 'Standard Follow-up',
        channel: 'email',
        subject: 'Payment Required: Invoice {{invoice_number}} - {{days_overdue}} Days Overdue',
        content: 'Dear {{customer_name}},

Our records show that Invoice {{invoice_number}} for {{invoice_amount}} is now {{days_overdue}} days overdue. The original due date was {{due_date}}.

To maintain your account in good standing and avoid any potential service interruptions, please arrange payment immediately.

{{incentive_offer}}

{{payment_link}}

If you're experiencing difficulties with payment, please contact us immediately to discuss available options.'

{{next_steps}}

Thank you for your prompt attention to this matter.

Accounts Receivable Department
Thorbis Books',
        personalization_fields: ['customer_name', 'invoice_number', 'invoice_amount', 'days_overdue', 'due_date'],
        ai_optimization: {
          tone: 'professional',
          urgency_level: 6,
          response_rate_prediction: 0.72,
          optimal_send_time: '10:00',
          a_b_test_variants: []
        },
        compliance_checked: true,
        legal_approved: true
      },
      {
        id: 'urgent_notice',
        name: 'Urgent Payment Notice',
        channel: 'email',
        subject: 'URGENT: Final Notice - Invoice {{invoice_number}} Payment Required',
        content: '{{customer_name}},

This is your FINAL NOTICE for Invoice {{invoice_number}} in the amount of {{invoice_amount}}, which is now {{days_overdue}} days overdue.

IMMEDIATE ACTION REQUIRED:

Payment must be received within 7 days to avoid:
• Collection agency involvement
• Additional fees and interest charges
• Potential impact to your credit rating
• Account suspension

{{incentive_offer}}

{{payment_link}}

If payment is not received or payment arrangements are not made within 7 days, this account will be forwarded to our collection agency.

Contact us immediately: [phone] or [email]

Collections Department
Thorbis Books',
        personalization_fields: ['customer_name', 'invoice_number', 'invoice_amount', 'days_overdue'],
        ai_optimization: {
          tone: 'urgent',
          urgency_level: 9,
          response_rate_prediction: 0.81,
          optimal_send_time: '11:00',
          a_b_test_variants: []
        },
        compliance_checked: true,
        legal_approved: true
      }
    ]
  }

  private initializeDefaultWorkflows() {
    // Implementation for default workflow setup
  }

  private createOptimizedSchedule(
    invoice: Invoice, 
    customer: Customer, 
    strategy: CollectionStrategy
  ): AutomationSchedule {
    return {
      trigger_type: 'days_after_due',
      trigger_value: 1,
      frequency: 'custom',
      max_attempts: strategy.strategy_type === 'aggressive' ? 8 : 5,
      escalation_rules: [
        {
          step: 1,
          trigger_condition: 'no_response_3_days',
          days_since_last_action: 3,
          action_type: 'escalate_tone',
          automation_changes: { urgency_level: '+2' },
          notification_recipients: ['collections@thorbis.com'],
          approval_required: false
        }
      ],
      time_restrictions: {
        business_hours_only: true,
        timezone: 'America/New_York',
        excluded_days: ['Sunday'],
        preferred_times: [{ start: '09:00', end: '17:00' }]
      }
    }
  }

  private initializeMetrics(): AutomationMetrics {
    return {
      total_invoices_processed: 0,
      total_amount_recovered: 0,
      recovery_rate: 0,
      average_days_to_payment: 0,
      response_rates: { email: 0, sms: 0, phone: 0, portal: 0 },
      cost_per_recovery: 0,
      customer_satisfaction_impact: 8.0,
      automation_efficiency: 0,
      manual_intervention_rate: 0
    }
  }

  private generatePaymentLink(invoiceId: string): string {
    return 'https://books.thorbis.com/pay/${invoiceId}'
  }

  private generatePersonalizedGreeting(customer: Customer, behavior?: CustomerPaymentBehavior): string {
    if (behavior?.payment_history.payment_reliability_score > 8) {
      return 'We appreciate your excellent payment history with us.'
    }
    return 'Thank you for being a valued customer.'
  }

  private generateContextualIncentive(invoice: Invoice, customer: Customer, context: unknown): string {
    if (invoice.total_amount > 10000) {
      return 'For your convenience, we can arrange a payment plan if needed.'
    }
    if (context.days_overdue < 10) {
      return 'Pay within 5 days and save 1% on your next invoice.'
    }
    return '
  }

  private generateNextSteps(invoice: Invoice, customer: Customer, context: unknown): string {
    if (context.attempt_number >= 3) {
      return 'If we do not hear from you within 3 business days, this account will be escalated to our collections department.'
    }
    return 'We will follow up again in 7 days if payment is not received.'
  }

  private updateBehaviorAnalysis(behavior: CustomerPaymentBehavior): CustomerPaymentBehavior {
    // Update behavior based on recent activity
    return behavior
  }

  private aggregateMetrics(automations: InvoiceAutomation[]): AutomationMetrics {
    return automations.reduce((acc, automation) => ({
      total_invoices_processed: acc.total_invoices_processed + automation.performance_metrics.total_invoices_processed,
      total_amount_recovered: acc.total_amount_recovered + automation.performance_metrics.total_amount_recovered,
      recovery_rate: (acc.recovery_rate + automation.performance_metrics.recovery_rate) / 2,
      average_days_to_payment: (acc.average_days_to_payment + automation.performance_metrics.average_days_to_payment) / 2,
      response_rates: {
        email: (acc.response_rates.email + automation.performance_metrics.response_rates.email) / 2,
        sms: (acc.response_rates.sms + automation.performance_metrics.response_rates.sms) / 2,
        phone: (acc.response_rates.phone + automation.performance_metrics.response_rates.phone) / 2,
        portal: (acc.response_rates.portal + automation.performance_metrics.response_rates.portal) / 2
      },
      cost_per_recovery: (acc.cost_per_recovery + automation.performance_metrics.cost_per_recovery) / 2,
      customer_satisfaction_impact: (acc.customer_satisfaction_impact + automation.performance_metrics.customer_satisfaction_impact) / 2,
      automation_efficiency: (acc.automation_efficiency + automation.performance_metrics.automation_efficiency) / 2,
      manual_intervention_rate: (acc.manual_intervention_rate + automation.performance_metrics.manual_intervention_rate) / 2
    }), this.initializeMetrics())
  }

  private detectPerformanceIssues(automations: InvoiceAutomation[]): unknown[] {
    return []
  }

  private countPendingActions(): number {
    return 0
  }

  private calculateDailyRecovery(): number {
    return 0
  }

  private createPaymentPlanAutomations(planId: string, installments: unknown[], customer: Customer): InvoiceAutomation[] {
    return []
  }

  private calculatePaymentPlanSuccessProbability(customer: Customer, planOptions: unknown): number {
    return 0.85
  }
}

// AI Engine for Collection Optimization
class AICollectionEngine {
  generateOptimalStrategy(
    invoice: Invoice,
    customer: Customer,
    behavior: CustomerPaymentBehavior,
    options?: any
  ): CollectionStrategy {
    // AI logic to determine optimal collection strategy
    return {
      strategy_type: behavior.risk_assessment.collection_difficulty === 'easy' ? 'gentle' : 'standard',
      communication_channels: ['email', 'phone'],
      message_templates: [],
      payment_incentives: [],
      legal_actions: [],
      customer_segmentation: {
        segment: 'standard',
        criteria: Record<string, unknown>,
        strategy_adjustments: Record<string, unknown>
      }
    }
  }

  optimizeMessage(
    template: MessageTemplate,
    invoice: Invoice,
    customer: Customer, context: unknown,
    behavior?: CustomerPaymentBehavior
  ): unknown {
    return {
      optimizations_applied: ['tone_adjustment', 'timing_optimization'],
      predicted_effectiveness: 0.75,
      optimal_send_time: '09:00',
      alternative_channels: ['phone', 'sms'],
      recommended_tone: 'professional'
    }
  }

  adjustTone(content: string, tone: string, attemptNumber: number, customer: Customer): string {
    // AI tone adjustment logic
    return content
  }

  generateSystemRecommendations(metrics: AutomationMetrics, alerts: unknown[]): AIRecommendation[] {
    return [
      {
        type: 'strategy_optimization',
        title: 'Improve Email Response Rates',
        description: 'Email response rates are below industry average. Consider A/B testing subject lines.',
        expected_improvement: 15,
        confidence_level: 0.8,
        implementation_effort: 'low',
        supporting_data: [
          { metric: 'Email Response Rate', current_value: 45, projected_value: 60, significance: 0.8 }
        ],
        action_items: ['Create 3 subject line variants', 'Run A/B test for 2 weeks', 'Implement winning variant'],
        estimated_roi: 25000
      }
    ]
  }
}

// Utility functions
export function formatAutomationMetrics(metrics: AutomationMetrics): string {
  return 'Recovery Rate: ${(metrics.recovery_rate * 100).toFixed(1)}% | Avg Days to Payment: ${metrics.average_days_to_payment.toFixed(1)} | Cost per Recovery: $${metrics.cost_per_recovery.toFixed(2)}'
}

export function getStrategyColor(strategy: string): string {
  switch (strategy) {
    case 'gentle': return '#22c55e'
    case 'standard': return '#3b82f6'
    case 'aggressive': return '#f59e0b'
    case 'legal': return '#ef4444'
    default: return '#94a3b8'
  }
}

export function calculateAutomationROI(automation: InvoiceAutomation): number {
  const recovered = automation.performance_metrics.total_amount_recovered
  const cost = automation.performance_metrics.cost_per_recovery * automation.performance_metrics.total_invoices_processed
  return cost > 0 ? (recovered - cost) / cost : 0
}