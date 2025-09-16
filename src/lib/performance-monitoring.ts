/**
 * Enterprise Performance Monitoring and Metrics System
 * 
 * Comprehensive system monitoring, business intelligence, performance analytics,
 * and real-time metrics collection across all Thorbis industries
 */

export interface SystemMetrics {
  id: string
  businessId: string
  
  // Metric details
  metricName: string
  metricType: MetricType
  category: MetricCategory
  
  // Values and measurements
  value: number
  unit: string
  threshold?: MetricThreshold
  
  // Time tracking
  timestamp: Date
  timeWindow: TimeWindow
  aggregationType: AggregationType
  
  // Context and tags
  tags: Record<string, string>
  dimensions: MetricDimension[]
  
  // Source information
  source: MetricSource
  sourceId?: string
  collectedBy: string
  
  // Alerting
  alertLevel?: AlertLevel
  isAnomalous?: boolean
  anomalyScore?: number
  
  // Industry-specific context
  industryContext?: {
    homeServices?: {
      serviceType?: string
      technician?: string
      jobLocation?: string
      equipmentId?: string
    }
    restaurant?: {
      location?: string
      shift?: string
      station?: string
      menuItem?: string
    }
    auto?: {
      serviceType?: string
      bay?: string
      technician?: string
      vehicleType?: string
    }
    retail?: {
      store?: string
      department?: string
      product?: string
      cashier?: string
    }
    education?: {
      course?: string
      instructor?: string
      classroom?: string
      semester?: string
    }
  }
  
  // Related metrics
  correlatedMetrics?: string[]
  derivedFrom?: string[]
  
  createdAt: Date
  updatedAt: Date
}

export interface PerformanceDashboard {
  id: string
  businessId: string
  
  // Dashboard configuration
  name: string
  description: string
  dashboardType: DashboardType
  industry: string
  
  // Layout and visualization
  layout: DashboardLayout
  widgets: DashboardWidget[]
  refreshInterval: number
  
  // Access control
  isPublic: boolean
  allowedUsers: string[]
  allowedRoles: string[]
  
  // Time settings
  defaultTimeRange: TimeRange
  timezone: string
  
  // Filters and parameters
  globalFilters: DashboardFilter[]
  parameters: DashboardParameter[]
  
  // Industry-specific dashboards
  industryConfig?: {
    homeServices?: {
      showJobMetrics: boolean
      showTechnicianPerformance: boolean
      showCustomerSatisfaction: boolean
      showEquipmentStatus: boolean
    }
    restaurant?: {
      showOrderMetrics: boolean
      showKitchenPerformance: boolean
      showInventoryLevels: boolean
      showStaffProductivity: boolean
    }
    auto?: {
      showServiceMetrics: boolean
      showBayUtilization: boolean
      showPartsInventory: boolean
      showTechnicianEfficiency: boolean
    }
    retail?: {
      showSalesMetrics: boolean
      showInventoryTurnover: boolean
      showCustomerAnalytics: boolean
      showStaffPerformance: boolean
    }
    education?: {
      showEnrollmentMetrics: boolean
      showCoursePerformance: boolean
      showInstructorMetrics: boolean
      showStudentEngagement: boolean
    }
  }
  
  // Collaboration
  isShared: boolean
  shareSettings: ShareSettings
  
  // Performance optimization
  cacheSettings: CacheSettings
  
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}

export interface AlertRule {
  id: string
  businessId: string
  
  // Rule configuration
  ruleName: string
  description: string
  ruleType: AlertRuleType
  
  // Metric conditions
  metricName: string
  condition: AlertCondition
  threshold: number
  comparisonOperator: ComparisonOperator
  
  // Time-based conditions
  timeWindow: string
  evaluationInterval: string
  gracePeriod?: string
  
  // Severity and priority
  severity: AlertSeverity
  priority: AlertPriority
  
  // Notification settings
  notificationChannels: NotificationChannel[]
  escalationPolicy: EscalationPolicy
  
  // Suppression rules
  suppressionRules: SuppressionRule[]
  maintenanceWindows: MaintenanceWindow[]
  
  // Industry-specific alerting
  industryRules?: {
    homeServices?: {
      jobCompletionTimeThreshold?: number
      customerSatisfactionThreshold?: number
      equipmentDowntimeThreshold?: number
      responseTimeThreshold?: number
    }
    restaurant?: {
      orderProcessingTimeThreshold?: number
      kitchenWaitTimeThreshold?: number
      inventoryLevelThreshold?: number
      wastagePercentageThreshold?: number
    }
    auto?: {
      serviceTimeThreshold?: number
      bayUtilizationThreshold?: number
      partsAvailabilityThreshold?: number
      qualityScoreThreshold?: number
    }
    retail?: {
      salesDeclineThreshold?: number
      inventoryStockoutThreshold?: number
      customerWaitTimeThreshold?: number
      returnRateThreshold?: number
    }
    education?: {
      enrollmentDeclineThreshold?: number
      completionRateThreshold?: number
      engagementScoreThreshold?: number
      attendanceRateThreshold?: number
    }
  }
  
  // Rule state
  isActive: boolean
  lastTriggered?: Date
  triggerCount: number
  
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}

export interface BusinessIntelligence {
  id: string
  businessId: string
  
  // BI Report details
  reportName: string
  reportType: BIReportType
  category: BICategory
  
  // Data configuration
  dataSource: BIDataSource
  queries: BIQuery[]
  transformations: DataTransformation[]
  
  // Analysis configuration
  analysisType: AnalysisType
  timeGranularity: TimeGranularity
  aggregations: Aggregation[]
  
  // Visualization
  visualizations: BIVisualization[]
  chartTypes: ChartType[]
  
  // Insights and recommendations
  insights: BusinessInsight[]
  recommendations: ActionableRecommendation[]
  
  // Industry-specific analytics
  industryAnalytics?: {
    homeServices?: {
      jobProfitabilityAnalysis: boolean
      technicianPerformanceAnalysis: boolean
      customerLifetimeValueAnalysis: boolean
      seasonalTrendAnalysis: boolean
    }
    restaurant?: {
      menuPerformanceAnalysis: boolean
      laborCostAnalysis: boolean
      customerBehaviorAnalysis: boolean
      inventoryOptimizationAnalysis: boolean
    }
    auto?: {
      serviceEfficiencyAnalysis: boolean
      partsMarginAnalysis: boolean
      customerRetentionAnalysis: boolean
      equipmentUtilizationAnalysis: boolean
    }
    retail?: {
      salesTrendAnalysis: boolean
      customerSegmentationAnalysis: boolean
      inventoryPerformanceAnalysis: boolean
      marketBasketAnalysis: boolean
    }
    education?: {
      enrollmentTrendAnalysis: boolean
      courseEffectivenessAnalysis: boolean
      studentSuccessAnalysis: boolean
      resourceUtilizationAnalysis: boolean
    }
  }
  
  // Scheduling and automation
  isScheduled: boolean
  schedule?: ReportSchedule
  autoRefresh: boolean
  refreshInterval?: number
  
  // Export and sharing
  exportFormats: ExportFormat[]
  shareSettings: ShareSettings
  
  // Performance tracking
  executionMetrics: ExecutionMetrics
  
  generatedBy: string
  generatedAt: Date
  lastUpdated: Date
}

export interface SystemHealth {
  id: string
  businessId: string
  
  // Health status
  overallStatus: HealthStatus
  statusMessage: string
  lastChecked: Date
  
  // Component health
  componentStatus: ComponentHealth[]
  
  // Performance indicators
  responseTime: number
  throughput: number
  errorRate: number
  availability: number
  
  // Resource utilization
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkUsage: number
  
  // Database performance
  databaseMetrics: DatabaseMetrics
  
  // Application metrics
  applicationMetrics: ApplicationMetrics
  
  // Industry-specific health checks
  industryHealth?: {
    homeServices?: {
      schedulingSystemHealth: HealthStatus
      dispatchSystemHealth: HealthStatus
      mobileAppHealth: HealthStatus
      paymentProcessingHealth: HealthStatus
    }
    restaurant?: {
      posSystemHealth: HealthStatus
      kitchenDisplayHealth: HealthStatus
      inventorySystemHealth: HealthStatus
      onlineOrderingHealth: HealthStatus
    }
    auto?: {
      diagnosticSystemHealth: HealthStatus
      partsInventoryHealth: HealthStatus
      billingSystemHealth: HealthStatus
      customerPortalHealth: HealthStatus
    }
    retail?: {
      posSystemHealth: HealthStatus
      inventorySystemHealth: HealthStatus
      ecommerceHealth: HealthStatus
      loyaltySystemHealth: HealthStatus
    }
    education?: {
      lmsHealth: HealthStatus
      gradingSystemHealth: HealthStatus
      communicationSystemHealth: HealthStatus
      paymentSystemHealth: HealthStatus
    }
  }
  
  // Historical tracking
  healthHistory: HealthHistoryEntry[]
  
  // Incidents and downtime
  activeIncidents: Incident[]
  downtimeEvents: DowntimeEvent[]
  
  checkedBy: string
  checkedAt: Date
}

// Enums
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
  RATE = 'rate',
  PERCENTAGE = 'percentage'
}

export enum MetricCategory {
  SYSTEM_PERFORMANCE = 'system_performance',
  BUSINESS_KPI = 'business_kpi',
  USER_EXPERIENCE = 'user_experience',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  SECURITY = 'security',
  COMPLIANCE = 'compliance'
}

export enum TimeWindow {
  REAL_TIME = 'real_time',
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'avg',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  PERCENTILE = 'percentile',
  MEDIAN = 'median',
  RATE = 'rate'
}

export enum MetricSource {
  APPLICATION = 'application',
  DATABASE = 'database',
  SYSTEM = 'system',
  NETWORK = 'network',
  USER_INTERACTION = 'user_interaction',
  BUSINESS_PROCESS = 'business_process',
  EXTERNAL_API = 'external_api'
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum DashboardType {
  EXECUTIVE = 'executive',
  OPERATIONAL = 'operational',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  CUSTOM = 'custom'
}

export enum AlertRuleType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  COMPOSITE = 'composite',
  RATE_OF_CHANGE = 'rate_of_change'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertPriority {
  P1 = 'P1', // Critical - immediate response
  P2 = 'P2', // High - response within 1 hour
  P3 = 'P3', // Medium - response within 4 hours
  P4 = 'P4', // Low - response within 24 hours
}

export enum ComparisonOperator {
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  EQUALS = 'eq',
  NOT_EQUALS = 'ne'
}

export enum BIReportType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  OPERATIONAL_REPORT = 'operational_report',
  FINANCIAL_ANALYSIS = 'financial_analysis',
  PERFORMANCE_ANALYSIS = 'performance_analysis',
  TREND_ANALYSIS = 'trend_analysis',
  PREDICTIVE_ANALYSIS = 'predictive_analysis'
}

export enum AnalysisType {
  DESCRIPTIVE = 'descriptive',
  DIAGNOSTIC = 'diagnostic',
  PREDICTIVE = 'predictive',
  PRESCRIPTIVE = 'prescriptive'
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

// Supporting interfaces
export interface MetricThreshold {
  warningThreshold: number
  criticalThreshold: number
  operator: ComparisonOperator
}

export interface MetricDimension {
  name: string
  value: string
  category?: string
}

export interface TimeRange {
  start: Date
  end: Date
  preset?: string
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  position: WidgetPosition
  size: WidgetSize
  configuration: WidgetConfiguration
  dataSource: WidgetDataSource
}

export interface DashboardFilter {
  name: string
  type: FilterType
  values: string[]
  defaultValue?: string
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'mobile_push'
  configuration: Record<string, unknown>
  isActive: boolean
}

export interface EscalationPolicy {
  levels: EscalationLevel[]
  maxEscalations: number
  escalationInterval: string
}

export interface BusinessInsight {
  id: string
  insightType: 'trend' | 'anomaly' | 'opportunity' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  supportingData: Record<string, unknown>
}

export interface ActionableRecommendation {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: string
  implementationEffort: 'low' | 'medium' | 'high'
  timeline: string
  actions: RecommendedAction[]
}

export interface ComponentHealth {
  componentName: string
  status: HealthStatus
  responseTime?: number
  errorRate?: number
  lastChecked: Date
  details?: Record<string, unknown>
}

export interface DatabaseMetrics {
  connectionPoolUsage: number
  queryPerformance: QueryPerformance[]
  lockWaitTime: number
  indexUsage: IndexUsage[]
  storage: StorageMetrics
}

export interface ApplicationMetrics {
  activeUsers: number
  requestsPerSecond: number
  averageResponseTime: number
  errorCount: number
  memoryLeaks: boolean
  threadPoolUsage: number
}

/**
 * Performance Monitoring Service
 */
class PerformanceMonitoringService {
  constructor() {
    // Service initialization
  }

  // === METRICS COLLECTION ===

  async collectMetric(businessId: string, metricData: Partial<SystemMetrics>): Promise<SystemMetrics> {
    const metric: SystemMetrics = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...metricData,
      timestamp: metricData.timestamp || new Date(),
      timeWindow: metricData.timeWindow || TimeWindow.REAL_TIME,
      aggregationType: metricData.aggregationType || AggregationType.AVERAGE,
      tags: metricData.tags || {},
      dimensions: metricData.dimensions || [],
      source: metricData.source || MetricSource.APPLICATION,
      correlatedMetrics: metricData.correlatedMetrics || [],
      derivedFrom: metricData.derivedFrom || [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as SystemMetrics

    return metric
  }

  async getMetrics(businessId: string, filters: unknown): Promise<{
    metrics: SystemMetrics[]
    pagination: any
    totalCount: number
    summary: any
  }> {
    return {
      metrics: [],
      pagination: { page: 1, limit: filters.limit || 50 },
      totalCount: 0,
      summary: {
        totalMetrics: 0,
        activeAlerts: 0,
        averageValue: 0,
        anomaliesDetected: 0
      }
    }
  }

  // === DASHBOARD MANAGEMENT ===

  async createDashboard(businessId: string, dashboardData: Partial<PerformanceDashboard>): Promise<PerformanceDashboard> {
    const dashboard: PerformanceDashboard = {
      id: 'dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...dashboardData,
      layout: dashboardData.layout || { rows: 3, columns: 4 },
      widgets: dashboardData.widgets || [],
      refreshInterval: dashboardData.refreshInterval || 300, // 5 minutes
      isPublic: dashboardData.isPublic ?? false,
      allowedUsers: dashboardData.allowedUsers || [],
      allowedRoles: dashboardData.allowedRoles || [],
      defaultTimeRange: dashboardData.defaultTimeRange || {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      },
      timezone: dashboardData.timezone || 'UTC',
      globalFilters: dashboardData.globalFilters || [],
      parameters: dashboardData.parameters || [],
      isShared: dashboardData.isShared ?? false,
      shareSettings: dashboardData.shareSettings || {
        allowPublicAccess: false,
        allowEmbedding: false,
        expiresAt: undefined
      },
      cacheSettings: dashboardData.cacheSettings || {
        enableCache: true,
        cacheDuration: 300,
        refreshOnUpdate: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as PerformanceDashboard

    return dashboard
  }

  // === ALERT MANAGEMENT ===

  async createAlertRule(businessId: string, ruleData: Partial<AlertRule>): Promise<AlertRule> {
    const rule: AlertRule = {
      id: 'alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...ruleData,
      ruleType: ruleData.ruleType || AlertRuleType.THRESHOLD,
      comparisonOperator: ruleData.comparisonOperator || ComparisonOperator.GREATER_THAN,
      severity: ruleData.severity || AlertSeverity.MEDIUM,
      priority: ruleData.priority || AlertPriority.P3,
      notificationChannels: ruleData.notificationChannels || [],
      escalationPolicy: ruleData.escalationPolicy || {
        levels: [],
        maxEscalations: 3,
        escalationInterval: '30m'
      },
      suppressionRules: ruleData.suppressionRules || [],
      maintenanceWindows: ruleData.maintenanceWindows || [],
      isActive: ruleData.isActive ?? true,
      triggerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as AlertRule

    return rule
  }

  // === BUSINESS INTELLIGENCE ===

  async generateBIReport(businessId: string, reportConfig: Partial<BusinessIntelligence>): Promise<BusinessIntelligence> {
    const report: BusinessIntelligence = {
      id: 'bi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...reportConfig,
      reportType: reportConfig.reportType || BIReportType.OPERATIONAL_REPORT,
      category: reportConfig.category || BICategory.PERFORMANCE,
      dataSource: reportConfig.dataSource || {
        type: 'database',
        connections: [],
        tables: []
      },
      queries: reportConfig.queries || [],
      transformations: reportConfig.transformations || [],
      analysisType: reportConfig.analysisType || AnalysisType.DESCRIPTIVE,
      timeGranularity: reportConfig.timeGranularity || TimeGranularity.DAILY,
      aggregations: reportConfig.aggregations || [],
      visualizations: reportConfig.visualizations || [],
      chartTypes: reportConfig.chartTypes || [],
      insights: reportConfig.insights || [],
      recommendations: reportConfig.recommendations || [],
      isScheduled: reportConfig.isScheduled ?? false,
      autoRefresh: reportConfig.autoRefresh ?? false,
      exportFormats: reportConfig.exportFormats || ['pdf', 'excel'],
      shareSettings: reportConfig.shareSettings || {
        allowPublicAccess: false,
        allowEmbedding: false
      },
      executionMetrics: {
        executionTime: 0,
        dataRowsProcessed: 0,
        cacheHitRate: 0,
        resourceUsage: Record<string, unknown>
      },
      generatedAt: new Date(),
      lastUpdated: new Date()
    } as BusinessIntelligence

    return report
  }

  // === SYSTEM HEALTH ===

  async checkSystemHealth(businessId: string): Promise<SystemHealth> {
    const health: SystemHealth = {
      id: 'health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      overallStatus: HealthStatus.HEALTHY,
      statusMessage: 'All systems operational',
      lastChecked: new Date(),
      componentStatus: [],
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      availability: 99.99,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkUsage: 0,
      databaseMetrics: {
        connectionPoolUsage: 0,
        queryPerformance: [],
        lockWaitTime: 0,
        indexUsage: [],
        storage: {
          totalSize: 0,
          usedSize: 0,
          freeSize: 0
        }
      },
      applicationMetrics: {
        activeUsers: 0,
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorCount: 0,
        memoryLeaks: false,
        threadPoolUsage: 0
      },
      healthHistory: [],
      activeIncidents: [],
      downtimeEvents: [],
      checkedBy: 'system',
      checkedAt: new Date()
    }

    return health
  }

  // === HELPER METHODS ===

  private calculateAnomalyScore(currentValue: number, historicalData: number[]): number {
    // Simple anomaly detection algorithm
    const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length
    const stdDev = Math.sqrt(historicalData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalData.length)
    return Math.abs(currentValue - mean) / stdDev
  }

  private determineHealthStatus(metrics: unknown[]): HealthStatus {
    const criticalCount = metrics.filter(m => m.alertLevel === AlertLevel.CRITICAL).length
    const warningCount = metrics.filter(m => m.alertLevel === AlertLevel.WARNING).length
    
    if (criticalCount > 0) return HealthStatus.CRITICAL
    if (warningCount > 5) return HealthStatus.UNHEALTHY
    if (warningCount > 0) return HealthStatus.WARNING
    return HealthStatus.HEALTHY
  }
}

// Additional supporting interfaces
export interface WidgetType {
  CHART: 'chart'
  TABLE: 'table'
  KPI: 'kpi'
  GAUGE: 'gauge'
  MAP: 'map'
  TEXT: 'text'
}

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetConfiguration {
  chartType?: string
  dataSource: string
  metrics: string[]
  filters?: Record<string, unknown>
  refreshInterval?: number
}

export interface WidgetDataSource {
  type: string
  query: string
  parameters?: Record<string, unknown>
}

export interface FilterType {
  DROPDOWN: 'dropdown'
  DATE_RANGE: 'date_range'
  TEXT: 'text'
  MULTI_SELECT: 'multi_select'
}

export interface EscalationLevel {
  level: number
  notificationChannels: NotificationChannel[]
  delayMinutes: number
}

export interface SuppressionRule {
  name: string
  condition: string
  duration: string
  isActive: boolean
}

export interface MaintenanceWindow {
  name: string
  startTime: Date
  endTime: Date
  recurring: boolean
  recurrencePattern?: string
}

export interface RecommendedAction {
  action: string
  description: string
  priority: number
  estimatedTime: string
}

export interface BICategory {
  PERFORMANCE: 'performance'
  FINANCIAL: 'financial'
  OPERATIONAL: 'operational'
  STRATEGIC: 'strategic'
}

export interface BIDataSource {
  type: string
  connections: string[]
  tables: string[]
  apiEndpoints?: string[]
}

export interface BIQuery {
  name: string
  query: string
  parameters?: Record<string, unknown>
  cacheKey?: string
}

export interface DataTransformation {
  type: string
  configuration: Record<string, unknown>
  order: number
}

export interface TimeGranularity {
  MINUTE: 'minute'
  HOUR: 'hour'
  DAILY: 'daily'
  WEEKLY: 'weekly'
  MONTHLY: 'monthly'
}

export interface Aggregation {
  field: string
  type: AggregationType
  groupBy?: string[]
}

export interface BIVisualization {
  type: string
  title: string
  data: unknown[]
  configuration: Record<string, unknown>
}

export interface ChartType {
  LINE: 'line'
  BAR: 'bar'
  PIE: 'pie'
  AREA: 'area'
  SCATTER: 'scatter'
  HEATMAP: 'heatmap'
}

export interface ReportSchedule {
  frequency: string
  interval: number
  nextRun: Date
  recipients: string[]
}

export interface ExportFormat {
  PDF: 'pdf'
  EXCEL: 'excel'
  CSV: 'csv'
  JSON: 'json'
}

export interface ShareSettings {
  allowPublicAccess: boolean
  allowEmbedding: boolean
  expiresAt?: Date
  accessToken?: string
}

export interface ExecutionMetrics {
  executionTime: number
  dataRowsProcessed: number
  cacheHitRate: number
  resourceUsage: Record<string, number>
}

export interface HealthHistoryEntry {
  timestamp: Date
  status: HealthStatus
  metrics: Record<string, number>
}

export interface Incident {
  id: string
  title: string
  severity: AlertSeverity
  status: string
  createdAt: Date
  affectedComponents: string[]
}

export interface DowntimeEvent {
  id: string
  component: string
  startTime: Date
  endTime?: Date
  duration?: number
  cause: string
}

export interface QueryPerformance {
  query: string
  averageExecutionTime: number
  executionCount: number
  lastExecuted: Date
}

export interface IndexUsage {
  indexName: string
  tableName: string
  usageCount: number
  efficiency: number
}

export interface StorageMetrics {
  totalSize: number
  usedSize: number
  freeSize: number
  growthRate?: number
}

export interface DashboardLayout {
  rows: number
  columns: number
  gridSize?: number
}

export interface CacheSettings {
  enableCache: boolean
  cacheDuration: number
  refreshOnUpdate: boolean
}

export interface AlertCondition {
  field: string
  operator: ComparisonOperator
  value: number
  aggregation?: AggregationType
}

export const performanceMonitoringService = new PerformanceMonitoringService()