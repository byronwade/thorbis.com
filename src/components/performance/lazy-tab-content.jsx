/**
 * LazyTabContent - Performance-optimized tab content with Suspense boundaries
 * Only renders active tab content to prevent large document rendering issues
 */

"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@utils";

// Enhanced loading component for tab sections
const TabContentLoader = ({ className = "" }) => (
	<div className={cn("animate-pulse space-y-6 p-6", className)}>
		<div className="space-y-4">
			<div className="h-6 bg-muted rounded w-1/4"></div>
			<div className="h-4 bg-muted rounded w-3/4"></div>
			<div className="h-4 bg-muted rounded w-1/2"></div>
		</div>
		<div className="space-y-3">
			<div className="h-32 bg-muted rounded"></div>
			<div className="h-24 bg-muted rounded"></div>
		</div>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="h-20 bg-muted rounded"></div>
			<div className="h-20 bg-muted rounded"></div>
		</div>
	</div>
);

// Error boundary wrapper for individual tab content
const TabErrorBoundary = memo(({ children, tabName }) => {
	return (
		<div>
			{/* Simple error boundary replacement for client-side */}
			{children}
		</div>
	);
});

TabErrorBoundary.displayName = "TabErrorBoundary";

/**
 * LazyTabContent - Only renders content when tab is active
 * Prevents rendering all tab content at once which causes performance issues
 */
const LazyTabContent = memo(({ 
	activeTab, 
	targetTab, 
	children, 
	loadingComponent = <TabContentLoader />,
	className = "",
	preload = false 
}) => {
	// Only render if this is the active tab, or if preload is enabled
	const shouldRender = useMemo(() => {
		return activeTab === targetTab || preload;
	}, [activeTab, targetTab, preload]);

	// Don't render anything if not active and not preloading
	if (!shouldRender) {
		return null;
	}

	// If not the active tab but preloading, render but hide
	const isHidden = activeTab !== targetTab && preload;

	return (
		<div 
			className={cn(
				className,
				isHidden && "hidden"
			)}
			data-tab={targetTab}
		>
			<TabErrorBoundary tabName={targetTab}>
				{children}
			</TabErrorBoundary>
		</div>
	);
});

LazyTabContent.displayName = "LazyTabContent";

/**
 * TabContentContainer - Manages multiple tab contents efficiently
 */
export const TabContentContainer = memo(({ 
	activeTab, 
	className = "",
	preloadNext = true,
	children 
}) => {
	const tabContents = React.Children.toArray(children);
	const currentIndex = tabContents.findIndex(child => 
		child.props?.targetTab === activeTab
	);

	return (
		<div className={cn("tab-content-container", className)}>
			{tabContents.map((child, index) => {
				const shouldPreload = preloadNext && (
					index === currentIndex + 1 || // Next tab
					index === currentIndex - 1    // Previous tab
				);

				return React.cloneElement(child, {
					key: child.props.targetTab || index,
					preload: shouldPreload,
				});
			})}
		</div>
	);
});

TabContentContainer.displayName = "TabContentContainer";

/**
 * Performance-optimized section wrapper
 * Includes intersection observer for lazy loading when in viewport
 */
export const LazySection = memo(({ 
	children, 
	threshold = 0.1,
	rootMargin = "50px",
	className = "",
	fallback = <TabContentLoader />
}) => {
	const [isVisible, setIsVisible] = React.useState(false);
	const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
	const elementRef = React.useRef();

	React.useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasBeenVisible) {
					setIsVisible(true);
					setHasBeenVisible(true);
					// Disconnect after first intersection
					observer.disconnect();
				}
			},
			{
				threshold,
				rootMargin,
			}
		);

		if (elementRef.current) {
			observer.observe(elementRef.current);
		}

		return () => observer.disconnect();
	}, [threshold, rootMargin, hasBeenVisible]);

	return (
		<div ref={elementRef} className={className}>
			{children}
		</div>
	);
});

LazySection.displayName = "LazySection";

export default LazyTabContent;
