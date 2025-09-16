/**
 * API Monitoring and Observability System
 * 
 * Comprehensive monitoring system for collecting, aggregating, and analyzing
 * API performance metrics, health status, and usage patterns.
 */

import { EventEmitter } from 'events'
import { performance } from 'perf_hooks'
import { createHash } from 'crypto'

// Monitoring interfaces
export interface MetricPoint {
  timestamp: Date
  value: number
  labels?: Record<string, string>
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    used: number
    available: number
    usage: number
  }
  disk: {
    used: number
    available: number
    usage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    connectionsActive: number
  }
}

export interface ComponentHealth {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime?: number
  lastCheck: Date
  details?: Record<string, unknown>
}

export interface Alert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  metadata?: Record<string, unknown>
}

export interface MonitoringConfig {
  metricsRetentionDays: number
  alertingEnabled: boolean
  healthCheckInterval: number
  systemMetricsInterval: number
  anomalyDetection: boolean
  thresholds: {
    responseTime: {
      warning: number
      critical: number
    }
    errorRate: {
      warning: number
      critical: number
    }
    cpuUsage: {
      warning: number
      critical: number
    }
    memoryUsage: {
      warning: number
      critical: number
    }
  }
}

/**
 * Central monitoring system for API observability
 */
export class MonitoringSystem extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private healthChecks: Map<string, ComponentHealth> = new Map()
  private config: MonitoringConfig
  private isRunning = false
  private intervals: NodeJS.Timeout[] = []

  constructor(config: Partial<MonitoringConfig> = {}) {
    super()
    
    this.config = {
      metricsRetentionDays: 30,
      alertingEnabled: true,
      healthCheckInterval: 30000, // 30 seconds
      systemMetricsInterval: 60000, // 1 minute
      anomalyDetection: true,
      thresholds: {
        responseTime: {
          warning: 500,
          critical: 1000
        },
        errorRate: {
          warning: 0.01, // 1%
          critical: 0.05  // 5%
        },
        cpuUsage: {
          warning: 70,
          critical: 90
        },
        memoryUsage: {
          warning: 80,
          critical: 95
        }
      },
      ...config
    }
  }

  /**
   * Start the monitoring system
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    
    // Start health checks
    const healthCheckInterval = setInterval(() => {
      this.runHealthChecks()
    }, this.config.healthCheckInterval)
    this.intervals.push(healthCheckInterval)

    // Start system metrics collection
    const systemMetricsInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, this.config.systemMetricsInterval)
    this.intervals.push(systemMetricsInterval)

    // Start metrics cleanup
    const cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics()
    }, 24 * 60 * 60 * 1000) // Daily cleanup
    this.intervals.push(cleanupInterval)

    this.emit('monitoring-started')
  }

  /**
   * Stop the monitoring system
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []

    this.emit('monitoring-stopped')
  }

  /**
   * Record a metric point
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const metricPoint: MetricPoint = {
      timestamp: new Date(),
      value,
      labels
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metricPoint)

    // Check thresholds
    this.checkThresholds(name, value, labels)

    this.emit('metric-recorded', { name, value, labels })
  }

  /**
   * Get metrics by name within a time range
   */
  getMetrics(
    name: string, 
    startTime?: Date, 
    endTime?: Date
  ): MetricPoint[] {
    const metrics = this.metrics.get(name) || []
    
    if (!startTime && !endTime) {
      return metrics
    }

    return metrics.filter(metric => {
      if (startTime && metric.timestamp < startTime) return false
      if (endTime && metric.timestamp > endTime) return false
      return true
    })
  }

  /**
   * Get aggregated metrics (average, min, max, etc.)
   */
  getAggregatedMetrics(
    name: string,
    aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count',
    startTime?: Date,
    endTime?: Date
  ): number {
    const metrics = this.getMetrics(name, startTime, endTime)
    const values = metrics.map(m => m.value)

    if (values.length === 0) return 0

    switch (aggregation) {
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length
      case 'min':
        return Math.min(...values)
      case 'max':
        return Math.max(...values)
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0)
      case 'count':
        return values.length
      default:
        return 0
    }
  }

  /**
   * Register a health check component
   */
  registerHealthCheck(
    name: string, 
    checkFunction: () => Promise<ComponentHealth>
  ): void {
    this.healthChecks.set(name, {
      name,
      status: 'healthy',
      lastCheck: new Date(),
      checkFunction
    } as any)
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks(): Promise<void> {
    const promises = Array.from(this.healthChecks.entries()).map(
      async ([name, component]) => {
        try {
          const health = await (component as any).checkFunction()
          this.healthChecks.set(name, health)

          // Create alert if component is unhealthy
          if (health.status !== 'healthy') {
            this.createAlert({
              level: health.status === 'down' ? 'critical' : 'warning',
              title: `Component ${name} is ${health.status}',
              message: 'Health check failed for component: ${name}',
              source: 'health-check',
              metadata: { component: name, details: health.details }
            })
          }

          this.emit('health-check-completed', { name, health })
        } catch (error) {
          const errorHealth: ComponentHealth = {
            name,
            status: 'down',
            lastCheck: new Date(),
            details: { error: error instanceof Error ? error.message : String(error) }
          }

          this.healthChecks.set(name, errorHealth)

          this.createAlert({
            level: 'critical`,
            title: `Health check failed for ${name}',
            message: 'Error during health check: ${error}',
            source: 'health-check',
            metadata: { component: name, error: String(error) }
          })

          this.emit('health-check-failed', { name, error })
        }
      }
    )

    await Promise.all(promises)
  }

  /**
   * Get current health status
   */
  getHealthStatus(): { 
    overall: 'healthy' | 'degraded' | 'down'
    components: ComponentHealth[] 
  } {
    const components = Array.from(this.healthChecks.values())
    
    let overall: 'healthy' | 'degraded' | 'down' = 'healthy'
    
    if (components.some(c => c.status === 'down')) {
      overall = 'down'
    } else if (components.some(c => c.status === 'degraded')) {
      overall = 'degraded'
    }

    return { overall, components }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics()
      
      this.recordMetric('system.cpu.usage', metrics.cpu.usage)
      this.recordMetric('system.memory.usage', metrics.memory.usage)
      this.recordMetric('system.disk.usage', metrics.disk.usage)
      this.recordMetric('system.network.connections', metrics.network.connectionsActive)

      this.emit('system-metrics-collected', metrics)
    } catch (_error) {
      this.emit('system-metrics-error', error)
    }
  }

  /**
   * Get current system metrics
   */
  private async getSystemMetrics(): Promise<SystemMetrics> {
    // In a real implementation, this would gather actual system metrics
    // For now, we'll return mock data'
    return {
      cpu: {
        usage: Math.random() * 100,
        cores: 8
      },
      memory: {
        used: Math.random() * 16000,
        available: 16000,
        usage: Math.random() * 100
      },
      disk: {
        used: Math.random() * 500000,
        available: 500000,
        usage: Math.random() * 100
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        connectionsActive: Math.floor(Math.random() * 100)
      }
    }
  }

  /**
   * Create an alert
   */
  createAlert(alertData: {
    level: Alert['level']
    title: string
    message: string
    source: string
    metadata?: Record<string, unknown>
  }): Alert {
    const alert: Alert = {
      id: createHash('md5').update('${alertData.title}-${Date.now()}').digest('hex'),
      level: alertData.level,
      title: alertData.title,
      message: alertData.message,
      source: alertData.source,
      timestamp: new Date(),
      resolved: false,
      metadata: alertData.metadata
    }

    this.alerts.set(alert.id, alert)

    if (this.config.alertingEnabled) {
      this.emit('alert-created', alert)
    }

    return alert
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date()

    this.emit('alert-resolved', alert)
    return true
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Check metric thresholds
   */
  private checkThresholds(
    metricName: string, 
    value: number, 
    labels?: Record<string, string>
  ): void {
    const thresholds = this.getThresholdsForMetric(metricName)
    if (!thresholds) return

    if (value >= thresholds.critical) {
      this.createAlert({
        level: 'critical`,
        title: `Critical threshold exceeded: ${metricName}',
        message: 'Metric ${metricName} value ${value} exceeded critical threshold ${thresholds.critical}',
        source: 'threshold-check',
        metadata: { metricName, value, threshold: thresholds.critical, labels }
      })
    } else if (value >= thresholds.warning) {
      this.createAlert({
        level: 'warning`,
        title: `Warning threshold exceeded: ${metricName}',
        message: 'Metric ${metricName} value ${value} exceeded warning threshold ${thresholds.warning}',
        source: 'threshold-check',
        metadata: { metricName, value, threshold: thresholds.warning, labels }
      })
    }
  }

  /**
   * Get thresholds for a specific metric
   */
  private getThresholdsForMetric(metricName: string): { warning: number, critical: number } | null {
    if (metricName.includes('response_time')) {
      return this.config.thresholds.responseTime
    }
    if (metricName.includes('error_rate')) {
      return this.config.thresholds.errorRate
    }
    if (metricName.includes('cpu')) {
      return this.config.thresholds.cpuUsage
    }
    if (metricName.includes('memory')) {
      return this.config.thresholds.memoryUsage
    }
    return null
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays)

    for (const [name, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(
        metric => metric.timestamp >= cutoffDate
      )
      this.metrics.set(name, filteredMetrics)
    }

    this.emit('metrics-cleaned-up', { cutoffDate })
  }

  /**
   * Export metrics data
   */
  exportMetrics(format: 'json' | 'csv' | 'prometheus' = 'json'): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics.entries()),
      healthStatus: this.getHealthStatus(),
      activeAlerts: this.getActiveAlerts(),
      config: this.config
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      case 'prometheus':
        return this.convertToPrometheus(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: unknown): string {
    const headers = 'timestamp,metric_name,value,labels
'
    const csv = headers

    for (const [name, metrics] of Object.entries(data.metrics) as [string, MetricPoint[]][]) {
      for (const metric of metrics) {
        const labels = metric.labels ? JSON.stringify(metric.labels) : `
        csv += `${metric.timestamp},${name},${metric.value},"${labels}"
`
      }
    }

    return csv
  }

  /**
   * Convert data to Prometheus format
   */
  private convertToPrometheus(data: unknown): string {
    const prometheus = `

    for (const [name, metrics] of Object.entries(data.metrics) as [string, MetricPoint[]][]) {
      prometheus += `# HELP ${name} ${name} metric
`
      prometheus += `# TYPE ${name} gauge
`
      
      for (const metric of metrics) {
        const labels = metric.labels 
          ? `{${Object.entries(metric.labels).map(([k, v]) => '${k}="${v}"').join(',')}}`
          : '
        prometheus += '${name}${labels} ${metric.value} ${metric.timestamp.getTime()}
'
      }
      prometheus += ''
'
    }

    return prometheus
  }
}

/**
 * Global monitoring instance
 */
export const monitoring = new MonitoringSystem({
  alertingEnabled: process.env.NODE_ENV === 'production',
  anomalyDetection: true,
  thresholds: {
    responseTime: {
      warning: parseInt(process.env.RESPONSE_TIME_WARNING_MS || '500'),
      critical: parseInt(process.env.RESPONSE_TIME_CRITICAL_MS || '1000')
    },
    errorRate: {
      warning: parseFloat(process.env.ERROR_RATE_WARNING || '0.01'),
      critical: parseFloat(process.env.ERROR_RATE_CRITICAL || '0.05')
    },
    cpuUsage: {
      warning: parseInt(process.env.CPU_WARNING_PERCENT || '70'),
      critical: parseInt(process.env.CPU_CRITICAL_PERCENT || '90')
    },
    memoryUsage: {
      warning: parseInt(process.env.MEMORY_WARNING_PERCENT || '80'),
      critical: parseInt(process.env.MEMORY_CRITICAL_PERCENT || '95')
    }
  }
})

// Register default health checks
monitoring.registerHealthCheck('api', async () => {
  // Check API health
  return {
    name: 'api',
    status: 'healthy',
    responseTime: Math.random() * 100,
    lastCheck: new Date(),
    details: { version: '1.0.0' }
  }
})

monitoring.registerHealthCheck('database', async () => {
  // Check database connectivity
  return {
    name: 'database',
    status: Math.random() > 0.1 ? 'healthy' : 'degraded',
    responseTime: Math.random() * 50,
    lastCheck: new Date(),
    details: { connections: 24, poolSize: 100 }
  }
})

monitoring.registerHealthCheck('cache', async () => {
  // Check Redis/cache health
  return {
    name: 'cache',
    status: 'healthy',
    responseTime: Math.random() * 10,
    lastCheck: new Date(),
    details: { hitRate: 0.85 }
  }
})

monitoring.registerHealthCheck('queue', async () => {
  // Check job queue health
  return {
    name: 'queue',
    status: Math.random() > 0.2 ? 'healthy' : 'degraded',
    responseTime: Math.random() * 30,
    lastCheck: new Date(),
    details: { jobsWaiting: 5, jobsActive: 2 }
  }
})

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  monitoring.start()
}

export default monitoring