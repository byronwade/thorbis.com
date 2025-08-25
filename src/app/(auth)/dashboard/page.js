"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { ProtectedRoute } from "@features/auth";
import { useAuth } from "@context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Building, Users, Home, Settings } from "lucide-react";

/**
 * Unified Dashboard Router
 * Shows dashboard selection or redirects to appropriate dashboard based on user role
 */
export default function DashboardPage() {
	// TEMPORARILY DISABLED - Auth protection removed for development
	// return (
	// 	<ProtectedRoute requireEmailVerification={true}>
	// 		<DashboardRouter />
	// 	</ProtectedRoute>
	// );
	
	// Direct access without auth
	return <DashboardRouter />;
}

function DashboardRouter() {
	const router = useRouter();
	// TEMPORARILY DISABLED - Auth check removed for development
	// const { user, initialized } = useAuth();

	// Remove automatic redirect - let users choose their dashboard
	// useEffect(() => {
	// 	// TEMPORARILY DISABLED - Auth check removed for development
	// 	// if (!initialized) return;
	// 	// if (!user) return;
	// 	// const redirectPath = getDashboardPath(user);
	// 	// router.replace(redirectPath);
	// 	
	// 	// Direct redirect to business dashboard without auth
	// 	router.replace("/dashboard/business");
	// }, [router]);

	const dashboardOptions = [
		{
			title: "Business Dashboard",
			description: "Manage your business operations, customers, and services",
			icon: Building,
			href: "/dashboard/business",
			color: "text-blue-600",
			bgColor: "bg-blue-50 dark:bg-blue-950"
		},
		{
			title: "User Dashboard", 
			description: "View your profile, reviews, and saved businesses",
			icon: Users,
			href: "/dashboard/user",
			color: "text-green-600",
			bgColor: "bg-green-50 dark:bg-green-950"
		},
		{
			title: "Admin Dashboard",
			description: "System administration and user management",
			icon: Settings,
			href: "/dashboard/admin",
			color: "text-purple-600", 
			bgColor: "bg-purple-50 dark:bg-purple-950"
		},
		{
			title: "LocalHub Dashboard",
			description: "Manage LocalHub directory and operations",
			icon: Home,
			href: "/dashboard/localhub",
			color: "text-orange-600",
			bgColor: "bg-orange-50 dark:bg-orange-950"
		}
	];

	return (
		<div className="w-full py-8">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Selection</h1>
				<p className="text-muted-foreground">Choose the dashboard that best fits your role and needs</p>
			</div>
			
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{dashboardOptions.map((option) => (
					<Card 
						key={option.href} 
						className="hover:shadow-lg transition-shadow cursor-pointer"
						onClick={() => router.push(option.href)}
					>
						<CardHeader>
							<div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
								<option.icon className={`h-6 w-6 ${option.color}`} />
							</div>
							<CardTitle className="text-lg">{option.title}</CardTitle>
							<CardDescription>{option.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								Access Dashboard
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

/**
 * Determine the correct dashboard path based on user data
 * Simplified to use unified business dashboard for all business users
 */
function getDashboardPath(user) {
	const userRole = user?.user_metadata?.role || user?.role || "user";
	const accountType = user?.user_metadata?.account_type || user?.account_type;

	// Admin users go to admin dashboard
	if (userRole === "admin" || userRole === "super_admin") {
		return "/dashboard/admin";
	}

	// LocalHub operators go to LocalHub dashboard
	if (userRole === "localhub_operator" || accountType === "localhub") {
		return "/dashboard/localhub";
	}

	// All business users (including field service) now use the unified business dashboard
	// The business dashboard includes all functionality programmatically
	return "/dashboard/business";
}
