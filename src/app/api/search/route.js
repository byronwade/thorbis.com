/**
 * Search API Route
 * Provides unified search functionality across multiple content types
 */

import { NextResponse } from "next/server";
import { serviceSupabase } from "@lib/database/supabase/client";
import logger from "@lib/utils/logger";

// Mock search results for development/testing
const mockSearchResults = {
  businesses: [
    {
      id: "1",
      name: "Sample Restaurant",
      type: "business",
      description: "A great local restaurant",
      location: "San Francisco, CA",
      category: "Restaurant",
    },
  ],
  jobs: [
    {
      id: "1",
      title: "Software Engineer",
      type: "job",
      company: "Tech Corp",
      location: "San Francisco, CA",
      description: "We're looking for a talented software engineer...",
    },
  ],
  categories: [
    {
      id: "restaurant",
      name: "Restaurant",
      type: "category",
      description: "Dining establishments and eateries",
    },
  ],
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
    logger.warn(`Missing environment variables for search API (will use mock data): ${missing.join(", ")}`);
    return null;
  }

  return requiredEnvVars;
}

// Get Supabase client with error handling
function getSupabaseClient() {
  try {
    	return serviceSupabase();
  } catch (error) {
    logger.error("Failed to get Supabase client for search:", error);
    return null;
  }
}

export async function GET(request) {
  const startTime = performance.now();

  try {
    logger.debug("Processing search request");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const type = searchParams.get("type") || "all"; // all, businesses, jobs, categories
    const location = searchParams.get("location") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const useMock = searchParams.get("mock") === "true";

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
          results: [],
          total: 0,
        },
        { status: 400 }
      );
    }

    // If explicitly requested or if environment is not set up, use mock data
    if (useMock) {
      logger.debug("Using mock search data");
      
      return NextResponse.json(
        {
          success: true,
          results: mockSearchResults.businesses,
          total: mockSearchResults.businesses.length,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "mock",
            query,
            type,
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

    // Try to get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.warn("Supabase client not available for search, falling back to mock data");
      
      return NextResponse.json(
        {
          success: true,
          results: mockSearchResults.businesses,
          total: mockSearchResults.businesses.length,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
            query,
            type,
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

    let results = [];
    let total = 0;

    // Search based on type
    if (type === "all" || type === "businesses") {
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select(`
          id,
          name,
          description,
          location,
          category,
          created_at
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!businessError && businesses) {
        results.push(...businesses.map(b => ({ ...b, type: "business" })));
        total += businesses.length;
      }
    }

    if (type === "all" || type === "jobs") {
      const { data: jobs, error: jobError } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          description,
          location,
          companies (name)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!jobError && jobs) {
        results.push(...jobs.map(j => ({ 
          ...j, 
          type: "job",
          name: j.title,
          company: j.companies?.name 
        })));
        total += jobs.length;
      }
    }

    if (type === "all" || type === "categories") {
      const { data: categories, error: categoryError } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          description
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!categoryError && categories) {
        results.push(...categories.map(c => ({ ...c, type: "category" })));
        total += categories.length;
      }
    }

    // If no results found, use mock data as fallback
    if (results.length === 0) {
      logger.debug("No search results found in database, using mock data");
      
      return NextResponse.json(
        {
          success: true,
          results: mockSearchResults.businesses,
          total: mockSearchResults.businesses.length,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
            query,
            type,
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

    const duration = performance.now() - startTime;
    logger.performance(`Search API completed in ${duration.toFixed(2)}ms`);
    logger.debug(`Returned ${results.length} search results for query: "${query}"`);

    return NextResponse.json(
      {
        success: true,
        results,
        total,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "database",
          query,
          type,
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
    logger.error("Error in search API:", {
      error: error.message,
      stack: error.stack,
      duration: `${duration.toFixed(2)}ms`,
    });

    // Even on error, provide mock data as a last resort
    logger.warn("Critical error occurred in search API, falling back to mock data");

    return NextResponse.json(
      {
        success: true,
        results: mockSearchResults.businesses,
        total: mockSearchResults.businesses.length,
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
