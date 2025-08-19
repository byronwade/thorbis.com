/**
 * Admin Dashboard API Endpoint
 * Provides comprehensive admin dashboard data with system-wide analytics
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, type ApiRequest } from "@lib/api/middleware";
import { dashboardDemoAdminFlag } from "@/lib/flags/definitions";

// Admin dashboard query validation schema
const adminDashboardQuerySchema = z.object({
	sections: z
		.array(z.enum(["overview", "users", "businesses", "revenue", "performance", "moderation"]))
		.optional()
		.default(["overview", "users", "businesses"]),
	period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
	limit: z.number().min(1).max(100).default(20),
});

type AdminDashboardQuery = z.infer<typeof adminDashboardQuerySchema>;

/**
 * Get comprehensive admin dashboard data
 */
async function getAdminDashboard(req: ApiRequest, queryParams: AdminDashboardQuery): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		if (!req.demoMode && (!req.user || req.user.role !== "admin")) {
			return createErrorResponse("FORBIDDEN", "Admin access required");
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
			const demoData = createAdminDemoData(queryParams);
			return createSuccessResponse({
				dashboard: demoData,
				metadata: {
					userId: "demo-admin",
					period: queryParams.period,
					sections: queryParams.sections,
					generatedAt: new Date().toISOString(),
					demo: true,
				},
			});
		}

		// Calculate date range for metrics
		const now = new Date();
		const periodDays = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[queryParams.period];
		const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

		const dashboardData: any = {};

		// Fetch overview stats if requested
		if (queryParams.sections.includes("overview")) {
			const overviewStart = performance.now();

			// Get total counts
			const [{ count: totalUsers }, { count: totalBusinesses }, { count: totalReviews }, { count: totalLocalHubs }, { count: activeSubscriptions }] = await Promise.all([
				supabase.from("users").select("*", { count: "exact", head: true }),
				supabase.from("businesses").select("*", { count: "exact", head: true }),
				supabase.from("reviews").select("*", { count: "exact", head: true }),
				supabase.from("local_hubs").select("*", { count: "exact", head: true }),
				supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
			]);

			// Get recent activity counts
			const [{ count: newUsersThisPeriod }, { count: newBusinessesThisPeriod }, { count: newReviewsThisPeriod }] = await Promise.all([supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", startDate.toISOString()), supabase.from("businesses").select("*", { count: "exact", head: true }).gte("created_at", startDate.toISOString()), supabase.from("reviews").select("*", { count: "exact", head: true }).gte("created_at", startDate.toISOString())]);

			// Calculate revenue
			const { data: payments } = await supabase.from("payments").select("amount").eq("status", "completed").gte("created_at", startDate.toISOString());

			const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

			dashboardData.overview = {
				totalUsers: totalUsers || 0,
				totalBusinesses: totalBusinesses || 0,
				totalReviews: totalReviews || 0,
				totalLocalHubs: totalLocalHubs || 0,
				activeSubscriptions: activeSubscriptions || 0,
				newUsersThisPeriod: newUsersThisPeriod || 0,
				newBusinessesThisPeriod: newBusinessesThisPeriod || 0,
				newReviewsThisPeriod: newReviewsThisPeriod || 0,
				totalRevenue,
				period: queryParams.period,
			};

			const overviewTime = performance.now() - overviewStart;
			logger.performance(`Admin overview calculation completed in ${overviewTime.toFixed(2)}ms`);
		}

		// Fetch user analytics if requested
		if (queryParams.sections.includes("users")) {
			const usersStart = performance.now();

			// Get user growth over time
			const { data: userGrowth } = await supabase.from("users").select("created_at, role, status").gte("created_at", startDate.toISOString()).order("created_at", { ascending: true });

			// Get user engagement metrics
			const { data: userEngagement } = await supabase.from("user_analytics").select("date, views").gte("date", startDate.toISOString().split("T")[0]).order("date", { ascending: true });

			// Get recent user activity
			const { data: recentUsers } = await supabase.from("users").select("id, name, email, role, status, created_at, last_login").order("created_at", { ascending: false }).limit(queryParams.limit);

			dashboardData.users = {
				growth: userGrowth || [],
				engagement: userEngagement || [],
				recent: recentUsers || [],
				usersByRole: calculateUsersByRole(userGrowth),
				usersByStatus: calculateUsersByStatus(userGrowth),
			};

			const usersTime = performance.now() - usersStart;
			logger.performance(`Admin users calculation completed in ${usersTime.toFixed(2)}ms`);
		}

		// Fetch business analytics if requested
		if (queryParams.sections.includes("businesses")) {
			const businessesStart = performance.now();

			// Get business growth over time
			const { data: businessGrowth } = await supabase.from("businesses").select("created_at, status, verified, rating, review_count").gte("created_at", startDate.toISOString()).order("created_at", { ascending: true });

			// Get business performance metrics
			const { data: businessMetrics } = await supabase.from("business_analytics").select("business_id, date, views, calls, directions, website_clicks").gte("date", startDate.toISOString().split("T")[0]);

			// Get top performing businesses
			const { data: topBusinesses } = await supabase.from("businesses").select("id, name, rating, review_count, verified, status").eq("status", "published").order("rating", { ascending: false }).order("review_count", { ascending: false }).limit(10);

			dashboardData.businesses = {
				growth: businessGrowth || [],
				metrics: businessMetrics || [],
				top: topBusinesses || [],
				businessesByStatus: calculateBusinessesByStatus(businessGrowth),
				avgRating: calculateAverageRating(businessGrowth),
			};

			const businessesTime = performance.now() - businessesStart;
			logger.performance(`Admin businesses calculation completed in ${businessesTime.toFixed(2)}ms`);
		}

		// Fetch revenue analytics if requested
		if (queryParams.sections.includes("revenue")) {
			const revenueStart = performance.now();

			// Get revenue over time
			const { data: revenueData } = await supabase.from("payments").select("amount, created_at, status").eq("status", "completed").gte("created_at", startDate.toISOString()).order("created_at", { ascending: true });

			// Get subscription data
			const { data: subscriptions } = await supabase
				.from("subscriptions")
				.select(
					`
          amount,
          status,
          created_at,
          subscription_plans(name, price)
        `
				)
				.gte("created_at", startDate.toISOString());

			// Calculate revenue by plan
			const revenueByPlan = calculateRevenueByPlan(subscriptions);
			const monthlyRecurringRevenue = calculateMRR(subscriptions);

			dashboardData.revenue = {
				timeline: revenueData || [],
				byPlan: revenueByPlan,
				mrr: monthlyRecurringRevenue,
				totalRevenue: revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
			};

			const revenueTime = performance.now() - revenueStart;
			logger.performance(`Admin revenue calculation completed in ${revenueTime.toFixed(2)}ms`);
		}

		// Fetch performance metrics if requested
		if (queryParams.sections.includes("performance")) {
			const performanceStart = performance.now();

			// Get system performance metrics
			const { data: systemMetrics } = await supabase.from("system_performance").select("*").gte("timestamp", startDate.toISOString()).order("timestamp", { ascending: true });

			// Get API performance metrics
			const { data: apiMetrics } = await supabase.from("api_performance").select("*").gte("timestamp", startDate.toISOString()).order("timestamp", { ascending: true });

			dashboardData.performance = {
				system: systemMetrics || [],
				api: apiMetrics || [],
				uptime: calculateUptime(systemMetrics),
				avgResponseTime: calculateAvgResponseTime(apiMetrics),
			};

			const performanceTime = performance.now() - performanceStart;
			logger.performance(`Admin performance calculation completed in ${performanceTime.toFixed(2)}ms`);
		}

		// Fetch moderation queue if requested
		if (queryParams.sections.includes("moderation")) {
			const moderationStart = performance.now();

			// Get pending reviews
			const { data: pendingReviews } = await supabase
				.from("reviews")
				.select(
					`
          id,
          text,
          rating,
          created_at,
          businesses(name),
          users(name)
        `
				)
				.eq("status", "pending")
				.order("created_at", { ascending: true })
				.limit(queryParams.limit);

			// Get flagged content
			const { data: flaggedContent } = await supabase.from("content_reports").select("*").eq("status", "pending").order("created_at", { ascending: true }).limit(queryParams.limit);

			dashboardData.moderation = {
				pendingReviews: pendingReviews || [],
				flaggedContent: flaggedContent || [],
				pendingCount: pendingReviews?.length || 0,
				flaggedCount: flaggedContent?.length || 0,
			};

			const moderationTime = performance.now() - moderationStart;
			logger.performance(`Admin moderation calculation completed in ${moderationTime.toFixed(2)}ms`);
		}

		const duration = performance.now() - startTime;
		logger.performance(`Admin dashboard API completed in ${duration.toFixed(2)}ms`);

		return createSuccessResponse({
			dashboard: dashboardData,
			metadata: {
				userId: req.user.id,
				period: queryParams.period,
				sections: queryParams.sections,
				generatedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		logger.error("Admin dashboard API error:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch dashboard data");
	}
}

/**
 * Helper functions for calculations
 */
function calculateUsersByRole(users: any[]): Record<string, number> {
	return (
		users?.reduce((acc, user) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		}, {}) || {}
	);
}

function calculateUsersByStatus(users: any[]): Record<string, number> {
	return (
		users?.reduce((acc, user) => {
			acc[user.status] = (acc[user.status] || 0) + 1;
			return acc;
		}, {}) || {}
	);
}

function calculateBusinessesByStatus(businesses: any[]): Record<string, number> {
	return (
		businesses?.reduce((acc, business) => {
			acc[business.status] = (acc[business.status] || 0) + 1;
			return acc;
		}, {}) || {}
	);
}

function calculateAverageRating(businesses: any[]): number {
	if (!businesses || businesses.length === 0) return 0;
	const ratingsSum = businesses.reduce((sum, business) => sum + (business.rating || 0), 0);
	return ratingsSum / businesses.length;
}

function calculateRevenueByPlan(subscriptions: any[]): Record<string, number> {
	return (
		subscriptions?.reduce((acc, sub) => {
			const planName = sub.subscription_plans?.name || "Unknown";
			acc[planName] = (acc[planName] || 0) + (sub.amount || 0);
			return acc;
		}, {}) || {}
	);
}

function calculateMRR(subscriptions: any[]): number {
	return subscriptions?.filter((sub) => sub.status === "active")?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
}

function calculateUptime(metrics: any[]): number {
	if (!metrics || metrics.length === 0) return 100;
	const uptimeSum = metrics.reduce((sum, metric) => sum + (metric.uptime || 100), 0);
	return uptimeSum / metrics.length;
}

function calculateAvgResponseTime(metrics: any[]): number {
	if (!metrics || metrics.length === 0) return 0;
	const responseTimeSum = metrics.reduce((sum, metric) => sum + (metric.avg_response_time || 0), 0);
	return responseTimeSum / metrics.length;
}

// Export GET handler with middleware
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getAdminDashboard, {
		ttl: 300, // 5 minutes cache for dashboard data
		keyGenerator: (req) => `admin-dashboard:${req.user?.id}:${req.nextUrl.search}`,
	}),
	withAuth(getAdminDashboard, {
		requiredRoles: ["admin"],
		requireEmailVerification: true,
	}),
	withValidation(getAdminDashboard, adminDashboardQuerySchema)
);

// Lightweight, deterministic demo data generator (no external calls)
function createAdminDemoData(query: AdminDashboardQuery) {
	const periodLabel = query.period;
	const seed = 126;
	const rand = (n: number) => Math.abs(Math.sin(n + seed));

	const totalUsers = 120000 + Math.floor(rand(1) * 5000);
	const totalBusinesses = 45000 + Math.floor(rand(2) * 3000);
	const totalReviews = 320000 + Math.floor(rand(3) * 12000);
	const totalLocalHubs = 220 + Math.floor(rand(4) * 30);
	const activeSubscriptions = 18000 + Math.floor(rand(5) * 2000);
	const totalRevenue = 2_400_000 + Math.floor(rand(6) * 200_000);

	const overview = {
		totalUsers,
		totalBusinesses,
		totalReviews,
		totalLocalHubs,
		activeSubscriptions,
		newUsersThisPeriod: Math.floor(totalUsers * 0.01),
		newBusinessesThisPeriod: Math.floor(totalBusinesses * 0.01),
		newReviewsThisPeriod: Math.floor(totalReviews * 0.02),
		totalRevenue,
		period: periodLabel,
	};

	const users = {
		growth: Array.from({ length: 12 }, (_, i) => ({ created_at: new Date(Date.now() - (11 - i) * 2629800000).toISOString(), role: "user", status: "active" })),
		engagement: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0], views: Math.floor(10000 + rand(i) * 5000) })),
		recent: Array.from({ length: Math.min(10, query.limit) }, (_, i) => ({ id: `u_${i}`, name: `User ${i + 1}`, email: `user${i + 1}@demo.com`, role: i % 5 === 0 ? "admin" : "user", status: "active", created_at: new Date(Date.now() - i * 86400000).toISOString(), last_login: new Date(Date.now() - i * 3600000).toISOString() })),
		usersByRole: { admin: 120, user: totalUsers - 120 },
		usersByStatus: { active: Math.floor(totalUsers * 0.9), inactive: Math.floor(totalUsers * 0.1) },
	};

	const businesses = {
		growth: Array.from({ length: 12 }, (_, i) => ({ created_at: new Date(Date.now() - (11 - i) * 2629800000).toISOString(), status: "published", verified: i % 2 === 0, rating: 4 - rand(i) * 0.5, review_count: Math.floor(rand(i) * 500) })),
		metrics: Array.from({ length: 30 }, (_, i) => ({ business_id: `b_${i}`, date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0], views: Math.floor(500 + rand(i) * 1000), calls: Math.floor(20 + rand(i + 10) * 40), directions: Math.floor(15 + rand(i + 20) * 30), website_clicks: Math.floor(30 + rand(i + 30) * 60) })),
		top: Array.from({ length: 10 }, (_, i) => ({ id: `tb_${i}`, name: `Top Biz ${i + 1}`, rating: (4.2 + rand(i) * 0.6).toFixed(1), review_count: 300 + Math.floor(rand(i + 40) * 500), verified: true, status: "published" })),
		businessesByStatus: { published: Math.floor(totalBusinesses * 0.8), draft: Math.floor(totalBusinesses * 0.2) },
		avgRating: 4.3,
	};

	const revenue = {
		timeline: Array.from({ length: 30 }, (_, i) => ({ amount: Math.floor(60000 + rand(i) * 25000), created_at: new Date(Date.now() - (29 - i) * 86400000).toISOString(), status: "completed" })),
		byPlan: { Starter: 120000, Growth: 340000, Scale: 890000 },
		mrr: 650000,
		totalRevenue,
	};

	const performance = {
		system: Array.from({ length: 30 }, (_, i) => ({ timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(), uptime: 99.95, cpu: Math.floor(20 + rand(i) * 30) })),
		api: Array.from({ length: 30 }, (_, i) => ({ timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(), avg_response_time: Math.floor(120 + rand(i) * 60) })),
		uptime: 99.95,
		avgResponseTime: 160,
	};

	const moderation = {
		pendingReviews: Array.from({ length: Math.min(query.limit, 10) }, (_, i) => ({ id: `rev_${i}`, text: "Pending review", rating: 3 + (i % 3), created_at: new Date().toISOString(), businesses: { name: `Biz ${i}` }, users: { name: `User ${i}` } })),
		flaggedContent: Array.from({ length: Math.min(query.limit, 10) }, (_, i) => ({ id: `flag_${i}`, reason: "Spam", status: "pending", created_at: new Date().toISOString() })),
		pendingCount: Math.min(query.limit, 10),
		flaggedCount: Math.min(query.limit, 10),
	};

	return { overview, users, businesses, revenue, performance, moderation };
}
