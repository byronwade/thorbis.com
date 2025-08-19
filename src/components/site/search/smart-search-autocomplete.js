/**
 * Smart Search Autocomplete Component
 * Provides intelligent search suggestions for businesses and locations
 * with real-time API integration and location services
 */

"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  Search, MapPin, Clock, TrendingUp, Star, Building2, 
  Navigation, Loader2, X, History, Mic, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@components/ui/use-toast";

// Search suggestion types
const SUGGESTION_TYPES = {
  BUSINESS: 'business',
  LOCATION: 'location',
  CATEGORY: 'category',
  POPULAR: 'popular',
  RECENT: 'recent',
  TRENDING: 'trending'
};

// Smart Search Input with Autocomplete
const SmartSearchAutocomplete = ({ 
  value,
  onChange,
  onSelect,
  placeholder = "Search for businesses...",
  type = "what", // "what" or "where"
  searchCapabilities = {},
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`recent-searches-${type}`);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, [type]);

  // Mock popular suggestions based on type
  const popularSuggestions = useMemo(() => {
    if (type === 'what') {
      return [
        { id: '1', type: SUGGESTION_TYPES.POPULAR, text: 'Coffee shops', icon: '☕', category: 'food' },
        { id: '2', type: SUGGESTION_TYPES.POPULAR, text: 'Restaurants', icon: '🍽️', category: 'food' },
        { id: '3', type: SUGGESTION_TYPES.POPULAR, text: 'Gas stations', icon: '⛽', category: 'automotive' },
        { id: '4', type: SUGGESTION_TYPES.POPULAR, text: 'Pharmacies', icon: '💊', category: 'healthcare' },
        { id: '5', type: SUGGESTION_TYPES.POPULAR, text: 'Auto repair', icon: '🔧', category: 'automotive' },
        { id: '6', type: SUGGESTION_TYPES.POPULAR, text: 'Hair salons', icon: '💇', category: 'beauty' }
      ];
    } else {
      return [
        { id: '1', type: SUGGESTION_TYPES.LOCATION, text: 'Current location', icon: '📍', isCurrentLocation: true },
        { id: '2', type: SUGGESTION_TYPES.LOCATION, text: 'New York, NY', icon: '🏙️' },
        { id: '3', type: SUGGESTION_TYPES.LOCATION, text: 'Los Angeles, CA', icon: '🌴' },
        { id: '4', type: SUGGESTION_TYPES.LOCATION, text: 'Chicago, IL', icon: '🏙️' },
        { id: '5', type: SUGGESTION_TYPES.LOCATION, text: 'Miami, FL', icon: '🏖️' },
        { id: '6', type: SUGGESTION_TYPES.LOCATION, text: 'Seattle, WA', icon: '🌲' }
      ];
    }
  }, [type]);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock API response based on query and type
      let mockSuggestions = [];

      if (type === 'what') {
        // Business/category suggestions
        mockSuggestions = [
          { 
            id: `biz-1-${query}`, 
            type: SUGGESTION_TYPES.BUSINESS, 
            text: `${query} restaurants`, 
            icon: '🍽️',
            description: 'Find restaurants matching your search',
            count: Math.floor(Math.random() * 50) + 10
          },
          { 
            id: `biz-2-${query}`, 
            type: SUGGESTION_TYPES.BUSINESS, 
            text: `${query} shops`, 
            icon: '🛍️',
            description: 'Discover shops and retail stores',
            count: Math.floor(Math.random() * 30) + 5
          },
          { 
            id: `cat-1-${query}`, 
            type: SUGGESTION_TYPES.CATEGORY, 
            text: `${query} services`, 
            icon: '🔧',
            description: 'Professional services',
            count: Math.floor(Math.random() * 25) + 8
          }
        ];
      } else {
        // Location suggestions
        mockSuggestions = [
          { 
            id: `loc-1-${query}`, 
            type: SUGGESTION_TYPES.LOCATION, 
            text: `${query}, CA`, 
            icon: '📍',
            description: 'California, United States',
            isCity: true
          },
          { 
            id: `loc-2-${query}`, 
            type: SUGGESTION_TYPES.LOCATION, 
            text: `${query}, NY`, 
            icon: '📍',
            description: 'New York, United States',
            isCity: true
          },
          { 
            id: `loc-3-${query}`, 
            type: SUGGESTION_TYPES.LOCATION, 
            text: `${query} Street`, 
            icon: '🏠',
            description: 'Street address',
            isAddress: true
          }
        ];
      }

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address (mock implementation)
      const mockAddress = "123 Main St, San Francisco, CA";
      
      onChange(mockAddress);
      onSelect({
        type: SUGGESTION_TYPES.LOCATION,
        text: mockAddress,
        coordinates: { latitude, longitude }
      });

      toast({
        title: "Location found",
        description: "Using your current location"
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location unavailable",
        description: "Unable to get your current location",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [onChange, onSelect]);

  // Voice search
  const handleVoiceSearch = useCallback(() => {
    if (!searchCapabilities.voiceSearch || !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice search unavailable",
        description: "Your browser doesn't support voice search",
        variant: "destructive"
      });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      onSelect({
        type: SUGGESTION_TYPES.BUSINESS,
        text: transcript,
        isVoiceSearch: true
      });
    };

    recognition.onerror = (error) => {
      console.error('Voice recognition error:', error);
      toast({
        title: "Voice search failed",
        description: "Please try again or type your search",
        variant: "destructive"
      });
    };
  }, [searchCapabilities.voiceSearch, onChange, onSelect]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    if (newValue) {
      setIsOpen(true);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setSuggestions([]);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion.text);
    onSelect(suggestion);
    
    // Add to recent searches
    const updated = [suggestion, ...recentSearches.filter(s => s.id !== suggestion.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(`recent-searches-${type}`, JSON.stringify(updated));
    
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const allSuggestions = [
      ...(!value ? recentSearches : []),
      ...suggestions,
      ...(!value ? popularSuggestions : [])
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < allSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : allSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        handleSuggestionSelect(allSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(`recent-searches-${type}`);
  };

  // Render suggestions
  const renderSuggestions = () => {
    const showRecent = !value && recentSearches.length > 0;
    const showPopular = !value;
    const showSearchResults = value && suggestions.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute top-full mt-2 w-full bg-white dark:bg-card rounded-xl shadow-xl border border-border dark:border-border overflow-hidden z-50 max-h-96 overflow-y-auto"
      >
        {isLoading && (
          <div className="p-4 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Searching...
          </div>
        )}

        {/* Recent Searches */}
        {showRecent && (
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearRecentSearches}
                className="text-xs text-muted-foreground hover:text-muted-foreground h-6 px-2"
              >
                Clear
              </Button>
            </div>
            {recentSearches.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedIndex === index}
                onClick={() => handleSuggestionSelect(suggestion)}
              />
            ))}
          </div>
        )}

        {/* Search Results */}
        {showSearchResults && (
          <div className="p-2">
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Suggestions
              </span>
            </div>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedIndex === (showRecent ? recentSearches.length : 0) + index}
                onClick={() => handleSuggestionSelect(suggestion)}
              />
            ))}
          </div>
        )}

        {/* Popular Suggestions */}
        {showPopular && (
          <div className="p-2">
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Popular {type === 'what' ? 'searches' : 'locations'}
              </span>
            </div>
            {popularSuggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedIndex === (showRecent ? recentSearches.length : 0) + suggestions.length + index}
                onClick={() => handleSuggestionSelect(suggestion)}
              />
            ))}
          </div>
        )}

        {/* Special actions for location type */}
        {type === 'where' && (
          <div className="p-2 border-t border-border dark:border-border">
            <button
              onClick={getCurrentLocation}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-muted rounded-lg transition-colors"
            >
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Use current location</span>
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-20 border-0 bg-transparent focus:ring-0 text-sm placeholder-gray-400"
        />
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {/* Voice search */}
          {searchCapabilities.voiceSearch && type === 'what' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className="h-6 w-6 p-0 hover:bg-muted dark:hover:bg-muted"
            >
              <Mic className="w-3 h-3" />
            </Button>
          )}
          
          {/* Clear button */}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="h-6 w-6 p-0 hover:bg-muted dark:hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && renderSuggestions()}
      </AnimatePresence>
    </div>
  );
};

// Individual suggestion item component
const SuggestionItem = ({ suggestion, isSelected, onClick }) => {
  const getIcon = () => {
    if (suggestion.icon) return suggestion.icon;
    
    switch (suggestion.type) {
      case SUGGESTION_TYPES.BUSINESS:
        return <Building2 className="w-4 h-4" />;
      case SUGGESTION_TYPES.LOCATION:
        return <MapPin className="w-4 h-4" />;
      case SUGGESTION_TYPES.CATEGORY:
        return <Search className="w-4 h-4" />;
      case SUGGESTION_TYPES.RECENT:
        return <History className="w-4 h-4" />;
      case SUGGESTION_TYPES.TRENDING:
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getBadge = () => {
    if (suggestion.type === SUGGESTION_TYPES.TRENDING) {
      return <Badge variant="secondary" className="text-xs">Trending</Badge>;
    }
    if (suggestion.type === SUGGESTION_TYPES.POPULAR) {
      return <Badge variant="outline" className="text-xs">Popular</Badge>;
    }
    if (suggestion.count) {
      return <span className="text-xs text-muted-foreground">{suggestion.count} results</span>;
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors
        ${isSelected 
          ? 'bg-blue-50 dark:bg-primary/20' 
          : 'hover:bg-gray-50 dark:hover:bg-muted'
        }
      `}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        {typeof suggestion.icon === 'string' ? (
          <span className="text-base">{suggestion.icon}</span>
        ) : (
          getIcon()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground dark:text-white truncate">
          {suggestion.text}
        </div>
        {suggestion.description && (
          <div className="text-xs text-muted-foreground truncate">
            {suggestion.description}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {getBadge()}
      </div>
    </button>
  );
};

export default SmartSearchAutocomplete;
