/**
 * MobileSearchOptimizer Component
 * Advanced mobile search experience with touch optimizations
 * Provides mobile-first design patterns and gestures
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { Filter, MapPin, List, Map, Zap, TrendingUp, Clock, Star, DollarSign } from "lucide-react";
import { withErrorHandling } from "@utils/error-handler";
import logger from "@lib/utils/logger";

const MobileSearchOptimizer = ({ onFilterToggle, onMapToggle, onQuickFilter, showMap = false, activeFilters = {}, totalResults = 0, searchQuery = "", loading = false, children }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [showHeader, setShowHeader] = useState(true);
	const [touchStart, setTouchStart] = useState(null);
	const [touchEnd, setTouchEnd] = useState(null);
	const scrollAreaRef = useRef(null);

	// Quick filters for mobile
	const mobileQuickFilters = [
		{ id: "open", label: "Open", icon: Clock, active: activeFilters.openNow },
		{ id: "rated", label: "4.5+★", icon: Star, active: activeFilters.rating >= 4.5 },
		{ id: "nearby", label: "Near", icon: MapPin, active: activeFilters.distance <= 5 },
		{ id: "budget", label: "$", icon: DollarSign, active: activeFilters.priceRange === "$" },
	];

	// Handle scroll behavior - auto hide/show header
	const handleScroll = useCallback(() => {
		const currentScrollY = scrollAreaRef.current?.scrollTop || 0;

		if (currentScrollY > lastScrollY && currentScrollY > 100) {
			// Scrolling down - hide header
			setShowHeader(false);
		} else if (currentScrollY < lastScrollY) {
			// Scrolling up - show header
			setShowHeader(true);
		}

		setLastScrollY(currentScrollY);
	}, [lastScrollY]);

	// Touch gesture handling for swipe actions
	const handleTouchStart = useCallback((e) => {
		setTouchEnd(null);
		setTouchStart(e.targetTouches[0].clientY);
	}, []);

	const handleTouchMove = useCallback((e) => {
		setTouchEnd(e.targetTouches[0].clientY);
	}, []);

	const handleTouchEnd = useCallback(
		withErrorHandling(() => {
			if (!touchStart || !touchEnd) return;

			const distance = touchStart - touchEnd;
			const isUpSwipe = distance > 50;
			const isDownSwipe = distance < -50;

			if (isUpSwipe && !isExpanded) {
				setIsExpanded(true);
				logger.interaction({
					type: "mobile_swipe_expand",
					direction: "up",
					timestamp: Date.now(),
				});
			} else if (isDownSwipe && isExpanded) {
				setIsExpanded(false);
				logger.interaction({
					type: "mobile_swipe_collapse",
					direction: "down",
					timestamp: Date.now(),
				});
			}
		}, "MobileSearchOptimizer"),
		[touchStart, touchEnd, isExpanded]
	);

	// Handle quick filter tap
	const handleQuickFilterTap = useCallback(
		withErrorHandling((filterId) => {
			const filter = mobileQuickFilters.find((f) => f.id === filterId);
			if (filter) {
				logger.interaction({
					type: "mobile_quick_filter",
					filterId,
					active: !filter.active,
					timestamp: Date.now(),
				});

				onQuickFilter?.(filterId, !filter.active);
			}
		}, "MobileSearchOptimizer"),
		[mobileQuickFilters, onQuickFilter]
	);

	// Haptic feedback for supported devices
	const triggerHaptic = useCallback((type = "impact") => {
		if (navigator.vibrate) {
			const patterns = {
				impact: [10],
				success: [10, 10, 10],
				warning: [20, 10, 20],
			};
			navigator.vibrate(patterns[type] || patterns.impact);
		}
	}, []);

	// Register scroll listener
	useEffect(() => {
		const scrollElement = scrollAreaRef.current;
		if (scrollElement) {
			scrollElement.addEventListener("scroll", handleScroll, { passive: true });
			return () => scrollElement.removeEventListener("scroll", handleScroll);
		}
	}, [handleScroll]);

	return (
		<div className="h-full flex flex-col bg-white dark:bg-neutral-900 relative">
			{/* Mobile-Optimized Sticky Header */}
			<div
				className={`
        sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800
        transition-transform duration-300 ease-out
        ${showHeader ? "transform translate-y-0" : "transform -translate-y-full"}
      `}
			>
				{/* Compact Search Info */}
				<div className="px-4 py-3">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-bold text-foreground dark:text-white">{loading ? "Searching..." : `${totalResults.toLocaleString()} results`}</h2>
							{totalResults > 0 && <Badge className="bg-primary/10 dark:bg-primary text-primary dark:text-primary/90 text-xs px-2 py-1">{searchQuery ? `for "${searchQuery}"` : "nearby"}</Badge>}
						</div>

						{/* Quick Actions */}
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									triggerHaptic("impact");
									onMapToggle?.();
								}}
								className="h-8 px-3 text-xs"
							>
								{showMap ? <List className="w-3 h-3" /> : <Map className="w-3 h-3" />}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									triggerHaptic("impact");
									onFilterToggle?.();
								}}
								className="h-8 px-3 text-xs"
							>
								<Filter className="w-3 h-3" />
							</Button>
						</div>
					</div>

					{/* Swipeable Quick Filters */}
					<ScrollArea className="w-full">
						<div className="flex gap-2 pb-2">
							{mobileQuickFilters.map((filter) => {
								const Icon = filter.icon;
								return (
									<Button
										key={filter.id}
										variant={filter.active ? "default" : "outline"}
										size="sm"
										onClick={() => {
											triggerHaptic("impact");
											handleQuickFilterTap(filter.id);
										}}
										className={`
                      h-8 px-3 text-xs whitespace-nowrap flex-shrink-0
                      transition-all duration-200 active:scale-95
                      ${filter.active ? "bg-primary text-white border-primary" : "border-border dark:border-border"}
                    `}
									>
										<Icon className="w-3 h-3 mr-1.5" />
										{filter.label}
									</Button>
								);
							})}
						</div>
					</ScrollArea>
				</div>

				{/* Expandable Controls */}
				{isExpanded && (
					<div className="px-4 pb-3 border-t border-border dark:border-border">
						<div className="pt-3 space-y-3">
							{/* Advanced Filters */}
							<div className="grid grid-cols-2 gap-2">
								<Button variant="outline" size="sm" className="h-9 text-xs justify-start">
									<TrendingUp className="w-3 h-3 mr-2" />
									Trending
								</Button>
								<Button variant="outline" size="sm" className="h-9 text-xs justify-start">
									<Zap className="w-3 h-3 mr-2" />
									Fast Response
								</Button>
							</div>

							{/* Sort Options */}
							<div className="flex gap-2 text-xs">
								<span className="text-muted-foreground dark:text-muted-foreground py-2">Sort by:</span>
								{["Relevance", "Distance", "Rating"].map((sort) => (
									<Button key={sort} variant="ghost" size="sm" className="h-8 px-3 text-xs">
										{sort}
									</Button>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Expand/Collapse Indicator */}
				<div className="flex justify-center py-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
					<div className="w-8 h-1 bg-muted dark:bg-muted rounded-full" />
				</div>
			</div>

			{/* Optimized Content Area */}
			<ScrollArea ref={scrollAreaRef} className="flex-1" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
				<div className="min-h-full">{children}</div>
			</ScrollArea>

			{/* Mobile Quick Action FAB */}
			<div className="absolute bottom-4 right-4 z-20">
				<div className="flex flex-col gap-2">
					{/* Map Toggle FAB */}
					<Button
						size="sm"
						onClick={() => {
							triggerHaptic("impact");
							onMapToggle?.();
						}}
						className={`
              w-12 h-12 rounded-full shadow-lg
              ${showMap ? "bg-primary hover:bg-primary text-white" : "bg-white dark:bg-card border-2 border-primary text-primary"}
              transition-all duration-200 active:scale-90
            `}
					>
						{showMap ? <List className="w-5 h-5" /> : <Map className="w-5 h-5" />}
					</Button>

					{/* Filter Badge */}
					{Object.keys(activeFilters).length > 0 && (
						<div className="absolute -top-1 -right-1">
							<Badge className="w-5 h-5 p-0 flex items-center justify-center bg-destructive text-white text-xs rounded-full">{Object.keys(activeFilters).length}</Badge>
						</div>
					)}
				</div>
			</div>

			{/* Performance Indicators (Dev Mode) */}
			{process.env.NODE_ENV === "development" && (
				<div className="absolute top-16 left-4 z-50 opacity-50">
					<div className="bg-black text-white text-xs p-2 rounded">
						<div>Header: {showHeader ? "Visible" : "Hidden"}</div>
						<div>Expanded: {isExpanded ? "Yes" : "No"}</div>
						<div>Scroll: {lastScrollY}px</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MobileSearchOptimizer;
