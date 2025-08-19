"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Download, Target } from "lucide-react";

export default function RealTimeInsights() {
	const [activeTab, setActiveTab] = useState("performance");
	const [timeRange, setTimeRange] = useState("today");
	const [isAutoRefresh, setIsAutoRefresh] = useState(true);
	const [lastUpdated, setLastUpdated] = useState(new Date());

	// Mock real-time data
	const [realtimeData, setRealtimeData] = useState({
		performance: {
			currentMetrics: {
				activeJobs: 8,
				completionRate: 94.2,
				avgResponseTime: 12,
				customerSatisfaction: 4.8,
				revenueToday: 3240,
				efficiencyScore: 89.5,
			},
			hourlyTrends: [
				{ hour: "8AM", jobs: 2, revenue: 420, efficiency: 85 },
				{ hour: "9AM", jobs: 3, revenue: 650, efficiency: 88 },
				{ hour: "10AM", jobs: 4, revenue: 890, efficiency: 92 },
				{ hour: "11AM", jobs: 3, revenue: 720, efficiency: 89 },
				{ hour: "12PM", jobs: 2, revenue: 480, efficiency: 87 },
				{ hour: "1PM", jobs: 5, revenue: 1100, efficiency: 94 },
				{ hour: "2PM", jobs: 4, revenue: 920, efficiency: 91 },
				{ hour: "3PM", jobs: 3, revenue: 680, efficiency: 88 },
			],
		},
		technicians: {
			utilization: [
				{ name: "Mike Rodriguez", utilization: 95, jobs: 4, revenue: 890 },
				{ name: "Alex Johnson", utilization: 87, jobs: 3, revenue: 720 },
				{ name: "Sarah Davis", utilization: 92, jobs: 3, revenue: 810 },
				{ name: "Tom Wilson", utilization: 78, jobs: 2, revenue: 560 },
				{ name: "Lisa Chen", utilization: 83, jobs: 2, revenue: 620 },
			],
			status: {
				available: 2,
				onJob: 4,
				traveling: 1,
				offline: 1,
			},
		},
		customers: {
			satisfaction: [
				{ timeRange: "This Week", rating: 4.8, reviews: 23 },
				{ timeRange: "Last Week", rating: 4.6, reviews: 19 },
				{ timeRange: "2 Weeks Ago", rating: 4.7, reviews: 21 },
				{ timeRange: "3 Weeks Ago", rating: 4.5, reviews: 18 },
			],
			segments: [
				{ name: "Residential", value: 65, color: "#3b82f6" },
				{ name: "Commercial", value: 25, color: "hsl(var(--muted-foreground))" },
				{ name: "Emergency", value: 10, color: "hsl(var(--accent))" },
			],
		},
		operations: {
			jobsByType: [
				{ type: "Plumbing", completed: 45, scheduled: 12, revenue: 12500 },
				{ type: "HVAC", completed: 23, scheduled: 8, revenue: 8900 },
				{ type: "Electrical", completed: 18, scheduled: 5, revenue: 6700 },
				{ type: "General", completed: 12, scheduled: 3, revenue: 3200 },
			],
			geographicDistribution: [
				{ area: "Downtown", jobs: 25, revenue: 7800, distance: "2.3 mi avg" },
				{ area: "North Side", jobs: 18, revenue: 5400, distance: "4.1 mi avg" },
				{ area: "South Side", jobs: 22, revenue: 6900, distance: "3.7 mi avg" },
				{ area: "West End", jobs: 15, revenue: 4200, distance: "5.2 mi avg" },
				{ area: "East Side", jobs: 12, revenue: 3600, distance: "6.1 mi avg" },
			],
		},
		alerts: [
			{
				id: 1,
				type: "critical",
				title: "High Response Time",
				message: "Average response time exceeded 15 minutes",
				time: "2 minutes ago",
				metric: "Response Time",
				value: "18 min",
				threshold: "15 min",
			},
			{
				id: 2,
				type: "warning",
				title: "Low Utilization",
				message: "Tom Wilson utilization below 80%",
				time: "15 minutes ago",
				metric: "Utilization",
				value: "78%",
				threshold: "80%",
			},
			{
				id: 3,
				type: "info",
				title: "Target Exceeded",
				message: "Daily revenue target exceeded by 12%",
				time: "1 hour ago",
				metric: "Revenue",
				value: "$3,240",
				threshold: "$2,900",
			},
		],
	});

	useEffect(() => {
		if (isAutoRefresh) {
			const interval = setInterval(() => {
				setLastUpdated(new Date());
				// Simulate real-time data updates
				setRealtimeData((prev) => ({
					...prev,
					performance: {
						...prev.performance,
						currentMetrics: {
							...prev.performance.currentMetrics,
							activeJobs: Math.max(1, prev.performance.currentMetrics.activeJobs + Math.floor(Math.random() * 3) - 1),
							revenueToday: prev.performance.currentMetrics.revenueToday + Math.floor(Math.random() * 100),
						},
					},
				}));
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [isAutoRefresh]);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatTime = (time) => {
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		}).format(time);
	};

	const getAlertIcon = (type) => {
		switch (type) {
			case "critical":
				return <AlertTriangle className="w-4 h-4 text-destructive" />;
			case "warning":
				return <AlertTriangle className="w-4 h-4 text-warning" />;
			case "info":
				return <CheckCircle className="w-4 h-4 text-primary" />;
			default:
				return <Activity className="w-4 h-4 text-muted-foreground" />;
		}
	};

	const getAlertColor = (type) => {
		switch (type) {
			case "critical":
				return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-destructive";
			case "warning":
				return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-warning";
			case "info":
				return "border-primary/30 bg-blue-50 dark:border-primary dark:bg-primary";
			default:
				return "border-border bg-muted dark:border-border dark:bg-muted";
		}
	};

	return (
		<div className="py-8 mx-auto max-w-7xl space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Real-Time Insights</h1>
					<p className="text-muted-foreground">Live performance monitoring and business intelligence</p>
				</div>
				<div className="flex gap-2 items-center">
					<Badge variant={isAutoRefresh ? "default" : "outline"} className="text-xs">
						{isAutoRefresh ? "Live" : "Paused"} • Updated: {formatTime(lastUpdated)}
					</Badge>
					<Button variant="outline" size="sm" onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
						<Activity className={`mr-2 w-4 h-4 ${isAutoRefresh ? "animate-pulse" : ""}`} />
						{isAutoRefresh ? "Pause" : "Resume"}
					</Button>
					<Button variant="outline" size="sm">
						<Download className="mr-2 w-4 h-4" />
						Export
					</Button>
				</div>
			</div>

			{/* Real-Time Alerts */}
			{realtimeData.alerts.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Active Alerts</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{realtimeData.alerts.map((alert) => (
							<Card key={alert.id} className={getAlertColor(alert.type)}>
								<CardContent className="p-4">
									<div className="flex gap-3 items-start">
										{getAlertIcon(alert.type)}
										<div className="flex-1">
											<h4 className="font-medium">{alert.title}</h4>
											<p className="text-sm text-muted-foreground">{alert.message}</p>
											<div className="flex justify-between items-center mt-2 text-xs">
												<span className="text-muted-foreground">{alert.time}</span>
												<span className="font-medium">
													{alert.value} / {alert.threshold}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Time Range Selector */}
			<div className="flex justify-between items-center">
				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger className="w-48">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="today">Today</SelectItem>
						<SelectItem value="yesterday">Yesterday</SelectItem>
						<SelectItem value="week">This Week</SelectItem>
						<SelectItem value="month">This Month</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Main Insights Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid grid-cols-4 w-full max-w-md">
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="technicians">Team</TabsTrigger>
					<TabsTrigger value="customers">Customers</TabsTrigger>
					<TabsTrigger value="operations">Operations</TabsTrigger>
				</TabsList>

				{/* Performance Tab */}
				<TabsContent value="performance" className="mt-6 space-y-6">
					{/* Current Metrics */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
								<Activity className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{realtimeData.performance.currentMetrics.activeJobs}</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									<TrendingUp className="w-3 h-3 text-success" />
									<span>Real-time tracking</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
								<Target className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{realtimeData.performance.currentMetrics.completionRate}%</div>
								<Progress value={realtimeData.performance.currentMetrics.completionRate} className="mt-2 h-2" />
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
								<DollarSign className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(realtimeData.performance.currentMetrics.revenueToday)}</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									<TrendingUp className="w-3 h-3 text-success" />
									<span>+12% vs target</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Hourly Performance Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Hourly Performance Trends</CardTitle>
							<CardDescription>Jobs completed, revenue, and efficiency by hour</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={realtimeData.performance.hourlyTrends}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="hour" />
									<YAxis yAxisId="left" />
									<YAxis yAxisId="right" orientation="right" />
									<Tooltip />
									<Legend />
									<Bar yAxisId="left" dataKey="jobs" fill="#3b82f6" name="Jobs Completed" />
									<Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="hsl(var(--muted-foreground))" name="Efficiency %" strokeWidth={2} />
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Technicians Tab */}
				<TabsContent value="technicians" className="mt-6 space-y-6">
					{/* Team Status Overview */}
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-success">{realtimeData.technicians.status.available}</div>
								<p className="text-sm text-muted-foreground">Available</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-warning">{realtimeData.technicians.status.onJob}</div>
								<p className="text-sm text-muted-foreground">On Job</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-warning">{realtimeData.technicians.status.traveling}</div>
								<p className="text-sm text-muted-foreground">Traveling</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-muted-foreground">{realtimeData.technicians.status.offline}</div>
								<p className="text-sm text-muted-foreground">Offline</p>
							</CardContent>
						</Card>
					</div>

					{/* Individual Technician Performance */}
					<Card>
						<CardHeader>
							<CardTitle>Individual Performance</CardTitle>
							<CardDescription>Real-time utilization and productivity metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{realtimeData.technicians.utilization.map((tech, index) => (
									<div key={index} className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg">
										<div className="flex-1">
											<div className="flex justify-between items-center mb-2">
												<h4 className="font-medium">{tech.name}</h4>
												<span className="text-sm font-medium">{tech.utilization}%</span>
											</div>
											<Progress value={tech.utilization} className="h-2" />
											<div className="flex justify-between mt-2 text-sm text-muted-foreground">
												<span>{tech.jobs} jobs today</span>
												<span>{formatCurrency(tech.revenue)} revenue</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Customers Tab */}
				<TabsContent value="customers" className="mt-6 space-y-6">
					{/* Customer Satisfaction Trend */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Satisfaction Trends</CardTitle>
							<CardDescription>Weekly satisfaction ratings and review counts</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={realtimeData.customers.satisfaction}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="timeRange" />
									<YAxis />
									<Tooltip />
									<Area type="monotone" dataKey="rating" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Customer Segments */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Segments</CardTitle>
							<CardDescription>Distribution by customer type</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								<ResponsiveContainer width="100%" height={250}>
									<PieChart>
										<Pie data={realtimeData.customers.segments} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
											{realtimeData.customers.segments.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>

								<div className="space-y-4">
									{realtimeData.customers.segments.map((segment, index) => (
										<div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
											<div className="flex gap-2 items-center">
												<div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
												<span className="font-medium">{segment.name}</span>
											</div>
											<span className="text-sm text-muted-foreground">{segment.value}%</span>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Operations Tab */}
				<TabsContent value="operations" className="mt-6 space-y-6">
					{/* Jobs by Service Type */}
					<Card>
						<CardHeader>
							<CardTitle>Service Type Performance</CardTitle>
							<CardDescription>Completed vs scheduled jobs and revenue by service type</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={realtimeData.operations.jobsByType}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="type" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="completed" fill="hsl(var(--muted-foreground))" name="Completed" />
									<Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Geographic Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Geographic Distribution</CardTitle>
							<CardDescription>Jobs and revenue by service area</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{realtimeData.operations.geographicDistribution.map((area, index) => (
									<div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
										<div>
											<h4 className="font-medium">{area.area}</h4>
											<p className="text-sm text-muted-foreground">{area.distance}</p>
										</div>
										<div className="text-right">
											<p className="font-medium">{area.jobs} jobs</p>
											<p className="text-sm text-muted-foreground">{formatCurrency(area.revenue)}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
