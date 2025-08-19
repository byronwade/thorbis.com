/**
 * GoogleStyleBusinessCard Component
 * Google-style business card for map listings
 * Extracted from large BusinessCardList for better organization
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Star, Phone, Navigation, Globe, MapPin, Clock, Users, Eye } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { buildBusinessUrlFrom } from "@utils";

export const GoogleStyleBusinessCard = ({ business, isActive }) => {
	const [imageError, setImageError] = useState(false);

	const renderStars = (rating) => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/50"}`} />);
	};

	const handleBusinessPageClick = (event) => {
		const target = event.target;
		const isButton = target.closest("button");
		const isLink = target.closest("a");

		if (!isButton && !isLink) {
			try { window.open(buildBusinessUrlFrom(business), "_blank"); }
			catch { window.open(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\\s-]/g,'').replace(/\\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`, "_blank"); }
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

	const handleWebsite = (e) => {
		e.stopPropagation();
		if (business.website) {
			window.open(business.website, "_blank");
		}
	};

	return (
		<Card className={`group cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/10 border border-border/60 rounded-lg overflow-hidden backdrop-blur-sm ${isActive ? "ring-2 ring-primary shadow-lg bg-gradient-to-r from-primary/10 to-primary/5 scale-[1.01]" : "bg-card/80"}`} onClick={handleBusinessPageClick}>
			<CardContent className="p-4">
				{/* Modern Header with Business Info */}
				<div className="flex gap-4">
					{/* Enhanced Business Logo */}
					<div className="relative flex-shrink-0">
						<div className="w-14 h-14 rounded-xl overflow-hidden bg-muted ring-2 ring-border transition-all duration-300 group-hover:ring-primary/30 shadow-sm">
							<Image src={!imageError ? business.image || business.logo || "/placeholder-business.jpg" : "/placeholder-business.jpg"} alt={business.name} width={56} height={56} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setImageError(true)} />
						</div>

						{/* Enhanced Photo Count */}
						{business.photoCount > 0 && (
							<Badge className="absolute -top-1 -right-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-1.5 py-0.5 rounded-full shadow-md border-2 border-background transition-colors min-w-[20px] h-[20px] flex items-center justify-center">
								<Eye className="w-2.5 h-2.5 mr-0.5" />
								{business.photoCount}
							</Badge>
						)}
					</div>

					{/* Business Information */}
					<div className="flex-1 min-w-0">
						{/* Business Name and Status */}
						<div className="flex items-start justify-between">
							<h3 className="font-medium text-foreground text-sm truncate pr-2 group-hover:text-primary transition-colors">{business.name}</h3>

							{/* Status Badges */}
							<div className="flex items-center space-x-1 flex-shrink-0">
								{business.isOpen && (
									<div className="flex items-center text-xs text-primary">
										<div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
										Open
									</div>
								)}
								{business.verified && (
									<Badge variant="secondary" className="bg-primary/20 text-primary text-xs px-1.5 py-0.5">
										Verified
									</Badge>
								)}
								{business.sponsored && (
									<Badge variant="outline" className="bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30 text-xs px-1.5 py-0.5">
										Ad
									</Badge>
								)}
							</div>
						</div>

						{/* Rating and Reviews */}
						<div className="flex items-center space-x-1 mt-1">
							<div className="flex items-center">{renderStars(business.rating)}</div>
							<span className="text-xs text-muted-foreground dark:text-muted-foreground">
								{business.rating} ({business.reviewCount})
							</span>
						</div>

						{/* Location and Distance */}
						<div className="flex items-center text-xs text-muted-foreground dark:text-muted-foreground mt-1">
							<MapPin className="w-3 h-3 mr-1" />
							<span className="truncate">{business.address}</span>
							{business.distance && <span className="ml-2 text-primary dark:text-primary font-medium">• {business.distance}</span>}
						</div>

						{/* Additional Info */}
						<div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
							{business.category && <span>{business.category}</span>}
							{business.priceRange && <span className="text-success dark:text-success font-medium">{business.priceRange}</span>}
							{business.hours && (
								<div className="flex items-center">
									<Clock className="w-3 h-3 mr-1" />
									<span>{business.hours}</span>
								</div>
							)}
							{business.hiredCount && (
								<div className="flex items-center">
									<Users className="w-3 h-3 mr-1" />
									<span>{business.hiredCount} hired</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex space-x-2 mt-3 pt-3 border-t border-border">
					{business.phone && (
						<Button variant="outline" size="sm" onClick={handleCall} className="flex-1 text-xs h-7">
							<Phone className="w-3 h-3 mr-1" />
							Call
						</Button>
					)}
					<Button variant="outline" size="sm" onClick={handleDirections} className="flex-1 text-xs h-7">
						<Navigation className="w-3 h-3 mr-1" />
						Directions
					</Button>
					{business.website && (
						<Button variant="outline" size="sm" onClick={handleWebsite} className="flex-1 text-xs h-7">
							<Globe className="w-3 h-3 mr-1" />
							Website
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
