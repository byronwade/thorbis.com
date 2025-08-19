/**
 * User Dashboard Data Layer
 * Handles data fetching, caching, and transformation for user dashboard
 */

import { supabase } from "@lib/database/supabase/client";
import logger from "@lib/utils/logger";
import { withErrorHandling } from "@utils/error-handler";

/**
 * Fetch user dashboard statistics
 */
export const fetchUserDashboardStats = async (userId) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase.rpc("get_user_dashboard_stats", {
			user_id: userId,
		});

		if (error) throw error;

		return {
			profileViews: data.profile_views || 0,
			jobApplications: data.job_applications || 0,
			reviewsWritten: data.reviews_written || 0,
			earnings: data.referral_earnings || 0,
			monthlyGrowth: data.monthly_growth || {},
		};
	}, "fetchUserDashboardStats")();
};

/**
 * Fetch user recent activity
 */
export const fetchUserRecentActivity = async (userId, limit = 10) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase
			.from("user_activity")
			.select(
				`
        id,
        type,
        title,
        description,
        created_at,
        metadata
      `
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) throw error;

		return data.map((activity) => ({
			...activity,
			timestamp: new Date(activity.created_at),
			actionLink: generateActionLink(activity.type, activity.metadata),
		}));
	}, "fetchUserRecentActivity")();
};

/**
 * Fetch system updates relevant to users
 */
export const fetchSystemUpdates = async (limit = 5) => {
	return withErrorHandling(async () => {
		const { data, error } = await supabase
			.from("system_updates")
			.select(
				`
        id,
        type,
        title,
        description,
        release_date,
        version,
        badge_text,
        target_audience
      `
			)
			.contains("target_audience", ["users", "all"])
			.order("release_date", { ascending: false })
			.limit(limit);

		if (error) throw error;

		return data.map((update) => ({
			...update,
			date: update.release_date,
			badge: update.badge_text,
		}));
	}, "fetchSystemUpdates")();
};

/**
 * Calculate user profile completion
 */
export const calculateUserProfileCompletion = (user) => {
	const requiredFields = [
		{ key: "firstName", weight: 20, label: "First Name" },
		{ key: "lastName", weight: 20, label: "Last Name" },
		{ key: "email", weight: 10, label: "Email" },
		{ key: "phone", weight: 10, label: "Phone" },
		{ key: "bio", weight: 15, label: "Bio" },
		{ key: "skills", weight: 15, label: "Skills", isArray: true },
		{ key: "resumeUrl", weight: 10, label: "Resume" },
	];

	const completion = requiredFields.map((field) => {
		let isCompleted = false;

		if (field.isArray) {
			isCompleted = user[field.key] && user[field.key].length > 0;
		} else {
			isCompleted = user[field.key] && user[field.key].toString().trim().length > 0;
		}

		return {
			...field,
			completed: isCompleted,
		};
	});

	const completedWeight = completion.filter((field) => field.completed).reduce((sum, field) => sum + field.weight, 0);

	const totalWeight = requiredFields.reduce((sum, field) => sum + field.weight, 0);
	const percentage = Math.round((completedWeight / totalWeight) * 100);

	return {
		percentage,
		fields: completion,
		completedFields: completion.filter((f) => f.completed),
		missingFields: completion.filter((f) => !f.completed),
	};
};

/**
 * Generate action links based on activity type
 */
const generateActionLink = (type, metadata) => {
	const actionLinks = {
		job_application: "/dashboard/user/jobs",
		review_created: "/dashboard/user/reviews",
		referral_earned: "/dashboard/user/referrals",
		profile_viewed: "/dashboard/user/settings",
		boost_activated: "/dashboard/user/boosts",
	};

	return actionLinks[type] || "/dashboard/user";
};

/**
 * Get quick actions for user dashboard
 */
export const getUserQuickActions = () => {
	return [
		{
			title: "Apply for Jobs",
			description: "Browse and apply for available positions",
			icon: "Briefcase",
			link: "/dashboard/user/jobs",
			color: "blue",
			priority: 1,
		},
		{
			title: "Write a Review",
			description: "Share your experience with local businesses",
			icon: "Star",
			link: "/dashboard/user/reviews/create",
			color: "yellow",
			priority: 2,
		},
		{
			title: "Claim a Business",
			description: "Claim ownership of your business listing",
			icon: "Building2",
			link: "/claim-a-business",
			color: "green",
			priority: 3,
		},
		{
			title: "Refer Friends",
			description: "Invite friends and earn rewards",
			icon: "Gift",
			link: "/dashboard/user/referrals",
			color: "purple",
			priority: 4,
		},
	];
};

/**
 * Track dashboard interaction
 */
export const trackDashboardInteraction = async (userId, action, metadata = {}) => {
	return withErrorHandling(async () => {
		const { error } = await supabase.from("user_analytics").insert({
			user_id: userId,
			event_type: "dashboard_interaction",
			event_data: {
				action,
				...metadata,
				timestamp: new Date().toISOString(),
			},
		});

		if (error) throw error;

		logger.analytics({
			userId,
			action: "dashboard_interaction",
			metadata: { action, ...metadata },
		});
	}, "trackDashboardInteraction")();
};
