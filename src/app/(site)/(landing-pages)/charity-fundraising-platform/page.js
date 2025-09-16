// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Charity Fundraising Platform – Online Donations, Campaign Management | Thorbis",
		description: "Powerful charity fundraising platform with online donation processing, campaign management, donor engagement, and impact reporting tools for nonprofits and charitable organizations.",
		path: "/charity-fundraising-platform",
		keywords: ["charity fundraising software", "online donation platform", "fundraising campaign management", "donor engagement", "charity management", "nonprofit fundraising"],
	});
}

import { Star, DollarSign, Megaphone, BarChart3, Heart, Users, Shield } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Charity Fundraising Platform",
		description: "Powerful fundraising platform with online donations, campaign management, and donor engagement for charities.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			reviewCount: "245"
		}
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Charity Fundraising Platform", item: "https://thorbis.com/charity-fundraising-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function CharityFundraisingPlatform() {
	const features = [
		{ 
			title: "Online Fundraising", 
			points: ["Secure donation processing", "Recurring gift management", "Mobile-optimized forms"],
			icon: DollarSign,
			description: "Maximize donations with secure, user-friendly donation forms and automated recurring gift management."
		},
		{ 
			title: "Campaign Management", 
			points: ["Multi-channel campaigns", "Social media integration", "Email marketing"],
			icon: Megaphone,
			description: "Launch and manage effective fundraising campaigns across multiple channels with integrated marketing tools."
		},
		{ 
			title: "Impact Reporting", 
			points: ["Donation analytics", "Impact tracking", "Donor reports"],
			icon: BarChart3,
			description: "Demonstrate impact with comprehensive reporting and analytics that show donors exactly how their contributions help."
		},
		{ 
			title: "Donor Engagement", 
			points: ["Donor management", "Communication tools", "Thank you automation"],
			icon: Heart,
			description: "Build lasting relationships with donors through personalized communication and automated engagement workflows."
		},
		{ 
			title: "Volunteer Management", 
			points: ["Volunteer registration", "Event coordination", "Hour tracking"],
			icon: Users,
			description: "Coordinate volunteers effectively with registration, scheduling, and hour tracking systems."
		},
		{ 
			title: "Compliance & Security", 
			points: ["Financial compliance", "Data protection", "Audit trails"],
			icon: Shield,
			description: "Maintain regulatory compliance and protect donor data with enterprise-grade security measures."
		},
	];

	const successStories = [
		{
			name: "Hope Foundation",
			location: "Seattle, WA",
			growth: "180% donation increase",
			story: "Streamlined online giving and donor engagement resulted in unprecedented fundraising success.",
			rating: 4.9,
			reviews: 67
		},
		{
			name: "Community Care Network",
			location: "Denver, CO",
			growth: "$2.3M raised",
			story: "Comprehensive campaign management and impact reporting helped exceed annual fundraising goals.",
			rating: 4.8,
			reviews: 89
		},
		{
			name: "Education for All",
			location: "Austin, TX",
			growth: "65% donor retention",
			story: "Improved donor engagement and communication tools significantly increased supporter loyalty.",
			rating: 4.9,
			reviews: 124
		}
	];

	const charityTypes = [
		"Education & Youth",
		"Health & Medical",
		"Environment",
		"Animal Welfare",
		"Arts & Culture",
		"Social Services"
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 180+ nonprofits • 4.9/5 charity satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Charity Fundraising Platform
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Powerful fundraising platform with online donation processing, campaign management, donor engagement, and impact reporting designed to maximize your charitable impact.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-success px-6 py-3 text-white font-semibold hover:bg-success transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-success" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Charity Types */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Perfect for All Types of Charities</h2>
					<p className="text-lg text-muted-foreground">Flexible platform that adapts to your cause</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{charityTypes.map((type, index) => (
						<div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<span className="font-medium">{type}</span>
						</div>
					))}
				</div>
			</section>

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-success dark:bg-success/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Charity Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how nonprofits are maximizing their impact with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-success/10 dark:bg-success rounded-full flex items-center justify-center mx-auto mb-4">
								<Heart className="w-6 h-6 text-success" />
							</div>
							<h3 className="font-bold text-lg mb-1">{story.name}</h3>
							<p className="text-sm text-muted-foreground mb-3">{story.location}</p>
							<div className="text-2xl font-bold text-success mb-2">{story.growth}</div>
							<p className="text-sm text-muted-foreground mb-4">{story.story}</p>
							<div className="flex items-center justify-center gap-1">
								<Star className="w-4 h-4 text-warning fill-current" />
								<span className="text-sm font-medium">{story.rating}</span>
								<span className="text-sm text-muted-foreground ml-1">({story.reviews} reviews)</span>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					<div>
						<div className="text-3xl font-bold text-success mb-2">$85M+</div>
						<div className="text-sm text-muted-foreground">Funds raised</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">180+</div>
						<div className="text-sm text-muted-foreground">Nonprofits served</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">95%</div>
						<div className="text-sm text-muted-foreground">Donor retention rate</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-success mb-2">40%</div>
						<div className="text-sm text-muted-foreground">Average donation increase</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Amplify Your Charitable Impact</h2>
				<p className="text-lg mb-6 opacity-90">Join hundreds of nonprofits using Thorbis to increase donations and maximize their impact.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>
		</main>
	);
}
