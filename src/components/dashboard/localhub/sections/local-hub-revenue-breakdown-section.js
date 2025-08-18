/**
 * LocalHub Dashboard Revenue Breakdown Section
 * Extracted from monolithic LocalHub dashboard page
 * Displays subscription revenue breakdown and financial metrics
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { DollarSign, TrendingUp, Users } from "lucide-react";

const LocalHubRevenueBreakdownSection = ({ revenueData, expanded = false }) => {
	// Revenue Breakdown Data (would come from API/store in real implementation)
	const revenueBreakdown = [
		{
			plan: "Premium",
			count: 12,
			revenue: 948, // $79 * 12
			percentage: 34.9,
			color: "bg-blue-500",
		},
		{
			plan: "Pro",
			count: 18,
			revenue: 882, // $49 * 18
			percentage: 32.5,
			color: "bg-green-500",
		},
		{
			plan: "Basic",
			count: 15,
			revenue: 885, // $59 * 15
			percentage: 32.6,
			color: "bg-purple-500",
		},
	];

	const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.revenue, 0);
	const totalBusinesses = revenueBreakdown.reduce((sum, item) => sum + item.count, 0);
	const yourShare = Math.round(totalRevenue * 0.8); // 80% revenue share
	const platformFee = totalRevenue - yourShare; // 20% platform fee

	const averageRevenuePerBusiness = Math.round(totalRevenue / totalBusinesses);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="h-5 w-5" />
					Revenue Breakdown
				</CardTitle>
				<CardDescription>Monthly subscription distribution and financial overview</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Subscription Plans Breakdown */}
				<div className="space-y-4">
					{revenueBreakdown.map((item, index) => (
						<div key={index} className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2">
									<div className={`w-3 h-3 rounded ${item.color}`} />
									<span className="font-medium">{item.plan} Plan</span>
									<Badge variant="outline" className="text-xs">
										{item.count} businesses
									</Badge>
								</div>
								<span className="font-medium">${item.revenue}</span>
							</div>
							<Progress value={item.percentage} className="h-2" />
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>{item.percentage}% of total revenue</span>
								<span>${Math.round(item.revenue / item.count)}/business</span>
							</div>
						</div>
					))}
				</div>

				{/* Revenue Summary */}
				<div className="pt-4 border-t space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Total Monthly Revenue</span>
						<span className="font-bold text-lg">${totalRevenue.toLocaleString()}</span>
					</div>

					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Platform Fee (20%)</span>
						<span className="font-medium text-red-600">-${platformFee}</span>
					</div>

					<div className="flex items-center justify-between text-sm font-bold">
						<span>Your Share (80%)</span>
						<span className="text-green-600">${yourShare.toLocaleString()}</span>
					</div>
				</div>

				{/* Key Metrics */}
				<div className="pt-4 border-t">
					<div className="grid grid-cols-2 gap-4">
						<div className="p-3 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<Users className="h-3 w-3" />
								<span>Active Businesses</span>
							</div>
							<div className="text-lg font-bold">{totalBusinesses}</div>
						</div>

						<div className="p-3 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<TrendingUp className="h-3 w-3" />
								<span>Avg Revenue/Business</span>
							</div>
							<div className="text-lg font-bold">${averageRevenuePerBusiness}</div>
						</div>
					</div>
				</div>

				{/* Growth Insight */}
				<div className="pt-4 border-t">
					<div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
						<div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
							<TrendingUp className="h-4 w-4" />
							<span className="font-medium">Revenue Growth Opportunity:</span>
						</div>
						<p className="text-xs text-green-600 dark:text-green-400 mt-1">Adding 5 more Premium businesses could increase monthly revenue by $395</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LocalHubRevenueBreakdownSection;
