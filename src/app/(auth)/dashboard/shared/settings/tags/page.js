export const metadata = {
	title: "Tags | Settings",
	description: "Manage smart tags for customers, jobs, and equipment.",
};

export default function TagsSettingsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Tags Settings",
		description: "Manage smart tags for customers, jobs, and equipment.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Tags</h1>
			<p className="text-muted-foreground">Manage smart tags for customers, jobs, and equipment.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
