/**
 * Personalized Hero Section
 * Dynamic hero content that adapts to user behavior and preferences
 * Amazon-style intelligent content personalization
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, TrendingUp, Star, Users, Clock } from "lucide-react";
import { cn } from "@utils";
import logger from "@lib/utils/logger";

export default function PersonalizedHeroSection({ section, onInteraction, isPersonalized = false, personalizationScore = 0, userId, sessionId, className = "", ...props }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [backgroundLoaded, setBackgroundLoaded] = useState(false);

	// Extract content from section
	const {
		title = "Discover Local Businesses",
		subtitle = "Find the best places near you",
		searchPlaceholder = "Search for businesses...",
		backgroundCategory = "general",
		cta = {
			primary: "Start Exploring",
			secondary: "Browse Categories",
		},
	} = section?.content || {};

	/**
	 * Background image mapping based on business categories
	 */
	const backgroundImages = {
		restaurants: ["/images/hero/restaurant-1.jpg", "/images/hero/restaurant-2.jpg", "/images/hero/restaurant-3.jpg"],
		retail: ["/images/hero/retail-1.jpg", "/images/hero/retail-2.jpg", "/images/hero/retail-3.jpg"],
		services: ["/images/hero/services-1.jpg", "/images/hero/services-2.jpg", "/images/hero/services-3.jpg"],
		general: ["/images/hero/general-1.jpg", "/images/hero/general-2.jpg", "/images/hero/general-3.jpg"],
	};

	/**
	 * Dynamic background based on personalization
	 */
	const backgroundImage = useMemo(() => {
		const images = backgroundImages[backgroundCategory] || backgroundImages.general;
		// Use personalization score to select specific image
		const index = Math.floor(personalizationScore * images.length) || 0;
		return images[index] || images[0];
	}, [backgroundCategory, personalizationScore]);

	/**
	 * Handle search submission
	 */
	const handleSearch = (e) => {
		e.preventDefault();

		if (!searchQuery.trim()) return;

		// Track search interaction
		onInteraction("search", {
			query: searchQuery,
			source: "hero_section",
			isPersonalized,
			personalizationScore,
		});

		// Log search for analytics
		logger.businessMetrics("hero_search_performed", {
			query: searchQuery,
			isPersonalized,
			personalizationScore,
			userId,
			sessionId,
		});

		// Navigate to search results (implement based on your routing)
		window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
	};

	/**
	 * Handle CTA clicks
	 */
	const handleCtaClick = (ctaType) => {
		onInteraction("cta_click", {
			type: ctaType,
			source: "hero_section",
			isPersonalized,
			personalizationScore,
		});

		logger.businessMetrics("hero_cta_clicked", {
			ctaType,
			isPersonalized,
			personalizationScore,
			userId,
			sessionId,
		});

		// Navigate based on CTA type
		if (ctaType === "primary") {
			window.location.href = "/explore";
		} else if (ctaType === "secondary") {
			window.location.href = "/categories";
		}
	};

	/**
	 * Handle input focus for engagement tracking
	 */
	const handleSearchFocus = () => {
		setIsSearchFocused(true);
		onInteraction("search_focus", {
			source: "hero_section",
			isPersonalized,
			personalizationScore,
		});
	};

	/**
	 * Quick search suggestions based on personalization
	 */
	const quickSearches = useMemo(() => {
		if (!isPersonalized || personalizationScore < 0.3) {
			return ["Restaurants", "Coffee Shops", "Shopping", "Services"];
		}

		// Personalized quick searches based on background category
		const categorySearches = {
			restaurants: ["Italian Restaurants", "Sushi", "Pizza", "Brunch Spots"],
			retail: ["Clothing Stores", "Boutiques", "Electronics", "Home Goods"],
			services: ["Hair Salons", "Spas", "Gyms", "Auto Repair"],
			general: ["Popular Places", "Highly Rated", "New Businesses", "Local Favorites"],
		};

		return categorySearches[backgroundCategory] || categorySearches.general;
	}, [isPersonalized, personalizationScore, backgroundCategory]);

	/**
	 * Personalization indicator badges
	 */
	const PersonalizationBadges = () => {
		if (!isPersonalized || personalizationScore < 0.5) return null;

		return (
			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap gap-2 justify-center mt-6">
				<div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
					<TrendingUp className="w-4 h-4 mr-1" />
					Personalized for you
				</div>
				<div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
					<Star className="w-4 h-4 mr-1" />
					{Math.round(personalizationScore * 100)}% match
				</div>
			</motion.div>
		);
	};

	/**
	 * Dynamic stats based on personalization
	 */
	const DynamicStats = () => {
		const stats = useMemo(() => {
			if (backgroundCategory === "restaurants") {
				return [
					{ icon: Users, label: "Restaurants", value: "2,500+" },
					{ icon: Star, label: "Average Rating", value: "4.6" },
					{ icon: Clock, label: "New Reviews", value: "Daily" },
				];
			} else if (backgroundCategory === "retail") {
				return [
					{ icon: Users, label: "Stores", value: "1,800+" },
					{ icon: Star, label: "Verified", value: "95%" },
					{ icon: Clock, label: "Updated", value: "Hourly" },
				];
			} else if (backgroundCategory === "services") {
				return [
					{ icon: Users, label: "Service Providers", value: "1,200+" },
					{ icon: Star, label: "Professional", value: "100%" },
					{ icon: Clock, label: "Response Time", value: "<1hr" },
				];
			}

			return [
				{ icon: Users, label: "Businesses", value: "5,000+" },
				{ icon: Star, label: "Reviews", value: "50k+" },
				{ icon: Clock, label: "Updated", value: "Real-time" },
			];
		}, [backgroundCategory]);

		return (
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto">
				{stats.map((stat, index) => (
					<div key={index} className="text-center text-white">
						<stat.icon className="w-6 h-6 mx-auto mb-2 opacity-80" />
						<div className="text-2xl font-bold">{stat.value}</div>
						<div className="text-sm opacity-80">{stat.label}</div>
					</div>
				))}
			</motion.div>
		);
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	return (
		<section className={cn("relative min-h-screen flex items-center justify-center", "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800", "overflow-hidden", className)} {...props}>
			{/* Dynamic Background Image */}
			<div className="absolute inset-0 z-0">
				<img src={backgroundImage} alt={`${backgroundCategory} businesses`} className={cn("w-full h-full object-cover transition-opacity duration-1000", backgroundLoaded ? "opacity-30" : "opacity-0")} onLoad={() => setBackgroundLoaded(true)} />
				<div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
			</div>

			{/* Content */}
			<motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				{/* Main Heading */}
				<motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
					{title}
				</motion.h1>

				{/* Subtitle */}
				<motion.p variants={itemVariants} className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
					{subtitle}
				</motion.p>

				{/* Search Form */}
				<motion.form variants={itemVariants} onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-muted-foreground" />
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={handleSearchFocus}
							onBlur={() => setIsSearchFocused(false)}
							placeholder={searchPlaceholder}
							className={cn("block w-full pl-12 pr-4 py-4 text-lg", "bg-white/95 backdrop-blur-sm", "border-0 rounded-2xl", "placeholder-gray-500 text-foreground", "focus:outline-none focus:ring-4 focus:ring-white/30", "transition-all duration-300", isSearchFocused && "bg-white shadow-2xl scale-105")}
						/>
						<div className="absolute inset-y-0 right-0 pr-2 flex items-center">
							<button type="submit" disabled={!searchQuery.trim()} className={cn("px-6 py-2 rounded-xl", "bg-primary hover:bg-primary", "text-white font-medium", "transition-all duration-300", "disabled:opacity-50 disabled:cursor-not-allowed", "focus:outline-none focus:ring-2 focus:ring-blue-500")}>
								Search
							</button>
						</div>
					</div>
				</motion.form>

				{/* Quick Search Tags */}
				<motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-8">
					{quickSearches.map((search, index) => (
						<button
							key={search}
							onClick={() => {
								setSearchQuery(search);
								onInteraction("quick_search", {
									query: search,
									isPersonalized,
									personalizationScore,
								});
							}}
							className={cn("px-4 py-2 text-sm font-medium", "bg-white/20 hover:bg-white/30", "text-white border border-white/30", "rounded-full transition-all duration-300", "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50")}
						>
							{search}
						</button>
					))}
				</motion.div>

				{/* CTA Buttons */}
				<motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
					<button onClick={() => handleCtaClick("primary")} className={cn("px-8 py-4 text-lg font-semibold", "bg-white text-primary", "rounded-2xl transition-all duration-300", "hover:bg-muted hover:scale-105", "focus:outline-none focus:ring-4 focus:ring-white/30", "shadow-xl")}>
						{cta.primary}
					</button>
					<button onClick={() => handleCtaClick("secondary")} className={cn("px-8 py-4 text-lg font-semibold", "bg-transparent text-white", "border-2 border-white/50", "rounded-2xl transition-all duration-300", "hover:bg-white/10 hover:scale-105", "focus:outline-none focus:ring-4 focus:ring-white/30")}>
						{cta.secondary}
					</button>
				</motion.div>

				{/* Personalization Badges */}
				<PersonalizationBadges />

				{/* Dynamic Stats */}
				<DynamicStats />
			</motion.div>

			{/* Location indicator */}
			<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="absolute bottom-8 left-8 flex items-center text-white/80">
				<MapPin className="w-4 h-4 mr-2" />
				<span className="text-sm">{section?.content?.locationName || "Detecting location..."}</span>
			</motion.div>

			{/* Scroll indicator */}
			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, repeat: Infinity, repeatType: "reverse", duration: 1.5 }} className="absolute bottom-8 right-8">
				<div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
					<div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
				</div>
			</motion.div>

			{/* Performance indicator for development */}
			{process.env.NODE_ENV === "development" && isPersonalized && <div className="absolute top-4 right-4 bg-success text-white px-2 py-1 rounded text-xs">Personalized Hero ({Math.round(personalizationScore * 100)}%)</div>}
		</section>
	);
}
