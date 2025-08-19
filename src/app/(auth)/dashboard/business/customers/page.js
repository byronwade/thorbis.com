"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Users, Search, Phone, Mail, MapPin, Star, TrendingUp, DollarSign, Plus, Filter, User, FileText, CreditCard } from "lucide-react";
import { cn } from "@lib/utils";

/**
 * Universal Customer Management Module
 * Core customer features available to all industries with customizations
 */
export default function CustomersModule() {
	const [activeTab, setActiveTab] = useState("overview");
	const [searchTerm, setSearchTerm] = useState("");

	// Sample data - in real app, this would come from API
	const customerData = {
		overview: {
			totalCustomers: 234,
			activeCustomers: 189,
			newThisMonth: 12,
			totalRevenue: 125000,
			averageOrderValue: 534,
			customerSatisfaction: 4.7,
		},
		customers: [
			{
				id: 1,
				name: "ABC Corporation",
				email: "contact@abc-corp.com",
				phone: "(555) 123-4567",
				location: "New York, NY",
				totalRevenue: 25000,
				lastService: "2024-01-10",
				status: "active",
				rating: 5,
				type: "business",
				projects: 3,
			},
			{
				id: 2,
				name: "John Smith",
				email: "john.smith@email.com",
				phone: "(555) 987-6543",
				location: "Los Angeles, CA",
				totalRevenue: 8500,
				lastService: "2024-01-12",
				status: "active",
				rating: 4,
				type: "individual",
				projects: 1,
			},
			{
				id: 3,
				name: "Sarah Johnson",
				email: "sarah.j@email.com",
				phone: "(555) 456-7890",
				location: "Chicago, IL",
				totalRevenue: 12000,
				lastService: "2024-01-08",
				status: "inactive",
				rating: 5,
				type: "individual",
				projects: 2,
			},
		],
		recentActivity: [
			{ id: 1, customer: "ABC Corporation", action: "New service request", date: "2024-01-15", type: "service" },
			{ id: 2, customer: "John Smith", action: "Payment received", date: "2024-01-14", type: "payment" },
			{ id: 3, customer: "Sarah Johnson", action: "Review submitted", date: "2024-01-13", type: "review" },
			{ id: 4, customer: "XYZ Company", action: "New customer registered", date: "2024-01-12", type: "registration" },
		],
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const filteredCustomers = customerData.customers.filter((customer) => 
		customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
		customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
		customer.phone.includes(searchTerm)
	);

	return (
		<div className="container mx-auto space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
					<p className="text-muted-foreground mt-1">Manage customer relationships, track interactions, and analyze customer data</p>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm">
						<Filter className="h-4 w-4 mr-2" />
						Filters
					</Button>
					<Button size="sm">
						<Plus className="h-4 w-4 mr-2" />
						Add Customer
					</Button>
				</div>
			</div>

			{/* Customer Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Customers</CardTitle>
						<Users className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">{customerData.overview.totalCustomers}</div>
						<p className="text-xs text-muted-foreground">{customerData.overview.activeCustomers} active</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">New This Month</CardTitle>
						<TrendingUp className="h-4 w-4 text-success" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-success">+{customerData.overview.newThisMonth}</div>
						<p className="text-xs text-muted-foreground">15% growth rate</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">{formatCurrency(customerData.overview.totalRevenue)}</div>
						<p className="text-xs text-muted-foreground">Avg: {formatCurrency(customerData.overview.averageOrderValue)}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
						<Star className="h-4 w-4 text-warning" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-warning">{customerData.overview.customerSatisfaction}/5</div>
						<p className="text-xs text-muted-foreground">Based on reviews</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="customers">All Customers</TabsTrigger>
					<TabsTrigger value="activity">Recent Activity</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Top Customers */}
						<Card>
							<CardHeader>
								<CardTitle>Top Customers</CardTitle>
								<CardDescription>Customers by revenue</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{customerData.customers
										.sort((a, b) => b.totalRevenue - a.totalRevenue)
										.slice(0, 5)
										.map((customer) => (
											<div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
												<div className="flex items-center space-x-3">
													<div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
														<User className="h-4 w-4" />
													</div>
													<div>
														<p className="font-medium">{customer.name}</p>
														<p className="text-sm text-muted-foreground">{customer.location}</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-medium text-success">{formatCurrency(customer.totalRevenue)}</p>
													<div className="flex items-center">
														<Star className="h-3 w-3 text-warning mr-1" />
														<span className="text-sm">{customer.rating}</span>
													</div>
												</div>
											</div>
										))}
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest customer interactions</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{customerData.recentActivity.map((activity) => (
										<div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
											<div className={cn("h-8 w-8 rounded-full flex items-center justify-center", 
												activity.type === "service" && "bg-primary/10 text-primary",
												activity.type === "payment" && "bg-success/10 text-success",
												activity.type === "review" && "bg-warning/10 text-warning",
												activity.type === "registration" && "bg-purple-100 text-purple-600"
											)}>
												{activity.type === "service" && <FileText className="h-4 w-4" />}
												{activity.type === "payment" && <CreditCard className="h-4 w-4" />}
												{activity.type === "review" && <Star className="h-4 w-4" />}
												{activity.type === "registration" && <User className="h-4 w-4" />}
											</div>
											<div className="flex-1">
												<p className="font-medium text-sm">{activity.customer}</p>
												<p className="text-xs text-muted-foreground">{activity.action}</p>
											</div>
											<span className="text-xs text-muted-foreground">{activity.date}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="customers" className="space-y-4">
					{/* Search and Filters */}
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input 
										placeholder="Search customers by name, email, or phone..." 
										value={searchTerm} 
										onChange={(e) => setSearchTerm(e.target.value)} 
										className="pl-10" 
									/>
								</div>
								<Button variant="outline">
									<Filter className="h-4 w-4 mr-2" />
									Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Customer List */}
					<Card>
						<CardHeader>
							<CardTitle>All Customers</CardTitle>
							<CardDescription>Complete customer directory</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{filteredCustomers.map((customer) => (
									<div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
										<div className="flex items-center space-x-4">
											<div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
												<User className="h-6 w-6" />
											</div>
											<div>
												<div className="flex items-center space-x-2">
													<p className="font-medium text-lg">{customer.name}</p>
													<Badge variant={customer.type === "business" ? "default" : "secondary"}>{customer.type}</Badge>
												</div>
												<div className="flex items-center space-x-4 text-sm text-muted-foreground">
													<span className="flex items-center">
														<Mail className="h-3 w-3 mr-1" />
														{customer.email}
													</span>
													<span className="flex items-center">
														<Phone className="h-3 w-3 mr-1" />
														{customer.phone}
													</span>
													<span className="flex items-center">
														<MapPin className="h-3 w-3 mr-1" />
														{customer.location}
													</span>
												</div>
												<div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
													<span>Last service: {customer.lastService}</span>
													<span>{customer.projects} projects</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="flex items-center space-x-1 mb-1">
												<Star className="h-4 w-4 text-warning" />
												<span className="font-medium">{customer.rating}</span>
											</div>
											<p className="text-lg font-semibold text-success">{formatCurrency(customer.totalRevenue)}</p>
											<Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Customer Activity Timeline</CardTitle>
							<CardDescription>Detailed customer interaction history</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{customerData.recentActivity.map((activity) => (
									<div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
										<div className={cn("h-10 w-10 rounded-full flex items-center justify-center mt-1", 
											activity.type === "service" && "bg-primary/10 text-primary",
											activity.type === "payment" && "bg-success/10 text-success",
											activity.type === "review" && "bg-warning/10 text-warning",
											activity.type === "registration" && "bg-purple-100 text-purple-600"
										)}>
											{activity.type === "service" && <FileText className="h-5 w-5" />}
											{activity.type === "payment" && <CreditCard className="h-5 w-5" />}
											{activity.type === "review" && <Star className="h-5 w-5" />}
											{activity.type === "registration" && <User className="h-5 w-5" />}
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<p className="font-medium">{activity.customer}</p>
												<span className="text-sm text-muted-foreground">{activity.date}</span>
											</div>
											<p className="text-sm text-muted-foreground mt-1">{activity.action}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Customer Growth</CardTitle>
								<CardDescription>New customers over time</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-64 flex items-center justify-center bg-muted rounded-lg">
									<div className="text-center">
										<TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">Customer growth chart coming soon</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Customer Segmentation</CardTitle>
								<CardDescription>Customers by revenue tiers</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-64 flex items-center justify-center bg-muted rounded-lg">
									<div className="text-center">
										<Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">Segmentation chart coming soon</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
