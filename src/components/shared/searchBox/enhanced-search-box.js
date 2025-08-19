"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { Card, CardContent } from "@components/ui/card";
import { Search, MapPin, X, History, Star, TrendingUp, Target } from "lucide-react";
import AiButton from "@components/shared/searchBox/ai-button";
import { useSearchStore } from "@store/search";
import { useBusinessStore } from "@store/business";
import { buildBusinessUrlFrom } from "@utils";

const EnhancedSearchBox = () => {
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

	const searchInputRef = useRef(null);
	const locationInputRef = useRef(null);

	const { setSearchQuery, setLocation: setStoreLocation } = useSearchStore();
	const { filteredBusinesses, fetchBusinesses, initializeWithSupabaseData } = useBusinessStore();

	// Initialize Supabase data on component mount
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
			};
			const updated = [newSearch, ...recentSearches.filter((s) => s.query !== searchQuery)].slice(0, 10);
			setRecentSearches(updated);
			localStorage.setItem("recentSearches", JSON.stringify(updated));

			// Update stores
			setSearchQuery(searchQuery);
			setStoreLocation({ value: searchLocation });

			// Fetch businesses with the search query
			await fetchBusinesses(searchQuery, searchLocation);

			// Update URL
			const params = new URLSearchParams();
			if (searchQuery) params.set("q", searchQuery);
			if (searchLocation) params.set("location", searchLocation);

			// Update URL without full page reload if we're already on search page
			if (window.location.pathname === "/search") {
				router.push(`/search?${params.toString()}`);
			} else {
				router.push(`/search?${params.toString()}`);
			}
			setShowSuggestions(false);
		},
		[query, location, recentSearches, setSearchQuery, setStoreLocation, router, fetchBusinesses]
	);

	const handleSuggestionClick = (suggestion) => {
		if (suggestion.business) {
			// Navigate to business page
			try { router.push(buildBusinessUrlFrom(suggestion.business)); }
			catch { router.push(`/us/${(suggestion.business.state||'').toLowerCase()}/${(suggestion.business.city||'').toLowerCase()}/${(suggestion.business.name||'').toLowerCase().replace(/[^a-z0-9\\s-]/g,'').replace(/\\s+/g,'-').replace(/-+/g,'-')}-${suggestion.business.short_id || suggestion.business.shortId || ''}`); }
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

	return (
		<div className="relative w-full">
			{/* Main Search Bar */}
			<Card className="border-2 border-border shadow-lg dark:border-border">
				<CardContent className="p-3">
					<div className="flex flex-col gap-2 lg:flex-row">
						{/* Search Input */}
						<div className="relative flex-1">
							<div className="relative">
								<Search className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
								<Input ref={searchInputRef} type="text" placeholder="What are you looking for?" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setShowSuggestions(true)} onKeyDown={handleKeyDown} className="h-12 pl-10 pr-4 text-base font-medium border-0 focus:ring-2 focus:ring-primary/20" />
								{query && (
									<Button variant="ghost" size="sm" onClick={() => setQuery("")} className="absolute w-6 h-6 p-0 transform -translate-y-1/2 right-2 top-1/2 hover:bg-muted">
										<X className="w-3 h-3" />
									</Button>
								)}
							</div>
						</div>

						{/* Location Input */}
						<div className="relative flex-1 lg:max-w-sm">
							<div className="relative">
								<MapPin className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
								<Input ref={locationInputRef} type="text" placeholder="Where?" value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 pl-10 pr-10 text-base font-medium border-0 focus:ring-2 focus:ring-primary/20" />
								<Button variant="ghost" size="sm" onClick={handleLocationDetect} className="absolute w-6 h-6 p-0 transform -translate-y-1/2 right-2 top-1/2 hover:bg-muted" title="Use current location">
									<Target className="w-3 h-3" />
								</Button>
							</div>
						</div>

						{/* AI Button */}
						<AiButton />

						{/* Search Button */}
						<Button onClick={() => handleSearch()} className="h-12 px-6 font-semibold bg-primary hover:bg-primary/90" disabled={!query.trim()}>
							<Search className="w-4 h-4 mr-2" />
							Search
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Suggestions Dropdown */}
			{showSuggestions && (
				<div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border rounded-lg shadow-2xl top-full dark:bg-card max-h-96">
					<ScrollArea className="max-h-96">
						{isLoading ? (
							<div className="p-6 text-center">
								<div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
								<p className="mt-3 text-sm text-muted-foreground">Searching...</p>
							</div>
						) : (
							<div className="py-2">
								{/* Current Query */}
								{query && (
									<>
										<div className="px-4 py-2">
											<button onClick={() => handleSearch()} className="flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-card">
												<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
													<Search className="w-4 h-4 text-primary" />
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
											<h4 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{query ? "Suggestions" : "Popular & Recent"}</h4>
											{suggestions.map((suggestion, index) => {
												const Icon = suggestion.icon;
												return (
													<button key={index} onClick={() => handleSuggestionClick(suggestion)} className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-all ${selectedSuggestionIndex === index ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-gray-50 dark:hover:bg-card"}`}>
														<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suggestion.type === "business" ? "bg-primary/20 dark:bg-primary/20" : "bg-muted dark:bg-card"}`}>
															<Icon className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
														</div>
														<div className="flex-1 min-w-0">
															<span className="block font-medium truncate">{suggestion.name}</span>
															{suggestion.category && <span className="text-sm text-muted-foreground">{suggestion.category}</span>}
															{suggestion.address && <span className="text-xs text-muted-foreground">{suggestion.address}</span>}
														</div>
														{suggestion.rating && (
																						<div className="flex items-center gap-1 px-2 py-1 rounded bg-muted-foreground/10 dark:bg-muted-foreground/20">
								<Star className="w-3 h-3 text-muted-foreground fill-muted-foreground" />
																<span className="text-sm font-medium">{suggestion.rating}</span>
															</div>
														)}
													</button>
												);
											})}
										</div>
									</>
								)}

								{/* Recent Searches */}
								{recentSearches.length > 0 && !query && (
									<>
										<Separator />
										<div className="px-4 py-2">
											<div className="flex items-center justify-between mb-3">
												<h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Recent Searches</h4>
												<Button variant="ghost" size="sm" onClick={clearRecentSearches} className="h-6 px-2 text-xs">
													Clear
												</Button>
											</div>
											{recentSearches.slice(0, 3).map((search, index) => (
												<button key={index} onClick={() => handleSearch(search.query, search.location)} className="flex items-center w-full gap-3 p-2 text-left transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-card">
													<div className="flex items-center justify-center w-6 h-6 bg-muted rounded dark:bg-card">
														<History className="w-3 h-3 text-muted-foreground" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="block text-sm font-medium truncate">{search.query}</span>
														{search.location && <span className="text-xs text-muted-foreground">{search.location}</span>}
													</div>
												</button>
											))}
										</div>
									</>
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

export default EnhancedSearchBox;
