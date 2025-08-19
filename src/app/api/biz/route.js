/**
 * Business Map API Route for Main App
 * Provides geographic-based business fetching for map views
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";

// Mock map data for fallback
const mockMapBusinesses = [
	{
		id: "map-1",
		name: "Downtown Deli",
		slug: "downtown-deli",
		description: "Fresh sandwiches and salads in the heart of downtown.",
		address: "101 Market St",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7849,
		longitude: -122.4094,
		phone: "(555) 555-1010",
		website: "https://example-deli.com",
		rating: 4.4,
		review_count: 98,
		price_range: "$$",
		featured: true,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"],
		hours: "Mon-Fri: 7am-7pm, Sat-Sun: 8am-6pm",
		business_categories: [
			{
				category: {
					id: "deli",
					name: "Deli",
					slug: "deli",
				},
			},
		],
	},
	{
		id: "map-2",
		name: "Neighborhood Gym",
		slug: "neighborhood-gym",
		description: "Full-service fitness center with modern equipment.",
		address: "567 Fitness Blvd",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7749,
		longitude: -122.4194,
		phone: "(555) 555-2020",
		website: "https://example-gym.com",
		rating: 4.1,
		review_count: 203,
		price_range: "$$$",
		featured: false,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"],
		hours: "Mon-Sun: 5am-11pm",
		business_categories: [
			{
				category: {
					id: "fitness",
					name: "Fitness",
					slug: "fitness",
				},
			},
		],
	},
	{
		id: "map-3",
		name: "Artisan Bakery",
		slug: "artisan-bakery",
		description: "Handcrafted breads and pastries made daily.",
		address: "890 Baker St",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7649,
		longitude: -122.4294,
		phone: "(555) 555-3030",
		website: "https://example-bakery.com",
		rating: 4.8,
		review_count: 156,
		price_range: "$$",
		featured: true,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"],
		hours: "Tue-Sun: 6am-6pm",
		business_categories: [
			{
				category: {
					id: "bakery",
					name: "Bakery",
					slug: "bakery",
				},
			},
		],
	},
];

// Environment validation
function validateEnvironment() {
	const requiredEnvVars = {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	};

	const missing = Object.entries(requiredEnvVars)
		.filter(([_, value]) => !value)
		.map(([key, _]) => key);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
	}

	return requiredEnvVars;
}

// Create Supabase client with error handling
function createSupabaseClient() {
	try {
		const env = validateEnvironment();
		return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				persistSession: false,
			},
		});
	} catch (error) {
		logger.error("Failed to create Supabase client:", error);
		return null;
	}
}

// Helper function to transform business data consistently
function transformBusiness(business) {
	return {
		id: business.id,
		name: business.name,
		slug: business.slug,
		description: business.description,
		coordinates: {
			lat: business.latitude,
			lng: business.longitude,
		},
		address: business.address,
		city: business.city,
		state: business.state,
		phone: business.phone,
		website: business.website,
		rating: business.rating || 0,
		reviewCount: business.review_count || 0,
		categories: business.business_categories?.map((cat) => cat.category?.name).filter(Boolean) || [],
		price_range: business.price_range,
		featured: business.featured || false,
		verified: business.verified || false,
		photos: business.photos || [],
		hours: business.hours || "",
	};
}

export async function GET(request) {
	const startTime = performance.now();

	try {
		logger.debug("Processing business map request");

		// Parse query parameters for geographic bounds
		const { searchParams } = new URL(request.url);
		const north = parseFloat(searchParams.get("north"));
		const south = parseFloat(searchParams.get("south"));
		const east = parseFloat(searchParams.get("east"));
		const west = parseFloat(searchParams.get("west"));
		const zoom = parseInt(searchParams.get("zoom")) || 10;
		const query = searchParams.get("query") || "";
		const limit = parseInt(searchParams.get("limit")) || 100;
		const useMock = searchParams.get("mock") === "true";

		// Validate required geographic parameters (allow mock data to bypass validation)
		if (!useMock && (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west))) {
			logger.warn("Invalid geographic bounds provided, falling back to mock data");
			const transformedMockData = mockMapBusinesses.map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						count: transformedMockData.length,
						bounds: { north: 37.8, south: 37.7, east: -122.4, west: -122.5 },
						zoom: zoom,
						query: query,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						source: "fallback",
						note: "Invalid bounds provided",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
					},
				}
			);
		}

		// If explicitly requested, use mock data
		if (useMock) {
			logger.debug("Using mock map data");
			let filteredResults = [...mockMapBusinesses];

			// Apply simple filtering to mock data
			if (query.trim()) {
				const queryLower = query.toLowerCase();
				filteredResults = filteredResults.filter((business) => business.name.toLowerCase().includes(queryLower) || business.description.toLowerCase().includes(queryLower));
			}

			const transformedMockData = filteredResults.map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						count: transformedMockData.length,
						bounds: { north, south, east, west },
						zoom: zoom,
						query: query,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						source: "mock",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
					},
				}
			);
		}

		// Try to create Supabase client
		const supabase = createSupabaseClient();
		if (!supabase) {
			logger.warn("Supabase client not available, falling back to mock data");
			const transformedMockData = mockMapBusinesses.map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						count: transformedMockData.length,
						bounds: { north, south, east, west },
						zoom: zoom,
						query: query,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						source: "fallback",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
					},
				}
			);
		}

		// Build the base query for businesses within bounds
		let businessQuery = supabase
			.from("businesses")
			.select(
				`
				id,
				name,
				slug,
				description,
				address,
				city,
				state,
				latitude,
				longitude,
				phone,
				website,
				rating,
				review_count,
				price_range,
				featured,
				verified,
				photos,
				business_categories(
					category:categories(
						id,
						name,
						slug
					)
				)
			`
			)
			.eq("status", "published")
			.not("latitude", "is", null)
			.not("longitude", "is", null)
			.gte("latitude", south)
			.lte("latitude", north)
			.gte("longitude", west)
			.lte("longitude", east);

		// Apply search query if provided
		if (query.trim()) {
			businessQuery = businessQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
		}

		// Adjust limit based on zoom level (more businesses for higher zoom levels)
		const adjustedLimit = Math.min(limit, zoom > 15 ? 200 : zoom > 12 ? 100 : 50);

		// Order by featured first, then rating
		businessQuery = businessQuery.order("featured", { ascending: false }).order("rating", { ascending: false }).order("review_count", { ascending: false }).limit(adjustedLimit);

		const { data: businesses, error } = await businessQuery;

		if (error) {
			logger.error("Supabase map query error:", error);
			logger.warn("Database map query failed, falling back to mock data");

			const transformedMockData = mockMapBusinesses.map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						count: transformedMockData.length,
						bounds: { north, south, east, west },
						zoom: zoom,
						query: query,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						source: "fallback",
						error: error.message,
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
					},
				}
			);
		}

		// Transform data for client consumption
		const transformedBusinesses = (businesses || []).map(transformBusiness);

		// If no businesses found within bounds, use mock data as fallback
		if (transformedBusinesses.length === 0) {
			logger.debug("No businesses found in database for bounds, using mock data");
			const transformedMockData = mockMapBusinesses.map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						count: transformedMockData.length,
						bounds: { north, south, east, west },
						zoom: zoom,
						query: query,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						source: "fallback",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
					},
				}
			);
		}

		const duration = performance.now() - startTime;
		logger.performance(`Business map API completed in ${duration.toFixed(2)}ms`);
		logger.debug(`Map query returned ${transformedBusinesses.length} businesses within bounds`);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedBusinesses,
				metadata: {
					count: transformedBusinesses.length,
					bounds: { north, south, east, west },
					zoom: zoom,
					query: query,
					responseTime: `${duration.toFixed(2)}ms`,
					source: "database",
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			}
		);
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in business map API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Even on error, provide mock data as a last resort
		logger.warn("Critical error occurred, falling back to mock data");
		const transformedMockData = mockMapBusinesses.map(transformBusiness);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedMockData,
				metadata: {
					count: transformedMockData.length,
					bounds: { north: 37.8, south: 37.7, east: -122.4, west: -122.5 },
					zoom: 10,
					query: "",
					responseTime: `${duration.toFixed(2)}ms`,
					source: "emergency_fallback",
					error: error.message,
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			}
		);
	}
}

export async function POST(request) {
	// Handle POST requests for advanced geographic queries
	const startTime = performance.now();

	try {
		const body = await request.json();
		logger.debug("Processing advanced business map request", body);

		const { bounds, filters = {}, options = { limit: 100, includeMetrics: false } } = body;

		// Validate bounds
		if (!bounds || typeof bounds.north !== "number" || typeof bounds.south !== "number" || typeof bounds.east !== "number" || typeof bounds.west !== "number") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid bounds",
					message: "Bounds object with north, south, east, west coordinates is required",
					businesses: [],
				},
				{ status: 400 }
			);
		}

		// Build the base query
		let businessQuery = supabase
			.from("businesses")
			.select(
				`
				id,
				name,
				slug,
				description,
				address,
				city,
				state,
				latitude,
				longitude,
				phone,
				website,
				rating,
				review_count,
				price_range,
				featured,
				verified,
				photos,
				business_categories(
					category:categories(
						id,
						name,
						slug
					)
				)
			`
			)
			.eq("status", "published")
			.not("latitude", "is", null)
			.not("longitude", "is", null)
			.gte("latitude", bounds.south)
			.lte("latitude", bounds.north)
			.gte("longitude", bounds.west)
			.lte("longitude", bounds.east);

		// Apply filters
		if (filters.query && filters.query.trim()) {
			businessQuery = businessQuery.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
		}

		if (filters.category) {
			businessQuery = businessQuery.eq("business_categories.category.slug", filters.category);
		}

		if (filters.featured !== undefined) {
			businessQuery = businessQuery.eq("featured", filters.featured);
		}

		if (filters.verified !== undefined) {
			businessQuery = businessQuery.eq("verified", filters.verified);
		}

		if (filters.rating && filters.rating > 0) {
			businessQuery = businessQuery.gte("rating", filters.rating);
		}

		if (filters.priceRange) {
			businessQuery = businessQuery.eq("price_range", filters.priceRange);
		}

		// Apply sorting and limits
		businessQuery = businessQuery
			.order("featured", { ascending: false })
			.order("rating", { ascending: false })
			.order("review_count", { ascending: false })
			.limit(options.limit || 100);

		const { data: businesses, error } = await businessQuery;

		if (error) {
			logger.error("Supabase advanced map query error:", error);
			throw error;
		}

		// Transform data
		const transformedBusinesses = (businesses || []).map((business) => ({
			id: business.id,
			name: business.name,
			slug: business.slug,
			description: business.description,
			coordinates: {
				lat: business.latitude,
				lng: business.longitude,
			},
			address: business.address,
			city: business.city,
			state: business.state,
			phone: business.phone,
			website: business.website,
			rating: business.rating || 0,
			reviewCount: business.review_count || 0,
			categories: business.business_categories?.map((cat) => cat.category?.name).filter(Boolean) || [],
			price_range: business.price_range,
			featured: business.featured || false,
			verified: business.verified || false,
			photos: business.photos || [],
			hours: business.hours || "",
		}));

		const duration = performance.now() - startTime;
		logger.performance(`Advanced business map API completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedBusinesses,
				metadata: {
					count: transformedBusinesses.length,
					bounds: bounds,
					filters: filters,
					responseTime: `${duration.toFixed(2)}ms`,
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			}
		);
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in advanced business map API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch businesses for map",
				message: error.message,
				businesses: [],
				metadata: {
					count: 0,
					responseTime: `${duration.toFixed(2)}ms`,
				},
			},
			{ status: 500 }
		);
	}
}
