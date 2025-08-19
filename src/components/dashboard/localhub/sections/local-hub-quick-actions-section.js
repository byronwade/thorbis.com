/**
 * LocalHub Dashboard Quick Actions Section
 * Extracted from monolithic LocalHub dashboard page
 * Displays quick action buttons for LocalHub directory management
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Building2, Plus, Palette, BarChart3, Settings, Users, Zap, ChevronRight } from "lucide-react";

const LocalHubQuickActionsSection = () => {
	// Quick Actions for LocalHub (would come from configuration)
	const quickActions = [
		{
			title: "Add New Business",
			description: "Invite or add businesses to your directory",
			icon: Building2,
			link: "/dashboard/localhub/businesses/add",
			color: "bg-primary hover:bg-primary",
		},
		{
			title: "Customize Directory",
			description: "Update branding, layout, and appearance",
			icon: Palette,
			link: "/dashboard/localhub/customization",
			color: "bg-purple-500 hover:bg-purple-600",
		},
		{
			title: "View Analytics",
			description: "Revenue, business, and performance analytics",
			icon: BarChart3,
			link: "/dashboard/localhub/analytics",
			color: "bg-success hover:bg-success",
		},
		{
			title: "Manage Subscriptions",
			description: "Business plans, pricing, and billing",
			icon: Settings,
			link: "/dashboard/localhub/subscriptions",
			color: "bg-warning hover:bg-warning",
		},
		{
			title: "Directory Settings",
			description: "Configure directory features and policies",
			icon: Settings,
			link: "/dashboard/localhub/settings",
			color: "bg-indigo-500 hover:bg-indigo-600",
		},
		{
			title: "Create Domain",
			description: "Set up custom domain for your directory",
			icon: Plus,
			link: "/dashboard/localhub/domains",
			color: "bg-destructive hover:bg-destructive",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="h-5 w-5" />
					Quick Actions
				</CardTitle>
				<CardDescription>Common tasks and shortcuts for managing your directory</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					{quickActions.map((action, index) => {
						const IconComponent = action.icon;

						return (
							<Link key={index} href={action.link}>
								<Button variant="outline" className="w-full justify-start h-auto p-4 hover:shadow-md transition-all duration-200">
									<div className={`p-2 rounded-lg mr-4 ${action.color} text-white shadow-sm`}>
										<IconComponent className="w-5 h-5" />
									</div>
									<div className="text-left flex-1">
										<div className="font-semibold text-sm">{action.title}</div>
										<div className="text-xs text-muted-foreground mt-1">{action.description}</div>
									</div>
									<ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
								</Button>
							</Link>
						);
					})}
				</div>

				{/* Featured Action */}
				<div className="mt-6 pt-6 border-t">
					<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white/20 rounded-lg">
								<Users className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-sm">Grow Your Directory</h3>
								<p className="text-xs opacity-90 mt-1">Invite more businesses and increase your monthly revenue</p>
							</div>
						</div>
						<Link href="/dashboard/localhub/growth">
							<Button variant="secondary" size="sm" className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30">
								View Growth Tools
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>

				{/* Help Section */}
				<div className="mt-4 pt-4 border-t">
					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-3">Need help managing your directory?</p>
						<Link href="/dashboard/localhub/support">
							<Button variant="ghost" size="sm">
								LocalHub Support
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LocalHubQuickActionsSection;
