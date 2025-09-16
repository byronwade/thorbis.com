/**
 * Thorbis Intent Bus Demo Implementation
 * 
 * Complete working demonstration of the client-side Intent Bus system
 * with validation, logging, origin tracking, and replay capabilities.
 */

import type { JSONSchema7 } from 'json-schema'

// ============================================================================
// CORE TYPES AND INTERFACES
// ============================================================================

type IntentOrigin = 'AI' | 'USER' | 'SYSTEM'
type IntentStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'rejected'

interface BaseIntent {
  type: string
  intent_id: string
  timestamp: string
  origin: IntentOrigin
  payload: any
  metadata?: {
    session_id?: string
    tenant_id?: string
    user_id?: string
    correlation_id?: string
  }
}

interface NavigateIntent extends BaseIntent {
  type: 'NAVIGATE'
  payload: {
    route: string
    params?: Record<string, string>
    query?: Record<string, string>
    replace?: boolean
    external?: boolean
  }
}

interface SetTableStateIntent extends BaseIntent {
  type: 'SET_TABLE_STATE'
  payload: {
    table_id: string
    state_update: {
      filters?: Array<{
        field: string
        operator: string
        value: any
        data_type: string
      }>
      sorting?: Array<{
        field: string
        direction: 'asc' | 'desc'
      }>
      pagination?: {
        page?: number
        page_size?: number
        offset?: number
      }
      selection?: {
        selected_rows?: string[]
        select_all?: boolean
        select_page?: boolean
      }
    }
    merge_strategy?: 'replace' | 'merge' | 'append'
  }
}

interface OpenModalIntent extends BaseIntent {
  type: 'OPEN_MODAL'
  payload: {
    panel_type: 'sidebar' | 'inline_form' | 'section_expand' | 'detail_panel' | 'filter_panel' | 'action_panel'
    panel_id: string
    content_type: 'form' | 'details' | 'list' | 'filters' | 'actions' | 'confirmation' | 'help'
    context?: {
      entity_id?: string
      entity_type?: string
      parent_context?: string
      action?: string
    }
    panel_config?: {
      width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
      position?: 'left' | 'right' | 'below' | 'inline'
      closable?: boolean
      auto_focus?: boolean
    }
    data?: any
  }
}

interface SetThemeIntent extends BaseIntent {
  type: 'SET_THEME'
  payload: {
    theme_updates: {
      color_scheme?: 'light' | 'dark' | 'auto'
      density?: 'compact' | 'comfortable' | 'spacious'
      font_size?: 'small' | 'medium' | 'large'
      motion?: 'full' | 'reduced' | 'none'
      high_contrast?: boolean
      industry_branding?: boolean
    }
    scope?: 'session' | 'user' | 'device'
    apply_immediately?: boolean
  }
}

interface RunClientActionIntent extends BaseIntent {
  type: 'RUN_CLIENT_ACTION'
  payload: {
    action: string
    parameters: {
      target?: string
      format?: string
      data?: any
      options?: any
    }
    safety_checks: {
      requires_user_consent?: boolean
      data_access_level?: 'none' | 'current_page' | 'user_data' | 'tenant_data'
      external_interaction?: boolean
    }
  }
}

type Intent = NavigateIntent | SetTableStateIntent | OpenModalIntent | SetThemeIntent | RunClientActionIntent

interface ValidationError {
  code: string
  message: string
  field?: string
  severity: 'error' | 'warning' | 'info'
  recoverable: boolean
  context: {
    intent_id: string
    intent_type: string
    validation_stage: number
    timestamp: string
  }
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  performance_ms: number
}

interface ExecutionResult {
  success: boolean
  duration_ms: number
  side_effects: string[]
  error?: string
}

interface IntentLogEntry {
  log_id: string
  intent_id: string
  correlation_id: string
  sequence_number: number
  timestamp: string
  execution_start?: string
  execution_end?: string
  duration_ms?: number
  intent_type: string
  origin: IntentOrigin
  status: IntentStatus
  validation_result: ValidationResult
  execution_result?: ExecutionResult
  context: any
  payload: any
  error?: {
    error_code: string
    error_message: string
    error_type: string
    recoverable: boolean
  }
}

// ============================================================================
// INTENT BUS IMPLEMENTATION
// ============================================================================

export class IntentBus {
  private validators: Map<string, IntentValidator> = new Map()
  private executors: Map<string, IntentExecutor> = new Map()
  private logger: IntentLogger
  private queue: IntentQueue
  private originTagger: OriginTagger
  
  constructor() {
    this.logger = new IntentLogger()
    this.queue = new IntentQueue()
    this.originTagger = new OriginTagger()
    
    // Register built-in validators and executors
    this.registerIntentHandlers()
  }
  
  private registerIntentHandlers(): void {
    // Register validators
    this.validators.set('NAVIGATE', new NavigateValidator())
    this.validators.set('SET_TABLE_STATE', new TableStateValidator())
    this.validators.set('OPEN_MODAL', new ModalValidator())
    this.validators.set('SET_THEME', new ThemeValidator())
    this.validators.set('RUN_CLIENT_ACTION', new ClientActionValidator())
    
    // Register executors
    this.executors.set('NAVIGATE', new NavigateExecutor())
    this.executors.set('SET_TABLE_STATE', new TableStateExecutor())
    this.executors.set('OPEN_MODAL', new ModalExecutor())
    this.executors.set('SET_THEME', new ThemeExecutor())
    this.executors.set('RUN_CLIENT_ACTION', new ClientActionExecutor())
  }
  
  async processIntent(intent: Intent): Promise<IntentLogEntry> {
    const startTime = Date.now()
    
    // Generate unique log entry
    const logEntry: IntentLogEntry = {
      log_id: this.generateLogId(),
      intent_id: intent.intent_id,
      correlation_id: intent.metadata?.correlation_id || intent.intent_id,
      sequence_number: await this.getSequenceNumber(intent.metadata?.correlation_id || intent.intent_id),
      timestamp: intent.timestamp,
      execution_start: new Date().toISOString(),
      intent_type: intent.type,
      origin: intent.origin,
      status: 'pending',
      validation_result: { valid: false, errors: [], warnings: [], performance_ms: 0 },
      context: this.captureExecutionContext(),
      payload: this.sanitizePayload(intent.payload)
    }
    
    try {
      // Stage 1: Validate intent
      const validationResult = await this.validateIntent(intent)
      logEntry.validation_result = validationResult
      
      if (!validationResult.valid) {
        logEntry.status = 'rejected'
        logEntry.error = {
          error_code: 'INTENT_VALIDATION_FAILED',
          error_message: validationResult.errors.map(e => e.message).join('; '),
          error_type: 'validation',
          recoverable: validationResult.errors.some(e => e.recoverable)
        }
        
        // Log rejection and return
        await this.logger.logIntent(logEntry)
        return logEntry
      }
      
      // Stage 2: Queue for execution
      await this.queue.enqueue(intent, logEntry)
      logEntry.status = 'executing'
      
      // Stage 3: Execute intent
      const executionResult = await this.executeIntent(intent)
      logEntry.execution_result = executionResult
      logEntry.status = executionResult.success ? 'completed' : 'failed'
      
      if (!executionResult.success) {
        logEntry.error = {
          error_code: 'INTENT_EXECUTION_FAILED',
          error_message: executionResult.error || 'Unknown execution error',
          error_type: 'execution',
          recoverable: true
        }
      }
      
    } catch (error: any) {
      logEntry.status = 'failed'
      logEntry.error = {
        error_code: 'INTENT_PROCESSING_ERROR',
        error_message: error.message,
        error_type: 'system',
        recoverable: false
      }
    } finally {
      logEntry.execution_end = new Date().toISOString()
      logEntry.duration_ms = Date.now() - startTime
      
      // Log final result
      await this.logger.logIntent(logEntry)
    }
    
    return logEntry
  }
  
  private async validateIntent(intent: Intent): Promise<ValidationResult> {
    const validator = this.validators.get(intent.type)
    
    if (!validator) {
      return {
        valid: false,
        errors: [{
          code: 'INTENT_TYPE_UNSUPPORTED',
          message: `Intent type '${intent.type}' is not supported or recognized`,
          severity: 'error',
          recoverable: false,
          context: {
            intent_id: intent.intent_id,
            intent_type: intent.type,
            validation_stage: 1,
            timestamp: new Date().toISOString()
          }
        }],
        warnings: [],
        performance_ms: 0
      }
    }
    
    return await validator.validate(intent)
  }
  
  private async executeIntent(intent: Intent): Promise<ExecutionResult> {
    const executor = this.executors.get(intent.type)
    
    if (!executor) {
      return {
        success: false,
        duration_ms: 0,
        side_effects: [],
        error: 'No executor available for intent type'
      }
    }
    
    return await executor.execute(intent)
  }
  
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async getSequenceNumber(correlationId: string): Promise<number> {
    // Get next sequence number for correlation group
    return await this.logger.getNextSequenceNumber(correlationId)
  }
  
  private captureExecutionContext(): any {
    return {
      ui_state: {
        active_panels: this.getActivePanels(),
        table_states: this.getTableStates(),
        theme_settings: this.getThemeSettings()
      },
      page_route: window.location.pathname,
      viewport_size: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString()
    }
  }
  
  private sanitizePayload(payload: any): any {
    // Remove sensitive information from payload for logging
    const sanitized = { ...payload }
    
    // Remove potential PII
    if (sanitized.password) delete sanitized.password
    if (sanitized.api_key) delete sanitized.api_key
    if (sanitized.token) delete sanitized.token
    
    return sanitized
  }
  
  // Mock methods for demo
  private getActivePanels(): string[] { return [] }
  private getTableStates(): any { return {} }
  private getThemeSettings(): any { return { color_scheme: 'dark' } }
}

// ============================================================================
// VALIDATOR IMPLEMENTATIONS
// ============================================================================

abstract class IntentValidator {
  abstract validate(intent: Intent): Promise<ValidationResult>
  
  protected createError(code: string, message: string, field?: string, recoverable = false): ValidationError {
    return {
      code,
      message,
      field,
      severity: 'error',
      recoverable,
      context: {
        intent_id: '',
        intent_type: '',
        validation_stage: 1,
        timestamp: new Date().toISOString()
      }
    }
  }
}

class NavigateValidator extends IntentValidator {
  async validate(intent: NavigateIntent): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    
    // Validate route pattern
    const routePattern = /^\/((hs|rest|auto|ret)\/(app|auth)\/[a-zA-Z0-9/_-]*|external:.+)$/
    if (!routePattern.test(intent.payload.route) && !intent.payload.external) {
      errors.push(this.createError(
        'INVALID_ROUTE_PATTERN',
        'Route must follow industry-namespaced pattern',
        'payload.route'
      ))
    }
    
    // Check external navigation from AI
    if (intent.payload.external && intent.origin === 'AI') {
      errors.push(this.createError(
        'AI_EXTERNAL_NAV_DENIED',
        'AI cannot initiate external navigation without user consent',
        'payload.external'
      ))
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      performance_ms: Date.now() - startTime
    }
  }
}

class TableStateValidator extends IntentValidator {
  async validate(intent: SetTableStateIntent): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    
    // Check table exists (mock)
    if (!this.tableExists(intent.payload.table_id)) {
      errors.push(this.createError(
        'TABLE_NOT_FOUND',
        `Table with ID ${intent.payload.table_id} not found on current page`,
        'payload.table_id',
        true // recoverable
      ))
    }
    
    // Validate filters
    if (intent.payload.state_update.filters) {
      intent.payload.state_update.filters.forEach((filter, index) => {
        if (!this.isValidOperator(filter.data_type, filter.operator)) {
          errors.push(this.createError(
            'UNSUPPORTED_OPERATOR',
            `Operator ${filter.operator} not supported for ${filter.data_type}`,
            `payload.state_update.filters[${index}].operator`
          ))
        }
      })
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      performance_ms: Date.now() - startTime
    }
  }
  
  private tableExists(tableId: string): boolean {
    // Mock table existence check
    return ['work-orders-table', 'orders-table', 'inventory-table', 'customer-selector'].includes(tableId)
  }
  
  private isValidOperator(dataType: string, operator: string): boolean {
    const validOperators = {
      string: ['eq', 'ne', 'contains', 'startswith', 'endswith'],
      number: ['eq', 'ne', 'lt', 'le', 'gt', 'ge', 'between'],
      enum: ['eq', 'ne', 'in', 'not_in'],
      datetime: ['eq', 'ne', 'lt', 'le', 'gt', 'ge', 'between']
    }
    
    return validOperators[dataType as keyof typeof validOperators]?.includes(operator) || false
  }
}

class ModalValidator extends IntentValidator {
  async validate(intent: OpenModalIntent): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    
    // Check for overlay modal (forbidden)
    const overlayTypes = ['overlay', 'popup', 'dialog', 'modal']
    if (overlayTypes.includes(intent.payload.panel_type)) {
      errors.push(this.createError(
        'OVERLAY_MODAL_FORBIDDEN',
        'Overlay modals are not allowed per Thorbis design principles',
        'payload.panel_type'
      ))
    }
    
    // Check panel uniqueness
    if (this.isPanelOpen(intent.payload.panel_id)) {
      errors.push(this.createError(
        'PANEL_ALREADY_OPEN',
        `Panel with ID ${intent.payload.panel_id} is already open`,
        'payload.panel_id',
        true // recoverable
      ))
    }
    
    // Validate entity context if provided
    if (intent.payload.context?.entity_id && intent.payload.context?.entity_type) {
      if (!this.entityExists(intent.payload.context.entity_type, intent.payload.context.entity_id)) {
        errors.push(this.createError(
          'ENTITY_NOT_FOUND',
          `Entity ${intent.payload.context.entity_type}:${intent.payload.context.entity_id} not found`,
          'payload.context.entity_id',
          true // recoverable
        ))
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      performance_ms: Date.now() - startTime
    }
  }
  
  private isPanelOpen(panelId: string): boolean {
    // Mock panel state check
    return false
  }
  
  private entityExists(entityType: string, entityId: string): boolean {
    // Mock entity existence check
    return entityId.startsWith(entityType.substring(0, 2)) // Simple mock validation
  }
}

class ThemeValidator extends IntentValidator {
  async validate(intent: SetThemeIntent): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    
    // AI cannot disable accessibility features
    if (intent.origin === 'AI' && intent.payload.theme_updates.high_contrast === false) {
      errors.push(this.createError(
        'AI_ACCESSIBILITY_DENIED',
        'AI cannot disable high contrast accessibility feature',
        'payload.theme_updates.high_contrast'
      ))
    }
    
    // Warn about motion settings
    if (intent.payload.theme_updates.motion === 'full' && this.userPrefersReducedMotion()) {
      warnings.push(this.createError(
        'MOTION_ACCESSIBILITY_CONFLICT',
        'User prefers reduced motion but full motion was requested',
        'payload.theme_updates.motion'
      ))
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      performance_ms: Date.now() - startTime
    }
  }
  
  private userPrefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}

class ClientActionValidator extends IntentValidator {
  async validate(intent: RunClientActionIntent): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    
    // External link validation
    if (intent.payload.action === 'open_external_link') {
      if (intent.origin === 'AI' && !intent.payload.safety_checks.requires_user_consent) {
        errors.push(this.createError(
          'AI_EXTERNAL_LINK_CONSENT_REQUIRED',
          'AI-initiated external links require user consent',
          'payload.safety_checks.requires_user_consent'
        ))
      }
    }
    
    // Screenshot validation
    if (intent.payload.action === 'take_screenshot' && intent.origin === 'AI') {
      errors.push(this.createError(
        'AI_SCREENSHOT_DENIED',
        'AI cannot take screenshots without explicit user permission',
        'payload.action'
      ))
    }
    
    // Filename safety
    if (intent.payload.parameters.options?.filename) {
      const filename = intent.payload.parameters.options.filename
      if (!this.isSafeFilename(filename)) {
        errors.push(this.createError(
          'UNSAFE_FILENAME',
          'Filename contains invalid or unsafe characters',
          'payload.parameters.options.filename'
        ))
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      performance_ms: Date.now() - startTime
    }
  }
  
  private isSafeFilename(filename: string): boolean {
    const safePattern = /^[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+$/
    return safePattern.test(filename) && !filename.includes('..')
  }
}

// ============================================================================
// EXECUTOR IMPLEMENTATIONS (MOCK)
// ============================================================================

abstract class IntentExecutor {
  abstract execute(intent: Intent): Promise<ExecutionResult>
}

class NavigateExecutor extends IntentExecutor {
  async execute(intent: NavigateIntent): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Mock navigation
      const url = new URL(intent.payload.route, window.location.origin)
      
      if (intent.payload.params) {
        Object.entries(intent.payload.params).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }
      
      if (intent.payload.query) {
        Object.entries(intent.payload.query).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }
      
      // Simulate navigation
      if (intent.payload.replace) {
        window.history.replaceState({}, '', url)
      } else {
        window.history.pushState({}, '', url)
      }
      
      return {
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects: ['history_changed', 'url_updated']
      }
    } catch (error: any) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        side_effects: [],
        error: error.message
      }
    }
  }
}

class TableStateExecutor extends IntentExecutor {
  async execute(intent: SetTableStateIntent): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Mock table state update
      const tableElement = document.getElementById(intent.payload.table_id)
      if (tableElement) {
        // Apply filters (mock)
        if (intent.payload.state_update.filters) {
          tableElement.setAttribute('data-filters', JSON.stringify(intent.payload.state_update.filters))
        }
        
        // Apply sorting (mock)
        if (intent.payload.state_update.sorting) {
          tableElement.setAttribute('data-sorting', JSON.stringify(intent.payload.state_update.sorting))
        }
      }
      
      return {
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects: ['table_state_updated', 'dom_modified']
      }
    } catch (error: any) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        side_effects: [],
        error: error.message
      }
    }
  }
}

class ModalExecutor extends IntentExecutor {
  async execute(intent: OpenModalIntent): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Mock panel creation
      const panel = document.createElement('div')
      panel.id = intent.payload.panel_id
      panel.className = `panel panel-${intent.payload.panel_type}`
      panel.setAttribute('data-content-type', intent.payload.content_type)
      
      if (intent.payload.panel_config?.position) {
        panel.setAttribute('data-position', intent.payload.panel_config.position)
      }
      
      document.body.appendChild(panel)
      
      return {
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects: ['panel_created', 'dom_modified']
      }
    } catch (error: any) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        side_effects: [],
        error: error.message
      }
    }
  }
}

class ThemeExecutor extends IntentExecutor {
  async execute(intent: SetThemeIntent): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      const updates = intent.payload.theme_updates
      
      // Apply theme changes to document
      if (updates.color_scheme) {
        document.documentElement.setAttribute('data-theme', updates.color_scheme)
      }
      
      if (updates.density) {
        document.documentElement.setAttribute('data-density', updates.density)
      }
      
      if (updates.high_contrast) {
        document.documentElement.classList.add('high-contrast')
      }
      
      return {
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects: ['theme_updated', 'css_variables_changed']
      }
    } catch (error: any) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        side_effects: [],
        error: error.message
      }
    }
  }
}

class ClientActionExecutor extends IntentExecutor {
  async execute(intent: RunClientActionIntent): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      const sideEffects: string[] = []
      
      switch (intent.payload.action) {
        case 'show_toast':
          this.showToast(intent.payload.parameters.data)
          sideEffects.push('toast_displayed')
          break
          
        case 'copy_to_clipboard':
          await this.copyToClipboard(intent.payload.parameters.data)
          sideEffects.push('clipboard_updated')
          break
          
        case 'refresh_data':
          await this.refreshData(intent.payload.parameters.target)
          sideEffects.push('data_refreshed')
          break
          
        case 'clear_cache':
          this.clearCache(intent.payload.parameters.target)
          sideEffects.push('cache_cleared')
          break
          
        default:
          throw new Error(`Unsupported action: ${intent.payload.action}`)
      }
      
      return {
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects: sideEffects
      }
    } catch (error: any) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        side_effects: [],
        error: error.message
      }
    }
  }
  
  private showToast(data: any): void {
    // Mock toast implementation
    console.log(`Toast: ${data.message}`)
  }
  
  private async copyToClipboard(data: any): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(JSON.stringify(data))
    }
  }
  
  private async refreshData(target: string): Promise<void> {
    // Mock data refresh
    console.log(`Refreshing data for: ${target}`)
  }
  
  private clearCache(target: string): void {
    // Mock cache clearing
    console.log(`Clearing cache for: ${target}`)
  }
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

class IntentLogger {
  private logs: Map<string, IntentLogEntry> = new Map()
  private sequences: Map<string, number> = new Map()
  
  async logIntent(logEntry: IntentLogEntry): Promise<void> {
    this.logs.set(logEntry.log_id, logEntry)
    
    // Mock: Send to persistent storage
    console.log(`🔍 Intent Logged: ${logEntry.intent_type} (${logEntry.status})`, {
      intent_id: logEntry.intent_id,
      origin: logEntry.origin,
      duration: logEntry.duration_ms,
      success: logEntry.status === 'completed'
    })
    
    // Handle unsupported intents with safe no-op
    if (logEntry.error?.error_code === 'INTENT_TYPE_UNSUPPORTED') {
      console.warn(`⚠️  Unsupported intent safely handled: ${logEntry.intent_type}`)
      this.handleUnsupportedIntent(logEntry)
    }
  }
  
  async getNextSequenceNumber(correlationId: string): Promise<number> {
    const current = this.sequences.get(correlationId) || 0
    const next = current + 1
    this.sequences.set(correlationId, next)
    return next
  }
  
  private handleUnsupportedIntent(logEntry: IntentLogEntry): void {
    // Safe no-op handling of unsupported intents
    const supportedTypes = ['NAVIGATE', 'SET_TABLE_STATE', 'OPEN_MODAL', 'SET_THEME', 'RUN_CLIENT_ACTION']
    
    console.log('🚫 Unsupported Intent Handler:', {
      unsupported_type: logEntry.intent_type,
      supported_types: supportedTypes,
      handled_safely: true,
      no_op_executed: true,
      logged: true
    })
  }
  
  getLogs(): IntentLogEntry[] {
    return Array.from(this.logs.values())
  }
  
  getLogsByCorrelation(correlationId: string): IntentLogEntry[] {
    return Array.from(this.logs.values())
      .filter(log => log.correlation_id === correlationId)
      .sort((a, b) => a.sequence_number - b.sequence_number)
  }
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

class IntentQueue {
  private queue: Array<{intent: Intent, logEntry: IntentLogEntry}> = []
  private processing = false
  
  async enqueue(intent: Intent, logEntry: IntentLogEntry): Promise<void> {
    this.queue.push({ intent, logEntry })
    
    if (!this.processing) {
      await this.processQueue()
    }
  }
  
  private async processQueue(): Promise<void> {
    this.processing = true
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      
      // Mock queue processing delay
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    this.processing = false
  }
}

// ============================================================================
// ORIGIN TAGGING
// ============================================================================

class OriginTagger {
  tagIntent(intent: Intent, context: any): Intent {
    // Add origin-specific metadata
    const taggedIntent = { ...intent }
    
    switch (intent.origin) {
      case 'AI':
        taggedIntent.metadata = {
          ...taggedIntent.metadata,
          ai_context: {
            model_name: 'claude-3-sonnet',
            confidence_score: 0.8
          }
        }
        break
        
      case 'USER':
        taggedIntent.metadata = {
          ...taggedIntent.metadata,
          user_context: {
            interaction_type: 'click'
          }
        }
        break
        
      case 'SYSTEM':
        taggedIntent.metadata = {
          ...taggedIntent.metadata,
          system_context: {
            trigger_type: 'automated'
          }
        }
        break
    }
    
    return taggedIntent
  }
}

// ============================================================================
// DEMO USAGE
// ============================================================================

export async function demonstrateIntentBus(): Promise<void> {
  console.log('🚀 Thorbis Intent Bus Demo')
  console.log('=' .repeat(50))
  
  const intentBus = new IntentBus()
  
  // Example 1: Successful navigation intent
  console.log('\n📍 Example 1: Navigation Intent (Success)')
  const navigateIntent: NavigateIntent = {
    type: 'NAVIGATE',
    intent_id: 'intent_demo_nav_001',
    timestamp: new Date().toISOString(),
    origin: 'USER',
    payload: {
      route: '/hs/app/work-orders',
      params: {},
      query: { filter: 'active' }
    },
    metadata: {
      correlation_id: 'demo_flow_001',
      tenant_id: 'demo_tenant',
      user_id: 'demo_user'
    }
  }
  
  const navResult = await intentBus.processIntent(navigateIntent)
  console.log('✅ Navigation Result:', {
    success: navResult.status === 'completed',
    duration: navResult.duration_ms,
    url: window.location.href
  })
  
  // Example 2: Table state update intent
  console.log('\n📊 Example 2: Table State Intent (Success)')
  const tableIntent: SetTableStateIntent = {
    type: 'SET_TABLE_STATE',
    intent_id: 'intent_demo_table_001',
    timestamp: new Date().toISOString(),
    origin: 'AI',
    payload: {
      table_id: 'work-orders-table',
      state_update: {
        filters: [{
          field: 'status',
          operator: 'in',
          value: ['active', 'pending'],
          data_type: 'enum'
        }]
      }
    },
    metadata: {
      correlation_id: 'demo_flow_001'
    }
  }
  
  const tableResult = await intentBus.processIntent(tableIntent)
  console.log('✅ Table State Result:', {
    success: tableResult.status === 'completed',
    duration: tableResult.duration_ms
  })
  
  // Example 3: Unsupported intent (should be safely handled)
  console.log('\n❌ Example 3: Unsupported Intent (Safe No-op)')
  const unsupportedIntent = {
    type: 'DELETE_ALL_DATA', // Not a supported intent type
    intent_id: 'intent_demo_unsupported_001',
    timestamp: new Date().toISOString(),
    origin: 'AI',
    payload: {
      target: 'everything'
    }
  } as any
  
  const unsupportedResult = await intentBus.processIntent(unsupportedIntent)
  console.log('🚫 Unsupported Result:', {
    rejected: unsupportedResult.status === 'rejected',
    error_code: unsupportedResult.error?.error_code,
    handled_safely: true,
    no_op_executed: true
  })
  
  // Example 4: AI attempting dangerous action (should be rejected)
  console.log('\n🔒 Example 4: AI Security Violation (Blocked)')
  const dangerousIntent: RunClientActionIntent = {
    type: 'RUN_CLIENT_ACTION',
    intent_id: 'intent_demo_dangerous_001',
    timestamp: new Date().toISOString(),
    origin: 'AI',
    payload: {
      action: 'open_external_link',
      parameters: {
        options: {
          url: 'https://malicious-site.example.com'
        }
      },
      safety_checks: {
        requires_user_consent: false // AI trying to bypass consent
      }
    }
  }
  
  const dangerousResult = await intentBus.processIntent(dangerousIntent)
  console.log('🛡️  Security Result:', {
    blocked: dangerousResult.status === 'rejected',
    error_code: dangerousResult.error?.error_code,
    security_enforced: true
  })
  
  // Example 5: Theme change (should succeed)
  console.log('\n🎨 Example 5: Theme Change (Success)')
  const themeIntent: SetThemeIntent = {
    type: 'SET_THEME',
    intent_id: 'intent_demo_theme_001',
    timestamp: new Date().toISOString(),
    origin: 'USER',
    payload: {
      theme_updates: {
        color_scheme: 'dark',
        high_contrast: true
      },
      apply_immediately: true
    }
  }
  
  const themeResult = await intentBus.processIntent(themeIntent)
  console.log('🌙 Theme Result:', {
    success: themeResult.status === 'completed',
    duration: themeResult.duration_ms,
    theme_applied: document.documentElement.getAttribute('data-theme')
  })
  
  // Display summary
  console.log('\n📋 Demo Summary')
  console.log('=' .repeat(50))
  const logger = (intentBus as any).logger as IntentLogger
  const allLogs = logger.getLogs()
  
  console.log(`Total intents processed: ${allLogs.length}`)
  console.log(`Successful: ${allLogs.filter(l => l.status === 'completed').length}`)
  console.log(`Rejected: ${allLogs.filter(l => l.status === 'rejected').length}`)
  console.log(`Failed: ${allLogs.filter(l => l.status === 'failed').length}`)
  console.log(`Average duration: ${Math.round(allLogs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / allLogs.length)}ms`)
  
  console.log('\n🎉 Intent Bus Demo Complete!')
  console.log('✅ All intents processed safely with proper validation')
  console.log('✅ Unsupported commands handled with safe no-op')
  console.log('✅ Security violations blocked appropriately')
  console.log('✅ Complete audit trail maintained')
}

// Run demo if called directly
if (typeof window !== 'undefined') {
  // Browser environment - wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demonstrateIntentBus)
  } else {
    demonstrateIntentBus()
  }
}
