export const metadata = {
	title: "Transfers | Inventory",
	description: "Transfer inventory between locations and trucks.",
};

export default function TransfersPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Transfers",
		description: "Transfer inventory between locations and trucks.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Transfers</h1>
			<p className="text-muted-foreground">Transfer inventory between locations and trucks.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
