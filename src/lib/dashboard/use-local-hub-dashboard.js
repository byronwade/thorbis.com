/**
 * LocalHub Dashboard Hook
 * Manages LocalHub directory data, revenue metrics, and business management
 * Extracted from monolithic LocalHub dashboard implementation
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@store/auth";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";

export const useLocalHubDashboard = () => {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState({
		directoryStats: null,
		recentActivity: null,
		revenueBreakdown: null,
		directoryHealth: null,
		businessMetrics: null,
	});
	const [refreshing, setRefreshing] = useState(false);

	/**
	 * Fetch LocalHub dashboard data from API
	 */
	const fetchLocalHubData = useCallback(
		async (sections = ["stats", "revenue", "activity"], localHubId = null) => {
			return withErrorHandling(async () => {
				if (!user) {
					throw new Error("User not authenticated");
				}

				const searchParams = new URLSearchParams({
					sections: sections.join(","),
					period: "30d",
					limit: "10",
				});

				if (localHubId) {
					searchParams.append("localHubId", localHubId);
				}

				const response = await fetch(`/api/v2/dashboard/localhub?${searchParams}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(`LocalHub Dashboard API error: ${response.statusText}`);
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || "Failed to fetch LocalHub dashboard data");
				}

				logger.performance("LocalHub dashboard data fetched successfully from API");
				return result.data.dashboard;
			}, "useLocalHubDashboard")();
		},
		[user]
	);

	/**
	 * Fetch directory statistics (legacy method for backward compatibility)
	 */
	const fetchDirectoryStats = useCallback(async () => {
		const data = await fetchLocalHubData(["stats", "revenue"]);
		return {
			monthlyRevenue: data?.revenue?.monthlyRevenue || { value: 0, change: 0, changeType: "positive" },
			activeBusinesses: data?.stats?.activeBusinesses || { value: 0, change: 0, changeType: "positive" },
			directoryViews: data?.stats?.directoryViews || { value: 0, change: 0, changeType: "positive" },
			yourShare: data?.revenue?.yourShare || { value: 0, change: 0, changeType: "positive" },
		};
	}, [fetchLocalHubData]);

	/**
	 * Fetch recent LocalHub activity (legacy method for backward compatibility)
	 */
	const fetchRecentActivity = useCallback(async () => {
		const data = await fetchLocalHubData(["activity"]);
		return data?.activity || [];
	}, [fetchLocalHubData]);

	/**
	 * Fetch revenue breakdown by subscription plans (legacy method for backward compatibility)
	 */
	const fetchRevenueBreakdown = useCallback(async () => {
		const data = await fetchLocalHubData(["revenue"]);
		return (
			data?.revenue || {
				breakdown: [],
				totalRevenue: 0,
				platformFee: 0,
				yourShare: 0,
				totalBusinesses: 0,
			}
		);
	}, [fetchLocalHubData]);

	/**
	 * Fetch directory health metrics
	 */
	const fetchDirectoryHealth = useCallback(async () => {
		return withErrorHandling(async () => {
			const healthMetrics = [
				{
					metric: "Business Retention",
					value: 97.9,
					status: "excellent",
					target: 95,
					trend: "stable",
				},
				{
					metric: "Payment Success Rate",
					value: 99.2,
					status: "excellent",
					target: 98,
					trend: "improving",
				},
				{
					metric: "Directory Uptime",
					value: 99.9,
					status: "excellent",
					target: 99.5,
					trend: "stable",
				},
				{
					metric: "Support Response Time",
					value: 87.3,
					status: "good",
					target: 90,
					trend: "improving",
				},
			];

			const overallScore = healthMetrics.reduce((sum, metric) => sum + metric.value, 0) / healthMetrics.length;

			return {
				metrics: healthMetrics,
				overallScore: Math.round(overallScore * 10) / 10,
				overallStatus: overallScore >= 95 ? "excellent" : overallScore >= 85 ? "good" : "warning",
			};
		}, "useLocalHubDashboard")();
	}, []);

	/**
	 * Calculate business growth metrics
	 */
	const calculateBusinessMetrics = useCallback((revenueData, activityData) => {
		if (!revenueData || !activityData) return null;

		const averageRevenuePerBusiness = Math.round(revenueData.totalRevenue / revenueData.totalBusinesses);
		const newBusinessesThisWeek = activityData.filter((activity) => activity.type === "signup" && activity.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

		const upgradesThisWeek = activityData.filter((activity) => activity.type === "upgrade" && activity.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

		return {
			averageRevenuePerBusiness,
			newBusinessesThisWeek,
			upgradesThisWeek,
			monthlyGrowthRate: 12.5, // This would be calculated from historical data
		};
	}, []);

	/**
	 * Initialize LocalHub dashboard data
	 */
	const initializeDashboard = useCallback(async () => {
		setIsLoading(true);

		try {
			// Fetch all dashboard data from API
			const dashboardApiData = await fetchLocalHubData(["stats", "revenue", "activity", "businesses", "health"]);

			setDashboardData({
				directoryStats: {
					monthlyRevenue: dashboardApiData?.revenue?.monthlyRevenue || { value: 0, change: 0, changeType: "positive" },
					activeBusinesses: dashboardApiData?.stats?.activeBusinesses || { value: 0, change: 0, changeType: "positive" },
					directoryViews: dashboardApiData?.stats?.directoryViews || { value: 0, change: 0, changeType: "positive" },
					yourShare: dashboardApiData?.revenue?.yourShare || { value: 0, change: 0, changeType: "positive" },
				},
				recentActivity: dashboardApiData?.activity || [],
				revenueBreakdown: dashboardApiData?.revenue || {
					breakdown: [],
					totalRevenue: 0,
					platformFee: 0,
					yourShare: 0,
					totalBusinesses: 0,
				},
				directoryHealth: dashboardApiData?.health || { score: 50, metrics: [], trends: {} },
				businessMetrics: dashboardApiData?.businesses || [],
			});

			logger.info("LocalHub dashboard initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize LocalHub dashboard:", error);
			// Fallback to legacy methods if API fails
			try {
				const [directoryStats, recentActivity, revenueBreakdown, directoryHealth] = await Promise.all([fetchDirectoryStats(), fetchRecentActivity(), fetchRevenueBreakdown(), fetchDirectoryHealth()]);

				const businessMetrics = calculateBusinessMetrics(revenueBreakdown, recentActivity);

				setDashboardData({
					directoryStats,
					recentActivity,
					revenueBreakdown,
					directoryHealth,
					businessMetrics,
				});
			} catch (fallbackError) {
				logger.error("Fallback initialization also failed:", fallbackError);
			}
		} finally {
			setIsLoading(false);
		}
	}, [fetchLocalHubData, fetchDirectoryStats, fetchRecentActivity, fetchRevenueBreakdown, fetchDirectoryHealth, calculateBusinessMetrics]);

	/**
	 * Refresh dashboard data
	 */
	const refreshDashboard = useCallback(async () => {
		setRefreshing(true);
		await initializeDashboard();
		setRefreshing(false);
	}, [initializeDashboard]);

	/**
	 * Update specific dashboard section
	 */
	const updateDashboardSection = useCallback((section, data) => {
		setDashboardData((prev) => ({
			...prev,
			[section]: data,
		}));
	}, []);

	/**
	 * Track LocalHub dashboard interaction
	 */
	const trackDashboardAction = useCallback(
		async (action, metadata = {}) => {
			logger.analytics({
				userId: user?.id,
				action: "localhub_dashboard_action",
				metadata: { action, ...metadata },
			});
		},
		[user]
	);

	// Initialize dashboard on component mount and user change
	useEffect(() => {
		if (user) {
			initializeDashboard();
		}
	}, [user, initializeDashboard]);

	return {
		// Data
		dashboardData,
		isLoading,
		refreshing,
		user,

		// Actions
		refreshDashboard,
		updateDashboardSection,
		initializeDashboard,
		trackDashboardAction,
		fetchLocalHubData,

		// Computed
		directoryStats: dashboardData.directoryStats,
		recentActivity: dashboardData.recentActivity,
		revenueBreakdown: dashboardData.revenueBreakdown,
		directoryHealth: dashboardData.directoryHealth,
		businessMetrics: dashboardData.businessMetrics,

		// Individual data fetchers (for components that need specific data)
		fetchDirectoryStats,
		fetchRecentActivity,
		fetchRevenueBreakdown,
		fetchDirectoryHealth,

		// Utilities
		calculateBusinessMetrics,
	};
};
