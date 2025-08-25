export const metadata = {
	title: "Projects | Construction",
	description: "Manage construction projects and financials.",
};

export default function ProjectsIndexPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Projects",
		description: "Manage construction projects and financials.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Projects</h1>
			<p className="text-muted-foreground">Manage construction projects and financials.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
