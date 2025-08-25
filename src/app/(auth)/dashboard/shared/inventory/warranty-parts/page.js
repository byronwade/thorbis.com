export const metadata = {
	title: "Warranty Parts | Inventory",
	description: "Track warranty parts usage, returns, and credits.",
};

export default function WarrantyPartsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Warranty Parts",
		description: "Track warranty parts usage, returns, and credits.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Warranty Parts</h1>
			<p className="text-muted-foreground">Track warranty parts usage, returns, and credits.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
