/**
 * SEO Data Integration Layer
 * Fetches real data from Supabase for advanced SEO optimization
 * Replaces all placeholder functions with actual database queries
 */

import { supabase } from "@lib/database/supabase/client";
import logger from "./logger.js";

/**
 * SEO-optimized data fetching with caching and performance monitoring
 */
export class SEODataIntegration {
	constructor() {
		this.cacheManager = new Map();
		this.cacheTTL = 10 * 60 * 1000; // 10 minutes
		this.pooledClient = supabase;
	}

	/**
	 * Get comprehensive business data for SEO optimization
	 */
	async getBusinessSEOData(businessId, options = {}) {
		const startTime = performance.now();
		const cacheKey = `business_seo_${businessId}_${JSON.stringify(options)}`;

		// Check cache first
		const cached = this._getFromCache(cacheKey);
		if (cached) {
			logger.performance(`Business SEO data cache hit: ${businessId}`);
			return cached;
		}

		try {
			const { data: business, error } = await this.pooledClient
				.from("businesses")
				.select(
					`
          *,
          business_categories(
            category:categories(
              id, name, slug, description, icon, seo_metadata, topic_cluster_data
            )
          ),
          business_photos(
            id, url, alt_text, caption, is_primary, order
          ),
          reviews(
            id, rating, title, text, created_at, helpful_count, status,
            sentiment_score, topic_tags, seo_value_score, user_id
          ),
          owner_id
        `
				)
				.eq("id", businessId)
				.eq("status", "published")
				.single();

			if (error) {
				logger.error("Failed to fetch business SEO data:", error);
				return null;
			}

			// Enhance with SEO-specific calculations
			const seoData = this._enhanceBusinessDataForSEO(business);

			// Cache the result
			this._setCache(cacheKey, seoData);

			const duration = performance.now() - startTime;
			logger.performance(`Business SEO data fetched in ${duration.toFixed(2)}ms`);

			return seoData;
		} catch (error) {
			logger.error("Business SEO data fetch error:", error);
			return null;
		}
	}

	/**
	 * Get all categories with SEO enhancement data
	 */
	async getCategoriesSEOData() {
		const cacheKey = "categories_seo_data";
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: categories, error } = await this.pooledClient
				.from("categories")
				.select(
					`
          *,
          business_categories(
            business:businesses(
              id, name, slug, rating, review_count, verified, featured,
              topical_authority_score, community_engagement_score
            )
          )
        `
				)
				.eq("is_active", true)
				.order("order", { ascending: true });

			if (error) {
				logger.error("Failed to fetch categories SEO data:", error);
				return [];
			}

			// Calculate SEO metrics for each category
			const enhancedCategories = categories.map((category) => ({
				...category,
				businessCount: category.business_categories?.length || 0,
				averageRating: this._calculateAverageRating(category.business_categories),
				totalReviews: this._calculateTotalReviews(category.business_categories),
				topBusinesses: this._getTopBusinesses(category.business_categories),
				seoKeywords: this._generateCategoryKeywords(category),
			}));

			this._setCache(cacheKey, enhancedCategories);
			return enhancedCategories;
		} catch (error) {
			logger.error("Categories SEO data fetch error:", error);
			return [];
		}
	}

	/**
	 * Get review insights for SEO optimization
	 */
	async getReviewSEOInsights(businessId) {
		const cacheKey = `review_seo_insights_${businessId}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: reviews, error } = await this.pooledClient
				.from("reviews")
				.select(
					`
          id, rating, title, text, created_at, helpful_count, user_id
        `
				)
				.eq("business_id", businessId)
				.eq("status", "approved")
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) {
				logger.error("Failed to fetch review SEO insights:", error);
				return null;
			}

			const insights = {
				totalReviews: reviews.length,
				averageRating: this._calculateAverageFromReviews(reviews),
				recentReviews: reviews.slice(0, 5),
				topReviews: this._getTopReviews(reviews),
				sentimentAnalysis: this._analyzeSentiment(reviews),
				commonKeywords: this._extractReviewKeywords(reviews),
				monthlyTrends: this._calculateMonthlyTrends(reviews),
				responseRate: await this._getBusinessResponseRate(businessId),
			};

			this._setCache(cacheKey, insights);
			return insights;
		} catch (error) {
			logger.error("Review SEO insights fetch error:", error);
			return null;
		}
	}

	/**
	 * Get location-based SEO data
	 */
	async getLocationSEOData(city, state) {
		const cacheKey = `location_seo_${city}_${state}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: businesses, error } = await this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, slug, description, address, latitude, longitude,
          rating, review_count, verified, featured,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("city", city)
				.eq("state", state)
				.eq("status", "published")
				.order("rating", { ascending: false })
				.order("review_count", { ascending: false });

			if (error) {
				logger.error("Failed to fetch location SEO data:", error);
				return null;
			}

			const locationData = {
				totalBusinesses: businesses.length,
				topBusinesses: businesses.slice(0, 10),
				categoryDistribution: this._getCategoryDistribution(businesses),
				averageRating: this._calculateAverageFromBusinesses(businesses),
				totalReviews: businesses.reduce((sum, b) => sum + (b.review_count || 0), 0),
				geographicCenter: this._calculateGeographicCenter(businesses),
				popularCategories: this._getPopularCategories(businesses),
				featuredBusinesses: businesses.filter((b) => b.featured),
				verifiedBusinesses: businesses.filter((b) => b.verified),
			};

			this._setCache(cacheKey, locationData);
			return locationData;
		} catch (error) {
			logger.error("Location SEO data fetch error:", error);
			return null;
		}
	}

	/**
	 * Get trending and recent content for freshness indicators
	 */
	async getFreshnessIndicators(businessId) {
		const cacheKey = `freshness_${businessId}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			// Get recent reviews
			const { data: recentReviews } = await this.pooledClient
				.from("reviews")
				.select("created_at, rating")
				.eq("business_id", businessId)
				.eq("status", "approved")
				.gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
				.order("created_at", { ascending: false });

			// Get business updates
			const { data: business } = await this.pooledClient.from("businesses").select("updated_at, created_at").eq("id", businessId).single();

			const indicators = {
				lastUpdated: business?.updated_at,
				recentActivity: recentReviews?.length > 0,
				recentReviewCount: recentReviews?.length || 0,
				lastReviewDate: recentReviews?.[0]?.created_at,
				businessAge: this._calculateBusinessAge(business?.created_at),
				activityScore: this._calculateActivityScore(recentReviews),
			};

			this._setCache(cacheKey, indicators);
			return indicators;
		} catch (error) {
			logger.error("Freshness indicators fetch error:", error);
			return null;
		}
	}

	/**
	 * Get entity relationships for semantic optimization
	 */
	async getEntityRelationships(businessId) {
		const cacheKey = `entity_relationships_${businessId}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: business } = await this.pooledClient
				.from("businesses")
				.select(
					`
          *,
          business_categories(
            category:categories(*)
          )
        `
				)
				.eq("id", businessId)
				.single();

			if (!business) return null;

			// Find related businesses
			const { data: relatedBusinesses } = await this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, slug, rating, review_count,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("city", business.city)
				.eq("state", business.state)
				.neq("id", businessId)
				.eq("status", "published")
				.limit(10);

			const relationships = {
				primaryEntity: {
					type: "LocalBusiness",
					name: business.name,
					location: `${business.city}, ${business.state}`,
					categories: business.business_categories?.map((bc) => bc.category) || [],
				},
				relatedEntities: {
					sameLocation: relatedBusinesses?.filter((rb) => rb.business_categories?.some((bc1) => business.business_categories?.some((bc2) => bc1.category.slug === bc2.category.slug))) || [],
					sameCategory: relatedBusinesses || [],
					competitorAnalysis: this._analyzeCompetitors(business, relatedBusinesses || []),
				},
				semanticMapping: {
					location: {
						city: business.city,
						state: business.state,
						country: business.country || "US",
					},
					categories:
						business.business_categories?.map((bc) => ({
							name: bc.category.name,
							slug: bc.category.slug,
							semanticKeywords: this._generateSemanticKeywords(bc.category),
						})) || [],
				},
			};

			this._setCache(cacheKey, relationships);
			return relationships;
		} catch (error) {
			logger.error("Entity relationships fetch error:", error);
			return null;
		}
	}

	/**
	 * Get FAQ data from reviews and common questions
	 */
	async getFAQData(businessId) {
		const cacheKey = `faq_data_${businessId}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: reviews } = await this.pooledClient.from("reviews").select("text, title, rating").eq("business_id", businessId).eq("status", "approved").order("helpful_count", { ascending: false }).limit(100);

			const faqData = {
				commonQuestions: this._extractCommonQuestions(reviews || []),
				userConcerns: this._identifyUserConcerns(reviews || []),
				popularTopics: this._extractPopularTopics(reviews || []),
				answersFromReviews: this._generateAnswersFromReviews(reviews || []),
			};

			this._setCache(cacheKey, faqData);
			return faqData;
		} catch (error) {
			logger.error("FAQ data fetch error:", error);
			return null;
		}
	}

	// Enhanced business data for SEO
	_enhanceBusinessDataForSEO(business) {
		return {
			...business,
			seoEnhancements: {
				primaryKeywords: this._generatePrimaryKeywords(business),
				longTailKeywords: this._generateLongTailKeywords(business),
				localKeywords: this._generateLocalKeywords(business),
				semanticKeywords: this._generateSemanticKeywords(business),
				contentScore: this._calculateContentScore(business),
				authorityScore: this._calculateAuthorityScore(business),
				freshnessScore: this._calculateFreshnessScore(business),
			},
		};
	}

	// Helper methods for SEO calculations
	_generatePrimaryKeywords(business) {
		const keywords = [business.name];

		if (business.business_categories) {
			business.business_categories.forEach((bc) => {
				if (bc.category) {
					keywords.push(bc.category.name);
					keywords.push(`${bc.category.name} ${business.city}`);
					keywords.push(`${bc.category.name} ${business.state}`);
				}
			});
		}

		return [...new Set(keywords)];
	}

	_generateLongTailKeywords(business) {
		const keywords = [];

		if (business.business_categories) {
			business.business_categories.forEach((bc) => {
				if (bc.category) {
					keywords.push(`best ${bc.category.name} in ${business.city}`);
					keywords.push(`${bc.category.name} near me ${business.city}`);
					keywords.push(`top rated ${bc.category.name} ${business.city} ${business.state}`);
					keywords.push(`${business.name} ${bc.category.name} reviews`);
				}
			});
		}

		return keywords;
	}

	_generateLocalKeywords(business) {
		return [`${business.name} ${business.city}`, `${business.name} ${business.state}`, `${business.city} businesses`, `${business.city} ${business.state} directory`, `local businesses ${business.city}`];
	}

	_generateSemanticKeywords(entity) {
		if (typeof entity === "string") {
			// Simple keyword generation for string inputs
			return [entity, `${entity} services`, `${entity} business`];
		}

		const keywords = [];
		if (entity.name) keywords.push(entity.name);
		if (entity.description) {
			// Extract key terms from description
			const terms = entity.description
				.toLowerCase()
				.split(/\s+/)
				.filter((term) => term.length > 3)
				.slice(0, 10);
			keywords.push(...terms);
		}
		return [...new Set(keywords)];
	}

	_calculateContentScore(business) {
		let score = 0;
		if (business.description && business.description.length > 100) score += 20;
		if (business.photos && business.photos.length > 0) score += 15;
		if (business.website) score += 10;
		if (business.phone) score += 10;
		if (business.hours) score += 15;
		if (business.review_count > 5) score += 20;
		if (business.rating > 4) score += 10;
		return Math.min(score, 100);
	}

	_calculateAuthorityScore(business) {
		let score = 0;
		if (business.verified) score += 30;
		if (business.featured) score += 20;
		if (business.review_count > 10) score += 25;
		if (business.rating > 4.5) score += 25;
		return Math.min(score, 100);
	}

	_calculateFreshnessScore(business) {
		const now = new Date();
		const updated = new Date(business.updated_at);
		const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);

		if (daysSinceUpdate < 7) return 100;
		if (daysSinceUpdate < 30) return 80;
		if (daysSinceUpdate < 90) return 60;
		if (daysSinceUpdate < 180) return 40;
		return 20;
	}

	_calculateAverageRating(businessCategories) {
		if (!businessCategories || businessCategories.length === 0) return 0;
		const validRatings = businessCategories.map((bc) => bc.business?.rating).filter((rating) => rating && rating > 0);

		if (validRatings.length === 0) return 0;
		return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
	}

	_calculateTotalReviews(businessCategories) {
		if (!businessCategories || businessCategories.length === 0) return 0;
		return businessCategories.reduce((sum, bc) => sum + (bc.business?.review_count || 0), 0);
	}

	_getTopBusinesses(businessCategories, limit = 5) {
		if (!businessCategories || businessCategories.length === 0) return [];
		return businessCategories
			.map((bc) => bc.business)
			.filter((business) => business && business.rating > 0)
			.sort((a, b) => b.rating * b.review_count - a.rating * a.review_count)
			.slice(0, limit);
	}

	_generateCategoryKeywords(category) {
		const keywords = [category.name, category.slug];
		if (category.description) {
			const words = category.description.split(/\s+/).filter((word) => word.length > 3);
			keywords.push(...words.slice(0, 10));
		}
		return [...new Set(keywords)];
	}

	_calculateAverageFromReviews(reviews) {
		if (!reviews || reviews.length === 0) return 0;
		return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
	}

	_getTopReviews(reviews) {
		return reviews
			.filter((review) => review.helpful_count > 0)
			.sort((a, b) => b.helpful_count - a.helpful_count)
			.slice(0, 5);
	}

	_analyzeSentiment(reviews) {
		// Simple sentiment analysis based on ratings and keywords
		const positive = reviews.filter((r) => r.rating >= 4).length;
		const negative = reviews.filter((r) => r.rating <= 2).length;
		const neutral = reviews.length - positive - negative;

		return {
			positive: (positive / reviews.length) * 100,
			negative: (negative / reviews.length) * 100,
			neutral: (neutral / reviews.length) * 100,
			overall: positive > negative ? "positive" : negative > positive ? "negative" : "neutral",
		};
	}

	_extractReviewKeywords(reviews) {
		const allText = reviews.map((r) => `${r.title || ""} ${r.text || ""}`).join(" ");
		const words = allText
			.toLowerCase()
			.replace(/[^\w\s]/g, " ")
			.split(/\s+/)
			.filter((word) => word.length > 3);

		const frequency = {};
		words.forEach((word) => {
			frequency[word] = (frequency[word] || 0) + 1;
		});

		return Object.entries(frequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 20)
			.map(([word]) => word);
	}

	_calculateMonthlyTrends(reviews) {
		const trends = {};
		reviews.forEach((review) => {
			const month = new Date(review.created_at).toISOString().slice(0, 7);
			if (!trends[month]) {
				trends[month] = { count: 0, totalRating: 0 };
			}
			trends[month].count++;
			trends[month].totalRating += review.rating;
		});

		Object.keys(trends).forEach((month) => {
			trends[month].averageRating = trends[month].totalRating / trends[month].count;
		});

		return trends;
	}

	async _getBusinessResponseRate(businessId) {
		try {
			const { data: reviews } = await this.pooledClient.from("reviews").select("id, response").eq("business_id", businessId);

			if (!reviews || reviews.length === 0) return 0;

			const responsesCount = reviews.filter((r) => r.response && r.response.trim()).length;
			return (responsesCount / reviews.length) * 100;
		} catch (error) {
			return 0;
		}
	}

	_getCategoryDistribution(businesses) {
		const distribution = {};
		businesses.forEach((business) => {
			if (business.business_categories) {
				business.business_categories.forEach((bc) => {
					if (bc.category) {
						const categoryName = bc.category.name;
						distribution[categoryName] = (distribution[categoryName] || 0) + 1;
					}
				});
			}
		});
		return distribution;
	}

	_calculateAverageFromBusinesses(businesses) {
		const validRatings = businesses.filter((b) => b.rating > 0);
		if (validRatings.length === 0) return 0;
		return validRatings.reduce((sum, b) => sum + b.rating, 0) / validRatings.length;
	}

	_calculateGeographicCenter(businesses) {
		const validCoords = businesses.filter((b) => b.latitude && b.longitude);
		if (validCoords.length === 0) return null;

		const avgLat = validCoords.reduce((sum, b) => sum + b.latitude, 0) / validCoords.length;
		const avgLng = validCoords.reduce((sum, b) => sum + b.longitude, 0) / validCoords.length;

		return { latitude: avgLat, longitude: avgLng };
	}

	_getPopularCategories(businesses) {
		const categoryCount = this._getCategoryDistribution(businesses);
		return Object.entries(categoryCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([name, count]) => ({ name, count }));
	}

	_calculateBusinessAge(createdAt) {
		if (!createdAt) return null;
		const created = new Date(createdAt);
		const now = new Date();
		const diffTime = Math.abs(now - created);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	_calculateActivityScore(recentReviews) {
		if (!recentReviews || recentReviews.length === 0) return 0;

		const score = Math.min(recentReviews.length * 10, 100);
		const avgRating = this._calculateAverageFromReviews(recentReviews);
		return Math.round((score + avgRating * 10) / 2);
	}

	_analyzeCompetitors(business, relatedBusinesses) {
		return {
			totalCompetitors: relatedBusinesses.length,
			betterRated: relatedBusinesses.filter((rb) => rb.rating > business.rating).length,
			moreReviews: relatedBusinesses.filter((rb) => rb.review_count > business.review_count).length,
			marketPosition: this._calculateMarketPosition(business, relatedBusinesses),
		};
	}

	_calculateMarketPosition(business, competitors) {
		const allBusinesses = [business, ...competitors];
		const sortedByRating = allBusinesses.sort((a, b) => b.rating - a.rating);
		const ratingPosition = sortedByRating.findIndex((b) => b.id === business.id) + 1;

		const sortedByReviews = allBusinesses.sort((a, b) => b.review_count - a.review_count);
		const reviewPosition = sortedByReviews.findIndex((b) => b.id === business.id) + 1;

		return {
			ratingRank: ratingPosition,
			reviewRank: reviewPosition,
			overall: Math.round((ratingPosition + reviewPosition) / 2),
			totalMarket: allBusinesses.length,
		};
	}

	_extractCommonQuestions(reviews) {
		const questions = [];
		reviews.forEach((review) => {
			const text = `${review.title || ""} ${review.text || ""}`;

			// Common business questions patterns
			if (text.toLowerCase().includes("hours") || text.toLowerCase().includes("open")) {
				questions.push("What are the business hours?");
			}
			if (text.toLowerCase().includes("parking")) {
				questions.push("Is parking available?");
			}
			if (text.toLowerCase().includes("price") || text.toLowerCase().includes("cost")) {
				questions.push("What are the prices?");
			}
			if (text.toLowerCase().includes("reservation") || text.toLowerCase().includes("appointment")) {
				questions.push("Do I need a reservation?");
			}
			if (text.toLowerCase().includes("location") || text.toLowerCase().includes("address")) {
				questions.push("Where is this business located?");
			}
		});

		// Remove duplicates and return top questions
		return [...new Set(questions)].slice(0, 10);
	}

	_identifyUserConcerns(reviews) {
		const concerns = {};
		const negativeReviews = reviews.filter((r) => r.rating <= 3);

		negativeReviews.forEach((review) => {
			const text = `${review.title || ""} ${review.text || ""}`.toLowerCase();

			if (text.includes("wait") || text.includes("slow")) {
				concerns["Wait Times"] = (concerns["Wait Times"] || 0) + 1;
			}
			if (text.includes("staff") || text.includes("service")) {
				concerns["Customer Service"] = (concerns["Customer Service"] || 0) + 1;
			}
			if (text.includes("clean") || text.includes("dirty")) {
				concerns["Cleanliness"] = (concerns["Cleanliness"] || 0) + 1;
			}
			if (text.includes("price") || text.includes("expensive")) {
				concerns["Pricing"] = (concerns["Pricing"] || 0) + 1;
			}
			if (text.includes("quality")) {
				concerns["Quality"] = (concerns["Quality"] || 0) + 1;
			}
		});

		return Object.entries(concerns)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([concern, count]) => ({ concern, mentions: count }));
	}

	_extractPopularTopics(reviews) {
		const topics = {};
		reviews.forEach((review) => {
			const text = `${review.title || ""} ${review.text || ""}`.toLowerCase();

			// Extract meaningful topics
			const words = text.split(/\s+/).filter((word) => word.length > 4);
			words.forEach((word) => {
				topics[word] = (topics[word] || 0) + 1;
			});
		});

		return Object.entries(topics)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 15)
			.map(([topic, count]) => ({ topic, mentions: count }));
	}

	_generateAnswersFromReviews(reviews) {
		const positiveReviews = reviews.filter((r) => r.rating >= 4);
		const answers = {};

		positiveReviews.forEach((review) => {
			const text = `${review.title || ""} ${review.text || ""}`;

			if (text.toLowerCase().includes("recommend")) {
				answers["Why should I choose this business?"] = text.slice(0, 200) + "...";
			}
			if (text.toLowerCase().includes("experience")) {
				answers["What can I expect?"] = text.slice(0, 200) + "...";
			}
			if (text.toLowerCase().includes("best") || text.toLowerCase().includes("great")) {
				answers["What makes this business special?"] = text.slice(0, 200) + "...";
			}
		});

		return answers;
	}

	// Cache management
	_getFromCache(key) {
		const cached = this.cacheManager.get(key);
		if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
			return cached.data;
		}
		this.cacheManager.delete(key);
		return null;
	}

	_setCache(key, data) {
		this.cacheManager.set(key, {
			data,
			timestamp: Date.now(),
			hitCount: 0,
		});
	}

	/**
	 * Performance optimization: Pre-warm cache for popular businesses
	 */
	async preWarmCache(businessIds = []) {
		logger.info(`Pre-warming SEO cache for ${businessIds.length} businesses`);

		const promises = businessIds.map(async (businessId) => {
			try {
				await this.getBusinessSEOData(businessId);
				await this.getReviewInsights(businessId);
				await this.getFreshnessIndicators(businessId);
			} catch (error) {
				logger.warn(`Failed to pre-warm cache for business ${businessId}:`, error.message);
			}
		});

		await Promise.allSettled(promises);
		logger.performance(`Cache pre-warming completed for ${businessIds.length} businesses`);
	}

	/**
	 * Clean up expired cache entries for memory management
	 */
	cleanupCache() {
		const beforeSize = this.cacheManager.size;
		const now = Date.now();

		for (const [key, { timestamp }] of this.cacheManager.entries()) {
			if (now - timestamp > this.cacheTTL) {
				this.cacheManager.delete(key);
			}
		}

		const afterSize = this.cacheManager.size;
		logger.performance(`Cache cleanup: removed ${beforeSize - afterSize} expired entries`);
	}

	/**
	 * Get cache statistics for monitoring
	 */
	getCacheStats() {
		const now = Date.now();
		let hits = 0;
		let expired = 0;

		for (const [key, { timestamp, hitCount }] of this.cacheManager.entries()) {
			if (now - timestamp > this.cacheTTL) {
				expired++;
			} else {
				hits += hitCount || 0;
			}
		}

		return {
			totalEntries: this.cacheManager.size,
			expiredEntries: expired,
			totalHits: hits,
			hitRate: hits > 0 ? hits / (hits + this.cacheManager.size - expired) : 0,
			memoryUsage: this._estimateMemoryUsage(),
		};
	}

	_estimateMemoryUsage() {
		let totalSize = 0;
		for (const [key, value] of this.cacheManager.entries()) {
			totalSize += JSON.stringify({ key, value }).length;
		}
		return Math.round(totalSize / 1024); // KB
	}

	/**
	 * Get popular businesses for cache warming
	 */
	async getPopularBusinesses(limit = 50) {
		const cacheKey = `popular_businesses_${limit}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: businesses, error } = await this.pooledClient.from("businesses").select("id, name, slug, rating, review_count, city, state, featured").eq("status", "published").order("featured", { ascending: false }).order("rating", { ascending: false }).order("review_count", { ascending: false }).limit(limit);

			if (error) throw error;

			this._setCache(cacheKey, businesses || []);
			return businesses || [];
		} catch (error) {
			logger.error("Failed to get popular businesses:", error);
			return [];
		}
	}

	/**
	 * Get active categories for SEO optimization
	 */
	async getActiveCategories() {
		const cacheKey = "active_categories";
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: categories, error } = await this.pooledClient
				.from("categories")
				.select(
					`
					id, name, slug, description, icon,
					business_categories(count)
				`
				)
				.eq("is_active", true)
				.order("name");

			if (error) throw error;

			// Sort by business count
			const sortedCategories = (categories || []).sort((a, b) => (b.business_categories?.length || 0) - (a.business_categories?.length || 0));

			this._setCache(cacheKey, sortedCategories);
			return sortedCategories;
		} catch (error) {
			logger.error("Failed to get active categories:", error);
			return [];
		}
	}

	/**
	 * Get popular locations for SEO optimization
	 */
	async getPopularLocations(limit = 30) {
		const cacheKey = `popular_locations_${limit}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: locations, error } = await this.pooledClient.from("businesses").select("city, state").eq("status", "published").not("city", "is", null).not("state", "is", null);

			if (error) throw error;

			// Count businesses by location
			const locationCounts = {};
			(locations || []).forEach(({ city, state }) => {
				const key = `${city}, ${state}`;
				locationCounts[key] = (locationCounts[key] || 0) + 1;
			});

			// Sort by count and return top locations
			const popularLocations = Object.entries(locationCounts)
				.sort(([, a], [, b]) => b - a)
				.slice(0, limit)
				.map(([location, count]) => ({ location, count }));

			this._setCache(cacheKey, popularLocations);
			return popularLocations;
		} catch (error) {
			logger.error("Failed to get popular locations:", error);
			return [];
		}
	}

	/**
	 * Get category SEO data
	 */
	async getCategorySEOData(categorySlug) {
		const cacheKey = `category_seo_${categorySlug}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const { data: category, error } = await this.pooledClient
				.from("categories")
				.select(
					`
					*,
					business_categories(
						business:businesses(
							id, name, slug, rating, review_count, city, state, verified, featured
						)
					)
				`
				)
				.eq("slug", categorySlug)
				.eq("is_active", true)
				.single();

			if (error) throw error;

			const seoData = {
				category,
				businessCount: category?.business_categories?.length || 0,
				topBusinesses:
					category?.business_categories
						?.map((bc) => bc.business)
						?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
						?.slice(0, 10) || [],
				locations: this._extractUniqueLocations(category?.business_categories?.map((bc) => bc.business) || []),
				lastUpdated: new Date().toISOString(),
			};

			this._setCache(cacheKey, seoData);
			return seoData;
		} catch (error) {
			logger.error("Failed to get category SEO data:", error);
			return { category: null, businessCount: 0, topBusinesses: [], locations: [] };
		}
	}

	/**
	 * Get location SEO data
	 */
	async getLocationSEOData(location) {
		const cacheKey = `location_seo_${location}`;
		const cached = this._getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const [city, state] = location.split(", ");

			const { data: businesses, error } = await this.pooledClient
				.from("businesses")
				.select(
					`
					id, name, slug, rating, review_count, verified, featured,
					business_categories(
						category:categories(name, slug)
					)
				`
				)
				.eq("city", city)
				.eq("state", state)
				.eq("status", "published")
				.order("featured", { ascending: false })
				.order("rating", { ascending: false })
				.limit(50);

			if (error) throw error;

			const categories = [...new Set((businesses || []).flatMap((b) => b.business_categories?.map((bc) => bc.category) || []).filter(Boolean))];

			const seoData = {
				location,
				city,
				state,
				businessCount: businesses?.length || 0,
				topBusinesses: businesses?.slice(0, 10) || [],
				categories: categories.slice(0, 15),
				averageRating: this._calculateAverageRating(businesses || []),
				lastUpdated: new Date().toISOString(),
			};

			this._setCache(cacheKey, seoData);
			return seoData;
		} catch (error) {
			logger.error("Failed to get location SEO data:", error);
			return { location, businessCount: 0, topBusinesses: [], categories: [] };
		}
	}

	/**
	 * Extract unique locations from business list
	 */
	_extractUniqueLocations(businesses) {
		const locations = new Set();
		businesses.forEach((business) => {
			if (business.city && business.state) {
				locations.add(`${business.city}, ${business.state}`);
			}
		});
		return Array.from(locations);
	}

	/**
	 * Calculate average rating from business list
	 */
	_calculateAverageRating(businesses) {
		const ratingsSum = businesses.reduce((sum, business) => sum + (business.rating || 0), 0);
		const businessesWithRatings = businesses.filter((b) => b.rating > 0).length;
		return businessesWithRatings > 0 ? (ratingsSum / businessesWithRatings).toFixed(1) : 0;
	}
}

// Export singleton instance with performance monitoring
export const seoDataIntegration = new SEODataIntegration();

// Schedule periodic cache cleanup
if (typeof setInterval !== "undefined") {
	setInterval(
		() => {
			seoDataIntegration.cleanupCache();
		},
		15 * 60 * 1000
	); // Clean up every 15 minutes
}
