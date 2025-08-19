export const metadata = {
	title: "Healthcare Operations Platform – Scheduling, Compliance, Billing | Thorbis",
	description: "Coordinate patient appointments, staff schedules, documentation, and billing with audit-ready compliance.",
	keywords: ["healthcare operations platform", "patient scheduling", "clinical documentation", "medical billing", "compliance and audits"],
	alternates: { canonical: "https://thorbis.com/healthcare-operations-platform" },
	openGraph: {
		title: "Healthcare Operations Platform – Coordinated Care",
		description: "Appointments, staff schedules, documentation, and billing.",
		type: "website",
		url: "https://thorbis.com/healthcare-operations-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Healthcare Operations Platform")}&description=${encodeURIComponent("Appointments, staff schedules, documentation, and billing.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Healthcare Operations Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Healthcare Operations Platform – Coordinated Care",
		description: "Appointments, staff schedules, documentation, and billing.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Healthcare Operations Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Healthcare Operations Platform",
		description: "Scheduling, documentation, and billing with compliance controls.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Healthcare Operations Platform", item: "https://thorbis.com/healthcare-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HealthcareOperationsPlatform() {
	const features = [
		{ title: "Appointments & Staff", points: ["Calendars & reminders", "Roles & permissions"] },
		{ title: "Documentation", points: ["Templates", "Checklists & signatures"] },
		{ title: "Billing & Compliance", points: ["Claims & audits", "Access controls"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Healthcare Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Streamline care delivery with reliable operations and compliance.</p>
				<div className="flex items-center justify-center gap-3">
					<a href="/signup" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-white font-semibold hover:bg-primary">
						Start free
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border px-5 py-3 font-semibold hover:bg-accent">
						Schedule demo
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				{features.map((f) => (
					<div key={f.title} className="rounded-xl border p-6 bg-card">
						<h3 className="font-bold text-lg mb-2">{f.title}</h3>
						<ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
							{f.points.map((p) => (
								<li key={p}>{p}</li>
							))}
						</ul>
					</div>
				))}
			</section>
		</main>
	);
}
