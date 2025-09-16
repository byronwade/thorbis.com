import { Button } from "@/components/ui/button";
import { Target, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { generateStaticPageMetadata } from "@/utils/server-seo";

const advertisingBenefits = [
	{
		icon: <Target className="w-8 h-8 text-primary" />,
		title: "Reach High-Intent Customers",
		description: "Connect with users who are actively searching for businesses like yours.",
	},
	{
		icon: <Users className="w-8 h-8 text-primary" />,
		title: "Target by Location",
		description: "Promote your business to customers in specific cities, neighborhoods, or zip codes.",
	},
	{
		icon: <TrendingUp className="w-8 h-8 text-primary" />,
		title: "Drive Measurable Results",
		description: "Track your ad performance with detailed analytics on clicks, calls, and leads.",
	},
];

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Advertise on Thorbis - Reach Millions of Local Customers",
		description: "Grow your business with Thorbis advertising. Get your business in front of millions of people ready to buy, visit, and hire. Target by location and track results.",
		path: "/advertise",
		keywords: ["advertise on thorbis", "local advertising", "business promotion", "sponsored listings", "targeted advertising", "local marketing"],
	});
}

export default function AdvertisePage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: "Thorbis Advertising Services",
		description: "Comprehensive advertising solutions for local businesses to reach millions of potential customers on Thorbis platform.",
		provider: {
			"@type": "Organization",
			name: "Thorbis",
			logo: "https://thorbis.com/logos/ThorbisLogo.webp",
			url: "https://thorbis.com",
		},
		serviceType: "Digital Advertising",
		areaServed: "United States",
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Advertising Services",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Sponsored Listings",
						description: "Appear at the top of search results with sponsored business listings",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Targeted Advertising",
						description: "Target customers by location, demographics, and interests",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Performance Analytics",
						description: "Track ad performance with detailed analytics on clicks, calls, and leads",
					},
				},
			],
		},
		audience: {
			"@type": "BusinessAudience",
			audienceType: "Local Businesses",
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<div className="bg-background text-foreground">
				{/* Hero Section */}
				<div className="bg-muted">
					<div className="px-4 py-24 mx-auto max-w-5xl text-center lg:px-24">
						<h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">Advertise on Thorbis</h1>
						<p className="mx-auto mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">Get your business in front of millions of people ready to buy, visit, and hire.</p>
						<Button asChild size="lg" className="mt-8">
							<Link href="/contact-sales">Get Started</Link>
						</Button>
					</div>
				</div>

				{/* Benefits Section */}
				<div className="px-4 py-24 lg:px-24">
					<div className="mx-auto max-w-5xl">
						<h2 className="mb-16 text-3xl font-bold tracking-tight text-center">Why Advertise with Us?</h2>
						<div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
							{advertisingBenefits.map((benefit) => (
								<div key={benefit.title}>
									<div className="flex justify-center mb-4">{benefit.icon}</div>
									<h3 className="text-lg font-semibold">{benefit.title}</h3>
									<p className="mt-2 text-muted-foreground">{benefit.description}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Ad Examples Section */}
				<div className="px-4 py-24 bg-muted lg:px-24">
					<div className="mx-auto max-w-5xl">
						<h2 className="mb-16 text-3xl font-bold tracking-tight text-center">See Your Ads in Action</h2>
						<div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
							<Image src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop" alt="Ad example on Thorbis" width={1200} height={900} className="rounded-lg shadow-lg" />
							<div>
								<h3 className="mb-4 text-2xl font-bold">Sponsored Listings</h3>
								<p className="text-lg text-muted-foreground">Appear at the top of search results and stand out from the competition. Our sponsored listings are clearly marked and designed to drive clicks from interested customers.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
