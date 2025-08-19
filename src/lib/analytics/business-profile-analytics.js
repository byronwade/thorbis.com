/**
 * Business Profile Analytics & Performance Monitoring
 * Tracks user interactions, performance metrics, and business engagement
 * Implements enterprise-level monitoring as per performance-first requirements
 */

import logger from "@lib/utils/logger";

class BusinessProfileAnalytics {
	constructor() {
		this.sessionId = this.generateSessionId();
		this.startTime = performance.now();
		this.interactions = [];
		this.performanceMetrics = {};
		this.isInitialized = false;
	}

	/**
	 * Initialize analytics tracking
	 */
	initialize(businessId, businessName) {
		if (this.isInitialized) return;

		this.businessId = businessId;
		this.businessName = businessName;
		this.isInitialized = true;

		// Track page load performance
		this.trackPageLoadMetrics();

		// Set up performance observers
		this.setupPerformanceObservers();

		// Track initial page view
		this.trackEvent("business_profile_view", {
			business_id: businessId,
			business_name: businessName,
			session_id: this.sessionId,
			timestamp: Date.now(),
			user_agent: navigator.userAgent,
			viewport: `${window.innerWidth}x${window.innerHeight}`,
			referrer: document.referrer,
		});

		logger.performance(`Business profile analytics initialized for ${businessName}`);
	}

	/**
	 * Generate unique session ID
	 */
	generateSessionId() {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Track Core Web Vitals and custom performance metrics
	 */
	trackPageLoadMetrics() {
		// Wait for page load to complete
		window.addEventListener("load", () => {
			const navigation = performance.getEntriesByType("navigation")[0];
			const paintEntries = performance.getEntriesByType("paint");

			const metrics = {
				// Navigation timing
				dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
				tcp_connection: navigation.connectEnd - navigation.connectStart,
				server_response: navigation.responseEnd - navigation.requestStart,
				dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
				page_load_complete: navigation.loadEventEnd - navigation.navigationStart,

				// Paint metrics
				first_paint: paintEntries.find((entry) => entry.name === "first-paint")?.startTime || 0,
				first_contentful_paint: paintEntries.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0,

				// Custom business profile metrics
				time_to_interactive: this.calculateTimeToInteractive(),
				business_info_load_time: performance.now() - this.startTime,

				// Session info
				session_id: this.sessionId,
				business_id: this.businessId,
				timestamp: Date.now(),
			};

			this.performanceMetrics = metrics;

			// Log performance data
			logger.performance("Business profile load metrics:", metrics);

			// Track slow loading
			if (metrics.page_load_complete > 3000) {
				logger.warn(`Slow page load detected: ${metrics.page_load_complete}ms`);
			}
		});
	}

	/**
	 * Set up performance observers for Core Web Vitals
	 */
	setupPerformanceObservers() {
		// Largest Contentful Paint (LCP)
		if ("PerformanceObserver" in window) {
			try {
				const lcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];

					this.trackMetric("largest_contentful_paint", lastEntry.startTime, {
						element: lastEntry.element?.tagName || "unknown",
						url: lastEntry.url || "inline",
					});
				});
				lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

				// First Input Delay (FID)
				const fidObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach((entry) => {
						this.trackMetric("first_input_delay", entry.processingStart - entry.startTime, {
							event_type: entry.name,
							target: entry.target?.tagName || "unknown",
						});
					});
				});
				fidObserver.observe({ entryTypes: ["first-input"] });

				// Cumulative Layout Shift (CLS)
				let clsValue = 0;
				const clsObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach((entry) => {
						if (!entry.hadRecentInput) {
							clsValue += entry.value;
						}
					});

					this.trackMetric("cumulative_layout_shift", clsValue);
				});
				clsObserver.observe({ entryTypes: ["layout-shift"] });
			} catch (error) {
				logger.error("Error setting up performance observers:", error);
			}
		}
	}

	/**
	 * Calculate custom Time to Interactive metric
	 */
	calculateTimeToInteractive() {
		// Simple TTI calculation based on when main content is loaded
		const navigation = performance.getEntriesByType("navigation")[0];
		return navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0;
	}

	/**
	 * Track custom performance metric
	 */
	trackMetric(metricName, value, additionalData = {}) {
		const metric = {
			metric_name: metricName,
			value: value,
			business_id: this.businessId,
			session_id: this.sessionId,
			timestamp: Date.now(),
			...additionalData,
		};

		logger.performance(`${metricName}: ${value}ms`, metric);

		// Alert on poor performance
		const thresholds = {
			largest_contentful_paint: 2500,
			first_input_delay: 100,
			cumulative_layout_shift: 0.1,
			business_info_load_time: 2000,
		};

		if (thresholds[metricName] && value > thresholds[metricName]) {
			logger.warn(`Poor ${metricName} detected: ${value} > ${thresholds[metricName]}`);
		}
	}

	/**
	 * Track user interactions and business engagement
	 */
	trackEvent(eventName, eventData = {}) {
		const event = {
			event_name: eventName,
			business_id: this.businessId,
			business_name: this.businessName,
			session_id: this.sessionId,
			timestamp: Date.now(),
			page_url: window.location.href,
			...eventData,
		};

		this.interactions.push(event);

		// Log interaction
		logger.interaction(eventName, event);

		// Track business engagement metrics
		this.updateEngagementMetrics(eventName, event);
	}

	/**
	 * Track specific business profile interactions
	 */
	trackBusinessInteraction(action, details = {}) {
		const businessActions = {
			phone_click: { category: "contact", priority: "high" },
			email_click: { category: "contact", priority: "high" },
			website_click: { category: "engagement", priority: "medium" },
			directions_click: { category: "navigation", priority: "high" },
			photo_view: { category: "engagement", priority: "low" },
			service_inquiry: { category: "conversion", priority: "high" },
			review_read: { category: "research", priority: "medium" },
			hours_check: { category: "research", priority: "medium" },
			social_media_click: { category: "engagement", priority: "low" },
			contact_form_submit: { category: "conversion", priority: "high" },
			share_business: { category: "viral", priority: "medium" },
			save_business: { category: "retention", priority: "high" },
		};

		const actionConfig = businessActions[action] || { category: "other", priority: "low" };

		this.trackEvent(`business_${action}`, {
			action: action,
			category: actionConfig.category,
			priority: actionConfig.priority,
			...details,
		});

		// Special handling for high-priority conversion events
		if (actionConfig.priority === "high") {
			logger.businessMetrics({
				type: "conversion_event",
				action: action,
				business_id: this.businessId,
				session_id: this.sessionId,
				timestamp: Date.now(),
			});
		}
	}

	/**
	 * Update engagement metrics
	 */
	updateEngagementMetrics(eventName, eventData) {
		// Track time spent on profile
		const timeOnProfile = performance.now() - this.startTime;

		// Calculate engagement score based on interactions
		const engagementActions = ["phone_click", "email_click", "contact_form_submit", "service_inquiry", "directions_click", "website_click"];

		const engagementScore = this.interactions.filter((interaction) => engagementActions.some((action) => interaction.event_name.includes(action))).length;

		// Track scroll depth
		const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

		// Update metrics
		this.performanceMetrics.engagement = {
			time_on_profile: timeOnProfile,
			interaction_count: this.interactions.length,
			engagement_score: engagementScore,
			scroll_depth: scrollDepth,
			last_interaction: eventName,
			session_id: this.sessionId,
		};
	}

	/**
	 * Track section visibility (for lazy loading analytics)
	 */
	trackSectionView(sectionName, elementRef) {
		if (!elementRef?.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.trackEvent("section_view", {
							section_name: sectionName,
							visibility_ratio: entry.intersectionRatio,
							viewport_position: entry.boundingClientRect.top,
						});
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.5 }
		);

		observer.observe(elementRef.current);
	}

	/**
	 * Get analytics summary for business insights
	 */
	getAnalyticsSummary() {
		return {
			session: {
				session_id: this.sessionId,
				business_id: this.businessId,
				business_name: this.businessName,
				start_time: this.startTime,
				duration: performance.now() - this.startTime,
			},
			performance: this.performanceMetrics,
			interactions: {
				total_interactions: this.interactions.length,
				unique_actions: [...new Set(this.interactions.map((i) => i.event_name))].length,
				conversion_events: this.interactions.filter((i) => i.category === "conversion" || i.priority === "high").length,
			},
			engagement: this.performanceMetrics.engagement || {},
		};
	}

	/**
	 * Send analytics data to backend (implement based on your analytics service)
	 */
	async sendAnalytics() {
		try {
			const analyticsData = this.getAnalyticsSummary();

			// Log locally
			logger.businessMetrics("Business profile analytics summary:", analyticsData);

			// TODO: Send to your analytics service
			// await fetch('/api/analytics/business-profile', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(analyticsData)
			// });
		} catch (error) {
			logger.error("Failed to send analytics:", error);
		}
	}

	/**
	 * Cleanup when component unmounts
	 */
	cleanup() {
		// Send final analytics
		this.sendAnalytics();

		// Clear intervals/observers if any
		logger.performance(`Business profile session ended. Duration: ${performance.now() - this.startTime}ms`);
	}
}

// Create singleton instance
const businessProfileAnalytics = new BusinessProfileAnalytics();

export default businessProfileAnalytics;

// Export utility functions for components
export const trackBusinessAction = (action, details) => {
	businessProfileAnalytics.trackBusinessInteraction(action, details);
};

export const trackSectionView = (sectionName, elementRef) => {
	businessProfileAnalytics.trackSectionView(sectionName, elementRef);
};

export const initializeAnalytics = (businessId, businessName) => {
	businessProfileAnalytics.initialize(businessId, businessName);
};

export const getAnalyticsSummary = () => {
	return businessProfileAnalytics.getAnalyticsSummary();
};
