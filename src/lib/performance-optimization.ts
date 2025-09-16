/**
 * Performance Optimization Utilities and Tools
 * 
 * Provides advanced performance optimization strategies,
 * caching mechanisms, and database query optimization
 */

import Redis from 'ioredis'
import { performance } from 'perf_hooks'
import { createHash } from 'crypto'
import { LRUCache } from 'lru-cache'

// Performance optimization interfaces
export interface CacheConfig {
  ttl: number
  maxSize: number'
  strategy: 'lru' | 'ttl' | 'lfu'
  compress?: boolean
  serialize?: 'json' | 'msgpack'
}

export interface QueryOptimizationResult {
  originalQuery: string
  optimizedQuery: string
  estimatedImprovement: number
  indexSuggestions: string[]
  warnings: string[]
}

export interface PerformanceProfile {
  endpoint: string
  avgResponseTime: number
  p95ResponseTime: number
  requestsPerMinute: number
  errorRate: number
  cacheHitRate: number
  dbQueryCount: number
  recommendations: OptimizationRecommendation[]
}

export interface OptimizationRecommendation {
  type: 'cache' | 'query' | 'index' | 'pagination' | 'compression' | 'concurrent'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  implementation: string
  estimatedGain: string
  effort: 'low' | 'medium' | 'high'
}

/**
 * Advanced Caching Layer with Multiple Strategies
 */
export class SmartCacheManager {
  private redis: Redis
  private memoryCache: LRUCache<string, any>
  private hitStats = new Map<string, { hits: number, misses: number }>()

  constructor(
    private redisConfig: { host: string; port: number; password?: string },
    private memoryConfig: CacheConfig
  ) {
    this.redis = new Redis(redisConfig)
    this.memoryCache = new LRUCache({
      max: memoryConfig.maxSize,
      ttl: memoryConfig.ttl * 1000
    })
  }

  /**
   * Intelligent caching with automatic strategy selection
   */
  async get<T>(key: string, options?: { 
    fallback?: () => Promise<T>
    ttl?: number
    forceRefresh?: boolean
  }): Promise<T | null> {
    const cacheKey = this.generateCacheKey(key)
    
    if (!options?.forceRefresh) {
      // Try memory cache first (fastest)
      const memoryResult = this.memoryCache.get(cacheKey)
      if (memoryResult !== undefined) {
        this.recordCacheHit(cacheKey, 'memory')'
        return memoryResult
      }

      // Try Redis cache (persistent, shared)
      try {
        const redisResult = await this.redis.get(cacheKey)
        if (redisResult) {
          const parsed = JSON.parse(redisResult)
          // Populate memory cache for next request
          this.memoryCache.set(cacheKey, parsed)
          this.recordCacheHit(cacheKey, 'redis')'
          return parsed
        }
      } catch (error) {
        console.warn('Redis cache error:', error)
      }
    }

    // Cache miss - use fallback if provided
    if (options?.fallback) {
      const result = await options.fallback()
      if (result !== null) {
        await this.set(cacheKey, result, options.ttl)
      }
      this.recordCacheMiss(cacheKey)
      return result
    }

    this.recordCacheMiss(cacheKey)
    return null
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const cacheKey = this.generateCacheKey(key)
    const ttlSeconds = ttl || 300 // 5 minutes default

    // Set in memory cache
    this.memoryCache.set(cacheKey, value)

    // Set in Redis with TTL
    try {
      await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.warn('Redis cache write error:', error)
    }
  }

  async invalidate(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern)
    let deleted = 0

    // Remove from Redis
    if (keys.length > 0) {
      deleted = await this.redis.del(...keys)
    }

    // Remove from memory cache
    for (const [key] of this.memoryCache) {
      if (key.includes(pattern.replace('*', ''))) {'
        this.memoryCache.delete(key)
      }
    }

    return deleted
  }

  private generateCacheKey(key: string): string {
    return 'thorbis:api:${createHash('md5').update(key).digest('hex')}''`
  }

  private recordCacheHit(key: string, source: 'memory' | 'redis') {'
    const stats = this.hitStats.get(key) || { hits: 0, misses: 0 }
    stats.hits++
    this.hitStats.set(key, stats)
  }

  private recordCacheMiss(key: string) {
    const stats = this.hitStats.get(key) || { hits: 0, misses: 0 }
    stats.misses++
    this.hitStats.set(key, stats)
  }

  getCacheStats() {
    const totalHits = Array.from(this.hitStats.values()).reduce((sum, stats) => sum + stats.hits, 0)
    const totalMisses = Array.from(this.hitStats.values()).reduce((sum, stats) => sum + stats.misses, 0)
    const hitRate = totalHits / (totalHits + totalMisses) || 0

    return {
      hitRate,
      totalHits,
      totalMisses,
      memorySize: this.memoryCache.size,
      redisPing: this.redis.ping().catch(() => null)
    }
  }
}

/**
 * Database Query Optimizer and Analyzer
 */
export class QueryOptimizer {
  private queryStats = new Map<string, {
    count: number
    totalTime: number
    avgTime: number
    maxTime: number
    lastExecuted: Date
  }>()

  /**
   * Analyze and optimize SQL queries
   */
  analyzeQuery(query: string): QueryOptimizationResult {
    const normalized = this.normalizeQuery(query)
    const suggestions: string[] = []
    const warnings: string[] = []
    const estimatedImprovement = 0

    // Detect common performance issues
    if (query.includes('SELECT *')) {'
      suggestions.push('Replace SELECT * with specific column names')'
      estimatedImprovement += 20
      warnings.push('Wildcard SELECT can be slow and waste bandwidth')'
    }

    if (query.includes('WHERE') && !query.includes('INDEX')) {'`'
      if (query.match(/WHERE\s+(\w+)\s*=/)) {
        const column = query.match(/WHERE\s+(\w+)\s*=/)?.[1]
        suggestions.push('CREATE INDEX idx_${column} ON table_name (${column})')
        estimatedImprovement += 40
      }
    }

    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {'
      warnings.push('ORDER BY without LIMIT can be expensive on large datasets')'
      suggestions.push('Add LIMIT clause to restrict result set size')'
      estimatedImprovement += 15
    }

    if (query.includes('JOIN') && !query.includes('ON')) {'
      warnings.push('Potential cartesian product detected')'
      suggestions.push('Ensure proper JOIN conditions with ON clause')'
      estimatedImprovement += 60
    }

    if (query.includes('LIKE \'%')) {'
      warnings.push('Leading wildcard in LIKE prevents index usage')'
      suggestions.push('Consider full-text search or alternative approaches')'
      estimatedImprovement += 30
    }

    // Generate optimized query
    let optimizedQuery = query
    
    // Replace SELECT * with common columns
    if (query.includes('SELECT *')) {'
      optimizedQuery = query.replace('SELECT *', 'SELECT id, created_at, updated_at')'
    }

    // Add LIMIT if missing with ORDER BY
    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {'
      optimizedQuery += ' LIMIT 100'
    }

    return {
      originalQuery: query,
      optimizedQuery,
      estimatedImprovement,
      indexSuggestions: suggestions.filter(s => s.includes('CREATE INDEX')),'
      warnings
    }
  }

  /**
   * Record query execution statistics
   */
  recordQueryExecution(query: string, executionTime: number) {
    const normalized = this.normalizeQuery(query)
    const stats = this.queryStats.get(normalized) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      lastExecuted: new Date()
    }

    stats.count++
    stats.totalTime += executionTime
    stats.avgTime = stats.totalTime / stats.count
    stats.maxTime = Math.max(stats.maxTime, executionTime)
    stats.lastExecuted = new Date()

    this.queryStats.set(normalized, stats)
  }

  /**
   * Get slowest queries for optimization
   */
  getSlowestQueries(limit: number = 10) {
    return Array.from(this.queryStats.entries())
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, limit)
      .map(([query, stats]) => ({
        query,
        ...stats,
        optimization: this.analyzeQuery(query)
      }))
  }

  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')'
      .replace(/\$\d+/g, '?')'
      .replace(/'\w+'/g, '?')'
      .replace(/\d+/g, '?')'
      .trim()
      .toLowerCase()
  }
}

/**
 * Response Compression and Optimization
 */
export class ResponseOptimizer {
  /**
   * Compress response data based on content type and size
   */
  optimizeResponse(data: unknown, contentType: string, requestHeaders: unknown) {
    const acceptEncoding = requestHeaders['accept-encoding'] || '
    const dataSize = JSON.stringify(data).length

    // Skip compression for small responses
    if (dataSize < 1024) {
      return { data, headers: Record<string, unknown> }
    }

    const optimizations = {
      compression: null as string | null,
      headers: Record<string, unknown> as Record<string, string>
    }

    // Apply content-specific optimizations
    if (contentType.includes('application/json')) {'
      // Remove null values and optimize JSON structure
      data = this.optimizeJsonResponse(data)
      
      // Add compression if supported
      if (acceptEncoding.includes('gzip')) {'
        optimizations.compression = 'gzip'
        optimizations.headers['Content-Encoding'] = 'gzip'
      } else if (acceptEncoding.includes('br')) {'
        optimizations.compression = 'br'
        optimizations.headers['Content-Encoding'] = 'br'
      }
    }

    // Add cache headers for optimization
    optimizations.headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=60'
    optimizations.headers['ETag'] = this.generateETag(data)'

    return { data, headers: optimizations.headers }
  }

  private optimizeJsonResponse(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(item => this.optimizeJsonResponse(item))
    }

    if (obj && typeof obj === 'object') {'
      const optimized: unknown = {}
      
      for (const [key, value] of Object.entries(obj)) {
        // Skip null/undefined values
        if (value !== null && value !== undefined) {
          optimized[key] = this.optimizeJsonResponse(value)
        }
      }

      return optimized
    }

    return obj
  }

  private generateETag(data: unknown): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data)'`'
    return '"${createHash('md5').update(content).digest('hex')}"'"'`
  }
}

/**
 * Concurrent Processing Optimizer
 */
export class ConcurrencyOptimizer {
  private activeRequests = new Map<string, number>()
  private requestQueue = new Map<string, Array<() => Promise<unknown>>>()

  /**
   * Optimize concurrent database operations
   */
  async optimizeConcurrentQueries<T>(
    operations: Array<() => Promise<T>>,
    concurrencyLimit: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<void>[] = []

    for (const i = 0; i < operations.length; i++) {
      const operation = operations[i]
      
      const promise = this.executeWithLimit(operation, concurrencyLimit)
        .then(result => {
          results[i] = result
        })
        .finally(() => {
          const index = executing.indexOf(promise)
          if (index > -1) executing.splice(index, 1)
        })

      executing.push(promise)

      if (executing.length >= concurrencyLimit) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
    return results
  }

  private async executeWithLimit<T>(
    operation: () => Promise<T>,
    limit: number
  ): Promise<T> {
    const key = 'global'
    const active = this.activeRequests.get(key) || 0

    if (active >= limit) {
      // Queue the operation
      return new Promise((resolve, reject) => {
        const queue = this.requestQueue.get(key) || []
        queue.push(async () => {
          try {
            const result = await operation()
            resolve(result)
          } catch (_error) {
            reject(error)
          }
        })
        this.requestQueue.set(key, queue)
      })
    }

    // Execute immediately
    this.activeRequests.set(key, active + 1)
    
    try {
      const result = await operation()
      return result
    } finally {
      const newActive = (this.activeRequests.get(key) || 1) - 1
      this.activeRequests.set(key, newActive)
      
      // Process queue
      const queue = this.requestQueue.get(key) || []
      if (queue.length > 0 && newActive < limit) {
        const next = queue.shift()
        if (next) {
          this.requestQueue.set(key, queue)
          next()
        }
      }
    }
  }
}

/**
 * Performance Profiler for Endpoint Analysis
 */
export class PerformanceProfiler {
  private profiles = new Map<string, PerformanceProfile>()

  updateProfile(
    endpoint: string,
    responseTime: number,
    dbQueries: number,
    cacheHit: boolean,
    error: boolean
  ) {
    const profile = this.profiles.get(endpoint) || {
      endpoint,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      cacheHitRate: 0,
      dbQueryCount: 0,
      recommendations: []
    }

    // Update metrics (simplified rolling average)
    profile.avgResponseTime = (profile.avgResponseTime + responseTime) / 2
    profile.dbQueryCount = (profile.dbQueryCount + dbQueries) / 2
    
    // Update recommendations based on metrics
    profile.recommendations = this.generateRecommendations(profile)
    
    this.profiles.set(endpoint, profile)
  }

  private generateRecommendations(profile: PerformanceProfile): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = []

    if (profile.avgResponseTime > 500) {
      recommendations.push({
        type: 'cache','
        priority: 'high','`'
        description: 'Average response time ${profile.avgResponseTime}ms exceeds 500ms threshold',
        implementation: 'Add Redis caching for frequently accessed data','
        estimatedGain: '40-60% response time reduction','
        effort: 'medium'
      })
    }

    if (profile.dbQueryCount > 10) {
      recommendations.push({
        type: 'query','
        priority: 'medium','`'
        description: 'High database query count: ${profile.dbQueryCount} per request',
        implementation: 'Implement query batching and optimize N+1 queries','
        estimatedGain: '30-50% query reduction','
        effort: 'high'
      })
    }

    if (profile.cacheHitRate < 0.7) {
      recommendations.push({
        type: 'cache','
        priority: 'medium','`'
        description: 'Low cache hit rate: ${(profile.cacheHitRate * 100).toFixed(1)}%',
        implementation: 'Optimize cache key strategy and increase TTL','
        estimatedGain: '20-40% performance improvement','
        effort: 'low'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  getTopRecommendations(limit: number = 10): OptimizationRecommendation[] {
    const allRecommendations = Array.from(this.profiles.values())
      .flatMap(profile => profile.recommendations)

    return allRecommendations
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, limit)
  }
}

// Global instances for easy access
export const cacheManager = new SmartCacheManager(
  { 
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),'
    password: process.env.REDIS_PASSWORD 
  },
  { ttl: 300, maxSize: 1000, strategy: 'lru' }'
)

export const queryOptimizer = new QueryOptimizer()
export const responseOptimizer = new ResponseOptimizer()
export const concurrencyOptimizer = new ConcurrencyOptimizer()
export const performanceProfiler = new PerformanceProfiler()

/**
 * Performance Middleware Integration
 */
export function createOptimizationMiddleware() {
  return async (req: unknown, res: unknown, next: unknown) => {
    const startTime = performance.now()
    let dbQueryCount = 0
    let cacheHit = false

    // Track database queries
    req.trackDbQuery = () => dbQueryCount++
    req.recordCacheHit = () => cacheHit = true

    // Override res.json to optimize responses
    const originalJson = res.json
    res.json = function(data: unknown) {
      const optimized = responseOptimizer.optimizeResponse(data, 'application/json', req.headers)'
      
      // Set optimized headers
      Object.entries(optimized.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })

      return originalJson.call(this, optimized.data)
    }

    res.on('finish', () => {'`'
      const responseTime = performance.now() - startTime
      const endpoint = '${req.method} ${req.route?.path || req.path}'
      
      performanceProfiler.updateProfile(
        endpoint,
        responseTime,
        dbQueryCount,
        cacheHit,
        res.statusCode >= 400
      )
    })

    next()
  }
}

export default {
  SmartCacheManager,
  QueryOptimizer,
  ResponseOptimizer,
  ConcurrencyOptimizer,
  PerformanceProfiler,
  cacheManager,
  queryOptimizer,
  responseOptimizer,
  concurrencyOptimizer,
  performanceProfiler,
  createOptimizationMiddleware
}