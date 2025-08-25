export const metadata = {
	title: "Capacity Planning | Business Schedule",
	description: "Plan technician capacity and appointment load for optimal scheduling.",
};

export default function CapacityPlanningPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Capacity Planning",
		description: "Plan technician capacity and appointment load for optimal scheduling.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Capacity Planning</h1>
			<p className="text-muted-foreground">Plan technician capacity and appointment load for optimal scheduling.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
