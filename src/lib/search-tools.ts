/**
 * Thorbis Business OS - Search Tools
 * 
 * Tools for entity search, vector search, and content discovery.
 * Integrates with DAL for structured data and RAG for semantic search.
 */

import { z } from 'zod'
import { BaseTool, ToolDefinition, ToolContext, ToolOutput, CommonSchemas } from './types'
import { BusinessDal } from '../dal/business-dal'
import { capabilitiesManager } from '../capabilities/manifest'
import { createClient } from '@supabase/supabase-js'

/**
 * SearchEntities tool - Search for business entities (customers, jobs, invoices, etc.)
 */
export class SearchEntitiesTool extends BaseTool {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  constructor() {
    const definition: ToolDefinition = {
      name: 'searchEntities',
      description: 'Search for business entities like customers, jobs, invoices, estimates, etc.',
      category: 'search',
      version: '1.0.0',
      
      input_schema: z.object({
        query: z.string().min(1).max(500).describe('Search query text'),
        entity_types: z.array(z.enum([
          'businesses', 'customers', 'jobs', 'appointments', 'estimates', 
          'invoices', 'payments', 'users', 'reviews', 'campaigns'
        ])).optional().describe('Specific entity types to search (searches all if not specified)'),
        filters: z.object({
          status: z.string().optional(),
          date_from: z.string().datetime().optional(),
          date_to: z.string().datetime().optional(),
          amount_min: z.number().optional(),
          amount_max: z.number().optional(),
          tags: z.array(z.string()).optional()
        }).optional(),
        limit: z.number().min(1).max(100).default(25).optional(),
        offset: z.number().min(0).default(0).optional(),
        sort_by: z.string().default('created_at').optional(),
        sort_direction: z.enum(['asc', 'desc']).default('desc').optional(),
        include_related: z.boolean().default(false).describe('Include related entity data'),
        highlight_matches: z.boolean().default(true).describe('Highlight search term matches')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        data: z.object({
          results: z.array(z.object({
            entity_type: z.string(),
            entity_id: z.string(),
            title: z.string(),
            description: z.string().optional(),
            score: z.number(),
            highlights: z.array(z.string()).optional(),
            entity_data: z.record(z.string(), z.any()),
            related_entities: z.array(z.object({
              type: z.string(),
              id: z.string(),
              title: z.string()
            })).optional(),
            last_updated: z.string()
          })),
          total_count: z.number(),
          search_time_ms: z.number(),
          query_suggestions: z.array(z.string()).optional()
        }),
        warnings: z.array(z.string()).optional(),
        metadata: z.object({
          fallbacks_used: z.array(z.string()).optional(),
          tables_searched: z.array(z.string()),
          execution_time_ms: z.number()
        }).optional()
      }),
      
      required_role: 'viewer',
      required_scopes: ['read:entities'],
      idempotent: true,
      supports_dry_run: true,
      requires_confirmation: false,
      max_execution_time_ms: 15000,
      
      examples: [
        {
          name: 'Search for customers',
          description: 'Find customers matching a name or company',
          input: {
            query: 'john smith plumbing',
            entity_types: ['customers'],
            limit: 10
          },
          expected_output: {
            success: true,
            data: {
              results: [
                {
                  entity_type: 'customers',
                  entity_id: '123e4567-e89b-12d3-a456-426614174000',
                  title: 'John Smith - Smith Plumbing LLC',
                  score: 0.95,
                  entity_data: { name: 'John Smith', company: 'Smith Plumbing LLC' }
                }
              ],
              total_count: 1,
              search_time_ms: 45
            }
          }
        }
      ]
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const startTime = Date.now()
    const warnings: string[] = []
    const tablesSearched: string[] = []
    const results: unknown[] = []

    try {
      // Determine which entity types to search
      const entityTypes = input.entity_types || [
        'businesses', 'customers', 'jobs', 'appointments', 
        'estimates', 'invoices', 'payments', 'reviews'
      ]

      // Search each entity type
      for (const entityType of entityTypes) {
        try {
          const entityResults = await this.searchEntityType(
            entityType,
            input.query,
            context,
            {
              filters: input.filters,
              limit: Math.floor(input.limit / entityTypes.length) + 5, // Distribute limit
              offset: input.offset || 0,
              sort_by: input.sort_by,
              sort_direction: input.sort_direction,
              highlight_matches: input.highlight_matches,
              include_related: input.include_related
            }
          )

          results.push(...entityResults.results)
          tablesSearched.push(entityType)

          if (entityResults.warnings) {
            warnings.push(...entityResults.warnings)
          }
        } catch (_error) {
          warnings.push('Failed to search ${entityType}: ${error instanceof Error ? error.message : 'Unknown error'}')
        }
      }

      // Sort results by relevance score
      results.sort((a, b) => b.score - a.score)

      // Apply final limit
      const finalResults = results.slice(0, input.limit || 25)

      // Generate query suggestions based on results
      const querySuggestions = this.generateQuerySuggestions(input.query, results)

      const searchTime = Date.now() - startTime

      return {
        success: true,
        data: {
          results: finalResults,
          total_count: results.length,
          search_time_ms: searchTime,
          query_suggestions: querySuggestions.length > 0 ? querySuggestions : undefined
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          fallbacks_used: warnings.filter(w => w.includes('fallback')),
          execution_time_ms: searchTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Search failed'
        },
        metadata: {
          execution_time_ms: Date.now() - startTime
        }
      }
    }
  }

  protected async executeDryRun(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const entityTypes = input.entity_types || [
      'businesses', 'customers', 'jobs', 'appointments', 
      'estimates', 'invoices', 'payments', 'reviews'
    ]

    return {
      success: true,
      data: {
        dry_run: true,
        would_search: {
          query: input.query,
          entity_types: entityTypes,
          filters: input.filters,
          limit: input.limit || 25
        },
        estimated_results: Math.floor(Math.random() * 50) + 10 // Simulated
      }
    }
  }

  private async searchEntityType(
    entityType: string,
    query: string,
    context: ToolContext, options: unknown): Promise<{ results: unknown[], warnings?: string[] }> {
    // Check if table exists using capabilities
    const capability = await capabilitiesManager.checkCapability({
      table: entityType
    })

    if (!capability.available) {
      return {
        results: [],
        warnings: ['Table ${entityType} not available, ${capability.fallback || 'skipping'}']
      }
    }

    const results: unknown[] = []
    const warnings: string[] = []

    try {
      // Build search query based on entity type
      let baseQuery = this.supabase
        .from(entityType)
        .select('*')
        .eq('business_id', context.business_id)

      // Apply text search - this is simplified, real implementation would use full-text search
      if (entityType === 'customers') {
        baseQuery = baseQuery.or('name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%')
      } else if (entityType === 'jobs') {
        baseQuery = baseQuery.or('title.ilike.%${query}%,description.ilike.%${query}%')
      } else if (entityType === 'invoices' || entityType === 'estimates`) {
        baseQuery = baseQuery.or(`notes.ilike.%${query}%,customer_name.ilike.%${query}%')
      } else {
        // Generic search on common fields
        baseQuery = baseQuery.or('name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%')
      }

      // Apply filters
      if (options.filters) {
        if (options.filters.status) {
          baseQuery = baseQuery.eq('status', options.filters.status)
        }
        if (options.filters.date_from) {
          baseQuery = baseQuery.gte('created_at', options.filters.date_from)
        }
        if (options.filters.date_to) {
          baseQuery = baseQuery.lte('created_at', options.filters.date_to)
        }
        if (options.filters.amount_min && ['invoices', 'estimates', 'payments'].includes(entityType)) {
          baseQuery = baseQuery.gte('amount', options.filters.amount_min)
        }
        if (options.filters.amount_max && ['invoices', 'estimates', 'payments'].includes(entityType)) {
          baseQuery = baseQuery.lte('amount', options.filters.amount_max)
        }
      }

      // Apply sorting
      if (options.sort_by) {
        baseQuery = baseQuery.order(options.sort_by, { 
          ascending: options.sort_direction === 'asc' 
        })
      } else {
        baseQuery = baseQuery.order('updated_at`, { ascending: false })
      }

      // Apply pagination
      baseQuery = baseQuery.range(options.offset || 0, (options.offset || 0) + (options.limit || 25) - 1)

      const { data, error } = await baseQuery

      if (error) {
        warnings.push('Search error for ${entityType}: ${error.message}')
        return { results, warnings }
      }

      // Transform results into standard format
      for (const item of data || []) {
        const result = {
          entity_type: entityType,
          entity_id: item.id,
          title: this.generateTitle(entityType, item),
          description: this.generateDescription(entityType, item),
          score: this.calculateRelevanceScore(query, item, entityType),
          highlights: options.highlight_matches ? this.generateHighlights(query, item) : undefined,
          entity_data: this.sanitizeEntityData(item),
          last_updated: item.updated_at || item.created_at,
          related_entities: options.include_related ? await this.getRelatedEntities(entityType, item.id, context) : undefined
        }

        results.push(result)
      }

    } catch (_error) {
      warnings.push('Failed to search ${entityType}: ${error instanceof Error ? error.message : 'Unknown error'}')
    }

    return { results, warnings }
  }

  private generateTitle(entityType: string, item: unknown): string {
    switch (entityType) {
      case 'customers':
        return item.company ? '${item.name} - ${item.company}' : item.name || item.email || 'Unnamed Customer'
      case 'jobs':
        return item.title || 'Job #${item.job_number || item.id?.slice(-8)}'
      case 'invoices':
        return 'Invoice #${item.invoice_number || item.id?.slice(-8)}'
      case 'estimates':
        return 'Estimate #${item.estimate_number || item.id?.slice(-8)}'
      case 'payments`:
        return 'Payment ${item.amount ? '$${item.amount}' : '} - ${item.method || 'Unknown'}'
      default:
        return item.name || item.title || '${entityType} #${item.id?.slice(-8)}'
    }
  }

  private generateDescription(entityType: string, item: unknown): string | undefined {
    switch (entityType) {
      case 'customers':
        const parts = []
        if (item.email) parts.push(item.email)
        if (item.phone) parts.push(item.phone)
        if (item.address) parts.push(item.address)
        return parts.join(' • ')
      case 'jobs':
        return item.description || item.notes
      case 'invoices':
      case 'estimates':
        return item.notes || 'Amount: $${item.total || item.amount || '0'}'
      default:
        return item.description || item.notes
    }
  }

  private calculateRelevanceScore(query: string, item: unknown, entityType: string): number {
    // Simplified relevance scoring - real implementation would be more sophisticated
    const searchableFields = this.getSearchableFields(entityType, item)
    const queryLower = query.toLowerCase()
    const score = 0

    for (const [field, value] of Object.entries(searchableFields)) {
      if (value && typeof value === 'string') {
        const valueLower = value.toLowerCase()
        if (valueLower.includes(queryLower)) {
          // Boost exact matches
          if (valueLower === queryLower) {
            score += 1.0
          } else if (valueLower.startsWith(queryLower)) {
            score += 0.8
          } else {
            score += 0.5
          }
        }
      }
    }

    // Normalize score
    return Math.min(score / Object.keys(searchableFields).length, 1.0)
  }

  private getSearchableFields(entityType: string, item: unknown): Record<string, unknown> {
    const commonFields = {
      name: item.name,
      title: item.title,
      description: item.description,
      notes: item.notes
    }

    switch (entityType) {
      case 'customers':
        return {
          ...commonFields,
          email: item.email,
          phone: item.phone,
          company: item.company,
          address: item.address
        }
      case 'jobs':
        return {
          ...commonFields,
          job_number: item.job_number,
          customer_name: item.customer_name
        }
      case 'invoices':
      case 'estimates':
        return {
          ...commonFields,
          invoice_number: item.invoice_number,
          estimate_number: item.estimate_number,
          customer_name: item.customer_name
        }
      default:
        return commonFields
    }
  }

  private generateHighlights(query: string, item: unknown): string[] {
    const highlights: string[] = []
    const queryLower = query.toLowerCase()
    
    // This is a simplified implementation
    // Real implementation would use proper text highlighting
    for (const [key, value] of Object.entries(item)) {
      if (value && typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
        const snippet = value.length > 100 ? value.substring(0, 100) + '...' : value
        highlights.push('${key}: ${snippet}')
      }
    }

    return highlights.slice(0, 3) // Limit to 3 highlights
  }

  private sanitizeEntityData(item: unknown): Record<string, unknown> {
    // Remove sensitive fields and internal metadata
    const sensitiveFields = ['password', 'token', 'secret', 'private_key']
    const sanitized = { ...item }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  private async getRelatedEntities(entityType: string, entityId: string, context: ToolContext): Promise<any[]> {
    // Simplified related entity lookup
    // Real implementation would have proper relationship mapping
    const related: unknown[] = []

    try {
      if (entityType === 'customers') {
        // Get related jobs and invoices
        const { data: jobs } = await this.supabase
          .from('jobs')
          .select('id, title')
          .eq('customer_id', entityId)
          .eq('business_id', context.business_id)
          .limit(3)

        if (jobs) {
          related.push(...jobs.map(job => ({
            type: 'jobs',
            id: job.id,
            title: job.title
          })))
        }
      }
    } catch (_error) {
      // Ignore errors for related entities - they're optional'
    }

    return related
  }

  private generateQuerySuggestions(query: string, results: unknown[]): string[] {
    // Generate query suggestions based on search results
    // This is a simplified implementation
    const suggestions: string[] = []
    
    if (results.length > 0) {
      // Suggest entity type filters if mixed results
      const entityTypes = [...new Set(results.map(r => r.entity_type))]
      if (entityTypes.length > 1) {
        suggestions.push('${query} in ${entityTypes[0]}')
      }

      // Suggest common fields from results
      const commonTitles = results
        .map(r => r.title.split(' ')[0])
        .filter((title, index, arr) => arr.indexOf(title) === index)
        .slice(0, 2)

      suggestions.push(...commonTitles.map(title => title))
    } else {
      // No results - suggest broader queries
      if (query.includes(' ')) {
        suggestions.push(query.split(' ')[0]) // First word only
      }
    }

    return suggestions.slice(0, 3)
  }
}

/**
 * GetEntityById tool - Get detailed information about a specific entity
 */
export class GetEntityByIdTool extends BaseTool {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  constructor() {
    const definition: ToolDefinition = {
      name: 'getEntityById',
      description: 'Get detailed information about a specific entity by ID',
      category: 'search',
      version: '1.0.0',
      
      input_schema: z.object({
        entity_type: z.enum([
          'businesses', 'customers', 'jobs', 'appointments', 'estimates', 
          'invoices', 'payments', 'users', 'reviews', 'campaigns'
        ]).describe('Type of entity to retrieve'),
        entity_id: CommonSchemas.EntityId,
        include_related: z.boolean().default(false).describe('Include related entity data'),
        include_history: z.boolean().default(false).describe('Include change history'),
        fields: z.array(z.string()).optional().describe('Specific fields to retrieve (all if not specified)')
      }),
      
      output_schema: z.object({
        success: z.boolean(),
        data: z.object({
          entity_type: z.string(),
          entity_id: z.string(),
          entity_data: z.record(z.string(), z.any()),
          related_entities: z.array(z.object({
            type: z.string(),
            id: z.string(),
            title: z.string(),
            relationship: z.string()
          })).optional(),
          change_history: z.array(z.object({
            changed_at: z.string(),
            changed_by: z.string(),
            action: z.string(),
            changes: z.record(z.string(), z.object({
              from: z.any(),
              to: z.any()
            }))
          })).optional(),
          metadata: z.object({
            last_updated: z.string(),
            created_at: z.string(),
            version: z.string().optional()
          })
        }).nullable(),
        warnings: z.array(z.string()).optional()
      }),
      
      required_role: 'viewer',
      required_scopes: ['read:entities'],
      idempotent: true,
      supports_dry_run: true,
      requires_confirmation: false,
      max_execution_time_ms: 10000
    }

    super(definition)
  }

  protected async executeInternal(input: unknown, context: ToolContext): Promise<ToolOutput> {
    const warnings: string[] = []

    try {
      // Check if entity type table exists
      const capability = await capabilitiesManager.checkCapability({
        table: input.entity_type
      })

      if (!capability.available) {
        return {
          success: false,
          error: {
            code: 'TABLE_UNAVAILABLE',
            message: 'Entity type ${input.entity_type} is not available',
            details: capability.warning
          }
        }
      }

      // Build query
      const selectFields = input.fields ? input.fields.join(',') : '*'
      const query = this.supabase
        .from(input.entity_type)
        .select(selectFields)
        .eq('id', input.entity_id)
        .eq('business_id', context.business_id)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: null // Entity not found
          }
        }
        throw error
      }

      const entityData = data as any
      const result: unknown = {
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        entity_data: entityData,
        metadata: {
          last_updated: entityData?.updated_at || entityData?.created_at,
          created_at: entityData?.created_at,
          version: entityData?.version
        }
      }

      // Get related entities if requested
      if (input.include_related) {
        try {
          result.related_entities = await this.getRelatedEntities(input.entity_type, input.entity_id, context)
        } catch (_error) {
          warnings.push('Failed to load related entities')
        }
      }

      // Get change history if requested
      if (input.include_history) {
        try {
          result.change_history = await this.getChangeHistory(input.entity_type, input.entity_id, context)
        } catch (_error) {
          warnings.push('Failed to load change history')
        }
      }

      return {
        success: true,
        data: result,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve entity'
        }
      }
    }
  }

  protected async executeDryRun(input: unknown, context: ToolContext): Promise<ToolOutput> {
    return {
      success: true,
      data: {
        dry_run: true,
        would_retrieve: {
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          include_related: input.include_related,
          include_history: input.include_history,
          fields: input.fields
        }
      }
    }
  }

  private async getRelatedEntities(entityType: string, entityId: string, context: ToolContext): Promise<any[]> {
    const related: unknown[] = []

    // This is a simplified implementation
    // Real implementation would have proper relationship definitions
    try {
      if (entityType === 'customers') {
        // Get jobs for this customer
        const { data: jobs } = await this.supabase
          .from('jobs')
          .select('id, title, status')
          .eq('customer_id', entityId)
          .eq('business_id', context.business_id)
          .limit(10)

        if (jobs) {
          related.push(...jobs.map(job => ({
            type: 'jobs',
            id: job.id,
            title: job.title,
            relationship: 'customer_jobs'
          })))
        }
      } else if (entityType === 'jobs') {
        // Get customer and related invoices/estimates
        const { data: job } = await this.supabase
          .from('jobs')
          .select('customer_id')
          .eq('id', entityId)
          .single()

        if (job?.customer_id) {
          const { data: customer } = await this.supabase
            .from('customers')
            .select('id, name')
            .eq('id', job.customer_id)
            .single()

          if (customer) {
            related.push({
              type: 'customers',
              id: customer.id,
              title: customer.name,
              relationship: 'job_customer'
            })
          }
        }
      }
    } catch (_error) {
      // Ignore errors for related entities - they're optional'
    }

    return related
  }

  private async getChangeHistory(entityType: string, entityId: string, context: ToolContext): Promise<any[]> {
    try {
      // This would query the audit log table
      const { data } = await this.supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', entityType)
        .eq('entity_id', entityId)
        .eq('business_id', context.business_id)
        .order('created_at', { ascending: false })
        .limit(20)

      return (data || []).map(entry => ({
        changed_at: entry.created_at,
        changed_by: entry.user_id,
        action: entry.action,
        changes: entry.diff || {}
      }))
    } catch (_error) {
      return [] // History is optional
    }
  }
}
