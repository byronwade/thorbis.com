'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  Command,
  ChefHat,
  Car,
  ShoppingCart,
  Wrench,
  Package,
  Clock
} from 'lucide-react'
import { cn } from '@thorbis/design/utils'
import { Button } from './button'

export interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  keywords?: string[]
}

export interface AppNavigationProps {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

// Industry-specific navigation configurations
const navigationConfig = {
  hs: {
    name: 'Home Services',
    icon: Wrench,
    items: [
      {
        label: 'Dashboard',
        href: '/hs',
        icon: Home,
        description: 'Overview of business operations',
        keywords: ['overview', 'stats', 'metrics']
      },
      {
        label: 'Dispatch',
        href: '/hs/dispatch',
        icon: Calendar,
        description: 'Schedule and assign work orders',
        keywords: ['schedule', 'assign', 'calendar', 'technician']
      },
      {
        label: 'Work Orders',
        href: '/hs/work-orders',
        icon: FileText,
        description: 'Manage service requests and jobs',
        keywords: ['jobs', 'service', 'requests', 'tickets']
      },
      {
        label: 'Estimates',
        href: '/hs/estimates',
        icon: FileText,
        description: 'Create and send estimates',
        keywords: ['quotes', 'pricing', 'proposals']
      },
      {
        label: 'Customers',
        href: '/hs/customers',
        icon: Users,
        description: 'Customer management and history',
        keywords: ['clients', 'contacts', 'CRM']
      },
      {
        label: 'AI Assistant',
        href: '/hs/ai',
        icon: Command,
        description: 'AI-powered business assistance',
        keywords: ['artificial intelligence', 'assistant', 'help']
      },
      {
        label: 'Settings',
        href: '/hs/settings',
        icon: Settings,
        description: 'Business configuration and preferences',
        keywords: ['configuration', 'preferences', 'setup']
      }
    ]
  },
  rest: {
    name: 'Restaurants',
    icon: ChefHat,
    items: [
      {
        label: 'Dashboard',
        href: '/rest',
        icon: Home,
        description: 'Restaurant overview and metrics',
        keywords: ['overview', 'sales', 'metrics']
      },
      {
        label: 'POS',
        href: '/rest/pos',
        icon: ShoppingCart,
        description: 'Point of sale system',
        keywords: ['orders', 'payment', 'checkout']
      },
      {
        label: 'Kitchen Display',
        href: '/rest/kds',
        icon: Clock,
        description: 'Kitchen order management',
        keywords: ['kitchen', 'orders', 'cooking']
      },
      {
        label: 'Floor Management',
        href: '/rest/floor',
        icon: Users,
        description: 'Table and seating management',
        keywords: ['tables', 'seating', 'dining room']
      },
      {
        label: 'Reservations',
        href: '/rest/reservations',
        icon: Calendar,
        description: 'Table reservations and bookings',
        keywords: ['bookings', 'tables', 'schedule']
      },
      {
        label: 'AI Assistant',
        href: '/rest/ai',
        icon: Command,
        description: 'AI-powered restaurant assistance',
        keywords: ['artificial intelligence', 'assistant', 'help']
      },
      {
        label: 'Settings',
        href: '/rest/settings',
        icon: Settings,
        description: 'Restaurant configuration',
        keywords: ['configuration', 'preferences', 'setup']
      }
    ]
  },
  auto: {
    name: 'Auto Services',
    icon: Car,
    items: [
      {
        label: 'Dashboard',
        href: '/auto',
        icon: Home,
        description: 'Auto shop overview and metrics',
        keywords: ['overview', 'stats', 'metrics']
      },
      {
        label: 'Service Bays',
        href: '/auto/service-bays',
        icon: Wrench,
        description: 'Bay management and scheduling',
        keywords: ['bays', 'garage', 'workspace']
      },
      {
        label: 'Repair Orders',
        href: '/auto/repair-orders',
        icon: FileText,
        description: 'Vehicle repair tracking',
        keywords: ['repairs', 'vehicles', 'maintenance']
      },
      {
        label: 'Parts & Inventory',
        href: '/auto/parts',
        icon: Package,
        description: 'Parts inventory management',
        keywords: ['parts', 'inventory', 'stock']
      },
      {
        label: 'Vehicles',
        href: '/auto/vehicles',
        icon: Car,
        description: 'Customer vehicle database',
        keywords: ['cars', 'vehicles', 'fleet']
      },
      {
        label: 'AI Assistant',
        href: '/auto/ai',
        icon: Command,
        description: 'AI-powered auto service assistance',
        keywords: ['artificial intelligence', 'assistant', 'help']
      },
      {
        label: 'Settings',
        href: '/auto/settings',
        icon: Settings,
        description: 'Auto shop configuration',
        keywords: ['configuration', 'preferences', 'setup']
      }
    ]
  },
  ret: {
    name: 'Retail',
    icon: ShoppingCart,
    items: [
      {
        label: 'Dashboard',
        href: '/ret',
        icon: Home,
        description: 'Retail overview and metrics',
        keywords: ['overview', 'sales', 'metrics']
      },
      {
        label: 'POS',
        href: '/ret/pos',
        icon: ShoppingCart,
        description: 'Point of sale system',
        keywords: ['sales', 'checkout', 'register']
      },
      {
        label: 'Inventory',
        href: '/ret/inventory',
        icon: Package,
        description: 'Stock and inventory management',
        keywords: ['stock', 'products', 'warehouse']
      },
      {
        label: 'Customers',
        href: '/ret/customers',
        icon: Users,
        description: 'Customer management and loyalty',
        keywords: ['clients', 'loyalty', 'CRM']
      },
      {
        label: 'Orders',
        href: '/ret/orders',
        icon: FileText,
        description: 'Order management and fulfillment',
        keywords: ['orders', 'fulfillment', 'shipping']
      },
      {
        label: 'AI Assistant',
        href: '/ret/ai',
        icon: Command,
        description: 'AI-powered retail assistance',
        keywords: ['artificial intelligence', 'assistant', 'help']
      },
      {
        label: 'Settings',
        href: '/ret/settings',
        icon: Settings,
        description: 'Retail store configuration',
        keywords: ['configuration', 'preferences', 'setup']
      }
    ]
  }
}

/**
 * App Navigation Component
 * 
 * Industry-aware sidebar navigation with command palette integration.
 * Follows Thorbis design principles with dark-first theme.
 */
export function AppNavigation({
  industry,
  className,
  collapsed = false,
  onToggleCollapse
}: AppNavigationProps) {
  const pathname = usePathname()
  const config = navigationConfig[industry]

  return (
    <nav className={cn(
      "flex flex-col h-full bg-neutral-50 border-r border-neutral-200",
      "dark:bg-neutral-900 dark:border-neutral-800",
      "transition-all duration-200",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <config.icon className="h-8 w-8 text-blue-600" />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {config.name}
              </h2>
            </div>
          )}
        </div>
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {collapsed ? '→' : '←'}
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {config.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    isActive && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                    !isActive && "text-neutral-700 dark:text-neutral-300",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive && "text-blue-600 dark:text-blue-400"
                  )} />
                  
                  {!collapsed && (
                    <>
                      <span className="font-medium">
                        {item.label}
                      </span>
                      
                      {(item as any).badge && (
                        <span className={cn(
                          "ml-auto rounded-full px-2 py-1 text-xs font-medium",
                          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        )}>
                          {(item as any).badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Thorbis {config.name}
          </div>
        </div>
      )}
    </nav>
  )
}
