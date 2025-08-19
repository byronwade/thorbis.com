/**
 * Statsig Analytics Utilities
 * Performance-first analytics integration that works alongside existing analytics
 * Provides unified interface for cross-platform analytics tracking
 */

import logger from "./logger.js";
import { AnalyticsMutations } from "@lib/database/supabase/mutations/analytics";
import { services } from "@config";

/**
 * Unified Analytics Manager
 * Manages multiple analytics providers including Statsig, PostHog, and GA
 */
export class UnifiedAnalytics {
	static providers = {
		statsig: null,
		posthog: null,
		googleAnalytics: null,
	};

	static config = services.analytics;
	static eventQueue = [];
	static isInitialized = false;

	/**
	 * Initialize all analytics providers
	 */
	static async initialize(providers = {}) {
		if (this.isInitialized) return;

		const startTime = performance.now();

		try {
			logger.info("🚀 Initializing Unified Analytics...");

			// Store provider instances
			this.providers = { ...this.providers, ...providers };

			// Setup event queue processing
			this.setupEventQueue();

			// Setup global error tracking
			this.setupGlobalErrorTracking();

			// Setup page view tracking
			this.setupPageViewTracking();

			this.isInitialized = true;

			const initTime = performance.now() - startTime;
			logger.info(`✅ Unified Analytics initialized in ${initTime.toFixed(2)}ms`);

			// Track initialization
			this.trackEvent("analytics_initialized", {
				providers: Object.keys(providers),
				initTime,
			});
		} catch (error) {
			logger.error("❌ Failed to initialize Unified Analytics:", error);
		}
	}

	/**
	 * Track event across all analytics providers
	 * Implements performance-optimized event routing
	 */
	static async trackEvent(eventName, properties = {}, options = {}) {
		const startTime = performance.now();

		try {
			// Prepare event data with standardized format
			const eventData = {
				name: eventName,
				properties: {
					...properties,
					timestamp: Date.now(),
					page_url: typeof window !== "undefined" ? window.location.href : null,
					user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
					source: "unified_analytics",
				},
				options: {
					batch: this.config.performance.batchEvents,
					immediate: options.immediate || false,
					...options,
				},
			};

			// Route to appropriate providers based on configuration
			const promises = [];

			// Statsig tracking
			if (this.providers.statsig && this.config.providers.statsig.enabled) {
				promises.push(this.trackStatsigEvent(eventData));
			}

			// PostHog tracking (when implemented)
			if (this.providers.posthog && this.config.providers.posthog.enabled) {
				promises.push(this.trackPostHogEvent(eventData));
			}

			// Google Analytics tracking (when implemented)
			if (this.providers.googleAnalytics && this.config.providers.googleAnalytics.enabled) {
				promises.push(this.trackGoogleAnalyticsEvent(eventData));
			}

			// Always track in internal analytics system
			promises.push(this.trackInternalEvent(eventData));

			// Execute all tracking in parallel for performance
			if (options.immediate) {
				await Promise.all(promises);
			} else {
				// Add to queue for batch processing
				this.eventQueue.push({ eventData, promises });
				this.processEventQueue();
			}

			const trackingTime = performance.now() - startTime;
			logger.debug(`Event tracked: ${eventName} (${trackingTime.toFixed(2)}ms)`);
		} catch (error) {
			logger.error(`Failed to track event ${eventName}:`, error);
		}
	}

	/**
	 * Track Statsig-specific event
	 */
	static async trackStatsigEvent(eventData) {
		try {
			if (this.providers.statsig && this.providers.statsig.logEvent) {
				this.providers.statsig.logEvent(eventData.name, eventData.properties.value || null, eventData.properties);
			}
		} catch (error) {
			logger.error("Statsig event tracking error:", error);
		}
	}

	/**
	 * Track PostHog event (placeholder for future implementation)
	 */
	static async trackPostHogEvent(eventData) {
		try {
			if (this.providers.posthog && this.providers.posthog.capture) {
				this.providers.posthog.capture(eventData.name, eventData.properties);
			}
		} catch (error) {
			logger.error("PostHog event tracking error:", error);
		}
	}

	/**
	 * Track Google Analytics event (placeholder for future implementation)
	 */
	static async trackGoogleAnalyticsEvent(eventData) {
		try {
			if (typeof gtag !== "undefined") {
				gtag("event", eventData.name, eventData.properties);
			}
		} catch (error) {
			logger.error("Google Analytics event tracking error:", error);
		}
	}

	/**
	 * Track in internal analytics system
	 */
	static async trackInternalEvent(eventData) {
		try {
			await AnalyticsMutations.trackEvent({
				eventType: eventData.name,
				eventData: eventData.properties,
				pageUrl: eventData.properties.page_url,
				userAgent: eventData.properties.user_agent,
				userId: eventData.properties.userId,
				sessionId: eventData.properties.sessionId,
			});
		} catch (error) {
			logger.error("Internal analytics tracking error:", error);
		}
	}

	/**
	 * Setup event queue processing for batch operations
	 */
	static setupEventQueue() {
		setInterval(() => {
			this.processEventQueue();
		}, this.config.performance.flushInterval);
	}

	/**
	 * Process queued events in batches
	 */
	static async processEventQueue() {
		if (this.eventQueue.length === 0) return;

		const batchSize = this.config.performance.batchSize;
		const batch = this.eventQueue.splice(0, batchSize);

		try {
			const allPromises = batch.flatMap((item) => item.promises);
			await Promise.allSettled(allPromises);

			logger.debug(`Processed ${batch.length} analytics events in batch`);
		} catch (error) {
			logger.error("Event queue processing error:", error);
		}
	}

	/**
	 * Setup global error tracking
	 */
	static setupGlobalErrorTracking() {
		if (typeof window === "undefined") return;

		// JavaScript errors
		window.addEventListener("error", (event) => {
			this.trackEvent("javascript_error", {
				message: event.message,
				filename: event.filename,
				line: event.lineno,
				column: event.colno,
				stack: event.error?.stack,
			});
		});

		// Promise rejections
		window.addEventListener("unhandledrejection", (event) => {
			this.trackEvent("unhandled_promise_rejection", {
				reason: event.reason?.toString(),
				stack: event.reason?.stack,
			});
		});
	}

	/**
	 * Setup automatic page view tracking
	 */
	static setupPageViewTracking() {
		if (typeof window === "undefined") return;

		// Track initial page view
		this.trackPageView();

		// Track route changes (for SPA navigation)
		let currentPath = window.location.pathname;
		const observer = new MutationObserver(() => {
			if (window.location.pathname !== currentPath) {
				currentPath = window.location.pathname;
				this.trackPageView();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	/**
	 * Track page view across all providers
	 */
	static trackPageView(url = null) {
		const pageUrl = url || (typeof window !== "undefined" ? window.location.href : null);
		const referrer = typeof document !== "undefined" ? document.referrer : null;

		this.trackEvent("page_view", {
			page_url: pageUrl,
			page_title: typeof document !== "undefined" ? document.title : null,
			referrer,
		});
	}

	/**
	 * Track user identification across all providers
	 */
	static identify(userId, properties = {}) {
		try {
			const userData = {
				userId,
				...properties,
				identified_at: Date.now(),
			};

			// Statsig user update
			if (this.providers.statsig && this.providers.statsig.updateUser) {
				this.providers.statsig.updateUser({
					userID: userId,
					...properties,
				});
			}

			// PostHog identify (when implemented)
			if (this.providers.posthog && this.providers.posthog.identify) {
				this.providers.posthog.identify(userId, properties);
			}

			// Track in internal system
			this.trackEvent("user_identified", userData);

			logger.debug("User identified across analytics providers:", userId);
		} catch (error) {
			logger.error("User identification error:", error);
		}
	}

	/**
	 * Flush all pending events immediately
	 */
	static async flush() {
		try {
			// Process any remaining queued events
			await this.processEventQueue();

			// Flush individual providers
			const flushPromises = [];

			if (this.providers.statsig && this.providers.statsig.flush) {
				flushPromises.push(this.providers.statsig.flush());
			}

			if (this.providers.posthog && this.providers.posthog.flush) {
				flushPromises.push(this.providers.posthog.flush());
			}

			await Promise.allSettled(flushPromises);
			logger.debug("All analytics providers flushed");
		} catch (error) {
			logger.error("Analytics flush error:", error);
		}
	}

	/**
	 * Get performance metrics from all providers
	 */
	static getPerformanceMetrics() {
		return {
			statsig: this.providers.statsig?.performance || null,
			eventQueue: {
				pending: this.eventQueue.length,
				batchSize: this.config.performance.batchSize,
				flushInterval: this.config.performance.flushInterval,
			},
			isInitialized: this.isInitialized,
		};
	}
}

/**
 * E-commerce tracking utilities
 */
export class EcommerceAnalytics extends UnifiedAnalytics {
	/**
	 * Track product view
	 */
	static trackProductView(product) {
		this.trackEvent("product_viewed", {
			product_id: product.id,
			product_name: product.name,
			product_category: product.category,
			price: product.price,
			currency: product.currency || "USD",
		});
	}

	/**
	 * Track add to cart
	 */
	static trackAddToCart(product, quantity = 1) {
		this.trackEvent("add_to_cart", {
			product_id: product.id,
			product_name: product.name,
			product_category: product.category,
			price: product.price,
			quantity,
			value: product.price * quantity,
			currency: product.currency || "USD",
		});
	}

	/**
	 * Track purchase
	 */
	static trackPurchase(transaction) {
		this.trackEvent("purchase", {
			transaction_id: transaction.id,
			value: transaction.total,
			currency: transaction.currency || "USD",
			items: transaction.items,
			revenue: transaction.total,
		});
	}
}

/**
 * Business analytics utilities
 */
export class BusinessAnalytics extends UnifiedAnalytics {
	/**
	 * Track business listing view
	 */
	static trackBusinessView(business) {
		this.trackEvent("business_viewed", {
			business_id: business.id,
			business_name: business.name,
			business_category: business.category,
			rating: business.rating,
			review_count: business.reviewCount,
		});
	}

	/**
	 * Track business contact action
	 */
	static trackBusinessContact(business, contactType) {
		this.trackEvent("business_contact", {
			business_id: business.id,
			business_name: business.name,
			contact_type: contactType, // 'call', 'email', 'website', 'directions'
		});
	}

	/**
	 * Track review submission
	 */
	static trackReviewSubmission(business, rating) {
		this.trackEvent("review_submitted", {
			business_id: business.id,
			business_name: business.name,
			rating,
		});
	}
}

/**
 * Convenience function for immediate event tracking
 */
export const trackEvent = (eventName, properties = {}) => {
	UnifiedAnalytics.trackEvent(eventName, properties);
};

/**
 * Convenience function for page view tracking
 */
export const trackPageView = (url = null) => {
	UnifiedAnalytics.trackPageView(url);
};

/**
 * Convenience function for user identification
 */
export const identifyUser = (userId, properties = {}) => {
	UnifiedAnalytics.identify(userId, properties);
};

export default UnifiedAnalytics;
