"use client";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";
import { useAuth } from "@context/auth-context";

export default function LocalHubLayout({ children }) {
	const { user, userRoles } = useAuth();
	// Rely on global guard. Avoid client redirects/loaders here.
	console.log("User:", user);
	console.log("User Roles:", userRoles);

	return (
		<UnifiedDashboardLayout dashboardType="localhub">
			<main className="flex flex-col">{children}</main>
		</UnifiedDashboardLayout>
	);
}
