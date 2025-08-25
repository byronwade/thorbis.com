/**
 * Smart Business Navigation Component
 * Adaptive navigation system with intelligent recommendations and customization
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import {
  ChevronDown,
  Grid3X3,
  Search,
  Pin,
  PinOff,
  Settings,
  TrendingUp,
  Clock,
  Star,
  Eye,
  EyeOff,
  MoreHorizontal,
  Command,
  Zap,
  BookOpen,
  ArrowRight,
  BarChart3,
  Wrench,
  Calculator,
  Package,
  Users,
  MessageSquare,
  Inbox,
  Calendar,
  FileText,
  MapPin,
  Truck,
  Store,
  Utensils,
  Receipt,
  DollarSign,
  Home,
  Briefcase,
  Book,
  Building2,
  Crown,
  AlertTriangle,
  Check,
  Plus
} from "lucide-react";

import { SmartNavigationResolver, NavigationUtils } from "../../lib/navigation/resolver.js";
import { BUSINESS_MODULES } from "../../config/navigation/industry-presets.js";

/**
 * Main Smart Navigation Component
 */
export default function SmartBusinessNavigation({
  userId = "user_1",
  userRole = "OWNER",
  businessId = "business_1",
  businessType = "field-service", // Add business type parameter
  className = "",
  maxHeaderItems = 7,
  showAppLauncher = true,
  showCustomization = true,
  enhanced = false, // New enhanced mode flag
  onModuleAccess = null
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Navigation resolver
  const resolver = useMemo(() => new SmartNavigationResolver(businessId), [businessId]);
  
  // State
  const [navigation, setNavigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debug logging will be moved after filteredAppLauncherModules is defined

  // Load navigation on mount and when dependencies change
  useEffect(() => {
    loadNavigation();
  }, [userId, userRole, businessId, maxHeaderItems]);

  const loadNavigation = useCallback(async () => {
    try {
      setLoading(true);
      const resolved = resolver.resolveNavigation(userId, userRole, {
        maxHeaderItems,
        includeUsageStats: true,
        includeSubNav: true
      });
      setNavigation(resolved);
    } catch (error) {
      console.error("Failed to load navigation:", error);
      // Provide fallback navigation
      setNavigation({
        header: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: BarChart3,
            href: "/dashboard/business",
            category: "Core",
            description: "Business overview and metrics",
            isPinned: true,
            reason: "core-module"
          },
          {
            id: "customers",
            label: "Customers",
            icon: Users,
            href: "/dashboard/business/customers",
            category: "Core",
            description: "Manage customer information",
            isPinned: false,
            reason: "industry-default"
          },
          {
            id: "schedule",
            label: "Schedule",
            icon: Calendar,
            href: "/dashboard/business/schedule",
            category: "Core",
            description: "Job scheduling and calendar",
            isPinned: false,
            reason: "industry-default"
          }
        ],
        appLauncher: {
          "Core": [
            {
              id: "invoices",
              label: "Invoices",
              icon: FileText,
              href: "/dashboard/business/invoices",
              category: "Core",
              description: "Create and manage invoices"
            },
            {
              id: "estimates",
              label: "Estimates",
              icon: Calculator,
              href: "/dashboard/business/estimates",
              category: "Core",
              description: "Create quotes and estimates"
            }
          ]
        },
        config: {
          industryPreset: "field-service",
          userRole,
          canManageNavigation: true,
          smartRecommendations: true
        },
        stats: {
          totalModules: 5,
          headerItems: 3,
          appLauncherItems: 2
        }
      });
    } finally {
      setLoading(false);
    }
  }, [resolver, userId, userRole, maxHeaderItems]);

  // Track module access when route changes
  useEffect(() => {
    if (pathname && navigation) {
      // Find module that matches current path
      const currentModule = [...navigation.header, ...Object.values(navigation.appLauncher).flat()]
        .find(module => pathname.startsWith(module.href));
      
      if (currentModule) {
        resolver.trackModuleAccess(currentModule.id, userId);
        if (onModuleAccess) {
          onModuleAccess(currentModule.id, currentModule.label);
        }
      }
    }
  }, [pathname, navigation, resolver, userId, onModuleAccess]);

  // Get active module
  const activeModule = useMemo(() => {
    if (!navigation || !pathname) return null;
    
    return [...navigation.header, ...Object.values(navigation.appLauncher).flat()]
      .find(module => pathname.startsWith(module.href));
  }, [pathname, navigation]);

  // Handle module pin/unpin
  const handleTogglePin = useCallback(async (moduleId, currentlyPinned) => {
    try {
      await resolver.toggleModulePin(userRole, moduleId, !currentlyPinned);
      await loadNavigation(); // Reload navigation
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  }, [resolver, userRole, loadNavigation]);

  // Filter modules for search in app launcher
  const filteredAppLauncherModules = useMemo(() => {
    if (!navigation || !searchQuery) return navigation?.appLauncher || {};
    
    const filtered = {};
    Object.entries(navigation.appLauncher).forEach(([category, modules]) => {
      const matchingModules = modules.filter(module =>
        module.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingModules.length > 0) {
        filtered[category] = matchingModules;
      }
    });
    
    return filtered;
  }, [navigation, searchQuery]);



  if (loading || !navigation) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-8 w-28 bg-muted animate-pulse rounded" />
        {showAppLauncher && (
          <Button variant="ghost" size="sm" className="px-2.5 py-1.5 text-sm font-medium text-white hover:text-primary/90 hover:bg-primary/20 transition-all duration-200">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Apps
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        )}
        {showCustomization && (
          <Button variant="ghost" size="sm" className="px-2.5 py-1.5 text-sm font-medium text-white hover:text-primary/90 hover:bg-primary/20 transition-all duration-200">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center space-x-1 min-w-0 w-full ${className}`}>

      </div>
    </TooltipProvider>
  );
}

/**
 * Individual Navigation Item Component
 */
function NavigationItem({ module, isActive, showPinning, onTogglePin }) {
  const Icon = module.icon;
  
  return (
    <div className="relative group flex-shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={module.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2.5 py-1.5 text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                isActive
                  ? "bg-primary/20 text-primary/90 shadow-sm"
                  : "text-white hover:text-primary/90 hover:bg-primary/20"
              }`}
            >
              <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{module.label}</span>
              
              {/* Usage indicator */}
              {module.usage && module.usage.recentAccesses > 5 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
              
              {/* Pin indicator for explicitly pinned items */}
              {module.isPinned && module.reason === 'pinned' && (
                <Pin className="w-3 h-3 ml-1 opacity-60" />
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs z-[90]">
          <div className="text-sm">
            <div className="font-medium">{module.label}</div>
            <div className="text-muted-foreground text-xs mt-1">{module.description}</div>
            {module.usage && (
              <div className="text-xs mt-2 space-y-1">
                <div>Recent accesses: {module.usage.recentAccesses}</div>
                <div>Last used: {new Date(module.usage.lastAccessed).toLocaleDateString()}</div>
              </div>
            )}
            {module.reason === 'frequently-used' && (
              <Badge variant="secondary" className="text-xs mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Frequently Used
              </Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Pin/Unpin button for customizable navigation */}
      {showPinning && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border hover:bg-muted"
          onClick={() => onTogglePin(module.id, module.isPinned)}
        >
          {module.isPinned ? (
            <PinOff className="w-3 h-3" />
          ) : (
            <Pin className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * App Launcher Component
 */
function AppLauncher({ modules, searchQuery, onSearchChange, isOpen, onOpenChange, navigation }) {
  const totalModules = Object.values(modules).reduce((sum, categoryModules) => sum + categoryModules.length, 0);
  


  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5 py-1.5 text-sm font-medium text-white hover:text-primary/90 hover:bg-primary/20 transition-all duration-200"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Apps
              {totalModules > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalModules}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[90]">
            <div className="text-sm">
              <div className="font-medium">App Launcher</div>
              <div className="text-muted-foreground text-xs">Access all business modules</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 max-h-[70vh] overflow-y-auto z-[100]" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Business Apps
          </span>
          <Badge variant="secondary" className="text-xs">{totalModules}</Badge>
        </DropdownMenuLabel>
        
        {/* Search */}
        <div className="relative px-3 py-2">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        
        <DropdownMenuSeparator />

        {/* Module Categories */}
        {Object.keys(modules).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-3">
            <Search className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 
                "Try adjusting your search terms" : 
                "All modules are currently in your header navigation"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(modules).map(([category, categoryModules]) => (
              <DropdownMenuGroup key={category}>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-1">
                  {category}
                </DropdownMenuLabel>
                {categoryModules.map((module) => (
                  <DropdownMenuItem
                    key={module.id}
                    asChild
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => onOpenChange(false)}
                  >
                    <Link href={module.href}>
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                          <module.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{module.label}</div>
                          <div className="text-xs text-muted-foreground">{module.description}</div>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Module Category Component
 */
function ModuleCategory({ category, modules, onModuleClick }) {
  const categoryIcons = {
    "Core": BarChart3,
    "Field Operations": Wrench,
    "Sales & Service": TrendingUp,
    "Finance": Calculator,
    "Operations": Package,
    "Human Resources": Users,
    "Communication": MessageSquare,
    "Growth": Star,
    "Admin": Settings
  };

  const CategoryIcon = categoryIcons[category] || Grid3X3;

  return (
    <div>
      <div className="flex items-center mb-4">
        <CategoryIcon className="w-4 h-4 mr-2 text-primary" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          {category}
        </h3>
        <div className="flex-1 h-px bg-border ml-4" />
        <Badge variant="secondary" className="text-xs">
          {modules.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} onClick={onModuleClick} />
        ))}
      </div>
    </div>
  );
}

/**
 * Module Card Component
 */
function ModuleCard({ module, onClick }) {
  const Icon = module.icon;
  
  return (
    <Link href={module.href} onClick={onClick}>
      <div className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
              {module.label}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {module.description}
            </p>
            
            {/* Usage stats */}
            {module.usage && (
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {module.usage.recentAccesses} recent uses
              </div>
            )}
          </div>
          
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Navigation Customization Component
 */
function NavigationCustomization({ navigation, resolver, userRole, onUpdate, isOpen, onOpenChange }) {
  const [saving, setSaving] = useState(false);

  const handleTogglePin = async (moduleId, currentlyPinned) => {
    try {
      setSaving(true);
      await resolver.toggleModulePin(userRole, moduleId, !currentlyPinned);
      await onUpdate();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5 py-1.5 text-sm font-medium text-white hover:text-primary/90 hover:bg-primary/20 transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[90]">
            <div className="text-sm">
              <div className="font-medium">Customize Navigation</div>
              <div className="text-muted-foreground text-xs">Pin your favorite modules</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96 max-h-[70vh] overflow-y-auto z-[100]" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Customize Navigation
          </span>
          <Badge variant="secondary" className="text-xs">{navigation.header.length}/7</Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Pinned Header Items */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-1 flex items-center">
            <Pin className="w-3 h-3 mr-1" />
            Pinned to Header
          </DropdownMenuLabel>
          {navigation.header.map((module) => (
            <DropdownMenuItem
              key={module.id}
              className="px-3 py-2 cursor-pointer"
              onClick={() => handleTogglePin(module.id, true)}
              disabled={saving}
            >
              <div className="flex items-center w-full">
                <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center mr-2">
                  <module.icon className="w-3 h-3 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{module.label}</div>
                  <div className="text-xs text-muted-foreground">{module.description}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={saving}
                >
                  <PinOff className="w-3 h-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Available Modules by Category */}
        {Object.entries(navigation.appLauncher).map(([category, modules]) => (
          <DropdownMenuGroup key={category}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-1 flex items-center">
              <Grid3X3 className="w-3 h-3 mr-1" />
              {category} ({modules.length})
            </DropdownMenuLabel>
            {modules.map((module) => (
              <DropdownMenuItem
                key={module.id}
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleTogglePin(module.id, false)}
                disabled={saving}
              >
                <div className="flex items-center w-full">
                  <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center mr-2">
                    <module.icon className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{module.label}</div>
                    <div className="text-xs text-muted-foreground">{module.description}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    disabled={saving}
                  >
                    <Pin className="w-3 h-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


