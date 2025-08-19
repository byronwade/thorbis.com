/**
 * User Dashboard System Updates Section - TypeScript Implementation
 * Extracted from monolithic user dashboard page
 * Displays system updates, changelogs, and new features with full type safety
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Briefcase, Star, User, Shield, Gift, ChevronDown, ChevronUp, ExternalLink, LucideIcon } from "lucide-react";
import type { SystemUpdatesSectionProps, SystemUpdateType } from "@/types/dashboard";

// Local interface for display-specific system updates
interface SystemUpdateDisplayItem {
	id: number;
	type: SystemUpdateType;
	title: string;
	description: string;
	date: string;
	version: string;
	icon: LucideIcon;
	iconColor: string;
	badge: string;
	badgeColor: string;
}

/**
 * System Updates Section Component
 *
 * @param props - Component props
 * @param props.updates - Optional updates array (fallback to mock data)
 * @param props.isLoading - Loading state
 * @returns React functional component displaying system updates
 */
const SystemUpdatesSection: React.FC<SystemUpdatesSectionProps> = ({ updates, isLoading = false }) => {
	const [showAllUpdates, setShowAllUpdates] = useState<boolean>(false);

	// System Updates Data (would come from API/store in real implementation)
	const systemUpdates: SystemUpdateDisplayItem[] = [
		{
			id: 1,
			type: "feature",
			title: "Enhanced Job Application Tracking",
			description: "New detailed tracking for job applications with status updates",
			date: "2024-01-25",
			version: "v2.1.0",
			icon: Briefcase,
			iconColor: "text-primary",
			badge: "New",
			badgeColor: "bg-primary/10 text-primary",
		},
		{
			id: 2,
			type: "improvement",
			title: "Improved Review System",
			description: "Enhanced review writing experience with better formatting options",
			date: "2024-01-24",
			version: "v2.0.8",
			icon: Star,
			iconColor: "text-success",
			badge: "Improved",
			badgeColor: "bg-success/10 text-success",
		},
		{
			id: 3,
			type: "fix",
			title: "Profile Visibility Fixes",
			description: "Fixed issues with profile visibility and contact information",
			date: "2024-01-23",
			version: "v2.0.7",
			icon: User,
			iconColor: "text-destructive",
			badge: "Fixed",
			badgeColor: "bg-destructive/10 text-destructive",
		},
		{
			id: 4,
			type: "security",
			title: "Enhanced Account Security",
			description: "Improved authentication and data protection measures",
			date: "2024-01-22",
			version: "v2.0.6",
			icon: Shield,
			iconColor: "text-purple-500",
			badge: "Security",
			badgeColor: "bg-purple-100 text-purple-800",
		},
		{
			id: 5,
			type: "feature",
			title: "Referral Program Enhancements",
			description: "New referral tracking and reward system improvements",
			date: "2024-01-21",
			version: "v2.0.5",
			icon: Gift,
			iconColor: "text-indigo-500",
			badge: "New",
			badgeColor: "bg-indigo-100 text-indigo-800",
		},
	];

	const displayedUpdates = showAllUpdates ? systemUpdates : systemUpdates.slice(0, 3);

	/**
	 * Format date string to localized format
	 *
	 * @param dateString - ISO date string
	 * @returns Formatted date string
	 */
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>System Updates</CardTitle>
					<CardDescription>Loading latest updates...</CardDescription>
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
				<CardTitle>System Updates</CardTitle>
				<CardDescription>Latest features, improvements, and fixes to the platform</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{displayedUpdates.map((update) => {
					const IconComponent = update.icon;

					return (
						<div key={update.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
							<div className={`p-2 rounded-full bg-background border ${update.iconColor}`}>
								<IconComponent className="h-4 w-4" />
							</div>

							<div className="flex-1 space-y-2">
								<div className="flex items-start justify-between gap-2">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<h4 className="text-sm font-medium leading-none">{update.title}</h4>
											<Badge variant="secondary" className={`text-xs ${update.badgeColor}`}>
												{update.badge}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{update.description}</p>
									</div>
									<div className="text-right text-xs text-muted-foreground">
										<div>{formatDate(update.date)}</div>
										<div className="font-mono">{update.version}</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{systemUpdates.length > 3 && (
					<div className="pt-4 border-t">
						<Button variant="ghost" onClick={() => setShowAllUpdates(!showAllUpdates)} className="w-full">
							{showAllUpdates ? (
								<>
									Show Less
									<ChevronUp className="ml-2 h-4 w-4" />
								</>
							) : (
								<>
									Show All Updates ({systemUpdates.length - 3} more)
									<ChevronDown className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				)}

				<div className="pt-4 border-t">
					<Button variant="outline" className="w-full">
						View Full Changelog
						<ExternalLink className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default SystemUpdatesSection;
