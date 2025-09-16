import React from "react";
import { generateStaticPageMetadata } from "@/utils/server-seo";
import SubcategoryDiscoverClient from "./subcategory-discover-client";

// Subcategory configuration with SEO metadata
const subcategoryConfig = {
	happy: {
		entertainment: {
			title: "Entertainment - Discover Joyful Entertainment & Fun Activities",
			description: "Find amazing entertainment venues, activities, and fun experiences that bring joy and happiness.",
			keywords: ["entertainment", "fun activities", "joy", "happiness", "entertainment venues", "fun experiences"],
			color: "bg-yellow-500",
			businesses: 3200
		},
		wellness: {
			title: "Wellness - Discover Joyful Wellness & Self-Care Services",
			description: "Explore wellness services, self-care experiences, and activities that promote happiness and well-being.",
			keywords: ["wellness", "self-care", "happiness", "well-being", "joyful wellness", "positive energy"],
			color: "bg-green-500",
			businesses: 2800
		},
		social: {
			title: "Social - Discover Joyful Social Activities & Community Events",
			description: "Find social activities, community events, and group experiences that bring people together in joy.",
			keywords: ["social activities", "community events", "group experiences", "social joy", "community"],
			color: "bg-blue-500",
			businesses: 2100
		},
		creative: {
			title: "Creative - Discover Joyful Creative Activities & Artistic Experiences",
			description: "Explore creative activities, artistic experiences, and craft workshops that spark joy and creativity.",
			keywords: ["creative activities", "artistic experiences", "craft workshops", "creativity", "art"],
			color: "bg-purple-500",
			businesses: 1800
		},
		outdoor: {
			title: "Outdoor - Discover Joyful Outdoor Activities & Nature Experiences",
			description: "Find outdoor activities, nature experiences, and adventure opportunities that bring joy and happiness.",
			keywords: ["outdoor activities", "nature experiences", "adventure", "outdoor joy", "nature"],
			color: "bg-green-600",
			businesses: 2100
		}
	},
	shopping: {
		fashion: {
			title: "Fashion - Discover Unique Fashion & Style Shopping",
			description: "Explore fashion boutiques, clothing stores, and style shopping experiences for every taste.",
			keywords: ["fashion", "clothing", "style", "boutiques", "fashion shopping", "apparel"],
			color: "bg-pink-500",
			businesses: 2800
		},
		electronics: {
			title: "Electronics - Discover Tech & Electronics Shopping",
			description: "Find electronics stores, tech shops, and gadget shopping experiences with expert advice.",
			keywords: ["electronics", "tech", "gadgets", "technology", "electronics shopping", "tech stores"],
			color: "bg-blue-500",
			businesses: 1900
		},
		"home-garden": {
			title: "Home & Garden - Discover Home & Garden Shopping",
			description: "Explore home decor, garden centers, and home improvement shopping for your perfect space.",
			keywords: ["home decor", "garden", "home improvement", "furniture", "home shopping", "garden centers"],
			color: "bg-green-500",
			businesses: 2200
		},
		gifts: {
			title: "Gifts - Discover Perfect Gift Shopping & Unique Finds",
			description: "Find unique gifts, specialty shops, and gift shopping experiences for every occasion.",
			keywords: ["gifts", "gift shopping", "unique finds", "specialty shops", "gift stores", "presents"],
			color: "bg-red-500",
			businesses: 1600
		},
		artisan: {
			title: "Artisan - Discover Handcrafted & Artisan Shopping",
			description: "Explore artisan shops, handcrafted goods, and unique handmade shopping experiences.",
			keywords: ["artisan", "handcrafted", "handmade", "unique goods", "artisan shopping", "crafts"],
			color: "bg-orange-500",
			businesses: 1200
		}
	},
	hungry: {
		"quick-bites": {
			title: "Quick Bites - Discover Fast & Delicious Food Options",
			description: "Find quick food options, fast casual restaurants, and delicious quick bite experiences.",
			keywords: ["quick food", "fast casual", "quick bites", "fast food", "casual dining", "quick meals"],
			color: "bg-orange-500",
			businesses: 4500
		},
		"fine-dining": {
			title: "Fine Dining - Discover Upscale & Fine Dining Experiences",
			description: "Explore upscale restaurants, fine dining establishments, and gourmet dining experiences.",
			keywords: ["fine dining", "upscale restaurants", "gourmet", "luxury dining", "elegant dining", "premium food"],
			color: "bg-purple-500",
			businesses: 1800
		},
		"street-food": {
			title: "Street Food - Discover Authentic Street Food & Food Trucks",
			description: "Find authentic street food, food trucks, and casual outdoor dining experiences.",
			keywords: ["street food", "food trucks", "casual dining", "outdoor food", "authentic food", "food vendors"],
			color: "bg-yellow-500",
			businesses: 3200
		},
		desserts: {
			title: "Desserts - Discover Sweet Treats & Dessert Experiences",
			description: "Explore dessert shops, bakeries, and sweet treat experiences for every sweet tooth.",
			keywords: ["desserts", "sweet treats", "bakery", "pastries", "dessert shops", "sweets"],
			color: "bg-pink-500",
			businesses: 2100
		},
		beverages: {
			title: "Beverages - Discover Drinks & Beverage Experiences",
			description: "Find coffee shops, tea houses, juice bars, and beverage experiences for every taste.",
			keywords: ["beverages", "coffee", "tea", "juice", "drinks", "beverage shops", "cafes"],
			color: "bg-brown-500",
			businesses: 3400
		}
	},
	play: {
		bars: {
			title: "Bars - Discover Fun Bars & Nightlife Entertainment",
			description: "Find exciting bars, pubs, and nightlife entertainment venues for social fun.",
			keywords: ["bars", "pubs", "nightlife", "entertainment", "social venues", "drinks"],
			color: "bg-amber-500",
			businesses: 1800
		},
		music: {
			title: "Music - Discover Live Music & Musical Entertainment",
			description: "Explore live music venues, concerts, and musical entertainment experiences.",
			keywords: ["live music", "concerts", "music venues", "musical entertainment", "bands", "performances"],
			color: "bg-purple-500",
			businesses: 1200
		},
		events: {
			title: "Events - Discover Exciting Events & Entertainment",
			description: "Find exciting events, entertainment venues, and special event experiences.",
			keywords: ["events", "entertainment", "special events", "event venues", "entertainment venues"],
			color: "bg-red-500",
			businesses: 900
		},
		recreation: {
			title: "Recreation - Discover Fun Recreation & Activity Centers",
			description: "Explore recreation centers, activity venues, and fun recreational experiences.",
			keywords: ["recreation", "activities", "recreation centers", "fun activities", "entertainment"],
			color: "bg-green-500",
			businesses: 1500
		},
		"family-fun": {
			title: "Family Fun - Discover Family Entertainment & Activities",
			description: "Find family-friendly entertainment, activities, and fun experiences for all ages.",
			keywords: ["family fun", "family entertainment", "family activities", "kid-friendly", "family venues"],
			color: "bg-blue-500",
			businesses: 2100
		}
	}
};

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata({ params }) {
	const { mood, subcategory } = params;
	const config = subcategoryConfig[mood]?.[subcategory] || subcategoryConfig.happy.entertainment;
	
	return await generateStaticPageMetadata({
		title: config.title,
		description: config.description,
		path: `/discover/${mood}/${subcategory}`,
		keywords: config.keywords,
	});
}

// Generate static params for all subcategory pages
export async function generateStaticParams() {
	const params = [];
	
	for (const [mood, subcategories] of Object.entries(subcategoryConfig)) {
		for (const subcategory of Object.keys(subcategories)) {
			params.push({
				mood: mood,
				subcategory: subcategory,
			});
		}
	}
	
	return params;
}

export default function SubcategoryDiscoverPage({ params }) {
	const { mood, subcategory } = params;
	const config = subcategoryConfig[mood]?.[subcategory] || subcategoryConfig.happy.entertainment;

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
						url: `/discover/${mood}/${subcategory}`,
						mainEntity: {
							"@type": "ItemList",
							name: `${subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}',
							description: config.description,
						},
					}),
				}}
			/>

			<SubcategoryDiscoverClient mood={mood} subcategory={subcategory} config={config} />
		</div>
	);
}
