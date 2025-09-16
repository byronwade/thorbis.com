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
	Music, Coffee, Gift, Car, Home, Camera, Palette, Dumbbell, BookOpen,
	Calendar, Phone, Mail, ExternalLink, Share2, Heart as HeartIcon, Tag,
	Camera as CameraIcon
} from "lucide-react";
import BusinessCard from "@/components/site/home/business-card";
import ScrollSection from "@/components/site/home/scroll-section";
import EnhancedLocationSelector from "@/components/shared/enhanced-location-selector";

// Sample business data for different moods
const moodBusinesses = {
	happy: [
		{
			id: 1,
			name: "Joyful Entertainment Center",
			category: "Entertainment",
			rating: 4.9,
			reviewCount: 456,
			location: "Downtown District",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Family entertainment center with arcade games, bowling, and fun activities.",
			tags: ["Arcade", "Bowling", "Family-Friendly"],
			featured: true,
			certified: true,
			slug: "joyful-entertainment-center"
		},
		{
			id: 2,
			name: "Sunshine Wellness Spa",
			category: "Wellness",
			rating: 4.8,
			reviewCount: 234,
			location: "Uptown",
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Holistic wellness center promoting happiness and positive energy.",
			tags: ["Spa", "Wellness", "Positive Vibes"],
			featured: false,
			certified: true,
			slug: "sunshine-wellness-spa"
		}
	],
	shopping: [
		{
			id: 3,
			name: "Bella's Boutique",
			category: "Fashion",
			rating: 4.7,
			reviewCount: 189,
			location: "Shopping District",
			image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Curated fashion and accessories from local and sustainable brands.",
			tags: ["Fashion", "Sustainable", "Local Brands"],
			featured: true,
			certified: true,
			slug: "bellas-boutique"
		},
		{
			id: 4,
			name: "Tech Haven Electronics",
			category: "Electronics",
			rating: 4.6,
			reviewCount: 312,
			location: "Tech District",
			image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Premium electronics store with expert advice and installation services.",
			tags: ["Electronics", "Expert Advice", "Installation"],
			featured: false,
			certified: true,
			slug: "tech-haven-electronics"
		}
	],
	hungry: [
		{
			id: 5,
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
			id: 6,
			name: "Sweet Dreams Desserts",
			category: "Desserts",
			rating: 4.8,
			reviewCount: 156,
			location: "Cafe District",
			image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Artisanal desserts and pastries made fresh daily with premium ingredients.",
			tags: ["Desserts", "Pastries", "Artisanal"],
			featured: false,
			certified: true,
			slug: "sweet-dreams-desserts"
		}
	],
	play: [
		{
			id: 7,
			name: "The Groove Music Venue",
			category: "Music",
			rating: 4.7,
			reviewCount: 278,
			location: "Arts District",
			image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Live music venue featuring local bands and international artists.",
			tags: ["Live Music", "Bands", "Entertainment"],
			featured: true,
			certified: true,
			slug: "the-groove-music-venue"
		},
		{
			id: 8,
			name: "Adventure Zone",
			category: "Recreation",
			rating: 4.6,
			reviewCount: 198,
			location: "Outdoor District",
			image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Outdoor adventure park with zip lines, rock climbing, and team building activities.",
			tags: ["Adventure", "Outdoor", "Team Building"],
			featured: false,
			certified: true,
			slug: "adventure-zone"
		}
	]
};

// Mood navigation with all available moods
const allMoods = [
	{ id: "happy", name: "Happy", icon: "😊", color: "bg-yellow-500" },
	{ id: "shopping", name: "Shopping", icon: "🛍️", color: "bg-blue-500" },
	{ id: "hungry", name: "Hungry", icon: "🍽️", color: "bg-orange-500" },
	{ id: "play", name: "Play", icon: "🎮", color: "bg-green-500" },
	{ id: "relax", name: "Relax", icon: "🧘", color: "bg-purple-500" },
	{ id: "work", name: "Work", icon: "💼", color: "bg-gray-500" },
	{ id: "fix", name: "Fix", icon: "🔧", color: "bg-red-500" }
];

// Section 1: Hero Section with Mood Context
function MoodHeroSection({ mood, config }) {
	const [currentBusiness, setCurrentBusiness] = useState(0);
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentBusiness((prev) => (prev + 1) % businesses.length);
		}, 6000);
		return () => clearInterval(interval);
	}, [businesses.length]);

	const business = businesses[currentBusiness];

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
						{/* Mood indicator */}
						<div className="flex items-center space-x-3 mb-4 animate-fade-in-scale">
							<span className="text-4xl">{config.icon}</span>
							<div>
								<h2 className="text-2xl font-bold text-card-foreground">Feeling {mood.charAt(0).toUpperCase() + mood.slice(1)}?</h2>
								<p className="text-muted-foreground">Discover amazing local experiences</p>
							</div>
						</div>

						{/* Featured business */}
						<div className="mb-6">
							<Badge className="mb-2 bg-primary">
								<Sparkles className="h-3 w-3 mr-1" />
								Featured Discovery
							</Badge>
							<h1 className="text-4xl md:text-6xl font-bold text-card-foreground mb-4 animate-fade-in-up">
								{business.name}
							</h1>
						</div>

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
								Explore {business.name}
							</Button>
							<Button size="lg" variant="outline" className="border-2">
								<Bookmark className="h-4 w-4 mr-2" />
								Save for Later
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// Section 2: Mood Navigation
function MoodNavigationSection({ currentMood }) {
	const moodCategories = [
		{ id: "happy", name: "Happy", icon: Heart, color: "bg-yellow-500" },
		{ id: "hungry", name: "Hungry", icon: Utensils, color: "bg-orange-500" },
		{ id: "shopping", name: "Shopping", icon: ShoppingBag, color: "bg-blue-500" },
		{ id: "play", name: "Play", icon: Users, color: "bg-green-500" },
		{ id: "relax", name: "Relax", icon: Heart, color: "bg-purple-500" },
		{ id: "work", name: "Work", icon: Building2, color: "bg-gray-500" },
		{ id: "fix", name: "Fix", icon: Wrench, color: "bg-red-500" }
	];

	return (
		<section className="py-8 bg-muted/30 border-b border-border">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title="Explore by Mood" 
					subtitle="Find businesses that match how you're feeling"
					link="/discover"
				>
					{moodCategories.map((mood) => (
						<a
							key={mood.id}
							href={'/discover/${mood.id}'}
							className={'flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
								currentMood === mood.id
									? 'bg-primary text-primary-foreground shadow-lg'
									: 'bg-card text-card-foreground hover:bg-muted border border-border`
              }`}
						>
							<div className={`w-6 h-6 ${mood.color} rounded-full flex items-center justify-center`}>
								<mood.icon className="h-3 w-3 text-white" />
							</div>
							<span className="font-medium">{mood.name}</span>
						</a>
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 3: Subcategory Navigation
function SubcategorySection({ config, mood }) {
	const [selectedSub, setSelectedSub] = useState(config.subcategories[0]);

	return (
		<section className="py-12 bg-background">
			<div className="container mx-auto px-4">
				<ScrollSection 
					title={`Explore ${mood.charAt(0).toUpperCase() + mood.slice(1)} Categories`}
					subtitle="Find exactly what you`re looking for"
					link={'/discover/${mood}'}
				>
					{config.subcategories.map((subcategory) => (
						<Card
							key={subcategory}
							className={'cursor-pointer transition-all duration-300 ${
								selectedSub === subcategory ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md`
              }`}
							onClick={() => setSelectedSub(subcategory)}
						>
							<CardContent className="p-6 text-center">
								<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
									<Compass className="h-6 w-6 text-primary" />
								</div>
								<h3 className="font-semibold text-sm">{subcategory}</h3>
							</CardContent>
						</Card>
					))}
				</ScrollSection>

				{/* Selected subcategory content */}
				<div className="text-center">
					<h3 className="text-xl font-semibold mb-2">Discovering {selectedSub}</h3>
					<p className="text-muted-foreground mb-6">Find the best {selectedSub.toLowerCase()} businesses in your area</p>
					<Button className="bg-primary hover:bg-primary/90">
						<Search className="h-4 w-4 mr-2" />
						Browse {selectedSub}
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 4: Featured Businesses
function FeaturedBusinessesSection({ mood }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up" data-section="featured-businesses">
			<ScrollSection 
				title={`Featured ${mood.charAt(0).toUpperCase() + mood.slice(1)} Discoveries`}
				subtitle="Handpicked businesses you`ll love"
				link={`/discover/${mood}/featured`}
			>
				{businesses.map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 5: Interactive Discovery Map
function InteractiveMapSection() {
	const [selectedArea, setSelectedArea] = useState(null);

	const mapAreas = [
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

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-100" data-section="interactive-map">
			<ScrollSection 
				title="Interactive Discovery Map" 
				subtitle="Explore business hotspots and trending areas"
				link="/map"
			>

			<Card className="overflow-hidden">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Business Hotspots</CardTitle>
							<CardDescription>Click on areas to discover local businesses</CardDescription>
						</div>
						<div className="flex items-center space-x-2">
							<Button variant="outline" size="sm">
								<Filter className="h-4 w-4" />
								Filter
							</Button>
							<Button variant="outline" size="sm">
								<Map className="h-4 w-4" />
								Full Map
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="relative h-80 bg-gradient-to-br from-blue-50 to-indigo-100">
						{mapAreas.map((area) => (
							<div
								key={area.id}
								className="absolute cursor-pointer group"
								style={{
									left: `${area.coordinates.x}%',
									top: '${area.coordinates.y}%',
									transform: 'translate(-50%, -50%)'
								}}
								onClick={() => setSelectedArea(area)}
							>
								<div className="relative">
									<div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
									<div className="absolute -top-2 -left-2 w-8 h-8 bg-primary/20 rounded-full animate-ping" />
									
									{/* Tooltip */}
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
										<div className="bg-card border rounded-lg p-3 shadow-lg whitespace-nowrap">
											<h4 className="font-semibold text-sm">{area.name}</h4>
											<p className="text-xs text-muted-foreground">{area.businesses} businesses</p>
											<Badge className="text-xs mt-1">{area.trending}</Badge>
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

			{/* Selected area details */}
			{selectedArea && (
				<div className="mt-8">
					<Card>
						<CardHeader>
							<CardTitle>{selectedArea.name}</CardTitle>
							<CardDescription>{selectedArea.businesses} businesses • {selectedArea.trending} trending</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{selectedArea.highlights.map((highlight) => (
									<Badge key={highlight} variant="secondary">{highlight}</Badge>
								))}
							</div>
							<Button className="mt-4 w-full">
								<MapPin className="h-4 w-4 mr-2" />
								Explore {selectedArea.name}
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
			</ScrollSection>
		</div>
	);
}

// Section 6: Advanced Search
function AdvancedSearchSection({ mood, config }) {
	const [searchQuery, setSearchQuery] = useState(');
	const [location, setLocation] = useState(');
	const [activeFilters, setActiveFilters] = useState([]);

	const quickFilters = [
		{ id: 'open-now', label: 'Open Now', icon: Clock },
		{ id: 'certified', label: 'Certified', icon: CheckCircle },
		{ id: 'trending', label: 'Trending', icon: TrendingUp },
		{ id: 'nearby', label: 'Nearby', icon: Target },
		{ id: 'highly-rated', label: 'Highly Rated`, icon: Star },
	];

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-150" data-section="advanced-search">
			<ScrollSection 
				title={`Find Perfect ${mood.charAt(0).toUpperCase() + mood.slice(1)} Experiences`}
				subtitle="Advanced search with smart filters and location-based discovery"
				link={`/discover/${mood}/search`}
			>

			<Card className="p-6 mb-8">
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
						<Input
							placeholder={`What ${mood} experience are you looking for?`}
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
		</ScrollSection>
		</div>
	);
}

// Section 7: New Discoveries
function NewDiscoveriesSection({ mood }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-200" data-section="new-discoveries">
			<ScrollSection 
				title={`New in ${mood.charAt(0).toUpperCase() + mood.slice(1)}`}
				subtitle="Recently added businesses and experiences"
				link={`/discover/${mood}/new`}
			>
				{businesses.slice().reverse().map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 8: Highly Rated
function HighlyRatedSection({ mood }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-250" data-section="highly-rated">
			<ScrollSection 
				title={`Top Rated ${mood.charAt(0).toUpperCase() + mood.slice(1)}`}
				subtitle="Highest rated businesses and experiences"
				link={`/discover/${mood}/top-rated`}
			>
				{businesses.map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 9: Customer Favorites
function CustomerFavoritesSection({ mood }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-300" data-section="customer-favorites">
			<ScrollSection 
				title="Customer Favorites"
				subtitle="Most loved businesses by our community"
				link={`/discover/${mood}/favorites`}
			>
				{businesses.slice(0, 8).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 10: Trending Businesses
function TrendingBusinessesSection({ mood }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-350" data-section="trending-businesses">
			<ScrollSection 
				title="Trending Now"
				subtitle="Most popular businesses this week"
				link={`/discover/${mood}/trending`}
			>
				{businesses.slice(2, 10).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 11: Call to Action
function CallToActionSection({ mood, config }) {
	return (
		<section className="py-16 bg-primary text-primary-foreground">
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-3xl md:text-4xl font-bold mb-4">
					Ready to Discover Amazing {config.icon} {mood.charAt(0).toUpperCase() + mood.slice(1)} Experiences?
				</h2>
				<p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
					Join thousands of people discovering the best local businesses and experiences in their area.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
						<Search className="h-5 w-5 mr-2" />
						Start Discovering
					</Button>
					<Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
						<Share2 className="h-5 w-5 mr-2" />
						Share with Friends
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 12: Premium Businesses
function PremiumBusinessesSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-400" data-section="premium-businesses">
			<ScrollSection 
				title="Premium Businesses"
				subtitle={`Top-tier ${mood} experiences and services`}
				link={`/discover/${mood}/premium`}
			>
				{businesses.slice(4, 12).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 13: Local Favorites
function LocalFavoritesSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-450" data-section="local-favorites">
			<ScrollSection 
				title="Local Favorites"
				subtitle={`Beloved ${mood} businesses in your community`}
				link={`/discover/${mood}/local-favorites`}
			>
				{businesses.slice(6, 14).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 14: Hidden Gems
function HiddenGemsSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-500" data-section="hidden-gems">
			<ScrollSection 
				title="Hidden Gems"
				subtitle={`Underrated ${mood} businesses worth discovering`}
				link={`/discover/${mood}/hidden-gems`}
			>
				{businesses.slice(8, 16).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 15: Budget-Friendly Options
function BudgetFriendlySection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-550" data-section="budget-friendly">
			<ScrollSection 
				title="Budget-Friendly Options"
				subtitle={`Affordable ${mood} businesses and services`}
				link={`/discover/${mood}/budget-friendly`}
			>
				{businesses.slice(10, 18).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 16: Community Recommendations
function CommunityRecommendationsSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-600" data-section="community-recommendations">
			<ScrollSection 
				title="Community Recommendations"
				subtitle={`Businesses recommended by our ${mood} community`}
				link={`/discover/${mood}/community-recommendations`}
			>
				{businesses.slice(12, 20).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 17: Verified Businesses
function VerifiedBusinessesSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-650" data-section="verified-businesses">
			<ScrollSection 
				title="Verified Businesses"
				subtitle={`Trusted and verified ${mood} businesses`}
				link={`/discover/${mood}/verified`}
			>
				{businesses.slice(14, 22).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

// Section 18: Recently Added
function RecentlyAddedSection({ mood, config }) {
	const businesses = moodBusinesses[mood] || moodBusinesses.happy;

	return (
		<div className="space-y-8 animate-fade-in-up animate-delay-700" data-section="recently-added">
			<ScrollSection 
				title="Recently Added"
				subtitle={`New ${mood} businesses joining our platform'}
				link={'/discover/${mood}/recently-added'}
			>
				{businesses.slice(16, 24).map((business) => (
					<BusinessCard key={business.id} business={business} />
				))}
			</ScrollSection>
		</div>
	);
}

export default function MoodDiscoverClient({ mood, config }) {
	return (
		<>
			<MoodHeroSection mood={mood} config={config} />
			<MoodNavigationSection currentMood={mood} />
			<SubcategorySection config={config} mood={mood} />
			<FeaturedBusinessesSection mood={mood} />
			<InteractiveMapSection />
			<AdvancedSearchSection mood={mood} config={config} />
			<NewDiscoveriesSection mood={mood} />
			<HighlyRatedSection mood={mood} />
			<CustomerFavoritesSection mood={mood} />
			<TrendingBusinessesSection mood={mood} />
			<PremiumBusinessesSection mood={mood} config={config} />
			<LocalFavoritesSection mood={mood} config={config} />
			<HiddenGemsSection mood={mood} config={config} />
			<BudgetFriendlySection mood={mood} config={config} />
			<CommunityRecommendationsSection mood={mood} config={config} />
			<VerifiedBusinessesSection mood={mood} config={config} />
			<RecentlyAddedSection mood={mood} config={config} />
			<CallToActionSection mood={mood} config={config} />
		</>
	);
}
