/**
 * LocalHub Dashboard Data Layer
 * Handles data fetching, caching, and transformation for LocalHub dashboard
 */

import { supabase } from "@lib/database/supabase/client";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";

/**
 * Fetch LocalHub directory statistics
 */
export const fetchLocalHubDirectoryStats = async (directoryId) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase.rpc("get_localhub_directory_stats", {
			directory_id: directoryId,
		});

		if (error) throw error;

		return {
			monthlyRevenue: data.monthly_revenue || 0,
			activeBusinesses: data.active_businesses || 0,
			directoryViews: data.directory_views || 0,
			yourShare: data.your_share || 0,
			platformFee: data.platform_fee || 0,
			monthlyGrowth: data.monthly_growth || {},
		};
	}, "fetchLocalHubDirectoryStats")();
};

/**
 * Fetch LocalHub recent activity
 */
export const fetchLocalHubRecentActivity = async (directoryId, limit = 10) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase
			.from("localhub_activity")
			.select(
				`
        id,
        type,
        title,
        description,
        created_at,
        metadata,
        business:businesses(name, id),
        revenue_impact
      `
			)
			.eq("directory_id", directoryId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) throw error;

		return data.map((activity) => ({
			...activity,
			timestamp: new Date(activity.created_at),
			businessName: activity.business?.name,
			actionLink: generateLocalHubActionLink(activity.type, activity.metadata),
		}));
	}, "fetchLocalHubRecentActivity")();
};

/**
 * Fetch LocalHub revenue breakdown by subscription plans
 */
export const fetchLocalHubRevenueBreakdown = async (directoryId) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase
			.from("localhub_revenue_breakdown")
			.select(
				`
        plan_type,
        business_count,
        total_revenue,
        monthly_rate,
        percentage_of_total
      `
			)
			.eq("directory_id", directoryId);

		if (error) throw error;

		const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
		const totalBusinesses = data.reduce((sum, item) => sum + item.business_count, 0);
		const platformFee = Math.round(totalRevenue * 0.2); // 20% platform fee
		const yourShare = totalRevenue - platformFee; // 80% to LocalHub owner

		return {
			breakdown: data.map((item) => ({
				plan: item.plan_type,
				count: item.business_count,
				revenue: item.total_revenue,
				monthlyRate: item.monthly_rate,
				percentage: item.percentage_of_total,
			})),
			totalRevenue,
			platformFee,
			yourShare,
			totalBusinesses,
			averageRevenuePerBusiness: Math.round(totalRevenue / totalBusinesses),
		};
	}, "fetchLocalHubRevenueBreakdown")();
};

/**
 * Fetch LocalHub directory health metrics
 */
export const fetchLocalHubDirectoryHealth = async (directoryId) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase.rpc("get_localhub_health_metrics", {
			directory_id: directoryId,
		});

		if (error) throw error;

		const metrics = [
			{
				metric: "Business Retention",
				value: data.business_retention || 0,
				status: getHealthStatus(data.business_retention, 95),
				target: 95,
				trend: data.retention_trend || "stable",
			},
			{
				metric: "Payment Success Rate",
				value: data.payment_success_rate || 0,
				status: getHealthStatus(data.payment_success_rate, 98),
				target: 98,
				trend: data.payment_trend || "stable",
			},
			{
				metric: "Directory Uptime",
				value: data.directory_uptime || 0,
				status: getHealthStatus(data.directory_uptime, 99.5),
				target: 99.5,
				trend: data.uptime_trend || "stable",
			},
			{
				metric: "Support Response Time",
				value: data.support_response_score || 0,
				status: getHealthStatus(data.support_response_score, 90),
				target: 90,
				trend: data.support_trend || "stable",
			},
		];

		const overallScore = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;

		return {
			metrics,
			overallScore: Math.round(overallScore * 10) / 10,
			overallStatus: getHealthStatus(overallScore, 90),
		};
	}, "fetchLocalHubDirectoryHealth")();
};

/**
 * Get LocalHub quick actions configuration
 */
export const getLocalHubQuickActions = (directoryData) => {
	return [
		{
			title: "Add New Business",
			description: "Invite or add businesses to your directory",
			icon: "Building2",
			link: "/dashboard/localhub/businesses/add",
			color: "blue",
			priority: 1,
			enabled: true,
		},
		{
			title: "Customize Directory",
			description: "Update branding, layout, and appearance",
			icon: "Palette",
			link: "/dashboard/localhub/customization",
			color: "purple",
			priority: 2,
			enabled: true,
		},
		{
			title: "View Analytics",
			description: "Revenue, business, and performance analytics",
			icon: "BarChart3",
			link: "/dashboard/localhub/analytics",
			color: "green",
			priority: 3,
			enabled: directoryData?.hasAnalytics || true,
		},
		{
			title: "Manage Subscriptions",
			description: "Business plans, pricing, and billing",
			icon: "Settings",
			link: "/dashboard/localhub/subscriptions",
			color: "orange",
			priority: 4,
			enabled: true,
		},
		{
			title: "Directory Settings",
			description: "Configure directory features and policies",
			icon: "Settings",
			link: "/dashboard/localhub/settings",
			color: "indigo",
			priority: 5,
			enabled: true,
		},
		{
			title: "Create Domain",
			description: "Set up custom domain for your directory",
			icon: "Plus",
			link: "/dashboard/localhub/domains",
			color: "red",
			priority: 6,
			enabled: !directoryData?.hasCustomDomain,
		},
	].filter((action) => action.enabled);
};

/**
 * Track LocalHub dashboard interaction
 */
export const trackLocalHubDashboardInteraction = async (directoryId, action, metadata = {}) => {
	return withErrorHandling(async () => {
		const { error } = await supabase.from("localhub_analytics").insert({
			directory_id: directoryId,
			event_type: "dashboard_interaction",
			event_data: {
				action,
				...metadata,
				timestamp: new Date().toISOString(),
			},
		});

		if (error) throw error;

		logger.analytics({
			directoryId,
			action: "localhub_dashboard_interaction",
			metadata: { action, ...metadata },
		});
	}, "trackLocalHubDashboardInteraction")();
};

/**
 * Helper function to determine health status based on value and target
 */
const getHealthStatus = (value, target) => {
	if (value >= target) return "excellent";
	if (value >= target * 0.9) return "good";
	if (value >= target * 0.8) return "warning";
	return "critical";
};

/**
 * Generate action links based on LocalHub activity type
 */
const generateLocalHubActionLink = (type, metadata) => {
	const actionLinks = {
		subscription: "/dashboard/localhub/businesses",
		payment: "/dashboard/localhub/analytics",
		signup: "/dashboard/localhub/businesses",
		upgrade: "/dashboard/localhub/analytics",
		customization: "/dashboard/localhub/customization",
		business_added: "/dashboard/localhub/businesses",
		domain_created: "/dashboard/localhub/domains",
	};

	return actionLinks[type] || "/dashboard/localhub";
};

/**
 * Calculate LocalHub business growth metrics
 */
export const calculateLocalHubGrowthMetrics = (revenueData, activityData) => {
	if (!revenueData || !activityData) return null;

	const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const newBusinessesThisWeek = activityData.filter((activity) => activity.type === "signup" && activity.timestamp > thisWeekStart).length;

	const upgradesThisWeek = activityData.filter((activity) => activity.type === "upgrade" && activity.timestamp > thisWeekStart).length;

	const weeklyRevenue = activityData.filter((activity) => activity.timestamp > thisWeekStart && activity.revenue_impact).reduce((sum, activity) => sum + (activity.revenue_impact || 0), 0);

	return {
		newBusinessesThisWeek,
		upgradesThisWeek,
		weeklyRevenue,
		averageRevenuePerBusiness: revenueData.averageRevenuePerBusiness,
		monthlyGrowthRate: calculateMonthlyGrowthRate(revenueData),
		projectedMonthlyRevenue: projectMonthlyRevenue(revenueData, weeklyRevenue),
	};
};

/**
 * Calculate monthly growth rate
 */
const calculateMonthlyGrowthRate = (revenueData) => {
	// This would typically come from historical data comparison
	// For now, returning a calculated estimate based on current performance
	return 12.5; // Placeholder - would be calculated from previous month comparison
};

/**
 * Project monthly revenue based on current weekly performance
 */
const projectMonthlyRevenue = (revenueData, weeklyRevenue) => {
	const weeksInMonth = 4.33; // Average weeks per month
	const projectedFromWeekly = weeklyRevenue * weeksInMonth;
	const currentMonthly = revenueData.totalRevenue;

	return Math.round((currentMonthly + projectedFromWeekly) / 2); // Average of current and projected
};
