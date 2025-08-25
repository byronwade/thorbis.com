/**
 * User Dashboard Page
 * Now using the new modular UserDashboardPage component
 * Reduced from 647 lines to clean implementation
 * Following Next.js best practices for component organization
 */

import UserDashboardPage from "@components/dashboard/user/user-dashboard-page";
import { getServerSession, createSupabaseServerClient } from "@lib/database/supabase/server";
import { UserQueries } from "@lib/database/supabase/queries/user";
import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "User Dashboard | Thorbis",
		description: "Manage your reviews, activity, and saved businesses.",
		path: "/dashboard/user",
		keywords: ["dashboard", "user profile", "reviews", "saved businesses"],
		robots: { index: false, follow: false }
	});
}

export default async function Page() {
	const supabase = await createSupabaseServerClient();
	const session = await getServerSession();

	const userId = session?.user?.id;

	// Remove automatic redirect - handle no user session gracefully
	// if (!userId) return redirect("/login?redirectTo=/dashboard/user");

	// If no user session, provide empty data instead of redirecting
	const serverData = userId ? await Promise.all([
		UserQueries.getUserReviews(userId, 1, 5).catch(() => ({ reviews: [], total: 0 })),
		supabase
			.from("user_activities")
			.select(
				`id, type, title, description, created_at, metadata`
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(5)
			.then(({ data }) => data || [])
			.catch(() => []),
		UserQueries.getUserStats(userId).catch(() => ({
			businessCount: 0,
			reviewCount: 0,
			averageRating: 0,
			totalHelpfulVotes: 0
		}))
	]).then(([reviewsResult, recentActivityResult, statsResult]) => ({
		stats: statsResult,
		recentActivity: recentActivityResult,
		reviews: reviewsResult?.reviews || [],
		savedBusinesses: [],
		user: { id: userId }
	})) : {
		stats: {
			businessCount: 0,
			reviewCount: 0,
			averageRating: 0,
			totalHelpfulVotes: 0
		},
		recentActivity: [],
		reviews: [],
		savedBusinesses: [],
		user: null
	};

	return <UserDashboardPage serverData={serverData} />;
}
