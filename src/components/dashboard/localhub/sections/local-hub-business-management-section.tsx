/**
 * LocalHub Business Management Section - Comprehensive TypeScript Implementation
 * Advanced business management interface for LocalHub directory owners
 * Features business listing, filtering, management tools, and detailed analytics
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { 
	Building2, 
	Search, 
	Filter, 
	Users, 
	DollarSign, 
	Star, 
	Phone, 
	Mail, 
	Globe, 
	MapPin,
	Eye,
	Edit,
	Trash2,
	Plus,
	TrendingUp,
	TrendingDown,
	Clock,
	CheckCircle,
	AlertCircle,
	XCircle
} from "lucide-react";
import type { LocalHubBusinessManagementSectionProps, Business, BusinessStatus, SubscriptionPlan } from "@/types/dashboard";

/**
 * Business Management Section Component
 * 
 * @description Comprehensive business management interface with filtering, analytics, and actions
 * @param businesses - Array of businesses to manage
 */
const LocalHubBusinessManagementSection: React.FC<LocalHubBusinessManagementSectionProps> = ({ 
	businesses = [] 
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<BusinessStatus | "all">("all");
	const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "all">("all");
	const [sortBy, setSortBy] = useState<"name" | "revenue" | "joinedDate" | "lastActivity">("name");
	const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");

	// Mock data if no businesses provided
	const mockBusinesses: Business[] = useMemo(() => [
		{
			id: "1",
			name: "Wade's Plumbing",
			category: "Home Services",
			plan: "pro",
			status: "active",
			monthlyRevenue: 79,
			joinedDate: new Date("2024-01-15"),
			lastActivity: new Date("2024-01-20"),
			contactEmail: "wade@wadesplumbing.com",
			phone: "(555) 123-4567",
			address: "123 Main St, Anytown, USA",
			rating: 4.8,
			reviewCount: 24,
			website: "https://wadesplumbing.com",
			verified: true,
			featured: true,
			photosCount: 12
		},
		{
			id: "2",
			name: "Local Coffee Shop",
			category: "Food & Beverage",
			plan: "basic",
			status: "active",
			monthlyRevenue: 49,
			joinedDate: new Date("2024-01-10"),
			lastActivity: new Date("2024-01-19"),
			contactEmail: "info@localcoffeeshop.com",
			rating: 4.6,
			reviewCount: 18,
			verified: true,
			featured: false,
			photosCount: 8
		},
		{
			id: "3",
			name: "Downtown Dentistry",
			category: "Healthcare",
			plan: "premium",
			status: "pending",
			monthlyRevenue: 129,
			joinedDate: new Date("2024-01-18"),
			lastActivity: new Date("2024-01-18"),
			contactEmail: "admin@downtowndentistry.com",
			phone: "(555) 987-6543",
			website: "https://downtowndentistry.com",
			verified: false,
			featured: false,
			photosCount: 0
		},
		{
			id: "4",
			name: "Fresh Cuts Salon",
			category: "Beauty & Personal Care",
			plan: "premium",
			status: "active",
			monthlyRevenue: 129,
			joinedDate: new Date("2023-12-01"),
			lastActivity: new Date("2024-01-20"),
			contactEmail: "bookings@freshcutssalon.com",
			phone: "(555) 456-7890",
			rating: 4.9,
			reviewCount: 42,
			verified: true,
			featured: true,
			photosCount: 15
		}
	], []);

	const businessData = businesses && businesses.length > 0 ? businesses : mockBusinesses;

	// Filtering and sorting logic
	const filteredBusinesses = useMemo(() => {
		let filtered = businessData.filter(business => {
			const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				business.category.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === "all" || business.status === statusFilter;
			const matchesPlan = planFilter === "all" || business.plan === planFilter;
			
			return matchesSearch && matchesStatus && matchesPlan;
		});

		// Sort businesses
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "revenue":
					return b.monthlyRevenue - a.monthlyRevenue;
				case "joinedDate":
					return b.joinedDate.getTime() - a.joinedDate.getTime();
				case "lastActivity":
					return b.lastActivity.getTime() - a.lastActivity.getTime();
				default:
					return a.name.localeCompare(b.name);
			}
		});

		return filtered;
	}, [businessData, searchQuery, statusFilter, planFilter, sortBy]);

	// Business statistics
	const businessStats = useMemo(() => {
		const total = businessData.length;
		const active = businessData.filter(b => b.status === "active").length;
		const pending = businessData.filter(b => b.status === "pending").length;
		const totalRevenue = businessData.reduce((sum, b) => sum + b.monthlyRevenue, 0);
		const averageRevenue = total > 0 ? totalRevenue / total : 0;
		
		return {
			total,
			active,
			pending,
			totalRevenue,
			averageRevenue: Math.round(averageRevenue)
		};
	}, [businessData]);

	// Event handlers
	const handleSelectBusiness = useCallback((businessId: string) => {
		setSelectedBusinesses(prev => 
			prev.includes(businessId) 
				? prev.filter(id => id !== businessId)
				: [...prev, businessId]
		);
	}, []);

	const handleSelectAll = useCallback(() => {
		setSelectedBusinesses(
			selectedBusinesses.length === filteredBusinesses.length 
				? [] 
				: filteredBusinesses.map(b => b.id)
		);
	}, [selectedBusinesses, filteredBusinesses]);

	const getStatusIcon = (status: BusinessStatus) => {
		switch (status) {
			case "active":
				return <CheckCircle className="h-4 w-4 text-success" />;
			case "pending":
				return <Clock className="h-4 w-4 text-warning" />;
			case "suspended":
				return <XCircle className="h-4 w-4 text-destructive" />;
			default:
				return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const getPlanBadgeColor = (plan: SubscriptionPlan) => {
		switch (plan) {
			case "basic":
				return "bg-muted text-foreground";
			case "pro":
				return "bg-primary/10 text-primary";
			case "premium":
				return "bg-purple-100 text-purple-800";
			case "enterprise":
				return "bg-warning/10 text-warning";
			default:
				return "bg-muted text-foreground";
		}
	};

	const BusinessCard: React.FC<{ business: Business }> = ({ business }) => (
		<Card className={`transition-all hover:shadow-md ${selectedBusinesses.includes(business.id) ? 'ring-2 ring-primary' : ''}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-3">
						<input
							type="checkbox"
							checked={selectedBusinesses.includes(business.id)}
							onChange={() => handleSelectBusiness(business.id)}
							className="mt-1"
						/>
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<CardTitle className="text-lg">{business.name}</CardTitle>
								{business.verified && <CheckCircle className="h-4 w-4 text-success" />}
								{business.featured && <Star className="h-4 w-4 text-warning fill-current" />}
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>{business.category}</span>
								<span>•</span>
								<Badge className={getPlanBadgeColor(business.plan)}>{business.plan.toUpperCase()}</Badge>
								<span>•</span>
								<div className="flex items-center gap-1">
									{getStatusIcon(business.status)}
									<span className="capitalize">{business.status}</span>
								</div>
							</div>
						</div>
					</div>
					<div className="text-right">
						<div className="text-lg font-bold text-success">${business.monthlyRevenue}/mo</div>
						<div className="text-xs text-muted-foreground">Monthly Revenue</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div className="space-y-2">
						{business.contactEmail && (
							<div className="flex items-center gap-2 text-sm">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span className="truncate">{business.contactEmail}</span>
							</div>
						)}
						{business.phone && (
							<div className="flex items-center gap-2 text-sm">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<span>{business.phone}</span>
							</div>
						)}
						{business.website && (
							<div className="flex items-center gap-2 text-sm">
								<Globe className="h-4 w-4 text-muted-foreground" />
								<a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
									Visit Website
								</a>
							</div>
						)}
					</div>
					<div className="space-y-2">
						{business.rating && (
							<div className="flex items-center gap-2 text-sm">
								<Star className="h-4 w-4 text-warning fill-current" />
								<span>{business.rating} ({business.reviewCount} reviews)</span>
							</div>
						)}
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Building2 className="h-4 w-4" />
							<span>Joined {business.joinedDate.toLocaleDateString()}</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span>Active {business.lastActivity.toLocaleDateString()}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between pt-3 border-t">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<Eye className="h-4 w-4 mr-1" />
							View
						</Button>
						<Button variant="outline" size="sm">
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>
					</div>
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						{business.photosCount && (
							<span>{business.photosCount} photos</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			{/* Business Overview Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Building2 className="h-8 w-8 text-primary" />
							<div>
								<div className="text-2xl font-bold">{businessStats.total}</div>
								<p className="text-xs text-muted-foreground">Total Businesses</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-8 w-8 text-success" />
							<div>
								<div className="text-2xl font-bold">{businessStats.active}</div>
								<p className="text-xs text-muted-foreground">Active</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<DollarSign className="h-8 w-8 text-success" />
							<div>
								<div className="text-2xl font-bold">${businessStats.totalRevenue}</div>
								<p className="text-xs text-muted-foreground">Total Revenue</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<TrendingUp className="h-8 w-8 text-purple-600" />
							<div>
								<div className="text-2xl font-bold">${businessStats.averageRevenue}</div>
								<p className="text-xs text-muted-foreground">Avg Revenue</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Actions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Business Management
							</CardTitle>
							<CardDescription>Manage your directory businesses, subscriptions, and performance</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button onClick={handleSelectAll} variant="outline" size="sm">
								{selectedBusinesses.length === filteredBusinesses.length ? 'Deselect All' : 'Select All'}
							</Button>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Business
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Filter Controls */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search businesses..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BusinessStatus | "all")}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="suspended">Suspended</SelectItem>
							</SelectContent>
						</Select>
						<Select value={planFilter} onValueChange={(value) => setPlanFilter(value as SubscriptionPlan | "all")}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by plan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Plans</SelectItem>
								<SelectItem value="basic">Basic</SelectItem>
								<SelectItem value="pro">Pro</SelectItem>
								<SelectItem value="premium">Premium</SelectItem>
								<SelectItem value="enterprise">Enterprise</SelectItem>
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
							<SelectTrigger>
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="revenue">Revenue</SelectItem>
								<SelectItem value="joinedDate">Join Date</SelectItem>
								<SelectItem value="lastActivity">Last Activity</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Selected Actions */}
					{selectedBusinesses.length > 0 && (
						<div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
							<span className="text-sm font-medium">
								{selectedBusinesses.length} business{selectedBusinesses.length > 1 ? 'es' : ''} selected
							</span>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm">
									Bulk Edit
								</Button>
								<Button variant="outline" size="sm">
									Export
								</Button>
								<Button variant="destructive" size="sm">
									<Trash2 className="h-4 w-4 mr-1" />
									Remove
								</Button>
							</div>
						</div>
					)}

					{/* Business List */}
					<div className="space-y-4">
						{filteredBusinesses.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								<Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No businesses found matching your criteria</p>
							</div>
						) : (
							filteredBusinesses.map((business) => (
								<BusinessCard key={business.id} business={business} />
							))
						)}
					</div>

					{/* Pagination */}
					{filteredBusinesses.length > 0 && (
						<div className="flex items-center justify-between pt-6 border-t">
							<span className="text-sm text-muted-foreground">
								Showing {filteredBusinesses.length} of {businessData.length} businesses
							</span>
							<div className="flex items-center space-x-2">
								<Button variant="outline" size="sm" disabled>
									Previous
								</Button>
								<Button variant="outline" size="sm" disabled>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default LocalHubBusinessManagementSection;
