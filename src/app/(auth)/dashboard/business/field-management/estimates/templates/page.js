export const metadata = {
	title: "Estimate Templates | Estimates",
	description: "Manage reusable estimate templates for common services.",
};

export default function EstimateTemplatesPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Estimate Templates",
		description: "Manage reusable estimate templates for common services.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Estimate Templates</h1>
			<p className="text-muted-foreground">Manage reusable estimate templates for common services.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
