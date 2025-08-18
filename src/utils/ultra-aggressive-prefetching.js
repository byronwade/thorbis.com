// lib/utils/ultraAggressivePrefetching.js - Maximum Prefetching for Zero Loading
import { logger } from "./logger";
import cacheManager from "./cache-manager";

/**
 * Ultra-Aggressive Prefetching System
 * Predicts and preloads EVERYTHING a user might need
 * Based on Google's aggressive prefetching and Netflix's content prediction
 */
class UltraAggressivePrefetcher {
	constructor() {
		this.isInitialized = false;
		this.userBehaviorProfile = this.loadUserProfile();
		this.prefetchQueue = new Map(); // URL -> priority
		this.activePrefetches = new Set();
		this.maxConcurrentPrefetches = 8; // Aggressive concurrent loading
		this.maxCacheSize = 100 * 1024 * 1024; // 100MB cache limit
		this.currentCacheSize = 0;

		// Prefetching strategies with priorities (1 = highest, 5 = lowest)
		this.strategies = {
			IMMEDIATE: 1, // Critical resources - load immediately
			HOVER_FAST: 2, // Fast hover (25ms delay)
			SCROLL_PREDICTION: 2, // Predict scroll destination
			SEARCH_AUTOCOMPLETE: 2, // Search suggestions
			BEHAVIORAL_PREDICTION: 3, // AI-like behavior prediction
			NEARBY_CONTENT: 3, // Related/nearby content
			POPULAR_CONTENT: 4, // Popular/trending content
			IDLE_PRELOAD: 5, // Background idle preloading
		};

		// Content type priorities
		this.contentPriorities = {
			BUSINESS_PAGES: 1, // /biz/* pages
			SEARCH_RESULTS: 2, // Search APIs
			CATEGORY_PAGES: 2, // Category listings
			IMAGES: 3, // Business photos
			MENU_DATA: 3, // Business menus
			REVIEWS: 4, // Review data
			STATIC_ASSETS: 5, // CSS/JS chunks
		};

		this.sessionData = {
			startTime: Date.now(),
			pageViews: [],
			searchQueries: [],
			businessViews: [],
			scrollPatterns: [],
			hoverPatterns: [],
		};

		logger.info("🚀 Ultra-Aggressive Prefetcher created");
	}

	/**
	 * Initialize ultra-aggressive prefetching
	 */
	async init() {
		if (this.isInitialized) return;

		try {
			logger.info("⚡ Initializing ultra-aggressive prefetching...");

			// Setup all prefetching strategies
			await this.setupImmediatePrefetching();
			await this.setupHoverPrefetching();
			await this.setupScrollPrediction();
			await this.setupSearchPrediction();
			await this.setupBehavioralPrediction();
			await this.setupPopularContentPrefetching();
			await this.setupIdlePrefetching();
			await this.setupNavigationPrediction();

			// Start prefetch queue processor
			this.startPrefetchProcessor();

			// Setup cleanup and monitoring
			this.setupCacheManagement();
			this.setupPerformanceMonitoring();

			this.isInitialized = true;
			logger.info("✅ Ultra-aggressive prefetching initialized");
		} catch (error) {
			logger.error("❌ Ultra-aggressive prefetching failed:", error);
		}
	}

	/**
	 * Setup immediate prefetching for critical resources
	 */
	async setupImmediatePrefetching() {
		// Prefetch critical business data based on current page
		const currentPath = window.location.pathname;

		if (currentPath === "/" || currentPath === "/search") {
			// Homepage/Search - prefetch popular businesses
			this.queuePrefetch("/api/business/featured", this.strategies.IMMEDIATE, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch("/api/business/popular", this.strategies.IMMEDIATE, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch("/api/categories/popular", this.strategies.IMMEDIATE, this.contentPriorities.CATEGORY_PAGES);
		}

		if (currentPath.startsWith("/biz/")) {
			// Business page - prefetch related data
			const businessId = currentPath.split("/biz/")[1];
			this.queuePrefetch(`/api/business/${businessId}/related`, this.strategies.IMMEDIATE, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch(`/api/business/${businessId}/photos`, this.strategies.IMMEDIATE, this.contentPriorities.IMAGES);
			this.queuePrefetch(`/api/business/${businessId}/menu`, this.strategies.IMMEDIATE, this.contentPriorities.MENU_DATA);
		}

		if (currentPath.startsWith("/categories/")) {
			// Category page - prefetch subcategories and popular businesses
			const category = currentPath.split("/categories/")[1];
			this.queuePrefetch(`/api/categories/${category}/businesses`, this.strategies.IMMEDIATE, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch(`/api/categories/${category}/subcategories`, this.strategies.IMMEDIATE, this.contentPriorities.CATEGORY_PAGES);
		}

		logger.debug("🎯 Immediate prefetching setup complete");
	}

	/**
	 * Setup ultra-fast hover prefetching (25ms delay)
	 */
	async setupHoverPrefetching() {
		let hoverTimeout;
		const ULTRA_FAST_HOVER_DELAY = 25; // 25ms for ultra-fast prefetching

		const handleMouseEnter = (event) => {
			const target = event.target.closest("[data-prefetch], a[href], [data-business-id]");
			if (!target) return;

			clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => {
				this.handleHoverPrefetch(target);
			}, ULTRA_FAST_HOVER_DELAY);
		};

		const handleMouseLeave = () => {
			clearTimeout(hoverTimeout);
		};

		// Setup global hover listeners
		document.addEventListener("mouseenter", handleMouseEnter, { passive: true, capture: true });
		document.addEventListener("mouseleave", handleMouseLeave, { passive: true, capture: true });

		// Track hover patterns for learning
		document.addEventListener(
			"mouseover",
			(event) => {
				const target = event.target.closest("[data-business-id], a[href]");
				if (target) {
					this.recordHoverPattern(target);
				}
			},
			{ passive: true }
		);

		logger.debug("⚡ Ultra-fast hover prefetching setup (25ms delay)");
	}

	/**
	 * Handle hover prefetch for different element types
	 */
	handleHoverPrefetch(element) {
		// Business cards
		const businessId = element.getAttribute("data-business-id");
		if (businessId) {
			this.queuePrefetch(`/biz/${businessId}`, this.strategies.HOVER_FAST, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch(`/api/business/${businessId}`, this.strategies.HOVER_FAST, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch(`/api/business/${businessId}/photos`, this.strategies.NEARBY_CONTENT, this.contentPriorities.IMAGES);
			return;
		}

		// Links
		if (element.tagName === "A" && element.href) {
			const url = new URL(element.href, window.location.origin);
			if (url.origin === window.location.origin) {
				this.queuePrefetch(url.pathname, this.strategies.HOVER_FAST, this.getPriorityForPath(url.pathname));

				// Prefetch related content based on link type
				if (url.pathname.startsWith("/search")) {
					this.prefetchSearchRelated(url);
				} else if (url.pathname.startsWith("/categories/")) {
					this.prefetchCategoryRelated(url);
				}
			}
			return;
		}

		// Custom prefetch targets
		const prefetchUrl = element.getAttribute("data-prefetch");
		if (prefetchUrl) {
			this.queuePrefetch(prefetchUrl, this.strategies.HOVER_FAST, this.contentPriorities.BUSINESS_PAGES);
		}
	}

	/**
	 * Setup scroll-based prediction prefetching
	 */
	async setupScrollPrediction() {
		let scrollTimeout;
		let lastScrollY = window.scrollY;
		let scrollDirection = "down";
		let scrollVelocity = 0;

		const handleScroll = () => {
			clearTimeout(scrollTimeout);

			const currentScrollY = window.scrollY;
			const scrollDelta = currentScrollY - lastScrollY;
			scrollDirection = scrollDelta > 0 ? "down" : "up";
			scrollVelocity = Math.abs(scrollDelta);

			// Record scroll pattern
			this.recordScrollPattern({
				y: currentScrollY,
				direction: scrollDirection,
				velocity: scrollVelocity,
				timestamp: Date.now(),
			});

			// Predict next content based on scroll
			scrollTimeout = setTimeout(() => {
				this.predictScrollDestination(currentScrollY, scrollDirection, scrollVelocity);
			}, 100);

			lastScrollY = currentScrollY;
		};

		// Setup intersection observers for viewport-based prefetching
		this.setupViewportPrefetching();

		window.addEventListener("scroll", handleScroll, { passive: true });
		logger.debug("📜 Scroll prediction prefetching setup");
	}

	/**
	 * Setup viewport-based prefetching with intersection observers
	 */
	setupViewportPrefetching() {
		// Aggressive viewport prefetching - large root margin
		const aggressiveObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.handleViewportPrefetch(entry.target);
					}
				});
			},
			{
				rootMargin: "500px", // Prefetch 500px before entering viewport
				threshold: 0,
			}
		);

		// Observe all potential prefetch targets
		const observeElements = () => {
			document.querySelectorAll("[data-business-id], [data-prefetch], a[href^='/biz/'], a[href^='/categories/']").forEach((element) => {
				aggressiveObserver.observe(element);
			});
		};

		// Initial observation
		observeElements();

		// Re-observe when new content is added
		const mutationObserver = new MutationObserver(() => {
			observeElements();
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	/**
	 * Handle viewport-based prefetching
	 */
	handleViewportPrefetch(element) {
		const businessId = element.getAttribute("data-business-id");
		if (businessId) {
			this.queuePrefetch(`/biz/${businessId}`, this.strategies.NEARBY_CONTENT, this.contentPriorities.BUSINESS_PAGES);
			this.queuePrefetch(`/api/business/${businessId}`, this.strategies.NEARBY_CONTENT, this.contentPriorities.BUSINESS_PAGES);
		}

		if (element.tagName === "A" && element.href) {
			const url = new URL(element.href, window.location.origin);
			if (url.origin === window.location.origin) {
				this.queuePrefetch(url.pathname, this.strategies.NEARBY_CONTENT, this.getPriorityForPath(url.pathname));
			}
		}
	}

	/**
	 * Setup search prediction and autocomplete prefetching
	 */
	async setupSearchPrediction() {
		// Monitor search inputs
		const handleSearchInput = (event) => {
			const input = event.target;
			const query = input.value.trim();

			if (query.length >= 2) {
				// Prefetch search suggestions
				this.queuePrefetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, this.strategies.SEARCH_AUTOCOMPLETE, this.contentPriorities.SEARCH_RESULTS);

				// Prefetch likely search results
				this.queuePrefetch(`/api/business/search?q=${encodeURIComponent(query)}&limit=5`, this.strategies.SEARCH_AUTOCOMPLETE, this.contentPriorities.SEARCH_RESULTS);

				// Prefetch popular businesses for this query
				this.prefetchPopularForQuery(query);
			}
		};

		// Setup listeners for all search inputs
		document.addEventListener("input", (event) => {
			const input = event.target;
			if (input.type === "search" || input.name?.includes("search") || input.placeholder?.toLowerCase().includes("search")) {
				handleSearchInput(event);
			}
		});

		logger.debug("🔍 Search prediction prefetching setup");
	}

	/**
	 * Setup behavioral prediction based on user patterns
	 */
	async setupBehavioralPrediction() {
		// Analyze user behavior and predict next actions
		this.startBehaviorAnalysis();

		// Predict based on time of day, day of week, etc.
		this.setupTemporalPrediction();

		// Predict based on location (if available)
		this.setupLocationBasedPrediction();

		logger.debug("🧠 Behavioral prediction setup");
	}

	/**
	 * Start behavior analysis for prediction
	 */
	startBehaviorAnalysis() {
		// Analyze session patterns every 10 seconds
		setInterval(() => {
			this.analyzeBehaviorPatterns();
		}, 10000);
	}

	/**
	 * Analyze current behavior patterns and make predictions
	 */
	analyzeBehaviorPatterns() {
		const recentPageViews = this.sessionData.pageViews.slice(-5);
		const recentSearches = this.sessionData.searchQueries.slice(-3);

		// Pattern: Business browsing -> likely to view similar businesses
		if (recentPageViews.some((page) => page.startsWith("/biz/"))) {
			this.predictSimilarBusinesses(recentPageViews);
		}

		// Pattern: Category browsing -> likely to browse subcategories
		if (recentPageViews.some((page) => page.startsWith("/categories/"))) {
			this.predictCategoryNavigation(recentPageViews);
		}

		// Pattern: Search activity -> likely to refine search
		if (recentSearches.length > 0) {
			this.predictSearchRefinement(recentSearches);
		}

		// Pattern: Time-based predictions
		this.predictTemporalBehavior();
	}

	/**
	 * Setup popular content prefetching
	 */
	async setupPopularContentPrefetching() {
		// Prefetch trending/popular content during idle time
		const prefetchPopular = async () => {
			try {
				// Popular businesses
				this.queuePrefetch("/api/business/trending", this.strategies.POPULAR_CONTENT, this.contentPriorities.BUSINESS_PAGES);

				// Popular categories
				this.queuePrefetch("/api/categories/trending", this.strategies.POPULAR_CONTENT, this.contentPriorities.CATEGORY_PAGES);

				// Popular search queries
				this.queuePrefetch("/api/search/popular", this.strategies.POPULAR_CONTENT, this.contentPriorities.SEARCH_RESULTS);
			} catch (error) {
				logger.warn("Popular content prefetch failed:", error);
			}
		};

		// Initial prefetch
		setTimeout(prefetchPopular, 5000);

		// Periodic prefetch
		setInterval(prefetchPopular, 60000); // Every minute

		logger.debug("🔥 Popular content prefetching setup");
	}

	/**
	 * Setup idle prefetching for background content loading
	 */
	async setupIdlePrefetching() {
		let idleTimer;
		const IDLE_DELAY = 2000; // 2 seconds of inactivity

		const resetIdleTimer = () => {
			clearTimeout(idleTimer);
			idleTimer = setTimeout(() => {
				this.performIdlePrefetching();
			}, IDLE_DELAY);
		};

		const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
		events.forEach((event) => {
			document.addEventListener(event, resetIdleTimer, { passive: true });
		});

		resetIdleTimer(); // Start timer
		logger.debug("😴 Idle prefetching setup");
	}

	/**
	 * Perform idle prefetching of background content
	 */
	async performIdlePrefetching() {
		if (this.activePrefetches.size >= this.maxConcurrentPrefetches) return;

		// Prefetch next logical pages based on user profile
		const predictions = this.generateIdlePredictions();

		for (const prediction of predictions) {
			if (this.activePrefetches.size >= this.maxConcurrentPrefetches) break;
			this.queuePrefetch(prediction.url, this.strategies.IDLE_PRELOAD, prediction.priority);
		}
	}

	/**
	 * Generate idle predictions based on user behavior
	 */
	generateIdlePredictions() {
		const predictions = [];
		const currentPath = window.location.pathname;

		// Homepage predictions
		if (currentPath === "/") {
			predictions.push({ url: "/search", priority: this.contentPriorities.SEARCH_RESULTS }, { url: "/categories", priority: this.contentPriorities.CATEGORY_PAGES }, { url: "/explore-business", priority: this.contentPriorities.BUSINESS_PAGES });
		}

		// Business page predictions
		if (currentPath.startsWith("/biz/")) {
			const businessId = currentPath.split("/biz/")[1];
			predictions.push({ url: `/api/business/${businessId}/similar`, priority: this.contentPriorities.BUSINESS_PAGES }, { url: `/api/business/${businessId}/reviews`, priority: this.contentPriorities.REVIEWS }, { url: "/search", priority: this.contentPriorities.SEARCH_RESULTS });
		}

		// User behavior-based predictions
		const frequentPaths = this.userBehaviorProfile.frequentPaths || [];
		frequentPaths.slice(0, 3).forEach((path) => {
			predictions.push({ url: path, priority: this.contentPriorities.BUSINESS_PAGES });
		});

		return predictions;
	}

	/**
	 * Queue a URL for prefetching with priority
	 */
	queuePrefetch(url, strategy, contentPriority) {
		if (!url || this.prefetchQueue.has(url)) return;

		const priority = strategy + contentPriority;
		this.prefetchQueue.set(url, {
			priority,
			strategy,
			contentPriority,
			queuedAt: Date.now(),
		});

		logger.debug(`📋 Queued prefetch: ${url} (priority: ${priority})`);
	}

	/**
	 * Start prefetch queue processor
	 */
	startPrefetchProcessor() {
		setInterval(() => {
			this.processPrefetchQueue();
		}, 100); // Process every 100ms for responsiveness
	}

	/**
	 * Process prefetch queue in priority order
	 */
	async processPrefetchQueue() {
		if (this.activePrefetches.size >= this.maxConcurrentPrefetches) return;
		if (this.prefetchQueue.size === 0) return;

		// Sort by priority (lower number = higher priority)
		const sortedEntries = Array.from(this.prefetchQueue.entries()).sort((a, b) => a[1].priority - b[1].priority);

		const slotsAvailable = this.maxConcurrentPrefetches - this.activePrefetches.size;
		const itemsToProcess = sortedEntries.slice(0, slotsAvailable);

		for (const [url, metadata] of itemsToProcess) {
			this.prefetchQueue.delete(url);
			this.executePrefetch(url, metadata);
		}
	}

	/**
	 * Execute prefetch for a URL
	 */
	async executePrefetch(url, metadata) {
		if (this.activePrefetches.has(url)) return;

		this.activePrefetches.add(url);
		const startTime = performance.now();

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"X-Prefetch": "true",
					"X-Priority": metadata.strategy.toString(),
					"Cache-Control": "max-age=300",
				},
				priority: "low", // Don't block critical requests
			});

			if (response.ok) {
				const contentLength = response.headers.get("content-length");
				const size = contentLength ? parseInt(contentLength, 10) : 0;

				// Cache the response
				this.cacheResponse(url, response, size);

				const loadTime = performance.now() - startTime;
				logger.debug(`✅ Prefetched: ${url} in ${loadTime.toFixed(2)}ms (${(size / 1024).toFixed(1)}KB)`);
			}
		} catch (error) {
			logger.warn(`❌ Prefetch failed: ${url}`, error);
		} finally {
			this.activePrefetches.delete(url);
		}
	}

	/**
	 * Cache prefetched response
	 */
	cacheResponse(url, response, size) {
		// Use our existing cache manager
		try {
			cacheManager.memory?.set?.(`prefetch:${url}`, response.clone(), 300000); // 5 min TTL
		} catch (error) {
			console.warn('Cache manager not available, skipping cache set:', error.message);
		}

		// Track cache size
		this.currentCacheSize += size;

		// Cleanup if cache is too large
		if (this.currentCacheSize > this.maxCacheSize) {
			this.cleanupCache();
		}
	}

	/**
	 * Get priority for a path
	 */
	getPriorityForPath(path) {
		if (path.startsWith("/biz/")) return this.contentPriorities.BUSINESS_PAGES;
		if (path.startsWith("/search")) return this.contentPriorities.SEARCH_RESULTS;
		if (path.startsWith("/categories/")) return this.contentPriorities.CATEGORY_PAGES;
		return this.contentPriorities.STATIC_ASSETS;
	}

	/**
	 * Record user behavior patterns
	 */
	recordPageView(path) {
		this.sessionData.pageViews.push(path);
		this.updateUserProfile("pageViews", path);
	}

	recordSearchQuery(query) {
		this.sessionData.searchQueries.push(query);
		this.updateUserProfile("searchQueries", query);
	}

	recordHoverPattern(element) {
		const pattern = {
			type: element.tagName,
			href: element.href,
			businessId: element.getAttribute("data-business-id"),
			timestamp: Date.now(),
		};
		this.sessionData.hoverPatterns.push(pattern);
	}

	recordScrollPattern(pattern) {
		this.sessionData.scrollPatterns.push(pattern);
	}

	/**
	 * Load user behavior profile from storage
	 */
	loadUserProfile() {
		try {
			const stored = localStorage.getItem("userBehaviorProfile");
			return stored ? JSON.parse(stored) : this.getDefaultProfile();
		} catch (error) {
			return this.getDefaultProfile();
		}
	}

	/**
	 * Get default user profile
	 */
	getDefaultProfile() {
		return {
			frequentPaths: [],
			preferredCategories: [],
			searchPatterns: [],
			sessionCount: 0,
			lastVisit: Date.now(),
		};
	}

	/**
	 * Update user profile with new data
	 */
	updateUserProfile(key, value) {
		if (!this.userBehaviorProfile[key]) {
			this.userBehaviorProfile[key] = [];
		}

		this.userBehaviorProfile[key].push(value);

		// Keep only recent data
		if (this.userBehaviorProfile[key].length > 50) {
			this.userBehaviorProfile[key] = this.userBehaviorProfile[key].slice(-25);
		}

		// Save periodically
		this.saveUserProfile();
	}

	/**
	 * Save user profile to storage
	 */
	saveUserProfile() {
		try {
			localStorage.setItem("userBehaviorProfile", JSON.stringify(this.userBehaviorProfile));
		} catch (error) {
			logger.warn("Failed to save user profile:", error);
		}
	}

	/**
	 * Setup cache management and cleanup
	 */
	setupCacheManagement() {
		// Cleanup cache periodically
		setInterval(() => {
			this.cleanupCache();
		}, 30000); // Every 30 seconds
	}

	/**
	 * Cleanup cache to stay within limits
	 */
	cleanupCache() {
		// This would integrate with our existing cache manager
		// For now, just reset the size counter
		this.currentCacheSize = 0;
		logger.debug("🧹 Cache cleanup performed");
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Log performance metrics periodically
		setInterval(() => {
			const metrics = this.getPerformanceMetrics();
			logger.performance("Ultra-aggressive prefetching metrics:", metrics);
		}, 60000); // Every minute
	}

	/**
	 * Get performance metrics
	 */
	getPerformanceMetrics() {
		return {
			queueSize: this.prefetchQueue.size,
			activePrefetches: this.activePrefetches.size,
			cacheSize: `${(this.currentCacheSize / 1024 / 1024).toFixed(2)}MB`,
			sessionData: {
				pageViews: this.sessionData.pageViews.length,
				searchQueries: this.sessionData.searchQueries.length,
				hoverPatterns: this.sessionData.hoverPatterns.length,
			},
		};
	}

	/**
	 * Destroy and cleanup
	 */
	destroy() {
		this.prefetchQueue.clear();
		this.activePrefetches.clear();
		this.isInitialized = false;
		logger.info("🧹 Ultra-aggressive prefetcher destroyed");
	}
}

// Create and export singleton
const ultraAggressivePrefetcher = new UltraAggressivePrefetcher();

export default ultraAggressivePrefetcher;
