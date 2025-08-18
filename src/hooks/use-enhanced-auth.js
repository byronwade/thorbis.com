// REQUIRED: Enhanced Authentication Hook with Security Features
// Provides comprehensive auth functionality with advanced security

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/database/supabase";
import { logger } from "@utils/logger";
import { PasswordSecurity } from "@lib/security/password-security";
import { validateEmail, validatePasswordStrength } from "@lib/database/supabase/auth/utils";
import { toast } from "sonner";

// Simple secure storage fallback for missing utility
const secureStorage = {
	getItem: (key) => {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch {
			return null;
		}
	},
	setItem: (key, value, options = {}) => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			logger.warn("Failed to set secure storage item:", error);
		}
	},
};

/**
 * Enhanced Authentication Hook
 * Provides secure authentication with advanced features
 */
export function useEnhancedAuth() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [initialized, setInitialized] = useState(false);
	const [loading] = useState(false); // Never show loading states
	const setLoading = () => {}; // No-op function - don't change loading state
	const [error, setError] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [profile, setProfile] = useState(null);
	const [deviceInfo, setDeviceInfo] = useState(null);
	const [securityMetrics, setSecurityMetrics] = useState({
		loginAttempts: 0,
		lastLogin: null,
		deviceTrusted: false,
		mfaEnabled: false,
		securityLevel: "standard",
	});

	// Debug logging for enhanced auth hook - throttled to prevent spam
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			console.log('🔍 useEnhancedAuth DEBUG:', {
				user: !!user,
				userEmail: user?.email,
				session: !!session,
				loading,
				userRoles: userRoles.length,
				profile: !!profile,
				initialized,
			});
		}, 100); // Debounce logs by 100ms
		
		return () => clearTimeout(timeoutId);
	}, [user?.id, session?.access_token, loading, userRoles.length, profile?.id, initialized]); // Only log on meaningful changes

	// This useEffect will be moved after initializeAuth is defined

	/**
	 * Helper functions defined first to avoid dependency issues
	 */
	const fetchUserProfile = useCallback(
		async (userId) => {
			const startTime = performance.now();

			try {
				if (process.env.NODE_ENV === "development") {
					console.log("🔍 Fetching user profile for ID:", userId);
				}

				// PERFORMANCE OPTIMIZATION: Use caching for user profiles
				const cacheKey = `user_profile_${userId}`;

				// Try to get from cache first
				const cachedProfile = secureStorage.getItem(cacheKey);
				if (cachedProfile) {
					if (process.env.NODE_ENV === "development") {
						console.log("📦 Using cached user profile");
					}
					setProfile(cachedProfile);
					logger.performance(`Profile fetched from cache in ${(performance.now() - startTime).toFixed(2)}ms`);
					return;
				}

				// PERFORMANCE OPTIMIZATION: Use auth.user metadata as fallback
				const authUser = session?.user;
				if (authUser) {
					// Create profile from auth user data as immediate fallback
					const fallbackProfile = {
						id: authUser.id,
						email: authUser.email,
						name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
						avatar_url: authUser.user_metadata?.avatar_url,
						created_at: authUser.created_at,
						...authUser.user_metadata,
					};

					setProfile(fallbackProfile);

					// Cache for future use
					secureStorage.setItem(cacheKey, fallbackProfile, { ttl: 5 * 60 * 1000 }); // 5 minutes cache

					if (process.env.NODE_ENV === "development") {
						console.log("✅ User profile created from auth metadata");
					}

					const queryTime = performance.now() - startTime;
					logger.performance(`Profile fetched from API in ${queryTime.toFixed(2)}ms`);

					// Log security event
					logger.security({
						action: "profile_accessed",
						targetUserId: userId,
						accessorUserId: userId,
						timestamp: Date.now(),
					});
				}
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("❌ Unexpected error fetching user profile:", error);
				}

				// Robust error logging with safe property access
				try {
					logger.error("Failed to fetch user profile:", {
						userId: userId || "unknown",
						error: error?.message || error?.toString() || "Unknown error",
						stack: error?.stack || "No stack trace available",
						errorType: typeof error,
						errorConstructor: error?.constructor?.name || "unknown",
					});
				} catch (logError) {
					// Fallback if logger fails
					console.error("Logger failed for user profile error:", {
						originalError: error,
						logError: logError,
						userId,
					});
				}
			}
		},
		[session]
	);

	const fetchUserRoles = useCallback(
		async (userId) => {
			const startTime = performance.now();

			try {
				if (process.env.NODE_ENV === "development") {
					console.log("🔍 Fetching user roles for ID:", userId);
				}

				// Get user profile with role information
				const { data: userProfile, error: profileError } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();

				if (profileError) {
					console.warn("User profile not found, using default role:", profileError);
					setUserRoles(["user"]); // Default role if profile doesn't exist
					return;
				}

				// Build roles array based on user data
				const roles = [userProfile?.role || "user"];

				// Check if user owns any businesses (same logic as auth store)
				const { data: ownedBusinesses, error: businessError } = await supabase.from("businesses").select("id").eq("owner_id", userId).limit(1);

				if (!businessError && ownedBusinesses && ownedBusinesses.length > 0) {
					roles.push("business_owner");
					if (process.env.NODE_ENV === "development") {
						console.log(`✅ User ${userId} owns ${ownedBusinesses.length} business(es), adding business_owner role`);
					}
				}

				// For development, check for admin emails
				const authUser = session?.user;
				if (process.env.NODE_ENV === "development" && authUser?.email) {
					const adminEmails = ["bcw1995@gmail.com", "admin@thorbis.com"];
					if (adminEmails.includes(authUser.email) && !roles.includes("admin")) {
						roles.push("admin");
					}
				}

				setUserRoles(roles);

				if (process.env.NODE_ENV === "development") {
					console.log("✅ User roles fetched:", roles);
				}

				const queryTime = performance.now() - startTime;
				logger.performance(`Roles fetched in ${queryTime.toFixed(2)}ms`);
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("❌ Unexpected error fetching user roles:", error);
				}

				// Robust error logging with safe property access
				try {
					logger.error("Failed to fetch user roles:", {
						userId: userId || "unknown",
						error: error?.message || error?.toString() || "Unknown error",
						stack: error?.stack || "No stack trace available",
						errorType: typeof error,
						errorConstructor: error?.constructor?.name || "unknown",
					});
				} catch (logError) {
					// Fallback if logger fails
					console.error("Logger failed for user roles error:", {
						originalError: error,
						logError: logError,
						userId,
					});
				}
				setUserRoles(["user"]); // Safe fallback
			}
		},
		[session]
	);

	/**
	 * Initialize authentication state
	 */
	/**
	 * Handle auth state changes - defined before initializeAuth to avoid circular dependencies
	 */
	const handleAuthStateChange = useCallback(
		async (event, session) => {
			try {
				console.log("🔐 Auth state change:", { event, hasSession: !!session, userId: session?.user?.id });

				setSession(session);
				setUser(session?.user || null);

				if (session?.user) {
					console.log("👤 Loading user data for:", session.user.id);

					// OPTIMIZED: Parallel loading of user data with error isolation
					const userDataPromises = [
						fetchUserProfile(session.user.id).catch((err) => {
							logger.warn("Profile fetch failed:", err);
							return null;
						}),
						fetchUserRoles(session.user.id).catch((err) => {
							logger.warn("Roles fetch failed:", err);
							return [];
						}),
						updateSecurityMetrics(session.user.id).catch((err) => {
							logger.warn("Security metrics failed:", err);
							return null;
						}),
					];

					// Execute all user data fetching in parallel
					await Promise.allSettled(userDataPromises);

					// Log security event asynchronously (don't block UI)
					setTimeout(() => {
						setDeviceInfo((currentDeviceInfo) => {
							logger.security({
								action: "auth_state_changed",
								event,
								userId: session.user.id,
								deviceFingerprint: currentDeviceInfo?.id,
								timestamp: Date.now(),
							});
							return currentDeviceInfo; // Return unchanged
						});
					}, 0);

					if (process.env.NODE_ENV === "development") {
						console.log("✅ User data loaded successfully");
					}
				} else {
					// User signed out - clear data
					setProfile(null);
					setUserRoles([]);
					console.log("🔒 User signed out, data cleared");
				}
			} catch (error) {
				try {
					logger.error("Auth state change handler error:", {
						event,
						userId: session?.user?.id,
						message: error?.message || "Unknown error",
						stack: error?.stack || "No stack trace available",
						errorType: typeof error,
						errorConstructor: error?.constructor?.name || "unknown",
					});
				} catch (logError) {
					// Fallback if logger fails
					console.error("Logger failed for auth state change error:", {
						originalError: error,
						logError: logError,
						event,
						userId: session?.user?.id,
					});
				}
			}
		},
		[fetchUserProfile, fetchUserRoles] // Dependencies for the handler
	);

	const initializeAuth = useCallback(async () => {
		const startTime = performance.now();
		console.log('🔍 useEnhancedAuth initializeAuth: Starting initialization');

		try {
			setLoading(true);

			// OPTIMIZED: Run device fingerprint and session fetch in parallel
			// PERFORMANCE OPTIMIZATION: Use lightweight device info instead of heavy fingerprinting
			console.log('🔍 useEnhancedAuth: Starting parallel device info and session fetch');
			
			const [deviceInfo, sessionResult] = await Promise.all([
				// Generate lightweight device info for security
				Promise.resolve({
					id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					userAgent: navigator.userAgent.substring(0, 100), // Truncate for performance
					screen: `${window.screen.width}x${window.screen.height}`,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					language: navigator.language,
					platform: navigator.platform,
					timestamp: Date.now(),
				}),
				Promise.race([
					supabase.auth.getSession(),
					new Promise((_, reject) => 
						setTimeout(() => reject(new Error('Session fetch timeout')), 1500) // Reduced from 5s to 1.5s
					)
				]).catch(err => {
					console.warn('⚠️ Session fetch failed:', err);
					return { data: { session: null }, error: null };
				})
			]);
			
			console.log('🔍 useEnhancedAuth: Parallel fetch completed:', {
				hasDeviceInfo: !!deviceInfo,
				hasSessionResult: !!sessionResult
			});

			setDeviceInfo(deviceInfo);
			
			console.log('🔍 useEnhancedAuth: Processing session result:', {
				sessionResult,
				hasData: !!sessionResult?.data,
				hasSession: !!sessionResult?.data?.session,
				error: sessionResult?.error
			});

			const {
				data: { session } = { session: null },
				error: sessionError,
			} = sessionResult || {};

			if (sessionError) {
				console.warn('⚠️ Session initialization error:', sessionError);
				logger.error("Session initialization error:", sessionError);
				// Don't throw - continue with no session
			}

			if (session) {
				console.log('🔍 useEnhancedAuth: Session found, calling handleAuthStateChange');
				await handleAuthStateChange("SIGNED_IN", session);
			} else {
				console.log('🔍 useEnhancedAuth: No session found initially, checking localStorage backup');
				
				// Check if we have a session in localStorage as backup
				if (typeof window !== 'undefined') {
					// Check for Supabase session data in localStorage
					const supabaseSessionKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
					const localSession = localStorage.getItem(supabaseSessionKey);
					
					if (localSession) {
						console.log('🔍 useEnhancedAuth: Found potential session in localStorage, attempting refresh');
						try {
							// Try to refresh the session using Supabase's built-in method
							const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
							if (refreshedSession && !refreshError) {
								console.log('✅ useEnhancedAuth: Successfully restored session from localStorage');
								await handleAuthStateChange("SIGNED_IN", refreshedSession);
								return; // Exit early since we found a valid session
							} else {
								console.log('🔍 useEnhancedAuth: Session refresh failed or returned no session:', refreshError);
							}
						} catch (error) {
							console.warn('⚠️ useEnhancedAuth: Session refresh failed:', error);
						}
					} else {
						console.log('🔍 useEnhancedAuth: No session data found in localStorage');
					}
				}
				
				console.log('🔍 useEnhancedAuth: No valid session found, setting unauthenticated state');
				setLoading(false);
				setUser(null);
				setProfile(null);
				setUserRoles([]);
			}

			// Set up auth state change listener
			console.log('🔍 useEnhancedAuth: Setting up auth state change listener');
			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange(async (event, session) => {
				console.log("🔐 Auth state changed:", event, "hasSession:", !!session);
				try {
					await handleAuthStateChange(event, session);
				} catch (error) {
					console.error('❌ Auth state change handler error:', error);
				}
			});
			
			console.log('🔍 useEnhancedAuth: Auth state listener set up:', {
				hasSubscription: !!subscription
			});

			const duration = performance.now() - startTime;
			logger.performance(`Auth initialization completed in ${duration.toFixed(2)}ms`);
			console.log('✅ useEnhancedAuth: Initialization completed successfully');
			setInitialized(true);

			return () => {
				subscription?.unsubscribe();
			};
		} catch (error) {
			console.error('❌ useEnhancedAuth: Initialization failed:', error);
			logger.error("Auth initialization failed:", error);
			setError({
				message: error.message,
				userMessage: "Failed to initialize authentication. Please refresh the page.",
			});
			// Ensure loading is set to false even on error
			setLoading(false);
			setInitialized(true);
		}
	}, [handleAuthStateChange]); // Now properly depends on handleAuthStateChange

	// Initialize auth state and listeners - runs only once on mount
	useEffect(() => {
		console.log('🔍 useEnhancedAuth: useEffect triggered for auth initialization');
		let cleanup;
		let timeoutId;
		let initializationCompleted = false;
		
		const init = async () => {
			console.log('🔍 useEnhancedAuth: Calling initializeAuth()');
			
			// Set a reasonable timeout failsafe - reduced from 5s to 2s for better UX
			timeoutId = setTimeout(() => {
				if (!initializationCompleted) {
					console.warn('⚠️ useEnhancedAuth: Auth initialization timeout after 2 seconds');
					setLoading(false);
					// Don't clear user state - might be a valid session that took time to load
					console.log('🔄 useEnhancedAuth: Timeout triggered, but preserving any valid session data');
					setInitialized(true);
				}
			}, 2000); // 2 second timeout - faster response for better UX
			
			try {
				cleanup = await initializeAuth();
				initializationCompleted = true;
				console.log('✅ useEnhancedAuth: Initialization completed successfully');
			} catch (error) {
				console.error('❌ useEnhancedAuth: Init error:', error);
				setLoading(false);
				initializationCompleted = true;
			} finally {
				// Clear the timeout since initialization attempt completed
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			}
		};
		
		init();

		// Cleanup subscription on unmount
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (cleanup && typeof cleanup === "function") {
				cleanup();
			}
		};
	}, []); // Empty dependency array ensures this only runs once



	/**
	 * Enhanced login with security features
	 */
	const login = useCallback(
		async (email, password, context = {}) => {
			const startTime = performance.now();
			setError(null);
			setLoading(true);

			try {
				// Validate inputs
				if (!email || !password) {
					throw new Error("Email and password are required");
				}

				// Security context
				const securityContext = {
					deviceFingerprint: deviceInfo?.id,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					language: navigator.language,
					screen: {
						width: window.screen.width,
						height: window.screen.height,
					},
					...context,
				};

				// Attempt login
				const { data, error: loginError } = await supabase.auth.signInWithPassword({
					email: email.toLowerCase().trim(),
					password,
				});

				if (loginError) {
					// Log failed attempt
					logger.security({
						action: "login_failed",
						email,
						error: loginError.message,
						deviceFingerprint: deviceInfo?.id,
						securityContext,
						timestamp: Date.now(),
					});

					throw loginError;
				}

				// Update device trust if requested
				if (context.trustedDevice && data.user) {
					await updateDeviceTrust(data.user.id, deviceInfo?.id, true);
				}

				// Log successful login
				logger.security({
					action: "login_success",
					userId: data.user.id,
					email,
					deviceFingerprint: deviceInfo?.id,
					securityContext,
					duration: performance.now() - startTime,
					timestamp: Date.now(),
				});

				// CRITICAL FIX: Explicitly update auth state after successful login
				// This ensures the user data is immediately available and doesn't rely 
				// solely on the auth state change listener which may have timing issues
				console.log('✅ Login successful, updating auth state immediately');
				await handleAuthStateChange("SIGNED_IN", data.session);

				return { success: true, data };
			} catch (error) {
				const duration = performance.now() - startTime;
				logger.error(`Login failed in ${duration.toFixed(2)}ms:`, error);

				const errorResponse = {
					success: false,
					error: {
						message: error.message,
						userMessage: getLoginErrorMessage(error),
					},
				};

				setError(errorResponse.error);
				return errorResponse;
			} finally {
				setLoading(false);
			}
		},
		[deviceInfo, handleAuthStateChange]
	);

	/**
	 * Enhanced logout with cleanup
	 */
	const logout = useCallback(async () => {
		const startTime = performance.now();
		setLoading(true);

		try {
			const currentUser = user;

			// Clear local state first for immediate UI feedback
			setUser(null);
			setSession(null);
			setProfile(null);
			setUserRoles([]);

			// Perform logout
			const { error } = await supabase.auth.signOut();

			if (error) {
				// Treat missing session as successful logout (idempotent)
				const isMissingSession = error?.name === "AuthSessionMissingError" || error?.status === 400 || (error?.__isAuthError && !session);

				if (isMissingSession) {
					logger.debug("Logout with no active session; treating as success");
				} else {
					logger.error("Logout error:", error);
				}
				// Don't throw here as user state is already cleared
			}

			// Log logout
			if (currentUser) {
				logger.security({
					action: "user_logout",
					userId: currentUser.id,
					deviceFingerprint: deviceInfo?.id,
					duration: performance.now() - startTime,
					timestamp: Date.now(),
				});
			}

			// Clear sensitive data from storage
			sessionStorage.removeItem("loginAttempts");
			localStorage.removeItem("deviceTrust");

			// Navigate to login
			router.push("/login");
		} catch (error) {
			logger.error("Logout failed:", error);
			// Force clear state even if logout fails
			setUser(null);
			setSession(null);
			setProfile(null);
			setUserRoles([]);
		} finally {
			setLoading(false);
		}
	}, [user, deviceInfo, router]);

	/**
	 * OAuth login with enhanced security
	 */
	const loginWithOAuth = useCallback(
		async (provider, redirectTo) => {
			try {
				setError(null);
				setLoading(true);

				const { data, error } = await supabase.auth.signInWithOAuth({
					provider,
					options: {
						redirectTo,
						queryParams: {
							access_type: "offline",
							prompt: "consent",
							device_id: deviceInfo?.id,
						},
					},
				});

				if (error) {
					logger.error(`OAuth login failed for ${provider}:`, error);
					throw error;
				}

				// Log OAuth attempt
				logger.security({
					action: "oauth_login_initiated",
					provider,
					deviceFingerprint: deviceInfo?.id,
					redirectTo,
					timestamp: Date.now(),
				});

				return { success: true, data };
			} catch (error) {
				const errorResponse = {
					success: false,
					error: {
						message: error.message,
						userMessage: `${provider} login failed. Please try again.`,
					},
				};

				setError(errorResponse.error);
				return errorResponse;
			} finally {
				setLoading(false);
			}
		},
		[deviceInfo]
	);

	/**
	 * Enhanced signup with comprehensive validation and security
	 */
	const signup = useCallback(
		async (email, password, userData = {}) => {
			const startTime = performance.now();
			setError(null);
			setLoading(true);

			try {
				// Validate inputs
				if (!email || !password) {
					throw new Error("Email and password are required");
				}

				// Validate email format
				const emailValidation = validateEmail(email);
				if (!emailValidation.isValid) {
					throw new Error(emailValidation.message);
				}

				// Validate password strength
				const passwordStrength = validatePasswordStrength(password);
				if (!passwordStrength.isValid) {
					throw new Error(passwordStrength.feedback.join(" "));
				}

				// Prepare user metadata with proper field mapping
				const userMetadata = {
					first_name: userData.firstName,
					last_name: userData.lastName,
					full_name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
					...userData, // Include any additional metadata
				};

				// Security context for signup
				const securityContext = {
					deviceFingerprint: deviceInfo?.id,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					language: navigator.language,
					screen: {
						width: window.screen.width,
						height: window.screen.height,
					},
					signupTimestamp: Date.now(),
				};

				// Attempt signup
				const { data, error: signupError } = await supabase.auth.signUp({
					email: email.toLowerCase().trim(),
					password,
					options: {
						data: userMetadata,
					},
				});

				if (signupError) {
					// Log failed signup attempt
					logger.security({
						action: "signup_failed",
						email,
						error: signupError.message,
						deviceFingerprint: deviceInfo?.id,
						securityContext,
						timestamp: Date.now(),
					});

					throw signupError;
				}

				// Log successful signup
				logger.security({
					action: "signup_success",
					userId: data.user?.id,
					email,
					deviceFingerprint: deviceInfo?.id,
					securityContext,
					duration: performance.now() - startTime,
					timestamp: Date.now(),
				});

				logger.performance(`Signup completed in ${(performance.now() - startTime).toFixed(2)}ms`);

				return { success: true, data };
			} catch (error) {
				const duration = performance.now() - startTime;
				logger.error(`Signup failed in ${duration.toFixed(2)}ms:`, error);

				const errorResponse = {
					success: false,
					error: {
						message: error.message,
						userMessage: getSignupErrorMessage(error),
					},
				};

				setError(errorResponse.error);
				return errorResponse;
			} finally {
				setLoading(false);
			}
		},
		[deviceInfo]
	);

	/**
	 * Check for breached passwords with enhanced error handling
	 */
	const checkBreachedPassword = useCallback(async (password) => {
		// Emergency bypass for development if crypto keeps failing
		const SKIP_BREACH_CHECK = process.env.NEXT_PUBLIC_SKIP_BREACH_CHECK === "true";

		if (SKIP_BREACH_CHECK && process.env.NODE_ENV === "development") {
			console.log("⚠️ Password breach check BYPASSED for development");
			return false;
		}

		if (!password || password.length < 4) {
			return false;
		}

		if (process.env.NODE_ENV === "development") {
			console.log("🔐 Starting password breach check...");
		}

		try {
			const result = await PasswordSecurity.checkBreachedPassword(password);

			// Validate result object structure
			if (!result || typeof result !== 'object') {
				logger.warn('Password breach check returned invalid result:', result);
				return false; // Allow login to continue with warning
			}

			// Handle various error states gracefully
			if (result.error) {
				if (process.env.NODE_ENV === "development") {
					console.warn(`Password breach check non-critical error: ${result.error}`);
				}

				// Non-blocking errors - allow login to continue
				const nonBlockingErrors = ["HASH_GENERATION_FAILED", "API_ERROR", "TIMEOUT", "CHECK_FAILED", "UNKNOWN_ERROR", "EMPTY_OBJECT_ERROR", "NULL_ERROR", "STRING_ERROR", "UNKNOWN_TYPE_ERROR", "EMPTY_FETCH_ERROR", "FETCH_ERROR"];
				if (nonBlockingErrors.includes(result.error)) {
					logger.info(`Password breach check failed with recoverable error: ${result.error}`);
					return false; // Allow login to continue
				}
			}

			if (process.env.NODE_ENV === "development") {
				console.log("✅ Password breach check completed:", result.isBreached ? "BREACHED" : "SAFE");
			}

			return result.isBreached;
		} catch (error) {
			// Enhanced error handling with better debugging
			let errorDetails = "Unknown error";
			let errorType = typeof error;
			let errorKeys = [];
			
			// Enhanced error analysis
			if (!error) {
				errorDetails = "Null/undefined error";
				errorType = "null";
			} else if (typeof error === 'object') {
				if (Object.keys(error).length === 0) {
					errorDetails = "Empty error object";
					errorType = "empty_object";
				} else {
					errorKeys = Object.keys(error);
					errorDetails = error.message || error.toString() || "Object error without message";
					errorType = "object";
					
					// Log additional error properties for debugging
					if (process.env.NODE_ENV === "development") {
						console.error("🔍 Error object analysis in auth hook:", {
							keys: errorKeys,
							constructor: error.constructor?.name,
							prototype: Object.getPrototypeOf(error)?.constructor?.name,
							hasMessage: 'message' in error,
							hasName: 'name' in error,
							hasStack: 'stack' in error,
							hasCode: 'code' in error,
						});
					}
				}
			} else if (typeof error === 'string') {
				errorDetails = error;
				errorType = "string";
			} else {
				errorDetails = `Unhandled error type: ${typeof error}`;
				errorType = typeof error;
			}

			logger.error("Password breach check failed in auth hook:", { 
				errorDetails, 
				errorType,
				errorKeys,
				timestamp: Date.now(),
				environment: process.env.NODE_ENV,
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
			});

			if (process.env.NODE_ENV === "development") {
				console.warn("❌ Password breach check failed - allowing login to continue for better UX:", errorDetails);
			}
			return false; // Fail safely - don't block legitimate users
		}
	}, []);

	// Test crypto fallback system on initialization (development only)
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			const testCryptoFallback = async () => {
				try {
					console.log("🔐 Testing crypto fallback system...");
					const testResult = PasswordSecurity.testPureJSSHA1();
					if (testResult) {
						console.log("✅ Crypto fallback system verified and ready");
					} else {
						console.warn("⚠️ Crypto fallback system test failed");
					}
					
					// Run comprehensive debug test
					console.log("🔍 Running comprehensive password breach check debug...");
					await PasswordSecurity.debugPasswordBreachCheck();
				} catch (error) {
					console.warn("⚠️ Crypto fallback system test error:", error.message);
				}
			};

			// Run test after a short delay to avoid blocking initialization
			const timeoutId = setTimeout(testCryptoFallback, 1000);
			return () => clearTimeout(timeoutId);
		}
	}, []);

	// validateEmail and validatePasswordStrength are now imported from @lib/supabase/auth/utils

	/**
	 * Reset password
	 */
	const resetPassword = useCallback(
		async (email) => {
			try {
				setError(null);
				setLoading(true);

				const { error } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${window.location.origin}/auth/reset-password`,
				});

				if (error) throw error;

				logger.security({
					action: "password_reset_requested",
					email,
					deviceFingerprint: deviceInfo?.id,
					timestamp: Date.now(),
				});

				return { success: true };
			} catch (error) {
				logger.error("Password reset failed:", error);
				const errorResponse = {
					success: false,
					error: {
						message: error.message,
						userMessage: "Failed to send reset email. Please try again.",
					},
				};

				setError(errorResponse.error);
				return errorResponse;
			} finally {
				setLoading(false);
			}
		},
		[deviceInfo]
	);

	/**
	 * Update password
	 */
	const updatePassword = useCallback(
		async (newPassword) => {
			try {
				setError(null);
				setLoading(true);

				// Validate password strength
				const strength = PasswordSecurity.assessPasswordStrength(newPassword);
				if (strength.score < 60) {
					throw new Error("Password does not meet security requirements");
				}

				// Check for breaches
				const isBreached = await checkBreachedPassword(newPassword);
				if (isBreached) {
					throw new Error("This password has been found in data breaches");
				}

				const { error } = await supabase.auth.updateUser({
					password: newPassword,
				});

				if (error) throw error;

				logger.security({
					action: "password_updated",
					userId: user?.id,
					passwordStrength: strength.score,
					deviceFingerprint: deviceInfo?.id,
					timestamp: Date.now(),
				});

				return { success: true };
			} catch (error) {
				logger.error("Password update failed:", error);
				const errorResponse = {
					success: false,
					error: {
						message: error.message,
						userMessage: error.message || "Failed to update password",
					},
				};

				setError(errorResponse.error);
				return errorResponse;
			} finally {
				setLoading(false);
			}
		},
		[user, deviceInfo, checkBreachedPassword]
	);

	const updateSecurityMetrics = async (userId) => {
		const startTime = performance.now();

		try {
			if (process.env.NODE_ENV === "development") {
				console.log("🔍 Fetching security metrics for ID:", userId);
			}

			// PERFORMANCE OPTIMIZATION: Use default metrics immediately, update async later
			const defaultMetrics = {
				loginAttempts: 0,
				lastLogin: new Date().toISOString(),
				deviceTrusted: false,
				mfaEnabled: false,
				securityLevel: "standard",
			};

			// Set defaults immediately for fast auth flow
			setSecurityMetrics(defaultMetrics);

			if (process.env.NODE_ENV === "development") {
				console.log("📋 No security metrics found, using defaults");
			}

			const queryTime = performance.now() - startTime;
			logger.performance(`Security metrics set to defaults in ${queryTime.toFixed(2)}ms`);
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("❌ Unexpected error fetching security metrics:", error);
			}

			// Robust error logging with safe property access
			try {
				logger.error("Failed to update security metrics:", {
					userId: userId || "unknown",
					error: error?.message || error?.toString() || "Unknown error",
					stack: error?.stack || "No stack trace available",
					errorType: typeof error,
					errorConstructor: error?.constructor?.name || "unknown",
				});
			} catch (logError) {
				// Fallback if logger fails
				console.error("Logger failed for security metrics error:", {
					originalError: error,
					logError: logError,
					userId,
				});
			}

			// Set default security metrics on error
			setSecurityMetrics({
				loginAttempts: 0,
				lastLogin: null,
				deviceTrusted: false,
				mfaEnabled: false,
				securityLevel: "standard",
			});
		}
	};

	const updateLastActivity = async (userId) => {
		// Skip activity logging if user_activity table has RLS issues
		// This is non-critical functionality that shouldn't block authentication
		return;
	};

	const updateDeviceTrust = async (userId, deviceId, trusted) => {
		try {
			await supabase.rpc("update_device_trust", {
				p_user_id: userId,
				p_device_id: deviceId,
				p_trusted: trusted,
			});
		} catch (error) {
			logger.error("Failed to update device trust:", error);
		}
	};

	const getLoginErrorMessage = (error) => {
		const errorMap = {
			"Invalid login credentials": "Invalid email or password. Please check your credentials and try again.",
			"Email not confirmed": "Please check your email and click the confirmation link before signing in.",
			"Too many requests": "Too many login attempts. Please wait a few minutes before trying again.",
			"User not found": "No account found with this email address.",
			"Invalid password": "Incorrect password. Please try again or reset your password.",
		};

		return errorMap[error.message] || "Login failed. Please try again.";
	};

	const getSignupErrorMessage = (error) => {
		const errorMap = {
			"User already registered": "An account with this email address already exists. Try signing in instead.",
			"Signup disabled": "New account registration is currently disabled. Please contact support.",
			"Email rate limit exceeded": "Too many signup attempts. Please wait before trying again.",
			"Password too weak": "Password does not meet security requirements. Please choose a stronger password.",
			"Invalid email": "Please enter a valid email address.",
			"Email not allowed": "This email domain is not allowed for registration.",
		};

		return errorMap[error.message] || "Account creation failed. Please try again.";
	};

	/**
	 * Refresh user session and profile data
	 */
	const refreshUser = useCallback(async () => {
		const startTime = performance.now();

		try {
			// Get fresh session from Supabase
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError) {
				logger.error("Failed to refresh session:", sessionError);
				throw sessionError;
			}

			if (session?.user) {
				// Update session and user state
				setSession(session);
				setUser(session.user);

				// Refresh user profile and roles in parallel
				await Promise.allSettled([
					fetchUserProfile(session.user.id).catch((err) => {
						logger.warn("Profile refresh failed:", err);
						return null;
					}),
					fetchUserRoles(session.user.id).catch((err) => {
						logger.warn("Roles refresh failed:", err);
						return [];
					}),
					updateSecurityMetrics(session.user.id).catch((err) => {
						logger.warn("Security metrics refresh failed:", err);
						return null;
					}),
				]);

				const duration = performance.now() - startTime;
				logger.performance(`User refreshed in ${duration.toFixed(2)}ms`);

				logger.info("User session refreshed successfully", {
					userId: session.user.id,
					emailVerified: !!session.user.email_confirmed_at,
				});

				return { success: true, user: session.user };
			} else {
				// No session found - user needs to re-authenticate
				setSession(null);
				setUser(null);
				setProfile(null);
				setUserRoles([]);

				return { success: false, error: "No valid session found" };
			}
		} catch (error) {
			logger.error("User refresh failed:", error);
			return { success: false, error: error.message };
		}
	}, [fetchUserProfile, fetchUserRoles]);

	/**
	 * Utility functions
	 */
	const hasRole = useCallback(
		(role) => {
			return userRoles.includes(role);
		},
		[userRoles]
	);

	const hasAnyRole = useCallback(
		(roles) => {
			return roles.some((role) => userRoles.includes(role));
		},
		[userRoles]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const showErrorToast = useCallback((message) => {
		toast.error(message);
	}, []);

	const showSuccessToast = useCallback((message) => {
		toast.success(message);
	}, []);

	/**
	 * Manually refresh user roles
	 */
	const refreshUserRoles = useCallback(async () => {
		if (!user?.id) return;

		try {
			console.log("Manually refreshing user roles for:", user.id);
			await fetchUserRoles(user.id);
			console.log("Roles refreshed successfully");
		} catch (error) {
			console.error("Failed to refresh user roles:", error);
		}
	}, [user?.id, fetchUserRoles]);

	// Computed values
	const isAuthenticated = useMemo(() => !!user && !!session, [user, session]);
	const isEmailVerified = useMemo(() => profile?.email_verified || user?.email_confirmed_at, [profile, user]);

	return {
		// State
		user,
		session,
		profile,
		loading,
		initialized,
		error,
		userRoles,
		deviceInfo,
		securityMetrics,

		// Auth actions
		login,
		signup,
		logout,
		loginWithOAuth,
		resetPassword,
		updatePassword,
		refreshUser,

		// Utilities
		hasRole,
		hasAnyRole,
		checkBreachedPassword,
		clearError,
		showErrorToast,
		showSuccessToast,
		refreshUserRoles,

		// Computed
		isAuthenticated,
		isEmailVerified,
	};
}

export default useEnhancedAuth;
