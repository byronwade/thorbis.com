/**
 * V2 Individual Business Endpoint
 * Full CRUD operations for specific businesses
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import logger from "@lib/utils/logger";
import { withAuth, withValidation, withCache, withPerformanceMonitoring, createSuccessResponse, createErrorResponse, compose, ApiRequest } from "@lib/api/middleware";

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
 * Get individual business with comprehensive details
 */
async function getBusiness(req: ApiRequest, { params }: { params: { id: string } }, queryParams: BusinessQueryParams): Promise<NextResponse> {
	const startTime = performance.now();

	try {
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
			},
		});

		const businessId = params.id;

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

		if (queryParams.include.includes("owner") && req.user?.role === "admin") {
			selectFields += `,
        owner:users(
          id,
          name,
          email,
          avatar_url,
          created_at
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

		// Filter by status based on user permissions
		if (!req.user) {
			query = query.eq("status", "published");
		} else if (req.user.role !== "admin") {
			query = query.or(`status.eq.published,owner_id.eq.${req.user.id}`);
		}

		const { data: business, error } = await query.single();

		if (error) {
			if (error.code === "PGRST116") {
				return createErrorResponse("BUSINESS_NOT_FOUND", "Business not found", undefined, 404);
			}
			logger.error("Get business error:", error);
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
			const categoryIds = business.business_categories?.map((bc: any) => bc.category.id) || [];

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

		// Track business view for analytics
		if (business.status === "published") {
			// Increment view count (fire and forget)
			supabase.rpc("increment_business_views", { business_id: businessId }).then();

			// Log view for analytics
			logger.businessMetrics({
				action: "business_view",
				businessId: businessId,
				businessName: business.name,
				userId: req.user?.id,
				viewSource: req.headers.get("referer") || "direct",
				userAgent: req.headers.get("user-agent"),
				timestamp: Date.now(),
			});
		}

		// Prepare response data
		const responseData = {
			business: {
				...business,
				reviews: reviewsData,
				similarBusinesses,
			},
		};

		// Add owner permissions if user is owner or admin
		const isOwner = req.user?.id === business.owner_id;
		const isAdmin = req.user?.role === "admin";

		if (isOwner || isAdmin) {
			responseData.business.permissions = {
				canEdit: true,
				canDelete: isAdmin,
				canManagePhotos: true,
				canManageHours: true,
				canRespondToReviews: true,
				canViewAnalytics: true,
			};
		}

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(responseData, {
			performance: {
				queryTime,
				cacheHit: false,
			},
			includes: queryParams.include,
		});
	} catch (error) {
		logger.error("Get business handler error:", error);
		return createErrorResponse("FETCH_ERROR", "Failed to fetch business details");
	}
}

/**
 * Update business with validation and authorization
 */
async function updateBusiness(req: ApiRequest, { params }: { params: { id: string } }, updateData: BusinessUpdateData): Promise<NextResponse> {
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

		const businessId = params.id;

		// Check if business exists and user has permission
		const { data: existingBusiness, error: fetchError } = await supabase.from("businesses").select("id, owner_id, name, status").eq("id", businessId).single();

		if (fetchError || !existingBusiness) {
			return createErrorResponse("BUSINESS_NOT_FOUND", "Business not found", undefined, 404);
		}

		// Check permissions
		const isOwner = req.user.id === existingBusiness.owner_id;
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			return createErrorResponse("FORBIDDEN", "You do not have permission to update this business", undefined, 403);
		}

		// Prepare update data
		const now = new Date().toISOString();
		const businessUpdates: any = {
			updated_at: now,
		};

		// Handle simple field updates
		const simpleFields = ["name", "description", "address", "city", "state", "phone", "website", "email", "priceRange", "features", "latitude", "longitude"];
		simpleFields.forEach((field) => {
			if (field in updateData) {
				const dbField = field === "priceRange" ? "price_range" : field === "zipCode" ? "zip_code" : field;
				businessUpdates[dbField] = (updateData as any)[field];
			}
		});

		// Handle social media updates
		if (updateData.socialMedia) {
			businessUpdates.social_media = updateData.socialMedia;
		}

		// Generate new slug if name changed
		if (updateData.name && updateData.name !== existingBusiness.name) {
			const baseSlug = updateData.name
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			let slug = baseSlug;
			let slugCounter = 1;

			while (true) {
				const { data: existing } = await supabase.from("businesses").select("id").eq("slug", slug).neq("id", businessId).single();

				if (!existing) break;

				slug = `${baseSlug}-${slugCounter}`;
				slugCounter++;
			}

			businessUpdates.slug = slug;
		}

		// Update business record
		const { data: updatedBusiness, error: updateError } = await supabase.from("businesses").update(businessUpdates).eq("id", businessId).select().single();

		if (updateError) {
			logger.error("Business update error:", updateError);
			throw updateError;
		}

		// Handle category updates
		if (updateData.categories) {
			// Validate categories exist
			const { data: validCategories } = await supabase.from("categories").select("id, slug").in("slug", updateData.categories);

			if (!validCategories || validCategories.length !== updateData.categories.length) {
				return createErrorResponse("INVALID_CATEGORIES", "One or more categories are invalid");
			}

			// Remove existing categories and add new ones
			await supabase.from("business_categories").delete().eq("business_id", businessId);

			const categoryLinks = validCategories.map((category) => ({
				business_id: businessId,
				category_id: category.id,
				created_at: now,
			}));

			await supabase.from("business_categories").insert(categoryLinks);
		}

		// Handle hours updates
		if (updateData.hours) {
			// Remove existing hours and add new ones
			await supabase.from("business_hours").delete().eq("business_id", businessId);

			const hoursData = Object.entries(updateData.hours).map(([dayName, hours]) => {
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
					business_id: businessId,
					day_of_week: dayMap[dayName.toLowerCase()],
					open_time: hours.open,
					close_time: hours.close,
					is_closed: hours.closed || false,
				};
			});

			await supabase.from("business_hours").insert(hoursData);
		}

		// Log business update
		logger.businessMetrics({
			action: "business_updated",
			businessId: businessId,
			businessName: existingBusiness.name,
			userId: req.user.id,
			updatedFields: Object.keys(updateData),
			timestamp: Date.now(),
		});

		// If business was pending and is now being updated by admin, potentially approve it
		if (isAdmin && existingBusiness.status === "pending") {
			// Auto-approve if admin is updating
			await supabase.from("businesses").update({ status: "published" }).eq("id", businessId);

			updatedBusiness.status = "published";
		}

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(
			{
				business: updatedBusiness,
				message: "Business updated successfully",
			},
			{
				performance: {
					queryTime,
					cacheHit: false,
				},
			}
		);
	} catch (error) {
		logger.error("Update business handler error:", error);
		return createErrorResponse("UPDATE_ERROR", "Failed to update business");
	}
}

/**
 * Delete business with proper authorization
 */
async function deleteBusiness(req: ApiRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
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

		const businessId = params.id;

		// Check if business exists and user has permission
		const { data: existingBusiness, error: fetchError } = await supabase.from("businesses").select("id, owner_id, name, status").eq("id", businessId).single();

		if (fetchError || !existingBusiness) {
			return createErrorResponse("BUSINESS_NOT_FOUND", "Business not found", undefined, 404);
		}

		// Only admins can delete businesses
		if (req.user.role !== "admin") {
			return createErrorResponse("FORBIDDEN", "Only administrators can delete businesses", undefined, 403);
		}

		// Soft delete - mark as deleted instead of hard delete
		const { error: deleteError } = await supabase
			.from("businesses")
			.update({
				status: "deleted",
				deleted_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", businessId);

		if (deleteError) {
			logger.error("Business deletion error:", deleteError);
			throw deleteError;
		}

		// Log business deletion
		logger.security({
			action: "business_deleted",
			businessId: businessId,
			businessName: existingBusiness.name,
			userId: req.user.id,
			userRole: req.user.role,
			timestamp: Date.now(),
		});

		const queryTime = performance.now() - startTime;

		return createSuccessResponse(
			{
				message: "Business deleted successfully",
				businessId: businessId,
			},
			{
				performance: {
					queryTime,
					cacheHit: false,
				},
			}
		);
	} catch (error) {
		logger.error("Delete business handler error:", error);
		return createErrorResponse("DELETE_ERROR", "Failed to delete business");
	}
}

// Export GET handler with caching
export const GET = compose(
	withPerformanceMonitoring,
	withCache(getBusiness, {
		ttl: 300, // 5 minutes
		keyGenerator: (req, { params }) => `business:${params.id}:${req.nextUrl.search}`,
		skipCache: (req) => req.user?.role === "admin",
	}),
	withValidation(getBusiness, businessQuerySchema)
);

// Export PUT handler with authentication
export const PUT = compose(withPerformanceMonitoring, withAuth(updateBusiness, { requireEmailVerification: true }), withValidation(updateBusiness, businessUpdateSchema));

// Export DELETE handler with admin authentication
export const DELETE = compose(
	withPerformanceMonitoring,
	withAuth(deleteBusiness, {
		requiredRoles: ["admin"],
		requireEmailVerification: true,
	})
);

// Export response types
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
