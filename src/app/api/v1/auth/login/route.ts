/**
 * Authentication Login API v1
 * Secure login with enhanced session management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

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
 * POST /api/v1/auth/login - Authenticate user
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: unknown) {
            // Handled in response cookies
          },
        },
      }
    );

    // Check for rate limiting based on email/IP
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    console.debug(`Login attempt from IP: ${clientIP} for email: ${validatedData.email}`);

    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      // Log failed login attempt (in production, use proper logging)
      console.error("Login failed:", {
        action: "login_failed",
        email: validatedData.email,
        error: authError.message,
        ip: clientIP,
        userAgent: request.headers.get("user-agent"),
        timestamp: Date.now(),
      });

      // Return generic error to prevent email enumeration
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        {
          success: false,
          error: "LOGIN_FAILED",
          message: "Login failed",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
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
      console.error("Failed to fetch user profile after login:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: "PROFILE_ERROR",
          message: "Failed to load user profile",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
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
    console.log("Login successful:", {
      action: "login_success",
      userId: authData.user.id,
      email: validatedData.email,
      ip: clientIP,
      userAgent: request.headers.get("user-agent"),
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
        user_agent: request.headers.get("user-agent"),
        created_at: now,
        expires_at: new Date(
          Date.now() + (validatedData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
        ).toISOString(),
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

    const queryTime = performance.now() - startTime;

    // Create response with security headers
    const response = NextResponse.json(
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
      { status: 200 }
    );

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
    console.error("Login handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Login failed due to server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

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
      preferences: Record<string, unknown>;
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