'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  ChevronRight,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface UnifiedHeaderProps {
  title: string
  description?: string
  industry: 'ai' | 'hs' | 'rest' | 'auto' | 'ret' | 'books' | 'courses' | 'investigations' | 'payroll' | 'banking' | 'lom' | 'marketing'
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showSearch?: boolean
  showNotifications?: boolean
}

const industryConfig = {
  ai: { name: 'AI Assistant', emoji: '🤖', color: 'blue' },
  hs: { name: 'Home Services', emoji: '🏠', color: 'orange' },
  rest: { name: 'Restaurants', emoji: '🍽️', color: 'red' },
  auto: { name: 'Auto Services', emoji: '🚗', color: 'gray' },
  ret: { name: 'Retail', emoji: '🛍️', color: 'green' },
  books: { name: 'Accounting', emoji: '📚', color: 'blue' },
  courses: { name: 'Learning', emoji: '🎓', color: 'purple' },
  investigations: { name: 'Investigations', emoji: '🔍', color: 'indigo' },
  payroll: { name: 'Payroll', emoji: '💼', color: 'teal' },
  banking: { name: 'Banking', emoji: '🏦', color: 'emerald' },
  lom: { name: 'Lease Ops', emoji: '🏢', color: 'slate' },
  marketing: { name: 'Marketing', emoji: '📢', color: 'pink' }
}

export function UnifiedHeader({ 
  title, 
  description, 
  industry, 
  breadcrumbs, 
  actions, 
  showSearch = true, 
  showNotifications = true 
}: UnifiedHeaderProps) {
  const pathname = usePathname()
  const config = industryConfig[industry]

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo + App Info */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold">T</div>
              <span className="font-semibold text-foreground">Thorbis</span>
            </Link>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <span className="font-medium text-foreground">{config.name}</span>
            </div>
          </div>

          {/* Center - Search (if enabled) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Right side - Actions + Notifications + User */}
          <div className="flex items-center gap-3">
            {/* Custom actions */}
            {actions}
            
            {/* Notifications */}
            {showNotifications && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
              </Button>
            )}

            {/* Settings */}
            <Button variant="ghost" size="sm" asChild>
              <Link href={'/${industry}/app/settings'}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            {/* User Profile */}
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom section - Title + Breadcrumbs */}
        <div className="mt-4">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground mb-2">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {breadcrumb.href ? (
                    <Link 
                      href={breadcrumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">
                      {breadcrumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-3 w-3 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
