// REQUIRED: Individual Subdomain Management API
// Handles specific subdomain operations: GET, PUT, DELETE with authorization

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false }, db: { schema: "public" } });
}

// Validation schemas
const updateSubdomainSchema = z.object({
	name: z.string().min(3).max(100).optional(),
	description: z.string().max(500).optional(),
	tagline: z.string().max(200).optional(),
	city: z.string().min(2).max(100).optional(),
	state: z.string().min(2).max(100).optional(),
	country: z.string().optional(),
	hubType: z.enum(["city", "region", "neighborhood", "custom"]).optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	radiusKm: z.number().min(1).max(200).optional(),
	primaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i)
		.optional(),
	secondaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i)
		.optional(),
	logoUrl: z.string().url().optional(),
	bannerUrl: z.string().url().optional(),
	socialLinks: z.record(z.string()).optional(),
	featuredCategories: z.array(z.string()).optional(),
	excludedCategories: z.array(z.string()).optional(),
	autoApproveBusinesses: z.boolean().optional(),
	metaTitle: z.string().max(60).optional(),
	metaDescription: z.string().max(160).optional(),
	metaKeywords: z.array(z.string()).optional(),
});

/**
 * GET /api/v2/subdomains/[subdomain] - Get detailed subdomain information
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
	const startTime = performance.now();

	try {
		const { subdomain } = await params;

		if (!subdomain) {
			return NextResponse.json(
				{
					success: false,
					error: "Subdomain parameter required",
				},
				{ status: 400 }
			);
		}

		logger.debug("Fetching subdomain details:", subdomain);

		// Get comprehensive subdomain data
		const supabase = getSupabase();
		if (!supabase) {
			return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 500 });
		}
		const { data: localHub, error } = await supabase
			.from("local_hubs")
			.select(
				`
				*,
				local_hub_managers (
					id,
					user_id,
					role,
					accepted_at,
					created_at,
					users:user_id (
						name,
						email,
						avatar_url
					)
				),
				local_hub_businesses (
					id,
					business_id,
					is_featured,
					status,
					distance_km,
					businesses:business_id (
						id,
						name,
						slug,
						address,
						city,
						state,
						rating,
						review_count,
						verified,
						status
					)
				)
			`
			)
			.eq("subdomain", subdomain.toLowerCase())
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{
						success: false,
						error: "Subdomain not found",
					},
					{ status: 404 }
				);
			}

			logger.error("Failed to fetch subdomain:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch subdomain",
					details: error.message,
				},
				{ status: 500 }
			);
		}

		// Get recent analytics
		const { data: analytics } = await supabase.from("local_hub_analytics").select("*").eq("local_hub_id", localHub.id).order("date", { ascending: false }).limit(30);

		// Calculate summary statistics
		const stats = calculateHubStats(localHub, analytics);

		const duration = performance.now() - startTime;
		logger.performance(`Subdomain details query executed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: {
				localHub,
				analytics: analytics || [],
				stats,
				fullDomain: localHub.full_domain,
				urls: {
					public: `https://${localHub.full_domain}`,
					dashboard: `https://${localHub.full_domain}/dashboard`,
					api: `https://${localHub.full_domain}/api`,
				},
			},
			meta: {
				queryTime: `${duration.toFixed(2)}ms`,
				lastUpdated: localHub.updated_at,
			},
		});
	} catch (error) {
		logger.error("Subdomain GET endpoint error:", error);
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
 * PUT /api/v2/subdomains/[subdomain] - Update subdomain settings
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
	const startTime = performance.now();

	try {
		const { subdomain } = await params;

		// Get user session
		const authResult = await authenticateRequest(request);
		if (!authResult.success) {
			return NextResponse.json(authResult.error, { status: authResult.status });
		}

		const { user } = authResult;

		// Verify user has permission to update this subdomain
		const hasPermission = await verifySubdomainPermission(user.id, subdomain, ["owner", "admin"]);
		if (!hasPermission) {
			return NextResponse.json(
				{
					success: false,
					error: "Insufficient permissions to update this subdomain",
				},
				{ status: 403 }
			);
		}

		const body = await request.json();
		const validatedData = updateSubdomainSchema.parse(body);

		logger.debug("Updating subdomain:", { subdomain, userId: user.id, updates: Object.keys(validatedData) });

		// Update the local hub
		const { data: updatedHub, error: updateError } = await supabase
			.from("local_hubs")
			.update({
				...validatedData,
				updated_at: new Date().toISOString(),
			})
			.eq("subdomain", subdomain.toLowerCase())
			.select()
			.single();

		if (updateError) {
			logger.error("Failed to update subdomain:", updateError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to update subdomain",
					details: updateError.message,
				},
				{ status: 500 }
			);
		}

		// Log the update
		logger.info("Subdomain updated:", {
			hubId: updatedHub.id,
			subdomain: updatedHub.subdomain,
			userId: user.id,
			updatedFields: Object.keys(validatedData),
		});

		const duration = performance.now() - startTime;
		logger.performance(`Subdomain update completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: {
				localHub: updatedHub,
				message: "Subdomain updated successfully",
			},
			meta: {
				processingTime: `${duration.toFixed(2)}ms`,
				updatedFields: Object.keys(validatedData),
			},
		});
	} catch (error) {
		logger.error("Subdomain PUT endpoint error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Validation failed",
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
 * DELETE /api/v2/subdomains/[subdomain] - Delete/deactivate subdomain
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
	const startTime = performance.now();

	try {
		const { subdomain } = await params;

		// Get user session
		const authResult = await authenticateRequest(request);
		if (!authResult.success) {
			return NextResponse.json(authResult.error, { status: authResult.status });
		}

		const { user } = authResult;

		// Verify user has permission to delete this subdomain (only owners)
		const hasPermission = await verifySubdomainPermission(user.id, subdomain, ["owner"]);
		if (!hasPermission) {
			return NextResponse.json(
				{
					success: false,
					error: "Only subdomain owners can delete subdomains",
				},
				{ status: 403 }
			);
		}

		logger.debug("Deleting subdomain:", { subdomain, userId: user.id });

		// Get the hub ID first
		const { data: hub } = await supabase.from("local_hubs").select("id, total_businesses").eq("subdomain", subdomain.toLowerCase()).single();

		if (!hub) {
			return NextResponse.json(
				{
					success: false,
					error: "Subdomain not found",
				},
				{ status: 404 }
			);
		}

		// Check if there are associated businesses
		if (hub.total_businesses > 0) {
			// Don't hard delete if there are businesses, just deactivate
			const { error: deactivateError } = await supabase
				.from("local_hubs")
				.update({
					status: "suspended",
					updated_at: new Date().toISOString(),
				})
				.eq("subdomain", subdomain.toLowerCase());

			if (deactivateError) {
				logger.error("Failed to deactivate subdomain:", deactivateError);
				return NextResponse.json(
					{
						success: false,
						error: "Failed to deactivate subdomain",
						details: deactivateError.message,
					},
					{ status: 500 }
				);
			}

			logger.info("Subdomain deactivated:", {
				hubId: hub.id,
				subdomain,
				userId: user.id,
				reason: "has_businesses",
			});

			return NextResponse.json({
				success: true,
				data: {
					action: "deactivated",
					message: "Subdomain has been deactivated due to associated businesses. Contact support for permanent deletion.",
				},
			});
		}

		// Hard delete if no businesses
		const { error: deleteError } = await supabase.from("local_hubs").delete().eq("subdomain", subdomain.toLowerCase());

		if (deleteError) {
			logger.error("Failed to delete subdomain:", deleteError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to delete subdomain",
					details: deleteError.message,
				},
				{ status: 500 }
			);
		}

		logger.info("Subdomain deleted:", {
			hubId: hub.id,
			subdomain,
			userId: user.id,
		});

		const duration = performance.now() - startTime;
		logger.performance(`Subdomain deletion completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: {
				action: "deleted",
				message: "Subdomain has been permanently deleted",
			},
			meta: {
				processingTime: `${duration.toFixed(2)}ms`,
			},
		});
	} catch (error) {
		logger.error("Subdomain DELETE endpoint error:", error);
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
 * Authenticate request and get user
 */
async function authenticateRequest(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (!authHeader) {
		return {
			success: false,
			error: { success: false, error: "Authentication required" },
			status: 401,
		};
	}

	const token = authHeader.replace("Bearer ", "");
		const supabase = getSupabase();
		if (!supabase) {
			return { success: false, error: { success: false, error: "Supabase is not configured" }, status: 500 };
		}
		const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser(token);

	if (authError || !user) {
		return {
			success: false,
			error: { success: false, error: "Invalid authentication" },
			status: 401,
		};
	}

	return { success: true, user };
}

/**
 * Verify user has permission to access subdomain
 */
async function verifySubdomainPermission(userId: string, subdomain: string, requiredRoles: string[] = ["owner", "admin", "manager"]) {
	try {
		const supabase = getSupabase();
		if (!supabase) return false;
		const { data: permission } = await supabase.from("local_hub_managers").select("role").eq("user_id", userId).eq("local_hubs.subdomain", subdomain.toLowerCase()).join("local_hubs", "local_hub_id", "id").single();

		return permission && requiredRoles.includes(permission.role);
	} catch (error) {
		logger.error("Permission check failed:", error);
		return false;
	}
}

/**
 * Calculate hub statistics
 */
function calculateHubStats(localHub: any, analytics: any[]) {
	const stats = {
		totalBusinesses: localHub.total_businesses || 0,
		totalReviews: localHub.total_reviews || 0,
		monthlyViews: localHub.monthly_views || 0,
		managers: localHub.local_hub_managers?.length || 0,
		activeBusinesses: localHub.local_hub_businesses?.filter((b: any) => b.status === "active").length || 0,
		featuredBusinesses: localHub.local_hub_businesses?.filter((b: any) => b.is_featured).length || 0,
		averageRating: 0,
		growth: {
			businesses: 0,
			views: 0,
			reviews: 0,
		},
	};

	// Calculate average rating
	const businessesWithRating = localHub.local_hub_businesses?.filter((b: any) => b.businesses?.rating) || [];
	if (businessesWithRating.length > 0) {
		stats.averageRating = businessesWithRating.reduce((sum: number, b: any) => sum + b.businesses.rating, 0) / businessesWithRating.length;
	}

	// Calculate growth trends (30-day comparison)
	if (analytics && analytics.length > 1) {
		const recent = analytics.slice(0, 7); // Last 7 days
		const previous = analytics.slice(7, 14); // Previous 7 days

		const recentViews = recent.reduce((sum, a) => sum + (a.page_views || 0), 0);
		const previousViews = previous.reduce((sum, a) => sum + (a.page_views || 0), 0);

		if (previousViews > 0) {
			stats.growth.views = ((recentViews - previousViews) / previousViews) * 100;
		}
	}

	return stats;
}
