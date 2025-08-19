"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Slider } from "@components/ui/slider";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import { ScrollArea } from "@components/ui/scroll-area";
import { Filter, X, Star, MapPin, DollarSign, Clock, CheckCircle, RefreshCw, Settings } from "lucide-react";
import { withErrorHandling } from "@utils/error-handler";

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, onClearFilters, totalResults = 0, loading = false }) => {
	const [localFilters, setLocalFilters] = useState(filters);
	const [isApplying, setIsApplying] = useState(false);

	// Update local filters when props change
	useEffect(() => {
		setLocalFilters(filters);
	}, [filters]);

	// Apply filters with debouncing
	const applyFilters = useCallback(
		withErrorHandling(async (newFilters) => {
			setIsApplying(true);
			try {
				await onFiltersChange(newFilters);
			} finally {
				setIsApplying(false);
			}
		}, "FilterPanel"),
		[onFiltersChange, setIsApplying]
	);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(key, value) => {
			const newFilters = { ...localFilters, [key]: value };
			setLocalFilters(newFilters);

			// Debounce the apply function
			const timeoutId = setTimeout(() => {
				applyFilters(newFilters);
			}, 300);

			return () => clearTimeout(timeoutId);
		},
		[localFilters, applyFilters]
	);

	// Handle range filter changes
	const handleRangeChange = useCallback(
		(key, value) => {
			const newFilters = { ...localFilters, [key]: value };
			setLocalFilters(newFilters);
		},
		[localFilters]
	);

	// Handle checkbox filter changes
	const handleCheckboxChange = useCallback(
		(key, value, checked) => {
			const currentValues = localFilters[key] || [];
			const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);

			handleFilterChange(key, newValues);
		},
		[localFilters, handleFilterChange]
	);

	// Clear all filters
	const handleClearAll = useCallback(() => {
		const clearedFilters = {
			rating: [0, 5],
			distance: [0, 50],
			priceRange: [0, 4],
			categories: [],
			openNow: false,
			verified: false,
			sponsored: false,
			keywords: "",
			sortBy: "relevance",
		};

		setLocalFilters(clearedFilters);
		onClearFilters();
	}, [onClearFilters]);

	// Reset to default filters
	const handleReset = useCallback(() => {
		const defaultFilters = {
			rating: [0, 5],
			distance: [0, 25],
			priceRange: [0, 4],
			categories: [],
			openNow: false,
			verified: false,
			sponsored: false,
			keywords: "",
			sortBy: "relevance",
		};

		setLocalFilters(defaultFilters);
		applyFilters(defaultFilters);
	}, [applyFilters]);

	if (!isOpen) return null;

	return (
		<>
			{/* Mobile Bottom Sheet */}
			<div className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
				<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card rounded-t-2xl max-h-[85vh] overflow-hidden shadow-2xl border-t border-border dark:border-border">
					{/* Mobile Handle */}
					<div className="flex justify-center py-3 bg-gray-50 dark:bg-card">
						<div className="w-12 h-1 bg-muted dark:bg-muted rounded-full"></div>
					</div>

					{/* Mobile Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border bg-white dark:bg-card">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-primary/50 rounded-lg">
								<Filter className="w-4 h-4 text-primary dark:text-primary" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-foreground dark:text-white">Filters</h2>
								{totalResults > 0 && <Badge className="bg-blue-50 dark:bg-primary/50 text-primary dark:text-primary/90 border-primary/30 dark:border-primary px-2 py-0.5 rounded font-medium text-xs">{totalResults.toLocaleString()} matches</Badge>}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" onClick={handleReset} disabled={loading || isApplying} className="h-10 w-10 p-0 hover:bg-muted dark:hover:bg-card transition-colors duration-200 active:scale-95">
								<RefreshCw className="w-5 h-5" />
							</Button>
							<Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 hover:bg-muted dark:hover:bg-card transition-colors duration-200 active:scale-95">
								<X className="w-5 h-5" />
							</Button>
						</div>
					</div>

					{/* Mobile Filter Content */}
					<ScrollArea className="max-h-[calc(85vh-160px)]">
						<div className="p-4 space-y-6">
							{/* Keywords Search */}
							<div className="space-y-3">
								<Label htmlFor="keywords" className="flex items-center gap-2 text-base font-medium">
									<Settings className="w-4 h-4" />
									Keywords
								</Label>
								<Input id="keywords" placeholder="Search keywords..." value={localFilters.keywords || ""} onChange={(e) => handleFilterChange("keywords", e.target.value)} className="h-11 text-base" />
							</div>

							<Separator />

							{/* Rating Filter */}
							<div className="space-y-4">
								<Label className="flex items-center gap-2 text-base font-medium">
									<Star className="w-4 h-4" />
									Rating ({localFilters.rating?.[0] || 0} - {localFilters.rating?.[1] || 5} stars)
								</Label>
								<Slider value={localFilters.rating || [0, 5]} onValueChange={(value) => handleRangeChange("rating", value)} onValueCommit={(value) => handleFilterChange("rating", value)} max={5} min={0} step={0.5} className="w-full" />
								<div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground">
									<span>0 stars</span>
									<span>5 stars</span>
								</div>
							</div>

							<Separator />

							{/* Price Range */}
							<div className="space-y-4">
								<Label className="flex items-center gap-2 text-base font-medium">
									<DollarSign className="w-4 h-4" />
									Price Range (${localFilters.priceRange?.[0] || 0} - ${localFilters.priceRange?.[1] || 200})
								</Label>
								<Slider value={localFilters.priceRange || [0, 200]} onValueChange={(value) => handleRangeChange("priceRange", value)} onValueCommit={(value) => handleFilterChange("priceRange", value)} max={200} min={0} step={10} className="w-full" />
								<div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground">
									<span>$0</span>
									<span>$200+</span>
								</div>
							</div>

							<Separator />

							{/* Distance */}
							<div className="space-y-4">
								<Label className="flex items-center gap-2 text-base font-medium">
									<MapPin className="w-4 h-4" />
									Distance ({localFilters.distance?.[0] || 0} - {localFilters.distance?.[1] || 25} miles)
								</Label>
								<Slider value={localFilters.distance || [0, 25]} onValueChange={(value) => handleRangeChange("distance", value)} onValueCommit={(value) => handleFilterChange("distance", value)} max={25} min={0} step={1} className="w-full" />
								<div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground">
									<span>0 miles</span>
									<span>25+ miles</span>
								</div>
							</div>

							<Separator />

							{/* Categories */}
							<div className="space-y-4">
								<Label className="flex items-center gap-2 text-base font-medium">
																	<div className="w-4 h-4 rounded bg-primary" />
								Categories
								</Label>
								<div className="grid grid-cols-1 gap-3">
									{BUSINESS_CATEGORIES.map((category) => (
										<label key={category.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors cursor-pointer">
											<Checkbox checked={localFilters.categories?.includes(category.id)} onCheckedChange={(checked) => handleCategoryChange(category.id, checked)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
											<span className="text-base font-medium text-foreground dark:text-white flex-1">{category.name}</span>
										</label>
									))}
								</div>
							</div>

							<Separator />

							{/* Features */}
							<div className="space-y-4">
								<Label className="flex items-center gap-2 text-base font-medium">
																	<div className="w-4 h-4 rounded bg-warning" />
								Features
								</Label>
								<div className="grid grid-cols-1 gap-3">
									{BUSINESS_FEATURES.map((feature) => (
										<label key={feature.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors cursor-pointer">
											<Checkbox checked={localFilters.features?.includes(feature.id)} onCheckedChange={(checked) => handleFeatureChange(feature.id, checked)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
											<span className="text-base font-medium text-foreground dark:text-white flex-1">{feature.name}</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</ScrollArea>

					{/* Mobile Action Buttons */}
					<div className="p-4 border-t border-border dark:border-border bg-gray-50/50 dark:bg-card/20">
						<div className="flex gap-3">
							<Button variant="outline" onClick={handleClearAll} disabled={loading || isApplying} className="flex-1 h-12 font-medium border-border dark:border-border hover:bg-gray-50 dark:hover:bg-muted transition-all duration-200 active:scale-95">
								Clear All
							</Button>
							<Button onClick={onClose} disabled={loading || isApplying} className="flex-1 h-12 font-medium bg-primary hover:bg-primary text-white shadow-sm transition-all duration-200 active:scale-95">
								{isApplying ? (
									<>
										<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
										Applying...
									</>
								) : (
									"Apply Filters"
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop Modal */}
			<div className="hidden sm:flex fixed inset-0 z-50 bg-black/60 backdrop-blur-sm items-center justify-center p-4">
				<Card className="w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-border dark:border-border bg-white/95 dark:bg-card/95 backdrop-blur-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border dark:border-border">
						<CardTitle className="flex items-center gap-3 text-lg font-bold">
							<div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-primary/50 rounded-xl">
								<Filter className="w-5 h-5 text-primary dark:text-primary" />
							</div>
							<div>
								<h2 className="text-foreground dark:text-white">Filter Results</h2>
								{totalResults > 0 && <Badge className="bg-blue-50 dark:bg-primary/50 text-primary dark:text-primary/90 border-primary/30 dark:border-primary px-2 py-1 rounded-md font-medium text-xs mt-1">{totalResults.toLocaleString()} matches</Badge>}
							</div>
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" onClick={handleReset} disabled={loading || isApplying} className="h-9 w-9 p-0 hover:bg-muted dark:hover:bg-card transition-colors duration-200">
								<RefreshCw className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 hover:bg-muted dark:hover:bg-card transition-colors duration-200">
								<X className="w-4 h-4" />
							</Button>
						</div>
					</CardHeader>

					<ScrollArea className="max-h-[calc(90vh-120px)]">
						<CardContent className="space-y-6">
							{/* Keywords Search */}
							<div className="space-y-2">
								<Label htmlFor="keywords" className="flex items-center gap-2">
									<Settings className="w-4 h-4" />
									Keywords
								</Label>
								<Input id="keywords" placeholder="Search keywords..." value={localFilters.keywords || ""} onChange={(e) => handleFilterChange("keywords", e.target.value)} />
							</div>

							<Separator />

							{/* Rating Filter */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<Star className="w-4 h-4" />
									Rating ({localFilters.rating?.[0] || 0} - {localFilters.rating?.[1] || 5} stars)
								</Label>
								<Slider value={localFilters.rating || [0, 5]} onValueChange={(value) => handleRangeChange("rating", value)} onValueCommit={(value) => handleFilterChange("rating", value)} max={5} min={0} step={0.5} className="w-full" />
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>0 stars</span>
									<span>5 stars</span>
								</div>
							</div>

							<Separator />

							{/* Distance Filter */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Distance ({localFilters.distance?.[0] || 0} - {localFilters.distance?.[1] || 50} miles)
								</Label>
								<Slider value={localFilters.distance || [0, 50]} onValueChange={(value) => handleRangeChange("distance", value)} onValueCommit={(value) => handleFilterChange("distance", value)} max={50} min={0} step={1} className="w-full" />
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>0 miles</span>
									<span>50 miles</span>
								</div>
							</div>

							<Separator />

							{/* Price Range Filter */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<DollarSign className="w-4 h-4" />
									Price Range
								</Label>
								<Slider value={localFilters.priceRange || [0, 4]} onValueChange={(value) => handleRangeChange("priceRange", value)} onValueCommit={(value) => handleFilterChange("priceRange", value)} max={4} min={0} step={1} className="w-full" />
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>$</span>
									<span>$$$$</span>
								</div>
							</div>

							<Separator />

							{/* Categories Filter */}
							<div className="space-y-3">
								<Label>Categories</Label>
								<div className="grid grid-cols-2 gap-2">
									{["Restaurants", "Plumbing", "Electrical", "HVAC", "Landscaping", "Cleaning", "Moving", "Real Estate"].map((category) => (
										<div key={category} className="flex items-center space-x-2">
											<Checkbox id={category} checked={localFilters.categories?.includes(category) || false} onCheckedChange={(checked) => handleCheckboxChange("categories", category, checked)} />
											<Label htmlFor={category} className="text-sm">
												{category}
											</Label>
										</div>
									))}
								</div>
							</div>

							<Separator />

							{/* Boolean Filters */}
							<div className="space-y-3">
								<Label>Additional Filters</Label>

								<div className="flex items-center space-x-2">
									<Checkbox id="openNow" checked={localFilters.openNow || false} onCheckedChange={(checked) => handleFilterChange("openNow", checked)} />
									<Label htmlFor="openNow" className="flex items-center gap-2">
										<Clock className="w-4 h-4" />
										Open Now
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox id="verified" checked={localFilters.verified || false} onCheckedChange={(checked) => handleFilterChange("verified", checked)} />
									<Label htmlFor="verified" className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4" />
										Verified Businesses
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox id="sponsored" checked={localFilters.sponsored || false} onCheckedChange={(checked) => handleFilterChange("sponsored", checked)} />
									<Label htmlFor="sponsored" className="flex items-center gap-2">
										<Star className="w-4 h-4" />
										Sponsored Results
									</Label>
								</div>
							</div>

							<Separator />

							{/* Sort Options */}
							<div className="space-y-3">
								<Label>Sort By</Label>
								<div className="space-y-2">
									{[
										{ value: "relevance", label: "Relevance" },
										{ value: "rating", label: "Highest Rated" },
										{ value: "distance", label: "Nearest" },
										{ value: "reviews", label: "Most Reviews" },
										{ value: "name", label: "Name A-Z" },
									].map((option) => (
										<div key={option.value} className="flex items-center space-x-2">
											<input type="radio" id={option.value} name="sortBy" value={option.value} checked={localFilters.sortBy === option.value} onChange={(e) => handleFilterChange("sortBy", e.target.value)} className="w-4 h-4" />
											<Label htmlFor={option.value} className="text-sm">
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</ScrollArea>

					{/* Modern Action Buttons */}
					<div className="p-6 border-t border-border dark:border-border bg-gray-50/50 dark:bg-card/20">
						<div className="flex gap-3">
							<Button variant="outline" onClick={handleClearAll} disabled={loading || isApplying} className="flex-1 h-11 font-medium border-border dark:border-border hover:bg-gray-50 dark:hover:bg-muted transition-all duration-200">
								Clear All
							</Button>
							<Button onClick={onClose} disabled={loading || isApplying} className="flex-1 h-11 font-medium bg-primary hover:bg-primary text-white shadow-sm transition-all duration-200">
								{isApplying ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Applying...
									</>
								) : (
									"Apply Filters"
								)}
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</>
	);
};

export default FilterPanel;
