/**
 * Business Management API v1
 * Comprehensive business directory and management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse, ApiErrorCode, UsageUnits } from "@/lib/api-response-utils";

// Business search validation schema
const businessSearchSchema = z.object({
	query: z.string().optional(),
	location: z.string().optional(),
	category: z.string().optional(),
	categories: z.array(z.string()).optional(),
	rating: z.coerce.number().min(1).max(5).optional(),
	priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
	features: z.array(z.string()).optional(),
	open: z.enum(["now", "today", "any"]).optional().default("any"),
	verified: z.coerce.boolean().optional(),
	featured: z.coerce.boolean().optional(),
	bounds: z
		.object({
			north: z.coerce.number(),
			south: z.coerce.number(),
			east: z.coerce.number(),
			west: z.coerce.number(),
		})
		.optional(),
	center: z
		.object({
			lat: z.coerce.number(),
			lng: z.coerce.number(),
			radius: z.coerce.number().optional().default(10), // km
		})
		.optional(),
	sort: z.enum(["relevance", "rating", "distance", "newest", "popular"]).optional().default("relevance"),
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	include: z
		.array(z.enum(["photos", "reviews", "categories", "hours", "metrics"]))
		.optional()
		.default(["photos", "categories"]),
});

// Business creation validation schema
const businessCreateSchema = z.object({
	name: z.string().min(2, "Business name must be at least 2 characters").max(200),
	description: z.string().min(10, "Description must be at least 10 characters").max(2000),
	address: z.string().min(5, "Address is required"),
	city: z.string().min(2, "City is required"),
	state: z.string().min(2, "State is required"),
	zipCode: z.string().min(5, "ZIP code is required"),
	country: z.string().optional().default("US"),
	phone: z.string().optional(),
	website: z.string().url().optional().or(z.literal("")),
	email: z.string().email().optional().or(z.literal("")),
	categories: z.array(z.string()).min(1, "At least one category is required").max(5),
	priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
	features: z.array(z.string()).optional().default([]),
	hours: z
		.record(
			z.object({
				open: z.string().optional(),
				close: z.string().optional(),
				closed: z.boolean().optional().default(false),
			})
		)
		.optional(),
	socialMedia: z
		.object({
			facebook: z.string().optional(),
			instagram: z.string().optional(),
			twitter: z.string().optional(),
			linkedin: z.string().optional(),
		})
		.optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
});

type BusinessSearchParams = z.infer<typeof businessSearchSchema>;
type BusinessCreateData = z.infer<typeof businessCreateSchema>;

/**
 * GET /api/v1/businesses - Search businesses with advanced filtering
 */
export async function GET(request: NextRequest) {
	const startTime = performance.now();

	try {
		const { searchParams } = new URL(request.url);
		const queryParams = businessSearchSchema.parse(Object.fromEntries(searchParams));

		// Initialize Supabase client
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					get(name: string) {
						return request.cookies.get(name)?.value;
					},
				},
			}
		);

		// Build dynamic select based on includes
		const selectFields = `
      id,
      name,
      slug,
      description,
      address,
      city,
      state,
      zip_code,
      phone,
      website,
      email,
      rating,
      review_count,
      price_range,
      verified,
      featured,
      latitude,
      longitude,
      created_at,
      updated_at
    `;

		if (queryParams.include.includes("photos")) {
			selectFields += `,
        business_photos(
          id,
          url,
          alt_text,
          caption,
          is_primary,
          order
        )
      `;
		}

		if (queryParams.include.includes("categories")) {
			selectFields += `,
        business_categories(
          category:categories(
            id,
            name,
            slug,
            icon,
            color
          )
        )
      `;
		}

		if (queryParams.include.includes("reviews")) {
			selectFields += `,
        reviews(
          id,
          rating,
          title,
          text,
          created_at,
          helpful_count,
          user_id
        )
      `;
		}

		if (queryParams.include.includes("hours")) {
			selectFields += `,
        business_hours(
          day_of_week,
          open_time,
          close_time,
          is_closed
        )
      `;
		}

		if (queryParams.include.includes("metrics")) {
			selectFields += `,
        business_metrics(
          views_today,
          views_this_week,
          views_this_month,
          clicks_today,
          calls_today,
          updated_at
        )
      `;
		}

		// Build query with filters
		let query = supabase.from("businesses").select(selectFields, { count: "exact" }).eq("status", "published");

		// Text search
		if (queryParams.query) {
			query = query.or(`name.ilike.%${queryParams.query}%,description.ilike.%${queryParams.query}%`);
		}

		// Location filters
		if (queryParams.location) {
			query = query.or(`city.ilike.%${queryParams.location}%,state.ilike.%${queryParams.location}%,address.ilike.%${queryParams.location}%`);
		}

		// Geographic bounds
		if (queryParams.bounds) {
			query = query.gte("latitude", queryParams.bounds.south).lte("latitude", queryParams.bounds.north).gte("longitude", queryParams.bounds.west).lte("longitude", queryParams.bounds.east);
		}

		// Category filters
		if (queryParams.category) {
			query = query.eq("business_categories.category.slug", queryParams.category);
		}

		if (queryParams.categories && queryParams.categories.length > 0) {
			query = query.in("business_categories.category.slug", queryParams.categories);
		}

		// Rating filter
		if (queryParams.rating) {
			query = query.gte("rating", queryParams.rating);
		}

		// Price range filter
		if (queryParams.priceRange) {
			query = query.eq("price_range", queryParams.priceRange);
		}

		// Features filter
		if (queryParams.features && queryParams.features.length > 0) {
			query = query.contains("features", queryParams.features);
		}

		// Verification filter
		if (queryParams.verified !== undefined) {
			query = query.eq("verified", queryParams.verified);
		}

		// Featured filter
		if (queryParams.featured !== undefined) {
			query = query.eq("featured", queryParams.featured);
		}

		// Sorting
		switch (queryParams.sort) {
			case "rating":
				query = query.order("rating", { ascending: false }).order("review_count", { ascending: false });
				break;
			case "distance":
				if (queryParams.center) {
					// Distance sorting would be handled by PostGIS function
				} else {
					query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
				}
				break;
			case "newest":
				query = query.order("created_at", { ascending: false });
				break;
			case "popular":
				query = query.order("review_count", { ascending: false }).order("rating", { ascending: false });
				break;
			default: // relevance
				query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
		}

		// Pagination
		const offset = (queryParams.page - 1) * queryParams.limit;
		query = query.range(offset, offset + queryParams.limit - 1);

		// Execute query
		const { data: businesses, error, count } = await query;

		if (error) {
			console.error("Business search error:", error);
			throw error;
		}

		// Calculate pagination metadata
		const total = count || 0;
		const pages = Math.ceil(total / queryParams.limit);
		const hasNext = queryParams.page < pages;
		const hasPrev = queryParams.page > 1;

		const queryTime = performance.now() - startTime;

		return NextResponse.json(
			createSuccessResponse(
				{
					businesses: businesses || [],
					facets: {
						categories: [],
						priceRanges: [],
						features: [],
					},
					filters: queryParams,
				},
				queryTime,
				{
					pagination: {
						page: queryParams.page,
						limit: queryParams.limit,
						total,
						pages,
						hasNext,
						hasPrev,
					},
					cacheStatus: 'miss',
					usageCost: 0.001,
					usageUnits: UsageUnits.DATABASE_QUERY
				}
			)
		);
	} catch (error) {
		console.error("Business search handler error:", error);
		return NextResponse.json(
			createErrorResponse(
				ApiErrorCode.DATABASE_ERROR,
				'Failed to search businesses',
				{
					details: error instanceof Error ? error.message : 'Unknown error',
					suggestedAction: 'Check search parameters and try again',
					documentationUrl: 'https://thorbis.com/docs/api/businesses'
				}
			),
			{ status: 500 }
		);
	}
}

/**
 * POST /api/v1/businesses - Create new business
 */
export async function POST(request: NextRequest) {
	const startTime = performance.now();

	try {
		const body = await request.json();
		const businessData = businessCreateSchema.parse(body);

		// For now, simulate successful creation
		// In production, this would integrate with authentication and database
		const mockBusiness = {
			id: crypto.randomUUID(),
			...businessData,
			slug: businessData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
			status: "pending",
			verified: false,
			rating: 0,
			review_count: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const queryTime = performance.now() - startTime;

		return NextResponse.json(
			createSuccessResponse(
				{
					business: mockBusiness,
					message: "Business submitted successfully and is pending approval.",
					nextSteps: [
						"Your business is under review",
						"You will receive an email when approved",
						"Add photos to make your listing more attractive",
						"Complete your business profile"
					],
				},
				queryTime,
				{
					cacheStatus: 'miss',
					usageCost: 0.002,
					usageUnits: UsageUnits.DATABASE_QUERY
				}
			),
			{ status: 201 }
		);

	} catch (error) {
		console.error("Create business handler error:", error);
		return NextResponse.json(
			createErrorResponse(
				ApiErrorCode.DATABASE_ERROR,
				'Failed to create business',
				{
					details: error instanceof Error ? error.message : 'Unknown error',
					suggestedAction: 'Check business data and try again',
					documentationUrl: 'https://thorbis.com/docs/api/businesses'
				}
			),
			{ status: 500 }
		);
	}
}

export type BusinessSearchResponse = {
	success: true;
	data: {
		businesses: unknown[];
		facets: {
			categories: unknown[];
			priceRanges: unknown[];
			features: unknown[];
		};
	};
	meta: {
		pagination: {
			page: number;
			limit: number;
			total: number;
			pages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
		filters: BusinessSearchParams;
	};
	timestamp: string;
};

export type BusinessCreateResponse = {
	success: true;
	data: {
		business: any;
		message: string;
		nextSteps: string[];
	};
	meta: {
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	};
	timestamp: string;
};