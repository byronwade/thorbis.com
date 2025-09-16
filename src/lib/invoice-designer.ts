import { Invoice, Customer, InvoiceLineItem } from '@/types/accounting'

export interface InvoiceTemplate {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'minimal' | 'branded' | 'custom'
  preview_image: string
  layout: InvoiceLayout
  styling: InvoiceStyleConfig
  ai_optimization: {
    readability_score: number
    brand_consistency: number
    payment_conversion_rate: number
    mobile_friendly: boolean
  }
  usage_stats: {
    times_used: number
    payment_rate: number
    avg_payment_time: number
  }
}

export interface InvoiceLayout {
  header: LayoutSection
  company_info: LayoutSection
  customer_info: LayoutSection
  invoice_details: LayoutSection
  line_items: LayoutSection
  totals: LayoutSection
  payment_info: LayoutSection
  footer: LayoutSection
  watermark?: WatermarkConfig
}

export interface LayoutSection {
  position: { x: number, y: number }
  size: { width: number, height: number }
  alignment: 'left' | 'center' | 'right'
  padding: { top: number, right: number, bottom: number, left: number }
  background_color?: string
  border?: BorderConfig
  visible: boolean
}

export interface BorderConfig {
  width: number
  color: string
  style: 'solid' | 'dashed' | 'dotted'
  radius?: number
}

export interface InvoiceStyleConfig {
  fonts: {
    primary: FontConfig
    secondary: FontConfig
    accent: FontConfig
  }
  colors: ColorPalette
  spacing: SpacingConfig
  branding: BrandingConfig
}

export interface FontConfig {
  family: string
  size: number
  weight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
  line_height: number
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  text_primary: string
  text_secondary: string
  background: string
  border: string
  success: string
  warning: string
  error: string
}

export interface SpacingConfig {
  section_gap: number
  line_height: number
  paragraph_spacing: number
  table_cell_padding: number
}

export interface BrandingConfig {
  logo: {
    url: string
    width: number
    height: number
    position: 'top-left' | 'top-center' | 'top-right'
  }
  company_colors: string[]
  brand_elements: Array<{
    type: 'text' | 'image' | 'shape'
    content: string
    position: { x: number, y: number }
    styling: Record<string, unknown>
  }>
}

export interface WatermarkConfig {
  text: string
  opacity: number
  rotation: number
  position: 'center' | 'diagonal'
  font_size: number
  color: string
}

export interface InvoicePersonalization {
  customer_specific: {
    greeting: string
    payment_terms_message: string
    special_notes: string[]
  }
  ai_recommendations: {
    suggested_payment_methods: string[]
    optimal_due_date: string
    personalized_message: string
    upsell_opportunities: string[]
  }
}

export interface InvoiceOptimization {
  readability: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  conversion: {
    predicted_payment_rate: number
    factors_affecting_payment: string[]
    optimization_recommendations: string[]
  }
  branding: {
    consistency_score: number
    brand_alignment_issues: string[]
    branding_improvements: string[]
  }
  accessibility: {
    wcag_compliance: 'AA' | 'AAA' | 'partial' | 'none'
    accessibility_issues: string[]
    accessibility_fixes: string[]
  }
}

export class InvoiceDesigner {
  private templates: InvoiceTemplate[] = []
  private brandingGuidelines: BrandingConfig
  private aiOptimizationEngine: AIOptimizationEngine

  constructor() {
    this.loadDefaultTemplates()
    this.brandingGuidelines = this.getDefaultBranding()
    this.aiOptimizationEngine = new AIOptimizationEngine()
  }

  // Load pre-built professional templates
  private loadDefaultTemplates() {
    this.templates = [
      {
        id: 'professional_modern',
        name: 'Modern Professional',
        description: 'Clean, modern design with excellent readability',
        category: 'professional',
        preview_image: '/templates/professional_modern.png',
        layout: this.createModernLayout(),
        styling: this.createProfessionalStyling(),
        ai_optimization: {
          readability_score: 9.2,
          brand_consistency: 8.8,
          payment_conversion_rate: 87.5,
          mobile_friendly: true
        },
        usage_stats: {
          times_used: 1247,
          payment_rate: 0.875,
          avg_payment_time: 18.5
        }
      },
      {
        id: 'creative_bold',
        name: 'Creative Bold',
        description: 'Eye-catching design for creative businesses',
        category: 'creative',
        preview_image: '/templates/creative_bold.png',
        layout: this.createCreativeLayout(),
        styling: this.createCreativeStyling(),
        ai_optimization: {
          readability_score: 8.1,
          brand_consistency: 9.4,
          payment_conversion_rate: 82.3,
          mobile_friendly: true
        },
        usage_stats: {
          times_used: 856,
          payment_rate: 0.823,
          avg_payment_time: 21.2
        }
      },
      {
        id: 'minimal_clean',
        name: 'Minimal Clean',
        description: 'Ultra-minimal design focusing on content',
        category: 'minimal',
        preview_image: '/templates/minimal_clean.png',
        layout: this.createMinimalLayout(),
        styling: this.createMinimalStyling(),
        ai_optimization: {
          readability_score: 9.7,
          brand_consistency: 7.9,
          payment_conversion_rate: 89.1,
          mobile_friendly: true
        },
        usage_stats: {
          times_used: 2103,
          payment_rate: 0.891,
          avg_payment_time: 16.8
        }
      }
    ]
  }

  // AI-powered template recommendation
  recommendTemplate(invoice: Invoice, customer: Customer, preferences?: {
    industry?: string
    brand_personality?: 'professional' | 'creative' | 'minimal' | 'bold'
    payment_urgency?: 'low' | 'medium' | 'high'
  }): {
    recommended: InvoiceTemplate[]
    reasoning: string[]
    customizations: Record<string, unknown>
  } {
    const scores = this.templates.map(template => {
      let score = 0
      const reasoning: string[] = []

      // Base score from AI optimization metrics
      score += template.ai_optimization.payment_conversion_rate * 0.4
      score += template.ai_optimization.readability_score * 0.3
      score += template.ai_optimization.brand_consistency * 0.2
      score += (template.ai_optimization.mobile_friendly ? 10 : 0) * 0.1

      // Customer-specific adjustments
      if (customer.payment_terms <= 15) {
        // Short payment terms - prioritize urgency
        if (template.category === 'professional') {
          score += 15
          reasoning.push('Professional template conveys urgency for short payment terms')
        }
      }

      // Invoice amount considerations
      if (invoice.total_amount > 10000) {
        if (template.category === 'professional' || template.category === 'minimal') {
          score += 20
          reasoning.push('Professional appearance appropriate for high-value invoices')
        }
      }

      // Industry preferences
      if (preferences?.industry) {
        switch (preferences.industry.toLowerCase()) {
          case 'creative':
          case 'marketing':
          case 'design':
            if (template.category === 'creative') {
              score += 25
              reasoning.push('Creative template aligns with industry expectations')
            }
            break
          case 'finance':
          case 'legal':
          case 'consulting':
            if (template.category === 'professional' || template.category === 'minimal') {
              score += 25
              reasoning.push('Conservative template appropriate for professional services')
            }
            break
        }
      }

      // Payment urgency
      if (preferences?.payment_urgency === 'high') {
        if (template.usage_stats.avg_payment_time < 20) {
          score += 15
          reasoning.push('Template historically results in faster payments')
        }
      }

      return { template, score, reasoning }
    })

    const sortedTemplates = scores.sort((a, b) => b.score - a.score)
    const recommended = sortedTemplates.slice(0, 3).map(s => s.template)
    const allReasoning = sortedTemplates[0].reasoning

    // Generate customizations based on the top template
    const customizations = this.generateCustomizations(recommended[0], invoice, customer, preferences)

    return {
      recommended,
      reasoning: allReasoning,
      customizations
    }
  }

  // Generate AI-optimized customizations
  private generateCustomizations(
    template: InvoiceTemplate,
    invoice: Invoice,
    customer: Customer,
    preferences?: any
  ): Record<string, unknown> {
    const customizations: Record<string, unknown> = {}

    // Color customizations based on brand or industry
    if (preferences?.industry) {
      switch (preferences.industry.toLowerCase()) {
        case 'healthcare':
          customizations.colors = { ...template.styling.colors, primary: '#0066CC', accent: '#00AA88' }
          break
        case 'finance':
          customizations.colors = { ...template.styling.colors, primary: '#1a365d', accent: '#2c5aa0' }
          break
        case 'creative':
          customizations.colors = { ...template.styling.colors, primary: '#E53E3E', accent: '#9F7AEA' }
          break
      }
    }

    // Payment urgency customizations
    if (preferences?.payment_urgency === 'high') {
      customizations.payment_highlight = {
        background_color: '#FEF2F2',
        border_color: '#EF4444',
        text_emphasis: 'bold'
      }
      customizations.due_date_styling = {
        color: '#DC2626',
        font_weight: 'bold',
        font_size: '18px'
      }
    }

    // Amount-based customizations
    if (invoice.total_amount > 50000) {
      customizations.amount_styling = {
        font_size: '24px',
        font_weight: 'bold',
        color: template.styling.colors.primary
      }
    }

    return customizations
  }

  // Generate personalized invoice content
  generatePersonalization(invoice: Invoice, customer: Customer): InvoicePersonalization {
    const customerHistory = this.getCustomerHistory(customer.id)
    const paymentBehavior = this.analyzePaymentBehavior(customer.id)

    // AI-generated personalized greeting
    let greeting = `Dear ${customer.name},`
    if (customerHistory.is_repeat_customer) {
      greeting = `Dear ${customer.name}, Thank you for your continued business!`
    }
    if (paymentBehavior.is_consistently_fast_payer) {
      greeting = `Dear ${customer.name}, We appreciate your prompt payment history!`
    }

    // Personalized payment terms message
    const paymentTermsMessage = 'Payment is due within ${customer.payment_terms} days of invoice date.'
    if (paymentBehavior.preferred_payment_method) {
      paymentTermsMessage += ' For your convenience, we've included your preferred payment method: ${paymentBehavior.preferred_payment_method}.''
    }

    // Special notes based on customer behavior
    const specialNotes: string[] = []
    if (paymentBehavior.average_days_to_pay > customer.payment_terms + 5) {
      specialNotes.push('Please note the updated due date to help us serve you better.')
    }
    if (invoice.total_amount > customerHistory.average_invoice_amount * 1.5) {
      specialNotes.push('This invoice is larger than usual - please contact us if you need to discuss payment arrangements.')
    }

    // AI recommendations
    const aiRecommendations = {
      suggested_payment_methods: this.getSuggestedPaymentMethods(customer, invoice),
      optimal_due_date: this.calculateOptimalDueDate(customer, invoice),
      personalized_message: this.generatePersonalizedMessage(customer, invoice, customerHistory),
      upsell_opportunities: this.identifyUpsellOpportunities(customer, invoice)
    }

    return {
      customer_specific: {
        greeting,
        payment_terms_message: paymentTermsMessage,
        special_notes: specialNotes
      },
      ai_recommendations: aiRecommendations
    }
  }

  // Optimize invoice for better payment conversion
  optimizeForPayment(invoice: Invoice, template: InvoiceTemplate): InvoiceOptimization {
    const readability = this.analyzeReadability(template)
    const conversion = this.analyzeConversionFactors(invoice, template)
    const branding = this.analyzeBranding(template)
    const accessibility = this.analyzeAccessibility(template)

    return {
      readability,
      conversion,
      branding,
      accessibility
    }
  }

  private analyzeReadability(template: InvoiceTemplate): InvoiceOptimization['readability'] {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 10

    // Font size analysis
    if (template.styling.fonts.primary.size < 12) {
      issues.push('Primary font size too small')
      suggestions.push('Increase primary font size to at least 12pt')
      score -= 1
    }

    // Color contrast analysis
    const primaryContrast = this.calculateColorContrast(
      template.styling.colors.text_primary,
      template.styling.colors.background
    )
    if (primaryContrast < 4.5) {
      issues.push('Insufficient color contrast')
      suggestions.push('Increase contrast between text and background colors')
      score -= 2
    }

    // Layout spacing analysis
    if (template.styling.spacing.line_height < 1.4) {
      issues.push('Line spacing too tight')
      suggestions.push('Increase line height to at least 1.4 for better readability')
      score -= 0.5
    }

    return { score, issues, suggestions }
  }

  private analyzeConversionFactors(invoice: Invoice, template: InvoiceTemplate): InvoiceOptimization['conversion'] {
    const factors: string[] = []
    const recommendations: string[] = []
    const predictedRate = template.usage_stats.payment_rate * 100

    // Amount visibility
    if (invoice.total_amount > 10000) {
      factors.push('High invoice amount may delay payment')
      recommendations.push('Highlight payment terms and consider payment plans')
      predictedRate -= 5
    }

    // Due date prominence
    if (!this.isDueDateProminent(template)) {
      factors.push('Due date not prominently displayed')
      recommendations.push('Make due date more visible with styling emphasis')
      predictedRate -= 3
    }

    // Payment methods
    const paymentMethodsCount = this.countPaymentMethods(template)
    if (paymentMethodsCount < 3) {
      factors.push('Limited payment method options')
      recommendations.push('Add more payment method options (ACH, card, etc.)')
      predictedRate -= 2
    }

    return {
      predicted_payment_rate: Math.max(0, predictedRate),
      factors_affecting_payment: factors,
      optimization_recommendations: recommendations
    }
  }

  private analyzeBranding(template: InvoiceTemplate): InvoiceOptimization['branding'] {
    const issues: string[] = []
    const improvements: string[] = []
    let score = template.ai_optimization.brand_consistency

    if (!template.styling.branding.logo.url) {
      issues.push('No company logo present')
      improvements.push('Add company logo for brand recognition')
      score -= 1
    }

    if (template.styling.branding.company_colors.length < 2) {
      issues.push('Limited brand color usage')
      improvements.push('Incorporate more brand colors throughout the design')
      score -= 0.5
    }

    return {
      consistency_score: score,
      brand_alignment_issues: issues,
      branding_improvements: improvements
    }
  }

  private analyzeAccessibility(template: InvoiceTemplate): InvoiceOptimization['accessibility'] {
    const issues: string[] = []
    const fixes: string[] = []
    let compliance: InvoiceOptimization['accessibility']['wcag_compliance'] = 'AAA'

    // Color contrast check
    const contrast = this.calculateColorContrast(
      template.styling.colors.text_primary,
      template.styling.colors.background
    )

    if (contrast < 3) {
      issues.push('Insufficient color contrast (below AA standards)')
      fixes.push('Increase color contrast to at least 4.5:1')
      compliance = 'none'
    } else if (contrast < 4.5) {
      issues.push('Color contrast below AAA standards')
      fixes.push('Increase color contrast to 7:1 for AAA compliance')
      compliance = 'partial'
    } else if (contrast < 7) {
      compliance = 'AA'
    }

    // Font size check
    if (template.styling.fonts.primary.size < 12) {
      issues.push('Font size below accessibility recommendations')
      fixes.push('Use minimum 12pt font size for body text')
      if (compliance === 'AAA') compliance = 'AA'
    }

    return {
      wcag_compliance: compliance,
      accessibility_issues: issues,
      accessibility_fixes: fixes
    }
  }

  // Generate invoice PDF with selected template and customizations
  async generateInvoicePDF(
    invoice: Invoice,
    template: InvoiceTemplate,
    customizations?: Record<string, unknown>,
    personalization?: InvoicePersonalization
  ): Promise<{
    pdf_buffer: Buffer
    file_name: string
    optimization_score: number
    generation_metadata: {
      template_used: string
      customizations_applied: string[]
      generation_time: number
      file_size: number
    }
  }> {
    const startTime = Date.now()
    
    // Merge template styling with customizations
    const finalStyling = this.mergeStylingWithCustomizations(template.styling, customizations)
    
    // Create PDF content
    const pdfContent = await this.createPDFContent(invoice, template, finalStyling, personalization)
    
    // Generate PDF buffer (mock implementation)
    const pdfBuffer = await this.renderPDF(pdfContent)
    
    const generationTime = Date.now() - startTime
    const fileName = 'invoice_${invoice.invoice_number}_${Date.now()}.pdf'
    
    // Calculate optimization score
    const optimization = this.optimizeForPayment(invoice, template)
    const optimizationScore = (
      optimization.readability.score + 
      optimization.conversion.predicted_payment_rate / 10 + 
      optimization.branding.consistency_score +
      (optimization.accessibility.wcag_compliance === 'AAA' ? 10 : 
       optimization.accessibility.wcag_compliance === 'AA' ? 8 : 
       optimization.accessibility.wcag_compliance === 'partial' ? 5 : 0)
    ) / 4

    return {
      pdf_buffer: pdfBuffer,
      file_name: fileName,
      optimization_score: optimizationScore,
      generation_metadata: {
        template_used: template.name,
        customizations_applied: Object.keys(customizations || {}),
        generation_time: generationTime,
        file_size: pdfBuffer.length
      }
    }
  }

  // Helper methods for template creation
  private createModernLayout(): InvoiceLayout {
    return {
      header: {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 15 },
        alignment: 'center',
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        visible: true
      },
      company_info: {
        position: { x: 0, y: 15 },
        size: { width: 50, height: 20 },
        alignment: 'left',
        padding: { top: 10, right: 10, bottom: 10, left: 20 },
        visible: true
      },
      customer_info: {
        position: { x: 50, y: 15 },
        size: { width: 50, height: 20 },
        alignment: 'right',
        padding: { top: 10, right: 20, bottom: 10, left: 10 },
        visible: true
      },
      invoice_details: {
        position: { x: 0, y: 35 },
        size: { width: 100, height: 15 },
        alignment: 'left',
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        visible: true
      },
      line_items: {
        position: { x: 0, y: 50 },
        size: { width: 100, height: 30 },
        alignment: 'left',
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        visible: true
      },
      totals: {
        position: { x: 60, y: 80 },
        size: { width: 40, height: 15 },
        alignment: 'right',
        padding: { top: 10, right: 20, bottom: 10, left: 10 },
        visible: true
      },
      payment_info: {
        position: { x: 0, y: 85 },
        size: { width: 100, height: 10 },
        alignment: 'left',
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        visible: true
      },
      footer: {
        position: { x: 0, y: 95 },
        size: { width: 100, height: 5 },
        alignment: 'center',
        padding: { top: 5, right: 20, bottom: 5, left: 20 },
        visible: true
      }
    }
  }

  private createProfessionalStyling(): InvoiceStyleConfig {
    return {
      fonts: {
        primary: {
          family: 'Inter',
          size: 12,
          weight: 'normal',
          color: '#1F2937',
          line_height: 1.5
        },
        secondary: {
          family: 'Inter',
          size: 10,
          weight: 'normal',
          color: '#6B7280',
          line_height: 1.4
        },
        accent: {
          family: 'Inter',
          size: 16,
          weight: 'bold',
          color: '#1F2937',
          line_height: 1.3
        }
      },
      colors: {
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#3B82F6',
        text_primary: '#111827',
        text_secondary: '#6B7280',
        background: '#FFFFFF',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      spacing: {
        section_gap: 20,
        line_height: 1.5,
        paragraph_spacing: 12,
        table_cell_padding: 8
      },
      branding: {
        logo: {
          url: ',
          width: 120,
          height: 60,
          position: 'top-left'
        },
        company_colors: ['#3B82F6', '#1F2937'],
        brand_elements: []
      }
    }
  }

  // Additional helper methods would continue here...
  private createCreativeLayout(): InvoiceLayout { return this.createModernLayout() }
  private createMinimalLayout(): InvoiceLayout { return this.createModernLayout() }
  private createCreativeStyling(): InvoiceStyleConfig { return this.createProfessionalStyling() }
  private createMinimalStyling(): InvoiceStyleConfig { return this.createProfessionalStyling() }
  private getDefaultBranding(): BrandingConfig { return this.createProfessionalStyling().branding }
  private getCustomerHistory(customerId: string): unknown { return { is_repeat_customer: true, average_invoice_amount: 5000 } }
  private analyzePaymentBehavior(customerId: string): unknown { return { is_consistently_fast_payer: true, preferred_payment_method: 'ACH', average_days_to_pay: 15 } }
  private getSuggestedPaymentMethods(customer: Customer, invoice: Invoice): string[] { return ['ACH Transfer', 'Credit Card', 'Check'] }
  private calculateOptimalDueDate(customer: Customer, invoice: Invoice): string { return new Date(Date.now() + customer.payment_terms * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  private generatePersonalizedMessage(customer: Customer, invoice: Invoice, history: unknown): string { return 'Thank you for your business, ${customer.name}!' }
  private identifyUpsellOpportunities(customer: Customer, invoice: Invoice): string[] { return ['Premium Support Package', 'Extended Warranty'] }
  private calculateColorContrast(color1: string, color2: string): number { return 4.5 }
  private isDueDateProminent(template: InvoiceTemplate): boolean { return true }
  private countPaymentMethods(template: InvoiceTemplate): number { return 3 }
  private mergeStylingWithCustomizations(styling: InvoiceStyleConfig, customizations?: Record<string, unknown>): InvoiceStyleConfig { return styling }
  private async createPDFContent(invoice: Invoice, template: InvoiceTemplate, styling: InvoiceStyleConfig, personalization?: InvoicePersonalization): Promise<unknown> { return {} }
  private async renderPDF(content: unknown): Promise<Buffer> { return Buffer.from('mock pdf content') }
}

class AIOptimizationEngine {
  // Mock AI optimization engine
  optimizeTemplate(template: InvoiceTemplate, criteria: unknown): InvoiceTemplate {
    return template
  }
}

// Utility functions
export function calculateTemplateScore(template: InvoiceTemplate, criteria: {
  payment_speed_weight?: number
  readability_weight?: number
  brand_weight?: number
  mobile_weight?: number
}): number {
  const weights = {
    payment_speed_weight: criteria.payment_speed_weight || 0.4,
    readability_weight: criteria.readability_weight || 0.3,
    brand_weight: criteria.brand_weight || 0.2,
    mobile_weight: criteria.mobile_weight || 0.1
  }

  return (
    template.ai_optimization.payment_conversion_rate * weights.payment_speed_weight +
    template.ai_optimization.readability_score * 10 * weights.readability_weight +
    template.ai_optimization.brand_consistency * 10 * weights.brand_weight +
    (template.ai_optimization.mobile_friendly ? 100 : 0) * weights.mobile_weight
  )
}

export function getTemplatesByCategory(templates: InvoiceTemplate[], category: string): InvoiceTemplate[] {
  return templates.filter(template => template.category === category)
}

export function formatTemplateUsageStats(stats: InvoiceTemplate['usage_stats']): string {
  return 'Used ${stats.times_used.toLocaleString()} times • ${(stats.payment_rate * 100).toFixed(1)}% payment rate • ${stats.avg_payment_time.toFixed(1)} day avg'
}