/**
 * User Dashboard Hook - TypeScript Implementation
 * Manages user dashboard data, state, and actions with full type safety
 * Extracted from monolithic dashboard implementation
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@store/auth";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";
import type { DashboardStats, ActivityItem, SystemUpdate, ProfileCompletion, DashboardData, UseUserDashboardReturn } from "@/types/dashboard";

/**
 * Custom hook for managing user dashboard state and data
 *
 * @returns Object containing dashboard data, loading states, and action functions
 */
export const useUserDashboard = (): UseUserDashboardReturn => {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [dashboardData, setDashboardData] = useState<DashboardData>({
		stats: null,
		recentActivity: null,
		systemUpdates: null,
		quickActions: null,
		profileCompletion: null,
	});
	const [refreshing, setRefreshing] = useState<boolean>(false);

	/**
	 * Fetch dashboard statistics
	 *
	 * @returns Promise resolving to dashboard statistics
	 */
	const fetchDashboardStats = useCallback(async (): Promise<DashboardStats> => {
		return withErrorHandling(async () => {
			// In real implementation, this would be an API call
			// For now, returning mock data structure
			const stats: DashboardStats = {
				profileViews: { value: "1,234", change: "+12%", trend: "up" },
				jobApplications: { value: "23", change: "+5", trend: "up" },
				reviewsWritten: { value: "47", change: "+3", trend: "up" },
				earnings: { value: "$156.78", change: "+$24.50", trend: "up" },
			};

			logger.performance("Dashboard stats fetched successfully");
			return stats;
		}, "useUserDashboard")();
	}, []);

	/**
	 * Fetch recent activity
	 *
	 * @returns Promise resolving to recent activity items
	 */
	const fetchRecentActivity = useCallback(async (): Promise<ActivityItem[]> => {
		return withErrorHandling(async () => {
			// Mock recent activity data
			const recentActivity: ActivityItem[] = [
				{
					id: 1,
					type: "job_application",
					title: "Applied to Plumber position at Wade's Plumbing",
					description: "Your application has been submitted and is under review",
					timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
					actionLink: "/dashboard/user/jobs",
				},
				{
					id: 2,
					type: "review_created",
					title: "Wrote a 5-star review for Local Coffee Shop",
					description: "Your review has been published and is visible to others",
					timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
					actionLink: "/dashboard/user/reviews",
				},
				// More activity items...
			];

			logger.performance("Recent activity fetched successfully");
			return recentActivity;
		}, "useUserDashboard")();
	}, []);

	/**
	 * Fetch system updates
	 *
	 * @returns Promise resolving to system updates
	 */
	const fetchSystemUpdates = useCallback(async (): Promise<SystemUpdate[]> => {
		return withErrorHandling(async () => {
			// Mock system updates data
			const systemUpdates: SystemUpdate[] = [
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
	 * Calculate profile completion percentage
	 *
	 * @returns Profile completion data
	 */
	const calculateProfileCompletion = useCallback((): ProfileCompletion => {
		if (!user) return { percentage: 0, completedSections: [], missingSections: [] };

		const sections = [
			{ key: "basicInfo", completed: !!(user.firstName && user.lastName) },
			{ key: "contactDetails", completed: !!(user.email && user.phone) },
			{ key: "workExperience", completed: !!(user.workExperience?.length && user.workExperience.length > 0) },
			{ key: "skills", completed: !!(user.skills?.length && user.skills.length > 0) },
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
	 *
	 * @returns Promise that resolves when initialization is complete
	 */
	const initializeDashboard = useCallback(async (): Promise<void> => {
		setIsLoading(true);

		try {
			const [stats, activity, updates] = await Promise.all([fetchDashboardStats(), fetchRecentActivity(), fetchSystemUpdates()]);

			const profileCompletion = calculateProfileCompletion();

			setDashboardData({
				stats,
				recentActivity: activity,
				systemUpdates: updates,
				profileCompletion,
				quickActions: null, // Would be populated with quick actions data
			});

			logger.info("User dashboard initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize dashboard:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchDashboardStats, fetchRecentActivity, fetchSystemUpdates, calculateProfileCompletion]);

	/**
	 * Refresh dashboard data
	 *
	 * @returns Promise that resolves when refresh is complete
	 */
	const refreshDashboard = useCallback(async (): Promise<void> => {
		setRefreshing(true);
		await initializeDashboard();
		setRefreshing(false);
	}, [initializeDashboard]);

	/**
	 * Update specific dashboard section
	 *
	 * @param section - The section to update
	 * @param data - The new data for the section
	 */
	const updateDashboardSection = useCallback((section: keyof DashboardData, data: any): void => {
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

		// Actions
		refreshDashboard,
		updateDashboardSection,
		initializeDashboard,

		// Computed
		profileCompletion: dashboardData.profileCompletion,

		// Utilities
		calculateProfileCompletion,
	};
};
