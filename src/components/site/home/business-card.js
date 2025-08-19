"use client";

import Image from "next/image";
import Link from "next/link";
import { buildBusinessUrl } from "@utils";
import { Star, MapPin } from "react-feather";
import { trackBusinessCardClick } from "@utils/netflix-analytics";

export default function BusinessCard({ business, disabled, sponsored = false }) {
	const slug =
		business.slug ||
		business.name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();

	const rating = parseFloat(business.rating) || 0;

	// Ensure consistent data with fallbacks
	const consistentBusiness = {
		name: business.name || "Business Name",
		category: business.category || "Local Business",
		location: business.location || "Location",
		rating: rating > 0 ? rating.toFixed(1) : "0.0",
		reviewCount: business.reviewCount || 0,
		image: business.image || "/placeholder-business.svg",
		// Add missing location data
		state: business.state || "",
		city: business.city || "",
		country: business.country || "US",
		short_id: business.short_id || business.shortId || "",
	};

	const handleCardClick = () => {
		trackBusinessCardClick(
			business.id,
			consistentBusiness.name,
			consistentBusiness.category,
			"home-section", // This could be passed as a prop
			0 // Position in list, could be passed as a prop
		);
	};

	const urlParams = {
		country: (consistentBusiness.country || "US").toLowerCase(),
		state: consistentBusiness.state,
		city: consistentBusiness.city,
		name: consistentBusiness.name,
		shortId: consistentBusiness.short_id || consistentBusiness.shortId,
	};

	// Validate required parameters before building URL
	const generatedUrl = (urlParams.country && urlParams.state && urlParams.city && urlParams.name) 
		? buildBusinessUrl(urlParams)
		: '/';

	return (
		<div className="group/card relative h-[320px] sm:h-[380px]">
			<Link
				href={generatedUrl}
				className={`block w-full h-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
				onClick={handleCardClick}
				data-business-card="true"
				data-business-id={business.id}
				data-business-name={consistentBusiness.name}
				data-business-category={consistentBusiness.category}
			>
				{/* Enhanced mobile-optimized card */}
				<div className="relative w-full h-full bg-card rounded-2xl overflow-hidden transition-all duration-300 ease-out group-hover/card:bg-accent/5 group-hover/card:shadow-lg group-hover/card:shadow-primary/10 group-hover/card:-translate-y-1 group-active/card:scale-95 border border-border/50 group-hover/card:border-primary/20">
					{/* Business image with mobile-optimized aspect ratio */}
					<div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-muted/30">
						<Image
							className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover/card:scale-105"
							src={consistentBusiness.image}
							alt={consistentBusiness.name}
							width={400}
							height={300}
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							onError={(e) => {
								// Next/Image onError uses currentTarget in React
								if (e?.currentTarget) {
									e.currentTarget.src = "/placeholder-business.svg";
								}
							}}
						/>

						{/* Enhanced rating badge with better mobile touch target */}
						{rating > 0 && (
							<div className="absolute top-3 right-3 opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1.5 px-3 py-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm min-w-[60px] justify-center">
									<Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
									<span className="text-sm font-semibold text-foreground">{consistentBusiness.rating}</span>
								</div>
							</div>
						)}

						{/* Sponsored badge - subtle but clear */}
						{sponsored && (
							<div className="absolute top-3 left-3 opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1 px-2 py-1.5 bg-primary/90 backdrop-blur-sm rounded-lg border border-primary/30 shadow-sm">
									<span className="text-xs font-medium text-primary-foreground">Sponsored</span>
								</div>
							</div>
						)}

						{/* Subtle overlay for better text readability */}
						<div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
					</div>

					{/* Content section with mobile-optimized spacing */}
					<div className="p-4 sm:p-5 space-y-3 flex flex-col justify-between h-full">
						<div className="space-y-3">
							{/* Business name with mobile-optimized typography */}
							<h3 className="font-semibold text-foreground text-base sm:text-lg leading-tight line-clamp-2 group-hover/card:text-primary transition-colors duration-200 h-12 sm:h-10 flex items-start">
								{consistentBusiness.name}
							</h3>

							{/* Category and location with mobile-friendly layout */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-lg text-xs font-medium w-fit">
									{consistentBusiness.category}
								</span>
								{consistentBusiness.location && (
									<div className="flex items-center gap-1.5 text-xs">
										<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
										<span className="truncate">{consistentBusiness.location}</span>
									</div>
								)}
							</div>
						</div>

						{/* Reviews and additional info with better mobile layout */}
						{consistentBusiness.reviewCount > 0 && (
							<div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-1">
								<span className="font-medium">{consistentBusiness.reviewCount} reviews</span>
								{/* Enhanced status indicator */}
								<div className="flex items-center gap-1.5">
									<div className="w-2 h-2 bg-success rounded-full"></div>
									<span className="text-xs font-medium">Verified</span>
								</div>
							</div>
						)}
					</div>

					{/* Enhanced touch feedback */}
					<div className="absolute inset-0 border border-transparent group-hover/card:border-primary/20 group-active/card:border-primary/40 transition-colors duration-300 rounded-2xl pointer-events-none" />
					
					{/* Mobile touch indicator */}
					<div className="absolute inset-0 bg-primary/0 group-active/card:bg-primary/5 transition-colors duration-150 rounded-2xl pointer-events-none" />
				</div>
			</Link>
		</div>
	);
}
