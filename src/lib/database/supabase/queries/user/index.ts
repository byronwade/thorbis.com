// REQUIRED: Optimized user queries with performance monitoring
import { supabase, getPooledClient, Tables } from "../../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type User = Tables<"users">;
type UserWithProfile = User & {
	businesses: Tables<"businesses">[];
	reviews: Tables<"reviews">[];
};

/**
 * High-performance user queries with intelligent caching
 */
export class UserQueries {
	private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
	// Lazy initialization to avoid circular dependencies during module loading
	private static getPooledClientInstance() {
		return getPooledClient("user");
	}

	/**
	 * Get user by ID with optional profile data
	 */
	static async getUserById(
		id: string,
		options: {
			includeBusinesses?: boolean;
			includeReviews?: boolean;
		} = {}
	): Promise<UserWithProfile | null> {
		const startTime = performance.now();
		const cacheKey = `user_${id}_${JSON.stringify(options)}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			let selectFields = "*";

			if (options.includeBusinesses) {
				selectFields += `,
          businesses:businesses(
            id,
            name,
            slug,
            address,
            city,
            state,
            rating,
            review_count,
            status,
            verified
          )
        `;
			}

			if (options.includeReviews) {
				selectFields += `,
          reviews:reviews(
            id,
            rating,
            text,
            created_at,
            business:businesses(name, slug)
          )
        `;
			}

			const { data: user, error } = await this.getPooledClientInstance().from("users").select(selectFields).eq("id", id).eq("status", "active").single();

			if (error) {
				if (error.code === "PGRST116") {
					return null; // User not found
				}
				logger.error("Get user by ID error:", error);
				throw error;
			}

			// Cache the result
			if (CacheManager.memory) {
				CacheManager.memory.set(cacheKey, user, this.CACHE_TTL);
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Get user by ID completed in ${queryTime.toFixed(2)}ms`);

			return user as UserWithProfile;
		} catch (error) {
			logger.error("Get user by ID error:", error);
			throw error;
		}
	}

	/**
	 * Get user by email with caching
	 */
	static async getUserByEmail(email: string): Promise<User | null> {
		const startTime = performance.now();
		const cacheKey = `user_email_${email}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const { data: user, error } = await this.getPooledClientInstance().from("users").select("*").eq("email", email).eq("status", "active").single();

			if (error) {
				if (error.code === "PGRST116") {
					return null; // User not found
				}
				logger.error("Get user by email error:", error);
				throw error;
			}

			// Cache the result
			if (CacheManager.memory) {
				CacheManager.memory.set(cacheKey, user, this.CACHE_TTL);
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Get user by email completed in ${queryTime.toFixed(2)}ms`);

			return user;
		} catch (error) {
			logger.error("Get user by email error:", error);
			throw error;
		}
	}

	/**
	 * Get user's businesses with pagination
	 */
	static async getUserBusinesses(
		userId: string,
		page: number = 1,
		limit: number = 10
	): Promise<{
		businesses: Tables<"businesses">[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		const startTime = performance.now();
		const offset = (page - 1) * limit;
		const cacheKey = `user_businesses_${userId}_${page}_${limit}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const {
				data: businesses,
				error,
				count,
			} = await this.getPooledClientInstance()
				.from("businesses")
				.select("*", { count: "exact" })
				.or(`owner_id.eq.${userId},claimed_by.eq.${userId}`)
				.order("created_at", { ascending: false })
				.range(offset, offset + limit - 1);

			if (error) {
				logger.error("Get user businesses error:", error);
				throw error;
			}

			const result = {
				businesses: businesses || [],
				total: count || 0,
				page,
				totalPages: Math.ceil((count || 0) / limit),
			};

			// Cache the results
			if (CacheManager.memory) {
				CacheManager.memory.set(cacheKey, result, this.CACHE_TTL);
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Get user businesses completed in ${queryTime.toFixed(2)}ms`);

			return result;
		} catch (error) {
			logger.error("Get user businesses error:", error);
			throw error;
		}
	}

	/**
	 * Get user's reviews with business information
	 */
	static async getUserReviews(
		userId: string,
		page: number = 1,
		limit: number = 10
	): Promise<{
		reviews: (Tables<"reviews"> & { business: Tables<"businesses"> })[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		const startTime = performance.now();
		const offset = (page - 1) * limit;
		const cacheKey = `user_reviews_${userId}_${page}_${limit}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const {
				data: reviews,
				error,
				count,
			} = await this.getPooledClientInstance()
				.from("reviews")
				.select(
					`
          *,
          business:businesses(
            id,
            name,
            slug,
            address,
            city,
            state
          )
        `,
					{ count: "exact" }
				)
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.range(offset, offset + limit - 1);

			if (error) {
				logger.error("Get user reviews error:", error);
				throw error;
			}

			const result = {
				reviews: reviews || [],
				total: count || 0,
				page,
				totalPages: Math.ceil((count || 0) / limit),
			};

			// Cache the results
			if (CacheManager.memory) {
				CacheManager.memory.set(cacheKey, result, this.CACHE_TTL);
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Get user reviews completed in ${queryTime.toFixed(2)}ms`);

			return result;
		} catch (error) {
			logger.error("Get user reviews error:", error);
			throw error;
		}
	}

	/**
	 * Update user's last login timestamp
	 */
	static async updateLastLogin(userId: string): Promise<void> {
		const startTime = performance.now();

		try {
			const { error } = await this.getPooledClientInstance()
				.from("users")
				.update({
					last_login: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId);

			if (error) {
				logger.error("Update last login error:", error);
				throw error;
			}

			// Invalidate user cache
			const userCacheKeys = [`user_${userId}`, `user_email_`];
			userCacheKeys.forEach((key) => {
				CacheManager.memory?.delete(key);
			});

			const queryTime = performance.now() - startTime;
			logger.performance(`Update last login completed in ${queryTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Update last login error:", error);
			throw error;
		}
	}

	/**
	 * Get user statistics
	 */
	static async getUserStats(userId: string): Promise<{
		businessCount: number;
		reviewCount: number;
		averageRating: number;
		totalHelpfulVotes: number;
	}> {
		const startTime = performance.now();
		const cacheKey = `user_stats_${userId}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Get business count
			const { count: businessCount } = await this.getPooledClientInstance().from("businesses").select("*", { count: "exact", head: true }).or(`owner_id.eq.${userId},claimed_by.eq.${userId}`);

			// Get review statistics
			const { data: reviewStats } = await this.getPooledClientInstance().from("reviews").select("rating, helpful_count").eq("user_id", userId);

			const stats = {
				businessCount: businessCount || 0,
				reviewCount: reviewStats?.length || 0,
				averageRating: reviewStats?.length ? reviewStats.reduce((sum, review) => sum + review.rating, 0) / reviewStats.length : 0,
				totalHelpfulVotes: reviewStats?.reduce((sum, review) => sum + review.helpful_count, 0) || 0,
			};

			// Cache the results
			if (CacheManager.memory) {
				CacheManager.memory.set(cacheKey, stats, this.CACHE_TTL);
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Get user stats completed in ${queryTime.toFixed(2)}ms`);

			return stats;
		} catch (error) {
			logger.error("Get user stats error:", error);
			throw error;
		}
	}
}
