"use client";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";
import { useAuth } from "@context/auth-context";

export default function UserRootLayout({ children }) {
    const { user, userRoles, isAuthenticated, initialized } = useAuth();
    // Rely on global guards. No client redirects or loaders here to avoid loops.
    console.log("User:", user);
    console.log("User Roles:", userRoles);

	return (
		<UnifiedDashboardLayout dashboardType="user">
			<main className="flex flex-col">{children}</main>
		</UnifiedDashboardLayout>
	);
}
