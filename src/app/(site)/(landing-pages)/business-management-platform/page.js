export const metadata = {
	title: "Business Management Platform – CRM, Billing, Analytics | Thorbis",
	description: "Run your business in one place: CRM, estimates, invoicing, payments, analytics, and automations.",
	keywords: ["business management platform", "CRM and billing", "invoicing and payments", "analytics and automations", "SMB software"],
	alternates: { canonical: "https://thorbis.com/business-management-platform" },
	openGraph: {
		title: "Business Management Platform – All-in-One",
		description: "CRM, estimates, invoicing, payments, and analytics in one platform.",
		type: "website",
		url: "https://thorbis.com/business-management-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Business Management Platform")}&description=${encodeURIComponent("CRM, estimates, invoicing, payments, and analytics in one platform.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Business Management Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Business Management Platform – All-in-One",
		description: "CRM, estimates, invoicing, payments, and analytics in one platform.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Business Management Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Business Management Platform",
		description: "All-in-one CRM, billing, analytics, and automations.",
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
			{ "@type": "ListItem", position: 2, name: "Business Management Platform", item: "https://thorbis.com/business-management-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function BusinessManagementPlatform() {
	const features = [
		{ title: "CRM & Pipeline", points: ["Leads & follow-ups", "Reviews & referrals"] },
		{ title: "Estimates & Invoices", points: ["eSignature", "Online payments"] },
		{ title: "Analytics & Automations", points: ["KPI dashboards", "Campaign triggers"] },
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
					<p className="text-sm text-muted-foreground">All‑in‑one trusted by SMBs • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Business Management Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">From leads to cash—manage every step in one fast platform.</p>
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
					<h2 className="text-3xl font-bold">Run your business in one place</h2>
					<p className="mt-2 opacity-90">From leads to invoices — faster workflows and better insights.</p>
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
						<div className="font-semibold">Does Thorbis include invoicing and payments?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Create invoices, collect online payments, and track status.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I connect accounting?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. QuickBooks/Sage integrations with two‑way sync.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Does Thorbis include invoicing and payments?", acceptedAnswer: { "@type": "Answer", text: "Yes. Create invoices, collect online payments, and track status." } },
								{ "@type": "Question", name: "Can I connect accounting?", acceptedAnswer: { "@type": "Answer", text: "Yes. QuickBooks/Sage integrations with two‑way sync." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
