const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Comprehensive logging utility with performance and security tracking
 * Implements enterprise-level logging with proper error handling
 */
const createLogger = () => {
	const loggerInstance = {
		info: (...args) => {
			try {
				if (isDevelopment) {
					console.log(...args);
				}
			} catch (error) {
				console.error("Logger.info error:", error);
			}
		},
		warn: (...args) => {
			try {
				if (isDevelopment) {
					console.warn(...args);
				}
			} catch (error) {
				console.error("Logger.warn error:", error);
			}
		},
		error: (...args) => {
			try {
				// Debug: Check what we're receiving
				if (process.env.NODE_ENV === "development") {
					console.debug("Logger.error received args:", {
						argsLength: args?.length,
						argsType: typeof args,
						isArray: Array.isArray(args),
						firstArg: args?.[0],
					});
				}

				// Ensure args is an array and handle edge cases
				const argsArray = Array.isArray(args) ? args : args ? Array.from(args) : [];

				let sanitizedArgs;
				try {
					sanitizedArgs = argsArray.map((arg) => {
						if (arg === null || arg === undefined) {
							return String(arg);
						}

						if (typeof arg === "object") {
							try {
								// Try to stringify the object safely
								const stringified = JSON.stringify(arg, null, 2);
								// If it's an empty object, provide more context
								if (stringified === "{}") {
									return "[Empty Object]";
								}
								return stringified;
							} catch (jsonError) {
								// If JSON.stringify fails, try toString
								try {
									return arg.toString();
								} catch (toStringError) {
									return "[Unserializable Object]";
								}
							}
						}

						if (typeof arg === "function") {
							return `[Function: ${arg.name || "anonymous"}]`;
						}

						return String(arg);
					});
				} catch (mapError) {
					// If map fails, just convert args to strings directly
					console.warn("Logger map failed, using fallback:", mapError);
					sanitizedArgs = argsArray.map((arg, index) => {
						try {
							return String(arg);
						} catch (stringError) {
							return `[Arg ${index}: Unprocessable]`;
						}
					});
				}

				// Always log errors, even in production
				console.error(...sanitizedArgs);
			} catch (error) {
				console.error("Logger.error error:", error);
				console.error("Original args that caused error:", args);
			}
		},
		debug: (...args) => {
			try {
				if (isDevelopment) {
					console.debug(...args);
				}
			} catch (error) {
				console.error("Logger.debug error:", error);
			}
		},
		performance: (...args) => {
			try {
				// Control performance logging with environment variable
				const enablePerformanceLogging = process.env.ENABLE_PERFORMANCE_LOGGING === 'true';
				
				// Only log performance in development if explicitly enabled, or in production for critical metrics
				if (enablePerformanceLogging || (!isDevelopment && args[0]?.includes?.('critical'))) {
					console.log("⚡ PERFORMANCE:", ...args);
				}
			} catch (error) {
				console.error("Logger.performance error:", error);
			}
		},
		security: (...args) => {
			try {
				// Always log security events
				console.log("🔒 SECURITY:", ...args);
			} catch (error) {
				console.error("Logger.security error:", error);
			}
		},
		critical: (...args) => {
			try {
				// Always log critical issues
				console.error("🚨 CRITICAL:", ...args);
			} catch (error) {
				console.error("Logger.critical error:", error);
			}
		},
		analytics: (...args) => {
			try {
				// Log analytics events in development, could be sent to analytics service in production
				if (isDevelopment) {
					console.log("📊 ANALYTICS:", ...args);
				}
				// In production, you might want to send this to an analytics service
			} catch (error) {
				console.error("Logger.analytics error:", error);
			}
		},
		interaction: (...args) => {
			try {
				// Log user interaction events for UX analytics
				if (isDevelopment) {
					console.log("👆 INTERACTION:", ...args);
				}
				// In production, you might want to send this to an analytics service
			} catch (error) {
				console.error("Logger.interaction error:", error);
			}
		},
		businessMetrics: (...args) => {
			try {
				// Log business-specific metrics
				if (isDevelopment) {
					console.log("📈 BUSINESS:", ...args);
				}
				// In production, you might want to send this to a business intelligence service
			} catch (error) {
				console.error("Logger.businessMetrics error:", error);
			}
		},
		// Additional methods for comprehensive logging
		api: (...args) => {
			try {
				if (isDevelopment) {
					console.log("🌐 API:", ...args);
				}
			} catch (error) {
				console.error("Logger.api error:", error);
			}
		},
		featureImpact: (...args) => {
			try {
				if (isDevelopment) {
					console.log("🎯 FEATURE IMPACT:", ...args);
				}
			} catch (error) {
				console.error("Logger.featureImpact error:", error);
			}
		},
		engagement: (...args) => {
			try {
				if (isDevelopment) {
					console.log("💫 ENGAGEMENT:", ...args);
				}
			} catch (error) {
				console.error("Logger.engagement error:", error);
			}
		},
		// Performance metrics collection
		getPerformanceMetrics() {
			try {
				if (typeof window === "undefined") {
					return { apiCalls: {}, pageLoads: {}, errors: {} };
				}

				// Get performance data from window if available
				const performanceData = window.performanceData || {};
				
				return {
					apiCalls: performanceData.apiCalls || {},
					pageLoads: performanceData.pageLoads || {},
					errors: performanceData.errors || {},
					memory: window.performance?.memory ? {
						used: window.performance.memory.usedJSHeapSize,
						limit: window.performance.memory.jsHeapSizeLimit,
						percentage: (window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit * 100).toFixed(2)
					} : null
				};
			} catch (error) {
				console.error("Logger.getPerformanceMetrics error:", error);
				return { apiCalls: {}, pageLoads: {}, errors: {} };
			}
		},
		// Throttled logs summary
		getThrottledLogsSummary() {
			try {
				return {
					totalLogs: 0,
					errorCount: 0,
					warningCount: 0,
					lastError: null
				};
			} catch (error) {
				console.error("Logger.getThrottledLogsSummary error:", error);
				return { totalLogs: 0, errorCount: 0, warningCount: 0, lastError: null };
			}
		},
	};

	// Ensure all methods are bound to the logger instance
	Object.keys(loggerInstance).forEach((key) => {
		if (typeof loggerInstance[key] === "function") {
			loggerInstance[key] = loggerInstance[key].bind(loggerInstance);
		}
	});

	return loggerInstance;
};

// Create the logger instance
const loggerInstance = createLogger();

// Ensure logger is available on window for debugging (development only)
if (typeof window !== "undefined" && isDevelopment) {
	window.logger = loggerInstance;
}

// Export both named and default exports for maximum compatibility
export const logger = loggerInstance;
export default loggerInstance;
