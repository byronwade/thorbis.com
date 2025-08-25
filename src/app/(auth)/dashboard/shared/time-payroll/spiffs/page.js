export const metadata = {
	title: "SPIFFs | Time & Payroll",
	description: "Configure SPIFFs and incentive payouts.",
};

export default function SpiffsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "SPIFFs",
		description: "Configure SPIFFs and incentive payouts.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">SPIFFs</h1>
			<p className="text-muted-foreground">Configure SPIFFs and incentive payouts.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
