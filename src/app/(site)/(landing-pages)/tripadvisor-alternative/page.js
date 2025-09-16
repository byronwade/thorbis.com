import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MessageSquare, Calendar, BarChart3, MapPin, Clock, Utensils, ArrowRight, Star, DollarSign, TrendingUp, Target, Building, Globe, Award, CreditCard, Truck, FileText } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "TripAdvisor Alternative – Thorbis vs TripAdvisor | Thorbis",
		description: "See why Thorbis is a modern alternative to TripAdvisor: advanced review management, reservation integration, lead generation, and analytics.",
		path: "/tripadvisor-alternative",
		keywords: ["TripAdvisor alternative", "TripAdvisor vs Thorbis", "restaurant reviews platform", "reservation system integration", "lead generation"],
	});
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "TripAdvisor Alternative", item: "https://thorbis.com/tripadvisor-alternative" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function TripAdvisorAlternative() {
	return (
		<main className="relative min-h-screen bg-background">
			<BreadcrumbsJsonLd />
			{/* Hero Section */}
			<section className="relative overflow-hidden border-b">
				<div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-20">
					<div className="text-center">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							Platform Comparison
						</Badge>
						<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							TripAdvisor vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to TripAdvisor for restaurants and travel businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
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

			{/* Social Proof */}
			<section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 1,200+ restaurants and travel brands • 4.9/5 satisfaction</p>
				</div>
			</section>

			{/* Quick Comparison Table */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quick Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against TripAdvisor</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">TripAdvisor</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Monthly Cost</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">$200+</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Review Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Reservation System</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Full Integration</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Lead Generation</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Support</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">24/7 Priority</td>
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
									<td className="px-6 py-4 font-medium text-foreground">Business Growth Tools</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Menu Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced</td>
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
					{/* TripAdvisor Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								TripAdvisor&apos;s Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Expensive Pricing</h4>
								<p className="text-sm text-muted-foreground">High monthly costs starting at $200+ with limited value for the investment.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Review Control</h4>
								<p className="text-sm text-muted-foreground">No tools to manage or respond to reviews effectively across platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Poor Reservation Integration</h4>
								<p className="text-sm text-muted-foreground">Basic booking system that doesn&apos;t integrate with existing POS systems.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">No Lead Generation</h4>
								<p className="text-sm text-muted-foreground">No tools to capture and convert profile visitors into customers.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Single Platform Focus</h4>
								<p className="text-sm text-muted-foreground">Only manages TripAdvisor presence, no integration with other platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Analytics</h4>
								<p className="text-sm text-muted-foreground">Basic reporting with no actionable insights for business growth.</p>
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
								<h4 className="font-semibold text-success dark:text-success">Advanced Review Management</h4>
								<p className="text-sm text-muted-foreground">AI-powered review monitoring and response system across all platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Integrated Reservation System</h4>
								<p className="text-sm text-muted-foreground">Seamless integration with major POS systems and calendar platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Lead Generation Tools</h4>
								<p className="text-sm text-muted-foreground">Automated lead capture and customer conversion system.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Sync across Google, Facebook, Yelp, TripAdvisor, and other platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Advanced Analytics</h4>
								<p className="text-sm text-muted-foreground">Comprehensive insights with AI-powered recommendations for growth.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Restaurant-Specific Features */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Restaurant & Travel Business Features</h2>
					<p className="mt-4 text-lg text-muted-foreground">Specialized tools for your industry</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Utensils className="w-6 h-6" />
							</div>
							<CardTitle>Menu Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Easy menu updates, pricing management, and special offers across all platforms.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Calendar className="w-6 h-6" />
							</div>
							<CardTitle>Reservation System</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Integrated booking system with automated confirmations and reminders.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Clock className="w-6 h-6" />
							</div>
							<CardTitle>Hours Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Automated hours updates, holiday schedules, and special event management.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<MapPin className="w-6 h-6" />
							</div>
							<CardTitle>Location Services</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Multi-location management, directions, and local SEO optimization.</p>
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
							<p className="text-sm text-muted-foreground">Monitor and respond to reviews across TripAdvisor, Google, Yelp, and more.</p>
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
							<p className="text-sm text-muted-foreground">Track reservations, reviews, and customer engagement across all platforms.</p>
						</CardContent>
					</Card>
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
							<CardTitle className="text-destructive">TripAdvisor Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								$200<span className="text-lg font-normal text-muted-foreground">/month</span>
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
									<span className="text-muted-foreground">Limited review responses</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No lead generation</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Single platform focus</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Basic analytics</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No growth tools</span>
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
									<span className="text-muted-foreground">AI-powered review management</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Lead generation system</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Reservation integration</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Advanced analytics</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Menu management</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">24/7 priority support</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Growth automation tools</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Restaurant Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Restaurant Owners Share Their Results</h2>
					<p className="mt-4 text-lg text-muted-foreground">Real restaurants, real revenue growth with Thorbis</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Award className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Fine Dining</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+145%</div>
								<div className="text-sm text-muted-foreground">Reservation Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"TripAdvisor was expensive and gave us no control. Since switching to Thorbis, reservations increased 145% and we saved $2,000/month. The POS integration is seamless."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Utensils className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Chef Marcus Williams</div>
									<div className="text-xs text-muted-foreground">Owner, Williams Fine Dining</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<TrendingUp className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Fast Casual</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+267%</div>
								<div className="text-sm text-muted-foreground">Online Orders</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Thorbis connected our ordering system to all review platforms. Online orders went up 267% and our menu updates sync everywhere automatically. Game changer."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Sarah Kim</div>
									<div className="text-xs text-muted-foreground">Owner, Seoul Kitchen (3 locations)</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Globe className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Boutique Hotel</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+89%</div>
								<div className="text-sm text-muted-foreground">Direct Bookings</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"We reduced TripAdvisor dependence and increased direct bookings by 89%. Thorbis helps us manage reviews across all platforms and capture more leads."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">David Chen</div>
									<div className="text-xs text-muted-foreground">Manager, Harbor View Inn</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* POS & Technology Integrations */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Seamless Restaurant Technology Integration</h2>
					<p className="mt-4 text-lg text-muted-foreground">Connect with your existing POS, ordering, and reservation systems</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8">
						<CardHeader className="px-0 pt-0">
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="w-5 h-5 text-primary" />
								POS System Integration
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0">
							<p className="text-muted-foreground mb-6">Sync your menu, pricing, and availability across all platforms automatically. Real-time updates ensure customers always see accurate information.</p>
							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Square</div>
									<div className="text-xs text-muted-foreground">Full Integration</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Toast</div>
									<div className="text-xs text-muted-foreground">Menu & Orders</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Clover</div>
									<div className="text-xs text-muted-foreground">Real-time Sync</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Resy</div>
									<div className="text-xs text-muted-foreground">Reservations</div>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Menu items sync across all platforms</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Pricing updates in real-time</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Availability tracking</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8">
						<CardHeader className="px-0 pt-0">
							<CardTitle className="flex items-center gap-2">
								<Truck className="w-5 h-5 text-primary" />
								Delivery & Ordering Platforms
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0">
							<p className="text-muted-foreground mb-6">Manage orders from DoorDash, Uber Eats, Grubhub, and your direct online ordering from one dashboard.</p>
							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">DoorDash</div>
									<div className="text-xs text-muted-foreground">Order Management</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Uber Eats</div>
									<div className="text-xs text-muted-foreground">Menu Sync</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Grubhub</div>
									<div className="text-xs text-muted-foreground">Analytics</div>
								</div>
								<div className="p-3 bg-primary/5 rounded-lg text-center">
									<div className="font-semibold text-sm">Direct Orders</div>
									<div className="text-xs text-muted-foreground">Commission-Free</div>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Unified order dashboard</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Commission tracking</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-success dark:text-success" />
									<span>Customer data aggregation</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* TripAdvisor vs Thorbis Detailed Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Restaurants Choose Thorbis Over TripAdvisor</h2>
					<p className="mt-4 text-lg text-muted-foreground">Feature-by-feature comparison for the hospitality industry</p>
				</div>
				<div className="max-w-6xl mx-auto">
					<Card className="overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-primary text-primary-foreground">
									<tr>
										<th className="px-6 py-4 text-left font-semibold">Feature</th>
										<th className="px-6 py-4 text-center font-semibold">TripAdvisor</th>
										<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
										<th className="px-6 py-4 text-center font-semibold">Benefit</th>
									</tr>
								</thead>
								<tbody className="bg-card divide-y divide-border">
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Menu Management</td>
										<td className="px-6 py-4 text-center text-warning dark:text-warning">Manual Updates</td>
										<td className="px-6 py-4 text-center text-success dark:text-success font-bold">POS Integration</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Save 10hrs/week</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Reservation System</td>
										<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
										<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Full Integration</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">+40% bookings</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Review Response</td>
										<td className="px-6 py-4 text-center text-warning dark:text-warning">TripAdvisor Only</td>
										<td className="px-6 py-4 text-center text-success dark:text-success font-bold">All Platforms</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Unified reputation</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Analytics & Reporting</td>
										<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
										<td className="px-6 py-4 text-center text-success dark:text-success font-bold">AI-Powered</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Data-driven decisions</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Customer Data</td>
										<td className="px-6 py-4 text-center">
											<XCircle className="inline w-5 h-5 text-destructive" />
										</td>
										<td className="px-6 py-4 text-center">
											<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
										</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Build customer database</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Direct Booking Promotion</td>
										<td className="px-6 py-4 text-center">
											<XCircle className="inline w-5 h-5 text-destructive" />
										</td>
										<td className="px-6 py-4 text-center">
											<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
										</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Reduce commissions</td>
									</tr>
									<tr className="hover:bg-muted/50 transition-colors">
										<td className="px-6 py-4 font-medium">Monthly Cost</td>
										<td className="px-6 py-4 text-center text-destructive font-semibold">$200+</td>
										<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29</td>
										<td className="px-6 py-4 text-center text-sm text-muted-foreground">Save $2,052/year</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Card>
				</div>
			</section>

			{/* Restaurant ROI Calculator */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Restaurant ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">See your potential savings and revenue increase</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current TripAdvisor Costs
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">TripAdvisor subscription</span>
									<span className="font-semibold text-destructive">$200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Commission fees (3rd party bookings)</span>
									<span className="font-semibold text-destructive">$800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Manual menu management (10hr/week)</span>
									<span className="font-semibold text-destructive">$1,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost direct bookings</span>
									<span className="font-semibold text-destructive">$1,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Review management across platforms</span>
									<span className="font-semibold text-destructive">$400</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Monthly Cost</span>
										<span className="text-destructive">$3,600</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Restaurant Solution
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$29</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Reduced commission fees</span>
									<span className="font-semibold text-success dark:text-success">-$400</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Automated menu management</span>
									<span className="font-semibold text-success dark:text-success">-$1,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Increased direct bookings (+40%)</span>
									<span className="font-semibold text-success dark:text-success">+$2,400</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Unified review management</span>
									<span className="font-semibold text-success dark:text-success">-$400</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Monthly Gain</span>
										<span className="text-success dark:text-success">+$4,771</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$57,252</div>
						<div className="text-lg opacity-90">Annual Restaurant Savings & Growth</div>
						<p className="text-sm opacity-80 mt-2">Plus improved customer experience and streamlined operations</p>
					</div>
				</div>
			</section>

			{/* Restaurant-Specific Features */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built Specifically for Restaurants</h2>
					<p className="mt-4 text-lg text-muted-foreground">Features that understand your business needs</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<FileText className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Dynamic Menu Management</h3>
							<p className="text-sm text-muted-foreground">Update menus, prices, and availability across all platforms from your POS system in real-time.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Smart Reservations</h3>
							<p className="text-sm text-muted-foreground">Integrated reservation system with automatic confirmation, reminders, and no-show reduction.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<MessageSquare className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Guest Communication</h3>
							<p className="text-sm text-muted-foreground">Automated follow-ups, special offers, and birthday/anniversary campaigns.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<BarChart3 className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Revenue Analytics</h3>
							<p className="text-sm text-muted-foreground">Track revenue sources, customer lifetime value, and optimize for direct bookings.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from TripAdvisor?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of restaurants and travel businesses that have switched to Thorbis. Get better results, more customers, and save money. Start your free trial today.</p>
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
								<span>POS integration included</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Menu sync automation</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Save $2,000+ monthly</span>
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
						<div className="font-semibold">Do you integrate with reservation systems?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Integrations with major POS and reservation platforms.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I manage reviews across platforms?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Monitor and respond across TripAdvisor, Google, Yelp, and more.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you integrate with reservation systems?", acceptedAnswer: { "@type": "Answer", text: "Yes. Integrations with major POS and reservation platforms." } },
								{ "@type": "Question", name: "Can I manage reviews across platforms?", acceptedAnswer: { "@type": "Answer", text: "Yes. Monitor and respond across TripAdvisor, Google, Yelp, and more." } },
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
					<Link href="/google-business-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">See how we compare to Google&apos;s business platform</p>
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
				</div>
			</section>
		</main>
	);
}
