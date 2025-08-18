/**
 * Location Validation and Error Handling System
 * Comprehensive validation, error handling, and data sanitization for location data
 */

import { logger } from '@lib/utils/logger';

/**
 * Location validation errors
 */
export class LocationValidationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'LocationValidationError';
    this.code = code;
    this.details = details;
  }
}

export class GeolocationError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'GeolocationError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class APIError extends Error {
  constructor(message, status, endpoint, response = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
    this.response = response;
  }
}

/**
 * Location validation schema
 */
export const locationValidationRules = {
  coordinates: {
    lat: {
      required: true,
      type: 'number',
      min: -90,
      max: 90,
      precision: 8
    },
    lng: {
      required: true,
      type: 'number',
      min: -180,
      max: 180,
      precision: 8
    }
  },
  address: {
    formattedAddress: {
      type: 'string',
      maxLength: 500,
      required: false
    },
    city: {
      type: 'string',
      maxLength: 100,
      required: false
    },
    state: {
      type: 'string',
      maxLength: 50,
      required: false
    },
    country: {
      type: 'string',
      maxLength: 2,
      pattern: /^[A-Z]{2}$/,
      default: 'US'
    },
    postalCode: {
      type: 'string',
      maxLength: 20,
      required: false
    }
  },
  metadata: {
    placeId: {
      type: 'string',
      maxLength: 200,
      required: false
    },
    confidence: {
      type: 'number',
      min: 0,
      max: 1,
      default: 0.8
    },
    types: {
      type: 'array',
      required: false,
      default: []
    }
  }
};

/**
 * Core validation functions
 */
export const locationValidator = {
  /**
   * Validate coordinates
   */
  validateCoordinates(lat, lng, options = {}) {
    const { precision = 8, strict = true } = options;
    
    const errors = [];
    
    // Check if coordinates exist
    if (lat === undefined || lat === null) {
      errors.push({
        field: 'lat',
        code: 'REQUIRED',
        message: 'Latitude is required'
      });
    }
    
    if (lng === undefined || lng === null) {
      errors.push({
        field: 'lng',
        code: 'REQUIRED',
        message: 'Longitude is required'
      });
    }
    
    if (errors.length > 0) {
      throw new LocationValidationError(
        'Missing coordinates',
        'INVALID_COORDINATES',
        { errors }
      );
    }
    
    // Convert to numbers
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    
    // Check if valid numbers
    if (isNaN(numLat) || isNaN(numLng)) {
      throw new LocationValidationError(
        'Coordinates must be valid numbers',
        'INVALID_COORDINATES',
        { lat: numLat, lng: numLng }
      );
    }
    
    // Check latitude range
    if (numLat < -90 || numLat > 90) {
      errors.push({
        field: 'lat',
        code: 'OUT_OF_RANGE',
        message: 'Latitude must be between -90 and 90',
        value: numLat
      });
    }
    
    // Check longitude range
    if (numLng < -180 || numLng > 180) {
      errors.push({
        field: 'lng',
        code: 'OUT_OF_RANGE',
        message: 'Longitude must be between -180 and 180',
        value: numLng
      });
    }
    
    // Check precision in strict mode
    if (strict && precision > 0) {
      const latStr = numLat.toString();
      const lngStr = numLng.toString();
      
      const latPrecision = latStr.includes('.') ? 
        latStr.split('.')[1].length : 0;
      const lngPrecision = lngStr.includes('.') ? 
        lngStr.split('.')[1].length : 0;
      
      if (latPrecision > precision || lngPrecision > precision) {
        logger.warn('Coordinates precision exceeds limit', {
          lat: numLat,
          lng: numLng,
          latPrecision,
          lngPrecision,
          maxPrecision: precision
        });
      }
    }
    
    if (errors.length > 0) {
      throw new LocationValidationError(
        'Invalid coordinates',
        'INVALID_COORDINATES',
        { errors }
      );
    }
    
    return {
      lat: parseFloat(numLat.toFixed(precision)),
      lng: parseFloat(numLng.toFixed(precision))
    };
  },

  /**
   * Validate location object
   */
  validateLocation(location, options = {}) {
    const { strict = false, required = ['lat', 'lng'] } = options;
    
    if (!location || typeof location !== 'object') {
      throw new LocationValidationError(
        'Location must be an object',
        'INVALID_LOCATION',
        { location }
      );
    }
    
    const errors = [];
    const validated = {};
    
    // Validate coordinates
    try {
      if (location.lat !== undefined || location.lng !== undefined || required.includes('lat') || required.includes('lng')) {
        const coords = this.validateCoordinates(location.lat, location.lng);
        validated.lat = coords.lat;
        validated.lng = coords.lng;
      }
    } catch (error) {
      if (required.includes('lat') || required.includes('lng')) {
        throw error;
      }
      errors.push({
        field: 'coordinates',
        code: 'INVALID_COORDINATES',
        message: error.message
      });
    }
    
    // Validate address fields
    const addressFields = ['formattedAddress', 'address', 'city', 'state', 'country', 'postalCode'];
    addressFields.forEach(field => {
      if (location[field] !== undefined) {
        const value = location[field];
        const rule = locationValidationRules.address[field];
        
        if (rule) {
          // Type validation
          if (rule.type === 'string' && typeof value !== 'string') {
            errors.push({
              field,
              code: 'INVALID_TYPE',
              message: `${field} must be a string`,
              value
            });
            return;
          }
          
          // Length validation
          if (rule.maxLength && value.length > rule.maxLength) {
            if (strict) {
              errors.push({
                field,
                code: 'TOO_LONG',
                message: `${field} exceeds maximum length of ${rule.maxLength}`,
                value: value.length
              });
            } else {
              validated[field] = value.substring(0, rule.maxLength);
            }
          } else {
            validated[field] = value;
          }
          
          // Pattern validation
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
              field,
              code: 'INVALID_PATTERN',
              message: `${field} format is invalid`,
              value
            });
          }
        }
      }
    });
    
    // Apply defaults
    if (!validated.country) {
      validated.country = locationValidationRules.address.country.default;
    }
    
    // Validate metadata
    const metadataFields = ['placeId', 'confidence', 'types'];
    metadataFields.forEach(field => {
      if (location[field] !== undefined) {
        const value = location[field];
        const rule = locationValidationRules.metadata[field];
        
        if (rule) {
          if (rule.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              errors.push({
                field,
                code: 'INVALID_TYPE',
                message: `${field} must be a number`,
                value
              });
            } else if (rule.min !== undefined && numValue < rule.min) {
              errors.push({
                field,
                code: 'TOO_SMALL',
                message: `${field} must be at least ${rule.min}`,
                value: numValue
              });
            } else if (rule.max !== undefined && numValue > rule.max) {
              errors.push({
                field,
                code: 'TOO_LARGE',
                message: `${field} must be at most ${rule.max}`,
                value: numValue
              });
            } else {
              validated[field] = numValue;
            }
          } else if (rule.type === 'string') {
            if (typeof value !== 'string') {
              errors.push({
                field,
                code: 'INVALID_TYPE',
                message: `${field} must be a string`,
                value
              });
            } else {
              validated[field] = value;
            }
          } else if (rule.type === 'array') {
            if (!Array.isArray(value)) {
              errors.push({
                field,
                code: 'INVALID_TYPE',
                message: `${field} must be an array`,
                value
              });
            } else {
              validated[field] = value;
            }
          }
        }
      }
    });
    
    // Apply metadata defaults
    if (validated.confidence === undefined) {
      validated.confidence = locationValidationRules.metadata.confidence.default;
    }
    if (validated.types === undefined) {
      validated.types = locationValidationRules.metadata.types.default;
    }
    
    // Add timestamp
    validated.timestamp = Date.now();
    
    if (strict && errors.length > 0) {
      throw new LocationValidationError(
        'Location validation failed',
        'VALIDATION_FAILED',
        { errors }
      );
    }
    
    if (errors.length > 0) {
      logger.warn('Location validation warnings', { errors, location });
    }
    
    return validated;
  },

  /**
   * Sanitize location input
   */
  sanitizeLocationInput(input) {
    if (typeof input === 'string') {
      return input.trim().substring(0, 500); // Max length for address input
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      
      // Sanitize each field
      Object.keys(input).forEach(key => {
        const value = input[key];
        
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else if (typeof value === 'number') {
          sanitized[key] = value;
        } else if (Array.isArray(value)) {
          sanitized[key] = value;
        }
      });
      
      return sanitized;
    }
    
    return input;
  },

  /**
   * Check if location is within bounds
   */
  isLocationWithinBounds(location, bounds) {
    try {
      const coords = this.validateCoordinates(location.lat, location.lng);
      
      return (
        coords.lat >= bounds.south &&
        coords.lat <= bounds.north &&
        coords.lng >= bounds.west &&
        coords.lng <= bounds.east
      );
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if two locations are the same
   */
  areLocationsEqual(location1, location2, precision = 6) {
    try {
      const coords1 = this.validateCoordinates(location1.lat, location1.lng);
      const coords2 = this.validateCoordinates(location2.lat, location2.lng);
      
      const lat1Fixed = coords1.lat.toFixed(precision);
      const lng1Fixed = coords1.lng.toFixed(precision);
      const lat2Fixed = coords2.lat.toFixed(precision);
      const lng2Fixed = coords2.lng.toFixed(precision);
      
      return lat1Fixed === lat2Fixed && lng1Fixed === lng2Fixed;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Error handling utilities
 */
export const locationErrorHandler = {
  /**
   * Handle geolocation errors
   */
  handleGeolocationError(error) {
    let message, code;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "Location access denied. Please enable location permissions.";
        code = 'PERMISSION_DENIED';
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location unavailable. Please try again.";
        code = 'POSITION_UNAVAILABLE';
        break;
      case error.TIMEOUT:
        message = "Location request timed out. Please try again.";
        code = 'TIMEOUT';
        break;
      default:
        message = "Unable to get location. Please try again.";
        code = 'UNKNOWN_ERROR';
        break;
    }
    
    logger.error('Geolocation error', {
      code: error.code,
      message: error.message,
      timestamp: Date.now()
    });
    
    return new GeolocationError(message, code, error);
  },

  /**
   * Handle API errors
   */
  handleAPIError(response, endpoint) {
    let message;
    
    switch (response.status) {
      case 400:
        message = "Invalid location request. Please check your input.";
        break;
      case 401:
        message = "Location service authentication failed.";
        break;
      case 403:
        message = "Location service access forbidden.";
        break;
      case 404:
        message = "Location not found.";
        break;
      case 429:
        message = "Too many location requests. Please try again later.";
        break;
      case 500:
        message = "Location service temporarily unavailable.";
        break;
      default:
        message = "Location service error. Please try again.";
        break;
    }
    
    logger.error('Location API error', {
      status: response.status,
      endpoint,
      timestamp: Date.now()
    });
    
    return new APIError(message, response.status, endpoint, response);
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error) {
    if (error instanceof GeolocationError) {
      switch (error.code) {
        case 'PERMISSION_DENIED':
          return {
            title: "Location Access Denied",
            message: "Please enable location permissions in your browser settings to use this feature.",
            action: "Enable Location"
          };
        case 'POSITION_UNAVAILABLE':
          return {
            title: "Location Unavailable",
            message: "We couldn't determine your location. You can search for a location manually.",
            action: "Search Manually"
          };
        case 'TIMEOUT':
          return {
            title: "Location Timeout",
            message: "Location detection is taking too long. Please try again or search manually.",
            action: "Try Again"
          };
        default:
          return {
            title: "Location Error",
            message: "Unable to detect your location. Please search for a location manually.",
            action: "Search Manually"
          };
      }
    }
    
    if (error instanceof APIError) {
      return {
        title: "Service Error",
        message: "Our location service is temporarily unavailable. Please try again.",
        action: "Retry"
      };
    }
    
    if (error instanceof LocationValidationError) {
      return {
        title: "Invalid Location",
        message: "The location information is invalid. Please try a different location.",
        action: "Try Again"
      };
    }
    
    return {
      title: "Unexpected Error",
      message: "Something went wrong. Please try again.",
      action: "Retry"
    };
  }
};

export default {
  locationValidator,
  locationErrorHandler,
  LocationValidationError,
  GeolocationError,
  APIError
};
