// lib/utils/edgeStreaming.js - Edge-Level Streaming and Static Shell Serving
import logger from "./logger.js";

/**
 * Edge Streaming System - Simulates Partial Prerendering (PPR)
 * Serves static shells instantly while streaming dynamic content
 * Based on Next.js 15 PPR concepts and Vercel Edge Functions
 */
class EdgeStreamingManager {
	constructor() {
		this.staticShells = new Map(); // Pre-rendered page shells
		this.streamingComponents = new Map(); // Dynamic components to stream
		this.pendingStreams = new Map(); // Active streaming operations
		this.shellCache = new Map(); // Cache for shells
		this.isInitialized = false;

		// Shell configurations for different page types
		this.shellConfigs = {
			BUSINESS_PAGE: {
				staticElements: ["header", "navigation", "footer", "skeleton"],
				dynamicElements: ["businessInfo", "photos", "reviews", "menu", "relatedBusinesses"],
				priority: ["businessInfo", "photos", "reviews", "menu", "relatedBusinesses"],
				shellTTL: 300000, // 5 minutes
			},
			SEARCH_PAGE: {
				staticElements: ["header", "navigation", "searchForm", "filters", "footer"],
				dynamicElements: ["searchResults", "suggestions", "advertisements"],
				priority: ["searchResults", "suggestions", "advertisements"],
				shellTTL: 180000, // 3 minutes
			},
			CATEGORY_PAGE: {
				staticElements: ["header", "navigation", "categoryHeader", "footer"],
				dynamicElements: ["categoryBusinesses", "subcategories", "featuredBusinesses"],
				priority: ["categoryBusinesses", "subcategories", "featuredBusinesses"],
				shellTTL: 600000, // 10 minutes
			},
			HOME_PAGE: {
				staticElements: ["header", "hero", "navigation", "footer"],
				dynamicElements: ["featuredBusinesses", "categories", "testimonials", "trending"],
				priority: ["featuredBusinesses", "categories", "trending", "testimonials"],
				shellTTL: 300000, // 5 minutes
			},
		};

		logger.info("🌊 Edge Streaming Manager created");
	}

	/**
	 * Initialize edge streaming system
	 */
	async init() {
		if (this.isInitialized) return;

		try {
			logger.info("⚡ Initializing edge streaming...");

			// Pre-generate static shells for common pages
			await this.generateStaticShells();

			// Setup streaming handlers
			this.setupStreamingHandlers();

			// Setup shell caching
			this.setupShellCaching();

			// Setup performance monitoring
			this.setupStreamingMonitoring();

			this.isInitialized = true;
			logger.info("✅ Edge streaming initialized");
		} catch (error) {
			logger.error("❌ Edge streaming initialization failed:", error);
		}
	}

	/**
	 * Generate static shells for common page types
	 */
	async generateStaticShells() {
		const commonPaths = [
			{ path: "/", type: "HOME_PAGE" },
			{ path: "/search", type: "SEARCH_PAGE" },
			{ path: "/biz/template", type: "BUSINESS_PAGE" },
			{ path: "/categories/template", type: "CATEGORY_PAGE" },
		];

		for (const { path, type } of commonPaths) {
			await this.generateShellForType(path, type);
		}

		logger.debug("🏗️ Static shells generated for common pages");
	}

	/**
	 * Generate shell for specific page type
	 */
	async generateShellForType(path, pageType) {
		const config = this.shellConfigs[pageType];
		if (!config) return;

		const shell = this.createPageShell(pageType, config);
		this.staticShells.set(path, {
			html: shell,
			config: config,
			generated: Date.now(),
			type: pageType,
		});

		// Cache the shell
		this.shellCache.set(path, shell);

		logger.debug(`🏗️ Generated shell for ${path} (${pageType})`);
	}

	/**
	 * Create page shell HTML
	 */
	createPageShell(pageType, config) {
		const shellId = `shell-${pageType.toLowerCase()}-${Date.now()}`;

		// Base shell structure
		let shell = `
			<div id="${shellId}" class="page-shell ${pageType.toLowerCase()}-shell">
				${this.generateStaticHeader()}
				${this.generateNavigationShell()}
				<main class="main-content">
					${this.generateMainContentShell(pageType, config)}
				</main>
				${this.generateStaticFooter()}
			</div>
			${this.generateStreamingScript(shellId, config)}
		`;

		return shell;
	}

	/**
	 * Generate static header HTML
	 */
	generateStaticHeader() {
		return `
			<header class="site-header bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
				<div class="max-w-7xl mx-auto px-4 py-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<div class="logo">
								<div class="w-32 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
							</div>
						</div>
						<div class="flex items-center space-x-4">
							<div class="hidden md:block w-64 h-10 bg-muted rounded-lg"></div>
							<div class="w-10 h-10 bg-muted rounded-full"></div>
						</div>
					</div>
				</div>
			</header>
		`;
	}

	/**
	 * Generate navigation shell
	 */
	generateNavigationShell() {
		return `
			<nav class="site-navigation bg-gray-50 border-b mt-16">
				<div class="max-w-7xl mx-auto px-4 py-2">
					<div class="flex space-x-6">
						${Array.from(
							{ length: 6 },
							(_, i) => `
							<div class="h-6 bg-muted rounded" style="width: ${60 + i * 20}px"></div>
						`
						).join("")}
					</div>
				</div>
			</nav>
		`;
	}

	/**
	 * Generate main content shell based on page type
	 */
	generateMainContentShell(pageType, config) {
		switch (pageType) {
			case "BUSINESS_PAGE":
				return this.generateBusinessPageShell();
			case "SEARCH_PAGE":
				return this.generateSearchPageShell();
			case "CATEGORY_PAGE":
				return this.generateCategoryPageShell();
			case "HOME_PAGE":
				return this.generateHomePageShell();
			default:
				return this.generateGenericPageShell();
		}
	}

	/**
	 * Generate business page shell
	 */
	generateBusinessPageShell() {
		return `
			<div class="business-page-shell">
				<!-- Hero Section Skeleton -->
				<div class="business-hero bg-gradient-to-r from-blue-50 to-indigo-50 p-8 mb-6">
					<div class="max-w-7xl mx-auto">
						<div class="flex items-start space-x-6">
							<div class="w-32 h-32 bg-muted rounded-lg shimmer"></div>
							<div class="flex-1">
								<div class="h-8 bg-muted rounded shimmer mb-3" style="width: 60%"></div>
								<div class="h-4 bg-muted rounded shimmer mb-2" style="width: 40%"></div>
								<div class="flex space-x-2 mb-4">
									<div class="h-4 bg-muted-foreground/20 rounded shimmer" style="width: 100px"></div>
									<div class="h-4 bg-muted rounded shimmer" style="width: 80px"></div>
								</div>
								<div class="flex space-x-3">
																	<div class="h-10 bg-primary/20 rounded shimmer" style="width: 100px"></div>
								<div class="h-10 bg-primary/20 rounded shimmer" style="width: 80px"></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Content Sections -->
				<div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Main Content -->
					<div class="lg:col-span-2 space-y-6">
						<!-- About Section -->
						<div id="business-info-placeholder" class="bg-white p-6 rounded-lg shadow-sm">
							<div class="h-6 bg-muted rounded shimmer mb-4" style="width: 30%"></div>
							<div class="space-y-2">
								<div class="h-4 bg-muted rounded shimmer"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 90%"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 85%"></div>
							</div>
						</div>

						<!-- Photos Section -->
						<div id="photos-placeholder" class="bg-white p-6 rounded-lg shadow-sm">
							<div class="h-6 bg-muted rounded shimmer mb-4" style="width: 20%"></div>
							<div class="grid grid-cols-3 gap-4">
								${Array.from(
									{ length: 6 },
									() => `
									<div class="aspect-square bg-muted rounded-lg shimmer"></div>
								`
								).join("")}
							</div>
						</div>

						<!-- Reviews Section -->
						<div id="reviews-placeholder" class="bg-white p-6 rounded-lg shadow-sm">
							<div class="h-6 bg-muted rounded shimmer mb-4" style="width: 25%"></div>
							<div class="space-y-4">
								${Array.from(
									{ length: 3 },
									() => `
									<div class="border-b pb-4">
										<div class="flex items-center space-x-3 mb-2">
											<div class="w-10 h-10 bg-muted rounded-full shimmer"></div>
											<div>
												<div class="h-4 bg-muted rounded shimmer" style="width: 120px"></div>
												<div class="h-3 bg-muted-foreground/20 rounded shimmer mt-1" style="width: 80px"></div>
											</div>
										</div>
										<div class="space-y-2">
											<div class="h-3 bg-muted rounded shimmer"></div>
											<div class="h-3 bg-muted rounded shimmer" style="width: 85%"></div>
										</div>
									</div>
								`
								).join("")}
							</div>
						</div>
					</div>

					<!-- Sidebar -->
					<div class="space-y-6">
						<!-- Contact Info -->
						<div class="bg-white p-6 rounded-lg shadow-sm">
							<div class="h-6 bg-muted rounded shimmer mb-4" style="width: 40%"></div>
							<div class="space-y-3">
								<div class="h-4 bg-muted rounded shimmer" style="width: 70%"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 60%"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 80%"></div>
							</div>
						</div>

						<!-- Related Businesses -->
						<div id="related-businesses-placeholder" class="bg-white p-6 rounded-lg shadow-sm">
							<div class="h-6 bg-muted rounded shimmer mb-4" style="width: 50%"></div>
							<div class="space-y-3">
								${Array.from(
									{ length: 3 },
									() => `
									<div class="flex space-x-3">
										<div class="w-16 h-16 bg-muted rounded shimmer"></div>
										<div class="flex-1">
											<div class="h-4 bg-muted rounded shimmer mb-1" style="width: 80%"></div>
											<div class="h-3 bg-muted rounded shimmer" style="width: 60%"></div>
										</div>
									</div>
								`
								).join("")}
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Generate search page shell
	 */
	generateSearchPageShell() {
		return `
			<div class="search-page-shell">
				<!-- Search Header -->
				<div class="search-header bg-white shadow-sm p-6">
					<div class="max-w-7xl mx-auto">
						<div class="flex items-center space-x-4">
							<div class="flex-1 h-12 bg-muted rounded-lg shimmer"></div>
															<div class="w-24 h-12 bg-primary/20 rounded-lg shimmer"></div>
						</div>
						<!-- Filters -->
						<div class="flex space-x-4 mt-4">
							${Array.from(
								{ length: 5 },
								(_, i) => `
								<div class="h-8 bg-muted rounded-full shimmer" style="width: ${80 + i * 20}px"></div>
							`
							).join("")}
						</div>
					</div>
				</div>

				<!-- Search Results -->
				<div class="max-w-7xl mx-auto px-4 py-6">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						${Array.from(
							{ length: 9 },
							() => `
							<div class="bg-white rounded-lg shadow-sm p-4 shimmer-container">
								<div class="w-full h-32 bg-muted rounded shimmer mb-3"></div>
								<div class="h-5 bg-muted rounded shimmer mb-2" style="width: 80%"></div>
								<div class="h-4 bg-muted rounded shimmer mb-2" style="width: 60%"></div>
								<div class="flex items-center space-x-2">
									<div class="h-4 bg-muted-foreground/20 rounded shimmer" style="width: 60px"></div>
									<div class="h-4 bg-muted rounded shimmer" style="width: 40px"></div>
								</div>
							</div>
						`
						).join("")}
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Generate category page shell
	 */
	generateCategoryPageShell() {
		return `
			<div class="category-page-shell">
				<!-- Category Header -->
				<div class="category-header bg-gradient-to-r from-purple-50 to-pink-50 p-8">
					<div class="max-w-7xl mx-auto">
						<div class="h-10 bg-muted rounded shimmer mb-4" style="width: 40%"></div>
						<div class="h-4 bg-muted rounded shimmer" style="width: 60%"></div>
					</div>
				</div>

				<!-- Subcategories -->
				<div class="max-w-7xl mx-auto px-4 py-6">
					<div class="h-6 bg-muted rounded shimmer mb-6" style="width: 30%"></div>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
						${Array.from(
							{ length: 8 },
							() => `
							<div class="bg-white p-4 rounded-lg shadow-sm text-center">
								<div class="w-12 h-12 bg-muted rounded-full shimmer mx-auto mb-2"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 70%; margin: 0 auto;"></div>
							</div>
						`
						).join("")}
					</div>

					<!-- Category Businesses -->
					<div id="category-businesses-placeholder">
						<div class="h-6 bg-muted rounded shimmer mb-6" style="width: 35%"></div>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							${Array.from(
								{ length: 12 },
								() => `
								<div class="bg-white rounded-lg shadow-sm p-4">
									<div class="w-full h-32 bg-muted rounded shimmer mb-3"></div>
									<div class="h-5 bg-muted rounded shimmer mb-2" style="width: 75%"></div>
									<div class="h-4 bg-muted rounded shimmer mb-2" style="width: 55%"></div>
									<div class="flex items-center space-x-2">
										<div class="h-4 bg-muted-foreground/20 rounded shimmer" style="width: 60px"></div>
										<div class="h-4 bg-muted rounded shimmer" style="width: 40px"></div>
									</div>
								</div>
							`
							).join("")}
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Generate home page shell
	 */
	generateHomePageShell() {
		return `
			<div class="home-page-shell">
				<!-- Hero Section -->
				<div class="hero-section bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
					<div class="max-w-7xl mx-auto px-4 text-center">
						<div class="h-12 bg-white bg-opacity-20 rounded shimmer mb-6 mx-auto" style="width: 60%"></div>
						<div class="h-6 bg-white bg-opacity-20 rounded shimmer mb-8 mx-auto" style="width: 40%"></div>
						<div class="max-w-md mx-auto flex">
							<div class="flex-1 h-12 bg-white bg-opacity-20 rounded-l shimmer"></div>
							<div class="w-32 h-12 bg-white bg-opacity-30 rounded-r shimmer"></div>
						</div>
					</div>
				</div>

				<!-- Featured Categories -->
				<div class="max-w-7xl mx-auto px-4 py-12">
					<div class="h-8 bg-muted rounded shimmer mb-8 mx-auto" style="width: 40%"></div>
					<div class="grid grid-cols-3 md:grid-cols-6 gap-6">
						${Array.from(
							{ length: 6 },
							() => `
							<div class="text-center">
								<div class="w-16 h-16 bg-muted rounded-full shimmer mx-auto mb-3"></div>
								<div class="h-4 bg-muted rounded shimmer" style="width: 80%; margin: 0 auto;"></div>
							</div>
						`
						).join("")}
					</div>
				</div>

				<!-- Featured Businesses -->
				<div id="featured-businesses-placeholder" class="max-w-7xl mx-auto px-4 py-12">
					<div class="h-8 bg-muted rounded shimmer mb-8" style="width: 35%"></div>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
						${Array.from(
							{ length: 6 },
							() => `
							<div class="bg-white rounded-lg shadow-sm overflow-hidden">
								<div class="w-full h-48 bg-muted shimmer"></div>
								<div class="p-4">
									<div class="h-6 bg-muted rounded shimmer mb-2" style="width: 80%"></div>
									<div class="h-4 bg-muted rounded shimmer mb-2" style="width: 60%"></div>
									<div class="flex items-center space-x-2">
										<div class="h-4 bg-muted-foreground/20 rounded shimmer" style="width: 80px"></div>
										<div class="h-4 bg-muted rounded shimmer" style="width: 50px"></div>
									</div>
								</div>
							</div>
						`
						).join("")}
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Generate static footer
	 */
	generateStaticFooter() {
		return `
			<footer class="site-footer bg-card text-white py-12 mt-16">
				<div class="max-w-7xl mx-auto px-4">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
						${Array.from(
							{ length: 4 },
							() => `
							<div>
								<div class="h-5 bg-muted rounded shimmer mb-4" style="width: 60%"></div>
								<div class="space-y-2">
									${Array.from(
										{ length: 5 },
										(_, i) => `
										<div class="h-4 bg-muted rounded shimmer" style="width: ${60 + i * 10}%"></div>
									`
									).join("")}
								</div>
							</div>
						`
						).join("")}
					</div>
				</div>
			</footer>
		`;
	}

	/**
	 * Generate streaming script for dynamic content
	 */
	generateStreamingScript(shellId, config) {
		return `
			<script>
				(function() {
					// Initialize streaming for shell: ${shellId}
					const shell = document.getElementById('${shellId}');
					if (!shell) return;

					const streamingConfig = ${JSON.stringify(config)};
					const startTime = performance.now();

					// Stream in dynamic content
					const streamContent = async () => {
						const dynamicElements = streamingConfig.dynamicElements;
						const priority = streamingConfig.priority;

						// Process elements by priority
						for (const elementType of priority) {
							try {
								await streamElement(elementType);
							} catch (error) {
								console.warn('Streaming failed for:', elementType, error);
							}
						}

						// Log completion
						const totalTime = performance.now() - startTime;
						console.log('🌊 Shell streaming completed in', totalTime.toFixed(2), 'ms');
					};

					// Stream individual element
					const streamElement = async (elementType) => {
						const placeholder = document.getElementById(elementType + '-placeholder');
						if (!placeholder) return;

						// Add streaming indicator
						const indicator = document.createElement('div');
						indicator.className = 'streaming-indicator';
						indicator.innerHTML = '🌊 Loading...';
						placeholder.appendChild(indicator);

						// Simulate streaming delay (remove in production)
						await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

						// Replace placeholder with actual content
						const content = await fetchDynamicContent(elementType);
						placeholder.innerHTML = content;
						placeholder.classList.add('stream-loaded');
					};

					// Fetch dynamic content (implement actual API calls)
					const fetchDynamicContent = async (elementType) => {
						// This would fetch real data from your APIs
						return '<div class="stream-content">Dynamic content for ' + elementType + '</div>';
					};

					// Start streaming when DOM is ready
					if (document.readyState === 'loading') {
						document.addEventListener('DOMContentLoaded', streamContent);
					} else {
						streamContent();
					}
				})();
			</script>
		`;
	}

	/**
	 * Setup streaming handlers
	 */
	setupStreamingHandlers() {
		// Handle streaming requests
		this.setupStreamingEndpoints();

		// Handle shell requests
		this.setupShellRequests();

		logger.debug("🌊 Streaming handlers setup");
	}

	/**
	 * Setup streaming endpoints (would be actual API routes in production)
	 */
	setupStreamingEndpoints() {
		// This would be implemented as actual API routes in your Next.js app
		// For now, we'll just log the setup

		const endpoints = ["/api/stream/business-info", "/api/stream/photos", "/api/stream/reviews", "/api/stream/menu", "/api/stream/related-businesses", "/api/stream/search-results", "/api/stream/category-businesses", "/api/stream/featured-businesses"];

		endpoints.forEach((endpoint) => {
			logger.debug(`📡 Streaming endpoint registered: ${endpoint}`);
		});
	}

	/**
	 * Setup shell caching
	 */
	setupShellCaching() {
		// Cache shells in memory and localStorage
		setInterval(() => {
			this.cleanupExpiredShells();
		}, 60000); // Every minute

		logger.debug("💾 Shell caching setup");
	}

	/**
	 * Clean up expired shells
	 */
	cleanupExpiredShells() {
		const now = Date.now();
		let cleaned = 0;

		for (const [path, shell] of this.staticShells.entries()) {
			if (now - shell.generated > shell.config.shellTTL) {
				this.staticShells.delete(path);
				this.shellCache.delete(path);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			logger.debug(`🧹 Cleaned ${cleaned} expired shells`);
		}
	}

	/**
	 * Setup streaming performance monitoring
	 */
	setupStreamingMonitoring() {
		// Monitor streaming performance
		setInterval(() => {
			const metrics = this.getStreamingMetrics();
			logger.performance("Edge streaming metrics:", metrics);
		}, 60000); // Every minute
	}

	/**
	 * Get streaming performance metrics
	 */
	getStreamingMetrics() {
		return {
			staticShells: this.staticShells.size,
			activeStreams: this.pendingStreams.size,
			cacheSize: this.shellCache.size,
			memoryUsage: `${(JSON.stringify([...this.staticShells.values()]).length / 1024).toFixed(2)}KB`,
		};
	}

	/**
	 * Get shell for path
	 */
	getShell(path, pageType) {
		// Check cache first
		if (this.shellCache.has(path)) {
			return this.shellCache.get(path);
		}

		// Generate shell on demand
		const config = this.shellConfigs[pageType];
		if (config) {
			const shell = this.createPageShell(pageType, config);
			this.shellCache.set(path, shell);
			return shell;
		}

		return null;
	}

	/**
	 * Stream content to existing shell
	 */
	async streamToShell(shellId, contentType, data) {
		const streamId = `${shellId}-${contentType}`;

		if (this.pendingStreams.has(streamId)) {
			return; // Already streaming
		}

		this.pendingStreams.set(streamId, {
			shellId,
			contentType,
			startTime: Date.now(),
		});

		try {
			// Simulate streaming (implement actual streaming logic)
			await this.performStreaming(shellId, contentType, data);
		} finally {
			this.pendingStreams.delete(streamId);
		}
	}

	/**
	 * Perform actual streaming
	 */
	async performStreaming(shellId, contentType, data) {
		// This would implement actual streaming logic
		// For now, just log the action
		logger.debug(`🌊 Streaming ${contentType} to shell ${shellId}`);

		// Simulate streaming delay
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	/**
	 * Destroy streaming manager
	 */
	destroy() {
		this.staticShells.clear();
		this.shellCache.clear();
		this.pendingStreams.clear();
		this.isInitialized = false;
		logger.info("🧹 Edge streaming manager destroyed");
	}
}

// CSS for shimmer effects and streaming
const edgeStreamingStyles = `
.shimmer {
	background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)) 50%, hsl(var(--muted)) 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
	0% { background-position: -200% 0; }
	100% { background-position: 200% 0; }
}

.shimmer-container {
	position: relative;
	overflow: hidden;
}

.streaming-indicator {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: hsl(var(--primary) / 0.9);
	color: white;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	z-index: 10;
}

.stream-loaded {
	animation: streamIn 0.3s ease-out;
}

@keyframes streamIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.page-shell {
	min-height: 100vh;
}

.business-page-shell,
.search-page-shell,
.category-page-shell,
.home-page-shell {
	opacity: 1;
	animation: shellFadeIn 0.2s ease-out;
}

@keyframes shellFadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}
`;

// Inject styles
if (typeof document !== "undefined" && !document.getElementById("edge-streaming-styles")) {
	const styleSheet = document.createElement("style");
	styleSheet.id = "edge-streaming-styles";
	styleSheet.textContent = edgeStreamingStyles;
	document.head.appendChild(styleSheet);
}

// Create and export singleton
const edgeStreamingManager = new EdgeStreamingManager();

export default edgeStreamingManager;
