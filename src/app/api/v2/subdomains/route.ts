/**
 * Subdomain Management API with Vercel Integration
 * Handles automated subdomain creation, SSL provisioning, and DNS routing
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@lib/database/supabase/client";
import { createTenantSubdomain } from "@lib/vercel/domain-management";
export const dynamic = "force-dynamic";
// Import logger with fallback for build compatibility
let logger: any;
try {
  logger = require("@utils/logger").logger;
} catch (e) {
  // Fallback logger for build time
  logger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    performance: () => {},
    api: () => {},
    businessMetrics: () => {},
    security: () => {},
    critical: () => {},
  };
}

// Validation schemas
const createSubdomainSchema = z.object({
	subdomain: z
		.string()
		.min(3, "Subdomain must be at least 3 characters")
		.max(63, "Subdomain must not exceed 63 characters")
		.regex(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid subdomain format"),
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	tagline: z.string().max(100, "Tagline too long").optional(),
	city: z.string().min(1, "City is required").max(50, "City name too long"),
	state: z.string().min(2, "State is required").max(50, "State name too long"),
	country: z.string().default("US"),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	radius_km: z.number().min(1).max(500).default(50),
	primary_color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
		.default("hsl(var(--primary))"),
	secondary_color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
		.default("hsl(var(--primary))"),
	contact_email: z.string().email("Invalid email format").optional(),
	contact_phone: z.string().max(20, "Phone number too long").optional(),
	featured_categories: z.array(z.string()).default([]),
	meta_keywords: z.array(z.string()).default([]),
});

/**
 * GET /api/v2/subdomains
 * Retrieve user's subdomains/local hubs
 */
export async function GET(request: NextRequest) {
	const startTime = performance.now();

	try {
		// Get user from session (implement your auth logic)
		const userId = await getUserFromSession(request);

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		// Fetch user's local hubs with Vercel domain info
		const { data: localHubs, error } = await supabase
			.from("local_hubs")
			.select(
				`
        *,
        local_hub_managers!inner(user_id, role)
      `
			)
			.eq("local_hub_managers.user_id", userId)
			.eq("status", "active")
			.order("created_at", { ascending: false });

		if (error) {
			logger.error("Error fetching user subdomains", { userId, error: error.message });
			return NextResponse.json({ success: false, error: "Failed to fetch subdomains" }, { status: 500 });
		}

		// Format response with domain status
		const subdomains = localHubs.map((hub) => ({
			id: hub.id,
			subdomain: hub.subdomain,
			name: hub.name,
			description: hub.description,
			city: hub.location_city,
			state: hub.location_state,
			status: hub.status,
			domain: `${hub.subdomain}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN || "thorbis.com"}`,
			sslEnabled: hub.ssl_enabled || false,
			verified: hub.domain_verified || false,
			createdAt: hub.created_at,
			totalBusinesses: hub.total_businesses || 0,
			monthlyViews: hub.monthly_views || 0,
			vercelDomainId: hub.vercel_domain_id,
		}));

		const duration = performance.now() - startTime;
		logger.performance(`GET subdomains completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: { subdomains },
			performance: { queryTime: duration },
		});
	} catch (error) {
		logger.error("GET subdomains error", { error: error.message });
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

/**
 * POST /api/v2/subdomains
 * Create new subdomain with automatic Vercel provisioning
 */
export async function POST(request: NextRequest) {
	const startTime = performance.now();

	try {
		// Get user from session
		const userId = await getUserFromSession(request);

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createSubdomainSchema.parse(body);

		// Check if subdomain is available
		const availability = await checkSubdomainAvailability(validatedData.subdomain);
		if (!availability.available) {
			return NextResponse.json({ success: false, error: availability.reason }, { status: 400 });
		}

		// Create local hub in database
		const { data: localHub, error: dbError } = await supabase
			.from("local_hubs")
			.insert({
				subdomain: validatedData.subdomain,
				name: validatedData.name,
				description: validatedData.description,
				tagline: validatedData.tagline,
				location_city: validatedData.city,
				location_state: validatedData.state,
				country: validatedData.country,
				latitude: validatedData.latitude,
				longitude: validatedData.longitude,
				radius_km: validatedData.radius_km,
				owner_id: userId,
				status: "pending", // Will be activated after Vercel setup
				primary_color: validatedData.primary_color,
				secondary_color: validatedData.secondary_color,
				contact_email: validatedData.contact_email,
				contact_phone: validatedData.contact_phone,
				featured_categories: validatedData.featured_categories,
				meta_title: `${validatedData.name} - Local Business Directory`,
				meta_description: `Discover local businesses in ${validatedData.city}, ${validatedData.state}. ${validatedData.description || "Find restaurants, shops, services and more."}`,
				meta_keywords: [validatedData.city.toLowerCase(), validatedData.state.toLowerCase(), "local business", "directory", ...validatedData.meta_keywords],
			})
			.select()
			.single();

		if (dbError) {
			logger.error("Database error creating local hub", {
				userId,
				subdomain: validatedData.subdomain,
				error: dbError.message,
			});

			return NextResponse.json({ success: false, error: "Failed to create subdomain" }, { status: 500 });
		}

		// Add user as owner/manager
		await supabase.from("local_hub_managers").insert({
			local_hub_id: localHub.id,
			user_id: userId,
			role: "owner",
		});

        try {
			// Create subdomain in Vercel with automatic SSL
			const vercelResult = await createTenantSubdomain(localHub);

			// Update local hub status to active
			await supabase
				.from("local_hubs")
				.update({
					status: "active",
					ssl_enabled: vercelResult.sslEnabled,
					domain_verified: true,
				})
				.eq("id", localHub.id);

			const duration = performance.now() - startTime;
			logger.success("Subdomain created successfully with Vercel", {
				userId,
				subdomain: validatedData.subdomain,
				domain: vercelResult.domain,
				duration: `${duration.toFixed(2)}ms`,
			});

			return NextResponse.json({
				success: true,
				data: {
					localHub: {
						...localHub,
						status: "active",
						domain: vercelResult.domain,
						accessUrl: vercelResult.accessUrl,
						sslEnabled: vercelResult.sslEnabled,
					},
				},
				performance: {
					creationTime: duration,
					vercelProvisioned: true,
				},
			});
        } catch (vercelError) {
			// Vercel creation failed - mark hub as failed but keep database record
			await supabase.from("local_hubs").update({ status: "failed" }).eq("id", localHub.id);

			logger.error("Vercel subdomain creation failed", {
				userId,
				subdomain: validatedData.subdomain,
				localHubId: localHub.id,
				error: vercelError.message,
			});

            // If missing VERCEL_TOKEN, respond with clear message but do not crash build
            const missingToken =
                vercelError instanceof Error && /VERCEL_TOKEN/.test(vercelError.message);

            return NextResponse.json(
				{
					success: false,
                    error: missingToken
                        ? "Vercel integration not configured (missing token). Contact support."
                        : "Failed to provision subdomain. Please contact support.",
                    details:
                        process.env.NODE_ENV === "development"
                            ? vercelError.message
                            : undefined,
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Validation error",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		logger.error("POST subdomains error", { error: error.message });
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

/**
 * Helper functions
 */
async function getUserFromSession(request: NextRequest): Promise<string | null> {
	// Implement your authentication logic here
	// This should extract user ID from session/JWT token

	// Example implementation (replace with your auth system):
	try {
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return null;
		}

		// Decode JWT token or validate session
		// Return user ID if valid, null if invalid

		// Placeholder - implement your actual auth logic
		return "user-id-from-session";
	} catch (error) {
		logger.error("Authentication error", { error: error.message });
		return null;
	}
}

async function checkSubdomainAvailability(subdomain: string) {
	try {
		// Check if subdomain is reserved
		const { data: reserved } = await supabase.from("reserved_subdomains").select("reason").eq("subdomain", subdomain).single();

		if (reserved) {
			return {
				available: false,
				reason: `Subdomain '${subdomain}' is reserved for ${reserved.reason} use`,
			};
		}

		// Check if subdomain already exists
		const { data: existing } = await supabase.from("local_hubs").select("id, status").eq("subdomain", subdomain).single();

		if (existing) {
			return {
				available: false,
				reason: `Subdomain '${subdomain}' is already taken`,
			};
		}

		return { available: true };
	} catch (error) {
		// If no record found, subdomain is available
		if (error.code === "PGRST116") {
			return { available: true };
		}

		logger.error("Error checking subdomain availability", { subdomain, error: error.message });
		throw error;
	}
}
