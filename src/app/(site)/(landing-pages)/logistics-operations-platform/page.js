export const metadata = {
	title: "Logistics Operations Platform – Routing, Fleet, Compliance | Thorbis",
	description: "Plan routes, manage fleet & drivers, capture delivery proof, and monitor performance with compliance.",
	keywords: ["logistics operations", "route planning software", "fleet management", "driver safety", "delivery proof", "on-time delivery analytics"],
	alternates: { canonical: "https://thorbis.com/logistics-operations-platform" },
	openGraph: {
		title: "Logistics Operations Platform – On-Time Delivery",
		description: "Routing, fleet management, delivery proof, and analytics.",
		type: "website",
		url: "https://thorbis.com/logistics-operations-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Logistics Operations Platform")}&description=${encodeURIComponent("Routing, fleet management, delivery proof, and analytics.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Logistics Operations Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Logistics Operations Platform – On-Time Delivery",
		description: "Routing, fleet management, delivery proof, and analytics.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Logistics Operations Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Logistics Operations Platform",
		description: "Routing, fleet, delivery proof, and analytics with compliance controls.",
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
			{ "@type": "ListItem", position: 2, name: "Logistics Operations Platform", item: "https://thorbis.com/logistics-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function LogisticsOperationsPlatform() {
	const features = [
		{ title: "Routing & Dispatch", points: ["Optimized routes", "Live ETAs"] },
		{ title: "Fleet & Drivers", points: ["Maintenance", "Time & safety"] },
		{ title: "Proof & Analytics", points: ["Photos & signatures", "On-time & cost KPIs"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Logistics Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Deliver on time with optimized routes and full visibility.</p>
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
