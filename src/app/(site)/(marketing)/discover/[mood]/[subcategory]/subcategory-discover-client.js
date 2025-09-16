"use client";

import React, { useState, useEffect } from "react";
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
	Calendar, Phone, Mail, ExternalLink, Share2, Heart as HeartIcon,
	ArrowLeft, Tag, Users2, Clock3, MapPin as MapPinIcon, Star as StarIcon
} from "lucide-react";
import BusinessCard from "@/components/site/home/business-card";
import ScrollSection from "@/components/site/home/scroll-section";
import EnhancedLocationSelector from "@/components/shared/enhanced-location-selector";

// Sample business data for subcategories
const subcategoryBusinesses = {
	happy: {
		entertainment: [
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
				name: "Laugh Factory Comedy Club",
				category: "Entertainment",
				rating: 4.7,
				reviewCount: 234,
				location: "Arts District",
				image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
				description: "Premier comedy club featuring local and national comedians.",
				tags: ["Comedy", "Live Shows", "Entertainment"],
				featured: false,
				certified: true,
				slug: "laugh-factory-comedy-club"
			}
		],
		wellness: [
			{
				id: 3,
				name: "Sunshine Wellness Spa",
				category: "Wellness",
				rating: 4.8,
				reviewCount: 234,
				location: "Uptown",
				image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
				description: "Holistic wellness center promoting happiness and positive energy.",
				tags: ["Spa", "Wellness", "Positive Vibes"],
				featured: true,
				certified: true,
				slug: "sunshine-wellness-spa"
			}
		]
	},
	shopping: {
		fashion: [
			{
				id: 4,
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
			}
		],
		electronics: [
			{
				id: 5,
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
		]
	},
	hungry: {
		"quick-bites": [
			{
				id: 6,
				name: "Quick Bite Express",
				category: "Quick Bites",
				rating: 4.5,
				reviewCount: 567,
				location: "Downtown District",
				image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
				description: "Fast, delicious food options for busy professionals and families.",
				tags: ["Quick Food", "Fast Casual", "Convenient"],
				featured: true,
				certified: true,
				slug: "quick-bite-express"
			}
		],
		"fine-dining": [
			{
				id: 7,
				name: "Tony's Authentic Pizza",
				category: "Fine Dining",
				rating: 4.9,
				reviewCount: 324,
				location: "Downtown District",
				image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
				description: "Family-owned pizzeria serving authentic Italian cuisine for over 30 years.",
				tags: ["Pizza", "Italian", "Family-Friendly"],
				featured: true,
				certified: true,
				slug: "tonys-authentic-pizza"
			}
		]
	},
	play: {
		bars: [
			{
				id: 8,
				name: "The Groove Music Venue",
				category: "Bars",
				rating: 4.7,
				reviewCount: 278,
				location: "Arts District",
				image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
				description: "Live music venue featuring local bands and international artists.",
				tags: ["Live Music", "Bands", "Entertainment"],
				featured: true,
				certified: true,
				slug: "the-groove-music-venue"
			}
		]
	}
};

// Section 1: Subcategory Hero Section
function SubcategoryHeroSection({ mood, subcategory, config }) {
	const businesses = subcategoryBusinesses[mood]?.[subcategory] || subcategoryBusinesses.happy.entertainment;
	const featuredBusiness = businesses[0];

	return (
		<section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-background">
			{/* Hero background image */}
			<div className="absolute inset-0">
				<img
					src={featuredBusiness.image}
					alt={featuredBusiness.name}
					className="object-cover w-full h-full"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 md:to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
			</div>

			{/* Content overlay */}
			<div className="relative z-10 h-full flex items-center">
				<div className="px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
					<div className="max-w-full md:max-w-2xl">
						{/* Breadcrumb navigation */}
						<div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
							<a href="/discover" className="hover:text-primary transition-colors">Discover</a>
							<ArrowRight className="h-3 w-3" />
							<a href={'/discover/${mood}'} className="hover:text-primary transition-colors capitalize">{mood}</a>
							<ArrowRight className="h-3 w-3" />
							<span className="text-foreground capitalize">{subcategory.replace('-', ' ')}</span>
						</div>

						{/* Subcategory header */}
						<div className="flex items-center space-x-3 mb-4">
							<span className="text-4xl">{config.icon}</span>
							<div>
								<h1 className="text-3xl md:text-5xl font-bold text-card-foreground mb-2">
									{config.icon} {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
								</h1>
								<p className="text-lg text-muted-foreground">{config.businesses.toLocaleString()}+ businesses</p>
							</div>
						</div>

						{/* Description */}
						<p className="text-lg text-muted-foreground mb-8 max-w-xl">
							{config.description}
						</p>

						{/* Action buttons */}
						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" className="bg-primary hover:bg-primary/90">
								<Search className="h-4 w-4 mr-2" />
								Explore {subcategory.replace('-', ' ')}
							</Button>
							<Button size="lg" variant="outline" className="border-2">
								<MapPin className="h-4 w-4 mr-2" />
								View on Map
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// Section 2: Subcategory Navigation
function SubcategoryNavigationSection({ mood, subcategory, config }) {
	const moodConfig = {
		happy: ["entertainment", "wellness", "social", "creative", "outdoor"],
		shopping: ["fashion", "electronics", "home-garden", "gifts", "artisan"],
		hungry: ["quick-bites", "fine-dining", "street-food", "desserts", "beverages"],
		play: ["bars", "music", "events", "recreation", "family-fun"]
	};

	const subcategories = moodConfig[mood] || [];

	return (
		<section className="py-8 bg-muted/30 border-b border-border">
			<div className="container mx-auto px-4">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold mb-2">Explore {mood.charAt(0).toUpperCase() + mood.slice(1)} Categories</h2>
					<p className="text-muted-foreground">Find exactly what you`re looking for</p>
				</div>

				<div className="flex flex-wrap justify-center gap-3">
					{subcategories.map((sub) => (
						<a
							key={sub}
							href={'/discover/${mood}/${sub}'}
							className={'flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
								subcategory === sub
									? 'bg-primary text-primary-foreground shadow-lg'
									: 'bg-card text-card-foreground hover:bg-muted border border-border'
              }'}
						>
							<span className="text-lg">{config.icon}</span>
							<span className="font-medium capitalize">{sub.replace('-', ' ')}</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

// Section 3: Featured Businesses
function FeaturedBusinessesSection({ mood, subcategory, config }) {
	const businesses = subcategoryBusinesses[mood]?.[subcategory] || subcategoryBusinesses.happy.entertainment;

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">Featured {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
						<p className="text-muted-foreground">Handpicked businesses you'll love</p>
					</div>
					<Button variant="outline">
						View All <ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>

				<ScrollSection title="Trending Now" link={'/discover/${mood}/${subcategory}/trending'}>
					{businesses.map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 4: Advanced Search
function AdvancedSearchSection({ mood, subcategory, config }) {
	const [searchQuery, setSearchQuery] = useState(');
	const [location, setLocation] = useState(');
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
						<h2 className="text-3xl font-bold mb-4">Find Perfect {config.icon} {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
						<p className="text-muted-foreground">Advanced search with smart filters and location-based discovery</p>
					</div>

					<Card className="p-6 mb-8">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
								<Input
									placeholder={'What ${subcategory.replace('-', ' ')} are you looking for?'}
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
				</div>
			</div>
		</section>
	);
}

// Section 5: Business Categories
function BusinessCategoriesSection({ mood, subcategory, config }) {
	const categories = [
		{ name: "Popular", count: 150, icon: StarIcon },
		{ name: "New", count: 45, icon: Sparkles },
		{ name: "Trending", count: 89, icon: TrendingUp },
		{ name: "Certified", count: 234, icon: CheckCircle },
		{ name: "Nearby", count: 67, icon: MapPinIcon },
		{ name: "Highly Rated", count: 123, icon: StarIcon }
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
					<p className="text-muted-foreground">Find the perfect {subcategory.replace('-', ' ')} experience</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
					{categories.map((category) => (
						<Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardContent className="p-6 text-center">
								<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
									<category.icon className="h-6 w-6 text-primary" />
								</div>
								<h3 className="font-semibold mb-1">{category.name}</h3>
								<p className="text-sm text-muted-foreground">{category.count}+</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

// Section 6: Interactive Map
function InteractiveMapSection({ mood, subcategory }) {
	const [selectedArea, setSelectedArea] = useState(null);

	const mapAreas = [
		{
			id: 1,
			name: "Downtown Core",
			businesses: 234,
			trending: "+23%",
			highlights: ["Popular", "Trending", "Certified"],
			coordinates: { x: 25, y: 30 }
		},
		{
			id: 2,
			name: "Arts District",
			businesses: 156,
			trending: "+18%",
			highlights: ["New", "Creative", "Trending"],
			coordinates: { x: 70, y: 45 }
		},
		{
			id: 3,
			name: "Tech Hub",
			businesses: 89,
			trending: "+35%",
			highlights: ["Innovative", "Modern", "Popular"],
			coordinates: { x: 45, y: 70 }
		}
	];

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Interactive Discovery Map</h2>
					<p className="text-muted-foreground">Explore {subcategory.replace('-', ' ')} hotspots and trending areas</p>
				</div>

				<Card className="overflow-hidden">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>{subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' `)} Hotspots</CardTitle>
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
			</div>
		</section>
	);
}

// Section 7: New Discoveries
function NewDiscoveriesSection({ mood, subcategory, config }) {
	const businesses = subcategoryBusinesses[mood]?.[subcategory] || subcategoryBusinesses.happy.entertainment;

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">New in {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
						<p className="text-muted-foreground">Recently added businesses and experiences</p>
					</div>
					<Button variant="outline">
						View All <ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>

				<ScrollSection title="Fresh Discoveries" link={'/discover/${mood}/${subcategory}/new'} category="New">
					{businesses.slice().reverse().map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 8: Highly Rated
function HighlyRatedSection({ mood, subcategory, config }) {
	const businesses = subcategoryBusinesses[mood]?.[subcategory] || subcategoryBusinesses.happy.entertainment;

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">Top Rated {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' `)}</h2>
						<p className="text-muted-foreground">Highest rated businesses and experiences</p>
					</div>
					<Button variant="outline">
						View All <ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>

				<ScrollSection title="Excellence Award Winners" link={'/discover/${mood}/${subcategory}/top-rated'} category="Excellence">
					{businesses.map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</ScrollSection>
			</div>
		</section>
	);
}

// Section 9: User Reviews
function ReviewsSection({ mood, subcategory }) {
	const reviews = [
		{
			id: 1,
			user: "Sarah M.",
			rating: 5,
			comment: 'Amazing ${subcategory.replace('-', ' ')} experience! Found exactly what I was looking for.',
			business: "Featured Business",
			date: "2 days ago"
		},
		{
			id: 2,
			user: "Mike R.",
			rating: 5,
			comment: 'Great ${subcategory.replace('-', ' ')} discovery platform. Highly recommend!',
			business: "Local Favorite",
			date: "1 week ago"
		},
		{
			id: 3,
			user: "Lisa K.",
			rating: 4,
			comment: 'Perfect for finding new ${subcategory.replace('-', ' ')} places to explore.',
			business: "Hidden Gem",
			date: "3 days ago"
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
					<p className="text-muted-foreground">Real reviews from real customers</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{reviews.map((review) => (
						<Card key={review.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center space-x-1 mb-3">
									{Array.from({ length: review.rating }).map((_, i) => (
										<Star key={i} className="h-4 w-4 text-warning fill-current" />
									))}
								</div>
								<p className="text-muted-foreground mb-4">"{review.comment}"</p>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-semibold">{review.user}</p>
										<p className="text-sm text-muted-foreground">{review.business}</p>
									</div>
									<span className="text-sm text-muted-foreground">{review.date}</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="text-center mt-8">
					<Button variant="outline">
						<HeartIcon className="h-4 w-4 mr-2" />
						Share Your Experience
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 10: Related Subcategories
function RelatedSubcategoriesSection({ mood, subcategory, config }) {
	const moodConfig = {
		happy: ["entertainment", "wellness", "social", "creative", "outdoor"],
		shopping: ["fashion", "electronics", "home-garden", "gifts", "artisan"],
		hungry: ["quick-bites", "fine-dining", "street-food", "desserts", "beverages"],
		play: ["bars", "music", "events", "recreation", "family-fun"]
	};

	const subcategories = moodConfig[mood] || [];
	const relatedSubs = subcategories.filter(sub => sub !== subcategory).slice(0, 3);

	return (
		<section className="py-16 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Explore Related Categories</h2>
					<p className="text-muted-foreground">Discover other amazing {mood} experiences</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{relatedSubs.map((sub) => (
						<a
							key={sub}
							href={'/discover/${mood}/${sub}'}
							className="group"
						>
							<Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105">
								<CardContent className="p-8 text-center">
									<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
										<span className="text-3xl">{config.icon}</span>
									</div>
									<h3 className="text-xl font-semibold mb-2 capitalize">{sub.replace('-', ' ')}</h3>
									<p className="text-muted-foreground mb-4">Discover amazing {sub.replace('-', ' ')} experiences</p>
									<Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
										<ArrowRight className="h-4 w-4 mr-2" />
										Explore {sub.replace('-', ' ')}
									</Button>
								</CardContent>
							</Card>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

// Section 11: Call to Action
function CallToActionSection({ mood, subcategory, config }) {
	return (
		<section className="py-16 bg-primary text-primary-foreground">
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-3xl md:text-4xl font-bold mb-4">
					Ready to Discover Amazing {config.icon} {subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}?
				</h2>
				<p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
					Join thousands of people discovering the best {subcategory.replace('-', ' ')} experiences in their area.
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

// Section 12: Expert Tips & Insights
function ExpertTipsSection({ mood, subcategory, config }) {
	const expertTips = [
		{
			id: 1,
			expert: "Sarah Johnson",
			title: "Local Business Expert",
			avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			tip: 'When exploring ${subcategory.replace('-', ' ')} options, always check for seasonal promotions and local events that might offer unique experiences.`,
			rating: 4.9,
			verified: true
		},
		{
			id: 2,
			expert: "Mike Chen",
			title: "Consumer Advocate",
			avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			tip: 'Look for businesses with strong community engagement and local partnerships - they often provide the most authentic experiences.',
			rating: 4.8,
			verified: true
		},
		{
			id: 3,
			expert: "Lisa Rodriguez",
			title: "Lifestyle Blogger",
			avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
			tip: 'Don't just focus on ratings - read recent reviews to understand current service quality and any recent changes.',
			rating: 4.7,
			verified: true
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Expert Tips & Insights</h2>
					<p className="text-muted-foreground">Professional advice for finding the best {subcategory.replace('-', ' ')} experiences</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{expertTips.map((tip) => (
						<Card key={tip.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center space-x-3 mb-4">
									<img
										src={tip.avatar}
										alt={tip.expert}
										className="w-12 h-12 rounded-full object-cover"
									/>
									<div>
										<h4 className="font-semibold">{tip.expert}</h4>
										<p className="text-sm text-muted-foreground">{tip.title}</p>
									</div>
									{tip.verified && (
										<Badge className="bg-success">
											<CheckCircle className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground mb-4">"{tip.tip}"</p>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-1">
										<Star className="h-4 w-4 text-warning fill-current" />
										<span className="text-sm font-semibold">{tip.rating}</span>
									</div>
									<Button variant="outline" size="sm">
										<BookOpen className="h-4 w-4 mr-2" />
										Read More
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="text-center mt-8">
					<Button variant="outline">
						<BookOpen className="h-4 w-4 mr-2" />
						View All Expert Tips
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 13: Multimedia Content
function MultimediaContentSection({ mood, subcategory, config }) {
	const multimediaContent = [
		{
			id: 1,
			type: "video",
			title: "Ultimate Guide to {subcategory.replace('-', ' ')}",
			thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			duration: "5:23",
			views: "12.5K",
			author: "Local Guide"
		},
		{
			id: 2,
			type: "gallery",
			title: "Best {subcategory.replace('-', ' ')} Spots",
			thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			images: 24,
			author: "Photo Journal"
		},
		{
			id: 3,
			type: "podcast",
			title: "{subcategory.replace('-', ' ')} Insider Tips",
			thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			duration: "32:15",
			author: "Local Podcast"
		}
	];

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Multimedia Content</h2>
					<p className="text-muted-foreground">Videos, photos, and podcasts about {subcategory.replace('-', ' ')}</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{multimediaContent.map((content) => (
						<Card key={content.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
										<div className="absolute bottom-2 right-2 bg-neutral-950/70 text-white px-2 py-1 rounded text-sm">
											{content.duration}
										</div>
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
				</div>

				<div className="text-center mt-8">
					<Button variant="outline">
						<Camera className="h-4 w-4 mr-2" />
						Browse All Content
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 14: Upcoming Events
function UpcomingEventsSection({ mood, subcategory, config }) {
	const events = [
		{
			id: 1,
			title: '${subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Festival',
			date: "2024-02-15",
			time: "6:00 PM",
			location: "Downtown Plaza",
			image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 234,
			price: "Free",
			featured: true
		},
		{
			id: 2,
			title: '${subcategory.replace('-', ' ')} Workshop',
			date: "2024-02-20",
			time: "2:00 PM",
			location: "Community Center",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 45,
			price: "$25",
			featured: false
		},
		{
			id: 3,
			title: '${subcategory.replace('-', ' ')} Meetup',
			date: "2024-02-25",
			time: "7:30 PM",
			location: "Local Cafe",
			image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			attendees: 67,
			price: "$10",
			featured: false
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
						<p className="text-muted-foreground">Don't miss these {subcategory.replace('-', ' ')} events</p>
					</div>
					<Button variant="outline">
						<Calendar className="h-4 w-4 mr-2" />
						View All Events
					</Button>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
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
											<span>{event.attendees} attending</span>
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
				</div>
			</div>
		</section>
	);
}

// Section 15: Special Offers & Deals
function SpecialOffersSection({ mood, subcategory, config }) {
	const offers = [
		{
			id: 1,
			title: "20% Off First Visit",
			business: "Featured Business",
			description: "New customers get 20% off their first {subcategory.replace('-', ' ')} experience",
			expires: "2024-03-01",
			code: "WELCOME20",
			discount: "20%",
			featured: true
		},
		{
			id: 2,
			title: "Buy One Get One Free",
			business: "Local Favorite",
			description: "Purchase any {subcategory.replace('-', ' ')} service and get another free",
			expires: "2024-02-28",
			code: "BOGO2024",
			discount: "BOGO",
			featured: false
		},
		{
			id: 3,
			title: "Weekend Special",
			business: "Popular Choice",
			description: "Weekend {subcategory.replace('-', ' ')} experiences at reduced rates",
			expires: "2024-02-25",
			code: "WEEKEND",
			discount: "15%",
			featured: false
		}
	];

	return (
		<section className="py-16 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold mb-2">Special Offers & Deals</h2>
						<p className="text-muted-foreground">Exclusive discounts on {subcategory.replace('-', ' ')} experiences</p>
					</div>
					<Button variant="outline">
						<Tag className="h-4 w-4 mr-2" />
						View All Deals
					</Button>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{offers.map((offer) => (
						<Card key={offer.id} className={'hover:shadow-lg transition-shadow ${offer.featured ? 'ring-2 ring-primary' : '
              }'}>
							<CardContent className="p-6">
								{offer.featured && (
									<Badge className="mb-3 bg-primary">
										<Sparkles className="h-3 w-3 mr-1" />
										Featured Offer
									</Badge>
								)}
								<div className="text-center mb-4">
									<div className="text-3xl font-bold text-primary mb-2">{offer.discount}</div>
									<h4 className="font-semibold mb-1">{offer.title}</h4>
									<p className="text-sm text-muted-foreground">{offer.business}</p>
								</div>
								<p className="text-muted-foreground mb-4 text-center">{offer.description}</p>
								<div className="space-y-3">
									<div className="bg-muted p-3 rounded-lg">
										<div className="text-sm font-semibold mb-1">Promo Code</div>
										<div className="font-mono text-lg">{offer.code}</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Expires:</span>
										<span className="font-semibold">{new Date(offer.expires).toLocaleDateString()}</span>
									</div>
									<Button className="w-full">
										<Tag className="h-4 w-4 mr-2" />
										Claim Offer
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

// Section 16: Social Media Integration
function SocialMediaSection({ mood, subcategory, config }) {
	const socialPosts = [
		{
			id: 1,
			platform: "Instagram",
			username: "@localguide",
			content: "Amazing {subcategory.replace('-', ' ')} experience today! 🌟",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			likes: 234,
			comments: 45,
			timeAgo: "2h ago"
		},
		{
			id: 2,
			platform: "Twitter",
			username: "@cityexplorer",
			content: "Just discovered the best {subcategory.replace('-', ' ')} spot in town! Highly recommend checking it out.",
			image: null,
			likes: 89,
			comments: 12,
			timeAgo: "4h ago"
		},
		{
			id: 3,
			platform: "TikTok",
			username: "@lifestylevlogger",
			content: "Hidden gem alert! This {subcategory.replace('-', ' ')} place is incredible ✨",
			image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
			likes: 567,
			comments: 78,
			timeAgo: "6h ago"
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Social Media Buzz</h2>
					<p className="text-muted-foreground">What people are saying about {subcategory.replace('-', ' ')} on social media</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{socialPosts.map((post) => (
						<Card key={post.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center space-x-3 mb-4">
									<div className={'w-8 h-8 rounded-full flex items-center justify-center ${
										post.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
										post.platform === 'Twitter' ? 'bg-blue-500' : 'bg-neutral-950'
              }'}>
										<span className="text-white text-sm font-bold">
											{post.platform === 'Instagram' ? 'IG' : post.platform === 'Twitter' ? 'TW' : 'TT'}
										</span>
									</div>
									<div>
										<div className="font-semibold">{post.username}</div>
										<div className="text-sm text-muted-foreground">{post.timeAgo}</div>
									</div>
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
										<span>❤️ {post.likes}</span>
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
				</div>

				<div className="text-center mt-8">
					<Button variant="outline">
						<Share2 className="h-4 w-4 mr-2" />
						Follow Us for More
					</Button>
				</div>
			</div>
		</section>
	);
}

// Section 17: Contact Information & Business Directory
function ContactDirectorySection({ mood, subcategory, config }) {
	const contactInfo = [
		{
			id: 1,
			business: "Featured Business",
			phone: "(555) 123-4567",
			email: "info@featuredbusiness.com",
			website: "www.featuredbusiness.com",
			address: "123 Main St, Downtown",
			hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
			verified: true
		},
		{
			id: 2,
			business: "Local Favorite",
			phone: "(555) 987-6543",
			email: "hello@localfavorite.com",
			website: "www.localfavorite.com",
			address: "456 Oak Ave, Uptown",
			hours: "Daily: 8AM-8PM",
			verified: true
		},
		{
			id: 3,
			business: "Popular Choice",
			phone: "(555) 456-7890",
			email: "contact@popularchoice.com",
			website: "www.popularchoice.com",
			address: "789 Pine St, Arts District",
			hours: "Tue-Sun: 11AM-9PM",
			verified: false
		}
	];

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Contact Information</h2>
					<p className="text-muted-foreground">Get in touch with top {subcategory.replace('-', ' `)} businesses</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{contactInfo.map((info) => (
						<Card key={info.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="font-semibold">{info.business}</h4>
									{info.verified && (
										<Badge className="bg-success">
											<CheckCircle className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>
								
								<div className="space-y-3">
									<div className="flex items-center space-x-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<a href={`tel:${info.phone}`} className="text-primary hover:underline">{info.phone}</a>
									</div>
									<div className="flex items-center space-x-3">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<a href={`mailto:${info.email}`} className="text-primary hover:underline">{info.email}</a>
									</div>
									<div className="flex items-center space-x-3">
										<ExternalLink className="h-4 w-4 text-muted-foreground" />
										<a href={'https://${info.website}'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{info.website}</a>
									</div>
									<div className="flex items-start space-x-3">
										<MapPin className="h-4 w-4 text-muted-foreground mt-1" />
										<span>{info.address}</span>
									</div>
									<div className="flex items-center space-x-3">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>{info.hours}</span>
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
				</div>
			</div>
		</section>
	);
}

// Section 18: Enhanced SEO Content
function SEOContentSection({ mood, subcategory, config }) {
	const seoContent = [
		{
			id: 1,
			title: 'Best ${subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} in Your Area',
			content: 'Discover the top-rated ${subcategory.replace('-', ' ')} businesses and services in your local area. Our comprehensive guide helps you find the perfect ${subcategory.replace('-', ' ')} experience with detailed reviews, ratings, and insider tips.',
			keywords: ['${subcategory.replace('-', ' ')} near me', 'best ${subcategory.replace('-', ' ')}', 'local ${subcategory.replace('-', ' ')}'],
			readTime: "3 min read"
		},
		{
			id: 2,
			title: '${subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Guide: What to Look For',
			content: 'When choosing a ${subcategory.replace('-', ' ')} service, consider factors like experience, customer reviews, pricing, and location. Our expert guide walks you through the selection process to ensure you make the best choice.',
			keywords: ['${subcategory.replace('-', ' ')} guide', 'how to choose ${subcategory.replace('-', ' ')}', '${subcategory.replace('-', ' ')} tips'],
			readTime: "5 min read"
		},
		{
			id: 3,
			title: 'Why Local ${subcategory.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Matter',
			content: 'Supporting local ${subcategory.replace('-', ' ')} businesses strengthens your community and ensures personalized service. Learn about the benefits of choosing local providers and how they contribute to your area's economy.',
			keywords: ['local ${subcategory.replace('-', ' ')}', 'community ${subcategory.replace('-', ' ')}', 'support local'],
			readTime: "4 min read"
		}
	];

	return (
		<section className="py-16 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Helpful Resources</h2>
					<p className="text-muted-foreground">Expert guides and tips for {subcategory.replace('-', ' ')}</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{seoContent.map((article) => (
						<Card key={article.id} className="hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
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
				</div>

				<div className="text-center mt-8">
					<Button variant="outline">
						<BookOpen className="h-4 w-4 mr-2" />
						Browse All Articles
					</Button>
				</div>
			</div>
		</section>
	);
}

export default function SubcategoryDiscoverClient({ mood, subcategory, config }) {
	return (
		<>
			<SubcategoryHeroSection mood={mood} subcategory={subcategory} config={config} />
			<SubcategoryNavigationSection mood={mood} subcategory={subcategory} config={config} />
			<FeaturedBusinessesSection mood={mood} subcategory={subcategory} config={config} />
			<AdvancedSearchSection mood={mood} subcategory={subcategory} config={config} />
			<BusinessCategoriesSection mood={mood} subcategory={subcategory} config={config} />
			<InteractiveMapSection mood={mood} subcategory={subcategory} />
			<NewDiscoveriesSection mood={mood} subcategory={subcategory} config={config} />
			<HighlyRatedSection mood={mood} subcategory={subcategory} config={config} />
			<ReviewsSection mood={mood} subcategory={subcategory} />
			<RelatedSubcategoriesSection mood={mood} subcategory={subcategory} config={config} />
			<ExpertTipsSection mood={mood} subcategory={subcategory} config={config} />
			<MultimediaContentSection mood={mood} subcategory={subcategory} config={config} />
			<UpcomingEventsSection mood={mood} subcategory={subcategory} config={config} />
			<SpecialOffersSection mood={mood} subcategory={subcategory} config={config} />
			<SocialMediaSection mood={mood} subcategory={subcategory} config={config} />
			<ContactDirectorySection mood={mood} subcategory={subcategory} config={config} />
			<SEOContentSection mood={mood} subcategory={subcategory} config={config} />
			<CallToActionSection mood={mood} subcategory={subcategory} config={config} />
		</>
	);
}
