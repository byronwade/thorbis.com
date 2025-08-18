/**
 * LocalHub Dashboard Activity Section
 * Extracted from monolithic LocalHub dashboard page
 * Displays recent LocalHub directory activity and business actions
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { CreditCard, DollarSign, Building2, Star, Palette, ChevronRight, Activity } from "lucide-react";

const LocalHubActivitySection = ({ activities }) => {
	// Recent Activity Data - use API data if available, fallback to mock data
	const mockActivity = [
		{
			id: 1,
			type: "subscription",
			title: "Wade's Plumbing started Pro subscription",
			description: "New $79/month Pro subscription activated",
			time: "2 hours ago",
			icon: CreditCard,
			iconColor: "text-green-500",
			action: "View Business",
			actionLink: "/dashboard/localhub/businesses",
			badge: "Revenue +$79/mo",
			badgeColor: "bg-green-100 text-green-800",
		},
		{
			id: 2,
			type: "payment",
			title: "Payment received from Local Coffee Shop",
			description: "Monthly subscription payment processed",
			time: "5 hours ago",
			icon: DollarSign,
			iconColor: "text-blue-500",
			action: "View Payment",
			actionLink: "/dashboard/localhub/analytics",
			badge: "Payment $49",
			badgeColor: "bg-blue-100 text-blue-800",
		},
		{
			id: 3,
			type: "signup",
			title: "Downtown Dentistry joined directory",
			description: "New business signup - pending setup",
			time: "1 day ago",
			icon: Building2,
			iconColor: "text-purple-500",
			action: "Setup Business",
			actionLink: "/dashboard/localhub/businesses",
			badge: "New Business",
			badgeColor: "bg-purple-100 text-purple-800",
		},
		{
			id: 4,
			type: "upgrade",
			title: "Fresh Cuts Salon upgraded to Premium",
			description: "Upgraded from Basic to Premium plan",
			time: "2 days ago",
			icon: Star,
			iconColor: "text-yellow-500",
			action: "View Upgrade",
			actionLink: "/dashboard/localhub/analytics",
			badge: "Upgrade +$30/mo",
			badgeColor: "bg-yellow-100 text-yellow-800",
		},
		{
			id: 5,
			type: "customization",
			title: "Directory customization updated",
			description: "New branding and layout changes applied",
			time: "3 days ago",
			icon: Palette,
			iconColor: "text-indigo-500",
			action: "View Changes",
			actionLink: "/dashboard/localhub/customization",
			badge: "Customization",
			badgeColor: "bg-indigo-100 text-indigo-800",
		},
	];

	const formatTime = (time) => {
		// Simple time formatting - in real app would use proper date library
		return time;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					Recent Activity
				</CardTitle>
				<CardDescription>Latest business actions and revenue events in your directory</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{(activities || mockActivity).map((activity) => {
					const IconComponent = activity.icon;

					return (
						<div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
							<div className={`p-2 rounded-full bg-background border ${activity.iconColor}`}>
								<IconComponent className="h-4 w-4" />
							</div>

							<div className="flex-1 space-y-2">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="text-sm font-medium leading-none">{activity.title}</h4>
											{activity.badge && (
												<Badge variant="secondary" className={`text-xs ${activity.badgeColor}`}>
													{activity.badge}
												</Badge>
											)}
										</div>
										<p className="text-sm text-muted-foreground">{activity.description}</p>
									</div>
									<time className="text-xs text-muted-foreground">{formatTime(activity.time)}</time>
								</div>

								<Link href={activity.actionLink}>
									<Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
										{activity.action}
										<ChevronRight className="ml-1 h-3 w-3" />
									</Button>
								</Link>
							</div>
						</div>
					);
				})}

				<div className="pt-4 border-t">
					<Link href="/dashboard/localhub/activity">
						<Button variant="outline" className="w-full">
							View All Activity
							<ChevronRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>

				{/* Activity Summary */}
				<div className="pt-4 border-t">
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<div className="text-lg font-bold text-green-600">+3</div>
							<div className="text-xs text-muted-foreground">New Businesses</div>
						</div>
						<div>
							<div className="text-lg font-bold text-blue-600">$387</div>
							<div className="text-xs text-muted-foreground">This Week</div>
						</div>
						<div>
							<div className="text-lg font-bold text-purple-600">2</div>
							<div className="text-xs text-muted-foreground">Upgrades</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LocalHubActivitySection;
