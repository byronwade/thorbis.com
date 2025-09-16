/**
 * Business Categories API v1
 * Provides business categories for filters and navigation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

// Category query validation schema
const categoryQuerySchema = z.object({
  includeCount: z.coerce.boolean().optional().default(true),
  sort: z.enum(["name", "count", "created"]).optional().default("name"),
  parent: z.string().uuid().optional(),
  level: z.coerce.number().min(0).max(3).optional(),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;

// Mock categories data for fallback
const mockCategories = [
  {
    id: "restaurant",
    name: "Restaurant",
    slug: "restaurant",
    description: "Dining establishments and eateries",
    icon: "utensils",
    color: "#FF6B6B",
    business_count: 45,
    level: 0,
    featured: true,
  },
  {
    id: "cafe",
    name: "Cafe",
    slug: "cafe",
    description: "Coffee shops and casual dining",
    icon: "coffee",
    color: "#4ECDC4",
    business_count: 23,
    level: 0,
    featured: true,
  },
  {
    id: "retail",
    name: "Retail",
    slug: "retail",
    description: "Shopping and retail stores",
    icon: "shopping-bag",
    color: "#45B7D1",
    business_count: 67,
    level: 0,
    featured: true,
  },
  {
    id: "services",
    name: "Services",
    slug: "services",
    description: "Professional and personal services",
    icon: "briefcase",
    color: "#F7B731",
    business_count: 89,
    level: 0,
    featured: true,
  },
  {
    id: "health",
    name: "Health & Wellness",
    slug: "health",
    description: "Healthcare and wellness services",
    icon: "heart",
    color: "#5F27CD",
    business_count: 34,
    level: 0,
    featured: true,
  },
  {
    id: "automotive",
    name: "Automotive",
    slug: "automotive",
    description: "Auto services and dealerships",
    icon: "car",
    color: "#00D2D3",
    business_count: 12,
    level: 0,
    featured: false,
  },
  {
    id: "home-services",
    name: "Home Services",
    slug: "home-services",
    description: "Home improvement and maintenance services",
    icon: "home",
    color: "#FF9FF3",
    business_count: 28,
    level: 0,
    featured: false,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    slug: "entertainment",
    description: "Entertainment venues and activities",
    icon: "music",
    color: "#54A0FF",
    business_count: 19,
    level: 0,
    featured: false,
  },
];

/**
 * GET /api/v1/categories - Get business categories with filtering
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = categoryQuerySchema.parse(Object.fromEntries(searchParams));

    // Check if mock data is requested or if we should use fallback
    const useMock = searchParams.get("mock") === "true";

    if (useMock) {
      const filteredCategories = filterMockCategories(mockCategories, queryParams);
      const queryTime = performance.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          data: {
            categories: filteredCategories,
          },
          meta: {
            total: filteredCategories.length,
            performance: {
              queryTime,
              cacheHit: false,
            },
            source: "mock",
            filters: queryParams,
          },
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Try to get data from Supabase
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

    // Build dynamic select fields
    const selectFields = `
      id,
      name,
      slug,
      description,
      icon,
      color,
      level,
      featured,
      parent_id,
      created_at,
      updated_at
    `;

    if (queryParams.includeCount) {
      selectFields += `,
        business_categories(count)
      `;
    }

    // Build query with filters
    let query = supabase.from("categories").select(selectFields);

    // Apply filters
    if (queryParams.parent) {
      query = query.eq("parent_id", queryParams.parent);
    } else {
      // Default to root categories only if no parent specified
      query = query.is("parent_id", null);
    }

    if (queryParams.level !== undefined) {
      query = query.eq("level", queryParams.level);
    }

    if (queryParams.featured !== undefined) {
      query = query.eq("featured", queryParams.featured);
    }

    // Apply sorting
    switch (queryParams.sort) {
      case "count":
        // This would require a more complex query in production
        query = query.order("name", { ascending: true });
        break;
      case "created":
        query = query.order("created_at", { ascending: false });
        break;
      default: // name
        query = query.order("name", { ascending: true });
    }

    // Apply limit if specified
    if (queryParams.limit) {
      query = query.limit(queryParams.limit);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("Categories query error:", error);
      // Fallback to mock data on error
      const filteredCategories = filterMockCategories(mockCategories, queryParams);
      const queryTime = performance.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          data: {
            categories: filteredCategories,
          },
          meta: {
            total: filteredCategories.length,
            performance: {
              queryTime,
              cacheHit: false,
            },
            source: "fallback",
            error: error.message,
            filters: queryParams,
          },
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Transform data for consistent response format
    const transformedCategories = (categories || []).map((category: unknown) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      level: category.level || 0,
      featured: category.featured || false,
      parent_id: category.parent_id,
      business_count: category.business_categories?.length || 0,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));

    // If no categories found, use mock data as fallback
    if (transformedCategories.length === 0) {
      const filteredCategories = filterMockCategories(mockCategories, queryParams);
      const queryTime = performance.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          data: {
            categories: filteredCategories,
          },
          meta: {
            total: filteredCategories.length,
            performance: {
              queryTime,
              cacheHit: false,
            },
            source: "fallback",
            filters: queryParams,
          },
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const queryTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          categories: transformedCategories,
        },
        meta: {
          total: transformedCategories.length,
          performance: {
            queryTime,
            cacheHit: false,
          },
          source: "database",
          filters: queryParams,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600", // 30 minutes cache
        },
      }
    );
  } catch (error) {
    console.error("Categories handler error:", error);
    
    // Emergency fallback to mock data
    const filteredCategories = filterMockCategories(mockCategories, {
      includeCount: true,
      sort: "name",
    });
    
    const queryTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          categories: filteredCategories,
        },
        meta: {
          total: filteredCategories.length,
          performance: {
            queryTime,
            cacheHit: false,
          },
          source: "emergency_fallback",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  }
}

/**
 * Filter mock categories based on query parameters
 */
function filterMockCategories(categories: typeof mockCategories, queryParams: CategoryQueryParams) {
  let filtered = [...categories];

  // Filter by featured status
  if (queryParams.featured !== undefined) {
    filtered = filtered.filter(cat => cat.featured === queryParams.featured);
  }

  // Filter by level
  if (queryParams.level !== undefined) {
    filtered = filtered.filter(cat => cat.level === queryParams.level);
  }

  // Apply sorting
  switch (queryParams.sort) {
    case "count":
      filtered.sort((a, b) => b.business_count - a.business_count);
      break;
    case "created":
      // For mock data, just reverse order
      filtered.reverse();
      break;
    default: // name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Apply limit
  if (queryParams.limit) {
    filtered = filtered.slice(0, queryParams.limit);
  }

  return filtered;
}

export type CategoriesResponse = {
  success: true;
  data: {
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      icon: string;
      color: string;
      level: number;
      featured: boolean;
      parent_id?: string;
      business_count: number;
      created_at?: string;
      updated_at?: string;
    }>;
  };
  meta: {
    total: number;
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
    source: "database" | "mock" | "fallback" | "emergency_fallback";
    error?: string;
    filters?: CategoryQueryParams;
  };
  timestamp: string;
};