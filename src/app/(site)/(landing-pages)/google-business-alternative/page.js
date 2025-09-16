import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, Globe, MessageSquare, Calendar, BarChart3, Settings, ArrowRight, Star, DollarSign, TrendingUp, Shield, Clock, Target, Award, Phone, Mail, Zap, Building, MapPin, Play } from "lucide-react";
import { getDictionary, languages } from '@/lib/i18n/dictionaries';

// Generate internationalized metadata
export async function generateMetadata({ params, searchParams }) {
	const locale = 'en'; // Default to English for now
	const dict = await getDictionary(locale);
	
	// Get landing pages translations with fallbacks
	const landingTranslations = dict.landingPages?.alternatives?.google || {};
	const commonTranslations = dict.landingPages?.common || {};
	
	const title = landingTranslations.hero?.title || "Google Business Alternative – Thorbis vs GBP";
	const description = landingTranslations.hero?.subtitle || "See why Thorbis is a modern alternative to Google Business Profile: AI analytics, lead generation, multi‑platform sync, and full customization.";
	
	// Generate alternate language URLs
	const alternateLanguages = {};
	Object.keys(languages).forEach(lang => {
		alternateLanguages[`${lang}-${lang.toUpperCase()}`] = `https://thorbis.com/${lang}/google-business-alternative`;
	});

	return {
		title: `${title} | Thorbis`,
		description: description,
		keywords: ["Google Business alternative", "Google Business vs Thorbis", "GBP alternative", "lead generation", "business analytics"],
		alternates: { 
			canonical: `https://thorbis.com/${locale}/google-business-alternative`,
			languages: alternateLanguages,
		},
		openGraph: {
			title: title,
			description: description,
			type: "website",
			url: `https://thorbis.com/${locale}/google-business-alternative`,
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
			{ "@type": "ListItem", position: 2, name: "Google Business Alternative", item: "https://thorbis.com/google-business-alternative" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function GoogleBusinessAlternative() {
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
							Google Business vs <span className="text-primary">Thorbis</span>
						</h1>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">Discover why Thorbis is the superior alternative to Google Business Profile for businesses. We&apos;re building the Amazon for businesses - comprehensive, transparent, and growth-focused.</p>
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
					<p className="mt-4 text-lg text-muted-foreground">See how Thorbis stacks up against Google Business</p>
				</div>
				<div className="overflow-hidden rounded-xl shadow-lg border border-border">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-primary text-primary-foreground">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">Feature</th>
									<th className="px-6 py-4 text-center font-semibold">Google Business</th>
									<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Monthly Cost</td>
									<td className="px-6 py-4 text-center text-success dark:text-success">Free</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">$29</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Analytics & Insights</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced AI</td>
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
									<td className="px-6 py-4 font-medium text-foreground">Review Management</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Basic</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Advanced</td>
								</tr>
								<tr className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4 font-medium text-foreground">Customer Support</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
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
									<td className="px-6 py-4 font-medium text-foreground">Appointment Booking</td>
									<td className="px-6 py-4 text-center text-warning dark:text-warning">Limited</td>
									<td className="px-6 py-4 text-center text-success dark:text-success font-bold">Full System</td>
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
					{/* Google Business Analysis */}
					<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-destructive">
								<XCircle className="w-6 h-6" />
								Google Business Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Analytics</h4>
								<p className="text-sm text-muted-foreground">Basic insights with no advanced reporting or actionable recommendations.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">No Lead Generation</h4>
								<p className="text-sm text-muted-foreground">No tools to capture and qualify leads from profile visitors.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Poor Customer Support</h4>
								<p className="text-sm text-muted-foreground">Difficult to reach support, automated responses, and long resolution times.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Single Platform Focus</h4>
								<p className="text-sm text-muted-foreground">Only manages Google presence, no integration with other platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Limited Customization</h4>
								<p className="text-sm text-muted-foreground">Restrictive templates and limited branding options.</p>
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
								<h4 className="font-semibold text-success dark:text-success">Advanced AI Analytics</h4>
								<p className="text-sm text-muted-foreground">Comprehensive insights with AI-powered recommendations for business growth.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Lead Generation System</h4>
								<p className="text-sm text-muted-foreground">Automated lead capture, qualification, and follow-up system.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">24/7 Priority Support</h4>
								<p className="text-sm text-muted-foreground">Dedicated support team with quick response times and personalized solutions.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Multi-Platform Integration</h4>
								<p className="text-sm text-muted-foreground">Seamless sync across Google, Facebook, Apple Maps, and other major platforms.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Full Customization</h4>
								<p className="text-sm text-muted-foreground">Complete control over branding, design, and business presentation.</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-success dark:text-success">Growth & Marketing Tools</h4>
								<p className="text-sm text-muted-foreground">Email campaigns, social media integration, and marketing automation.</p>
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
								<BarChart3 className="w-6 h-6" />
							</div>
							<CardTitle>Advanced Analytics</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">AI-powered insights that go beyond basic metrics to provide actionable business recommendations.</p>
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
							<p className="text-sm text-muted-foreground">Automated lead capture system that converts profile visitors into qualified customers.</p>
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
							<p className="text-sm text-muted-foreground">Smart review monitoring, automated responses, and reputation optimization tools.</p>
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
							<p className="text-sm text-muted-foreground">Automatically sync your business information across all major platforms and directories.</p>
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
							<p className="text-sm text-muted-foreground">Integrated scheduling system with automated reminders and calendar sync.</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardHeader>
							<div className="flex items-center justify-center w-12 h-12 mb-4 text-primary-foreground bg-primary rounded-lg">
								<Settings className="w-6 h-6" />
							</div>
							<CardTitle>Business Automation</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Automate routine tasks, follow-ups, and customer communications to save time.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Value Proposition */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">The True Cost of &quot;Free&quot;</h2>
					<p className="mt-4 text-lg text-muted-foreground">Understand the hidden costs and missed opportunities</p>
				</div>
				<div className="p-8 text-center rounded-2xl border border-border bg-card">
					<div className="grid gap-8 md:grid-cols-2">
						<div className="text-left">
							<h3 className="mb-4 text-xl font-semibold text-destructive">Google Business Profile</h3>
							<ul className="space-y-3 text-sm">
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Limited customer insights</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No lead generation tools</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Poor customer support</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">Manual platform management</span>
								</li>
								<li className="flex items-center gap-3">
									<XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
									<span className="text-muted-foreground">No growth automation</span>
								</li>
							</ul>
							<p className="mt-4 text-lg font-semibold text-destructive">Hidden Cost: Lost Opportunities</p>
						</div>
						<div className="text-left">
							<h3 className="mb-4 text-xl font-semibold text-success dark:text-success">Thorbis Business</h3>
							<ul className="space-y-3 text-sm">
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">AI-powered insights</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Automated lead generation</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">24/7 priority support</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Multi-platform automation</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="w-4 h-4 text-success dark:text-success flex-shrink-0" />
									<span className="text-muted-foreground">Growth automation tools</span>
								</li>
							</ul>
							<p className="mt-4 text-lg font-semibold text-success dark:text-success">ROI: Increased Revenue & Growth</p>
						</div>
					</div>
				</div>
			</section>

			{/* Customer Success Stories */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Real Results from Real Businesses</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how businesses like yours are winning with Thorbis</p>
				</div>
				<div className="grid gap-8 md:grid-cols-3">
					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Award className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Case Study</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">+347%</div>
								<div className="text-sm text-muted-foreground">Lead Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"After switching from Google Business to Thorbis, our leads increased by 347% in just 3 months. The AI-powered insights helped us optimize our presence across all platforms."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Building className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Sarah Chen</div>
									<div className="text-xs text-muted-foreground">Owner, Chen's Auto Repair</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<TrendingUp className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Success Story</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">$45K</div>
								<div className="text-sm text-muted-foreground">Monthly Revenue Increase</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"Thorbis's multi-platform sync saved us 15 hours per week and increased our monthly revenue by $45,000. The ROI was immediate."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<Users className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Mike Rodriguez</div>
									<div className="text-xs text-muted-foreground">Director, Elite Fitness Studios</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
						<CardContent className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Clock className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-primary">Time Savings</span>
							</div>
							<div className="mb-4">
								<div className="text-2xl font-bold text-success dark:text-success">20hrs</div>
								<div className="text-sm text-muted-foreground">Weekly Time Saved</div>
							</div>
							<blockquote className="mb-4 text-sm text-muted-foreground">"No more logging into 5 different platforms. Thorbis manages everything from one dashboard. I save 20 hours per week and focus on what matters - my customers."</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
									<MapPin className="w-5 h-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">Jennifer Walsh</div>
									<div className="text-xs text-muted-foreground">Owner, Walsh Dental Practice</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* ROI Calculator Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Calculate Your ROI</h2>
					<p className="mt-4 text-lg text-muted-foreground">See how much you could save and earn with Thorbis</p>
				</div>
				<div className="max-w-4xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="p-8">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="w-5 h-5 text-primary" />
									Current Costs with Google Business
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Google Ads monthly spend</span>
									<span className="font-semibold">$2,500</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Staff time managing platforms (20hr/week)</span>
									<span className="font-semibold">$2,000</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Lost leads due to poor management</span>
									<span className="font-semibold">$3,200</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold">
										<span>Total Monthly Cost</span>
										<span className="text-destructive">$7,700</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-8 bg-primary/5 border-primary/20">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="flex items-center gap-2 text-primary">
									<Target className="w-5 h-5" />
									Projected Results with Thorbis
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0 space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Thorbis platform cost</span>
									<span className="font-semibold">$29</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Reduced staff time (5hr/week)</span>
									<span className="font-semibold">$500</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Increased leads (+40% conversion)</span>
									<span className="font-semibold text-success dark:text-success">+$4,800</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between items-center font-bold">
										<span>Net Monthly Gain</span>
										<span className="text-success dark:text-success">+$10,971</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
						<div className="text-3xl font-bold mb-2">$131,652</div>
						<div className="text-lg opacity-90">Projected Annual Savings & Growth</div>
						<Button variant="secondary" size="lg" className="mt-4 bg-white text-primary hover:bg-white/90">
							Get Your Custom ROI Report
							<ArrowRight className="ml-2 w-4 h-4" />
						</Button>
					</div>
				</div>
			</section>

			{/* Industry-Specific Benefits */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Every Industry</h2>
					<p className="mt-4 text-lg text-muted-foreground">Specialized features for your business type</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Building className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Restaurants</h3>
							<p className="text-sm text-muted-foreground">Menu management, reservation sync, review monitoring across TripAdvisor, Yelp, Google</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Settings className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Service Businesses</h3>
							<p className="text-sm text-muted-foreground">Lead qualification, appointment booking, service area management, contractor verification</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Shield className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Healthcare</h3>
							<p className="text-sm text-muted-foreground">HIPAA compliance, appointment scheduling, patient review management, insurance verification</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
								<Users className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">Retail</h3>
							<p className="text-sm text-muted-foreground">Inventory sync, promotional campaigns, local event marketing, customer loyalty programs</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Migration Guide */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">Seamless Migration in 3 Steps</h2>
					<p className="mt-4 text-lg text-muted-foreground">We handle the heavy lifting - zero downtime guaranteed</p>
				</div>
				<div className="grid gap-8 md:grid-cols-3">
					<div className="relative">
						<Card className="h-full">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
									<span className="text-2xl font-bold text-primary">1</span>
								</div>
								<h3 className="text-xl font-semibold mb-4">Connect & Audit</h3>
								<p className="text-muted-foreground mb-6">Our migration specialists connect to your Google Business Profile and audit your current setup. We identify optimization opportunities and create a custom migration plan.</p>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Profile analysis</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Review history import</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Photo migration</span>
									</div>
								</div>
							</CardContent>
						</Card>
						<div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"></div>
					</div>

					<div className="relative">
						<Card className="h-full">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
									<span className="text-2xl font-bold text-primary">2</span>
								</div>
								<h3 className="text-xl font-semibold mb-4">Optimize & Expand</h3>
								<p className="text-muted-foreground mb-6">We optimize your existing presence and expand to additional platforms. AI-powered optimization ensures maximum visibility and lead generation potential.</p>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Multi-platform setup</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>SEO optimization</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Lead generation setup</span>
									</div>
								</div>
							</CardContent>
						</Card>
						<div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"></div>
					</div>

					<div>
						<Card className="h-full">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
									<span className="text-2xl font-bold text-primary">3</span>
								</div>
								<h3 className="text-xl font-semibold mb-4">Launch & Monitor</h3>
								<p className="text-muted-foreground mb-6">Your enhanced presence goes live across all platforms. We monitor performance and provide ongoing optimization recommendations to maximize your ROI.</p>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Performance monitoring</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>AI recommendations</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-success dark:text-success" />
										<span>Ongoing support</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
				<div className="mt-12 text-center">
					<Card className="inline-block p-6 bg-primary/5 border-primary/20">
						<div className="flex items-center gap-4">
							<Shield className="w-8 h-8 text-primary" />
							<div className="text-left">
								<div className="font-semibold">Zero Downtime Guarantee</div>
								<div className="text-sm text-muted-foreground">Your business stays visible throughout the entire migration process</div>
							</div>
						</div>
					</Card>
				</div>
			</section>

			{/* Interactive Demo Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold text-foreground sm:text-4xl">See Thorbis in Action</h2>
					<p className="mt-4 text-lg text-muted-foreground">Interactive demo - no signup required</p>
				</div>
				<div className="grid gap-8 lg:grid-cols-2 items-center">
					<div>
						<Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow">
							<div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
								<div className="absolute inset-0 bg-neutral-950/20"></div>
								<Button size="lg" className="relative z-10">
									<Play className="w-6 h-6 mr-2" />
									Watch 2-Minute Demo
								</Button>
							</div>
							<h3 className="text-xl font-semibold mb-4">Live Dashboard Preview</h3>
							<p className="text-muted-foreground mb-6">See exactly how Thorbis manages your business presence across Google, Yelp, Facebook, and 15+ other platforms from one unified dashboard.</p>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center gap-2">
									<Zap className="w-4 h-4 text-primary" />
									<span>Real-time sync</span>
								</div>
								<div className="flex items-center gap-2">
									<BarChart3 className="w-4 h-4 text-primary" />
									<span>AI insights</span>
								</div>
								<div className="flex items-center gap-2">
									<Users className="w-4 h-4 text-primary" />
									<span>Lead tracking</span>
								</div>
								<div className="flex items-center gap-2">
									<MessageSquare className="w-4 h-4 text-primary" />
									<span>Review management</span>
								</div>
							</div>
						</Card>
					</div>
					<div className="space-y-6">
						<Card className="p-6">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Phone className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h4 className="font-semibold">Book a Personal Demo</h4>
									<p className="text-sm text-muted-foreground">15-minute walkthrough with migration specialist</p>
								</div>
							</div>
							<Button className="w-full">
								Schedule Your Demo
								<ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						</Card>

						<Card className="p-6">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Mail className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h4 className="font-semibold">Free Migration Audit</h4>
									<p className="text-sm text-muted-foreground">Get a detailed report of optimization opportunities</p>
								</div>
							</div>
							<Button variant="outline" className="w-full">
								Get Free Audit
								<Target className="ml-2 w-4 h-4" />
							</Button>
						</Card>

						<div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
							<div className="flex items-center gap-2 mb-2">
								<Clock className="w-4 h-4 text-primary" />
								<span className="text-sm font-semibold text-primary">Migration Timeline</span>
							</div>
							<div className="text-sm text-muted-foreground">
								<div>• Day 1: Connect & audit your accounts</div>
								<div>• Day 2-3: Setup and optimize all platforms</div>
								<div>• Day 4: Launch with full monitoring</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Upgrade from Google Business?</h2>
						<p className="mb-8 text-xl opacity-90">Join thousands of businesses that have upgraded to Thorbis for better results, more leads, and faster growth. Start your free trial today.</p>
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
								<span>No long-term contract</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>Migration included</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="w-4 h-4" />
								<span>24/7 support</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Related Comparisons */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore Other Platform Comparisons</h2>
					<p className="mt-4 text-muted-foreground">See how Thorbis outperforms other major business platforms</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/yelp-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Yelp vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Industry-specific comparisons with cost analysis and migration timeline</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/bark-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Bark vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Service contractor success stories with +234% conversion increases</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/angies-list-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Angie's List vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Home service provider success stories with $306K+ annual gains</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/booking-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Booking.com vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Travel business ROI calculator showing $341K+ annual savings</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/expedia-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">Expedia vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Commission elimination strategies with $528K+ total benefits</p>
							</CardContent>
						</Card>
					</Link>
					<Link href="/tripadvisor-alternative">
						<Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 duration-300">
							<CardContent className="p-6">
								<h3 className="font-semibold text-foreground">TripAdvisor vs Thorbis</h3>
								<p className="text-sm text-muted-foreground">Restaurant POS integration and reservation system comparison</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>
		</main>
	);
}
