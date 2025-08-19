// REQUIRED: Intelligent Login Message Component
// Displays contextual messaging based on user intent

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginContextDetector, ContextMessageGenerator } from "@lib/auth/login-context";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { Building2, Star, Calendar, Heart, Users, Shield, Sparkles, MessageCircle, User, Settings, ChevronRight, Clock, TrendingUp, CheckCircle, MapPin } from "lucide-react";
import { cn } from "@utils";
import logger from "@lib/utils/logger";
// Logger validation moved to tests - removing for production build
// import { validateLogger } from "@utils/logger-test";

const CONTEXT_ICONS = {
	business: Building2,
	social: Users,
	booking: Calendar,
	account: User,
	admin: Settings,
	premium: Sparkles,
	support: MessageCircle,
	general: Shield,
};

// Helper functions for enhanced personalized content
const getSourceSpecificMessage = (context, isSignupMode) => {
	const sourceMessages = {
		business_page: isSignupMode ? "Since you were viewing a business, we'll help you create lists and write reviews easily." : "We'll take you back to that business page with full access to reviews and booking options.",

		search: isSignupMode ? "We'll personalize your search results and save your preferences." : "Continue your search with personalized results and saved preferences.",

		category_page: isSignupMode ? "We'll recommend businesses in this category based on your preferences." : "Get personalized recommendations in this category and save your favorites.",

		neighborhood: isSignupMode ? "Connect with your local community and discover neighborhood businesses." : "Access exclusive neighborhood content and local business insights.",

		blog: isSignupMode ? "Join the conversation and save articles that interest you." : "Comment on articles and access your saved content.",

		dashboard: "Access your personalized dashboard with all your saved content and preferences.",

		direct: "You'll have full access to all features and personalized recommendations.",
	};

	return <p className="text-sm text-muted-foreground">{sourceMessages[context?.source] || sourceMessages.direct}</p>;
};

const getDiscoveryPreview = (context) => {
	const baseItems = [
		{ icon: Star, title: "Personalized recommendations", description: "Based on your interests" },
		{ icon: Heart, title: "Save favorites", description: "Create custom lists" },
	];

	// Add context-specific items
	if (context?.key === "search-results") {
		return [{ icon: TrendingUp, title: "Smart search results", description: "Tailored to your preferences" }, ...baseItems];
	}

	if (context?.key === "browse-category") {
		return [{ icon: Building2, title: "Category insights", description: "Discover top-rated businesses" }, ...baseItems];
	}

	return baseItems;
};

const getLocalPreview = () => [
	{ icon: MapPin, label: "Local events" },
	{ icon: Users, label: "Community groups" },
	{ icon: Calendar, label: "Neighborhood news" },
	{ icon: Building2, label: "Local businesses" },
];

export default function IntelligentLoginMessage({ onContextDetected, isSignupMode = false }) {
	const searchParams = useSearchParams();
	const [context, setContext] = useState(null);
	const [isVisible, setIsVisible] = useState(false);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		// Validate logger functionality on component mount
		if (process.env.NODE_ENV === "development") {
			console.log("🔍 Running logger validation in IntelligentLoginMessage...");
			// validateLogger(); // Removed for production build
		}

		// Detect context from URL parameters
		const detectedContext = LoginContextDetector.detectContext(window.location.href, searchParams);

		setContext(detectedContext);

		// Store context globally for access by other components
		window.loginContext = detectedContext;

		// Notify parent component
		if (onContextDetected) {
			onContextDetected(detectedContext);
		}

		// Log context detection for analytics with robust error handling
		try {
			// Enhanced logger validation with debugging
			if (!logger) {
				console.warn("Logger is null or undefined");
				return;
			}

			if (typeof logger !== "object") {
				console.warn("Logger is not an object, type:", typeof logger);
				return;
			}

			if (typeof logger.interaction !== "function") {
				console.warn("Logger.interaction is not a function, type:", typeof logger.interaction, "Available methods:", Object.keys(logger));
				// Fallback to analytics if available
				if (typeof logger.analytics === "function") {
					logger.analytics({
						type: "login_context_detected",
						context: detectedContext.key,
						detectionMethod: detectedContext.detected,
						originalPath: detectedContext.originalPath,
						timestamp: Date.now(),
					});
				}
				return;
			}

			// Safe to call logger.interaction
			logger.interaction({
				type: "login_context_detected",
				context: detectedContext.key,
				detectionMethod: detectedContext.detected,
				originalPath: detectedContext.originalPath,
				timestamp: Date.now(),
			});
		} catch (logError) {
			console.warn("Logger interaction failed:", logError);
			// Try fallback analytics method
			try {
				if (logger && typeof logger.analytics === "function") {
					logger.analytics({
						type: "login_context_detected",
						context: detectedContext.key,
						detectionMethod: detectedContext.detected,
						originalPath: detectedContext.originalPath,
						timestamp: Date.now(),
					});
				} else {
					// Direct console fallback
					console.log("👆 INTERACTION:", {
						type: "login_context_detected",
						context: detectedContext.key,
						detectionMethod: detectedContext.detected,
						originalPath: detectedContext.originalPath,
						timestamp: Date.now(),
					});
				}
			} catch (innerError) {
				console.error("Analytics fallback failed:", innerError);
				// Final console fallback
				console.log("👆 INTERACTION (final fallback):", {
					type: "login_context_detected",
					context: detectedContext.key,
					detectionMethod: detectedContext.detected,
					originalPath: detectedContext.originalPath,
					timestamp: Date.now(),
				});
			}
		}

		// One-time reveal without looping animations
		setIsVisible(true);
	}, [searchParams, onContextDetected]);

	if (!context || context.key === "default") {
		return null;
	}

	const IconComponent = CONTEXT_ICONS[context.category] || Shield;
	const urgency = ContextMessageGenerator.getUrgencyLevel(context);
	const socialProof = ContextMessageGenerator.getSocialProof(context);
	const timeSensitive = ContextMessageGenerator.getTimeSensitiveMessage(context);

	return (
		<div className={cn(
			"mb-6 transition-opacity duration-300",
			isVisible ? "opacity-100" : "opacity-0"
		)}>
			{/* Noticeable but Clean Banner */}
			<div className="flex items-center p-4 bg-blue-50 dark:bg-primary/30 rounded-lg border border-primary/30 dark:border-primary">
				<div className="flex items-center space-x-3">
					<IconComponent className="h-4 w-4 text-primary dark:text-primary" />
					<p className="text-sm text-primary dark:text-primary/70 font-medium">{context.message}</p>
				</div>
			</div>
		</div>
	);
}

// Additional component for minimal context display
export function MinimalContextMessage({ context }) {
	if (!context || context.key === "default") {
		return null;
	}

	const IconComponent = CONTEXT_ICONS[context.category] || Shield;

	return (
		<div className="flex items-center p-4 space-x-3 bg-blue-50 rounded-lg border border-primary/30 dark:bg-primary/20 dark:border-primary">
			<IconComponent className="w-5 h-5 text-primary dark:text-primary" />
			<div>
				<p className="text-sm font-medium text-primary dark:text-primary/70">{context.title}</p>
				<p className="text-xs text-primary dark:text-primary/90">{context.message}</p>
			</div>
		</div>
	);
}
