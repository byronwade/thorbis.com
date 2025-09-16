'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, HelpCircle, LogOut, Settings, User, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalBranding } from './PortalThemeProvider';
import { PortalNotificationBadge } from './PortalNotificationBadge';

interface PortalHeaderProps {
  customerName: string;
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  branding?: {
    show_store_logo?: boolean;
    primary_color?: string;
    store_name?: string;
    welcome_message?: string;
  };
  permissions: Record<string, boolean>;
  className?: string;
}

const portalTypeConfig = {
  restaurant: {
    title: 'Restaurant Portal',
    icon: '🍽️',
    primaryColor: '#FF6B35',
    description: 'Manage your restaurant supplies and services',
  },
  auto: {
    title: 'Auto Service Portal',
    icon: '🚗',
    primaryColor: '#DC2626',
    description: 'Track your vehicle service and maintenance',
  },
  retail: {
    title: 'Retail Portal',
    icon: '🛍️',
    primaryColor: '#059669',
    description: 'Your personalized shopping experience',
  },
  hs: {
    title: 'Home Services Portal',
    icon: '🏠',
    primaryColor: '#2563EB',
    description: 'Manage your home services and maintenance',
  },
};

export function PortalHeader({
  customerName,
  portalType,
  branding: propBranding,
  permissions,
  className,
}: PortalHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use theming context if available, otherwise fall back to props
  let branding;
  try {
    branding = usePortalBranding();
  } catch {
    branding = propBranding || {};
  }
  
  const config = portalTypeConfig[portalType];
  const primaryColor = branding?.primary_color || config.primaryColor;
  const storeName = branding?.company_name || branding?.store_name || config.title;
  
  // Get customer initials for avatar
  const initials = customerName
    .split(' ')
    .map(name => name.charAt(0))
    .join(')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    // Clear any stored tokens and redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/60",
        className
      )}
      style={{
        borderBottomColor: `${primaryColor}20`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Portal Title */}
          <div className="flex items-center space-x-4">
            {(branding?.show_logo || branding?.show_store_logo) && (
              <div className="flex items-center">
                {branding?.logo_url ? (
                  <img 
                    src={branding.logo_url} 
                    alt={`${storeName} Logo'}
                    className="h-10 w-auto max-w-24 object-contain"
                  />
                ) : (
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {config.icon}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col">
              <h1 
                className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                style={{ 
                  fontFamily: branding?.heading_font ? 'var(--portal-heading-font, ${branding.heading_font})' : undefined 
                }}
              >
                {storeName}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {branding?.company_tagline || config.description}
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          {branding?.welcome_message && (
            <div className="hidden md:block max-w-md">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                {branding.welcome_message}
              </p>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            {permissions.can_receive_notifications && (
              <PortalNotificationBadge
                onViewAll={() => {
                  // Navigate to full notifications page
                  window.location.href = '/portal/notifications';
                }}
                onNotificationClick={(notification) => {
                  // Handle notification click
                  if (notification.action_url) {
                    window.open(notification.action_url, '_blank');
                  }
                }}
              />
            )}

            {/* Help */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline-block ml-2">Help</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={customerName} />
                    <AvatarFallback 
                      className="text-white text-sm font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {customerName}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                      {portalType} Customer
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{customerName}</span>
                    <span className="text-xs font-normal text-neutral-600 dark:text-neutral-400 capitalize">
                      {portalType} Portal Customer
                    </span>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                
                {permissions.can_manage_account && (
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Portal Type Indicator */}
      <div 
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}80 100%)',
        }}
      />
    </header>
  );
}