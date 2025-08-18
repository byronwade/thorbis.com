// FIXED: Resilient Authentication Middleware
// Prevents redirect loops by handling missing user profiles gracefully

import { NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "../supabase/ssr";
import { RoleManager, ROUTE_PERMISSIONS } from "./roles";
import { logger } from "../utils/logger";

/**
 * Enhanced authentication middleware that handles missing user profiles
 * This prevents redirect loops when auth.users exists but public.users doesn't
 */
export async function createAuthMiddleware(request) {
	const startTime = performance.now();
	const url = request.nextUrl.clone();
	const pathname = url.pathname;

	try {
		// Create Supabase client for middleware
		const { client: supabase } = createSupabaseMiddlewareClient(request);

		// Get session
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			logger.error("Session error in auth middleware:", sessionError);
		}

		// Create response with security headers
		let response = NextResponse.next();

		// Add comprehensive security headers
		addSecurityHeaders(response);

		// Check if route needs protection
		const routeConfig = getRouteConfig(pathname);

		if (routeConfig.isProtected) {
			// No session and route is protected
			if (!session) {
				logger.security({
					action: "unauthorized_route_access",
					route: pathname,
					reason: "no_session",
					ip: request.ip,
					userAgent: request.headers.get("user-agent"),
					timestamp: Date.now(),
				});

				return redirectToLogin(url, pathname);
			}

			// FIXED: Try to get user data, create if missing (prevents redirect loop)
			let userData = null;
			let userRoles = [];

			try {
				// First, try to get existing user data
				const { data: existingUser, error: userError } = await supabase
					.from("users")
					.select(
						`
					id,
					email,
					name,
					email_verified,
					phone_verified,
					user_roles (
						role
					)
				`
					)
					.eq("id", session.user.id)
					.single();

				if (userError && userError.code === "PGRST116") {
					// User doesn't exist in public.users - CREATE IT automatically
					logger.warn("User profile missing, creating automatically:", {
						userId: session.user.id,
						email: session.user.email,
						route: pathname,
					});

					// Create user profile from auth data
					const newUserData = {
						id: session.user.id,
						email: session.user.email,
						name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0],
						avatar_url: session.user.user_metadata?.avatar_url,
						email_verified: !!session.user.email_confirmed_at,
						phone_verified: !!session.user.phone_confirmed_at,
						phone: session.user.phone,
						role: "user",
						created_at: session.user.created_at,
						updated_at: new Date().toISOString(),
					};

					// Insert user profile
					const { error: insertError } = await supabase.from("users").insert(newUserData);

					if (insertError) {
						logger.error("Failed to create user profile:", insertError);
						// Continue anyway with basic auth - don't break the flow
						userData = {
							id: session.user.id,
							email: session.user.email,
							name: session.user.email.split("@")[0],
							email_verified: !!session.user.email_confirmed_at,
							phone_verified: !!session.user.phone_confirmed_at,
							user_roles: [],
						};
						userRoles = ["user"]; // Default role
					} else {
						// Create default user role
						await supabase
							.from("user_roles")
							.insert({
								user_id: session.user.id,
								role: "user",
							})
							.onConflict("user_id,role")
							.ignore();

						userData = {
							...newUserData,
							user_roles: [{ role: "user" }],
						};
						userRoles = ["user"];

						logger.info("Auto-created user profile:", {
							userId: session.user.id,
							email: session.user.email,
						});
					}
				} else if (userError) {
					// Other database error - log and allow with basic auth
					logger.error("Database error fetching user:", userError);
					userData = {
						id: session.user.id,
						email: session.user.email,
						name: session.user.email.split("@")[0],
						email_verified: !!session.user.email_confirmed_at,
						phone_verified: !!session.user.phone_confirmed_at,
						user_roles: [],
					};
					userRoles = ["user"];
				} else {
					// User exists - use the data
					userData = existingUser;
					userRoles = userData.user_roles?.map((ur) => ur.role) || ["user"];
				}
			} catch (dbError) {
				logger.error("Critical database error in middleware:", dbError);
				// GRACEFUL DEGRADATION: Continue with session-only auth
				userData = {
					id: session.user.id,
					email: session.user.email,
					name: session.user.email.split("@")[0],
					email_verified: !!session.user.email_confirmed_at,
					phone_verified: !!session.user.phone_confirmed_at,
					user_roles: [],
				};
				userRoles = ["user"];
			}

			// Continue with permission checks only if we have strict requirements
			if (routeConfig.requiredPermissions.length > 0) {
				const hasPermission = RoleManager.hasAnyPermission(userRoles, routeConfig.requiredPermissions);

				if (!hasPermission) {
					logger.security({
						action: "insufficient_permissions",
						userId: session.user.id,
						route: pathname,
						userRoles,
						requiredPermissions: routeConfig.requiredPermissions,
						ip: request.ip,
						timestamp: Date.now(),
					});

					return redirectToUnauthorized(url);
				}
			}

			// Check required roles with graceful fallback
			if (routeConfig.requiredRoles.length > 0) {
				const hasRole = RoleManager.hasAnyRole(userRoles, routeConfig.requiredRoles);

				if (!hasRole) {
					// For dashboard routes, be more lenient - allow basic user access
					if (pathname.startsWith("/dashboard/user")) {
						// Allow basic user dashboard access
						logger.info("Allowing basic dashboard access:", {
							userId: session.user.id,
							route: pathname,
							userRoles,
						});
					} else {
						logger.security({
							action: "insufficient_role",
							userId: session.user.id,
							route: pathname,
							userRoles,
							requiredRoles: routeConfig.requiredRoles,
							ip: request.ip,
							timestamp: Date.now(),
						});

						return redirectToUnauthorized(url);
					}
				}
			}

			// Email verification check with grace period for new users
			if (routeConfig.requireEmailVerification && !userData.email_verified) {
				// Give new users a grace period
				const userAge = Date.now() - new Date(session.user.created_at).getTime();
				const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours

				if (userAge > gracePeriod) {
					logger.security({
						action: "email_verification_required",
						userId: session.user.id,
						route: pathname,
						ip: request.ip,
						timestamp: Date.now(),
					});

					url.pathname = "/verify-email";
					url.searchParams.set("redirect", pathname);
					return NextResponse.redirect(url);
				}
			}

			// Add user info to response headers for client-side access
			response.headers.set("X-User-ID", session.user.id);
			response.headers.set("X-User-Roles", JSON.stringify(userRoles));
			response.headers.set("X-User-Level", RoleManager.getHighestRoleLevel(userRoles).toString());

			// Log successful access
			logger.info("Protected route access granted", {
				userId: session.user.id,
				route: pathname,
				userRoles,
				ip: request.ip,
			});
		}

		// Handle authentication redirects for public routes
		if (session && isAuthRoute(pathname)) {
			// User is authenticated but trying to access auth pages
			const redirectTo = url.searchParams.get("redirect") || getDefaultDashboard(session);
			url.pathname = redirectTo;
			url.search = "";
			return NextResponse.redirect(url);
		}

		const duration = performance.now() - startTime;
		logger.performance(`Auth middleware completed in ${duration.toFixed(2)}ms`);

		return response;
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error(`Auth middleware failed in ${duration.toFixed(2)}ms:`, error);

		// GRACEFUL FAILURE: For protected routes, try to redirect to login
		// For other routes, allow through
		const routeConfig = getRouteConfig(pathname);
		if (routeConfig.isProtected) {
			return redirectToLogin(url, pathname);
		}

		return NextResponse.next();
	}
}

/**
 * Get appropriate dashboard based on user session
 */
function getDefaultDashboard(session) {
	// Default to user dashboard - can be enhanced based on user metadata
	return "/dashboard/user";
}

/**
 * Get route configuration based on pathname
 */
function getRouteConfig(pathname) {
	// Default configuration
	const config = {
		isProtected: false,
		requiredPermissions: [],
		requiredRoles: [],
		requireEmailVerification: false,
		requirePhoneVerification: false,
		minRoleLevel: 0,
	};

	// Check for exact matches first
	if (ROUTE_PERMISSIONS[pathname]) {
		config.isProtected = true;
		config.requiredPermissions = ROUTE_PERMISSIONS[pathname];
		return config;
	}

	// Check for pattern matches
	for (const [routePattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
		if (matchesRoutePattern(pathname, routePattern)) {
			config.isProtected = true;
			config.requiredPermissions = permissions;
			break;
		}
	}

	// Special route configurations with more lenient rules
	if (pathname.startsWith("/dashboard")) {
		config.isProtected = true;
		// Make email verification less strict for basic dashboard access
		config.requireEmailVerification = false; // Changed from true

		// Admin dashboard requires higher permissions
		if (pathname.startsWith("/dashboard/admin")) {
			config.requiredRoles = ["admin", "super_admin"];
			config.requireEmailVerification = true; // Strict for admin
			config.minRoleLevel = 4;
		}
		// Business dashboard - allow basic users with business intent
		else if (pathname.startsWith("/dashboard/business")) {
			config.requiredRoles = []; // More lenient - remove strict role requirement
			config.minRoleLevel = 1;
		}
		// LocalHub dashboard
		else if (pathname.startsWith("/dashboard/localhub")) {
			config.requiredRoles = []; // More lenient initially
			config.minRoleLevel = 2;
		}
		// User dashboard - very permissive
		else if (pathname.startsWith("/dashboard/user")) {
			config.requiredRoles = []; // No specific role required
			config.minRoleLevel = 0;
		}
	}

	// Admin routes - keep strict
	if (pathname.startsWith("/admin")) {
		config.isProtected = true;
		config.requiredRoles = ["admin", "super_admin"];
		config.requireEmailVerification = true;
		config.minRoleLevel = 4;
	}

	return config;
}

/**
 * Check if pathname matches route pattern
 */
function matchesRoutePattern(pathname, pattern) {
	// Convert pattern with wildcards to regex
	const regexPattern = pattern
		.replace(/\*/g, "[^/]+") // * matches any segment
		.replace(/\?\*/g, ".*") // ?* matches any path
		.replace(/\//g, "\\/"); // Escape slashes

	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(pathname);
}

/**
 * Check if route is an authentication route
 */
function isAuthRoute(pathname) {
	const authRoutes = ["/login", "/signup", "/password-reset", "/verify-email", "/verify-phone", "/otp"];

	return authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Redirect to login with return URL
 */
function redirectToLogin(url, returnPath) {
	url.pathname = "/login";
	url.search = `?redirect=${encodeURIComponent(returnPath)}`;
	return NextResponse.redirect(url);
}

/**
 * Redirect to unauthorized page
 */
function redirectToUnauthorized(url) {
	url.pathname = "/unauthorized";
	url.search = "";
	return NextResponse.redirect(url);
}

/**
 * Add comprehensive security headers
 */
function addSecurityHeaders(response) {
	// Content Security Policy with Vercel Analytics and Mapbox Maps support
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://vercel.live https://*.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://va.vercel-scripts.com https://api.mapbox.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https: blob: https://*.tiles.mapbox.com https://api.mapbox.com",
		"connect-src 'self' https://*.supabase.co https://api.resend.com https://api.pwnedpasswords.com https://va.vercel-scripts.com https://vercel.live https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com",
		"media-src 'self' https:",
		"worker-src 'self' blob: https://api.mapbox.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests",
	].join("; ");

	// Security headers
	response.headers.set("Content-Security-Policy", csp);
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()");

	// HTTPS enforcement in production
	if (process.env.NODE_ENV === "production") {
		response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
	}

	// Custom security headers
	response.headers.set("X-DNS-Prefetch-Control", "off");
	response.headers.set("X-Download-Options", "noopen");
	response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
}

export default createAuthMiddleware;
