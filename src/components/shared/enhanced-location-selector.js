/**
 * Enhanced Location Selector Component
 * Feature-rich, visually appealing location selection with maps, favorites, and smart suggestions
 * Enterprise-level UX with performance optimization
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Card, CardContent } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@components/ui/dropdown-menu';
import {
  MapPin,
  Search,
  Navigation,
  Star,
  Clock,
  Home,
  Building2,
  Globe,
  Crosshair,
  Settings,
  Heart,
  X,
  Loader2,
  ChevronDown,
  Map,
  Target
} from 'lucide-react';
import { useLocationStore, locationUtils } from '@lib/location/enhanced-location-service';
import { googleMapsService } from '@lib/location/google-maps-service';
import { cn } from '@lib/utils';
import logger from '@lib/utils/logger';

/**
 * Enhanced Location Selector with advanced features
 */
const EnhancedLocationSelector = React.memo(({
  value,
  onChange,
  placeholder = "Where to?",
  className = "",
  size = "default",
  showMapPreview = false,
  showFavorites = true,
  showRecent = true,
  showCurrentLocation = true,
  allowCustomization = true,
  variant = "default"
}) => {
  // Component state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(value);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [businessSuggestions, setBusinessSuggestions] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Location store
  const {
    currentLocation,
    isGettingLocation,
    locationError,
    recentLocations,
    favoriteLocations,
    savedAddresses,
    searchSuggestions,
    isLoadingSuggestions,
    preferences,
    getCurrentLocation,
    getLocationSuggestions,
    addToFavorites,
    removeFromFavorites,
    addToRecentLocations,
    saveAddress,
    set
  } = useLocationStore();

  // Size configurations
  const sizeConfig = {
    small: {
      button: "h-7 text-xs px-2.5",
      input: "h-8 text-sm",
      dropdown: "w-80",
      icon: "w-4 h-4"
    },
    default: {
      button: "h-8 text-sm px-3",
      input: "h-10 text-base", 
      dropdown: "w-96",
      icon: "w-5 h-5"
    },
    large: {
      button: "h-10 text-base px-4",
      input: "h-12 text-lg",
      dropdown: "w-[28rem]",
      icon: "w-6 h-6"
    }
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantStyles = {
    default: "border-neutral-700/50 bg-transparent text-white placeholder:text-neutral-400 hover:bg-neutral-800/30 hover:border-neutral-600",
    filled: "border-neutral-600 bg-neutral-800/20 text-white placeholder:text-neutral-400 hover:bg-neutral-800/40",
    outlined: "border border-primary/30 bg-transparent text-white placeholder:text-neutral-400 hover:border-primary/50"
  };

  // Handle business search
  const handleBusinessSearch = useCallback(
    async (query) => {
      if (query.length > 1 && !isLoadingBusinesses) {
        setIsLoadingBusinesses(true);
        
        try {
          const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}&limit=5`);
          const data = await response.json();
          
          if (response.ok) {
            setBusinessSuggestions(data.businesses || []);
          } else {
            logger.error('Business search failed:', data.error);
            setBusinessSuggestions([]);
          }
        } catch (error) {
          logger.error('Business search error:', error);
          setBusinessSuggestions([]);
        } finally {
          setIsLoadingBusinesses(false);
        }
      } else if (query.length <= 1) {
        setBusinessSuggestions([]);
      }
    },
    [isLoadingBusinesses]
  );

  // Handle search input changes with simplified location search
  const handleSearchChange = useCallback(
    async (query) => {
      setSearchQuery(query);
      
      if (query.length > 1 && !isSearching) {
        setIsSearching(true);
        set({ isLoadingSuggestions: true });
        
        try {
          // Create simple location suggestions based on common patterns
          const searchTerm = query.toLowerCase();
          const commonCities = [
            'San Francisco, CA',
            'New York, NY',
            'Los Angeles, CA',
            'Chicago, IL',
            'Houston, TX',
            'Phoenix, AZ',
            'Philadelphia, PA',
            'San Antonio, TX',
            'San Diego, CA',
            'Dallas, TX',
            'Austin, TX',
            'Jacksonville, FL',
            'Fort Worth, TX',
            'Columbus, OH',
            'Charlotte, NC',
            'San Jose, CA',
            'Indianapolis, IN',
            'Seattle, WA',
            'Denver, CO',
            'Washington, DC'
          ];
          
          const matchingCities = commonCities
            .filter(city => city.toLowerCase().includes(searchTerm))
            .slice(0, 5)
            .map(city => {
              const [cityName, state] = city.split(', ');
              return {
                placeId: `custom_${cityName}_${state}`,
                shortName: cityName,
                formattedAddress: city,
                city: cityName,
                state: state,
                type: 'suggestion',
                types: ['locality', 'political']
              };
            });

          // Add the search query as a custom location option
          const customLocation = {
            placeId: `custom_${query}`,
            shortName: query,
            formattedAddress: query,
            city: query,
            type: 'custom',
            types: ['custom']
          };

          const allSuggestions = [customLocation, ...matchingCities];
          set({ searchSuggestions: allSuggestions, isLoadingSuggestions: false });
          
        } catch (error) {
          logger.error('Location search failed:', error);
          set({ searchSuggestions: [], isLoadingSuggestions: false });
        }
        
        setIsSearching(false);
      } else if (query.length <= 1) {
        set({ searchSuggestions: [], isLoadingSuggestions: false });
        setBusinessSuggestions([]);
        setIsSearching(false);
      }
    },
    [set, isSearching]
  );

  // Handle location selection with zip code verification
  const handleLocationSelect = useCallback(
    async (location) => {
      try {
        // Verify zip code if present
        if (location.postalCode) {
          try {
            const zipVerification = await googleMapsService.verifyZipCode(location.postalCode, location.state);
            if (!zipVerification.isValid) {
              logger.warn(`Invalid zip code detected: ${location.postalCode}`);
              // Still allow selection but log the warning
            }
          } catch (error) {
            logger.error('Zip code verification failed:', error);
          }
        }

        setSelectedLocation(location);
        
        // Add to recent locations
        addToRecentLocations(location);
        
        // Call onChange callback
        if (onChange) {
          onChange(location);
        }
        
        // Close dropdown
        setIsOpen(false);
        setSearchQuery('');
        
        logger.interaction({
          type: 'location_selected',
          location: location.formattedAddress,
          source: location.type || 'search',
          zipCode: location.postalCode
        });
        
      } catch (error) {
        logger.error('Error selecting location:', error);
      }
    },
    [onChange, addToRecentLocations]
  );

  // Handle current location detection with fallback
  const handleGetCurrentLocation = useCallback(
    async () => {
      try {
        set({ isGettingLocation: true });
        const location = await getCurrentLocation();
        
        // Ensure the location has proper formatting
        const formattedLocation = {
          ...location,
          shortName: location.city || 'Current Location',
          formattedAddress: location.formattedAddress || `${location.city || 'Unknown'}, ${location.state || 'Unknown'}`,
          type: 'current'
        };
        
        handleLocationSelect(formattedLocation);
      } catch (error) {
        logger.error('Error getting current location:', error);
        
        // Create a fallback location object
        const fallbackLocation = {
          placeId: 'current_location_fallback',
          shortName: 'Current Location',
          formattedAddress: 'Location access required',
          city: 'Current Location',
          type: 'current',
          error: true
        };
        
        handleLocationSelect(fallbackLocation);
        
        // Show user-friendly error message
        const errorMessage = error.message.includes('permission denied') 
          ? 'Location access denied. Please enable location permissions in your browser settings.'
          : 'Unable to get your current location. Please try searching for a location instead.';
        
        console.warn('Location Error:', errorMessage);
      } finally {
        set({ isGettingLocation: false });
      }
    },
    [getCurrentLocation, handleLocationSelect, set]
  );

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(
    (location, e) => {
      e.stopPropagation();
      
      const isFavorite = favoriteLocations.some(
        fav => fav.placeId === location.placeId
      );
      
      if (isFavorite) {
        removeFromFavorites(location);
      } else {
        addToFavorites(location);
      }
    },
    [favoriteLocations, addToFavorites, removeFromFavorites]
  );

  // Handle initialization
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Simulate a brief loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsInitializing(false);
      } catch (error) {
        logger.error('Error initializing location selector:', error);
        setIsInitializing(false);
      }
    };

    initializeComponent();
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dropdown is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1, point2) => {
    if (!point1.lat || !point1.lng || !point2.lat || !point2.lng) {
      return null;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  // Format location display
  const formatLocationDisplay = (location) => {
    if (!location) return placeholder;
    
    // Handle different location types
    if (location.type === 'zipcode') {
      return `ZIP ${location.postalCode}`;
    }
    
    if (location.shortName) {
      return location.shortName;
    }
    
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    }
    
    if (location.city) {
      return location.city;
    }
    
    if (location.formattedAddress) {
      return location.formattedAddress;
    }
    
    return 'Unknown Location';
  };

  // Get location icon
  const getLocationIcon = (location) => {
    if (location?.type === 'business') return <Building2 className={cn(config.icon, "text-primary")} />;
    if (location?.isCurrentLocation) return <Navigation className={config.icon} />;
    		if (location?.type === 'favorite') return <Star className={cn(config.icon, "text-muted-foreground")} />;
    if (location?.type === 'recent') return <Clock className={cn(config.icon, "text-muted-foreground")} />;
    		if (location?.type === 'home') return <Home className={cn(config.icon, "text-primary")} />;
		if (location?.type === 'work') return <Building2 className={cn(config.icon, "text-primary")} />;
    return <MapPin className={config.icon} />;
  };

  // Render location item
  const LocationItem = ({ location, type = 'suggestion', showDistance = false }) => {
    const isFavorite = favoriteLocations.some(fav => fav.placeId === location.placeId);
    
      // Safely calculate distance only if both locations have coordinates
  const distance = currentLocation && location && 
    currentLocation.lat && currentLocation.lng && 
    location.lat && location.lng ? 
    calculateDistance(currentLocation, location) : null;

    return (
      <DropdownMenuItem
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 transition-colors duration-150"
        onClick={() => handleLocationSelect(location)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-neutral-800">
              {getLocationIcon(location)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white truncate">
                {location.shortName || location.city || formatLocationDisplay(location)}
              </p>
              {type === 'favorite' && (
                <Star className="w-3 h-3 text-warning fill-current" />
              )}
              {type === 'recent' && (
                <Badge variant="secondary" className="text-xs bg-neutral-700 text-neutral-300 border-neutral-600">Recent</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {location.formattedAddress || location.city || ''}
            </p>
            {showDistance && distance && typeof distance === 'number' && !isNaN(distance) && (
              <p className="text-xs text-neutral-500">
                {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {allowCustomization && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 hover:bg-neutral-700"
              onClick={(e) => handleToggleFavorite(location, e)}
            >
              <Heart className={cn(
                "w-3 h-3",
                							isFavorite ? "text-destructive fill-current" : "text-neutral-500 hover:text-destructive"
              )} />
            </Button>
          )}
        </div>
      </DropdownMenuItem>
    );
  };

  // Render business item
  const BusinessItem = ({ business }) => {
    return (
      <DropdownMenuItem
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 transition-colors duration-150"
        onClick={() => handleLocationSelect({
          ...business,
          shortName: business.name,
          formattedAddress: business.formattedAddress,
          type: 'business'
        })}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-neutral-800">
              <Building2 className={cn(config.icon, "text-primary")} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white truncate">
                {business.name}
              </p>
              {business.featured && (
                <Badge variant="secondary" className="text-xs bg-warning/20 text-warning/90 border-yellow-500/30">Featured</Badge>
              )}
              {business.verified && (
                <Badge variant="secondary" className="text-xs bg-success/20 text-success/90 border-green-500/30">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {business.formattedAddress}
            </p>
            {business.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3 h-3 text-warning fill-current" />
                <span className="text-xs text-neutral-300">{business.rating}</span>
                {business.reviewCount && (
                  <span className="text-xs text-neutral-500">({business.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </DropdownMenuItem>
    );
  };

  // Render suggestions sections
  const renderSuggestions = () => {
    const hasContent = 
      (showFavorites && favoriteLocations.length > 0) ||
      (showRecent && recentLocations.length > 0) ||
      searchSuggestions.length > 0 ||
      businessSuggestions.length > 0;

    if (!hasContent && !isLoadingSuggestions && !isLoadingBusinesses) {
      return (
        <div className="p-6 text-center text-neutral-500">
          <MapPin className="w-5 h-5 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Start typing to search for locations</p>
        </div>
      );
    }

    return (
      <div className="max-h-80 overflow-y-auto">
        {/* Current Location */}
        {showCurrentLocation && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex items-center space-x-3 p-2.5 cursor-pointer hover:bg-neutral-800 transition-colors duration-150"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-neutral-800">
                  {isGettingLocation ? (
                    <Loader2 className={cn(config.icon, "animate-spin text-neutral-400")} />
                  ) : (
                    <Crosshair className={cn(config.icon, "text-neutral-400")} />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {isGettingLocation ? 'Getting location...' : 'Use current location'}
                </p>
                {currentLocation && currentLocation.city && (
                  <p className="text-xs text-neutral-400">
                    {formatLocationDisplay(currentLocation)}
                  </p>
                )}
                {!currentLocation && !isGettingLocation && (
                  <p className="text-xs text-neutral-400">
                    Click to detect your location
                  </p>
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}

        {/* Favorites */}
        {showFavorites && favoriteLocations.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">
              Favorites
            </DropdownMenuLabel>
            {favoriteLocations.slice(0, 3).map((location, index) => (
              <LocationItem
                key={`favorite-${index}`}
                location={location}
                type="favorite"
                showDistance={!!currentLocation}
              />
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}

        {/* Recent Locations */}
        {showRecent && recentLocations.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">
              Recent
            </DropdownMenuLabel>
            {recentLocations.slice(0, 3).map((location, index) => (
              <LocationItem
                key={`recent-${index}`}
                location={location}
                type="recent"
                showDistance={!!currentLocation}
              />
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}

        {/* Search Suggestions */}
        {searchSuggestions.length > 0 && (
          <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
          Suggestions
        </DropdownMenuLabel>
            {searchSuggestions.map((location, index) => (
              <LocationItem
                key={`suggestion-${index}`}
                location={location}
                type="suggestion"
                showDistance={!!currentLocation}
              />
            ))}
          </DropdownMenuGroup>
        )}

        {/* Business Suggestions */}
        {businessSuggestions.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
              Businesses
            </DropdownMenuLabel>
            {businessSuggestions.map((business, index) => (
              <BusinessItem
                key={`business-${business.id}-${index}`}
                business={business}
              />
            ))}
          </DropdownMenuGroup>
        )}

        {/* Loading states */}
        {(isLoadingSuggestions || isLoadingBusinesses) && (
          <div className="p-4 text-center">
            <Loader2 className="w-4 h-4 mx-auto animate-spin text-neutral-500" />
            <p className="text-sm text-neutral-500 mt-2">
              {isLoadingSuggestions && isLoadingBusinesses ? 'Searching...' : 
               isLoadingSuggestions ? 'Finding locations...' : 'Finding businesses...'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isGettingLocation || isLoadingSuggestions || isInitializing}
          className={cn(
            "justify-between text-left font-normal transition-all duration-200",
            config.button,
            variantStyles[variant],
            !selectedLocation && "text-neutral-400",
            (isGettingLocation || isLoadingSuggestions || isInitializing) && "opacity-70 cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {(isGettingLocation || isLoadingSuggestions || isInitializing) ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : (
              <MapPin className={cn("w-3.5 h-3.5 text-neutral-400", selectedLocation && "text-neutral-300")} />
            )}
            <span className="truncate text-sm">
              {isInitializing ? "Loading..." :
               isGettingLocation ? "Getting location..." : 
               isLoadingSuggestions ? "Searching..." :
               formatLocationDisplay(selectedLocation)}
            </span>
          </div>
          <ChevronDown className={cn("w-3 h-3 opacity-40 flex-shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className={cn(config.dropdown, "p-0 z-[99999]")}
        align="start"
        side="top"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={20}
        style={{ zIndex: 99999 }}
      >
        {/* Compact Search Header */}
        <div className="p-3 border-b border-neutral-800">
          <div className="space-y-2">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutral-500 w-3.5 h-3.5" />
              <Input
                ref={inputRef}
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-8 h-8 text-sm bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary" />
              )}
              {searchQuery && !isSearching && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 p-0 hover:bg-neutral-800"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* Zip Code Input */}
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutral-500 w-3.5 h-3.5" />
              <Input
                placeholder="Or enter zip code..."
                className="pl-8 pr-4 h-8 text-sm bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const zipCode = e.target.value.trim();
                    if (zipCode && /^\d{5}(-\d{4})?$/.test(zipCode)) {
                      // Create a simple location object for the zip code
                      const location = {
                        postalCode: zipCode,
                        shortName: `ZIP ${zipCode}`,
                        formattedAddress: `ZIP Code ${zipCode}`,
                        city: `ZIP ${zipCode}`,
                        type: 'zipcode'
                      };
                      handleLocationSelect(location);
                    }
                  }
                }}
              />
            </div>
            
            {/* Quick Location Buttons */}
            <div className="flex flex-wrap gap-1">
              {['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    const [cityName, state] = city.split(', ');
                    const location = {
                      placeId: `quick_${cityName}_${state}`,
                      shortName: cityName,
                      formattedAddress: city,
                      city: cityName,
                      state: state,
                      type: 'quick'
                    };
                    handleLocationSelect(location);
                  }}
                  className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions Content */}
        {renderSuggestions()}

        {/* Footer with preferences */}
        {allowCustomization && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 bg-gray-50 dark:bg-card">
              <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                <span>Location preferences</span>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

EnhancedLocationSelector.displayName = 'EnhancedLocationSelector';

export default EnhancedLocationSelector;
