/**
 * NextGenSearchExperience Component - Airbnb-Style Business Discovery
 * Multi-modal search interface with interactive map, advanced filtering, and real-time results
 * Inspired by Airbnb's maps page but optimized for business discovery
 */

"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Slider } from "@components/ui/slider";
import { 
  Search, Mic, Camera, MapPin, Clock, Star, TrendingUp, Map, List, Grid3X3, 
  Phone, Navigation, Heart, Share2, ArrowRight, Sparkles, Brain, Filter, 
  SlidersHorizontal, X, ChevronDown, ChevronUp, Loader2, RefreshCw,
  DollarSign, Shield, Wifi, Car, CreditCard, Users, Calendar, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessHeader } from "@components/dashboard/business/business-header";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";
import MapContainer from "@components/site/map/map-container";
import { toast } from "@components/ui/use-toast";

// Enhanced search interface component
const SmartSearchBar = ({ searchCapabilities, onSearch, initialQuery = "", placeholder = "What are you looking for?" }) => {
	const [query, setQuery] = useState(initialQuery);
	const [isListening, setIsListening] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef(null);

	// Smart suggestions based on query
	const smartSuggestions = useMemo(
		() => [
			{ type: "popular", text: "Best coffee shops nearby", icon: "☕" },
			{ type: "trending", text: "Trending restaurants", icon: "🔥" },
			{ type: "emergency", text: "Open pharmacies", icon: "🏥" },
			{ type: "services", text: "Auto repair shops", icon: "🔧" },
		],
		[]
	);

	// Voice search functionality
	const handleVoiceSearch = useCallback(() => {
		if (!searchCapabilities.voiceSearch) return;

		if ("webkitSpeechRecognition" in window) {
			const recognition = new window.webkitSpeechRecognition();
			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = "en-US";

			setIsListening(true);
			recognition.start();

			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setQuery(transcript);
				onSearch(transcript);
				setIsListening(false);
			};

			recognition.onerror = () => {
				setIsListening(false);
			};

			recognition.onend = () => {
				setIsListening(false);
			};
		}
	}, [searchCapabilities.voiceSearch, onSearch]);

	// Visual search placeholder
	const handleVisualSearch = useCallback(() => {
		if (!searchCapabilities.visualSearch) return;
		// TODO: Implement visual search functionality
		console.log("Visual search triggered");
	}, [searchCapabilities.visualSearch]);

	return (
		<div className="relative w-full max-w-4xl mx-auto">
			{/* Main search bar with Vercel-style design */}
			<div className="relative">
				<div className="flex items-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 p-2">
					{/* Search icon */}
					<div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
						<Search className="w-5 h-5" />
					</div>

					{/* Search input */}
					<Input
						ref={inputRef}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setShowSuggestions(e.target.value.length > 0);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								onSearch(query);
								setShowSuggestions(false);
							}
						}}
						placeholder={placeholder}
						className="flex-1 mx-4 border-0 bg-transparent text-lg placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
					/>

					{/* Enhanced action buttons */}
					<div className="flex items-center gap-2">
						{/* Voice search */}
						{searchCapabilities.voiceSearch && (
							<Button variant="ghost" size="sm" onClick={handleVoiceSearch} className={`h-10 w-10 rounded-xl transition-all duration-200 ${isListening ? "bg-destructive/10 dark:bg-destructive text-destructive dark:text-destructive animate-pulse" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`} title="Voice Search (Click and speak)">
								<Mic className="w-4 h-4" />
							</Button>
						)}

						{/* Visual search */}
						{searchCapabilities.visualSearch && (
							<Button variant="ghost" size="sm" onClick={handleVisualSearch} className="h-10 w-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200" title="Visual Search (Upload image)">
								<Camera className="w-4 h-4" />
							</Button>
						)}

						{/* AI suggestions indicator */}
						{searchCapabilities.smartSearch && (
							<div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-xl border border-purple-200 dark:border-purple-800">
								<Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								<span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI</span>
							</div>
						)}
					</div>
				</div>

				{/* Smart suggestions dropdown */}
				<AnimatePresence>
					{showSuggestions && (
						<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden z-50">
							<div className="p-4">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="w-4 h-4 text-purple-500" />
									<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Smart Suggestions</span>
								</div>
								<div className="space-y-2">
									{smartSuggestions.map((suggestion, index) => (
										<motion.button
											key={suggestion.text}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											onClick={() => {
												setQuery(suggestion.text);
												onSearch(suggestion.text);
												setShowSuggestions(false);
											}}
											className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 group"
										>
											<span className="text-lg">{suggestion.icon}</span>
											<span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">{suggestion.text}</span>
											<ArrowRight className="w-3 h-3 text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
										</motion.button>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

// Revolutionary business card component
const NextGenBusinessCard = ({ business, onSelect, aiEnhanced = false }) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isFavorited, setIsFavorited] = useState(false);

	return (
		<motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ y: -4 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="group cursor-pointer" onClick={() => onSelect(business)}>
			<Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 bg-white dark:bg-neutral-900">
				<CardContent className="p-0">
					{/* Enhanced image section */}
					<div className="relative h-48 overflow-hidden">
						<img src={business.photos?.[0] || "/api/placeholder/400/200"} alt={business.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

						{/* Gradient overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

						{/* Status badges */}
						<div className="absolute top-4 left-4 flex gap-2">
							{business.isOpenNow && (
								<Badge className="bg-emerald-500 text-white border-0 shadow-lg">
									<Clock className="w-3 h-3 mr-1" />
									Open Now
								</Badge>
							)}
							{business.verified && (
								<Badge className="bg-primary text-white border-0 shadow-lg">
									<Star className="w-3 h-3 mr-1" />
									Verified
								</Badge>
							)}
							{aiEnhanced && (
								<Badge className="bg-purple-500 text-white border-0 shadow-lg">
									<Brain className="w-3 h-3 mr-1" />
									AI Pick
								</Badge>
							)}
						</div>

						{/* Action buttons */}
						<div className="absolute top-4 right-4 flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									setIsFavorited(!isFavorited);
								}}
								className={`h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200 ${isFavorited ? "text-destructive" : "text-white hover:text-destructive"}`}
							>
								<Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									// Share functionality
								}}
								className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:text-primary transition-all duration-200"
							>
								<Share2 className="w-4 h-4" />
							</Button>
						</div>

						{/* Bottom info overlay */}
						<div className="absolute bottom-4 left-4 right-4">
							<div className="flex items-center gap-2 text-white">
								<div className="flex items-center gap-1">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} className={`w-4 h-4 ${i < Math.floor(business.rating) ? "text-warning fill-current" : "text-white/40"}`} />
									))}
								</div>
								<span className="text-sm font-medium">{business.rating}</span>
								<span className="text-sm text-white/80">({business.reviewCount})</span>
							</div>
						</div>
					</div>

					{/* Enhanced content section */}
					<div className="p-6 space-y-4">
						{/* Business name and category */}
						<div>
							<h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">{business.name}</h3>
							<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
								{business.businessType} • {business.priceRange}
							</p>
						</div>

						{/* Location and distance */}
						<div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
							<MapPin className="w-4 h-4 flex-shrink-0" />
							<span className="text-sm truncate flex-1">{business.address}</span>
							{business.distance && <span className="text-sm font-medium text-primary dark:text-primary">{business.distance}</span>}
						</div>

						{/* Enhanced action buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								variant="outline"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									window.open(`tel:${business.phone}`, "_self");
								}}
								className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 text-success dark:text-success/90 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-900"
							>
								<Phone className="w-4 h-4 mr-2" />
								Call
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address)}`, "_blank");
								}}
								className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-primary/30 dark:border-primary text-primary dark:text-primary/90 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900"
							>
								<Navigation className="w-4 h-4 mr-2" />
								Directions
							</Button>
						</div>

						{/* AI insights (if enabled) */}
						{aiEnhanced && business.aiInsights && (
							<div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
								<div className="flex items-center gap-2 mb-2">
									<Sparkles className="w-4 h-4 text-purple-500" />
									<span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Insights</span>
								</div>
								<p className="text-sm text-neutral-600 dark:text-neutral-400">{business.aiInsights}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

// Main NextGenSearchExperience component
const NextGenSearchExperience = ({ searchParams, initialBusinesses, searchMetadata, featureFlags, searchCapabilities }) => {
	const router = useRouter();
	const [businesses, setBusinesses] = useState(initialBusinesses);
	const [currentQuery, setCurrentQuery] = useState(searchParams.q || "");
	const [viewMode, setViewMode] = useState("grid"); // grid, list, map
	const [sortBy, setSortBy] = useState("relevance");
	const [showFilters, setShowFilters] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Handle search
	const handleSearch = useCallback(
		async (query) => {
			if (!query.trim()) return;

			setIsLoading(true);
			setCurrentQuery(query);

			try {
				// Update URL
				const params = new URLSearchParams(searchParams);
				params.set("q", query);
				router.push(`/search?${params.toString()}`);

				// TODO: Implement real-time search API call
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			} catch (error) {
				console.error("Search error:", error);
				setIsLoading(false);
			}
		},
		[searchParams, router]
	);

	// Quick filters for Vercel-style UX
	const quickFilters = [
		{ id: "open", label: "Open Now", icon: Clock, active: false },
		{ id: "verified", label: "Verified", icon: Star, active: false },
		{ id: "trending", label: "Trending", icon: TrendingUp, active: false },
		{ id: "nearby", label: "Nearby", icon: MapPin, active: false },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
			{/* Hero search section */}
			<div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-neutral-200 dark:border-neutral-800">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary) / 0.1),transparent_50%)]" />

				<div className="relative max-w-7xl mx-auto px-4 py-12">
					{/* Smart search bar */}
					<div className="text-center mb-8">
						<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
							Discover Local Businesses
							{featureFlags.aiRecommendations && <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ml-2">with AI</span>}
						</motion.h1>
						<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
							Experience the future of business discovery with intelligent search, real-time insights, and personalized recommendations.
						</motion.p>
					</div>

					<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
						<SmartSearchBar searchCapabilities={searchCapabilities} onSearch={handleSearch} initialQuery={currentQuery} placeholder="What are you looking for? Try 'best pizza near me'" />
					</motion.div>

					{/* Quick filters */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center mt-6">
						<div className="flex gap-3 flex-wrap justify-center">
							{quickFilters.map((filter) => {
								const Icon = filter.icon;
								return (
									<Button key={filter.id} variant={filter.active ? "default" : "outline"} size="sm" className="rounded-full border-neutral-300 dark:border-neutral-700 hover:scale-105 transition-transform duration-200">
										<Icon className="w-4 h-4 mr-2" />
										{filter.label}
									</Button>
								);
							})}
						</div>
					</motion.div>
				</div>
			</div>

			{/* Results section */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Results header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						<h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{isLoading ? "Searching..." : `${searchMetadata.total.toLocaleString()} results`}
							{currentQuery && <span className="text-lg font-normal text-neutral-600 dark:text-neutral-400 ml-2">for "{currentQuery}"</span>}
						</h2>

						{searchMetadata.aiEnhanced && (
							<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
								<Brain className="w-3 h-3 mr-1" />
								AI Enhanced
							</Badge>
						)}
					</div>

					{/* View controls */}
					<div className="flex items-center gap-2">
						<div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1">
							<Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="rounded-md">
								<div className="grid grid-cols-2 gap-0.5 w-4 h-4">
									<div className="bg-current rounded-sm" />
									<div className="bg-current rounded-sm" />
									<div className="bg-current rounded-sm" />
									<div className="bg-current rounded-sm" />
								</div>
							</Button>
							<Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-md">
								<List className="w-4 h-4" />
							</Button>
							<Button variant={viewMode === "map" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("map")} className="rounded-md">
								<Map className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Business results grid */}
				<AnimatePresence mode="wait">
					{isLoading ? (
						<motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl h-80" />
								</div>
							))}
						</motion.div>
					) : (
						<motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{businesses.map((business, index) => (
								<motion.div key={business.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
									<NextGenBusinessCard
										business={business}
										onSelect={(business) => {
											router.push(`/biz/${business.slug}`);
										}}
										aiEnhanced={searchMetadata.aiEnhanced}
									/>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Performance indicator */}
				{process.env.NODE_ENV === "development" && searchMetadata.searchTime && (
					<div className="mt-8 text-center">
						<Badge variant="outline" className="text-xs">
							Search completed in {searchMetadata.searchTime.toFixed(2)}ms
							{searchMetadata.aiEnhanced && " (AI Enhanced)"}
						</Badge>
					</div>
				)}
			</div>
		</div>
	);
};

export default NextGenSearchExperience;
