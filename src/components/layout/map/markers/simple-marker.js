/**
 * SimpleMarker Component
 * Lightweight marker for zoomed-out views
 * Optimized for performance with minimal DOM elements
 */

import React, { memo, useCallback } from "react";

const SimpleMarker = memo(({ business, isActive, handleMarkerHover, handleMarkerLeave }) => {
	const isOpen = business.isOpenNow;

	const handleHover = useCallback(() => {
		handleMarkerHover(business);
	}, [business, handleMarkerHover]);

	return (
		<div
			className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${isOpen ? "bg-primary" : "bg-neutral-700"}`}
			style={{
				transformOrigin: "center",
				boxShadow: isActive ? "0 4px 12px hsl(var(--foreground) / 0.3)" : "0 2px 6px hsl(var(--foreground) / 0.2)",
				// GPU acceleration
				transform: "translateZ(0)",
				backfaceVisibility: "hidden",
				WebkitBackfaceVisibility: "hidden",
			}}
			onMouseEnter={handleHover}
			onMouseLeave={handleMarkerLeave}
		/>
	);
});

SimpleMarker.displayName = "SimpleMarker";

export default SimpleMarker;
