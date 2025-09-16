import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, MessageSquare, Calendar, BarChart3, MapPin, Clock, ArrowRight, Star, DollarSign, TrendingUp, Target, Building, Award, Play, AlertTriangle, Heart, Plane, Hotel, Globe } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
	title: "Expedia Alternative – Thorbis vs Expedia | Thorbis",
	description: "See why Thorbis is a modern alternative to Expedia: fixed pricing, direct customer relationships, full data access, and multi‑platform sync.",
	keywords: ["Expedia alternative", "Expedia vs Thorbis", "travel booking alternative", "commission free booking", "direct bookings platform"],
	alternates: { canonical: "https://thorbis.com/expedia-alternative" },
	openGraph: {
		title: "Expedia Alternative – Thorbis vs Expedia",
		description: "Modern alternative to Expedia with fixed pricing, direct relationships, full data access, and multi‑platform sync.",
		type: "website",
		url: "https://thorbis.com/expedia-alternative",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Expedia Alternative – Thorbis vs Expedia")}&description=${encodeURIComponent("Fixed pricing, direct relationships, data access, and multi‑platform sync.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis vs Expedia",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Expedia Alternative – Thorbis vs Expedia",
		description: "Modern alternative to Expedia with fixed pricing, direct relationships, full data access, and multi‑platform sync.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Expedia Alternative – Thorbis vs Expedia")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
	});
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Expedia Alternative", item: "https://thorbis.com/expedia-alternative" },
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

export default function ExpediaAlternative() {
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
							Expedia vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Expedia for travel and accommodation businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
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

			{/* Travel Business Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Travel Businesses Share Their Success</h2>
					<p className="mt-4 text-lg text-muted-foreground">Real accommodations that escaped Expedia's high commission trap</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Globe className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Resort Chain</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+445%</div>
								<div className="text-sm text-muted-foreground">Profit Margin Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Expedia was taking 25% commission plus penalties. Thorbis costs $29/month and we've increased our profit margins by 445%. We finally own our guest relationships."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Carlos Rivera</div>
									<div className="text-xs text-muted-foreground">Paradise Island Resorts</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Plane className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Travel Agency</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$180K</div>
								<div className="text-sm text-muted-foreground">Annual Commission Savings</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"We were hemorrhaging money to Expedia commissions. $180K saved annually with Thorbis, plus we can now offer competitive direct pricing. Game changer."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Users className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Amanda Foster</div>
									<div className="text-xs text-muted-foreground">Global Adventures Travel</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Hotel className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Independent Hotel</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">-91%</div>
								<div className="text-sm text-muted-foreground">Guest Acquisition Cost</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Expedia made us compete solely on price. With Thorbis, we showcase our unique value and build loyal customers. 85% of our guests now book direct."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Award className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Marie Dubois</div>
									<div className="text-xs text-muted-foreground">Le Petit Château Hotel</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Expedia Commission Problems Deep Dive */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">The Expedia Commission Problem</h2>
					<p className="mt-4 text-lg text-muted-foreground">Why Expedia's business model hurts accommodation providers</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								Expedia's Hidden Costs
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Escalating Commission Structure</h4>
									<p className="text-sm text-muted-foreground mb-3">"Started at 20%, now paying 25% plus processing fees. Every time we grow, they increase our commission rate. It's like being punished for success."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Robert S., Mountain Resort Owner</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Zero Guest Loyalty Opportunity</h4>
									<p className="text-sm text-muted-foreground mb-3">"Expedia treats our property like a commodity. Guests book through them, they control the relationship. We can't build repeat business or offer personal touches."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Sofia T., Boutique Hotel Manager</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Price Competition Race to Bottom</h4>
									<p className="text-sm text-muted-foreground mb-3">"They force us to compete only on price with no way to differentiate. Quality service doesn't matter - just who's cheapest. Destroying our industry."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Ahmed K., Family Hotel Owner</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Heart className="w-6 h-6" />
								Thorbis Empowers Properties
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Transparent Fixed Pricing</h4>
									<p className="text-sm text-muted-foreground mb-3">"$29/month regardless of booking volume. Last year we saved $156,000 in commissions. The more successful we become, the more we keep."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Robert S., now expanding property</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Direct Guest Relationships</h4>
									<p className="text-sm text-muted-foreground mb-3">"We have guest contact info, preferences, special requests. Built a loyalty program with 70% repeat booking rate. We're a destination, not a commodity."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Sofia T., now 5-star service</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Value-Based Competition</h4>
									<p className="text-sm text-muted-foreground mb-3">"We compete on experience, service, and unique offerings. Guests pay premium prices because they understand our value. Profitability is sustainable."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Ahmed K., now premium positioning</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Travel Business ROI Calculator */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Travel Business ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">Calculate your potential savings and revenue increase vs Expedia</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current Expedia Costs
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Commission fees (25% average)</span>
									<span className="font-semibold text-destructive">$75,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Processing and penalty fees</span>
									<span className="font-semibold text-destructive">$4,800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost direct booking revenue</span>
									<span className="font-semibold text-destructive">$42,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Price competition losses</span>
									<span className="font-semibold text-destructive">$24,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Guest acquisition cost inflation</span>
									<span className="font-semibold text-destructive">$15,600</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Annual Cost</span>
										<span className="text-destructive">$161,400</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Direct Booking Results
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$348</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Saved commission fees</span>
									<span className="font-semibold text-success dark:text-success">+$75,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Premium direct booking rates</span>
									<span className="font-semibold text-success dark:text-success">+$54,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Repeat guest revenue (70% rate)</span>
									<span className="font-semibold text-success dark:text-success">+$72,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Eliminated processing fees</span>
									<span className="font-semibold text-success dark:text-success">+$4,800</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Annual Gain</span>
										<span className="text-success dark:text-success">+$366,852</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$528,252</div>
						<div className="text-lg opacity-90">Total Annual Savings + Revenue Increase</div>
						<p className="text-sm opacity-80 mt-2">Based on average property switching from Expedia to Thorbis ($300K annual revenue)</p>
					</div>
				</div>
			</section>

			{/* Travel Industry Tools Showcase */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Travel Professionals</h2>
					<p className="mt-4 text-lg text-muted-foreground">Advanced tools designed specifically for the travel industry</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Globe className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Multi-Channel Distribution</h3>
							<p className="text-sm text-muted-foreground">Distribute inventory across Expedia, Booking.com, Airbnb, and direct channels simultaneously.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<TrendingUp className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Dynamic Pricing</h3>
							<p className="text-sm text-muted-foreground">AI-powered pricing optimization based on demand, seasonality, and competitor analysis.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Users className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Guest Relationship CRM</h3>
							<p className="text-sm text-muted-foreground">Complete guest profiles, preferences, and automated personalized communication workflows.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<BarChart3 className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Revenue Analytics</h3>
							<p className="text-sm text-muted-foreground">Track RevPAR, ADR, occupancy, and booking source performance with actionable insights.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Interactive Demo Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Experience Thorbis for Travel</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how we help travel businesses thrive without commission dependency</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2 items-center">
					<div className="space-y-6">
						<div className="p-6 bg-card rounded-lg border border-border">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Play className="w-4 h-4 text-primary" />
								</div>
								<h3 className="font-semibold">Travel Platform Demo</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">Watch how hotels, resorts, and travel agencies eliminate commission dependency while increasing direct bookings.</p>
							<Button variant="outline" className="w-full">
								<Play className="w-4 h-4 mr-2" />
								Watch Travel Demo
							</Button>
						</div>
						<div className="p-6 bg-card rounded-lg border border-border">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Calendar className="w-4 h-4 text-primary" />
								</div>
								<h3 className="font-semibold">Travel Industry Consultation</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">Get expert advice on reducing commission dependency and building a sustainable direct booking strategy.</p>
							<Button className="w-full">
								<Calendar className="w-4 h-4 mr-2" />
								Book Travel Consultation
							</Button>
						</div>
					</div>
					<div className="relative">
						<div className="aspect-video bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-center">
							<div className="text-center">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Plane className="w-8 h-8 text-primary" />
								</div>
								<h3 className="font-semibold text-lg mb-2">Travel Business Control Center</h3>
								<p className="text-sm text-muted-foreground">Multi-channel management, guest relations, and revenue optimization</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Comparison Table */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quick Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Expedia</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Expedia</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Commission Rate</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">20-30%</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29/month</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Direct Bookings</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Full Control</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Data</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Restricted</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Full Access</td>
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
									<td className="px-6 py-4 font-medium text-foreground">Review Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Analytics & Insights</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
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
					{/* Expedia Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								Expedia&apos;s Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">High Commission Rates</h4>
								<p className="text-sm text-muted-foreground">Commission rates of 20-30% significantly reduce profit margins for businesses.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Direct Bookings</h4>
								<p className="text-sm text-muted-foreground">Customers are encouraged to book through Expedia, not directly with you.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Restricted Customer Data</h4>
								<p className="text-sm text-muted-foreground">Limited access to customer information and booking history.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Single Platform Focus</h4>
								<p className="text-sm text-muted-foreground">Only manages Expedia presence, no integration with other platforms.</p>
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
					<Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-primary">
								<CheckCircle className="w-6 h-6" />
								Thorbis Advantages
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Fixed Monthly Pricing</h4>
								<p className="text-sm text-muted-foreground">Simple $29/month pricing with no commission fees or hidden costs.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Direct Customer Relationships</h4>
								<p className="text-sm text-muted-foreground">Build direct relationships with customers and increase repeat bookings.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Full Customer Data Access</h4>
								<p className="text-sm text-muted-foreground">Complete access to customer information and booking history.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Sync across Google, Facebook, TripAdvisor, Expedia, and other platforms.</p>
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

			{/* Travel Business Features */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Travel & Accommodation Features</h2>
					<p className="mt-4 text-lg text-muted-foreground">Specialized tools for travel businesses</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Calendar className="w-6 h-6" />
							</div>
							<CardTitle>Booking Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Manage reservations, availability, and pricing across all platforms.</p>
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
								<Clock className="w-6 h-6" />
							</div>
							<CardTitle>Availability Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Automated availability updates, holiday schedules, and special event management.</p>
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
							<p className="text-sm text-muted-foreground">Monitor and respond to reviews across TripAdvisor, Google, Expedia, and more.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Users className="w-6 h-6" />
							</div>
							<CardTitle>Customer Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Build customer relationships, manage preferences, and increase repeat bookings.</p>
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
							<p className="text-sm text-muted-foreground">Track bookings, revenue, and customer satisfaction across all platforms.</p>
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
							<CardTitle className="text-destructive">Expedia Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								20-30%<span className="text-lg font-normal text-muted-foreground"> commission</span>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm">
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">High commission fees</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Limited direct bookings</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Restricted customer data</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Single platform focus</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Poor customer support</span>
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
									<span className="text-muted-foreground">No commission fees</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Direct customer relationships</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Full customer data access</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Multi-platform integration</span>
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
									<span className="text-muted-foreground">Advanced analytics</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Booking management</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from Expedia?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of travel businesses that have switched to Thorbis. Keep more of your revenue, build direct relationships, and grow faster. Start your free trial today.</p>
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
								<span>No commission fees</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>$528K+ annual savings</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>85% direct booking rate</span>
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
						<div className="font-semibold">How is Thorbis different from Expedia?</div>
						<p className="mt-2 text-sm text-muted-foreground">Flat $29/month pricing, direct relationships, and full customer data access.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you integrate with major travel sites?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Sync listings, availability, and reviews across platforms.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I automate availability updates?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Automated availability and pricing management included.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is data export supported?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Export all your data at any time.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "How is Thorbis different from Expedia?", acceptedAnswer: { "@type": "Answer", text: "Flat $29/month pricing, direct relationships, and full customer data access." } },
								{ "@type": "Question", name: "Do you integrate with major travel sites?", acceptedAnswer: { "@type": "Answer", text: "Yes. Sync listings, availability, and reviews across platforms." } },
								{ "@type": "Question", name: "Can I automate availability updates?", acceptedAnswer: { "@type": "Answer", text: "Yes. Automated availability and pricing management included." } },
								{ "@type": "Question", name: "Is data export supported?", acceptedAnswer: { "@type": "Answer", text: "Yes. Export all your data at any time." } },
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
					<Link href="/booking-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Booking.com vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel booking platform comparison</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/tripadvisor-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">TripAdvisor vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Restaurant and travel business comparisons</p>
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
		</main>
	);
}
