/**
 * Thorbis Business OS - AI Tools Types
 * 
 * Core types and interfaces for the AI tool system that provides
 * structured interfaces for Claude to interact with the platform.
 */

import { z } from 'zod'

export interface ToolContext {
  business_id: string
  user_id?: string
  session_id?: string
  role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner'
  scopes: string[]
  ip_address?: string
  user_agent?: string
  request_id?: string
  idempotency_key?: string
  audit_context: {
    source: 'ui' | 'api' | 'tool' | 'webhook' | 'cron'
    session_id?: string
    parent_audit_id?: string
  }
}

export interface ToolInput {
  [key: string]: any
}

export interface ToolOutput {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    field?: string
    details?: any
  }
  warnings?: string[]
  metadata?: {
    execution_time_ms?: number
    tokens_used?: number
    cache_hit?: boolean
    fallbacks_used?: string[]
    capabilities_checked?: string[]
  }
  commands?: Array<{
    type: string
    payload: unknown
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }>
  needsConfirmation?: boolean
  confirmationMessage?: string
  previewData?: any
}

export interface ToolDefinition {
  name: string
  description: string
  category: 'core' | 'search' | 'field-ops' | 'restaurant' | 'marketing' | 'accounting' | 'admin'
  version: string
  
  // Schema validation
  input_schema: z.ZodSchema
  output_schema: z.ZodSchema
  
  // Permissions and requirements
  required_role: 'viewer' | 'staff' | 'manager' | 'owner' | 'api_partner'
  required_scopes: string[]
  rate_limit?: {
    max_calls: number
    window_ms: number
  }
  
  // Execution properties
  idempotent: boolean
  supports_dry_run: boolean
  requires_confirmation: boolean
  max_execution_time_ms: number
  
  // Dependencies
  dependencies?: string[] // Other tools or services this tool depends on
  capabilities?: string[] // Capabilities this tool requires
  
  // Documentation
  examples?: Array<{
    name: string
    description: string
    input: any
    expected_output: any
  }>
  
  // Metadata
  tags?: string[]
  deprecated?: boolean
  replacement?: string // If deprecated, what tool to use instead
}

export interface ToolExecutionResult {
  tool_name: string
  execution_id: string
  success: boolean
  output: ToolOutput
  context: ToolContext
  input: ToolInput
  started_at: string
  completed_at: string
  duration_ms: number
  audit_id: string
}

export abstract class BaseTool {
  public readonly definition: ToolDefinition
  
  constructor(definition: ToolDefinition) {
    this.definition = definition
  }

  /**
   * Execute the tool with proper validation and error handling
   */
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const startTime = Date.now()
    
    try {
      // Validate input
      const validationResult = this.definition.input_schema.safeParse(input)
      if (!validationResult.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: validationResult.error.flatten()
          }
        }
      }

      // Check permissions
      const permissionCheck = await this.checkPermissions(context)
      if (!permissionCheck.allowed) {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: permissionCheck.reason || 'Insufficient permissions'
          }
        }
      }

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(context)
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
            details: rateLimitCheck
          }
        }
      }

      // Execute the tool
      const result = await this.executeInternal(validationResult.data, context)
      
      // Add metadata
      result.metadata = {
        ...result.metadata,
        execution_time_ms: Date.now() - startTime
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        },
        metadata: {
          execution_time_ms: Date.now() - startTime
        }
      }
    }
  }

  /**
   * Dry run execution (if supported)
   */
  async dryRun(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    if (!this.definition.supports_dry_run) {
      return {
        success: false,
        error: {
          code: 'DRY_RUN_NOT_SUPPORTED',
          message: 'Tool ${this.definition.name} does not support dry run'
        }
      }
    }

    return this.executeDryRun(input, context)
  }

  /**
   * Get tool documentation
   */
  getDocumentation(): {
    name: string
    description: string
    category: string
    input_schema: any
    output_schema: any
    examples: unknown[]
    permissions: any
  } {
    return {
      name: this.definition.name,
      description: this.definition.description,
      category: this.definition.category,
      input_schema: this.definition.input_schema,
      output_schema: this.definition.output_schema,
      examples: this.definition.examples || [],
      permissions: {
        required_role: this.definition.required_role,
        required_scopes: this.definition.required_scopes
      }
    }
  }

  /**
   * Check if tool is available in current context
   */
  async isAvailable(context: ToolContext): Promise<{
    available: boolean
    reason?: string
    missing_capabilities?: string[]
  }> {
    // Check permissions
    const permissionCheck = await this.checkPermissions(context)
    if (!permissionCheck.allowed) {
      return {
        available: false,
        reason: permissionCheck.reason
      }
    }

    // Check capabilities
    if (this.definition.capabilities) {
      // This would check against the capabilities manifest
      // For now, we'll assume all capabilities are available'
    }

    return { available: true }
  }

  /**
   * Internal execution method - to be implemented by subclasses
   */
  protected abstract executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput>

  /**
   * Dry run execution - can be overridden by subclasses
   */
  protected async executeDryRun(input: unknown, context: ToolContext): Promise<ToolOutput> {
    return {
      success: true,
      data: { dry_run: true, would_execute: true },
      metadata: { execution_time_ms: 0 }
    }
  }

  /**
   * Check permissions for tool execution
   */
  private async checkPermissions(context: ToolContext): Promise<{
    allowed: boolean
    reason?: string
  }> {
    // Check role
    const roleHierarchy = ['viewer', 'staff', 'manager', 'owner', 'api_partner']
    const requiredRoleIndex = roleHierarchy.indexOf(this.definition.required_role)
    const userRoleIndex = roleHierarchy.indexOf(context.role)
    
    if (userRoleIndex < requiredRoleIndex && context.role !== 'api_partner`) {
      return {
        allowed: false,
        reason: 'Tool requires ${this.definition.required_role} role or higher'
      }
    }

    // Check scopes
    const hasAllScopes = this.definition.required_scopes.every(scope => 
      context.scopes.includes(scope)
    )
    
    if (!hasAllScopes) {
      const missingScopes = this.definition.required_scopes.filter(scope => 
        !context.scopes.includes(scope)
      )
      return {
        allowed: false,
        reason: 'Missing required scopes: ${missingScopes.join(', ')}'
      }
    }

    return { allowed: true }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(context: ToolContext): Promise<{
    allowed: boolean
    remaining?: number
    reset_at?: string
  }> {
    // For now, we'll skip rate limiting implementation'
    // In production, this would check against Redis or similar
    return { allowed: true }
  }
}

// Common validation schemas
export const CommonSchemas = {
  BusinessId: z.string().uuid('Business ID must be a valid UUID'),
  UserId: z.string().uuid('User ID must be a valid UUID').optional(),
  EntityId: z.string().uuid('Entity ID must be a valid UUID'),
  Pagination: z.object({
    limit: z.number().min(1).max(100).default(25),
    offset: z.number().min(0).default(0)
  }).optional(),
  Sorting: z.object({
    sort_by: z.string().default('created_at'),
    sort_direction: z.enum(['asc', 'desc']).default('desc')
  }).optional(),
  Filters: z.record(z.string(), z.any()).optional(),
  IdempotencyKey: z.string().optional(),
  DryRun: z.boolean().default(false)
}

// Standard error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  TIMEOUT: 'TIMEOUT',
  CAPABILITY_UNAVAILABLE: 'CAPABILITY_UNAVAILABLE'
} as const
