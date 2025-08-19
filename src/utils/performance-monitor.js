/**
 * Performance Monitor Component
 * Enterprise-grade performance tracking for intelligent homepage
 * Monitors page load, personalization, and user engagement metrics
 */

"use client";

import { useEffect, useRef } from "react";
import logger from "./logger.js";

export class PerformanceMonitorService {
	constructor() {
		this.metrics = new Map();
		this.observers = new Map();
		this.startTime = performance.now();
		this.isInitialized = false;
	}

	/**
	 * Initialize performance monitoring
	 */
	initialize() {
		if (this.isInitialized || typeof window === "undefined") return;

		this.setupWebVitalsTracking();
		this.setupNavigationTracking();
		this.setupResourceTracking();
		this.setupUserTimingTracking();
		this.setupMemoryTracking();
		this.setupConnectionTracking();

		this.isInitialized = true;
		logger.performance("Performance monitoring initialized");
	}

	/**
	 * Track Core Web Vitals (Google's performance metrics)
	 */
	setupWebVitalsTracking() {
		// Track Largest Contentful Paint (LCP)
		this.observeMetric("largest-contentful-paint", (entry) => {
			const lcp = entry.startTime;
			this.trackMetric("LCP", lcp);

			if (lcp > 2500) {
				logger.warn(`Poor LCP detected: ${lcp.toFixed(2)}ms`);
			}
		});

		// Track First Input Delay (FID)
		this.observeMetric("first-input", (entry) => {
			const fid = entry.processingStart - entry.startTime;
			this.trackMetric("FID", fid);

			if (fid > 100) {
				logger.warn(`Poor FID detected: ${fid.toFixed(2)}ms`);
			}
		});

		// Track Cumulative Layout Shift (CLS)
		this.observeMetric("layout-shift", (entry) => {
			if (!entry.hadRecentInput) {
				const cls = entry.value;
				this.trackMetric("CLS", cls);

				if (cls > 0.1) {
					logger.warn(`Poor CLS detected: ${cls.toFixed(4)}`);
				}
			}
		});

		// Track Time to First Byte (TTFB)
		this.observeNavigation((entry) => {
			const ttfb = entry.responseStart - entry.requestStart;
			this.trackMetric("TTFB", ttfb);

			if (ttfb > 800) {
				logger.warn(`Poor TTFB detected: ${ttfb.toFixed(2)}ms`);
			}
		});
	}

	/**
	 * Track navigation performance
	 */
	setupNavigationTracking() {
		this.observeNavigation((entry) => {
			const metrics = {
				dns: entry.domainLookupEnd - entry.domainLookupStart,
				tcp: entry.connectEnd - entry.connectStart,
				request: entry.responseStart - entry.requestStart,
				response: entry.responseEnd - entry.responseStart,
				dom: entry.domContentLoadedEventEnd - entry.responseEnd,
				load: entry.loadEventEnd - entry.loadEventStart,
				total: entry.loadEventEnd - entry.navigationStart,
			};

			Object.entries(metrics).forEach(([key, value]) => {
				this.trackMetric(`navigation_${key}`, value);
			});

			logger.performance("Navigation timing metrics", metrics);
		});
	}

	/**
	 * Track resource loading performance
	 */
	setupResourceTracking() {
		this.observeMetric("resource", (entry) => {
			const duration = entry.responseEnd - entry.startTime;

			// Categorize resources
			let category = "other";
			if (entry.name.includes(".js")) category = "script";
			else if (entry.name.includes(".css")) category = "stylesheet";
			else if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(entry.name)) category = "image";
			else if (entry.name.includes("/api/")) category = "api";

			this.trackMetric(`resource_${category}`, duration);

			// Alert on slow resources
			if (duration > 3000) {
				logger.warn(`Slow resource detected: ${entry.name} (${duration.toFixed(2)}ms)`);
			}
		});
	}

	/**
	 * Track custom user timing marks
	 */
	setupUserTimingTracking() {
		this.observeMetric("measure", (entry) => {
			this.trackMetric(`user_timing_${entry.name}`, entry.duration);
			logger.performance(`User timing: ${entry.name}`, entry.duration);
		});
	}

	/**
	 * Track memory usage (Chrome only)
	 */
	setupMemoryTracking() {
		if (!performance.memory) return;

		setInterval(() => {
			const memory = performance.memory;
			const memoryMetrics = {
				used: memory.usedJSHeapSize,
				total: memory.totalJSHeapSize,
				limit: memory.jsHeapSizeLimit,
				usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
			};

			this.trackMetric("memory_usage", memoryMetrics.usage);

			if (memoryMetrics.usage > 80) {
				logger.warn(`High memory usage detected: ${memoryMetrics.usage.toFixed(2)}%`);
			}
		}, 30000); // Check every 30 seconds
	}

	/**
	 * Track connection information
	 */
	setupConnectionTracking() {
		if (!navigator.connection) return;

		const connection = navigator.connection;
		const connectionMetrics = {
			effectiveType: connection.effectiveType,
			downlink: connection.downlink,
			rtt: connection.rtt,
			saveData: connection.saveData,
		};

		this.trackMetric("connection_info", connectionMetrics);
		logger.performance("Connection metrics", connectionMetrics);

		// Monitor connection changes
		connection.addEventListener("change", () => {
			this.trackMetric("connection_change", {
				effectiveType: connection.effectiveType,
				downlink: connection.downlink,
				rtt: connection.rtt,
			});
		});
	}

	/**
	 * Observe performance metrics using PerformanceObserver
	 */
	observeMetric(entryType, callback) {
		if (!window.PerformanceObserver) return;

		try {
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach(callback);
			});

			observer.observe({ entryTypes: [entryType] });
			this.observers.set(entryType, observer);
		} catch (error) {
			logger.debug(`Failed to observe ${entryType}:`, error);
		}
	}

	/**
	 * Observe navigation timing
	 */
	observeNavigation(callback) {
		if (document.readyState === "complete") {
			const entry = performance.getEntriesByType("navigation")[0];
			if (entry) callback(entry);
		} else {
			window.addEventListener("load", () => {
				const entry = performance.getEntriesByType("navigation")[0];
				if (entry) callback(entry);
			});
		}
	}

	/**
	 * Track custom metrics
	 */
	trackMetric(name, value) {
		const timestamp = performance.now();

		if (!this.metrics.has(name)) {
			this.metrics.set(name, []);
		}

		this.metrics.get(name).push({ value, timestamp });

		// Keep only last 100 measurements per metric
		const measurements = this.metrics.get(name);
		if (measurements.length > 100) {
			measurements.shift();
		}
	}

	/**
	 * Mark performance milestones
	 */
	mark(name) {
		if (performance.mark) {
			performance.mark(name);
		}
		this.trackMetric(`mark_${name}`, performance.now() - this.startTime);
		logger.performance(`Performance mark: ${name}`);
	}

	/**
	 * Measure time between marks
	 */
	measure(name, startMark, endMark) {
		if (performance.measure) {
			try {
				performance.measure(name, startMark, endMark);
				const measure = performance.getEntriesByName(name, "measure")[0];
				if (measure) {
					this.trackMetric(`measure_${name}`, measure.duration);
					logger.performance(`Performance measure: ${name} = ${measure.duration.toFixed(2)}ms`);
				}
			} catch (error) {
				logger.debug(`Failed to measure ${name}:`, error);
			}
		}
	}

	/**
	 * Get performance summary
	 */
	getPerformanceSummary() {
		const summary = {};

		for (const [name, measurements] of this.metrics) {
			if (measurements.length === 0) continue;

			const values = measurements.map((m) => m.value);
			summary[name] = {
				count: values.length,
				latest: values[values.length - 1],
				average: values.reduce((a, b) => a + b, 0) / values.length,
				min: Math.min(...values),
				max: Math.max(...values),
			};
		}

		return summary;
	}

	/**
	 * Get Core Web Vitals summary
	 */
	getCoreWebVitals() {
		const summary = this.getPerformanceSummary();

		return {
			LCP: summary.LCP?.latest || null,
			FID: summary.FID?.latest || null,
			CLS: summary.CLS?.latest || null,
			TTFB: summary.TTFB?.latest || null,
			scores: {
				LCP: this.getWebVitalScore("LCP", summary.LCP?.latest),
				FID: this.getWebVitalScore("FID", summary.FID?.latest),
				CLS: this.getWebVitalScore("CLS", summary.CLS?.latest),
				TTFB: this.getWebVitalScore("TTFB", summary.TTFB?.latest),
			},
		};
	}

	/**
	 * Calculate Web Vital score (Good/Needs Improvement/Poor)
	 */
	getWebVitalScore(metric, value) {
		if (value === null || value === undefined) return "unknown";

		const thresholds = {
			LCP: { good: 2500, poor: 4000 },
			FID: { good: 100, poor: 300 },
			CLS: { good: 0.1, poor: 0.25 },
			TTFB: { good: 800, poor: 1800 },
		};

		const threshold = thresholds[metric];
		if (!threshold) return "unknown";

		if (value <= threshold.good) return "good";
		if (value <= threshold.poor) return "needs-improvement";
		return "poor";
	}

	/**
	 * Send performance data to analytics
	 */
	sendPerformanceData() {
		const summary = this.getPerformanceSummary();
		const webVitals = this.getCoreWebVitals();

		const performanceData = {
			summary,
			webVitals,
			timestamp: Date.now(),
			userAgent: navigator.userAgent,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			connection: navigator.connection
				? {
						effectiveType: navigator.connection.effectiveType,
						downlink: navigator.connection.downlink,
						rtt: navigator.connection.rtt,
					}
				: null,
		};

		// Send to analytics endpoint
		if (navigator.sendBeacon) {
			navigator.sendBeacon("/api/analytics/performance", JSON.stringify(performanceData));
		}

		logger.performance("Performance data sent", performanceData);
	}

	/**
	 * Cleanup observers
	 */
	cleanup() {
		for (const observer of this.observers.values()) {
			observer.disconnect();
		}
		this.observers.clear();
		this.metrics.clear();
	}
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitorService();

/**
 * React component for performance monitoring
 */
export function PerformanceMonitor({ pageType = "unknown", personalizationScore = 0, sectionCount = 0, ...props }) {
	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current) {
			performanceMonitor.initialize();
			initialized.current = true;
		}

		// Mark page-specific milestones
		performanceMonitor.mark(`${pageType}_start`);

		if (personalizationScore > 0) {
			performanceMonitor.mark("personalization_complete");
			performanceMonitor.trackMetric("personalization_score", personalizationScore);
		}

		if (sectionCount > 0) {
			performanceMonitor.trackMetric("sections_rendered", sectionCount);
		}

		// Send performance data on page unload
		const handleUnload = () => {
			performanceMonitor.mark(`${pageType}_end`);
			performanceMonitor.measure(`${pageType}_duration`, `${pageType}_start`, `${pageType}_end`);
			performanceMonitor.sendPerformanceData();
		};

		window.addEventListener("beforeunload", handleUnload);

		return () => {
			window.removeEventListener("beforeunload", handleUnload);
		};
	}, [pageType, personalizationScore, sectionCount]);

	// Component doesn't render anything visible
	return null;
}

// Export utilities
export const markPerformance = (name) => performanceMonitor.mark(name);
export const measurePerformance = (name, start, end) => performanceMonitor.measure(name, start, end);
export const trackMetric = (name, value) => performanceMonitor.trackMetric(name, value);
export const getPerformanceSummary = () => performanceMonitor.getPerformanceSummary();
export const getCoreWebVitals = () => performanceMonitor.getCoreWebVitals();
