/**
 * LocalHub Performance Insights Section - Comprehensive TypeScript Implementation
 * Advanced performance analytics and insights for LocalHub directory owners
 * Features traffic analytics, search insights, and business performance metrics
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
	Eye, 
	Search, 
	Clock, 
	MousePointer, 
	TrendingUp, 
	TrendingDown, 
	Users, 
	Building2,
	BarChart3,
	Activity,
	Star,
	ArrowRight,
	Zap,
	Target,
	Globe
} from "lucide-react";
import type { LocalHubPerformanceInsightsSectionProps, PerformanceInsights } from "@/types/dashboard";

/**
 * Performance Insights Section Component
 * 
 * @description Comprehensive performance analytics with traffic, search, and business insights
 * @param performanceData - Performance insights data
 * @param expanded - Whether to show expanded view with more detailed metrics
 */
const LocalHubPerformanceInsightsSection: React.FC<LocalHubPerformanceInsightsSectionProps> = ({ 
	performanceData,
	expanded = false
}) => {
	const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");
	const [selectedView, setSelectedView] = useState<"overview" | "detailed">("overview");

	// Mock data if no performance data provided
	const mockPerformanceData: PerformanceInsights = useMemo(() => ({
		directoryPerformance: {
			uniqueVisitors: 12847,
			pageViews: 34521,
			bounceRate: 34.2,
			avgSessionDuration: 4.7,
			searchQueries: 8934,
			clickThroughRate: 12.8
		},
		topSearchTerms: [
			{ term: "restaurants", count: 1247, growth: 15.3 },
			{ term: "plumbing services", count: 892, growth: -3.2 },
			{ term: "auto repair", count: 734, growth: 8.7 },
			{ term: "hair salon", count: 623, growth: 22.1 },
			{ term: "dental clinic", count: 456, growth: 5.4 },
			{ term: "home improvement", count: 387, growth: -1.8 },
			{ term: "fitness gym", count: 298, growth: 18.9 },
			{ term: "coffee shop", count: 234, growth: 12.3 }
		],
		businessPerformance: [
			{ 
				businessId: "1", 
				businessName: "Wade's Plumbing", 
				views: 2341, 
				clicks: 187, 
				inquiries: 23, 
				conversionRate: 12.3 
			},
			{ 
				businessId: "2", 
				businessName: "Local Coffee Shop", 
				views: 1876, 
				clicks: 234, 
				inquiries: 31, 
				conversionRate: 13.2 
			},
			{ 
				businessId: "3", 
				businessName: "Fresh Cuts Salon", 
				views: 1623, 
				clicks: 298, 
				inquiries: 42, 
				conversionRate: 14.1 
			},
			{ 
				businessId: "4", 
				businessName: "Downtown Dentistry", 
				views: 1456, 
				clicks: 156, 
				inquiries: 18, 
				conversionRate: 11.5 
			}
		],
		categoryPerformance: [
			{ category: "Restaurants & Food", businessCount: 12, avgRevenue: 87, popularity: 94.2 },
			{ category: "Home Services", businessCount: 8, avgRevenue: 124, popularity: 87.3 },
			{ category: "Healthcare", businessCount: 6, avgRevenue: 156, popularity: 78.9 },
			{ category: "Beauty & Personal Care", businessCount: 9, avgRevenue: 92, popularity: 82.1 },
			{ category: "Automotive", businessCount: 5, avgRevenue: 98, popularity: 71.4 },
			{ category: "Professional Services", businessCount: 7, avgRevenue: 134, popularity: 69.8 }
		]
	}), []);

	const insights = performanceData || mockPerformanceData;

	// Calculate performance metrics
	const performanceMetrics = useMemo(() => {
		const { directoryPerformance } = insights;
		const avgSessionMinutes = Math.floor(directoryPerformance.avgSessionDuration);
		const avgSessionSeconds = Math.round((directoryPerformance.avgSessionDuration - avgSessionMinutes) * 60);
		
		return {
			...directoryPerformance,
			sessionDurationFormatted: `${avgSessionMinutes}:${avgSessionSeconds.toString().padStart(2, '0')}`,
			pagesPerSession: Math.round((directoryPerformance.pageViews / directoryPerformance.uniqueVisitors) * 10) / 10
		};
	}, [insights]);

	// Get trend icon
	const getTrendIcon = (growth: number) => {
		if (growth > 0) return <TrendingUp className="h-4 w-4 text-success" />;
		if (growth < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
		return <Activity className="h-4 w-4 text-muted-foreground" />;
	};

	// Get trend color
	const getTrendColor = (growth: number) => {
		if (growth > 0) return "text-success";
		if (growth < 0) return "text-destructive";
		return "text-muted-foreground";
	};

	// Performance score calculation
	const calculatePerformanceScore = () => {
		const metrics = performanceMetrics;
		let score = 0;
		
		// CTR Score (30% weight)
		score += Math.min(metrics.clickThroughRate / 15 * 30, 30);
		
		// Bounce Rate Score (25% weight) - inverted
		score += Math.max(25 - (metrics.bounceRate / 50 * 25), 0);
		
		// Session Duration Score (25% weight)
		score += Math.min(metrics.avgSessionDuration / 6 * 25, 25);
		
		// Search Query Volume Score (20% weight)
		score += Math.min(metrics.searchQueries / 10000 * 20, 20);
		
		return Math.round(score);
	};

	const performanceScore = calculatePerformanceScore();

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-success";
		if (score >= 60) return "text-warning";
		return "text-destructive";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 80) return "Excellent";
		if (score >= 60) return "Good";
		if (score >= 40) return "Fair";
		return "Needs Improvement";
	};

	return (
		<div className="space-y-6">
			{/* Performance Overview */}
			{!expanded ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="h-5 w-5" />
									Performance Insights
								</CardTitle>
								<CardDescription>Directory traffic and engagement metrics</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Badge className={getScoreColor(performanceScore).replace('text-', 'bg-').replace('-600', '-100 ').replace('600', '800')}>
									{getScoreBadge(performanceScore)}
								</Badge>
								<div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
									{performanceScore}/100
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-4 bg-muted rounded-lg">
								<Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
								<div className="text-2xl font-bold">{performanceMetrics.uniqueVisitors.toLocaleString()}</div>
								<div className="text-sm text-muted-foreground">Unique Visitors</div>
							</div>
							<div className="text-center p-4 bg-muted rounded-lg">
								<Search className="h-8 w-8 mx-auto mb-2 text-success" />
								<div className="text-2xl font-bold">{performanceMetrics.searchQueries.toLocaleString()}</div>
								<div className="text-sm text-muted-foreground">Search Queries</div>
							</div>
							<div className="text-center p-4 bg-muted rounded-lg">
								<MousePointer className="h-8 w-8 mx-auto mb-2 text-purple-600" />
								<div className="text-2xl font-bold">{performanceMetrics.clickThroughRate}%</div>
								<div className="text-sm text-muted-foreground">Click-Through Rate</div>
							</div>
							<div className="text-center p-4 bg-muted rounded-lg">
								<Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
								<div className="text-2xl font-bold">{performanceMetrics.sessionDurationFormatted}</div>
								<div className="text-sm text-muted-foreground">Avg Session</div>
							</div>
						</div>
					</CardContent>
				</Card>
			) : (
				/* Expanded Performance View */
				<Tabs defaultValue="overview" className="space-y-6">
					<div className="flex items-center justify-between">
						<TabsList className="grid w-full max-w-md grid-cols-3">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="search">Search</TabsTrigger>
							<TabsTrigger value="businesses">Businesses</TabsTrigger>
						</TabsList>
						<Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="week">This Week</SelectItem>
								<SelectItem value="month">This Month</SelectItem>
								<SelectItem value="quarter">This Quarter</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						{/* Performance Score */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5" />
									Performance Score
								</CardTitle>
								<CardDescription>Overall directory performance based on key metrics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-center space-x-8">
									<div className="text-center">
										<div className={`text-6xl font-bold ${getScoreColor(performanceScore)}`}>
											{performanceScore}
										</div>
										<div className="text-sm text-muted-foreground">out of 100</div>
										<Badge className={getScoreColor(performanceScore).replace('text-', 'bg-').replace('-600', '-100 ').replace('600', '800')} variant="secondary">
											{getScoreBadge(performanceScore)}
										</Badge>
									</div>
									<div className="flex-1">
										<Progress value={performanceScore} className="h-4 mb-4" />
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span>Click-Through Rate</span>
												<span className="text-success">{performanceMetrics.clickThroughRate}%</span>
											</div>
											<div className="flex justify-between">
												<span>Bounce Rate</span>
												<span className="text-primary">{performanceMetrics.bounceRate}%</span>
											</div>
											<div className="flex justify-between">
												<span>Session Duration</span>
												<span className="text-purple-600">{performanceMetrics.sessionDurationFormatted}</span>
											</div>
											<div className="flex justify-between">
												<span>Pages per Session</span>
												<span className="text-warning">{performanceMetrics.pagesPerSession}</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Traffic Metrics */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="h-5 w-5" />
									Traffic Analytics
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
									<div className="p-4 border rounded-lg">
										<div className="flex items-center space-x-2 mb-2">
											<Eye className="h-5 w-5 text-primary" />
											<span className="font-medium">Unique Visitors</span>
										</div>
										<div className="text-2xl font-bold">{performanceMetrics.uniqueVisitors.toLocaleString()}</div>
										<div className="text-sm text-success">+12.3% vs last month</div>
									</div>
									<div className="p-4 border rounded-lg">
										<div className="flex items-center space-x-2 mb-2">
											<BarChart3 className="h-5 w-5 text-success" />
											<span className="font-medium">Page Views</span>
										</div>
										<div className="text-2xl font-bold">{performanceMetrics.pageViews.toLocaleString()}</div>
										<div className="text-sm text-success">+8.7% vs last month</div>
									</div>
									<div className="p-4 border rounded-lg">
										<div className="flex items-center space-x-2 mb-2">
											<Users className="h-5 w-5 text-purple-600" />
											<span className="font-medium">Bounce Rate</span>
										</div>
										<div className="text-2xl font-bold">{performanceMetrics.bounceRate}%</div>
										<div className="text-sm text-destructive">-2.1% vs last month</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Category Performance */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building2 className="h-5 w-5" />
									Category Performance
								</CardTitle>
								<CardDescription>How different business categories are performing in your directory</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{insights.categoryPerformance.map((category, index) => (
										<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex-1">
												<div className="flex items-center space-x-3 mb-2">
													<h4 className="font-medium">{category.category}</h4>
													<Badge variant="outline">{category.businessCount} businesses</Badge>
												</div>
												<Progress value={category.popularity} className="h-2" />
											</div>
											<div className="text-right ml-4">
												<div className="text-lg font-bold">${category.avgRevenue}</div>
												<div className="text-sm text-muted-foreground">Avg Revenue</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Search Analytics Tab */}
					<TabsContent value="search" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Search className="h-5 w-5" />
									Search Analytics
								</CardTitle>
								<CardDescription>Top search terms and search behavior insights</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Top Search Terms */}
									<div>
										<h4 className="font-medium mb-4">Top Search Terms</h4>
										<div className="space-y-3">
											{insights.topSearchTerms.map((term, index) => (
												<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="flex items-center space-x-3">
														<div className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</div>
														<div>
															<div className="font-medium">{term.term}</div>
															<div className="text-sm text-muted-foreground">{term.count} searches</div>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														{getTrendIcon(term.growth)}
														<span className={`text-sm font-medium ${getTrendColor(term.growth)}`}>
															{term.growth > 0 ? '+' : ''}{term.growth.toFixed(1)}%
														</span>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Search Insights */}
									<div>
										<h4 className="font-medium mb-4">Search Insights</h4>
										<div className="space-y-4">
											<div className="p-4 bg-green-50 rounded-lg">
												<div className="flex items-center space-x-2 mb-2">
													<TrendingUp className="h-4 w-4 text-success" />
													<span className="font-medium text-success">Growing Categories</span>
												</div>
												<p className="text-sm text-success">
													"Hair salon" and "fitness gym" searches are up 22% and 19% respectively, 
													indicating high demand in these categories.
												</p>
											</div>

											<div className="p-4 bg-blue-50 rounded-lg">
												<div className="flex items-center space-x-2 mb-2">
													<Search className="h-4 w-4 text-primary" />
													<span className="font-medium text-primary">Search Volume</span>
												</div>
												<p className="text-sm text-primary">
													Total search volume increased 15.3% this month, with restaurants 
													and plumbing services being the most searched categories.
												</p>
											</div>

											<div className="p-4 bg-purple-50 rounded-lg">
												<div className="flex items-center space-x-2 mb-2">
													<Target className="h-4 w-4 text-purple-600" />
													<span className="font-medium text-purple-800">Optimization Tips</span>
												</div>
												<p className="text-sm text-purple-700">
													Consider adding more businesses in trending categories 
													to capture the increasing search demand.
												</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Business Performance Tab */}
					<TabsContent value="businesses" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="h-5 w-5" />
									Business Performance
								</CardTitle>
								<CardDescription>Individual business performance and engagement metrics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{insights.businessPerformance.map((business, index) => (
										<div key={business.businessId} className="p-4 border rounded-lg">
											<div className="flex items-center justify-between mb-4">
												<div>
													<h4 className="font-medium">{business.businessName}</h4>
													<div className="flex items-center space-x-4 text-sm text-muted-foreground">
														<span>{business.views} views</span>
														<span>{business.clicks} clicks</span>
														<span>{business.inquiries} inquiries</span>
													</div>
												</div>
												<div className="text-right">
													<div className="text-lg font-bold text-success">{business.conversionRate}%</div>
													<div className="text-sm text-muted-foreground">Conversion Rate</div>
												</div>
											</div>
											<div className="grid grid-cols-3 gap-4">
												<div>
													<div className="text-sm text-muted-foreground mb-1">Views</div>
													<Progress value={(business.views / 2500) * 100} className="h-2" />
												</div>
												<div>
													<div className="text-sm text-muted-foreground mb-1">Clicks</div>
													<Progress value={(business.clicks / 300) * 100} className="h-2" />
												</div>
												<div>
													<div className="text-sm text-muted-foreground mb-1">Inquiries</div>
													<Progress value={(business.inquiries / 50) * 100} className="h-2" />
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
};

export default LocalHubPerformanceInsightsSection;
