"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";


import { 
  Search, 
  Mic, 
  Bot,
  Sparkles 
} from "lucide-react";
import { isSpeechRecognitionSupported, createSpeechRecognition } from "@lib/utils/speechRecognition";
import EnhancedLocationSelector from "./enhanced-location-selector";

const AdvancedSearchHeader = ({ 
  onSearch, 
  placeholder = "Find restaurants, services, and more...",
  className = "",
  showAiMode = true,
  showVoiceSearch = true,
  showLocationSelector = true
}) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  const inputRef = useRef(null);
  const formRef = useRef(null);

  // Popular searches
  const popularSearches = [
    "Restaurants", "Hair Salons", "Auto Repair", 
    "Dentists", "Plumbers", "Coffee Shops"
  ];

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
            className="relative z-10 flex flex-col w-full h-full min-w-0 p-1.5 ml-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-blue-500/20 focus-within:border-2"
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
                          					? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700" 
                          : "bg-neutral-700/50 text-neutral-300 border-neutral-600 hover:bg-neutral-700 hover:border-blue-500"
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
                       className="!bg-transparent w-full min-h-[1.5rem] resize-none !border-0 text-sm leading-relaxed shadow-none !outline-none !ring-0 disabled:bg-transparent disabled:opacity-80 text-white placeholder:text-neutral-400"
                       id="search-input"
                       placeholder={placeholder}
                       style={{ height: "20px" }}
                       autoComplete="off"
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       onFocus={handleInputFocus}
                       onBlur={handleInputBlur}
                     />

                  {/* Voice Search Button */}
                  {showVoiceSearch && isClient && supportFlag && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceSearch}
                                             className={`ml-1 p-1.5 rounded-full transition-all duration-200 ${
                         isListening 
                           					? "bg-red-500/20 text-red-400" 
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
                                             className="h-6 text-xs px-1.5 border-neutral-600 bg-neutral-700/30 text-white placeholder:text-neutral-400"
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
                       					: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95 transform"
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

            {/* Popular Searches Dropdown */}
            {showSuggestions && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 overflow-hidden max-h-96">
                 <div className="p-4 space-y-4">
                   <div>
                     <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       						<Sparkles className="w-4 h-4 text-primary dark:text-primary" aria-hidden="true" />
                       Popular Searches
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {popularSearches.map((search, index) => (
                         <Badge
                           key={index}
                           variant="secondary"
                           className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                           onClick={() => handlePopularSearchClick(search)}
                         >
                           {search}
                         </Badge>
                       ))}
                     </div>
                   </div>
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
