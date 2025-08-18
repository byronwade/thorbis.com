/**
 * Enhanced Business Profile SEO Utilities
 * Implements comprehensive SEO strategies for business profiles
 * Based on latest SEO best practices and web search insights
 */

/**
 * Generate comprehensive JSON-LD structured data for business profiles
 * Implements multiple schema types for maximum search visibility
 */
export function generateEnhancedStructuredData(business) {
	const baseUrl = "https://thorbis.com";
	const businessUrl = `${baseUrl}/biz/${business.slug}`;

	// Enhanced LocalBusiness schema with comprehensive data
	const localBusinessSchema = {
		"@context": "https://schema.org",
		"@type": determineBusinessType(business),
		"@id": businessUrl,
		name: business.name,
		description: business.description || `${business.name} - Professional services in ${business.city}, ${business.state}`,
		url: businessUrl,
		image:
			business.business_photos?.map((photo) => ({
				"@type": "ImageObject",
				url: photo.url || photo,
				caption: `${business.name} - Business photo`,
				width: "800",
				height: "600",
			})) || [],
		logo: business.logo || business.business_photos?.[0]?.url || `${baseUrl}/placeholder-business.svg`,

		// Address and location
		address: {
			"@type": "PostalAddress",
			streetAddress: business.address,
			addressLocality: business.city,
			addressRegion: business.state,
			postalCode: business.zip_code,
			addressCountry: "US",
		},
		geo:
			business.latitude && business.longitude
				? {
						"@type": "GeoCoordinates",
						latitude: business.latitude,
						longitude: business.longitude,
					}
				: undefined,

		// Contact information
		telephone: business.phone,
		email: business.email,
		url: business.website,
		sameAs: business.social_links || [],

		// Business details
		foundingDate: business.established,
		numberOfEmployees: business.employees,
		priceRange: business.price_range || "$$",
		paymentAccepted: business.payment_methods || ["Cash", "Credit Card", "Digital Payment"],
		currenciesAccepted: "USD",

		// Operating hours
		openingHoursSpecification:
			business.business_hours
				?.map((hours) => ({
					"@type": "OpeningHoursSpecification",
					dayOfWeek: capitalizeDay(hours.day_of_week),
					opens: hours.is_closed ? undefined : hours.open_time,
					closes: hours.is_closed ? undefined : hours.close_time,
				}))
				.filter((hours) => hours.opens) || [],

		// Reviews and ratings
		aggregateRating:
			business.rating && business.review_count
				? {
						"@type": "AggregateRating",
						ratingValue: business.rating,
						reviewCount: business.review_count,
						bestRating: "5",
						worstRating: "1",
					}
				: undefined,

		// Services offered
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: `${business.name} Services`,
			itemListElement:
				business.services?.map((service, index) => ({
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: service.name || service,
						description: service.description || `Professional ${service.name || service} services`,
					},
					position: index + 1,
				})) ||
				business.categories?.map((category, index) => ({
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: category,
						description: `Professional ${category} services`,
					},
					position: index + 1,
				})) ||
				[],
		},

		// Service areas
		areaServed:
			business.service_areas?.map((area) => ({
				"@type": "City",
				name: area,
			})) || business.city
				? [
						{
							"@type": "City",
							name: business.city,
						},
					]
				: [],

		// Professional credentials
		...(business.verified && {
			hasCredential: {
				"@type": "EducationalOccupationalCredential",
				credentialCategory: "Business Verification",
				recognizedBy: {
					"@type": "Organization",
					name: "Thorbis Business Directory",
				},
			},
		}),

		// Parent organization (if applicable)
		parentOrganization: {
			"@type": "Organization",
			name: "Thorbis Business Directory",
			url: baseUrl,
		},
	};

	// Review schema for individual reviews
	const reviewSchemas =
		business.reviews?.slice(0, 5).map((review) => ({
			"@context": "https://schema.org",
			"@type": "Review",
			reviewBody: review.text || review.comment,
			reviewRating: {
				"@type": "Rating",
				ratingValue: review.rating,
				bestRating: "5",
				worstRating: "1",
			},
			author: {
				"@type": "Person",
				name: review.author || review.user?.name || "Anonymous",
			},
			datePublished: review.created_at || review.date,
			itemReviewed: {
				"@type": "LocalBusiness",
				name: business.name,
				"@id": businessUrl,
			},
		})) || [];

	// FAQ schema for better search features
	const faqSchema = business.faq?.length
		? {
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: business.faq.map((faq) => ({
					"@type": "Question",
					name: faq.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: faq.answer,
					},
				})),
			}
		: null;

	// Service-specific schemas
	const serviceSchemas =
		business.services?.slice(0, 3).map((service) => ({
			"@context": "https://schema.org",
			"@type": "Service",
			name: service.name || service,
			description: service.description || `Professional ${service.name || service} service`,
			provider: {
				"@type": "LocalBusiness",
				name: business.name,
				"@id": businessUrl,
			},
			areaServed: business.city
				? {
						"@type": "City",
						name: business.city,
					}
				: undefined,
			...(service.price && {
				offers: {
					"@type": "Offer",
					price: service.price,
					priceCurrency: "USD",
				},
			}),
		})) || [];

	// BreadcrumbList schema
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: baseUrl,
			},
			...(business.categories?.[0]
				? [
						{
							"@type": "ListItem",
							position: 2,
							name: business.categories[0],
							item: `${baseUrl}/categories/${encodeURIComponent(business.categories[0].toLowerCase())}`,
						},
					]
				: []),
			{
				"@type": "ListItem",
				position: business.categories?.[0] ? 3 : 2,
				name: business.name,
				item: businessUrl,
			},
		],
	};

	return {
		localBusiness: localBusinessSchema,
		reviews: reviewSchemas,
		faq: faqSchema,
		services: serviceSchemas,
		breadcrumbs: breadcrumbSchema,
	};
}

/**
 * Determine the most specific business type for schema.org
 */
function determineBusinessType(business) {
	const category = business.categories?.[0]?.toLowerCase() || business.business_categories?.[0]?.categories?.name?.toLowerCase() || "";

	const businessTypes = {
		restaurant: "Restaurant",
		"food service": "FoodEstablishment",
		hotel: "LodgingBusiness",
		"auto repair": "AutoRepair",
		"health care": "MedicalBusiness",
		beauty: "BeautySalon",
		fitness: "ExerciseGym",
		retail: "Store",
		plumbing: "PlumbingService",
		electrical: "ElectricalService",
		cleaning: "CleaningService",
		landscaping: "LandscapingService",
		legal: "LegalService",
		accounting: "AccountingService",
		"real estate": "RealEstateAgent",
		automotive: "AutomotiveBusiness",
		medical: "MedicalBusiness",
		dental: "Dentist",
	};

	for (const [key, type] of Object.entries(businessTypes)) {
		if (category.includes(key)) {
			return type;
		}
	}

	return "LocalBusiness";
}

/**
 * Capitalize day of week for schema.org format
 */
function capitalizeDay(day) {
	const days = {
		monday: "Monday",
		tuesday: "Tuesday",
		wednesday: "Wednesday",
		thursday: "Thursday",
		friday: "Friday",
		saturday: "Saturday",
		sunday: "Sunday",
	};
	return days[day.toLowerCase()] || day;
}

/**
 * Generate enhanced meta tags for business profiles
 */
export function generateBusinessMetaTags(business) {
	const businessUrl = `https://thorbis.com/biz/${business.slug}`;
	const description = business.description || `${business.name} in ${business.city}, ${business.state}. Professional services with ${business.rating || 5}-star rating. Contact us today!`;

	const keywords = [business.name, business.city, business.state, ...(business.categories || []), ...(business.services?.slice(0, 5) || []), "professional services", "local business", "customer reviews"].filter(Boolean).join(", ");

	return {
		// Basic meta tags
		title: `${business.name} - ${business.city}, ${business.state} | Professional Services`,
		description: description.substring(0, 155) + (description.length > 155 ? "..." : ""),
		keywords,

		// Open Graph
		openGraph: {
			title: `${business.name} - ${business.city}, ${business.state}`,
			description: description.substring(0, 200),
			url: businessUrl,
			siteName: "Thorbis Business Directory",
			type: "website",
			locale: "en_US",
			images: [
				{
					url: business.business_photos?.[0]?.url || business.photos?.[0] || `https://thorbis.com/opengraph-image?title=${encodeURIComponent(business.name)}`,
					width: 1200,
					height: 630,
					alt: `${business.name} - Business Image`,
					type: "image/jpeg",
				},
			],
		},

		// Twitter Card
		twitter: {
			card: "summary_large_image",
			site: "@ThorbisApp",
			title: `${business.name} - ${business.city}, ${business.state}`,
			description: description.substring(0, 200),
			images: [business.business_photos?.[0]?.url || business.photos?.[0] || `https://thorbis.com/twitter-image?title=${encodeURIComponent(business.name)}`],
		},

		// Additional meta tags
		other: {
			"geo.region": `US-${business.state}`,
			"geo.placename": business.city,
			"geo.position": business.latitude && business.longitude ? `${business.latitude};${business.longitude}` : undefined,
			ICBM: business.latitude && business.longitude ? `${business.latitude}, ${business.longitude}` : undefined,
			"business:contact_data:street_address": business.address,
			"business:contact_data:locality": business.city,
			"business:contact_data:region": business.state,
			"business:contact_data:postal_code": business.zip_code,
			"business:contact_data:country_name": "United States",
			"business:contact_data:phone_number": business.phone,
			"business:contact_data:website": business.website,
			"business:hours": business.business_hours?.map((h) => `${h.day_of_week}: ${h.is_closed ? "Closed" : `${h.open_time}-${h.close_time}`}`).join("; "),
			rating: business.rating,
			review_count: business.review_count,
		},
	};
}

/**
 * Generate canonical URL and alternate links
 */
export function generateCanonicalAndAlternates(business) {
	const businessUrl = `https://thorbis.com/biz/${business.slug}`;

	return {
		canonical: businessUrl,
		alternates: {
			canonical: businessUrl,
			types: {
				"application/rss+xml": `${businessUrl}/reviews.rss`,
				"application/atom+xml": `${businessUrl}/reviews.atom`,
			},
		},
	};
}

/**
 * Generate robots meta for business pages
 */
export function generateRobotsMeta(business) {
	// Allow indexing for verified businesses, be more restrictive for unverified
	return {
		index: business.verified !== false,
		follow: true,
		googleBot: {
			index: business.verified !== false,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	};
}

/**
 * Generate complete SEO configuration for business profile
 */
export function generateCompleteSEOConfig(business) {
	const metaTags = generateBusinessMetaTags(business);
	const structuredData = generateEnhancedStructuredData(business);
	const canonicalAndAlternates = generateCanonicalAndAlternates(business);
	const robots = generateRobotsMeta(business);

	return {
		...metaTags,
		...canonicalAndAlternates,
		robots,
		structuredData,
		// Additional performance and SEO hints
		other: {
			...metaTags.other,
			"format-detection": "telephone=yes",
			"mobile-web-app-capable": "yes",
			"apple-mobile-web-app-status-bar-style": "default",
			"theme-color": "#ffffff",
			"msapplication-TileColor": "#ffffff",
		},
	};
}
