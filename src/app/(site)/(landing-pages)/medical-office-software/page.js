// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Medical Office Software – Appointments, Records, Billing | Thorbis",
		description: "Comprehensive medical office management software with patient scheduling, electronic health records, and automated billing solutions.",
		path: "/medical-office-software",
		keywords: ["medical office software", "clinic management system", "patient appointment software", "medical records software", "healthcare automation"],
	});
}

import { Star, Calendar, FileText, CreditCard } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Medical Office Software",
		description: "Complete medical office management with scheduling, records, and billing automation.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "HealthcareApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: "1924"
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
			{ "@type": "ListItem", position: 2, name: "Medical Office Software", item: "https://thorbis.com/medical-office-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function MedicalOfficeSoftware() {
	const features = [
		{ 
			title: "Smart Appointment Scheduling", 
			points: ["Online patient booking", "Staff calendar sync", "Automated appointment reminders"],
			icon: Calendar
		},
		{ 
			title: "Digital Patient Records", 
			points: ["Secure EHR system", "Treatment history tracking", "Document management"],
			icon: FileText
		},
		{ 
			title: "Automated Medical Billing", 
			points: ["Insurance claim processing", "Payment plan management", "Revenue reporting"],
			icon: CreditCard
		},
	];

	const specialties = [
		"Family Medicine",
		"Internal Medicine", 
		"Pediatrics",
		"Cardiology",
		"Dermatology",
		"Orthopedics",
		"Ophthalmology",
		"Psychiatry"
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
					<p className="text-sm text-muted-foreground">Used by 1,900+ medical offices • 4.8/5 doctor satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Medical Office Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Streamline your medical practice with all-in-one software for patient scheduling, electronic health records, and automated billing.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-success px-6 py-3 text-white font-semibold hover:bg-success transition-colors">
						Try Free for 30 Days
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
							<feature.icon className="w-8 h-8 text-success" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Specialties Section */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Trusted Across Medical Specialties</h2>
					<p className="text-lg text-muted-foreground">Flexible software that adapts to your practice needs</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{specialties.map((specialty, index) => (
						<div key={index} className="text-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<span className="font-medium text-sm">{specialty}</span>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="max-w-6xl mx-auto mt-16 bg-success dark:bg-success/20 rounded-2xl p-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
					<div>
						<div className="text-3xl font-bold text-success mb-2">50%</div>
						<div className="text-sm text-muted-foreground">Reduction in no-shows</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">30%</div>
						<div className="text-sm text-muted-foreground">Faster claim processing</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">25%</div>
						<div className="text-sm text-muted-foreground">Time saved on admin</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">99.9%</div>
						<div className="text-sm text-muted-foreground">System uptime</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Transform Your Medical Office Today</h2>
				<p className="text-lg mb-6 opacity-90">See why thousands of healthcare providers choose Thorbis for their practice management needs.</p>
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
