export const metadata = {
	title: "Dispatch | Schedule",
	description: "Live dispatch board for assigning and routing jobs.",
};

export default function DispatchPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Dispatch",
		description: "Live dispatch board for assigning and routing jobs.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Dispatch</h1>
			<p className="text-muted-foreground">Live dispatch board for assigning and routing jobs.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
