'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Plus,
  Search,
  History as HistoryIcon,
  Image as ImageIcon,
  MoreHorizontal,
  Settings,
  Code2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"
import { ThorbisLogo } from "./thorbis-logo"
import { useNavigation } from "@/components/navigation-context"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  navigationConfigs, 
  mainNavigationItems,
  subNavigationConfigs,
  type Industry 
} from '@/configs/navigation-configs'

interface BusinessSidebarProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
  industry: Industry
}

export function BusinessSidebar({ user: _user, industry }: BusinessSidebarProps) {
  const { navigationState } = useNavigation()
  const config = navigationConfigs[industry] || navigationConfigs.hs
  const [currentView, setCurrentView] = useState<'main' | string>('main')
  const router = useRouter()
  const pathname = usePathname()

  // Function to check if a route is active
  const isRouteActive = (href: string): boolean => {
    if (!pathname) return false
    
    // Remove query parameters from the href for comparison
    const cleanHref = href.split('?')[0]
    const cleanPathname = pathname.split('?')[0]
    
    // Exact match for the path
    if (cleanPathname === cleanHref) return true
    
    // For dashboard routes, also check if we're in a sub-route'
    if (cleanHref.startsWith('/dashboards/')) {
      const hrefSegments = cleanHref.split('/').filter(Boolean)
      const pathnameSegments = cleanPathname.split('/').filter(Boolean)
      
      // If we're comparing dashboard root routes (e.g., /dashboards/money vs /dashboards/money/invoices)'
      if (hrefSegments.length >= 2 && pathnameSegments.length >= 2) {
        return hrefSegments[0] === pathnameSegments[0] && hrefSegments[1] === pathnameSegments[1]
      }
    }
    
    return false
  }

  // Sync sidebar state with actual route changes (including browser back/forward)
  useEffect(() => {
    const syncNavigationState = () => {
      const currentPath = pathname || window.location.pathname
      const pathSegments = currentPath.split('/').filter(Boolean)
      
      if (pathSegments.length >= 2 && pathSegments[0] === 'dashboards') {
        const dashboardKey = pathSegments[1]
        if (subNavigationConfigs[dashboardKey] && currentView !== dashboardKey) {
          console.log('Syncing sidebar to:', dashboardKey, 'from path:', currentPath)
          setCurrentView(dashboardKey)
        }
      } else if (currentPath === '/' || !currentPath.includes('/dashboards/')) {
        // Reset to main view when not in a dashboard
        if (currentView !== 'main') {
          console.log('Syncing sidebar to main from path:', currentPath)
          setCurrentView('main')
        }
      }
    }

    syncNavigationState()
  }, [pathname, currentView])

  // Listen for browser back/forward navigation and route changes
  useEffect(() => {
    const handleNavigationChange = () => {
      // Small delay to ensure the pathname has updated
      setTimeout(() => {
        const currentPath = window.location.pathname
        const pathSegments = currentPath.split('/').filter(Boolean)
        
        if (pathSegments.length >= 2 && pathSegments[0] === 'dashboards') {
          const dashboardKey = pathSegments[1]
          if (subNavigationConfigs[dashboardKey] && currentView !== dashboardKey) {
            console.log('Browser navigation detected - syncing sidebar to:', dashboardKey)
            setCurrentView(dashboardKey)
          }
        } else if (currentPath === '/' || !currentPath.includes('/dashboards/')) {
          if (currentView !== 'main') {
            console.log('Browser navigation detected - syncing sidebar to main')
            setCurrentView('main')
          }
        }
      }, 10)
    }

    // Override history methods to dispatch custom events
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      window.dispatchEvent(new CustomEvent('locationchange'))
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      window.dispatchEvent(new CustomEvent('locationchange'))
    }

    // Listen for browser back/forward button events
    window.addEventListener('popstate', handleNavigationChange)
    
    // Listen for programmatic navigation
    window.addEventListener('locationchange', handleNavigationChange)
    
    return () => {
      // Restore original methods
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      
      window.removeEventListener('popstate', handleNavigationChange)
      window.removeEventListener('locationchange', handleNavigationChange)
    }
  }, [currentView])

  const handleNavigationClick = (itemName: string) => {
    const key = itemName.toLowerCase().replace(/[^\w\s-]/g, '')
    if (subNavigationConfigs[key]) {
      // Only navigate if we're not already there'
      const baseUrl = '/dashboards/${key}'
      if (pathname !== baseUrl) {
        // Navigate using Next.js router (instant, no page refresh)
        router.push(baseUrl)
        // The useEffect will handle updating currentView when the route changes
      }
    }
  }

  const handleBackClick = () => {
    // Use Next.js router's built-in back functionality'
    router.back()
  }
  
  // Example AI chat history (restored from previous AI sidebar design)
  const exampleChats: Array<{ id: string; title: string; href: string }> = [
    { id: '1', title: 'Material labor breakdown', href: '/c/68bb40f2-b3ec-8325-b980-1e168762ecc5' },
    { id: '2', title: 'Banking app UI inspiration', href: '/c/68b9ade5-c2c8-8333-927e-4335688843c3' },
    { id: '3', title: 'Cutting and capping copper', href: '/c/68b8cb39-0124-8328-b296-87c3f4919909' },
    { id: '4', title: 'Bookkeeping vs Accounting', href: '/c/68b72333-cf64-8329-8171-04327b840aee' },
    { id: '5', title: 'Water heater options summary', href: '/c/68b87dc2-678c-8332-a03a-08f3015e8a90' },
    { id: '6', title: 'Shorten standpipe guidance', href: '/c/68b84b9d-aaf8-832d-a829-4544b2516711' },
    { id: '7', title: 'Email and affidavit draft', href: '/c/68b6dbd5-aa4c-8333-8d14-775c73f1be3c' },
    { id: '8', title: 'Chat bot data integration', href: '/c/68b62ec6-5ea4-8330-a0e2-21616c986a9a' },
    { id: '9', title: 'Neon vs Supabase', href: '/c/68b636f7-0414-832f-a7db-392ab1e20544' },
    { id: '10', title: 'Monorepo size issues', href: '/c/68b61e4d-24a4-832f-b081-795902284a6e' },
    { id: '11', title: 'DNA sample delays', href: '/c/68b4cd18-eee4-8331-8de8-3975b29f6b3f' },
    { id: '12', title: 'AI interface for investigators', href: '/c/68b495ae-50a0-8323-808a-11dec9d42c5f' },
    { id: '13', title: 'AI crime investigator names', href: '/c/68a63cf9-b244-832f-817a-d609db2f4479' },
    { id: '14', title: 'AR VR implementation plan', href: '/c/68b35cb2-2c64-8324-b60c-ff15ae6605c2' },
    { id: '15', title: 'AI workflow for admin panels', href: '/c/68b31344-1a94-8321-89c3-36350bb31453' },
    { id: '16', title: 'Domain availability timeline', href: '/c/68b113f1-e108-8326-8d63-7c7d698bf578' },
    { id: '17', title: 'Brewing iced tea recipe', href: '/c/68b0edbb-aff0-832d-ae85-ff0a4409383f' },
    { id: '18', title: 'Flush valve leak fix', href: '/c/68b0a94b-d1b8-8322-ba34-dc30780c9b36' },
    { id: '19', title: 'Flush valve leak fix', href: '/c/68b0a937-6b00-8328-b473-77c8cf10754e' },
    { id: '20', title: 'Removing flush valve locknut', href: '/c/68b09424-136c-832e-95c4-6fb08b49bdc3' },
    { id: '21', title: 'Turn off valve safely', href: '/c/68b08abb-11d8-8330-962a-fec51023b458' },
    { id: '22', title: 'Toilet sensor retrofit options', href: '/c/68b06b3f-7520-8324-9a1b-5f4061e76147' },
    { id: '23', title: 'Shorten flushometer nipple', href: '/c/68b067e4-349c-8320-be4f-9f78f8aa5558' },
    { id: '24', title: 'Toilet service pricing strategy', href: '/c/68b05a66-48d8-8325-a6d3-1bead5e4295c' },
    { id: '25', title: 'Increase sales strategy', href: '/c/68af7e7c-d2f4-8323-bfca-d4a2ca4eb83d' },
    { id: '26', title: 'AI integration blueprint', href: '/c/68af2e8d-aaac-832b-ad0b-92eb07f95b5a' },
    { id: '27', title: 'Apple AirPods release info', href: '/c/68af0ca2-1340-832c-96a0-6cf264036542' },
    { id: '28', title: 'Cheapest AI integration options', href: '/c/68ae850e-3f40-8321-bdfe-27e8278f5d35' },
    { id: '29', title: 'CSI to USB adapter', href: '/c/68ae8618-598c-8330-a11e-b06d0ea5887e' },
    { id: '30', title: 'Gas key valve issue', href: '/c/68ae137b-44c4-832a-8be7-af458dd01d35' }
  ]
  
  return (
    <Sidebar variant="inset" className="sidebar-content">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="relative">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ThorbisLogo size="md" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{config.appName}</span>
                  <span className="truncate text-xs">Business OS</span>
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
        {/* Hierarchical Navigation */}
        {currentView === 'main' ? (
          /* Main Navigation */
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavigationItems.map((item) => {
                  const Icon = item.icon
                  const hasSubNav = subNavigationConfigs[item.name.toLowerCase().replace(/[^\w\s-]/g, '')]
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild={!hasSubNav}
                        onClick={hasSubNav ? () => handleNavigationClick(item.name) : undefined}
                        className="cursor-pointer"
                      >
                        {hasSubNav ? (
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                          </div>
                        ) : (
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* Sub Navigation */
          <>
            {/* Back Button */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {navigationState?.backContext ? (
                      <SidebarMenuButton asChild>
                        <Link href={navigationState.backContext.href}>
                          <ArrowLeft className="h-4 w-4" />
                          <span>{navigationState.backContext.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton onClick={handleBackClick} className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Sub Navigation Content */}
            {subNavigationConfigs[currentView] && (
              <>
                {subNavigationConfigs[currentView].sections.map((section, sectionIndex) => (
                  <SidebarGroup key={sectionIndex}>
                    {section.title && (
                      <h2 className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        {section.title}
                      </h2>
                    )}
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => {
                          const Icon = item.icon
                          const isActive = isRouteActive(item.href)
                          return (
                            <SidebarMenuItem key={item.name}>
                              <SidebarMenuButton asChild isActive={isActive}>
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
                ))}
              </>
            )}
          </>
        )}

        {/* AI-specific content (only show in AI app and main view) */}
        {industry === 'ai' && currentView === 'main' && (
          <>
            {/* AI Quick Menu - Updated with Media */}
            <SidebarGroup>
              <SidebarGroupContent>
                <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1 list-none p-0 m-0">
                  <li data-sidebar="menu-item" className="group/menu-item relative">
                    <div title="Start a new chat">
                      <button
                        type="button"
                        data-sidebar="menu-button"
                        data-size="default"
                        data-active="false"
                        className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm"
                      >
                        <span className="flex items-center justify-center w-4 h-4">
                          <Plus className="h-4 w-4" />
                        </span>
                        <span>New chat</span>
                      </button>
                    </div>
                  </li>
                  <li data-sidebar="menu-item" className="group/menu-item relative">
                    <div title="Search chats">
                      <button
                        type="button"
                        data-sidebar="menu-button"
                        data-size="default"
                        data-active="false"
                        className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm"
                      >
                        <span className="flex items-center justify-center w-4 h-4">
                          <Search className="h-4 w-4" />
                        </span>
                        <span>Search</span>
                      </button>
                    </div>
                  </li>
                  <li data-sidebar="menu-item" className="group/menu-item relative">
                    <Link
                      href="#history"
                      data-sidebar="menu-button"
                      data-size="default"
                      data-active="false"
                      className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm"
                    >
                      <span className="flex items-center justify-center w-4 h-4">
                        <HistoryIcon className="h-4 w-4" />
                      </span>
                      <span>History</span>
                    </Link>
                  </li>
                  <li data-sidebar="menu-item" className="group/menu-item relative">
                    <Link
                      href="/media"
                      data-sidebar="menu-button"
                      data-size="default"
                      data-active="false"
                      className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-neutral-800/80 data-[active=true]:font-medium data-[active=true]:text-neutral-100 data-[state=open]:hover:bg-neutral-800/60 data-[state=open]:hover:text-neutral-100 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm"
                    >
                      <span className="flex items-center justify-center w-4 h-4">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                      <span>Media</span>
                    </Link>
                  </li>
                </ul>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Chats Section */}
            <div id="history" className="px-2 py-1.5">
              <aside className="pt-[var(--sidebar-section-margin-top,0.5rem)] last:mb-5" aria-labelledby="history-label">
                <h2 className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider" id="history-label">Chats</h2>
                <SidebarMenu>
                  {exampleChats.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <div title={item.title} className="relative">
                        <Link
                          href={item.href}
                          data-sidebar="menu-button"
                          data-size="default"
                          data-active="false"
                          className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all duration-200 ease-in-out focus-visible:ring-2 active:bg-neutral-800/80 active:text-neutral-100 disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-neutral-800/60 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-sm h-8 text-sm"
                        >
                          <span className="truncate">{item.title}</span>
                        </Link>
                        <button
                          data-sidebar="menu-action"
                          className="absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
                          aria-label="Open conversation options"
                          type="button"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </aside>
            </div>
          </>
        )}

        {industry !== 'ai' && config.sections.map((section, sectionIndex) => (
          <SidebarGroup key={sectionIndex}>
            {section.title && (
              <h2 className="__menu-label px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {section.title}
              </h2>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = isRouteActive(item.href)
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild tooltip={item.description} isActive={isActive}>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                          {item.isNew && (
                            <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        
        {/* Bottom Navigation - Always show for all industries */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
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

