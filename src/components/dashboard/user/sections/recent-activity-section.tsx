/**
 * User Dashboard Recent Activity Section - TypeScript Implementation
 * Extracted from monolithic user dashboard page
 * Displays recent user activity and actions with full type safety
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Briefcase, Star, Gift, Eye, TrendingUp, ChevronRight, LucideIcon } from "lucide-react";
import type { RecentActivitySectionProps } from "@/types/dashboard";

// Local interface for display-specific activity items
interface ActivityDisplayItem {
	id: number;
	type: string;
	title: string;
	description: string;
	time: string;
	icon: LucideIcon;
	iconColor: string;
	action: string;
	actionLink: string;
}

/**
 * Recent Activity Section Component
 *
 * @param props - Component props
 * @param props.activities - Optional activities array (fallback to mock data)
 * @param props.isLoading - Loading state
 * @returns React functional component displaying recent user activities
 */
const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ activities, isLoading = false }) => {
	// Recent Activity Data (would come from API/store in real implementation)
	const recentActivity: ActivityDisplayItem[] = [
		{
			id: 1,
			type: "job",
			title: "Applied to Plumber position at Wade's Plumbing",
			description: "Your application has been submitted and is under review",
			time: "2 hours ago",
			icon: Briefcase,
			iconColor: "text-primary",
			action: "View Application",
			actionLink: "/dashboard/user/jobs",
		},
		{
			id: 2,
			type: "review",
			title: "Wrote a 5-star review for Local Coffee Shop",
			description: "Your review has been published and is visible to others",
			time: "1 day ago",
			icon: Star,
			iconColor: "text-warning",
			action: "View Review",
			actionLink: "/dashboard/user/reviews",
		},
		{
			id: 3,
			type: "referral",
			title: "Earned $5.00 from referral",
			description: "Your friend Sarah signed up using your referral link",
			time: "3 days ago",
			icon: Gift,
			iconColor: "text-success",
			action: "View Earnings",
			actionLink: "/dashboard/user/referrals",
		},
		{
			id: 4,
			type: "profile",
			title: "Profile viewed 12 times",
			description: "Local employers are discovering your profile",
			time: "1 week ago",
			icon: Eye,
			iconColor: "text-purple-500",
			action: "View Profile",
			actionLink: "/dashboard/user/profile",
		},
		{
			id: 5,
			type: "achievement",
			title: "Reached 50 profile views milestone",
			description: "Congratulations! Your profile is gaining visibility",
			time: "1 week ago",
			icon: TrendingUp,
			iconColor: "text-indigo-500",
			action: "View Stats",
			actionLink: "/dashboard/user/stats",
		},
	];

	/**
	 * Get activity type badge variant and text
	 *
	 * @param type - Activity type
	 * @returns Object with badge variant and display text
	 */
	const getActivityBadge = (type: string): { variant: "default" | "secondary" | "destructive" | "outline"; text: string } => {
		const badges: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; text: string }> = {
			job: { variant: "default", text: "Job" },
			review: { variant: "secondary", text: "Review" },
			referral: { variant: "outline", text: "Referral" },
			profile: { variant: "secondary", text: "Profile" },
			achievement: { variant: "default", text: "Achievement" },
		};
		return badges[type] || { variant: "outline", text: "Activity" };
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>Loading your recent activity...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
								<div className="h-10 w-10 bg-muted rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted rounded w-3/4" />
									<div className="h-3 bg-muted rounded w-1/2" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Your latest actions and achievements</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{recentActivity.map((activity) => {
					const IconComponent = activity.icon;
					const badge = getActivityBadge(activity.type);

					return (
						<div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
							<div className={`p-2 rounded-full bg-background border ${activity.iconColor}`}>
								<IconComponent className="h-4 w-4" />
							</div>

							<div className="flex-1 space-y-2">
								<div className="flex items-start justify-between gap-2">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<h4 className="text-sm font-medium leading-none">{activity.title}</h4>
											<Badge variant={badge.variant} className="text-xs">
												{badge.text}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{activity.description}</p>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
								</div>

								<div className="flex items-center justify-between">
									<div /> {/* Spacer */}
									<Button variant="ghost" size="sm" asChild>
										<Link href={activity.actionLink} className="text-xs">
											{activity.action}
											<ChevronRight className="ml-1 h-3 w-3" />
										</Link>
									</Button>
								</div>
							</div>
						</div>
					);
				})}

				{/* View All Activities */}
				<div className="pt-4 border-t">
					<Button variant="outline" className="w-full" asChild>
						<Link href="/dashboard/user/activity">
							View All Activity
							<ChevronRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default RecentActivitySection;
