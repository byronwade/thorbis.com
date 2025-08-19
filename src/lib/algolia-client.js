// lib/algoliaClient.js - Supabase search client (replaces Algolia)
import logger from "@lib/utils/logger";

// Supabase search client that mimics Algolia API
const createSupabaseSearchClient = () => {
	return {
		initIndex: (indexName) => ({
			search: async (query, options = {}) => {
				const startTime = performance.now();

				try {
					logger.debug(`Supabase search for "${query}" in index "${indexName}"`);

					const hitsPerPage = options.hitsPerPage || 10;

					// Use API route for search instead of direct server import
					const response = await fetch("/api/business/search", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							query: query,
							limit: hitsPerPage,
							offset: 0,
						}),
					});

					if (!response.ok) {
						throw new Error(`Search API request failed: ${response.status}`);
					}

					const searchResults = await response.json();

					// Validate response structure
					if (!searchResults || !Array.isArray(searchResults.businesses)) {
						throw new Error(`Invalid API response structure: ${JSON.stringify(searchResults)}`);
					}

					// Transform Supabase results to match Algolia API format
					const hits = searchResults.businesses.map((business) => ({
						objectID: business.id,
						name: business.name,
						description: business.description,
						categories: business.categories?.map((cat) => cat.category?.name) || [],
						// Add other fields that components might expect
						address: business.address,
						city: business.city,
						state: business.state,
						rating: business.rating,
						reviewCount: business.review_count,
						coordinates: {
							lat: business.latitude,
							lng: business.longitude,
						},
					}));

					const duration = performance.now() - startTime;
					logger.performance(`Supabase search completed in ${duration.toFixed(2)}ms`);

					return {
						hits,
						nbHits: hits.length,
						page: 0,
						nbPages: Math.ceil(hits.length / hitsPerPage),
						hitsPerPage,
						processingTimeMS: Math.round(duration),
						query,
					};
				} catch (error) {
					logger.error("Supabase search error:", error);

					// Return empty results on error
					return {
						hits: [],
						nbHits: 0,
						page: 0,
						nbPages: 0,
						hitsPerPage: options.hitsPerPage || 10,
						processingTimeMS: 0,
						query,
					};
				}
			},
			saveObjects: async (objects) => {
				logger.debug(`Supabase saveObjects: ${objects.length} objects`);
				// For now, just simulate the API - in a real implementation,
				// this would sync data to Supabase
				return { objectIDs: objects.map((obj, index) => obj.objectID || `supabase-id-${index}`) };
			},
		}),
	};
};

const supabaseSearchClient = createSupabaseSearchClient();
export const algoliaIndex = supabaseSearchClient.initIndex("businesses");

export default supabaseSearchClient;
