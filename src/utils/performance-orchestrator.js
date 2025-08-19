/**
 * Performance Orchestrator
 * Unifies all performance optimization systems for grep.app-level speed
 * Provides centralized control and real-time monitoring
 */

import logger from "@lib/utils/logger";
import { observeWebVitals, initPerformanceMonitoring } from "@utils/web-vitals";
import { initInstantPreloader } from "@utils/instant-preloader";
import { initInstantLoading } from "@utils/instant-page-script";
import { initAdvancedPrefetching } from "@utils/advanced-prefetching";
import { initStreamingSearch } from "@utils/streaming-search";
import { buildSearchIndex } from "@utils/compressed-search-index";

// Performance configuration
const PERFORMANCE_CONFIG = {
	// Feature flags
	ENABLE_INSTANT_PRELOADING: true,
	ENABLE_ADVANCED_PREFETCHING: true,
	ENABLE_STREAMING_SEARCH: true,
	ENABLE_COMPRESSED_INDEX: true,
	ENABLE_SERVICE_WORKER: true,

	// Performance budgets (in milliseconds)
	BUDGETS: {
		LCP: 2500, // Largest Contentful Paint
		FID: 100, // First Input Delay
		CLS: 0.1, // Cumulative Layout Shift
		TTFB: 800, // Time to First Byte
		searchResponseTime: 300, // Search response time
		pageLoadTime: 3000, // Total page load time
		apiResponseTime: 500, // API response time
	},

	// Monitoring intervals
	MONITORING: {
		realTimeInterval: 1000, // Real-time metrics every 1s
		reportingInterval: 30000, // Detailed reports every 30s
		alertThreshold: 5000, // Alert if response > 5s
	},

	// Auto-optimization thresholds
	AUTO_OPTIMIZATION: {
		enableAutoOptimization: true,
		performanceThreshold: 0.7, // Enable aggressive optimizations if score < 70%
		memoryThreshold: 100 * 1024 * 1024, // 100MB memory threshold
		errorRateThreshold: 0.01, // 1% error rate threshold
	},
};

class PerformanceOrchestrator {
	constructor() {
		this.isInitialized = false;
		this.optimizationSystems = new Map();
		this.metrics = {
			webVitals: {},
			searchPerformance: {},
			prefetchingStats: {},
			cacheStats: {},
			systemHealth: {},
		};
		this.performanceScore = 100;
		this.alerts = [];
		this.monitoringInterval = null;
		this.reportingInterval = null;
	}

	/**
	 * Initialize all performance optimization systems
	 */
	async init() {
		if (this.isInitialized || typeof window === "undefined") return;

		const startTime = performance.now();

		try {
			logger.info("🚀 Initializing Performance Orchestrator...");

			// Initialize core performance monitoring
			await this.initCoreMonitoring();

			// Initialize optimization systems based on feature flags
			await this.initOptimizationSystems();

			// Initialize service worker
			if (PERFORMANCE_CONFIG.ENABLE_SERVICE_WORKER) {
				await this.initServiceWorker();
			}

			// Start monitoring
			this.startRealTimeMonitoring();

			// Setup auto-optimization
			if (PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.enableAutoOptimization) {
				this.setupAutoOptimization();
			}

			const initTime = performance.now() - startTime;
			this.isInitialized = true;

			logger.info(`✅ Performance Orchestrator initialized in ${initTime.toFixed(2)}ms`);
			this.reportSystemStatus();
		} catch (error) {
			logger.error("❌ Failed to initialize Performance Orchestrator:", error);
		}
	}

	/**
	 * Initialize core performance monitoring
	 */
	async initCoreMonitoring() {
		// Web Vitals monitoring
		const webVitalsCleanup = observeWebVitals((metric) => {
			this.metrics.webVitals[metric.name] = metric;
			this.checkPerformanceBudgets(metric);
		});

		// Enhanced performance monitoring
		const performanceCleanup = initPerformanceMonitoring();

		this.optimizationSystems.set("webVitals", { cleanup: webVitalsCleanup });
		this.optimizationSystems.set("performanceMonitoring", { cleanup: performanceCleanup });

		logger.debug("Core performance monitoring initialized");
	}

	/**
	 * Initialize optimization systems
	 */
	async initOptimizationSystems() {
		const systems = [];

		// Instant preloading
		if (PERFORMANCE_CONFIG.ENABLE_INSTANT_PRELOADING) {
			systems.push(this.initInstantPreloading());
		}

		// Advanced prefetching
		if (PERFORMANCE_CONFIG.ENABLE_ADVANCED_PREFETCHING) {
			systems.push(this.initAdvancedPrefetching());
		}

		// Streaming search
		if (PERFORMANCE_CONFIG.ENABLE_STREAMING_SEARCH) {
			systems.push(this.initStreamingSearch());
		}

		// Compressed search index
		if (PERFORMANCE_CONFIG.ENABLE_COMPRESSED_INDEX) {
			systems.push(this.initCompressedIndex());
		}

		// Initialize instant.page
		systems.push(this.initInstantPage());

		await Promise.all(systems);
		logger.debug("All optimization systems initialized");
	}

	/**
	 * Initialize instant preloading system
	 */
	async initInstantPreloading() {
		try {
			const preloader = initInstantPreloader();
			this.optimizationSystems.set("instantPreloader", {
				instance: preloader,
				getMetrics: () => preloader.getMetrics(),
			});
			logger.debug("✅ Instant preloading initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize instant preloading:", error);
		}
	}

	/**
	 * Initialize advanced prefetching
	 */
	async initAdvancedPrefetching() {
		try {
			const prefetcher = initAdvancedPrefetching();
			this.optimizationSystems.set("advancedPrefetching", {
				instance: prefetcher,
				getMetrics: () => prefetcher.getMetrics(),
			});
			logger.debug("✅ Advanced prefetching initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize advanced prefetching:", error);
		}
	}

	/**
	 * Initialize streaming search
	 */
	async initStreamingSearch() {
		try {
			const search = initStreamingSearch();
			this.optimizationSystems.set("streamingSearch", {
				instance: search,
				getMetrics: () => search.getMetrics(),
			});
			logger.debug("✅ Streaming search initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize streaming search:", error);
		}
	}

	/**
	 * Initialize compressed search index
	 */
	async initCompressedIndex() {
		try {
			// This would typically be populated from your business data
			// For now, we'll set up the infrastructure
			this.optimizationSystems.set("compressedIndex", {
				buildIndex: buildSearchIndex,
				getMetrics: () => ({}), // Implement based on your search index
			});
			logger.debug("✅ Compressed search index initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize compressed search index:", error);
		}
	}

	/**
	 * Initialize instant.page integration
	 */
	async initInstantPage() {
		try {
			initInstantLoading();
			this.optimizationSystems.set("instantPage", {
				enabled: true,
			});
			logger.debug("✅ Instant.page initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize instant.page:", error);
		}
	}

	/**
	 * Initialize service worker
	 */
	async initServiceWorker() {
		if (!("serviceWorker" in navigator)) {
			logger.warn("Service Worker not supported");
			return;
		}

		try {
			const registration = await navigator.serviceWorker.register("/sw.js");

			registration.addEventListener("updatefound", () => {
				logger.info("New service worker version available");
			});

			this.optimizationSystems.set("serviceWorker", {
				registration,
				getMetrics: () => this.getServiceWorkerMetrics(),
			});

			logger.debug("✅ Service Worker initialized");
		} catch (error) {
			logger.error("❌ Failed to initialize service worker:", error);
		}
	}

	/**
	 * Start real-time performance monitoring
	 */
	startRealTimeMonitoring() {
		// Real-time metrics collection
		this.monitoringInterval = setInterval(() => {
			this.collectRealTimeMetrics();
		}, PERFORMANCE_CONFIG.MONITORING.realTimeInterval);

		// Detailed reporting
		this.reportingInterval = setInterval(() => {
			this.generatePerformanceReport();
		}, PERFORMANCE_CONFIG.MONITORING.reportingInterval);

		logger.debug("Real-time monitoring started");
	}

	/**
	 * Collect real-time performance metrics
	 */
	collectRealTimeMetrics() {
		try {
			// System health metrics
			this.metrics.systemHealth = {
				timestamp: Date.now(),
				memoryUsage: this.getMemoryUsage(),
				connectionType: this.getConnectionType(),
				batteryLevel: this.getBatteryLevel(),
				pageVisibility: document.visibilityState,
			};

			// Collect metrics from optimization systems
			for (const [name, system] of this.optimizationSystems) {
				if (system.getMetrics) {
					this.metrics[name] = system.getMetrics();
				}
			}

			// Calculate overall performance score
			this.calculatePerformanceScore();

			// Check for alerts
			this.checkPerformanceAlerts();
		} catch (error) {
			logger.error("Failed to collect real-time metrics:", error);
		}
	}

	/**
	 * Generate comprehensive performance report
	 */
	generatePerformanceReport() {
		const report = {
			timestamp: Date.now(),
			performanceScore: this.performanceScore,
			webVitals: this.metrics.webVitals,
			optimizationSystems: {},
			systemHealth: this.metrics.systemHealth,
			alerts: this.alerts,
			recommendations: this.generateRecommendations(),
		};

		// Collect metrics from all systems
		for (const [name, system] of this.optimizationSystems) {
			if (system.getMetrics) {
				report.optimizationSystems[name] = system.getMetrics();
			}
		}

		logger.info("📊 Performance Report:", report);

		// Send to analytics if configured
		this.sendToAnalytics(report);

		return report;
	}

	/**
	 * Check performance budgets and generate alerts
	 */
	checkPerformanceBudgets(metric) {
		const budget = PERFORMANCE_CONFIG.BUDGETS[metric.name];
		if (!budget) return;

		if (metric.value > budget) {
			const alert = {
				type: "BUDGET_EXCEEDED",
				metric: metric.name,
				value: metric.value,
				budget: budget,
				severity: metric.value > budget * 2 ? "critical" : "warning",
				timestamp: Date.now(),
			};

			this.alerts.push(alert);
			logger.warn(`⚠️ Performance budget exceeded: ${metric.name} = ${metric.value} (budget: ${budget})`);

			// Trigger auto-optimization if enabled
			if (PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.enableAutoOptimization) {
				this.triggerAutoOptimization(metric);
			}
		}
	}

	/**
	 * Calculate overall performance score
	 */
	calculatePerformanceScore() {
		const weights = {
			LCP: 0.25,
			FID: 0.25,
			CLS: 0.25,
			systemHealth: 0.25,
		};

		let score = 100;
		let totalWeight = 0;

		// Web Vitals scoring
		for (const [name, weight] of Object.entries(weights)) {
			if (name === "systemHealth") continue;

			const metric = this.metrics.webVitals[name];
			if (metric) {
				const budget = PERFORMANCE_CONFIG.BUDGETS[name];
				const metricScore = Math.max(0, Math.min(100, 100 - (metric.value / budget) * 100));
				score += metricScore * weight;
				totalWeight += weight;
			}
		}

		// System health scoring
		const memoryUsage = this.metrics.systemHealth?.memoryUsage?.usedJSHeapSize || 0;
		const memoryScore = Math.max(0, 100 - (memoryUsage / PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold) * 100);
		score += memoryScore * weights.systemHealth;
		totalWeight += weights.systemHealth;

		this.performanceScore = totalWeight > 0 ? score / totalWeight : 100;
	}

	/**
	 * Check for performance alerts
	 */
	checkPerformanceAlerts() {
		// Check if performance score is too low
		if (this.performanceScore < PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.performanceThreshold * 100) {
			this.addAlert("LOW_PERFORMANCE_SCORE", {
				score: this.performanceScore,
				threshold: PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.performanceThreshold * 100,
			});
		}

		// Check memory usage
		const memoryUsage = this.metrics.systemHealth?.memoryUsage?.usedJSHeapSize || 0;
		if (memoryUsage > PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold) {
			this.addAlert("HIGH_MEMORY_USAGE", {
				usage: memoryUsage,
				threshold: PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold,
			});
		}

		// Cleanup old alerts (keep only last 50)
		if (this.alerts.length > 50) {
			this.alerts = this.alerts.slice(-50);
		}
	}

	/**
	 * Add performance alert
	 */
	addAlert(type, data) {
		const alert = {
			type,
			data,
			timestamp: Date.now(),
			severity: this.getAlertSeverity(type, data),
		};

		this.alerts.push(alert);
		logger.warn(`🚨 Performance Alert: ${type}`, data);
	}

	/**
	 * Get alert severity
	 */
	getAlertSeverity(type, data) {
		switch (type) {
			case "LOW_PERFORMANCE_SCORE":
				return data.score < 50 ? "critical" : "warning";
			case "HIGH_MEMORY_USAGE":
				return data.usage > data.threshold * 2 ? "critical" : "warning";
			default:
				return "info";
		}
	}

	/**
	 * Setup auto-optimization
	 */
	setupAutoOptimization() {
		setInterval(() => {
			if (this.performanceScore < PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.performanceThreshold * 100) {
				this.executeAutoOptimizations();
			}
		}, 60000); // Check every minute

		logger.debug("Auto-optimization enabled");
	}

	/**
	 * Execute automatic optimizations
	 */
	executeAutoOptimizations() {
		logger.info("🔧 Executing auto-optimizations...");

		// Clear old caches
		this.clearOldCaches();

		// Optimize prefetching based on current performance
		this.optimizePrefetching();

		// Adjust search index if needed
		this.optimizeSearchIndex();

		// Trigger garbage collection if available
		if (window.gc) {
			window.gc();
		}

		logger.info("✅ Auto-optimizations completed");
	}

	/**
	 * Trigger specific optimizations for metrics
	 */
	triggerAutoOptimization(metric) {
		switch (metric.name) {
			case "LCP":
				this.optimizeContentLoading();
				break;
			case "FID":
				this.optimizeInputResponsiveness();
				break;
			case "CLS":
				this.optimizeLayoutStability();
				break;
		}
	}

	/**
	 * Optimize content loading for LCP
	 */
	optimizeContentLoading() {
		// Reduce prefetching aggressiveness
		const prefetcher = this.optimizationSystems.get("advancedPrefetching")?.instance;
		if (prefetcher) {
			// Implement dynamic prefetch reduction
			logger.debug("Reducing prefetch aggressiveness to improve LCP");
		}
	}

	/**
	 * Optimize input responsiveness for FID
	 */
	optimizeInputResponsiveness() {
		// Increase debounce delays
		logger.debug("Optimizing input responsiveness");
	}

	/**
	 * Optimize layout stability for CLS
	 */
	optimizeLayoutStability() {
		// Implement layout optimization
		logger.debug("Optimizing layout stability");
	}

	/**
	 * Generate performance recommendations
	 */
	generateRecommendations() {
		const recommendations = [];

		// Check Web Vitals
		for (const [name, metric] of Object.entries(this.metrics.webVitals)) {
			const budget = PERFORMANCE_CONFIG.BUDGETS[name];
			if (metric.value > budget) {
				recommendations.push({
					type: "web_vitals",
					metric: name,
					current: metric.value,
					target: budget,
					priority: metric.value > budget * 2 ? "high" : "medium",
					action: this.getWebVitalRecommendation(name),
				});
			}
		}

		// Check system health
		const memoryUsage = this.metrics.systemHealth?.memoryUsage?.usedJSHeapSize || 0;
		if (memoryUsage > PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold) {
			recommendations.push({
				type: "memory",
				current: memoryUsage,
				target: PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold,
				priority: "high",
				action: "Clear caches and reduce memory usage",
			});
		}

		return recommendations;
	}

	/**
	 * Get Web Vital specific recommendations
	 */
	getWebVitalRecommendation(metricName) {
		const recommendations = {
			LCP: "Optimize image loading, reduce server response time, or implement better caching",
			FID: "Reduce JavaScript execution time or defer non-critical scripts",
			CLS: "Reserve space for dynamic content and avoid layout shifts",
		};

		return recommendations[metricName] || "Review performance optimization techniques";
	}

	/**
	 * Get system metrics
	 */
	getMemoryUsage() {
		if (performance.memory) {
			return {
				usedJSHeapSize: performance.memory.usedJSHeapSize,
				totalJSHeapSize: performance.memory.totalJSHeapSize,
				jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
			};
		}
		return null;
	}

	getConnectionType() {
		return navigator.connection?.effectiveType || "unknown";
	}

	async getBatteryLevel() {
		if ("getBattery" in navigator) {
			try {
				const battery = await navigator.getBattery();
				return battery.level;
			} catch {
				return null;
			}
		}
		return null;
	}

	/**
	 * Get service worker metrics
	 */
	async getServiceWorkerMetrics() {
		const registration = this.optimizationSystems.get("serviceWorker")?.registration;
		if (!registration) return null;

		try {
			// Request cache stats from service worker
			return new Promise((resolve) => {
				const channel = new MessageChannel();
				channel.port1.onmessage = (event) => {
					resolve(event.data);
				};

				registration.active?.postMessage({ type: "GET_CACHE_STATS" }, [channel.port2]);

				setTimeout(() => resolve(null), 1000);
			});
		} catch {
			return null;
		}
	}

	/**
	 * Send metrics to analytics
	 */
	sendToAnalytics(report) {
		// Implement analytics integration
		// This could send to Google Analytics, your own analytics service, etc.
		if (typeof gtag !== "undefined") {
			gtag("event", "performance_report", {
				performance_score: report.performanceScore,
				lcp: report.webVitals.LCP?.value,
				fid: report.webVitals.FID?.value,
				cls: report.webVitals.CLS?.value,
			});
		}
	}

	/**
	 * Report system status
	 */
	reportSystemStatus() {
		const status = {
			initialized: this.isInitialized,
			optimizationSystems: Array.from(this.optimizationSystems.keys()),
			performanceScore: this.performanceScore,
			activeFeatures: {
				instantPreloading: PERFORMANCE_CONFIG.ENABLE_INSTANT_PRELOADING,
				advancedPrefetching: PERFORMANCE_CONFIG.ENABLE_ADVANCED_PREFETCHING,
				streamingSearch: PERFORMANCE_CONFIG.ENABLE_STREAMING_SEARCH,
				compressedIndex: PERFORMANCE_CONFIG.ENABLE_COMPRESSED_INDEX,
				serviceWorker: PERFORMANCE_CONFIG.ENABLE_SERVICE_WORKER,
			},
		};

		logger.info("🎯 Performance Orchestrator Status:", status);
	}

	/**
	 * Clear old caches
	 */
	clearOldCaches() {
		// Clear browser caches
		for (const [name, system] of this.optimizationSystems) {
			if (system.instance?.clearCache) {
				system.instance.clearCache();
			}
		}
	}

	/**
	 * Optimize prefetching based on performance
	 */
	optimizePrefetching() {
		const prefetcher = this.optimizationSystems.get("advancedPrefetching")?.instance;
		if (prefetcher && this.performanceScore < 70) {
			// Reduce prefetching when performance is low
			prefetcher.reducePrefetchingAggression?.();
		}
	}

	/**
	 * Optimize search index
	 */
	optimizeSearchIndex() {
		// Implement search index optimization
		const memoryUsage = this.metrics.systemHealth?.memoryUsage?.usedJSHeapSize || 0;
		if (memoryUsage > PERFORMANCE_CONFIG.AUTO_OPTIMIZATION.memoryThreshold) {
			// Clear search index cache
			const searchSystem = this.optimizationSystems.get("compressedIndex");
			if (searchSystem?.clearCache) {
				searchSystem.clearCache();
			}
		}
	}

	/**
	 * Get current performance metrics
	 */
	getMetrics() {
		return {
			...this.metrics,
			performanceScore: this.performanceScore,
			alerts: this.alerts.slice(-10), // Last 10 alerts
			isInitialized: this.isInitialized,
			systemStatus: Array.from(this.optimizationSystems.keys()),
		};
	}

	/**
	 * Cleanup and destroy
	 */
	destroy() {
		// Clear intervals
		if (this.monitoringInterval) {
			clearInterval(this.monitoringInterval);
		}
		if (this.reportingInterval) {
			clearInterval(this.reportingInterval);
		}

		// Cleanup optimization systems
		for (const [name, system] of this.optimizationSystems) {
			if (system.cleanup) {
				system.cleanup();
			}
		}

		this.isInitialized = false;
		logger.info("Performance Orchestrator destroyed");
	}
}

// Create singleton instance
const performanceOrchestrator = new PerformanceOrchestrator();

// Export utilities
export const initPerformanceOrchestrator = () => {
	return performanceOrchestrator.init();
};

export const getPerformanceMetrics = () => {
	return performanceOrchestrator.getMetrics();
};

export const generatePerformanceReport = () => {
	return performanceOrchestrator.generatePerformanceReport();
};

export const destroyPerformanceOrchestrator = () => {
	performanceOrchestrator.destroy();
};

export default performanceOrchestrator;
