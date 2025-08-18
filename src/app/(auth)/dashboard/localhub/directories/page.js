"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { MapPin, Plus, Edit, Trash2, MoreHorizontal, Eye, Settings, Star, TrendingUp, DollarSign, Zap, Globe, Phone, Mail, ExternalLink, Search, SortAsc, SortDesc, Building2, Navigation } from "lucide-react";

// Mock data for directories
const mockDirectories = [
	{
		id: "1",
		name: "Raleigh LocalHub",
		location: "Raleigh, NC",
		status: "active",
		businessCount: 127,
		monthlyRevenue: 1872,
		totalRevenue: 2340,
		domain: "raleigh.localhub.com",
		subdomain: "raleigh",
		address: "123 Main Street, Raleigh, NC 27601",
		phone: "(555) 123-4567",
		email: "contact@raleighlocalhub.com",
		description: "The premier business directory for Raleigh, NC. Connecting local customers with trusted businesses.",
		serviceRadius: 25,
		categories: ["Restaurants & Food", "Healthcare & Medical", "Professional Services", "Automotive", "Home & Garden"],
		yearEstablished: 2024,
		averageRating: 4.8,
		totalReviews: 342,
		activeSubscriptions: 45,
		lastActivity: "2 hours ago",
		primaryColor: "#3B82F6",
		logo: "/placeholder.svg",
	},
	{
		id: "2",
		name: "Durham LocalHub",
		location: "Durham, NC",
		status: "active",
		businessCount: 89,
		monthlyRevenue: 1245,
		totalRevenue: 1556,
		domain: "durham.localhub.com",
		subdomain: "durham",
		address: "456 Oak Avenue, Durham, NC 27701",
		phone: "(555) 987-6543",
		email: "hello@durhamlocalhub.com",
		description: "Durham's growing business directory connecting the community with local services.",
		serviceRadius: 20,
		categories: ["Technology", "Education & Training", "Healthcare & Medical", "Professional Services"],
		yearEstablished: 2024,
		averageRating: 4.6,
		totalReviews: 187,
		activeSubscriptions: 32,
		lastActivity: "1 day ago",
		primaryColor: "#8B5CF6",
		logo: "/placeholder.svg",
	},
	{
		id: "3",
		name: "Charlotte LocalHub",
		location: "Charlotte, NC",
		status: "active",
		businessCount: 203,
		monthlyRevenue: 2890,
		totalRevenue: 3612,
		domain: "charlotte.localhub.com",
		subdomain: "charlotte",
		address: "789 Pine Street, Charlotte, NC 28202",
		phone: "(555) 456-7890",
		email: "info@charlottelocalhub.com",
		description: "Charlotte's comprehensive business directory serving the Queen City and surrounding areas.",
		serviceRadius: 35,
		categories: ["Financial Services", "Real Estate", "Professional Services", "Restaurants & Food", "Retail & Shopping", "Healthcare & Medical"],
		yearEstablished: 2024,
		averageRating: 4.9,
		totalReviews: 456,
		activeSubscriptions: 67,
		lastActivity: "30 minutes ago",
		primaryColor: "#10B981",
		logo: "/placeholder.svg",
	},
];

export default function ManageDirectories() {
	const [directories, setDirectories] = useState(mockDirectories);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");

	useEffect(() => {
		document.title = "Manage Directories - LocalHub - Thorbis";
	}, []);

	// Filter and sort directories
	const filteredDirectories = directories
		.filter((directory) => {
			const matchesSearch = directory.name.toLowerCase().includes(searchTerm.toLowerCase()) || directory.location.toLowerCase().includes(searchTerm.toLowerCase()) || directory.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesStatus = filterStatus === "all" || directory.status === filterStatus;
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === "name" || sortBy === "location" || sortBy === "subdomain") {
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
				return "bg-green-500";
			case "inactive":
				return "bg-muted-foreground";
			case "suspended":
				return "bg-destructive";
			case "pending":
				return "bg-muted-foreground";
			default:
				return "bg-muted-foreground";
		}
	};

	return (
		<div className="w-full px-4 py-8 space-y-8 lg:px-24">
			{/* Header */}
			<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Manage All Directories</h1>
					<p className="text-muted-foreground">View and manage all your LocalHub directories and their performance</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button asChild variant="outline">
						<Link href="/dashboard/localhub">
							<Eye className="w-4 h-4 mr-2" />
							Dashboard
						</Link>
					</Button>
					<Button asChild>
						<Link href="/dashboard/localhub/create-directory">
							<Plus className="w-4 h-4 mr-2" />
							Create Directory
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Directories</CardTitle>
						<MapPin className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{directories.length}</div>
						<p className="text-xs text-muted-foreground">{directories.filter((d) => d.status === "active").length} active</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${directories.reduce((sum, d) => sum + d.monthlyRevenue, 0).toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Monthly combined</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{directories.reduce((sum, d) => sum + d.businessCount, 0)}</div>
						<p className="text-xs text-muted-foreground">Across all directories</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
						<Zap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{directories.reduce((sum, d) => sum + d.activeSubscriptions, 0)}</div>
						<p className="text-xs text-muted-foreground">Paying customers</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle>Directory Management</CardTitle>
					<CardDescription>Search, filter, and manage your LocalHub directories</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input placeholder="Search directories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
						</div>
						<div className="flex items-center space-x-2">
							<select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
								<option value="pending">Pending</option>
								<option value="suspended">Suspended</option>
							</select>
							<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
								<option value="name">Name</option>
								<option value="location">Location</option>
								<option value="businessCount">Business Count</option>
								<option value="monthlyRevenue">Revenue</option>
								<option value="averageRating">Rating</option>
							</select>
							<Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
								{sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Directories Grid */}
			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{filteredDirectories.map((directory) => (
					<Card key={directory.id} className="relative group hover:shadow-lg transition-all duration-200">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center space-x-3">
									<Avatar className="w-12 h-12">
										<AvatarImage src={directory.logo} />
										<AvatarFallback className="bg-muted text-foreground">
											<MapPin className="w-6 h-6" />
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center space-x-2">
											<h3 className="font-semibold text-foreground truncate">{directory.name}</h3>
											<Badge variant="secondary" className="text-xs">
												{directory.status}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{directory.location}</p>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem asChild>
											<a href={`https://${directory.domain}`} target="_blank" rel="noopener noreferrer">
												<Eye className="w-4 h-4 mr-2" />
												View Live Directory
											</a>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/dashboard/localhub/customization`}>
												<Edit className="w-4 h-4 mr-2" />
												Edit Directory
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/dashboard/localhub/businesses`}>
												<Building2 className="w-4 h-4 mr-2" />
												Manage Businesses
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/dashboard/localhub/analytics`}>
												<TrendingUp className="w-4 h-4 mr-2" />
												Analytics
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/dashboard/localhub/domains`}>
												<Globe className="w-4 h-4 mr-2" />
												Domain Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href={`/dashboard/localhub/settings`}>
												<Settings className="w-4 h-4 mr-2" />
												Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
											<Link href={`/dashboard/localhub/directories/delete/${directory.id}`}>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete Directory
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Status and URL */}
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<div className={`w-2 h-2 rounded-full ${getStatusColor(directory.status)}`} />
									<span className="text-sm capitalize">{directory.status}</span>
								</div>
								<div className="flex items-center space-x-1 text-sm text-muted-foreground">
									<Globe className="w-3 h-3" />
									<span className="truncate">{directory.subdomain}.localhub.com</span>
								</div>
							</div>

							{/* Contact Info */}
							<div className="space-y-2">
								<div className="flex items-center space-x-2 text-sm">
									<Phone className="w-3 h-3 text-muted-foreground" />
									<span>{directory.phone}</span>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									<Mail className="w-3 h-3 text-muted-foreground" />
									<span className="truncate">{directory.email}</span>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									<Navigation className="w-3 h-3 text-muted-foreground" />
									<span>{directory.serviceRadius} mile radius</span>
								</div>
							</div>

							<Separator />

							{/* Stats */}
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="text-lg font-semibold">{directory.businessCount}</div>
									<div className="text-xs text-muted-foreground">Businesses</div>
								</div>
								<div>
									<div className="text-lg font-semibold">${directory.monthlyRevenue.toLocaleString()}</div>
									<div className="text-xs text-muted-foreground">Monthly</div>
								</div>
								<div>
									<div className="text-lg font-semibold">{directory.averageRating}</div>
									<div className="text-xs text-muted-foreground flex items-center justify-center">
										<Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
										{directory.totalReviews} reviews
									</div>
								</div>
							</div>

							{/* Categories Preview */}
							<div>
								<div className="text-xs font-medium text-muted-foreground mb-2">Categories ({directory.categories.length})</div>
								<div className="flex flex-wrap gap-1">
									{directory.categories.slice(0, 3).map((category) => (
										<Badge key={category} variant="outline" className="text-xs">
											{category}
										</Badge>
									))}
									{directory.categories.length > 3 && (
										<Badge variant="outline" className="text-xs">
											+{directory.categories.length - 3} more
										</Badge>
									)}
								</div>
							</div>

							{/* Quick Actions */}
							<div className="flex space-x-2">
								<Button asChild variant="outline" size="sm" className="flex-1">
									<Link href={`/dashboard/localhub/businesses`}>
										<Building2 className="w-3 h-3 mr-1" />
										Businesses
									</Link>
								</Button>
								<Button asChild variant="outline" size="sm" className="flex-1">
									<Link href={`/dashboard/localhub/analytics`}>
										<TrendingUp className="w-3 h-3 mr-1" />
										Analytics
									</Link>
								</Button>
							</div>

							{/* Last Activity */}
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>Last activity: {directory.lastActivity}</span>
								<Button asChild variant="ghost" size="sm">
									<a href={`https://${directory.domain}`} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="w-3 h-3" />
									</a>
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{filteredDirectories.length === 0 && (
				<Card className="text-center py-12">
					<CardContent>
						<MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No directories found</h3>
						<p className="text-muted-foreground mb-4">{searchTerm || filterStatus !== "all" ? "Try adjusting your search or filters" : "Get started by creating your first LocalHub directory"}</p>
						<Button asChild>
							<Link href="/dashboard/localhub/create-directory">
								<Plus className="w-4 h-4 mr-2" />
								Create Your First Directory
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
