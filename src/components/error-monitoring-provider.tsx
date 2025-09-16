'use client'

import { useEffect } from 'react'
import { useErrorMonitoring } from '@/hooks/use-error-monitoring'

interface ErrorMonitoringProviderProps {
  children: React.ReactNode
  userId?: string
}

export function ErrorMonitoringProvider({ children, userId }: ErrorMonitoringProviderProps) {
  // Initialize error monitoring with the provided user ID
  useErrorMonitoring({
    userId,
    enableRouteTracking: true,
    enableNetworkErrorTracking: true,
    enablePerformanceTracking: true
  })

  useEffect(() => {
    // Add initial breadcrumb for app initialization
    if (typeof window !== 'undefined') {
      const breadcrumbs = JSON.parse(sessionStorage.getItem('error-breadcrumbs') || '[]')
      breadcrumbs.push({
        message: 'Application initialized',
        category: 'system',
        timestamp: Date.now(),
        data: {
          userAgent: navigator.userAgent,
          viewport: '${window.innerWidth}x${window.innerHeight}',
          url: window.location.href
        }
      })
      sessionStorage.setItem('error-breadcrumbs', JSON.stringify(breadcrumbs))
    }
  }, [])

  return <>{children}</>
}