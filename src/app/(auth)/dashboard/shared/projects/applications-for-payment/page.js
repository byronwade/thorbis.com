export const metadata = {
	title: "Applications for Payment | Projects",
	description: "Manage AIA-style applications for payment.",
};

export default function ApplicationsForPaymentPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Applications for Payment",
		description: "Manage AIA-style applications for payment.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Applications for Payment</h1>
			<p className="text-muted-foreground">Manage AIA-style applications for payment.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
