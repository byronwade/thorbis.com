"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { 
	Search, Grid3X3, List, ChevronRight, TrendingUp, Star, Building, ArrowUpDown,
	Utensils, Stethoscope, Wrench, Scissors, Car, ShoppingBag, Scale, Gamepad2,
	GraduationCap, Coffee, Wine, Cake, Clock, Pill, Zap, Paintbrush, Dumbbell,
	Camera, Hammer, MapPin, Shield, Laptop, Store, Users
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";

// Category icon mapping for clean, professional appearance
const getCategoryIcon = (slug) => {
	const iconMap = {
		// Food & Dining
		"restaurants": Utensils,
		"bars": Wine,
		"cafes": Coffee,
		"fast-food": Store,
		"bakeries": Cake,
		"food-trucks": MapPin,
		
		// Health & Medical
		"dentist": Stethoscope,
		"doctors": Stethoscope,
		"urgent-care": Clock,
		"pharmacy": Pill,
		"physical-therapy": Dumbbell,
		"mental-health": Users,
		
		// Home Services
		"plumbing": Wrench,
		"electrician": Zap,
		"hvac": Building,
		"cleaning": Paintbrush,
		"landscaping": MapPin,
		"handyman": Hammer,
		
		// Beauty & Wellness
		"hair-salon": Scissors,
		"nail-salon": Scissors,
		"spa": Star,
		"massage": Users,
		"tattoo": Paintbrush,
		
		// Automotive
		"auto-repair": Car,
		"oil-change": Car,
		"car-wash": Car,
		"tire-shop": Car,
		"auto-body": Car,
		
		// Shopping & Retail
		"clothing": ShoppingBag,
		"electronics": Laptop,
		"grocery": ShoppingBag,
		"jewelry": Star,
		"furniture": Building,
		
		// Professional Services
		"lawyers": Scale,
		"accountant": Building,
		"real-estate": Building,
		"insurance": Shield,
		"marketing": Camera,
		
		// Entertainment & Recreation
		"gyms": Dumbbell,
		"movies": Camera,
		"bowling": Gamepad2,
		"golf": Gamepad2,
		"parks": MapPin,
		
		// Education & Learning
		"tutoring": GraduationCap,
		"driving-school": Car,
		"music-lessons": GraduationCap,
		"dance-studios": Users,
		"art-classes": Paintbrush,
	};
	return iconMap[slug] || Building;
};

// Comprehensive category data - designed to scale to thousands
export const ALL_CATEGORIES = [
	// Food & Dining
	{ slug: "restaurants", name: "Restaurants", parent: "Food & Dining", count: "12,847", trending: true, description: "Dining establishments from casual to fine dining" },
	{ slug: "bars", name: "Bars & Nightlife", parent: "Food & Dining", count: "3,421", trending: true, description: "Bars, pubs, and nightlife venues" },
	{ slug: "cafes", name: "Cafes & Coffee Shops", parent: "Food & Dining", count: "4,892", trending: false, description: "Coffee shops, cafes, and tea houses" },
	{ slug: "fast-food", name: "Fast Food", parent: "Food & Dining", count: "8,234", trending: false, description: "Quick service restaurants and fast food" },
	{ slug: "bakeries", name: "Bakeries", parent: "Food & Dining", count: "2,156", trending: false, description: "Bakeries, patisseries, and bread shops" },
	{ slug: "food-trucks", name: "Food Trucks", parent: "Food & Dining", count: "1,387", trending: true, description: "Mobile food vendors and food trucks" },

	// Health & Medical
	{ slug: "dentist", name: "Dentists", parent: "Health & Medical", count: "8,943", trending: false, description: "Dental care and oral health services" },
	{ slug: "doctors", name: "Doctors", parent: "Health & Medical", count: "15,672", trending: false, description: "General practitioners and medical doctors" },
	{ slug: "urgent-care", name: "Urgent Care", parent: "Health & Medical", count: "2,834", trending: true, description: "Urgent care centers and walk-in clinics" },
	{ slug: "pharmacy", name: "Pharmacies", parent: "Health & Medical", count: "6,521", trending: false, description: "Pharmacies and prescription services" },
	{ slug: "physical-therapy", name: "Physical Therapy", parent: "Health & Medical", count: "4,287", trending: true, description: "Physical therapy and rehabilitation" },
	{ slug: "mental-health", name: "Mental Health", parent: "Health & Medical", count: "3,456", trending: true, description: "Mental health and counseling services" },

	// Home Services
	{ slug: "plumbing", name: "Plumbing", parent: "Home Services", count: "7,892", trending: false, description: "Plumbing repair and installation services" },
	{ slug: "electrician", name: "Electricians", parent: "Home Services", count: "6,743", trending: false, description: "Electrical repair and installation" },
	{ slug: "hvac", name: "HVAC", parent: "Home Services", count: "5,234", trending: false, description: "Heating, ventilation, and air conditioning" },
	{ slug: "cleaning", name: "House Cleaning", parent: "Home Services", count: "9,156", trending: true, description: "House cleaning and maid services" },
	{ slug: "landscaping", name: "Landscaping", parent: "Home Services", count: "4,567", trending: true, description: "Landscaping and lawn care services" },
	{ slug: "handyman", name: "Handyman Services", parent: "Home Services", count: "8,921", trending: false, description: "General handyman and repair services" },

	// Beauty & Wellness
	{ slug: "hair-salon", name: "Hair Salons", parent: "Beauty & Wellness", count: "11,234", trending: false, description: "Hair cutting, styling, and coloring" },
	{ slug: "nail-salon", name: "Nail Salons", parent: "Beauty & Wellness", count: "6,789", trending: false, description: "Nail care and manicure services" },
	{ slug: "spa", name: "Spas", parent: "Beauty & Wellness", count: "3,892", trending: true, description: "Day spas and wellness centers" },
	{ slug: "massage", name: "Massage Therapy", parent: "Beauty & Wellness", count: "4,567", trending: true, description: "Massage therapy and bodywork" },
	{ slug: "tattoo", name: "Tattoo Shops", parent: "Beauty & Wellness", count: "2,134", trending: false, description: "Tattoo parlors and body art" },

	// Automotive
	{ slug: "auto-repair", name: "Auto Repair", parent: "Automotive", count: "12,567", trending: false, description: "General automotive repair services" },
	{ slug: "oil-change", name: "Oil Change", parent: "Automotive", count: "4,892", trending: false, description: "Oil change and quick lube services" },
	{ slug: "car-wash", name: "Car Wash", parent: "Automotive", count: "3,245", trending: false, description: "Car wash and detailing services" },
	{ slug: "tire-shop", name: "Tire Shops", parent: "Automotive", count: "5,678", trending: false, description: "Tire sales and installation" },
	{ slug: "auto-body", name: "Auto Body Shops", parent: "Automotive", count: "4,321", trending: false, description: "Auto body repair and painting" },

	// Shopping & Retail
	{ slug: "clothing", name: "Clothing Stores", parent: "Shopping & Retail", count: "18,934", trending: true, description: "Clothing and fashion retail" },
	{ slug: "electronics", name: "Electronics", parent: "Shopping & Retail", count: "8,765", trending: true, description: "Electronics and tech gadgets" },
	{ slug: "grocery", name: "Grocery Stores", parent: "Shopping & Retail", count: "15,432", trending: false, description: "Grocery stores and supermarkets" },
	{ slug: "jewelry", name: "Jewelry Stores", parent: "Shopping & Retail", count: "4,321", trending: false, description: "Jewelry and watch stores" },
	{ slug: "furniture", name: "Furniture Stores", parent: "Shopping & Retail", count: "6,789", trending: false, description: "Furniture and home furnishings" },

	// Professional Services
	{ slug: "lawyers", name: "Lawyers", parent: "Professional Services", count: "13,456", trending: false, description: "Legal services and attorneys" },
	{ slug: "accountant", name: "Accountants", parent: "Professional Services", count: "9,234", trending: false, description: "Accounting and tax services" },
	{ slug: "real-estate", name: "Real Estate", parent: "Professional Services", count: "11,567", trending: true, description: "Real estate agents and services" },
	{ slug: "insurance", name: "Insurance", parent: "Professional Services", count: "7,892", trending: false, description: "Insurance agencies and agents" },
	{ slug: "marketing", name: "Marketing", parent: "Professional Services", count: "5,678", trending: true, description: "Marketing and advertising services" },

	// Entertainment & Recreation
	{ slug: "gyms", name: "Gyms & Fitness", parent: "Entertainment & Recreation", count: "8,345", trending: true, description: "Gyms, fitness centers, and studios" },
	{ slug: "movies", name: "Movie Theaters", parent: "Entertainment & Recreation", count: "2,134", trending: false, description: "Movie theaters and cinemas" },
	{ slug: "bowling", name: "Bowling Alleys", parent: "Entertainment & Recreation", count: "1,456", trending: false, description: "Bowling alleys and entertainment centers" },
	{ slug: "golf", name: "Golf Courses", parent: "Entertainment & Recreation", count: "3,789", trending: false, description: "Golf courses and driving ranges" },
	{ slug: "parks", name: "Parks & Recreation", parent: "Entertainment & Recreation", count: "5,234", trending: false, description: "Parks, trails, and outdoor recreation" },

	// Education & Learning
	{ slug: "tutoring", name: "Tutoring", parent: "Education & Learning", count: "4,567", trending: true, description: "Tutoring and educational services" },
	{ slug: "driving-school", name: "Driving Schools", parent: "Education & Learning", count: "2,345", trending: false, description: "Driving instruction and schools" },
	{ slug: "music-lessons", name: "Music Lessons", parent: "Education & Learning", count: "3,456", trending: false, description: "Music instruction and lessons" },
	{ slug: "dance-studios", name: "Dance Studios", parent: "Education & Learning", count: "2,789", trending: false, description: "Dance instruction and studios" },
	{ slug: "art-classes", name: "Art Classes", parent: "Education & Learning", count: "1,892", trending: false, description: "Art instruction and classes" },
];

const PARENT_CATEGORIES = ["All Categories", "Food & Dining", "Health & Medical", "Home Services", "Beauty & Wellness", "Automotive", "Shopping & Retail", "Professional Services", "Entertainment & Recreation", "Education & Learning"];

const SORT_OPTIONS = [
	{ value: "name", label: "Name A-Z" },
	{ value: "count", label: "Most Businesses" },
	{ value: "trending", label: "Trending" },
	{ value: "popular", label: "Most Popular" },
];

const AllCategoriesPage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedParent, setSelectedParent] = useState("All Categories");
	const [sortBy, setSortBy] = useState("name");
	const [viewMode, setViewMode] = useState("grid");
	const [showTrendingOnly, setShowTrendingOnly] = useState(false);

	const filteredAndSortedCategories = useMemo(() => {
		let filtered = ALL_CATEGORIES;

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()) || category.description.toLowerCase().includes(searchQuery.toLowerCase()) || category.parent.toLowerCase().includes(searchQuery.toLowerCase()));
		}

		// Filter by parent category
		if (selectedParent !== "All Categories") {
			filtered = filtered.filter((category) => category.parent === selectedParent);
		}

		// Filter by trending
		if (showTrendingOnly) {
			filtered = filtered.filter((category) => category.trending);
		}

		// Sort
		switch (sortBy) {
			case "count":
				filtered.sort((a, b) => parseInt(b.count.replace(/,/g, "")) - parseInt(a.count.replace(/,/g, "")));
				break;
			case "trending":
				filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
				break;
			case "popular":
				filtered.sort((a, b) => parseInt(b.count.replace(/,/g, "")) - parseInt(a.count.replace(/,/g, "")));
				break;
			default: // name
				filtered.sort((a, b) => a.name.localeCompare(b.name));
		}

		return filtered;
	}, [searchQuery, selectedParent, sortBy, showTrendingOnly]);

	const CategoryCard = ({ category }) => {
		const IconComponent = getCategoryIcon(category.slug);
		
		return (
			<Link href={`/categories/${category.slug}`}>
				<Card className="group h-full transition-all duration-300 hover:shadow-xl hover:border-primary/50 border-border/50 overflow-hidden">
					<CardContent className="p-6 relative">
						{/* Icon Container with Background */}
						<div className="flex items-start justify-between mb-4">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
								<IconComponent className="w-6 h-6 text-primary" />
							</div>
							{category.trending && (
								<Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
									<TrendingUp className="w-3 h-3 mr-1" />
									Trending
								</Badge>
							)}
						</div>

						{/* Content */}
						<div className="space-y-2 mb-4">
							<h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
								{category.name}
							</h3>
							<Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/20">
								{category.parent}
							</Badge>
							<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
								{category.description}
							</p>
						</div>

						{/* Footer */}
						<div className="flex items-center justify-between pt-3 border-t border-border/50">
							<span className="text-sm font-medium text-primary">
								{category.count} businesses
							</span>
							<div className="flex items-center text-primary text-sm font-medium">
								Explore
								<ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		);
	};

	const CategoryListItem = ({ category }) => {
		const IconComponent = getCategoryIcon(category.slug);
		
		return (
			<Link href={`/categories/${category.slug}`}>
				<Card className="group transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/50">
					<CardContent className="p-5">
						<div className="flex items-center gap-5">
							{/* Icon */}
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
								<IconComponent className="w-6 h-6 text-primary" />
							</div>
							
							{/* Content */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-2">
									<h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
										{category.name}
									</h3>
									{category.trending && (
										<Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
											<TrendingUp className="w-3 h-3 mr-1" />
											Trending
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground mb-1 leading-relaxed">{category.description}</p>
								<Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/20">
									{category.parent}
								</Badge>
							</div>
							
							{/* Stats */}
							<div className="text-right flex-shrink-0">
								<div className="text-lg font-semibold text-primary">{category.count}</div>
								<div className="text-xs text-muted-foreground">businesses</div>
							</div>
							
							{/* Arrow */}
							<ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
						</div>
					</CardContent>
				</Card>
			</Link>
		);
	};

			return (
			<div className="min-h-screen bg-background">
				{/* Header */}
				<div className="relative bg-background border-b border-border/50">
					<div className="px-4 py-20 lg:px-24">
						<div className="max-w-6xl mx-auto">
							<div className="text-center mb-12">
								<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<Building className="w-8 h-8 text-primary" />
								</div>
								<h1 className="text-4xl font-bold text-foreground mb-6 lg:text-5xl">Business Categories</h1>
								<p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
									Discover local businesses across all categories. Use our advanced search and filtering to find exactly what you need.
								</p>
							</div>

						{/* Search and Filters */}
						<div className="max-w-4xl mx-auto space-y-6">
							{/* Search Bar */}
							<div className="relative">
								<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input 
									placeholder="Search categories (e.g., restaurants, plumbers, dentists...)" 
									value={searchQuery} 
									onChange={(e) => setSearchQuery(e.target.value)} 
									className="pl-12 pr-20 h-14 text-base sm:text-lg border-2 border-border/50 focus:border-primary bg-card shadow-sm rounded-xl transition-all duration-200 focus:shadow-md" 
									aria-label="Search business categories"
								/>
								{searchQuery && (
									<Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="absolute right-2 top-2 h-10 text-muted-foreground hover:text-foreground" aria-label="Clear search">
										Clear
									</Button>
								)}
							</div>

							{/* Filter Pills */}
							<div className="flex flex-wrap gap-2 justify-center sm:gap-3">
								{PARENT_CATEGORIES.map((parent) => (
									<Button 
										key={parent} 
										variant={selectedParent === parent ? "default" : "outline"} 
										size="sm" 
										onClick={() => setSelectedParent(parent)} 
										className={`h-9 px-4 text-sm font-medium transition-all duration-200 ${
											selectedParent === parent 
												? "bg-primary text-primary-foreground shadow-sm" 
												: "hover:bg-primary/10 hover:border-primary/50"
										}`}
										aria-pressed={selectedParent === parent}
									>
										{parent}
										{parent !== "All Categories" && (
											<span className="ml-2 text-xs opacity-75 bg-white/20 rounded px-1.5 py-0.5">
												{ALL_CATEGORIES.filter((c) => c.parent === parent).length}
											</span>
										)}
									</Button>
								))}
							</div>
						</div>

													{/* Stats */}
							<div className="flex flex-wrap justify-center gap-4 text-sm mt-8">
								<div className="flex items-center gap-2 bg-card px-6 py-3 rounded-full border border-border/50 shadow-sm">
									<Grid3X3 className="w-4 h-4 text-primary" />
									<span className="font-medium text-foreground">{filteredAndSortedCategories.length} categories</span>
								</div>
								<div className="flex items-center gap-2 bg-card px-6 py-3 rounded-full border border-border/50 shadow-sm">
									<Users className="w-4 h-4 text-primary" />
									<span className="font-medium text-foreground">500K+ Businesses</span>
								</div>
								<div className="flex items-center gap-2 bg-card px-6 py-3 rounded-full border border-border/50 shadow-sm">
									<Star className="w-4 h-4 text-amber-500 fill-amber-500" />
									<span className="font-medium text-foreground">Verified Reviews</span>
								</div>
							</div>
					</div>
				</div>
			</div>

							{/* Controls */}
				<div className="sticky top-[98px] z-10 bg-background/98 backdrop-blur-lg border-b border-border/50 shadow-sm">
					<div className="px-4 py-5 lg:px-24">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<span className="text-sm font-medium text-foreground">
									{filteredAndSortedCategories.length} result{filteredAndSortedCategories.length !== 1 ? "s" : ""}
								</span>
								{selectedParent !== "All Categories" && (
									<Badge variant="secondary" className="hidden sm:flex bg-primary/10 text-primary border-primary/20">
										{selectedParent}
									</Badge>
								)}
							</div>

						<div className="flex flex-wrap items-center gap-3">
							{/* Trending Filter */}
							<Button 
								variant={showTrendingOnly ? "default" : "outline"} 
								size="sm" 
								onClick={() => setShowTrendingOnly(!showTrendingOnly)} 
								className="h-9 px-4 transition-all duration-200"
								aria-pressed={showTrendingOnly}
							>
								<TrendingUp className="w-4 h-4 mr-2" />
								<span className="hidden xs:inline">Trending</span>
							</Button>

							{/* View Mode */}
							<div className="flex border border-border rounded-lg p-1 bg-card">
								<Button 
									variant={viewMode === "grid" ? "default" : "ghost"} 
									size="sm" 
									onClick={() => setViewMode("grid")} 
									className="h-7 px-3 text-xs"
									aria-pressed={viewMode === "grid"}
									aria-label="Grid view"
								>
									<Grid3X3 className="w-4 h-4" />
								</Button>
								<Button 
									variant={viewMode === "list" ? "default" : "ghost"} 
									size="sm" 
									onClick={() => setViewMode("list")} 
									className="h-7 px-3 text-xs"
									aria-pressed={viewMode === "list"}
									aria-label="List view"
								>
									<List className="w-4 h-4" />
								</Button>
							</div>

							{/* Sort */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" className="h-9 px-4 transition-all duration-200">
										<ArrowUpDown className="w-4 h-4 mr-2" />
										<span className="hidden sm:inline">{SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}</span>
										<span className="sm:hidden">Sort</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{SORT_OPTIONS.map((option) => (
										<DropdownMenuItem 
											key={option.value} 
											onClick={() => setSortBy(option.value)}
											className="cursor-pointer"
										>
											{option.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

							{/* Results */}
				<div className="px-4 py-10 lg:px-24">
					{filteredAndSortedCategories.length > 0 ? (
						viewMode === "grid" ? (
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{filteredAndSortedCategories.map((category) => (
									<CategoryCard key={category.slug} category={category} />
								))}
							</div>
						) : (
							<div className="max-w-5xl mx-auto space-y-4">
								{filteredAndSortedCategories.map((category) => (
									<CategoryListItem key={category.slug} category={category} />
								))}
							</div>
						)
				) : (
					<div className="text-center py-20">
						<div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
							<Search className="w-10 h-10 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold text-foreground mb-2">No categories found</h3>
						<p className="text-muted-foreground mb-8 max-w-md mx-auto">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery("");
									setSelectedParent("All Categories");
									setShowTrendingOnly(false);
								}}
							>
								Reset Filters
							</Button>
							<Button asChild>
								<Link href="/categories">Browse Popular Categories</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AllCategoriesPage;

