/**
 * Advanced Performance Monitor Component
 *
 * Real-time performance tracking and optimization monitoring:
 * - Core Web Vitals tracking
 * - Bundle performance metrics
 * - Cache hit rates
 * - Network optimization status
 * - User experience metrics
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";

// Performance thresholds based on Google's recommendations
const PERFORMANCE_THRESHOLDS = {
	LCP: { good: 2500, poor: 4000 },
	FID: { good: 100, poor: 300 },
	CLS: { good: 0.1, poor: 0.25 },
	FCP: { good: 1800, poor: 3000 },
	TTFB: { good: 800, poor: 1800 },
};

/**
 * Web Vitals measurement utilities
 */
class WebVitalsTracker {
	constructor() {
		this.metrics = {};
		this.observers = [];
		this.callbacks = new Set();
	}

	startTracking() {
		// Track Largest Contentful Paint (LCP)
		this.trackLCP();

		// Track First Input Delay (FID)
		this.trackFID();

		// Track Cumulative Layout Shift (CLS)
		this.trackCLS();

		// Track First Contentful Paint (FCP)
		this.trackFCP();

		// Track Time to First Byte (TTFB)
		this.trackTTFB();

		// Track custom metrics
		this.trackCustomMetrics();
	}

	trackLCP() {
		if ("PerformanceObserver" in window) {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1];

				this.updateMetric("LCP", {
					value: lastEntry.startTime,
					rating: this.getRating("LCP", lastEntry.startTime),
					element: lastEntry.element?.tagName || "unknown",
				});
			});

			observer.observe({ entryTypes: ["largest-contentful-paint"] });
			this.observers.push(observer);
		}
	}

	trackFID() {
		if ("PerformanceObserver" in window) {
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					this.updateMetric("FID", {
						value: entry.processingStart - entry.startTime,
						rating: this.getRating("FID", entry.processingStart - entry.startTime),
						eventType: entry.name,
					});
				}
			});

			observer.observe({ entryTypes: ["first-input"] });
			this.observers.push(observer);
		}
	}

	trackCLS() {
		if ("PerformanceObserver" in window) {
			let clsValue = 0;
			let sessionValue = 0;
			let sessionEntries = [];

			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (!entry.hadRecentInput) {
						sessionValue += entry.value;
						sessionEntries.push(entry);

						if (sessionValue > clsValue) {
							clsValue = sessionValue;

							this.updateMetric("CLS", {
								value: clsValue,
								rating: this.getRating("CLS", clsValue),
								sources: sessionEntries.length,
							});
						}
					}
				}
			});

			observer.observe({ entryTypes: ["layout-shift"] });
			this.observers.push(observer);
		}
	}

	trackFCP() {
		if ("PerformanceObserver" in window) {
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.name === "first-contentful-paint") {
						this.updateMetric("FCP", {
							value: entry.startTime,
							rating: this.getRating("FCP", entry.startTime),
						});
					}
				}
			});

			observer.observe({ entryTypes: ["paint"] });
			this.observers.push(observer);
		}
	}

	trackTTFB() {
		const navigation = performance.getEntriesByType("navigation")[0];
		if (navigation) {
			const ttfb = navigation.responseStart - navigation.requestStart;

			this.updateMetric("TTFB", {
				value: ttfb,
				rating: this.getRating("TTFB", ttfb),
			});
		}
	}

	trackCustomMetrics() {
		// Track bundle size
		if ("navigator" in window && "connection" in navigator) {
			this.updateMetric("CONNECTION", {
				effectiveType: navigator.connection.effectiveType,
				downlink: navigator.connection.downlink,
				saveData: navigator.connection.saveData,
			});
		}

		// Track memory usage
		if ("memory" in performance) {
			this.updateMetric("MEMORY", {
				used: performance.memory.usedJSHeapSize,
				total: performance.memory.totalJSHeapSize,
				limit: performance.memory.jsHeapSizeLimit,
			});
		}

		// Track cache performance
		this.trackCacheMetrics();
	}

	trackCacheMetrics() {
		// Listen for service worker messages about cache performance
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("message", (event) => {
				if (event.data.type === "SW_METRIC") {
					this.updateMetric("CACHE", event.data.data);
				}
			});
		}
	}

	getRating(metric, value) {
		const thresholds = PERFORMANCE_THRESHOLDS[metric];
		if (!thresholds) return "unknown";

		if (value <= thresholds.good) return "good";
		if (value <= thresholds.poor) return "needs-improvement";
		return "poor";
	}

	updateMetric(name, data) {
		this.metrics[name] = {
			...data,
			timestamp: Date.now(),
		};

		// Notify callbacks
		this.callbacks.forEach((callback) => {
			try {
				callback(name, this.metrics[name]);
			} catch (error) {
				console.warn("Performance callback error:", error);
			}
		});
	}

	subscribe(callback) {
		this.callbacks.add(callback);
		return () => this.callbacks.delete(callback);
	}

	getMetrics() {
		return { ...this.metrics };
	}

	cleanup() {
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
		this.callbacks.clear();
	}
}

// Global web vitals tracker
let webVitalsTracker = null;

/**
 * Performance Monitor Component
 */
export default function PerformanceMonitor({ showDetails = false, autoStart = true, position = "bottom-right" }) {
	const [metrics, setMetrics] = useState({});
	const [isVisible, setIsVisible] = useState(showDetails);
	const [isTracking, setIsTracking] = useState(false);
	const intervalRef = useRef(null);

	// Initialize tracking
	useEffect(() => {
		if (autoStart && typeof window !== "undefined") {
			startTracking();
		}

		return () => {
			stopTracking();
		};
	}, [autoStart]);

	const startTracking = () => {
		if (!webVitalsTracker) {
			webVitalsTracker = new WebVitalsTracker();
		}

		// Subscribe to metric updates
		const unsubscribe = webVitalsTracker.subscribe((name, data) => {
			setMetrics((prev) => ({
				...prev,
				[name]: data,
			}));
		});

		webVitalsTracker.startTracking();
		setIsTracking(true);

		// Update metrics periodically
		intervalRef.current = setInterval(() => {
			setMetrics(webVitalsTracker.getMetrics());
		}, 1000);

		return unsubscribe;
	};

	const stopTracking = () => {
		if (webVitalsTracker) {
			webVitalsTracker.cleanup();
			webVitalsTracker = null;
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		setIsTracking(false);
	};

	const getRatingColor = (rating) => {
		switch (rating) {
			case "good":
				return "bg-success/10 text-success border-green-200";
			case "needs-improvement":
				return "bg-warning/10 text-warning border-yellow-200";
			case "poor":
				return "bg-destructive/10 text-destructive border-red-200";
			default:
				return "bg-muted text-foreground border-border";
		}
	};

	const formatValue = (metric, value) => {
		if (typeof value !== "number") return "N/A";

		switch (metric) {
			case "CLS":
				return value.toFixed(3);
			case "LCP":
			case "FCP":
			case "FID":
			case "TTFB":
				return `${Math.round(value)}ms`;
			default:
				return value.toString();
		}
	};

	const getOverallScore = () => {
		const coreMetrics = ["LCP", "FID", "CLS"];
		const scores = coreMetrics.map((metric) => metrics[metric]?.rating).filter(Boolean);

		if (scores.length === 0) return "unknown";

		const goodCount = scores.filter((rating) => rating === "good").length;
		const poorCount = scores.filter((rating) => rating === "poor").length;

		if (goodCount === scores.length) return "good";
		if (poorCount > 0) return "poor";
		return "needs-improvement";
	};

	// Developer tools style positioning
	const getPositionClasses = () => {
		if (position === "dev-tools") {
			return "fixed bottom-0 left-0 right-0 z-50 max-h-[40vh] border-t-2 border-border bg-white";
		}
		if (position === "footer-widget") {
			return "w-full";
		}
		return `fixed ${position.includes("bottom") ? "bottom-4" : "top-4"} ${position.includes("right") ? "right-4" : "left-4"} z-50 w-96 max-h-[80vh] overflow-auto`;
	};

	if (!isVisible && !showDetails && position !== "dev-tools" && position !== "footer-widget") {
		return (
			<div className={`fixed ${position.includes("bottom") ? "bottom-4" : "top-4"} ${position.includes("right") ? "right-4" : "left-4"} z-50`}>
				<Button onClick={() => setIsVisible(true)} variant="outline" size="sm" className="shadow-lg">
					📊 Performance
				</Button>
			</div>
		);
	}

	// Developer tools style minimized state
	if (!isVisible && position === "dev-tools") {
		return (
			<div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
				<div className="flex items-center justify-between px-4 py-2">
					<Button onClick={() => setIsVisible(true)} variant="ghost" size="sm" className="text-sm font-medium">
						▲ NextFaster Performance Tools
					</Button>
					<Badge className={getRatingColor(getOverallScore())} variant="outline">
						{getOverallScore().replace("-", " ")}
					</Badge>
				</div>
			</div>
		);
	}

	// Footer widget minimized state
	if (!isVisible && position === "footer-widget") {
		return (
			<div className="flex items-center justify-between">
				<Button onClick={() => setIsVisible(true)} variant="ghost" size="sm" className="text-sm font-medium text-slate-300 hover:text-white">
					📊 Show Performance Details
				</Button>
				<Badge className={`${getRatingColor(getOverallScore())} bg-opacity-20 text-white border-slate-600`} variant="outline">
					{getOverallScore().replace("-", " ")}
				</Badge>
			</div>
		);
	}

	return (
		<div className={getPositionClasses()}>
			<Card className={position === "dev-tools" ? "border-0 rounded-none shadow-none" : position === "footer-widget" ? "border-0 shadow-none bg-transparent" : "shadow-lg border-2"}>
				<CardHeader className={position === "dev-tools" ? "pb-2 pt-2" : position === "footer-widget" ? "pb-2 pt-0" : "pb-3"}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<CardTitle className={position === "dev-tools" ? "text-sm font-medium" : position === "footer-widget" ? "text-sm font-medium text-slate-300" : "text-lg font-semibold"}>{position === "dev-tools" ? "NextFaster Performance Tools" : position === "footer-widget" ? "Performance Details" : "Performance Monitor"}</CardTitle>
							<Badge className={position === "footer-widget" ? `${getRatingColor(getOverallScore())} bg-opacity-20 text-white border-slate-600` : getRatingColor(getOverallScore())} variant={position === "dev-tools" || position === "footer-widget" ? "outline" : "default"}>
								{getOverallScore().replace("-", " ")}
							</Badge>
						</div>
						<div className="flex items-center gap-2">
							{position === "dev-tools" && (
								<Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 px-2 text-xs">
									▼ Minimize
								</Button>
							)}
							{position === "footer-widget" && (
								<Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-400 hover:text-white">
									▲ Hide
								</Button>
							)}
							{!showDetails && position !== "dev-tools" && position !== "footer-widget" && (
								<Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
									×
								</Button>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className={position === "dev-tools" ? "space-y-3 max-h-[35vh] overflow-y-auto" : position === "footer-widget" ? "space-y-3 pt-2" : "space-y-4"}>
					{/* Core Web Vitals */}
					<div>
						<h4 className={position === "dev-tools" ? "text-sm font-medium mb-1" : position === "footer-widget" ? "text-sm font-medium mb-1 text-slate-300" : "font-medium mb-2"}>Core Web Vitals</h4>
						<div className={position === "dev-tools" || position === "footer-widget" ? "flex gap-6" : "space-y-2"}>
							{["LCP", "FID", "CLS"].map((metric) => {
								const data = metrics[metric];
								return (
									<div key={metric} className={position === "dev-tools" || position === "footer-widget" ? "flex items-center gap-2" : "flex items-center justify-between"}>
										<span className={position === "footer-widget" ? "text-sm font-medium text-slate-300" : "text-sm font-medium"}>{metric}</span>
										<div className="flex items-center gap-2">
											<span className={position === "footer-widget" ? "text-sm text-slate-400" : "text-sm"}>{data ? formatValue(metric, data.value) : "Measuring..."}</span>
											{data && (
												<Badge variant="outline" className={`text-xs ${position === "footer-widget" ? `${getRatingColor(data.rating)} bg-opacity-20 text-white border-slate-600` : getRatingColor(data.rating)}`}>
													{data.rating}
												</Badge>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Additional Metrics */}
					<div>
						<h4 className="font-medium mb-2">Loading Performance</h4>
						<div className="space-y-2">
							{["FCP", "TTFB"].map((metric) => {
								const data = metrics[metric];
								return (
									<div key={metric} className="flex items-center justify-between">
										<span className="text-sm font-medium">{metric}</span>
										<span className="text-sm">{data ? formatValue(metric, data.value) : "Measuring..."}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Memory Usage */}
					{metrics.MEMORY && (
						<div>
							<h4 className="font-medium mb-2">Memory Usage</h4>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm">Used</span>
									<span className="text-sm">{Math.round(metrics.MEMORY.used / 1024 / 1024)}MB</span>
								</div>
								<Progress value={(metrics.MEMORY.used / metrics.MEMORY.limit) * 100} className="h-2" />
							</div>
						</div>
					)}

					{/* Cache Performance */}
					{metrics.CACHE && (
						<div>
							<h4 className="font-medium mb-2">Cache Performance</h4>
							<div className="flex items-center justify-between">
								<span className="text-sm">Hit Rate</span>
								<span className="text-sm">{metrics.CACHE.hitRate?.toFixed(1) || 0}%</span>
							</div>
						</div>
					)}

					{/* Connection Info */}
					{metrics.CONNECTION && (
						<div>
							<h4 className="font-medium mb-2">Connection</h4>
							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="text-sm">Type</span>
									<span className="text-sm capitalize">{metrics.CONNECTION.effectiveType}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Speed</span>
									<span className="text-sm">{metrics.CONNECTION.downlink}Mbps</span>
								</div>
								{metrics.CONNECTION.saveData && (
									<Badge variant="outline" className="text-xs">
										Data Saver On
									</Badge>
								)}
							</div>
						</div>
					)}

					{/* Controls */}
					<div className="flex gap-2 pt-2 border-t">
						<Button onClick={isTracking ? stopTracking : startTracking} variant={isTracking ? "destructive" : "default"} size="sm" className="flex-1">
							{isTracking ? "Stop Tracking" : "Start Tracking"}
						</Button>
						<Button
							onClick={() => {
								if (webVitalsTracker) {
									setMetrics(webVitalsTracker.getMetrics());
								}
							}}
							variant="outline"
							size="sm"
						>
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Performance Dashboard Component (for admin/development)
 */
export function PerformanceDashboard() {
	const [metrics, setMetrics] = useState({});
	const [history, setHistory] = useState([]);

	useEffect(() => {
		if (!webVitalsTracker) {
			webVitalsTracker = new WebVitalsTracker();
			webVitalsTracker.startTracking();
		}

		const unsubscribe = webVitalsTracker.subscribe((name, data) => {
			setMetrics((prev) => ({
				...prev,
				[name]: data,
			}));

			// Add to history
			setHistory((prev) => [
				...prev.slice(-99), // Keep last 100 entries
				{ metric: name, data, timestamp: Date.now() },
			]);
		});

		return unsubscribe;
	}, []);

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Core Web Vitals Cards */}
				{Object.entries(PERFORMANCE_THRESHOLDS).map(([metric, thresholds]) => {
					const data = metrics[metric];
					return (
						<Card key={metric}>
							<CardHeader>
								<CardTitle className="text-lg">{metric}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold mb-2">{data ? formatValue(metric, data.value) : "Measuring..."}</div>
								{data && <Badge className={getRatingColor(data.rating)}>{data.rating}</Badge>}
								<div className="mt-4 text-sm text-muted-foreground">
									<div>Good: ≤ {formatValue(metric, thresholds.good)}</div>
									<div>Poor: &gt; {formatValue(metric, thresholds.poor)}</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Performance History */}
			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Performance History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 overflow-auto">
						{history
							.slice(-20)
							.reverse()
							.map((entry, index) => (
								<div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
									<span className="font-medium">{entry.metric}</span>
									<span>{formatValue(entry.metric, entry.data.value)}</span>
									<Badge className={getRatingColor(entry.data.rating)}>{entry.data.rating}</Badge>
									<span className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</span>
								</div>
							))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Hook for performance metrics
 */
export function usePerformanceMetrics() {
	const [metrics, setMetrics] = useState({});

	useEffect(() => {
		if (!webVitalsTracker) {
			webVitalsTracker = new WebVitalsTracker();
			webVitalsTracker.startTracking();
		}

		const unsubscribe = webVitalsTracker.subscribe((name, data) => {
			setMetrics((prev) => ({
				...prev,
				[name]: data,
			}));
		});

		return unsubscribe;
	}, []);

	return metrics;
}
