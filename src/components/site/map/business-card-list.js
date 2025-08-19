/**
 * BusinessCardList Component (Refactored)
 * Clean, focused business card list using extracted components and hooks
 * Reduced from 925 lines to clean, modular implementation
 * Following Next.js best practices for large-scale applications
 */

"use client";

import React, { useEffect } from "react";
import { ScrollArea } from "@components/ui/scroll-area";
import { Button } from "@components/ui/button";
import { ArrowUp } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";

// Import extracted components and hooks
import { useBusinessCardList } from "@lib/hooks/map/use-business-card-list";
import { BusinessCard, GoogleStyleBusinessCard } from "./business-cards";
// Removed skeleton business card import - no loading states
import FilterPanel from "./filter-panel";
import MinimalistSearchHeader from "./minimalist-search-header";
import MinimalistEmptyState from "./minimalist-empty-state";
import QuickFilterPills from "./quick-filter-pills";

const BusinessCardList = ({ businesses, activeBusinessId, activeCardRef, onAIClick, onBusinessSelect, loading, showMap, onMapToggle, listMode, isMobile = false }) => {
	const {
		// Data
		visibleBusinesses,
		filteredBusinesses,

		// State
		hoveredBusinessId,
		sortBy,
		showFilters,
		showSort,
		currentFilters,
		isLoadingMore,
		itemsToShow,

		// Refs
		listRef,
		activeCardElementRef,
		sentinelRef,

		// Handlers
		handleCardClick,
		handleCardHover,
		handleCardLeave,
		handleFilterClick,
		handleFiltersChange,
		handleClearFilters,
		handleKeyDown,

		// Utilities
		getUrgencyIndicator,
		getTrustScore,
		formatDistance,

		// Setters
		setShowFilters,
	} = useBusinessCardList(businesses);

	// Add keyboard event listener
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// Handle business selection callback
	useEffect(() => {
		if (activeBusinessId && onBusinessSelect) {
			const business = visibleBusinesses.find((b) => b.id === activeBusinessId);
			if (business) {
				onBusinessSelect(business);
			}
		}
	}, [activeBusinessId, visibleBusinesses, onBusinessSelect]);

	// Show loading state
	// Removed loading state - render content immediately

	// Show empty state
	if (!visibleBusinesses.length && !loading) {
		return (
			<div className="h-full flex flex-col">
				<MinimalistSearchHeader resultsCount={0} showMap={showMap} onMapToggle={onMapToggle} onFilterClick={handleFilterClick} showFilters={showFilters} onAIClick={onAIClick} />
				<div className="flex-1 flex items-center justify-center">
					<MinimalistEmptyState onClearFilters={handleClearFilters} />
				</div>
			</div>
		);
	}

	// Mobile-specific layout
	if (isMobile) {
		return (
			<div className="h-full flex flex-col bg-white dark:bg-neutral-900">
				{/* Mobile Search Header */}
				<MinimalistSearchHeader resultsCount={filteredBusinesses.length} showMap={showMap} onMapToggle={onMapToggle} onFilterClick={handleFilterClick} showFilters={showFilters} onAIClick={onAIClick} />

				{/* Mobile Quick Filter Pills */}
				{!loading && visibleBusinesses.length > 0 && <QuickFilterPills onFilterChange={handleFiltersChange} activeFilters={currentFilters} totalResults={visibleBusinesses.length} loading={isLoadingMore} />}

				{/* Mobile Filter Panel */}
				{showFilters && <FilterPanel filters={currentFilters} onFiltersChange={handleFiltersChange} onClose={() => setShowFilters(false)} />}

				{/* Mobile Business List - Touch-Optimized */}
				<ScrollArea className="flex-1" ref={listRef}>
					<div className="px-4 py-3 space-y-4">
						{visibleBusinesses.map((business, index) => {
							const isActive = business.id === activeBusinessId;
							const ref = isActive ? activeCardElementRef : null;

							// Mobile: Use touch-friendly card style
							return <BusinessCard key={business.id} ref={ref} business={business} isActive={isActive} handleClick={handleCardClick} isLoading={loading} onHover={handleCardHover} onLeave={handleCardLeave} isMobile={true} />;
						})}

						{/* Mobile: Enhanced Loading Indicator */}
						{isLoadingMore && (
							<div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-card/50 rounded-xl border border-border dark:border-border">
								<ReloadIcon className="mr-3 h-5 w-5 animate-spin text-primary dark:text-primary" />
								<span className="text-sm font-medium text-foreground dark:text-white">Loading more businesses...</span>
							</div>
						)}

						{/* Mobile: Intersection Observer Sentinel */}
						<div ref={sentinelRef} className="h-4" />

						{/* Mobile: Touch-Friendly Load More Button */}
						{!isLoadingMore && itemsToShow < filteredBusinesses.length && (
							<div className="flex justify-center py-2">
								<Button variant="outline" onClick={() => setVisibleStartIndex((prev) => prev + 20)} className="flex items-center gap-3 h-14 px-6 text-base font-medium border-2 border-primary/30 dark:border-primary bg-blue-50 dark:bg-primary/30 hover:bg-primary/10 dark:hover:bg-primary/50 text-primary dark:text-primary/90 active:scale-95 transition-all duration-200 rounded-xl">
									<ArrowUp className="w-5 h-5 rotate-180" />
									<span>Show {Math.min(20, filteredBusinesses.length - itemsToShow)} More</span>
								</Button>
							</div>
						)}

						{/* Mobile: Safe Area Bottom Padding */}
						<div className="h-8" />
					</div>
				</ScrollArea>
			</div>
		);
	}

	// Desktop layout
	return (
		<div className="h-full flex flex-col bg-white dark:bg-neutral-900">
			{/* Desktop Search Header */}
			<MinimalistSearchHeader resultsCount={filteredBusinesses.length} showMap={showMap} onMapToggle={onMapToggle} onFilterClick={handleFilterClick} showFilters={showFilters} onAIClick={onAIClick} />

			{/* Quick Filter Pills */}
			{!loading && visibleBusinesses.length > 0 && <QuickFilterPills onFilterChange={handleFiltersChange} activeFilters={currentFilters} totalResults={visibleBusinesses.length} loading={isLoadingMore} />}

			{/* Desktop Filter Panel */}
			{showFilters && <FilterPanel filters={currentFilters} onFiltersChange={handleFiltersChange} onClose={() => setShowFilters(false)} />}

			{/* Desktop Business List - More Compact */}
			<ScrollArea className="flex-1" ref={listRef}>
				<div className="p-3 space-y-3">
					{visibleBusinesses.map((business, index) => {
						const isActive = business.id === activeBusinessId;
						const ref = isActive ? activeCardElementRef : null;

						// Render different card styles based on listMode
						if (listMode === "google") {
							return (
								<div key={business.id} ref={ref} onClick={() => handleCardClick(business)} onMouseEnter={() => handleCardHover(business)} onMouseLeave={() => handleCardLeave(business)}>
									<GoogleStyleBusinessCard business={business} isActive={isActive} />
								</div>
							);
						}

						return <BusinessCard key={business.id} ref={ref} business={business} isActive={isActive} handleClick={handleCardClick} isLoading={loading} onHover={handleCardHover} onLeave={handleCardLeave} />;
					})}

					{/* Loading More Indicator */}
					{isLoadingMore && (
						<div className="flex items-center justify-center py-4">
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							<span className="text-sm text-muted-foreground dark:text-muted-foreground">Loading more results...</span>
						</div>
					)}

					{/* Intersection Observer Sentinel */}
					<div ref={sentinelRef} className="h-4" />

					{/* Load More Button for manual loading */}
					{!isLoadingMore && itemsToShow < filteredBusinesses.length && (
						<div className="flex justify-center py-4">
							<Button variant="outline" onClick={() => setVisibleStartIndex((prev) => prev + 20)} className="flex items-center space-x-2">
								<ArrowUp className="w-4 h-4 rotate-180" />
								<span>Load More ({filteredBusinesses.length - itemsToShow} remaining)</span>
							</Button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default BusinessCardList;
