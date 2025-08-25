"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { Search, MapPin, Clock, Star, X, Loader2, TrendingUp, History, Target } from "lucide-react";
import { withErrorHandling, showErrorToast } from "@utils/error-handler";
import { filterAndSortBusinesses, SORT_OPTIONS } from "@utils/sorting";
import { useBusinessStore } from "@store/business";
import { useSearchStore } from "@store/search";
import { buildBusinessUrlFrom } from "@utils";
import debounce from "lodash/debounce";

const RealTimeSearch = ({ onSearchResults, onLocationChange, placeholder = "Search for businesses...", showSuggestions = true, autoFocus = false, className = "" }) => {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [location, setLocation] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [recentSearches, setRecentSearches] = useState([]);
	const [popularSearches] = useState(["Restaurants", "Coffee", "Plumbers", "Hair Salon", "Electricians", "Dentists", "Auto Repair", "Landscaping"]);
	const [isSearching, setIsSearching] = useState(false);
	const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
	const [searchHistory, setSearchHistory] = useState([]);

	const inputRef = useRef(null);
	const suggestionsRef = useRef(null);

	const { allBusinesses, filteredBusinesses, fetchBusinesses, initializeWithSupabaseData, setFilteredBusinesses } = useBusinessStore();

	const { setSearchQuery, setLocation: setStoreLocation, searchQuery: storeSearchQuery, searchLocation: storeSearchLocation } = useSearchStore();

	// Initialize with store values
	useEffect(() => {
		if (storeSearchQuery) setQuery(storeSearchQuery);
		if (storeSearchLocation && typeof storeSearchLocation === "string") {
			setLocation(storeSearchLocation);
		}
	}, [storeSearchQuery, storeSearchLocation]);

	// Initialize mock data
	useEffect(() => {
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	// Load recent searches from localStorage
	useEffect(() => {
		try {
			const saved = localStorage.getItem("recentSearches");
			if (saved) {
				const parsed = JSON.parse(saved);
				setRecentSearches(parsed.slice(0, 5)); // Keep only last 5
			}
		} catch (error) {
			console.error("Failed to load recent searches:", error);
		}
	}, []);

	// Save search to history
	const saveToHistory = useCallback((searchTerm, searchLocation) => {
		if (!searchTerm.trim()) return;

		const newSearch = {
			query: searchTerm,
			location: searchLocation,
			timestamp: new Date().toISOString(),
		};

		setSearchHistory((prev) => {
			const filtered = prev.filter((s) => s.query !== searchTerm || s.location !== searchLocation);
			const updated = [newSearch, ...filtered].slice(0, 10);
			localStorage.setItem("recentSearches", JSON.stringify(updated));
			return updated;
		});
	}, []);

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce(async (searchQuery, searchLocation) => {
			if (!searchQuery.trim() && !searchLocation.trim()) {
				setSuggestions([]);
				setShowSuggestionsPanel(false);
				return;
			}

			setIsSearching(true);

			try {
				// Update store
				setSearchQuery(searchQuery);
				setStoreLocation(searchLocation);

				// Fetch businesses with error handling
				const results = await withErrorHandling(async () => {
					const businesses = await fetchBusinesses(searchQuery, searchLocation);

					// Apply filters and sorting
					const filtered = filterAndSortBusinesses(
						businesses,
						{
							keywords: searchQuery,
							rating: [0, 5],
							distance: [0, 50],
							priceRange: [0, 4],
							categories: [],
							openNow: false,
							verified: false,
							sponsored: false,
							sortBy: SORT_OPTIONS.RELEVANCE,
						},
						SORT_OPTIONS.RELEVANCE
					);

					return filtered.slice(0, 10); // Limit suggestions
				}, "RealTimeSearch")();

				setSuggestions(results);
				setShowSuggestionsPanel(true);

				// Call callback with results
				if (onSearchResults) {
					onSearchResults(results);
				}

				// Save to history
				saveToHistory(searchQuery, searchLocation);
			} catch (error) {
				showErrorToast(error, "Search Error");
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 300),
		[fetchBusinesses, setSearchQuery, setStoreLocation, onSearchResults, saveToHistory, showErrorToast]
	);

	// Handle input changes
	const handleQueryChange = useCallback(
		(e) => {
			const value = e.target.value;
			setQuery(value);
			setSelectedSuggestionIndex(-1);

			if (value.trim()) {
				debouncedSearch(value, location);
			} else {
				setSuggestions([]);
				setShowSuggestionsPanel(false);
			}
		},
		[debouncedSearch, location]
	);

	const handleLocationChange = useCallback(
		(e) => {
			const value = e.target.value;
			setLocation(value);

			if (query.trim() || value.trim()) {
				debouncedSearch(query, value);
			}
		},
		[debouncedSearch, query]
	);

	// Handle suggestion selection
	const handleSuggestionClick = useCallback(
		(suggestion) => {
			// Check if this is a business suggestion (has business properties)
			if (suggestion.id && suggestion.name && (suggestion.categories || suggestion.description || suggestion.rating)) {
				// This is a business - navigate to business page
				try {
					router.push(buildBusinessUrlFrom(suggestion));
				} catch {
					router.push(`/us/${(suggestion.state||'').toLowerCase()}/${(suggestion.city||'').toLowerCase()}/${(suggestion.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${suggestion.short_id || suggestion.shortId || ''}`);
				}
				setShowSuggestionsPanel(false);
			} else {
				// This is a search suggestion - perform search
				setQuery(suggestion.name || suggestion.query || "");
				setLocation(suggestion.location || "");
				setShowSuggestionsPanel(false);

				// Trigger search
				debouncedSearch(suggestion.name || suggestion.query || "", suggestion.location || "");
			}
		},
		[debouncedSearch, router]
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e) => {
			if (!showSuggestionsPanel) return;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
					break;
				case "Enter":
					e.preventDefault();
					if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
						handleSuggestionClick(suggestions[selectedSuggestionIndex]);
					} else {
						// Perform search with current query
						debouncedSearch(query, location);
					}
					break;
				case "Escape":
					setShowSuggestionsPanel(false);
					setSelectedSuggestionIndex(-1);
					break;
			}
		},
		[showSuggestionsPanel, suggestions, selectedSuggestionIndex, handleSuggestionClick, debouncedSearch, query, location]
	);

	// Handle popular search click
	const handlePopularSearchClick = useCallback(
		(term) => {
			setQuery(term);
			debouncedSearch(term, location);
		},
		[debouncedSearch, location]
	);

	// Handle recent search click
	const handleRecentSearchClick = useCallback(
		(search) => {
			setQuery(search.query);
			setLocation(search.location);
			debouncedSearch(search.query, search.location);
		},
		[debouncedSearch]
	);

	// Clear search
	const handleClearSearch = useCallback(() => {
		setQuery("");
		setLocation("");
		setSuggestions([]);
		setShowSuggestionsPanel(false);
		setSelectedSuggestionIndex(-1);

		// Clear store
		setSearchQuery("");
		setStoreLocation("");

		// Call callback with empty results
		if (onSearchResults) {
			onSearchResults([]);
		}
	}, [setSearchQuery, setStoreLocation, onSearchResults]);

	// Handle location change callback
	const handleLocationSelect = useCallback(
		(selectedLocation) => {
			setLocation(selectedLocation);
			if (onLocationChange) {
				onLocationChange(selectedLocation);
			}
			debouncedSearch(query, selectedLocation);
		},
		[onLocationChange, debouncedSearch, query]
	);

	return (
		<div className={`relative ${className}`}>
			{/* Search Input */}
			<div className="relative">
				<div className="relative flex items-center">
					<Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
					<Input ref={inputRef} type="text" placeholder={placeholder} value={query} onChange={handleQueryChange} onKeyDown={handleKeyDown} onFocus={() => setShowSuggestionsPanel(true)} autoFocus={autoFocus} className="pl-10 pr-10" />
					{isSearching && <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-muted-foreground" />}
					{query && !isSearching && (
						<Button variant="ghost" size="sm" onClick={handleClearSearch} className="absolute right-1 h-6 w-6 p-0">
							<X className="w-3 h-3" />
						</Button>
					)}
				</div>

				{/* Location Input */}
				<div className="relative mt-2">
					<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input type="text" placeholder="Location (optional)" value={location} onChange={handleLocationChange} onKeyDown={handleKeyDown} className="pl-10" />
				</div>
			</div>

			{/* Suggestions Panel */}
			{showSuggestionsPanel && (
				<Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
					<CardContent className="p-0">
						<ScrollArea className="max-h-96">
							{/* Recent Searches */}
							{recentSearches.length > 0 && !query && (
								<div className="p-4">
									<div className="flex items-center gap-2 mb-3">
										<History className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium">Recent Searches</span>
									</div>
									<div className="space-y-2">
										{recentSearches.map((search, index) => (
											<button key={index} onClick={() => handleRecentSearchClick(search)} className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
												<div className="flex items-center gap-2">
													<Search className="w-3 h-3 text-muted-foreground" />
													<span className="text-sm">{search.query}</span>
													{search.location && (
														<>
															<span className="text-muted-foreground">in</span>
															<span className="text-sm">{search.location}</span>
														</>
													)}
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{/* Popular Searches */}
							{!query && (
								<div className="p-4">
									<div className="flex items-center gap-2 mb-3">
										<TrendingUp className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium">Popular Searches</span>
									</div>
									<div className="flex flex-wrap gap-2">
										{popularSearches.map((term) => (
											<Badge key={term} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => handlePopularSearchClick(term)}>
												{term}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Search Results */}
							{suggestions.length > 0 && (
								<>
									{!query && recentSearches.length > 0 && <Separator />}
									<div className="p-4">
										<div className="flex items-center gap-2 mb-3">
											<Target className="w-4 h-4 text-muted-foreground" />
											<span className="text-sm font-medium">Search Results</span>
										</div>
										<div className="space-y-2">
											{suggestions.map((business, index) => (
												<button key={business.id} onClick={() => handleSuggestionClick(business)} className={`w-full text-left p-3 rounded-md transition-colors ${index === selectedSuggestionIndex ? "bg-accent" : "hover:bg-muted"}`}>
													<div className="flex items-start gap-3">
														<div className="flex-shrink-0 w-10 h-10 bg-muted rounded-md flex items-center justify-center">
															{business.logo ? (
																<Image src={business.logo} alt={business.name} width={32} height={32} className="w-8 h-8 rounded object-cover" loading="lazy" />
															) : (
																<div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
																	<span className="text-xs font-medium text-primary">{business.name?.charAt(0).toUpperCase()}</span>
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="font-medium text-sm truncate">{business.name}</div>
															<div className="text-xs text-muted-foreground truncate">{business.description || business.categories?.join(", ")}</div>
															<div className="flex items-center gap-2 mt-1">
																{business.rating && (
																	<div className="flex items-center gap-1">
																		<Star className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
																		<span className="text-xs">{business.rating}</span>
																	</div>
																)}
																{business.distance && (
																	<div className="flex items-center gap-1">
																		<MapPin className="w-3 h-3" />
																		<span className="text-xs">{business.distance}</span>
																	</div>
																)}
																{business.isOpen !== undefined && (
																	<div className="flex items-center gap-1">
																		<Clock className="w-3 h-3" />
																		<span className="text-xs">{business.isOpen ? "Open" : "Closed"}</span>
																	</div>
																)}
															</div>
														</div>
													</div>
												</button>
											))}
										</div>
									</div>
								</>
							)}

							{/* No Results */}
							{query && suggestions.length === 0 && !isSearching && (
								<div className="p-4 text-center">
									<div className="text-muted-foreground text-sm">No businesses found for &quot;{query}&quot;</div>
									<div className="mt-2">
										<Button variant="outline" size="sm" onClick={() => debouncedSearch(query, location)}>
											Search anyway
										</Button>
									</div>
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default RealTimeSearch;
