// REQUIRED: Comprehensive Supabase integration exports
// Main entry point for all Supabase functionality

// Core client and types
export { supabase, serviceSupabase, createSupabaseClient, createServiceSupabaseClient, getServiceRoleKey } from "./client";
export type { Database, Tables, Inserts, Updates } from "./client";

// Authentication and security
export { createAuthMiddleware, createRouteGuard, authenticateAPIRequest } from "./middleware";

// Query and mutation modules
import { BusinessQueries } from "./queries/business";
import { UserQueries } from "./queries/user";
import { BusinessMutations } from "./mutations/business";

// Performance monitoring
export class SupabasePerformanceMonitor {
	private static metrics: Map<string, number[]> = new Map();

	static trackQuery(operation: string, duration: number): void {
		if (!this.metrics.has(operation)) {
			this.metrics.set(operation, []);
		}

		const operationMetrics = this.metrics.get(operation)!;
		operationMetrics.push(duration);

		// Keep only last 100 measurements
		if (operationMetrics.length > 100) {
			operationMetrics.shift();
		}

		// Alert on slow queries
		if (duration > 1000) {
			console.warn(`Slow Supabase query: ${operation} took ${duration.toFixed(2)}ms`);
		}

		// Alert on performance degradation
		if (operationMetrics.length >= 10) {
			const average = operationMetrics.reduce((a, b) => a + b) / operationMetrics.length;
			if (average > 500) {
				console.error(`Performance degradation detected: ${operation} average ${average.toFixed(2)}ms`);
			}
		}
	}

	static getPerformanceReport(): Record<
		string,
		{
			count: number;
			average: number;
			min: number;
			max: number;
		}
	> {
		const report: Record<string, any> = {};

		for (const [operation, durations] of this.metrics) {
			report[operation] = {
				count: durations.length,
				average: durations.reduce((a, b) => a + b) / durations.length,
				min: Math.min(...durations),
				max: Math.max(...durations),
			};
		}

		return report;
	}

	static clearMetrics(): void {
		this.metrics.clear();
	}
}

// Utility functions
export const SupabaseUtils = {
	/**
	 * Generate optimized cache key
	 */
	generateCacheKey(prefix: string, params: Record<string, any>): string {
		const sortedParams = Object.keys(params)
			.sort()
			.reduce(
				(obj, key) => {
					obj[key] = params[key];
					return obj;
				},
				{} as Record<string, any>
			);

		return `${prefix}_${JSON.stringify(sortedParams)}`;
	},

	/**
	 * Check if error is retryable
	 */
	isRetryableError(error: any): boolean {
		const retryableCodes = ["NETWORK_ERROR", "TIMEOUT", "429", "502", "503", "504"];
		return retryableCodes.some((code) => error.code === code || error.message?.includes(code));
	},

	/**
	 * Retry operation with exponential backoff
	 */
	async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
		let lastError: any;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error;

				if (attempt === maxRetries || !this.isRetryableError(error)) {
					throw error;
				}

				const delay = baseDelay * Math.pow(2, attempt);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError;
	},

	/**
	 * Create slug from text
	 */
	createSlug(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	},

	/**
	 * Validate email format
	 */
	isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},
};

// Types for common use cases
export interface SupabaseQueryOptions {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	filters?: Record<string, any>;
	includeRelations?: string[];
}

export interface SupabaseResponse<T> {
	data: T | null;
	error: any;
	count?: number;
	page?: number;
	totalPages?: number;
}

export interface SupabaseSubscriptionOptions {
	table: string;
	event?: "INSERT" | "UPDATE" | "DELETE" | "*";
	filter?: string;
	callback: (payload: any) => void;
	errorCallback?: (error: any) => void;
}

// Default export temporarily disabled to fix build issues
// export default {
// 	client: () => supabase,
// 	queries: {
// 		business: BusinessQueries,
// 		user: UserQueries,
// 	},
// 	mutations: {
// 		business: () => BusinessMutations,
// 	},
// 	realtime: () => SupabaseRealtime,
// 	storage: () => SupabaseStorage,
// 	auth: {
// 		createAuthMiddleware,
// 		createRouteGuard,
// 		authenticateAPIRequest,
// 	},
// 	performance: SupabasePerformanceMonitor,
// 	utils: SupabaseUtils,
// };
