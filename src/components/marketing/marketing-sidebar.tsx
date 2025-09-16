'use client'

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import '../../styles/sidebar-animations.css'
import {
  MessageSquare,
  Users,
  Target,
  UserPlus,
  Heart,
  BarChart3,
  TrendingUp,
  Home,
  Settings,
  Code2,
  Mail,
  Share2,
  Megaphone,
  ArrowLeft,
  DollarSign,
  Brain,
  GraduationCap,
  Wrench,
  Plug,
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
import { CollapsibleSidebarGroup } from "@/components/ui/collapsible-sidebar-group"

interface MarketingSidebarProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
  parentIndustry?: string
}

// Main navigation items (shared dashboards) - same pattern as mainNavigationItems
const generateMainNavigation = (fromIndustry?: string) => {
  const fromParam = fromIndustry ? '?from=${fromIndustry}' : '`
  const navigation = [
    { name: "Dashboard", href: "/dashboards/marketing", icon: Target, description: "Marketing growth overview" },
    { name: "Money", href: `/dashboards/money${fromParam}`, icon: DollarSign, description: "Financial management and reporting" },
    { name: "Courses", href: `/dashboards/courses${fromParam}`, icon: GraduationCap, description: "Training and knowledge base" },
    { name: "AI Chat", href: `/dashboards/ai${fromParam}`, icon: Brain, description: "AI assistant and automation" },
    { name: "Integrations", href: `/dashboards/integrations${fromParam}', icon: Plug, description: "Third-party service connections and API management" },
    { name: "Analytics", href: '/dashboards/books${fromParam}', icon: BarChart3, description: "Business intelligence and insights" }
  ]
  
  // Only add Home Services if we're not coming from HS (no back button)'
  if (!fromIndustry || fromIndustry !== 'hs') {
    navigation.splice(1, 0, { name: "Home Services", href: '/dashboards/hs${fromParam}', icon: Wrench, description: "Home Services dashboard" })
  }
  
  return navigation
}

// Marketing-specific navigation
const marketingNavigation = [
  {
    title: "Campaigns",
    items: [
      { name: "Email Campaigns", href: "/dashboards/marketing/email", icon: Mail, description: "Email marketing automation" },
      { name: "Social Media", href: "/dashboards/marketing/social", icon: Share2, description: "Social media management" },
      { name: "Advertising", href: "/dashboards/marketing/ads", icon: Megaphone, description: "Paid advertising campaigns" }
    ]
  },
  {
    title: "Leads & Customers",
    items: [
      { name: "Lead Generation", href: "/dashboards/marketing/leads", icon: UserPlus, description: "Lead capture and nurturing" },
      { name: "Customer Segments", href: "/dashboards/marketing/segments", icon: Users, description: "Customer segmentation" },
      { name: "Referral Program", href: "/dashboards/marketing/referrals", icon: Heart, description: "Customer referral system" }
    ]
  },
  {
    title: "Analytics",
    items: [
      { name: "Campaign Performance", href: "/dashboards/marketing/performance", icon: BarChart3, description: "Marketing ROI and metrics" },
      { name: "Website Analytics", href: "/dashboards/marketing/website", icon: TrendingUp, description: "Website traffic and conversions" },
      { name: "Attribution", href: "/dashboards/marketing/attribution", icon: Target, description: "Multi-touch attribution analysis" }
    ]
  }
]

export function MarketingSidebar({ user: _user, parentIndustry }: MarketingSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null)
  const [previousPath, setPreviousPath] = useState<string | null>(null)
  const [showInitialAnimation, setShowInitialAnimation] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'overview': false,
    'campaigns': false,
    'leads-customers': false,
    'analytics': false,
  })
  
  // Detect parent industry from props, query parameter, or URL
  const detectedIndustry = parentIndustry || (() => {
    // Check URL query parameter first
    const fromParam = searchParams.get('from')
    if (fromParam && ['hs', 'auto', 'rest', 'ret'].includes(fromParam)) {
      return fromParam
    }
    
    // Fallback to URL segments
    const segments = pathname.split('/')
    const industryIndex = segments.findIndex(seg => ['hs', 'auto', 'rest', 'ret'].includes(seg))
    return industryIndex !== -1 ? segments[industryIndex] : null
  })()

  const mainNavigation = generateMainNavigation(detectedIndustry || undefined)

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

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const industryNames: Record<string, string> = {
    hs: 'Home Services',
    auto: 'Auto Services', 
    rest: 'Restaurant',
    ret: 'Retail'
  }

  const handleBackClick = () => {
    if (detectedIndustry) {
      router.push('/dashboards/${detectedIndustry}')
    } else {
      router.back()
    }
  }
  
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
                  <span className="truncate font-semibold">Marketing Hub</span>
                  <span className="truncate text-xs">Growth & Campaigns</span>
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
        {/* Back button if we have a parent industry */}
        {detectedIndustry && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackClick} className="cursor-pointer">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to {industryNames[detectedIndustry]}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation - Shared dashboards at the top */}
        <CollapsibleSidebarGroup
          title="Overview"
          sectionKey="overview"
          isCollapsed={collapsedSections['overview']}
          onToggle={toggleSection}
        >
          <SidebarMenu>
            {mainNavigation.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href.includes('?from=') && pathname === item.href.split('?`)[0])
              
              // Determine animation class
              let animationClass = `
              if (showInitialAnimation) {
                animationClass = `menu-item-initial-load menu-item-stagger-${index + 1}`
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
        </CollapsibleSidebarGroup>

        {/* Marketing-Specific Navigation */}
        {marketingNavigation.map((section, sectionIndex) => {
          const baseIndex = mainNavigation.length // Start stagger after main navigation
          const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
          return (
            <CollapsibleSidebarGroup
              key={sectionIndex}
              title={section.title}
              sectionKey={sectionKey}
              isCollapsed={collapsedSections[sectionKey]}
              onToggle={toggleSection}
            >
              <SidebarMenu>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const globalIndex = baseIndex + (sectionIndex * 5) + itemIndex // Create unique stagger index
                  const staggerClass = globalIndex <= 14 ? 'menu-item-stagger-${Math.min(globalIndex + 1, 15)}' : '`
                  
                  // Determine animation class
                  let animationClass = '`
                  if (showInitialAnimation) {
                    animationClass = `menu-item-initial-load ${staggerClass}'
                  } else if (animationDirection) {
                    animationClass = 'menu-item-animate-${animationDirection} ${staggerClass}'
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
            </CollapsibleSidebarGroup>
          )
        })}
        
        {/* Bottom Navigation */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboards">
                      <Home />
                      <span>All Dashboards</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/developers">
                      <Code2 />
                      <span>Developers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboards/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}