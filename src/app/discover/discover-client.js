"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
	Search, MapPin, Star, Award, Building2, Utensils, ShoppingBag, Wrench, Heart, Users, 
	TrendingUp, ArrowRight, CheckCircle, Crown, Shield, Compass, Zap, Sparkles, 
	Navigation, Target, Globe, Clock, Filter, Grid, List, Map, Play, Pause,
	ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, Shuffle, Bookmark,
	Camera, Calendar, Tag, ExternalLink, Share2, BookOpen, Phone, Mail
} from "lucide-react";
import BusinessCard from "@components/site/home/business-card";
import ScrollSection from "@components/site/home/scroll-section";
import EnhancedLocationSelector from "@components/shared/enhanced-location-selector";

// Netflix-style featured businesses with auto-rotation
const featuredBusinesses = [
	{
		id: 1,
		name: "Tony's Authentic Pizza",
		category: "Restaurant",
		rating: 4.9,
		reviewCount: 324,
		location: "Downtown District",
		image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Family-owned pizzeria serving authentic Italian cuisine for over 30 years.",
		tags: ["Pizza", "Italian", "Family-Friendly"],
		featured: true,
		certified: true,
		slug: "tonys-authentic-pizza"
	},
	{
		id: 2,
		name: "Green Thumb Landscaping",
		category: "Home Services",
		rating: 4.8,
		reviewCount: 156,
		location: "Suburban Area",
		image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Professional landscaping and garden design services.",
		tags: ["Landscaping", "Garden Design", "Eco-Friendly"],
		featured: false,
		certified: true,
		slug: "green-thumb-landscaping"
	},
	{
		id: 3,
		name: "Bella's Boutique",
		category: "Retail",
		rating: 4.7,
		reviewCount: 89,
		location: "Shopping District",
		image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Curated fashion and accessories from local and sustainable brands.",
		tags: ["Fashion", "Sustainable", "Local Brands"],
		featured: false,
		certified: true,
		slug: "bellas-boutique"
	},
	{
		id: 4,
		name: "Serenity Day Spa",
		category: "Health & Wellness",
		rating: 4.9,
		reviewCount: 203,
		location: "Uptown",
		image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Luxury wellness retreat offering massage therapy and holistic treatments.",
		tags: ["Spa", "Wellness", "Luxury"],
		featured: true,
		certified: true,
		slug: "serenity-day-spa"
	}
];

// Mood-based discovery categories with enhanced data
const moodCategories = [
	{
		id: "happy",
		name: "Happy",
		icon: Heart,
		color: "bg-yellow-500",
		description: "Find joy and happiness",
		businesses: 12000,
		subcategories: ["Entertainment", "Wellness", "Social", "Creative", "Outdoor"]
	},
	{
		id: "hungry",
		name: "Hungry",
		icon: Utensils,
		color: "bg-orange-500",
		description: "Find the perfect meal",
		businesses: 15000,
		subcategories: ["Quick Bites", "Fine Dining", "Street Food", "Desserts", "Beverages"]
	},
	{
		id: "shopping",
		name: "Shopping",
		icon: ShoppingBag,
		color: "bg-blue-500",
		description: "Discover unique finds",
		businesses: 8500,
		subcategories: ["Fashion", "Electronics", "Home & Garden", "Gifts", "Artisan"]
	},
	{
		id: "play",
		name: "Play",
		icon: Users,
		color: "bg-green-500",
		description: "Entertainment & fun",
		businesses: 2700,
		subcategories: ["Bars", "Music", "Events", "Recreation", "Family Fun"]
	},
	{
		id: "relax",
		name: "Relax",
		icon: Heart,
		color: "bg-purple-500",
		description: "Unwind and recharge",
		businesses: 3900,
		subcategories: ["Spa", "Massage", "Yoga", "Meditation", "Wellness"]
	},
	{
		id: "work",
		name: "Work",
		icon: Building2,
		color: "bg-gray-500",
		description: "Professional services",
		businesses: 4800,
		subcategories: ["Legal", "Accounting", "Real Estate", "Consulting", "Coworking"]
	},
	{
		id: "fix",
		name: "Fix",
		icon: Wrench,
		color: "bg-red-500",
		description: "Repair & maintenance",
		businesses: 6200,
		subcategories: ["Plumbing", "Electrical", "Auto Repair", "Home Repair", "Electronics"]
	}
];

// Trending discovery methods
const discoveryMethods = [
	{
		id: "nearby",
		name: "Nearby Now",
		icon: Target,
		description: "Businesses within walking distance",
		color: "bg-success/10 text-success",
		count: "2,500+"
	},
	{
		id: "trending",
		name: "Trending Today",
		icon: TrendingUp,
		description: "Most popular this week",
		color: "bg-warning/10 text-warning",
		count: "150+"
	},
	{
		id: "new",
		name: "New in Town",
		icon: Sparkles,
		description: "Recently opened businesses",
		color: "bg-primary/10 text-primary",
		count: "45+"
	},
	{
		id: "certified",
		name: "Certified Excellence",
		icon: Crown,
		description: "Verified quality businesses",
		color: "bg-muted text-muted-foreground",
		count: "3,200+"
	}
];

// Interactive map hotspots
const mapHotspots = [
	{
		id: 1,
		name: "Downtown Core",
		businesses: 234,
		trending: "+23%",
		highlights: ["Restaurants", "Bars", "Shopping"],
		coordinates: { x: 25, y: 30 }
	},
	{
		id: 2,
		name: "Arts District",
		businesses: 156,
		trending: "+18%",
		highlights: ["Galleries", "Studios", "Cafes"],
		coordinates: { x: 70, y: 45 }
	},
	{
		id: 3,
		name: "Tech Hub",
		businesses: 89,
		trending: "+35%",
		highlights: ["Startups", "Coworking", "Coffee"],
		coordinates: { x: 45, y: 70 }
	}
];

function NetflixHeroSection() {
	const [currentBusiness, setCurrentBusiness] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);

	useEffect(() => {
		if (!isPlaying) return;
		
		const interval = setInterval(() => {
			setCurrentBusiness((prev) => (prev + 1) % featuredBusinesses.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [isPlaying]);

	const business = featuredBusinesses[currentBusiness];

	return (
		<section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-background">
			{/* Hero background image */}
			<div className="absolute inset-0">
				<img
					src={business.image}
					alt={business.name}
					className="object-cover w-full h-full transition-all duration-1000 ease-in-out"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 md:to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
			</div>

			{/* Content overlay */}
			<div className="relative z-10 h-full flex items-center">
				<div className="px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
					<div className="max-w-full md:max-w-2xl">
						{/* Category badge */}
						<div className="flex items-center space-x-2 mb-4 animate-fade-in-scale">
							<span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full">
								<div className="w-2 h-2 bg-primary rounded-full"></div>
								{business.category}
							</span>
							{business.certified && (
								<Badge className="bg-success">
									<CheckCircle className="h-3 w-3 mr-1" />
									Certified
								</Badge>
							)}
						</div>

						{/* Business title */}
						<h1 className="text-4xl md:text-6xl font-bold text-card-foreground mb-4 animate-fade-in-up">
							{business.name}
						</h1>

						{/* Business details */}
						<div className="flex items-center space-x-6 mb-6 animate-fade-in-up animate-delay-100">
							<div className="flex items-center space-x-1">
								<Star className="h-5 w-5 text-warning fill-current" />
								<span className="font-semibold">{business.rating}</span>
								<span className="text-muted-foreground">({business.reviewCount})</span>
							</div>
							<div className="flex items-center space-x-1 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>{business.location}</span>
							</div>
						</div>

						{/* Description */}
						<p className="text-lg text-muted-foreground mb-8 max-w-xl animate-fade-in-up animate-delay-200">
							{business.description}
						</p>

						{/* Action buttons */}
						<div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
							<Button size="lg" className="bg-primary hover:bg-primary/90">
								<Play className="h-4 w-4 mr-2" />
								Explore Business
							</Button>
							<Button size="lg" variant="outline" className="border-2">
								<Bookmark className="h-4 w-4 mr-2" />
								Save for Later
							</Button>
						</div>

						{/* Auto-play controls */}
						<div className="flex items-center space-x-4 mt-8 animate-fade-in-up animate-delay-400">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsPlaying(!isPlaying)}
								className="text-muted-foreground hover:text-foreground"
							>
								{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
							</Button>
							<div className="flex space-x-2">
								{featuredBusinesses.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentBusiness(index)}
										className={`w-2 h-2 rounded-full transition-colors ${
											index === currentBusiness ? 'bg-primary' : 'bg-muted-foreground/30'
										}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function InteractiveDiscoverySection() {
	const [selectedMood, setSelectedMood] = useState(null);
	const [viewMode, setViewMode] = useState('grid');

	return (
		<section className="py-16 bg-gradient-to-b from-background to-muted/20">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="How are you feeling today?" 
					subtitle="Discover businesses based on your mood and current needs"
					link="/discover"
				>
					{moodCategories.map((mood) => (
						<a
							key={mood.id}
							href={`/discover/${mood.id}`}
							className="group"
						>
							<Card
								className={`cursor-pointer transition-all duration-300 hover:scale-105 group-hover:shadow-lg ${
									selectedMood === mood.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
								}`}
								onClick={() => setSelectedMood(mood.id)}
							>
								<CardContent className="p-6 text-center">
									<div className="flex items-center justify-center mb-4">
										<div className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center`}>
											<mood.icon className="h-6 w-6 text-white" />
										</div>
									</div>
									<h3 className="font-semibold mb-2 text-lg">{mood.name}</h3>
									<p className="text-sm text-muted-foreground mb-3">{mood.description}</p>
									<div className="flex flex-col gap-2">
										<Badge variant="secondary">{mood.businesses.toLocaleString()}+ businesses</Badge>
										<div className="flex flex-wrap gap-1 justify-center">
											{mood.subcategories.slice(0, 3).map((sub) => (
												<span key={sub} className="text-xs text-muted-foreground">• {sub}</span>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</a>
					))}
				</ScrollSection>

				{/* Discovery methods */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{discoveryMethods.map((method) => (
						<Card key={method.id} className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardContent className="p-6">
								<div className="flex items-center space-x-4 mb-4">
									<div className={`p-3 rounded-lg ${method.color}`}>
										<method.icon className="h-6 w-6" />
									</div>
									<div>
										<h4 className="font-semibold">{method.name}</h4>
										<p className="text-sm text-muted-foreground">{method.description}</p>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<Badge variant="outline">{method.count}</Badge>
									<ArrowRight className="h-4 w-4 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Interactive map preview */}
				<Card className="overflow-hidden">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Interactive Discovery Map</CardTitle>
								<CardDescription>Click on hotspots to explore different areas</CardDescription>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
								>
									{viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
								</Button>
								<Button variant="outline" size="sm">
									<Filter className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100">
							{/* Map hotspots */}
							{mapHotspots.map((hotspot) => (
								<div
									key={hotspot.id}
									className="absolute cursor-pointer group"
									style={{
										left: `${hotspot.coordinates.x}%`,
										top: `${hotspot.coordinates.y}%`,
										transform: 'translate(-50%, -50%)'
									}}
								>
									<div className="relative">
										<div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
										<div className="absolute -top-2 -left-2 w-8 h-8 bg-primary/20 rounded-full animate-ping" />
										
										{/* Tooltip */}
										<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
											<div className="bg-card border rounded-lg p-3 shadow-lg whitespace-nowrap">
												<h4 className="font-semibold text-sm">{hotspot.name}</h4>
												<p className="text-xs text-muted-foreground">{hotspot.businesses} businesses</p>
												<Badge className="text-xs mt-1">{hotspot.trending}</Badge>
											</div>
										</div>
									</div>
								</div>
							))}
							
							{/* Map controls */}
							<div className="absolute bottom-4 right-4 flex space-x-2">
								<Button size="sm" variant="secondary">
									<Navigation className="h-4 w-4" />
								</Button>
								<Button size="sm" variant="secondary">
									<RotateCcw className="h-4 w-4" />
								</Button>
								<Button size="sm" variant="secondary">
									<Zap className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

function EnhancedSearchSection() {
	const [searchQuery, setSearchQuery] = useState('');
	const [location, setLocation] = useState('');
	const [activeFilters, setActiveFilters] = useState([]);

	const quickFilters = [
		{ id: 'open-now', label: 'Open Now', icon: Clock },
		{ id: 'certified', label: 'Certified', icon: CheckCircle },
		{ id: 'trending', label: 'Trending', icon: TrendingUp },
		{ id: 'nearby', label: 'Nearby', icon: Target },
		{ id: 'highly-rated', label: 'Highly Rated', icon: Star },
	];

	return (
		<section className="py-16 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold mb-4">Find Exactly What You Need</h2>
						<p className="text-muted-foreground">Advanced search with smart filters and location-based discovery</p>
					</div>

					{/* Enhanced search bar */}
					<Card className="p-6 mb-8">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
								<Input
									placeholder="What are you looking for?"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 py-3 text-lg"
								/>
							</div>
							<div className="flex-1">
								<EnhancedLocationSelector
									value={location}
									onChange={setLocation}
									placeholder="Where?"
									className="w-full"
								/>
							</div>
							<Button size="lg" className="bg-primary hover:bg-primary/90">
								<Search className="h-5 w-5 mr-2" />
								Discover
							</Button>
						</div>

						{/* Quick filters */}
						<div className="flex flex-wrap gap-2 mt-4">
							{quickFilters.map((filter) => (
								<Button
									key={filter.id}
									variant={activeFilters.includes(filter.id) ? "default" : "outline"}
									size="sm"
									onClick={() => {
										setActiveFilters(prev => 
											prev.includes(filter.id) 
												? prev.filter(f => f !== filter.id)
												: [...prev, filter.id]
										);
									}}
								>
									<filter.icon className="h-4 w-4 mr-2" />
									{filter.label}
								</Button>
							))}
						</div>
					</Card>

					{/* Search suggestions */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardContent className="p-6">
								<div className="flex items-center space-x-4 mb-4">
									<div className="p-3 bg-primary/10 rounded-lg">
										<Compass className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Explore by Mood</h4>
										<p className="text-sm text-muted-foreground">Find businesses based on how you feel</p>
									</div>
								</div>
								<Button variant="outline" className="w-full">
									<Shuffle className="h-4 w-4 mr-2" />
									Surprise Me
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardContent className="p-6">
								<div className="flex items-center space-x-4 mb-4">
									<div className="p-3 bg-success/10 rounded-lg">
										<Globe className="h-6 w-6 text-success" />
									</div>
									<div>
										<h4 className="font-semibold">Popular Areas</h4>
										<p className="text-sm text-muted-foreground">Discover trending neighborhoods</p>
									</div>
								</div>
								<Button variant="outline" className="w-full">
									<Map className="h-4 w-4 mr-2" />
									View Map
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardContent className="p-6">
								<div className="flex items-center space-x-4 mb-4">
									<div className="p-3 bg-muted rounded-lg">
										<Sparkles className="h-6 w-6 text-muted-foreground" />
									</div>
									<div>
										<h4 className="font-semibold">New Discoveries</h4>
										<p className="text-sm text-muted-foreground">Recently added businesses</p>
									</div>
								</div>
								<Button variant="outline" className="w-full">
									<Eye className="h-4 w-4 mr-2" />
									See New
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}

function BusinessShowcase() {
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">Featured Discoveries</h2>
						<p className="text-muted-foreground">Handpicked businesses you'll love</p>
					</div>
					<Button variant="outline">
						View All <ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>

				{/* Netflix-style horizontal scroll */}
				<ScrollSection title="Trending Now" link="/trending">
					{featuredBusinesses.map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>

				<ScrollSection title="New in Your Area" link="/new" category="Fresh">
					{featuredBusinesses.slice().reverse().map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>

				<ScrollSection title="Highly Rated" link="/top-rated" category="Excellence">
					{featuredBusinesses.map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// New section: Mood-based quick access
function MoodQuickAccessSection() {
	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Quick Mood Access" 
					subtitle="Jump directly to your favorite mood categories"
					link="/discover"
				>
					{moodCategories.map((mood) => (
						<a
							key={mood.id}
							href={`/discover/${mood.id}`}
							className="group"
						>
							<Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105">
								<CardContent className="p-4 text-center">
									<div className="flex flex-col items-center">
										<div className={`w-10 h-10 ${mood.color} rounded-full flex items-center justify-center mb-2`}>
											<mood.icon className="h-5 w-5 text-white" />
										</div>
										<h3 className="font-semibold text-sm mb-1">{mood.name}</h3>
										<p className="text-xs text-muted-foreground">{mood.businesses.toLocaleString()}+</p>
									</div>
								</CardContent>
							</Card>
						</a>
					))}
				</ScrollSection>

				<div className="text-center mt-8">
					<Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Shuffle className="h-4 w-4 mr-2" />
						Surprise Me
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 6: Expert Insights & Market Analysis
function ExpertInsightsSection() {
	const insights = [
		{
			id: 1,
			expert: "Dr. Jennifer Martinez",
			title: "Consumer Behavior Analyst",
			avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			insight: "Local business discovery has increased by 45% in the past year, with consumers prioritizing authenticity and community connection.",
			trend: "+45%",
			verified: true,
			expertise: "Market Research"
		},
		{
			id: 2,
			expert: "Marcus Thompson",
			title: "Local Business Consultant",
			avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			insight: "Businesses with strong digital presence and community engagement see 60% higher customer retention rates.",
			trend: "+60%",
			verified: true,
			expertise: "Business Strategy"
		},
		{
			id: 3,
			expert: "Sarah Chen",
			title: "Customer Experience Expert",
			avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			insight: "Personalized discovery experiences lead to 3x higher engagement and 2x higher conversion rates.",
			trend: "+300%",
			verified: true,
			expertise: "UX Research"
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Expert Insights & Market Analysis" 
					subtitle="Professional analysis and trends in local business discovery"
					link="/insights"
				>
					{insights.map((insight) => (
						<Card key={insight.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center space-x-3 mb-4">
									<img
										src={insight.avatar}
										alt={insight.expert}
										className="w-12 h-12 rounded-full object-cover"
									/>
									<div>
										<h4 className="font-semibold">{insight.expert}</h4>
										<p className="text-sm text-muted-foreground">{insight.title}</p>
									</div>
									{insight.verified && (
										<Badge className="bg-success">
											<CheckCircle className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground mb-4">"{insight.insight}"</p>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<TrendingUp className="h-4 w-4 text-success" />
										<span className="text-sm font-semibold text-success">{insight.trend}</span>
									</div>
									<Badge variant="secondary">{insight.expertise}</Badge>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>

				<div className="text-center mt-8">
					<Button variant="outline">
						<TrendingUp className="h-4 w-4 mr-2" />
						View Full Market Report
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 7: Multimedia Content Hub
function MultimediaHubSection() {
	const contentHub = [
		{
			id: 1,
			type: "video",
			title: "Complete Guide to Local Business Discovery",
			thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			duration: "15:30",
			views: "89.5K",
			author: "Local Discovery Channel",
			featured: true
		},
		{
			id: 2,
			type: "podcast",
			title: "Local Business Spotlight",
			thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			duration: "42:15",
			views: "23.8K",
			author: "Community Business Podcast",
			featured: false
		},
		{
			id: 3,
			type: "gallery",
			title: "Hidden Gems Photo Collection",
			thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			images: 234,
			author: "Local Photography",
			featured: false
		}
	];

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Content Hub" 
					subtitle="Videos, podcasts, and visual content about local business discovery"
					link="/content"
				>
					{contentHub.map((content) => (
						<Card key={content.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${content.featured ? 'ring-2 ring-primary' : ''}`}>
							<CardContent className="p-0">
								<div className="relative">
									<img
										src={content.thumbnail}
										alt={content.title}
										className="w-full h-48 object-cover rounded-t-lg"
									/>
									{content.type === "video" && (
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
												<Play className="h-8 w-8 text-primary ml-1" />
											</div>
										</div>
									)}
									{content.duration && (
										<div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
											{content.duration}
										</div>
									)}
									{content.featured && (
										<Badge className="absolute top-2 left-2 bg-primary">
											<Sparkles className="h-3 w-3 mr-1" />
											Featured
										</Badge>
									)}
								</div>
								<div className="p-4">
									<h4 className="font-semibold mb-2">{content.title}</h4>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>{content.author}</span>
										{content.views && <span>{content.views} views</span>}
										{content.images && <span>{content.images} photos</span>}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>

				<div className="text-center mt-8">
					<Button variant="outline">
						<Camera className="h-4 w-4 mr-2" />
						Explore Content Library
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 8: Upcoming Events & Community Happenings
function CommunityEventsSection() {
	const events = [
		{
			id: 1,
			title: "Local Business Discovery Festival 2024",
			date: "2024-03-15",
			time: "All Day",
			location: "City Center",
			image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 5000,
			price: "Free",
			featured: true,
			category: "Festival"
		},
		{
			id: 2,
			title: "Small Business Networking Expo",
			date: "2024-03-20",
			time: "9:00 AM - 6:00 PM",
			location: "Convention Center",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 1200,
			price: "$35",
			featured: false,
			category: "Expo"
		},
		{
			id: 3,
			title: "Community Business Meetup",
			date: "2024-03-25",
			time: "7:00 PM - 10:00 PM",
			location: "Downtown Lounge",
			image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 250,
			price: "$15",
			featured: false,
			category: "Networking"
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Community Events & Happenings" 
					subtitle="Don't miss these local business events and experiences"
					link="/events"
				>
					{events.map((event) => (
						<Card key={event.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-0">
								<div className="relative">
									<img
										src={event.image}
										alt={event.title}
										className="w-full h-48 object-cover rounded-t-lg"
									/>
									{event.featured && (
										<Badge className="absolute top-2 left-2 bg-primary">
											<Sparkles className="h-3 w-3 mr-1" />
											Featured
										</Badge>
									)}
									<Badge className="absolute top-2 right-2 bg-success">
										{event.price}
									</Badge>
									<Badge className="absolute bottom-2 left-2 bg-muted">
										{event.category}
									</Badge>
								</div>
								<div className="p-4">
									<h4 className="font-semibold mb-2">{event.title}</h4>
									<div className="space-y-2 text-sm text-muted-foreground">
										<div className="flex items-center space-x-2">
											<Calendar className="h-4 w-4" />
											<span>{new Date(event.date).toLocaleDateString()}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Clock className="h-4 w-4" />
											<span>{event.time}</span>
										</div>
										<div className="flex items-center space-x-2">
											<MapPin className="h-4 w-4" />
											<span>{event.location}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Users className="h-4 w-4" />
											<span>{event.attendees.toLocaleString()} attending</span>
										</div>
									</div>
									<Button className="w-full mt-4">
										<Calendar className="h-4 w-4 mr-2" />
										RSVP Now
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 9: Special Offers & Community Deals
function CommunityDealsSection() {
	const deals = [
		{
			id: 1,
			title: "New Customer Welcome Package",
			description: "Get 30% off your first experience with any participating local business",
			discount: "30%",
			code: "WELCOME30",
			expires: "2024-04-01",
			participants: 89,
			featured: true
		},
		{
			id: 2,
			title: "Weekend Discovery Special",
			description: "Special weekend rates for local business experiences and services",
			discount: "20%",
			code: "WEEKEND20",
			expires: "2024-03-31",
			participants: 67,
			featured: false
		},
		{
			id: 3,
			title: "Community Bundle Deal",
			description: "Book multiple local services and save up to 40%",
			discount: "40%",
			code: "COMMUNITY40",
			expires: "2024-03-25",
			participants: 45,
			featured: false
		}
	];

	return (
		<section className="py-16 bg-muted/30">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Community Deals & Special Offers" 
					subtitle="Exclusive deals from local businesses in your community"
					link="/deals"
				>
					{deals.map((deal) => (
						<Card key={deal.id} className={`hover:shadow-lg transition-shadow ${deal.featured ? 'ring-2 ring-primary' : ''}`}>
							<CardContent className="p-6">
								{deal.featured && (
									<Badge className="mb-3 bg-primary">
										<Sparkles className="h-3 w-3 mr-1" />
										Featured Deal
									</Badge>
								)}
								<div className="text-center mb-4">
									<div className="text-4xl font-bold text-primary mb-2">{deal.discount}</div>
									<h4 className="font-semibold mb-1">{deal.title}</h4>
									<p className="text-sm text-muted-foreground">{deal.participants} businesses participating</p>
								</div>
								<p className="text-muted-foreground mb-4 text-center">{deal.description}</p>
								<div className="space-y-3">
									<div className="bg-muted p-3 rounded-lg">
										<div className="text-sm font-semibold mb-1">Promo Code</div>
										<div className="font-mono text-lg">{deal.code}</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Expires:</span>
										<span className="font-semibold">{new Date(deal.expires).toLocaleDateString()}</span>
									</div>
									<Button className="w-full">
										<Tag className="h-4 w-4 mr-2" />
										Claim Deal
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 10: Social Media & Community Engagement
function SocialCommunitySection() {
	const socialContent = [
		{
			id: 1,
			platform: "Instagram",
			username: "@localdiscovery",
			content: "Amazing local business discoveries this week! 🌟 Check out these hidden gems in our community.",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			likes: 2345,
			comments: 189,
			timeAgo: "3h ago",
			trending: true
		},
		{
			id: 2,
			platform: "Twitter",
			username: "@communitybusiness",
			content: "Just launched our new local business discovery platform! Find the best spots and share your favorites.",
			image: null,
			likes: 876,
			comments: 67,
			timeAgo: "6h ago",
			trending: false
		},
		{
			id: 3,
			platform: "TikTok",
			username: "@localexplorer",
			content: "POV: You're discovering the best local spots in town ✨ #localdiscovery #community",
			image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			likes: 5678,
			comments: 234,
			timeAgo: "1d ago",
			trending: true
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Social Media & Community" 
					subtitle="Join the local business discovery conversation"
					link="/social"
				>
					{socialContent.map((post) => (
						<Card key={post.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center space-x-3 mb-4">
									<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
										post.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
										post.platform === 'Twitter' ? 'bg-blue-500' : 'bg-black'
									}`}>
										<span className="text-white text-sm font-bold">
											{post.platform === 'Instagram' ? 'IG' : post.platform === 'Twitter' ? 'TW' : 'TT'}
										</span>
									</div>
									<div>
										<div className="font-semibold">{post.username}</div>
										<div className="text-sm text-muted-foreground">{post.timeAgo}</div>
									</div>
									{post.trending && (
										<Badge className="bg-warning">
											<TrendingUp className="h-3 w-3 mr-1" />
											Trending
										</Badge>
									)}
								</div>
								
								{post.image && (
									<img
										src={post.image}
										alt="Social media post"
										className="w-full h-48 object-cover rounded-lg mb-4"
									/>
								)}
								
								<p className="text-muted-foreground mb-4">{post.content}</p>
								
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<div className="flex items-center space-x-4">
										<span>❤️ {post.likes.toLocaleString()}</span>
										<span>💬 {post.comments}</span>
									</div>
									<Button variant="outline" size="sm">
										<ExternalLink className="h-4 w-4 mr-2" />
										View Post
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>

				<div className="text-center mt-8">
					<Button variant="outline">
						<Share2 className="h-4 w-4 mr-2" />
						Join the Conversation
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 11: Business Directory & Contact Hub
function BusinessDirectorySection() {
	const directory = [
		{
			id: 1,
			business: "Local Business Network",
			phone: "(555) 123-4567",
			email: "info@localbusinessnetwork.com",
			website: "www.localbusinessnetwork.com",
			address: "123 Main St, Downtown",
			hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
			verified: true,
			rating: 4.9,
			reviews: 456
		},
		{
			id: 2,
			business: "Community Business Hub",
			phone: "(555) 987-6543",
			email: "hello@communitybusinesshub.com",
			website: "www.communitybusinesshub.com",
			address: "456 Oak Ave, Uptown",
			hours: "Daily: 8AM-8PM",
			verified: true,
			rating: 4.8,
			reviews: 234
		},
		{
			id: 3,
			business: "Local Discovery Center",
			phone: "(555) 456-7890",
			email: "contact@localdiscoverycenter.com",
			website: "www.localdiscoverycenter.com",
			address: "789 Pine St, Arts District",
			hours: "Tue-Sun: 11AM-9PM",
			verified: false,
			rating: 4.7,
			reviews: 189
		}
	];

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Business Directory" 
					subtitle="Connect with local business networks and discovery services"
					link="/directory"
				>
					{directory.map((business) => (
						<Card key={business.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="font-semibold">{business.business}</h4>
									{business.verified && (
										<Badge className="bg-success">
											<CheckCircle className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>
								
								<div className="flex items-center space-x-2 mb-4">
									<div className="flex items-center space-x-1">
										<Star className="h-4 w-4 text-warning fill-current" />
										<span className="font-semibold">{business.rating}</span>
									</div>
									<span className="text-sm text-muted-foreground">({business.reviews} reviews)</span>
								</div>
								
								<div className="space-y-3">
									<div className="flex items-center space-x-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<a href={`tel:${business.phone}`} className="text-primary hover:underline">{business.phone}</a>
									</div>
									<div className="flex items-center space-x-3">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<a href={`mailto:${business.email}`} className="text-primary hover:underline">{business.email}</a>
									</div>
									<div className="flex items-center space-x-3">
										<ExternalLink className="h-4 w-4 text-muted-foreground" />
										<a href={`https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{business.website}</a>
									</div>
									<div className="flex items-start space-x-3">
										<MapPin className="h-4 w-4 text-muted-foreground mt-1" />
										<span>{business.address}</span>
									</div>
									<div className="flex items-center space-x-3">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>{business.hours}</span>
									</div>
								</div>
								
								<div className="flex space-x-2 mt-4">
									<Button size="sm" className="flex-1">
										<Phone className="h-4 w-4 mr-2" />
										Call Now
									</Button>
									<Button size="sm" variant="outline" className="flex-1">
										<Mail className="h-4 w-4 mr-2" />
										Email
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 12: Enhanced SEO & Educational Content
function EducationalContentSection() {
	const educationalContent = [
		{
			id: 1,
			title: "Complete Guide to Local Business Discovery",
			content: "Learn everything you need to know about finding the best local businesses in your area. From understanding what to look for to making informed decisions, this comprehensive guide covers all aspects of local business discovery.",
			keywords: ["local business guide", "how to find local businesses", "local business tips", "best local business practices"],
			readTime: "10 min read",
			featured: true
		},
		{
			id: 2,
			title: "Local Business Industry Trends 2024",
			content: "Stay ahead of the curve with our analysis of the latest trends in the local business industry. Discover what's new, what's changing, and what you should expect in the coming year.",
			keywords: ["local business trends", "local business 2024", "local business industry", "local business market"],
			readTime: "7 min read",
			featured: false
		},
		{
			id: 3,
			title: "Why Supporting Local Businesses Matters",
			content: "Supporting local businesses has far-reaching benefits for your community. Learn about the economic, social, and environmental impacts of choosing local providers.",
			keywords: ["support local", "local business benefits", "community impact", "local economy"],
			readTime: "6 min read",
			featured: false
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Educational Resources" 
					subtitle="Expert guides and insights about local business discovery"
					link="/resources"
				>
					{educationalContent.map((article) => (
						<Card key={article.id} className={`hover:shadow-lg transition-shadow ${article.featured ? 'ring-2 ring-primary' : ''}`}>
							<CardContent className="p-6">
								{article.featured && (
									<Badge className="mb-3 bg-primary">
										<Sparkles className="h-3 w-3 mr-1" />
										Featured Article
									</Badge>
								)}
								<h4 className="font-semibold mb-3">{article.title}</h4>
								<p className="text-muted-foreground mb-4">{article.content}</p>
								
								<div className="flex flex-wrap gap-1 mb-4">
									{article.keywords.map((keyword, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{keyword}
										</Badge>
									))}
								</div>
								
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">{article.readTime}</span>
									<Button variant="outline" size="sm">
										<BookOpen className="h-4 w-4 mr-2" />
										Read More
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</ScrollSection>

				<div className="text-center mt-8">
					<Button variant="outline">
						<BookOpen className="h-4 w-4 mr-2" />
						Browse All Resources
					</Button>
				</div>
			</div>
		</section>
	);
}

export default function DiscoverClient() {
	return (
		<>
			<NetflixHeroSection />
			<InteractiveDiscoverySection />
			<EnhancedSearchSection />
			<BusinessShowcase />
			<MoodQuickAccessSection />
			<ExpertInsightsSection />
			<MultimediaHubSection />
			<CommunityEventsSection />
			<CommunityDealsSection />
			<SocialCommunitySection />
			<BusinessDirectorySection />
			<EducationalContentSection />
		</>
	);
}
