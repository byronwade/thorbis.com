/**
 * V2 Authentication Signup Endpoint
 * Implements secure user registration with email verification
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withValidation, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose } from "@lib/api/middleware";

// Signup request validation schema
const signupSchema = z
	.object({
		email: z.string().email("Invalid email format"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
		confirmPassword: z.string(),
		name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
		acceptTerms: z.boolean().refine((val) => val === true, "Must accept terms and conditions"),
		acceptPrivacy: z.boolean().refine((val) => val === true, "Must accept privacy policy"),
		marketingOptIn: z.boolean().optional().default(false),
		referralCode: z.string().optional(),
		businessOwner: z.boolean().optional().default(false),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SignupRequest = z.infer<typeof signupSchema>;

/**
 * Enhanced signup handler with comprehensive user creation
 */
async function signupHandler(req: NextRequest, validatedData: SignupRequest): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		// Create Supabase client
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

		// Check if email already exists
		const { data: existingUser } = await supabase.from("user_profiles").select("id, email").eq("email", validatedData.email).single();

		if (existingUser) {
			logger.security({
				action: "signup_attempt_existing_email",
				email: validatedData.email,
				ip: clientIP,
				userAgent: req.headers.get("user-agent"),
				timestamp: Date.now(),
			});

			return createErrorResponse("EMAIL_EXISTS", "An account with this email already exists", undefined, 409);
		}

		// Validate referral code if provided
		let referrerId: string | null = null;
		if (validatedData.referralCode) {
			const { data: referrer } = await supabase.from("user_profiles").select("id").eq("referral_code", validatedData.referralCode).single();

			if (referrer) {
				referrerId = referrer.id;
			} else {
				logger.warn(`Invalid referral code used: ${validatedData.referralCode}`);
			}
		}

		// Create user account
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: validatedData.email,
			password: validatedData.password,
			options: {
				data: {
					name: validatedData.name,
					business_owner: validatedData.businessOwner,
				},
				emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
			},
		});

		if (authError) {
			logger.error("Signup auth error:", authError);

			if (authError.message.includes("rate limit")) {
				return createErrorResponse("RATE_LIMIT_EXCEEDED", "Too many signup attempts. Please try again later.");
			}

			return createErrorResponse("SIGNUP_FAILED", authError.message);
		}

		if (!authData.user) {
			return createErrorResponse("SIGNUP_FAILED", "Failed to create user account");
		}

		// Generate unique referral code for new user
		const generateReferralCode = () => {
			return `${validatedData.name.replace(/\s+/g, "").toLowerCase()}${Math.random().toString(36).substring(2, 8)}`;
		};

		const userReferralCode = generateReferralCode();

		// Create comprehensive user profile
		const now = new Date().toISOString();
		const { error: profileError } = await supabase.from("user_profiles").insert({
			id: authData.user.id,
			email: validatedData.email,
			name: validatedData.name,
			role: validatedData.businessOwner ? "business_owner" : "user",
			email_verified: false,
			created_at: now,
			updated_at: now,
			referral_code: userReferralCode,
			referred_by: referrerId,
			marketing_opt_in: validatedData.marketingOptIn,
			terms_accepted_at: now,
			privacy_accepted_at: now,
			preferences: {
				notifications: {
					email: true,
					push: false,
					marketing: validatedData.marketingOptIn,
				},
				display: {
					theme: "light",
					language: "en",
				},
			},
			onboarding_completed: false,
			profile_completion: 25, // Basic info completed
		});

		if (profileError) {
			logger.error("Failed to create user profile:", profileError);

			// Clean up auth user if profile creation failed
			await supabase.auth.admin.deleteUser(authData.user.id);

			return createErrorResponse("PROFILE_CREATION_FAILED", "Failed to create user profile");
		}

		// Track referral if applicable
		if (referrerId) {
			await supabase.from("referrals").insert({
				referrer_id: referrerId,
				referred_id: authData.user.id,
				created_at: now,
				status: "pending", // Will be 'completed' when email is verified
			});

			// Update referrer's referral count
			await supabase.rpc("increment_referral_count", { user_id: referrerId });
		}

		// Log successful signup
		logger.security({
			action: "signup_success",
			userId: authData.user.id,
			email: validatedData.email,
			businessOwner: validatedData.businessOwner,
			referralCode: validatedData.referralCode,
			ip: clientIP,
			userAgent: req.headers.get("user-agent"),
			timestamp: Date.now(),
		});

		// Send welcome email (if email service is configured)
		try {
			await supabase.functions.invoke("send-welcome-email", {
				body: {
					email: validatedData.email,
					name: validatedData.name,
					businessOwner: validatedData.businessOwner,
				},
			});
		} catch (emailError) {
			// Log but don't fail signup if email fails
			logger.warn("Failed to send welcome email:", emailError);
		}

		// Prepare response data
		const responseData = {
			user: {
				id: authData.user.id,
				email: validatedData.email,
				name: validatedData.name,
				role: validatedData.businessOwner ? "business_owner" : "user",
				email_verified: false,
				referral_code: userReferralCode,
				business_owner: validatedData.businessOwner,
			},
			message: "Account created successfully. Please check your email to verify your account.",
			verificationRequired: true,
			nextSteps: ["Check your email for verification link", "Complete your profile setup", validatedData.businessOwner ? "Add your business information" : "Explore local businesses"],
		};

		return createSuccessResponse(responseData, {
			performance: {
				queryTime: performance.now() - startTime,
				cacheHit: false,
			},
		});
	} catch (error) {
		logger.error("Signup handler error:", error);
		return createErrorResponse("INTERNAL_ERROR", "Signup failed due to server error");
	}
}

// Export the composed handler with middleware
export const POST = compose(withPerformanceMonitoring, withValidation(signupHandler, signupSchema));

// Export response type for client-side usage
export type SignupResponse = {
	success: true;
	data: {
		user: {
			id: string;
			email: string;
			name: string;
			role: string;
			email_verified: boolean;
			referral_code: string;
			business_owner: boolean;
		};
		message: string;
		verificationRequired: boolean;
		nextSteps: string[];
	};
	meta: {
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	};
	timestamp: string;
};
