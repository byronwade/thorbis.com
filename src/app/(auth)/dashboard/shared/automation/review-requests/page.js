export const metadata = {
	title: "Review Requests Automation | Automation",
	description: "Automate post-job review request messages and timing.",
};

export default function ReviewRequestsAutomationPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Review Requests Automation",
		description: "Automate post-job review request messages and timing.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Review Requests Automation</h1>
			<p className="text-muted-foreground">Automate post-job review request messages and timing.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
