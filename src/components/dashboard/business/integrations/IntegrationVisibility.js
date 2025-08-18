"use client";
import { useState, useEffect } from "react";

/**
 * Integration visibility wrapper component
 * Controls visibility of features based on business integration settings
 */
export function IntegrationVisibility({ children, featureKey, fallback = null }) {
	const [isVisible, setIsVisible] = useState(true); // Default to visible for development
	
	// Mock feature flags - replace with real integration logic
	const featureFlags = {
		field_management: true,
		fleet_management: true,
		hospitality: true,
		ecommerce: true,
		logistics: true,
		agriculture: true,
		automotive: true,
		property_management: true,
	};

	useEffect(() => {
		// In production, this would check actual business integrations
		// For now, we'll default to showing all features
		if (featureKey && featureFlags[featureKey] !== undefined) {
			setIsVisible(featureFlags[featureKey]);
		}
	}, [featureKey]);

	if (!isVisible) {
		return fallback;
	}

	return children;
}

// Named export for compatibility
export { IntegrationVisibility as default };
