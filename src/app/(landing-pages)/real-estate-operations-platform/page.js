// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Real Estate Operations Platform – Listings, Showings, Deals | Thorbis",
		description: "Manage listings and showings, track offers and deals, and coordinate agents and marketing.",
		path: "/real-estate-operations-platform",
		keywords: ["real estate operations", "real estate CRM", "listing management", "showings scheduler", "offers and deals", "agent coordination"],
	});
}

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Real Estate Operations Platform",
		description: "Listings, showings, offers, and agent coordination.",
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
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com" },
			{ "@type": "ListItem", position: 2, name: "Real Estate Operations Platform", item: "https://thorbis.com/real-estate-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RealEstateOperationsPlatform() {
	const features = [
		{ title: "Listings & Showings", points: ["Open houses", "Feedback & follow-ups"] },
		{ title: "Offers & Deals", points: ["eSignature", "Stages & tasks"] },
		{ title: "Agents & Marketing", points: ["Campaigns", "Reviews & referrals"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Real Estate Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Coordinate listings to closings with fewer clicks and more clarity.</p>
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
