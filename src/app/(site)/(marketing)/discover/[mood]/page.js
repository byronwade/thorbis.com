import React from "react";
import { generateStaticPageMetadata } from "@/utils/server-seo";
import MoodDiscoverClient from "./mood-discover-client";

// Mood configuration with SEO metadata
const moodConfig = {
	happy: {
		title: "Happy - Discover Joyful Local Businesses & Experiences",
		description: "Find businesses that bring joy and happiness. From entertainment venues to wellness centers, discover places that make you smile.",
		keywords: ["happy businesses", "joyful experiences", "entertainment", "wellness", "fun activities", "positive vibes"],
		color: "bg-yellow-500",
		subcategories: ["Entertainment", "Wellness", "Social", "Creative", "Outdoor"]
	},
	shopping: {
		title: "Shopping - Discover Unique Local Stores & Retail Experiences",
		description: "Explore local shopping destinations, boutiques, markets, and retail experiences. Find unique products and personalized service.",
		keywords: ["local shopping", "boutiques", "retail stores", "markets", "unique products", "shopping districts"],
		color: "bg-blue-500",
		subcategories: ["Fashion", "Electronics", "Home & Garden", "Gifts", "Artisan"]
	},
	hungry: {
		title: "Hungry - Discover Amazing Local Restaurants & Food Experiences",
		description: "Satisfy your cravings with the best local restaurants, cafes, food trucks, and culinary experiences in your area.",
		keywords: ["local restaurants", "food", "dining", "cafes", "culinary experiences", "food trucks"],
		color: "bg-orange-500",
		subcategories: ["Quick Bites", "Fine Dining", "Street Food", "Desserts", "Beverages"]
	},
	play: {
		title: "Play - Discover Fun Activities & Entertainment Venues",
		description: "Find exciting entertainment venues, recreational activities, and fun experiences for all ages. From bars to family activities.",
		keywords: ["entertainment", "recreation", "fun activities", "bars", "music venues", "family entertainment"],
		color: "bg-green-500",
		subcategories: ["Bars", "Music", "Events", "Recreation", "Family Fun"]
	},
	relax: {
		title: "Relax - Discover Wellness & Relaxation Services",
		description: "Unwind and recharge with local wellness services, spas, massage therapy, and relaxation experiences.",
		keywords: ["wellness", "spa", "massage", "relaxation", "self-care", "meditation"],
		color: "bg-purple-500",
		subcategories: ["Spa", "Massage", "Yoga", "Meditation", "Wellness"]
	},
	work: {
		title: "Work - Discover Professional Services & Business Solutions",
		description: "Find professional services, business solutions, and work-related resources. From legal services to coworking spaces.",
		keywords: ["professional services", "business solutions", "legal services", "accounting", "coworking"],
		color: "bg-gray-500",
		subcategories: ["Legal", "Accounting", "Real Estate", "Consulting", "Coworking"]
	},
	fix: {
		title: "Fix - Discover Repair & Maintenance Services",
		description: "Find reliable repair and maintenance services for your home, car, electronics, and more. Trusted local professionals.",
		keywords: ["repair services", "maintenance", "plumbing", "electrical", "auto repair", "home repair"],
		color: "bg-red-500",
		subcategories: ["Plumbing", "Electrical", "Auto Repair", "Home Repair", "Electronics"]
	}
};

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata({ params }) {
	const { mood } = await params;
	const config = moodConfig[mood] || moodConfig.happy;
	
	return await generateStaticPageMetadata({
		title: config.title,
		description: config.description,
		path: `/discover/${mood}`,
		keywords: config.keywords,
	});
}

// Generate static params for all mood pages
export async function generateStaticParams() {
	return Object.keys(moodConfig).map((mood) => ({
		mood: mood,
	}));
}

export default async function MoodDiscoverPage({ params }) {
	const { mood } = await params;
	const config = moodConfig[mood] || moodConfig.happy;

	return (
		<div className="min-h-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: config.title,
						description: config.description,
						url: `/discover/${mood}`,
						mainEntity: {
							"@type": "ItemList",
							name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Discoveries`,
							description: config.description,
							itemListElement: config.subcategories.map((sub, index) => ({
								"@type": "ListItem",
								position: index + 1,
								item: {
									"@type": "Thing",
									name: sub,
									description: `Discover ${sub.toLowerCase()} businesses and services`,
								},
							})),
						},
					}),
				}}
			/>

			<MoodDiscoverClient mood={mood} config={config} />
		</div>
	);
}
