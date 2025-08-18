import { isEnabled, evaluateAllFlags } from "@/lib/flags/server";

export default async function DashboardRootLayout({ children }) {
	const coreOn = await isEnabled("dashboardCore");
	if (!coreOn) {
		return (
			<div className="container mx-auto px-4 py-16">
				<h1 className="text-2xl font-semibold">Dashboard is not available</h1>
				<p className="text-muted-foreground mt-2">Please check back soon.</p>
			</div>
		);
	}
	const ff = await evaluateAllFlags();
	const dataAttrs = {
		// Dashboard module flags
		"data-flag-dashboard-analytics": ff.dashboardAnalytics ? "1" : "0",
		"data-flag-dashboard-billing": ff.dashboardBilling ? "1" : "0",
		"data-flag-dashboard-messaging": ff.dashboardMessaging ? "1" : "0",
		"data-flag-dashboard-integrations": ff.dashboardIntegrations ? "1" : "0",
		"data-flag-dashboard-domains": ff.dashboardDomains ? "1" : "0",
		"data-flag-dashboard-jobs": ff.dashboardJobs ? "1" : "0",
		"data-flag-dashboard-reviews": ff.dashboardReviews ? "1" : "0",
		"data-flag-dashboard-support": ff.dashboardSupport ? "1" : "0",

		// Business profile section flags
		"data-flag-profile-core": ff.profileCore ? "1" : "0",
		"data-flag-profile-photos": ff.profilePhotos ? "1" : "0",
		"data-flag-profile-reviews": ff.profileReviews ? "1" : "0",
		"data-flag-profile-promotions": ff.profilePromotions ? "1" : "0",
		"data-flag-profile-menus": ff.profileMenus ? "1" : "0",
		"data-flag-profile-hours": ff.profileHours ? "1" : "0",
		"data-flag-profile-booking": ff.profileBooking ? "1" : "0",
		"data-flag-profile-messaging": ff.profileMessaging ? "1" : "0",
		"data-flag-profile-map": ff.profileMap ? "1" : "0",
		"data-flag-profile-certification-badge": ff.profileCertificationBadge ? "1" : "0",

		// Demo flags for dashboards (exposed for client hints/badges only)
		"data-demo-dashboard-business": ff.dashboardDemoBusiness ? "1" : "0",
		"data-demo-dashboard-localhub": ff.dashboardDemoLocalhub ? "1" : "0",
		"data-demo-dashboard-admin": ff.dashboardDemoAdmin ? "1" : "0",
	};
	return (
		<div className="min-h-screen bg-white dark:bg-neutral-900 text-foreground" {...dataAttrs}>
			{children}
		</div>
	);
}
