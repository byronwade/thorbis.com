/**
 * Thorbis Business OS - UI Intent Bus Implementation
 * 
 * Core intent processing system that validates and executes UI commands
 * from AI tools with proper error handling and state management.
 */

import { v4 as uuidv4 } from 'uuid'
import {
  Intent,
  IntentType,
  IntentResult,
  IntentContext,
  IntentQueue,
  IntentHandler,
  IntentValidator,
  ValidationResult,
  IntentMiddleware,
  ClientAction
} from './types'

export class UIIntentBus {
  private queue: IntentQueue
  private handlers: Map<IntentType, IntentHandler> = new Map()
  private validators: Map<IntentType, IntentValidator> = new Map()
  private middleware: IntentMiddleware[] = []
  private clientActions: Map<string, ClientAction> = new Map()
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.queue = {
      pending: [],
      executing: [],
      completed: [],
      failed: [],
      max_queue_size: 1000,
      max_execution_time_ms: 30000 // 30 seconds
    }

    this.initializeDefaultHandlers()
    this.initializeDefaultValidators()
    this.startProcessing()
  }

  /**
   * Queue an intent for execution
   */
  async queueIntent(
    intent: Omit<Intent, 'id' | 'timestamp'>,
    context: IntentContext
  ): Promise<{ intent_id: string; queued: boolean; validation_result?: ValidationResult }> {
    // Check queue size limit
    if (this.queue.pending.length >= this.queue.max_queue_size) {
      throw new Error('Intent queue is full')
    }

    // Add metadata
    const fullIntent = {
      ...intent,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    } as Intent

    // Validate intent
    const validator = this.validators.get(intent.type)
    let validationResult: ValidationResult = { valid: true }

    if (validator) {
      validationResult = await validator.validate(intent.payload, context)
      if (!validationResult.valid) {
        return {
          intent_id: fullIntent.id,
          queued: false,
          validation_result: validationResult
        }
      }

      // Use sanitized payload if provided
      if (validationResult.sanitized_payload) {
        fullIntent.payload = validationResult.sanitized_payload
      }
    }

    // Check for expired intents
    if (fullIntent.expires_at && new Date(fullIntent.expires_at) < new Date()) {
      return {
        intent_id: fullIntent.id,
        queued: false,
        validation_result: {
          valid: false,
          errors: ['Intent has expired']
        }
      }
    }

    // Queue the intent based on priority
    this.insertIntentByPriority(fullIntent)

    return {
      intent_id: fullIntent.id,
      queued: true,
      validation_result: validationResult
    }
  }

  /**
   * Execute multiple intents in batch
   */
  async executeBatch(
    intents: Array<Omit<Intent, 'id' | 'timestamp'>>,
    context: IntentContext
  ): Promise<IntentResult[]> {
    const results: IntentResult[] = []

    for (const intent of intents) {
      try {
        const { intent_id, queued, validation_result } = await this.queueIntent(intent, context)
        
        if (!queued) {
          results.push({
            success: false,
            intent_id,
            executed_at: new Date().toISOString(),
            error: {
              code: 'VALIDATION_ERROR',
              message: validation_result?.errors?.join(', ') || 'Intent validation failed'
            }
          })
          continue
        }

        // For batch execution, we wait for each intent to complete
        const result = await this.waitForCompletion(intent_id, 10000) // 10 second timeout
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          intent_id: uuidv4(),
          executed_at: new Date().toISOString(),
          error: {
            code: 'EXECUTION_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    return results
  }

  /**
   * Register an intent handler
   */
  registerHandler(handler: IntentHandler): void {
    this.handlers.set(handler.type, handler)
  }

  /**
   * Register an intent validator
   */
  registerValidator(validator: IntentValidator): void {
    this.validators.set(validator.type, validator)
  }

  /**
   * Register middleware
   */
  registerMiddleware(middleware: IntentMiddleware): void {
    this.middleware.push(middleware)
  }

  /**
   * Register client action
   */
  registerClientAction(action: ClientAction): void {
    this.clientActions.set(action.id, action)
  }

  /**
   * Get intent execution status
   */
  getStatus(intentId: string): { status: 'pending' | 'executing' | 'completed' | 'failed'; result?: IntentResult } {
    // Check pending
    if (this.queue.pending.some(i => i.id === intentId)) {
      return { status: 'pending' }
    }

    // Check executing
    if (this.queue.executing.some(i => i.id === intentId)) {
      return { status: 'executing' }
    }

    // Check completed
    const completed = this.queue.completed.find(r => r.intent_id === intentId)
    if (completed) {
      return { status: 'completed', result: completed }
    }

    // Check failed
    const failed = this.queue.failed.find(r => r.intent_id === intentId)
    if (failed) {
      return { status: 'failed', result: failed }
    }

    throw new Error('Intent ${intentId} not found')
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    pending_count: number
    executing_count: number
    completed_count: number
    failed_count: number
    success_rate: number
  } {
    const total = this.queue.completed.length + this.queue.failed.length
    const success_rate = total > 0 ? (this.queue.completed.length / total) * 100 : 0

    return {
      pending_count: this.queue.pending.length,
      executing_count: this.queue.executing.length,
      completed_count: this.queue.completed.length,
      failed_count: this.queue.failed.length,
      success_rate
    }
  }

  /**
   * Clear completed and failed intents from queue
   */
  clearHistory(): void {
    this.queue.completed = []
    this.queue.failed = []
  }

  /**
   * Cancel a pending intent
   */
  cancelIntent(intentId: string): boolean {
    const index = this.queue.pending.findIndex(i => i.id === intentId)
    if (index >= 0) {
      this.queue.pending.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Process queue periodically
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing && this.queue.pending.length > 0) {
        await this.processQueue()
      }
    }, 100) // Process every 100ms
  }

  /**
   * Process pending intents
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      while (this.queue.pending.length > 0 && this.queue.executing.length < 5) { // Max 5 concurrent
        const intent = this.queue.pending.shift()!
        
        // Check if intent has expired
        if (intent.expires_at && new Date(intent.expires_at) < new Date()) {
          this.queue.failed.push({
            success: false,
            intent_id: intent.id,
            executed_at: new Date().toISOString(),
            error: {
              code: 'EXPIRED',
              message: 'Intent expired before execution'
            }
          })
          continue
        }

        this.queue.executing.push(intent)
        this.executeIntent(intent)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Execute a single intent
   */
  private async executeIntent(intent: Intent): Promise<void> {
    const startTime = Date.now()

    try {
      // Create context (this would come from the request in a real app)
      const context: IntentContext = {
        business_id: intent.business_id || ',
        user_id: ', // Would be from auth
        session_id: intent.session_id,
        permissions: [], // Would be from user roles
        current_route: ', // Would be from router
        ui_state: Record<string, unknown> // Would be from state management
      }

      // Apply before middleware
      let processedIntent = intent
      for (const middleware of this.middleware) {
        if (middleware.before) {
          const result = await middleware.before(processedIntent, context)
          if (!result.proceed) {
            throw new Error('Intent blocked by middleware')
          }
          if (result.modified_intent) {
            processedIntent = result.modified_intent
          }
        }
      }

      // Get handler
      const handler = this.handlers.get(intent.type)
      if (!handler) {
        throw new Error('No handler registered for intent type: ${intent.type}')
      }

      // Execute intent
      const result = await Promise.race([
        handler.execute(processedIntent, context),
        this.createTimeoutPromise(handler.max_execution_time_ms || this.queue.max_execution_time_ms)
      ])

      // Apply after middleware
      let processedResult = result
      for (const middleware of this.middleware) {
        if (middleware.after) {
          processedResult = await middleware.after(processedResult, context)
        }
      }

      processedResult.duration_ms = Date.now() - startTime

      // Move to completed
      this.queue.completed.push(processedResult)
    } catch (error) {
      // Move to failed
      this.queue.failed.push({
        success: false,
        intent_id: intent.id,
        executed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        error: {
          code: error instanceof Error ? error.constructor.name : 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      })
    } finally {
      // Remove from executing
      const index = this.queue.executing.findIndex(i => i.id === intent.id)
      if (index >= 0) {
        this.queue.executing.splice(index, 1)
      }
    }
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(timeoutMs: number): Promise<IntentResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Intent execution timed out after ${timeoutMs}ms'))
      }, timeoutMs)
    })
  }

  /**
   * Wait for intent completion
   */
  private async waitForCompletion(intentId: string, timeoutMs: number): Promise<IntentResult> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        try {
          const status = this.getStatus(intentId)
          
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(checkInterval)
            resolve(status.result!)
            return
          }

          if (Date.now() - startTime > timeoutMs) {
            clearInterval(checkInterval)
            reject(new Error('Timeout waiting for intent completion'))
            return
          }
        } catch (_error) {
          clearInterval(checkInterval)
          reject(error)
        }
      }, 100)
    })
  }

  /**
   * Insert intent into queue based on priority
   */
  private insertIntentByPriority(intent: Intent): void {
    const priorityOrder = ['urgent', 'high', 'medium', 'low']
    const intentPriority = priorityOrder.indexOf(intent.priority)

    let insertIndex = this.queue.pending.length
    for (let i = 0; i < this.queue.pending.length; i++) {
      const queuedPriority = priorityOrder.indexOf(this.queue.pending[i].priority)
      if (intentPriority < queuedPriority) {
        insertIndex = i
        break
      }
    }

    this.queue.pending.splice(insertIndex, 0, intent)
  }

  /**
   * Initialize default intent handlers
   */
  private initializeDefaultHandlers(): void {
    // Navigation handler
    this.registerHandler({
      type: 'NAVIGATE',
      execute: async (intent, context) => {
        const payload = intent.payload as any
        
        // In a real implementation, this would use Next.js router
        // For now, we'll simulate the navigation'
        console.log('Navigating to: ${payload.path}', payload)

        return {
          success: true,
          intent_id: intent.id,
          executed_at: new Date().toISOString(),
          state_changes: {
            current_route: payload.path,
            query_params: payload.query
          }
        }
      }
    })

    // Toast handler
    this.registerHandler({
      type: 'SHOW_TOAST',
      execute: async (intent, context) => {
        const payload = intent.payload as any
        
        // In a real implementation, this would trigger the toast system
        console.log('Showing toast: ${payload.message}', payload)

        return {
          success: true,
          intent_id: intent.id,
          executed_at: new Date().toISOString()
        }
      }
    })

    // Set loading handler
    this.registerHandler({
      type: 'SET_LOADING',
      execute: async (intent, context) => {
        const payload = intent.payload as any
        
        // In a real implementation, this would update loading state
        console.log('Setting loading state:', payload)

        return {
          success: true,
          intent_id: intent.id,
          executed_at: new Date().toISOString(),
          state_changes: {
            loading_state: payload
          }
        }
      }
    })

    // Client action handler
    this.registerHandler({
      type: 'RUN_CLIENT_ACTION',
      execute: async (intent, context) => {
        const payload = intent.payload as any
        const action = this.clientActions.get(payload.action_id)
        
        if (!action) {
          throw new Error('Client action ${payload.action_id} not found')
        }

        // Check permissions
        const hasPermission = action.permissions.every(perm => 
          context.permissions.includes(perm)
        )
        
        if (!hasPermission) {
          throw new Error('Insufficient permissions for client action')
        }

        // Execute action
        const result = await action.handler(payload.args || {}, context)

        return {
          success: true,
          intent_id: intent.id,
          executed_at: new Date().toISOString(),
          state_changes: {
            action_result: result
          }
        }
      }
    })
  }

  /**
   * Initialize default validators
   */
  private initializeDefaultValidators(): void {
    // Navigation validator
    this.registerValidator({
      type: 'NAVIGATE',
      validate: async (payload: unknown) => {
        const errors: string[] = []

        if (!payload.path || typeof payload.path !== 'string') {
          errors.push('Path is required and must be a string')
        }

        if (payload.query && typeof payload.query !== 'object') {
          errors.push('Query must be an object')
        }

        return {
          valid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined
        }
      }
    })

    // Toast validator
    this.registerValidator({
      type: 'SHOW_TOAST',
      validate: async (payload: unknown) => {
        const errors: string[] = []

        if (!payload.message || typeof payload.message !== 'string') {
          errors.push('Message is required and must be a string')
        }

        if (payload.type && !['info', 'success', 'warning', 'error'].includes(payload.type)) {
          errors.push('Type must be one of: info, success, warning, error')
        }

        return {
          valid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined,
          sanitized_payload: {
            ...payload,
            type: payload.type || 'info',
            duration: payload.duration || 5000,
            dismissible: payload.dismissible !== false
          }
        }
      }
    })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }
}

// Singleton instance
let uiIntentBus: UIIntentBus | null = null

export function getUIIntentBus(): UIIntentBus {
  if (!uiIntentBus) {
    uiIntentBus = new UIIntentBus()
  }
  return uiIntentBus
}
