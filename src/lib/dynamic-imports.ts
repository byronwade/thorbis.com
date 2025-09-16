// Dynamic imports and code splitting utilities for NextFaster performance
// Implements lazy loading patterns for optimal bundle splitting

import { lazy, ComponentType, LazyExoticComponent } from 'react'
import { dynamicImportWithRetry } from './performance'

// =============================================================================
// Industry-Specific Lazy Components
// =============================================================================

// Home Services Components
export const HomeServicesWorkOrderForm = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/home-services/work-order-form'))
)

export const HomeServicesDashboard = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/home-services/dashboard'))
)

export const HomeServicesScheduler = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/home-services/scheduler'))
)

export const HomeServicesTechnicianMap = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/home-services/technician-map'))
)

// Restaurant Components
export const RestaurantPOSSystem = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/restaurant/pos-system'))
)

export const RestaurantMenuManager = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/restaurant/menu-manager'))
)

export const RestaurantOrderTracker = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/restaurant/order-tracker'))
)

export const RestaurantReservations = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/restaurant/reservations'))
)

// Auto Services Components
export const AutoServicesRepairOrder = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/auto/repair-order'))
)

export const AutoServicesInventory = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/auto/inventory'))
)

export const AutoServicesEstimator = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/auto/estimator'))
)

export const AutoServicesVehicleHistory = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/auto/vehicle-history'))
)

// Retail Components
export const RetailPOSSystem = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/retail/pos-system'))
)

export const RetailInventoryManager = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/retail/inventory-manager'))
)

export const RetailCustomerManager = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/retail/customer-manager'))
)

export const RetailAnalytics = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/industry/retail/analytics'))
)

// =============================================================================
// Heavy Feature Components (Charts, Maps, etc.)
// =============================================================================

// Analytics and Charts
export const AnalyticsCharts = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/analytics/charts'))
)

export const PerformanceDashboard = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/analytics/performance-dashboard'))
)

export const RevenueAnalytics = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/analytics/revenue'))
)

// Map Components
export const InteractiveMap = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/maps/interactive-map'))
)

export const RouteOptimizer = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/maps/route-optimizer'))
)

export const ServiceAreaMap = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/maps/service-area'))
)

// Advanced Forms
export const AdvancedFormBuilder = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/forms/advanced-form-builder'))
)

export const FileUploader = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/forms/file-uploader'))
)

export const InvoiceGenerator = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/forms/invoice-generator'))
)

// =============================================================================
// Modal and Dialog Components
// =============================================================================

// Note: These use inline panels instead of overlays per Thorbis design principles
export const InlineSettingsPanel = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/panels/settings-panel'))
)

export const InlineUserProfilePanel = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/panels/user-profile-panel'))
)

export const InlineNotificationsPanel = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/panels/notifications-panel'))
)

// =============================================================================
// Third-Party Integrations
// =============================================================================

export const StripeCheckout = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/integrations/stripe-checkout'))
)

export const CalendarIntegration = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/integrations/calendar'))
)

export const EmailTemplateEditor = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/integrations/email-template-editor'))
)

export const ChatWidget = lazy(() =>
  dynamicImportWithRetry(() => import('@/components/integrations/chat-widget'))
)

// =============================================================================
// Code Splitting Utilities
// =============================================================================

interface LazyComponentOptions {
  /**
   * Fallback component while loading
   */
  fallback?: ComponentType

  /**
   * Error boundary component
   */
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>

  /**
   * Preload condition (when to start loading the component)
   */
  preloadCondition?: () => boolean

  /**
   * Component display name for debugging
   */
  displayName?: string

  /**
   * Whether to preload on hover/focus
   */
  preloadOnHover?: boolean
}

/**
 * Creates a lazy component with enhanced loading and error handling
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const LazyComponent = lazy(() => dynamicImportWithRetry(importFn))

  if (options.displayName) {
    LazyComponent.displayName = options.displayName
  }

  // Preload if condition is met
  if (options.preloadCondition?.()) {
    importFn().catch(console.error)
  }

  return LazyComponent
}

/**
 * Preloads a component for better perceived performance
 */
export function preloadComponent(importFn: () => Promise<unknown>): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFn().catch(console.error)
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(console.error)
    }, 100)
  }
}

/**
 * Preloads multiple components based on route or user interaction
 */
export function preloadComponentsByRoute(route: string): void {
  const routePreloadMap: Record<string, Array<() => Promise<unknown>>> = {
    '/dashboards/home-services': [
      () => import('@/components/industry/home-services/dashboard'),
      () => import('@/components/industry/home-services/work-order-form'),
    ],
    '/dashboards/restaurant': [
      () => import('@/components/industry/restaurant/pos-system'),
      () => import('@/components/industry/restaurant/menu-manager'),
    ],
    '/dashboards/auto': [
      () => import('@/components/industry/auto/repair-order'),
      () => import('@/components/industry/auto/inventory'),
    ],
    '/dashboards/retail': [
      () => import('@/components/industry/retail/pos-system'),
      () => import('@/components/industry/retail/inventory-manager'),
    ],
    '/dashboards/analytics': [
      () => import('@/components/analytics/charts'),
      () => import('@/components/analytics/performance-dashboard'),
    ],
  }

  const preloaders = routePreloadMap[route]
  if (preloaders) {
    preloaders.forEach(preloader => {
      preloadComponent(preloader)
    })
  }
}

/**
 * Creates a component that preloads on hover/focus for instant interactions
 */
export function withPreloadOnHover<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  importFn: () => Promise<unknown>
) {
  return function PreloadOnHoverWrapper(props: P) {
    const handleMouseEnter = () => {
      preloadComponent(importFn)
    }

    const handleFocus = () => {
      preloadComponent(importFn)
    }

    return (
      <div onMouseEnter={handleMouseEnter} onFocus={handleFocus}>
        <LazyComponent {...props} />
      </div>
    )
  }
}

// =============================================================================
// Bundle Analysis Helpers
// =============================================================================

/**
 * Analyzes which components are being used to optimize bundle splitting
 */
export function trackComponentUsage(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    const usage = JSON.parse(localStorage.getItem('component-usage') || '{}')
    usage[componentName] = (usage[componentName] || 0) + 1
    localStorage.setItem('component-usage', JSON.stringify(usage))
  }
}

/**
 * Reports component usage statistics for optimization insights
 */
export function getComponentUsageStats(): Record<string, number> {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('component-usage') || '{}')
  }
  return {}
}

/**
 * Identifies components that should be included in the main bundle
 */
export function getHighUsageComponents(threshold = 10): string[] {
  const usage = getComponentUsageStats()
  return Object.entries(usage)
    .filter(([, count]) => count >= threshold)
    .map(([component]) => component)
}

// =============================================================================
// Dynamic Route-Based Code Splitting
// =============================================================================

/**
 * Dynamically loads industry-specific components based on the current route
 */
export async function loadIndustryComponents(industry: string) {
  switch (industry) {
    case 'home-services':
      return {
        Dashboard: (await import('@/components/industry/home-services/dashboard')).default,
        WorkOrderForm: (await import('@/components/industry/home-services/work-order-form')).default,
        Scheduler: (await import('@/components/industry/home-services/scheduler')).default,
      }
    
    case 'restaurant':
      return {
        POSSystem: (await import('@/components/industry/restaurant/pos-system')).default,
        MenuManager: (await import('@/components/industry/restaurant/menu-manager')).default,
        OrderTracker: (await import('@/components/industry/restaurant/order-tracker')).default,
      }
    
    case 'auto':
      return {
        RepairOrder: (await import('@/components/industry/auto/repair-order')).default,
        Inventory: (await import('@/components/industry/auto/inventory')).default,
        Estimator: (await import('@/components/industry/auto/estimator')).default,
      }
    
    case 'retail':
      return {
        POSSystem: (await import('@/components/industry/retail/pos-system')).default,
        InventoryManager: (await import('@/components/industry/retail/inventory-manager')).default,
        CustomerManager: (await import('@/components/industry/retail/customer-manager')).default,
      }
    
    default:
      throw new Error('Unknown industry: ${industry}')
  }
}

/**
 * Preloads critical components for faster initial page loads
 */
export function preloadCriticalComponents(): void {
  // Always preload core components
  const criticalComponents = [
    () => import('@/components/ui/button'),
    () => import('@/components/ui/input'),
    () => import('@/components/ui/card'),
    () => import('@/components/navigation/sidebar'),
    () => import('@/components/navigation/top-navigation'),
  ]

  criticalComponents.forEach(preloadComponent)
}

// Initialize critical component preloading
if (typeof window !== 'undefined') {
  // Preload critical components after a short delay to avoid blocking initial render
  setTimeout(preloadCriticalComponents, 1000)
}