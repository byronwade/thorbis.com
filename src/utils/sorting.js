import logger from "./logger.js";
import { validateBusinessData } from "./business-data-safety-wrapper";

// Sort options configuration
export const SORT_OPTIONS = {
	RELEVANCE: "relevance",
	RATING: "rating",
	DISTANCE: "distance",
	REVIEWS: "reviews",
	NAME: "name",
	PRICE: "price",
	NEWEST: "newest",
	OLDEST: "oldest",
};

// Sort option labels
export const SORT_LABELS = {
	[SORT_OPTIONS.RELEVANCE]: "Relevance",
	[SORT_OPTIONS.RATING]: "Highest Rated",
	[SORT_OPTIONS.DISTANCE]: "Nearest",
	[SORT_OPTIONS.REVIEWS]: "Most Reviews",
	[SORT_OPTIONS.NAME]: "Name A-Z",
	[SORT_OPTIONS.PRICE]: "Price (Low to High)",
	[SORT_OPTIONS.NEWEST]: "Newest First",
	[SORT_OPTIONS.OLDEST]: "Oldest First",
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

// Get business rating for sorting
const getBusinessRating = (business) => {
	if (business.ratings?.overall) return business.ratings.overall;
	if (business.rating) return business.rating;
	return 0;
};

// Get business review count for sorting
const getBusinessReviewCount = (business) => {
	if (business.ratings?.total) return business.ratings.total;
	if (business.reviewCount) return business.reviewCount;
	if (business.reviews?.length) return business.reviews.length;
	return 0;
};

// Get business price level for sorting
const getBusinessPriceLevel = (business) => {
	if (business.priceLevel) return business.priceLevel;
	if (business.price) return business.price;
	return 0;
};

// Get business creation date for sorting
const getBusinessDate = (business) => {
	if (business.createdAt) return new Date(business.createdAt);
	if (business.dateCreated) return new Date(business.dateCreated);
	if (business.established) return new Date(business.established);
	return new Date(0); // Default to epoch if no date
};

// Synchronous error wrapper for sorting functions
const withSyncErrorHandling = (fn, functionName) => {
	return (...args) => {
		try {
			const result = fn(...args);

			// CRITICAL: Validate the result is not a Promise
			if (result instanceof Promise) {
				logger.error(`[${functionName}] Function returned a Promise instead of an array!`);
				logger.error(`[${functionName}] This should never happen - sync function returning Promise`);
				return [];
			}

			if (result && typeof result.then === "function") {
				logger.error(`[${functionName}] Function returned a Promise-like object!`);
				return [];
			}

			// Validate result is an array
			if (!Array.isArray(result)) {
				logger.error(`[${functionName}] Function returned non-array result:`, typeof result);
				logger.error(`[${functionName}] Result value:`, JSON.stringify(result, null, 2));
				return [];
			}

			return result;
		} catch (error) {
			logger.error(`[${functionName}] Error in function:`, error);
			logger.error(`[${functionName}] Error stack:`, error.stack);
			// Always return an empty array for sorting/filtering functions
			return [];
		}
	};
};

// Main sorting function
export const sortBusinesses = withSyncErrorHandling((businesses, sortBy, userLocation = null) => {
	// Early validation for null/undefined/Promise inputs
	if (!businesses) {
		logger.warn("[sortBusinesses] Received null/undefined businesses data");
		return [];
	}

	if (businesses instanceof Promise) {
		logger.error("[sortBusinesses] Received Promise object - async data not properly awaited");
		if (process.env.NODE_ENV === "development") {
			console.trace("Promise passed to sortBusinesses:");
		}
		return [];
	}

	if (businesses && typeof businesses.then === "function") {
		logger.error("[sortBusinesses] Received Promise-like object");
		return [];
	}

	// CRITICAL: Use safety wrapper to prevent Promise/undefined errors
	const safeBusinesses = validateBusinessData(businesses, "sortBusinesses");

	// If safety wrapper returns empty array, log and return early
	if (safeBusinesses.length === 0) {
		if (businesses && Array.isArray(businesses) && businesses.length > 0) {
			logger.error("[sortBusinesses] All business data was invalid or filtered out");
		} else {
			logger.debug("[sortBusinesses] No valid business data to sort");
		}
		return [];
	}

	const sortedBusinesses = [...safeBusinesses];

	switch (sortBy) {
		case SORT_OPTIONS.RELEVANCE:
			// Relevance sorting (sponsored first, then by rating)
			return sortedBusinesses.sort((a, b) => {
				// Sponsored businesses first
				if (a.isSponsored && !b.isSponsored) return -1;
				if (!a.isSponsored && b.isSponsored) return 1;

				// Then by rating
				const ratingA = getBusinessRating(a);
				const ratingB = getBusinessRating(b);
				return ratingB - ratingA;
			});

		case SORT_OPTIONS.RATING:
			// Sort by rating (highest first)
			return sortedBusinesses.sort((a, b) => {
				const ratingA = getBusinessRating(a);
				const ratingB = getBusinessRating(b);

				if (ratingA === ratingB) {
					// If ratings are equal, sort by review count
					const reviewsA = getBusinessReviewCount(a);
					const reviewsB = getBusinessReviewCount(b);
					return reviewsB - reviewsA;
				}

				return ratingB - ratingA;
			});

		case SORT_OPTIONS.DISTANCE:
			// Sort by distance (nearest first)
			if (!userLocation) {
				// If no user location, fall back to relevance
				return sortBusinesses(sortedBusinesses, SORT_OPTIONS.RELEVANCE);
			}

			return sortedBusinesses.sort((a, b) => {
				const distanceA = a.coordinates ? calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng) : Infinity;
				const distanceB = b.coordinates ? calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng) : Infinity;

				return distanceA - distanceB;
			});

		case SORT_OPTIONS.REVIEWS:
			// Sort by review count (most reviews first)
			return sortedBusinesses.sort((a, b) => {
				const reviewsA = getBusinessReviewCount(a);
				const reviewsB = getBusinessReviewCount(b);

				if (reviewsA === reviewsB) {
					// If review counts are equal, sort by rating
					const ratingA = getBusinessRating(a);
					const ratingB = getBusinessRating(b);
					return ratingB - ratingA;
				}

				return reviewsB - reviewsA;
			});

		case SORT_OPTIONS.NAME:
			// Sort alphabetically by name
			return sortedBusinesses.sort((a, b) => {
				const nameA = (a.name || "").toLowerCase();
				const nameB = (b.name || "").toLowerCase();
				return nameA.localeCompare(nameB);
			});

		case SORT_OPTIONS.PRICE:
			// Sort by price level (lowest first)
			return sortedBusinesses.sort((a, b) => {
				const priceA = getBusinessPriceLevel(a);
				const priceB = getBusinessPriceLevel(b);
				return priceA - priceB;
			});

		case SORT_OPTIONS.NEWEST:
			// Sort by creation date (newest first)
			return sortedBusinesses.sort((a, b) => {
				const dateA = getBusinessDate(a);
				const dateB = getBusinessDate(b);
				return dateB - dateA;
			});

		case SORT_OPTIONS.OLDEST:
			// Sort by creation date (oldest first)
			return sortedBusinesses.sort((a, b) => {
				const dateA = getBusinessDate(a);
				const dateB = getBusinessDate(b);
				return dateA - dateB;
			});

		default:
			// Default to relevance sorting
			return sortBusinesses(sortedBusinesses, SORT_OPTIONS.RELEVANCE);
	}
}, "sortBusinesses");

// Filter businesses based on criteria
export const filterBusinesses = withSyncErrorHandling((businesses, filters) => {
	// Early validation for null/undefined/Promise inputs
	if (!businesses) {
		logger.warn("[filterBusinesses] Received null/undefined businesses data");
		return [];
	}

	if (businesses instanceof Promise) {
		logger.error("[filterBusinesses] Received Promise object - async data not properly awaited");
		return [];
	}

	if (businesses && typeof businesses.then === "function") {
		logger.error("[filterBusinesses] Received Promise-like object");
		return [];
	}

	// CRITICAL: Use safety wrapper first
	const safeBusinesses = validateBusinessData(businesses, "filterBusinesses");

	// If safety wrapper returns empty array, return early
	if (safeBusinesses.length === 0) {
		return [];
	}

	return safeBusinesses.filter((business) => {
		// Keywords filter
		if (filters.keywords) {
			const keywords = filters.keywords.toLowerCase();
			const searchableText = [business.name, business.description, business.categories?.join(" "), business.tags?.join(" ")].filter(Boolean).join(" ").toLowerCase();

			if (!searchableText.includes(keywords)) {
				return false;
			}
		}

		// Rating filter
		if (filters.rating && filters.rating.length === 2) {
			const [minRating, maxRating] = filters.rating;
			const businessRating = getBusinessRating(business);

			if (businessRating < minRating || businessRating > maxRating) {
				return false;
			}
		}

		// Distance filter (if user location is available)
		if (filters.distance && filters.distance.length === 2 && filters.userLocation) {
			const [minDistance, maxDistance] = filters.distance;
			const distance = calculateDistance(filters.userLocation.lat, filters.userLocation.lng, business.coordinates?.lat, business.coordinates?.lng);

			if (distance < minDistance || distance > maxDistance) {
				return false;
			}
		}

		// Price range filter
		if (filters.priceRange && filters.priceRange.length === 2) {
			const [minPrice, maxPrice] = filters.priceRange;
			const businessPrice = getBusinessPriceLevel(business);

			if (businessPrice < minPrice || businessPrice > maxPrice) {
				return false;
			}
		}

		// Categories filter
		if (filters.categories && filters.categories.length > 0) {
			const businessCategories = business.categories || [];
			const hasMatchingCategory = filters.categories.some((category) => businessCategories.some((businessCategory) => businessCategory.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(businessCategory.toLowerCase())));

			if (!hasMatchingCategory) {
				return false;
			}
		}

		// Open now filter
		if (filters.openNow) {
			if (!business.isOpen) {
				return false;
			}
		}

		// Verified filter
		if (filters.verified) {
			if (!business.isVerified) {
				return false;
			}
		}

		// Sponsored filter
		if (filters.sponsored) {
			if (!business.isSponsored) {
				return false;
			}
		}

		return true;
	});
}, "filterBusinesses");

// Combined filter and sort function
export const filterAndSortBusinesses = withSyncErrorHandling((businesses, filters, sortBy, userLocation = null) => {
	// Early validation for null/undefined/Promise inputs
	if (!businesses) {
		logger.warn("[filterAndSortBusinesses] Received null/undefined businesses data");
		return [];
	}

	if (businesses instanceof Promise) {
		logger.error("[filterAndSortBusinesses] Received Promise object - async data not properly awaited");
		if (process.env.NODE_ENV === "development") {
			console.trace("Promise passed to filterAndSortBusinesses:");
		}
		return [];
	}

	if (businesses && typeof businesses.then === "function") {
		logger.error("[filterAndSortBusinesses] Received Promise-like object");
		return [];
	}

	if (!Array.isArray(businesses)) {
		logger.error("[filterAndSortBusinesses] Businesses is not an array:", typeof businesses);
		return [];
	}

	// Validate array items are not Promises
	const hasPromises = businesses.some((business) => business instanceof Promise || (business && typeof business.then === "function"));

	if (hasPromises) {
		logger.error("[filterAndSortBusinesses] Array contains Promise objects");
		// Filter out Promise objects
		const validBusinesses = businesses.filter((business) => !(business instanceof Promise) && !(business && typeof business.then === "function"));
		logger.warn(`[filterAndSortBusinesses] Filtered out ${businesses.length - validBusinesses.length} Promise objects`);

		if (validBusinesses.length === 0) {
			return [];
		}

		// Continue with valid businesses
		const filteredBusinesses = filterBusinesses(validBusinesses, { ...filters, userLocation });
		return sortBusinesses(filteredBusinesses, sortBy, userLocation);
	}

	// First filter the businesses
	const filteredBusinesses = filterBusinesses(businesses, { ...filters, userLocation });

	// Then sort the filtered results
	return sortBusinesses(filteredBusinesses, sortBy, userLocation);
}, "filterAndSortBusinesses");

// Get sort option display info
export const getSortOptionInfo = (sortBy) => {
	return {
		value: sortBy,
		label: SORT_LABELS[sortBy] || "Unknown",
		icon: getSortIcon(sortBy),
	};
};

// Get icon for sort option
const getSortIcon = (sortBy) => {
	switch (sortBy) {
		case SORT_OPTIONS.RATING:
			return "⭐";
		case SORT_OPTIONS.DISTANCE:
			return "📍";
		case SORT_OPTIONS.REVIEWS:
			return "📝";
		case SORT_OPTIONS.NAME:
			return "🔤";
		case SORT_OPTIONS.PRICE:
			return "💰";
		case SORT_OPTIONS.NEWEST:
			return "🆕";
		case SORT_OPTIONS.OLDEST:
			return "📅";
		default:
			return "🎯";
	}
};
