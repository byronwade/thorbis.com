'use client'

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import '../../styles/sidebar-animations.css'
import {
  Plus,
  Search,
  History as HistoryIcon,
  Image as ImageIcon,
  MoreHorizontal,
  Settings,
  Code2,
  Home,
  Brain,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Target,
  GraduationCap,
  BarChart3,
  Wrench,
  ChevronDown,
  ChevronRight,
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

interface AISidebarProps {
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
    { name: "Dashboard", href: "/dashboards/ai", icon: Brain, description: "AI assistant and automation" },
    { name: "Money", href: `/dashboards/money${fromParam}`, icon: DollarSign, description: "Financial management and reporting" },
    { name: "Marketing", href: `/dashboards/marketing${fromParam}`, icon: Target, description: "Customer acquisition and campaigns" },
    { name: "Courses", href: `/dashboards/courses${fromParam}`, icon: GraduationCap, description: "Training and knowledge base" },
    { name: "Integrations", href: `/dashboards/integrations${fromParam}', icon: Plug, description: "Third-party service connections and API management" },
    { name: "Analytics", href: '/dashboards/books${fromParam}', icon: BarChart3, description: "Business intelligence and insights" }
  ]
  
  // Only add Home Services if we're not coming from HS (no back button)'
  if (!fromIndustry || fromIndustry !== 'hs') {
    navigation.splice(1, 0, { name: "Home Services", href: '/dashboards/hs${fromParam}', icon: Wrench, description: "Home Services dashboard" })
  }
  
  return navigation
}

// AI-specific navigation
const aiNavigation = [
  {
    title: "AI Assistant",
    items: [
      { name: "Chat", href: "/dashboards/ai/chat", icon: MessageSquare, description: "AI chat interface" },
      { name: "Prompts", href: "/dashboards/ai/prompts", icon: Sparkles, description: "Prompt library" },
      { name: "Models", href: "/dashboards/ai/models", icon: Brain, description: "AI model selection" },
    ]
  }
]

// Example AI chat history
const exampleChats = [
  { id: '1', title: 'Material labor breakdown', href: '/dashboards/ai/chat/68bb40f2-b3ec-8325-b980-1e168762ecc5' },
  { id: '2', title: 'Banking app UI inspiration', href: '/dashboards/ai/chat/68b9ade5-c2c8-8333-927e-4335688843c3' },
  { id: '3', title: 'Cutting and capping copper', href: '/dashboards/ai/chat/68b8cb39-0124-8328-b296-87c3f4919909' },
  { id: '4', title: 'Bookkeeping vs Accounting', href: '/dashboards/ai/chat/68b72333-cf64-8329-8171-04327b840aee' },
  { id: '5', title: 'Water heater options summary', href: '/dashboards/ai/chat/68b87dc2-678c-8332-a03a-08f3015e8a90' },
  { id: '6', title: 'Shorten standpipe guidance', href: '/dashboards/ai/chat/68b84b9d-aaf8-8332-a829-4544b2516711' },
  { id: '7', title: 'Email and affidavit draft', href: '/dashboards/ai/chat/68b6dbd5-aa4c-8333-8d14-775c73f1be3c' },
  { id: '8', title: 'Chat bot data integration', href: '/dashboards/ai/chat/68b62ec6-5ea4-8330-a0e2-21616c986a9a' },
]

export function AISidebar({ user: _user, parentIndustry }: AISidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null)
  const [previousPath, setPreviousPath] = useState<string | null>(null)
  const [showInitialAnimation, setShowInitialAnimation] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'overview': false,
    'ai-quick-actions': false,
    'ai-assistant': false,
    'recent-chats': false,
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
                  <span className="truncate font-semibold">AI Assistant</span>
                  <span className="truncate text-xs">Intelligent Automation</span>
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
                animationClass = `menu-item-animate-${animationDirection} menu-item-stagger-${index + 1}`
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

        {/* AI Quick Actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { name: "New Chat", icon: Plus, action: true },
                { name: "Search", icon: Search, action: true },
                { name: "History", icon: HistoryIcon, href: "/dashboards/ai/history" },
                { name: "Media", icon: ImageIcon, href: "/dashboards/ai/media" }
              ].map((item, index) => {
                const Icon = item.icon
                const quickActionIndex = mainNavigation.length + index // Continue stagger after main navigation
                const staggerClass = `menu-item-stagger-${Math.min(quickActionIndex + 1, 15)}`
                
                // Determine animation class
                let animationClass = `
                if (showInitialAnimation) {
                  animationClass = `menu-item-initial-load ${staggerClass}`
                } else if (animationDirection) {
                  animationClass = `menu-item-animate-${animationDirection} ${staggerClass}'
                }
                
                return (
                  <SidebarMenuItem key={item.name} className={animationClass}>
                    {item.href ? (
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Navigation */}
        {aiNavigation.map((section, sectionIndex) => {
          const baseIndex = mainNavigation.length + 4 // Start after main nav + quick actions (4 items)
          return (
            <SidebarGroup key={sectionIndex}>
              {section.title && (
                <SidebarGroupLabel>
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const globalIndex = baseIndex + (sectionIndex * 5) + itemIndex // Create unique stagger index
                    const staggerClass = globalIndex <= 14 ? 'menu-item-stagger-${Math.min(globalIndex + 1, 15)}' : '`
                    
                    // Determine animation class
                    let animationClass = '`
                    if (showInitialAnimation) {
                      animationClass = `menu-item-initial-load ${staggerClass}`
                    } else if (animationDirection) {
                      animationClass = `menu-item-animate-${animationDirection} ${staggerClass}'
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
          )
        })}

        {/* Chat History */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {exampleChats.map((chat, index) => {
                const chatHistoryIndex = mainNavigation.length + 4 + 3 + index // After main nav + quick actions + AI nav items
                const staggerClass = chatHistoryIndex <= 14 ? 'menu-item-stagger-${Math.min(chatHistoryIndex + 1, 15)}' : '`
                
                // Determine animation class
                let animationClass = '`
                if (showInitialAnimation) {
                  animationClass = `menu-item-initial-load ${staggerClass}'
                } else if (animationDirection) {
                  animationClass = 'menu-item-animate-${animationDirection} ${staggerClass}'
                }
                
                return (
                  <SidebarMenuItem key={chat.id} className={animationClass}>
                    <div className="relative group">
                      <SidebarMenuButton asChild>
                        <Link href={chat.href}>
                          <span className="truncate text-sm">{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <button
                        className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100 transition-all duration-200"
                        aria-label="Chat options"
                        type="button"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
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