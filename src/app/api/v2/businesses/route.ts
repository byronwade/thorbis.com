/**
 * V2 Businesses Endpoint
 * Comprehensive business management with advanced features
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, ApiRequest } from "@lib/api/middleware";

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
 * Enhanced business search with intelligent filtering
 */
async function searchBusinesses(req: ApiRequest, searchParams: BusinessSearchParams): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Build dynamic select based on includes
		let selectFields = `
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

		if (searchParams.include.includes("photos")) {
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

		if (searchParams.include.includes("categories")) {
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

		if (searchParams.include.includes("reviews")) {
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

		if (searchParams.include.includes("hours")) {
			selectFields += `,
        business_hours(
          day_of_week,
          open_time,
          close_time,
          is_closed
        )
      `;
		}

		if (searchParams.include.includes("metrics")) {
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
		if (searchParams.query) {
			// Use full-text search for better performance
			query = query.or(`name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`);
		}

		// Location filters
		if (searchParams.location) {
			query = query.or(`city.ilike.%${searchParams.location}%,state.ilike.%${searchParams.location}%,address.ilike.%${searchParams.location}%`);
		}

		// Geographic bounds
		if (searchParams.bounds) {
			query = query.gte("latitude", searchParams.bounds.south).lte("latitude", searchParams.bounds.north).gte("longitude", searchParams.bounds.west).lte("longitude", searchParams.bounds.east);
		}

		// Geographic center with radius
		if (searchParams.center) {
			// Use PostGIS for radius search
			query = query.rpc("businesses_within_radius", {
				center_lat: searchParams.center.lat,
				center_lng: searchParams.center.lng,
				radius_km: searchParams.center.radius,
			});
		}

		// Category filters
		if (searchParams.category) {
			query = query.eq("business_categories.category.slug", searchParams.category);
		}

		if (searchParams.categories && searchParams.categories.length > 0) {
			query = query.in("business_categories.category.slug", searchParams.categories);
		}

		// Rating filter
		if (searchParams.rating) {
			query = query.gte("rating", searchParams.rating);
		}

		// Price range filter
		if (searchParams.priceRange) {
			query = query.eq("price_range", searchParams.priceRange);
		}

		// Features filter
		if (searchParams.features && searchParams.features.length > 0) {
			query = query.contains("features", searchParams.features);
		}

		// Verification filter
		if (searchParams.verified !== undefined) {
			query = query.eq("verified", searchParams.verified);
		}

		// Featured filter
		if (searchParams.featured !== undefined) {
			query = query.eq("featured", searchParams.featured);
		}

		// Open now filter
		if (searchParams.open === "now") {
			const now = new Date();
			const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
			const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

			query = query.eq("business_hours.day_of_week", currentDay).eq("business_hours.is_closed", false).lte("business_hours.open_time", currentTime).gte("business_hours.close_time", currentTime);
		}

		// Sorting
		switch (searchParams.sort) {
			case "rating":
				query = query.order("rating", { ascending: false }).order("review_count", { ascending: false });
				break;
			case "distance":
				if (searchParams.center) {
					// Distance sorting will be handled by the PostGIS function
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
		const offset = (searchParams.page - 1) * searchParams.limit;
		query = query.range(offset, offset + searchParams.limit - 1);

		// Execute query
		const { data: businesses, error, count } = await query;

		if (error) {
			logger.error("Business search error:", error);
			throw error;
		}

		// Calculate pagination metadata
		const total = count || 0;
		const pages = Math.ceil(total / searchParams.limit);
		const hasNext = searchParams.page < pages;
		const hasPrev = searchParams.page > 1;

		// Log search for analytics
		logger.businessMetrics({
			action: "business_search",
			query: searchParams.query,
			location: searchParams.location,
			category: searchParams.category,
			resultsCount: businesses?.length || 0,
			userId: req.user?.id,
			filters: {
				rating: searchParams.rating,
				priceRange: searchParams.priceRange,
				features: searchParams.features,
				verified: searchParams.verified,
			},
			timestamp: Date.now(),
		});

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(
			{
				businesses: businesses || [],
				facets: {
					// TODO: Add faceted search results for filters
					categories: [],
					priceRanges: [],
					features: [],
				},
			},
			{
				pagination: {
					page: searchParams.page,
					limit: searchParams.limit,
					total,
					pages,
					hasNext,
					hasPrev,
				},
				performance: {
					queryTime,
					cacheHit: false,
				},
				filters: searchParams,
			}
		);
	} catch (error) {
		logger.error("Business search handler error:", error);
		return createErrorResponse("SEARCH_ERROR", "Failed to search businesses");
	}
}

/**
 * Create new business with comprehensive validation
 */
async function createBusiness(req: ApiRequest, businessData: BusinessCreateData): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		if (!req.user) {
			return createErrorResponse("UNAUTHORIZED", "Authentication required");
		}

		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		// Geocode address if coordinates not provided
		let { latitude, longitude } = businessData;
		if (!latitude || !longitude) {
			try {
				const fullAddress = `${businessData.address}, ${businessData.city}, ${businessData.state} ${businessData.zipCode}`;
				const geocodeResponse = await fetch(`${req.nextUrl.origin}/api/geocode?address=${encodeURIComponent(fullAddress)}`);
				const geocodeData = await geocodeResponse.json();

				if (geocodeData.results?.[0]?.geometry?.location) {
					latitude = geocodeData.results[0].geometry.location.lat;
					longitude = geocodeData.results[0].geometry.location.lng;
				}
			} catch (geocodeError) {
				logger.warn("Geocoding failed:", geocodeError);
			}
		}

		// Generate unique slug
		const baseSlug = businessData.name
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();

		let slug = baseSlug;
		let slugCounter = 1;

		while (true) {
			const { data: existing } = await supabase.from("businesses").select("id").eq("slug", slug).single();

			if (!existing) break;

			slug = `${baseSlug}-${slugCounter}`;
			slugCounter++;
		}

		// Validate categories exist
		const { data: validCategories } = await supabase.from("categories").select("id, slug").in("slug", businessData.categories);

		if (!validCategories || validCategories.length !== businessData.categories.length) {
			return createErrorResponse("INVALID_CATEGORIES", "One or more categories are invalid");
		}

		// Create business record
		const now = new Date().toISOString();
		const { data: business, error: businessError } = await supabase
			.from("businesses")
			.insert({
				name: businessData.name,
				slug,
				description: businessData.description,
				address: businessData.address,
				city: businessData.city,
				state: businessData.state,
				zip_code: businessData.zipCode,
				country: businessData.country,
				phone: businessData.phone,
				website: businessData.website,
				email: businessData.email,
				price_range: businessData.priceRange,
				features: businessData.features || [],
				latitude,
				longitude,
				owner_id: req.user.id,
				status: "pending", // Requires approval
				verified: false,
				rating: 0,
				review_count: 0,
				created_at: now,
				updated_at: now,
				social_media: businessData.socialMedia || {},
			})
			.select()
			.single();

		if (businessError) {
			logger.error("Business creation error:", businessError);
			throw businessError;
		}

		// Link categories
		if (validCategories.length > 0) {
			const categoryLinks = validCategories.map((category) => ({
				business_id: business.id,
				category_id: category.id,
				created_at: now,
			}));

			await supabase.from("business_categories").insert(categoryLinks);
		}

		// Add business hours if provided
		if (businessData.hours) {
			const hoursData = Object.entries(businessData.hours).map(([dayName, hours]) => {
				const dayMap: Record<string, number> = {
					sunday: 0,
					monday: 1,
					tuesday: 2,
					wednesday: 3,
					thursday: 4,
					friday: 5,
					saturday: 6,
				};

				return {
					business_id: business.id,
					day_of_week: dayMap[dayName.toLowerCase()],
					open_time: hours.open,
					close_time: hours.close,
					is_closed: hours.closed || false,
				};
			});

			await supabase.from("business_hours").insert(hoursData);
		}

		// Initialize business metrics
		await supabase.from("business_metrics").insert({
			business_id: business.id,
			views_today: 0,
			views_this_week: 0,
			views_this_month: 0,
			clicks_today: 0,
			calls_today: 0,
			created_at: now,
			updated_at: now,
		});

		// Log business creation
		logger.businessMetrics({
			action: "business_created",
			businessId: business.id,
			businessName: business.name,
			userId: req.user.id,
			categories: businessData.categories,
			location: {
				city: businessData.city,
				state: businessData.state,
				country: businessData.country,
			},
			timestamp: Date.now(),
		});

		// Send notification to admin for approval
		try {
			await supabase.functions.invoke("send-business-approval-notification", {
				body: {
					businessId: business.id,
					businessName: business.name,
					ownerEmail: req.user.email,
				},
			});
		} catch (notificationError) {
			logger.warn("Failed to send approval notification:", notificationError);
		}

		const responseData = {
			business: {
				...business,
				slug,
				categories: validCategories,
				status: "pending",
			},
			message: "Business submitted successfully and is pending approval.",
			nextSteps: ["Your business is under review", "You will receive an email when approved", "Add photos to make your listing more attractive", "Complete your business profile"],
		};

		return createSuccessResponse(
			responseData,
			{
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: false,
				},
			},
			201
		);
	} catch (error) {
		logger.error("Create business handler error:", error);
		return createErrorResponse("CREATION_ERROR", "Failed to create business");
	}
}

// Export GET handler with caching
export const GET = compose(
	withPerformanceMonitoring,
	withCache(searchBusinesses, {
		ttl: 300, // 5 minutes
		keyGenerator: (req) => `businesses:search:${req.nextUrl.search}`,
		skipCache: (req) => req.user?.role === "admin", // Admins see fresh data
	}),
	withValidation(searchBusinesses, businessSearchSchema)
);

// Export POST handler with authentication
export const POST = compose(withPerformanceMonitoring, withAuth(createBusiness, { requireEmailVerification: true }), withValidation(createBusiness, businessCreateSchema));

// Export response types
export type BusinessSearchResponse = {
	success: true;
	data: {
		businesses: any[];
		facets: {
			categories: any[];
			priceRanges: any[];
			features: any[];
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
