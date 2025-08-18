import { isEnabled } from "@/lib/flags/server";

export default async function UserJobsLayout({ children }) {
	const on = await isEnabled("dashboardJobs");
	if (!on) {
		return (
			<div className="container mx-auto px-4 py-16">
				<h1 className="text-2xl font-semibold">Jobs module is not available</h1>
				<p className="text-muted-foreground mt-2">Please check back soon.</p>
			</div>
		);
	}
	return children;
}
