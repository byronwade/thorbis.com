export const metadata = {
	title: "eCommerce Operations Platform – Orders, Inventory, Support | Thorbis",
	description: "Unify orders, inventory, fulfillment, and customer support with analytics and automations.",
	keywords: ["ecommerce operations platform", "orders and fulfillment", "inventory management", "customer support", "SLA tracking", "churn analytics"],
	alternates: { canonical: "https://thorbis.com/ecommerce-operations-platform" },
	openGraph: {
		title: "eCommerce Operations Platform – Fulfillment & Growth",
		description: "Orders, inventory, fulfillment, and support in one place.",
		type: "website",
		url: "https://thorbis.com/ecommerce-operations-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("eCommerce Operations Platform")}&description=${encodeURIComponent("Orders, inventory, fulfillment, and support in one place.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis eCommerce Operations Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "eCommerce Operations Platform – Fulfillment & Growth",
		description: "Orders, inventory, fulfillment, and support in one place.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("eCommerce Operations Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "eCommerce Operations Platform",
		description: "Unify orders, inventory, fulfillment, and support with analytics and automations.",
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
			{ "@type": "ListItem", position: 2, name: "eCommerce Operations Platform", item: "https://thorbis.com/ecommerce-operations-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function EcommerceOperationsPlatform() {
	const features = [
		{ title: "Orders & Fulfillment", points: ["Pick/pack/ship", "Returns & exchanges"] },
		{ title: "Inventory & Catalog", points: ["Multi-location", "Bundles & variants"] },
		{ title: "Support & Analytics", points: ["Inbox & SLAs", "Cohort revenue & churn"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Fast fulfillment and support • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">eCommerce Operations Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Operate storefronts efficiently with unified inventory, fulfillment, and support.</p>
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

			{/* CTA */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center">
					<h2 className="text-3xl font-bold">Unify orders, inventory, and support</h2>
					<p className="mt-2 opacity-90">Operate storefronts efficiently and scale with automations.</p>
					<div className="mt-6 flex items-center justify-center gap-3">
						<a href="/signup" className="inline-flex items-center rounded-md bg-white text-primary px-5 py-3 font-semibold hover:bg-white/90">
							Start free
						</a>
						<a href="/contact" className="inline-flex items-center rounded-md border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">
							Schedule demo
						</a>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="max-w-6xl mx-auto mt-16">
				<h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support returns and exchanges?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Returns/exchanges workflows with stock adjustments.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I track SLAs for support?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Inbox with SLAs, tags, and analytics.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support returns and exchanges?", acceptedAnswer: { "@type": "Answer", text: "Yes. Returns/exchanges workflows with stock adjustments." } },
								{ "@type": "Question", name: "Can I track SLAs for support?", acceptedAnswer: { "@type": "Answer", text: "Yes. Inbox with SLAs, tags, and analytics." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
