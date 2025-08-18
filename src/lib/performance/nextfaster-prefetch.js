/**
 * NextFaster Link Prefetching System
 *
 * Advanced link prefetching inspired by NextFaster concepts
 * - Intelligent viewport-based prefetching
 * - Hover-based prefetching with debouncing
 * - Priority-based prefetching for critical routes
 * - Image and asset prefetching
 * - Background prefetching for likely next pages
 * - Zero loading states through predictive loading
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Performance monitoring for prefetch operations
let prefetchMetrics = {
	totalPrefetches: 0,
	successfulPrefetches: 0,
	failedPrefetches: 0,
	hitRate: 0,
	averagePrefetchTime: 0,
	bandwidthSaved: 0,
};

// Cache for prefetched content
const prefetchCache = new Map();
const prefetchPromises = new Map();

// Priority levels for different route types
const ROUTE_PRIORITIES = {
	CRITICAL: "critical", // Dashboard, auth pages
	HIGH: "high", // Category pages, business pages
	MEDIUM: "medium", // Blog posts, general content
	LOW: "low", // Footer links, legal pages
};

// Define route priority mappings
const PRIORITY_ROUTES = {
	[ROUTE_PRIORITIES.CRITICAL]: ["/dashboard", "/login", "/signup", "/dashboard/business"],
	[ROUTE_PRIORITIES.HIGH]: ["/categories", "/search", "/biz/", "/jobs", "/reviews"],
	[ROUTE_PRIORITIES.MEDIUM]: ["/blog/", "/about-us", "/how-it-works"],
	[ROUTE_PRIORITIES.LOW]: ["/privacy", "/terms", "/contact"],
};

/**
 * Get route priority based on path
 */
function getRoutePriority(href) {
	for (const [priority, routes] of Object.entries(PRIORITY_ROUTES)) {
		if (routes.some((route) => href.startsWith(route))) {
			return priority;
		}
	}
	return ROUTE_PRIORITIES.MEDIUM;
}

/**
 * Check if device has good connection for prefetching
 */
function shouldPrefetch() {
	// Check if user prefers reduced data usage
	if (navigator.connection) {
		const { effectiveType, saveData } = navigator.connection;

		// Don't prefetch on slow connections or when data saver is on
		if (saveData || effectiveType === "slow-2g" || effectiveType === "2g") {
			return false;
		}
	}

	// Check if device has limited memory
	if (navigator.deviceMemory && navigator.deviceMemory < 4) {
		return false;
	}

	return true;
}

/**
 * Advanced prefetch function with priority handling
 */
async function intelligentPrefetch(href, priority = ROUTE_PRIORITIES.MEDIUM, type = "page") {
	if (!shouldPrefetch()) return;

	const startTime = performance.now();
	const cacheKey = `${type}:${href}`;

	// Skip if already prefetched or in progress
	if (prefetchCache.has(cacheKey) || prefetchPromises.has(cacheKey)) {
		return;
	}

	try {
		prefetchMetrics.totalPrefetches++;

		// Create prefetch promise
		const prefetchPromise = Promise.resolve()
			.then(async () => {
				switch (type) {
					case "page":
						// Prefetch the route
						if (typeof window !== "undefined" && window.history) {
							const url = new URL(href, window.location.origin);

							// Use fetch to prefetch the page
							const response = await fetch(url.pathname, {
								method: "GET",
								headers: {
									"X-Prefetch": "true",
									Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
								},
							});

							if (response.ok) {
								const html = await response.text();
								prefetchCache.set(cacheKey, {
									html,
									timestamp: Date.now(),
									priority,
								});

								// Extract and prefetch linked assets
								extractAndPrefetchAssets(html, href);
							}
						}
						break;

					case "image":
						// Prefetch images
						const img = new Image();
						img.src = href;
						prefetchCache.set(cacheKey, { loaded: true, timestamp: Date.now() });
						break;

					case "script":
						// Prefetch JavaScript resources
						const link = document.createElement("link");
						link.rel = "prefetch";
						link.href = href;
						link.as = "script";
						document.head.appendChild(link);
						prefetchCache.set(cacheKey, { loaded: true, timestamp: Date.now() });
						break;

					case "style":
						// Prefetch CSS resources
						const cssLink = document.createElement("link");
						cssLink.rel = "prefetch";
						cssLink.href = href;
						cssLink.as = "style";
						document.head.appendChild(cssLink);
						prefetchCache.set(cacheKey, { loaded: true, timestamp: Date.now() });
						break;
				}

				prefetchMetrics.successfulPrefetches++;
				const duration = performance.now() - startTime;
				prefetchMetrics.averagePrefetchTime = (prefetchMetrics.averagePrefetchTime + duration) / 2;
			})
			.catch((error) => {
				prefetchMetrics.failedPrefetches++;
				console.warn(`Prefetch failed for ${href}:`, error);
			})
			.finally(() => {
				prefetchPromises.delete(cacheKey);
			});

		prefetchPromises.set(cacheKey, prefetchPromise);
		await prefetchPromise;
	} catch (error) {
		prefetchMetrics.failedPrefetches++;
		console.warn(`Prefetch error for ${href}:`, error);
	}
}

/**
 * Extract and prefetch assets from HTML content
 */
function extractAndPrefetchAssets(html, baseUrl) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Get a safe base URL for resolving relative URLs
	const safeBaseUrl = (() => {
		try {
			if (typeof window !== "undefined") {
				return baseUrl || window.location.href;
			}
			return baseUrl || "http://localhost:3000";
		} catch (e) {
			return "http://localhost:3000";
		}
	})();

	// Helper function to safely resolve URLs
	const safeResolveUrl = (url, base) => {
		try {
			// Skip data URLs and blob URLs
			if (url.startsWith("data:") || url.startsWith("blob:")) {
				return null;
			}
			
			// If URL is already absolute, return as-is
			if (url.startsWith("http://") || url.startsWith("https://")) {
				return url;
			}
			
			// Ensure we have a valid base URL for the URL constructor
			let validBase;
			try {
				// Check if base is already a valid URL
				new URL(base);
				validBase = base;
			} catch (e) {
				// If base is not a valid URL (e.g., "/dashboard"), use current origin
				if (typeof window !== "undefined") {
					validBase = window.location.origin;
				} else {
					validBase = "http://localhost:3000";
				}
			}
			
			// Try to resolve relative URL with valid base
			const resolved = new URL(url, validBase);
			return resolved.href;
		} catch (e) {
			// Silent failure - don't log errors as this is expected for some URLs
			return null;
		}
	};

	// Prefetch critical images
	const images = doc.querySelectorAll("img[src]");
	images.forEach((img, index) => {
		if (index < 3) {
			// Only prefetch first 3 images
			const srcAttr = img.getAttribute("src");
			if (srcAttr) {
				const resolvedSrc = safeResolveUrl(srcAttr, safeBaseUrl);
				if (resolvedSrc) {
					intelligentPrefetch(resolvedSrc, ROUTE_PRIORITIES.HIGH, "image");
				}
			}
		}
	});

	// Prefetch critical CSS
	const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
	stylesheets.forEach((link, index) => {
		if (index < 2) {
			// Only prefetch first 2 stylesheets
			const hrefAttr = link.getAttribute("href");
			if (hrefAttr) {
				const resolvedHref = safeResolveUrl(hrefAttr, safeBaseUrl);
				if (resolvedHref) {
					intelligentPrefetch(resolvedHref, ROUTE_PRIORITIES.HIGH, "style");
				}
			}
		}
	});
}

/**
 * Intersection Observer for viewport-based prefetching
 */
class ViewportPrefetcher {
	constructor() {
		this.observer = null;
		this.observedElements = new WeakMap();
		this.init();
	}

	init() {
		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			return;
		}

		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const element = entry.target;
						const href = this.observedElements.get(element);
						if (href) {
							const priority = getRoutePriority(href);
							intelligentPrefetch(href, priority);
							this.observer?.unobserve(element);
							this.observedElements.delete(element);
						}
					}
				});
			},
			{
				rootMargin: "50px",
				threshold: 0.1,
			}
		);
	}

	observe(element, href) {
		if (this.observer && element) {
			this.observedElements.set(element, href);
			this.observer.observe(element);
		}
	}

	unobserve(element) {
		if (this.observer && element) {
			this.observer.unobserve(element);
			this.observedElements.delete(element);
		}
	}
}

// Global viewport prefetcher instance
let viewportPrefetcher = null;

/**
 * Initialize viewport prefetcher
 */
function initViewportPrefetcher() {
	if (typeof window !== "undefined" && !viewportPrefetcher) {
		viewportPrefetcher = new ViewportPrefetcher();
	}
	return viewportPrefetcher;
}

/**
 * Hover-based prefetching with debouncing
 */
function createHoverPrefetcher() {
	let hoverTimeout = null;

	return {
		onMouseEnter: (href) => {
			if (hoverTimeout) clearTimeout(hoverTimeout);

			hoverTimeout = setTimeout(() => {
				const priority = getRoutePriority(href);
				intelligentPrefetch(href, priority);
			}, 100); // 100ms debounce
		},

		onMouseLeave: () => {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
			}
		},
	};
}

/**
 * Predictive prefetching based on user behavior
 */
class PredictivePrefetcher {
	constructor() {
		this.userPatterns = new Map();
		this.currentPath = "";
		this.visitHistory = [];
	}

	recordVisit(path) {
		this.visitHistory.push({
			path,
			timestamp: Date.now(),
		});

		// Keep only last 10 visits
		if (this.visitHistory.length > 10) {
			this.visitHistory.shift();
		}

		// Update patterns
		if (this.currentPath) {
			const pattern = `${this.currentPath}->${path}`;
			const count = this.userPatterns.get(pattern) || 0;
			this.userPatterns.set(pattern, count + 1);
		}

		this.currentPath = path;
		this.predictNextPages();
	}

	predictNextPages() {
		// Find most likely next pages based on patterns
		const currentPath = this.currentPath;
		const predictions = [];

		for (const [pattern, count] of this.userPatterns) {
			if (pattern.startsWith(currentPath + "->") && count > 1) {
				const nextPath = pattern.split("->")[1];
				predictions.push({ path: nextPath, confidence: count });
			}
		}

		// Sort by confidence and prefetch top 2
		predictions
			.sort((a, b) => b.confidence - a.confidence)
			.slice(0, 2)
			.forEach((prediction) => {
				const priority = getRoutePriority(prediction.path);
				intelligentPrefetch(prediction.path, priority);
			});
	}
}

// Global predictive prefetcher
let predictivePrefetcher = null;

/**
 * Initialize predictive prefetcher
 */
function initPredictivePrefetcher() {
	if (typeof window !== "undefined" && !predictivePrefetcher) {
		predictivePrefetcher = new PredictivePrefetcher();
	}
	return predictivePrefetcher;
}

/**
 * Hook for NextFaster prefetching
 */
export function useNextFasterPrefetch() {
	const router = useRouter();
	const pathname = usePathname();
	const [isSupported, setIsSupported] = useState(false);

	useEffect(() => {
		setIsSupported(typeof window !== "undefined" && "requestIdleCallback" in window);

		// Initialize prefetchers
		initViewportPrefetcher();
		const predictor = initPredictivePrefetcher();

		// Record current path visit
		if (predictor) {
			predictor.recordVisit(pathname);
		}

		// Clean up old cache entries (older than 5 minutes)
		const cleanupInterval = setInterval(() => {
			const now = Date.now();
			for (const [key, value] of prefetchCache) {
				if (now - value.timestamp > 5 * 60 * 1000) {
					prefetchCache.delete(key);
				}
			}
		}, 60000); // Run every minute

		return () => {
			clearInterval(cleanupInterval);
		};
	}, [pathname]);

	// Prefetch critical routes immediately
	useEffect(() => {
		if (!isSupported) return;

		const criticalRoutes = PRIORITY_ROUTES[ROUTE_PRIORITIES.CRITICAL];

		requestIdleCallback(() => {
			criticalRoutes.forEach((route) => {
				if (route !== pathname) {
					intelligentPrefetch(route, ROUTE_PRIORITIES.CRITICAL);
				}
			});
		});
	}, [pathname, isSupported]);

	return {
		prefetch: intelligentPrefetch,
		isSupported,
		metrics: prefetchMetrics,
		cache: prefetchCache,
	};
}

/**
 * Create optimized Link component with NextFaster prefetching
 */
export function createPrefetchedLink() {
	const hoverPrefetcher = createHoverPrefetcher();

	return function PrefetchedLink({ href, children, priority = null, prefetchOnHover = true, prefetchOnViewport = false, className = "", ...props }) {
		const linkRef = useRef(null);
		const { prefetch } = useNextFasterPrefetch();

		// Auto-detect priority if not provided
		const linkPriority = priority || getRoutePriority(href);

		useEffect(() => {
			if (prefetchOnViewport && linkRef.current && viewportPrefetcher) {
				viewportPrefetcher.observe(linkRef.current, href);

				return () => {
					if (linkRef.current && viewportPrefetcher) {
						viewportPrefetcher.unobserve(linkRef.current);
					}
				};
			}
		}, [href, prefetchOnViewport]);

		const handleMouseEnter = useCallback(() => {
			if (prefetchOnHover) {
				hoverPrefetcher.onMouseEnter(href);
			}
		}, [href, prefetchOnHover]);

		const handleMouseLeave = useCallback(() => {
			if (prefetchOnHover) {
				hoverPrefetcher.onMouseLeave();
			}
		}, [prefetchOnHover]);

		return (
			<a ref={linkRef} href={href} className={className} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
				{children}
			</a>
		);
	};
}

// Export performance metrics for monitoring
export function getPrefetchMetrics() {
	prefetchMetrics.hitRate = prefetchMetrics.totalPrefetches > 0 ? (prefetchMetrics.successfulPrefetches / prefetchMetrics.totalPrefetches) * 100 : 0;

	return { ...prefetchMetrics };
}

// Export cache info for debugging
export function getPrefetchCacheInfo() {
	return {
		size: prefetchCache.size,
		entries: Array.from(prefetchCache.keys()),
		totalSize: Array.from(prefetchCache.values()).reduce((size, entry) => size + (entry.html?.length || 0), 0),
	};
}

// Background prefetching for common routes
export function startBackgroundPrefetching() {
	if (!shouldPrefetch()) return;

	requestIdleCallback(() => {
		const commonRoutes = ["/categories", "/search", "/jobs"];

		commonRoutes.forEach((route, index) => {
			setTimeout(() => {
				intelligentPrefetch(route, ROUTE_PRIORITIES.MEDIUM);
			}, index * 500); // Stagger prefetches
		});
	});
}
