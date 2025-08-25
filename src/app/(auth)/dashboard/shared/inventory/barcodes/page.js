export const metadata = {
	title: "Barcodes | Inventory",
	description: "Optional barcode management for parts and equipment.",
};

export default function BarcodesPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Barcodes",
		description: "Optional barcode management for parts and equipment.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Barcodes</h1>
			<p className="text-muted-foreground">Optional barcode management for parts and equipment.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
