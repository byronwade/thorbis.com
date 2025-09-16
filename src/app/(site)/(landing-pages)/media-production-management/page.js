// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Media Production Management Software – Project Tracking, Asset Management | Thorbis",
		description: "Complete media production management with project tracking, asset organization, crew scheduling, and budget management for creative productions.",
		path: "/media-production-management",
		keywords: ["media production software", "video production management", "creative project management", "media asset management", "production scheduling"],
	});
}

import { Video, Calendar, Folder } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function MediaProductionManagement() {
	const features = [
		{ 
			title: "Project & Production Tracking", 
			points: ["Timeline management", "Milestone tracking", "Resource allocation"],
			icon: Video
		},
		{ 
			title: "Crew & Schedule Management", 
			points: ["Cast and crew scheduling", "Call sheet generation", "Location management"],
			icon: Calendar
		},
		{ 
			title: "Digital Asset Management", 
			points: ["Media file organization", "Version control", "Rights management"],
			icon: Folder
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Media Production Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive production management platform with project tracking, asset organization, crew scheduling, and budget management for creative media productions.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-fuchsia-600 px-6 py-3 text-white font-semibold hover:bg-fuchsia-700 transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-fuchsia-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
