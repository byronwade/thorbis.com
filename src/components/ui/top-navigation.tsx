'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Sparkles,
  HelpCircle,
  BarChart3,
  Calendar,
  FileText,
  Users,
  DollarSign,
  Package,
  Wrench,
  MonitorSpeaker,
  Car,
  ShoppingCart,
  Building2,
  UserPlus,
  CreditCard,
  Command
} from 'lucide-react'
import { BusinessSwitcher, Business, BusinessType } from './business-switcher'
import { CommandPalette, useCommandPalette, GlobalCommandItem } from './global-command-palette'
import { cn } from '@/lib/utils'

interface TopNavItem {
  name: string
  href: string
  icon: React.ElementType
  description?: string
  badge?: string | number
  isNew?: boolean
}

interface TopNavSection {
  title: string
  items: TopNavItem[]
}

// Navigation structure by business type
const navigationConfig: Record<BusinessType['key'], TopNavSection[]> = {
  'home-services': [
    {
      title: 'Operations',
      items: [
        { name: 'Dispatch', href: '/dispatch', icon: Wrench, description: 'Manage work orders and technician schedules' },
        { name: 'Work Orders', href: '/work-orders', icon: FileText, description: 'View and manage all service requests' },
        { name: 'Estimates', href: '/estimates', icon: DollarSign, description: 'Create and track job estimates' },
        { name: 'Invoices', href: '/invoices', icon: FileText, description: 'Billing and payment management' }
      ]
    },
    {
      title: 'Customer Management',
      items: [
        { name: 'Customers', href: '/customers', icon: Users, description: 'Customer database and history' },
        { name: 'Scheduling', href: '/calendar', icon: Calendar, description: 'Appointment and job scheduling' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Business insights and reports' }
      ]
    },
    {
      title: 'Tools & Resources',
      items: [
        { name: 'Pricebook', href: '/pricebook', icon: Package, description: 'Manage services and pricing' },
        { name: 'AI Assistant', href: '/ai', icon: Sparkles, description: 'AI-powered business insights', isNew: true },
        { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
      ]
    }
  ],
  'restaurant': [
    {
      title: 'Front of House',
      items: [
        { name: 'POS', href: '/pos', icon: ShoppingCart, description: 'Point of sale system' },
        { name: 'Floor Plan', href: '/floor', icon: Building2, description: 'Table and seating management' },
        { name: 'Reservations', href: '/reservations', icon: Calendar, description: 'Booking and table management' },
        { name: 'Checks', href: '/checks', icon: FileText, description: 'Order and payment tracking' }
      ]
    },
    {
      title: 'Back of House',
      items: [
        { name: 'Kitchen Display', href: '/kds', icon: MonitorSpeaker, description: 'Order management system' },
        { name: 'Menu Management', href: '/menus', icon: FileText, description: 'Menu items and pricing' },
        { name: 'Inventory', href: '/inventory', icon: Package, description: 'Stock and ingredient tracking' }
      ]
    },
    {
      title: 'Business Intelligence',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance reports' },
        { name: 'AI Insights', href: '/ai', icon: Sparkles, description: 'AI-powered restaurant insights', isNew: true },
        { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
      ]
    }
  ],
  'automotive': [
    {
      title: 'Shop Operations',
      items: [
        { name: 'Service Bays', href: '/service-bays', icon: Wrench, description: 'Workshop and bay management' },
        { name: 'Repair Orders', href: '/repair-orders', icon: FileText, description: 'Job tracking and management' },
        { name: 'Estimates', href: '/estimates', icon: DollarSign, description: 'Repair cost estimates' },
        { name: 'Invoices', href: '/invoices', icon: FileText, description: 'Billing and payments' }
      ]
    },
    {
      title: 'Inventory & Customers',
      items: [
        { name: 'Parts Inventory', href: '/parts', icon: Package, description: 'Parts and supplies management' },
        { name: 'Vehicles', href: '/vehicles', icon: Car, description: 'Vehicle database and history' },
        { name: 'Customers', href: '/customers', icon: Users, description: 'Customer management' }
      ]
    },
    {
      title: 'Analytics & Tools',
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Business performance reports' },
        { name: 'AI Assistant', href: '/ai', icon: Sparkles, description: 'AI-powered shop insights', isNew: true },
        { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
      ]
    }
  ],
  'retail': [
    {
      title: 'Sales Operations',
      items: [
        { name: 'Point of Sale', href: '/pos', icon: ShoppingCart, description: 'Checkout and transaction management' },
        { name: 'Orders', href: '/orders', icon: FileText, description: 'Order processing and fulfillment' },
        { name: 'Customers', href: '/customers', icon: Users, description: 'Customer database and loyalty' },
        { name: 'Returns', href: '/returns', icon: FileText, description: 'Return and exchange processing' }
      ]
    },
    {
      title: 'Inventory Management',
      items: [
        { name: 'Inventory', href: '/inventory', icon: Package, description: 'Stock levels and tracking' },
        { name: 'Products', href: '/products', icon: Package, description: 'Product catalog management' },
        { name: 'Receipts', href: '/receipts', icon: FileText, description: 'Transaction records' }
      ]
    },
    {
      title: 'Business Intelligence',
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Sales and inventory reports' },
        { name: 'AI Insights', href: '/ai', icon: Sparkles, description: 'AI-powered retail insights', isNew: true },
        { name: 'Settings', href: '/dashboards/settings', icon: Settings, description: 'System configuration' }
      ]
    }
  ]
}

interface TopNavigationProps {
  currentBusiness?: Business
  businesses?: Business[]
  onBusinessSwitch?: (business: Business) => void
  onCreateBusiness?: (type: BusinessType['key']) => void
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  className?: string
}

export function TopNavigation({
  currentBusiness,
  businesses = [],
  onBusinessSwitch,
  onCreateBusiness,
  user,
  className
}: TopNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette } = useCommandPalette()

  // Get navigation items for current business type
  const currentNavigation = currentBusiness 
    ? navigationConfig[currentBusiness.type] || []
    : navigationConfig['home-services']

  // Generate commands for command palette based on current business
  const businessCommands: GlobalCommandItem[] = React.useMemo(() => {
    const commands: GlobalCommandItem[] = []
    
    // Add navigation items as commands
    currentNavigation.forEach(section => {
      section.items.forEach(item => {
        commands.push({
          id: item.href.replace('/', ''),
          title: item.name,
          description: item.description,
          icon: item.icon,
          group: section.title,
          action: () => window.location.href = item.href,
          keywords: [item.name.toLowerCase(), ...(item.description?.toLowerCase().split(' ') || [])]
        })
      })
    })

    // Add quick actions based on business type
    if (currentBusiness?.type === 'home-services') {
      commands.unshift(
        {
          id: 'new-work-order',
          title: 'New work order',
          description: 'Create a new service request',
          icon: FileText,
          shortcut: '⌘W',
          group: 'Search results',
          action: () => console.log('New work order'),
          keywords: ['work', 'order', 'job', 'service', 'create', 'new']
        },
        {
          id: 'new-estimate',
          title: 'Create new estimate',
          description: 'Generate pricing for customer',
          icon: DollarSign,
          shortcut: '⌘E',
          group: 'Search results',
          action: () => console.log('New estimate'),
          keywords: ['estimate', 'quote', 'pricing', 'create', 'new']
        },
        {
          id: 'new-customer',
          title: 'Add new customer',
          description: 'Add customer to database',
          icon: UserPlus,
          shortcut: '⌘U',
          group: 'Search results',
          action: () => console.log('New customer'),
          keywords: ['customer', 'client', 'add', 'new', 'contact']
        }
      )
    }

    // Add profile and common actions
    commands.push(
      {
        id: 'my-profile',
        title: 'My profile',
        description: 'View and edit your personal profile',
        icon: User,
        shortcut: '⌘K → P',
        group: 'Common actions',
        action: () => window.location.href = '/profile',
        keywords: ['profile', 'personal', 'settings', 'account']
      },
      {
        id: 'team-profile',
        title: 'Team profile',
        description: 'View and edit your team profile',
        icon: Users,
        shortcut: '⌘K → T',
        group: 'Common actions',
        action: () => window.location.href = '/team',
        keywords: ['team', 'profile', 'members', 'staff']
      },
      {
        id: 'invite-colleagues',
        title: 'Invite colleagues',
        description: 'Collaborate with your team on projects',
        icon: UserPlus,
        shortcut: '⌘I',
        group: 'Common actions',
        action: () => console.log('Invite colleagues'),
        keywords: ['invite', 'colleagues', 'team', 'collaborate']
      },
      {
        id: 'support',
        title: 'Support',
        description: 'Our team are here to help if you get stuck',
        icon: HelpCircle,
        shortcut: '⌘H',
        group: 'Common actions',
        action: () => console.log('Support'),
        keywords: ['support', 'help', 'assistance', 'contact']
      }
    )

    return commands
  }, [currentBusiness, currentNavigation])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <>
      <nav className={cn("bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50", className)}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Business Switcher */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors duration-200">
                  Thorbis
                </span>
              </Link>

              {/* Business Switcher */}
              <div className="hidden md:block">
                <BusinessSwitcher
                  currentBusiness={currentBusiness}
                  businesses={businesses}
                  onBusinessSwitch={onBusinessSwitch}
                  onCreateBusiness={onCreateBusiness}
                />
              </div>
            </div>

            {/* Center - Navigation Menu (Desktop) */}
            <div className="hidden lg:flex items-center">
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-neutral-300 hover:text-white transition-colors duration-200"
                  onMouseEnter={() => setIsMenuOpen(true)}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <span className="font-medium">Menu</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Mega Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full pt-2 z-50"
                    onMouseEnter={() => setIsMenuOpen(true)}
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-6 min-w-[800px]">
                      <div className="grid grid-cols-3 gap-8">
                        {currentNavigation.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="space-y-4">
                            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                              {section.title}
                            </h3>
                            <ul className="space-y-1">
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <Link
                                    href={item.href}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-900 transition-colors duration-200 group"
                                  >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-blue-600 transition-colors duration-200">
                                      <item.icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors duration-200" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-200">
                                          {item.name}
                                        </span>
                                        {item.isNew && (
                                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                                            NEW
                                          </span>
                                        )}
                                        {item.badge && (
                                          <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-700 text-neutral-300 rounded">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Search, Notifications, User */}
            <div className="flex items-center gap-2">
              {/* Search / Command Palette */}
              <button 
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all duration-200 group"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-sm text-neutral-500 group-hover:text-neutral-300">Search</span>
                <div className="hidden md:flex items-center gap-0.5 ml-2">
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 group-hover:bg-neutral-700 rounded text-xs transition-colors">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 group-hover:bg-neutral-700 rounded text-xs transition-colors">/</kbd>
                </div>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              {/* Help */}
              <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50">
                    {user && (
                      <>
                        <div className="px-4 py-3 border-b border-neutral-800">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-neutral-400">{user.email}</p>
                          {user.role && (
                            <p className="text-xs text-blue-400 mt-1">{user.role}</p>
                          )}
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profile Settings
                          </Link>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Account Settings
                          </Link>
                          <button className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors w-full text-left">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        commands={businessCommands}
        placeholder={'Search ${currentBusiness?.name || 'Thorbis'}...'}
      />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950 border-b border-neutral-800">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Business Switcher */}
            <div className="md:hidden">
              <BusinessSwitcher
                currentBusiness={currentBusiness}
                businesses={businesses}
                onBusinessSwitch={onBusinessSwitch}
                onCreateBusiness={onCreateBusiness}
              />
            </div>

            {/* Mobile Navigation */}
            {currentNavigation.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        {item.isNew && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-600 text-white rounded ml-auto">
                            NEW
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Export navigation config for reuse
export { navigationConfig }
export type { TopNavItem, TopNavSection }