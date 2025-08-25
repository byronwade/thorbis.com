export const metadata = {
	title: "Vendors | Inventory",
	description: "Manage vendors and purchasing relationships.",
};

export default function VendorsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Vendors",
		description: "Manage vendors and purchasing relationships.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
			<p className="text-muted-foreground">Manage vendors and purchasing relationships.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
