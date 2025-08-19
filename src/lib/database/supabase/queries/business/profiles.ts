/**
 * Business Profile Queries
 * Extracted from business/index.ts for better modularity
 * Handles business profile management, updates, and verification
 */

import { supabase, getPooledClient, Tables } from "../../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type Business = Tables<"businesses">;
type BusinessProfile = Business & {
	reviews: Tables<"reviews">[];
	categories: Tables<"business_categories">[];
	photos: Tables<"business_photos">[];
	certifications: Tables<"business_certifications">[];
	hours: Tables<"business_hours">[];
};

export class BusinessProfileQueries {
	private static readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes for profiles
	// Lazy initialization to avoid circular dependencies during module loading
	private static getPooledClientInstance() {
		return getPooledClient("business");
	}

	/**
	 * Get complete business profile by ID with all relations
	 */
	static async getBusinessProfile(businessId: string): Promise<{
		profile: BusinessProfile | null;
		performance: { queryTime: number; cacheHit: boolean };
	}> {
		const startTime = performance.now();
		const cacheKey = `business_profile_${businessId}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			logger.performance(`Business profile cache hit: ${cacheKey}`);
			return {
				profile: cached,
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: true,
				},
			};
		}

		try {
			const { data: business, error } = await this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					reviews:reviews(
						id,
						rating,
						text,
						created_at,
						updated_at,
						verified,
						helpful_count,
						user:users(
							id,
							name,
							avatar_url
						)
					),
					categories:business_categories(
						id,
						category:categories(
							id,
							name,
							slug,
							description,
							icon
						)
					),
					photos:business_photos(
						id,
						url,
						alt_text,
						is_primary,
						caption,
						created_at
					),
					certifications:business_certifications(
						id,
						name,
						issuing_authority,
						certificate_number,
						issue_date,
						expiry_date,
						status,
						verified_at
					),
					hours:business_hours(
						id,
						day_of_week,
						open_time,
						close_time,
						is_closed,
						is_24_hours
					)
				`
				)
				.eq("id", businessId)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// Business not found
					return {
						profile: null,
						performance: {
							queryTime: performance.now() - startTime,
							cacheHit: false,
						},
					};
				}
				logger.error("Business profile query error:", error);
				throw error;
			}

			// Sort and organize data
			const profile: BusinessProfile = {
				...business,
				reviews: business.reviews?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [],
				photos:
					business.photos?.sort((a, b) => {
						// Primary photos first, then by creation date
						if (a.is_primary && !b.is_primary) return -1;
						if (!a.is_primary && b.is_primary) return 1;
						return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
					}) || [],
				hours:
					business.hours?.sort((a, b) => {
						const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
						return dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
					}) || [],
				certifications: business.certifications?.filter((cert) => cert.status === "verified") || [],
			};

			// Cache the result
			CacheManager.memory?.set(cacheKey, profile, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business profile query completed in ${queryTime.toFixed(2)}ms`);

			return {
				profile,
				performance: {
					queryTime,
					cacheHit: false,
				},
			};
		} catch (error) {
			logger.error("Business profile error:", error);
			throw error;
		}
	}

	/**
	 * Get business profile by slug for public URLs
	 */
	static async getBusinessBySlug(slug: string): Promise<BusinessProfile | null> {
		const startTime = performance.now();
		const cacheKey = `business_slug_${slug}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const { data: business, error } = await this.getPooledClientInstance()
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
				.eq("slug", slug)
				.eq("status", "published")
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return null; // Business not found
				}
				logger.error("Business slug query error:", error);
				throw error;
			}

			// Cache the result
			CacheManager.memory?.set(cacheKey, business, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business slug query completed in ${queryTime.toFixed(2)}ms`);

			return business as BusinessProfile;
		} catch (error) {
			logger.error("Business slug error:", error);
			throw error;
		}
	}

	/**
	 * Get businesses owned by a user
	 */
	static async getUserBusinesses(userId: string): Promise<{
		businesses: Business[];
		drafts: Business[];
		performance: { queryTime: number };
	}> {
		const startTime = performance.now();
		const cacheKey = `user_businesses_${userId}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return {
				...cached,
				performance: { queryTime: performance.now() - startTime },
			};
		}

		try {
			const { data: allBusinesses, error } = await this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					categories:business_categories(
						category:categories(name, slug)
					),
					photos:business_photos(
						id,
						url,
						is_primary
					)
				`
				)
				.eq("owner_id", userId)
				.order("created_at", { ascending: false });

			if (error) {
				logger.error("User businesses query error:", error);
				throw error;
			}

			// Separate published and draft businesses
			const businesses = allBusinesses?.filter((b) => b.status === "published") || [];
			const drafts = allBusinesses?.filter((b) => b.status === "draft") || [];

			const result = { businesses, drafts };

			// Cache the result
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`User businesses query completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: { queryTime },
			};
		} catch (error) {
			logger.error("User businesses error:", error);
			throw error;
		}
	}

	/**
	 * Get business statistics and analytics
	 */
	static async getBusinessStats(businessId: string): Promise<{
		views: number;
		clicks: number;
		saves: number;
		reviewsCount: number;
		averageRating: number;
		photosCount: number;
		completionScore: number;
		performance: { queryTime: number };
	}> {
		const startTime = performance.now();
		const cacheKey = `business_stats_${businessId}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return {
				...cached,
				performance: { queryTime: performance.now() - startTime },
			};
		}

		try {
			// Parallel queries for performance
			const [businessResult, reviewsResult, photosResult] = await Promise.all([this.getPooledClientInstance().from("businesses").select("name, description, phone, email, website, rating, review_count").eq("id", businessId).single(), this.getPooledClientInstance().from("reviews").select("rating").eq("business_id", businessId), this.getPooledClientInstance().from("business_photos").select("id").eq("business_id", businessId)]);

			if (businessResult.error) throw businessResult.error;
			if (reviewsResult.error) throw reviewsResult.error;
			if (photosResult.error) throw photosResult.error;

			const business = businessResult.data;
			const reviews = reviewsResult.data || [];
			const photos = photosResult.data || [];

			// Calculate average rating from actual reviews
			const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

			// Calculate completion score
			const completionScore = this.calculateCompletionScore(business);

			// Mock analytics data (in real app, get from analytics_events)
			const stats = {
				views: Math.floor(Math.random() * 1000) + 100,
				clicks: Math.floor(Math.random() * 200) + 20,
				saves: Math.floor(Math.random() * 50) + 5,
				reviewsCount: reviews.length,
				averageRating: Math.round(averageRating * 10) / 10,
				photosCount: photos.length,
				completionScore,
			};

			// Cache the result
			CacheManager.memory?.set(cacheKey, stats, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business stats query completed in ${queryTime.toFixed(2)}ms`);

			return {
				...stats,
				performance: { queryTime },
			};
		} catch (error) {
			logger.error("Business stats error:", error);
			throw error;
		}
	}

	/**
	 * Get similar businesses based on category and location
	 */
	static async getSimilarBusinesses(businessId: string, limit: number = 5): Promise<Business[]> {
		const startTime = performance.now();
		const cacheKey = `similar_businesses_${businessId}_${limit}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// First get the target business to understand what to match
			const { data: targetBusiness, error: targetError } = await this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					id,
					city,
					state,
					categories:business_categories(
						category:categories(id, slug)
					)
				`
				)
				.eq("id", businessId)
				.single();

			if (targetError) throw targetError;

			const categoryIds = targetBusiness.categories?.map((c) => c.category.id) || [];
			const location = targetBusiness.city;

			// Find similar businesses
			let query = this.getPooledClientInstance()
				.from("businesses")
				.select(
					`
					*,
					categories:business_categories(
						category:categories(name, slug)
					),
					photos:business_photos(
						url,
						is_primary
					)
				`
				)
				.eq("status", "published")
				.neq("id", businessId); // Exclude the original business

			// Match by location first
			if (location) {
				query = query.eq("city", location);
			}

			const { data: locationMatches, error: locationError } = await query.order("rating", { ascending: false }).limit(limit * 2); // Get more to filter by category

			if (locationError) throw locationError;

			// Filter by category if we have category IDs
			let similarBusinesses = locationMatches || [];
			if (categoryIds.length > 0) {
				similarBusinesses = similarBusinesses.filter((business) => business.categories?.some((bc) => categoryIds.includes(bc.category.id)));
			}

			// If we don't have enough matches, get more from same category regardless of location
			if (similarBusinesses.length < limit && categoryIds.length > 0) {
				const { data: categoryMatches } = await this.getPooledClientInstance()
					.from("businesses")
					.select(
						`
						*,
						categories:business_categories!inner(
							category:categories(name, slug)
						),
						photos:business_photos(
							url,
							is_primary
						)
					`
					)
					.eq("status", "published")
					.neq("id", businessId)
					.in("categories.category.id", categoryIds)
					.order("rating", { ascending: false })
					.limit(limit);

				// Merge and deduplicate
				const existingIds = similarBusinesses.map((b) => b.id);
				const additionalBusinesses = (categoryMatches || []).filter((b) => !existingIds.includes(b.id));

				similarBusinesses = [...similarBusinesses, ...additionalBusinesses];
			}

			// Take only the requested number
			const result = similarBusinesses.slice(0, limit);

			// Cache the result
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Similar businesses query completed in ${queryTime.toFixed(2)}ms`);

			return result;
		} catch (error) {
			logger.error("Similar businesses error:", error);
			throw error;
		}
	}

	/**
	 * Calculate business profile completion score
	 */
	private static calculateCompletionScore(business: any): number {
		const fields = [business.name, business.description, business.phone, business.email, business.website];

		const completedFields = fields.filter((field) => field && field.trim()).length;
		return Math.round((completedFields / fields.length) * 100);
	}

	/**
	 * Invalidate cache for a specific business
	 */
	static invalidateBusinessCache(businessId: string): void {
		const patterns = [`business_profile_${businessId}`, `business_stats_${businessId}`, `similar_businesses_${businessId}`];

		patterns.forEach((pattern) => {
			CacheManager.memory?.delete(pattern);
		});

		logger.debug(`Invalidated cache for business: ${businessId}`);
	}
}
