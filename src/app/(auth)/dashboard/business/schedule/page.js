"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Progress } from "@components/ui/progress";
import { Skeleton } from "@components/ui/skeleton";
import { Calendar, Clock, Users, MapPin, Plus, Route, CheckCircle, AlertTriangle, Timer, Target, BarChart3, DollarSign, Zap, RefreshCw } from "lucide-react";
import { format, parseISO, isTomorrow } from "date-fns";
import { useSchedule } from "@lib/hooks/business/use-schedule";
import { toast } from "@components/ui/use-toast";
/**
 * Main Schedule Overview Dashboard
 * Central hub for all scheduling operations with quick access to calendar, jobs, and route planning
 */
export default function ScheduleOverview() {
	const router = useRouter();

	// Use real schedule data with auto-refresh
	const {
		todaysJobs,
		upcomingJobs,
		technicians,
		metrics: scheduleMetrics,
		todaysStats,
		availableTechnicians,
		busyTechnicians,
		todaysRevenue,
		completionRate,
		nextJob,
		isLoading,
		isRefreshing,
		error,
		lastUpdated,
		refresh,
		updateJobStatus,
		isReady,
		hasData,
	} = useSchedule({
		autoRefresh: true,
		refreshInterval: 60000, // 1 minute
		includeCompleted: true,
		upcomingDays: 7,
	});

	// Handle job status changes
	const handleStatusChange = async (jobId, newStatus) => {
		const success = await updateJobStatus(jobId, newStatus);
		if (success) {
			toast({
				title: "Job Updated",
				description: `Job status changed to ${newStatus.replace("_", " ")}`,
			});
		}
	};

	// Show loading state
	if (isLoading) {
		return (
			<div className="space-y-0">
				<div className="py-8">
					<div className="mb-8">
						<Skeleton className="mb-2 w-64 h-8" />
						<Skeleton className="w-96 h-4" />
					</div>
					<div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<Card key={i}>
								<CardContent className="p-6">
									<Skeleton className="mb-2 w-20 h-4" />
									<Skeleton className="mb-1 w-16 h-8" />
									<Skeleton className="w-24 h-3" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error && !hasData) {
		return (
			<div className="flex justify-center items-center py-16">
				<Card className="max-w-md">
					<CardContent className="p-6 text-center">
						<AlertTriangle className="mx-auto mb-4 w-12 h-12 text-destructive" />
						<h3 className="mb-2 text-lg font-semibold">Unable to Load Schedule</h3>
						<p className="mb-4 text-muted-foreground">{error}</p>
						<Button onClick={refresh}>
							<RefreshCw className="mr-2 w-4 h-4" />
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success/10 text-success dark:bg-success/20 dark:text-success/90";
			case "in_progress":
				return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/90";
			case "scheduled":
				return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90";
			case "overdue":
				return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/90";
			default:
				return "bg-muted text-foreground dark:bg-card/20 dark:text-muted-foreground";
		}
	};

	const getTechnicianStatusColor = (status) => {
		switch (status) {
			case "available":
				return "bg-success/10 text-success";
			case "on_job":
				return "bg-warning/10 text-warning";
			case "traveling":
				return "bg-primary/10 text-primary";
			case "offline":
				return "bg-muted text-foreground";
			default:
				return "bg-muted text-foreground";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "urgent":
				return "border-l-red-500";
			case "high":
				return "border-l-orange-500";
			case "normal":
				return "border-l-blue-500";
			case "low":
				return "border-l-green-500";
			default:
				return "border-l-gray-500";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Schedule Dashboard</h1>
					<p className="text-muted-foreground">Manage your team&apos;s schedule, assignments, and route optimization</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button size="sm" variant="outline" onClick={refresh} disabled={isRefreshing}>
						<RefreshCw className={`mr-2 w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
						{isRefreshing ? "Refreshing..." : "Refresh"}
					</Button>
					<Button size="sm" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
						<Plus className="mr-2 w-4 h-4" />
						New Job
					</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Today&apos;s Jobs</p>
								<p className="text-2xl font-bold">{todaysStats.total}</p>
								<p className="text-xs text-muted-foreground">
									{todaysStats.completed} completed • {todaysStats.inProgress} in progress
								</p>
							</div>
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Completion Rate</p>
								<p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
								<Progress value={completionRate} className="mt-2 h-2" />
							</div>
							<Target className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Team Status</p>
								<p className="text-2xl font-bold">{availableTechnicians.length}</p>
								<p className="text-xs text-muted-foreground">
									{availableTechnicians.length} available • {busyTechnicians.length} busy
								</p>
							</div>
							<Users className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
								<p className="text-2xl font-bold">${todaysRevenue.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">{lastUpdated ? `Updated ${format(lastUpdated, "HH:mm")}` : "Live data"}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Tabs defaultValue="today" className="space-y-4">
				<TabsList>
					<TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
					<TabsTrigger value="technicians">Team Status</TabsTrigger>
					<TabsTrigger value="upcoming">Upcoming Jobs</TabsTrigger>
				</TabsList>

				<TabsContent value="today" className="space-y-4">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Today&apos;s Jobs */}
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex gap-2 items-center">
										<Calendar className="w-5 h-5" />
										Today&apos;s Jobs ({todaysJobs.length})
									</CardTitle>
								</CardHeader>
								<CardContent>
									{todaysJobs.length > 0 ? (
										<div className="space-y-3">
											{todaysJobs.map((job) => (
												<div key={job.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(job.priority)} bg-card hover:bg-accent/50 transition-colors`}>
													<div className="flex justify-between items-start mb-3">
														<div className="flex-1">
															<h4 className="font-medium cursor-pointer hover:text-primary" onClick={() => router.push(`/dashboard/business/jobs/details?id=${job.id}`)}>
																{job.title}
															</h4>
															<p className="mt-1 text-sm text-muted-foreground">{job.customer?.name || job.customer_name}</p>
														</div>
														<div className="flex gap-2 items-center">
															<Badge className={getStatusColor(job.status)} variant="secondary">
																{job.status.replace("_", " ")}
															</Badge>
															{job.status === "scheduled" && (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleStatusChange(job.id, "in_progress");
																	}}
																>
																	Start
																</Button>
															)}
															{job.status === "in_progress" && (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleStatusChange(job.id, "completed");
																	}}
																>
																	Complete
																</Button>
															)}
														</div>
													</div>
													<div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 text-muted-foreground">
														<div className="flex gap-1 items-center">
															<Clock className="w-4 h-4" />
															{format(parseISO(job.scheduled_start), "HH:mm")} - {format(parseISO(job.scheduled_end), "HH:mm")}
														</div>
														<div className="flex gap-1 items-center">
															<MapPin className="w-4 h-4" />
															{job.customer?.address?.split(",")[0] || job.location || "Location TBD"}
														</div>
														<div className="flex gap-1 items-center">
															<DollarSign className="w-4 h-4" />${(job.actual_value || job.estimated_value || 0).toLocaleString()}
														</div>
														{job.technician && (
															<div className="flex gap-1 items-center">
																<Users className="w-4 h-4" />
																{job.technician.name}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="py-8 text-center">
											<Calendar className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
											<p className="text-muted-foreground">No jobs scheduled for today</p>
											<Button className="mt-4" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
												<Plus className="mr-2 w-4 h-4" />
												Schedule New Job
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions */}
						<div>
							<Card>
								<CardHeader>
									<CardTitle className="flex gap-2 items-center">
										<Zap className="w-5 h-5" />
										Quick Actions
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<Button className="justify-start w-full" variant="outline" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
										<Plus className="mr-2 w-4 h-4" />
										Schedule New Job
									</Button>
									<Button className="justify-start w-full" variant="outline" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
										<Calendar className="mr-2 w-4 h-4" />
										View Full Calendar
									</Button>
									<Button className="justify-start w-full" variant="outline" onClick={() => router.push("/dashboard/business/schedule/route-planner")}>
										<Route className="mr-2 w-4 h-4" />
										Optimize Routes
									</Button>
									<Button className="justify-start w-full" variant="outline" onClick={() => router.push("/dashboard/business/schedule/technician-availability")}>
										<Users className="mr-2 w-4 h-4" />
										Manage Availability
									</Button>
									<Button className="justify-start w-full" variant="outline" onClick={() => router.push("/dashboard/business/schedule/recurring-jobs")}>
										<Timer className="mr-2 w-4 h-4" />
										Recurring Services
									</Button>
								</CardContent>
							</Card>

							{/* Today&apos;s Summary */}
							<Card className="mt-4">
								<CardHeader>
									<CardTitle className="flex gap-2 items-center">
										<BarChart3 className="w-5 h-5" />
										Today&apos;s Summary
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between">
										<span className="text-sm">Total Jobs</span>
										<span className="font-semibold">{scheduleMetrics?.totalJobs || 0}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">Completed</span>
										<span className="font-semibold text-success">{scheduleMetrics?.completedJobs || 0}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">In Progress</span>
										<span className="font-semibold text-warning">{scheduleMetrics?.inProgressJobs || 0}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">Scheduled</span>
										<span className="font-semibold text-primary">{scheduleMetrics?.scheduledJobs || 0}</span>
									</div>
									<div className="flex justify-between pt-3 border-t">
										<span className="text-sm font-medium">Est. Revenue</span>
										<span className="font-semibold text-success">${scheduleMetrics?.totalRevenue?.toLocaleString() || 0}</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="technicians" className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{technicians.map((technician) => (
							<Card key={technician.id}>
								<CardContent className="p-4">
									<div className="flex justify-between items-center mb-3">
										<div>
											<h3 className="font-semibold">{technician.name}</h3>
											<p className="text-sm text-muted-foreground">{technician.role}</p>
										</div>
										<Badge className={getTechnicianStatusColor(technician.status)} variant="secondary">
											{technician.status.replace("_", " ")}
										</Badge>
									</div>

									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>Vehicle:</span>
											<span className="font-medium">{technician.vehicle}</span>
										</div>
										<div className="flex justify-between">
											<span>Today&apos;s Jobs:</span>
											<span className="font-medium">{technician.todaysJobs}</span>
										</div>
										<div className="flex justify-between">
											<span>Completed:</span>
											<span className="font-medium text-success">{technician.completedJobs}</span>
										</div>
										<div className="flex justify-between">
											<span>Efficiency:</span>
											<span className="font-medium">{technician.efficiency}%</span>
										</div>
									</div>

									{technician.currentJob && (
										<div className="p-2 mt-3 bg-yellow-50 rounded border-l-4 border-yellow-500 dark:bg-warning/20">
											<p className="text-xs font-medium text-warning dark:text-warning/90">Currently Working:</p>
											<p className="text-sm">{technician.currentJob.customer}</p>
											<p className="text-xs text-muted-foreground">
												Started: {technician.currentJob.startTime} • Est. End: {technician.currentJob.estimatedEnd}
											</p>
										</div>
									)}

									{technician.nextJob && (
										<div className="p-2 mt-3 bg-blue-50 rounded border-l-4 border-primary dark:bg-primary/20">
											<p className="text-xs font-medium text-primary dark:text-primary/90">Next Job:</p>
											<p className="text-sm">{technician.nextJob.customer}</p>
											<p className="text-xs text-muted-foreground">
												{technician.nextJob.time} • {technician.nextJob.location}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="upcoming" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex gap-2 items-center">
								<Calendar className="w-5 h-5" />
								Upcoming Jobs (Next 7 Days)
							</CardTitle>
						</CardHeader>
						<CardContent>
							{upcomingJobs.length > 0 ? (
								<div className="space-y-3">
									{upcomingJobs.map((job) => (
										<div key={job.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(job.priority)} bg-card hover:bg-accent/50 transition-colors cursor-pointer`} onClick={() => router.push(`/dashboard/business/jobs/details?id=${job.id}`)}>
											<div className="flex justify-between items-center mb-2">
												<h4 className="font-medium">{job.title}</h4>
												<div className="flex gap-2 items-center">
													<Badge variant="outline">{isTomorrow(parseISO(job.scheduledStart)) ? "Tomorrow" : format(parseISO(job.scheduledStart), "MMM d")}</Badge>
													<Badge className={getStatusColor(job.status)} variant="secondary">
														{job.status.replace("_", " ")}
													</Badge>
												</div>
											</div>
											<div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 text-muted-foreground">
												<div className="flex gap-1 items-center">
													<Users className="w-4 h-4" />
													{job.customer}
												</div>
												<div className="flex gap-1 items-center">
													<Clock className="w-4 h-4" />
													{format(parseISO(job.scheduledStart), "HH:mm")} - {format(parseISO(job.scheduledEnd), "HH:mm")}
												</div>
												<div className="flex gap-1 items-center">
													<MapPin className="w-4 h-4" />
													{job.address.split(",")[0]}
												</div>
												<div className="flex gap-1 items-center">
													<DollarSign className="w-4 h-4" />${job.estimatedValue}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center">
									<Calendar className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
									<p className="text-muted-foreground">No upcoming jobs in the next 7 days</p>
									<Button className="mt-4" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
										<Plus className="mr-2 w-4 h-4" />
										Schedule New Job
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
