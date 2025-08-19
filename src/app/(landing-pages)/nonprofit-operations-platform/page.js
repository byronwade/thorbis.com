// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Nonprofit Operations Platform – Programs, Donors, Compliance | Thorbis",
		description: "Manage programs and volunteers, track donors and grants, and report outcomes with audit-ready records.",
		path: "/nonprofit-operations-platform",
		keywords: ["nonprofit operations platform", "program management", "volunteers scheduling", "donor and grants", "outcome reporting", "audit trails"],
	});
}

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Nonprofit Operations Platform",
		description: "Programs, volunteers, donors, grants, and outcome reporting.",
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
			{ "@type": "ListItem", position: 2, name: "Nonprofit Operations Platform", item: "https://thorbis.com/nonprofit-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function NonprofitOperationsPlatform() {
	const features = [
		{ title: "Programs & Volunteers", points: ["Schedules", "Attendance & outcomes"] },
		{ title: "Donors & Grants", points: ["Fundraising", "Attribution"] },
		{ title: "Compliance & Reporting", points: ["Audit trails", "Stakeholder reports"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Nonprofit Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Focus on impact while we simplify operations and reporting.</p>
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
