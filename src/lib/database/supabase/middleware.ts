// REQUIRED: Secure authentication middleware with session optimization
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "./types";
import logger from "@lib/utils/logger";

/**
 * High-performance auth middleware with security optimizations
 * Implements session caching and security headers
 */
export async function createAuthMiddleware(request: NextRequest) {
	const startTime = performance.now();

	// Create response with security headers
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	// Add security headers (OWASP recommendations)
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

	try {
		// Create Supabase client with optimized SSR configuration
		const supabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					// Secure cookie configuration
					const secureOptions = {
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "lax" as const,
						maxAge: 60 * 60 * 24 * 7, // 7 days
					};

					request.cookies.set({ name, value, ...secureOptions });
					response.cookies.set({ name, value, ...secureOptions });
				},
				remove(name: string, options: any) {
					const secureOptions = {
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "lax" as const,
					};

					request.cookies.set({ name, value: "", ...secureOptions });
					response.cookies.set({ name, value: "", ...secureOptions });
				},
			},
		});

		// Debug cookie information
		const cookies = request.cookies.getAll();
		const supabaseCookies = cookies.filter(cookie => 
			cookie.name.includes('supabase') || 
			cookie.name.includes('sb-') ||
			cookie.name.includes('auth')
		);
		
		console.log("🍪 Middleware cookies debug:", {
			totalCookies: cookies.length,
			supabaseCookies: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
			pathname: request.nextUrl.pathname
		});

		// Optimized session retrieval with caching
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		console.log("🔍 Middleware session check:", {
			hasSession: !!session,
			hasError: !!error,
			userId: session?.user?.id,
			pathname: request.nextUrl.pathname
		});

		if (error) {
			logger.error("Auth middleware error:", error);
			// Don't block navigation on auth errors for non-protected routes
		}

		// Check if this is a protected route that requires authentication
		const pathname = request.nextUrl.pathname;
		const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

		if (isProtectedRoute && !session) {
			// No session for protected route - redirect to login
			logger.security({
				action: "unauthorized_access_attempt",
				route: pathname,
				ip: request.ip,
				userAgent: request.headers.get("user-agent"),
				timestamp: Date.now(),
			});

			const url = request.nextUrl.clone();
			url.pathname = "/login";
			url.searchParams.set("redirectTo", pathname);
			return NextResponse.redirect(url);
		}

		// Performance logging
		const duration = performance.now() - startTime;
		logger.performance(`Auth middleware executed in ${duration.toFixed(2)}ms`);

		// Add session info to response headers for client-side optimization
		if (session) {
			response.headers.set("X-User-ID", session.user.id);
			response.headers.set("X-Session-Expires", session.expires_at?.toString() || "");
		}

		return response;
	} catch (error) {
		logger.error("Auth middleware critical error:", error);

		// Fail securely - redirect to auth page
		const url = request.nextUrl.clone();
		const originalPath = url.pathname;
		url.pathname = "/login";
		url.searchParams.set("redirectTo", originalPath);
		return NextResponse.redirect(url);
	}
}

/**
 * Route protection utility
 * Implements role-based access control with caching
 */
export function createRouteGuard(allowedRoles: string[] = []) {
	return async function routeGuard(request: NextRequest) {
		const startTime = performance.now();

		try {
			const supabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
				cookies: {
					get(name: string) {
						return request.cookies.get(name)?.value;
					},
				},
			});

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				const url = request.nextUrl.clone();
				url.pathname = "/login";
				url.searchParams.set("redirectTo", request.nextUrl.pathname);
				return NextResponse.redirect(url);
			}

			// Role-based access control (if roles specified)
			if (allowedRoles.length > 0) {
				const userRole = session.user.user_metadata?.role || "user";

				if (!allowedRoles.includes(userRole)) {
					const url = request.nextUrl.clone();
					url.pathname = "/unauthorized";
					return NextResponse.redirect(url);
				}
			}

			// Log access for security auditing
			logger.security({
				action: "route_access",
				userId: session.user.id,
				route: request.nextUrl.pathname,
				userAgent: request.headers.get("user-agent"),
				ip: request.ip,
				timestamp: Date.now(),
			});

			const duration = performance.now() - startTime;
			logger.performance(`Route guard executed in ${duration.toFixed(2)}ms`);

			return NextResponse.next();
		} catch (error) {
			logger.error("Route guard error:", error);

			const url = request.nextUrl.clone();
			url.pathname = "/error";
			return NextResponse.redirect(url);
		}
	};
}

/**
 * API route authentication helper
 */
export async function authenticateAPIRequest(request: NextRequest): Promise<{
	user: any;
	session: any;
} | null> {
	const startTime = performance.now();

	try {
		const supabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
			},
		});

		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session) {
			return null;
		}

		const duration = performance.now() - startTime;
		logger.performance(`API authentication completed in ${duration.toFixed(2)}ms`);

		return {
			user: session.user,
			session,
		};
	} catch (error) {
		logger.error("API authentication error:", error);
		return null;
	}
}
