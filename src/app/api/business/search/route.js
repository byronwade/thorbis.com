/**
 * Business Search API Route for Main App
 * Provides comprehensive business search functionality
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";

// Mock search results for fallback
const mockSearchResults = [
	{
		id: "search-1",
		name: "Pizza Palace",
		slug: "pizza-palace",
		description: "Authentic Italian pizza with fresh ingredients.",
		address: "789 Pizza St",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7649,
		longitude: -122.4294,
		phone: "(555) 111-2222",
		website: "https://example-pizza.com",
		rating: 4.7,
		review_count: 234,
		price_range: "$$",
		featured: true,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"],
		business_categories: [
			{
				category: {
					id: "pizza",
					name: "Pizza",
					slug: "pizza",
				},
			},
		],
	},
	{
		id: "search-2",
		name: "Tech Solutions Hub",
		slug: "tech-solutions-hub",
		description: "Professional IT services and computer repair.",
		address: "321 Tech Ave",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7849,
		longitude: -122.4194,
		phone: "(555) 333-4444",
		website: "https://example-tech.com",
		rating: 4.3,
		review_count: 156,
		price_range: "$$$",
		featured: false,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"],
		business_categories: [
			{
				category: {
					id: "technology",
					name: "Technology",
					slug: "technology",
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
		country: business.country || "US",
		phone: business.phone,
		website: business.website,
		rating: business.rating || 0,
		reviewCount: business.review_count || 0,
		categories: business.business_categories?.map((cat) => cat.category?.name).filter(Boolean) || [],
		price_range: business.price_range,
		featured: business.featured || false,
		verified: business.verified || false,
		photos: business.photos || [],
	};
}

export async function GET(request) {
	const startTime = performance.now();

	try {
		logger.debug("Processing business search request");

		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("query") || "";
		const location = searchParams.get("location") || "";
		const category = searchParams.get("category") || "";
		const limit = parseInt(searchParams.get("limit")) || 20;
		const offset = parseInt(searchParams.get("offset")) || 0;
		const featured = searchParams.get("featured");
		const rating = parseFloat(searchParams.get("rating"));
		const priceRange = searchParams.get("priceRange");
		const useMock = searchParams.get("mock") === "true";

		// If explicitly requested, use mock data
		if (useMock) {
			logger.debug("Using mock search data");
			let filteredResults = [...mockSearchResults];

			// Apply simple filtering to mock data
			if (query.trim()) {
				const queryLower = query.toLowerCase();
				filteredResults = filteredResults.filter((business) => business.name.toLowerCase().includes(queryLower) || business.description.toLowerCase().includes(queryLower));
			}

			const transformedMockData = filteredResults.slice(offset, offset + limit).map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						total: filteredResults.length,
						returned: transformedMockData.length,
						offset: offset,
						limit: limit,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						query: query,
						location: location,
						category: category,
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
			const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						total: mockSearchResults.length,
						returned: transformedMockData.length,
						offset: offset,
						limit: limit,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						query: query,
						location: location,
						category: category,
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
				country,
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
			`,
				{ count: "exact" }
			)
			.eq("status", "published");

		// Apply search filters
		if (query.trim()) {
			// Search across business name, description, and category names
			businessQuery = businessQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
		}

		if (location.trim()) {
			// Search in city and state
			businessQuery = businessQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
		}

		if (category.trim()) {
			// Filter by category slug
			businessQuery = businessQuery.eq("business_categories.category.slug", category);
		}

		if (featured !== null && featured !== undefined) {
			businessQuery = businessQuery.eq("featured", featured === "true");
		}

		if (!isNaN(rating) && rating > 0) {
			businessQuery = businessQuery.gte("rating", rating);
		}

		if (priceRange) {
			businessQuery = businessQuery.eq("price_range", priceRange);
		}

		// Order results by relevance (featured first, then rating)
		businessQuery = businessQuery.order("featured", { ascending: false }).order("rating", { ascending: false }).order("review_count", { ascending: false });

		// Apply pagination
		businessQuery = businessQuery.range(offset, offset + limit - 1);

		const { data: businesses, error, count } = await businessQuery;

		if (error) {
			logger.error("Supabase search query error:", error);
			logger.warn("Database search query failed, falling back to mock data");

			const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						total: mockSearchResults.length,
						returned: transformedMockData.length,
						offset: offset,
						limit: limit,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						query: query,
						location: location,
						category: category,
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

		// If no results found, use mock data as fallback
		if (transformedBusinesses.length === 0 && !query && !location && !category) {
			logger.debug("No businesses found in database, using mock data");
			const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						total: mockSearchResults.length,
						returned: transformedMockData.length,
						offset: offset,
						limit: limit,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						query: query,
						location: location,
						category: category,
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
		logger.performance(`Business search API completed in ${duration.toFixed(2)}ms`);
		logger.debug(`Search returned ${transformedBusinesses.length} businesses for query: "${query}"`);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedBusinesses,
				metadata: {
					total: count || 0,
					returned: transformedBusinesses.length,
					offset: offset,
					limit: limit,
					responseTime: `${duration.toFixed(2)}ms`,
					query: query,
					location: location,
					category: category,
					source: "database",
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=180, stale-while-revalidate=360",
				},
			}
		);
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in business search API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Even on error, provide mock data as a last resort
		logger.warn("Critical error occurred, falling back to mock data");
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit")) || 20;
		const offset = parseInt(searchParams.get("offset")) || 0;
		const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: mockSearchResults.length,
					returned: transformedMockData.length,
					offset: offset,
					limit: limit,
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
	// Handle POST requests for advanced search with body parameters
	const startTime = performance.now();
	let requestBody = {};

	try {
		try {
			requestBody = await request.json();
		} catch (parseError) {
			logger.error("Failed to parse request body:", parseError);
			// Use default values if JSON parsing fails
			requestBody = { query: "", pagination: { limit: 20, offset: 0 } };
		}

		logger.debug("Processing advanced business search request", requestBody);

		const { query = "", location = "", category = "", filters = {}, pagination = { limit: 20, offset: 0 }, sort = { field: "relevance", order: "desc" } } = requestBody;

		// Try to create Supabase client
		const supabase = createSupabaseClient();
		if (!supabase) {
			logger.warn("Supabase client not available, falling back to mock data");
			const { limit, offset } = pagination;
			const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

			return NextResponse.json(
				{
					success: true,
					businesses: transformedMockData,
					metadata: {
						total: mockSearchResults.length,
						returned: transformedMockData.length,
						offset: offset,
						limit: limit,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						query: query,
						location: location,
						category: category,
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
			`,
				{ count: "exact" }
			)
			.eq("status", "published");

		// Apply search filters
		if (query.trim()) {
			businessQuery = businessQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
		}

		if (location.trim()) {
			businessQuery = businessQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
		}

		if (category.trim()) {
			businessQuery = businessQuery.eq("business_categories.category.slug", category);
		}

		// Apply additional filters
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

		// Apply sorting
		switch (sort.field) {
			case "rating":
				businessQuery = businessQuery.order("rating", { ascending: sort.order === "asc" });
				break;
			case "name":
				businessQuery = businessQuery.order("name", { ascending: sort.order === "asc" });
				break;
			case "distance":
				// Distance sorting would require PostGIS functions
				businessQuery = businessQuery.order("featured", { ascending: false }).order("rating", { ascending: false });
				break;
			default: // relevance
				businessQuery = businessQuery.order("featured", { ascending: false }).order("rating", { ascending: false });
		}

		// Apply pagination
		businessQuery = businessQuery.range(pagination.offset, pagination.offset + pagination.limit - 1);

		const { data: businesses, error, count } = await businessQuery;

		if (error) {
			logger.error("Supabase advanced search query error:", error);
			throw error;
		}

		// Transform data for client consumption
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
		}));

		const duration = performance.now() - startTime;
		logger.performance(`Advanced business search API completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedBusinesses,
				metadata: {
					total: count || 0,
					returned: transformedBusinesses.length,
					offset: pagination.offset,
					limit: pagination.limit,
					responseTime: `${duration.toFixed(2)}ms`,
					query: query,
					filters: filters,
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=180, stale-while-revalidate=360",
				},
			}
		);
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in advanced business search API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Even on error, provide mock data as a last resort
		logger.warn("Critical error occurred in POST search, falling back to mock data");
		const { pagination = { limit: 20, offset: 0 } } = requestBody;
		const { limit, offset } = pagination;
		const transformedMockData = mockSearchResults.slice(offset, offset + limit).map(transformBusiness);

		return NextResponse.json(
			{
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: mockSearchResults.length,
					returned: transformedMockData.length,
					offset: offset,
					limit: limit,
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
