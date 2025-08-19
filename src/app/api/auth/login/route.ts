/**
 * V2 Authentication Login Endpoint
 * Implements secure login with enhanced session management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withValidation, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose } from "@lib/api/middleware";

// Login request validation schema
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	rememberMe: z.boolean().optional().default(false),
	deviceInfo: z
		.object({
			userAgent: z.string().optional(),
			fingerprint: z.string().optional(),
			platform: z.string().optional(),
		})
		.optional(),
});

type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Enhanced login handler with security features
 */
async function loginHandler(req: NextRequest, validatedData: LoginRequest): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		// Create Supabase client
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
				set(_name: string, _value: string, _options: any) {
					// Cookies will be set by the response automatically
					// Secure options handled by Supabase SSR
				},
			},
		});

		// Check for rate limiting based on email/IP
		const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
		// const rateLimitKey = `login_attempts:${validatedData.email}:${clientIP}`;

		// TODO: Implement proper rate limiting here
		// For now, we'll use a simple check
		console.debug(`Login attempt from IP: ${clientIP} for email: ${validatedData.email}`);

		// Attempt login
		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email: validatedData.email,
			password: validatedData.password,
		});

		if (authError) {
			// Log failed login attempt
			logger.security({
				action: "login_failed",
				email: validatedData.email,
				error: authError.message,
				ip: clientIP,
				userAgent: req.headers.get("user-agent"),
				timestamp: Date.now(),
			});

			// Return generic error to prevent email enumeration
			return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", undefined, 401);
		}

		if (!authData.user || !authData.session) {
			return createErrorResponse("LOGIN_FAILED", "Login failed");
		}

		// Get user profile with additional data
		const { data: userProfile, error: profileError } = await supabase
			.from("user_profiles")
			.select(
				`
        id,
        email,
        name,
        avatar_url,
        role,
        permissions,
        email_verified,
        two_factor_enabled,
        last_login_at,
        login_count,
        preferences
      `
			)
			.eq("id", authData.user.id)
			.single();

		if (profileError || !userProfile) {
			logger.error("Failed to fetch user profile after login:", profileError);
			return createErrorResponse("PROFILE_ERROR", "Failed to load user profile");
		}

		// Update user login statistics
		const now = new Date().toISOString();
		await supabase
			.from("user_profiles")
			.update({
				last_login_at: now,
				login_count: (userProfile.login_count || 0) + 1,
			})
			.eq("id", authData.user.id);

		// Log successful login
		logger.security({
			action: "login_success",
			userId: authData.user.id,
			email: validatedData.email,
			ip: clientIP,
			userAgent: req.headers.get("user-agent"),
			deviceInfo: validatedData.deviceInfo,
			timestamp: Date.now(),
		});

		// Record login session for security tracking
		if (validatedData.deviceInfo) {
			await supabase.from("user_sessions").insert({
				user_id: authData.user.id,
				session_id: authData.session.access_token,
				device_info: validatedData.deviceInfo,
				ip_address: clientIP,
				user_agent: req.headers.get("user-agent"),
				created_at: now,
				expires_at: new Date(Date.now() + (validatedData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
			});
		}

		// Prepare response data
		const responseData = {
			user: {
				id: userProfile.id,
				email: userProfile.email,
				name: userProfile.name,
				avatar_url: userProfile.avatar_url,
				role: userProfile.role,
				permissions: userProfile.permissions || [],
				email_verified: userProfile.email_verified,
				two_factor_enabled: userProfile.two_factor_enabled,
				preferences: userProfile.preferences || {},
			},
			session: {
				access_token: authData.session.access_token,
				refresh_token: authData.session.refresh_token,
				expires_at: authData.session.expires_at,
				expires_in: authData.session.expires_in,
			},
			loginCount: userProfile.login_count + 1,
			lastLoginAt: userProfile.last_login_at,
		};

		// Create response with security headers
		const response = createSuccessResponse(responseData, {
			performance: {
				queryTime: performance.now() - startTime,
				cacheHit: false,
			},
		});

		// Set secure session cookies
		response.cookies.set("sb-access-token", authData.session.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: validatedData.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
			path: "/",
		});

		response.cookies.set("sb-refresh-token", authData.session.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: validatedData.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
			path: "/",
		});

		// Add security headers
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-XSS-Protection", "1; mode=block");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

		return response;
	} catch (error) {
		logger.error("Login handler error:", error);
		return createErrorResponse("INTERNAL_ERROR", "Login failed due to server error");
	}
}

// Export the composed handler with middleware
export const POST = compose(withPerformanceMonitoring, withValidation(loginHandler, loginSchema));

// Export response type for client-side usage
export type LoginResponse = {
	success: true;
	data: {
		user: {
			id: string;
			email: string;
			name: string;
			avatar_url: string;
			role: string;
			permissions: string[];
			email_verified: boolean;
			two_factor_enabled: boolean;
			preferences: Record<string, any>;
		};
		session: {
			access_token: string;
			refresh_token: string;
			expires_at: number;
			expires_in: number;
		};
		loginCount: number;
		lastLoginAt: string;
	};
	meta: {
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	};
	timestamp: string;
};
