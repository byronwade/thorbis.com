"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Checkbox } from "@components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { FileText, Calendar, MapPin, Phone, Plus, Search, Filter, MoreVertical, Edit, Eye, Trash2, Send, Copy, Download, DollarSign, CheckCircle, Timer, Wrench, Zap, Settings, Target, SortAsc, SortDesc, Star } from "lucide-react";
import { format, parseISO, isToday, differenceInDays } from "date-fns";

/**
 * Estimates List Page - Comprehensive estimate management dashboard
 * Features: Advanced filtering, status tracking, follow-ups, and conversion analytics
 */
export default function EstimatesList() {
	const router = useRouter();
	const [estimates, setEstimates] = useState([]);
	const [filteredEstimates, setFilteredEstimates] = useState([]);
	const [selectedEstimates, setSelectedEstimates] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState("all");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [showFilters, setShowFilters] = useState(false);
	const [currentTab, setCurrentTab] = useState("all");

	// Mock data
	const mockEstimates = [
		{
			id: "EST001",
			number: "EST-2024-001",
			title: "HVAC System Installation",
			customer: {
				id: "CUST001",
				name: "Sarah Johnson",
				phone: "(555) 123-4567",
				email: "sarah.j@email.com",
				address: "123 Main St, Downtown",
				type: "residential",
			},
			description: "Complete HVAC system installation for 2-story home",
			status: "pending",
			priority: "normal",
			serviceType: "HVAC",
			totalAmount: 8500,
			validUntil: "2024-02-15T23:59:59",
			createdAt: "2024-01-20T10:00:00",
			updatedAt: "2024-01-20T10:00:00",
			sentAt: "2024-01-20T14:30:00",
			viewedAt: "2024-01-21T09:15:00",
			tags: ["Installation", "Residential"],
			followUpDate: "2024-01-27T10:00:00",
			conversionProbability: 75,
			lineItems: [
				{ description: "HVAC Unit", quantity: 1, rate: 5000, amount: 5000 },
				{ description: "Installation Labor", quantity: 16, rate: 125, amount: 2000 },
				{ description: "Ductwork", quantity: 1, rate: 1500, amount: 1500 },
			],
		},
		{
			id: "EST002",
			number: "EST-2024-002",
			title: "Emergency Electrical Panel Upgrade",
			customer: {
				id: "CUST002",
				name: "Bob&apos;s Restaurant",
				phone: "(555) 456-7890",
				email: "manager@bobsrestaurant.com",
				address: "456 Business Ave, Business District",
				type: "commercial",
			},
			description: "Electrical panel upgrade and safety inspection",
			status: "approved",
			priority: "urgent",
			serviceType: "Electrical",
			totalAmount: 3200,
			validUntil: "2024-01-30T23:59:59",
			createdAt: "2024-01-19T08:30:00",
			updatedAt: "2024-01-21T11:45:00",
			sentAt: "2024-01-19T10:00:00",
			viewedAt: "2024-01-19T14:20:00",
			approvedAt: "2024-01-21T11:45:00",
			tags: ["Emergency", "Commercial"],
			followUpDate: null,
			conversionProbability: 95,
			lineItems: [
				{ description: "200A Electrical Panel", quantity: 1, rate: 1800, amount: 1800 },
				{ description: "Installation & Wiring", quantity: 8, rate: 150, amount: 1200 },
				{ description: "Permits & Inspection", quantity: 1, rate: 200, amount: 200 },
			],
		},
		{
			id: "EST003",
			number: "EST-2024-003",
			title: "Plumbing System Maintenance",
			customer: {
				id: "CUST003",
				name: "Mountain View Apartments",
				phone: "(555) 789-0123",
				email: "maintenance@mvapartments.com",
				address: "789 Residential Rd, Residential Zone",
				type: "commercial",
			},
			description: "Quarterly plumbing maintenance for apartment complex",
			status: "rejected",
			priority: "low",
			serviceType: "Plumbing",
			totalAmount: 850,
			validUntil: "2024-02-01T23:59:59",
			createdAt: "2024-01-18T14:00:00",
			updatedAt: "2024-01-22T09:30:00",
			sentAt: "2024-01-18T16:00:00",
			viewedAt: "2024-01-19T08:45:00",
			rejectedAt: "2024-01-22T09:30:00",
			rejectionReason: "Budget constraints",
			tags: ["Maintenance", "Recurring"],
			followUpDate: "2024-02-15T10:00:00",
			conversionProbability: 25,
			lineItems: [
				{ description: "Drain Cleaning", quantity: 8, rate: 75, amount: 600 },
				{ description: "Inspection", quantity: 1, rate: 250, amount: 250 },
			],
		},
		{
			id: "EST004",
			number: "EST-2024-004",
			title: "Air Conditioning Repair",
			customer: {
				id: "CUST004",
				name: "Tech Solutions Inc",
				phone: "(555) 321-6543",
				email: "facilities@techsolutions.com",
				address: "321 Corporate Blvd, Business Park",
				type: "commercial",
			},
			description: "AC unit repair and cooling system optimization",
			status: "draft",
			priority: "high",
			serviceType: "HVAC",
			totalAmount: 1850,
			validUntil: "2024-02-10T23:59:59",
			createdAt: "2024-01-22T11:00:00",
			updatedAt: "2024-01-22T11:00:00",
			sentAt: null,
			viewedAt: null,
			tags: ["Repair", "Commercial"],
			followUpDate: "2024-01-24T10:00:00",
			conversionProbability: 60,
			lineItems: [
				{ description: "AC Repair", quantity: 1, rate: 800, amount: 800 },
				{ description: "Parts & Materials", quantity: 1, rate: 650, amount: 650 },
				{ description: "Labor", quantity: 4, rate: 100, amount: 400 },
			],
		},
		{
			id: "EST005",
			number: "EST-2024-005",
			title: "Smart Thermostat Installation",
			customer: {
				id: "CUST005",
				name: "Green Building Corp",
				phone: "(555) 654-3210",
				email: "projects@greenbuilding.com",
				address: "654 Eco Way, Eco District",
				type: "commercial",
			},
			description: "Smart thermostat installation with energy monitoring",
			status: "expired",
			priority: "normal",
			serviceType: "HVAC",
			totalAmount: 1200,
			validUntil: "2024-01-15T23:59:59",
			createdAt: "2024-01-10T09:00:00",
			updatedAt: "2024-01-10T09:00:00",
			sentAt: "2024-01-10T11:30:00",
			viewedAt: "2024-01-12T15:20:00",
			tags: ["Smart Home", "Energy"],
			followUpDate: "2024-01-25T10:00:00",
			conversionProbability: 40,
			lineItems: [
				{ description: "Smart Thermostat", quantity: 3, rate: 300, amount: 900 },
				{ description: "Installation", quantity: 3, rate: 100, amount: 300 },
			],
		},
	];

	useEffect(() => {
		setEstimates(mockEstimates);
	}, []);

	// Filter and sort estimates
	const processedEstimates = useMemo(() => {
		let filtered = [...estimates];

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((estimate) => estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.description.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.number.toLowerCase().includes(searchTerm.toLowerCase()));
		}

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((estimate) => estimate.status === statusFilter);
		}

		// Apply priority filter
		if (priorityFilter !== "all") {
			filtered = filtered.filter((estimate) => estimate.priority === priorityFilter);
		}

		// Apply date filter
		if (dateFilter !== "all") {
			const today = new Date();
			const estimateDate = (estimate) => parseISO(estimate.createdAt);

			switch (dateFilter) {
				case "today":
					filtered = filtered.filter((estimate) => isToday(estimateDate(estimate)));
					break;
				case "this_week":
					filtered = filtered.filter((estimate) => {
						const diff = differenceInDays(today, estimateDate(estimate));
						return diff >= 0 && diff <= 7;
					});
					break;
				case "this_month":
					filtered = filtered.filter((estimate) => {
						const diff = differenceInDays(today, estimateDate(estimate));
						return diff >= 0 && diff <= 30;
					});
					break;
				case "expiring_soon":
					filtered = filtered.filter((estimate) => {
						const validUntil = parseISO(estimate.validUntil);
						const diff = differenceInDays(validUntil, today);
						return diff >= 0 && diff <= 7;
					});
					break;
			}
		}

		// Apply tab filter
		switch (currentTab) {
			case "pending":
				filtered = filtered.filter((estimate) => estimate.status === "pending");
				break;
			case "approved":
				filtered = filtered.filter((estimate) => estimate.status === "approved");
				break;
			case "needs_followup":
				filtered = filtered.filter((estimate) => {
					const followUpDate = estimate.followUpDate ? parseISO(estimate.followUpDate) : null;
					return followUpDate && followUpDate <= new Date() && !["approved", "rejected"].includes(estimate.status);
				});
				break;
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "validUntil") {
				aValue = new Date(aValue);
				bValue = new Date(bValue);
			}

			if (sortBy === "totalAmount") {
				aValue = aValue || 0;
				bValue = bValue || 0;
			}

			if (sortBy === "customer.name") {
				aValue = a.customer.name;
				bValue = b.customer.name;
			}

			if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
			if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [estimates, searchTerm, statusFilter, priorityFilter, dateFilter, sortBy, sortOrder, currentTab]);

	useEffect(() => {
		setFilteredEstimates(processedEstimates);
	}, [processedEstimates]);

	// Helper functions
	const getStatusColor = (status) => {
		switch (status) {
			case "approved":
				return "bg-success/10 text-success dark:bg-success/20 dark:text-success/90";
			case "pending":
				return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/90";
			case "rejected":
				return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/90";
			case "draft":
				return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
			case "expired":
				return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "urgent":
				return "border-l-red-500 bg-red-50 dark:bg-destructive/10";
			case "high":
				return "border-l-orange-500 bg-orange-50 dark:bg-warning/10";
			case "normal":
				return "border-l-blue-500 bg-blue-50 dark:bg-primary/10";
			case "low":
				return "border-l-green-500 bg-green-50 dark:bg-success/10";
			default:
				return "border-l-muted-foreground bg-muted dark:bg-muted/10";
		}
	};

	const getServiceIcon = (serviceType) => {
		switch (serviceType) {
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

	const getValidityStatus = (validUntil) => {
		const today = new Date();
		const expiry = parseISO(validUntil);
		const daysLeft = differenceInDays(expiry, today);

		if (daysLeft < 0) return { text: "Expired", color: "text-destructive" };
		if (daysLeft === 0) return { text: "Expires today", color: "text-warning" };
		if (daysLeft <= 3) return { text: `${daysLeft} days left`, color: "text-warning" };
		if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: "text-warning" };
		return { text: `${daysLeft} days left`, color: "text-success" };
	};

	const getConversionColor = (probability) => {
		if (probability >= 80) return "text-success";
		if (probability >= 60) return "text-warning";
		if (probability >= 40) return "text-warning";
		return "text-destructive";
	};

	// Actions
	const handleSelectEstimate = (estimateId) => {
		setSelectedEstimates((prev) => (prev.includes(estimateId) ? prev.filter((id) => id !== estimateId) : [...prev, estimateId]));
	};

	const handleSelectAll = () => {
		setSelectedEstimates(selectedEstimates.length === filteredEstimates.length ? [] : filteredEstimates.map((estimate) => estimate.id));
	};

	const handleBulkAction = (action) => {
		console.log(`Bulk action: ${action} on estimates:`, selectedEstimates);
		setSelectedEstimates([]);
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	// Stats for tabs
	const estimateStats = useMemo(() => {
		const needsFollowUp = estimates.filter((estimate) => {
			const followUpDate = estimate.followUpDate ? parseISO(estimate.followUpDate) : null;
			return followUpDate && followUpDate <= new Date() && !["approved", "rejected"].includes(estimate.status);
		}).length;

		return {
			all: estimates.length,
			pending: estimates.filter((estimate) => estimate.status === "pending").length,
			approved: estimates.filter((estimate) => estimate.status === "approved").length,
			needs_followup: needsFollowUp,
		};
	}, [estimates]);

	const conversionRate = estimates.length > 0 ? Math.round((estimates.filter((e) => e.status === "approved").length / estimates.length) * 100) : 0;
	const totalValue = estimates.reduce((sum, estimate) => sum + estimate.totalAmount, 0);
	const approvedValue = estimates.filter((e) => e.status === "approved").reduce((sum, estimate) => sum + estimate.totalAmount, 0);

  return (
    <div className="space-y-6">
					{/* Header */}
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="space-y-1">
							<h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
							<p className="text-muted-foreground">Create, manage, and track all your project estimates</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
								<Filter className="mr-2 w-4 h-4" />
								Filters
							</Button>
							<Button variant="outline" size="sm">
								<Download className="mr-2 w-4 h-4" />
								Export
							</Button>
							<Button size="sm" onClick={() => router.push("/dashboard/business/estimates/create")}>
								<Plus className="mr-2 w-4 h-4" />
								New Estimate
							</Button>
						</div>
					</div>

					{/* Key Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Total Estimates</p>
										<p className="text-2xl font-bold">{estimateStats.all}</p>
									</div>
									<FileText className="w-8 h-8 text-primary" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Conversion Rate</p>
										<p className="text-2xl font-bold">{conversionRate}%</p>
									</div>
									<Target className="w-8 h-8 text-success" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Total Value</p>
										<p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
									</div>
									<DollarSign className="w-8 h-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Approved Value</p>
										<p className="text-2xl font-bold">${approvedValue.toLocaleString()}</p>
									</div>
									<CheckCircle className="w-8 h-8 text-success" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters */}
					{showFilters && (
						<Card>
							<CardContent className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input placeholder="Search estimates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
									</div>
									<Select value={statusFilter} onValueChange={setStatusFilter}>
										<SelectTrigger>
											<SelectValue placeholder="Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Status</SelectItem>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="approved">Approved</SelectItem>
											<SelectItem value="rejected">Rejected</SelectItem>
											<SelectItem value="expired">Expired</SelectItem>
										</SelectContent>
									</Select>
									<Select value={priorityFilter} onValueChange={setPriorityFilter}>
										<SelectTrigger>
											<SelectValue placeholder="Priority" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Priorities</SelectItem>
											<SelectItem value="urgent">Urgent</SelectItem>
											<SelectItem value="high">High</SelectItem>
											<SelectItem value="normal">Normal</SelectItem>
											<SelectItem value="low">Low</SelectItem>
										</SelectContent>
									</Select>
									<Select value={dateFilter} onValueChange={setDateFilter}>
										<SelectTrigger>
											<SelectValue placeholder="Date Range" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Dates</SelectItem>
											<SelectItem value="today">Today</SelectItem>
											<SelectItem value="this_week">This Week</SelectItem>
											<SelectItem value="this_month">This Month</SelectItem>
											<SelectItem value="expiring_soon">Expiring Soon</SelectItem>
										</SelectContent>
									</Select>
									<Button
										variant="outline"
										onClick={() => {
											setSearchTerm("");
											setStatusFilter("all");
											setPriorityFilter("all");
											setDateFilter("all");
										}}
									>
										Clear Filters
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Tabs and bulk actions */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
							<TabsList>
								<TabsTrigger value="all">All ({estimateStats.all})</TabsTrigger>
								<TabsTrigger value="pending">Pending ({estimateStats.pending})</TabsTrigger>
								<TabsTrigger value="approved">Approved ({estimateStats.approved})</TabsTrigger>
								<TabsTrigger value="needs_followup">Needs Follow-up ({estimateStats.needs_followup})</TabsTrigger>
							</TabsList>
						</Tabs>

						{selectedEstimates.length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">{selectedEstimates.length} selected</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											Bulk Actions
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => handleBulkAction("send")}>Send Estimates</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleBulkAction("update_status")}>Update Status</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleBulkAction("export")}>Export Selected</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
											Delete Selected
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>

					{/* Estimates List */}
					<Card>
						<CardContent className="p-0">
							{/* Table Header */}
							<div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
								<div className="flex items-center">
									<Checkbox checked={selectedEstimates.length === filteredEstimates.length && filteredEstimates.length > 0} onCheckedChange={handleSelectAll} />
								</div>
								<div className="col-span-3">
									<Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort("title")}>
										Estimate Details
										{sortBy === "title" && (sortOrder === "asc" ? <SortAsc className="ml-1 w-4 h-4" /> : <SortDesc className="ml-1 w-4 h-4" />)}
									</Button>
								</div>
								<div className="col-span-2">
									<Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort("customer.name")}>
										Customer
										{sortBy === "customer.name" && (sortOrder === "asc" ? <SortAsc className="ml-1 w-4 h-4" /> : <SortDesc className="ml-1 w-4 h-4" />)}
									</Button>
								</div>
								<div>Status</div>
								<div>
									<Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort("totalAmount")}>
										Amount
										{sortBy === "totalAmount" && (sortOrder === "asc" ? <SortAsc className="ml-1 w-4 h-4" /> : <SortDesc className="ml-1 w-4 h-4" />)}
									</Button>
								</div>
								<div>Validity</div>
								<div>Conversion</div>
								<div>Actions</div>
							</div>

							{/* Estimates */}
							{filteredEstimates.length > 0 ? (
								<div className="divide-y">
									{filteredEstimates.map((estimate) => {
										const validityStatus = getValidityStatus(estimate.validUntil);
										return (
											<div key={estimate.id} className={`grid grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors border-l-4 ${getPriorityColor(estimate.priority)}`}>
												<div className="flex items-center">
													<Checkbox checked={selectedEstimates.includes(estimate.id)} onCheckedChange={() => handleSelectEstimate(estimate.id)} />
												</div>
												<div className="col-span-3">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															{getServiceIcon(estimate.serviceType)}
															<h4 className="font-medium text-sm">{estimate.title}</h4>
														</div>
														<p className="text-xs text-muted-foreground">{estimate.number}</p>
														<p className="text-xs text-muted-foreground line-clamp-1">{estimate.description}</p>
														<div className="flex flex-wrap gap-1">
															{estimate.tags.map((tag) => (
																<Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
																	{tag}
																</Badge>
															))}
														</div>
													</div>
												</div>
												<div className="col-span-2">
													<div className="space-y-1">
														<p className="font-medium text-sm">{estimate.customer.name}</p>
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															<Phone className="w-3 h-3" />
															{estimate.customer.phone}
														</div>
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															<MapPin className="w-3 h-3" />
															{estimate.customer.address.split(",")[0]}
														</div>
													</div>
												</div>
												<div>
													<Badge className={getStatusColor(estimate.status)} variant="secondary">
														{estimate.status}
													</Badge>
													{estimate.status === "pending" && estimate.viewedAt && <p className="text-xs text-muted-foreground mt-1">Viewed {format(parseISO(estimate.viewedAt), "MMM d")}</p>}
												</div>
												<div>
													<div className="space-y-1">
														<div className="flex items-center gap-1 text-sm">
															<DollarSign className="w-3 h-3" />
															<span className="font-medium">${estimate.totalAmount.toLocaleString()}</span>
														</div>
														<p className="text-xs text-muted-foreground">{estimate.lineItems.length} items</p>
													</div>
												</div>
												<div>
													<p className={`text-sm font-medium ${validityStatus.color}`}>{validityStatus.text}</p>
													<p className="text-xs text-muted-foreground">Expires {format(parseISO(estimate.validUntil), "MMM d")}</p>
												</div>
												<div>
													<div className="space-y-1">
														<div className="flex items-center gap-1">
															<Star className={`w-3 h-3 ${getConversionColor(estimate.conversionProbability)}`} />
															<span className={`text-sm font-medium ${getConversionColor(estimate.conversionProbability)}`}>{estimate.conversionProbability}%</span>
														</div>
														<div className="w-full bg-muted rounded-full h-1.5">
															<div className="bg-primary h-1.5 rounded-full" style={{ width: `${estimate.conversionProbability}%` }}></div>
														</div>
													</div>
												</div>
												<div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreVertical className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem>
																<Eye className="mr-2 w-4 h-4" />
																View Estimate
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Edit className="mr-2 w-4 h-4" />
																Edit Estimate
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Copy className="mr-2 w-4 h-4" />
																Duplicate
															</DropdownMenuItem>
															{estimate.status === "draft" && (
																<DropdownMenuItem>
																	<Send className="mr-2 w-4 h-4" />
																	Send to Customer
																</DropdownMenuItem>
															)}
															{estimate.status === "approved" && (
																<DropdownMenuItem>
																	<Calendar className="mr-2 w-4 h-4" />
																	Convert to Job
																</DropdownMenuItem>
															)}
															<DropdownMenuItem>
																<Download className="mr-2 w-4 h-4" />
																Download PDF
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="text-destructive">
																<Trash2 className="mr-2 w-4 h-4" />
																Delete Estimate
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-12">
									<FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-medium mb-2">No estimates found</h3>
									<p className="text-muted-foreground mb-4">No estimates match your current filters. Try adjusting your search criteria.</p>
									<Button onClick={() => router.push("/dashboard/business/estimates/create")}>
										<Plus className="mr-2 w-4 h-4" />
										Create New Estimate
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
    </div>
	);
}
