export const metadata = {
	title: "Budget vs Actual | Projects",
	description: "Track project budgets versus actuals.",
};

export default function BudgetVsActualPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Budget vs Actual",
		description: "Track project budgets versus actuals.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Budget vs Actual</h1>
			<p className="text-muted-foreground">Track project budgets versus actuals.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
