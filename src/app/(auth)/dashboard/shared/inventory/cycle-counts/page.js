export const metadata = {
	title: "Cycle Counts | Inventory",
	description: "Perform cycle counts and reconcile inventory discrepancies.",
};

export default function CycleCountsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Cycle Counts",
		description: "Perform cycle counts and reconcile inventory discrepancies.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Cycle Counts</h1>
			<p className="text-muted-foreground">Perform cycle counts and reconcile inventory discrepancies.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
