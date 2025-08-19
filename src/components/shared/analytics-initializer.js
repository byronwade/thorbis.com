"use client";

import { useEffect, useRef } from "react";
import { useStatsig } from "@context/statsig-context";
import { useAuth } from "@context/auth-context";
import { UnifiedAnalytics } from "@utils/statsig-analytics";
import logger from "@lib/utils/logger";

/**
 * Analytics Initializer Component
 * Connects all analytics providers and sets up unified tracking
 * Implements performance monitoring and error handling
 */
const AnalyticsInitializer = () => {
	const { client: statsigClient, isInitialized: statsigInitialized } = useStatsig();
	const { user } = useAuth();
	const isInitializedRef = useRef(false);

	/**
	 * Initialize unified analytics system
	 */
	useEffect(() => {
		const initializeAnalytics = async () => {
			if (isInitializedRef.current) return;

			try {
				logger.info("🚀 Initializing Analytics System...");

				// Wait for Statsig to be ready
				if (!statsigInitialized || !statsigClient) {
					logger.debug("Waiting for Statsig initialization...");
					return;
				}

				// Prepare providers object
				const providers = {
					statsig: statsigClient,
				};

				// Initialize PostHog if enabled (placeholder for future implementation)
				if (typeof window !== "undefined" && window.posthog) {
					providers.posthog = window.posthog;
					logger.debug("PostHog provider detected");
				}

				// Initialize Google Analytics if enabled (placeholder for future implementation)
				if (typeof gtag !== "undefined") {
					providers.googleAnalytics = { gtag };
					logger.debug("Google Analytics provider detected");
				}

				// Initialize unified analytics
				await UnifiedAnalytics.initialize(providers);

				isInitializedRef.current = true;
				logger.info("✅ Analytics System initialized successfully");

				// Track initialization
				UnifiedAnalytics.trackEvent("analytics_system_ready", {
					providers: Object.keys(providers),
					user_authenticated: !!user,
				});
			} catch (error) {
				logger.error("❌ Failed to initialize Analytics System:", error);
			}
		};

		initializeAnalytics();
	}, [statsigInitialized, statsigClient, user]);

	/**
	 * Update user identification when user changes
	 */
	useEffect(() => {
		if (isInitializedRef.current && user) {
			UnifiedAnalytics.identify(user.id, {
				email: user.email,
				name: user.user_metadata?.name || user.email,
				plan: user.user_metadata?.plan || "free",
				created_at: user.created_at,
			});

			logger.debug("User identified in analytics:", user.id);
		}
	}, [user]);

	/**
	 * Setup page visibility change tracking
	 */
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				// Flush analytics when page becomes hidden
				UnifiedAnalytics.flush();
			} else if (document.visibilityState === "visible") {
				// Track page became visible
				UnifiedAnalytics.trackEvent("page_visible");
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	/**
	 * Setup performance monitoring
	 */
	useEffect(() => {
		// Monitor Core Web Vitals and report to analytics
		const reportWebVitals = (metric) => {
			if (isInitializedRef.current) {
				UnifiedAnalytics.trackEvent("web_vital", {
					name: metric.name,
					value: metric.value,
					rating: metric.rating,
					delta: metric.delta,
				});
			}
		};

		// Monitor Largest Contentful Paint
		if (typeof window !== "undefined" && "PerformanceObserver" in window) {
			try {
				const observer = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						if (entry.entryType === "largest-contentful-paint") {
							reportWebVitals({
								name: "LCP",
								value: entry.startTime,
								rating: entry.startTime < 2500 ? "good" : entry.startTime < 4000 ? "needs-improvement" : "poor",
								delta: entry.startTime,
							});
						}
					}
				});

				observer.observe({ entryTypes: ["largest-contentful-paint"] });

				return () => observer.disconnect();
			} catch (error) {
				logger.error("Performance monitoring setup error:", error);
			}
		}
	}, []);

	/**
	 * Setup error boundary for analytics
	 */
	useEffect(() => {
		const handleAnalyticsError = (error) => {
			if (isInitializedRef.current) {
				UnifiedAnalytics.trackEvent("analytics_error", {
					message: error.message,
					stack: error.stack,
					timestamp: Date.now(),
				});
			}
		};

		// Global error handler for analytics-specific errors
		window.addEventListener("error", (event) => {
			if (event.error && event.error.message?.includes("analytics")) {
				handleAnalyticsError(event.error);
			}
		});

		return () => {
			window.removeEventListener("error", handleAnalyticsError);
		};
	}, []);

	// This component doesn't render anything
	return null;
};

export default AnalyticsInitializer;
