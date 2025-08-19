"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Map, List, Filter, ChevronDown, Bot } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { withErrorHandling } from "@utils/error-handler";

const MinimalistSearchHeader = ({ resultsCount = 0, openCount = 0, searchQuery = "", searchLocation = "", showMap = true, sortBy = "relevance", onMapToggle, onFilterClick, onSortChange, onAIClick, loading = false, className = "" }) => {
	const [showSort, setShowSort] = useState(false);

	const sortOptions = [
		{ value: "relevance", label: "Best Match" },
		{ value: "rating", label: "Highest Rated" },
		{ value: "distance", label: "Nearest" },
		{ value: "reviews", label: "Most Reviews" },
		{ value: "name", label: "Alphabetical" },
	];

	const handleSortSelect = withErrorHandling((value) => {
		setShowSort(false);
		if (onSortChange) {
			onSortChange(value);
		}
	}, "MinimalistSearchHeader");

	const formatResultsText = () => {
		if (loading) return "Searching...";
		if (resultsCount === 0) return "0 results";
		return `${resultsCount.toLocaleString()} result${resultsCount !== 1 ? "s" : ""}`;
	};

	const formatSearchText = () => {
		if (!searchQuery && !searchLocation) return null;

		const parts = [];
		if (searchQuery) parts.push(`"${searchQuery}"`);
		if (searchLocation) parts.push(`near ${searchLocation}`);

		return parts.join(" ");
	};

	return (
		<div className={`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/80 dark:border-neutral-800/80 sticky top-0 z-20 ${className}`}>
			{/* Compact Header Layout */}
			<div className="px-3 py-2.5">
				{/* Mobile Layout (sm and below) */}
				<div className="sm:hidden space-y-2">
					{/* Mobile: Results Count */}
					<div className="flex items-center justify-between">
						<h1 className="text-base font-bold tracking-tight text-foreground dark:text-white">{formatResultsText()}</h1>
						{!loading && resultsCount > 0 && (
							<Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full font-medium text-xs">
								<div className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse" />
								{openCount} open
							</Badge>
						)}
					</div>

					{/* Mobile: Search Context - More Compact */}
					{formatSearchText() && (
						<div className="text-xs text-muted-foreground dark:text-muted-foreground">
							<span className="font-medium">Searching: </span>
							<span className="px-1.5 py-0.5 bg-muted dark:bg-card rounded text-xs font-mono">{formatSearchText()}</span>
						</div>
					)}

					{/* Mobile: Action Buttons - More Compact */}
					<div className="flex flex-wrap gap-1.5">
						{/* Mobile Map/List Toggle - More Compact */}
						{onMapToggle && (
							<Button variant={showMap ? "default" : "outline"} size="sm" onClick={onMapToggle} className="flex-1 min-w-0 h-8 text-xs font-medium transition-all duration-200 active:scale-95">
								{showMap ? (
									<>
										<Map className="w-3 h-3 mr-1.5 flex-shrink-0" />
										<span className="truncate">Map</span>
									</>
								) : (
									<>
										<List className="w-3 h-3 mr-1.5 flex-shrink-0" />
										<span className="truncate">List</span>
									</>
								)}
							</Button>
						)}

						{/* Mobile Filter Button - More Compact */}
						{onFilterClick && (
							<Button variant="outline" size="sm" onClick={onFilterClick} className="flex-1 min-w-0 h-8 text-xs font-medium border-border dark:border-border hover:bg-gray-50 dark:hover:bg-card transition-all duration-200 active:scale-95">
								<Filter className="w-3 h-3 mr-1.5 flex-shrink-0" />
								<span className="truncate">Filters</span>
							</Button>
						)}

						{/* Mobile AI Button - More Compact */}
						{onAIClick && (
							<Button variant="outline" size="sm" onClick={onAIClick} className="flex-1 min-w-0 h-8 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-primary dark:text-primary/90 border-primary/30 dark:border-primary hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-950 dark:hover:to-indigo-950 transition-all duration-200 active:scale-95">
								<Bot className="w-3 h-3 mr-1.5 flex-shrink-0" />
								<span className="truncate">AI</span>
							</Button>
						)}
					</div>

					{/* Mobile: Sort Dropdown - Full Width */}
					{onSortChange && (
						<DropdownMenu open={showSort} onOpenChange={setShowSort}>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="w-full h-10 text-sm font-medium justify-between border-border dark:border-border hover:bg-gray-50 dark:hover:bg-card transition-all duration-200 active:scale-95">
									<div className="flex items-center">
										<span className="font-normal text-muted-foreground dark:text-muted-foreground mr-2">Sort:</span>
										<span className="font-medium">{sortOptions.find((option) => option.value === sortBy)?.label || "Relevance"}</span>
									</div>
									<ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center" className="w-[calc(100vw-2rem)] max-w-sm shadow-lg border-border dark:border-border">
								{sortOptions.map((option) => (
									<DropdownMenuItem key={option.value} onClick={() => handleSortSelect(option.value)} className="cursor-pointer py-3 px-4 hover:bg-gray-50 dark:hover:bg-card transition-colors duration-150 active:bg-muted dark:active:bg-muted">
										<span className="font-medium text-base">{option.label}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>

				{/* Desktop/Tablet Layout (sm and up) - More Compact */}
				<div className="hidden sm:block">
					<div className="space-y-2.5">
						{/* Desktop: Results Summary - Compact */}
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0 space-y-1.5">
								{/* Desktop: Main Results Count - Smaller */}
								<div className="flex items-center gap-3">
									<h1 className="text-lg font-bold tracking-tight text-foreground dark:text-white leading-tight">{formatResultsText()}</h1>

									{/* Desktop: Status Badges - More Compact */}
									{!loading && resultsCount > 0 && (
										<div className="flex items-center gap-2">
											<Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium text-xs">
												<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
												{openCount} open
											</Badge>
										</div>
									)}
								</div>

								{/* Desktop: Search Context - More Compact */}
								{formatSearchText() && (
									<div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
										<span className="font-medium">Searching:</span>
										<span className="px-1.5 py-0.5 bg-muted dark:bg-card rounded font-mono text-xs">{formatSearchText()}</span>
									</div>
								)}
							</div>
						</div>

						{/* Desktop: Action Bar - More Compact */}
						<div className="flex items-center justify-between pt-1.5 border-t border-border dark:border-border">
							{/* Desktop: Primary Actions - More Compact */}
							<div className="flex items-center gap-2">
								{onMapToggle && (
									<div className="bg-gray-50 dark:bg-card/50 rounded-md p-0.5">
										<Button variant={showMap ? "default" : "ghost"} size="sm" onClick={onMapToggle} className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${showMap ? "bg-primary hover:bg-primary text-white" : "hover:bg-muted dark:hover:bg-muted"}`}>
											{showMap ? (
												<>
													<Map className="w-3 h-3 mr-1.5" />
													Map
												</>
											) : (
												<>
													<List className="w-3 h-3 mr-1.5" />
													List
												</>
											)}
										</Button>
									</div>
								)}

								{onAIClick && (
									<Button variant="outline" size="sm" onClick={onAIClick} className="h-7 px-3 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-primary dark:text-primary/90 border-primary/30 dark:border-primary hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-950 dark:hover:to-indigo-950 transition-all duration-200">
										<Bot className="w-3 h-3 mr-1.5" />
										AI
									</Button>
								)}
							</div>

							{/* Desktop: Secondary Actions - More Compact */}
							<div className="flex items-center gap-1.5">
								{/* Desktop: Filter Button - More Compact */}
								{onFilterClick && (
									<Button variant="outline" size="sm" onClick={onFilterClick} className="h-7 px-3 text-xs font-medium border-border dark:border-border hover:bg-gray-50 dark:hover:bg-card transition-all duration-200">
										<Filter className="w-3 h-3 mr-1.5" />
										Filters
									</Button>
								)}

								{/* Desktop: Sort Dropdown - More Compact */}
								{onSortChange && (
									<DropdownMenu open={showSort} onOpenChange={setShowSort}>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" size="sm" className="h-7 px-3 text-xs font-medium min-w-[120px] justify-between border-border dark:border-border hover:bg-gray-50 dark:hover:bg-card transition-all duration-200">
												<span className="truncate">{sortOptions.find((option) => option.value === sortBy)?.label || "Sort"}</span>
												<ChevronDown className="w-3 h-3 ml-1.5 flex-shrink-0 transition-transform duration-200" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-48 shadow-lg border-border dark:border-border">
											{sortOptions.map((option) => (
												<DropdownMenuItem key={option.value} onClick={() => handleSortSelect(option.value)} className="cursor-pointer py-2 px-3 hover:bg-gray-50 dark:hover:bg-card transition-colors duration-150">
													<span className="font-medium text-sm">{option.label}</span>
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MinimalistSearchHeader;
