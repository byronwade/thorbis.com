// REQUIRED: Subdomain Business Filtering API
// Location-aware business search and filtering for specific subdomains

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";
import { z } from "zod";

// Ensure this route is always dynamic and not prerendered during build
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false }, db: { schema: "public" } });
}

// Validation schemas
const businessSearchSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	query: z.string().optional(),
	category: z.string().optional(),
	sort: z.enum(["distance", "rating", "reviews", "name", "featured"]).default("distance"),
	order: z.enum(["asc", "desc"]).default("asc"),
	featured: z.coerce.boolean().optional(),
	verified: z.coerce.boolean().optional(),
	rating: z.coerce.number().min(1).max(5).optional(),
	priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
	radius: z.coerce.number().min(1).max(200).optional(), // Override hub default radius
	includeNearby: z.coerce.boolean().default(true), // Include businesses from nearby areas
});

const addBusinessSchema = z.object({
	businessId: z.string().uuid(),
	isFeatured: z.boolean().default(false),
	autoApprove: z.boolean().default(false),
});

/**
 * GET /api/v2/subdomains/[subdomain]/businesses - Get businesses for a specific subdomain
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
	const startTime = performance.now();

	try {
		const supabase = getSupabase();
		if (!supabase) {
			return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 500 });
		}
		const { subdomain } = await params;
		const { searchParams } = new URL(request.url);
		const searchQuery = businessSearchSchema.parse(Object.fromEntries(searchParams));

		logger.debug("Fetching businesses for subdomain:", { subdomain, query: searchQuery });

		// Get subdomain details first
		const { data: localHub, error: hubError } = await supabase
			.from("local_hubs")
			.select(
				`
				id,
				subdomain,
				name,
				city,
				state,
				latitude,
				longitude,
				radius_km,
				featured_categories,
				excluded_categories,
				status
			`
			)
			.eq("subdomain", subdomain.toLowerCase())
			.eq("status", "active")
			.single();

		if (hubError || !localHub) {
			return NextResponse.json(
				{
					success: false,
					error: "Subdomain not found or inactive",
				},
				{ status: 404 }
			);
		}

		// Build business search query with location filtering
		const businessResults = await searchBusinessesForHub(localHub, searchQuery);

		const duration = performance.now() - startTime;
		logger.performance(`Subdomain business search completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: {
				businesses: businessResults.businesses,
				pagination: businessResults.pagination,
				hub: {
					subdomain: localHub.subdomain,
					name: localHub.name,
					location: `${localHub.city}, ${localHub.state}`,
					coordinates: localHub.latitude && localHub.longitude ? { lat: localHub.latitude, lng: localHub.longitude } : null,
					radius: searchQuery.radius || localHub.radius_km,
				},
				filters: {
					applied: searchQuery,
					available: businessResults.availableFilters,
				},
			},
			meta: {
				searchTime: `${duration.toFixed(2)}ms`,
				resultCount: businessResults.businesses.length,
				totalResults: businessResults.pagination.total,
			},
		});
	} catch (error) {
		logger.error("Subdomain business search error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid search parameters",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/v2/subdomains/[subdomain]/businesses - Add business to subdomain
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
	const startTime = performance.now();

	try {
		const { subdomain } = await params;

		// Authenticate user
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json(
				{
					success: false,
					error: "Authentication required",
				},
				{ status: 401 }
			);
		}

		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid authentication",
				},
				{ status: 401 }
			);
		}

		// Verify user has permission to manage this subdomain
		const hasPermission = await verifySubdomainPermission(user.id, subdomain);
		if (!hasPermission) {
			return NextResponse.json(
				{
					success: false,
					error: "Insufficient permissions",
				},
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { businessId, isFeatured, autoApprove } = addBusinessSchema.parse(body);

		// Get subdomain ID
		const { data: hub } = await supabase.from("local_hubs").select("id, auto_approve_businesses").eq("subdomain", subdomain.toLowerCase()).single();

		if (!hub) {
			return NextResponse.json(
				{
					success: false,
					error: "Subdomain not found",
				},
				{ status: 404 }
			);
		}

		// Verify business exists and get its location
		const { data: business, error: businessError } = await supabase.from("businesses").select("id, name, latitude, longitude, city, state").eq("id", businessId).single();

		if (businessError || !business) {
			return NextResponse.json(
				{
					success: false,
					error: "Business not found",
				},
				{ status: 404 }
			);
		}

		// Calculate distance from hub center
		let distance = null;
		if (business.latitude && business.longitude) {
			const { data: distanceResult } = await supabase.rpc("calculate_distance", {
				lat1: hub.latitude,
				lng1: hub.longitude,
				lat2: business.latitude,
				lng2: business.longitude,
			});
			distance = distanceResult;
		}

		// Determine approval status
		const status = autoApprove || hub.auto_approve_businesses ? "active" : "pending";

		// Add business to hub
		const { data: association, error: addError } = await supabase
			.from("local_hub_businesses")
			.insert({
				local_hub_id: hub.id,
				business_id: businessId,
				is_featured: isFeatured,
				status,
				distance_km: distance,
				added_by: user.id,
				approved_by: status === "active" ? user.id : null,
			})
			.select()
			.single();

		if (addError) {
			if (addError.code === "23505") {
				// Unique constraint violation
				return NextResponse.json(
					{
						success: false,
						error: "Business is already associated with this subdomain",
					},
					{ status: 409 }
				);
			}

			logger.error("Failed to add business to subdomain:", addError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to add business to subdomain",
					details: addError.message,
				},
				{ status: 500 }
			);
		}

		logger.info("Business added to subdomain:", {
			hubId: hub.id,
			subdomain,
			businessId,
			userId: user.id,
			status,
		});

		const duration = performance.now() - startTime;

		return NextResponse.json({
			success: true,
			data: {
				association,
				business: {
					id: business.id,
					name: business.name,
					location: `${business.city}, ${business.state}`,
					distance: distance ? `${distance.toFixed(1)} km` : null,
				},
				status,
				message: status === "active" ? "Business added successfully and is now visible" : "Business added and is pending approval",
			},
			meta: {
				processingTime: `${duration.toFixed(2)}ms`,
			},
		});
	} catch (error) {
		logger.error("Add business to subdomain error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request data",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/**
 * Search businesses for a specific hub with location-based filtering
 */
async function searchBusinessesForHub(localHub: any, searchQuery: any) {
	const supabase = getSupabase();
	if (!supabase) {
		throw new Error("Supabase is not configured");
	}
	const radius = searchQuery.radius || localHub.radius_km;

	// Build the base query
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
			verified,
			status,
			photos,
			business_categories (
				category:categories (
					id,
					name,
					slug,
					icon
				)
			),
			local_hub_businesses!inner (
				is_featured,
				status,
				distance_km
			)
		`,
			{ count: "exact" }
		)
		.eq("status", "published")
		.eq("local_hub_businesses.local_hub_id", localHub.id)
		.eq("local_hub_businesses.status", "active");

	// Apply search filters
	if (searchQuery.query) {
		query = query.textSearch("name", searchQuery.query);
	}

	if (searchQuery.category) {
		query = query.eq("business_categories.category.slug", searchQuery.category);
	}

	if (searchQuery.featured !== undefined) {
		query = query.eq("local_hub_businesses.is_featured", searchQuery.featured);
	}

	if (searchQuery.verified !== undefined) {
		query = query.eq("verified", searchQuery.verified);
	}

	if (searchQuery.rating) {
		query = query.gte("rating", searchQuery.rating);
	}

	if (searchQuery.priceRange) {
		query = query.eq("price_range", searchQuery.priceRange);
	}

	// Apply sorting
	switch (searchQuery.sort) {
		case "distance":
			query = query.order("local_hub_businesses.distance_km", { ascending: searchQuery.order === "asc" });
			break;
		case "rating":
			query = query.order("rating", { ascending: searchQuery.order === "asc" });
			break;
		case "reviews":
			query = query.order("review_count", { ascending: searchQuery.order === "asc" });
			break;
		case "name":
			query = query.order("name", { ascending: searchQuery.order === "asc" });
			break;
		case "featured":
			query = query.order("local_hub_businesses.is_featured", { ascending: false });
			break;
		default:
			query = query.order("local_hub_businesses.is_featured", { ascending: false }).order("rating", { ascending: false });
	}

	// Apply pagination
	const offset = (searchQuery.page - 1) * searchQuery.limit;
	query = query.range(offset, offset + searchQuery.limit - 1);

	const { data: businesses, error, count } = await query;

	if (error) {
		throw error;
	}

	// Get available filters
	const availableFilters = await getAvailableFilters(localHub.id);

	return {
		businesses: businesses || [],
		pagination: {
			page: searchQuery.page,
			limit: searchQuery.limit,
			total: count || 0,
			totalPages: Math.ceil((count || 0) / searchQuery.limit),
		},
		availableFilters,
	};
}

/**
 * Get available filter options for the hub
 */
async function getAvailableFilters(hubId: string) {
	const supabase = getSupabase();
	if (!supabase) {
		return { categories: [], priceRanges: [], sortOptions: [
			{ value: "distance", label: "Distance" },
			{ value: "rating", label: "Rating" },
			{ value: "reviews", label: "Most Reviewed" },
			{ value: "name", label: "Name" },
			{ value: "featured", label: "Featured" },
		] };
	}
	// Get available categories
	const { data: categories } = await supabase
		.from("categories")
		.select("id, name, slug")
		.in("id", supabase.from("business_categories").select("category_id").in("business_id", supabase.from("local_hub_businesses").select("business_id").eq("local_hub_id", hubId).eq("status", "active")));

	// Get price ranges
	const { data: priceRanges } = await supabase.from("businesses").select("price_range").in("id", supabase.from("local_hub_businesses").select("business_id").eq("local_hub_id", hubId).eq("status", "active")).not("price_range", "is", null);

	const uniquePriceRanges = [...new Set(priceRanges?.map((p) => p.price_range) || [])];

	return {
		categories: categories || [],
		priceRanges: uniquePriceRanges,
		sortOptions: [
			{ value: "distance", label: "Distance" },
			{ value: "rating", label: "Rating" },
			{ value: "reviews", label: "Most Reviewed" },
			{ value: "name", label: "Name" },
			{ value: "featured", label: "Featured" },
		],
	};
}

/**
 * Verify user has permission to manage subdomain
 */
async function verifySubdomainPermission(userId: string, subdomain: string) {
	const supabase = getSupabase();
	if (!supabase) {
		return false;
	}
	try {
		const { data: permission } = await supabase.from("local_hub_managers").select("role").eq("user_id", userId).eq("local_hubs.subdomain", subdomain.toLowerCase()).join("local_hubs", "local_hub_id", "id").single();

		return !!permission;
	} catch (error) {
		logger.error("Permission check failed:", error);
		return false;
	}
}
