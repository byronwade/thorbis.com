"use client";

import { useState } from "react";
import NextImage from "next/image";
import { ImageOff } from "lucide-react";

/**
 * Enhanced Image Component
 *
 * This component automatically handles SVG files by using regular img tags
 * while using Next.js Image optimization for other file types.
 *
 * Drop-in replacement for Next.js Image component.
 */
export default function Image({ src, alt, fallbackSrc = "/placeholder-image.svg", showPlaceholderOnError = true, className = "", fill = false, width, height, sizes = "100vw", priority = false, quality = 75, ...props }) {
	const [imgSrc, setImgSrc] = useState(src);
	const [hasError, setHasError] = useState(false);

	// Determine if we should skip Next.js optimization
	const shouldSkipOptimization =
		imgSrc &&
		(imgSrc.endsWith(".svg") || // All SVG files
			imgSrc.includes("placeholder-") || // All placeholder files
			imgSrc.startsWith("data:")); // Data URLs

	const handleError = () => {
		console.warn(`Image failed to load: ${imgSrc}`);

		// Try fallback first
		if (imgSrc !== fallbackSrc && fallbackSrc) {
			setImgSrc(fallbackSrc);
		} else {
			// Fallback also failed
			setHasError(true);
		}
	};

	// Show placeholder if all images failed
	if (hasError && showPlaceholderOnError) {
		return (
			<div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`} style={fill ? {} : { width, height }}>
				<ImageOff className="w-1/3 h-1/3 min-w-[20px] min-h-[20px] max-w-[50px] max-h-[50px]" />
			</div>
		);
	}

	// Return null if failed and no placeholder
	if (hasError && !showPlaceholderOnError) {
		return null;
	}

	// Use regular img tag for SVG files and placeholder files
	if (shouldSkipOptimization) {
		const imgProps = {
			src: imgSrc,
			alt,
			onError: handleError,
			className,
			loading: priority ? "eager" : "lazy",
			style: fill
				? {
						position: "absolute",
						height: "100%",
						width: "100%",
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						objectFit: "cover",
						color: "transparent",
					}
				: {
						width: typeof width === "number" ? `${width}px` : width,
						height: typeof height === "number" ? `${height}px` : height,
					},
			...props,
		};

		return <img {...imgProps} />;
	}

	// Use Next.js Image for optimization
	const imageProps = {
		src: imgSrc,
		alt,
		onError: handleError,
		className,
		priority,
		quality,
		placeholder: "blur",
		blurDataURL:
			"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
		loading: priority ? "eager" : "lazy",
		...props,
	};

	if (fill) {
		return <NextImage {...imageProps} fill sizes={sizes} />;
	}

	return <NextImage {...imageProps} width={width} height={height} sizes={sizes} />;
}

// Export the component as default and named export
export { Image };
