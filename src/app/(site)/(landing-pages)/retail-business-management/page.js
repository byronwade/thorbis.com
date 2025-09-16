// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Retail Business Management Software – POS, Inventory, Customer Analytics | Thorbis",
		description: "Complete retail management platform with point of sale, inventory tracking, customer analytics, and multi-location support for retail businesses.",
		path: "/retail-business-management",
		keywords: ["retail business management", "retail POS system", "inventory management software", "retail analytics", "multi-store management"],
	});
}

import { Star, ShoppingCart, Package, BarChart3, Users, CreditCard, MapPin } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Retail Business Management Software",
		description: "Complete retail management platform with POS, inventory tracking, customer analytics, and multi-location support.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.7",
			reviewCount: "432"
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
			{ "@type": "ListItem", position: 2, name: "Retail Business Management", item: "https://thorbis.com/retail-business-management" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RetailBusinessManagement() {
	const features = [
		{ 
			title: "Point of Sale System", 
			points: ["Fast checkout process", "Payment processing", "Receipt management"],
			icon: ShoppingCart,
			description: "Streamline transactions with lightning-fast POS system supporting multiple payment methods and receipt options."
		},
		{ 
			title: "Inventory Management", 
			points: ["Real-time stock tracking", "Automated reordering", "Supplier management"],
			icon: Package,
			description: "Optimize stock levels with real-time tracking, automated reordering, and comprehensive supplier management."
		},
		{ 
			title: "Customer Analytics", 
			points: ["Sales reporting", "Customer insights", "Purchase behavior analysis"],
			icon: BarChart3,
			description: "Make data-driven decisions with comprehensive analytics on sales, customers, and buying patterns."
		},
		{ 
			title: "Customer Management", 
			points: ["Customer profiles", "Loyalty programs", "Marketing campaigns"],
			icon: Users,
			description: "Build customer relationships with detailed profiles, loyalty programs, and targeted marketing campaigns."
		},
		{ 
			title: "Payment Processing", 
			points: ["Multiple payment methods", "Secure transactions", "Split payments"],
			icon: CreditCard,
			description: "Accept all payment types securely with integrated processing and flexible payment options."
		},
		{ 
			title: "Multi-Location Support", 
			points: ["Centralized management", "Location analytics", "Inventory transfers"],
			icon: MapPin,
			description: "Manage multiple stores from one platform with centralized reporting and inventory coordination."
		},
	];

	const successStories = [
		{
			name: "Fashion Forward Boutique",
			location: "Los Angeles, CA",
			growth: "45% sales increase",
			story: "Improved inventory management and customer insights drove significant sales growth.",
			rating: 4.8,
			reviews: 92
		},
		{
			name: "Tech Accessories Plus",
			location: "Austin, TX",
			growth: "60% efficiency gain",
			story: "Streamlined operations across 5 locations with centralized management and analytics.",
			rating: 4.9,
			reviews: 134
		},
		{
			name: "Home & Garden Center",
			location: "Denver, CO",
			growth: "30% cost reduction",
			story: "Optimized inventory levels and automated reordering significantly reduced carrying costs.",
			rating: 4.6,
			reviews: 78
		}
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
					<p className="text-sm text-muted-foreground">Powering 2,000+ retail stores • 4.7/5 retailer satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Retail Business Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive retail management platform with integrated POS, inventory tracking, customer analytics, and multi-location support designed for modern retailers.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-pink-600 px-6 py-3 text-white font-semibold hover:bg-pink-700 transition-colors">
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
							<feature.icon className="w-8 h-8 text-pink-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-pink-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Retail Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how retailers are growing with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<ShoppingCart className="w-6 h-6 text-pink-600" />
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
						<div className="text-3xl font-bold text-pink-600 mb-2">2,000+</div>
						<div className="text-sm text-muted-foreground">Retail stores</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-pink-600 mb-2">$2.1B+</div>
						<div className="text-sm text-muted-foreground">Sales processed</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-pink-600 mb-2">35%</div>
						<div className="text-sm text-muted-foreground">Average sales increase</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-pink-600 mb-2">99.8%</div>
						<div className="text-sm text-muted-foreground">System uptime</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-pink-600 to-pink-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Transform Your Retail Operations</h2>
				<p className="text-lg mb-6 opacity-90">Join thousands of retailers using Thorbis to optimize their business performance and increase sales.</p>
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
