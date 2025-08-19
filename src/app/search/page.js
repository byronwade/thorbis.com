import React from "react";
import Script from "next/script";
import ModernSearchExperience from "@components/site/search/google-maps-style-search";
import { BusinessDataFetchers } from "@lib/database/supabase/server";
import { getSearchFlags } from "@/lib/flags/server";
import { buildBusinessUrl } from "@utils";
// Google Maps doesn't require additional CSS imports

// Generate dynamic metadata based on search context
export async function generateMetadata({ searchParams }) {
	const awaitedParams = await searchParams;
	const flags = await getSearchFlags();

	const query = awaitedParams.q || "";
	const location = awaitedParams.location || "";

	// Dynamic title based on search context
	let title = "Discover Local Businesses";
	if (query && location) {
		title = `${query} in ${location} - AI-Powered Search`;
	} else if (query) {
		title = `Find ${query} Near You - Smart Business Discovery`;
	} else if (location) {
		title = `Local Businesses in ${location} - Next-Gen Search`;
	}

	// Enhanced description with AI features
	let description = "Experience the future of business discovery with AI-powered search, real-time insights, and intuitive filtering.";
	if (flags.aiRecommendations) {
		description += " Get personalized recommendations tailored to your preferences.";
	}
	if (flags.voiceSearch) {
		description += " Search by voice for hands-free discovery.";
	}
	if (flags.visualSearch) {
		description += " Find businesses through visual search and intelligent image recognition.";
	}

	return {
		metadataBase: new URL("https://thorbis.com/"),
		title: {
			default: `${title} | Thorbis`,
			template: "%s | Thorbis",
		},
		description,
		generator: "Next.js",
		applicationName: "Thorbis",
		keywords: ["AI business search", "smart local discovery", "real-time business data", "contextual recommendations", "voice search businesses", "visual business finder", "next-gen business directory", "intelligent local search", query && `${query} businesses`, location && `businesses in ${location}`].filter(Boolean),
		authors: [{ name: "Byron Wade" }, { name: "Byron Wade", url: "https://thorbis.com/" }],
		creator: "Byron Wade",
		publisher: "Byron Wade",
		// Dynamic robots based on search quality
		robots: {
			index: query || location ? true : false,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
		alternates: {
			canonical: `https://thorbis.com/search${query || location ? `?${new URLSearchParams(awaitedParams).toString()}` : ""}`,
			languages: {
				"en-US": `https://thorbis.com/en-US/search${query || location ? `?${new URLSearchParams(awaitedParams).toString()}` : ""}`,
				"es-ES": `https://thorbis.com/es-ES/search${query || location ? `?${new URLSearchParams(awaitedParams).toString()}` : ""}`,
			},
		},
		formatDetection: {
			email: false,
			address: true,
			telephone: true,
		},
		category: "directory",
		classification: "business directory",
		twitter: {
			card: "summary_large_image",
			title: `${title} | Thorbis`,
			description,
			creator: "@thorbis",
			images: {
				url: "https://thorbis.com/api/og?title=" + encodeURIComponent(title) + "&description=" + encodeURIComponent(description),
				alt: "Thorbis Next-Gen Search Experience",
			},
		},
		openGraph: {
			title: `${title} | Thorbis`,
			description,
			url: `https://thorbis.com/search${query || location ? `?${new URLSearchParams(awaitedParams).toString()}` : ""}`,
			siteName: "Thorbis",
			images: [
				{
					url: "https://thorbis.com/api/og?title=" + encodeURIComponent(title) + "&description=" + encodeURIComponent(description),
					width: 1200,
					height: 630,
					alt: "Thorbis Next-Gen Search Experience",
				},
			],
			locale: "en-US",
			type: "website",
		},
		other: {
			"theme-color": "hsl(var(--background))",
			"color-scheme": "light dark",
			"format-detection": "telephone=yes, address=yes",
		},
	};
}

// Enhanced JSON-LD with AI capabilities
const createJsonLd = (searchParams, flags) => ({
	"@context": "https://schema.org",
	"@type": "SearchResultsPage",
	name: "Thorbis Next-Gen Business Discovery",
	description: "AI-powered business search with real-time insights, contextual recommendations, and intuitive discovery features.",
	url: `https://thorbis.com/search${searchParams.q || searchParams.location ? `?${new URLSearchParams(searchParams).toString()}` : ""}`,
	logo: "https://thorbis.com/_next/image?url=%2Flogos%2FThorbisLogo.webp&w=96&q=75",
	image: "https://thorbis.com/api/og?title=Next-Gen%20Business%20Discovery&description=AI-powered%20search%20experience",
	sameAs: ["https://www.facebook.com/thorbis", "https://www.instagram.com/thorbis/?hl=en"],
	potentialAction: [
		{
			"@type": "SearchAction",
			target: "https://thorbis.com/search?q={search_term_string}",
			"query-input": "required name=search_term_string",
		},
		...(flags.voiceSearch
			? [
					{
						"@type": "SearchAction",
						name: "Voice Search",
						description: "Search businesses using voice commands",
						target: "https://thorbis.com/search?voice=true&q={search_term_string}",
						"query-input": "required name=search_term_string",
					},
				]
			: []),
		...(flags.visualSearch
			? [
					{
						"@type": "SearchAction",
						name: "Visual Search",
						description: "Find businesses through image recognition",
						target: "https://thorbis.com/search?visual=true",
					},
				]
			: []),
	],
	mainEntity: {
		"@type": "WebApplication",
		name: "AI-Powered Business Discovery Platform",
		description: "Next-generation business search with intelligent recommendations and real-time data",
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: ["AI-powered search recommendations", "Real-time business data", "Contextual filtering", "Interactive map interface", ...(flags.voiceSearch ? ["Voice search capabilities"] : []), ...(flags.visualSearch ? ["Visual search technology"] : []), ...(flags.aiRecommendations ? ["Personalized recommendations"] : [])].filter(Boolean),
	},
	...(searchParams.q && {
		about: {
			"@type": "Thing",
			name: searchParams.q,
			description: `Search results for ${searchParams.q}${searchParams.location ? ` in ${searchParams.location}` : ""}`,
		},
	}),
});

// Enhanced server-side search data fetching with AI capabilities
async function getEnhancedSearchData(searchParams, flags) {
	const startTime = performance.now();

	const params = {
		query: searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		rating: searchParams.rating ? parseFloat(searchParams.rating) : undefined,
		priceRange: searchParams.price || "",
		limit: parseInt(searchParams.limit || "50"),
		offset: parseInt(searchParams.offset || "0"),
		// Add AI-enhanced parameters
		useAI: flags.aiRecommendations,
		includeRealtimeData: flags.realTimeUpdates,
		sortBy: searchParams.sort || "relevance",
	};

	try {
		// If no search parameters, get intelligent featured businesses
		if (!params.query && !params.location && !params.category) {
			try {
				const businessData = await BusinessDataFetchers.searchBusinesses({
					limit: 50,
					offset: 0,
					featured: true,
					// Use AI to get contextually relevant featured businesses
					intelligent: flags.aiRecommendations,
					includeRealtimeStatus: flags.realTimeUpdates,
				});

				// Validate the response structure
				if (!businessData) {
					console.error("BusinessDataFetchers.searchBusinesses returned null/undefined");
					return {
						businesses: [],
						total: 0,
						hasMore: false,
						searchTime: performance.now() - startTime,
						source: "fallback",
						error: "No data returned from search function"
					};
				}

				if (businessData.error) {
					console.error("Failed to fetch featured business listing:", businessData.error);
					return {
						businesses: [],
						total: 0,
						hasMore: false,
						searchTime: performance.now() - startTime,
						source: "fallback",
						error: businessData.error
					};
				}

				// Ensure businesses is an array
				const businesses = Array.isArray(businessData.businesses) ? businessData.businesses : [];

				return {
					businesses: businesses,
					total: businessData.total || 0,
					hasMore: businessData.hasMore || false,
					searchTime: performance.now() - startTime,
					source: "featured",
					aiEnhanced: flags.aiRecommendations,
				};
			} catch (searchError) {
				console.error("Error in featured business search:", searchError);
				return {
					businesses: [],
					total: 0,
					hasMore: false,
					searchTime: performance.now() - startTime,
					source: "fallback",
					error: searchError.message
				};
			}
		}

		// Perform enhanced search with AI capabilities
		try {
			const searchResults = await BusinessDataFetchers.searchBusinesses({
				...params,
				// Enhanced search features
				semanticSearch: flags.smartSearch,
				personalizedRanking: flags.aiRecommendations,
				realTimeFiltering: flags.realTimeUpdates,
				contextualSuggestions: flags.contextualFilters,
			});

			// Validate the response structure
			if (!searchResults) {
				console.error("BusinessDataFetchers.searchBusinesses returned null/undefined for search");
				return {
					businesses: [],
					total: 0,
					hasMore: false,
					searchTime: performance.now() - startTime,
					source: "fallback",
					error: "No data returned from search function"
				};
			}

			if (searchResults.error) {
				console.error("Failed to fetch search results:", searchResults.error);
				return {
					businesses: [],
					total: 0,
					hasMore: false,
					searchTime: performance.now() - startTime,
					source: "fallback",
					error: searchResults.error
				};
			}

			// Ensure businesses is an array
			const businesses = Array.isArray(searchResults.businesses) ? searchResults.businesses : [];

			return {
				businesses: businesses,
				total: searchResults.total || 0,
				hasMore: searchResults.hasMore || false,
				searchTime: performance.now() - startTime,
				source: "search",
				aiEnhanced: flags.aiRecommendations,
			};
		} catch (searchError) {
			console.error("Error in business search:", searchError);
			return {
				businesses: [],
				total: 0,
				hasMore: false,
				searchTime: performance.now() - startTime,
				source: "fallback",
				error: searchError.message
			};
		}

	} catch (error) {
		console.error("Error in enhanced search data fetching:", error);
		return {
			businesses: [],
			total: 0,
			hasMore: false,
			searchTime: performance.now() - startTime,
			source: "error",
			error: error.message,
		};
	}
}

// Transform business data for the map component
function transformBusinessForMap(business) {
	return {
		id: business.id,
		name: business.name,
		slug: business.slug,
		description: business.description,
		address: business.address,
		city: business.city,
		state: business.state,
		latitude: business.latitude,
		longitude: business.longitude,
		phone: business.phone,
		website: business.website,
		rating: business.rating || 0,
		reviewCount: business.review_count || 0,
		priceRange: business.price_range || "$$",
		verified: business.verified,
		photos: business.photos || [],
		categories:
			business.business_categories?.map((bc) => ({
				name: bc.category.name,
				slug: bc.category.slug,
				icon: bc.category.icon,
			})) || [],
		// Add fields expected by the map component
		isOpenNow: true, // TODO: Calculate based on hours
		distance: null, // TODO: Calculate if user location available
		businessType: business.business_categories?.[0]?.category?.name || "Business",
	};
}

export default async function Search({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	// Evaluate feature flags
	const flags = await getSearchFlags();

	// Fetch enhanced search data with AI capabilities
	const searchData = await getEnhancedSearchData(awaitedSearchParams, flags);

	// Transform businesses for the next-gen component
	const transformedBusinesses = searchData.businesses.map(transformBusinessForMap);

	// Create dynamic JSON-LD based on search context and features
	const dynamicJsonLd = createJsonLd(awaitedSearchParams, flags);

	// Enhanced JSON-LD with actual search results
	const enhancedJsonLd = {
		...dynamicJsonLd,
		...(searchData.total > 0 && {
			numberOfItems: searchData.total,
			mainEntity: {
				...dynamicJsonLd.mainEntity,
				"@type": "ItemList",
				numberOfItems: searchData.total,
				itemListElement: transformedBusinesses.slice(0, 10).map((business, index) => ({
					"@type": "LocalBusiness",
					"@id": buildBusinessUrl({ 
						country: 'us', 
						state: business.state || '', 
						city: business.city || '', 
						name: business.name, 
						shortId: business.short_id || business.shortId || '' 
					}),
					position: index + 1,
					name: business.name,
					description: business.description,
					address: {
						"@type": "PostalAddress",
						streetAddress: business.address,
						addressLocality: business.city,
						addressRegion: business.state,
						addressCountry: "US",
					},
					telephone: business.phone,
					url: business.website,
					aggregateRating: business.rating
						? {
								"@type": "AggregateRating",
								ratingValue: business.rating,
								reviewCount: business.reviewCount,
								bestRating: 5,
								worstRating: 1,
							}
						: undefined,
					geo:
						business.latitude && business.longitude
							? {
									"@type": "GeoCoordinates",
									latitude: business.latitude,
									longitude: business.longitude,
								}
							: undefined,
					// Enhanced schema with AI capabilities
					...(flags.aiRecommendations &&
						business.aiScore && {
							additionalProperty: {
								"@type": "PropertyValue",
								name: "AI Relevance Score",
								value: business.aiScore,
							},
						}),
					...(flags.realTimeUpdates &&
						business.realTimeStatus && {
							openingHours: business.realTimeStatus.hours,
							specialOpeningHoursSpecification: business.realTimeStatus.specialHours,
						}),
				})),
			},
		}),
		// Add performance metadata
		...(searchData.searchTime && {
			performanceMetrics: {
				"@type": "PropertyValue",
				name: "Search Performance",
				value: `${searchData.searchTime.toFixed(2)}ms`,
				description: `AI-enhanced: ${searchData.aiEnhanced ? "Yes" : "No"}`,
			},
		}),
	};

	return (
		<>
			{/* Modern search experience matching Thorbis design system */}
			<ModernSearchExperience
				searchParams={awaitedSearchParams}
				initialBusinesses={transformedBusinesses}
				searchMetadata={{
					total: searchData.total,
					hasMore: searchData.hasMore,
					query: awaitedSearchParams.q || "",
					location: awaitedSearchParams.location || "",
					category: awaitedSearchParams.category || "",
					searchTime: searchData.searchTime,
					source: searchData.source,
					aiEnhanced: searchData.aiEnhanced,
					suggestions: searchData.suggestions,
					relatedSearches: searchData.relatedSearches,
				}}
				featureFlags={flags}
				searchCapabilities={{
					smartSearch: flags.smartSearch,
					aiRecommendations: flags.aiRecommendations,
					visualSearch: flags.visualSearch,
					voiceSearch: flags.voiceSearch,
					contextualFilters: flags.contextualFilters,
					realTimeUpdates: flags.realTimeUpdates,
				}}
			/>

			{/* Enhanced structured data */}
			<Script
				data-testid="ldjson"
				id="enhanced-search-schema"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(enhancedJsonLd, null, "\t"),
				}}
			/>

			{/* Performance monitoring script for search analytics */}
			{process.env.NODE_ENV === "production" && (
				<Script id="search-performance-analytics">
					{`
						// Track search performance metrics
						if (typeof gtag !== 'undefined') {
							gtag('event', 'search_performance', {
								search_time: ${searchData.searchTime || 0},
								ai_enhanced: ${searchData.aiEnhanced || false},
								results_count: ${searchData.total || 0},
								search_source: '${searchData.source || "unknown"}'
							});
						}
						
						// Track feature flag usage
						if (typeof gtag !== 'undefined') {
							gtag('event', 'feature_flags', {
								smart_search: ${flags.smartSearch},
								ai_recommendations: ${flags.aiRecommendations},
								visual_search: ${flags.visualSearch},
								voice_search: ${flags.voiceSearch},
								contextual_filters: ${flags.contextualFilters},
								realtime_updates: ${flags.realTimeUpdates}
							});
						}
					`}
				</Script>
			)}
		</>
	);
}
