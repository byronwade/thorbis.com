export const metadata = {
	title: "Proposals / Options | Estimates",
	description: "Build good-better-best proposal presentations for customers.",
};

export default function ProposalsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Proposals / Options",
		description: "Build good-better-best proposal presentations for customers.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Proposals / Options</h1>
			<p className="text-muted-foreground">Build good-better-best proposal presentations for customers.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
