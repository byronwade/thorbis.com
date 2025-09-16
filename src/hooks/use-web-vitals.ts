'use client'

import { useEffect, useState, useCallback } from 'react'
import { webVitalsTracking, trackCustomMetric, measurePageLoad, measureTimeToInteractive } from '@/lib/web-vitals-tracking'

interface WebVitalsHookOptions {
  userId?: string
  enableDebugLogging?: boolean
  enableCustomMetrics?: boolean
  trackUserInteractions?: boolean
}

interface WebVitalsMetrics {
  [key: string]: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
  }
}

export function useWebVitals(options: WebVitalsHookOptions = {}) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({})
  const [isTracking, setIsTracking] = useState(false)
  
  const {
    userId,
    enableDebugLogging = false,
    enableCustomMetrics = true,
    trackUserInteractions = false
  } = options

  useEffect(() => {
    if (userId) {
      webVitalsTracking.setUserId(userId)
    }

    webVitalsTracking.updateConfig({
      enableDebugLogging
    })

    setIsTracking(true)

    return () => {
      setIsTracking(false)
    }
  }, [userId, enableDebugLogging])

  // Track custom page load metrics
  const trackPageLoad = useCallback(async () => {
    if (!enableCustomMetrics) return

    try {
      const loadTime = await measurePageLoad()
      const tti = await measureTimeToInteractive()
      
      setMetrics(prev => ({
        ...prev,
        'page-load': {
          value: loadTime,
          rating: loadTime <= 3000 ? 'good' : loadTime <= 5000 ? 'needs-improvement' : 'poor',
          timestamp: Date.now()
        },
        'tti': {
          value: tti,
          rating: tti <= 5000 ? 'good' : tti <= 10000 ? 'needs-improvement' : 'poor',
          timestamp: Date.now()
        }
      }))
    } catch (error) {
      console.error('Failed to track page load metrics:', error)
    }
  }, [enableCustomMetrics])

  // Track custom performance metric
  const trackCustomPerformanceMetric = useCallback((name: string, value: number, context?: Record<string, unknown>) => {
    if (!enableCustomMetrics) return

    trackCustomMetric(name, value, context)
    
    setMetrics(prev => ({
      ...prev,
      [name]: {
        value,
        rating: 'good', // Custom metrics default to good
        timestamp: Date.now()
      }
    }))
  }, [enableCustomMetrics])

  // Measure async operation performance
  const measureAsyncOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      
      trackCustomPerformanceMetric('async-${name}', duration, {
        ...context,
        status: 'success'
      })
      
      return result
    } catch (_error) {
      const duration = performance.now() - startTime
      
      trackCustomPerformanceMetric('async-${name}', duration, {
        ...context,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error`
      })
      
      throw error
    }
  }, [trackCustomPerformanceMetric])

  // Measure component render time
  const measureRenderTime = useCallback((componentName: string, context?: Record<string, unknown>) => {
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      trackCustomPerformanceMetric(`render-${componentName}`, renderTime, context)
    }
  }, [trackCustomPerformanceMetric])

  // Track user interaction performance
  const trackInteraction = useCallback((interactionName: string, element?: string) => {
    if (!trackUserInteractions) return

    const startTime = performance.now()
    
    return () => {
      const interactionTime = performance.now() - startTime
      trackCustomPerformanceMetric(`interaction-${interactionName}', interactionTime, {
        element
      })
    }
  }, [trackUserInteractions, trackCustomPerformanceMetric])

  // Get current metrics summary
  const getMetricsSummary = useCallback(() => {
    return webVitalsTracking.getMetricsSummary()
  }, [])

  // Force flush any pending reports
  const flushReports = useCallback(async () => {
    await webVitalsTracking.forceBatch()
  }, [])

  // Retry failed reports
  const retryFailedReports = useCallback(async () => {
    await webVitalsTracking.retryFailedReports()
  }, [])

  return {
    isTracking,
    metrics,
    trackPageLoad,
    trackCustomPerformanceMetric,
    measureAsyncOperation,
    measureRenderTime,
    trackInteraction,
    getMetricsSummary,
    flushReports,
    retryFailedReports
  }
}

// Hook specifically for tracking component performance
export function useComponentPerformance(componentName: string) {
  const { measureRenderTime, trackCustomPerformanceMetric } = useWebVitals({ enableCustomMetrics: true })

  const trackComponentMount = useCallback(() => {
    const mountTime = performance.now()
    trackCustomPerformanceMetric('mount-${componentName}', mountTime, {
      type: 'component-mount'
    })
  }, [componentName, trackCustomPerformanceMetric])

  const trackComponentUpdate = useCallback((reason?: string) => {
    const updateTime = performance.now()
    trackCustomPerformanceMetric('update-${componentName}', updateTime, {
      type: 'component-update',
      reason
    })
  }, [componentName, trackCustomPerformanceMetric])

  const trackComponentUnmount = useCallback(() => {
    const unmountTime = performance.now()
    trackCustomPerformanceMetric('unmount-${componentName}', unmountTime, {
      type: 'component-unmount'
    })
  }, [componentName, trackCustomPerformanceMetric])

  const measureRender = useCallback((context?: Record<string, unknown>) => {
    return measureRenderTime(componentName, context)
  }, [componentName, measureRenderTime])

  return {
    trackComponentMount,
    trackComponentUpdate,
    trackComponentUnmount,
    measureRender
  }
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const { trackInteraction } = useWebVitals({ trackUserInteractions: true })

  const trackClick = useCallback((element: string) => {
    return trackInteraction('click', element)
  }, [trackInteraction])

  const trackFormSubmit = useCallback((formName: string) => {
    return trackInteraction('form-submit', formName)
  }, [trackInteraction])

  const trackNavigation = useCallback((destination: string) => {
    return trackInteraction('navigation', destination)
  }, [trackInteraction])

  const trackSearch = useCallback((query: string) => {
    return trackInteraction('search', query)
  }, [trackInteraction])

  return {
    trackClick,
    trackFormSubmit,
    trackNavigation,
    trackSearch
  }
}

// Hook for monitoring API performance
export function useAPIPerformance() {
  const { measureAsyncOperation } = useWebVitals({ enableCustomMetrics: true })

  const trackAPICall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    return measureAsyncOperation('api-${endpoint}', apiCall, {
      ...context,
      type: 'api-call',
      endpoint
    })
  }, [measureAsyncOperation])

  const trackDataFetch = useCallback(async <T>(
    dataType: string,
    fetchOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    return measureAsyncOperation('fetch-${dataType}', fetchOperation, {
      ...context,
      type: 'data-fetch',
      dataType
    })
  }, [measureAsyncOperation])

  return {
    trackAPICall,
    trackDataFetch
  }
}