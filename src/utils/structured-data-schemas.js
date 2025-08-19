/**
 * Advanced Structured Data (JSON-LD) Schemas
 * Comprehensive schema.org implementation for all content types
 *
 * Features:
 * - Complete schema.org coverage for local business directory
 * - Performance-optimized structured data generation
 * - Context-aware schema selection and optimization
 * - Rich snippets and enhanced search results
 * - Compliance with Google Search Guidelines
 */

import logger from "./logger.js";

/**
 * Structured Data Generator Class
 * Handles all JSON-LD schema generation with Google best practices
 */
export class StructuredDataGenerator {
	constructor(siteConfig = {}) {
		this.siteConfig = {
			name: siteConfig.name || "Thorbis",
			url: siteConfig.url || "https://thorbis.com",
			logo: siteConfig.logo || "https://thorbis.com/logos/ThorbisLogo.webp",
			organization: siteConfig.organization || "ByteRover LLC",
			contactPoint: siteConfig.contactPoint || {
				telephone: "+1-555-123-4567",
				email: "support@thorbis.com",
				contactType: "Customer Service",
			},
			socialProfiles: siteConfig.socialProfiles || ["https://twitter.com/byronwade", "https://linkedin.com/company/byronwade"],
		};
	}

	/**
	 * Generate structured data based on page type and content
	 */
	async generateStructuredData(pageConfig) {
		const startTime = performance.now();

		try {
			const { type, data = {} } = pageConfig;
			let schemas = [];

			// Always include organization schema
			schemas.push(this.generateOrganizationSchema());

			// Add website schema for home page
			if (type === "home") {
				schemas.push(this.generateWebsiteSchema());
			}

			// Generate type-specific schemas
			switch (type) {
				case "home":
					schemas.push(...this.generateHomePageSchemas());
					break;

				case "business":
					schemas.push(...this.generateBusinessSchemas(data));
					break;

				case "blog":
					schemas.push(this.generateArticleSchema(data));
					break;

				case "event":
					schemas.push(this.generateEventSchema(data));
					break;

				case "category":
					schemas.push(this.generateCollectionPageSchema(data));
					break;

				case "search":
					schemas.push(this.generateSearchResultsPageSchema(data));
					break;

				case "user-profile":
					schemas.push(this.generatePersonSchema(data));
					break;

				case "local-hub":
					schemas.push(this.generatePlaceSchema(data));
					break;

				case "review":
					schemas.push(this.generateReviewSchema(data));
					break;

				case "product":
					schemas.push(this.generateProductSchema(data));
					break;

				case "service":
					schemas.push(this.generateServiceSchema(data));
					break;

				case "faq":
					schemas.push(this.generateFAQPageSchema(data));
					break;

				case "how-to":
					schemas.push(this.generateHowToSchema(data));
					break;

				default:
					schemas.push(this.generateWebPageSchema(pageConfig));
			}

			// Add breadcrumbs if provided
			if (pageConfig.breadcrumbs && pageConfig.breadcrumbs.length > 0) {
				schemas.push(this.generateBreadcrumbListSchema(pageConfig.breadcrumbs));
			}

			const duration = performance.now() - startTime;
			logger.performance(`Generated structured data in ${duration.toFixed(2)}ms for ${type}`);

			return this._combineSchemas(schemas);
		} catch (error) {
			logger.error("Failed to generate structured data:", error);
			return this.generateOrganizationSchema(); // Fallback
		}
	}

	/**
	 * Organization Schema (Always included)
	 */
	generateOrganizationSchema() {
		return {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: this.siteConfig.organization,
			url: this.siteConfig.url,
			logo: {
				"@type": "ImageObject",
				url: this.siteConfig.logo,
				width: 512,
				height: 512,
			},
			description: "Local business directory connecting communities with trusted local businesses and services",
			foundingDate: "2024",
			address: {
				"@type": "PostalAddress",
				addressCountry: "US",
				addressRegion: "California",
			},
			contactPoint: {
				"@type": "ContactPoint",
				telephone: this.siteConfig.contactPoint.telephone,
				email: this.siteConfig.contactPoint.email,
				contactType: this.siteConfig.contactPoint.contactType,
				areaServed: "US",
				availableLanguage: "English",
			},
			sameAs: this.siteConfig.socialProfiles,
		};
	}

	/**
	 * Website Schema (For home page)
	 */
	generateWebsiteSchema() {
		return {
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: this.siteConfig.name,
			url: this.siteConfig.url,
			description: "Discover local businesses, events, and community resources in your area",
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${this.siteConfig.url}/search?q={search_term_string}`,
				},
				"query-input": "required name=search_term_string",
			},
			publisher: {
				"@type": "Organization",
				name: this.siteConfig.organization,
				url: this.siteConfig.url,
				logo: this.siteConfig.logo,
			},
		};
	}

	/**
	 * Local Business Schema with comprehensive details
	 */
	generateLocalBusinessSchema(business) {
		const { name, description, category, address, phone, email, website, coordinates, hours, priceRange, rating, reviewCount, images = [], services = [], amenities = [], paymentMethods = [], slug } = business;

		const businessUrl = `${this.siteConfig.url}/business/${slug}`;

		// Determine business type based on category
		const businessType = this._getBusinessType(category);

		const schema = {
			"@context": "https://schema.org",
			"@type": businessType,
			name: name,
			description: description,
			url: businessUrl,
			telephone: phone,
			email: email,
			priceRange: priceRange,
			image: images.map((img) => ({
				"@type": "ImageObject",
				url: img.url,
				caption: img.caption || name,
				width: img.width || 1200,
				height: img.height || 800,
			})),
			address: this._formatAddress(address),
			geo: coordinates
				? {
						"@type": "GeoCoordinates",
						latitude: coordinates.lat,
						longitude: coordinates.lng,
					}
				: undefined,
			openingHoursSpecification: this._formatOpeningHours(hours),
			servesCuisine: category === "Restaurant" ? services : undefined,
			amenityFeature: amenities.map((amenity) => ({
				"@type": "LocationFeatureSpecification",
				name: amenity,
				value: true,
			})),
			paymentAccepted: paymentMethods.join(", "),
			currenciesAccepted: "USD",
			hasOfferCatalog:
				services.length > 0
					? {
							"@type": "OfferCatalog",
							name: `${name} Services`,
							itemListElement: services.map((service, index) => ({
								"@type": "Offer",
								position: index + 1,
								name: service.name || service,
								description: service.description,
								price: service.price,
								priceCurrency: "USD",
							})),
						}
					: undefined,
		};

		// Add aggregate rating if available
		if (rating && reviewCount) {
			schema.aggregateRating = {
				"@type": "AggregateRating",
				ratingValue: rating,
				reviewCount: reviewCount,
				bestRating: 5,
				worstRating: 1,
			};
		}

		// Add parent organization
		schema.parentOrganization = {
			"@type": "Organization",
			name: this.siteConfig.organization,
			url: this.siteConfig.url,
		};

		return schema;
	}

	/**
	 * Article Schema for blog posts
	 */
	generateArticleSchema(article) {
		const { title, excerpt, content, author, publishedAt, updatedAt, tags = [], category, featuredImage, slug, readingTime } = article;

		const articleUrl = `${this.siteConfig.url}/blog/${slug}`;
		const wordCount = content ? content.split(/\s+/).length : 0;

		return {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: title,
			description: excerpt,
			articleBody: content,
			url: articleUrl,
			datePublished: publishedAt,
			dateModified: updatedAt || publishedAt,
			author: {
				"@type": "Person",
				name: author?.name || "ByteRover Team",
				url: author?.profile || this.siteConfig.url,
			},
			publisher: {
				"@type": "Organization",
				name: this.siteConfig.organization,
				url: this.siteConfig.url,
				logo: {
					"@type": "ImageObject",
					url: this.siteConfig.logo,
					width: 512,
					height: 512,
				},
			},
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": articleUrl,
			},
			image: featuredImage
				? {
						"@type": "ImageObject",
						url: featuredImage,
						width: 1200,
						height: 630,
						caption: title,
					}
				: undefined,
			keywords: tags.join(", "),
			articleSection: category,
			wordCount: wordCount,
			timeRequired: readingTime || `PT${Math.ceil(wordCount / 200)}M`,
			inLanguage: "en-US",
			about: {
				"@type": "Thing",
				name: "Local Business Directory",
				description: "Information about local businesses and community resources",
			},
		};
	}

	/**
	 * Event Schema with comprehensive event details
	 */
	generateEventSchema(event) {
		const { title, description, startDate, endDate, location, venue, organizer, price, currency = "USD", image, isVirtual, slug, category, attendeeCount, maximumCapacity } = event;

		const eventUrl = `${this.siteConfig.url}/events/${slug}`;

		return {
			"@context": "https://schema.org",
			"@type": "Event",
			name: title,
			description: description,
			url: eventUrl,
			startDate: startDate,
			endDate: endDate || startDate,
			eventStatus: "https://schema.org/EventScheduled",
			eventAttendanceMode: isVirtual ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
			location: isVirtual
				? {
						"@type": "VirtualLocation",
						url: venue || eventUrl,
					}
				: {
						"@type": "Place",
						name: venue || location,
						address: location,
					},
			organizer: {
				"@type": organizer?.type || "Organization",
				name: organizer?.name || "Event Organizer",
				url: organizer?.website,
				email: organizer?.email,
				telephone: organizer?.phone,
			},
			offers:
				price && price !== "0"
					? {
							"@type": "Offer",
							price: price,
							priceCurrency: currency,
							availability: "https://schema.org/InStock",
							url: eventUrl,
						}
					: {
							"@type": "Offer",
							price: "0",
							priceCurrency: currency,
							availability: "https://schema.org/InStock",
							url: eventUrl,
						},
			image: image
				? {
						"@type": "ImageObject",
						url: image,
						width: 1200,
						height: 630,
						caption: title,
					}
				: undefined,
			performer: organizer
				? {
						"@type": organizer?.type || "Organization",
						name: organizer.name,
					}
				: undefined,
			audience: {
				"@type": "Audience",
				audienceType: "General Public",
			},
			maximumAttendeeCapacity: maximumCapacity,
			typicalAgeRange: "18-",
		};
	}

	/**
	 * Review Schema for business reviews
	 */
	generateReviewSchema(review) {
		const { reviewBody, rating, author, business, datePublished, dateModified } = review;

		return {
			"@context": "https://schema.org",
			"@type": "Review",
			reviewBody: reviewBody,
			reviewRating: {
				"@type": "Rating",
				ratingValue: rating,
				bestRating: 5,
				worstRating: 1,
			},
			author: {
				"@type": "Person",
				name: author.name,
				image: author.avatar,
			},
			itemReviewed: {
				"@type": "LocalBusiness",
				name: business.name,
				address: business.address,
				telephone: business.phone,
			},
			datePublished: datePublished,
			dateModified: dateModified || datePublished,
			publisher: {
				"@type": "Organization",
				name: this.siteConfig.organization,
			},
		};
	}

	/**
	 * FAQ Page Schema
	 */
	generateFAQPageSchema(faqData) {
		const { questions = [] } = faqData;

		return {
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: questions.map((qa) => ({
				"@type": "Question",
				name: qa.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: qa.answer,
				},
			})),
		};
	}

	/**
	 * How-To Schema for instructional content
	 */
	generateHowToSchema(howToData) {
		const { name, description, steps = [], totalTime, supply = [], tool = [], image } = howToData;

		return {
			"@context": "https://schema.org",
			"@type": "HowTo",
			name: name,
			description: description,
			image: image
				? {
						"@type": "ImageObject",
						url: image,
					}
				: undefined,
			totalTime: totalTime,
			supply: supply.map((item) => ({
				"@type": "HowToSupply",
				name: item,
			})),
			tool: tool.map((item) => ({
				"@type": "HowToTool",
				name: item,
			})),
			step: steps.map((step, index) => ({
				"@type": "HowToStep",
				position: index + 1,
				name: step.name,
				text: step.text,
				image: step.image
					? {
							"@type": "ImageObject",
							url: step.image,
						}
					: undefined,
			})),
		};
	}

	/**
	 * Breadcrumb List Schema
	 */
	generateBreadcrumbListSchema(breadcrumbs) {
		return {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: breadcrumbs.map((breadcrumb, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: breadcrumb.name,
				item: breadcrumb.url,
			})),
		};
	}

	/**
	 * Collection Page Schema for category pages
	 */
	generateCollectionPageSchema(categoryData) {
		const { name, description, businesses = [], slug } = categoryData;

		const categoryUrl = `${this.siteConfig.url}/categories/${slug}`;

		return {
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: `${name} Businesses`,
			description: description,
			url: categoryUrl,
			mainEntity: {
				"@type": "ItemList",
				name: `${name} Business Directory`,
				description: `Local ${name.toLowerCase()} businesses and services`,
				numberOfItems: businesses.length,
				itemListElement: businesses.slice(0, 10).map((business, index) => ({
					"@type": "ListItem",
					position: index + 1,
					item: {
						"@type": "LocalBusiness",
						name: business.name,
						url: `${this.siteConfig.url}/business/${business.slug}`,
						address: business.address,
						telephone: business.phone,
						aggregateRating: business.rating
							? {
									"@type": "AggregateRating",
									ratingValue: business.rating,
									reviewCount: business.reviewCount,
								}
							: undefined,
					},
				})),
			},
		};
	}

	/**
	 * Search Results Page Schema
	 */
	generateSearchResultsPageSchema(searchData) {
		const { query, results = [], location } = searchData;
		const searchUrl = `${this.siteConfig.url}/search?q=${encodeURIComponent(query)}`;

		return {
			"@context": "https://schema.org",
			"@type": "SearchResultsPage",
			name: `Search Results for "${query}"`,
			url: searchUrl,
			mainEntity: {
				"@type": "ItemList",
				numberOfItems: results.length,
				itemListElement: results.slice(0, 10).map((result, index) => ({
					"@type": "ListItem",
					position: index + 1,
					item: {
						"@type": "LocalBusiness",
						name: result.name,
						url: `${this.siteConfig.url}/business/${result.slug}`,
						description: result.description,
					},
				})),
			},
		};
	}

	/**
	 * Person Schema for user profiles
	 */
	generatePersonSchema(person) {
		const { name, bio, image, jobTitle, worksFor, email, telephone, url, sameAs = [] } = person;

		return {
			"@context": "https://schema.org",
			"@type": "Person",
			name: name,
			description: bio,
			image: image,
			jobTitle: jobTitle,
			worksFor: worksFor
				? {
						"@type": "Organization",
						name: worksFor,
					}
				: undefined,
			email: email,
			telephone: telephone,
			url: url,
			sameAs: sameAs,
		};
	}

	/**
	 * Place Schema for location pages
	 */
	generatePlaceSchema(place) {
		const { name, description, address, coordinates, image, containedInPlace } = place;

		return {
			"@context": "https://schema.org",
			"@type": "Place",
			name: name,
			description: description,
			address: this._formatAddress(address),
			geo: coordinates
				? {
						"@type": "GeoCoordinates",
						latitude: coordinates.lat,
						longitude: coordinates.lng,
					}
				: undefined,
			image: image,
			containedInPlace: containedInPlace
				? {
						"@type": "Place",
						name: containedInPlace,
					}
				: undefined,
		};
	}

	/**
	 * Product Schema for product listings
	 */
	generateProductSchema(product) {
		const { name, description, image, brand, sku, offers, aggregateRating, reviews = [] } = product;

		return {
			"@context": "https://schema.org",
			"@type": "Product",
			name: name,
			description: description,
			image: image,
			brand: brand
				? {
						"@type": "Brand",
						name: brand,
					}
				: undefined,
			sku: sku,
			offers: offers
				? {
						"@type": "Offer",
						price: offers.price,
						priceCurrency: offers.currency || "USD",
						availability: offers.availability || "https://schema.org/InStock",
					}
				: undefined,
			aggregateRating: aggregateRating,
			review: reviews.map((review) => ({
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: review.rating,
				},
				author: {
					"@type": "Person",
					name: review.author,
				},
				reviewBody: review.text,
			})),
		};
	}

	/**
	 * Service Schema for service listings
	 */
	generateServiceSchema(service) {
		const { name, description, provider, areaServed, offers, serviceType, category } = service;

		return {
			"@context": "https://schema.org",
			"@type": "Service",
			name: name,
			description: description,
			provider: provider
				? {
						"@type": "Organization",
						name: provider.name,
						address: provider.address,
					}
				: undefined,
			areaServed: areaServed,
			offers: offers
				? {
						"@type": "Offer",
						price: offers.price,
						priceCurrency: offers.currency || "USD",
					}
				: undefined,
			serviceType: serviceType,
			category: category,
		};
	}

	/**
	 * Web Page Schema (generic)
	 */
	generateWebPageSchema(pageConfig) {
		const { title, description, path } = pageConfig;
		const pageUrl = `${this.siteConfig.url}${path}`;

		return {
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: title,
			description: description,
			url: pageUrl,
			publisher: {
				"@type": "Organization",
				name: this.siteConfig.organization,
				url: this.siteConfig.url,
			},
			inLanguage: "en-US",
			isPartOf: {
				"@type": "WebSite",
				name: this.siteConfig.name,
				url: this.siteConfig.url,
			},
		};
	}

	/**
	 * Home Page Schemas
	 */
	generateHomePageSchemas() {
		return [
			// Local Business schema for the directory itself
			{
				"@context": "https://schema.org",
				"@type": "LocalBusiness",
				"@id": this.siteConfig.url,
				name: this.siteConfig.name,
				description: "Local business directory connecting communities with trusted local businesses",
				url: this.siteConfig.url,
				logo: this.siteConfig.logo,
				image: this.siteConfig.logo,
				priceRange: "Free",
				areaServed: "United States",
				hasOfferCatalog: {
					"@type": "OfferCatalog",
					name: "Business Directory Services",
					itemListElement: [
						{
							"@type": "Offer",
							name: "Business Listings",
							description: "Free business listings for local businesses",
						},
						{
							"@type": "Offer",
							name: "Event Listings",
							description: "Community event promotion",
						},
						{
							"@type": "Offer",
							name: "Business Reviews",
							description: "Customer review platform",
						},
					],
				},
			},
		];
	}

	/**
	 * Generate multiple business schemas
	 */
	generateBusinessSchemas(business) {
		const schemas = [];

		// Main business schema
		schemas.push(this.generateLocalBusinessSchema(business));

		// Add review schemas if available
		if (business.reviews && business.reviews.length > 0) {
			business.reviews.slice(0, 5).forEach((review) => {
				schemas.push(
					this.generateReviewSchema({
						...review,
						business: {
							name: business.name,
							address: business.address,
							phone: business.phone,
						},
					})
				);
			});
		}

		return schemas;
	}

	/**
	 * Utility Functions
	 */
	_getBusinessType(category) {
		const businessTypes = {
			Restaurant: "Restaurant",
			Food: "FoodEstablishment",
			Hotel: "LodgingBusiness",
			Medical: "MedicalBusiness",
			Automotive: "AutomotiveBusiness",
			Beauty: "BeautySalon",
			Fitness: "ExerciseGym",
			Shopping: "Store",
			"Professional Services": "ProfessionalService",
			Entertainment: "EntertainmentBusiness",
			Education: "EducationalOrganization",
		};

		return businessTypes[category] || "LocalBusiness";
	}

	_formatAddress(address) {
		if (typeof address === "string") {
			const parts = address.split(",").map((part) => part.trim());
			return {
				"@type": "PostalAddress",
				streetAddress: parts[0] || "",
				addressLocality: parts[1] || "",
				addressRegion: parts[2] || "",
				postalCode: parts[3] || "",
				addressCountry: "US",
			};
		}

		return {
			"@type": "PostalAddress",
			streetAddress: address.street || "",
			addressLocality: address.city || "",
			addressRegion: address.state || "",
			postalCode: address.zip || "",
			addressCountry: address.country || "US",
		};
	}

	_formatOpeningHours(hours) {
		if (!hours || typeof hours !== "object") return undefined;

		const daysMap = {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
		};

		return Object.entries(hours)
			.filter(([day, time]) => time && time !== "Closed")
			.map(([day, time]) => ({
				"@type": "OpeningHoursSpecification",
				dayOfWeek: daysMap[day.toLowerCase()],
				opens: time.split("-")[0]?.trim(),
				closes: time.split("-")[1]?.trim(),
			}));
	}

	_combineSchemas(schemas) {
		// If only one schema, return it directly
		if (schemas.length === 1) {
			return schemas[0];
		}

		// If multiple schemas, return as array for multiple script tags
		return schemas;
	}
}

// Export singleton instance
export const structuredDataGenerator = new StructuredDataGenerator();
