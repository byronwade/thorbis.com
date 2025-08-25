import Image from "next/image";
import Link from "next/link";
import { buildBusinessUrl } from "@utils";
import { Star, MapPin } from "react-feather";

export default function BusinessCard({ business, disabled }) {
	const slug =
		business.slug ||
		business.name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();

	const rating = parseFloat(business.rating);

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
		<Link href={buildBusinessUrl({
			country: (business.country || 'US').toLowerCase(),
			state: business.state,
			city: business.city,
			name: business.name,
			shortId: business.short_id || business.shortId
		})} className={`group block w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
			<div className="w-full">
				{/* Enhanced card with image-first design */}
				<div className="relative w-full h-[280px] bg-card rounded-2xl overflow-hidden transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1 group-active:scale-95 border border-border/50 group-hover:border-primary/20">
					
					{/* Main Image Area (70-75% of height) */}
					<div className="relative h-[75%] overflow-hidden">
						{/* Background Image or Color */}
						{business.image ? (
							<Image 
								className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" 
								src={business.image} 
								alt={business.name} 
								width={350} 
								height={260}
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
								<div className="text-white/80 text-5xl font-bold">
									{business.name.charAt(0).toUpperCase()}
								</div>
							</div>
						)}

						{/* Rating Badge - Top Right */}
						{rating > 0 && (
							<div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
								<div className="flex items-center gap-1.5 px-3 py-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm min-w-[60px] justify-center">
									<Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
									<span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
								</div>
							</div>
						)}

						{/* Price Range - Top Right (if rating not shown) */}
						{!rating && business.priceRange && (
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
							<h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
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
								{business.location && (
									<div className="flex items-center gap-1.5 text-white/80">
										<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
										<span className="text-xs truncate max-w-[120px]">
											{business.location}
											{business.distance && <span className="ml-1 text-primary">• {business.distance}</span>}
										</span>
									</div>
								)}
							</div>

							{/* Reviews Row */}
							{business.reviewCount > 0 && (
								<div className="flex items-center justify-between text-xs">
									<span className="text-white/70 font-medium">{business.reviewCount} reviews</span>
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
					<div className="absolute inset-0 border border-transparent group-hover:border-primary/20 group-active:border-primary/40 transition-colors duration-300 rounded-2xl pointer-events-none" />
					
					{/* Mobile touch indicator */}
					<div className="absolute inset-0 bg-primary/0 group-active:bg-primary/5 transition-colors duration-150 rounded-2xl pointer-events-none" />
				</div>
			</div>
		</Link>
	);
}
