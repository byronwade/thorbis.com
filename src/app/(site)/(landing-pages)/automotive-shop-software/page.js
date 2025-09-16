import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
	title: "Automotive Shop Software – Service Bay, POS, CRM | Thorbis",
	description: "Run your auto shop with scheduling, POS, work orders, inspections, CRM, and analytics in one fast platform.",
	keywords: ["auto repair software", "automotive shop POS", "work order management", "service bay scheduling", "auto shop CRM", "digital inspections", "garage management software"],
	alternates: { canonical: "https://thorbis.com/automotive-shop-software" },
	openGraph: {
		title: "Automotive Shop Software – Throughput & Revenue",
		description: "Service bay scheduling, POS, inspections, CRM, and analytics.",
		type: "website",
		url: "https://thorbis.com/automotive-shop-software",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Automotive Shop Software")}&description=${encodeURIComponent("Service bay scheduling, POS, inspections, CRM, and analytics.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Automotive Shop Software",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Automotive Shop Software – Throughput & Revenue",
		description: "Service bay scheduling, POS, inspections, CRM, and analytics.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Automotive Shop Software")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
	});
}

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Automotive Shop Software",
		description: "Scheduling, POS, inspections, CRM, and analytics for auto repair shops.",
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
			{ "@type": "ListItem", position: 2, name: "Automotive Shop Software", item: "https://thorbis.com/automotive-shop-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AutomotiveShopSoftware() {
	const features = [
		{ title: "Service Bay Scheduling", points: ["Capacity planning", "Route & parts readiness"] },
		{ title: "POS & Work Orders", points: ["Inspections & photos", "eSignature"] },
		{ title: "CRM & Analytics", points: ["Campaigns & reviews", "Bay throughput & comeback rate"] },
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
					<p className="text-sm text-muted-foreground">Shops grow faster on Thorbis • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Automotive Shop Software</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Increase bay utilization and revenue with an all-in-one shop system.</p>
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
					<h2 className="text-3xl font-bold">Increase bay throughput</h2>
					<p className="mt-2 opacity-90">Optimize schedules, upsell with proposals, and get paid faster.</p>
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
						<div className="font-semibold">Do you support digital inspections?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Photos, notes, and approvals with eSignature.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I sync with accounting?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. QuickBooks and Sage Intacct two‑way sync.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support digital inspections?", acceptedAnswer: { "@type": "Answer", text: "Yes. Photos, notes, and approvals with eSignature." } },
								{ "@type": "Question", name: "Can I sync with accounting?", acceptedAnswer: { "@type": "Answer", text: "Yes. QuickBooks and Sage Intacct two‑way sync." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
