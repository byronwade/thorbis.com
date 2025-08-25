"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  MoreHorizontal,
  ChevronDown,
  Home,
  Building2,
  Wrench,
  Utensils,
  Users,
  Bell,
  HelpCircle,
  Command
} from "lucide-react";
import { BUSINESS_MODULES, INDUSTRY_PRESETS } from "@config/navigation/industry-presets";
import { cn } from "@lib/utils";
import SmartActionSuggestions from "./SmartActionSuggestions";
import SmartNotificationCenter from "./SmartNotificationCenter";
import ContextualCommandPalette from "./ContextualCommandPalette";

/**
 * Enhanced Business Header Component
 * ServiceTitan-style navigation with industry-specific and shared modules
 * Features sub-headers that act as page-specific toolbars
 */
export default function EnhancedBusinessHeader({ 
  userId = "user_1",
  userRole = "OWNER", 
  businessId = "business_1",
  className = "",
  onSearch,
  onNotificationClick,
  onHelpClick
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Determine current industry and page context
  useEffect(() => {
    if (pathname.includes('/field-management')) {
      setActiveIndustry('field-service');
    } else if (pathname.includes('/restaurants')) {
      setActiveIndustry('restaurant');
    } else {
      setActiveIndustry(null);
    }
  }, [pathname]);

  // Get current page context for sub-header
  const getCurrentPageContext = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Find matching module
    const moduleId = Object.keys(BUSINESS_MODULES).find(id => 
      pathname.includes(`/${id}`) || pathname.includes(`/${id}/`)
    );
    
    return {
      module: moduleId ? BUSINESS_MODULES[moduleId] : null,
      isShared: pathname.includes('/shared/'),
      isIndustrySpecific: pathname.includes('/field-management/') || pathname.includes('/restaurants/'),
      currentPage: lastSegment,
      breadcrumbs: pathSegments
    };
  };

  const pageContext = getCurrentPageContext();

  // Get navigation items based on current context
  const getNavigationItems = () => {
    const items = [];
    
    // Always show dashboard
    items.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard/business',
      isActive: pathname === '/dashboard/business'
    });

    // Industry-specific modules
    if (activeIndustry) {
      const preset = INDUSTRY_PRESETS[activeIndustry];
      if (preset) {
        preset.modules.forEach(moduleId => {
          const module = BUSINESS_MODULES[moduleId];
          if (module && moduleId !== 'dashboard') {
            const href = module.href.replace('/dashboard/business', preset.basePath);
            items.push({
              id: moduleId,
              label: module.label,
              icon: module.icon,
              href,
              isActive: pathname.startsWith(href),
              subnav: module.subnav?.map(item => ({
                ...item,
                href: item.href.replace('/dashboard/business', preset.basePath)
              }))
            });
          }
        });
      }
    }

    return items;
  };

  // Get shared modules
  const getSharedModules = () => {
    const sharedModuleIds = ['inventory', 'employees', 'marketing', 'accounting', 'analytics', 'automation', 'settings'];
    return sharedModuleIds.map(moduleId => {
      const module = BUSINESS_MODULES[moduleId];
      return module ? {
        id: moduleId,
        label: module.label,
        icon: module.icon,
        href: module.href,
        isActive: pathname.startsWith(module.href),
        subnav: module.subnav
      } : null;
    }).filter(Boolean);
  };

  const navigationItems = getNavigationItems();
  const sharedModules = getSharedModules();

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("w-full bg-background border-b border-border", className)}>
      {/* Main Header */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Logo & Industry Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">BusinessOS</span>
          </div>
          
          {/* Industry Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                {activeIndustry === 'field-service' && <Wrench className="h-4 w-4" />}
                {activeIndustry === 'restaurant' && <Utensils className="h-4 w-4" />}
                {!activeIndustry && <Building2 className="h-4 w-4" />}
                <span>
                  {activeIndustry === 'field-service' && 'Field Service'}
                  {activeIndustry === 'restaurant' && 'Restaurant'}
                  {!activeIndustry && 'Select Industry'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Industry</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/business/field-management')}>
                <Wrench className="h-4 w-4 mr-2" />
                Field Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/business/restaurants')}>
                <Utensils className="h-4 w-4 mr-2" />
                Restaurant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/business')}>
                <Home className="h-4 w-4 mr-2" />
                General Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anything... (⌘K)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
              onFocus={() => setShowCommandPalette(true)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2"
              onClick={() => setShowCommandPalette(true)}
            >
              <Command className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-2">
          <SmartActionSuggestions 
            userId={userId}
            userRole={userRole}
            businessId={businessId}
            currentModule={pageContext.module}
          />
          <SmartNotificationCenter 
            userId={userId}
            businessId={businessId}
          />
          <Button variant="ghost" size="sm" onClick={onHelpClick}>
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/shared/profile')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/shared/settings')}>
                Business Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="flex items-center px-6 py-2 space-x-1 overflow-x-auto">
          {/* Industry-Specific Navigation */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center">
                {item.subnav ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={item.isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="flex items-center space-x-2 whitespace-nowrap"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => router.push(item.href)}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label} Overview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {item.subnav.map((subItem) => (
                        <DropdownMenuItem 
                          key={subItem.href} 
                          onClick={() => router.push(subItem.href)}
                        >
                          {subItem.text}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )}
              </div>
            );
          })}

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Shared Modules Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>More Tools</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Shared Modules</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-2 gap-1 p-1">
                {sharedModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <DropdownMenuItem 
                      key={module.id}
                      onClick={() => router.push(module.href)}
                      className="flex items-center space-x-2 p-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{module.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sub-Header Toolbar */}
      {pageContext.module && (
        <SubHeaderToolbar 
          module={pageContext.module}
          currentPage={pageContext.currentPage}
          isShared={pageContext.isShared}
          breadcrumbs={pageContext.breadcrumbs}
          pathname={pathname}
        />
      )}

      {/* Contextual Command Palette */}
      <ContextualCommandPalette 
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        userId={userId}
        businessId={businessId}
        currentModule={pageContext.module}
      />
    </div>
  );
}

/**
 * Sub-Header Toolbar Component
 * Page-specific toolbar with actions and breadcrumbs
 */
function SubHeaderToolbar({ module, currentPage, isShared, breadcrumbs, pathname }) {
  const router = useRouter();
  const Icon = module.icon;

  // Get page-specific actions based on module and current page
  const getPageActions = () => {
    const actions = [];

    // Common actions for most pages
    if (currentPage !== 'page' && currentPage !== 'dashboard') {
      actions.push({
        label: 'Filter',
        icon: Filter,
        variant: 'outline',
        onClick: () => console.log('Filter clicked')
      });

      actions.push({
        label: 'Export',
        icon: Download,
        variant: 'outline',
        onClick: () => console.log('Export clicked')
      });
    }

    // Module-specific actions
    switch (module.id) {
      case 'schedule':
        actions.unshift({
          label: 'New Job',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname.split('/').slice(0, -1).join('/')}/new-job`)
        });
        break;
      
      case 'customers':
        actions.unshift({
          label: 'Add Customer',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname}/create`)
        });
        break;
      
      case 'estimates':
        actions.unshift({
          label: 'Create Estimate',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname}/create`)
        });
        break;
      
      case 'invoices':
        actions.unshift({
          label: 'Create Invoice',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname}/create`)
        });
        break;
      
      case 'inventory':
        actions.unshift({
          label: 'Add Item',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname}/create`)
        });
        actions.push({
          label: 'Import',
          icon: Upload,
          variant: 'outline',
          onClick: () => console.log('Import clicked')
        });
        break;
      
      case 'employees':
        actions.unshift({
          label: 'Add Employee',
          icon: Plus,
          variant: 'default',
          onClick: () => router.push(`${pathname}/create`)
        });
        break;
    }

    return actions;
  };

  const actions = getPageActions();

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const crumbs = [];
    
    // Add home
    crumbs.push({ label: 'Dashboard', href: '/dashboard/business' });
    
    // Add industry if applicable
    if (breadcrumbs.includes('field-management')) {
      crumbs.push({ label: 'Field Service', href: '/dashboard/business/field-management' });
    } else if (breadcrumbs.includes('restaurants')) {
      crumbs.push({ label: 'Restaurant', href: '/dashboard/business/restaurants' });
    } else if (isShared) {
      crumbs.push({ label: 'Shared Tools', href: '/dashboard/shared' });
    }
    
    // Add module
    crumbs.push({ label: module.label, href: module.href });
    
    // Add current page if not the main module page
    if (currentPage !== 'page' && currentPage !== module.id) {
      const pageLabel = currentPage.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      crumbs.push({ label: pageLabel, href: pathname });
    }
    
    return crumbs;
  };

  const breadcrumbs_items = generateBreadcrumbs();

  return (
    <div className="border-t border-border bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Breadcrumbs & Page Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs_items.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <span>/</span>}
                  {index === breadcrumbs_items.length - 1 ? (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => router.push(crumb.href)}
                    >
                      {crumb.label}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Page Actions */}
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className="flex items-center space-x-2"
              >
                <ActionIcon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            );
          })}
          
          {actions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Page Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
