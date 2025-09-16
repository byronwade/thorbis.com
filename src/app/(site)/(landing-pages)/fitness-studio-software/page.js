export const metadata = {
	title: "Fitness Studio Software – Classes, Memberships, POS | Thorbis",
	description: "Manage classes and trainers, memberships, POS, and member engagement in one platform.",
	keywords: ["fitness studio software", "gym management", "class scheduling", "memberships and POS", "member engagement"],
	alternates: { canonical: "https://thorbis.com/fitness-studio-software" },
	openGraph: {
		title: "Fitness Studio Software – Grow Memberships",
		description: "Classes & trainers, memberships, POS, and engagement.",
		type: "website",
		url: "https://thorbis.com/fitness-studio-software",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Fitness Studio Software")}&description=${encodeURIComponent("Classes & trainers, memberships, POS, and engagement.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Fitness Studio Software",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Fitness Studio Software – Grow Memberships",
		description: "Classes & trainers, memberships, POS, and engagement.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Fitness Studio Software")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Fitness Studio Software",
		description: "Classes & trainers, memberships, POS, and member engagement.",
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
			{ "@type": "ListItem", position: 2, name: "Fitness Studio Software", item: "https://thorbis.com/fitness-studio-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function FitnessStudioSoftware() {
	const features = [
		{ title: "Classes & Schedules", points: ["Trainer assignments", "Waitlists & no-show tools"] },
		{ title: "Memberships & POS", points: ["Packages", "Payments & surcharges"] },
		{ title: "Engagement", points: ["Campaigns & referrals", "Reviews & rewards"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Fitness Studio Software</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Power class management and member growth with one simple system.</p>
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
