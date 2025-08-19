/**
 * User Dashboard Stats Overview Section - TypeScript Implementation
 * Extracted from monolithic user dashboard page
 * Displays key metrics and statistics for user activity with full type safety
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Star, Eye, Gift, LucideIcon } from "lucide-react";
import type { DashboardStat, StatsOverviewSectionProps, TrendDirection } from "@/types/dashboard";

// Local interface for profile completion display
interface ProfileCompletionData {
	percentage: number;
	sections: Array<{
		name: string;
		completed: boolean;
	}>;
}

/**
 * Stats Overview Section Component
 *
 * @param props - Component props
 * @param props.user - Current user data for personalization
 * @returns React functional component displaying user statistics
 */
const StatsOverviewSection: React.FC<StatsOverviewSectionProps> = ({ user }) => {
	// Dashboard Stats (would come from API/store in real implementation)
	const dashboardStats: DashboardStat[] = [
		{
			title: "Profile Views",
			value: "1,234",
			change: "+12%",
			trend: "up",
			icon: Eye,
			description: "Total views this month",
		},
		{
			title: "Job Applications",
			value: "23",
			change: "+5",
			trend: "up",
			icon: Briefcase,
			description: "Applications this month",
		},
		{
			title: "Reviews Written",
			value: "47",
			change: "+3",
			trend: "up",
			icon: Star,
			description: "Total reviews submitted",
		},
		{
			title: "Earnings",
			value: "$156.78",
			change: "+$24.50",
			trend: "up",
			icon: DollarSign,
			description: "Referral earnings",
		},
	];

	// Profile completion data (would come from API/store in real implementation)
	const profileCompletion: ProfileCompletionData = {
		percentage: 75,
		sections: [
			{ name: "Basic Info", completed: true },
			{ name: "Contact Details", completed: true },
			{ name: "Work Experience", completed: false },
			{ name: "Skills", completed: true },
		],
	};

	/**
	 * Get icon color based on trend direction
	 *
	 * @param trend - Trend direction
	 * @returns CSS class for trend color
	 */
	const getIconColor = (trend: TrendDirection): string => {
		return trend === "up" ? "text-success" : "text-destructive";
	};

	/**
	 * Get trend icon component based on direction
	 *
	 * @param trend - Trend direction
	 * @returns Lucide icon component
	 */
	const getTrendIcon = (trend: TrendDirection): LucideIcon => {
		return trend === "up" ? TrendingUp : TrendingDown;
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
				<p className="text-muted-foreground">Your activity and performance metrics</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{dashboardStats.map((stat, index) => {
					const IconComponent = stat.icon;
					const TrendIcon = getTrendIcon(stat.trend);

					return (
						<Card key={index}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
								<IconComponent className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<div className="flex items-center text-xs text-muted-foreground">
									<TrendIcon className={`mr-1 h-3 w-3 ${getIconColor(stat.trend)}`} />
									<span className={getIconColor(stat.trend)}>{stat.change}</span>
									<span className="ml-1">{stat.description}</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Profile Completion */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Gift className="h-5 w-5" />
						Profile Completion
					</CardTitle>
					<CardDescription>Complete your profile to get more visibility</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Progress</span>
						<Badge variant="secondary">{profileCompletion.percentage}% Complete</Badge>
					</div>
					<Progress value={profileCompletion.percentage} className="h-2" />
					<div className="grid grid-cols-2 gap-3">
						{profileCompletion.sections.map((section, index) => (
							<div key={index} className="flex items-center gap-2">
								<div className={`h-2 w-2 rounded-full ${section.completed ? "bg-success" : "bg-muted"}`} />
								<span className="text-sm text-muted-foreground">{section.name}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default StatsOverviewSection;
