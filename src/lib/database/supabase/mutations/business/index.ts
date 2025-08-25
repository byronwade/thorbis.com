// REQUIRED: Optimized business mutations with cache invalidation
import { supabase, Tables, Inserts, Updates } from "../../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type Business = Tables<"businesses">;
type BusinessInsert = Inserts<"businesses">;
type BusinessUpdate = Updates<"businesses">;

/**
 * High-performance business mutations with intelligent cache management
 */
export class BusinessMutations {
	private static readonly pooledClient = supabase;

	/**
	 * Create a new business with optimized data insertion
	 */
	static async createBusiness(data: BusinessInsert): Promise<Business> {
		const startTime = performance.now();

		try {
			// Generate slug if not provided
			if (!data.slug && data.name) {
				data.slug = data.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
			}

			const { data: business, error } = await this.pooledClient
				.from("businesses")
				.insert([
					{
						...data,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						review_count: 0,
						status: data.status || "draft",
						verified: false,
						featured: false,
					},
				])
				.select("*")
				.single();

			if (error) {
				logger.error("Create business error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(business.id);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Create business completed in ${mutationTime.toFixed(2)}ms`);

			logger.businessMetrics({
				action: "business_created",
				businessId: business.id,
				userId: data.owner_id,
				timestamp: Date.now(),
			});

			return business;
		} catch (error) {
			logger.error("Create business error:", error);
			throw error;
		}
	}

	/**
	 * Update business with selective field updates
	 */
	static async updateBusiness(id: string, data: BusinessUpdate, userId?: string): Promise<Business> {
		const startTime = performance.now();

		try {
			// Validate ownership/permissions
			if (userId) {
				const { data: existingBusiness } = await this.pooledClient.from("businesses").select("owner_id, claimed_by").eq("id", id).single();

				if (existingBusiness?.owner_id !== userId && existingBusiness?.claimed_by !== userId) {
					throw new Error("Unauthorized: User does not own this business");
				}
			}

			const { data: business, error } = await this.pooledClient
				.from("businesses")
				.update({
					...data,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select("*")
				.single();

			if (error) {
				logger.error("Update business error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(id);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Update business completed in ${mutationTime.toFixed(2)}ms`);

			logger.businessMetrics({
				action: "business_updated",
				businessId: id,
				userId,
				changes: Object.keys(data),
				timestamp: Date.now(),
			});

			return business;
		} catch (error) {
			logger.error("Update business error:", error);
			throw error;
		}
	}

	/**
	 * Claim a business by a user
	 */
	static async claimBusiness(businessId: string, userId: string): Promise<Business> {
		const startTime = performance.now();

		try {
			// Check if business is already claimed
			const { data: existingBusiness } = await this.pooledClient.from("businesses").select("claimed_by, owner_id").eq("id", businessId).single();

			if (existingBusiness?.claimed_by || existingBusiness?.owner_id) {
				throw new Error("Business is already claimed");
			}

			const { data: business, error } = await this.pooledClient
				.from("businesses")
				.update({
					claimed_by: userId,
					claimed_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("id", businessId)
				.select("*")
				.single();

			if (error) {
				logger.error("Claim business error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(businessId);
			this.invalidateUserCaches(userId);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Claim business completed in ${mutationTime.toFixed(2)}ms`);

			logger.businessMetrics({
				action: "business_claimed",
				businessId,
				userId,
				timestamp: Date.now(),
			});

			return business;
		} catch (error) {
			logger.error("Claim business error:", error);
			throw error;
		}
	}

	/**
	 * Delete business (soft delete)
	 */
	static async deleteBusiness(id: string, userId?: string): Promise<void> {
		const startTime = performance.now();

		try {
			// Validate ownership/permissions
			if (userId) {
				const { data: existingBusiness } = await this.pooledClient.from("businesses").select("owner_id, claimed_by").eq("id", id).single();

				if (existingBusiness?.owner_id !== userId && existingBusiness?.claimed_by !== userId) {
					throw new Error("Unauthorized: User does not own this business");
				}
			}

			const { error } = await this.pooledClient
				.from("businesses")
				.update({
					status: "archived",
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				logger.error("Delete business error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(id);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Delete business completed in ${mutationTime.toFixed(2)}ms`);

			logger.businessMetrics({
				action: "business_deleted",
				businessId: id,
				userId,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Delete business error:", error);
			throw error;
		}
	}

	/**
	 * Add photos to business
	 */
	static async addBusinessPhotos(
		businessId: string,
		photos: Array<{
			url: string;
			alt_text?: string;
			caption?: string;
			is_primary?: boolean;
		}>,
		userId?: string
	): Promise<Tables<"business_photos">[]> {
		const startTime = performance.now();

		try {
			// Validate ownership/permissions
			if (userId) {
				const { data: existingBusiness } = await this.pooledClient.from("businesses").select("owner_id, claimed_by").eq("id", businessId).single();

				if (existingBusiness?.owner_id !== userId && existingBusiness?.claimed_by !== userId) {
					throw new Error("Unauthorized: User does not own this business");
				}
			}

			// Get current photo count for ordering
			const { count: photoCount } = await this.pooledClient.from("business_photos").select("*", { count: "exact", head: true }).eq("business_id", businessId);

			const photosWithOrder = photos.map((photo, index) => ({
				...photo,
				business_id: businessId,
				uploaded_by: userId,
				order: (photoCount || 0) + index + 1,
				created_at: new Date().toISOString(),
			}));

			const { data: insertedPhotos, error } = await this.pooledClient.from("business_photos").insert(photosWithOrder).select("*");

			if (error) {
				logger.error("Add business photos error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(businessId);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Add business photos completed in ${mutationTime.toFixed(2)}ms`);

			return insertedPhotos;
		} catch (error) {
			logger.error("Add business photos error:", error);
			throw error;
		}
	}

	/**
	 * Update business rating after review changes
	 */
	static async updateBusinessRating(businessId: string): Promise<void> {
		const startTime = performance.now();

		try {
			// Calculate new rating and review count
			const { data: reviews } = await this.pooledClient.from("reviews").select("rating").eq("business_id", businessId).eq("status", "approved");

			const reviewCount = reviews?.length || 0;
			const averageRating = reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : null;

			const { error } = await this.pooledClient
				.from("businesses")
				.update({
					rating: averageRating,
					review_count: reviewCount,
					updated_at: new Date().toISOString(),
				})
				.eq("id", businessId);

			if (error) {
				logger.error("Update business rating error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateBusinessCaches(businessId);

			const mutationTime = performance.now() - startTime;
			logger.performance(`Update business rating completed in ${mutationTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Update business rating error:", error);
			throw error;
		}
	}

	/**
	 * Batch update business status
	 */
	static async batchUpdateBusinessStatus(businessIds: string[], status: "draft" | "published" | "archived"): Promise<void> {
		const startTime = performance.now();

		try {
			const { error } = await this.pooledClient
				.from("businesses")
				.update({
					status,
					updated_at: new Date().toISOString(),
				})
				.in("id", businessIds);

			if (error) {
				logger.error("Batch update business status error:", error);
				throw error;
			}

			// Invalidate relevant caches
			businessIds.forEach((id) => this.invalidateBusinessCaches(id));

			const mutationTime = performance.now() - startTime;
			logger.performance(`Batch update business status completed in ${mutationTime.toFixed(2)}ms`);

			logger.businessMetrics({
				action: "batch_status_update",
				businessIds,
				newStatus: status,
				count: businessIds.length,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Batch update business status error:", error);
			throw error;
		}
	}

	/**
	 * Invalidate business-related caches
	 */
	private static invalidateBusinessCaches(businessId: string): void {
		if (!CacheManager.memory) return;

		const cacheKeysToInvalidate = [`business_${businessId}`, "business_search_", "featured_businesses_", "businesses_category_", "nearby_"];

		// Clear specific cache entries
		cacheKeysToInvalidate.forEach((keyPattern) => {
			if (keyPattern.endsWith("_")) {
				// Pattern-based invalidation
				const keys = Array.from(CacheManager.memory.keys()).filter((key) => key.startsWith(keyPattern));
				keys.forEach((key) => CacheManager.memory?.delete(key));
			} else {
				// Exact key invalidation
				const keys = Array.from(CacheManager.memory.keys()).filter((key) => key.includes(keyPattern));
				keys.forEach((key) => CacheManager.memory?.delete(key));
			}
		});

		logger.debug(`Invalidated business caches for business ${businessId}`);
	}

	/**
	 * Invalidate user-related caches
	 */
	private static invalidateUserCaches(userId: string): void {
		if (!CacheManager.memory) return;

		const cacheKeysToInvalidate = [`user_${userId}`, `user_businesses_${userId}`, `user_stats_${userId}`];

		cacheKeysToInvalidate.forEach((keyPattern) => {
			const keys = Array.from(CacheManager.memory.keys()).filter((key) => key.includes(keyPattern));
			keys.forEach((key) => CacheManager.memory?.delete(key));
		});

		logger.debug(`Invalidated user caches for user ${userId}`);
	}
}
