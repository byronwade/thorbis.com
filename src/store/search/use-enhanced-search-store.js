/**
 * Enhanced Search Store for Airbnb-Style Search Experience
 * Handles complex search state, filtering, pagination, and view modes
 * with performance optimization and real-time updates
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { logger } from '@lib/utils/logger';

// Search store with advanced state management
export const useEnhancedSearchStore = create(
  subscribeWithSelector((set, get) => ({
    // === SEARCH STATE ===
    isLoading: false,
    searchQuery: '',
    searchLocation: '',
    lastSearchTime: null,
    searchResults: [],
    totalResults: 0,
    hasMore: false,
    searchError: null,
    searchPerformance: {
      lastSearchTime: 0,
      averageSearchTime: 0,
      searchCount: 0
    },

    // === FILTER STATE ===
    filters: {
      categories: [],
      priceRange: [],
      rating: 0,
      distance: 25,
      features: [],
      openNow: false,
      verified: false,
      sortBy: 'relevance'
    },
    activeFiltersCount: 0,

    // === VIEW STATE ===
    viewMode: 'grid', // 'grid', 'list', 'map'
    mapBounds: null,
    mapCenter: null,
    mapZoom: 12,

    // === PAGINATION STATE ===
    currentPage: 1,
    pageSize: 20,
    loadedPages: new Set([1]),

    // === UI STATE ===
    showFilters: false,
    selectedBusiness: null,
    savedBusinesses: new Set(),
    recentSearches: [],
    popularCategories: [],

    // === ACTIONS ===

    /**
     * Set loading state
     */
    setLoading: (isLoading) => {
      set({ isLoading });
    },

    /**
     * Update search query
     */
    setSearchQuery: (searchQuery) => {
      set({ searchQuery });
    },

    /**
     * Update search location
     */
    setSearchLocation: (searchLocation) => {
      set({ searchLocation });
    },

    /**
     * Perform search with current parameters
     */
    performSearch: async (options = {}) => {
      const startTime = performance.now();
      const { searchQuery, searchLocation, filters, pageSize } = get();
      
      set({ 
        isLoading: true, 
        searchError: null,
        currentPage: 1,
        loadedPages: new Set([1])
      });

      try {
        // Build search parameters
        const searchParams = {
          query: searchQuery,
          location: searchLocation,
          ...filters,
          limit: pageSize,
          offset: 0,
          ...options
        };

        logger.info('Performing search', searchParams);

        // Call API (mock implementation for now)
        const response = await mockSearchAPI(searchParams);
        
        const searchTime = performance.now() - startTime;
        
        // Update performance metrics
        const { searchCount, averageSearchTime } = get().searchPerformance;
        const newAverageTime = (averageSearchTime * searchCount + searchTime) / (searchCount + 1);

        set({ 
          searchResults: response.businesses,
          totalResults: response.total,
          hasMore: response.hasMore,
          isLoading: false,
          lastSearchTime: Date.now(),
          searchPerformance: {
            lastSearchTime: searchTime,
            averageSearchTime: newAverageTime,
            searchCount: searchCount + 1
          }
        });

        // Add to recent searches
        if (searchQuery) {
          get().addRecentSearch({ query: searchQuery, location: searchLocation });
        }

        logger.performance(`Search completed in ${searchTime.toFixed(2)}ms`);

      } catch (error) {
        logger.error('Search failed:', error);
        set({ 
          searchError: error.message,
          isLoading: false 
        });
      }
    },

    /**
     * Load more results (pagination)
     */
    loadMoreResults: async () => {
      const { 
        isLoading, 
        hasMore, 
        currentPage, 
        pageSize, 
        searchResults, 
        loadedPages,
        searchQuery,
        searchLocation,
        filters
      } = get();

      if (isLoading || !hasMore) return;

      const nextPage = currentPage + 1;
      
      if (loadedPages.has(nextPage)) {
        // Page already loaded, just update current page
        set({ currentPage: nextPage });
        return;
      }

      set({ isLoading: true });

      try {
        const searchParams = {
          query: searchQuery,
          location: searchLocation,
          ...filters,
          limit: pageSize,
          offset: (nextPage - 1) * pageSize
        };

        const response = await mockSearchAPI(searchParams);
        
        set({ 
          searchResults: [...searchResults, ...response.businesses],
          hasMore: response.hasMore,
          currentPage: nextPage,
          loadedPages: new Set([...loadedPages, nextPage]),
          isLoading: false
        });

      } catch (error) {
        logger.error('Load more failed:', error);
        set({ 
          searchError: error.message,
          isLoading: false 
        });
      }
    },

    /**
     * Update filters
     */
    updateFilters: (newFilters) => {
      const updatedFilters = { ...get().filters, ...newFilters };
      const activeCount = calculateActiveFiltersCount(updatedFilters);
      
      set({ 
        filters: updatedFilters,
        activeFiltersCount: activeCount
      });

      // Trigger new search with updated filters
      get().performSearch();
    },

    /**
     * Reset filters
     */
    resetFilters: () => {
      const defaultFilters = {
        categories: [],
        priceRange: [],
        rating: 0,
        distance: 25,
        features: [],
        openNow: false,
        verified: false,
        sortBy: 'relevance'
      };
      
      set({ 
        filters: defaultFilters,
        activeFiltersCount: 0
      });

      // Trigger new search with default filters
      get().performSearch();
    },

    /**
     * Change view mode
     */
    setViewMode: (viewMode) => {
      set({ viewMode });
      logger.interaction('view_mode_changed', { viewMode });
    },

    /**
     * Update map bounds and trigger search in area
     */
    updateMapBounds: (bounds) => {
      set({ mapBounds: bounds });
      
      // Debounce search when map bounds change
      const { searchInBounds } = get();
      clearTimeout(get().mapSearchTimeout);
      
      const timeout = setTimeout(() => {
        searchInBounds(bounds);
      }, 500);
      
      set({ mapSearchTimeout: timeout });
    },

    /**
     * Search in specific map bounds
     */
    searchInBounds: async (bounds) => {
      const { searchQuery, filters } = get();
      
      await get().performSearch({
        bounds,
        query: searchQuery,
        ...filters
      });
    },

    /**
     * Toggle filter panel visibility
     */
    toggleFilters: () => {
      set({ showFilters: !get().showFilters });
    },

    /**
     * Select a business
     */
    selectBusiness: (business) => {
      set({ selectedBusiness: business });
    },

    /**
     * Save/unsave a business
     */
    toggleSavedBusiness: (businessId) => {
      const { savedBusinesses } = get();
      const newSaved = new Set(savedBusinesses);
      
      if (newSaved.has(businessId)) {
        newSaved.delete(businessId);
      } else {
        newSaved.add(businessId);
      }
      
      set({ savedBusinesses: newSaved });
      
      // Persist to localStorage
      localStorage.setItem('saved_businesses', JSON.stringify([...newSaved]));
    },

    /**
     * Add to recent searches
     */
    addRecentSearch: (searchData) => {
      const { recentSearches } = get();
      const newRecent = [
        searchData,
        ...recentSearches.filter(s => 
          s.query !== searchData.query || s.location !== searchData.location
        )
      ].slice(0, 10); // Keep only 10 recent searches
      
      set({ recentSearches: newRecent });
      
      // Persist to localStorage
      localStorage.setItem('recent_searches', JSON.stringify(newRecent));
    },

    /**
     * Load saved data from localStorage
     */
    loadPersistedData: () => {
      try {
        // Load saved businesses
        const savedBusinessesData = localStorage.getItem('saved_businesses');
        if (savedBusinessesData) {
          const savedArray = JSON.parse(savedBusinessesData);
          set({ savedBusinesses: new Set(savedArray) });
        }

        // Load recent searches
        const recentSearchesData = localStorage.getItem('recent_searches');
        if (recentSearchesData) {
          const recent = JSON.parse(recentSearchesData);
          set({ recentSearches: recent });
        }
      } catch (error) {
        logger.error('Failed to load persisted data:', error);
      }
    },

    /**
     * Clear all search data
     */
    clearSearchData: () => {
      set({
        searchResults: [],
        totalResults: 0,
        hasMore: false,
        searchError: null,
        currentPage: 1,
        loadedPages: new Set([1]),
        selectedBusiness: null
      });
    },

    /**
     * Get search statistics
     */
    getSearchStats: () => {
      const { searchPerformance, searchResults, totalResults } = get();
      return {
        ...searchPerformance,
        resultsLoaded: searchResults.length,
        totalResults
      };
    }
  }))
);

/**
 * Calculate active filters count
 */
function calculateActiveFiltersCount(filters) {
  let count = 0;
  
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.priceRange.length > 0) count += filters.priceRange.length;
  if (filters.rating > 0) count += 1;
  if (filters.distance < 25) count += 1;
  if (filters.features.length > 0) count += filters.features.length;
  if (filters.openNow) count += 1;
  if (filters.verified) count += 1;
  if (filters.sortBy !== 'relevance') count += 1;
  
  return count;
}

/**
 * Mock search API implementation
 * TODO: Replace with real API calls
 */
async function mockSearchAPI(params) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  // Mock response based on parameters
  const mockBusinesses = Array.from({ length: Math.min(params.limit, 20) }, (_, i) => ({
    id: `business-${Date.now()}-${i}`,
    name: `Business ${i + 1} ${params.query || 'Sample'}`,
    slug: `business-${i + 1}-${(params.query || 'sample').toLowerCase().replace(/\s+/g, '-')}`,
    description: `A great ${params.query || 'business'} located in ${params.location || 'your area'}`,
    address: `${100 + i} Main Street`,
    city: params.location?.split(',')[0] || 'San Francisco',
    state: 'CA',
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    phone: `(555) ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    website: `https://example-${i}.com`,
    rating: Math.round((3 + Math.random() * 2) * 2) / 2, // 3.0 to 5.0 in 0.5 increments
    reviewCount: Math.floor(Math.random() * 500) + 10,
    priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
    verified: Math.random() > 0.3,
    photos: Math.random() > 0.5 ? [`https://picsum.photos/400/300?random=${i}`] : [],
    categories: [
      {
        slug: params.categories?.[0] || ['restaurant', 'retail', 'service'][Math.floor(Math.random() * 3)],
        name: params.categories?.[0] || ['Restaurant', 'Retail', 'Service'][Math.floor(Math.random() * 3)]
      }
    ],
    isOpenNow: Math.random() > 0.3,
    distance: Math.round((Math.random() * params.distance || 10) * 10) / 10
  }));

  const total = Math.floor(Math.random() * 200) + 50;
  const hasMore = (params.offset || 0) + mockBusinesses.length < total;

  return {
    businesses: mockBusinesses,
    total,
    hasMore,
    searchTime: Math.random() * 100 + 50 // Mock search time in ms
  };
}

// Selector hooks for better performance
export const useSearchResults = () => useEnhancedSearchStore(state => state.searchResults);
export const useSearchLoading = () => useEnhancedSearchStore(state => state.isLoading);
export const useSearchFilters = () => useEnhancedSearchStore(state => state.filters);
export const useViewMode = () => useEnhancedSearchStore(state => state.viewMode);
export const useActiveFiltersCount = () => useEnhancedSearchStore(state => state.activeFiltersCount);

export default useEnhancedSearchStore;
