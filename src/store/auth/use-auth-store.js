/**
 * Authentication Store
 * Zustand store for user authentication state and operations
 * Moved from root store directory for better organization
 */

import { create } from "zustand";
import { supabase } from "@lib/database/supabase";
import logger from "@lib/utils/logger";

// Sync user profile to our users table
const syncUserProfile = async (authUser) => {
	try {
		const startTime = performance.now();

		// Check if user already exists in our users table
		const { data: existingUser, error: fetchError } = await supabase.from("users").select("id, updated_at").eq("id", authUser.id).maybeSingle();

		if (!existingUser) {
			// Create new user profile
			const { error: insertError } = await supabase.from("users").insert({
				id: authUser.id,
				email: authUser.email,
				name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
				avatar_url: authUser.user_metadata?.avatar_url,
				role: "user", // Default role
				email_verified: !!authUser.email_confirmed_at,
				phone: authUser.phone,
				created_at: authUser.created_at,
				updated_at: new Date().toISOString(),
			});

			if (insertError) {
				logger.error("Error creating user profile:", insertError);
			} else {
				logger.debug("Created new user profile:", authUser.id);
			}
		} else {
			// Update existing user profile with latest auth data
			const { error: updateError } = await supabase
				.from("users")
				.update({
					email: authUser.email,
					name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
					avatar_url: authUser.user_metadata?.avatar_url,
					email_verified: !!authUser.email_confirmed_at,
					phone: authUser.phone,
					updated_at: new Date().toISOString(),
				})
				.eq("id", authUser.id);

			if (updateError) {
				logger.error("Error updating user profile:", updateError);
			} else {
				logger.debug("Updated user profile:", authUser.id);
			}
		}

		const duration = performance.now() - startTime;
		logger.performance(`User profile sync completed in ${duration.toFixed(2)}ms`);
	} catch (error) {
		logger.error("Error syncing user profile:", error);
	}
};

// Get user business profile
const getUserBusinessProfile = async (userId) => {
	try {
		const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", userId).maybeSingle();

		if (error && error.code !== "PGRST116") {
			logger.error("Error fetching business profile:", error);
			return null;
		}

		return data;
	} catch (error) {
		logger.error("Error in getUserBusinessProfile:", error);
		return null;
	}
};

const useAuthStore = create((set, get) => ({
	// State
	user: null,
	profile: null,
	businessProfile: null,
	session: null,
	loading: false, // Never show loading states
	error: null,
	isSigningIn: false, // Never show loading states
	isSigningUp: false, // Never show loading states
	isSigningOut: false, // Never show loading states
	isResettingPassword: false, // Never show loading states
	lastActivity: Date.now(),
	userRoles: [], // Computed from profile.role

	// Actions
	setUser: (user) => {
		set({ user });
		if (user) {
			// Sync user profile in background
			syncUserProfile(user);
		}
	},

	setProfile: (profile) => {
		const userRoles = profile?.role ? [profile.role] : [];
		set({ profile, userRoles });
	},

	setBusinessProfile: (businessProfile) => set({ businessProfile }),

	setSession: (session) => {
		set({
			session,
			user: session?.user || null,
			// Removed loading state change
		});

		// Update last activity
		get().updateLastActivity();
	},

	setLoading: () => {}, // No-op - never change loading state

	setError: (error) => set({ error }),

	clearError: () => set({ error: null }),

	updateLastActivity: () => set({ lastActivity: Date.now() }),

	// Authentication methods
	signIn: async (email, password) => {
		const state = get();
		state.setError(null);
		// Removed loading state - no loading indicators

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			logger.info("User signed in successfully:", data.user.id);
			return { success: true, data };
		} catch (error) {
			logger.error("Sign in error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		} finally {
			// Removed loading state change
		}
	},

	signUp: async (email, password, metadata = {}) => {
		const state = get();
		state.setError(null);
		// Removed loading state - no loading indicators

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: metadata,
				},
			});

			if (error) throw error;

			logger.info("User signed up successfully:", data.user?.id);
			return { success: true, data };
		} catch (error) {
			logger.error("Sign up error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		} finally {
			// Removed loading state change
		}
	},

	signOut: async () => {
		const state = get();
		// Removed loading state - no loading indicators

		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				const isMissingSession = error?.name === "AuthSessionMissingError" || error?.status === 400 || (error?.__isAuthError && !get().session);
				if (!isMissingSession) {
					throw error;
				}
				logger.debug("Sign out with no active session; treating as success");
			}

			// Clear all user data
			set({
				user: null,
				profile: null,
				businessProfile: null,
				session: null,
				error: null,
				lastActivity: Date.now(),
				userRoles: [],
			});

			logger.info("User signed out successfully");
			return { success: true };
		} catch (error) {
			logger.error("Sign out error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		} finally {
			// Removed loading state change
		}
	},

	// Alias for backward compatibility
	logout: async () => {
		return get().signOut();
	},

	// Setter for backward compatibility
	setUserRoles: (roles) => {
		set({ userRoles: roles });
	},

	resetPassword: async (email) => {
		const state = get();
		state.setError(null);
		// Removed loading state - no loading indicators

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});

			if (error) throw error;

			logger.info("Password reset email sent:", email);
			return { success: true };
		} catch (error) {
			logger.error("Password reset error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		} finally {
			// Removed loading state change
		}
	},

	updatePassword: async (newPassword) => {
		const state = get();
		state.setError(null);

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) throw error;

			logger.info("Password updated successfully");
			return { success: true };
		} catch (error) {
			logger.error("Password update error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		}
	},

	// Profile management
	fetchProfile: async () => {
		const state = get();
		const user = state.user;
		if (!user) return;

		try {
			// Fetch user profile
			const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

			if (profileError && profileError.code !== "PGRST116") {
				throw profileError;
			}

			state.setProfile(profile);

			// Fetch business profile if exists
			const businessProfile = await getUserBusinessProfile(user.id);
			state.setBusinessProfile(businessProfile);

			logger.debug("Profile fetched successfully");
		} catch (error) {
			logger.error("Error fetching profile:", error);
			state.setError(error.message);
		}
	},

	updateProfile: async (updates) => {
		const state = get();
		const user = state.user;
		if (!user) return { success: false, error: "No user logged in" };

		try {
			const { error } = await supabase
				.from("users")
				.update({
					...updates,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (error) throw error;

			// Update local state
			state.setProfile({ ...state.profile, ...updates });

			logger.info("Profile updated successfully");
			return { success: true };
		} catch (error) {
			logger.error("Profile update error:", error);
			state.setError(error.message);
			return { success: false, error: error.message };
		}
	},

	// Fetch user profile from database
	fetchProfile: async () => {
		try {
			const state = get();
			const user = state.user;
			
			if (!user) {
				logger.debug("No user available for profile fetch");
				return;
			}

			logger.debug("Fetching user profile for:", user.id);

			// Fetch user profile from public.users table
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
				.maybeSingle();

			if (profileError && profileError.code !== "PGRST116") {
				logger.error("Error fetching user profile:", profileError);
				return;
			}

			// Set profile data
			state.setProfile(profile);

			// Fetch business profile if user has one
			const businessProfile = await getUserBusinessProfile(user.id);
			state.setBusinessProfile(businessProfile);

			logger.debug("Profile fetch completed successfully");
		} catch (error) {
			logger.error("Error in fetchProfile:", error);
		}
	},

	// Session management
	initializeAuth: async () => {
		try {
			// Removed loading state - no loading indicators

			// Get initial session
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) {
				logger.error("Error getting session:", error);
				set({ error: error.message }); // Removed loading state
				return;
			}

			if (session) {
				get().setSession(session);
				await get().fetchProfile();
			} else {
				// Removed loading state change
			}

			// Set up auth state change listener
			supabase.auth.onAuthStateChange(async (event, session) => {
				logger.debug("Auth state change:", event);

				get().setSession(session);

				if (session) {
					await get().fetchProfile();
				} else {
					set({
						user: null,
						profile: null,
						businessProfile: null,
						error: null,
						userRoles: [],
					});
				}
			});
		} catch (error) {
			logger.error("Error initializing auth:", error);
			set({ error: error.message }); // Removed loading state
		}
	},

	// Role and permissions
	hasRole: (role) => {
		const state = get();
		return state.profile?.role === role;
	},

	hasPermission: (permission) => {
		const state = get();
		const userRole = state.profile?.role;

		// Define permissions by role
		const permissions = {
			admin: ["all"],
			business: ["manage_business", "view_analytics", "manage_team"],
			user: ["view_profile", "leave_reviews"],
		};

		return permissions[userRole]?.includes(permission) || permissions[userRole]?.includes("all");
	},

	// Computed values
	isAuthenticated: () => {
		const state = get();
		return !!state.user && !!state.session;
	},

	isEmailVerified: () => {
		const state = get();
		return state.profile?.email_verified || state.user?.email_confirmed_at;
	},

	getDisplayName: () => {
		const state = get();
		return state.profile?.name || state.user?.email || "Anonymous";
	},

	getAvatarUrl: () => {
		const state = get();
		return state.profile?.avatar_url || state.user?.user_metadata?.avatar_url;
	},

	// Activity tracking
	isSessionActive: () => {
		const state = get();
		const now = Date.now();
		const timeSinceLastActivity = now - state.lastActivity;
		const maxInactivity = 30 * 60 * 1000; // 30 minutes

		return timeSinceLastActivity < maxInactivity;
	},

	// Cleanup
	cleanup: () => {
		set({
			user: null,
			profile: null,
			businessProfile: null,
			session: null,
					loading: false, // Never show loading states
		error: null,
		isSigningIn: false, // Never show loading states
		isSigningUp: false, // Never show loading states
		isSigningOut: false, // Never show loading states
		isResettingPassword: false, // Never show loading states
			lastActivity: Date.now(),
			userRoles: [],
		});
	},
}));

export { useAuthStore };
