/**
 * Signup API Route
 * Handles user registration and account creation
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";

// Environment validation
function validateEnvironment() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missing.length > 0) {
    logger.warn(`Missing environment variables for signup API: ${missing.join(", ")}`);
    return null;
  }

  return requiredEnvVars;
}

// Create Supabase client with error handling
function createSupabaseClient() {
  try {
    const env = validateEnvironment();
    if (!env) {
      return null;
    }

    return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  } catch (error) {
    logger.error("Failed to create Supabase client for signup:", error);
    return null;
  }
}

export async function POST(request) {
  const startTime = performance.now();

  try {
    logger.debug("Processing signup request");

    const body = await request.json();
    const { email, password, name, useMock } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // If explicitly requested, return mock response
    if (useMock) {
      logger.debug("Using mock signup response");
      
      return NextResponse.json(
        {
          success: true,
          user: {
            id: "mock-user-id",
            email: email,
            name: name || "Mock User",
          },
          session: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "mock",
          },
        },
        { status: 200 }
      );
    }

    // Try to create Supabase client
    const supabase = createSupabaseClient();
    if (!supabase) {
      logger.error("Supabase client not available for signup");
      
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service unavailable",
        },
        { status: 503 }
      );
    }

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      logger.warn("Signup failed:", { email, error: error.message });
      
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    const duration = performance.now() - startTime;
    logger.performance(`Signup API completed in ${duration.toFixed(2)}ms`);
    logger.debug(`User signed up successfully: ${email}`);

    return NextResponse.json(
      {
        success: true,
        user: data.user,
        session: data.session,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "database",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Error in signup API:", {
      error: error.message,
      stack: error.stack,
      duration: `${duration.toFixed(2)}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
