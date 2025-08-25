export const metadata = {
	title: "Adjustments | Inventory",
	description: "Adjust inventory quantities and reconcile differences.",
};

export default function AdjustmentsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Adjustments",
		description: "Adjust inventory quantities and reconcile differences.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Adjustments</h1>
			<p className="text-muted-foreground">Adjust inventory quantities and reconcile differences.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
