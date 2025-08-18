/**
 * Airbnb-Style Search Experience Component
 * Multi-modal business discovery interface with interactive map, advanced filtering, and real-time results
 * Inspired by Airbnb's maps page but optimized for business discovery
 */

"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Slider } from "@components/ui/slider";
import { 
  Search, Mic, Camera, MapPin, Clock, Star, TrendingUp, Map, List, Grid3X3, 
  Phone, Navigation, Heart, Share2, ArrowRight, Sparkles, Brain, Filter, 
  SlidersHorizontal, X, ChevronDown, ChevronUp, Loader2, RefreshCw,
  DollarSign, Shield, Wifi, Car, CreditCard, Users, Calendar, Globe,
  ExternalLink, Bookmark, Eye, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessHeader } from "@components/dashboard/business/business-header";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";
import MapContainer from "@components/site/map/map-container";
import { toast } from "@components/ui/use-toast";
import SmartSearchAutocomplete from "./smart-search-autocomplete";
import useEnhancedSearchStore, { 
  useSearchResults, 
  useSearchLoading, 
  useSearchFilters, 
  useViewMode, 
  useActiveFiltersCount 
} from "@store/search/use-enhanced-search-store";

// Advanced Filter Panel Component
const AdvancedFilterPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  categories = [],
  priceRanges = ['$', '$$', '$$$', '$$$$'] 
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      categories: [],
      priceRange: [],
      rating: 0,
      distance: 25,
      features: [],
      openNow: false,
      verified: false
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const commonFeatures = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'card', label: 'Credit Cards', icon: CreditCard },
    { id: 'groups', label: 'Good for Groups', icon: Users },
    { id: 'reservations', label: 'Takes Reservations', icon: Calendar },
    { id: 'delivery', label: 'Delivery', icon: Globe }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute right-0 top-0 h-full w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="grid grid-cols-1 gap-1">
                  {categories.slice(0, 8).map(category => (
                    <label key={category.slug} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={tempFilters.categories.includes(category.slug)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTempFilters(prev => ({
                              ...prev,
                              categories: [...prev.categories, category.slug]
                            }));
                          } else {
                            setTempFilters(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c !== category.slug)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="flex space-x-2">
                  {priceRanges.map(price => (
                    <Button
                      key={price}
                      variant={tempFilters.priceRange.includes(price) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (tempFilters.priceRange.includes(price)) {
                          setTempFilters(prev => ({
                            ...prev,
                            priceRange: prev.priceRange.filter(p => p !== price)
                          }));
                        } else {
                          setTempFilters(prev => ({
                            ...prev,
                            priceRange: [...prev.priceRange, price]
                          }));
                        }
                      }}
                    >
                      {price}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-medium mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <Slider
                    value={[tempFilters.rating]}
                    onValueChange={([value]) => setTempFilters(prev => ({ ...prev, rating: value }))}
                    max={5}
                    min={0}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8">{tempFilters.rating}</span>
                </div>
              </div>

              {/* Distance */}
              <div>
                <h4 className="text-sm font-medium mb-2">Distance</h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <Slider
                    value={[tempFilters.distance]}
                    onValueChange={([value]) => setTempFilters(prev => ({ ...prev, distance: value }))}
                    max={50}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{tempFilters.distance} mi</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Features</h4>
                <div className="grid grid-cols-1 gap-1">
                  {commonFeatures.map(({ id, label, icon: Icon }) => (
                    <label key={id} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={tempFilters.features.includes(id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTempFilters(prev => ({
                              ...prev,
                              features: [...prev.features, id]
                            }));
                          } else {
                            setTempFilters(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f !== id)
                            }));
                          }
                        }}
                      />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="text-sm font-medium mb-2">Quick Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={tempFilters.openNow}
                      onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, openNow: checked }))}
                    />
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Open Now</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={tempFilters.verified}
                      onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, verified: checked }))}
                    />
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Verified Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <Button onClick={handleApplyFilters} className="w-full">
                Apply Filters
              </Button>
              <Button onClick={handleResetFilters} variant="outline" className="w-full">
                Reset All
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Smart Search Bar with Location and Business Search
const AirbnbStyleSearchBar = ({ 
  searchCapabilities, 
  onSearch, 
  initialQuery = "", 
  initialLocation = "",
  onFiltersClick,
  activeFiltersCount = 0
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [activeField, setActiveField] = useState(null);

  const handleSearch = () => {
    onSearch({ query: query.trim(), location: location.trim() });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleQuerySelect = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch();
  };

  const handleLocationSelect = (suggestion) => {
    setLocation(suggestion.text);
    if (suggestion.coordinates) {
      // TODO: Update map center with coordinates
      console.log('Location selected with coordinates:', suggestion.coordinates);
    }
    handleSearch();
  };

  return (
    <div className="relative">
      {/* Main Search Bar */}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* What field */}
        <div className="flex-1 relative">
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">What</label>
            <SmartSearchAutocomplete
              value={query}
              onChange={setQuery}
              onSelect={handleQuerySelect}
              placeholder="Restaurants, shops, services..."
              type="what"
              searchCapabilities={searchCapabilities}
              className="w-full"
            />
          </div>
          {activeField === 'what' && (
            <div className="absolute left-0 right-0 top-1 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600"></div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

        {/* Where field */}
        <div className="flex-1 relative">
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Where</label>
            <SmartSearchAutocomplete
              value={location}
              onChange={setLocation}
              onSelect={handleLocationSelect}
              placeholder="City, neighborhood, address..."
              type="where"
              searchCapabilities={searchCapabilities}
              className="w-full"
            />
          </div>
          {activeField === 'where' && (
            <div className="absolute left-0 right-0 top-1 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600"></div>
          )}
        </div>

        {/* Filters Button - Hidden per user request */}
        <div className="px-2 hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={onFiltersClick}
            className="relative rounded-full h-12 px-4"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs p-0 bg-red-500 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search Button */}
        <div className="px-2">
          <Button onClick={handleSearch} className="rounded-full h-12 w-12 p-0 bg-red-500 hover:bg-red-600">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Business Card Component for Different View Modes
const BusinessCard = ({ business, viewMode, onSelect, onSave, onShare }) => {
  const router = useRouter();

  const handleBusinessClick = () => {
    router.push(`/biz/${business.slug}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave?.(business);
    toast({ title: "Saved to favorites", description: `${business.name} has been saved.` });
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: `${window.location.origin}/biz/${business.slug}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/biz/${business.slug}`);
      toast({ title: "Link copied", description: "Business link copied to clipboard." });
    }
  };

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleBusinessClick}
      >
        <div className="flex space-x-4">
          {/* Business Image */}
          <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
            {business.photos?.[0] ? (
              <img 
                src={business.photos[0]} 
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-2xl">🏢</span>
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {business.name}
              </h3>
              <div className="flex items-center space-x-2 ml-2">
                <Button variant="ghost" size="sm" onClick={handleSaveClick}>
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShareClick}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            {business.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(business.rating) 
                          ? 'text-muted-foreground fill-current' 
                          : 'text-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {business.rating} ({business.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Categories */}
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {business.categories?.slice(0, 2).map(category => (
                  <Badge key={category.slug} variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
                {business.priceRange && (
                  <Badge variant="outline" className="text-xs">
                    {business.priceRange}
                  </Badge>
                )}
              </div>
            </div>

            {/* Address */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {business.address}, {business.city}
            </p>

            {/* Status */}
            <div className="flex items-center space-x-2 mt-2">
              {business.isOpenNow && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Open Now
                </Badge>
              )}
              {business.verified && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid/Card view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleBusinessClick}
    >
      {/* Business Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {business.photos?.[0] ? (
          <img 
            src={business.photos[0]} 
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🏢</span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleSaveClick}
            className="rounded-full h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleShareClick}
            className="rounded-full h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {business.isOpenNow && (
            <Badge className="bg-green-500 text-white">Open Now</Badge>
          )}
          {business.verified && (
            <Badge className="bg-blue-500 text-white">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
            {business.name}
          </h3>
          {business.priceRange && (
            <Badge variant="outline" className="text-sm">
              {business.priceRange}
            </Badge>
          )}
        </div>

        {/* Rating */}
        {business.rating && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(business.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {business.rating} ({business.reviewCount})
            </span>
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {business.categories?.slice(0, 2).map(category => (
            <Badge key={category.slug} variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
          <MapPin className="w-4 h-4 inline mr-1" />
          {business.address}, {business.city}
        </p>

        {/* Description */}
        {business.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {business.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {business.phone && (
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${business.phone}`;
              }}>
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {business.website && (
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                window.open(business.website, '_blank');
              }}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// View Mode Toggle Component
const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  const viewModes = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'grid', label: 'Grid', icon: Grid3X3 },
    { id: 'list', label: 'List', icon: List }
  ];

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {viewModes.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={viewMode === id ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange(id)}
          className="flex items-center space-x-1 px-3"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

// Main Airbnb-Style Search Experience Component
const AirbnbStyleSearchExperience = ({ 
  searchParams, 
  initialBusinesses, 
  searchMetadata, 
  featureFlags, 
  searchCapabilities 
}) => {
  const router = useRouter();
  
  // Enhanced search store hooks
  const searchResults = useSearchResults();
  const isLoading = useSearchLoading();
  const filters = useSearchFilters();
  const viewMode = useViewMode();
  const activeFiltersCount = useActiveFiltersCount();
  
  // Search store actions
  const {
    searchQuery,
    searchLocation,
    showFilters,
    performSearch,
    updateFilters,
    setViewMode,
    setSearchQuery,
    setSearchLocation,
    toggleFilters,
    toggleSavedBusiness,
    loadPersistedData,
    totalResults
  } = useEnhancedSearchStore();

  // Mock categories for demo
  const mockCategories = [
    { slug: 'restaurant', name: 'Restaurants' },
    { slug: 'retail', name: 'Shopping' },
    { slug: 'service', name: 'Services' },
    { slug: 'healthcare', name: 'Healthcare' },
    { slug: 'automotive', name: 'Automotive' },
    { slug: 'beauty', name: 'Beauty & Spa' },
    { slug: 'entertainment', name: 'Entertainment' },
    { slug: 'fitness', name: 'Fitness' }
  ];

  // Initialize store on mount
  useEffect(() => {
    // Load persisted data
    loadPersistedData();
    
    // Set initial search parameters
    if (searchParams?.q) setSearchQuery(searchParams.q);
    if (searchParams?.location) setSearchLocation(searchParams.location);
    
    // Use initial businesses if available, otherwise trigger search
    if (initialBusinesses && initialBusinesses.length > 0) {
      // Set initial businesses in store if needed
      console.log('Using initial businesses:', initialBusinesses.length);
    } else if (searchParams?.q || searchParams?.location) {
      // Trigger search with URL parameters
      performSearch();
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async ({ query, location }) => {
    // Update store state
    setSearchQuery(query);
    setSearchLocation(location);

    try {
      // Update URL
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (location) params.set('location', location);
      router.push(`/search?${params.toString()}`);

      // Trigger search
      await performSearch();
      
      toast({ 
        title: "Search updated", 
        description: `Found results for "${query}" in "${location}"` 
      });

    } catch (error) {
      console.error("Search error:", error);
      toast({ 
        title: "Search failed", 
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [router, setSearchQuery, setSearchLocation, performSearch]);

  // Handle filter changes
  const handleFiltersChange = useCallback(async (newFilters) => {
    await updateFilters(newFilters);
    toast({ title: "Filters applied", description: "Search results updated" });
  }, [updateFilters]);

  // Handle sort change
  const handleSortChange = useCallback(async (newSortBy) => {
    await updateFilters({ sortBy: newSortBy });
    toast({ title: "Sort updated", description: `Sorting by ${newSortBy}` });
  }, [updateFilters]);

  // Handle business save
  const handleBusinessSave = useCallback((business) => {
    toggleSavedBusiness(business.id);
  }, [toggleSavedBusiness]);

  // Get current businesses to display
  const businesses = useMemo(() => {
    return searchResults.length > 0 ? searchResults : (initialBusinesses || []);
  }, [searchResults, initialBusinesses]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AirbnbStyleSearchBar
            searchCapabilities={searchCapabilities}
            onSearch={handleSearch}
            initialQuery={searchQuery}
            initialLocation={searchLocation}
            onFiltersClick={() => setShowFilters(true)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalResults ? `${totalResults} places` : (businesses.length > 0 ? `${businesses.length} places` : 'Discover places')}
              {searchLocation && (
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                  in {searchLocation}
                </span>
              )}
            </h2>
            
            {isLoading && (
              <div className="flex items-center text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort dropdown */}
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="distance">Closest</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            {/* View mode toggle */}
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            
            {/* Desktop filters button - Hidden per user request */}
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full text-xs p-0 bg-red-500 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.categories.map(category => {
              const categoryData = mockCategories.find(c => c.slug === category);
              return (
                <Badge key={category} variant="secondary" className="flex items-center space-x-1">
                  <span>{categoryData?.name}</span>
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.filter(c => c !== category)
                      }));
                    }}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {filters.priceRange.map(price => (
              <Badge key={price} variant="secondary" className="flex items-center space-x-1">
                <span>{price}</span>
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      priceRange: prev.priceRange.filter(p => p !== price)
                    }));
                  }}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const { resetFilters } = useEnhancedSearchStore.getState();
                await resetFilters();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'map' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div style={{ height: '70vh' }}>
              <MapContainer 
                businesses={businesses}
                onBusinessSelect={(business) => router.push(`/biz/${business.slug}`)}
              />
            </div>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: viewMode === 'list' ? 6 : 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`
                      bg-gray-200 dark:bg-gray-800 rounded-xl
                      ${viewMode === 'list' ? 'h-32' : 'h-80'}
                    `} />
                  </div>
                ))
              ) : (
                businesses.map((business, index) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    viewMode={viewMode}
                    onSave={handleBusinessSave}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* No results message */}
        {!isLoading && businesses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or expanding your location radius.
            </p>
            <Button onClick={() => setShowFilters(true)} variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Adjust Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={showFilters}
        onClose={toggleFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={mockCategories}
      />
    </div>
  );
};

export default AirbnbStyleSearchExperience;
