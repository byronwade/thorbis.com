// Role Synchronization API - Fixes missing business_owner roles
// This endpoint checks if users own businesses and assigns the proper roles

import { createSupabaseServerClient } from "@lib/database/supabase/server";
import { NextResponse } from "next/server";
import logger from "@lib/utils/logger";

/**
 * POST /api/auth/sync-roles
 * Synchronizes user roles based on business ownership
 * This endpoint fixes the common issue where users create businesses
 * but don't get assigned the business_owner role
 */
export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const startTime = performance.now();
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.error("Session error in sync-roles:", sessionError);
      return NextResponse.json(
        { error: "Authentication failed", details: sessionError.message },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    logger.info(`Starting role synchronization for user: ${userId}`);

    // Step 1: Get current user profile from users table (not user_profiles)
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      logger.error("Failed to fetch user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch user profile", details: profileError.message },
        { status: 500 }
      );
    }

    // Step 2: Check if user profile exists, create if missing
    if (!userProfile) {
      logger.info(`Creating missing user profile for user: ${userId}`);
      
      const { error: createProfileError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email,
          role: "user", // Default role
          email_verified: session.user.email_confirmed_at ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createProfileError) {
        logger.error("Failed to create user profile:", createProfileError);
        return NextResponse.json(
          { error: "Failed to create user profile", details: createProfileError.message },
          { status: 500 }
        );
      }

      logger.info(`Created user profile for user: ${userId}`);
    }

    // Step 3: Check if user owns any businesses
    const { data: ownedBusinesses, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, status")
      .eq("owner_id", userId);

    if (businessError) {
      logger.error("Failed to fetch user businesses:", businessError);
      return NextResponse.json(
        { error: "Failed to check business ownership", details: businessError.message },
        { status: 500 }
      );
    }

    const businessCount = ownedBusinesses?.length || 0;
    logger.info(`User ${userId} owns ${businessCount} business(es)`);

    // Step 4: Determine correct role based on business ownership
    let correctRole = "user";
    const shouldBeBusinessOwner = businessCount > 0;
    
    if (shouldBeBusinessOwner) {
      correctRole = "business_owner";
    }

    // Step 5: Update role if needed
    const currentRole = userProfile?.role || "user";
    let roleUpdated = false;

    if (currentRole !== correctRole) {
      logger.info(`Updating user role from "${currentRole}" to "${correctRole}"`);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          role: correctRole,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        logger.error("Failed to update user role:", updateError);
        return NextResponse.json(
          { error: "Failed to update user role", details: updateError.message },
          { status: 500 }
        );
      }

      roleUpdated = true;
      logger.info(`Successfully updated user role to: ${correctRole}`);
    }

    // Step 6: Log the synchronization result
    const duration = performance.now() - startTime;
    logger.performance(`Role synchronization completed in ${duration.toFixed(2)}ms`);

    const result = {
      success: true,
      userId,
      email: session.user.email,
      currentRole: correctRole,
      businessCount,
      roleUpdated,
      businesses: ownedBusinesses?.map(b => ({ id: b.id, name: b.name, status: b.status })) || [],
      duration: Math.round(duration)
    };

    logger.info("Role synchronization result:", result);

    return NextResponse.json(result);

  } catch (error) {
    logger.error("Unexpected error in role synchronization:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/sync-roles
 * Returns current user role status and business ownership info
 */
export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user profile and businesses in parallel
    const [profileResult, businessResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, name, role, email_verified, created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("businesses")
        .select("id, name, status, created_at")
        .eq("owner_id", userId)
    ]);

    const userProfile = profileResult.data;
    const ownedBusinesses = businessResult.data || [];

    const shouldHaveBusinessOwnerRole = ownedBusinesses.length > 0;
    const currentRole = userProfile?.role || "user";
    const hasCorrectRole = shouldHaveBusinessOwnerRole ? currentRole === "business_owner" : currentRole === "user";

    return NextResponse.json({
      user: {
        id: userId,
        email: session.user.email,
        name: userProfile?.name,
        currentRole,
        emailVerified: userProfile?.email_verified,
        profileExists: !!userProfile
      },
      businesses: {
        count: ownedBusinesses.length,
        businesses: ownedBusinesses.map(b => ({ 
          id: b.id, 
          name: b.name, 
          status: b.status,
          createdAt: b.created_at
        }))
      },
      roleStatus: {
        shouldHaveBusinessOwnerRole,
        hasCorrectRole,
        needsSync: !hasCorrectRole
      }
    });

  } catch (error) {
    logger.error("Error checking role status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
