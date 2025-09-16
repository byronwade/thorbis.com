'use client'

import { Metric } from 'web-vitals'

export interface WebVitalsReport {
  metric: string
  value: number
  delta: number
  id: string
  url: string
  timestamp: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
  connectionType?: string
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
  sessionId: string
  userId?: string
}

export interface WebVitalsThresholds {
  good: number
  poor: number
}

export interface WebVitalsConfig {
  enabledMetrics: string[]
  reportingEndpoint: string
  batchSize: number
  batchTimeout: number
  enableDebugLogging: boolean
  thresholds: Record<string, WebVitalsThresholds>
}

class WebVitalsTrackingService {
  private config: WebVitalsConfig
  private reportQueue: WebVitalsReport[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private sessionId: string
  private userId?: string
  private isInitialized = false

  private defaultThresholds: Record<string, WebVitalsThresholds> = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 }
  }

  constructor(config: Partial<WebVitalsConfig> = {}) {
    this.config = {
      enabledMetrics: ['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP'],
      reportingEndpoint: '/api/v1/monitoring/web-vitals',
      batchSize: 10,
      batchTimeout: 30000, // 30 seconds
      enableDebugLogging: process.env.NODE_ENV === 'development',
      thresholds: this.defaultThresholds,
      ...config
    }

    this.sessionId = this.generateSessionId()
    
    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  private generateSessionId(): string {
    return 'wv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}'
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getConnectionType(): string {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return 'unknown'
    }
    
    const connection = (navigator as any).connection
    return connection?.effectiveType || connection?.type || 'unknown'
  }

  private getNavigationType(): string {
    if (typeof performance === 'undefined' || !performance.navigation) {
      return 'unknown'
    }

    const navigation = performance.navigation
    switch (navigation.type) {
      case 0: return 'navigate'
      case 1: return 'reload'
      case 2: return 'back_forward'
      default: return 'unknown'
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.config.thresholds[metricName]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  private async initializeTracking() {
    if (this.isInitialized) return

    try {
      // Dynamic import to handle web-vitals
      const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals')
      
      // Set up metric handlers
      const metricHandlers = {
        CLS: onCLS,
        FID: onFID,
        FCP: onFCP,
        LCP: onLCP,
        TTFB: onTTFB,
        INP: onINP
      }

      // Initialize enabled metrics
      this.config.enabledMetrics.forEach(metricName => {
        const handler = metricHandlers[metricName as keyof typeof metricHandlers]
        if (handler) {
          handler((metric: Metric) => this.handleMetric(metric))
        }
      })

      this.isInitialized = true
      
      if (this.config.enableDebugLogging) {
        console.log('WebVitals tracking initialized with metrics:', this.config.enabledMetrics)
      }
    } catch (error) {
      console.error('Failed to initialize WebVitals tracking:', error)
    }
  }

  private handleMetric(metric: Metric) {
    const report: WebVitalsReport = {
      metric: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now(),
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType(),
      rating: this.getRating(metric.name, metric.value),
      navigationType: this.getNavigationType(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    if (this.config.enableDebugLogging) {
      console.log('WebVitals ${metric.name}:', {
        value: metric.value,
        rating: report.rating,
        delta: metric.delta,
        deviceType: report.deviceType,
        connectionType: report.connectionType
      })
    }

    this.queueReport(report)
  }

  private queueReport(report: WebVitalsReport) {
    this.reportQueue.push(report)

    // Send immediately for poor ratings or when batch is full
    if (report.rating === 'poor' || this.reportQueue.length >= this.config.batchSize) {
      this.flushReports()
    } else {
      // Set up batch timer if not already set
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.flushReports()
        }, this.config.batchTimeout)
      }
    }
  }

  private async flushReports() {
    if (this.reportQueue.length === 0) return

    const reportsToSend = [...this.reportQueue]
    this.reportQueue = []

    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports: reportsToSend })
      })

      if (this.config.enableDebugLogging) {
        console.log('Sent ${reportsToSend.length} WebVitals reports')
      }
    } catch (error) {
      console.error('Failed to send WebVitals reports:', error)
      
      // Store failed reports in localStorage for retry
      this.storeFailedReports(reportsToSend)
    }
  }

  private storeFailedReports(reports: WebVitalsReport[]) {
    if (typeof localStorage === 'undefined') return

    try {
      const key = 'failed-webvitals-reports'
      const existingReports = JSON.parse(localStorage.getItem(key) || '[]') as WebVitalsReport[]
      const allReports = [...existingReports, ...reports]
      
      // Keep only the last 100 failed reports
      if (allReports.length > 100) {
        allReports.splice(0, allReports.length - 100)
      }
      
      localStorage.setItem(key, JSON.stringify(allReports))
    } catch (error) {
      console.error('Failed to store failed WebVitals reports:', error)
    }
  }

  public async retryFailedReports() {
    if (typeof localStorage === 'undefined') return

    try {
      const key = 'failed-webvitals-reports'
      const failedReports = JSON.parse(localStorage.getItem(key) || '[]') as WebVitalsReport[]
      
      if (failedReports.length === 0) return

      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports: failedReports })
      })

      // Clear stored reports on successful retry
      localStorage.removeItem(key)
      
      if (this.config.enableDebugLogging) {
        console.log('Retried ${failedReports.length} failed WebVitals reports')
      }
    } catch (error) {
      console.error('Failed to retry WebVitals reports:', error)
    }
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  public updateConfig(newConfig: Partial<WebVitalsConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  public getMetricsSummary(): Record<string, { value: number; rating: string }> {
    const summary: Record<string, { value: number; rating: string }> = {}
    
    // This would typically come from stored metrics or API
    // For now, return sample data
    this.config.enabledMetrics.forEach(metric => {
      summary[metric] = {
        value: 0,
        rating: 'good'
      }
    })
    
    return summary
  }

  public async forceBatch() {
    await this.flushReports()
  }

  // Get performance statistics for dashboard
  public getPerformanceStats() {
    const stats = {
      totalMeasurements: 0,
      averageValues: Record<string, unknown> as Record<string, number>,
      ratingDistribution: Record<string, unknown> as Record<string, Record<string, number>>,
      deviceBreakdown: Record<string, unknown> as Record<string, number>,
      connectionBreakdown: Record<string, unknown> as Record<string, number>
    }

    // This would typically come from aggregated data
    // For now, return sample statistics
    this.config.enabledMetrics.forEach(metric => {
      stats.averageValues[metric] = 0
      stats.ratingDistribution[metric] = {
        good: 0,
        'needs-improvement': 0,
        poor: 0
      }
    })

    return stats
  }
}

// Singleton instance
export const webVitalsTracking = new WebVitalsTrackingService()

// Utility functions
export function trackCustomMetric(name: string, value: number, context?: Record<string, unknown>) {
  const report: Partial<WebVitalsReport> = {
    metric: 'custom-${name}',
    value,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ',
    deviceType: webVitalsTracking['getDeviceType'](),
    connectionType: webVitalsTracking['getConnectionType'](),
    rating: 'good', // Custom metrics default to good
    sessionId: webVitalsTracking['sessionId']
  }

  // Send custom metric immediately
  fetch('/api/v1/monitoring/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reports: [report] })
  }).catch(error => {
    console.error('Failed to send custom metric:', error)
  })
}

export function measurePageLoad(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      resolve(0)
      return
    }

    if (document.readyState === 'complete') {
      const loadTime = performance.now()
      resolve(loadTime)
    } else {
      window.addEventListener('load', () => {
        const loadTime = performance.now()
        trackCustomMetric('page-load-time', loadTime)
        resolve(loadTime)
      }, { once: true })
    }
  })
}

export function measureTimeToInteractive(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(0)
      return
    }

    // Simple TTI approximation using load event + small delay
    window.addEventListener('load', () => {
      setTimeout(() => {
        const tti = performance.now()
        trackCustomMetric('time-to-interactive', tti)
        resolve(tti)
      }, 100)
    }, { once: true })
  })
}

export function getWebVitalsThresholds() {
  return webVitalsTracking['defaultThresholds']
}

export default webVitalsTracking