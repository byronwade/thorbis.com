/**
 * Enhanced Location Dropdown Component
 * Fully backward-compatible replacement for the original location dropdown
 * Integrates advanced location features with improved UX
 */

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuLabel, 
  DropdownMenuGroup 
} from "@components/ui/dropdown-menu";
import { 
  X, 
  ChevronDown, 
  MapPin, 
  Navigation, 
  Globe, 
  Home, 
  Heart, 
  Clock, 
  Star, 
  Target, 
  Crosshair, 
  Settings, 
  Search,
  Building2
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Loader2 } from "lucide-react";
import { useSearchStore } from "@store/search";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";
import { useLocationStore, locationUtils } from "@lib/location/enhanced-location-service";
import { cn } from "@lib/utils";
import { logger } from "@lib/utils/logger";
import { debounce } from "lodash";

const EnhancedLocationDropdown = ({ className, size = "default", showFavorites = true, showRecent = true, showCurrentLocation = true }) => {
  const router = useRouter();
  const inputRef = useRef(null);
  const { setActiveBusinessId } = useBusinessStore();
  
  // Enhanced location store
  const {
    currentLocation,
    isGettingLocation,
    locationError,
    recentLocations,
    favoriteLocations,
    searchSuggestions,
    isLoadingSuggestions,
    getCurrentLocation,
    getLocationSuggestions,
    addToFavorites,
    removeFromFavorites,
    addToRecentLocations,
    geocodeAddress
  } = useLocationStore();
  
  // Legacy compatibility with search store
  const { location, setLocation, activeDropdown, setActiveDropdown } = useSearchStore();
  const { centerOn, isMapAvailable } = useMapStore();
  
  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Size variants for different contexts
  const sizeVariants = {
    small: {
      button: "h-6 text-xs px-2 rounded-md",
      icon: "w-3 h-3",
      text: "max-w-20 sm:max-w-24",
      dropdown: "w-80",
      input: "text-sm h-8",
      content: "p-3",
    },
    default: {
      button: "h-7 text-sm px-3 rounded-lg",
      icon: "w-4 h-4",
      text: "max-w-24 sm:max-w-32",
      dropdown: "w-96",
      input: "text-sm h-9",
      content: "p-4",
    },
    large: {
      button: "h-10 text-base px-4 rounded-lg",
      icon: "w-5 h-5",
      text: "max-w-28 sm:max-w-36",
      dropdown: "w-[28rem]",
      input: "text-base h-10",
      content: "p-5",
    },
  };

  const currentSize = sizeVariants[size];

  // Initialize location from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get("location");
    
    if (locationParam && !location?.value) {
      handleLocationFromString(locationParam);
    }
  }, []);

  // Enhanced search with debouncing
  const debouncedGetSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) return;
      
      try {
        await getLocationSuggestions(query, {
          location: currentLocation,
          types: 'geocode'
        });
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300),
    [getLocationSuggestions, currentLocation]
  );

  // Handle search input changes
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    debouncedGetSuggestions(query);
  };

  // Handle location from string (for URL params)
  const handleLocationFromString = async (locationString) => {
    try {
      const locationData = await geocodeAddress(locationString);
      handleLocationSelect(locationData, false);
    } catch (error) {
      console.error("Error geocoding location string:", error);
      setLocation({ 
        value: locationString, 
        city: locationString, 
        error: true,
        lat: null,
        lng: null
      });
    }
  };

  // Handle location selection (enhanced)
  const handleLocationSelect = async (selectedLocation, updateURL = true) => {
    try {
      // Update legacy search store for backward compatibility
      setLocation({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        value: selectedLocation.formattedAddress || selectedLocation.shortName,
        city: selectedLocation.city || selectedLocation.shortName,
        error: false
      });

      // Clear active business
      setActiveBusinessId(null);

      // Add to recent locations
      addToRecentLocations(selectedLocation);

      // Center map if available
      if (isMapAvailable() && selectedLocation.lat && selectedLocation.lng) {
        centerOn(selectedLocation.lat, selectedLocation.lng);
      }

      // Update URL
      if (updateURL) {
        updateLocationURL(selectedLocation.formattedAddress || selectedLocation.shortName);
      }

      // Close dropdown
      setIsOpen(false);
      setSearchQuery('');

      // Log interaction
      logger.interaction({
        type: 'location_selected',
        location: selectedLocation.formattedAddress,
        source: selectedLocation.type || 'search'
      });

    } catch (error) {
      logger.error('Error selecting location:', error);
      setLocation({ error: true });
    }
  };

  // Update URL with new location
  const updateLocationURL = (locationString) => {
    const url = new URL(window.location.href);
    url.searchParams.set("location", locationString);
    router.replace(url.toString(), undefined, { shallow: true });
  };

  // Handle current location detection
  const handleGetCurrentLocation = async () => {
    try {
      const detectedLocation = await getCurrentLocation();
      handleLocationSelect(detectedLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = (location, e) => {
    e.stopPropagation();
    
    const isFavorite = favoriteLocations.some(
      fav => fav.placeId === location.placeId ||
      (fav.lat === location.lat && fav.lng === location.lng)
    );
    
    if (isFavorite) {
      removeFromFavorites(location);
    } else {
      addToFavorites(location);
    }
  };

  // Get status color based on location state
  const getStatusColor = () => {
    if (locationError || location?.error) {
      return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
    }
    if (location?.value) {
      return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
    }
    return "border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary";
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isGettingLocation || location?.loading) {
      return <Loader2 className={`${currentSize.icon} animate-spin text-primary`} />;
    }
    if (currentLocation?.isCurrentLocation && location?.value === currentLocation.formattedAddress) {
      return <Navigation className={`${currentSize.icon} text-blue-600`} />;
    }
    if (location?.value) {
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
    if (locationError || location?.error) {
      return <div className="w-2 h-2 rounded-full bg-red-500" />;
    }
    return <MapPin className={`${currentSize.icon} text-gray-400`} />;
  };

  // Get location icon for different types
  const getLocationTypeIcon = (location) => {
    if (location?.isCurrentLocation) return <Navigation className={currentSize.icon} />;
    if (location?.type === 'favorite') return <Star className={cn(currentSize.icon, "text-yellow-500")} />;
    if (location?.type === 'recent') return <Clock className={cn(currentSize.icon, "text-gray-500")} />;
    if (location?.type === 'home') return <Home className={cn(currentSize.icon, "text-green-500")} />;
    if (location?.type === 'work') return <Building2 className={cn(currentSize.icon, "text-blue-500")} />;
    return <MapPin className={currentSize.icon} />;
  };

  // Render location item
  const LocationItem = ({ location, type = 'suggestion', showDistance = false }) => {
    const isFavorite = favoriteLocations.some(
      fav => fav.placeId === location.placeId ||
      (fav.lat === location.lat && fav.lng === location.lng)
    );
    
    const distance = currentLocation && location ? 
      locationUtils.calculateDistance(currentLocation, location) : null;

    return (
      <DropdownMenuItem
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
        onClick={() => handleLocationSelect(location)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getLocationTypeIcon(location)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {location.shortName || location.city || 'Unknown Location'}
              </p>
              {type === 'favorite' && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
              {type === 'recent' && (
                <Badge variant="secondary" className="text-xs">Recent</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {location.formattedAddress || location.address}
            </p>
            {showDistance && distance && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {locationUtils.formatDistance(distance)} away
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={(e) => handleToggleFavorite(location, e)}
          >
            <Heart className={cn(
              "w-3 h-3",
              isFavorite ? "text-red-500 fill-current" : "text-gray-400"
            )} />
          </Button>
        </div>
      </DropdownMenuItem>
    );
  };

  // Popular locations for quick access
  const popularLocations = [
    { shortName: "San Francisco, CA", formattedAddress: "San Francisco, CA, USA", city: "San Francisco", state: "CA" },
    { shortName: "New York, NY", formattedAddress: "New York, NY, USA", city: "New York", state: "NY" },
    { shortName: "Los Angeles, CA", formattedAddress: "Los Angeles, CA, USA", city: "Los Angeles", state: "CA" },
    { shortName: "Chicago, IL", formattedAddress: "Chicago, IL, USA", city: "Chicago", state: "IL" },
    { shortName: "Miami, FL", formattedAddress: "Miami, FL, USA", city: "Miami", state: "FL" }
  ];

  // Render suggestions content
  const renderSuggestions = () => {
    const hasContent = 
      (showFavorites && favoriteLocations.length > 0) ||
      (showRecent && recentLocations.length > 0) ||
      searchSuggestions.length > 0 ||
      (!searchQuery && popularLocations.length > 0);

    if (!hasContent && !isLoadingSuggestions) {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
              className="flex items-center space-x-3 p-3 cursor-pointer"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              <div className="flex-shrink-0">
                {isGettingLocation ? (
                  <Loader2 className={cn(currentSize.icon, "animate-spin")} />
                ) : (
                  <Crosshair className={cn(currentSize.icon, "text-blue-600")} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {isGettingLocation ? 'Getting location...' : 'Use current location'}
                </p>
                {currentLocation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {locationUtils.formatLocationDisplay(currentLocation)}
                  </p>
                )}
              </div>
              <Target className={cn(currentSize.icon, "text-blue-600")} />
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
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
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

        {/* Popular Locations (when no search) */}
        {!searchQuery && !searchSuggestions.length && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Popular Cities
            </DropdownMenuLabel>
            {popularLocations.map((location, index) => (
              <LocationItem
                key={`popular-${index}`}
                location={location}
                type="popular"
              />
            ))}
          </DropdownMenuGroup>
        )}

        {/* Loading state */}
        {isLoadingSuggestions && (
          <div className="p-6 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Finding locations...
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
            "justify-between text-left font-normal",
            currentSize.button,
            getStatusColor(),
            className
          )}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {getStatusIcon()}
            <span className={cn("truncate", currentSize.text)}>
              {location?.city || location?.value || "Location"}
            </span>
          </div>
          <ChevronDown className={cn(currentSize.icon, "opacity-50 flex-shrink-0")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className={cn(currentSize.dropdown, "p-0")}
        align="start"
        sideOffset={4}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(currentSize.input, "pl-10 pr-10")}
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions Content */}
        {renderSuggestions()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedLocationDropdown;
