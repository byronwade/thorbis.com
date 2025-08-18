/**
 * Performance Provider Component
 *
 * Initializes and manages all performance optimizations:
 * - Service Worker registration
 * - Performance monitoring
 * - Experimental APIs
 * - Background prefetching
 * - Real-time optimization
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { initializeInstantLoading } from "@lib/performance/instant-loading";
import { initializeExperimentalAPIs } from "@lib/performance/experimental-apis";
import { useNextFasterPrefetch } from "@lib/performance/nextfaster-prefetch";

// Performance context
const PerformanceContext = createContext({
	isServiceWorkerActive: false,
	performanceScore: 0,
	prefetchMetrics: {},
	isOptimized: false,
});

/**
 * Service Worker Manager
 */
class ServiceWorkerManager {
	constructor() {
		this.isRegistered = false;
		this.registration = null;
		this.updateAvailable = false;
		this.callbacks = new Set();
	}

	async register() {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			console.log("Service Worker not supported");
			return false;
		}

		try {
			this.registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none",
			});

			console.log("Service Worker registered:", this.registration.scope);

			// Listen for updates
			this.registration.addEventListener("updatefound", () => {
				const newWorker = this.registration.installing;

				newWorker.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						this.updateAvailable = true;
						this.notifyCallbacks("update-available");
					}
				});
			});

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener("message", (event) => {
				this.handleServiceWorkerMessage(event);
			});

			this.isRegistered = true;
			this.notifyCallbacks("registered");
			return true;
		} catch (error) {
			console.warn("Service Worker registration failed:", error);
			return false;
		}
	}

	async update() {
		if (this.registration) {
			await this.registration.update();
		}
	}

	async skipWaiting() {
		if (this.registration?.waiting) {
			this.registration.waiting.postMessage({ type: "FORCE_UPDATE" });
		}
	}

	handleServiceWorkerMessage(event) {
		const { type, data } = event.data;

		switch (type) {
			case "SW_METRIC":
				this.notifyCallbacks("metric", data);
				break;

			case "PREFETCH_COMPLETE":
				this.notifyCallbacks("prefetch-complete", data);
				break;

			case "CACHE_UPDATE":
				this.notifyCallbacks("cache-update", data);
				break;
		}
	}

	subscribe(callback) {
		this.callbacks.add(callback);
		return () => this.callbacks.delete(callback);
	}

	notifyCallbacks(type, data = null) {
		this.callbacks.forEach((callback) => {
			try {
				callback(type, data);
			} catch (error) {
				console.warn("Service Worker callback error:", error);
			}
		});
	}

	async sendMessage(message) {
		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage(message);
		}
	}

	async prefetchRoutes(routes) {
		await this.sendMessage({
			type: "PREFETCH_ROUTES",
			data: { routes },
		});
	}

	async getMetrics() {
		return new Promise((resolve) => {
			const channel = new MessageChannel();

			channel.port1.onmessage = (event) => {
				resolve(event.data);
			};

			this.sendMessage({
				type: "GET_METRICS",
			});
		});
	}

	async clearCache() {
		await this.sendMessage({
			type: "CLEAR_CACHE",
		});
	}
}

// Global service worker instance
let serviceWorkerManager = null;

/**
 * Performance Provider Component
 */
export default function PerformanceProvider({ children, enableServiceWorker = true, enableMonitoring = true, enableExperimentalAPIs = true, showPerformanceMonitor = false, autoOptimize = true }) {
	const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
	const [performanceScore, setPerformanceScore] = useState(0);
	const [prefetchMetrics, setPrefetchMetrics] = useState({});
	const [isOptimized, setIsOptimized] = useState(false);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const initializationRef = useRef(false);

	// Initialize NextFaster prefetching
	const { metrics: nextFasterMetrics } = useNextFasterPrefetch();

	// Initialize all performance systems
	useEffect(() => {
		if (initializationRef.current) return;
		initializationRef.current = true;

		const initializePerformanceSystems = async () => {
			console.log("🚀 Initializing NextFaster Performance Systems...");

			try {
				// 1. Initialize Service Worker
				if (enableServiceWorker) {
					if (!serviceWorkerManager) {
						serviceWorkerManager = new ServiceWorkerManager();
					}

					const swRegistered = await serviceWorkerManager.register();
					setIsServiceWorkerActive(swRegistered);

					if (swRegistered) {
						// Subscribe to service worker events
						serviceWorkerManager.subscribe((type, data) => {
							switch (type) {
								case "update-available":
									setUpdateAvailable(true);
									break;
								case "metric":
									setPrefetchMetrics((prev) => ({ ...prev, ...data }));
									break;
							}
						});
					}
				}

				// 2. Initialize Experimental APIs
				if (enableExperimentalAPIs) {
					const apiSupport = initializeExperimentalAPIs();
					console.log("📡 Experimental APIs initialized:", apiSupport);
				}

				// 3. Initialize Instant Loading
				initializeInstantLoading();
				console.log("⚡ Instant loading system active");

				// 4. Start background optimizations
				if (autoOptimize) {
					await startBackgroundOptimizations();
				}

				setIsOptimized(true);
				console.log("✅ NextFaster Performance Systems initialized successfully");

				// Track initialization
				if (typeof gtag !== "undefined") {
					gtag("event", "performance_initialized", {
						event_category: "performance",
						custom_map: {
							service_worker: enableServiceWorker && isServiceWorkerActive,
							experimental_apis: enableExperimentalAPIs,
							instant_loading: true,
							auto_optimize: autoOptimize,
						},
					});
				}
			} catch (error) {
				console.error("❌ Performance system initialization failed:", error);
			}
		};

		initializePerformanceSystems();
	}, [enableServiceWorker, enableExperimentalAPIs, autoOptimize]);

	// Calculate performance score
	useEffect(() => {
		const calculateScore = () => {
			let score = 0;
			let factors = 0;

			// Service Worker factor
			if (isServiceWorkerActive) {
				score += 25;
			}
			factors++;

			// Prefetch hit rate factor
			const hitRate = nextFasterMetrics.hitRate || 0;
			score += (hitRate / 100) * 25;
			factors++;

			// Cache performance factor
			if (prefetchMetrics.hitRate) {
				score += (prefetchMetrics.hitRate / 100) * 25;
			}
			factors++;

			// System optimization factor
			if (isOptimized) {
				score += 25;
			}
			factors++;

			setPerformanceScore(Math.round(score));
		};

		calculateScore();
	}, [isServiceWorkerActive, nextFasterMetrics, prefetchMetrics, isOptimized]);

	// Background optimizations
	const startBackgroundOptimizations = async () => {
		// Prefetch critical routes (exclude protected user dashboard to avoid auth loops)
		const criticalRoutes = ["/categories", "/search", "/jobs"];

		if (serviceWorkerManager) {
			await serviceWorkerManager.prefetchRoutes(criticalRoutes);
		}

		// Start performance monitoring
		if (enableMonitoring) {
			startPerformanceMonitoring();
		}
	};

	const startPerformanceMonitoring = () => {
		// Monitor Core Web Vitals via web-vitals client events; guard unsupported observer types
		if ("PerformanceObserver" in window) {
			try {
				const supported = PerformanceObserver.supportedEntryTypes || [];
				// Avoid observing non-existent 'web-vital' type (causes warning)
				const typesToObserve = ["largest-contentful-paint", "first-input", "layout-shift"].filter((t) => supported.includes(t));
				if (typesToObserve.length > 0) {
					const observer = new PerformanceObserver((list) => {
						for (const entry of list.getEntries()) {
							if (typeof gtag !== "undefined") {
								gtag("event", "core_web_vital", {
									event_category: "performance",
									event_label: entry.name,
									value: Math.round(entry.value || 0),
									custom_map: {
										metric_name: entry.name,
										metric_value: entry.value,
										rating: getMetricRating(entry.name, entry.value),
									},
								});
							}
						}
					});
					observer.observe({ entryTypes: typesToObserve });
				}
			} catch (e) {
				// No-op; rely on web-vitals client elsewhere
			}
		}
	};

	const getMetricRating = (metric, value) => {
		const thresholds = {
			"largest-contentful-paint": { good: 2500, poor: 4000 },
			"first-input-delay": { good: 100, poor: 300 },
			"cumulative-layout-shift": { good: 0.1, poor: 0.25 },
		};

		const threshold = thresholds[metric];
		if (!threshold) return "unknown";

		if (value <= threshold.good) return "good";
		if (value <= threshold.poor) return "needs-improvement";
		return "poor";
	};

	// Handle service worker updates
	const handleServiceWorkerUpdate = async () => {
		if (serviceWorkerManager) {
			await serviceWorkerManager.skipWaiting();
			window.location.reload();
		}
	};

	// Context value
	const contextValue = {
		isServiceWorkerActive,
		performanceScore,
		prefetchMetrics: { ...nextFasterMetrics, ...prefetchMetrics },
		isOptimized,
		updateAvailable,
		serviceWorker: serviceWorkerManager,
		handleUpdate: handleServiceWorkerUpdate,
	};

	return (
		<PerformanceContext.Provider value={contextValue}>
			{children}

			{/* Performance Monitor moved to footer widget */}

			{/* Update notification */}
			{updateAvailable && <UpdateNotification onUpdate={handleServiceWorkerUpdate} />}
		</PerformanceContext.Provider>
	);
}

/**
 * Update notification component
 */
function UpdateNotification({ onUpdate }) {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-4 left-4 z-50 max-w-sm">
			<div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-medium">App Update Available</h4>
						<p className="text-sm text-blue-100">A new version with performance improvements is ready.</p>
					</div>
					<button onClick={() => setIsVisible(false)} className="text-blue-100 hover:text-white ml-4">
						×
					</button>
				</div>
				<div className="mt-3 flex gap-2">
					<button onClick={onUpdate} className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50">
						Update Now
					</button>
					<button onClick={() => setIsVisible(false)} className="text-blue-100 hover:text-white px-3 py-1 text-sm">
						Later
					</button>
				</div>
			</div>
		</div>
	);
}

/**
 * Performance context hook
 */
export function usePerformance() {
	const context = useContext(PerformanceContext);
	if (!context) {
		throw new Error("usePerformance must be used within a PerformanceProvider");
	}
	return context;
}

/**
 * Service Worker hook
 */
export function useServiceWorker() {
	const { serviceWorker, isServiceWorkerActive } = usePerformance();

	return {
		isActive: isServiceWorkerActive,
		prefetchRoutes: serviceWorker?.prefetchRoutes.bind(serviceWorker),
		getMetrics: serviceWorker?.getMetrics.bind(serviceWorker),
		clearCache: serviceWorker?.clearCache.bind(serviceWorker),
		update: serviceWorker?.update.bind(serviceWorker),
	};
}

/**
 * Performance metrics hook
 */
export function usePerformanceMetrics() {
	const { performanceScore, prefetchMetrics, isOptimized } = usePerformance();

	return {
		score: performanceScore,
		metrics: prefetchMetrics,
		isOptimized,
		grade: getPerformanceGrade(performanceScore),
	};
}

function getPerformanceGrade(score) {
	if (score >= 90) return "A+";
	if (score >= 80) return "A";
	if (score >= 70) return "B";
	if (score >= 60) return "C";
	if (score >= 50) return "D";
	return "F";
}

/**
 * Background prefetch hook
 */
export function useBackgroundPrefetch() {
	const { serviceWorker } = usePerformance();

	const prefetchRoute = async (route) => {
		if (serviceWorker) {
			await serviceWorker.prefetchRoutes([route]);
		}
	};

	const prefetchRoutes = async (routes) => {
		if (serviceWorker) {
			await serviceWorker.prefetchRoutes(routes);
		}
	};

	return {
		prefetchRoute,
		prefetchRoutes,
	};
}
