/**
 * V2 Reviews Endpoint
 * Comprehensive review management with moderation and analytics
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, ApiRequest } from "@lib/api/middleware";

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

// Review update validation schema
const reviewUpdateSchema = z
	.object({
		title: z.string().min(5).max(200).optional(),
		text: z.string().min(20).max(5000).optional(),
		rating: z.number().min(1).max(5).optional(),
		photos: z
			.array(
				z.object({
					url: z.string().url(),
					alt_text: z.string().optional(),
					caption: z.string().optional(),
				})
			)
			.max(10)
			.optional(),
		aspects: z
			.object({
				service: z.number().min(1).max(5).optional(),
				quality: z.number().min(1).max(5).optional(),
				value: z.number().min(1).max(5).optional(),
				atmosphere: z.number().min(1).max(5).optional(),
				cleanliness: z.number().min(1).max(5).optional(),
			})
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

type ReviewQueryParams = z.infer<typeof reviewQuerySchema>;
type ReviewCreateData = z.infer<typeof reviewCreateSchema>;
type ReviewUpdateData = z.infer<typeof reviewUpdateSchema>;

/**
 * Get reviews with advanced filtering and sorting
 */
async function getReviews(req: ApiRequest, queryParams: ReviewQueryParams): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Build dynamic select based on includes
		let selectFields = `
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

		if (queryParams.include.includes("helpful_votes") && req.user) {
			selectFields += `,
        review_helpful_votes!inner(
          user_id,
          is_helpful
        )
      `;
		}

		// Build query with filters
		let query = supabase.from("reviews").select(selectFields, { count: "exact" });

		// Apply filters based on user permissions
		if (!req.user || req.user.role === "user") {
			// Public users only see approved reviews
			query = query.eq("status", "approved");
		} else if (req.user.role === "business_owner") {
			// Business owners see reviews for their businesses (all statuses)
			const { data: userBusinesses } = await supabase.from("businesses").select("id").eq("owner_id", req.user.id);

			const businessIds = userBusinesses?.map((b) => b.id) || [];
			if (businessIds.length > 0) {
				query = query.in("business_id", businessIds);
			} else {
				// If no businesses, only show approved reviews
				query = query.eq("status", "approved");
			}
		}
		// Admins can see all reviews (no additional filter)

		// Apply specific filters
		if (queryParams.businessId) {
			query = query.eq("business_id", queryParams.businessId);
		}

		if (queryParams.userId) {
			// Only allow if admin or the user themselves
			if (req.user?.role === "admin" || req.user?.id === queryParams.userId) {
				query = query.eq("user_id", queryParams.userId);
			} else {
				return createErrorResponse("FORBIDDEN", "Cannot access reviews for other users");
			}
		}

		if (queryParams.rating) {
			query = query.eq("rating", queryParams.rating);
		}

		if (queryParams.status && req.user?.role === "admin") {
			query = query.eq("status", queryParams.status);
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
				// For relevance, we'd need to implement a scoring algorithm
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
			logger.error("Reviews query error:", error);
			throw error;
		}

		// Calculate pagination metadata
		const total = count || 0;
		const pages = Math.ceil(total / queryParams.limit);
		const hasNext = queryParams.page < pages;
		const hasPrev = queryParams.page > 1;

		// Log search for analytics
		logger.businessMetrics({
			action: "reviews_search",
			businessId: queryParams.businessId,
			userId: req.user?.id,
			filters: {
				rating: queryParams.rating,
				status: queryParams.status,
				verified: queryParams.verified,
			},
			resultsCount: reviews?.length || 0,
			timestamp: Date.now(),
		});

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(
			{
				reviews: reviews || [],
				aggregates: {
					ratingDistribution: await getRatingDistribution(supabase, queryParams.businessId),
					averageRating: await getAverageRating(supabase, queryParams.businessId),
					totalReviews: total,
				},
			},
			{
				pagination: {
					page: queryParams.page,
					limit: queryParams.limit,
					total,
					pages,
					hasNext,
					hasPrev,
				},
				performance: {
					queryTime,
					cacheHit: false,
				},
				filters: queryParams,
			}
		);
	} catch (error) {
		logger.error("Get reviews handler error:", error);
		return createErrorResponse("FETCH_ERROR", "Failed to fetch reviews");
	}
}

/**
 * Create new review with comprehensive validation
 */
async function createReview(req: ApiRequest, reviewData: ReviewCreateData): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		if (!req.user) {
			return createErrorResponse("UNAUTHORIZED", "Authentication required");
		}

		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Check if business exists and is published
		const { data: business, error: businessError } = await supabase.from("businesses").select("id, name, status, owner_id").eq("id", reviewData.businessId).single();

		if (businessError || !business) {
			return createErrorResponse("BUSINESS_NOT_FOUND", "Business not found", undefined, 404);
		}

		if (business.status !== "published") {
			return createErrorResponse("BUSINESS_NOT_AVAILABLE", "Cannot review unpublished businesses");
		}

		// Prevent business owners from reviewing their own businesses
		if (business.owner_id === req.user.id) {
			return createErrorResponse("SELF_REVIEW_FORBIDDEN", "Cannot review your own business");
		}

		// Check if user has already reviewed this business
		const { data: existingReview } = await supabase.from("reviews").select("id").eq("business_id", reviewData.businessId).eq("user_id", req.user.id).single();

		if (existingReview) {
			return createErrorResponse("DUPLICATE_REVIEW", "You have already reviewed this business");
		}

		// Content moderation - check for inappropriate content
		const moderationResult = await moderateContent(reviewData.title + " " + reviewData.text);
		const needsModeration = moderationResult.flagged;

		// Create review record
		const now = new Date().toISOString();
		const { data: review, error: reviewError } = await supabase
			.from("reviews")
			.insert({
				business_id: reviewData.businessId,
				user_id: req.user.id,
				rating: reviewData.rating,
				title: reviewData.title,
				text: reviewData.text,
				verified_purchase: reviewData.verifiedPurchase,
				anonymous: reviewData.anonymous,
				visit_date: reviewData.visitDate,
				aspects: reviewData.aspects,
				recommend_to_friends: reviewData.recommendToFriends,
				would_return_again: reviewData.wouldReturnAgain,
				status: needsModeration ? "pending" : "approved",
				helpful_count: 0,
				report_count: 0,
				created_at: now,
				updated_at: now,
				moderation_score: moderationResult.score,
				moderation_flags: moderationResult.flags,
			})
			.select()
			.single();

		if (reviewError) {
			logger.error("Review creation error:", reviewError);
			throw reviewError;
		}

		// Add review photos if provided
		if (reviewData.photos && reviewData.photos.length > 0) {
			const photoData = reviewData.photos.map((photo, index) => ({
				review_id: review.id,
				url: photo.url,
				alt_text: photo.alt_text,
				caption: photo.caption,
				order: index + 1,
				created_at: now,
			}));

			await supabase.from("review_photos").insert(photoData);
		}

		// Update business rating and review count
		await updateBusinessRatingStats(supabase, reviewData.businessId);

		// Update user review statistics
		await updateUserReviewStats(supabase, req.user.id);

		// Send notifications
		try {
			// Notify business owner
			await supabase.functions.invoke("send-review-notification", {
				body: {
					reviewId: review.id,
					businessId: reviewData.businessId,
					businessName: business.name,
					rating: reviewData.rating,
					reviewerName: reviewData.anonymous ? "Anonymous" : req.user.email,
				},
			});
		} catch (notificationError) {
			logger.warn("Failed to send review notification:", notificationError);
		}

		// Log review creation
		logger.businessMetrics({
			action: "review_created",
			reviewId: review.id,
			businessId: reviewData.businessId,
			businessName: business.name,
			userId: req.user.id,
			rating: reviewData.rating,
			hasPhotos: (reviewData.photos?.length || 0) > 0,
			verifiedPurchase: reviewData.verifiedPurchase,
			needsModeration,
			timestamp: Date.now(),
		});

		const responseData = {
			review: {
				...review,
				photos: reviewData.photos || [],
			},
			message: needsModeration ? "Review submitted and is pending moderation" : "Review submitted successfully",
			status: needsModeration ? "pending_moderation" : "published",
		};

		return createSuccessResponse(
			responseData,
			{
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: false,
				},
			},
			201
		);
	} catch (error) {
		logger.error("Create review handler error:", error);
		return createErrorResponse("CREATION_ERROR", "Failed to create review");
	}
}

/**
 * Update business rating and review count after review changes
 */
async function updateBusinessRatingStats(supabase: any, businessId: string) {
	try {
		const { data: reviews } = await supabase.from("reviews").select("rating").eq("business_id", businessId).eq("status", "approved");

		if (reviews && reviews.length > 0) {
			const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
			const averageRating = +(totalRating / reviews.length).toFixed(2);

			await supabase
				.from("businesses")
				.update({
					rating: averageRating,
					review_count: reviews.length,
					updated_at: new Date().toISOString(),
				})
				.eq("id", businessId);
		}
	} catch (error) {
		logger.error("Failed to update business rating stats:", error);
	}
}

/**
 * Update user review statistics
 */
async function updateUserReviewStats(supabase: any, userId: string) {
	try {
		const { data: userReviews } = await supabase.from("reviews").select("id, helpful_count").eq("user_id", userId).eq("status", "approved");

		const totalReviews = userReviews?.length || 0;
		const totalHelpfulVotes = userReviews?.reduce((sum: number, review: any) => sum + (review.helpful_count || 0), 0) || 0;

		// Calculate reviewer level based on activity
		let reviewerLevel = "beginner";
		if (totalReviews >= 50 && totalHelpfulVotes >= 100) {
			reviewerLevel = "expert";
		} else if (totalReviews >= 20 && totalHelpfulVotes >= 50) {
			reviewerLevel = "advanced";
		} else if (totalReviews >= 5) {
			reviewerLevel = "intermediate";
		}

		await supabase
			.from("user_profiles")
			.update({
				total_reviews: totalReviews,
				helpful_votes_received: totalHelpfulVotes,
				reviewer_level: reviewerLevel,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId);
	} catch (error) {
		logger.error("Failed to update user review stats:", error);
	}
}

/**
 * Content moderation using AI/ML services
 */
async function moderateContent(text: string): Promise<{
	flagged: boolean;
	score: number;
	flags: string[];
}> {
	try {
		// This would integrate with content moderation services like OpenAI Moderation API
		// For now, implement basic keyword filtering
		const inappropriateWords = ["spam", "fake", "scam"]; // Add more as needed
		const lowercaseText = text.toLowerCase();

		const flags = inappropriateWords.filter((word) => lowercaseText.includes(word));
		const flagged = flags.length > 0;
		const score = flagged ? 0.8 : 0.1;

		return { flagged, score, flags };
	} catch (error) {
		logger.error("Content moderation error:", error);
		// Default to requiring moderation if service fails
		return { flagged: true, score: 0.9, flags: ["moderation_service_error"] };
	}
}

/**
 * Get rating distribution for a business
 */
async function getRatingDistribution(supabase: any, businessId?: string) {
	if (!businessId) return null;

	const { data: reviews } = await supabase.from("reviews").select("rating").eq("business_id", businessId).eq("status", "approved");

	if (!reviews || reviews.length === 0) {
		return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
	}

	return reviews.reduce(
		(acc: any, review: any) => {
			acc[review.rating] = (acc[review.rating] || 0) + 1;
			return acc;
		},
		{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
	);
}

/**
 * Get average rating for a business
 */
async function getAverageRating(supabase: any, businessId?: string) {
	if (!businessId) return null;

	const { data: reviews } = await supabase.from("reviews").select("rating").eq("business_id", businessId).eq("status", "approved");

	if (!reviews || reviews.length === 0) return 0;

	const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
	return +(totalRating / reviews.length).toFixed(2);
}

// Export GET handler with caching
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getReviews, {
		ttl: 300, // 5 minutes
		keyGenerator: (req) => `reviews:${req.nextUrl.search}:${req.user?.id || "anonymous"}`,
	}),
	withValidation(getReviews, reviewQuerySchema)
);

// Export POST handler with authentication
export const POST = compose(withPerformanceMonitoring, withAuth(createReview, { requireEmailVerification: true }), withValidation(createReview, reviewCreateSchema));

// Export response types
export type ReviewsResponse = {
	success: true;
	data: {
		reviews: any[];
		aggregates: {
			ratingDistribution: Record<string, number> | null;
			averageRating: number | null;
			totalReviews: number;
		};
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
