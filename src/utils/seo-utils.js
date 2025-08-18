// lib/utils/seoUtils.js - SEO utilities
import { logger } from "@utils/logger";
import { StructuredDataGenerator } from "./structured-data-schemas";

// Canonical structured data generator (single source of truth)
const schemaGen = new StructuredDataGenerator({
	name: "Thorbis",
	url: process.env.NEXT_PUBLIC_BASE_URL || "https://thorbis.com",
	organization: "ByteRover LLC",
});

// Delegate structured data helpers to the canonical generator
export const generateBusinessStructuredData = (business) => schemaGen.generateLocalBusinessSchema?.(business) || null;
export const generateBreadcrumbStructuredData = (breadcrumbs) => schemaGen.generateBreadcrumbListSchema?.(breadcrumbs) || null;
export const generateSearchResultsStructuredData = (searchQuery, results, totalResults) =>
	schemaGen.generateSearchResultsPageSchema?.({ query: searchQuery, results, totalResults }) || null;
export const generateOrganizationStructuredData = () => schemaGen.generateOrganizationSchema();
export const generateFAQStructuredData = (faqs) => schemaGen.generateFAQPageSchema?.({ questions: faqs }) || null;

// Generate comprehensive meta tags
export const generateMetaTags = ({ title, description, keywords = [], canonicalUrl, ogImage, ogType = "website", twitterCard = "summary_large_image", noindex = false, structuredData = null }) => {
	const metaTags = [
		// Basic meta tags
		{ name: "description", content: description },
		{ name: "keywords", content: keywords.join(", ") },
		{ name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" },

		// Open Graph tags
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:type", content: ogType },
		{ property: "og:url", content: canonicalUrl },
		{ property: "og:site_name", content: "Thorbis" },

		// Twitter tags
		{ name: "twitter:card", content: twitterCard },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:site", content: "@thorbis" },

		// Additional meta tags
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
		{ name: "author", content: "Thorbis" },
		{ httpEquiv: "content-language", content: "en-US" },
	];

	// Add image tags if provided
	if (ogImage) {
		metaTags.push({ property: "og:image", content: ogImage }, { property: "og:image:alt", content: title }, { name: "twitter:image", content: ogImage }, { name: "twitter:image:alt", content: title });
	}

	// Add canonical URL
	if (canonicalUrl) {
		metaTags.push({ rel: "canonical", href: canonicalUrl });
	}

	return {
		title,
		metaTags: metaTags.filter((tag) => tag.content && tag.content.trim() !== ""),
		structuredData,
	};
};

// SEO-optimized URL generator
export const generateSEOUrl = (text, maxLength = 60) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
		.substring(0, maxLength)
		.replace(/-+$/, ""); // Remove trailing hyphen if truncated
};

// Generate meta description from business data
export const generateBusinessMetaDescription = (business) => {
	if (!business) return "";

	const rating = business.ratings?.overall || business.rating;
	const reviewCount = business.reviewCount || 0;
	const categories = business.categories?.join(", ") || "business";

	let description = `${business.name} - ${categories}`;

	if (rating && reviewCount > 0) {
		description += ` with ${rating} star rating from ${reviewCount} reviews`;
	}

	if (business.address) {
		const city = business.address.split(",")[1]?.trim();
		if (city) {
			description += ` located in ${city}`;
		}
	}

	if (business.description) {
		const shortDesc = business.description.substring(0, 100);
		description += `. ${shortDesc}`;
	}

	// Ensure description is under 160 characters
	return description.length > 160 ? description.substring(0, 157) + "..." : description;
};

// Generate keywords from business data
export const generateBusinessKeywords = (business) => {
	if (!business) return [];

	const keywords = [];

	// Add business name
	keywords.push(business.name);

	// Add categories
	if (business.categories) {
		keywords.push(...business.categories);
	}

	// Add location-based keywords
	if (business.address) {
		const addressParts = business.address.split(",");
		const city = addressParts[1]?.trim();
		const state = addressParts[2]?.trim()?.split(" ")[0];

		if (city) keywords.push(city);
		if (state) keywords.push(state);

		// Add location + service combinations
		if (business.categories) {
			business.categories.forEach((category) => {
				if (city) keywords.push(`${category} ${city}`);
				if (state) keywords.push(`${category} ${state}`);
			});
		}
	}

	// Add service-related keywords
	keywords.push("local business", "reviews", "ratings");

	return [...new Set(keywords.filter((k) => k && k.trim() !== ""))];
};

// Performance and SEO monitoring
export const trackSEOMetrics = (pageData) => {
	if (typeof window === "undefined") return;

	// Track Core Web Vitals for SEO
	if ("PerformanceObserver" in window) {
		const observer = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				// Log SEO-relevant metrics
				if (entry.entryType === "largest-contentful-paint") {
					logger.debug("LCP for SEO:", entry.startTime);
				}
				if (entry.entryType === "first-input") {
					logger.debug("FID for SEO:", entry.processingStart - entry.startTime);
				}
			});
		});

		try {
			observer.observe({ entryTypes: ["largest-contentful-paint", "first-input"] });
		} catch (error) {
			logger.warn("SEO metrics tracking failed:", error);
		}
	}

	// Track page-specific SEO data
	logger.debug("SEO page data:", {
		url: window.location.href,
		title: document.title,
		description: document.querySelector('meta[name="description"]')?.content,
		structuredData: pageData.structuredData ? "present" : "missing",
		timestamp: Date.now(),
	});
};

export default {
	generateBusinessStructuredData,
	generateBreadcrumbStructuredData,
	generateSearchResultsStructuredData,
	generateOrganizationStructuredData,
	generateFAQStructuredData,
	generateMetaTags,
	generateSEOUrl,
	generateBusinessMetaDescription,
	generateBusinessKeywords,
	trackSEOMetrics,
};
