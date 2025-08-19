"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { StatsigClient } from "@statsig/js-client";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import { services } from "@config";
import logger from "@lib/utils/logger";
import { AnalyticsMutations } from "@lib/database/supabase/mutations/analytics";

/**
 * Statsig Context - Performance-First Analytics with Session Replay
 * Integrates with existing analytics infrastructure without removing features
 */

const StatsigContext = createContext({
	client: null,
	isInitialized: false,
	isLoading: true,
	error: null,
	user: null,
	logEvent: () => {},
	updateUser: () => {},
	flush: () => {},
	checkGate: () => false,
	getConfig: () => null,
	getExperiment: () => null,
	performance: {
		initTime: 0,
		eventCount: 0,
		avgEventTime: 0,
	},
});

/**
 * High-Performance Statsig Provider
 * Implements intelligent initialization with performance monitoring
 */
export const StatsigProvider = ({ children, initialUser = null }) => {
	const [client, setClient] = useState(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [user, setUser] = useState(initialUser);
	const [performance, setPerformance] = useState({
		initTime: 0,
		eventCount: 0,
		avgEventTime: 0,
	});

	const initializationRef = useRef(false);
	const eventTimesRef = useRef([]);
	const configRef = useRef(services.analytics.providers.statsig);

	/**
	 * Initialize Statsig client with performance monitoring
	 * Only initializes if enabled and not already initialized
	 */
	const initializeStatsig = useCallback(async () => {
		// Prevent double initialization
		if (initializationRef.current || !configRef.current.enabled) {
			return;
		}

		initializationRef.current = true;
		const startTime = performance.now();

		try {
			logger.info("🚀 Initializing Statsig client...");

			// Prepare plugins based on configuration
			const plugins = [];

			// Session Replay Plugin (with performance consideration)
			if (configRef.current.sessionReplay.enabled) {
				plugins.push(
					new StatsigSessionReplayPlugin({
						sampleRate: configRef.current.sessionReplay.sampleRate,
						// Performance optimizations
						maxSessionDuration: 30 * 60 * 1000, // 30 minutes max
						captureConsoleLog: false, // Reduce overhead
						captureNetworkRequests: true,
						maskAllInputs: true, // Privacy first
					})
				);
				logger.debug("Statsig Session Replay plugin enabled");
			}

			// Web Analytics Plugin (with auto-capture)
			if (configRef.current.webAnalytics.enabled) {
				plugins.push(
					new StatsigAutoCapturePlugin({
						captureClicks: configRef.current.webAnalytics.autoCapture,
						capturePageViews: configRef.current.webAnalytics.autoCapture,
						captureFormSubmissions: configRef.current.webAnalytics.autoCapture,
						// Performance optimizations
						debounceDelay: 250, // Reduce event spam
						batchEvents: true,
						batchSize: services.analytics.performance.batchSize,
						flushInterval: services.analytics.performance.flushInterval,
					})
				);
				logger.debug("Statsig Web Analytics plugin enabled");
			}

			// Initialize Statsig client
			const statsigClient = new StatsigClient(configRef.current.clientApiKey, user || { userID: `anonymous_${Date.now()}` }, {
				plugins,
				// Performance optimizations
				environment: {
					tier: process.env.NODE_ENV === "production" ? "production" : "development",
				},
				// Network configuration
				api: {
					retryLimit: services.analytics.performance.maxRetries,
					networkTimeout: 5000, // 5 second timeout
				},
				// Local storage optimization
				localMode: false, // Use server for feature gates
				disableCurrentVCExposureLogging: true, // Reduce log volume
			});

			// Initialize with timeout protection
			const initPromise = statsigClient.initializeAsync();
			const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Statsig initialization timeout")), configRef.current.performanceBudget.maxInitTime));

			await Promise.race([initPromise, timeoutPromise]);

			const initTime = performance.now() - startTime;

			// Validate initialization performance
			if (initTime > configRef.current.performanceBudget.maxInitTime) {
				logger.warn(`Statsig initialization exceeded budget: ${initTime.toFixed(2)}ms > ${configRef.current.performanceBudget.maxInitTime}ms`);
			}

			setClient(statsigClient);
			setIsInitialized(true);
			setIsLoading(false);
			setPerformance((prev) => ({ ...prev, initTime }));

			// Track initialization success in existing analytics system
			await AnalyticsMutations.trackEvent({
				eventType: "statsig_initialized",
				eventData: {
					initTime,
					plugins: plugins.map((p) => p.constructor.name),
					userType: user ? "authenticated" : "anonymous",
				},
				userId: user?.userID,
			});

			logger.info(`✅ Statsig initialized successfully in ${initTime.toFixed(2)}ms`);
		} catch (initError) {
			const initTime = performance.now() - startTime;
			logger.error("❌ Statsig initialization failed:", initError);

			setError(initError.message);
			setIsLoading(false);

			// Track initialization failure
			await AnalyticsMutations.trackEvent({
				eventType: "statsig_init_failed",
				eventData: {
					error: initError.message,
					initTime,
				},
				userId: user?.userID,
			});
		}
	}, [user]);

	/**
	 * Performance-monitored event logging
	 * Integrates with existing analytics system
	 */
	const logEvent = useCallback(
		async (eventName, value = null, metadata = {}) => {
			if (!client || !isInitialized) {
				logger.warn("Statsig client not initialized, queuing event:", eventName);
				return;
			}

			const startTime = performance.now();

			try {
				// Log to Statsig
				client.logEvent(eventName, value, metadata);

				// Also log to existing analytics system for consistency
				await AnalyticsMutations.trackEvent({
					eventType: eventName,
					eventData: {
						value,
						metadata,
						source: "statsig",
					},
					userId: user?.userID,
				});

				// Performance tracking
				const eventTime = performance.now() - startTime;
				eventTimesRef.current.push(eventTime);

				// Keep only last 100 measurements
				if (eventTimesRef.current.length > 100) {
					eventTimesRef.current.shift();
				}

				// Update performance metrics
				const avgEventTime = eventTimesRef.current.reduce((a, b) => a + b, 0) / eventTimesRef.current.length;

				setPerformance((prev) => ({
					...prev,
					eventCount: prev.eventCount + 1,
					avgEventTime,
				}));

				// Alert on slow events
				if (eventTime > configRef.current.performanceBudget.maxEventProcessingTime) {
					logger.warn(`Slow Statsig event: ${eventName} took ${eventTime.toFixed(2)}ms`);
				}

				logger.debug(`Statsig event logged: ${eventName} (${eventTime.toFixed(2)}ms)`);
			} catch (eventError) {
				logger.error("Statsig event logging error:", eventError);
			}
		},
		[client, isInitialized, user]
	);

	/**
	 * Update user information with re-initialization if needed
	 */
	const updateUser = useCallback(
		async (newUser) => {
			setUser(newUser);

			if (client && isInitialized) {
				try {
					await client.updateUser(newUser);
					logger.debug("Statsig user updated:", newUser.userID);
				} catch (updateError) {
					logger.error("Statsig user update error:", updateError);
				}
			}
		},
		[client, isInitialized]
	);

	/**
	 * Flush events immediately (useful for page unload)
	 */
	const flush = useCallback(async () => {
		if (client && isInitialized) {
			try {
				await client.flush();
				logger.debug("Statsig events flushed");
			} catch (flushError) {
				logger.error("Statsig flush error:", flushError);
			}
		}
	}, [client, isInitialized]);

	/**
	 * Feature gate checking with fallback
	 */
	const checkGate = useCallback(
		(gateName, defaultValue = false) => {
			if (!client || !isInitialized) {
				return defaultValue;
			}

			try {
				return client.checkGate(gateName);
			} catch (gateError) {
				logger.error(`Statsig gate check error for ${gateName}:`, gateError);
				return defaultValue;
			}
		},
		[client, isInitialized]
	);

	/**
	 * Get dynamic config with fallback
	 */
	const getConfig = useCallback(
		(configName, defaultValue = null) => {
			if (!client || !isInitialized) {
				return defaultValue;
			}

			try {
				const config = client.getConfig(configName);
				return config.value || defaultValue;
			} catch (configError) {
				logger.error(`Statsig config error for ${configName}:`, configError);
				return defaultValue;
			}
		},
		[client, isInitialized]
	);

	/**
	 * Get experiment data with fallback
	 */
	const getExperiment = useCallback(
		(experimentName, defaultValue = null) => {
			if (!client || !isInitialized) {
				return defaultValue;
			}

			try {
				const experiment = client.getExperiment(experimentName);
				return experiment.value || defaultValue;
			} catch (experimentError) {
				logger.error(`Statsig experiment error for ${experimentName}:`, experimentError);
				return defaultValue;
			}
		},
		[client, isInitialized]
	);

	// Initialize on mount and user changes
	useEffect(() => {
		if (typeof window !== "undefined" && configRef.current.enabled) {
			initializeStatsig();
		}
	}, [initializeStatsig]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (client) {
				client.flush().catch((error) => logger.error("Statsig cleanup flush error:", error));
			}
		};
	}, [client]);

	// Page unload event handler
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (client && isInitialized) {
				// Synchronous flush for page unload
				client.flush();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [client, isInitialized]);

	const contextValue = {
		client,
		isInitialized,
		isLoading,
		error,
		user,
		logEvent,
		updateUser,
		flush,
		checkGate,
		getConfig,
		getExperiment,
		performance,
	};

	return <StatsigContext.Provider value={contextValue}>{children}</StatsigContext.Provider>;
};

/**
 * Hook to use Statsig context
 */
export const useStatsig = () => {
	const context = useContext(StatsigContext);
	if (!context) {
		throw new Error("useStatsig must be used within a StatsigProvider");
	}
	return context;
};

/**
 * Hook for performance-optimized event logging
 */
export const useStatsigEvent = () => {
	const { logEvent, isInitialized } = useStatsig();

	return useCallback(
		(eventName, value, metadata) => {
			if (isInitialized) {
				logEvent(eventName, value, metadata);
			}
		},
		[logEvent, isInitialized]
	);
};

/**
 * Hook for feature gates with caching
 */
export const useStatsigGate = (gateName, defaultValue = false) => {
	const { checkGate, isInitialized } = useStatsig();
	const [gateValue, setGateValue] = useState(defaultValue);

	useEffect(() => {
		if (isInitialized) {
			setGateValue(checkGate(gateName, defaultValue));
		}
	}, [checkGate, gateName, defaultValue, isInitialized]);

	return gateValue;
};

export default StatsigContext;
