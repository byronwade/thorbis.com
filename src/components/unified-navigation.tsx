'use client'

/**
 * Unified Navigation Component
 * 
 * A comprehensive, overlay-free navigation system that consolidates all navigation patterns
 * across the Thorbis Business OS platform. This component follows the REUSE FIRST, CREATE LAST 
 * principle and supports all industry verticals with consistent Odixe design system styling.
 * 
 * Features:
 * - Industry-specific navigation configurations
 * - Overlay-free mobile navigation (expandable sections, not modals)  
 * - Sidebar and header navigation patterns
 * - Dark-first design with Odixe color tokens
 * - Fully responsive without overlay patterns
 * - Consistent logo and branding
 * - User profile integration
 * - Search integration
 * - Notification badges
 * 
 * Usage:
 * - Replaces all individual app navigation.tsx files
 * - Configurable for different industries and layouts
 * - Supports both sidebar and header navigation patterns
 */

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Industry, getNavigationConfig } from '@/configs/navigation-configs'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  // Common icons
  Search, 
  Bell, 
  Settings, 
  User, 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  BarChart3,
  Calendar,
  FileText,
  Users,
  DollarSign,
  Package,
  // Industry icons
  Wrench,           // Home Services
  MonitorSpeaker,   // Restaurant KDS
  Car,              // Auto
  ShoppingCart,     // Retail POS
  ShoppingBag,      // Orders
  Receipt,          // Receipts
  Boxes,            // Inventory
  Clock,            // Time/Payroll
  Brain,            // AI
  Building2,        // Company
  UserCheck,        // HR
  Heart,            // Benefits
  BookOpen,         // Books/Docs
  Calculator,       // Tax
  TrendingUp,       // Reports
  Sparkles,         // AI Assistant
  CreditCard,       // Payment
  Building,         // Vendors
  Wallet,           // Financial
  Shield,           // Compliance
  LogOut,           // Logout
  MenuSquare,       // Menus
  Trophy,           // Leaderboard
  Github,           // GitHub
  Cog               // Settings gear
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Type definitions  
export interface UnifiedNavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  isNew?: boolean
  children?: UnifiedNavigationItem[]
}

export interface UnifiedNavigationSection {
  title?: string
  items: UnifiedNavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface UserProfile {
  name: string
  email: string
  role?: string
  avatar?: string
}

export interface UnifiedNavigationProps {
  // Industry/app configuration
  industry: Industry
  
  // Layout configuration
  layout?: 'sidebar' | 'header' | 'sidebar-with-header'
  
  // Appearance
  collapsed?: boolean
  showLogo?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
  showThemeToggle?: boolean
  
  // Branding
  appName?: string
  logoSrc?: string
  
  // User data
  user?: UserProfile
  notificationCount?: number
  
  // Callbacks
  onToggleCollapse?: () => void
  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onUserMenuAction?: (action: 'profile' | 'settings' | 'logout') => void
  
  // Custom configuration overrides
  customSections?: UnifiedNavigationSection[]
  
  // Styling
  className?: string
}

// Industry-specific navigation configurations (typed using Partial to allow subset keys)
// @ts-ignore - Used for future implementation
const industryNavigationConfigs: Partial<Record<Industry, { appName: string; sections: UnifiedNavigationSection[] }>> = {
  hs: {
    appName: 'Thorbis HS',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Overview and metrics' },
          { name: 'Dispatch', href: '/dispatch', icon: Wrench, description: 'Schedule and assign work orders' },
          { name: 'Work Orders', href: '/work-orders', icon: FileText, description: 'Manage service requests' },
          { name: 'Estimates', href: '/estimates', icon: DollarSign, description: 'Create and send estimates' },
          { name: 'Invoices', href: '/invoices', icon: Receipt, description: 'Billing and payment management' },
          { name: 'Customers', href: '/customers', icon: Users, description: 'Customer database and history' },
          { name: 'Pricebook', href: '/pricebook', icon: BookOpen, description: 'Service pricing management' }
        ]
      },
      {
        title: 'Business Tools',
        items: [
          { name: 'Calendar', href: '/calendar', icon: Calendar, description: 'Scheduling and appointments' },
          { 
            name: 'Analytics', 
            href: '/dashboards/analytics', 
            icon: BarChart3, 
            description: 'Advanced TradingView charts and business intelligence',
            isNew: true,
            children: [
              { name: 'Overview', href: '/dashboards/analytics/overview', icon: Home, description: 'Key metrics dashboard' },
              { name: 'Advanced Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'TradingView powered charts' },
              { name: 'Multi-Pane Analysis', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Synchronized chart panes' },
              { name: 'Chart Builder', href: '/dashboards/analytics/builder', icon: Settings, description: 'Custom chart creation' },
              { name: 'Export & Reports', href: '/dashboards/analytics/reports', icon: FileText, description: 'PDF export and reporting' }
            ]
          },
          { name: 'AI Assistant', href: '/ai', icon: Sparkles, description: 'AI-powered insights', isNew: true },
          { name: 'Team', href: '/team', icon: Users, description: 'Staff management' },
          { name: 'Communications', href: '/communications', icon: Bell, description: 'Customer communications' },
          { name: 'Photos', href: '/photos', icon: Package, description: 'Job photos and documents' },
          { name: 'Inventory', href: '/inventory', icon: Boxes, description: 'Parts and supplies' },
          { name: 'Mobile', href: '/mobile', icon: User, description: 'Mobile app management' },
          { name: 'Portal', href: '/portal', icon: Building2, description: 'Customer portal' },
          { name: 'Recurring', href: '/recurring', icon: Clock, description: 'Recurring services' },
          { name: 'Time Tracking', href: '/timetracking', icon: Clock, description: 'Staff time tracking' },
          { name: 'Marketing', href: '/marketing', icon: TrendingUp, description: 'Marketing campaigns' },
          { name: 'Financials', href: '/financials', icon: DollarSign, description: 'Financial reporting' },
          { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
        ]
      }
    ]
  },
  
  rest: {
    appName: 'Thorbis Restaurant',
    sections: [
      {
        title: 'Operations',
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Restaurant overview' },
          { name: 'POS', href: '/pos', icon: CreditCard, description: 'Point of sale system' },
          { name: 'KDS', href: '/kds', icon: MonitorSpeaker, description: 'Kitchen display system' },
          { name: 'Floor', href: '/floor', icon: Users, description: 'Table and seating management' },
          { name: 'Checks', href: '/checks', icon: FileText, description: 'Order tracking' },
          { name: 'Menus', href: '/menus', icon: MenuSquare, description: 'Menu management' },
          { name: 'Inventory', href: '/inventory', icon: Package, description: 'Stock tracking' },
          { name: 'Reservations', href: '/reservations', icon: Calendar, description: 'Table reservations' }
        ]
      },
      {
        title: 'Business Intelligence',
        items: [
          { 
            name: 'Analytics', 
            href: '/dashboards/analytics', 
            icon: BarChart3, 
            description: 'Advanced analytics with TradingView charts',
            isNew: true,
            children: [
              { name: 'Restaurant Analytics', href: '/dashboards/analytics/overview?from=rest', icon: Home, description: 'Restaurant-specific metrics' },
              { name: 'Revenue Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'Advanced revenue tracking' },
              { name: 'Multi-Pane View', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Comprehensive dashboards' },
              { name: 'Custom Reports', href: '/dashboards/analytics/builder', icon: Settings, description: 'Build custom analytics' }
            ]
          },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Business reports' },
          { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
        ]
      }
    ]
  },

  auto: {
    appName: 'Thorbis Auto',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Auto shop overview' },
          { name: 'Service Bays', href: '/service-bays', icon: Wrench, description: 'Bay management' },
          { name: 'Repair Orders', href: '/repair-orders', icon: FileText, description: 'Repair tracking' },
          { name: 'Vehicles', href: '/vehicles', icon: Car, description: 'Vehicle database' },
          { name: 'Parts', href: '/parts', icon: Package, description: 'Parts inventory' },
          { name: 'Customers', href: '/customers', icon: Users, description: 'Customer management' },
          { name: 'Estimates', href: '/estimates', icon: DollarSign, description: 'Repair estimates' },
          { name: 'Invoices', href: '/invoices', icon: Receipt, description: 'Billing and payments' }
        ]
      },
      {
        title: 'Reports & Analytics',
        items: [
          { 
            name: 'Analytics', 
            href: '/dashboards/analytics', 
            icon: BarChart3, 
            description: 'Advanced auto shop analytics',
            isNew: true,
            children: [
              { name: 'Auto Analytics', href: '/dashboards/analytics/overview?from=auto', icon: Home, description: 'Auto shop performance' },
              { name: 'Service Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'Service performance tracking' },
              { name: 'Multi-Metric View', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Comprehensive analytics' },
              { name: 'Custom Analytics', href: '/dashboards/analytics/builder', icon: Settings, description: 'Build custom reports' }
            ]
          },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Business reports' },
          { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
        ]
      }
    ]
  },

  ret: {
    appName: 'Thorbis Retail',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Retail overview' },
          { name: 'POS', href: '/pos', icon: ShoppingCart, description: 'Point of sale' },
          { name: 'Products', href: '/products', icon: Package, description: 'Product catalog' },
          { name: 'Inventory', href: '/inventory', icon: Boxes, description: 'Stock management' },
          { name: 'Customers', href: '/customers', icon: Users, description: 'Customer database' },
          { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Order management' },
          { name: 'Receipts', href: '/receipts', icon: Receipt, description: 'Transaction records' }
        ]
      },
      {
        title: 'Reports & Analytics',
        items: [
          { 
            name: 'Analytics', 
            href: '/dashboards/analytics', 
            icon: BarChart3, 
            description: 'Advanced retail analytics',
            isNew: true,
            children: [
              { name: 'Retail Analytics', href: '/dashboards/analytics/overview?from=ret', icon: Home, description: 'Retail performance metrics' },
              { name: 'Sales Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'Advanced sales tracking' },
              { name: 'Multi-Store View', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Multi-location analytics' },
              { name: 'Custom Reports', href: '/dashboards/analytics/builder', icon: Settings, description: 'Build custom analytics' }
            ]
          },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Sales reports' },
          { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
        ]
      }
    ]
  },

  books: {
    appName: 'Thorbis Books',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Financial overview' },
          { name: 'Transactions', href: '/transactions', icon: Receipt, description: 'Transaction history' },
          { name: 'General Ledger', href: '/ledger', icon: BookOpen, description: 'Account ledgers' },
          { name: 'Receivables', href: '/receivables', icon: Users, description: 'Accounts receivable' },
          { name: 'Payables', href: '/payables', icon: Building, description: 'Accounts payable' },
          { name: 'Invoices', href: '/invoices', icon: FileText, description: 'Invoice management' },
          { name: 'Automation', href: '/automation', icon: Sparkles, description: 'AI automation' },
          { name: 'Multi-Currency', href: '/multi-currency', icon: Wallet, description: 'Currency management' },
          { name: 'Batch Invoicing', href: '/batch-invoicing', icon: Users, description: 'Bulk invoicing' },
          { name: 'Invoice Approval', href: '/invoice-approval', icon: Shield, description: 'Approval workflow' },
          { name: 'Bills', href: '/bills', icon: CreditCard, description: 'Bill management' },
          { name: 'Customers', href: '/customers', icon: Users, description: 'Customer accounts' },
          { name: 'Vendors', href: '/vendors', icon: Building, description: 'Vendor management' },
          { name: 'Reconciliation', href: '/banking', icon: Wallet, description: 'Bank reconciliation' },
          { name: 'Cash Flow', href: '/cash-flow', icon: TrendingUp, description: 'Cash flow analysis' },
          { name: 'Chart of Accounts', href: '/accounts', icon: BookOpen, description: 'Account structure' },
          { 
            name: 'Advanced Analytics', 
            href: '/dashboards/analytics', 
            icon: BarChart3, 
            description: 'Advanced financial analytics with TradingView',
            isNew: true,
            children: [
              { name: 'Financial Overview', href: '/dashboards/analytics/overview?from=books', icon: Home, description: 'Financial performance dashboard' },
              { name: 'Revenue Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'Advanced financial charts' },
              { name: 'Multi-Account View', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Multi-account analytics' },
              { name: 'Custom Financial Reports', href: '/dashboards/analytics/builder', icon: Settings, description: 'Build custom financial analytics' },
              { name: 'Export & PDF Reports', href: '/dashboards/analytics/reports', icon: FileText, description: 'Professional PDF reports' }
            ]
          },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Financial reports' },
          { name: 'Tax', href: '/tax', icon: Calculator, description: 'Tax management' },
          { name: 'AI Insights', href: '/ai-insights', icon: Brain, description: 'AI-powered insights' },
          { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System settings' }
        ]
      }
    ]
  },

  courses: {
    appName: 'Thorbis Courses',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Learning dashboard' },
          { name: 'Courses', href: '/courses', icon: BookOpen, description: 'Course catalog' },
          { name: 'Study Groups', href: '/study-groups', icon: Users, description: 'Collaborative learning' },
          { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, description: 'Achievement rankings' },
          { name: 'Profile', href: '/profile', icon: User, description: 'Personal profile' }
        ]
      }
    ]
  },

  payroll: {
    appName: 'Thorbis Payroll',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Payroll overview' }
        ]
      },
      {
        title: 'Payroll',
        items: [
          { name: 'Run Payroll', href: '/payroll/run', icon: DollarSign, description: 'Process payroll' },
          { name: 'Payroll History', href: '/payroll/history', icon: Clock, description: 'Past payroll runs' },
          { name: 'Pay Schedules', href: '/payroll/schedules', icon: Calendar, description: 'Pay periods' },
          { name: 'Direct Deposit', href: '/payroll/direct-deposit', icon: CreditCard, description: 'Bank accounts' },
          { name: 'Payroll Reports', href: '/payroll/reports', icon: BarChart3, description: 'Payroll analytics' }
        ]
      },
      {
        title: 'Employees',
        items: [
          { name: 'Employee Directory', href: '/employees/directory', icon: Users, description: 'All employees' },
          { name: 'Employee Portal', href: '/employees/portal', icon: User, description: 'Self-service portal' }
        ]
      },
      {
        title: 'Time Tracking',
        items: [
          { name: 'Timesheets', href: '/time/timesheets', icon: Clock, description: 'Time tracking' },
          { name: 'Break Management', href: '/time/breaks', icon: Clock, description: 'Break tracking' },
          { name: 'Geolocation', href: '/time/geolocation', icon: Clock, description: 'Location tracking' }
        ]
      },
      {
        title: 'Benefits',
        items: [
          { name: 'Health Insurance', href: '/benefits/health', icon: Heart, description: 'Health plans' },
          { name: 'Retirement Plans', href: '/benefits/retirement', icon: Shield, description: 'Retirement benefits' },
          { name: 'Benefits Enrollment', href: '/benefits/enrollment', icon: UserCheck, description: 'Enrollment process' }
        ]
      },
      {
        title: 'HR',
        items: [
          { name: 'HR Documents', href: '/hr/documents', icon: FileText, description: 'Document management' },
          { name: 'Org Chart', href: '/hr/org-chart', icon: Building2, description: 'Organization chart' }
        ]
      },
      {
        title: 'Compliance',
        items: [
          { name: 'Tax Filing', href: '/compliance/taxes', icon: Calculator, description: 'Tax compliance' },
          { name: 'R&D Credits', href: '/compliance/rd-credits', icon: Shield, description: 'R&D tax credits' }
        ]
      }
    ]
  },

  lom: {
    appName: 'LOM',
    sections: [
      {
        items: [
          { name: 'Home', href: '/', icon: Home, description: 'LOM documentation home' },
          { name: 'Schema.org', href: '/schema-org', icon: BookOpen, description: 'Schema.org integration' },
          { name: 'Documentation', href: '/documentation', icon: FileText, description: 'API documentation' },
          { name: 'Schemas', href: '/schemas', icon: Package, description: 'Schema library' },
          { name: 'Validate', href: '/validate', icon: Shield, description: 'Schema validation' },
          { name: 'GitHub', href: 'https://github.com/thorbis/lom', icon: Github, description: 'Source code' }
        ]
      }
    ]
  },

  investigations: {
    appName: 'Thorbis Investigations',
    sections: [
      {
        title: 'Investigation Tools',
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Investigation overview' },
          { name: 'Cases', href: '/cases', icon: FileText, description: 'Case management' },
          { name: 'Evidence', href: '/evidence', icon: Package, description: 'Evidence tracking' },
          { name: 'Timeline', href: '/timeline', icon: Clock, description: 'Event timeline' },
          { name: 'People', href: '/people', icon: Users, description: 'Person of interest' },
          { name: 'Case Graph', href: '/case-graph', icon: BarChart3, description: 'Relationship mapping' },
          { name: 'OSINT', href: '/osint', icon: Search, description: 'Open source intelligence' },
          { name: 'Video Analysis', href: '/video-analysis', icon: MonitorSpeaker, description: 'Video evidence analysis' },
          { name: 'War Room', href: '/war-room', icon: Users, description: 'Collaborative workspace' },
          { name: 'AI Analysis', href: '/ai-analysis', icon: Brain, description: 'AI-powered analysis' },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Investigation reports' }
        ]
      }
    ]
  },

  banking: {
    appName: 'Thorbis Banking',
    sections: [
      {
        items: [
          { name: 'Dashboard', href: '/', icon: Home, description: 'Banking overview' },
          { name: 'Accounts', href: '/accounts', icon: Wallet, description: 'Account management' },
          { name: 'Transactions', href: '/transactions', icon: Receipt, description: 'Transaction history' },
          { name: 'Lending', href: '/lending', icon: CreditCard, description: 'Loan management' },
          { name: 'Customers', href: '/customers', icon: Users, description: 'Customer management' },
          { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Financial reports' }
        ]
      }
    ]
  },

  ai: {
    appName: 'Thorbis AI',
    sections: [
      {
        items: [
          { name: 'Chat', href: '/', icon: Brain, description: 'AI chat interface' },
          { name: 'Tools', href: '/tools', icon: Settings, description: 'AI tools and utilities' },
          { name: 'Settings', href: '/dashboards/settings', icon: Cog, description: 'AI configuration' }
        ]
      }
    ]
  }
}

/**
 * Unified Navigation Component
 * 
 * Central navigation component that replaces all individual app navigation.tsx files.
 * Supports both sidebar and header layouts with overlay-free mobile navigation.
 */
export function UnifiedNavigation({
  industry,
  layout = 'sidebar',
  collapsed = false,
  showLogo = true,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showThemeToggle = true,
  appName,
  logoSrc = '/images/ThorbisLogo.webp',
  user,
  notificationCount = 0,
  onToggleCollapse,
  onSearch,
  onNotificationClick,
  onUserMenuAction,
  customSections,
  className
}: UnifiedNavigationProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState(')
  const [mobileMenuExpanded, setMobileMenuExpanded] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  
  // Get configuration for current industry (centralized)
  const config = getNavigationConfig(industry)
  const sections = (customSections || config.sections) as UnifiedNavigationSection[]
  const displayAppName = appName || config.appName

  // Toggle section expansion
  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle)
    } else {
      newExpanded.add(sectionTitle)
    }
    setExpandedSections(newExpanded)
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  // Check if path is active
  const isActiveLink = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  // Render navigation item
  const renderNavItem = (item: UnifiedNavigationItem, level = 0) => {
    const isActive = isActiveLink(item.href)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.has(item.name)

    return (
      <div key={item.href || item.name}>
        {hasChildren ? (
          <button
            onClick={() => toggleSection(item.name)}
            className={cn(
              'w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              'text-neutral-300 hover:text-white hover:bg-neutral-800',
              'dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800',
              'light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100',
              level > 0 && 'ml-4'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || level > 0) && (
                <>
                  <span>{item.name}</span>
                  {item.isNew && (
                    <Badge variant="default" className="text-xs bg-blue-600">NEW</Badge>
                  )}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                  )}
                </>
              )}
            </div>
            {(!collapsed || level > 0) && (
              <ChevronRight className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )} />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              isActive
                ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white light:bg-blue-600 light:text-white'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100',
              level > 0 && 'ml-4'
            )}
            title={collapsed && level === 0 ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || level > 0) && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.isNew && (
                  <Badge variant="default" className="text-xs bg-blue-600">NEW</Badge>
                )}
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                )}
              </>
            )}
          </Link>
        )}

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Sidebar Navigation Component
  const SidebarNavigation = () => (
    <div className={cn(
      'flex flex-col h-full bg-neutral-950 dark:bg-neutral-950 border-r border-neutral-800 dark:border-neutral-800 transition-all duration-200',
      'light:bg-neutral-50 light:border-neutral-200',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo Header */}
      {showLogo && (
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 min-h-[64px]">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="Logo" className="h-8 w-8 flex-shrink-0" />
            {!collapsed && (
              <span className="text-lg font-bold text-white dark:text-white light:text-neutral-900">{displayAppName}</span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {showThemeToggle && !collapsed && (
              <ThemeToggle size="sm" variant="ghost" className="text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900" />
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {section.title && !collapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 light:text-neutral-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              {section.items.map(item => renderNavItem(item))}
              {sectionIndex < sections.length - 1 && (
                <div className="h-px bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-200 my-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Footer */}
      {showUserMenu && user && !collapsed && (
        <div className="border-t border-neutral-800 dark:border-neutral-800 light:border-neutral-200 p-4">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-neutral-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-neutral-500 dark:bg-neutral-500 light:bg-neutral-300 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-white dark:text-white light:text-neutral-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white dark:text-white light:text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-500">{user.role || user.email}</p>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-neutral-400 dark:text-neutral-400 light:text-neutral-500 transition-transform',
              userMenuOpen && 'rotate-180'
            )} />
          </button>

          {userMenuOpen && (
            <div className="mt-2 py-2 space-y-1 border-t border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
              <button
                onClick={() => onUserMenuAction?.('profile')}
                className="w-full flex items-center gap-2 px-2 py-1 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100 rounded"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => onUserMenuAction?.('settings')}
                className="w-full flex items-center gap-2 px-2 py-1 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100 rounded"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => onUserMenuAction?.('logout')}
                className="w-full flex items-center gap-2 px-2 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-neutral-800 light:text-red-600 light:hover:text-red-700 light:hover:bg-red-50 rounded"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Header Navigation Component
  const HeaderNavigation = () => (
    <header className={cn(
      'bg-neutral-950 dark:bg-neutral-950 light:bg-white sticky top-0 z-50 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200',
      className
    )}>
      <div className="px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            {showLogo && (
              <Link href="/" className="flex items-center gap-3">
                <img src={logoSrc} alt="Logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-white dark:text-white light:text-neutral-900 hidden sm:block">
                  {displayAppName}
                </span>
              </Link>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {sections[0]?.items.slice(0, 6).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors relative',
                    isActiveLink(item.href)
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white light:bg-blue-600 light:text-white'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100',
                    item.name === 'Analytics' && 'ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/20'
                  )}
                  title={item.name === 'Analytics' ? 'New: Advanced TradingView Analytics Dashboard' : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex items-center gap-1">
                    {item.name}
                    {item.isNew && (
                      <Badge variant="default" className="text-xs bg-blue-600 ml-1">NEW</Badge>
                    )}
                  </span>
                  {item.name === 'Analytics' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search, Notifications, Theme Toggle, User */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-400 light:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder-neutral-400 light:bg-white light:border-neutral-300 light:text-neutral-900 light:placeholder-neutral-500"
                  />
                </div>
              </form>
            )}

            {/* Theme Toggle */}
            {showThemeToggle && (
              <ThemeToggle className="text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900" />
            )}

            {/* Notifications */}
            {showNotifications && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-blue-500">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </button>
            )}

            {/* User Menu */}
            {showUserMenu && user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-neutral-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-neutral-500 dark:bg-neutral-500 light:bg-neutral-300 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-white dark:text-white light:text-neutral-600" />
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-400 light:text-neutral-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg py-2 z-50 dark:bg-neutral-900 dark:border-neutral-800 light:bg-white light:border-neutral-200 light:shadow-xl">
                    <div className="px-4 py-3 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
                      <p className="text-sm font-medium text-white dark:text-white light:text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => onUserMenuAction?.('profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => onUserMenuAction?.('settings')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => onUserMenuAction?.('logout')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-neutral-800 light:text-red-600 light:hover:text-red-700 light:hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuExpanded(!mobileMenuExpanded)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100 rounded-md transition-colors"
            >
              {mobileMenuExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Overlay-Free Mobile Menu - Expandable Section */}
        {mobileMenuExpanded && (
          <div className="lg:hidden border-t border-neutral-800 dark:border-neutral-800 light:border-neutral-200 py-4">
            <div className="space-y-1">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-1">
                  {section.title && (
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 light:text-neutral-400 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    </div>
                  )}
                  {section.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuExpanded(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors',
                        isActiveLink(item.href)
                          ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white light:bg-blue-600 light:text-white'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.name}</span>
                      {item.isNew && (
                        <Badge variant="default" className="text-xs bg-blue-600">NEW</Badge>
                      )}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile Search */}
            {showSearch && (
              <div className="mt-4 px-3">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-400 light:text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder-neutral-400 light:bg-white light:border-neutral-300 light:text-neutral-900 light:placeholder-neutral-500"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )

  // Close user menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(_event: MouseEvent) {
      if (userMenuOpen) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Render based on layout type
  if (layout === 'header') {
    return <HeaderNavigation />
  }

  if (layout === 'sidebar-with-header') {
    return (
      <>
        <HeaderNavigation />
        <SidebarNavigation />
      </>
    )
  }

  // Default: sidebar layout
  return <SidebarNavigation />
}

export default UnifiedNavigation