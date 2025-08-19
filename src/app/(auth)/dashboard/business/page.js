import React from "react";
import { ProtectedRoute } from "@features/auth";
import { PERMISSIONS } from "@lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { IntegrationVisibility } from "@components/dashboard/business/integrations/IntegrationVisibility";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import FieldServiceTabTrigger from "@components/dashboard/business/integrations/field-service-tab-trigger";
import { Star, Eye, Plus, Edit, BarChart3, MapPin, TrendingUp, MessageSquare, Download, Filter, Calendar, Users, Wrench, FileText, Receipt, DollarSign } from "lucide-react";
import EnabledIntegrations from "@components/dashboard/business/enabled-integrations";
import { AgricultureWidget, AutomotiveWidget, EcommerceWidget, LogisticsWidget, PropertyManagementWidget, HospitalityWidget } from "@components/dashboard/business/integrations/widgets/IndustryOpsWidgets";
import FieldServiceJobsWidget from "@components/dashboard/business/integrations/widgets/FieldServiceJobs";
import HospitalityPOSWidget from "@components/dashboard/business/integrations/widgets/HospitalityPOS";
import { FleetManagementWidget } from "@components/dashboard/business/integrations/fleet-management";
import EnhancedFieldManagementWidget from "@components/dashboard/business/integrations/widgets/EnhancedFieldManagement";
import RoleDebugger from "@components/debug/role-debugger";
import AutoRoleSync from "@components/shared/AutoRoleSync";
import WeatherWidget from "@components/shared/weather-widget";

/**
 * Business dashboard page for business owners
 * Full-width modern dashboard with comprehensive analytics and management tools
 */
export default function BusinessDashboardPage() {
	return (
		<ProtectedRoute
			requiredPermissions={[PERMISSIONS.BUSINESS_MANAGE]}
			minRoleLevel={1}
			requireEmailVerification={false}
			fallbackPermissions={[PERMISSIONS.PROFILE_READ]}
			unauthorizedComponent={
				<div className="mx-auto max-w-7xl space-y-8">
					<RoleDebugger />
					<div className="text-center">
						<h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
						<p className="text-muted-foreground">Please sync your user roles using the debug panel above</p>
					</div>
				</div>
			}
		>
			<AutoRoleSync 
				fallback={
					<div className="mx-auto max-w-7xl space-y-8">
						<RoleDebugger />
						<div className="text-center">
							<h2 className="text-2xl font-bold text-warning">Account Setup Required</h2>
							<p className="text-muted-foreground">Unable to automatically configure your account. Please use the sync button above.</p>
						</div>
					</div>
				}
			>
				<BusinessDashboardContent />
			</AutoRoleSync>
		</ProtectedRoute>
	);
}

function BusinessDashboardContent() {
	// Mock data - would come from real API calls in production
	const businessStats = [
		{
			title: "Total Views",
			value: "8,432",
			change: "+15% from last month",
			icon: Eye,
			color: "text-primary",
			bgColor: "bg-blue-50 dark:bg-primary",
		},
		{
			title: "New Reviews",
			value: "12",
			change: "+3 this week",
			icon: MessageSquare,
			color: "text-success",
			bgColor: "bg-green-50 dark:bg-success",
		},
		{
			title: "Average Rating",
			value: "4.6",
			change: "Based on 87 reviews",
			icon: Star,
			color: "text-warning",
			bgColor: "bg-yellow-50 dark:bg-warning",
		},
		{
			title: "Click-through Rate",
			value: "3.2%",
			change: "+0.4% from last month",
			icon: TrendingUp,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
	];

	// Field Service Management Stats
	const fsmStats = [
		{
			title: "Jobs Today",
			value: "12",
			change: "3 in progress",
			icon: Wrench,
			color: "text-primary",
			bgColor: "bg-blue-50 dark:bg-primary",
		},
		{
			title: "Active Technicians",
			value: "8",
			change: "2 available",
			icon: Users,
			color: "text-success",
			bgColor: "bg-green-50 dark:bg-success",
		},
		{
			title: "Monthly Revenue",
			value: "$24,850",
			change: "+18% from last month",
			icon: DollarSign,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50 dark:bg-emerald-950",
		},
		{
			title: "Customer Rating",
			value: "4.8",
			change: "Based on 156 reviews",
			icon: Star,
			color: "text-warning",
			bgColor: "bg-yellow-50 dark:bg-warning",
		},
	];

	// Mock business listings with enhanced data
	const businesses = [
		{
			id: 1,
			name: "Mario's Italian Restaurant",
			status: "active",
			rating: 4.8,
			reviewCount: 234,
			views: 2543,
			address: "123 Main St, Anytown USA",
			verified: true,
			revenue: "$12,450",
			leads: 45,
		},
		{
			id: 2,
			name: "Downtown Coffee Shop",
			status: "pending_verification",
			rating: 4.2,
			reviewCount: 45,
			views: 892,
			address: "456 Oak Ave, Anytown USA",
			verified: false,
			revenue: "$3,280",
			leads: 12,
		},
		{
			id: 3,
			name: "Tech Repair Pro",
			status: "active",
			rating: 4.9,
			reviewCount: 156,
			views: 1876,
			address: "789 Tech Blvd, Anytown USA",
			verified: true,
			revenue: "$8,920",
			leads: 23,
		},
	];

	const quickActions = [
		{
			title: "Add New Business",
			description: "List another business",
			href: "/dashboard/business/add",
			icon: Plus,
			color: "text-primary",
			bgColor: "bg-blue-50 dark:bg-primary",
		},
		{
			title: "Update Information",
			description: "Keep details current",
			href: "/dashboard/business/profile",
			icon: Edit,
			color: "text-success",
			bgColor: "bg-green-50 dark:bg-success",
		},
		{
			title: "View Analytics",
			description: "See detailed metrics",
			href: "/dashboard/business/analytics",
			icon: BarChart3,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
		{
			title: "Manage Reviews",
			description: "Respond to customer feedback",
			href: "/dashboard/business/reviews",
			icon: MessageSquare,
			color: "text-warning",
			bgColor: "bg-orange-50 dark:bg-warning",
		},
	];

	// Field Service Management Quick Actions
	const fsmQuickActions = [
		{
			title: "Schedule New Job",
			description: "Create service appointment",
			href: "/dashboard/business/schedule/new-job",
			icon: Plus,
			color: "text-primary",
			bgColor: "bg-blue-50 dark:bg-primary",
		},
		{
			title: "View Calendar",
			description: "Manage technician schedule",
			href: "/dashboard/business/schedule/calendar",
			icon: Calendar,
			color: "text-success",
			bgColor: "bg-green-50 dark:bg-success",
		},
		{
			title: "Create Estimate",
			description: "Generate customer quote",
			href: "/dashboard/business/estimates/create",
			icon: FileText,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
		{
			title: "Manage Customers",
			description: "Customer relationships",
			href: "/dashboard/business/customers/list",
			icon: Users,
			color: "text-warning",
			bgColor: "bg-orange-50 dark:bg-warning",
		},
		{
			title: "Create Invoice",
			description: "Bill for completed work",
			href: "/dashboard/business/invoices/create",
			icon: Receipt,
			color: "text-indigo-600",
			bgColor: "bg-indigo-50 dark:bg-indigo-950",
		},
		{
			title: "View Reports",
			description: "Performance analytics",
			href: "/dashboard/business/analytics/dashboard",
			icon: BarChart3,
			color: "text-teal-600",
			bgColor: "bg-teal-50 dark:bg-teal-950",
		},
	];

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Temporary debug component - remove after fixing */}
			<RoleDebugger />

			{/* Dashboard Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
					<p className="text-muted-foreground">Comprehensive business management and field service operations</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm">
						<Download className="mr-2 w-4 h-4" />
						Export Data
					</Button>
					<Button variant="outline" size="sm">
						<Filter className="mr-2 w-4 h-4" />
						Filter
					</Button>
					<Button size="sm" asChild>
						<a href="/dashboard/business/schedule/new-job">
							<Plus className="mr-2 w-4 h-4" />
							New Job
						</a>
					</Button>
				</div>
			</div>

			{/* Main Dashboard Tabs */}
			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<FieldServiceTabTrigger />
					<TabsTrigger value="businesses">Business Listings</TabsTrigger>
				</TabsList>
				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{businessStats.map((stat, index) => {
							const IconComponent = stat.icon;
							return (
								<Card key={index} className="relative overflow-hidden">
									<CardContent className="p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
												<p className="text-2xl font-bold">{stat.value}</p>
												<p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
											</div>
											<div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
												<IconComponent className={`h-6 w-6 ${stat.color}`} />
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Weather Widget - Full Width */}
					<WeatherWidget showBusinessImpact={true} />

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Combined Business Overview - Takes up 2 columns */}
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Business Overview</CardTitle>
									<CardDescription>Combined business listings and field service performance</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<h4 className="font-medium">Business Listings</h4>
											<p className="text-2xl font-bold">{businesses.length}</p>
											<p className="text-xs text-muted-foreground">Active businesses</p>
										</div>
										<div className="space-y-2">
											<h4 className="font-medium">Field Service Jobs</h4>
											<p className="text-2xl font-bold">12</p>
											<p className="text-xs text-muted-foreground">Jobs today</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Right Sidebar */}
						<div className="space-y-6">
							<EnabledIntegrations />
							<FleetManagementWidget />
							<EnhancedFieldManagementWidget />
							<FieldServiceJobsWidget />
							<HospitalityPOSWidget />
							<AgricultureWidget />
							<AutomotiveWidget />
							<EcommerceWidget />
							<LogisticsWidget />
							<PropertyManagementWidget />
							<HospitalityWidget />
							{/* Quick Actions */}
							<Card>
								<CardHeader>
									<CardTitle>Quick Actions</CardTitle>
									<CardDescription>Common business management tasks</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									{quickActions.map((action, index) => {
										const IconComponent = action.icon;
										return (
											<a key={index} href={action.href} className="block group">
												<div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
													<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}>
														<IconComponent className={`h-5 w-5 ${action.color}`} />
													</div>
													<div className="flex-1">
														<p className="font-medium group-hover:text-primary transition-colors">{action.title}</p>
														<p className="text-xs text-muted-foreground">{action.description}</p>
													</div>
												</div>
											</a>
										);
									})}
								</CardContent>
							</Card>

							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle>Recent Activity</CardTitle>
									<CardDescription>Latest updates and notifications</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start space-x-3">
										<div className="w-2 h-2 bg-success rounded-full mt-2"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">Job completed</p>
											<p className="text-xs text-muted-foreground">HVAC maintenance • 1 hour ago</p>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">New customer added</p>
											<p className="text-xs text-muted-foreground">Sarah Johnson • 2 hours ago</p>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">Estimate approved</p>
											<p className="text-xs text-muted-foreground">Electrical repair • 3 hours ago</p>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">Invoice sent</p>
											<p className="text-xs text-muted-foreground">Bob's Restaurant • 1 day ago</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
				;{/* Field Service Tab */}
				<IntegrationVisibility featureKey="field_management">
					<TabsContent value="field-service" className="space-y-6">
						{/* FSM Stats Cards */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{fsmStats.map((stat, index) => {
								const IconComponent = stat.icon;
								return (
									<Card key={index} className="relative overflow-hidden">
										<CardContent className="p-6">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
													<p className="text-2xl font-bold">{stat.value}</p>
													<p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
												</div>
												<div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
													<IconComponent className={`h-6 w-6 ${stat.color}`} />
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* FSM Quick Actions Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{fsmQuickActions.map((action, index) => {
								const IconComponent = action.icon;
								return (
									<a key={index} href={action.href} className="block group">
										<Card className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex items-center space-x-4">
													<div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.bgColor}`}>
														<IconComponent className={`h-6 w-6 ${action.color}`} />
													</div>
													<div className="flex-1">
														<p className="font-medium group-hover:text-primary transition-colors">{action.title}</p>
														<p className="text-sm text-muted-foreground">{action.description}</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</a>
								);
							})}
						</div>
					</TabsContent>
				</IntegrationVisibility>
				;{/* Business Listings Tab */}
				<TabsContent value="businesses" className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Your Businesses</CardTitle>
									<CardDescription>Manage and monitor your business listings</CardDescription>
								</div>
								<Button size="sm" variant="outline" asChild>
									<a href="/dashboard/business/add">
										<Plus className="h-4 w-4 mr-2" />
										Add Business
									</a>
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{businesses.map((business) => (
								<Card key={business.id} className="p-4 hover:shadow-md transition-shadow">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">{business.name.charAt(0)}</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<h3 className="font-semibold text-lg">{business.name}</h3>
													{business.verified && (
														<Badge variant="default" className="text-xs">
															Verified
														</Badge>
													)}
													<Badge variant={business.status === "active" ? "default" : "secondary"} className="text-xs">
														{business.status.replace("_", " ")}
													</Badge>
												</div>
												<div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
													<MapPin className="h-3 w-3" />
													<span>{business.address}</span>
												</div>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div className="flex items-center space-x-1">
														<Star className="h-3 w-3 fill-yellow-400 text-warning" />
														<span>
															{business.rating} ({business.reviewCount})
														</span>
													</div>
													<div className="flex items-center space-x-1 text-muted-foreground">
														<Eye className="h-3 w-3" />
														<span>{business.views.toLocaleString()} views</span>
													</div>
													<div className="text-success font-medium">{business.revenue}</div>
													<div className="text-primary font-medium">{business.leads} leads</div>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button variant="outline" size="sm" asChild>
												<a href={`/dashboard/business/${business.id}/edit`}>
													<Edit className="h-3 w-3 mr-1" />
													Edit
												</a>
											</Button>
											<Button variant="outline" size="sm" asChild>
												<a href={`/dashboard/business/${business.id}/analytics`}>
													<BarChart3 className="h-3 w-3 mr-1" />
													Analytics
												</a>
											</Button>
										</div>
									</div>
								</Card>
							))}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
