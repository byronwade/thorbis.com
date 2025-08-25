export const metadata = {
	title: "Shifts | Business Schedule",
	description: "Create and manage technician shifts and coverage windows.",
};

export default function ShiftsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Shifts",
		description: "Create and manage technician shifts and coverage windows.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Shifts</h1>
			<p className="text-muted-foreground">Create and manage technician shifts and coverage windows.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}
