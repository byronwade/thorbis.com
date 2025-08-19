/**
 * Enterprise User Behavior Tracking System
 * Amazon-style intelligent tracking for homepage personalization
 * Tracks user interactions, search patterns, and behavior analytics
 */

import { supabase } from "@lib/database/supabase/client";
import logger from "./logger.js";

export class UserBehaviorTracker {
	constructor() {
		this.sessionId = this.generateSessionId();
		this.startTime = Date.now();
		this.interactions = [];
		this.searchHistory = [];
		this.pageViews = [];
		this.lastActivity = Date.now();

		// Performance monitoring
		this.performanceMetrics = {
			sessionDuration: 0,
			pageViews: 0,
			searches: 0,
			clicks: 0,
			scrollDepth: 0,
			bounceRate: 0,
		};

		// Initialize tracking
		this.initializeTracking();
	}

	/**
	 * Generate unique session ID for user tracking
	 */
	generateSessionId() {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Initialize comprehensive user behavior tracking
	 */
	initializeTracking() {
		if (typeof window === "undefined") return;

		// Track page visibility changes
		document.addEventListener("visibilitychange", () => {
			this.trackVisibilityChange();
		});

		// Track scroll depth for engagement measurement
		let maxScrollDepth = 0;
		window.addEventListener(
			"scroll",
			this.throttle(() => {
				const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
				if (scrollDepth > maxScrollDepth) {
					maxScrollDepth = scrollDepth;
					this.performanceMetrics.scrollDepth = maxScrollDepth;
					this.trackScrollDepth(scrollDepth);
				}
			}, 500)
		);

		// Track mouse movement patterns for engagement
		let mouseMoveCount = 0;
		window.addEventListener(
			"mousemove",
			this.throttle(() => {
				mouseMoveCount++;
				if (mouseMoveCount % 50 === 0) {
					this.trackEngagement("mouse_activity", { moveCount: mouseMoveCount });
				}
			}, 1000)
		);

		// Track keyboard interactions
		document.addEventListener("keydown", (e) => {
			this.trackInteraction("keyboard", {
				key: e.key,
				target: e.target.tagName,
				timestamp: Date.now(),
			});
		});

		// Track click patterns with detailed context
		document.addEventListener("click", (e) => {
			this.trackClick(e);
		});

		// Track form interactions
		document.addEventListener("input", (e) => {
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
				this.trackFormInteraction(e);
			}
		});

		// Track window focus/blur for attention measurement
		window.addEventListener("focus", () => {
			this.trackAttention("focus");
		});

		window.addEventListener("blur", () => {
			this.trackAttention("blur");
		});

		logger.debug("User behavior tracking initialized", { sessionId: this.sessionId });
	}

	/**
	 * Track user clicks with comprehensive context
	 */
	trackClick(event) {
		const element = event.target;
		const clickData = {
			sessionId: this.sessionId,
			timestamp: Date.now(),
			elementType: element.tagName,
			elementId: element.id || null,
			className: element.className || null,
			text: element.textContent?.substring(0, 100) || null,
			href: element.href || null,
			position: {
				x: event.clientX,
				y: event.clientY,
			},
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			scrollPosition: window.scrollY,
			timeOnPage: Date.now() - this.startTime,
			userAgent: navigator.userAgent,
			url: window.location.href,
			referrer: document.referrer,
		};

		this.interactions.push(clickData);
		this.performanceMetrics.clicks++;
		this.lastActivity = Date.now();

		// Log high-value interactions
		if (this.isHighValueClick(element)) {
			logger.interaction("high_value_click", clickData);
		}

		// Store in database for personalization
		this.storeInteraction("click", clickData);
	}

	/**
	 * Track search queries and patterns
	 */
	trackSearch(query, filters = {}, results = []) {
		const searchData = {
			sessionId: this.sessionId,
			query: query.toLowerCase().trim(),
			filters,
			resultsCount: results.length,
			timestamp: Date.now(),
			url: window.location.href,
			timeOnPage: Date.now() - this.startTime,
			previousSearches: this.searchHistory.slice(-5), // Last 5 searches for pattern analysis
		};

		this.searchHistory.push(searchData);
		this.performanceMetrics.searches++;

		// Analyze search patterns for personalization
		this.analyzeSearchPatterns(searchData);

		// Store for machine learning
		this.storeInteraction("search", searchData);

		logger.businessMetrics("search_performed", searchData);
	}

	/**
	 * Track page views with detailed context
	 */
	trackPageView(pageData = {}) {
		const pageViewData = {
			sessionId: this.sessionId,
			url: window.location.href,
			title: document.title,
			referrer: document.referrer,
			timestamp: Date.now(),
			userAgent: navigator.userAgent,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			connectionType: navigator.connection?.effectiveType || "unknown",
			language: navigator.language,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			...pageData,
		};

		this.pageViews.push(pageViewData);
		this.performanceMetrics.pageViews++;

		// Store page view for analytics
		this.storeInteraction("page_view", pageViewData);

		logger.performance("page_view_tracked", pageViewData);
	}

	/**
	 * Track form interactions for lead intelligence
	 */
	trackFormInteraction(event) {
		const formData = {
			sessionId: this.sessionId,
			formId: event.target.form?.id || null,
			fieldName: event.target.name || null,
			fieldType: event.target.type || null,
			value: event.target.type === "password" ? "[REDACTED]" : event.target.value?.substring(0, 50),
			timestamp: Date.now(),
			timeOnPage: Date.now() - this.startTime,
		};

		this.storeInteraction("form_interaction", formData);
	}

	/**
	 * Track user engagement levels
	 */
	trackEngagement(type, data = {}) {
		const engagementData = {
			sessionId: this.sessionId,
			type,
			timestamp: Date.now(),
			timeOnPage: Date.now() - this.startTime,
			...data,
		};

		this.storeInteraction("engagement", engagementData);
	}

	/**
	 * Track scroll depth for content engagement
	 */
	trackScrollDepth(depth) {
		if (depth > 0 && depth % 25 === 0) {
			// Track at 25%, 50%, 75%, 100%
			this.trackEngagement("scroll_depth", { depth });
		}
	}

	/**
	 * Track attention patterns (focus/blur)
	 */
	trackAttention(type) {
		this.trackEngagement("attention", { type });
	}

	/**
	 * Track page visibility changes
	 */
	trackVisibilityChange() {
		const isVisible = !document.hidden;
		this.trackEngagement("visibility", { isVisible });
	}

	/**
	 * Analyze search patterns for personalization insights
	 */
	analyzeSearchPatterns(searchData) {
		const recentSearches = this.searchHistory.slice(-10);

		// Detect search intent patterns
		const patterns = {
			businessTypes: this.extractBusinessTypes(recentSearches),
			locations: this.extractLocations(recentSearches),
			priceRanges: this.extractPriceRanges(recentSearches),
			features: this.extractFeatures(recentSearches),
		};

		// Store patterns for homepage personalization
		this.storeUserPatterns(patterns);
	}

	/**
	 * Extract business types from search history
	 */
	extractBusinessTypes(searches) {
		const businessTypes = [];
		const businessKeywords = ["restaurant", "cafe", "bar", "hotel", "shop", "store", "salon", "spa", "gym", "fitness", "clinic", "dentist", "lawyer", "mechanic"];

		searches.forEach((search) => {
			businessKeywords.forEach((type) => {
				if (search.query.includes(type)) {
					businessTypes.push(type);
				}
			});
		});

		return [...new Set(businessTypes)];
	}

	/**
	 * Extract location patterns from searches
	 */
	extractLocations(searches) {
		const locations = [];
		searches.forEach((search) => {
			// Extract location patterns (simplified - could use NLP)
			const locationWords = search.query.split(" ").filter((word) => word.length > 3 && /^[A-Z]/.test(word));
			locations.push(...locationWords);
		});
		return [...new Set(locations)];
	}

	/**
	 * Extract price range preferences
	 */
	extractPriceRanges(searches) {
		const priceIndicators = {
			budget: ["cheap", "budget", "affordable", "inexpensive"],
			mid: ["moderate", "mid-range", "reasonable"],
			premium: ["expensive", "luxury", "premium", "high-end", "upscale"],
		};

		const preferences = [];
		searches.forEach((search) => {
			Object.entries(priceIndicators).forEach(([range, keywords]) => {
				if (keywords.some((keyword) => search.query.includes(keyword))) {
					preferences.push(range);
				}
			});
		});

		return [...new Set(preferences)];
	}

	/**
	 * Extract feature preferences
	 */
	extractFeatures(searches) {
		const features = [];
		const featureKeywords = ["delivery", "takeout", "outdoor seating", "parking", "wifi", "pet-friendly", "family-friendly", "reservations", "wheelchair accessible"];

		searches.forEach((search) => {
			featureKeywords.forEach((feature) => {
				if (search.query.includes(feature)) {
					features.push(feature);
				}
			});
		});

		return [...new Set(features)];
	}

	/**
	 * Determine if a click is high-value for business intelligence
	 */
	isHighValueClick(element) {
		const highValueSelectors = ['a[href*="tel:"]', 'a[href*="mailto:"]', "[data-business-id]", ".cta-button", ".book-now", ".contact-button", ".review-button", ".directions-button"];

		return highValueSelectors.some((selector) => element.matches && element.matches(selector));
	}

	/**
	 * Store interaction data in database for analytics
	 */
	async storeInteraction(type, data) {
		try {
			const { error } = await supabase.from("user_interactions").insert({
				session_id: this.sessionId,
				interaction_type: type,
				interaction_data: data,
				created_at: new Date().toISOString(),
			});

			if (error) {
				logger.error("Failed to store user interaction:", error);
			}
		} catch (error) {
			logger.error("Error storing interaction:", error);
		}
	}

	/**
	 * Store user behavior patterns for personalization
	 */
	async storeUserPatterns(patterns) {
		try {
			const { error } = await supabase.from("user_behavior_patterns").upsert({
				session_id: this.sessionId,
				patterns,
				updated_at: new Date().toISOString(),
			});

			if (error) {
				logger.error("Failed to store user patterns:", error);
			}
		} catch (error) {
			logger.error("Error storing patterns:", error);
		}
	}

	/**
	 * Get user behavior summary for personalization
	 */
	getBehaviorSummary() {
		return {
			sessionId: this.sessionId,
			sessionDuration: Date.now() - this.startTime,
			performanceMetrics: this.performanceMetrics,
			recentSearches: this.searchHistory.slice(-5),
			recentInteractions: this.interactions.slice(-10),
			recentPageViews: this.pageViews.slice(-5),
			isEngaged: this.isUserEngaged(),
			preferredBusinessTypes: this.getPreferredBusinessTypes(),
			preferredLocations: this.getPreferredLocations(),
		};
	}

	/**
	 * Determine if user is engaged based on behavior
	 */
	isUserEngaged() {
		const timeSinceLastActivity = Date.now() - this.lastActivity;
		return (
			timeSinceLastActivity < 60000 && // Active within last minute
			this.performanceMetrics.scrollDepth > 25 && // Scrolled past 25%
			this.performanceMetrics.clicks > 0
		); // Has clicked something
	}

	/**
	 * Get preferred business types based on search/click history
	 */
	getPreferredBusinessTypes() {
		const allSearches = this.searchHistory.concat(this.interactions.filter((i) => i.text));
		return this.extractBusinessTypes(allSearches);
	}

	/**
	 * Get preferred locations based on behavior
	 */
	getPreferredLocations() {
		return this.extractLocations(this.searchHistory);
	}

	/**
	 * Throttle function for performance optimization
	 */
	throttle(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	/**
	 * Clean up tracking on page unload
	 */
	cleanup() {
		// Send final analytics before page unload
		const summary = this.getBehaviorSummary();

		// Use sendBeacon for reliable data transmission
		if (navigator.sendBeacon && typeof window !== "undefined") {
			navigator.sendBeacon("/api/analytics/session-end", JSON.stringify(summary));
		}

		logger.performance("User behavior tracking session ended", summary);
	}
}

// Create singleton instance
export const behaviorTracker = new UserBehaviorTracker();

// Initialize cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		behaviorTracker.cleanup();
	});
}
