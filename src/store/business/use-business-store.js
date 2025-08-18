import { create } from "zustand";
import debounce from "lodash/debounce";
import { useMapStore } from "@store/map";
import { logger } from "@utils/logger";
import { safeBusinessWrapper } from "@utils/business-data-safety-wrapper";

/**
 * Promise-safe state setter - ensures only resolved arrays are set to state
 * Prevents Promise objects from leaking into the reactive state
 */
const setSafeBusinessState = (set, stateUpdates) => {
	const safeUpdates = {};

	// Process each state update to ensure no Promises
	for (const [key, value] of Object.entries(stateUpdates)) {
		// Check for business array properties that need Promise safety
		if (["allBusinesses", "filteredBusinesses"].includes(key)) {
			// Double-check that we're not setting a Promise
			if (value instanceof Promise) {
				logger.error(`[setSafeBusinessState] Attempted to set Promise to ${key} - this should never happen!`);
				if (process.env.NODE_ENV === "development") {
					console.trace(`Promise detected in state setter for ${key}:`);
				}
				safeUpdates[key] = []; // Emergency fallback
				continue;
			}

			// Use safety wrapper to ensure valid array
			safeUpdates[key] = safeBusinessWrapper(value, `setState_${key}`);
		} else {
			// Non-business array properties pass through normally
			safeUpdates[key] = value;
		}
	}

	set(safeUpdates);
};

// Removed mock data generation - now using real Supabase data

// Original mock businesses as fallback
const mockBusinesses = [
	{
		id: "1",
		name: "Joe's Pizza Palace",
		slug: "joes-pizza-palace",
		description: "Authentic New York style pizza with fresh ingredients and traditional recipes passed down through generations.",
		categories: ["Restaurant", "Pizza", "Italian"],
		ratings: { overall: 4.5 },
		reviewCount: 127,
		address: "123 Main St, San Francisco, CA 94102",
		phone: "(415) 555-0123",
		website: "https://joespizza.com",
		hours: "Mon-Sun 11AM-10PM",
		coordinates: { lat: 37.7749, lng: -122.4194 },
		isOpenNow: true,
		price: "$$",
		statusMessage: "Closes at 10 PM",
		isSponsored: false,
		logo: null,
	},
	{
		id: "2",
		name: "Smith's Auto Repair",
		slug: "smiths-auto-repair",
		description: "Professional automotive repair services with over 20 years of experience. Specializing in brake repair, oil changes, and engine diagnostics.",
		categories: ["Automotive", "Auto Repair", "Service"],
		ratings: { overall: 4.8 },
		reviewCount: 89,
		address: "456 Oak Ave, San Francisco, CA 94103",
		phone: "(415) 555-0456",
		website: "https://smithsauto.com",
		hours: "Mon-Fri 8AM-6PM, Sat 9AM-4PM",
		coordinates: { lat: 37.7849, lng: -122.4094 },
		isOpenNow: true,
		price: "$$$",
		statusMessage: "Closes at 6 PM",
		isSponsored: true,
		logo: null,
	},
	{
		id: "3",
		name: "Bella's Hair Salon",
		slug: "bellas-hair-salon",
		description: "Full-service hair salon offering cuts, colors, styling, and treatments. Our experienced stylists stay current with the latest trends.",
		categories: ["Beauty & Spas", "Hair Salon", "Beauty"],
		ratings: { overall: 4.3 },
		reviewCount: 156,
		address: "789 Pine St, San Francisco, CA 94104",
		phone: "(415) 555-0789",
		website: "https://bellashair.com",
		hours: "Tue-Sat 9AM-7PM, Sun 10AM-5PM",
		coordinates: { lat: 37.7649, lng: -122.4294 },
		isOpenNow: false,
		price: "$$",
		statusMessage: "Closed - Opens at 9 AM",
		isSponsored: false,
		logo: null,
	},
	{
		id: "4",
		name: "Downtown Dental Care",
		slug: "downtown-dental-care",
		description: "Comprehensive dental services including cleanings, fillings, crowns, and cosmetic dentistry in a comfortable, modern environment.",
		categories: ["Health & Medical", "Dentist", "Healthcare"],
		ratings: { overall: 4.7 },
		reviewCount: 203,
		address: "321 Market St, San Francisco, CA 94105",
		phone: "(415) 555-0321",
		website: "https://downtowndental.com",
		hours: "Mon-Thu 8AM-6PM, Fri 8AM-4PM",
		coordinates: { lat: 37.7949, lng: -122.3994 },
		isOpenNow: true,
		price: "$$$",
		statusMessage: "Closes at 6 PM",
		isSponsored: false,
		logo: null,
	},
	{
		id: "5",
		name: "The Coffee Corner",
		slug: "the-coffee-corner",
		description: "Artisan coffee shop serving locally roasted beans, fresh pastries, and light lunch options. Perfect spot for work or relaxation.",
		categories: ["Coffee & Tea", "Cafe", "Breakfast"],
		ratings: { overall: 4.2 },
		reviewCount: 78,
		address: "654 Union St, San Francisco, CA 94106",
		phone: "(415) 555-0654",
		website: "https://coffeecorner.com",
		hours: "Mon-Fri 6AM-8PM, Sat-Sun 7AM-9PM",
		coordinates: { lat: 37.7549, lng: -122.4394 },
		isOpenNow: true,
		price: "$",
		statusMessage: "Closes at 8 PM",
		isSponsored: false,
		logo: null,
	},
	{
		id: "6",
		name: "Golden Gate Plumbing",
		slug: "golden-gate-plumbing",
		description: "Licensed plumbing contractors providing emergency repairs, installations, and maintenance services throughout the Bay Area.",
		categories: ["Home Services", "Plumbing", "Contractors"],
		ratings: { overall: 4.6 },
		reviewCount: 94,
		address: "987 Broadway, San Francisco, CA 94107",
		phone: "(415) 555-0987",
		website: "https://ggplumbing.com",
		hours: "24/7 Emergency Service",
		coordinates: { lat: 37.7449, lng: -122.4494 },
		isOpenNow: true,
		price: "$$$",
		statusMessage: "24/7 Service Available",
		isSponsored: true,
		logo: null,
	},
];

const useBusinessStore = create((set, get) => ({
	allBusinesses: [],
	filteredBusinesses: [],
	activeBusinessId: null,
	selectedBusiness: null,
	initialLoad: true,
	loading: false,
	initialCoordinates: { lat: 37.7749, lng: -122.4194 },
	prevBounds: null,
	cache: new Map(),
	preventFetch: false,

	setInitialCoordinates: (lat, lng) => {
		set({ initialCoordinates: { lat, lng } });
		logger.debug("Initial coordinates set to:", { lat, lng });
	},

	// Enhanced search method using API endpoint with Promise safety
	searchBusinesses: async (query = "", location = "") => {
		try {
			set({ loading: true });

			// Build search parameters
			const searchParams = new URLSearchParams();
			if (query) searchParams.append("query", query);
			if (location) searchParams.append("location", location);
			searchParams.append("limit", "50");

			// Use API endpoint instead of direct Supabase calls
			const response = await fetch(`/api/business/search?${searchParams.toString()}`);
			if (!response.ok) {
				throw new Error(`Search failed: ${response.statusText}`);
			}

			const searchResults = await response.json();

			// Ensure searchResults.businesses is an array
			if (!searchResults || !Array.isArray(searchResults.businesses)) {
				logger.warn("Search API returned invalid business data:", searchResults);
				set({
					allBusinesses: [],
					filteredBusinesses: [],
					loading: false,
				});
				return [];
			}

			// Transform API results to match expected format with safety checks
			const transformedResults = searchResults.businesses
				.filter((business) => business && typeof business === "object" && business.id)
				.map((business) => ({
					id: business.id,
					name: business.name || "Unknown Business",
					slug: business.slug || business.id,
					description: business.description || "",
					categories: Array.isArray(business.categories) ? business.categories : [],
					ratings: { overall: business.rating || 0 },
					reviewCount: business.reviewCount || 0,
					address: business.address || "",
					phone: business.phone || "",
					website: business.website || "",
					hours: business.hours || "",
					coordinates: business.coordinates || { lat: 0, lng: 0 },
					isOpenNow: true, // TODO: Calculate based on hours
					price: business.price_range || "$$",
					statusMessage: `${business.reviewCount || 0} reviews`,
					isSponsored: business.featured || false,
					logo: business.photos?.[0] || null,
					city: business.city || "",
					state: business.state || "",
				}));

			// CRITICAL: Ensure we're setting resolved arrays, not Promises
			const finalResults = Array.isArray(transformedResults) ? transformedResults : [];

			// Update both allBusinesses and filteredBusinesses for map view
			// Use safe setter to prevent Promise leakage
			setSafeBusinessState(set, {
				allBusinesses: finalResults,
				filteredBusinesses: finalResults,
				loading: false,
			});

			logger.debug(`Search completed: ${finalResults.length} results for "${query}" in "${location}"`);
			return finalResults;
		} catch (error) {
			logger.error("Failed to search businesses:", error);
			setSafeBusinessState(set, {
				allBusinesses: [],
				filteredBusinesses: [],
				loading: false,
			});
			return [];
		}
	},

	// New method for general business fetching (used by search page)
	fetchBusinesses: async (query = "", location = "") => {
		return get().searchBusinesses(query, location);
	},

	// Initialize with business data for immediate display
	initializeWithSupabaseData: async () => {
		try {
			set({ loading: true });

			// Get featured/popular businesses via API
			const response = await fetch("/api/business/featured");
			if (!response.ok) {
				throw new Error(`Failed to fetch featured businesses: ${response.statusText}`);
			}

			const homePageData = await response.json();

			// Transform API results to match expected format
			const transformedBusinesses = homePageData.businesses.map((business) => ({
				id: business.id,
				name: business.name,
				slug: business.slug,
				description: business.description,
				categories: business.categories || [],
				ratings: { overall: business.rating },
				reviewCount: business.reviewCount,
				address: business.address,
				phone: business.phone,
				website: business.website,
				hours: business.hours,
				coordinates: business.coordinates,
				isOpenNow: true, // TODO: Calculate based on hours
				price: business.price_range || "$$",
				statusMessage: `${business.reviewCount} reviews`,
				isSponsored: business.featured || false,
				logo: business.photos?.[0] || null,
				city: business.city,
				state: business.state,
			}));

			// CRITICAL: Ensure we're setting resolved arrays, not Promises
			const finalResults = Array.isArray(transformedBusinesses) ? transformedBusinesses : [];

			setSafeBusinessState(set, {
				allBusinesses: finalResults,
				filteredBusinesses: finalResults,
				loading: false,
				initialLoad: false,
			});

			logger.debug("Initialized with business data:", transformedBusinesses.length);
		} catch (error) {
			logger.error("Failed to initialize with business data:", error);

			// Fallback to empty results - better than mock data
			setSafeBusinessState(set, {
				allBusinesses: [],
				filteredBusinesses: [],
				loading: false,
				initialLoad: false,
			});
		}
	},

	fetchInitialBusinesses: async (bounds, zoom, query) => {
		const { activeBusinessId, preventFetch, cache } = get();

		if (!bounds || !zoom) {
			console.error("Bounds or zoom value is missing:", bounds, zoom);
			return;
		}

		if (activeBusinessId || preventFetch) {
			console.log("Skipping initial fetch as there is an active business or fetch is prevented:", activeBusinessId);
			return;
		}

		try {
			set({ loading: true });

			// Use existing API endpoint for map-based business fetching
			const params = new URLSearchParams({
				north: bounds.north.toString(),
				south: bounds.south.toString(),
				east: bounds.east.toString(),
				west: bounds.west.toString(),
				zoom: zoom.toString(),
			});

			if (query) {
				params.append("query", query);
			}

			const response = await fetch(`/api/biz?${params.toString()}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch businesses: ${response.statusText}`);
			}

			const data = await response.json();

			// Transform API results to match expected format
			const transformedBusinesses = data.businesses.map((business) => ({
				id: business.id,
				name: business.name,
				slug: business.slug,
				description: business.description,
				categories: business.categories || [],
				ratings: { overall: business.rating },
				reviewCount: business.reviewCount,
				address: business.address,
				phone: business.phone,
				website: business.website,
				hours: business.hours,
				coordinates: business.coordinates,
				isOpenNow: true,
				price: business.price_range || "$$",
				statusMessage: `${business.reviewCount} reviews`,
				isSponsored: business.featured || false,
				logo: business.photos?.[0] || null,
				city: business.city,
				state: business.state,
			}));

			console.log("Initial businesses fetched:", transformedBusinesses.length);

			cache.set(JSON.stringify(bounds), transformedBusinesses);
			// Use safe setter to prevent Promise leakage
			setSafeBusinessState(set, {
				allBusinesses: transformedBusinesses,
				initialLoad: false,
				loading: false,
			});
			get().filterBusinessesByBounds(bounds);
		} catch (error) {
			console.error("Failed to fetch businesses:", error);
			setSafeBusinessState(set, { loading: false });
		}
	},

	fetchFilteredBusinesses: debounce(async (bounds, zoom, query) => {
		const { activeBusinessId, preventFetch, cache } = get();

		if (!bounds || !zoom) {
			console.error("Bounds or zoom value is missing:", bounds, zoom);
			return;
		}

		if (activeBusinessId || preventFetch) {
			console.log("Skipping filtered fetch as there is an active business or fetch is prevented:", activeBusinessId);
			return;
		}

		console.log("Fetching filtered businesses with bounds:", bounds, "and zoom:", zoom, "and query:", query);

		try {
			set({ loading: true });

			// Use existing API endpoint for map-based business fetching
			const params = new URLSearchParams({
				north: bounds.north.toString(),
				south: bounds.south.toString(),
				east: bounds.east.toString(),
				west: bounds.west.toString(),
				zoom: zoom.toString(),
			});

			if (query) {
				params.append("query", query);
			}

			const response = await fetch(`/api/biz?${params.toString()}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch businesses: ${response.statusText}`);
			}

			const data = await response.json();

			// Transform API results
			const transformedBusinesses = data.businesses.map((business) => ({
				id: business.id,
				name: business.name,
				slug: business.slug,
				description: business.description,
				categories: business.categories || [],
				ratings: { overall: business.rating },
				reviewCount: business.reviewCount,
				address: business.address,
				phone: business.phone,
				website: business.website,
				hours: business.hours,
				coordinates: business.coordinates,
				isOpenNow: true,
				price: business.price_range || "$$",
				statusMessage: `${business.reviewCount} reviews`,
				isSponsored: business.featured || false,
				logo: business.photos?.[0] || null,
				city: business.city,
				state: business.state,
			}));

			console.log("Filtered businesses fetched:", transformedBusinesses.length);

			// CRITICAL: Ensure transformedBusinesses is a resolved array before setting to state
			const safeTransformedBusinesses = safeBusinessWrapper(transformedBusinesses, "fetchFilteredBusinesses");

			cache.set(JSON.stringify(bounds), safeTransformedBusinesses);
			setSafeBusinessState(set, {
				allBusinesses: safeTransformedBusinesses,
				loading: false,
			});
			get().filterBusinessesByBounds(bounds);
		} catch (error) {
			console.error("Failed to fetch businesses:", error);
			setSafeBusinessState(set, { loading: false });
		}
	}, 300),

	filterBusinessesByBounds: (bounds) => {
		const { allBusinesses, prevBounds, activeBusinessId } = get();

		if (prevBounds && JSON.stringify(prevBounds) === JSON.stringify(bounds)) {
			console.log("Bounds have not changed significantly, skipping filtering");
			return;
		}

		const filteredBusinesses = allBusinesses.filter((business) => {
			const coords = business.coordinates;
			if (!coords) return false;

			const { lat, lng } = coords;
			if (lat === undefined || lng === undefined) {
				console.error("Missing lat or lng in business coordinates:", coords);
				return false;
			}

			return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
		});

		if (activeBusinessId) {
			const activeBusiness = get().cache.get(activeBusinessId);
			if (activeBusiness) {
				const { lat, lng } = activeBusiness.coordinates;
				if (!(lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east)) {
					set({ activeBusinessId: null });
					console.log("Active business is out of bounds, setting it to null");
				} else {
					console.log("Active business is within bounds");
				}
			}
		}

		setSafeBusinessState(set, {
			filteredBusinesses,
			prevBounds: bounds,
		});
		console.log("Filtered businesses set:", filteredBusinesses);
	},

	setActiveBusinessId: (id) => {
		const previousActiveBusinessId = get().activeBusinessId;

		if (id === previousActiveBusinessId) {
			console.log("Active business ID is already set to:", id);
			return;
		}

		set({ activeBusinessId: id });
		console.log("Active business ID set to:", id);

		if ((id === null || id === "") && previousActiveBusinessId !== null) {
			console.log("Resetting zoom without triggering fetch");
			const map = useMapStore.getState().fetchMapRef();
			console.log("Map ref:", map);
			if (map) {
				// Use Google Maps methods instead of Mapbox
				set({ preventFetch: true });
				map.setZoom(10);
				// Use setTimeout to simulate the moveend event
				setTimeout(() => {
					console.log("Zoom reset to 10");
					set({ preventFetch: false });
				}, 100);
			}
		}
	},

	setMapRef: (map) => {
		set({ mapRef: map });
	},

	clearFilteredBusinesses: () => set({ filteredBusinesses: [] }),

	// Business selection methods
	setSelectedBusiness: (business) => {
		set({ selectedBusiness: business });
		console.log("Selected business set to:", business?.name || null);
	},

	clearSelectedBusiness: () => {
		set({ selectedBusiness: null });
		console.log("Selected business cleared");
	},
}));

export default useBusinessStore;
