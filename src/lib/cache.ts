/**
 * Comprehensive Caching System
 * 
 * Provides multi-layer caching with Redis and in-memory strategies
 */

import { Redis } from 'redis'
import crypto from 'crypto'

// Cache configuration
interface CacheConfig {
  defaultTTL: number // seconds
  maxMemoryItems: number
  enableCompression: boolean
  keyPrefix: string
  enableStats: boolean
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 3600, // 1 hour
  maxMemoryItems: 10000,
  enableCompression: true,
  keyPrefix: 'thorbis: ','
  enableStats: true
}

// Cache entry interface
interface CacheEntry<T = any> {
  value: T
  createdAt: number
  expiresAt: number
  accessCount: number
  lastAccessAt: number
  size: number // bytes
}

// Cache statistics
interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  totalSize: number
  itemCount: number
  hitRate: number
  averageResponseTime: number
  lastCleanup: number
}

// Cache invalidation tags
interface CacheTag {
  pattern: string
  ttl?: number
  dependencies?: string[]
}

class MultiLayerCache {
  private redis: Redis | null = null
  private memoryCache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    averageResponseTime: 0,
    lastCleanup: Date.now()
  }
  private cleanupInterval: NodeJS.Timeout | null = null
  private tagIndex = new Map<string, Set<string>>() // tag -> keys

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeRedis()
    this.startCleanupInterval()
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        })

        await this.redis.connect()
        console.log('✅ Redis cache connected successfully')

        // Handle Redis connection events
        this.redis.on('error', (err) => {
          console.error('Redis cache error:', err)
          this.redis = null // Fallback to memory cache
        })

        this.redis.on('disconnect', () => {
          console.warn('⚠️ Redis cache disconnected, falling back to memory cache')
        })

      } else {
        console.log('📝 Using memory-only cache (no Redis configured)')
      }
    } catch (error) {
      console.error('Failed to initialize Redis cache:', error)
      this.redis = null
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string, businessId?: string): Promise<T | null> {
    const startTime = performance.now()
    const fullKey = this.buildKey(key, businessId)

    try {
      // Try memory cache first (L1)
      const memoryEntry = this.memoryCache.get(fullKey)
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        memoryEntry.accessCount++
        memoryEntry.lastAccessAt = Date.now()
        this.recordHit(performance.now() - startTime)
        return memoryEntry.value
      }

      // Try Redis cache (L2)
      if (this.redis) {
        const redisValue = await this.redis.get(fullKey)
        if (redisValue) {
          const parsed = JSON.parse(redisValue)
          
          // Store in memory cache for faster access
          const entry: CacheEntry<T> = {
            value: parsed.value,
            createdAt: parsed.createdAt,
            expiresAt: parsed.expiresAt,
            accessCount: 1,
            lastAccessAt: Date.now(),
            size: this.estimateSize(parsed.value)
          }

          if (entry.expiresAt > Date.now()) {
            this.setMemoryCache(fullKey, entry)
            this.recordHit(performance.now() - startTime)
            return entry.value
          } else {
            // Expired in Redis, clean it up
            await this.redis.del(fullKey)
          }
        }
      }

      this.recordMiss(performance.now() - startTime)
      return null

    } catch (error) {
      console.error('Cache get error:', error)
      this.recordMiss(performance.now() - startTime)
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(
    key: string, 
    value: T, 
    ttl: number = this.config.defaultTTL,
    businessId?: string,
    tags: string[] = []
  ): Promise<boolean> {
    const fullKey = this.buildKey(key, businessId)
    const now = Date.now()
    const expiresAt = now + (ttl * 1000)

    try {
      const entry: CacheEntry<T> = {
        value,
        createdAt: now,
        expiresAt,
        accessCount: 0,
        lastAccessAt: now,
        size: this.estimateSize(value)
      }

      // Set in memory cache (L1)
      this.setMemoryCache(fullKey, entry)

      // Set in Redis cache (L2)
      if (this.redis) {
        const serialized = JSON.stringify({
          value,
          createdAt: now,
          expiresAt
        })

        await this.redis.setex(fullKey, ttl, serialized)
      }

      // Update tag index
      for (const tag of tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set())
        }
        this.tagIndex.get(tag)!.add(fullKey)
      }

      this.stats.sets++
      return true

    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, businessId?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, businessId)

    try {
      // Delete from memory cache
      const memoryDeleted = this.memoryCache.delete(fullKey)

      // Delete from Redis cache
      let redisDeleted = false
      if (this.redis) {
        const result = await this.redis.del(fullKey)
        redisDeleted = result > 0
      }

      // Remove from tag index
      this.removeFromTagIndex(fullKey)

      if (memoryDeleted || redisDeleted) {
        this.stats.deletes++
        return true
      }

      return false

    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Get or set pattern (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T> | T,
    ttl: number = this.config.defaultTTL,
    businessId?: string,
    tags: string[] = []
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, businessId)
    if (cached !== null) {
      return cached
    }

    // Generate new value
    const value = await factory()
    
    // Store in cache
    await this.set(key, value, ttl, businessId, tags)
    
    return value
  }

  /**
   * Invalidate by tags
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag)
    if (!keys || keys.size === 0) {
      return 0
    }

    let deletedCount = 0
    const keysArray = Array.from(keys)

    try {
      // Delete from memory cache
      for (const key of keysArray) {
        if (this.memoryCache.delete(key)) {
          deletedCount++
        }
      }

      // Delete from Redis cache
      if (this.redis && keysArray.length > 0) {
        const redisResult = await this.redis.del(...keysArray)
        deletedCount += redisResult
      }

      // Clear tag index
      this.tagIndex.delete(tag)

      this.stats.deletes += deletedCount
      return deletedCount

    } catch (error) {
      console.error('Cache invalidateByTag error:', error)
      return deletedCount
    }
  }

  /**
   * Invalidate by pattern
   */
  async invalidateByPattern(pattern: string, businessId?: string): Promise<number> {
    const fullPattern = this.buildKey(pattern, businessId)
    let deletedCount = 0

    try {
      // Memory cache - check all keys
      const memoryKeysToDelete: string[] = []
      for (const key of this.memoryCache.keys()) {
        if (this.matchesPattern(key, fullPattern)) {
          memoryKeysToDelete.push(key)
        }
      }

      for (const key of memoryKeysToDelete) {
        if (this.memoryCache.delete(key)) {
          deletedCount++
        }
      }

      // Redis cache - use SCAN for pattern matching
      if (this.redis) {
        const stream = this.redis.scanStream({ match: fullPattern })
        const pipeline = this.redis.pipeline()
        let batchCount = 0

        for await (const keys of stream) {
          for (const key of keys) {
            pipeline.del(key)
            batchCount++
          }

          if (batchCount >= 100) {
            const results = await pipeline.exec()
            deletedCount += results?.filter(([err, result]) => !err && result === 1).length || 0
            batchCount = 0
          }
        }

        if (batchCount > 0) {
          const results = await pipeline.exec()
          deletedCount += results?.filter(([err, result]) => !err && result === 1).length || 0
        }
      }

      this.stats.deletes += deletedCount
      return deletedCount

    } catch (error) {
      console.error('Cache invalidateByPattern error:', error)
      return deletedCount
    }
  }

  /**
   * Clear all cache
   */
  async clear(businessId?: string): Promise<boolean> {
    try {
      if (businessId) {
        // Clear only for specific business
        return (await this.invalidateByPattern('*', businessId)) > 0
      } else {
        // Clear all cache
        this.memoryCache.clear()
        this.tagIndex.clear()

        if (this.redis) {
          await this.redis.flushall()
        }

        this.resetStats()
        return true
      }
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      itemCount: this.memoryCache.size,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    }
  }

  /**
   * Get cache info by business
   */
  async getBusinessCacheInfo(businessId: string): Promise<{
    keyCount: number
    estimatedSize: number
    oldestEntry: number | null
    newestEntry: number | null
  }> {
    const prefix = this.buildKey(', businessId)
    const keyCount = 0
    const estimatedSize = 0
    let oldestEntry: number | null = null
    let newestEntry: number | null = null

    // Check memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (key.startsWith(prefix)) {
        keyCount++
        estimatedSize += entry.size
        
        if (oldestEntry === null || entry.createdAt < oldestEntry) {
          oldestEntry = entry.createdAt
        }
        
        if (newestEntry === null || entry.createdAt > newestEntry) {
          newestEntry = entry.createdAt
        }
      }
    }

    return {
      keyCount,
      estimatedSize,
      oldestEntry,
      newestEntry
    }
  }

  /**
   * Warm up cache with commonly accessed data
   */
  async warmUp(businessId: string, warmUpData: { key: string, factory: () => Promise<unknown>, ttl?: number }[]): Promise<void> {
    console.log(`🔥 Warming up cache for business ${businessId}`)
    
    const promises = warmUpData.map(({ key, factory, ttl }) =>
      this.getOrSet(key, factory, ttl, businessId).catch(error => {
        console.error(`Cache warm-up failed for key ${key}:', error)
      })
    )

    await Promise.allSettled(promises)
    console.log('✅ Cache warm-up completed for business ${businessId}')
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    memory: { status: 'healthy' | 'degraded', itemCount: number, size: number }
    redis: { status: 'healthy' | 'unavailable' | 'degraded', latency?: number }
    overall: 'healthy' | 'degraded' | 'unavailable'
  }> {
    const memoryItemCount = this.memoryCache.size
    const memorySize = Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0)

    const memory = {
      status: (memoryItemCount < this.config.maxMemoryItems * 0.9) ? 'healthy' as const : 'degraded' as const,
      itemCount: memoryItemCount,
      size: memorySize
    }

    let redis: { status: 'healthy' | 'unavailable' | 'degraded', latency?: number }

    if (this.redis) {
      try {
        const start = performance.now()
        await this.redis.ping()
        const latency = performance.now() - start

        redis = {
          status: latency < 50 ? 'healthy' : latency < 200 ? 'degraded' : 'degraded',
          latency
        }
      } catch (_error) {
        redis = { status: 'unavailable' }
      }
    } else {
      redis = { status: 'unavailable' }
    }

    const overall = redis.status === 'unavailable' && memory.status === 'degraded' ? 'degraded' :
                   redis.status === 'unavailable' ? 'degraded' :
                   memory.status === 'degraded' || redis.status === 'degraded' ? 'degraded' : 'healthy'

    return { memory, redis, overall }
  }

  /**
   * Build cache key
   */
  private buildKey(key: string, businessId?: string): string {
    const parts = [this.config.keyPrefix]
    if (businessId) {
      parts.push('biz:${businessId}')
    }
    parts.push(key)
    return parts.join(': '
  }

  /**
   * Set in memory cache with eviction
   */
  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    // Check if we need to evict items
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      this.evictLeastRecentlyUsed()
    }

    this.memoryCache.set(key, entry)
    this.stats.totalSize += entry.size
  }

  /**
   * Evict least recently used items
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessAt < oldestTime) {
        oldestTime = entry.lastAccessAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey)
      if (entry) {
        this.stats.totalSize -= entry.size
        this.stats.evictions++
      }
      this.memoryCache.delete(oldestKey)
      this.removeFromTagIndex(oldestKey)
    }
  }

  /**
   * Remove key from tag index
   */
  private removeFromTagIndex(key: string): void {
    for (const [tag, keys] of this.tagIndex.entries()) {
      keys.delete(key)
      if (keys.size === 0) {
        this.tagIndex.delete(tag)
      }
    }
  }

  /**
   * Check if key matches pattern
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.`)
    
    const regex = new RegExp(`^${regexPattern}$')
    return regex.test(key)
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: unknown): number {
    const json = JSON.stringify(obj)
    return new Blob([json]).size
  }

  /**
   * Record cache hit
   */
  private recordHit(responseTime: number): void {
    this.stats.hits++
    this.updateAverageResponseTime(responseTime)
  }

  /**
   * Record cache miss
   */
  private recordMiss(responseTime: number): void {
    this.stats.misses++
    this.updateAverageResponseTime(responseTime)
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.stats.hits + this.stats.misses
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (totalRequests - 1)) + responseTime) / totalRequests
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      averageResponseTime: 0,
      lastCleanup: Date.now()
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      const entry = this.memoryCache.get(key)
      if (entry) {
        this.stats.totalSize -= entry.size
      }
      this.memoryCache.delete(key)
      this.removeFromTagIndex(key)
    }

    this.stats.lastCleanup = now
    
    if (keysToDelete.length > 0) {
      console.log('🧹 Cache cleanup: removed ${keysToDelete.length} expired entries')
    }
  }

  /**
   * Shutdown cache
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    if (this.redis) {
      await this.redis.quit()
    }

    console.log('📴 Cache system shut down')
  }
}

// Global cache instance
export const cache = new MultiLayerCache({
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
  maxMemoryItems: parseInt(process.env.CACHE_MAX_MEMORY_ITEMS || '10000'),
  enableCompression: process.env.CACHE_ENABLE_COMPRESSION === 'true',
  keyPrefix: process.env.CACHE_KEY_PREFIX || 'thorbis: ',
  enableStats: process.env.CACHE_ENABLE_STATS !== 'false'
})

// Cache decorator for functions
export function cached(ttl: number = 3600, tags: string[] = []) {
  return function (target: unknown, propertyName: string, descriptor: TypedPropertyDescriptor<unknown>) {
    const method = descriptor.value!
    
    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = 'fn:${target.constructor.name}:${propertyName}:${crypto.createHash('md5').update(JSON.stringify(args)).digest('hex')}'
      
      return await cache.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        ttl,
        undefined,
        tags
      )
    }
  }
}

// Cache middleware for API responses
export function withCache(ttl: number = 300, tags: string[] = []) {
  return function (handler: Function) {
    return async function (request: Request, context?: any) {
      const url = new URL(request.url)
      const cacheKey = 'api:${request.method}:${url.pathname}:${url.search}'
      
      if (request.method === 'GET') {
        const cached = await cache.get(cacheKey)
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: {
              'Content-Type': 'application/json',
              'X-Cache-Status': 'HIT'
            }
          })
        }
      }

      const response = await handler(request, context)
      
      if (request.method === 'GET` && response.ok) {
        const data = await response.clone().json()
        await cache.set(cacheKey, data, ttl, undefined, tags)
      }

      return response
    }
  }
}

// Business-specific cache utilities
export const businessCache = {
  customers: {
    get: (customerId: string, businessId: string) => 
      cache.get(`customer:${customerId}', businessId),
    set: (customerId: string, data: unknown, businessId: string, ttl = 3600) => 
      cache.set('customer:${customerId}', data, ttl, businessId, ['customers']),
    invalidate: (customerId: string, businessId: string) => 
      cache.delete('customer:${customerId}', businessId),
    invalidateAll: (businessId: string) => 
      cache.invalidateByTag('customers`)
  },

  workOrders: {
    get: (workOrderId: string, businessId: string) => 
      cache.get(`work-order:${workOrderId}', businessId),
    set: (workOrderId: string, data: unknown, businessId: string, ttl = 1800) => 
      cache.set('work-order:${workOrderId}', data, ttl, businessId, ['work-orders']),
    invalidate: (workOrderId: string, businessId: string) => 
      cache.delete('work-order:${workOrderId}', businessId),
    invalidateAll: (businessId: string) => 
      cache.invalidateByTag('work-orders')
  },

  analytics: {
    get: (query: string, businessId: string) => 
      cache.get('analytics:${crypto.createHash('md5').update(query).digest('hex')}', businessId),
    set: (query: string, data: unknown, businessId: string, ttl = 900) => // 15 minutes
      cache.set('analytics:${crypto.createHash('md5').update(query).digest('hex')}', data, ttl, businessId, ['analytics']),
    invalidateAll: (businessId: string) => 
      cache.invalidateByTag('analytics')
  }
}

// Export cache instance and utilities
export { MultiLayerCache, cache as default }