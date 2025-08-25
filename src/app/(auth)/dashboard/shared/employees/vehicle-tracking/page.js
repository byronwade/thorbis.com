export const metadata = {
	title: "Vehicle Tracking | Employees",
	description: "GPS fleet tracking and breadcrumb history.",
};

export default function VehicleTrackingPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Vehicle Tracking",
		description: "GPS fleet tracking and breadcrumb history.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Vehicle Tracking</h1>
			<p className="text-muted-foreground">GPS fleet tracking and breadcrumb history.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
