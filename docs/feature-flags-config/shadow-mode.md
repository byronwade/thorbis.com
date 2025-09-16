# Thorbis Shadow Mode Execution

Comprehensive shadow mode system for testing features in read-only mode with UI intents only, enabling safe validation without actual system changes.

## 🌙 Shadow Mode Overview

Shadow Mode allows features to be tested in production environments without making actual changes to data or triggering real-world actions. This provides:

- **Risk-Free Testing**: Validate feature logic without side effects
- **Performance Measurement**: Measure execution time and resource usage
- **Error Detection**: Identify issues before full rollout
- **UI Validation**: Test user interfaces with real data
- **Integration Testing**: Validate external API calls without execution

### Shadow Mode States
```typescript
enum ShadowExecution {
  VALIDATE_ONLY = 'validate',     // Run validation logic only
  DRY_RUN = 'dry_run',           // Full execution simulation
  UI_INTENTS = 'ui_intents',     // UI changes only, no data changes
  LOG_ONLY = 'log_only'          // Log what would happen
}
```

## 🎭 Implementation Architecture

### Shadow Mode Handler
```typescript
interface ShadowModeConfig {
  flag_name: string
  execution_type: ShadowExecution
  log_level: 'debug' | 'info' | 'warn'
  ui_intents_enabled: boolean
  external_apis_enabled: boolean
  database_writes_enabled: boolean
  notification_sends_enabled: boolean
}

class ShadowModeHandler {
  private config: ShadowModeConfig
  private auditLogger: AuditLogger
  private uiIntentBus: UIIntentBus
  
  constructor(config: ShadowModeConfig) {
    this.config = config
    this.auditLogger = new AuditLogger('shadow_mode')
    this.uiIntentBus = new UIIntentBus()
  }
  
  // Execute function in shadow mode
  async execute<T>(
    operation: string,
    handler: () => Promise<T>,
    shadowHandler?: () => Promise<Partial<T>>
  ): Promise<ShadowResult<T>> {
    const startTime = Date.now()
    const executionId = uuidv4()
    
    try {
      let result: T | Partial<T>
      let errors: Error[] = []
      let validationResults: ValidationResult[] = []
      
      switch (this.config.execution_type) {
        case ShadowExecution.VALIDATE_ONLY:
          result = await this.validateOnly(operation, handler)
          break
          
        case ShadowExecution.DRY_RUN:
          result = await this.dryRun(operation, handler, shadowHandler)
          break
          
        case ShadowExecution.UI_INTENTS:
          result = await this.uiIntentsOnly(operation, handler)
          break
          
        case ShadowExecution.LOG_ONLY:
          result = await this.logOnly(operation, handler)
          break
      }
      
      const executionTime = Date.now() - startTime
      
      // Log shadow execution
      await this.auditLogger.logShadowExecution({
        flag_name: this.config.flag_name,
        operation: operation,
        execution_id: executionId,
        execution_type: this.config.execution_type,
        execution_time_ms: executionTime,
        success: true,
        result_summary: this.summarizeResult(result),
        errors: errors,
        validation_results: validationResults
      })
      
      return {
        execution_id: executionId,
        shadow_mode: true,
        execution_type: this.config.execution_type,
        execution_time_ms: executionTime,
        result: result as T,
        errors: errors,
        validations: validationResults,
        ui_intents: this.getRecordedIntents(executionId)
      }
      
    } catch (error) {
      await this.auditLogger.logShadowError({
        flag_name: this.config.flag_name,
        operation: operation,
        execution_id: executionId,
        error: error
      })
      
      throw error
    }
  }
  
  // Validation-only execution
  private async validateOnly<T>(
    operation: string,
    handler: () => Promise<T>
  ): Promise<Partial<T>> {
    // Execute only validation logic, skip actual operations
    const validation = await this.extractValidationLogic(handler)
    return validation
  }
  
  // Dry run execution
  private async dryRun<T>(
    operation: string,
    handler: () => Promise<T>,
    shadowHandler?: () => Promise<Partial<T>>
  ): Promise<T | Partial<T>> {
    if (shadowHandler) {
      return await shadowHandler()
    }
    
    // Execute handler with mocked dependencies
    return await this.executeWithMocks(handler)
  }
  
  // UI intents only execution
  private async uiIntentsOnly<T>(
    operation: string,
    handler: () => Promise<T>
  ): Promise<Partial<T>> {
    // Enable UI intent recording
    this.uiIntentBus.startRecording()
    
    try {
      // Extract UI logic and execute
      const uiResult = await this.extractUILogic(handler)
      
      // Record all UI intents that would be sent
      const intents = this.uiIntentBus.getRecordedIntents()
      
      return {
        ui_intents: intents,
        ui_changes: uiResult
      } as Partial<T>
      
    } finally {
      this.uiIntentBus.stopRecording()
    }
  }
  
  // Log-only execution  
  private async logOnly<T>(
    operation: string,
    handler: () => Promise<T>
  ): Promise<Partial<T>> {
    // Analyze what would happen without executing
    const analysis = await this.analyzeExecution(handler)
    
    console.log(`[SHADOW LOG] Would execute: ${operation}`)
    console.log(`[SHADOW LOG] Operations: ${analysis.operations.join(', ')}`)
    console.log(`[SHADOW LOG] External APIs: ${analysis.external_apis.join(', ')}`)
    console.log(`[SHADOW LOG] Database changes: ${analysis.db_changes.length}`)
    
    return {
      would_execute: analysis
    } as Partial<T>
  }
}
```

## 📋 Domain-Specific Shadow Mode

### Invoices Domain Shadow Mode
```typescript
class InvoicesShadowMode {
  // Shadow mode for invoice creation
  static async createInvoice(invoiceData: CreateInvoiceRequest): Promise<ShadowResult<Invoice>> {
    const shadowHandler = new ShadowModeHandler({
      flag_name: 'invoices.write',
      execution_type: ShadowExecution.DRY_RUN,
      log_level: 'info',
      ui_intents_enabled: true,
      external_apis_enabled: false,
      database_writes_enabled: false,
      notification_sends_enabled: false
    })
    
    return await shadowHandler.execute(
      'create_invoice',
      async () => {
        // This would be the real implementation
        const invoice = await InvoiceService.create(invoiceData)
        return invoice
      },
      async () => {
        // Shadow implementation
        const validation = await InvoiceService.validateInvoiceData(invoiceData)
        
        if (validation.valid) {
          // Simulate invoice creation
          const mockInvoice: Partial<Invoice> = {
            id: `shadow_${uuidv4()}`,
            number: await InvoiceService.getNextInvoiceNumber(),
            customer_id: invoiceData.customer_id,
            total: invoiceData.line_items.reduce((sum, item) => sum + item.total, 0),
            status: 'draft',
            created_at: new Date().toISOString()
          }
          
          // Record UI intent to show success message
          await this.recordUIIntent({
            type: 'show_toast',
            message: `Invoice ${mockInvoice.number} created successfully`,
            variant: 'success'
          })
          
          // Record UI intent to navigate to invoice
          await this.recordUIIntent({
            type: 'navigate',
            path: `/invoices/${mockInvoice.id}`
          })
          
          return mockInvoice
        }
        
        return { validation }
      }
    )
  }
  
  // Shadow mode for PDF generation
  static async generateInvoicePDF(invoiceId: string): Promise<ShadowResult<{pdf_url: string}>> {
    const shadowHandler = new ShadowModeHandler({
      flag_name: 'invoices.pdf_generation',
      execution_type: ShadowExecution.UI_INTENTS,
      log_level: 'info',
      ui_intents_enabled: true,
      external_apis_enabled: false,
      database_writes_enabled: false,
      notification_sends_enabled: false
    })
    
    return await shadowHandler.execute(
      'generate_invoice_pdf',
      async () => {
        return await PDFService.generateInvoicePDF(invoiceId)
      },
      async () => {
        // Validate invoice exists and is ready for PDF
        const invoice = await InvoiceService.getById(invoiceId)
        if (!invoice) {
          throw new Error('Invoice not found')
        }
        
        // Simulate PDF generation time
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Record UI intent to show PDF generation progress
        await this.recordUIIntent({
          type: 'update_component_state',
          component: 'InvoicePDFButton',
          state: { loading: true, progress: 0 }
        })
        
        await this.recordUIIntent({
          type: 'update_component_state',
          component: 'InvoicePDFButton', 
          state: { loading: true, progress: 50 }
        })
        
        await this.recordUIIntent({
          type: 'update_component_state',
          component: 'InvoicePDFButton',
          state: { loading: true, progress: 100 }
        })
        
        // Record UI intent to show download link
        const mockPDFUrl = `https://storage.thorbis.com/invoices/shadow_${invoiceId}.pdf`
        await this.recordUIIntent({
          type: 'update_component_state',
          component: 'InvoicePDFButton',
          state: { 
            loading: false, 
            pdf_url: mockPDFUrl,
            download_ready: true
          }
        })
        
        return { pdf_url: mockPDFUrl }
      }
    )
  }
}
```

### Estimates Domain Shadow Mode
```typescript
class EstimatesShadowMode {
  // Shadow mode for estimate creation with AI pricing
  static async createEstimateWithAI(estimateData: CreateEstimateRequest): Promise<ShadowResult<Estimate>> {
    const shadowHandler = new ShadowModeHandler({
      flag_name: 'estimates.ai_pricing',
      execution_type: ShadowExecution.DRY_RUN,
      log_level: 'debug',
      ui_intents_enabled: true,
      external_apis_enabled: false, // Don't call AI service
      database_writes_enabled: false,
      notification_sends_enabled: false
    })
    
    return await shadowHandler.execute(
      'create_estimate_with_ai',
      async () => {
        return await EstimateService.createWithAIPricing(estimateData)
      },
      async () => {
        // Shadow AI pricing logic
        const baseEstimate = await EstimateService.calculateBasicPricing(estimateData)
        
        // Simulate AI pricing suggestions (don't call actual AI)
        const aiPricingSuggestions = {
          labor_rate_adjustment: 1.15, // 15% higher than base
          material_markup: 0.35,       // 35% markup
          complexity_multiplier: 1.2,  // 20% for job complexity
          market_adjustment: 1.05,     // 5% market premium
          confidence_score: 0.87
        }
        
        // Apply mock AI suggestions
        const aiAdjustedTotal = baseEstimate.subtotal * aiPricingSuggestions.complexity_multiplier * aiPricingSuggestions.market_adjustment
        
        // Record UI intents to show AI suggestions
        await this.recordUIIntent({
          type: 'show_component',
          component: 'AIPricingSuggestions',
          props: {
            suggestions: aiPricingSuggestions,
            original_total: baseEstimate.subtotal,
            suggested_total: aiAdjustedTotal,
            confidence: aiPricingSuggestions.confidence_score
          }
        })
        
        await this.recordUIIntent({
          type: 'update_form_field',
          form: 'EstimateForm',
          field: 'total',
          value: aiAdjustedTotal,
          highlight: true
        })
        
        return {
          ...baseEstimate,
          total: aiAdjustedTotal,
          ai_suggestions: aiPricingSuggestions,
          shadow_mode: true
        }
      }
    )
  }
  
  // Shadow mode for converting estimate to invoice
  static async convertToInvoice(estimateId: string): Promise<ShadowResult<Invoice>> {
    const shadowHandler = new ShadowModeHandler({
      flag_name: 'estimates.convert_to_invoice',
      execution_type: ShadowExecution.VALIDATE_ONLY,
      log_level: 'info',
      ui_intents_enabled: true,
      external_apis_enabled: false,
      database_writes_enabled: false,
      notification_sends_enabled: false
    })
    
    return await shadowHandler.execute(
      'convert_estimate_to_invoice',
      async () => {
        return await EstimateService.convertToInvoice(estimateId)
      },
      async () => {
        // Validate estimate can be converted
        const estimate = await EstimateService.getById(estimateId)
        if (!estimate) {
          throw new Error('Estimate not found')
        }
        
        if (estimate.status !== 'approved') {
          throw new Error('Only approved estimates can be converted to invoices')
        }
        
        // Check if conversion dependencies are met
        const validationResults = await EstimateService.validateForConversion(estimate)
        
        if (validationResults.valid) {
          // Record UI intent to show conversion preview
          await this.recordUIIntent({
            type: 'show_modal',
            modal: 'ConversionPreviewModal',
            props: {
              estimate: estimate,
              invoice_preview: {
                number: await InvoiceService.getNextInvoiceNumber(),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                line_items: estimate.line_items,
                total: estimate.total
              }
            }
          })
          
          return {
            conversion_valid: true,
            validation_results: validationResults,
            preview_data: {
              invoice_number: await InvoiceService.getNextInvoiceNumber(),
              total: estimate.total,
              line_items_count: estimate.line_items.length
            }
          }
        }
        
        return {
          conversion_valid: false,
          validation_results: validationResults
        }
      }
    )
  }
}
```

### Scheduling Domain Shadow Mode
```typescript
class SchedulingShadowMode {
  // Shadow mode for job scheduling with auto-assignment
  static async scheduleJobWithAutoAssignment(jobData: CreateJobRequest): Promise<ShadowResult<Job>> {
    const shadowHandler = new ShadowModeHandler({
      flag_name: 'scheduling.auto_assignment',
      execution_type: ShadowExecution.UI_INTENTS,
      log_level: 'info',
      ui_intents_enabled: true,
      external_apis_enabled: false,
      database_writes_enabled: false,
      notification_sends_enabled: false
    })
    
    return await shadowHandler.execute(
      'schedule_job_auto_assignment',
      async () => {
        return await SchedulingService.scheduleWithAutoAssignment(jobData)
      },
      async () => {
        // Simulate auto-assignment algorithm
        const availableStaff = await StaffService.getAvailable(jobData.scheduled_date, jobData.duration)
        const bestMatch = await SchedulingService.findBestMatch(jobData, availableStaff)
        
        // Record UI intent to show assignment suggestions
        await this.recordUIIntent({
          type: 'update_component_state',
          component: 'JobSchedulingForm',
          state: {
            auto_assignment_loading: true
          }
        })
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        await this.recordUIIntent({
          type: 'show_component',
          component: 'AutoAssignmentSuggestions',
          props: {
            suggestions: availableStaff.map(staff => ({
              staff_id: staff.id,
              staff_name: staff.name,
              skills_match: SchedulingService.calculateSkillsMatch(jobData, staff),
              distance: SchedulingService.calculateDistance(jobData.location, staff.location),
              availability_score: staff.availability_score,
              recommended: staff.id === bestMatch?.id
            }))
          }
        })
        
        await this.recordUIIntent({
          type: 'update_form_field',
          form: 'JobSchedulingForm',
          field: 'assigned_to',
          value: bestMatch?.id,
          highlight: true
        })
        
        return {
          job_id: `shadow_${uuidv4()}`,
          assigned_to: bestMatch?.id,
          assignment_confidence: bestMatch?.confidence || 0,
          alternative_assignments: availableStaff.filter(s => s.id !== bestMatch?.id).slice(0, 3)
        }
      }
    )
  }
}
```

## 🎨 UI Intent Recording

### UI Intent Types
```typescript
interface UIIntent {
  id: string
  type: UIIntentType
  timestamp: string
  component?: string
  props?: Record<string, any>
  state?: Record<string, any>
  metadata?: Record<string, any>
}

enum UIIntentType {
  // Navigation
  NAVIGATE = 'navigate',
  REDIRECT = 'redirect',
  BACK = 'back',
  
  // Component State
  UPDATE_COMPONENT_STATE = 'update_component_state',
  SHOW_COMPONENT = 'show_component',
  HIDE_COMPONENT = 'hide_component',
  
  // Form Interactions
  UPDATE_FORM_FIELD = 'update_form_field',
  SUBMIT_FORM = 'submit_form',
  RESET_FORM = 'reset_form',
  
  // Modals and Overlays
  SHOW_MODAL = 'show_modal',
  CLOSE_MODAL = 'close_modal',
  SHOW_TOAST = 'show_toast',
  
  // Data Updates
  REFRESH_DATA = 'refresh_data',
  UPDATE_TABLE = 'update_table',
  ADD_TABLE_ROW = 'add_table_row',
  
  // UI Feedback
  SHOW_LOADING = 'show_loading',
  HIDE_LOADING = 'hide_loading',
  HIGHLIGHT_ELEMENT = 'highlight_element'
}
```

### UI Intent Bus for Shadow Mode
```typescript
class ShadowUIIntentBus extends UIIntentBus {
  private recording: boolean = false
  private recordedIntents: UIIntent[] = []
  
  startRecording(): void {
    this.recording = true
    this.recordedIntents = []
  }
  
  stopRecording(): void {
    this.recording = false
  }
  
  getRecordedIntents(): UIIntent[] {
    return [...this.recordedIntents]
  }
  
  // Override sendCommand to record during shadow mode
  async sendCommand(command: UICommand): Promise<void> {
    if (this.recording) {
      const intent: UIIntent = {
        id: uuidv4(),
        type: command.type as UIIntentType,
        timestamp: new Date().toISOString(),
        component: command.component,
        props: command.props,
        state: command.state,
        metadata: {
          shadow_mode: true,
          recorded_during: 'shadow_execution'
        }
      }
      
      this.recordedIntents.push(intent)
      console.log('[SHADOW UI]', intent)
    } else {
      // Normal execution
      await super.sendCommand(command)
    }
  }
  
  // Apply recorded intents (for testing UI changes)
  async applyRecordedIntents(): Promise<void> {
    console.log(`Applying ${this.recordedIntents.length} recorded UI intents`)
    
    for (const intent of this.recordedIntents) {
      await this.applyIntent(intent)
    }
  }
  
  private async applyIntent(intent: UIIntent): Promise<void> {
    // Convert intent back to UI command and execute
    const command: UICommand = {
      type: intent.type,
      component: intent.component,
      props: intent.props,
      state: intent.state
    }
    
    await super.sendCommand(command)
  }
}
```

## 📊 Shadow Mode Analytics

### Shadow Execution Metrics
```typescript
interface ShadowExecutionMetrics {
  flag_name: string
  operation: string
  execution_type: ShadowExecution
  
  // Performance
  execution_time_ms: number
  memory_usage_mb: number
  cpu_usage_percent: number
  
  // Results  
  success_rate: number
  error_count: number
  validation_failures: number
  
  // UI Interactions
  ui_intents_recorded: number
  ui_components_affected: string[]
  
  // External Dependencies
  external_api_calls_avoided: number
  database_writes_avoided: number
  notifications_avoided: number
  
  // Business Metrics
  transactions_simulated: number
  revenue_impact_simulated: number
  users_affected: number
}

class ShadowModeAnalytics {
  async recordExecution(metrics: ShadowExecutionMetrics): Promise<void> {
    await db.shadow_execution_metrics.insert({
      ...metrics,
      recorded_at: new Date()
    })
  }
  
  async getShadowModeReport(flagName: string, period: string = '7d'): Promise<ShadowModeReport> {
    const executions = await db.shadow_execution_metrics
      .where('flag_name', flagName)
      .where('recorded_at', '>=', new Date(Date.now() - parsePeriod(period)))
      .orderBy('recorded_at', 'desc')
    
    return {
      flag_name: flagName,
      period: period,
      total_executions: executions.length,
      avg_execution_time: executions.reduce((sum, e) => sum + e.execution_time_ms, 0) / executions.length,
      success_rate: executions.filter(e => e.success_rate > 0.9).length / executions.length,
      error_rate: executions.reduce((sum, e) => sum + e.error_count, 0) / executions.length,
      ui_intents_per_execution: executions.reduce((sum, e) => sum + e.ui_intents_recorded, 0) / executions.length,
      readiness_score: this.calculateReadinessScore(executions)
    }
  }
  
  private calculateReadinessScore(executions: ShadowExecutionMetrics[]): number {
    if (executions.length === 0) return 0
    
    const avgSuccessRate = executions.reduce((sum, e) => sum + e.success_rate, 0) / executions.length
    const avgErrorRate = executions.reduce((sum, e) => sum + e.error_count, 0) / executions.length
    const consistency = this.calculateConsistency(executions)
    
    return (avgSuccessRate * 0.5) + (consistency * 0.3) + ((1 - Math.min(avgErrorRate / 10, 1)) * 0.2)
  }
}
```

## 🔄 Shadow to Production Transition

### Readiness Criteria
```typescript
interface ShadowModeReadiness {
  flag_name: string
  ready_for_canary: boolean
  ready_for_production: boolean
  
  criteria: {
    execution_success_rate: number    // >95%
    error_rate: number               // <2%
    performance_acceptable: boolean   // <110% of baseline
    ui_validation_passed: boolean    // All UI intents valid
    dependencies_validated: boolean  // All deps working
  }
  
  recommendations: string[]
  blocking_issues: string[]
}

async function assessShadowModeReadiness(flagName: string): Promise<ShadowModeReadiness> {
  const analytics = new ShadowModeAnalytics()
  const report = await analytics.getShadowModeReport(flagName, '7d')
  
  const ready = {
    flag_name: flagName,
    ready_for_canary: false,
    ready_for_production: false,
    criteria: {
      execution_success_rate: report.success_rate,
      error_rate: report.error_rate,
      performance_acceptable: report.avg_execution_time < 1100, // Within 10% of 1s baseline
      ui_validation_passed: await validateUIIntents(flagName),
      dependencies_validated: await validateDependencies(flagName)
    },
    recommendations: [],
    blocking_issues: []
  }
  
  // Check canary readiness
  if (ready.criteria.execution_success_rate >= 0.95 && 
      ready.criteria.error_rate <= 0.02 &&
      ready.criteria.performance_acceptable) {
    ready.ready_for_canary = true
  }
  
  // Check production readiness  
  if (ready.ready_for_canary &&
      ready.criteria.ui_validation_passed &&
      ready.criteria.dependencies_validated) {
    ready.ready_for_production = true
  }
  
  return ready
}
```

This comprehensive shadow mode system enables safe testing of features with UI intents only, providing validation and confidence before full rollout.
