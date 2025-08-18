/**
 * LocalHub Growth Analytics Section - Comprehensive TypeScript Implementation
 * Advanced growth analytics and forecasting for LocalHub directory owners
 * Features revenue projections, growth drivers, and business intelligence insights
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { 
	TrendingUp, 
	TrendingDown, 
	BarChart3, 
	Target, 
	DollarSign, 
	Users, 
	Calendar,
	ArrowUp,
	ArrowDown,
	Minus,
	Activity,
	Zap,
	Star,
	Building2
} from "lucide-react";
import type { LocalHubGrowthAnalyticsSectionProps, GrowthAnalytics } from "@/types/dashboard";

/**
 * Growth Analytics Section Component
 * 
 * @description Comprehensive growth analytics with projections and insights
 * @param growthData - Growth analytics data
 */
const LocalHubGrowthAnalyticsSection: React.FC<LocalHubGrowthAnalyticsSectionProps> = ({ 
	growthData 
}) => {
	const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");
	const [selectedMetric, setSelectedMetric] = useState<"revenue" | "businesses" | "retention">("revenue");

	// Mock data if no growth data provided
	const mockGrowthData: GrowthAnalytics = useMemo(() => ({
		monthlyGrowthRate: 12.5,
		quarterlyGrowthRate: 35.2,
		yearOverYearGrowth: 145.8,
		businessRetentionRate: 94.2,
		revenueProjections: [
			{ month: "Jan", projected: 2800, actual: 2715 },
			{ month: "Feb", projected: 3150, actual: 3024 },
			{ month: "Mar", projected: 3500, actual: undefined },
			{ month: "Apr", projected: 3850, actual: undefined },
			{ month: "May", projected: 4200, actual: undefined },
			{ month: "Jun", projected: 4500, actual: undefined }
		],
		topGrowthDrivers: [
			{ factor: "Premium Plan Upgrades", impact: 35.2, trend: "up" },
			{ factor: "New Business Acquisitions", impact: 28.7, trend: "up" },
			{ factor: "Feature Adoption", impact: 18.3, trend: "up" },
			{ factor: "Customer Retention", impact: 12.1, trend: "stable" },
			{ factor: "Referral Program", impact: 5.7, trend: "down" }
		]
	}), []);

	const analytics = growthData || mockGrowthData;

	const getGrowthIcon = (trend: "up" | "down" | "stable") => {
		switch (trend) {
			case "up":
				return <ArrowUp className="h-4 w-4 text-green-500" />;
			case "down":
				return <ArrowDown className="h-4 w-4 text-red-500" />;
			default:
				return <Minus className="h-4 w-4 text-gray-500" />;
		}
	};

	const getGrowthColor = (trend: "up" | "down" | "stable") => {
		switch (trend) {
			case "up":
				return "text-green-600";
			case "down":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getTrendBadge = (trend: "up" | "down" | "stable") => {
		switch (trend) {
			case "up":
				return "bg-green-100 text-green-800";
			case "down":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Calculate next month projection
	const nextMonthProjection = useMemo(() => {
		const currentRevenue = 2715; // This would come from actual data
		const growthRate = analytics.monthlyGrowthRate / 100;
		return Math.round(currentRevenue * (1 + growthRate));
	}, [analytics.monthlyGrowthRate]);

	// Calculate total projected revenue
	const totalProjectedRevenue = useMemo(() => {
		return analytics.revenueProjections.reduce((sum, item) => sum + item.projected, 0);
	}, [analytics.revenueProjections]);

	return (
		<div className="space-y-6">
			{/* Growth Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
								<div className="flex items-center space-x-2">
									<div className="text-2xl font-bold text-green-600">+{analytics.monthlyGrowthRate}%</div>
									<TrendingUp className="h-4 w-4 text-green-500" />
								</div>
							</div>
							<div className="p-3 bg-green-100 rounded-full">
								<BarChart3 className="h-6 w-6 text-green-600" />
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-2">vs. last month</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Quarterly Growth</p>
								<div className="flex items-center space-x-2">
									<div className="text-2xl font-bold text-blue-600">+{analytics.quarterlyGrowthRate}%</div>
									<TrendingUp className="h-4 w-4 text-blue-500" />
								</div>
							</div>
							<div className="p-3 bg-blue-100 rounded-full">
								<Target className="h-6 w-6 text-blue-600" />
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-2">vs. last quarter</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
								<div className="flex items-center space-x-2">
									<div className="text-2xl font-bold text-purple-600">{analytics.businessRetentionRate}%</div>
									<TrendingUp className="h-4 w-4 text-purple-500" />
								</div>
							</div>
							<div className="p-3 bg-purple-100 rounded-full">
								<Users className="h-6 w-6 text-purple-600" />
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-2">business retention</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">YoY Growth</p>
								<div className="flex items-center space-x-2">
									<div className="text-2xl font-bold text-orange-600">+{analytics.yearOverYearGrowth}%</div>
									<TrendingUp className="h-4 w-4 text-orange-500" />
								</div>
							</div>
							<div className="p-3 bg-orange-100 rounded-full">
								<Calendar className="h-6 w-6 text-orange-600" />
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-2">year over year</p>
					</CardContent>
				</Card>
			</div>

			{/* Growth Analytics Tabs */}
			<Tabs defaultValue="projections" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="projections">Revenue Projections</TabsTrigger>
					<TabsTrigger value="drivers">Growth Drivers</TabsTrigger>
					<TabsTrigger value="insights">Growth Insights</TabsTrigger>
				</TabsList>

				{/* Revenue Projections Tab */}
				<TabsContent value="projections" className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<DollarSign className="h-5 w-5" />
										Revenue Projections
									</CardTitle>
									<CardDescription>6-month revenue forecast based on current growth trends</CardDescription>
								</div>
								<Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="month">Monthly</SelectItem>
										<SelectItem value="quarter">Quarterly</SelectItem>
										<SelectItem value="year">Yearly</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							{/* Revenue Chart Placeholder */}
							<div className="space-y-4">
								{analytics.revenueProjections.map((item, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className="text-sm font-medium w-12">{item.month}</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<span className="text-sm font-medium">Projected: ${item.projected.toLocaleString()}</span>
													{item.actual && (
														<Badge variant={item.actual >= item.projected ? "default" : "secondary"}>
															Actual: ${item.actual.toLocaleString()}
														</Badge>
													)}
												</div>
												<Progress 
													value={item.actual ? (item.actual / item.projected) * 100 : 0} 
													className="h-2" 
												/>
											</div>
										</div>
										{item.actual && (
											<div className={`flex items-center space-x-1 text-sm ${
												item.actual >= item.projected ? 'text-green-600' : 'text-red-600'
											}`}>
												{item.actual >= item.projected ? (
													<TrendingUp className="h-4 w-4" />
												) : (
													<TrendingDown className="h-4 w-4" />
												)}
												<span>
													{item.actual >= item.projected ? '+' : ''}
													{((item.actual - item.projected) / item.projected * 100).toFixed(1)}%
												</span>
											</div>
										)}
									</div>
								))}
							</div>

							{/* Summary Statistics */}
							<div className="mt-6 pt-6 border-t">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-2xl font-bold text-green-600">${nextMonthProjection.toLocaleString()}</div>
										<div className="text-sm text-muted-foreground">Next Month Projection</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-2xl font-bold text-blue-600">${totalProjectedRevenue.toLocaleString()}</div>
										<div className="text-sm text-muted-foreground">6-Month Projection</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-2xl font-bold text-purple-600">+{analytics.monthlyGrowthRate}%</div>
										<div className="text-sm text-muted-foreground">Growth Rate</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Growth Drivers Tab */}
				<TabsContent value="drivers" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Zap className="h-5 w-5" />
								Top Growth Drivers
							</CardTitle>
							<CardDescription>Key factors contributing to your directory's growth</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{analytics.topGrowthDrivers.map((driver, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-4 flex-1">
											<div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<h4 className="font-medium">{driver.factor}</h4>
													<Badge className={getTrendBadge(driver.trend)}>
														{driver.trend}
													</Badge>
													{getGrowthIcon(driver.trend)}
												</div>
												<Progress value={driver.impact} className="h-2" />
											</div>
										</div>
										<div className="text-right">
											<div className={`text-lg font-bold ${getGrowthColor(driver.trend)}`}>
												{driver.impact}%
											</div>
											<div className="text-xs text-muted-foreground">Impact</div>
										</div>
									</div>
								))}
							</div>

							{/* Growth Driver Insights */}
							<div className="mt-6 pt-6 border-t space-y-4">
								<h4 className="font-medium">Growth Driver Analysis</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 bg-green-50 rounded-lg">
										<div className="flex items-center space-x-2 mb-2">
											<Star className="h-4 w-4 text-green-600" />
											<span className="font-medium text-green-800">Top Performer</span>
										</div>
										<p className="text-sm text-green-700">
											Premium plan upgrades are driving 35.2% of your growth. 
											Consider promoting premium features to accelerate this trend.
										</p>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg">
										<div className="flex items-center space-x-2 mb-2">
											<Activity className="h-4 w-4 text-blue-600" />
											<span className="font-medium text-blue-800">Growth Opportunity</span>
										</div>
										<p className="text-sm text-blue-700">
											Your referral program has potential for improvement. 
											Consider implementing incentives to boost referral rates.
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Growth Insights Tab */}
				<TabsContent value="insights" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Business Growth Insights */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building2 className="h-5 w-5" />
									Business Growth Insights
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-4 bg-green-50 rounded-lg">
									<div className="flex items-center space-x-2 mb-2">
										<TrendingUp className="h-4 w-4 text-green-600" />
										<span className="font-medium text-green-800">Strong Growth Momentum</span>
									</div>
									<p className="text-sm text-green-700">
										Your directory is experiencing 12.5% month-over-month growth, 
										significantly above the industry average of 8%.
									</p>
								</div>

								<div className="p-4 bg-blue-50 rounded-lg">
									<div className="flex items-center space-x-2 mb-2">
										<Users className="h-4 w-4 text-blue-600" />
										<span className="font-medium text-blue-800">Excellent Retention</span>
									</div>
									<p className="text-sm text-blue-700">
										94.2% business retention rate indicates high satisfaction 
										and strong value proposition for your directory services.
									</p>
								</div>

								<div className="p-4 bg-purple-50 rounded-lg">
									<div className="flex items-center space-x-2 mb-2">
										<Target className="h-4 w-4 text-purple-600" />
										<span className="font-medium text-purple-800">Revenue Optimization</span>
									</div>
									<p className="text-sm text-purple-700">
										Average revenue per business has increased by 18% this quarter, 
										driven by plan upgrades and feature adoption.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Recommendations */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Zap className="h-5 w-5" />
									Growth Recommendations
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-4 border-l-4 border-green-500 bg-green-50">
									<h4 className="font-medium text-green-800 mb-2">High Priority</h4>
									<ul className="text-sm text-green-700 space-y-1">
										<li>• Expand premium features to capture more upgrades</li>
										<li>• Target high-value business categories</li>
										<li>• Implement success stories in marketing</li>
									</ul>
								</div>

								<div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
									<h4 className="font-medium text-yellow-800 mb-2">Medium Priority</h4>
									<ul className="text-sm text-yellow-700 space-y-1">
										<li>• Improve referral program incentives</li>
										<li>• Enhance onboarding for new businesses</li>
										<li>• Add advanced analytics features</li>
									</ul>
								</div>

								<div className="p-4 border-l-4 border-blue-500 bg-blue-50">
									<h4 className="font-medium text-blue-800 mb-2">Strategic Focus</h4>
									<ul className="text-sm text-blue-700 space-y-1">
										<li>• Develop enterprise-tier offerings</li>
										<li>• Consider geographic expansion</li>
										<li>• Build strategic partnerships</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default LocalHubGrowthAnalyticsSection;
