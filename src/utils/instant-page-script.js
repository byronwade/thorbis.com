/**
 * Instant.page Script Integration
 * Implements the instant.page library with custom configuration
 * Makes page navigation faster than instant
 */

import logger from "@lib/utils/logger";

// Configuration optimized for business directory
const INSTANT_CONFIG = {
	// Enable mousedown shortcut (even faster than hover)
	mousedownShortcut: true,
	// Preload intensity
	intensity: "mousedown",
	// Custom allowlist for business pages
	allowlist: [
		/^\/biz\/[^\/]+$/, // Business detail pages
		/^\/search/, // Search results
		/^\/categories/, // Category pages
		/^\/explore-business/, // Explore pages
		/^\/localhub/, // LocalHub pages
	],
	// Blocklist for pages that shouldn't be preloaded
	blocklist: [
		"/dashboard", // Dashboard pages
		"/auth", // Authentication pages
		"/api", // API endpoints
	],
};

/**
 * Initialize instant.page with custom configuration
 */
export const initInstantPage = () => {
	if (typeof window === "undefined") return;

	// Check if instant.page is already loaded
	if (window.instantpage) {
		logger.debug("instant.page already loaded");
		return;
	}

	try {
		// Load instant.page script
		const script = document.createElement("script");
		script.src = "//instant.page/5.2.0";
		script.type = "module";
		script.integrity = "sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z";
		script.crossOrigin = "anonymous";

		// Configure instant.page
		script.onload = () => {
			logger.debug("instant.page loaded successfully");
			configureInstantPage();
		};

		script.onerror = () => {
			logger.warn("Failed to load instant.page, falling back to custom preloader");
		};

		document.head.appendChild(script);

		// Enable mousedown shortcut
		if (INSTANT_CONFIG.mousedownShortcut) {
			document.body.setAttribute("data-instant-mousedown-shortcut", "");
		}

		// Set intensity
		if (INSTANT_CONFIG.intensity) {
			document.body.setAttribute("data-instant-intensity", INSTANT_CONFIG.intensity);
		}
	} catch (error) {
		logger.error("Error initializing instant.page:", error);
	}
};

/**
 * Configure instant.page after loading
 */
function configureInstantPage() {
	if (!window.instantpage) return;

	// Configure allowlist
	if (INSTANT_CONFIG.allowlist.length > 0) {
		window.instantpage.allowlist = INSTANT_CONFIG.allowlist;
	}

	// Configure blocklist
	if (INSTANT_CONFIG.blocklist.length > 0) {
		window.instantpage.blocklist = INSTANT_CONFIG.blocklist;
	}

	// Custom link filtering
	window.instantpage.isAllowed = (url) => {
		const urlObj = new URL(url, window.location.origin);

		// Check blocklist first
		for (const pattern of INSTANT_CONFIG.blocklist) {
			if (typeof pattern === "string" && urlObj.pathname.startsWith(pattern)) {
				return false;
			}
			if (pattern instanceof RegExp && pattern.test(urlObj.pathname)) {
				return false;
			}
		}

		// Check allowlist
		for (const pattern of INSTANT_CONFIG.allowlist) {
			if (typeof pattern === "string" && urlObj.pathname.startsWith(pattern)) {
				return true;
			}
			if (pattern instanceof RegExp && pattern.test(urlObj.pathname)) {
				return true;
			}
		}

		// Default to allowing same-origin URLs for core pages
		return urlObj.origin === window.location.origin && !urlObj.pathname.startsWith("/api/");
	};

	logger.debug("instant.page configured with custom settings");
}

/**
 * Alternative preloader for when instant.page fails
 */
export const initFallbackPreloader = () => {
	if (typeof window === "undefined") return;

	logger.debug("Initializing fallback preloader");

	let preloadCache = new Set();

	// Mousedown preloading
	document.addEventListener(
		"mousedown",
		(event) => {
			const link = event.target.closest("a");
			if (link && link.href && isLinkAllowed(link.href)) {
				preloadPage(link.href);
			}
		},
		{ passive: true }
	);

	// Hover preloading with delay
	let hoverTimeout;
	document.addEventListener(
		"mouseover",
		(event) => {
			const link = event.target.closest("a");
			if (link && link.href && isLinkAllowed(link.href)) {
				hoverTimeout = setTimeout(() => {
					preloadPage(link.href);
				}, 65); // 65ms = optimal hover delay
			}
		},
		{ passive: true }
	);

	document.addEventListener(
		"mouseout",
		() => {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
			}
		},
		{ passive: true }
	);

	function isLinkAllowed(url) {
		try {
			const urlObj = new URL(url, window.location.origin);

			// Same origin only
			if (urlObj.origin !== window.location.origin) return false;

			// Check allowlist
			return INSTANT_CONFIG.allowlist.some((pattern) => {
				if (typeof pattern === "string") {
					return urlObj.pathname.startsWith(pattern);
				}
				if (pattern instanceof RegExp) {
					return pattern.test(urlObj.pathname);
				}
				return false;
			});
		} catch {
			return false;
		}
	}

	function preloadPage(url) {
		if (preloadCache.has(url)) return;

		preloadCache.add(url);

		// Use link preloading
		const link = document.createElement("link");
		link.rel = "prefetch";
		link.href = url;
		document.head.appendChild(link);

		logger.debug(`Fallback preload: ${url}`);
	}
};

/**
 * Enhanced preloading for business search results
 */
export const preloadBusinessSearch = (searchParams) => {
	if (typeof window === "undefined") return;

	const searchUrl = new URL("/search", window.location.origin);

	// Add search parameters
	Object.entries(searchParams).forEach(([key, value]) => {
		if (value) {
			searchUrl.searchParams.set(key, value);
		}
	});

	// Preload the search results
	const link = document.createElement("link");
	link.rel = "prefetch";
	link.href = searchUrl.toString();
	document.head.appendChild(link);

	logger.debug(`Preloading search: ${searchUrl.toString()}`);
};

/**
 * Preload business detail page
 */
export const preloadBusiness = (businessId) => {
	if (typeof window === "undefined" || !businessId) return;

	const businessUrl = `/biz/${businessId}`;

	// Preload the business page
	const link = document.createElement("link");
	link.rel = "prefetch";
	link.href = businessUrl;
	document.head.appendChild(link);

	// Also preload the API data
	const apiLink = document.createElement("link");
	apiLink.rel = "prefetch";
	apiLink.href = `/api/business/${businessId}`;
	apiLink.as = "fetch";
	apiLink.crossOrigin = "anonymous";
	document.head.appendChild(apiLink);

	logger.debug(`Preloading business: ${businessUrl}`);
};

/**
 * Smart preloading based on user behavior
 */
export const initSmartPreloading = () => {
	if (typeof window === "undefined") return;

	let idleTimer;
	const IDLE_DELAY = 2000;

	// Preload popular pages when user is idle
	const preloadPopularPages = () => {
		const popularPages = ["/categories", "/explore-business", "/search?category=restaurants", "/search?category=shopping"];

		popularPages.forEach((page) => {
			const link = document.createElement("link");
			link.rel = "prefetch";
			link.href = page;
			document.head.appendChild(link);
		});

		logger.debug("Preloaded popular pages during idle time");
	};

	const resetIdleTimer = () => {
		clearTimeout(idleTimer);
		idleTimer = setTimeout(preloadPopularPages, IDLE_DELAY);
	};

	// Track user activity
	const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
	events.forEach((event) => {
		document.addEventListener(event, resetIdleTimer, { passive: true });
	});

	resetIdleTimer();
};

/**
 * Initialize all instant loading features
 */
export const initInstantLoading = () => {
	if (typeof window === "undefined") return;

	// Try instant.page first
	initInstantPage();

	// Initialize fallback preloader as backup
	setTimeout(() => {
		if (!window.instantpage) {
			initFallbackPreloader();
		}
	}, 1000);

	// Initialize smart preloading
	initSmartPreloading();

	logger.debug("Instant loading initialized");
};

export default {
	initInstantPage,
	initInstantLoading,
	preloadBusinessSearch,
	preloadBusiness,
	initSmartPreloading,
};
