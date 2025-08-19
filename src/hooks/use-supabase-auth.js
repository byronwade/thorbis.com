// Enhanced Supabase Auth Hook
// Provides a comprehensive auth interface with error handling, validation, and utilities

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@store/auth";
import { mapAuthError, validatePasswordStrength, validateEmail, checkRateLimit, recordFailedAttempt, clearRateLimit } from "@lib/database/supabase/auth/utils";
import { getEnabledProviders, createOAuthSignInOptions } from "@lib/database/supabase/auth/providers";
import { supabase } from "@lib/database/supabase";
import { toast } from "sonner";
import logger from "@lib/utils/logger";

export const useSupabaseAuth = () => {
	const authStore = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [retryAfter, setRetryAfter] = useState(null);

	const { user, profile, loading: storeLoading, initializeAuth, isAuthenticated } = authStore;
	const userRole = profile?.role;

	// Initialize auth on mount
	useEffect(() => {
		const initAuth = async () => {
			try {
				await initializeAuth();
			} catch (error) {
				logger.error("Failed to initialize auth:", error);
			}
		};

		initAuth();
	}, [initializeAuth]);

	// Clear error after delay
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => setError(null), 10000); // Clear after 10 seconds
			return () => clearTimeout(timer);
		}
	}, [error]);

	// Enhanced login with rate limiting and error handling
	const login = useCallback(
		async (email, password) => {
			// Clear previous errors
			setError(null);
			setRetryAfter(null);

			// Validate inputs
			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				const errorDetails = {
					type: "validation_error",
					message: emailValidation.message,
					userMessage: emailValidation.message,
					field: "email",
					retryable: true,
				};
				setError(errorDetails);
				return { success: false, error: errorDetails };
			}

			// Check rate limiting
			const rateLimitKey = `login_${email}`;
			const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

			if (!rateLimit.allowed) {
				const errorDetails = {
					type: "rate_limit_error",
					message: "Too many login attempts",
					userMessage: "Too many failed login attempts. Please try again later.",
					retryable: true,
					retryDelay: rateLimit.retryAfter,
				};
				setError(errorDetails);
				setRetryAfter(rateLimit.retryAfter);
				return { success: false, error: errorDetails };
			}

			setIsLoading(true);

			try {
				await authStore.login(email, password);

				// Clear rate limiting on successful login
				clearRateLimit(rateLimitKey);

				logger.debug("Login successful via useSupabaseAuth hook");
				return { success: true };
			} catch (authError) {
				// Record failed attempt for rate limiting
				recordFailedAttempt(rateLimitKey);

				const errorDetails = mapAuthError(authError);
				setError(errorDetails);

				logger.error("Login failed via useSupabaseAuth hook:", authError);
				return { success: false, error: errorDetails };
			} finally {
				setIsLoading(false);
			}
		},
		[authStore]
	);

	// Enhanced signup with password validation
	const signup = useCallback(
		async (email, password, userData = {}) => {
			setError(null);

			// Validate email
			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				const errorDetails = {
					type: "validation_error",
					message: emailValidation.message,
					userMessage: emailValidation.message,
					field: "email",
					retryable: true,
				};
				setError(errorDetails);
				return { success: false, error: errorDetails };
			}

			// Validate password strength
			const passwordStrength = validatePasswordStrength(password);
			if (!passwordStrength.isValid) {
				const errorDetails = {
					type: "validation_error",
					message: "Password does not meet requirements",
					userMessage: passwordStrength.feedback.join(" "),
					field: "password",
					retryable: true,
				};
				setError(errorDetails);
				return { success: false, error: errorDetails, passwordStrength };
			}

			setIsLoading(true);

			try {
				const result = await authStore.signup(email, password, userData);

				logger.debug("Signup successful via useSupabaseAuth hook");
				return { success: true, data: result };
			} catch (authError) {
				const errorDetails = mapAuthError(authError);
				setError(errorDetails);

				logger.error("Signup failed via useSupabaseAuth hook:", authError);
				return { success: false, error: errorDetails };
			} finally {
				setIsLoading(false);
			}
		},
		[authStore]
	);

	// OAuth login with provider selection
	const loginWithOAuth = useCallback(async (providerName, redirectTo) => {
		setError(null);
		setIsLoading(true);

		try {
			const enabledProviders = getEnabledProviders();
			const provider = enabledProviders.find((p) => p.name === providerName);

			if (!provider) {
				throw new Error(`OAuth provider '${providerName}' is not enabled or configured`);
			}

			const signInOptions = createOAuthSignInOptions(provider, redirectTo);

			const { data, error } = await supabase.auth.signInWithOAuth(signInOptions);

			if (error) {
				throw error;
			}

			logger.debug(`OAuth login initiated with ${providerName}`);
			return { success: true, data };
		} catch (authError) {
			const errorDetails = mapAuthError(authError);
			setError(errorDetails);

			logger.error(`OAuth login failed with ${providerName}:`, authError);
			return { success: false, error: errorDetails };
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Enhanced logout
	const logout = useCallback(async () => {
		setError(null);
		setIsLoading(true);

		try {
			await authStore.logout();

			logger.debug("Logout successful via useSupabaseAuth hook");
			return { success: true };
		} catch (authError) {
			const errorDetails = mapAuthError(authError);
			setError(errorDetails);

			logger.error("Logout failed via useSupabaseAuth hook:", authError);
			return { success: false, error: errorDetails };
		} finally {
			setIsLoading(false);
		}
	}, [authStore]);

	// Password reset
	const resetPassword = useCallback(
		async (email) => {
			setError(null);

			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				const errorDetails = {
					type: "validation_error",
					message: emailValidation.message,
					userMessage: emailValidation.message,
					field: "email",
					retryable: true,
				};
				setError(errorDetails);
				return { success: false, error: errorDetails };
			}

			setIsLoading(true);

			try {
				await authStore.resetPassword(email);

				logger.debug("Password reset email sent via useSupabaseAuth hook");
				return { success: true };
			} catch (authError) {
				const errorDetails = mapAuthError(authError);
				setError(errorDetails);

				logger.error("Password reset failed via useSupabaseAuth hook:", authError);
				return { success: false, error: errorDetails };
			} finally {
				setIsLoading(false);
			}
		},
		[authStore]
	);

	// Update password
	const updatePassword = useCallback(
		async (newPassword) => {
			setError(null);

			const passwordStrength = validatePasswordStrength(newPassword);
			if (!passwordStrength.isValid) {
				const errorDetails = {
					type: "validation_error",
					message: "Password does not meet requirements",
					userMessage: passwordStrength.feedback.join(" "),
					field: "password",
					retryable: true,
				};
				setError(errorDetails);
				return { success: false, error: errorDetails, passwordStrength };
			}

			setIsLoading(true);

			try {
				await authStore.updatePassword(newPassword);

				logger.debug("Password updated via useSupabaseAuth hook");
				return { success: true };
			} catch (authError) {
				const errorDetails = mapAuthError(authError);
				setError(errorDetails);

				logger.error("Password update failed via useSupabaseAuth hook:", authError);
				return { success: false, error: errorDetails };
			} finally {
				setIsLoading(false);
			}
		},
		[authStore]
	);

	// Get enabled OAuth providers
	const getOAuthProviders = useCallback(() => {
		return getEnabledProviders();
	}, []);

	// Check if user has specific role
	const hasRole = useCallback(
		(role) => {
			return userRole === role;
		},
		[userRole]
	);

	// Check if user has any of the specified roles
	const hasAnyRole = useCallback(
		(roles) => {
			return roles.includes(userRole);
		},
		[userRole]
	);

	// Utility to show error toast
	const showErrorToast = useCallback((errorDetails) => {
		if (errorDetails?.userMessage) {
			toast.error(errorDetails.userMessage);
		}
	}, []);

	// Utility to show success toast
	const showSuccessToast = useCallback((message) => {
		toast.success(message);
	}, []);

	return {
		// Auth state
		user,
		isAuthenticated: isAuthenticated(),
		userRole,
		loading: storeLoading || isLoading,
		error,
		retryAfter,

		// Auth actions
		login,
		signup,
		logout,
		loginWithOAuth,
		resetPassword,
		updatePassword,

		// Utilities
		getOAuthProviders,
		hasRole,
		hasAnyRole,
		validateEmail: (email) => validateEmail(email),
		validatePasswordStrength: (password) => validatePasswordStrength(password),

		// UI helpers
		showErrorToast,
		showSuccessToast,

		// Clear error manually
		clearError: () => setError(null),
	};
};
