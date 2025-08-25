/**
 * Jobs Mutations
 * Job posting creation, updates, and management operations
 * Following domain-based Supabase organization
 */

import { supabase, Tables, Database } from "../../client";
import { logger } from "@lib/utils/logger";
import { CacheManager } from "@lib/utils/cache-manager";

type Job = Tables<"jobs">;
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

/**
 * High-performance job mutations with validation and error handling
 */
export class JobMutations {
	private static readonly pooledClient = supabase;

	/**
	 * Create a new job posting
	 */
	static async createJob(jobData: Omit<JobInsert, "id" | "created_at" | "updated_at">): Promise<Job> {
		const startTime = performance.now();

		try {
			// Validate required fields
			this.validateJobData(jobData);

			// Create the job
			const { data: job, error } = await this.pooledClient
				.from("jobs")
				.insert({
					...jobData,
					status: "active",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) {
				logger.error("Create job error:", error);
				throw error;
			}

			// Invalidate relevant caches
			this.invalidateJobCaches(job.user_id, job.category_id);

			// Log the creation
			logger.info(`Job created: ${job.id} by user ${job.user_id}`);

			const createTime = performance.now() - startTime;
			logger.performance(`Job creation completed in ${createTime.toFixed(2)}ms`);

			return job;
		} catch (error) {
			logger.error("Create job failed:", error);
			throw error;
		}
	}

	/**
	 * Update an existing job
	 */
	static async updateJob(jobId: string, updateData: JobUpdate, userId: string): Promise<Job> {
		const startTime = performance.now();

		try {
			// Verify ownership or admin privileges
			await this.verifyJobOwnership(jobId, userId);

			// Update the job
			const { data: job, error } = await this.pooledClient
				.from("jobs")
				.update({
					...updateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", jobId)
				.select()
				.single();

			if (error) {
				logger.error("Update job error:", error);
				throw error;
			}

			// Invalidate caches
			this.invalidateJobCaches(job.user_id, job.category_id, jobId);

			// Log the update
			logger.info(`Job updated: ${jobId} by user ${userId}`);

			const updateTime = performance.now() - startTime;
			logger.performance(`Job update completed in ${updateTime.toFixed(2)}ms`);

			return job;
		} catch (error) {
			logger.error("Update job failed:", error);
			throw error;
		}
	}

	/**
	 * Delete a job (soft delete)
	 */
	static async deleteJob(jobId: string, userId: string): Promise<void> {
		const startTime = performance.now();

		try {
			// Verify ownership or admin privileges
			await this.verifyJobOwnership(jobId, userId);

			// Soft delete the job
			const { error } = await this.pooledClient
				.from("jobs")
				.update({
					status: "deleted",
					deleted_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("id", jobId);

			if (error) {
				logger.error("Delete job error:", error);
				throw error;
			}

			// Invalidate caches
			this.invalidateJobCaches(userId, null, jobId);

			// Log the deletion
			logger.info(`Job deleted: ${jobId} by user ${userId}`);

			const deleteTime = performance.now() - startTime;
			logger.performance(`Job deletion completed in ${deleteTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Delete job failed:", error);
			throw error;
		}
	}

	/**
	 * Update job status
	 */
	static async updateJobStatus(jobId: string, status: "active" | "paused" | "completed" | "cancelled", userId: string, reason?: string): Promise<Job> {
		const startTime = performance.now();

		try {
			// Verify ownership
			await this.verifyJobOwnership(jobId, userId);

			// Update status
			const { data: job, error } = await this.pooledClient
				.from("jobs")
				.update({
					status,
					status_reason: reason,
					updated_at: new Date().toISOString(),
					...(status === "completed" && { completed_at: new Date().toISOString() }),
				})
				.eq("id", jobId)
				.select()
				.single();

			if (error) {
				logger.error("Update job status error:", error);
				throw error;
			}

			// Invalidate caches
			this.invalidateJobCaches(job.user_id, job.category_id, jobId);

			// Log status change
			logger.info(`Job status updated: ${jobId} to ${status} by user ${userId}`);

			const updateTime = performance.now() - startTime;
			logger.performance(`Job status update completed in ${updateTime.toFixed(2)}ms`);

			return job;
		} catch (error) {
			logger.error("Update job status failed:", error);
			throw error;
		}
	}

	/**
	 * Add attachments to a job
	 */
	static async addJobAttachments(
		jobId: string,
		attachments: Array<{
			file_name: string;
			file_size: number;
			file_type: string;
			storage_path: string;
		}>,
		userId: string
	): Promise<void> {
		const startTime = performance.now();

		try {
			// Verify ownership
			await this.verifyJobOwnership(jobId, userId);

			// Insert attachments
			const { error } = await this.pooledClient.from("job_attachments").insert(
				attachments.map((attachment) => ({
					job_id: jobId,
					...attachment,
					uploaded_by: userId,
					created_at: new Date().toISOString(),
				}))
			);

			if (error) {
				logger.error("Add job attachments error:", error);
				throw error;
			}

			// Invalidate job cache
			CacheManager.memory.delete(`job_${jobId}_*`);

			// Log attachment addition
			logger.info(`Added ${attachments.length} attachments to job: ${jobId}`);

			const addTime = performance.now() - startTime;
			logger.performance(`Job attachments added in ${addTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Add job attachments failed:", error);
			throw error;
		}
	}

	/**
	 * Validate job data before creation/update
	 */
	private static validateJobData(jobData: Partial<JobInsert>): void {
		if (!jobData.title || jobData.title.trim().length < 5) {
			throw new Error("Job title must be at least 5 characters long");
		}

		if (!jobData.description || jobData.description.trim().length < 50) {
			throw new Error("Job description must be at least 50 characters long");
		}

		if (!jobData.category_id) {
			throw new Error("Job category is required");
		}

		if (!jobData.location || jobData.location.trim().length < 3) {
			throw new Error("Job location is required");
		}

		if (jobData.budget_type === "fixed" && (!jobData.budget_amount || jobData.budget_amount <= 0)) {
			throw new Error("Budget amount is required for fixed price jobs");
		}

		if (jobData.budget_type === "hourly" && (!jobData.hourly_rate || jobData.hourly_rate <= 0)) {
			throw new Error("Hourly rate is required for hourly jobs");
		}

		if (!["low", "medium", "high", "urgent"].includes(jobData.urgency as string)) {
			throw new Error("Invalid urgency level");
		}
	}

	/**
	 * Verify job ownership or admin privileges
	 */
	private static async verifyJobOwnership(jobId: string, userId: string): Promise<void> {
		const { data: job, error } = await this.pooledClient.from("jobs").select("user_id").eq("id", jobId).single();

		if (error) {
			throw new Error("Job not found");
		}

		if (job.user_id !== userId) {
			// Check if user has admin privileges
			const { data: userRole } = await this.pooledClient.from("user_roles").select("role").eq("user_id", userId).single();

			if (!userRole || userRole.role !== "admin") {
				throw new Error("Unauthorized: You can only modify your own jobs");
			}
		}
	}

	/**
	 * Invalidate relevant caches
	 */
	private static invalidateJobCaches(userId: string, categoryId?: string | null, jobId?: string): void {
		// Invalidate user's jobs cache
		CacheManager.memory.delete(`user_jobs_${userId}_*`);

		// Invalidate job search caches
		CacheManager.memory.delete("job_search_*");

		// Invalidate trending jobs cache
		CacheManager.memory.delete("trending_jobs_*");

		// Invalidate specific job cache
		if (jobId) {
			CacheManager.memory.delete(`job_${jobId}_*`);
		}

		// Invalidate category-specific caches
		if (categoryId) {
			CacheManager.memory.delete(`*category*${categoryId}*`);
		}

		// Invalidate job stats
		CacheManager.memory.delete("job_stats_*");

		logger.debug("Job-related caches invalidated");
	}
}
