/**
 * Dashboard Business API Route
 * Provides business dashboard data and statistics
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";

// Mock dashboard data for development/testing
const mockDashboardData = {
  stats: {
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
    activeCustomers: 45,
    pendingOrders: 8,
  },
  recentActivity: [
    {
      id: "1",
      type: "order",
      title: "New order received",
      description: "Order #1234 from John Doe",
      timestamp: new Date().toISOString(),
      amount: 250.00,
    },
    {
      id: "2",
      type: "customer",
      title: "New customer registered",
      description: "Sarah Smith joined",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  charts: {
    revenue: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [12000, 19000, 15000, 25000, 22000, 30000],
    },
    customers: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [10, 15, 12, 18, 20, 25],
    },
  },
};

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
    logger.warn(`Missing environment variables for dashboard business API (will use mock data): ${missing.join(", ")}`);
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
    logger.error("Failed to create Supabase client for dashboard business:", error);
    return null;
  }
}

export async function GET(request) {
  const startTime = performance.now();

  try {
    logger.debug("Fetching business dashboard data");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const useMock = searchParams.get("mock") === "true";
    const businessId = searchParams.get("businessId");

    // If explicitly requested or if environment is not set up, use mock data
    if (useMock) {
      logger.debug("Using mock dashboard data");
      
      return NextResponse.json(
        {
          success: true,
          data: mockDashboardData,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "mock",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Try to create Supabase client
    const supabase = createSupabaseClient();
    if (!supabase) {
      logger.warn("Supabase client not available for dashboard business, falling back to mock data");
      
      return NextResponse.json(
        {
          success: true,
          data: mockDashboardData,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Fetch dashboard data from database
    let dashboardData = { ...mockDashboardData };

    if (businessId) {
      // Fetch business-specific data
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (!businessError && business) {
        dashboardData.business = business;
      }

      // Fetch business statistics
      const { data: stats, error: statsError } = await supabase
        .from("business_stats")
        .select("*")
        .eq("business_id", businessId)
        .single();

      if (!statsError && stats) {
        dashboardData.stats = {
          ...dashboardData.stats,
          ...stats,
        };
      }
    }

    const duration = performance.now() - startTime;
    logger.performance(`Dashboard business API completed in ${duration.toFixed(2)}ms`);
    logger.debug(`Returned dashboard data for business: ${businessId || 'general'}`);

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "database",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600", // 30 minutes cache
        },
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Error in dashboard business API:", {
      error: error.message,
      stack: error.stack,
      duration: `${duration.toFixed(2)}ms`,
    });

    // Even on error, provide mock data as a last resort
    logger.warn("Critical error occurred in dashboard business API, falling back to mock data");

    return NextResponse.json(
      {
        success: true,
        data: mockDashboardData,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "emergency_fallback",
          error: error.message,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  }
}
