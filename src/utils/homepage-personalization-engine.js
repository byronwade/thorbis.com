/**
 * Homepage Personalization Engine
 * Amazon-style intelligent homepage generation based on user behavior
 * Creates dynamic sections personalized to individual users
 */

import { getPooledClient } from "@lib/database/supabase/client";
import logger from "./logger.js";
import { cache } from "react";

export class HomepagePersonalizationEngine {
	constructor() {
		this.pooledClient = getPooledClient("personalization");
		this.cacheManager = new Map();
		this.cacheTTL = 5 * 60 * 1000; // 5 minutes for real-time personalization

		// Personalization weights for different signals
		this.weights = {
			searchHistory: 0.35,
			clickHistory: 0.25,
			pageViews: 0.2,
			timeSpent: 0.15,
			geolocation: 0.05,
		};

		// Business category mappings
		this.categoryMappings = {
			restaurants: ["restaurant", "cafe", "bar", "food", "dining"],
			retail: ["shop", "store", "boutique", "mall", "shopping"],
			services: ["salon", "spa", "clinic", "gym", "fitness"],
			automotive: ["mechanic", "car", "auto", "repair"],
			professional: ["lawyer", "dentist", "doctor", "accountant"],
		};
	}

	/**
	 * Generate personalized homepage for a user
	 */
	async generatePersonalizedHomepage(userId = null, sessionId = null, location = null) {
		const startTime = performance.now();
		const cacheKey = `homepage_${userId || sessionId}_${location}`;

		// Check cache first
		const cached = this._getFromCache(cacheKey);
		if (cached) {
			logger.performance(`Personalized homepage cache hit: ${cacheKey}`);
			return cached;
		}

		try {
			// Gather user behavior data
			const behaviorData = await this.getUserBehaviorData(userId, sessionId);

			// Analyze user preferences
			const preferences = await this.analyzeUserPreferences(behaviorData);

			// Generate personalized sections
			const personalizedSections = await this.generateSections(preferences, location);

			// Apply A/B testing variations
			const optimizedSections = await this.applyABTesting(personalizedSections, userId);

			const homepage = {
				sections: optimizedSections,
				metadata: {
					personalizationScore: preferences.confidence,
					generatedAt: new Date().toISOString(),
					userId: userId || "anonymous",
					sessionId,
					version: "2.0",
				},
				performance: {
					generationTime: performance.now() - startTime,
					cacheStatus: "miss",
				},
			};

			// Cache the result
			this._setCache(cacheKey, homepage);

			logger.performance(`Personalized homepage generated in ${homepage.performance.generationTime.toFixed(2)}ms`);

			return homepage;
		} catch (error) {
			logger.error("Failed to generate personalized homepage:", error);
			// Fallback to default homepage
			return this.getDefaultHomepage();
		}
	}

	/**
	 * Gather comprehensive user behavior data
	 */
	async getUserBehaviorData(userId, sessionId) {
		const queries = [];

		// Get user interactions
		if (sessionId) {
			queries.push(this.pooledClient.from("user_interactions").select("*").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(50));
		}

		// Get user behavior patterns
		if (sessionId) {
			queries.push(this.pooledClient.from("user_behavior_patterns").select("*").eq("session_id", sessionId).order("updated_at", { ascending: false }).limit(1));
		}

		// Get historical user data if logged in
		if (userId) {
			queries.push(this.pooledClient.from("user_preferences").select("*").eq("user_id", userId));
		}

		try {
			const results = await Promise.all(queries);

			return {
				interactions: results[0]?.data || [],
				patterns: results[1]?.data?.[0] || {},
				preferences: results[2]?.data || [],
			};
		} catch (error) {
			logger.error("Error fetching user behavior data:", error);
			return { interactions: [], patterns: {}, preferences: [] };
		}
	}

	/**
	 * Analyze user preferences from behavior data
	 */
	async analyzeUserPreferences(behaviorData) {
		const { interactions, patterns, preferences } = behaviorData;

		const analysis = {
			businessTypes: {},
			locations: {},
			priceRanges: {},
			features: {},
			timePatterns: {},
			confidence: 0,
		};

		// Analyze interactions
		interactions.forEach((interaction) => {
			const data = interaction.interaction_data;

			if (interaction.interaction_type === "search") {
				this.analyzeSearchInteraction(data, analysis);
			} else if (interaction.interaction_type === "click") {
				this.analyzeClickInteraction(data, analysis);
			}
		});

		// Incorporate stored patterns
		if (patterns.patterns) {
			this.incorporateStoredPatterns(patterns.patterns, analysis);
		}

		// Apply user preferences
		preferences.forEach((pref) => {
			this.applyUserPreference(pref, analysis);
		});

		// Calculate confidence score
		analysis.confidence = this.calculateConfidenceScore(analysis, interactions.length);

		logger.debug("User preference analysis completed", {
			confidence: analysis.confidence,
			topBusinessTypes: Object.entries(analysis.businessTypes)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 3),
		});

		return analysis;
	}

	/**
	 * Analyze search interactions for preferences
	 */
	analyzeSearchInteraction(searchData, analysis) {
		const query = searchData.query?.toLowerCase() || "";

		// Extract business types
		Object.entries(this.categoryMappings).forEach(([category, keywords]) => {
			keywords.forEach((keyword) => {
				if (query.includes(keyword)) {
					analysis.businessTypes[category] = (analysis.businessTypes[category] || 0) + 2;
				}
			});
		});

		// Extract location preferences
		if (searchData.filters?.location) {
			const location = searchData.filters.location;
			analysis.locations[location] = (analysis.locations[location] || 0) + 1;
		}

		// Extract price preferences
		const priceWords = {
			budget: ["cheap", "budget", "affordable"],
			premium: ["expensive", "luxury", "premium", "upscale"],
		};

		Object.entries(priceWords).forEach(([range, words]) => {
			if (words.some((word) => query.includes(word))) {
				analysis.priceRanges[range] = (analysis.priceRanges[range] || 0) + 1;
			}
		});
	}

	/**
	 * Analyze click interactions for preferences
	 */
	analyzeClickInteraction(clickData, analysis) {
		const text = clickData.text?.toLowerCase() || "";
		const href = clickData.href || "";

		// Analyze clicked business types
		if (href.includes("/business/") || clickData.elementId?.includes("business")) {
			// Extract business category from context
			Object.entries(this.categoryMappings).forEach(([category, keywords]) => {
				if (keywords.some((keyword) => text.includes(keyword))) {
					analysis.businessTypes[category] = (analysis.businessTypes[category] || 0) + 1;
				}
			});
		}

		// Track feature clicks
		const featureClicks = {
			directions: ["directions", "map", "location"],
			phone: ["call", "phone", "tel:"],
			website: ["website", "visit"],
			reviews: ["review", "rating"],
		};

		Object.entries(featureClicks).forEach(([feature, indicators]) => {
			if (indicators.some((indicator) => text.includes(indicator) || href.includes(indicator))) {
				analysis.features[feature] = (analysis.features[feature] || 0) + 1;
			}
		});
	}

	/**
	 * Incorporate stored user patterns
	 */
	incorporateStoredPatterns(patterns, analysis) {
		if (patterns.businessTypes) {
			patterns.businessTypes.forEach((type) => {
				analysis.businessTypes[type] = (analysis.businessTypes[type] || 0) + 3;
			});
		}

		if (patterns.locations) {
			patterns.locations.forEach((location) => {
				analysis.locations[location] = (analysis.locations[location] || 0) + 2;
			});
		}

		if (patterns.priceRanges) {
			patterns.priceRanges.forEach((range) => {
				analysis.priceRanges[range] = (analysis.priceRanges[range] || 0) + 2;
			});
		}
	}

	/**
	 * Apply explicit user preferences
	 */
	applyUserPreference(preference, analysis) {
		const weight = 5; // Higher weight for explicit preferences

		if (preference.category) {
			analysis.businessTypes[preference.category] = (analysis.businessTypes[preference.category] || 0) + weight;
		}

		if (preference.location) {
			analysis.locations[preference.location] = (analysis.locations[preference.location] || 0) + weight;
		}
	}

	/**
	 * Calculate confidence score for personalization
	 */
	calculateConfidenceScore(analysis, interactionCount) {
		let score = 0;

		// Base score from interaction count
		score += Math.min(interactionCount * 0.05, 0.3);

		// Score from preference diversity
		const totalPreferences = Object.values(analysis.businessTypes).length + Object.values(analysis.locations).length + Object.values(analysis.priceRanges).length;

		score += Math.min(totalPreferences * 0.1, 0.4);

		// Score from preference strength
		const maxBusinessTypeScore = Math.max(...Object.values(analysis.businessTypes), 0);
		score += Math.min(maxBusinessTypeScore * 0.05, 0.3);

		return Math.min(score, 1.0);
	}

	/**
	 * Generate personalized homepage sections
	 */
	async generateSections(preferences, location) {
		const sections = [];

		// Hero section with personalized content
		sections.push(await this.generateHeroSection(preferences, location));

		// Featured businesses based on preferences
		sections.push(await this.generateFeaturedBusinessesSection(preferences, location));

		// Category recommendations
		sections.push(await this.generateCategoryRecommendationsSection(preferences));

		// Local spotlight
		if (location) {
			sections.push(await this.generateLocalSpotlightSection(location, preferences));
		}

		// Trending businesses
		sections.push(await this.generateTrendingSection(preferences, location));

		// Recently viewed (if applicable)
		sections.push(await this.generateRecentlyViewedSection(preferences));

		// Recommended for you
		sections.push(await this.generateRecommendedSection(preferences, location));

		return sections.filter((section) => section && section.items && section.items.length > 0);
	}

	/**
	 * Generate personalized hero section
	 */
	async generateHeroSection(preferences, location) {
		const topBusinessType = this.getTopPreference(preferences.businessTypes);
		const preferredLocation = location || this.getTopPreference(preferences.locations);

		let title = "Discover Local Businesses";
		let subtitle = "Find the best places near you";
		let searchPlaceholder = "Search for businesses...";
		let backgroundCategory = "general";

		if (topBusinessType && preferences.confidence > 0.3) {
			switch (topBusinessType) {
				case "restaurants":
					title = "Discover Amazing Restaurants";
					subtitle = "Find your next favorite dining spot";
					searchPlaceholder = "Search for restaurants...";
					backgroundCategory = "restaurants";
					break;
				case "retail":
					title = "Shop Local Businesses";
					subtitle = "Support local shops and boutiques";
					searchPlaceholder = "Search for shops...";
					backgroundCategory = "retail";
					break;
				case "services":
					title = "Find Quality Services";
					subtitle = "Professional services you can trust";
					searchPlaceholder = "Search for services...";
					backgroundCategory = "services";
					break;
			}
		}

		if (preferredLocation) {
			subtitle += ` in ${preferredLocation}`;
		}

		return {
			type: "hero",
			priority: 1,
			personalized: true,
			content: {
				title,
				subtitle,
				searchPlaceholder,
				backgroundCategory,
				cta: {
					primary: "Start Exploring",
					secondary: "Browse Categories",
				},
			},
			metadata: {
				confidence: preferences.confidence,
				basedOn: ["searchHistory", "location"],
			},
		};
	}

	/**
	 * Generate featured businesses section
	 */
	async generateFeaturedBusinessesSection(preferences, location) {
		const topBusinessTypes = this.getTopPreferences(preferences.businessTypes, 3);

		if (topBusinessTypes.length === 0) {
			// Fallback to general featured businesses
			return this.getGeneralFeaturedBusinesses(location);
		}

		try {
			let query = this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, description, rating, review_count, 
          primary_image, address, phone, website,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("status", "published")
				.eq("featured", true)
				.order("rating", { ascending: false })
				.limit(12);

			// Filter by preferred business types
			if (topBusinessTypes.length > 0) {
				query = query.in("business_categories.category.slug", topBusinessTypes);
			}

			// Filter by location if available
			if (location) {
				query = query.ilike("address", `%${location}%`);
			}

			const { data: businesses, error } = await query;

			if (error) {
				logger.error("Error fetching featured businesses:", error);
				return this.getGeneralFeaturedBusinesses(location);
			}

			return {
				type: "featured_businesses",
				priority: 2,
				personalized: true,
				title: `Featured ${this.formatBusinessType(topBusinessTypes[0])}`,
				subtitle: "Hand-picked businesses based on your interests",
				content: {
					layout: "grid",
					items: businesses || [],
				},
				metadata: {
					confidence: preferences.confidence,
					basedOn: ["businessTypePreferences", "ratings"],
				},
			};
		} catch (error) {
			logger.error("Error generating featured businesses section:", error);
			return this.getGeneralFeaturedBusinesses(location);
		}
	}

	/**
	 * Generate category recommendations section
	 */
	async generateCategoryRecommendationsSection(preferences) {
		const recommendedCategories = this.getTopPreferences(preferences.businessTypes, 6);

		if (recommendedCategories.length === 0) {
			return this.getDefaultCategories();
		}

		try {
			const { data: categories, error } = await this.pooledClient.from("categories").select("id, name, slug, description, icon, business_count").in("slug", recommendedCategories).order("business_count", { ascending: false });

			if (error) {
				logger.error("Error fetching recommended categories:", error);
				return this.getDefaultCategories();
			}

			return {
				type: "category_recommendations",
				priority: 3,
				personalized: true,
				title: "Categories You Might Like",
				subtitle: "Based on your browsing history",
				content: {
					layout: "cards",
					items: categories || [],
				},
				metadata: {
					confidence: preferences.confidence,
					basedOn: ["searchHistory", "clickHistory"],
				},
			};
		} catch (error) {
			logger.error("Error generating category recommendations:", error);
			return this.getDefaultCategories();
		}
	}

	/**
	 * Generate local spotlight section
	 */
	async generateLocalSpotlightSection(location, preferences) {
		try {
			let query = this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, description, rating, review_count,
          primary_image, address, phone,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("status", "published")
				.ilike("address", `%${location}%`)
				.gte("rating", 4.0)
				.order("review_count", { ascending: false })
				.limit(8);

			const { data: businesses, error } = await query;

			if (error || !businesses || businesses.length === 0) {
				return null;
			}

			return {
				type: "local_spotlight",
				priority: 4,
				personalized: true,
				title: `Popular in ${location}`,
				subtitle: "Highly rated businesses in your area",
				content: {
					layout: "carousel",
					items: businesses,
				},
				metadata: {
					confidence: 0.8,
					basedOn: ["location", "ratings"],
				},
			};
		} catch (error) {
			logger.error("Error generating local spotlight section:", error);
			return null;
		}
	}

	/**
	 * Generate trending section
	 */
	async generateTrendingSection(preferences, location) {
		try {
			let query = this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, description, rating, review_count,
          primary_image, address,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("status", "published")
				.gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
				.order("review_count", { ascending: false })
				.limit(6);

			if (location) {
				query = query.ilike("address", `%${location}%`);
			}

			const { data: businesses, error } = await query;

			if (error || !businesses || businesses.length === 0) {
				return null;
			}

			return {
				type: "trending",
				priority: 5,
				personalized: false,
				title: "Trending Now",
				subtitle: "Recently popular businesses",
				content: {
					layout: "list",
					items: businesses,
				},
				metadata: {
					confidence: 0.6,
					basedOn: ["recentActivity", "popularity"],
				},
			};
		} catch (error) {
			logger.error("Error generating trending section:", error);
			return null;
		}
	}

	/**
	 * Generate recently viewed section
	 */
	async generateRecentlyViewedSection(preferences) {
		// This would be implemented based on user's viewing history
		// For now, return null as we need to track page views first
		return null;
	}

	/**
	 * Generate recommended section
	 */
	async generateRecommendedSection(preferences, location) {
		const topBusinessTypes = this.getTopPreferences(preferences.businessTypes, 2);

		if (topBusinessTypes.length === 0 || preferences.confidence < 0.3) {
			return null;
		}

		try {
			let query = this.pooledClient
				.from("businesses")
				.select(
					`
          id, name, description, rating, review_count,
          primary_image, address,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("status", "published")
				.in("business_categories.category.slug", topBusinessTypes)
				.gte("rating", 4.0)
				.order("rating", { ascending: false })
				.limit(8);

			if (location) {
				query = query.ilike("address", `%${location}%`);
			}

			const { data: businesses, error } = await query;

			if (error || !businesses || businesses.length === 0) {
				return null;
			}

			return {
				type: "recommended",
				priority: 6,
				personalized: true,
				title: "Recommended for You",
				subtitle: "Based on your preferences and activity",
				content: {
					layout: "grid",
					items: businesses,
				},
				metadata: {
					confidence: preferences.confidence,
					basedOn: ["personalizedRecommendations"],
				},
			};
		} catch (error) {
			logger.error("Error generating recommended section:", error);
			return null;
		}
	}

	/**
	 * Apply A/B testing to sections
	 */
	async applyABTesting(sections, userId) {
		// Simple A/B testing implementation
		// In a real system, this would integrate with a feature flag service

		const userHash = this.hashUserId(userId || "anonymous");
		const variant = userHash % 100;

		// Test different section orders
		if (variant < 50) {
			// Variant A: Standard order
			return sections;
		} else {
			// Variant B: Prioritize local content
			return sections.sort((a, b) => {
				if (a.type === "local_spotlight") return -1;
				if (b.type === "local_spotlight") return 1;
				return a.priority - b.priority;
			});
		}
	}

	/**
	 * Get default homepage fallback
	 */
	getDefaultHomepage() {
		return {
			sections: [
				{
					type: "hero",
					priority: 1,
					personalized: false,
					content: {
						title: "Discover Local Businesses",
						subtitle: "Find the best places near you",
						searchPlaceholder: "Search for businesses...",
						backgroundCategory: "general",
					},
				},
			],
			metadata: {
				personalizationScore: 0,
				generatedAt: new Date().toISOString(),
				version: "2.0",
			},
		};
	}

	/**
	 * Utility methods
	 */
	getTopPreference(preferences) {
		if (!preferences || Object.keys(preferences).length === 0) return null;
		return Object.entries(preferences).sort(([, a], [, b]) => b - a)[0]?.[0];
	}

	getTopPreferences(preferences, count = 3) {
		if (!preferences || Object.keys(preferences).length === 0) return [];
		return Object.entries(preferences)
			.sort(([, a], [, b]) => b - a)
			.slice(0, count)
			.map(([key]) => key);
	}

	formatBusinessType(type) {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	hashUserId(userId) {
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			const char = userId.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	_getFromCache(key) {
		const cached = this.cacheManager.get(key);
		if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
			return cached.data;
		}
		return null;
	}

	_setCache(key, data) {
		this.cacheManager.set(key, {
			data,
			timestamp: Date.now(),
		});
	}

	// Fallback methods
	async getGeneralFeaturedBusinesses(location) {
		try {
			let query = this.pooledClient.from("businesses").select("id, name, description, rating, review_count, primary_image, address").eq("status", "published").eq("featured", true).order("rating", { ascending: false }).limit(8);

			if (location) {
				query = query.ilike("address", `%${location}%`);
			}

			const { data: businesses } = await query;

			return {
				type: "featured_businesses",
				priority: 2,
				personalized: false,
				title: "Featured Businesses",
				subtitle: "Highly rated local businesses",
				content: {
					layout: "grid",
					items: businesses || [],
				},
			};
		} catch (error) {
			logger.error("Error fetching general featured businesses:", error);
			return null;
		}
	}

	async getDefaultCategories() {
		try {
			const { data: categories } = await this.pooledClient.from("categories").select("id, name, slug, description, icon, business_count").order("business_count", { ascending: false }).limit(6);

			return {
				type: "category_recommendations",
				priority: 3,
				personalized: false,
				title: "Popular Categories",
				subtitle: "Explore different types of businesses",
				content: {
					layout: "cards",
					items: categories || [],
				},
			};
		} catch (error) {
			logger.error("Error fetching default categories:", error);
			return null;
		}
	}
}

// Create cached version for performance
export const generatePersonalizedHomepage = cache(async (userId, sessionId, location) => {
	const engine = new HomepagePersonalizationEngine();
	return engine.generatePersonalizedHomepage(userId, sessionId, location);
});
