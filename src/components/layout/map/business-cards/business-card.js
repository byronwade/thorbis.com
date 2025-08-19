/**
 * BusinessCard Component
 * Individual business card for map listings
 * Extracted from large BusinessCardList for better organization
 */

"use client";

import React, { memo, forwardRef, useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Star, Phone, MapPin, Navigation, ExternalLink, Share2, Eye, Users, Verified, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { buildBusinessUrlFrom } from "@utils";

export const BusinessCard = memo(
	forwardRef(({ business, isActive, handleClick, isLoading, onHover, onLeave }, ref) => {
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
			try { window.open(buildBusinessUrlFrom(business), "_blank"); }
			catch { window.open(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\\s-]/g,'').replace(/\\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`, "_blank"); }
		};

		const renderStars = (rating) => {
			return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />);
		};

		return (
			<Card ref={ref} className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 ${isActive ? "border-l-blue-500 bg-blue-50/30 shadow-lg ring-2 ring-blue-200" : "border-l-transparent"} ${isHovered ? "shadow-md" : ""}`} onClick={() => handleClick(business)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
				{/* Modern Card Container */}
				<CardContent className="p-4">
					{/* Status Header Bar */}
					<div className="flex items-center justify-between mb-3">
						{/* Availability Status */}
						<div className="flex items-center space-x-2">
							{business.isOpen && (
								<Badge variant="secondary" className="bg-success/10 text-success text-xs">
									Open
								</Badge>
							)}
						</div>

						{/* Trust Badges */}
						<div className="flex items-center space-x-1">
							{business.verified && (
								<Tooltip>
									<TooltipTrigger>
										<Verified className="w-4 h-4 text-primary" />
									</TooltipTrigger>
									<TooltipContent>Verified Business</TooltipContent>
								</Tooltip>
							)}
						</div>

						{/* Sponsored Badge */}
						{business.sponsored && (
							<Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
								<Zap className="w-3 h-3 mr-1" />
								Featured
							</Badge>
						)}
					</div>

					{/* Main Content */}
					<div className="flex space-x-4">
						{/* Business Avatar */}
						<div className="relative flex-shrink-0">
							<Avatar className="w-16 h-16 border-2 border-white shadow-sm">
								<AvatarImage src={!imageError ? business.image || business.logo : undefined} alt={business.name} onError={() => setImageError(true)} />
								<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">{business.name.charAt(0)}</AvatarFallback>
							</Avatar>

							{/* Photo Count Badge */}
							{business.photoCount > 0 && (
								<Badge className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
									<Eye className="w-3 h-3 mr-1" />
									{business.photoCount}
								</Badge>
							)}
						</div>

						{/* Business Information */}
						<div className="flex-1 min-w-0">
							{/* Business Name */}
							<h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">{business.name}</h3>

							{/* Category & Price */}
							<div className="flex items-center space-x-2 mb-2">
								<span className="text-sm text-muted-foreground">{business.category}</span>
								{business.priceRange && <span className="text-sm text-success font-medium">{business.priceRange}</span>}
							</div>

							{/* Rating & Reviews */}
							<div className="flex items-center space-x-2 mb-2">
								<div className="flex items-center">{renderStars(business.rating)}</div>
								<span className="text-sm text-muted-foreground">
									{business.rating} ({business.reviewCount} reviews)
								</span>
							</div>

							{/* Location */}
							<div className="flex items-center text-sm text-muted-foreground mb-3">
								<MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
								<span className="truncate">{business.address}</span>
								{business.distance && <span className="ml-2 text-primary font-medium">{business.distance}</span>}
							</div>
						</div>
					</div>

					{/* Action Footer */}
					<div className="flex items-center justify-between pt-3 border-t border-border">
						{/* Action Buttons */}
						<div className="flex space-x-2">
							<Button variant="outline" size="sm" onClick={handleCall} className="text-xs">
								<Phone className="w-3 h-3 mr-1" />
								Call
							</Button>
							<Button variant="outline" size="sm" onClick={handleDirections} className="text-xs">
								<Navigation className="w-3 h-3 mr-1" />
								Directions
							</Button>
						</div>

						{/* Social Proof Indicators */}
						<div className="flex items-center space-x-3 text-xs text-muted-foreground">
							{business.responseTime && (
								<div className="flex items-center">
									<TrendingUp className="w-3 h-3 mr-1" />
									<span>Responds in {business.responseTime}</span>
								</div>
							)}
							{business.hiredCount && (
								<div className="flex items-center">
									<Users className="w-3 h-3 mr-1" />
									<span>{business.hiredCount} hired</span>
								</div>
							)}
						</div>

						{/* Secondary Actions */}
						<div className="flex space-x-1">
							<Button variant="ghost" size="sm" onClick={handleShare} className="p-1">
								<Share2 className="w-3 h-3" />
							</Button>
							<Button variant="ghost" size="sm" onClick={handleViewDetails} className="p-1">
								<ExternalLink className="w-3 h-3" />
							</Button>
						</div>
					</div>

					{/* Active State Indicator */}
					{isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l"></div>}
				</CardContent>
			</Card>
		);
	})
);

BusinessCard.displayName = "BusinessCard";
