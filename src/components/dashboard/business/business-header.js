"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, Search, Menu, User, LogOut, Settings,
  LayoutDashboard, Calculator, Users, MessageSquare, 
  BarChart3, Zap, TrendingUp, FileText, Receipt, 
  Building, Star, ShoppingCart, Package, Calendar,
  Briefcase, Mail, Inbox, Send
} from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Input } from '@components/ui/input';
import { cn } from '@lib/utils';
import useAuth from '@hooks/use-auth';

/**
 * Business Dashboard Header
 * Two-tier navigation header with main menu items in top bar and sub menu items in sub header
 */
export function BusinessHeader({ user }) {
  const { signOut } = useAuth();
  const pathname = usePathname();

  const userInitials = user?.user_metadata?.name
    ?.split(' ')
    .map(n => n[0])
    .join('') || user?.email?.[0]?.toUpperCase() || 'U';

  const userName = user?.user_metadata?.name || user?.email || 'User';
  const userEmail = user?.email || '';

  // Main navigation items for top bar
  const mainNavigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/business',
      icon: LayoutDashboard,
      current: pathname === '/dashboard/business'
    },
    {
      name: 'Directory Profile',
      href: '/dashboard/business/directory-profile',
      icon: Building,
      current: pathname.startsWith('/dashboard/business/directory-profile')
    },
    {
      name: 'Scheduling',
      href: '/dashboard/business/schedule',
      icon: Calendar,
      current: pathname.startsWith('/dashboard/business/schedule')
    },
    {
      name: 'Jobs',
      href: '/dashboard/business/jobs',
      icon: Briefcase,
      current: pathname.startsWith('/dashboard/business/jobs')
    },
    {
      name: 'Customers',
      href: '/dashboard/business/customers',
      icon: Users,
      current: pathname.startsWith('/dashboard/business/customers')
    },
    {
      name: 'Analytics',
      href: '/dashboard/business/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/dashboard/business/analytics')
    },
    {
      name: 'Marketplace',
      href: '/dashboard/business/marketplace',
      icon: ShoppingCart,
      current: pathname.startsWith('/dashboard/business/marketplace'),
      badge: 'New'
    },
  ];

  // Sub navigation items - context-aware based on current page
  const getSubNavigationItems = () => {
    // Communications sub-menu items
    if (pathname.startsWith('/dashboard/business/communication')) {
      return [
        {
          name: 'Company Inbox',
          href: '/dashboard/business/communication/company-inbox',
          icon: Inbox,
          current: pathname.startsWith('/dashboard/business/communication/company-inbox')
        },
        {
          name: 'My Inbox',
          href: '/dashboard/business/communication/my-inbox',
          icon: Mail,
          current: pathname.startsWith('/dashboard/business/communication/my-inbox')
        },
        {
          name: 'Communications',
          href: '/dashboard/business/communication',
          icon: MessageSquare,
          current: pathname === '/dashboard/business/communication'
        },
        {
          name: 'Instant Messaging',
          href: '/dashboard/business/communication/instant-messaging',
          icon: Send,
          current: pathname.startsWith('/dashboard/business/communication/instant-messaging')
        },
      ];
    }

    // Default sub navigation for other pages
    return [
      {
        name: 'Estimates',
        href: '/dashboard/business/estimates',
        icon: FileText,
        current: pathname.startsWith('/dashboard/business/estimates')
      },
      {
        name: 'Invoices',
        href: '/dashboard/business/invoices',
        icon: Receipt,
        current: pathname.startsWith('/dashboard/business/invoices')
      },
      {
        name: 'Projects',
        href: '/dashboard/business/projects',
        icon: Building,
        current: pathname.startsWith('/dashboard/business/projects')
      },
      {
        name: 'Communication',
        href: '/dashboard/business/communication',
        icon: MessageSquare,
        current: pathname.startsWith('/dashboard/business/communication')
      },
      {
        name: 'Inventory',
        href: '/dashboard/business/inventory',
        icon: Package,
        current: pathname.startsWith('/dashboard/business/inventory')
      },
      {
        name: 'Payroll',
        href: '/dashboard/business/time-payroll',
        icon: Users,
        current: pathname.startsWith('/dashboard/business/time-payroll')
      },
      {
        name: 'Marketing',
        href: '/dashboard/business/marketing',
        icon: TrendingUp,
        current: pathname.startsWith('/dashboard/business/marketing')
      },
      {
        name: 'Settings',
        href: '/dashboard/business/settings',
        icon: Settings,
        current: pathname.startsWith('/dashboard/business/settings')
      },
    ];
  };

  const subNavigationItems = getSubNavigationItems();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-card shadow-sm">
      {/* Main Header Bar */}
      <div className="border-b border-border dark:border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left side - Business branding */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Business brand */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏢</span>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground dark:text-white">
                  Business Dashboard
                </h1>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Comprehensive management platform
                </p>
              </div>
            </div>
          </div>

          {/* Center - Main Navigation (Desktop) */}
          <nav className="hidden xl:flex flex-1 justify-center max-w-4xl mx-8">
            <div className="flex space-x-1">
              {mainNavigationItems.slice(0, 6).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? 'bg-blue-50 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary/90 dark:border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:text-muted-foreground dark:hover:text-white dark:hover:bg-muted',
                    'px-3 py-2 rounded-md text-sm font-medium border border-transparent transition-all duration-200 relative'
                  )}
                >
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/20 dark:text-success/90">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              {/* More menu for additional items */}
              {mainNavigationItems.length > 6 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground dark:text-muted-foreground">
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {mainNavigationItems.slice(6).map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </div>
                          {item.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/20 dark:text-success/90">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </nav>

          {/* Center - Search (Large screens) */}
          <div className="hidden lg:flex xl:hidden flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers, projects, invoices..."
                className="pl-10 bg-gray-50 dark:bg-muted border-border dark:border-border"
              />
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Search button (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sub Header Bar - Secondary Navigation */}
      <div className="bg-gray-50 dark:bg-card border-b border-border dark:border-border">
        <div className="px-4 lg:px-6 py-3">
          {/* Desktop Sub Navigation */}
          <nav className="hidden md:flex">
            <div className="flex space-x-1 flex-wrap">
              {subNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? 'bg-white text-foreground shadow-sm border border-border dark:bg-card dark:text-white dark:border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:text-muted-foreground dark:hover:text-white dark:hover:bg-card/50',
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Sub Navigation - Horizontal Scroll */}
          <nav className="md:hidden">
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {subNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? 'bg-white text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50',
                    'px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-2'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Main Navigation - Collapsible */}
      <div className="xl:hidden border-b border-border dark:border-border bg-white dark:bg-card">
        <nav className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {mainNavigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? 'bg-blue-50 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary/90 dark:border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:text-muted-foreground dark:hover:text-white dark:hover:bg-muted',
                  'px-3 py-2 rounded-md text-sm font-medium border border-transparent whitespace-nowrap transition-all duration-200 relative flex items-center'
                )}
              >
                {item.name}
                {item.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/20 dark:text-success/90">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden xl:block border-t border-border dark:border-border px-4 py-2 bg-white dark:bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers, projects, invoices..."
            className="pl-10 bg-gray-50 dark:bg-muted border-border dark:border-border"
          />
        </div>
      </div>
    </header>
  );
}
