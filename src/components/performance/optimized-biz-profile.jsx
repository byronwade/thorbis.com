/**
 * OptimizedBizProfile - Performance wrapper for BizProfileClient
 * Implements proper Suspense boundaries and prevents large document rendering
 */

"use client";

import React, { memo, useState, useEffect } from "react";
// Removed Skeleton import - component was deleted
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { LazySection } from "./lazy-tab-content";
import BizProfileClient from "@app/(site)/biz/[slug]/biz-profile-client";

// Removed BizProfileSkeleton component - no loading states

// Error fallback component
const BizProfileError = memo(({ error, onRetry }) => (
	<div className="min-h-screen bg-background flex items-center justify-center">
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
				<CardTitle className="text-lg">Unable to Load Business Profile</CardTitle>
			</CardHeader>
			<CardContent className="text-center space-y-4">
				<p className="text-muted-foreground text-sm">
					{error?.message || "There was an error loading the business profile. Please try again."}
				</p>
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
	</div>
));

BizProfileError.displayName = "BizProfileError";

/**
 * OptimizedBizProfile - Main wrapper component
 * Implements performance optimizations and error boundaries
 */
const OptimizedBizProfile = memo(({ businessId, initialBusiness, seoData, ...props }) => {
	const [error, setError] = useState(null);
	const [retryKey, setRetryKey] = useState(0);

	// Monitor component mount time for performance tracking
	useEffect(() => {
		const startTime = performance.now();
		
		return () => {
			const loadTime = performance.now() - startTime;
			if (loadTime > 3000) { // Alert on slow load times
				console.warn(`BizProfile loaded slowly: ${loadTime.toFixed(2)}ms`);
			}
		};
	}, [retryKey]);

	// Error handler
	const handleRetry = () => {
		setError(null);
		setRetryKey(prev => prev + 1);
	};

	// Error boundary effect
	useEffect(() => {
		const handleError = (event) => {
			if (event.error?.message?.includes('BizProfile')) {
				setError(event.error);
			}
		};

		window.addEventListener('error', handleError);
		return () => window.removeEventListener('error', handleError);
	}, []);

	if (error) {
		return <BizProfileError error={error} onRetry={handleRetry} />;
	}

	return (
		<div key={retryKey} className="biz-profile-container">
			<LazySection
				threshold={0.1}
				rootMargin="100px"
				fallback={null} // Removed skeleton loading
			>
				<BizProfileClient
					businessId={businessId}
					initialBusiness={initialBusiness}
					seoData={seoData}
					{...props}
				/>
			</LazySection>
		</div>
	);
});

OptimizedBizProfile.displayName = "OptimizedBizProfile";

export default OptimizedBizProfile;
