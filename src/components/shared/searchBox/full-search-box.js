"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FilterDropdown from "@components/shared/searchBox/filter-dropdown";
import SortDropdown from "@components/shared/searchBox/sort-dropdown";
import LocationDropdown from "@components/shared/searchBox/location-dropdown";
import AiButton from "@components/shared/searchBox/ai-button";
import { ArrowRight, Search, MapPin, Star } from "lucide-react";
import { Button } from "@components/ui/button";
import AutocompleteSuggestions from "@components/shared/searchBox/autocomplete-suggestions";
import { Loader2 } from "lucide-react";
import { useSearchStore } from "@store/search";
import { useBusinessStore } from "@store/business";
import { useMapStore } from "@store/map";
import debounce from "lodash/debounce";
import { buildBusinessUrlFrom } from "@utils";

const FullSearchBox = () => {
	const { searchQuery, setSearchQuery, location, setLocation, errors, setErrors, touched, setTouched, suggestions, loading, fetchAutocompleteSuggestions } = useSearchStore();
	const { fetchFilteredBusinesses, fetchBusinesses, initializeWithSupabaseData, filteredBusinesses } = useBusinessStore();
	const { getMapBounds, getMapZoom } = useMapStore();
	const [autocompleteOpen, setAutocompleteOpen] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const [query, setQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [recentSearches, setRecentSearches] = useState([]);
	const [popularCategories] = useState(["Restaurants", "Plumbers", "Electricians", "Hair Salons", "Auto Repair", "Dentists", "Lawyers", "Real Estate"]);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

	const router = useRouter();
	const searchParams = useSearchParams();
	const searchInputRef = useRef(null);
	const locationInputRef = useRef(null);
	const suggestionsRef = useRef(null);

	// Initialize mock data on component mount
	useEffect(() => {
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	useEffect(() => {
		const queryParam = searchParams.get("q") || searchParams.get("query") || "";
		const locationParam = searchParams.get("location") || "";
		if (queryParam) {
			setSearchQuery(queryParam);
			setQuery(queryParam);
			setTouched((prevTouched) => ({ ...prevTouched, searchQuery: true }));
		}
		if (locationParam) {
			setLocation({ value: locationParam });
		}
		// Fetch businesses if there's a query
		if (queryParam) {
			fetchBusinesses(queryParam, locationParam);
		}
	}, [searchParams, setSearchQuery, setTouched, setLocation, fetchBusinesses]);

	useEffect(() => {
		const validationErrors = {};
		let isValid = true;

		if (!searchQuery) {
			validationErrors.searchQuery = "Search query cannot be empty";
			isValid = false;
		}

		if (!location.value) {
			validationErrors.location = "Location cannot be empty";
			isValid = false;
		}

		setErrors(validationErrors);
		setIsFormValid(isValid);
	}, [searchQuery, location, setErrors]);

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		if (searchQuery) {
			queryParams.set("query", searchQuery);
		} else {
			queryParams.delete("query");
		}
		if (location.value) {
			queryParams.set("location", location.value);
		} else {
			queryParams.delete("location");
		}
		router.replace(`?${queryParams.toString()}`, undefined, { shallow: true });
	}, [searchQuery, location, router]);

	const debouncedFetchFilteredBusinesses = useCallback(() => {
		const debouncedFn = debounce(async () => {
			const bounds = await getMapBounds();
			console.log("Map bounds:", bounds);
			const zoom = await getMapZoom();
			if (bounds && zoom !== null) {
				await fetchFilteredBusinesses(bounds, zoom, searchQuery);
			}
		}, 300);
		return debouncedFn();
	}, [getMapBounds, getMapZoom, fetchFilteredBusinesses, searchQuery]);

	const handleInputChange = async (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		setTouched((prevTouched) => ({ ...prevTouched, searchQuery: true }));
		setAutocompleteOpen(true);
		if (value) {
			await fetchAutocompleteSuggestions(value);
		} else {
			setAutocompleteOpen(false);
		}
		debouncedFetchFilteredBusinesses();
	};

	const handleLocationChange = (location) => {
		setLocation(location);
		setTouched((prevTouched) => ({ ...prevTouched, location: true }));
	};

	const updateLocationError = (error) => {
		setTouched((prevTouched) => ({ ...prevTouched, location: true }));
		setErrors((prevErrors) => ({
			...prevErrors,
			location: error ? "Location cannot be empty" : "",
		}));
	};

	const handleSuggestionSelect = (suggestion) => {
		setSearchQuery(suggestion);
		setAutocompleteOpen(false);
		setTouched((prevTouched) => ({ ...prevTouched, searchQuery: true }));
		debouncedFetchFilteredBusinesses();
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (!searchQuery.trim()) {
			return;
		}

		// Fetch businesses with the search query
		await fetchBusinesses(searchQuery, location.value || "");

		const queryString = new URLSearchParams({
			q: searchQuery,
			location: location.value || "",
		}).toString();

		// Update URL without full page reload if we're already on search page
		if (window.location.pathname === "/search") {
			router.push(`/search?${queryString}`);
		} else {
			window.location.href = `/search?${queryString}`;
		}
	};

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

			setLoading(true);

			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 200));

			const mockSuggestions = [
				{ type: "business", name: `${searchQuery} near me`, icon: MapPin },
				{ type: "category", name: `${searchQuery} services`, icon: Search },
				{ type: "location", name: `${searchQuery} in San Francisco`, icon: MapPin },
				{ type: "business", name: `Best ${searchQuery}`, icon: Star },
				{ type: "category", name: `${searchQuery} reviews`, icon: Star },
			];

			// Add matching businesses from current results
			const matchingBusinesses = filteredBusinesses
				.filter((business) => business.name.toLowerCase().includes(searchQuery.toLowerCase()) || business.categories?.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())))
				.slice(0, 3)
				.map((business) => ({
					type: "business",
					name: business.name,
					category: business.categories?.[0],
					rating: business.ratings?.overall,
					icon: MapPin,
					business,
				}));

			setSuggestions([...matchingBusinesses, ...mockSuggestions.slice(0, 5 - matchingBusinesses.length)]);
			setLoading(false);
		},
		[filteredBusinesses]
	);

	// Debounced search suggestions
	useEffect(() => {
		const timer = setTimeout(() => {
			if (query && showSuggestions) {
				generateSuggestions(query);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, showSuggestions, generateSuggestions]);

	const handleSearch = useCallback(
		(searchQuery = query, searchLocation = location) => {
			if (!searchQuery.trim()) return;

			// Save to recent searches
			const newSearch = { query: searchQuery, location: searchLocation, timestamp: Date.now() };
			const updated = [newSearch, ...recentSearches.filter((s) => s.query !== searchQuery)].slice(0, 10);
			setRecentSearches(updated);
			localStorage.setItem("recentSearches", JSON.stringify(updated));

			// Update stores
			setSearchQuery(searchQuery);
			setLocation(searchLocation);
			setTouched((prevTouched) => ({ ...prevTouched, searchQuery: true, location: true }));

			// Update URL
			const params = new URLSearchParams();
			if (searchQuery) params.set("q", searchQuery);
			if (searchLocation) params.set("location", searchLocation);

			router.push(`/search?${params.toString()}`);
			setShowSuggestions(false);
		},
		[query, location, recentSearches, setSearchQuery, setLocation, setTouched, router]
	);

	const handleSuggestionClick = (suggestion) => {
		if (suggestion.business) {
			try { router.push(buildBusinessUrlFrom(suggestion.business)); }
			catch {
				router.push(`/us/${(suggestion.business.state||'').toLowerCase()}/${(suggestion.business.city||'').toLowerCase()}/${(suggestion.business.name||'').toLowerCase().replace(/[^a-z0-9\\s-]/g,'').replace(/\\s+/g,'-').replace(/-+/g,'-')}-${suggestion.business.short_id || suggestion.business.shortId || ''}`);
			}
		} else {
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
		<div className="relative z-10 flex flex-col w-full h-full min-w-0 p-3 bg-background border border-border rounded-md focus-within:border-primary focus:border-primary">
			<div className="relative flex flex-col items-center flex-1 w-full transition-all duration-300">
				<div className="relative flex items-center justify-between w-full pb-2 mb-2 border-b align-center">
					<div className="flex items-center justify-center flex-1">
						<div className="relative w-full">
							<input
								className={`bg-transparent w-full min-h-[1.5rem] resize-none border-0 text-sm leading-relaxed shadow-none outline-none ring-0 [scroll-padding-block:0.75rem] selection:bg-teal-300 selection:text-black disabled:bg-transparent disabled:opacity-80 pl-1 ${!errors.searchQuery ? "text-foreground placeholder:text-muted-foreground" : "text-destructive placeholder:text-destructive"}`}
								id="search-input"
								placeholder="Search for a category"
								rows="1"
								spellCheck="false"
								style={{ colorScheme: "dark", height: "23px" }}
								value={searchQuery}
								onChange={handleInputChange}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleFormSubmit(e);
									}
								}}
								autoComplete="off"
							/>
							{errors.searchQuery && touched.searchQuery && <p className="text-sm text-destructive">{errors.searchQuery}</p>}
						</div>
					</div>
					<div className="relative flex items-center ml-2 space-x-1">
						<AiButton showBeta={true} />
						<Button size="icon" variant="outline" className={`${isFormValid ? "bg-primary !border-primary-dark" : ""} flex items-center justify-center h-8 gap-2 px-2 py-2 text-sm font-medium transition-colors rounded-md select-none ring-offset-background focus-visible:ring-offset-2 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:px-3`} type="submit" disabled={!isFormValid} onClick={handleFormSubmit}>
							{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFormValid ? <ArrowRight className="w-4 h-4" /> : <Search className="w-4 h-4" />}
						</Button>
					</div>
				</div>
				<AnimatePresence>
					{autocompleteOpen && suggestions.length > 0 && (
						<motion.div initial={{ maxHeight: 0, opacity: 0 }} animate={{ maxHeight: "24rem", opacity: 1 }} exit={{ maxHeight: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full pb-2 mb-2 overflow-hidden border-b">
							<AutocompleteSuggestions suggestions={suggestions} onSelect={handleSuggestionSelect} />
						</motion.div>
					)}
				</AnimatePresence>
				<div className="flex justify-between w-full md:items-end">
					<div className="flex flex-row flex-wrap flex-1 gap-1 sm:gap-2">
						<FilterDropdown />
						<SortDropdown />
						<LocationDropdown size="default" />
					</div>
				</div>
				{errors.location && touched.location && <p className="text-sm text-destructive">{errors.location}</p>}
			</div>
		</div>
	);
};

export default FullSearchBox;
