'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Search, FileText, User, Building, Brain, Clock, Hash, Code, Database, Settings, X, ChevronRight, Star, Zap, Globe, TrendingUp, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextOption {
  id: string
  type: 'file' | 'user' | 'platform' | 'capability' | 'history' | 'code' | 'data' | 'settings'
  label: string
  description?: string
  icon: React.ReactNode
  value: string
  shortcut?: string
  recent?: boolean
  category?: string
  count?: number
}

interface ContextSearchMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (option: ContextOption) => void
  currentIndustry?: string
  recentFiles?: string[]
  position?: { x: number; y: number }
}

export function ContextSearchMenu({
  isOpen,
  onClose,
  onSelect,
  currentIndustry,
  recentFiles = [],
  position
}: ContextSearchMenuProps) {
  const [searchQuery, setSearchQuery] = useState(')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Generate context options organized by categories
  const contextOptions: ContextOption[] = [
    // Quick Actions (Popular)
    {
      id: 'current-file',
      type: 'file',
      category: 'Quick Actions',
      label: 'Current File',
      icon: <FileText className="h-3.5 w-3.5" />,
      value: 'current-file',
      shortcut: '⌘F'
    },
    {
      id: 'ai-tools',
      type: 'capability',
      category: 'Quick Actions',
      label: 'AI Tools',
      icon: <Brain className="h-3.5 w-3.5" />,
      value: 'ai-tools',
      shortcut: '⌘T'
    },
    {
      id: 'platform-context',
      type: 'platform',
      category: 'Quick Actions',
      label: '${currentIndustry?.charAt(0).toUpperCase()}${currentIndustry?.slice(1)} Context',
      icon: <Building className="h-3.5 w-3.5" />,
      value: 'platform-context',
      shortcut: '⌘P'
    },
    
    // Recent Items
    ...recentFiles.slice(0, 2).map((file, index) => ({
      id: 'recent-${index}',
      type: 'file' as const,
      category: 'Recent',
      label: file.split('/').pop() || file,
      icon: <Clock className="h-3.5 w-3.5" />,
      value: file,
      recent: true
    })),
    {
      id: 'conversation-history',
      type: 'history',
      category: 'Recent',
      label: 'Chat History',
      icon: <Clock className="h-3.5 w-3.5" />,
      value: 'conversation-history'
    },

    // Data Sources
    {
      id: 'business-data',
      type: 'data',
      category: 'Data Sources',
      label: 'Business Metrics',
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      value: 'business-data',
      count: 247
    },
    {
      id: 'user-profile',
      type: 'user',
      category: 'Data Sources',
      label: 'User Profile',
      icon: <User className="h-3.5 w-3.5" />,
      value: 'user-profile'
    },
    {
      id: 'project-files',
      type: 'file',
      category: 'Data Sources',
      label: 'Project Files',
      icon: <FileText className="h-3.5 w-3.5" />,
      value: 'project-files',
      count: 42
    },

    // Tools & Features
    {
      id: 'code-analysis',
      type: 'code',
      category: 'Tools',
      label: 'Code Review',
      icon: <Code className="h-3.5 w-3.5" />,
      value: 'code-analysis'
    },
    {
      id: 'web-search',
      type: 'capability',
      category: 'Tools',
      label: 'Web Search',
      icon: <Globe className="h-3.5 w-3.5" />,
      value: 'web-search'
    },
    {
      id: 'user-preferences',
      type: 'settings',
      category: 'Tools',
      label: 'Settings',
      icon: <Settings className="h-3.5 w-3.5" />,
      value: 'user-preferences'
    }
  ]

  // Filter options based on search query
  const filteredOptions = contextOptions.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group filtered options by category
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const category = option.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(option)
    return groups
  }, {} as Record<string, ContextOption[]>)

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[selectedIndex]) {
          onSelect(filteredOptions[selectedIndex])
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [filteredOptions, selectedIndex, onSelect, onClose])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'file': return 'text-blue-400'
      case 'user': return 'text-green-400'
      case 'platform': return 'text-purple-400'
      case 'capability': return 'text-orange-400'
      case 'history': return 'text-yellow-400'
      case 'code': return 'text-cyan-400'
      case 'data': return 'text-pink-400'
      case 'settings': return 'text-neutral-400'
      default: return 'text-neutral-400'
    }
  }

  const totalOptions = filteredOptions.length
  const hasResults = totalOptions > 0

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/60 rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position?.y || '50%',
        left: position?.x || '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)'
      }}
    >
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-neutral-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Add Context</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800/50 rounded transition-colors"
          >
            <X className="h-3.5 w-3.5 text-neutral-500" />
          </button>
        </div>
        
        {/* Compact Search Input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-800/40 border border-neutral-700/50 rounded text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 focus:bg-neutral-800/60 text-xs transition-colors"
          />
        </div>
      </div>

      {/* Compact Options List */}
      <div className="max-h-64 overflow-y-auto">
        {!hasResults ? (
          <div className="p-3 text-center text-neutral-500 text-xs">
            No results found
          </div>
        ) : (
          <div className="p-1.5">
            {Object.entries(groupedOptions).map(([category, options]) => (
              <div key={category} className="mb-2 last:mb-0">
                {/* Category Header */}
                <div className="px-2 py-1 mb-1">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    {category}
                  </span>
                </div>
                
                {/* Category Items */}
                <div className="space-y-0.5">
                  {options.map((option, index) => {
                    const globalIndex = filteredOptions.indexOf(option)
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          onSelect(option)
                          onClose()
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-left transition-all duration-150",
                          globalIndex === selectedIndex
                            ? "bg-blue-500/20 border border-blue-500/30 shadow-sm"
                            : "hover:bg-neutral-800/40 border border-transparent"
                        )}
                      >
                        <div className={cn("flex-shrink-0", getTypeColor(option.type))}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-100 truncate">
                              {option.label}
                            </span>
                            <div className="flex items-center gap-1">
                              {option.count && (
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-700/50 text-neutral-400 rounded">
                                  {option.count}
                                </span>
                              )}
                              {option.recent && (
                                <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                                  New
                                </span>
                              )}
                              {option.shortcut && (
                                <span className="text-xs text-neutral-500 font-mono">
                                  {option.shortcut}
                                </span>
                              )}
                              <ChevronRight className="h-3 w-3 text-neutral-600" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="px-3 py-1.5 border-t border-neutral-800/50 bg-neutral-800/20">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {totalOptions} items
          </span>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  )
}
