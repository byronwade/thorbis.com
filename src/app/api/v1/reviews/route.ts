/**
 * Reviews Management API v1
 * Comprehensive review system with moderation and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse, ApiErrorCode, UsageUnits } from "@/lib/api-response-utils";

// Review query validation schema
const reviewQuerySchema = z.object({
  businessId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  status: z.enum(["pending", "approved", "rejected", "flagged"]).optional(),
  verified: z.coerce.boolean().optional(),
  hasPhotos: z.coerce.boolean().optional(),
  hasResponse: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "oldest", "rating_high", "rating_low", "helpful", "relevance"]).optional().default("newest"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  include: z
    .array(z.enum(["user", "business", "photos", "responses", "helpful_votes"]))
    .optional()
    .default(["user", "business"]),
});

// Review creation validation schema
const reviewCreateSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  text: z.string().min(20, "Review must be at least 20 characters").max(5000, "Review too long"),
  photos: z
    .array(
      z.object({
        url: z.string().url("Invalid photo URL"),
        alt_text: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .max(10, "Maximum 10 photos allowed")
    .optional(),
  visitDate: z.string().datetime().optional(),
  verifiedPurchase: z.boolean().optional().default(false),
  anonymous: z.boolean().optional().default(false),
  recommendToFriends: z.boolean().optional(),
  wouldReturnAgain: z.boolean().optional(),
  aspects: z
    .object({
      service: z.number().min(1).max(5).optional(),
      quality: z.number().min(1).max(5).optional(),
      value: z.number().min(1).max(5).optional(),
      atmosphere: z.number().min(1).max(5).optional(),
      cleanliness: z.number().min(1).max(5).optional(),
    })
    .optional(),
});

type ReviewQueryParams = z.infer<typeof reviewQuerySchema>;
type ReviewCreateData = z.infer<typeof reviewCreateSchema>;

/**
 * GET /api/v1/reviews - Get reviews with advanced filtering
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = reviewQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Build dynamic select based on includes
    const selectFields = `
      id,
      rating,
      title,
      text,
      verified_purchase,
      anonymous,
      visit_date,
      helpful_count,
      report_count,
      status,
      created_at,
      updated_at,
      aspects,
      recommend_to_friends,
      would_return_again
    `;

    if (queryParams.include.includes("user")) {
      selectFields += `,
        user:users(
          id,
          name,
          avatar_url,
          reviewer_level,
          total_reviews,
          helpful_votes_received
        )
      `;
    }

    if (queryParams.include.includes("business")) {
      selectFields += `,
        business:businesses(
          id,
          name,
          slug,
          rating,
          review_count
        )
      `;
    }

    if (queryParams.include.includes("photos")) {
      selectFields += `,
        review_photos(
          id,
          url,
          alt_text,
          caption,
          order
        )
      `;
    }

    if (queryParams.include.includes("responses")) {
      selectFields += `,
        review_responses(
          id,
          response_text,
          responder_type,
          created_at,
          business:businesses(name),
          user_id
        )
      `;
    }

    // Build query with filters
    let query = supabase.from("reviews").select(selectFields, { count: "exact" });

    // Public users only see approved reviews
    query = query.eq("status", "approved");

    // Apply specific filters
    if (queryParams.businessId) {
      query = query.eq("business_id", queryParams.businessId);
    }

    if (queryParams.rating) {
      query = query.eq("rating", queryParams.rating);
    }

    if (queryParams.verified !== undefined) {
      query = query.eq("verified_purchase", queryParams.verified);
    }

    if (queryParams.hasPhotos !== undefined) {
      if (queryParams.hasPhotos) {
        query = query.not("review_photos", "is", null);
      } else {
        query = query.is("review_photos", null);
      }
    }

    if (queryParams.hasResponse !== undefined) {
      if (queryParams.hasResponse) {
        query = query.not("review_responses", "is", null);
      } else {
        query = query.is("review_responses", null);
      }
    }

    // Apply sorting
    switch (queryParams.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "rating_high":
        query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "rating_low":
        query = query.order("rating", { ascending: true }).order("created_at", { ascending: false });
        break;
      case "helpful":
        query = query.order("helpful_count", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "relevance":
        // For relevance, implement a scoring algorithm
        query = query.order("helpful_count", { ascending: false }).order("rating", { ascending: false });
        break;
      default: // newest
        query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const offset = (queryParams.page - 1) * queryParams.limit;
    query = query.range(offset, offset + queryParams.limit - 1);

    // Execute query
    const { data: reviews, error, count } = await query;

    if (error) {
      console.error("Reviews query error:", error);
      throw error;
    }

    // Calculate pagination metadata
    const total = count || 0;
    const pages = Math.ceil(total / queryParams.limit);
    const hasNext = queryParams.page < pages;
    const hasPrev = queryParams.page > 1;

    // Get rating aggregates for the business if specified
    let aggregates = null;
    if (queryParams.businessId) {
      aggregates = {
        ratingDistribution: await getRatingDistribution(supabase, queryParams.businessId),
        averageRating: await getAverageRating(supabase, queryParams.businessId),
        totalReviews: total,
      };
    }

    const queryTime = performance.now() - startTime;

    return NextResponse.json(
      createSuccessResponse(
        {
          reviews: reviews || [],
          aggregates,
          filters: queryParams,
        },
        queryTime,
        {
          pagination: {
            page: queryParams.page,
            limit: queryParams.limit,
            total,
            pages,
            hasNext,
            hasPrev,
          },
          cacheStatus: 'miss',
          usageCost: 0.001,
          usageUnits: UsageUnits.DATABASE_QUERY
        }
      )
    );
  } catch (error) {
    console.error("Get reviews handler error:", error);
    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        'Failed to fetch reviews',
        {
          details: error instanceof Error ? error.message : 'Unknown error',
          suggestedAction: 'Check query parameters and try again',
          documentationUrl: 'https://thorbis.com/docs/api/reviews'
        }
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/reviews - Create new review
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const reviewData = reviewCreateSchema.parse(body);

    // For now, simulate successful creation
    // In production, this would require authentication and database integration
    const mockReview = {
      id: crypto.randomUUID(),
      business_id: reviewData.businessId,
      user_id: "mock-user-id",
      rating: reviewData.rating,
      title: reviewData.title,
      text: reviewData.text,
      verified_purchase: reviewData.verifiedPurchase,
      anonymous: reviewData.anonymous,
      visit_date: reviewData.visitDate,
      aspects: reviewData.aspects,
      recommend_to_friends: reviewData.recommendToFriends,
      would_return_again: reviewData.wouldReturnAgain,
      status: "pending", // Reviews require moderation
      helpful_count: 0,
      report_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: reviewData.photos || [],
    };

    const queryTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          review: mockReview,
          message: "Review submitted successfully and is pending moderation",
          status: "pending_moderation",
        },
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
    console.error("Create review handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "CREATION_ERROR",
        message: "Failed to create review",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Get rating distribution for a business
 */
async function getRatingDistribution(supabase: unknown, businessId: string) {
  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", businessId)
      .eq("status", "approved");

    if (!reviews || reviews.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    return reviews.reduce(
      (acc: unknown, review: unknown) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );
  } catch (error) {
    console.error("Failed to get rating distribution:", error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
}

/**
 * Get average rating for a business
 */
async function getAverageRating(supabase: unknown, businessId: string) {
  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", businessId)
      .eq("status", "approved");

    if (!reviews || reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum: number, review: unknown) => sum + review.rating, 0);
    return +(totalRating / reviews.length).toFixed(2);
  } catch (error) {
    console.error("Failed to get average rating:", error);
    return 0;
  }
}

export type ReviewsResponse = {
  success: true;
  data: {
    reviews: unknown[];
    aggregates: {
      ratingDistribution: Record<string, number> | null;
      averageRating: number | null;
      totalReviews: number;
    } | null;
  };
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
    filters: ReviewQueryParams;
  };
  timestamp: string;
};

export type ReviewCreateResponse = {
  success: true;
  data: {
    review: any;
    message: string;
    status: string;
  };
  meta: {
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
  };
  timestamp: string;
};