"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@components/ui/resizable";
import BusinessCardList from "@components/site/map/business-card-list";
import { useBusinessStore } from "@store/business";
import { useSearchStore } from "@store/search";
import UnifiedAIChat from "@components/shared/ai/unified-ai-chat";
import { useSearchParams } from "next/navigation";
import { logger } from "@utils/logger";

// Lazy-load the heavy map to improve initial TTI and SEO (client-only)
import GoogleMapsContainer from "@components/site/map/google-maps-container";

const SearchContainer = ({ searchParams: propSearchParams }) => {
	const urlSearchParams = useSearchParams();
	const searchParams = propSearchParams || urlSearchParams;
	const { filteredBusinesses: rawFilteredBusinesses, activeBusinessId, selectedBusiness, setSelectedBusiness, clearSelectedBusiness, initializeWithSupabaseData, loading, searchBusinesses, setActiveBusinessId } = useBusinessStore();

	// CRITICAL: Ensure filteredBusinesses is always a resolved array, never a Promise
	const filteredBusinesses = useMemo(() => {
		// EMERGENCY: Comprehensive Promise detection and logging
		if (rawFilteredBusinesses instanceof Promise) {
			console.error("[SearchContainer] CRITICAL: filteredBusinesses is a Promise!");
			console.trace("Promise detected in SearchContainer");
			logger.error("[SearchContainer] rawFilteredBusinesses is a Promise object");
			return [];
		}

		if (rawFilteredBusinesses && typeof rawFilteredBusinesses.then === "function") {
			console.error("[SearchContainer] CRITICAL: filteredBusinesses is Promise-like!");
			console.trace("Promise-like object detected in SearchContainer");
			logger.error("[SearchContainer] rawFilteredBusinesses is a Promise-like object");
			return [];
		}

		// If not an array, convert or return empty array
		if (!Array.isArray(rawFilteredBusinesses)) {
			console.warn("[SearchContainer] rawFilteredBusinesses is not an array:", typeof rawFilteredBusinesses);
			logger.warn("[SearchContainer] rawFilteredBusinesses type:", typeof rawFilteredBusinesses);

			if (rawFilteredBusinesses && typeof rawFilteredBusinesses === "object" && rawFilteredBusinesses.length !== undefined) {
				console.log("[SearchContainer] Converting array-like object to array");
				return Array.from(rawFilteredBusinesses);
			}
			return [];
		}

		// Check if any items in the array are Promises
		if (rawFilteredBusinesses.length > 0) {
			const hasPromises = rawFilteredBusinesses.some((item, index) => {
				const isPromise = item instanceof Promise || (item && typeof item.then === "function");
				if (isPromise) {
					console.error(`[SearchContainer] Found Promise at index ${index}:`, item);
					logger.error(`[SearchContainer] Promise object found at array index ${index}`);
				}
				return isPromise;
			});

			if (hasPromises) {
				console.error("[SearchContainer] Filtering out Promise objects from business array");
				const cleanBusinesses = rawFilteredBusinesses.filter((item) => !(item instanceof Promise) && !(item && typeof item.then === "function"));
				logger.warn(`[SearchContainer] Removed ${rawFilteredBusinesses.length - cleanBusinesses.length} Promise objects`);
				return cleanBusinesses;
			}
		}

		console.log("[SearchContainer] filteredBusinesses is valid array with", rawFilteredBusinesses.length, "items");
		return rawFilteredBusinesses;
	}, [rawFilteredBusinesses]);
	const { searchQuery, searchLocation } = useSearchStore();
	const [isLoading, setIsLoading] = useState(true);
	const [panelSize, setPanelSize] = useState(25);
	const [showActivityFeed, setShowActivityFeed] = useState(false);
	const activeCardRef = useRef(null);
	const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
	const [showMap, setShowMap] = useState(true);
	const [headerHeight, setHeaderHeight] = useState(0);

	useEffect(() => {
		// Performance-optimized header height calculation
		const calculateHeaderHeight = () => {
			requestAnimationFrame(() => {
				const header = document.querySelector("#header");
				if (header) {
					// Use getBoundingClientRect instead of offsetHeight for better performance
					const rect = header.getBoundingClientRect();
					const height = Math.round(rect.height);

					// Only update if height actually changed to prevent unnecessary re-renders
					setHeaderHeight((prevHeight) => {
						if (prevHeight !== height) {
							console.log("Header height updated:", height);
							return height;
						}
						return prevHeight;
					});
				}
			});
		};

		// Debounced resize handler to prevent excessive calculations
		let resizeTimeout;
		const debouncedResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(calculateHeaderHeight, 100);
		};

		// Initial calculation with RAF to avoid blocking
		calculateHeaderHeight();

		// Add debounced resize listener
		window.addEventListener("resize", debouncedResize, { passive: true });

		// Single delayed calculation for dynamic content
		const delayedCalculation = setTimeout(calculateHeaderHeight, 250);

		return () => {
			window.removeEventListener("resize", debouncedResize);
			clearTimeout(resizeTimeout);
			clearTimeout(delayedCalculation);
		};
	}, []);

	useEffect(() => {
		// Initialize with Supabase data immediately
		initializeWithSupabaseData();
		setIsLoading(false);
	}, [initializeWithSupabaseData]);

	useEffect(() => {
		if (filteredBusinesses.length > 0) {
			setIsLoading(false);
		}
	}, [filteredBusinesses]);

	// Handle URL parameters
	useEffect(() => {
		// Handle both URLSearchParams (from useSearchParams) and plain object (from props)
		const query = typeof searchParams?.get === "function" ? searchParams.get("q") : searchParams?.q || "";
		const location = typeof searchParams?.get === "function" ? searchParams.get("location") : searchParams?.location || "";

		// For now, don't override with search results if we have businesses
		if ((query || location) && filteredBusinesses.length === 0) {
			searchBusinesses(query || "", location || "");
		}
	}, [searchParams, searchBusinesses, filteredBusinesses.length]);

	const handlePanelResize = (sizes) => {
		setPanelSize(sizes[0]);
	};

	const togglePanelSize = () => {
		setPanelSize(panelSize === 25 ? 40 : 25);
	};

	const getResultsCount = () => {
		const count = filteredBusinesses.length;
		const openCount = filteredBusinesses.filter((b) => b.isOpenNow).length;
		return { total: count, open: openCount };
	};

	const { total, open } = getResultsCount();

	const handleBusinessSelect = (business) => {
		console.log("SearchContainer - handleBusinessSelect called with:", business?.name, "ID:", business?.id);
		setSelectedBusiness(business);
		setActiveBusinessId(business.id);
		console.log("SearchContainer - activeBusinessId set to:", business?.id);
		console.log("SearchContainer - Current store state:", { activeBusinessId, selectedBusiness });
	};

	const handleBusinessClose = () => {
		clearSelectedBusiness();
		setActiveBusinessId(null);
	};

	const handleAIClick = () => {
		setIsAISidebarOpen(true);
	};

	const handleAIClose = () => {
		setIsAISidebarOpen(false);
		// Clear any highlighted businesses when closing AI chat
		const { setHighlightedBusinesses } = useBusinessStore.getState();
		if (setHighlightedBusinesses) {
			setHighlightedBusinesses([]);
		}
	};

	const handleMapToggle = () => {
		setShowMap(!showMap);
	};

	// Calculate the content height by subtracting header height from viewport height
	const contentHeight = `calc(100vh - ${headerHeight}px)`;

	return (
		<div className="w-full flex flex-col bg-white dark:bg-neutral-900 overflow-hidden" style={{ height: contentHeight }}>
			{/* Mobile-First Responsive Layout */}
			<div className="flex-1 min-h-0 relative">
				{/* Desktop: Side-by-side layout (lg and up) */}
				<div className="hidden lg:flex h-full">
					{showMap ? (
						<ResizablePanelGroup direction="horizontal" className="h-full" onLayout={handlePanelResize}>
							{/* Desktop Sidebar Panel - More Compact Default */}
							<ResizablePanel defaultSize={activeBusinessId ? 32 : 25} minSize={20} maxSize={80} className="max-w-[42%]">
								<div className="h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 overflow-hidden relative">
									{/* Business List - Desktop View */}
									<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${!isAISidebarOpen ? "transform translate-x-0 opacity-100 z-10" : "transform -translate-x-full opacity-0 z-0"}`}>
										<BusinessCardList businesses={filteredBusinesses} loading={loading} onBusinessSelect={handleBusinessSelect} activeBusinessId={activeBusinessId} activeCardRef={activeCardRef} onAIClick={handleAIClick} showMap={showMap} onMapToggle={handleMapToggle} />
									</div>

									{/* AI Chat Sidebar - Desktop */}
									<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isAISidebarOpen ? "transform translate-x-0 opacity-100 z-10" : "transform translate-x-full opacity-0 z-0"}`}>{isAISidebarOpen && <UnifiedAIChat isOpen={isAISidebarOpen} onClose={handleAIClose} mode="sidebar" />}</div>
								</div>
							</ResizablePanel>

							{/* Desktop Resizable Handle */}
							<ResizableHandle withHandle />

							{/* Desktop Map Panel - Adjusted for Compact Sidebar */}
							<ResizablePanel defaultSize={activeBusinessId ? 68 : 75}>
								<div className="h-full w-full relative overflow-hidden">
									<GoogleMapsContainer businesses={filteredBusinesses} selectedBusiness={selectedBusiness} onBusinessSelect={handleBusinessSelect} />
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					) : (
						/* Desktop List-only view */
						<div className="h-full w-full transition-all duration-300 ease-in-out bg-white dark:bg-neutral-900">
							<div className="h-full overflow-hidden relative">
								<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${!isAISidebarOpen ? "transform translate-x-0 opacity-100 z-10" : "transform -translate-x-full opacity-0 z-0"}`}>
									<BusinessCardList businesses={filteredBusinesses} loading={loading} onBusinessSelect={handleBusinessSelect} activeBusinessId={activeBusinessId} activeCardRef={activeCardRef} onAIClick={handleAIClick} showMap={showMap} onMapToggle={handleMapToggle} listMode="full" />
								</div>
								<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isAISidebarOpen ? "transform translate-x-0 opacity-100 z-10" : "transform translate-x-full opacity-0 z-0"}`}>{isAISidebarOpen && <UnifiedAIChat isOpen={isAISidebarOpen} onClose={handleAIClose} mode="sidebar" />}</div>
							</div>
						</div>
					)}
				</div>

				{/* Mobile & Tablet: Stacked layout (lg and below) */}
				<div className="flex lg:hidden h-full flex-col">
					{showMap ? (
						/* Mobile: Map + Bottom Sheet List */
						<div className="flex flex-col h-full">
							{/* Mobile Map Container */}
							<div className="flex-1 relative">
								<GoogleMapsContainer businesses={filteredBusinesses} selectedBusiness={selectedBusiness} onBusinessSelect={handleBusinessSelect} />

								{/* Mobile Floating Action Button */}
								<div className="absolute bottom-4 right-4 z-30">
									<button onClick={handleMapToggle} className="flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-200 active:scale-95">
										<svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
										</svg>
									</button>
								</div>
							</div>

							{/* Mobile Bottom Sheet - Business List */}
							<div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-gray-700 max-h-[60vh] min-h-[200px] overflow-hidden">
								{/* Bottom Sheet Handle */}
								<div className="flex justify-center py-2 bg-gray-50 dark:bg-gray-800">
									<div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
								</div>

								{/* Mobile Business List */}
								<div className="h-full">
									<div className={`h-full transition-all duration-500 ease-in-out ${!isAISidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
										<BusinessCardList businesses={filteredBusinesses} loading={loading} onBusinessSelect={handleBusinessSelect} activeBusinessId={activeBusinessId} activeCardRef={activeCardRef} onAIClick={handleAIClick} showMap={showMap} onMapToggle={handleMapToggle} isMobile={true} />
									</div>
								</div>
							</div>
						</div>
					) : (
						/* Mobile: List-only view */
						<div className="h-full flex flex-col bg-white dark:bg-neutral-900">
							{/* Mobile Full-Screen List */}
							<div className="flex-1 overflow-hidden relative">
								<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${!isAISidebarOpen ? "transform translate-x-0 opacity-100 z-10" : "transform -translate-x-full opacity-0 z-0"}`}>
									<BusinessCardList businesses={filteredBusinesses} loading={loading} onBusinessSelect={handleBusinessSelect} activeBusinessId={activeBusinessId} activeCardRef={activeCardRef} onAIClick={handleAIClick} showMap={showMap} onMapToggle={handleMapToggle} listMode="full" isMobile={true} />
								</div>

								{/* Mobile AI Chat Overlay */}
								<div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isAISidebarOpen ? "transform translate-x-0 opacity-100 z-20" : "transform translate-x-full opacity-0 z-0"}`}>{isAISidebarOpen && <UnifiedAIChat isOpen={isAISidebarOpen} onClose={handleAIClose} mode="fullscreen" />}</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Mobile-Optimized Loading Overlay */}
			{loading && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-gray-200 dark:border-gray-700 min-w-[280px]">
						<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
						<span className="text-sm font-medium text-gray-900 dark:text-white">Finding businesses near you...</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default SearchContainer;
