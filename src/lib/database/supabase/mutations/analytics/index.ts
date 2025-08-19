/**
 * Analytics Mutations
 * Enterprise-level analytics data mutations with performance optimization
 * Handles event tracking, form submissions, and analytics data management
 */

import { supabase, getPooledClient, Tables } from "../../client";
import logger from "@lib/utils/logger";

type AnalyticsEvent = Tables<"analytics_events">;
type FormSubmission = Tables<"form_submissions">;

/**
 * Analytics Mutations Class
 * Centralized analytics data writing operations
 */
export class AnalyticsMutations {
	private static readonly pooledClient = getPooledClient("analytics");
	private static eventQueue: any[] = [];
	private static batchTimer: NodeJS.Timeout | null = null;

	/**
	 * Track analytics event with batching for performance
	 * Events are batched and sent in groups to reduce database load
	 */
	static async trackEvent(eventData: { userId?: string; sessionId?: string; eventType: string; eventData?: Record<string, any>; pageUrl?: string; referrer?: string; userAgent?: string; ipAddress?: string }): Promise<{ success: boolean; eventId?: string; batched?: boolean }> {
		try {
			// For critical events, send immediately
			const criticalEvents = ["error", "conversion", "purchase", "signup"];
			const isCritical = criticalEvents.includes(eventData.eventType);

			if (isCritical) {
				return await this.sendEventImmediately(eventData);
			}

			// Add to batch queue for non-critical events
			this.eventQueue.push({
				user_id: eventData.userId,
				session_id: eventData.sessionId,
				event_type: eventData.eventType,
				event_data: eventData.eventData || {},
				page_url: eventData.pageUrl,
				referrer: eventData.referrer,
				user_agent: eventData.userAgent,
				ip_address: eventData.ipAddress,
				created_at: new Date().toISOString(),
			});

			// Setup batch processing
			this.setupBatchProcessing();

			logger.debug(`Analytics event queued: ${eventData.eventType}`);

			return {
				success: true,
				batched: true,
			};
		} catch (error) {
			logger.error("Track event error:", error);
			// Analytics failures shouldn't break the app
			return { success: false };
		}
	}

	/**
	 * Track multiple events at once for bulk operations
	 */
	static async trackBulkEvents(
		events: Array<{
			userId?: string;
			sessionId?: string;
			eventType: string;
			eventData?: Record<string, any>;
			pageUrl?: string;
			referrer?: string;
			userAgent?: string;
			ipAddress?: string;
		}>
	): Promise<{ success: boolean; insertedCount: number }> {
		try {
			const eventRecords = events.map((event) => ({
				user_id: event.userId,
				session_id: event.sessionId,
				event_type: event.eventType,
				event_data: event.eventData || {},
				page_url: event.pageUrl,
				referrer: event.referrer,
				user_agent: event.userAgent,
				ip_address: event.ipAddress,
			}));

			const { data, error } = await this.pooledClient.from("analytics_events").insert(eventRecords).select("id");

			if (error) {
				logger.error("Bulk events tracking error:", error);
				return { success: false, insertedCount: 0 };
			}

			logger.info(`Bulk tracked ${data?.length || 0} analytics events`);

			return {
				success: true,
				insertedCount: data?.length || 0,
			};
		} catch (error) {
			logger.error("Bulk track events error:", error);
			return { success: false, insertedCount: 0 };
		}
	}

	/**
	 * Submit form data with analytics tracking
	 */
	static async submitForm(formData: { formType: string; data: Record<string, any>; userId?: string; email?: string; metadata?: Record<string, any> }): Promise<{
		success: boolean;
		submissionId?: string;
		validationErrors?: Record<string, string>;
	}> {
		try {
			// Validate form data based on type
			const validationErrors = this.validateFormData(formData.formType, formData.data);
			if (Object.keys(validationErrors).length > 0) {
				return {
					success: false,
					validationErrors,
				};
			}

			// Insert form submission
			const { data, error } = await this.pooledClient
				.from("form_submissions")
				.insert({
					form_type: formData.formType,
					data: {
						...formData.data,
						metadata: formData.metadata,
						submitted_at: new Date().toISOString(),
					},
					user_id: formData.userId,
					email: formData.email,
					status: "pending",
				})
				.select("id")
				.single();

			if (error) {
				logger.error("Form submission error:", error);
				throw error;
			}

			// Track analytics event for form submission
			await this.trackEvent({
				userId: formData.userId,
				eventType: "form_submission",
				eventData: {
					formType: formData.formType,
					submissionId: data.id,
				},
			});

			logger.info(`Form submitted: ${formData.formType} (${data.id})`);

			return {
				success: true,
				submissionId: data.id,
			};
		} catch (error) {
			logger.error("Submit form error:", error);
			return { success: false };
		}
	}

	/**
	 * Update form submission status
	 */
	static async updateFormStatus(submissionId: string, status: "pending" | "processing" | "completed" | "rejected", processedBy?: string, notes?: string): Promise<{ success: boolean }> {
		try {
			const { error } = await this.pooledClient
				.from("form_submissions")
				.update({
					status,
					processed_at: status !== "pending" ? new Date().toISOString() : null,
					processed_by: processedBy,
					notes,
				})
				.eq("id", submissionId);

			if (error) {
				logger.error("Update form status error:", error);
				throw error;
			}

			// Track status change event
			await this.trackEvent({
				eventType: "form_status_change",
				eventData: {
					submissionId,
					newStatus: status,
					processedBy,
				},
			});

			logger.info(`Form status updated: ${submissionId} -> ${status}`);

			return { success: true };
		} catch (error) {
			logger.error("Update form status error:", error);
			return { success: false };
		}
	}

	/**
	 * Subscribe to newsletter with analytics tracking
	 */
	static async subscribeNewsletter(emailData: { email: string; source?: string; preferences?: Record<string, boolean>; userId?: string }): Promise<{ success: boolean; subscriptionId?: string; alreadyExists?: boolean }> {
		try {
			// Check if email already exists
			const { data: existing } = await this.pooledClient.from("newsletter_subscriptions").select("id, status").eq("email", emailData.email).single();

			if (existing) {
				if (existing.status === "active") {
					return {
						success: true,
						alreadyExists: true,
						subscriptionId: existing.id,
					};
				}

				// Reactivate if previously unsubscribed
				const { error: updateError } = await this.pooledClient
					.from("newsletter_subscriptions")
					.update({
						status: "active",
						preferences: emailData.preferences || {},
						updated_at: new Date().toISOString(),
					})
					.eq("id", existing.id);

				if (updateError) throw updateError;

				return {
					success: true,
					subscriptionId: existing.id,
				};
			}

			// Create new subscription
			const { data, error } = await this.pooledClient
				.from("newsletter_subscriptions")
				.insert({
					email: emailData.email,
					source: emailData.source || "website",
					preferences: emailData.preferences || {},
					user_id: emailData.userId,
					status: "active",
				})
				.select("id")
				.single();

			if (error) {
				logger.error("Newsletter subscription error:", error);
				throw error;
			}

			// Track subscription event
			await this.trackEvent({
				userId: emailData.userId,
				eventType: "newsletter_subscription",
				eventData: {
					email: emailData.email,
					source: emailData.source,
					subscriptionId: data.id,
				},
			});

			logger.info(`Newsletter subscription: ${emailData.email}`);

			return {
				success: true,
				subscriptionId: data.id,
			};
		} catch (error) {
			logger.error("Newsletter subscription error:", error);
			return { success: false };
		}
	}

	/**
	 * Send event immediately for critical events
	 */
	private static async sendEventImmediately(eventData: any): Promise<{ success: boolean; eventId?: string }> {
		try {
			const { data, error } = await this.pooledClient
				.from("analytics_events")
				.insert({
					user_id: eventData.userId,
					session_id: eventData.sessionId,
					event_type: eventData.eventType,
					event_data: eventData.eventData || {},
					page_url: eventData.pageUrl,
					referrer: eventData.referrer,
					user_agent: eventData.userAgent,
					ip_address: eventData.ipAddress,
				})
				.select("id")
				.single();

			if (error) {
				logger.error("Immediate event tracking error:", error);
				throw error;
			}

			logger.debug(`Critical analytics event tracked: ${eventData.eventType}`);

			return {
				success: true,
				eventId: data?.id,
			};
		} catch (error) {
			logger.error("Send immediate event error:", error);
			return { success: false };
		}
	}

	/**
	 * Setup batch processing for queued events
	 */
	private static setupBatchProcessing(): void {
		if (this.batchTimer) return;

		// Process batch every 5 seconds or when queue reaches 50 events
		this.batchTimer = setTimeout(async () => {
			await this.processBatch();
		}, 5000);

		// Also check for queue size
		if (this.eventQueue.length >= 50) {
			clearTimeout(this.batchTimer);
			this.batchTimer = null;
			this.processBatch();
		}
	}

	/**
	 * Process queued events in batch
	 */
	private static async processBatch(): Promise<void> {
		if (this.eventQueue.length === 0) {
			this.batchTimer = null;
			return;
		}

		const eventsToProcess = [...this.eventQueue];
		this.eventQueue = [];
		this.batchTimer = null;

		try {
			const { error } = await this.pooledClient.from("analytics_events").insert(eventsToProcess);

			if (error) {
				logger.error("Batch events processing error:", error);
				// Re-queue failed events
				this.eventQueue.unshift(...eventsToProcess);
			} else {
				logger.debug(`Processed batch of ${eventsToProcess.length} analytics events`);
			}
		} catch (error) {
			logger.error("Process batch error:", error);
			// Re-queue failed events
			this.eventQueue.unshift(...eventsToProcess);
		}
	}

	/**
	 * Validate form data based on form type
	 */
	private static validateFormData(formType: string, data: any): Record<string, string> {
		const errors: Record<string, string> = {};

		switch (formType) {
			case "contact":
				if (!data.name?.trim()) errors.name = "Name is required";
				if (!data.email?.trim()) errors.email = "Email is required";
				if (!data.message?.trim()) errors.message = "Message is required";
				break;

			case "business_claim":
				if (!data.businessId) errors.businessId = "Business ID is required";
				if (!data.claimReason?.trim()) errors.claimReason = "Claim reason is required";
				break;

			case "report":
				if (!data.reportType) errors.reportType = "Report type is required";
				if (!data.description?.trim()) errors.description = "Description is required";
				break;

			// Add more form type validations as needed
		}

		return errors;
	}

	/**
	 * Flush any remaining queued events (useful for app shutdown)
	 */
	static async flushEvents(): Promise<void> {
		if (this.batchTimer) {
			clearTimeout(this.batchTimer);
			this.batchTimer = null;
		}

		if (this.eventQueue.length > 0) {
			await this.processBatch();
		}
	}
}
