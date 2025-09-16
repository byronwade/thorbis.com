/**
 * Navigation Configuration Loader
 * 
 * Dynamically loads the appropriate navigation configuration based on the current route.
 * This allows each dashboard to have its own navigation config while supporting
 * cross-industry navigation with proper back button context.
 */

import React from 'react'
import { RouteContext } from './route-detection'

// Types for navigation configurations
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  isNew?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface SidebarConfig {
  defaultOpen?: boolean
  showToggleIcon?: boolean
  collapsible?: boolean
  variant?: 'sidebar' | 'floating' | 'inset'
  width?: string
  position?: 'left' | 'right'
}

export interface HeaderConfig {
  title: string
  subtitle?: string
  primaryAction?: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  secondaryActions?: Array<{
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'outline' | 'ghost'
  }>
  actions?: Array<{
    label: string
    href: string
    icon: string
  }>
  quickStats?: Array<{
    label: string
    value: string
    change?: string
    trend?: 'up' | 'down' | 'neutral'
  }>
  // Advanced header controls
  showBusinessDropdown?: boolean
  businessDropdownOptions?: Array<{
    label: string
    value: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    separator?: boolean
  }>
  rightSideIcons?: Array<{
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    variant?: 'default' | 'ghost' | 'outline'
  }>
  userDropdownOptions?: Array<{
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    separator?: boolean
    variant?: 'default' | 'destructive'
  }>
}

export interface NavigationConfig {
  appName: string
  industry: string
  primaryColor: string
  icon: React.ComponentType<{ className?: string }>
  dashboardHref: string
  sidebar?: SidebarConfig
  header: HeaderConfig
  sections: NavigationSection[]
}

export interface NavigationState {
  config: NavigationConfig
  backContext?: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  breadcrumbs: Array<{
    label: string
    href: string
  }>
}

/**
 * Load navigation configuration for a given route context
 */
export async function loadNavigationConfig(context: RouteContext): Promise<NavigationState> {
  let config: NavigationConfig
  let backContext: NavigationState['backContext']
  
  try {
    // Load the appropriate config based on route
    if (context.isVertical) {
      // Load vertical industry config (e.g., hs, auto, rest, ret)
      config = await loadVerticalConfig(context.industry, context)
    } else if (context.isShared) {
      // Load shared feature config (e.g., money, marketing, ai)
      config = await loadSharedConfig(context.section!)
      // For shared features, we might want to go back to the referring industry
      backContext = getBackContext(context)
    } else if (context.isAdmin) {
      // Load admin feature config
      config = await loadAdminConfig(context.section!)
    } else {
      // Fallback to default config
      config = getDefaultConfig()
    }
  } catch (error) {
    console.warn('Failed to load navigation config for ${context.industry}:', error)
    config = getDefaultConfig()
  }

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(context, config)

  return {
    config,
    backContext,
    breadcrumbs
  }
}

/**
 * Load page-specific navigation config if it exists
 */
async function loadPageSpecificConfig(context: RouteContext): Promise<NavigationConfig | null> {
  // Check for page-specific configs based on pathname
  const pathname = context.pathname
  
  try {
    // Communications page specific config
    if (pathname.includes('/communications')) {
      const { communicationsNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/hs/communications/navigation.config')
      return communicationsNavigationConfig
    }
    
    // Add more page-specific configs here as needed
    // Example: if (pathname.includes('/invoices')) { ... }
    
  } catch (_error) {
    // Page-specific config doesn't exist, return null to fall back to industry config
    return null
  }
  
  return null
}

/**
 * Load vertical industry navigation config
 */
async function loadVerticalConfig(industry: string, context: RouteContext): Promise<NavigationConfig> {
  // Check for page-specific navigation configs first
  const pageSpecificConfig = await loadPageSpecificConfig(context)
  if (pageSpecificConfig) {
    return pageSpecificConfig
  }
  
  // Fall back to industry-level configs
  switch (industry) {
    case 'hs':
      const { hsNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/hs/navigation.config')
      return hsNavigationConfig
    case 'auto':
      const { autoNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/auto/navigation.config')
      return autoNavigationConfig
    case 'rest':
      const { restNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/rest/navigation.config')
      return restNavigationConfig
    case 'ret':
      const { retNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/ret/navigation.config')
      return retNavigationConfig
    case 'investigations':
      const { investigationsNavigationConfig } = await import('../app/(auth)/dashboards/(verticals)/investigations/navigation.config')
      return investigationsNavigationConfig
    default:
      return getDefaultConfig()
  }
}

/**
 * Load shared feature navigation config
 */
async function loadSharedConfig(feature: string): Promise<NavigationConfig> {
  switch (feature) {
    case 'money':
      const { moneyNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/money/navigation.config')
      return moneyNavigationConfig
    case 'marketing':
      const { marketingNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/marketing/navigation.config')
      return marketingNavigationConfig
    case 'ai':
      const { aiNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/ai/navigation.config')
      return aiNavigationConfig
    case 'courses':
      const { coursesNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/courses/navigation.config')
      return coursesNavigationConfig
    case 'devices':
      const { devicesNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/devices/navigation.config')
      return devicesNavigationConfig
    case 'analytics':
      const { analyticsNavigationConfig } = await import('../app/(auth)/dashboards/(shared)/analytics/navigation.config')
      return analyticsNavigationConfig
    default:
      return getDefaultConfig()
  }
}

/**
 * Load admin feature navigation config
 */
async function loadAdminConfig(feature: string): Promise<NavigationConfig> {
  switch (feature) {
    case 'users':
      try {
        const { usersAdminNavigationConfig } = await import('../app/(auth)/dashboards/(admin)/users/navigation.config')
        return usersAdminNavigationConfig
      } catch {
        return getDefaultConfig()
      }
    case 'organizations':
      try {
        const { organizationsAdminNavigationConfig } = await import('../app/(auth)/dashboards/(admin)/organizations/navigation.config')
        return organizationsAdminNavigationConfig
      } catch {
        return getDefaultConfig()
      }
    case 'settings':
      try {
        const { settingsAdminNavigationConfig } = await import('../app/(auth)/dashboards/(admin)/settings/navigation.config')
        return settingsAdminNavigationConfig
      } catch {
        return getDefaultConfig()
      }
    case 'monitoring':
      try {
        const { monitoringAdminNavigationConfig } = await import('../app/(auth)/dashboards/(admin)/monitoring/navigation.config')
        return monitoringAdminNavigationConfig
      } catch {
        return getDefaultConfig()
      }
    case 'billing':
      try {
        const { billingAdminNavigationConfig } = await import('../app/(auth)/dashboards/(admin)/billing/navigation.config')
        return billingAdminNavigationConfig
      } catch {
        return getDefaultConfig()
      }
    default:
      return getDefaultConfig()
  }
}

/**
 * Get back navigation context for shared features
 */
function getBackContext(context: RouteContext): NavigationState['backContext'] | undefined {
  // If we're in a shared feature, check if we came from a vertical industry
  if (context.isShared && typeof window !== 'undefined') {
    // First check URL parameters for 'from' parameter
    const urlParams = new URLSearchParams(window.location.search)
    const fromIndustry = urlParams.get('from')
    
    if (fromIndustry && ['hs', 'auto', 'rest', 'ret', 'investigations`].includes(fromIndustry)) {
      return {
        label: `Back to Dashboard',
        href: '/dashboards/${fromIndustry}',
        icon: getIndustryIcon(fromIndustry)
      }
    }
    
    // Fallback to document referrer
    const previousPath = document.referrer
    if (previousPath && previousPath.includes('/dashboards/')) {
      // Extract industry from referrer
      try {
        const referrerSegments = new URL(previousPath).pathname.split('/').filter(Boolean)
        if (referrerSegments.length >= 2) {
          const potentialIndustry = referrerSegments[1]
          if (['hs', 'auto', 'rest', 'ret', 'investigations`].includes(potentialIndustry)) {
            return {
              label: `Back to Dashboard',
              href: '/dashboards/${potentialIndustry}',
              icon: getIndustryIcon(potentialIndustry)
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing referrer URL:`, error)
      }
    }
  }
  return undefined
}

/**
 * Generate breadcrumbs for the current route
 */
function generateBreadcrumbs(context: RouteContext, config: NavigationConfig): Array<{ label: string; href: string }> {
  const breadcrumbs: Array<{ label: string; href: string }> = []
  
  // Add dashboard root
  breadcrumbs.push({
    label: config.appName,
    href: config.dashboardHref
  })
  
  // Add section if present
  if (context.section && context.section !== config.industry) {
    breadcrumbs.push({
      label: context.section.charAt(0).toUpperCase() + context.section.slice(1),
      href: `${config.dashboardHref}/${context.section}'
    })
  }
  
  // Add subsection if present
  if (context.subsection) {
    breadcrumbs.push({
      label: context.subsection.charAt(0).toUpperCase() + context.subsection.slice(1),
      href: '${config.dashboardHref}/${context.section}/${context.subsection}'
    })
  }
  
  return breadcrumbs
}

/**
 * Get default fallback configuration
 */
function getDefaultConfig(): NavigationConfig {
  // Import icons at runtime to avoid issues
  const { Home, Settings } = require('lucide-react')
  
  return {
    appName: 'Thorbis Dashboard',
    industry: 'ai',
    primaryColor: '#1C8BFF',
    icon: Home,
    dashboardHref: '/dashboards',
    header: {
      title: 'Dashboard',
      subtitle: 'Business management platform'
    },
    sections: [
      {
        items: [
          {
            name: 'Home',
            href: '/dashboards',
            icon: Home,
            description: 'Main dashboard'
          },
          {
            name: 'Settings',
            href: '/dashboards/settings',
            icon: Settings,
            description: 'System settings'
          }
        ]
      }
    ]
  }
}

/**
 * Helper functions for industry information
 */
function getIndustryName(industry: string): string {
  const names: Record<string, string> = {
    hs: 'Home Services',
    auto: 'Auto Services',
    rest: 'Restaurant',
    ret: 'Retail',
    investigations: 'Investigations'
  }
  return names[industry] || industry
}

function getIndustryIcon(industry: string) {
  const { Wrench, Car, ChefHat, Store, Search, Home } = require('lucide-react')
  const icons: Record<string, unknown> = {
    hs: Wrench,
    auto: Car,
    rest: ChefHat,
    ret: Store,
    investigations: Search
  }
  return icons[industry] || Home
}