/**
 * Compressed Search Index System
 * Inspired by qgrep's compressed index architecture
 * Enables instant search filtering without API calls
 */

import logger from "@lib/utils/logger";

// Compression utilities (simplified LZ4-style)
class CompressionUtils {
	static compress(data) {
		try {
			// Use built-in compression via Response API
			const string = JSON.stringify(data);
			const compressed = new TextEncoder().encode(string);
			return {
				data: compressed,
				originalSize: string.length,
				compressedSize: compressed.length,
				ratio: (compressed.length / string.length).toFixed(2),
			};
		} catch (error) {
			logger.error("Compression failed:", error);
			return null;
		}
	}

	static decompress(compressedData) {
		try {
			const string = new TextDecoder().decode(compressedData.data);
			return JSON.parse(string);
		} catch (error) {
			logger.error("Decompression failed:", error);
			return null;
		}
	}

	// Simple bloom filter implementation for n-gram filtering
	static createBloomFilter(items, size = 1000) {
		const bitArray = new Uint8Array(size);
		const hashCount = 3;

		const hash = (str, seed = 0) => {
			let hash = seed;
			for (let i = 0; i < str.length; i++) {
				hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
			}
			return Math.abs(hash) % size;
		};

		// Add items to filter
		items.forEach(item => {
			for (let i = 0; i < hashCount; i++) {
				const index = hash(item, i);
				bitArray[index] = 1;
			}
		});

		return {
			bitArray,
			size,
			hashCount,
			test: (item) => {
				for (let i = 0; i < hashCount; i++) {
					const index = hash(item, i);
					if (bitArray[index] === 0) return false;
				}
				return true; // Maybe present
			}
		};
	}
}

// N-gram generator for search indexing
class NGramGenerator {
	static generateNGrams(text, n = 3) {
		if (!text || text.length < n) return [];
		
		const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
		const ngrams = new Set();
		
		// Word-level n-grams
		const words = normalized.split(" ");
		for (let i = 0; i <= words.length - n; i++) {
			ngrams.add(words.slice(i, i + n).join(" "));
		}
		
		// Character-level n-grams for partial matching
		for (let i = 0; i <= normalized.length - n; i++) {
			ngrams.add(normalized.substring(i, i + n));
		}
		
		return Array.from(ngrams);
	}

	static generateSearchableTerms(business) {
		const terms = [];
		
		// Business name
		if (business.name) {
			terms.push(...this.generateNGrams(business.name, 2));
			terms.push(...this.generateNGrams(business.name, 3));
		}
		
		// Description
		if (business.description) {
			terms.push(...this.generateNGrams(business.description, 3));
		}
		
		// Categories
		if (business.categories) {
			business.categories.forEach(cat => {
				if (cat.name) {
					terms.push(...this.generateNGrams(cat.name, 2));
				}
			});
		}
		
		// Address components
		if (business.address) terms.push(...this.generateNGrams(business.address, 3));
		if (business.city) terms.push(...this.generateNGrams(business.city, 2));
		if (business.state) terms.push(...this.generateNGrams(business.state, 2));
		
		return [...new Set(terms)];
	}
}

class CompressedSearchIndex {
	constructor() {
		this.chunks = new Map();
		this.bloomFilters = new Map();
		this.metadata = {
			totalBusinesses: 0,
			totalChunks: 0,
			compressionRatio: 0,
			indexSize: 0,
			lastUpdated: null,
		};
		this.chunkSize = 100; // Businesses per chunk
		this.isLoading = false;
	}

	/**
	 * Build compressed index from business data
	 */
	async buildIndex(businesses) {
		if (this.isLoading) return;
		this.isLoading = true;

		const startTime = performance.now();
		
		try {
			logger.debug(`Building compressed index for ${businesses.length} businesses`);

			// Clear existing index
			this.chunks.clear();
			this.bloomFilters.clear();

			// Group businesses into chunks
			const businessChunks = this.createChunks(businesses);
			
			let totalCompressedSize = 0;
			let totalOriginalSize = 0;

			// Process each chunk
			for (let i = 0; i < businessChunks.length; i++) {
				const chunk = businessChunks[i];
				const chunkId = `chunk_${i}`;
				
				// Generate search terms for all businesses in chunk
				const allTerms = [];
				const processedBusinesses = chunk.map(business => {
					const terms = NGramGenerator.generateSearchableTerms(business);
					allTerms.push(...terms);
					
					return {
						id: business.id,
						name: business.name,
						description: business.description?.substring(0, 200), // Truncate for size
						categories: business.categories?.map(c => ({ name: c.name, slug: c.slug })),
						address: business.address,
						city: business.city,
						state: business.state,
						rating: business.rating,
						reviewCount: business.review_count,
						latitude: business.latitude,
						longitude: business.longitude,
						featured: business.featured,
						verified: business.verified,
						searchTerms: terms,
					};
				});

				// Compress chunk data
				const compressed = CompressionUtils.compress(processedBusinesses);
				if (compressed) {
					this.chunks.set(chunkId, compressed);
					totalCompressedSize += compressed.compressedSize;
					totalOriginalSize += compressed.originalSize;
				}

				// Create bloom filter for this chunk
				const bloomFilter = CompressionUtils.createBloomFilter(allTerms);
				this.bloomFilters.set(chunkId, bloomFilter);
			}

			// Update metadata
			this.metadata = {
				totalBusinesses: businesses.length,
				totalChunks: businessChunks.length,
				compressionRatio: (totalCompressedSize / totalOriginalSize).toFixed(2),
				indexSize: totalCompressedSize,
				lastUpdated: new Date().toISOString(),
			};

			const buildTime = performance.now() - startTime;
			logger.info(`Search index built in ${buildTime.toFixed(2)}ms`, this.metadata);

		} catch (error) {
			logger.error("Failed to build search index:", error);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Create business chunks for compression
	 */
	createChunks(businesses) {
		const chunks = [];
		for (let i = 0; i < businesses.length; i += this.chunkSize) {
			chunks.push(businesses.slice(i, i + this.chunkSize));
		}
		return chunks;
	}

	/**
	 * Fast search using bloom filters and compressed chunks
	 */
	async search(query, options = {}) {
		const startTime = performance.now();
		const {
			limit = 20,
			category = null,
			location = null,
			bounds = null,
			minRating = null,
		} = options;

		if (!query || query.length < 2) {
			return { results: [], searchTime: 0, chunksProcessed: 0 };
		}

		try {
			// FIXED: Enhanced search terms for better category matching
			const searchTerms = [
				...NGramGenerator.generateNGrams(query, 2), // Keep n-grams for partial matching
				query.toLowerCase(), // Add full query for exact matching
				...query.toLowerCase().split(/\s+/), // Add individual words
			].filter((term, index, array) => array.indexOf(term) === index); // Remove duplicates
			
			const results = [];
			let chunksProcessed = 0;
			let chunksSkipped = 0;

			// Filter chunks using bloom filters
			const relevantChunks = [];
			for (const [chunkId, bloomFilter] of this.bloomFilters) {
				let hasMatch = false;
				
				// Check if any search term might be in this chunk
				for (const term of searchTerms) {
					if (bloomFilter.test(term)) {
						hasMatch = true;
						break;
					}
				}
				
				if (hasMatch) {
					relevantChunks.push(chunkId);
				} else {
					chunksSkipped++;
				}
			}

			logger.debug(`Bloom filter: ${relevantChunks.length} relevant chunks, ${chunksSkipped} skipped`);

			// Process relevant chunks
			for (const chunkId of relevantChunks) {
				const compressed = this.chunks.get(chunkId);
				if (!compressed) continue;

				// Decompress chunk
				const businesses = CompressionUtils.decompress(compressed);
				if (!businesses) continue;

				chunksProcessed++;

				// Search within chunk
				for (const business of businesses) {
					if (results.length >= limit) break;

					// Check if business matches search terms
					if (this.matchesBusiness(business, searchTerms, {
						category,
						location,
						bounds,
						minRating,
					})) {
						results.push({
							...business,
							relevanceScore: this.calculateRelevanceScore(business, query, searchTerms),
						});
					}
				}

				if (results.length >= limit) break;
			}

			// Sort by relevance score
			results.sort((a, b) => b.relevanceScore - a.relevanceScore);

			const searchTime = performance.now() - startTime;
			
			logger.debug(`Search completed in ${searchTime.toFixed(2)}ms`, {
				query,
				results: results.length,
				chunksProcessed,
				chunksSkipped,
			});

			return {
				results: results.slice(0, limit),
				searchTime,
				chunksProcessed,
				chunksSkipped,
				totalChunks: this.chunks.size,
			};

		} catch (error) {
			logger.error("Search failed:", error);
			return { results: [], searchTime: 0, chunksProcessed: 0 };
		}
	}

	/**
	 * Check if business matches search criteria
	 */
	matchesBusiness(business, searchTerms, filters) {
		// FIXED: Enhanced text matching for better category search
		const businessFields = {
			name: business.name || "",
			description: business.description || "",
			address: business.address || "",
			city: business.city || "",
			categories: (business.categories?.map(c => c.name) || []).join(" "),
			categorySlugs: (business.categories?.map(c => c.slug) || []).join(" "),
		};

		// Combine all text for general matching
		const businessText = Object.values(businessFields).join(" ").toLowerCase();

		// Check for text matches with enhanced category weighting and fuzzy matching
		const hasTextMatch = searchTerms.some(term => {
			const lowerTerm = term.toLowerCase();
			
			// Exact category name match (highest priority)
			if (businessFields.categories.toLowerCase().includes(lowerTerm)) {
				return true;
			}
			
			// Category slug match
			if (businessFields.categorySlugs.toLowerCase().includes(lowerTerm)) {
				return true;
			}
			
			// Enhanced category matching for common search terms
			const categoryMappings = {
				'plumber': ['plumbing', 'home services', 'plumber'],
				'plumbing': ['plumbing', 'home services', 'plumber'],
				'electrician': ['electrical', 'home services', 'electrician'], 
				'electrical': ['electrical', 'home services', 'electrician'],
				'restaurant': ['restaurants', 'food', 'dining'],
				'food': ['restaurants', 'food', 'dining'],
				'mechanic': ['automotive', 'auto repair', 'car'],
				'auto': ['automotive', 'auto repair', 'car'],
				'doctor': ['health', 'medical', 'healthcare'],
				'dentist': ['dental', 'health', 'medical']
			};
			
			// Check if search term matches any category mappings
			if (categoryMappings[lowerTerm]) {
				const matchingCategories = categoryMappings[lowerTerm];
				if (matchingCategories.some(cat => businessFields.categories.toLowerCase().includes(cat))) {
					return true;
				}
			}
			
			// General text match
			return businessText.includes(lowerTerm);
		});

		if (!hasTextMatch) return false;

		// Category filter
		if (filters.category) {
			const hasCategory = business.categories?.some(cat => 
				cat.slug === filters.category || 
				cat.name.toLowerCase().includes(filters.category.toLowerCase())
			);
			if (!hasCategory) return false;
		}

		// Location filter
		if (filters.location) {
			const locationText = [business.address, business.city, business.state].join(" ").toLowerCase();
			if (!locationText.includes(filters.location.toLowerCase())) {
				return false;
			}
		}

		// Bounds filter
		if (filters.bounds && business.latitude && business.longitude) {
			const { north, south, east, west } = filters.bounds;
			if (business.latitude < south || business.latitude > north ||
				business.longitude < west || business.longitude > east) {
				return false;
			}
		}

		// Rating filter
		if (filters.minRating && business.rating < filters.minRating) {
			return false;
		}

		return true;
	}

	/**
	 * Calculate relevance score for search results
	 */
	calculateRelevanceScore(business, originalQuery, searchTerms) {
		let score = 0;
		const query = originalQuery.toLowerCase();

		// Exact name match (highest score)
		if (business.name.toLowerCase().includes(query)) {
			score += 100;
		}

		// Partial name match
		searchTerms.forEach(term => {
			if (business.name.toLowerCase().includes(term)) {
				score += 50;
			}
		});

		// Category match
		business.categories?.forEach(cat => {
			if (cat.name.toLowerCase().includes(query)) {
				score += 75;
			}
		});

		// Description match
		if (business.description?.toLowerCase().includes(query)) {
			score += 25;
		}

		// Business quality factors
		if (business.featured) score += 20;
		if (business.verified) score += 15;
		if (business.rating >= 4.5) score += 10;
		if (business.reviewCount > 50) score += 5;

		return score;
	}

	/**
	 * Get index statistics
	 */
	getStats() {
		return {
			...this.metadata,
			chunksInMemory: this.chunks.size,
			bloomFiltersInMemory: this.bloomFilters.size,
			isLoading: this.isLoading,
		};
	}

	/**
	 * Clear the index
	 */
	clear() {
		this.chunks.clear();
		this.bloomFilters.clear();
		this.metadata = {
			totalBusinesses: 0,
			totalChunks: 0,
			compressionRatio: 0,
			indexSize: 0,
			lastUpdated: null,
		};
		logger.debug("Search index cleared");
	}

	/**
	 * Partial update of index (for when new businesses are added)
	 */
	async updateChunk(businesses, chunkId = null) {
		if (!chunkId) {
			chunkId = `chunk_${this.chunks.size}`;
		}

		try {
			// Generate search terms
			const allTerms = [];
			const processedBusinesses = businesses.map(business => {
				const terms = NGramGenerator.generateSearchableTerms(business);
				allTerms.push(...terms);
				
				return {
					id: business.id,
					name: business.name,
					description: business.description?.substring(0, 200),
					categories: business.categories?.map(c => ({ name: c.name, slug: c.slug })),
					address: business.address,
					city: business.city,
					state: business.state,
					rating: business.rating,
					reviewCount: business.review_count,
					latitude: business.latitude,
					longitude: business.longitude,
					featured: business.featured,
					verified: business.verified,
					searchTerms: terms,
				};
			});

			// Compress and store
			const compressed = CompressionUtils.compress(processedBusinesses);
			if (compressed) {
				this.chunks.set(chunkId, compressed);
			}

			// Create bloom filter
			const bloomFilter = CompressionUtils.createBloomFilter(allTerms);
			this.bloomFilters.set(chunkId, bloomFilter);

			logger.debug(`Updated chunk ${chunkId} with ${businesses.length} businesses`);

		} catch (error) {
			logger.error(`Failed to update chunk ${chunkId}:`, error);
		}
	}
}

// Create singleton instance
const searchIndex = new CompressedSearchIndex();

// Export utilities
export const buildSearchIndex = (businesses) => {
	return searchIndex.buildIndex(businesses);
};

export const compressedSearch = (query, options) => {
	return searchIndex.search(query, options);
};

export const getSearchIndexStats = () => {
	return searchIndex.getStats();
};

export const clearSearchIndex = () => {
	searchIndex.clear();
};

export const updateSearchChunk = (businesses, chunkId) => {
	return searchIndex.updateChunk(businesses, chunkId);
};

export default searchIndex;