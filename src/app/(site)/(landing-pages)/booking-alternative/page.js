import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, MessageSquare, Calendar, BarChart3, MapPin, Clock, ArrowRight, Star, DollarSign, Target, Building, Award, Play, AlertTriangle, Heart, CreditCard, Plane, Home, Hotel } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Booking.com Alternative – Thorbis vs Booking | Thorbis",
		description: "See why Thorbis is a modern alternative to Booking.com: fixed pricing, direct customer relationships, full data access, and multi‑platform sync.",
		path: "/booking-alternative",
		keywords: ["Booking alternative", "Booking.com vs Thorbis", "hotel booking alternative", "direct bookings platform", "commission free booking"],
	});
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Booking.com Alternative", item: "https://thorbis.com/booking-alternative" },
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

export default function BookingAlternative() {
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
							Booking.com vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Booking.com for travel and accommodation businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
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
					<p className="mt-4 text-lg text-muted-foreground">Real accommodations that ditched Booking.com's high commissions</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Hotel className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Boutique Hotel</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+312%</div>
								<div className="text-sm text-muted-foreground">Direct Booking Revenue</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Booking.com was taking 18% commission plus fees. Thorbis costs $29/month and we keep 100% of our revenue. We've increased direct bookings by 312% this year."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Elena Rodriguez</div>
									<div className="text-xs text-muted-foreground">Coastal View Boutique Hotel</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Home className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Vacation Rental</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$95K</div>
								<div className="text-sm text-muted-foreground">Annual Commission Savings</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"We were paying $95,000 in Booking.com commissions annually. Now we pay $348 to Thorbis and have better guest relationships. Pure profit increase."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Users className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Michael Chen</div>
									<div className="text-xs text-muted-foreground">Mountain Lodge Rentals</div>
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
								<div className="text-2xl font-bold text-success dark:text-success">-78%</div>
								<div className="text-sm text-muted-foreground">Customer Acquisition Cost</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Booking.com made us compete on price only. Thorbis helps us build relationships and offer personalized service. Our repeat booking rate tripled."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Award className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Sarah Thompson</div>
									<div className="text-xs text-muted-foreground">Adventure Travel Co.</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Commission Cost Analysis */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Commission vs Fixed Cost: The Reality</h2>
					<p className="mt-4 text-lg text-muted-foreground">Why Booking.com's commission model is costing you thousands</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								Booking.com Commission Problems
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Hidden Escalating Costs</h4>
									<p className="text-sm text-muted-foreground mb-3">"Started at 15% commission, now paying 22% plus credit card fees. As we grow, they take more. It's backwards - success should reduce costs, not increase them."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>David M., Beach Resort Owner</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">No Customer Loyalty Building</h4>
									<p className="text-sm text-muted-foreground mb-3">"Booking.com owns the customer relationship. We're just a supplier to them. Can't build repeat business or offer loyalty programs. It's a race to the bottom."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Lisa K., City Hotel Manager</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Rate Parity Restrictions</h4>
									<p className="text-sm text-muted-foreground mb-3">"They force us to match their rates everywhere, so we can't incentivize direct bookings. We're stuck paying commission even when we could have gotten the guest ourselves."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>James R., B&B Owner</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Heart className="w-6 h-6" />
								Thorbis Direct Booking Benefits
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Predictable Fixed Costs</h4>
									<p className="text-sm text-muted-foreground mb-3">"$29/month no matter how many bookings we get. Last month we saved $8,400 compared to what we'd pay Booking.com. The more we grow, the more we save."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same David M., now 40% higher profit</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Own Customer Relationships</h4>
									<p className="text-sm text-muted-foreground mb-3">"We have guest email addresses, preferences, history. We send personalized offers and 60% of our bookings are now repeat customers. Built a real business, not just a commodity."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Lisa K., now premium pricing</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Flexible Pricing Freedom</h4>
									<p className="text-sm text-muted-foreground mb-3">"We offer direct booking discounts, loyalty programs, and package deals. Guests love the personal service and we love keeping 100% of the revenue."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same James R., now 5-star reviews</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Travel Industry ROI Calculator */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Travel Business ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">Calculate your potential commission savings and revenue increase</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current Booking.com Costs
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Commission fees (18% average)</span>
									<span className="font-semibold text-destructive">$54,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Credit card processing fees</span>
									<span className="font-semibold text-destructive">$3,600</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost revenue from rate restrictions</span>
									<span className="font-semibold text-destructive">$18,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Customer acquisition cost increase</span>
									<span className="font-semibold text-destructive">$8,400</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Additional marketing to compete</span>
									<span className="font-semibold text-destructive">$12,000</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Annual Cost</span>
										<span className="text-destructive">$96,000</span>
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
									<span className="font-semibold text-success dark:text-success">+$54,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Direct booking premium pricing</span>
									<span className="font-semibold text-success dark:text-success">+$36,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Repeat customer revenue</span>
									<span className="font-semibold text-success dark:text-success">+$48,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Reduced marketing costs</span>
									<span className="font-semibold text-success dark:text-success">+$12,000</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Annual Gain</span>
										<span className="text-success dark:text-success">+$245,652</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$341,652</div>
						<div className="text-lg opacity-90">Total Annual Savings + Revenue Increase</div>
						<p className="text-sm opacity-80 mt-2">Based on average accommodation switching from Booking.com to Thorbis ($300K annual revenue)</p>
					</div>
				</div>
			</section>

			{/* Interactive Travel Demo */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">See Thorbis for Travel Businesses</h2>
					<p className="mt-4 text-lg text-muted-foreground">Experience how easy it is to manage your accommodation business</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2 items-center">
					<div className="space-y-6">
						<div className="p-6 bg-card rounded-lg border border-border">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Play className="w-4 h-4 text-primary" />
								</div>
								<h3 className="font-semibold">Travel Industry Demo</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">See how hotels, B&Bs, and vacation rentals manage bookings, pricing, and guest communications across all channels.</p>
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
								<h3 className="font-semibold">Personalized Consultation</h3>
							</div>
							<p className="text-sm text-muted-foreground mb-4">Get a custom demo showing how Thorbis works for your specific type of accommodation business.</p>
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
									<Hotel className="w-8 h-8 text-primary" />
								</div>
								<h3 className="font-semibold text-lg mb-2">Travel Business Dashboard</h3>
								<p className="text-sm text-muted-foreground">Live booking management, revenue tracking, and guest communications</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Travel-Specific Tools */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Travel & Accommodation</h2>
					<p className="mt-4 text-lg text-muted-foreground">Everything you need to run a successful travel business</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Channel Manager</h3>
							<p className="text-sm text-muted-foreground">Sync availability and rates across Booking.com, Airbnb, Expedia, and direct bookings automatically.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<CreditCard className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Revenue Management</h3>
							<p className="text-sm text-muted-foreground">Dynamic pricing, seasonal adjustments, and profit optimization tools for maximum revenue.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<MessageSquare className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Guest Communications</h3>
							<p className="text-sm text-muted-foreground">Automated check-in instructions, welcome messages, and personalized guest experiences.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<BarChart3 className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Performance Analytics</h3>
							<p className="text-sm text-muted-foreground">Track RevPAR, ADR, occupancy rates, and booking sources with detailed insights.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Quick Comparison Table */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quick Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Booking.com</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Booking.com</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Commission Rate</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">15-25%</td>
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
					{/* Booking.com Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								Booking.com&apos;s Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">High Commission Rates</h4>
								<p className="text-sm text-muted-foreground">Commission rates of 15-25% significantly reduce profit margins for businesses.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Direct Bookings</h4>
								<p className="text-sm text-muted-foreground">Customers are encouraged to book through Booking.com, not directly with you.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Restricted Customer Data</h4>
								<p className="text-sm text-muted-foreground">Limited access to customer information and booking history.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Single Platform Focus</h4>
								<p className="text-sm text-muted-foreground">Only manages Booking.com presence, no integration with other platforms.</p>
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
								<p className="text-sm text-muted-foreground">Sync across Google, Facebook, TripAdvisor, Booking.com, and other platforms.</p>
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
							<p className="text-sm text-muted-foreground">Monitor and respond to reviews across TripAdvisor, Google, Booking.com, and more.</p>
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
							<CardTitle className="text-destructive">Booking.com Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								15-25%<span className="text-lg font-normal text-muted-foreground"> commission</span>
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
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from Booking.com?</h2>
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
								<span>$340K+ annual savings</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Direct guest relationships</span>
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
						<div className="font-semibold">How is Thorbis different from Booking.com?</div>
						<p className="mt-2 text-sm text-muted-foreground">Fixed $29/month, direct bookings, full data access, and multi‑platform sync.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support channel management?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Sync availability, pricing, and listings across major platforms.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I export all customer data?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Full data ownership with easy export options.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is setup complicated?</div>
						<p className="mt-2 text-sm text-muted-foreground">No. Guided onboarding with templates and best practices.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "How is Thorbis different from Booking.com?", acceptedAnswer: { "@type": "Answer", text: "Fixed $29/month, direct bookings, full data access, and multi‑platform sync." } },
								{ "@type": "Question", name: "Do you support channel management?", acceptedAnswer: { "@type": "Answer", text: "Yes. Sync availability, pricing, and listings across major platforms." } },
								{ "@type": "Question", name: "Can I export all customer data?", acceptedAnswer: { "@type": "Answer", text: "Yes. Full data ownership with easy export options." } },
								{ "@type": "Question", name: "Is setup complicated?", acceptedAnswer: { "@type": "Answer", text: "No. Guided onboarding with templates and best practices." } },
							],
						}),
					}}
				/>
			</section>

			{/* Related Comparisons */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore Other Platform Comparisons</h2>
					<p className="mt-4 text-muted-foreground">Detailed travel industry comparisons with commission analysis and ROI calculators</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/expedia-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Expedia vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel platform with $528K+ annual benefits and commission problem analysis</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/tripadvisor-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">TripAdvisor vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Restaurant reservation systems with advanced POS integration features</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/google-business-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Enhanced business management with interactive demo and migration guide</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/yelp-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yelp vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Business platform comparison with industry-specific feature breakdown</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/bark-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Bark vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Service business lead quality with contractor success stories</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/angies-list-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Angie's List vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Home service verification with $306K+ ROI calculator</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>
		</main>
	);
}
