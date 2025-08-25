export const metadata = {
	title: "Returns | Inventory",
	description: "Manage returns to vendors and RMAs.",
};

export default function ReturnsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Returns",
		description: "Manage returns to vendors and RMAs.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Returns</h1>
			<p className="text-muted-foreground">Manage returns to vendors and RMAs.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
