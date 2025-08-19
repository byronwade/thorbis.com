/**
 * Featured Businesses Section
 * Personalized business recommendations based on user behavior
 * Displays businesses tailored to user preferences and search history
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Phone, ExternalLink, Heart, Share2, Clock, Users } from "lucide-react";
import { cn } from "@utils";
import logger from "@lib/utils/logger";

export default function FeaturedBusinessesSection({ section, onInteraction, isPersonalized = false, personalizationScore = 0, userId, sessionId, className = "", ...props }) {
	const [favorites, setFavorites] = useState(new Set());
	const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
	const [hoveredBusiness, setHoveredBusiness] = useState(null);

	// Extract data from section
	const { title = "Featured Businesses", subtitle = "Discover top-rated local businesses", items = [], layout = "grid" } = section?.content || {};

	/**
	 * Handle business card click
	 */
	const handleBusinessClick = (business) => {
		onInteraction("business_click", {
			businessId: business.id,
			businessName: business.name,
			source: "featured_section",
			isPersonalized,
			personalizationScore,
			position: items.findIndex((item) => item.id === business.id),
		});

		logger.businessMetrics("featured_business_clicked", {
			businessId: business.id,
			businessName: business.name,
			isPersonalized,
			personalizationScore,
			userId,
			sessionId,
		});

		// Navigate to business page
		window.location.href = `/business/${business.id}`;
	};

	/**
	 * Handle favorite toggle
	 */
	const handleFavoriteToggle = (e, business) => {
		e.stopPropagation();

		const newFavorites = new Set(favorites);
		if (favorites.has(business.id)) {
			newFavorites.delete(business.id);
		} else {
			newFavorites.add(business.id);
		}
		setFavorites(newFavorites);

		onInteraction("favorite_toggle", {
			businessId: business.id,
			action: favorites.has(business.id) ? "remove" : "add",
			source: "featured_section",
		});

		logger.businessMetrics("business_favorited", {
			businessId: business.id,
			action: favorites.has(business.id) ? "remove" : "add",
			isPersonalized,
			userId,
			sessionId,
		});
	};

	/**
	 * Handle quick actions (call, directions, etc.)
	 */
	const handleQuickAction = (e, action, business) => {
		e.stopPropagation();

		onInteraction("quick_action", {
			action,
			businessId: business.id,
			source: "featured_section",
		});

		logger.businessMetrics("quick_action_used", {
			action,
			businessId: business.id,
			isPersonalized,
			userId,
			sessionId,
		});

		switch (action) {
			case "call":
				if (business.phone) {
					window.location.href = `tel:${business.phone}`;
				}
				break;
			case "directions":
				const address = encodeURIComponent(business.address || "");
				window.open(`https://maps.google.com/?q=${address}`, "_blank");
				break;
			case "website":
				if (business.website) {
					window.open(business.website, "_blank");
				}
				break;
			case "share":
				if (navigator.share) {
					navigator.share({
						title: business.name,
						text: business.description,
						url: `/business/${business.id}`,
					});
				}
				break;
		}
	};

	/**
	 * Render business rating stars
	 */
	const renderRating = (rating, reviewCount) => (
		<div className="flex items-center gap-1">
			<div className="flex">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star key={star} className={cn("w-4 h-4", star <= rating ? "text-warning fill-current" : "text-muted-foreground")} />
				))}
			</div>
			<span className="text-sm text-muted-foreground ml-1">
				{rating} ({reviewCount} reviews)
			</span>
		</div>
	);

	/**
	 * Render business card in grid layout
	 */
	const renderBusinessCardGrid = (business, index) => (
		<motion.div key={business.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} onHoverStart={() => setHoveredBusiness(business.id)} onHoverEnd={() => setHoveredBusiness(null)} onClick={() => handleBusinessClick(business)} className={cn("bg-white rounded-2xl shadow-lg hover:shadow-xl", "transition-all duration-300 cursor-pointer", "overflow-hidden group relative")}>
			{/* Image */}
			<div className="relative h-48 bg-muted">
				{business.primary_image ? (
					<img src={business.primary_image} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
				) : (
					<div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
						<span className="text-4xl text-muted-foreground">{business.name?.charAt(0)}</span>
					</div>
				)}

				{/* Favorite button */}
				<button onClick={(e) => handleFavoriteToggle(e, business)} className={cn("absolute top-3 right-3 p-2 rounded-full", "bg-white/90 backdrop-blur-sm shadow-lg", "transition-all duration-300", "hover:scale-110", favorites.has(business.id) ? "text-destructive" : "text-muted-foreground")}>
					<Heart className={cn("w-5 h-5", favorites.has(business.id) && "fill-current")} />
				</button>

				{/* Personalization indicator */}
				{isPersonalized && personalizationScore > 0.5 && <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">Recommended</div>}
			</div>

			{/* Content */}
			<div className="p-6">
				{/* Business name and category */}
				<div className="mb-3">
					<h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{business.name}</h3>
					{business.business_categories?.[0]?.category && <p className="text-sm text-primary font-medium">{business.business_categories[0].category.name}</p>}
				</div>

				{/* Rating */}
				<div className="mb-3">{renderRating(business.rating || 0, business.review_count || 0)}</div>

				{/* Description */}
				{business.description && <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{business.description}</p>}

				{/* Location */}
				{business.address && (
					<div className="flex items-center text-muted-foreground text-sm mb-4">
						<MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
						<span className="truncate">{business.address}</span>
					</div>
				)}

				{/* Quick actions */}
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						{business.phone && (
							<button onClick={(e) => handleQuickAction(e, "call", business)} className="p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Call">
								<Phone className="w-4 h-4" />
							</button>
						)}
						<button onClick={(e) => handleQuickAction(e, "directions", business)} className="p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Directions">
							<MapPin className="w-4 h-4" />
						</button>
						{business.website && (
							<button onClick={(e) => handleQuickAction(e, "website", business)} className="p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Website">
								<ExternalLink className="w-4 h-4" />
							</button>
						)}
						<button onClick={(e) => handleQuickAction(e, "share", business)} className="p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Share">
							<Share2 className="w-4 h-4" />
						</button>
					</div>

					{/* Business hours indicator */}
					<div className="flex items-center text-xs text-success">
						<Clock className="w-3 h-3 mr-1" />
						<span>Open</span>
					</div>
				</div>
			</div>

			{/* Hover overlay for additional info */}
			<AnimatePresence>
				{hoveredBusiness === business.id && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 flex items-center justify-center">
						<motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="text-white text-center">
							<p className="text-lg font-semibold mb-2">View Details</p>
							<p className="text-sm opacity-90">Click to see more information</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);

	/**
	 * Render business card in list layout
	 */
	const renderBusinessCardList = (business, index) => (
		<motion.div key={business.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={() => handleBusinessClick(business)} className={cn("bg-white rounded-xl shadow-md hover:shadow-lg", "transition-all duration-300 cursor-pointer", "overflow-hidden flex p-4 gap-4")}>
			{/* Image */}
			<div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0">
				{business.primary_image ? (
					<img src={business.primary_image} alt={business.name} className="w-full h-full object-cover rounded-lg" loading="lazy" />
				) : (
					<div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg flex items-center justify-center">
						<span className="text-xl text-muted-foreground">{business.name?.charAt(0)}</span>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between mb-2">
					<div>
						<h3 className="text-lg font-semibold text-foreground truncate">{business.name}</h3>
						{business.business_categories?.[0]?.category && <p className="text-sm text-primary font-medium">{business.business_categories[0].category.name}</p>}
					</div>
					<button onClick={(e) => handleFavoriteToggle(e, business)} className={cn("p-1 rounded-full transition-colors", favorites.has(business.id) ? "text-destructive" : "text-muted-foreground")}>
						<Heart className={cn("w-5 h-5", favorites.has(business.id) && "fill-current")} />
					</button>
				</div>

				{/* Rating */}
				<div className="mb-2">{renderRating(business.rating || 0, business.review_count || 0)}</div>

				{/* Address */}
				{business.address && <p className="text-muted-foreground text-sm truncate mb-2">{business.address}</p>}

				{/* Quick actions */}
				<div className="flex gap-2">
					{business.phone && (
						<button onClick={(e) => handleQuickAction(e, "call", business)} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
							Call
						</button>
					)}
					<button onClick={(e) => handleQuickAction(e, "directions", business)} className="text-xs bg-gray-50 text-muted-foreground px-3 py-1 rounded-full hover:bg-muted transition-colors">
						Directions
					</button>
				</div>
			</div>
		</motion.div>
	);

	if (!items || items.length === 0) {
		return null;
	}

	return (
		<section className={cn("py-16 bg-gray-50", className)} {...props}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						{title}
						{isPersonalized && personalizationScore > 0.3 && (
							<span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
								<Users className="w-4 h-4 mr-1" />
								Personalized
							</span>
						)}
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">{subtitle}</p>
				</motion.div>

				{/* Layout toggle */}
				<div className="flex justify-center mb-8">
					<div className="bg-white rounded-lg p-1 shadow-sm">
						<button onClick={() => setViewMode("grid")} className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-muted-foreground")}>
							Grid View
						</button>
						<button onClick={() => setViewMode("list")} className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-muted-foreground")}>
							List View
						</button>
					</div>
				</div>

				{/* Businesses Grid/List */}
				<div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4")}>{items.map((business, index) => (viewMode === "grid" ? renderBusinessCardGrid(business, index) : renderBusinessCardList(business, index)))}</div>

				{/* View more button */}
				{items.length >= 8 && (
					<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
						<button
							onClick={() => {
								onInteraction("view_more", { source: "featured_section" });
								window.location.href = "/businesses";
							}}
							className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary transition-colors shadow-lg hover:shadow-xl"
						>
							View All Businesses
							<ExternalLink className="w-5 h-5 ml-2" />
						</button>
					</motion.div>
				)}
			</div>
		</section>
	);
}
