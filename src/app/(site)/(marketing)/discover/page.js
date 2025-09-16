import React from "react";
import { generateStaticPageMetadata } from "@/utils/server-seo";
import DiscoverClient from "./discover-client";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Discover Local Businesses - Interactive Business Discovery | Local Directory",
		description: "Discover amazing local businesses with our interactive discovery platform. Explore by mood, location, trending spots, and personalized recommendations.",
		path: "/discover",
		keywords: ["discover local businesses", "interactive discovery", "business exploration", "local recommendations", "trending businesses", "business discovery"],
	});
}

export default function DiscoverPage() {
	return (
		<div className="min-h-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Interactive Business Discovery",
						description: "Discover amazing local businesses with our interactive discovery platform. Explore by mood, location, trending spots, and personalized recommendations.",
						url: "/discover",
						mainEntity: {
							"@type": "ItemList",
							name: "Interactive Discovery",
							itemListElement: [
								{
									"@type": "ListItem",
									position: 1,
									item: {
										"@type": "Thing",
										name: "Mood-Based Discovery",
										description: "Find businesses based on your current mood and needs",
									},
								},
								{
									"@type": "ListItem",
									position: 2,
									item: {
										"@type": "Thing",
										name: "Interactive Map",
										description: "Explore business hotspots and trending areas",
									},
								},
								{
									"@type": "ListItem",
									position: 3,
									item: {
										"@type": "Thing",
										name: "Smart Search",
										description: "Advanced search with filters and location-based discovery",
									},
								},
								{
									"@type": "ListItem",
									position: 4,
									item: {
										"@type": "Thing",
										name: "Featured Businesses",
										description: "Handpicked businesses and trending discoveries",
									},
								},
							],
						},
					}),
				}}
			/>

			<DiscoverClient />
		</div>
	);
}


