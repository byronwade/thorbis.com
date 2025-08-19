export const metadata = {
	title: "Beauty Salon Software – Appointments, POS, CRM | Thorbis",
	description: "Manage bookings, staff schedules, POS, memberships, and marketing in one easy platform for salons and spas.",
	keywords: ["salon software", "spa software", "salon booking system", "salon POS", "salon CRM", "membership management", "beauty salon scheduling"],
	alternates: { canonical: "https://thorbis.com/beauty-salon-software" },
	openGraph: {
		title: "Beauty Salon Software – Grow Bookings",
		description: "Appointments, POS, memberships, and marketing automation.",
		type: "website",
		url: "https://thorbis.com/beauty-salon-software",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Beauty Salon Software")}&description=${encodeURIComponent("Appointments, POS, memberships, and marketing automation.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Beauty Salon Software",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Beauty Salon Software – Grow Bookings",
		description: "Appointments, POS, memberships, and marketing automation.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Beauty Salon Software")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Beauty Salon Software",
		description: "Appointments, POS, memberships, and CRM for salons and spas.",
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
			{ "@type": "ListItem", position: 2, name: "Beauty Salon Software", item: "https://thorbis.com/beauty-salon-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function BeautySalonSoftware() {
	const features = [
		{ title: "Appointments & Schedules", points: ["Online booking", "Waitlist & reminders"] },
		{ title: "POS & Memberships", points: ["Packages & loyalty", "Payments & tips"] },
		{ title: "CRM & Marketing", points: ["Campaigns & reviews", "No-shows reduction"] },
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
					<p className="text-sm text-muted-foreground">Loved by salons & spas • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="mx-auto space-y-4 max-w-6xl text-center">
				<h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Beauty Salon Software</h1>
				<p className="mx-auto max-w-3xl text-muted-foreground">Delight clients with seamless booking and checkout while growing revenue.</p>
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
					<h2 className="text-3xl font-bold">Grow bookings and memberships</h2>
					<p className="mt-2 opacity-90">Online booking, POS, memberships, and marketing in one place.</p>
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
						<div className="font-semibold">Do you support packages and memberships?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Sell packages, memberships, and loyalty benefits.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I reduce no‑shows?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Automated reminders and waitlist tools reduce no‑shows.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support packages and memberships?", acceptedAnswer: { "@type": "Answer", text: "Yes. Sell packages, memberships, and loyalty benefits." } },
								{ "@type": "Question", name: "Can I reduce no‑shows?", acceptedAnswer: { "@type": "Answer", text: "Yes. Automated reminders and waitlist tools reduce no‑shows." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
