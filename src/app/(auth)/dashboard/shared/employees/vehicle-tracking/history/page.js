export const metadata = {
	title: "Vehicle Tracking History | Employees",
	description: "Breadcrumb history and historical GPS trails.",
};

export default function VehicleTrackingHistoryPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Vehicle Tracking History",
		description: "Breadcrumb history and historical GPS trails.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Vehicle Tracking History</h1>
			<p className="text-muted-foreground">Breadcrumb history and historical GPS trails.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
