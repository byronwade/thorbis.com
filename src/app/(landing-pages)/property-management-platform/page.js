export const metadata = {
	title: "Property Management Platform – Units, Work Orders, Billing | Thorbis",
	description: "Manage units and tenants, handle work orders and vendors, and automate billing and renewals.",
	keywords: ["property management software", "tenant portal", "work order management", "vendor management", "automated billing", "lease renewals"],
	alternates: { canonical: "https://thorbis.com/property-management-platform" },
	openGraph: {
		title: "Property Management Platform – Modern Ops",
		description: "Units, tenants, work orders, vendors, and billing.",
		type: "website",
		url: "https://thorbis.com/property-management-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Property Management Platform")}&description=${encodeURIComponent("Units, tenants, work orders, vendors, and billing.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Property Management Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Property Management Platform – Modern Ops",
		description: "Units, tenants, work orders, vendors, and billing.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Property Management Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Property Management Platform",
		description: "Units & tenants, work orders & vendors, billing & renewals.",
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
			{ "@type": "ListItem", position: 2, name: "Property Management Platform", item: "https://thorbis.com/property-management-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function PropertyManagementPlatform() {
	const features = [
		{ title: "Units & Tenants", points: ["Applications", "Portals & payments"] },
		{ title: "Work Orders & Vendors", points: ["Scheduling", "Photos & approvals"] },
		{ title: "Billing & Renewals", points: ["Auto-invoices", "Notifications"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Property Management Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Streamline operations across units, tenants, and vendors.</p>
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
