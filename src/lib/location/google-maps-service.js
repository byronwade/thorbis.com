/**
 * Google Maps Integration Service
 * Provides Google Maps API integration for geocoding, address verification, and location services
 * Includes zip code verification and current location detection
 */

"use client";

import logger from '@lib/utils/logger';

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    this.geocodingBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    this.placesBaseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.geolocationBaseUrl = 'https://www.googleapis.com/geolocation/v1/geolocate';
    
    if (!this.apiKey) {
      logger.warn('Google Maps API key not found. Some features may be limited.');
    }
  }

  /**
   * Verify and format address using Google Geocoding API
   * Includes zip code verification and address standardization
   */
  async verifyAddress(address, options = {}) {
    const startTime = performance.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const params = new URLSearchParams({
        address: address,
        components: 'country:US', // Restrict to US for better results
        ...options
      });

      const response = await fetch(`/api/geocode?${params}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`No results found for address: ${address}`);
      }

      const result = data.results[0];
      const addressComponents = result.address_components;

      // Extract address components
      const components = this.extractAddressComponents(addressComponents);
      
      // Verify zip code if provided
      if (components.postalCode && options.verifyZipCode) {
        const zipVerification = await this.verifyZipCode(components.postalCode, components.state);
        if (!zipVerification.isValid) {
          throw new Error(`Invalid zip code: ${components.postalCode}`);
        }
      }

      const verifiedAddress = {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        ...components,
        confidence: this.calculateConfidence(result),
        types: result.types,
        timestamp: Date.now()
      };

      const duration = performance.now() - startTime;
      logger.performance(`Address verification completed in ${duration.toFixed(2)}ms`);

      return verifiedAddress;

    } catch (error) {
      logger.error('Address verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify zip code using Google Geocoding API
   */
  async verifyZipCode(zipCode, state = null) {
    try {
      const searchQuery = state ? `${zipCode}, ${state}` : zipCode;
      const params = new URLSearchParams({
        address: searchQuery,
        components: 'country:US'
      });

      const response = await fetch(`/api/geocode?${params}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const components = this.extractAddressComponents(result.address_components);
        
        return {
          isValid: true,
          zipCode: components.postalCode,
          city: components.city,
          state: components.state,
          country: components.country,
          formattedAddress: result.formatted_address
        };
      }

      return { isValid: false, error: 'Invalid zip code' };

    } catch (error) {
      logger.error('Zip code verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Get current location using Google Geolocation API (more accurate than browser geolocation)
   */
  async getCurrentLocation(options = {}) {
    const startTime = performance.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      let browserLocation = null;
      
      // Try browser geolocation first (with graceful error handling)
      try {
        browserLocation = await this.getBrowserLocation();
      } catch (error) {
        logger.warn('Browser geolocation failed, trying Google Geolocation API:', error.message);
        // Continue without browser location
      }
      
      // Try Google Geolocation API (works even without browser location)
      let googleLocation = null;
      try {
        googleLocation = await this.getGoogleGeolocation(browserLocation, options);
      } catch (googleError) {
        logger.warn('Google Geolocation failed, using browser location:', googleError.message);
        if (!browserLocation) {
          throw new Error('No location available - both browser and Google geolocation failed');
        }
        googleLocation = browserLocation;
      }

      // Try to reverse geocode to get address details
      let addressDetails = {};
      try {
        addressDetails = await this.reverseGeocode(googleLocation.lat, googleLocation.lng);
      } catch (geocodeError) {
        logger.warn('Reverse geocoding failed, using coordinates only:', geocodeError.message);
        // Continue without address details
      }

      const currentLocation = {
        ...googleLocation,
        ...addressDetails,
        isCurrentLocation: true,
        accuracy: googleLocation.accuracy,
        timestamp: Date.now()
      };

      const duration = performance.now() - startTime;
      logger.performance(`Current location detection completed in ${duration.toFixed(2)}ms`);

      return currentLocation;

    } catch (error) {
      logger.error('Current location detection failed:', error);
      throw error;
    }
  }

  /**
   * Get browser geolocation as fallback
   */
  async getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Check if geolocation is allowed
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            reject(new Error('Geolocation permission denied'));
            return;
          }
        }).catch(() => {
          // Permissions API not supported, continue anyway
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          // Handle specific geolocation errors gracefully
          let errorMessage = 'Geolocation failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Geolocation permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Geolocation error: ${error.message}`;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false, // Changed to false to avoid permissions policy issues
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Use Google Geolocation API for enhanced accuracy
   */
  async getGoogleGeolocation(browserLocation, options = {}) {
    try {
      const payload = {
        homeMobileCountryCode: 310, // US
        homeMobileNetworkCode: 260, // T-Mobile (example)
        radioType: 'lte',
        carrier: 'T-Mobile',
        considerIp: true,
        ...options
      };

      // Add browser location if available
      if (browserLocation) {
        payload.location = {
          latE7: Math.round(browserLocation.lat * 1e7),
          lngE7: Math.round(browserLocation.lng * 1e7),
          accuracy: browserLocation.accuracy
        };
      }

      const response = await fetch('/api/geolocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.location) {
        throw new Error('No location data received from Google Geolocation API');
      }

      return {
        lat: data.location.lat,
        lng: data.location.lng,
        accuracy: data.accuracy || browserLocation?.accuracy || 100
      };

    } catch (error) {
      logger.error('Google Geolocation failed, falling back to browser location:', error);
      return browserLocation;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    try {
      const params = new URLSearchParams({
        latlng: `${lat},${lng}`,
        result_type: 'street_address|locality|postal_code'
      });

      const response = await fetch(`/api/geocode?${params}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const components = this.extractAddressComponents(result.address_components);
        
        return {
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          ...components
        };
      }

      throw new Error('Reverse geocoding failed');

    } catch (error) {
      logger.error('Reverse geocoding failed:', error);
      throw error;
    }
  }

  /**
   * Search for locations using Google Places API
   */
  async searchLocations(query, options = {}) {
    try {
      const params = new URLSearchParams({
        input: query,
        types: options.types || 'geocode',
        components: 'country:US',
        ...options
      });

      const response = await fetch(`/api/places/autocomplete?${params}`);
      const data = await response.json();

      return data.predictions || [];

    } catch (error) {
      logger.error('Location search failed:', error);
      throw error;
    }
  }

  /**
   * Extract address components from Google Geocoding response
   */
  extractAddressComponents(addressComponents) {
    const components = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      neighborhood: '',
      sublocality: ''
    };

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        components.route = component.long_name;
      } else if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name;
      } else if (types.includes('country')) {
        components.country = component.short_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      } else if (types.includes('neighborhood')) {
        components.neighborhood = component.long_name;
      } else if (types.includes('sublocality')) {
        components.sublocality = component.long_name;
      }
    });

    return components;
  }

  /**
   * Calculate confidence score for geocoding result
   */
  calculateConfidence(result) {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on result types
    if (result.types.includes('street_address')) {
      confidence += 0.3;
    } else if (result.types.includes('locality')) {
      confidence += 0.2;
    } else if (result.types.includes('postal_code')) {
      confidence += 0.1;
    }

    // Boost confidence based on geometry accuracy
    if (result.geometry.location_type === 'ROOFTOP') {
      confidence += 0.2;
    } else if (result.geometry.location_type === 'RANGE_INTERPOLATED') {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}

// Create singleton instance
export const googleMapsService = new GoogleMapsService();

// Export for use in other modules
export default googleMapsService;
