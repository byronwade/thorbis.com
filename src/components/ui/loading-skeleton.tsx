"use client"

import * as React from "react"
import { cn } from "@thorbis/design/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700",
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export interface LoadingSkeletonProps {
  variant?: "table" | "card" | "header" | "form" | "metric-grid" | "list"
  rows?: number
  className?: string
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ variant = "card", rows = 5, className, ...props }, ref) => {
    if (variant === "table") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {/* Table Header Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (variant === "metric-grid") {
      return (
        <div ref={ref} className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)} {...props}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (variant === "header") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      )
    }

    if (variant === "form") {
      return (
        <div ref={ref} className={cn("space-y-6", className)} {...props}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )
    }

    if (variant === "list") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      )
    }

    // Default card variant
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }
)

LoadingSkeleton.displayName = "LoadingSkeleton"

export { Skeleton, LoadingSkeleton }
