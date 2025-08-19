"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Checkbox } from "@components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Calendar, Clock, DollarSign, Plus, Edit, Trash2, Play, Pause, Search, CheckCircle, MapPin, Repeat, TrendingUp, Eye, Copy, CalendarDays } from "lucide-react";
import { toast } from "@components/ui/use-toast";

export default function RecurringJobs() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("active");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedJobs, setSelectedJobs] = useState([]);

	// Mock recurring jobs data
	const [recurringJobs, setRecurringJobs] = useState([
		{
			id: "rj_001",
			title: "Monthly HVAC Maintenance",
			customer: {
				id: "c_001",
				name: "ABC Office Building",
				address: "123 Business Park Dr",
				phone: "(555) 123-4567",
			},
			frequency: "monthly",
			nextDate: "2024-01-15",
			duration: 120,
			assignedTechnician: {
				id: "t_001",
				name: "Mike Rodriguez",
				avatar: "/placeholder.svg",
			},
			serviceType: "HVAC",
			price: 450,
			status: "active",
			createdAt: "2023-12-01",
			lastCompleted: "2023-12-15",
			completedJobs: 12,
			totalRevenue: 5400,
			notes: "Check filters, clean coils, inspect ductwork",
			priority: "medium",
			autoSchedule: true,
			contractEnd: "2024-12-31",
		},
		{
			id: "rj_002",
			title: "Weekly Pool Maintenance",
			customer: {
				id: "c_002",
				name: "Sunrise Apartments",
				address: "456 Maple Street",
				phone: "(555) 234-5678",
			},
			frequency: "weekly",
			nextDate: "2024-01-10",
			duration: 90,
			assignedTechnician: {
				id: "t_002",
				name: "Alex Johnson",
				avatar: "/placeholder.svg",
			},
			serviceType: "Pool Maintenance",
			price: 120,
			status: "active",
			createdAt: "2023-11-01",
			lastCompleted: "2024-01-03",
			completedJobs: 8,
			totalRevenue: 960,
			notes: "Test water chemistry, clean filters, vacuum pool",
			priority: "high",
			autoSchedule: true,
			contractEnd: "2024-10-31",
		},
		{
			id: "rj_003",
			title: "Quarterly Plumbing Inspection",
			customer: {
				id: "c_003",
				name: "Downtown Restaurant",
				address: "789 Main Street",
				phone: "(555) 345-6789",
			},
			frequency: "quarterly",
			nextDate: "2024-01-20",
			duration: 180,
			assignedTechnician: {
				id: "t_003",
				name: "Sarah Davis",
				avatar: "/placeholder.svg",
			},
			serviceType: "Plumbing",
			price: 350,
			status: "paused",
			createdAt: "2023-10-01",
			lastCompleted: "2023-10-20",
			completedJobs: 4,
			totalRevenue: 1400,
			notes: "Inspect all pipes, check for leaks, test water pressure",
			priority: "low",
			autoSchedule: false,
			contractEnd: "2024-09-30",
		},
		{
			id: "rj_004",
			title: "Bi-weekly Landscaping",
			customer: {
				id: "c_004",
				name: "Greenview HOA",
				address: "321 Garden Lane",
				phone: "(555) 456-7890",
			},
			frequency: "biweekly",
			nextDate: "2024-01-12",
			duration: 240,
			assignedTechnician: {
				id: "t_004",
				name: "Tom Wilson",
				avatar: "/placeholder.svg",
			},
			serviceType: "Landscaping",
			price: 280,
			status: "active",
			createdAt: "2023-09-01",
			lastCompleted: "2023-12-29",
			completedJobs: 10,
			totalRevenue: 2800,
			notes: "Mow, trim, weed beds, check irrigation",
			priority: "medium",
			autoSchedule: true,
			contractEnd: "2024-08-31",
		},
	]);

	const [dashboardStats, setDashboardStats] = useState({
		total: recurringJobs.length,
		active: recurringJobs.filter((job) => job.status === "active").length,
		paused: recurringJobs.filter((job) => job.status === "paused").length,
		totalRevenue: recurringJobs.reduce((sum, job) => sum + job.totalRevenue, 0),
		avgJobValue: recurringJobs.reduce((sum, job) => sum + job.price, 0) / recurringJobs.length,
		upcomingThisWeek: recurringJobs.filter((job) => {
			const nextDate = new Date(job.nextDate);
			const today = new Date();
			const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
			return nextDate >= today && nextDate <= weekFromNow;
		}).length,
	});

	const frequencies = [
		{ value: "weekly", label: "Weekly" },
		{ value: "biweekly", label: "Bi-weekly" },
		{ value: "monthly", label: "Monthly" },
		{ value: "quarterly", label: "Quarterly" },
		{ value: "yearly", label: "Yearly" },
	];

	const serviceTypes = ["HVAC", "Plumbing", "Electrical", "Pool Maintenance", "Landscaping", "Cleaning", "Pest Control"];

	const filteredJobs = recurringJobs.filter((job) => {
		const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = filterStatus === "all" || job.status === filterStatus;
		const matchesTab = activeTab === "all" || (activeTab === "active" && job.status === "active") || (activeTab === "paused" && job.status === "paused");

		return matchesSearch && matchesStatus && matchesTab;
	});

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(new Date(dateString));
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "paused":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "completed":
				return "bg-primary/10 text-primary dark:bg-primary dark:text-primary/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "high":
				return "text-destructive dark:text-destructive";
			case "medium":
				return "text-warning dark:text-warning";
			case "low":
				return "text-success dark:text-success";
			default:
				return "text-muted-foreground dark:text-muted-foreground";
		}
	};

	const getDaysUntilNext = (nextDate) => {
		const today = new Date();
		const next = new Date(nextDate);
		const diffTime = next - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const handleToggleStatus = (jobId) => {
		setRecurringJobs(
			recurringJobs.map((job) => ({
				...job,
				status: job.id === jobId ? (job.status === "active" ? "paused" : "active") : job.status,
			}))
		);

		toast({
			title: "Status Updated",
			description: "Recurring job status has been changed.",
		});
	};

	const handleDeleteJob = (jobId) => {
		setRecurringJobs(recurringJobs.filter((job) => job.id !== jobId));
		toast({
			title: "Job Deleted",
			description: "Recurring job has been permanently deleted.",
		});
	};

	const handleDuplicateJob = (jobId) => {
		const jobToDuplicate = recurringJobs.find((job) => job.id === jobId);
		if (jobToDuplicate) {
			const newJob = {
				...jobToDuplicate,
				id: `rj_${Date.now()}`,
				title: `${jobToDuplicate.title} (Copy)`,
				createdAt: new Date().toISOString().split("T")[0],
				completedJobs: 0,
				totalRevenue: 0,
				lastCompleted: null,
			};
			setRecurringJobs([...recurringJobs, newJob]);
			toast({
				title: "Job Duplicated",
				description: "A copy of the recurring job has been created.",
			});
		}
	};

	const handleBulkAction = (action) => {
		switch (action) {
			case "activate":
				setRecurringJobs(
					recurringJobs.map((job) => ({
						...job,
						status: selectedJobs.includes(job.id) ? "active" : job.status,
					}))
				);
				break;
			case "pause":
				setRecurringJobs(
					recurringJobs.map((job) => ({
						...job,
						status: selectedJobs.includes(job.id) ? "paused" : job.status,
					}))
				);
				break;
			case "delete":
				setRecurringJobs(recurringJobs.filter((job) => !selectedJobs.includes(job.id)));
				break;
		}
		setSelectedJobs([]);
		toast({
			title: "Bulk Action Completed",
			description: `${action} applied to ${selectedJobs.length} jobs.`,
		});
	};

	return (
		<div className="py-8 mx-auto max-w-7xl space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Recurring Jobs</h1>
					<p className="text-muted-foreground">Manage automated scheduling and maintenance contracts</p>
				</div>
				<Button onClick={() => router.push("/dashboard/business/schedule/recurring-jobs/create")}>
					<Plus className="mr-2 w-4 h-4" />
					Create Recurring Job
				</Button>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Total Jobs</p>
								<p className="text-2xl font-bold">{dashboardStats.total}</p>
							</div>
							<Repeat className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Active</p>
								<p className="text-2xl font-bold text-success">{dashboardStats.active}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Paused</p>
								<p className="text-2xl font-bold text-warning">{dashboardStats.paused}</p>
							</div>
							<Pause className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Total Revenue</p>
								<p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Job Value</p>
								<p className="text-2xl font-bold">{formatCurrency(dashboardStats.avgJobValue)}</p>
							</div>
							<TrendingUp className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Due This Week</p>
								<p className="text-2xl font-bold text-warning">{dashboardStats.upcomingThisWeek}</p>
							</div>
							<Calendar className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-1 gap-4 items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 w-4 h-4 text-muted-foreground transform -translate-y-1/2" />
								<Input placeholder="Search jobs or customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
							<Select value={filterStatus} onValueChange={setFilterStatus}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="paused">Paused</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{selectedJobs.length > 0 && (
							<div className="flex gap-2 items-center">
								<span className="text-sm text-muted-foreground">{selectedJobs.length} selected</span>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("activate")}>
									<Play className="mr-1 w-4 h-4" />
									Activate
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("pause")}>
									<Pause className="mr-1 w-4 h-4" />
									Pause
								</Button>
								<Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
									<Trash2 className="mr-1 w-4 h-4" />
									Delete
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="active">Active ({dashboardStats.active})</TabsTrigger>
					<TabsTrigger value="paused">Paused ({dashboardStats.paused})</TabsTrigger>
					<TabsTrigger value="all">All Jobs ({dashboardStats.total})</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-6">
					{/* Jobs List */}
					<div className="space-y-4">
						{filteredJobs.map((job) => (
							<Card key={job.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex gap-4 items-start">
										<Checkbox
											checked={selectedJobs.includes(job.id)}
											onCheckedChange={(checked) => {
												setSelectedJobs(checked ? [...selectedJobs, job.id] : selectedJobs.filter((id) => id !== job.id));
											}}
										/>

										<div className="flex-1 space-y-4">
											{/* Header */}
											<div className="flex justify-between items-start">
												<div>
													<h3 className="text-lg font-semibold">{job.title}</h3>
													<p className="text-muted-foreground">{job.customer.name}</p>
												</div>
												<div className="flex gap-2 items-center">
													<Badge className={getStatusColor(job.status)}>{job.status}</Badge>
													{job.autoSchedule && <Badge variant="outline">Auto</Badge>}
												</div>
											</div>

											{/* Job Details */}
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
												<div className="flex gap-2 items-center">
													<Repeat className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm capitalize">{job.frequency}</span>
												</div>
												<div className="flex gap-2 items-center">
													<Calendar className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">
														Next: {formatDate(job.nextDate)} ({getDaysUntilNext(job.nextDate)} days)
													</span>
												</div>
												<div className="flex gap-2 items-center">
													<Clock className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">{job.duration} min</span>
												</div>
												<div className="flex gap-2 items-center">
													<DollarSign className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">{formatCurrency(job.price)}</span>
												</div>
											</div>

											{/* Technician and Customer Info */}
											<div className="flex justify-between items-center">
												<div className="flex gap-4 items-center">
													<div className="flex gap-2 items-center">
														<Avatar className="w-8 h-8">
															<AvatarImage src={job.assignedTechnician.avatar} />
															<AvatarFallback className="text-xs">
																{job.assignedTechnician.name
																	.split(" ")
																	.map((n) => n[0])
																	.join("")}
															</AvatarFallback>
														</Avatar>
														<span className="text-sm">{job.assignedTechnician.name}</span>
													</div>
													<div className="flex gap-2 items-center">
														<MapPin className="w-4 h-4 text-muted-foreground" />
														<span className="text-sm">{job.customer.address}</span>
													</div>
												</div>

												<div className="flex gap-2">
													<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/business/schedule/recurring-jobs/${job.id}`)}>
														<Eye className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/business/schedule/recurring-jobs/${job.id}/edit`)}>
														<Edit className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleDuplicateJob(job.id)}>
														<Copy className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleToggleStatus(job.id)} className={job.status === "active" ? "text-warning" : "text-success"}>
														{job.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)} className="text-destructive">
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>

											{/* Performance Stats */}
											<div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
												<div className="grid grid-cols-3 gap-4 text-center">
													<div>
														<p className="text-sm text-muted-foreground">Completed</p>
														<p className="text-lg font-semibold">{job.completedJobs}</p>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Total Revenue</p>
														<p className="text-lg font-semibold">{formatCurrency(job.totalRevenue)}</p>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Contract Ends</p>
														<p className="text-lg font-semibold">{formatDate(job.contractEnd)}</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{filteredJobs.length === 0 && (
							<Card>
								<CardContent className="p-12 text-center">
									<CalendarDays className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
									<h3 className="mb-2 text-lg font-semibold">No recurring jobs found</h3>
									<p className="mb-6 text-muted-foreground">{searchTerm || filterStatus !== "all" ? "Try adjusting your filters" : "Create your first recurring job to get started"}</p>
									{!searchTerm && filterStatus === "all" && (
										<Button onClick={() => router.push("/dashboard/business/schedule/recurring-jobs/create")}>
											<Plus className="mr-2 w-4 h-4" />
											Create Recurring Job
										</Button>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
