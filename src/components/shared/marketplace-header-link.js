"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@components/ui/dropdown-menu";
import { 
  Zap, 
  Download, 
  Star, 
  ChevronDown, 
  ExternalLink,
  Wrench,
  Truck,
  Building2,
  BarChart3,
  CreditCard
} from "lucide-react";

/**
 * MarketplaceHeaderLink - Quick access to integration marketplace
 * Shows only when marketplace feature flag is enabled
 */
export function MarketplaceHeaderLink({ className = "" }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if marketplace is enabled via feature flags
  useEffect(() => {
    const checkMarketplaceFlag = async () => {
      try {
        const response = await fetch('/api/flags');
        const flags = await response.json();
        setIsEnabled(flags.integrationMarketplace ?? false);
      } catch (error) {
        console.warn('Failed to fetch marketplace flag:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMarketplaceFlag();
  }, []);

  // Don't render if disabled or still loading
  if (!isEnabled || isLoading) {
    return null;
  }

  // Featured integrations for quick access
  const featuredIntegrations = [
    {
      id: 'field-service-pro',
      name: 'Field Service Pro',
      icon: Wrench,
      status: 'installed',
      href: '/dashboard/business/settings?section=field-service'
    },
    {
      id: 'fleet-management-pro',
      name: 'Fleet Management Pro',
      icon: Truck,
      status: 'available',
      href: '/dashboard/business/fleet-pro'
    },
    {
      id: 'quickbooks-sync',
      name: 'QuickBooks Sync',
      icon: CreditCard,
      status: 'available',
      href: '/dashboard/business/settings?section=marketplace'
    },
    {
      id: 'analytics-pro',
      name: 'Analytics Pro',
      icon: BarChart3,
      status: 'available',
      href: '/dashboard/business/settings?section=marketplace'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className={`text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer ${className}`}>
          Marketplace
          					<sup className="ml-1 text-xs text-primary dark:text-primary">New</sup>
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Integration Marketplace
          </span>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Featured Integrations */}
        <div className="p-2 space-y-1">
          {featuredIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            const isInstalled = integration.status === 'installed';
            
            return (
              <DropdownMenuItem key={integration.id} asChild>
                <Link 
                  href={integration.href}
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer w-full"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{integration.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant={isInstalled ? "default" : "outline"} 
                        className="text-xs"
                      >
                        {isInstalled ? "Installed" : "Available"}
                      </Badge>
                      {!isInstalled && (
                        <span className="text-xs text-muted-foreground">Free</span>
                      )}
                    </div>
                  </div>
                  {!isInstalled && (
                    <Download className="w-4 h-4 text-muted-foreground" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <DropdownMenuItem asChild>
          <Link 
            href="/dashboard/business/settings?section=marketplace" 
            className="flex items-center space-x-2 p-3"
          >
            <Zap className="w-4 h-4" />
            <span>Browse All Integrations</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            href="/dashboard/business/settings?section=integrations" 
            className="flex items-center space-x-2 p-3"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Installed</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a 
            href="https://thorbis.com/integrations" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-3 text-muted-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Developer Docs</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MarketplaceHeaderLink;
