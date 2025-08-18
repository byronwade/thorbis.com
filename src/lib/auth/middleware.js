// REQUIRED: Advanced Authentication Middleware
// Implements comprehensive route protection with role-based access control

import { NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "../supabase/ssr";
import { RoleManager, ROUTE_PERMISSIONS } from "./roles";
import { logger } from "../utils/logger";

/**
 * Advanced authentication middleware with role-based access control
 * Provides comprehensive route protection and security headers
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

			// Get user data with roles
			const { data: userData, error: userError } = await supabase
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

			if (userError || !userData) {
				logger.error("Failed to fetch user data in middleware:", userError);
				return redirectToLogin(url, pathname);
			}

			// Extract roles
			const userRoles = userData.user_roles?.map((ur) => ur.role) || [];

			// Check route permissions
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

			// Check required roles
			if (routeConfig.requiredRoles.length > 0) {
				const hasRole = RoleManager.hasAnyRole(userRoles, routeConfig.requiredRoles);

				if (!hasRole) {
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

			// Check email verification if required
			if (routeConfig.requireEmailVerification && !userData.email_verified) {
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

			// Check phone verification if required
			if (routeConfig.requirePhoneVerification && !userData.phone_verified) {
				logger.security({
					action: "phone_verification_required",
					userId: session.user.id,
					route: pathname,
					ip: request.ip,
					timestamp: Date.now(),
				});

				url.pathname = "/verify-phone";
				url.searchParams.set("redirect", pathname);
				return NextResponse.redirect(url);
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
			const redirectTo = url.searchParams.get("redirect") || "/dashboard";
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

		// Fail securely - redirect to login for protected routes
		const routeConfig = getRouteConfig(pathname);
		if (routeConfig.isProtected) {
			return redirectToLogin(url, pathname);
		}

		return NextResponse.next();
	}
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

	// Special route configurations
	if (pathname.startsWith("/dashboard")) {
		config.isProtected = true;
		config.requireEmailVerification = true;

		// Admin dashboard requires higher permissions
		if (pathname.startsWith("/dashboard/admin")) {
			config.requiredRoles = ["admin", "super_admin"];
			config.minRoleLevel = 4;
		}
		// Business dashboard
		else if (pathname.startsWith("/dashboard/business")) {
			config.requiredRoles = ["business_owner", "admin", "super_admin"];
			config.minRoleLevel = 2;
		}
		// LocalHub dashboard
		else if (pathname.startsWith("/dashboard/localhub")) {
			config.requiredRoles = ["moderator", "admin", "super_admin"];
			config.minRoleLevel = 3;
		}
	}

	// Admin routes
	if (pathname.startsWith("/admin")) {
		config.isProtected = true;
		config.requiredRoles = ["admin", "super_admin"];
		config.requireEmailVerification = true;
		config.minRoleLevel = 4;
	}

	// Business management routes
	if (pathname.includes("/business/") && (pathname.includes("/edit") || pathname.includes("/manage"))) {
		config.isProtected = true;
		config.requiredPermissions = ["business.manage", "business.update"];
	}

	// Claim routes
	if (pathname.includes("/claim")) {
		config.isProtected = true;
		config.requireEmailVerification = true;
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
 * Add comprehensive security headers with enhanced protection
 */
function addSecurityHeaders(response) {
	// Enhanced Content Security Policy with Vercel Analytics, Mapbox Maps, and Google Maps support
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://vercel.live https://*.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://api.mapbox.com https://maps.googleapis.com",
		"script-src-elem 'self' 'unsafe-inline' https://vercel.live https://*.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://api.mapbox.com https://maps.googleapis.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://challenges.cloudflare.com https://api.mapbox.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https: blob: https://*.tiles.mapbox.com https://api.mapbox.com https://maps.googleapis.com https://maps.gstatic.com",
		"connect-src 'self' https://*.supabase.co https://api.resend.com https://haveibeenpwned.com https://api.pwnedpasswords.com https://va.vercel-scripts.com https://vercel.live https://*.vercel-scripts.com https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://maps.googleapis.com https://maps.gstatic.com",
		"media-src 'self' https:",
		"worker-src 'self' blob: https://api.mapbox.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"frame-src https://challenges.cloudflare.com",
		"upgrade-insecure-requests",
	].join("; ");

	// Core security headers
	response.headers.set("Content-Security-Policy", csp);
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()");

	// HTTPS enforcement in production
	if (process.env.NODE_ENV === "production") {
		response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
	}

	// Enhanced security headers
	response.headers.set("X-DNS-Prefetch-Control", "off");
	response.headers.set("X-Download-Options", "noopen");
	response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
	response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
	response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
	response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

	// Anti-fingerprinting headers
	response.headers.set("Sec-CH-UA", '"Not_A Brand";v="8", "Chromium";v="120"');
	response.headers.set("Sec-CH-UA-Mobile", "?0");
	response.headers.set("Sec-CH-UA-Platform", '"Unknown"');

	// Rate limiting headers for transparency
	response.headers.set("X-RateLimit-Limit", "100");
	response.headers.set("X-RateLimit-Remaining", "99");
	response.headers.set("X-RateLimit-Reset", Math.ceil(Date.now() / 1000 + 900).toString());
}

/**
 * Enhanced rate limiting middleware with progressive penalties
 */
export function createRateLimitMiddleware(options = {}) {
	const { maxRequests = 100, windowMs = 15 * 60 * 1000, skipSuccessfulRequests = true, progressivePenalties = true } = options;

	// In-memory stores (use Redis in production)
	const requestCounts = new Map();
	const suspiciousIPs = new Map();
	const blockedIPs = new Set();

	return function rateLimitMiddleware(request) {
		const ip = request.ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
		const userAgent = request.headers.get("user-agent") || "";
		const path = request.nextUrl.pathname;
		const now = Date.now();
		const windowStart = Math.floor(now / windowMs) * windowMs;
		const key = `${ip}_${windowStart}`;

		// Check if IP is blocked
		if (blockedIPs.has(ip)) {
			logger.security({
				action: "blocked_ip_access_attempt",
				ip,
				userAgent,
				path,
				timestamp: now,
			});

			return new NextResponse(
				JSON.stringify({
					error: "Access Denied",
					message: "Your IP has been temporarily blocked due to suspicious activity.",
					code: "IP_BLOCKED",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
						"X-Rate-Limit-Blocked": "true",
						"Retry-After": "3600",
					},
				}
			);
		}

		// Clean old entries
		for (const [oldKey] of requestCounts) {
			const [, timestamp] = oldKey.split("_");
			if (parseInt(timestamp) < now - windowMs) {
				requestCounts.delete(oldKey);
			}
		}

		// Clean old suspicious IPs
		for (const [suspiciousIP, data] of suspiciousIPs) {
			if (now - data.firstSeen > 24 * 60 * 60 * 1000) {
				// 24 hours
				suspiciousIPs.delete(suspiciousIP);
			}
		}

		// Get current count
		const currentCount = requestCounts.get(key) || 0;
		const suspiciousData = suspiciousIPs.get(ip);

		// Determine rate limit based on IP history
		let effectiveLimit = maxRequests;
		if (suspiciousData) {
			effectiveLimit = Math.max(maxRequests * 0.5, 10); // Reduce limit for suspicious IPs
		}

		// Check for suspicious patterns
		const isSuspicious = userAgent === "" || userAgent.includes("bot") || userAgent.includes("crawler") || userAgent.includes("spider") || path.includes("/admin") || path.includes("/.env") || path.includes("/wp-admin");

		if (isSuspicious && !suspiciousData) {
			suspiciousIPs.set(ip, {
				firstSeen: now,
				suspiciousRequests: 1,
				userAgents: new Set([userAgent]),
				paths: new Set([path]),
			});
		} else if (isSuspicious && suspiciousData) {
			suspiciousData.suspiciousRequests++;
			suspiciousData.userAgents.add(userAgent);
			suspiciousData.paths.add(path);

			// Block IP if too many suspicious requests
			if (suspiciousData.suspiciousRequests > 20) {
				blockedIPs.add(ip);
				logger.security({
					action: "ip_auto_blocked",
					ip,
					suspiciousRequests: suspiciousData.suspiciousRequests,
					userAgents: Array.from(suspiciousData.userAgents),
					paths: Array.from(suspiciousData.paths),
					timestamp: now,
				});

				// Auto-unblock after 1 hour
				setTimeout(
					() => {
						blockedIPs.delete(ip);
						suspiciousIPs.delete(ip);
					},
					60 * 60 * 1000
				);
			}
		}

		// Check rate limit
		if (currentCount >= effectiveLimit) {
			logger.security({
				action: "rate_limit_exceeded",
				ip,
				currentCount,
				maxRequests: effectiveLimit,
				windowMs,
				userAgent,
				path,
				isSuspicious,
				timestamp: now,
			});

			// Add to suspicious IPs if not already tracked
			if (!suspiciousIPs.has(ip)) {
				suspiciousIPs.set(ip, {
					firstSeen: now,
					suspiciousRequests: 1,
					userAgents: new Set([userAgent]),
					paths: new Set([path]),
				});
			}

			return new NextResponse(
				JSON.stringify({
					error: "Too many requests",
					message: "Rate limit exceeded. Please try again later.",
					code: "RATE_LIMIT_EXCEEDED",
					retryAfter: Math.ceil(windowMs / 1000),
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": Math.ceil(windowMs / 1000).toString(),
						"X-RateLimit-Limit": effectiveLimit.toString(),
						"X-RateLimit-Remaining": "0",
						"X-RateLimit-Reset": Math.ceil((windowStart + windowMs) / 1000).toString(),
						"X-Rate-Limit-Policy": suspiciousData ? "restricted" : "standard",
					},
				}
			);
		}

		// Increment count
		requestCounts.set(key, currentCount + 1);

		// Return success headers for monitoring
		return {
			headers: {
				"X-RateLimit-Limit": effectiveLimit.toString(),
				"X-RateLimit-Remaining": (effectiveLimit - currentCount - 1).toString(),
				"X-RateLimit-Reset": Math.ceil((windowStart + windowMs) / 1000).toString(),
				"X-Rate-Limit-Policy": suspiciousData ? "restricted" : "standard",
			},
		};
	};
}

/**
 * Enhanced CSRF protection middleware with token validation
 */
export function createCSRFMiddleware() {
	return function csrfMiddleware(request) {
		// Skip CSRF check for safe methods and auth callbacks
		const safeMethods = ["GET", "HEAD", "OPTIONS"];
		const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth/");
		const isPublicAPI = request.nextUrl.pathname.startsWith("/api/public/");

		if (safeMethods.includes(request.method) || isAuthRoute || isPublicAPI) {
			return null;
		}

		// Enhanced origin validation
		const origin = request.headers.get("origin");
		const referer = request.headers.get("referer");
		const host = request.headers.get("host");
		const userAgent = request.headers.get("user-agent") || "";

		// Check for CSRF token
		const csrfToken = request.headers.get("x-csrf-token") || request.headers.get("x-xsrf-token") || request.cookies.get("csrf-token")?.value || request.cookies.get("XSRF-TOKEN")?.value;

		// Validate origin/referer
		const hasValidOrigin = origin && (origin === request.nextUrl.origin || origin === `https://${host}`);
		const hasValidReferer = referer && (referer.startsWith(request.nextUrl.origin) || referer.startsWith(`https://${host}`));

		// Check for suspicious patterns
		const suspiciousPatterns = [
			userAgent.includes("curl"),
			userAgent.includes("wget"),
			userAgent.includes("python"),
			userAgent.includes("postman"),
			!origin && !referer, // Missing both origin and referer
			origin && origin.includes("localhost") && process.env.NODE_ENV === "production",
		];

		const isSuspicious = suspiciousPatterns.some((pattern) => pattern);

		// Require CSRF token for suspicious requests or when origin/referer validation fails
		if (!csrfToken && ((!hasValidOrigin && !hasValidReferer) || isSuspicious)) {
			logger.security({
				action: "csrf_protection_triggered",
				method: request.method,
				url: request.nextUrl.pathname,
				origin,
				referer,
				host,
				userAgent,
				isSuspicious,
				suspiciousReasons: suspiciousPatterns.map((pattern, index) => (pattern ? ["curl_detected", "wget_detected", "python_detected", "postman_detected", "missing_origin_referer", "localhost_in_production"][index] : null)).filter(Boolean),
				ip: request.ip,
				timestamp: Date.now(),
			});

			return new NextResponse(
				JSON.stringify({
					error: "Forbidden",
					message: "CSRF protection triggered. Missing or invalid security token.",
					code: "CSRF_TOKEN_REQUIRED",
					requiredHeaders: ["X-CSRF-Token", "Origin", "Referer"],
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
						"X-CSRF-Protection": "active",
						"X-Security-Warning": "CSRF token required",
					},
				}
			);
		}

		// Validate CSRF token if present
		if (csrfToken) {
			// Simple token validation (implement proper HMAC validation in production)
			const isValidToken = csrfToken.length >= 16 && /^[a-zA-Z0-9_-]+$/.test(csrfToken);

			if (!isValidToken) {
				logger.security({
					action: "invalid_csrf_token",
					method: request.method,
					url: request.nextUrl.pathname,
					tokenLength: csrfToken.length,
					ip: request.ip,
					timestamp: Date.now(),
				});

				return new NextResponse(
					JSON.stringify({
						error: "Forbidden",
						message: "Invalid CSRF token format",
						code: "INVALID_CSRF_TOKEN",
					}),
					{
						status: 403,
						headers: {
							"Content-Type": "application/json",
							"X-CSRF-Protection": "active",
						},
					}
				);
			}
		}

		return null; // Continue to next middleware
	};
}

export default createAuthMiddleware;
