"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Calendar, Clock, DollarSign, Users, MapPin, Phone, CheckCircle, TrendingUp, BarChart3, Star, MessageSquare, Settings, Plus, Filter, Download, Bell } from "lucide-react";
import { format } from "date-fns";

/**
 * BusinessDashboard - Complete SaaS dashboard for field service businesses
 * Part of the unified Thorbis platform providing operational tools
 */
export default function BusinessDashboard({ businessId, user }) {
	const [activeTab, setActiveTab] = useState("overview");
	const [jobs, setJobs] = useState([]);
	const [analytics, setAnalytics] = useState({});
	const [notifications, setNotifications] = useState([]);

	// Mock data - in real app would come from API
	const mockJobs = [
		{
			id: "1",
			customerName: "John Smith",
			service: "Plumbing Repair",
			status: "scheduled",
			scheduledTime: new Date("2024-01-15T10:00:00"),
			address: "123 Main St, Anytown, CA",
			phone: "(555) 123-4567",
			estimatedDuration: "2 hours",
			estimatedPrice: "$150",
			priority: "normal",
		},
		{
			id: "2",
			customerName: "Sarah Johnson",
			service: "AC Installation",
			status: "in_progress",
			scheduledTime: new Date("2024-01-15T14:00:00"),
			address: "456 Oak Ave, Anytown, CA",
			phone: "(555) 987-6543",
			estimatedDuration: "4 hours",
			estimatedPrice: "$800",
			priority: "high",
		},
		{
			id: "3",
			customerName: "Mike Davis",
			service: "Electrical Inspection",
			status: "completed",
			scheduledTime: new Date("2024-01-14T09:00:00"),
			address: "789 Pine St, Anytown, CA",
			phone: "(555) 456-7890",
			estimatedDuration: "1 hour",
			estimatedPrice: "$120",
			priority: "normal",
		},
	];

	const mockAnalytics = {
		totalRevenue: 12500,
		completedJobs: 48,
		avgRating: 4.8,
		responseTime: "2.3 hours",
		monthlyGrowth: 15.2,
		weeklyScheduled: 12,
		pendingQuotes: 5,
		newLeads: 8,
	};

	useEffect(() => {
		// Load dashboard data
		setJobs(mockJobs);
		setAnalytics(mockAnalytics);
	}, [businessId]);

	const getStatusColor = (status) => {
		switch (status) {
			case "scheduled":
				return "bg-primary/20 text-primary";
			case "in_progress":
				return "bg-muted-foreground/20 text-muted-foreground";
			case "completed":
				return "bg-primary/20 text-primary";
			case "cancelled":
				return "bg-destructive/20 text-destructive";
			default:
				return "bg-muted/20 text-muted-foreground";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "high":
				return "text-destructive";
			case "medium":
				return "text-muted-foreground";
			case "low":
				return "text-primary";
			default:
				return "text-muted-foreground";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Business Dashboard</h1>
						<p className="text-muted-foreground">Manage your field service operations</p>
					</div>
					<div className="flex gap-3">
						<Button variant="outline" size="sm">
							<Download className="w-4 h-4 mr-2" />
							Export Data
						</Button>
						<Button size="sm">
							<Plus className="w-4 h-4 mr-2" />
							New Job
						</Button>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
									<p className="text-2xl font-bold">${analytics.totalRevenue?.toLocaleString()}</p>
								</div>
								<DollarSign className="w-8 h-8 text-primary" />
							</div>
							<div className="mt-2 flex items-center text-sm text-primary">
								<TrendingUp className="w-4 h-4 mr-1" />+{analytics.monthlyGrowth}% from last month
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Completed Jobs</p>
									<p className="text-2xl font-bold">{analytics.completedJobs}</p>
								</div>
								<CheckCircle className="w-8 h-8 text-primary" />
							</div>
							<div className="mt-2 text-sm text-muted-foreground">{analytics.weeklyScheduled} scheduled this week</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Average Rating</p>
									<p className="text-2xl font-bold">{analytics.avgRating}</p>
								</div>
								<Star className="w-8 h-8 text-muted-foreground" />
							</div>
							<div className="mt-2 text-sm text-muted-foreground">Based on customer reviews</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Response Time</p>
									<p className="text-2xl font-bold">{analytics.responseTime}</p>
								</div>
								<Clock className="w-8 h-8 text-muted-foreground" />
							</div>
							<div className="mt-2 text-sm text-muted-foreground">Average quote response</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Dashboard Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="jobs">Jobs & Schedule</TabsTrigger>
						<TabsTrigger value="customers">Customers</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Today's Schedule */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="w-5 h-5" />
										Today's Schedule
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{jobs
										.filter((job) => format(job.scheduledTime, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
										.map((job) => (
											<div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
												<div>
													<p className="font-medium">{job.customerName}</p>
													<p className="text-sm text-muted-foreground">{job.service}</p>
													<p className="text-sm text-muted-foreground">{format(job.scheduledTime, "h:mm a")}</p>
												</div>
												<Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
											</div>
										))}
								</CardContent>
							</Card>

							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Bell className="w-5 h-5" />
										Recent Activity
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
											<CheckCircle className="w-5 h-5 text-primary mt-0.5" />
											<div>
												<p className="text-sm font-medium">Job completed for Mike Davis</p>
												<p className="text-xs text-muted-foreground">2 hours ago</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
											<Star className="w-5 h-5 text-primary mt-0.5" />
											<div>
												<p className="text-sm font-medium">5-star review received</p>
												<p className="text-xs text-muted-foreground">4 hours ago</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted-foreground/10 rounded-lg">
											<MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-sm font-medium">New quote request</p>
												<p className="text-xs text-muted-foreground">6 hours ago</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Button variant="outline" className="h-20 flex flex-col gap-2">
										<Plus className="w-6 h-6" />
										Schedule Job
									</Button>
									<Button variant="outline" className="h-20 flex flex-col gap-2">
										<MessageSquare className="w-6 h-6" />
										Send Quote
									</Button>
									<Button variant="outline" className="h-20 flex flex-col gap-2">
										<DollarSign className="w-6 h-6" />
										Create Invoice
									</Button>
									<Button variant="outline" className="h-20 flex flex-col gap-2">
										<Users className="w-6 h-6" />
										Manage Team
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Jobs & Schedule Tab */}
					<TabsContent value="jobs" className="space-y-6">
						<div className="flex justify-between items-center">
							<h2 className="text-2xl font-bold">Jobs & Schedule</h2>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filter
								</Button>
								<Button size="sm">
									<Plus className="w-4 h-4 mr-2" />
									New Job
								</Button>
							</div>
						</div>

						<Card>
							<CardContent className="p-0">
								<div className="divide-y">
									{jobs.map((job) => (
										<div key={job.id} className="p-6 hover:bg-gray-50">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="font-semibold">{job.customerName}</h3>
														<Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
														<span className={`text-sm ${getPriorityColor(job.priority)}`}>{job.priority} priority</span>
													</div>
													<p className="text-muted-foreground mb-2">{job.service}</p>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1">
															<Calendar className="w-4 h-4" />
															{format(job.scheduledTime, "MMM d, h:mm a")}
														</div>
														<div className="flex items-center gap-1">
															<MapPin className="w-4 h-4" />
															{job.address}
														</div>
														<div className="flex items-center gap-1">
															<Phone className="w-4 h-4" />
															{job.phone}
														</div>
													</div>
												</div>
												<div className="text-right">
													<p className="font-semibold text-lg">{job.estimatedPrice}</p>
													<p className="text-sm text-muted-foreground">{job.estimatedDuration}</p>
													<div className="flex gap-2 mt-2">
														<Button size="sm" variant="outline">
															Edit
														</Button>
														<Button size="sm">View</Button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Other tabs would be implemented similarly */}
					<TabsContent value="customers">
						<Card>
							<CardHeader>
								<CardTitle>Customer Management</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">Customer management features coming soon...</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="analytics">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="w-5 h-5" />
									Business Analytics
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="w-5 h-5" />
									Business Settings
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">Business configuration settings coming soon...</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
