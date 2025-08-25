export const metadata = {
	title: "Pricebook Versions | Pricebook",
	description: "Draft, review, and publish pricebook versions.",
};

export default function PricebookVersionsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Pricebook Versions",
		description: "Draft, review, and publish pricebook versions.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Pricebook Versions</h1>
			<p className="text-muted-foreground">Draft, review, and publish pricebook versions.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
