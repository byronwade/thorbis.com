/**
 * SuspenseBoundary - Simplified component wrapper without loading states
 * Renders children immediately for maximum performance
 */

"use client";

import React, { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Performance monitoring hook
const usePerformanceMonitoring = (componentName) => {
	useEffect(() => {
		const startTime = performance.now();

		return () => {
			const loadTime = performance.now() - startTime;
			
			// Log performance metrics
			if (typeof window !== 'undefined' && window.gtag) {
				window.gtag('event', 'component_load_time', {
					component_name: componentName,
					load_time: Math.round(loadTime),
				});
			}

			// Console warning for slow components
			if (loadTime > 2000) {
				console.warn(`Slow component detected: ${componentName} took ${loadTime.toFixed(2)}ms to load`);
			}
		};
	}, [componentName]);
};

// Error fallback component
const SuspenseErrorFallback = memo(({ 
	error, 
	onRetry, 
	componentName = "Component",
	showDetails = false 
}) => (
	<Card className="border-destructive/20 bg-destructive/5">
		<CardHeader className="text-center">
			<AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
			<CardTitle className="text-lg text-destructive">
				Failed to Load {componentName}
			</CardTitle>
		</CardHeader>
		<CardContent className="text-center space-y-4">
			<p className="text-muted-foreground text-sm">
				{error?.message || `There was an error loading ${componentName.toLowerCase()}. Please try again.`}
			</p>
			
			{showDetails && error?.stack && (
				<details className="text-left">
					<summary className="cursor-pointer text-sm font-medium">
						Error Details
					</summary>
					<pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
						{error.stack}
					</pre>
				</details>
			)}

			<div className="flex gap-2 justify-center">
				<Button 
					variant="outline" 
					onClick={() => window.location.reload()}
					size="sm"
				>
					<RefreshCw className="w-4 h-4 mr-2" />
					Refresh Page
				</Button>
				{onRetry && (
					<Button onClick={onRetry} size="sm">
						Try Again
					</Button>
				)}
			</div>
		</CardContent>
	</Card>
));

SuspenseErrorFallback.displayName = "SuspenseErrorFallback";

/**
 * SuspenseBoundary - Simplified wrapper that renders children immediately
 */
const SuspenseBoundary = memo(({
	children,
	componentName = "Component",
	onError,
	showErrorDetails = false,
	className = "",
	enablePerformanceMonitoring = true,
	retryable = true,
}) => {
	const [error, setError] = useState(null);
	const [retryKey, setRetryKey] = useState(0);

	// Performance monitoring (always call hook, but conditionally enable)
	usePerformanceMonitoring(enablePerformanceMonitoring ? componentName : null);

	// Error handler
	const handleRetry = () => {
		setError(null);
		setRetryKey(prev => prev + 1);
	};

	// Error boundary effect
	useEffect(() => {
		const handleError = (event) => {
			if (event.error && componentName) {
				setError(event.error);
				onError?.(event.error);
			}
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleError);
		
		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleError);
		};
	}, [componentName, onError]);

	if (error) {
		return (
			<div className={className}>
				<SuspenseErrorFallback
					error={error}
					onRetry={retryable ? handleRetry : undefined}
					componentName={componentName}
					showDetails={showErrorDetails}
				/>
			</div>
		);
	}

	// Render children immediately without any loading states
	return (
		<div key={retryKey} className={className}>
			{children}
		</div>
	);
});

SuspenseBoundary.displayName = "SuspenseBoundary";

// Convenience exports (kept for backwards compatibility but empty)
export { 
	SuspenseErrorFallback 
};

export default SuspenseBoundary;
