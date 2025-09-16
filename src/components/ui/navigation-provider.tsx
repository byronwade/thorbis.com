'use client'

import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface NavigationContextValue {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  currentPath: string
  breadcrumbs: Array<{ label: string; href?: string; current?: boolean }>
  navigate: (href: string, options?: NavigationOptions) => void
  prefetch: (href: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
}

export interface NavigationOptions {
  replace?: boolean
  scroll?: boolean
  prefetch?: boolean
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export interface NavigationProviderProps {
  children: React.ReactNode
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  enablePrefetching?: boolean
  prefetchDelay?: number
}

/**
 * Navigation Provider
 * 
 * Provides unified navigation context with industry-aware routing,
 * automatic prefetching, and breadcrumb management.
 */
export function NavigationProvider({
  children,
  industry,
  enablePrefetching = true,
  prefetchDelay = 1000
}: NavigationProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  // Only mount after hydration to avoid SSR/client mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Use hooks conditionally after mount
  let router: unknown = null
  let pathname = '/'
  
  try {
    if (mounted && typeof window !== 'undefined') {
      router = useRouter()
      pathname = usePathname()
    }
  } catch (_error) {
    // Router not ready, use fallbacks
    router = {
      push: (href: string) => {
        if (typeof window !== 'undefined') {
          window.location.href = href
        }
      },
      replace: (href: string) => {
        if (typeof window !== 'undefined') {
          window.location.replace(href)
        }
      },
      back: () => {
        if (typeof window !== 'undefined') {
          window.history.back()
        }
      },
      forward: () => {
        if (typeof window !== 'undefined') {
          window.history.forward()
        }
      },
      refresh: () => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      },
      prefetch: () => {} // No-op fallback
    }
  }

  const breadcrumbs = useBreadcrumbs(industry, pathname)

  // Enhanced navigation with prefetching
  const navigate = useCallback((href: string, options: NavigationOptions = {}) => {
    const { replace = false, scroll = true, prefetch = enablePrefetching } = options

    // Prefetch the route if enabled
    if (prefetch) {
      router.prefetch(href)
    }

    // Navigate to the route
    if (replace) {
      router.replace(href, { scroll })
    } else {
      router.push(href, { scroll })
    }
  }, [router, enablePrefetching])

  // Prefetch route
  const prefetch = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  // Navigation controls
  const back = useCallback(() => {
    router.back()
  }, [router])

  const forward = useCallback(() => {
    router.forward()
  }, [router])

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Auto-prefetch common routes
  useEffect(() => {
    if (!enablePrefetching) return

    const prefetchCommonRoutes = () => {
      const commonRoutes = getCommonRoutes(industry)
      commonRoutes.forEach(route => {
        setTimeout(() => {
          router.prefetch(route)
        }, prefetchDelay)
      })
    }

    // Prefetch after a delay to avoid impacting initial load
    const timer = setTimeout(prefetchCommonRoutes, prefetchDelay)
    return () => clearTimeout(timer)
  }, [industry, enablePrefetching, prefetchDelay, router])

  const contextValue: NavigationContextValue = {
    industry,
    currentPath: pathname,
    breadcrumbs,
    navigate,
    prefetch,
    back,
    forward,
    refresh
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}

/**
 * Hook to use navigation context
 */
export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

/**
 * Hook for enhanced Link component with automatic prefetching
 */
export function useNavigationLink(href: string, options: NavigationOptions = {}) {
  const { navigate, prefetch } = useNavigation()
  const [isPrefetched, setIsPrefetched] = React.useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    navigate(href, options)
  }, [navigate, href, options])

  const handleMouseEnter = useCallback(() => {
    if (!isPrefetched && options.prefetch !== false) {
      prefetch(href)
      setIsPrefetched(true)
    }
  }, [prefetch, href, isPrefetched, options.prefetch])

  return {
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    href
  }
}

/**
 * Enhanced Link component with industry-aware routing
 */
export function NavigationLink({
  href,
  children,
  className,
  prefetch = true,
  replace = false,
  scroll = true,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}) {
  const linkProps = useNavigationLink(href, { prefetch, replace, scroll })

  return (
    <a
      {...props}
      {...linkProps}
      className={className}
    >
      {children}
    </a>
  )
}

/**
 * Navigation breadcrumb component
 */
export function NavigationBreadcrumbs({ className }: { className?: string }) {
  const { breadcrumbs } = useNavigation()
  
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-neutral-400">/</span>
            )}
            {crumb.href ? (
              <NavigationLink
                href={crumb.href}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {crumb.label}
              </NavigationLink>
            ) : (
              <span className="text-neutral-900 font-medium">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Simple breadcrumb hook for now - can be enhanced later
 */
function useBreadcrumbs(industry: string, pathname: string) {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Dashboard', href: '/${industry}' }]
    
    for (const i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const href = '/' + segments.slice(0, i + 1).join('/')
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ label, href })
    }
    
    // Mark last item as current
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1] as any
      lastBreadcrumb.current = true
    }
    
    return breadcrumbs
  }, [industry, pathname])
}

/**
 * Get common routes for prefetching based on industry
 */
function getCommonRoutes(industry: 'hs' | 'rest' | 'auto' | 'ret'): string[] {
  const commonRoutes = {
    hs: [
      '/hs/dispatch',
      '/hs/work-orders',
      '/hs/estimates',
      '/hs/customers',
      '/hs/ai'
    ],
    rest: [
      '/rest/pos',
      '/rest/kds',
      '/rest/floor',
      '/rest/reservations',
      '/rest/ai'
    ],
    auto: [
      '/auto/service-bays',
      '/auto/repair-orders',
      '/auto/parts',
      '/auto/vehicles',
      '/auto/ai'
    ],
    ret: [
      '/ret/pos',
      '/ret/inventory',
      '/ret/customers',
      '/ret/orders',
      '/ret/ai'
    ]
  }

  return commonRoutes[industry] || []
}

/**
 * Route matching utilities
 */
export function isActiveRoute(currentPath: string, targetPath: string): boolean {
  // Exact match
  if (currentPath === targetPath) return true
  
  // Parent route match (e.g., /hs/work-orders matches /hs/work-orders/123)
  if (currentPath.startsWith(targetPath + '/')) return true
  
  return false
}

export function getRouteDepth(path: string): number {
  return path.split('/').filter(Boolean).length
}

/**
 * Navigation analytics hook
 */
export function useNavigationAnalytics() {
  const { currentPath, industry } = useNavigation()

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: currentPath,
        custom_map: {
          industry: industry
        }
      })
    }

    // Track in console for development
    console.log('Navigation: ${industry} -> ${currentPath}')
  }, [currentPath, industry])
}
