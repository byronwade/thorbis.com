"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@context/auth-context";
import { useUserProfile } from "@hooks/use-user-profile";
// import { usePermissions, ProtectedComponent } from "@features/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Separator } from "@components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { PERMISSIONS, RoleManager } from "@lib/auth/roles";
import { User, Building, BarChart3, Shield, Settings, Bell, Menu, LogOut, ChevronDown, Star, MapPin, Users, TrendingUp, FileText, Briefcase, Gavel, Eye, Edit, Plus, GraduationCap, BookOpen, AlertTriangle } from "lucide-react";
import logger from "@lib/utils/logger";

/**
 * Comprehensive dashboard layout with role-based navigation
 * Integrates all authentication and permission features
 */
export default function DashboardLayout({ children }) {
	const { user, logout, isAuthenticated } = useAuth();
	const { profile, loading: profileLoading } = useUserProfile();
	const { checkPermission, getUserLevel, userRoles } = usePermissions();
	const router = useRouter();
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Log dashboard access (remove redundant redirect logic since ProtectedRoute handles this)
	useEffect(() => {
		if (isAuthenticated && user) {
			logger.info("Dashboard accessed", {
				userId: user.id,
				userRoles,
				userLevel: getUserLevel(),
				route: pathname,
			});
		}
	}, [isAuthenticated, user, userRoles, getUserLevel, pathname]);

	// Show loading state for auth (ProtectedRoute handles auth checking)
	if (!isAuthenticated || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border mx-auto"></div>
					<p>Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-card">
			{/* Mobile sidebar */}
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50" size="sm">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-80 p-0">
					<DashboardSidebar user={user} profile={profile} userRoles={userRoles} checkPermission={checkPermission} getUserLevel={getUserLevel} pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
				</SheetContent>
			</Sheet>

			{/* Desktop layout */}
			<div className="md:flex">
				{/* Desktop sidebar */}
				<div className="hidden md:flex md:w-80 md:flex-col">
					<div className="flex flex-col flex-grow pt-5 bg-white dark:bg-card border-r border-border dark:border-border overflow-y-auto">
						<DashboardSidebar user={user} profile={profile} userRoles={userRoles} checkPermission={checkPermission} getUserLevel={getUserLevel} pathname={pathname} />
					</div>
				</div>

				{/* Main content */}
				<div className="md:pl-80 flex flex-col flex-1">
					<DashboardHeader user={user} profile={profile} logout={logout} />
					<main className="flex-1 p-6">{children}</main>
				</div>
			</div>
		</div>
	);
}

/**
 * Dashboard sidebar with role-based navigation
 */
function DashboardSidebar({ user, profile, userRoles, checkPermission, getUserLevel, pathname, onNavigate }) {
	const userLevel = getUserLevel();

	const navigationItems = [
		// Profile & Account
		{
			name: "Profile",
			href: "/dashboard/user/profile",
			icon: User,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Manage your account",
		},
		{
			name: "Settings",
			href: "/dashboard/user/settings",
			icon: Settings,
			permission: PERMISSIONS.PROFILE_UPDATE,
			description: "Account settings",
		},

		// Academy Learning
		{
			name: "Academy Dashboard",
			href: "/dashboard/academy",
			icon: GraduationCap,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Learning progress",
		},
		{
			name: "Browse Courses",
			href: "/dashboard/academy/courses",
			icon: BookOpen,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Explore courses",
		},
		{
			name: "My Progress",
			href: "/dashboard/academy/progress",
			icon: BarChart3,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Track learning",
		},
		{
			name: "Certifications",
			href: "/dashboard/academy/certifications",
			icon: Star,
			permission: PERMISSIONS.PROFILE_READ,
			description: "View certificates",
		},
		{
			name: "Practice Tests",
			href: "/dashboard/academy/practice",
			icon: FileText,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Test knowledge",
		},

		// Business Directory Management (Primary Platform Function)
		{
			name: "Browse Directory",
			href: "/categories",
			icon: Building,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Explore business directory",
		},
		{
			name: "My Directory Listings",
			href: "/dashboard/business",
			icon: Building,
			permission: PERMISSIONS.BUSINESS_MANAGE,
			description: "Manage your directory listings",
			minLevel: 2,
		},
		{
			name: "Add to Directory",
			href: "/dashboard/business/add",
			icon: Plus,
			permission: PERMISSIONS.BUSINESS_CREATE,
			description: "Add new directory listing",
			minLevel: 2,
		},
		{
			name: "Directory Analytics",
			href: "/dashboard/business/analytics",
			icon: BarChart3,
			permission: PERMISSIONS.BUSINESS_MANAGE,
			description: "Directory performance insights",
			minLevel: 2,
		},

		// Field Service Functions (Secondary)
		{
			name: "Post Field Job",
			href: "/dashboard/user/jobs/create",
			icon: Briefcase,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Post field service jobs",
		},
		{
			name: "My Jobs",
			href: "/dashboard/user/jobs",
			icon: Briefcase,
			permission: PERMISSIONS.PROFILE_READ,
			description: "Manage your job postings",
		},

		// LocalHub Community Platform (Tertiary)
		{
			name: "Build LocalHub",
			href: "/dashboard/localhub",
			icon: MapPin,
			permission: PERMISSIONS.BUSINESS_MODERATE,
			description: "Create community directory platform",
			minLevel: 3,
		},
		{
			name: "LocalHub Analytics",
			href: "/dashboard/localhub/analytics",
			icon: TrendingUp,
			permission: PERMISSIONS.ANALYTICS_VIEW,
			description: "Community platform insights",
			minLevel: 3,
		},

		// Admin Functions
		{
			name: "User Management",
			href: "/dashboard/admin/users",
			icon: Users,
			permission: PERMISSIONS.USER_MANAGE,
			description: "Manage platform users",
			minLevel: 4,
		},
		{
			name: "Content Moderation",
			href: "/dashboard/admin/moderation",
			icon: Eye,
			permission: PERMISSIONS.REVIEW_MODERATE,
			description: "Review content",
			minLevel: 3,
		},
		{
			name: "Business Claims",
			href: "/dashboard/admin/claims",
			icon: Gavel,
			permission: PERMISSIONS.BUSINESS_MODERATE,
			description: "Handle business claims",
			minLevel: 3,
		},
		{
			name: "Reports",
			href: "/dashboard/admin/reports",
			icon: FileText,
			permission: PERMISSIONS.AUDIT_VIEW,
			description: "System reports",
			minLevel: 4,
		},
		{
			name: "Role Management",
			href: "/dashboard/admin/roles",
			icon: Shield,
			permission: PERMISSIONS.ROLES_MANAGE,
			description: "Manage user roles",
			minLevel: 4,
		},
		{
			name: "System Settings",
			href: "/dashboard/admin/settings",
			icon: Settings,
			permission: PERMISSIONS.SYSTEM_CONFIGURE,
			description: "System configuration",
			minLevel: 5,
		},
	];

	// Filter navigation based on permissions and level
	const allowedItems = navigationItems.filter((item) => {
		if (item.minLevel && userLevel < item.minLevel) return false;
		if (item.permission && !checkPermission(item.permission)) return false;
		return true;
	});

	// Group items by category - Reorganized by Priority
	const categories = {
		Account: allowedItems.filter((item) => item.name === "Profile" || item.name === "Settings"),
		"Business Directory": allowedItems.filter((item) => item.name.includes("Directory") || item.name === "Browse Directory" || (item.href.includes("/business") && !item.href.includes("/admin/"))),
		"Field Services": allowedItems.filter((item) => item.name.includes("Job") || item.href.includes("/jobs")),
		Academy: allowedItems.filter((item) => item.href.includes("/academy")),
		"LocalHub Platform": allowedItems.filter((item) => item.href.includes("/localhub")),
		Administration: allowedItems.filter((item) => item.href.includes("/admin/")),
	};

	return (
		<div className="flex flex-col h-full">
			{/* User info */}
			<div className="flex-shrink-0 flex items-center px-6 py-4">
				<div className="flex items-center space-x-3 w-full">
					<Avatar className="h-10 w-10">
						<AvatarImage src={profile?.avatar_url || (user?.email ? `https://vercel.com/api/www/avatar?u=${user.email.split("@")[0]}&s=80` : undefined)} alt={profile?.displayName || user?.email} />
						<AvatarFallback>{profile?.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-foreground dark:text-white truncate">{profile?.displayName || "Loading..."}</p>
						<p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">{user.email}</p>
						<div className="flex items-center space-x-1 mt-1">
							{userRoles.slice(0, 2).map((role) => (
								<Badge key={role} variant="secondary" className="text-xs px-1 py-0">
									{role.replace("_", " ")}
								</Badge>
							))}
							{userRoles.length > 2 && (
								<Badge variant="outline" className="text-xs px-1 py-0">
									+{userRoles.length - 2}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{/* Navigation */}
			<nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
				{Object.entries(categories).map(([categoryName, items]) => {
					if (items.length === 0) return null;

					return (
						<div key={categoryName}>
							<h3 className="px-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">{categoryName}</h3>
							<div className="mt-2 space-y-1">
								{items.map((item) => {
									const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
									const Icon = item.icon;

									return (
										<Link
											key={item.name}
											href={item.href}
											onClick={onNavigate}
											className={`
												group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
												${isActive ? "bg-primary/10 dark:bg-primary text-primary dark:text-primary/80" : "text-muted-foreground dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted hover:text-foreground dark:hover:text-white"}
											`}
										>
											<Icon className="mr-3 h-5 w-5 flex-shrink-0" />
											<div className="flex-1">
												<div>{item.name}</div>
												{item.description && <div className="text-xs text-muted-foreground dark:text-muted-foreground">{item.description}</div>}
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					);
				})}
			</nav>

			{/* User level indicator */}
			<div className="flex-shrink-0 p-4">
				<Card>
					<CardContent className="p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">Access Level</p>
								<p className="text-sm font-semibold">{userLevel}</p>
							</div>
							<Badge variant="outline" className="text-xs">
								{RoleManager.getHighestRole(userRoles) || "user"}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

/**
 * Dashboard header with notifications and user menu
 * Updated to reflect Business Directory > Field Management > LocalHub hierarchy
 */
function DashboardHeader({ user, profile, logout }) {
	const [showUserMenu, setShowUserMenu] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			logger.info("User logged out from dashboard", {
				userId: user.id,
			});
		} catch (error) {
			logger.error("Logout failed:", error);
		}
	};

	return (
		<header className="bg-white dark:bg-card shadow-sm border-b border-border dark:border-border">
			<div className="flex items-center justify-between px-6 py-4">
				{/* Mobile spacing */}
				<div className="md:hidden w-12"></div>

				{/* Title - emphasizing Business Directory platform */}
				<div className="flex-1">
					<h1 className="text-xl font-semibold text-foreground dark:text-white">Thorbis Business Directory</h1>
					<p className="text-sm text-muted-foreground dark:text-muted-foreground">Personal Dashboard</p>
				</div>

				{/* Right side - notifications and user menu */}
				<div className="flex items-center space-x-4">
					{/* Notifications */}
					<ProtectedComponent permission={PERMISSIONS.PROFILE_READ}>
						<Button variant="ghost" size="sm" className="relative">
							<Bell className="h-5 w-5" />
							{/* Notification badge would go here */}
						</Button>
					</ProtectedComponent>

					{/* User menu */}
					<div className="relative">
						<Button variant="ghost" className="flex items-center space-x-2 p-2" onClick={() => setShowUserMenu(!showUserMenu)}>
							<Avatar className="h-8 w-8">
								<AvatarImage src={profile?.avatar_url || (user?.email ? `https://vercel.com/api/www/avatar?u=${user.email.split("@")[0]}&s=64` : undefined)} alt={profile?.displayName || user?.email} />
								<AvatarFallback>{profile?.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
							</Avatar>
							<ChevronDown className="h-4 w-4" />
						</Button>

						{/* User menu dropdown */}
						{showUserMenu && (
							<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card rounded-md shadow-lg py-1 z-50 border border-border dark:border-border">
								<Link href="/dashboard/user/profile" className="block px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted" onClick={() => setShowUserMenu(false)}>
									<User className="inline-block mr-2 h-4 w-4" />
									Profile
								</Link>
								<Link href="/dashboard/user/settings" className="block px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted" onClick={() => setShowUserMenu(false)}>
									<Settings className="inline-block mr-2 h-4 w-4" />
									Settings
								</Link>
								<Separator className="my-1" />
								<button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted">
									<LogOut className="inline-block mr-2 h-4 w-4" />
									Sign out
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

/**
 * Dashboard stats cards component
 */
export function DashboardStats({ stats }) {
	// Icon mapping for client component compatibility
	const iconMap = {
		Users: User,
		Building: Building,
		MessageSquare: FileText,
		AlertTriangle: AlertTriangle,
		TrendingUp: TrendingUp,
		BarChart3: BarChart3,
		Star: Star,
		Eye: Eye,
		Edit: Edit,
		Plus: Plus,
		Shield: Shield,
		Settings: Settings,
		Bell: Bell,
		Briefcase: Briefcase,
		Gavel: Gavel,
		MapPin: MapPin,
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{stats.map((stat, index) => {
				const IconComponent = typeof stat.icon === "string" ? iconMap[stat.icon] || User : stat.icon;
				return (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
							<IconComponent className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							{stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

/**
 * Quick actions component
 */
export function DashboardQuickActions({ actions }) {
	const { checkPermission } = usePermissions();

	// Icon mapping for client component compatibility
	const iconMap = {
		Users: User,
		Building: Building,
		MessageSquare: FileText,
		AlertTriangle: AlertTriangle,
		TrendingUp: TrendingUp,
		BarChart3: BarChart3,
		Star: Star,
		Eye: Eye,
		Edit: Edit,
		Plus: Plus,
		Shield: Shield,
		Settings: Settings,
		Bell: Bell,
		Briefcase: Briefcase,
		Gavel: Gavel,
		MapPin: MapPin,
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
				<CardDescription>Common tasks and shortcuts</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{actions.map((action, index) => {
						const IconComponent = typeof action.icon === "string" ? iconMap[action.icon] || User : action.icon;
						return (
							<ProtectedComponent key={index} permission={action.permission} showFallback={false}>
								<Link href={action.href}>
									<Button variant="outline" className="w-full justify-start h-auto p-4">
										<IconComponent className="h-5 w-5 mr-3" />
										<div className="text-left">
											<div className="font-medium">{action.title}</div>
											<div className="text-xs text-muted-foreground">{action.description}</div>
										</div>
									</Button>
								</Link>
							</ProtectedComponent>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
