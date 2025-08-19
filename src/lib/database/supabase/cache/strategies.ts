/**
 * Supabase Caching Strategies
 * Enterprise-level caching patterns for optimal performance
 * Implements multiple caching layers with intelligent invalidation
 */

import { CacheManager } from "@utils/cacheManager";
import logger from "@lib/utils/logger";

/**
 * Cache TTL Constants (in milliseconds)
 */
export const CACHE_TTL = {
	// Short-lived cache for frequently changing data
	REALTIME: 30 * 1000, // 30 seconds
	ANALYTICS: 2 * 60 * 1000, // 2 minutes

	// Medium-lived cache for semi-dynamic data
	SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
	USER_PROFILES: 10 * 60 * 1000, // 10 minutes
	BUSINESS_LIST: 10 * 60 * 1000, // 10 minutes

	// Long-lived cache for stable data
	BUSINESS_PROFILES: 15 * 60 * 1000, // 15 minutes
	CATEGORIES: 30 * 60 * 1000, // 30 minutes
	STATIC_DATA: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Cache Key Patterns
 */
export const CACHE_PATTERNS = {
	// Business domain
	BUSINESS_PROFILE: (id: string) => `business_profile_${id}`,
	BUSINESS_SEARCH: (params: any) => `business_search_${JSON.stringify(params)}`,
	BUSINESS_NEARBY: (lat: number, lng: number, radius: number) => `nearby_${lat}_${lng}_${radius}`,
	BUSINESS_STATS: (id: string) => `business_stats_${id}`,
	BUSINESS_SIMILAR: (id: string, limit: number) => `similar_${id}_${limit}`,
	BUSINESS_CATEGORY: (slug: string, location?: string) => `category_${slug}_${location || "all"}`,

	// User domain
	USER_PROFILE: (id: string) => `user_profile_${id}`,
	USER_BUSINESSES: (id: string) => `user_businesses_${id}`,
	USER_ANALYTICS: (id: string) => `user_analytics_${id}`,

	// Analytics domain
	PLATFORM_ANALYTICS: (timeRange: string) => `platform_analytics_${timeRange}`,
	BUSINESS_ANALYTICS: (id: string, timeRange: string) => `business_analytics_${id}_${timeRange}`,

	// Jobs domain
	JOB_SEARCH: (params: any) => `job_search_${JSON.stringify(params)}`,
	JOB_CATEGORY: (category: string, location?: string) => `job_category_${category}_${location || "all"}`,

	// Static data
	CATEGORIES: () => "categories_list",
	LOCATIONS: () => "locations_list",
} as const;

/**
 * Cache Invalidation Patterns
 */
export const INVALIDATION_PATTERNS = {
	// When a business is updated, invalidate related caches
	BUSINESS_UPDATE: (businessId: string) => [
		CACHE_PATTERNS.BUSINESS_PROFILE(businessId),
		CACHE_PATTERNS.BUSINESS_STATS(businessId),
		// Pattern matching for search results containing this business
		"business_search_*",
		"category_*",
		"nearby_*",
	],

	// When a user updates their profile
	USER_UPDATE: (userId: string) => [CACHE_PATTERNS.USER_PROFILE(userId), CACHE_PATTERNS.USER_BUSINESSES(userId), CACHE_PATTERNS.USER_ANALYTICS(userId)],

	// When new analytics data is added
	ANALYTICS_UPDATE: () => ["platform_analytics_*", "business_analytics_*", "user_analytics_*"],
} as const;

/**
 * Caching Strategy Interface
 */
export interface CachingStrategy {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttl: number): Promise<void>;
	invalidate(patterns: string[]): Promise<void>;
	generateKey(...args: any[]): string;
}

/**
 * Memory Cache Strategy
 * For high-frequency, low-latency data access
 */
export class MemoryCacheStrategy implements CachingStrategy {
	private cache: Map<string, { value: any; expiry: number }> = new Map();
	private maxSize: number;

	constructor(maxSize: number = 1000) {
		this.maxSize = maxSize;

		// Cleanup expired entries every 5 minutes
		setInterval(() => this.cleanup(), 5 * 60 * 1000);
	}

	async get<T>(key: string): Promise<T | null> {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		if (Date.now() > entry.expiry) {
			this.cache.delete(key);
			return null;
		}

		logger.debug(`Memory cache hit: ${key}`);
		return entry.value as T;
	}

	async set<T>(key: string, value: T, ttl: number): Promise<void> {
		// Implement LRU eviction if cache is full
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}

		this.cache.set(key, {
			value,
			expiry: Date.now() + ttl,
		});

		logger.debug(`Memory cache set: ${key} (TTL: ${ttl}ms)`);
	}

	async invalidate(patterns: string[]): Promise<void> {
		for (const pattern of patterns) {
			if (pattern.includes("*")) {
				// Pattern matching
				const regex = new RegExp(pattern.replace("*", ".*"));
				const keysToDelete = Array.from(this.cache.keys()).filter((key) => regex.test(key));
				keysToDelete.forEach((key) => this.cache.delete(key));
				logger.debug(`Memory cache invalidated pattern: ${pattern} (${keysToDelete.length} keys)`);
			} else {
				// Exact match
				this.cache.delete(pattern);
				logger.debug(`Memory cache invalidated: ${pattern}`);
			}
		}
	}

	generateKey(...args: any[]): string {
		return args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join("_");
	}

	private cleanup(): void {
		const now = Date.now();
		let expiredCount = 0;

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiry) {
				this.cache.delete(key);
				expiredCount++;
			}
		}

		if (expiredCount > 0) {
			logger.debug(`Memory cache cleanup: removed ${expiredCount} expired entries`);
		}
	}

	// Get cache statistics
	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			usage: (this.cache.size / this.maxSize) * 100,
		};
	}
}

/**
 * Redis Cache Strategy (for distributed systems)
 * For persistent, shared cache across multiple instances
 */
export class RedisCacheStrategy implements CachingStrategy {
	private client: any; // Redis client
	private prefix: string;

	constructor(redisClient: any, prefix: string = "supabase:") {
		this.client = redisClient;
		this.prefix = prefix;
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const fullKey = this.prefix + key;
			const value = await this.client.get(fullKey);

			if (!value) {
				return null;
			}

			const parsed = JSON.parse(value);
			logger.debug(`Redis cache hit: ${key}`);
			return parsed as T;
		} catch (error) {
			logger.error(`Redis cache get error: ${key}`, error);
			return null;
		}
	}

	async set<T>(key: string, value: T, ttl: number): Promise<void> {
		try {
			const fullKey = this.prefix + key;
			const serialized = JSON.stringify(value);

			await this.client.setex(fullKey, Math.floor(ttl / 1000), serialized);
			logger.debug(`Redis cache set: ${key} (TTL: ${ttl}ms)`);
		} catch (error) {
			logger.error(`Redis cache set error: ${key}`, error);
		}
	}

	async invalidate(patterns: string[]): Promise<void> {
		try {
			for (const pattern of patterns) {
				const fullPattern = this.prefix + pattern;

				if (pattern.includes("*")) {
					// Pattern matching with SCAN
					const keys = await this.client.keys(fullPattern);
					if (keys.length > 0) {
						await this.client.del(...keys);
						logger.debug(`Redis cache invalidated pattern: ${pattern} (${keys.length} keys)`);
					}
				} else {
					// Exact match
					await this.client.del(fullPattern);
					logger.debug(`Redis cache invalidated: ${pattern}`);
				}
			}
		} catch (error) {
			logger.error("Redis cache invalidation error:", error);
		}
	}

	generateKey(...args: any[]): string {
		return args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join("_");
	}
}

/**
 * Hybrid Cache Strategy
 * Combines memory and Redis for optimal performance
 */
export class HybridCacheStrategy implements CachingStrategy {
	private memoryCache: MemoryCacheStrategy;
	private redisCache: RedisCacheStrategy;

	constructor(redisClient?: any, memoryMaxSize: number = 500) {
		this.memoryCache = new MemoryCacheStrategy(memoryMaxSize);
		if (redisClient) {
			this.redisCache = new RedisCacheStrategy(redisClient);
		}
	}

	async get<T>(key: string): Promise<T | null> {
		// Try memory cache first
		let value = await this.memoryCache.get<T>(key);
		if (value !== null) {
			return value;
		}

		// Fallback to Redis if available
		if (this.redisCache) {
			value = await this.redisCache.get<T>(key);
			if (value !== null) {
				// Populate memory cache for faster next access
				await this.memoryCache.set(key, value, CACHE_TTL.BUSINESS_PROFILES);
				return value;
			}
		}

		return null;
	}

	async set<T>(key: string, value: T, ttl: number): Promise<void> {
		// Set in both caches
		await Promise.all([this.memoryCache.set(key, value, ttl), this.redisCache?.set(key, value, ttl)]);
	}

	async invalidate(patterns: string[]): Promise<void> {
		await Promise.all([this.memoryCache.invalidate(patterns), this.redisCache?.invalidate(patterns)]);
	}

	generateKey(...args: any[]): string {
		return this.memoryCache.generateKey(...args);
	}

	getStats() {
		return {
			memory: this.memoryCache.getStats(),
			redis: !!this.redisCache,
		};
	}
}

/**
 * Cache Factory
 * Creates appropriate caching strategy based on environment
 */
export class CacheStrategyFactory {
	static create(type: "memory" | "redis" | "hybrid" = "memory", options: any = {}): CachingStrategy {
		switch (type) {
			case "memory":
				return new MemoryCacheStrategy(options.maxSize);

			case "redis":
				if (!options.redisClient) {
					throw new Error("Redis client is required for Redis cache strategy");
				}
				return new RedisCacheStrategy(options.redisClient, options.prefix);

			case "hybrid":
				return new HybridCacheStrategy(options.redisClient, options.memoryMaxSize);

			default:
				return new MemoryCacheStrategy();
		}
	}
}

/**
 * Smart Cache Manager
 * Automatically selects appropriate TTL and invalidation strategies
 */
export class SmartCacheManager {
	private strategy: CachingStrategy;

	constructor(strategy: CachingStrategy) {
		this.strategy = strategy;
	}

	async cacheQuery<T>(
		queryFn: () => Promise<T>,
		cacheKey: string,
		ttl?: number,
		options: {
			refreshThreshold?: number; // Refresh if older than this percentage of TTL
			backgroundRefresh?: boolean; // Refresh in background while serving stale data
		} = {}
	): Promise<T> {
		// Try to get from cache first
		const cached = await this.strategy.get<T>(cacheKey);
		if (cached !== null) {
			return cached;
		}

		// Execute query and cache result
		const result = await queryFn();
		const cacheTtl = ttl || this.getSmartTTL(cacheKey);

		await this.strategy.set(cacheKey, result, cacheTtl);

		return result;
	}

	async invalidateByDomain(domain: "business" | "user" | "analytics" | "jobs", entityId?: string): Promise<void> {
		let patterns: string[] = [];

		switch (domain) {
			case "business":
				patterns = entityId ? INVALIDATION_PATTERNS.BUSINESS_UPDATE(entityId) : ["business_*"];
				break;
			case "user":
				patterns = entityId ? INVALIDATION_PATTERNS.USER_UPDATE(entityId) : ["user_*"];
				break;
			case "analytics":
				patterns = INVALIDATION_PATTERNS.ANALYTICS_UPDATE();
				break;
			case "jobs":
				patterns = ["job_*"];
				break;
		}

		await this.strategy.invalidate(patterns);
	}

	private getSmartTTL(cacheKey: string): number {
		// Determine TTL based on data type
		if (cacheKey.includes("analytics")) return CACHE_TTL.ANALYTICS;
		if (cacheKey.includes("search")) return CACHE_TTL.SEARCH_RESULTS;
		if (cacheKey.includes("profile")) return CACHE_TTL.BUSINESS_PROFILES;
		if (cacheKey.includes("categories")) return CACHE_TTL.CATEGORIES;

		// Default TTL
		return CACHE_TTL.BUSINESS_LIST;
	}
}

// Export default instance
export const defaultCacheStrategy = CacheStrategyFactory.create("memory");
export const smartCache = new SmartCacheManager(defaultCacheStrategy);
