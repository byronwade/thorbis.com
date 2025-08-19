// REQUIRED: Subdomain Validation API
// Real-time subdomain availability checking with comprehensive validation

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

// Validation schema
const validateSubdomainSchema = z.object({
	subdomain: z
		.string()
		.min(1)
		.max(63)
		.transform((val) => val.toLowerCase().trim()),
});

/**
 * POST /api/v2/subdomains/validate - Validate subdomain availability and format
 */
export async function POST(request: NextRequest) {
	const startTime = performance.now();

	try {
		const body = await request.json();
		const { subdomain } = validateSubdomainSchema.parse(body);

		logger.debug("Validating subdomain:", subdomain);

		// Comprehensive validation
		const validation = await validateSubdomain(subdomain);

		const duration = performance.now() - startTime;
		logger.performance(`Subdomain validation completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json({
			success: true,
			data: {
				subdomain,
				...validation,
				fullDomain: validation.available ? `${subdomain}.localhub.com` : null,
			},
			meta: {
				validationTime: `${duration.toFixed(2)}ms`,
			},
		});
	} catch (error) {
		logger.error("Subdomain validation error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid input",
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
 * GET /api/v2/subdomains/validate?subdomain=example - Quick validation via query param
 */
export async function GET(request: NextRequest) {
	const startTime = performance.now();

	try {
		const { searchParams } = new URL(request.url);
		const subdomain = searchParams.get("subdomain");

		if (!subdomain) {
			return NextResponse.json(
				{
					success: false,
					error: "Subdomain parameter required",
				},
				{ status: 400 }
			);
		}

		const { subdomain: validatedSubdomain } = validateSubdomainSchema.parse({ subdomain });

		const validation = await validateSubdomain(validatedSubdomain);

		const duration = performance.now() - startTime;

		return NextResponse.json({
			success: true,
			data: {
				subdomain: validatedSubdomain,
				...validation,
				fullDomain: validation.available ? `${validatedSubdomain}.localhub.com` : null,
			},
			meta: {
				validationTime: `${duration.toFixed(2)}ms`,
			},
		});
	} catch (error) {
		logger.error("Subdomain validation GET error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid subdomain format",
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
 * Comprehensive subdomain validation
 */
async function validateSubdomain(subdomain: string) {
	const validation = {
		available: false,
		valid: true,
		errors: [] as string[],
		warnings: [] as string[],
		suggestions: [] as string[],
		reason: null as string | null,
	};

	// Format validation
	const formatValidation = validateSubdomainFormat(subdomain);
	if (!formatValidation.valid) {
		validation.valid = false;
		validation.errors.push(...formatValidation.errors);
		validation.suggestions.push(...formatValidation.suggestions);
		return validation;
	}

    // Check availability
    try {
        const supabase = getSupabase();
        if (!supabase) {
            validation.errors.push("Supabase not configured");
            return validation;
        }
        const { data: isAvailable, error } = await supabase.rpc("is_subdomain_available", {
			subdomain_name: subdomain,
		});

		if (error) {
			validation.errors.push("Unable to check availability");
			return validation;
		}

		if (isAvailable) {
			validation.available = true;
		} else {
			// Get specific reason for unavailability
			const reason = await getUnavailabilityReason(subdomain);
			validation.reason = reason.reason;
			validation.suggestions.push(...reason.suggestions);
		}
	} catch (error) {
		logger.error("Availability check failed:", error);
		validation.errors.push("Unable to verify availability");
	}

	// Additional checks and warnings
	const additionalChecks = performAdditionalChecks(subdomain);
	validation.warnings.push(...additionalChecks.warnings);
	validation.suggestions.push(...additionalChecks.suggestions);

	return validation;
}

/**
 * Validate subdomain format
 */
function validateSubdomainFormat(subdomain: string) {
	const errors: string[] = [];
	const suggestions: string[] = [];

	// Length check
	if (subdomain.length < 3) {
		errors.push("Subdomain must be at least 3 characters long");
		suggestions.push("Try adding more descriptive words like 'downtown' or your region name");
	}

	if (subdomain.length > 63) {
		errors.push("Subdomain cannot exceed 63 characters");
		suggestions.push("Try shortening your subdomain name");
	}

	// Character validation
	if (!/^[a-z0-9-]+$/.test(subdomain)) {
		errors.push("Subdomain can only contain lowercase letters, numbers, and hyphens");
		suggestions.push("Remove special characters and convert to lowercase");
	}

	// Hyphen rules
	if (subdomain.startsWith("-")) {
		errors.push("Subdomain cannot start with a hyphen");
		suggestions.push(`Try "${subdomain.substring(1)}" instead`);
	}

	if (subdomain.endsWith("-")) {
		errors.push("Subdomain cannot end with a hyphen");
		suggestions.push(`Try "${subdomain.substring(0, subdomain.length - 1)}" instead`);
	}

	if (subdomain.includes("--")) {
		errors.push("Subdomain cannot contain consecutive hyphens");
		suggestions.push(`Try "${subdomain.replace(/--+/g, "-")}" instead`);
	}

	// Reserved patterns
	const reservedPatterns = ["admin", "api", "www", "mail", "ftp", "test", "dev"];
	if (reservedPatterns.some((pattern) => subdomain.includes(pattern))) {
		errors.push("Subdomain contains reserved words");
		suggestions.push("Try using your city name or business focus instead");
	}

	return {
		valid: errors.length === 0,
		errors,
		suggestions,
	};
}

/**
 * Get specific reason why subdomain is unavailable
 */
async function getUnavailabilityReason(subdomain: string) {
	const result = {
		reason: "Subdomain is not available",
		suggestions: [] as string[],
	};

	try {
        const supabase = getSupabase();
        if (!supabase) return result;
		// Check if it exists in local_hubs
		const { data: existing } = await supabase.from("local_hubs").select("subdomain, status, city, state").eq("subdomain", subdomain).single();

		if (existing) {
			result.reason = `Subdomain "${subdomain}" is already taken`;
			if (existing.city && existing.state) {
				result.reason += ` by ${existing.city}, ${existing.state}`;
			}
			result.suggestions.push(`${subdomain}-city`, `${subdomain}-local`, `${subdomain}-area`, `my-${subdomain}`, `${subdomain}-hub`);
			return result;
		}

        // Check if it's reserved
        const { data: reserved } = await supabase.from("reserved_subdomains").select("reason").eq("subdomain", subdomain).single();

		if (reserved) {
			result.reason = reserved.reason || "Subdomain is reserved by the system";
			result.suggestions.push(`${subdomain}-local`, `${subdomain}-directory`, `${subdomain}-business`, `${subdomain}-hub`);
			return result;
		}
	} catch (error) {
		logger.debug("Error getting unavailability reason:", error);
	}

	return result;
}

/**
 * Perform additional checks and provide warnings/suggestions
 */
function performAdditionalChecks(subdomain: string) {
	const warnings: string[] = [];
	const suggestions: string[] = [];

	// Length warnings
	if (subdomain.length > 20) {
		warnings.push("Long subdomains may be harder to remember and type");
		suggestions.push("Consider using abbreviations or shorter alternatives");
	}

	// Numbers-only warning
	if (/^[0-9-]+$/.test(subdomain)) {
		warnings.push("Subdomains with only numbers may be hard to remember");
		suggestions.push("Consider adding descriptive words");
	}

	// Multiple hyphens warning
	if ((subdomain.match(/-/g) || []).length > 2) {
		warnings.push("Multiple hyphens may make the subdomain hard to type");
		suggestions.push("Consider using fewer hyphens or camelCase alternatives");
	}

	// SEO suggestions
	const cityTerms = ["city", "town", "area", "local", "downtown", "metro"];
	const hasLocationTerm = cityTerms.some((term) => subdomain.includes(term));

	if (!hasLocationTerm && subdomain.length < 15) {
		suggestions.push("Consider adding location terms like 'local', 'city', or 'area' for better SEO");
	}

	return { warnings, suggestions };
}
