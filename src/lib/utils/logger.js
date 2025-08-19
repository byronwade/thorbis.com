// Enhanced Logger with Performance Monitoring and Reduced Spam
// Provides structured logging with performance tracking and intelligent throttling

const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	CRITICAL: 4,
};

// Performance tracking
const performanceMetrics = {
	apiCalls: new Map(),
	componentRenders: new Map(),
	authOperations: new Map(),
	searchOperations: new Map(),
};

// Throttling to prevent log spam
const throttledLogs = new Map();
const THROTTLE_WINDOW = 5000; // 5 seconds

class EnhancedLogger {
	constructor() {
		this.level = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
		this.isDevelopment = process.env.NODE_ENV === 'development';
	}

	// Throttled logging to prevent spam
	_throttledLog(level, key, message, data = {}) {
		const now = Date.now();
		const logKey = `${level}_${key}`;
		const lastLog = throttledLogs.get(logKey);

		if (!lastLog || now - lastLog.timestamp > THROTTLE_WINDOW) {
			throttledLogs.set(logKey, { timestamp: now, count: 1 });
			this._log(level, message, data);
		} else {
			lastLog.count++;
			// Update the throttled log entry
			throttledLogs.set(logKey, lastLog);
		}
	}

	_log(level, message, data = {}) {
		if (level < this.level) return;

		const timestamp = new Date().toISOString();
		const logEntry = {
			timestamp,
			level: Object.keys(LOG_LEVELS)[level],
			message,
			...data,
		};

		// Development: Console logging with colors
		if (this.isDevelopment) {
			const colors = {
				DEBUG: '\x1b[36m', // Cyan
				INFO: '\x1b[32m',  // Green
				WARN: '\x1b[33m',  // Yellow
				ERROR: '\x1b[31m', // Red
				CRITICAL: '\x1b[35m', // Magenta
			};
			const reset = '\x1b[0m';
			
			console.log(`${colors[logEntry.level]}${logEntry.level}${reset} ${timestamp}: ${message}`, data);
		} else {
			// Production: Structured logging
			console.log(JSON.stringify(logEntry));
		}
	}

	// Performance logging with automatic tracking
	performance(message, data = {}) {
		const startTime = data.startTime || performance.now();
		const duration = performance.now() - startTime;
		
		// Track performance metrics
		if (data.operation) {
			const metrics = performanceMetrics[data.category] || performanceMetrics.apiCalls;
			const existing = metrics.get(data.operation) || { count: 0, totalTime: 0, avgTime: 0 };
			
			existing.count++;
			existing.totalTime += duration;
			existing.avgTime = existing.totalTime / existing.count;
			existing.lastTime = duration;
			
			metrics.set(data.operation, existing);
		}

		// Alert on slow operations
		if (duration > 1000) {
			this.warn(`Slow operation detected: ${message} took ${duration.toFixed(2)}ms`, {
				...data,
				duration,
				threshold: 1000,
			});
		}

		this._log(LOG_LEVELS.INFO, `⚡ PERFORMANCE: ${message}`, {
			...data,
			duration: `${duration.toFixed(2)}ms`,
		});
	}

	// API logging with performance tracking
	api(data) {
		const duration = data.responseTime || 0;
		
		// Track API performance
		if (data.endpoint) {
			const existing = performanceMetrics.apiCalls.get(data.endpoint) || { count: 0, totalTime: 0, avgTime: 0 };
			existing.count++;
			existing.totalTime += duration;
			existing.avgTime = existing.totalTime / existing.count;
			performanceMetrics.apiCalls.set(data.endpoint, existing);
		}

		// Alert on slow API calls
		if (duration > 2000) {
			this.warn(`Slow API call detected: ${data.endpoint} took ${duration.toFixed(2)}ms`, data);
		}

		this._log(LOG_LEVELS.INFO, `📡 API: ${data.endpoint}`, data);
	}

	// Security logging
	security(data) {
		this._log(LOG_LEVELS.WARN, `🔒 SECURITY: ${data.action}`, data);
	}

	// Business metrics logging
	businessMetrics(event, data = {}) {
		this._log(LOG_LEVELS.INFO, `📊 BUSINESS: ${event}`, data);
	}

	// User interaction logging
	interaction(eventName, data = {}) {
		this._log(LOG_LEVELS.INFO, `👆 INTERACTION: ${eventName}`, data);
	}

	// Error logging with context
	error(message, error = null, context = {}) {
		const errorData = {
			message: error?.message || message,
			stack: error?.stack,
			...context,
		};

		// Track error frequency
		const errorKey = `error_${message}`;
		this._throttledLog(LOG_LEVELS.ERROR, errorKey, `❌ ERROR: ${message}`, errorData);
	}

	// Warning logging with throttling
	warn(message, data = {}) {
		this._throttledLog(LOG_LEVELS.WARN, `warn_${message}`, `⚠️ WARN: ${message}`, data);
	}

	// Info logging
	info(message, data = {}) {
		this._log(LOG_LEVELS.INFO, `ℹ️ INFO: ${message}`, data);
	}

	// Debug logging (development only)
	debug(message, data = {}) {
		if (this.isDevelopment) {
			this._log(LOG_LEVELS.DEBUG, `🔍 DEBUG: ${message}`, data);
		}
	}

	// Critical logging for severe issues
	critical(message, data = {}) {
		this._log(LOG_LEVELS.CRITICAL, `🚨 CRITICAL: ${message}`, data);
		
		// In production, this could trigger alerts
		if (!this.isDevelopment) {
			// TODO: Send to monitoring service
			console.error('CRITICAL ERROR - Consider alerting:', { message, data });
		}
	}

	// Get performance metrics
	getPerformanceMetrics() {
		return {
			apiCalls: Object.fromEntries(performanceMetrics.apiCalls),
			componentRenders: Object.fromEntries(performanceMetrics.componentRenders),
			authOperations: Object.fromEntries(performanceMetrics.authOperations),
			searchOperations: Object.fromEntries(performanceMetrics.searchOperations),
		};
	}

	// Clear performance metrics
	clearPerformanceMetrics() {
		performanceMetrics.apiCalls.clear();
		performanceMetrics.componentRenders.clear();
		performanceMetrics.authOperations.clear();
		performanceMetrics.searchOperations.clear();
	}

	// Get throttled logs summary
	getThrottledLogsSummary() {
		const summary = {};
		for (const [key, value] of throttledLogs.entries()) {
			summary[key] = {
				lastTimestamp: value.timestamp,
				count: value.count,
				timeWindow: THROTTLE_WINDOW,
			};
		}
		return summary;
	}
}

// Export singleton instance
export const logger = new EnhancedLogger();

// Export for direct use
export default logger;
