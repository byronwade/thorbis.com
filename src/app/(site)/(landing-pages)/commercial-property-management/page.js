// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Commercial Property Management Software – Leasing, Maintenance, Financials | Thorbis",
		description: "Streamline commercial property operations with lease management, tenant portals, maintenance tracking, and financial reporting software.",
		path: "/commercial-property-management",
		keywords: ["commercial property management", "lease management software", "tenant portal", "commercial real estate software", "property maintenance tracking"],
	});
}

import { Star, Building, Users, Wrench } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Commercial Property Management Software",
		description: "Complete commercial property operations with lease management, tenant portals, and maintenance tracking.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser"
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Commercial Property Management", item: "https://thorbis.com/commercial-property-management" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function CommercialPropertyManagement() {
	const features = [
		{ 
			title: "Lease & Tenant Management", 
			points: ["Automated lease renewals", "Rent roll reporting", "CAM reconciliation"],
			icon: Building
		},
		{ 
			title: "Tenant Experience Portal", 
			points: ["Online rent payments", "Service request submission", "Document access"],
			icon: Users
		},
		{ 
			title: "Maintenance & Operations", 
			points: ["Work order management", "Vendor coordination", "Preventive maintenance scheduling"],
			icon: Wrench
		},
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
					<p className="text-sm text-muted-foreground">Managing 50M+ sq ft of commercial space • 4.8/5 property manager rating</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Commercial Property Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive platform for managing commercial properties with lease tracking, tenant portals, maintenance coordination, and financial reporting.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Request Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-indigo-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Optimize Your Commercial Portfolio</h2>
				<p className="text-lg mb-6 opacity-90">Streamline operations and maximize NOI with our comprehensive property management platform.</p>
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
