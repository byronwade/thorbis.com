/**
 * Performance Budget Enforcement System
 * Enterprise-level performance monitoring and enforcement
 * Inspired by NextFaster and grep.app optimization strategies
 *
 * Features:
 * - Real-time budget monitoring
 * - Automatic performance alerts
 * - Bundle size enforcement
 * - Core Web Vitals tracking
 * - Resource loading optimization
 * - Performance regression detection
 */

import logger from "@lib/utils/logger";
import { observeWebVitals } from "@utils/web-vitals";

/**
 * Performance Budget Configuration
 */
export const PERFORMANCE_BUDGETS = {
	// Core Web Vitals Budgets (Google's "Good" thresholds)
	vitals: {
		LCP: {
			target: 2500, // 2.5s - Good
			warning: 4000, // 4s - Needs Improvement
			critical: 6000, // 6s - Poor
		},
		FID: {
			target: 100, // 100ms - Good
			warning: 300, // 300ms - Needs Improvement
			critical: 500, // 500ms - Poor
		},
		CLS: {
			target: 0.1, // 0.1 - Good
			warning: 0.25, // 0.25 - Needs Improvement
			critical: 0.4, // 0.4 - Poor
		},
		FCP: {
			target: 1800, // 1.8s - Good
			warning: 3000, // 3s - Needs Improvement
			critical: 4500, // 4.5s - Poor
		},
		TTFB: {
			target: 600, // 600ms - Good
			warning: 1200, // 1.2s - Needs Improvement
			critical: 2000, // 2s - Poor
		},
	},

	// Bundle Size Budgets
	bundles: {
		initial: {
			target: 200, // 200KB - Target
			warning: 300, // 300KB - Warning
			critical: 500, // 500KB - Critical
		},
		total: {
			target: 1000, // 1MB - Target
			warning: 1500, // 1.5MB - Warning
			critical: 2000, // 2MB - Critical
		},
		vendor: {
			target: 150, // 150KB - Target
			warning: 250, // 250KB - Warning
			critical: 400, // 400KB - Critical
		},
		async: {
			target: 100, // 100KB - Target per chunk
			warning: 150, // 150KB - Warning
			critical: 200, // 200KB - Critical
		},
	},

	// Resource Loading Budgets
	resources: {
		images: {
			target: 500, // 500KB total images
			warning: 1000, // 1MB - Warning
			critical: 2000, // 2MB - Critical
		},
		fonts: {
			target: 100, // 100KB total fonts
			warning: 200, // 200KB - Warning
			critical: 300, // 300KB - Critical
		},
		css: {
			target: 50, // 50KB total CSS
			warning: 100, // 100KB - Warning
			critical: 150, // 150KB - Critical
		},
	},

	// Memory Budgets
	memory: {
		heap: {
			target: 50, // 50MB - Target
			warning: 100, // 100MB - Warning
			critical: 200, // 200MB - Critical (in MB)
		},
		usage: {
			target: 70, // 70% - Target
			warning: 85, // 85% - Warning
			critical: 95, // 95% - Critical (percentage)
		},
	},

	// Performance Score Budgets
	scores: {
		lighthouse: {
			target: 90, // 90 - Target
			warning: 80, // 80 - Warning
			critical: 70, // 70 - Critical
		},
		overall: {
			target: 85, // 85 - Target
			warning: 75, // 75 - Warning
			critical: 65, // 65 - Critical
		},
	},
};

/**
 * Performance Budget Enforcer
 */
export class PerformanceBudgetEnforcer {
	constructor(budgets = PERFORMANCE_BUDGETS) {
		this.budgets = budgets;
		this.violations = [];
		this.metrics = {};
		this.observers = [];
		this.isMonitoring = false;
	}

	/**
	 * Start performance monitoring
	 */
	startMonitoring(options = {}) {
		if (this.isMonitoring) return;

		const {
			enableAlerts = true,
			enableLogging = true,
			checkInterval = 5000, // 5 seconds
			enableAutoCorrection = false,
		} = options;

		this.isMonitoring = true;
		this.enableAlerts = enableAlerts;
		this.enableLogging = enableLogging;
		this.enableAutoCorrection = enableAutoCorrection;

		logger.info("🚀 Performance budget monitoring started");

		// Monitor Core Web Vitals
		this.monitorWebVitals();

		// Monitor bundle sizes
		this.monitorBundleSizes();

		// Monitor resource loading
		this.monitorResourceLoading();

		// Monitor memory usage
		this.monitorMemoryUsage();

		// Periodic performance checks
		this.performanceCheckInterval = setInterval(() => {
			this.performPerformanceCheck();
		}, checkInterval);

		return () => this.stopMonitoring();
	}

	/**
	 * Stop performance monitoring
	 */
	stopMonitoring() {
		this.isMonitoring = false;

		// Cleanup observers
		this.observers.forEach((cleanup) => cleanup?.());
		this.observers = [];

		// Clear intervals
		if (this.performanceCheckInterval) {
			clearInterval(this.performanceCheckInterval);
		}

		logger.info("⛔ Performance budget monitoring stopped");
	}

	/**
	 * Monitor Core Web Vitals
	 */
	monitorWebVitals() {
		const cleanup = observeWebVitals((metric) => {
			this.metrics[metric.name] = metric;
			this.checkVitalsBudget(metric);
		});

		this.observers.push(cleanup);
	}

	/**
	 * Monitor bundle sizes
	 */
	monitorBundleSizes() {
		if (typeof window === "undefined") return;

		// Monitor script loading
		const originalAppendChild = document.head.appendChild;
		let totalBundleSize = 0;

		document.head.appendChild = function (element) {
			if (element.tagName === "SCRIPT" && element.src) {
				// Estimate script size (rough approximation)
				fetch(element.src, { method: "HEAD" })
					.then((response) => {
						const size = parseInt(response.headers.get("content-length")) || 0;
						totalBundleSize += size;

						this.checkBundleBudget("total", totalBundleSize);
					})
					.catch(() => {
						// Ignore fetch errors for budget checking
					});
			}

			return originalAppendChild.call(this, element);
		}.bind(this);
	}

	/**
	 * Monitor resource loading
	 */
	monitorResourceLoading() {
		if (!("PerformanceObserver" in window)) return;

		const resourceObserver = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				this.checkResourceBudget(entry);
			});
		});

		resourceObserver.observe({ entryTypes: ["resource"] });
		this.observers.push(() => resourceObserver.disconnect());
	}

	/**
	 * Monitor memory usage
	 */
	monitorMemoryUsage() {
		if (!("memory" in performance)) return;

		const checkMemory = () => {
			const memory = performance.memory;
			const usageMB = memory.usedJSHeapSize / (1024 * 1024);
			const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

			this.checkMemoryBudget(usageMB, usagePercent);
		};

		// Check memory every 10 seconds
		const memoryInterval = setInterval(checkMemory, 10000);
		this.observers.push(() => clearInterval(memoryInterval));

		// Initial check
		checkMemory();
	}

	/**
	 * Check Core Web Vitals against budget
	 */
	checkVitalsBudget(metric) {
		const budget = this.budgets.vitals[metric.name];
		if (!budget) return;

		const violation = this.createViolation("vitals", metric.name, metric.value, budget);

		if (violation) {
			this.handleViolation(violation);
		}
	}

	/**
	 * Check bundle size against budget
	 */
	checkBundleBudget(type, size) {
		const budget = this.budgets.bundles[type];
		if (!budget) return;

		const sizeKB = size / 1024;
		const violation = this.createViolation("bundle", type, sizeKB, budget);

		if (violation) {
			this.handleViolation(violation);
		}
	}

	/**
	 * Check resource loading against budget
	 */
	checkResourceBudget(entry) {
		const size = entry.transferSize || 0;
		const duration = entry.duration || 0;

		// Categorize resource
		let category = "other";
		if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
			category = "images";
		} else if (entry.name.match(/\.(woff|woff2|ttf|eot)$/i)) {
			category = "fonts";
		} else if (entry.name.match(/\.css$/i)) {
			category = "css";
		}

		// Check against budget
		const budget = this.budgets.resources[category];
		if (budget && size > budget.critical * 1024) {
			const violation = this.createViolation("resource", category, size / 1024, budget);
			this.handleViolation(violation);
		}

		// Check loading time
		if (duration > 3000) {
			// 3 seconds
			this.handleViolation({
				type: "resource",
				subtype: "loading_time",
				value: duration,
				threshold: 3000,
				severity: "warning",
				message: `Slow resource loading: ${entry.name} took ${duration.toFixed(2)}ms`,
				entry,
			});
		}
	}

	/**
	 * Check memory usage against budget
	 */
	checkMemoryBudget(usageMB, usagePercent) {
		const heapBudget = this.budgets.memory.heap;
		const usageBudget = this.budgets.memory.usage;

		// Check heap size
		const heapViolation = this.createViolation("memory", "heap", usageMB, heapBudget);
		if (heapViolation) {
			this.handleViolation(heapViolation);
		}

		// Check usage percentage
		const usageViolation = this.createViolation("memory", "usage", usagePercent, usageBudget);
		if (usageViolation) {
			this.handleViolation(usageViolation);
		}
	}

	/**
	 * Create violation object
	 */
	createViolation(type, subtype, value, budget) {
		let severity = null;
		let threshold = null;

		if (value >= budget.critical) {
			severity = "critical";
			threshold = budget.critical;
		} else if (value >= budget.warning) {
			severity = "warning";
			threshold = budget.warning;
		} else if (value > budget.target) {
			severity = "info";
			threshold = budget.target;
		}

		if (!severity) return null;

		return {
			type,
			subtype,
			value,
			threshold,
			severity,
			timestamp: Date.now(),
			message: `${type.toUpperCase()} budget ${severity}: ${subtype} = ${value} (threshold: ${threshold})`,
		};
	}

	/**
	 * Handle performance budget violation
	 */
	handleViolation(violation) {
		this.violations.push(violation);

		// Keep only last 100 violations
		if (this.violations.length > 100) {
			this.violations = this.violations.slice(-100);
		}

		// Log violation
		if (this.enableLogging) {
			const logLevel = violation.severity === "critical" ? "error" : violation.severity === "warning" ? "warn" : "info";

			logger[logLevel](`⚠️  Performance Budget Violation:`, violation);
		}

		// Send alert
		if (this.enableAlerts) {
			this.sendAlert(violation);
		}

		// Auto-correction
		if (this.enableAutoCorrection) {
			this.attemptAutoCorrection(violation);
		}
	}

	/**
	 * Send performance alert
	 */
	sendAlert(violation) {
		// Send to analytics
		if (typeof gtag !== "undefined") {
			gtag("event", "performance_budget_violation", {
				event_category: "Performance",
				event_label: `${violation.type}_${violation.subtype}`,
				value: Math.round(violation.value),
				custom_parameters: {
					severity: violation.severity,
					threshold: violation.threshold,
				},
			});
		}

		// Log to console for development (monitoring service removed)
		if (process.env.NODE_ENV === "development") {
			console.warn("Performance violation:", {
				type: "performance_violation",
				violation,
				url: window.location.href,
				userAgent: navigator.userAgent,
				timestamp: Date.now(),
			});
		}

		// Console alert for critical violations
		if (violation.severity === "critical" && process.env.NODE_ENV === "development") {
			console.error("🚨 CRITICAL PERFORMANCE VIOLATION:", violation.message);
		}
	}

	/**
	 * Attempt automatic performance correction
	 */
	attemptAutoCorrection(violation) {
		switch (violation.type) {
			case "memory":
				if (violation.subtype === "heap" && window.gc) {
					logger.info("🧹 Triggering garbage collection");
					window.gc();
				}
				break;

			case "resource":
				if (violation.subtype === "images") {
					logger.info("🖼️  Reducing image quality for future loads");
					// Implement image quality reduction
					this.reduceImageQuality();
				}
				break;

			case "bundle":
				logger.info("📦 Bundle size violation detected - consider code splitting");
				break;

			default:
				break;
		}
	}

	/**
	 * Reduce image quality for performance
	 */
	reduceImageQuality() {
		// Find all images and reduce quality
		const images = document.querySelectorAll("img[src*='?']");
		images.forEach((img) => {
			const url = new URL(img.src);
			if (url.searchParams.has("q")) {
				const currentQuality = parseInt(url.searchParams.get("q"));
				if (currentQuality > 60) {
					url.searchParams.set("q", "60");
					img.src = url.toString();
				}
			}
		});
	}

	/**
	 * Perform comprehensive performance check
	 */
	performPerformanceCheck() {
		const summary = {
			violations: this.violations.filter((v) => v.timestamp > Date.now() - 60000), // Last minute
			metrics: this.metrics,
			budget_status: this.getBudgetStatus(),
			timestamp: Date.now(),
		};

		if (this.enableLogging) {
			logger.debug("📊 Performance budget status:", summary);
		}

		return summary;
	}

	/**
	 * Get current budget status
	 */
	getBudgetStatus() {
		const status = {
			vitals: {},
			overall: "good", // good, warning, critical
		};

		let criticalCount = 0;
		let warningCount = 0;

		// Check each vital
		Object.entries(this.budgets.vitals).forEach(([vital, budget]) => {
			const metric = this.metrics[vital];
			if (!metric) {
				status.vitals[vital] = "unknown";
				return;
			}

			if (metric.value >= budget.critical) {
				status.vitals[vital] = "critical";
				criticalCount++;
			} else if (metric.value >= budget.warning) {
				status.vitals[vital] = "warning";
				warningCount++;
			} else {
				status.vitals[vital] = "good";
			}
		});

		// Determine overall status
		if (criticalCount > 0) {
			status.overall = "critical";
		} else if (warningCount > 1) {
			status.overall = "warning";
		} else {
			status.overall = "good";
		}

		return status;
	}

	/**
	 * Get performance report
	 */
	getPerformanceReport() {
		return {
			budgets: this.budgets,
			violations: this.violations,
			metrics: this.metrics,
			status: this.getBudgetStatus(),
			isMonitoring: this.isMonitoring,
		};
	}
}

// Export singleton instance
export const performanceBudget = new PerformanceBudgetEnforcer();

// Auto-start monitoring in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
	performanceBudget.startMonitoring({
		enableAlerts: true,
		enableLogging: true,
		enableAutoCorrection: true,
	});
}

export default performanceBudget;
