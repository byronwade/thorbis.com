import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, MessageSquare, Calendar, BarChart3, Wrench, Home, ArrowRight, Star, DollarSign, Clock, Target, Building, Award, FileText, Truck, Settings, AlertTriangle, Heart, Briefcase } from "lucide-react";
import { isEnabled } from "@/lib/flags/server";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Bark Alternative – Thorbis vs Bark | Thorbis",
		description: "See why Thorbis is a modern alternative to Bark: AI‑verified leads, multi‑platform sync, unlimited lead volume, and 24/7 priority support.",
		path: "/bark-alternative",
		keywords: ["Bark alternative", "Bark vs Thorbis", "lead marketplace alternative", "service business leads", "local directory alternative"],
	});
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Bark Alternative", item: "https://thorbis.com/bark-alternative" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function SocialProof() {
	return (
		<section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
			<div className="flex flex-col gap-3 items-center text-center">
				<div className="flex gap-1 items-center text-amber-500" aria-label="rating 4.9 out of 5">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
					))}
				</div>
				<p className="text-sm text-muted-foreground">Trusted by 1,200+ businesses • 4.9/5 average satisfaction</p>
			</div>
		</section>
	);
}

export default async function BarkAlternative() {
	const on = await isEnabled("landingPages");
	if (!on) {
		return (
			<main className="relative min-h-screen bg-background">
				<section className="container mx-auto px-4 py-16">
					<h1 className="text-2xl font-semibold">This landing page is not available</h1>
					<p className="text-muted-foreground mt-2">Please check back soon.</p>
				</section>
			</main>
		);
	}
	return (
		<main className="relative min-h-screen bg-background">
			<BreadcrumbsJsonLd />
			{/* HowTo JSON-LD: Switch in 3 steps */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "HowTo",
						name: "Switch from Bark to Thorbis in 3 steps",
						step: [
							{ "@type": "HowToStep", position: 1, name: "Connect your accounts", url: "https://thorbis.com/bark-alternative#switch" },
							{ "@type": "HowToStep", position: 2, name: "Import listings & reviews", url: "https://thorbis.com/bark-alternative#switch" },
							{ "@type": "HowToStep", position: 3, name: "Go live with unified management", url: "https://thorbis.com/bark-alternative#switch" },
						],
					}),
				}}
			/>
			{/* Hero Section */}
			<section className="overflow-hidden relative border-b">
				<div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-20">
					<div className="text-center">
						<Badge variant="secondary" className="px-4 py-2 mb-6 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							Platform Comparison
						</Badge>
						<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							Bark vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Bark for service businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
						<div className="flex flex-col gap-4 justify-center sm:flex-row">
							<Button size="lg" className="px-8 py-3 text-lg bg-primary hover:bg-primary/90">
								Start Your Free Trial
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2">
								Schedule Demo
							</Button>
						</div>
					</div>
				</div>
			</section>

			<SocialProof />

			{/* Switch in 3 steps */}
			<section id="switch" className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Switch in 3 steps</h2>
					<p className="mt-2 text-muted-foreground">Fast migration without disruption</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					<Card className="p-6">
						<div className="text-sm font-semibold">1. Connect</div>
						<p className="mt-2 text-sm text-muted-foreground">Securely connect your existing accounts.</p>
					</Card>
					<Card className="p-6">
						<div className="text-sm font-semibold">2. Import</div>
						<p className="mt-2 text-sm text-muted-foreground">Bring listings, reviews, and business info in minutes.</p>
					</Card>
					<Card className="p-6">
						<div className="text-sm font-semibold">3. Go live</div>
						<p className="mt-2 text-sm text-muted-foreground">Manage every platform from one place.</p>
					</Card>
				</div>
			</section>

			{/* Quick Comparison Table */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quick Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Bark</p>
				</div>
				<div className="overflow-hidden rounded-xl border shadow-lg border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 font-semibold text-left">Feature</th>
									<th className="px-6 py-4 font-semibold text-center">Bark</th>
									<th className="px-6 py-4 font-semibold text-center">Thorbis</th>
								</tr>
							</thead>
							<tbody className="divide-y bg-card divide-border">
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Monthly Cost</td>
									<td className="px-6 py-4 font-semibold text-center text-destructive">$250+</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">$29</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Lead Quality</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Variable</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">AI-Verified</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Lead Volume</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">High Volume</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Multi-Platform Sync</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Customer Support</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">24/7 Priority</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Business Growth Tools</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Review Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">Advanced AI</td>
								</tr>
								<tr className="transition-colors hover:bg-muted/50">
									<td className="px-6 py-4 font-medium text-foreground">Service Categories</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 font-bold text-center text-success dark:text-success">Comprehensive</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Detailed Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Detailed Analysis</h2>
					<p className="mt-4 text-lg text-muted-foreground">Dive deeper into the differences</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Bark Analysis */}
					<Card className="transition-shadow border-destructive/20 hover:shadow-lg">
						<CardHeader>
							<CardTitle className="flex gap-3 items-center text-destructive">
								<XCircle className="w-6 h-6" />
								Bark&apos;s Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Expensive Pricing</h4>
								<p className="text-sm text-muted-foreground">High monthly costs starting at $250+ with limited ROI for service businesses.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Variable Lead Quality</h4>
								<p className="text-sm text-muted-foreground">Inconsistent lead quality with no verification or qualification system.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Lead Volume</h4>
								<p className="text-sm text-muted-foreground">Restricted number of leads per month with additional costs for more.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Single Platform Focus</h4>
								<p className="text-sm text-muted-foreground">Only manages Bark presence, no integration with other platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Poor Customer Support</h4>
								<p className="text-sm text-muted-foreground">Difficult to reach support, long response times, and unhelpful solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">No Growth Tools</h4>
								<p className="text-sm text-muted-foreground">No marketing automation, email campaigns, or business development features.</p>
							</div>
						</CardContent>
					</Card>

					{/* Thorbis Advantages */}
					<Card className="transition-shadow border-primary/20 bg-primary/5 hover:shadow-lg">
						<CardHeader>
							<CardTitle className="flex gap-3 items-center text-primary">
								<CheckCircle className="w-6 h-6" />
								Thorbis Advantages
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Affordable Pricing</h4>
								<p className="text-sm text-muted-foreground">Simple $29/month pricing with comprehensive features and no hidden fees.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">AI-Verified Leads</h4>
								<p className="text-sm text-muted-foreground">Advanced lead qualification system that ensures high-quality, ready-to-buy customers.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Unlimited Lead Volume</h4>
								<p className="text-sm text-muted-foreground">No limits on lead volume with automated scaling based on your capacity.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Sync across Google, Facebook, Yelp, Bark, and other major platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">24/7 Priority Support</h4>
								<p className="text-sm text-muted-foreground">Dedicated support team with quick response times and personalized solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Growth & Marketing Tools</h4>
								<p className="text-sm text-muted-foreground">Email campaigns, social media integration, and marketing automation.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Service Business Features */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Service Business Features</h2>
					<p className="mt-4 text-lg text-muted-foreground">Specialized tools for service professionals</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<Wrench className="w-6 h-6" />
							</div>
							<CardTitle>Service Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Manage service offerings, pricing, and availability across all platforms.</p>
						</CardContent>
					</Card>

					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<Calendar className="w-6 h-6" />
							</div>
							<CardTitle>Appointment Booking</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Integrated scheduling system with automated confirmations and reminders.</p>
						</CardContent>
					</Card>

					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<Users className="w-6 h-6" />
							</div>
							<CardTitle>Lead Qualification</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">AI-powered lead scoring and qualification to focus on high-value prospects.</p>
						</CardContent>
					</Card>

					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<MessageSquare className="w-6 h-6" />
							</div>
							<CardTitle>Review Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Monitor and respond to reviews across all major platforms automatically.</p>
						</CardContent>
					</Card>

					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<Home className="w-6 h-6" />
							</div>
							<CardTitle>Service Areas</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Manage multiple service areas and territories with automated optimization.</p>
						</CardContent>
					</Card>

					<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
						<CardHeader>
							<div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg text-primary-foreground bg-primary">
								<BarChart3 className="w-6 h-6" />
							</div>
							<CardTitle>Performance Analytics</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Track leads, conversions, and customer satisfaction across all platforms.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Role outcomes mapping */}
			<section className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-6 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Outcomes by role</h2>
				</div>
				<div className="overflow-hidden rounded-xl border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-muted">
								<tr>
									<th className="px-4 py-3 text-left text-sm font-semibold">Feature</th>
									<th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
									<th className="px-4 py-3 text-left text-sm font-semibold">Office Staff</th>
									<th className="px-4 py-3 text-left text-sm font-semibold">Technician</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								<tr>
									<td className="px-4 py-3 text-sm">AI‑verified leads</td>
									<td className="px-4 py-3 text-sm">Higher ROI</td>
									<td className="px-4 py-3 text-sm">Less screening</td>
									<td className="px-4 py-3 text-sm">More booked jobs</td>
								</tr>
								<tr>
									<td className="px-4 py-3 text-sm">Multi‑platform sync</td>
									<td className="px-4 py-3 text-sm">Consolidated spend</td>
									<td className="px-4 py-3 text-sm">Single inbox</td>
									<td className="px-4 py-3 text-sm">Clear schedule</td>
								</tr>
								<tr>
									<td className="px-4 py-3 text-sm">24/7 support</td>
									<td className="px-4 py-3 text-sm">Less downtime</td>
									<td className="px-4 py-3 text-sm">Faster resolutions</td>
									<td className="px-4 py-3 text-sm">On‑site help</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Pricing Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Pricing Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See the real cost difference</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="transition-shadow border-destructive/20 hover:shadow-lg">
						<CardHeader>
							<CardTitle className="text-destructive">Bark Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								$250<span className="text-lg font-normal text-muted-foreground">/month</span>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm">
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">Basic listing management</span>
								</li>
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">Variable lead quality</span>
								</li>
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">Limited lead volume</span>
								</li>
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">Single platform focus</span>
								</li>
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">Poor customer support</span>
								</li>
								<li className="flex gap-3 items-center">
									<XCircle className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-muted-foreground">No growth tools</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="transition-shadow border-primary/20 bg-primary/5 hover:shadow-lg">
						<CardHeader>
							<CardTitle className="text-primary">Thorbis Business</CardTitle>
							<div className="text-3xl font-bold text-primary">
								$29<span className="text-lg font-normal text-muted-foreground">/month</span>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm">
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Multi-platform management</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">AI-verified leads</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Unlimited lead volume</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Comprehensive platform reach</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">24/7 priority support</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Growth automation tools</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Advanced analytics</span>
								</li>
								<li className="flex gap-3 items-center">
									<CheckCircle className="flex-shrink-0 w-4 h-4 text-success dark:text-success" />
									<span className="text-muted-foreground">Appointment booking</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Contractor Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Real Contractors Share Their Success</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how service professionals transformed their business after leaving Bark</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Wrench className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">HVAC Contractor</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+234%</div>
								<div className="text-sm text-muted-foreground">Qualified Lead Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Bark leads were terrible - price shoppers and tire kickers. Thorbis's AI qualification means I only get serious customers ready to book. My close rate went from 15% to 68%."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Settings className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Tom Martinez</div>
									<div className="text-xs text-muted-foreground">Martinez HVAC Services</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Home className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">General Contractor</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$180K</div>
								<div className="text-sm text-muted-foreground">Annual Revenue Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"I was spending $400/month on Bark with poor results. Thorbis costs $29 and brought me $180K more revenue this year. The lead quality is night and day better."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Sarah Johnson</div>
									<div className="text-xs text-muted-foreground">Johnson Construction</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Truck className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Plumbing Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">-85%</div>
								<div className="text-sm text-muted-foreground">Time Wasted on Bad Leads</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Bark sent me 20 leads that went nowhere. Thorbis sends me 5 leads and I book 4 jobs. I'm making more money working fewer hours. This is how business should be."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Wrench className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">David Kim</div>
									<div className="text-xs text-muted-foreground">Kim's Emergency Plumbing</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Lead Quality Deep Dive */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Lead Quality: Bark vs Thorbis</h2>
					<p className="mt-4 text-lg text-muted-foreground">Why Thorbis leads convert 4x better than Bark leads</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								Bark Lead Problems
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Fake Contact Information</h4>
									<p className="text-sm text-muted-foreground mb-3">"30% of Bark leads had fake phone numbers or emails. I wasted so much time trying to reach people who didn't exist."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Mike P., Electrician</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Price Shopping Only</h4>
									<p className="text-sm text-muted-foreground mb-3">"Bark customers only cared about the lowest price. No one wanted quality work, just the cheapest quote possible."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Lisa R., Interior Designer</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">No Qualification Process</h4>
									<p className="text-sm text-muted-foreground mb-3">"Anyone could submit a request. I got 'leads' for jobs 200 miles away or completely outside my expertise."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Carlos D., Landscaper</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Heart className="w-6 h-6" />
								Thorbis Lead Quality
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">AI-Verified Information</h4>
									<p className="text-sm text-muted-foreground mb-3">"Every lead is verified before I get it. Real phone numbers, real emails, real projects. No more wasted calls."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Mike P., now 4x revenue</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Budget-Qualified Customers</h4>
									<p className="text-sm text-muted-foreground mb-3">"Thorbis pre-qualifies customers based on budget and timeline. I only speak to people ready to hire quality professionals."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Lisa R., now premium pricing</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Intelligent Matching</h4>
									<p className="text-sm text-muted-foreground mb-3">"AI matches me with perfect-fit customers in my service area with exactly the services I offer. Every lead is relevant."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Carlos D., now 80% close rate</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Service Business ROI Analysis */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Service Business ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">Calculate your potential revenue increase with quality leads</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current Bark Performance
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Bark monthly fee</span>
									<span className="font-semibold text-destructive">$250</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time wasted on bad leads (15hr/week)</span>
									<span className="font-semibold text-destructive">$1,500</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost revenue from poor conversion (15%)</span>
									<span className="font-semibold text-destructive">$2,800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Reputation damage from bad customers</span>
									<span className="font-semibold text-destructive">$800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Additional platform costs</span>
									<span className="font-semibold text-destructive">$200</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Monthly Cost</span>
										<span className="text-destructive">$5,550</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Service Business Results
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$29</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time saved with qualified leads (2hr/week)</span>
									<span className="font-semibold text-success dark:text-success">+$1,300</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Increased revenue from 68% conversion</span>
									<span className="font-semibold text-success dark:text-success">+$8,500</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Premium pricing with quality customers</span>
									<span className="font-semibold text-success dark:text-success">+$2,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Multi-platform presence included</span>
									<span className="font-semibold text-success dark:text-success">+$200</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Monthly Gain</span>
										<span className="text-success dark:text-success">+$17,721</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$212,652</div>
						<div className="text-lg opacity-90">Annual Revenue Increase for Service Businesses</div>
						<p className="text-sm opacity-80 mt-2">Based on average contractor switching from Bark to Thorbis</p>
					</div>
				</div>
			</section>

			{/* Service-Specific Tools */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Service Professionals</h2>
					<p className="mt-4 text-lg text-muted-foreground">Tools that understand your workflow and challenges</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Award className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Lead Scoring</h3>
							<p className="text-sm text-muted-foreground">AI scores leads based on budget, timeline, project scope, and past customer behavior.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Clock className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Job Scheduling</h3>
							<p className="text-sm text-muted-foreground">Integrated calendar with customer booking, automatic confirmations, and route optimization.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<FileText className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Quote Management</h3>
							<p className="text-sm text-muted-foreground">Professional quote templates, digital signatures, and automatic follow-up sequences.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Briefcase className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Job Portfolio</h3>
							<p className="text-sm text-muted-foreground">Showcase your best work with before/after photos, customer testimonials, and project details.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="overflow-hidden relative p-8 text-center rounded-2xl bg-primary text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from Bark?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of service businesses that have switched to Thorbis. Get better leads, more customers, and save money. Start your free trial today.</p>
						<div className="flex flex-col gap-4 justify-center sm:flex-row">
							<Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-white text-primary hover:bg-white/90">
								Start Free Trial
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white/20 hover:bg-white/10">
								Schedule Demo
							</Button>
						</div>
						<div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>AI-qualified leads only</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>68% average close rate</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>$200K+ annual increase</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Frequently asked questions</h2>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">How is Thorbis different from Bark?</div>
						<p className="mt-2 text-sm text-muted-foreground">AI‑verified leads, higher volume, and multi‑platform sync with simple $29/month pricing.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I import existing contacts?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Import contacts and past jobs via CSV or API.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support automated follow‑ups?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Built‑in automations for SMS/email follow‑ups and review requests.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is there a long‑term contract?</div>
						<p className="mt-2 text-sm text-muted-foreground">No. Month‑to‑month with the option to cancel anytime.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "How is Thorbis different from Bark?", acceptedAnswer: { "@type": "Answer", text: "AI‑verified leads, higher volume, and multi‑platform sync with simple $29/month pricing." } },
								{ "@type": "Question", name: "Can I import existing contacts?", acceptedAnswer: { "@type": "Answer", text: "Yes. Import contacts and past jobs via CSV or API." } },
								{ "@type": "Question", name: "Do you support automated follow‑ups?", acceptedAnswer: { "@type": "Answer", text: "Yes. Built‑in automations for SMS/email follow‑ups and review requests." } },
								{ "@type": "Question", name: "Is there a long‑term contract?", acceptedAnswer: { "@type": "Answer", text: "No. Month‑to‑month with the option to cancel anytime." } },
							],
						}),
					}}
				/>
			</section>

			{/* Related Comparisons */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore Other Platform Comparisons</h2>
					<p className="mt-4 text-muted-foreground">Comprehensive analyses with contractor success stories and detailed ROI breakdowns</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/angies-list-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Angie's List vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Home service verification system with +387% conversion rate increases</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/yelp-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yelp vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Industry-specific cost analysis and migration timeline tools</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/google-business-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Enhanced business features with $131K+ annual savings analysis</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/yellow-pages-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yellow Pages vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Digital transformation case studies with local business growth data</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/booking-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Booking.com vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel accommodation commission elimination strategies</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/expedia-alternative">
						<Card className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Expedia vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel business ROI with $528K+ total annual benefits</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>

			{/* Related comparisons JSON-LD */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, url: "https://thorbis.com/yelp-alternative" },
							{ "@type": "ListItem", position: 2, url: "https://thorbis.com/thumbtack-alternative" },
							{ "@type": "ListItem", position: 3, url: "https://thorbis.com/google-business-alternative" },
						],
					}),
				}}
			/>
		</main>
	);
}
