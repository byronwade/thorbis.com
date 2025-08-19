"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, MapPin, Star, TrendingUp, ArrowRight, ChevronDown, Clock, Sparkles, Users, Shield, Award } from "react-feather";
import { Car, Utensils, Building2, Home, Heart, ShoppingBag, Wrench, Stethoscope, Scissors, Coffee, Pizza, Camera } from "lucide-react";
import { Button } from "@components/ui/button";
import LocationDropdown from "@components/shared/searchBox/location-dropdown";
import { useSearchStore } from "@store/search";

export default function HeroSection() {
	const { searchQuery, setSearchQuery, location, recentSearches, addRecentSearch } = useSearchStore();
	
	const [searchFocus, setSearchFocus] = useState(false);
	const [autocompleteOpen, setAutocompleteOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [activeCategory, setActiveCategory] = useState(0);
	
	const searchRef = useRef(null);
	const inputRef = useRef(null);

	// Mobile-optimized popular categories with better icons
	const popularCategories = [
		{ name: "Food & Dining", icon: Pizza, count: "12,450+", color: "bg-orange-500", query: "restaurants", emoji: "🍕" },
		{ name: "Home Services", icon: Wrench, count: "8,230+", color: "bg-blue-500", query: "home services", emoji: "🔧" },
		{ name: "Beauty & Spa", icon: Scissors, count: "5,890+", color: "bg-pink-500", query: "beauty spa", emoji: "💇‍♀️" },
		{ name: "Auto Services", icon: Car, count: "3,450+", color: "bg-green-500", query: "auto repair", emoji: "🚗" },
		{ name: "Healthcare", icon: Stethoscope, count: "4,320+", color: "bg-red-500", query: "healthcare", emoji: "🏥" },
		{ name: "Shopping", icon: ShoppingBag, count: "6,780+", color: "bg-purple-500", query: "shopping", emoji: "🛍️" },
	];

	// Mobile-optimized trending searches
	const trendingSearches = [
		"Pizza near me",
		"Coffee shops", 
		"Hair salons",
		"Auto repair",
		"Dentist",
		"Plumber",
	];

	// Auto-rotate categories for mobile
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveCategory((prev) => (prev + 1) % popularCategories.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [popularCategories.length]);

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
		<section className="relative w-full min-h-screen bg-black">
			{/* Mobile-optimized background */}
			<div className="absolute inset-0">
				{/* Gradient background */}
				<div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>
				
				{/* Subtle pattern overlay */}
				<div className="absolute inset-0 opacity-20" style={{
					backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.3) 1px, transparent 0)',
					backgroundSize: '24px 24px'
				}}></div>
			</div>

			<div className="relative z-10 px-4 py-4 sm:py-6 lg:py-8">
				{/* Mobile Header - Reduced top padding for better centering */}
				<div className="text-center mb-6 sm:mb-8">
					{/* Trust Badge - Mobile optimized */}
					<div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
						<Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
						<span>50,000+ Verified Businesses</span>
					</div>

					{/* Main Headline - Mobile optimized with better centering */}
					<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
						Find Local
						<span className="block text-primary mt-1">
							Businesses
						</span>
					</h1>

					{/* Subheading - Mobile optimized */}
					<p className="text-base sm:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
						Discover trusted local businesses, read reviews, and connect with your community
					</p>
				</div>

				{/* Mobile-optimized Search Interface */}
				<div className="max-w-md mx-auto mb-6 sm:mb-8" ref={searchRef}>
					<form onSubmit={handleSearch} className="relative">
						{/* Main Search Bar - Mobile optimized */}
						<div className={`bg-white/10 backdrop-blur-sm rounded-2xl border-2 transition-all duration-200 ${
							searchFocus 
								? 'border-primary shadow-lg shadow-primary/20'
								: 'border-white/20'
						}`}>
							{/* Search Input */}
							<div className="flex items-center p-3 sm:p-4">
								<Search className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-colors ${searchFocus ? 'text-primary' : 'text-muted-foreground'}`} />
								<input
									ref={inputRef}
									type="text"
									value={searchQuery}
									onChange={handleInputChange}
									onFocus={handleSearchFocus}
									placeholder="Search for restaurants, services..."
									className="flex-1 bg-transparent border-0 outline-none text-white placeholder-muted-foreground text-sm sm:text-base"
								/>
								<Button
									type="submit"
									size="sm"
									disabled={loading}
									className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 py-2 rounded-xl font-medium text-sm"
								>
									{loading ? (
										<div className="w-3 h-3 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
									) : (
										"Search"
									)}
								</Button>
							</div>

							{/* Location Bar - Mobile optimized */}
							<div className="flex items-center px-3 sm:px-4 pb-3 sm:pb-4 border-t border-white/10">
								<MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mr-2" />
								<LocationDropdown />
							</div>
						</div>

						{/* Mobile-optimized Search Suggestions */}
						{autocompleteOpen && (
							<div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-h-80 overflow-y-auto">
								{!searchQuery.trim() ? (
									<>
										{/* Popular Categories - Mobile optimized */}
										<div className="p-3 sm:p-4">
											<h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center">
												<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary" />
												Popular Categories
											</h4>
											<div className="space-y-2">
												{popularCategories.slice(0, 4).map((category) => (
													<button
														key={category.name}
														onClick={() => handleSuggestionSelect(category.query)}
														className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left hover:bg-primary/10 rounded-xl transition-colors"
													>
														<span className="text-xl sm:text-2xl">{category.emoji}</span>
														<div className="flex-1">
															<div className="font-medium text-gray-900 text-xs sm:text-sm">
																{category.name}
															</div>
															<div className="text-xs text-gray-500">
																{category.count} businesses
															</div>
														</div>
														<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
													</button>
												))}
											</div>
										</div>

										{/* Trending Searches - Mobile optimized */}
										<div className="p-3 sm:p-4 border-t border-gray-200">
											<h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center">
												<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500" />
												Trending Searches
											</h4>
											<div className="flex flex-wrap gap-2">
												{trendingSearches.slice(0, 6).map((search) => (
													<button
														key={search}
														onClick={() => handleSuggestionSelect(search)}
														className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-primary/20 text-gray-700 hover:text-primary rounded-lg text-xs sm:text-sm font-medium transition-colors"
													>
														{search}
													</button>
												))}
											</div>
										</div>

										{/* Recent Searches - Mobile optimized */}
										{recentSearches.length > 0 && (
											<div className="p-3 sm:p-4 border-t border-gray-200">
												<h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center">
													<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
													Recent Searches
												</h4>
												<div className="space-y-2">
													{recentSearches.slice(0, 3).map((search, idx) => (
														<button
															key={idx}
															onClick={() => handleSuggestionSelect(search)}
															className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left hover:bg-primary/10 rounded-xl transition-colors"
														>
															<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
																<Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
															</div>
															<span className="font-medium text-gray-900 text-xs sm:text-sm">{search}</span>
														</button>
													))}
												</div>
											</div>
										)}
									</>
								) : (
									<div className="p-3 sm:p-4">
										<p className="text-xs sm:text-sm text-gray-600">
											Press Enter to search for "{searchQuery}"
										</p>
									</div>
								)}
							</div>
						)}
					</form>
				</div>

				{/* Mobile-optimized Category Showcase */}
				<div className="mb-6 sm:mb-8">
					<div className="text-center mb-4 sm:mb-6">
						<h2 className="text-lg sm:text-xl font-bold text-white mb-2">
							Browse by Category
						</h2>
						<p className="text-xs sm:text-sm text-muted-foreground">
							Find businesses in your area
						</p>
					</div>

					{/* Mobile-optimized category grid */}
					<div className="grid grid-cols-2 gap-2 sm:gap-3">
						{popularCategories.map((category, index) => (
							<Link
								key={category.name}
								href={`/search?q=${encodeURIComponent(category.query)}`}
								className="group"
							>
								<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-white/20 hover:border-primary/50 hover:bg-white/20 transition-all duration-200 active:scale-95">
									<div className="text-2xl sm:text-3xl mb-2">{category.emoji}</div>
									<h3 className="font-semibold text-white text-xs sm:text-sm mb-1">
										{category.name}
									</h3>
									<p className="text-xs text-muted-foreground">
										{category.count}
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Mobile-optimized Trust Indicators */}
				<div className="mb-6 sm:mb-8">
					<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
						<div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
							<div>
								<div className="text-lg sm:text-2xl font-bold text-white mb-1">2.3M+</div>
								<div className="text-xs text-muted-foreground">Reviews</div>
							</div>
							<div>
								<div className="text-lg sm:text-2xl font-bold text-white mb-1">50K+</div>
								<div className="text-xs text-muted-foreground">Businesses</div>
							</div>
							<div>
								<div className="text-lg sm:text-2xl font-bold text-white mb-1">500+</div>
								<div className="text-xs text-muted-foreground">Cities</div>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile-optimized Business Owner CTA */}
				<div className="text-center bg-primary/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/30">
					<div className="mb-4">
						<h2 className="text-lg sm:text-xl font-bold text-white mb-2">
							Own a Business?
						</h2>
						<p className="text-xs sm:text-sm text-muted-foreground">
							Join thousands of businesses connecting with customers
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:gap-3">
						<Link href="/claim-business">
							<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 sm:py-3 rounded-xl font-semibold text-sm">
								Claim Your Business
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
							</Button>
						</Link>
						<Link href="/business">
							<Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 py-2.5 sm:py-3 rounded-xl font-semibold text-sm">
								Learn More
							</Button>
						</Link>
					</div>
				</div>

				{/* Mobile-optimized Quick Actions */}
				<div className="mt-6 sm:mt-8">
					<div className="flex justify-center gap-3 sm:gap-4">
						<Link href="/categories">
							<Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
								Browse Categories
							</Button>
						</Link>
						<Link href="/near-me">
							<Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
								Near Me
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
