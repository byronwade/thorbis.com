"use client"

import * as React from "react"
import { cn } from "@thorbis/design/utils"
import { Button } from "./button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./dropdown-menu"
import { 
  Menu, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  ChevronDown,
  Wrench,
  Utensils,
  Car,
  Store,
  Building2
} from "lucide-react"

export interface UnifiedHeaderProps {
  /**
   * Show the industry/app selector
   */
  showIndustrySelector?: boolean
  /**
   * Current active industry
   */
  currentIndustry?: "hs" | "rest" | "auto" | "ret" | "admin"
  /**
   * Show search functionality
   */
  showSearch?: boolean
  /**
   * Show user menu
   */
  showUserMenu?: boolean
  /**
   * Show notifications
   */
  showNotifications?: boolean
  /**
   * Custom logo/title override
   */
  customTitle?: string
  /**
   * Authentication state
   */
  isAuthenticated?: boolean
  /**
   * User data
   */
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
  /**
   * Custom navigation items
   */
  customNavItems?: Array<{
    label: string
    href: string
    active?: boolean
  }>
  /**
   * Callbacks
   */
  onIndustryChange?: (industry: string) => void
  onSearch?: (query: string) => void
  onLogin?: () => void
  onLogout?: () => void
  className?: string
}

const industries = [
  { value: "hs", label: "Home Services", icon: Wrench, href: "/hs" },
  { value: "rest", label: "Restaurant", icon: Utensils, href: "/rest" },
  { value: "auto", label: "Auto Services", icon: Car, href: "/auto" },
  { value: "ret", label: "Retail", icon: Store, href: "/ret" },
  { value: "admin", label: "Admin", icon: Building2, href: "/admin" }
]

export const UnifiedHeader = React.forwardRef<HTMLDivElement, UnifiedHeaderProps>(
  ({ 
    showIndustrySelector = false,
    currentIndustry,
    showSearch = true,
    showUserMenu = true, 
    showNotifications = true,
    customTitle,
    isAuthenticated = false,
    user,
    customNavItems = [],
    onIndustryChange,
    onSearch,
    onLogin,
    onLogout,
    className,
    ...props 
  }, ref) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    const defaultNavItems = [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/docs" }
    ]

    const navItems: Array<{ label: string; href: string; active?: boolean }> = customNavItems.length > 0 ? customNavItems : defaultNavItems

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(searchQuery)
    }

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Industry Selector */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="text-xl font-bold">
                  <span className="text-white">{customTitle || "Thorbis"}</span>
                  <span className="text-blue-500 ml-2">Business OS</span>
                </div>
                
                {showIndustrySelector && currentIndustry && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                        {(() => {
                          const industry = industries.find(i => i.value === currentIndustry)
                          if (!industry) return null
                          const IconComponent = industry.icon
                          return (
                            <>
                              <IconComponent className="h-4 w-4 mr-2" />
                              {industry.label}
                            </>
                          )
                        })()}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Switch Industry</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {industries.map((industry) => (
                        <DropdownMenuItem 
                          key={industry.value}
                          onClick={() => onIndustryChange?.(industry.value)}
                          className={cn(
                            "cursor-pointer",
                            currentIndustry === industry.value && "bg-blue-50 dark:bg-blue-950"
                          )}
                        >
                          <industry.icon className="h-4 w-4 mr-2" />
                          {industry.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-blue-400",
                      item.active
                        ? "text-blue-400" 
                        : "text-neutral-300"
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {showSearch && (
                <div className="hidden md:flex">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search... (⌘K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </form>
                </div>
              )}

              {/* Notifications */}
              {showNotifications && isAuthenticated && (
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></span>
                </Button>
              )}

              {/* User Menu or Auth */}
              {showUserMenu && (
                <>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                          <User className="h-5 w-5 mr-2" />
                          {user?.name || "Account"}
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                          {user?.name || "My Account"}
                          {user?.email && (
                            <div className="text-xs text-neutral-500 font-normal">{user.email}</div>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={onLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                        Sign in
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onLogin}>
                        Get Started
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-neutral-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-neutral-800">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                      item.active
                        ? "text-blue-400 bg-blue-950/50"
                        : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                
                {showSearch && (
                  <div className="px-3 py-2">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </form>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="px-3 py-2 space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-300">
                      Sign in
                    </Button>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={onLogin}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    )
  }
)

UnifiedHeader.displayName = "UnifiedHeader"
