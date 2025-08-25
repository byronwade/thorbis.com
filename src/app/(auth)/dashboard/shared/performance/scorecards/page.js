export const metadata = {
	title: "Scorecards | Performance",
	description: "Technician and team performance scorecards.",
};

export default function ScorecardsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Scorecards",
		description: "Technician and team performance scorecards.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Scorecards</h1>
			<p className="text-muted-foreground">Technician and team performance scorecards.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
