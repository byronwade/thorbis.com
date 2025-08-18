"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "react-feather";
import { trackBusinessCardClick } from "@utils/netflix-analytics";

export default function BusinessCard({ business, disabled }) {
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
	};

	const handleCardClick = () => {
		trackBusinessCardClick(
			business.id,
			consistentBusiness.name,
			consistentBusiness.category,
			'home-section', // This could be passed as a prop
			0 // Position in list, could be passed as a prop
		);
	};

	return (
		<div className="group relative">
			<Link 
				href={`/biz/${slug}`} 
				className={`block w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
				onClick={handleCardClick}
				data-business-card="true"
				data-business-id={business.id}
				data-business-name={consistentBusiness.name}
				data-business-category={consistentBusiness.category}
			>
				{/* Simplified card with Thorbis design system */}
				<div className="relative w-full bg-card rounded-lg overflow-hidden transition-all duration-300 ease-out group-hover:bg-accent group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1">
					{/* Business image with 16:9 aspect ratio */}
					<div className="relative aspect-[16/9] overflow-hidden bg-muted">
						<Image
							className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
							src={consistentBusiness.image}
							alt={consistentBusiness.name}
							width={400}
							height={225}
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							onError={(e) => {
								e.target.src = "/placeholder-business.svg";
							}}
						/>

						{/* Rating badge with Thorbis colors */}
						{rating > 0 && (
							<div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1.5 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-md border border-border">
									<Star className="w-4 h-4 text-primary fill-primary" />
									<span className="text-sm font-bold text-card-foreground">{consistentBusiness.rating}</span>
								</div>
							</div>
						)}

						{/* Clean gradient overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
						
						{/* Subtle hover brightness */}
						<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</div>

					{/* Content overlay with larger text */}
					<div className="absolute bottom-0 left-0 right-0 p-4">
						<h3 className="font-bold text-card-foreground text-base sm:text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-200">
							{consistentBusiness.name}
						</h3>
						<div className="flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity duration-200">
							<span className="text-sm text-muted-foreground font-medium">{consistentBusiness.category}</span>
							{consistentBusiness.reviewCount > 0 && (
								<span className="text-sm text-muted-foreground/80">{consistentBusiness.reviewCount} reviews</span>
							)}
						</div>
					</div>

					{/* Subtle border on hover */}
					<div className="absolute inset-0 border border-transparent group-hover:border-primary/30 transition-colors duration-300 rounded-lg pointer-events-none" />
				</div>
			</Link>
		</div>
	);
}
