import { Handshake, Target, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { isEnabled } from "@/lib/flags/server";

import { generateStaticPageMetadata } from "@utils/server-seo";

const partners = [
	{ name: "Partner One", logo: "/placeholder.svg" },
	{ name: "Partner Two", logo: "/placeholder.svg" },
	{ name: "Partner Three", logo: "/placeholder.svg" },
	{ name: "Partner Four", logo: "/placeholder.svg" },
	{ name: "Partner Five", logo: "/placeholder.svg" },
	{ name: "Partner Six", logo: "/placeholder.svg" },
];

const partnershipBenefits = [
	{
		icon: <Zap className="mb-4 w-8 h-8 text-primary" />,
		title: "Accelerate Growth",
		description: "Leverage our platform to reach a wider audience and grow your business faster than ever before.",
	},
	{
		icon: <Handshake className="mb-4 w-8 h-8 text-primary" />,
		title: "Build Connections",
		description: "Connect with other businesses and leaders in the local community to foster collaboration and innovation.",
	},
	{
		icon: <Target className="mb-4 w-8 h-8 text-primary" />,
		title: "Reach a Targeted Audience",
		description: "Our platform is designed to connect you with customers who are actively seeking your products and services.",
	},
];

const affiliateBenefits = [
	{
		icon: <Zap className="w-8 h-8 mb-4 text-primary" />,
		title: "Competitive Commissions",
		description: "Earn generous commissions for every customer you refer to our platform. The more you refer, the more you earn.",
	},
	{
		icon: <Handshake className="w-8 h-8 mb-4 text-primary" />,
		title: "Marketing Support",
		description: "Gain access to a wealth of marketing materials, including banners, links, and content to help you succeed.",
	},
	{
		icon: <Target className="w-8 h-8 mb-4 text-primary" />,
		title: "Real-Time Tracking",
		description: "Our advanced dashboard provides real-time tracking of your referrals, earnings, and performance.",
	},
];

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Partners & Affiliates - Collaborate & Earn with Thorbis",
		description: "Join Thorbis",
		path: "/partners",
		keywords: ["business partnerships", "affiliate program", "thorbis partners", "earn commissions", "referral program", "business collaboration"],
	});
}

export default async function PartnersPage() {
	const affiliatesEnabled = await isEnabled("affiliates");
	
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Partners & Affiliates",
		description: "Thorbis partnership opportunities and affiliate program for earning commissions",
		url: "https://thorbis.com/partners",
		mainEntity: {
			"@type": "Organization",
			name: "Thorbis Partner Network",
			description: "Network of business partners and affiliates collaborating with Thorbis",
			hasOfferCatalog: {
				"@type": "OfferCatalog",
				name: "Partnership & Affiliate Benefits",
				itemListElement: [
					...partnershipBenefits.map((benefit, index) => ({
						"@type": "Offer",
						position: index + 1,
						itemOffered: {
							"@type": "Service",
							name: benefit.title,
							description: benefit.description,
						},
					})),
					...(affiliatesEnabled ? affiliateBenefits.map((benefit, index) => ({
						"@type": "Offer",
						position: partnershipBenefits.length + index + 1,
						itemOffered: {
							"@type": "Service",
							name: benefit.title,
							description: benefit.description,
						},
					})) : []),
				],
			},
		},
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					item: {
						"@id": "https://thorbis.com",
						name: "Thorbis",
					},
				},
				{
					"@type": "ListItem",
					position: 2,
					item: {
						"@id": "https://thorbis.com/partners",
						name: "Partners & Affiliates",
					},
				},
			],
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<div className="bg-background text-foreground">
				{/* Hero Section */}
				<div className="relative h-96">
					<Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Partners & Affiliates" layout="fill" objectFit="cover" className="opacity-30" />
					<div className="absolute inset-0 bg-gradient-to-t to-transparent from-background" />
					<div className="flex relative flex-col justify-center items-center px-4 h-full text-center">
						<h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">Partners & Affiliates</h1>
						<p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">Join our network through strategic partnerships or our affiliate program to collaborate and earn with Thorbis.</p>
					</div>
				</div>

				{/* Tabs Section */}
				<div className="px-4 py-24 lg:px-24">
					<div className="mx-auto max-w-6xl">
						<Tabs defaultValue="partnerships" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="partnerships">Business Partnerships</TabsTrigger>
								{affiliatesEnabled && <TabsTrigger value="affiliates">Affiliate Program</TabsTrigger>}
							</TabsList>

							<TabsContent value="partnerships" className="mt-8">
								<div className="space-y-16">
									{/* Partnership Benefits */}
									<div className="space-y-12">
										<div className="text-center">
											<h2 className="text-3xl font-bold tracking-tight mb-4">Why Partner With Us?</h2>
											<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Collaborate with leading companies to bring the best services to our community.</p>
										</div>
										<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
											{partnershipBenefits.map((benefit, index) => (
												<Card key={index} className="text-center">
													<CardHeader>
														<div className="p-3 mx-auto rounded-full bg-primary/10 w-fit">{benefit.icon}</div>
													</CardHeader>
													<CardContent>
														<h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
														<p className="text-muted-foreground">{benefit.description}</p>
													</CardContent>
												</Card>
											))}
										</div>
									</div>

									{/* Partners Logos */}
									<div className="bg-muted p-12 rounded-lg">
										<h3 className="mb-8 text-2xl font-bold tracking-tight text-center">Proudly Partnered With</h3>
										<div className="grid grid-cols-2 gap-8 items-center md:grid-cols-3 lg:grid-cols-6">
											{partners.map((partner, index) => (
												<div key={index} className="flex justify-center">
													<Image src={partner.logo} alt={partner.name} width={120} height={60} className="grayscale transition-all hover:grayscale-0" />
												</div>
											))}
										</div>
									</div>

									{/* Partnership CTA */}
									<div className="text-center">
										<h3 className="mb-4 text-2xl font-bold tracking-tight">Become a Partner</h3>
										<p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">Join our growing network of partners and help us build a stronger local community. We are always looking for new opportunities to collaborate.</p>
										<Button asChild size="lg">
											<Link href="/contact-support?subject=Partnership">Contact Us</Link>
										</Button>
									</div>
								</div>
							</TabsContent>

							{affiliatesEnabled && (
								<TabsContent value="affiliates" className="mt-8">
									<div className="space-y-16">
										{/* Affiliate Benefits */}
										<div className="space-y-12">
											<div className="text-center">
												<h2 className="text-3xl font-bold tracking-tight mb-4">Why Become an Affiliate?</h2>
												<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Partner with us and earn rewards for helping your audience discover our services.</p>
											</div>
											<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
												{affiliateBenefits.map((benefit, index) => (
													<Card key={index} className="text-center">
														<CardHeader>
															<div className="p-3 mx-auto rounded-full bg-primary/10 w-fit">{benefit.icon}</div>
														</CardHeader>
														<CardContent>
															<h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
															<p className="text-muted-foreground">{benefit.description}</p>
														</CardContent>
													</Card>
												))}
											</div>
										</div>

										{/* How it Works */}
										<div className="bg-muted p-12 rounded-lg">
											<h3 className="text-2xl font-bold tracking-tight text-center mb-8">Simple Steps to Get Started</h3>
											<div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
												<div className="text-center flex flex-col items-center">
													<div className="text-5xl font-bold text-primary mb-2">1</div>
													<h4 className="text-xl font-semibold">Sign Up</h4>
													<p className="text-muted-foreground max-w-xs">Create your affiliate account in just a few minutes.</p>
												</div>
												<div className="text-center flex flex-col items-center">
													<div className="text-5xl font-bold text-primary mb-2">2</div>
													<h4 className="text-xl font-semibold">Promote</h4>
													<p className="text-muted-foreground max-w-xs">Share your unique referral link with your audience.</p>
												</div>
												<div className="text-center flex flex-col items-center">
													<div className="text-5xl font-bold text-primary mb-2">3</div>
													<h4 className="text-xl font-semibold">Earn</h4>
													<p className="text-muted-foreground max-w-xs">Get paid for every successful referral.</p>
												</div>
											</div>
										</div>

										{/* Affiliate CTA */}
										<div className="text-center">
											<h3 className="text-2xl font-bold tracking-tight mb-4">Ready to Join?</h3>
											<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Become an affiliate today and start earning. It's free to join and easy to get started.</p>
											<Button asChild size="lg">
												<Link href="/contact-support?subject=Affiliate Program">Sign Up Now</Link>
											</Button>
										</div>
									</div>
								</TabsContent>
							)}
						</Tabs>
					</div>
				</div>
			</div>
		</>
	);
}
