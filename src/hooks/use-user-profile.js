"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@context/auth-context";
import { supabase } from "@lib/database/supabase";
import { SecureStorage } from "@utils/secure-storage";
import logger from "@lib/utils/logger";

/**
 * Advanced user profile hook with secure caching and real-time updates
 * Implements comprehensive error handling and performance optimization
 */
export function useUserProfile(userId = null) {
	const { user, isAuthenticated } = useAuth();
	const targetUserId = userId || user?.id;

	// State management
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [lastFetch, setLastFetch] = useState(null);
	const [isFetching, setIsFetching] = useState(false); // Prevent duplicate fetches

	// Cache configuration
	const CACHE_KEY = `user_profile_${targetUserId}`;
	const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
	const STALE_WHILE_REVALIDATE = 30 * 60 * 1000; // 30 minutes

	/**
	 * Fetch user profile from cache or API
	 */
	const fetchProfile = useCallback(
		async (forceRefresh = false) => {
			if (!targetUserId) {
				setError("No user ID provided");
				return null;
			}

			// Prevent duplicate fetches
			if (isFetching && !forceRefresh) {
				logger.debug(`Profile fetch already in progress for user: ${targetUserId}`);
				return null;
			}

			const startTime = performance.now();
			setError(null);
			setIsFetching(true);

			try {
				// Check cache first (unless force refresh)
				if (!forceRefresh) {
					const cachedProfile = SecureStorage.getItem(CACHE_KEY);
					if (cachedProfile && cachedProfile.data) {
						const cacheAge = Date.now() - cachedProfile.cached_at;

						// Use fresh cache
						if (cacheAge < CACHE_TTL) {
							setProfile(cachedProfile.data);
							setLastFetch(cachedProfile.cached_at);
							setIsFetching(false);

							const duration = performance.now() - startTime;
							logger.performance(`Profile loaded from cache in ${duration.toFixed(2)}ms`);
							return cachedProfile.data;
						}

						// Use stale cache while revalidating
						if (cacheAge < STALE_WHILE_REVALIDATE) {
							setProfile(cachedProfile.data);
							setLastFetch(cachedProfile.cached_at);
							logger.debug(`Using stale cache while revalidating for user: ${targetUserId}`);
						}
					}
				}

				setLoading(true);

				// Fetch from Supabase
				const { data: profileData, error: profileError } = await supabase
					.from("users")
					.select(
						`
						id,
						email,
						name,
						avatar_url,
						bio,
						location,
						website,
						phone,
						role,
						email_verified,
						phone_verified,
						created_at,
						updated_at,
						preferences
					`
					)
					.eq("id", targetUserId)
					.maybeSingle();

				if (profileError) {
					if (profileError.code === "PGRST116") {
						throw new Error("User profile not found");
					}
					throw profileError;
				}

				// Transform data for easier consumption
				const transformedProfile = {
					...profileData,
					roles: profileData.role ? [profileData.role] : ["user"],
					displayName: profileData.name || profileData.email?.split("@")[0] || "User",
					isVerified: profileData.email_verified || false,
					hasPhone: !!profileData.phone,
					isPhoneVerified: profileData.phone_verified || false,
				};

				// Cache the result with metadata
				const cacheData = {
					data: transformedProfile,
					cached_at: Date.now(),
					user_id: targetUserId,
				};

				SecureStorage.setItem(CACHE_KEY, cacheData, {
					encrypt: true, // Encrypt PII
					expiry: STALE_WHILE_REVALIDATE,
				});

				setProfile(transformedProfile);
				setLastFetch(Date.now());

				const duration = performance.now() - startTime;
				logger.performance(`Profile fetched from API in ${duration.toFixed(2)}ms`);

				// Log profile access for security auditing
				logger.security({
					action: "profile_accessed",
					targetUserId,
					accessorUserId: user?.id,
					timestamp: Date.now(),
				});

				return transformedProfile;
			} catch (fetchError) {
				const duration = performance.now() - startTime;
				logger.error(`Profile fetch failed in ${duration.toFixed(2)}ms:`, fetchError);

				setError(fetchError.message);

				// Try to return cached data if available
				const cachedProfile = SecureStorage.getItem(CACHE_KEY);
				if (cachedProfile) {
					setProfile(cachedProfile.data);
					setLastFetch(cachedProfile.cached_at);
					return cachedProfile.data;
				}

				return null;
			} finally {
				setLoading(false);
				setIsFetching(false);
			}
		},
		[targetUserId, user?.id, CACHE_KEY]
	);

	/**
	 * Update user profile
	 */
	const updateProfile = useCallback(
		async (updates) => {
			if (!targetUserId) {
				throw new Error("No user ID provided");
			}

			// Only allow users to update their own profile
			if (targetUserId !== user?.id) {
				throw new Error("Cannot update another user's profile");
			}

			const startTime = performance.now();
			setError(null);
			setLoading(true);

			try {
				// Validate updates
				const allowedFields = ["name", "first_name", "last_name", "bio", "location", "website", "phone", "avatar_url", "preferences", "privacy_settings"];

				const sanitizedUpdates = {};
				Object.keys(updates).forEach((key) => {
					if (allowedFields.includes(key)) {
						sanitizedUpdates[key] = updates[key];
					}
				});

				if (Object.keys(sanitizedUpdates).length === 0) {
					throw new Error("No valid fields to update");
				}

				// Add updated timestamp
				sanitizedUpdates.updated_at = new Date().toISOString();

				// Update in Supabase
				const { data: updatedData, error: updateError } = await supabase.from("users").update(sanitizedUpdates).eq("id", targetUserId).select().maybeSingle();

				if (updateError) {
					throw updateError;
				}

				// Update local state and cache
				const updatedProfile = {
					...profile,
					...updatedData,
					displayName: updatedData.name || `${updatedData.first_name} ${updatedData.last_name}`.trim(),
				};

				setProfile(updatedProfile);

				// Update cache
				const cacheData = {
					data: updatedProfile,
					cached_at: Date.now(),
					user_id: targetUserId,
				};

				SecureStorage.setItem(CACHE_KEY, cacheData, {
					encrypt: true,
					expiry: STALE_WHILE_REVALIDATE,
				});

				const duration = performance.now() - startTime;
				logger.performance(`Profile updated in ${duration.toFixed(2)}ms`);

				// Log profile update for security auditing
				logger.security({
					action: "profile_updated",
					userId: targetUserId,
					fieldsUpdated: Object.keys(sanitizedUpdates),
					timestamp: Date.now(),
				});

				return updatedProfile;
			} catch (updateError) {
				const duration = performance.now() - startTime;
				logger.error(`Profile update failed in ${duration.toFixed(2)}ms:`, updateError);

				setError(updateError.message);
				throw updateError;
			} finally {
				setLoading(false);
			}
		},
		[targetUserId, user?.id, profile, CACHE_KEY]
	);

	/**
	 * Upload and update avatar
	 */
	const updateAvatar = useCallback(
		async (file) => {
			if (!targetUserId || targetUserId !== user?.id) {
				throw new Error("Cannot update avatar");
			}

			const startTime = performance.now();
			setLoading(true);

			try {
				// Validate file
				const maxSize = 5 * 1024 * 1024; // 5MB
				const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

				if (file.size > maxSize) {
					throw new Error("Avatar file too large (max 5MB)");
				}

				if (!allowedTypes.includes(file.type)) {
					throw new Error("Invalid file type (JPEG, PNG, WebP only)");
				}

				// Generate unique filename
				const fileExt = file.name.split(".").pop();
				const fileName = `avatar_${targetUserId}_${Date.now()}.${fileExt}`;

				// Upload to Supabase Storage
				const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
					cacheControl: "3600",
					upsert: false,
				});

				if (uploadError) {
					throw uploadError;
				}

				// Get public URL
				const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

				// Update profile with new avatar URL
				await updateProfile({ avatar_url: urlData.publicUrl });

				const duration = performance.now() - startTime;
				logger.performance(`Avatar updated in ${duration.toFixed(2)}ms`);

				return urlData.publicUrl;
			} catch (error) {
				const duration = performance.now() - startTime;
				logger.error(`Avatar update failed in ${duration.toFixed(2)}ms:`, error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[targetUserId, user?.id, updateProfile]
	);

	/**
	 * Clear profile cache
	 */
	const clearCache = useCallback(() => {
		SecureStorage.removeItem(CACHE_KEY);
		logger.debug(`Profile cache cleared for user ${targetUserId}`);
	}, [CACHE_KEY, targetUserId]);

	/**
	 * Refresh profile (force fetch)
	 */
	const refresh = useCallback(() => {
		return fetchProfile(true);
	}, [fetchProfile]);

	// Initial fetch when hook mounts or user changes
	useEffect(() => {
		if (targetUserId && isAuthenticated && !isFetching) {
			fetchProfile();
		}
	}, [targetUserId, isAuthenticated, fetchProfile]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			setIsFetching(false);
			setLoading(false);
		};
	}, []);

	// Set up real-time subscription for profile updates
	useEffect(() => {
		if (!targetUserId) return;

		const subscription = supabase
			.channel(`profile_${targetUserId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "users",
					filter: `id=eq.${targetUserId}`,
				},
				(payload) => {
					logger.debug("Profile updated via real-time subscription");

					// Update local state with new data
					const updatedProfile = {
						...profile,
						...payload.new,
						displayName: payload.new.name || `${payload.new.first_name} ${payload.new.last_name}`.trim(),
					};

					setProfile(updatedProfile);

					// Update cache
					const cacheData = {
						data: updatedProfile,
						cached_at: Date.now(),
						user_id: targetUserId,
					};

					SecureStorage.setItem(CACHE_KEY, cacheData, {
						encrypt: true,
						expiry: STALE_WHILE_REVALIDATE,
					});
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [targetUserId, profile, CACHE_KEY]);

	// Return hook interface
	return {
		// Data
		profile,
		loading,
		error,
		lastFetch,
		isFetching,

		// Actions
		fetchProfile,
		updateProfile,
		updateAvatar,
		refresh,
		clearCache,

		// Computed properties
		isOwnProfile: targetUserId === user?.id,
		hasProfile: !!profile,
		isStale: lastFetch && Date.now() - lastFetch > CACHE_TTL,
	};
}

/**
 * Hook for managing user preferences specifically
 */
export function useUserPreferences() {
	const { profile, updateProfile, loading } = useUserProfile();

	const updatePreferences = useCallback(
		async (newPreferences) => {
			const currentPreferences = profile?.preferences || {};
			const updatedPreferences = {
				...currentPreferences,
				...newPreferences,
				updated_at: Date.now(),
			};

			return updateProfile({ preferences: updatedPreferences });
		},
		[profile?.preferences, updateProfile]
	);

	return {
		preferences: profile?.preferences || {},
		updatePreferences,
		loading,
	};
}

/**
 * Hook for managing user privacy settings
 */
export function useUserPrivacy() {
	const { profile, updateProfile, loading } = useUserProfile();

	const updatePrivacySettings = useCallback(
		async (newSettings) => {
			const currentSettings = profile?.privacy_settings || {};
			const updatedSettings = {
				...currentSettings,
				...newSettings,
				updated_at: Date.now(),
			};

			return updateProfile({ privacy_settings: updatedSettings });
		},
		[profile?.privacy_settings, updateProfile]
	);

	return {
		privacySettings: profile?.privacy_settings || {},
		updatePrivacySettings,
		loading,
	};
}

export default useUserProfile;
