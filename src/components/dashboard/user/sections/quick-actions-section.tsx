/**
 * User Dashboard Quick Actions Section - TypeScript Implementation
 * Extracted from monolithic user dashboard page
 * Displays quick action buttons for common user tasks with full type safety
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Briefcase, Star, Building2, Gift, Plus, ArrowRight } from "lucide-react";
import type { QuickAction } from "@/types/dashboard";

/**
 * Quick Actions Section Component
 *
 * @description Displays action buttons for common user tasks
 * @returns React functional component with quick action cards
 */
const QuickActionsSection: React.FC = () => {
	// Quick Actions Data
	const quickActions: QuickAction[] = [
		{
			title: "Apply for Jobs",
			description: "Browse and apply for available positions",
			icon: Briefcase,
			link: "/dashboard/user/jobs",
			color: "bg-primary hover:bg-primary",
		},
		{
			title: "Write a Review",
			description: "Share your experience with local businesses",
			icon: Star,
			link: "/dashboard/user/reviews",
			color: "bg-warning hover:bg-warning",
		},
		{
			title: "Claim a Business",
			description: "Claim ownership of your business listing",
			icon: Building2,
			link: "/claim-business",
			color: "bg-success hover:bg-success",
		},
		{
			title: "Refer Friends",
			description: "Invite friends and earn rewards",
			icon: Gift,
			link: "/dashboard/user/referrals",
			color: "bg-purple-500 hover:bg-purple-600",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
				<CardDescription>Common tasks and shortcuts for your account</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					{quickActions.map((action, index) => {
						const IconComponent = action.icon;

						return (
							<Link key={index} href={action.link}>
								<div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:bg-accent/5 transition-colors">
									<div className="flex items-start gap-4">
										<div className={`p-3 rounded-lg text-white ${action.color} transition-colors`}>
											<IconComponent className="h-6 w-6" />
										</div>
										<div className="flex-1 space-y-1">
											<h4 className="text-sm font-medium leading-none group-hover:text-accent-foreground transition-colors">{action.title}</h4>
											<p className="text-sm text-muted-foreground">{action.description}</p>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-hover:translate-x-1 transition-all" />
									</div>
								</div>
							</Link>
						);
					})}
				</div>

				{/* Add New Action */}
				<div className="pt-4 border-t">
					<Button variant="outline" className="w-full" asChild>
						<Link href="/dashboard/user/settings">
							<Plus className="mr-2 h-4 w-4" />
							Customize Dashboard
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default QuickActionsSection;
