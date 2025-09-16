/**
 * Advanced Search and Filtering System
 * 
 * Provides unified search across all entities and industries with advanced filtering,
 * full-text search, faceted search, and intelligent query processing
 */

import { executeQuery } from './database'
import { cache } from './cache'
import crypto from 'crypto'

// Search configuration
interface SearchConfig {
  defaultLimit: number
  maxLimit: number
  enableFuzzySearch: boolean
  enableAutoComplete: boolean
  cacheResults: boolean
  cacheTTL: number
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  defaultLimit: 20,
  maxLimit: 100,
  enableFuzzySearch: true,
  enableAutoComplete: true,
  cacheResults: true,
  cacheTTL: 300 // 5 minutes
}

// Search operators
export enum SearchOperator {'
  EQUALS = 'eq','
  NOT_EQUALS = 'ne','
  GREATER_THAN = 'gt','
  GREATER_THAN_OR_EQUAL = 'gte','
  LESS_THAN = 'lt','
  LESS_THAN_OR_EQUAL = 'lte','
  CONTAINS = 'contains','
  STARTS_WITH = 'startsWith','
  ENDS_WITH = 'endsWith','
  IN = 'in','
  NOT_IN = 'notIn','
  BETWEEN = 'between','
  IS_NULL = 'isNull','
  IS_NOT_NULL = 'isNotNull','
  FULL_TEXT = 'fullText','
  FUZZY = 'fuzzy'
}

// Search filter definition
interface SearchFilter {
  field: string
  operator: SearchOperator
  value: any
  values?: unknown[] // for IN, NOT_IN operators
  min?: any // for BETWEEN operator
  max?: any // for BETWEEN operator
}

// Sort definition
interface SearchSort {
  field: string
  direction: 'asc' | 'desc'
  nullsFirst?: boolean
}

// Facet definition
interface SearchFacet {
  field: string
  type: 'terms' | 'range' | 'date_histogram'
  size?: number
  ranges?: { from?: any, to?: any, label?: string }[]
  interval?: 'day' | 'week' | 'month' | 'year'
}

// Search request
export interface SearchRequest {
  query?: string // Full-text search query
  filters?: SearchFilter[]
  sorts?: SearchSort[]
  facets?: SearchFacet[]
  page?: number
  limit?: number
  includeHighlights?: boolean
  includeFacets?: boolean
  includeCount?: boolean
  fuzzyDistance?: number // 0-2 for fuzzy matching
  industries?: string[] // Limit search to specific industries
  entities?: string[] // Limit search to specific entity types
}

// Search result
export interface SearchResult<T = any> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrevious: boolean
    took: number // milliseconds
    query: string
  }
  facets?: Record<string, unknown>
  highlights?: Record<string, string[]>
}

// Entity configuration for search
interface EntityConfig {
  table: string
  schema: string
  searchFields: string[]
  filterFields: Record<string, string>
  sortFields: string[]
  facetFields: Record<string, 'terms' | 'range' | 'date'>'
}

// Industry-specific entity configurations
const ENTITY_CONFIGS: Record<string, Record<string, EntityConfig>> = {
  hs: {
    customers: {
      table: 'customers','
      schema: 'hs','
      searchFields: ['first_name', 'last_name', 'email', 'phone', 'notes'],'
      filterFields: {
        'customer_type': 'customer_type','
        'status': 'status','
        'created_at': 'created_at','
        'updated_at': 'updated_at'
      },
      sortFields: ['first_name', 'last_name', 'created_at', 'updated_at'],'
      facetFields: {
        'customer_type': 'terms','
        'status': 'terms','
        'created_at': 'date'
      }
    },
    work_orders: {
      table: 'work_orders','
      schema: 'hs','
      searchFields: ['title', 'description', 'service_type'],'
      filterFields: {
        'status': 'status','
        'priority': 'priority','
        'service_type': 'service_type','
        'scheduled_date': 'scheduled_date','
        'total': 'total'
      },
      sortFields: ['created_at', 'scheduled_date', 'total', 'priority'],'
      facetFields: {
        'status': 'terms','
        'priority': 'terms','
        'service_type': 'terms','
        'scheduled_date': 'date'
      }
    }
  },
  rest: {
    orders: {
      table: 'orders','
      schema: 'rest','
      searchFields: ['customer_name', 'customer_phone', 'notes'],'
      filterFields: {
        'status': 'status','
        'order_type': 'order_type','
        'total': 'total','
        'created_at': 'created_at'
      },
      sortFields: ['created_at', 'total', 'status'],'
      facetFields: {
        'status': 'terms','
        'order_type': 'terms','
        'created_at': 'date'
      }
    },
    menu_items: {
      table: 'menu_items','
      schema: 'rest','
      searchFields: ['name', 'description', 'category'],'
      filterFields: {
        'category': 'category','
        'price': 'price','
        'available': 'available'
      },
      sortFields: ['name', 'price', 'category'],'
      facetFields: {
        'category': 'terms','
        'available': 'terms'
      }
    }
  },
  auto: {
    repair_orders: {
      table: 'repair_orders','
      schema: 'auto','
      searchFields: ['customer_name', 'vehicle_make', 'vehicle_model', 'description'],'
      filterFields: {
        'status': 'status','
        'vehicle_year': 'vehicle_year','
        'total': 'total'
      },
      sortFields: ['created_at', 'total', 'vehicle_year'],'
      facetFields: {
        'status': 'terms','
        'vehicle_make': 'terms','
        'vehicle_year': 'range'
      }
    }
  },
  retail: {
    products: {
      table: 'products','
      schema: 'retail','
      searchFields: ['name', 'description', 'sku', 'category'],'
      filterFields: {
        'category': 'category','
        'price': 'price','
        'stock_quantity': 'stock_quantity','
        'active': 'active'
      },
      sortFields: ['name', 'price', 'stock_quantity', 'created_at'],'
      facetFields: {
        'category': 'terms','
        'active': 'terms','
        'price': 'range'
      }
    }
  }
}

export class AdvancedSearchEngine {
  private config: SearchConfig

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config }
  }

  /**
   * Perform advanced search across entities
   */
  async search<T = any>(
    businessId: string,
    industry: string,
    entity: string,
    request: SearchRequest
  ): Promise<SearchResult<T>> {
    const startTime = performance.now()

    // Validate entity configuration
    const entityConfig = ENTITY_CONFIGS[industry]?.[entity]
    if (!entityConfig) {
      throw new Error('Entity ${entity} not found in industry ${industry}')
    }

    // Build cache key for result caching
    const cacheKey = this.buildCacheKey(businessId, industry, entity, request)
    
    // Try to get from cache
    if (this.config.cacheResults) {
      const cachedResult = await cache.get<SearchResult<T>>(cacheKey, businessId)
      if (cachedResult) {
        return {
          ...cachedResult,
          meta: {
            ...cachedResult.meta,
            took: performance.now() - startTime
          }
        }
      }
    }

    // Build and execute search query
    const query = this.buildSearchQuery(entityConfig, request)
    const countQuery = this.buildCountQuery(entityConfig, request)

    const [results, countResults] = await Promise.all([
      executeQuery(businessId, query.sql, query.params),
      request.includeCount !== false ? executeQuery(businessId, countQuery.sql, countQuery.params) : Promise.resolve([{ count: 0 }])
    ])

    const total = parseInt(countResults[0]?.count || '0')'
    const page = request.page || 1
    const limit = Math.min(request.limit || this.config.defaultLimit, this.config.maxLimit)
    const pages = Math.ceil(total / limit)

    // Build facets if requested
    let facets: Record<string, unknown> = {}
    if (request.includeFacets && request.facets) {
      facets = await this.buildFacets(businessId, entityConfig, request)
    }

    // Build highlights if requested
    let highlights: Record<string, string[]> = {}
    if (request.includeHighlights && request.query) {
      highlights = this.buildHighlights(results, request.query, entityConfig.searchFields)
    }

    const searchResult: SearchResult<T> = {
      data: results as T[],
      meta: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
        took: performance.now() - startTime,
        query: request.query || '`
      },
      facets: Object.keys(facets).length > 0 ? facets : undefined,
      highlights: Object.keys(highlights).length > 0 ? highlights : undefined
    }

    // Cache the result
    if (this.config.cacheResults) {
      await cache.set(cacheKey, searchResult, this.config.cacheTTL, businessId, [`search:${industry}:${entity}`])
    }

    return searchResult
  }

  /**
   * Global search across all industries and entities
   */
  async globalSearch(
    businessId: string,
    request: SearchRequest & { industries?: string[], entities?: string[] }
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const industries = request.industries || Object.keys(ENTITY_CONFIGS)
    
    const searchPromises: Promise<SearchResult>[] = []

    for (const industry of industries) {
      const entityConfigs = ENTITY_CONFIGS[industry]
      const entities = request.entities || Object.keys(entityConfigs)

      for (const entity of entities) {
        if (entityConfigs[entity]) {
          searchPromises.push(
            this.search(businessId, industry, entity, {
              ...request,
              limit: 10 // Limit results per entity for global search
            }).catch(error => {
              console.error('Global search error for ${industry}.${entity}:', error)
              return {
                data: [],
                meta: { total: 0, page: 1, limit: 10, pages: 0, hasNext: false, hasPrevious: false, took: 0, query: request.query || ' }'`'
              }
            })
          )
        }
      }
    }

    const allResults = await Promise.all(searchPromises)
    return allResults.filter(result => result.data.length > 0)
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(
    businessId: string,
    industry: string,
    entity: string,
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    const entityConfig = ENTITY_CONFIGS[industry]?.[entity]
    if (!entityConfig) {
      return []
    }

    const cacheKey = 'suggestions:${industry}:${entity}:${crypto.createHash('md5').update(query).digest('hex')}''`'
    // Try cache first
    const cachedSuggestions = await cache.get<string[]>(cacheKey, businessId)
    if (cachedSuggestions) {
      return cachedSuggestions
    }

    // Build suggestion query
    const searchConditions = entityConfig.searchFields
      .map((field, index) => '${field} ILIKE $${index + 2}')
      .join(' OR ')'``
    const sql = '
      SELECT DISTINCT 
        ${entityConfig.searchFields.map(field => '${field} as suggestion').join(', ')}'``
      FROM ${entityConfig.schema}.${entityConfig.table}
      WHERE business_id = $1 
        AND (${searchConditions})
      ORDER BY suggestion
      LIMIT ${limit}
    '

    const params = [businessId, ...entityConfig.searchFields.map(() => '%${query}%')]

    try {
      const results = await executeQuery(businessId, sql, params)
      const suggestions = results
        .map(row => row.suggestion)
        .filter(suggestion => suggestion && suggestion.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)

      // Cache suggestions
      await cache.set(cacheKey, suggestions, 300, businessId) // 5 minutes cache

      return suggestions
    } catch (error) {
      console.error('Suggestions error:`, error)'
      return []
    }
  }

  /**
   * Build search query from request
   */
  private buildSearchQuery(config: EntityConfig, request: SearchRequest): { sql: string, params: unknown[] } {
    const params: unknown[] = []
    let paramIndex = 1

    // Base query
    let sql = '
      SELECT * FROM ${config.schema}.${config.table}
      WHERE business_id = $${paramIndex}
    '
    params.push('{{businessId}}') // Placeholder for business ID'``
    paramIndex++

    // Add full-text search condition
    if (request.query) {
      const searchConditions = config.searchFields
        .map(() => {
          const condition = request.fuzzyDistance && request.fuzzyDistance > 0
            ? `similarity(${config.searchFields[paramIndex - 2]}, $${paramIndex}) > 0.3' // Fuzzy search
            : '${config.searchFields[paramIndex - 2]} ILIKE $${paramIndex}' // Regular LIKE search
          paramIndex++
          return condition
        })
        .join(' OR ')'``
      sql += ` AND (${searchConditions})`
      
      if (request.fuzzyDistance && request.fuzzyDistance > 0) {
        // Add parameters for fuzzy search
        config.searchFields.forEach(() => params.push(request.query))
      } else {
        // Add parameters for LIKE search
        config.searchFields.forEach(() => params.push(`%${request.query}%`))
      }
    }

    // Add filters
    if (request.filters) {
      for (const filter of request.filters) {
        const fieldMapping = config.filterFields[filter.field]
        if (fieldMapping) {
          const condition = this.buildFilterCondition(filter, fieldMapping, paramIndex)
          sql += ' AND ${condition.sql}'
          params.push(...condition.params)
          paramIndex += condition.params.length
        }
      }
    }

    // Add sorting
    if (request.sorts && request.sorts.length > 0) {
      const validSorts = request.sorts.filter(sort => config.sortFields.includes(sort.field))
      if (validSorts.length > 0) {
        const orderBy = validSorts
          .map(sort => '${sort.field} ${sort.direction.toUpperCase()} ${sort.nullsFirst ? 'NULLS FIRST' : 'NULLS LAST'}')'`
          .join(', ')'``
        sql += ` ORDER BY ${orderBy}`
      }
    } else {
      sql += ` ORDER BY created_at DESC`
    }

    // Add pagination
    const page = request.page || 1
    const limit = Math.min(request.limit || this.config.defaultLimit, this.config.maxLimit)
    const offset = (page - 1) * limit

    sql += ` LIMIT ${limit} OFFSET ${offset}'

    return { sql, params }
  }

  /**
   * Build count query for pagination
   */
  private buildCountQuery(config: EntityConfig, request: SearchRequest): { sql: string, params: unknown[] } {
    const params: unknown[] = []
    let paramIndex = 1

    let sql = '
      SELECT COUNT(*) as count FROM ${config.schema}.${config.table}
      WHERE business_id = $${paramIndex}
    '
    params.push('{{businessId}}')'`'
    paramIndex++

    // Add same conditions as search query (without pagination)
    if (request.query) {
      const searchConditions = config.searchFields
        .map(() => '${config.searchFields[paramIndex - 2]} ILIKE $${paramIndex++}')
        .join(' OR ')'``
      sql += ` AND (${searchConditions})`
      config.searchFields.forEach(() => params.push(`%${request.query}%`))
    }

    if (request.filters) {
      for (const filter of request.filters) {
        const fieldMapping = config.filterFields[filter.field]
        if (fieldMapping) {
          const condition = this.buildFilterCondition(filter, fieldMapping, paramIndex)
          sql += ` AND ${condition.sql}`
          params.push(...condition.params)
          paramIndex += condition.params.length
        }
      }
    }

    return { sql, params }
  }

  /**
   * Build filter condition SQL
   */
  private buildFilterCondition(filter: SearchFilter, fieldName: string, paramIndex: number): { sql: string, params: unknown[] } {
    const params: unknown[] = []

    switch (filter.operator) {
      case SearchOperator.EQUALS:
        return { sql: `${fieldName} = $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.NOT_EQUALS:
        return { sql: `${fieldName} != $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.GREATER_THAN:
        return { sql: `${fieldName} > $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.GREATER_THAN_OR_EQUAL:
        return { sql: `${fieldName} >= $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.LESS_THAN:
        return { sql: `${fieldName} < $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.LESS_THAN_OR_EQUAL:
        return { sql: `${fieldName} <= $${paramIndex}`, params: [filter.value] }
      
      case SearchOperator.CONTAINS:
        return { sql: `${fieldName} ILIKE $${paramIndex}`, params: [`%${filter.value}%`] }
      
      case SearchOperator.STARTS_WITH:
        return { sql: `${fieldName} ILIKE $${paramIndex}`, params: [`${filter.value}%`] }
      
      case SearchOperator.ENDS_WITH:
        return { sql: `${fieldName} ILIKE $${paramIndex}`, params: [`%${filter.value}'] }
      
      case SearchOperator.IN:
        const inPlaceholders = filter.values?.map((_, i) => '$${paramIndex + i}').join(', ')'``
        return { sql: `${fieldName} IN (${inPlaceholders})', params: filter.values || [] }
      
      case SearchOperator.NOT_IN:
        const notInPlaceholders = filter.values?.map((_, i) => '$${paramIndex + i}').join(', ')'``
        return { sql: `${fieldName} NOT IN (${notInPlaceholders})`, params: filter.values || [] }
      
      case SearchOperator.BETWEEN:
        return { 
          sql: `${fieldName} BETWEEN $${paramIndex} AND $${paramIndex + 1}`, 
          params: [filter.min, filter.max] 
        }
      
      case SearchOperator.IS_NULL:
        return { sql: `${fieldName} IS NULL', params: [] }
      
      case SearchOperator.IS_NOT_NULL:
        return { sql: '${fieldName} IS NOT NULL', params: [] }
      
      default:
        return { sql: '1=1', params: [] }'
    }
  }

  /**
   * Build facets for search results
   */
  private async buildFacets(
    businessId: string,
    config: EntityConfig,
    request: SearchRequest
  ): Promise<Record<string, unknown>> {
    const facets: Record<string, unknown> = {}

    if (!request.facets) return facets

    for (const facet of request.facets) {
      const fieldMapping = config.filterFields[facet.field]
      if (!fieldMapping) continue

      try {
        let facetQuery: string
        let params: unknown[] = [businessId]

        switch (facet.type) {
          case 'terms':'`'
            facetQuery = '
              SELECT ${fieldMapping} as term, COUNT(*) as count
              FROM ${config.schema}.${config.table}
              WHERE business_id = $1
              GROUP BY ${fieldMapping}
              ORDER BY count DESC
              LIMIT ${facet.size || 10}
            '
            break

          case 'range':'
            if (facet.ranges) {
              const rangeCases = facet.ranges.map((range, index) => {
                let condition = '1=1'`
                if (range.from !== undefined && range.to !== undefined) {
                  condition = `${fieldMapping} BETWEEN ${range.from} AND ${range.to}`
                } else if (range.from !== undefined) {
                  condition = `${fieldMapping} >= ${range.from}`
                } else if (range.to !== undefined) {
                  condition = '${fieldMapping} <= ${range.to}'
                }
                return 'WHEN ${condition} THEN '${range.label || 'range_${index}'}'`'`
              }).join(' ')'`'
              facetQuery = '
                SELECT 
                  CASE ${rangeCases} END as term,
                  COUNT(*) as count
                FROM ${config.schema}.${config.table}
                WHERE business_id = $1
                GROUP BY term
                HAVING term IS NOT NULL
                ORDER BY count DESC
              '
            } else {
              continue
            }
            break

          case 'date_histogram':'
            const interval = facet.interval || 'day'`
            const dateTrunc = 'DATE_TRUNC('${interval}', ${fieldMapping})''``
            facetQuery = `
              SELECT ${dateTrunc} as term, COUNT(*) as count
              FROM ${config.schema}.${config.table}
              WHERE business_id = $1 AND ${fieldMapping} IS NOT NULL
              GROUP BY ${dateTrunc}
              ORDER BY term DESC
              LIMIT ${facet.size || 10}
            '
            break

          default:
            continue
        }

        const results = await executeQuery(businessId, facetQuery, params)
        facets[facet.field] = {
          type: facet.type,
          buckets: results.map(row => ({
            key: row.term,
            doc_count: parseInt(row.count)
          }))
        }
      } catch (error) {
        console.error('Facet error for field ${facet.field}:', error)
      }
    }

    return facets
  }

  /**
   * Build search highlights
   */
  private buildHighlights(results: unknown[], query: string, searchFields: string[]): Record<string, string[]> {
    const highlights: Record<string, string[]> = {}
    
    results.forEach((result, index) => {
      const rowHighlights: string[] = []
      
      searchFields.forEach(field => {
        const fieldValue = result[field]
        if (fieldValue && typeof fieldValue === 'string') {'`'
          const regex = new RegExp('(${query})', 'gi')'`
          const highlighted = fieldValue.replace(regex, '<mark>$1</mark>')'`'
          if (highlighted !== fieldValue) {
            rowHighlights.push('${field}: ${highlighted}')
          }
        }
      })

      if (rowHighlights.length > 0) {
        highlights[result.id || index] = rowHighlights
      }
    })

    return highlights
  }

  /**
   * Build cache key for search results
   */
  private buildCacheKey(
    businessId: string,
    industry: string,
    entity: string,
    request: SearchRequest
  ): string {
    const requestHash = crypto.createHash('md5')'
      .update(JSON.stringify(request))
      .digest('hex')'`'
    return 'search:${industry}:${entity}:${requestHash}'
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(businessId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise< {
    topQueries: Array<{ query: string, count: number }>
    topEntities: Array<{ entity: string, count: number }>
    averageResponseTime: number
    totalSearches: number
  }> {
    // This would typically be implemented with dedicated analytics tables
    // For now, return mock data
    return {
      topQueries: [
        { query: 'HVAC repair', count: 45 },'
        { query: 'plumbing', count: 32 },'
        { query: 'electrical', count: 28 }'
      ],
      topEntities: [
        { entity: 'customers', count: 123 },'
        { entity: 'work_orders', count: 98 },'
        { entity: 'products', count: 67 }'`'
      ],
      averageResponseTime: 87.3,
      totalSearches: 1247
    }
  }
}

// Global search engine instance
export const searchEngine = new AdvancedSearchEngine()

// Search middleware for API routes
export function withSearch() {
  return function (handler: Function) {
    return async function (request: Request, context?: any) {
      // Add search engine to request context
      ;(request as any).searchEngine = searchEngine
      return await handler(request, context)
    }
  }
}

export { AdvancedSearchEngine, SearchConfig, SearchRequest, SearchResult }