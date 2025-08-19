"use client";

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, OverlayView, MarkerClusterer } from "@react-google-maps/api";
import { buildBusinessUrlFrom } from "@utils";

// Suppress Google Maps Marker deprecation warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('google.maps.Marker is deprecated')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

// Custom InfoWindow component to bypass Google's default styling
const CustomInfoWindow = ({ position, children, onClose }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="relative">
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </OverlayView>
  );
};

// Stable libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES = ["places", "geometry"];

// Custom InfoWindow styles to override Google's default styling
const customInfoWindowStyles = `
  <style>
    /* Target Google Maps InfoWindow at the highest level */
    .gm-style .gm-style-iw-c {
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
    }
    
    .gm-style .gm-style-iw {
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
    }
    
    .gm-style .gm-style-iw-d {
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      overflow: visible !important;
    }
    
    .gm-style .gm-style-iw-chr {
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    
    .gm-style .gm-style-iw-ch {
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    
    /* Override any inline styles that Google Maps might apply */
    .gm-style div[style*="background"] {
      background-color: transparent !important;
    }
    
    .gm-style div[style*="border"] {
      border: none !important;
    }
    
    .gm-style div[style*="box-shadow"] {
      box-shadow: none !important;
    }
    
    /* Style the close button */
    .gm-style .gm-ui-hover-effect {
      background: hsl(var(--foreground) / 0.7) !important;
      border-radius: 50% !important;
      width: 32px !important;
      height: 32px !important;
      top: 8px !important;
      right: 8px !important;
      border: none !important;
    }
    
    .gm-style .gm-ui-hover-effect:hover {
      background: hsl(var(--foreground) / 0.9) !important;
    }
    
    .gm-style .gm-ui-hover-effect span {
      filter: invert(1) !important;
    }
    
    /* Additional specific overrides for our custom class */
    .custom-infowindow .gm-style-iw,
    .custom-infowindow .gm-style-iw-c,
    .custom-infowindow .gm-style-iw-d,
    .custom-infowindow .gm-style-iw-chr,
    .custom-infowindow .gm-style-iw-ch {
      background: transparent !important;
      padding: 0 !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
    }
    
    /* Remove any default Google Maps styling */
    .custom-infowindow * {
      border-color: transparent !important;
    }
    
    /* Nuclear option - remove ALL borders and backgrounds from any Google Maps elements */
    .custom-infowindow .gm-style-iw *,
    .custom-infowindow .gm-style-iw-c *,
    .custom-infowindow .gm-style-iw-d *,
    .custom-infowindow .gm-style-iw-chr *,
    .custom-infowindow .gm-style-iw-ch * {
      border-color: transparent !important;
      background-color: transparent !important;
    }
    
    /* Specific override for any white borders that might still appear */
    .custom-infowindow div[style*="border"] {
      border: none !important;
    }
    
    .custom-infowindow div[style*="background"] {
      background: transparent !important;
    }
    
    /* Ensure our custom content has proper styling */
    .custom-infowindow-content {
      background-color: hsl(var(--background)) !important;
      color: hsl(var(--background)) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: 12px !important;
      box-shadow: 0 25px 50px -12px hsl(var(--foreground) / 0.5), 0 0 0 1px hsl(var(--background) / 0.05) !important;
      padding: 24px !important;
      margin: 0 !important;
      min-width: 320px !important;
      max-width: 320px !important;
      position: relative !important;
      z-index: 1000 !important;
    }
    
    /* Target all Google Maps InfoWindow elements globally */
    .gm-style-iw-c,
    .gm-style-iw,
    .gm-style-iw-d,
    .gm-style-iw-chr,
    .gm-style-iw-ch {
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }
    
    /* Target any element with background color */
    div[style*="background-color"] {
      background-color: transparent !important;
    }
  </style>
`;
import { Button } from "@components/ui/button";
import { Minus, Plus, MapPin, Search, Target, ExternalLink, RefreshCw } from "lucide-react";
// import BusinessInfoPanel from "@components/site/map/business-info-panel";
import { useMapStore } from "@store/map";
import { useSearchStore } from "@store/search";
import { useBusinessStore } from "@store/business";
import { toast } from "@components/ui/use-toast";
import logger from "@lib/utils/logger";

// Dark mode map theme
const darkMapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--card))" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "hsl(var(--card))" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--success))" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "hsl(var(--card))" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "hsl(var(--background))" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--warning))" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--card))" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "hsl(var(--background))" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "hsl(var(--muted-foreground))" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "hsl(var(--background))" }],
  },
];

// Enhanced business marker icons with better design
const createBusinessMarkerIcon = (isActive = false, rating = 0, category = '') => {
  // Enhanced color scheme with better contrast
  const getMarkerColorScheme = () => {
    if (isActive) {
      return {
        primary: "hsl(var(--primary))",    // Blue for active
        secondary: "hsl(var(--background))",  // White border
        accent: "hsl(var(--primary))",     // Light blue
        border: "hsl(var(--background))"      // White border for contrast
      };
    }
    
    // Category-based colors with better visibility
    switch (category?.toLowerCase()) {
      case 'restaurant':
      case 'food':
        return {
          primary: "hsl(var(--warning))",    // Orange
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--warning))",
          border: "hsl(var(--background))"
        };
      case 'retail':
      case 'shopping':
        return {
          primary: "hsl(var(--muted-foreground))",    // Emerald
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--success))",
          border: "hsl(var(--background))"
        };
      case 'service':
      case 'professional':
        return {
          primary: "hsl(var(--primary))",    // Blue
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--primary))",
          border: "hsl(var(--background))"
        };
      case 'healthcare':
      case 'medical':
        return {
          primary: "hsl(var(--muted-foreground))",    // Red
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--destructive))",
          border: "hsl(var(--background))"
        };
      case 'entertainment':
      case 'recreation':
        return {
          primary: "hsl(var(--muted-foreground))",    // Purple
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--muted-foreground))",
          border: "hsl(var(--background))"
        };
      default:
        return {
          primary: "hsl(var(--muted-foreground))",    // Gray
          secondary: "hsl(var(--background))",
          accent: "hsl(var(--muted-foreground))",
          border: "hsl(var(--background))"
        };
    }
  };

  const colors = getMarkerColorScheme();
  
  // Enhanced marker design with better visibility
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: colors.primary,
    fillOpacity: 1,
    strokeColor: colors.border,
    strokeWeight: 3,
    scale: isActive ? 1.5 : 1.2,
    anchor: { x: 12, y: 24 },
    // Enhanced visibility for active markers
    ...(isActive && {
      fillOpacity: 1,
      strokeWeight: 4,
      scale: 1.5
    })
  };
};

const GoogleMapsContainer = React.forwardRef((props, ref) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const handleMapBoundsChangeRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(props.selectedBusiness || null);
  const [infoWindow, setInfoWindow] = useState(props.selectedBusiness?.id || null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [mapZoom, setMapZoom] = useState(10);
  
  // Enhanced features state
  const [userLocation, setUserLocation] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, hybrid
  const [showTraffic, setShowTraffic] = useState(false);
  const [businessStats, setBusinessStats] = useState({
    total: 0,
    nearby: 0,
    open: 0,
    rated: 0
  });

  // Store hooks
  const { setMapRef, getMapBounds, getMapZoom } = useMapStore();
  const { searchQuery } = useSearchStore();
  const { 
    fetchInitialBusinesses, 
    fetchFilteredBusinesses, 
    initializeWithSupabaseData, 
    activeBusinessId, 
    setActiveBusinessId, 
    filteredBusinesses, 
    loading 
  } = useBusinessStore();

  // Use businesses from props if provided, otherwise use from store
  const businesses = props.businesses || filteredBusinesses || [];

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Filter businesses based on criteria
  const getFilteredBusinesses = useCallback(() => {
    let filtered = businesses;
    
    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(b => 
        b.category?.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    
    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(b => (b.rating || 0) >= filterRating);
    }
    
    // Filter by search radius if user location is available
    if (userLocation && searchRadius > 0) {
      filtered = filtered.filter(b => {
        if (!b.coordinates) return false;
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          b.coordinates.lat, b.coordinates.lng
        );
        return distance <= searchRadius;
      });
    }
    
    // Filter by favorites if showing only favorites
    if (showFavorites) {
      filtered = filtered.filter(b => favorites.has(b.id));
    }
    
    return filtered;
  }, [businesses, filterCategory, filterRating, userLocation, searchRadius, showFavorites, favorites, calculateDistance]);
  
  // Get filtered businesses for display
  const displayBusinesses = getFilteredBusinesses();

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Map container style
  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  // Map options with dark mode
  const mapOptions = useMemo(() => ({
    styles: darkMapStyles,
    disableDefaultUI: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    backgroundColor: "hsl(var(--card))",
    clickableIcons: false,
  }), []);

  // Stable reference for libraries to prevent LoadScript reloading
  const libraries = useMemo(() => GOOGLE_MAPS_LIBRARIES, []);

  // Enhanced utility functions for advanced features
  const updateBusinessStats = useCallback(() => {
    if (businesses.length > 0) {
      const now = new Date();
      const stats = {
        total: businesses.length,
        nearby: businesses.filter(b => b.distance && b.distance <= 5).length,
        open: businesses.filter(b => b.isOpen).length,
        rated: businesses.filter(b => b.rating && b.rating >= 4.0).length
      };
      setBusinessStats(stats);
    }
  }, [businesses]);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          setShowUserLocation(true);
          setIsLoadingLocation(false);
          
          // Center map on user location
          if (mapRef.current) {
            mapRef.current.panTo(location);
            mapRef.current.setZoom(14);
          }
          
          toast({
            title: "Location Found",
            description: "Your location has been set on the map",
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your permissions.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  }, [mapRef]);

  // Toggle favorite status
  const toggleFavorite = useCallback((businessId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(businessId)) {
        newFavorites.delete(businessId);
        toast({
          title: "Removed from Favorites",
          description: "Business removed from your favorites",
        });
      } else {
        newFavorites.add(businessId);
        toast({
          title: "Added to Favorites",
          description: "Business added to your favorites",
        });
      }
      return newFavorites;
    });
  }, []);

  // Get directions to business
  const getDirections = useCallback((business) => {
    if (!business.coordinates) return;
    
    const { lat, lng } = business.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    if (userLocation) {
      const fullUrl = `${url}&origin=${userLocation.lat},${userLocation.lng}`;
      window.open(fullUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
    
    toast({
      title: "Directions Opened",
      description: "Google Maps directions opened in new tab",
    });
  }, [userLocation]);

  // Add to recent searches
  const addToRecentSearches = useCallback((searchTerm) => {
    const newSearch = {
      term: searchTerm,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.term !== searchTerm);
      return [newSearch, ...filtered].slice(0, 5);
    });
  }, []);

  // Inject custom InfoWindow styles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if styles are already injected
      const existingStyles = document.getElementById('custom-infowindow-styles');
      if (!existingStyles) {
        const styleElement = document.createElement('style');
        styleElement.id = 'custom-infowindow-styles';
        styleElement.textContent = customInfoWindowStyles.replace(/<style>|<\/style>/g, '');
        document.head.appendChild(styleElement);
        
        // Also add a more aggressive override after Google Maps loads
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('gm-style')) {
                  // Force override any Google Maps styles
                  const infoWindows = node.querySelectorAll('.gm-style-iw, .gm-style-iw-c, .gm-style-iw-d');
                  infoWindows.forEach((infoWindow) => {
                    infoWindow.style.setProperty('background-color', 'transparent', 'important');
                    infoWindow.style.setProperty('border', 'none', 'important');
                    infoWindow.style.setProperty('box-shadow', 'none', 'important');
                    infoWindow.style.setProperty('padding', '0', 'important');
                    infoWindow.style.setProperty('margin', '0', 'important');
                  });
                  
                  // Also target any div elements that might have background colors
                  const allDivs = node.querySelectorAll('div');
                  allDivs.forEach((div) => {
                    if (div.style.backgroundColor && div.style.backgroundColor !== 'transparent') {
                      div.style.setProperty('background-color', 'transparent', 'important');
                    }
                  });
                }
              });
            }
          });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also apply styles immediately to any existing elements
        setTimeout(() => {
          const allInfoWindows = document.querySelectorAll('.gm-style-iw, .gm-style-iw-c, .gm-style-iw-d');
          allInfoWindows.forEach((infoWindow) => {
            infoWindow.style.setProperty('background-color', 'transparent', 'important');
            infoWindow.style.setProperty('border', 'none', 'important');
            infoWindow.style.setProperty('box-shadow', 'none', 'important');
            infoWindow.style.setProperty('padding', '0', 'important');
            infoWindow.style.setProperty('margin', '0', 'important');
          });
        }, 100);
      }
    }
  }, []);

  // Initialize with mock data
  useEffect(() => {
    try {
      initializeWithSupabaseData();
    } catch (error) {
      logger.error("Error initializing with Supabase data:", error);
      // Don't let this break the component
    }
  }, [initializeWithSupabaseData]);

  // Update business stats when businesses change
  useEffect(() => {
    updateBusinessStats();
  }, [businesses, updateBusinessStats]);

  // Update stats when filtered businesses change
  useEffect(() => {
    if (displayBusinesses.length > 0) {
      const stats = {
        total: displayBusinesses.length,
        nearby: displayBusinesses.filter(b => b.distance && b.distance <= 5).length,
        open: displayBusinesses.filter(b => b.isOpen).length,
        rated: displayBusinesses.filter(b => b.rating && b.rating >= 4.0).length
      };
      setBusinessStats(stats);
    }
  }, [displayBusinesses]);

  // Force InfoWindow styling when infoWindow opens
  useEffect(() => {
    if (infoWindow) {
      // Wait for the InfoWindow to be rendered
      const timer = setTimeout(() => {
        const infoWindows = document.querySelectorAll('.gm-style-iw, .gm-style-iw-c, .gm-style-iw-d');
        infoWindows.forEach((infoWindow) => {
          infoWindow.style.setProperty('background-color', 'transparent', 'important');
          infoWindow.style.setProperty('border', 'none', 'important');
          infoWindow.style.setProperty('box-shadow', 'none', 'important');
          infoWindow.style.setProperty('padding', '0', 'important');
          infoWindow.style.setProperty('margin', '0', 'important');
          infoWindow.style.setProperty('border-radius', '0', 'important');
        });
        
        // Also target any div elements that might have background colors
        const allDivs = document.querySelectorAll('.gm-style div');
        allDivs.forEach((div) => {
          if (div.style.backgroundColor && div.style.backgroundColor !== 'transparent') {
            div.style.setProperty('background-color', 'transparent', 'important');
          }
          if (div.style.border && div.style.border !== 'none') {
            div.style.setProperty('border', 'none', 'important');
          }
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [infoWindow]);

  // Set map reference
  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef.current);
      logger.performance("Google Maps ref set successfully");
    }
  }, [setMapRef]);

  // Update selected business when props change
  useEffect(() => {
    if (props.selectedBusiness) {
      setSelectedBusiness(props.selectedBusiness);
      setInfoWindow(props.selectedBusiness.id);
      setActiveBusinessId(props.selectedBusiness.id);
      
      // Center map on selected business
      if (mapRef.current && props.selectedBusiness.coordinates) {
        mapRef.current.panTo({
          lat: props.selectedBusiness.coordinates.lat,
          lng: props.selectedBusiness.coordinates.lng,
        });
        mapRef.current.setZoom(15);
      }
    } else {
      setSelectedBusiness(null);
      setInfoWindow(null);
      setActiveBusinessId(null);
    }
  }, [props.selectedBusiness, setActiveBusinessId]);

  // Handle map load
  const handleMapLoad = useCallback((map) => {
    try {
      logger.performance("Google Maps loaded successfully");
      mapRef.current = map;
      setMapRef(map);
      setMapLoaded(true);
      setMapError(null);
    
    // Log map details for debugging
    logger.debug("Google Maps loaded with options:", {
      center: map.getCenter(),
      zoom: map.getZoom(),
      mapTypeId: map.getMapTypeId(),
      isLoaded: true
    });

    // Add event listeners
    map.addListener("bounds_changed", () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      setMapZoom(zoom);
      
      // Update map store
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const mapBounds = {
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        };
        
        // Trigger search if not loading and no active business
        if (!loading && !activeBusinessId) {
          if (handleMapBoundsChangeRef.current) {
            handleMapBoundsChangeRef.current(mapBounds, zoom);
          }
        }
      }
    });

    map.addListener("click", () => {
      // Clear active business when clicking empty area
      setActiveBusinessId(null);
      setSelectedBusiness(null);
      setInfoWindow(null);
    });
    } catch (error) {
      logger.error("Error in handleMapLoad:", error);
      setMapError(error);
      setMapLoaded(false);
    }
  }, [setMapRef, loading, activeBusinessId, setActiveBusinessId]);

  // Handle map bounds change
  const handleMapBoundsChange = useCallback(async (bounds, zoom) => {
    try {
      setIsSearching(true);
      logger.performance(`Map bounds changed: ${JSON.stringify(bounds)}, zoom: ${zoom}`);
      
      if (bounds && !activeBusinessId) {
        await fetchFilteredBusinesses(bounds, zoom, searchQuery);
      }
    } catch (error) {
      logger.error("Map bounds change error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search in this area. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [fetchFilteredBusinesses, activeBusinessId, searchQuery]);

  // Store the function in a ref to avoid hoisting issues
  useEffect(() => {
    handleMapBoundsChangeRef.current = handleMapBoundsChange;
  }, [handleMapBoundsChange]);

  // Handle map errors
  const handleMapError = useCallback((error) => {
    logger.error("Google Maps error:", error);
    setMapError(error);
    setMapLoaded(false);
    
    // Provide specific error messages
    if (error.message?.includes('ApiTargetBlockedMapError')) {
      logger.error("Google Maps API blocked - check API key restrictions and billing");
      toast({
        title: "Map Loading Error",
        description: "Google Maps API is blocked. Please check API key configuration.",
        variant: "destructive",
      });
    } else if (error.message?.includes('ApiNotActivatedMapError')) {
      logger.error("Google Maps API not activated");
      toast({
        title: "Map Loading Error", 
        description: "Google Maps API is not activated. Please enable it in Google Cloud Console.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Map Loading Error",
        description: "Failed to load Google Maps. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle marker click
  const handleMarkerClick = useCallback((business) => {
    try {
      setSelectedBusiness(business);
      setActiveBusinessId(business.id);
      setInfoWindow(business.id);
      
      // Center map on business
      if (mapRef.current && business.coordinates) {
        mapRef.current.panTo({
          lat: business.coordinates.lat,
          lng: business.coordinates.lng,
        });
        mapRef.current.setZoom(15);
      }
      
      // Call the onBusinessSelect prop if provided
      if (props.onBusinessSelect) {
        props.onBusinessSelect(business);
      }
    } catch (error) {
      logger.error("Error in handleMarkerClick:", error);
      toast({
        title: "Error",
        description: "Failed to select business. Please try again.",
        variant: "destructive",
      });
    }
  }, [setActiveBusinessId, props]);

  // Handle search in area
  const handleSearchInArea = useCallback(async () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      const zoom = mapRef.current.getZoom();
      
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const mapBounds = {
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        };
        
        if (handleMapBoundsChangeRef.current) {
          await handleMapBoundsChangeRef.current(mapBounds, zoom);
        }
      }
    }
  }, []);

  // Handle my location
  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(14);
          }
          
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          logger.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your permissions.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  }, []);

  // Show fallback UI when Google Maps API key is missing
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-container relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center" ref={containerRef}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="grid grid-cols-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-border dark:border-border"></div>
            ))}
          </div>
        </div>

        <div className="text-center p-8 max-w-lg relative z-10">
          <div className="mb-6">
            <div className="relative mb-4">
              <MapPin className="w-16 h-16 text-primary mx-auto" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">Google Maps Configuration Required</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm leading-relaxed mb-4">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to display the interactive map
            </p>
          </div>

          <div className="bg-white dark:bg-card rounded-lg p-4 mb-6 border border-border dark:border-border">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground space-y-2">
              <p className="font-medium text-left">For developers:</p>
              <code className="block bg-muted dark:bg-muted p-2 rounded text-xs text-left">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
              </code>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")} 
              className="text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Key
            </Button>
            <Button onClick={() => window.location.reload()} className="text-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container relative w-full h-full overflow-hidden" ref={containerRef}>
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-muted dark:bg-card flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 bg-red-50 dark:bg-destructive/20 flex items-center justify-center z-10">
          <div className="text-center p-4">
            <div className="text-destructive text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive dark:text-destructive/80 mb-2">Map Error</h3>
            <p className="text-sm text-destructive dark:text-destructive/90 mb-4">
              Failed to load Google Maps. Please check your internet connection.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="text-destructive border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
              )}

      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        loadingElement={<div>Loading...</div>}
      >
        <GoogleMap
          ref={mapRef}
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={mapOptions}
          onLoad={handleMapLoad}
          onError={handleMapError}
        >
          {/* Render business markers with clustering */}
          <MarkerClusterer
            options={{
              gridSize: 50,
              minimumClusterSize: 3,
              styles: [
                {
                  url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzYjgyZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6Ii8+Cjwvc3ZnPgo8L3N2Zz4K",
                  width: 40,
                  height: 40,
                  textColor: "hsl(var(--background))",
                  textSize: 14,
                },
              ],
            }}
          >
            {(clusterer) => (
              <>
                {displayBusinesses?.map((business) => {
                  if (!business.coordinates) return null;
                  
                  const isActive = business.id === activeBusinessId;
                  const icon = createBusinessMarkerIcon(isActive, business.rating, business.category);
                  
                  return (
                    <Marker
                      key={business.id}
                      position={{
                        lat: business.coordinates.lat,
                        lng: business.coordinates.lng,
                      }}
                      icon={icon}
                      onClick={() => handleMarkerClick(business)}
                      zIndex={isActive ? 1000 : 500}
                      clusterer={clusterer}
                    >
                {/* Custom Info Window */}
                {infoWindow === business.id && (
                  <CustomInfoWindow
                    position={{
                      lat: business.coordinates.lat,
                      lng: business.coordinates.lng,
                    }}
                    onClose={() => {
                      setInfoWindow(null);
                      setSelectedBusiness(null);
                      setActiveBusinessId(null);
                    }}
                  >
                                      <div
                    className="p-6 w-80 bg-card rounded-xl border border-border shadow-2xl custom-infowindow-content"
                    style={{
                      backgroundColor: 'hsl(var(--background)) !important',
                      color: 'hsl(var(--background)) !important',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxShadow: '0 25px 50px -12px hsl(var(--foreground) / 0.5), 0 0 0 1px hsl(var(--background) / 0.05)',
                      border: '1px solid hsl(var(--border)) !important',
                      borderRadius: '12px',
                      minWidth: '320px',
                      maxWidth: '320px',
                      position: 'relative',
                      zIndex: 1000
                    }}
                  >
                      {/* Header with business name and rating */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-3">
                          <h3 className="font-bold text-xl text-white leading-tight tracking-tight mb-1">
                            {business.name}
                          </h3>
                          {business.category && (
                            <p className="text-sm text-muted-foreground font-medium">
                              {business.category}
                            </p>
                          )}
                        </div>
                        {business.rating && (
                          <div className="flex items-center bg-primary text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg flex-shrink-0">
                            <span className="text-warning/90 mr-1">★</span>
                            <span>{business.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Business details */}
                      <div className="space-y-4">
                        {business.address && (
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {business.address}
                            </p>
                          </div>
                        )}

                        {business.phone && (
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 flex-shrink-0">
                              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {business.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex space-x-3 mt-6 pt-4 border-t border-border">
                        <button 
                          onClick={() => {
                            			try { window.open(buildBusinessUrlFrom(business), '_blank'); }
                            catch { window.open(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\\s-]/g,'').replace(/\\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`, '_blank'); }
                          }}
                          className="flex-1 bg-primary hover:bg-primary text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => getDirections(business)}
                          className="bg-muted hover:bg-muted text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Directions
                        </button>
                        <button 
                          onClick={() => toggleFavorite(business.id)}
                          className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                            favorites.has(business.id)
                              ? 'bg-destructive hover:bg-destructive text-white'
                              : 'bg-muted hover:bg-muted text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={favorites.has(business.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </CustomInfoWindow>
                )}
              </Marker>
            );
          })}
                </>
              )}
                        </MarkerClusterer>
            
            {/* User location marker */}
            {showUserLocation && userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                  fillColor: "hsl(var(--primary))",
                  fillOpacity: 1,
                  strokeColor: "hsl(var(--background))",
                  strokeWeight: 3,
                  scale: 1.2,
                  anchor: { x: 12, y: 24 },
                }}
                zIndex={2000}
              />
            )}
          </GoogleMap>
      </LoadScript>

      {/* Business Info Panel - Removed to prevent duplicate info windows */}

      {/* Enhanced Search and Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-3">
        {/* Search Button */}
        <Button 
          onClick={handleSearchInArea} 
          disabled={isSearching} 
          className="bg-primary hover:bg-primary text-white shadow-2xl px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 border-0"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? "Searching..." : "Search this area"}
        </Button>
        
        {/* Filter Toggle */}
        <Button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-card hover:bg-card text-white shadow-2xl px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 border border-border"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filters
        </Button>
        
        {/* Favorites Toggle */}
        <Button 
          onClick={() => setShowFavorites(!showFavorites)}
          className={`shadow-2xl px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 border ${
            showFavorites 
              ? 'bg-destructive hover:bg-destructive text-white border-red-500' 
              : 'bg-card hover:bg-card text-white border-border'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill={showFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorites
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-32 right-4 z-20 bg-card rounded-xl shadow-2xl p-4 space-y-4 min-w-64 border border-border">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="restaurant">Restaurants</option>
              <option value="retail">Retail</option>
              <option value="service">Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="entertainment">Entertainment</option>
              <option value="automotive">Automotive</option>
              <option value="professional">Professional Services</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Minimum Rating: {filterRating}+
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filterRating}
              onChange={(e) => setFilterRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Search Radius */}
          {userLocation && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Search Radius: {searchRadius}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Clear Filters */}
          <Button
            onClick={() => {
              setFilterCategory('');
              setFilterRating(0);
              setSearchRadius(10);
            }}
            className="w-full bg-destructive hover:bg-destructive text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Business Count Indicator */}
      {displayBusinesses.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-card shadow-2xl rounded-xl px-4 py-3 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">
                  {displayBusinesses.length} business{displayBusinesses.length !== 1 ? 'es' : ''}
                </span>
                <div className="text-xs text-muted-foreground">
                  {displayBusinesses.length !== businesses.length 
                    ? `filtered from ${businesses.length} total`
                    : 'in this area'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="flex flex-col gap-3">
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-3">
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZoomIn} 
                className="h-10 w-10 p-0 bg-muted hover:bg-muted text-white rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZoomOut} 
                className="h-10 w-10 p-0 bg-muted hover:bg-muted text-white rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={getUserLocation} 
                disabled={isLoadingLocation}
                className="h-10 w-10 p-0 bg-primary hover:bg-primary text-white rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
              >
                {isLoadingLocation ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GoogleMapsContainer.displayName = "GoogleMapsContainer";

export default GoogleMapsContainer;
