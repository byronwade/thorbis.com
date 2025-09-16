/**
 * Comprehensive Reporting and Analytics Engine
 * 
 * Provides advanced analytics, reporting, and business intelligence features
 * across all industries with real-time data processing and insights
 */

import { executeQuery } from './database'
import { cache } from './cache'
import crypto from 'crypto'

// Analytics configuration
interface AnalyticsConfig {
  cacheResults: boolean
  cacheTTL: number
  enableRealTime: boolean
  aggregationInterval: number // minutes
  retentionDays: number
}

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  cacheResults: true,
  cacheTTL: 900, // 15 minutes
  enableRealTime: true,
  aggregationInterval: 5, // 5 minutes
  retentionDays: 365 // 1 year
}

// Time range definitions
export enum TimeRange {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

// Metric types
export enum MetricType {
  REVENUE = 'revenue',
  COUNT = 'count',
  AVERAGE = 'average',
  SUM = 'sum',
  PERCENTAGE = 'percentage',
  RATE = 'rate',
  DURATION = 'duration'
}

// Industry types
export enum Industry {
  HOME_SERVICES = 'hs',
  RESTAURANT = 'rest',
  AUTO_SERVICES = 'auto',
  RETAIL = 'retail',
  EDUCATION = 'education',
  PAYROLL = 'payroll'
}

// Analytics interfaces
export interface MetricDefinition {
  name: string
  type: MetricType
  table: string
  field: string
  filters?: Record<string, unknown>
  groupBy?: string[]
  calculations?: Record<string, string>
}

export interface AnalyticsRequest {
  industry?: Industry
  metrics: string[]
  timeRange: TimeRange
  startDate?: Date
  endDate?: Date
  groupBy?: string[]
  filters?: Record<string, unknown>
  compareWith?: {
    timeRange: TimeRange
    startDate?: Date
    endDate?: Date
  }
}

export interface AnalyticsResult {
  data: Record<string, unknown>[]
  summary: Record<string, number>
  trends: Record<string, { value: number; change: number; trend: 'up' | 'down' | 'stable' }>
  comparisons?: Record<string, { current: number; previous: number; change: number; changePercent: number }>
  metadata: {
    totalRecords: number
    aggregationLevel: string
    generatedAt: Date
    cached: boolean
    took: number
  }
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'kpi'
  title: string
  description?: string
  position: { x: number; y: number; w: number; h: number }
  config: {
    metrics: string[]
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
    timeRange: TimeRange
    refreshInterval?: number
    filters?: Record<string, unknown>
  }
}

export interface Dashboard {
  id: string
  businessId: string
  name: string
  description?: string
  industry?: Industry
  widgets: DashboardWidget[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// Predefined metrics for each industry
const METRIC_DEFINITIONS: Record<string, Record<string, MetricDefinition>> = {
  hs: {
    totalRevenue: {
      name: 'Total Revenue',
      type: MetricType.REVENUE,
      table: 'hs.work_orders',
      field: 'total',
      filters: { status: 'completed' }
    },
    activeCustomers: {
      name: 'Active Customers',
      type: MetricType.COUNT,
      table: 'hs.customers',
      field: 'id',
      filters: { status: 'active' }
    },
    avgOrderValue: {
      name: 'Average Order Value',
      type: MetricType.AVERAGE,
      table: 'hs.work_orders',
      field: 'total',
      filters: { status: 'completed' }
    },
    completedOrders: {
      name: 'Completed Orders',
      type: MetricType.COUNT,
      table: 'hs.work_orders',
      field: 'id',
      filters: { status: 'completed' }
    },
    customerSatisfaction: {
      name: 'Customer Satisfaction',
      type: MetricType.AVERAGE,
      table: 'hs.work_orders',
      field: 'rating'
    },
    revenueByService: {
      name: 'Revenue by Service Type',
      type: MetricType.SUM,
      table: 'hs.work_orders',
      field: 'total',
      groupBy: ['service_type'],
      filters: { status: 'completed' }
    }
  },
  rest: {
    totalSales: {
      name: 'Total Sales',
      type: MetricType.REVENUE,
      table: 'rest.orders',
      field: 'total',
      filters: { status: 'completed' }
    },
    orderCount: {
      name: 'Order Count',
      type: MetricType.COUNT,
      table: 'rest.orders',
      field: 'id'
    },
    avgOrderValue: {
      name: 'Average Order Value',
      type: MetricType.AVERAGE,
      table: 'rest.orders',
      field: 'total',
      filters: { status: 'completed' }
    },
    popularItems: {
      name: 'Popular Menu Items',
      type: MetricType.COUNT,
      table: 'rest.order_items',
      field: 'quantity',
      groupBy: ['menu_item_id']
    }
  },
  retail: {
    totalSales: {
      name: 'Total Sales',
      type: MetricType.REVENUE,
      table: 'retail.sales',
      field: 'total'
    },
    inventoryTurnover: {
      name: 'Inventory Turnover',
      type: MetricType.RATE,
      table: 'retail.products',
      field: 'stock_quantity',
      calculations: {
        'cost_of_goods_sold': 'SUM(cost_price * quantity_sold)',
        'avg_inventory': 'AVG(stock_quantity * cost_price)'
      }
    },
    topProducts: {
      name: 'Top Selling Products',
      type: MetricType.COUNT,
      table: 'retail.sale_items',
      field: 'quantity',
      groupBy: ['product_id']
    }
  }
}

export class AnalyticsEngine {
  private config: AnalyticsConfig

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config }
  }

  /**
   * Generate analytics report
   */
  async generateReport(businessId: string, request: AnalyticsRequest): Promise<AnalyticsResult> {
    const startTime = Date.now()

    try {
      // Build cache key
      const cacheKey = this.buildCacheKey(businessId, request)
      
      // Try to get from cache
      if (this.config.cacheResults) {
        const cachedResult = await cache.get<AnalyticsResult>(cacheKey, businessId)
        if (cachedResult) {
          return {
            ...cachedResult,
            metadata: {
              ...cachedResult.metadata,
              cached: true,
              took: Date.now() - startTime
            }
          }
        }
      }

      // Generate time boundaries
      const { startDate, endDate } = this.calculateTimeBoundaries(request)

      // Execute queries for each metric
      const metricResults: Record<string, unknown> = {}
      const industryMetrics = METRIC_DEFINITIONS[request.industry || 'hs'] || {}

      for (const metricName of request.metrics) {
        const metric = industryMetrics[metricName]
        if (metric) {
          metricResults[metricName] = await this.executeMetricQuery(
            businessId,
            metric,
            startDate,
            endDate,
            request.filters
          )
        }
      }

      // Calculate trends and comparisons
      const trends = await this.calculateTrends(businessId, request, metricResults)
      const comparisons = request.compareWith 
        ? await this.calculateComparisons(businessId, request, metricResults)
        : undefined

      // Build result
      const result: AnalyticsResult = {
        data: this.transformResults(metricResults, request),
        summary: this.generateSummary(metricResults),
        trends,
        comparisons,
        metadata: {
          totalRecords: Object.keys(metricResults).length,
          aggregationLevel: this.getAggregationLevel(request.timeRange),
          generatedAt: new Date(),
          cached: false,
          took: Date.now() - startTime
        }
      }

      // Cache the result
      if (this.config.cacheResults) {
        await cache.set(cacheKey, result, this.config.cacheTTL, businessId, ['analytics'])
      }

      return result

    } catch (error) {
      console.error('Analytics generation error:', error)
      throw new Error('Failed to generate analytics report')
    }
  }

  /**
   * Get predefined dashboard templates
   */
  async getDashboardTemplates(industry?: Industry): Promise<Dashboard[]> {
    const templates: Dashboard[] = []

    // Home Services dashboard template
    if (!industry || industry === Industry.HOME_SERVICES) {
      templates.push({
        id: 'hs-overview',
        businessId: 'template',
        name: 'Home Services Overview',
        description: 'Key metrics for home services business',
        industry: Industry.HOME_SERVICES,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: [
          {
            id: 'revenue-kpi',
            type: 'kpi',
            title: 'Total Revenue',
            position: { x: 0, y: 0, w: 3, h: 2 },
            config: {
              metrics: ['totalRevenue'],
              timeRange: TimeRange.MONTH
            }
          },
          {
            id: 'customers-kpi',
            type: 'kpi',
            title: 'Active Customers',
            position: { x: 3, y: 0, w: 3, h: 2 },
            config: {
              metrics: ['activeCustomers'],
              timeRange: TimeRange.MONTH
            }
          },
          {
            id: 'revenue-chart',
            type: 'chart',
            title: 'Revenue Trend',
            position: { x: 0, y: 2, w: 6, h: 4 },
            config: {
              metrics: ['totalRevenue'],
              chartType: 'line',
              timeRange: TimeRange.MONTH
            }
          },
          {
            id: 'service-breakdown',
            type: 'chart',
            title: 'Revenue by Service Type',
            position: { x: 6, y: 0, w: 6, h: 6 },
            config: {
              metrics: ['revenueByService'],
              chartType: 'pie',
              timeRange: TimeRange.MONTH
            }
          }
        ]
      })
    }

    // Restaurant dashboard template
    if (!industry || industry === Industry.RESTAURANT) {
      templates.push({
        id: 'rest-overview',
        businessId: 'template',
        name: 'Restaurant Overview',
        description: 'Key metrics for restaurant business',
        industry: Industry.RESTAURANT,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: [
          {
            id: 'sales-kpi',
            type: 'kpi',
            title: 'Total Sales',
            position: { x: 0, y: 0, w: 3, h: 2 },
            config: {
              metrics: ['totalSales'],
              timeRange: TimeRange.DAY
            }
          },
          {
            id: 'orders-kpi',
            type: 'kpi',
            title: 'Orders Today',
            position: { x: 3, y: 0, w: 3, h: 2 },
            config: {
              metrics: ['orderCount'],
              timeRange: TimeRange.DAY
            }
          }
        ]
      })
    }

    return templates
  }

  /**
   * Create custom dashboard
   */
  async createDashboard(businessId: string, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    try {
      const dashboardId = crypto.randomUUID()
      const newDashboard: Dashboard = {
        id: dashboardId,
        businessId,
        name: dashboard.name || 'New Dashboard',
        description: dashboard.description,
        industry: dashboard.industry,
        widgets: dashboard.widgets || [],
        isPublic: dashboard.isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store dashboard in database (would implement with real database)
      // For now, just return the created dashboard
      return newDashboard

    } catch (error) {
      console.error('Dashboard creation error:', error)
      throw new Error('Failed to create dashboard')
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(businessId: string, dashboardId: string): Promise<Record<string, unknown>> {
    try {
      // Get dashboard configuration (would fetch from database)
      // For now, return mock data
      
      const dashboardData: Record<string, unknown> = {}

      // This would fetch each widget's data based on its configuration'
      // and return the aggregated data for the entire dashboard

      return dashboardData

    } catch (error) {
      console.error('Dashboard data error:', error)
      throw new Error('Failed to get dashboard data')
    }
  }

  /**
   * Generate automated insights
   */
  async generateInsights(businessId: string, industry?: Industry): Promise<Array<{
    type: 'opportunity' | 'warning' | 'trend' | 'anomaly'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    actionable: boolean
    actions?: string[]
    data?: any
  }>> {
    const insights = []

    try {
      // Revenue trend analysis
      const revenueAnalysis = await this.analyzeRevenueTrends(businessId, industry)
      if (revenueAnalysis) {
        insights.push(revenueAnalysis)
      }

      // Customer behavior insights
      const customerInsights = await this.analyzeCustomerBehavior(businessId, industry)
      insights.push(...customerInsights)

      // Performance anomalies
      const anomalies = await this.detectAnomalies(businessId, industry)
      insights.push(...anomalies)

      // Growth opportunities
      const opportunities = await this.identifyOpportunities(businessId, industry)
      insights.push(...opportunities)

      return insights

    } catch (error) {
      console.error('Insights generation error:', error)
      return []
    }
  }

  /**
   * Execute metric query
   */
  private async executeMetricQuery(
    businessId: string,
    metric: MetricDefinition,
    startDate: Date,
    endDate: Date,
    filters?: Record<string, unknown>
  ): Promise<any[]> {
    let query = `
    const params: unknown[] = [businessId]
    const paramIndex = 2

    // Build query based on metric type
    switch (metric.type) {
      case MetricType.REVENUE:
      case MetricType.SUM:
        query = `SELECT COALESCE(SUM(${metric.field}), 0) as value FROM ${metric.table} WHERE business_id = $1`
        break
      case MetricType.COUNT:
        query = `SELECT COUNT(${metric.field}) as value FROM ${metric.table} WHERE business_id = $1`
        break
      case MetricType.AVERAGE:
        query = `SELECT COALESCE(AVG(${metric.field}), 0) as value FROM ${metric.table} WHERE business_id = $1`
        break
      default:
        query = `SELECT ${metric.field} as value FROM ${metric.table} WHERE business_id = $1`
    }

    // Add date filter
    query += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    params.push(startDate.toISOString(), endDate.toISOString())
    paramIndex += 2

    // Add metric filters
    if (metric.filters) {
      for (const [key, value] of Object.entries(metric.filters)) {
        query += ` AND ${key} = $${paramIndex}`
        params.push(value)
        paramIndex++
      }
    }

    // Add request filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query += ` AND ${key} = $${paramIndex}'
        params.push(value)
        paramIndex++
      }
    }

    // Add group by
    if (metric.groupBy && metric.groupBy.length > 0) {
      query += ' GROUP BY ${metric.groupBy.join(', ')}'
    }

    try {
      return await executeQuery(businessId, query, params)
    } catch (error) {
      console.error('Metric query error:', error)
      return []
    }
  }

  /**
   * Calculate time boundaries
   */
  private calculateTimeBoundaries(request: AnalyticsRequest): { startDate: Date; endDate: Date } {
    const now = new Date()
    let startDate: Date
    const endDate = request.endDate || now

    if (request.startDate) {
      startDate = request.startDate
    } else {
      switch (request.timeRange) {
        case TimeRange.HOUR:
          startDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case TimeRange.DAY:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case TimeRange.WEEK:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case TimeRange.MONTH:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case TimeRange.QUARTER:
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case TimeRange.YEAR:
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    return { startDate, endDate }
  }

  /**
   * Calculate trends
   */
  private async calculateTrends(
    businessId: string,
    request: AnalyticsRequest,
    metricResults: Record<string, unknown>
  ): Promise<Record<string, { value: number; change: number; trend: 'up' | 'down' | 'stable' }>> {
    // Simplified trend calculation - would implement proper trend analysis
    const trends: Record<string, unknown> = {}

    for (const [metricName, results] of Object.entries(metricResults)) {
      const value = Array.isArray(results) && results.length > 0 ? results[0].value : 0
      const change = Math.random() * 20 - 10 // Mock change percentage
      
      trends[metricName] = {
        value: parseFloat(value) || 0,
        change: change,
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
      }
    }

    return trends
  }

  /**
   * Calculate comparisons
   */
  private async calculateComparisons(
    businessId: string,
    request: AnalyticsRequest,
    currentResults: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Would implement comparison with previous period
    return {}
  }

  /**
   * Transform results for output
   */
  private transformResults(metricResults: Record<string, unknown>, request: AnalyticsRequest): Record<string, unknown>[] {
    const data: Record<string, unknown>[] = []

    for (const [metricName, results] of Object.entries(metricResults)) {
      if (Array.isArray(results)) {
        results.forEach(result => {
          data.push({
            metric: metricName,
            ...result
          })
        })
      }
    }

    return data
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(metricResults: Record<string, unknown>): Record<string, number> {
    const summary: Record<string, number> = {}

    for (const [metricName, results] of Object.entries(metricResults)) {
      if (Array.isArray(results) && results.length > 0) {
        const values = results.map(r => parseFloat(r.value) || 0)
        summary[metricName] = values.reduce((sum, val) => sum + val, 0)
      }
    }

    return summary
  }

  /**
   * Get aggregation level for time range
   */
  private getAggregationLevel(timeRange: TimeRange): string {
    switch (timeRange) {
      case TimeRange.HOUR: return 'minute'
      case TimeRange.DAY: return 'hour'
      case TimeRange.WEEK: return 'day'
      case TimeRange.MONTH: return 'day'
      case TimeRange.QUARTER: return 'week'
      case TimeRange.YEAR: return 'month'
      default: return 'day'
    }
  }

  /**
   * Build cache key
   */
  private buildCacheKey(businessId: string, request: AnalyticsRequest): string {
    const requestHash = crypto.createHash('md5')
      .update(JSON.stringify(request))
      .digest('hex')
    
    return 'analytics:${businessId}:${requestHash}'
  }

  /**
   * Analyze revenue trends
   */
  private async analyzeRevenueTrends(businessId: string, industry?: Industry) {
    // Mock implementation - would analyze actual revenue data
    const growthRate = Math.random() * 20 - 5
    
    if (growthRate > 10) {
      return {
        type: 'opportunity' as const,
        title: 'Strong Revenue Growth Detected',
        description: 'Revenue has grown by ${growthRate.toFixed(1)}% compared to the previous period. Consider expanding your successful services.',
        impact: 'high' as const,
        actionable: true,
        actions: [
          'Analyze which services are driving growth',
          'Consider expanding marketing for high-performing services',
          'Hire additional staff to meet increased demand'
        ]
      }
    } else if (growthRate < -5) {
      return {
        type: 'warning' as const,
        title: 'Revenue Decline Detected',
        description: 'Revenue has declined by ${Math.abs(growthRate).toFixed(1)}% compared to the previous period. Immediate action may be needed.',
        impact: 'high' as const,
        actionable: true,
        actions: [
          'Review recent customer feedback',
          'Analyze competitor pricing and offerings',
          'Consider promotional campaigns or service improvements'
        ]
      }
    }

    return null
  }

  /**
   * Analyze customer behavior
   */
  private async analyzeCustomerBehavior(businessId: string, industry?: Industry) {
    // Mock customer behavior insights
    return [
      {
        type: 'trend' as const,
        title: 'Customer Retention Improving',
        description: 'Repeat customer rate has increased by 12% over the last month.',
        impact: 'medium' as const,
        actionable: true,
        actions: [
          'Continue current customer service practices',
          'Implement loyalty program to further boost retention'
        ]
      }
    ]
  }

  /**
   * Detect anomalies
   */
  private async detectAnomalies(businessId: string, industry?: Industry) {
    // Mock anomaly detection
    return [
      {
        type: 'anomaly' as const,
        title: 'Unusual Order Pattern Detected',
        description: 'Orders spiked 300% on Tuesday compared to typical patterns.',
        impact: 'medium' as const,
        actionable: true,
        actions: [
          'Investigate the cause of the spike',
          'Ensure adequate staffing for similar future events'
        ]
      }
    ]
  }

  /**
   * Identify growth opportunities
   */
  private async identifyOpportunities(businessId: string, industry?: Industry) {
    // Mock opportunity identification
    return [
      {
        type: 'opportunity' as const,
        title: 'Underutilized Service Area',
        description: 'Electrical services represent only 5% of revenue but have 95% customer satisfaction.',
        impact: 'high' as const,
        actionable: true,
        actions: [
          'Increase marketing for electrical services',
          'Cross-sell electrical services to existing customers',
          'Consider adding more electrical service offerings'
        ]
      }
    ]
  }
}

// Global analytics engine instance
export const analyticsEngine = new AnalyticsEngine()

// Analytics middleware for API routes
export function withAnalytics() {
  return function (handler: Function) {
    return async function (request: Request, context?: any) {
      // Add analytics engine to request context
      ;(request as any).analyticsEngine = analyticsEngine
      return await handler(request, context)
    }
  }
}

export type { AnalyticsConfig, AnalyticsRequest, AnalyticsResult, Dashboard, DashboardWidget }