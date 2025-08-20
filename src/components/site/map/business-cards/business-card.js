/**
 * BusinessCard Component
 * Individual business card for map listings
 * Extracted from large BusinessCardList for better organization
 */

"use client";

import React, { memo, forwardRef, useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Star, Phone, MapPin, Navigation, ExternalLink, Users, Verified, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { buildBusinessUrlFrom } from "@utils";

export const BusinessCard = memo(
	forwardRef(({ business, isActive, handleClick, isLoading, onHover, onLeave, isMobile = false }, ref) => {
		const [isHovered, setIsHovered] = useState(false);
		const [isFavorited, setIsFavorited] = useState(false);
		const [imageError, setImageError] = useState(false);

		const handleMouseEnter = () => {
			setIsHovered(true);
			onHover?.(business);
		};

		const handleMouseLeave = () => {
			setIsHovered(false);
			onLeave?.(business);
		};

		const handleShare = async (e) => {
			e.stopPropagation();
			let urlPath;
			try { urlPath = buildBusinessUrlFrom(business); }
			catch { urlPath = `/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`; }
			if (navigator.share) {
				try {
					await navigator.share({
						title: business.name,
						text: `Check out ${business.name}`,
						url: `${window.location.origin}${urlPath}`,
					});
				} catch (err) {
					console.log("Error sharing:", err);
				}
			} else {
				navigator.clipboard.writeText(`${window.location.origin}${urlPath}`);
			}
		};

		const handleCall = (e) => {
			e.stopPropagation();
			if (business.phone) {
				window.open(`tel:${business.phone}`, "_self");
			}
		};

		const handleDirections = (e) => {
			e.stopPropagation();
			if (business.coordinates) {
				const { lat, lng } = business.coordinates;
				window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
			}
		};

		const handleViewDetails = (e) => {
			e.stopPropagation();
			try { window.open(buildBusinessUrlFrom(business), "_blank"); }
			catch { window.open(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`, "_blank"); }
		};

		const renderStars = (rating) => {
			return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/50"}`} />);
		};

		// Generate a consistent background color based on business name
		const getBusinessColor = (businessName) => {
			const colors = [
				'bg-slate-600', // Dark gray
				'bg-neutral-600', // Neutral gray
				'bg-zinc-600', // Zinc gray
				'bg-stone-600', // Stone gray
				'bg-gray-600', // Gray
			];
			const index = businessName.length % colors.length;
			return colors[index];
		};

		const businessColor = getBusinessColor(business.name);

		return (
			<Card
				ref={ref}
				className={`group relative cursor-pointer transition-all duration-200 ease-out ${isMobile ? "rounded-xl" : "rounded-2xl"} overflow-hidden ${isActive ? "ring-2 ring-primary bg-primary/10 shadow-lg" : "bg-card hover:shadow-lg hover:shadow-primary/10"} ${isMobile ? "active:scale-[0.98] shadow-sm" : "hover:scale-[1.01]"} border border-border`}
				onClick={() => handleClick(business)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Enhanced Card with Image-First Design */}
				<CardContent className="p-0">
					{/* Main Image Area (70-75% of height) */}
					<div className="relative h-[75%] overflow-hidden">
						{/* Background Image or Color */}
						{business.image || business.logo ? (
							<img
								src={!imageError ? business.image || business.logo : undefined}
								alt={business.name}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
								onError={() => setImageError(true)}
							/>
						) : (
							/* Solid color background when no image */
							<div className={`w-full h-full ${businessColor} flex items-center justify-center`}>
								<div className="text-white/80 text-4xl font-bold">
									{business.name.charAt(0).toUpperCase()}
								</div>
							</div>
						)}

						{/* Status Badges - Top Left */}
						<div className="absolute top-3 left-3 flex gap-2">
							{business.isOpen && (
								<Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-1.5 py-0.5 rounded text-xs font-medium">
									<div className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse" />
									Open
								</Badge>
							)}
							{business.verified && <Verified className="w-3.5 h-3.5 text-primary dark:text-primary" />}
						</div>

						{/* Rating Badge - Top Right */}
						{business.rating > 0 && (
							<div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1.5 px-3 py-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm min-w-[60px] justify-center">
									<Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
									<span className="text-sm font-semibold text-foreground">{business.rating}</span>
								</div>
							</div>
						)}

						{/* Price Range - Top Right (if rating not shown) */}
						{!business.rating && business.priceRange && (
							<div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
								<div className="px-2 py-1 bg-background/95 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
									<span className="text-sm font-medium text-foreground">{business.priceRange}</span>
								</div>
							</div>
						)}
					</div>

					{/* Dark Overlay Section (25-30% of height) */}
					<div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-black/80 via-black/60 to-transparent">
						<div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
							{/* Business Name - Large and Bold */}
							<h3 className={`font-bold text-white ${isMobile ? "text-base" : "text-lg"} leading-tight line-clamp-1 group-hover:text-primary transition-colors`}>
								{business.name}
							</h3>

							{/* Category and Location Row */}
							<div className="flex items-center justify-between text-sm">
								{/* Category */}
								<span className="text-white/90 font-medium">
									{business.category}
									{business.priceRange && <span className="ml-2 text-white/70">• {business.priceRange}</span>}
								</span>

								{/* Location with Distance */}
								{business.address && (
									<div className="flex items-center gap-1.5 text-white/80">
										<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
										<span className="text-xs truncate max-w-[120px]">
											{business.address}
											{business.distance && <span className="ml-1 text-primary">• {business.distance}</span>}
										</span>
									</div>
								)}
							</div>

							{/* Reviews and Action Buttons Row */}
							<div className="flex items-center justify-between text-xs">
								{business.reviewCount > 0 && (
									<span className="text-white/70 font-medium">{business.reviewCount} reviews</span>
								)}

								{/* Action Buttons - Compact */}
								<div className="flex gap-1">
									<Button 
										variant="outline" 
										size="sm" 
										onClick={handleCall} 
										className={`${isMobile ? "h-6 px-2" : "h-7 px-2"} font-medium text-xs border-white/20 hover:bg-white/10 hover:border-white/30 text-white/90 transition-all duration-200`}
									>
										<Phone className="w-3 h-3" />
									</Button>

									<Button 
										variant="outline" 
										size="sm" 
										onClick={handleDirections} 
										className={`${isMobile ? "h-6 px-2" : "h-7 px-2"} font-medium text-xs border-white/20 hover:bg-white/10 hover:border-white/30 text-white/90 transition-all duration-200`}
									>
										<Navigation className="w-3 h-3" />
									</Button>

									<Button 
										variant="outline" 
										size="sm" 
										onClick={handleViewDetails} 
										className={`${isMobile ? "h-6 w-6" : "h-7 w-7"} p-0 border-white/20 hover:bg-white/10 hover:border-white/30 text-white/90 transition-all duration-200`}
									>
										<ExternalLink className="w-3 h-3" />
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Modern Active State Indicator */}
					{isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 rounded-l shadow-lg"></div>}
				</CardContent>
			</Card>
		);
	})
);

BusinessCard.displayName = "BusinessCard";
