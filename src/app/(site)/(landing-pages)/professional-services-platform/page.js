export const metadata = {
	title: "Professional Services Platform – Projects, Billing, CRM | Thorbis",
	description: "Manage client work with projects, time, invoicing, retainers, and CRM in one platform.",
	keywords: ["professional services automation", "PSA software", "project time tracking", "invoicing and retainers", "services CRM", "utilization analytics"],
	alternates: { canonical: "https://thorbis.com/professional-services-platform" },
	openGraph: {
		title: "Professional Services Platform – Deliver & Get Paid",
		description: "Projects, time tracking, invoicing, retainers, and CRM.",
		type: "website",
		url: "https://thorbis.com/professional-services-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Professional Services Platform")}&description=${encodeURIComponent("Projects, time tracking, invoicing, retainers, and CRM.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Professional Services Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Professional Services Platform – Deliver & Get Paid",
		description: "Projects, time tracking, invoicing, retainers, and CRM.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Professional Services Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Professional Services Platform",
		description: "Projects, time tracking, invoicing, retainers, and CRM.",
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
			{ "@type": "ListItem", position: 2, name: "Professional Services Platform", item: "https://thorbis.com/professional-services-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function ProfessionalServicesPlatform() {
	const features = [
		{ title: "Projects & Tasks", points: ["Assignments", "Dependencies & milestones"] },
		{ title: "Time & Billing", points: ["Timesheets", "Retainers & invoices"] },
		{ title: "CRM & Analytics", points: ["Pipeline & revenue", "Utilization KPIs"] },
	];

	return (
		<main className="px-4 py-10 w-full min-h-screen bg-white dark:bg-neutral-900 sm:px-6 lg:px-8">
			<JsonLd />
			<BreadcrumbsJsonLd />
			{/* Social Proof */}
			<section className="mx-auto max-w-6xl py-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Agencies and firms trust Thorbis • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="mx-auto space-y-4 max-w-6xl text-center">
				<h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Professional Services Platform</h1>
				<p className="mx-auto max-w-3xl text-muted-foreground">Deliver excellent client work and get paid faster.</p>
				<div className="flex gap-3 justify-center items-center">
					<a href="/signup" className="inline-flex items-center px-5 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary">
						Start free
					</a>
					<a href="/contact" className="inline-flex items-center px-5 py-3 font-semibold rounded-md border hover:bg-accent">
						Schedule demo
					</a>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-6 mx-auto mt-12 max-w-6xl md:grid-cols-3">
				{features.map((f) => (
					<div key={f.title} className="p-6 rounded-xl border bg-card">
						<h3 className="mb-2 text-lg font-bold">{f.title}</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							{f.points.map((p) => (
								<li key={p}>{p}</li>
							))}
						</ul>
					</div>
				))}
			</section>
			{/* CTA */}
			<section className="mx-auto max-w-6xl mt-16">
				<div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center">
					<h2 className="text-3xl font-bold">Deliver work. Bill faster.</h2>
					<p className="mt-2 opacity-90">Projects, time, retainers, and CRM in one platform.</p>
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
			<section className="mx-auto max-w-6xl mt-16">
				<h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support retainers?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Retainers with time tracking and automatic drawdowns.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I manage utilization?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Utilization KPIs and revenue forecasting.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support retainers?", acceptedAnswer: { "@type": "Answer", text: "Yes. Retainers with time tracking and automatic drawdowns." } },
								{ "@type": "Question", name: "Can I manage utilization?", acceptedAnswer: { "@type": "Answer", text: "Yes. Utilization KPIs and revenue forecasting." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
