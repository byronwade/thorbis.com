# Monitoring and Alerting

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This comprehensive guide covers how to read system logs and metrics, understand common alert patterns, respond to performance degradation, handle security incidents, and resolve AI governance alerts in the Thorbis Business OS.

## Quick Navigation
- [System Logs and Metrics](#1-system-logs-and-metrics)
- [Common Alert Patterns](#2-common-alert-patterns-and-responses)
- [Performance Degradation](#3-performance-degradation-troubleshooting)
- [Security Incident Response](#4-security-incident-response)
- [AI Governance Alerts](#5-ai-governance-alerts-and-resolution)

---

## 1. System Logs and Metrics

### Understanding Log Formats and Levels

#### Structured Logging Implementation
```typescript
// Enhanced logging system
// packages/monitoring/src/structured-logger.ts
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  component?: string
  function?: string
  environment: string
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  performance?: {
    duration?: number
    memoryUsage?: number
    cpuUsage?: number
  }
  business?: {
    tenantId?: string
    workOrderId?: string
    customerId?: string
    transactionId?: string
  }
}

export class StructuredLogger {
  private static instance: StructuredLogger
  private logLevel: LogLevel
  private context: Partial<LogContext>
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level
    this.context = {
      environment: process.env.NODE_ENV || 'development'
    }
  }
  
  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      const level = this.getLogLevelFromEnv()
      StructuredLogger.instance = new StructuredLogger(level)
    }
    return StructuredLogger.instance
  }
  
  private static getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase()
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR
      case 'WARN': return LogLevel.WARN
      case 'INFO': return LogLevel.INFO
      case 'DEBUG': return LogLevel.DEBUG
      case 'TRACE': return LogLevel.TRACE
      default: return LogLevel.INFO
    }
  }
  
  withContext(context: Partial<LogContext>): StructuredLogger {
    const newLogger = new StructuredLogger(this.logLevel)
    newLogger.context = { ...this.context, ...context }
    return newLogger
  }
  
  error(message: string, error?: Error | any, data?: any) {
    this.log(LogLevel.ERROR, message, data, error)
  }
  
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data)
  }
  
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data)
  }
  
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data)
  }
  
  trace(message: string, data?: any) {
    this.log(LogLevel.TRACE, message, data)
  }
  
  private log(level: LogLevel, message: string, data?: any, error?: Error | any) {
    if (level > this.logLevel) return
    
    const logEntry: LogContext = {
      ...this.context,
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }
    
    if (error) {
      logEntry.error = {
        name: error.name || 'Error',
        message: error.message || String(error),
        stack: error.stack,
        code: error.code
      }
    }
    
    // Add performance metrics if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage()
      logEntry.performance = {
        memoryUsage: Math.round(memory.heapUsed / 1024 / 1024) // MB
      }
    }
    
    // Output based on environment
    if (process.env.NODE_ENV === 'production') {
      // JSON format for log aggregation
      console.log(JSON.stringify(logEntry))
    } else {
      // Human-readable format for development
      this.formatDevelopmentLog(logEntry)
    }
    
    // Send to external monitoring in production
    if (process.env.NODE_ENV === 'production' && level <= LogLevel.WARN) {
      this.sendToMonitoring(logEntry)
    }
  }
  
  private formatDevelopmentLog(entry: LogContext) {
    const levelColors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.TRACE]: '\x1b[37m'  // White
    }
    
    const reset = '\x1b[0m'
    const levelName = LogLevel[entry.level]
    const color = levelColors[entry.level]
    
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const context = entry.component ? `[${entry.component}]` : ''
    
    console.log(
      `${color}${timestamp} ${levelName}${reset} ${context} ${entry.message}`,
      entry.data ? entry.data : '',
      entry.error ? `\nError: ${entry.error.message}` : ''
    )
    
    if (entry.error?.stack && entry.level === LogLevel.ERROR) {
      console.error(entry.error.stack)
    }
  }
  
  private async sendToMonitoring(entry: LogContext) {
    // Placeholder for external monitoring integration
    // Could be Datadog, New Relic, Sentry, etc.
    try {
      // await monitoringService.send(entry)
    } catch (error) {
      // Avoid recursive logging
      console.error('Failed to send log to monitoring:', error)
    }
  }
}

// Convenience functions
export const logger = StructuredLogger.getInstance()

export function createLogger(context: Partial<LogContext>) {
  return logger.withContext(context)
}
```

#### Application Performance Metrics
```typescript
// Performance metrics collection
// packages/monitoring/src/metrics-collector.ts
export interface Metric {
  name: string
  value: number
  unit: 'ms' | 'count' | 'bytes' | 'percent' | 'rate'
  timestamp: number
  tags?: Record<string, string>
}

export class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Metric[] = []
  private timers: Map<string, number> = new Map()
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }
  
  // Counter metrics
  increment(name: string, value: number = 1, tags?: Record<string, string>) {
    this.addMetric({
      name: `${name}.count`,
      value,
      unit: 'count',
      timestamp: Date.now(),
      tags
    })
  }
  
  // Gauge metrics (current value)
  gauge(name: string, value: number, unit: 'bytes' | 'percent' | 'count' = 'count', tags?: Record<string, string>) {
    this.addMetric({
      name: `${name}.gauge`,
      value,
      unit,
      timestamp: Date.now(),
      tags
    })
  }
  
  // Timer metrics
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random()}`
    this.timers.set(timerId, performance.now())
    return timerId
  }
  
  endTimer(timerId: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(timerId)
    if (!startTime) {
      logger.warn('Timer not found', { timerId })
      return 0
    }
    
    const duration = performance.now() - startTime
    this.timers.delete(timerId)
    
    // Extract metric name from timer ID
    const metricName = timerId.split('_')[0]
    
    this.addMetric({
      name: `${metricName}.duration`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags
    })
    
    return duration
  }
  
  // High-level timing wrapper
  async time<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const timerId = this.startTimer(name)
    
    try {
      const result = await fn()
      this.endTimer(timerId, { ...tags, status: 'success' })
      return result
    } catch (error) {
      this.endTimer(timerId, { ...tags, status: 'error' })
      throw error
    }
  }
  
  // Memory metrics
  recordMemoryUsage(component: string) {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      
      this.gauge('memory.heap_used', usage.heapUsed, 'bytes', { component })
      this.gauge('memory.heap_total', usage.heapTotal, 'bytes', { component })
      this.gauge('memory.external', usage.external, 'bytes', { component })
      this.gauge('memory.rss', usage.rss, 'bytes', { component })
    }
  }
  
  // Business metrics
  recordBusinessEvent(event: string, value: number = 1, tags?: Record<string, string>) {
    this.addMetric({
      name: `business.${event}`,
      value,
      unit: 'count',
      timestamp: Date.now(),
      tags: { ...tags, type: 'business_event' }
    })
  }
  
  // API metrics
  recordApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    const tags = {
      endpoint: endpoint.replace(/\/[0-9a-f-]{36}/g, '/:id'), // Normalize UUIDs
      method,
      status_code: statusCode.toString(),
      status_class: `${Math.floor(statusCode / 100)}xx`
    }
    
    this.increment('api.requests', 1, tags)
    
    this.addMetric({
      name: 'api.response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags
    })
  }
  
  private addMetric(metric: Metric) {
    this.metrics.push(metric)
    
    // Keep only recent metrics (memory management)
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000)
    }
    
    // Log significant metrics
    if (this.shouldLogMetric(metric)) {
      logger.debug('Metric recorded', { metric })
    }
  }
  
  private shouldLogMetric(metric: Metric): boolean {
    // Log performance issues
    if (metric.name.includes('response_time') && metric.value > 2000) return true
    if (metric.name.includes('memory') && metric.value > 1000000000) return true // 1GB
    if (metric.name.includes('error')) return true
    
    return false
  }
  
  getMetrics(since?: number): Metric[] {
    if (since) {
      return this.metrics.filter(m => m.timestamp >= since)
    }
    return [...this.metrics]
  }
  
  getMetricsSummary(timeWindowMs: number = 300000): Record<string, any> {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => m.timestamp >= now - timeWindowMs)
    
    const summary: Record<string, any> = {}
    
    recentMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
          unit: metric.unit
        }
      }
      
      const stats = summary[metric.name]
      stats.count++
      stats.sum += metric.value
      stats.min = Math.min(stats.min, metric.value)
      stats.max = Math.max(stats.max, metric.value)
      stats.avg = stats.sum / stats.count
    })
    
    return summary
  }
}

// Global metrics instance
export const metrics = MetricsCollector.getInstance()
```

### Log Analysis and Filtering

#### Advanced Log Search
```typescript
// Log search and analysis utilities
// packages/monitoring/src/log-analyzer.ts
export interface LogQuery {
  level?: LogLevel
  component?: string
  timeRange?: {
    start: Date
    end: Date
  }
  userId?: string
  errorCode?: string
  message?: string
  hasError?: boolean
  performanceThreshold?: {
    field: 'duration' | 'memoryUsage'
    operator: 'gt' | 'lt' | 'eq'
    value: number
  }
}

export class LogAnalyzer {
  private logs: LogContext[] = []
  
  constructor(logs: LogContext[] = []) {
    this.logs = logs
  }
  
  static fromJsonLogs(jsonLogs: string[]): LogAnalyzer {
    const logs = jsonLogs
      .map(log => {
        try {
          return JSON.parse(log) as LogContext
        } catch (error) {
          return null
        }
      })
      .filter(Boolean) as LogContext[]
    
    return new LogAnalyzer(logs)
  }
  
  query(query: LogQuery): LogContext[] {
    return this.logs.filter(log => {
      // Level filter
      if (query.level !== undefined && log.level !== query.level) {
        return false
      }
      
      // Component filter
      if (query.component && log.component !== query.component) {
        return false
      }
      
      // Time range filter
      if (query.timeRange) {
        const logTime = new Date(log.timestamp)
        if (logTime < query.timeRange.start || logTime > query.timeRange.end) {
          return false
        }
      }
      
      // User filter
      if (query.userId && log.userId !== query.userId) {
        return false
      }
      
      // Error code filter
      if (query.errorCode && log.error?.code !== query.errorCode) {
        return false
      }
      
      // Message filter (substring search)
      if (query.message && !log.message.toLowerCase().includes(query.message.toLowerCase())) {
        return false
      }
      
      // Has error filter
      if (query.hasError !== undefined) {
        if (query.hasError && !log.error) return false
        if (!query.hasError && log.error) return false
      }
      
      // Performance threshold filter
      if (query.performanceThreshold && log.performance) {
        const { field, operator, value } = query.performanceThreshold
        const logValue = log.performance[field]
        
        if (logValue === undefined) return false
        
        switch (operator) {
          case 'gt': if (logValue <= value) return false; break
          case 'lt': if (logValue >= value) return false; break
          case 'eq': if (logValue !== value) return false; break
        }
      }
      
      return true
    })
  }
  
  // Analyze error patterns
  analyzeErrors(): {
    totalErrors: number
    errorsByType: Record<string, number>
    errorsByComponent: Record<string, number>
    mostCommonErrors: Array<{ message: string; count: number }>
  } {
    const errorLogs = this.query({ hasError: true })
    
    const errorsByType: Record<string, number> = {}
    const errorsByComponent: Record<string, number> = {}
    const errorMessages: Record<string, number> = {}
    
    errorLogs.forEach(log => {
      if (log.error) {
        // Count by error type
        const errorType = log.error.name || 'Unknown'
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1
        
        // Count by component
        const component = log.component || 'Unknown'
        errorsByComponent[component] = (errorsByComponent[component] || 0) + 1
        
        // Count by message
        const message = log.error.message || 'Unknown error'
        errorMessages[message] = (errorMessages[message] || 0) + 1
      }
    })
    
    const mostCommonErrors = Object.entries(errorMessages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }))
    
    return {
      totalErrors: errorLogs.length,
      errorsByType,
      errorsByComponent,
      mostCommonErrors
    }
  }
  
  // Analyze performance trends
  analyzePerformance(): {
    averageResponseTime: number
    p95ResponseTime: number
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>
    memoryTrends: Array<{ timestamp: string; usage: number }>
  } {
    const performanceLogs = this.logs.filter(log => log.performance?.duration !== undefined)
    
    if (performanceLogs.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        slowestEndpoints: [],
        memoryTrends: []
      }
    }
    
    // Response times
    const responseTimes = performanceLogs
      .map(log => log.performance!.duration!)
      .sort((a, b) => a - b)
    
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const p95Index = Math.floor(responseTimes.length * 0.95)
    const p95ResponseTime = responseTimes[p95Index] || 0
    
    // Slowest endpoints (assuming function field contains endpoint info)
    const endpointTimes: Record<string, number[]> = {}
    performanceLogs.forEach(log => {
      const endpoint = log.function || 'unknown'
      if (!endpointTimes[endpoint]) {
        endpointTimes[endpoint] = []
      }
      endpointTimes[endpoint].push(log.performance!.duration!)
    })
    
    const slowestEndpoints = Object.entries(endpointTimes)
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)
    
    // Memory trends
    const memoryLogs = this.logs.filter(log => log.performance?.memoryUsage !== undefined)
    const memoryTrends = memoryLogs
      .map(log => ({
        timestamp: log.timestamp,
        usage: log.performance!.memoryUsage!
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    return {
      averageResponseTime,
      p95ResponseTime,
      slowestEndpoints,
      memoryTrends
    }
  }
  
  // Generate insights
  generateInsights(): string[] {
    const insights: string[] = []
    const errorAnalysis = this.analyzeErrors()
    const performanceAnalysis = this.analyzePerformance()
    
    // Error insights
    if (errorAnalysis.totalErrors > 0) {
      insights.push(`Found ${errorAnalysis.totalErrors} errors in the analyzed period`)
      
      const topError = errorAnalysis.mostCommonErrors[0]
      if (topError) {
        insights.push(`Most common error: "${topError.message}" (${topError.count} occurrences)`)
      }
      
      const topErrorType = Object.entries(errorAnalysis.errorsByType)
        .sort((a, b) => b[1] - a[1])[0]
      if (topErrorType) {
        insights.push(`Most common error type: ${topErrorType[0]} (${topErrorType[1]} occurrences)`)
      }
    }
    
    // Performance insights
    if (performanceAnalysis.averageResponseTime > 1000) {
      insights.push(`High average response time: ${performanceAnalysis.averageResponseTime.toFixed(2)}ms`)
    }
    
    if (performanceAnalysis.p95ResponseTime > 2000) {
      insights.push(`95th percentile response time is concerning: ${performanceAnalysis.p95ResponseTime.toFixed(2)}ms`)
    }
    
    const slowEndpoint = performanceAnalysis.slowestEndpoints[0]
    if (slowEndpoint && slowEndpoint.avgTime > 1000) {
      insights.push(`Slowest endpoint "${slowEndpoint.endpoint}" averages ${slowEndpoint.avgTime.toFixed(2)}ms`)
    }
    
    return insights
  }
}
```

---

## 2. Common Alert Patterns and Responses

### Alert Classification and Prioritization

#### Alert Rule Engine
```typescript
// Alert rule engine and classification
// packages/monitoring/src/alert-engine.ts
export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum AlertCategory {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  BUSINESS = 'business',
  INFRASTRUCTURE = 'infrastructure'
}

export interface Alert {
  id: string
  severity: AlertSeverity
  category: AlertCategory
  title: string
  description: string
  timestamp: number
  source: string
  tags: Record<string, string>
  data?: any
  resolved?: boolean
  resolvedAt?: number
  resolvedBy?: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  category: AlertCategory
  severity: AlertSeverity
  condition: (context: AlertContext) => boolean
  cooldownMs: number
  enabled: boolean
}

export interface AlertContext {
  metrics: Metric[]
  logs: LogContext[]
  timeWindowMs: number
  currentTime: number
}

export class AlertEngine {
  private static instance: AlertEngine
  private rules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, Alert> = new Map()
  private alertHistory: Alert[] = []
  private lastRuleExecution: Map<string, number> = new Map()
  
  static getInstance(): AlertEngine {
    if (!AlertEngine.instance) {
      AlertEngine.instance = new AlertEngine()
      AlertEngine.instance.initializeDefaultRules()
    }
    return AlertEngine.instance
  }
  
  private initializeDefaultRules() {
    // Performance rules
    this.addRule({
      id: 'high_response_time',
      name: 'High Response Time',
      description: 'API response time is consistently above 2 seconds',
      category: AlertCategory.PERFORMANCE,
      severity: AlertSeverity.HIGH,
      cooldownMs: 300000, // 5 minutes
      enabled: true,
      condition: (context) => {
        const apiMetrics = context.metrics.filter(m => 
          m.name === 'api.response_time' && 
          m.timestamp >= context.currentTime - context.timeWindowMs
        )
        
        if (apiMetrics.length < 10) return false // Need sufficient data
        
        const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
        return avgResponseTime > 2000 // 2 seconds
      }
    })
    
    this.addRule({
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      description: 'Memory usage is above 80%',
      category: AlertCategory.INFRASTRUCTURE,
      severity: AlertSeverity.MEDIUM,
      cooldownMs: 600000, // 10 minutes
      enabled: true,
      condition: (context) => {
        const memoryMetrics = context.metrics.filter(m => 
          m.name === 'memory.heap_used.gauge' &&
          m.timestamp >= context.currentTime - 60000 // Last minute
        )
        
        if (memoryMetrics.length === 0) return false
        
        const latestMemory = memoryMetrics[memoryMetrics.length - 1]
        // Assuming 2GB limit for example
        const usagePercent = (latestMemory.value / (2 * 1024 * 1024 * 1024)) * 100
        return usagePercent > 80
      }
    })
    
    // Error rules
    this.addRule({
      id: 'error_rate_spike',
      name: 'Error Rate Spike',
      description: 'Error rate has increased significantly',
      category: AlertCategory.ERROR,
      severity: AlertSeverity.HIGH,
      cooldownMs: 180000, // 3 minutes
      enabled: true,
      condition: (context) => {
        const errorLogs = context.logs.filter(log => 
          log.level === LogLevel.ERROR &&
          log.timestamp >= context.currentTime - context.timeWindowMs
        )
        
        const totalRequests = context.metrics.filter(m => 
          m.name === 'api.requests.count' &&
          m.timestamp >= context.currentTime - context.timeWindowMs
        ).reduce((sum, m) => sum + m.value, 0)
        
        if (totalRequests < 100) return false // Need significant traffic
        
        const errorRate = (errorLogs.length / totalRequests) * 100
        return errorRate > 5 // 5% error rate
      }
    })
    
    // Security rules
    this.addRule({
      id: 'authentication_failures',
      name: 'Multiple Authentication Failures',
      description: 'Unusual number of authentication failures detected',
      category: AlertCategory.SECURITY,
      severity: AlertSeverity.HIGH,
      cooldownMs: 300000, // 5 minutes
      enabled: true,
      condition: (context) => {
        const authFailures = context.logs.filter(log =>
          log.message.toLowerCase().includes('authentication') &&
          log.message.toLowerCase().includes('failed') &&
          log.timestamp >= context.currentTime - 300000 // Last 5 minutes
        )
        
        return authFailures.length > 50 // More than 50 failures in 5 minutes
      }
    })
    
    // Business rules
    this.addRule({
      id: 'payment_processing_failures',
      name: 'Payment Processing Failures',
      description: 'Multiple payment processing failures detected',
      category: AlertCategory.BUSINESS,
      severity: AlertSeverity.CRITICAL,
      cooldownMs: 60000, // 1 minute
      enabled: true,
      condition: (context) => {
        const paymentErrors = context.logs.filter(log =>
          (log.component === 'payment' || log.message.toLowerCase().includes('payment')) &&
          log.level === LogLevel.ERROR &&
          log.timestamp >= context.currentTime - 300000
        )
        
        return paymentErrors.length > 5 // More than 5 payment errors in 5 minutes
      }
    })
  }
  
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule)
  }
  
  removeRule(ruleId: string) {
    this.rules.delete(ruleId)
    this.lastRuleExecution.delete(ruleId)
  }
  
  evaluateRules(context: AlertContext): Alert[] {
    const newAlerts: Alert[] = []
    
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue
      
      // Check cooldown
      const lastExecution = this.lastRuleExecution.get(ruleId) || 0
      if (context.currentTime - lastExecution < rule.cooldownMs) continue
      
      try {
        if (rule.condition(context)) {
          const alertId = `${ruleId}_${Date.now()}`
          const alert: Alert = {
            id: alertId,
            severity: rule.severity,
            category: rule.category,
            title: rule.name,
            description: rule.description,
            timestamp: context.currentTime,
            source: ruleId,
            tags: {
              rule_id: ruleId,
              auto_generated: 'true'
            }
          }
          
          this.activeAlerts.set(alertId, alert)
          this.alertHistory.push(alert)
          newAlerts.push(alert)
          
          // Log the alert
          logger.warn('Alert triggered', {
            alert: {
              id: alert.id,
              severity: alert.severity,
              category: alert.category,
              title: alert.title
            }
          })
        }
        
        this.lastRuleExecution.set(ruleId, context.currentTime)
      } catch (error) {
        logger.error('Error evaluating alert rule', error, { ruleId })
      }
    }
    
    return newAlerts
  }
  
  resolveAlert(alertId: string, resolvedBy: string) {
    const alert = this.activeAlerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      alert.resolvedBy = resolvedBy
      
      this.activeAlerts.delete(alertId)
      
      logger.info('Alert resolved', {
        alertId,
        resolvedBy,
        title: alert.title
      })
    }
  }
  
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
  }
  
  getAlertHistory(timeWindowMs?: number): Alert[] {
    if (timeWindowMs) {
      const cutoff = Date.now() - timeWindowMs
      return this.alertHistory.filter(alert => alert.timestamp >= cutoff)
    }
    return [...this.alertHistory]
  }
  
  getAlertSummary(): {
    active: number
    bySeverity: Record<AlertSeverity, number>
    byCategory: Record<AlertCategory, number>
  } {
    const activeAlerts = this.getActiveAlerts()
    
    const bySeverity: Record<AlertSeverity, number> = {
      [AlertSeverity.CRITICAL]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.INFO]: 0
    }
    
    const byCategory: Record<AlertCategory, number> = {
      [AlertCategory.PERFORMANCE]: 0,
      [AlertCategory.ERROR]: 0,
      [AlertCategory.SECURITY]: 0,
      [AlertCategory.BUSINESS]: 0,
      [AlertCategory.INFRASTRUCTURE]: 0
    }
    
    activeAlerts.forEach(alert => {
      bySeverity[alert.severity]++
      byCategory[alert.category]++
    })
    
    return {
      active: activeAlerts.length,
      bySeverity,
      byCategory
    }
  }
}
```

### Automated Alert Response

#### Alert Response System
```typescript
// Automated alert response system
// packages/monitoring/src/alert-response.ts
export interface AlertAction {
  id: string
  name: string
  description: string
  triggerConditions: {
    severity?: AlertSeverity[]
    category?: AlertCategory[]
    ruleIds?: string[]
  }
  action: (alert: Alert, context: AlertContext) => Promise<void>
  enabled: boolean
}

export class AlertResponseSystem {
  private static instance: AlertResponseSystem
  private actions: Map<string, AlertAction> = new Map()
  private executionLog: Array<{
    alertId: string
    actionId: string
    timestamp: number
    success: boolean
    error?: string
  }> = []
  
  static getInstance(): AlertResponseSystem {
    if (!AlertResponseSystem.instance) {
      AlertResponseSystem.instance = new AlertResponseSystem()
      AlertResponseSystem.instance.initializeDefaultActions()
    }
    return AlertResponseSystem.instance
  }
  
  private initializeDefaultActions() {
    // Auto-scaling action
    this.addAction({
      id: 'scale_up_resources',
      name: 'Scale Up Resources',
      description: 'Automatically scale up server resources when under load',
      triggerConditions: {
        category: [AlertCategory.PERFORMANCE, AlertCategory.INFRASTRUCTURE],
        severity: [AlertSeverity.HIGH, AlertSeverity.CRITICAL]
      },
      enabled: process.env.NODE_ENV === 'production',
      action: async (alert, context) => {
        logger.info('Attempting to scale up resources', { alertId: alert.id })
        
        // Placeholder for actual scaling logic
        // Could integrate with Docker, Kubernetes, or cloud providers
        if (process.env.VERCEL_URL) {
          // Vercel auto-scales, so just log
          logger.info('Running on Vercel - auto-scaling is handled automatically')
        } else {
          // Custom scaling logic
          await this.requestResourceScaling('up', alert)
        }
      }
    })
    
    // Restart service action
    this.addAction({
      id: 'restart_service',
      name: 'Restart Service',
      description: 'Restart service when critical errors detected',
      triggerConditions: {
        severity: [AlertSeverity.CRITICAL],
        category: [AlertCategory.ERROR]
      },
      enabled: false, // Dangerous - should be manually enabled
      action: async (alert, context) => {
        logger.warn('Service restart triggered by alert', { alertId: alert.id })
        
        // Only restart in specific conditions
        if (this.shouldRestartService(alert, context)) {
          await this.restartService(alert)
        }
      }
    })
    
    // Clear cache action
    this.addAction({
      id: 'clear_cache',
      name: 'Clear Application Cache',
      description: 'Clear application caches when memory usage is high',
      triggerConditions: {
        category: [AlertCategory.INFRASTRUCTURE]
      },
      enabled: true,
      action: async (alert, context) => {
        logger.info('Clearing application cache', { alertId: alert.id })
        
        // Clear various caches
        if (typeof global !== 'undefined' && global.gc) {
          global.gc() // Force garbage collection
        }
        
        // Clear application-specific caches
        // This would integrate with your caching system
        await this.clearApplicationCaches()
      }
    })
    
    // Notify team action
    this.addAction({
      id: 'notify_team',
      name: 'Notify Development Team',
      description: 'Send notifications to the development team',
      triggerConditions: {
        severity: [AlertSeverity.HIGH, AlertSeverity.CRITICAL]
      },
      enabled: true,
      action: async (alert, context) => {
        await this.sendTeamNotification(alert, context)
      }
    })
  }
  
  addAction(action: AlertAction) {
    this.actions.set(action.id, action)
  }
  
  async executeActionsForAlert(alert: Alert, context: AlertContext) {
    for (const [actionId, action] of this.actions) {
      if (!action.enabled) continue
      
      if (this.shouldTriggerAction(alert, action)) {
        try {
          logger.info('Executing alert action', {
            alertId: alert.id,
            actionId,
            actionName: action.name
          })
          
          await action.action(alert, context)
          
          this.executionLog.push({
            alertId: alert.id,
            actionId,
            timestamp: Date.now(),
            success: true
          })
          
          logger.info('Alert action completed successfully', {
            alertId: alert.id,
            actionId
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          this.executionLog.push({
            alertId: alert.id,
            actionId,
            timestamp: Date.now(),
            success: false,
            error: errorMessage
          })
          
          logger.error('Alert action failed', error, {
            alertId: alert.id,
            actionId
          })
        }
      }
    }
  }
  
  private shouldTriggerAction(alert: Alert, action: AlertAction): boolean {
    const conditions = action.triggerConditions
    
    // Check severity
    if (conditions.severity && !conditions.severity.includes(alert.severity)) {
      return false
    }
    
    // Check category
    if (conditions.category && !conditions.category.includes(alert.category)) {
      return false
    }
    
    // Check specific rule IDs
    if (conditions.ruleIds && !conditions.ruleIds.includes(alert.source)) {
      return false
    }
    
    return true
  }
  
  private async requestResourceScaling(direction: 'up' | 'down', alert: Alert) {
    // Placeholder for resource scaling
    logger.info(`Resource scaling ${direction} requested`, {
      alertId: alert.id,
      reason: alert.title
    })
    
    // In a real implementation, this would:
    // - Call cloud provider APIs (AWS, GCP, Azure)
    // - Scale containers (Docker, Kubernetes)
    // - Adjust server configurations
  }
  
  private shouldRestartService(alert: Alert, context: AlertContext): boolean {
    // Only restart if there have been persistent critical errors
    const recentCriticalErrors = context.logs.filter(log =>
      log.level === LogLevel.ERROR &&
      log.timestamp >= Date.now() - 300000 // Last 5 minutes
    )
    
    return recentCriticalErrors.length > 20 // More than 20 errors in 5 minutes
  }
  
  private async restartService(alert: Alert) {
    logger.warn('Service restart initiated', { alertId: alert.id })
    
    // In a real implementation, this would:
    // - Gracefully shut down current processes
    // - Restart the application
    // - Verify the restart was successful
    
    // For now, just log
    logger.warn('Service restart would be triggered here (disabled for safety)')
  }
  
  private async clearApplicationCaches() {
    // Clear various application caches
    logger.info('Clearing application caches')
    
    // Example cache clearing - adapt to your caching system
    try {
      // Clear Redis cache if used
      // await redis.flushdb()
      
      // Clear in-memory caches
      // Clear any Maps or other in-memory data structures
      
      logger.info('Application caches cleared successfully')
    } catch (error) {
      logger.error('Failed to clear application caches', error)
    }
  }
  
  private async sendTeamNotification(alert: Alert, context: AlertContext) {
    const notification = {
      title: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
      message: alert.description,
      severity: alert.severity,
      timestamp: new Date(alert.timestamp).toISOString(),
      alertId: alert.id,
      category: alert.category,
      source: alert.source
    }
    
    logger.info('Sending team notification', { notification })
    
    // In a real implementation, send via:
    // - Slack webhook
    // - Discord webhook  
    // - Email
    // - SMS for critical alerts
    // - PagerDuty integration
    
    try {
      // Example Slack notification
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(notification)
      }
      
      // Example email notification
      if (process.env.SMTP_CONFIGURED && alert.severity === AlertSeverity.CRITICAL) {
        await this.sendEmailNotification(notification)
      }
    } catch (error) {
      logger.error('Failed to send team notification', error, { alert })
    }
  }
  
  private async sendSlackNotification(notification: any) {
    const slackMessage = {
      text: notification.title,
      attachments: [
        {
          color: this.getSeverityColor(notification.severity),
          fields: [
            {
              title: 'Description',
              value: notification.message,
              short: false
            },
            {
              title: 'Severity',
              value: notification.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Category',
              value: notification.category,
              short: true
            },
            {
              title: 'Time',
              value: notification.timestamp,
              short: true
            }
          ]
        }
      ]
    }
    
    // Send to Slack webhook
    // await fetch(process.env.SLACK_WEBHOOK_URL!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(slackMessage)
    // })
    
    logger.info('Slack notification would be sent', { slackMessage })
  }
  
  private async sendEmailNotification(notification: any) {
    // Email notification implementation
    logger.info('Email notification would be sent', { notification })
  }
  
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger'
      case AlertSeverity.HIGH: return 'warning'
      case AlertSeverity.MEDIUM: return 'good'
      case AlertSeverity.LOW: return 'good'
      case AlertSeverity.INFO: return 'good'
      default: return 'good'
    }
  }
  
  getExecutionLog(): Array<{
    alertId: string
    actionId: string
    timestamp: number
    success: boolean
    error?: string
  }> {
    return [...this.executionLog]
  }
}
```

---

## 3. Performance Degradation Troubleshooting

### Performance Monitoring Dashboard

#### Real-time Performance Monitoring
```typescript
// Performance monitoring and analysis
// packages/monitoring/src/performance-monitor.ts
export interface PerformanceSnapshot {
  timestamp: number
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  cpu: {
    usage: number
    userTime: number
    systemTime: number
  }
  network: {
    activeConnections: number
    requestRate: number
    errorRate: number
  }
  database: {
    activeConnections: number
    avgQueryTime: number
    slowQueries: number
  }
  business: {
    activeUsers: number
    workOrdersPerMinute: number
    paymentSuccessRate: number
  }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private snapshots: PerformanceSnapshot[] = []
  private intervalId: NodeJS.Timeout | null = null
  private thresholds = {
    memory: {
      heapUsedWarning: 1.5 * 1024 * 1024 * 1024, // 1.5GB
      heapUsedCritical: 2 * 1024 * 1024 * 1024    // 2GB
    },
    response: {
      warning: 1000, // 1 second
      critical: 3000 // 3 seconds
    },
    database: {
      queryTimeWarning: 500, // 500ms
      queryTimeCritical: 2000 // 2 seconds
    }
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  startMonitoring(intervalMs: number = 30000) { // 30 seconds
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    this.intervalId = setInterval(async () => {
      try {
        const snapshot = await this.takeSnapshot()
        this.snapshots.push(snapshot)
        
        // Keep only recent snapshots (last 24 hours)
        const cutoff = Date.now() - (24 * 60 * 60 * 1000)
        this.snapshots = this.snapshots.filter(s => s.timestamp >= cutoff)
        
        // Check for performance issues
        this.analyzeSnapshot(snapshot)
      } catch (error) {
        logger.error('Failed to take performance snapshot', error)
      }
    }, intervalMs)
    
    logger.info('Performance monitoring started', { intervalMs })
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    logger.info('Performance monitoring stopped')
  }
  
  private async takeSnapshot(): Promise<PerformanceSnapshot> {
    const timestamp = Date.now()
    
    // Memory metrics
    const memoryUsage = process.memoryUsage()
    
    // CPU metrics (simplified - would need more complex implementation for accurate CPU usage)
    const cpuUsage = process.cpuUsage()
    
    // Network metrics (get from metrics collector)
    const recentMetrics = metrics.getMetrics(timestamp - 60000) // Last minute
    const networkMetrics = this.calculateNetworkMetrics(recentMetrics)
    
    // Database metrics
    const databaseMetrics = await this.getDatabaseMetrics()
    
    // Business metrics
    const businessMetrics = this.getBusinessMetrics(recentMetrics)
    
    return {
      timestamp,
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      cpu: {
        usage: 0, // Would need platform-specific implementation
        userTime: cpuUsage.user / 1000, // Convert microseconds to milliseconds
        systemTime: cpuUsage.system / 1000
      },
      network: networkMetrics,
      database: databaseMetrics,
      business: businessMetrics
    }
  }
  
  private calculateNetworkMetrics(recentMetrics: Metric[]) {
    const requestMetrics = recentMetrics.filter(m => m.name === 'api.requests.count')
    const responseTimeMetrics = recentMetrics.filter(m => m.name === 'api.response_time')
    
    const totalRequests = requestMetrics.reduce((sum, m) => sum + m.value, 0)
    const errorRequests = requestMetrics
      .filter(m => m.tags?.status_class === '4xx' || m.tags?.status_class === '5xx')
      .reduce((sum, m) => sum + m.value, 0)
    
    return {
      activeConnections: 0, // Would need to track WebSocket/persistent connections
      requestRate: totalRequests / 60, // Requests per second (over 1 minute)
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
    }
  }
  
  private async getDatabaseMetrics() {
    // In a real implementation, this would query database performance metrics
    return {
      activeConnections: 0, // Would query connection pool
      avgQueryTime: 0, // Would calculate from query logs
      slowQueries: 0 // Would count queries over threshold
    }
  }
  
  private getBusinessMetrics(recentMetrics: Metric[]) {
    const businessMetrics = recentMetrics.filter(m => m.name.startsWith('business.'))
    
    const workOrderMetrics = businessMetrics.filter(m => m.name.includes('work_order'))
    const paymentMetrics = businessMetrics.filter(m => m.name.includes('payment'))
    
    return {
      activeUsers: 0, // Would track active sessions
      workOrdersPerMinute: workOrderMetrics.reduce((sum, m) => sum + m.value, 0),
      paymentSuccessRate: this.calculatePaymentSuccessRate(paymentMetrics)
    }
  }
  
  private calculatePaymentSuccessRate(paymentMetrics: Metric[]): number {
    const successPayments = paymentMetrics
      .filter(m => m.tags?.status === 'success')
      .reduce((sum, m) => sum + m.value, 0)
    
    const totalPayments = paymentMetrics.reduce((sum, m) => sum + m.value, 0)
    
    return totalPayments > 0 ? (successPayments / totalPayments) * 100 : 100
  }
  
  private analyzeSnapshot(snapshot: PerformanceSnapshot) {
    // Memory analysis
    if (snapshot.memory.heapUsed > this.thresholds.memory.heapUsedCritical) {
      logger.error('Critical memory usage detected', {
        heapUsed: Math.round(snapshot.memory.heapUsed / 1024 / 1024),
        threshold: Math.round(this.thresholds.memory.heapUsedCritical / 1024 / 1024)
      })
    } else if (snapshot.memory.heapUsed > this.thresholds.memory.heapUsedWarning) {
      logger.warn('High memory usage detected', {
        heapUsed: Math.round(snapshot.memory.heapUsed / 1024 / 1024),
        threshold: Math.round(this.thresholds.memory.heapUsedWarning / 1024 / 1024)
      })
    }
    
    // Network analysis
    if (snapshot.network.errorRate > 10) {
      logger.error('High error rate detected', {
        errorRate: snapshot.network.errorRate.toFixed(2),
        threshold: 10
      })
    } else if (snapshot.network.errorRate > 5) {
      logger.warn('Elevated error rate detected', {
        errorRate: snapshot.network.errorRate.toFixed(2),
        threshold: 5
      })
    }
    
    // Business metrics analysis
    if (snapshot.business.paymentSuccessRate < 95 && snapshot.business.paymentSuccessRate > 0) {
      logger.warn('Low payment success rate', {
        successRate: snapshot.business.paymentSuccessRate.toFixed(2),
        threshold: 95
      })
    }
  }
  
  getRecentSnapshots(count: number = 10): PerformanceSnapshot[] {
    return this.snapshots.slice(-count)
  }
  
  getPerformanceTrends(timeWindowMs: number = 3600000): {
    memory: { trend: 'increasing' | 'decreasing' | 'stable'; rate: number }
    responseTime: { trend: 'increasing' | 'decreasing' | 'stable'; rate: number }
    errorRate: { trend: 'increasing' | 'decreasing' | 'stable'; rate: number }
  } {
    const cutoff = Date.now() - timeWindowMs
    const recentSnapshots = this.snapshots.filter(s => s.timestamp >= cutoff)
    
    if (recentSnapshots.length < 2) {
      return {
        memory: { trend: 'stable', rate: 0 },
        responseTime: { trend: 'stable', rate: 0 },
        errorRate: { trend: 'stable', rate: 0 }
      }
    }
    
    // Calculate trends using linear regression or simple slope
    const memoryTrend = this.calculateTrend(
      recentSnapshots.map(s => ({ x: s.timestamp, y: s.memory.heapUsed }))
    )
    
    const errorTrend = this.calculateTrend(
      recentSnapshots.map(s => ({ x: s.timestamp, y: s.network.errorRate }))
    )
    
    return {
      memory: memoryTrend,
      responseTime: { trend: 'stable', rate: 0 }, // Would need response time data
      errorRate: errorTrend
    }
  }
  
  private calculateTrend(data: Array<{ x: number; y: number }>): {
    trend: 'increasing' | 'decreasing' | 'stable'
    rate: number
  } {
    if (data.length < 2) {
      return { trend: 'stable', rate: 0 }
    }
    
    // Simple linear regression
    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    if (Math.abs(slope) < 0.001) {
      return { trend: 'stable', rate: 0 }
    }
    
    return {
      trend: slope > 0 ? 'increasing' : 'decreasing',
      rate: Math.abs(slope)
    }
  }
}
```

### Performance Issue Resolution

#### Automated Performance Optimization
```typescript
// Performance optimization engine
// packages/monitoring/src/performance-optimizer.ts
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private optimizations: Map<string, {
    name: string
    description: string
    trigger: (snapshot: PerformanceSnapshot) => boolean
    optimize: () => Promise<void>
    cooldownMs: number
    lastExecution: number
  }> = new Map()
  
  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
      PerformanceOptimizer.instance.initializeOptimizations()
    }
    return PerformanceOptimizer.instance
  }
  
  private initializeOptimizations() {
    // Garbage collection optimization
    this.optimizations.set('force_gc', {
      name: 'Force Garbage Collection',
      description: 'Force garbage collection when memory usage is high',
      cooldownMs: 300000, // 5 minutes
      lastExecution: 0,
      trigger: (snapshot) => {
        const memoryUsagePercent = (snapshot.memory.heapUsed / snapshot.memory.heapTotal) * 100
        return memoryUsagePercent > 75
      },
      optimize: async () => {
        if (global.gc) {
          logger.info('Forcing garbage collection')
          global.gc()
          
          // Log memory after GC
          const afterGC = process.memoryUsage()
          logger.info('Memory after GC', {
            heapUsed: Math.round(afterGC.heapUsed / 1024 / 1024),
            heapTotal: Math.round(afterGC.heapTotal / 1024 / 1024)
          })
        }
      }
    })
    
    // Cache cleanup optimization
    this.optimizations.set('clear_caches', {
      name: 'Clear Application Caches',
      description: 'Clear application caches to free memory',
      cooldownMs: 600000, // 10 minutes
      lastExecution: 0,
      trigger: (snapshot) => {
        return snapshot.memory.heapUsed > 1.5 * 1024 * 1024 * 1024 // 1.5GB
      },
      optimize: async () => {
        logger.info('Clearing application caches')
        
        // Clear various caches
        // This would integrate with your specific caching systems
        await this.clearInMemoryCaches()
        await this.clearExternalCaches()
      }
    })
    
    // Connection pool optimization
    this.optimizations.set('optimize_connections', {
      name: 'Optimize Connection Pools',
      description: 'Optimize database and external service connection pools',
      cooldownMs: 900000, // 15 minutes
      lastExecution: 0,
      trigger: (snapshot) => {
        return snapshot.database.activeConnections > 50 || snapshot.network.activeConnections > 100
      },
      optimize: async () => {
        logger.info('Optimizing connection pools')
        
        // Database connection pool optimization
        await this.optimizeDatabaseConnections()
        
        // HTTP connection pool optimization
        await this.optimizeHttpConnections()
      }
    })
    
    // Request throttling optimization
    this.optimizations.set('throttle_requests', {
      name: 'Enable Request Throttling',
      description: 'Enable request throttling when error rate is high',
      cooldownMs: 300000, // 5 minutes
      lastExecution: 0,
      trigger: (snapshot) => {
        return snapshot.network.errorRate > 15 || snapshot.network.requestRate > 1000
      },
      optimize: async () => {
        logger.info('Enabling request throttling')
        
        // Enable more aggressive rate limiting
        await this.enableRequestThrottling()
      }
    })
  }
  
  async analyzeAndOptimize(snapshot: PerformanceSnapshot) {
    const optimizationsRun: string[] = []
    
    for (const [id, optimization] of this.optimizations) {
      // Check cooldown
      if (Date.now() - optimization.lastExecution < optimization.cooldownMs) {
        continue
      }
      
      // Check trigger condition
      if (optimization.trigger(snapshot)) {
        try {
          logger.info('Running performance optimization', {
            id,
            name: optimization.name,
            description: optimization.description
          })
          
          await optimization.optimize()
          optimization.lastExecution = Date.now()
          optimizationsRun.push(id)
          
          logger.info('Performance optimization completed', { id })
        } catch (error) {
          logger.error('Performance optimization failed', error, { id })
        }
      }
    }
    
    if (optimizationsRun.length > 0) {
      logger.info('Performance optimizations completed', {
        optimizations: optimizationsRun,
        snapshot: {
          memoryUsed: Math.round(snapshot.memory.heapUsed / 1024 / 1024),
          errorRate: snapshot.network.errorRate.toFixed(2),
          requestRate: snapshot.network.requestRate.toFixed(2)
        }
      })
    }
    
    return optimizationsRun
  }
  
  private async clearInMemoryCaches() {
    // Clear application-specific in-memory caches
    // This is highly application-specific
    
    try {
      // Example: Clear LRU caches, Maps, Sets, etc.
      // cache.clear()
      // userSessions.clear()
      
      logger.info('In-memory caches cleared')
    } catch (error) {
      logger.error('Failed to clear in-memory caches', error)
    }
  }
  
  private async clearExternalCaches() {
    try {
      // Clear Redis cache
      // await redis.flushdb()
      
      // Clear CDN cache
      // await cdn.purgeAll()
      
      logger.info('External caches cleared')
    } catch (error) {
      logger.error('Failed to clear external caches', error)
    }
  }
  
  private async optimizeDatabaseConnections() {
    try {
      // Reduce connection pool size temporarily
      // await db.setPoolSize(10)
      
      // Close idle connections
      // await db.closeIdleConnections()
      
      logger.info('Database connections optimized')
    } catch (error) {
      logger.error('Failed to optimize database connections', error)
    }
  }
  
  private async optimizeHttpConnections() {
    try {
      // Reduce keep-alive timeout
      // httpAgent.keepAliveMsecs = 5000
      
      // Reduce max sockets
      // httpAgent.maxSockets = 50
      
      logger.info('HTTP connections optimized')
    } catch (error) {
      logger.error('Failed to optimize HTTP connections', error)
    }
  }
  
  private async enableRequestThrottling() {
    try {
      // Enable more aggressive rate limiting
      // This would integrate with your rate limiting system
      
      logger.info('Request throttling enabled')
    } catch (error) {
      logger.error('Failed to enable request throttling', error)
    }
  }
}
```

---

## 4. Security Incident Response

### Security Event Detection

#### Security Event Monitor
```typescript
// Security event monitoring and response
// packages/monitoring/src/security-monitor.ts
export enum SecurityEventType {
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_VIOLATION = 'auth_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  INJECTION_ATTACK = 'injection_attack',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  RATE_LIMIT_VIOLATION = 'rate_limit_violation',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload'
}

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: AlertSeverity
  timestamp: number
  source: {
    ip?: string
    userAgent?: string
    userId?: string
    sessionId?: string
    endpoint?: string
  }
  details: any
  resolved: boolean
  resolvedAt?: number
  resolvedBy?: string
  actions: string[]
}

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private events: SecurityEvent[] = []
  private suspiciousIPs: Map<string, {
    count: number
    firstSeen: number
    lastSeen: number
    events: SecurityEventType[]
  }> = new Map()
  
  private detectionRules: Array<{
    type: SecurityEventType
    detect: (context: any) => boolean
    severity: AlertSeverity
    actions: string[]
  }> = []
  
  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
      SecurityMonitor.instance.initializeDetectionRules()
    }
    return SecurityMonitor.instance
  }
  
  private initializeDetectionRules() {
    // Brute force detection
    this.detectionRules.push({
      type: SecurityEventType.BRUTE_FORCE_ATTACK,
      severity: AlertSeverity.HIGH,
      actions: ['block_ip', 'notify_security'],
      detect: (context) => {
        const { ip, timeWindow = 300000 } = context // 5 minutes
        const recentFailures = this.getRecentAuthFailures(ip, timeWindow)
        return recentFailures >= 10
      }
    })
    
    // SQL injection detection
    this.detectionRules.push({
      type: SecurityEventType.INJECTION_ATTACK,
      severity: AlertSeverity.CRITICAL,
      actions: ['block_ip', 'notify_security', 'log_full_request'],
      detect: (context) => {
        const { query, body } = context
        const sqlInjectionPatterns = [
          /(\bunion\b.*\bselect\b)/i,
          /(\bselect\b.*\bfrom\b.*\bwhere\b)/i,
          /(drop|delete|truncate|alter)\s+table/i,
          /\b(exec|execute)\s*\(/i,
          /\b(script|javascript|vbscript)/i
        ]
        
        const testString = `${query || ''} ${JSON.stringify(body || {})}`.toLowerCase()
        return sqlInjectionPatterns.some(pattern => pattern.test(testString))
      }
    })
    
    // Suspicious file upload
    this.detectionRules.push({
      type: SecurityEventType.MALICIOUS_FILE_UPLOAD,
      severity: AlertSeverity.HIGH,
      actions: ['quarantine_file', 'notify_security'],
      detect: (context) => {
        const { fileName, fileContent, fileSize } = context
        
        // Check for dangerous file extensions
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.php']
        if (dangerousExtensions.some(ext => fileName?.toLowerCase().endsWith(ext))) {
          return true
        }
        
        // Check for suspicious content patterns
        const suspiciousPatterns = [
          /eval\s*\(/i,
          /exec\s*\(/i,
          /system\s*\(/i,
          /shell_exec/i,
          /<script.*>.*<\/script>/i
        ]
        
        return suspiciousPatterns.some(pattern => pattern.test(fileContent || ''))
      }
    })
    
    // Privilege escalation detection
    this.detectionRules.push({
      type: SecurityEventType.PRIVILEGE_ESCALATION,
      severity: AlertSeverity.CRITICAL,
      actions: ['revoke_session', 'notify_security', 'audit_user'],
      detect: (context) => {
        const { userId, oldRole, newRole, requestedResource } = context
        
        // Check for unauthorized role changes
        if (oldRole === 'user' && (newRole === 'admin' || newRole === 'manager')) {
          return true
        }
        
        // Check for access to admin resources without proper role
        const adminResources = ['/admin', '/api/admin', '/users', '/settings/system']
        return adminResources.some(resource => 
          requestedResource?.includes(resource) && oldRole !== 'admin'
        )
      }
    })
  }
  
  detectSecurityEvent(context: {
    ip?: string
    userAgent?: string
    userId?: string
    sessionId?: string
    endpoint?: string
    query?: string
    body?: any
    fileName?: string
    fileContent?: string
    fileSize?: number
    oldRole?: string
    newRole?: string
    requestedResource?: string
  }): SecurityEvent | null {
    for (const rule of this.detectionRules) {
      if (rule.detect(context)) {
        const event: SecurityEvent = {
          id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: rule.type,
          severity: rule.severity,
          timestamp: Date.now(),
          source: {
            ip: context.ip,
            userAgent: context.userAgent,
            userId: context.userId,
            sessionId: context.sessionId,
            endpoint: context.endpoint
          },
          details: context,
          resolved: false,
          actions: rule.actions
        }
        
        this.events.push(event)
        this.trackSuspiciousIP(context.ip, rule.type)
        
        logger.error('Security event detected', {
          eventId: event.id,
          type: event.type,
          severity: event.severity,
          source: event.source
        })
        
        // Execute automated responses
        this.executeSecurityActions(event)
        
        return event
      }
    }
    
    return null
  }
  
  private getRecentAuthFailures(ip: string, timeWindow: number): number {
    const cutoff = Date.now() - timeWindow
    return this.events.filter(event => 
      event.type === SecurityEventType.AUTHENTICATION_FAILURE &&
      event.source.ip === ip &&
      event.timestamp >= cutoff
    ).length
  }
  
  private trackSuspiciousIP(ip?: string, eventType?: SecurityEventType) {
    if (!ip) return
    
    const existing = this.suspiciousIPs.get(ip) || {
      count: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      events: []
    }
    
    existing.count++
    existing.lastSeen = Date.now()
    if (eventType && !existing.events.includes(eventType)) {
      existing.events.push(eventType)
    }
    
    this.suspiciousIPs.set(ip, existing)
    
    // Auto-block IPs with multiple security events
    if (existing.count >= 5) {
      this.blockIP(ip, 'Multiple security events detected')
    }
  }
  
  private async executeSecurityActions(event: SecurityEvent) {
    for (const action of event.actions) {
      try {
        switch (action) {
          case 'block_ip':
            if (event.source.ip) {
              await this.blockIP(event.source.ip, `Security event: ${event.type}`)
            }
            break
            
          case 'revoke_session':
            if (event.source.sessionId) {
              await this.revokeSession(event.source.sessionId)
            }
            break
            
          case 'quarantine_file':
            await this.quarantineFile(event)
            break
            
          case 'notify_security':
            await this.notifySecurityTeam(event)
            break
            
          case 'log_full_request':
            await this.logFullRequestDetails(event)
            break
            
          case 'audit_user':
            if (event.source.userId) {
              await this.auditUser(event.source.userId)
            }
            break
        }
        
        logger.info('Security action executed', {
          eventId: event.id,
          action
        })
      } catch (error) {
        logger.error('Security action failed', error, {
          eventId: event.id,
          action
        })
      }
    }
  }
  
  private async blockIP(ip: string, reason: string) {
    logger.warn('Blocking IP address', { ip, reason })
    
    // In a real implementation, this would:
    // - Add IP to firewall rules
    // - Update load balancer configurations
    // - Add to rate limiter blacklist
    // - Update CDN settings
    
    // For now, just log
    logger.warn(`IP ${ip} would be blocked (reason: ${reason})`)
  }
  
  private async revokeSession(sessionId: string) {
    logger.warn('Revoking session', { sessionId })
    
    // In a real implementation:
    // - Remove session from database
    // - Invalidate JWT tokens
    // - Clear session cookies
    // - Notify user of security action
  }
  
  private async quarantineFile(event: SecurityEvent) {
    logger.warn('Quarantining malicious file', {
      eventId: event.id,
      fileName: event.details.fileName
    })
    
    // Move file to quarantine storage
    // Scan with antivirus
    // Notify administrators
  }
  
  private async notifySecurityTeam(event: SecurityEvent) {
    const notification = {
      title: `🔒 SECURITY ALERT: ${event.type}`,
      severity: event.severity,
      eventId: event.id,
      timestamp: new Date(event.timestamp).toISOString(),
      source: event.source,
      details: event.details
    }
    
    logger.error('Security team notification', { notification })
    
    // Send via multiple channels for critical events
    if (event.severity === AlertSeverity.CRITICAL) {
      // SMS, phone call, pager duty
      // Email, Slack, Discord
      // Push notifications
    }
  }
  
  private async logFullRequestDetails(event: SecurityEvent) {
    // Log complete request details for forensic analysis
    logger.error('Full request details for security event', {
      eventId: event.id,
      fullDetails: event.details,
      headers: 'Would capture full headers',
      body: 'Would capture full body',
      query: 'Would capture query parameters'
    })
  }
  
  private async auditUser(userId: string) {
    logger.warn('Initiating user security audit', { userId })
    
    // Review user's recent activities
    // Check permissions and role changes
    // Review access patterns
    // Generate audit report
  }
  
  resolveSecurityEvent(eventId: string, resolvedBy: string, resolution: string) {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.resolved = true
      event.resolvedAt = Date.now()
      event.resolvedBy = resolvedBy
      
      logger.info('Security event resolved', {
        eventId,
        resolvedBy,
        resolution,
        type: event.type
      })
    }
  }
  
  getActiveSecurityEvents(): SecurityEvent[] {
    return this.events.filter(e => !e.resolved)
  }
  
  getSecurityEventSummary(timeWindow: number = 86400000): {
    total: number
    byType: Record<SecurityEventType, number>
    bySeverity: Record<AlertSeverity, number>
    topSuspiciousIPs: Array<{ ip: string; count: number; events: SecurityEventType[] }>
  } {
    const cutoff = Date.now() - timeWindow
    const recentEvents = this.events.filter(e => e.timestamp >= cutoff)
    
    const byType: Record<SecurityEventType, number> = {} as Record<SecurityEventType, number>
    const bySeverity: Record<AlertSeverity, number> = {} as Record<AlertSeverity, number>
    
    recentEvents.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1
    })
    
    const topSuspiciousIPs = Array.from(this.suspiciousIPs.entries())
      .map(([ip, data]) => ({ ip, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    return {
      total: recentEvents.length,
      byType,
      bySeverity,
      topSuspiciousIPs
    }
  }
}
```

---

## 5. AI Governance Alerts and Resolution

### AI Safety Monitoring

#### AI Operation Monitor
```typescript
// AI governance and safety monitoring
// packages/monitoring/src/ai-governance.ts
export enum AIEventType {
  MODEL_RESPONSE_TOXICITY = 'model_toxicity',
  PROMPT_INJECTION = 'prompt_injection',
  DATA_LEAK = 'data_leak',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MODEL_HALLUCINATION = 'model_hallucination',
  UNSAFE_CONTENT_GENERATION = 'unsafe_content',
  BIAS_DETECTION = 'bias_detection',
  COMPLIANCE_VIOLATION = 'compliance_violation'
}

export interface AIGovernanceEvent {
  id: string
  type: AIEventType
  severity: AlertSeverity
  timestamp: number
  modelId: string
  userId?: string
  sessionId?: string
  prompt: string
  response?: string
  violationDetails: any
  resolved: boolean
  actions: string[]
}

export class AIGovernanceMonitor {
  private static instance: AIGovernanceMonitor
  private events: AIGovernanceEvent[] = []
  private safetyRules: Array<{
    type: AIEventType
    check: (prompt: string, response?: string, context?: any) => boolean
    severity: AlertSeverity
    actions: string[]
  }> = []
  
  static getInstance(): AIGovernanceMonitor {
    if (!AIGovernanceMonitor.instance) {
      AIGovernanceMonitor.instance = new AIGovernanceMonitor()
      AIGovernanceMonitor.instance.initializeSafetyRules()
    }
    return AIGovernanceMonitor.instance
  }
  
  private initializeSafetyRules() {
    // Prompt injection detection
    this.safetyRules.push({
      type: AIEventType.PROMPT_INJECTION,
      severity: AlertSeverity.HIGH,
      actions: ['block_response', 'log_incident', 'notify_ai_safety'],
      check: (prompt, response, context) => {
        const injectionPatterns = [
          /ignore\s+(all\s+)?previous\s+instructions/i,
          /forget\s+(all\s+)?(previous\s+)?instructions/i,
          /you\s+are\s+now\s+[a-z\s]+/i,
          /pretend\s+to\s+be\s+/i,
          /act\s+as\s+(if\s+you\s+are\s+)?/i,
          /roleplay\s+as/i,
          /simulate\s+being/i,
          /override\s+your\s+programming/i
        ]
        
        return injectionPatterns.some(pattern => pattern.test(prompt))
      }
    })
    
    // Data leak detection
    this.safetyRules.push({
      type: AIEventType.DATA_LEAK,
      severity: AlertSeverity.CRITICAL,
      actions: ['block_response', 'scrub_logs', 'notify_security', 'audit_model'],
      check: (prompt, response, context) => {
        if (!response) return false
        
        const sensitivePatterns = [
          /\b\d{3}-\d{2}-\d{4}\b/, // SSN
          /\b\d{16}\b/, // Credit card
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
          /\b\d{3}-\d{3}-\d{4}\b/, // Phone number
          /password\s*[:=]\s*[^\s]+/i,
          /api[_\s]*key\s*[:=]\s*[^\s]+/i,
          /secret\s*[:=]\s*[^\s]+/i
        ]
        
        return sensitivePatterns.some(pattern => pattern.test(response))
      }
    })
    
    // Toxicity detection
    this.safetyRules.push({
      type: AIEventType.MODEL_RESPONSE_TOXICITY,
      severity: AlertSeverity.HIGH,
      actions: ['block_response', 'retrain_model', 'notify_ai_safety'],
      check: (prompt, response, context) => {
        if (!response) return false
        
        const toxicPatterns = [
          /\b(hate|kill|murder|death|violence)\b/i,
          /\b(racist|sexist|discrimination|harassment)\b/i,
          /\b(suicide|self-harm|cutting)\b/i,
          /\b(illegal|drugs|weapons|bomb)\b/i
        ]
        
        // Also check toxicity score from AI service
        const toxicityScore = context?.toxicityScore || 0
        return toxicityScore > 0.7 || toxicPatterns.some(pattern => pattern.test(response))
      }
    })
    
    // Bias detection
    this.safetyRules.push({
      type: AIEventType.BIAS_DETECTION,
      severity: AlertSeverity.MEDIUM,
      actions: ['flag_for_review', 'update_training', 'notify_ai_ethics'],
      check: (prompt, response, context) => {
        if (!response) return false
        
        const biasIndicators = [
          /men\s+are\s+better\s+at/i,
          /women\s+should\s+not/i,
          /people\s+from\s+\w+\s+are\s+typically/i,
          /\w+\s+people\s+are\s+naturally/i
        ]
        
        return biasIndicators.some(pattern => pattern.test(response))
      }
    })
    
    // Compliance violation detection
    this.safetyRules.push({
      type: AIEventType.COMPLIANCE_VIOLATION,
      severity: AlertSeverity.HIGH,
      actions: ['block_response', 'legal_review', 'notify_compliance'],
      check: (prompt, response, context) => {
        // Check for requests that violate regulations
        const complianceViolations = [
          /medical\s+advice/i,
          /legal\s+advice/i,
          /financial\s+advice/i,
          /investment\s+recommendation/i,
          /how\s+to\s+break\s+the\s+law/i,
          /illegal\s+activities/i
        ]
        
        return complianceViolations.some(pattern => pattern.test(prompt) || pattern.test(response || ''))
      }
    })
  }
  
  async monitorAIInteraction(
    modelId: string,
    prompt: string,
    response?: string,
    context?: {
      userId?: string
      sessionId?: string
      toxicityScore?: number
      [key: string]: any
    }
  ): Promise<AIGovernanceEvent[]> {
    const detectedEvents: AIGovernanceEvent[] = []
    
    for (const rule of this.safetyRules) {
      if (rule.check(prompt, response, context)) {
        const event: AIGovernanceEvent = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: rule.type,
          severity: rule.severity,
          timestamp: Date.now(),
          modelId,
          userId: context?.userId,
          sessionId: context?.sessionId,
          prompt: this.sanitizeForLogging(prompt),
          response: response ? this.sanitizeForLogging(response) : undefined,
          violationDetails: {
            rule: rule.type,
            context
          },
          resolved: false,
          actions: rule.actions
        }
        
        this.events.push(event)
        detectedEvents.push(event)
        
        logger.error('AI governance violation detected', {
          eventId: event.id,
          type: event.type,
          severity: event.severity,
          modelId
        })
        
        // Execute automated responses
        await this.executeAIActions(event, prompt, response)
      }
    }
    
    return detectedEvents
  }
  
  private sanitizeForLogging(text: string): string {
    // Remove potential PII and sensitive data from logs
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]')
      .replace(/\b\d{16}\b/g, '[CARD-REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]')
      .replace(/password\s*[:=]\s*[^\s]+/gi, 'password=[REDACTED]')
      .replace(/api[_\s]*key\s*[:=]\s*[^\s]+/gi, 'api_key=[REDACTED]')
  }
  
  private async executeAIActions(event: AIGovernanceEvent, prompt: string, response?: string) {
    for (const action of event.actions) {
      try {
        switch (action) {
          case 'block_response':
            await this.blockResponse(event)
            break
            
          case 'scrub_logs':
            await this.scrubLogsOfSensitiveData(event)
            break
            
          case 'retrain_model':
            await this.initiateModelRetraining(event)
            break
            
          case 'audit_model':
            await this.auditModel(event.modelId)
            break
            
          case 'notify_ai_safety':
            await this.notifyAISafetyTeam(event)
            break
            
          case 'notify_ai_ethics':
            await this.notifyAIEthicsTeam(event)
            break
            
          case 'notify_compliance':
            await this.notifyComplianceTeam(event)
            break
            
          case 'legal_review':
            await this.requestLegalReview(event)
            break
            
          case 'flag_for_review':
            await this.flagForHumanReview(event)
            break
            
          case 'update_training':
            await this.updateModelTraining(event, prompt, response)
            break
        }
        
        logger.info('AI governance action executed', {
          eventId: event.id,
          action
        })
      } catch (error) {
        logger.error('AI governance action failed', error, {
          eventId: event.id,
          action
        })
      }
    }
  }
  
  private async blockResponse(event: AIGovernanceEvent) {
    logger.warn('Blocking AI response', { eventId: event.id })
    
    // Prevent response from being shown to user
    // Return safe alternative response
    const safeResponse = this.generateSafeAlternativeResponse(event.type)
    logger.info('Safe alternative response generated', { 
      eventId: event.id, 
      safeResponse: safeResponse.substring(0, 100) 
    })
  }
  
  private generateSafeAlternativeResponse(eventType: AIEventType): string {
    switch (eventType) {
      case AIEventType.PROMPT_INJECTION:
        return "I notice you're trying to modify my instructions. I'm designed to be helpful, harmless, and honest. How can I assist you with your work order management needs?"
        
      case AIEventType.DATA_LEAK:
        return "I cannot provide sensitive information. Let me help you with general work order management instead."
        
      case AIEventType.MODEL_RESPONSE_TOXICITY:
        return "I apologize, but I can't provide that type of response. Let me help you with your business management needs in a constructive way."
        
      case AIEventType.COMPLIANCE_VIOLATION:
        return "I cannot provide advice in regulated areas. For professional guidance, please consult with qualified experts in the relevant field."
        
      default:
        return "I'm here to help with work order management and business operations. How can I assist you today?"
    }
  }
  
  private async scrubLogsOfSensitiveData(event: AIGovernanceEvent) {
    logger.warn('Scrubbing logs of sensitive data', { eventId: event.id })
    
    // Find and redact sensitive data from logs
    // Update database records
    // Clear cached responses
  }
  
  private async initiateModelRetraining(event: AIGovernanceEvent) {
    logger.warn('Initiating model retraining', { eventId: event.id })
    
    // Queue model for retraining
    // Add negative examples to training data
    // Schedule redeployment after training
  }
  
  private async auditModel(modelId: string) {
    logger.warn('Initiating model audit', { modelId })
    
    // Comprehensive model behavior audit
    // Test against known problematic prompts
    // Generate audit report
  }
  
  private async notifyAISafetyTeam(event: AIGovernanceEvent) {
    const notification = {
      title: `🤖 AI SAFETY ALERT: ${event.type}`,
      severity: event.severity,
      eventId: event.id,
      modelId: event.modelId,
      timestamp: new Date(event.timestamp).toISOString(),
      violationType: event.type,
      userId: event.userId
    }
    
    logger.error('AI safety team notification', { notification })
    
    // Send to AI safety team via multiple channels
  }
  
  private async notifyAIEthicsTeam(event: AIGovernanceEvent) {
    logger.warn('Notifying AI ethics team', { eventId: event.id })
    
    // Send ethics violation report
    // Schedule ethics review meeting
    // Document bias patterns
  }
  
  private async notifyComplianceTeam(event: AIGovernanceEvent) {
    logger.error('Notifying compliance team', { eventId: event.id })
    
    // Send compliance violation report
    // Initiate regulatory review process
    // Update compliance documentation
  }
  
  private async requestLegalReview(event: AIGovernanceEvent) {
    logger.error('Requesting legal review', { eventId: event.id })
    
    // Create legal review ticket
    // Gather evidence and context
    // Schedule legal consultation
  }
  
  private async flagForHumanReview(event: AIGovernanceEvent) {
    logger.info('Flagging for human review', { eventId: event.id })
    
    // Add to human review queue
    // Assign to appropriate reviewer
    // Set review priority
  }
  
  private async updateModelTraining(event: AIGovernanceEvent, prompt: string, response?: string) {
    logger.info('Updating model training data', { eventId: event.id })
    
    // Add corrective examples to training set
    // Update fine-tuning parameters
    // Schedule model retraining
  }
  
  getAIGovernanceSummary(timeWindow: number = 86400000): {
    total: number
    byType: Record<AIEventType, number>
    bySeverity: Record<AlertSeverity, number>
    modelViolations: Record<string, number>
    activeEvents: number
  } {
    const cutoff = Date.now() - timeWindow
    const recentEvents = this.events.filter(e => e.timestamp >= cutoff)
    
    const byType: Record<AIEventType, number> = {} as Record<AIEventType, number>
    const bySeverity: Record<AlertSeverity, number> = {} as Record<AlertSeverity, number>
    const modelViolations: Record<string, number> = {}
    
    recentEvents.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1
      modelViolations[event.modelId] = (modelViolations[event.modelId] || 0) + 1
    })
    
    const activeEvents = this.events.filter(e => !e.resolved).length
    
    return {
      total: recentEvents.length,
      byType,
      bySeverity,
      modelViolations,
      activeEvents
    }
  }
  
  resolveAIEvent(eventId: string, resolvedBy: string, resolution: string) {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.resolved = true
      
      logger.info('AI governance event resolved', {
        eventId,
        resolvedBy,
        resolution,
        type: event.type
      })
    }
  }
}
```

---

## 6. Monitoring Integration and Dashboard

### Unified Monitoring Dashboard
```typescript
// Unified monitoring dashboard
// packages/monitoring/src/monitoring-dashboard.ts
export class MonitoringDashboard {
  private static instance: MonitoringDashboard
  private alertEngine = AlertEngine.getInstance()
  private securityMonitor = SecurityMonitor.getInstance()
  private aiGovernance = AIGovernanceMonitor.getInstance()
  private performanceMonitor = PerformanceMonitor.getInstance()
  
  static getInstance(): MonitoringDashboard {
    if (!MonitoringDashboard.instance) {
      MonitoringDashboard.instance = new MonitoringDashboard()
    }
    return MonitoringDashboard.instance
  }
  
  async getDashboardData() {
    const now = Date.now()
    const oneDayAgo = now - 86400000 // 24 hours
    
    // Get all monitoring data
    const [
      alerts,
      securitySummary,
      aiSummary,
      performanceTrends,
      recentSnapshots
    ] = await Promise.all([
      this.alertEngine.getAlertSummary(),
      this.securityMonitor.getSecurityEventSummary(),
      this.aiGovernance.getAIGovernanceSummary(),
      this.performanceMonitor.getPerformanceTrends(),
      this.performanceMonitor.getRecentSnapshots(12) // Last 6 hours at 30-min intervals
    ])
    
    return {
      timestamp: now,
      system: {
        status: this.calculateOverallStatus(alerts, securitySummary, aiSummary),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      },
      alerts,
      security: securitySummary,
      ai: aiSummary,
      performance: {
        trends: performanceTrends,
        snapshots: recentSnapshots
      },
      insights: await this.generateInsights()
    }
  }
  
  private calculateOverallStatus(
    alerts: any,
    security: any,
    ai: any
  ): 'healthy' | 'warning' | 'critical' {
    // Critical conditions
    if (
      alerts.bySeverity[AlertSeverity.CRITICAL] > 0 ||
      security.bySeverity[AlertSeverity.CRITICAL] > 0 ||
      ai.bySeverity[AlertSeverity.CRITICAL] > 0
    ) {
      return 'critical'
    }
    
    // Warning conditions
    if (
      alerts.bySeverity[AlertSeverity.HIGH] > 0 ||
      alerts.bySeverity[AlertSeverity.MEDIUM] > 2 ||
      security.bySeverity[AlertSeverity.HIGH] > 0 ||
      ai.bySeverity[AlertSeverity.HIGH] > 0
    ) {
      return 'warning'
    }
    
    return 'healthy'
  }
  
  private async generateInsights(): Promise<string[]> {
    const insights: string[] = []
    
    // Performance insights
    const trends = this.performanceMonitor.getPerformanceTrends()
    if (trends.memory.trend === 'increasing' && trends.memory.rate > 0.1) {
      insights.push('Memory usage is trending upward - consider investigating for memory leaks')
    }
    
    if (trends.errorRate.trend === 'increasing') {
      insights.push('Error rate is increasing - check recent deployments and dependencies')
    }
    
    // Security insights
    const securitySummary = this.securityMonitor.getSecurityEventSummary()
    if (securitySummary.total > 10) {
      insights.push(`High security activity detected: ${securitySummary.total} events in the last 24 hours`)
    }
    
    // AI governance insights
    const aiSummary = this.aiGovernance.getAIGovernanceSummary()
    if (aiSummary.total > 0) {
      insights.push(`AI governance events detected: ${aiSummary.total} violations requiring attention`)
    }
    
    return insights
  }
  
  async exportDashboardData(format: 'json' | 'csv' = 'json') {
    const data = await this.getDashboardData()
    
    if (format === 'csv') {
      return this.convertToCSV(data)
    }
    
    return JSON.stringify(data, null, 2)
  }
  
  private convertToCSV(data: any): string {
    // Convert monitoring data to CSV format
    // Implementation would depend on specific data structure needs
    return 'CSV conversion not implemented yet'
  }
}
```

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Debugging Tools and Techniques](./04-debugging-tools-techniques.md)*  
*Next: [Troubleshooting Index](./README.md)*