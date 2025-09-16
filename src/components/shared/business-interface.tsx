'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSidebar } from '@/components/ui/sidebar'
import { 
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  Wrench,
  Utensils,
  Car,
  Store,
  Building2,
  Brain,
  Clock,
  BookOpen,
  Phone,
  Users,
  Calendar,
  MessageSquare,
  Home,
  Search,
  Command,
  ArrowLeft
} from 'lucide-react'
import { GlobalCommandPalette } from '@/components/navigation/global-command-palette'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { BreadcrumbNavigation } from '@/components/navigation/breadcrumb-navigation'
import { useNavigation } from '@/components/navigation-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const Button = ({ variant, className, children, ...props }: any) => (
  <button className={className} {...props}>
    {children}
  </button>
)

interface BusinessInterfaceProps {
  children: React.ReactNode
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
  currentIndustry?: 'ai' | 'hs' | 'rest' | 'auto' | 'ret' | 'books' | 'courses' | 'investigations' | 'payroll' | 'banking' | 'lom' | 'api' | 'marketing'
  appName?: string
}

export function BusinessInterface({ 
  children,
  user, 
  currentIndustry = "hs"
}: BusinessInterfaceProps) {
  const { navigationState, routeContext } = useNavigation()
  const { toggleSidebar, open, isMobile } = useSidebar()
  const [isDark, setIsDark] = useState(true) // Default to dark mode
  const { isOpen: isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useCommandPalette()
  
  // Use navigation state data instead of hardcoded currentIndustry
  const industry = routeContext.industry || currentIndustry
  const appName = navigationState?.config.appName || 'Dashboard'

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemDark
    setIsDark(shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    // Update document theme
    const documentElement = document.documentElement
    if (newTheme) {
      documentElement.classList.add('dark')
      documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      documentElement.classList.add('light')
      documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  
  // Business configuration - these represent different businesses, not different panels
  const businesses = [
    { 
      id: "thorbis-demo", 
      name: "Thorbis Demo Co.", 
      location: "San Francisco, CA", 
      avatar: "T",
      industries: ["hs", "rest", "auto", "ret"], // Industries this business operates in
      active: true 
    },
    { 
      id: "acme-plumbing", 
      name: "ACME Plumbing", 
      location: "Los Angeles, CA", 
      avatar: "A",
      industries: ["hs"], 
      active: false 
    },
    { 
      id: "downtown-bistro", 
      name: "Downtown Bistro", 
      location: "New York, NY", 
      avatar: "D",
      industries: ["rest"], 
      active: false 
    },
    { 
      id: "quick-lube-pro", 
      name: "Quick Lube Pro", 
      location: "Austin, TX", 
      avatar: "Q",
      industries: ["auto"], 
      active: false 
    }
  ]
  
  const currentBusiness = businesses.find(b => b.active) || businesses[0]

  return (
    <div className="flex h-full flex-col">
      {/* Header with exact styling */}
      <header 
        className="flex shrink-0 bg-neutral-950 py-3 items-center px-4 gap-3 min-h-[60px] transition-all duration-200 shadow-lg shadow-black/50"
        style={{ 
          paddingLeft: '1rem'
        }}
      >
        <button 
          data-sidebar="trigger" 
          className="inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-200 h-8 w-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 -ml-1"
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
          </svg>
          <span className="sr-only">Toggle Sidebar</span>
        </button>


        {/* Business Switcher + Breadcrumb Navigation */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex items-center gap-2 px-2 py-1.5 h-8 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-md text-neutral-100 transition-all duration-200">
                {/* Always show the selected business, not the current panel */}
                <>
                  {/* Compact Business Avatar */}
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white text-xs font-medium">
                    {currentBusiness.avatar}
                  </div>
                  
                  {/* Compact Business Name - Always show the same business */}
                  <span className="text-sm font-medium text-neutral-100 truncate max-w-[120px]">
                    {currentBusiness.name}
                  </span>
                  
                  <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                </>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px] bg-neutral-800 text-neutral-100 shadow-xl rounded-xl p-2 border border-neutral-700/50">
            <DropdownMenuLabel className="text-neutral-300 text-xs font-medium px-3 py-2">Switch Business</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-700/50 my-2" />
            {businesses.map((business) => (
              <DropdownMenuItem
                key={business.id}
                onClick={() => {
                  // Handle business switching logic here
                  console.log('Switching to business:', business.name)
                  // TODO: Implement actual business switching
                }}
                className={'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg ${
                  business.active 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'hover:bg-neutral-700/80 hover:text-white'}'}
              >
                <div className={'flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-medium ${
                  business.active ? 'bg-blue-500' : 'bg-neutral-600'}'}>
                  {business.avatar}
                </div>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {business.name}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {business.location}
                  </div>
                </div>
                {business.active && (
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-neutral-700/50 my-2" />
            <DropdownMenuItem
              onClick={() => {
                // Navigate to all dashboards
                window.location.href = '/dashboards'
              }}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg hover:bg-neutral-700/80 hover:text-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-600 text-white text-xs font-medium">
                <Home className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <div className="text-sm font-medium">All Dashboards</div>
                <div className="text-xs text-neutral-400">Overview & Settings</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Vercel-style Inline Breadcrumb */}
        <BreadcrumbNavigation 
          currentIndustry={industry} 
          className="ml-1 flex items-center" 
          inline={true}
        />
      </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Optional Industry-Specific Action Icons (show separator if present) */}
        {navigationState?.config.header?.actions && navigationState.config.header.actions.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              {navigationState.config.header.actions.slice(0, 3).map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                  title={action.label}
                  aria-label={action.label}
                >
                  {action.icon === 'Phone' && <Phone className="h-4 w-4" />}
                  {action.icon === 'Users' && <Users className="h-4 w-4" />}
                  {action.icon === 'Calendar' && <Calendar className="h-4 w-4" />}
                  {action.icon === 'MessageSquare' && <MessageSquare className="h-4 w-4" />}
                  {action.icon === 'Car' && <Car className="h-4 w-4" />}
                  {action.icon === 'Utensils' && <Utensils className="h-4 w-4" />}
                  {action.icon === 'Store' && <Store className="h-4 w-4" />}
                </Link>
              ))}
            </div>
            {/* Separator - only show if there are industry-specific actions */}
            <div className="w-px h-4 bg-neutral-700/50 mx-2" />
          </>
        )}

        {/* Mandatory Header Icons - Always Present */}
        <div className="flex items-center gap-1.5">
          {/* 1. Global Search Button */}
          <button
            onClick={openCommandPalette}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200 group"
            aria-label="Search (⌘K)"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* 2. Notifications Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center justify-center relative h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full border border-neutral-800"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] bg-neutral-800 text-neutral-100 shadow-xl rounded-xl p-0 border border-neutral-700/50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700/50">
                <h3 className="text-sm font-medium text-neutral-100">Notifications</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Mark all read
                </button>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {/* New Work Order */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-700/30 transition-colors border-b border-neutral-700/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 flex-shrink-0">
                    <Bell className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-100 truncate">New work order assigned</p>
                      <div className="h-2 w-2 bg-blue-400 rounded-full ml-2"></div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">Kitchen sink repair at 123 Main St</p>
                    <p className="text-xs text-neutral-500 mt-1">2 minutes ago</p>
                  </div>
                </div>

                {/* Payment Received */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-700/30 transition-colors border-b border-neutral-700/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 flex-shrink-0">
                    <div className="h-4 w-4 text-green-400">$</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-100 truncate">Payment received</p>
                      <div className="h-2 w-2 bg-green-400 rounded-full ml-2"></div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">Invoice #1234 - $450.00</p>
                    <p className="text-xs text-neutral-500 mt-1">15 minutes ago</p>
                  </div>
                </div>

                {/* Schedule Update */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-700/30 transition-colors border-b border-neutral-700/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-100 truncate">Schedule updated</p>
                    <p className="text-xs text-neutral-400 mt-1">Tomorrow's appointments rescheduled</p>
                    <p className="text-xs text-neutral-500 mt-1">1 hour ago</p>
                  </div>
                </div>

                {/* Team Message */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-700/30 transition-colors border-b border-neutral-700/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-100 truncate">New team message</p>
                    <p className="text-xs text-neutral-400 mt-1">Sarah: "Equipment delivery delayed"</p>
                    <p className="text-xs text-neutral-500 mt-1">3 hours ago</p>
                  </div>
                </div>

                {/* System Update */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-700/30 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-600/50 flex-shrink-0">
                    <Settings className="h-4 w-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-100 truncate">System maintenance</p>
                    <p className="text-xs text-neutral-400 mt-1">Scheduled for tonight at 2:00 AM</p>
                    <p className="text-xs text-neutral-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-neutral-700/50">
                <button className="w-full text-xs text-neutral-400 hover:text-neutral-300 transition-colors text-center">
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Help & Support Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                title="Help & Support"
                aria-label="Help & Support"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] bg-neutral-800 text-neutral-100 shadow-xl rounded-xl p-0 border border-neutral-700/50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-700/50">
                <h3 className="text-sm font-medium text-neutral-100">Help & Support</h3>
                <p className="text-xs text-neutral-400 mt-1">Get help or share feedback</p>
              </div>
              
              {/* Support Options */}
              <div className="p-2">
                {/* Live Chat */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-100">Live Chat</span>
                      <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-neutral-400">Chat with our support team</p>
                  </div>
                </button>

                {/* Call Us */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Phone className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-100">Call Us</span>
                    <p className="text-xs text-neutral-400">(555) 123-4567</p>
                  </div>
                </button>

                {/* Email Support */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-100">Email Support</span>
                    <p className="text-xs text-neutral-400">support@thorbis.com</p>
                  </div>
                </button>

                {/* Separator */}
                <div className="h-px bg-neutral-700/50 my-2 mx-1"></div>

                {/* Request Feature */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                    <svg className="h-4 w-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-100">Request Feature</span>
                    <p className="text-xs text-neutral-400">Suggest new features</p>
                  </div>
                </button>

                {/* Report Bug */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                    <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.058 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-100">Report Bug</span>
                    <p className="text-xs text-neutral-400">Found an issue? Let us know</p>
                  </div>
                </button>

                {/* Knowledge Base */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-100">Knowledge Base</span>
                    <p className="text-xs text-neutral-400">Browse help articles</p>
                  </div>
                </button>

                {/* System Status */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 text-left group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-600/50 group-hover:bg-neutral-600/70 transition-colors">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      <div className="h-1 w-1 bg-neutral-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-100">System Status</span>
                      <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">All Systems Operational</span>
                    </div>
                    <p className="text-xs text-neutral-400">Check service health</p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-neutral-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Response time: ~2 mins</span>
                  <span className="text-xs text-blue-400">24/7 Support</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 4. Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* 5. Settings Button */}
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="inline-flex items-center justify-center h-8 w-8 rounded-full p-0 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-200">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-medium">
                    {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-neutral-800 text-neutral-100 shadow-xl rounded-xl p-2 border border-neutral-700/50">
            <DropdownMenuLabel className="text-neutral-300 px-3 py-2 border-b border-neutral-700/50 mb-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-tight text-neutral-100 truncate">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-xs leading-tight text-neutral-400 truncate">
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg hover:bg-neutral-700/80 hover:text-white">
              <User className="h-4 w-4 text-neutral-400" />
              <span className="text-sm">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg hover:bg-neutral-700/80 hover:text-white">
              <Settings className="h-4 w-4 text-neutral-400" />
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-700/50 my-2" />
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => {
                // Handle logout
                console.log('Logout clicked')
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-950 text-foreground dashboard-content">
        {children}
      </div>

      {/* Global Command Palette */}
      <GlobalCommandPalette
        currentIndustry={industry}
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </div>
  )
}