// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Hotel Management Software – Reservations, Guest Services, Revenue Management | Thorbis",
		description: "Complete hotel management system with reservation management, guest services, housekeeping coordination, and revenue optimization tools.",
		path: "/hotel-management-software",
		keywords: ["hotel management software", "hotel reservation system", "guest management software", "hotel PMS", "hospitality management"],
	});
}

import { Star, Bed, Users, TrendingUp, Calendar, CreditCard, Shield } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Hotel Management Software",
		description: "Complete hotel property management system with reservations, guest services, and revenue optimization.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: "756"
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
			{ "@type": "ListItem", position: 2, name: "Hotel Management Software", item: "https://thorbis.com/hotel-management-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HotelManagementSoftware() {
	const features = [
		{ 
			title: "Reservation Management", 
			points: ["Online booking integration", "Rate management", "Availability tracking"],
			icon: Bed,
			description: "Streamline booking operations with integrated reservation system and real-time availability management."
		},
		{ 
			title: "Guest Services", 
			points: ["Guest check-in/out", "Service requests", "Guest communication"],
			icon: Users,
			description: "Enhance guest experience with seamless check-in/out processes and personalized service management."
		},
		{ 
			title: "Revenue Optimization", 
			points: ["Dynamic pricing", "Revenue analytics", "Occupancy forecasting"],
			icon: TrendingUp,
			description: "Maximize revenue with intelligent pricing strategies and comprehensive performance analytics."
		},
		{ 
			title: "Housekeeping Management", 
			points: ["Room status tracking", "Maintenance scheduling", "Staff coordination"],
			icon: Calendar,
			description: "Optimize housekeeping operations with automated scheduling and real-time room status updates."
		},
		{ 
			title: "Payment Processing", 
			points: ["Secure payments", "Multi-currency support", "Billing automation"],
			icon: CreditCard,
			description: "Process payments securely with integrated billing and support for multiple currencies and payment methods."
		},
		{ 
			title: "Security & Compliance", 
			points: ["Data protection", "PCI compliance", "Access controls"],
			icon: Shield,
			description: "Ensure guest data security and regulatory compliance with enterprise-grade protection measures."
		},
	];

	const successStories = [
		{
			name: "Grand Plaza Hotel",
			location: "Miami, FL",
			growth: "32% revenue increase",
			story: "Optimized pricing strategy and streamlined operations resulted in significant revenue growth.",
			rating: 4.9,
			reviews: 178
		},
		{
			name: "Mountain View Resort",
			location: "Aspen, CO",
			growth: "95% occupancy rate",
			story: "Enhanced guest experience and efficient operations achieved consistently high occupancy rates.",
			rating: 4.8,
			reviews: 234
		},
		{
			name: "City Center Suites",
			location: "Chicago, IL",
			growth: "40% operational efficiency",
			story: "Automated processes and integrated systems dramatically improved operational efficiency.",
			rating: 4.7,
			reviews: 156
		}
	];

	const hotelTypes = [
		"Boutique Hotels",
		"Business Hotels",
		"Resort Hotels",
		"Extended Stay",
		"Vacation Rentals",
		"Hotel Chains"
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.8 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 500+ hotels worldwide • 4.8/5 hotelier satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Hotel Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Streamline your hotel operations with comprehensive property management system featuring reservations, guest services, revenue optimization, and housekeeping coordination.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-cyan-600 px-6 py-3 text-white font-semibold hover:bg-cyan-700 transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-cyan-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Hotel Types */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Perfect for All Hotel Types</h2>
					<p className="text-lg text-muted-foreground">Scalable solution that grows with your property</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{hotelTypes.map((type, index) => (
						<div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<span className="font-medium">{type}</span>
						</div>
					))}
				</div>
			</section>

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-cyan-50 dark:bg-cyan-950/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Hotel Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how hotels are maximizing performance with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<Bed className="w-6 h-6 text-cyan-600" />
							</div>
							<h3 className="font-bold text-lg mb-1">{story.name}</h3>
							<p className="text-sm text-muted-foreground mb-3">{story.location}</p>
							<div className="text-2xl font-bold text-success mb-2">{story.growth}</div>
							<p className="text-sm text-muted-foreground mb-4">{story.story}</p>
							<div className="flex items-center justify-center gap-1">
								<Star className="w-4 h-4 text-warning fill-current" />
								<span className="text-sm font-medium">{story.rating}</span>
								<span className="text-sm text-muted-foreground ml-1">({story.reviews} reviews)</span>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					<div>
						<div className="text-3xl font-bold text-cyan-600 mb-2">500+</div>
						<div className="text-sm text-muted-foreground">Hotels worldwide</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-cyan-600 mb-2">50K+</div>
						<div className="text-sm text-muted-foreground">Rooms managed</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-cyan-600 mb-2">92%</div>
						<div className="text-sm text-muted-foreground">Average occupancy</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-cyan-600 mb-2">25%</div>
						<div className="text-sm text-muted-foreground">Revenue increase</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Maximize Your Hotel's Performance</h2>
				<p className="text-lg mb-6 opacity-90">Join hoteliers worldwide using Thorbis to optimize operations and increase revenue.</p>
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
