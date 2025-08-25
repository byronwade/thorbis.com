"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Calculator, Users, MessageSquare, 
  BarChart3, Zap, TrendingUp, Settings, FileText, Receipt, 
  Building, Star, ShoppingCart, Package, Calendar, Cpu
} from 'lucide-react';
import { cn } from '@lib/utils';

/**
 * Business Navigation Component
 * Self-contained navigation for all business dashboard modules
 */
export function BusinessNavigation() {
  const pathname = usePathname();

  // All business navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/business',
      icon: LayoutDashboard,
      current: pathname === '/dashboard/business'
    },
    {
      name: 'Customers',
      href: '/dashboard/business/customers',
      icon: Users,
      current: pathname.startsWith('/dashboard/business/customers')
    },
    {
      name: 'Projects',
      href: '/dashboard/business/projects',
      icon: Building,
      current: pathname.startsWith('/dashboard/business/projects')
    },
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
      name: 'Accounting',
      href: '/dashboard/business/accounting',
      icon: Calculator,
      current: pathname.startsWith('/dashboard/business/accounting')
    },
    {
      name: 'Payroll',
      href: '/dashboard/business/time-payroll',
      icon: Users,
      current: pathname.startsWith('/dashboard/business/time-payroll')
    },
    {
      name: 'Employees',
      href: '/dashboard/business/employees',
      icon: Users,
      current: pathname.startsWith('/dashboard/business/employees'),
      submenu: [
        { name: 'Employee Directory', href: '/dashboard/business/employees' },
        { name: 'Onboarding', href: '/dashboard/business/employees/onboarding' }
      ]
    },
    {
      name: 'Marketing',
      href: '/dashboard/business/marketing',
      icon: TrendingUp,
      current: pathname.startsWith('/dashboard/business/marketing')
    },
    {
      name: 'Analytics',
      href: '/dashboard/business/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/dashboard/business/analytics')
    },
  ];

  const secondaryItems = [
    {
      name: 'Inventory',
      href: '/dashboard/business/inventory',
      icon: Package,
      current: pathname.startsWith('/dashboard/business/inventory')
    },
    {
      name: 'Pricebook',
      href: '/dashboard/business/pricebook',
      icon: ShoppingCart,
      current: pathname.startsWith('/dashboard/business/pricebook')
    },
    {
      name: 'Schedule',
      href: '/dashboard/business/schedule',
      icon: Calendar,
      current: pathname.startsWith('/dashboard/business/schedule')
    },
    {
      name: 'Service Plans',
      href: '/dashboard/business/service-plans',
      icon: Star,
      current: pathname.startsWith('/dashboard/business/service-plans')
    },
    {
      name: 'Communication',
      href: '/dashboard/business/communication',
      icon: MessageSquare,
      current: pathname.startsWith('/dashboard/business/communication'),
      submenu: [
        { name: 'Email Client', href: '/dashboard/business/communication' },
        { name: 'Conversations', href: '/dashboard/business/communication/conversations' },
        { name: 'Team Chat', href: '/dashboard/business/communication/team-chat' }
      ]
    },
    {
      name: 'Automation',
      href: '/dashboard/business/automation',
      icon: Zap,
      current: pathname.startsWith('/dashboard/business/automation')
    },
    {
      name: 'Devices',
      href: '/dashboard/business/devices',
      icon: Cpu,
      current: pathname.startsWith('/dashboard/business/devices'),
      submenu: [
        { name: 'Device Scanner', href: '/dashboard/business/devices' },
        { name: 'Firmware Updates', href: '/dashboard/business/devices/firmware' },
        { name: 'Network Config', href: '/dashboard/business/devices/network' },
        { name: 'Device Monitor', href: '/dashboard/business/devices/monitor' }
      ]
    },
    {
      name: 'Ads',
      href: '/dashboard/business/ads',
      icon: TrendingUp,
      current: pathname.startsWith('/dashboard/business/ads')
    },
    {
      name: 'Settings',
      href: '/dashboard/business/settings',
      icon: Settings,
      current: pathname.startsWith('/dashboard/business/settings')
    },
  ];

  return (
    <div className="flex flex-col flex-grow bg-white dark:bg-card border-r border-border dark:border-border overflow-y-auto">
      {/* Business header */}
      <div className="flex items-center px-4 py-4 border-b border-border dark:border-border">
        <span className="text-2xl mr-3">🏢</span>
        <div>
          <h2 className="text-lg font-semibold text-foreground dark:text-white">
            Business
          </h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Management Dashboard
          </p>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  item.current 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground group-hover:text-muted-foreground dark:text-muted-foreground dark:group-hover:text-muted-foreground',
                  'mr-3 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Secondary navigation */}
        <div className="pt-6">
          <p className="px-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
            More Tools
          </p>
        </div>
        <div className="space-y-1">
          {secondaryItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  item.current 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground group-hover:text-muted-foreground dark:text-muted-foreground dark:group-hover:text-muted-foreground',
                  'mr-3 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-border dark:border-border">
        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
          Business Dashboard
        </p>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
          All modules available
        </p>
      </div>
    </div>
  );
}
