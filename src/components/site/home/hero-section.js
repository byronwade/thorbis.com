"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, MapPin, Star, TrendingUp, ArrowRight, ChevronDown, Clock } from "react-feather";
import { Car, Utensils, Building2, Home, Heart, ShoppingBag, Wrench, Stethoscope, Scissors } from "lucide-react";
import { Button } from "@components/ui/button";
import LocationDropdown from "@components/shared/searchBox/location-dropdown";
import { useSearchStore } from "@store/search";

export default function HeroSection() {
	const { searchQuery, setSearchQuery, location, recentSearches, addRecentSearch } = useSearchStore();
	
	const [searchFocus, setSearchFocus] = useState(false);
	const [autocompleteOpen, setAutocompleteOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	
	const searchRef = useRef(null);
	const inputRef = useRef(null);

	// Popular business categories - focused on core directory functionality
	const popularCategories = [
		{ name: "Restaurants", icon: Utensils, count: "12,450+", color: "bg-orange-500", query: "restaurants" },
		{ name: "Home Services", icon: Wrench, count: "8,230+", color: "bg-blue-500", query: "home services" },
		{ name: "Auto Services", icon: Car, count: "3,450+", color: "bg-green-500", query: "auto repair" },
		{ name: "Healthcare", icon: Stethoscope, count: "4,320+", color: "bg-red-500", query: "healthcare" },
		{ name: "Beauty & Spa", icon: Scissors, count: "5,890+", color: "bg-pink-500", query: "beauty spa" },
		{ name: "Shopping", icon: ShoppingBag, count: "6,780+", color: "bg-purple-500", query: "shopping" },
	];

	// Recent trending searches
	const trendingSearches = [
		"Pizza near me",
		"Coffee shops", 
		"Hair salons",
		"Auto repair",
		"Dentist",
		"Plumber",
	];

	// Click outside handler
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setAutocompleteOpen(false);
				setSearchFocus(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle search submission
	const handleSearch = (e) => {
		e.preventDefault();
		
		if (searchQuery.trim()) {
			setLoading(true);
			addRecentSearch(searchQuery.trim());
			
			const queryString = new URLSearchParams({
				q: searchQuery.trim(),
				location: location.value || "",
			}).toString();
			
			window.location.href = `/search?${queryString}`;
		}
	};

	// Handle input changes
	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		
		if (value.trim()) {
			setAutocompleteOpen(true);
		} else {
			setAutocompleteOpen(false);
		}
	};

	// Handle search focus
	const handleSearchFocus = () => {
		setSearchFocus(true);
		setAutocompleteOpen(true);
	};

	// Handle suggestion selection
	const handleSuggestionSelect = (query) => {
		setSearchQuery(query);
		addRecentSearch(query);
		setAutocompleteOpen(false);
		
		const queryString = new URLSearchParams({
			q: query,
			location: location.value || "",
		}).toString();
		
		window.location.href = `/search?${queryString}`;
	};

	return (
		<section className="relative w-full min-h-screen bg-background dark:bg-background">
			{/* Clean Background Pattern */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-muted/30 dark:from-primary/10 dark:via-background dark:to-muted/50"></div>
				<div className="absolute inset-0" style={{
					backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)',
					backgroundSize: '32px 32px'
				}}></div>
			</div>

			<div className="relative z-10 container mx-auto px-6 py-24">
				<div className="max-w-6xl mx-auto">
					{/* Hero Header */}
					<div className="text-center mb-16">
						{/* Trust Badge */}
						<div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							<span>50,000+ Verified Local Businesses</span>
						</div>

						{/* Main Headline */}
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
							Find Local Businesses
							<span className="block text-primary mt-2">
								Near You
							</span>
						</h1>

						{/* Subheading */}
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
							Discover trusted local businesses, read verified reviews, and connect with your community
						</p>
					</div>

					{/* Main Search Interface */}
					<div className="max-w-4xl mx-auto mb-16" ref={searchRef}>
						<form onSubmit={handleSearch} className="relative">
							{/* Main Search Bar */}
							<div className={`flex items-center bg-card rounded-2xl shadow-xl border-2 transition-all duration-200 ${
								searchFocus 
									? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02]'
									: 'border-border hover:border-muted-foreground/30'
							}`}>
								{/* Search Input */}
								<div className="flex-1 flex items-center">
									<div className="pl-6 py-4">
										<Search className={`w-6 h-6 transition-colors ${searchFocus ? 'text-primary' : 'text-muted-foreground'}`} />
									</div>
									<input
										ref={inputRef}
										type="text"
										value={searchQuery}
										onChange={handleInputChange}
										onFocus={handleSearchFocus}
										placeholder="Search for restaurants, services, healthcare..."
										className="flex-1 px-4 py-6 text-lg bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground"
									/>
								</div>

								{/* Location Selector */}
								<div className="flex items-center border-l border-border px-6">
									<MapPin className="w-5 h-5 text-muted-foreground mr-2" />
									<LocationDropdown />
								</div>

								{/* Search Button */}
								<div className="pr-4">
									<Button
										type="submit"
										size="lg"
										disabled={loading}
										className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
									>
										{loading ? (
											<>
												<div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2"></div>
												Searching...
											</>
										) : (
											<>
												Search
												<ArrowRight className="w-5 h-5 ml-2" />
											</>
										)}
									</Button>
								</div>
							</div>

							{/* Search Suggestions Dropdown */}
							{autocompleteOpen && (
								<div className="absolute z-50 w-full mt-4 bg-popover rounded-2xl shadow-2xl border border-border overflow-hidden max-h-96 overflow-y-auto">
									{!searchQuery.trim() ? (
										<>
											{/* Popular Categories */}
											<div className="p-6 border-b border-border">
												<h4 className="text-sm font-semibold text-popover-foreground mb-4 flex items-center">
													<TrendingUp className="w-4 h-4 mr-2" />
													Popular Categories
												</h4>
												<div className="grid grid-cols-2 gap-3">
													{popularCategories.slice(0, 6).map((category) => (
														<button
															key={category.name}
															onClick={() => handleSuggestionSelect(category.query)}
															className="flex items-center gap-3 p-3 text-left hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
														>
															<div className={`w-10 h-10 rounded-lg ${category.color} bg-opacity-20 flex items-center justify-center`}>
																<category.icon className={`w-5 h-5 ${category.color.replace('bg-', 'text-')}`} />
															</div>
															<div>
																<div className="font-medium text-popover-foreground text-sm">
																	{category.name}
																</div>
																<div className="text-xs text-muted-foreground">
																	{category.count} businesses
																</div>
															</div>
														</button>
													))}
												</div>
											</div>

											{/* Trending Searches */}
											<div className="p-6 border-b border-border">
												<h4 className="text-sm font-semibold text-popover-foreground mb-4 flex items-center">
													<TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
													Trending Searches
												</h4>
												<div className="flex flex-wrap gap-2">
													{trendingSearches.map((search) => (
														<button
															key={search}
															onClick={() => handleSuggestionSelect(search)}
															className="px-3 py-2 bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary rounded-lg text-sm font-medium transition-colors"
														>
															{search}
														</button>
													))}
												</div>
											</div>

											{/* Recent Searches */}
											{recentSearches.length > 0 && (
												<div className="p-6">
													<h4 className="text-sm font-semibold text-popover-foreground mb-4 flex items-center">
														<Clock className="w-4 h-4 mr-2" />
														Recent Searches
													</h4>
													<div className="space-y-2">
														{recentSearches.slice(0, 4).map((search, idx) => (
															<button
																key={idx}
																onClick={() => handleSuggestionSelect(search)}
																className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
															>
																<div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
																	<Clock className="w-4 h-4 text-muted-foreground" />
																</div>
																<span className="font-medium text-popover-foreground">{search}</span>
																<ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
															</button>
														))}
													</div>
												</div>
											)}
										</>
									) : (
										<div className="p-6">
											<p className="text-sm text-muted-foreground">
												Press Enter to search for "{searchQuery}"
											</p>
										</div>
									)}
								</div>
							)}
						</form>
					</div>

					{/* Popular Categories Grid */}
					<div className="mb-16">
						<div className="text-center mb-12">
							<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
								Browse by Category
							</h2>
							<p className="text-muted-foreground">
								Find businesses in your area by category
							</p>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
							{popularCategories.map((category) => (
								<Link
									key={category.name}
									href={`/search?q=${encodeURIComponent(category.query)}`}
									className="group"
								>
									<div className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-105">
										<div className={`w-16 h-16 rounded-2xl ${category.color} bg-opacity-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
											<category.icon className={`w-8 h-8 ${category.color.replace('bg-', 'text-')}`} />
										</div>
										<h3 className="font-semibold text-card-foreground mb-2">
											{category.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{category.count}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* Trust Indicators */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						<div className="text-center">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Star className="w-8 h-8 text-primary" />
							</div>
							<div className="text-3xl font-bold text-foreground mb-2">2.3M+</div>
							<div className="text-muted-foreground">Customer Reviews</div>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>
							<div className="text-3xl font-bold text-foreground mb-2">50K+</div>
							<div className="text-muted-foreground">Verified Businesses</div>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="text-3xl font-bold text-foreground mb-2">500+</div>
							<div className="text-muted-foreground">Cities Covered</div>
						</div>
					</div>

					{/* Business Owner CTA */}
					<div className="text-center bg-primary/5 dark:bg-primary/10 rounded-3xl p-12">
						<div className="max-w-2xl mx-auto">
							<h2 className="text-3xl font-bold text-foreground mb-4">
								Own a Business?
							</h2>
							<p className="text-xl text-muted-foreground mb-8">
								Join thousands of businesses connecting with customers in their area
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/claim-business">
									<Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
										Claim Your Business
										<ArrowRight className="w-5 h-5 ml-2" />
									</Button>
								</Link>
								<Link href="/business">
									<Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl font-semibold transition-all duration-200">
										Learn More
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
