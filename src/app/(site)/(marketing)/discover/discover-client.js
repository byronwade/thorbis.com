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
	Camera, Calendar, Tag, ExternalLink, Share2, BookOpen, Phone, Mail,
	Menu, X, Bell, User, Settings, Home, Briefcase, ShoppingCart, Gift,
	ChevronDown, Plus, Minus, Sliders, DollarSign, ThumbsUp, MessageCircle, Share
} from "lucide-react";
import { EnhancedBusinessCard } from "@/components/ui/enhanced-business-card";
import { ScrollSection } from "@/components/ui/scroll-section";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

// Featured businesses data
const featuredBusinesses = [
	{
		id: 1,
		name: "Tony's Authentic Pizza",
		category: "Restaurant",
		industry: "Restaurant",
		rating: 4.9,
		reviewCount: 324,
		location: "Downtown District",
		image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Family-owned pizzeria serving authentic Italian cuisine for over 30 years.",
		tags: ["Pizza", "Italian", "Family-Friendly"],
		featured: true,
		certified: true,
		slug: "tonys-authentic-pizza",
		href: "/business/tonys-authentic-pizza",
		priceRange: "$$",
		openNow: true,
		distance: "0.3 mi"
	},
	{
		id: 2,
		name: "Green Thumb Landscaping",
		category: "Home Services",
		industry: "Home Services",
		rating: 4.8,
		reviewCount: 156,
		location: "Suburban Area",
		image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Professional landscaping and garden design services.",
		tags: ["Landscaping", "Garden Design", "Eco-Friendly"],
		featured: false,
		certified: true,
		slug: "green-thumb-landscaping",
		href: "/business/green-thumb-landscaping",
		priceRange: "$$$",
		openNow: true,
		distance: "1.2 mi"
	},
	{
		id: 3,
		name: "Bella's Boutique",
		category: "Retail",
		industry: "Retail",
		rating: 4.7,
		reviewCount: 89,
		location: "Shopping District",
		image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Curated fashion and accessories from local and sustainable brands.",
		tags: ["Fashion", "Sustainable", "Local Brands"],
		featured: false,
		certified: true,
		slug: "bellas-boutique",
		href: "/business/bellas-boutique",
		priceRange: "$$",
		openNow: true,
		distance: "0.8 mi"
	},
	{
		id: 4,
		name: "Serenity Day Spa",
		category: "Health & Wellness",
		industry: "Health & Wellness",
		rating: 4.9,
		reviewCount: 203,
		location: "Uptown",
		image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		description: "Luxury wellness retreat offering massage therapy and holistic treatments.",
		tags: ["Spa", "Wellness", "Luxury"],
		featured: true,
		certified: true,
		slug: "serenity-day-spa",
		href: "/business/serenity-day-spa",
		priceRange: "$$$",
		openNow: true,
		distance: "2.1 mi"
	}
];

// Mood categories
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
		businesses: 8000,
		subcategories: ["Fashion", "Electronics", "Home & Garden", "Gifts", "Artisan"]
	},
	{
		id: "play",
		name: "Play",
		icon: Play,
		color: "bg-green-500",
		description: "Find entertainment",
		businesses: 6000,
		subcategories: ["Bars", "Music", "Events", "Recreation", "Family Fun"]
	},
	{
		id: "relax",
		name: "Relax",
		icon: Shield,
		color: "bg-purple-500",
		description: "Unwind and recharge",
		businesses: 4000,
		subcategories: ["Spa", "Massage", "Yoga", "Meditation", "Wellness"]
	},
	{
		id: "work",
		name: "Work",
		icon: Building2,
		color: "bg-gray-500",
		description: "Professional services",
		businesses: 10000,
		subcategories: ["Legal", "Accounting", "Real Estate", "Consulting", "Coworking"]
	},
	{
		id: "fix",
		name: "Fix",
		icon: Wrench,
		color: "bg-red-500",
		description: "Repair and maintenance",
		businesses: 7000,
		subcategories: ["Plumbing", "Electrical", "Auto Repair", "Home Repair", "Electronics"]
	}
];

// Quick actions
const quickActions = [
	{ id: "nearby", label: "Nearby", icon: MapPin, color: "bg-blue-500" },
	{ id: "trending", label: "Trending", icon: TrendingUp, color: "bg-green-500" },
	{ id: "new", label: "New", icon: Sparkles, color: "bg-purple-500" },
	{ id: "deals", label: "Deals", icon: Tag, color: "bg-orange-500" },
	{ id: "favorites", label: "Favorites", icon: Heart, color: "bg-red-500" },
	{ id: "recent", label: "Recent", icon: Clock, color: "bg-gray-500" }
];

// Deals and offers
const dealsAndOffers = [
	{
		id: 1,
		title: "50% Off First Visit",
		business: "Serenity Day Spa",
		description: "Get 50% off your first massage or facial treatment",
		expires: "3 days left",
		discount: "50%",
		category: "Wellness",
		image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 2,
		title: "Buy 1 Get 1 Free",
		business: "Tony's Authentic Pizza",
		description: "Buy any large pizza, get a medium pizza free",
		expires: "1 day left",
		discount: "BOGO",
		category: "Food",
		image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 3,
		title: "Free Consultation",
		business: "Green Thumb Landscaping",
		description: "Free landscape design consultation for new customers",
		expires: "5 days left",
		discount: "FREE",
		category: "Services",
		image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 4,
		title: "20% Off Everything",
		business: "Bella's Boutique",
		description: "20% off all clothing and accessories",
		expires: "2 days left",
		discount: "20%",
		category: "Shopping",
		image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	}
];

// Events and activities
const eventsAndActivities = [
	{
		id: 1,
		title: "Local Food Festival",
		date: "Tomorrow",
		time: "12:00 PM - 8:00 PM",
		location: "Downtown Square",
		attendees: 250,
		price: "Free",
		category: "Food & Drink",
		image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 2,
		title: "Art Walk",
		date: "This Weekend",
		time: "6:00 PM - 9:00 PM",
		location: "Arts District",
		attendees: 180,
		price: "$15",
		category: "Arts & Culture",
		image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 3,
		title: "Yoga in the Park",
		date: "Every Sunday",
		time: "9:00 AM - 10:00 AM",
		location: "Central Park",
		attendees: 45,
		price: "Free",
		category: "Wellness",
		image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	},
	{
		id: 4,
		title: "Live Music Night",
		date: "Friday",
		time: "8:00 PM - 11:00 PM",
		location: "The Blue Note",
		attendees: 120,
		price: "$25",
		category: "Entertainment",
		image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
	}
];

// Local insights and tips
const localInsights = [
	{
		id: 1,
		title: "Best Coffee Shops for Remote Work",
		author: "Local Guide",
		readTime: "3 min read",
		likes: 156,
		image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		category: "Work & Study"
	},
	{
		id: 2,
		title: "Hidden Gems: Local Artisan Shops",
		author: "Community Member",
		readTime: "5 min read",
		likes: 89,
		image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		category: "Shopping"
	},
	{
		id: 3,
		title: "Weekend Wellness Guide",
		author: "Wellness Expert",
		readTime: "4 min read",
		likes: 203,
		image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		category: "Wellness"
	},
	{
		id: 4,
		title: "Family-Friendly Activities This Month",
		author: "Parent Guide",
		readTime: "6 min read",
		likes: 134,
		image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
		category: "Family"
	}
];


// Quick Actions Component
function QuickActions() {
	const [activeAction, setActiveAction] = useState('nearby');

	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Quick Actions
					</h2>
					<p className="text-muted-foreground text-lg">
						Find what you're looking for faster
					</p>
				</div>
				<div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
					{quickActions.map((action) => (
						<Button
							key={action.id}
							variant={activeAction === action.id ? "default" : "ghost"}
							className="flex flex-col items-center space-y-3 h-auto p-6 hover:bg-muted/50 transition-all duration-200"
							onClick={() => setActiveAction(action.id)}
						>
							<div className={'w-12 h-12 ${action.color} rounded-xl flex items-center justify-center transition-transform duration-200 hover:scale-110'}>
								<action.icon className="h-6 w-6 text-white" />
							</div>
							<span className="text-sm font-medium">{action.label}</span>
						</Button>
					))}
				</div>
			</div>
		</section>
	);
}

// Featured Section Component
function FeaturedSection() {
	const [viewMode, setViewMode] = useState('grid');

	return (
		<section className="py-8 sm:py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between mb-8">
					<div className="flex flex-col space-y-2">
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
							Featured for You
						</h2>
						<p className="text-muted-foreground text-lg">
							Handpicked businesses you'll love
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant={viewMode === 'grid' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('grid')}
						>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('list')}
						>
							<List className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="sm" className="text-primary">
							See all
							<ArrowRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
				<div className={'grid gap-6 sm:gap-8 ${
					viewMode === 'grid' 
						? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
						: 'grid-cols-1`
              }`}>
					{featuredBusinesses.map((business) => (
						<EnhancedBusinessCard key={business.id} business={business} viewMode={viewMode} />
					))}
				</div>
			</div>
		</section>
	);
}

// Mood Categories Component
function MoodCategories() {
	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Browse by Mood
					</h2>
					<p className="text-muted-foreground text-lg">
						Find businesses that match your current needs
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
					{moodCategories.map((mood) => (
						<Button
							key={mood.id}
							variant="ghost"
							className="flex flex-col items-center space-y-4 h-auto p-6 hover:bg-muted/50 transition-all duration-200 group"
						>
							<div className={`w-16 h-16 ${mood.color} rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
								<mood.icon className="h-8 w-8 text-white" />
							</div>
							<div className="text-center">
								<div className="font-semibold text-base">{mood.name}</div>
								<div className="text-sm text-muted-foreground">{mood.businesses.toLocaleString()}</div>
							</div>
						</Button>
					))}
				</div>
			</div>
		</section>
	);
}

// Deals and Offers Section
function DealsAndOffers() {
	return (
		<section className="py-8 sm:py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Deals & Offers
					</h2>
					<p className="text-muted-foreground text-lg">
						Save money with exclusive local deals
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
					{dealsAndOffers.map((deal) => (
						<Card key={deal.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
							<div className="relative">
								<img
									src={deal.image}
									alt={deal.title}
									className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
								/>
								<Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
									{deal.discount}
								</Badge>
								<Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs">
									{deal.expires}
								</Badge>
							</div>
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
									{deal.title}
								</h3>
								<p className="text-sm text-muted-foreground mb-2">{deal.business}</p>
								<p className="text-sm text-muted-foreground mb-4">{deal.description}</p>
								<div className="flex items-center justify-between">
									<Badge variant="secondary" className="text-sm">
										{deal.category}
									</Badge>
									<Button size="sm" variant="outline" className="text-sm">
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

// Events and Activities Section
function EventsAndActivities() {
	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Events & Activities
					</h2>
					<p className="text-muted-foreground text-lg">
						Discover exciting local events and activities
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
					{eventsAndActivities.map((event) => (
						<Card key={event.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
							<div className="relative">
								<img
									src={event.image}
									alt={event.title}
									className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
								/>
								<Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
									{event.price}
								</Badge>
							</div>
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
									{event.title}
								</h3>
								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm text-muted-foreground">
										<Calendar className="h-4 w-4 mr-2" />
										{event.date} • {event.time}
									</div>
									<div className="flex items-center text-sm text-muted-foreground">
										<MapPin className="h-4 w-4 mr-2" />
										{event.location}
									</div>
									<div className="flex items-center text-sm text-muted-foreground">
										<Users className="h-4 w-4 mr-2" />
										{event.attendees} attending
									</div>
								</div>
								<div className="flex items-center justify-between">
									<Badge variant="secondary" className="text-sm">
										{event.category}
									</Badge>
									<Button size="sm" variant="outline" className="text-sm">
										RSVP
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

// Local Insights Section
function LocalInsights() {
	return (
		<section className="py-8 sm:py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Local Insights
					</h2>
					<p className="text-muted-foreground text-lg">
						Discover hidden gems and local recommendations
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
					{localInsights.map((insight) => (
						<Card key={insight.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
							<div className="relative">
								<img
									src={insight.image}
									alt={insight.title}
									className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
								/>
								<Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
									{insight.category}
								</Badge>
							</div>
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
									{insight.title}
								</h3>
								<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
									<span>{insight.author}</span>
									<span>{insight.readTime}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center text-sm text-muted-foreground">
										<ThumbsUp className="h-4 w-4 mr-1" />
										{insight.likes}
									</div>
									<Button size="sm" variant="outline" className="text-sm">
										Read More
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

// Trending Section Component
function TrendingSection() {
	const trendingBusinesses = [
		{
			id: 5,
			name: "Tech Solutions Pro",
			category: "Technology",
			industry: "Technology",
			rating: 4.8,
			reviewCount: 178,
			location: "Tech District",
			image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Professional IT services and technology solutions for businesses.",
			tags: ["IT Services", "Technology", "Business Solutions"],
			featured: false,
			certified: true,
			slug: "tech-solutions-pro",
			href: "/business/tech-solutions-pro"
		},
		{
			id: 6,
			name: "Urban Fitness Studio",
			category: "Fitness",
			industry: "Fitness",
			rating: 4.9,
			reviewCount: 245,
			location: "Downtown",
			image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Modern fitness studio with personal training and group classes.",
			tags: ["Fitness", "Personal Training", "Group Classes"],
			featured: true,
			certified: true,
			slug: "urban-fitness-studio",
			href: "/business/urban-fitness-studio"
		},
		{
			id: 7,
			name: "Creative Design Agency",
			category: "Design",
			industry: "Design",
			rating: 4.7,
			reviewCount: 92,
			location: "Arts District",
			image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Full-service design agency specializing in branding and digital design.",
			tags: ["Design", "Branding", "Digital"],
			featured: false,
			certified: true,
			slug: "creative-design-agency",
			href: "/business/creative-design-agency"
		},
		{
			id: 8,
			name: "Coastal Coffee Roasters",
			category: "Coffee",
			industry: "Coffee",
			rating: 4.8,
			reviewCount: 156,
			location: "Harbor District",
			image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			description: "Artisan coffee roasters with a passion for quality and sustainability.",
			tags: ["Coffee", "Artisan", "Sustainable"],
			featured: false,
			certified: true,
			slug: "coastal-coffee-roasters",
			href: "/business/coastal-coffee-roasters"
		}
	];

	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Trending Now
					</h2>
					<p className="text-muted-foreground text-lg">
						Popular businesses gaining attention
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
					{trendingBusinesses.map((business) => (
						<EnhancedBusinessCard key={business.id} business={business} />
					))}
				</div>
			</div>
		</section>
	);
}

// Categories Grid Component
function CategoriesGrid() {
	const categories = [
		{ id: "restaurants", name: "Restaurants", icon: Utensils, color: "bg-orange-500", count: "2,450" },
		{ id: "shopping", name: "Shopping", icon: ShoppingBag, color: "bg-blue-500", count: "1,890" },
		{ id: "services", name: "Services", icon: Wrench, color: "bg-green-500", count: "3,200" },
		{ id: "entertainment", name: "Entertainment", icon: Play, color: "bg-purple-500", count: "890" },
		{ id: "health", name: "Health & Wellness", icon: Shield, color: "bg-red-500", count: "1,200" },
		{ id: "professional", name: "Professional", icon: Briefcase, color: "bg-gray-500", count: "1,800" }
	];

	return (
		<section className="py-8 sm:py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Popular Categories
					</h2>
					<p className="text-muted-foreground text-lg">
						Browse businesses by category
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
					{categories.map((category) => (
						<Card key={category.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
							<CardContent className="p-6 text-center">
								<div className={'w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-200 group-hover:scale-110'}>
									<category.icon className="h-8 w-8 text-white" />
								</div>
								<h3 className="font-semibold text-base mb-2">{category.name}</h3>
								<p className="text-sm text-muted-foreground">{category.count} businesses</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

// Community Section
function CommunitySection() {
	const communityStats = [
		{ label: "Active Users", value: "12.5K", icon: Users },
		{ label: "Reviews Posted", value: "45.2K", icon: Star },
		{ label: "Photos Shared", value: "23.8K", icon: Camera },
		{ label: "Events Created", value: "1.2K", icon: Calendar }
	];

	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Join Our Community
					</h2>
					<p className="text-muted-foreground text-lg">
						Connect with local businesses and fellow community members
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
					{communityStats.map((stat, index) => (
						<div key={index} className="text-center">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<stat.icon className="h-8 w-8 text-primary" />
							</div>
							<div className="font-bold text-2xl sm:text-3xl mb-2">{stat.value}</div>
							<div className="text-sm text-muted-foreground">{stat.label}</div>
						</div>
					))}
				</div>
				<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
					<Button className="flex items-center space-x-2 px-8 py-4 text-lg">
						<Share2 className="h-5 w-5" />
						<span>Share Your Experience</span>
					</Button>
					<Button variant="outline" className="flex items-center space-x-2 px-8 py-4 text-lg">
						<MessageCircle className="h-5 w-5" />
						<span>Join Discussion</span>
					</Button>
				</div>
			</div>
		</section>
	);
}

// Personalized Recommendations Section
function PersonalizedRecommendations() {
	const recommendations = [
		{
			id: 1,
			title: "Based on your location",
			businesses: [
				{
					id: 9,
					name: "Downtown Coffee Co.",
					category: "Coffee",
					industry: "Coffee",
					rating: 4.6,
					reviewCount: 89,
					location: "0.2 mi away",
					image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
					reason: "Near your home",
					href: "/business/downtown-coffee-co"
				},
				{
					id: 10,
					name: "Quick Fix Auto",
					category: "Auto Repair",
					industry: "Auto Repair",
					rating: 4.8,
					reviewCount: 156,
					location: "0.5 mi away",
					image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
					reason: "Highly rated nearby",
					href: "/business/quick-fix-auto"
				}
			]
		},
		{
			id: 2,
			title: "Based on your preferences",
			businesses: [
				{
					id: 11,
					name: "Zen Yoga Studio",
					category: "Wellness",
					industry: "Wellness",
					rating: 4.9,
					reviewCount: 203,
					location: "1.1 mi away",
					image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
					reason: "Similar to places you like",
					href: "/business/zen-yoga-studio"
				},
				{
					id: 12,
					name: "Artisan Bakery",
					category: "Food",
					industry: "Food",
					rating: 4.7,
					reviewCount: 134,
					location: "0.8 mi away",
					image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
					reason: "Matches your taste",
					href: "/business/artisan-bakery"
				}
			]
		}
	];

	return (
		<section className="py-8 sm:py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Recommended for You
					</h2>
					<p className="text-muted-foreground text-lg">
						Personalized suggestions based on your preferences
					</p>
				</div>
				<div className="space-y-8 sm:space-y-12">
					{recommendations.map((category) => (
						<div key={category.id}>
							<h3 className="text-xl font-semibold text-muted-foreground mb-6">{category.title}</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
								{category.businesses.map((business) => (
									<Card key={business.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
										<div className="flex">
											<div className="w-32 h-32 flex-shrink-0">
												<img
													src={business.image}
													alt={business.name}
													className="w-full h-full object-cover rounded-l-lg transition-transform duration-200 group-hover:scale-105"
												/>
											</div>
											<div className="flex-1 p-6">
												<div className="flex items-start justify-between mb-3">
													<h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
														{business.name}
													</h4>
													<Badge variant="secondary" className="text-sm">
														{business.reason}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground mb-3">{business.category}</p>
												<div className="flex items-center space-x-6 text-sm text-muted-foreground">
													<div className="flex items-center">
														<Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
														{business.rating} ({business.reviewCount})
													</div>
													<div className="flex items-center">
														<MapPin className="h-4 w-4 mr-1" />
														{business.location}
													</div>
												</div>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// Enhanced Business Stats Section
function BusinessStats() {
	const stats = [
		{
			label: "Total Businesses",
			value: "15,432",
			change: "+12%",
			trend: "up",
			icon: Building2
		},
		{
			label: "New This Month",
			value: "234",
			change: "+8%",
			trend: "up",
			icon: Sparkles
		},
		{
			label: "Average Rating",
			value: "4.6",
			change: "+0.2",
			trend: "up",
			icon: Star
		},
		{
			label: "Active Users",
			value: "8.9K",
			change: "+15%",
			trend: "up",
			icon: Users
		}
	];

	return (
		<section className="py-8 sm:py-12 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
						Platform Statistics
					</h2>
					<p className="text-muted-foreground text-lg">
						See how our community is growing
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
					{stats.map((stat, index) => (
						<Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
									<p className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</p>
									<div className="flex items-center text-sm">
										<TrendingUp className={'h-4 w-4 mr-1 ${
											stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }'} />
										<span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
											{stat.change}
										</span>
									</div>
								</div>
								<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
									<stat.icon className="h-6 w-6 text-primary" />
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}


// Enhanced Bottom Navigation Component
function BottomNavigation() {
	const [activeTab, setActiveTab] = useState('discover');

	const tabs = [
		{ id: 'discover', label: 'Discover', icon: Compass },
		{ id: 'search', label: 'Search', icon: Search },
		{ id: 'favorites', label: 'Favorites', icon: Heart },
		{ id: 'profile', label: 'Profile', icon: User }
	];

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
			<div className="flex items-center justify-around h-16">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant="ghost"
						size="sm"
						className={'flex flex-col items-center space-y-1 h-auto p-2 ${
							activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }'}
						onClick={() => setActiveTab(tab.id)}
					>
						<tab.icon className="h-5 w-5" />
						<span className="text-xs">{tab.label}</span>
					</Button>
				))}
			</div>
		</nav>
	);
}

export default function DiscoverClient() {
	return (
		<div className="min-h-screen bg-neutral-950">
			<MarketingHeader />
			
			<main className="pb-16 md:pb-0">
				<QuickActions />
				<BusinessStats />
				<FeaturedSection />
				<MoodCategories />
				<PersonalizedRecommendations />
				<DealsAndOffers />
				<EventsAndActivities />
				<TrendingSection />
				<LocalInsights />
				<CategoriesGrid />
				<CommunitySection />
			</main>

			<MarketingFooter />
			<BottomNavigation />
		</div>
	);
}
