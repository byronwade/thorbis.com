export const metadata = {
	title: "Time Off Requests | Business Schedule",
	description: "Manage employee time-off requests and scheduling conflicts.",
};

export default function TimeOffRequestsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Time Off Requests",
		description: "Manage employee time-off requests and scheduling conflicts.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Time Off Requests</h1>
			<p className="text-muted-foreground">Manage employee time-off requests and scheduling conflicts.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
