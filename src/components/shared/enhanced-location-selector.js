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
import { logger } from '@lib/utils/logger';

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
      button: "h-8 text-sm px-3",
      input: "h-8 text-sm",
      dropdown: "w-80",
      icon: "w-4 h-4"
    },
    default: {
      button: "h-10 text-base px-4",
      input: "h-10 text-base", 
      dropdown: "w-96",
      icon: "w-5 h-5"
    },
    large: {
      button: "h-12 text-lg px-6",
      input: "h-12 text-lg",
      dropdown: "w-[28rem]",
      icon: "w-6 h-6"
    }
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantStyles = {
    default: "border-neutral-600 bg-neutral-700/30 text-white placeholder:text-neutral-400 hover:bg-neutral-700/50 hover:border-neutral-500",
    filled: "border-neutral-500 bg-neutral-700/50 text-white placeholder:text-neutral-400 hover:bg-neutral-700/70",
    outlined: "border-2 border-blue-500/50 bg-neutral-700/30 text-white placeholder:text-neutral-400 hover:border-blue-500/70"
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

  // Handle search input changes with Google Places API and business search
  const handleSearchChange = useCallback(
    async (query) => {
      setSearchQuery(query);
      
      if (query.length > 1 && !isSearching) {
        setIsSearching(true);
        set({ isLoadingSuggestions: true });
        
        // Start both location and business searches in parallel
        const searchPromises = [];
        
        // Location search
        searchPromises.push(
          (async () => {
            try {
              // Use Google Places API for better search suggestions
              const suggestions = await googleMapsService.searchLocations(query, {
                types: 'geocode',
                location: currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : null,
                radius: 50000 // 50km radius
              });

              // Transform Google Places suggestions to our format
              const transformedSuggestions = suggestions.map(prediction => ({
                placeId: prediction.place_id,
                shortName: prediction.structured_formatting?.main_text || prediction.description,
                formattedAddress: prediction.description,
                city: prediction.structured_formatting?.secondary_text || '',
                type: 'suggestion',
                types: prediction.types || []
              }));

              // Update store with suggestions
              set({ searchSuggestions: transformedSuggestions, isLoadingSuggestions: false });
            } catch (error) {
              logger.error('Google Places search failed:', error);
              // Fallback to existing search method
              await getLocationSuggestions(query, {
                location: currentLocation,
                types: 'geocode'
              });
            }
          })()
        );
        
        // Business search
        searchPromises.push(handleBusinessSearch(query));
        
        // Wait for both searches to complete
        await Promise.allSettled(searchPromises);
        setIsSearching(false);
      } else if (query.length <= 1) {
        set({ searchSuggestions: [], isLoadingSuggestions: false });
        setBusinessSuggestions([]);
        setIsSearching(false);
      }
    },
    [getLocationSuggestions, currentLocation, set, isSearching, handleBusinessSearch]
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
        const location = await getCurrentLocation();
        handleLocationSelect(location);
      } catch (error) {
        logger.error('Error getting current location:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message.includes('permission denied') 
          ? 'Location access denied. Please enable location permissions in your browser settings.'
          : 'Unable to get your current location. Please try searching for a location instead.';
        
        // You can add a toast notification here if you have a toast system
        console.warn('Location Error:', errorMessage);
      }
    },
    [getCurrentLocation, handleLocationSelect]
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

  // Format location display
  const formatLocationDisplay = (location) => {
    if (!location) return placeholder;
    return locationUtils.formatLocationDisplay(location, { showState: true });
  };

  // Get location icon
  const getLocationIcon = (location) => {
    if (location?.type === 'business') return <Building2 className={cn(config.icon, "text-blue-400")} />;
    if (location?.isCurrentLocation) return <Navigation className={config.icon} />;
    		if (location?.type === 'favorite') return <Star className={cn(config.icon, "text-muted-foreground")} />;
    if (location?.type === 'recent') return <Clock className={cn(config.icon, "text-gray-500")} />;
    		if (location?.type === 'home') return <Home className={cn(config.icon, "text-primary")} />;
		if (location?.type === 'work') return <Building2 className={cn(config.icon, "text-primary")} />;
    return <MapPin className={config.icon} />;
  };

  // Render location item
  const LocationItem = ({ location, type = 'suggestion', showDistance = false }) => {
    const isFavorite = favoriteLocations.some(fav => fav.placeId === location.placeId);
    const distance = currentLocation && location ? 
      locationUtils.calculateDistance(currentLocation, location) : null;

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
                {location.shortName || location.city || 'Unknown Location'}
              </p>
              {type === 'favorite' && (
                							<Star className="w-3 h-3 text-yellow-400 fill-current" />
              )}
              {type === 'recent' && (
                <Badge variant="secondary" className="text-xs bg-neutral-700 text-neutral-300 border-neutral-600">Recent</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {location.formattedAddress}
            </p>
            {showDistance && distance && (
              							<p className="text-xs text-neutral-500">
                {locationUtils.formatDistance(distance)} away
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
                							isFavorite ? "text-red-400 fill-current" : "text-neutral-500 hover:text-red-400"
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
              <Building2 className={cn(config.icon, "text-blue-400")} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white truncate">
                {business.name}
              </p>
              {business.featured && (
                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Featured</Badge>
              )}
              {business.verified && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {business.formattedAddress}
            </p>
            {business.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
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
                {currentLocation && (
                  <p className="text-xs text-neutral-400">
                    {formatLocationDisplay(currentLocation)}
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
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
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
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
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
          variant="outline"
          className={cn(
            "justify-between text-left font-normal hover:bg-neutral-700/50 hover:border-neutral-500 transition-all duration-200",
            config.button,
            variantStyles[variant],
            !selectedLocation && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-neutral-700/50">
              {getLocationIcon(selectedLocation)}
            </div>
            <span className="truncate font-medium">
              {formatLocationDisplay(selectedLocation)}
            </span>
          </div>
          <ChevronDown className={cn(config.icon, "opacity-50 flex-shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
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
              {searchQuery && (
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
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const zipCode = e.target.value.trim();
                    if (zipCode && /^\d{5}(-\d{4})?$/.test(zipCode)) {
                      try {
                        const verification = await googleMapsService.verifyZipCode(zipCode);
                        if (verification.isValid) {
                          const location = {
                            postalCode: verification.zipCode,
                            city: verification.city,
                            state: verification.state,
                            country: verification.country,
                            formattedAddress: verification.formattedAddress,
                            shortName: `${verification.city}, ${verification.state}`,
                            type: 'zipcode'
                          };
                          handleLocationSelect(location);
                        }
                      } catch (error) {
                        logger.error('Zip code verification failed:', error);
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Suggestions Content */}
        {renderSuggestions()}

        {/* Footer with preferences */}
        {allowCustomization && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
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
