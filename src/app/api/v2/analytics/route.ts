/**
 * V2 Analytics Endpoint
 * Comprehensive analytics and business intelligence
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, ApiRequest } from "@lib/api/middleware";

// Analytics query validation schema
const analyticsQuerySchema = z.object({
	type: z.enum(["overview", "businesses", "users", "reviews", "search", "performance"]).default("overview"),
	period: z.enum(["1d", "7d", "30d", "90d", "1y", "all"]).default("30d"),
	granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
	businessId: z.string().uuid().optional(),
	userId: z.string().uuid().optional(),
	category: z.string().optional(),
	location: z
		.object({
			city: z.string().optional(),
			state: z.string().optional(),
			country: z.string().optional(),
		})
		.optional(),
	metrics: z.array(z.enum(["views", "clicks", "calls", "directions", "website_clicks", "photo_views", "review_submissions", "searches", "conversions", "bounce_rate", "session_duration", "page_views"])).optional(),
	compare: z.boolean().optional().default(false),
	compareperiod: z.enum(["previous", "previous_year"]).optional().default("previous"),
});

type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

/**
 * Get comprehensive analytics data
 */
async function getAnalytics(req: ApiRequest, queryParams: AnalyticsQuery): Promise<NextResponse> {
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

		// Calculate date ranges
		const now = new Date();
		const periods = {
			"1d": 1,
			"7d": 7,
			"30d": 30,
			"90d": 90,
			"1y": 365,
			all: null,
		};

		const daysBack = periods[queryParams.period];
		const startDate = daysBack ? new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000) : new Date("2020-01-01");
		const endDate = now;

		// Compare period dates
		let compareStartDate: Date | null = null;
		let compareEndDate: Date | null = null;

		if (queryParams.compare && daysBack) {
			if (queryParams.compareperiod === "previous_year") {
				compareStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000);
				compareEndDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
			} else {
				const periodLength = endDate.getTime() - startDate.getTime();
				compareEndDate = new Date(startDate.getTime());
				compareStartDate = new Date(startDate.getTime() - periodLength);
			}
		}

		// Check permissions - business owners can only see their own data
		let businessFilter: string[] = [];
		if (req.user.role === "business_owner") {
			const { data: userBusinesses } = await supabase.from("businesses").select("id").eq("owner_id", req.user.id);

			businessFilter = userBusinesses?.map((b) => b.id) || [];

			if (businessFilter.length === 0) {
				return createErrorResponse("NO_BUSINESSES", "No businesses found for this user");
			}
		} else if (queryParams.businessId && req.user.role !== "admin") {
			// Non-admin users can only access their own businesses
			const { data: business } = await supabase.from("businesses").select("owner_id").eq("id", queryParams.businessId).single();

			if (!business || business.owner_id !== req.user.id) {
				return createErrorResponse("FORBIDDEN", "Access denied to this business analytics");
			}

			businessFilter = [queryParams.businessId];
		}

		let analyticsData: any = {};

		// Generate analytics based on type
		switch (queryParams.type) {
			case "overview":
				analyticsData = await getOverviewAnalytics(supabase, startDate, endDate, businessFilter, compareStartDate, compareEndDate);
				break;

			case "businesses":
				analyticsData = await getBusinessAnalytics(supabase, startDate, endDate, businessFilter, queryParams);
				break;

			case "users":
				if (req.user.role !== "admin") {
					return createErrorResponse("FORBIDDEN", "Admin access required for user analytics");
				}
				analyticsData = await getUserAnalytics(supabase, startDate, endDate, queryParams);
				break;

			case "reviews":
				analyticsData = await getReviewAnalytics(supabase, startDate, endDate, businessFilter, queryParams);
				break;

			case "search":
				if (req.user.role !== "admin") {
					return createErrorResponse("FORBIDDEN", "Admin access required for search analytics");
				}
				analyticsData = await getSearchAnalytics(supabase, startDate, endDate, queryParams);
				break;

			case "performance":
				analyticsData = await getPerformanceAnalytics(supabase, startDate, endDate, businessFilter, queryParams);
				break;
		}

		// Add metadata
		const responseData = {
			analytics: analyticsData,
			metadata: {
				period: queryParams.period,
				granularity: queryParams.granularity,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				compareEnabled: queryParams.compare,
				compareStartDate: compareStartDate?.toISOString(),
				compareEndDate: compareEndDate?.toISOString(),
				timezone: "UTC",
				generatedAt: now.toISOString(),
			},
		};

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(responseData, {
			performance: {
				queryTime,
				cacheHit: false,
			},
		});
	} catch (error) {
		logger.error("Analytics handler error:", error);
		return createErrorResponse("ANALYTICS_ERROR", "Failed to fetch analytics data");
	}
}

/**
 * Get overview analytics with key metrics
 */
async function getOverviewAnalytics(supabase: any, startDate: Date, endDate: Date, businessFilter: string[], compareStartDate?: Date | null, compareEndDate?: Date | null) {
	// const baseFilter = businessFilter.length > 0 ? `business_id.in.(${businessFilter.join(",")})` : "";
	// TODO: Use baseFilter when implementing business filtering

	// Current period metrics
	const currentMetrics = await Promise.all([
		// Total businesses
		supabase
			.from("businesses")
			.select("id", { count: "exact", head: true })
			.gte("created_at", startDate.toISOString())
			.lte("created_at", endDate.toISOString())
			.then((r: any) => r.count || 0),

		// Total views
		supabase
			.from("business_metrics")
			.select("views_today", { count: "exact" })
			.gte("updated_at", startDate.toISOString())
			.lte("updated_at", endDate.toISOString())
			.then((r: any) => r.data?.reduce((sum: number, item: any) => sum + (item.views_today || 0), 0) || 0),

		// Total reviews
		supabase
			.from("reviews")
			.select("id", { count: "exact", head: true })
			.gte("created_at", startDate.toISOString())
			.lte("created_at", endDate.toISOString())
			.then((r: any) => r.count || 0),

		// Average rating
		supabase
			.from("businesses")
			.select("rating")
			.gt("rating", 0)
			.then((r: any) => {
				if (!r.data?.length) return 0;
				const sum = r.data.reduce((acc: number, b: any) => acc + (b.rating || 0), 0);
				return +(sum / r.data.length).toFixed(2);
			}),
	]);

	let compareMetrics = null;
	if (compareStartDate && compareEndDate) {
		compareMetrics = await Promise.all([
			// Previous period businesses
			supabase
				.from("businesses")
				.select("id", { count: "exact", head: true })
				.gte("created_at", compareStartDate.toISOString())
				.lte("created_at", compareEndDate.toISOString())
				.then((r: any) => r.count || 0),

			// Previous period views
			supabase
				.from("business_metrics")
				.select("views_today", { count: "exact" })
				.gte("updated_at", compareStartDate.toISOString())
				.lte("updated_at", compareEndDate.toISOString())
				.then((r: any) => r.data?.reduce((sum: number, item: any) => sum + (item.views_today || 0), 0) || 0),

			// Previous period reviews
			supabase
				.from("reviews")
				.select("id", { count: "exact", head: true })
				.gte("created_at", compareStartDate.toISOString())
				.lte("created_at", compareEndDate.toISOString())
				.then((r: any) => r.count || 0),
		]);
	}

	// Calculate percentage changes
	const calculateChange = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return +(((current - previous) / previous) * 100).toFixed(2);
	};

	return {
		summary: {
			totalBusinesses: {
				value: currentMetrics[0],
				change: compareMetrics ? calculateChange(currentMetrics[0], compareMetrics[0]) : null,
			},
			totalViews: {
				value: currentMetrics[1],
				change: compareMetrics ? calculateChange(currentMetrics[1], compareMetrics[1]) : null,
			},
			totalReviews: {
				value: currentMetrics[2],
				change: compareMetrics ? calculateChange(currentMetrics[2], compareMetrics[2]) : null,
			},
			averageRating: {
				value: currentMetrics[3],
				change: null, // Rating change calculation would be more complex
			},
		},
		topCategories: await getTopCategories(supabase, startDate, endDate),
		topLocations: await getTopLocations(supabase, startDate, endDate),
		recentActivity: await getRecentActivity(supabase, businessFilter),
	};
}

/**
 * Get business-specific analytics
 */
async function getBusinessAnalytics(supabase: any, startDate: Date, endDate: Date, businessFilter: string[], queryParams: AnalyticsQuery) {
	let query = supabase
		.from("business_metrics")
		.select(
			`
      business_id,
      views_today,
      views_this_week,
      views_this_month,
      clicks_today,
      calls_today,
      directions_today,
      updated_at,
      businesses(name, slug, rating, review_count)
    `
		)
		.gte("updated_at", startDate.toISOString())
		.lte("updated_at", endDate.toISOString());

	if (businessFilter.length > 0) {
		query = query.in("business_id", businessFilter);
	}

	if (queryParams.businessId) {
		query = query.eq("business_id", queryParams.businessId);
	}

	const { data: metrics } = await query;

	// Aggregate metrics by business
	const businessStats = (metrics || []).reduce((acc: any, metric: any) => {
		const businessId = metric.business_id;
		if (!acc[businessId]) {
			acc[businessId] = {
				businessId,
				businessName: metric.businesses?.name,
				businessSlug: metric.businesses?.slug,
				rating: metric.businesses?.rating,
				reviewCount: metric.businesses?.review_count,
				totalViews: 0,
				totalClicks: 0,
				totalCalls: 0,
				totalDirections: 0,
			};
		}

		acc[businessId].totalViews += metric.views_today || 0;
		acc[businessId].totalClicks += metric.clicks_today || 0;
		acc[businessId].totalCalls += metric.calls_today || 0;
		acc[businessId].totalDirections += metric.directions_today || 0;

		return acc;
	}, {});

	return {
		businesses: Object.values(businessStats),
		summary: {
			totalBusinesses: Object.keys(businessStats).length,
			totalViews: Object.values(businessStats).reduce((sum: number, b: any) => sum + b.totalViews, 0),
			totalInteractions: Object.values(businessStats).reduce((sum: number, b: any) => sum + b.totalClicks + b.totalCalls + b.totalDirections, 0),
		},
	};
}

/**
 * Get review analytics
 */
async function getReviewAnalytics(supabase: any, startDate: Date, endDate: Date, businessFilter: string[], queryParams: AnalyticsQuery) {
	let query = supabase
		.from("reviews")
		.select(
			`
      id,
      rating,
      business_id,
      created_at,
      status,
      businesses(name, slug)
    `
		)
		.gte("created_at", startDate.toISOString())
		.lte("created_at", endDate.toISOString());

	if (businessFilter.length > 0) {
		query = query.in("business_id", businessFilter);
	}

	const { data: reviews } = await query;

	// Calculate review metrics
	const totalReviews = reviews?.length || 0;
	const averageRating = reviews?.length ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0;

	const ratingDistribution = {
		5: reviews?.filter((r) => r.rating === 5).length || 0,
		4: reviews?.filter((r) => r.rating === 4).length || 0,
		3: reviews?.filter((r) => r.rating === 3).length || 0,
		2: reviews?.filter((r) => r.rating === 2).length || 0,
		1: reviews?.filter((r) => r.rating === 1).length || 0,
	};

	return {
		summary: {
			totalReviews,
			averageRating,
			ratingDistribution,
		},
		topRatedBusinesses: await getTopRatedBusinesses(supabase, businessFilter),
		recentReviews: reviews?.slice(0, 10) || [],
	};
}

/**
 * Get performance analytics
 */
async function getPerformanceAnalytics(supabase: any, startDate: Date, endDate: Date, businessFilter: string[], queryParams: AnalyticsQuery) {
	// This would include API performance, page load times, etc.
	// For now, return basic metrics
	return {
		summary: {
			apiResponseTime: "150ms",
			pageLoadTime: "2.1s",
			uptime: "99.9%",
			errorRate: "0.1%",
		},
		trends: {
			// Time series data would go here
		},
	};
}

// Helper functions
async function getTopCategories(supabase: any, startDate: Date, endDate: Date) {
	const { data } = await supabase
		.from("business_categories")
		.select(
			`
      category:categories(name, slug),
      businesses!inner(created_at)
    `
		)
		.gte("businesses.created_at", startDate.toISOString())
		.lte("businesses.created_at", endDate.toISOString());

	// Group and count by category
	const categoryCount = (data || []).reduce((acc: any, item: any) => {
		const categoryName = item.category?.name;
		if (categoryName) {
			acc[categoryName] = (acc[categoryName] || 0) + 1;
		}
		return acc;
	}, {});

	return Object.entries(categoryCount)
		.sort(([, a]: any, [, b]: any) => b - a)
		.slice(0, 10)
		.map(([name, count]) => ({ name, count }));
}

async function getTopLocations(supabase: any, startDate: Date, endDate: Date) {
	const { data } = await supabase.from("businesses").select("city, state").gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());

	const locationCount = (data || []).reduce((acc: any, business: any) => {
		const location = `${business.city}, ${business.state}`;
		acc[location] = (acc[location] || 0) + 1;
		return acc;
	}, {});

	return Object.entries(locationCount)
		.sort(([, a]: any, [, b]: any) => b - a)
		.slice(0, 10)
		.map(([location, count]) => ({ location, count }));
}

async function getRecentActivity(supabase: any, businessFilter: string[]) {
	// Get recent business creations, reviews, etc.
	let businessQuery = supabase.from("businesses").select("id, name, created_at, status").order("created_at", { ascending: false }).limit(5);

	if (businessFilter.length > 0) {
		businessQuery = businessQuery.in("id", businessFilter);
	}

	const { data: recentBusinesses } = await businessQuery;

	return {
		recentBusinesses: recentBusinesses || [],
	};
}

async function getTopRatedBusinesses(supabase: any, businessFilter: string[]) {
	let query = supabase.from("businesses").select("id, name, slug, rating, review_count").gt("rating", 0).gt("review_count", 0).order("rating", { ascending: false }).order("review_count", { ascending: false }).limit(10);

	if (businessFilter.length > 0) {
		query = query.in("id", businessFilter);
	}

	const { data } = await query;
	return data || [];
}

async function getUserAnalytics(supabase: any, startDate: Date, endDate: Date, queryParams: AnalyticsQuery) {
	// Admin-only user analytics
	const { data: users, count } = await supabase.from("user_profiles").select("id, created_at, role, last_login_at", { count: "exact" }).gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());

	return {
		summary: {
			totalUsers: count || 0,
			newUsers: users?.length || 0,
			activeUsers: users?.filter((u) => u.last_login_at && new Date(u.last_login_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
		},
		usersByRole: users?.reduce((acc: any, user: any) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		}, {}),
	};
}

async function getSearchAnalytics(supabase: any, startDate: Date, endDate: Date, queryParams: AnalyticsQuery) {
	// This would require a search_logs table to track searches
	// For now, return placeholder data
	return {
		summary: {
			totalSearches: 0,
			uniqueQueries: 0,
			averageResultsPerSearch: 0,
		},
		topQueries: [],
		noResultsQueries: [],
	};
}

// Export GET handler with caching and authentication
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getAnalytics, {
		ttl: 600, // 10 minutes for analytics data
		keyGenerator: (req) => `analytics:${req.user?.id}:${req.nextUrl.search}`,
	}),
	withAuth(getAnalytics, {
		requiredRoles: ["admin", "business_owner"],
		requireEmailVerification: true,
	}),
	withValidation(getAnalytics, analyticsQuerySchema)
);

// Export response type
export type AnalyticsResponse = {
	success: true;
	data: {
		analytics: any;
		metadata: {
			period: string;
			granularity: string;
			startDate: string;
			endDate: string;
			compareEnabled: boolean;
			compareStartDate?: string;
			compareEndDate?: string;
			timezone: string;
			generatedAt: string;
		};
	};
	meta: {
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	};
	timestamp: string;
};
