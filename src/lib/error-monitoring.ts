'use client'

import { ErrorBoundaryError } from './error-handling'

export interface ErrorReport {
  message: string
  stack?: string
  timestamp: number
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  errorType: 'javascript' | 'react' | 'network' | 'custom'
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, unknown>
}

export interface PerformanceReport {
  metric: string
  value: number
  url: string
  timestamp: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
  connectionType?: string
}

class ErrorMonitoringService {
  private apiEndpoint: string
  private sessionId: string
  private userId?: string
  private isProduction: boolean

  constructor() {
    this.apiEndpoint = '/api/v1/monitoring/errors'
    this.sessionId = this.generateSessionId()
    this.isProduction = process.env.NODE_ENV === 'production'
    
    if (typeof window !== 'undefined') {
      this.initializeGlobalErrorHandlers()
      this.initializePerformanceMonitoring()
    }
  }

  private generateSessionId(): string {
    return '${Date.now()}-${Math.random().toString(36).substr(2, 9)}'
  }

  private initializeGlobalErrorHandlers(): void {
    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        errorType: 'javascript',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        errorType: 'javascript',
        severity: 'medium',
        context: {
          reason: event.reason
        }
      })
    })
  }

  private initializePerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Use dynamic import to handle web-vitals
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        const deviceType = this.getDeviceType()
        
        onCLS((metric) => this.reportPerformance({
          metric: 'CLS',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))

        onFID((metric) => this.reportPerformance({
          metric: 'FID',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))

        onFCP((metric) => this.reportPerformance({
          metric: 'FCP',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))

        onLCP((metric) => this.reportPerformance({
          metric: 'LCP',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))

        onTTFB((metric) => this.reportPerformance({
          metric: 'TTFB',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))

        onINP((metric) => this.reportPerformance({
          metric: 'INP',
          value: metric.value,
          url: window.location.href,
          timestamp: Date.now(),
          deviceType,
          connectionType: this.getConnectionType()
        }))
      }).catch(error => {
        console.warn('Failed to load web-vitals:', error)
      })
    }
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
    return connection?.effectiveType || 'unknown'
  }

  public setUserId(userId: string): void {
    this.userId = userId
  }

  public captureError(error: ErrorReport): void {
    // Don't capture errors in development unless explicitly enabled
    if (!this.isProduction && !process.env.ENABLE_DEV_ERROR_REPORTING) {
      console.error('Error captured (dev mode):', error)
      return
    }

    // Rate limiting: don't send more than 10 errors per minute
    if (!this.shouldReportError()) {
      return
    }

    this.sendErrorReport(error).catch(sendError => {
      console.error('Failed to send error report:', sendError)
      this.storeErrorLocally(error)
    })
  }

  public captureReactError(error: ErrorBoundaryError, errorInfo: unknown): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ',
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: 'react',
      severity: 'high',
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary,
        ...error.context
      }
    })
  }

  public captureNetworkError(url: string, status: number, statusText: string): void {
    this.captureError({
      message: 'Network error: ${status} ${statusText}',
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ',
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: 'network',
      severity: status >= 500 ? 'high' : 'medium',
      context: {
        requestUrl: url,
        status,
        statusText
      }
    })
  }

  public captureCustomError(message: string, context?: Record<string, unknown>, severity: ErrorReport['severity'] = 'medium'): void {
    this.captureError({
      message,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ',
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: 'custom',
      severity,
      context
    })
  }

  private shouldReportError(): boolean {
    const key = 'error-reports'
    const now = Date.now()
    const minute = 60 * 1000
    
    if (typeof window === 'undefined') return true
    
    const reports = JSON.parse(localStorage.getItem(key) || '[]') as number[]
    const recentReports = reports.filter(timestamp => now - timestamp < minute)
    
    if (recentReports.length >= 10) {
      return false
    }
    
    recentReports.push(now)
    localStorage.setItem(key, JSON.stringify(recentReports))
    return true
  }

  private async sendErrorReport(error: ErrorReport): Promise<void> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(error)
    })

    if (!response.ok) {
      throw new Error('Failed to send error report: ${response.status}')
    }
  }

  private storeErrorLocally(error: ErrorReport): void {
    if (typeof window === 'undefined') return
    
    try {
      const key = 'stored-errors'
      const errors = JSON.parse(localStorage.getItem(key) || '[]') as ErrorReport[]
      errors.push(error)
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50)
      }
      
      localStorage.setItem(key, JSON.stringify(errors))
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError)
    }
  }

  private async reportPerformance(report: PerformanceReport): Promise<void> {
    if (!this.isProduction) return
    
    try {
      await fetch('/api/v1/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...report,
          sessionId: this.sessionId,
          userId: this.userId
        })
      })
    } catch (error) {
      console.error('Failed to report performance metric:', error)
    }
  }

  public async retryStoredErrors(): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      const key = 'stored-errors'
      const errors = JSON.parse(localStorage.getItem(key) || '[]') as ErrorReport[]
      
      if (errors.length === 0) return
      
      for (const error of errors) {
        try {
          await this.sendErrorReport(error)
        } catch (retryError) {
          console.error('Failed to retry error report:', retryError)
          break // Stop retrying if still failing
        }
      }
      
      // Clear stored errors on successful retry
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to retry stored errors:', error)
    }
  }

  public getErrorStats(): { totalErrors: number, recentErrors: number } {
    if (typeof window === 'undefined') return { totalErrors: 0, recentErrors: 0 }
    
    try {
      const errors = JSON.parse(localStorage.getItem('stored-errors') || '[]') as ErrorReport[]
      const reports = JSON.parse(localStorage.getItem('error-reports') || '[]') as number[]
      const now = Date.now()
      const hour = 60 * 60 * 1000
      const recentReports = reports.filter(timestamp => now - timestamp < hour)
      
      return {
        totalErrors: errors.length,
        recentErrors: recentReports.length
      }
    } catch (_error) {
      return { totalErrors: 0, recentErrors: 0 }
    }
  }
}

// Singleton instance
export const errorMonitoring = new ErrorMonitoringService()

// Utility functions
export function captureError(error: Error, context?: Record<string, unknown>): void {
  errorMonitoring.captureError({
    message: error.message,
    stack: error.stack,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ',
    errorType: 'custom',
    severity: 'medium',
    context
  })
}

export function captureException(error: Error, severity: ErrorReport['severity'] = 'medium'): void {
  errorMonitoring.captureCustomError(error.message, { stack: error.stack }, severity)
}

export function addBreadcrumb(message: string, category: string = 'navigation', data?: Record<string, unknown>): void {
  // Store breadcrumbs for error context
  if (typeof window === 'undefined') return
  
  const breadcrumbs = JSON.parse(sessionStorage.getItem('error-breadcrumbs') || '[]')
  breadcrumbs.push({
    message,
    category,
    timestamp: Date.now(),
    data
  })
  
  // Keep only last 20 breadcrumbs
  if (breadcrumbs.length > 20) {
    breadcrumbs.splice(0, breadcrumbs.length - 20)
  }
  
  sessionStorage.setItem('error-breadcrumbs', JSON.stringify(breadcrumbs))
}

export default errorMonitoring