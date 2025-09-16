'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { errorMonitoring, addBreadcrumb } from '@/lib/error-monitoring'

interface UseErrorMonitoringOptions {
  userId?: string
  enableRouteTracking?: boolean
  enableNetworkErrorTracking?: boolean
  enablePerformanceTracking?: boolean
}

export function useErrorMonitoring(options: UseErrorMonitoringOptions = {}) {
  const router = useRouter()
  
  const {
    userId,
    enableRouteTracking = true,
    enableNetworkErrorTracking = true,
    enablePerformanceTracking = true
  } = options

  // Initialize error monitoring
  useEffect(() => {
    if (userId) {
      errorMonitoring.setUserId(userId)
    }

    // Track page navigation
    if (enableRouteTracking) {
      addBreadcrumb('Page loaded: ${window.location.pathname}', 'navigation')
    }

    // Set up network error tracking
    if (enableNetworkErrorTracking) {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          
          if (!response.ok) {
            const url = typeof args[0] === 'string' ? args[0] : args[0].url
            errorMonitoring.captureNetworkError(url, response.status, response.statusText)
          }
          
          return response
        } catch (_error) {
          const url = typeof args[0] === 'string' ? args[0] : args[0].url
          errorMonitoring.captureNetworkError(url, 0, 'Network request failed')
          throw error
        }
      }

      // Restore original fetch on cleanup
      return () => {
        window.fetch = originalFetch
      }
    }
  }, [userId, enableRouteTracking, enableNetworkErrorTracking])

  // Track route changes
  useEffect(() => {
    if (!enableRouteTracking) return

    const handleRouteChange = (url: string) => {
      addBreadcrumb('Navigation to: ${url}', 'navigation')
    }

    // Note: This is a simplified example. In a real implementation,
    // you'd need to hook into your router's navigation events.
    // For Next.js App Router, you might use the router events differently
    
    return () => {
      // Cleanup route change listener if needed
    }
  }, [enableRouteTracking])

  // Retry stored errors when online
  useEffect(() => {
    const handleOnline = () => {
      errorMonitoring.retryStoredErrors()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  // Manual error capture functions
  const captureError = useCallback((error: Error, context?: Record<string, unknown>) => {
    errorMonitoring.captureCustomError(error.message, context)
  }, [])

  const captureMessage = useCallback((message: string, level: 'low' | 'medium' | 'high' | 'critical' = 'medium', context?: Record<string, unknown>) => {
    errorMonitoring.captureCustomError(message, context, level)
  }, [])

  const addUserBreadcrumb = useCallback((message: string, category: string = 'user', data?: Record<string, unknown>) => {
    addBreadcrumb(message, category, data)
  }, [])

  // Performance tracking
  const trackPerformanceMetric = useCallback((name: string, value: number, context?: Record<string, unknown>) => {
    if (!enablePerformanceTracking) return

    // Custom performance tracking
    if (typeof window !== 'undefined' && 'performance` in window) {
      performance.mark(`custom-${name}')
      
      errorMonitoring.captureCustomError('Performance: ${name}', {
        ...context,
        value,
        timestamp: Date.now(),
        type: 'performance'
      }, 'low')
    }
  }, [enablePerformanceTracking])

  // User action tracking
  const trackUserAction = useCallback((action: string, details?: Record<string, unknown>) => {
    addBreadcrumb('User action: ${action}', 'user', details)
  }, [])

  // Error stats
  const getErrorStats = useCallback(() => {
    return errorMonitoring.getErrorStats()
  }, [])

  return {
    captureError,
    captureMessage,
    addBreadcrumb: addUserBreadcrumb,
    trackPerformanceMetric,
    trackUserAction,
    getErrorStats
  }
}

// Hook for tracking specific user interactions
export function useUserInteractionTracking() {
  const { trackUserAction } = useErrorMonitoring()

  const trackClick = useCallback((element: string, context?: Record<string, unknown>) => {
    trackUserAction('click', { element, ...context })
  }, [trackUserAction])

  const trackFormSubmit = useCallback((formName: string, context?: Record<string, unknown>) => {
    trackUserAction('form_submit', { formName, ...context })
  }, [trackUserAction])

  const trackPageView = useCallback((page: string, context?: Record<string, unknown>) => {
    trackUserAction('page_view', { page, ...context })
  }, [trackUserAction])

  const trackSearch = useCallback((query: string, results: number, context?: Record<string, unknown>) => {
    trackUserAction('search', { query, results, ...context })
  }, [trackUserAction])

  const trackError = useCallback((errorType: string, context?: Record<string, unknown>) => {
    trackUserAction('error_encountered', { errorType, ...context })
  }, [trackUserAction])

  return {
    trackClick,
    trackFormSubmit,
    trackPageView,
    trackSearch,
    trackError
  }
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const { trackPerformanceMetric } = useErrorMonitoring({ enablePerformanceTracking: true })

  const measureAsyncOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      
      trackPerformanceMetric('async_operation_${name}', duration, {
        ...context,
        status: 'success'
      })
      
      return result
    } catch (_error) {
      const duration = performance.now() - startTime
      
      trackPerformanceMetric('async_operation_${name}', duration, {
        ...context,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }, [trackPerformanceMetric])

  const measureSyncOperation = useCallback(<T>(
    name: string,
    operation: () => T,
    context?: Record<string, unknown>
  ): T => {
    const startTime = performance.now()
    
    try {
      const result = operation()
      const duration = performance.now() - startTime
      
      trackPerformanceMetric('sync_operation_${name}', duration, {
        ...context,
        status: 'success'
      })
      
      return result
    } catch (_error) {
      const duration = performance.now() - startTime
      
      trackPerformanceMetric('sync_operation_${name}', duration, {
        ...context,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }, [trackPerformanceMetric])

  const measureRenderTime = useCallback((componentName: string, context?: Record<string, unknown>) => {
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      trackPerformanceMetric('component_render_${componentName}', renderTime, context)
    }
  }, [trackPerformanceMetric])

  return {
    measureAsyncOperation,
    measureSyncOperation,
    measureRenderTime,
    trackPerformanceMetric
  }
}