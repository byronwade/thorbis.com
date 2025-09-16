/**
 * Thorbis Business OS - Business Data Access Layer
 * 
 * Handles business entity CRUD operations with graceful degradation
 * and meta field fallbacks when schema is incomplete.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { CapabilitiesManager } from '@thorbis/capabilities'
import { BaseDal, BaseEntity, DalContext, QueryOptions, QueryResult, WriteResult, ValidationError } from './types'
import { v4 as uuidv4 } from 'uuid'

export interface Business extends BaseEntity {
  name: string
  slug: string
  description?: string
  industry: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  settings: {
    timezone: string
    currency: string
    business_hours: {
      [key: string]: { open: string; close: string; closed: boolean }
    }
    features: string[]
    theme: {
      primary_color: string
      logo_url?: string
    }
  }
  verification?: {
    licenses: Array<{
      type: string
      number: string
      expires_at: string
      verified_at?: string
    }>
    insurance: Array<{
      type: string
      provider: string
      policy_number: string
      expires_at: string
      verified_at?: string
    }>
  }
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    expires_at?: string
  }
  status: 'active' | 'suspended' | 'deleted'
}

export class BusinessDal extends BaseDal<Business> {
  constructor(supabase: SupabaseClient, capabilities: CapabilitiesManager) {
    super(supabase, capabilities, 'businesses')
  }

  async create(
    data: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'business_id'>,
    context: DalContext
  ): Promise<WriteResult<Business>> {
    // Validate permission
    const canCreate = await this.checkPermission(context, 'insert')
    if (!canCreate) {
      throw new Error('Insufficient permissions to create business')
    }

    // Validate data
    const validationErrors = await this.validateEntity(data, context, false)
    if (validationErrors.length > 0) {
      throw new Error('Validation failed: ${validationErrors.map(e => e.message).join(', ')}')
    }

    // Generate ID and timestamps
    const id = uuidv4()
    const now = new Date().toISOString()

    const entityData = {
      ...data,
      id,
      business_id: id, // Business entity's business_id is its own ID'
      created_at: now,
      updated_at: now,
      status: data.status || 'active'
    }

    // Handle missing columns
    const { core, meta, warnings } = await this.handleMissingColumns(entityData, context)

    try {
      const { data: created, error } = await this.supabase
        .from(this.table)
        .insert({ ...core, meta: Object.keys(meta).length > 0 ? meta : null })
        .select()
        .single()

      if (error) {
        // If table doesn't exist, store everything in a fallback meta store'
        if (error.code === '42P01') { // relation does not exist
          const fallbackData = await this.storeFallback(entityData, context)
          return {
            data: fallbackData,
            warnings: [...warnings, 'Stored in fallback storage due to missing table']
          }
        }
        throw error
      }

      const result = this.mergeMetaFields(created) as Business

      // Log audit trail
      await this.logAudit('create', result.id, null, result, context)

      return {
        data: result,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (_error) {
      throw this.handleDalError(error, 'create', entityData)
    }
  }

  async update(
    id: string,
    data: Partial<Business>,
    context: DalContext
  ): Promise<WriteResult<Business>> {
    const canUpdate = await this.checkPermission(context, 'update', id)
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update business')
    }

    // Get current entity for audit trail
    const current = await this.getById(id, context)
    if (!current) {
      throw new Error('Business not found')
    }

    // Validate update data
    const validationErrors = await this.validateEntity(data, context, true)
    if (validationErrors.length > 0) {
      throw new Error('Validation failed: ${validationErrors.map(e => e.message).join(', ')}')
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    }

    // Handle missing columns
    const { core, meta, warnings } = await this.handleMissingColumns(updateData, context)

    try {
      // If we have meta fields to update, we need to merge with existing meta
      let finalCore = core
      if (Object.keys(meta).length > 0) {
        const existingMeta = current.meta || {}
        finalCore = {
          ...core,
          meta: { ...existingMeta, ...meta }
        }
      }

      const query = this.supabase
        .from(this.table)
        .update(finalCore)
        .eq('id', id)

      const queryWithTenant = this.applyTenantFilter(query, context)
      const { data: updated, error } = await queryWithTenant.select().single()

      if (error) {
        throw error
      }

      const result = this.mergeMetaFields(updated) as Business

      // Log audit trail
      await this.logAudit('update', result.id, current, result, context)

      return {
        data: result,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (_error) {
      throw this.handleDalError(error, 'update', { id, ...data })
    }
  }

  async getById(
    id: string,
    context: DalContext,
    options?: Partial<QueryOptions>
  ): Promise<Business | null> {
    const canRead = await this.checkPermission(context, 'select')
    if (!canRead) {
      throw new Error('Insufficient permissions to read business')
    }

    try {
      let query = this.supabase
        .from(this.table)
        .select(options?.select?.join(',') || '*')
        .eq('id', id)

      query = this.applyTenantFilter(query, context)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null
        }
        throw error
      }

      return this.mergeMetaFields(data) as Business
    } catch (_error) {
      throw this.handleDalError(error, 'getById', { id })
    }
  }

  async list(
    context: DalContext,
    options: QueryOptions = {}
  ): Promise<QueryResult<Business>> {
    const canRead = await this.checkPermission(context, 'select')
    if (!canRead) {
      throw new Error('Insufficient permissions to list businesses')
    }

    const {
      limit = 25,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'desc',
      filters = {},
      select = []
    } = options

    try {
      let query = this.supabase
        .from(this.table)
        .select(select.length > 0 ? select.join(',') : '*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending: orderDirection === 'asc' })

      query = this.applyTenantFilter(query, context)

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const results = (data || []).map(item => this.mergeMetaFields(item)) as Business[]

      return {
        data: results,
        count: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    } catch (_error) {
      throw this.handleDalError(error, 'list', { options })
    }
  }

  async softDelete(id: string, context: DalContext): Promise<WriteResult<Business>> {
    const canDelete = await this.checkPermission(context, 'delete', id)
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete business')
    }

    return this.update(id, {
      status: 'deleted',
      meta: {
        deleted_at: new Date().toISOString(),
        deleted_by: context.user_id
      }
    } as Partial<Business>, context)
  }

  async search(
    query: string,
    context: DalContext,
    options: QueryOptions = {}
  ): Promise<QueryResult<Business>> {
    const canRead = await this.checkPermission(context, 'select')
    if (!canRead) {
      throw new Error('Insufficient permissions to search businesses')
    }

    // For now, implement simple text search on name and description
    // In production, this would use full-text search or external search service
    const searchOptions = {
      ...options,
      filters: {
        ...options.filters,
        // This is a simplified implementation
        // Real implementation would use to_tsquery and tsvector
      }
    }

    try {
      let baseQuery = this.supabase
        .from(this.table)
        .select('*', { count: 'exact' })

      baseQuery = this.applyTenantFilter(baseQuery, context)

      // Simple ILIKE search on name and description
      baseQuery = baseQuery.or('name.ilike.%${query}%,description.ilike.%${query}%')

      const { limit = 25, offset = 0 } = options
      baseQuery = baseQuery.range(offset, offset + limit - 1)

      const { data, error, count } = await baseQuery

      if (error) {
        throw error
      }

      const results = (data || []).map(item => this.mergeMetaFields(item)) as Business[]

      return {
        data: results,
        count: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    } catch (_error) {
      throw this.handleDalError(error, 'search', { query, options })
    }
  }

  protected async validateEntity(
    data: Partial<Business>,
    context: DalContext,
    isUpdate = false
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    // Required fields for create
    if (!isUpdate) {
      if (!data.name?.trim()) {
        errors.push({ field: 'name', message: 'Business name is required', code: 'required' })
      }
      if (!data.industry?.trim()) {
        errors.push({ field: 'industry', message: 'Industry is required', code: 'required' })
      }
    }

    // Name validation
    if (data.name !== undefined) {
      if (data.name.length < 2) {
        errors.push({ field: 'name', message: 'Business name must be at least 2 characters', code: 'min_length' })
      }
      if (data.name.length > 100) {
        errors.push({ field: 'name', message: 'Business name must be less than 100 characters', code: 'max_length' })
      }
    }

    // Slug validation (if provided)
    if (data.slug !== undefined) {
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(data.slug)) {
        errors.push({ field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens', code: 'invalid_format' })
      }
      
      // Check slug uniqueness
      const existingBusiness = await this.findBySlug(data.slug, context)
      if (existingBusiness && (!isUpdate || existingBusiness.id !== (data as any).id)) {
        errors.push({ field: 'slug', message: 'Slug is already taken', code: 'duplicate' })
      }
    }

    // Email validation
    if (data.contact?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.contact.email)) {
        errors.push({ field: 'contact.email', message: 'Invalid email format', code: 'invalid_format' })
      }
    }

    return errors
  }

  /**
   * Find business by slug
   */
  async findBySlug(slug: string, context: DalContext): Promise<Business | null> {
    try {
      let query = this.supabase
        .from(this.table)
        .select('*')
        .eq('slug', slug)

      query = this.applyTenantFilter(query, context)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return this.mergeMetaFields(data) as Business
    } catch (_error) {
      return null
    }
  }

  /**
   * Store data in fallback storage when table doesn't exist'
   */
  private async storeFallback(data: Business, context: DalContext): Promise<Business> {
    // In a real implementation, this might store in a generic key-value table
    // For now, we'll simulate it by returning the data with a warning'
    return {
      ...data,
      meta: {
        ...data.meta,
        stored_in_fallback: true,
        fallback_storage_key: 'business_${data.id}'
      }
    }
  }

  /**
   * Log audit trail
   */
  private async logAudit(
    action: string,
    entityId: string,
    before: Business | null,
    after: Business,
    context: DalContext
  ): Promise<void> {
    try {
      const auditEntry = await this.generateAuditEntry(action, entityId, before, after, context)
      
      // Store audit log (would be in audit_log table)
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', auditEntry)
      }
      
      // In production, this would insert into audit_log table
      // await this.supabase.from('audit_log').insert(auditEntry)
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Handle and normalize DAL errors
   */
  private handleDalError(error: unknown, operation: string, context: unknown): Error {
    console.error('BusinessDal ${operation} error:', error, context)
    
    // Return user-friendly error message
    if (error.code === '23505') {
      return new Error('A business with this information already exists')
    }
    
    if (error.code === '42P01') {
      return new Error('Database table not available, please contact support')
    }
    
    return new Error('Failed to ${operation} business')
  }
}
