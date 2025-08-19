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
		<div className={`bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 ${className}`}>
			<div className="px-3 py-2.5">
				{/* Top Row - Results Count and Search Info - More Compact */}
				<div className="flex items-center justify-between mb-2">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2.5">
							{/* Results Count - Smaller */}
							<h2 className="text-base font-semibold text-foreground dark:text-white">{formatResultsText()}</h2>

							{/* Open Count Badge - More Compact */}
							{!loading && resultsCount > 0 && (
								<Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30 px-1.5 py-0.5 text-xs">
									<div className="w-1 h-1 bg-emerald-500 rounded-full mr-1" />
									{openCount} open
								</Badge>
							)}
						</div>

						{/* Search Query - More Compact */}
						{formatSearchText() && <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 truncate">{formatSearchText()}</p>}
					</div>
				</div>

				{/* Bottom Row - Controls - More Compact */}
				<div className="flex items-center justify-between">
					{/* Left Side - View Toggle - More Compact */}
					<div className="flex items-center gap-1.5">
						{onMapToggle && (
							<Button variant={showMap ? "default" : "outline"} size="sm" onClick={onMapToggle} className="h-7 px-3 text-xs">
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
						)}

						{onAIClick && (
							<Button variant="outline" size="sm" onClick={onAIClick} className="h-7 px-3 text-xs bg-blue-50 dark:bg-primary/30 text-primary dark:text-primary border-primary/30 dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/50">
								<Bot className="w-3 h-3 mr-1.5" />
								AI
							</Button>
						)}
					</div>

					{/* Right Side - Filter and Sort - More Compact */}
					<div className="flex items-center gap-1.5">
						{/* Filter Button - More Compact */}
						{onFilterClick && (
							<Button variant="outline" size="sm" onClick={onFilterClick} className="h-7 px-3 text-xs">
								<Filter className="w-3 h-3 mr-1.5" />
								Filters
							</Button>
						)}

						{/* Sort Dropdown - More Compact */}
						{onSortChange && (
							<DropdownMenu open={showSort} onOpenChange={setShowSort}>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" className="h-7 px-3 text-xs min-w-[100px] justify-between">
										<span className="truncate">{sortOptions.find((option) => option.value === sortBy)?.label || "Sort"}</span>
										<ChevronDown className="w-3 h-3 ml-1.5 flex-shrink-0" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40">
									{sortOptions.map((option) => (
										<DropdownMenuItem key={option.value} onClick={() => handleSortSelect(option.value)} className="cursor-pointer text-sm py-2">
											{option.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MinimalistSearchHeader;
