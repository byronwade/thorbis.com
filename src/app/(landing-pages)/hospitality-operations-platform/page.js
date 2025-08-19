// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Hospitality Operations Platform – Reservations, Staffing, POS | Thorbis",
		description: "Run hospitality operations with reservations, staffing, POS, and guest engagement in one place.",
		path: "/hospitality-operations-platform",
		keywords: ["hospitality operations platform", "reservations and events", "staff scheduling", "POS for hospitality", "guest engagement"],
	});
}

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Hospitality Operations Platform",
		description: "Reservations, staffing, POS, and guest engagement.",
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
			{ "@type": "ListItem", position: 2, name: "Hospitality Operations Platform", item: "https://thorbis.com/hospitality-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HospitalityOperationsPlatform() {
	const features = [
		{ title: "Reservations & Events", points: ["Capacity planning", "Table & room management"] },
		{ title: "Staffing & POS", points: ["Shift scheduling", "Payments & tips"] },
		{ title: "Guest Engagement", points: ["Campaigns & reviews", "Loyalty"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Hospitality Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Deliver excellent guest experiences with streamlined operations.</p>
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
