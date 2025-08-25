"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { DollarSign, TrendingUp, Users, Calendar, Clock, Star, MapPin, Wrench, AlertTriangle, CheckCircle, Target, BarChart3, ArrowUpRight, ArrowDownRight, Activity, Zap, Timer, Bell, Plus, Eye, RefreshCw, Filter } from "lucide-react";
import WeatherWidget from "@components/shared/weather-widget";

export default function DashboardOverview() {
	const router = useRouter();
	const [timeRange, setTimeRange] = useState("today");
	const [isLoading, setIsLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState(new Date());

	// Mock data - in real app, this would come from APIs
	const [dashboardData, setDashboardData] = useState({
		kpis: {
			revenue: { value: 45280, change: 12.5, trend: "up" },
			jobs: { value: 147, change: 8.3, trend: "up" },
			customers: { value: 892, change: 5.1, trend: "up" },
			efficiency: { value: 94.2, change: -2.1, trend: "down" },
		},
		todayStats: {
			scheduledJobs: 12,
			completedJobs: 8,
			inProgressJobs: 3,
			techniciansActive: 6,
			totalTechnicians: 8,
			avgJobDuration: 2.4,
			customerSatisfaction: 4.8,
			revenue: 3240,
		},
		recentActivity: [
			{
				id: 1,
				type: "job_completed",
				title: "Emergency Plumbing Repair",
				customer: "Sarah Chen",
				technician: "Mike Rodriguez",
				amount: 320,
				time: "2 hours ago",
				status: "completed",
			},
			{
				id: 2,
				type: "estimate_created",
				title: "HVAC Installation",
				customer: "David Wilson",
				amount: 4500,
				time: "3 hours ago",
				status: "pending",
			},
			{
				id: 3,
				type: "payment_received",
				title: "Invoice #1247 Paid",
				customer: "Jennifer Martinez",
				amount: 850,
				time: "4 hours ago",
				status: "paid",
			},
		],
		upcomingJobs: [
			{
				id: 1,
				time: "9:00 AM",
				title: "Water Heater Installation",
				customer: "Robert Taylor",
				technician: "Alex Johnson",
				location: "123 Oak Street",
				status: "scheduled",
				priority: "normal",
			},
			{
				id: 2,
				time: "11:30 AM",
				title: "Emergency Leak Repair",
				customer: "Lisa Brown",
				technician: "Mike Rodriguez",
				location: "456 Pine Avenue",
				status: "urgent",
				priority: "high",
			},
			{
				id: 3,
				time: "2:00 PM",
				title: "Routine Maintenance",
				customer: "Tom Johnson",
				technician: "Sarah Davis",
				location: "789 Elm Drive",
				status: "scheduled",
				priority: "normal",
			},
		],
		technicians: [
			{
				id: 1,
				name: "Mike Rodriguez",
				status: "on_job",
				location: "Downtown Area",
				currentJob: "Emergency Repair",
				rating: 4.9,
				jobsToday: 4,
				nextAvailable: "3:30 PM",
			},
			{
				id: 2,
				name: "Alex Johnson",
				status: "traveling",
				location: "North Side",
				currentJob: "Traveling to next job",
				rating: 4.8,
				jobsToday: 3,
				nextAvailable: "10:00 AM",
			},
			{
				id: 3,
				name: "Sarah Davis",
				status: "available",
				location: "South Side",
				currentJob: null,
				rating: 4.7,
				jobsToday: 2,
				nextAvailable: "Available now",
			},
		],
		alerts: [
			{
				id: 1,
				type: "urgent",
				title: "Equipment Maintenance Due",
				message: "Van #3 needs scheduled maintenance",
				time: "1 hour ago",
			},
			{
				id: 2,
				type: "warning",
				title: "Inventory Low",
				message: "Copper pipes running low (5 units left)",
				time: "3 hours ago",
			},
			{
				id: 3,
				type: "info",
				title: "New Review Received",
				message: "5-star review from Jennifer Martinez",
				time: "5 hours ago",
			},
		],
	});

	useEffect(() => {
		// Simulate data loading
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		// Auto-refresh data every 30 seconds
		const interval = setInterval(() => {
			setLastUpdated(new Date());
			// In real app, would fetch fresh data here
		}, 30000);

		return () => clearInterval(interval);
	}, []);

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
			hour12: true,
		}).format(time);
	};

	const getTrendIcon = (trend) => {
		return trend === "up" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />;
	};

	const getTrendColor = (trend) => {
		return trend === "up" ? "text-success" : "text-destructive";
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "urgent":
				return "bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/90";
			case "scheduled":
				return "bg-primary/10 text-primary dark:bg-primary dark:text-primary/90";
			case "on_job":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "traveling":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "available":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getAlertIcon = (type) => {
		switch (type) {
			case "urgent":
				return <AlertTriangle className="w-4 h-4 text-destructive" />;
			case "warning":
				return <AlertTriangle className="w-4 h-4 text-warning" />;
			case "info":
				return <Bell className="w-4 h-4 text-primary" />;
			default:
				return <Bell className="w-4 h-4 text-muted-foreground" />;
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-16">
				<div className="text-center">
					<RefreshCw className="mx-auto mb-4 w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-8 space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Business Overview</h1>
					<p className="text-muted-foreground">Real-time insights and performance metrics</p>
				</div>
				<div className="flex gap-2 items-center">
					<Badge variant="outline" className="text-xs">
						Last updated: {formatTime(lastUpdated)}
					</Badge>
					<Button variant="outline" size="sm">
						<RefreshCw className="mr-2 w-4 h-4" />
						Refresh
					</Button>
					<Button variant="outline" size="sm">
						<Filter className="mr-2 w-4 h-4" />
						Filter
					</Button>
				</div>
			</div>

			{/* Time Range Selector */}
			<Tabs value={timeRange} onValueChange={setTimeRange}>
				<TabsList>
					<TabsTrigger value="today">Today</TabsTrigger>
					<TabsTrigger value="week">This Week</TabsTrigger>
					<TabsTrigger value="month">This Month</TabsTrigger>
					<TabsTrigger value="quarter">This Quarter</TabsTrigger>
				</TabsList>

				<TabsContent value={timeRange} className="mt-6 space-y-8">
					{/* KPI Cards */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Revenue</CardTitle>
								<DollarSign className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(dashboardData.kpis.revenue.value)}</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									{getTrendIcon(dashboardData.kpis.revenue.trend)}
									<span className={getTrendColor(dashboardData.kpis.revenue.trend)}>{dashboardData.kpis.revenue.change}% from last period</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
								<CheckCircle className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dashboardData.kpis.jobs.value}</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									{getTrendIcon(dashboardData.kpis.jobs.trend)}
									<span className={getTrendColor(dashboardData.kpis.jobs.trend)}>{dashboardData.kpis.jobs.change}% from last period</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Active Customers</CardTitle>
								<Users className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dashboardData.kpis.customers.value}</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									{getTrendIcon(dashboardData.kpis.customers.trend)}
									<span className={getTrendColor(dashboardData.kpis.customers.trend)}>{dashboardData.kpis.customers.change}% from last period</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
								<Target className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dashboardData.kpis.efficiency.value}%</div>
								<div className="flex gap-1 items-center text-xs text-muted-foreground">
									{getTrendIcon(dashboardData.kpis.efficiency.trend)}
									<span className={getTrendColor(dashboardData.kpis.efficiency.trend)}>{Math.abs(dashboardData.kpis.efficiency.change)}% from last period</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Today's Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex gap-2 items-center">
								<Activity className="w-5 h-5" />
								Today's Summary
							</CardTitle>
							<CardDescription>Real-time overview of today's operations</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Jobs Progress</span>
										<span className="text-sm font-medium">
											{dashboardData.todayStats.completedJobs}/{dashboardData.todayStats.scheduledJobs}
										</span>
									</div>
									<Progress value={(dashboardData.todayStats.completedJobs / dashboardData.todayStats.scheduledJobs) * 100} className="h-2" />
									<div className="flex gap-4 text-xs text-muted-foreground">
										<span>✓ {dashboardData.todayStats.completedJobs} Completed</span>
										<span>⚡ {dashboardData.todayStats.inProgressJobs} In Progress</span>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Team Utilization</span>
										<span className="text-sm font-medium">
											{dashboardData.todayStats.techniciansActive}/{dashboardData.todayStats.totalTechnicians}
										</span>
									</div>
									<Progress value={(dashboardData.todayStats.techniciansActive / dashboardData.todayStats.totalTechnicians) * 100} className="h-2" />
									<div className="text-xs text-muted-foreground">{dashboardData.todayStats.techniciansActive} technicians active</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Avg Job Duration</span>
										<span className="text-sm font-medium">{dashboardData.todayStats.avgJobDuration}h</span>
									</div>
									<div className="flex gap-1 items-center">
										<Timer className="w-4 h-4 text-primary" />
										<span className="text-xs text-muted-foreground">{dashboardData.todayStats.avgJobDuration < 3 ? "On target" : "Above average"}</span>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Today's Revenue</span>
										<span className="text-sm font-medium">{formatCurrency(dashboardData.todayStats.revenue)}</span>
									</div>
									<div className="flex gap-1 items-center">
										<Star className="w-4 h-4 text-warning" />
										<span className="text-xs text-muted-foreground">{dashboardData.todayStats.customerSatisfaction}/5.0 satisfaction</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Recent Activity */}
						<Card className="lg:col-span-1">
							<CardHeader>
								<CardTitle className="flex justify-between items-center">
									<span className="flex gap-2 items-center">
										<Clock className="w-5 h-5" />
										Recent Activity
									</span>
									<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/business/jobs/list")}>
										<Eye className="w-4 h-4" />
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.recentActivity.map((activity) => (
										<div key={activity.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
											<div className="flex-1">
												<p className="text-sm font-medium">{activity.title}</p>
												<p className="text-xs text-muted-foreground">{activity.customer}</p>
												<div className="flex justify-between items-center mt-1">
													<span className="text-xs text-muted-foreground">{activity.time}</span>
													<span className="text-sm font-medium">{formatCurrency(activity.amount)}</span>
												</div>
											</div>
											<Badge className={getStatusColor(activity.status)} variant="secondary">
												{activity.status}
											</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Upcoming Jobs */}
						<Card className="lg:col-span-1">
							<CardHeader>
								<CardTitle className="flex justify-between items-center">
									<span className="flex gap-2 items-center">
										<Calendar className="w-5 h-5" />
										Upcoming Jobs
									</span>
									<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
										<Eye className="w-4 h-4" />
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.upcomingJobs.map((job) => (
										<div key={job.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
											<div className="flex-1">
												<div className="flex justify-between items-start mb-1">
													<p className="text-sm font-medium">{job.title}</p>
													<Badge className={getStatusColor(job.status)} variant="secondary">
														{job.status}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">{job.customer}</p>
												<div className="flex gap-2 items-center mt-1 text-xs text-muted-foreground">
													<Clock className="w-3 h-3" />
													<span>{job.time}</span>
													<MapPin className="w-3 h-3" />
													<span>{job.location}</span>
												</div>
												<p className="text-xs text-muted-foreground mt-1">Tech: {job.technician}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Technician Status */}
						<Card className="lg:col-span-1">
							<CardHeader>
								<CardTitle className="flex justify-between items-center">
									<span className="flex gap-2 items-center">
										<Users className="w-5 h-5" />
										Team Status
									</span>
									<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/business/employees/staff-list")}>
										<Eye className="w-4 h-4" />
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.technicians.map((tech) => (
										<div key={tech.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
											<Avatar className="w-10 h-10">
												<AvatarFallback className="text-xs">
													{tech.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex justify-between items-start mb-1">
													<p className="text-sm font-medium">{tech.name}</p>
													<Badge className={getStatusColor(tech.status)} variant="secondary">
														{tech.status.replace("_", " ")}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">{tech.currentJob || tech.location}</p>
												<div className="flex justify-between items-center mt-1">
													<div className="flex gap-1 items-center text-xs text-muted-foreground">
														<Star className="w-3 h-3 fill-yellow-400 text-warning" />
														<span>{tech.rating}</span>
														<span>•</span>
														<span>{tech.jobsToday} jobs today</span>
													</div>
												</div>
												<p className="text-xs text-muted-foreground mt-1">Next: {tech.nextAvailable}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Weather Widget - Full Width */}
					<WeatherWidget showBusinessImpact={true} />

					{/* Alerts & Notifications */}
					<Card>
						<CardHeader>
							<CardTitle className="flex gap-2 items-center">
								<Bell className="w-5 h-5" />
								Alerts & Notifications
							</CardTitle>
							<CardDescription>Important updates that require your attention</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{dashboardData.alerts.map((alert) => (
									<Alert key={alert.id}>
										{getAlertIcon(alert.type)}
										<AlertDescription>
											<div className="space-y-1">
												<p className="font-medium">{alert.title}</p>
												<p className="text-sm">{alert.message}</p>
												<p className="text-xs text-muted-foreground">{alert.time}</p>
											</div>
										</AlertDescription>
									</Alert>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="flex gap-2 items-center">
								<Zap className="w-5 h-5" />
								Quick Actions
							</CardTitle>
							<CardDescription>Common tasks and shortcuts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
									<Plus className="mb-2 w-6 h-6" />
									<span className="text-xs">New Job</span>
								</Button>
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/estimates/create")}>
									<BarChart3 className="mb-2 w-6 h-6" />
									<span className="text-xs">Create Estimate</span>
								</Button>
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/customers/list")}>
									<Users className="mb-2 w-6 h-6" />
									<span className="text-xs">Add Customer</span>
								</Button>
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/invoices/create")}>
									<DollarSign className="mb-2 w-6 h-6" />
									<span className="text-xs">New Invoice</span>
								</Button>
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/inventory/stock-list")}>
									<Wrench className="mb-2 w-6 h-6" />
									<span className="text-xs">Check Inventory</span>
								</Button>
								<Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/dashboard/business/analytics/dashboard")}>
									<TrendingUp className="mb-2 w-6 h-6" />
									<span className="text-xs">View Reports</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
