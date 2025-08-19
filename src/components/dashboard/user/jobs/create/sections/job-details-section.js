/**
 * JobDetailsSection Component
 * Job posting details form section
 * Extracted from large jobs create page for better organization
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { getSubcategoriesForCategory, searchCategories, groupCategoriesByParent } from "@lib/jobs/categories";

export const JobDetailsSection = ({ formData, onInputChange, errors = {}, allCategories = [] }) => {
	const [categorySearch, setCategorySearch] = useState("");
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const categoryDropdownRef = useRef(null);

	// Filter categories based on search
	const filteredCategories = searchCategories(categorySearch, allCategories);
	const groupedCategories = groupCategoriesByParent(filteredCategories);

	// Get subcategories for selected category
	const subCategories = getSubcategoriesForCategory(formData.category);

	// Close category dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
				setCategoryDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Job Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Job Title */}
				<div>
					<Label htmlFor="title">Job Title *</Label>
					<Input id="title" placeholder="e.g., Kitchen Faucet Replacement, Website Design, Tax Preparation" value={formData.title} onChange={(e) => onInputChange("title", e.target.value)} className={errors.title ? "border-destructive" : ""} required />
					{errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
				</div>

				{/* Category Search */}
				<div className="relative" ref={categoryDropdownRef}>
					<Label htmlFor="category">Category *</Label>
					<Input id="category-search" placeholder="Search or select any industry (e.g., Dentist, Plumber, Marketing, etc.)" value={categorySearch || formData.category} onChange={(e) => setCategorySearch(e.target.value)} onFocus={() => setCategoryDropdownOpen(true)} className={errors.category ? "border-destructive" : ""} autoComplete="off" required />
					{errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}

					{/* Category Dropdown */}
					{categoryDropdownOpen && (
						<div className="absolute z-50 w-full mt-2 overflow-y-auto border rounded-lg shadow-lg max-h-[min(288px,50vh)] bg-card border-border">
							{Object.entries(groupedCategories).map(([parent, cats]) => (
								<div key={parent}>
									<div className="sticky top-0 px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">{parent}</div>
									{cats
										.filter((cat) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()) || cat.description.toLowerCase().includes(categorySearch.toLowerCase()))
										.map((cat) => (
											<button
												key={cat.slug}
												type="button"
												className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary/5 focus:bg-primary/5 transition-colors ${formData.category === cat.name ? "bg-primary/5 text-primary font-semibold border border-primary/20" : "text-foreground"}`}
												onClick={() => {
													onInputChange("category", cat.name);
													setCategorySearch(cat.name);
													setCategoryDropdownOpen(false);
													// Clear subcategory when changing category
													onInputChange("subCategory", "");
												}}
											>
												<span className="text-xl">{cat.emoji}</span>
												<span className="flex-1">
													{cat.name}
													<span className="block text-xs text-muted-foreground">{cat.description}</span>
												</span>
												{cat.trending && <Badge className="ml-2 text-success bg-success/10">Trending</Badge>}
											</button>
										))}
								</div>
							))}
							{filteredCategories.length === 0 && <div className="px-3 py-2 text-muted-foreground">No results found.</div>}
						</div>
					)}
				</div>

				{/* Subcategory Selection */}
				{formData.category && subCategories.length > 0 && (
					<div>
						<Label htmlFor="subCategory">Specific Service *</Label>
						<Select value={formData.subCategory} onValueChange={(value) => onInputChange("subCategory", value)}>
							<SelectTrigger className={errors.subCategory ? "border-destructive" : ""}>
								<SelectValue placeholder="Select specific service" />
							</SelectTrigger>
							<SelectContent>
								{subCategories.map((subCat) => (
									<SelectItem key={subCat} value={subCat}>
										{subCat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.subCategory && <p className="text-sm text-destructive mt-1">{errors.subCategory}</p>}
					</div>
				)}

				{/* Description */}
				<div>
					<Label htmlFor="description">Description *</Label>
					<Textarea id="description" placeholder="Describe your project in detail. Include specific requirements, timeline, location details, and any other important information..." value={formData.description} onChange={(e) => onInputChange("description", e.target.value)} className={errors.description ? "border-destructive" : ""} rows={6} required />
					{errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
					<div className="flex justify-between items-center mt-1">
						<p className="text-xs text-muted-foreground">Minimum 50 characters required</p>
						<p className={`text-xs ${formData.description.length >= 50 ? "text-success" : "text-muted-foreground"}`}>{formData.description.length}/50</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
