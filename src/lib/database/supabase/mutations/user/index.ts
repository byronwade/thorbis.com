/**
 * User Mutations
 * User profile and account management operations
 * Following domain-based Supabase organization
 */

import { supabase, Tables, Database } from "../../client";
import { logger } from "@lib/utils/logger";
import { CacheManager } from "@lib/utils/cache-manager";

type User = Tables<"users">;
type UserProfile = Tables<"user_profiles">;
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
type ProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

/**
 * High-performance user mutations with validation and error handling
 */
export class UserMutations {
	private static readonly pooledClient = supabase;

	/**
	 * Update user profile information
	 */
	static async updateUserProfile(userId: string, profileData: ProfileUpdate): Promise<UserProfile> {
		const startTime = performance.now();

		try {
			// Validate profile data
			this.validateProfileData(profileData);

			// Update the profile
			const { data: profile, error } = await this.pooledClient
				.from("user_profiles")
				.update({
					...profileData,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", userId)
				.select()
				.single();

			if (error) {
				logger.error("Update user profile error:", error);
				throw error;
			}

			// Invalidate user caches
			this.invalidateUserCaches(userId);

			// Log the update
			logger.info(`User profile updated: ${userId}`);

			const updateTime = performance.now() - startTime;
			logger.performance(`Profile update completed in ${updateTime.toFixed(2)}ms`);

			return profile;
		} catch (error) {
			logger.error("Update user profile failed:", error);
			throw error;
		}
	}

	/**
	 * Update user account information
	 */
	static async updateUserAccount(userId: string, userData: UserUpdate): Promise<User> {
		const startTime = performance.now();

		try {
			// Update the user account
			const { data: user, error } = await this.pooledClient
				.from("users")
				.update({
					...userData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId)
				.select()
				.single();

			if (error) {
				logger.error("Update user account error:", error);
				throw error;
			}

			// Invalidate caches
			this.invalidateUserCaches(userId);

			// Log the update
			logger.info(`User account updated: ${userId}`);

			const updateTime = performance.now() - startTime;
			logger.performance(`Account update completed in ${updateTime.toFixed(2)}ms`);

			return user;
		} catch (error) {
			logger.error("Update user account failed:", error);
			throw error;
		}
	}

	/**
	 * Validate profile data before update
	 */
	private static validateProfileData(profileData: ProfileUpdate): void {
		if (profileData.business_name && profileData.business_name.trim().length < 2) {
			throw new Error("Business name must be at least 2 characters long");
		}

		if (profileData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
			throw new Error("Invalid phone number format");
		}

		if (profileData.website && !/^https?:\/\/.+\..+/.test(profileData.website)) {
			throw new Error("Invalid website URL format");
		}
	}

	/**
	 * Invalidate user-related caches
	 */
	private static invalidateUserCaches(userId: string): void {
		CacheManager.memory.delete(`user_${userId}_*`);
		CacheManager.memory.delete(`user_profile_${userId}_*`);
		logger.debug(`User caches invalidated for: ${userId}`);
	}
}
