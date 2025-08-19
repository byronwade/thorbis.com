"use client";

import React, { useState } from "react";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { TrendingUp, CheckCircle, ArrowRight, Target, Sparkles, Phone, Globe, Search, Star, Shield, MessageCircle, BarChart3, Megaphone, CreditCard, Crown } from "lucide-react";

export default function ExploreBusinessContent() {
	const [selectedSolution, setSelectedSolution] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const businessSolutions = [
		{
			id: 1,
			title: "Premium Business Listing",
			subtitle: "Get Found by More Customers",
			description: "Stand out with enhanced visibility, priority placement in search results, and comprehensive business profiles that convert browsers into customers.",
			icon: Search,
			color: "bg-primary",
			features: ["Priority search placement", "Enhanced business profile", "Photo galleries & portfolios", "Customer review management", "Real-time business updates", "Analytics & insights dashboard"],
			pricing: "Starting at $49/month",
			popular: false,
		},
		{
			id: 2,
			title: "Thorbis Certified Program",
			subtitle: "Join the Elite 0.0008%",
			description: "Achieve the most prestigious business certification available. More exclusive than Harvard admission, this elite status transforms your credibility and customer trust.",
			icon: Crown,
			color: "bg-gradient-to-r from-amber-500 to-orange-500",
			features: ["Elite certification badge", "Comprehensive vetting process", "Performance guarantee protection", "Premium marketing materials", "Priority customer support", "Exclusive networking opportunities"],
			pricing: "By invitation only",
			popular: true,
		},
		{
			id: 3,
			title: "Customer Review Management",
			subtitle: "Build Trust & Reputation",
			description: "Actively manage your online reputation with automated review requests, response management, and reputation monitoring across all platforms.",
			icon: Star,
			color: "bg-warning",
			features: ["Automated review invitations", "Multi-platform monitoring", "Professional response templates", "Reputation score tracking", "Competitor analysis", "Review recovery campaigns"],
			pricing: "Starting at $29/month",
			popular: false,
		},
		{
			id: 4,
			title: "Lead Generation System",
			subtitle: "Convert Visitors to Customers",
			description: "Advanced lead capture and nurturing system that turns website visitors into paying customers through intelligent automation and follow-up sequences.",
			icon: Target,
			color: "bg-success",
			features: ["Smart lead capture forms", "Automated follow-up sequences", "Lead scoring & qualification", "CRM integration", "Conversion tracking", "Performance analytics"],
			pricing: "Starting at $79/month",
			popular: false,
		},
		{
			id: 5,
			title: "Digital Marketing Suite",
			subtitle: "Grow Your Online Presence",
			description: "Complete digital marketing solution including social media management, local SEO optimization, and targeted advertising campaigns.",
			icon: Megaphone,
			color: "bg-purple-500",
			features: ["Social media management", "Local SEO optimization", "Google Ads management", "Content creation & scheduling", "Performance reporting", "Competitor monitoring"],
			pricing: "Starting at $199/month",
			popular: false,
		},
		{
			id: 6,
			title: "Business Analytics Dashboard",
			subtitle: "Data-Driven Decision Making",
			description: "Comprehensive analytics platform that provides insights into customer behavior, business performance, and growth opportunities.",
			icon: BarChart3,
			color: "bg-indigo-500",
			features: ["Real-time performance metrics", "Customer behavior analysis", "Revenue tracking & forecasting", "Market trend analysis", "Custom reporting", "Actionable insights & recommendations"],
			pricing: "Starting at $39/month",
			popular: false,
		},
		{
			id: 7,
			title: "Customer Communication Hub",
			subtitle: "Streamline Customer Interactions",
			description: "Unified communication platform that manages all customer interactions across phone, email, chat, and social media from one dashboard.",
			icon: MessageCircle,
			color: "bg-teal-500",
			features: ["Unified inbox for all channels", "Automated response templates", "Appointment scheduling", "Customer history tracking", "Team collaboration tools", "Performance metrics"],
			pricing: "Starting at $59/month",
			popular: false,
		},
		{
			id: 8,
			title: "Professional Website Builder",
			subtitle: "Create Your Digital Presence",
			description: "Build a professional, mobile-optimized website that converts visitors into customers with our industry-specific templates and tools.",
			icon: Globe,
			color: "bg-cyan-500",
			features: ["Industry-specific templates", "Mobile-responsive design", "SEO optimization built-in", "Online booking integration", "E-commerce capabilities", "24/7 hosting & support"],
			pricing: "Starting at $89/month",
			popular: false,
		},
		{
			id: 9,
			title: "Payment Processing Solutions",
			subtitle: "Get Paid Faster & Easier",
			description: "Integrated payment processing with invoicing, recurring billing, and multiple payment options to streamline your revenue collection.",
			icon: CreditCard,
			color: "bg-emerald-500",
			features: ["Multiple payment methods", "Automated invoicing", "Recurring billing setup", "Payment tracking & reporting", "Secure transaction processing", "Mobile payment options"],
			pricing: "2.9% + $0.30 per transaction",
			popular: false,
		},
		{
			id: 10,
			title: "24/7 Business Support",
			subtitle: "Expert Help When You Need It",
			description: "Round-the-clock support from business experts who understand your industry and can help you maximize your growth potential.",
			icon: Shield,
			color: "bg-destructive",
			features: ["24/7 phone & chat support", "Dedicated account manager", "Business growth consulting", "Technical troubleshooting", "Training & onboarding", "Priority issue resolution"],
			pricing: "Included with Premium plans",
			popular: false,
		},
	];

	const stats = [
		{ label: "Business Growth", value: "312%", description: "Average revenue increase" },
		{ label: "Customer Acquisition", value: "4.8x", description: "More leads generated" },
		{ label: "Online Visibility", value: "250%", description: "Improved search rankings" },
		{ label: "Customer Satisfaction", value: "96%", description: "Client satisfaction rate" },
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="text-center">
					<div className="inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-primary/10 text-primary border border-primary/20">
						<TrendingUp className="w-4 h-4" />
						<span className="text-sm font-medium">🚀 Business Solutions</span>
					</div>

					<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						Grow Your Business with <span className="text-primary">Thorbis</span>
					</h1>

					<p className="max-w-3xl mx-auto mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">Comprehensive business solutions designed to help you attract more customers, increase revenue, and build a stronger online presence. Join thousands of successful businesses already growing with Thorbis.</p>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button size="lg" className="h-12 px-8 text-white shadow-lg bg-primary hover:bg-primary/90">
							<Sparkles className="w-5 h-5 mr-2" />
							Get Started Today
						</Button>
						<Button variant="outline" size="lg" className="h-12 px-8 border-border hover:bg-muted">
							<Phone className="w-5 h-5 mr-2" />
							Schedule Consultation
						</Button>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
					{stats.map((stat, index) => (
						<div key={index} className="text-center">
							<div className="text-3xl font-bold text-primary lg:text-4xl">{stat.value}</div>
							<div className="mt-1 text-sm font-medium text-foreground">{stat.label}</div>
							<div className="mt-1 text-xs text-muted-foreground">{stat.description}</div>
						</div>
					))}
				</div>
			</section>

			{/* Business Solutions Grid */}
			<section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">Complete Business Growth Solutions</h2>
					<p className="max-w-3xl mx-auto text-lg text-muted-foreground">Everything you need to take your business to the next level. Each solution is designed to work together for maximum impact.</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{businessSolutions.map((solution) => {
						const Icon = solution.icon;
						const isSelected = selectedSolution === solution.id;

						return (
							<Card key={solution.id} className={`p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 ${isSelected ? "ring-2 ring-primary shadow-xl scale-105" : ""} ${solution.popular ? "border-primary/50 bg-primary/5" : ""}`} onClick={() => setSelectedSolution(isSelected ? null : solution.id)}>
								{solution.popular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<Badge className="text-white bg-primary">Most Popular</Badge>
									</div>
								)}

								<div className="relative">
									<div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl ${solution.color}`}>
										<Icon className="w-6 h-6 text-white" />
									</div>

									<h3 className="mb-2 text-xl font-bold text-foreground">{solution.title}</h3>
									<p className="mb-3 text-sm font-medium text-primary">{solution.subtitle}</p>
									<p className="mb-4 leading-relaxed text-muted-foreground">{solution.description}</p>

									{isSelected && (
										<div className="mb-4 space-y-2">
											{solution.features.map((feature, index) => (
												<div key={index} className="flex items-center space-x-2">
													<CheckCircle className="flex-shrink-0 w-4 h-4 text-success" />
													<span className="text-sm text-foreground">{feature}</span>
												</div>
											))}
										</div>
									)}

									<div className="flex items-center justify-between pt-4 border-t border-border">
										<div>
											<p className="text-sm font-medium text-foreground">{solution.pricing}</p>
										</div>
										<Button size="sm" className="bg-primary hover:bg-primary/90">
											{isSelected ? "Get Started" : "Learn More"}
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Success Stories */}
			<section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-muted/30">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold text-foreground">Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how businesses like yours are thriving with Thorbis</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					{[
						{
							business: "Wade's Plumbing & Septic",
							industry: "Home Services",
							growth: "312% revenue increase",
							quote: "Thorbis transformed our business. We went from struggling to find customers to being booked solid for months ahead.",
							avatar: "https://i.pravatar.cc/150?img=1",
						},
						{
							business: "Mario's Italian Bistro",
							industry: "Restaurant",
							growth: "4.8x more reservations",
							quote: "The review management and local SEO services helped us become the top-rated Italian restaurant in our area.",
							avatar: "https://i.pravatar.cc/150?img=2",
						},
						{
							business: "Elite Auto Repair",
							industry: "Automotive",
							growth: "250% online visibility",
							quote: "Our phone hasn't stopped ringing since we started with Thorbis. The lead generation system is incredible.",
							avatar: "https://i.pravatar.cc/150?img=3",
						},
					].map((story, index) => (
						<Card key={index} className="p-6 transition-all duration-200 hover:shadow-lg">
							<div className="mb-4">
								<div className="flex items-center space-x-3">
									<img src={story.avatar} alt={story.business} className="w-12 h-12 rounded-full" />
									<div>
										<h4 className="font-semibold text-foreground">{story.business}</h4>
										<p className="text-sm text-muted-foreground">{story.industry}</p>
									</div>
								</div>
							</div>
							<p className="mb-4 italic text-foreground">&ldquo;{story.quote}&rdquo;</p>
							<div className="pt-4 border-t border-border">
								<Badge className="text-success bg-success/10 border-green-200">{story.growth}</Badge>
							</div>
						</Card>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<Card className="p-8 lg:p-12 bg-primary text-primary-foreground">
					<div className="text-center">
						<TrendingUp className="w-16 h-16 mx-auto mb-6" />
						<h2 className="mb-4 text-3xl font-bold">Ready to Grow Your Business?</h2>
						<p className="max-w-3xl mx-auto mb-8 text-lg opacity-90">Join thousands of successful businesses that have transformed their growth with Thorbis. Start your journey to increased revenue, more customers, and stronger online presence today.</p>

						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
								<Sparkles className="w-5 h-5 mr-3" />
								Start Free Trial
							</Button>
							<Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
								<Phone className="w-5 h-5 mr-3" />
								Talk to an Expert
							</Button>
						</div>

						<p className="mt-6 text-sm opacity-75">No long-term contracts • Cancel anytime • 30-day money-back guarantee</p>
					</div>
				</Card>
			</section>
		</div>
	);
}
