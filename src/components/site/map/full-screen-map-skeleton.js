/**
 * Full Screen Map Skeleton Component
 * Loading state for map container with business markers and controls
 */

"use client";

import React from "react";
import { Skeleton } from "@components/ui/skeleton";
import { MapPin, Search, Target, Plus, Minus } from "lucide-react";

const FullScreenMapSkeleton = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full bg-muted dark:bg-card rounded-lg overflow-hidden ${className}`}>
      {/* Map Background Skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        {/* Fake map tiles pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-6 grid-rows-4 h-full w-full gap-px">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-muted dark:bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center space-x-2">
          <Skeleton className="flex-1 h-12 rounded-full bg-white/80 dark:bg-card/80" />
          <Skeleton className="w-12 h-12 rounded-full bg-white/80 dark:bg-card/80" />
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 right-4 z-10 space-y-2">
        <Skeleton className="w-10 h-10 rounded-lg bg-white/80 dark:bg-card/80" />
        <Skeleton className="w-10 h-10 rounded-lg bg-white/80 dark:bg-card/80" />
        <Skeleton className="w-10 h-10 rounded-lg bg-white/80 dark:bg-card/80" />
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 right-4 z-10">
        <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="p-2 border-b border-border dark:border-border">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="p-2">
              <Minus className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Info Panel Skeleton */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white dark:bg-card rounded-xl shadow-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Fake Map Markers */}
      <div className="absolute inset-0 z-5">
        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-destructive/60 rounded-full border-2 border-white animate-pulse shadow-lg">
            <MapPin className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Scattered markers */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-primary/60 rounded-full border-2 border-white animate-pulse shadow-lg" />
        </div>
        
        <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-success/60 rounded-full border-2 border-white animate-pulse shadow-lg" />
        </div>
        
        <div className="absolute bottom-1/3 left-3/5 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-6 h-6 bg-purple-500/60 rounded-full border-2 border-white animate-pulse shadow-lg" />
        </div>

        <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-warning/60 rounded-full border-2 border-white animate-pulse shadow-lg" />
        </div>
      </div>

      {/* Loading overlay */}
      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
        <div className="bg-white dark:bg-card rounded-lg p-4 shadow-lg flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-border border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Loading map...</span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenMapSkeleton;
