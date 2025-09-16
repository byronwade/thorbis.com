import { Truck, MapPin, Users } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Transportation Management Software – Fleet, Routing, Dispatch | Thorbis",
		description: "Complete transportation management with fleet tracking, route optimization, dispatch coordination, and driver management for logistics companies.",
		path: "/transportation-management-software",
		keywords: ["transportation management software", "fleet management system", "dispatch software", "route optimization", "logistics management"],
	});
}

export default function TransportationManagementSoftware() {
	const features = [
		{ 
			title: "Fleet Management", 
			points: ["Vehicle tracking", "Maintenance scheduling", "Fuel management"],
			icon: Truck
		},
		{ 
			title: "Route Optimization", 
			points: ["GPS routing", "Traffic integration", "Delivery scheduling"],
			icon: MapPin
		},
		{ 
			title: "Driver Management", 
			points: ["Driver scheduling", "Performance tracking", "Communication tools"],
			icon: Users
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Transportation Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive transportation management platform with fleet tracking, route optimization, dispatch coordination, and driver management.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-700 transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-violet-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
