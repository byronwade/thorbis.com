/**
 * useBusinessCardList Hook
 * Custom hook for managing business card list state and operations
 * Extracted from large BusinessCardList component for better organization
 */

"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useBusinessStore } from "@store/business";
import { useSearchStore } from "@store/search";
import { useMapStore } from "@store/map";
import { filterAndSortBusinesses } from "@utils/sorting";
import { withErrorHandling } from "@utils/error-handler";
import logger from "@lib/utils/logger";

// Virtual scrolling constants
const ITEMS_PER_PAGE = 20;
const ITEM_HEIGHT = 200; // Approximate height of each business card

export const useBusinessCardList = (businesses = []) => {
	// CRITICAL: Emergency Promise detection at hook entry point
	if (businesses instanceof Promise) {
		logger.error("[useBusinessCardList] EMERGENCY: businesses prop is a Promise at hook entry!");
		console.trace("Promise detected at useBusinessCardList entry:");
		// Force return empty array and prevent further processing
		businesses = [];
	}

	if (businesses && typeof businesses.then === "function") {
		logger.error("[useBusinessCardList] EMERGENCY: businesses prop is Promise-like at hook entry!");
		console.trace("Promise-like object detected at useBusinessCardList entry:");
		businesses = [];
	}

	const { setActiveBusinessId, selectedBusiness } = useBusinessStore();
	const { searchQuery, searchLocation } = useSearchStore();
	const { centerOn, loadingBusinessId, isMapAvailable } = useMapStore();

	// Refs
	const listRef = useRef(null);
	const activeCardElementRef = useRef(null);
	const sentinelRef = useRef(null);

	// State
	const [hoveredBusinessId, setHoveredBusinessId] = useState(null);
	const [sortBy, setSortBy] = useState("relevance");
	const [showFilters, setShowFilters] = useState(false);
	const [showSort, setShowSort] = useState(false);
	const [currentFilters, setCurrentFilters] = useState({
		rating: null,
		priceRange: null,
		distance: null,
		availability: null,
		features: [],
		verified: false,
		sponsored: false,
	});
	const [userLocation, setUserLocation] = useState(null);
	const [visibleStartIndex, setVisibleStartIndex] = useState(0);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	// Memoized filtered businesses with Promise handling
	// Ensure businesses is always an array with comprehensive checks
	const filteredBusinesses = useMemo(() => {
		if (!businesses) {
			logger.warn("[useBusinessCardList] Businesses is null/undefined, using empty array");
			return [];
		}

		// Check if businesses is a Promise - CRITICAL FIX
		if (businesses instanceof Promise) {
			logger.error("[useBusinessCardList] Businesses is a Promise object - async data not properly awaited");
			// Return empty array immediately to prevent cascading errors
			return [];
		}

		// Check if businesses has a 'then' method (Promise-like object)
		if (businesses && typeof businesses.then === "function") {
			logger.error("[useBusinessCardList] Businesses is a Promise-like object with .then method");
			return [];
		}

		if (!Array.isArray(businesses)) {
			logger.error("[useBusinessCardList] Businesses is not an array, received:", typeof businesses, businesses);
			// Try to convert if it's array-like
			if (businesses && typeof businesses === "object" && businesses.length !== undefined) {
				logger.warn("[useBusinessCardList] Converting array-like object to array");
				try {
					return Array.from(businesses);
				} catch (error) {
					logger.error("[useBusinessCardList] Failed to convert array-like object:", error);
					return [];
				}
			}
			logger.error("[useBusinessCardList] Cannot convert to array, using empty array");
			return [];
		}

		// Final validation - ensure all business objects are valid
		const validBusinesses = businesses.filter((business) => {
			if (!business || typeof business !== "object") {
				return false;
			}
			if (business instanceof Promise || typeof business.then === "function") {
				logger.warn("[useBusinessCardList] Found Promise object in business array, filtering out");
				return false;
			}
			return true;
		});

		return validBusinesses;
	}, [businesses]);

	// Calculate visible items for virtual scrolling
	const itemsToShow = Math.min(visibleStartIndex + ITEMS_PER_PAGE, filteredBusinesses.length);

	// Get visible businesses with sorting and filtering - COMPLETELY SAFE FROM PROMISES
	const visibleBusinesses = useMemo(() => {
		try {
			// CRITICAL: Ensure we have a valid array before any processing
			const safeBusinesses = filteredBusinesses || [];

			// Double-check that we're not dealing with Promises
			if (safeBusinesses instanceof Promise) {
				logger.error("[useBusinessCardList] filteredBusinesses is still a Promise, returning empty array");
				return [];
			}

			// Check for Promise-like objects
			if (safeBusinesses && typeof safeBusinesses.then === "function") {
				logger.error("[useBusinessCardList] filteredBusinesses is Promise-like object, returning empty array");
				return [];
			}

			// Validate array structure
			if (!Array.isArray(safeBusinesses)) {
				logger.error("[useBusinessCardList] filteredBusinesses is not an array:", typeof safeBusinesses);
				return [];
			}

			// Validate array items are not Promises
			const validBusinesses = safeBusinesses.filter((business) => {
				if (business instanceof Promise || (business && typeof business.then === "function")) {
					logger.warn("[useBusinessCardList] Found Promise in business array, filtering out");
					return false;
				}
				return true;
			});

			if (validBusinesses.length !== safeBusinesses.length) {
				logger.warn(`[useBusinessCardList] Filtered out ${safeBusinesses.length - validBusinesses.length} Promise objects from business array`);
			}

			// Take safe slice
			const slicedBusinesses = validBusinesses.slice(0, itemsToShow);

			// Validate slice result
			if (!Array.isArray(slicedBusinesses)) {
				logger.error("[useBusinessCardList] sliced businesses is not an array");
				return [];
			}

			// Additional safety check before calling filterAndSortBusinesses
			if (slicedBusinesses.length === 0) {
				logger.debug("[useBusinessCardList] No businesses to filter/sort");
				return [];
			}

			// NOW it's safe to call filterAndSortBusinesses with additional error boundary
			let filtered;
			try {
				// Log input details for debugging
				logger.debug("[useBusinessCardList] About to call filterAndSortBusinesses");
				logger.debug("[useBusinessCardList] Input validation:", {
					businessesLength: slicedBusinesses.length,
					businessesType: typeof slicedBusinesses,
					businessesIsArray: Array.isArray(slicedBusinesses),
					firstBusinessType: slicedBusinesses[0] ? typeof slicedBusinesses[0] : "N/A",
					filtersKeys: Object.keys(currentFilters),
					sortBy,
					hasUserLocation: !!userLocation,
				});

				// Double-check input before function call
				if (!Array.isArray(slicedBusinesses)) {
					logger.error("[useBusinessCardList] slicedBusinesses is not an array before function call!");
					return [];
				}

				// Check for Promises in the array
				const hasPromises = slicedBusinesses.some((business) => business instanceof Promise || (business && typeof business.then === "function"));

				if (hasPromises) {
					logger.error("[useBusinessCardList] Found Promise objects in slicedBusinesses array!");
					const cleanBusinesses = slicedBusinesses.filter((business) => !(business instanceof Promise) && !(business && typeof business.then === "function"));
					logger.warn(`[useBusinessCardList] Cleaned ${slicedBusinesses.length - cleanBusinesses.length} Promise objects`);
					return cleanBusinesses;
				}

				filtered = filterAndSortBusinesses(slicedBusinesses, currentFilters, sortBy, userLocation);

				logger.debug("[useBusinessCardList] filterAndSortBusinesses returned:", {
					resultType: typeof filtered,
					isArray: Array.isArray(filtered),
					resultLength: Array.isArray(filtered) ? filtered.length : "N/A",
					resultConstructor: filtered?.constructor?.name,
					isPromise: filtered instanceof Promise,
					hasThenable: filtered && typeof filtered.then === "function",
				});
			} catch (sortError) {
				logger.error("[useBusinessCardList] Error in filterAndSortBusinesses:", sortError);
				logger.error("[useBusinessCardList] Error stack:", sortError.stack);
				logger.error("[useBusinessCardList] Input that caused error:", {
					businessesType: typeof slicedBusinesses,
					businessesLength: Array.isArray(slicedBusinesses) ? slicedBusinesses.length : "N/A",
					filtersType: typeof currentFilters,
					sortByType: typeof sortBy,
				});
				// Return unfiltered businesses on sort error
				return slicedBusinesses;
			}

			// Final validation
			if (!Array.isArray(filtered)) {
				logger.error("[useBusinessCardList] filtered result is not an array, type:", typeof filtered);
				logger.error("[useBusinessCardList] filtered result value:", JSON.stringify(filtered, null, 2));
				logger.error("[useBusinessCardList] filtered result constructor:", filtered?.constructor?.name);

				// Check if it's a Promise that slipped through
				if (filtered instanceof Promise) {
					logger.error("[useBusinessCardList] Filtered result is a Promise object!");
				}

				// Check if it's an object with a then method
				if (filtered && typeof filtered.then === "function") {
					logger.error("[useBusinessCardList] Filtered result is Promise-like object!");
				}

				return slicedBusinesses; // Return unfiltered but safe array
			}

			// Validate filtered results don't contain Promises
			const safeFiltered = filtered.filter((business) => {
				if (business instanceof Promise || (business && typeof business.then === "function")) {
					logger.warn("[useBusinessCardList] Found Promise in filtered results, removing");
					return false;
				}
				return true;
			});

			return safeFiltered;
		} catch (error) {
			logger.error("Error processing visible businesses:", error);
			logger.error("Error stack:", error.stack);
			// Return safe fallback
			const safeBusinesses = Array.isArray(filteredBusinesses) ? filteredBusinesses : [];
			const safeFallback = safeBusinesses.filter((business) => business && typeof business === "object" && !(business instanceof Promise) && typeof business.then !== "function");
			return safeFallback.slice(0, itemsToShow);
		}
	}, [filteredBusinesses, itemsToShow, currentFilters, sortBy, userLocation]);

	// Filter handlers
	const handleFilterClick = withErrorHandling(() => {
		setShowFilters(!showFilters);
	});

	const handleSortSelect = withErrorHandling((value) => {
		setSortBy(value);
		setShowSort(false);
	});

	// Apply filters with performance optimization
	const handleFiltersChange = withErrorHandling(async (newFilters) => {
		setCurrentFilters(newFilters);
		setVisibleStartIndex(0); // Reset to top when filters change
	});

	const handleClearFilters = withErrorHandling(() => {
		setCurrentFilters({
			rating: null,
			priceRange: null,
			distance: null,
			availability: null,
			features: [],
			verified: false,
			sponsored: false,
		});
		setSortBy("relevance");
		setVisibleStartIndex(0);
	});

	// Intersection Observer for infinite loading
	useEffect(() => {
		if (!sentinelRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoadingMore && itemsToShow < filteredBusinesses.length) {
					setIsLoadingMore(true);

					// Simulate loading delay
					setTimeout(() => {
						setVisibleStartIndex((prev) => prev + ITEMS_PER_PAGE);
						setIsLoadingMore(false);
					}, 300);
				}
			},
			{
				rootMargin: "100px",
				threshold: 0.1,
			}
		);

		observer.observe(sentinelRef.current);

		return () => {
			if (sentinelRef.current) {
				observer.unobserve(sentinelRef.current);
			}
		};
	}, [isLoadingMore, itemsToShow, filteredBusinesses.length]);

	// Card interaction handlers
	const handleCardClick = (business) => {
		try {
			setActiveBusinessId(business.id);

			// Center map on business if map is available and coordinates are valid
			if (isMapAvailable() && business.coordinates) {
				const { lat, lng } = business.coordinates;
				if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
					centerOn(lat, lng, 15);
				}
			}

			// Analytics tracking
			logger.info(`Business card clicked: ${business.name} (${business.id})`);
		} catch (error) {
			logger.error("Error handling card click:", error);
		}
	};

	const handleCardHover = (business) => {
		setHoveredBusinessId(business.id);

		// Only center map on hover if map is available and coordinates are valid
		if (isMapAvailable() && business.coordinates) {
			const { lat, lng } = business.coordinates;
			if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
				centerOn(lat, lng, 12, { duration: 500 });
			}
		}
	};

	const handleCardLeave = (business) => {
		setHoveredBusinessId(null);
	};

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(event) => {
			if (!visibleBusinesses.length) return;

			const currentIndex = visibleBusinesses.findIndex((b) => b.id === selectedBusiness?.id);

			if (event.key === "ArrowUp") {
				event.preventDefault();
				const prevIndex = (currentIndex - 1 + visibleBusinesses.length) % visibleBusinesses.length;
				handleCardClick(visibleBusinesses[prevIndex]);
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				const nextIndex = (currentIndex + 1) % visibleBusinesses.length;
				handleCardClick(visibleBusinesses[nextIndex]);
			}
		},
		[visibleBusinesses, selectedBusiness]
	);

	// User location for distance calculations
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					logger.warn("Failed to get user location:", error);
				}
			);
		}
	}, []);

	// Scroll active card into view
	useEffect(() => {
		if (selectedBusiness && activeCardElementRef.current) {
			activeCardElementRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [selectedBusiness]);

	// Utility functions
	const getUrgencyIndicator = (business) => {
		if (business.urgent) return { color: "bg-destructive", label: "Urgent" };
		if (business.responseTime === "Within 1 hour") return { color: "bg-warning", label: "Fast Response" };
		if (business.availability === "Available today") return { color: "bg-success", label: "Available" };
		return null;
	};

	const getTrustScore = (business) => {
		let score = 0;
		if (business.verified) score += 25;
		if (business.backgroundChecked) score += 25;
		if (business.rating >= 4.5) score += 25;
		if (business.reviewCount >= 50) score += 25;
		return score;
	};

	const formatDistance = (distance) => {
		if (!distance) return null;
		return typeof distance === "string" ? distance : `${distance.toFixed(1)} mi`;
	};

	return {
		// Data
		visibleBusinesses,
		filteredBusinesses,

		// State
		hoveredBusinessId,
		sortBy,
		showFilters,
		showSort,
		currentFilters,
		userLocation,
		isLoadingMore,
		itemsToShow,

		// Refs
		listRef,
		activeCardElementRef,
		sentinelRef,

		// Handlers
		handleCardClick,
		handleCardHover,
		handleCardLeave,
		handleFilterClick,
		handleSortSelect,
		handleFiltersChange,
		handleClearFilters,
		handleKeyDown,

		// Utilities
		getUrgencyIndicator,
		getTrustScore,
		formatDistance,

		// Setters
		setSortBy,
		setShowFilters,
		setShowSort,
	};
};
