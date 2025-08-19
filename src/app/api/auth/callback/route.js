// OAuth Callback Handler for Supabase Auth
// Handles OAuth redirects from providers like Google, GitHub, etc.

import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@lib/database/supabase/ssr";
import logger from "@lib/utils/logger";

export async function GET(request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const errorDescription = requestUrl.searchParams.get("error_description");
	const state = requestUrl.searchParams.get("state");
	const type = requestUrl.searchParams.get("type"); // signup or signin

	// Log the callback attempt for security auditing
	logger.security({
		action: "oauth_callback_attempt",
		code: code ? "present" : "missing",
		error: error || null,
		type: type || "signin",
		state: state || null,
		timestamp: Date.now(),
		ip: request.headers.get("x-forwarded-for") || "unknown",
		userAgent: request.headers.get("user-agent") || "unknown",
	});

	const supabase = createSupabaseRouteHandlerClient(request);

	// Handle OAuth errors
	if (error) {
		logger.error("OAuth callback error:", {
			error,
			errorDescription,
			state,
		});

		// Redirect to login page with error message
		const redirectUrl = new URL("/login", requestUrl.origin);
		redirectUrl.searchParams.set("error", "oauth_error");
		redirectUrl.searchParams.set("message", errorDescription || "Authentication failed. Please try again.");

		return NextResponse.redirect(redirectUrl);
	}

	// Handle missing authorization code
	if (!code) {
		logger.warn("OAuth callback missing authorization code");

		const redirectUrl = new URL("/login", requestUrl.origin);
		redirectUrl.searchParams.set("error", "missing_code");
		redirectUrl.searchParams.set("message", "Authentication failed. Missing authorization code.");

		return NextResponse.redirect(redirectUrl);
	}

	try {
		// Exchange code for session
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.exchangeCodeForSession(code);

		if (sessionError) {
			throw sessionError;
		}

		if (!session) {
			throw new Error("No session created from OAuth callback");
		}

		const user = session.user;

		// Log successful OAuth authentication
		logger.security({
			action: "oauth_callback_success",
			userId: user.id,
			email: user.email,
			provider: user.app_metadata?.provider || "unknown",
			type: type || "signin",
			timestamp: Date.now(),
		});

		// Sync user profile to our users table
		try {
			const { data: existingUser } = await supabase.from("users").select("id").eq("id", user.id).single();

			if (!existingUser) {
				// Create new user profile
				const { error: insertError } = await supabase.from("users").insert({
					id: user.id,
					email: user.email,
					name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split("@")[0],
					avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
					role: "user", // Default role
					email_verified: !!user.email_confirmed_at,
					phone: user.phone,
					created_at: user.created_at,
					updated_at: new Date().toISOString(),
				});

				if (insertError) {
					logger.error("Error creating user profile after OAuth:", insertError);
				} else {
					logger.debug("Created new user profile after OAuth:", user.id);
				}
			} else {
				// Update existing user profile
				const { error: updateError } = await supabase
					.from("users")
					.update({
						email: user.email,
						name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || existingUser.name,
						avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
						email_verified: !!user.email_confirmed_at,
						phone: user.phone,
						updated_at: new Date().toISOString(),
					})
					.eq("id", user.id);

				if (updateError) {
					logger.error("Error updating user profile after OAuth:", updateError);
				}
			}
		} catch (profileError) {
			// Don't fail the auth process if profile sync fails
			logger.error("User profile sync failed after OAuth:", profileError);
		}

		// Determine redirect destination based on user type and context
		let redirectPath = "/dashboard/user"; // Default

		// Check if this was a signup flow
		if (type === "signup") {
			redirectPath = "/onboarding/business-setup";
		} else {
			// Check user role from database for existing users
			try {
				const { data: userProfile } = await supabase.from("users").select("role, business_id").eq("id", user.id).single();

				if (userProfile) {
					if (userProfile.role === "admin") {
						redirectPath = "/dashboard/admin";
					} else if (userProfile.role === "business_owner" || userProfile.business_id) {
						redirectPath = "/dashboard/business";
					}
				}
			} catch (roleError) {
				logger.warn("Could not determine user role after OAuth:", roleError);
			}
		}

		// Check for custom redirect URL in state
		if (state) {
			try {
				const stateData = JSON.parse(atob(state));
				if (stateData.redirectTo && stateData.redirectTo.startsWith("/")) {
					redirectPath = stateData.redirectTo;
				}
			} catch (stateError) {
				logger.warn("Invalid state parameter in OAuth callback:", stateError);
			}
		}

		const redirectUrl = new URL(redirectPath, requestUrl.origin);

		// Add success message for new signups
		if (type === "signup") {
			redirectUrl.searchParams.set("message", "Account created successfully! Welcome to Thorbis!");
		}

		logger.debug("OAuth callback successful, redirecting to:", redirectPath);

		return NextResponse.redirect(redirectUrl);
	} catch (authError) {
		logger.error("OAuth callback processing error:", authError);

		// Log the failed authentication attempt
		logger.security({
			action: "oauth_callback_failure",
			error: authError.message,
			code: code ? "present" : "missing",
			timestamp: Date.now(),
		});

		// Redirect to login with error message
		const redirectUrl = new URL("/login", requestUrl.origin);
		redirectUrl.searchParams.set("error", "auth_callback_error");

		// Provide user-friendly error messages
		let userMessage = "Authentication failed. Please try again.";

		if (authError.message?.includes("invalid_grant")) {
			userMessage = "The authorization code has expired. Please try signing in again.";
		} else if (authError.message?.includes("invalid_request")) {
			userMessage = "Invalid authentication request. Please try again.";
		} else if (authError.message?.includes("access_denied")) {
			userMessage = "Access was denied. Please grant permission to continue.";
		}

		redirectUrl.searchParams.set("message", userMessage);

		return NextResponse.redirect(redirectUrl);
	}
}
