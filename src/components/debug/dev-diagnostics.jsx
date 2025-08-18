"use client";

import React, { useEffect, useState, useRef } from "react";
import { logger } from "@utils/logger";

const DevDiagnostics = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [performanceMetrics, setPerformanceMetrics] = useState({});
	const [throttledLogs, setThrottledLogs] = useState({});
	const [logs, setLogs] = useState([]);
	const intervalRef = useRef(null);

	useEffect(() => {
		// Only show in development
		if (process.env.NODE_ENV !== "development") return;

		// Update metrics every 10 seconds (reduced frequency to prevent performance impact)
		intervalRef.current = setInterval(() => {
			try {
				// Defer state updates to prevent useInsertionEffect errors
				setTimeout(() => {
					setPerformanceMetrics(logger.getPerformanceMetrics());
					setThrottledLogs(logger.getThrottledLogsSummary());
				}, 0);
			} catch (error) {
				// Silently handle logger errors to prevent loops
			}
		}, 10000);

		// Capture console logs for debugging
		const originalLog = console.log;
		const originalWarn = console.warn;
		const originalError = console.error;

		let isLoggingGeneral = false;
		console.log = (...args) => {
			originalLog.apply(console, args);
			if (isLoggingGeneral) return;
			isLoggingGeneral = true;
			// Defer state update to prevent useInsertionEffect errors
			setTimeout(() => {
				setLogs(prev => [...prev.slice(-50), { type: 'log', message: args.join(' '), timestamp: Date.now() }]);
				isLoggingGeneral = false;
			}, 0);
		};

		console.warn = (...args) => {
			originalWarn.apply(console, args);
			if (isLoggingGeneral) return;
			isLoggingGeneral = true;
			// Defer state update to prevent useInsertionEffect errors
			setTimeout(() => {
				setLogs(prev => [...prev.slice(-50), { type: 'warn', message: args.join(' '), timestamp: Date.now() }]);
				isLoggingGeneral = false;
			}, 0);
		};

		let isLoggingError = false;
		console.error = (...args) => {
			originalError.apply(console, args);
			
			// Prevent infinite loops from useInsertionEffect errors
			if (isLoggingError) return;
			const message = args[0];
			if (typeof message === 'string' && message.includes('useInsertionEffect')) return;
			
			isLoggingError = true;
			// Defer state update to prevent useInsertionEffect errors
			setTimeout(() => {
				setLogs(prev => [...prev.slice(-50), { type: 'error', message: args.join(' '), timestamp: Date.now() }]);
				isLoggingError = false;
			}, 0);
		};

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			console.log = originalLog;
			console.warn = originalWarn;
			console.error = originalError;
		};
	}, []);

	// Performance monitoring
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Monitor Core Web Vitals
		if ("PerformanceObserver" in window) {
			try {
				const observer = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						if (entry.entryType === "largest-contentful-paint") {
							logger.performance("LCP", { value: entry.startTime, element: entry.element?.tagName });
						}
						if (entry.entryType === "first-input") {
							logger.performance("FID", { value: entry.processingStart - entry.startTime });
						}
					}
				});

				observer.observe({ entryTypes: ["largest-contentful-paint", "first-input"] });
			} catch (error) {
				logger.debug("Performance Observer not available");
			}
		}

		// Monitor memory usage
		if (window.performance?.memory) {
			setInterval(() => {
				const memory = window.performance.memory;
				if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
					logger.warn("High memory usage detected", {
						used: memory.usedJSHeapSize,
						limit: memory.jsHeapSizeLimit,
						percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
					});
				}
			}, 30000); // Check every 30 seconds
		}
	}, []);

	if (process.env.NODE_ENV !== "development") return null;

	return (
		<>
			{/* Toggle Button */}
			<button
				onClick={() => setIsVisible(!isVisible)}
				className="fixed bottom-4 right-4 z-50 bg-black text-white px-3 py-2 rounded-md text-sm font-mono shadow-lg"
			>
				{isVisible ? "Hide" : "Show"} Diagnostics
			</button>

			{/* Diagnostics Panel */}
			{isVisible && (
				<div className="fixed bottom-16 right-4 z-50 bg-black text-white p-4 rounded-md shadow-lg max-w-md max-h-96 overflow-auto text-xs font-mono">
					<h3 className="font-bold mb-2 text-green-400">🔧 Dev Diagnostics</h3>
					
					{/* Performance Metrics */}
					<div className="mb-4">
						<h4 className="font-semibold text-blue-400 mb-1">⚡ Performance</h4>
						{Object.entries(performanceMetrics.apiCalls || {}).map(([endpoint, metrics]) => (
							<div key={endpoint} className="mb-1">
								<div className="text-gray-300">{endpoint}</div>
								<div className="text-gray-400 text-xs">
									Avg: {metrics.avgTime?.toFixed(2)}ms | Count: {metrics.count}
								</div>
							</div>
						))}
					</div>

					{/* Throttled Logs */}
					<div className="mb-4">
						<h4 className="font-semibold text-yellow-400 mb-1">⚠️ Throttled Logs</h4>
						{Object.entries(throttledLogs).map(([key, data]) => (
							<div key={key} className="mb-1">
								<div className="text-gray-300">{key}</div>
								<div className="text-gray-400 text-xs">
									Count: {data.count} | Last: {new Date(data.lastTimestamp).toLocaleTimeString()}
								</div>
							</div>
						))}
					</div>

					{/* Recent Logs */}
					<div className="mb-4">
						<h4 className="font-semibold text-purple-400 mb-1">📝 Recent Logs</h4>
						<div className="max-h-32 overflow-auto">
							{logs.slice(-10).map((log, index) => (
								<div key={index} className={`mb-1 text-xs ${
									log.type === 'error' ? 'text-red-400' : 
									log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
								}`}>
									{log.message.substring(0, 100)}...
								</div>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<button
							onClick={() => logger.clearPerformanceMetrics()}
							className="bg-red-600 text-white px-2 py-1 rounded text-xs"
						>
							Clear Metrics
						</button>
						<button
							onClick={() => setLogs([])}
							className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
						>
							Clear Logs
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default DevDiagnostics;


