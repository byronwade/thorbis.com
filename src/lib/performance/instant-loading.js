/**
 * Instant Loading System
 *
 * Eliminates loading states through intelligent content preloading and optimistic UI
 * Implements zero-loading concepts inspired by NextFaster and modern web performance
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Global instant loading cache
const instantCache = new Map();
const loadingPromises = new Map();

// Content streaming manager
class ContentStreamer {
	constructor() {
		this.streams = new Map();
		this.observers = new Map();
	}

	/**
	 * Create a streaming content loader
	 */
	createStream(key, loader) {
		if (this.streams.has(key)) {
			return this.streams.get(key);
		}

		const stream = {
			data: null,
			loading: false,
			error: null,
			observers: new Set(),
			lastUpdated: 0,
		};

		this.streams.set(key, stream);

		// Start loading immediately
		this.loadContent(key, loader);

		return stream;
	}

	/**
	 * Load content with error handling and caching
	 */
	async loadContent(key, loader) {
		const stream = this.streams.get(key);
		if (!stream || stream.loading) return;

		stream.loading = true;
		this.notifyObservers(key);

		try {
			const data = await loader();
			stream.data = data;
			stream.error = null;
			stream.lastUpdated = Date.now();
			instantCache.set(key, data);
		} catch (error) {
			stream.error = error;
			console.warn(`Content loading failed for ${key}:`, error);
		} finally {
			stream.loading = false;
			this.notifyObservers(key);
		}
	}

	/**
	 * Subscribe to content updates
	 */
	subscribe(key, callback) {
		const stream = this.streams.get(key);
		if (stream) {
			stream.observers.add(callback);
		}

		return () => {
			const stream = this.streams.get(key);
			if (stream) {
				stream.observers.delete(callback);
			}
		};
	}

	/**
	 * Notify all observers of content changes
	 */
	notifyObservers(key) {
		const stream = this.streams.get(key);
		if (stream) {
			stream.observers.forEach((callback) => callback(stream));
		}
	}

	/**
	 * Get current content state
	 */
	getContent(key) {
		return this.streams.get(key) || null;
	}

	/**
	 * Preload content for future use
	 */
	preloadContent(key, loader) {
		if (!this.streams.has(key)) {
			this.createStream(key, loader);
		}
	}

	/**
	 * Clear old content streams
	 */
	cleanup() {
		const now = Date.now();
		const maxAge = 5 * 60 * 1000; // 5 minutes

		for (const [key, stream] of this.streams) {
			if (now - stream.lastUpdated > maxAge && stream.observers.size === 0) {
				this.streams.delete(key);
				instantCache.delete(key);
			}
		}
	}
}

// Global content streamer instance
const contentStreamer = new ContentStreamer();

// Cleanup interval
if (typeof window !== "undefined") {
	setInterval(() => {
		contentStreamer.cleanup();
	}, 60000); // Run every minute
}

/**
 * Hook for instant loading with no loading states
 */
export function useInstantContent(key, loader, options = {}) {
	const {
		preload = false,
		refreshInterval = 0,
		staleTime = 5 * 60 * 1000, // 5 minutes
		optimistic = true,
		fallbackData = null,
	} = options;

	const [content, setContent] = useState(() => {
		// Check if content is already cached
		const cached = instantCache.get(key);
		if (cached) return cached;

		// Return fallback data if optimistic loading is enabled
		if (optimistic && fallbackData) return fallbackData;

		return null;
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const refreshTimeoutRef = useRef(null);

	// Subscribe to content stream
	useEffect(() => {
		const stream = contentStreamer.createStream(key, loader);

		const unsubscribe = contentStreamer.subscribe(key, (streamData) => {
			setContent(streamData.data);
			setLoading(streamData.loading);
			setError(streamData.error);
		});

		// Set initial state
		setContent(stream.data);
		setLoading(stream.loading);
		setError(stream.error);

		return unsubscribe;
	}, [key]);

	// Handle preloading
	useEffect(() => {
		if (preload) {
			contentStreamer.preloadContent(key, loader);
		}
	}, [key, loader, preload]);

	// Handle refresh interval
	useEffect(() => {
		if (refreshInterval > 0) {
			const scheduleRefresh = () => {
				refreshTimeoutRef.current = setTimeout(() => {
					contentStreamer.loadContent(key, loader);
					scheduleRefresh();
				}, refreshInterval);
			};

			scheduleRefresh();

			return () => {
				if (refreshTimeoutRef.current) {
					clearTimeout(refreshTimeoutRef.current);
				}
			};
		}
	}, [key, loader, refreshInterval]);

	// Refresh function
	const refresh = useCallback(() => {
		contentStreamer.loadContent(key, loader);
	}, [key, loader]);

	// Check if content is stale
	const isStale = useCallback(() => {
		const stream = contentStreamer.getContent(key);
		if (!stream) return true;

		return Date.now() - stream.lastUpdated > staleTime;
	}, [key, staleTime]);

	return {
		data: content,
		loading: false, // Never show loading states
		error,
		refresh,
		isStale: isStale(),
	};
}

/**
 * Optimistic UI component wrapper
 */
export function OptimisticWrapper({ children, fallback = null, errorFallback = null, showLoadingState = false }) {
	return <div className="optimistic-wrapper">{children || fallback}</div>;
}

/**
 * Instant loading higher-order component
 */
export function withInstantLoading(Component, options = {}) {
	return function InstantLoadingComponent(props) {
		const [content, setContent] = useState(null);

		useEffect(() => {
			// Use cached content if available
			const cacheKey = `component:${Component.name}:${JSON.stringify(props)}`;
			const cached = instantCache.get(cacheKey);

			if (cached) {
				setContent(cached);
			}
		}, [props]);

		// Always render component immediately - no loading states
		return <Component {...props} />;
	};
}

/**
 * Background content preloader
 */
export class BackgroundPreloader {
	constructor() {
		this.preloadQueue = [];
		this.isProcessing = false;
		this.maxConcurrent = 3;
		this.processing = new Set();
	}

	/**
	 * Add content to preload queue
	 */
	preload(key, loader, priority = "normal") {
		if (instantCache.has(key) || loadingPromises.has(key)) {
			return; // Already cached or loading
		}

		this.preloadQueue.push({
			key,
			loader,
			priority,
			timestamp: Date.now(),
		});

		this.processQueue();
	}

	/**
	 * Process preload queue
	 */
	async processQueue() {
		if (this.isProcessing || this.processing.size >= this.maxConcurrent) {
			return;
		}

		this.isProcessing = true;

		// Sort by priority
		this.preloadQueue.sort((a, b) => {
			const priorityOrder = { high: 3, normal: 2, low: 1 };
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		});

		while (this.preloadQueue.length > 0 && this.processing.size < this.maxConcurrent) {
			const item = this.preloadQueue.shift();
			this.processItem(item);
		}

		this.isProcessing = false;
	}

	/**
	 * Process individual preload item
	 */
	async processItem({ key, loader, priority }) {
		if (this.processing.has(key)) return;

		this.processing.add(key);
		loadingPromises.set(key, true);

		try {
			const content = await loader();
			instantCache.set(key, content);
			contentStreamer.preloadContent(key, loader);

			console.log(`Preloaded content: ${key}`);
		} catch (error) {
			console.warn(`Preload failed for ${key}:`, error);
		} finally {
			this.processing.delete(key);
			loadingPromises.delete(key);

			// Continue processing queue
			if (this.preloadQueue.length > 0) {
				setTimeout(() => this.processQueue(), 100);
			}
		}
	}

	/**
	 * Clear preload queue
	 */
	clear() {
		this.preloadQueue = [];
		this.processing.clear();
	}

	/**
	 * Get queue status
	 */
	getStatus() {
		return {
			queueLength: this.preloadQueue.length,
			processing: this.processing.size,
			cacheSize: instantCache.size,
		};
	}
}

// Global background preloader
export const backgroundPreloader = new BackgroundPreloader();

/**
 * Instant page transition system
 */
export class InstantPageTransitions {
	constructor() {
		this.transitionCache = new Map();
		this.pendingTransitions = new Set();
	}

	/**
	 * Prepare page transition
	 */
	async prepareTransition(href) {
		if (this.transitionCache.has(href) || this.pendingTransitions.has(href)) {
			return;
		}

		this.pendingTransitions.add(href);

		try {
			// Prefetch page content
			const response = await fetch(href, {
				method: "GET",
				headers: {
					"X-Prefetch": "true",
					Accept: "text/html",
				},
			});

			if (response.ok) {
				const html = await response.text();
				this.transitionCache.set(href, {
					html,
					timestamp: Date.now(),
				});
			}
		} catch (error) {
			console.warn(`Transition preparation failed for ${href}:`, error);
		} finally {
			this.pendingTransitions.delete(href);
		}
	}

	/**
	 * Execute instant transition
	 */
	async executeTransition(href) {
		const cached = this.transitionCache.get(href);

		if (cached) {
			// Use View Transitions API if available
			if (document.startViewTransition) {
				await document.startViewTransition(() => {
					// Navigate instantly using cached content
					window.history.pushState({}, "", href);
				});
			} else {
				// Fallback to immediate navigation
				window.history.pushState({}, "", href);
			}

			return true;
		}

		return false;
	}

	/**
	 * Clean old transitions
	 */
	cleanup() {
		const now = Date.now();
		const maxAge = 10 * 60 * 1000; // 10 minutes

		for (const [href, data] of this.transitionCache) {
			if (now - data.timestamp > maxAge) {
				this.transitionCache.delete(href);
			}
		}
	}
}

// Global instant transitions
export const instantTransitions = new InstantPageTransitions();

/**
 * Hook for instant page transitions
 */
export function useInstantTransitions() {
	useEffect(() => {
		const cleanupInterval = setInterval(() => {
			instantTransitions.cleanup();
		}, 60000);

		return () => clearInterval(cleanupInterval);
	}, []);

	return {
		prepareTransition: instantTransitions.prepareTransition.bind(instantTransitions),
		executeTransition: instantTransitions.executeTransition.bind(instantTransitions),
	};
}

/**
 * Performance monitoring for instant loading
 */
export function getInstantLoadingMetrics() {
	return {
		cacheSize: instantCache.size,
		streamsActive: contentStreamer.streams.size,
		preloadQueueSize: backgroundPreloader.getStatus().queueLength,
		transitionsCached: instantTransitions.transitionCache.size,
		memoryUsage: navigator.deviceMemory || "unknown",
	};
}

/**
 * Initialize instant loading system
 */
export function initializeInstantLoading() {
	// Start background preloading for critical content
	const criticalContent = [
		{
			key: "user-dashboard",
			loader: async () => {
				try {
					const res = await fetch("/api/dashboard/user");
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					// Guard against empty body
					const text = await res.text();
					return text ? JSON.parse(text) : {};
				} catch (e) {
					console.warn("Preload failed for user-dashboard:", e);
					return {};
				}
			},
		},
		{
			key: "categories",
			loader: async () => {
				try {
					const res = await fetch("/api/categories");
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					const text = await res.text();
					return text ? JSON.parse(text) : [];
				} catch (e) {
					console.warn("Preload failed for categories:", e);
					return [];
				}
			},
		},
		{
			key: "featured-businesses",
			loader: async () => {
				try {
					const res = await fetch("/api/businesses/featured");
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					const text = await res.text();
					return text ? JSON.parse(text) : { businesses: [] };
				} catch (e) {
					console.warn("Preload failed for featured-businesses:", e);
					return { businesses: [] };
				}
			},
		},
	];

	criticalContent.forEach(({ key, loader }) => {
		backgroundPreloader.preload(key, loader, "high");
	});

	// Prepare common page transitions (exclude auth-protected routes by default)
	const commonPages = ["/categories", "/search", "/jobs"];

	commonPages.forEach((href) => {
		instantTransitions.prepareTransition(href);
	});

	console.log("Instant loading system initialized");
}
