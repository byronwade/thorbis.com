// lib/utils/webVitals.js - Advanced Web Vitals monitoring
import { logger } from "./logger.js";

// Web Vitals thresholds based on Google's recommendations
const VITALS_THRESHOLDS = {
	LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
	FID: { good: 100, needsImprovement: 300 }, // First Input Delay
	CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
	FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
	TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

// Performance metrics storage
const performanceMetrics = {
	pageLoad: null,
	vitals: {},
	resourceTiming: [],
};

// Get performance rating based on threshold
const getPerformanceRating = (metricName, value) => {
	const threshold = VITALS_THRESHOLDS[metricName];
	if (!threshold) return "unknown";

	if (value <= threshold.good) return "good";
	if (value <= threshold.needsImprovement) return "needs-improvement";
	return "poor";
};

// Enhanced Web Vitals observer
export const observeWebVitals = (callback) => {
	if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
		return;
	}

	try {
		// Largest Contentful Paint (LCP)
		const lcpObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];

			if (lastEntry) {
				const metric = {
					name: "LCP",
					value: lastEntry.startTime,
					rating: getPerformanceRating("LCP", lastEntry.startTime),
					timestamp: Date.now(),
				};

				performanceMetrics.vitals.LCP = metric;
				callback?.(metric);

				logger.debug("LCP measured:", metric);
			}
		});

		// First Input Delay (FID)
		const fidObserver = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				const metric = {
					name: "FID",
					value: entry.processingStart - entry.startTime,
					rating: getPerformanceRating("FID", entry.processingStart - entry.startTime),
					timestamp: Date.now(),
				};

				performanceMetrics.vitals.FID = metric;
				callback?.(metric);

				logger.debug("FID measured:", metric);
			});
		});

		// Cumulative Layout Shift (CLS)
		let clsValue = 0;
		const clsObserver = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				if (!entry.hadRecentInput) {
					clsValue += entry.value;
				}
			});

			const metric = {
				name: "CLS",
				value: clsValue,
				rating: getPerformanceRating("CLS", clsValue),
				timestamp: Date.now(),
			};

			performanceMetrics.vitals.CLS = metric;
			callback?.(metric);

			logger.debug("CLS measured:", metric);
		});

		// Register observers
		lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
		fidObserver.observe({ entryTypes: ["first-input"] });
		clsObserver.observe({ entryTypes: ["layout-shift"] });

		// Cleanup function
		return () => {
			lcpObserver.disconnect();
			fidObserver.disconnect();
			clsObserver.disconnect();
		};
	} catch (error) {
		logger.error("Failed to setup Web Vitals observers:", error);
	}
};

// Get comprehensive performance summary
export const getPerformanceSummary = () => {
	const navigation = performance.getEntriesByType("navigation")[0];

	return {
		...performanceMetrics,
		pageLoad: navigation
			? {
					domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
					loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
					totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
					rating: getPerformanceRating("LCP", navigation.loadEventEnd - navigation.fetchStart),
			  }
			: null,
		timestamp: Date.now(),
		userAgent: navigator.userAgent,
	};
};

// Initialize comprehensive performance monitoring
export const initPerformanceMonitoring = () => {
	if (typeof window === "undefined") return;

	const observers = [];

	// Setup all observers
	observers.push(observeWebVitals());

	// Send performance summary on page visibility change
	const handleVisibilityChange = () => {
		if (document.visibilityState === "hidden") {
			const summary = getPerformanceSummary();
			logger.info("Performance summary:", summary);
		}
	};

	document.addEventListener("visibilitychange", handleVisibilityChange);

	// Cleanup function
	return () => {
		observers.forEach((cleanup) => cleanup?.());
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	};
};

export default {
	observeWebVitals,
	getPerformanceSummary,
	initPerformanceMonitoring,
};
