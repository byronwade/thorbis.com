import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
	title: "Academy Learning Platform – Courses, Quizzes, Certificates | Thorbis",
	description: "Professional learning for contractors and teams: curated courses, practice quizzes, progress tracking, and completion certificates.",
	keywords: ["contractor training", "online courses", "trade certifications", "practice quizzes", "progress tracking", "learning platform"],
	alternates: { canonical: "https://thorbis.com/academy-learning-platform" },
	openGraph: {
		title: "Academy Learning Platform – Upskill Your Team",
		description: "Contractor-focused courses, quizzes, progress tracking, and certificates.",
		type: "website",
		url: "https://thorbis.com/academy-learning-platform",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Academy Learning Platform")}&description=${encodeURIComponent("Contractor-focused courses, quizzes, progress tracking, and certificates.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Academy Learning Platform",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Academy Learning Platform – Upskill Your Team",
		description: "Contractor-focused courses, quizzes, progress tracking, and certificates.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Academy Learning Platform")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
	});
}

import { Star } from "lucide-react";
import { isEnabled } from "@/lib/flags/server";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Thorbis Academy",
		description: "Learning platform with courses, quizzes, progress tracking, and certificates for contractors and operations teams.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "124" },
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com" },
			{ "@type": "ListItem", position: 2, name: "Industries", item: "https://thorbis.com/industries" },
			{ "@type": "ListItem", position: 3, name: "Academy Learning Platform", item: "https://thorbis.com/academy-learning-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function AcademyLearningPlatform() {
	const on = await isEnabled("landingPages");
	if (!on) {
		return (
			<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
				<section className="container mx-auto">
					<h1 className="text-2xl font-semibold">This landing page is not available</h1>
					<p className="text-muted-foreground mt-2">Please check back soon.</p>
				</section>
			</main>
		);
	}
	const features = [
		{ title: "Industry-Specific Courses", points: ["HVAC, Plumbing, Electrical, and more", "Beginner to Advanced levels"] },
		{ title: "Practice Quizzes", points: ["Chapter checks", "Instant feedback and explanations"] },
		{ title: "Progress & Certificates", points: ["Track progress", "Issue completion certificates"] },
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
					<p className="text-sm text-muted-foreground">Trusted by 1,200+ professionals • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Academy Learning Platform</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Train and certify your team with contractor-focused courses, quizzes, and proof of completion.</p>
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
					<h2 className="text-3xl font-bold">Ready to upskill your team?</h2>
					<p className="mt-2 opacity-90">Launch courses, track progress, and issue certificates in minutes.</p>
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
						<div className="font-semibold">Can I upload my own courses?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Add custom modules, quizzes, and certificates.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support team progress tracking?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Track completion, scores, and time spent per learner.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is there a mobile experience?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Fully responsive with offline-friendly lessons.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">How much does it cost?</div>
						<p className="mt-2 text-sm text-muted-foreground">Academy is included — create unlimited learners at no extra charge.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Can I upload my own courses?", acceptedAnswer: { "@type": "Answer", text: "Yes. Add custom modules, quizzes, and certificates." } },
								{ "@type": "Question", name: "Do you support team progress tracking?", acceptedAnswer: { "@type": "Answer", text: "Yes. Track completion, scores, and time spent per learner." } },
								{ "@type": "Question", name: "Is there a mobile experience?", acceptedAnswer: { "@type": "Answer", text: "Yes. Fully responsive with offline-friendly lessons." } },
								{ "@type": "Question", name: "How much does it cost?", acceptedAnswer: { "@type": "Answer", text: "Academy is included — create unlimited learners at no extra charge." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}
