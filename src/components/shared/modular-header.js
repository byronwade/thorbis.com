"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup 
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Input } from "@components/ui/input";
import {
  Bell, Search, Menu, User, LogOut, Settings, Star,
  Plus, ChevronDown, Crown, Building2, Briefcase,
  HelpCircle, ShoppingCart, ArrowUpCircle, Clock
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@context/auth-context";
import { useHeaderPrefs } from "@hooks/use-header-prefs";
import EnhancedMobileMenu from "./enhanced-mobile-menu";
import ClientOnlyWrapper from "./client-only-wrapper";

/**
 * Modular Header Component with Industry Presets and Progressive Disclosure
 * Features: Industry-specific navigation, role-based permissions, usage-based ordering
 */
export default function ModularHeader({ 
  dashboardType = "business",
  industryOverride,
  showCompanySelector = true,
  showSearch = false,
  backHref = "/",
  customTitle,
  customSubtitle
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { 
    user, 
    logout, 
    getDisplayName, 
    getAvatarUrl 
  } = useAuth();

  // Use the new modular header preferences system
  const {
    currentPreset,
    layoutConfig,
    modulesByCategory,
    suggestedModules,
    upgradePromptModules,
    availablePresets,
    preferences,
    isNewUser,
    userRole,
    subscriptionPlan,
    switchPreset,
    togglePinModule,
    toggleHideModule,
    recordModuleUsage,
    canAccessModule,
    dismissNewUserState
  } = useHeaderPrefs({
    dashboardType,
    industryOverride,
    enablePersistence: true
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get current active module based on pathname
  const getCurrentActiveModule = () => {
    const currentPath = pathname;
    const allModules = [...layoutConfig.topNav, ...layoutConfig.moreMenu];
    
    return allModules.find(module => {
      if (currentPath === module.href) return true;
      if (currentPath.startsWith(module.href + '/')) return true;
      return false;
    });
  };

  const activeModule = getCurrentActiveModule();

  // Get sub-navigation for current module
  const currentSubNav = activeModule?.subItems || [];

  // Handle navigation click - record usage
  const handleNavigationClick = (moduleId) => {
    recordModuleUsage(moduleId);
  };

  // Search functionality
  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  // Mock company data (should come from context in real app)
  const mockCompanies = [
    {
      id: "1",
      name: "Wade's Plumbing & Septic",
      industry: "field-service",
      subscription: "Pro"
    },
    {
      id: "2", 
      name: "Downtown Coffee Co.",
      industry: "restaurant",
      subscription: "Basic"
    }
  ];

  // Industry Preset Selector Component
  const IndustryPresetSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Crown className="w-3 h-3 mr-1" />
          {currentPreset.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 z-[10001]">
        <DropdownMenuLabel>Industry Templates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availablePresets.map((preset) => (
          <DropdownMenuItem 
            key={preset.id}
            onClick={() => switchPreset(preset.id)}
            className={currentPreset.id === preset.id ? "bg-muted" : ""}
          >
            <div className="flex-1">
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-muted-foreground">{preset.description}</div>
            </div>
            {currentPreset.id === preset.id && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // New User Onboarding Banner
  const NewUserBanner = () => {
    if (!isNewUser) return null;
    
    return (
      <div className="bg-primary/10 border-b border-primary/20 p-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Welcome to your {currentPreset.name}!</p>
              <p className="text-xs text-muted-foreground">
                Start with {suggestedModules.map(m => m.title).join(', ')}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={dismissNewUserState} variant="outline">
            Got it
          </Button>
        </div>
      </div>
    );
  };

  // Auth Header (Login/Signup pages)
  if (dashboardType === "auth") {
    return (
      <header className="sticky top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/logos/ThorbisLogo.webp" 
                alt="Thorbis"
                width={32} 
                height={32} 
                className="w-8 h-8" 
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold">
                  {customTitle || "Thorbis"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {customSubtitle || "Authentication"}
                </p>
              </div>
            </Link>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Theme
          </Button>
        </div>
      </header>
    );
  }

  return (
    <>
      <NewUserBanner />
      
      <div className="sticky top-0 z-[60] bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Main Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left Section - Logo & Company */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <Image 
                src="/logos/ThorbisLogo.webp" 
                alt={currentPreset.headerTitle}
                width={32} 
                height={32} 
                className="w-8 h-8 group-hover:scale-105 transition-transform" 
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold">
                  {customTitle || currentPreset.headerTitle}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {customSubtitle || currentPreset.headerSubtitle}
                </p>
              </div>
            </Link>

            {/* Company Selector */}
            {showCompanySelector && dashboardType === "business" && (
              <div className="hidden lg:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">Wade's Plumbing</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 z-[10001]">
                    <DropdownMenuLabel>Your Companies</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockCompanies.map((company) => (
                      <DropdownMenuItem key={company.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.subscription} Plan</div>
                        </div>
                        <Badge variant="outline">{company.industry}</Badge>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/add-a-business" className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Business
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Center - Main Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center">
            {layoutConfig.topNav.slice(0, 6).map((module) => {
              const isActive = activeModule?.id === module.id;
              const IconComponent = module.icon;
              
              return (
                <Link 
                  key={module.id} 
                  href={module.href}
                  onClick={() => handleNavigationClick(module.id)}
                >
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className={`px-3 py-2 ${
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {module.title}
                    {module.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* More Menu */}
            {layoutConfig.moreMenu.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    More
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 z-[10001]">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(modulesByCategory).map(([category, modules]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {category}
                          </h4>
                          <div className="space-y-1">
                            {modules.slice(0, 4).map((module) => {
                              const IconComponent = module.icon;
                              const isPinned = preferences.pinnedModules.includes(module.id);
                              
                              return (
                                <div key={module.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group">
                                  <Link 
                                    href={module.href}
                                    className="flex items-center space-x-2 flex-1"
                                    onClick={() => handleNavigationClick(module.id)}
                                  >
                                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{module.title}</span>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      togglePinModule(module.id);
                                    }}
                                  >
                                    <Star className={`w-3 h-3 ${isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Upgrade Prompts */}
                  {upgradePromptModules.length > 0 && (
                    <div className="border-t p-4 bg-muted/30">
                      <h4 className="text-xs font-semibold mb-2">Upgrade to access:</h4>
                      <div className="flex flex-wrap gap-2">
                        {upgradePromptModules.map((module) => (
                          <Badge key={module.id} variant="outline" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            {module.title}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full mt-2" asChild>
                        <Link href="/pricing">
                          <ArrowUpCircle className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Link>
                      </Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Center - Search (when nav is collapsed) */}
          {showSearch && (
            <div className="hidden lg:flex xl:hidden flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Right Section - Controls and User Menu */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Search Button */}
            {!showSearch && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 z-[10001]">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <Badge variant="secondary">3 new</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">New customer inquiry</p>
                      <p className="text-xs text-muted-foreground">John D. - Plumbing service request</p>
                      <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                    <AvatarFallback>
                      {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 z-[10001]" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{userRole}</Badge>
                      <Badge variant="secondary" className="text-xs">{subscriptionPlan}</Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Time Tracking */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Time Tracking</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4 text-green-500" />
                    <span>Clock In</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                {/* Account */}
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                {/* Industry Preset Selector */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Dashboard Type</DropdownMenuLabel>
                  <IndustryPresetSelector />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <ClientOnlyWrapper>
              <Button
                variant="ghost"
                size="sm"
                className="xl:hidden h-8 w-8 p-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <EnhancedMobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                dashboardType={dashboardType}
                navigationItems={layoutConfig.topNav.concat(layoutConfig.moreMenu).map(module => ({
                  key: module.id,
                  text: module.title,
                  href: module.href,
                  icon: module.icon
                }))}
                activeNavKey={activeModule?.id || ""}
                config={{
                  title: currentPreset.headerTitle,
                  subtitle: currentPreset.headerSubtitle
                }}
                businessSubNavItems={{
                  [activeModule?.id || ""]: currentSubNav
                }}
              />
            </ClientOnlyWrapper>
          </div>
        </div>

        {/* Sub Navigation */}
        {currentSubNav.length > 0 && (
          <div className="border-t bg-muted/30">
            <div className="px-4 lg:px-6 py-2">
              <nav className="flex space-x-1 overflow-x-auto">
                {currentSubNav.map((subItem, index) => {
                  const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                  
                  return (
                    <Link
                      key={index}
                      href={subItem.href}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
}