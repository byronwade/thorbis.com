'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  User, 
  UserPlus, 
  HelpCircle, 
  Plus,
  ArrowRight,
  BarChart3,
  Wrench,
  CreditCard,
  Building,
  ChevronDown
} from 'lucide-react'
import { cn } from '../lib/utils'

interface GlobalCommandItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  group: string
  action: () => void
  keywords?: string[]
  recent?: boolean
  featured?: boolean
}

interface GlobalCommandGroup {
  title: string
  items: GlobalCommandItem[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  placeholder?: string
  commands?: GlobalCommandItem[]
  recentCommands?: GlobalCommandItem[]
  onCommandExecute?: (command: GlobalCommandItem) => void
}

// Default commands for home services business
const defaultCommands: GlobalCommandItem[] = [
  // Quick Actions
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
  },
  
  // Navigation
  {
    id: 'dispatch',
    title: 'Dispatch',
    description: 'View technician schedules and assignments',
    icon: Wrench,
    group: 'Common actions',
    action: () => window.location.href = '/dispatch',
    keywords: ['dispatch', 'schedule', 'technician', 'assignment']
  },
  {
    id: 'work-orders',
    title: 'Work Orders',
    description: 'Manage all service requests',
    icon: FileText,
    group: 'Common actions',
    action: () => window.location.href = '/work-orders',
    keywords: ['work', 'orders', 'jobs', 'service', 'requests']
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'View customer database',
    icon: Users,
    group: 'Common actions',
    action: () => window.location.href = '/customers',
    keywords: ['customers', 'clients', 'contacts', 'database']
  },
  {
    id: 'estimates',
    title: 'Estimates',
    description: 'Manage quotes and pricing',
    icon: DollarSign,
    group: 'Common actions',
    action: () => window.location.href = '/estimates',
    keywords: ['estimates', 'quotes', 'pricing', 'bids']
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Billing and payments',
    icon: CreditCard,
    group: 'Common actions',
    action: () => window.location.href = '/invoices',
    keywords: ['invoices', 'billing', 'payments', 'financial']
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Schedule appointments and jobs',
    icon: Calendar,
    group: 'Common actions',
    action: () => window.location.href = '/calendar',
    keywords: ['calendar', 'schedule', 'appointments', 'bookings']
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Business insights and reports',
    icon: BarChart3,
    group: 'Common actions',
    action: () => window.location.href = '/analytics',
    keywords: ['analytics', 'reports', 'insights', 'metrics']
  },
  
  // Profile Actions
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
  
  // Support
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
]

export function CommandPalette({ 
  isOpen, 
  onClose, 
  className,
  placeholder = "Search for actions, people, instruments",
  commands = defaultCommands,
  recentCommands = [],
  onCommandExecute
}: CommandPaletteProps) {
  const [query, setQuery] = useState(')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>(['Actions', 'People', 'Files'])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted (for SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter and group commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) {
      // Show recent commands and featured commands when no query
      const groups: GlobalCommandGroup[] = []
      
      if (recentCommands.length > 0) {
        groups.push({
          title: 'Recent',
          items: recentCommands.slice(0, 3)
        })
      }
      
      // Group default commands
      const groupedCommands = commands.reduce((acc, command) => {
        const group = acc.find(g => g.title === command.group)
        if (group) {
          group.items.push(command)
        } else {
          acc.push({
            title: command.group,
            items: [command]
          })
        }
        return acc
      }, [] as GlobalCommandGroup[])
      
      return [...groups, ...groupedCommands]
    }

    // Filter commands based on query
    const filtered = commands.filter(command => {
      const searchText = query.toLowerCase()
      const titleMatch = command.title.toLowerCase().includes(searchText)
      const descriptionMatch = command.description?.toLowerCase().includes(searchText)
      const keywordMatch = command.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchText)
      )
      
      return titleMatch || descriptionMatch || keywordMatch
    })

    // Group filtered results
    const grouped = filtered.reduce((acc, command) => {
      const group = acc.find(g => g.title === command.group)
      if (group) {
        group.items.push(command)
      } else {
        acc.push({
          title: command.group,
          items: [command]
        })
      }
      return acc
    }, [] as GlobalCommandGroup[])

    return grouped
  }, [query, commands, recentCommands])

  // Get all items in order for keyboard navigation
  const allItems = filteredCommands.reduce((acc, group) => [...acc, ...group.items], [] as GlobalCommandItem[])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % allItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev === 0 ? allItems.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (allItems[selectedIndex]) {
          executeCommand(allItems[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, allItems, selectedIndex, onClose])

  // Execute command
  const executeCommand = (command: GlobalCommandItem) => {
    command.action()
    onCommandExecute?.(command)
    onClose()
    setQuery(')
    setSelectedIndex(0)
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery(')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Add keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  if (!mounted || !isOpen) return null

  // Mock data for demonstration
  const lastSearchResults = [
    { id: 'jason', name: 'Jason Woodheart', email: 'jason@dribbble.com', type: 'person', avatar: '👨', count: 2 },
    { id: 'rob', name: 'Rob Miller', email: 'rob@icloud.com', type: 'person', avatar: '👨', count: null },
    { id: 'hannah', name: 'Hannah Steward', email: 'replied in thread', type: 'person', avatar: '👩', count: 6 }
  ]

  const quickActions = [
    { id: 'new-task', title: 'Create new task', shortcut: 'E', icon: Plus },
    { id: 'new-note', title: 'Create note', shortcut: 'S', icon: Plus },
    { id: 'add-member', title: 'Add member', shortcut: 'R', icon: Plus }
  ]

  const files = [
    { id: 'invoice', name: 'invoice.pdf', type: 'pdf', checked: true, users: ['👨', '👩'], shared: true }
  ]

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[8vh]">
        <div className={cn(
          "relative w-full max-w-2xl bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl overflow-hidden",
          className
        )}>
          {/* Search Input */}
          <div className="flex items-center gap-3 p-5 border-b border-neutral-900">
            <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-neutral-500 border-none outline-none text-base"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-neutral-600"></div>
                  <div className="w-0.5 h-3 bg-neutral-600 ml-0.5"></div>
                </div>
              </div>
              <kbd className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs">⌘F</kbd>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-5 py-4 border-b border-neutral-900">
            <div className="text-sm text-neutral-500 mb-3">I'm looking for...</div>'
            <div className="flex flex-wrap gap-2">
              {['Actions', 'People', 'Companies'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    if (activeFilters.includes(filter)) {
                      setActiveFilters(activeFilters.filter(f => f !== filter))
                    } else {
                      setActiveFilters([...activeFilters, filter])
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                    activeFilters.includes(filter)
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                  )}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filter === 'Actions' && <Wrench className="w-3 h-3" />}
                    {filter === 'People' && <Users className="w-3 h-3" />}
                    {filter === 'Companies' && <Building className="w-3 h-3" />}
                  </div>
                  {filter}
                  {activeFilters.includes(filter) && (
                    <button className="w-4 h-4 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center ml-1">
                      <span className="text-xs">×</span>
                    </button>
                  )}
                </button>
              ))}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700">
                More
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div 
            ref={listRef}
            className="max-h-96 overflow-y-auto"
          >
            {/* Last Search Section */}
            <div className="p-5 border-b border-neutral-900">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                <span>Last search</span>
                <span className="bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded-full text-xs border border-neutral-800">3</span>
              </div>
              <div className="space-y-2">
                {lastSearchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => executeCommand({ ...result, title: result.name, action: () => console.log('Navigate to', result.name), group: 'People', icon: User })}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left border",
                      index === 0 && selectedIndex === 0 
                        ? "bg-blue-500/5 border-blue-500/20 text-blue-400" 
                        : "hover:bg-neutral-950 border-transparent hover:border-neutral-800"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      {result.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{result.name}</div>
                      <div className="text-sm text-neutral-500">{result.email}</div>
                    </div>
                    {result.count && (
                      <div className="flex items-center gap-2 text-neutral-500">
                        <div className="w-4 h-4 border border-neutral-700 rounded"></div>
                        <span className="text-sm">{result.count}</span>
                      </div>
                    )}
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-1 h-1 bg-neutral-700 rounded-full"></div>
                      <div className="w-1 h-1 bg-neutral-700 rounded-full ml-1"></div>
                      <div className="w-1 h-1 bg-neutral-700 rounded-full ml-1"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="p-5 border-b border-neutral-900">
              <div className="text-sm text-neutral-500 mb-4">Quick actions</div>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeCommand({ ...action, description: action.title, action: () => console.log('Execute', action.title), group: 'Actions', icon: action.icon })}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-950 hover:border-neutral-800 transition-colors text-left border border-transparent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-white font-medium">{action.title}</div>
                    <kbd className="px-2 py-1 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded text-xs">{action.shortcut}</kbd>
                  </button>
                ))}
              </div>
            </div>

            {/* Files Section */}
            <div className="p-5">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                <span>Files</span>
                <span className="bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded-full text-xs border border-neutral-800">1</span>
              </div>
              <div className="space-y-2">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => executeCommand({ ...file, title: file.name, description: 'PDF Document', action: () => console.log('Open', file.name), group: 'Files', icon: FileText })}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-950 hover:border-neutral-800 transition-colors text-left border border-transparent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{file.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.checked && (
                        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      <div className="flex -space-x-1">
                        {file.users.map((avatar, i) => (
                          <div key={i} className="w-5 h-5 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center text-xs">
                            {avatar}
                          </div>
                        ))}
                      </div>
                      {file.shared && (
                        <button className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs hover:bg-blue-500/20">
                          <ArrowRight className="w-3 h-3" />
                          Share
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Hook to use command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        toggle()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

export type { GlobalCommandItem, GlobalCommandGroup, CommandPaletteProps }