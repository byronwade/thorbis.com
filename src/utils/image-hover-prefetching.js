// lib/utils/imageHoverPrefetching.js - NextFaster-Style Image Prefetching on Hover
import logger from "./logger.js";
import cacheManager from "./cache-manager";

/**
 * Image Hover Prefetching System
 * Inspired by NextFaster and modern e-commerce sites
 * Preloads images on link hover for instant visual feedback
 */
class ImageHoverPrefetcher {
	constructor() {
		this.isInitialized = false;
		this.prefetchedImages = new Set(); // Track already prefetched images
		this.hoverQueue = new Map(); // Queue of images to prefetch
		this.activePreloads = new Set(); // Currently loading images
		this.imageCache = new Map(); // In-memory image cache
		this.maxConcurrentLoads = 6; // Maximum parallel image loads
		this.maxCacheSize = 50 * 1024 * 1024; // 50MB image cache limit
		this.currentCacheSize = 0;

		// Hover timing configuration (NextFaster optimized)
		this.hoverConfig = {
			INSTANT_DELAY: 0, // Critical images - load immediately
			FAST_DELAY: 25, // Fast hover - 25ms like NextFaster
			NORMAL_DELAY: 100, // Normal hover - 100ms
			SLOW_DELAY: 300, // Background prefetch - 300ms
		};

		// Image priority mapping
		this.imagePriorities = {
			HERO_IMAGES: 1, // Business hero/main images
			THUMBNAILS: 2, // Business card thumbnails
			GALLERY_IMAGES: 3, // Photo galleries
			MENU_IMAGES: 3, // Menu item photos
			PROFILE_IMAGES: 4, // User/business profile images
			BACKGROUND_IMAGES: 5, // Decorative backgrounds
		};

		// Image type detection patterns
		this.imagePatterns = {
			businessHero: /\/business\/\d+\/hero\./,
			businessThumbnail: /\/business\/\d+\/thumb\./,
			businessGallery: /\/business\/\d+\/gallery\//,
			menuItem: /\/menu\/\d+\//,
			userProfile: /\/users\/\d+\/avatar\./,
		};

		logger.info("🖼️ Image Hover Prefetcher created");
	}

	/**
	 * Initialize image hover prefetching
	 */
	async init() {
		if (this.isInitialized) return;

		try {
			logger.info("🚀 Initializing image hover prefetching...");

			// Setup hover listeners
			this.setupHoverListeners();

			// Setup intersection observers for viewport prefetching
			this.setupViewportPrefetching();

			// Setup intelligent image discovery
			this.setupImageDiscovery();

			// Setup cache management
			this.setupCacheManagement();

			// Setup performance monitoring
			this.setupPerformanceMonitoring();

			// Start prefetch queue processor
			this.startPrefetchProcessor();

			this.isInitialized = true;
			logger.info("✅ Image hover prefetching initialized");
		} catch (error) {
			logger.error("❌ Image hover prefetching failed:", error);
		}
	}

	/**
	 * Setup hover listeners for image prefetching
	 */
	setupHoverListeners() {
		let hoverTimeout;
		const hoverStartTimes = new WeakMap();

		// Ultra-fast hover detection
		const handleMouseEnter = (event) => {
			const target = event.target.closest("[data-business-id], a[href], [data-prefetch-images]");
			if (!target) return;

			// Record hover start time
			hoverStartTimes.set(target, performance.now());

			clearTimeout(hoverTimeout);

			// Get hover delay based on element priority
			const delay = this.getHoverDelay(target);

			hoverTimeout = setTimeout(() => {
				this.handleElementHover(target);
			}, delay);
		};

		const handleMouseLeave = (event) => {
			clearTimeout(hoverTimeout);

			const target = event.target.closest("[data-business-id], a[href], [data-prefetch-images]");
			if (!target) return;

			// Calculate hover duration for analytics
			const startTime = hoverStartTimes.get(target);
			if (startTime) {
				const hoverDuration = performance.now() - startTime;
				this.recordHoverMetrics(target, hoverDuration);
			}
		};

		// Global hover listeners with high performance
		document.addEventListener("mouseenter", handleMouseEnter, { passive: true, capture: true });
		document.addEventListener("mouseleave", handleMouseLeave, { passive: true, capture: true });

		// Touch support for mobile
		document.addEventListener("touchstart", (event) => {
			const target = event.target.closest("[data-business-id], a[href], [data-prefetch-images]");
			if (target) {
				// Instant prefetch on touch
				this.handleElementHover(target);
			}
		}, { passive: true });

		logger.debug("🖱️ Hover listeners setup for image prefetching");
	}

	/**
	 * Get hover delay based on element priority
	 */
	getHoverDelay(element) {
		// Business cards - instant prefetch
		if (element.hasAttribute("data-business-id")) {
			return this.hoverConfig.FAST_DELAY;
		}

		// Critical navigation links
		const href = element.getAttribute("href");
		if (href) {
			if (href.startsWith("/biz/")) return this.hoverConfig.FAST_DELAY;
			if (href.startsWith("/search")) return this.hoverConfig.NORMAL_DELAY;
			if (href.startsWith("/categories/")) return this.hoverConfig.NORMAL_DELAY;
		}

		// Custom prefetch targets
		if (element.hasAttribute("data-prefetch-images")) {
			return this.hoverConfig.INSTANT_DELAY;
		}

		return this.hoverConfig.NORMAL_DELAY;
	}

	/**
	 * Handle element hover and prefetch associated images
	 */
	async handleElementHover(element) {
		const startTime = performance.now();

		try {
			// Get images to prefetch based on element type
			const imagesToPrefetch = this.getImagesForElement(element);

			if (imagesToPrefetch.length === 0) return;

			// Queue images for prefetching
			imagesToPrefetch.forEach((imageData) => {
				this.queueImagePrefetch(imageData);
			});

			const processingTime = performance.now() - startTime;
			logger.debug(`🖼️ Queued ${imagesToPrefetch.length} images for prefetch in ${processingTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("❌ Hover image prefetch failed:", error);
		}
	}

	/**
	 * Get images to prefetch for a given element
	 */
	getImagesForElement(element) {
		const images = [];

		// Business card images
		const businessId = element.getAttribute("data-business-id");
		if (businessId) {
			images.push(
				...this.getBusinessImages(businessId)
			);
		}

		// Link-based image prefetching
		const href = element.getAttribute("href");
		if (href) {
			images.push(
				...this.getImagesForRoute(href)
			);
		}

		// Custom image prefetch targets
		const customImages = element.getAttribute("data-prefetch-images");
		if (customImages) {
			try {
				const imageList = JSON.parse(customImages);
				images.push(
					...imageList.map(url => ({
						url,
						priority: this.imagePriorities.THUMBNAILS,
						type: "custom",
					}))
				);
			} catch (error) {
				logger.warn("Invalid data-prefetch-images format:", error);
			}
		}

		return images;
	}

	/**
	 * Get images for a business
	 */
	getBusinessImages(businessId) {
		const images = [];

		// Hero image (highest priority)
		images.push({
			url: `/api/business/${businessId}/hero-image`,
			priority: this.imagePriorities.HERO_IMAGES,
			type: "hero",
			businessId,
		});

		// Thumbnail image
		images.push({
			url: `/api/business/${businessId}/thumbnail`,
			priority: this.imagePriorities.THUMBNAILS,
			type: "thumbnail",
			businessId,
		});

		// Gallery images (first 3)
		for (let i = 0; i < 3; i++) {
			images.push({
				url: `/api/business/${businessId}/photos/${i}`,
				priority: this.imagePriorities.GALLERY_IMAGES,
				type: "gallery",
				businessId,
				index: i,
			});
		}

		return images;
	}

	/**
	 * Get images for a specific route
	 */
	getImagesForRoute(href) {
		const images = [];
		const url = new URL(href, window.location.origin);

		// Business page images
		if (url.pathname.startsWith("/biz/")) {
			const businessId = url.pathname.split("/biz/")[1];
			if (businessId) {
				images.push(...this.getBusinessImages(businessId));
			}
		}

		// Search page images (popular business thumbnails)
		else if (url.pathname.startsWith("/search")) {
			images.push(...this.getPopularBusinessThumbnails());
		}

		// Category page images
		else if (url.pathname.startsWith("/categories/")) {
			const category = url.pathname.split("/categories/")[1];
			if (category) {
				images.push(...this.getCategoryImages(category));
			}
		}

		return images;
	}

	/**
	 * Get popular business thumbnails for search prefetch
	 */
	getPopularBusinessThumbnails() {
		// These would typically come from an API or cache
		const popularBusinessIds = ["1", "2", "3", "4", "5"];

		return popularBusinessIds.map(id => ({
			url: `/api/business/${id}/thumbnail`,
			priority: this.imagePriorities.THUMBNAILS,
			type: "popular_thumbnail",
			businessId: id,
		}));
	}

	/**
	 * Get images for a category
	 */
	getCategoryImages(category) {
		return [
			{
				url: `/api/categories/${category}/hero-image`,
				priority: this.imagePriorities.HERO_IMAGES,
				type: "category_hero",
				category,
			},
			{
				url: `/api/categories/${category}/featured-businesses-thumbnails`,
				priority: this.imagePriorities.THUMBNAILS,
				type: "category_thumbnails",
				category,
			},
		];
	}

	/**
	 * Queue image for prefetching
	 */
	queueImagePrefetch(imageData) {
		const { url, priority, type } = imageData;

		// Skip if already prefetched or queued
		if (this.prefetchedImages.has(url) || this.hoverQueue.has(url)) {
			return;
		}

		// Add to queue with priority
		this.hoverQueue.set(url, {
			...imageData,
			queuedAt: Date.now(),
		});

		logger.debug(`📋 Queued image: ${url} (priority: ${priority}, type: ${type})`);
	}

	/**
	 * Start prefetch queue processor
	 */
	startPrefetchProcessor() {
		// Process queue every 50ms for responsiveness
		setInterval(() => {
			this.processPrefetchQueue();
		}, 50);
	}

	/**
	 * Process prefetch queue
	 */
	async processPrefetchQueue() {
		if (this.activePreloads.size >= this.maxConcurrentLoads) return;
		if (this.hoverQueue.size === 0) return;

		// Sort by priority (lower number = higher priority)
		const sortedEntries = Array.from(this.hoverQueue.entries()).sort((a, b) => a[1].priority - b[1].priority);

		const slotsAvailable = this.maxConcurrentLoads - this.activePreloads.size;
		const itemsToProcess = sortedEntries.slice(0, slotsAvailable);

		for (const [url, imageData] of itemsToProcess) {
			this.hoverQueue.delete(url);
			this.prefetchImage(url, imageData);
		}
	}

	/**
	 * Prefetch a single image
	 */
	async prefetchImage(url, imageData) {
		if (this.activePreloads.has(url) || this.prefetchedImages.has(url)) return;

		this.activePreloads.add(url);
		const startTime = performance.now();

		try {
			// Create image element for preloading
			const img = new Image();
			img.crossOrigin = "anonymous";

			// Set up promise for load completion
			const loadPromise = new Promise((resolve, reject) => {
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
			});

			// Start loading
			img.src = url;

			// Wait for load completion
			await loadPromise;

			// Cache the loaded image
			this.cacheImage(url, img, imageData);

			// Mark as prefetched
			this.prefetchedImages.add(url);

			const loadTime = performance.now() - startTime;
			logger.debug(`✅ Prefetched image: ${url} in ${loadTime.toFixed(2)}ms (type: ${imageData.type})`);

			// Track performance metrics
			this.recordImageMetrics(url, imageData, loadTime, true);
		} catch (error) {
			logger.warn(`❌ Image prefetch failed: ${url}`, error);
			this.recordImageMetrics(url, imageData, performance.now() - startTime, false);
		} finally {
			this.activePreloads.delete(url);
		}
	}

	/**
	 * Cache loaded image
	 */
	cacheImage(url, img, imageData) {
		// Estimate image size (rough calculation)
		const estimatedSize = img.naturalWidth * img.naturalHeight * 4; // 4 bytes per pixel (RGBA)

		// Check cache size limit
		if (this.currentCacheSize + estimatedSize > this.maxCacheSize) {
			this.cleanupImageCache();
		}

		// Cache the image
		this.imageCache.set(url, {
			image: img,
			imageData,
			cachedAt: Date.now(),
			size: estimatedSize,
			hits: 0,
		});

		this.currentCacheSize += estimatedSize;

		// Also cache in browser cache
		try {
			cacheManager.memory?.set?.(`image:${url}`, url, 300000); // 5 minutes TTL
		} catch (error) {
			console.warn('Cache manager not available, skipping cache set:', error.message);
		}
	}

	/**
	 * Setup viewport-based image prefetching
	 */
	setupViewportPrefetching() {
		if (!("IntersectionObserver" in window)) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.handleViewportImage(entry.target);
					}
				});
			},
			{
				rootMargin: "300px", // Prefetch 300px before entering viewport
				threshold: 0,
			}
		);

		// Observe all images and image-containing elements
		const observeImages = () => {
			document.querySelectorAll("img[data-src], [data-business-id], [data-prefetch-images]").forEach((element) => {
				observer.observe(element);
			});
		};

		// Initial observation
		observeImages();

		// Re-observe when new content is added
		const mutationObserver = new MutationObserver(() => {
			observeImages();
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});

		logger.debug("👁️ Viewport image prefetching setup");
	}

	/**
	 * Handle image entering viewport
	 */
	handleViewportImage(element) {
		// Handle lazy-loaded images
		if (element.tagName === "IMG" && element.hasAttribute("data-src")) {
			const src = element.getAttribute("data-src");
			this.queueImagePrefetch({
				url: src,
				priority: this.imagePriorities.BACKGROUND_IMAGES,
				type: "viewport",
			});
		}

		// Handle business cards in viewport
		const businessId = element.getAttribute("data-business-id");
		if (businessId) {
			this.getBusinessImages(businessId).forEach((imageData) => {
				this.queueImagePrefetch(imageData);
			});
		}
	}

	/**
	 * Setup intelligent image discovery
	 */
	setupImageDiscovery() {
		// Discover images from API responses
		this.setupAPIResponseInterception();

		// Discover images from page content
		this.setupContentImageDiscovery();

		logger.debug("🔍 Image discovery setup");
	}

	/**
	 * Setup API response interception for image discovery
	 */
	setupAPIResponseInterception() {
		// Intercept fetch responses to discover image URLs
		const originalFetch = window.fetch;

		window.fetch = async (...args) => {
			const response = await originalFetch(...args);

			// Clone response to avoid consuming the stream
			const clonedResponse = response.clone();

			try {
				// Check if response contains JSON with image URLs
				if (response.headers.get("content-type")?.includes("application/json")) {
					const data = await clonedResponse.json();
					this.discoverImagesInData(data);
				}
			} catch (error) {
				// Ignore JSON parsing errors
			}

			return response;
		};
	}

	/**
	 * Discover images in API response data
	 */
	discoverImagesInData(data) {
		if (!data || typeof data !== "object") return;

		const findImageUrls = (obj, path = "") => {
			if (Array.isArray(obj)) {
				obj.forEach((item, index) => findImageUrls(item, `${path}[${index}]`));
				return;
			}

			if (typeof obj === "object" && obj !== null) {
				Object.entries(obj).forEach(([key, value]) => {
					const currentPath = path ? `${path}.${key}` : key;

					// Check for image URL patterns
					if (typeof value === "string" && this.isImageUrl(value)) {
						this.queueImagePrefetch({
							url: value,
							priority: this.getImagePriorityFromPath(currentPath),
							type: "api_discovered",
							discoveryPath: currentPath,
						});
					}

					// Recurse into nested objects
					if (typeof value === "object") {
						findImageUrls(value, currentPath);
					}
				});
			}
		};

		findImageUrls(data);
	}

	/**
	 * Check if URL is an image
	 */
	isImageUrl(url) {
		if (typeof url !== "string") return false;

		// Common image extensions
		const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;
		if (imageExtensions.test(url)) return true;

		// API image endpoints
		const imageEndpoints = /\/(image|photo|thumbnail|avatar|hero|gallery)/i;
		if (imageEndpoints.test(url)) return true;

		return false;
	}

	/**
	 * Get image priority from discovery path
	 */
	getImagePriorityFromPath(path) {
		if (path.includes("hero") || path.includes("main")) return this.imagePriorities.HERO_IMAGES;
		if (path.includes("thumbnail") || path.includes("thumb")) return this.imagePriorities.THUMBNAILS;
		if (path.includes("gallery") || path.includes("photos")) return this.imagePriorities.GALLERY_IMAGES;
		if (path.includes("avatar") || path.includes("profile")) return this.imagePriorities.PROFILE_IMAGES;
		return this.imagePriorities.BACKGROUND_IMAGES;
	}

	/**
	 * Setup cache management
	 */
	setupCacheManagement() {
		// Cleanup cache periodically
		setInterval(() => {
			this.cleanupImageCache();
		}, 60000); // Every minute

		// Clear cache on memory pressure
		if ("memory" in performance) {
			setInterval(() => {
				const memory = performance.memory;
				const usedMB = memory.usedJSHeapSize / 1024 / 1024;

				if (usedMB > 150) {
					// High memory usage - aggressive cleanup
					this.cleanupImageCache(true);
				}
			}, 30000);
		}
	}

	/**
	 * Cleanup image cache
	 */
	cleanupImageCache(aggressive = false) {
		const now = Date.now();
		const maxAge = aggressive ? 60000 : 300000; // 1 min aggressive, 5 min normal
		let cleaned = 0;
		let freedSize = 0;

		// Sort by last hit time and age
		const sortedEntries = Array.from(this.imageCache.entries()).sort((a, b) => {
			const aScore = a[1].hits * 1000 - (now - a[1].cachedAt);
			const bScore = b[1].hits * 1000 - (now - b[1].cachedAt);
			return aScore - bScore;
		});

		// Remove old or unused images
		for (const [url, cacheEntry] of sortedEntries) {
			const age = now - cacheEntry.cachedAt;
			const isOld = age > maxAge;
			const isUnused = cacheEntry.hits === 0 && age > 60000; // Unused for 1 minute

			if (isOld || isUnused || (aggressive && this.currentCacheSize > this.maxCacheSize * 0.7)) {
				this.imageCache.delete(url);
				this.currentCacheSize -= cacheEntry.size;
				freedSize += cacheEntry.size;
				cleaned++;

				if (!aggressive && this.currentCacheSize <= this.maxCacheSize * 0.8) {
					break; // Stop cleanup if we're under 80% capacity
				}
			}
		}

		if (cleaned > 0) {
			logger.debug(`🧹 Cleaned ${cleaned} images, freed ${(freedSize / 1024 / 1024).toFixed(2)}MB`);
		}
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Log metrics periodically
		setInterval(() => {
			const metrics = this.getPerformanceMetrics();
			logger.performance("Image prefetching metrics:", metrics);
		}, 60000); // Every minute
	}

	/**
	 * Get performance metrics
	 */
	getPerformanceMetrics() {
		return {
			prefetchedImages: this.prefetchedImages.size,
			queueSize: this.hoverQueue.size,
			activePreloads: this.activePreloads.size,
			cacheSize: this.imageCache.size,
			memoryUsage: `${(this.currentCacheSize / 1024 / 1024).toFixed(2)}MB`,
			cacheHitRate: this.calculateCacheHitRate(),
		};
	}

	/**
	 * Calculate cache hit rate
	 */
	calculateCacheHitRate() {
		if (this.imageCache.size === 0) return 0;

		const totalHits = Array.from(this.imageCache.values()).reduce((sum, entry) => sum + entry.hits, 0);
		return ((totalHits / this.imageCache.size) * 100).toFixed(1) + "%";
	}

	/**
	 * Record hover metrics
	 */
	recordHoverMetrics(element, hoverDuration) {
		const businessId = element.getAttribute("data-business-id");
		const href = element.getAttribute("href");

		logger.debug("Hover metrics:", {
			businessId,
			href,
			hoverDuration: hoverDuration.toFixed(2) + "ms",
			elementType: element.tagName,
		});
	}

	/**
	 * Record image metrics
	 */
	recordImageMetrics(url, imageData, loadTime, success) {
		logger.debug("Image metrics:", {
			url,
			type: imageData.type,
			priority: imageData.priority,
			loadTime: loadTime.toFixed(2) + "ms",
			success,
		});
	}

	/**
	 * Get cached image
	 */
	getCachedImage(url) {
		const cached = this.imageCache.get(url);
		if (cached) {
			cached.hits++;
			return cached.image;
		}
		return null;
	}

	/**
	 * Destroy image prefetcher
	 */
	destroy() {
		this.prefetchedImages.clear();
		this.hoverQueue.clear();
		this.activePreloads.clear();
		this.imageCache.clear();
		this.currentCacheSize = 0;
		this.isInitialized = false;
		logger.info("🧹 Image hover prefetcher destroyed");
	}
}

// Create and export singleton
const imageHoverPrefetcher = new ImageHoverPrefetcher();

export default imageHoverPrefetcher;