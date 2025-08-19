/**
 * ClusterMarker Component
 * Displays clustered businesses with count
 * Handles cluster expansion on click
 */

import React, { memo, useCallback } from "react";

const ClusterMarker = memo(({ cluster, handleClusterClick }) => {
	const handleClick = useCallback(() => {
		handleClusterClick(cluster);
	}, [cluster, handleClusterClick]);

	return (
		<div
			className="relative cursor-pointer transition-all duration-200 ease-out hover:scale-110"
			style={{
				transformOrigin: "center",
			}}
			onClick={handleClick}
		>
			{/* Modern cluster design */}
			<div
				className="flex items-center justify-center w-14 h-14 bg-white text-foreground rounded-full border-4 border-primary shadow-xl"
				style={{
					// Google Maps style font rendering for clusters
					fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
					fontSize: "16px",
					fontWeight: "600",
					color: "hsl(var(--foreground))",
					// Anti-aliasing and smoothing
					fontSmooth: "always",
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
					textRendering: "optimizeLegibility",
					// Enhanced shadow
					boxShadow: "0 6px 20px hsl(var(--foreground) / 0.15), 0 3px 6px hsl(var(--foreground) / 0.1)",
					// GPU acceleration for smooth rendering
					transform: "translateZ(0)",
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
				}}
			>
				<span
					className="font-bold text-lg"
					style={{
						fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
						fontSize: "16px",
						fontWeight: "700",
						letterSpacing: "-0.01em",
						lineHeight: "1.1",
						// Enhanced text sharpening for cluster numbers
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale",
						textRendering: "optimizeLegibility",
					}}
				>
					{cluster.count}
				</span>
			</div>

			{/* Cluster expansion indicator */}
			<div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
				<span
					className="text-xs text-white font-bold"
					style={{
						fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
						fontSize: "11px",
						fontWeight: "700",
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale",
					}}
				>
					+
				</span>
			</div>
		</div>
	);
});

ClusterMarker.displayName = "ClusterMarker";

export default ClusterMarker;
