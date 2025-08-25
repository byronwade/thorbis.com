"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";


import { 
  Search, 
  Mic, 
  Bot,
  Sparkles,
  MapPin,
  Star,
  Building2,
  Clock,
  X,
  Loader2
} from "lucide-react";
import { isSpeechRecognitionSupported, createSpeechRecognition } from "@lib/utils/speech-recognition";
import EnhancedLocationSelector from "./enhanced-location-selector";
import { buildBusinessUrlFrom } from "@utils";
import { debounce } from "lodash";

const AdvancedSearchHeader = ({ 
  onSearch, 
  placeholder = "Find restaurants, services, and more...",
  className = "",
  showAiMode = true,
  showVoiceSearch = true,
  showLocationSelector = true
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [businessSuggestions, setBusinessSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchError, setSearchError] = useState(null);
  
  const inputRef = useRef(null);
  const formRef = useRef(null);

  // Popular searches
  const popularSearches = [
    "Restaurants", "Hair Salons", "Auto Repair", 
    "Dentists", "Plumbers", "Coffee Shops"
  ];

  // Fetch business suggestions
  const fetchBusinessSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setBusinessSuggestions([]);
        setSearchError(null);
        return;
      }

      setIsLoadingSuggestions(true);
      setSearchError(null);
      
      try {
        const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          setBusinessSuggestions(data.businesses || []);
        } else {
          setBusinessSuggestions([]);
          setSearchError('Failed to load suggestions');
        }
      } catch (error) {
        console.error('Error fetching business suggestions:', error);
        setBusinessSuggestions([]);
        setSearchError('Network error');
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  // Client-side hydration guard
  useEffect(() => {
    setIsClient(true);
  }, []);

  const supportFlag = isClient && isSpeechRecognitionSupported();

  // Initialize speech recognition
  useEffect(() => {
    if (!isClient || !supportFlag || !showVoiceSearch) return;

    try {
      const recognition = createSpeechRecognition({
        continuous: false,
        interimResults: false,
        lang: "en-US",
      });

      recognition.setCallbacks({
        onStart: () => setIsListening(true),
        onResult: (result) => {
          if (result.isFinal && result.transcript) {
            setQuery(result.transcript.trim());
            setIsListening(false);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });

      setSpeechRecognition(recognition);
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
    }

    return () => {
      if (speechRecognition) {
        speechRecognition.destroy();
      }
    };
  }, [isClient, supportFlag, showVoiceSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query.trim(), location);
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestionIndex(-1);

    if (value.trim() && value.length >= 2) {
      setShowSuggestions(true);
      fetchBusinessSuggestions(value);
    } else {
      setShowSuggestions(false);
      setBusinessSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || businessSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < businessSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && businessSuggestions[selectedSuggestionIndex]) {
          const selectedBusiness = businessSuggestions[selectedSuggestionIndex];
          setQuery(selectedBusiness.name);
          setShowSuggestions(false);
          if (onSearch) {
            onSearch(selectedBusiness.name, location);
          }
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (business) => {
    // Navigate to business page
    try {
      router.push(buildBusinessUrlFrom(business));
    } catch {
      router.push(`/us/${(business.state||'').toLowerCase()}/${(business.city||'').toLowerCase()}/${(business.name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')}-${business.short_id || business.shortId || ''}`);
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleVoiceSearch = async () => {
    if (!supportFlag || !speechRecognition) return;

    if (isListening) {
      speechRecognition.stop();
    } else {
      try {
        await speechRecognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const handlePopularSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchTerm, location);
    }
  };

  const toggleAiMode = () => {
    setAiMode(!aiMode);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={`hidden items-center w-full max-w-xl md:flex ${className}`}>
      <div className="flex items-center w-full max-w-xl">
        <div className="relative w-full">
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative z-10 flex flex-col w-full h-full min-w-0 p-1.5 ml-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-primary focus-within:shadow-blue-500/20 focus-within:border-2 focus-within:bg-neutral-800/70"
          >
            <div className="relative flex items-center justify-between w-full">
              <div className="flex items-center justify-center flex-1">
                <div className="relative w-full flex items-center">
                  {/* Enhanced AI Mode Button (Primary) */}
                  {showAiMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleAiMode}
                      className={`inline-flex items-center justify-center whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-md text-sm mr-2 h-6 px-2 py-0.5 transition-all duration-200 border ${
                        aiMode 
                          					? "bg-primary text-white border-primary shadow-sm hover:bg-primary" 
                          : "bg-neutral-700/50 text-neutral-300 border-neutral-600 hover:bg-neutral-700 hover:border-primary"
                      }`}
                      title={aiMode ? "AI Mode Active - Click to disable" : "Enter AI Search Mode"}
                    >
                      <div className="flex items-center gap-0.5">
                        <Bot className="w-3 h-3" aria-hidden="true" />
                        <span className="text-[10px] font-semibold leading-none">
                          AI
                        </span>
                      </div>
                    </Button>
                  )}

                  {/* Search Input */}
                  <input
                    ref={inputRef}
                    className="!bg-transparent w-full min-h-[1.5rem] resize-none !border-0 text-sm leading-relaxed shadow-none !outline-none !ring-0 disabled:bg-transparent disabled:opacity-80 text-white placeholder:text-neutral-400 transition-all duration-200 focus:placeholder:text-neutral-500"
                    id="search-input"
                    placeholder={placeholder}
                    style={{ height: "20px" }}
                    autoComplete="off"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  
                  {/* Search Status Indicator */}
                  {isLoadingSuggestions && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Voice Search Button */}
                  {showVoiceSearch && isClient && supportFlag && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceSearch}
                                             className={`ml-1 p-1.5 rounded-full transition-all duration-200 ${
                         isListening 
                           					? "bg-destructive/20 text-destructive" 
                           : "hover:bg-neutral-700 hover:text-white text-neutral-400"
                       }`}
                      aria-label="Start voice search"
                      title="🎤 Click to search by voice"
                    >
                      <Mic className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center space-x-1.5 ml-1">
                                 {/* Compact Separator */}
                 <div className="h-3 w-px bg-neutral-600"></div>

                {/* Enhanced Location Selector */}
                {showLocationSelector && (
                  <div className="relative">
                    <EnhancedLocationSelector
                      value={location ? { 
                        shortName: location, 
                        formattedAddress: location,
                        city: location.split(',')[0]?.trim() || location
                      } : null}
                      onChange={(selectedLocation) => {
                        setLocation(selectedLocation?.shortName || selectedLocation?.formattedAddress || '');
                      }}
                      placeholder="Location"
                      size="small"
                      variant="default"
                      className="text-xs"
                      showFavorites={true}
                      showRecent={true}
                      showCurrentLocation={true}
                    />
                  </div>
                )}

                {/* Compact Search Submit Button */}
                <Button
                  type="submit"
                  disabled={!query.trim()}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 pointer-events-auto cursor-pointer h-6 px-2 shadow-sm ${
                    !query.trim() 
                      ? "bg-neutral-700/50 text-neutral-500 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg active:scale-95 transform hover:scale-105"
                  }`}
                  title={query.trim() ? "Search now" : "Enter a search term"}
                >
                  <Search className="w-3 h-3" />
                  {query.trim() && (
                    <span className="hidden sm:inline ml-0.5 text-[10px]">Go</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Business Suggestions Dropdown */}
            {showSuggestions && (businessSuggestions.length > 0 || isLoadingSuggestions || searchError) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/50 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="p-4">
                  {/* Loading State */}
                  {isLoadingSuggestions && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-neutral-400">Searching businesses...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {searchError && !isLoadingSuggestions && (
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">{searchError}</p>
                        <button 
                          onClick={() => fetchBusinessSuggestions(query)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Business Suggestions */}
                  {!isLoadingSuggestions && !searchError && businessSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Businesses ({businessSuggestions.length})
                      </h4>
                      <div className="space-y-1">
                        {businessSuggestions.map((business, index) => (
                          <div
                            key={business.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedSuggestionIndex === index
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-neutral-900/50 border border-transparent hover:border-neutral-700/50'
                            }`}
                            onClick={() => handleSuggestionClick(business)}
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {business.name}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {business.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-neutral-400">{business.rating}</span>
                                  </div>
                                )}
                                {business.reviewCount && (
                                  <span className="text-xs text-neutral-500">
                                    ({business.reviewCount} reviews)
                                  </span>
                                )}
                                {business.formattedAddress && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3 text-neutral-500" />
                                    <span className="text-xs text-neutral-500 truncate">
                                      {business.formattedAddress}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  {!isLoadingSuggestions && !searchError && businessSuggestions.length === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Popular Searches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((search, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-neutral-800 hover:border-primary/40 transition-colors bg-neutral-800/50 border-neutral-700 text-neutral-300"
                              onClick={() => handlePopularSearchClick(search)}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchHeader;
