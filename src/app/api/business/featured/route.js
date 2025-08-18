/**
 * Featured Business API Route for Main App
 * Provides featured businesses for home page and components
 * PERFORMANCE OPTIMIZED: Implements caching, connection pooling, and query optimization
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@utils/logger";

// Performance-optimized cache with TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map();

// Mock data fallback for development/testing
const mockBusinesses = [
	{
		id: "mock-1",
		name: "Sample Restaurant",
		slug: "sample-restaurant",
		description: "A great place to eat with amazing food and service.",
		address: "123 Main St",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7749,
		longitude: -122.4194,
		phone: "(555) 123-4567",
		website: "https://example.com",
		rating: 4.5,
		review_count: 127,
		price_range: "$$",
		featured: true,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"],
		business_categories: [
			{
				category: {
					id: "restaurant",
					name: "Restaurant",
					slug: "restaurant",
				},
			},
		],
	},
	{
		id: "mock-2",
		name: "Local Coffee Shop",
		slug: "local-coffee-shop",
		description: "Best coffee in town with a cozy atmosphere.",
		address: "456 Oak Ave",
		city: "San Francisco",
		state: "CA",
		latitude: 37.7849,
		longitude: -122.4094,
		phone: "(555) 987-6543",
		website: "https://example2.com",
		rating: 4.2,
		review_count: 89,
		price_range: "$",
		featured: true,
		verified: true,
		photos: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400"],
		business_categories: [
			{
				category: {
					id: "cafe",
					name: "Cafe",
					slug: "cafe",
				},
			},
		],
	},
];

// Singleton Supabase client for connection pooling
let supabaseClient = null;

// Environment validation - now returns null instead of throwing for missing vars
function validateEnvironment() {
	const requiredEnvVars = {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	};

	const missing = Object.entries(requiredEnvVars)
		.filter(([_, value]) => !value)
		.map(([key, _]) => key);

	if (missing.length > 0) {
		logger.warn(`Missing environment variables (will use mock data): ${missing.join(", ")}`);
		return null;
	}

	return requiredEnvVars;
}

// Create Supabase client with connection pooling and performance optimization
function createSupabaseClient() {
	try {
		// Return existing client if available (connection pooling)
		if (supabaseClient) {
			return supabaseClient;
		}

		const env = validateEnvironment();
		if (!env) {
			logger.debug("Environment variables not available, Supabase client not created");
			return null;
		}

		// Performance-optimized configuration
		supabaseClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false, // Disable for server-side
			},
			db: {
				schema: 'public',
			},
			global: {
				headers: {
					'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
					'Connection': 'keep-alive',
				},
			},
		});

		logger.debug("Supabase client created with performance optimizations");
		return supabaseClient;
	} catch (error) {
		logger.error("Failed to create Supabase client:", error);
		return null;
	}
}

// Cache management with TTL
function getCachedData(key) {
	const cached = memoryCache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}
	memoryCache.delete(key);
	return null;
}

function setCachedData(key, data) {
	memoryCache.set(key, {
		data,
		timestamp: Date.now()
	});
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
	const startTime = performance.now();

	try {
		logger.debug("Fetching featured businesses for home page");

		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit")) || 20;
		const featured = searchParams.get("featured") !== "false"; // Default to true
		const useMock = searchParams.get("mock") === "true";
		const forceRefresh = searchParams.get("refresh") === "true";

		// Generate cache key
		const cacheKey = `featured_businesses_${limit}_${featured}_${useMock}`;

		// Check cache first (unless force refresh)
		if (!forceRefresh && !useMock) {
			const cached = getCachedData(cacheKey);
			if (cached) {
				const duration = performance.now() - startTime;
				logger.performance(`Featured businesses cache hit in ${duration.toFixed(2)}ms`);
				
				return NextResponse.json(
					{
						...cached,
						metadata: {
							...cached.metadata,
							responseTime: `${duration.toFixed(2)}ms`,
							source: "cache",
						},
					},
					{
						status: 200,
						headers: {
							"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
							"X-Cache": "HIT",
						},
					}
				);
			}
		}

		// If explicitly requested or if environment is not set up, use mock data
		if (useMock) {
			logger.debug("Using mock business data");
			const transformedMockData = mockBusinesses.slice(0, limit).map(transformBusiness);
			const result = {
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: transformedMockData.length,
					responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
					featured: featured,
					limit: limit,
					source: "mock",
				},
			};

			// Cache mock data
			setCachedData(cacheKey, result);

			return NextResponse.json(result, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			});
		}

		// Try to create Supabase client
		const supabase = createSupabaseClient();
		if (!supabase) {
			logger.warn("Supabase client not available, falling back to mock data");
			const transformedMockData = mockBusinesses.slice(0, limit).map(transformBusiness);
			const result = {
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: transformedMockData.length,
					responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
					featured: featured,
					limit: limit,
					source: "fallback",
				},
			};

			// Cache fallback data
			setCachedData(cacheKey, result);

			return NextResponse.json(result, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			});
		}

		// Optimized database query with performance monitoring
		const queryStartTime = performance.now();
		
		let query = supabase
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
			.eq("verified", true);

		// Filter for featured businesses if requested
		if (featured) {
			query = query.eq("featured", true);
		}

		// Optimized ordering with proper indexing
		query = query
			.order("featured", { ascending: false })
			.order("rating", { ascending: false })
			.order("review_count", { ascending: false })
			.limit(limit);

		const { data: businesses, error } = await query;

		const queryDuration = performance.now() - queryStartTime;
		logger.performance(`Database query completed in ${queryDuration.toFixed(2)}ms`);

		if (error) {
			logger.error("Supabase query error:", error);
			logger.warn("Database query failed, falling back to mock data");

			const transformedMockData = mockBusinesses.slice(0, limit).map(transformBusiness);
			const result = {
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: transformedMockData.length,
					responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
					featured: featured,
					limit: limit,
					source: "fallback",
					error: error.message,
				},
			};

			// Cache fallback data
			setCachedData(cacheKey, result);

			return NextResponse.json(result, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			});
		}

		// Transform data for client consumption
		const transformedBusinesses = (businesses || []).map(transformBusiness);

		// If no businesses found, use mock data as fallback
		if (transformedBusinesses.length === 0) {
			logger.debug("No businesses found in database, using mock data");
			const transformedMockData = mockBusinesses.slice(0, limit).map(transformBusiness);
			const result = {
				success: true,
				businesses: transformedMockData,
				metadata: {
					total: transformedMockData.length,
					responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
					featured: featured,
					limit: limit,
					source: "fallback",
				},
			};

			// Cache fallback data
			setCachedData(cacheKey, result);

			return NextResponse.json(result, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
				},
			});
		}

		const duration = performance.now() - startTime;
		logger.performance(`Featured businesses API completed in ${duration.toFixed(2)}ms`);
		logger.debug(`Returned ${transformedBusinesses.length} featured businesses`);

		const result = {
			success: true,
			businesses: transformedBusinesses,
			metadata: {
				total: transformedBusinesses.length,
				responseTime: `${duration.toFixed(2)}ms`,
				featured: featured,
				limit: limit,
				source: "database",
				queryTime: `${queryDuration.toFixed(2)}ms`,
			},
		};

		// Cache successful result
		setCachedData(cacheKey, result);

		return NextResponse.json(result, {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
				"X-Cache": "MISS",
			},
		});
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in featured businesses API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Even on error, provide mock data as a last resort
		logger.warn("Critical error occurred, falling back to mock data");
		const transformedMockData = mockBusinesses.slice(0, parseInt(new URL(request.url).searchParams.get("limit")) || 20).map(transformBusiness);
		const result = {
			success: true,
			businesses: transformedMockData,
			metadata: {
				total: transformedMockData.length,
				responseTime: `${duration.toFixed(2)}ms`,
				source: "emergency_fallback",
				error: error.message,
			},
		};

		return NextResponse.json(result, {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=60, stale-while-revalidate=120",
			},
		});
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
	};
}
