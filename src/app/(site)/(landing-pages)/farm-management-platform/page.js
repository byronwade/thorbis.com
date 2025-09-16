// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Farm Management Platform – Crop Planning, Livestock, Equipment Tracking | Thorbis",
		description: "Complete farm management software with crop planning, livestock tracking, equipment maintenance, and agricultural financial management for modern farms.",
		path: "/farm-management-platform",
		keywords: ["farm management software", "agricultural management platform", "crop planning software", "livestock management", "farm operations"],
	});
}

import { Leaf, Truck, BarChart3 } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function FarmManagementPlatform() {
	const features = [
		{ 
			title: "Crop & Field Management", 
			points: ["Planting schedules", "Yield tracking", "Weather integration"],
			icon: Leaf
		},
		{ 
			title: "Equipment & Maintenance", 
			points: ["Equipment tracking", "Maintenance schedules", "Fuel management"],
			icon: Truck
		},
		{ 
			title: "Agricultural Analytics", 
			points: ["Profit analysis", "Production reports", "Cost tracking"],
			icon: BarChart3
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Farm Management Platform
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive farm management platform with crop planning, livestock tracking, equipment maintenance, and financial management for modern agricultural operations.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-lime-600 px-6 py-3 text-white font-semibold hover:bg-lime-700 transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-lime-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
