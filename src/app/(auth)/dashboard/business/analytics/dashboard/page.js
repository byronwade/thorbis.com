"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Progress } from "@components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Briefcase, Calendar, Clock, Target, Star, AlertTriangle, CheckCircle, Timer, MapPin, Wrench, Zap, Settings, Download, RefreshCw, Minus } from "lucide-react";

/**
 * Analytics Dashboard - Comprehensive business intelligence and performance tracking
 * Features: Revenue analytics, job performance, customer insights, technician efficiency, and trend analysis
 */
export default function AnalyticsDashboard() {
	const [dateRange, setDateRange] = useState("30_days");
	const [selectedMetric, setSelectedMetric] = useState("revenue");
	const [comparisonPeriod, setComparisonPeriod] = useState("previous_period");

	// Mock analytics data
	const analyticsData = {
		overview: {
			totalRevenue: 45750,
			totalJobs: 127,
			activeCustomers: 89,
			avgJobValue: 360,
			conversionRate: 72,
			customerSatisfaction: 4.6,
			technicianEfficiency: 87,
			repeatCustomerRate: 45,
		},
		trends: {
			revenue: { current: 45750, previous: 38900, change: 17.6, trend: "up" },
			jobs: { current: 127, previous: 98, change: 29.6, trend: "up" },
			customers: { current: 89, previous: 76, change: 17.1, trend: "up" },
			efficiency: { current: 87, previous: 83, change: 4.8, trend: "up" },
		},
		revenueByService: [
			{ service: "HVAC", amount: 18300, percentage: 40, jobs: 45 },
			{ service: "Electrical", amount: 13725, percentage: 30, jobs: 38 },
			{ service: "Plumbing", amount: 9150, percentage: 20, jobs: 32 },
			{ service: "Maintenance", amount: 4575, percentage: 10, jobs: 12 },
		],
		topCustomers: [
			{ name: "Bob&apos;s Restaurant", revenue: 4250, jobs: 15, type: "commercial" },
			{ name: "Tech Solutions Inc", revenue: 3800, jobs: 8, type: "commercial" },
			{ name: "Mountain View Apartments", revenue: 3200, jobs: 22, type: "commercial" },
			{ name: "Sarah Johnson", revenue: 2100, jobs: 6, type: "residential" },
			{ name: "Green Building Corp", revenue: 1900, jobs: 5, type: "commercial" },
		],
		technicianPerformance: [
			{
				name: "Mike Wilson",
				jobsCompleted: 32,
				revenue: 14250,
				efficiency: 94,
				customerRating: 4.8,
				avgJobTime: 2.4,
			},
			{
				name: "Lisa Chen",
				jobsCompleted: 28,
				revenue: 12600,
				efficiency: 89,
				customerRating: 4.6,
				avgJobTime: 2.8,
			},
			{
				name: "David Brown",
				jobsCompleted: 35,
				revenue: 11900,
				efficiency: 92,
				customerRating: 4.7,
				avgJobTime: 2.2,
			},
			{
				name: "Emma Davis",
				jobsCompleted: 25,
				revenue: 10200,
				efficiency: 85,
				customerRating: 4.5,
				avgJobTime: 3.1,
			},
		],
		monthlyTrends: [
			{ month: "Oct", revenue: 38900, jobs: 98, customers: 76 },
			{ month: "Nov", revenue: 42100, jobs: 115, customers: 82 },
			{ month: "Dec", revenue: 45750, jobs: 127, customers: 89 },
		],
		jobStatusBreakdown: [
			{ status: "Completed", count: 89, percentage: 70 },
			{ status: "Scheduled", count: 23, percentage: 18 },
			{ status: "In Progress", count: 10, percentage: 8 },
			{ status: "Overdue", count: 5, percentage: 4 },
		],
		customerSatisfactionTrends: [
			{ period: "Week 1", rating: 4.4, responses: 23 },
			{ period: "Week 2", rating: 4.5, responses: 28 },
			{ period: "Week 3", rating: 4.7, responses: 31 },
			{ period: "Week 4", rating: 4.6, responses: 26 },
		],
		geographicData: [
			{ area: "Downtown", jobs: 45, revenue: 18200 },
			{ area: "Business District", jobs: 32, revenue: 14800 },
			{ area: "Residential Zone", jobs: 28, revenue: 8900 },
			{ area: "Business Park", jobs: 22, revenue: 9850 },
		],
	};

	const getTrendIcon = (trend) => {
		switch (trend) {
			case "up":
				return <TrendingUp className="w-4 h-4 text-green-600" />;
			case "down":
				return <TrendingDown className="w-4 h-4 text-red-600" />;
			default:
				return <Minus className="w-4 h-4 text-muted-foreground" />;
		}
	};

	const getTrendColor = (trend) => {
		switch (trend) {
			case "up":
				return "text-green-600";
			case "down":
				return "text-red-600";
			default:
				return "text-muted-foreground";
		}
	};

	const getServiceIcon = (service) => {
		switch (service) {
			case "HVAC":
				return <Timer className="w-4 h-4" />;
			case "Electrical":
				return <Zap className="w-4 h-4" />;
			case "Plumbing":
				return <Wrench className="w-4 h-4" />;
			default:
				return <Settings className="w-4 h-4" />;
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatPercentage = (value) => {
		return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
					<p className="text-muted-foreground">Business performance insights and key metrics</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Date Range" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7_days">Last 7 days</SelectItem>
							<SelectItem value="30_days">Last 30 days</SelectItem>
							<SelectItem value="90_days">Last 90 days</SelectItem>
							<SelectItem value="this_month">This month</SelectItem>
							<SelectItem value="last_month">Last month</SelectItem>
							<SelectItem value="this_year">This year</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" size="sm">
						<Download className="mr-2 w-4 h-4" />
						Export Report
					</Button>
					<Button variant="outline" size="sm">
						<RefreshCw className="mr-2 w-4 h-4" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Key Performance Indicators */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
								<p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
								<div className="flex items-center gap-1 mt-1">
									{getTrendIcon(analyticsData.trends.revenue.trend)}
									<span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.revenue.trend)}`}>{formatPercentage(analyticsData.trends.revenue.change)}</span>
									<span className="text-sm text-muted-foreground">vs last period</span>
								</div>
							</div>
							<DollarSign className="w-8 h-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
								<p className="text-2xl font-bold">{analyticsData.overview.totalJobs}</p>
								<div className="flex items-center gap-1 mt-1">
									{getTrendIcon(analyticsData.trends.jobs.trend)}
									<span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.jobs.trend)}`}>{formatPercentage(analyticsData.trends.jobs.change)}</span>
									<span className="text-sm text-muted-foreground">vs last period</span>
								</div>
							</div>
							<Briefcase className="w-8 h-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Active Customers</p>
								<p className="text-2xl font-bold">{analyticsData.overview.activeCustomers}</p>
								<div className="flex items-center gap-1 mt-1">
									{getTrendIcon(analyticsData.trends.customers.trend)}
									<span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.customers.trend)}`}>{formatPercentage(analyticsData.trends.customers.change)}</span>
									<span className="text-sm text-muted-foreground">vs last period</span>
								</div>
							</div>
							<Users className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Avg Job Value</p>
								<p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.avgJobValue)}</p>
								<div className="flex items-center gap-1 mt-1">
									<Target className="w-4 h-4 text-blue-600" />
									<span className="text-sm text-muted-foreground">Target: $400</span>
								</div>
							</div>
							<BarChart3 className="w-8 h-8 text-orange-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="revenue">Revenue</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="customers">Customers</TabsTrigger>
					<TabsTrigger value="operations">Operations</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Revenue by Service */}
						<Card>
							<CardHeader>
								<CardTitle>Revenue by Service Type</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.revenueByService.map((service) => (
										<div key={service.service} className="space-y-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{getServiceIcon(service.service)}
													<span className="font-medium">{service.service}</span>
												</div>
												<div className="text-right">
													<p className="font-medium">{formatCurrency(service.amount)}</p>
													<p className="text-sm text-muted-foreground">{service.jobs} jobs</p>
												</div>
											</div>
											<Progress value={service.percentage} className="h-2" />
											<p className="text-sm text-muted-foreground">{service.percentage}% of total revenue</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Job Status Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle>Job Status Overview</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.jobStatusBreakdown.map((status) => (
										<div key={status.status} className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{status.status === "Completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
												{status.status === "Scheduled" && <Calendar className="w-4 h-4 text-blue-500" />}
												{status.status === "In Progress" && <Clock className="w-4 h-4 text-yellow-500" />}
												{status.status === "Overdue" && <AlertTriangle className="w-4 h-4 text-red-500" />}
												<span className="font-medium">{status.status}</span>
											</div>
											<div className="text-right">
												<p className="font-medium">{status.count}</p>
												<p className="text-sm text-muted-foreground">{status.percentage}%</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Monthly Trends */}
					<Card>
						<CardHeader>
							<CardTitle>Monthly Trends</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2">
									<span>Month</span>
									<span>Revenue</span>
									<span>Jobs</span>
								</div>
								{analyticsData.monthlyTrends.map((month) => (
									<div key={month.month} className="grid grid-cols-3 gap-4 text-sm">
										<span className="font-medium">{month.month}</span>
										<span>{formatCurrency(month.revenue)}</span>
										<span>{month.jobs}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="revenue" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Top Customers by Revenue */}
						<Card>
							<CardHeader>
								<CardTitle>Top Customers by Revenue</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.topCustomers.map((customer, index) => (
										<div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
													<span className="text-sm font-bold text-blue-600">#{index + 1}</span>
												</div>
												<div>
													<p className="font-medium">{customer.name}</p>
													<p className="text-sm text-muted-foreground">{customer.jobs} jobs</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium">{formatCurrency(customer.revenue)}</p>
												<Badge variant="outline" className="text-xs">
													{customer.type}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Geographic Performance */}
						<Card>
							<CardHeader>
								<CardTitle>Revenue by Area</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.geographicData.map((area) => (
										<div key={area.area} className="space-y-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4 text-muted-foreground" />
													<span className="font-medium">{area.area}</span>
												</div>
												<div className="text-right">
													<p className="font-medium">{formatCurrency(area.revenue)}</p>
													<p className="text-sm text-muted-foreground">{area.jobs} jobs</p>
												</div>
											</div>
											<Progress value={(area.revenue / 18200) * 100} className="h-2" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="performance" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Technician Performance */}
						<Card>
							<CardHeader>
								<CardTitle>Technician Performance</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.technicianPerformance.map((tech) => (
										<div key={tech.name} className="p-4 border rounded-lg">
											<div className="flex items-center justify-between mb-3">
												<h4 className="font-medium">{tech.name}</h4>
												<div className="flex items-center gap-1">
													<Star className="w-4 h-4 text-yellow-400 fill-current" />
													<span className="text-sm font-medium">{tech.customerRating}</span>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<p className="text-muted-foreground">Jobs Completed</p>
													<p className="font-medium">{tech.jobsCompleted}</p>
												</div>
												<div>
													<p className="text-muted-foreground">Revenue</p>
													<p className="font-medium">{formatCurrency(tech.revenue)}</p>
												</div>
												<div>
													<p className="text-muted-foreground">Efficiency</p>
													<p className="font-medium">{tech.efficiency}%</p>
												</div>
												<div>
													<p className="text-muted-foreground">Avg Job Time</p>
													<p className="font-medium">{tech.avgJobTime}h</p>
												</div>
											</div>
											<div className="mt-3">
												<div className="flex items-center justify-between mb-1">
													<span className="text-sm">Efficiency</span>
													<span className="text-sm">{tech.efficiency}%</span>
												</div>
												<Progress value={tech.efficiency} className="h-2" />
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Customer Satisfaction Trends */}
						<Card>
							<CardHeader>
								<CardTitle>Customer Satisfaction Trends</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{analyticsData.customerSatisfactionTrends.map((week) => (
										<div key={week.period} className="flex items-center justify-between p-3 border rounded-lg">
											<div>
												<p className="font-medium">{week.period}</p>
												<p className="text-sm text-muted-foreground">{week.responses} responses</p>
											</div>
											<div className="text-right">
												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														{Array.from({ length: 5 }, (_, i) => (
															<Star key={i} className={`w-3 h-3 ${i < Math.floor(week.rating) ? "text-yellow-400 fill-current" : "text-muted-foreground/30"}`} />
														))}
													</div>
													<span className="font-medium">{week.rating}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="customers" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Conversion Rate</p>
										<p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
									</div>
									<Target className="w-8 h-8 text-green-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Repeat Customer Rate</p>
										<p className="text-2xl font-bold">{analyticsData.overview.repeatCustomerRate}%</p>
									</div>
									<Users className="w-8 h-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Customer Satisfaction</p>
										<p className="text-2xl font-bold">{analyticsData.overview.customerSatisfaction}</p>
									</div>
									<Star className="w-8 h-8 text-yellow-500" />
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="operations" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Operational Efficiency</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span>Overall Efficiency</span>
									<span className="font-medium">{analyticsData.overview.technicianEfficiency}%</span>
								</div>
								<Progress value={analyticsData.overview.technicianEfficiency} className="h-2" />
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Key Metrics</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm">Average Response Time</span>
									<span className="text-sm font-medium">2.4 hours</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">On-Time Completion</span>
									<span className="text-sm font-medium">94%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">First-Time Fix Rate</span>
									<span className="text-sm font-medium">87%</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
