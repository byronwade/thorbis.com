"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator 
} from "@components/ui/command";
import { DialogTitle } from "@components/ui/dialog";
import { 
  Search, 
  Clock, 
  Star, 
  Zap, 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  Calendar,
  Building2,
  ArrowRight,
  Command,
  X,
  Home,
  Monitor,
  MapPin,
  Plus
} from "lucide-react";
import { logger } from "@lib/utils/logger";

/**
 * Advanced Search Component with Command Palette
 * Features: Fuzzy search, keyboard shortcuts, recent searches, smart suggestions
 */
export default function AdvancedSearch({ 
  dashboardType = "business",
  onSearchSelect,
  isOpen = null,
  onClose = null,
  className = ""
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== null ? isOpen : internalOpen;
  const setOpen = onClose !== null ? onClose : setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const router = useRouter();

  // Performance tracking
  const startTime = performance.now();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`recent_searches_${dashboardType}`);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('Failed to load recent searches:', error);
    }
  }, [dashboardType]);

  // Quick actions based on dashboard type
  const dashboardQuickActions = useMemo(() => {
    const actions = {
      business: [
        { 
          id: "new-job", 
          title: "Create New Job", 
          description: "Schedule a new field service job",
          icon: Calendar, 
          href: "/dashboard/business/jobs/create",
          keywords: ["job", "create", "new", "schedule", "appointment"]
        },
        { 
          id: "new-customer", 
          title: "Add Customer", 
          description: "Add a new customer to your database",
          icon: Users, 
          href: "/dashboard/business/customers/create",
          keywords: ["customer", "add", "new", "client", "contact"]
        },
        { 
          id: "new-estimate", 
          title: "Create Estimate", 
          description: "Generate a new service estimate",
          icon: FileText, 
          href: "/dashboard/business/estimates/create",
          keywords: ["estimate", "quote", "pricing", "proposal"]
        },
        { 
          id: "analytics", 
          title: "View Analytics", 
          description: "Check business performance metrics",
          icon: BarChart3, 
          href: "/dashboard/business/analytics",
          keywords: ["analytics", "metrics", "performance", "reports", "data"]
        },
        { 
          id: "settings", 
          title: "Business Settings", 
          description: "Configure business preferences",
          icon: Settings, 
          href: "/dashboard/business/settings",
          keywords: ["settings", "config", "preferences", "setup"]
        },
      ],
      user: [
        { 
          id: "write-review", 
          title: "Write Review", 
          description: "Share your experience with a business",
          icon: Star, 
          href: "/dashboard/user/reviews/create",
          keywords: ["review", "rating", "feedback", "experience"]
        },
        { 
          id: "post-job", 
          title: "Post Job Request", 
          description: "Request field service from professionals",
          icon: Zap, 
          href: "/dashboard/user/jobs/create",
          keywords: ["job", "request", "service", "help", "professional"]
        },
        { 
          id: "bookmarks", 
          title: "My Bookmarks", 
          description: "View saved businesses and services",
          icon: Star, 
          href: "/dashboard/user/bookmarks",
          keywords: ["bookmarks", "saved", "favorites", "liked"]
        },
      ],
      admin: [
        { 
          id: "users", 
          title: "Manage Users", 
          description: "View and manage platform users",
          icon: Users, 
          href: "/admin/users",
          keywords: ["users", "members", "accounts", "people"]
        },
        { 
          id: "reports", 
          title: "Platform Reports", 
          description: "View system-wide analytics",
          icon: BarChart3, 
          href: "/admin/reports",
          keywords: ["reports", "analytics", "data", "insights"]
        },
        { 
          id: "settings", 
          title: "System Settings", 
          description: "Configure platform settings",
          icon: Settings, 
          href: "/admin/settings",
          keywords: ["settings", "system", "config", "admin"]
        },
      ],
      academy: [
        { 
          id: "courses", 
          title: "Browse Courses", 
          description: "Explore available learning courses",
          icon: FileText, 
          href: "/academy/courses",
          keywords: ["courses", "learning", "education", "training"]
        },
        { 
          id: "progress", 
          title: "My Progress", 
          description: "Track your learning progress",
          icon: BarChart3, 
          href: "/academy/progress",
          keywords: ["progress", "achievements", "completion", "stats"]
        },
      ]
    };

    return actions[dashboardType] || actions.business;
  }, [dashboardType]);

  // Navigation items for current dashboard
  const navigationItems = useMemo(() => {
    const navItems = {
      business: [
        { title: "Dashboard", href: "/dashboard/business", icon: BarChart3 },
        { title: "Directory Profile", href: "/dashboard/business/profile", icon: Building2 },
        { title: "Job Scheduling", href: "/dashboard/business/schedule", icon: Calendar },
        { title: "Field Jobs", href: "/dashboard/business/jobs", icon: Zap },
        { title: "Customers", href: "/dashboard/business/customers", icon: Users },
        { title: "Analytics", href: "/dashboard/business/analytics", icon: BarChart3 },
        { title: "Settings", href: "/dashboard/business/settings", icon: Settings },
      ],
      user: [
        { title: "Dashboard", href: "/dashboard/user", icon: BarChart3 },
        { title: "Reviews", href: "/dashboard/user/reviews", icon: Star },
        { title: "Bookmarks", href: "/dashboard/user/bookmarks", icon: Star },
        { title: "Job Requests", href: "/dashboard/user/jobs", icon: Zap },
        { title: "Settings", href: "/dashboard/user/settings", icon: Settings },
      ],
      admin: [
        { title: "Dashboard", href: "/admin", icon: BarChart3 },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Reports", href: "/admin/reports", icon: BarChart3 },
        { title: "Settings", href: "/admin/settings", icon: Settings },
      ],
      academy: [
        { title: "Overview", href: "/academy", icon: BarChart3 },
        { title: "Courses", href: "/academy/courses", icon: FileText },
        { title: "Progress", href: "/academy/progress", icon: BarChart3 },
      ],
      localhub: [
        { title: "Hub Dashboard", href: "/dashboard/localhub", icon: Home },
        { title: "Directory Businesses", href: "/dashboard/localhub/businesses", icon: Building2 },
        { title: "Community Analytics", href: "/dashboard/localhub/analytics", icon: BarChart3 },
        { title: "Manage Directories", href: "/dashboard/localhub/directories", icon: MapPin },
        { title: "Hub Customization", href: "/dashboard/localhub/customization", icon: Settings },
        { title: "Domain Management", href: "/dashboard/localhub/domains", icon: Monitor },
        { title: "Create Directory", href: "/dashboard/localhub/create-directory", icon: Plus },
      ]
    };

    return navItems[dashboardType] || navItems.business;
  }, [dashboardType]);

  // Fuzzy search function
  const fuzzySearch = useCallback((items, query) => {
    if (!query) return items;
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return items.filter(item => {
      const searchableText = [
        item.title,
        item.description,
        ...(item.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    }).sort((a, b) => {
      // Prioritize title matches
      const aTitle = a.title.toLowerCase().includes(query.toLowerCase());
      const bTitle = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });
  }, []);

  // Filter results based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return {
        quickActions: dashboardQuickActions.slice(0, 3),
        navigation: navigationItems.slice(0, 5),
        recent: recentSearches.slice(0, 3)
      };
    }

    return {
      quickActions: fuzzySearch(dashboardQuickActions, searchQuery),
      navigation: fuzzySearch(navigationItems, searchQuery),
      recent: []
    };
  }, [searchQuery, dashboardQuickActions, navigationItems, recentSearches, fuzzySearch]);

  // Handle search selection
  const handleSelect = useCallback((item) => {
    const searchTime = performance.now() - startTime;
    
    // Log interaction
    logger.performance(`Search selection made in ${searchTime.toFixed(2)}ms`);
    logger.debug('Search event', {
      action: 'search_select',
      item: item.title || item.href,
      dashboardType,
      searchQuery,
      timestamp: Date.now(),
    });

    // Add to recent searches
    const newRecent = [
      { ...item, timestamp: Date.now() },
      ...recentSearches.filter(r => r.id !== item.id).slice(0, 4)
    ];
    setRecentSearches(newRecent);
    
    try {
      localStorage.setItem(`recent_searches_${dashboardType}`, JSON.stringify(newRecent));
    } catch (error) {
      logger.error('Failed to save recent search:', error);
    }

    // Navigate or call callback
    if (onSearchSelect) {
      onSearchSelect(item);
    } else if (item.href) {
      router.push(item.href);
    }

    // Close dialog
    setOpen(false);
    setSearchQuery("");
  }, [startTime, dashboardType, searchQuery, recentSearches, onSearchSelect, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  // Performance logging
  useEffect(() => {
    const renderTime = performance.now() - startTime;
    logger.performance(`AdvancedSearch rendered in ${renderTime.toFixed(2)}ms`);
  }, [startTime]);

  return (
    <>
      {/* Enhanced Search Trigger Button */}
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          className="relative w-full max-w-sm justify-start text-muted-foreground hover:text-foreground transition-all duration-200 border-border/50 hover:border-border hover:shadow-sm bg-background/50 hover:bg-background backdrop-blur-sm"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/30 transition-colors group-hover:bg-muted/60">
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">Search everything...</span>
              <div className="text-xs text-muted-foreground/60">Pages, actions, and features</div>
            </div>
            <div className="flex items-center space-x-1 opacity-60">
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                <Command className="h-3 w-3" />
              </kbd>
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                K
              </kbd>
            </div>
          </div>
        </Button>
      </div>

      {/* Enhanced Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Advanced Search</DialogTitle>
        <div className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <CommandInput 
              placeholder={`Search ${dashboardType} dashboard...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CommandList className="max-h-[420px] overflow-y-auto">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No results found</h3>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Try searching for pages, actions, or features. Use different keywords to refine your search.
              </p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          {searchResults.quickActions.length > 0 && (
            <CommandGroup heading="Quick Actions" className="px-2 pt-2">
              <div className="pb-2">
                <h4 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                  Quick Actions
                </h4>
              </div>
              {searchResults.quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <CommandItem
                    key={action.id}
                    value={action.title}
                    onSelect={() => handleSelect(action)}
                    className="flex items-center space-x-3 px-3 py-3 mx-1 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground leading-tight">{action.title}</div>
                      <div className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">{action.description}</div>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Navigation */}
          {searchResults.navigation.length > 0 && (
            <>
              {searchResults.quickActions.length > 0 && <CommandSeparator className="mx-2 my-2" />}
              <CommandGroup heading="Navigation" className="px-2">
                <div className="pb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                    Navigation
                  </h4>
                </div>
                {searchResults.navigation.map((nav, index) => {
                  const IconComponent = nav.icon;
                  return (
                    <CommandItem
                      key={index}
                      value={nav.title}
                      onSelect={() => handleSelect(nav)}
                      className="flex items-center space-x-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{nav.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {/* Recent Searches */}
          {searchResults.recent.length > 0 && (
            <>
              <CommandSeparator className="mx-2 my-2" />
              <CommandGroup heading="Recent" className="px-2">
                <div className="pb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                    Recent
                  </h4>
                </div>
                {searchResults.recent.map((recent, index) => {
                  const IconComponent = recent.icon || Clock;
                  return (
                    <CommandItem
                      key={index}
                      value={recent.title}
                      onSelect={() => handleSelect(recent)}
                      className="flex items-center space-x-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground flex-1">{recent.title}</span>
                      <Badge variant="outline" className="text-xs bg-muted/50 border-border/50">
                        Recent
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {/* Search Tips */}
          {!searchQuery && (
            <>
              <CommandSeparator className="mx-2 my-2" />
              <div className="px-4 py-4">
                <div className="text-xs text-muted-foreground">
                  <div className="font-semibold text-muted-foreground/90 mb-3 uppercase tracking-wider">Search Tips</div>
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <kbd className="text-[10px] bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded font-mono">Cmd+K</kbd>
                      <span>Open search anywhere</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                      <span>Type to search across all features</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                      <span>Recent searches are saved locally</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                      <span>Use arrow keys to navigate results</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
