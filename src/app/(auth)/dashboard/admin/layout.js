"use client";
import UnifiedHeader from "@components/shared/unified-header";
import { AppSidebar } from "@components/admin/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@components/ui/sidebar";
import { useAuth } from "@context/auth-context";

export default function AdminLayout({ children }) {
	const { user, userRoles } = useAuth();
	// Rely on global guards; avoid local redirects/loaders to prevent loops
	console.log("User:", user);
	console.log("User Roles:", userRoles);

	return (
		<SidebarProvider>
            <div className="flex flex-col w-full min-h-screen bg-white dark:bg-neutral-900">
				{/* Compact Dashboard Header with Icon-Only Design */}
                <UnifiedHeader dashboardType="admin" />

							{/* Content area with sidebar */}
			<div className="relative flex flex-1 w-full">
				<AppSidebar className="h-[calc(100vh-98px)] top-[98px] fixed left-0 z-[9998]" />
				<SidebarInset className="flex-1 w-full min-w-0">
					{/* Minimalistic Toolbar */}
					<div className="flex items-center w-full h-10 px-4 border-b backdrop-blur-sm border-neutral-800/20 dark:border-neutral-700/20">
						<SidebarTrigger className="w-7 h-7" />
					</div>

					{/* Main Content Area - Account for compact header (98px) + toolbar (40px) */}
					<div className="w-full h-[calc(100vh-138px)] p-6 overflow-auto">{children}</div>
				</SidebarInset>
			</div>
			</div>
		</SidebarProvider>
	);
}
