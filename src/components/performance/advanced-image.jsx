/**
 * Advanced Image Component with Experimental Performance Features
 *
 * Implements cutting-edge image optimization techniques:
 * - AVIF/WebP format optimization
 * - Intelligent loading strategies
 * - Viewport-based lazy loading
 * - Critical image preloading
 * - Progressive loading effects
 * - Blur-to-sharp transitions
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// Image format priority based on browser support
const getOptimalFormat = () => {
	if (typeof window === "undefined") return "webp";

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	// Check AVIF support
	if (canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0) {
		return "avif";
	}

	// Check WebP support
	if (canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0) {
		return "webp";
	}

	return "jpg";
};

// Generate optimized image URLs with format conversion
const generateOptimizedUrl = (src, width, height, quality = 75, format = null) => {
	if (!src) return "";

	const optimalFormat = format || getOptimalFormat();

	// If it's a relative URL, use Next.js image optimization
	if (src.startsWith("/")) {
		const params = new URLSearchParams({
			url: src,
			w: width.toString(),
			h: height.toString(),
			q: quality.toString(),
			f: optimalFormat,
		});

		return `/_next/image?${params.toString()}`;
	}

	// For external URLs, try to append optimization parameters
	try {
		const url = new URL(src);

		// Common CDN optimizations
		if (url.hostname.includes("cloudinary.com")) {
			// Cloudinary optimizations
			const cloudinaryParams = `c_fill,w_${width},h_${height},q_${quality},f_${optimalFormat}`;
			return src.replace("/upload/", `/upload/${cloudinaryParams}/`);
		}

		if (url.hostname.includes("imagekit.io")) {
			// ImageKit optimizations
			url.searchParams.set("tr", `w-${width},h-${height},q-${quality},f-${optimalFormat}`);
			return url.toString();
		}

		// Fallback for other CDNs
		return src;
	} catch {
		return src;
	}
};

// Blur data URL generator for smooth loading
const generateBlurDataURL = (width = 8, height = 8) => {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0, "hsl(var(--muted))");
gradient.addColorStop(1, "hsl(var(--muted))");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	return canvas.toDataURL();
};

/**
 * Advanced Image Component with Performance Optimizations
 */
export default function AdvancedImage({ src, alt, width, height, className = "", priority = false, quality = 75, loading = "lazy", sizes = "100vw", placeholder = "blur", blurDataURL = null, onLoad = null, onError = null, progressive = true, critical = false, preloadFormat = "avif", fallbackFormat = "webp", ...props }) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [currentFormat, setCurrentFormat] = useState(getOptimalFormat());
	const imageRef = useRef(null);
	const observerRef = useRef(null);

	// Generate optimized URLs for different formats
	const optimizedSrc = generateOptimizedUrl(src, width, height, quality, currentFormat);
	const fallbackSrc = generateOptimizedUrl(src, width, height, quality, fallbackFormat);

	// Generate blur placeholder if not provided
	const blurPlaceholder = blurDataURL || generateBlurDataURL();

	/**
	 * Handle image load success
	 */
	const handleLoad = useCallback(
		(event) => {
			setIsLoaded(true);
			setHasError(false);

			if (onLoad) {
				onLoad(event);
			}

			// Track image loading performance
			if (typeof gtag !== "undefined") {
				gtag("event", "image_loaded", {
					event_category: "performance",
					event_label: src,
					custom_map: {
						format: currentFormat,
						width: width,
						height: height,
						loading_strategy: loading,
					},
				});
			}
		},
		[onLoad, src, currentFormat, width, height, loading]
	);

	/**
	 * Handle image load error with format fallback
	 */
	const handleError = useCallback(
		(event) => {
			// Try fallback format if current format fails
			if (currentFormat !== fallbackFormat) {
				setCurrentFormat(fallbackFormat);
				return;
			}

			// If fallback also fails, show error state
			setHasError(true);
			setIsLoaded(false);

			if (onError) {
				onError(event);
			}

			// Track image loading errors
			if (typeof gtag !== "undefined") {
				gtag("event", "image_error", {
					event_category: "performance",
					event_label: src,
					custom_map: {
						format: currentFormat,
						width: width,
						height: height,
					},
				});
			}
		},
		[currentFormat, fallbackFormat, onError, src, width, height]
	);

	/**
	 * Preload critical images
	 */
	useEffect(() => {
		if (critical || priority) {
			const link = document.createElement("link");
			link.rel = "preload";
			link.href = optimizedSrc;
			link.as = "image";

			// Add format-specific attributes
			if (currentFormat === "avif") {
				link.type = "image/avif";
			} else if (currentFormat === "webp") {
				link.type = "image/webp";
			}

			document.head.appendChild(link);

			return () => {
				if (document.head.contains(link)) {
					document.head.removeChild(link);
				}
			};
		}
	}, [critical, priority, optimizedSrc, currentFormat]);

	/**
	 * Intersection Observer for advanced lazy loading
	 */
	useEffect(() => {
		if (loading === "lazy" && !priority && !critical) {
			observerRef.current = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							// Start loading when image enters viewport
							const img = entry.target;
							if (img.dataset.src) {
								img.src = img.dataset.src;
								img.removeAttribute("data-src");
								observerRef.current?.unobserve(img);
							}
						}
					});
				},
				{
					rootMargin: "50px",
					threshold: 0.1,
				}
			);

			if (imageRef.current) {
				observerRef.current.observe(imageRef.current);
			}

			return () => {
				if (observerRef.current) {
					observerRef.current.disconnect();
				}
			};
		}
	}, [loading, priority, critical]);

	// Enhanced className with loading states
	const enhancedClassName = `
    ${className}
    ${progressive ? "transition-all duration-300 ease-in-out" : ""}
    ${!isLoaded && progressive ? "filter blur-sm scale-105" : ""}
    ${isLoaded && progressive ? "filter blur-0 scale-100" : ""}
    ${hasError ? "bg-muted dark:bg-muted" : ""}
  `
		.trim()
		.replace(/\s+/g, " ");

	// Error fallback
	if (hasError) {
		return (
			<div className={`${enhancedClassName} flex items-center justify-center bg-muted dark:bg-muted`} style={{ width, height }} {...props}>
				<svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
		);
	}

	return <Image ref={imageRef} src={optimizedSrc} alt={alt} width={width} height={height} className={enhancedClassName} priority={priority || critical} quality={quality} loading={loading} sizes={sizes} placeholder={placeholder} blurDataURL={blurPlaceholder} onLoad={handleLoad} onError={handleError} {...props} />;
}

/**
 * Specialized image components for different use cases
 */

// Hero Image with aggressive optimization
export function HeroImage({ src, alt, className = "", ...props }) {
	return <AdvancedImage src={src} alt={alt} className={`${className} object-cover`} priority={true} critical={true} quality={90} loading="eager" progressive={true} placeholder="blur" {...props} />;
}

// Profile Image with circular loading effect
export function ProfileImage({ src, alt, size = 40, className = "", ...props }) {
	return <AdvancedImage src={src} alt={alt} width={size} height={size} className={`${className} rounded-full object-cover`} quality={85} loading="lazy" progressive={true} sizes={`${size}px`} {...props} />;
}

// Business Image with lazy loading
export function BusinessImage({ src, alt, className = "", ...props }) {
	return <AdvancedImage src={src} alt={alt} className={`${className} object-cover rounded-lg`} quality={80} loading="lazy" progressive={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" {...props} />;
}

// Gallery Image with progressive enhancement
export function GalleryImage({ src, alt, className = "", ...props }) {
	return <AdvancedImage src={src} alt={alt} className={`${className} object-cover cursor-pointer hover:scale-105 transition-transform duration-200`} quality={75} loading="lazy" progressive={true} placeholder="blur" {...props} />;
}

/**
 * Image Preloader component for background image loading
 */
export function ImagePreloader({ images = [], priority = "low" }) {
	useEffect(() => {
		if (images.length === 0) return;

		const preloadImages = async () => {
			const preloadPromises = images.map(async (imageSrc, index) => {
				return new Promise((resolve) => {
					// Stagger image preloading to avoid overwhelming the network
					setTimeout(() => {
						const img = new Image();
						img.onload = resolve;
						img.onerror = resolve;
						img.src = generateOptimizedUrl(imageSrc, 400, 300, 60);
					}, index * 100);
				});
			});

			await Promise.all(preloadPromises);
		};

		// Use requestIdleCallback for low-priority preloading
		if (priority === "low" && "requestIdleCallback" in window) {
			requestIdleCallback(preloadImages);
		} else {
			preloadImages();
		}
	}, [images, priority]);

	return null; // This component doesn't render anything
}

/**
 * Responsive Image with Art Direction
 */
export function ResponsiveImage({ src, alt, mobileSrc = null, tabletSrc = null, desktopSrc = null, className = "", ...props }) {
	const [currentSrc, setCurrentSrc] = useState(src);

	useEffect(() => {
		const updateSource = () => {
			const width = window.innerWidth;

			if (width < 768 && mobileSrc) {
				setCurrentSrc(mobileSrc);
			} else if (width < 1024 && tabletSrc) {
				setCurrentSrc(tabletSrc);
			} else if (desktopSrc) {
				setCurrentSrc(desktopSrc);
			} else {
				setCurrentSrc(src);
			}
		};

		updateSource();
		window.addEventListener("resize", updateSource);

		return () => window.removeEventListener("resize", updateSource);
	}, [src, mobileSrc, tabletSrc, desktopSrc]);

	return <AdvancedImage src={currentSrc} alt={alt} className={className} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" {...props} />;
}

/**
 * Performance metrics for image optimization
 */
export function getImagePerformanceMetrics() {
	const images = document.querySelectorAll("img");
	const totalImages = images.length;
	let loadedImages = 0;
	let failedImages = 0;
	let totalSize = 0;

	images.forEach((img) => {
		if (img.complete) {
			if (img.naturalWidth > 0) {
				loadedImages++;
				// Estimate size (simplified)
				totalSize += img.naturalWidth * img.naturalHeight * 0.1; // Rough estimate
			} else {
				failedImages++;
			}
		}
	});

	return {
		totalImages,
		loadedImages,
		failedImages,
		loadSuccessRate: totalImages > 0 ? (loadedImages / totalImages) * 100 : 0,
		estimatedTotalSize: Math.round(totalSize / 1024), // KB
		supportedFormats: {
			avif: getOptimalFormat() === "avif",
			webp: ["avif", "webp"].includes(getOptimalFormat()),
			modern: getOptimalFormat() !== "jpg",
		},
	};
}
