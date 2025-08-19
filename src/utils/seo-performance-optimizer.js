/**
 * SEO Performance Optimization System
 * Provides caching, preloading, and performance monitoring for the advanced SEO system
 * Ensures optimal page load times while delivering comprehensive SEO features
 */

import { cache } from "react";
import logger from "./logger.js";
import { seoDataIntegration } from "./seo-data-integration";

/**
 * Performance-first SEO optimization with intelligent caching and preloading
 */
export class SEOPerformanceOptimizer {
	constructor() {
		this.cache = new Map();
		this.cacheHits = 0;
		this.cacheMisses = 0;
		this.performanceMetrics = {
			avgGenerationTime: 0,
			totalRequests: 0,
			cacheHitRate: 0,
		};

		// Performance budgets (in milliseconds)
		this.performanceBudgets = {
			aiOptimization: 200,
			communityData: 150,
			authorityData: 100,
			structuredData: 50,
			metaGeneration: 100,
		};

		// Cache TTLs (in milliseconds)
		this.cacheTTL = {
			businessSEO: 15 * 60 * 1000, // 15 minutes
			categoryData: 30 * 60 * 1000, // 30 minutes
			locationData: 60 * 60 * 1000, // 1 hour
			staticContent: 24 * 60 * 60 * 1000, // 24 hours
		};

		this.preloadQueue = new Set();
		this.preloadInProgress = false;
	}

	/**
	 * Generate cached SEO optimizations with performance monitoring
	 */
	async generateOptimizedSEO(pageConfig, options = {}) {
		const startTime = performance.now();
		const cacheKey = this._generateCacheKey(pageConfig, options);

		// Check cache first
		const cached = this._getFromCache(cacheKey);
		if (cached && !options.forceFresh) {
			this.cacheHits++;
			this._updatePerformanceMetrics(performance.now() - startTime, true);

			logger.performance(`SEO cache hit for ${pageConfig.type}: ${cacheKey}`);
			return cached;
		}

		this.cacheMisses++;

		try {
			// Generate SEO data with performance monitoring
			const seoData = await this._generateSEOData(pageConfig, options);

			// Cache the result
			this._setCache(cacheKey, seoData, this._determineCacheTTL(pageConfig.type));

			const duration = performance.now() - startTime;
			this._updatePerformanceMetrics(duration, false);

			// Log performance warning if over budget
			const budget = this.performanceBudgets.metaGeneration;
			if (duration > budget) {
				logger.warn(`SEO generation exceeded budget: ${duration.toFixed(2)}ms > ${budget}ms for ${pageConfig.type}`);
			}

			logger.performance(`SEO generated for ${pageConfig.type} in ${duration.toFixed(2)}ms`);
			return seoData;
		} catch (error) {
			// Safe error logging to prevent "[Empty Object]" serialization issues
			const safeErrorMessage = error?.message || error?.toString() || "Unknown SEO generation error";
			logger.error("SEO generation failed:", safeErrorMessage);

			// Return comprehensive fallback SEO data to prevent page failures
			const fallbackData = this._generateFallbackSEO(pageConfig);
			this._updatePerformanceMetrics(performance.now() - startTime, false);

			// Ensure fallback data is always valid
			if (!fallbackData || typeof fallbackData !== "object") {
				return {
					metadata: {
						title: "Local Business Directory",
						description: "Find and discover local businesses in your area",
						robots: "index,follow",
					},
					structuredData: null,
					performance: {
						cached: false,
						fallback: true,
						emergency: true,
						generatedAt: new Date().toISOString(),
					},
				};
			}

			return fallbackData;
		}
	}

	/**
	 * Preload SEO data for popular pages
	 */
	async preloadSEOData(businessIds = [], categories = [], locations = []) {
		if (this.preloadInProgress) {
			logger.debug("SEO preload already in progress, skipping...");
			return;
		}

		this.preloadInProgress = true;
		const startTime = performance.now();

		logger.info(`Starting SEO preload: ${businessIds.length} businesses, ${categories.length} categories, ${locations.length} locations`);

		try {
			// Preload business SEO data
			const businessPromises = businessIds.map(async (businessId) => {
				try {
					const config = { type: "business", data: { id: businessId } };
					await this.generateOptimizedSEO(config);
					this.preloadQueue.delete(`business_${businessId}`);
				} catch (error) {
					logger.warn(`Failed to preload business SEO: ${businessId}`, error.message);
				}
			});

			// Preload category SEO data
			const categoryPromises = categories.map(async (categorySlug) => {
				try {
					const config = { type: "category", data: { slug: categorySlug } };
					await this.generateOptimizedSEO(config);
					this.preloadQueue.delete(`category_${categorySlug}`);
				} catch (error) {
					logger.warn(`Failed to preload category SEO: ${categorySlug}`, error.message);
				}
			});

			// Preload location SEO data
			const locationPromises = locations.map(async (location) => {
				try {
					const config = { type: "location", data: { location } };
					await this.generateOptimizedSEO(config);
					this.preloadQueue.delete(`location_${location}`);
				} catch (error) {
					logger.warn(`Failed to preload location SEO: ${location}`, error.message);
				}
			});

			// Execute all preloads in parallel with concurrency limit
			await this._executeBatched([...businessPromises, ...categoryPromises, ...locationPromises], 10);

			const duration = performance.now() - startTime;
			logger.performance(`SEO preload completed in ${duration.toFixed(2)}ms`);
		} catch (error) {
			logger.error("SEO preload failed:", error);
		} finally {
			this.preloadInProgress = false;
		}
	}

	/**
	 * Cache warming for high-traffic pages
	 */
	async warmCache(priorities = ["business", "category", "location"]) {
		logger.info("Starting SEO cache warming...");

		try {
			// Get popular businesses for cache warming
			const popularBusinesses = await seoDataIntegration.getPopularBusinesses(50);
			const businessIds = popularBusinesses.map((b) => b.id);

			// Get active categories
			const categories = await seoDataIntegration.getActiveCategories();
			const categoryIds = categories.slice(0, 20).map((c) => c.slug);

			// Get popular locations
			const locations = await seoDataIntegration.getPopularLocations(30);

			await this.preloadSEOData(businessIds, categoryIds, locations);

			logger.info("SEO cache warming completed successfully");
		} catch (error) {
			logger.error("SEO cache warming failed:", error);
		}
	}

	/**
	 * Get performance metrics and cache statistics
	 */
	getPerformanceReport() {
		const totalRequests = this.cacheHits + this.cacheMisses;
		const cacheHitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

		return {
			cache: {
				hits: this.cacheHits,
				misses: this.cacheMisses,
				hitRate: `${cacheHitRate.toFixed(1)}%`,
				size: this.cache.size,
			},
			performance: {
				...this.performanceMetrics,
				cacheHitRate: `${cacheHitRate.toFixed(1)}%`,
			},
			budgets: this.performanceBudgets,
			recommendations: this._generatePerformanceRecommendations(),
		};
	}

	/**
	 * Clear cache selectively or completely
	 */
	clearCache(pattern = null) {
		if (!pattern) {
			this.cache.clear();
			logger.info("SEO cache cleared completely");
			return;
		}

		let cleared = 0;
		for (const [key] of this.cache) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
				cleared++;
			}
		}

		logger.info(`SEO cache cleared: ${cleared} entries matching "${pattern}"`);
	}

	/**
	 * Private: Generate cache key for SEO data
	 */
	_generateCacheKey(pageConfig, options) {
    const baseKey = `${pageConfig.type}_${JSON.stringify(pageConfig.data || {})}`;
	const optionsKey = JSON.stringify(options || {});

	// UTF-8 safe base64 encoding (Node and browser compatible)
	let encoded = "";
	try {
		if (typeof Buffer !== "undefined") {
			encoded = Buffer.from(baseKey + optionsKey, "utf-8").toString("base64");
		} else if (typeof btoa === "function") {
			// Handle Unicode for btoa
			encoded = btoa(unescape(encodeURIComponent(baseKey + optionsKey)));
		} else {
			encoded = baseKey + optionsKey;
		}
	} catch (_) {
		encoded = baseKey + optionsKey;
	}

	return `seo_${encoded.replace(/[^a-zA-Z0-9]/g, "").substring(0, 50)}`;
	}

	/**
	 * Private: Get data from cache with expiration check
	 */
	_getFromCache(key) {
		const cached = this.cache.get(key);
		if (!cached) return null;

		const now = Date.now();
		if (now > cached.expires) {
			this.cache.delete(key);
			return null;
		}

		// Update hit count for cache analytics
		cached.hitCount = (cached.hitCount || 0) + 1;
		cached.lastAccessed = now;

		return cached.data;
	}

	/**
	 * Private: Set data in cache with TTL
	 */
	_setCache(key, data, ttl) {
		const expires = Date.now() + ttl;
		this.cache.set(key, {
			data,
			expires,
			created: Date.now(),
			hitCount: 0,
		});

		// Clean up expired entries periodically
		if (Math.random() < 0.01) {
			// 1% chance
			this._cleanupExpiredCache();
		}
	}

	/**
	 * Private: Generate SEO data with performance monitoring
	 */
	async _generateSEOData(pageConfig, options) {
		const { type, data } = pageConfig;

		// Get real business/category/location data
		let realData = {};

		if (type === "business" && data.id) {
			realData = await seoDataIntegration.getBusinessSEOData(data.id, {
				includeReviews: true,
				includePhotos: true,
				includeCategories: true,
			});
		} else if (type === "category" && data.slug) {
			realData = await seoDataIntegration.getCategorySEOData(data.slug);
		} else if (type === "location" && data.location) {
			realData = await seoDataIntegration.getLocationSEOData(data.location);
		}

		// Generate optimized SEO structure
		return {
			metadata: this._generateOptimizedMetadata(pageConfig, realData),
			structuredData: this._generateOptimizedStructuredData(pageConfig, realData),
			performance: {
				cached: false,
				generatedAt: new Date().toISOString(),
				dataFreshness: realData.lastUpdated || new Date().toISOString(),
			},
		};
	}

	/**
	 * Private: Generate optimized metadata
	 */
	_generateOptimizedMetadata(pageConfig, realData) {
		const { type, data } = pageConfig;

		if (type === "business" && realData.business) {
			const business = realData.business;
			return {
				title: `${business.name} - ${business.city}, ${business.state} | ${business.business_categories?.[0]?.category?.name || "Local Business"}`,
				description: business.description || `Find ${business.name} in ${business.city}, ${business.state}. ${realData.reviewInsights?.summary || "Trusted local business with customer reviews."} ${business.phone ? `Call ${business.phone}` : "Contact information available"}.`,
				keywords: [business.name, business.business_categories?.[0]?.category?.name, business.city, business.state, "local business", "reviews", ...(realData.semanticKeywords || [])],
				openGraph: {
					title: `${business.name} - ${business.city}, ${business.state}`,
					description: business.description || `Trusted local business in ${business.city}`,
					images: business.business_photos?.filter((p) => p.is_primary)?.[0] ? [{ url: business.business_photos.filter((p) => p.is_primary)[0].url }] : undefined,
					type: "website",
				},
				twitter: {
					card: "summary_large_image",
					title: `${business.name} - ${business.city}, ${business.state}`,
					description: business.description || `Trusted local business in ${business.city}`,
				},
				canonical: `/${business.slug || business.id}`,
				robots: "index,follow",
			};
		}

		// Fallback metadata for other types
		return {
			title: data.title || "Local Business Directory",
			description: data.description || "Find and discover local businesses in your area",
			robots: "index,follow",
		};
	}

	/**
	 * Private: Generate optimized structured data
	 */
	_generateOptimizedStructuredData(pageConfig, realData) {
		const { type } = pageConfig;

		if (type === "business" && realData.business) {
			const business = realData.business;

			return {
				"@context": "https://schema.org",
				"@type": "LocalBusiness",
				name: business.name,
				description: business.description,
				address: {
					"@type": "PostalAddress",
					streetAddress: business.address,
					addressLocality: business.city,
					addressRegion: business.state,
					postalCode: business.zip_code,
					addressCountry: "US",
				},
				telephone: business.phone,
				url: business.website,
				geo:
					business.latitude && business.longitude
						? {
								"@type": "GeoCoordinates",
								latitude: business.latitude,
								longitude: business.longitude,
							}
						: undefined,
				aggregateRating:
					business.rating && business.review_count
						? {
								"@type": "AggregateRating",
								ratingValue: business.rating,
								reviewCount: business.review_count,
								bestRating: 5,
								worstRating: 1,
							}
						: undefined,
				review: realData.reviews?.slice(0, 5).map((review) => ({
					"@type": "Review",
					author: {
						"@type": "Person",
						name: review.user?.name || "Customer",
					},
					datePublished: review.created_at,
					reviewBody: review.text,
					reviewRating: {
						"@type": "Rating",
						ratingValue: review.rating,
						bestRating: 5,
						worstRating: 1,
					},
				})),
				openingHours: business.hours ? Object.entries(business.hours).map(([day, hours]) => `${day.substring(0, 2)} ${hours.open}-${hours.close}`) : undefined,
				priceRange: business.price_range,
				paymentAccepted: business.payment_methods,
				image: business.business_photos?.filter((p) => p.is_primary)?.[0]?.url,
			};
		}

		return null;
	}

	/**
	 * Private: Determine cache TTL based on content type
	 */
	_determineCacheTTL(type) {
		return this.cacheTTL[type] || this.cacheTTL.staticContent;
	}

	/**
	 * Private: Generate fallback SEO data
	 */
	_generateFallbackSEO(pageConfig) {
		return {
			metadata: {
				title: "Local Business Directory",
				description: "Find and discover local businesses in your area",
				robots: "index,follow",
			},
			structuredData: null,
			performance: {
				cached: false,
				fallback: true,
				generatedAt: new Date().toISOString(),
			},
		};
	}

	/**
	 * Private: Update performance metrics
	 */
	_updatePerformanceMetrics(duration, cacheHit) {
		this.performanceMetrics.totalRequests++;

		if (!cacheHit) {
			const currentAvg = this.performanceMetrics.avgGenerationTime;
			const totalNonCached = this.cacheMisses;
			this.performanceMetrics.avgGenerationTime = (currentAvg * (totalNonCached - 1) + duration) / totalNonCached;
		}

		const totalRequests = this.cacheHits + this.cacheMisses;
		this.performanceMetrics.cacheHitRate = (this.cacheHits / totalRequests) * 100;
	}

	/**
	 * Private: Clean up expired cache entries
	 */
	_cleanupExpiredCache() {
		const now = Date.now();
		let cleaned = 0;

		for (const [key, value] of this.cache) {
			if (now > value.expires) {
				this.cache.delete(key);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			logger.debug(`Cleaned up ${cleaned} expired SEO cache entries`);
		}
	}

	/**
	 * Private: Execute promises in batches to prevent overwhelming the system
	 */
	async _executeBatched(promises, batchSize) {
		for (let i = 0; i < promises.length; i += batchSize) {
			const batch = promises.slice(i, i + batchSize);
			await Promise.allSettled(batch);

			// Small delay between batches to prevent overwhelming the database
			if (i + batchSize < promises.length) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}
	}

	/**
	 * Private: Generate performance recommendations
	 */
	_generatePerformanceRecommendations() {
		const recommendations = [];
		const metrics = this.performanceMetrics;

		if (metrics.cacheHitRate < 60) {
			recommendations.push("Consider increasing cache TTL or implementing cache warming");
		}

		if (metrics.avgGenerationTime > 300) {
			recommendations.push("SEO generation time is high - consider optimizing database queries");
		}

		if (this.cache.size > 1000) {
			recommendations.push("Cache size is large - consider implementing LRU eviction");
		}

		return recommendations;
	}
}

// Create cached functions for server-side use
export const generateCachedBusinessSEO = cache(async (businessId, options = {}) => {
	const optimizer = new SEOPerformanceOptimizer();
	return optimizer.generateOptimizedSEO(
		{
			type: "business",
			data: { id: businessId },
		},
		options
	);
});

export const generateCachedCategorySEO = cache(async (categorySlug, options = {}) => {
	const optimizer = new SEOPerformanceOptimizer();
	return optimizer.generateOptimizedSEO(
		{
			type: "category",
			data: { slug: categorySlug },
		},
		options
	);
});

export const generateCachedLocationSEO = cache(async (location, options = {}) => {
	const optimizer = new SEOPerformanceOptimizer();
	return optimizer.generateOptimizedSEO(
		{
			type: "location",
			data: { location },
		},
		options
	);
});

// Export singleton instance
export const seoPerformanceOptimizer = new SEOPerformanceOptimizer();
