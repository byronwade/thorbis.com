// lib/utils/partialPrerendering.js - Partial Prerendering (PPR) Implementation
import logger from "./logger.js";
import cacheManager from "./cache-manager";
import edgeStreamingManager from "./edge-streaming";
import instantPageLoader from "./instant-page-loader";
import ultraAggressivePrefetcher from "./ultra-aggressive-prefetching";

/**
 * Partial Prerendering (PPR) System
 * Combines static shell serving with dynamic content streaming
 * Based on Next.js 15 PPR concepts and Vercel's architecture
 */
class PartialPrerenderingManager {
	constructor() {
		this.isInitialized = false;
		this.staticShells = new Map(); // Pre-rendered static shells
		this.dynamicComponents = new Map(); // Dynamic component registry
		this.streamingQueue = new Map(); // Queue for streaming operations
		this.renderCache = new Map(); // Cache for rendered components
		this.routeConfigs = new Map(); // Route-specific configurations

		// PPR Configuration for different route types
		this.pprConfigs = {
			"/": {
				type: "HOME_PAGE",
				staticShell: true,
				dynamicComponents: ["featuredBusinesses", "categories", "trending", "testimonials"],
				preloadStrategy: "aggressive",
				cacheStrategy: "edge",
				streamingPriority: ["featuredBusinesses", "categories", "trending", "testimonials"],
				shellTTL: 300000, // 5 minutes
			},
			"/search": {
				type: "SEARCH_PAGE",
				staticShell: true,
				dynamicComponents: ["searchResults", "suggestions", "filters", "advertisements"],
				preloadStrategy: "instant",
				cacheStrategy: "memory",
				streamingPriority: ["searchResults", "suggestions", "filters", "advertisements"],
				shellTTL: 180000, // 3 minutes
			},
			"/biz/[slug]": {
				type: "BUSINESS_PAGE",
				staticShell: true,
				dynamicComponents: ["businessInfo", "photos", "reviews", "menu", "relatedBusinesses", "offers"],
				preloadStrategy: "aggressive",
				cacheStrategy: "hybrid",
				streamingPriority: ["businessInfo", "photos", "reviews", "menu", "relatedBusinesses", "offers"],
				shellTTL: 600000, // 10 minutes
			},
			"/categories/[slug]": {
				type: "CATEGORY_PAGE",
				staticShell: true,
				dynamicComponents: ["categoryBusinesses", "subcategories", "featuredBusinesses", "filters"],
				preloadStrategy: "moderate",
				cacheStrategy: "edge",
				streamingPriority: ["categoryBusinesses", "subcategories", "featuredBusinesses", "filters"],
				shellTTL: 900000, // 15 minutes
			},
		};

		// Streaming strategies
		this.streamingStrategies = {
			instant: { delay: 0, chunkSize: 1, concurrent: 3 },
			fast: { delay: 50, chunkSize: 2, concurrent: 2 },
			moderate: { delay: 100, chunkSize: 3, concurrent: 2 },
			background: { delay: 500, chunkSize: 5, concurrent: 1 },
		};

		logger.info("🎯 Partial Prerendering Manager created");
	}

	/**
	 * Initialize PPR system
	 */
	async init() {
		if (this.isInitialized) return;

		try {
			logger.info("🚀 Initializing Partial Prerendering...");

			// Initialize dependencies
			await this.initializeDependencies();

			// Setup route configurations
			this.setupRouteConfigurations();

			// Generate static shells
			await this.generateStaticShells();

			// Setup dynamic component registry
			this.setupDynamicComponents();

			// Setup streaming system
			this.setupStreamingSystem();

			// Setup PPR navigation handlers
			this.setupPPRNavigation();

			// Setup performance monitoring
			this.setupPPRMonitoring();

			this.isInitialized = true;
			logger.info("✅ Partial Prerendering initialized");
		} catch (error) {
			logger.error("❌ PPR initialization failed:", error);
		}
	}

	/**
	 * Initialize dependencies
	 */
	async initializeDependencies() {
		// Initialize edge streaming
		await edgeStreamingManager.init();

		// Initialize ultra-aggressive prefetcher
		await ultraAggressivePrefetcher.init();

		// Initialize instant page loader
		await instantPageLoader.init();

		logger.debug("🔗 PPR dependencies initialized");
	}

	/**
	 * Setup route configurations
	 */
	setupRouteConfigurations() {
		for (const [route, config] of Object.entries(this.pprConfigs)) {
			this.routeConfigs.set(route, {
				...config,
				lastGenerated: 0,
				hitCount: 0,
				avgRenderTime: 0,
			});
		}

		logger.debug("🗺️ Route configurations setup");
	}

	/**
	 * Generate static shells for all configured routes
	 */
	async generateStaticShells() {
		logger.debug("🏗️ Generating static shells...");

		const shellPromises = Array.from(this.routeConfigs.entries()).map(async ([route, config]) => {
			try {
				await this.generateShellForRoute(route, config);
			} catch (error) {
				logger.error(`Shell generation failed for ${route}:`, error);
			}
		});

		await Promise.allSettled(shellPromises);
		logger.info(`✅ Generated ${this.staticShells.size} static shells`);
	}

	/**
	 * Generate shell for specific route
	 */
	async generateShellForRoute(route, config) {
		const startTime = performance.now();

		// Generate shell HTML
		const shell = await this.createStaticShell(route, config);

		// Store shell with metadata
		this.staticShells.set(route, {
			html: shell,
			config: config,
			generated: Date.now(),
			size: shell.length,
			route: route,
		});

		// Cache the shell
		try {
			cacheManager.memory?.set?.(`ppr-shell:${route}`, shell, config.shellTTL);
		} catch (error) {
			console.warn('Cache manager not available, skipping cache set:', error.message);
		}

		const generateTime = performance.now() - startTime;
		config.lastGenerated = Date.now();
		config.avgRenderTime = generateTime;

		logger.debug(`🏗️ Shell generated for ${route} in ${generateTime.toFixed(2)}ms`);
	}

	/**
	 * Create static shell HTML
	 */
	async createStaticShell(route, config) {
		// Use edge streaming manager to create the shell
		const shell = edgeStreamingManager.getShell(route, config.type);

		if (shell) {
			return this.enhanceShellWithPPR(shell, route, config);
		}

		// Fallback shell generation
		return this.createFallbackShell(route, config);
	}

	/**
	 * Enhance shell with PPR-specific features
	 */
	enhanceShellWithPPR(shell, route, config) {
		// Add PPR metadata
		const pprMetadata = `
			<script type="application/json" id="ppr-metadata">
				${JSON.stringify({
					route: route,
					type: config.type,
					dynamicComponents: config.dynamicComponents,
					streamingPriority: config.streamingPriority,
					preloadStrategy: config.preloadStrategy,
					generated: Date.now(),
				})}
			</script>
		`;

		// Add PPR streaming script
		const pprScript = this.generatePPRScript(config);

		// Combine shell with PPR enhancements
		return `
			${shell}
			${pprMetadata}
			${pprScript}
		`;
	}

	/**
	 * Generate PPR streaming script
	 */
	generatePPRScript(config) {
		return `
			<script>
				(function() {
					// PPR Streaming System
					const PPR = {
						config: ${JSON.stringify(config)},
						startTime: performance.now(),
						loadedComponents: new Set(),
						streamingQueue: [],
						
						// Initialize PPR streaming
						init: function() {
							this.setupStreamingObserver();
							this.startComponentStreaming();
							this.setupPerformanceTracking();
						},
						
						// Setup intersection observer for dynamic components
						setupStreamingObserver: function() {
							if (!('IntersectionObserver' in window)) return;
							
							const observer = new IntersectionObserver((entries) => {
								entries.forEach(entry => {
									if (entry.isIntersecting) {
										const componentId = entry.target.getAttribute('data-component');
										if (componentId && !this.loadedComponents.has(componentId)) {
											this.streamComponent(componentId);
										}
									}
								});
							}, { rootMargin: '100px' });
							
							// Observe all dynamic component placeholders
							document.querySelectorAll('[data-component]').forEach(el => {
								observer.observe(el);
							});
						},
						
						// Start streaming components by priority
						startComponentStreaming: function() {
							const priority = this.config.streamingPriority || [];
							
							priority.forEach((componentId, index) => {
								const delay = index * 50; // Stagger by 50ms
								setTimeout(() => {
									this.streamComponent(componentId);
								}, delay);
							});
						},
						
						// Stream individual component
						streamComponent: async function(componentId) {
							if (this.loadedComponents.has(componentId)) return;
							
							const placeholder = document.querySelector('[data-component="' + componentId + '"]');
							if (!placeholder) return;
							
							this.loadedComponents.add(componentId);
							this.showStreamingIndicator(placeholder);
							
							try {
								const content = await this.fetchComponentContent(componentId);
								this.replaceComponent(placeholder, content);
								this.hideStreamingIndicator(placeholder);
							} catch (error) {
								console.warn('Component streaming failed:', componentId, error);
								this.showErrorState(placeholder);
							}
						},
						
						// Fetch component content
						fetchComponentContent: async function(componentId) {
							const endpoint = '/api/ppr/component/' + componentId;
							const response = await fetch(endpoint, {
								headers: {
									'X-PPR-Route': window.location.pathname,
									'X-Component-ID': componentId
								}
							});
							
							if (!response.ok) {
								throw new Error('HTTP ' + response.status);
							}
							
							return await response.text();
						},
						
						// Replace component placeholder with content
						replaceComponent: function(placeholder, content) {
							const wrapper = document.createElement('div');
							wrapper.innerHTML = content;
							
							// Smooth transition
							placeholder.style.opacity = '0';
							setTimeout(() => {
								placeholder.innerHTML = wrapper.innerHTML;
								placeholder.style.opacity = '1';
								placeholder.classList.add('ppr-loaded');
								
								// Dispatch custom event
								placeholder.dispatchEvent(new CustomEvent('ppr:loaded', {
									detail: { componentId: placeholder.getAttribute('data-component') }
								}));
							}, 150);
						},
						
						// Show streaming indicator
						showStreamingIndicator: function(element) {
							const indicator = document.createElement('div');
							indicator.className = 'ppr-streaming-indicator';
							indicator.innerHTML = '🌊 Loading...';
							element.appendChild(indicator);
						},
						
						// Hide streaming indicator
						hideStreamingIndicator: function(element) {
							const indicator = element.querySelector('.ppr-streaming-indicator');
							if (indicator) indicator.remove();
						},
						
						// Show error state
						showErrorState: function(element) {
							element.innerHTML = '<div class="ppr-error">⚠️ Failed to load content</div>';
						},
						
						// Setup performance tracking
						setupPerformanceTracking: function() {
							// Track when all components are loaded
							document.addEventListener('ppr:loaded', () => {
								if (this.loadedComponents.size === this.config.dynamicComponents.length) {
									const totalTime = performance.now() - this.startTime;
									console.log('🎯 PPR streaming completed in', totalTime.toFixed(2), 'ms');
									
									// Track performance metric
									if (typeof gtag !== 'undefined') {
										gtag('event', 'ppr_complete', {
											value: Math.round(totalTime),
											custom_map: { route: window.location.pathname }
										});
									}
								}
							});
						}
					};
					
					// Initialize PPR when DOM is ready
					if (document.readyState === 'loading') {
						document.addEventListener('DOMContentLoaded', () => PPR.init());
					} else {
						PPR.init();
					}
					
					// Make PPR available globally
					window.PPR = PPR;
				})();
			</script>
		`;
	}

	/**
	 * Setup dynamic component registry
	 */
	setupDynamicComponents() {
		const components = {
			// Business page components
			businessInfo: {
				endpoint: "/api/business/[id]",
				priority: 1,
				cacheTTL: 300000,
				streamingStrategy: "instant",
			},
			photos: {
				endpoint: "/api/business/[id]/photos",
				priority: 2,
				cacheTTL: 600000,
				streamingStrategy: "fast",
			},
			reviews: {
				endpoint: "/api/business/[id]/reviews",
				priority: 3,
				cacheTTL: 180000,
				streamingStrategy: "moderate",
			},
			menu: {
				endpoint: "/api/business/[id]/menu",
				priority: 2,
				cacheTTL: 900000,
				streamingStrategy: "fast",
			},
			relatedBusinesses: {
				endpoint: "/api/business/[id]/related",
				priority: 4,
				cacheTTL: 300000,
				streamingStrategy: "background",
			},

			// Search page components
			searchResults: {
				endpoint: "/api/business/search",
				priority: 1,
				cacheTTL: 60000,
				streamingStrategy: "instant",
			},
			suggestions: {
				endpoint: "/api/search/suggestions",
				priority: 2,
				cacheTTL: 300000,
				streamingStrategy: "fast",
			},
			filters: {
				endpoint: "/api/search/filters",
				priority: 3,
				cacheTTL: 600000,
				streamingStrategy: "moderate",
			},

			// Home page components
			featuredBusinesses: {
				endpoint: "/api/business/featured",
				priority: 1,
				cacheTTL: 300000,
				streamingStrategy: "instant",
			},
			categories: {
				endpoint: "/api/categories/popular",
				priority: 2,
				cacheTTL: 900000,
				streamingStrategy: "fast",
			},
			trending: {
				endpoint: "/api/business/trending",
				priority: 3,
				cacheTTL: 180000,
				streamingStrategy: "moderate",
			},
		};

		for (const [name, component] of Object.entries(components)) {
			this.dynamicComponents.set(name, component);
		}

		logger.debug(`📦 Registered ${this.dynamicComponents.size} dynamic components`);
	}

	/**
	 * Setup streaming system
	 */
	setupStreamingSystem() {
		// Setup streaming queue processor
		this.startStreamingProcessor();

		// Setup component preloading
		this.setupComponentPreloading();

		logger.debug("🌊 Streaming system setup");
	}

	/**
	 * Start streaming queue processor
	 */
	startStreamingProcessor() {
		setInterval(() => {
			this.processStreamingQueue();
		}, 50); // Process every 50ms for responsiveness
	}

	/**
	 * Process streaming queue
	 */
	async processStreamingQueue() {
		if (this.streamingQueue.size === 0) return;

		const entries = Array.from(this.streamingQueue.entries());
		const prioritySorted = entries.sort((a, b) => a[1].priority - b[1].priority);

		// Process top 3 items
		const itemsToProcess = prioritySorted.slice(0, 3);

		for (const [key, item] of itemsToProcess) {
			this.streamingQueue.delete(key);
			await this.executeComponentStreaming(item);
		}
	}

	/**
	 * Execute component streaming
	 */
	async executeComponentStreaming(item) {
		const { componentId, route, priority, strategy } = item;
		const startTime = performance.now();

		try {
			// Get component configuration
			const component = this.dynamicComponents.get(componentId);
			if (!component) return;

			// Build endpoint URL
			const endpoint = this.buildComponentEndpoint(component.endpoint, route);

			// Fetch component data
			const data = await this.fetchComponentData(endpoint, componentId);

			// Cache the result
			this.cacheComponentData(componentId, route, data, component.cacheTTL);

			const streamTime = performance.now() - startTime;
			logger.debug(`🌊 Streamed ${componentId} in ${streamTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error(`❌ Component streaming failed: ${componentId}`, error);
		}
	}

	/**
	 * Setup PPR navigation
	 */
	setupPPRNavigation() {
		// Intercept navigation for PPR
		this.interceptNavigation();

		// Setup PPR prefetching
		this.setupPPRPrefetching();

		logger.debug("🧭 PPR navigation setup");
	}

	/**
	 * Intercept navigation for PPR handling
	 */
	interceptNavigation() {
		// Override history API
		const originalPushState = history.pushState;
		const originalReplaceState = history.replaceState;

		history.pushState = (...args) => {
			this.handlePPRNavigation(args[2]);
			originalPushState.apply(history, args);
		};

		history.replaceState = (...args) => {
			this.handlePPRNavigation(args[2]);
			originalReplaceState.apply(history, args);
		};

		// Handle back/forward navigation
		window.addEventListener("popstate", (event) => {
			this.handlePPRNavigation(window.location.pathname);
		});
	}

	/**
	 * Handle PPR navigation
	 */
	async handlePPRNavigation(path) {
		const startTime = performance.now();

		try {
			// Find matching route configuration
			const routeConfig = this.findRouteConfig(path);
			if (!routeConfig) {
				// Fallback to regular navigation
				return;
			}

			// Get static shell
			const shell = await this.getStaticShell(routeConfig.route, routeConfig.config);
			if (!shell) {
				return;
			}

			// Render shell immediately
			this.renderStaticShell(shell);

			// Start streaming dynamic components
			this.startDynamicStreaming(path, routeConfig.config);

			const navigationTime = performance.now() - startTime;
			logger.performance(`🎯 PPR navigation to ${path} in ${navigationTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("❌ PPR navigation failed:", error);
		}
	}

	/**
	 * Find route configuration for path
	 */
	findRouteConfig(path) {
		// Exact match first
		for (const [route, config] of this.routeConfigs.entries()) {
			if (route === path) {
				return { route, config };
			}
		}

		// Pattern matching
		for (const [route, config] of this.routeConfigs.entries()) {
			if (this.matchesRoute(path, route)) {
				return { route, config };
			}
		}

		return null;
	}

	/**
	 * Check if path matches route pattern
	 */
	matchesRoute(path, route) {
		// Simple pattern matching for [id] and [slug]
		const routePattern = route.replace(/\[.*?\]/g, "[^/]+");
		const regex = new RegExp(`^${routePattern}$`);
		return regex.test(path);
	}

	/**
	 * Get static shell for route
	 */
	async getStaticShell(route, config) {
		// Check memory cache first
		let cached = null;
		try {
			cached = cacheManager.memory?.get?.(`ppr-shell:${route}`) || null;
		} catch (error) {
			console.warn('Cache manager not available, skipping cache check:', error.message);
			cached = null;
		}
		if (cached) {
			return cached;
		}

		// Check static shells
		const shell = this.staticShells.get(route);
		if (shell && Date.now() - shell.generated < config.shellTTL) {
			return shell.html;
		}

		// Generate new shell
		await this.generateShellForRoute(route, config);
		const newShell = this.staticShells.get(route);
		return newShell ? newShell.html : null;
	}

	/**
	 * Setup PPR monitoring
	 */
	setupPPRMonitoring() {
		// Track PPR performance metrics
		setInterval(() => {
			const metrics = this.getPPRMetrics();
			logger.performance("PPR metrics:", metrics);
		}, 60000); // Every minute

		// Track Core Web Vitals impact
		this.trackWebVitalsImpact();

		logger.debug("📊 PPR monitoring setup");
	}

	/**
	 * Get PPR performance metrics
	 */
	getPPRMetrics() {
		return {
			staticShells: this.staticShells.size,
			dynamicComponents: this.dynamicComponents.size,
			streamingQueue: this.streamingQueue.size,
			renderCache: this.renderCache.size,
			routeConfigs: this.routeConfigs.size,
			memoryUsage: this.calculateMemoryUsage(),
		};
	}

	/**
	 * Calculate memory usage
	 */
	calculateMemoryUsage() {
		let totalSize = 0;

		// Calculate shell sizes
		for (const shell of this.staticShells.values()) {
			totalSize += shell.size || 0;
		}

		// Calculate cache sizes
		for (const cache of this.renderCache.values()) {
			totalSize += JSON.stringify(cache).length;
		}

		return `${(totalSize / 1024).toFixed(2)}KB`;
	}

	/**
	 * Track Web Vitals impact
	 */
	trackWebVitalsImpact() {
		// This would integrate with web vitals tracking
		logger.debug("📈 Web Vitals impact tracking enabled");
	}

	/**
	 * Destroy PPR system
	 */
	destroy() {
		this.staticShells.clear();
		this.dynamicComponents.clear();
		this.streamingQueue.clear();
		this.renderCache.clear();
		this.routeConfigs.clear();
		this.isInitialized = false;
		logger.info("🧹 Partial Prerendering destroyed");
	}
}

// Create and export singleton
const partialPrerenderingManager = new PartialPrerenderingManager();

export default partialPrerenderingManager;
