import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, Zap, Globe, MessageSquare, Calendar, Award, ArrowRight, Star, DollarSign, Shield, Target, Building, AlertTriangle, Heart, Briefcase, Utensils } from "lucide-react";
import { getDictionary, languages } from '@/lib/i18n/dictionaries';

// Generate internationalized metadata
export async function generateMetadata({ params, searchParams }) {
	const locale = 'en'; // Default to English for now
	const dict = await getDictionary(locale);
	
	// Get landing pages translations with fallbacks
	const landingTranslations = dict.landingPages?.alternatives?.yelp || {};
	const commonTranslations = dict.landingPages?.common || {};
	
	const title = landingTranslations.hero?.title || "Yelp Alternative – Thorbis vs Yelp";
	const description = landingTranslations.hero?.subtitle || "See why Thorbis is a modern alternative to Yelp: fair review system, AI insights, lead generation, and multi‑platform integration.";
	
	// Generate alternate language URLs
	const alternateLanguages = {};
	Object.keys(languages).forEach(lang => {
		alternateLanguages[`${lang}-${lang.toUpperCase()}`] = `https://thorbis.com/${lang}/yelp-alternative`;
	});

	return {
		title: `${title} | Thorbis`,
		description: description,
		keywords: ["Yelp alternative", "Yelp vs Thorbis", "business reviews alternative", "lead generation platform", "AI analytics"],
		alternates: { 
			canonical: `https://thorbis.com/${locale}/yelp-alternative`,
			languages: alternateLanguages,
		},
		openGraph: {
			title: title,
			description: description,
			type: "website",
			url: `https://thorbis.com/${locale}/yelp-alternative`,
			siteName: "Thorbis",
			images: [
				{
					url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: `${locale}_${locale.toUpperCase()}',
		},
		twitter: {
			card: "summary_large_image",
			title: title,
			description: description,
			images: ['https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}'],
			creator: "@thorbis",
			site: "@thorbis",
		},
	};
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Yelp Alternative", item: "https://thorbis.com/yelp-alternative" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function YelpAlternative() {
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
							Yelp vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Yelp for businesses and consumers alike. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
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

			{/* Quick Comparison Table */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quick Comparison</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Yelp</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Yelp</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Monthly Cost</td>
									<td className="px-6 py-4 text-center text-destructive font-semibold">$350+</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Review Filtering</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">AI-Powered Insights</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Lead Generation</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Support</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">24/7 Priority</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Multi-Platform Integration</td>
									<td className="px-6 py-4 text-center">
										<XCircle className="inline w-5 h-5 text-destructive" />
									</td>
									<td className="px-6 py-4 text-center">
										<CheckCircle className="inline w-5 h-5 text-success dark:text-success" />
									</td>
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
					{/* Yelp Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								Yelp&apos;s Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Expensive Pricing</h4>
								<p className="text-sm text-muted-foreground">Yelp charges $350+ per month with hidden fees and aggressive sales tactics.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Review Filtering Issues</h4>
								<p className="text-sm text-muted-foreground">Yelp&apos;s algorithm filters out legitimate reviews, hurting business reputation unfairly.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Poor Customer Support</h4>
								<p className="text-sm text-muted-foreground">Difficult to reach support, long response times, and unhelpful solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Features</h4>
								<p className="text-sm text-muted-foreground">Basic listing management with no advanced analytics or lead generation tools.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Aggressive Sales Tactics</h4>
								<p className="text-sm text-muted-foreground">High-pressure sales calls and misleading advertising promises.</p>
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
								<h4 className="font-semibold text-success dark:text-success">Transparent Pricing</h4>
								<p className="text-sm text-muted-foreground">Simple $29/month pricing with no hidden fees or aggressive sales tactics.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Fair Review System</h4>
								<p className="text-sm text-muted-foreground">AI-powered review verification ensures only legitimate reviews are displayed.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">24/7 Priority Support</h4>
								<p className="text-sm text-muted-foreground">Dedicated support team with quick response times and personalized solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Advanced Analytics</h4>
								<p className="text-sm text-muted-foreground">Comprehensive insights, lead tracking, and performance optimization tools.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Seamless integration with Google, Facebook, and other major platforms.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Feature Deep Dive */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Thorbis is the Amazon for Businesses</h2>
					<p className="mt-4 text-lg text-muted-foreground">Advanced features that drive real business growth</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Zap className="w-6 h-6" />
							</div>
							<CardTitle>AI-Powered Insights</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Advanced AI analyzes customer behavior, reviews, and market trends to provide actionable insights for business growth.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Users className="w-6 h-6" />
							</div>
							<CardTitle>Lead Generation</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Automated lead capture and qualification system that connects businesses with high-intent customers.</p>
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
							<p className="text-sm text-muted-foreground">Smart review monitoring, response automation, and reputation management tools.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Globe className="w-6 h-6" />
							</div>
							<CardTitle>Multi-Platform Sync</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Automatically sync your business information across Google, Facebook, Apple Maps, and more.</p>
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
							<p className="text-sm text-muted-foreground">Integrated appointment scheduling system that reduces no-shows and increases bookings.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Award className="w-6 h-6" />
							</div>
							<CardTitle>Business Certification</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Verified business program that builds trust and increases customer confidence.</p>
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
							<CardTitle className="text-destructive">Yelp Business</CardTitle>
							<div className="text-3xl font-bold text-destructive">
								$350<span className="text-lg font-normal text-muted-foreground">/month</span>
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
									<span className="text-muted-foreground">Limited customer support</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No analytics dashboard</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Aggressive sales tactics</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Review filtering issues</span>
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
									<span className="text-muted-foreground">Advanced listing management</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">24/7 priority support</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">AI-powered analytics</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Lead generation tools</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Multi-platform integration</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Review management system</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Appointment booking</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Business certification</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Yelp Problems & Solutions */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Escape Yelp's Hidden Costs & Frustrations</h2>
					<p className="mt-4 text-lg text-muted-foreground">Real business owners share their Yelp horror stories and Thorbis success</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="p-8 border-destructive/20 bg-destructive/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="w-6 h-6" />
								The Yelp Trap
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Review Filtering Nightmare</h4>
									<p className="text-sm text-muted-foreground mb-3">"Yelp filtered 60% of our 5-star reviews but kept all the negative ones. We paid $400/month and still couldn't get them to show real reviews."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Maria S., Restaurant Owner</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Aggressive Sales Tactics</h4>
									<p className="text-sm text-muted-foreground mb-3">"They called 15 times in one week pressuring us to upgrade. When we said no, suddenly our positive reviews started disappearing."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>James K., Plumbing Service</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-destructive/20">
									<h4 className="font-semibold text-destructive mb-2">Zero Customer Support</h4>
									<p className="text-sm text-muted-foreground mb-3">"When fake reviews destroyed our rating, Yelp's 'support' was a chatbot. Took 3 months to reach a human who couldn't help."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Lisa M., Salon Owner</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-8 border-primary/20 bg-primary/5">
						<CardHeader className="px-0 pt-0 pb-6">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Heart className="w-6 h-6" />
								The Thorbis Solution
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-6">
							<div className="space-y-4">
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Fair Review System</h4>
									<p className="text-sm text-muted-foreground mb-3">"After switching to Thorbis, ALL our legitimate reviews are visible. Their AI only filters obvious fakes, not real customer feedback."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Maria S., now +347% leads</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">Transparent Pricing</h4>
									<p className="text-sm text-muted-foreground mb-3">"$29/month, no pressure, no games. The best customer service I've ever experienced from any platform."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same James K., now saving $4,500/year</span>
									</div>
								</div>
								<div className="p-4 bg-card rounded-lg border border-primary/20">
									<h4 className="font-semibold text-success dark:text-success mb-2">24/7 Human Support</h4>
									<p className="text-sm text-muted-foreground mb-3">"When I had an issue, a real person called me back in 15 minutes. They solved it immediately and followed up the next day."</p>
									<div className="flex items-center gap-2 text-xs">
										<Building className="w-3 h-3" />
										<span>Same Lisa M., now 4.9★ across all platforms</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Industry Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Industry-Specific Success Stories</h2>
					<p className="mt-4 text-lg text-muted-foreground">See results from businesses like yours</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Utensils className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Restaurant</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+89%</div>
								<div className="text-sm text-muted-foreground">Reservation Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Yelp was costing us $500/month with terrible results. Thorbis costs $29 and increased our reservations by 89%. The multi-platform sync saved us 10 hours per week."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Utensils className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Tony Rosario</div>
									<div className="text-xs text-muted-foreground">Owner, Rosario's Italian Bistro</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Briefcase className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Professional Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$28K</div>
								<div className="text-sm text-muted-foreground">Monthly Revenue Gain</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Yelp's review filtering killed our credibility. Since switching to Thorbis, our authentic reviews show and we gained $28K in monthly revenue from new client acquisition."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Briefcase className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Dr. Amanda Price</div>
									<div className="text-xs text-muted-foreground">Dental Practice Owner</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Building className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Home Services</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+156%</div>
								<div className="text-sm text-muted-foreground">Lead Quality Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Yelp leads were terrible - mostly tire-kickers. Thorbis's AI qualification gives us 156% better lead quality. We book 3x more jobs now."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Mike Rodriguez</div>
									<div className="text-xs text-muted-foreground">Rodriguez HVAC Services</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Detailed Cost Comparison */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">The Real Cost of Yelp vs Thorbis</h2>
					<p className="mt-4 text-lg text-muted-foreground">Hidden costs, lost opportunities, and the better alternative</p>
				</div>
				<div className="max-w-5xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8 border-destructive/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-destructive">
									<DollarSign className="w-5 h-5" />
									Yelp's Hidden Costs
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Yelp Ads monthly minimum</span>
									<span className="font-semibold text-destructive">$350</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Enhanced profile upgrade</span>
									<span className="font-semibold text-destructive">$150</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Response management fee</span>
									<span className="font-semibold text-destructive">$75</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost revenue from filtered reviews</span>
									<span className="font-semibold text-destructive">$2,400</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Staff time managing single platform</span>
									<span className="font-semibold text-destructive">$800</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total Monthly Cost</span>
										<span className="text-destructive">$3,775</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Thorbis Complete Solution
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform (all features)</span>
									<span className="font-semibold">$29</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Multi-platform management</span>
									<span className="font-semibold text-success dark:text-success">Included</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Fair review system</span>
									<span className="font-semibold text-success dark:text-success">Included</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Additional revenue from all reviews shown</span>
									<span className="font-semibold text-success dark:text-success">+$3,200</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time saved with automation</span>
									<span className="font-semibold text-success dark:text-success">+$1,200</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Net Monthly Gain</span>
										<span className="text-success dark:text-success">+$8,146</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$97,752</div>
						<div className="text-lg opacity-90">Annual Savings by Switching to Thorbis</div>
						<p className="text-sm opacity-80 mt-2">Plus increased revenue from fair review display and multi-platform presence</p>
					</div>
				</div>
			</section>

			{/* Migration Process */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Escape Yelp in 48 Hours</h2>
					<p className="mt-4 text-lg text-muted-foreground">Our proven migration process protects your reputation</p>
				</div>
				<div className="max-w-4xl mx-auto">
					<div className="space-y-8">
						<div className="flex gap-6 items-start">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
								<span className="text-lg font-bold text-primary">1</span>
							</div>
							<div className="flex-1">
								<Card className="p-6">
									<h3 className="text-xl font-semibold mb-3">Review Audit & Documentation</h3>
									<p className="text-muted-foreground mb-4">We analyze your Yelp presence and document all legitimate reviews that Yelp may be filtering. This creates a baseline for your reputation migration.</p>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Review history export</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Business info backup</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Photo collection</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Filtered review recovery</span>
										</div>
									</div>
								</Card>
							</div>
						</div>

						<div className="flex gap-6 items-start">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
								<span className="text-lg font-bold text-primary">2</span>
							</div>
							<div className="flex-1">
								<Card className="p-6">
									<h3 className="text-xl font-semibold mb-3">Multi-Platform Setup & Optimization</h3>
									<p className="text-muted-foreground mb-4">We simultaneously set up and optimize your presence across Google, Facebook, Apple Maps, and 15+ other platforms while maintaining your Yelp presence during transition.</p>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Google Business optimization</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Facebook Business setup</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Apple Maps optimization</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>15+ directory listings</span>
										</div>
									</div>
								</Card>
							</div>
						</div>

						<div className="flex gap-6 items-start">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
								<span className="text-lg font-bold text-primary">3</span>
							</div>
							<div className="flex-1">
								<Card className="p-6">
									<h3 className="text-xl font-semibold mb-3">Gradual Transition & Monitoring</h3>
									<p className="text-muted-foreground mb-4">We gradually shift your marketing focus from Yelp to other platforms while monitoring performance. Your Yelp presence stays active during the transition period.</p>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Performance monitoring</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Lead tracking setup</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Review management</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span>Yelp ad optimization/cancellation</span>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>
					<div className="mt-12 text-center">
						<Card className="inline-block p-6 bg-primary/5 border-primary/20">
							<div className="flex items-center gap-4">
								<Shield className="w-8 h-8 text-primary" />
								<div className="text-left">
									<div className="font-semibold">Reputation Protection Guarantee</div>
									<div className="text-sm text-muted-foreground">We ensure your online reputation is protected throughout the entire migration</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Switch from Yelp?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of businesses that have already made the switch to Thorbis. Start your free trial today and see the difference.</p>
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
								<span>No Yelp contracts to break</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Migration assistance included</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Fair review system</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Related Comparisons */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore Other Platform Comparisons</h2>
					<p className="mt-4 text-muted-foreground">See detailed comparisons with real success stories and ROI calculators</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/google-business-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Google Business vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Customer success stories with $131K+ annual savings calculator</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/tripadvisor-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">TripAdvisor vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Restaurant POS integration and advanced reservation management</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/bark-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Bark vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Lead quality analysis with +234% conversion case studies</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/angies-list-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Angie's List vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Home service verification system with $306K+ ROI analysis</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/yellow-pages-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yellow Pages vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Digital transformation guide with local business success stories</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/booking-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Booking.com vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel business commission elimination with $341K+ savings</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>
		</main>
	);
}
