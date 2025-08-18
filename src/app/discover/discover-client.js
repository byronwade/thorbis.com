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
	ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, Shuffle, Bookmark
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

// Mood-based discovery categories
const moodCategories = [
	{
		id: "hungry",
		name: "Hungry",
		icon: Utensils,
		color: "bg-orange-500",
		description: "Find the perfect meal",
		businesses: 15000,
		subcategories: ["Quick Bites", "Fine Dining", "Street Food", "Desserts"]
	},
	{
		id: "shopping",
		name: "Shopping",
		icon: ShoppingBag,
		color: "bg-blue-500",
		description: "Discover unique finds",
		businesses: 8500,
		subcategories: ["Fashion", "Electronics", "Home & Garden", "Gifts"]
	},
	{
		id: "relax",
		name: "Relax",
		icon: Heart,
		color: "bg-pink-500",
		description: "Unwind and recharge",
		businesses: 3900,
		subcategories: ["Spa", "Massage", "Yoga", "Meditation"]
	},
	{
		id: "work",
		name: "Work",
		icon: Building2,
		color: "bg-purple-500",
		description: "Professional services",
		businesses: 4800,
		subcategories: ["Legal", "Accounting", "Real Estate", "Consulting"]
	},
	{
		id: "play",
		name: "Play",
		icon: Users,
		color: "bg-green-500",
		description: "Entertainment & fun",
		businesses: 2700,
		subcategories: ["Bars", "Music", "Events", "Recreation"]
	},
	{
		id: "fix",
		name: "Fix",
		icon: Wrench,
		color: "bg-muted-foreground",
		description: "Repair & maintenance",
		businesses: 6200,
		subcategories: ["Plumbing", "Electrical", "Auto Repair", "Home Repair"]
	}
];

// Trending discovery methods
const discoveryMethods = [
	{
		id: "nearby",
		name: "Nearby Now",
		icon: Target,
		description: "Businesses within walking distance",
		color: "bg-green-100 text-green-700",
		count: "2,500+"
	},
	{
		id: "trending",
		name: "Trending Today",
		icon: TrendingUp,
		description: "Most popular this week",
		color: "bg-orange-100 text-orange-700",
		count: "150+"
	},
	{
		id: "new",
		name: "New in Town",
		icon: Sparkles,
		description: "Recently opened businesses",
		color: "bg-blue-100 text-blue-700",
		count: "45+"
	},
	{
		id: "certified",
		name: "Certified Excellence",
		icon: Crown,
		description: "Verified quality businesses",
		color: "bg-purple-100 text-purple-700",
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
								<Badge className="bg-green-500">
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
								<Star className="h-5 w-5 text-yellow-500 fill-current" />
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
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">How are you feeling today?</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Discover businesses based on your mood and current needs
					</p>
				</div>

				{/* Mood selection grid */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
					{moodCategories.map((mood) => (
						<Card
							key={mood.id}
							className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
								selectedMood === mood.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
							}`}
							onClick={() => setSelectedMood(mood.id)}
						>
							<CardContent className="p-6 text-center">
								<div className={`w-16 h-16 ${mood.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
									<mood.icon className="h-8 w-8 text-white" />
								</div>
								<h3 className="font-semibold mb-2">{mood.name}</h3>
								<p className="text-sm text-muted-foreground mb-3">{mood.description}</p>
								<Badge variant="secondary">{mood.businesses.toLocaleString()}+</Badge>
							</CardContent>
						</Card>
					))}
				</div>

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
									<div className="p-3 bg-blue-100 rounded-lg">
										<Compass className="h-6 w-6 text-blue-600" />
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
									<div className="p-3 bg-green-100 rounded-lg">
										<Globe className="h-6 w-6 text-green-600" />
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
									<div className="p-3 bg-purple-100 rounded-lg">
										<Sparkles className="h-6 w-6 text-purple-600" />
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

export default function DiscoverClient() {
	return (
		<>
			<NetflixHeroSection />
			<InteractiveDiscoverySection />
			<EnhancedSearchSection />
			<BusinessShowcase />
		</>
	);
}
