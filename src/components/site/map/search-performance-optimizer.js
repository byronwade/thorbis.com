/**
 * SearchPerformanceOptimizer Component
 * Advanced search performance optimization with caching and preloading
 * Implements intelligent preloading and result caching strategies
 */

"use client";

import React, { useEffect, useCallback, useRef } from "react";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";

// Performance optimization strategies
const CACHE_CONFIG = {
	MAX_CACHE_SIZE: 50, // Maximum number of cached search results
	CACHE_TTL: 10 * 60 * 1000, // 10 minutes cache duration
	PRELOAD_THRESHOLD: 3, // Start preloading when 3 characters typed
	DEBOUNCE_DELAY: 300, // Debounce search requests
	PREFETCH_RADIUS: 5, // Prefetch businesses within 5km radius
};

class SearchCache {
	constructor() {
		this.cache = new Map();
		this.accessTimes = new Map();
		this.performanceMetrics = {
			hits: 0,
			misses: 0,
			totalRequests: 0,
			averageResponseTime: 0,
		};
	}

	// Generate cache key from search parameters
	generateKey(query, location, filters = {}) {
		const normalized = {
			query: query.toLowerCase().trim(),
			location: location.toLowerCase().trim(),
			filters: Object.keys(filters)
				.sort()
				.reduce((sorted, key) => {
					sorted[key] = filters[key];
					return sorted;
				}, {}),
		};
		return JSON.stringify(normalized);
	}

	// Get cached result
	get(key) {
		this.performanceMetrics.totalRequests++;

		if (this.cache.has(key)) {
			const cached = this.cache.get(key);
			const now = Date.now();

			// Check if cache is still valid
			if (now - cached.timestamp < CACHE_CONFIG.CACHE_TTL) {
				this.accessTimes.set(key, now);
				this.performanceMetrics.hits++;

				logger.performance(`Search cache hit: ${key.slice(0, 50)}...`);
				return {
					...cached.data,
					fromCache: true,
					cacheAge: now - cached.timestamp,
				};
			} else {
				// Cache expired
				this.cache.delete(key);
				this.accessTimes.delete(key);
			}
		}

		this.performanceMetrics.misses++;
		return null;
	}

	// Store result in cache
	set(key, data) {
		const now = Date.now();

		// Implement LRU eviction if cache is full
		if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
			this.evictLRU();
		}

		this.cache.set(key, {
			data,
			timestamp: now,
		});
		this.accessTimes.set(key, now);

		logger.debug(`Cached search result: ${key.slice(0, 50)}...`);
	}

	// Evict least recently used item
	evictLRU() {
		let oldestKey = null;
		let oldestTime = Date.now();

		for (const [key, time] of this.accessTimes) {
			if (time < oldestTime) {
				oldestTime = time;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
			this.accessTimes.delete(oldestKey);
			logger.debug(`Evicted LRU cache entry: ${oldestKey.slice(0, 50)}...`);
		}
	}

	// Get cache statistics
	getStats() {
		const hitRate = this.performanceMetrics.totalRequests > 0 ? ((this.performanceMetrics.hits / this.performanceMetrics.totalRequests) * 100).toFixed(1) : 0;

		return {
			...this.performanceMetrics,
			hitRate,
			cacheSize: this.cache.size,
			maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
		};
	}

	// Clear cache
	clear() {
		this.cache.clear();
		this.accessTimes.clear();
		logger.debug("Search cache cleared");
	}
}

// Global cache instance
const searchCache = new SearchCache();

const SearchPerformanceOptimizer = ({ children, onSearchQuery, currentQuery = "", currentLocation = "", currentFilters = {}, onPrefetchResults }) => {
	const debounceRef = useRef();
	const prefetchRef = useRef();
	const performanceObserver = useRef();

	// Debounced search function
	const debouncedSearch = useCallback(
		withErrorHandling(async (query, location, filters) => {
			const cacheKey = searchCache.generateKey(query, location, filters);
			const startTime = performance.now();

			// Check cache first
			const cachedResult = searchCache.get(cacheKey);
			if (cachedResult) {
				onSearchQuery?.(cachedResult);
				return;
			}

			// Perform actual search
			try {
				const result = await onSearchQuery?.({ query, location, filters });
				const responseTime = performance.now() - startTime;

				// Cache the result
				if (result && result.businesses) {
					searchCache.set(cacheKey, {
						...result,
						responseTime,
						timestamp: Date.now(),
					});
				}

				// Update performance metrics
				searchCache.performanceMetrics.averageResponseTime = (searchCache.performanceMetrics.averageResponseTime + responseTime) / 2;

				logger.performance(`Search completed in ${responseTime.toFixed(2)}ms`);
			} catch (error) {
				logger.error("Search error:", error);
			}
		}, "SearchPerformanceOptimizer"),
		[onSearchQuery]
	);

	// Intelligent prefetching
	const prefetchNearbyBusinesses = useCallback(
		withErrorHandling(async (location) => {
			if (!location || !onPrefetchResults) return;

			const prefetchQueries = [
				{ query: "restaurants", location },
				{ query: "coffee", location },
				{ query: "gas station", location },
				{ query: "pharmacy", location },
			];

			// Prefetch common searches
			for (const prefetchQuery of prefetchQueries) {
				const cacheKey = searchCache.generateKey(prefetchQuery.query, prefetchQuery.location, {});

				// Only prefetch if not already cached
				if (!searchCache.get(cacheKey)) {
					setTimeout(async () => {
						try {
							const result = await onPrefetchResults(prefetchQuery);
							if (result) {
								searchCache.set(cacheKey, result);
								logger.debug(`Prefetched: ${prefetchQuery.query} near ${location}`);
							}
						} catch (error) {
							logger.warn(`Prefetch failed for ${prefetchQuery.query}:`, error);
						}
					}, Math.random() * 2000); // Randomize prefetch timing
				}
			}
		}, "SearchPerformanceOptimizer"),
		[onPrefetchResults]
	);

	// Set up performance monitoring
	useEffect(() => {
		if (typeof PerformanceObserver !== "undefined") {
			performanceObserver.current = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					if (entry.name.includes("search") || entry.name.includes("fetch")) {
						logger.performance(`Performance entry: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
					}
				});
			});

			try {
				performanceObserver.current.observe({ entryTypes: ["measure", "navigation"] });
			} catch (error) {
				logger.debug("Performance Observer not supported");
			}
		}

		return () => {
			if (performanceObserver.current) {
				performanceObserver.current.disconnect();
			}
		};
	}, []);

	// Handle search with debouncing
	useEffect(() => {
		if (currentQuery.length >= CACHE_CONFIG.PRELOAD_THRESHOLD) {
			clearTimeout(debounceRef.current);

			debounceRef.current = setTimeout(() => {
				debouncedSearch(currentQuery, currentLocation, currentFilters);
			}, CACHE_CONFIG.DEBOUNCE_DELAY);
		}

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [currentQuery, currentLocation, currentFilters, debouncedSearch]);

	// Handle location-based prefetching
	useEffect(() => {
		if (currentLocation) {
			clearTimeout(prefetchRef.current);

			prefetchRef.current = setTimeout(() => {
				prefetchNearbyBusinesses(currentLocation);
			}, 1000); // Wait 1 second before prefetching
		}

		return () => {
			if (prefetchRef.current) {
				clearTimeout(prefetchRef.current);
			}
		};
	}, [currentLocation, prefetchNearbyBusinesses]);

	// Expose cache management to parent components
	React.useImperativeHandle(
		(ref) => ({
			clearCache: () => searchCache.clear(),
			getCacheStats: () => searchCache.getStats(),
			prefetchQuery: (query, location, filters) => {
				const cacheKey = searchCache.generateKey(query, location, filters);
				return searchCache.get(cacheKey);
			},
		}),
		[]
	);

	// Log cache statistics periodically (development only)
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			const statsInterval = setInterval(() => {
				const stats = searchCache.getStats();
				logger.debug("Search Cache Stats:", stats);
			}, 30000); // Every 30 seconds

			return () => clearInterval(statsInterval);
		}
	}, []);

	return (
		<>
			{children}

			{/* Performance Debug Panel (Development Only) */}
			{process.env.NODE_ENV === "development" && (
				<div className="fixed bottom-4 left-4 z-50 bg-black text-white text-xs p-3 rounded-lg opacity-75 pointer-events-none max-w-xs">
					<div className="font-bold mb-1">Search Performance</div>
					<div>Cache: {searchCache.getStats().hitRate}% hit rate</div>
					<div>
						Size: {searchCache.cache.size}/{CACHE_CONFIG.MAX_CACHE_SIZE}
					</div>
					<div>Avg Response: {searchCache.performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
				</div>
			)}
		</>
	);
};

// Export cache utilities for external use
export const SearchUtils = {
	clearCache: () => searchCache.clear(),
	getCacheStats: () => searchCache.getStats(),
	getCachedResult: (query, location, filters) => {
		const key = searchCache.generateKey(query, location, filters);
		return searchCache.get(key);
	},
};

export default SearchPerformanceOptimizer;
