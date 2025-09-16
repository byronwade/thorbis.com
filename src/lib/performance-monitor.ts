/**
 * Performance Monitoring and Optimization Library
 * 
 * Provides comprehensive performance monitoring, metrics collection,
 * and optimization utilities for the Thorbis Business OS API
 */

import { performance, PerformanceObserver } from 'perf_hooks'
import { EventEmitter } from 'events'

// Performance metrics interfaces
export interface PerformanceMetrics {
  timestamp: Date
  requestId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  dbQueryTime?: number
  dbQueryCount?: number
  cacheHits?: number
  cacheMisses?: number
  errorCount?: number
}

export interface PerformanceThresholds {
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
  memoryUsage: {
    heapUsed: number
    external: number
  }
  dbQueryTime: {
    average: number
    max: number
  }
  errorRate: number
}

export interface OptimizationRecommendation {
  type: 'cache' | 'query' | 'memory' | 'cpu' | 'database' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  solution: string
  estimatedImprovement: string
}

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  responseTime: {
    p50: 200,   // 200ms median
    p95: 500,   // 500ms 95th percentile
    p99: 1000   // 1s 99th percentile
  },
  memoryUsage: {
    heapUsed: 500 * 1024 * 1024,    // 500MB
    external: 100 * 1024 * 1024     // 100MB
  },
  dbQueryTime: {
    average: 50,  // 50ms average
    max: 200      // 200ms max
  },
  errorRate: 0.01 // 1% error rate
}

/**
 * Performance Monitor Class
 * Collects and analyzes performance metrics in real-time
 */
export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = []
  private observer: PerformanceObserver
  private thresholds: PerformanceThresholds
  private startTime: number
  private requestCounts = new Map<string, number>()
  private responseTimes = new Map<string, number[]>()
  private errorCounts = new Map<string, number>()

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    super()
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
    this.startTime = Date.now()
    this.setupPerformanceObserver()
  }

  private setupPerformanceObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        if (entry.entryType === 'measure' && entry.name.startsWith('http-request')) {
          this.processHttpRequestMetric(entry)
        }
      }
    })

    this.observer.observe({ entryTypes: ['measure'] })
  }

  private processHttpRequestMetric(entry: PerformanceEntry) {
    const [, requestId] = entry.name.split('-')
    // Additional processing for HTTP request metrics
    this.emit('http-request-measured', {
      requestId,
      duration: entry.duration,
      startTime: entry.startTime
    })
  }

  /**
   * Record performance metrics for a request
   */
  recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics)
    
    // Update running statistics
    const endpoint = '${metrics.method} ${metrics.endpoint}'
    
    // Request count tracking
    this.requestCounts.set(endpoint, (this.requestCounts.get(endpoint) || 0) + 1)
    
    // Response time tracking
    if (!this.responseTimes.has(endpoint)) {
      this.responseTimes.set(endpoint, [])
    }
    this.responseTimes.get(endpoint)!.push(metrics.responseTime)
    
    // Error tracking
    if (metrics.statusCode >= 400) {
      this.errorCounts.set(endpoint, (this.errorCounts.get(endpoint) || 0) + 1)
    }

    // Check thresholds and emit warnings
    this.checkThresholds(metrics)
    
    // Emit metrics event
    this.emit('metrics-recorded`, metrics)
    
    // Keep only recent metrics (last 1000 requests)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Check if metrics exceed thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics) {
    const warnings: string[] = []

    // Response time checks
    if (metrics.responseTime > this.thresholds.responseTime.p99) {
      warnings.push(`Response time ${metrics.responseTime}ms exceeds P99 threshold ${this.thresholds.responseTime.p99}ms`)
    }

    // Memory usage checks
    if (metrics.memoryUsage.heapUsed > this.thresholds.memoryUsage.heapUsed) {
      warnings.push(`Heap usage ${metrics.memoryUsage.heapUsed} exceeds threshold ${this.thresholds.memoryUsage.heapUsed}')
    }

    // Database query checks
    if (metrics.dbQueryTime && metrics.dbQueryTime > this.thresholds.dbQueryTime.max) {
      warnings.push('DB query time ${metrics.dbQueryTime}ms exceeds threshold ${this.thresholds.dbQueryTime.max}ms')
    }

    if (warnings.length > 0) {
      this.emit('threshold-exceeded', {
        requestId: metrics.requestId,
        endpoint: metrics.endpoint,
        warnings
      })
    }
  }

  /**
   * Calculate performance statistics
   */
  getStatistics(timeWindowMinutes: number = 10) {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff)

    if (recentMetrics.length === 0) {
      return null
    }

    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b)
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length
    
    return {
      totalRequests: recentMetrics.length,
      errorRate: errorCount / recentMetrics.length,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        median: this.percentile(responseTimes, 0.5),
        p95: this.percentile(responseTimes, 0.95),
        p99: this.percentile(responseTimes, 0.99),
        average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      },
      memory: {
        averageHeapUsed: recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length,
        maxHeapUsed: Math.max(...recentMetrics.map(m => m.memoryUsage.heapUsed)),
        averageExternal: recentMetrics.reduce((sum, m) => sum + m.memoryUsage.external, 0) / recentMetrics.length
      },
      database: {
        averageQueryTime: recentMetrics.filter(m => m.dbQueryTime).reduce((sum, m) => sum + (m.dbQueryTime || 0), 0) / recentMetrics.filter(m => m.dbQueryTime).length || 0,
        totalQueries: recentMetrics.reduce((sum, m) => sum + (m.dbQueryCount || 0), 0),
        cacheHitRate: recentMetrics.reduce((sum, m) => sum + (m.cacheHits || 0), 0) / Math.max(1, recentMetrics.reduce((sum, m) => sum + (m.cacheHits || 0) + (m.cacheMisses || 0), 0))
      }
    }
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0
    const index = Math.ceil(sortedArray.length * p) - 1
    return sortedArray[Math.max(0, index)]
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): OptimizationRecommendation[] {
    const stats = this.getStatistics(30) // Last 30 minutes
    const recommendations: OptimizationRecommendation[] = []

    if (!stats) return recommendations

    // Response time recommendations
    if (stats.responseTime.p95 > this.thresholds.responseTime.p95) {
      recommendations.push({
        type: 'cache',
        severity: stats.responseTime.p95 > this.thresholds.responseTime.p99 ? 'critical' : 'high',
        title: 'High Response Times Detected',
        description: 'P95 response time is ${stats.responseTime.p95.toFixed(2)}ms, exceeding threshold of ${this.thresholds.responseTime.p95}ms',
        impact: 'Poor user experience and potential timeout errors',
        solution: 'Implement Redis caching for frequently accessed data, optimize database queries, and consider API response pagination',
        estimatedImprovement: 'Could reduce response times by 40-60%'
      })
    }

    // Memory usage recommendations
    if (stats.memory.maxHeapUsed > this.thresholds.memoryUsage.heapUsed) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        title: 'High Memory Usage Detected',
        description: 'Peak heap usage is ${(stats.memory.maxHeapUsed / 1024 / 1024).toFixed(2)}MB, exceeding threshold of ${(this.thresholds.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB',
        impact: 'Risk of out-of-memory errors and degraded performance',
        solution: 'Implement connection pooling, optimize object lifecycle, and add memory leak detection',
        estimatedImprovement: 'Could reduce memory usage by 30-50%'
      })
    }

    // Database performance recommendations
    if (stats.database.averageQueryTime > this.thresholds.dbQueryTime.average) {
      recommendations.push({
        type: 'database',
        severity: 'medium',
        title: 'Slow Database Queries Detected',
        description: 'Average query time is ${stats.database.averageQueryTime.toFixed(2)}ms, exceeding threshold of ${this.thresholds.dbQueryTime.average}ms',
        impact: 'Increased response times and database load',
        solution: 'Add database indexes, optimize query patterns, and implement query result caching',
        estimatedImprovement: 'Could reduce query times by 50-70%'
      })
    }

    // Cache performance recommendations
    if (stats.database.cacheHitRate < 0.8) {
      recommendations.push({
        type: 'cache',
        severity: 'medium',
        title: 'Low Cache Hit Rate',
        description: 'Cache hit rate is ${(stats.database.cacheHitRate * 100).toFixed(1)}%, which is below optimal threshold of 80%',
        impact: 'Unnecessary database load and slower response times',
        solution: 'Optimize cache key strategies, increase cache TTL for stable data, and implement cache warming',
        estimatedImprovement: 'Could improve response times by 20-40%'
      })
    }

    // Error rate recommendations
    if (stats.errorRate > this.thresholds.errorRate) {
      recommendations.push({
        type: 'network',
        severity: stats.errorRate > 0.05 ? 'critical' : 'high',
        title: 'High Error Rate Detected',
        description: 'Error rate is ${(stats.errorRate * 100).toFixed(2)}%, exceeding threshold of ${(this.thresholds.errorRate * 100).toFixed(2)}%',
        impact: 'Poor user experience and potential system instability',
        solution: 'Implement circuit breakers, improve error handling, and add retry mechanisms with exponential backoff',
        estimatedImprovement: 'Could reduce error rate by 80-90%'
      })
    }

    return recommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Get endpoint performance breakdown
   */
  getEndpointBreakdown() {
    const endpointStats = new Map<string, {
      count: number
      totalTime: number
      errors: number
      avgResponseTime: number
      errorRate: number
    }>()

    for (const [endpoint, times] of this.responseTimes.entries()) {
      const count = this.requestCounts.get(endpoint) || 0
      const errors = this.errorCounts.get(endpoint) || 0
      const totalTime = times.reduce((sum, time) => sum + time, 0)

      endpointStats.set(endpoint, {
        count,
        totalTime,
        errors,
        avgResponseTime: totalTime / times.length,
        errorRate: errors / count
      })
    }

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.count - a.count) // Sort by request count
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'prometheus' | 'json' | 'csv' = 'json') {
    const stats = this.getStatistics()
    const endpointBreakdown = this.getEndpointBreakdown()

    switch (format) {
      case 'prometheus':
        return this.formatPrometheusMetrics(stats, endpointBreakdown)
      case 'csv':
        return this.formatCSVMetrics()
      default:
        return {
          timestamp: new Date().toISOString(),
          uptime: Date.now() - this.startTime,
          statistics: stats,
          endpoints: endpointBreakdown,
          recommendations: this.generateRecommendations()
        }
    }
  }

  private formatPrometheusMetrics(stats: unknown, endpoints: unknown[]) {
    if (!stats) return ''

    const output = `
    
    // Response time metrics
    output += `# HELP http_request_duration_seconds Request duration in seconds
`
    output += `# TYPE http_request_duration_seconds histogram
`
    output += `http_request_duration_seconds{quantile="0.5"} ${stats.responseTime.median / 1000}
`
    output += `http_request_duration_seconds{quantile="0.95"} ${stats.responseTime.p95 / 1000}
`
    output += `http_request_duration_seconds{quantile="0.99"} ${stats.responseTime.p99 / 1000}
`

    // Request count metrics
    output += `# HELP http_requests_total Total HTTP requests
`
    output += `# TYPE http_requests_total counter
`
    output += `http_requests_total ${stats.totalRequests}
`

    // Error rate metrics
    output += `# HELP http_request_error_rate HTTP request error rate
`
    output += `# TYPE http_request_error_rate gauge
`
    output += `http_request_error_rate ${stats.errorRate}
`

    // Memory metrics
    output += `# HELP process_memory_heap_bytes Process heap memory usage
`
    output += `# TYPE process_memory_heap_bytes gauge
`
    output += 'process_memory_heap_bytes ${stats.memory.averageHeapUsed}
'

    return output
  }

  private formatCSVMetrics() {
    const headers = 'timestamp,requestId,endpoint,method,statusCode,responseTime,heapUsed,external,dbQueryTime,dbQueryCount,cacheHits,cacheMisses'
    const rows = this.metrics.map(m => [
      m.timestamp.toISOString(),
      m.requestId,
      m.endpoint,
      m.method,
      m.statusCode,
      m.responseTime,
      m.memoryUsage.heapUsed,
      m.memoryUsage.external,
      m.dbQueryTime || ',
      m.dbQueryCount || ',
      m.cacheHits || ',
      m.cacheMisses || '
    ].join(',)).join('
')

    return '${headers}
${rows}'
  }

  /**
   * Start continuous monitoring with periodic reports
   */
  startContinuousMonitoring(intervalMinutes: number = 5) {
    const interval = setInterval(() => {
      const stats = this.getStatistics(intervalMinutes)
      const recommendations = this.generateRecommendations()

      this.emit('periodic-report', {
        timestamp: new Date(),
        statistics: stats,
        recommendations,
        endpointBreakdown: this.getEndpointBreakdown()
      })
    }, intervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }

  /**
   * Cleanup and stop monitoring
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.removeAllListeners()
    this.metrics = []
    this.requestCounts.clear()
    this.responseTimes.clear()
    this.errorCounts.clear()
  }
}

/**
 * Performance Middleware for Express/Next.js
 */
export function createPerformanceMiddleware(monitor: PerformanceMonitor) {
  return (req: unknown, res: unknown, next: unknown) => {
    const startTime = process.hrtime.bigint()
    const startCpuUsage = process.cpuUsage()
    const requestId = req.headers['x-request-id`] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Mark the start of the request
    performance.mark(`http-request-start-${requestId}`)

    // Override res.end to capture metrics
    const originalEnd = res.end
    res.end = function(chunk?: any, encoding?: any) {
      // Mark the end and measure
      performance.mark(`http-request-end-${requestId}`)
      performance.measure(`http-request-${requestId}`, `http-request-start-${requestId}', 'http-request-end-${requestId}')

      const endTime = process.hrtime.bigint()
      const endCpuUsage = process.cpuUsage(startCpuUsage)
      const responseTime = Number(endTime - startTime) / 1e6 // Convert to milliseconds

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        requestId,
        endpoint: req.route?.path || req.path || 'unknown`,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        memoryUsage: process.memoryUsage(),
        cpuUsage: endCpuUsage,
        dbQueryTime: req.dbQueryTime,
        dbQueryCount: req.dbQueryCount,
        cacheHits: req.cacheHits,
        cacheMisses: req.cacheMisses
      }

      monitor.recordMetrics(metrics)
      
      // Clean up performance marks
      performance.clearMarks(`http-request-start-${requestId}`)
      performance.clearMarks(`http-request-end-${requestId}')
      performance.clearMeasures('http-request-${requestId}')

      return originalEnd.call(this, chunk, encoding)
    }

    next()
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor()

// Auto-start continuous monitoring in production
if (process.env.NODE_ENV === 'production') {
  globalPerformanceMonitor.startContinuousMonitoring(5) // 5-minute intervals
}

export default PerformanceMonitor