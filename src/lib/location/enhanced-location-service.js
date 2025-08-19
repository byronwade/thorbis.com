/**
 * Enhanced Location Service
 * Feature-rich location management with smart suggestions, favorites, and caching
 * Enterprise-level location functionality with performance optimization
 */

"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import logger from '@lib/utils/logger';
import { googleMapsService } from './google-maps-service';

/**
 * Location data structure
 */
export const createLocationObject = ({
  lat,
  lng,
  address,
  city,
  state,
  country = 'US',
  postalCode,
  placeId,
  types = [],
  formattedAddress,
  shortName,
  confidence = 1.0
}) => ({
  lat: parseFloat(lat),
  lng: parseFloat(lng),
  address: address || '',
  city: city || '',
  state: state || '',
  country,
  postalCode: postalCode || '',
  placeId: placeId || '',
  types,
  formattedAddress: formattedAddress || `${city}, ${state}`.replace(/^, |, $/, ''),
  shortName: shortName || city || address || 'Unknown Location',
  confidence,
  timestamp: Date.now()
});

/**
 * Enhanced Location Store with advanced features
 */
export const useLocationStore = create(
  persist(
    (set, get) => ({
      // Current location
      currentLocation: null,
      isGettingLocation: false,
      locationError: null,

      // Location history and favorites
      recentLocations: [],
      favoriteLocations: [],
      savedAddresses: [],

      // Search and suggestions
      searchQuery: '',
      searchSuggestions: [],
      isLoadingSuggestions: false,

      // User preferences
      preferences: {
        useCurrentLocation: true,
        defaultRadius: 25, // km
        preferredLocationType: 'current', // 'current', 'saved', 'custom'
        showMapPreview: true,
        autoDetectLocation: true,
        saveSearchHistory: true
      },

      // Location cache for performance
      locationCache: new Map(),

      /**
       * Get current location using Google Geolocation API
       */
      getCurrentLocation: async (options = {}) => {
        const startTime = performance.now();
        
        set({ isGettingLocation: true, locationError: null });

        try {
          // Use Google Maps service for enhanced location detection
          const location = await googleMapsService.getCurrentLocation(options);

          set({ 
            currentLocation: location,
            isGettingLocation: false,
            locationError: null
          });

          // Add to recent locations
          get().addToRecentLocations(location);

          const duration = performance.now() - startTime;
          logger.performance(`Google location detection completed in ${duration.toFixed(2)}ms`);

          return location;

        } catch (error) {
          set({ 
            isGettingLocation: false,
            locationError: error.message 
          });
          
          logger.error('Google location detection failed:', error);
          throw error;
        }
      },

      /**
       * Geocode and verify address using Google Maps API
       */
      geocodeAddress: async (address, options = {}) => {
        const startTime = performance.now();
        
        // Check cache first
        const cacheKey = `geocode_${address.toLowerCase()}`;
        const cached = get().locationCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
          return cached.data;
        }

        try {
          // Use Google Maps service for address verification and geocoding
          const verifiedAddress = await googleMapsService.verifyAddress(address, {
            verifyZipCode: true,
            ...options
          });

          const location = createLocationObject({
            lat: verifiedAddress.lat,
            lng: verifiedAddress.lng,
            address: verifiedAddress.streetNumber + ' ' + verifiedAddress.route,
            city: verifiedAddress.city,
            state: verifiedAddress.state,
            country: verifiedAddress.country,
            postalCode: verifiedAddress.postalCode,
            placeId: verifiedAddress.placeId,
            formattedAddress: verifiedAddress.formattedAddress,
            confidence: verifiedAddress.confidence
          });

          // Cache the result
          get().locationCache.set(cacheKey, {
            data: location,
            timestamp: Date.now()
          });

          const duration = performance.now() - startTime;
          logger.performance(`Google geocoding completed in ${duration.toFixed(2)}ms`);

          return location;

        } catch (error) {
          logger.error('Google geocoding error:', error);
          throw error;
        }
      },

      /**
       * Reverse geocode coordinates to address
       */
      reverseGeocode: async (lat, lng) => {
        const startTime = performance.now();
        
        // Validate coordinates
        if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error('Invalid coordinates provided');
        }

        // Check cache first
        const cacheKey = `reverse_${lat}_${lng}`;
        const cached = get().locationCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
          return cached.data;
        }

        try {
          const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          
          if (!response.ok) {
            throw new Error(`Reverse geocoding failed: ${response.status}`);
          }

          const data = await response.json();

          const location = createLocationObject({
            lat,
            lng,
            address: data.formatted_address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'US',
            postalCode: data.postal_code || '',
            placeId: data.place_id || '',
            formattedAddress: data.formatted_address || `${data.city}, ${data.state}`,
            confidence: data.confidence || 0.9
          });

          // Cache the result
          get().locationCache.set(cacheKey, {
            data: location,
            timestamp: Date.now()
          });

          const duration = performance.now() - startTime;
          logger.performance(`Reverse geocoding completed in ${duration.toFixed(2)}ms`);

          return location;

        } catch (error) {
          logger.error('Reverse geocoding error:', error);
          throw error;
        }
      },

      /**
       * Get location suggestions with enhanced features
       */
      getLocationSuggestions: async (query, options = {}) => {
        if (!query || query.length < 2) {
          set({ searchSuggestions: [], isLoadingSuggestions: false });
          return [];
        }

        set({ isLoadingSuggestions: true, searchQuery: query });

        try {
          // Combine multiple suggestion sources
          const [
            googleSuggestions,
            recentMatches,
            favoriteMatches
          ] = await Promise.all([
            get().fetchGooglePlacesSuggestions(query, options),
            get().searchRecentLocations(query),
            get().searchFavoriteLocations(query)
          ]);

          // Merge and prioritize suggestions
          const suggestions = [
            ...favoriteMatches.map(loc => ({ ...loc, type: 'favorite', priority: 1 })),
            ...recentMatches.map(loc => ({ ...loc, type: 'recent', priority: 2 })),
            ...googleSuggestions.map(loc => ({ ...loc, type: 'suggestion', priority: 3 }))
          ]
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 10);

          set({ 
            searchSuggestions: suggestions,
            isLoadingSuggestions: false 
          });

          return suggestions;

        } catch (error) {
          logger.error('Error fetching location suggestions:', error);
          set({ searchSuggestions: [], isLoadingSuggestions: false });
          return [];
        }
      },

      /**
       * Fetch Google Places API suggestions
       */
      fetchGooglePlacesSuggestions: async (query, options = {}) => {
        try {
          const params = new URLSearchParams({
            input: query,
            types: options.types || 'geocode',
            language: options.language || 'en',
            ...(options.location && {
              location: `${options.location.lat},${options.location.lng}`,
              radius: options.radius || '50000'
            })
          });

          const response = await fetch(`/api/places/autocomplete?${params}`);
          
          if (!response.ok) {
            throw new Error(`Places API failed: ${response.status}`);
          }

          const data = await response.json();

          return (data.predictions || []).map(prediction => ({
            placeId: prediction.place_id,
            shortName: prediction.structured_formatting?.main_text || prediction.description,
            formattedAddress: prediction.description,
            types: prediction.types || [],
            confidence: 0.8,
            matchedSubstrings: prediction.matched_substrings || []
          }));

        } catch (error) {
          logger.error('Google Places suggestions error:', error);
          return [];
        }
      },

      /**
       * Search recent locations
       */
      searchRecentLocations: (query) => {
        const recent = get().recentLocations;
        const queryLower = query.toLowerCase();
        
        return recent.filter(location => 
          location.shortName?.toLowerCase().includes(queryLower) ||
          location.formattedAddress?.toLowerCase().includes(queryLower) ||
          location.city?.toLowerCase().includes(queryLower)
        );
      },

      /**
       * Search favorite locations
       */
      searchFavoriteLocations: (query) => {
        const favorites = get().favoriteLocations;
        const queryLower = query.toLowerCase();
        
        return favorites.filter(location => 
          location.shortName?.toLowerCase().includes(queryLower) ||
          location.formattedAddress?.toLowerCase().includes(queryLower) ||
          location.city?.toLowerCase().includes(queryLower)
        );
      },

      /**
       * Add location to recent locations
       */
      addToRecentLocations: (location) => {
        const recentLocations = get().recentLocations;
        
        // Remove if already exists
        const filtered = recentLocations.filter(
          recent => recent.placeId !== location.placeId &&
          !(recent.lat === location.lat && recent.lng === location.lng)
        );

        // Add to beginning and limit to 20
        const updated = [location, ...filtered].slice(0, 20);
        
        set({ recentLocations: updated });
      },

      /**
       * Add location to favorites
       */
      addToFavorites: (location, customName = null) => {
        const favoriteLocations = get().favoriteLocations;
        
        // Check if already exists
        const exists = favoriteLocations.some(
          fav => fav.placeId === location.placeId ||
          (fav.lat === location.lat && fav.lng === location.lng)
        );

        if (!exists) {
          const favoriteLocation = {
            ...location,
            customName,
            addedAt: Date.now()
          };
          
          set({ 
            favoriteLocations: [...favoriteLocations, favoriteLocation] 
          });
        }
      },

      /**
       * Remove from favorites
       */
      removeFromFavorites: (location) => {
        const favoriteLocations = get().favoriteLocations;
        
        const updated = favoriteLocations.filter(
          fav => fav.placeId !== location.placeId &&
          !(fav.lat === location.lat && fav.lng === location.lng)
        );
        
        set({ favoriteLocations: updated });
      },

      /**
       * Save address with custom label
       */
      saveAddress: (location, label, type = 'custom') => {
        const savedAddresses = get().savedAddresses;
        
        const address = {
          ...location,
          label,
          type, // 'home', 'work', 'custom'
          savedAt: Date.now()
        };
        
        // Remove existing address with same label
        const updated = savedAddresses.filter(addr => addr.label !== label);
        
        set({ 
          savedAddresses: [...updated, address] 
        });
      },

      /**
       * Get nearby places of interest
       */
      getNearbyPlaces: async (location, types = ['establishment'], radius = 5000) => {
        try {
          const params = new URLSearchParams({
            lat: location.lat,
            lng: location.lng,
            types: types.join(','),
            radius
          });

          const response = await fetch(`/api/places/nearby?${params}`);
          
          if (!response.ok) {
            throw new Error(`Nearby places API failed: ${response.status}`);
          }

          const data = await response.json();
          return data.results || [];

        } catch (error) {
          logger.error('Error fetching nearby places:', error);
          return [];
        }
      },

      /**
       * Update user preferences
       */
      updatePreferences: (updates) => {
        set(state => ({
          preferences: { ...state.preferences, ...updates }
        }));
      },

      /**
       * Clear location data
       */
      clearCurrentLocation: () => {
        set({ 
          currentLocation: null,
          locationError: null 
        });
      },

      /**
       * Clear all location data
       */
      clearAllLocationData: () => {
        set({
          currentLocation: null,
          recentLocations: [],
          favoriteLocations: [],
          savedAddresses: [],
          searchSuggestions: [],
          locationError: null,
          searchQuery: ''
        });
        get().locationCache.clear();
      }
    }),
    {
      name: 'enhanced-location-storage',
      partialize: (state) => ({
        recentLocations: state.recentLocations,
        favoriteLocations: state.favoriteLocations,
        savedAddresses: state.savedAddresses,
        preferences: state.preferences
      })
    }
  )
);

/**
 * Location utility functions
 */
export const locationUtils = {
  /**
   * Calculate distance between two locations
   */
  calculateDistance: (loc1, loc2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Format distance for display
   */
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  },

  /**
   * Format location for display
   */
  formatLocationDisplay: (location, options = {}) => {
    const { showFull = false, showState = true, showCountry = false } = options;
    
    if (!location) return 'Unknown Location';
    
    if (location.customName) {
      return location.customName;
    }
    
    if (showFull) {
      return location.formattedAddress || location.address;
    }
    
    let display = location.city || location.shortName || '';
    
    if (showState && location.state) {
      display += `, ${location.state}`;
    }
    
    if (showCountry && location.country && location.country !== 'US') {
      display += `, ${location.country}`;
    }
    
    return display || 'Unknown Location';
  },

  /**
   * Validate location object
   */
  isValidLocation: (location) => {
    return location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number' &&
      location.lat >= -90 && location.lat <= 90 &&
      location.lng >= -180 && location.lng <= 180;
  },

  /**
   * Get location type icon
   */
  getLocationTypeIcon: (location) => {
    if (location.isCurrentLocation) return '📍';
    if (location.type === 'favorite') return '⭐';
    if (location.type === 'recent') return '🕐';
    if (location.type === 'home') return '🏠';
    if (location.type === 'work') return '🏢';
    return '📍';
  }
};

export default useLocationStore;
