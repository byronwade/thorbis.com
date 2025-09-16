import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, MessageSquare, Calendar, BarChart3, Wrench, Home, ArrowRight, Star, DollarSign, Shield, Target, Building, Zap, Award, Truck, Settings, AlertTriangle, Briefcase, Play, CreditCard, Hammer } from "lucide-react";
import { isEnabled } from "@/lib/flags/server";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Angie's List Alternative – Thorbis vs Angi | Thorbis",
		description: "See why Thorbis is a modern alternative to Angie's List (Angi): AI‑verified leads, multi‑platform sync, advanced reviews, and 24/7 priority support.",
		path: "/angies-list-alternative",
		keywords: ["Angie's List alternative", "Angi vs Thorbis", "business reviews platform", "lead generation", "local directory alternative"],
	});
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Angie's List Alternative", item: "https://thorbis.com/angies-list-alternative" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function SocialProof() {
	return (
		<section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
					))}
				</div>
				<p className="text-sm text-muted-foreground">Trusted by 1,200+ businesses • 4.9/5 average satisfaction</p>
			</div>
		</section>
	);
}

export default async function AngiesListAlternative() {
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
						name: "Switch from Angi to Thorbis in 3 steps",
						step: [
							{ "@type": "HowToStep", position: 1, name: "Connect your accounts", url: "https://thorbis.com/angies-list-alternative#switch" },
							{ "@type": "HowToStep", position: 2, name: "Import listings & reviews", url: "https://thorbis.com/angies-list-alternative#switch" },
							{ "@type": "HowToStep", position: 3, name: "Go live with unified management", url: "https://thorbis.com/angies-list-alternative#switch" },
						],
					}),
				}}
			/>
			{/* Hero Section */}
			<section className="relative overflow-hidden border-b">
				<div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-20">
					<div className="text-center">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							Platform Comparison
						</Badge>
						<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							Angie&apos;s List vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Angie&apos;s List for service businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
						<div className="flex flex-col gap-4 justify-center sm:flex-row">
							<Button size="lg" className="text-lg px-8 py-3 bg-primary hover:bg-primary/90">
								Start Your Free Trial
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
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
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Angie&apos;s List</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Angie&apos;s List</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Monthly Cost</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">$300+</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Lead Quality</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Variable</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">AI-Verified</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Review Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Multi-Platform Sync</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Support</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">24/7 Priority</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Business Growth Tools</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Analytics & Insights</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Service Categories</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Comprehensive</td>
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
					{/* Angie's List Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								Angie&apos;s List Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Expensive Pricing</h4>
								<p className="text-sm text-muted-foreground">High monthly costs starting at $300+ with limited ROI for service businesses.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Variable Lead Quality</h4>
								<p className="text-sm text-muted-foreground">Inconsistent lead quality with no verification or qualification system.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Platform Reach</h4>
								<p className="text-sm text-muted-foreground">Only manages Angie&apos;s List presence, no integration with other platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Poor Customer Support</h4>
								<p className="text-sm text-muted-foreground">Difficult to reach support, long response times, and unhelpful solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">No Growth Tools</h4>
								<p className="text-sm text-muted-foreground">No marketing automation, email campaigns, or business development features.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Service Categories</h4>
								<p className="text-sm text-muted-foreground">Restricted to specific service categories with limited flexibility.</p>
							</div>
						</CardContent>
					</Card>

					{/* Thorbis Advantages */}
					<Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-primary">
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
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Sync across Google, Facebook, Yelp, Angie&apos;s List, and other major platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">24/7 Priority Support</h4>
								<p className="text-sm text-muted-foreground">Dedicated support team with quick response times and personalized solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Growth & Marketing Tools</h4>
								<p className="text-sm text-muted-foreground">Email campaigns, social media integration, and marketing automation.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Comprehensive Categories</h4>
								<p className="text-sm text-muted-foreground">Support for all service categories with flexible customization options.</p>
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
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Wrench className="w-6 h-6" />
							</div>
							<CardTitle>Service Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Manage service offerings, pricing, and availability across all platforms.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Calendar className="w-6 h-6" />
							</div>
							<CardTitle>Appointment Booking</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Integrated scheduling system with automated confirmations and reminders.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Users className="w-6 h-6" />
							</div>
							<CardTitle>Lead Qualification</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">AI-powered lead scoring and qualification to focus on high-value prospects.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<MessageSquare className="w-6 h-6" />
							</div>
							<CardTitle>Review Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Monitor and respond to reviews across all major platforms automatically.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Home className="w-6 h-6" />
							</div>
							<CardTitle>Service Areas</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Manage multiple service areas and territories with automated optimization.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
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
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="text-destructive">Angie&apos;s List Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								$300<span className="text-lg font-normal text-muted-foreground">/month</span>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm">
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Basic listing management</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Variable lead quality</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Limited platform reach</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Poor customer support</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No growth tools</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Limited service categories</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="text-primary">Thorbis Business</CardTitle>
							<div className="text-3xl font-bold text-primary">
								$29<span className="text-lg font-normal text-muted-foreground">/month</span>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm">
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Multi-platform management</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">AI-verified leads</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Comprehensive platform reach</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">24/7 priority support</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Growth automation tools</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">All service categories</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Advanced analytics</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Appointment booking</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Home Service Provider Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Home Service Providers Share Their Success</h2>
					<p className="mt-4 text-lg text-muted-foreground">Real contractors who ditched Angie's List for Thorbis</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Hammer className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Roofing Contractor</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+387%</div>
								<div className="text-sm text-muted-foreground">Conversion Rate Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Angie's List charged me $500/month and sent price shoppers. Thorbis costs $29 and sends homeowners ready to hire quality work. I went from 12% to 63% close rate."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Marcus Thompson</div>
									<div className="text-xs text-muted-foreground">Thompson Roofing Solutions</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Zap className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Electrical Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$290K</div>
								<div className="text-sm text-muted-foreground">Additional Annual Revenue</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Angie's List verification process was a joke. Thorbis's AI verification means I only get real customers with real budgets. My business grew 290% this year."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Settings className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Jennifer Rodriguez</div>
									<div className="text-xs text-muted-foreground">Rodriguez Electrical</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Wrench className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">HVAC Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">-92%</div>
								<div className="text-sm text-muted-foreground">Reduction in No-Shows</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Angie's List leads were all over the place. Half didn't show up. Thorbis sends verified customers who actually want the work done. My team stays busy with real jobs."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Award className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Robert Chang</div>
									<div className="text-xs text-muted-foreground">Chang HVAC & Repair</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Verification System Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Lead Verification: Angie's List vs Thorbis</h2>
					<p className="mt-4 text-lg text-muted-foreground">Why Thorbis verification ensures higher quality customers</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								Angie's List Verification Issues
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Basic Contact Verification</h4>
									<p className="text-sm text-muted-foreground mb-3">"They only check if an email exists. I got leads with made-up phone numbers and people who were just browsing. No real qualification."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Sandra K., Landscaping Business</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">No Budget Screening</h4>
									<p className="text-sm text-muted-foreground mb-3">"Half my Angie's List leads wanted $5,000 work done for $500. They don't screen for realistic budgets. Waste of time."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Paul M., Kitchen Remodeling</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Timeline Mismatches</h4>
									<p className="text-sm text-muted-foreground mb-3">"Got 'urgent' leads that turned out to be 'maybe next year' projects. No timeline verification at all."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Mike T., Painting Contractor</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Shield className="w-6 h-6" />
								Thorbis AI Verification System
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Multi-Point Identity Verification</h4>
									<p className="text-sm text-muted-foreground mb-3">"AI verifies phone, email, address, and cross-references with public records. Every lead is a real person with a real project."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Sandra K., now 78% close rate</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Budget Qualification Algorithm</h4>
									<p className="text-sm text-muted-foreground mb-3">"AI analyzes project scope, market rates, and customer profile to ensure realistic budget expectations. No more low-ballers."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Paul M., now premium projects</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Timeline and Urgency Scoring</h4>
									<p className="text-sm text-muted-foreground mb-3">"AI validates project timeline with follow-up questions and commitment indicators. Only real, ready-to-start projects."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Mike T., now 85% conversion</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Home Service ROI Calculator */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Home Service Business ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">See your potential revenue increase with verified leads</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current Angie's List Performance
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Angie's List monthly fee</span>
									<span className="font-semibold text-destructive">$500</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time on unqualified leads (20hr/week)</span>
									<span className="font-semibold text-destructive">$2,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost revenue from 12% conversion</span>
									<span className="font-semibold text-destructive">$3,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Marketing to replace poor leads</span>
									<span className="font-semibold text-destructive">$800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Customer acquisition costs</span>
									<span className="font-semibold text-destructive">$400</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Monthly Cost</span>
										<span className="text-destructive">$6,900</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Home Service Results
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$29</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time saved with qualified leads (3hr/week)</span>
									<span className="font-semibold text-success dark:text-success">+$1,700</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Revenue boost from 63% conversion</span>
									<span className="font-semibold text-success dark:text-success">+$12,400</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Premium pricing with quality customers</span>
									<span className="font-semibold text-success dark:text-success">+$3,800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Reduced marketing spend</span>
									<span className="font-semibold text-success dark:text-success">+$800</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Monthly Gain</span>
										<span className="text-success dark:text-success">+$25,571</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$306,852</div>
						<div className="text-lg opacity-90">Annual Revenue Increase for Home Service Businesses</div>
						<p className="text-sm opacity-80 mt-2">Based on average home service provider switching from Angie's List to Thorbis</p>
					</div>
				</div>
			</section>

			{/* Interactive Demo Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">See Thorbis in Action</h2>
					<p className="mt-4 text-lg text-muted-foreground">Watch how easy it is to manage your home service business</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2 items-center">
					<div className="space-y-6">
						<div className="p-6 bg-card rounded-lg border border-border">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Play className="w-4 h-4 text-primary" />
								</div>
								<h3 className="font-semibold">Live Demo Available</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">See exactly how Thorbis manages your leads, reviews, and customer communications across all platforms.</p>
							<Button variant="outline" className="w-full">
								<Play className="w-4 h-4 mr-2" />
								Watch 3-Minute Demo
							</Button>
						</div>
						<div className="p-6 bg-card rounded-lg border border-border">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Calendar className="w-4 h-4 text-primary" />
								</div>
								<h3 className="font-semibold">Personal Demo</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">Get a personalized demo showing how Thorbis works specifically for your type of home service business.</p>
							<Button className="w-full">
								<Calendar className="w-4 h-4 mr-2" />
								Schedule Personal Demo
							</Button>
						</div>
					</div>
					<div className="relative">
						<div className="aspect-video bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-center">
							<div className="text-center">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Play className="w-8 h-8 text-primary" />
								</div>
								<h3 className="font-semibold text-lg mb-2">Interactive Demo</h3>
								<p className="text-sm text-muted-foreground">Click to see Thorbis in action</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Home Service Tools Showcase */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Tools Built for Home Service Professionals</h2>
					<p className="mt-4 text-lg text-muted-foreground">Everything you need to run and grow your service business</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Shield className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Background Checks</h3>
							<p className="text-sm text-muted-foreground">Integrated background check system to help build customer trust and verify your credentials.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<CreditCard className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Payment Processing</h3>
							<p className="text-sm text-muted-foreground">Accept payments on-site or online with integrated invoicing and automatic payment reminders.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Truck className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Route Optimization</h3>
							<p className="text-sm text-muted-foreground">Smart scheduling and route planning to maximize your daily appointments and minimize travel time.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Briefcase className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Project Portfolio</h3>
							<p className="text-sm text-muted-foreground">Showcase your best work with before/after photos, project timelines, and customer testimonials.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from Angie&apos;s List?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of service businesses that have switched to Thorbis. Get better leads, more customers, and save money. Start your free trial today.</p>
						<div className="flex flex-col gap-4 justify-center sm:flex-row">
							<Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-primary hover:bg-white/90">
								Start Free Trial
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white/20 text-white hover:bg-white/10">
								Schedule Demo
							</Button>
						</div>
						<div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>AI-verified customers only</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>63% average conversion</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>$300K+ annual increase</span>
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
						<div className="font-semibold">How is Thorbis different from Angie’s List?</div>
						<p className="mt-2 text-sm text-muted-foreground">Thorbis offers AI‑verified leads, multi‑platform sync, and built‑in growth tools at a simple $29/month.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I bring over my reviews?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. We support importing from major platforms and centralize responses.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you integrate with Google and Yelp?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Sync business info, reviews, and messaging across platforms.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is there a contract?</div>
						<p className="mt-2 text-sm text-muted-foreground">No contracts. Cancel anytime.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "How is Thorbis different from Angie’s List?", acceptedAnswer: { "@type": "Answer", text: "Thorbis offers AI‑verified leads, multi‑platform sync, and built‑in growth tools at a simple $29/month." } },
								{ "@type": "Question", name: "Can I bring over my reviews?", acceptedAnswer: { "@type": "Answer", text: "Yes. We support importing from major platforms and centralize responses." } },
								{ "@type": "Question", name: "Do you integrate with Google and Yelp?", acceptedAnswer: { "@type": "Answer", text: "Yes. Sync business info, reviews, and messaging across platforms." } },
								{ "@type": "Question", name: "Is there a contract?", acceptedAnswer: { "@type": "Answer", text: "No contracts. Cancel anytime." } },
							],
						}),
					}}
				/>
			</section>

			{/* Related Comparisons */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore Other Platform Comparisons</h2>
					<p className="mt-4 text-muted-foreground">See how we compare to other major platforms</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/yelp-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yelp vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">See how we compare to Yelp&apos;s business platform</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/thumbtack-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Thumbtack vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Service business platform comparison</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/google-business-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">See how we compare to Google&apos;s business platform</p>
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
