/**
 * Advanced API Middleware for V2 Endpoints
 * Implements authentication, rate limiting, caching, and security
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { logger } from "@utils/logger";
import { CacheManager } from "@utils/cache-manager";
import { dashboardDemoAdminFlag, dashboardDemoBusinessFlag, dashboardDemoLocalhubFlag } from "@/lib/flags/definitions";

export interface ApiRequest extends NextRequest {
	user?: {
		id: string;
		email: string;
		role: string;
		permissions: string[];
	};
	rateLimit?: {
		remaining: number;
		reset: number;
	};
	demoMode?: boolean;
}

export interface ApiResponse {
	success: boolean;
	data?: any;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
	meta?: {
		pagination?: {
			page: number;
			limit: number;
			total: number;
			pages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
		performance?: {
			queryTime: number;
			cacheHit: boolean;
		};
		rateLimit?: {
			remaining: number;
			reset: number;
		};
	};
	timestamp: string;
}

/**
 * Enhanced authentication middleware with role-based access control
 */
export function withAuth(
	handler: (req: ApiRequest) => Promise<NextResponse>,
	options: {
		requiredRoles?: string[];
		requireEmailVerification?: boolean;
		allowApiKey?: boolean;
	} = {}
) {
	return async (req: NextRequest): Promise<NextResponse> => {
		const startTime = performance.now();

		try {
			// Demo-mode bypass: allow unauthenticated access if a dashboard demo flag is enabled for the target endpoint
			const pathname = req.nextUrl.pathname;
			const [demoBiz, demoLocalhub, demoAdmin] = await Promise.all([dashboardDemoBusinessFlag.decide(), dashboardDemoLocalhubFlag.decide(), dashboardDemoAdminFlag.decide()]);

			const isDashboardDemo = (demoBiz && pathname.startsWith("/api/v2/dashboard/business")) || (demoLocalhub && pathname.startsWith("/api/v2/dashboard/localhub")) || (demoAdmin && pathname.startsWith("/api/v2/dashboard/admin"));

			if (isDashboardDemo) {
				// Tag request as demo; skip auth and rate limiting, still proceed to handler
				(req as ApiRequest).demoMode = true;
				return handler(req as ApiRequest);
			}
			// Create Supabase client
			const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
				cookies: {
					get(name: string) {
						return req.cookies.get(name)?.value;
					},
				},
			});

			// Check for API key authentication if allowed
			if (options.allowApiKey) {
				const apiKey = req.headers.get("X-API-Key");
				if (apiKey) {
					const { data: keyData } = await supabase.from("api_keys").select("user_id, permissions, rate_limit").eq("key", apiKey).eq("active", true).single();

					if (keyData) {
						const { data: userData } = await supabase.from("user_profiles").select("id, email, role").eq("id", keyData.user_id).single();

						if (userData) {
							(req as ApiRequest).user = {
								id: userData.id,
								email: userData.email,
								role: userData.role,
								permissions: keyData.permissions || [],
							};

							// Apply API key rate limiting
							const rateLimitResult = await applyRateLimit(req, `apikey:${keyData.user_id}`, keyData.rate_limit);
							if (!rateLimitResult.success) {
								return createErrorResponse("RATE_LIMIT_EXCEEDED", "API rate limit exceeded", {
									retryAfter: rateLimitResult.retryAfter,
								});
							}

							(req as ApiRequest).rateLimit = rateLimitResult.rateLimit;
						}
					}
				}
			}

			// JWT authentication if no API key or API key auth failed
			if (!(req as ApiRequest).user) {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error || !session) {
					return createErrorResponse("UNAUTHORIZED", "Authentication required");
				}

				// Verify email if required
				if (options.requireEmailVerification && !session.user.email_confirmed_at) {
					return createErrorResponse("EMAIL_NOT_VERIFIED", "Email verification required");
				}

				// Get user profile with role and permissions
				const { data: userProfile } = await supabase.from("user_profiles").select("id, email, role, permissions").eq("id", session.user.id).single();

				if (!userProfile) {
					return createErrorResponse("USER_NOT_FOUND", "User profile not found");
				}

				(req as ApiRequest).user = {
					id: userProfile.id,
					email: userProfile.email,
					role: userProfile.role || "user",
					permissions: userProfile.permissions || [],
				};

				// Apply user rate limiting
				const rateLimitResult = await applyRateLimit(req, `user:${userProfile.id}`);
				if (!rateLimitResult.success) {
					return createErrorResponse("RATE_LIMIT_EXCEEDED", "Rate limit exceeded", {
						retryAfter: rateLimitResult.retryAfter,
					});
				}

				(req as ApiRequest).rateLimit = rateLimitResult.rateLimit;
			}

			// Check role requirements
			if (options.requiredRoles?.length) {
				const userRole = (req as ApiRequest).user!.role;
				const hasRequiredRole = options.requiredRoles.includes(userRole);
				const hasPermission = options.requiredRoles.some((role) => (req as ApiRequest).user!.permissions.includes(role));

				if (!hasRequiredRole && !hasPermission) {
					return createErrorResponse("FORBIDDEN", "Insufficient permissions", {
						requiredRoles: options.requiredRoles,
						userRole: userRole,
					});
				}
			}

			// Log authentication success
			logger.security({
				action: "api_auth_success",
				userId: (req as ApiRequest).user!.id,
				endpoint: req.nextUrl.pathname,
				method: req.method,
				userAgent: req.headers.get("user-agent"),
				ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
				timestamp: Date.now(),
			});

			// Call the handler
			const response = await handler(req as ApiRequest);

			// Add performance and rate limit headers
			const authTime = performance.now() - startTime;
			response.headers.set("X-Auth-Time", `${authTime.toFixed(2)}ms`);

			if ((req as ApiRequest).rateLimit) {
				response.headers.set("X-RateLimit-Remaining", (req as ApiRequest).rateLimit!.remaining.toString());
				response.headers.set("X-RateLimit-Reset", (req as ApiRequest).rateLimit!.reset.toString());
			}

			return response;
		} catch (error) {
			logger.error("Authentication middleware error:", error);
			return createErrorResponse("INTERNAL_ERROR", "Authentication failed");
		}
	};
}

/**
 * Rate limiting implementation with Redis-like in-memory storage
 */
async function applyRateLimit(
	req: NextRequest,
	key: string,
	customLimit?: { requests: number; windowMs: number }
): Promise<{
	success: boolean;
	rateLimit: { remaining: number; reset: number };
	retryAfter?: number;
}> {
	const defaultLimit = { requests: 1000, windowMs: 60 * 60 * 1000 }; // 1000 requests per hour
	const limit = customLimit || defaultLimit;

	const now = Date.now();
	const windowStart = Math.floor(now / limit.windowMs) * limit.windowMs;
	const rateLimitKey = `ratelimit:${key}:${windowStart}`;

	// Get current count from cache
	const current = CacheManager.memory.get(rateLimitKey) || 0;
	const remaining = Math.max(0, limit.requests - current - 1);
	const reset = windowStart + limit.windowMs;

	if (current >= limit.requests) {
		return {
			success: false,
			rateLimit: { remaining: 0, reset },
			retryAfter: Math.ceil((reset - now) / 1000),
		};
	}

	// Increment counter
	CacheManager.memory.set(rateLimitKey, current + 1, limit.windowMs);

	return {
		success: true,
		rateLimit: { remaining, reset },
	};
}

/**
 * Caching middleware for GET requests
 */
export function withCache(
	handler: (req: ApiRequest) => Promise<NextResponse>,
	options: {
		ttl?: number; // seconds
		keyGenerator?: (req: ApiRequest) => string;
		skipCache?: (req: ApiRequest) => boolean;
	} = {}
) {
	return async (req: ApiRequest): Promise<NextResponse> => {
		if (req.method !== "GET") {
			return handler(req);
		}

		const ttl = (options.ttl || 300) * 1000; // Convert to milliseconds
		const skipCache = options.skipCache?.(req) || false;

		if (skipCache) {
			return handler(req);
		}

		// Generate cache key
		let cacheKey = options.keyGenerator?.(req) || `api:${req.nextUrl.pathname}:${req.nextUrl.search}:${req.user?.id || "anonymous"}`;

		// Ensure demo mode responses don't collide with real ones
		try {
			const path = req.nextUrl.pathname;
			const [demoBiz, demoLocalhub, demoAdmin] = await Promise.all([dashboardDemoBusinessFlag.decide(), dashboardDemoLocalhubFlag.decide(), dashboardDemoAdminFlag.decide()]);
			if ((demoBiz && path.startsWith("/api/v2/dashboard/business")) || (demoLocalhub && path.startsWith("/api/v2/dashboard/localhub")) || (demoAdmin && path.startsWith("/api/v2/dashboard/admin"))) {
				cacheKey = `${cacheKey}:demo`;
			}
		} catch (_) {}

		// Check cache first
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			logger.performance(`Cache hit for: ${cacheKey}`);

			const response = NextResponse.json(cached);
			response.headers.set("X-Cache", "HIT");
			response.headers.set("X-Cache-Key", cacheKey);
			return response;
		}

		// Execute handler
		const response = await handler(req);

		// Cache successful responses
		if (response.status === 200) {
			const responseData = await response.clone().json();
			CacheManager.memory.set(cacheKey, responseData, ttl);

			response.headers.set("X-Cache", "MISS");
			response.headers.set("X-Cache-Key", cacheKey);
			response.headers.set("X-Cache-TTL", ttl.toString());
		}

		return response;
	};
}

/**
 * Request validation middleware
 */
export function withValidation<T>(
	handler: (req: ApiRequest, validatedData: T) => Promise<NextResponse>,
	schema: any // Zod schema or custom validator
) {
	return async (req: ApiRequest): Promise<NextResponse> => {
		try {
			let data: any;

			if (req.method === "GET") {
				// Validate query parameters
				const searchParams = Object.fromEntries(req.nextUrl.searchParams);
				data = schema.parse(searchParams);
			} else {
				// Validate request body
				const body = await req.json();
				data = schema.parse(body);
			}

			return handler(req, data);
		} catch (error: any) {
			if (error.errors) {
				// Zod validation error
				return createErrorResponse("VALIDATION_ERROR", "Invalid request data", {
					errors: error.errors,
				});
			}

			logger.error("Validation error:", error);
			return createErrorResponse("VALIDATION_ERROR", "Request validation failed");
		}
	};
}

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring(handler: (req: ApiRequest) => Promise<NextResponse>) {
	return async (req: ApiRequest): Promise<NextResponse> => {
		const startTime = performance.now();
		const endpoint = `${req.method} ${req.nextUrl.pathname}`;

		try {
			const response = await handler(req);
			const duration = performance.now() - startTime;

			// Log performance metrics
			logger.performance({
				endpoint,
				duration: `${duration.toFixed(2)}ms`,
				status: response.status,
				userId: req.user?.id,
				cacheHit: response.headers.get("X-Cache") === "HIT",
				timestamp: Date.now(),
			});

			// Add performance headers
			response.headers.set("X-Response-Time", `${duration.toFixed(2)}ms`);
			response.headers.set("X-Timestamp", new Date().toISOString());

			// Alert on slow requests
			if (duration > 2000) {
				logger.warn(`Slow API request: ${endpoint} took ${duration.toFixed(2)}ms`);
			}

			return response;
		} catch (error) {
			const duration = performance.now() - startTime;

			logger.error({
				endpoint,
				duration: `${duration.toFixed(2)}ms`,
				error: error instanceof Error ? error.message : "Unknown error",
				userId: req.user?.id,
				timestamp: Date.now(),
			});

			throw error;
		}
	};
}

/**
 * Standardized error response creator
 */
export function createErrorResponse(code: string, message: string, details?: any, status: number = 400): NextResponse {
	const response: ApiResponse = {
		success: false,
		error: {
			code,
			message,
			details,
		},
		timestamp: new Date().toISOString(),
	};

	return NextResponse.json(response, { status });
}

/**
 * Standardized success response creator
 */
export function createSuccessResponse(data: any, meta?: ApiResponse["meta"], status: number = 200): NextResponse {
	const response: ApiResponse = {
		success: true,
		data,
		meta,
		timestamp: new Date().toISOString(),
	};

	return NextResponse.json(response, { status });
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
	return (handler: any) => {
		return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
	};
}
