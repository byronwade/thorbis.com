// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Real Estate Agency Software – CRM, Listings, Transaction Management | Thorbis",
		description: "Complete real estate agency management software with client CRM, listing management, transaction tracking, and commission calculations.",
		path: "/real-estate-agency-software",
		keywords: ["real estate agency software", "real estate CRM", "listing management software", "real estate transaction management", "commission tracking"],
	});
}

import { Star, Users, Home, Calculator } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Real Estate Agency Software",
		description: "Complete agency management with CRM, listings, transactions, and commission tracking.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.7",
			reviewCount: "1543"
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
			{ "@type": "ListItem", position: 2, name: "Real Estate Agency Software", item: "https://thorbis.com/real-estate-agency-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RealEstateAgencySoftware() {
	const features = [
		{ 
			title: "Client Relationship Management", 
			points: ["Lead capture & tracking", "Client communication history", "Automated follow-up campaigns"],
			icon: Users
		},
		{ 
			title: "Listing Management", 
			points: ["MLS integration", "Photo & virtual tour hosting", "Market analysis tools"],
			icon: Home
		},
		{ 
			title: "Transaction & Commission Tracking", 
			points: ["Deal pipeline management", "Automated commission splits", "Closing coordination"],
			icon: Calculator
		},
	];

	const agencies = [
		"Residential Real Estate",
		"Commercial Real Estate", 
		"Property Management",
		"Real Estate Investment",
		"Luxury Home Sales",
		"New Construction Sales"
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.7 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 1,500+ real estate agencies • 4.7/5 agent satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Real Estate Agency Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive agency management platform with CRM, listing management, transaction tracking, and automated commission calculations for real estate professionals.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Book Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-purple-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Agency Types Section */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Perfect for All Real Estate Businesses</h2>
					<p className="text-lg text-muted-foreground">Flexible platform that scales with your agency</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{agencies.map((agency, index) => (
						<div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<span className="font-medium">{agency}</span>
						</div>
					))}
				</div>
			</section>

			{/* ROI Section */}
			<section className="max-w-6xl mx-auto mt-16 bg-purple-50 dark:bg-purple-950/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Proven Results for Real Estate Agencies</h2>
					<p className="text-lg text-muted-foreground">See the impact on your business metrics</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
					<div>
						<div className="text-3xl font-bold text-purple-600 mb-2">35%</div>
						<div className="text-sm text-muted-foreground">More closed deals</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-purple-600 mb-2">60%</div>
						<div className="text-sm text-muted-foreground">Faster lead response</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
						<div className="text-sm text-muted-foreground">Time saved on admin</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-purple-600 mb-2">25%</div>
						<div className="text-sm text-muted-foreground">Higher client retention</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Ready to Scale Your Real Estate Agency?</h2>
				<p className="text-lg mb-6 opacity-90">Join thousands of successful agents and brokers using Thorbis to grow their business.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>
		</main>
	);
}
