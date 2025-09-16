export const metadata = {
	title: "Energy Services Software – Dispatch, Assets, Compliance | Thorbis",
	description: "Coordinate field service for energy and utilities: dispatch, assets, inspections, and compliance reporting.",
	keywords: ["energy services software", "utilities field service", "dispatch and routing", "asset tracking", "inspections", "compliance reporting"],
	alternates: { canonical: "https://thorbis.com/energy-services-software" },
	openGraph: {
		title: "Energy Services Software – Reliable Operations",
		description: "Dispatch, asset tracking, inspections, and compliance.",
		type: "website",
		url: "https://thorbis.com/energy-services-software",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Energy Services Software")}&description=${encodeURIComponent("Dispatch, asset tracking, inspections, and compliance.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Energy Services Software",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Energy Services Software – Reliable Operations",
		description: "Dispatch, asset tracking, inspections, and compliance.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Energy Services Software")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Energy Services Software",
		description: "Field service for energy and utilities with dispatch, assets, and compliance.",
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
			{ "@type": "ListItem", position: 2, name: "Energy Services Software", item: "https://thorbis.com/energy-services-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function EnergyServicesSoftware() {
	const features = [
		{ title: "Dispatch & Routing", points: ["Priority jobs", "Crew zones"] },
		{ title: "Assets & Inspections", points: ["Checklists", "Photos & records"] },
		{ title: "Compliance", points: ["Policies & audits", "Reporting"] },
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
					<p className="text-sm text-muted-foreground">Utility‑grade reliability • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Energy Services Software</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Reliable field operations for energy and utilities.</p>
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
					<h2 className="text-3xl font-bold">Dispatch, assets, and compliance</h2>
					<p className="mt-2 opacity-90">Coordinate field crews with confidence and clear reporting.</p>
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
						<div className="font-semibold">Do you support compliance reporting?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Built‑in reporting and export for audits.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I manage crew zones?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Dispatch with zones, priorities, and skills.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support compliance reporting?", acceptedAnswer: { "@type": "Answer", text: "Yes. Built‑in reporting and export for audits." } },
								{ "@type": "Question", name: "Can I manage crew zones?", acceptedAnswer: { "@type": "Answer", text: "Yes. Dispatch with zones, priorities, and skills." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
