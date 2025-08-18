import { Button } from "@components/ui/button";
import { CheckCircle, BarChart, MessageSquare, Megaphone } from "lucide-react";
import Link from "next/link";
import { generateStaticPageMetadata } from "@utils/server-seo";

// Example of advanced metadata generation with parent inheritance
export async function generateMetadata(params, parent) {
	// This demonstrates the new Next.js 15 best practices
	return await generateStaticPageMetadata({
		title: "Business Owners - Grow Your Local Business | Thorbis",
		description: "Join thousands of business owners using Thorbis to manage their online presence, respond to reviews, and attract more customers. Free business listing and powerful tools.",
		path: "/business",
		keywords: [
			"business owners",
			"local business",
			"business listing",
			"online presence",
			"customer reviews",
			"business management",
			"local marketing"
		],
		robots: {
			index: true,
			follow: true
		}
	}, parent); // Parent metadata inheritance for consistent branding
}

const features = [
	{
		icon: <CheckCircle className="w-8 h-8 text-primary" />,
		title: "Claim Your Business",
		description: "Secure your free business page to start managing your online presence.",
	},
	{
		icon: <MessageSquare className="w-8 h-8 text-primary" />,
		title: "Respond to Reviews",
		description: "Engage with your customers and show them you value their feedback.",
	},
	{
		icon: <BarChart className="w-8 h-8 text-primary" />,
		title: "Track Analytics",
		description: "Understand your customers with insights on page views, leads, and more.",
	},
	{
		icon: <Megaphone className="w-8 h-8 text-primary" />,
		title: "Advertise on Thorbis",
		description: "Reach more customers and grow your business with targeted ads.",
	},
];



export default function BusinessPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: "Thorbis Business Solutions",
		description: "Comprehensive business listing and marketing tools to help local businesses connect with customers and grow their online presence.",
		provider: {
			"@type": "Organization",
			name: "Thorbis",
			logo: "https://thorbis.com/logos/ThorbisLogo.webp",
			url: "https://thorbis.com",
		},
		serviceType: "Business Listing Service",
		areaServed: "United States",
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Business Tools",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Free Business Page",
						description: "Claim and manage your free business listing page",
					},
					price: "0",
					priceCurrency: "USD",
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Review Management",
						description: "Respond to customer reviews and manage your online reputation",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Business Analytics",
						description: "Track page views, customer leads, and business insights",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Advertising Solutions",
						description: "Reach more customers with targeted advertising",
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
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
							{ "@type": "ListItem", position: 2, name: "Business", item: "https://thorbis.com/business" },
						],
					}),
				}}
			/>
			<div className="bg-background text-foreground">
				{/* Hero Section */}
				<div className="isolate overflow-hidden relative">
					<div className="absolute inset-0 bg-gradient-to-b to-transparent from-primary/10" />
					<div className="px-4 py-24 mx-auto max-w-5xl text-center lg:px-24">
						<h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">Grow Your Business with Thorbis</h1>
						<p className="mx-auto mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">Connect with millions of potential customers searching for businesses like yours.</p>
						<div className="flex gap-4 justify-center mt-8">
							<Button asChild size="lg">
								<Link href="/claim-a-business">Get Started for Free</Link>
							</Button>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div className="px-4 py-24 lg:px-24">
					<div className="mx-auto max-w-5xl">
						<h2 className="mb-16 text-3xl font-bold tracking-tight text-center">Everything You Need to Succeed</h2>
						<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
							{features.map((feature) => (
								<div key={feature.title} className="flex gap-6 items-start">
									<div className="flex-shrink-0">{feature.icon}</div>
									<div>
										<h3 className="text-lg font-semibold">{feature.title}</h3>
										<p className="mt-1 text-muted-foreground">{feature.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Testimonial Section */}
				<div className="px-4 py-24 bg-muted lg:px-24">
					<div className="mx-auto max-w-4xl text-center">
						<p className="font-serif text-2xl italic">&quot;Claiming our Thorbis page was a game-changer. We saw a 30% increase in customer calls within the first month.&quot;</p>
						<p className="mt-6 font-semibold">Jane Doe, Owner of Springfield Bakery</p>
					</div>
				</div>
			</div>
		</>
	);
}
