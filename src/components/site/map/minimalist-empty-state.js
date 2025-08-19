"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Search, MapPin, Filter, RefreshCw } from "lucide-react";

const MinimalistEmptyState = ({ hasQuery = false, searchQuery = "", searchLocation = "", onClearSearch, onAdjustFilters, className = "" }) => {
	const popularSuggestions = ["Restaurants", "Coffee Shops", "Plumbers", "Hair Salons", "Auto Repair", "Dentists"];

	return (
		<div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
			{hasQuery ? (
				// No results for search
				<>
					<div className="w-16 h-16 bg-muted dark:bg-card rounded-full flex items-center justify-center mb-6">
						<Search className="w-8 h-8 text-muted-foreground" />
					</div>

					<h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">No businesses found</h3>

					<p className="text-muted-foreground dark:text-muted-foreground mb-6 max-w-md">
						We couldn&apos;t find any businesses matching your search
						{searchQuery && (
							<>
								{" for "}
								<span className="font-medium">&quot;{searchQuery}&quot;</span>
							</>
						)}
						{searchLocation && (
							<>
								{" near "}
								<span className="font-medium">{searchLocation}</span>
							</>
						)}
						. Try adjusting your search or filters.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 mb-8">
						{onClearSearch && (
							<Button variant="outline" onClick={onClearSearch} className="flex items-center gap-2">
								<RefreshCw className="w-4 h-4" />
								Clear Search
							</Button>
						)}

						{onAdjustFilters && (
							<Button variant="outline" onClick={onAdjustFilters} className="flex items-center gap-2">
								<Filter className="w-4 h-4" />
								Adjust Filters
							</Button>
						)}
					</div>
				</>
			) : (
				// Initial state - no search yet
				<>
					<div className="w-16 h-16 bg-primary/10 dark:bg-primary/30 rounded-full flex items-center justify-center mb-6">
						<MapPin className="w-8 h-8 text-primary dark:text-primary" />
					</div>

					<h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">Discover Local Businesses</h3>

					<p className="text-muted-foreground dark:text-muted-foreground mb-8 max-w-md">Search for businesses or explore the map to find restaurants, services, and more in your area.</p>
				</>
			)}

			{/* Popular Suggestions */}
			<div className="space-y-3">
				<p className="text-sm text-muted-foreground dark:text-muted-foreground">{hasQuery ? "Try searching for:" : "Popular searches:"}</p>

				<div className="flex flex-wrap gap-2 justify-center max-w-md">
					{popularSuggestions.map((suggestion) => (
						<Badge
							key={suggestion}
							variant="outline"
							className="cursor-pointer hover:bg-accent transition-colors"
							onClick={() => {
								// Simulate clicking on the search input and typing
								const searchInput = document.querySelector('input[placeholder*="business"]');
								if (searchInput) {
									searchInput.value = suggestion;
									searchInput.dispatchEvent(new Event("input", { bubbles: true }));
									searchInput.focus();
								}
							}}
						>
							{suggestion}
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
};

export default MinimalistEmptyState;
