export const metadata = {
	title: "Bundles (Kits) | Pricebook",
	description: "Create bundled service/product kits for proposals.",
};

export default function PricebookBundlesPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Bundles (Kits)",
		description: "Create bundled service/product kits for proposals.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Bundles (Kits)</h1>
			<p className="text-muted-foreground">Create bundled service/product kits for proposals.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
