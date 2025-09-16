/**
 * Authentication Signup API v1
 * Secure user registration with email verification
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

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
 * POST /api/v1/auth/signup - Register new user
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("id, email")
      .eq("email", validatedData.email)
      .single();

    if (existingUser) {
      console.log("Signup attempt with existing email:", {
        action: "signup_attempt_existing_email",
        email: validatedData.email,
        ip: clientIP,
        userAgent: request.headers.get("user-agent"),
        timestamp: Date.now(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_EXISTS",
          message: "An account with this email already exists",
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (validatedData.referralCode) {
      const { data: referrer } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("referral_code", validatedData.referralCode)
        .single();

      if (referrer) {
        referrerId = referrer.id;
      } else {
        console.warn(`Invalid referral code used: ${validatedData.referralCode}`);
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback',
      },
    });

    if (authError) {
      console.error("Signup auth error:", authError);

      if (authError.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            message: "Too many signup attempts. Please try again later.",
            timestamp: new Date().toISOString(),
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "SIGNUP_FAILED",
          message: authError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "SIGNUP_FAILED",
          message: "Failed to create user account",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generate unique referral code for new user
    const generateReferralCode = () => {
      return '${validatedData.name.replace(/\s+/g, "").toLowerCase()}${Math.random()
        .toString(36)
        .substring(2, 8)}';
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
      console.error("Failed to create user profile:", profileError);

      // Clean up auth user if profile creation failed
      // Note: In production, you'd use the admin client for this
      // await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: "PROFILE_CREATION_FAILED",
          message: "Failed to create user profile",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
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
      // Note: This would use a Postgres function in production
      const { data: referrerProfile } = await supabase
        .from("user_profiles")
        .select("referral_count")
        .eq("id", referrerId)
        .single();
      
      if (referrerProfile) {
        await supabase
          .from("user_profiles")
          .update({
            referral_count: (referrerProfile.referral_count || 0) + 1,
          })
          .eq("id", referrerId);
      }
    }

    // Log successful signup
    console.log("Signup successful:", {
      action: "signup_success",
      userId: authData.user.id,
      email: validatedData.email,
      businessOwner: validatedData.businessOwner,
      referralCode: validatedData.referralCode,
      ip: clientIP,
      userAgent: request.headers.get("user-agent"),
      timestamp: Date.now(),
    });

    // Send welcome email (mock implementation)
    try {
      // In production, this would use a proper email service
      console.log("Welcome email would be sent to:", {
        email: validatedData.email,
        name: validatedData.name,
        businessOwner: validatedData.businessOwner,
      });
    } catch (emailError) {
      // Log but don't fail signup if email fails
      console.warn("Failed to send welcome email:", emailError);
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
      nextSteps: [
        "Check your email for verification link",
        "Complete your profile setup",
        validatedData.businessOwner ? "Add your business information" : "Explore local businesses",
      ],
    };

    const queryTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        meta: {
          performance: {
            queryTime,
            cacheHit: false,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Signup failed due to server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

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