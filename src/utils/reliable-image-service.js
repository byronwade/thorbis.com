/**
 * Reliable Image Service
 *
 * Provides reliable image URLs with multiple fallback strategies
 * Implements best practices from Cloudinary and SatisfyHost guides
 */

const RELIABLE_PLACEHOLDER_SERVICES = [
	"https://images.unsplash.com", // Most reliable
	"https://via.placeholder.com", // Very reliable
	"https://dummyimage.com", // Backup option
];

// Local placeholder images by category (now with specific category placeholders)
const CATEGORY_PLACEHOLDERS = {
	restaurants: "/placeholder-restaurant.svg",
	"health-medical": "/placeholder-medical.svg",
	"home-services": "/placeholder-services.svg",
	"beauty-spas": "/placeholder-spa.svg",
	automotive: "/placeholder-auto.svg",
	shopping: "/placeholder-shopping.svg",
	"professional-services": "/placeholder-business.svg",
	entertainment: "/placeholder-entertainment.svg",
	default: "/placeholder-image.svg",
};

// Verified working Unsplash photo IDs for each category
const VERIFIED_UNSPLASH_PHOTOS = {
	restaurants: [
		"photo-1517248135467-4c7edcad34c4", // Restaurant interior
		"photo-1414235077428-338989a2e8c0", // Restaurant food
		"photo-1555396273-367ea4eb4db5", // Restaurant dining
	],
	"health-medical": [
		"photo-1576091160399-112ba8d25d1f", // Medical facility
		"photo-1559757148-5c350d0d3c56", // Healthcare
		"photo-1538108149393-fbbd81895907", // Medical equipment
	],
	"home-services": [
		"photo-1558618666-fcd25c85cd64", // Home renovation
		"photo-1581244277943-fe4a9c777189", // Tools
		"photo-1621905252507-b35492cc74b4", // Maintenance
	],
	"beauty-spas": [
		"photo-1560066984-138dadb4c035", // Spa
		"photo-1522337360788-8b13dee7a37e", // Beauty salon
		"photo-1487412947147-5cebf100ffc2", // Wellness
	],
	automotive: [
		"photo-1492144534655-ae79c964c9d7", // Car repair
		"photo-1486262715619-67b85e0b08d3", // Auto shop
		"photo-1615906655593-ad0386982a0f", // Vehicle service
	],
	shopping: [
		"photo-1441986300917-64674bd600d8", // Shopping mall
		"photo-1556742049-0cfed4f6a45d", // Retail store
		"photo-1555529771-835f59fc5efe", // Shopping center
	],
	"professional-services": [
		"photo-1497366216548-37526070297c", // Office
		"photo-1560472354-b33ff0c44a43", // Business meeting
		"photo-1556761175-5973dc0f32e7", // Professional workspace
	],
	entertainment: [
		"photo-1489599187715-31f2e8cec64c", // Entertainment venue
		"photo-1514525253161-7a46d19cd819", // Concert
		"photo-1598300042247-d088f8ab3a91", // Events
	],
};

/**
 * Get a reliable image URL with multiple fallback strategies
 *
 * @param {Object} options - Image options
 * @param {string} options.category - Business category
 * @param {string} options.originalUrl - Original image URL (if any)
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.businessId - Business ID for consistent images
 * @returns {string} Reliable image URL
 */
export function getReliableImageUrl({ category = "default", originalUrl = null, width = 400, height = 300, businessId = null }) {
	// If original URL exists and is not from failing services, use it
	if (originalUrl && !originalUrl.includes("loremflickr.com") && !originalUrl.includes("placeholder.com") && !originalUrl.includes("unsplash.com/photo-1560472354")) {
		// Remove the failing dynamic URLs
		return originalUrl;
	}

	// Normalize category name
	const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");

	// Try verified Unsplash photos first
	const categoryPhotos = VERIFIED_UNSPLASH_PHOTOS[normalizedCategory] || VERIFIED_UNSPLASH_PHOTOS["professional-services"];

	if (categoryPhotos && categoryPhotos.length > 0) {
		// Use business ID to get consistent image per business
		const photoIndex = businessId ? parseInt(businessId.replace(/\D/g, "")) % categoryPhotos.length : Math.floor(Math.random() * categoryPhotos.length);

		const photoId = categoryPhotos[photoIndex];
		return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&auto=format`;
	}

	// Fallback to reliable placeholder services (avoid picsum.photos due to timeouts)
	// Try via.placeholder.com first as it's very reliable
	if (width && height) {
		return `https://via.placeholder.com/${width}x${height}/1f2937/ffffff?text=Business+Image`;
	}
	
	// Final fallback to local SVG placeholder
	return getLocalPlaceholder(category);
}

/**
 * Get a local placeholder image path
 *
 * @param {string} category - Business category
 * @returns {string} Local placeholder path
 */
export function getLocalPlaceholder(category = "default") {
	const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
	return CATEGORY_PLACEHOLDERS[normalizedCategory] || CATEGORY_PLACEHOLDERS.default;
}

/**
 * Generate reliable business photos array
 *
 * @param {string} businessId - Business ID
 * @param {string} category - Business category
 * @param {number} count - Number of photos to generate
 * @returns {Array<string>} Array of reliable image URLs
 */
export function generateReliableBusinessPhotos(businessId, category = "default", count = 3) {
	return Array.from({ length: count }, (_, index) => {
		return getReliableImageUrl({
			category,
			businessId: `${businessId}-${index}`, // Ensure unique images
			width: 800,
			height: 600,
		});
	});
}

/**
 * Check if an image URL is from a problematic service
 *
 * @param {string} url - Image URL to check
 * @returns {boolean} True if URL is from problematic service
 */
export function isProblematicImageUrl(url) {
	if (!url) return false;

	const problematicServices = ["loremflickr.com", "placeholder.com", "fakeimg.pl"];

	return problematicServices.some((service) => url.includes(service));
}

/**
 * Get optimized image URL with WebP support
 *
 * @param {string} originalUrl - Original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(originalUrl, width = 400, height = 300) {
	// For Unsplash, add optimization parameters
	if (originalUrl.includes("images.unsplash.com")) {
		const baseUrl = originalUrl.split("?")[0];
		return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
	}

	// For other services, return as-is
	return originalUrl;
}

export default {
	getReliableImageUrl,
	getLocalPlaceholder,
	generateReliableBusinessPhotos,
	isProblematicImageUrl,
	getOptimizedImageUrl,
};
