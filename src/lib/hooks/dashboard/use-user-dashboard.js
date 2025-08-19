/**
 * User Dashboard Hook
 * Manages user dashboard data, state, and actions
 * Extracted from monolithic dashboard implementation
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@store/auth";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";

export const useUserDashboard = () => {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState({
		stats: null,
		recentActivity: null,
		systemUpdates: null,
		quickActions: null,
		profileCompletion: null,
	});
	const [refreshing, setRefreshing] = useState(false);
	const [period, setPeriod] = useState("30d");

	/**
	 * Fetch dashboard data from API
	 */
	const fetchDashboardData = useCallback(
		async (sections = ["stats", "activity", "profile"]) => {
			return withErrorHandling(async () => {
				if (!user) {
					throw new Error("User not authenticated");
				}

				const searchParams = new URLSearchParams({
					sections: sections.join(","),
					period,
					limit: "10",
				});

				const response = await fetch(`/api/v2/dashboard/user?${searchParams}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(`Dashboard API error: ${response.statusText}`);
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || "Failed to fetch dashboard data");
				}

				logger.performance("Dashboard data fetched successfully from API");
				return result.data.dashboard;
			}, "useUserDashboard")();
		},
		[user, period]
	);

	/**
	 * Fetch dashboard statistics (legacy method for backward compatibility)
	 */
	const fetchDashboardStats = useCallback(async () => {
		const data = await fetchDashboardData(["stats"]);
		return data?.stats || null;
	}, [fetchDashboardData]);

	/**
	 * Fetch recent activity (legacy method for backward compatibility)
	 */
	const fetchRecentActivity = useCallback(async () => {
		const data = await fetchDashboardData(["activity"]);
		return data?.activity || [];
	}, [fetchDashboardData]);

	/**
	 * Fetch system updates
	 */
	const fetchSystemUpdates = useCallback(async () => {
		return withErrorHandling(async () => {
			// Mock system updates data
			const systemUpdates = [
				{
					id: 1,
					type: "feature",
					title: "Enhanced Job Application Tracking",
					description: "New detailed tracking for job applications with status updates",
					date: "2024-01-25",
					version: "v2.1.0",
					badge: "New",
				},
				// More updates...
			];

			logger.performance("System updates fetched successfully");
			return systemUpdates;
		}, "useUserDashboard")();
	}, []);

	/**
	 * Get profile completion data
	 */
	const getProfileCompletion = useCallback(async () => {
		const data = await fetchDashboardData(["profile"]);
		return (
			data?.profile?.completion || {
				percentage: 0,
				completedSections: [],
				missingSections: [],
			}
		);
	}, [fetchDashboardData]);

	/**
	 * Calculate profile completion percentage (legacy method for backward compatibility)
	 */
	const calculateProfileCompletion = useCallback(() => {
		if (!user) return { percentage: 0, completedSections: [], missingSections: [] };

		const sections = [
			{ key: "basicInfo", completed: !!(user.firstName && user.lastName) },
			{ key: "contactDetails", completed: !!(user.email && user.phone) },
			{ key: "workExperience", completed: !!(user.workExperience?.length > 0) },
			{ key: "skills", completed: !!(user.skills?.length > 0) },
			{ key: "resume", completed: !!user.resumeUrl },
		];

		const completedSections = sections.filter((section) => section.completed);
		const missingSections = sections.filter((section) => !section.completed);
		const percentage = Math.round((completedSections.length / sections.length) * 100);

		return {
			percentage,
			completedSections: completedSections.map((s) => s.key),
			missingSections: missingSections.map((s) => s.key),
		};
	}, [user]);

	/**
	 * Initialize dashboard data
	 */
	const initializeDashboard = useCallback(async () => {
		setIsLoading(true);

		try {
			// Fetch all dashboard data from API
			const dashboardApiData = await fetchDashboardData(["stats", "activity", "profile"]);

			// Fetch system updates (could be moved to API later)
			const updates = await fetchSystemUpdates();

			setDashboardData({
				stats: dashboardApiData?.stats,
				recentActivity: dashboardApiData?.activity || [],
				systemUpdates: updates,
				profileCompletion: dashboardApiData?.profile?.completion,
			});

			logger.info("User dashboard initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize dashboard:", error);
			// Fallback to calculating profile completion locally if API fails
			const profileCompletion = calculateProfileCompletion();
			setDashboardData((prev) => ({
				...prev,
				profileCompletion,
			}));
		} finally {
			setIsLoading(false);
		}
	}, [fetchDashboardData, fetchSystemUpdates, calculateProfileCompletion]);

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
		period,

		// Actions
		refreshDashboard,
		updateDashboardSection,
		initializeDashboard,
		setPeriod,
		fetchDashboardData,

		// Computed
		profileCompletion: dashboardData.profileCompletion,

		// Utilities
		calculateProfileCompletion,
		getProfileCompletion,
		fetchDashboardStats,
		fetchRecentActivity,
	};
};
