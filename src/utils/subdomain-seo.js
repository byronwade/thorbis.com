// REQUIRED: Subdomain SEO Optimization Utilities
// Location-specific SEO optimization for LocalHub subdomains with performance-first approach

import logger from "./logger.js";

/**
 * Generate comprehensive SEO metadata for subdomain pages
 */
export function generateSubdomainSeoMetadata(localHub, pageType = "home", additionalData = {}) {
	const startTime = performance.now();

	try {
		const baseMetadata = {
			// Core Meta Tags
			title: generateSeoTitle(localHub, pageType, additionalData),
			description: generateSeoDescription(localHub, pageType, additionalData),
			keywords: generateSeoKeywords(localHub, pageType, additionalData),

			// Open Graph Tags
			openGraph: {
				title: generateSeoTitle(localHub, pageType, additionalData),
				description: generateSeoDescription(localHub, pageType, additionalData),
				url: `https://${localHub.full_domain}${getPagePath(pageType, additionalData)}`,
				siteName: localHub.name,
				type: "website",
				locale: "en_US",
				images: generateOgImages(localHub, pageType, additionalData),
			},

			// Twitter Card
			twitter: {
				card: "summary_large_image",
				title: generateSeoTitle(localHub, pageType, additionalData),
				description: generateSeoDescription(localHub, pageType, additionalData),
				site: "@localhub",
				creator: "@localhub",
				images: generateOgImages(localHub, pageType, additionalData),
			},

			// Additional Meta Tags
			other: {
				"geo.region": `${localHub.country}-${localHub.state}`,
				"geo.placename": localHub.city,
				"geo.position": localHub.latitude && localHub.longitude ? `${localHub.latitude};${localHub.longitude}` : undefined,
				ICBM: localHub.latitude && localHub.longitude ? `${localHub.latitude}, ${localHub.longitude}` : undefined,
				"DC.title": generateSeoTitle(localHub, pageType, additionalData),
				"DC.creator": localHub.name,
				"DC.subject": `Local businesses in ${localHub.city}, ${localHub.state}`,
				"DC.description": generateSeoDescription(localHub, pageType, additionalData),
				"DC.publisher": "LocalHub",
				"DC.language": "en",
				"DC.coverage": `${localHub.city}, ${localHub.state}, ${localHub.country}`,
			},

			// Canonical URL
			alternates: {
				canonical: `https://${localHub.full_domain}${getPagePath(pageType, additionalData)}`,
			},

			// Robots
			robots: {
				index: localHub.status === "active",
				follow: localHub.status === "active",
				nocache: false,
				googleBot: {
					index: localHub.status === "active",
					follow: localHub.status === "active",
					"max-video-preview": -1,
					"max-image-preview": "large",
					"max-snippet": -1,
				},
			},
		};

		// Add JSON-LD structured data
		baseMetadata.structured = generateStructuredData(localHub, pageType, additionalData);

		const duration = performance.now() - startTime;
		logger.performance(`SEO metadata generated in ${duration.toFixed(2)}ms`);

		return baseMetadata;
	} catch (error) {
		logger.error("Failed to generate SEO metadata:", error);
		return getDefaultMetadata(localHub);
	}
}

/**
 * Generate SEO-optimized title for different page types
 */
function generateSeoTitle(localHub, pageType, additionalData) {
	const cityState = `${localHub.city}, ${localHub.state}`;

	const titleTemplates = {
		home: `${localHub.name} - Local Business Directory in ${cityState}`,
		businesses: `Local Businesses in ${cityState} - ${localHub.name}`,
		business: additionalData.business ? `${additionalData.business.name} - ${additionalData.business.category || "Business"} in ${cityState}` : `Business Directory - ${localHub.name}`,
		category: additionalData.category ? `${additionalData.category.name} in ${cityState} - ${localHub.name}` : `Business Categories - ${localHub.name}`,
		search: additionalData.searchQuery ? `"${additionalData.searchQuery}" in ${cityState} - ${localHub.name}` : `Search Local Businesses in ${cityState}`,
		about: `About ${localHub.name} - Local Business Directory`,
		contact: `Contact ${localHub.name} - Local Business Directory`,
	};

	let title = titleTemplates[pageType] || titleTemplates.home;

	// Ensure title is within optimal length (50-60 characters)
	if (title.length > 60) {
		title = title.substring(0, 57) + "...";
	}

	return title;
}

/**
 * Generate SEO-optimized description
 */
function generateSeoDescription(localHub, pageType, additionalData) {
	const cityState = `${localHub.city}, ${localHub.state}`;

	const descriptionTemplates = {
		home: localHub.description || `Discover the best local businesses in ${cityState}. ${localHub.name} features verified reviews, photos, hours, and contact information for businesses near you.`,
		businesses: `Browse all local businesses in ${cityState}. Find restaurants, services, shops, and more with reviews, ratings, and contact details on ${localHub.name}.`,
		business: additionalData.business ? `${additionalData.business.name} in ${cityState}. ${additionalData.business.description || `Find reviews, hours, contact info, and more on ${localHub.name}.`}` : `Detailed business information and reviews in ${cityState} on ${localHub.name}.`,
		category: additionalData.category ? `Find the best ${additionalData.category.name.toLowerCase()} in ${cityState}. Compare reviews, ratings, and services on ${localHub.name}.` : `Browse business categories in ${cityState} on ${localHub.name}.`,
		search: additionalData.searchQuery ? `Search results for "${additionalData.searchQuery}" in ${cityState}. Find local businesses with reviews and ratings on ${localHub.name}.` : `Search local businesses in ${cityState} with ${localHub.name}.`,
		about: `Learn about ${localHub.name}, your local business directory for ${cityState}. ${localHub.description || "Connecting community with local businesses."}`,
		contact: `Get in touch with ${localHub.name}. Contact information and support for your local business directory in ${cityState}.`,
	};

	let description = descriptionTemplates[pageType] || descriptionTemplates.home;

	// Ensure description is within optimal length (150-160 characters)
	if (description.length > 160) {
		description = description.substring(0, 157) + "...";
	}

	return description;
}

/**
 * Generate SEO keywords
 */
function generateSeoKeywords(localHub, pageType, additionalData) {
	const baseKeywords = [localHub.city, `${localHub.city} ${localHub.state}`, `local businesses ${localHub.city}`, `business directory ${localHub.city}`, `${localHub.city} reviews`, `${localHub.city} directory`, `local services ${localHub.city}`, `${localHub.city} business listings`];

	const pageKeywords = {
		businesses: ["local businesses", "business directory", "local directory", "business listings", "local services"],
		business: additionalData.business ? [additionalData.business.name, additionalData.business.category, `${additionalData.business.name} ${localHub.city}`, `${additionalData.business.category} ${localHub.city}`] : [],
		category: additionalData.category ? [additionalData.category.name, `${additionalData.category.name} ${localHub.city}`, `local ${additionalData.category.name}`, `${additionalData.category.name} directory`] : [],
	};

	const keywords = [...baseKeywords, ...(pageKeywords[pageType] || []), ...(localHub.meta_keywords || [])];

	// Remove duplicates and filter empty values
	return [...new Set(keywords.filter(Boolean))];
}

/**
 * Generate Open Graph images
 */
function generateOgImages(localHub, pageType, additionalData) {
	const images = [];

	// Business-specific image
	if (pageType === "business" && additionalData.business?.photos?.length > 0) {
		images.push({
			url: additionalData.business.photos[0],
			width: 1200,
			height: 630,
			alt: `${additionalData.business.name} in ${localHub.city}`,
		});
	}

	// Hub banner image
	if (localHub.banner_url) {
		images.push({
			url: localHub.banner_url,
			width: 1200,
			height: 630,
			alt: `${localHub.name} - Local Business Directory`,
		});
	}

	// Default fallback image
	if (images.length === 0) {
		images.push({
			url: `https://${localHub.full_domain}/api/og-image?title=${encodeURIComponent(localHub.name)}&location=${encodeURIComponent(`${localHub.city}, ${localHub.state}`)}`,
			width: 1200,
			height: 630,
			alt: `${localHub.name} - Local Business Directory in ${localHub.city}, ${localHub.state}`,
		});
	}

	return images;
}

/**
 * Generate structured data (JSON-LD)
 */
function generateStructuredData(localHub, pageType, additionalData) {
	const baseStructuredData = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: localHub.name,
		url: `https://${localHub.full_domain}`,
		description: localHub.description,
		address: {
			"@type": "PostalAddress",
			addressLocality: localHub.city,
			addressRegion: localHub.state,
			addressCountry: localHub.country,
		},
		areaServed: {
			"@type": "City",
			name: localHub.city,
			containedInPlace: {
				"@type": "State",
				name: localHub.state,
			},
		},
		sameAs: Object.values(localHub.social_links || {}),
	};

	// Add geographic coordinates if available
	if (localHub.latitude && localHub.longitude) {
		baseStructuredData.geo = {
			"@type": "GeoCoordinates",
			latitude: localHub.latitude,
			longitude: localHub.longitude,
		};
	}

	// Page-specific structured data
	const pageStructuredData = {
		business: generateBusinessStructuredData(additionalData.business, localHub),
		category: generateCategoryStructuredData(additionalData.category, localHub),
		search: generateSearchStructuredData(additionalData, localHub),
	};

	return [baseStructuredData, ...(pageStructuredData[pageType] ? [pageStructuredData[pageType]] : [])];
}

/**
 * Generate business-specific structured data
 */
export function generateBusinessStructuredData(business, localHub) {
	if (!business) return null;

	return {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": `https://${localHub.full_domain}/biz/${business.slug}`,
		name: business.name,
		description: business.description,
		url: business.website,
		telephone: business.phone,
		address: {
			"@type": "PostalAddress",
			streetAddress: business.address,
			addressLocality: business.city,
			addressRegion: business.state,
			postalCode: business.zip_code,
			addressCountry: business.country || "US",
		},
		geo:
			business.latitude && business.longitude
				? {
						"@type": "GeoCoordinates",
						latitude: business.latitude,
						longitude: business.longitude,
					}
				: undefined,
		aggregateRating: business.rating
			? {
					"@type": "AggregateRating",
					ratingValue: business.rating,
					reviewCount: business.review_count,
					bestRating: 5,
					worstRating: 1,
				}
			: undefined,
		image: business.photos?.length > 0 ? business.photos : undefined,
		priceRange: business.price_range,
		paymentAccepted: business.payment_methods?.join(", "),
		openingHours: formatOpeningHours(business.hours),
	};
}

/**
 * Generate category-specific structured data
 */
export function generateCategoryStructuredData(category, localHub) {
	if (!category) return null;

	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: `${category.name} in ${localHub.city}, ${localHub.state}`,
		description: `Directory of ${category.name.toLowerCase()} businesses in ${localHub.city}, ${localHub.state}`,
		url: `https://${localHub.full_domain}/categories/${category.slug}`,
		isPartOf: {
			"@type": "WebSite",
			name: localHub.name,
			url: `https://${localHub.full_domain}`,
		},
		about: {
			"@type": "Thing",
			name: category.name,
			description: category.description,
		},
	};
}

/**
 * Generate search-specific structured data
 */
export function generateSearchStructuredData(additionalData, localHub) {
	if (!additionalData.searchQuery) return null;

	return {
		"@context": "https://schema.org",
		"@type": "SearchResultsPage",
		name: `Search results for "${additionalData.searchQuery}" in ${localHub.city}, ${localHub.state}`,
		url: `https://${localHub.full_domain}/search?q=${encodeURIComponent(additionalData.searchQuery)}`,
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: additionalData.resultCount || 0,
			itemListElement: (additionalData.results || []).slice(0, 10).map((business, index) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "LocalBusiness",
					name: business.name,
					url: `https://${localHub.full_domain}/biz/${business.slug}`,
				},
			})),
		},
	};
}

/**
 * Get page path for different page types
 */
function getPagePath(pageType, additionalData) {
	const paths = {
		home: "",
		businesses: "/businesses",
		business: additionalData.business ? `/biz/${additionalData.business.slug}` : "/businesses",
		category: additionalData.category ? `/categories/${additionalData.category.slug}` : "/categories",
		search: additionalData.searchQuery ? `/search?q=${encodeURIComponent(additionalData.searchQuery)}` : "/search",
		about: "/about",
		contact: "/contact",
	};

	return paths[pageType] || "";
}

/**
 * Format opening hours for structured data
 */
function formatOpeningHours(hours) {
	if (!hours || typeof hours !== "object") return undefined;

	const dayMap = {
		monday: "Mo",
		tuesday: "Tu",
		wednesday: "We",
		thursday: "Th",
		friday: "Fr",
		saturday: "Sa",
		sunday: "Su",
	};

	const formattedHours = [];

	Object.entries(hours).forEach(([day, schedule]) => {
		if (schedule && schedule.open && schedule.close) {
			const dayCode = dayMap[day.toLowerCase()];
			if (dayCode) {
				formattedHours.push(`${dayCode} ${schedule.open}-${schedule.close}`);
			}
		}
	});

	return formattedHours.length > 0 ? formattedHours : undefined;
}

/**
 * Get default metadata when generation fails
 */
function getDefaultMetadata(localHub) {
	return {
		title: `${localHub.name} - Local Business Directory`,
		description: `Discover local businesses in ${localHub.city}, ${localHub.state} on ${localHub.name}.`,
		keywords: [localHub.city, "local businesses", "business directory"],
		openGraph: {
			title: `${localHub.name} - Local Business Directory`,
			description: `Discover local businesses in ${localHub.city}, ${localHub.state}.`,
			url: `https://${localHub.full_domain}`,
			siteName: localHub.name,
			type: "website",
		},
		twitter: {
			card: "summary",
			title: `${localHub.name} - Local Business Directory`,
			description: `Discover local businesses in ${localHub.city}, ${localHub.state}.`,
		},
	};
}

/**
 * Generate sitemap data for subdomain
 */
// Export alias for backwards compatibility
export const generateSubdomainMetadata = generateSubdomainSeoMetadata;

export function generateSubdomainSitemap(localHub, businesses = [], categories = []) {
	const baseUrl = `https://${localHub.full_domain}`;

	const urls = [
		{
			url: baseUrl,
			lastModified: localHub.updated_at,
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/businesses`,
			lastModified: localHub.updated_at,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/categories`,
			lastModified: localHub.updated_at,
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];

	// Add business pages
	businesses.forEach((business) => {
		urls.push({
			url: `${baseUrl}/biz/${business.slug}`,
			lastModified: business.updated_at,
			changeFrequency: "weekly",
			priority: 0.7,
		});
	});

	// Add category pages
	categories.forEach((category) => {
		urls.push({
			url: `${baseUrl}/categories/${category.slug}`,
			lastModified: localHub.updated_at,
			changeFrequency: "weekly",
			priority: 0.6,
		});
	});

	return urls;
}

/**
 * Generate robots.txt content for subdomain
 */
export function generateSubdomainRobots(localHub) {
	const baseUrl = `https://${localHub.full_domain}`;

	if (localHub.status !== "active") {
		return `User-agent: *
Disallow: /

# This subdomain is not yet active
`;
	}

	return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /private/

# Allow important pages
Allow: /
Allow: /businesses
Allow: /categories
Allow: /biz/
Allow: /search
`;
}

/**
 * Generate subdomain-specific structured data
 */
export function generateSubdomainStructuredData(localHub, pageType = "home", additionalData = {}) {
	return generateStructuredData(localHub, pageType, additionalData);
}

// Functions are already exported above as they are defined
