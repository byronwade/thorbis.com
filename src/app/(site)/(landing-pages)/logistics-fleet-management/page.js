// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Logistics Fleet Management Software – Tracking, Maintenance, Optimization | Thorbis",
		description: "Advanced fleet management platform with real-time vehicle tracking, maintenance scheduling, driver management, and route optimization for logistics operations.",
		path: "/logistics-fleet-management",
		keywords: ["logistics fleet management", "vehicle tracking software", "fleet optimization", "logistics software", "delivery management"],
	});
}

import { Truck, Settings, BarChart3 } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function LogisticsFleetManagement() {
	const features = [
		{ 
			title: "Real-Time Fleet Tracking", 
			points: ["GPS vehicle monitoring", "Live location updates", "Geofencing alerts"],
			icon: Truck
		},
		{ 
			title: "Maintenance Management", 
			points: ["Preventive maintenance", "Service scheduling", "Cost tracking"],
			icon: Settings
		},
		{ 
			title: "Performance Analytics", 
			points: ["Fuel efficiency reports", "Driver performance", "Route analysis"],
			icon: BarChart3
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Logistics Fleet Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Advanced fleet management platform with real-time tracking, maintenance scheduling, and performance optimization for logistics operations.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-stone-700 px-6 py-3 text-white font-semibold hover:bg-stone-800 transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-stone-700" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
