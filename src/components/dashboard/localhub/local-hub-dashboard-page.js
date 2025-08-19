/**
 * LocalHub Dashboard Page - Comprehensive Implementation
 * Enterprise-grade LocalHub directory management dashboard
 * Features advanced analytics, revenue tracking, and business management tools
 */

"use client";

import React from "react";
import { 
  LocalHubStatsSection, 
  LocalHubActivitySection, 
  LocalHubQuickActionsSection, 
  LocalHubRevenueBreakdownSection, 
  LocalHubDirectoryHealthSection,
  LocalHubBusinessManagementSection,
  LocalHubGrowthAnalyticsSection,
  LocalHubPerformanceInsightsSection
} from "./sections";
import { useLocalHubDashboard } from "@lib/hooks/dashboard/use-local-hub-dashboard";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { RefreshCw, Building2, TrendingUp, Users, DollarSign, BarChart3, Settings } from "lucide-react";

const LocalHubDashboardPage = () => {
	const { 
		isLoading, 
		refreshing, 
		refreshDashboard, 
		directoryStats, 
		businessMetrics,
		recentActivity,
		revenueBreakdown,
		directoryHealth,
		trackDashboardAction
	} = useLocalHubDashboard();

	if (isLoading) {
		return <LocalHubDashboardSkeleton />;
	}

	const handleTabChange = (value) => {
		trackDashboardAction("tab_switch", { tab: value });
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* Dashboard Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
						<Building2 className="h-8 w-8 text-primary" />
						LocalHub Dashboard
						{businessMetrics && (
							<Badge variant="secondary" className="ml-2">
								{businessMetrics.newBusinessesThisWeek || 0} New This Week
							</Badge>
						)}
					</h1>
					<p className="text-muted-foreground">
						Comprehensive directory management with real-time analytics and revenue insights
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
						<RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
						{refreshing ? "Refreshing..." : "Refresh"}
					</Button>
					<Button onClick={() => trackDashboardAction("export_data")}>
						Export Data
					</Button>
				</div>
			</div>

			{/* Key Metrics Summary */}
			{businessMetrics && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<DollarSign className="h-8 w-8 text-success" />
								<div className="ml-4">
									<div className="text-2xl font-bold">${businessMetrics.averageRevenuePerBusiness || 0}</div>
									<p className="text-xs text-muted-foreground">Avg Revenue/Business</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<Users className="h-8 w-8 text-primary" />
								<div className="ml-4">
									<div className="text-2xl font-bold">+{businessMetrics.newBusinessesThisWeek || 0}</div>
									<p className="text-xs text-muted-foreground">New This Week</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<TrendingUp className="h-8 w-8 text-purple-600" />
								<div className="ml-4">
									<div className="text-2xl font-bold">{businessMetrics.upgradesThisWeek || 0}</div>
									<p className="text-xs text-muted-foreground">Upgrades This Week</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<BarChart3 className="h-8 w-8 text-warning" />
								<div className="ml-4">
									<div className="text-2xl font-bold">+{businessMetrics.monthlyGrowthRate || 0}%</div>
									<p className="text-xs text-muted-foreground">Monthly Growth</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Main Dashboard Tabs */}
			<Tabs defaultValue="overview" className="space-y-6" onValueChange={handleTabChange}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="businesses" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						Businesses
					</TabsTrigger>
					<TabsTrigger value="revenue" className="flex items-center gap-2">
						<DollarSign className="h-4 w-4" />
						Revenue
					</TabsTrigger>
					<TabsTrigger value="analytics" className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4" />
						Analytics
					</TabsTrigger>
					<TabsTrigger value="settings" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Left Column - Main Content */}
						<div className="lg:col-span-2 space-y-8">
							<LocalHubStatsSection stats={directoryStats} />
							<LocalHubActivitySection activities={recentActivity} />
							<LocalHubPerformanceInsightsSection />
						</div>

						{/* Right Column - Sidebar */}
						<div className="space-y-8">
							<LocalHubQuickActionsSection />
							<LocalHubRevenueBreakdownSection revenueData={revenueBreakdown} />
							<LocalHubDirectoryHealthSection healthData={directoryHealth} />
						</div>
					</div>
				</TabsContent>

				{/* Businesses Tab */}
				<TabsContent value="businesses" className="space-y-6">
					<LocalHubBusinessManagementSection />
				</TabsContent>

				{/* Revenue Tab */}
				<TabsContent value="revenue" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						<LocalHubRevenueBreakdownSection revenueData={revenueBreakdown} expanded />
						<LocalHubGrowthAnalyticsSection />
					</div>
				</TabsContent>

				{/* Analytics Tab */}
				<TabsContent value="analytics" className="space-y-6">
					<LocalHubGrowthAnalyticsSection />
					<LocalHubPerformanceInsightsSection expanded />
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Directory Settings</CardTitle>
							<CardDescription>Configure your LocalHub directory preferences and features</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<p className="text-muted-foreground">Settings panel will be implemented here</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

/**
 * Loading skeleton for LocalHub dashboard
 */
const LocalHubDashboardSkeleton = () => {
	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-80" />
					<Skeleton className="h-4 w-96" />
				</div>
				<Skeleton className="h-10 w-24" />
			</div>

			{/* Content Skeleton */}
			<div className="grid gap-8 lg:grid-cols-3">
				{/* Left Column */}
				<div className="lg:col-span-2 space-y-8">
					{/* Stats Section Skeleton */}
					<div className="space-y-6">
						<div className="space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-64" />
						</div>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="p-6 border rounded-lg space-y-3">
									<div className="flex items-center justify-between">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-4" />
									</div>
									<Skeleton className="h-8 w-20" />
									<Skeleton className="h-3 w-24" />
								</div>
							))}
						</div>
					</div>

					{/* Activity Section Skeleton */}
					<div className="p-6 border rounded-lg space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-36" />
							<Skeleton className="h-4 w-72" />
						</div>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-64" />
									<Skeleton className="h-3 w-48" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right Column */}
				<div className="space-y-8">
					{/* Quick Actions Skeleton */}
					<div className="p-6 border rounded-lg space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-56" />
						</div>
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="p-4 border rounded-lg">
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-lg" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-28" />
										<Skeleton className="h-3 w-36" />
									</div>
									<Skeleton className="h-4 w-4" />
								</div>
							</div>
						))}
					</div>

					{/* Revenue Breakdown Skeleton */}
					<div className="p-6 border rounded-lg space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-52" />
						</div>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-12" />
								</div>
								<Skeleton className="h-2 w-full" />
							</div>
						))}
					</div>

					{/* Directory Health Skeleton */}
					<div className="p-6 border rounded-lg space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-36" />
							<Skeleton className="h-4 w-48" />
						</div>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-12" />
								</div>
								<Skeleton className="h-2 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default LocalHubDashboardPage;
