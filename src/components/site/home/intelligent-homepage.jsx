/**
 * Intelligent Homepage Component
 * Amazon-style personalized homepage with dynamic sections
 * Adapts content based on user behavior and preferences
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePersonalizedHomepage } from "@utils/homepage-personalization-engine";
import { behaviorTracker } from "@utils/user-behavior-tracker";
import logger from "@lib/utils/logger";
import { cn } from "@utils";

// Dynamic section components
import HeroSection from "./sections/personalized-hero-section";
import FeaturedBusinessesSection from "./sections/featured-businesses-section";
import CategoryRecommendationsSection from "./sections/category-recommendations-section";
import LocalSpotlightSection from "./sections/local-spotlight-section";
import TrendingSection from "./sections/trending-section";
import RecommendedSection from "./sections/recommended-section";
import LoadingSkeletonSection from "./sections/loading-skeleton-section";

// Performance monitoring
import { PerformanceMonitor } from "@utils/performance-monitor";

export default function IntelligentHomepage({ userId = null, userLocation = null, initialData = null, className = "", ...props }) {
	// State management
	const [homepageData, setHomepageData] = useState(initialData);
	const [isLoading, setIsLoading] = useState(!initialData);
	const [error, setError] = useState(null);
	const [personalizationScore, setPersonalizationScore] = useState(0);
	const [isPersonalized, setIsPersonalized] = useState(false);

	// Real-time location from user behavior
	const [detectedLocation, setDetectedLocation] = useState(userLocation);

	// Session tracking
	const sessionId = useMemo(() => behaviorTracker.sessionId, []);

	/**
	 * Generate personalized homepage content
	 */
	const generateHomepage = async (forceRefresh = false) => {
		if (!forceRefresh && homepageData && !isLoading) return;

		const startTime = performance.now();
		setIsLoading(true);
		setError(null);

		try {
			// Track page view for personalization
			behaviorTracker.trackPageView({
				pageType: "homepage",
				userId,
				location: detectedLocation,
			});

			// Generate personalized content
			const personalizedData = await generatePersonalizedHomepage(userId, sessionId, detectedLocation);

			setHomepageData(personalizedData);
			setPersonalizationScore(personalizedData.metadata.personalizationScore);
			setIsPersonalized(personalizedData.metadata.personalizationScore > 0.3);

			// Log performance metrics
			const generationTime = performance.now() - startTime;
			logger.performance("Intelligent homepage rendered", {
				generationTime: generationTime.toFixed(2),
				personalizationScore: personalizedData.metadata.personalizationScore,
				sectionCount: personalizedData.sections.length,
				isPersonalized: personalizedData.metadata.personalizationScore > 0.3,
			});

			// Track successful personalization
			if (personalizedData.metadata.personalizationScore > 0.5) {
				logger.businessMetrics("high_personalization_achieved", {
					score: personalizedData.metadata.personalizationScore,
					userId,
					sessionId,
				});
			}
		} catch (err) {
			logger.error("Failed to generate intelligent homepage:", err);
			setError(err.message);

			// Fallback to default homepage
			setHomepageData({
				sections: [],
				metadata: { personalizationScore: 0 },
			});
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handle user interactions for real-time personalization
	 */
	const handleUserInteraction = (interactionType, data) => {
		// Track interaction
		if (interactionType === "search") {
			behaviorTracker.trackSearch(data.query, data.filters, data.results);
		}

		// Update personalization in real-time for high-value interactions
		if (["search", "category_click", "business_view"].includes(interactionType)) {
			// Debounced refresh to avoid too many regenerations
			clearTimeout(window.personalizationTimeout);
			window.personalizationTimeout = setTimeout(() => {
				generateHomepage(true);
			}, 2000);
		}
	};

	/**
	 * Detect user location from browser API
	 */
	const detectUserLocation = async () => {
		if (!navigator.geolocation || detectedLocation) return;

		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 5000,
					enableHighAccuracy: false,
				});
			});

			// Convert coordinates to location name (simplified)
			// In production, use a geocoding service
			const location = await reverseGeocode(position.coords.latitude, position.coords.longitude);

			if (location && location !== detectedLocation) {
				setDetectedLocation(location);
				generateHomepage(true); // Refresh with new location
			}
		} catch (error) {
			logger.debug("Geolocation not available or denied:", error);
		}
	};

	/**
	 * Initialize component
	 */
	useEffect(() => {
		const initializeHomepage = async () => {
			// Detect location if not provided
			if (!userLocation) {
				detectUserLocation();
			}

			// Generate initial homepage if not provided
			if (!initialData) {
				generateHomepage();
			}
		};

		initializeHomepage();

		// Cleanup on unmount
		return () => {
			clearTimeout(window.personalizationTimeout);
		};
	}, [userId, sessionId]);

	/**
	 * Monitor scroll behavior for engagement
	 */
	useEffect(() => {
		const handleScroll = () => {
			const scrolled = window.scrollY;
			const viewportHeight = window.innerHeight;

			// Track section visibility for engagement analytics
			homepageData?.sections?.forEach((section, index) => {
				const element = document.getElementById(`section-${section.type}-${index}`);
				if (element) {
					const rect = element.getBoundingClientRect();
					const isVisible = rect.top < viewportHeight && rect.bottom > 0;

					if (isVisible) {
						behaviorTracker.trackEngagement("section_view", {
							sectionType: section.type,
							sectionIndex: index,
							personalized: section.personalized,
						});
					}
				}
			});
		};

		const throttledScroll = behaviorTracker.throttle(handleScroll, 1000);
		window.addEventListener("scroll", throttledScroll);

		return () => window.removeEventListener("scroll", throttledScroll);
	}, [homepageData]);

	/**
	 * Render section component based on type
	 */
	const renderSection = (section, index) => {
		const sectionProps = {
			key: `${section.type}-${index}`,
			id: `section-${section.type}-${index}`,
			section,
			onInteraction: handleUserInteraction,
			isPersonalized: section.personalized,
			personalizationScore: section.metadata?.confidence || 0,
			userId,
			sessionId,
		};

		// Animation variants for smooth transitions
		const sectionVariants = {
			hidden: {
				opacity: 0,
				y: 20,
				scale: 0.98,
			},
			visible: {
				opacity: 1,
				y: 0,
				scale: 1,
				transition: {
					duration: 0.5,
					delay: index * 0.1,
					ease: [0.22, 1, 0.36, 1],
				},
			},
		};

		const SectionComponent = motion.div;

		switch (section.type) {
			case "hero":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="relative" {...sectionProps}>
						<HeroSection {...sectionProps} />
					</SectionComponent>
				);

			case "featured_businesses":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="py-12" {...sectionProps}>
						<FeaturedBusinessesSection {...sectionProps} />
					</SectionComponent>
				);

			case "category_recommendations":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="py-12 bg-gray-50" {...sectionProps}>
						<CategoryRecommendationsSection {...sectionProps} />
					</SectionComponent>
				);

			case "local_spotlight":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="py-12" {...sectionProps}>
						<LocalSpotlightSection {...sectionProps} />
					</SectionComponent>
				);

			case "trending":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50" {...sectionProps}>
						<TrendingSection {...sectionProps} />
					</SectionComponent>
				);

			case "recommended":
				return (
					<SectionComponent variants={sectionVariants} initial="hidden" animate="visible" className="py-12" {...sectionProps}>
						<RecommendedSection {...sectionProps} />
					</SectionComponent>
				);

			default:
				logger.warn(`Unknown section type: ${section.type}`);
				return null;
		}
	};

	/**
	 * Render loading skeleton
	 */
	const renderLoadingSkeleton = () => (
		<div className="space-y-12">
			{[1, 2, 3, 4].map((i) => (
				<LoadingSkeletonSection key={i} index={i} />
			))}
		</div>
	);

	/**
	 * Render error state
	 */
	const renderErrorState = () => (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center max-w-md mx-auto px-4">
				<div className="mb-4">
					<svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h3 className="text-lg font-medium text-foreground mb-2">Unable to Load Personalized Content</h3>
				<p className="text-muted-foreground mb-4">We're having trouble personalizing your homepage. Please try refreshing the page.</p>
				<button onClick={() => generateHomepage(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
					Try Again
				</button>
			</div>
		</div>
	);

	/**
	 * Personalization indicator for debugging/analytics
	 */
	const PersonalizationIndicator = () => {
		if (process.env.NODE_ENV !== "development" || !isPersonalized) return null;

		return <div className="fixed bottom-4 right-4 bg-success text-white px-3 py-1 rounded-full text-xs font-medium z-50">Personalized ({Math.round(personalizationScore * 100)}%)</div>;
	};

	// Render loading state
	if (isLoading) {
		return (
			<div className={cn("min-h-screen", className)} {...props}>
				{renderLoadingSkeleton()}
			</div>
		);
	}

	// Render error state
	if (error) {
		return renderErrorState();
	}

	// Render personalized homepage
	return (
		<div className={cn("min-h-screen", className)} {...props}>
			{/* Homepage sections */}
			<AnimatePresence mode="wait">{homepageData?.sections?.map((section, index) => renderSection(section, index))}</AnimatePresence>

			{/* Personalization indicator for development */}
			<PersonalizationIndicator />

			{/* Performance monitor for enterprise analytics */}
			<PerformanceMonitor pageType="intelligent_homepage" personalizationScore={personalizationScore} sectionCount={homepageData?.sections?.length || 0} />
		</div>
	);
}

/**
 * Utility function for reverse geocoding (simplified)
 * In production, integrate with Google Maps or similar service
 */
async function reverseGeocode(lat, lng) {
	try {
		// This is a simplified implementation
		// In production, use a proper geocoding service
		const response = await fetch(`https://api.example.com/geocode?lat=${lat}&lng=${lng}`);
		const data = await response.json();
		return data.city || data.locality || null;
	} catch (error) {
		logger.debug("Reverse geocoding failed:", error);
		return null;
	}
}

// Export component with performance optimizations
export { IntelligentHomepage };

// Higher-order component for additional optimizations
export const IntelligentHomepageWithOptimizations = React.memo(IntelligentHomepage);
