"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Search, Plus, MoreHorizontal, Eye, Edit3, Phone, Mail, MapPin, Building, User, Calendar, DollarSign, FileText, Star, TrendingUp, Users, Download, MessageSquare, History, Award } from "lucide-react";
import { format, parseISO } from "date-fns";

// Mock customer data
const mockCustomers = [
	{
		id: "CUST001",
		name: "TechCorp Inc.",
		type: "commercial",
		email: "billing@techcorp.com",
		phone: "(555) 111-2222",
		address: "123 Business Ave, Downtown, CA 90210",
		contactPerson: "Jane Smith",
		status: "active",
		createdDate: "2023-06-15T00:00:00Z",
		lastService: "2024-01-15T00:00:00Z",
		totalJobs: 8,
		totalRevenue: 12450.0,
		avgJobValue: 1556.25,
		rating: 4.8,
		tags: ["VIP", "Contract", "High-Value"],
		paymentTerms: "net_30",
		creditLimit: 50000,
		notes: "Preferred customer with maintenance contract. Quick payments.",
		billingAddress: "123 Business Ave, Downtown, CA 90210",
		serviceHistory: {
			completedJobs: 8,
			pendingJobs: 1,
			lastJobDate: "2024-01-15T00:00:00Z",
			preferredTechnician: "Mike Johnson",
		},
	},
	{
		id: "CUST002",
		name: "Sarah Miller",
		type: "residential",
		email: "sarah.miller@email.com",
		phone: "(555) 222-3333",
		address: "456 Oak Street, Residential, CA 90211",
		contactPerson: "Sarah Miller",
		status: "active",
		createdDate: "2023-08-22T00:00:00Z",
		lastService: "2024-01-18T00:00:00Z",
		totalJobs: 3,
		totalRevenue: 825.5,
		avgJobValue: 275.17,
		rating: 5.0,
		tags: ["Loyal", "Referral Source"],
		paymentTerms: "immediate",
		creditLimit: 0,
		notes: "Always pays immediately. Referred 2 new customers.",
		billingAddress: "456 Oak Street, Residential, CA 90211",
		serviceHistory: {
			completedJobs: 3,
			pendingJobs: 0,
			lastJobDate: "2024-01-18T00:00:00Z",
			preferredTechnician: "Sarah Wilson",
		},
	},
	{
		id: "CUST003",
		name: "Metro Restaurant",
		type: "commercial",
		email: "manager@metrorestaurant.com",
		phone: "(555) 333-4444",
		address: "789 Main Street, Commercial, CA 90212",
		contactPerson: "Mike Rodriguez",
		status: "active",
		createdDate: "2023-09-10T00:00:00Z",
		lastService: "2024-01-20T00:00:00Z",
		totalJobs: 5,
		totalRevenue: 2100.0,
		avgJobValue: 420.0,
		rating: 4.2,
		tags: ["Commercial", "Emergency"],
		paymentTerms: "net_15",
		creditLimit: 10000,
		notes: "Restaurant chain. Often needs emergency services during peak hours.",
		billingAddress: "789 Main Street, Commercial, CA 90212",
		serviceHistory: {
			completedJobs: 4,
			pendingJobs: 1,
			lastJobDate: "2024-01-20T00:00:00Z",
			preferredTechnician: "David Chen",
		},
	},
	{
		id: "CUST004",
		name: "Green Valley Apartments",
		type: "commercial",
		email: "maintenance@greenvalley.com",
		phone: "(555) 444-5555",
		address: "321 Valley Drive, Residential Complex, CA 90213",
		contactPerson: "Linda Thompson",
		status: "active",
		createdDate: "2023-11-05T00:00:00Z",
		lastService: "2024-01-12T00:00:00Z",
		totalJobs: 12,
		totalRevenue: 4200.0,
		avgJobValue: 350.0,
		rating: 4.5,
		tags: ["Property Management", "Bulk"],
		paymentTerms: "net_30",
		creditLimit: 25000,
		notes: "Property management company. Multiple units require regular maintenance.",
		billingAddress: "321 Valley Drive, Residential Complex, CA 90213",
		serviceHistory: {
			completedJobs: 11,
			pendingJobs: 1,
			lastJobDate: "2024-01-12T00:00:00Z",
			preferredTechnician: "Mike Johnson",
		},
	},
	{
		id: "CUST005",
		name: "Robert Chen",
		type: "residential",
		email: "robert.chen@email.com",
		phone: "(555) 555-6666",
		address: "654 Pine Street, Residential, CA 90214",
		contactPerson: "Robert Chen",
		status: "inactive",
		createdDate: "2023-05-18T00:00:00Z",
		lastService: "2023-12-05T00:00:00Z",
		totalJobs: 2,
		totalRevenue: 450.0,
		avgJobValue: 225.0,
		rating: 3.5,
		tags: ["Inactive"],
		paymentTerms: "immediate",
		creditLimit: 0,
		notes: "Hasn't requested service in over a month. Consider follow-up.",
		billingAddress: "654 Pine Street, Residential, CA 90214",
		serviceHistory: {
			completedJobs: 2,
			pendingJobs: 0,
			lastJobDate: "2023-12-05T00:00:00Z",
			preferredTechnician: null,
		},
	},
];

// Summary statistics
const customerStats = {
	total: mockCustomers.length,
	active: mockCustomers.filter((c) => c.status === "active").length,
	commercial: mockCustomers.filter((c) => c.type === "commercial").length,
	residential: mockCustomers.filter((c) => c.type === "residential").length,
	totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalRevenue, 0),
	avgRating: mockCustomers.reduce((sum, c) => sum + c.rating, 0) / mockCustomers.length,
	vipCustomers: mockCustomers.filter((c) => c.tags.includes("VIP")).length,
};

export default function CustomersList() {
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedCustomers, setSelectedCustomers] = useState([]);
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");
	const [activeTab, setActiveTab] = useState("all");

	// Filter customers
	const filteredCustomers = mockCustomers.filter((customer) => {
		const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.email.toLowerCase().includes(searchQuery.toLowerCase()) || customer.phone.includes(searchQuery) || customer.address.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesType = typeFilter === "all" || customer.type === typeFilter;
		const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
		const matchesTab = activeTab === "all" || (activeTab === "vip" && customer.tags.includes("VIP")) || (activeTab === "recent" && new Date(customer.lastService) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

		return matchesSearch && matchesType && matchesStatus && matchesTab;
	});

	// Sort customers
	const sortedCustomers = [...filteredCustomers].sort((a, b) => {
		let aValue = a[sortBy];
		let bValue = b[sortBy];

		if (typeof aValue === "string") {
			aValue = aValue.toLowerCase();
			bValue = bValue.toLowerCase();
		}

		if (sortOrder === "asc") {
			return aValue > bValue ? 1 : -1;
		} else {
			return aValue < bValue ? 1 : -1;
		}
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-success";
			case "inactive":
				return "bg-muted-foreground";
			case "prospect":
				return "bg-primary";
			default:
				return "bg-muted-foreground";
		}
	};

	const getCustomerTypeIcon = (type) => {
		return type === "commercial" ? <Building className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-success" />;
	};

	const renderStarRating = (rating) => {
		return (
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star key={star} className={`w-3 h-3 ${star <= rating ? "fill-yellow-400 text-warning" : "text-muted-foreground/30"}`} />
				))}
				<span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
			</div>
		);
	};

	const handleBulkAction = (action) => {
		console.log(`Performing ${action} on customers:`, selectedCustomers);
		setSelectedCustomers([]);
	};

	const toggleCustomerSelection = (customerId) => {
		setSelectedCustomers((prev) => (prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]));
	};

	const selectAllCustomers = () => {
		if (selectedCustomers.length === sortedCustomers.length) {
			setSelectedCustomers([]);
		} else {
			setSelectedCustomers(sortedCustomers.map((c) => c.id));
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Customers</h1>
					<p className="text-muted-foreground">Manage your customer relationships and service history</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Export
					</Button>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Add Customer
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Customers</p>
								<p className="text-2xl font-bold">{customerStats.total}</p>
								<p className="text-xs text-muted-foreground">{customerStats.active} active</p>
							</div>
							<Users className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Revenue</p>
								<p className="text-2xl font-bold">${customerStats.totalRevenue.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">All-time customer value</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Rating</p>
								<p className="text-2xl font-bold">{customerStats.avgRating.toFixed(1)}</p>
								<div className="flex items-center gap-1 mt-1">
									<Star className="w-3 h-3 fill-yellow-400 text-warning" />
									<span className="text-xs text-muted-foreground">Customer satisfaction</span>
								</div>
							</div>
							<Award className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">VIP Customers</p>
								<p className="text-2xl font-bold">{customerStats.vipCustomers}</p>
								<p className="text-xs text-muted-foreground">High-value accounts</p>
							</div>
							<Star className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">All Customers</TabsTrigger>
					<TabsTrigger value="vip">VIP Customers</TabsTrigger>
					<TabsTrigger value="recent">Recent Activity</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="space-y-6">
					{/* Filters and Search */}
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
						<div className="flex flex-1 gap-4 items-center max-w-2xl">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input placeholder="Search customers, email, phone, or address..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
							</div>

							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="commercial">Commercial</SelectItem>
									<SelectItem value="residential">Residential</SelectItem>
								</SelectContent>
							</Select>

							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="prospect">Prospect</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{selectedCustomers.length > 0 && (
							<div className="flex gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											Bulk Actions ({selectedCustomers.length})
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => handleBulkAction("email")}>
											<Mail className="w-4 h-4 mr-2" />
											Send Email
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleBulkAction("tag")}>
											<Award className="w-4 h-4 mr-2" />
											Add Tag
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleBulkAction("export")}>
											<Download className="w-4 h-4 mr-2" />
											Export Selected
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>

					{/* Customers Table */}
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>Customer List</CardTitle>
									<CardDescription>
										{sortedCustomers.length} of {mockCustomers.length} customers
									</CardDescription>
								</div>
								<div className="flex gap-2">
									<Select value={sortBy} onValueChange={setSortBy}>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">Name</SelectItem>
											<SelectItem value="totalRevenue">Revenue</SelectItem>
											<SelectItem value="totalJobs">Jobs</SelectItem>
											<SelectItem value="rating">Rating</SelectItem>
											<SelectItem value="lastService">Last Service</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
										{sortOrder === "asc" ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
									</Button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b bg-muted/50">
										<tr className="text-left">
											<th className="p-4">
												<input type="checkbox" checked={selectedCustomers.length === sortedCustomers.length && sortedCustomers.length > 0} onChange={selectAllCustomers} className="rounded border-border" />
											</th>
											<th className="p-4 font-medium">Customer</th>
											<th className="p-4 font-medium">Contact</th>
											<th className="p-4 font-medium">Jobs</th>
											<th className="p-4 font-medium">Revenue</th>
											<th className="p-4 font-medium">Rating</th>
											<th className="p-4 font-medium">Last Service</th>
											<th className="p-4 font-medium">Status</th>
											<th className="p-4 font-medium">Actions</th>
										</tr>
									</thead>
									<tbody>
										{sortedCustomers.map((customer) => (
											<tr key={customer.id} className="border-b hover:bg-muted/50">
												<td className="p-4">
													<input type="checkbox" checked={selectedCustomers.includes(customer.id)} onChange={() => toggleCustomerSelection(customer.id)} className="rounded border-border" />
												</td>

												<td className="p-4">
													<div className="flex items-start gap-3">
														{getCustomerTypeIcon(customer.type)}
														<div>
															<div className="flex items-center gap-2">
																<p className="font-medium">{customer.name}</p>
																{customer.tags.includes("VIP") && <Star className="w-4 h-4 fill-yellow-400 text-warning" />}
															</div>
															<p className="text-sm text-muted-foreground">{customer.contactPerson}</p>
															<div className="flex gap-1 mt-1">
																{customer.tags.slice(0, 2).map((tag) => (
																	<Badge key={tag} variant="outline" className="text-xs">
																		{tag}
																	</Badge>
																))}
																{customer.tags.length > 2 && (
																	<Badge variant="outline" className="text-xs">
																		+{customer.tags.length - 2}
																	</Badge>
																)}
															</div>
														</div>
													</div>
												</td>

												<td className="p-4">
													<div className="space-y-1 text-sm">
														<div className="flex items-center gap-2">
															<Phone className="w-3 h-3 text-muted-foreground" />
															<span>{customer.phone}</span>
														</div>
														<div className="flex items-center gap-2">
															<Mail className="w-3 h-3 text-muted-foreground" />
															<span className="truncate max-w-[200px]">{customer.email}</span>
														</div>
														<div className="flex items-center gap-2">
															<MapPin className="w-3 h-3 text-muted-foreground" />
															<span className="truncate max-w-[200px]">{customer.address.split(",")[0]}</span>
														</div>
													</div>
												</td>

												<td className="p-4">
													<div className="text-center">
														<p className="font-medium">{customer.totalJobs}</p>
														<p className="text-xs text-muted-foreground">${customer.avgJobValue.toLocaleString()} avg</p>
													</div>
												</td>

												<td className="p-4">
													<p className="font-medium">${customer.totalRevenue.toLocaleString()}</p>
												</td>

												<td className="p-4">{renderStarRating(customer.rating)}</td>

												<td className="p-4">
													<p className="text-sm">{format(parseISO(customer.lastService), "MMM d, yyyy")}</p>
												</td>

												<td className="p-4">
													<Badge className={getStatusColor(customer.status)} variant="secondary">
														{customer.status}
													</Badge>
												</td>

												<td className="p-4">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuSeparator />
															<DropdownMenuItem>
																<Eye className="w-4 h-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Edit3 className="w-4 h-4 mr-2" />
																Edit Customer
															</DropdownMenuItem>
															<DropdownMenuItem>
																<History className="w-4 h-4 mr-2" />
																Service History
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem>
																<Phone className="w-4 h-4 mr-2" />
																Call Customer
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Mail className="w-4 h-4 mr-2" />
																Send Email
															</DropdownMenuItem>
															<DropdownMenuItem>
																<MessageSquare className="w-4 h-4 mr-2" />
																Send Message
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem>
																<FileText className="w-4 h-4 mr-2" />
																Create Estimate
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Calendar className="w-4 h-4 mr-2" />
																Schedule Service
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{sortedCustomers.length === 0 && (
								<div className="text-center py-12">
									<Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
									<p className="text-muted-foreground mb-4">{searchQuery || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search criteria" : "Get started by adding your first customer"}</p>
									{!searchQuery && typeFilter === "all" && statusFilter === "all" && (
										<Button>
											<Plus className="w-4 h-4 mr-2" />
											Add First Customer
										</Button>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
