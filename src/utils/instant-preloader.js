/**
 * Instant.page-style Preloading System
 * Makes navigation faster than instant by preloading on mousedown/hover
 * Inspired by instant.page and grep.app performance architecture
 */

import logger from "@lib/utils/logger";

// Configuration based on instant.page recommendations
const PRELOAD_CONFIG = {
	// Hover delay before preloading (65ms = 50% chance user will click)
	HOVER_DELAY: 65,
	// Touch delay for mobile
	TOUCH_DELAY: 90,
	// Maximum concurrent preloads
	MAX_CONCURRENT: 3,
	// Preload timeout
	TIMEOUT: 10000,
	// Enable mousedown preloading (even faster than hover)
	MOUSEDOWN_PRELOAD: true,
	// Enable viewport-based preloading
	VIEWPORT_PRELOAD: false,
};

class InstantPreloader {
	constructor() {
		this.preloadQueue = new Map();
		this.activePreloads = new Set();
		this.hoverTimers = new Map();
		this.isInitialized = false;
		this.prefetchObserver = null;
		this.performanceMetrics = {
			preloadsInitiated: 0,
			preloadHits: 0,
			averagePreloadTime: 0,
		};

		// Preload cache with performance tracking
		this.preloadCache = new Map();
	}

	/**
	 * Initialize the preloader with performance monitoring
	 */
	init() {
		if (this.isInitialized || typeof window === "undefined") return;

		this.isInitialized = true;
		this.setupEventListeners();
		this.setupIntersectionObserver();
		this.setupPerformanceMonitoring();

		logger.debug("InstantPreloader initialized");
	}

	/**
	 * Setup event listeners for instant preloading
	 */
	setupEventListeners() {
		// Mousedown preloading (fastest - triggers on press, not release)
		if (PRELOAD_CONFIG.MOUSEDOWN_PRELOAD) {
			document.addEventListener("mousedown", this.handleMouseDown.bind(this), {
				passive: true,
				capture: true,
			});
		}

		// Hover preloading for desktop
		document.addEventListener("mouseover", this.handleMouseOver.bind(this), {
			passive: true,
		});

		document.addEventListener("mouseout", this.handleMouseOut.bind(this), {
			passive: true,
		});

		// Touch start for mobile
		document.addEventListener("touchstart", this.handleTouchStart.bind(this), {
			passive: true,
		});

		// Focus preloading for keyboard navigation
		document.addEventListener("focusin", this.handleFocusIn.bind(this), {
			passive: true,
		});

		// Cleanup completed preloads
		document.addEventListener("beforeunload", this.cleanup.bind(this));
	}

	/**
	 * Setup intersection observer for viewport-based preloading
	 */
	setupIntersectionObserver() {
		if (!PRELOAD_CONFIG.VIEWPORT_PRELOAD || !("IntersectionObserver" in window)) {
			return;
		}

		this.prefetchObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const link = entry.target;
						this.schedulePreload(link, "viewport", 0);
					}
				});
			},
			{
				rootMargin: "50px",
				threshold: 0,
			}
		);
	}

	/**
	 * Handle mousedown events for instant preloading
	 */
	handleMouseDown(event) {
		const link = this.findPreloadableLink(event.target);
		if (link) {
			// Immediate preload on mousedown
			this.schedulePreload(link, "mousedown", 0);
		}
	}

	/**
	 * Handle mouseover events for hover preloading
	 */
	handleMouseOver(event) {
		const link = this.findPreloadableLink(event.target);
		if (link) {
			this.schedulePreload(link, "hover", PRELOAD_CONFIG.HOVER_DELAY);
		}
	}

	/**
	 * Handle mouseout events to cancel hover preloads
	 */
	handleMouseOut(event) {
		const link = this.findPreloadableLink(event.target);
		if (link) {
			this.cancelPreload(link, "hover");
		}
	}

	/**
	 * Handle touch start for mobile preloading
	 */
	handleTouchStart(event) {
		const link = this.findPreloadableLink(event.target);
		if (link) {
			this.schedulePreload(link, "touch", PRELOAD_CONFIG.TOUCH_DELAY);
		}
	}

	/**
	 * Handle focus events for keyboard navigation
	 */
	handleFocusIn(event) {
		const link = this.findPreloadableLink(event.target);
		if (link) {
			this.schedulePreload(link, "focus", 100);
		}
	}

	/**
	 * Find preloadable links from event target
	 */
	findPreloadableLink(element) {
		// Traverse up the DOM to find a preloadable element
		let current = element;
		while (current && current !== document) {
			if (this.isPreloadable(current)) {
				return current;
			}
			current = current.parentElement;
		}
		return null;
	}

	/**
	 * Check if element is preloadable
	 */
	isPreloadable(element) {
		// Links to business pages
		if (element.tagName === "A" && element.href) {
			const url = new URL(element.href, window.location.origin);

			// Only preload same-origin URLs
			if (url.origin !== window.location.origin) return false;

			// Preload business detail pages, search results, etc.
			const preloadablePatterns = [
				/^\/biz\/[^\/]+$/, // Business detail pages
				/^\/search\?/, // Search results
				/^\/categories\/[^\/]+$/, // Category pages
				/^\/explore-business/, // Explore pages
			];

			return preloadablePatterns.some((pattern) => pattern.test(url.pathname + url.search));
		}

		// Elements with data-preload attribute
		if (element.hasAttribute("data-preload")) {
			return true;
		}

		// Search result cards
		if (element.classList.contains("business-card") || element.classList.contains("search-result") || element.closest("[data-business-id]")) {
			return true;
		}

		return false;
	}

	/**
	 * Schedule a preload with delay
	 */
	schedulePreload(element, trigger, delay = 0) {
		const url = this.getPreloadUrl(element);
		if (!url) return;

		const cacheKey = `${trigger}:${url}`;

		// Cancel existing timer for this element
		this.cancelPreload(element, trigger);

		if (delay > 0) {
			// Schedule with delay
			const timer = setTimeout(() => {
				this.executePreload(url, trigger);
				this.hoverTimers.delete(cacheKey);
			}, delay);

			this.hoverTimers.set(cacheKey, timer);
		} else {
			// Execute immediately
			this.executePreload(url, trigger);
		}
	}

	/**
	 * Cancel a scheduled preload
	 */
	cancelPreload(element, trigger) {
		const url = this.getPreloadUrl(element);
		if (!url) return;

		const cacheKey = `${trigger}:${url}`;
		const timer = this.hoverTimers.get(cacheKey);

		if (timer) {
			clearTimeout(timer);
			this.hoverTimers.delete(cacheKey);
		}
	}

	/**
	 * Get preload URL from element
	 */
	getPreloadUrl(element) {
		if (element.href) {
			return element.href;
		}

		const preloadUrl = element.getAttribute("data-preload");
		if (preloadUrl) {
			return new URL(preloadUrl, window.location.origin).href;
		}

		// For business cards, construct the business URL
		const businessId = element.getAttribute("data-business-id") || element.closest("[data-business-id]")?.getAttribute("data-business-id");

		if (businessId) {
			return `/biz/${businessId}`;
		}

		return null;
	}

	/**
	 * Execute the actual preload
	 */
	async executePreload(url, trigger) {
		// Check if already preloading or preloaded
		if (this.activePreloads.has(url) || this.preloadCache.has(url)) {
			return;
		}

		// Respect concurrent limit
		if (this.activePreloads.size >= PRELOAD_CONFIG.MAX_CONCURRENT) {
			logger.debug(`Preload queue full, skipping: ${url}`);
			return;
		}

		this.activePreloads.add(url);
		this.performanceMetrics.preloadsInitiated++;

		const startTime = performance.now();

		try {
			logger.debug(`Preloading (${trigger}): ${url}`);

			// Use fetch with appropriate options
			const response = await fetch(url, {
				method: "GET",
				credentials: "same-origin",
				cache: "default",
				signal: AbortSignal.timeout(PRELOAD_CONFIG.TIMEOUT),
			});

			if (response.ok) {
				const html = await response.text();
				const loadTime = performance.now() - startTime;

				// Cache the response
				this.preloadCache.set(url, {
					html,
					timestamp: Date.now(),
					loadTime,
					trigger,
				});

				// Update performance metrics
				this.updatePerformanceMetrics(loadTime);

				logger.debug(`Preloaded successfully (${trigger}): ${url} in ${loadTime.toFixed(2)}ms`);

				// Preload critical resources from the HTML
				this.preloadCriticalResources(html, url);
			}
		} catch (error) {
			logger.warn(`Preload failed (${trigger}): ${url}`, error);
		} finally {
			this.activePreloads.delete(url);
		}
	}

	/**
	 * Preload critical resources from HTML content
	 */
	preloadCriticalResources(html, baseUrl) {
		// Create a temporary DOM to parse resources
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Preload critical CSS
		const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
		stylesheets.forEach((link) => {
			const href = new URL(link.href, baseUrl).href;
			this.preloadResource(href, "style");
		});

		// Preload critical JavaScript
		const scripts = doc.querySelectorAll("script[src]");
		scripts.forEach((script) => {
			const src = new URL(script.src, baseUrl).href;
			if (src.includes("/_next/static/")) {
				this.preloadResource(src, "script");
			}
		});

		// Preload critical images
		const images = doc.querySelectorAll("img[src]");
		Array.from(images)
			.slice(0, 3)
			.forEach((img) => {
				const src = new URL(img.src, baseUrl).href;
				this.preloadResource(src, "image");
			});
	}

	/**
	 * Preload individual resources
	 */
	preloadResource(url, type) {
		// Check if already exists
		const existing = document.querySelector(`link[href="${url}"]`);
		if (existing) return;

		const link = document.createElement("link");
		link.rel = "preload";
		link.href = url;

		switch (type) {
			case "style":
				link.as = "style";
				break;
			case "script":
				link.as = "script";
				break;
			case "image":
				link.as = "image";
				break;
			default:
				link.as = "fetch";
				link.crossOrigin = "anonymous";
		}

		document.head.appendChild(link);

		// Cleanup unused preload links after 10 seconds to prevent browser warnings
		setTimeout(() => {
			if (link.parentNode) {
				link.remove();
				logger.debug(`Removed unused preload: ${url}`);
			}
		}, 10000);
	}

	/**
	 * Update performance metrics
	 */
	updatePerformanceMetrics(loadTime) {
		const { averagePreloadTime, preloadsInitiated } = this.performanceMetrics;

		this.performanceMetrics.averagePreloadTime = (averagePreloadTime * (preloadsInitiated - 1) + loadTime) / preloadsInitiated;
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Track preload cache hits
		const originalFetch = window.fetch;
		window.fetch = async (...args) => {
			const url = args[0];
			if (typeof url === "string" && this.preloadCache.has(url)) {
				this.performanceMetrics.preloadHits++;
				logger.debug(`Preload cache hit: ${url}`);
			}
			return originalFetch.apply(window, args);
		};

		// Periodic performance reporting
		setInterval(() => {
			if (this.performanceMetrics.preloadsInitiated > 0) {
				logger.info("Preload Performance:", {
					...this.performanceMetrics,
					hitRate: ((this.performanceMetrics.preloadHits / this.performanceMetrics.preloadsInitiated) * 100).toFixed(2) + "%",
					cacheSize: this.preloadCache.size,
					activePreloads: this.activePreloads.size,
				});
			}
		}, 30000); // Every 30 seconds
	}

	/**
	 * Get preload performance metrics
	 */
	getMetrics() {
		return {
			...this.performanceMetrics,
			hitRate: this.performanceMetrics.preloadsInitiated > 0 ? ((this.performanceMetrics.preloadHits / this.performanceMetrics.preloadsInitiated) * 100).toFixed(2) + "%" : "0%",
			cacheSize: this.preloadCache.size,
			activePreloads: this.activePreloads.size,
		};
	}

	/**
	 * Clear cache and reset metrics
	 */
	clearCache() {
		this.preloadCache.clear();
		this.performanceMetrics = {
			preloadsInitiated: 0,
			preloadHits: 0,
			averagePreloadTime: 0,
		};
		logger.debug("Preload cache cleared");
	}

	/**
	 * Cleanup resources
	 */
	cleanup() {
		this.hoverTimers.forEach((timer) => clearTimeout(timer));
		this.hoverTimers.clear();
		this.activePreloads.clear();

		if (this.prefetchObserver) {
			this.prefetchObserver.disconnect();
		}
	}

	/**
	 * Force preload a specific URL
	 */
	async forcePreload(url, trigger = "manual") {
		return this.executePreload(url, trigger);
	}

	/**
	 * Check if URL is preloaded
	 */
	isPreloaded(url) {
		return this.preloadCache.has(url);
	}

	/**
	 * Get preloaded content
	 */
	getPreloadedContent(url) {
		return this.preloadCache.get(url);
	}
}

// Create singleton instance
const instantPreloader = new InstantPreloader();

// Export utilities
export const initInstantPreloader = () => {
	instantPreloader.init();
	return instantPreloader;
};

export const preloadUrl = (url, trigger = "manual") => {
	return instantPreloader.forcePreload(url, trigger);
};

export const getPreloadMetrics = () => {
	return instantPreloader.getMetrics();
};

export const clearPreloadCache = () => {
	instantPreloader.clearCache();
};

export default instantPreloader;
