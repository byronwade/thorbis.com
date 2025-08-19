"use client";
import React from "react";
import { Star, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { buildBusinessUrlFrom } from "@utils";

const BusinessCard = ({ business, onClick }) => {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
		// Navigate to business page using slug or fallback to ID
		const slug =
			business.slug ||
			business.name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();
		try {
			router.push(buildBusinessUrlFrom(business));
		} catch {
			router.push(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`);
		}
	};

	const formatRating = (rating) => {
		if (!rating || rating === 0) return null;
		return rating.toFixed(1);
	};

	const formatAddress = (address) => {
		if (!address) return "";
		// Show only the first part of the address (street number and name)
		const parts = address.split(",");
		return parts[0] || "";
	};

	const getMainCategory = (categories) => {
		if (!categories || categories.length === 0) return "";
		return categories[0];
	};

	return (
		<div onClick={handleClick} className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer rounded-lg">
			{/* Business Logo - Improved size */}
			<div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
				{business.logo ? (
					<>
						<img
							src={business.logo}
							alt={business.name}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.target.style.display = "none";
								e.target.parentElement.querySelector(".fallback-avatar").style.display = "flex";
							}}
						/>
						<div className="fallback-avatar absolute inset-0 w-full h-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary" style={{ display: "none" }}>
							{business.name?.charAt(0)?.toUpperCase() || "B"}
						</div>
					</>
				) : (
					<div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{business.name?.charAt(0)?.toUpperCase() || "B"}</div>
				)}
			</div>

			{/* Business Info - Larger fonts to match logo */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h3 className="font-semibold text-sm truncate text-foreground tracking-tight">{business.name}</h3>
					{business.ratings?.overall > 0 && (
						<div className="flex items-center gap-1 bg-yellow-50 dark:bg-warning/20 px-2 py-1 rounded-md">
							<Star className="w-3.5 h-3.5 text-warning fill-yellow-500" />
							<span className="font-semibold text-sm">{formatRating(business.ratings.overall)}</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
					{getMainCategory(business.categories) && <span>{getMainCategory(business.categories)}</span>}
					{getMainCategory(business.categories) && business.address && <span>•</span>}
					{business.address && (
						<div className="flex items-center gap-1">
							<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="truncate">{formatAddress(business.address)}</span>
						</div>
					)}
				</div>
			</div>

			{/* Status Indicator - Better visibility */}
			{business.isOpenNow !== undefined && (
				<div className="flex-shrink-0">
					<div className={`w-2 h-2 rounded-full ${business.isOpenNow ? "bg-success" : "bg-destructive"}`} />
				</div>
			)}
		</div>
	);
};

export default BusinessCard;
