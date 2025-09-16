'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import '../../styles/sidebar-animations.css'
import {
  Calendar,
  Users,
  Calculator,
  Receipt,
  BookOpen,
  MessageSquare,
  Package,
  Home,
  Settings,
  Code2,
} from "lucide-react"
import { ThorbisLogo } from "@/components/shared/thorbis-logo"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface HSSidebarProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
}

// Home Services top-level navigation
const homeServicesNavigation = [
  { name: "Dashboard", href: "/dashboards/hs", icon: Home, description: "Home Services business overview" },
  { name: "Price Book", href: "/dashboards/hs/pricebook", icon: BookOpen, description: "Services, materials, and pricing" },
  { name: "Invoices", href: "/dashboards/hs/invoices", icon: Receipt, description: "Billing and collections" },
  { name: "Estimates", href: "/dashboards/hs/estimates", icon: Calculator, description: "Quotes and proposals" },
  { name: "Schedule", href: "/dashboards/hs/schedule", icon: Calendar, description: "Daily schedule and appointments" },
  { name: "Inventory", href: "/dashboards/hs/inventory", icon: Package, description: "Parts and materials tracking" },
  { name: "Communications", href: "/dashboards/hs/inbox", icon: MessageSquare, description: "Customer and team communications" },
  { name: "Customers", href: "/dashboards/hs/customers", icon: Users, description: "Customer database and history" },
  { name: "Developers", href: "/developers", icon: Code2, description: "API documentation and developer tools" },
  { name: "Settings", href: "/dashboards/settings", icon: Settings, description: "System settings and configuration" }
]

// HS-specific sub navigation (industry-specific features)
const hsNavigation = [
  {
    title: "Schedule & Dispatch",
    items: [
      { name: "Schedule", href: "/dashboards/hs/schedule", icon: Calendar, description: "Daily schedule and appointments" },
      { name: "Dispatch Board", href: "/dashboards/hs/dispatch", icon: Compass, description: "Real-time job assignment and routing" },
      { name: "Jobs", href: "/dashboards/hs/jobs", icon: Clipboard, description: "All work orders and job history" }
    ]
  },
  {
    title: "Customers & Sales",
    items: [
      { name: "Customers", href: "/dashboards/hs/customers", icon: Users, description: "Customer database and history" },
      { name: "Estimates", href: "/dashboards/hs/estimates", icon: Calculator, description: "Quotes and proposals" },
      { name: "Invoices", href: "/dashboards/hs/invoices", icon: Receipt, description: "Billing and collections" },
      { name: "Price Book", href: "/dashboards/hs/pricebook", icon: BookOpen, description: "Services, materials, and pricing" }
    ]
  },
  {
    title: "Communications",
    items: [
      { name: "Inbox", href: "/dashboards/hs/inbox", icon: MessageSquare, description: "Customer and team communications" },
      { name: "Leads", href: "/dashboards/hs/leads", icon: UserPlus, description: "New customer opportunities" },
      { name: "Customer Service", href: "/dashboards/hs/customer-service", icon: Phone, description: "Support and service requests" }
    ]
  },
  {
    title: "Team & Operations",
    items: [
      { name: "Technicians", href: "/dashboards/hs/technicians", icon: UserCheck, description: "Field team management" },
      { name: "Inventory", href: "/dashboards/hs/inventory", icon: Package, description: "Parts and materials tracking" },
      { name: "Reports", href: "/dashboards/hs/reports", icon: BarChart3, description: "Business performance insights" }
    ]
  }
]

export function HSSidebar({ user: _user }: HSSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null)
  const [previousPath, setPreviousPath] = useState<string | null>(null)
  const [showInitialAnimation, setShowInitialAnimation] = useState(true)

  // Handle initial animation on component mount
  useEffect(() => {
    if (showInitialAnimation) {
      const timer = setTimeout(() => {
        setShowInitialAnimation(false)
      }, 180) // Allow all staggered animations to complete
      return () => clearTimeout(timer)
    }
  }, [showInitialAnimation])

  // Track navigation direction based on URL changes
  useEffect(() => {
    if (previousPath && previousPath !== pathname) {
      // Disable initial animation if navigation occurs
      setShowInitialAnimation(false)
      
      // Improved direction detection
      const previousSegments = previousPath.split('/').filter(Boolean)
      const currentSegments = pathname.split('/').filter(Boolean)
      
      // Check if navigating back to a parent/higher level
      const isNavigatingUp = currentSegments.length < previousSegments.length
      
      // Check if navigating to a sibling or deeper path
      const isNavigatingForward = currentSegments.length >= previousSegments.length
      
      // Special cases for query parameters (shared dashboard navigation)
      const hasFromParam = pathname.includes('?from=')
      const previousHasFromParam = previousPath.includes('?from=')
      
      if (isNavigatingUp || (previousHasFromParam && !hasFromParam)) {
        setAnimationDirection('back')
      } else if (isNavigatingForward || (!previousHasFromParam && hasFromParam)) {
        setAnimationDirection('forward')
      } else {
        setAnimationDirection('forward') // Default to forward
      }
      
      // Reset animation after animation completes
      const animationDuration = 150 // Max stagger delay + animation duration
      setTimeout(() => setAnimationDirection(null), animationDuration)
    }
    setPreviousPath(pathname)
  }, [pathname, previousPath])

  
  return (
    <Sidebar variant="inset" className="sidebar-content">
        <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboards" className="relative">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ThorbisLogo size="md" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Home Services</span>
                  <span className="truncate text-xs">Field Service Management</span>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle settings click
                    }}
                    title="Settings"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Home Services Navigation - Simplified flat structure */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {homeServicesNavigation.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                // Determine animation class
                let animationClass = ''
                if (showInitialAnimation) {
                  animationClass = `menu-item-initial-load menu-item-stagger-${index + 1}'
                } else if (animationDirection) {
                  animationClass = 'menu-item-animate-${animationDirection} menu-item-stagger-${index + 1}'
                }
                
                return (
                  <SidebarMenuItem key={item.name} className={animationClass}>
                    <SidebarMenuButton asChild tooltip={item.description} isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}