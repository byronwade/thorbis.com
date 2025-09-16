'use client'

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Home, DollarSign, Target, BookOpen, Brain, BarChart3, Plug, Monitor, Code2, Settings, Bell, HelpCircle, MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"
import { ThorbisLogo } from "./thorbis-logo"
import { useNavigation } from "@/components/navigation-context"
import { useRouter, usePathname } from "next/navigation"
import { hsNavigationConfig } from "@/app/(auth)/dashboards/(verticals)/hs/navigation.config"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

interface SharedFeatureSidebarProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
}

export function SharedFeatureSidebar({ user: _user }: SharedFeatureSidebarProps) {
  const { navigationState, routeContext } = useNavigation()
  const router = useRouter()
  const pathname = usePathname()

  // State to manage collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())

  // Function to check if a route is active
  const isRouteActive = (href: string): boolean => {
    if (!pathname) return false
    
    // Remove query parameters from both href and pathname for comparison
    const cleanHref = href.split('?')[0]
    const cleanPathname = pathname.split('?')[0]
    
    // Exact match - this is the most precise check
    if (cleanPathname === cleanHref) return true
    
    // For dashboard root routes only (e.g., /dashboards/hs, /dashboards/money)
    // Only match if we're exactly on that base route, not sub-routes'
    if (cleanHref.match(/^\/dashboards\/[^\/]+$/)) {
      return cleanPathname === cleanHref
    }
    
    return false
  }

  const toggleSection = (index: number) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index)
    } else {
      newCollapsed.add(index)
    }
    setCollapsedSections(newCollapsed)
  }

  // Use the config from navigationState if available
  const config = navigationState?.config
  
  
  if (!config) {
    return (
      <Sidebar variant="inset" className="sidebar-content">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <ThorbisLogo size="sm" />
            <span className="font-semibold">Loading...</span>
          </div>
        </SidebarHeader>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="inset" className="sidebar-content">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <ThorbisLogo size="md" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{config.appName}</span>
              <span className="truncate text-xs">Business OS</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>

        {/* Home Services Section - Show on all Home Services routes */}
        {(() => {
          // Check if we're on any Home Services route
          const isHomeServicesRoute = pathname?.startsWith('/dashboards/hs/')
          
          // Get the Home Services section from the HS config or current config
          const homeServicesSection = isHomeServicesRoute 
            ? hsNavigationConfig.sections.find(section => section.title === 'Home Services')
            : config.sections.find(section => section.title === 'Home Services')
          
          if (homeServicesSection) {
            const isCollapsed = collapsedSections.has(-1)
            
            return (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <h2 
                  data-sidebar="group-label" 
                  className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider group/collapsible"
                >
                  <button 
                    className="flex items-center justify-between w-full text-left hover:text-neutral-100 transition-colors"
                    onClick={() => toggleSection(-1)}
                  >
                    <span>Home Services</span>
                    <ChevronDown 
                      className={'h-3 w-3 text-neutral-500 group-hover/collapsible:text-neutral-300 transition-transform duration-200 ${
                        isCollapsed ? 'rotate-180' : `}`}
                    />
                  </button>
                </h2>
                
                {!isCollapsed && (
                  <div data-sidebar="group-content" className="w-full">
                    <div className="grid grid-cols-2 gap-2">
                      {homeServicesSection.items.map((item) => {
                        const Icon = item.icon
                        const isActive = isRouteActive(item.href)
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            title={item.description}
                            className={isActive 
                              ? `
                        flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-all duration-200
                        hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                        bg-neutral-800 border-neutral-700 text-white shadow-sm`
                              : '
                        flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-all duration-200
                        hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                        bg-neutral-900/50 border-neutral-800/50 text-neutral-300 hover:bg-neutral-800/60 hover:border-neutral-700 hover:text-neutral-100'}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          }
          return null
        })()}

        {/* Applications Section with Universal Navigation Button Tiles */}
        <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
          <h2 
            data-sidebar="group-label" 
            className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider group/collapsible"
          >
            <button 
              className="flex items-center justify-between w-full text-left hover:text-neutral-100 transition-colors"
              onClick={() => toggleSection(-2)}
            >
              <span>Applications</span>
              <ChevronDown 
                className={'h-3 w-3 text-neutral-500 group-hover/collapsible:text-neutral-300 transition-transform duration-200 ${
                  collapsedSections.has(-2) ? 'rotate-180' : '}'}
              />
            </button>
          </h2>
          
          {!collapsedSections.has(-2) && (
            <div data-sidebar="group-content" className="w-full">
              <div className="grid grid-cols-2 gap-2">
              {(() => {
                // Determine the current context for navigation
                const currentIndustry = navigationState?.backContext?.href?.includes('dashboards/') 
                  ? navigationState.backContext.href.split('/')[2] 
                  : routeContext?.industry || 'hs'

                // Universal navigation items
                const universalNavItems = [
                  {
                    name: 'Money',
                    href: '/dashboards/money?from=${currentIndustry}',
                    icon: DollarSign,
                    description: 'Financial management'
                  },
                  {
                    name: 'Marketing',
                    href: '/dashboards/marketing?from=${currentIndustry}',
                    icon: Target,
                    description: 'Marketing campaigns'
                  },
                  {
                    name: 'Courses',
                    href: '/dashboards/courses?from=${currentIndustry}',
                    icon: BookOpen,
                    description: 'Learning management'
                  },
                  {
                    name: 'AI Chat',
                    href: '/dashboards/ai?from=${currentIndustry}',
                    icon: Brain,
                    description: 'AI assistance'
                  },
                  {
                    name: 'Analytics',
                    href: '/dashboards/analytics?from=${currentIndustry}',
                    icon: BarChart3,
                    description: 'Data insights'
                  },
                  {
                    name: 'Integrations',
                    href: '/dashboards/integrations?from=${currentIndustry}',
                    icon: Plug,
                    description: 'Third-party service connections and API management'
                  },
                  {
                    name: 'Devices',
                    href: '/dashboards/devices?from=${currentIndustry}',
                    icon: Monitor,
                    description: 'Device management`
                  }
                ]

                return universalNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isRouteActive(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={item.description}
                      className={isActive 
                        ? `
                        flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-all duration-200
                        hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                        bg-neutral-800 border-neutral-700 text-white shadow-sm'
                        : '
                        flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-all duration-200
                        hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                        bg-neutral-900/50 border-neutral-800/50 text-neutral-300 hover:bg-neutral-800/60 hover:border-neutral-700 hover:text-neutral-100'}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })
              })()}
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation Sections with Collapsible Design */}
        {config.sections
          .filter(section => section.title !== 'Home Services' && section.title !== 'Overview')
          .map((section, sectionIndex) => {
          const isCollapsed = collapsedSections.has(sectionIndex)
          const isCollapsible = section.collapsible !== false
          // Default expansion: non-collapsible sections are always expanded, 
          // collapsible sections use their defaultExpanded setting
          const shouldBeExpanded = !isCollapsible || (section.defaultExpanded !== false && !isCollapsed)
          
          return (
            <div key={sectionIndex} data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
              {section.title && (
                <h2 
                  data-sidebar="group-label" 
                  className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider group/collapsible"
                >
                  {isCollapsible ? (
                    <button 
                      className="flex items-center justify-between w-full text-left hover:text-neutral-100 transition-colors"
                      onClick={() => toggleSection(sectionIndex)}
                    >
                      <span>{section.title}</span>
                      <ChevronDown 
                        className={'h-3 w-3 text-neutral-500 group-hover/collapsible:text-neutral-300 transition-transform duration-200 ${
                          shouldBeExpanded ? ' : 'rotate-180'}'}
                      />
                    </button>
                  ) : (
                    <span>{section.title}</span>
                  )}
                </h2>
              )}
              
              {shouldBeExpanded && (
                <div data-sidebar="group-content" className="w-full text-sm">
                  <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = isRouteActive(item.href)
                      const isCustomItem = (section.title === 'Custom Dashboards' || item.badge === 'Custom') && item.name !== 'Create New Dashboard'
                      
                      return (
                        <li key={item.name} data-sidebar="menu-item" className="group/menu-item relative">
                          <div title={item.description} className="flex items-center">
                            <Link
                              href={item.href}
                              data-sidebar="menu-button"
                              data-size="default"
                              data-active={isActive}
                              className={'peer/menu-button flex flex-1 items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm ${
                                isActive ? 'bg-neutral-800/80 font-medium text-neutral-100' : '} ${
                                isCustomItem ? 'pr-8' : '}'}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="flex-1">{item.name}</span>
                              {item.badge && !isCustomItem && (
                                <span className="ml-auto px-1 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded-md min-w-[1rem] text-center">
                                  {item.badge}
                                </span>
                              )}
                              {item.isNew && (
                                <span className="ml-auto px-1 py-0.5 text-xs bg-neutral-700 text-blue-400 rounded-md">
                                  New
                                </span>
                              )}
                            </Link>
                            {isCustomItem && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button 
                                    className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-700/50 absolute right-1"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <MoreHorizontal className="h-3 w-3 text-neutral-400 hover:text-neutral-100" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
                                  <DropdownMenuItem 
                                    className="text-neutral-100 focus:bg-neutral-700 cursor-pointer"
                                    onClick={() => {
                                      console.log('Edit custom dashboard:', item.name)
                                      // TODO: Implement edit functionality
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit Dashboard
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-neutral-100 focus:bg-neutral-700 cursor-pointer"
                                    onClick={() => {
                                      console.log('Duplicate custom dashboard:', item.name)
                                      // TODO: Implement duplicate functionality
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-neutral-700" />
                                  <DropdownMenuItem 
                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete "${item.name}"?')) {
                                        console.log('Delete custom dashboard:', item.name)
                                        // TODO: Implement delete functionality
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )
        })}

        {/* Bottom Navigation - Developers and Settings */}
        <div className="mt-auto">
          <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
            <div data-sidebar="group-content" className="w-full text-sm">
              <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                <li data-sidebar="menu-item" className="group/menu-item relative">
                  <div title="Developer tools and API documentation">
                    <Link
                      href="/developers"
                      data-sidebar="menu-button"
                      data-size="default"
                      data-active={isRouteActive('/developers')}
                      className={'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm ${
                        isRouteActive('/developers') ? 'bg-neutral-800/80 font-medium text-neutral-100' : '}'}
                    >
                      <Code2 className="h-4 w-4" />
                      <span className="flex-1">Developers</span>
                    </Link>
                  </div>
                </li>
                <li data-sidebar="menu-item" className="group/menu-item relative">
                  <div title="Application settings and preferences">
                    <Link
                      href="/dashboards/settings"
                      data-sidebar="menu-button"
                      data-size="default"
                      data-active={isRouteActive('/settings')}
                      className={'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm ${
                        isRouteActive('/settings') ? 'bg-neutral-800/80 font-medium text-neutral-100' : '}'}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="flex-1">Settings</span>
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}