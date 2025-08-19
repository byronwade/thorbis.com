/**
 * SEO System Initializer
 * Handles cache warming, performance optimization setup, and system initialization
 * Should be called during application startup for optimal performance
 */

import { seoPerformanceOptimizer } from "./seo-performance-optimizer";
import { seoDataIntegration } from "./seo-data-integration";
import logger from "./logger.js";

/**
 * SEO System Initializer Class
 * Manages the startup and optimization of the entire SEO system
 */
export class SEOInitializer {
	constructor() {
		this.initialized = false;
		this.initializationStartTime = null;
		this.warmupProgress = {
			businesses: 0,
			categories: 0,
			locations: 0,
			total: 0,
		};
	}

	/**
	 * Initialize the entire SEO system with performance optimizations
	 */
	async initialize(options = {}) {
		if (this.initialized) {
			logger.debug("SEO system already initialized");
			return;
		}

		this.initializationStartTime = performance.now();
		logger.info("Initializing SEO system with performance optimizations...");

		try {
			// 1. Pre-warm data integration cache
			await this._preWarmDataCache(options);

			// 2. Initialize performance optimizer cache
			await this._initializePerformanceCache(options);

			// 3. Set up background optimization tasks
			this._setupBackgroundTasks(options);

			// 4. Initialize monitoring and analytics
			this._setupPerformanceMonitoring(options);

			const initDuration = performance.now() - this.initializationStartTime;
			logger.performance(`SEO system initialized in ${initDuration.toFixed(2)}ms`);

			this.initialized = true;

			// 5. Schedule periodic optimizations
			this._schedulePeriodicOptimizations(options);
		} catch (error) {
			logger.error("SEO system initialization failed:", error);
			throw error;
		}
	}

	/**
	 * Quick initialization for development environments
	 */
	async quickInit() {
		logger.info("Quick SEO initialization for development...");

		try {
			// Minimal setup for development
			await seoDataIntegration.preWarmCache([]);

			this.initialized = true;
			logger.info("Quick SEO initialization completed");
		} catch (error) {
			logger.warn("Quick SEO initialization failed:", error.message);
			// Don't throw in development mode
		}
	}

	/**
	 * Get initialization status and performance metrics
	 */
	getStatus() {
		return {
			initialized: this.initialized,
			initializationTime: this.initializationStartTime ? performance.now() - this.initializationStartTime : null,
			warmupProgress: this.warmupProgress,
			performanceMetrics: seoPerformanceOptimizer.getPerformanceReport(),
			cacheStats: seoDataIntegration.getCacheStatistics(),
		};
	}

	/**
	 * Pre-warm the most critical SEO data
	 */
	async _preWarmDataCache(options) {
		logger.info("Pre-warming SEO data cache...");

		try {
			// Get popular businesses, categories, and locations for cache warming
			const [popularBusinesses, activeCategories, popularLocations] = await Promise.all([seoDataIntegration.getPopularBusinesses(options.businessWarmupCount || 50), seoDataIntegration.getActiveCategories(), seoDataIntegration.getPopularLocations(options.locationWarmupCount || 30)]);

			// Update progress tracking
			this.warmupProgress.total = popularBusinesses.length + Math.min(activeCategories.length, 20) + popularLocations.length;

			// Pre-warm business data
			const businessIds = popularBusinesses.map((b) => b.id);
			await seoDataIntegration.preWarmCache(businessIds);
			this.warmupProgress.businesses = businessIds.length;

			// Pre-warm category data
			const categoryPromises = activeCategories.slice(0, 20).map(async (category) => {
				try {
					await seoDataIntegration.getCategorySEOData(category.slug);
					this.warmupProgress.categories++;
				} catch (error) {
					logger.warn(`Failed to pre-warm category: ${category.slug}`, error.message);
				}
			});

			// Pre-warm location data
			const locationPromises = popularLocations.map(async (locationData) => {
				try {
					await seoDataIntegration.getLocationSEOData(locationData.location);
					this.warmupProgress.locations++;
				} catch (error) {
					logger.warn(`Failed to pre-warm location: ${locationData.location}`, error.message);
				}
			});

			// Execute category and location warming in parallel
			await Promise.allSettled([...categoryPromises, ...locationPromises]);

			logger.performance(`Pre-warmed ${this.warmupProgress.total} SEO cache entries`);
		} catch (error) {
			logger.error("SEO cache pre-warming failed:", error);
			// Don't throw - continue with initialization
		}
	}

	/**
	 * Initialize performance optimizer cache
	 */
	async _initializePerformanceCache(options) {
		logger.info("Initializing SEO performance cache...");

		try {
			// Warm up the performance optimizer with critical pages
			await seoPerformanceOptimizer.warmCache(options.priorityPages || ["business", "category", "location"]);

			logger.performance("SEO performance cache initialized");
		} catch (error) {
			logger.error("Performance cache initialization failed:", error);
			// Continue with degraded performance
		}
	}

	/**
	 * Set up background optimization tasks
	 */
	_setupBackgroundTasks(options) {
		if (typeof setInterval === "undefined" || options.skipBackgroundTasks) {
			return;
		}

		// Background cache cleanup (every 30 minutes)
		setInterval(
			() => {
				try {
					seoPerformanceOptimizer.clearCache("expired");
					seoDataIntegration.cleanupCache();
					logger.debug("Background SEO cache cleanup completed");
				} catch (error) {
					logger.warn("Background cache cleanup failed:", error.message);
				}
			},
			30 * 60 * 1000
		);

		// Performance metrics collection (every 5 minutes)
		setInterval(
			() => {
				try {
					const metrics = seoPerformanceOptimizer.getPerformanceReport();
					if (metrics.performance.cacheHitRate < 60) {
						logger.warn(`SEO cache hit rate is low: ${metrics.performance.cacheHitRate}`);
					}

					if (metrics.performance.avgGenerationTime > 500) {
						logger.warn(`SEO generation time is high: ${metrics.performance.avgGenerationTime}ms`);
					}
				} catch (error) {
					logger.warn("Performance metrics collection failed:", error.message);
				}
			},
			5 * 60 * 1000
		);

		logger.debug("Background SEO tasks scheduled");
	}

	/**
	 * Set up performance monitoring
	 */
	_setupPerformanceMonitoring(options) {
		if (options.skipMonitoring) return;

		// Monitor for performance degradation
		const originalLog = logger.performance;
		logger.performance = (message, data) => {
			// Call original logger
			originalLog.call(logger, message, data);

			// Check for performance issues
			if (typeof message === "string" && message.includes("ms")) {
				const timeMatch = message.match(/(\d+(?:\.\d+)?)\s*ms/);
				if (timeMatch) {
					const duration = parseFloat(timeMatch[1]);
					if (duration > 1000) {
						logger.warn(`Slow SEO operation detected: ${message}`);
					}
				}
			}
		};

		logger.debug("SEO performance monitoring enabled");
	}

	/**
	 * Schedule periodic optimizations
	 */
	_schedulePeriodicOptimizations(options) {
		if (typeof setInterval === "undefined" || options.skipPeriodicOptimizations) {
			return;
		}

		// Re-warm critical cache entries every 2 hours
		setInterval(
			async () => {
				try {
					logger.info("Running periodic SEO cache optimization...");

					// Get fresh popular data
					const popularBusinesses = await seoDataIntegration.getPopularBusinesses(25);
					const businessIds = popularBusinesses.map((b) => b.id);

					// Re-warm cache
					await seoPerformanceOptimizer.preloadSEOData(businessIds, [], []);

					logger.performance("Periodic SEO cache optimization completed");
				} catch (error) {
					logger.warn("Periodic SEO optimization failed:", error.message);
				}
			},
			2 * 60 * 60 * 1000
		); // 2 hours

		logger.debug("Periodic SEO optimizations scheduled");
	}

	/**
	 * Graceful shutdown of SEO system
	 */
	async shutdown() {
		if (!this.initialized) return;

		logger.info("Shutting down SEO system...");

		try {
			// Clear all caches
			seoPerformanceOptimizer.clearCache();
			seoDataIntegration.cleanupCache();

			// Reset initialization state
			this.initialized = false;
			this.initializationStartTime = null;
			this.warmupProgress = { businesses: 0, categories: 0, locations: 0, total: 0 };

			logger.info("SEO system shutdown completed");
		} catch (error) {
			logger.error("SEO system shutdown failed:", error);
		}
	}
}

// Export singleton instance
export const seoInitializer = new SEOInitializer();

// Auto-initialize in production environments
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
	// Initialize after a short delay to not block initial page load
	setTimeout(() => {
		seoInitializer
			.initialize({
				businessWarmupCount: 30,
				locationWarmupCount: 20,
				priorityPages: ["business", "category"],
			})
			.catch((error) => {
				logger.warn("Auto SEO initialization failed:", error.message);
			});
	}, 1000);
}
