"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Checkbox } from "@components/ui/checkbox";
import { Plus, MapPin, Users, Eye, MessageSquare, TrendingUp, AlertCircle, Search, MoreHorizontal, Edit, Copy, Zap, ChevronDown, Filter, Download, Trash2, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

// Mock job data - in real app this would come from API
const mockJobs = [
	{
		id: 1,
		title: "Kitchen Faucet Replacement",
		description: "Need to replace a leaky kitchen faucet. The current one is old and beyond repair.",
		category: "Plumbing",
		budget: "$150-250",
		location: "Downtown Sacramento, CA",
		posted: "2 hours ago",
		status: "active",
		urgency: "medium",
		contractorsNotified: 4,
		responses: 2,
		views: 12,
		boosted: false,
		timeline: "This week",
	},
	{
		id: 2,
		title: "Electrical Outlet Installation",
		description: "Need 3 new outlets installed in my home office. Wall is already accessible.",
		category: "Electrical",
		budget: "$200-400",
		location: "Midtown Sacramento, CA",
		posted: "1 day ago",
		status: "completed",
		urgency: "low",
		contractorsNotified: 5,
		responses: 3,
		views: 8,
		boosted: true,
		timeline: "Next week",
	},
	{
		id: 3,
		title: "HVAC System Maintenance",
		description: "Annual maintenance and cleaning for residential HVAC system before winter.",
		category: "HVAC",
		budget: "$300-500",
		location: "East Sacramento, CA",
		posted: "3 days ago",
		status: "in-progress",
		urgency: "high",
		contractorsNotified: 6,
		responses: 4,
		views: 15,
		boosted: false,
		timeline: "ASAP",
	},
];

const statusFilters = [
	{ value: "all", label: "All", count: 15 },
	{ value: "active", label: "Active", count: 8 },
	{ value: "draft", label: "Draft", count: 2 },
	{ value: "in-progress", label: "In Progress", count: 3 },
	{ value: "completed", label: "Completed", count: 2 },
];

export default function JobsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedJobs, setSelectedJobs] = useState([]);
	const [selectAll, setSelectAll] = useState(false);

	React.useEffect(() => {
		document.title = "My Jobs - User Dashboard - Thorbis";
	}, []);

	useEffect(() => {
		document.title = "My Jobs - User Dashboard - Thorbis";
	}, []);

	const filteredJobs = mockJobs.filter((job) => {
		const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.category.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = filterStatus === "all" || job.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const handleSelectAll = (checked) => {
		setSelectAll(checked);
		if (checked) {
			setSelectedJobs(filteredJobs.map((job) => job.id));
		} else {
			setSelectedJobs([]);
		}
	};

	const handleSelectJob = (jobId, checked) => {
		if (checked) {
			setSelectedJobs((prev) => [...prev, jobId]);
		} else {
			setSelectedJobs((prev) => prev.filter((id) => id !== jobId));
			setSelectAll(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "active":
				return (
					<Badge variant="secondary" className="bg-success/10 text-success dark:text-success hover:bg-success/20">
						Active
					</Badge>
				);
			case "in-progress":
				return (
					<Badge variant="secondary" className="bg-primary/10 text-primary dark:text-primary hover:bg-primary/20">
						In Progress
					</Badge>
				);
			case "completed":
				return (
					<Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80">
						Completed
					</Badge>
				);
			case "draft":
				return (
					<Badge variant="secondary" className="bg-warning/10 text-warning dark:text-warning hover:bg-warning/20">
						Draft
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="w-full px-4 py-16 space-y-8 lg:px-24">
			{/* Header - Shopify Style */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline">
						<Download className="w-4 h-4 mr-2" />
						Export
					</Button>
					<Button variant="outline">Import</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								More actions
								<ChevronDown className="w-4 h-4 ml-2" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>Edit jobs</DropdownMenuItem>
							<DropdownMenuItem>Duplicate jobs</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">Delete jobs</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Link href="/dashboard/user/jobs/create">
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Add job
						</Button>
					</Link>
				</div>
			</div>
			{/* Filters - Shopify Tab Style */}
			<div className="border-b border-border">
				<nav className="flex space-x-8" aria-label="Tabs">
					{statusFilters.map((filter) => (
						<button key={filter.value} onClick={() => setFilterStatus(filter.value)} className={`${filterStatus === filter.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
							{filter.label}
							<span className={`${filterStatus === filter.value ? "bg-primary/5 text-primary border border-primary/20" : "bg-muted text-muted-foreground"} ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>{filter.count}</span>
						</button>
					))}
				</nav>
			</div>
			{/* Search and Filters Toolbar */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input placeholder="Search jobs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Filter className="w-4 h-4 mr-2" />
						Filter
					</Button>
					<Button variant="outline" size="sm">
						<ArrowUpDown className="w-4 h-4 mr-2" />
						Sort
					</Button>
				</div>
			</div>
			{/* Bulk Actions */}
			{selectedJobs.length > 0 && (
				<div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-primary">
							{selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""} selected
						</span>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Edit className="w-4 h-4 mr-2" />
								Edit jobs
							</Button>
							<Button variant="outline" size="sm">
								<TrendingUp className="w-4 h-4 mr-2" />
								Boost jobs
							</Button>
							<Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
								<Trash2 className="w-4 h-4 mr-2" />
								Delete jobs
							</Button>
						</div>
					</div>
				</div>
			)}
			{/* Jobs Table - Shopify Style */}
			<div className="bg-card border border-border rounded-lg shadow-sm">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="w-12 p-4">
								<Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all jobs" />
							</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Job</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Status</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Category</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Budget</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Responses</TableHead>
							<TableHead className="text-left font-medium text-muted-foreground">Posted</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredJobs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="text-center py-12">
									<div className="flex flex-col items-center gap-2">
										<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
											<Users className="w-6 h-6 text-muted-foreground" />
										</div>
										<h3 className="font-medium text-foreground">No jobs found</h3>
										<p className="text-sm text-muted-foreground mb-4">{searchQuery ? "Try adjusting your search" : "Get started by creating your first job"}</p>
										{!searchQuery && (
											<Link href="/dashboard/user/jobs/create">
												<Button>
													<Plus className="w-4 h-4 mr-2" />
													Add job
												</Button>
											</Link>
										)}
									</div>
								</TableCell>
							</TableRow>
						) : (
							filteredJobs.map((job) => (
								<TableRow key={job.id} className="hover:bg-muted/50">
									<TableCell className="p-4">
										<Checkbox checked={selectedJobs.includes(job.id)} onCheckedChange={(checked) => handleSelectJob(job.id, checked)} aria-label={`Select ${job.title}`} />
									</TableCell>
									<TableCell className="p-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
												{job.category === "Plumbing" && "🔧"}
												{job.category === "Electrical" && "⚡"}
												{job.category === "HVAC" && "🌡️"}
											</div>
											<div className="min-w-0 flex-1">
												<Link href={`/dashboard/user/jobs/${job.id}`}>
													<div className="font-medium text-foreground hover:text-primary cursor-pointer">
														{job.title}
														{job.boosted && (
															<Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
																<Zap className="w-3 h-3 mr-1" />
																Boosted
															</Badge>
														)}
													</div>
												</Link>
												<div className="text-sm text-muted-foreground truncate">{job.description}</div>
												<div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
													<MapPin className="w-3 h-3" />
													{job.location}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="p-4">{getStatusBadge(job.status)}</TableCell>
									<TableCell className="p-4">
										<span className="text-sm text-foreground">{job.category}</span>
									</TableCell>
									<TableCell className="p-4">
										<span className="text-sm text-foreground">{job.budget}</span>
									</TableCell>
									<TableCell className="p-4">
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-1 text-sm">
												<MessageSquare className="w-4 h-4 text-muted-foreground" />
												<span className="font-medium">{job.responses}</span>
											</div>
											<div className="flex items-center gap-1 text-sm text-muted-foreground">
												<Eye className="w-4 h-4" />
												<span>{job.views}</span>
											</div>
										</div>
									</TableCell>
									<TableCell className="p-4">
										<div className="text-sm text-muted-foreground">
											<div>{job.posted}</div>
											<div className="text-xs">{job.timeline}</div>
										</div>
									</TableCell>
									<TableCell className="p-4">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>
													<Eye className="w-4 h-4 mr-2" />
													View details
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Edit className="w-4 h-4 mr-2" />
													Edit job
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Copy className="w-4 h-4 mr-2" />
													Duplicate
												</DropdownMenuItem>
												{!job.boosted && (
													<DropdownMenuItem>
														<TrendingUp className="w-4 h-4 mr-2" />
														Boost job
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">
													<Trash2 className="w-4 h-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Showing 1-{filteredJobs.length} of {filteredJobs.length} jobs
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled>
						Previous
					</Button>
					<Button variant="outline" size="sm" disabled>
						Next
					</Button>
				</div>
			</div>
			{/* Help Section */}
			<Card className="bg-primary/5 border-primary/20">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
							<AlertCircle className="w-4 h-4 text-primary" />
						</div>
						<div className="flex-1">
							<h3 className="font-medium text-foreground mb-2">How job posting works</h3>
							<div className="space-y-1 text-sm text-muted-foreground">
								<p>• Your job posts are sent to the 3-6 closest contractors in your selected category</p>
								<p>• Contractors can respond with quotes and availability within 24-48 hours</p>
								<p>• Boost your job to reach 10-50+ more contractors faster (expect more calls)</p>
								<p>• All contractors are pre-screened and verified for quality assurance</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

