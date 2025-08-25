export const metadata = {
	title: "Tax Zones | Settings",
	description: "Configure tax jurisdictions and rules.",
};

export default function TaxZonesPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Tax Zones",
		description: "Configure tax jurisdictions and rules.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Tax Zones</h1>
			<p className="text-muted-foreground">Configure tax jurisdictions and rules.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
