import { NextResponse } from "next/server";
import { BusinessDataFetchers } from "@lib/database/supabase/server";
import logger from "@lib/utils/logger";

// Function to validate Supabase data integrity
const validateSupabaseData = async () => {
	try {
		// Get a sample of businesses to verify data integrity
		const searchResults = await BusinessDataFetchers.searchBusinesses({
			limit: 10,
		});

		// Check if search results are valid
		if (!searchResults || !searchResults.data || !searchResults.data.businesses) {
			throw new Error("Invalid search results from BusinessDataFetchers");
		}

		const businessCount = searchResults.data.businesses.length;
		logger.info(`Supabase data validation: Found ${businessCount} businesses`);

		if (businessCount === 0) {
			throw new Error("No businesses found in Supabase database");
		}

		// Check for required fields
		const validBusinesses = searchResults.data.businesses.filter((business) => business.name && business.address && business.latitude && business.longitude);

		const validationRate = (validBusinesses.length / businessCount) * 100;
		logger.info(`Data validation rate: ${validationRate.toFixed(2)}%`);

		if (validationRate < 80) {
			logger.warn(`Low data quality detected: ${validationRate.toFixed(2)}% valid businesses`);
		}

		return {
			total: businessCount,
			valid: validBusinesses.length,
			validationRate: validationRate,
		};
	} catch (error) {
		logger.error("Error validating Supabase data:", error);
		throw error;
	}
};

// Health check for Supabase integration
export async function GET() {
	try {
		const startTime = performance.now();

		const validationResult = await validateSupabaseData();

		const duration = performance.now() - startTime;
		logger.performance(`Data validation completed in ${duration.toFixed(2)}ms`);

		return NextResponse.json(
			{
				message: "Supabase data validation successful",
				data: {
					totalBusinesses: validationResult.total,
					validBusinesses: validationResult.valid,
					validationRate: `${validationResult.validationRate.toFixed(2)}%`,
					responseTime: `${duration.toFixed(2)}ms`,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		logger.error("Error in data validation:", error);
		return NextResponse.json(
			{
				error: "Data validation failed",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
