/**
 * Thorbis Business OS - Core AI Tools
 * 
 * Essential tools for system health, authentication, and capability discovery.
 * These tools are always available and provide foundational functionality.
 */

import { z } from 'zod'
import { BaseTool, ToolDefinition, ToolContext, ToolOutput, CommonSchemas } from './types'
import { capabilitiesManager } from '@thorbis/capabilities'
import { getUIIntentBus } from '../ui-intent-bus/bus'

/**
 * Ping tool - Basic health check and connectivity test
 */
export class PingTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: 'ping',
      description: 'Test system connectivity and health status',
      category: 'core',
      version: '1.0.0',
      
      input_schema: z.object({
        include_services: z.boolean().default(false).describe('Include external service health checks'),
        timeout_ms: z.number().min(100).max(30000).default(5000).describe('Timeout for health checks')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        data: z.object({
          status: z.string(),
          timestamp: z.string(),
          response_time_ms: z.number(),
          services: z.record(z.string(), z.object({
            status: z.enum(['healthy', 'degraded', 'down']),
            response_time_ms: z.number().optional(),
            message: z.string().optional()
          })).optional()
        }),
        metadata: z.object({
          execution_time_ms: z.number()
        }).optional()
      }),
      
      required_role: 'viewer',
      required_scopes: [],
      idempotent: true,
      supports_dry_run: false,
      requires_confirmation: false,
      max_execution_time_ms: 30000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const startTime = Date.now()
    const services: Record<string, unknown> = {}

    if (input.include_services) {
      // Check database connection
      services.database = await this.checkDatabaseHealth()
      
      // Check capabilities system
      services.capabilities = await this.checkCapabilitiesHealth()
      
      // Check UI intent bus
      services.ui_intent_bus = await this.checkUIIntentBusHealth()
    }

    const responseTime = Date.now() - startTime

    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime,
        ...(input.include_services && { services })
      }
    }
  }

  private async checkDatabaseHealth(): Promise<{ status: string; response_time_ms: number; message?: string }> {
    const startTime = Date.now()
    
    try {
      // This would test database connectivity
      // For now, we'll simulate a health check'
      await new Promise(resolve => setTimeout(resolve, 10))
      
      return {
        status: 'healthy',
        response_time_ms: Date.now() - startTime
      }
    } catch (_error) {
      return {
        status: 'down',
        response_time_ms: Date.now() - startTime,
        message: 'Database connection failed'
      }
    }
  }

  private async checkCapabilitiesHealth(): Promise<{ status: string; response_time_ms: number; message?: string }> {
    const startTime = Date.now()
    
    try {
      await capabilitiesManager.getManifest()
      return {
        status: 'healthy',
        response_time_ms: Date.now() - startTime
      }
    } catch (_error) {
      return {
        status: 'degraded',
        response_time_ms: Date.now() - startTime,
        message: 'Capabilities system is not fully functional'
      }
    }
  }

  private async checkUIIntentBusHealth(): Promise<{ status: string; response_time_ms: number; message?: string }> {
    const startTime = Date.now()
    
    try {
      const bus = getUIIntentBus()
      const stats = bus.getQueueStats()
      
      return {
        status: 'healthy',
        response_time_ms: Date.now() - startTime,
        message: 'Queue: ${stats.pending_count} pending, ${stats.executing_count} executing'
      }
    } catch (_error) {
      return {
        status: 'down',
        response_time_ms: Date.now() - startTime,
        message: 'UI Intent Bus is not responding'
      }
    }
  }
}

/**
 * WhoAmI tool - Get current user context and permissions
 */
export class WhoAmITool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: 'whoAmI',
      description: 'Get current user context, permissions, and session information',
      category: 'core',
      version: '1.0.0',
      
      input_schema: z.object({
        include_permissions: z.boolean().default(true).describe('Include detailed permission information'),
        include_session: z.boolean().default(false).describe('Include session metadata')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        data: z.object({
          user_id: z.string().optional(),
          business_id: z.string(),
          role: z.string(),
          scopes: z.array(z.string()),
          session_id: z.string().optional(),
          permissions: z.record(z.string(), z.boolean()).optional(),
          business_info: z.object({
            name: z.string(),
            slug: z.string(),
            industry: z.string()
          }).optional(),
          session_metadata: z.object({
            ip_address: z.string().optional(),
            user_agent: z.string().optional(),
            created_at: z.string().optional(),
            last_activity: z.string().optional()
          }).optional()
        })
      }),
      
      required_role: 'viewer',
      required_scopes: [],
      idempotent: true,
      supports_dry_run: false,
      requires_confirmation: false,
      max_execution_time_ms: 5000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const data: unknown = {
      user_id: context.user_id,
      business_id: context.business_id,
      role: context.role,
      scopes: context.scopes,
      session_id: context.session_id
    }

    if (input.include_permissions) {
      data.permissions = await this.getDetailedPermissions(context)
    }

    if (input.include_session && context.session_id) {
      data.session_metadata = {
        ip_address: context.ip_address,
        user_agent: context.user_agent,
        created_at: new Date().toISOString(), // Would come from session store
        last_activity: new Date().toISOString()
      }
    }

    // Get business info
    try {
      // This would fetch from business DAL
      data.business_info = {
        name: 'Sample Business', // Would come from database
        slug: 'sample-business',
        industry: 'field-services'
      }
    } catch (_error) {
      // Business info is optional
    }

    return {
      success: true,
      data
    }
  }

  private async getDetailedPermissions(context: ToolContext): Promise<Record<string, boolean>> {
    // This would calculate detailed permissions based on role and scopes
    const basePermissions: Record<string, boolean> = {
      'read:own_data': true,
      'write:own_data': ['staff', 'manager', 'owner'].includes(context.role),
      'delete:own_data': ['manager', 'owner'].includes(context.role),
      'read:business_data': true,
      'write:business_data': ['staff', 'manager', 'owner'].includes(context.role),
      'manage:users': context.role === 'owner',
      'manage:settings': ['manager', 'owner'].includes(context.role),
      'view:audit_logs': ['manager', 'owner'].includes(context.role),
      'use:ai_tools': true,
      'export:data': ['manager', 'owner'].includes(context.role)
    }

    // Add scope-specific permissions
    for (const scope of context.scopes) {
      basePermissions['scope:${scope}'] = true
    }

    return basePermissions
  }
}

/**
 * GetCapabilities tool - Discover system capabilities and feature availability
 */
export class GetCapabilitiesTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: 'getCapabilities',
      description: 'Get system capabilities, feature availability, and configuration',
      category: 'core',
      version: '1.0.0',
      
      input_schema: z.object({
        include_database: z.boolean().default(true).describe('Include database schema information'),
        include_domains: z.boolean().default(true).describe('Include domain pack availability'),
        include_features: z.boolean().default(true).describe('Include feature flags'),
        include_limits: z.boolean().default(false).describe('Include rate limits and quotas'),
        domain_filter: z.array(z.string()).optional().describe('Filter to specific domains')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        data: z.object({
          version: z.string(),
          generated_at: z.string(),
          database: z.record(z.string(), z.any()).optional(),
          domains: z.record(z.string(), z.any()).optional(),
          features: z.record(z.string(), z.any()).optional(),
          limits: z.record(z.string(), z.any()).optional()
        }),
        warnings: z.array(z.string()).optional()
      }),
      
      required_role: 'viewer`,
      required_scopes: [],
      idempotent: true,
      supports_dry_run: false,
      requires_confirmation: false,
      max_execution_time_ms: 10000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    try {
      const manifest = await capabilitiesManager.getManifest()
      const warnings: string[] = []

      const data: unknown = {
        version: manifest.version,
        generated_at: manifest.generated_at
      }

      if (input.include_database) {
        data.database = {
          version: manifest.database.version,
          extensions: manifest.database.extensions,
          schemas: manifest.database.schemas,
          tables: manifest.database.tables.map(table => ({
            name: table.table,
            exists: table.exists,
            columns: table.columns.length,
            permissions: table.permissions
          }))
        }

        // Add warnings for missing tables
        const missingTables = manifest.database.tables.filter(t => !t.exists)
        if (missingTables.length > 0) {
          warnings.push('${missingTables.length} tables are missing or inaccessible')
        }
      }

      if (input.include_domains) {
        let domains = manifest.domains

        // Apply domain filter if specified
        if (input.domain_filter && input.domain_filter.length > 0) {
          domains = Object.fromEntries(
            Object.entries(domains).filter(([key]) => input.domain_filter.includes(key))
          )
        }

        data.domains = domains

        // Add warnings for disabled domains
        const disabledDomains = Object.entries(domains).filter(([_, domain]) => !domain.enabled)
        if (disabledDomains.length > 0) {
          warnings.push('${disabledDomains.length} domains are disabled: ${disabledDomains.map(([name]) => name).join(', ')}')
        }
      }

      if (input.include_features) {
        data.features = manifest.features

        // Add warnings for disabled features
        const disabledFeatures = Object.entries(manifest.features).filter(([_, feature]) => !feature.enabled)
        if (disabledFeatures.length > 0) {
          warnings.push('${disabledFeatures.length} features are disabled')
        }
      }

      if (input.include_limits) {
        data.limits = manifest.limits
      }

      return {
        success: true,
        data,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          capabilities_checked: ['database', 'domains', 'features', 'limits'].filter(cap => 
            input['include_${cap}'] !== false
          )
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CAPABILITY_ERROR',
          message: 'Failed to retrieve system capabilities',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }
}

/**
 * Navigate tool - Control UI navigation
 */
export class NavigateTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: 'navigate',
      description: 'Navigate to different pages in the application',
      category: 'core',
      version: '1.0.0',
      
      input_schema: z.object({
        path: z.string().describe('Target path to navigate to'),
        query: z.record(z.string(), z.string()).optional().describe('Query parameters'),
        replace: z.boolean().default(false).describe('Replace current history entry'),
        preserve_state: z.boolean().default(false).describe('Preserve current UI state')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        commands: z.array(z.object({
          type: z.string(),
          payload: z.any(),
          priority: z.string().optional()
        })).optional()
      }),
      
      required_role: 'viewer',
      required_scopes: [],
      idempotent: false, // Navigation changes state
      supports_dry_run: true,
      requires_confirmation: false,
      max_execution_time_ms: 1000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const command = {
      type: 'NAVIGATE',
      payload: {
        path: input.path,
        query: input.query,
        replace: input.replace,
        preserve_state: input.preserve_state
      },
      priority: 'medium' as const
    }

    return {
      success: true,
      commands: [command]
    }
  }

  protected async executeDryRun(input: unknown, context: ToolContext): Promise<ToolOutput> {
    return {
      success: true,
      data: {
        dry_run: true,
        would_navigate_to: input.path,
        with_query: input.query,
        replace_history: input.replace
      }
    }
  }
}

/**
 * ShowToast tool - Display notifications to user
 */
export class ShowToastTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: 'showToast',
      description: 'Display toast notification to the user',
      category: 'core',
      version: '1.0.0',
      
      input_schema: z.object({
        message: z.string().min(1).max(500).describe('Message to display'),
        type: z.enum(['info', 'success', 'warning', 'error']).default('info').describe('Toast type'),
        duration: z.number().min(0).max(30000).default(5000).describe('Duration in milliseconds (0 for persistent)'),
        dismissible: z.boolean().default(true).describe('Whether user can dismiss the toast'),
        action: z.object({
          label: z.string(),
          action: z.string()
        }).optional().describe('Optional action button')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        commands: z.array(z.object({
          type: z.string(),
          payload: z.any(),
          priority: z.string().optional()
        })).optional()
      }),
      
      required_role: 'viewer',
      required_scopes: [],
      idempotent: false, // UI changes are not idempotent
      supports_dry_run: true,
      requires_confirmation: false,
      max_execution_time_ms: 1000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const command = {
      type: 'SHOW_TOAST',
      payload: {
        message: input.message,
        type: input.type,
        duration: input.duration,
        dismissible: input.dismissible,
        action: input.action
      },
      priority: (input.type === 'error' ? 'high' : 'medium') as 'high' | 'medium'
    }

    return {
      success: true,
      commands: [command]
    }
  }

  protected async executeDryRun(input: unknown, context: ToolContext): Promise<ToolOutput> {
    return {
      success: true,
      data: {
        dry_run: true,
        would_show_toast: {
          message: input.message,
          type: input.type,
          duration: input.duration
        }
      }
    }
  }
}
