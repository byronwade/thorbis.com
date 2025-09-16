'use client'

/**
 * Navigation Context Provider
 * 
 * Manages navigation state that updates when users navigate via:
 * - Direct route changes
 * - Browser back/forward buttons
 * - Deep linking
 * - Programmatic navigation
 * 
 * This ensures the sidebar, breadcrumbs, and other navigation elements
 * stay in sync with the current route at all times.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { RouteContext, detectRouteContext } from '@/lib/route-detection'
import { NavigationState, loadNavigationConfig } from '@/lib/navigation-config-loader'

interface NavigationContextType {
  routeContext: RouteContext
  navigationState: NavigationState | null
  isNavigating: boolean
  previousRoute: string | null
  navigationHistory: string[]
  refreshNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [routeContext, setRouteContext] = useState<RouteContext>(() => 
    detectRouteContext(pathname)
  )
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [previousRoute, setPreviousRoute] = useState<string | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([pathname])

  // Update route context when pathname changes (includes back/forward navigation)
  useEffect(() => {
    setIsNavigating(true)
    
    // Small delay to indicate navigation is happening
    const timer = setTimeout(async () => {
      const newContext = detectRouteContext(pathname)
      
      // Update previous route
      setPreviousRoute(routeContext.industry !== newContext.industry ? 
        '/dashboards/${routeContext.isVertical ? routeContext.industry : 
          routeContext.isShared ? routeContext.section : 
          routeContext.section}' : null
      )
      
      setRouteContext(newContext)
      
      // Load navigation configuration for the new route
      try {
        const navState = await loadNavigationConfig(newContext)
        setNavigationState(navState)
      } catch (error) {
        console.warn('Failed to load navigation config:', error)
        setNavigationState(null)
      }
      
      // Update navigation history
      setNavigationHistory(prev => {
        const newHistory = [...prev]
        if (newHistory[newHistory.length - 1] !== pathname) {
          newHistory.push(pathname)
          // Keep only last 10 routes for performance
          if (newHistory.length > 10) {
            newHistory.shift()
          }
        }
        return newHistory
      })
      
      setIsNavigating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, routeContext.industry, routeContext.isVertical, routeContext.isShared, routeContext.section])

  // Handle browser back/forward button presses
  useEffect(() => {
    const handlePopState = () => {
      // Force refresh navigation context when back/forward is used
      setTimeout(() => {
        const newContext = detectRouteContext(window.location.pathname)
        setRouteContext(newContext)
      }, 50)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Manual refresh function for complex navigation scenarios
  const refreshNavigation = async () => {
    const newContext = detectRouteContext(pathname)
    setRouteContext(newContext)
    try {
      const navState = await loadNavigationConfig(newContext)
      setNavigationState(navState)
    } catch (error) {
      console.warn('Failed to refresh navigation config:', error)
    }
  }

  const value: NavigationContextType = {
    routeContext,
    navigationState,
    isNavigating,
    previousRoute,
    navigationHistory,
    refreshNavigation
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

/**
 * Hook to access navigation context
 */
export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

/**
 * Hook to get current industry with automatic updates
 */
export function useCurrentIndustry() {
  const { routeContext } = useNavigation()
  return routeContext.industry
}

/**
 * Hook to check if we're in a specific route type'
 */
export function useRouteType() {
  const { routeContext } = useNavigation()
  return {
    isVertical: routeContext.isVertical,
    isShared: routeContext.isShared,
    isAdmin: routeContext.isAdmin,
    industry: routeContext.industry,
    section: routeContext.section
  }
}