export const metadata = {
	title: "Projects List | Construction",
	description: "View and filter projects.",
};

export default function ProjectsListPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Projects List",
		description: "View and filter projects.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Projects List</h1>
			<p className="text-muted-foreground">View and filter projects.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
