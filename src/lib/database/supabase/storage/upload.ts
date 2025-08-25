// REQUIRED: Optimized file upload with CDN integration
import { supabase } from "../client";
import { logger } from "@lib/utils/logger";

/**
 * High-performance file storage operations with optimization
 */
export class SupabaseStorage {
	private static readonly pooledClient = supabase;
	private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	private static readonly ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/csv", "application/json"];

	/**
	 * Upload file with optimization and validation
	 */
	static async uploadFile(
		bucket: string,
		path: string,
		file: File | Blob,
		options: {
			cacheControl?: string;
			contentType?: string;
			metadata?: Record<string, any>;
			upsert?: boolean;
		} = {}
	): Promise<{
		data: { path: string; fullPath: string; publicUrl: string };
		error: any;
	}> {
		const startTime = performance.now();

		try {
			// Validate file size
			if (file.size > this.MAX_FILE_SIZE) {
				throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
			}

			// Validate file type
			const fileType = file.type || options.contentType;
			if (fileType && !this.ALLOWED_FILE_TYPES.includes(fileType)) {
				throw new Error(`File type ${fileType} is not allowed`);
			}

			// Optimize image files
			let optimizedFile = file;
			if (fileType?.startsWith("image/")) {
				optimizedFile = await this.optimizeImage(file as File);
			}

			// Upload with performance-optimized settings
			const { data, error } = await this.pooledClient.storage.from(bucket).upload(path, optimizedFile, {
				cacheControl: options.cacheControl || "3600", // 1 hour default
				contentType: options.contentType || fileType,
				metadata: options.metadata,
				upsert: options.upsert || false,
			});

			if (error) {
				logger.error("File upload error:", error);
				throw error;
			}

			// Get public URL with CDN optimization
			const { data: urlData } = this.pooledClient.storage.from(bucket).getPublicUrl(path, {
				transform: {
					width: 800,
					height: 600,
					resize: "cover",
					format: "webp",
					quality: 80,
				},
			});

			const uploadTime = performance.now() - startTime;
			logger.performance(`File upload completed in ${uploadTime.toFixed(2)}ms`);

			logger.storage({
				action: "file_uploaded",
				bucket,
				path,
				fileSize: file.size,
				fileType: fileType,
				uploadTime,
				timestamp: Date.now(),
			});

			return {
				data: {
					path: data.path,
					fullPath: data.fullPath,
					publicUrl: urlData.publicUrl,
				},
				error: null,
			};
		} catch (error) {
			logger.error("File upload error:", error);
			return {
				data: null,
				error,
			};
		}
	}

	/**
	 * Upload multiple files with batch optimization
	 */
	static async uploadFiles(
		bucket: string,
		files: Array<{
			path: string;
			file: File | Blob;
			options?: {
				cacheControl?: string;
				contentType?: string;
				metadata?: Record<string, any>;
			};
		}>
	): Promise<
		Array<{
			path: string;
			success: boolean;
			data?: { path: string; fullPath: string; publicUrl: string };
			error?: any;
		}>
	> {
		const startTime = performance.now();

		try {
			// Upload files in parallel with concurrency limit
			const concurrencyLimit = 5;
			const results = [];

			for (let i = 0; i < files.length; i += concurrencyLimit) {
				const batch = files.slice(i, i + concurrencyLimit);

				const batchPromises = batch.map(async ({ path, file, options = {} }) => {
					try {
						const result = await this.uploadFile(bucket, path, file, options);
						return {
							path,
							success: !result.error,
							data: result.data,
							error: result.error,
						};
					} catch (error) {
						return {
							path,
							success: false,
							error,
						};
					}
				});

				const batchResults = await Promise.all(batchPromises);
				results.push(...batchResults);
			}

			const uploadTime = performance.now() - startTime;
			logger.performance(`Batch file upload completed in ${uploadTime.toFixed(2)}ms`);

			const successCount = results.filter((r) => r.success).length;
			logger.storage({
				action: "batch_upload",
				bucket,
				totalFiles: files.length,
				successCount,
				failedCount: files.length - successCount,
				uploadTime,
				timestamp: Date.now(),
			});

			return results;
		} catch (error) {
			logger.error("Batch file upload error:", error);
			throw error;
		}
	}

	/**
	 * Delete file with cleanup
	 */
	static async deleteFile(bucket: string, path: string): Promise<void> {
		const startTime = performance.now();

		try {
			const { error } = await this.pooledClient.storage.from(bucket).remove([path]);

			if (error) {
				logger.error("File deletion error:", error);
				throw error;
			}

			const deleteTime = performance.now() - startTime;
			logger.performance(`File deletion completed in ${deleteTime.toFixed(2)}ms`);

			logger.storage({
				action: "file_deleted",
				bucket,
				path,
				deleteTime,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("File deletion error:", error);
			throw error;
		}
	}

	/**
	 * Get optimized public URL with transformations
	 */
	static getOptimizedUrl(
		bucket: string,
		path: string,
		options: {
			width?: number;
			height?: number;
			quality?: number;
			format?: "webp" | "jpg" | "png";
			resize?: "cover" | "contain" | "fill";
		} = {}
	): string {
		const { data } = this.pooledClient.storage.from(bucket).getPublicUrl(path, {
			transform: {
				width: options.width || 800,
				height: options.height || 600,
				quality: options.quality || 80,
				format: options.format || "webp",
				resize: options.resize || "cover",
			},
		});

		return data.publicUrl;
	}

	/**
	 * Optimize image file before upload
	 */
	private static async optimizeImage(file: File): Promise<File> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			const img = new Image();

			img.onload = () => {
				// Calculate optimal dimensions
				const maxWidth = 1920;
				const maxHeight = 1080;

				let { width, height } = img;

				if (width > maxWidth || height > maxHeight) {
					const ratio = Math.min(maxWidth / width, maxHeight / height);
					width *= ratio;
					height *= ratio;
				}

				canvas.width = width;
				canvas.height = height;

				// Draw and compress
				ctx?.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const optimizedFile = new File([blob], file.name, {
								type: "image/webp",
								lastModified: Date.now(),
							});
							resolve(optimizedFile);
						} else {
							resolve(file);
						}
					},
					"image/webp",
					0.8 // 80% quality
				);
			};

			img.onerror = () => resolve(file);
			img.src = URL.createObjectURL(file);
		});
	}

	/**
	 * Create bucket with optimized settings
	 */
	static async createBucket(
		bucketName: string,
		options: {
			public?: boolean;
			fileSizeLimit?: number;
			allowedMimeTypes?: string[];
		} = {}
	): Promise<void> {
		const startTime = performance.now();

		try {
			const { error } = await this.pooledClient.storage.createBucket(bucketName, {
				public: options.public || false,
				fileSizeLimit: options.fileSizeLimit || this.MAX_FILE_SIZE,
				allowedMimeTypes: options.allowedMimeTypes || this.ALLOWED_FILE_TYPES,
			});

			if (error) {
				logger.error("Bucket creation error:", error);
				throw error;
			}

			const createTime = performance.now() - startTime;
			logger.performance(`Bucket creation completed in ${createTime.toFixed(2)}ms`);

			logger.storage({
				action: "bucket_created",
				bucketName,
				options,
				createTime,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Bucket creation error:", error);
			throw error;
		}
	}

	/**
	 * List files with pagination and filtering
	 */
	static async listFiles(
		bucket: string,
		options: {
			limit?: number;
			offset?: number;
			sortBy?: { column: string; order: "asc" | "desc" };
			search?: string;
		} = {}
	): Promise<{
		files: any[];
		total: number;
		hasMore: boolean;
	}> {
		const startTime = performance.now();

		try {
			const { data: files, error } = await this.pooledClient.storage.from(bucket).list("", {
				limit: options.limit || 50,
				offset: options.offset || 0,
				sortBy: options.sortBy || { column: "created_at", order: "desc" },
				search: options.search,
			});

			if (error) {
				logger.error("List files error:", error);
				throw error;
			}

			const listTime = performance.now() - startTime;
			logger.performance(`List files completed in ${listTime.toFixed(2)}ms`);

			return {
				files: files || [],
				total: files?.length || 0,
				hasMore: (files?.length || 0) >= (options.limit || 50),
			};
		} catch (error) {
			logger.error("List files error:", error);
			throw error;
		}
	}
}
