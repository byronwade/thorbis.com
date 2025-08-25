export const metadata = {
	title: "Efficiency Reports | Performance",
	description: "Operational efficiency and utilization reports.",
};

export default function EfficiencyReportsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Efficiency Reports",
		description: "Operational efficiency and utilization reports.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Efficiency Reports</h1>
			<p className="text-muted-foreground">Operational efficiency and utilization reports.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
