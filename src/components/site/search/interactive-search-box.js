"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { Card, CardContent } from "@components/ui/card";
import { Search, MapPin, X, History, Star, TrendingUp, SlidersHorizontal, Target } from "lucide-react";
import { useSearchStore } from "@store/search";
import { useBusinessStore } from "@store/business";
import { buildBusinessUrlFrom } from "@utils";

const InteractiveSearchBox = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState("");
	const [location, setLocation] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [recentSearches, setRecentSearches] = useState([]);
	const [popularCategories] = useState(["Restaurants", "Plumbers", "Electricians", "Hair Salons", "Auto Repair", "Dentists", "Lawyers", "Real Estate", "Contractors", "Landscaping", "Coffee Shops", "Pizza", "Italian Food", "Beauty Salons", "Healthcare"]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({
		rating: "",
		price: "",
		openNow: false,
		distance: "",
	});

	const searchInputRef = useRef(null);
	const locationInputRef = useRef(null);

	const { setSearchQuery, setLocation: setStoreLocation } = useSearchStore();
	const { filteredBusinesses, fetchBusinesses, initializeWithSupabaseData } = useBusinessStore();

	// Initialize mock data on component mount
	useEffect(() => {
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	// Initialize from URL params
	useEffect(() => {
		const q = searchParams.get("q") || searchParams.get("query") || "";
		const loc = searchParams.get("location") || "";
		setQuery(q);
		setLocation(loc);
		setSearchQuery(q);
		setStoreLocation({ value: loc });

		// If there's a query, fetch businesses immediately
		if (q) {
			fetchBusinesses(q, loc);
		}
	}, [searchParams, setSearchQuery, setStoreLocation, fetchBusinesses]);

	// Load recent searches from localStorage
	useEffect(() => {
		const saved = localStorage.getItem("recentSearches");
		if (saved) {
			try {
				setRecentSearches(JSON.parse(saved));
			} catch (e) {
				console.error("Error loading recent searches:", e);
			}
		}
	}, []);

	// Generate suggestions based on query
	const generateSuggestions = useCallback(
		async (searchQuery) => {
			if (!searchQuery.trim()) {
				setSuggestions([]);
				return;
			}

			setIsLoading(true);

			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Add matching businesses from current results
			const matchingBusinesses = filteredBusinesses
				.filter((business) => business.name.toLowerCase().includes(searchQuery.toLowerCase()) || business.categories?.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())) || business.description?.toLowerCase().includes(searchQuery.toLowerCase()))
				.slice(0, 4)
				.map((business) => ({
					type: "business",
					name: business.name,
					category: business.categories?.[0],
					rating: business.ratings?.overall,
					address: business.address?.split(",")[0],
					icon: MapPin,
					business,
					priority: 0,
				}));

			// Add matching categories from popular categories
			const matchingCategories = popularCategories
				.filter((category) => category.toLowerCase().includes(searchQuery.toLowerCase()))
				.slice(0, 3)
				.map((category) => ({
					type: "category",
					name: category,
					icon: Search,
					priority: 1,
				}));

			const baseSuggestions = [
				{ type: "search", name: `${searchQuery} near me`, icon: MapPin, priority: 2 },
				{ type: "location", name: `${searchQuery} in ${location || "San Francisco"}`, icon: MapPin, priority: 3 },
				{ type: "search", name: `Best ${searchQuery}`, icon: Star, priority: 4 },
				{ type: "category", name: `${searchQuery} reviews`, icon: Star, priority: 5 },
			];

			// Combine and sort by priority
			const allSuggestions = [...matchingBusinesses, ...matchingCategories, ...baseSuggestions].sort((a, b) => a.priority - b.priority).slice(0, 8);

			setSuggestions(allSuggestions);
			setIsLoading(false);
		},
		[filteredBusinesses, location, popularCategories]
	);

	// Debounced search suggestions
	useEffect(() => {
		const timer = setTimeout(() => {
			if (query && showSuggestions) {
				generateSuggestions(query);
			} else if (showSuggestions && !query) {
				// Show popular categories and recent searches when no query
				const popularSuggestions = popularCategories.slice(0, 6).map((category) => ({
					type: "category",
					name: category,
					icon: TrendingUp,
					priority: 1,
				}));

				const recentSuggestions = recentSearches.slice(0, 4).map((search) => ({
					type: "recent",
					name: search.query,
					location: search.location,
					icon: History,
					priority: 0,
				}));

				setSuggestions([...recentSuggestions, ...popularSuggestions]);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, showSuggestions, generateSuggestions, popularCategories, recentSearches]);

	const handleSearch = useCallback(
		async (searchQuery = query, searchLocation = location) => {
			if (!searchQuery.trim()) return;

			// Save to recent searches
			const newSearch = {
				query: searchQuery,
				location: searchLocation,
				timestamp: Date.now(),
				filters: { ...filters },
			};
			const updated = [newSearch, ...recentSearches.filter((s) => s.query !== searchQuery)].slice(0, 10);
			setRecentSearches(updated);
			localStorage.setItem("recentSearches", JSON.stringify(updated));

			// Update stores
			setSearchQuery(searchQuery);
			setStoreLocation({ value: searchLocation });

			// Fetch businesses with the search query
			await fetchBusinesses(searchQuery, searchLocation);

			// Update URL with filters
			const params = new URLSearchParams();
			if (searchQuery) params.set("q", searchQuery);
			if (searchLocation) params.set("location", searchLocation);
			if (filters.rating) params.set("rating", filters.rating);
			if (filters.price) params.set("price", filters.price);
			if (filters.openNow) params.set("open", "true");
			if (filters.distance) params.set("distance", filters.distance);

			router.push(`/search?${params.toString()}`);
			setShowSuggestions(false);
		},
		[query, location, recentSearches, filters, setSearchQuery, setStoreLocation, router, fetchBusinesses]
	);

	const handleSuggestionClick = (suggestion) => {
		if (suggestion.business) {
			// Navigate to business page
						try {
				router.push(buildBusinessUrlFrom(suggestion.business));
			} catch {
				router.push(`/us/${(suggestion.business.state||'').toLowerCase()}/${(suggestion.business.city||'').toLowerCase()}/${(suggestion.business.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${suggestion.business.short_id || suggestion.business.shortId || ''}`);
			}
		} else if (suggestion.type === "recent") {
			// Use the recent search query and location
			setQuery(suggestion.name);
			setLocation(suggestion.location || location);
			handleSearch(suggestion.name, suggestion.location || location);
		} else {
			// Regular search suggestion
			setQuery(suggestion.name);
			handleSearch(suggestion.name, location);
		}
	};

	const handleKeyDown = (e) => {
		if (!showSuggestions || suggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
				break;
			case "Enter":
				e.preventDefault();
				if (selectedSuggestionIndex >= 0) {
					handleSuggestionClick(suggestions[selectedSuggestionIndex]);
				} else {
					handleSearch();
				}
				break;
			case "Escape":
				setShowSuggestions(false);
				setSelectedSuggestionIndex(-1);
				break;
		}
	};

	const clearRecentSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem("recentSearches");
	};

	const handleLocationDetect = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					// In a real app, you'd reverse geocode these coordinates
					setLocation("Current Location");
				},
				(error) => {
					console.error("Error getting location:", error);
				}
			);
		}
	};

	const handleFilterChange = (filterType, value) => {
		setFilters((prev) => ({
			...prev,
			[filterType]: value,
		}));
	};

	const clearFilters = () => {
		setFilters({
			rating: "",
			price: "",
			openNow: false,
			distance: "",
		});
	};

	const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== false);

	return (
		<div className="relative w-full max-w-5xl mx-auto">
			{/* Main Search Bar */}
			<Card className="shadow-lg border-2 border-neutral-800 dark:border-neutral-700">
				<CardContent className="p-4">
					<div className="flex flex-col lg:flex-row gap-3">
						{/* Search Input */}
						<div className="relative flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input ref={searchInputRef} type="text" placeholder="What are you looking for?" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setShowSuggestions(true)} onKeyDown={handleKeyDown} className="pl-12 pr-4 h-14 text-base font-medium border-0 focus:ring-2 focus:ring-primary/20" />
								{query && (
									<Button variant="ghost" size="sm" onClick={() => setQuery("")} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted">
										<X className="w-4 h-4" />
									</Button>
								)}
							</div>
						</div>

						{/* Location Input */}
						<div className="relative flex-1 lg:max-w-sm">
							<div className="relative">
								<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input ref={locationInputRef} type="text" placeholder="Where?" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-12 pr-12 h-14 text-base font-medium border-0 focus:ring-2 focus:ring-primary/20" />
								<Button variant="ghost" size="sm" onClick={handleLocationDetect} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-neutral-800" title="Use current location">
									<Target className="w-4 h-4" />
								</Button>
							</div>
						</div>

						{/* Filter Button */}
						<Button variant={hasActiveFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="h-14 px-6 relative">
							<SlidersHorizontal className="w-4 h-4 mr-2" />
							Filters
							{hasActiveFilters && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>}
						</Button>

						{/* Search Button */}
						<Button onClick={() => handleSearch()} className="h-14 px-8 bg-primary hover:bg-primary/90 font-semibold" disabled={!query.trim()}>
							<Search className="w-5 h-5 mr-2" />
							Search
						</Button>
					</div>

					{/* Filters Panel */}
					{showFilters && (
						<div className="mt-4 p-4 bg-neutral-800 dark:bg-neutral-800 rounded-lg">
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-medium">Filters</h3>
								{hasActiveFilters && (
									<Button variant="ghost" size="sm" onClick={clearFilters}>
										Clear all
									</Button>
								)}
							</div>
							<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
								<div>
									<label className="text-sm font-medium mb-2 block">Rating</label>
									<select value={filters.rating} onChange={(e) => handleFilterChange("rating", e.target.value)} className="w-full p-2 border rounded-md">
										<option value="">Any rating</option>
										<option value="4+">4+ stars</option>
										<option value="3+">3+ stars</option>
										<option value="2+">2+ stars</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-medium mb-2 block">Price</label>
									<select value={filters.price} onChange={(e) => handleFilterChange("price", e.target.value)} className="w-full p-2 border rounded-md">
										<option value="">Any price</option>
										<option value="$">$ - Inexpensive</option>
										<option value="$$">$$ - Moderate</option>
										<option value="$$$">$$$ - Expensive</option>
										<option value="$$$$">$$$$ - Very Expensive</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-medium mb-2 block">Distance</label>
									<select value={filters.distance} onChange={(e) => handleFilterChange("distance", e.target.value)} className="w-full p-2 border rounded-md">
										<option value="">Any distance</option>
										<option value="1">Within 1 mile</option>
										<option value="5">Within 5 miles</option>
										<option value="10">Within 10 miles</option>
										<option value="25">Within 25 miles</option>
									</select>
								</div>
								<div className="flex items-center">
									<label className="flex items-center space-x-2 cursor-pointer">
										<input type="checkbox" checked={filters.openNow} onChange={(e) => handleFilterChange("openNow", e.target.checked)} className="rounded" />
										<span className="text-sm font-medium">Open now</span>
									</label>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Suggestions Dropdown */}
			{showSuggestions && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 dark:bg-neutral-900 rounded-lg shadow-2xl border z-50 max-h-96 overflow-hidden">
					<ScrollArea className="max-h-96">
						{isLoading ? (
							<div className="p-6 text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
								<p className="text-sm text-muted-foreground mt-3">Searching...</p>
							</div>
						) : (
							<div className="py-2">
								{/* Current Query */}
								{query && (
									<>
										<div className="px-4 py-2">
											<button onClick={() => handleSearch()} className="flex items-center gap-3 w-full text-left hover:bg-neutral-800 dark:hover:bg-neutral-800 p-3 rounded-lg transition-colors">
												<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
													<Search className="w-5 h-5 text-primary" />
												</div>
												<div>
													<span className="font-medium">Search for &quot;{query}&quot;</span>
													<p className="text-sm text-muted-foreground">Press Enter or click to search</p>
												</div>
											</button>
										</div>
										<Separator />
									</>
								)}

								{/* Suggestions */}
								{suggestions.length > 0 && (
									<>
										<div className="px-4 py-2">
											<h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Suggestions</h4>
											{suggestions.map((suggestion, index) => {
												const Icon = suggestion.icon;
												return (
													<button key={index} onClick={() => handleSuggestionClick(suggestion)} className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-all ${selectedSuggestionIndex === index ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-neutral-800 dark:hover:bg-neutral-800"}`}>
														<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${suggestion.type === "business" ? "bg-success/10 dark:bg-success" : "bg-neutral-800 dark:bg-neutral-800"}`}>
															<Icon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
														</div>
														<div className="flex-1 min-w-0">
															<span className="block font-medium truncate">{suggestion.name}</span>
															{suggestion.category && <span className="text-sm text-muted-foreground">{suggestion.category}</span>}
															{suggestion.address && <span className="text-xs text-muted-foreground">{suggestion.address}</span>}
														</div>
														{suggestion.rating && (
															<div className="flex items-center gap-1 bg-yellow-50 dark:bg-warning/20 px-2 py-1 rounded">
																<Star className="w-3 h-3 fill-yellow-400 text-warning" />
																<span className="text-sm font-medium">{suggestion.rating}</span>
															</div>
														)}
													</button>
												);
											})}
										</div>
										<Separator />
									</>
								)}

								{/* Recent Searches */}
								{recentSearches.length > 0 && !query && (
									<>
										<div className="px-4 py-2">
											<div className="flex items-center justify-between mb-3">
												<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Searches</h4>
												<Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-xs h-6 px-2">
													Clear
												</Button>
											</div>
											{recentSearches.slice(0, 5).map((search, index) => (
												<button key={index} onClick={() => handleSearch(search.query, search.location)} className="flex items-center gap-3 w-full text-left hover:bg-neutral-800 dark:hover:bg-neutral-800 p-3 rounded-lg transition-colors">
													<div className="w-10 h-10 bg-neutral-800 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
														<History className="w-5 h-5 text-muted-foreground" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="block font-medium truncate">{search.query}</span>
														{search.location && <span className="text-sm text-muted-foreground">{search.location}</span>}
													</div>
													<span className="text-xs text-muted-foreground">{new Date(search.timestamp).toLocaleDateString()}</span>
												</button>
											))}
										</div>
										<Separator />
									</>
								)}

								{/* Popular Categories */}
								{!query && (
									<div className="px-4 py-3">
										<h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Popular Categories</h4>
										<div className="grid grid-cols-2 gap-2">
											{popularCategories.map((category) => (
												<button
													key={category}
													onClick={() => {
														setQuery(category);
														handleSearch(category, location);
													}}
													className={`flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-800 transition-colors text-left ${selectedSuggestionIndex === category ? "bg-primary/10 text-primary shadow-sm" : ""}`}
												>
													<TrendingUp className="w-4 h-4 text-muted-foreground" />
													<span className={`text-sm font-medium ${selectedSuggestionIndex === category ? "text-primary" : "text-muted-foreground"}`}>{category}</span>
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</ScrollArea>
				</div>
			)}

			{/* Click outside to close */}
			{showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
		</div>
	);
};

export default InteractiveSearchBox;
