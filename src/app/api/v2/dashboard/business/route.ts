/**
 * Business Dashboard API Endpoint
 * Provides comprehensive business owner dashboard data
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { logger } from "@utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, type ApiRequest } from "@lib/api/middleware";
import { dashboardDemoBusinessFlag } from "@/lib/flags/definitions";

// Business dashboard query validation schema
const businessDashboardQuerySchema = z.object({
	sections: z
		.array(z.enum(["stats", "analytics", "reviews", "photos", "performance", "revenue"]))
		.optional()
		.default(["stats", "analytics", "reviews"]),
	period: z.enum(["7d", "30d", "90d"]).default("30d"),
	limit: z.number().min(1).max(100).default(10),
	businessId: z.string().uuid().optional(),
});

type BusinessDashboardQuery = z.infer<typeof businessDashboardQuerySchema>;

/**
 * Get comprehensive business dashboard data
 */
async function getBusinessDashboard(req: ApiRequest, queryParams: BusinessDashboardQuery): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		if (!req.user && !req.demoMode) {
			return createErrorResponse("UNAUTHORIZED", "Authentication required");
		}

		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Demo short-circuit
		if (req.demoMode) {
			const demoData = createBusinessDemoData(queryParams);
			return createSuccessResponse({
				dashboard: demoData,
				metadata: {
					businessId: "demo-business",
					userId: "demo-user",
					period: queryParams.period,
					sections: queryParams.sections,
					generatedAt: new Date().toISOString(),
					demo: true,
				},
			});
		}

		// Find user's business or use provided ID
		let businessId = queryParams.businessId;

		if (!businessId) {
			const { data: userBusiness } = await supabase.from("businesses").select("id").eq("owner_id", req.user.id).single();

			if (!userBusiness) {
				return createErrorResponse("NOT_FOUND", "No business found for this user");
			}

			businessId = userBusiness.id;
		}

		// Verify ownership or admin access
		if (req.user.role !== "admin") {
			const { data: business } = await supabase.from("businesses").select("owner_id").eq("id", businessId).single();

			if (!business || business.owner_id !== req.user.id) {
				return createErrorResponse("FORBIDDEN", "Access denied to this business");
			}
		}

		// Calculate date range for metrics
		const now = new Date();
		const periodDays = { "7d": 7, "30d": 30, "90d": 90 }[queryParams.period];
		const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

		const dashboardData: any = {};

		// Fetch business stats if requested
		if (queryParams.sections.includes("stats")) {
			const statsStart = performance.now();

			// Get business views
			const { data: businessViews } = await supabase.from("business_analytics").select("views, calls, directions, website_clicks").eq("business_id", businessId).gte("date", startDate.toISOString().split("T")[0]);

			// Get reviews count
			const { data: reviews } = await supabase.from("reviews").select("id, rating, created_at").eq("business_id", businessId).gte("created_at", startDate.toISOString());

			// Get photo views
			const { data: photoViews } = await supabase.from("business_photo_analytics").select("views").eq("business_id", businessId).gte("date", startDate.toISOString().split("T")[0]);

			// Calculate previous period for comparison
			const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

			const { data: prevBusinessViews } = await supabase.from("business_analytics").select("views, calls, directions, website_clicks").eq("business_id", businessId).gte("date", prevStartDate.toISOString().split("T")[0]).lt("date", startDate.toISOString().split("T")[0]);

			const { data: prevReviews } = await supabase.from("reviews").select("id").eq("business_id", businessId).gte("created_at", prevStartDate.toISOString()).lt("created_at", startDate.toISOString());

			// Calculate metrics
			const currentViews = businessViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const prevViews = prevBusinessViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const viewsChange = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;

			const currentCalls = businessViews?.reduce((sum, record) => sum + (record.calls || 0), 0) || 0;
			const prevCalls = prevBusinessViews?.reduce((sum, record) => sum + (record.calls || 0), 0) || 0;
			const callsChange = currentCalls - prevCalls;

			const currentDirections = businessViews?.reduce((sum, record) => sum + (record.directions || 0), 0) || 0;
			const prevDirections = prevBusinessViews?.reduce((sum, record) => sum + (record.directions || 0), 0) || 0;
			const directionsChange = currentDirections - prevDirections;

			const currentWebsiteClicks = businessViews?.reduce((sum, record) => sum + (record.website_clicks || 0), 0) || 0;
			const prevWebsiteClicks = prevBusinessViews?.reduce((sum, record) => sum + (record.website_clicks || 0), 0) || 0;
			const websiteClicksChange = currentWebsiteClicks - prevWebsiteClicks;

			const currentReviews = reviews?.length || 0;
			const prevReviewsCount = prevReviews?.length || 0;
			const reviewsChange = currentReviews - prevReviewsCount;

			const averageRating = reviews?.length > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0;

			dashboardData.stats = {
				views: {
					value: currentViews.toLocaleString(),
					change: viewsChange > 0 ? `+${viewsChange.toFixed(1)}%` : `${viewsChange.toFixed(1)}%`,
					trend: viewsChange >= 0 ? "up" : "down",
					description: `Profile views in last ${queryParams.period}`,
				},
				calls: {
					value: currentCalls.toString(),
					change: callsChange > 0 ? `+${callsChange}` : callsChange.toString(),
					trend: callsChange >= 0 ? "up" : "down",
					description: `Phone calls in last ${queryParams.period}`,
				},
				directions: {
					value: currentDirections.toString(),
					change: directionsChange > 0 ? `+${directionsChange}` : directionsChange.toString(),
					trend: directionsChange >= 0 ? "up" : "down",
					description: `Direction requests in last ${queryParams.period}`,
				},
				websiteClicks: {
					value: currentWebsiteClicks.toString(),
					change: websiteClicksChange > 0 ? `+${websiteClicksChange}` : websiteClicksChange.toString(),
					trend: websiteClicksChange >= 0 ? "up" : "down",
					description: `Website clicks in last ${queryParams.period}`,
				},
				reviews: {
					value: currentReviews.toString(),
					change: reviewsChange > 0 ? `+${reviewsChange}` : reviewsChange.toString(),
					trend: reviewsChange >= 0 ? "up" : "down",
					description: `New reviews in last ${queryParams.period}`,
					averageRating: averageRating.toFixed(1),
				},
			};

			const statsTime = performance.now() - statsStart;
			logger.performance(`Business stats calculation completed in ${statsTime.toFixed(2)}ms`);
		}

		// Fetch analytics data if requested
		if (queryParams.sections.includes("analytics")) {
			const analyticsStart = performance.now();

			const { data: analyticsData } = await supabase.from("business_analytics").select("*").eq("business_id", businessId).gte("date", startDate.toISOString().split("T")[0]).order("date", { ascending: true });

			dashboardData.analytics = analyticsData || [];

			const analyticsTime = performance.now() - analyticsStart;
			logger.performance(`Business analytics fetch completed in ${analyticsTime.toFixed(2)}ms`);
		}

		// Fetch reviews if requested
		if (queryParams.sections.includes("reviews")) {
			const reviewsStart = performance.now();

			const { data: recentReviews } = await supabase
				.from("reviews")
				.select(
					`
          id,
          rating,
          text,
          created_at,
          helpful_count,
          status,
          users(name, avatar_url)
        `
				)
				.eq("business_id", businessId)
				.order("created_at", { ascending: false })
				.limit(queryParams.limit);

			dashboardData.reviews = recentReviews || [];

			const reviewsTime = performance.now() - reviewsStart;
			logger.performance(`Business reviews fetch completed in ${reviewsTime.toFixed(2)}ms`);
		}

		// Fetch photos if requested
		if (queryParams.sections.includes("photos")) {
			const photosStart = performance.now();

			const { data: businessPhotos } = await supabase.from("business_photos").select("*").eq("business_id", businessId).order("is_primary", { ascending: false }).order("created_at", { ascending: false });

			dashboardData.photos = businessPhotos || [];

			const photosTime = performance.now() - photosStart;
			logger.performance(`Business photos fetch completed in ${photosTime.toFixed(2)}ms`);
		}

		// Fetch performance metrics if requested
		if (queryParams.sections.includes("performance")) {
			const performanceStart = performance.now();

			// Calculate performance score based on various factors
			const { data: performanceMetrics } = await supabase.from("business_performance").select("*").eq("business_id", businessId).order("date", { ascending: false }).limit(30);

			const performanceScore = calculatePerformanceScore(performanceMetrics, dashboardData);

			dashboardData.performance = {
				score: performanceScore,
				metrics: performanceMetrics?.slice(0, 7) || [],
				trends: calculatePerformanceTrends(performanceMetrics),
			};

			const performanceTime = performance.now() - performanceStart;
			logger.performance(`Business performance calculation completed in ${performanceTime.toFixed(2)}ms`);
		}

		// Fetch revenue data if requested (for subscription-based businesses)
		if (queryParams.sections.includes("revenue")) {
			const revenueStart = performance.now();

			const { data: subscriptions } = await supabase
				.from("subscriptions")
				.select(
					`
          id,
          amount,
          status,
          created_at,
          subscription_plans(name, price, features)
        `
				)
				.eq("business_id", businessId)
				.eq("status", "active");

			const { data: payments } = await supabase.from("payments").select("*").eq("business_id", businessId).gte("created_at", startDate.toISOString()).eq("status", "completed");

			const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
			const activeSubscriptions = subscriptions?.length || 0;

			dashboardData.revenue = {
				totalRevenue,
				activeSubscriptions,
				subscriptions: subscriptions || [],
				recentPayments: payments || [],
			};

			const revenueTime = performance.now() - revenueStart;
			logger.performance(`Business revenue calculation completed in ${revenueTime.toFixed(2)}ms`);
		}

		const duration = performance.now() - startTime;
		logger.performance(`Business dashboard API completed in ${duration.toFixed(2)}ms`);

		return createSuccessResponse({
			dashboard: dashboardData,
			metadata: {
				businessId,
				userId: req.user.id,
				period: queryParams.period,
				sections: queryParams.sections,
				generatedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		logger.error("Business dashboard API error:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch dashboard data");
	}
}

/**
 * Calculate business performance score based on various metrics
 */
function calculatePerformanceScore(metrics: any[], dashboardData: any): number {
	if (!metrics || metrics.length === 0) return 50;

	// Factors for performance score calculation
	const factors = {
		viewsConsistency: 0.25,
		reviewsQuality: 0.25,
		responseTime: 0.2,
		photoQuality: 0.15,
		informationCompleteness: 0.15,
	};

	// Calculate each factor (simplified logic)
	const viewsScore = metrics.length > 7 ? 80 : metrics.length * 10;
	const reviewsScore = dashboardData.stats?.reviews?.averageRating ? parseFloat(dashboardData.stats.reviews.averageRating) * 20 : 50;
	const responseScore = 75; // Would calculate from actual response metrics
	const photoScore = dashboardData.photos?.length > 0 ? 85 : 30;
	const infoScore = 80; // Would calculate from profile completeness

	const totalScore = viewsScore * factors.viewsConsistency + reviewsScore * factors.reviewsQuality + responseScore * factors.responseTime + photoScore * factors.photoQuality + infoScore * factors.informationCompleteness;

	return Math.round(Math.min(100, Math.max(0, totalScore)));
}

/**
 * Calculate performance trends from metrics data
 */
function calculatePerformanceTrends(metrics: any[]): any {
	if (!metrics || metrics.length < 2) {
		return { direction: "stable", percentage: 0 };
	}

	const recent = metrics.slice(0, 7);
	const previous = metrics.slice(7, 14);

	const recentAvg = recent.reduce((sum, item) => sum + (item.score || 50), 0) / recent.length;
	const previousAvg = previous.reduce((sum, item) => sum + (item.score || 50), 0) / previous.length;

	const change = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

	return {
		direction: change > 5 ? "improving" : change < -5 ? "declining" : "stable",
		percentage: Math.abs(change),
	};
}

// Export GET handler with middleware
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getBusinessDashboard, {
		ttl: 300, // 5 minutes cache for dashboard data
		keyGenerator: (req) => `business-dashboard:${req.user?.id}:${req.nextUrl.search}`,
	}),
	withAuth(getBusinessDashboard, {
		requiredRoles: ["business_owner", "admin"],
		requireEmailVerification: false,
	}),
	withValidation(getBusinessDashboard, businessDashboardQuerySchema)
);

// Lightweight, deterministic demo data generator (no external calls)
function createBusinessDemoData(query: BusinessDashboardQuery) {
	const periodLabel = query.period;
	const seed = 42;
	const rand = (n: number) => Math.abs(Math.sin(n + seed));

	const views = Math.floor(500 + rand(1) * 1500);
	const calls = Math.floor(20 + rand(2) * 80);
	const directions = Math.floor(15 + rand(3) * 60);
	const websiteClicks = Math.floor(50 + rand(4) * 200);
	const reviewsCount = Math.floor(5 + rand(5) * 30);
	const averageRating = (3.8 + rand(6) * 1.2).toFixed(1);

	const days = { "7d": 7, "30d": 30, "90d": 30 }[periodLabel];
	const analytics = Array.from({ length: days }, (_, i) => ({
		date: new Date(Date.now() - (days - i) * 86400000).toISOString().split("T")[0],
		views: Math.floor(200 + rand(i) * 400),
		calls: Math.floor(5 + rand(i + 10) * 20),
		directions: Math.floor(3 + rand(i + 20) * 15),
		website_clicks: Math.floor(10 + rand(i + 30) * 40),
	}));

	const reviews = Array.from({ length: Math.min(reviewsCount, query.limit) }, (_, i) => ({
		id: `rev_${i}`,
		rating: Math.round(3 + rand(i + 40) * 2),
		text: "Great service and quick response!",
		created_at: new Date(Date.now() - i * 86400000).toISOString(),
		helpful_count: Math.floor(rand(i + 50) * 10),
		status: "approved",
		users: { name: `User ${i + 1}`, avatar_url: null },
	}));

	const photos = Array.from({ length: 6 }, (_, i) => ({
		id: `photo_${i}`,
		url: `/placeholder-business.svg`,
		alt_text: `Demo photo ${i + 1}`,
		is_primary: i === 0,
		created_at: new Date(Date.now() - i * 3600000).toISOString(),
	}));

	const performance = {
		score: Math.floor(60 + rand(70) * 30),
		metrics: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString(), score: Math.floor(60 + rand(i + 80) * 30) })),
		trends: { direction: "improving", percentage: 8.5 },
	};

	const revenue = {
		totalRevenue: Math.floor(views * 0.3),
		activeSubscriptions: Math.floor(5 + rand(90) * 10),
		subscriptions: [],
		recentPayments: [],
	};

	return {
		stats: {
			views: { value: views.toLocaleString(), change: "+5.2%", trend: "up", description: `Profile views in last ${periodLabel}` },
			calls: { value: calls.toString(), change: "+3", trend: "up", description: `Phone calls in last ${periodLabel}` },
			directions: { value: directions.toString(), change: "+2", trend: "up", description: `Direction requests in last ${periodLabel}` },
			websiteClicks: { value: websiteClicks.toString(), change: "+11", trend: "up", description: `Website clicks in last ${periodLabel}` },
			reviews: { value: reviewsCount.toString(), change: "+1", trend: "up", description: `New reviews in last ${periodLabel}`, averageRating },
		},
		analytics,
		reviews,
		photos,
		performance,
		revenue,
	};
}
