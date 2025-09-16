// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Manufacturing Operations Software – Production Planning, Quality Control | Thorbis",
		description: "Comprehensive manufacturing management software with production planning, quality control, inventory tracking, and equipment maintenance.",
		path: "/manufacturing-operations-software",
		keywords: ["manufacturing operations software", "production planning software", "quality control system", "manufacturing ERP", "factory management"],
	});
}

import { Star, Settings, CheckCircle, Package } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function ManufacturingOperationsSoftware() {
	const features = [
		{ 
			title: "Production Planning", 
			points: ["Production scheduling", "Resource allocation", "Workflow optimization"],
			icon: Settings
		},
		{ 
			title: "Quality Control", 
			points: ["Quality inspections", "Defect tracking", "Compliance reporting"],
			icon: CheckCircle
		},
		{ 
			title: "Inventory & Materials", 
			points: ["Raw material tracking", "Work-in-progress monitoring", "Finished goods management"],
			icon: Package
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Managing 300+ manufacturing facilities • 4.7/5 operations manager rating</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Manufacturing Operations Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Optimize your manufacturing operations with comprehensive production planning, quality control, inventory management, and equipment maintenance tools.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
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

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Streamline Your Manufacturing Operations</h2>
				<p className="text-lg mb-6 opacity-90">Join manufacturers worldwide using Thorbis to improve efficiency and quality.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>
		</main>
	);
}
