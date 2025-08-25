export const metadata = {
	title: "Change Orders | Projects",
	description: "Manage project change orders and approvals.",
};

export default function ChangeOrdersPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Change Orders",
		description: "Manage project change orders and approvals.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Change Orders</h1>
			<p className="text-muted-foreground">Manage project change orders and approvals.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
