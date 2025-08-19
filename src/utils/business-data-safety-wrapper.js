/**
 * Business Data Safety Wrapper
 * Prevents Promise objects from being passed to sorting/filtering functions
 * Implements defensive programming patterns from research
 */

import logger from "./logger.js";

/**
 * Safely wraps business data to ensure it's always an array
 * Based on research from https://www.meticulous.ai/blog/how-to-prevent-typeerror-cannot-read-property-map-of-undefined
 * and https://www.ggorantala.dev/how-to-prevent-cannot-read-property-map-of-undefined/
 */
export const safeBusinessWrapper = (data, context = "unknown") => {
	// Check for null/undefined
	if (!data) {
		logger.warn(`[safeBusinessWrapper:${context}] Data is null/undefined, returning empty array`);
		return [];
	}

	// Check if data is a Promise (most critical check)
	if (data instanceof Promise) {
		logger.error(`[safeBusinessWrapper:${context}] Data is a Promise object - async data not properly awaited`);
		if (process.env.NODE_ENV === "development") {
			console.trace(`Promise detected in ${context}:`);
		}
		return [];
	}

	// Check for Promise-like objects (thenable)
	if (data && typeof data.then === "function") {
		logger.error(`[safeBusinessWrapper:${context}] Data is a Promise-like object with .then method`);
		if (process.env.NODE_ENV === "development") {
			console.trace(`Promise-like object detected in ${context}:`);
		}
		return [];
	}

	// Check if data is an array
	if (!Array.isArray(data)) {
		logger.error(`[safeBusinessWrapper:${context}] Data is not an array, received:`, typeof data, data);

		// Try to convert array-like objects
		if (data && typeof data === "object" && typeof data.length === "number") {
			try {
				logger.warn(`[safeBusinessWrapper:${context}] Converting array-like object to array`);
				return Array.from(data);
			} catch (conversionError) {
				logger.error(`[safeBusinessWrapper:${context}] Failed to convert to array:`, conversionError);
				return [];
			}
		}

		// If it's an object with a data property, try that
		if (data && typeof data === "object" && Array.isArray(data.data)) {
			logger.warn(`[safeBusinessWrapper:${context}] Using data.data property`);
			return data.data;
		}

		// If it's an object with a businesses property, try that
		if (data && typeof data === "object" && Array.isArray(data.businesses)) {
			logger.warn(`[safeBusinessWrapper:${context}] Using data.businesses property`);
			return data.businesses;
		}

		logger.error(`[safeBusinessWrapper:${context}] Cannot convert to array, returning empty array`);
		return [];
	}

	// Validate array contents
	const validBusinesses = data.filter((item, index) => {
		if (!item || typeof item !== "object") {
			logger.warn(`[safeBusinessWrapper:${context}] Invalid business item at index ${index}:`, item);
			return false;
		}

		// Check if any array item is a Promise (critical for preventing cascade errors)
		if (item instanceof Promise) {
			logger.error(`[safeBusinessWrapper:${context}] Found Promise object at index ${index} - async data not resolved`);
			return false;
		}

		// Check for Promise-like objects in array items
		if (item && typeof item.then === "function") {
			logger.error(`[safeBusinessWrapper:${context}] Found Promise-like object at index ${index}`);
			return false;
		}

		// Basic business object validation
		if (!item.id && !item.name) {
			logger.warn(`[safeBusinessWrapper:${context}] Business missing id and name at index ${index}:`, item);
			return false;
		}

		return true;
	});

	if (validBusinesses.length !== data.length) {
		logger.warn(`[safeBusinessWrapper:${context}] Filtered ${data.length - validBusinesses.length} invalid business items`);
	}

	return validBusinesses;
};

/**
 * Creates a safe version of a business store method
 */
export const createSafeBusinessMethod = (originalMethod, methodName) => {
	return async (...args) => {
		try {
			const result = await originalMethod(...args);
			return safeBusinessWrapper(result, methodName);
		} catch (error) {
			logger.error(`[createSafeBusinessMethod:${methodName}] Error:`, error);
			return [];
		}
	};
};

/**
 * Validates business data before passing to sorting/filtering functions
 */
export const validateBusinessData = (data, functionName) => {
	const context = `${functionName}_validation`;

	// Primary safety check
	const safeData = safeBusinessWrapper(data, context);

	if (safeData.length === 0 && data && data.length > 0) {
		logger.error(`[validateBusinessData:${functionName}] All business data was filtered out as invalid`);
	}

	return safeData;
};

/**
 * Emergency fallback for when all else fails
 */
export const emergencyBusinessFallback = (context = "unknown") => {
	logger.critical(`[emergencyBusinessFallback:${context}] Using emergency fallback - no valid business data available`);

	return [
		{
			id: "fallback-1",
			name: "Sample Business",
			description: "This is a fallback business entry",
			categories: ["General"],
			ratings: { overall: 0 },
			reviewCount: 0,
			address: "Address not available",
			coordinates: { lat: 37.7749, lng: -122.4194 },
			isOpenNow: false,
			price: "$$",
			statusMessage: "Data loading...",
			isSponsored: false,
		},
	];
};

export default {
	safeBusinessWrapper,
	createSafeBusinessMethod,
	validateBusinessData,
	emergencyBusinessFallback,
};
