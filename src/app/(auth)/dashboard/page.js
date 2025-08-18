"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@features/auth";
import { useAuth } from "@context/auth-context";

/**
 * Unified Dashboard Router
 * Redirects all users to the consolidated business dashboard
 */
export default function DashboardPage() {
	return (
		<ProtectedRoute requireEmailVerification={true}>
			<DashboardRouter />
		</ProtectedRoute>
	);
}

function DashboardRouter() {
	const router = useRouter();
	const { user, initialized } = useAuth();

	useEffect(() => {
		if (!initialized) return;
		if (!user) return;
		const redirectPath = getDashboardPath(user);
		router.replace(redirectPath);
	}, [initialized, user, router]);

	return null;
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
