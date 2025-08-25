/**
 * Business Search Queries
 * Extracted from business/index.ts for better modularity
 * High-performance search operations with intelligent caching
 */

import { supabase, Tables } from "../../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type Business = Tables<"businesses">;
type BusinessWithRelations = Business & {
	reviews: Tables<"reviews">[];
	categories: Tables<"business_categories">[];
	photos: Tables<"business_photos">[];
};

export class BusinessSearchQueries {
	private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

	// Lazy initialization to avoid circular dependencies during module loading
	private static getPooledClientInstance() {
		return supabase;
	}

	/**
	 * Advanced business search with filtering and caching
	 * Optimized for minimal database round trips
	 */
	static async searchBusinesses(params: {
		query?: string;
		location?: string;
		category?: string;
		bounds?: {
			north: number;
			south: number;
			east: number;
			west: number;
		};
		limit?: number;
		offset?: number;
		sortBy?: "relevance" | "rating" | "distance" | "newest";
		filters?: {
			minRating?: number;
			verified?: boolean;
			featured?: boolean;
			openNow?: boolean;
		};
	}): Promise<{
		businesses: BusinessWithRelations[];
		total: number;
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	}> {
		const startTime = performance.now();
		const cacheKey = `business_search_${JSON.stringify(params)}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			logger.performance(`Business search cache hit: ${cacheKey}`);
			return {
				...cached,
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: true,
				},
			};
		}

		try {
			// Build optimized query with proper indexing
			let query = this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					reviews:reviews(
						id,
						rating,
						text,
						created_at,
						user_id
					),
					categories:business_categories(
						category:categories(id, name, slug)
					),
					photos:business_photos(
						id,
						url,
						alt_text,
						is_primary
					)
				`
				)
				.eq("status", "published");

			// Apply filters
			if (params.filters?.verified !== undefined) {
				query = query.eq("verified", params.filters.verified);
			}

			if (params.filters?.featured !== undefined) {
				query = query.eq("featured", params.filters.featured);
			}

			if (params.filters?.minRating) {
				query = query.gte("rating", params.filters.minRating);
			}

			// Text search
			if (params.query) {
				// Use database full-text search function
				const { data: searchResults, error: searchError } = await this.getPooledClientInstance().rpc("search_businesses", {
					search_term: params.query,
					location: params.location,
					category: params.category,
					max_results: params.limit || 20,
				});

				if (searchError) throw searchError;

				// Get detailed business data for search results
				if (searchResults && searchResults.length > 0) {
					const businessIds = searchResults.map((r) => r.id);
					const { data: detailedBusinesses, error: detailError } = await query.in("id", businessIds);

					if (detailError) throw detailError;

					// Sort by search relevance
					const sortedBusinesses = businessIds.map((id) => detailedBusinesses?.find((b) => b.id === id)).filter(Boolean) as BusinessWithRelations[];

					const result = {
						businesses: sortedBusinesses,
						total: searchResults.length,
					};

					// Cache successful results
					CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

					const queryTime = performance.now() - startTime;
					logger.performance(`Business search completed in ${queryTime.toFixed(2)}ms`);

					return {
						...result,
						performance: {
							queryTime,
							cacheHit: false,
						},
					};
				}
			}

			// Location-based filtering
			if (params.location) {
				query = query.or(`city.ilike.%${params.location}%,state.ilike.%${params.location}%,address.ilike.%${params.location}%`);
			}

			// Geographic bounds filtering
			if (params.bounds) {
				query = query.gte("latitude", params.bounds.south).lte("latitude", params.bounds.north).gte("longitude", params.bounds.west).lte("longitude", params.bounds.east);
			}

			// Category filtering
			if (params.category) {
				query = query.eq("business_categories.category.slug", params.category);
			}

			// Sorting
			switch (params.sortBy) {
				case "rating":
					query = query.order("rating", { ascending: false });
					break;
				case "newest":
					query = query.order("created_at", { ascending: false });
					break;
				case "distance":
					// Distance sorting would require coordinates
					query = query.order("featured", { ascending: false });
					break;
				default:
					query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
			}

			// Pagination
			const limit = params.limit || 20;
			const offset = params.offset || 0;

			const { data: businesses, error, count } = await query.range(offset, offset + limit - 1);

			if (error) {
				logger.error("Business search query error:", error);
				throw error;
			}

			const result = {
				businesses: (businesses as BusinessWithRelations[]) || [],
				total: count || 0,
			};

			// Cache successful results
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business search completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: {
					queryTime,
					cacheHit: false,
				},
			};
		} catch (error) {
			logger.error("Business search error:", error);
			throw error;
		}
	}

	/**
	 * Get nearby businesses using spatial queries
	 */
	static async getNearbyBusinesses(latitude: number, longitude: number, radiusKm: number = 10, limit: number = 20, category?: string): Promise<(Business & { distance: number })[]> {
		const startTime = performance.now();
		const cacheKey = `nearby_${latitude}_${longitude}_${radiusKm}_${limit}_${category || "all"}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Use PostGIS spatial function for efficient nearby search
			const { data: businesses, error } = await this.getPooledClientInstance().rpc("get_nearby_businesses", {
				lat: latitude,
				lng: longitude,
				radius_km: radiusKm,
				result_limit: limit,
			});

			if (error) {
				logger.error("Nearby businesses query error:", error);
				throw error;
			}

			// Apply category filter if specified
			let filteredBusinesses = businesses || [];
			if (category) {
				// Additional query to filter by category
				const businessIds = businesses?.map((b) => b.id) || [];
				const { data: categoryFiltered } = await this.getPooledClientInstance().from("business_categories").select("business_id").in("business_id", businessIds).eq("categories.slug", category);

				const categoryBusinessIds = categoryFiltered?.map((c) => c.business_id) || [];
				filteredBusinesses = businesses?.filter((b) => categoryBusinessIds.includes(b.id)) || [];
			}

			// Cache the results
			CacheManager.memory?.set(cacheKey, filteredBusinesses, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Nearby businesses query completed in ${queryTime.toFixed(2)}ms`);

			return filteredBusinesses;
		} catch (error) {
			logger.error("Nearby businesses error:", error);
			throw error;
		}
	}

	/**
	 * Get trending businesses based on recent activity
	 */
	static async getTrendingBusinesses(timeframe: "24h" | "7d" | "30d" = "7d", limit: number = 10, location?: string): Promise<BusinessWithRelations[]> {
		const startTime = performance.now();
		const cacheKey = `trending_${timeframe}_${limit}_${location || "all"}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Calculate trending based on recent reviews, views, and bookings
			const daysAgo = { "24h": 1, "7d": 7, "30d": 30 }[timeframe];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			let query = this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					reviews:reviews!inner(
						id,
						rating,
						created_at,
						user_id
					),
					categories:business_categories(
						category:categories(id, name, slug)
					),
					photos:business_photos(
						id,
						url,
						alt_text,
						is_primary
					)
				`
				)
				.eq("status", "published")
				.eq("verified", true)
				.gte("reviews.created_at", startDate.toISOString());

			// Location filtering
			if (location) {
				query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
			}

			const { data: businesses, error } = await query.order("reviews.created_at", { ascending: false }).limit(limit);

			if (error) {
				logger.error("Trending businesses query error:", error);
				throw error;
			}

			// Process and rank by activity score
			const rankedBusinesses = this.calculateTrendingScore(businesses || []);

			// Cache the results
			CacheManager.memory?.set(cacheKey, rankedBusinesses, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Trending businesses query completed in ${queryTime.toFixed(2)}ms`);

			return rankedBusinesses;
		} catch (error) {
			logger.error("Trending businesses error:", error);
			throw error;
		}
	}

	/**
	 * Search businesses by category with optimized filtering
	 */
	static async searchByCategory(
		categorySlug: string,
		location?: string,
		limit: number = 20,
		offset: number = 0
	): Promise<{
		businesses: BusinessWithRelations[];
		total: number;
		category: any;
	}> {
		const startTime = performance.now();
		const cacheKey = `category_${categorySlug}_${location || "all"}_${limit}_${offset}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Get category information first
			const { data: category, error: categoryError } = await this.getPooledClientInstance().from("categories").select("*").eq("slug", categorySlug).single();

			if (categoryError) {
				logger.error("Category query error:", categoryError);
				throw categoryError;
			}

			// Get businesses in this category
			let query = this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					reviews:reviews(
						id,
						rating,
						text,
						created_at,
						user_id
					),
					categories:business_categories!inner(
						category:categories!inner(id, name, slug)
					),
					photos:business_photos(
						id,
						url,
						alt_text,
						is_primary
					)
				`
				)
				.eq("status", "published")
				.eq("categories.category.slug", categorySlug);

			// Location filtering
			if (location) {
				query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
			}

			const {
				data: businesses,
				error,
				count,
			} = await query
				.order("featured", { ascending: false })
				.order("rating", { ascending: false })
				.range(offset, offset + limit - 1);

			if (error) {
				logger.error("Category businesses query error:", error);
				throw error;
			}

			const result = {
				businesses: (businesses as BusinessWithRelations[]) || [],
				total: count || 0,
				category,
			};

			// Cache the results
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Category search completed in ${queryTime.toFixed(2)}ms`);

			return result;
		} catch (error) {
			logger.error("Category search error:", error);
			throw error;
		}
	}

	/**
	 * Calculate trending score based on recent activity
	 */
	private static calculateTrendingScore(businesses: any[]): BusinessWithRelations[] {
		return businesses
			.map((business) => {
				const recentReviews = business.reviews?.length || 0;
				const averageRating = business.rating || 0;
				const isFeatured = business.featured ? 2 : 1;

				// Simple trending score calculation
				const trendingScore = recentReviews * 0.6 + averageRating * 0.3 + isFeatured * 0.1;

				return {
					...business,
					trendingScore,
				};
			})
			.sort((a, b) => b.trendingScore - a.trendingScore)
			.map(({ trendingScore, ...business }) => business); // Remove score from final result
	}
}
