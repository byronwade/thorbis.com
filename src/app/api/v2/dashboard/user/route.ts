/**
 * User Dashboard API Endpoint
 * Provides comprehensive user dashboard data with performance optimization
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, type ApiRequest } from "@lib/api/middleware";

// User dashboard query validation schema
const userDashboardQuerySchema = z.object({
	sections: z
		.array(z.enum(["stats", "activity", "profile", "notifications", "quick_actions"]))
		.optional()
		.default(["stats", "activity", "profile"]),
	period: z.enum(["7d", "30d", "90d"]).default("30d"),
	limit: z.number().min(1).max(100).default(10),
});

type UserDashboardQuery = z.infer<typeof userDashboardQuerySchema>;

/**
 * Get comprehensive user dashboard data
 */
async function getUserDashboard(req: ApiRequest, queryParams: UserDashboardQuery): Promise<NextResponse> {
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

		// Calculate date range for metrics
		const now = new Date();
		const periodDays = { "7d": 7, "30d": 30, "90d": 90 }[queryParams.period];
		const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

		const dashboardData: any = {};

		// Fetch user stats if requested
		if (queryParams.sections.includes("stats")) {
			const statsStart = performance.now();

			// Get profile views (from user_analytics table)
			const { data: profileViews } = await supabase.from("user_analytics").select("views").eq("user_id", req.user.id).gte("date", startDate.toISOString().split("T")[0]).order("date", { ascending: false });

			// Get job applications count
			const { data: jobApplications } = await supabase.from("job_applications").select("id").eq("applicant_id", req.user.id).gte("created_at", startDate.toISOString());

			// Get reviews written by user
			const { data: userReviews } = await supabase.from("reviews").select("id, rating, created_at").eq("user_id", req.user.id).gte("created_at", startDate.toISOString());

			// Get referral earnings
			const { data: referralEarnings } = await supabase.from("user_referrals").select("commission_amount, created_at").eq("referrer_id", req.user.id).eq("status", "paid").gte("created_at", startDate.toISOString());

			// Calculate previous period for comparison
			const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

			// Get previous period data for comparison
			const { data: prevProfileViews } = await supabase.from("user_analytics").select("views").eq("user_id", req.user.id).gte("date", prevStartDate.toISOString().split("T")[0]).lt("date", startDate.toISOString().split("T")[0]);

			const { data: prevJobApplications } = await supabase.from("job_applications").select("id").eq("applicant_id", req.user.id).gte("created_at", prevStartDate.toISOString()).lt("created_at", startDate.toISOString());

			const { data: prevUserReviews } = await supabase.from("reviews").select("id").eq("user_id", req.user.id).gte("created_at", prevStartDate.toISOString()).lt("created_at", startDate.toISOString());

			const { data: prevReferralEarnings } = await supabase.from("user_referrals").select("commission_amount").eq("referrer_id", req.user.id).eq("status", "paid").gte("created_at", prevStartDate.toISOString()).lt("created_at", startDate.toISOString());

			// Calculate metrics
			const currentViews = profileViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const prevViews = prevProfileViews?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
			const viewsChange = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;

			const currentApplications = jobApplications?.length || 0;
			const prevApplications = prevJobApplications?.length || 0;
			const applicationsChange = currentApplications - prevApplications;

			const currentReviews = userReviews?.length || 0;
			const prevReviews = prevUserReviews?.length || 0;
			const reviewsChange = currentReviews - prevReviews;

			const currentEarnings = referralEarnings?.reduce((sum, record) => sum + (record.commission_amount || 0), 0) || 0;
			const prevEarnings = prevReferralEarnings?.reduce((sum, record) => sum + (record.commission_amount || 0), 0) || 0;
			const earningsChange = currentEarnings - prevEarnings;

			dashboardData.stats = {
				profileViews: {
					value: currentViews.toLocaleString(),
					change: viewsChange > 0 ? `+${viewsChange.toFixed(1)}%` : `${viewsChange.toFixed(1)}%`,
					trend: viewsChange >= 0 ? "up" : "down",
					description: `Views in last ${queryParams.period}`,
				},
				jobApplications: {
					value: currentApplications.toString(),
					change: applicationsChange > 0 ? `+${applicationsChange}` : applicationsChange.toString(),
					trend: applicationsChange >= 0 ? "up" : "down",
					description: `Applications in last ${queryParams.period}`,
				},
				reviewsWritten: {
					value: currentReviews.toString(),
					change: reviewsChange > 0 ? `+${reviewsChange}` : reviewsChange.toString(),
					trend: reviewsChange >= 0 ? "up" : "down",
					description: `Reviews in last ${queryParams.period}`,
				},
				earnings: {
					value: `$${currentEarnings.toFixed(2)}`,
					change: earningsChange > 0 ? `+$${earningsChange.toFixed(2)}` : `$${earningsChange.toFixed(2)}`,
					trend: earningsChange >= 0 ? "up" : "down",
					description: `Referral earnings in last ${queryParams.period}`,
				},
			};

			const statsTime = performance.now() - statsStart;
			logger.performance(`User stats calculation completed in ${statsTime.toFixed(2)}ms`);
		}

		// Fetch recent activity if requested
		if (queryParams.sections.includes("activity")) {
			const activityStart = performance.now();

			const { data: recentActivities } = await supabase
				.from("user_activities")
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
				.eq("user_id", req.user.id)
				.order("created_at", { ascending: false })
				.limit(queryParams.limit);

			dashboardData.activity = recentActivities || [];

			const activityTime = performance.now() - activityStart;
			logger.performance(`User activity fetch completed in ${activityTime.toFixed(2)}ms`);
		}

		// Fetch profile completion if requested
		if (queryParams.sections.includes("profile")) {
			const profileStart = performance.now();

			// Get complete user profile
			const { data: userProfile } = await supabase.from("users").select("*").eq("id", req.user.id).single();

			// Calculate profile completion
			const profileSections = [
				{ key: "basicInfo", completed: !!(userProfile?.name && userProfile?.email) },
				{ key: "contactDetails", completed: !!(userProfile?.phone && userProfile?.location) },
				{ key: "workExperience", completed: !!(userProfile?.metadata?.work_experience?.length > 0) },
				{ key: "skills", completed: !!(userProfile?.metadata?.skills?.length > 0) },
				{ key: "resume", completed: !!userProfile?.metadata?.resume_url },
			];

			const completedSections = profileSections.filter((section) => section.completed);
			const missingSections = profileSections.filter((section) => !section.completed);
			const completionPercentage = Math.round((completedSections.length / profileSections.length) * 100);

			dashboardData.profile = {
				completion: {
					percentage: completionPercentage,
					completedSections: completedSections.map((s) => s.key),
					missingSections: missingSections.map((s) => s.key),
				},
				user: userProfile,
			};

			const profileTime = performance.now() - profileStart;
			logger.performance(`Profile completion calculation completed in ${profileTime.toFixed(2)}ms`);
		}

		// Fetch notifications if requested
		if (queryParams.sections.includes("notifications")) {
			const notificationsStart = performance.now();

			const { data: notifications } = await supabase.from("notifications").select("*").eq("user_id", req.user.id).eq("read", false).order("created_at", { ascending: false }).limit(10);

			dashboardData.notifications = notifications || [];

			const notificationsTime = performance.now() - notificationsStart;
			logger.performance(`Notifications fetch completed in ${notificationsTime.toFixed(2)}ms`);
		}

		const duration = performance.now() - startTime;
		logger.performance(`User dashboard API completed in ${duration.toFixed(2)}ms`);

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
		logger.error("User dashboard API error:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch dashboard data");
	}
}

// Export GET handler with middleware
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getUserDashboard, {
		ttl: 300, // 5 minutes cache for dashboard data
		keyGenerator: (req) => `user-dashboard:${req.user?.id}:${req.nextUrl.search}`,
	}),
	withAuth(getUserDashboard, {
		requiredRoles: ["user", "business_owner", "admin"],
		requireEmailVerification: false,
	}),
	withValidation(getUserDashboard, userDashboardQuerySchema)
);
