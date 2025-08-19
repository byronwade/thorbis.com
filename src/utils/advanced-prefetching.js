/**
 * Advanced Prefetching System with Intelligent Prediction
 * Inspired by Google's and Netflix's prefetching algorithms
 * Uses ML-like algorithms to predict user navigation patterns
 */

import logger from "@lib/utils/logger";

// Prediction algorithms configuration
const PREDICTION_CONFIG = {
	// User behavior tracking
	BEHAVIOR_HISTORY_SIZE: 100,
	SESSION_WEIGHT: 0.7,
	HISTORICAL_WEIGHT: 0.3,

	// Prefetch limits
	MAX_CONCURRENT_PREFETCH: 4,
	MAX_MEMORY_USAGE: 25 * 1024 * 1024, // 25MB
	PREFETCH_TIMEOUT: 8000,

	// Prediction thresholds
	MIN_CONFIDENCE_SCORE: 0.3,
	HIGH_CONFIDENCE_SCORE: 0.7,

	// Pattern recognition
	SEQUENCE_LENGTH: 5,
	PATTERN_MIN_OCCURRENCES: 3,
};

class UserBehaviorTracker {
	constructor() {
		this.sessionHistory = [];
		this.patterns = new Map();
		this.userProfile = {
			preferredCategories: new Map(),
			avgSessionDuration: 0,
			searchPatterns: new Map(),
			clickPatterns: new Map(),
			locationPreferences: new Map(),
		};
		this.currentSession = {
			startTime: Date.now(),
			pageViews: [],
			searchQueries: [],
			businessViews: [],
			categories: [],
		};
	}

	/**
	 * Track page navigation
	 */
	trackNavigation(url, metadata = {}) {
		const navigation = {
			url,
			timestamp: Date.now(),
			type: this.getPageType(url),
			metadata,
			sessionId: this.getSessionId(),
		};

		this.sessionHistory.push(navigation);
		this.currentSession.pageViews.push(navigation);

		// Maintain history size
		if (this.sessionHistory.length > PREDICTION_CONFIG.BEHAVIOR_HISTORY_SIZE) {
			this.sessionHistory.shift();
		}

		// Update user profile
		this.updateUserProfile(navigation);

		// Analyze patterns
		this.analyzeNavigationPatterns();

		logger.debug("Navigation tracked:", navigation);
	}

	/**
	 * Track search behavior
	 */
	trackSearch(query, results, filters = {}) {
		const search = {
			query: query.toLowerCase(),
			resultsCount: results.length,
			filters,
			timestamp: Date.now(),
			sessionId: this.getSessionId(),
		};

		this.currentSession.searchQueries.push(search);

		// Update search patterns
		const searchPattern = this.userProfile.searchPatterns.get(search.query) || { count: 0, lastUsed: 0 };
		searchPattern.count++;
		searchPattern.lastUsed = Date.now();
		this.userProfile.searchPatterns.set(search.query, searchPattern);

		logger.debug("Search tracked:", search);
	}

	/**
	 * Track business interaction
	 */
	trackBusinessInteraction(businessId, businessData, interactionType = "view") {
		const interaction = {
			businessId,
			name: businessData.name,
			categories: businessData.categories || [],
			location: businessData.city,
			interactionType,
			timestamp: Date.now(),
			sessionId: this.getSessionId(),
		};

		this.currentSession.businessViews.push(interaction);

		// Update category preferences
		interaction.categories.forEach((category) => {
			const pref = this.userProfile.preferredCategories.get(category) || { count: 0, lastInteraction: 0 };
			pref.count++;
			pref.lastInteraction = Date.now();
			this.userProfile.preferredCategories.set(category, pref);
		});

		// Update location preferences
		if (interaction.location) {
			const locPref = this.userProfile.locationPreferences.get(interaction.location) || { count: 0, lastVisit: 0 };
			locPref.count++;
			locPref.lastVisit = Date.now();
			this.userProfile.locationPreferences.set(interaction.location, locPref);
		}

		logger.debug("Business interaction tracked:", interaction);
	}

	/**
	 * Determine page type from URL
	 */
	getPageType(url) {
		const urlObj = new URL(url, window.location.origin);
		const pathname = urlObj.pathname;

		if (pathname.startsWith("/biz/")) return "business_detail";
		if (pathname.startsWith("/search")) return "search_results";
		if (pathname.startsWith("/categories/")) return "category";
		if (pathname === "/") return "homepage";
		if (pathname.startsWith("/explore-business")) return "explore";

		return "other";
	}

	/**
	 * Get or create session ID
	 */
	getSessionId() {
		if (!this.sessionId) {
			this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		}
		return this.sessionId;
	}

	/**
	 * Update user profile based on navigation
	 */
	updateUserProfile(navigation) {
		// Update click patterns
		if (navigation.type === "business_detail") {
			const pattern = this.userProfile.clickPatterns.get(navigation.type) || { count: 0, avgTimeSpent: 0 };
			pattern.count++;
			this.userProfile.clickPatterns.set(navigation.type, pattern);
		}

		// Calculate session duration
		const sessionDuration = Date.now() - this.currentSession.startTime;
		this.userProfile.avgSessionDuration = (this.userProfile.avgSessionDuration + sessionDuration) / 2;
	}

	/**
	 * Analyze navigation patterns for predictions
	 */
	analyzeNavigationPatterns() {
		if (this.sessionHistory.length < PREDICTION_CONFIG.SEQUENCE_LENGTH) return;

		// Get recent sequence
		const recentSequence = this.sessionHistory.slice(-PREDICTION_CONFIG.SEQUENCE_LENGTH).map((nav) => nav.type);

		const sequenceKey = recentSequence.join(" -> ");

		// Look for next possible navigation
		for (let i = 0; i < this.sessionHistory.length - PREDICTION_CONFIG.SEQUENCE_LENGTH; i++) {
			const historicalSequence = this.sessionHistory.slice(i, i + PREDICTION_CONFIG.SEQUENCE_LENGTH).map((nav) => nav.type);

			if (this.arraysEqual(recentSequence, historicalSequence)) {
				// Found matching pattern, record next navigation
				const nextNav = this.sessionHistory[i + PREDICTION_CONFIG.SEQUENCE_LENGTH];
				if (nextNav) {
					const pattern = this.patterns.get(sequenceKey) || { nextPages: new Map(), count: 0 };
					const nextPageCount = pattern.nextPages.get(nextNav.type) || 0;
					pattern.nextPages.set(nextNav.type, nextPageCount + 1);
					pattern.count++;
					this.patterns.set(sequenceKey, pattern);
				}
			}
		}
	}

	/**
	 * Get navigation predictions
	 */
	getNavigationPredictions() {
		if (this.sessionHistory.length < PREDICTION_CONFIG.SEQUENCE_LENGTH) {
			return this.getDefaultPredictions();
		}

		const recentSequence = this.sessionHistory.slice(-PREDICTION_CONFIG.SEQUENCE_LENGTH).map((nav) => nav.type);

		const sequenceKey = recentSequence.join(" -> ");
		const pattern = this.patterns.get(sequenceKey);

		if (!pattern || pattern.count < PREDICTION_CONFIG.PATTERN_MIN_OCCURRENCES) {
			return this.getDefaultPredictions();
		}

		// Calculate confidence scores
		const predictions = [];
		for (const [pageType, count] of pattern.nextPages) {
			const confidence = count / pattern.count;
			if (confidence >= PREDICTION_CONFIG.MIN_CONFIDENCE_SCORE) {
				predictions.push({
					pageType,
					confidence,
					urls: this.generatePredictedUrls(pageType),
				});
			}
		}

		// Sort by confidence
		return predictions.sort((a, b) => b.confidence - a.confidence);
	}

	/**
	 * Generate default predictions based on user profile
	 */
	getDefaultPredictions() {
		const predictions = [];

		// Popular categories
		const topCategories = Array.from(this.userProfile.preferredCategories.entries())
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 3);

		topCategories.forEach(([category, data]) => {
			predictions.push({
				pageType: "category",
				confidence: Math.min(data.count / 10, 0.8),
				urls: [`/categories/${category}`],
			});
		});

		// Popular search queries
		const topSearches = Array.from(this.userProfile.searchPatterns.entries())
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 2);

		topSearches.forEach(([query, data]) => {
			predictions.push({
				pageType: "search_results",
				confidence: Math.min(data.count / 5, 0.6),
				urls: [`/search?q=${encodeURIComponent(query)}`],
			});
		});

		return predictions.sort((a, b) => b.confidence - a.confidence);
	}

	/**
	 * Generate predicted URLs for page type
	 */
	generatePredictedUrls(pageType) {
		switch (pageType) {
			case "search_results":
				// Return popular search URLs
				const topSearches = Array.from(this.userProfile.searchPatterns.entries())
					.sort((a, b) => b[1].count - a[1].count)
					.slice(0, 3);
				return topSearches.map(([query]) => `/search?q=${encodeURIComponent(query)}`);

			case "category":
				// Return preferred category URLs
				const topCategories = Array.from(this.userProfile.preferredCategories.entries())
					.sort((a, b) => b[1].count - a[1].count)
					.slice(0, 3);
				return topCategories.map(([category]) => `/categories/${category}`);

			case "explore":
				return ["/explore-business"];

			case "homepage":
				return ["/"];

			default:
				return [];
		}
	}

	/**
	 * Array comparison utility
	 */
	arraysEqual(a, b) {
		return a.length === b.length && a.every((val, i) => val === b[i]);
	}

	/**
	 * Get user profile summary
	 */
	getProfile() {
		return {
			...this.userProfile,
			sessionHistory: this.sessionHistory.length,
			currentSession: this.currentSession,
			patterns: this.patterns.size,
		};
	}
}

class AdvancedPrefetcher {
	constructor() {
		this.behaviorTracker = new UserBehaviorTracker();
		this.activePrefetches = new Set();
		this.prefetchCache = new Map();
		this.resourceUsage = 0;
		this.isInitialized = false;
		this.prefetchMetrics = {
			totalPrefetches: 0,
			successfulPrefetches: 0,
			cacheHits: 0,
			averagePrefetchTime: 0,
		};
	}

	/**
	 * Initialize the advanced prefetcher
	 */
	init() {
		if (this.isInitialized || typeof window === "undefined") return;

		this.isInitialized = true;
		this.setupIntelligentPrefetching();
		this.setupMemoryManagement();
		this.setupPerformanceMonitoring();

		logger.debug("Advanced prefetcher initialized");
	}

	/**
	 * Setup intelligent prefetching based on user behavior
	 */
	setupIntelligentPrefetching() {
		// Prefetch on page load after initial content
		window.addEventListener("load", () => {
			setTimeout(() => {
				this.executePredictivePrefetch();
			}, 2000); // Wait 2s for initial page to settle
		});

		// Prefetch on user idle
		let idleTimer;
		const resetIdleTimer = () => {
			clearTimeout(idleTimer);
			idleTimer = setTimeout(() => {
				this.executePredictivePrefetch();
			}, 3000);
		};

		const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
		events.forEach((event) => {
			document.addEventListener(event, resetIdleTimer, { passive: true });
		});

		resetIdleTimer();

		// Prefetch based on scroll position (near end of page)
		let ticking = false;
		window.addEventListener(
			"scroll",
			() => {
				if (!ticking) {
					requestAnimationFrame(() => {
						const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
						if (scrollPercent > 0.8) {
							this.executePredictivePrefetch();
						}
						ticking = false;
					});
					ticking = true;
				}
			},
			{ passive: true }
		);
	}

	/**
	 * Execute predictive prefetching
	 */
	async executePredictivePrefetch() {
		if (this.activePrefetches.size >= PREDICTION_CONFIG.MAX_CONCURRENT_PREFETCH) {
			return;
		}

		// Get predictions
		const predictions = this.behaviorTracker.getNavigationPredictions();

		logger.debug("Executing predictive prefetch with predictions:", predictions);

		// Prefetch high-confidence predictions
		for (const prediction of predictions) {
			if (prediction.confidence >= PREDICTION_CONFIG.MIN_CONFIDENCE_SCORE) {
				for (const url of prediction.urls) {
					if (this.shouldPrefetch(url)) {
						await this.prefetchResource(url, prediction.confidence);
					}

					// Respect concurrency limits
					if (this.activePrefetches.size >= PREDICTION_CONFIG.MAX_CONCURRENT_PREFETCH) {
						break;
					}
				}
			}
		}

		// Context-aware prefetching
		await this.executeContextualPrefetch();
	}

	/**
	 * Execute contextual prefetching based on current page
	 */
	async executeContextualPrefetch() {
		const currentUrl = window.location.pathname;
		const pageType = this.behaviorTracker.getPageType(currentUrl);

		switch (pageType) {
			case "search_results":
				await this.prefetchSearchRelated();
				break;
			case "business_detail":
				await this.prefetchBusinessRelated();
				break;
			case "category":
				await this.prefetchCategoryRelated();
				break;
			case "homepage":
				await this.prefetchHomepageRelated();
				break;
		}
	}

	/**
	 * Prefetch search-related content
	 */
	async prefetchSearchRelated() {
		// Prefetch popular searches
		const topSearches = Array.from(this.behaviorTracker.userProfile.searchPatterns.entries())
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 2);

		for (const [query] of topSearches) {
			const url = `/search?q=${encodeURIComponent(query)}`;
			if (this.shouldPrefetch(url)) {
				await this.prefetchResource(url, 0.5);
			}
		}

		// Prefetch category pages for current search
		const urlParams = new URLSearchParams(window.location.search);
		const category = urlParams.get("category");
		if (category) {
			const categoryUrl = `/categories/${category}`;
			if (this.shouldPrefetch(categoryUrl)) {
				await this.prefetchResource(categoryUrl, 0.6);
			}
		}
	}

	/**
	 * Prefetch business-related content
	 */
	async prefetchBusinessRelated() {
		// Prefetch similar businesses in same category
		// This would typically come from a "related businesses" API
		const relatedUrl = `${window.location.pathname}/related`;
		if (this.shouldPrefetch(relatedUrl)) {
			await this.prefetchResource(relatedUrl, 0.4);
		}

		// Prefetch map view
		const mapUrl = `${window.location.pathname}?view=map`;
		if (this.shouldPrefetch(mapUrl)) {
			await this.prefetchResource(mapUrl, 0.3);
		}
	}

	/**
	 * Prefetch category-related content
	 */
	async prefetchCategoryRelated() {
		// Prefetch subcategories or related categories
		const currentCategory = window.location.pathname.split("/")[2];

		// Prefetch search for this category
		const searchUrl = `/search?category=${currentCategory}`;
		if (this.shouldPrefetch(searchUrl)) {
			await this.prefetchResource(searchUrl, 0.7);
		}
	}

	/**
	 * Prefetch homepage-related content
	 */
	async prefetchHomepageRelated() {
		// Prefetch user's favorite categories
		const topCategories = Array.from(this.behaviorTracker.userProfile.preferredCategories.entries())
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 3);

		for (const [category] of topCategories) {
			const url = `/categories/${category}`;
			if (this.shouldPrefetch(url)) {
				await this.prefetchResource(url, 0.6);
			}
		}

		// Prefetch popular searches
		const searchUrl = "/search";
		if (this.shouldPrefetch(searchUrl)) {
			await this.prefetchResource(searchUrl, 0.4);
		}
	}

	/**
	 * Check if resource should be prefetched
	 */
	shouldPrefetch(url) {
		// Don't prefetch if already cached
		if (this.prefetchCache.has(url)) return false;

		// Don't prefetch if currently active
		if (this.activePrefetches.has(url)) return false;

		// Don't prefetch if memory usage too high
		if (this.resourceUsage > PREDICTION_CONFIG.MAX_MEMORY_USAGE) return false;

		// Don't prefetch if on current page
		if (url === window.location.pathname + window.location.search) return false;

		return true;
	}

	/**
	 * Prefetch a specific resource
	 */
	async prefetchResource(url, confidence) {
		if (!this.shouldPrefetch(url)) return;

		this.activePrefetches.add(url);
		this.prefetchMetrics.totalPrefetches++;

		const startTime = performance.now();

		try {
			logger.debug(`Prefetching (confidence: ${confidence.toFixed(2)}): ${url}`);

			const response = await fetch(url, {
				method: "GET",
				credentials: "same-origin",
				cache: "default",
				signal: AbortSignal.timeout(PREDICTION_CONFIG.PREFETCH_TIMEOUT),
			});

			if (response.ok) {
				const content = await response.text();
				const loadTime = performance.now() - startTime;
				const size = new Blob([content]).size;

				// Cache the response
				this.prefetchCache.set(url, {
					content,
					timestamp: Date.now(),
					loadTime,
					confidence,
					size,
				});

				this.resourceUsage += size;
				this.prefetchMetrics.successfulPrefetches++;

				// Update average prefetch time
				this.updateAveragePrefetchTime(loadTime);

				logger.debug(`Prefetched successfully: ${url} in ${loadTime.toFixed(2)}ms (${(size / 1024).toFixed(1)}KB)`);
			}
		} catch (error) {
			logger.warn(`Prefetch failed: ${url}`, error);
		} finally {
			this.activePrefetches.delete(url);
		}
	}

	/**
	 * Setup memory management
	 */
	setupMemoryManagement() {
		// Clean cache periodically
		setInterval(() => {
			this.cleanCache();
		}, 30000); // Every 30 seconds

		// Monitor memory usage
		if ("memory" in performance) {
			setInterval(() => {
				const memInfo = performance.memory;
				if (memInfo.usedJSHeapSize > 100 * 1024 * 1024) {
					// 100MB
					this.aggressiveCleanCache();
				}
			}, 10000); // Every 10 seconds
		}
	}

	/**
	 * Clean prefetch cache
	 */
	cleanCache() {
		const now = Date.now();
		const maxAge = 10 * 60 * 1000; // 10 minutes
		let cleanedSize = 0;

		for (const [url, data] of this.prefetchCache) {
			if (now - data.timestamp > maxAge) {
				cleanedSize += data.size;
				this.prefetchCache.delete(url);
			}
		}

		this.resourceUsage -= cleanedSize;

		if (cleanedSize > 0) {
			logger.debug(`Cleaned ${(cleanedSize / 1024).toFixed(1)}KB from prefetch cache`);
		}
	}

	/**
	 * Aggressive cache cleaning when memory is high
	 */
	aggressiveCleanCache() {
		// Remove lower confidence prefetches first
		const entries = Array.from(this.prefetchCache.entries()).sort((a, b) => a[1].confidence - b[1].confidence);

		let cleaned = 0;
		const targetClean = this.resourceUsage * 0.5; // Clean 50%

		for (const [url, data] of entries) {
			if (cleaned >= targetClean) break;

			cleaned += data.size;
			this.prefetchCache.delete(url);
		}

		this.resourceUsage -= cleaned;
		logger.debug(`Aggressively cleaned ${(cleaned / 1024).toFixed(1)}KB from prefetch cache`);
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Track cache hits
		const originalFetch = window.fetch;
		window.fetch = async (...args) => {
			const url = args[0];
			if (typeof url === "string" && this.prefetchCache.has(url)) {
				this.prefetchMetrics.cacheHits++;
				logger.debug(`Prefetch cache hit: ${url}`);
			}
			return originalFetch.apply(window, args);
		};

		// Periodic reporting
		setInterval(() => {
			if (this.prefetchMetrics.totalPrefetches > 0) {
				logger.info("Prefetch Performance:", this.getMetrics());
			}
		}, 60000); // Every minute
	}

	/**
	 * Update average prefetch time
	 */
	updateAveragePrefetchTime(loadTime) {
		const { averagePrefetchTime, successfulPrefetches } = this.prefetchMetrics;
		this.prefetchMetrics.averagePrefetchTime = (averagePrefetchTime * (successfulPrefetches - 1) + loadTime) / successfulPrefetches;
	}

	/**
	 * Track user navigation for behavior analysis
	 */
	trackNavigation(url, metadata) {
		this.behaviorTracker.trackNavigation(url, metadata);
	}

	/**
	 * Track search for behavior analysis
	 */
	trackSearch(query, results, filters) {
		this.behaviorTracker.trackSearch(query, results, filters);
	}

	/**
	 * Track business interaction for behavior analysis
	 */
	trackBusinessInteraction(businessId, businessData, interactionType) {
		this.behaviorTracker.trackBusinessInteraction(businessId, businessData, interactionType);
	}

	/**
	 * Get prefetching metrics
	 */
	getMetrics() {
		return {
			...this.prefetchMetrics,
			hitRate: this.prefetchMetrics.totalPrefetches > 0 ? ((this.prefetchMetrics.cacheHits / this.prefetchMetrics.totalPrefetches) * 100).toFixed(2) + "%" : "0%",
			successRate: this.prefetchMetrics.totalPrefetches > 0 ? ((this.prefetchMetrics.successfulPrefetches / this.prefetchMetrics.totalPrefetches) * 100).toFixed(2) + "%" : "0%",
			cacheSize: this.prefetchCache.size,
			resourceUsage: `${(this.resourceUsage / 1024 / 1024).toFixed(2)}MB`,
			activePrefetches: this.activePrefetches.size,
			userProfile: this.behaviorTracker.getProfile(),
		};
	}

	/**
	 * Force prefetch specific URLs
	 */
	async forcePrefetch(urls, confidence = 0.8) {
		for (const url of urls) {
			if (this.shouldPrefetch(url)) {
				await this.prefetchResource(url, confidence);
			}
		}
	}

	/**
	 * Get prefetched content
	 */
	getPrefetchedContent(url) {
		return this.prefetchCache.get(url);
	}

	/**
	 * Clear all prefetch data
	 */
	clear() {
		this.prefetchCache.clear();
		this.activePrefetches.clear();
		this.resourceUsage = 0;
		this.prefetchMetrics = {
			totalPrefetches: 0,
			successfulPrefetches: 0,
			cacheHits: 0,
			averagePrefetchTime: 0,
		};
		logger.debug("Advanced prefetcher cleared");
	}
}

// Create singleton instance
const advancedPrefetcher = new AdvancedPrefetcher();

// Export utilities
export const initAdvancedPrefetching = () => {
	advancedPrefetcher.init();
	return advancedPrefetcher;
};

export const trackNavigation = (url, metadata) => {
	advancedPrefetcher.trackNavigation(url, metadata);
};

export const trackSearch = (query, results, filters) => {
	advancedPrefetcher.trackSearch(query, results, filters);
};

export const trackBusinessInteraction = (businessId, businessData, interactionType) => {
	advancedPrefetcher.trackBusinessInteraction(businessId, businessData, interactionType);
};

export const forcePrefetch = (urls, confidence) => {
	return advancedPrefetcher.forcePrefetch(urls, confidence);
};

export const getPrefetchMetrics = () => {
	return advancedPrefetcher.getMetrics();
};

export const clearPrefetchCache = () => {
	advancedPrefetcher.clear();
};

export default advancedPrefetcher;
