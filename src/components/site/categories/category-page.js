"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { buildBusinessUrl } from "@utils";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { MapPin, Search, Star, Phone, Navigation, Filter, SortAsc, Grid, List, ChevronDown, ChevronRight, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import BusinessCard from "@components/site/home/business-card";
import Image from "next/image";

const CategoryPage = ({ type, title, subtitle, businesses = [], category, location, requiresLocation = false }) => {
	const [filteredBusinesses, setFilteredBusinesses] = useState(businesses);
	const [userLocation, setUserLocation] = useState("");
	const [showLocationPrompt, setShowLocationPrompt] = useState(requiresLocation);
	const [sortBy, setSortBy] = useState("rating");
	const [viewMode, setViewMode] = useState("grid");
	const [showFilters, setShowFilters] = useState(false);

	const sortOptions = [
		{ value: "rating", label: "Highest Rated" },
		{ value: "reviews", label: "Most Reviews" },
		{ value: "name", label: "Name A-Z" },
		{ value: "price-low", label: "Price: Low to High" },
		{ value: "price-high", label: "Price: High to Low" },
	];

	useEffect(() => {
		let sorted = [...businesses];

		switch (sortBy) {
			case "rating":
				sorted.sort((a, b) => (b.ratings?.overall || 0) - (a.ratings?.overall || 0));
				break;
			case "reviews":
				sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
				break;
			case "name":
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "price-low":
				sorted.sort((a, b) => {
					const priceA = a.price?.length || 0;
					const priceB = b.price?.length || 0;
					return priceA - priceB;
				});
				break;
			case "price-high":
				sorted.sort((a, b) => {
					const priceA = a.price?.length || 0;
					const priceB = b.price?.length || 0;
					return priceB - priceA;
				});
				break;
			default:
				break;
		}

		setFilteredBusinesses(sorted);
	}, [businesses, sortBy]);

	const handleLocationSubmit = () => {
		if (userLocation.trim()) {
			setShowLocationPrompt(false);
			// In a real app, this would filter businesses by location
		}
	};

	const renderStars = (rating) => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />);
	};

	// Better image fallback system
	const getBusinessImage = (business) => {
		// First try business photos
		if (business.photos && business.photos.length > 0) {
			return business.photos[0];
		}
		// Then try logo
		if (business.logo && business.logo !== "https://avatars.githubusercontent.com/u/40980938") {
			return business.logo;
		}
		// Use a business-appropriate unsplash image based on category
		const categoryImages = {
			Restaurants: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop",
			"Home Services": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
			"Health & Medical": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop",
			"Beauty & Spas": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop",
			Automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=200&fit=crop",
			Shopping: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
			"Professional Services": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
			Entertainment: "https://images.unsplash.com/photo-1489599187715-31f2e8cec64c?w=300&h=200&fit=crop",
		};

		const category = business.categories?.[0] || "Professional Services";
		return categoryImages[category] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop";
	};

	const BusinessListCard = ({ business }) => (
		<Link href={buildBusinessUrl({ country: (business.country||'US').toLowerCase(), state: business.state, city: business.city, name: business.name, shortId: business.short_id || business.shortId })} className="block">
			<Card className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50 group">
				<CardContent className="p-6">
					<div className="flex gap-4">
						{/* Business Image */}
						<div className="flex-shrink-0">
							<div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border/50">
								<Image
									src={getBusinessImage(business)}
									alt={business.name}
									width={96}
									height={96}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
									onError={(e) => {
										e.target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=96&h=96&fit=crop";
									}}
								/>
							</div>
						</div>

						{/* Business Info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">{business.name}</h3>
									<div className="flex items-center gap-2 mt-1">
										<div className="flex">{renderStars(business.ratings?.overall || 0)}</div>
										<span className="text-sm font-medium">{business.ratings?.overall?.toFixed(1) || "New"}</span>
										<span className="text-sm text-muted-foreground">({business.reviewCount || 0} reviews)</span>
									</div>
								</div>
								{business.price && (
									<Badge variant="outline" className="ml-4 flex-shrink-0">
										{business.price}
									</Badge>
								)}
							</div>

							<p className="text-sm text-muted-foreground mb-4 line-clamp-2">{business.description}</p>

							<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
								{business.isOpenNow !== undefined && (
									<div className="flex items-center gap-1">
										<div className={`w-2 h-2 rounded-full ${business.isOpenNow ? "bg-success" : "bg-destructive"}`} />
										<span className={business.isOpenNow ? "text-success dark:text-success" : "text-destructive dark:text-destructive"}>{business.isOpenNow ? "Open Now" : "Closed"}</span>
									</div>
								)}

								{business.address && (
									<div className="flex items-center gap-1">
										<MapPin className="w-3 h-3" />
										<span>{business.address.split(",")[0]}</span>
									</div>
								)}

								{business.categories && (
									<Badge variant="secondary" className="text-xs">
										{business.categories[1] || business.categories[0]}
									</Badge>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<Button size="sm" variant="outline" className="h-8">
									<Phone className="w-3 h-3 mr-1" />
									Call
								</Button>
								<Button size="sm" variant="outline" className="h-8">
									<Navigation className="w-3 h-3 mr-1" />
									Directions
								</Button>
								<Button size="sm" className="h-8">
									View Details
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);

	// Location prompt for home services
	if (showLocationPrompt) {
		return (
			<div className="min-h-screen bg-background">
				<div className="px-4 py-16 lg:px-24">
					<div className="max-w-2xl mx-auto text-center">
						<div className="mb-8">
							<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
								<MapPin className="w-10 h-10 text-primary" />
							</div>
							<h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
							<p className="text-lg text-muted-foreground mb-8">To show you the best {category?.toLowerCase()} in your area, we need to know your location.</p>
						</div>

						<div className="space-y-6">
							<div className="relative max-w-md mx-auto">
								<MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input type="text" placeholder="Enter your city, state, or zip code" value={userLocation} onChange={(e) => setUserLocation(e.target.value)} className="pl-12 h-12 text-lg" onKeyPress={(e) => e.key === "Enter" && handleLocationSubmit()} />
								<Button onClick={handleLocationSubmit} disabled={!userLocation.trim()} className="absolute right-2 top-2 h-8">
									Search
								</Button>
							</div>

							<Button variant="outline" onClick={() => setShowLocationPrompt(false)} className="text-sm">
								Skip for now
							</Button>
						</div>

						{/* Popular locations */}
						<div className="mt-12">
							<h3 className="text-lg font-semibold mb-6 text-foreground">Popular Areas</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{["San Francisco", "Los Angeles", "New York", "Chicago", "Austin", "Seattle"].map((city) => (
									<Button
										key={city}
										variant="outline"
										size="sm"
										onClick={() => {
											setUserLocation(city);
											handleLocationSubmit();
										}}
										className="h-10"
									>
										{city}
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section - Matching website style */}
			<div className="relative bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/50">
				<div className="px-4 py-16 lg:px-24">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-foreground mb-4 lg:text-5xl">{title}</h1>
							<p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">{subtitle}</p>
						</div>

						{/* Stats Row */}
						<div className="flex flex-wrap justify-center gap-6 text-sm">
							<div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
								<div className="w-2 h-2 bg-success rounded-full" />
								<span className="font-medium">{filteredBusinesses.filter((b) => b.isOpenNow).length} open now</span>
							</div>
							<div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
								<Building className="w-4 h-4 text-primary" />
								<span className="font-medium">{filteredBusinesses.length} total results</span>
							</div>
							<div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
								<Star className="w-4 h-4 text-warning fill-yellow-500" />
								<span className="font-medium">Verified Reviews</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Controls Bar */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
				<div className="px-4 py-4 lg:px-24">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-foreground">
								{filteredBusinesses.length} result{filteredBusinesses.length !== 1 ? "s" : ""}
							</span>
							{type === "location" && location && (
								<Badge variant="secondary" className="hidden sm:flex">
									<MapPin className="w-3 h-3 mr-1" />
									{location.name}, {location.state}
								</Badge>
							)}
						</div>

						<div className="flex items-center gap-3">
							{/* View Mode Toggle */}
							<div className="hidden sm:flex border border-border rounded-lg p-1">
								<Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 px-3">
									<Grid className="w-4 h-4" />
								</Button>
								<Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 px-3">
									<List className="w-4 h-4" />
								</Button>
							</div>

							{/* Sort Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" className="h-8 px-3">
										<SortAsc className="w-4 h-4 mr-2" />
										<span className="hidden sm:inline">{sortOptions.find((option) => option.value === sortBy)?.label}</span>
										<span className="sm:hidden">Sort</span>
										<ChevronDown className="w-4 h-4 ml-2" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{sortOptions.map((option) => (
										<DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
											{option.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Filter Button */}
							<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 px-3">
								<Filter className="w-4 h-4 mr-2" />
								<span className="hidden sm:inline">Filters</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
			{/* Main Content */}
			<div className="px-4 py-8 lg:px-24">
				{viewMode === "grid" ? (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredBusinesses.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...business,
									image: getBusinessImage(business),
								}}
							/>
						))}
					</div>
				) : (
					<div className="space-y-4 max-w-5xl mx-auto">
						{filteredBusinesses.map((business) => (
							<BusinessListCard key={business.id} business={business} />
						))}
					</div>
				)}

				{/* Empty State */}
				{filteredBusinesses.length === 0 && (
					<div className="text-center py-20">
						<div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
							<Search className="w-10 h-10 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold text-foreground mb-2">No businesses found</h3>
						<p className="text-muted-foreground mb-8 max-w-md mx-auto">Try adjusting your filters or search in a different area.</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button variant="outline" onClick={() => setShowLocationPrompt(true)}>
								<MapPin className="w-4 h-4 mr-2" />
								Change Location
							</Button>
							<Button asChild>
								<Link href="/search">
									<Search className="w-4 h-4 mr-2" />
									Browse All Businesses
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
			{/* Load More */}
			{filteredBusinesses.length > 0 && filteredBusinesses.length >= 20 && (
				<div className="px-4 py-8 text-center lg:px-24">
					<Button variant="outline" size="lg" className="h-12 px-8">
						Load More Results
						<ChevronRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			)}
		</div>
	);
};

export default CategoryPage;

