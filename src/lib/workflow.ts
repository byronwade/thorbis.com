/**
 * Advanced Workflow Automation System
 * 
 * Provides comprehensive workflow automation with triggers, conditions, actions,
 * and AI-powered decision making across all business processes
 */

import { executeQuery, executeTransaction } from './database'
import { cache } from './cache'
import { createAuditLog } from './auth'
import crypto from 'crypto'

// Workflow configuration
interface WorkflowConfig {
  enableAI: boolean
  maxExecutionTime: number // seconds
  retryAttempts: number
  enableLogging: boolean
  enableMetrics: boolean
}

const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  enableAI: true,
  maxExecutionTime: 300, // 5 minutes
  retryAttempts: 3,
  enableLogging: true,
  enableMetrics: true
}

// Trigger types
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULE = 'schedule',
  EVENT = 'event',
  API_CALL = 'api_call',
  DATA_CHANGE = 'data_change',
  CONDITION_MET = 'condition_met',
  WEBHOOK = 'webhook',
  EMAIL = 'email'
}

// Action types
export enum ActionType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  CREATE_RECORD = 'create_record',
  UPDATE_RECORD = 'update_record',
  DELETE_RECORD = 'delete_record',
  API_REQUEST = 'api_request',
  WEBHOOK_CALL = 'webhook_call',
  GENERATE_DOCUMENT = 'generate_document',
  SEND_NOTIFICATION = 'send_notification',
  AI_DECISION = 'ai_decision',
  CONDITIONAL_BRANCH = 'conditional_branch',
  DELAY = 'delay',
  APPROVAL_REQUIRED = 'approval_required'
}

// Condition operators
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  IN_ARRAY = 'in_array',
  NOT_IN_ARRAY = 'not_in_array',
  DATE_BEFORE = 'date_before',
  DATE_AFTER = 'date_after',
  REGEX_MATCH = 'regex_match'
}

// Workflow status
export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  DRAFT = 'draft',
  ERROR = 'error'
}

// Execution status
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  WAITING_APPROVAL = 'waiting_approval'
}

// Core workflow interfaces
export interface WorkflowTrigger {
  id: string
  type: TriggerType
  config: {
    event?: string
    schedule?: string // Cron expression
    conditions?: WorkflowCondition[]
    dataSource?: string
    filters?: Record<string, unknown>
  }
}

export interface WorkflowCondition {
  field: string
  operator: ConditionOperator
  value: any
  values?: unknown[]
  logicalOperator?: 'AND' | 'OR'
}

export interface WorkflowAction {
  id: string
  type: ActionType
  name: string
  config: {
    // Email action config
    to?: string[]
    cc?: string[]
    bcc?: string[]
    subject?: string
    body?: string
    template?: string
    attachments?: string[]
    
    // SMS action config
    phoneNumbers?: string[]
    message?: string
    
    // Database action config
    table?: string
    schema?: string
    data?: Record<string, unknown>
    conditions?: WorkflowCondition[]
    
    // API action config
    url?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    payload?: Record<string, unknown>
    
    // Document generation config
    templateId?: string
    outputFormat?: 'pdf' | 'docx' | 'html'
    
    // AI decision config
    prompt?: string
    model?: string
    threshold?: number
    
    // Conditional branch config
    branches?: Array<{
      condition: WorkflowCondition[]
      actions: WorkflowAction[]
    }>
    
    // Delay config
    duration?: number // seconds
    unit?: 'seconds' | 'minutes' | 'hours' | 'days'
    
    // Approval config
    approvers?: string[]
    message?: string
    dueDate?: string
  }
  onSuccess?: WorkflowAction[]
  onFailure?: WorkflowAction[]
}

export interface Workflow {
  id: string
  businessId: string
  name: string
  description?: string
  industry?: string
  category?: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  conditions?: WorkflowCondition[]
  actions: WorkflowAction[]
  settings: {
    enableLogging: boolean
    enableMetrics: boolean
    maxConcurrentExecutions: number
    timeoutMinutes: number
    retryAttempts: number
    enableAI: boolean
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastExecutedAt?: Date
  executionCount: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  businessId: string
  status: ExecutionStatus
  triggeredBy: string
  triggeredAt: Date
  startedAt?: Date
  completedAt?: Date
  duration?: number
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  logs: WorkflowLog[]
  metrics: {
    actionsCompleted: number
    actionsTotal: number
    currentAction?: string
  }
}

export interface WorkflowLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  action?: string
  message: string
  data?: Record<string, unknown>
}

// Predefined workflow templates
const WORKFLOW_TEMPLATES: Record<string, Partial<Workflow>> = {
  'new-customer-onboarding': {
    name: 'New Customer Onboarding',
    description: 'Automatically onboard new customers with welcome emails and setup tasks',
    category: 'Customer Management',
    trigger: {
      id: 'customer-created',
      type: TriggerType.EVENT,
      config: {
        event: 'customer.created'
      }
    },
    actions: [
      {
        id: 'welcome-email',
        type: ActionType.SEND_EMAIL,
        name: 'Send Welcome Email',
        config: {
          to: ['${customer.email}'],
          subject: 'Welcome to ${business.name}!',
          template: 'customer-welcome'
        }
      },
      {
        id: 'create-setup-tasks',
        type: ActionType.CREATE_RECORD,
        name: 'Create Setup Tasks',
        config: {
          table: 'tasks',
          schema: 'shared',
          data: {
            title: 'Setup customer account',
            assignee: '${account_manager.id}',
            due_date: '${date.add(2, "days")}',
            customer_id: '${customer.id}'
          }
        }
      }
    ]
  },

  'order-completion-followup': {
    name: 'Order Completion Follow-up',
    description: 'Send follow-up communications and request feedback after order completion',
    category: 'Order Management',
    trigger: {
      id: 'order-completed',
      type: TriggerType.EVENT,
      config: {
        event: 'work_order.completed'
      }
    },
    actions: [
      {
        id: 'completion-notification',
        type: ActionType.SEND_EMAIL,
        name: 'Send Completion Notification',
        config: {
          to: ['${customer.email}'],
          subject: 'Your service has been completed',
          template: 'order-completion'
        }
      },
      {
        id: 'delay-feedback',
        type: ActionType.DELAY,
        name: 'Wait 24 Hours',
        config: {
          duration: 24,
          unit: 'hours'
        }
      },
      {
        id: 'feedback-request',
        type: ActionType.SEND_EMAIL,
        name: 'Request Feedback',
        config: {
          to: ['${customer.email}'],
          subject: 'How was your service experience?',
          template: 'feedback-request'
        }
      }
    ]
  },

  'inventory-reorder': {
    name: 'Automatic Inventory Reorder',
    description: 'Automatically reorder products when stock falls below threshold',
    category: 'Inventory Management',
    trigger: {
      id: 'low-stock',
      type: TriggerType.DATA_CHANGE,
      config: {
        dataSource: 'retail.products',
        conditions: [
          {
            field: 'stock_quantity',
            operator: ConditionOperator.LESS_THAN,
            value: '${product.reorder_point}'
          }
        ]
      }
    },
    actions: [
      {
        id: 'check-supplier',
        type: ActionType.AI_DECISION,
        name: 'Check Supplier Availability',
        config: {
          prompt: 'Check if supplier ${product.supplier} is available for reorder of ${product.name}',
          model: 'gpt-4'
        }
      },
      {
        id: 'create-purchase-order',
        type: ActionType.CREATE_RECORD,
        name: 'Create Purchase Order',
        config: {
          table: 'purchase_orders',
          schema: 'retail',
          data: {
            supplier_id: '${product.supplier_id}',
            product_id: '${product.id}',
            quantity: '${product.reorder_quantity}',
            status: 'pending'
          }
        }
      }
    ]
  },

  'payment-reminder': {
    name: 'Payment Reminder Sequence',
    description: 'Send automated payment reminders for overdue invoices',
    category: 'Financial Management',
    trigger: {
      id: 'overdue-invoice',
      type: TriggerType.SCHEDULE,
      config: {
        schedule: '0 9 * * *' // Daily at 9 AM
      }
    },
    conditions: [
      {
        field: 'due_date',
        operator: ConditionOperator.DATE_BEFORE,
        value: '${date.now()}'
      },
      {
        field: 'status',
        operator: ConditionOperator.EQUALS,
        value: 'pending'
      }
    ],
    actions: [
      {
        id: 'first-reminder',
        type: ActionType.SEND_EMAIL,
        name: 'Send First Reminder',
        config: {
          to: ['${invoice.customer_email}'],
          subject: 'Payment Reminder - Invoice ${invoice.number}',
          template: 'payment-reminder-1'
        }
      },
      {
        id: 'wait-week',
        type: ActionType.DELAY,
        name: 'Wait 7 Days',
        config: {
          duration: 7,
          unit: 'days'
        }
      },
      {
        id: 'second-reminder',
        type: ActionType.SEND_EMAIL,
        name: 'Send Second Reminder',
        config: {
          to: ['${invoice.customer_email}'],
          cc: ['${account_manager.email}'],
          subject: 'Final Payment Reminder - Invoice ${invoice.number}',
          template: 'payment-reminder-2'
        }
      }
    ]
  }
}

export class WorkflowEngine {
  private config: WorkflowConfig
  private activeExecutions = new Map<string, WorkflowExecution>()

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = { ...DEFAULT_WORKFLOW_CONFIG, ...config }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(businessId: string, userId: string, workflow: Partial<Workflow>): Promise<Workflow> {
    try {
      const workflowId = crypto.randomUUID()
      const newWorkflow: Workflow = {
        id: workflowId,
        businessId,
        name: workflow.name || 'Untitled Workflow',
        description: workflow.description,
        industry: workflow.industry,
        category: workflow.category,
        status: workflow.status || WorkflowStatus.DRAFT,
        trigger: workflow.trigger || {
          id: 'manual',
          type: TriggerType.MANUAL,
          config: Record<string, unknown>
        },
        conditions: workflow.conditions || [],
        actions: workflow.actions || [],
        settings: workflow.settings || {
          enableLogging: true,
          enableMetrics: true,
          maxConcurrentExecutions: 1,
          timeoutMinutes: 30,
          retryAttempts: 3,
          enableAI: true
        },
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0
      }

      // Store workflow in database
      await this.saveWorkflow(businessId, newWorkflow)

      return newWorkflow

    } catch (error) {
      console.error('Workflow creation error: ', error)
      throw new Error('Failed to create workflow')
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    businessId: string,
    workflowId: string,
    triggeredBy: string,
    input?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    try {
      const workflow = await this.getWorkflow(businessId, workflowId)
      if (!workflow) {
        throw new Error('Workflow not found')
      }

      if (workflow.status !== WorkflowStatus.ACTIVE) {
        throw new Error('Workflow is not active')
      }

      // Create execution record
      const execution: WorkflowExecution = {
        id: crypto.randomUUID(),
        workflowId,
        businessId,
        status: ExecutionStatus.PENDING,
        triggeredBy,
        triggeredAt: new Date(),
        input,
        logs: [],
        metrics: {
          actionsCompleted: 0,
          actionsTotal: workflow.actions.length
        }
      }

      // Add to active executions
      this.activeExecutions.set(execution.id, execution)

      // Start execution
      this.processExecution(execution, workflow).catch(error => {
        console.error('Workflow execution error: ', error)
        execution.status = ExecutionStatus.FAILED
        execution.error = error.message
      })

      return execution

    } catch (error) {
      console.error('Workflow execution start error: ', error)
      throw new Error('Failed to start workflow execution')
    }
  }

  /**
   * Get workflow templates
   */
  getWorkflowTemplates(): Record<string, Partial<Workflow>> {
    return WORKFLOW_TEMPLATES
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    businessId: string,
    userId: string,
    templateId: string,
    customizations?: Partial<Workflow>
  ): Promise<Workflow> {
    const template = WORKFLOW_TEMPLATES[templateId]
    if (!template) {
      throw new Error('Template not found')
    }

    const workflowData = {
      ...template,
      ...customizations,
      status: WorkflowStatus.DRAFT
    }

    return await this.createWorkflow(businessId, userId, workflowData)
  }

  /**
   * Process workflow execution
   */
  private async processExecution(execution: WorkflowExecution, workflow: Workflow): Promise<void> {
    execution.status = ExecutionStatus.RUNNING
    execution.startedAt = new Date()

    this.addLog(execution, 'info', 'Starting workflow execution for: ${workflow.name}')

    try {
      // Check workflow conditions
      if (workflow.conditions && workflow.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(workflow.conditions, execution.input || {})
        if (!conditionsMet) {
          execution.status = ExecutionStatus.COMPLETED
          this.addLog(execution, 'info', 'Workflow conditions not met, execution completed')
          return
        }
      }

      // Execute actions sequentially
      for (const action of workflow.actions) {
        execution.metrics.currentAction = action.name
        await this.executeAction(execution, action)
        execution.metrics.actionsCompleted++
      }

      execution.status = ExecutionStatus.COMPLETED
      execution.completedAt = new Date()
      execution.duration = execution.completedAt.getTime() - (execution.startedAt?.getTime() || 0)

      this.addLog(execution, 'info', 'Workflow execution completed successfully')

    } catch (error: unknown) {
      execution.status = ExecutionStatus.FAILED
      execution.error = error.message
      execution.completedAt = new Date()

      this.addLog(execution, 'error', 'Workflow execution failed: ${error.message}')
      
      // Handle retry logic
      if (workflow.settings.retryAttempts > 0) {
        // Implement retry logic here
      }
    } finally {
      // Remove from active executions
      this.activeExecutions.delete(execution.id)
      
      // Save execution to database
      await this.saveExecution(execution)

      // Update workflow execution count
      await this.updateWorkflowExecutionCount(workflow.businessId, workflow.id)
    }
  }

  /**
   * Execute individual action
   */
  private async executeAction(execution: WorkflowExecution, action: WorkflowAction): Promise<unknown> {
    this.addLog(execution, 'info`, `Executing action: ${action.name}', { actionType: action.type })

    try {
      let result: any

      switch (action.type) {
        case ActionType.SEND_EMAIL:
          result = await this.executeSendEmailAction(action.config, execution.input)
          break

        case ActionType.SEND_SMS:
          result = await this.executeSendSMSAction(action.config, execution.input)
          break

        case ActionType.CREATE_RECORD:
          result = await this.executeCreateRecordAction(execution.businessId, action.config, execution.input)
          break

        case ActionType.UPDATE_RECORD:
          result = await this.executeUpdateRecordAction(execution.businessId, action.config, execution.input)
          break

        case ActionType.API_REQUEST:
          result = await this.executeAPIRequestAction(action.config, execution.input)
          break

        case ActionType.DELAY:
          result = await this.executeDelayAction(action.config)
          break

        case ActionType.AI_DECISION:
          result = await this.executeAIDecisionAction(action.config, execution.input)
          break

        case ActionType.CONDITIONAL_BRANCH:
          result = await this.executeConditionalBranchAction(execution, action.config)
          break

        default:
          throw new Error('Unsupported action type: ${action.type}')
      }

      this.addLog(execution, 'info', 'Action completed: ${action.name}', { result })

      // Execute success actions if defined
      if (action.onSuccess) {
        for (const successAction of action.onSuccess) {
          await this.executeAction(execution, successAction)
        }
      }

      return result

    } catch (error: unknown) {
      this.addLog(execution, 'error', 'Action failed: ${action.name}', { error: error.message })

      // Execute failure actions if defined
      if (action.onFailure) {
        for (const failureAction of action.onFailure) {
          await this.executeAction(execution, failureAction)
        }
      }

      throw error
    }
  }

  /**
   * Execute send email action
   */
  private async executeSendEmailAction(config: unknown, input?: Record<string, unknown>): Promise<unknown> {
    // Mock implementation - would integrate with actual email service
    console.log('Sending email: ', {
      to: config.to,
      subject: this.interpolateTemplate(config.subject, input),
      body: this.interpolateTemplate(config.body, input)
    })
    return { sent: true, messageId: crypto.randomUUID() }
  }

  /**
   * Execute send SMS action
   */
  private async executeSendSMSAction(config: unknown, input?: Record<string, unknown>): Promise<unknown> {
    // Mock implementation - would integrate with SMS service
    console.log('Sending SMS: ', {
      to: config.phoneNumbers,
      message: this.interpolateTemplate(config.message, input)
    })
    return { sent: true, messageId: crypto.randomUUID() }
  }

  /**
   * Execute create record action
   */
  private async executeCreateRecordAction(
    businessId: string, config: unknown,
    input?: Record<string, unknown>
  ): Promise<unknown> {
    const data = this.interpolateObject(config.data, input)
    
    // Build INSERT query
    const fields = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => '$${i + 2}').join(', ')

    const query = '
      INSERT INTO ${config.schema}.${config.table} 
      (business_id, ${fields.join(', `)}) 
      VALUES ($1, ${placeholders}) 
      RETURNING *
    '

    const result = await executeQuery(businessId, query, [businessId, ...values])
    return result[0]
  }

  /**
   * Execute update record action
   */
  private async executeUpdateRecordAction(
    businessId: string, config: unknown,
    input?: Record<string, unknown>
  ): Promise<unknown> {
    const data = this.interpolateObject(config.data, input)
    
    // Build UPDATE query
    const fields = Object.keys(data)
    const values = Object.values(data)
    const setClause = fields.map((field, i) => '${field} = $${i + 2}').join(', ')

    let query = `UPDATE ${config.schema}.${config.table} SET ${setClause} WHERE business_id = $1'
    const params = [businessId, ...values]

    // Add conditions
    if (config.conditions) {
      const { whereClause, conditionParams } = this.buildWhereClause(config.conditions, input, params.length)
      query += ' AND ${whereClause}'
      params.push(...conditionParams)
    }

    query += ' RETURNING *'

    const result = await executeQuery(businessId, query, params)
    return result[0]
  }

  /**
   * Execute API request action
   */
  private async executeAPIRequestAction(config: unknown, input?: Record<string, unknown>): Promise<unknown> {
    const url = this.interpolateTemplate(config.url, input)
    const payload = config.payload ? this.interpolateObject(config.payload, input) : undefined

    // Mock implementation - would make actual HTTP request
    console.log('Making API request: ', {
      method: config.method,
      url,
      headers: config.headers,
      payload
    })

    return { status: 200, data: { success: true } }
  }

  /**
   * Execute delay action
   */
  private async executeDelayAction(config: unknown): Promise<unknown> {
    let milliseconds: number

    switch (config.unit) {
      case 'seconds':
        milliseconds = config.duration * 1000
        break
      case 'minutes':
        milliseconds = config.duration * 60 * 1000
        break
      case 'hours':
        milliseconds = config.duration * 60 * 60 * 1000
        break
      case 'days':
        milliseconds = config.duration * 24 * 60 * 60 * 1000
        break
      default:
        milliseconds = config.duration * 1000
    }

    await new Promise(resolve => setTimeout(resolve, milliseconds))
    return { delayed: milliseconds }
  }

  /**
   * Execute AI decision action
   */
  private async executeAIDecisionAction(config: unknown, input?: Record<string, unknown>): Promise<unknown> {
    const prompt = this.interpolateTemplate(config.prompt, input)
    
    // Mock AI decision - would integrate with actual AI service
    console.log('Making AI decision with prompt: ', prompt)
    
    return {
      decision: 'approved',
      confidence: 0.85,
      reasoning: 'Based on the provided data, the decision meets the criteria.'
    }
  }

  /**
   * Execute conditional branch action
   */
  private async executeConditionalBranchAction(execution: WorkflowExecution, config: unknown): Promise<unknown> {
    for (const branch of config.branches || []) {
      const conditionsMet = await this.evaluateConditions(branch.condition, execution.input || {})
      
      if (conditionsMet) {
        // Execute this branch's actions
        for (const action of branch.actions) {
          await this.executeAction(execution, action)
        }
        break
      }
    }

    return { branchExecuted: true }
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateConditions(conditions: WorkflowCondition[], context: Record<string, unknown>): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let currentLogicalOperator = 'AND'

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, context)
      
      if (currentLogicalOperator === 'AND') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }

      currentLogicalOperator = condition.logicalOperator || 'AND'
    }

    return result
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: WorkflowCondition, context: Record<string, unknown>): boolean {
    const fieldValue = this.getValueFromContext(condition.field, context)
    const expectedValue = condition.value

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return fieldValue === expectedValue
      case ConditionOperator.NOT_EQUALS:
        return fieldValue !== expectedValue
      case ConditionOperator.GREATER_THAN:
        return Number(fieldValue) > Number(expectedValue)
      case ConditionOperator.LESS_THAN:
        return Number(fieldValue) < Number(expectedValue)
      case ConditionOperator.CONTAINS:
        return String(fieldValue).includes(String(expectedValue))
      case ConditionOperator.IS_EMPTY:
        return !fieldValue || fieldValue === ' || fieldValue === null || fieldValue === undefined
      case ConditionOperator.IS_NOT_EMPTY:
        return fieldValue && fieldValue !== ' && fieldValue !== null && fieldValue !== undefined
      case ConditionOperator.IN_ARRAY:
        return condition.values?.includes(fieldValue) || false
      default:
        return false
    }
  }

  /**
   * Template interpolation
   */
  private interpolateTemplate(template: string, context?: Record<string, unknown>): string {
    if (!template || !context) return template

    return template.replace(/\$\{([^}]+)\}/g, (match, key) => {
      return this.getValueFromContext(key, context) || match
    })
  }

  /**
   * Object interpolation
   */
  private interpolateObject(obj: Record<string, unknown>, context?: Record<string, unknown>): Record<string, unknown> {
    if (!context) return obj

    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.interpolateTemplate(value, context)
      } else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * Get value from context using dot notation
   */
  private getValueFromContext(path: string, context: Record<string, unknown>): unknown {
    return path.split('.`).reduce((obj, key) => obj?.[key], context)
  }

  /**
   * Build WHERE clause for database queries
   */
  private buildWhereClause(
    conditions: WorkflowCondition[],
    context: Record<string, unknown>,
    startIndex: number
  ): { whereClause: string; conditionParams: unknown[] } {
    const clauses: string[] = []
    const params: unknown[] = []
    const paramIndex = startIndex + 1

    for (const condition of conditions) {
      const value = this.interpolateTemplate(String(condition.value), context)
      
      switch (condition.operator) {
        case ConditionOperator.EQUALS:
          clauses.push(`${condition.field} = $${paramIndex}')
          params.push(value)
          paramIndex++
          break
        case ConditionOperator.GREATER_THAN:
          clauses.push('${condition.field} > $${paramIndex}')
          params.push(value)
          paramIndex++
          break
        // Add more operators as needed
      }
    }

    return {
      whereClause: clauses.join(' AND '),
      conditionParams: params
    }
  }

  /**
   * Add log entry to execution
   */
  private addLog(
    execution: WorkflowExecution,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: Record<string, unknown>
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message,
      data
    })
  }

  /**
   * Save workflow to database
   */
  private async saveWorkflow(businessId: string, workflow: Workflow): Promise<void> {
    // Mock implementation - would save to actual database
    console.log('Saving workflow: ', workflow.name)
  }

  /**
   * Get workflow from database
   */
  private async getWorkflow(businessId: string, workflowId: string): Promise<Workflow | null> {
    // Mock implementation - would fetch from database
    return null
  }

  /**
   * Save execution to database
   */
  private async saveExecution(execution: WorkflowExecution): Promise<void> {
    // Mock implementation - would save to database
    console.log('Saving execution: ', execution.id)
  }

  /**
   * Update workflow execution count
   */
  private async updateWorkflowExecutionCount(businessId: string, workflowId: string): Promise<void> {
    // Mock implementation - would update database
    console.log('Updating execution count for workflow: ', workflowId)
  }

  /**
   * Get active executions
   */
  getActiveExecutions(businessId?: string): WorkflowExecution[] {
    const executions = Array.from(this.activeExecutions.values())
    return businessId ? executions.filter(e => e.businessId === businessId) : executions
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId)
    if (!execution) return false

    execution.status = ExecutionStatus.CANCELLED
    execution.completedAt = new Date()
    this.activeExecutions.delete(executionId)

    await this.saveExecution(execution)
    return true
  }
}

// Global workflow engine instance
export const workflowEngine = new WorkflowEngine()

// Workflow middleware for API routes
export function withWorkflow() {
  return function (handler: Function) {
    return async function (request: Request, context?: any) {
      // Add workflow engine to request context
      ;(request as any).workflowEngine = workflowEngine
      return await handler(request, context)
    }
  }
}

export {
  WorkflowEngine,
  WorkflowConfig,
  Workflow,
  WorkflowExecution,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowCondition
}