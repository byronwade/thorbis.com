// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Auto Repair Shop Software – Service Management, Inventory, Customer Tracking | Thorbis",
		description: "Complete auto repair shop management software with service scheduling, inventory tracking, customer history, and digital inspections.",
		path: "/auto-repair-shop-software",
		keywords: ["auto repair shop software", "automotive service management", "car repair software", "auto shop management", "vehicle service tracking"],
	});
}

import { Star, Wrench, Package, Users } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Auto Repair Shop Software",
		description: "Complete automotive service management with scheduling, inventory, and customer tracking.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Auto Repair Shop Software", item: "https://thorbis.com/auto-repair-shop-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AutoRepairShopSoftware() {
	const features = [
		{ 
			title: "Service Management", 
			points: ["Appointment scheduling", "Work order tracking", "Digital vehicle inspections"],
			icon: Wrench
		},
		{ 
			title: "Inventory & Parts", 
			points: ["Parts inventory tracking", "Supplier management", "Automatic reorder alerts"],
			icon: Package
		},
		{ 
			title: "Customer Management", 
			points: ["Vehicle history tracking", "Service reminders", "Customer communication"],
			icon: Users
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 1,200+ auto repair shops • 4.8/5 technician rating</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Auto Repair Shop Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Streamline your automotive service operations with comprehensive shop management software for scheduling, inventory, customer tracking, and digital inspections.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-destructive px-6 py-3 text-white font-semibold hover:bg-destructive transition-colors">
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
							<feature.icon className="w-8 h-8 text-destructive" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Boost Your Shop's Efficiency</h2>
				<p className="text-lg mb-6 opacity-90">Join thousands of auto repair shops using Thorbis to increase productivity and customer satisfaction.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>
		</main>
	);
}
