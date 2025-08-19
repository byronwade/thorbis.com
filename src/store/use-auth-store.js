import { create } from "zustand";
import { supabase } from "@lib/database/supabase";
import logger from "@lib/utils/logger";

// Dev helper: detect if auth should be disabled for testing (dev-only)
function isDevAuthDisabled() {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "development") return false;
  try {
    const ls = window.localStorage.getItem("thorbis_auth_dev_disabled");
    const ck = document.cookie.includes("dev_auth_off=1");
    return ls === "1" || ck;
  } catch {
    return false;
  }
}

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
					name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || existingUser.name,
					avatar_url: authUser.user_metadata?.avatar_url,
					email_verified: !!authUser.email_confirmed_at,
					phone: authUser.phone,
					updated_at: new Date().toISOString(),
				})
				.eq("id", authUser.id);

			if (updateError) {
				logger.error("Error updating user profile:", updateError);
			}
		}

		const duration = performance.now() - startTime;
		logger.performance(`User profile sync completed in ${duration.toFixed(2)}ms`);
	} catch (error) {
		logger.error("Error syncing user profile:", error);
		// Don't throw - profile sync failure shouldn't block auth
	}
};

// Real user role fetching from Supabase
const fetchUserRolesClient = async (userId) => {
	try {
		logger.debug(`Fetching roles for user: ${userId}`);
		const startTime = performance.now();

		// Get user profile with role information
		const { data: userProfile, error: profileError } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();

		if (profileError) {
			logger.warn("User profile not found, using default role:", profileError);
			return ["user"]; // Default role if profile doesn't exist
		}

		// Build roles array based on user data
		const roles = [userProfile.role || "user"];

		// Check if user owns any businesses (more robust than single business_id)
		const { data: ownedBusinesses, error: businessError } = await supabase.from("businesses").select("id").eq("owner_id", userId).limit(1);

		if (!businessError && ownedBusinesses && ownedBusinesses.length > 0) {
			roles.push("business_owner");
			logger.debug(`User ${userId} owns ${ownedBusinesses.length} business(es), adding business_owner role`);
		}

		// Check if the user's primary role is admin
		if (userProfile.role === "admin") {
			// Admin role is already included from the primary role above
		}

		const duration = performance.now() - startTime;
		logger.performance(`User roles fetched in ${duration.toFixed(2)}ms`);
		logger.debug(`Final roles for user ${userId}:`, roles);

		return roles;
	} catch (error) {
		logger.error("Fetch user roles error:", error);
		return ["user"]; // Fallback to default role
	}
};

const useAuthStore = create((set, get) => ({
	user: null,
	isAuthenticated: false,
	userRoles: [],
	loading: true,
	isInitialized: false,
	setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
	setUserRoles: (roles) => set({ userRoles: roles }),
	setLoading: (loading) => set({ loading }),
	setIsInitialized: (isInitialized) => set({ isInitialized }),

	// Add method to refresh user roles
	refreshUserRoles: async () => {
		const { user } = get();
		if (!user) return;

		try {
			logger.debug("Manually refreshing user roles for:", user.id);
			const roles = await fetchUserRolesClient(user.id);
			set({ userRoles: roles });
			logger.debug("Roles refreshed:", roles);
		} catch (error) {
			logger.error("Failed to refresh user roles:", error);
		}
	},

	initializeAuth: async () => {
		if (get().isInitialized) return;

		set({ loading: true });
		try {
			// Dev mode: force logged-out state for testing login screens
			if (isDevAuthDisabled()) {
				logger.debug("Dev auth disabled: forcing logged-out state");
				set({ user: null, isAuthenticated: false, userRoles: [] });
				return;
			}

			const startTime = performance.now();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			const duration = performance.now() - startTime;
			logger.performance(`Auth session retrieved in ${duration.toFixed(2)}ms`);

			if (session) {
				const user = session.user;
				logger.debug("User is authenticated", user.id);

				// Ensure user exists in our users table
				await syncUserProfile(user);

				const roles = await fetchUserRolesClient(user.id);
				logger.debug("Fetched user roles", roles);
				set({ user, isAuthenticated: true, userRoles: roles });
			} else {
				logger.debug("No active session found");
				set({ user: null, isAuthenticated: false, userRoles: [] });
			}
		} catch (error) {
			logger.error("Error initializing auth:", error);
			set({ user: null, isAuthenticated: false, userRoles: [] });
		} finally {
			set({ loading: false, isInitialized: true });
		}
	},

	login: async (email, password) => {
		set({ loading: true });
		try {
			const startTime = performance.now();

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			const user = data.user;
			const duration = performance.now() - startTime;
			logger.performance(`Login completed in ${duration.toFixed(2)}ms`);
			logger.debug("Login successful", user.id);

			// Ensure user exists in our users table
			await syncUserProfile(user);

			const roles = await fetchUserRolesClient(user.id);
			set({ user, isAuthenticated: true, userRoles: roles, loading: false });

			// Log successful login for security auditing
			logger.security({
				action: "user_login",
				userId: user.id,
				email: user.email,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Login error:", error);
			set({ loading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ loading: true });
		try {
			const startTime = performance.now();
			const currentUser = get().user;

			const { error } = await supabase.auth.signOut();

			if (error) {
				const isMissingSession = error?.name === "AuthSessionMissingError" || error?.status === 400 || (error?.__isAuthError && !get().user);
				if (!isMissingSession) {
					throw error;
				}
				logger.debug("Logout with no active session; treating as success");
			}

			const duration = performance.now() - startTime;
			logger.performance(`Logout completed in ${duration.toFixed(2)}ms`);

			// Log successful logout for security auditing
			if (currentUser) {
				logger.security({
					action: "user_logout",
					userId: currentUser.id,
					timestamp: Date.now(),
				});
			}

			set({ user: null, isAuthenticated: false, userRoles: [], loading: false });
			logger.debug("Logout successful");
		} catch (error) {
			logger.error("Logout error:", error);
			set({ loading: false });
			throw error;
		}
	},

	signup: async (email, password, userData = {}) => {
		set({ loading: true });
		try {
			const startTime = performance.now();

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						first_name: userData.firstName,
						last_name: userData.lastName,
						full_name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
					},
				},
			});

			if (error) {
				throw error;
			}

			const duration = performance.now() - startTime;
			logger.performance(`Signup completed in ${duration.toFixed(2)}ms`);

			// Log successful signup for security auditing
			logger.security({
				action: "user_signup",
				email: email,
				timestamp: Date.now(),
			});

			return data;
		} catch (error) {
			logger.error("Signup error:", error);
			set({ loading: false });
			throw error;
		}
	},

	resetPassword: async (email) => {
		try {
			const startTime = performance.now();

			// Modern Supabase approach - use redirectTo parameter for automatic authentication
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/password-reset?reset=true`,
			});

			if (error) {
				throw error;
			}

			const duration = performance.now() - startTime;
			logger.performance(`Password reset email sent in ${duration.toFixed(2)}ms`);

			// Log password reset request for security auditing
			logger.security({
				action: "password_reset_requested",
				email: email,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Password reset error:", error);
			throw error;
		}
	},

	updatePassword: async (newPassword) => {
		try {
			const startTime = performance.now();

			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				throw error;
			}

			const duration = performance.now() - startTime;
			logger.performance(`Password updated in ${duration.toFixed(2)}ms`);

			// Log password update for security auditing
			const currentUser = get().user;
			if (currentUser) {
				logger.security({
					action: "password_updated",
					userId: currentUser.id,
					timestamp: Date.now(),
				});
			}
		} catch (error) {
			logger.error("Password update error:", error);
			throw error;
		}
	},

	onAuthStateChange: () => {
		// If dev auth is disabled, ignore auth state changes
		if (isDevAuthDisabled()) {
			return () => {};
		}
		return supabase.auth.onAuthStateChange(async (event, session) => {
		logger.debug("Auth state change - Event:", event, "Session:", !!session);

		try {
			if (session?.user) {
				const user = session.user;
				logger.debug("Auth state change - User signed in or token refreshed", user.id);

				// Sync user profile on auth state change
				await syncUserProfile(user);

				const roles = await fetchUserRolesClient(user.id);
				logger.debug("Auth state change - Fetched roles", roles);

				set({
					user,
					isAuthenticated: true,
					userRoles: roles,
					loading: false,
				});

				// Log auth state change for security auditing
				logger.security({
					action: "auth_state_change",
					event: event,
					userId: user.id,
					timestamp: Date.now(),
				});
			} else {
				logger.debug("Auth state change - User signed out or session is null");
				set({
					user: null,
					isAuthenticated: false,
					userRoles: [],
					loading: false,
				});

				// Log signout event
				if (event === "SIGNED_OUT") {
					logger.security({
						action: "auth_state_change",
						event: event,
						timestamp: Date.now(),
					});
				}
			}
		} catch (error) {
			logger.error("Error handling auth state change:", error);
			set({
				user: null,
				isAuthenticated: false,
				userRoles: [],
				loading: false,
			});
		}
	});
	},
}));

export default useAuthStore;
export { useAuthStore };
