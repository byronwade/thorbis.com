/**
 * Jobs Queries
 * Optimized job posting and management queries
 * Following domain-based Supabase organization
 */

import { supabase, Tables, Database } from "../../client";
import { CacheManager } from "@lib/utils/cache-manager";
import { logger } from "@lib/utils/logger";

type Job = Tables<"jobs">;
type JobWithRelations = Job & {
	user: Tables<"users">;
	category: Tables<"categories">;
	proposals: Tables<"job_proposals">[];
	attachments: Tables<"job_attachments">[];
};

/**
 * High-performance job queries with intelligent caching
 * Implements query optimization and result caching
 */
export class JobQueries {
	private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
	private static readonly pooledClient = supabase;

	/**
	 * Search jobs with advanced filtering and caching
	 * Optimized for minimal database round trips
	 */
	static async searchJobs(params: { query?: string; location?: string; category?: string; budgetMin?: number; budgetMax?: number; urgency?: string; status?: string; limit?: number; offset?: number }): Promise<{
		jobs: JobWithRelations[];
		total: number;
		performance: {
			queryTime: number;
			cacheHit: boolean;
		};
	}> {
		const startTime = performance.now();
		const cacheKey = `job_search_${JSON.stringify(params)}`;

		// Check cache first
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			logger.performance(`Job search cache hit: ${cacheKey}`);
			return {
				...cached,
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: true,
				},
			};
		}

		try {
			// Build optimized query with proper indexing
			let query = this.pooledClient
				.from("jobs")
				.select(
					`
					*,
					user:users(
						id,
						name,
						avatar_url,
						created_at
					),
					category:categories(
						id,
						name,
						slug
					),
					proposals:job_proposals(
						id,
						status,
						amount,
						created_at,
						contractor:users(name, avatar_url)
					),
					attachments:job_attachments(
						id,
						file_name,
						file_size,
						file_type
					)
				`
				)
				.eq("status", params.status || "active")
				.order("created_at", { ascending: false });

			// Apply filters efficiently
			if (params.query) {
				query = query.textSearch("title_fts", params.query, {
					type: "websearch",
					config: "english",
				});
			}

			if (params.location) {
				query = query.ilike("location", `%${params.location}%`);
			}

			if (params.category) {
				query = query.eq("category.slug", params.category);
			}

			if (params.budgetMin && params.budgetMax) {
				query = query.gte("budget_amount", params.budgetMin).lte("budget_amount", params.budgetMax);
			}

			if (params.urgency) {
				query = query.eq("urgency", params.urgency);
			}

			// Pagination
			const limit = params.limit || 20;
			const offset = params.offset || 0;
			query = query.range(offset, offset + limit - 1);

			const { data: jobs, error, count } = await query;

			if (error) {
				logger.error("Job search query error:", error);
				throw error;
			}

			const result = {
				jobs: jobs as JobWithRelations[],
				total: count || 0,
			};

			// Cache successful results
			CacheManager.memory.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Job search completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: {
					queryTime,
					cacheHit: false,
				},
			};
		} catch (error) {
			logger.error("Job search error:", error);
			throw error;
		}
	}

	/**
	 * Get job by ID with optimized relations loading
	 */
	static async getJobById(
		id: string,
		options: {
			includeProposals?: boolean;
			includeAttachments?: boolean;
			includeMessages?: boolean;
		} = {}
	): Promise<JobWithRelations | null> {
		const startTime = performance.now();
		const cacheKey = `job_${id}_${JSON.stringify(options)}`;

		// Check cache first
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Build selective query based on options
			let selectFields = `
				*,
				user:users(
					id,
					name,
					avatar_url,
					email
				),
				category:categories(
					id,
					name,
					slug
				)
			`;

			if (options.includeProposals) {
				selectFields += `,
					proposals:job_proposals(
						id,
						amount,
						timeline,
						description,
						status,
						created_at,
						contractor:users(
							id,
							name,
							avatar_url,
							profile:user_profiles(
								business_name,
								rating,
								completed_jobs
							)
						)
					)
				`;
			}

			if (options.includeAttachments) {
				selectFields += `,
					attachments:job_attachments(
						id,
						file_name,
						file_size,
						file_type,
						storage_path
					)
				`;
			}

			if (options.includeMessages) {
				selectFields += `,
					messages:job_messages(
						id,
						content,
						created_at,
						sender:users(name, avatar_url)
					)
				`;
			}

			const { data: job, error } = await this.pooledClient.from("jobs").select(selectFields).eq("id", id).single();

			if (error) {
				if (error.code === "PGRST116") {
					return null; // Job not found
				}
				logger.error("Get job by ID error:", error);
				throw error;
			}

			// Cache the result
			CacheManager.memory.set(cacheKey, job, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Get job by ID completed in ${queryTime.toFixed(2)}ms`);

			return job as JobWithRelations;
		} catch (error) {
			logger.error("Get job by ID error:", error);
			throw error;
		}
	}

	/**
	 * Get jobs by user ID (posted jobs)
	 */
	static async getJobsByUserId(
		userId: string,
		options: {
			status?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<JobWithRelations[]> {
		const startTime = performance.now();
		const cacheKey = `user_jobs_${userId}_${JSON.stringify(options)}`;

		// Check cache first
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			let query = this.pooledClient
				.from("jobs")
				.select(
					`
					*,
					category:categories(id, name, slug),
					proposals:job_proposals(
						id,
						status,
						amount,
						contractor:users(name, avatar_url)
					)
				`
				)
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (options.status) {
				query = query.eq("status", options.status);
			}

			// Pagination
			const limit = options.limit || 10;
			const offset = options.offset || 0;
			query = query.range(offset, offset + limit - 1);

			const { data: jobs, error } = await query;

			if (error) {
				logger.error("Get jobs by user ID error:", error);
				throw error;
			}

			// Cache the results
			CacheManager.memory.set(cacheKey, jobs, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Get jobs by user ID completed in ${queryTime.toFixed(2)}ms`);

			return jobs as JobWithRelations[];
		} catch (error) {
			logger.error("Get jobs by user ID error:", error);
			throw error;
		}
	}

	/**
	 * Get trending jobs with performance optimization
	 */
	static async getTrendingJobs(limit: number = 10): Promise<JobWithRelations[]> {
		const startTime = performance.now();
		const cacheKey = `trending_jobs_${limit}`;

		// Check cache first (longer TTL for trending)
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			// Get jobs with high proposal counts and recent activity
			const { data: jobs, error } = await this.pooledClient.rpc("get_trending_jobs", {
				result_limit: limit,
			});

			if (error) {
				logger.error("Trending jobs query error:", error);
				throw error;
			}

			// Cache with longer TTL (15 minutes)
			CacheManager.memory.set(cacheKey, jobs, 15 * 60 * 1000);

			const queryTime = performance.now() - startTime;
			logger.performance(`Trending jobs query completed in ${queryTime.toFixed(2)}ms`);

			return jobs;
		} catch (error) {
			logger.error("Trending jobs error:", error);
			throw error;
		}
	}

	/**
	 * Get job statistics
	 */
	static async getJobStats(userId?: string): Promise<{
		total: number;
		active: number;
		completed: number;
		cancelled: number;
		averageBudget: number;
	}> {
		const startTime = performance.now();
		const cacheKey = userId ? `job_stats_${userId}` : "job_stats_global";

		// Check cache first
		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const { data: stats, error } = await this.pooledClient.rpc("get_job_statistics", {
				user_id: userId || null,
			});

			if (error) {
				logger.error("Job stats query error:", error);
				throw error;
			}

			// Cache the results
			CacheManager.memory.set(cacheKey, stats, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Job stats query completed in ${queryTime.toFixed(2)}ms`);

			return stats;
		} catch (error) {
			logger.error("Job stats error:", error);
			throw error;
		}
	}
}
