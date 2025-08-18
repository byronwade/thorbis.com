"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { 
  Star, Phone, Navigation, ExternalLink, 
  Loader2, Shield, Users, Calendar, MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import GoogleMapsContainer from "@components/site/map/google-maps-container";
import { toast } from "@components/ui/use-toast";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";
import ErrorBoundary from "@components/shared/error-boundary";
import UnifiedHeader from "@components/shared/unified-header";
import { useTranslation } from "@lib/i18n/enhanced-client";

/**
 * Modern search experience with proper split view design
 * Features Google Maps-style split layout with list and map
 */
const ModernSearchExperience = React.memo(function ModernSearchExperience({ 
  searchParams = {},
  initialBusinesses = [],
  searchMetadata = {},
  featureFlags = {},
  searchCapabilities = {}
}) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { dictionary } = useTranslation();
  
  // Refs for DOM elements
  const mapContainerRef = useRef(null);

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.location || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // split, list, map
  const [showMobileMap, setShowMobileMap] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    rating: searchParams.rating || "",
    priceRange: searchParams.price || "",
    category: searchParams.category || "",
    openNow: false,
    verified: false
  });

  // Store hooks
  const { setMapRef, getMapBounds } = useMapStore();
  const { 
    filteredBusinesses, 
    loading, 
    fetchFilteredBusinesses,
    setActiveBusinessId,
    activeBusinessId 
  } = useBusinessStore();

  // Transform businesses data for consistent structure
  const businesses = useMemo(() => {
    return initialBusinesses?.length > 0 ? initialBusinesses : filteredBusinesses || [];
  }, [initialBusinesses, filteredBusinesses]);

  // Search function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !locationQuery.trim()) {
      toast({
        title: dictionary?.search?.searchRequired || "Search Required",
        description: dictionary?.search?.searchRequiredDescription || "Please enter a business name or location to search.",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Update URL with search parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (locationQuery.trim()) params.set("location", locationQuery.trim());
      if (filters.rating) params.set("rating", filters.rating);
      if (filters.priceRange) params.set("price", filters.priceRange);
      if (filters.category) params.set("category", filters.category);
      
      const newUrl = `/search?${params.toString()}`;
      router.push(newUrl);
      
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: dictionary?.search?.searchError || "Search Error",
        description: dictionary?.search?.searchErrorDescription || "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, locationQuery, filters, router]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setLocationQuery("");
    setFilters({
      rating: "",
      priceRange: "",
      category: "",
      openNow: false,
      verified: false
    });
    router.push("/search");
  }, [router]);

  // Handle business selection from map
  const handleBusinessSelect = useCallback((business) => {
    setSelectedBusiness(business);
    setActiveBusinessId(business.id);
  }, [setActiveBusinessId]);

  // Handle business click - navigate to business page
  const handleBusinessClick = useCallback((business) => {
    if (business.slug) {
      router.push(`/biz/${business.slug}`);
    } else {
      router.push(`/biz/${business.id}`);
    }
  }, [router]);

  // View controls are now in the navigation menu instead of a toolbar

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Standard Header with Logo & Search Bar + Custom Nav for Search */}
        <UnifiedHeader 
          dashboardType="site"
          showSearch={true}
          customNavItems={[
            { key: "list", text: "List View", href: "#", onClick: () => setViewMode("list"), isActive: viewMode === "list" },
            { key: "split", text: "Split View", href: "#", onClick: () => setViewMode("split"), isActive: viewMode === "split" },
            { key: "map", text: "Map View", href: "#", onClick: () => setViewMode("map"), isActive: viewMode === "map" },
            { 
              key: "filters", 
              text: `Filters ${Object.keys(filters).filter(key => 
                (key === 'rating' && filters[key]) || 
                (key === 'priceRange' && filters[key]) || 
                (key === 'category' && filters[key])
              ).length > 0 ? `(${Object.keys(filters).filter(key => 
                (key === 'rating' && filters[key]) || 
                (key === 'priceRange' && filters[key]) || 
                (key === 'category' && filters[key])
              ).length})` : ''}`, 
              href: "#", 
              onClick: () => setShowFilters(!showFilters),
              badge: showFilters ? "Open" : null
            },
            ...(businesses.length > 0 ? [
              { key: "results", text: `${businesses.length} Results`, href: "#", isActive: false }
            ] : [])
          ]}
        />

        {/* Main Content Area */}
        <div className="flex-1">

          {/* Mobile Map Toggle */}
          {showMobileMap && (
            <div className="lg:hidden">
              <div className="h-80 bg-gray-100">
                <MapContainer
                  ref={mapContainerRef}
                  businesses={businesses}
                  onBusinessSelect={handleBusinessSelect}
                  selectedBusiness={selectedBusiness}
                  className="w-full h-full"
                  showControls={true}
                  showSearchButton={false}
                />
              </div>
            </div>
          )}

          {/* Desktop Layout */}
          <div className="hidden lg:block h-[calc(100vh-8rem)]">
            {viewMode === "split" && (
              <div className="grid grid-cols-[380px_1fr] h-full">
                {/* Left Panel - Results */}
                <div className="overflow-hidden border-r border-gray-200 dark:border-gray-800">
                  <div className="h-full overflow-y-auto bg-white dark:bg-gray-950">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="text-lg text-muted-foreground">Finding businesses...</p>
                      </div>
                    ) : businesses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <MapPin className="w-16 h-16 mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No businesses found</h3>
                        <p className="text-muted-foreground mb-6 text-center">Try adjusting your search criteria or location</p>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        {businesses.map((business, index) => (
                          <motion.div
                            key={business.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                              selectedBusiness?.id === business.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handleBusinessClick(business)}
                            onMouseEnter={() => handleBusinessSelect(business)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {business.photos?.[0] ? (
                                  <img
                                    src={business.photos[0].url || business.photos[0]}
                                    alt={business.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                    <span className="text-2xl text-gray-400">🏢</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-semibold text-foreground truncate">
                                    {business.name}
                                  </h3>
                                  {business.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                
                                {business.categories?.length > 0 && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {business.categories[0].name}
                                  </p>
                                )}
                                
                                <div className="flex items-center space-x-2 mb-2">
                                  {business.rating > 0 && (
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm font-medium ml-1">{business.rating}</span>
                                      {business.reviewCount > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          ({business.reviewCount})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {business.priceRange && (
                                    <Badge variant="outline" className="text-xs">
                                      {business.priceRange}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground truncate">
                                  {business.address}, {business.city}, {business.state}
                                </p>
                                
                                {business.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <Phone className="w-3 h-3 mr-2" />
                                    {business.phone}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-shrink-0">
                                {business.website && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(business.website, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Map */}
                <div className="overflow-hidden">
                  <div className="h-full bg-gray-100 relative">
                    {/* Map status info */}
                    {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
                        <div className="text-center p-6">
                          <div className="text-4xl mb-4">🗺️</div>
                          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to display the interactive map
                          </p>
                          <p className="text-xs text-gray-500">
                            Businesses: {businesses.length} found
                          </p>
                        </div>
                      </div>
                    )}
                    <GoogleMapsContainer
                      ref={mapContainerRef}
                      businesses={businesses}
                      onBusinessSelect={handleBusinessSelect}
                      selectedBusiness={selectedBusiness}
                      className="w-full h-full"
                      showControls={true}
                      showSearchButton={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {viewMode === "list" && (
              <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 h-full overflow-y-auto">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">Finding businesses...</p>
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No businesses found</h3>
                      <p className="text-muted-foreground mb-6">Try adjusting your search criteria or location</p>
                    </div>
                  ) : (
                    businesses.map((business, index) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                              onClick={() => handleBusinessClick(business)}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              {business.photos?.[0] && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={business.photos[0].url || business.photos[0]}
                                    alt={business.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-xl text-foreground truncate">
                                    {business.name}
                                  </h3>
                                  {business.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                
                                {business.categories?.length > 0 && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {business.categories[0].name}
                                  </p>
                                )}
                                
                                <div className="flex items-center space-x-4 mb-3">
                                  {business.rating > 0 && (
                                    <div className="flex items-center">
                                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium ml-1">{business.rating}</span>
                                      {business.reviewCount > 0 && (
                                        <span className="text-sm text-muted-foreground ml-1">
                                          ({business.reviewCount} reviews)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {business.priceRange && (
                                    <Badge variant="outline">
                                      {business.priceRange}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-muted-foreground mb-3">
                                  {business.address}, {business.city}, {business.state}
                                </p>
                                
                                {business.phone && (
                                  <div className="flex items-center text-muted-foreground">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {business.phone}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-shrink-0 space-y-2">
                                {business.website && (
                                  <Button
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(business.website, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div className="h-full bg-gray-100">
                <MapContainer
                  ref={mapContainerRef}
                  businesses={businesses}
                  onBusinessSelect={handleBusinessSelect}
                  selectedBusiness={selectedBusiness}
                  className="w-full h-full"
                  showControls={true}
                  showSearchButton={false}
                />
              </div>
            )}
          </div>

          {/* Mobile Layout - Simple List */}
          <div className="lg:hidden">
            <div className="max-w-screen-2xl mx-auto px-6 py-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Finding businesses...</p>
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No businesses found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your search criteria or location</p>
                  </div>
                ) : (
                  businesses.map((business, index) => (
                    <motion.div
                      key={business.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                            onClick={() => handleBusinessClick(business)}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {business.photos?.[0] ? (
                                <img
                                  src={business.photos[0].url || business.photos[0]}
                                  alt={business.name}
                                  className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                  <span className="text-3xl text-gray-400">🏢</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">
                                  {business.name}
                                </h3>
                                {business.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              
                              {business.categories?.length > 0 && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {business.categories[0].name}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-3 mb-2">
                                {business.rating > 0 && (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium ml-1">{business.rating}</span>
                                    {business.reviewCount > 0 && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({business.reviewCount})
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {business.priceRange && (
                                  <Badge variant="outline" className="text-xs">
                                    {business.priceRange}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground truncate mb-2">
                                {business.address}, {business.city}, {business.state}
                              </p>
                              
                              {business.phone && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3 mr-2" />
                                  {business.phone}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0">
                              {business.website && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(business.website, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ModernSearchExperience;