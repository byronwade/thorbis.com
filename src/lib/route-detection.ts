/**
 * Route Detection Utilities
 * 
 * Provides smart route detection to determine the appropriate industry, navigation,
 * and layout configuration based on the current URL path.
 */

import { Industry } from '@/configs/navigation-configs'

export interface RouteContext {
  industry: Industry
  appName: string
  section?: string
  subsection?: string
  isVertical: boolean
  isShared: boolean
  isAdmin: boolean
  pathname: string
}

/**
 * Check if route is a vertical industry
 */
function isVerticalIndustry(route: string): boolean {
  const verticalIndustries = ['hs', 'rest', 'auto', 'ret', 'investigations']
  return verticalIndustries.includes(route)
}

/**
 * Check if route is a shared feature
 */
function isSharedFeature(route: string): boolean {
  const sharedFeatures = ['money', 'banking', 'payroll', 'courses', 'academy', 'marketing', 'ai', 'analytics', 'devices']
  return sharedFeatures.includes(route)
}

/**
 * Check if route is an admin feature
 */
function isAdminFeature(route: string): boolean {
  const adminFeatures = ['api', 'docs', 'system']
  return adminFeatures.includes(route)
}

/**
 * Detect industry and context from pathname
 */
export function detectRouteContext(pathname: string): RouteContext {
  const segments = pathname.split('/').filter(Boolean)
  
  // Default context
  let context: RouteContext = {
    industry: 'ai',
    appName: 'Thorbis Dashboard',
    isVertical: false,
    isShared: true,
    isAdmin: false,
    pathname
  }

  if (segments.length === 0 || segments[0] !== 'dashboards') {
    return context
  }

  // Parse dashboard route structure
  if (segments.length >= 2) {
    const secondSegment = segments[1]
    
    // Handle route groups: /dashboards/(group)/industry/section
    if (secondSegment.startsWith('(') && secondSegment.endsWith(')')) {
      const group = secondSegment // (verticals), (shared), (admin)
      
      if (group === '(verticals)' && segments.length >= 3) {
        // Vertical industry routes: /dashboards/(verticals)/hs/...
        const industry = segments[2] as Industry
        context = {
          industry,
          appName: getAppName(industry),
          section: segments[3],
          subsection: segments[4],
          isVertical: true,
          isShared: false,
          isAdmin: false,
          pathname
        }
      } else if (group === '(shared)' && segments.length >= 3) {
        // Shared feature routes: /dashboards/(shared)/money/...
        const feature = segments[2]
        context = {
          industry: feature as Industry, // Use the feature as its own industry
          appName: getSharedFeatureAppName(feature),
          section: feature,
          subsection: segments[3],
          isVertical: false,
          isShared: true,
          isAdmin: false,
          pathname
        }
      } else if (group === '(admin)' && segments.length >= 3) {
        // Admin routes: /dashboards/(admin)/api/...
        const adminFeature = segments[2]
        context = {
          industry: mapAdminFeatureToIndustry(adminFeature),
          appName: 'Admin: ${adminFeature.charAt(0).toUpperCase() + adminFeature.slice(1)}',
          section: adminFeature,
          subsection: segments[3],
          isVertical: false,
          isShared: false,
          isAdmin: true,
          pathname
        }
      }
    } 
    // Handle direct routes: /dashboards/hs, /dashboards/money, etc.
    else {
      const directRoute = secondSegment
      
      // Check if it's a vertical industry'
      if (isVerticalIndustry(directRoute)) {
        context = {
          industry: directRoute as Industry,
          appName: getAppName(directRoute as Industry),
          section: segments[2],
          subsection: segments[3],
          isVertical: true,
          isShared: false,
          isAdmin: false,
          pathname
        }
      }
      // Check if it's a shared feature'
      else if (isSharedFeature(directRoute)) {
        context = {
          industry: directRoute as Industry, // Use the feature as its own industry
          appName: getSharedFeatureAppName(directRoute),
          section: directRoute,
          subsection: segments[2],
          isVertical: false,
          isShared: true,
          isAdmin: false,
          pathname
        }
      }
      // Check if it's an admin feature'
      else if (isAdminFeature(directRoute)) {
        context = {
          industry: mapAdminFeatureToIndustry(directRoute),
          appName: 'Admin: ${directRoute.charAt(0).toUpperCase() + directRoute.slice(1)}',
          section: directRoute,
          subsection: segments[2],
          isVertical: false,
          isShared: false,
          isAdmin: true,
          pathname
        }
      }
    }
  }

  return context
}

/**
 * Map industry code to app name
 */
function getAppName(industry: Industry): string {
  const appNames: Record<Industry, string> = {
    hs: 'Home Services',
    rest: 'Restaurant',
    auto: 'Auto Services', 
    ret: 'Retail',
    books: 'Thorbis Books',
    banking: 'Thorbis Banking',
    courses: 'Thorbis Academy',
    payroll: 'Thorbis Payroll',
    lom: 'LOM Documentation',
    investigations: 'Thorbis Investigations',
    ai: 'Thorbis AI',
    api: 'Thorbis API',
    marketing: 'Thorbis Marketing'
  }
  
  return appNames[industry] || 'Thorbis Dashboard'
}

/**
 * Get app name for shared features
 */
function getSharedFeatureAppName(feature: string): string {
  const featureNames: Record<string, string> = {
    money: 'Financial Management',
    banking: 'Banking Services',
    payroll: 'Payroll Management',
    courses: 'Learning Management',
    academy: 'Learning Management',
    marketing: 'Marketing Hub',
    ai: 'AI Assistant',
    analytics: 'Business Analytics',
    devices: 'Device Management'
  }
  
  return featureNames[feature] || 'Thorbis Dashboard'
}

/**
 * Map shared feature to appropriate industry
 */
function mapFeatureToIndustry(feature: string): Industry {
  const featureMapping: Record<string, Industry> = {
    money: 'books',
    banking: 'banking',
    payroll: 'payroll',
    courses: 'courses',
    academy: 'courses',
    marketing: 'marketing',
    ai: 'ai',
    analytics: 'ai',
    devices: 'ai'
  }
  
  return featureMapping[feature] || 'ai'
}

/**
 * Map admin feature to appropriate industry
 */
function mapAdminFeatureToIndustry(feature: string): Industry {
  const adminMapping: Record<string, Industry> = {
    api: 'api',
    docs: 'lom',
    system: 'ai'
  }
  
  return adminMapping[feature] || 'ai`
}

/**
 * Determine if route should show install banner
 */
export function shouldShowInstallBanner(context: RouteContext): boolean {
  // Show install banner for main industry apps
  return context.isVertical && !context.isAdmin
}

/**
 * Get page title from route context
 */
export function getPageTitle(context: RouteContext): string {
  const title = context.appName
  
  if (context.section) {
    title += ` | ${context.section.charAt(0).toUpperCase() + context.section.slice(1)}'
  }
  
  if (context.subsection) {
    title += ' | ${context.subsection.charAt(0).toUpperCase() + context.subsection.slice(1)}'
  }
  
  return title
}