/**
 * BusinessPopup Component
 * Displays detailed business information in a map popup
 * Optimized for performance and accessibility
 */

import React, { memo, useCallback } from "react";
import { Popup } from "react-map-gl";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Star, MapPin, Phone, Clock, ExternalLink } from "lucide-react";

const BusinessPopup = memo(({ business, showPopup, onClose, onBusinessClick, onHover, onLeave }) => {
	const handleViewBusiness = useCallback(() => {
		onBusinessClick(business);
		onClose();
	}, [business, onBusinessClick, onClose]);

	const handleMouseEnter = useCallback(() => {
		onHover(business.id);
	}, [business.id, onHover]);

	const handleMouseLeave = useCallback(() => {
		onLeave();
		onClose();
	}, [onLeave, onClose]);

	if (!showPopup || showPopup !== business.id) {
		return null;
	}

	return (
		<Popup
			longitude={business.coordinates.lng}
			latitude={business.coordinates.lat}
			anchor="bottom"
			onClose={onClose}
			closeButton={false}
			closeOnClick={false}
			className="business-popup"
			maxWidth="320px"
			style={{
				// Ensure popup renders above other elements
				zIndex: 1000,
			}}
		>
			<div
				className="bg-white dark:bg-card rounded-lg shadow-2xl border border-border dark:border-border p-4 max-w-sm"
				style={{
					// Optimized rendering
					fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
					minWidth: "280px",
					maxWidth: "320px",
					// Enhanced visual quality
					fontSmooth: "always",
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
					textRendering: "optimizeLegibility",
					// Font size adjustments for better readability
					textSizeAdjust: "100%",
					WebkitTextSizeAdjust: "100%",
					// GPU acceleration for crisp rendering
					transform: "translateZ(0)",
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
					// Prevent subpixel issues
					WebkitTransform: "translate3d(0, 0, 0)",
					willChange: "auto",
				}}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div className="space-y-3">
					{/* Header */}
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3
								className="font-bold text-lg leading-tight text-foreground dark:text-white"
								style={{
									fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
									fontSize: "16px",
									fontWeight: "500",
									lineHeight: "1.3",
									letterSpacing: "0",
									textRendering: "optimizeLegibility",
									WebkitFontSmoothing: "antialiased",
									MozOsxFontSmoothing: "grayscale",
								}}
							>
								{business.name}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								{business.ratings?.overall && (
									<div className="flex items-center gap-1">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star key={i} className={`w-4 h-4 ${i < Math.floor(business.ratings.overall) ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />
											))}
										</div>
										<span
											className="text-sm font-semibold text-foreground dark:text-white"
											style={{
												fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
												fontSize: "13px",
												fontWeight: "500",
												WebkitFontSmoothing: "antialiased",
												MozOsxFontSmoothing: "grayscale",
											}}
										>
											{business.ratings.overall.toFixed(1)}
										</span>
										<span
											className="text-xs text-muted-foreground"
											style={{
												fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
												fontSize: "12px",
												fontWeight: "400",
												WebkitFontSmoothing: "antialiased",
												MozOsxFontSmoothing: "grayscale",
											}}
										>
											({business.reviewCount || 0} reviews)
										</span>
									</div>
								)}
							</div>
						</div>
						<div className="flex flex-col items-end gap-1">
							<div
								className={`px-2 py-1 rounded-full text-xs font-medium ${business.isOpenNow ? "bg-success/10 text-success dark:bg-success dark:text-success/80" : "bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/80"}`}
								style={{
									fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
									fontSize: "11px",
									fontWeight: "500",
									WebkitFontSmoothing: "antialiased",
									MozOsxFontSmoothing: "grayscale",
								}}
							>
								{business.isOpenNow ? "Open" : "Closed"}
							</div>
							{business.price && (
								<Badge
									variant="secondary"
									className="text-xs font-bold"
									style={{
										fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
										fontSize: "11px",
										fontWeight: "500",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}
								>
									{business.price}
								</Badge>
							)}
						</div>
					</div>

					{/* Categories */}
					{business.categories && (
						<div className="flex flex-wrap gap-1">
							{business.categories.slice(0, 3).map((category, index) => (
								<Badge
									key={index}
									variant="outline"
									className="text-xs"
									style={{
										fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
										fontSize: "11px",
										fontWeight: "400",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}
								>
									{category}
								</Badge>
							))}
						</div>
					)}

					{/* Details */}
					<div className="space-y-2 text-sm">
						{business.address && (
							<div className="flex items-start gap-2 text-muted-foreground dark:text-muted-foreground">
								<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
								<span
									className="text-sm"
									style={{
										fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
										fontSize: "13px",
										fontWeight: "400",
										lineHeight: "1.4",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}
								>
									{business.address}
								</span>
							</div>
						)}
						{business.phone && (
							<div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
								<Phone className="w-4 h-4 flex-shrink-0" />
								<span
									className="text-sm"
									style={{
										fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
										fontSize: "13px",
										fontWeight: "400",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}
								>
									{business.phone}
								</span>
							</div>
						)}
						{business.hours && (
							<div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
								<Clock className="w-4 h-4 flex-shrink-0" />
								<span
									className="text-sm"
									style={{
										fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
										fontSize: "13px",
										fontWeight: "400",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}
								>
									{business.hours}
								</span>
							</div>
						)}
					</div>

					{/* Action button */}
					<div className="pt-2 border-t border-border dark:border-border">
						<Button onClick={handleViewBusiness} className="w-full flex items-center justify-center gap-2 text-sm" size="sm">
							<ExternalLink className="w-4 h-4" />
							<span>View Business</span>
						</Button>
					</div>
				</div>
			</div>
		</Popup>
	);
});

BusinessPopup.displayName = "BusinessPopup";

export default BusinessPopup;
