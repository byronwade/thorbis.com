/**
 * useBusinessHours Hook
 * Custom hook for managing business hours with real-time updates
 * Includes regular hours, special hours, and timezone management
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BusinessHoursQueries } from "@lib/database/supabase/queries/business-hours";
import { useAuthStore } from "@store/use-auth-store";
import { toast } from "@components/ui/use-toast";
import logger from "@lib/utils/logger";

/**
 * Custom hook for business hours management
 */
export const useBusinessHours = (options = {}) => {
	const {
		autoRefresh = false,
		refreshInterval = 300000, // 5 minutes (less frequent than schedule)
		checkOpenStatus = true,
	} = options;

	const { user } = useAuthStore();
	const businessId = user?.business_id;

	// State management
	const [state, setState] = useState({
		weeklyHours: null,
		timezone: "America/New_York",
		specialHours: [],
		isLoading: true,
		isRefreshing: false,
		error: null,
		lastUpdated: null,
		isCurrentlyOpen: null,
		nextOpenTime: null,
		nextCloseTime: null,
	});

	/**
	 * Fetch business hours with performance tracking
	 */
	const fetchBusinessHours = useCallback(async () => {
		if (!businessId) return;

		try {
			const startTime = performance.now();
			const result = await BusinessHoursQueries.getBusinessHours(businessId);

			setState((prev) => ({
				...prev,
				weeklyHours: result.weeklyHours,
				timezone: result.timezone,
				specialHours: result.specialHours,
				error: null,
			}));

			const duration = performance.now() - startTime;
			logger.performance(`Business hours loaded in ${duration.toFixed(2)}ms (Cache: ${result.performance.cacheHit})`);
		} catch (error) {
			logger.error("Failed to fetch business hours:", error);
			setState((prev) => ({
				...prev,
				error: "Failed to load business hours",
			}));
		}
	}, [businessId]);

	/**
	 * Check if business is currently open
	 */
	const checkBusinessStatus = useCallback(async () => {
		if (!businessId || !checkOpenStatus) return;

		try {
			const status = await BusinessHoursQueries.isBusinessOpen(businessId);
			setState((prev) => ({
				...prev,
				isCurrentlyOpen: status.isOpen,
				nextOpenTime: status.nextOpenTime,
				nextCloseTime: status.nextCloseTime,
			}));
		} catch (error) {
			logger.error("Failed to check business open status:", error);
		}
	}, [businessId, checkOpenStatus]);

	/**
	 * Fetch all business hours data
	 */
	const fetchAllData = useCallback(
		async (isRefresh = false) => {
			if (!businessId) {
				setState((prev) => ({
					...prev,
					isLoading: false,
					error: "No business ID available",
				}));
				return;
			}

			setState((prev) => ({
				...prev,
				isLoading: !isRefresh,
				isRefreshing: isRefresh,
				error: null,
			}));

			try {
				// Fetch business hours and status in parallel
				await Promise.all([fetchBusinessHours(), checkBusinessStatus()]);

				setState((prev) => ({
					...prev,
					isLoading: false,
					isRefreshing: false,
					lastUpdated: new Date(),
					error: null,
				}));
			} catch (error) {
				logger.error("Failed to fetch business hours data:", error);
				setState((prev) => ({
					...prev,
					isLoading: false,
					isRefreshing: false,
					error: "Failed to load business hours data",
				}));

				toast({
					title: "Error Loading Business Hours",
					description: "Unable to load business hours. Please try again.",
					variant: "destructive",
				});
			}
		},
		[businessId, fetchBusinessHours, checkBusinessStatus]
	);

	/**
	 * Refresh all data
	 */
	const refresh = useCallback(() => {
		fetchAllData(true);
	}, [fetchAllData]);

	/**
	 * Update weekly business hours
	 */
	const updateWeeklyHours = useCallback(
		async (weeklyHours, timezone) => {
			if (!businessId) return false;

			try {
				const result = await BusinessHoursQueries.updateBusinessHours(businessId, weeklyHours, timezone);

				if (result.success) {
					toast({
						title: "Hours Updated",
						description: "Business hours have been updated successfully",
					});

					// Refresh data to get latest state
					setTimeout(() => refresh(), 500);
					return true;
				} else {
					throw new Error("Update failed");
				}
			} catch (error) {
				logger.error("Failed to update business hours:", error);
				toast({
					title: "Update Failed",
					description: "Failed to update business hours. Please try again.",
					variant: "destructive",
				});

				return false;
			}
		},
		[businessId, refresh]
	);

	/**
	 * Add or update special hours
	 */
	const updateSpecialHours = useCallback(
		async (specialHoursEvent) => {
			if (!businessId) return false;

			try {
				const result = await BusinessHoursQueries.updateSpecialHours(businessId, specialHoursEvent);

				if (result.success) {
					toast({
						title: "Special Hours Updated",
						description: `${specialHoursEvent.name} has been ${specialHoursEvent.id ? "updated" : "added"} successfully`,
					});

					// Refresh data to get latest state
					setTimeout(() => refresh(), 500);
					return true;
				} else {
					throw new Error("Update failed");
				}
			} catch (error) {
				logger.error("Failed to update special hours:", error);
				toast({
					title: "Update Failed",
					description: "Failed to update special hours. Please try again.",
					variant: "destructive",
				});

				return false;
			}
		},
		[businessId, refresh]
	);

	/**
	 * Delete special hours
	 */
	const deleteSpecialHours = useCallback(
		async (specialHoursId) => {
			if (!businessId) return false;

			try {
				const result = await BusinessHoursQueries.deleteSpecialHours(businessId, specialHoursId);

				if (result.success) {
					toast({
						title: "Special Hours Deleted",
						description: "Special hours have been deleted successfully",
					});

					// Refresh data to get latest state
					setTimeout(() => refresh(), 500);
					return true;
				} else {
					throw new Error("Delete failed");
				}
			} catch (error) {
				logger.error("Failed to delete special hours:", error);
				toast({
					title: "Delete Failed",
					description: "Failed to delete special hours. Please try again.",
					variant: "destructive",
				});

				return false;
			}
		},
		[businessId, refresh]
	);

	/**
	 * Check if business is open on a specific date
	 */
	const isOpenOnDate = useCallback(
		(date) => {
			if (!state.weeklyHours) return null;

			const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
			const dateString = date.toISOString().split("T")[0];

			// Check for special hours first
			const specialEvent = state.specialHours.find((event) => event.date === dateString);
			if (specialEvent) {
				return !specialEvent.isClosed;
			}

			// Check regular hours
			const dayHours = state.weeklyHours[dayOfWeek];
			return dayHours ? dayHours.isOpen : false;
		},
		[state.weeklyHours, state.specialHours]
	);

	/**
	 * Get hours for a specific date
	 */
	const getHoursForDate = useCallback(
		(date) => {
			if (!state.weeklyHours) return null;

			const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
			const dateString = date.toISOString().split("T")[0];

			// Check for special hours first
			const specialEvent = state.specialHours.find((event) => event.date === dateString);
			if (specialEvent) {
				return {
					isOpen: !specialEvent.isClosed,
					openTime: specialEvent.openTime,
					closeTime: specialEvent.closeTime,
					isSpecial: true,
					eventName: specialEvent.name,
				};
			}

			// Return regular hours
			const dayHours = state.weeklyHours[dayOfWeek];
			return dayHours
				? {
						isOpen: dayHours.isOpen,
						openTime: dayHours.openTime,
						closeTime: dayHours.closeTime,
						breaks: dayHours.breaks,
						isSpecial: false,
					}
				: null;
		},
		[state.weeklyHours, state.specialHours]
	);

	// Auto-refresh effect
	useEffect(() => {
		if (!autoRefresh || !businessId) return;

		const interval = setInterval(() => {
			if (!state.isLoading && !state.isRefreshing) {
				checkBusinessStatus(); // Only refresh status, not full data
			}
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [autoRefresh, businessId, refreshInterval, checkBusinessStatus, state.isLoading, state.isRefreshing]);

	// Initial data load
	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	// Computed values
	const computedValues = useMemo(() => {
		const { weeklyHours, isCurrentlyOpen, specialHours } = state;

		return {
			// Status helpers
			isOpen: isCurrentlyOpen,
			hasSpecialHours: specialHours.length > 0,
			hasWeeklyHours: !!weeklyHours,

			// Operating days
			operatingDays:
				weeklyHours &&
				Object.entries(weeklyHours)
					.filter(([day, hours]) => hours.isOpen)
					.map(([day]) => day),

			// Next upcoming special event
			nextSpecialEvent: specialHours.filter((event) => new Date(event.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date))[0],

			// Today's hours
			todaysHours: (() => {
				const today = new Date();
				return getHoursForDate(today);
			})(),

			// Business status text
			statusText: (() => {
				if (state.isLoading) return "Loading...";
				if (state.error) return "Error loading hours";
				if (isCurrentlyOpen === null) return "Status unknown";
				if (isCurrentlyOpen) {
					return state.nextCloseTime ? `Open until ${state.nextCloseTime}` : "Open";
				} else {
					return state.nextOpenTime ? `Closed, opens at ${state.nextOpenTime}` : "Closed";
				}
			})(),
		};
	}, [state, getHoursForDate]);

	return {
		// State
		...state,

		// Computed values
		...computedValues,

		// Actions
		refresh,
		updateWeeklyHours,
		updateSpecialHours,
		deleteSpecialHours,

		// Utilities
		isOpenOnDate,
		getHoursForDate,
		isReady: !state.isLoading && !!businessId,
		hasData: !!state.weeklyHours,
	};
};

export default useBusinessHours;
