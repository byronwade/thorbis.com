"use client";
import Image from "next/image";
import Link from "next/link";
import { buildBusinessUrlFrom } from "@utils";
import { Star, MapPin } from "react-feather";

// Netflix mobile app style - portrait cards for mobile
export default function MobileBusinessCard({ business, disabled }) {
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

	return (
		<Link href={buildBusinessUrlFrom(business)} className={`block w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
			{/* Netflix mobile-style portrait card */}
			<div className="relative w-full bg-card rounded-lg overflow-hidden hover:bg-card transition-all duration-300 group">
				{/* Mobile portrait aspect ratio like Netflix mobile app */}
				<div className="relative aspect-[3/4] overflow-hidden bg-card">
					<Image
						className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
						src={consistentBusiness.image}
						alt={consistentBusiness.name}
						width={300}
						height={400}
						sizes="(max-width: 640px) 50vw, 33vw"
						onError={(e) => {
							e.target.src = "/placeholder-business.svg";
						}}
					/>

					{/* Mobile-optimized gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
					
					{/* Rating badge - optimized for mobile */}
					{rating > 0 && (
						<div className="absolute top-2 right-2">
							<div className="flex items-center gap-1 px-2 py-1 bg-black/90 backdrop-blur-sm rounded">
								<Star className="w-3 h-3 text-warning fill-yellow-500" />
								<span className="text-xs font-bold text-white">{consistentBusiness.rating}</span>
							</div>
						</div>
					)}
				</div>

				{/* Content overlay at bottom - mobile optimized */}
				<div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
					<h3 className="font-bold text-white text-sm line-clamp-2 mb-1 leading-tight">
						{consistentBusiness.name}
					</h3>
					
					<p className="text-xs text-muted-foreground mb-2 line-clamp-1">
						{consistentBusiness.category}
					</p>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1 text-muted-foreground">
							<MapPin className="w-3 h-3 flex-shrink-0" />
							<span className="text-xs truncate">{consistentBusiness.location}</span>
						</div>
						
						{consistentBusiness.reviewCount > 0 && (
							<span className="text-xs text-muted-foreground flex-shrink-0">
								{consistentBusiness.reviewCount} reviews
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
