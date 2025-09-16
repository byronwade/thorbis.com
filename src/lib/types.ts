/**
 * Thorbis Business OS - Data Access Layer Types
 * 
 * Core types and interfaces for the DAL that handles graceful degradation
 * when database schema is incomplete.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { CapabilitiesManager } from '@thorbis/capabilities'

export interface BaseEntity {
  id: string
  business_id: string
  created_at: string
  updated_at: string
  meta?: Record<string, unknown> // Fallback storage for missing columns
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: Record<string, unknown>
  select?: string[]
  include?: string[] // Related entities to include
}

export interface QueryResult<T> {
  data: T[]
  count: number
  hasMore: boolean
  meta?: {
    fallbacks_used: string[]
    warnings: string[]
    computed_fields: string[]
  }
}

export interface WriteResult<T> {
  data: T
  warnings?: string[]
  fallbacks_used?: string[]
}

export interface DalContext {
  business_id: string
  user_id?: string
  role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner'
  scopes: string[]
  audit_context?: {
    action: string
    source: 'ui' | 'api' | 'tool'
    session_id?: string
    ip_address?: string
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface DalError extends Error {
  code: string
  field?: string
  context?: Record<string, unknown>
  recoverable: boolean
  suggested_action?: string
}

export abstract class BaseDal<T extends BaseEntity> {
  protected supabase: SupabaseClient
  protected capabilities: CapabilitiesManager
  protected table: string
  protected schema: string = 'public'

  constructor(
    supabase: SupabaseClient,
    capabilities: CapabilitiesManager,
    table: string
  ) {
    this.supabase = supabase
    this.capabilities = capabilities
    this.table = table
  }

  /**
   * Create a new entity with fallback to meta storage
   */
  abstract create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    context: DalContext
  ): Promise<WriteResult<T>>

  /**
   * Update an entity by ID
   */
  abstract update(
    id: string,
    data: Partial<T>,
    context: DalContext
  ): Promise<WriteResult<T>>

  /**
   * Get entity by ID
   */
  abstract getById(
    id: string,
    context: DalContext,
    options?: Partial<QueryOptions>
  ): Promise<T | null>

  /**
   * List entities with filtering and pagination
   */
  abstract list(
    context: DalContext,
    options?: QueryOptions
  ): Promise<QueryResult<T>>

  /**
   * Soft delete an entity (move to meta.deleted_at)
   */
  abstract softDelete(
    id: string,
    context: DalContext
  ): Promise<WriteResult<T>>

  /**
   * Search entities using text search
   */
  abstract search(
    query: string,
    context: DalContext,
    options?: QueryOptions
  ): Promise<QueryResult<T>>

  /**
   * Check if user has permission for operation
   */
  protected async checkPermission(
    context: DalContext,
    operation: 'select' | 'insert' | 'update' | 'delete',
    entity_id?: string
  ): Promise<boolean> {
    const capability = await this.capabilities.checkCapability({
      table: this.table,
      permission: operation
    })

    if (!capability.available) {
      return false
    }

    // Additional role-based checks
    if (operation === 'delete' && !['owner', 'manager'].includes(context.role)) {
      return false
    }

    return true
  }

  /**
   * Validate entity data against schema and business rules
   */
  protected abstract validateEntity(
    data: Partial<T>,
    context: DalContext,
    isUpdate?: boolean
  ): Promise<ValidationError[]>

  /**
   * Apply tenant isolation filter
   */
  protected applyTenantFilter(query: unknown, context: DalContext): unknown {
    return query.eq('business_id', context.business_id)
  }

  /**
   * Handle missing columns by storing in meta field
   */
  protected async handleMissingColumns(
    data: Record<string, unknown>,
    context: DalContext
  ): Promise<{ core: Record<string, unknown>, meta: Record<string, unknown>, warnings: string[] }> {
    const tableCapability = await this.capabilities.checkCapability({
      table: this.table
    })

    const core: Record<string, unknown> = {}
    const meta: Record<string, unknown> = {}
    const warnings: string[] = []

    if (!tableCapability.available) {
      // Entire table missing - everything goes to meta
      return {
        core: { business_id: context.business_id },
        meta: data,
        warnings: [`Table ${this.table} not available, storing all data in meta']
      }
    }

    // Check each field
    for (const [key, value] of Object.entries(data)) {
      const columnCapability = await this.capabilities.checkCapability({
        table: this.table,
        column: key
      })

      if (columnCapability.available) {
        core[key] = value
      } else {
        meta[key] = value
        warnings.push('Column ${this.table}.${key} not available, stored in meta')
      }
    }

    return { core, meta, warnings }
  }

  /**
   * Merge meta fields back into entity for reads
   */
  protected mergeMetaFields(entity: unknown): unknown {
    if (entity.meta && typeof entity.meta === 'object') {
      return {
        ...entity,
        ...entity.meta,
        meta: entity.meta // Keep original meta for transparency
      }
    }
    return entity
  }

  /**
   * Generate audit trail entry
   */
  protected async generateAuditEntry(
    action: string,
    entity_id: string, before: unknown,
    after: unknown,
    context: DalContext
  ): Promise<{
    action: string
    table_name: string
    entity_id: string
    business_id: string
    user_id?: string
    before_data?: any
    after_data?: any
    diff?: any
    source: string
    session_id?: string
    ip_address?: string
    created_at: string
  }> {
    return {
      action,
      table_name: this.table,
      entity_id,
      business_id: context.business_id,
      user_id: context.user_id,
      before_data: before,
      after_data: after,
      diff: this.computeDiff(before, after),
      source: context.audit_context?.source || 'unknown',
      session_id: context.audit_context?.session_id,
      ip_address: context.audit_context?.ip_address,
      created_at: new Date().toISOString()
    }
  }

  private computeDiff(before: unknown, after: unknown): unknown {
    if (!before && !after) return null
    if (!before) return { added: after }
    if (!after) return { removed: before }

    const diff: unknown = {}
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

    for (const key of allKeys) {
      if (before[key] !== after[key]) {
        diff[key] = { from: before[key], to: after[key] }
      }
    }

    return Object.keys(diff).length > 0 ? diff : null
  }
}
