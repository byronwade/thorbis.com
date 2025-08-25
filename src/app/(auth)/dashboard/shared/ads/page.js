"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Separator } from "@components/ui/separator";
import { Plus, Eye, Settings, Users, Phone, MessageSquare, MapPin, DollarSign, Target, CheckCircle, Star, Edit } from "lucide-react";

export default function AdsPage() {
	const [activeTab, setActiveTab] = useState("overview");

	React.useEffect(() => {
		document.title = "Thorbis Ads - Business Dashboard - Thorbis";
	}, []);

	// Mock active ad data
	const activeAds = [
		{
			id: "ad_001",
			title: "Wade's Plumbing & Septic",
			status: "active",
			services: [
				"Water Heater Installation",
				"Garbage Disposal Installation",
				"Emergency Services",
				"Faucet Repair",
				"Drain Cleaning",
				"Toilet Installation",
				"Gas Line Services",
				"Water Filter Services",
				"Drain Installation",
				"Water Heater Repair",
				"Pipe Repair",
				"Bathtub & Shower Repair",
				"Sink Repair",
				"Faucet Installation",
				"Sump Pump Repair",
				"Backflow Services",
				"Toilet Repair",
				"Garbage Disposal Repair",
				"Leak Detection",
				"Pipe Installation",
				"Bathtub & Shower Installation",
				"Sink Installation",
				"Septic Tank Services",
				"Sump Pump Installation",
				"Sewer Services",
			],
			location: "7737 Hwy 9, Ben Lomond",
			distance: "0 mi",
			photo: "/placeholder.svg",
			performance: {
				impressions: 8300,
				pageVisits: 33,
				leads: 54,
				adContribution: 95,
				avgCostPerClick: 12.38,
				avgCostPerLead: 19.68,
				spend: 767.58,
				bonusApplied: 420.85,
			},
			budget: {
				daily: 34,
				monthly: 1020,
				bonusRemaining: 479.15,
			},
			keywords: ["gas water heater repair", "gravity septic system repair", "leak detection", "septic tank installation & replacement", "solar water heater repair"],
			adText: "I hired Wade's Plumbing to install an engineered/enhanced treatment system. They worked with the designer I had already started working with to get the best solution for my property.",
			recentCalls: [
				{ date: "Jun 17, 2025, 11:49 AM", number: "(650) xxx-8538", duration: "1min 9sec" },
				{ date: "Jun 16, 2025, 11:00 AM", number: "(956) xxx-0814", duration: "0min 11sec" },
			],
		},
	];

	const formatNumber = (num) => {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "k";
		}
		return num.toString();
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

  return (
    <div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold">Thorbis Ads</h1>
					<p className="text-muted-foreground mt-2">Manage your advertising campaigns and track performance</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/business/ads/create">
						<Plus className="w-4 h-4 mr-2" />
						Create New Ad
					</Link>
				</Button>
			</div>

			{/* Active Ads Section */}
			{activeAds.map((ad) => (
				<div key={ad.id} className="space-y-6">
					{/* Ad Status Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<CheckCircle className="w-6 h-6 text-success" />
							<h2 className="text-2xl font-semibold">Your ad is up and running!</h2>
							<Badge variant="outline" className="text-success border-green-600">
								Sponsored Results
							</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Eye className="w-4 h-4 mr-2" />
								View as Customer
							</Button>
							<Button variant="outline" size="sm" asChild>
								<Link href={`/dashboard/business/ads/${ad.id}/edit`}>
									<Edit className="w-4 h-4 mr-2" />
									Edit Ad
								</Link>
							</Button>
						</div>
					</div>

					{/* Ad Preview Card */}
					<Card className="border-2 border-green-200 dark:border-green-800">
						<CardContent className="p-6">
							<div className="flex items-start gap-4">
								<Avatar className="w-16 h-16">
									<AvatarImage src={ad.photo} />
									<AvatarFallback className="text-lg">WP</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="text-xl font-semibold">{ad.title}</h3>
										<Badge variant="secondary">Sponsored</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-3">
										{ad.services.slice(0, 8).join(", ")} and {ad.services.length - 8} more
									</p>
									<div className="flex items-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-1">
											<MapPin className="w-4 h-4" />
											<span>{ad.location}</span>
										</div>
										<span>{ad.distance}</span>
									</div>
								</div>
								<div className="text-right">
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Star className="w-4 h-4 fill-yellow-400 text-warning" />
										<span>4.8 (127 reviews)</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Performance Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Impressions</CardTitle>
								<Eye className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatNumber(ad.performance.impressions)}</div>
								<p className="text-xs text-muted-foreground">{ad.performance.adContribution}% from Ads</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Page Visits</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{ad.performance.pageVisits}</div>
								<p className="text-xs text-muted-foreground">46% from Ads</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Leads</CardTitle>
								<Phone className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{ad.performance.leads}</div>
								<p className="text-xs text-muted-foreground">{ad.performance.adContribution}% from Ads</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Cost/Lead</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(ad.performance.avgCostPerLead)}</div>
								<p className="text-xs text-muted-foreground">Last 30 days</p>
							</CardContent>
						</Card>
					</div>

					{/* Budget and Spending */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Budget & Spending</CardTitle>
								<CardDescription>Your current budget and spending for this billing period</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Daily Budget</span>
									<span className="text-lg font-bold">{formatCurrency(ad.budget.daily)}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Monthly Max</span>
									<span className="text-lg font-bold">{formatCurrency(ad.budget.monthly)}</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Ad Spend (Jun 1-20)</span>
									<span className="text-lg font-bold">{formatCurrency(ad.performance.spend)}</span>
								</div>
								<div className="flex items-center justify-between text-success">
									<span className="text-sm font-medium">Bonus Applied</span>
									<span className="text-lg font-bold">{formatCurrency(ad.performance.bonusApplied)}</span>
								</div>
								<div className="flex items-center justify-between text-primary">
									<span className="text-sm font-medium">Bonus Remaining</span>
									<span className="text-lg font-bold">{formatCurrency(ad.budget.bonusRemaining)}</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Recent Calls</CardTitle>
								<CardDescription>Calls received from your ad</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{ad.recentCalls.map((call, index) => (
										<div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
											<div>
												<div className="text-sm font-medium">{call.number}</div>
												<div className="text-xs text-muted-foreground">{call.date}</div>
											</div>
											<div className="text-sm text-muted-foreground">{call.duration}</div>
										</div>
									))}
								</div>
								<div className="mt-4 text-center">
									<Button variant="outline" size="sm">
										See all calls
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Ad Optimization */}
					<Card>
						<CardHeader>
							<CardTitle>What changes can I make to my ad?</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<div className="p-4 border rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Settings className="w-4 h-4 text-primary" />
										<h4 className="font-medium">Ad Photo</h4>
									</div>
									<p className="text-sm text-muted-foreground mb-3">We&apos;ll find a photo that can get you more clicks.</p>
									<Button variant="outline" size="sm">
										Update Photo
									</Button>
								</div>

								<div className="p-4 border rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Target className="w-4 h-4 text-success" />
										<h4 className="font-medium">Keywords</h4>
									</div>
									<p className="text-sm text-muted-foreground mb-3">Your ads can be shown in search results for these keywords.</p>
									<div className="flex flex-wrap gap-1 mb-3">
										{ad.keywords.slice(0, 3).map((keyword, index) => (
											<Badge key={index} variant="secondary" className="text-xs">
												{keyword}
											</Badge>
										))}
										<Badge variant="outline" className="text-xs">
											+2 more
										</Badge>
									</div>
									<Button variant="outline" size="sm">
										Edit Keywords
									</Button>
								</div>

								<div className="p-4 border rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<MessageSquare className="w-4 h-4 text-purple-500" />
										<h4 className="font-medium">Ad Text</h4>
									</div>
									<p className="text-sm text-muted-foreground mb-3">We&apos;ll find an optimal review to feature in your ads.</p>
									<p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.adText}</p>
									<Button variant="outline" size="sm">
										Update Text
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			))}

			{/* No Active Ads State */}
			{activeAds.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Target className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No active ads</h3>
						<p className="text-muted-foreground text-center mb-6">Create your first ad campaign to start reaching more customers.</p>
						<Button asChild>
							<Link href="/dashboard/business/ads/create">
								<Plus className="w-4 h-4 mr-2" />
								Create Your First Ad
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}
    </div>
	);
}
