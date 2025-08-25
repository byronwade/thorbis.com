"use client";

import React, { useEffect, useState, useRef } from "react";
import logger from "@lib/utils/logger";

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
					try {
						setPerformanceMetrics(logger.getPerformanceMetrics());
						setThrottledLogs(logger.getThrottledLogsSummary());
					} catch (loggerError) {
						// Silently handle logger errors to prevent loops
					}
				}, 0);
			} catch (error) {
				// Silently handle logger errors to prevent loops
			}
		}, 10000);

			// Console logging disabled to prevent infinite loops with logger utility

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Performance monitoring disabled to prevent infinite loops with logger utility

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
					<h3 className="font-bold mb-2 text-success">🔧 Dev Diagnostics</h3>
					
					{/* Performance Metrics */}
					<div className="mb-4">
						<h4 className="font-semibold text-primary mb-1">⚡ Performance</h4>
						{Object.entries(performanceMetrics.apiCalls || {}).map(([endpoint, metrics]) => (
							<div key={endpoint} className="mb-1">
								<div className="text-muted-foreground">{endpoint}</div>
								<div className="text-muted-foreground text-xs">
									Avg: {metrics.avgTime?.toFixed(2)}ms | Count: {metrics.count}
								</div>
							</div>
						))}
					</div>

					{/* Throttled Logs */}
					<div className="mb-4">
						<h4 className="font-semibold text-warning mb-1">⚠️ Throttled Logs</h4>
						{Object.entries(throttledLogs).map(([key, data]) => (
							<div key={key} className="mb-1">
								<div className="text-muted-foreground">{key}</div>
								<div className="text-muted-foreground text-xs">
									Count: {data.count} | Last: {new Date(data.lastTimestamp).toLocaleTimeString()}
								</div>
							</div>
						))}
					</div>

					{/* Recent Logs */}
					<div className="mb-4">
						<h4 className="font-semibold text-muted-foreground mb-1">📝 Recent Logs</h4>
						<div className="max-h-32 overflow-auto">
							{logs.slice(-10).map((log, index) => (
								<div key={index} className={`mb-1 text-xs ${
									log.type === 'error' ? 'text-destructive' : 
									log.type === 'warn' ? 'text-warning' : 'text-muted-foreground'
								}`}>
									{log.message.substring(0, 100)}...
								</div>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<button
							onClick={() => {
								try {
									logger.clearPerformanceMetrics();
								} catch (error) {
									// Silently handle logger errors
								}
							}}
							className="bg-destructive text-white px-2 py-1 rounded text-xs"
						>
							Clear Metrics
						</button>
						<button
							onClick={() => setLogs([])}
							className="bg-muted text-white px-2 py-1 rounded text-xs"
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


