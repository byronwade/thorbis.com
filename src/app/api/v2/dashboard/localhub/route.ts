/**
 * LocalHub Dashboard API Endpoint
 * Provides comprehensive LocalHub directory management data
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, type ApiRequest } from "@lib/api/middleware";
import { dashboardDemoLocalhubFlag } from "@/lib/flags/definitions";

// LocalHub dashboard query validation schema
const localHubDashboardQuerySchema = z.object({
	sections: z
		.array(z.enum(["stats", "revenue", "activity", "businesses", "health"]))
		.optional()
		.default(["stats", "revenue", "activity"]),
	period: z.enum(["7d", "30d", "90d"]).default("30d"),
	limit: z.number().min(1).max(100).default(10),
	localHubId: z.string().uuid().optional(),
});

type LocalHubDashboardQuery = z.infer<typeof localHubDashboardQuerySchema>;

/**
 * Get comprehensive LocalHub dashboard data
 */
async function getLocalHubDashboard(req: ApiRequest, queryParams: LocalHubDashboardQuery): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		if (!req.user && !req.demoMode) {
			return createErrorResponse("UNAUTHORIZED", "Authentication required");
		}

		// Check if demo mode should be enabled for users without LocalHub
		const isDemoEnabled = await dashboardDemoLocalhubFlag();

		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Demo short-circuit
		if (req.demoMode) {
			const demoData = createLocalHubDemoData(queryParams);
			return createSuccessResponse({
				dashboard: demoData,
				metadata: {
					localHubId: "demo-localhub",
					userId: "demo-user",
					period: queryParams.period,
					sections: queryParams.sections,
					generatedAt: new Date().toISOString(),
					demo: true,
				},
			});
		}

		// Find user's LocalHub or use provided ID
		let localHubId = queryParams.localHubId;

		if (!localHubId && req.user) {
			const { data: userLocalHub } = await supabase.from("local_hubs").select("id").eq("owner_id", req.user.id).single();

			if (!userLocalHub) {
				// If demo mode is enabled and user has no LocalHub, return demo data
				if (isDemoEnabled) {
					const demoData = createLocalHubDemoData(queryParams);
					return createSuccessResponse({
						dashboard: demoData,
						metadata: {
							localHubId: "demo-localhub",
							userId: req.user.id,
							period: queryParams.period,
							sections: queryParams.sections,
							generatedAt: new Date().toISOString(),
							demo: true,
						},
					});
				}
				
				return createErrorResponse("NOT_FOUND", "No LocalHub found for this user");
			}

			localHubId = userLocalHub.id;
		}

		// Verify ownership or admin access
		if (req.user.role !== "admin") {
			const { data: localHub } = await supabase.from("local_hubs").select("owner_id").eq("id", localHubId).single();

			if (!localHub || localHub.owner_id !== req.user.id) {
				return createErrorResponse("FORBIDDEN", "Access denied to this LocalHub");
			}
		}

		// Calculate date range for metrics
		const now = new Date();
		const periodDays = { "7d": 7, "30d": 30, "90d": 90 }[queryParams.period];
		const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

		const dashboardData: any = {};

		// Fetch directory stats if requested
		if (queryParams.sections.includes("stats")) {
			const statsStart = performance.now();

			// Get active businesses count
			const { data: activeBusinesses } = await supabase.from("local_hub_businesses").select("id, businesses!inner(status)").eq("local_hub_id", localHubId).eq("businesses.status", "published");

			// Get directory views
			const { data: directoryViews } = await supabase.from("local_hub_analytics").select("views").eq("local_hub_id", localHubId).gte("date", startDate.toISOString().split("T")[0]);

			// Get previous period for comparison
			const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

			const { data: prevActiveBusinesses } = await supabase.from("local_hub_businesses").select("id").eq("local_hub_id", localHubId).lt("created_at", startDate.toISOString());

			const { data: prevDirectoryViews } = await supabase.from("local_hub_analytics").select("views").eq("local_hub_id", localHubId).gte("date", prevStartDate.toISOString().split("T")[0]).lt("date", startDate.toISOString().split("T")[0]);

			// Calculate metrics
			const currentBusinesses = activeBusinesses?.length || 0;
			const prevBusinesses = prevActiveBusinesses?.length || 0;
			const businessesChange = currentBusinesses - prevBusinesses;

			const currentViews = directoryViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const prevViews = prevDirectoryViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const viewsChange = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;

			dashboardData.stats = {
				activeBusinesses: {
					value: currentBusinesses,
					change: businessesChange,
					changeType: businessesChange >= 0 ? "positive" : "negative",
				},
				directoryViews: {
					value: currentViews,
					change: viewsChange,
					changeType: viewsChange >= 0 ? "positive" : "negative",
				},
			};

			const statsTime = performance.now() - statsStart;
			logger.performance(`LocalHub stats calculation completed in ${statsTime.toFixed(2)}ms`);
		}

		// Fetch revenue data if requested
		if (queryParams.sections.includes("revenue")) {
			const revenueStart = performance.now();

			// Get subscription data
			const { data: subscriptions } = await supabase
				.from("subscriptions")
				.select(
					`
          id,
          plan_id,
          amount,
          status,
          created_at,
          subscription_plans(name, price)
        `
				)
				.eq("local_hub_id", localHubId)
				.eq("status", "active");

			// Get recent payments
			const { data: payments } = await supabase
				.from("payments")
				.select(
					`
          id,
          amount,
          status,
          created_at,
          subscription_id,
          subscriptions(subscription_plans(name))
        `
				)
				.eq("local_hub_id", localHubId)
				.gte("created_at", startDate.toISOString())
				.eq("status", "completed");

			// Calculate revenue breakdown
			const revenueBreakdown =
				subscriptions?.reduce((acc: any[], sub: any) => {
					const plan = sub.subscription_plans;
					const existing = acc.find((item) => item.plan === plan.name);

					if (existing) {
						existing.count++;
						existing.revenue += plan.price;
					} else {
						acc.push({
							plan: plan.name,
							count: 1,
							revenue: plan.price,
							monthlyRate: plan.price,
						});
					}

					return acc;
				}, []) || [];

			const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
			const platformFee = Math.round(totalRevenue * 0.2); // 20% platform fee
			const yourShare = totalRevenue - platformFee;

			dashboardData.revenue = {
				monthlyRevenue: {
					value: totalRevenue,
					change: 0, // Calculate from previous period if needed
					changeType: "positive",
				},
				yourShare: {
					value: yourShare,
					change: 0,
					changeType: "positive",
				},
				breakdown: revenueBreakdown,
				totalRevenue,
				platformFee,
				totalBusinesses: subscriptions?.length || 0,
			};

			const revenueTime = performance.now() - revenueStart;
			logger.performance(`LocalHub revenue calculation completed in ${revenueTime.toFixed(2)}ms`);
		}

		// Fetch recent activity if requested
		if (queryParams.sections.includes("activity")) {
			const activityStart = performance.now();

			// Get recent business subscriptions and activities
			const { data: recentActivity } = await supabase
				.from("local_hub_activities")
				.select(
					`
          id,
          type,
          title,
          description,
          created_at,
          metadata,
          businesses(name)
        `
				)
				.eq("local_hub_id", localHubId)
				.order("created_at", { ascending: false })
				.limit(queryParams.limit);

			dashboardData.activity = recentActivity || [];

			const activityTime = performance.now() - activityStart;
			logger.performance(`LocalHub activity fetch completed in ${activityTime.toFixed(2)}ms`);
		}

		// Fetch business data if requested
		if (queryParams.sections.includes("businesses")) {
			const businessesStart = performance.now();

			const { data: businesses } = await supabase
				.from("local_hub_businesses")
				.select(
					`
          id,
          is_featured,
          status,
          businesses(
            id,
            name,
            slug,
            rating,
            review_count,
            verified,
            status
          )
        `
				)
				.eq("local_hub_id", localHubId)
				.order("created_at", { ascending: false });

			dashboardData.businesses = businesses || [];

			const businessesTime = performance.now() - businessesStart;
			logger.performance(`LocalHub businesses fetch completed in ${businessesTime.toFixed(2)}ms`);
		}

		// Fetch directory health if requested
		if (queryParams.sections.includes("health")) {
			const healthStart = performance.now();

			// Calculate directory health metrics
			const { data: healthMetrics } = await supabase.from("local_hub_analytics").select("*").eq("local_hub_id", localHubId).order("date", { ascending: false }).limit(30);

			// Calculate health score based on various factors
			const healthScore = calculateHealthScore(healthMetrics, dashboardData);

			dashboardData.health = {
				score: healthScore,
				metrics: healthMetrics?.slice(0, 7) || [], // Last week's data
				trends: calculateHealthTrends(healthMetrics),
			};

			const healthTime = performance.now() - healthStart;
			logger.performance(`LocalHub health calculation completed in ${healthTime.toFixed(2)}ms`);
		}

		const duration = performance.now() - startTime;
		logger.performance(`LocalHub dashboard API completed in ${duration.toFixed(2)}ms`);

		return createSuccessResponse({
			dashboard: dashboardData,
			metadata: {
				localHubId,
				userId: req.user.id,
				period: queryParams.period,
				sections: queryParams.sections,
				generatedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		logger.error("LocalHub dashboard API error:", error);
		
		// If demo mode is enabled, return demo data as fallback
		const isDemoEnabled = await dashboardDemoLocalhubFlag();
		if (isDemoEnabled) {
			logger.info("Falling back to demo data due to database error");
			const demoData = createLocalHubDemoData(queryParams);
			return createSuccessResponse({
				dashboard: demoData,
				metadata: {
					localHubId: "demo-localhub",
					userId: req.user?.id || "demo-user",
					period: queryParams.period,
					sections: queryParams.sections,
					generatedAt: new Date().toISOString(),
					demo: true,
					fallback: true,
				},
			});
		}
		
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch dashboard data");
	}
}

/**
 * Calculate directory health score based on various metrics
 */
function calculateHealthScore(analytics: any[], dashboardData: any): number {
	if (!analytics || analytics.length === 0) return 50;

	// Factors for health score calculation
	const factors = {
		viewsConsistency: 0.3,
		businessGrowth: 0.3,
		engagementRate: 0.2,
		revenueStability: 0.2,
	};

	// Calculate each factor (simplified logic)
	const viewsScore = analytics.length > 7 ? 80 : analytics.length * 10;
	const businessScore = dashboardData.stats?.activeBusinesses?.value > 0 ? 85 : 20;
	const engagementScore = 75; // Would calculate from actual engagement metrics
	const revenueScore = dashboardData.revenue?.totalRevenue > 0 ? 90 : 30;

	const totalScore = viewsScore * factors.viewsConsistency + businessScore * factors.businessGrowth + engagementScore * factors.engagementRate + revenueScore * factors.revenueStability;

	return Math.round(Math.min(100, Math.max(0, totalScore)));
}

/**
 * Calculate health trends from analytics data
 */
function calculateHealthTrends(analytics: any[]): any {
	if (!analytics || analytics.length < 2) {
		return { direction: "stable", percentage: 0 };
	}

	const recent = analytics.slice(0, 7);
	const previous = analytics.slice(7, 14);

	const recentAvg = recent.reduce((sum, item) => sum + (item.views || 0), 0) / recent.length;
	const previousAvg = previous.reduce((sum, item) => sum + (item.views || 0), 0) / previous.length;

	const change = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

	return {
		direction: change > 5 ? "improving" : change < -5 ? "declining" : "stable",
		percentage: Math.abs(change),
	};
}

// Export GET handler with middleware
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getLocalHubDashboard, {
		ttl: 300, // 5 minutes cache for dashboard data
		keyGenerator: (req) => `localhub-dashboard:${req.user?.id}:${req.nextUrl.search}`,
	}),
	withAuth(getLocalHubDashboard, {
		requiredRoles: ["business_owner", "admin"],
		requireEmailVerification: false,
	}),
	withValidation(getLocalHubDashboard, localHubDashboardQuerySchema)
);

// Lightweight, deterministic demo data generator (no external calls)
function createLocalHubDemoData(query: LocalHubDashboardQuery) {
	const periodLabel = query.period;
	const seed = 84;
	const rand = (n: number) => Math.abs(Math.sin(n + seed));

	const activeBusinesses = Math.floor(50 + rand(1) * 200);
	const currentViews = Math.floor(2000 + rand(2) * 5000);

	const days = { "7d": 7, "30d": 30, "90d": 30 }[periodLabel];
	const activity = Array.from({ length: Math.min(query.limit, 10) }, (_, i) => ({
		id: `act_${i}`,
		type: i % 2 === 0 ? "subscription" : "business_update",
		title: i % 2 === 0 ? "New subscription" : "Business profile updated",
		description: "Demo activity",
		created_at: new Date(Date.now() - i * 7200000).toISOString(),
		metadata: {},
		businesses: { name: `Business ${i + 1}` },
	}));

	const revenue = {
		monthlyRevenue: { value: Math.floor(currentViews * 0.12), change: 0, changeType: "positive" },
		yourShare: { value: Math.floor(currentViews * 0.1), change: 0, changeType: "positive" },
		breakdown: [
			{ plan: "Starter", count: Math.floor(10 + rand(3) * 30), revenue: 49, monthlyRate: 49 },
			{ plan: "Growth", count: Math.floor(5 + rand(4) * 20), revenue: 99, monthlyRate: 99 },
			{ plan: "Scale", count: Math.floor(2 + rand(5) * 10), revenue: 199, monthlyRate: 199 },
		],
		totalRevenue: Math.floor(currentViews * 0.12),
		platformFee: Math.floor(currentViews * 0.02),
		totalBusinesses: activeBusinesses,
	};

	const businesses = Array.from({ length: 8 }, (_, i) => ({
		id: `lhb_${i}`,
		is_featured: i < 3,
		status: "active",
		businesses: { id: `biz_${i}`, name: `Demo Biz ${i + 1}`, slug: `demo-biz-${i + 1}`, rating: (3.5 + rand(i) * 1.5).toFixed(1), review_count: Math.floor(rand(i + 6) * 200), verified: i % 2 === 0, status: "published" },
	}));

	const stats = {
		activeBusinesses: { value: activeBusinesses, change: 3, changeType: "positive" },
		directoryViews: { value: currentViews, change: 5.1, changeType: "positive" },
	};

	const health = {
		score: Math.floor(65 + rand(10) * 25),
		metrics: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString(), views: Math.floor(200 + rand(i + 20) * 500) })),
		trends: { direction: "improving", percentage: 6.3 },
	};

	return { stats, revenue, activity, businesses, health };
}
