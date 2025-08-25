export const metadata = {
	title: "Custom Fields | Settings",
	description: "Create and manage custom fields across entities.",
};

export default function CustomFieldsSettingsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Custom Fields",
		description: "Create and manage custom fields across entities.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Custom Fields</h1>
			<p className="text-muted-foreground">Create and manage custom fields across entities.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
