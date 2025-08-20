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
		image: business.image || business.logo || null,
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

	const businessColor = getBusinessColor(consistentBusiness.name);

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
				{/* Enhanced card with image-first design */}
				<div className="relative w-full h-full bg-card rounded-2xl overflow-hidden transition-all duration-300 ease-out group-hover/card:shadow-lg group-hover/card:shadow-primary/10 group-hover/card:-translate-y-1 group-active/card:scale-95 border border-border/50 group-hover/card:border-primary/20">
					
					{/* Main Image Area (70-75% of height) */}
					<div className="relative h-[75%] overflow-hidden">
						{/* Background Image or Color */}
						{consistentBusiness.image ? (
							<Image
								className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover/card:scale-105"
								src={consistentBusiness.image}
								alt={consistentBusiness.name}
								width={400}
								height={300}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								onError={(e) => {
									// Fallback to color background if image fails
									if (e?.currentTarget) {
										e.currentTarget.style.display = "none";
										e.currentTarget.parentElement.classList.add(businessColor);
									}
								}}
							/>
						) : (
							/* Solid color background when no image */
							<div className={`w-full h-full ${businessColor} flex items-center justify-center`}>
								<div className="text-white/80 text-6xl font-bold">
									{consistentBusiness.name.charAt(0).toUpperCase()}
								</div>
							</div>
						)}

						{/* Rating Badge - Top Right */}
						{rating > 0 && (
							<div className="absolute top-3 right-3 opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1.5 px-3 py-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm min-w-[60px] justify-center">
									<Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
									<span className="text-sm font-semibold text-foreground">{consistentBusiness.rating}</span>
								</div>
							</div>
						)}

						{/* Sponsored Badge - Top Left */}
						{sponsored && (
							<div className="absolute top-3 left-3 opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1 px-2 py-1.5 bg-primary/90 backdrop-blur-sm rounded-lg border border-primary/30 shadow-sm">
									<span className="text-xs font-medium text-primary-foreground">Sponsored</span>
								</div>
							</div>
						)}

						{/* Price Range - Top Right (if rating not shown) */}
						{!rating && business.priceRange && (
							<div className="absolute top-3 right-3 opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
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
							<h3 className="font-bold text-white text-lg sm:text-xl leading-tight line-clamp-1 group-hover/card:text-primary transition-colors duration-200">
								{consistentBusiness.name}
							</h3>

							{/* Category and Location Row */}
							<div className="flex items-center justify-between text-sm">
								{/* Category */}
								<span className="text-white/90 font-medium">
									{consistentBusiness.category}
									{business.priceRange && <span className="ml-2 text-white/70">• {business.priceRange}</span>}
								</span>

								{/* Location with Distance */}
								{consistentBusiness.location && (
									<div className="flex items-center gap-1.5 text-white/80">
										<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
										<span className="text-xs truncate max-w-[120px]">
											{consistentBusiness.location}
											{business.distance && <span className="ml-1 text-primary">• {business.distance}</span>}
										</span>
									</div>
								)}
							</div>

							{/* Reviews and Status Row */}
							{consistentBusiness.reviewCount > 0 && (
								<div className="flex items-center justify-between text-xs">
									<span className="text-white/70 font-medium">{consistentBusiness.reviewCount} reviews</span>
									{/* Status indicator */}
									<div className="flex items-center gap-1.5">
										<div className="w-2 h-2 bg-success rounded-full"></div>
										<span className="text-white/70 font-medium">Verified</span>
									</div>
								</div>
							)}
						</div>
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
