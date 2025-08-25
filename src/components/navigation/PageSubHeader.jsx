"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import {
  Plus,
  Filter,
  Download,
  Upload,
  Search,
  Settings,
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  Package,
  Wrench,
  Calculator,
  MessageSquare,
  BarChart3,
  Clock,
  MapPin,
  Truck,
  Home,
  Building2,
  Store,
  Utensils,
  Edit,
  Trash2,
  Copy,
  Share,
  Print,
  RefreshCw,
  Eye,
  Save,
  Send,
  Archive,
  Star,
  Flag,
  Tag,
  Bookmark,
  HelpCircle
} from "lucide-react";
import { BUSINESS_MODULES } from "@config/navigation/industry-presets";
import { cn } from "@lib/utils";

/**
 * Page Sub-Header Component
 * ServiceTitan-style sub-header that acts as a page-specific toolbar
 * Provides breadcrumbs, page actions, and contextual tools
 */
export default function PageSubHeader({ 
  className = "",
  showBreadcrumbs = true,
  showSearch = false,
  customActions = [],
  onSearch,
  onActionClick
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageContext, setPageContext] = useState(null);

  // Analyze current page context
  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const context = analyzePageContext(pathSegments, pathname);
    setPageContext(context);
  }, [pathname]);

  const analyzePageContext = (segments, fullPath) => {
    // Determine if we're in shared or industry-specific area
    const isShared = fullPath.includes('/shared/');
    const isFieldManagement = fullPath.includes('/field-management/');
    const isRestaurant = fullPath.includes('/restaurants/');
    
    // Find the module
    const moduleId = Object.keys(BUSINESS_MODULES).find(id => 
      fullPath.includes(`/${id}`) || fullPath.includes(`/${id}/`)
    );
    
    const module = moduleId ? BUSINESS_MODULES[moduleId] : null;
    
    // Determine current page/action
    const lastSegment = segments[segments.length - 1];
    const secondLastSegment = segments[segments.length - 2];
    
    return {
      module,
      moduleId,
      isShared,
      isFieldManagement,
      isRestaurant,
      currentPage: lastSegment,
      parentPage: secondLastSegment,
      segments,
      fullPath,
      breadcrumbs: generateBreadcrumbs(segments, isShared, isFieldManagement, isRestaurant, module)
    };
  };

  const generateBreadcrumbs = (segments, isShared, isFieldManagement, isRestaurant, module) => {
    const crumbs = [];
    
    // Home
    crumbs.push({ 
      label: 'Dashboard', 
      href: '/dashboard/business',
      icon: Home
    });
    
    // Industry/Area
    if (isFieldManagement) {
      crumbs.push({ 
        label: 'Field Service', 
        href: '/dashboard/business/field-management',
        icon: Wrench
      });
    } else if (isRestaurant) {
      crumbs.push({ 
        label: 'Restaurant', 
        href: '/dashboard/business/restaurants',
        icon: Utensils
      });
    } else if (isShared) {
      crumbs.push({ 
        label: 'Shared Tools', 
        href: '/dashboard/shared',
        icon: Settings
      });
    }
    
    // Module
    if (module) {
      crumbs.push({ 
        label: module.label, 
        href: module.href,
        icon: module.icon
      });
    }
    
    // Sub-pages
    if (segments.length > 4) { // More than dashboard/business/area/module
      const subPages = segments.slice(4);
      let currentPath = module?.href || '';
      
      subPages.forEach((segment, index) => {
        if (segment !== 'page') {
          currentPath += `/${segment}`;
          const label = segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          crumbs.push({
            label,
            href: currentPath,
            isLast: index === subPages.length - 1
          });
        }
      });
    }
    
    return crumbs;
  };

  // Get page-specific actions
  const getPageActions = () => {
    if (!pageContext) return [];
    
    const actions = [...customActions];
    const { moduleId, currentPage, isShared } = pageContext;
    
    // Common actions for list/index pages
    if (currentPage === 'page' || currentPage === moduleId) {
      // Main module page actions
      switch (moduleId) {
        case 'schedule':
          actions.unshift(
            { 
              label: 'New Job', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/new-job`
            }
          );
          break;
        
        case 'customers':
          actions.unshift(
            { 
              label: 'Add Customer', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
        
        case 'estimates':
          actions.unshift(
            { 
              label: 'Create Estimate', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
        
        case 'invoices':
          actions.unshift(
            { 
              label: 'Create Invoice', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
        
        case 'inventory':
          actions.unshift(
            { 
              label: 'Add Item', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          actions.push(
            { 
              label: 'Import', 
              icon: Upload, 
              variant: 'outline',
              onClick: () => onActionClick?.('import')
            }
          );
          break;
        
        case 'employees':
          actions.unshift(
            { 
              label: 'Add Employee', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
        
        // Restaurant specific
        case 'menu':
          actions.unshift(
            { 
              label: 'Add Item', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
        
        case 'reservations':
          actions.unshift(
            { 
              label: 'New Reservation', 
              icon: Plus, 
              variant: 'default',
              href: `${pageContext.fullPath}/create`
            }
          );
          break;
      }
    }
    
    // List page actions
    if (currentPage === 'list' || pathname.includes('/list')) {
      actions.push(
        { 
          label: 'Filter', 
          icon: Filter, 
          variant: 'outline',
          onClick: () => onActionClick?.('filter')
        },
        { 
          label: 'Export', 
          icon: Download, 
          variant: 'outline',
          onClick: () => onActionClick?.('export')
        }
      );
    }
    
    // Create/Edit page actions
    if (currentPage === 'create' || currentPage === 'edit') {
      actions.push(
        { 
          label: 'Save Draft', 
          icon: Save, 
          variant: 'outline',
          onClick: () => onActionClick?.('save-draft')
        },
        { 
          label: 'Save & Send', 
          icon: Send, 
          variant: 'default',
          onClick: () => onActionClick?.('save-send')
        }
      );
    }
    
    // Detail/View page actions
    if (currentPage !== 'page' && currentPage !== 'list' && currentPage !== 'create' && currentPage !== 'edit') {
      actions.push(
        { 
          label: 'Edit', 
          icon: Edit, 
          variant: 'outline',
          href: `${pageContext.fullPath}/edit`
        },
        { 
          label: 'Share', 
          icon: Share, 
          variant: 'outline',
          onClick: () => onActionClick?.('share')
        }
      );
    }
    
    return actions;
  };

  const actions = getPageActions();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  if (!pageContext) return null;

  return (
    <div className={cn("border-b border-border bg-background", className)}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Breadcrumbs & Page Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {showBreadcrumbs && pageContext.breadcrumbs && (
            <Breadcrumb>
              <BreadcrumbList>
                {pageContext.breadcrumbs.map((crumb, index) => {
                  const Icon = crumb.icon;
                  const isLast = index === pageContext.breadcrumbs.length - 1;
                  
                  return (
                    <React.Fragment key={crumb.href || index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="flex items-center space-x-1">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{crumb.label}</span>
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            href={crumb.href}
                            className="flex items-center space-x-1 hover:text-foreground"
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{crumb.label}</span>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          
          {/* Page Status/Info */}
          <div className="flex items-center space-x-2">
            {pageContext.isShared && (
              <Badge variant="secondary" className="text-xs">
                Shared Tool
              </Badge>
            )}
            {pageContext.isFieldManagement && (
              <Badge variant="outline" className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                Field Service
              </Badge>
            )}
            {pageContext.isRestaurant && (
              <Badge variant="outline" className="text-xs">
                <Utensils className="h-3 w-3 mr-1" />
                Restaurant
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section - Search (if enabled) */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search this page..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Right Section - Page Actions */}
        <div className="flex items-center space-x-2">
          {actions.slice(0, 4).map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            );
          })}
          
          {actions.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.slice(4).map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem 
                      key={index}
                      onClick={() => handleActionClick(action)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
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
