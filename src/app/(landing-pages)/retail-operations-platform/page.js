export const metadata = {
	title: "Retail Operations Platform – POS, Inventory, Footfall | Thorbis",
	description: "Unify POS, inventory, staffing, and footfall analytics to optimize conversion and revenue.",
	keywords: ["retail operations", "retail POS platform", "inventory management", "footfall analytics", "store staffing optimization", "conversion analytics"],
	alternates: { canonical: "https://thorbis.com/retail-operations-platform" },
	openGraph: {
		title: "Retail Operations Platform – Convert More",
		description: "POS, inventory, staffing, and footfall analytics.",
		type: "website",
		url: "https://thorbis.com/retail-operations-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Retail Operations Platform")}&description=${encodeURIComponent("POS, inventory, staffing, and footfall analytics.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Retail Operations Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Retail Operations Platform – Convert More",
		description: "POS, inventory, staffing, and footfall analytics.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Retail Operations Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Retail Operations Platform",
		description: "POS, inventory, staffing, and footfall analytics for retail.",
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
			{ "@type": "ListItem", position: 2, name: "Retail Operations Platform", item: "https://thorbis.com/retail-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RetailOperationsPlatform() {
	const features = [
		{ title: "POS & Staffing", points: ["Peak-hour coverage", "Checkout speed"] },
		{ title: "Inventory & Merchandising", points: ["Reorders & transfers", "Zones & planograms"] },
		{ title: "Footfall & Conversion", points: ["Traffic heatmaps", "Zone conversion"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Retail Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Turn store traffic into revenue with data-driven operations.</p>
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
