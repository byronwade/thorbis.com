/**
 * Thorbis Business OS - Tool Registry
 * 
 * Central registry for all AI tools with discovery, execution,
 * and lifecycle management capabilities.
 */

import { BaseTool, ToolContext, ToolInput, ToolOutput, ToolExecutionResult } from './types'
import { getAuditLogger } from '../audit/logger'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { 
  PingTool, 
  WhoAmITool, 
  GetCapabilitiesTool, 
  NavigateTool, 
  ShowToastTool 
} from './core-tools'

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map()
  private executionHistory: Map<string, ToolExecutionResult> = new Map()
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  private auditLogger = getAuditLogger(this.supabase)

  constructor() {
    this.registerCoreTools()
  }

  /**
   * Register a tool in the registry
   */
  registerTool(tool: BaseTool): void {
    if (this.tools.has(tool.definition.name)) {
      console.warn(`Tool ${tool.definition.name} is already registered. Overriding.`)
    }
    this.tools.set(tool.definition.name, tool)
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name)
  }

  /**
   * Get all registered tools
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): BaseTool[] {
    return this.getAllTools().filter(tool => tool.definition.category === category)
  }

  /**
   * Get available tools for a context
   */
  async getAvailableTools(context: ToolContext): Promise<BaseTool[]> {
    const availableTools: BaseTool[] = []

    for (const tool of this.getAllTools()) {
      try {
        const availability = await tool.isAvailable(context)
        if (availability.available) {
          availableTools.push(tool)
        }
      } catch (error) {
        console.warn(`Error checking availability for tool ${tool.definition.name}:', error)
      }
    }

    return availableTools
  }

  /**
   * Execute a tool with full lifecycle management
   */
  async executeTool(
    toolName: string,
    input: ToolInput,
    context: ToolContext,
    options?: {
      dry_run?: boolean
      timeout_ms?: number
    }
  ): Promise<ToolExecutionResult> {
    const executionId = uuidv4()
    const startTime = new Date().toISOString()
    const startTimestamp = Date.now()

    try {
      // Get the tool
      const tool = this.getTool(toolName)
      if (!tool) {
        throw new Error('Tool ${toolName} not found')
      }

      // Start audit logging
      const auditId = await this.auditLogger.startToolAudit(
        {
          business_id: context.business_id,
          user_id: context.user_id,
          session_id: context.session_id,
          source: context.audit_context.source,
          ip_address: context.ip_address,
          user_agent: context.user_agent,
          request_id: context.request_id,
          idempotency_key: context.idempotency_key,
          parent_audit_id: context.audit_context.parent_audit_id
        },
        {
          tool_name: toolName,
          input: input
        }
      )

      // Check if tool is available
      const availability = await tool.isAvailable(context)
      if (!availability.available) {
        const error = new Error(availability.reason || 'Tool not available')
        await this.auditLogger.completeToolAudit(auditId, {
          status: 'error',
          error: {
            code: 'TOOL_UNAVAILABLE',
            message: error.message
          },
          duration_ms: Date.now() - startTimestamp
        })
        throw error
      }

      // Execute tool (dry run or real)
      let output: ToolOutput
      if (options?.dry_run) {
        output = await tool.dryRun(input, context)
      } else {
        // Apply timeout if specified
        if (options?.timeout_ms) {
          output = await Promise.race([
            tool.execute(input, context),
            this.createTimeoutPromise(options.timeout_ms)
          ])
        } else {
          output = await tool.execute(input, context)
        }
      }

      const completedAt = new Date().toISOString()
      const duration = Date.now() - startTimestamp

      // Complete audit logging
      await this.auditLogger.completeToolAudit(auditId, {
        output: output,
        status: output.success ? 'success' : 'error',
        duration_ms: duration,
        tokens_used: output.metadata?.tokens_used,
        warnings: output.warnings
      })

      const result: ToolExecutionResult = {
        tool_name: toolName,
        execution_id: executionId,
        success: output.success,
        output: output,
        context: context,
        input: input,
        started_at: startTime,
        completed_at: completedAt,
        duration_ms: duration,
        audit_id: auditId
      }

      // Store in execution history
      this.executionHistory.set(executionId, result)

      return result
    } catch (error) {
      const completedAt = new Date().toISOString()
      const duration = Date.now() - startTimestamp

      const errorOutput: ToolOutput = {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          execution_time_ms: duration
        }
      }

      const result: ToolExecutionResult = {
        tool_name: toolName,
        execution_id: executionId,
        success: false,
        output: errorOutput,
        context: context,
        input: input,
        started_at: startTime,
        completed_at: completedAt,
        duration_ms: duration,
        audit_id: 'failed'
      }

      this.executionHistory.set(executionId, result)
      return result
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeToolsParallel(
    executions: Array<{
      tool_name: string
      input: ToolInput
      context: ToolContext
      options?: { dry_run?: boolean; timeout_ms?: number }
    }>
  ): Promise<ToolExecutionResult[]> {
    const promises = executions.map(exec =>
      this.executeTool(exec.tool_name, exec.input, exec.context, exec.options)
    )

    return Promise.all(promises)
  }

  /**
   * Get tool execution history
   */
  getExecutionHistory(
    filters?: {
      tool_name?: string
      business_id?: string
      user_id?: string
      success?: boolean
      limit?: number
    }
  ): ToolExecutionResult[] {
    let results = Array.from(this.executionHistory.values())

    // Apply filters
    if (filters) {
      if (filters.tool_name) {
        results = results.filter(r => r.tool_name === filters.tool_name)
      }
      if (filters.business_id) {
        results = results.filter(r => r.context.business_id === filters.business_id)
      }
      if (filters.user_id) {
        results = results.filter(r => r.context.user_id === filters.user_id)
      }
      if (filters.success !== undefined) {
        results = results.filter(r => r.success === filters.success)
      }
    }

    // Sort by completion time (newest first)
    results.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())

    // Apply limit
    if (filters?.limit) {
      results = results.slice(0, filters.limit)
    }

    return results
  }

  /**
   * Get tool documentation for all tools
   */
  getToolDocumentation(context: ToolContext): Array<{
    name: string
    description: string
    category: string
    available: boolean
    input_schema: any
    output_schema: any
    examples: unknown[]
    permissions: any
    metadata: {
      version: string
      idempotent: boolean
      supports_dry_run: boolean
      requires_confirmation: boolean
    }
  }> {
    return this.getAllTools().map(tool => ({
      ...tool.getDocumentation(),
      available: true, // We'd need to check this async in a real implementation'
      metadata: {
        version: tool.definition.version,
        idempotent: tool.definition.idempotent,
        supports_dry_run: tool.definition.supports_dry_run,
        requires_confirmation: tool.definition.requires_confirmation
      }
    }))
  }

  /**
   * Health check for tool registry
   */
  async healthCheck(): Promise<{
    total_tools: number
    available_tools: number
    categories: Record<string, number>
    execution_stats: {
      total_executions: number
      success_rate: number
      avg_duration_ms: number
    }
  }> {
    const tools = this.getAllTools()
    const categories: Record<string, number> = {}
    
    // Count tools by category
    for (const tool of tools) {
      categories[tool.definition.category] = (categories[tool.definition.category] || 0) + 1
    }

    // Calculate execution stats
    const executions = Array.from(this.executionHistory.values())
    const successfulExecutions = executions.filter(e => e.success)
    const totalDuration = executions.reduce((sum, e) => sum + e.duration_ms, 0)

    return {
      total_tools: tools.length,
      available_tools: tools.length, // Simplified - would need async check
      categories,
      execution_stats: {
        total_executions: executions.length,
        success_rate: executions.length > 0 ? (successfulExecutions.length / executions.length) * 100 : 0,
        avg_duration_ms: executions.length > 0 ? totalDuration / executions.length : 0
      }
    }
  }

  /**
   * Register core tools
   */
  private registerCoreTools(): void {
    this.registerTool(new PingTool())
    this.registerTool(new WhoAmITool())
    this.registerTool(new GetCapabilitiesTool())
    this.registerTool(new NavigateTool())
    this.registerTool(new ShowToastTool())
  }

  /**
   * Create a timeout promise for tool execution
   */
  private createTimeoutPromise(timeoutMs: number): Promise<ToolOutput> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Tool execution timed out after ${timeoutMs}ms'))
      }, timeoutMs)
    })
  }

  /**
   * Clean up old execution history
   */
  cleanupHistory(maxAge: number = 24 * 60 * 60 * 1000): void { // Default 24 hours
    const cutoff = Date.now() - maxAge
    
    for (const [executionId, result] of this.executionHistory.entries()) {
      if (new Date(result.completed_at).getTime() < cutoff) {
        this.executionHistory.delete(executionId)
      }
    }
  }

  /**
   * Shutdown registry and cleanup resources
   */
  shutdown(): void {
    this.tools.clear()
    this.executionHistory.clear()
  }
}

// Singleton instance
let toolRegistry: ToolRegistry | null = null

export function getToolRegistry(): ToolRegistry {
  if (!toolRegistry) {
    toolRegistry = new ToolRegistry()
  }
  return toolRegistry
}
