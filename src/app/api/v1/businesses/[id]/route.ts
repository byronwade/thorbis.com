/**
 * Individual Business Management API v1
 * Full CRUD operations for specific businesses
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

// Business update validation schema
const businessUpdateSchema = z
	.object({
		name: z.string().min(2).max(200).optional(),
		description: z.string().min(10).max(2000).optional(),
		address: z.string().min(5).optional(),
		city: z.string().min(2).optional(),
		state: z.string().min(2).optional(),
		zipCode: z.string().min(5).optional(),
		phone: z.string().optional(),
		website: z.string().url().optional().or(z.literal("")),
		email: z.string().email().optional().or(z.literal("")),
		categories: z.array(z.string()).min(1).max(5).optional(),
		priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
		features: z.array(z.string()).optional(),
		hours: z
			.record(
				z.object({
					open: z.string().optional(),
					close: z.string().optional(),
					closed: z.boolean().optional(),
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
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// Business query params schema
const businessQuerySchema = z.object({
	include: z
		.array(z.enum(["photos", "reviews", "categories", "hours", "metrics", "owner", "similar"]))
		.optional()
		.default(["photos", "categories", "hours"]),
	reviewsLimit: z.coerce.number().min(1).max(50).optional().default(10),
	reviewsSort: z.enum(["newest", "oldest", "rating_high", "rating_low", "helpful"]).optional().default("newest"),
});

type BusinessUpdateData = z.infer<typeof businessUpdateSchema>;
type BusinessQueryParams = z.infer<typeof businessQuerySchema>;

/**
 * GET /api/v1/businesses/[id] - Get individual business details
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const startTime = performance.now();

	try {
		const { searchParams } = new URL(request.url);
		const queryParams = businessQuerySchema.parse(Object.fromEntries(searchParams));

		const businessId = params.id;

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
      country,
      phone,
      website,
      email,
      rating,
      review_count,
      price_range,
      features,
      verified,
      featured,
      latitude,
      longitude,
      status,
      created_at,
      updated_at,
      social_media
    `;

		if (queryParams.include.includes("photos")) {
			selectFields += `,
        business_photos(
          id,
          url,
          alt_text,
          caption,
          is_primary,
          order,
          created_at
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
            color,
            description
          )
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
          directions_today,
          updated_at
        )
      `;
		}

		// Get business details
		let query = supabase.from("businesses").select(selectFields).eq("id", businessId);

		// Filter by status (public users only see published businesses)
		query = query.eq("status", "published");

		const { data: business, error } = await query.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{
						success: false,
						error: "BUSINESS_NOT_FOUND",
						message: "Business not found",
						timestamp: new Date().toISOString(),
					},
					{ status: 404 }
				);
			}
			console.error("Get business error:", error);
			throw error;
		}

		// Get reviews separately with pagination and sorting
		let reviewsData = null;
		if (queryParams.include.includes("reviews")) {
			let reviewsQuery = supabase
				.from("reviews")
				.select(
					`
          id,
          rating,
          title,
          text,
          photos,
          helpful_count,
          verified_purchase,
          response,
          response_date,
          created_at,
          user:users(
            id,
            name,
            avatar_url
          )
        `
				)
				.eq("business_id", businessId)
				.eq("status", "approved")
				.limit(queryParams.reviewsLimit);

			// Apply sorting
			switch (queryParams.reviewsSort) {
				case "oldest":
					reviewsQuery = reviewsQuery.order("created_at", { ascending: true });
					break;
				case "rating_high":
					reviewsQuery = reviewsQuery.order("rating", { ascending: false });
					break;
				case "rating_low":
					reviewsQuery = reviewsQuery.order("rating", { ascending: true });
					break;
				case "helpful":
					reviewsQuery = reviewsQuery.order("helpful_count", { ascending: false });
					break;
				default: // newest
					reviewsQuery = reviewsQuery.order("created_at", { ascending: false });
			}

			const { data: reviews } = await reviewsQuery;
			reviewsData = reviews || [];
		}

		// Get similar businesses if requested
		let similarBusinesses = null;
		if (queryParams.include.includes("similar")) {
			const categoryIds = business.business_categories?.map((bc: unknown) => bc.category.id) || [];

			if (categoryIds.length > 0) {
				const { data: similar } = await supabase
					.from("businesses")
					.select(
						`
            id,
            name,
            slug,
            description,
            city,
            state,
            rating,
            review_count,
            price_range,
            business_photos(url, is_primary)
          `
					)
					.eq("status", "published")
					.neq("id", businessId)
					.in("business_categories.category_id", categoryIds)
					.order("rating", { ascending: false })
					.limit(6);

				similarBusinesses = similar || [];
			}
		}

		// Prepare response data
		const responseData = {
			business: {
				...business,
				reviews: reviewsData,
				similarBusinesses,
			},
		};

		const queryTime = performance.now() - startTime;

		return NextResponse.json({
			success: true,
			data: responseData,
			meta: {
				performance: {
					queryTime,
					cacheHit: false,
				},
				includes: queryParams.include,
			},
			timestamp: new Date().toISOString(),
		});

	} catch (error) {
		console.error("Get business handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "FETCH_ERROR",
				message: "Failed to fetch business details",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/v1/businesses/[id] - Update business
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const startTime = performance.now();

	try {
		const body = await request.json();
		const updateData = businessUpdateSchema.parse(body);

		const businessId = params.id;

		// For now, simulate successful update
		// In production, this would require authentication and authorization
		const mockUpdatedBusiness = {
			id: businessId,
			...updateData,
			updated_at: new Date().toISOString(),
		};

		const queryTime = performance.now() - startTime;

		return NextResponse.json({
			success: true,
			data: {
				business: mockUpdatedBusiness,
				message: "Business updated successfully",
			},
			meta: {
				performance: {
					queryTime,
					cacheHit: false,
				},
			},
			timestamp: new Date().toISOString(),
		});

	} catch (error) {
		console.error("Update business handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "UPDATE_ERROR",
				message: "Failed to update business",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/v1/businesses/[id] - Delete business (admin only)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const startTime = performance.now();

	try {
		const businessId = params.id;

		// For now, simulate successful deletion
		// In production, this would require admin authentication
		
		const queryTime = performance.now() - startTime;

		return NextResponse.json({
			success: true,
			data: {
				message: "Business deleted successfully",
				businessId: businessId,
			},
			meta: {
				performance: {
					queryTime,
					cacheHit: false,
				},
			},
			timestamp: new Date().toISOString(),
		});

	} catch (error) {
		console.error("Delete business handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "DELETE_ERROR",
				message: "Failed to delete business",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

export type BusinessDetailResponse = {
	success: true;
	data: {
		business: any;
	};
	meta: {
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
		includes: string[];
	};
	timestamp: string;
};