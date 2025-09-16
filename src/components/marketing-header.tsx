"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Mic, 
  ShoppingCart, 
  Menu,
  Sun,
  Moon
} from "lucide-react";

export function MarketingHeader() {
  const [searchValue, setSearchValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-[9999] bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800/50 shadow-lg backdrop-blur-md">
      <div className="flex items-center w-full py-3 px-4 sm:py-4 sm:px-6 lg:px-8">
        
        {/* Logo and Search Section */}
        <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <Image
              alt="Thorbis"
              loading="lazy"
              width={32}
              height={32}
              decoding="async"
              className="h-7 w-auto sm:h-8 object-contain transition-transform duration-200 group-hover:scale-105"
              style={{ color: "transparent" }}
              src="/logos/ThorbisLogo.webp"
            />
            <span className="ml-2 text-lg font-bold text-white hidden sm:block">
              Thorbis
            </span>
          </Link>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <div className="hidden items-center w-full max-w-xl md:flex w-full">
                <div className="flex items-center w-full max-w-xl">
                  <div className="relative w-full">
                    <form className="relative z-10 flex flex-col w-full h-full min-w-0 p-1.5 ml-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-primary focus-within:shadow-blue-500/20 focus-within:border-2">
                      <div className="relative flex items-center justify-between w-full">
                        
                        {/* Search Input Section */}
                        <div className="flex items-center justify-center flex-1">
                          <div className="relative w-full flex items-center">
                            <input
                              className="!bg-transparent w-full min-h-[1.5rem] resize-none !border-0 text-sm leading-relaxed shadow-none !outline-none !ring-0 disabled:bg-transparent disabled:opacity-80 text-white placeholder:text-neutral-400"
                              id="search-input"
                              placeholder="Find restaurants, services, and more..."
                              style={{ height: "20px" }}
                              autoComplete="off"
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                            />
                            
                            {/* Voice Search Button */}
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 ml-1 p-1.5 rounded-full transition-all duration-200 hover:bg-neutral-700 hover:text-white text-neutral-400 h-8 gap-1.5 has-[>svg]:px-2.5"
                              type="button"
                              aria-label="Start voice search"
                              title="🎤 Click to search by voice"
                            >
                              <Mic className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Location and Search Button Section */}
                        <div className="relative flex items-center space-x-1.5 ml-1">
                          <div className="h-3 w-px bg-neutral-600" />
                          
                          {/* Location Dropdown */}
                          <div className="relative" ref={locationRef}>
                            <button
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-2 has-[>svg]:px-3 justify-between text-left font-normal transition-all duration-200 hover:bg-neutral-700/50 hover:border-neutral-500 h-6 text-xs px-1.5 border-neutral-600 bg-neutral-700/30 text-white placeholder:text-neutral-400"
                              type="button"
                              aria-haspopup="menu"
                              aria-expanded={isLocationOpen}
                              onClick={() => setIsLocationOpen(!isLocationOpen)}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-neutral-700/50">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <span className="truncate font-medium">Location</span>
                              </div>
                              <ChevronDown className={'w-4 h-4 opacity-50 flex-shrink-0 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : '}'} />
                            </button>
                            
                            {/* Location Dropdown Menu */}
                            {isLocationOpen && (
                              <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/60 rounded-lg shadow-xl z-[10000] overflow-hidden">
                                <div className="p-3">
                                  <div className="text-sm font-medium text-neutral-300 mb-2">Current Location</div>
                                  <div className="space-y-2">
                                    <button className="w-full text-left p-2 rounded hover:bg-neutral-800/50 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <div>
                                          <div className="text-sm text-white">San Francisco, CA</div>
                                          <div className="text-xs text-neutral-400">Current location</div>
                                        </div>
                                      </div>
                                    </button>
                                    <div className="border-t border-neutral-800/50 pt-2 mt-2">
                                      <div className="text-xs text-neutral-400 mb-2">Recent Locations</div>
                                      <button className="w-full text-left p-2 rounded hover:bg-neutral-800/50 transition-colors">
                                        <div className="text-sm text-neutral-300">New York, NY</div>
                                      </button>
                                      <button className="w-full text-left p-2 rounded hover:bg-neutral-800/50 transition-colors">
                                        <div className="text-sm text-neutral-300">Los Angeles, CA</div>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Search Button */}
                          <button
                            className="gap-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 py-2 has-[>svg]:px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 pointer-events-auto h-6 px-2 shadow-sm bg-neutral-700/50 text-neutral-500 cursor-not-allowed"
                            type="submit"
                            disabled={!searchValue}
                            title="Enter a search term"
                          >
                            <Search className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
        
        {/* Navigation and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex space-x-1 items-center">
              <Link href="/">
                <button className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-3 py-2 text-sm font-medium relative transition-all duration-200 bg-primary/20 text-primary/90 border-primary shadow-sm">
                  Home
                </button>
              </Link>
              
              <Link href="/discover">
                <button className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-3 py-2 text-sm font-medium relative transition-all duration-200 text-white hover:text-primary/90 hover:bg-primary/20">
                  Discover
                </button>
              </Link>
              
              <Link href="/categories">
                <button className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-3 py-2 text-sm font-medium relative transition-all duration-200 text-white hover:text-primary/90 hover:bg-primary/20">
                  Categories
                </button>
              </Link>
              
              <Link href="/jobs">
                <button className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-3 py-2 text-sm font-medium relative transition-all duration-200 text-white hover:text-primary/90 hover:bg-primary/20">
                  Jobs
                </button>
              </Link>
              
              <div className="relative" ref={menuRef}>
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 text-white hover:text-primary/90 hover:bg-primary/20 px-3 py-2 text-sm font-medium transition-all duration-200"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isDesktopMenuOpen}
                  onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                >
                  <span className="flex items-center space-x-1">
                    <span>Menu</span>
                    <ChevronDown className={'h-4 w-4 transition-transform duration-200 ${isDesktopMenuOpen ? 'rotate-180' : '}'} />
                  </span>
                </button>
                
                {/* Desktop Menu Dropdown - Simplified */}
                {isDesktopMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/60 rounded-lg shadow-xl z-[10000] overflow-hidden">
                    <div className="py-2">
                      <Link href="/add-a-business" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors">
                        List Business
                      </Link>
                      <Link href="/dashboard/business" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors">
                        Dashboard
                      </Link>
                      <div className="border-t border-neutral-800/50 my-1"></div>
                      <Link href="/help" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors">
                        Help & Support
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            
            {/* Shopping Cart */}
            <button
              className="whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:text-accent-foreground dark:hover:bg-accent/50 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 relative flex items-center justify-center h-8 w-8 hover:bg-muted transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link href="/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                  Sign In
                </button>
              </Link>
              
              <Link href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                  Sign Up
                </button>
              </Link>
            </div>
            
            {/* Mobile Search Button */}
            <button className="whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 sm:hidden flex items-center justify-center h-8 w-8 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 shadow-sm">
              <Search className="h-5 w-5 text-foreground" />
            </button>
            
            {/* Theme Toggle */}
            <div className="hidden sm:block relative" ref={themeRef}>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 w-8" 
                type="button"
                aria-haspopup="menu"
                aria-expanded={isThemeOpen}
                onClick={() => setIsThemeOpen(!isThemeOpen)}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </button>
              
              {/* Theme Dropdown */}
              {isThemeOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/60 rounded-lg shadow-xl z-[10000] overflow-hidden">
                  <div className="py-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600"></div>
                      System
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 lg:hidden mobile-menu-button flex items-center justify-center h-8 w-8 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}