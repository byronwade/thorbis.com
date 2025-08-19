"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Progress } from "@components/ui/progress";
import { Separator } from "@components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Calendar, DollarSign, Users, TrendingUp, AlertTriangle, CheckCircle, MoreVertical, Eye, Edit, Pause, Play, RefreshCw, CreditCard, Mail, Phone, MapPin, Search, Download, Plus, Calendar as CalendarIcon, User } from "lucide-react";

// Mock data for service plan subscriptions
const mockSubscriptions = [
	{
		id: "SUB001",
		planName: "HVAC Maintenance - Gold",
		planId: "TPL001",
		customer: {
			id: "CUST001",
			name: "John Smith",
			email: "john.smith@email.com",
			phone: "(555) 123-4567",
			address: "123 Oak Street, Springfield, IL 62701",
			type: "residential",
		},
		status: "active",
		startDate: "2024-01-15",
		endDate: "2025-01-14",
		nextService: "2024-02-15",
		nextBilling: "2025-01-15",
		price: 299,
		billingCycle: "annual",
		servicesCompleted: 3,
		totalServices: 8,
		revenue: 299,
		lastPayment: "2024-01-15",
		paymentMethod: "Credit Card (*4567)",
		notes: "Customer prefers morning appointments",
		tags: ["priority", "loyal"],
		completion: 37.5,
		upcomingServices: [
			{ name: "Filter Replacement", date: "2024-02-15", duration: 30 },
			{ name: "System Inspection", date: "2024-07-15", duration: 120 },
		],
		serviceHistory: [
			{ name: "Bi-annual System Inspection", date: "2024-01-20", status: "completed", technician: "Mike Johnson" },
			{ name: "Filter Replacement", date: "2024-01-25", status: "completed", technician: "Sarah Davis" },
			{ name: "Coil Cleaning", date: "2024-01-30", status: "completed", technician: "Mike Johnson" },
		],
	},
	{
		id: "SUB002",
		planName: "Plumbing Protection Plus",
		planId: "TPL002",
		customer: {
			id: "CUST002",
			name: "TechCorp Inc.",
			email: "facilities@techcorp.com",
			phone: "(555) 987-6543",
			address: "456 Business Ave, Downtown, CA 90210",
			type: "commercial",
		},
		status: "active",
		startDate: "2024-01-10",
		endDate: "2025-01-09",
		nextService: "2024-03-10",
		nextBilling: "2025-01-10",
		price: 199,
		billingCycle: "annual",
		servicesCompleted: 2,
		totalServices: 4,
		revenue: 199,
		lastPayment: "2024-01-10",
		paymentMethod: "ACH Transfer",
		notes: "Access requires 24hr notice",
		tags: ["commercial", "contract"],
		completion: 50,
		upcomingServices: [
			{ name: "Drain Cleaning Service", date: "2024-03-10", duration: 60 },
			{ name: "Annual Plumbing Inspection", date: "2024-07-10", duration: 90 },
		],
		serviceHistory: [
			{ name: "Annual Plumbing Inspection", date: "2024-01-15", status: "completed", technician: "David Chen" },
			{ name: "Water Heater Maintenance", date: "2024-01-20", status: "completed", technician: "David Chen" },
		],
	},
	{
		id: "SUB003",
		planName: "Multi-Service Deluxe",
		planId: "TPL004",
		customer: {
			id: "CUST003",
			name: "Sarah Miller",
			email: "sarah.miller@email.com",
			phone: "(555) 456-7890",
			address: "789 Pine Avenue, Residential, TX 75201",
			type: "residential",
		},
		status: "paused",
		startDate: "2023-11-20",
		endDate: "2024-11-19",
		nextService: "2024-03-01",
		nextBilling: "2024-02-20",
		price: 599,
		billingCycle: "annual",
		servicesCompleted: 6,
		totalServices: 12,
		revenue: 599,
		lastPayment: "2023-11-20",
		paymentMethod: "Credit Card (*9876)",
		notes: "Paused due to home renovation",
		tags: ["paused", "premium"],
		completion: 50,
		upcomingServices: [],
		serviceHistory: [
			{ name: "Comprehensive System Inspection", date: "2023-12-01", status: "completed", technician: "Mike Johnson" },
			{ name: "Filter Replacement", date: "2023-12-15", status: "completed", technician: "Sarah Davis" },
			{ name: "Preventive Maintenance", date: "2024-01-01", status: "completed", technician: "Mike Johnson" },
		],
	},
	{
		id: "SUB004",
		planName: "Electrical Safety Basic",
		planId: "TPL003",
		customer: {
			id: "CUST004",
			name: "Green Valley Apartments",
			email: "maintenance@greenvalley.com",
			phone: "(555) 321-0987",
			address: "321 Valley Road, Residential Complex, FL 33101",
			type: "commercial",
		},
		status: "expired",
		startDate: "2023-01-15",
		endDate: "2024-01-14",
		nextService: null,
		nextBilling: null,
		price: 149,
		billingCycle: "annual",
		servicesCompleted: 4,
		totalServices: 4,
		revenue: 149,
		lastPayment: "2023-01-15",
		paymentMethod: "Check",
		notes: "Contract expired, awaiting renewal",
		tags: ["expired", "renewal-opportunity"],
		completion: 100,
		upcomingServices: [],
		serviceHistory: [
			{ name: "Electrical Safety Inspection", date: "2023-02-01", status: "completed", technician: "Robert Wilson" },
			{ name: "Panel Maintenance", date: "2023-06-15", status: "completed", technician: "Robert Wilson" },
			{ name: "GFCI Testing", date: "2023-09-01", status: "completed", technician: "Robert Wilson" },
			{ name: "Basic Outlet Services", date: "2023-12-01", status: "completed", technician: "Robert Wilson" },
		],
	},
	{
		id: "SUB005",
		planName: "HVAC Maintenance - Gold",
		planId: "TPL001",
		customer: {
			id: "CUST005",
			name: "Michael Brown",
			email: "m.brown@email.com",
			phone: "(555) 654-3210",
			address: "987 Elm Street, Suburban, NY 10001",
			type: "residential",
		},
		status: "cancelled",
		startDate: "2023-08-01",
		endDate: "2024-07-31",
		nextService: null,
		nextBilling: null,
		price: 299,
		billingCycle: "annual",
		servicesCompleted: 2,
		totalServices: 8,
		revenue: 299,
		lastPayment: "2023-08-01",
		paymentMethod: "Credit Card (*1234)",
		notes: "Cancelled due to property sale",
		tags: ["cancelled", "moved"],
		completion: 25,
		upcomingServices: [],
		serviceHistory: [
			{ name: "Bi-annual System Inspection", date: "2023-08-15", status: "completed", technician: "Mike Johnson" },
			{ name: "Filter Replacement", date: "2023-11-01", status: "completed", technician: "Sarah Davis" },
		],
	},
];

const statusColors = {
	active: "bg-success/10 text-success",
	paused: "bg-warning/10 text-warning",
	expired: "bg-destructive/10 text-destructive",
	cancelled: "bg-muted text-muted-foreground",
};

const customerTypeColors = {
	residential: "bg-primary/10 text-primary",
	commercial: "bg-purple-100 text-purple-800",
};

export default function ServicePlanSubscriptions() {
	const router = useRouter();
	const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedCustomerType, setSelectedCustomerType] = useState("all");
	const [sortBy, setSortBy] = useState("nextService");
	const [sortOrder, setSortOrder] = useState("asc");
	const [selectedSubscription, setSelectedSubscription] = useState(null);
	const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState("");

	// Filter and sort subscriptions
	const filteredSubscriptions = subscriptions
		.filter((subscription) => {
			if (searchTerm && !subscription.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) && !subscription.planName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			if (selectedStatus !== "all" && subscription.status !== selectedStatus) return false;
			if (selectedCustomerType !== "all" && subscription.customer.type !== selectedCustomerType) return false;
			return true;
		})
		.sort((a, b) => {
			const direction = sortOrder === "asc" ? 1 : -1;
			switch (sortBy) {
				case "customer":
					return direction * a.customer.name.localeCompare(b.customer.name);
				case "plan":
					return direction * a.planName.localeCompare(b.planName);
				case "nextService":
					if (!a.nextService && !b.nextService) return 0;
					if (!a.nextService) return direction;
					if (!b.nextService) return -direction;
					return direction * (new Date(a.nextService) - new Date(b.nextService));
				case "revenue":
					return direction * (a.revenue - b.revenue);
				case "completion":
					return direction * (a.completion - b.completion);
				default:
					return 0;
			}
		});

	// Calculate summary stats
	const stats = {
		total: filteredSubscriptions.length,
		active: filteredSubscriptions.filter((s) => s.status === "active").length,
		paused: filteredSubscriptions.filter((s) => s.status === "paused").length,
		expired: filteredSubscriptions.filter((s) => s.status === "expired").length,
		totalRevenue: filteredSubscriptions.reduce((sum, s) => sum + s.revenue, 0),
		avgCompletion: filteredSubscriptions.length > 0 ? filteredSubscriptions.reduce((sum, s) => sum + s.completion, 0) / filteredSubscriptions.length : 0,
	};

	const handleAction = (subscription, action) => {
		setSelectedSubscription(subscription);
		setActionType(action);
		setActionDialogOpen(true);
	};

	const executeAction = () => {
		// In a real app, this would make API calls
		switch (actionType) {
			case "pause":
				setSubscriptions(subscriptions.map((s) => (s.id === selectedSubscription.id ? { ...s, status: "paused" } : s)));
				break;
			case "resume":
				setSubscriptions(subscriptions.map((s) => (s.id === selectedSubscription.id ? { ...s, status: "active" } : s)));
				break;
			case "cancel":
				setSubscriptions(subscriptions.map((s) => (s.id === selectedSubscription.id ? { ...s, status: "cancelled" } : s)));
				break;
			case "renew":
				// Handle renewal logic
				break;
		}
		setActionDialogOpen(false);
		setSelectedSubscription(null);
	};

	const getUpcomingServices = () => {
		const upcoming = [];
		subscriptions.forEach((subscription) => {
			if (subscription.status === "active" && subscription.upcomingServices) {
				subscription.upcomingServices.forEach((service) => {
					upcoming.push({
						...service,
						subscription: subscription.id,
						customer: subscription.customer.name,
						plan: subscription.planName,
					});
				});
			}
		});
		return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
	};

	const getExpiringPlans = () => {
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

		return subscriptions
			.filter((s) => s.status === "active" && new Date(s.endDate) <= thirtyDaysFromNow)
			.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
			.slice(0, 5);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Service Plan Subscriptions</h1>
					<p className="text-muted-foreground">Manage active customer service plans and subscriptions</p>
				</div>
				<Button onClick={() => router.push("/dashboard/business/service-plans/templates")}>
					<Plus className="w-4 h-4 mr-2" />
					New Subscription
				</Button>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Plans</p>
								<p className="text-2xl font-bold">{stats.total}</p>
							</div>
							<Users className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Active</p>
								<p className="text-2xl font-bold text-success">{stats.active}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Paused</p>
								<p className="text-2xl font-bold text-warning">{stats.paused}</p>
							</div>
							<Pause className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Revenue</p>
								<p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Completion</p>
								<p className="text-2xl font-bold">{stats.avgCompletion.toFixed(0)}%</p>
							</div>
							<TrendingUp className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Quick Insights Sidebar */}
				<div className="lg:col-span-1 space-y-4">
					{/* Upcoming Services */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Upcoming Services</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{getUpcomingServices().map((service, index) => (
								<div key={index} className="p-3 border rounded-lg">
									<div className="flex justify-between items-start mb-2">
										<h4 className="font-medium text-sm">{service.name}</h4>
										<Badge variant="outline" className="text-xs">
											{service.duration}min
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">{service.customer}</p>
									<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
										<CalendarIcon className="w-3 h-3" />
										{new Date(service.date).toLocaleDateString()}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Expiring Plans */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Expiring Soon</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{getExpiringPlans().map((plan, index) => (
								<div key={index} className="p-3 border border-orange-200 rounded-lg bg-orange-50">
									<div className="flex items-start justify-between mb-2">
										<h4 className="font-medium text-sm">{plan.customer.name}</h4>
										<AlertTriangle className="w-4 h-4 text-warning" />
									</div>
									<p className="text-xs text-muted-foreground">{plan.planName}</p>
									<div className="flex items-center gap-1 text-xs text-warning mt-1">
										<CalendarIcon className="w-3 h-3" />
										Expires {new Date(plan.endDate).toLocaleDateString()}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3">
					{/* Filters */}
					<Card className="mb-6">
						<CardContent className="p-4">
							<div className="flex flex-wrap gap-4 items-center">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input placeholder="Search customers or plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
									</div>
								</div>

								<Select value={selectedStatus} onValueChange={setSelectedStatus}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="paused">Paused</SelectItem>
										<SelectItem value="expired">Expired</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>

								<Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Customer Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value="residential">Residential</SelectItem>
										<SelectItem value="commercial">Commercial</SelectItem>
									</SelectContent>
								</Select>

								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="nextService">Next Service</SelectItem>
										<SelectItem value="customer">Customer</SelectItem>
										<SelectItem value="plan">Plan Name</SelectItem>
										<SelectItem value="revenue">Revenue</SelectItem>
										<SelectItem value="completion">Completion</SelectItem>
									</SelectContent>
								</Select>

								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Export
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Subscriptions List */}
					<div className="space-y-4">
						{filteredSubscriptions.map((subscription) => (
							<Card key={subscription.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold">{subscription.customer.name}</h3>
												<Badge className={statusColors[subscription.status]}>{subscription.status}</Badge>
												<Badge className={customerTypeColors[subscription.customer.type]}>{subscription.customer.type}</Badge>
												{subscription.tags.map((tag, index) => (
													<Badge key={index} variant="outline" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
											<p className="text-sm text-muted-foreground mb-1">{subscription.planName}</p>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<MapPin className="w-3 h-3" />
													{subscription.customer.address}
												</span>
												<span className="flex items-center gap-1">
													<Phone className="w-3 h-3" />
													{subscription.customer.phone}
												</span>
											</div>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => setSelectedSubscription(subscription)}>
													<Eye className="w-4 h-4 mr-2" />
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Edit className="w-4 h-4 mr-2" />
													Edit Plan
												</DropdownMenuItem>
												{subscription.status === "active" && (
													<DropdownMenuItem onClick={() => handleAction(subscription, "pause")}>
														<Pause className="w-4 h-4 mr-2" />
														Pause Plan
													</DropdownMenuItem>
												)}
												{subscription.status === "paused" && (
													<DropdownMenuItem onClick={() => handleAction(subscription, "resume")}>
														<Play className="w-4 h-4 mr-2" />
														Resume Plan
													</DropdownMenuItem>
												)}
												{subscription.status === "expired" && (
													<DropdownMenuItem onClick={() => handleAction(subscription, "renew")}>
														<RefreshCw className="w-4 h-4 mr-2" />
														Renew Plan
													</DropdownMenuItem>
												)}
												<DropdownMenuItem onClick={() => handleAction(subscription, "cancel")} className="text-destructive">
													Cancel Plan
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
										<div>
											<span className="text-sm text-muted-foreground">Progress</span>
											<div className="flex items-center gap-2 mt-1">
												<Progress value={subscription.completion} className="flex-1" />
												<span className="text-sm font-medium">{subscription.completion}%</span>
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												{subscription.servicesCompleted} of {subscription.totalServices} services
											</p>
										</div>

										<div>
											<span className="text-sm text-muted-foreground">Revenue</span>
											<p className="text-lg font-semibold text-success">${subscription.revenue}</p>
											<p className="text-xs text-muted-foreground">{subscription.billingCycle} billing</p>
										</div>

										<div>
											<span className="text-sm text-muted-foreground">Next Service</span>
											<p className="text-sm font-medium">{subscription.nextService ? new Date(subscription.nextService).toLocaleDateString() : "Not scheduled"}</p>
											<p className="text-xs text-muted-foreground">{subscription.nextService ? (subscription.upcomingServices.length > 0 ? subscription.upcomingServices[0].name : "Service pending") : subscription.status === "active" ? "Scheduling required" : "Plan inactive"}</p>
										</div>

										<div>
											<span className="text-sm text-muted-foreground">Plan End Date</span>
											<p className="text-sm font-medium">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "No end date"}</p>
											<p className="text-xs text-muted-foreground">{subscription.paymentMethod}</p>
										</div>
									</div>

									{subscription.notes && (
										<div className="mt-3 p-3 bg-muted rounded-lg">
											<p className="text-sm">{subscription.notes}</p>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Subscription Details Dialog */}
			{selectedSubscription && (
				<Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								{selectedSubscription.customer.name} - {selectedSubscription.planName}
								<Badge className={statusColors[selectedSubscription.status]}>{selectedSubscription.status}</Badge>
							</DialogTitle>
							<DialogDescription>Subscription ID: {selectedSubscription.id}</DialogDescription>
						</DialogHeader>

						<Tabs defaultValue="overview" className="space-y-4">
							<TabsList>
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="services">Services</TabsTrigger>
								<TabsTrigger value="billing">Billing</TabsTrigger>
								<TabsTrigger value="history">History</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Customer Information</h4>
											<div className="space-y-2 text-sm">
												<div className="flex items-center gap-2">
													<User className="w-4 h-4 text-muted-foreground" />
													<span>{selectedSubscription.customer.name}</span>
													<Badge className={customerTypeColors[selectedSubscription.customer.type]}>{selectedSubscription.customer.type}</Badge>
												</div>
												<div className="flex items-center gap-2">
													<Mail className="w-4 h-4 text-muted-foreground" />
													<span>{selectedSubscription.customer.email}</span>
												</div>
												<div className="flex items-center gap-2">
													<Phone className="w-4 h-4 text-muted-foreground" />
													<span>{selectedSubscription.customer.phone}</span>
												</div>
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4 text-muted-foreground" />
													<span>{selectedSubscription.customer.address}</span>
												</div>
											</div>
										</div>

										<div>
											<h4 className="font-medium mb-2">Plan Progress</h4>
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-sm">Completion</span>
													<span className="text-sm font-medium">{selectedSubscription.completion}%</span>
												</div>
												<Progress value={selectedSubscription.completion} />
												<div className="text-sm text-muted-foreground">
													{selectedSubscription.servicesCompleted} of {selectedSubscription.totalServices} services completed
												</div>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Plan Details</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Start Date</span>
													<span>{new Date(selectedSubscription.startDate).toLocaleDateString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">End Date</span>
													<span>{new Date(selectedSubscription.endDate).toLocaleDateString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Next Service</span>
													<span>{selectedSubscription.nextService ? new Date(selectedSubscription.nextService).toLocaleDateString() : "Not scheduled"}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Next Billing</span>
													<span>{selectedSubscription.nextBilling ? new Date(selectedSubscription.nextBilling).toLocaleDateString() : "N/A"}</span>
												</div>
											</div>
										</div>

										<div>
											<h4 className="font-medium mb-2">Tags</h4>
											<div className="flex flex-wrap gap-2">
												{selectedSubscription.tags.map((tag, index) => (
													<Badge key={index} variant="outline">
														{tag}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</div>

								{selectedSubscription.notes && (
									<div>
										<h4 className="font-medium mb-2">Notes</h4>
										<div className="p-3 bg-muted rounded-lg">
											<p className="text-sm">{selectedSubscription.notes}</p>
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="services" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-medium mb-3">Upcoming Services</h4>
										{selectedSubscription.upcomingServices.length === 0 ? (
											<p className="text-sm text-muted-foreground">No upcoming services scheduled</p>
										) : (
											<div className="space-y-3">
												{selectedSubscription.upcomingServices.map((service, index) => (
													<div key={index} className="border rounded-lg p-3">
														<div className="flex justify-between items-start mb-2">
															<h5 className="font-medium">{service.name}</h5>
															<Badge variant="outline">{service.duration} min</Badge>
														</div>
														<div className="flex items-center gap-1 text-sm text-muted-foreground">
															<Calendar className="w-4 h-4" />
															{new Date(service.date).toLocaleDateString()}
														</div>
													</div>
												))}
											</div>
										)}
									</div>

									<div>
										<h4 className="font-medium mb-3">Service History</h4>
										<div className="space-y-3">
											{selectedSubscription.serviceHistory.map((service, index) => (
												<div key={index} className="border rounded-lg p-3">
													<div className="flex justify-between items-start mb-2">
														<h5 className="font-medium">{service.name}</h5>
														<Badge className="bg-success/10 text-success">{service.status}</Badge>
													</div>
													<div className="text-sm text-muted-foreground">
														<div className="flex items-center gap-1 mb-1">
															<Calendar className="w-3 h-3" />
															{new Date(service.date).toLocaleDateString()}
														</div>
														<div className="flex items-center gap-1">
															<User className="w-3 h-3" />
															{service.technician}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="billing" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-medium mb-3">Billing Information</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Plan Price</span>
												<span className="font-medium">${selectedSubscription.price}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Billing Cycle</span>
												<span>{selectedSubscription.billingCycle}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Payment Method</span>
												<span>{selectedSubscription.paymentMethod}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Last Payment</span>
												<span>{new Date(selectedSubscription.lastPayment).toLocaleDateString()}</span>
											</div>
											<Separator />
											<div className="flex justify-between">
												<span className="font-medium">Total Revenue</span>
												<span className="font-medium text-success">${selectedSubscription.revenue}</span>
											</div>
										</div>
									</div>

									<div>
										<h4 className="font-medium mb-3">Payment Actions</h4>
										<div className="space-y-2">
											<Button variant="outline" className="w-full justify-start">
												<CreditCard className="w-4 h-4 mr-2" />
												Process Payment
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<RefreshCw className="w-4 h-4 mr-2" />
												Update Payment Method
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<Download className="w-4 h-4 mr-2" />
												Download Invoice
											</Button>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="history" className="space-y-4">
								<div className="space-y-3">
									<div className="border rounded-lg p-3">
										<div className="flex justify-between items-center">
											<span className="font-medium">Plan Created</span>
											<span className="text-sm text-muted-foreground">{new Date(selectedSubscription.startDate).toLocaleDateString()}</span>
										</div>
									</div>
									{selectedSubscription.serviceHistory.map((service, index) => (
										<div key={index} className="border rounded-lg p-3">
											<div className="flex justify-between items-center">
												<span className="font-medium">{service.name} Completed</span>
												<span className="text-sm text-muted-foreground">{new Date(service.date).toLocaleDateString()}</span>
											</div>
											<p className="text-sm text-muted-foreground mt-1">Performed by {service.technician}</p>
										</div>
									))}
								</div>
							</TabsContent>
						</Tabs>

						<DialogFooter>
							<Button variant="outline" onClick={() => setSelectedSubscription(null)}>
								Close
							</Button>
							<Button>Edit Subscription</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Action Confirmation Dialog */}
			<Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{actionType === "pause" && "Pause Service Plan"}
							{actionType === "resume" && "Resume Service Plan"}
							{actionType === "cancel" && "Cancel Service Plan"}
							{actionType === "renew" && "Renew Service Plan"}
						</DialogTitle>
						<DialogDescription>
							{actionType === "pause" && `Are you sure you want to pause the service plan for ${selectedSubscription?.customer.name}?`}
							{actionType === "resume" && `Are you sure you want to resume the service plan for ${selectedSubscription?.customer.name}?`}
							{actionType === "cancel" && `Are you sure you want to cancel the service plan for ${selectedSubscription?.customer.name}? This action cannot be undone.`}
							{actionType === "renew" && `Would you like to renew the service plan for ${selectedSubscription?.customer.name}?`}
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button variant="outline" onClick={() => setActionDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={executeAction} variant={actionType === "cancel" ? "destructive" : "default"}>
							{actionType === "pause" && "Pause Plan"}
							{actionType === "resume" && "Resume Plan"}
							{actionType === "cancel" && "Cancel Plan"}
							{actionType === "renew" && "Renew Plan"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
