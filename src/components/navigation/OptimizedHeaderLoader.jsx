"use client";

import React, { Suspense, lazy, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@components/ui/skeleton";

// Lazy load heavy components
const EnhancedBusinessHeader = lazy(() => import("./EnhancedBusinessHeader"));
const PageSubHeader = lazy(() => import("./PageSubHeader"));

/**
 * Optimized Header Loader
 * Implements smart loading strategies and performance optimizations
 */
export default function OptimizedHeaderLoader({ 
  userId,
  userRole,
  businessId,
  className = ""
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [prefetchComplete, setPrefetchComplete] = useState(false);

  // Intersection Observer for above-the-fold optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const headerElement = document.querySelector('[data-header-root]');
    if (headerElement) {
      observer.observe(headerElement);
    }

    return () => observer.disconnect();
  }, []);

  // Prefetch navigation data
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      // Prefetch critical navigation data
      import("@config/navigation/industry-presets").then(() => {
        setPrefetchComplete(true);
      });
    }, 100);

    return () => clearTimeout(prefetchTimer);
  }, []);

  // Loading skeleton that matches header dimensions
  const HeaderSkeleton = () => (
    <div className="w-full bg-background border-b border-border">
      {/* Main Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Navigation Bar Skeleton */}
      <div className="border-t border-border bg-muted/30">
        <div className="flex items-center px-6 py-2 space-x-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
      
      {/* Sub-header Skeleton */}
      <div className="border-t border-border bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div data-header-root className={className}>
      <Suspense fallback={<HeaderSkeleton />}>
        {isVisible && prefetchComplete ? (
          <>
            <EnhancedBusinessHeader
              userId={userId}
              userRole={userRole}
              businessId={businessId}
            />
            <PageSubHeader 
              showBreadcrumbs={true}
              showSearch={false}
            />
          </>
        ) : (
          <HeaderSkeleton />
        )}
      </Suspense>
    </div>
  );
}
