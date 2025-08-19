/**
 * DetailedMarker Component
 * Rich marker for close zoom levels with business information
 * Shows ratings, status, and other key details
 */

import React, { memo, useCallback } from "react";
import { Star, Shield } from "lucide-react";

const DetailedMarker = memo(({ business, isActive, handleMarkerHover, handleMarkerLeave }) => {
	const isOpen = business.isOpenNow;
	const isSponsored = business.isSponsored;
	const rating = business.ratings?.overall || 0;

	const handleHover = useCallback(() => {
		handleMarkerHover(business);
	}, [business, handleMarkerHover]);

	return (
		<div
			className={`relative cursor-pointer transition-all duration-200 ${isActive ? "scale-110 z-30" : "hover:scale-105 z-20"}`}
			style={{
				transformOrigin: "center bottom",
			}}
			onMouseEnter={handleHover}
			onMouseLeave={handleMarkerLeave}
		>
			{/* Main marker body */}
			<div
				className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-3 border-white shadow-xl ${isOpen ? "bg-primary" : "bg-neutral-700"}`}
				style={{
					// Enhanced shadow for detailed markers
					boxShadow: isActive ? "0 8px 25px hsl(var(--foreground) / 0.4), 0 4px 12px hsl(var(--foreground) / 0.2)" : "0 4px 15px hsl(var(--foreground) / 0.3), 0 2px 8px hsl(var(--foreground) / 0.15)",
					// GPU acceleration
					transform: "translateZ(0)",
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
				}}
			>
				{/* Business initial or icon */}
				<span
					className="text-white font-bold text-sm"
					style={{
						fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
						fontSize: "14px",
						fontWeight: "700",
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale",
					}}
				>
					{business.name.charAt(0).toUpperCase()}
				</span>
			</div>

			{/* Rating indicator */}
			{rating > 0 && (
				<div className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-md border">
					<Star className="w-3 h-3 fill-yellow-400 text-warning" />
					<span
						className="text-xs font-semibold text-foreground"
						style={{
							fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
							fontSize: "10px",
							fontWeight: "600",
							WebkitFontSmoothing: "antialiased",
							MozOsxFontSmoothing: "grayscale",
						}}
					>
						{rating.toFixed(1)}
					</span>
				</div>
			)}

			{/* Sponsored indicator */}
			{isSponsored && (
				<div className="absolute -top-1 -left-1 w-5 h-5 bg-warning/40 rounded-full flex items-center justify-center shadow-md">
					<Shield className="w-3 h-3 text-warning" />
				</div>
			)}

			{/* Status indicator */}
			<div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 rounded-full ${isOpen ? "bg-success/40" : "bg-destructive/40"} shadow-sm`} />

			{/* Drop shadow pin effect */}
			<div
				className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent"
				style={{
					borderTopColor: isOpen ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
					filter: "drop-shadow(0 2px 4px hsl(var(--foreground) / 0.2))",
				}}
			/>
		</div>
	);
});

DetailedMarker.displayName = "DetailedMarker";

export default DetailedMarker;
