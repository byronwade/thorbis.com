export const metadata = {
	title: "API Keys & Webhooks | Settings",
	description: "Manage API keys rotation and outbound webhooks.",
};

export default function ApiKeysWebhooksPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "API Keys & Webhooks",
		description: "Manage API keys rotation and outbound webhooks.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">API Keys & Webhooks</h1>
			<p className="text-muted-foreground">Manage API keys rotation and outbound webhooks.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
