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
			const slug =
				business.slug ||
				business.name
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, "")
					.replace(/\s+/g, "-")
					.replace(/-+/g, "-")
					.trim();
			if (navigator.share) {
				try {
					await navigator.share({
						title: business.name,
						text: `Check out ${business.name}`,
						url: `${window.location.origin}/biz/${slug}`,
					});
				} catch (err) {
					console.log("Error sharing:", err);
				}
			} else {
				navigator.clipboard.writeText(`${window.location.origin}/biz/${slug}`);
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
			const slug =
				business.slug ||
				business.name
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, "")
					.replace(/\s+/g, "-")
					.replace(/-+/g, "-")
					.trim();
			window.open(`/biz/${slug}`, "_blank");
		};

		const renderStars = (rating) => {
			return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/50"}`} />);
		};

		return (
			<Card
				ref={ref}
				className={`group relative cursor-pointer transition-all duration-200 ease-out ${isMobile ? "rounded-xl" : "rounded-2xl"} overflow-hidden ${isActive ? "ring-2 ring-primary bg-primary/10 shadow-lg" : "bg-card hover:shadow-lg hover:shadow-primary/10"} ${isMobile ? "active:scale-[0.98] shadow-sm" : "hover:scale-[1.01]"} border border-border`}
				onClick={() => handleClick(business)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Compact Card Content */}
				<CardContent className={isMobile ? "p-3" : "p-4"}>
					{/* Top Status Row - More Compact */}
					<div className="flex items-center justify-between mb-2">
						{/* Open Status - More Compact */}
						{business.isOpen && (
							<Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-1.5 py-0.5 rounded text-xs font-medium">
								<div className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse" />
								Open
							</Badge>
						)}

						{/* Trust Badge - Smaller */}
						{business.verified && <Verified className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
					</div>

					{/* Main Content - More Compact Layout */}
					<div className="flex gap-3">
						{/* Business Avatar - Smaller */}
						<div className="relative flex-shrink-0">
							<Avatar className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} border border-gray-200 dark:border-gray-700`}>
								<AvatarImage src={!imageError ? business.image || business.logo : undefined} alt={business.name} onError={() => setImageError(true)} className="object-cover" />
								<AvatarFallback className="bg-blue-600 dark:bg-blue-700 text-white font-medium text-sm">{business.name.charAt(0)}</AvatarFallback>
							</Avatar>
						</div>

						{/* Business Information - More Compact */}
						<div className="flex-1 min-w-0 space-y-1.5">
							{/* Business Name - Smaller */}
							<h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"} text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>{business.name}</h3>

							{/* Category - More Compact */}
							<p className="text-xs text-gray-600 dark:text-gray-400 truncate">
								{business.category}
								{business.priceRange && <span className="ml-1.5 text-gray-400 dark:text-gray-500">• {business.priceRange}</span>}
							</p>

							{/* Rating - Smaller */}
							<div className="flex items-center gap-1.5">
								<div className="flex items-center gap-0.5">{renderStars(business.rating)}</div>
								<span className="text-xs font-medium text-gray-900 dark:text-white">{business.rating}</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">({business.reviewCount.toLocaleString()})</span>
							</div>

							{/* Location - More Compact */}
							<div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
								<MapPin className="w-3 h-3 flex-shrink-0" />
								<span className="truncate flex-1">{business.address}</span>
								{business.distance && <span className="text-blue-600 dark:text-blue-400 font-medium">{business.distance}</span>}
							</div>
						</div>
					</div>

					{/* Action Footer - More Compact */}
					<div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
						{/* Social Proof - More Compact */}
						{(business.responseTime || business.hiredCount) && (
							<div className="flex items-center gap-2 mb-2 text-xs">
								{business.responseTime && (
									<div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 rounded text-green-700 dark:text-green-300">
										<TrendingUp className="w-2.5 h-2.5" />
										<span className="font-medium">Responds {business.responseTime}</span>
									</div>
								)}
								{business.hiredCount && (
									<div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 rounded text-blue-700 dark:text-blue-300">
										<Users className="w-2.5 h-2.5" />
										<span className="font-medium">{business.hiredCount} hired</span>
									</div>
								)}
							</div>
						)}

						{/* Action Buttons - More Compact */}
						<div className="flex gap-2">
							{/* Primary Action - Call - More Compact */}
							<Button variant="outline" size="sm" onClick={handleCall} className={`${isMobile ? "h-8 px-3 flex-1" : "h-7 px-3"} font-medium text-xs border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-400 dark:hover:border-green-600 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200 ${isMobile ? "active:scale-95" : ""}`}>
								<Phone className="w-3 h-3 mr-1.5" />
								Call
							</Button>

							{/* Secondary Action - Directions - More Compact */}
							<Button variant="outline" size="sm" onClick={handleDirections} className={`${isMobile ? "h-8 px-3 flex-1" : "h-7 px-3"} font-medium text-xs border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 ${isMobile ? "active:scale-95" : ""}`}>
								<Navigation className="w-3 h-3 mr-1.5" />
								{isMobile ? "Dir" : "Dirs"}
							</Button>

							{/* Tertiary Action - More - More Compact */}
							<Button variant="ghost" size="sm" onClick={handleViewDetails} className={`${isMobile ? "h-8 w-8" : "h-7 w-7"} p-0 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 ${isMobile ? "active:scale-95" : ""}`}>
								<ExternalLink className="w-3 h-3" />
							</Button>
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
