'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Hash, 
  ArrowRight, 
  Clock, 
  Star,
  Wrench,
  Utensils,
  Car,
  Store,
  Brain,
  BookOpen,
  Building2,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  Home,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon?: React.ElementType
  href: string
  category: 'navigation' | 'recent' | 'industries' | 'actions'
  keywords: string[]
}

interface GlobalCommandPaletteProps {
  currentIndustry?: string
  isOpen: boolean
  onClose: () => void
}

export function GlobalCommandPalette({ currentIndustry = 'hs', isOpen, onClose }: GlobalCommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState(')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentItems, setRecentItems] = useState<string[]>([])

  // Command items database
  const commandItems: CommandItem[] = [
    // Navigation
    { id: 'home', title: 'Dashboard Home', icon: Home, href: '/dashboards', category: 'navigation', keywords: ['home', 'dashboard', 'main'] },
    { id: 'analytics', title: 'Analytics Dashboard', icon: BarChart3, href: '/dashboards/(shared)/analytics', category: 'navigation', keywords: ['analytics', 'metrics', 'reports'] },
    { id: 'money', title: 'Financial Management', icon: DollarSign, href: '/dashboards/(shared)/money', category: 'navigation', keywords: ['money', 'finance', 'accounting'] },
    { id: 'ai', title: 'AI Assistant', icon: Brain, href: '/dashboards/(shared)/ai', category: 'navigation', keywords: ['ai', 'assistant', 'chat'] },
    
    // Industries
    { id: 'hs', title: 'Home Services', description: 'Dispatch, work orders, technician management', icon: Wrench, href: '/dashboards/(verticals)/hs/(dashboard)', category: 'industries', keywords: ['home', 'services', 'plumbing', 'hvac', 'dispatch'] },
    { id: 'rest', title: 'Restaurant', description: 'POS, kitchen, reservations, staff', icon: Utensils, href: '/dashboards/(verticals)/rest', category: 'industries', keywords: ['restaurant', 'pos', 'kitchen', 'food'] },
    { id: 'auto', title: 'Auto Services', description: 'Repair orders, parts, service bays', icon: Car, href: '/dashboards/(verticals)/auto', category: 'industries', keywords: ['auto', 'repair', 'automotive', 'mechanic'] },
    { id: 'ret', title: 'Retail', description: 'Inventory, sales, customers', icon: Store, href: '/dashboards/(verticals)/ret', category: 'industries', keywords: ['retail', 'inventory', 'sales', 'customers'] },
    { id: 'courses', title: 'Learning Platform', description: 'Courses, certifications, training', icon: BookOpen, href: '/dashboards/(shared)/courses', category: 'industries', keywords: ['courses', 'learning', 'training', 'education'] },
    
    // Current Industry Actions (Home Services example)
    ...(currentIndustry === 'hs' ? [
      { id: 'hs-customers', title: 'View Customers', description: 'Customer database and history', icon: Users, href: '/dashboards/hs/customers', category: 'actions', keywords: ['customers', 'clients', 'contacts'] },
      { id: 'hs-dispatch', title: 'Dispatch Board', description: 'Schedule and manage technicians', icon: Calendar, href: '/dashboards/hs/dispatch', category: 'actions', keywords: ['dispatch', 'schedule', 'technicians'] },
      { id: 'hs-invoices', title: 'Create Invoice', description: 'Generate customer invoices', icon: DollarSign, href: '/dashboards/hs/invoices', category: 'actions', keywords: ['invoice', 'billing', 'payment'] },
    ] : []),
    
    // Quick Actions
    { id: 'settings', title: 'Settings', icon: Settings, href: '/dashboards/settings', category: 'actions', keywords: ['settings', 'preferences', 'config'] },
  ]

  // Load recent items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('thorbis_recent_navigation')
    if (saved) {
      setRecentItems(JSON.parse(saved))
    }
  }, [])

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) {
      return commandItems.slice(0, 8) // Show top items when no query
    }

    const searchQuery = query.toLowerCase()
    return commandItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
    ).slice(0, 10)
  }, [query, commandItems])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filteredItems.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev === 0 ? filteredItems.length - 1 : prev - 1)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredItems, onClose])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle item selection
  const handleItemSelect = useCallback((item: CommandItem) => {
    // Add to recent items
    const updatedRecent = [item.id, ...recentItems.filter(id => id !== item.id)].slice(0, 5)
    setRecentItems(updatedRecent)
    localStorage.setItem('thorbis_recent_navigation', JSON.stringify(updatedRecent))
    
    // Navigate
    router.push(item.href)
    onClose()
    setQuery(')
  }, [router, onClose, recentItems])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-[9999] mx-4">
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-neutral-700">
            <Search className="h-5 w-5 text-neutral-400 mr-3" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-400 outline-none text-lg"
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">↑↓</kbd>
              <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">↵</kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-neutral-500 mx-auto mb-3" />
                <p className="text-neutral-400">No results found</p>
                <p className="text-neutral-500 text-sm mt-1">Try searching for industries, features, or actions</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Group by category */}
                {['industries', 'navigation', 'actions'].map(category => {
                  const categoryItems = filteredItems.filter(item => item.category === category)
                  if (categoryItems.length === 0) return null

                  const categoryLabels = {
                    industries: 'Industries',
                    navigation: 'Navigation', 
                    actions: 'Quick Actions'
                  }

                  return (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </div>
                      {categoryItems.map((item, index) => {
                        const globalIndex = filteredItems.indexOf(item)
                        const isSelected = globalIndex === selectedIndex
                        const Icon = item.icon

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
                              isSelected 
                                ? "bg-blue-500/20 border-l-2 border-blue-400" 
                                : "hover:bg-neutral-700/50"
                            )}
                          >
                            {Icon && (
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                isSelected ? "bg-blue-500 text-white" : "bg-neutral-700 text-neutral-300"
                              )}>
                                <Icon className="h-4 w-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-neutral-100 truncate">
                                {item.title}
                              </div>
                              {item.description && (
                                <div className="text-sm text-neutral-400 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {recentItems.includes(item.id) && (
                              <Clock className="h-4 w-4 text-neutral-500" />
                            )}
                            <ArrowRight className={cn(
                              "h-4 w-4 transition-opacity",
                              isSelected ? "text-blue-400 opacity-100" : "text-neutral-500 opacity-0"
                            )} />
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}