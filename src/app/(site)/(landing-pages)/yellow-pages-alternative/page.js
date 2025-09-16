import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, Zap, Globe, Search, Building, TrendingUp, ArrowRight, Star, DollarSign, Target, Award, Briefcase, Calendar, AlertTriangle, MapPin } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Yellow Pages Alternative – Thorbis vs Yellow Pages | Thorbis",
		description: "Discover why Thorbis is the superior alternative to Yellow Pages for business discovery and local search. Free listings, modern digital tools, and comprehensive business solutions.",
		path: "/yellow-pages-alternative",
		keywords: ["Yellow Pages alternative", "Thorbis vs Yellow Pages", "business directory alternative", "free business listing", "local search platform"],
	});
}

export default function YellowPagesAlternative() {
	return (
		<main className="relative min-h-screen bg-background">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
							{ "@type": "ListItem", position: 2, name: "Yellow Pages Alternative", item: "https://thorbis.com/yellow-pages-alternative" },
						],
					}),
				}}
			/>
			{/* Hero Section */}
			<section className="relative overflow-hidden border-b">
				<div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-20">
					<div className="text-center">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							Directory Platform Comparison
						</Badge>
						<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							Yellow Pages vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why thousands of businesses have moved from Yellow Pages' outdated print model to Thorbis' modern digital directory platform with AI-powered discovery and free listings.</p>
						<div className="flex flex-col gap-4 justify-center sm:flex-row">
							<Button size="lg" className="text-lg px-8 py-3 bg-primary hover:bg-primary/90">
								Start Free Trial
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
								View Demo
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
					<p className="text-sm text-muted-foreground">Trusted by 3,400+ businesses • 4.9/5 satisfaction rating</p>
				</div>
			</section>

			{/* Business Owner Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Business Owners Share Their Success</h2>
					<p className="mt-4 text-lg text-muted-foreground">Local businesses that ditched Yellow Pages for digital growth</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Building className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Local Restaurant</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+425%</div>
								<div className="text-sm text-muted-foreground">Online Visibility Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Yellow Pages charged $600/month for a tiny print ad. Thorbis is free and brings customers directly to my restaurant. We've tripled our delivery orders this year."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<MapPin className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Maria Santos</div>
									<div className="text-xs text-muted-foreground">Santos Family Restaurant</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Briefcase className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Local Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$145K</div>
								<div className="text-sm text-muted-foreground">Additional Annual Revenue</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Print Yellow Pages was dead weight. Thorbis connects me with customers who actually need my services. I book jobs directly through the platform now."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Users className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">James Wilson</div>
									<div className="text-xs text-muted-foreground">Wilson Home Services</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Globe className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Retail Store</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">-89%</div>
								<div className="text-sm text-muted-foreground">Marketing Costs Reduced</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"We spent thousands on Yellow Pages ads that nobody saw. Thorbis gives us everything for free - online presence, customer reviews, and direct bookings."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Award className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Linda Chen</div>
									<div className="text-xs text-muted-foreground">Chen's Electronics</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Digital Transformation Analysis */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Print vs Digital: The New Reality</h2>
					<p className="mt-4 text-lg text-muted-foreground">Why businesses need digital transformation beyond traditional directories</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								Yellow Pages Decline
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Print Directory Usage Collapse</h4>
									<p className="text-sm text-muted-foreground mb-3">"Nobody uses phone books anymore. My Yellow Pages ad reached maybe 20 people a month, and they were all looking for different businesses anyway."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>John M., Auto Repair Shop</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Expensive Outdated Model</h4>
									<p className="text-sm text-muted-foreground mb-3">"$800/month for a quarter-page ad that customers see once a year? The ROI was terrible. Young customers don't even know what Yellow Pages is."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Sarah T., Dental Practice</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">No Digital Integration</h4>
									<p className="text-sm text-muted-foreground mb-3">"Their online presence was an afterthought. No reviews, no booking, no real customer engagement. Felt like paying for a museum piece."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Mike R., Photography Studio</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Zap className="w-6 h-6" />
								Thorbis Digital Future
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">AI-Powered Discovery</h4>
									<p className="text-sm text-muted-foreground mb-3">"Customers find me when they need exactly what I offer. The AI matches my services with their needs perfectly. No more wasted leads."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same John M., now 3x revenue</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Free Complete Platform</h4>
									<p className="text-sm text-muted-foreground mb-3">"Everything I need is free - listings, reviews, booking system, customer messaging. I save $800/month and get 10x better results."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Sarah T., now premium practice</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Complete Digital Ecosystem</h4>
									<p className="text-sm text-muted-foreground mb-3">"Portfolio showcase, online booking, customer reviews, and direct payments. It's like having a full digital marketing team for free."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Mike R., now fully booked</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Local Directory ROI Calculator */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Local Business ROI Calculator</h2>
					<p className="mt-4 text-lg text-muted-foreground">Calculate your potential savings and revenue increase</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Current Yellow Pages Costs
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Yellow Pages annual contract</span>
									<span className="font-semibold text-destructive">$7,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost revenue from poor visibility</span>
									<span className="font-semibold text-destructive">$18,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Additional marketing to compensate</span>
									<span className="font-semibold text-destructive">$4,800</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Print material and design costs</span>
									<span className="font-semibold text-destructive">$1,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Opportunity cost vs digital</span>
									<span className="font-semibold text-destructive">$8,400</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Annual Cost</span>
										<span className="text-destructive">$39,600</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Business Results
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$0</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Increased revenue from digital presence</span>
									<span className="font-semibold text-success dark:text-success">+$36,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Direct booking system revenue</span>
									<span className="font-semibold text-success dark:text-success">+$18,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Review-driven customer acquisition</span>
									<span className="font-semibold text-success dark:text-success">+$12,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Eliminated traditional marketing costs</span>
									<span className="font-semibold text-success dark:text-success">+$7,200</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Annual Gain</span>
										<span className="text-success dark:text-success">+$112,800</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$152,400</div>
						<div className="text-lg opacity-90">Total Annual Savings + Revenue Increase</div>
						<p className="text-sm opacity-80 mt-2">Based on average local business switching from Yellow Pages to Thorbis</p>
					</div>
				</div>
			</section>

			{/* Directory Features Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Complete Feature Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See what you get with modern directory platforms vs traditional print</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Yellow Pages</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Annual Cost</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">$7,200+</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Free</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Digital Presence</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Reviews</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Online Booking</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Messaging</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Analytics & Insights</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
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
									<td className="px-6 py-4 font-medium text-foreground">Mobile Optimization</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Native App</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Modern Directory Tools */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Modern Directory Tools</h2>
					<p className="mt-4 text-lg text-muted-foreground">Everything you need to succeed in the digital marketplace</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Search className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">AI-Powered Discovery</h3>
							<p className="text-sm text-muted-foreground">Smart algorithms connect your business with customers actively searching for your services.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Direct Booking</h3>
							<p className="text-sm text-muted-foreground">Customers can book appointments or services directly through your business profile.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Star className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Review Management</h3>
							<p className="text-sm text-muted-foreground">Collect, respond to, and showcase customer reviews to build trust and credibility.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<TrendingUp className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Business Analytics</h3>
							<p className="text-sm text-muted-foreground">Track performance, understand customer behavior, and optimize your business presence.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Leave Yellow Pages Behind?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of businesses that have modernized their directory presence with Thorbis. Get everything Yellow Pages promised, plus the power of modern digital tools - completely free.</p>
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
								<span>100% free platform</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>$150K+ annual savings</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Modern digital presence</span>
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
						<div className="font-semibold">Is Thorbis really free compared to Yellow Pages?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes, completely free. Yellow Pages charges $500-1000+ annually, Thorbis provides all features at no cost.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I move my Yellow Pages listing to Thorbis?</div>
						<p className="mt-2 text-sm text-muted-foreground">Absolutely. We'll help migrate your business information and enhance it with modern digital features.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Will customers find me without Yellow Pages?</div>
						<p className="mt-2 text-sm text-muted-foreground">Better than before. Our digital platform reaches customers where they actually search - online and mobile.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">How quickly can I cancel Yellow Pages?</div>
						<p className="mt-2 text-sm text-muted-foreground">Check your contract terms. Most allow cancellation with 30-60 days notice. We'll help you transition smoothly.</p>
					</div>
				</div>
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
								<p className="text-sm text-muted-foreground">Better business discovery and reviews</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/google-business-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Enhanced visibility and engagement</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/angies-list-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Angie's List vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Modern home service platform</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>
		</main>
	);
}
