import Image from "next/image";

import { ArrowRight, Check, Building2, Search, BarChart3, Shield, Globe, Zap, FileText, Star, Briefcase, Image as ImageIcon, Download, Route } from "lucide-react";
import LocalHubClient from "./local-hub-client";

import { generateStaticPageMetadata } from "@utils/server-seo";

// For now, let's use static components to avoid dynamic import issues
// We'll add motion back once the basic layout is working
function MotionSection({ children, className = "" }) {
	return <div className={className}>{children}</div>;
}

function MotionHero({ children }) {
	return <div>{children}</div>;
}

function MotionCard({ children, className = "" }) {
	return <div className={className}>{children}</div>;
}

function MotionButton({ children, className = "", href, ...props }) {
	const Component = href ? "a" : "button";
	return (
		<Component href={href} className={className} {...props}>
			{children}
		</Component>
	);
}

function MotionGrid({ children, className = "" }) {
	return <div className={className}>{children}</div>;
}

function MotionGridItem({ children, className = "" }) {
	return <div className={className}>{children}</div>;
}

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "LocalHub - Build Your Own Local Business Directory | Thorbis",
		description: "Create and monetize your own local business directory with LocalHub. Set your own pricing, earn recurring revenue from local businesses in your community.",
		path: "/localhub",
		keywords: ["local directory", "business directory platform", "monetize directory", "white label directory", "local business platform"],
	});
}

// JSON-LD structured data
const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "LocalHub",
	description: "Create and monetize your own local business directory platform",
	url: "https://thorbis.com/localhub",
	applicationCategory: "BusinessApplication",
	operatingSystem: "Web",
	offers: {
		"@type": "Offer",
		name: "LocalHub Platform",
		description: "White-label business directory solution",
	},
	breadcrumb: {
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://thorbis.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "LocalHub",
				item: "https://thorbis.com/localhub",
			},
		],
	},
};



export default function LocalHubPage() {
	const faq = [
		{
			q: "How does the 25% revenue share work?",
			a: "You keep 75% of all revenue you generate. LocalHub takes 25% to cover hosting, support, and platform maintenance. No revenue means no fees!",
		},
		{
			q: "What happens if I don't make any money?",
			a: "LocalHub is completely free if you don't earn revenue. There are no setup fees, monthly costs, or hidden charges. We only succeed when you do.",
		},
		{
			q: "How quickly can I start earning money?",
			a: "Most directory owners start earning within their first month. Our platform includes built-in SEO optimization and business outreach tools to help you attract paying customers fast.",
		},
		{
			q: "Do I own my directory and customer data?",
			a: "Yes! You own your brand, domain, customer relationships, and all business data. LocalHub provides the technology platform, but your directory business belongs to you.",
		},
		{
			q: "What support do I get as a LocalHub partner?",
			a: "All partners get 24/7 technical support, business growth coaching, marketing templates, and access to our partner community. We're invested in your success!",
		},
		{
			q: "Can I customize the design and features?",
			a: "Absolutely! Choose from 50+ professional templates, customize colors and branding, add your logo, and configure features to match your local market needs.",
		},
	];

	return (
		<main className="min-h-screen w-full bg-black text-white">
			{/* JSON-LD */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			{/* Hero Section - Full Height */}
			<section className="relative min-h-[100svh] flex items-center py-16" id="hero-section">
				<div className="w-full max-w-[1400px] mx-auto px-6 text-center">
					<MotionHero>
						{/* Main Headline */}
						<h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 text-white">
							Launch your local
							<br />
							<span className="text-blue-500">business directory</span>
						</h1>

						{/* Large Subheadline */}
						<p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed mb-16 max-w-4xl mx-auto">
							Build a profitable local directory in minutes. We take 25% of your revenue,
							<strong className="text-white"> otherwise it's completely free</strong>.
						</p>

						{/* Large CTA */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
							<MotionButton href="/signup" className="inline-flex items-center gap-3 rounded-2xl bg-blue-500 text-white px-12 py-6 font-bold text-xl hover:bg-blue-600 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25">
								Start building for free
								<ArrowRight className="h-6 w-6" />
							</MotionButton>
							<MotionButton href="#demo" className="inline-flex items-center gap-3 rounded-2xl border-2 border-white/20 text-white px-12 py-6 font-bold text-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
								See how it works
							</MotionButton>
						</div>

						{/* Large Social Proof */}
						<div className="text-muted-foreground">
							<div className="text-2xl font-bold mb-4">Join 500+ successful directory owners</div>
							<div className="flex items-center justify-center gap-12 text-lg font-semibold">
								<span className="flex items-center gap-2">✓ No setup fees</span>
								<span className="flex items-center gap-2">✓ No monthly costs</span>
								<span className="flex items-center gap-2">✓ Only pay when you earn</span>
							</div>
						</div>
					</MotionHero>
				</div>
			</section>

			{/* Mobile enhanced UX (client component) */}
			<LocalHubClient />

			{/* Success Stories */}
			<section className="py-32 bg-white">
				<MotionSection className="w-full max-w-[1400px] mx-auto px-6 text-center">
					<p className="text-2xl font-bold text-muted-foreground mb-16">Trusted by successful directory owners nationwide</p>

					{/* Success Metrics */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
						{[
							{ number: "500+", label: "Active directories" },
							{ number: "$2.4M", label: "Revenue generated" },
							{ number: "25k+", label: "Businesses listed" },
							{ number: "4.9★", label: "Average rating" },
						].map((stat, idx) => (
							<div key={idx} className="text-center">
								<div className="text-5xl md:text-6xl font-black text-black mb-4">{stat.number}</div>
								<div className="text-lg font-semibold text-muted-foreground">{stat.label}</div>
							</div>
						))}
					</div>

					{/* Customer Logos */}
					<div className="flex flex-wrap items-center justify-center gap-12 opacity-80">
						{["Austin Local Hub", "Miami Business Connect", "Seattle Small Biz", "Denver Directory Pro"].map((name, idx) => (
							<div key={idx} className="flex items-center gap-3 text-muted-foreground">
								<Building2 className="h-6 w-6 text-blue-500" />
								<span className="font-bold text-lg">{name}</span>
							</div>
						))}
					</div>
				</MotionSection>
			</section>

			{/* Revenue Opportunities */}
			<section className="py-32 bg-black">
				<MotionSection className="w-full max-w-[1400px] mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-20 items-center">
						{/* Left Content */}
						<div>
							<div className="inline-flex items-center gap-3 rounded-full bg-blue-500/20 px-6 py-3 text-lg font-bold text-blue-400 mb-8">
								<BarChart3 className="h-6 w-6" />
								Revenue Streams
							</div>
							<h2 className="text-5xl md:text-6xl font-black mb-8 text-white">
								Turn your local knowledge into <span className="text-blue-500">recurring revenue</span>
							</h2>
							<p className="text-2xl text-muted-foreground leading-relaxed mb-12">
								LocalHub directory owners earn an average of <strong className="text-white">$8,500 per month</strong> through multiple proven monetization strategies.
							</p>

							{/* Revenue Streams */}
							<div className="space-y-8">
								{[
									{
										icon: Building2,
										title: "Featured Listings",
										description: "Businesses pay $50-$200/month for premium placement",
										revenue: "$2,500/mo avg",
										bg: "bg-blue-500",
									},
									{
										icon: Search,
										title: "Category Sponsorships",
										description: "Exclusive category rights for $300-$500/month",
										revenue: "$3,200/mo avg",
										bg: "bg-blue-500",
									},
									{
										icon: Route,
										title: "Lead Generation",
										description: "Qualified lead routing at $15-$50 per lead",
										revenue: "$2,800/mo avg",
										bg: "bg-blue-500",
									},
								].map((stream, idx) => (
									<div key={idx} className="flex items-start gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
										<div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${stream.bg} flex items-center justify-center`}>
											<stream.icon className="h-8 w-8 text-white" />
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-4">
												<h4 className="text-2xl font-black text-white">{stream.title}</h4>
												<span className="text-xl font-bold text-blue-400">{stream.revenue}</span>
											</div>
											<p className="text-lg text-muted-foreground">{stream.description}</p>
										</div>
									</div>
								))}
							</div>

							<div className="mt-12">
								<MotionButton href="/revenue-calculator" className="inline-flex items-center gap-3 rounded-2xl bg-blue-500 text-white px-10 py-6 font-bold text-xl hover:bg-blue-600 transition-all duration-300 shadow-2xl">
									Calculate your revenue potential
									<ArrowRight className="h-6 w-6" />
								</MotionButton>
							</div>
						</div>

						{/* Right Visual */}
						<MotionSection variant="scaleIn" delay={0.2} className="relative">
							{/* Revenue Chart Mockup */}
							<div className="bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 overflow-hidden">
								<div className="flex items-center justify-between mb-6">
									<h3 className="font-bold text-neutral-900 dark:text-white">Revenue Growth</h3>
									<div className="text-sm text-neutral-600 dark:text-neutral-400">Last 12 months</div>
								</div>

								{/* Chart Bars */}
								<div className="flex items-end justify-between gap-2 h-40 mb-6">
									{[20, 35, 45, 55, 70, 85, 95, 110, 125, 135, 150, 165].map((height, idx) => (
										<div key={idx} className="flex-1 flex flex-col items-center gap-2">
											<div className="w-full bg-green-600 rounded-t-sm" style={{ height: `${height}px` }} />
											<div className="text-xs text-neutral-400 rotate-45 origin-bottom-left">{new Date(2024, idx).toLocaleDateString("en", { month: "short" })}</div>
										</div>
									))}
								</div>

								{/* Revenue Breakdown */}
								<div className="grid grid-cols-3 gap-4 text-center">
									<div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50">
										<div className="text-lg font-bold text-blue-600">$4.2K</div>
										<div className="text-xs text-neutral-600 dark:text-neutral-400">Featured</div>
									</div>
									<div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50">
										<div className="text-lg font-bold text-purple-600">$3.8K</div>
										<div className="text-xs text-neutral-600 dark:text-neutral-400">Sponsors</div>
									</div>
									<div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/50">
										<div className="text-lg font-bold text-orange-600">$3.1K</div>
										<div className="text-xs text-neutral-600 dark:text-neutral-400">Leads</div>
									</div>
								</div>
							</div>

							{/* Floating Revenue Badge */}
							<div className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-2xl p-4 shadow-lg rotate-12">
								<div className="text-sm font-semibold">Total Revenue</div>
								<div className="text-2xl font-bold">$11,100</div>
								<div className="text-xs opacity-80">This month</div>
							</div>
						</MotionSection>
					</div>
				</MotionSection>
			</section>

			{/* How It Works */}
			<section className="py-32 bg-white">
				<MotionSection className="w-full max-w-[1400px] mx-auto px-6 text-center mb-20">
					<div className="inline-flex items-center gap-3 rounded-full bg-blue-500/20 px-6 py-3 text-lg font-bold text-blue-600 mb-8">
						<Route className="h-6 w-6" />
						How LocalHub Works
					</div>
					<h2 className="text-5xl md:text-6xl font-black mb-8 text-black">From zero to profitable in <span className="text-blue-500">3 steps</span></h2>
					<p className="text-2xl text-muted-foreground max-w-3xl mx-auto">Launch your local directory in minutes and start earning revenue from day one</p>
				</MotionSection>

				<MotionGrid className="w-full max-w-[1200px] mx-auto px-6 grid gap-12">
					{[
						{
							step: "01",
							title: "Choose your city & setup",
							description: "Pick your location, customize your brand, and go live instantly with our ready-to-use templates",
							icon: Globe,
							bg: "bg-blue-500",
						},
						{
							step: "02",
							title: "Businesses find & join you",
							description: "Our SEO-optimized platform attracts local businesses. They discover your directory and request premium features",
							icon: Search,
							bg: "bg-blue-500",
						},
						{
							step: "03",
							title: "Collect revenue automatically",
							description: "Get paid for featured listings, category sponsorships, and qualified leads. We handle billing, you keep 75%",
							icon: BarChart3,
							bg: "bg-blue-500",
						},
					].map((item, idx) => (
						<MotionGridItem key={idx}>
							<div className="flex flex-col lg:flex-row items-center gap-12">
								{/* Step Number */}
								<div className={`flex-shrink-0 w-24 h-24 rounded-3xl ${item.bg} flex items-center justify-center text-white font-black text-3xl shadow-2xl`}>{item.step}</div>

								{/* Content */}
								<div className="flex-1 text-center lg:text-left">
									<div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
										<item.icon className="h-8 w-8 text-blue-500" />
										<h3 className="text-3xl font-black text-black">{item.title}</h3>
									</div>
									<p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
								</div>

								{/* Arrow (except last item) */}
								{idx < 2 && (
									<div className="hidden lg:block">
										<ArrowRight className="h-8 w-8 text-blue-500" />
									</div>
								)}
							</div>
						</MotionGridItem>
					))}
				</MotionGrid>

				{/* CTA */}
				<MotionSection className="text-center mt-20 px-6">
					<MotionButton href="/signup" className="inline-flex items-center gap-3 rounded-2xl bg-blue-500 text-white px-12 py-6 font-bold text-xl hover:bg-blue-600 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25">
						Start your directory now
						<ArrowRight className="h-6 w-6" />
					</MotionButton>
					<p className="text-muted-foreground mt-6 font-semibold text-lg">Takes less than 5 minutes to set up</p>
				</MotionSection>
			</section>

			{/* Large feature row */}
			<section className="w-full mt-12 px-4 sm:px-8">
				<div className="w-full max-w-[1400px] mx-auto rounded-3xl bg-[#f6f7fb] dark:bg-[#171717] p-10 grid md:grid-cols-2 gap-10 items-center">
					<div className="space-y-4 order-2 md:order-1">
						<h3 className="text-2xl md:text-3xl font-semibold">Flexible revenue streams</h3>
						<ul className="space-y-2 text-foreground">
							<li className="flex items-start gap-2">
								<Check className="h-5 w-5 text-green-600" /> Featured listings with tiered placements
							</li>
							<li className="flex items-start gap-2">
								<Check className="h-5 w-5 text-green-600" /> Category sponsorships with caps and reporting
							</li>
							<li className="flex items-start gap-2">
								<Check className="h-5 w-5 text-green-600" /> Qualified leads with audit logs and attribution
							</li>
						</ul>
						<a href="#pricing" className="inline-flex items-center gap-2 text-blue-600 font-medium">
							See pricing <ArrowRight className="h-4 w-4" />
						</a>
					</div>
					<div className="order-1 md:order-2">
						<Image src="/assets/images/heroes/pexels-christian-heitz-285904-842711.jpg" alt="Revenue" width={1200} height={500} className="w-full h-full object-cover rounded-xl" />
					</div>
				</div>
			</section>

			{/* Why LocalHub */}
			<section className="w-full mt-20 px-4 sm:px-8 bg-neutral-50 dark:bg-neutral-900 py-16">
				<MotionSection className="w-full max-w-[1400px] mx-auto text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
						<Zap className="h-4 w-4" />
						Platform Benefits
					</div>
					<h3 className="text-4xl md:text-6xl font-bold mb-4">Why choose LocalHub</h3>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">Everything you need to build, launch, and monetize a professional local business directory</p>
				</MotionSection>
				<MotionGrid className="w-full max-w-[1400px] mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{[
						{ title: "Pre-built Taxonomy", desc: "Launch faster with our comprehensive database of cities, neighborhoods, and business categories.", Icon: Globe },
						{ title: "Lightning Search", desc: "Advanced search with filters, facets, and AI-powered relevance tuned specifically for local discovery.", Icon: Search },
						{ title: "Rich Business Profiles", desc: "Complete business pages with photos, hours, services, menus, contact info, and customer reviews.", Icon: Building2 },
						{ title: "Smart Moderation", desc: "AI-powered content moderation with flagging, dispute resolution, and comprehensive audit trails.", Icon: Shield },
						{ title: "Advanced Analytics", desc: "Track performance with detailed metrics on traffic, clicks, calls, leads, and conversions.", Icon: BarChart3 },
						{ title: "Global Ready", desc: "Multi-language support with localized URLs, metadata, and currency for international expansion.", Icon: Globe },
					].map(({ title, desc, Icon }, idx) => (
						<MotionGridItem key={title}>
							<div className="group relative rounded-2xl border bg-white dark:bg-neutral-950 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
								{/* Icon with gradient background */}
								<div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 mb-6`}>
									<Icon className="h-6 w-6 text-foreground" />
								</div>
								<h4 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{title}</h4>
								<p className="text-muted-foreground leading-relaxed">{desc}</p>

								{/* Hover effect */}
								<div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/5 transition-opacity duration-300 pointer-events-none" />
							</div>
						</MotionGridItem>
					))}
				</MotionGrid>
			</section>

			{/* Pre-built Directory Tools (sticky + cards) */}
			<section className="w-full mt-20 px-4 sm:px-8 bg-black py-32">
				<div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12">
					<div className="lg:max-w-[35%] flex flex-col items-start gap-6 p-4 mx-auto lg:mx-0 text-center lg:text-left">
						<div className="lg:sticky top-40">
							<h2 className="text-5xl md:text-6xl font-black text-white mb-8">Pre-built Directory Tools</h2>
							<a href="/signup" className="mt-10 inline-flex items-center justify-center rounded-2xl bg-blue-500 text-white px-8 py-4 font-bold text-lg hover:bg-blue-600 transition-colors shadow-2xl">
								Get Started
							</a>
						</div>
					</div>
					<div className="flex-1 flex flex-col gap-12 px-[10%] lg:px-0">
						{[
							{ Icon: FileText, title: "Listings moderation", desc: "Flagging, disputes, and audit logs keep quality high." },
							{ Icon: Star, title: "Review analytics", desc: "Track ratings, volume, sentiment, and responses." },
							{ Icon: Briefcase, title: "Sponsor management", desc: "Configure placements, caps, and reporting for sponsors." },
							{ Icon: ImageIcon, title: "Photo galleries", desc: "Rich galleries for business profiles and collections." },
							{ Icon: Download, title: "Import listings", desc: "Bulk import with validation for categories and businesses." },
							{ Icon: Route, title: "Lead routing", desc: "Capture, qualify, and route leads with attribution." },
						].map(({ Icon, title, desc }) => (
							<a key={title} href="#" className="flex w-full gap-10 rounded-3xl hover:shadow-2xl transition-all duration-300 p-10 group bg-white/5 border border-white/10 backdrop-blur-sm">
								<div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center">
									<Icon className="h-8 w-8 text-white" />
								</div>
								<div className="flex flex-col gap-6">
									<h3 className="text-3xl font-black text-white">{title}</h3>
									<p className="text-xl text-muted-foreground">{desc}</p>
									<div className="mt-auto flex gap-3 text-blue-400 font-semibold text-lg">
										<span>Learn more</span>
										<ArrowRight className="h-5 w-5" />
									</div>
								</div>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* LocalHub vs Competitors */}
			<section className="w-full mt-20 px-4 sm:px-8 py-16">
				<MotionSection className="w-full max-w-[1400px] mx-auto text-center mb-16">
					<div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 mb-6">
						<Shield className="h-4 w-4" />
						Why LocalHub Wins
					</div>
					<h3 className="text-4xl md:text-6xl font-bold mb-4">Stop overpaying for multiple tools</h3>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">LocalHub replaces 6+ expensive SaaS subscriptions with one powerful, integrated platform designed specifically for local directories.</p>
				</MotionSection>

				<MotionGrid className="w-full max-w-[1400px] mx-auto grid gap-8 lg:grid-cols-2">
					{/* Traditional Approach */}
					<MotionGridItem>
						<div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 border-2 border-red-200 dark:border-red-800">
							<div className="text-center mb-8">
								<div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<span className="text-white font-bold text-xl">😵</span>
								</div>
								<h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Traditional Approach</h3>
								<p className="text-red-600 dark:text-red-400">Expensive, fragmented, time-consuming</p>
							</div>

							<div className="space-y-4">
								{[
									{ tool: "Website Builder", price: "$29/mo", limitations: "No directory features" },
									{ tool: "Database Hosting", price: "$45/mo", limitations: "Complex setup required" },
									{ tool: "SEO Tools", price: "$99/mo", limitations: "General, not local-focused" },
									{ tool: "Email Marketing", price: "$39/mo", limitations: "No business automation" },
									{ tool: "Analytics Platform", price: "$59/mo", limitations: "Generic reporting" },
									{ tool: "Payment Processing", price: "$25/mo", limitations: "High transaction fees" },
									{ tool: "Customer Support", price: "$79/mo", limitations: "Not directory-specific" },
								].map((item, idx) => (
									<div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-800">
										<div>
											<div className="font-medium text-neutral-900 dark:text-white">{item.tool}</div>
											<div className="text-sm text-red-600 dark:text-red-400">{item.limitations}</div>
										</div>
										<div className="text-lg font-bold text-red-600">{item.price}</div>
									</div>
								))}
							</div>

							<div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 rounded-xl text-center">
								<div className="text-3xl font-bold text-red-700 dark:text-red-400">$375/month</div>
								<div className="text-sm text-red-600 dark:text-red-400">Plus setup fees, integration costs, and headaches</div>
							</div>
						</div>
					</MotionGridItem>

					{/* LocalHub Approach */}
					<MotionGridItem>
						<div className="bg-green-50 dark:bg-green-950/20 rounded-3xl p-8 border-2 border-green-200 dark:border-green-800 relative">
							{/* Popular Badge */}
							<div className="absolute -top-4 left-1/2 -translate-x-1/2">
								<span className="rounded-full bg-green-600 px-4 py-1 text-sm font-medium text-white">Recommended</span>
							</div>

							<div className="text-center mb-8">
								<div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Zap className="h-8 w-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">LocalHub All-in-One</h3>
								<p className="text-green-600 dark:text-green-400">Complete, integrated, profitable</p>
							</div>

							<div className="space-y-4">
								{["Directory website builder with 50+ templates", "Managed hosting & automatic backups", "Local SEO optimization & schema markup", "Built-in lead capture & email automation", "Revenue analytics & business intelligence", "Integrated payment processing (2.9% only)", "Directory-specific customer support", "White-label branding & custom domains", "Review management & moderation tools", "Mobile app for business owners"].map((feature, idx) => (
									<div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-green-200 dark:border-green-800">
										<div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
											<Check className="h-4 w-4 text-white" />
										</div>
										<span className="text-neutral-900 dark:text-white font-medium text-sm">{feature}</span>
									</div>
								))}
							</div>

							<div className="mt-6 p-4 bg-green-100 dark:bg-green-900/50 rounded-xl text-center">
								<div className="text-3xl font-bold text-green-700 dark:text-green-400">$79/month</div>
								<div className="text-sm text-green-600 dark:text-green-400">Everything included, no hidden fees</div>
							</div>
						</div>
					</MotionGridItem>
				</MotionGrid>

				{/* Savings Calculator */}
				<MotionSection className="w-full max-w-[1400px] mx-auto mt-16 text-center">
					<div className="bg-green-700 rounded-3xl p-8 text-white">
						<h3 className="text-3xl font-bold mb-4">No risk, all reward</h3>
						<p className="text-xl text-green-100 mb-6">Start completely free and only pay when you earn. Zero upfront investment required.</p>
						<MotionButton href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white text-green-700 px-8 py-4 font-bold text-lg hover:bg-green-50 transition-all duration-300">
							Start earning today
							<ArrowRight className="h-5 w-5" />
						</MotionButton>
					</div>
				</MotionSection>
			</section>

			{/* Access and compare */}
			<section className="relative w-full px-4 sm:px-8 py-12">
				<div className="w-full max-w-[1400px] mx-auto rounded-md bg-[#f6f7fb] dark:bg-[#171717] py-12 flex flex-col items-center gap-4 px-4">
					<h3 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 dark:text-white">Access and compare neighborhoods & categories</h3>
					<div className="mt-6">
						<a href="/search" className="inline-flex items-center rounded-full px-6 py-3 font-semibold border bg-blue-600 text-white hover:bg-blue-700 transition-colors">
							Launch Directory
						</a>
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="w-full mt-20 px-4 sm:px-8">
				<MotionSection className="w-full max-w-[1400px] mx-auto text-center mb-16">
					<div className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 mb-6">
						<Star className="h-4 w-4" />
						Success Stories
					</div>
					<h3 className="text-4xl md:text-5xl font-bold mb-4">Trusted by directory entrepreneurs</h3>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Join hundreds of successful directory owners who've built thriving local marketplaces with LocalHub</p>
				</MotionSection>
				<MotionGrid className="w-full max-w-[1400px] mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
					{[
						{
							name: "Sarah Chen",
							role: "Founder",
							company: "Austin Local Hub",
							avatar: "SC",
							rating: 5,
							text: "LocalHub helped me launch my Austin directory in just 2 weeks. I'm now earning $3,500/month from featured listings and leads.",
							bg: "from-pink-500 to-rose-500",
						},
						{
							name: "Marcus Rodriguez",
							role: "CEO",
							company: "Miami Business Connect",
							avatar: "MR",
							rating: 5,
							text: "The built-in monetization tools are incredible. We've generated over $50k in revenue in our first year using LocalHub's platform.",
							bg: "from-blue-500 to-indigo-500",
						},
						{
							name: "Jennifer Kim",
							role: "Director",
							company: "Seattle Small Biz",
							avatar: "JK",
							rating: 5,
							text: "The SEO optimization and local search features brought us 10x more organic traffic than our previous solution.",
							bg: "from-green-500 to-emerald-500",
						},
						{
							name: "David Thompson",
							role: "Owner",
							company: "Denver Directory Pro",
							avatar: "DT",
							rating: 5,
							text: "Customer support is amazing and the analytics dashboard gives me everything I need to optimize our listings.",
							bg: "from-purple-500 to-violet-500",
						},
						{
							name: "Lisa Martinez",
							role: "Founder",
							company: "Phoenix Local Network",
							avatar: "LM",
							rating: 5,
							text: "We migrated from a custom solution to LocalHub and saw immediate improvements in performance and user engagement.",
							bg: "from-orange-500 to-amber-500",
						},
						{
							name: "Robert Wilson",
							role: "President",
							company: "Tampa Bay Business Hub",
							avatar: "RW",
							rating: 5,
							text: "The white-label customization options let us maintain our brand while leveraging LocalHub's powerful technology.",
							bg: "from-teal-500 to-cyan-500",
						},
					].map((testimonial, idx) => (
						<MotionGridItem key={idx}>
							<div className="group relative rounded-2xl border bg-white dark:bg-neutral-950 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
								{/* Star Rating */}
								<div className="flex items-center gap-1 mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
									))}
								</div>

								{/* Testimonial Text */}
								<blockquote className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</blockquote>

								{/* Author */}
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 text-white font-semibold text-sm">{testimonial.avatar}</div>
									<div>
										<div className="font-semibold text-foreground">{testimonial.name}</div>
										<div className="text-sm text-muted-foreground">
											{testimonial.role}, {testimonial.company}
										</div>
									</div>
								</div>

								{/* Hover gradient effect */}
								<div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/5 transition-opacity duration-300 pointer-events-none" />
							</div>
						</MotionGridItem>
					))}
				</MotionGrid>

				{/* Social Proof Bar */}
				<MotionSection className="w-full max-w-[1400px] mx-auto mt-16 text-center">
					<div className="inline-flex items-center gap-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-8 py-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">500+</div>
							<div className="text-sm text-muted-foreground">Active Directories</div>
						</div>
						<div className="w-px h-12 bg-border" />
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">$2M+</div>
							<div className="text-sm text-muted-foreground">Revenue Generated</div>
						</div>
						<div className="w-px h-12 bg-border" />
						<div className="text-center">
							<div className="text-3xl font-bold text-purple-600">98%</div>
							<div className="text-sm text-muted-foreground">Satisfaction Rate</div>
						</div>
					</div>
				</MotionSection>
			</section>

			{/* Pricing - Revenue Share Model */}
			<section id="pricing" className="py-24 bg-white dark:bg-neutral-950">
				<MotionSection className="w-full max-w-[1200px] mx-auto px-6 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950 px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-6">
						<Briefcase className="h-4 w-4" />
						Simple Pricing
					</div>
					<h3 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white">Free to start, grow together</h3>
					<p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-16">No upfront costs, no monthly fees. We only succeed when you do.</p>

					{/* Single Pricing Card */}
					<MotionSection className="max-w-2xl mx-auto">
						<div className="relative bg-blue-700 text-white rounded-3xl p-12 shadow-2xl">
							<div className="absolute -top-4 left-1/2 -translate-x-1/2">
								<span className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-bold text-black">Revenue Share Model</span>
							</div>

							<div className="text-center mb-8">
								<h4 className="text-3xl font-bold mb-4">LocalHub Partnership</h4>
								<div className="mb-6">
									<span className="text-6xl font-bold">25%</span>
									<span className="text-2xl text-blue-100 ml-2">revenue share</span>
								</div>
								<p className="text-xl text-blue-100">We take 25% of what you earn, you keep 75%</p>
							</div>

							<div className="bg-white/10 rounded-2xl p-8 mb-8">
								<h5 className="text-xl font-bold mb-4 text-center">What's included</h5>
								<div className="grid md:grid-cols-2 gap-4">
									{["Complete directory platform", "Unlimited business listings", "Advanced SEO optimization", "Payment processing built-in", "Mobile-responsive design", "Custom domain & branding", "Review management system", "Lead capture & routing", "Analytics & reporting", "Email marketing tools", "24/7 customer support", "Regular updates & new features"].map((feature, idx) => (
										<div key={idx} className="flex items-center gap-3">
											<Check className="h-5 w-5 text-green-300 flex-shrink-0" />
											<span className="text-blue-100">{feature}</span>
										</div>
									))}
								</div>
							</div>

							<div className="text-center">
								<MotionButton href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
									Start building for free
									<ArrowRight className="h-6 w-6" />
								</MotionButton>
								<p className="text-blue-100 text-sm mt-4">No credit card required • Start earning immediately</p>
							</div>
						</div>
					</MotionSection>

					{/* Revenue Examples */}
					<MotionSection className="mt-16">
						<h4 className="text-2xl font-bold mb-8">How it works in practice</h4>
						<div className="grid md:grid-cols-3 gap-6">
							{[
								{ earnings: "$1,000", yours: "$750", ours: "$250", scenario: "Small town directory" },
								{ earnings: "$5,000", yours: "$3,750", ours: "$1,250", scenario: "Mid-size city" },
								{ earnings: "$20,000", yours: "$15,000", ours: "$5,000", scenario: "Major metropolitan" },
							].map((example, idx) => (
								<div key={idx} className="bg-white dark:bg-neutral-950 rounded-2xl p-6 border">
									<div className="text-center">
										<div className="text-sm text-muted-foreground mb-2">{example.scenario}</div>
										<div className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
											{example.earnings} <span className="text-sm text-muted-foreground">monthly</span>
										</div>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-green-600 font-medium">You keep:</span>
												<span className="font-bold">{example.yours}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-blue-600 font-medium">LocalHub:</span>
												<span className="font-bold">{example.ours}</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</MotionSection>
				</MotionSection>
			</section>

			{/* Articles */}
			<section className="w-full mt-16 px-4 sm:px-8">
				<div className="w-full max-w-[1400px] mx-auto text-center">
					<h3 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">Read resources by experts</h3>
				</div>
				<div className="w-full max-w-[1400px] mx-auto mt-10 grid gap-10 grid-cols-1 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<a key={i} href="#" className="h-[500px] w-full flex flex-col gap-2 overflow-clip rounded-lg p-4 border bg-card">
							<div className="h-[350px] w-full overflow-hidden rounded-2xl">
								<Image src="/assets/images/heroes/pexels-christian-heitz-285904-842711.jpg" alt="article image" width={800} height={600} className="h-full w-full object-cover" />
							</div>
							<div className="text-muted-foreground flex justify-between">
								<div className="text-foreground">Announcement</div>
								<div className="text-muted-foreground">2025</div>
							</div>
							<h4 className="mt-1 font-semibold text-xl text-neutral-900 dark:text-white">LocalHub update {i}</h4>
						</a>
					))}
				</div>
			</section>

			{/* FAQ (with JSON-LD) */}
			<section className="py-24 bg-neutral-50 dark:bg-neutral-900">
				<MotionSection className="w-full max-w-[1200px] mx-auto px-6 text-center mb-16">
					<div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950 px-4 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400 mb-6">
						<FileText className="h-4 w-4" />
						Questions & Answers
					</div>
					<h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white">Got questions? We've got answers</h2>
					<p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Everything you need to know about starting your profitable local directory</p>
				</MotionSection>

				<MotionGrid className="w-full max-w-[1200px] mx-auto px-6 grid gap-6 grid-cols-1 md:grid-cols-2">
					{faq.map((item, idx) => (
						<MotionGridItem key={item.q}>
							<div className="group p-8 rounded-2xl border bg-white dark:bg-neutral-950 hover:shadow-lg transition-all duration-300 h-full">
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{String(idx + 1).padStart(2, "0")}</div>
									<div className="flex-1">
										<h3 className="font-bold text-lg mb-3 text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.q}</h3>
										<p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.a}</p>
									</div>
								</div>
							</div>
						</MotionGridItem>
					))}
				</MotionGrid>

				{/* Still have questions CTA */}
				<MotionSection className="text-center mt-16">
					<div className="bg-neutral-900 rounded-3xl p-8 text-white">
						<h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
						<p className="text-blue-100 mb-6">Our LocalHub experts are here to help you succeed</p>
						<MotionButton href="/contact" className="inline-flex items-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-all duration-300">
							Get personalized help
							<ArrowRight className="h-5 w-5" />
						</MotionButton>
					</div>
				</MotionSection>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: faq.map((f) => ({
								"@type": "Question",
								name: f.q,
								acceptedAnswer: { "@type": "Answer", text: f.a },
							})),
						}),
					}}
				/>
			</section>

			{/* Newsletter CTA */}
			<section className="w-full mt-16 px-4 sm:px-8">
				<div className="w-full max-w-[1400px] mx-auto rounded-lg bg-[#F6F7FB] dark:bg-[#171717] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex flex-col gap-1 md:text-left text-center">
						<h2 className="text-2xl text-foreground">Join our newsletter</h2>
						<div className="text-muted-foreground">Get product insights and updates.</div>
					</div>
					<form className="flex h-[56px] items-center gap-2 p-2" action="/api/newsletter" method="post">
						<input type="email" name="email" required className="h-full w-full border px-3 rounded-md bg-white dark:bg-black" placeholder="email" />
						<button className="inline-flex items-center rounded-full border px-4 py-2 bg-transparent text-foreground border-border">Signup</button>
					</form>
				</div>
			</section>

			{/* Final CTA */}
			<section className="w-full mt-20 px-4 sm:px-8 mb-20">
				<MotionSection className="w-full max-w-[1400px] mx-auto">
					<div className="relative overflow-hidden rounded-3xl bg-neutral-900 p-12 text-center text-white">
						{/* Background Pattern */}
						<div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-10" />

						{/* Content */}
						<div className="relative z-10 max-w-4xl mx-auto">
							<div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium mb-6">
								<Zap className="h-4 w-4" />
								Ready to Get Started?
							</div>
							<h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
								Launch your directory
								<br />
								in minutes, not months
							</h2>
							<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">Join hundreds of successful directory owners earning thousands monthly. Start free, scale fast, and keep 100% of your revenue.</p>

							{/* CTA Buttons */}
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
								<MotionButton href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-8 py-4 font-bold text-lg hover:bg-neutral-100 transition-all duration-300 shadow-lg hover:shadow-xl">
									Start free trial
									<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</MotionButton>
								<MotionButton href="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 font-semibold text-lg hover:bg-white/20 transition-all duration-300">
									Book a demo
								</MotionButton>
							</div>

							{/* Trust Indicators */}
							<div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100 text-sm">
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-300" />
									No credit card required
								</div>
								<div className="hidden sm:block w-px h-4 bg-white/30" />
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-300" />
									Setup in under 10 minutes
								</div>
								<div className="hidden sm:block w-px h-4 bg-white/30" />
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-300" />
									Cancel anytime
								</div>
							</div>
						</div>
					</div>
				</MotionSection>
			</section>


		</main>
	);
}
