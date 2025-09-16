// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Automotive Dealership Software – Sales, Service, Inventory Management | Thorbis",
		description: "Complete automotive dealership management with vehicle sales tracking, service scheduling, inventory management, and customer relationship tools for car dealerships.",
		path: "/automotive-dealership-software",
		keywords: ["automotive dealership software", "car dealership management", "vehicle inventory software", "auto sales management", "dealership CRM", "dealer management system"],
	});
}

import { Star, Car, Wrench, Users, BarChart3, DollarSign, Shield } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Automotive Dealership Software",
		description: "Complete dealership management with vehicle sales tracking, service scheduling, inventory management, and customer relationship tools.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.7",
			reviewCount: "892"
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
			{ "@type": "ListItem", position: 2, name: "Automotive Dealership Software", item: "https://thorbis.com/automotive-dealership-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AutomotiveDealershipSoftware() {
	const features = [
		{ 
			title: "Vehicle Sales Management", 
			points: ["Inventory tracking", "Sales pipeline", "Financing integration"],
			icon: Car,
			description: "Streamline vehicle sales with comprehensive inventory management, lead tracking, and integrated financing options."
		},
		{ 
			title: "Service Department", 
			points: ["Service scheduling", "Work order management", "Parts inventory"],
			icon: Wrench,
			description: "Optimize service operations with efficient scheduling, work order tracking, and parts inventory management."
		},
		{ 
			title: "Customer Relationship Management", 
			points: ["Customer database", "Follow-up campaigns", "Service reminders"],
			icon: Users,
			description: "Build lasting customer relationships with automated follow-ups, service reminders, and comprehensive customer history."
		},
		{ 
			title: "Financial Analytics", 
			points: ["Sales reporting", "Profit analysis", "Commission tracking"],
			icon: BarChart3,
			description: "Make data-driven decisions with real-time sales analytics, profit tracking, and commission management."
		},
		{ 
			title: "Deal Management", 
			points: ["Trade-in valuation", "F&I integration", "Contract management"],
			icon: DollarSign,
			description: "Maximize profit margins with integrated trade-in tools, F&I products, and streamlined contract processing."
		},
		{ 
			title: "Compliance & Security", 
			points: ["Regulatory compliance", "Data security", "Audit trails"],
			icon: Shield,
			description: "Stay compliant with automotive regulations while maintaining the highest standards of data security."
		},
	];

	const successStories = [
		{
			name: "Metro Auto Group",
			location: "Denver, CO",
			growth: "38% sales increase",
			story: "Improved lead conversion and streamlined operations with integrated sales and service management.",
			rating: 4.8,
			reviews: 156
		},
		{
			name: "Precision Motors",
			location: "Phoenix, AZ",
			growth: "$2.1M revenue boost",
			story: "Enhanced inventory management and customer retention through automated service reminders.",
			rating: 4.9,
			reviews: 203
		},
		{
			name: "Elite Car Center",
			location: "Tampa, FL",
			growth: "45% faster deals",
			story: "Accelerated sales process with integrated financing and streamlined paperwork management.",
			rating: 4.7,
			reviews: 89
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
					<p className="text-sm text-muted-foreground">Trusted by 450+ auto dealerships • 4.7/5 dealer satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Automotive Dealership Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Complete dealership management platform with vehicle sales tracking, service scheduling, inventory management, and customer relationship tools designed for modern automotive dealerships.
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
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-primary" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
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

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-blue-50 dark:bg-primary/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Dealership Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how automotive dealerships are growing with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 dark:bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
								<Car className="w-6 h-6 text-primary" />
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
						<div className="text-3xl font-bold text-primary mb-2">450+</div>
						<div className="text-sm text-muted-foreground">Dealerships served</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-primary mb-2">$500M+</div>
						<div className="text-sm text-muted-foreground">Sales processed</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-primary mb-2">35%</div>
						<div className="text-sm text-muted-foreground">Average sales increase</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-primary mb-2">99.9%</div>
						<div className="text-sm text-muted-foreground">System uptime</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Ready to Transform Your Dealership?</h2>
				<p className="text-lg mb-6 opacity-90">Join hundreds of successful dealerships using Thorbis to increase sales and improve operations.</p>
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
