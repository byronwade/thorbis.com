/**
 * Categories API Route
 * Provides business categories for filters and navigation
 */

import { NextResponse } from "next/server";
import { serviceSupabase } from "@lib/database/supabase/client";
import logger from "@lib/utils/logger";

// Mock categories data for development/testing
const mockCategories = [
	{
		id: "restaurant",
		name: "Restaurant",
		slug: "restaurant",
		description: "Dining establishments and eateries",
		business_count: 45,
	},
	{
		id: "cafe",
		name: "Cafe",
		slug: "cafe", 
		description: "Coffee shops and casual dining",
		business_count: 23,
	},
	{
		id: "retail",
		name: "Retail",
		slug: "retail",
		description: "Shopping and retail stores",
		business_count: 67,
	},
	{
		id: "services",
		name: "Services",
		slug: "services",
		description: "Professional and personal services",
		business_count: 89,
	},
	{
		id: "health",
		name: "Health & Wellness",
		slug: "health",
		description: "Healthcare and wellness services",
		business_count: 34,
	},
	{
		id: "automotive",
		name: "Automotive",
		slug: "automotive",
		description: "Auto services and dealerships",
		business_count: 12,
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
		logger.warn(`Missing environment variables for categories API (will use mock data): ${missing.join(", ")}`);
		return null;
	}

	return requiredEnvVars;
}

// Get Supabase client with error handling
function getSupabaseClient() {
	try {
		return serviceSupabase();
	} catch (error) {
		logger.error("Failed to get Supabase client for categories:", error);
		return null;
	}
}

export async function GET(request) {
	const startTime = performance.now();

	try {
		logger.debug("Fetching categories");

		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const includeCount = searchParams.get("count") !== "false"; // Default to true
		const useMock = searchParams.get("mock") === "true";

		// If explicitly requested or if environment is not set up, use mock data
		if (useMock) {
			logger.debug("Using mock categories data");
			
			return NextResponse.json(
				{
					success: true,
					categories: mockCategories,
					metadata: {
						total: mockCategories.length,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						includeCount: includeCount,
						source: "mock",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
					},
				}
			);
		}

		// Try to get Supabase client
		const supabase = getSupabaseClient();
		if (!supabase) {
			logger.warn("Supabase client not available for categories, falling back to mock data");
			
			return NextResponse.json(
				{
					success: true,
					categories: mockCategories,
					metadata: {
						total: mockCategories.length,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						includeCount: includeCount,
						source: "fallback",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
					},
				}
			);
		}

		// Try to query the database
		let query = supabase
			.from("categories")
			.select(`
				id,
				name,
				slug,
				description,
				${includeCount ? 'business_categories(count)' : ''}
			`)
			.order("name", { ascending: true });

		const { data: categories, error } = await query;

		if (error) {
			logger.error("Supabase categories query error:", error);
			logger.warn("Categories database query failed, falling back to mock data");

			return NextResponse.json(
				{
					success: true,
					categories: mockCategories,
					metadata: {
						total: mockCategories.length,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						includeCount: includeCount,
						source: "fallback",
						error: error.message,
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
					},
				}
			);
		}

		// Transform data for client consumption
		const transformedCategories = (categories || []).map(transformCategory);

		// If no categories found, use mock data as fallback
		if (transformedCategories.length === 0) {
			logger.debug("No categories found in database, using mock data");
			
			return NextResponse.json(
				{
					success: true,
					categories: mockCategories,
					metadata: {
						total: mockCategories.length,
						responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
						includeCount: includeCount,
						source: "fallback",
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
					},
				}
			);
		}

		const duration = performance.now() - startTime;
		logger.performance(`Categories API completed in ${duration.toFixed(2)}ms`);
		logger.debug(`Returned ${transformedCategories.length} categories`);

		return NextResponse.json(
			{
				success: true,
				categories: transformedCategories,
				metadata: {
					total: transformedCategories.length,
					responseTime: `${duration.toFixed(2)}ms`,
					includeCount: includeCount,
					source: "database",
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=1800, stale-while-revalidate=3600", // 30 minutes cache
				},
			}
		);
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error("Error in categories API:", {
			error: error.message,
			stack: error.stack,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Even on error, provide mock data as a last resort
		logger.warn("Critical error occurred in categories API, falling back to mock data");

		return NextResponse.json(
			{
				success: true,
				categories: mockCategories,
				metadata: {
					total: mockCategories.length,
					responseTime: `${duration.toFixed(2)}ms`,
					source: "emergency_fallback",
					error: error.message,
				},
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
				},
			}
		);
	}
}

// Helper function to transform category data consistently
function transformCategory(category) {
	return {
		id: category.id,
		name: category.name,
		slug: category.slug,
		description: category.description,
		business_count: category.business_categories?.length || 0,
	};
}
