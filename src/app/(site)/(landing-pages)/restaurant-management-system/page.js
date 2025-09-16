// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Restaurant Management System – POS, Inventory, Staff Scheduling | Thorbis",
		description: "Complete restaurant management software with point of sale, inventory tracking, staff scheduling, and customer management for food service businesses.",
		path: "/restaurant-management-system",
		keywords: ["restaurant management software", "restaurant POS system", "food service management", "restaurant inventory", "dining management"],
	});
}

import { Utensils, Clock, Users } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function RestaurantManagementSystem() {
	const features = [
		{ 
			title: "Point of Sale & Orders", 
			points: ["Table management", "Order processing", "Payment integration"],
			icon: Utensils
		},
		{ 
			title: "Staff & Scheduling", 
			points: ["Employee scheduling", "Time tracking", "Payroll integration"],
			icon: Clock
		},
		{ 
			title: "Customer Management", 
			points: ["Reservation system", "Customer loyalty", "Feedback tracking"],
			icon: Users
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Restaurant Management System
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive restaurant management platform with POS, inventory tracking, staff scheduling, and customer management for food service operations.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-warning px-6 py-3 text-white font-semibold hover:bg-warning transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-warning" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
