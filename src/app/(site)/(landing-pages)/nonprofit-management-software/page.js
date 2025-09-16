// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Nonprofit Management Software – Donor Management, Fundraising, Volunteers | Thorbis",
		description: "Complete nonprofit management platform with donor relationship management, fundraising tools, volunteer coordination, and grant tracking for charitable organizations.",
		path: "/nonprofit-management-software",
		keywords: ["nonprofit management software", "donor management system", "fundraising software", "volunteer management", "nonprofit CRM", "charity software"],
	});
}

import { Star, Heart, Users, Target, DollarSign, BarChart3, Shield } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Nonprofit Management Software",
		description: "Complete nonprofit platform with donor management, fundraising tools, and volunteer coordination.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			reviewCount: "186"
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
			{ "@type": "ListItem", position: 2, name: "Nonprofit Management Software", item: "https://thorbis.com/nonprofit-management-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function NonprofitManagementSoftware() {
	const features = [
		{ 
			title: "Donor Management", 
			points: ["Donor database", "Giving history", "Communication tracking"],
			icon: Heart,
			description: "Build stronger relationships with comprehensive donor profiles, giving history, and personalized communication tools."
		},
		{ 
			title: "Volunteer Coordination", 
			points: ["Volunteer scheduling", "Skill matching", "Hour tracking"],
			icon: Users,
			description: "Efficiently manage volunteers with smart scheduling, skill-based matching, and comprehensive hour tracking."
		},
		{ 
			title: "Fundraising & Campaigns", 
			points: ["Campaign management", "Event planning", "Grant tracking"],
			icon: Target,
			description: "Maximize fundraising success with campaign management, event coordination, and grant application tracking."
		},
		{ 
			title: "Financial Management", 
			points: ["Budget tracking", "Expense management", "Financial reporting"],
			icon: DollarSign,
			description: "Maintain financial transparency with budget tracking, expense management, and comprehensive reporting."
		},
		{ 
			title: "Impact Measurement", 
			points: ["Outcome tracking", "Impact reporting", "Program analytics"],
			icon: BarChart3,
			description: "Demonstrate your impact with comprehensive tracking and reporting of outcomes and program effectiveness."
		},
		{ 
			title: "Compliance & Security", 
			points: ["Tax compliance", "Data security", "Audit trails"],
			icon: Shield,
			description: "Stay compliant with nonprofit regulations while maintaining the highest standards of data security."
		},
	];

	const successStories = [
		{
			name: "Children's Education Fund",
			location: "Portland, OR",
			growth: "200% donor growth",
			story: "Streamlined donor management and fundraising campaigns resulted in unprecedented donor acquisition.",
			rating: 4.9,
			reviews: 78
		},
		{
			name: "Community Health Alliance",
			location: "Chicago, IL",
			growth: "$1.8M raised",
			story: "Comprehensive campaign management and volunteer coordination exceeded annual fundraising goals.",
			rating: 4.8,
			reviews: 92
		},
		{
			name: "Environmental Action Group",
			location: "San Francisco, CA",
			growth: "85% volunteer retention",
			story: "Improved volunteer management and engagement tools significantly increased supporter loyalty.",
			rating: 4.9,
			reviews: 64
		}
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
					<p className="text-sm text-muted-foreground">Trusted by 120+ nonprofits • 4.9/5 organization satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Nonprofit Management Software
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive nonprofit management platform with donor relationship management, fundraising tools, volunteer coordination, and impact tracking designed to amplify your mission.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-rose-600 px-6 py-3 text-white font-semibold hover:bg-rose-700 transition-colors">
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
							<feature.icon className="w-8 h-8 text-rose-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-rose-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Nonprofit Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how nonprofits are amplifying their impact with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<Heart className="w-6 h-6 text-rose-600" />
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
						<div className="text-3xl font-bold text-rose-600 mb-2">$65M+</div>
						<div className="text-sm text-muted-foreground">Funds raised</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-rose-600 mb-2">120+</div>
						<div className="text-sm text-muted-foreground">Nonprofits served</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-rose-600 mb-2">15K+</div>
						<div className="text-sm text-muted-foreground">Volunteers managed</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-rose-600 mb-2">95%</div>
						<div className="text-sm text-muted-foreground">Donor retention rate</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-rose-600 to-rose-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Amplify Your Mission</h2>
				<p className="text-lg mb-6 opacity-90">Join nonprofits worldwide using Thorbis to increase donations and maximize their impact.</p>
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
