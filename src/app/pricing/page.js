import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Pricing - All Features Included, Usage-Based Billing | Thorbis",
		description: "Transparent usage-based pricing. All features included with $50/month base fee. Pay only for API usage that scales with your business. No feature gates.",
		path: "/pricing",
		keywords: ["pricing", "usage-based pricing", "api pricing", "business software pricing", "transparent pricing", "no hidden fees"],
	});
}

import PricingCalculator from "@components/site/pricing/pricing-calculator";
import { 
	CheckCircle, Star, Zap, Shield, Globe, Users, 
	Bot, Mic, BarChart3, MessageSquare, Link, 
	CreditCard, Settings, TrendingUp, Calculator, DollarSign
} from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Thorbis Business Platform",
		description: "Complete business management platform with usage-based pricing. All features included.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: {
			"@type": "Offer",
			price: "50",
			priceCurrency: "USD",
			description: "$50/month base fee with usage-based API pricing"
		},
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: "1247"
		}
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Pricing", item: "https://thorbis.com/pricing" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function PricingPage() {
	const pricingTiers = [
		{
			name: "Professional",
			price: "$50",
			period: "per month",
			description: "All features included with generous usage allowances.",
			features: [
				"All Platform Features",
				"Unlimited Users",
				"Business Management",
				"Fleet Tracking", 
				"POS System",
				"CRM & Analytics",
				"LocalHub Directory",
				"Mobile Apps",
				"25,000 API Calls/Month",
				"Premium Support"
			],
			cta: "Start Professional",
			popular: false,
			color: "gray"
		},
		{
			name: "Pay As You Grow",
			price: "$15",
			period: "per 1,000 API calls",
			description: "Usage-based pricing that scales with your business. AI features billed separately.",
			features: [
				"Everything in Free",
				"Unlimited API Calls",
				"AI Features Available",
				"$2.50 per 1K input tokens",
				"$5.00 per 1K output tokens", 
				"Premium Support",
				"Advanced Analytics",
				"API Priority Processing",
				"White-label Options",
				"Custom Integrations",
				"SLA Guarantees",
				"Volume Discounts Available"
			],
			cta: "Calculate Your Cost",
			popular: true,
			color: "blue"
		},
		{
			name: "LocalHub Partner",
			price: "75%",
			period: "revenue share",
			description: "Own a local business directory and earn recurring revenue.",
			features: [
				"Own Your Local Market",
				"25% Platform Revenue Share",
				"Local Business Onboarding",
				"Marketing Support",
				"Branded Directory",
				"Commission Tracking",
				"Partner Dashboard",
				"Growth Analytics",
				"Training & Resources",
				"Ongoing Support"
			],
			cta: "Become a Partner",
			popular: false,
			color: "green"
		}
	];

	const allFeatures = [
		{
			category: "Business Management",
			icon: Users,
			features: [
				"Customer Relationship Management (CRM)",
				"Invoice & Estimate Management", 
				"Project & Job Tracking",
				"Employee Management",
				"Business Analytics & Reporting",
				"Document Management",
				"Time Tracking",
				"Expense Tracking"
			]
		},
		{
			category: "Fleet & Field Operations",
			icon: Globe,
			features: [
				"GPS Vehicle Tracking",
				"Route Optimization",
				"Field Service Management",
				"Work Order Management",
				"Equipment Tracking",
				"Maintenance Scheduling",
				"Driver Behavior Analytics",
				"Fuel Management"
			]
		},
		{
			category: "Point of Sale & Payments",
			icon: Zap,
			features: [
				"Complete POS System",
				"Payment Processing",
				"Inventory Management",
				"Multi-location Support",
				"Receipt Management",
				"Tax Management",
				"Loyalty Programs",
				"Gift Card Management"
			]
		},
		{
			category: "Marketing & Directory",
			icon: Star,
			features: [
				"LocalHub Business Directory",
				"SEO Optimization",
				"Review Management",
				"Social Media Integration",
				"Email Marketing",
				"SMS Marketing",
				"Lead Generation",
				"Customer Feedback"
			]
		},
		{
			category: "AI & Automation",
			icon: Zap,
			features: [
				"AI Chat Assistant",
				"Voice Commands & Dictation",
				"Smart Analytics & Insights",
				"Automated Report Generation",
				"Predictive Business Analytics",
				"AI-Powered Customer Support",
				"Natural Language Queries",
				"Intelligent Task Automation"
			]
		},
		{
			category: "Enterprise & Security",
			icon: Shield,
			features: [
				"Enterprise-grade Security",
				"HIPAA Compliance",
				"Role-based Access Control",
				"Audit Trails",
				"Data Backup & Recovery",
				"API Access",
				"White-label Solutions",
				"24/7 Monitoring"
			]
		}
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Hero Section */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
				<div className="max-w-5xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-primary text-sm font-medium mb-8 shadow-sm">
						<Zap className="w-4 h-4" />
						<span>Usage-Based Pricing</span>
					</div>
					
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
						All Features Included.
						<span className="block text-primary mt-2">Pay for What You Use.</span>
					</h1>
					
					<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
						Every feature included from day one. No feature gates, no user limits. 
						$50/month base fee plus usage-based pricing that scales with your business growth.
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
						<div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border border-border shadow-sm">
							<CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
							<span className="font-medium text-foreground">No credit card required</span>
						</div>
						<div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border border-border shadow-sm">
							<Zap className="w-6 h-6 text-primary flex-shrink-0" />
							<span className="font-medium text-foreground">Setup in minutes</span>
						</div>
						<div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border border-border shadow-sm">
							<Shield className="w-6 h-6 text-primary flex-shrink-0" />
							<span className="font-medium text-foreground">Cancel anytime</span>
						</div>
					</div>
					
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a 
							href="/signup" 
							className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
						>
							<Zap className="w-5 h-5" />
							Start Your Trial
						</a>
						<a 
							href="#calculator" 
							className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-lg font-semibold text-foreground hover:bg-accent transition-colors"
						>
							<BarChart3 className="w-5 h-5" />
							Calculate Costs
						</a>
					</div>
				</div>
			</section>

			{/* Pricing Tiers */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-neutral-800">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Simple, Transparent Pricing</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose the plan that works for your business. Upgrade or downgrade anytime with complete transparency.
						</p>
					</div>
					
					<div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{pricingTiers.map((tier, index) => (
							<div 
								key={index} 
								className={`relative rounded-lg border p-8 bg-card transition-all duration-200 hover:shadow-lg ${
									tier.popular 
										? 'border-primary shadow-lg ring-1 ring-primary' 
										: 'border-border hover:border-primary/30'
								}`}
							>
								{tier.popular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
										<Star className="w-3 h-3" />
										Most Popular
									</div>
								)}
								
								<div className="text-center mb-8">
									<h3 className="text-xl font-bold mb-4 text-foreground">{tier.name}</h3>
									<div className="flex items-baseline justify-center gap-1 mb-4">
										<span className="text-3xl font-bold text-foreground">{tier.price}</span>
										<span className="text-muted-foreground">/{tier.period}</span>
									</div>
									<p className="text-muted-foreground text-sm">{tier.description}</p>
								</div>

								<ul className="space-y-3 mb-8">
									{tier.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-start gap-3">
											<CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<span className="text-muted-foreground text-sm">{feature}</span>
										</li>
									))}
								</ul>

								<a 
									href={tier.name === "LocalHub Partner" ? "/contact" : "/signup"}
									className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors ${
										tier.popular
											? 'bg-blue-600 text-white hover:bg-blue-700'
											: 'border border-border text-foreground hover:bg-accent'
									}`}
								>
									{tier.popular && <Zap className="w-4 h-4" />}
									{tier.name === "LocalHub Partner" && <Users className="w-4 h-4" />}
									{tier.name === "Professional" && <CheckCircle className="w-4 h-4" />}
									{tier.cta}
								</a>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* AI Features & Pricing */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-primary text-sm font-medium mb-6 shadow-sm">
							<Bot className="w-4 h-4" />
							<span>AI-Powered Features</span>
						</div>
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">AI-Powered Business Intelligence</h2>
						<p className="text-xl text-muted-foreground max-w-4xl mx-auto">
							Leverage advanced AI features to automate tasks, generate insights, and streamline operations. 
							Pay only for what you use with transparent token-based pricing.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
						<div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-200">
							<div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
								<Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-lg font-bold mb-3 text-foreground">AI Chat Assistant</h3>
							<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
								Get instant answers about your business data, generate reports, and automate routine tasks through natural conversation.
							</p>
							<div className="bg-muted rounded-lg p-3 border border-border">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-muted-foreground">Input tokens:</span>
									<span className="text-sm font-bold text-foreground">$2.50 per 1,000</span>
								</div>
							</div>
						</div>

						<div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-200">
							<div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
								<Mic className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-lg font-bold mb-3 text-foreground">Voice AI</h3>
							<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
								Hands-free business management with voice commands, dictation, and AI-powered call summaries for field teams.
							</p>
							<div className="bg-muted rounded-lg p-3 border border-border">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-muted-foreground">Output tokens:</span>
									<span className="text-sm font-bold text-foreground">$5.00 per 1,000</span>
								</div>
							</div>
						</div>

						<div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-200 md:col-span-2 lg:col-span-1">
							<div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
								<BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg font-bold mb-3 text-foreground">Smart Analytics</h3>
							<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
								AI-generated insights, predictive analytics, and automated reporting that helps you make data-driven decisions.
							</p>
							<div className="bg-muted rounded-lg p-3 border border-border">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-muted-foreground">Typical cost:</span>
									<span className="text-sm font-bold text-foreground">$237-425/month</span>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-card rounded-lg p-8 border border-border shadow-sm">
						<div className="text-center mb-8">
							<h3 className="text-2xl font-bold mb-4 text-foreground">AI Usage Example</h3>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								Here's what a typical business might spend on AI features per month
							</p>
						</div>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
									<MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">25,000</div>
								<div className="font-medium mb-2 text-foreground">Input tokens/month</div>
								<div className="text-sm text-muted-foreground">≈ 18,750 words sent to AI</div>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
									<Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">25,000</div>
								<div className="font-medium mb-2 text-foreground">Output tokens/month</div>
								<div className="text-sm text-muted-foreground">≈ 18,750 words from AI</div>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-green-200 dark:border-green-800">
									<CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
								</div>
								<div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">$237.50</div>
								<div className="font-medium mb-2 text-foreground">Total monthly cost</div>
								<div className="text-sm text-muted-foreground">$50 base + $187.50 AI usage</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Calculator */}
			<section id="calculator" className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-neutral-800">
				<div className="max-w-5xl mx-auto text-center mb-16">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-primary text-sm font-medium mb-6 shadow-sm">
						<Calculator className="w-4 h-4" />
						<span>Interactive Calculator</span>
					</div>
					<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Cost Calculator</h2>
					<p className="text-xl text-muted-foreground max-w-4xl mx-auto">
						Enter your expected monthly usage to see estimated costs. These are examples — not final prices.
						We'll publish clear pricing and free amounts before launch.
					</p>
				</div>
				<PricingCalculator />
			</section>

			{/* All Features Included */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-primary text-sm font-medium mb-6 shadow-sm">
							<CheckCircle className="w-4 h-4" />
							<span>Complete Platform</span>
						</div>
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Every Feature Included</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							No feature gates. No add-ons. Every plan includes access to our complete platform with all business management tools.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{allFeatures.map((category, index) => (
							<div key={index} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
										<category.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									</div>
									<h3 className="font-bold text-lg text-foreground">{category.category}</h3>
								</div>
								<ul className="space-y-2">
									{category.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-start gap-2">
											<CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
											<span className="text-muted-foreground text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-neutral-800">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-primary text-sm font-medium mb-6 shadow-sm">
							<Settings className="w-4 h-4" />
							<span>Questions & Answers</span>
						</div>
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
						<p className="text-xl text-muted-foreground">
							Everything you need to know about our pricing and features
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<DollarSign className="w-3 h-3 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="text-lg font-bold text-foreground">Why is there a $50 monthly base fee?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								The base fee covers essential infrastructure, security, support, and platform maintenance costs. It ensures we can provide 
								enterprise-grade features to all customers regardless of usage level, while keeping per-use costs fair and transparent.
							</p>
						</div>
						
						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<TrendingUp className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">Why usage-based pricing instead of per-user pricing?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Traditional per-user pricing doesn't align with actual value or costs. A business with 100 employees doing light work 
								shouldn't pay more than a business with 10 employees doing heavy API usage. Our model scales with your actual platform usage.
							</p>
						</div>
						
						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<Link className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">What counts as an API request?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Every action in the platform (creating invoices, GPS pings, sending emails) uses API requests. 
								AI interactions are billed separately using token-based pricing. We provide detailed breakdowns so you know exactly what you're using.
							</p>
						</div>

						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<Bot className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">How much do AI features cost?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								AI features use token-based pricing: $2.50 per 1,000 input tokens and $5.00 per 1,000 output tokens. 
								A typical business using AI chat, voice commands, and smart analytics averages $237-425 per month total (including the $50 base fee). 
								Tokens are small pieces of words - about 750 words equals 1,000 tokens.
							</p>
						</div>

						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<Settings className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">Can I switch between plans?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								There are no "plans" to switch between. You always have access to all features. You only pay when you exceed 
								the free API allocation. You can monitor usage in real-time and set spending limits.
							</p>
						</div>

						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<Shield className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">What happens if I go over my free allocation?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								You'll be charged for additional API usage at the published rate. We'll notify you before you hit limits and 
								provide usage controls to prevent surprise bills. You can set spending caps and auto-alerts.
							</p>
						</div>

						<div className="bg-muted/30 rounded-lg p-6 border border-border">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
									<Users className="w-3 h-3 text-primary" />
								</div>
								<h3 className="text-lg font-bold text-foreground">How does LocalHub revenue sharing work?</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								LocalHub partners own and operate local business directories. When businesses sign up through their directory, 
								the partner keeps 75% of subscription revenue and Thorbis keeps 25%. It's a win-win for local market development.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
				<div className="max-w-5xl mx-auto">
					<div className="bg-card rounded-lg p-8 border border-border text-center shadow-sm">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-primary text-sm font-medium mb-6">
							<Zap className="w-4 h-4" />
							<span>Ready to Start</span>
						</div>
						
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Ready to Get Started?</h2>
						<p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
							Join thousands of businesses using Thorbis to streamline operations and grow revenue. 
							Start your trial and scale as you grow.
						</p>
						
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
							<a 
								href="/signup" 
								className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
							>
								<Zap className="w-5 h-5" />
								Start Your Trial
							</a>
							<a 
								href="/contact" 
								className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 text-lg font-semibold text-foreground hover:bg-accent transition-colors"
							>
								<MessageSquare className="w-5 h-5" />
								Contact Sales
							</a>
						</div>
						
						<div className="flex items-center justify-center gap-6 pt-6 border-t border-border">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<CheckCircle className="w-4 h-4 text-primary" />
								<span>No setup fees</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Shield className="w-4 h-4 text-primary" />
								<span>Enterprise security</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Users className="w-4 h-4 text-primary" />
								<span>24/7 support</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
