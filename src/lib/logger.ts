/**
 * Thorbis Business OS - Audit Logger Implementation
 * 
 * Comprehensive audit logging system that tracks all tool calls,
 * data changes, and AI interactions with full context and diffs.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { 
  AuditEntry, 
  AuditContext, 
  ToolAuditData, 
  DataChangeAuditData,
  AuditQuery,
  AuditStats,
  AuditAlert,
  AuditRule
} from './types'

export class AuditLogger {
  private supabase: SupabaseClient
  private pendingEntries: Map<string, Partial<AuditEntry>> = new Map()
  private flushInterval: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 50
  private readonly FLUSH_INTERVAL = 5000 // 5 seconds

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.startBatchProcessor()
  }

  /**
   * Start a new audit entry for a tool call
   */
  async startToolAudit(
    context: AuditContext,
    toolData: Pick<ToolAuditData, 'tool_name' | 'input'>
  ): Promise<string> {
    const auditId = uuidv4()
    const now = new Date().toISOString()

    const entry: Partial<AuditEntry> = {
      id: auditId,
      business_id: context.business_id,
      user_id: context.user_id,
      session_id: context.session_id,
      action: 'tool:${toolData.tool_name}',
      tool_name: toolData.tool_name,
      source: context.source,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
      request_id: context.request_id,
      idempotency_key: context.idempotency_key,
      parent_audit_id: context.parent_audit_id,
      tool_input: this.sanitizeData(toolData.input),
      status: 'success', // Will be updated when completed
      created_at: now
    }

    this.pendingEntries.set(auditId, entry)
    return auditId
  }

  /**
   * Complete a tool audit entry
   */
  async completeToolAudit(
    auditId: string,
    result: Pick<ToolAuditData, 'output' | 'duration_ms' | 'tokens_used' | 'status' | 'error' | 'warnings'>
  ): Promise<void> {
    const entry = this.pendingEntries.get(auditId)
    if (!entry) {
      console.error('Audit entry ${auditId} not found in pending entries')
      return
    }

    entry.tool_output = result.output ? this.sanitizeData(result.output) : undefined
    entry.tool_duration_ms = result.duration_ms
    entry.tool_tokens_used = result.tokens_used
    // Filter out 'running' status as it's not a final status'
    if (result.status !== 'running') {
      entry.status = result.status
    }
    entry.completed_at = new Date().toISOString()
    entry.warnings = result.warnings

    if (result.error) {
      entry.error_code = result.error.code
      entry.error_message = result.error.message
    }

    // Move to immediate flush if it's an error'
    if (result.status === 'error') {
      await this.flushEntry(auditId)
    }
  }

  /**
   * Log a data change operation
   */
  async logDataChange(
    context: AuditContext,
    changeData: DataChangeAuditData
  ): Promise<string> {
    const auditId = uuidv4()
    const now = new Date().toISOString()

    const entry: AuditEntry = {
      id: auditId,
      business_id: context.business_id,
      user_id: context.user_id,
      session_id: context.session_id,
      action: 'data:${changeData.action}',
      table_name: changeData.table_name,
      entity_id: changeData.entity_id,
      source: context.source,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
      request_id: context.request_id,
      idempotency_key: context.idempotency_key,
      parent_audit_id: context.parent_audit_id,
      before_data: this.sanitizeData(changeData.before),
      after_data: this.sanitizeData(changeData.after),
      diff: changeData.diff,
      status: 'success',
      created_at: now,
      completed_at: now
    }

    await this.storeEntry(entry)
    return auditId
  }

  /**
   * Log a general action
   */
  async logAction(
    context: AuditContext,
    action: string,
    details?: {
      entity_id?: string
      table_name?: string
      data?: any
      duration_ms?: number
      status?: 'success' | 'error' | 'warning'
      error_code?: string
      error_message?: string
      warnings?: string[]
    }
  ): Promise<string> {
    const auditId = uuidv4()
    const now = new Date().toISOString()

    const entry: AuditEntry = {
      id: auditId,
      business_id: context.business_id,
      user_id: context.user_id,
      session_id: context.session_id,
      action,
      table_name: details?.table_name,
      entity_id: details?.entity_id,
      source: context.source,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
      request_id: context.request_id,
      idempotency_key: context.idempotency_key,
      parent_audit_id: context.parent_audit_id,
      after_data: details?.data ? this.sanitizeData(details.data) : undefined,
      tool_duration_ms: details?.duration_ms,
      status: details?.status || 'success',
      error_code: details?.error_code,
      error_message: details?.error_message,
      warnings: details?.warnings,
      created_at: now,
      completed_at: now
    }

    await this.storeEntry(entry)
    return auditId
  }

  /**
   * Query audit entries
   */
  async query(query: AuditQuery): Promise<{ entries: AuditEntry[]; total: number }> {
    try {
      let baseQuery = this.supabase
        .from('audit_log')
        .select('*', { count: 'exact' })

      // Apply filters
      if (query.business_id) {
        baseQuery = baseQuery.eq('business_id', query.business_id)
      }
      if (query.user_id) {
        baseQuery = baseQuery.eq('user_id', query.user_id)
      }
      if (query.session_id) {
        baseQuery = baseQuery.eq('session_id', query.session_id)
      }
      if (query.action) {
        baseQuery = baseQuery.eq('action', query.action)
      }
      if (query.tool_name) {
        baseQuery = baseQuery.eq('tool_name', query.tool_name)
      }
      if (query.table_name) {
        baseQuery = baseQuery.eq('table_name', query.table_name)
      }
      if (query.entity_id) {
        baseQuery = baseQuery.eq('entity_id', query.entity_id)
      }
      if (query.source) {
        baseQuery = baseQuery.eq('source', query.source)
      }
      if (query.status) {
        baseQuery = baseQuery.eq('status', query.status)
      }
      if (query.date_from) {
        baseQuery = baseQuery.gte('created_at', query.date_from)
      }
      if (query.date_to) {
        baseQuery = baseQuery.lte('created_at', query.date_to)
      }

      // Apply pagination and ordering
      const limit = Math.min(query.limit || 50, 500) // Max 500 entries
      const offset = query.offset || 0
      const orderBy = query.order_by || 'created_at'
      const orderDirection = query.order_direction || 'desc'

      baseQuery = baseQuery
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending: orderDirection === 'asc' })

      const { data, error, count } = await baseQuery

      if (error) {
        throw error
      }

      return {
        entries: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Failed to query audit entries:', error)
      throw new Error('Failed to retrieve audit entries')
    }
  }

  /**
   * Get audit statistics
   */
  async getStats(
    businessId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<AuditStats> {
    try {
      let query = this.supabase
        .from('audit_log')
        .select('*')
        .eq('business_id', businessId)

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const entries = data || []
      const total = entries.length

      if (total === 0) {
        return {
          total_entries: 0,
          success_rate: 0,
          error_rate: 0,
          warning_rate: 0,
          top_actions: [],
          top_tools: [],
          avg_duration_ms: 0,
          total_tokens_used: 0,
          date_range: {
            from: dateFrom || ',
            to: dateTo || '
          }
        }
      }

      const successCount = entries.filter(e => e.status === 'success').length
      const errorCount = entries.filter(e => e.status === 'error').length
      const warningCount = entries.filter(e => e.status === 'warning').length

      // Count actions and tools
      const actionCounts = new Map<string, number>()
      const toolCounts = new Map<string, number>()
      const totalDuration = 0
      const totalTokens = 0
      const durationCount = 0
      const tokenCount = 0

      for (const entry of entries) {
        // Count actions
        actionCounts.set(entry.action, (actionCounts.get(entry.action) || 0) + 1)

        // Count tools
        if (entry.tool_name) {
          toolCounts.set(entry.tool_name, (toolCounts.get(entry.tool_name) || 0) + 1)
        }

        // Sum durations and tokens
        if (entry.tool_duration_ms) {
          totalDuration += entry.tool_duration_ms
          durationCount++
        }
        if (entry.tool_tokens_used) {
          totalTokens += entry.tool_tokens_used
          tokenCount++
        }
      }

      // Convert to sorted arrays
      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      const topTools = Array.from(toolCounts.entries())
        .map(([tool, count]) => ({ tool, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        total_entries: total,
        success_rate: (successCount / total) * 100,
        error_rate: (errorCount / total) * 100,
        warning_rate: (warningCount / total) * 100,
        top_actions: topActions,
        top_tools: topTools,
        avg_duration_ms: durationCount > 0 ? totalDuration / durationCount : 0,
        total_tokens_used: totalTokens,
        date_range: {
          from: dateFrom || entries[entries.length - 1]?.created_at || ',
          to: dateTo || entries[0]?.created_at || '
        }
      }
    } catch (error) {
      console.error('Failed to generate audit stats:', error)
      throw new Error('Failed to generate audit statistics')
    }
  }

  /**
   * Store audit entry in database
   */
  private async storeEntry(entry: AuditEntry): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('audit_log')
        .insert(entry)

      if (error) {
        console.error('Failed to store audit entry:', error)
        // In production, we might want to store failed entries in a local queue
        // for retry later, or send to a fallback logging service
      }
    } catch (error) {
      console.error('Failed to store audit entry:', error)
    }
  }

  /**
   * Flush a specific pending entry
   */
  private async flushEntry(auditId: string): Promise<void> {
    const entry = this.pendingEntries.get(auditId)
    if (entry && entry.id) {
      await this.storeEntry(entry as AuditEntry)
      this.pendingEntries.delete(auditId)
    }
  }

  /**
   * Start the batch processor for pending entries
   */
  private startBatchProcessor(): void {
    this.flushInterval = setInterval(async () => {
      await this.flushPendingEntries()
    }, this.FLUSH_INTERVAL)
  }

  /**
   * Flush all pending entries in batches
   */
  private async flushPendingEntries(): Promise<void> {
    if (this.pendingEntries.size === 0) return

    const entries = Array.from(this.pendingEntries.values())
      .filter(entry => entry.id)
      .slice(0, this.BATCH_SIZE) as AuditEntry[]

    if (entries.length === 0) return

    try {
      const { error } = await this.supabase
        .from('audit_log')
        .insert(entries)

      if (!error) {
        // Remove successfully stored entries
        entries.forEach(entry => {
          this.pendingEntries.delete(entry.id)
        })
      } else {
        console.error('Failed to batch store audit entries:', error)
      }
    } catch (error) {
      console.error('Failed to batch store audit entries:', error)
    }
  }

  /**
   * Sanitize data before storing (remove sensitive information)
   */
  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'authorization',
      'credit_card', 'ssn', 'social_security', 'bank_account',
      'api_key', 'private_key', 'access_token', 'refresh_token'
    ]

    const sanitized = JSON.parse(JSON.stringify(data))

    const sanitizeObject = (obj: unknown): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key])
        } else if (typeof key === 'string') {
          const lowerKey = key.toLowerCase()
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            obj[key] = '[REDACTED]'
          }
        }
      }
    }

    sanitizeObject(sanitized)
    return sanitized
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    
    // Flush any remaining entries
    this.flushPendingEntries()
  }
}

// Singleton instance
let auditLogger: AuditLogger | null = null

export function getAuditLogger(supabase: SupabaseClient): AuditLogger {
  if (!auditLogger) {
    auditLogger = new AuditLogger(supabase)
  }
  return auditLogger
}
