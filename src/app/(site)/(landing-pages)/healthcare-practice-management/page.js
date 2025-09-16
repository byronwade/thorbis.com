// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Healthcare Practice Management Software – EMR, Billing, Scheduling | Thorbis",
		description: "Streamline your medical practice with integrated EMR, patient scheduling, insurance billing, and revenue cycle management.",
		path: "/healthcare-practice-management",
		keywords: ["healthcare practice management", "EMR software", "medical practice software", "patient scheduling", "medical billing", "revenue cycle management"],
	});
}

import { Star, Shield, Clock, DollarSign } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Healthcare Practice Management Software",
		description: "Complete practice management with EMR, scheduling, billing, and revenue cycle management.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "HealthcareApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			reviewCount: "2847"
		}
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Healthcare Practice Management", item: "https://thorbis.com/healthcare-practice-management" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HealthcarePracticeManagement() {
	const features = [
		{ 
			title: "Electronic Medical Records", 
			points: ["HIPAA-compliant patient records", "Clinical notes & documentation", "Lab results integration"],
			icon: Shield
		},
		{ 
			title: "Patient Scheduling", 
			points: ["Online appointment booking", "Automated reminders", "Waitlist management"],
			icon: Clock
		},
		{ 
			title: "Revenue Cycle Management", 
			points: ["Insurance verification", "Claims processing", "Payment tracking"],
			icon: DollarSign
		},
	];

	const benefits = [
		"Reduce administrative overhead by 40%",
		"Improve patient satisfaction scores",
		"Accelerate insurance reimbursements",
		"Maintain HIPAA compliance automatically",
		"Streamline provider workflows",
		"Real-time practice analytics"
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
					<p className="text-sm text-muted-foreground">Trusted by 2,800+ healthcare providers • 4.9/5 average rating</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Healthcare Practice Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Complete practice management solution with integrated EMR, patient scheduling, billing, and revenue cycle management designed for modern healthcare providers.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-white font-semibold hover:bg-primary transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-primary" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Benefits Section */}
			<section className="max-w-6xl mx-auto mt-16 bg-blue-50 dark:bg-primary/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Transform Your Healthcare Practice</h2>
					<p className="text-lg text-muted-foreground">See the impact of streamlined practice management</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{benefits.map((benefit, index) => (
						<div key={index} className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-lg p-4">
							<div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
							<span className="text-sm font-medium">{benefit}</span>
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Practice?</h2>
				<p className="text-lg mb-6 opacity-90">Join thousands of healthcare providers already using Thorbis to streamline their operations.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
						Book Consultation
					</a>
				</div>
			</section>
		</main>
	);
}
