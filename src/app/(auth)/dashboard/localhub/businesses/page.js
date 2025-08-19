"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Send, CheckCircle, DollarSign, MapPin, Phone, Globe, Star, Mail, Copy, ExternalLink, AlertTriangle, Building2, TrendingUp, Download, ArrowUpRight } from "lucide-react";
import { toast } from "@components/ui/use-toast";

const subscriptionTiers = [
	{ value: "basic", label: "Basic - $49/month", color: "bg-primary/10 text-primary border-primary/30", monthlyFee: 49 },
	{ value: "pro", label: "Pro - $79/month", color: "bg-purple-100 text-purple-800 border-purple-200", monthlyFee: 79 },
	{ value: "premium", label: "Premium - $129/month", color: "bg-warning/10 text-warning border-yellow-200", monthlyFee: 129 },
];

const businessCategories = ["Restaurants", "Healthcare", "Home Services", "Retail", "Professional Services", "Automotive", "Beauty & Wellness", "Education", "Entertainment", "Technology"];

const mockBusinesses = [
	{
		id: 1,
		name: "Wade's Plumbing & Septic",
		category: "Home Services",
		address: "123 Main St, Portland, OR 97201",
		phone: "(503) 555-0123",
		website: "www.wadesplumbing.com",
		email: "info@wadesplumbing.com",
		status: "active",
		subscription: "pro",
		monthlyFee: 79,
		joinDate: "2024-01-15",
		lastPayment: "2024-03-01",
		nextPayment: "2024-04-01",
		totalPaid: 237,
		hubShare: 189.6,
		platformFee: 47.4,
		rating: 4.8,
		reviews: 124,
		verified: true,
	},
	{
		id: 2,
		name: "Downtown Coffee Roasters",
		category: "Restaurants",
		address: "456 Oak Ave, Portland, OR 97202",
		phone: "(503) 555-0456",
		website: "www.downtowncoffee.com",
		email: "hello@downtowncoffee.com",
		status: "active",
		subscription: "basic",
		monthlyFee: 49,
		joinDate: "2024-02-01",
		lastPayment: "2024-03-01",
		nextPayment: "2024-04-01",
		totalPaid: 98,
		hubShare: 78.4,
		platformFee: 19.6,
		rating: 4.6,
		reviews: 89,
		verified: true,
	},
	{
		id: 3,
		name: "Elite Dental Care",
		category: "Healthcare",
		address: "789 Elm St, Portland, OR 97203",
		phone: "(503) 555-0789",
		website: null,
		email: "contact@elitedental.com",
		status: "pending",
		subscription: "basic",
		monthlyFee: 49,
		joinDate: "2024-03-10",
		lastPayment: null,
		nextPayment: "2024-03-15",
		totalPaid: 0,
		hubShare: 0,
		platformFee: 0,
		rating: 0,
		reviews: 0,
		verified: false,
	},
	{
		id: 4,
		name: "Fresh Market Grocery",
		category: "Retail",
		address: "321 Pine St, Portland, OR 97204",
		phone: "(503) 555-0321",
		website: "www.freshmarket.com",
		email: "manager@freshmarket.com",
		status: "overdue",
		subscription: "pro",
		monthlyFee: 79,
		joinDate: "2024-01-01",
		lastPayment: "2024-02-01",
		nextPayment: "2024-03-01",
		totalPaid: 158,
		hubShare: 126.4,
		platformFee: 31.6,
		rating: 4.2,
		reviews: 56,
		verified: true,
	},
	{
		id: 5,
		name: "Bright Smile Orthodontics",
		category: "Healthcare",
		address: "555 Cedar Ave, Portland, OR 97205",
		phone: "(503) 555-0555",
		website: "www.brightsmile.com",
		email: "info@brightsmile.com",
		status: "active",
		subscription: "premium",
		monthlyFee: 129,
		joinDate: "2024-01-20",
		lastPayment: "2024-03-01",
		nextPayment: "2024-04-01",
		totalPaid: 387,
		hubShare: 309.6,
		platformFee: 77.4,
		rating: 4.9,
		reviews: 67,
		verified: true,
	},
];

const revenueHistory = [
	{ month: "March 2024", totalRevenue: 385, hubShare: 308, platformFee: 77, activeSubscriptions: 4 },
	{ month: "February 2024", totalRevenue: 256, hubShare: 204.8, platformFee: 51.2, activeSubscriptions: 3 },
	{ month: "January 2024", totalRevenue: 158, hubShare: 126.4, platformFee: 31.6, activeSubscriptions: 2 },
];

export default function BusinessManagement() {
	const [businesses, setBusinesses] = useState(mockBusinesses);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [tierFilter, setTierFilter] = useState("all");
	const [activeView, setActiveView] = useState("businesses");
	const [newBusiness, setNewBusiness] = useState({
		name: "",
		category: "",
		address: "",
		phone: "",
		website: "",
		email: "",
		subscription: "basic",
	});

	const filteredBusinesses = businesses.filter((business) => {
		const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) || business.category.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === "all" || business.status === statusFilter;
		const matchesTier = tierFilter === "all" || business.subscription === tierFilter;
		return matchesSearch && matchesStatus && matchesTier;
	});

	const totalMonthlyRevenue = businesses.filter((b) => b.status === "active").reduce((sum, b) => sum + b.monthlyFee, 0);
	const hubMonthlyShare = totalMonthlyRevenue * 0.8;
	const platformMonthlyFee = totalMonthlyRevenue * 0.2;
	const overdueCount = businesses.filter((b) => b.status === "overdue").length;
	const pendingCount = businesses.filter((b) => b.status === "pending").length;

	const getStatusBadge = (status) => {
		const statusConfig = {
			active: { color: "bg-success/10 text-success border-green-200", label: "Active" },
			pending: { color: "bg-warning/10 text-warning border-yellow-200", label: "Pending Setup" },
			overdue: { color: "bg-destructive/10 text-destructive border-red-200", label: "Payment Overdue" },
			suspended: { color: "bg-neutral-100 text-neutral-800 border-neutral-700", label: "Suspended" },
		};

		const config = statusConfig[status] || statusConfig.pending;
		return <Badge className={`${config.color} text-xs font-medium`}>{config.label}</Badge>;
	};

	const getSubscriptionBadge = (subscription) => {
		const tier = subscriptionTiers.find((t) => t.value === subscription);
		return <Badge className={`${tier?.color} text-xs font-medium`}>{tier?.label.split(" - ")[0] || "Basic"}</Badge>;
	};

	const handleAddBusiness = () => {
		if (!newBusiness.name || !newBusiness.category || !newBusiness.email) {
			toast({
				title: "Missing Required Fields",
				description: "Please fill in business name, category, and email address.",
				variant: "destructive",
			});
			return;
		}

		const selectedTier = subscriptionTiers.find((t) => t.value === newBusiness.subscription);
		const business = {
			id: businesses.length + 1,
			...newBusiness,
			status: "pending",
			monthlyFee: selectedTier?.monthlyFee || 49,
			joinDate: new Date().toISOString().split("T")[0],
			lastPayment: null,
			nextPayment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			totalPaid: 0,
			hubShare: 0,
			platformFee: 0,
			rating: 0,
			reviews: 0,
			verified: false,
		};

		setBusinesses([...businesses, business]);
		setNewBusiness({
			name: "",
			category: "",
			address: "",
			phone: "",
			website: "",
			email: "",
			subscription: "basic",
		});
		setIsAddingBusiness(false);

		toast({
			title: "Business Added Successfully",
			description: `${business.name} has been added to your directory. Setup invitation sent to ${business.email}.`,
		});
	};

	const sendInvitation = (business) => {
		toast({
			title: "Invitation Sent",
			description: `Setup invitation resent to ${business.name} at ${business.email}.`,
		});
	};

	const copyInviteLink = (businessId) => {
		const link = `${window.location.origin}/business-setup/${businessId}?hub=your-hub-slug`;
		navigator.clipboard.writeText(link);
		toast({
			title: "Link Copied",
			description: "Business setup link copied to clipboard.",
		});
	};

	const sendPaymentReminder = (business) => {
		toast({
			title: "Payment Reminder Sent",
			description: `Payment reminder sent to ${business.name} at ${business.email}.`,
		});
	};

	return (
		<div className="w-full px-4 py-8 space-y-8 lg:px-24">
			{/* Header */}
			<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Business & Subscription Management</h1>
					<p className="text-muted-foreground">Manage business listings, subscriptions, and track your revenue</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Export Data
					</Button>
					<Button asChild>
						<Link href="/dashboard/localhub/businesses/create">
							<Plus className="w-4 h-4 mr-2" />
							Add Business
						</Link>
					</Button>
				</div>
			</div>

			{/* Revenue Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalMonthlyRevenue.toLocaleString()}</div>
						<p className="text-xs text-success flex items-center">
							<ArrowUpRight className="w-3 h-3 mr-1" />
							+18.2% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Your Share (80%)</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-success">${hubMonthlyShare.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Next payout: March 31st</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{businesses.length}</div>
						<p className="text-xs text-muted-foreground">{businesses.filter((b) => b.status === "active").length} active</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-destructive">{overdueCount + pendingCount}</div>
						<p className="text-xs text-muted-foreground">
							{overdueCount} overdue, {pendingCount} pending
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Minimal segmented control instead of tabs */}
			<div className="w-full">
				<div className="flex items-center gap-2 mb-4">
					<Button variant={activeView === "businesses" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveView("businesses")}>
						Business Listings
					</Button>
					<Button variant={activeView === "subscriptions" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveView("subscriptions")}>
						Subscriptions
					</Button>
					<Button variant={activeView === "revenue" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveView("revenue")}>
						Revenue History
					</Button>
				</div>

				{activeView === "businesses" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>Business Directory</CardTitle>
									<div className="flex items-center space-x-2">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input placeholder="Search businesses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
										</div>
										<Select value={statusFilter} onValueChange={setStatusFilter}>
											<SelectTrigger className="w-32">
												<SelectValue placeholder="Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Status</SelectItem>
												<SelectItem value="active">Active</SelectItem>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="overdue">Overdue</SelectItem>
												<SelectItem value="suspended">Suspended</SelectItem>
											</SelectContent>
										</Select>
										<Select value={tierFilter} onValueChange={setTierFilter}>
											<SelectTrigger className="w-32">
												<SelectValue placeholder="Tier" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Tiers</SelectItem>
												<SelectItem value="basic">Basic</SelectItem>
												<SelectItem value="pro">Pro</SelectItem>
												<SelectItem value="premium">Premium</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredBusinesses.map((business) => (
										<div key={business.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
											<div className="flex items-center space-x-4">
												<div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted">
													<Building2 className="w-6 h-6 text-white" />
												</div>
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														<h3 className="font-semibold">{business.name}</h3>
														{business.verified && <CheckCircle className="w-4 h-4 text-success" />}
														{getStatusBadge(business.status)}
														{getSubscriptionBadge(business.subscription)}
													</div>
													<div className="flex items-center space-x-4 text-sm text-muted-foreground">
														<span className="flex items-center">
															<MapPin className="w-3 h-3 mr-1" />
															{business.category}
														</span>
														<span className="flex items-center">
															<Phone className="w-3 h-3 mr-1" />
															{business.phone}
														</span>
														<span className="flex items-center">
															<Mail className="w-3 h-3 mr-1" />
															{business.email}
														</span>
														{business.website && (
															<span className="flex items-center">
																<Globe className="w-3 h-3 mr-1" />
																{business.website}
															</span>
														)}
													</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<div className="text-right">
													<div className="font-semibold">${business.monthlyFee}/month</div>
													<div className="text-sm text-muted-foreground">
														{business.rating > 0 ? (
															<span className="flex items-center">
																<Star className="w-3 h-3 mr-1 fill-yellow-400 text-warning" />
																{business.rating} ({business.reviews} reviews)
															</span>
														) : (
															"No reviews yet"
														)}
													</div>
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => window.open(`https://${business.website}`, "_blank")}>
															<ExternalLink className="w-4 h-4 mr-2" />
															View Website
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => sendInvitation(business)}>
															<Send className="w-4 h-4 mr-2" />
															Send Invitation
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => copyInviteLink(business.id)}>
															<Copy className="w-4 h-4 mr-2" />
															Copy Setup Link
														</DropdownMenuItem>
														{business.status === "overdue" && (
															<DropdownMenuItem onClick={() => sendPaymentReminder(business)}>
																<AlertTriangle className="w-4 h-4 mr-2" />
																Send Payment Reminder
															</DropdownMenuItem>
														)}
														<DropdownMenuItem>
															<Edit className="w-4 h-4 mr-2" />
															Edit Business
														</DropdownMenuItem>
														<DropdownMenuItem className="text-destructive">
															<Trash2 className="w-4 h-4 mr-2" />
															Remove Business
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{activeView === "subscriptions" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Subscription Details</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredBusinesses.map((business) => (
										<div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="space-y-1">
												<div className="flex items-center space-x-2">
													<h3 className="font-semibold">{business.name}</h3>
													{getSubscriptionBadge(business.subscription)}
													{getStatusBadge(business.status)}
												</div>
												<div className="flex items-center space-x-4 text-sm text-muted-foreground">
													<span>Joined: {new Date(business.joinDate).toLocaleDateString()}</span>
													{business.lastPayment && <span>Last Payment: {new Date(business.lastPayment).toLocaleDateString()}</span>}
													<span>Next Payment: {new Date(business.nextPayment).toLocaleDateString()}</span>
												</div>
											</div>
											<div className="text-right space-y-1">
												<div className="font-semibold">${business.monthlyFee}/month</div>
												<div className="text-sm text-muted-foreground">Total Paid: ${business.totalPaid}</div>
												<div className="text-xs text-success">Your Share: ${business.hubShare}</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{activeView === "revenue" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Revenue History</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{revenueHistory.map((month, index) => (
										<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="space-y-1">
												<h3 className="font-semibold">{month.month}</h3>
												<div className="text-sm text-muted-foreground">{month.activeSubscriptions} active subscriptions</div>
											</div>
											<div className="text-right space-y-1">
												<div className="font-semibold">${month.totalRevenue} Total</div>
												<div className="text-sm text-success">${month.hubShare} Your Share</div>
												<div className="text-xs text-muted-foreground">${month.platformFee} Platform Fee</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
