'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, DollarSign, Target, BookOpen, Brain, BarChart3, Monitor } from "lucide-react"
import { useNavigation } from "@/components/navigation-context"

export function HeaderNavigation() {
  const { navigationState, routeContext } = useNavigation()
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

  // Determine the current context for navigation
  const currentIndustry = navigationState?.backContext?.href?.includes('dashboards/') 
    ? navigationState.backContext.href.split('/')[2] 
    : routeContext?.industry || 'hs'

  // Universal navigation items
  const universalNavItems = [
    {
      name: 'Dashboard',
      href: navigationState?.backContext?.href || '/dashboards/hs',
      icon: Home,
      description: 'Main dashboard overview'
    },
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
      name: 'Devices',
      href: '/dashboards/devices?from=${currentIndustry}',
      icon: Monitor,
      description: 'Device management'
    }
  ]

  return (
    <div className="flex items-center gap-1 px-2">
      {universalNavItems.map((item) => {
        const Icon = item.icon
        const isActive = isRouteActive(item.href)
        
        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.description}
            className={'
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              hover:bg-neutral-800/60 hover:text-neutral-100 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900
              ${isActive 
                ? 'bg-neutral-800/80 text-neutral-100 shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-100`
              }'}'
            '}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}