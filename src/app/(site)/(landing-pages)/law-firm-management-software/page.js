// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Law Firm Management Software – Case Management, Time Tracking, Billing | Thorbis",
		description: "Complete law firm management software with case tracking, time & billing, client communication, and document management for legal practices.",
		path: "/law-firm-management-software",
		keywords: ["law firm management software", "legal case management", "attorney time tracking", "legal billing software", "law practice management"],
	});
}

import { Star, Scale, Clock, FileText } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Law Firm Management Software",
		description: "Complete legal practice management with case tracking, time billing, and client communication.",
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
			{ "@type": "ListItem", position: 2, name: "Law Firm Management Software", item: "https://thorbis.com/law-firm-management-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function LawFirmManagementSoftware() {
	const features = [
		{ 
			title: "Case & Matter Management", 
			points: ["Case timeline tracking", "Client matter organization", "Court date calendaring"],
			icon: Scale
		},
		{ 
			title: "Time Tracking & Billing", 
			points: ["Automated time capture", "Billing rate management", "Invoice generation"],
			icon: Clock
		},
		{ 
			title: "Document Management", 
			points: ["Secure file storage", "Version control", "Client document sharing"],
			icon: FileText
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.6 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 800+ law firms • 4.6/5 attorney satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Law Firm Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Streamline your legal practice with comprehensive case management, time tracking, billing, and client communication tools designed for modern law firms.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-amber-600 px-6 py-3 text-white font-semibold hover:bg-amber-700 transition-colors">
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
							<feature.icon className="w-8 h-8 text-amber-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Transform Your Legal Practice</h2>
				<p className="text-lg mb-6 opacity-90">Join hundreds of law firms using Thorbis to improve efficiency and client service.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
						Schedule Consultation
					</a>
				</div>
			</section>
		</main>
	);
}
