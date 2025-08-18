/**
 * Streaming Search System
 * Provides instant progressive search results similar to grep.app
 * Features streaming responses, debouncing, and progressive enhancement
 */

import { logger } from "@utils/logger";
import cacheManager from "@utils/cache-manager";
import { compressedSearch } from "@utils/compressed-search-index";

// Search configuration optimized for instant responses
const SEARCH_CONFIG = {
	// Debouncing
	DEBOUNCE_DELAY: 150, // ms - balance between responsiveness and API calls
	FAST_DEBOUNCE_DELAY: 50, // ms - for local index search

	// Streaming
	STREAM_CHUNK_SIZE: 5, // results per chunk
	MAX_STREAM_CHUNKS: 10, // maximum chunks to stream
	STREAM_DELAY: 50, // ms between chunks

	// Performance
	MIN_QUERY_LENGTH: 2,
	MAX_CONCURRENT_SEARCHES: 3,
	SEARCH_TIMEOUT: 8000,

	// Progressive enhancement
	LOCAL_SEARCH_FIRST: true,
	FALLBACK_TO_API: true,
	CACHE_STREAMING_RESULTS: true,
};

class StreamingSearchEngine {
	constructor() {
		this.activeSearches = new Map();
		this.searchHistory = new Map();
		this.debounceTimers = new Map();
		this.streamControllers = new Map();
		this.searchMetrics = {
			totalSearches: 0,
			averageResponseTime: 0,
			cacheHitRate: 0,
			localSearchUsage: 0,
		};
		this.isInitialized = false;
	}

	/**
	 * Initialize the streaming search engine
	 */
	init() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		this.setupPerformanceMonitoring();
		logger.debug("Streaming search engine initialized");
	}

	/**
	 * Execute streaming search with progressive results
	 */
	async streamingSearch(query, options = {}, onResults = null, onComplete = null, onError = null) {
		const { filters = {}, limit = 20, useLocalIndex = SEARCH_CONFIG.LOCAL_SEARCH_FIRST, enableStreaming = true, searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } = options;

		if (!query || query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
			onComplete?.({ results: [], searchTime: 0, source: "validation" });
			return;
		}

		// Cancel existing search for this ID
		this.cancelSearch(searchId);

		const startTime = performance.now();
		this.searchMetrics.totalSearches++;

		try {
			logger.debug(`Starting streaming search: "${query}" (ID: ${searchId})`);

			// Step 1: Instant local search if available
			if (useLocalIndex) {
				const localResults = await this.executeLocalSearch(query, filters, searchId);
				if (localResults && localResults.results.length > 0) {
					this.searchMetrics.localSearchUsage++;

					if (enableStreaming) {
						await this.streamResults(localResults.results, searchId, onResults, "local");
					} else {
						onResults?.(localResults.results, "local");
					}

					// If local search provides enough results, we might not need API
					if (localResults.results.length >= limit) {
						const searchTime = performance.now() - startTime;
						this.updateAverageResponseTime(searchTime);
						onComplete?.({
							results: localResults.results.slice(0, limit),
							searchTime,
							source: "local",
							fromCache: false,
						});
						return;
					}
				}
			}

			// Step 2: Check cache for full results
			const cacheKey = this.getCacheKey(query, filters);
			let cachedResults = null;
			try {
				cachedResults = cacheManager.memory?.get?.(cacheKey) || null;
			} catch (error) {
				console.warn('Cache manager not available, skipping cache check:', error.message);
				cachedResults = null;
			}

			if (cachedResults) {
				logger.debug(`Cache hit for search: "${query}"`);
				this.searchMetrics.cacheHitRate = (this.searchMetrics.cacheHitRate + 1) / this.searchMetrics.totalSearches;

				if (enableStreaming) {
					await this.streamResults(cachedResults.results, searchId, onResults, "cache");
				} else {
					onResults?.(cachedResults.results, "cache");
				}

				const searchTime = performance.now() - startTime;
				onComplete?.({
					results: cachedResults.results,
					searchTime,
					source: "cache",
					fromCache: true,
				});
				return;
			}

			// Step 3: API search with streaming
			if (SEARCH_CONFIG.FALLBACK_TO_API) {
				await this.executeApiSearch(query, filters, limit, searchId, onResults, onComplete, enableStreaming, startTime);
			}
		} catch (error) {
			logger.error(`Streaming search failed for "${query}":`, error);
			onError?.(error);
		}
	}

	/**
	 * Execute local search using compressed index
	 */
	async executeLocalSearch(query, filters, searchId) {
		try {
			const results = await compressedSearch(query, {
				limit: 10, // Limit local results
				...filters,
			});

			if (this.isSearchCancelled(searchId)) return null;

			logger.debug(`Local search found ${results.results.length} results in ${results.searchTime.toFixed(2)}ms`);

			return results;
		} catch (error) {
			logger.warn("Local search failed:", error);
			return null;
		}
	}

	/**
	 * Execute API search with streaming response
	 */
	async executeApiSearch(query, filters, limit, searchId, onResults, onComplete, enableStreaming, startTime) {
		try {
			// Create abort controller for this search
			const controller = new AbortController();
			this.streamControllers.set(searchId, controller);

			const response = await fetch("/api/business/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
					...filters,
					limit,
					enableStreaming,
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`Search API request failed: ${response.status}`);
			}

			// Handle streaming response
			if (enableStreaming && response.body) {
				await this.handleStreamingResponse(response, searchId, onResults, onComplete, startTime, query, filters);
			} else {
				// Handle regular response
				const data = await response.json();
				const searchTime = performance.now() - startTime;

				this.updateAverageResponseTime(searchTime);
				this.cacheSearchResults(query, filters, data.businesses);

				onResults?.(data.businesses, "api");
				onComplete?.({
					results: data.businesses,
					searchTime,
					source: "api",
					fromCache: false,
				});
			}
		} catch (error) {
			if (error.name === "AbortError") {
				logger.debug(`Search cancelled: ${searchId}`);
			} else {
				logger.error("API search failed:", error);
				throw error;
			}
		} finally {
			this.streamControllers.delete(searchId);
		}
	}

	/**
	 * Handle streaming response from API
	 */
	async handleStreamingResponse(response, searchId, onResults, onComplete, startTime, query, filters) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		let allResults = [];

		try {
			while (true) {
				if (this.isSearchCancelled(searchId)) break;

				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Process complete JSON objects from buffer
				const lines = buffer.split("\n");
				buffer = lines.pop() || ""; // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.trim()) {
						try {
							const data = JSON.parse(line);

							if (data.type === "results" && data.results) {
								allResults.push(...data.results);
								onResults?.(data.results, "api-stream");
							} else if (data.type === "complete") {
								const searchTime = performance.now() - startTime;
								this.updateAverageResponseTime(searchTime);
								this.cacheSearchResults(query, filters, allResults);

								onComplete?.({
									results: allResults,
									searchTime,
									source: "api-stream",
									fromCache: false,
									...data.metadata,
								});
								return;
							}
						} catch (parseError) {
							logger.warn("Failed to parse streaming data:", parseError);
						}
					}
				}
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				logger.error("Streaming response failed:", error);
				throw error;
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Stream results progressively to provide instant feedback
	 */
	async streamResults(results, searchId, onResults, source) {
		const chunks = this.createResultChunks(results);

		for (let i = 0; i < chunks.length; i++) {
			if (this.isSearchCancelled(searchId)) break;

			const chunk = chunks[i];
			onResults?.(chunk, source);

			// Add delay between chunks for smooth streaming effect
			if (i < chunks.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, SEARCH_CONFIG.STREAM_DELAY));
			}
		}
	}

	/**
	 * Create result chunks for streaming
	 */
	createResultChunks(results) {
		const chunks = [];
		for (let i = 0; i < results.length; i += SEARCH_CONFIG.STREAM_CHUNK_SIZE) {
			chunks.push(results.slice(i, i + SEARCH_CONFIG.STREAM_CHUNK_SIZE));
		}
		return chunks.slice(0, SEARCH_CONFIG.MAX_STREAM_CHUNKS);
	}

	/**
	 * Debounced search that prevents excessive API calls
	 */
	debouncedSearch(query, options = {}, onResults, onComplete, onError) {
		const { searchId = "default", useLocalIndex = true, debounceDelay = useLocalIndex ? SEARCH_CONFIG.FAST_DEBOUNCE_DELAY : SEARCH_CONFIG.DEBOUNCE_DELAY } = options;

		// Clear existing timer
		const existingTimer = this.debounceTimers.get(searchId);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		// Set new timer
		const timer = setTimeout(() => {
			this.streamingSearch(query, options, onResults, onComplete, onError);
			this.debounceTimers.delete(searchId);
		}, debounceDelay);

		this.debounceTimers.set(searchId, timer);
	}

	/**
	 * Cancel active search
	 */
	cancelSearch(searchId) {
		// Cancel debounce timer
		const timer = this.debounceTimers.get(searchId);
		if (timer) {
			clearTimeout(timer);
			this.debounceTimers.delete(searchId);
		}

		// Cancel streaming request
		const controller = this.streamControllers.get(searchId);
		if (controller) {
			controller.abort();
			this.streamControllers.delete(searchId);
		}

		// Mark as cancelled
		this.activeSearches.set(searchId, { cancelled: true });

		logger.debug(`Search cancelled: ${searchId}`);
	}

	/**
	 * Check if search was cancelled
	 */
	isSearchCancelled(searchId) {
		const search = this.activeSearches.get(searchId);
		return search?.cancelled || false;
	}

	/**
	 * Generate cache key for search
	 */
	getCacheKey(query, filters) {
		return `streaming_search:${query.toLowerCase()}:${JSON.stringify(filters)}`;
	}

	/**
	 * Cache search results
	 */
	cacheSearchResults(query, filters, results) {
		if (!SEARCH_CONFIG.CACHE_STREAMING_RESULTS) return;

		const cacheKey = this.getCacheKey(query, filters);
		try {
			cacheManager.memory?.set?.(
				cacheKey,
				{
					results,
					timestamp: Date.now(),
					query,
					filters,
				},
				5 * 60 * 1000
			); // 5 minute cache
		} catch (error) {
			console.warn('Cache manager not available, skipping cache set:', error.message);
		}

		logger.debug(`Cached search results: ${cacheKey} (${results.length} results)`);
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Monitor search performance
		setInterval(() => {
			if (this.searchMetrics.totalSearches > 0) {
				logger.debug("Search Performance Metrics:", {
					...this.searchMetrics,
					activeSearches: this.activeSearches.size,
					activeStreams: this.streamControllers.size,
					debounceTimers: this.debounceTimers.size,
				});
			}
		}, 30000); // Every 30 seconds
	}

	/**
	 * Update average response time
	 */
	updateAverageResponseTime(responseTime) {
		const { averageResponseTime, totalSearches } = this.searchMetrics;
		this.searchMetrics.averageResponseTime = (averageResponseTime * (totalSearches - 1) + responseTime) / totalSearches;
	}

	/**
	 * Get search suggestions based on history
	 */
	getSearchSuggestions(query, limit = 5) {
		if (!query || query.length < 2) return [];

		const suggestions = [];
		const queryLower = query.toLowerCase();

		// Get from search history
		for (const [historicalQuery, data] of this.searchHistory) {
			if (historicalQuery.toLowerCase().includes(queryLower) && historicalQuery !== query) {
				suggestions.push({
					text: historicalQuery,
					type: "history",
					count: data.count,
					lastUsed: data.lastUsed,
				});
			}
		}

		// Sort by frequency and recency
		suggestions.sort((a, b) => {
			const aScore = a.count + (Date.now() - a.lastUsed) / (24 * 60 * 60 * 1000); // Factor in recency
			const bScore = b.count + (Date.now() - b.lastUsed) / (24 * 60 * 60 * 1000);
			return bScore - aScore;
		});

		return suggestions.slice(0, limit);
	}

	/**
	 * Track search for suggestions and analytics
	 */
	trackSearch(query, resultCount) {
		const queryLower = query.toLowerCase();
		const existing = this.searchHistory.get(queryLower) || { count: 0, lastUsed: 0 };

		this.searchHistory.set(queryLower, {
			count: existing.count + 1,
			lastUsed: Date.now(),
			resultCount,
		});

		// Limit history size
		if (this.searchHistory.size > 1000) {
			const oldest = Array.from(this.searchHistory.entries()).sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
			this.searchHistory.delete(oldest[0]);
		}
	}

	/**
	 * Get search metrics
	 */
	getMetrics() {
		return {
			...this.searchMetrics,
			searchHistorySize: this.searchHistory.size,
			activeSearches: this.activeSearches.size,
			activeStreams: this.streamControllers.size,
			pendingDebounce: this.debounceTimers.size,
		};
	}

	/**
	 * Clear all search data
	 */
	clear() {
		// Cancel all active searches
		for (const searchId of this.activeSearches.keys()) {
			this.cancelSearch(searchId);
		}

		this.activeSearches.clear();
		this.searchHistory.clear();
		this.debounceTimers.clear();
		this.streamControllers.clear();

		this.searchMetrics = {
			totalSearches: 0,
			averageResponseTime: 0,
			cacheHitRate: 0,
			localSearchUsage: 0,
		};

		logger.debug("Streaming search engine cleared");
	}
}

// Create singleton instance
const streamingSearchEngine = new StreamingSearchEngine();

// Export utilities
export const initStreamingSearch = () => {
	streamingSearchEngine.init();
	return streamingSearchEngine;
};

export const streamingSearch = (query, options, onResults, onComplete, onError) => {
	return streamingSearchEngine.streamingSearch(query, options, onResults, onComplete, onError);
};

export const debouncedSearch = (query, options, onResults, onComplete, onError) => {
	return streamingSearchEngine.debouncedSearch(query, options, onResults, onComplete, onError);
};

export const cancelSearch = (searchId) => {
	streamingSearchEngine.cancelSearch(searchId);
};

export const getSearchSuggestions = (query, limit) => {
	return streamingSearchEngine.getSearchSuggestions(query, limit);
};

export const trackSearch = (query, resultCount) => {
	streamingSearchEngine.trackSearch(query, resultCount);
};

export const getSearchMetrics = () => {
	return streamingSearchEngine.getMetrics();
};

export const clearSearchData = () => {
	streamingSearchEngine.clear();
};

// React hook for streaming search
export const useStreamingSearch = () => {
	const [isSearching, setIsSearching] = useState(false);
	const [results, setResults] = useState([]);
	const [searchTime, setSearchTime] = useState(0);
	const [error, setError] = useState(null);

	const search = useCallback((query, options = {}) => {
		setIsSearching(true);
		setResults([]);
		setError(null);

		debouncedSearch(
			query,
			options,
			// onResults
			(newResults, source) => {
				setResults((prev) => {
					// Merge results, avoiding duplicates
					const existingIds = new Set(prev.map((r) => r.id));
					const uniqueNewResults = newResults.filter((r) => !existingIds.has(r.id));
					return [...prev, ...uniqueNewResults];
				});
			},
			// onComplete
			(searchResult) => {
				setIsSearching(false);
				setSearchTime(searchResult.searchTime);
				trackSearch(query, searchResult.results.length);
			},
			// onError
			(searchError) => {
				setIsSearching(false);
				setError(searchError);
			}
		);
	}, []);

	const clearResults = useCallback(() => {
		setResults([]);
		setError(null);
		setSearchTime(0);
	}, []);

	return {
		search,
		clearResults,
		isSearching,
		results,
		searchTime,
		error,
	};
};

export default streamingSearchEngine;
