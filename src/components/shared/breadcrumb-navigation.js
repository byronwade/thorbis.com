"use client";

import React, { useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import { 
  ChevronRight, 
  ChevronDown, 
  Home, 
  Building2, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Star,
  FileText,
  CreditCard,
  Briefcase,
  MessageSquare
} from "lucide-react";
import logger from "@lib/utils/logger";

/**
 * Smart Breadcrumb Navigation Component
 * Features: Dynamic breadcrumbs, related page suggestions, keyboard shortcuts
 */
export default function BreadcrumbNavigation({ 
  dashboardType = "business",
  maxItems = 4,
  showRelated = true,
  className = ""
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Dashboard-specific configurations
  const dashboardConfigs = useMemo(() => ({
    business: {
      root: { name: "Business Dashboard", href: "/dashboard/business", icon: Building2 },
      segments: {
        profile: { name: "Directory Profile", icon: Building2 },
        schedule: { name: "Job Scheduling", icon: Calendar },
        jobs: { name: "Field Jobs", icon: Briefcase },
        customers: { name: "Customers", icon: Users },
        analytics: { name: "Analytics", icon: BarChart3 },
        reviews: { name: "Reviews", icon: Star },
        invoices: { name: "Invoicing", icon: CreditCard },
        estimates: { name: "Estimates", icon: FileText },
        communication: { name: "Communication", icon: MessageSquare },
        settings: { name: "Settings", icon: Settings },
        billing: { name: "Billing", icon: CreditCard },
        // Sub-segments
        list: { name: "List View", icon: null },
        create: { name: "Create New", icon: null },
        edit: { name: "Edit", icon: null },
        details: { name: "Details", icon: null },
        overview: { name: "Overview", icon: null },
        calendar: { name: "Calendar", icon: Calendar },
        "new-job": { name: "New Job", icon: null },
        "photos-checklists": { name: "Photos & Checklists", icon: null },
        "job-costs": { name: "Job Costs", icon: null },
        "service-history": { name: "Service History", icon: null },
        "portal-access": { name: "Portal Access", icon: null },
      }
    },
    user: {
      root: { name: "Dashboard", href: "/dashboard/user", icon: Home },
      segments: {
        reviews: { name: "My Reviews", icon: Star },
        bookmarks: { name: "Bookmarks", icon: Star },
        jobs: { name: "Job Requests", icon: Briefcase },
        settings: { name: "Settings", icon: Settings },
      }
    },
    admin: {
      root: { name: "Admin Dashboard", href: "/admin", icon: Settings },
      segments: {
        users: { name: "Users", icon: Users },
        customers: { name: "Customers", icon: Users },
        billing: { name: "Billing", icon: CreditCard },
        reports: { name: "Reports", icon: BarChart3 },
        settings: { name: "Settings", icon: Settings },
      }
    },
    academy: {
      root: { name: "Academy", href: "/academy", icon: Home },
      segments: {
        courses: { name: "Courses", icon: FileText },
        progress: { name: "Progress", icon: BarChart3 },
        certifications: { name: "Certificates", icon: Star },
      }
    }
  }), []);

  // Get current dashboard config
  const config = dashboardConfigs[dashboardType] || dashboardConfigs.business;

  // Parse pathname into breadcrumb segments
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [];

    // Add root dashboard
    crumbs.push({
      name: config.root.name,
      href: config.root.href,
      icon: config.root.icon,
      isRoot: true
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Skip the dashboard type segment as it's already included in root
      if (segment === dashboardType || segment === 'dashboard' || segment === 'admin' || segment === 'academy') {
        continue;
      }

      // Get segment configuration
      const segmentConfig = config.segments[segment];
      
      if (segmentConfig) {
        crumbs.push({
          name: segmentConfig.name,
          href: currentPath,
          icon: segmentConfig.icon,
          isRoot: false,
          segment: segment
        });
      } else {
        // Fallback for unknown segments - capitalize and clean up
        const fallbackName = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        crumbs.push({
          name: fallbackName,
          href: currentPath,
          icon: null,
          isRoot: false,
          segment: segment
        });
      }
    }

    return crumbs;
  }, [pathname, config, dashboardType]);

  // Get related pages for current section
  const relatedPages = useMemo(() => {
    if (!showRelated || breadcrumbs.length < 2) return [];

    const currentSection = breadcrumbs[breadcrumbs.length - 2]?.segment;
    if (!currentSection) return [];

    const relatedMap = {
      business: {
        jobs: [
          { name: "Schedule New Job", href: "/dashboard/business/schedule/new-job", icon: Calendar },
          { name: "Job List", href: "/dashboard/business/jobs/list", icon: Briefcase },
          { name: "Create Estimate", href: "/dashboard/business/estimates/create", icon: FileText }
        ],
        customers: [
          { name: "Add Customer", href: "/dashboard/business/customers/create", icon: Users },
          { name: "Customer List", href: "/dashboard/business/customers/list", icon: Users },
          { name: "Service History", href: "/dashboard/business/customers/service-history", icon: FileText }
        ],
        schedule: [
          { name: "Calendar View", href: "/dashboard/business/schedule/calendar", icon: Calendar },
          { name: "New Job", href: "/dashboard/business/schedule/new-job", icon: Briefcase },
          { name: "Recurring Jobs", href: "/dashboard/business/schedule/recurring-jobs", icon: Calendar }
        ],
        analytics: [
          { name: "Dashboard", href: "/dashboard/business/analytics/dashboard", icon: BarChart3 },
          { name: "Reports", href: "/dashboard/business/analytics/reports", icon: FileText },
          { name: "Custom Builder", href: "/dashboard/business/analytics/custom-report-builder", icon: Settings }
        ]
      },
      user: {
        reviews: [
          { name: "Write Review", href: "/dashboard/user/reviews/create", icon: Star },
          { name: "My Reviews", href: "/dashboard/user/reviews", icon: Star }
        ],
        jobs: [
          { name: "Post Job", href: "/dashboard/user/jobs/create", icon: Briefcase },
          { name: "Job History", href: "/dashboard/user/jobs", icon: FileText }
        ]
      }
    };

    return relatedMap[dashboardType]?.[currentSection] || [];
  }, [breadcrumbs, showRelated, dashboardType]);

  // Handle breadcrumb click
  const handleBreadcrumbClick = useCallback((breadcrumb) => {
    logger.debug('Breadcrumb event', {
      action: 'breadcrumb_click',
      page: breadcrumb.href,
      name: breadcrumb.name,
      dashboardType,
      timestamp: Date.now(),
    });

    router.push(breadcrumb.href);
  }, [router, dashboardType]);

  // Truncate breadcrumbs if too many
  const displayBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // Keep first (root) and last few items
    const first = breadcrumbs[0];
    const last = breadcrumbs.slice(-maxItems + 2);
    
    return [first, { isEllipsis: true }, ...last];
  }, [breadcrumbs, maxItems]);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for root pages
  }

  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      {displayBreadcrumbs.map((breadcrumb, index) => {
        const isLast = index === displayBreadcrumbs.length - 1;
        const IconComponent = breadcrumb.icon;

        if (breadcrumb.isEllipsis) {
          return (
            <React.Fragment key="ellipsis">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground">
                    ...
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {breadcrumbs.slice(1, -maxItems + 2).map((hiddenCrumb) => {
                    const HiddenIcon = hiddenCrumb.icon;
                    return (
                      <DropdownMenuItem 
                        key={hiddenCrumb.href}
                        onClick={() => handleBreadcrumbClick(hiddenCrumb)}
                        className="flex items-center space-x-2"
                      >
                        {HiddenIcon && <HiddenIcon className="w-4 h-4" />}
                        <span>{hiddenCrumb.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={breadcrumb.href || index}>
            {isLast ? (
              // Current page - not clickable
              <div className="flex items-center space-x-1">
                {IconComponent && <IconComponent className="w-4 h-4 text-muted-foreground" />}
                <span className="font-medium text-foreground">{breadcrumb.name}</span>
              </div>
            ) : (
              // Clickable breadcrumb
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleBreadcrumbClick(breadcrumb)}
                >
                  <div className="flex items-center space-x-1">
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{breadcrumb.name}</span>
                  </div>
                </Button>
                {!isLast && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Related Pages Dropdown */}
      {relatedPages.length > 0 && (
        <>
          <div className="w-px h-4 bg-border mx-2" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                Related
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Related Pages
              </div>
              {relatedPages.map((page) => {
                const PageIcon = page.icon;
                return (
                  <DropdownMenuItem 
                    key={page.href}
                    onClick={() => {
                      logger.debug('Breadcrumb event', {
                        action: 'related_page_click',
                        page: page.href,
                        name: page.name,
                        dashboardType,
                        timestamp: Date.now(),
                      });
                      router.push(page.href);
                    }}
                    className="flex items-center space-x-2"
                  >
                    {PageIcon && <PageIcon className="w-4 h-4" />}
                    <span>{page.name}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
