"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Search, Calendar, MapPin, Star, MessageSquare, Briefcase, CheckCircle, Clock, XCircle, Eye, Edit, Trash2, ExternalLink } from "react-feather";

export default function Activity() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");

	React.useEffect(() => {
		document.title = "Activity - User Dashboard - Thorbis";
	}, []);

	// Mock activity data - in real app this would come from API
	const activities = useMemo(
		() => [
			{
				id: 1,
				type: "job_application",
				title: "Applied for Web Designer Position",
				description: "Submitted application for freelance web design project",
				business: "Tech Solutions Inc.",
				status: "pending",
				date: "2024-01-15T10:30:00Z",
				location: "Remote",
				rating: null,
				amount: "$500-800",
				icon: Briefcase,
				actions: ["view", "edit", "withdraw"],
			},
			{
				id: 2,
				type: "review",
				title: "Left Review for Plumbing Service",
				description: "5-star review for emergency plumbing repair",
				business: "Wade&apos;s Plumbing & Septic",
				status: "completed",
				date: "2024-01-14T16:45:00Z",
				location: "Local",
				rating: 5,
				amount: "$150",
				icon: Star,
				actions: ["view", "edit", "delete"],
				blockchainHash: "0x1234...5678",
			},
			{
				id: 3,
				type: "job_completed",
				title: "Completed Logo Design Project",
				description: "Successfully delivered logo design for local bakery",
				business: "Sweet Treats Bakery",
				status: "completed",
				date: "2024-01-12T14:20:00Z",
				location: "Remote",
				rating: 5,
				amount: "$300",
				icon: CheckCircle,
				actions: ["view", "review"],
			},
			{
				id: 4,
				type: "message",
				title: "Message Exchange with Contractor",
				description: "Discussed project requirements and timeline",
				business: "Home Renovation Pro",
				status: "active",
				date: "2024-01-11T09:15:00Z",
				location: "Local",
				rating: null,
				amount: "$2000-3000",
				icon: MessageSquare,
				actions: ["view", "reply"],
			},
			{
				id: 5,
				type: "job_application",
				title: "Applied for Marketing Consultant",
				description: "Submitted proposal for digital marketing campaign",
				business: "Local Business Hub",
				status: "rejected",
				date: "2024-01-10T11:30:00Z",
				location: "Hybrid",
				rating: null,
				amount: "$1000-1500",
				icon: Briefcase,
				actions: ["view", "feedback"],
			},
			{
				id: 6,
				type: "review",
				title: "Updated Review for Cleaning Service",
				description: "Updated 4-star review with additional photos",
				business: "Sparkle Clean Pro",
				status: "completed",
				date: "2024-01-09T13:45:00Z",
				location: "Local",
				rating: 4,
				amount: "$120",
				icon: Star,
				actions: ["view", "edit", "delete"],
				blockchainHash: "0x8765...4321",
			},
		],
		[]
	);

	const filteredActivities = useMemo(() => {
		return activities.filter((activity) => {
			const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || activity.business.toLowerCase().includes(searchTerm.toLowerCase()) || activity.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesType = filterType === "all" || activity.type === filterType;
			const matchesStatus = filterStatus === "all" || activity.status === filterStatus;

			return matchesSearch && matchesType && matchesStatus;
		});
	}, [activities, searchTerm, filterType, filterStatus]);

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "pending":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "active":
				return "bg-primary/10 text-primary dark:bg-primary dark:text-primary/90";
			case "rejected":
				return "bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getTypeLabel = (type) => {
		switch (type) {
			case "job_application":
				return "Job Application";
			case "review":
				return "Review";
			case "job_completed":
				return "Job Completed";
			case "message":
				return "Message";
			default:
				return type;
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	};

	return (
		<div className="px-4 py-16 space-y-8 w-full lg:px-24 bg-white dark:bg-neutral-900">
			{/* Header */}
			<div className="flex justify-between items-center space-x-6">
				<div>
					<h1 className="text-4xl font-bold">Activity</h1>
					<p className="mt-2 text-muted-foreground">Track your interactions, applications, and reviews</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Total Activities</CardTitle>
						<Briefcase className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activities.length}</div>
						<p className="text-xs text-muted-foreground">+12% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
						<Star className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activities.filter((a) => a.type === "review").length}</div>
						<p className="text-xs text-muted-foreground">All blockchain verified</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Active Applications</CardTitle>
						<Clock className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activities.filter((a) => a.status === "pending").length}</div>
						<p className="text-xs text-muted-foreground">Awaiting response</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
						<CheckCircle className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activities.filter((a) => a.status === "completed").length}</div>
						<p className="text-xs text-muted-foreground">Successfully delivered</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filter Activities</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
								<Input placeholder="Search activities, businesses, or descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
						</div>
						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="job_application">Job Applications</SelectItem>
								<SelectItem value="review">Reviews</SelectItem>
								<SelectItem value="job_completed">Completed Jobs</SelectItem>
								<SelectItem value="message">Messages</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Activity List */}
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Recent Activity</h2>
					<p className="text-sm text-muted-foreground">
						{filteredActivities.length} of {activities.length} activities
					</p>
				</div>

				{filteredActivities.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col justify-center items-center py-12">
							<Search className="mb-4 w-12 h-12 text-muted-foreground" />
							<h3 className="mb-2 text-lg font-medium">No activities found</h3>
							<p className="text-center text-muted-foreground">Try adjusting your search or filters to find what you&apos;re looking for.</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{filteredActivities.map((activity) => {
							const IconComponent = activity.icon;
							return (
								<Card key={activity.id} className="transition-shadow hover:shadow-md">
									<CardContent className="p-6">
										<div className="flex items-start space-x-4">
											<div className="flex-shrink-0">
												<div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
													<IconComponent className="w-5 h-5 text-primary" />
												</div>
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<div className="flex items-center mb-2 space-x-2">
															<h3 className="text-lg font-medium">{activity.title}</h3>
															<Badge variant="outline" className="text-xs">
																{getTypeLabel(activity.type)}
															</Badge>
															<Badge className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</Badge>
														</div>

														<p className="mb-3 text-muted-foreground">{activity.description}</p>

														<div className="flex items-center space-x-4 text-sm text-muted-foreground">
															<div className="flex items-center space-x-1">
																<Calendar className="w-4 h-4" />
																<span>{formatDate(activity.date)}</span>
															</div>
															<div className="flex items-center space-x-1">
																<MapPin className="w-4 h-4" />
																<span>{activity.location}</span>
															</div>
															{activity.rating && (
																<div className="flex items-center space-x-1">
																	<Star className="w-4 h-4 text-warning fill-yellow-400" />
																	<span>{activity.rating}/5</span>
																</div>
															)}
															{activity.amount && <span className="font-medium text-foreground">{activity.amount}</span>}
														</div>

														{activity.blockchainHash && (
															<div className="p-2 mt-3 bg-green-50 rounded-md dark:bg-success/20">
																<div className="flex items-center space-x-2 text-xs">
																	<div className="w-2 h-2 bg-success rounded-full"></div>
																	<span className="text-success dark:text-success/90">Blockchain Verified</span>
																	<span className="font-mono text-success dark:text-success">{activity.blockchainHash}</span>
																</div>
															</div>
														)}
													</div>

													<div className="flex items-center space-x-2">
														{activity.actions.includes("view") && (
															<Button variant="ghost" size="sm">
																<Eye className="w-4 h-4" />
															</Button>
														)}
														{activity.actions.includes("edit") && (
															<Button variant="ghost" size="sm">
																<Edit className="w-4 h-4" />
															</Button>
														)}
														{activity.actions.includes("delete") && (
															<Button variant="ghost" size="sm">
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
														{activity.actions.includes("withdraw") && (
															<Button variant="ghost" size="sm">
																<XCircle className="w-4 h-4" />
															</Button>
														)}
													</div>
												</div>

												<div className="flex justify-between items-center mt-4">
													<div className="flex items-center space-x-2">
														<Avatar className="w-6 h-6">
															<AvatarFallback className="text-xs">
																{activity.business
																	.split(" ")
																	.map((word) => word[0])
																	.join("")}
															</AvatarFallback>
														</Avatar>
														<span className="text-sm font-medium">{activity.business}</span>
													</div>

													<Link href={`/biz/${activity.id}`} passHref>
														<Button variant="outline" size="sm">
															<ExternalLink className="mr-2 w-4 h-4" />
															View Business
														</Button>
													</Link>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
