export const metadata = {
	title: "Vendor Catalogs | Inventory",
	description: "Sync vendor price catalogs and update cost data.",
};

export default function VendorCatalogsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Vendor Catalogs",
		description: "Sync vendor price catalogs and update cost data.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Vendor Catalogs</h1>
			<p className="text-muted-foreground">Sync vendor price catalogs and update cost data.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
