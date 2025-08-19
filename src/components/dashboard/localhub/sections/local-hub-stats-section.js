/**
 * LocalHub Dashboard Stats Section
 * Extracted from monolithic LocalHub dashboard page
 * Displays key revenue and business metrics for LocalHub owners
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { DollarSign, Building2, Eye, TrendingUp, TrendingDown } from "lucide-react";

const LocalHubStatsSection = ({ stats }) => {
	// Directory Stats - use API data if available, fallback to mock data
	const defaultStats = [
		{
			title: "Monthly Revenue",
			value: "$2,715",
			change: "+12.5%",
			changeType: "positive",
			icon: DollarSign,
			description: "from last month",
		},
		{
			title: "Active Businesses",
			value: "45",
			change: "+8",
			changeType: "positive",
			icon: Building2,
			description: "new this month",
		},
		{
			title: "Directory Views",
			value: "8,234",
			change: "+18.2%",
			changeType: "positive",
			icon: Eye,
			description: "from last month",
		},
		{
			title: "Your Share",
			value: "$2,172",
			change: "+$205",
			changeType: "positive",
			icon: TrendingUp,
			description: "this month",
		},
	];

	// Use stats from API if available, otherwise use default stats
	const directoryStats = stats
		? [
				{
					title: "Monthly Revenue",
					value: `$${stats.monthlyRevenue?.value?.toLocaleString() || "0"}`,
					change: stats.monthlyRevenue?.change > 0 ? `+${stats.monthlyRevenue.change.toFixed(1)}%` : `${stats.monthlyRevenue?.change?.toFixed(1) || "0"}%`,
					changeType: stats.monthlyRevenue?.changeType || "positive",
					icon: DollarSign,
					description: "from last month",
				},
				{
					title: "Active Businesses",
					value: stats.activeBusinesses?.value?.toString() || "0",
					change: stats.activeBusinesses?.change > 0 ? `+${stats.activeBusinesses.change}` : stats.activeBusinesses?.change?.toString() || "0",
					changeType: stats.activeBusinesses?.changeType || "positive",
					icon: Building2,
					description: "new this month",
				},
				{
					title: "Directory Views",
					value: stats.directoryViews?.value?.toLocaleString() || "0",
					change: stats.directoryViews?.change > 0 ? `+${stats.directoryViews.change.toFixed(1)}%` : `${stats.directoryViews?.change?.toFixed(1) || "0"}%`,
					changeType: stats.directoryViews?.changeType || "positive",
					icon: Eye,
					description: "from last month",
				},
				{
					title: "Your Share",
					value: `$${stats.yourShare?.value?.toLocaleString() || "0"}`,
					change: stats.yourShare?.change > 0 ? `+$${stats.yourShare.change}` : `$${stats.yourShare?.change || "0"}`,
					changeType: stats.yourShare?.changeType || "positive",
					icon: TrendingUp,
					description: "this month",
				},
			]
		: defaultStats;

	const getChangeColor = (changeType) => {
		return changeType === "positive" ? "text-success" : "text-destructive";
	};

	const getTrendIcon = (changeType) => {
		return changeType === "positive" ? TrendingUp : TrendingDown;
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Directory Overview</h2>
				<p className="text-muted-foreground">Your LocalHub directory performance and revenue metrics</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{directoryStats.map((stat, index) => {
					const IconComponent = stat.icon;
					const TrendIcon = getTrendIcon(stat.changeType);

					return (
						<Card key={index}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
								<IconComponent className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<div className="flex items-center text-xs">
									<TrendIcon className={`mr-1 h-3 w-3 ${getChangeColor(stat.changeType)}`} />
									<span className={getChangeColor(stat.changeType)}>{stat.change}</span>
									<span className="ml-1 text-muted-foreground">{stat.description}</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Revenue Growth Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-success" />
						Revenue Growth
					</CardTitle>
					<CardDescription>80% revenue share from business subscriptions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">Platform Fee (20%)</div>
							<div className="text-lg font-medium">$543</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-muted-foreground">Your Earnings (80%)</div>
							<div className="text-lg font-bold text-success">$2,172</div>
						</div>
					</div>
					<div className="mt-4 p-4 bg-green-50 dark:bg-success rounded-lg">
						<div className="flex items-center gap-2 text-sm text-success dark:text-success/90">
							<TrendingUp className="h-4 w-4" />
							<span className="font-medium">Growth Trend:</span>
							<span>+12.5% month-over-month</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default LocalHubStatsSection;
