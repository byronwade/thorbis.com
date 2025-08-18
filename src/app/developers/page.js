'use client';

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Switch } from "@components/ui/switch";
import { Terminal, Book, Code2, Database, MapPin, Zap, Shield, Clock, Users, Download, ExternalLink, CheckCircle, ArrowRight, GitBranch, Smartphone, Globe, Star, Bookmark, MessageSquare, Rocket, TrendingUp, Award, Cpu, Network, Activity, DollarSign, Infinity, Target, Webhook, Play, Copy, Sparkles, Key } from "lucide-react";
import Link from "next/link";
import { readFlagFromDOM } from "@lib/flags/client";

// Note: Metadata handling moved to layout.js since this is now a Client Component

export default function DevelopersPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Thorbis Developer Platform",
		description: "API platform for accessing local business data, geolocation services, and real-time information",
		url: "https://thorbis.com/developers",
		applicationCategory: "DeveloperApplication",
		operatingSystem: "Any",
		provider: {
			"@type": "Organization",
			name: "Thorbis",
			logo: "https://thorbis.com/logos/ThorbisLogo.webp",
			url: "https://thorbis.com",
		},
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "API Services",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Business Search API",
						description: "Access comprehensive database of local businesses with reviews and ratings",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Geolocation API",
						description: "Find businesses by location and search within specific radius",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "Real-Time Data API",
						description: "Get up-to-date business information with reliable API",
					},
				},
			],
		},
		audience: {
			"@type": "Audience",
			audienceType: "Developers",
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
							{ "@type": "ListItem", position: 2, name: "Developers", item: "https://thorbis.com/developers" },
						],
					}),
				}}
			/>
			<div className="bg-background text-foreground">
				{/* Enhanced Hero Section */}
				<div className="relative overflow-hidden bg-muted">
					<div className="absolute inset-0 bg-grid-small-black/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
					<div className="relative px-4 py-32 mx-auto max-w-7xl text-center lg:px-8">
						<div className="mx-auto max-w-4xl">
							<Badge variant="secondary" className="mb-6 px-4 py-2">
								<Sparkles className="mr-2 w-4 h-4" />
								Next-Gen Developer Platform 🚀
							</Badge>
							<h1 className="text-5xl font-extrabold tracking-tight md:text-7xl text-foreground">Power Your Apps with Enterprise-Grade APIs</h1>
							<p className="mx-auto mt-6 max-w-3xl text-xl text-muted-foreground leading-8">
								Access <span className="text-primary font-semibold">5M+ verified businesses</span>, lightning-fast geolocation, and real-time data streams. 
								Built for scale, designed for developers who demand excellence.
							</p>
							<div className="flex flex-col gap-4 justify-center items-center mt-10 sm:flex-row sm:gap-6">
								<Button asChild size="lg" className="px-8 py-3 text-lg">
									<Link href="/developers/api-keys">
										Get Started Free
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg">
									<Link href="/developers/docs">
										View Documentation
										<Book className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</div>
							<div className="flex flex-wrap gap-6 justify-center items-center mt-10 text-sm text-muted-foreground">
								<div className="flex items-center">
									<Rocket className="mr-2 w-4 h-4 text-primary" />
									<span className="font-medium">Free tier: 10K calls/month</span>
								</div>
								<div className="flex items-center">
									<Shield className="mr-2 w-4 h-4 text-primary" />
									<span className="font-medium">99.99% uptime SLA</span>
								</div>
								<div className="flex items-center">
									<Zap className="mr-2 w-4 h-4 text-muted-foreground" />
									<span className="font-medium">Sub-50ms response times</span>
								</div>
								<div className="flex items-center">
									<Award className="mr-2 w-4 h-4 text-purple-500" />
									<span className="font-medium">SOC 2 Type II Certified</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Enhanced Stats Section */}
				<div className="px-4 py-16 bg-background lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
							<div className="p-6 border border-primary/20 rounded-lg bg-primary/5">
								<div className="text-4xl font-bold text-primary mb-2">100M+</div>
								<div className="text-sm text-muted-foreground">API Requests Served</div>
								<div className="text-xs text-primary mt-1 flex items-center justify-center">
									<TrendingUp className="w-3 h-3 mr-1" />
									+245% YoY Growth
								</div>
							</div>
							<div className="p-6 border border-primary/20 rounded-lg bg-primary/10 dark:bg-primary/20">
								<div className="text-4xl font-bold text-primary mb-2">5.2M+</div>
								<div className="text-sm text-muted-foreground">Verified Businesses</div>
								<div className="text-xs text-primary mt-1">Updated Daily</div>
							</div>
							<div className="p-6 border border-primary/20 rounded-lg bg-primary/10 dark:bg-primary/20">
								<div className="text-4xl font-bold text-primary mb-2">99.99%</div>
								<div className="text-sm text-muted-foreground">Uptime SLA</div>
								<div className="text-xs text-primary mt-1">Enterprise Grade</div>
							</div>
							<div className="p-6 border border-muted-foreground/20 rounded-lg bg-muted-foreground/10 dark:bg-muted-foreground/20">
								<div className="text-4xl font-bold text-muted-foreground mb-2">&lt;42ms</div>
								<div className="text-sm text-muted-foreground">Avg Response Time</div>
								<div className="text-xs text-muted-foreground mt-1">Global CDN</div>
							</div>
						</div>
					</div>
				</div>

				{/* Pricing Section */}
				<div className="px-4 py-24 bg-muted lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								<DollarSign className="mr-2 w-4 h-4" />
								Transparent Pricing
							</Badge>
							<h2 className="text-4xl font-bold tracking-tight">Simple, Predictable API Pricing</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
								Scale from free to enterprise. Pay only for what you use with generous free tiers and volume discounts.
							</p>
						</div>
						
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
							{/* Free Tier */}
							<Card className="border-2 hover:border-primary/50 transition-all">
								<CardHeader className="text-center">
									<div className="mx-auto p-3 bg-primary/20 rounded-full dark:bg-primary/20 w-fit mb-4">
										<Rocket className="w-8 h-8 text-primary dark:text-primary" />
									</div>
									<CardTitle className="text-2xl">Free Tier</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">$0</span>
										<span className="text-muted-foreground">/month</span>
									</div>
									<CardDescription className="mt-2">Perfect for prototyping and small projects</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-center mb-6">
										<div className="text-lg font-semibold text-primary">10,000 API calls/month</div>
										<div className="text-sm text-muted-foreground">Then $0.002 per additional call</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-primary flex-shrink-0" />
											<span>All core API endpoints</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-primary flex-shrink-0" />
											<span>Standard rate limits (100 req/min)</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-primary flex-shrink-0" />
											<span>Community support</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-primary flex-shrink-0" />
											<span>Basic analytics dashboard</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-primary flex-shrink-0" />
											<span>99.9% uptime SLA</span>
										</div>
									</div>
									<Button className="w-full mt-6" asChild>
										<Link href="/developers/api-keys">
											Start Free
											<ArrowRight className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							{/* Pro Tier */}
							<Card className="border-2 border-primary relative">
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<Badge className="px-4 py-1">
										<Star className="mr-1 w-3 h-3" />
										Most Popular
									</Badge>
								</div>
								<CardHeader className="text-center">
									<div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
										<Target className="w-8 h-8 text-primary" />
									</div>
									<CardTitle className="text-2xl">Pro</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">$49</span>
										<span className="text-muted-foreground">/month</span>
									</div>
									<CardDescription className="mt-2">For growing applications and startups</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-center mb-6">
										<div className="text-lg font-semibold text-primary">100,000 API calls/month</div>
										<div className="text-sm text-muted-foreground">Then $0.0015 per additional call</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Everything in Free</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Higher rate limits (1,000 req/min)</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Webhook support</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Advanced analytics & monitoring</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Email support (24hr response)</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>99.95% uptime SLA</span>
										</div>
									</div>
									<Button className="w-full mt-6" asChild>
										<Link href="/developers/api-keys?tier=pro">
											Start Pro Trial
											<ArrowRight className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							{/* Enterprise Tier */}
							<Card className="border-2 hover:border-primary/50 transition-all">
								<CardHeader className="text-center">
									<div className="mx-auto p-3 bg-purple-100 rounded-full dark:bg-purple-900/20 w-fit mb-4">
										<Infinity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
									</div>
									<CardTitle className="text-2xl">Enterprise</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">Custom</span>
									</div>
									<CardDescription className="mt-2">For high-volume applications and enterprises</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-center mb-6">
										<div className="text-lg font-semibold text-primary">Unlimited API calls</div>
										<div className="text-sm text-muted-foreground">Volume-based pricing available</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Everything in Pro</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Unlimited rate limits</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Dedicated support manager</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Custom integrations & features</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>Priority support (1hr response)</span>
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-3 w-4 h-4 text-green-500 flex-shrink-0" />
											<span>99.99% uptime SLA</span>
										</div>
									</div>
									<Button variant="outline" className="w-full mt-6" asChild>
										<Link href="/contact?subject=enterprise">
											Contact Sales
											<ArrowRight className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Pricing Details */}
						<div className="mt-16 p-8 bg-background border rounded-lg">
							<h3 className="text-xl font-semibold text-center mb-8">API Pricing Breakdown</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								<div className="text-center">
									<div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20 w-fit mx-auto mb-4">
										<Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
									<h4 className="font-semibold mb-2">Business Search API</h4>
									<p className="text-sm text-muted-foreground mb-3">Search through 5M+ verified businesses</p>
									<div className="text-lg font-semibold text-primary">$0.002 per call</div>
									<div className="text-xs text-muted-foreground">After free tier</div>
								</div>
								<div className="text-center">
									<div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20 w-fit mx-auto mb-4">
										<MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
									</div>
									<h4 className="font-semibold mb-2">Geolocation API</h4>
									<p className="text-sm text-muted-foreground mb-3">GPS-accurate location services</p>
									<div className="text-lg font-semibold text-primary">$0.001 per call</div>
									<div className="text-xs text-muted-foreground">After free tier</div>
								</div>
								<div className="text-center">
									<div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/20 w-fit mx-auto mb-4">
										<Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
									</div>
									<h4 className="font-semibold mb-2">Real-Time Data API</h4>
									<p className="text-sm text-muted-foreground mb-3">Live business information & WebSocket streams</p>
									<div className="text-lg font-semibold text-primary">$0.003 per call</div>
									<div className="text-xs text-muted-foreground">After free tier</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Interactive API Playground */}
				<div className="px-4 py-24 bg-background lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								<Play className="mr-2 w-4 h-4" />
								Live Demo
							</Badge>
							<h2 className="text-4xl font-bold tracking-tight">Try Our APIs Right Now</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
								Experience the power of our APIs with live examples. No signup required for these demos.
							</p>
						</div>

						<Tabs defaultValue="business-search" className="mx-auto max-w-5xl">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="business-search">Business Search</TabsTrigger>
								<TabsTrigger value="geolocation">Geolocation</TabsTrigger>
								<TabsTrigger value="webhooks">Webhooks</TabsTrigger>
							</TabsList>
							
							<TabsContent value="business-search" className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Database className="mr-2 w-5 h-5" />
											Business Search API Demo
										</CardTitle>
										<CardDescription>
											Search through millions of businesses with our powerful API
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Request</label>
													<div className="mt-2 p-4 bg-muted rounded-lg relative">
														<Button 
															size="sm" 
															variant="ghost" 
															className="absolute top-2 right-2"
															onClick={() => navigator.clipboard.writeText(`curl -X GET "https://api.thorbis.com/v1/businesses/search?query=pizza&location=Seattle&radius=5km&limit=5" -H "Authorization: Bearer YOUR_API_KEY"`)}
														>
															<Copy className="w-4 h-4" />
														</Button>
														<pre className="text-xs overflow-x-auto">
{`curl -X GET "https://api.thorbis.com/v1/businesses/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -G -d "query=pizza" \\
  -d "location=Seattle, WA" \\
  -d "radius=5km" \\
  -d "limit=5"`}
														</pre>
													</div>
												</div>
											</div>
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Response</label>
													<div className="mt-2 p-4 bg-muted rounded-lg max-h-80 overflow-y-auto">
														<pre className="text-xs">
{`{
  "businesses": [
    {
      "id": "biz_abc123",
      "name": "Mario's Pizza Palace",
      "address": "1234 Pine St, Seattle, WA 98101",
      "phone": "(206) 555-0123",
      "rating": 4.5,
      "review_count": 127,
      "categories": ["Pizza", "Italian"],
      "coordinates": {
        "latitude": 47.6097,
        "longitude": -122.3331
      },
      "price_range": "$$",
      "is_open": true,
      "hours": {
        "monday": "11:00-22:00",
        "tuesday": "11:00-22:00"
      }
    }
  ],
  "total_results": 45,
  "page": 1,
  "per_page": 5,
  "response_time": "42ms"
}`}
														</pre>
													</div>
												</div>
											</div>
										</div>
										<div className="flex gap-4 pt-4">
											<Button variant="outline" size="sm">
												<Play className="mr-2 w-4 h-4" />
												Run Live Demo
											</Button>
											<Button variant="ghost" size="sm" asChild>
												<Link href="/developers/docs/business-search">
													<Book className="mr-2 w-4 h-4" />
													View Documentation
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="geolocation" className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<MapPin className="mr-2 w-5 h-5" />
											Geolocation API Demo
										</CardTitle>
										<CardDescription>
											Find businesses near any location with precise coordinates
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Request</label>
													<div className="mt-2 p-4 bg-muted rounded-lg relative">
														<Button 
															size="sm" 
															variant="ghost" 
															className="absolute top-2 right-2"
															onClick={() => navigator.clipboard.writeText(`curl -X GET "https://api.thorbis.com/v1/businesses/nearby?lat=47.6062&lng=-122.3321&radius=1km&category=restaurant&limit=10" -H "Authorization: Bearer YOUR_API_KEY"`)}
														>
															<Copy className="w-4 h-4" />
														</Button>
														<pre className="text-xs overflow-x-auto">
{`curl -X GET "https://api.thorbis.com/v1/businesses/nearby" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -G -d "lat=47.6062" \\
  -d "lng=-122.3321" \\
  -d "radius=1km" \\
  -d "category=restaurant" \\
  -d "limit=10"`}
														</pre>
													</div>
												</div>
											</div>
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Response</label>
													<div className="mt-2 p-4 bg-muted rounded-lg max-h-80 overflow-y-auto">
														<pre className="text-xs">
{`{
  "businesses": [
    {
      "id": "biz_xyz789",
      "name": "Pike Place Chowder",
      "distance": 0.2,
      "distance_unit": "km",
      "coordinates": {
        "latitude": 47.6085,
        "longitude": -122.3401
      },
      "walking_time": 3,
      "driving_time": 1
    }
  ],
  "center": {
    "latitude": 47.6062,
    "longitude": -122.3321
  },
  "search_radius": "1km",
  "total_results": 8
}`}
														</pre>
													</div>
												</div>
											</div>
										</div>
										<div className="flex gap-4 pt-4">
											<Button variant="outline" size="sm">
												<Play className="mr-2 w-4 h-4" />
												Run Live Demo
											</Button>
											<Button variant="ghost" size="sm" asChild>
												<Link href="/developers/docs/geolocation">
													<Book className="mr-2 w-4 h-4" />
													View Documentation
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="webhooks" className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Webhook className="mr-2 w-5 h-5" />
											Webhooks & Real-time Updates
										</CardTitle>
										<CardDescription>
											Get notified instantly when business data changes
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Webhook Configuration</label>
													<div className="mt-2 p-4 bg-muted rounded-lg relative">
														<Button 
															size="sm" 
															variant="ghost" 
															className="absolute top-2 right-2"
															onClick={() => navigator.clipboard.writeText(`curl -X POST "https://api.thorbis.com/v1/webhooks" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"url": "https://yourapp.com/webhook", "events": ["business.updated", "business.hours_changed"]}'`)}
														>
															<Copy className="w-4 h-4" />
														</Button>
														<pre className="text-xs overflow-x-auto">
{`curl -X POST "https://api.thorbis.com/v1/webhooks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhook",
    "events": [
      "business.updated",
      "business.hours_changed",
      "business.closed_permanently"
    ],
    "secret": "your_webhook_secret"
  }'`}
														</pre>
													</div>
												</div>
											</div>
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">Webhook Payload</label>
													<div className="mt-2 p-4 bg-muted rounded-lg max-h-80 overflow-y-auto">
														<pre className="text-xs">
{`{
  "event": "business.hours_changed",
  "timestamp": "2024-01-15T14:30:00Z",
  "business_id": "biz_abc123",
  "data": {
    "business": {
      "id": "biz_abc123",
      "name": "Coffee Corner",
      "hours": {
        "monday": "07:00-18:00",
        "tuesday": "07:00-18:00",
        "wednesday": "CLOSED"
      }
    },
    "changes": {
      "field": "hours",
      "old_value": {
        "wednesday": "07:00-18:00"
      },
      "new_value": {
        "wednesday": "CLOSED"
      }
    }
  }
}`}
														</pre>
													</div>
												</div>
											</div>
										</div>
										<div className="flex gap-4 pt-4">
											<Button variant="outline" size="sm">
												<Play className="mr-2 w-4 h-4" />
												Test Webhook
											</Button>
											<Button variant="ghost" size="sm" asChild>
												<Link href="/developers/docs/webhooks">
													<Book className="mr-2 w-4 h-4" />
													View Documentation
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* API Features Section */}
				<div className="px-4 py-24 bg-muted lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold tracking-tight">Enterprise-Grade API Features</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
								Built for scale with the features developers love and businesses trust
							</p>
						</div>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
										<div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
											<Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
										</div>
									</div>
									<CardTitle>Business Search API</CardTitle>
									<CardDescription>Search through millions of businesses with advanced filters and real-time results</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											5M+ verified businesses
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Real-time availability
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Advanced filtering
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">GET /api/businesses?query=restaurant&location=Seattle</code>
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
										<div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
											<MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
										</div>
									</div>
									<CardTitle>Geolocation API</CardTitle>
									<CardDescription>Precise location services with radius search and geocoding capabilities</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											GPS-accurate positioning
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Radius-based search
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Geocoding & reverse geocoding
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">GET /api/geocode?lat=47.6062&lng=-122.3321&radius=5km</code>
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
										<div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
											<Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
										</div>
									</div>
									<CardTitle>Real-Time Data API</CardTitle>
									<CardDescription>Live business information including hours, availability, and updates</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Live business hours
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Real-time availability
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											WebSocket support
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">GET /api/business/123/realtime</code>
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
										<div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/20">
											<Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
										</div>
									</div>
									<CardTitle>Authentication API</CardTitle>
									<CardDescription>Secure API key management with role-based access control</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											JWT-based auth
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Rate limiting
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Usage analytics
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">Authorization: Bearer your-api-key</code>
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
															<div className="p-2 bg-primary/20 rounded-lg dark:bg-primary/20">
						<Clock className="w-6 h-6 text-primary dark:text-primary" />
										</div>
									</div>
									<CardTitle>Analytics API</CardTitle>
									<CardDescription>Track usage, monitor performance, and gain insights into API consumption</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Real-time metrics
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Usage breakdowns
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Performance insights
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">GET /api/analytics/usage?period=30d</code>
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex items-center">
										<div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
											<Users className="w-6 h-6 text-red-600 dark:text-red-400" />
										</div>
									</div>
									<CardTitle>Reviews & Ratings API</CardTitle>
									<CardDescription>Access user reviews, ratings, and sentiment analysis for businesses</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Verified reviews
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Sentiment analysis
										</div>
										<div className="flex items-center text-sm">
											<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
											Rating aggregations
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted rounded-lg">
										<code className="text-xs">GET /api/business/123/reviews?limit=10</code>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Quick Start Section */}
				<div className="px-4 py-24 bg-muted lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold tracking-tight">Get Started in Minutes</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">Follow these simple steps to start integrating Thorbis APIs into your application</p>
						</div>
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							<div className="space-y-8">
								<div className="flex">
									<div className="flex-shrink-0">
										<div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">1</div>
									</div>
									<div className="ml-6">
										<h3 className="text-lg font-semibold">Get Your API Key</h3>
										<p className="mt-2 text-muted-foreground">Sign up for a free account and generate your API key instantly. No credit card required.</p>
										<Button asChild variant="outline" size="sm" className="mt-4">
											<Link href="/developers/api-keys">Get API Key</Link>
										</Button>
									</div>
								</div>
								<div className="flex">
									<div className="flex-shrink-0">
										<div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">2</div>
									</div>
									<div className="ml-6">
										<h3 className="text-lg font-semibold">Make Your First Request</h3>
										<p className="mt-2 text-muted-foreground">Use our RESTful APIs with simple HTTP requests. No complex setup required.</p>
									</div>
								</div>
								<div className="flex">
									<div className="flex-shrink-0">
										<div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">3</div>
									</div>
									<div className="ml-6">
										<h3 className="text-lg font-semibold">Build & Deploy</h3>
										<p className="mt-2 text-muted-foreground">Integrate our APIs into your application and deploy with confidence using our reliable infrastructure.</p>
									</div>
								</div>
							</div>
							<div className="p-6 bg-background rounded-lg border">
								<div className="flex items-center justify-between mb-4">
									<h4 className="font-semibold">Example Request</h4>
									<Badge variant="secondary">cURL</Badge>
								</div>
								<pre className="overflow-x-auto p-4 text-sm bg-muted rounded-lg">
									{`curl -X GET "https://api.thorbis.com/v1/businesses/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "coffee shops",
    "location": "Seattle, WA",
    "radius": "5km",
    "limit": 20
  }'`}
								</pre>
								<div className="mt-4">
									<h5 className="text-sm font-medium text-muted-foreground">Response:</h5>
									<pre className="mt-2 overflow-x-auto p-4 text-xs bg-muted rounded-lg">
										{`{
  "businesses": [
    {
      "id": "12345",
      "name": "Pike Place Coffee",
      "address": "1912 Pike Pl, Seattle, WA",
      "rating": 4.5,
      "coordinates": {
        "lat": 47.6097,
        "lng": -122.3331
      }
    }
  ],
  "total": 150,
  "page": 1
}`}
									</pre>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SDKs and Tools Section */}
				<div className="px-4 py-24 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold tracking-tight">SDKs & Integration Tools</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">Official SDKs and tools to accelerate your development process</p>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20 w-fit">
										<Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
									</div>
									<CardTitle className="text-lg">JavaScript SDK</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">Full-featured SDK for Node.js and browser environments</p>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link href="#" className="flex items-center">
											<Download className="mr-2 w-4 h-4" />
											Install SDK
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-green-100 rounded-lg dark:bg-green-900/20 w-fit">
										<Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
									</div>
									<CardTitle className="text-lg">React Native</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">Native mobile SDK for iOS and Android applications</p>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link href="#" className="flex items-center">
											<Download className="mr-2 w-4 h-4" />
											Install SDK
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20 w-fit">
										<Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
									</div>
									<CardTitle className="text-lg">Python SDK</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">Comprehensive Python library for backend integrations</p>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link href="#" className="flex items-center">
											<Download className="mr-2 w-4 h-4" />
											Install SDK
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20 w-fit">
										<GitBranch className="w-8 h-8 text-orange-600 dark:text-orange-400" />
									</div>
									<CardTitle className="text-lg">CLI Tools</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">Command-line tools for testing and API management</p>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link href="#" className="flex items-center">
											<Download className="mr-2 w-4 h-4" />
											Install CLI
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Developer Success Stories */}
				<div className="px-4 py-24 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								<Award className="mr-2 w-4 h-4" />
								Success Stories
							</Badge>
							<h2 className="text-4xl font-bold tracking-tight">Powering Innovation Worldwide</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
								See how developers and companies are building amazing applications with our APIs
							</p>
						</div>
						
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
							<Card className="relative overflow-hidden">
								<CardHeader>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
											<Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
										</div>
										<div>
											<CardTitle className="text-lg">FoodieFind Mobile</CardTitle>
											<CardDescription>Restaurant Discovery App</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										"Thorbis APIs helped us build a restaurant discovery app that serves 50K+ users daily. 
										The geolocation accuracy and business data quality are outstanding."
									</p>
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center space-x-2">
											<div className="w-8 h-8 bg-muted rounded-full"></div>
											<span className="font-medium">Sarah Chen</span>
										</div>
										<Badge variant="secondary">50K+ Users</Badge>
									</div>
								</CardContent>
							</Card>

							<Card className="relative overflow-hidden">
								<CardHeader>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/20">
											<Network className="w-6 h-6 text-green-600 dark:text-green-400" />
										</div>
										<div>
											<CardTitle className="text-lg">LocalConnect CRM</CardTitle>
											<CardDescription>B2B Sales Platform</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										"We integrated Thorbis Business API into our CRM and increased our lead quality by 300%. 
										Real-time business verification is a game-changer."
									</p>
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center space-x-2">
											<div className="w-8 h-8 bg-muted rounded-full"></div>
											<span className="font-medium">Marcus Johnson</span>
										</div>
										<Badge variant="secondary">300% Growth</Badge>
									</div>
								</CardContent>
							</Card>

							<Card className="relative overflow-hidden">
								<CardHeader>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center dark:bg-purple-900/20">
											<Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<CardTitle className="text-lg">DeliveryDash</CardTitle>
											<CardDescription>Logistics Platform</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										"The sub-50ms response times and 99.99% uptime helped us optimize our delivery routes. 
										Processing 100K+ API calls daily without any issues."
									</p>
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center space-x-2">
											<div className="w-8 h-8 bg-muted rounded-full"></div>
											<span className="font-medium">Alex Rodriguez</span>
										</div>
										<Badge variant="secondary">100K+ Daily Calls</Badge>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Key Metrics Row */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-muted rounded-lg">
							<div className="text-center">
								<div className="text-2xl font-bold text-primary mb-2">2,500+</div>
								<div className="text-sm text-muted-foreground">Active Developers</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-primary mb-2">150+</div>
								<div className="text-sm text-muted-foreground">Production Apps</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-primary mb-2">45 Countries</div>
								<div className="text-sm text-muted-foreground">Global Reach</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-primary mb-2">4.9/5</div>
								<div className="text-sm text-muted-foreground">Developer Satisfaction</div>
							</div>
						</div>
					</div>
				</div>

				{/* Enterprise Features Section */}
				<div className="px-4 py-24 bg-muted lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								<Cpu className="mr-2 w-4 h-4" />
								Enterprise Ready
							</Badge>
							<h2 className="text-4xl font-bold tracking-tight">Built for Enterprise Scale</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
								Advanced features and capabilities designed for high-volume, mission-critical applications
							</p>
						</div>
						
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
							<Card className="border border-primary/20 bg-primary/5">
								<CardHeader>
									<div className="p-2 bg-primary/10 rounded-lg w-fit">
										<Shield className="w-6 h-6 text-primary" />
									</div>
									<CardTitle className="text-lg">Enterprise Security</CardTitle>
									<CardDescription>Bank-level security with SOC 2 Type II compliance</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										End-to-end encryption
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Role-based access control
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Audit logs & compliance reporting
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										IP whitelisting & VPN access
									</div>
								</CardContent>
							</Card>

							<Card className="hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20 w-fit">
										<Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
									<CardTitle className="text-lg">Advanced Analytics</CardTitle>
									<CardDescription>Deep insights into API usage and business metrics</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Real-time usage dashboards
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Custom alerts & notifications
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Performance benchmarking
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Data export & API logs
									</div>
								</CardContent>
							</Card>

							<Card className="hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20 w-fit">
										<Network className="w-6 h-6 text-green-600 dark:text-green-400" />
									</div>
									<CardTitle className="text-lg">Global Infrastructure</CardTitle>
									<CardDescription>Multi-region deployment with edge caching</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										99.99% uptime SLA guaranteed
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Global CDN with 50+ edge locations
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Auto-scaling & load balancing
									</div>
									<div className="flex items-center text-sm">
										<CheckCircle className="mr-2 w-4 h-4 text-green-500" />
										Multi-zone redundancy
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Community and Support Section */}
				<div className="px-4 py-24 bg-background lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold tracking-tight">Developer Community & Support</h2>
							<p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">Join thousands of developers building amazing applications with Thorbis APIs</p>
						</div>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20 w-fit">
										<Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
									</div>
									<CardTitle>Documentation</CardTitle>
									<CardDescription>Comprehensive guides, API references, and interactive tutorials</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground mb-4">
										• Getting started guides<br/>
										• API reference docs<br/>
										• Code examples & SDKs<br/>
										• Video tutorials
									</div>
									<Button asChild variant="outline" className="w-full">
										<Link href="/developers/docs" className="flex items-center justify-center">
											Read Docs
											<ExternalLink className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="text-center hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="mx-auto p-3 bg-green-100 rounded-lg dark:bg-green-900/20 w-fit">
										<MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
									</div>
									<CardTitle>Community Forum</CardTitle>
									<CardDescription>Connect with developers and get help from the community</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground mb-4">
										• Ask questions & get answers<br/>
										• Share code examples<br/>
										• Feature requests<br/>
										• Developer meetups
									</div>
									<Button asChild variant="outline" className="w-full">
										<Link href="#" className="flex items-center justify-center">
											Join Forum
											<ExternalLink className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="text-center hover:shadow-lg transition-shadow border-primary/20 bg-primary/5">
								<CardHeader>
									<div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
										<Star className="w-8 h-8 text-primary" />
									</div>
									<CardTitle>Premium Support</CardTitle>
									<CardDescription>Priority support with dedicated developer success team</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground mb-4">
										• 1-hour response time<br/>
										• Dedicated success manager<br/>
										• Custom integration help<br/>
										• Phone & video support
									</div>
									<Button asChild className="w-full">
										<Link href="#" className="flex items-center justify-center">
											Learn More
											<ArrowRight className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Enhanced CTA Section */}
				<div className="px-4 py-24 bg-muted lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								<Rocket className="mr-2 w-4 h-4" />
								Launch Your Project Today
							</Badge>
							<h2 className="text-4xl font-bold tracking-tight md:text-5xl">Ready to Build Something Amazing?</h2>
							<p className="mx-auto mt-6 max-w-3xl text-xl text-muted-foreground">
								Join <span className="text-primary font-semibold">2,500+ developers</span> building the future of location-based applications. 
								Get started with <span className="text-primary font-semibold">10,000 free API calls</span> every month.
							</p>
						</div>

						{/* Quick Value Props */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
							<div className="text-center p-6 bg-background rounded-lg border">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/20">
									<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
								</div>
								<h3 className="font-semibold mb-2">Start in 5 Minutes</h3>
								<p className="text-sm text-muted-foreground">No credit card required. Get your API key and make your first call in under 5 minutes.</p>
							</div>
							<div className="text-center p-6 bg-background rounded-lg border">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/20">
									<Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="font-semibold mb-2">Lightning Fast</h3>
								<p className="text-sm text-muted-foreground">Sub-50ms response times with global CDN and 99.99% uptime guarantee.</p>
							</div>
							<div className="text-center p-6 bg-background rounded-lg border">
								<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-purple-900/20">
									<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="font-semibold mb-2">Expert Support</h3>
								<p className="text-sm text-muted-foreground">Get help from our developer success team and active community forum.</p>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className="text-center">
							<div className="flex flex-col gap-4 justify-center items-center sm:flex-row sm:gap-6">
								<Button asChild size="lg" className="px-10 py-4 text-lg font-semibold">
									<Link href="/developers/api-keys">
										<Rocket className="mr-2 w-5 h-5" />
										Get Started Free - No Credit Card
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg" className="px-10 py-4 text-lg">
									<Link href="/developers/docs">
										<Book className="mr-2 w-5 h-5" />
										Explore Live Documentation
									</Link>
								</Button>
							</div>
							
							{/* Quick Links */}
							<div className="flex flex-wrap gap-8 justify-center items-center mt-8 text-sm text-muted-foreground">
								<Link href="/developers/docs/quickstart" className="flex items-center hover:text-primary transition-colors">
									<Play className="mr-2 w-4 h-4" />
									5-Minute Quickstart
								</Link>
								<Link href="/pricing" className="flex items-center hover:text-primary transition-colors">
									<DollarSign className="mr-2 w-4 h-4" />
									View Pricing Details
								</Link>
								<Link href="/developers/examples" className="flex items-center hover:text-primary transition-colors">
									<Code2 className="mr-2 w-4 h-4" />
									Code Examples
								</Link>
								<Link href="/contact" className="flex items-center hover:text-primary transition-colors">
									<MessageSquare className="mr-2 w-4 h-4" />
									Talk to Sales
								</Link>
							</div>
						</div>

						{/* Trust Indicators */}
						<div className="mt-16 p-8 bg-background border rounded-lg">
							<div className="text-center mb-8">
								<h3 className="text-lg font-semibold mb-2">Trusted by Industry Leaders</h3>
								<p className="text-muted-foreground">From startups to Fortune 500 companies</p>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary mb-1">99.99%</div>
									<div className="text-xs text-muted-foreground">Uptime SLA</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary mb-1">&lt;42ms</div>
									<div className="text-xs text-muted-foreground">Response Time</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary mb-1">SOC 2</div>
									<div className="text-xs text-muted-foreground">Type II Certified</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary mb-1">24/7</div>
									<div className="text-xs text-muted-foreground">Support Available</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Development Feature Flags Section */}
				{process.env.NODE_ENV === 'development' && (
					<div className="px-4 py-16 mx-auto max-w-7xl lg:px-8">
						<div className="mx-auto max-w-4xl">
							<Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-800">
								<CardHeader>
									<CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
										<Key className="mr-2 w-5 h-5" />
										Development Feature Flags
									</CardTitle>
									<CardDescription className="text-yellow-700 dark:text-yellow-300">
										Control feature flags for development and testing. These settings are only available in development mode.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
											<div>
												<h3 className="font-semibold text-foreground">Authentication Bypass</h3>
												<p className="text-sm text-muted-foreground">
													Disable authentication requirements to test pages without login
												</p>
											</div>
											<Switch 
												id="auth-bypass"
												checked={readFlagFromDOM('data-flag-auth-bypass')}
												onCheckedChange={(checked) => {
													// Update the DOM attribute to trigger re-render
													document.body.setAttribute('data-flag-auth-bypass', checked ? '1' : '0');
													// Force a page reload to apply changes
													window.location.reload();
												}}
											/>
										</div>
										
										<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
											<p className="text-sm text-blue-800 dark:text-blue-200">
												<strong>Note:</strong> Feature flags are controlled via Vercel Edge Config. 
												For production changes, update the Edge Config values in your Vercel dashboard.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
