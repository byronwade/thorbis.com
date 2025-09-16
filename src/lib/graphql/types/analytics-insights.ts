/**
 * GraphQL Types for Analytics & Insights Services
 * Comprehensive business intelligence, performance analytics, real-time dashboards,
 * data visualization, KPI tracking, predictive analytics, and cross-industry metrics
 */

export const analyticsInsightsTypeDefs = `
  # Analytics Dashboard Core Types
  type AnalyticsDashboard implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Dashboard Identity
    name: String!
    title: String!
    description: String!
    
    # Dashboard Configuration
    dashboardType: DashboardType!
    category: String!
    industry: Industry
    visibility: DashboardVisibility!
    
    # Layout and Design
    layout: DashboardLayout!
    theme: String!
    refreshInterval: Int! # seconds
    autoRefresh: Boolean!
    
    # Widgets and Components
    widgets: [DashboardWidget!]!
    filters: [DashboardFilter!]!
    parameters: [DashboardParameter!]!
    
    # Access Control
    owner: AnalyticsUser!
    ownerId: ID!
    sharedWith: [AnalyticsUser!]!
    permissions: [DashboardPermission!]!
    
    # Usage and Performance
    viewCount: Int!
    lastViewed: DateTime
    averageLoadTime: Float!
    
    # Data Sources
    dataSources: [DataSource!]!
    
    # Status and Lifecycle
    status: DashboardStatus!
    publishedAt: DateTime
    archivedAt: DateTime
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DashboardConnection {
    edges: [DashboardEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DashboardEdge {
    cursor: String!
    node: AnalyticsDashboard!
  }

  enum DashboardType {
    EXECUTIVE_SUMMARY
    OPERATIONAL_METRICS
    FINANCIAL_PERFORMANCE
    CUSTOMER_ANALYTICS
    SALES_PERFORMANCE
    MARKETING_ANALYTICS
    SECURITY_MONITORING
    COMPLIANCE_REPORTING
    REAL_TIME_MONITORING
    PREDICTIVE_ANALYTICS
    INDUSTRY_SPECIFIC
    CUSTOM
  }

  enum DashboardVisibility {
    PRIVATE
    SHARED
    ORGANIZATION
    PUBLIC
  }

  enum DashboardStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
    MAINTENANCE
  }

  # Dashboard Widgets
  type DashboardWidget implements Node {
    id: ID!
    dashboardId: ID!
    
    # Widget Identity
    title: String!
    description: String
    widgetType: WidgetType!
    
    # Layout Properties
    position: WidgetPosition!
    size: WidgetSize!
    
    # Data Configuration
    dataSource: DataSource!
    query: String!
    aggregation: AggregationType
    groupBy: [String!]!
    filters: [WidgetFilter!]!
    
    # Visualization Properties
    visualization: VisualizationType!
    chartConfig: ChartConfiguration
    colorScheme: String
    
    # Interactivity
    drillDown: Boolean!
    exportable: Boolean!
    refreshInterval: Int
    
    # Real-time Features
    realTime: Boolean!
    alertThreshold: Float
    alertCondition: AlertCondition
    
    # Data and Cache
    lastUpdated: DateTime
    cacheExpiry: DateTime
    dataPoints: Int!
    
    # Status
    status: WidgetStatus!
    errorMessage: String
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum WidgetType {
    METRIC_CARD
    CHART
    TABLE
    MAP
    GAUGE
    PROGRESS_BAR
    HEATMAP
    TIMELINE
    FUNNEL
    TREEMAP
    SCORECARD
    ALERT_LIST
    TEXT_WIDGET
    IFRAME
  }

  enum VisualizationType {
    LINE_CHART
    BAR_CHART
    PIE_CHART
    DONUT_CHART
    AREA_CHART
    SCATTER_PLOT
    BUBBLE_CHART
    HISTOGRAM
    BOX_PLOT
    CANDLESTICK
    WATERFALL
    SANKEY_DIAGRAM
    GEOGRAPHIC_MAP
    HEATMAP
    TREEMAP
    SUNBURST
    RADAR_CHART
    GAUGE_CHART
    BULLET_CHART
    SPARKLINE
    TABLE
    PIVOT_TABLE
  }

  enum AggregationType {
    COUNT
    SUM
    AVERAGE
    MIN
    MAX
    MEDIAN
    PERCENTILE_25
    PERCENTILE_75
    PERCENTILE_95
    PERCENTILE_99
    STANDARD_DEVIATION
    VARIANCE
    DISTINCT_COUNT
    FIRST
    LAST
  }

  enum WidgetStatus {
    ACTIVE
    LOADING
    ERROR
    NO_DATA
    MAINTENANCE
  }

  # Key Performance Indicators (KPIs)
  type KPI implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # KPI Identity
    name: String!
    title: String!
    description: String!
    
    # KPI Configuration
    category: KPICategory!
    industry: Industry
    kpiType: KPIType!
    unit: String!
    format: String!
    
    # Calculation
    formula: String!
    dataSource: DataSource!
    aggregation: AggregationType!
    timeframe: TimeframeType!
    
    # Current Values
    currentValue: Float
    previousValue: Float
    changeValue: Float
    changePercentage: Float
    trend: TrendDirection!
    
    # Targets and Thresholds
    target: Float
    minThreshold: Float
    maxThreshold: Float
    warningThreshold: Float
    criticalThreshold: Float
    
    # Status and Health
    status: KPIStatus!
    healthScore: Float!
    lastCalculated: DateTime
    
    # Comparison Periods
    periodComparison: [KPIPeriodComparison!]!
    benchmarks: [KPIBenchmark!]!
    
    # Alerts and Notifications
    alertsEnabled: Boolean!
    notifications: [KPINotification!]!
    
    # Historical Data
    historicalData: [KPIDataPoint!]!
    
    # Ownership and Access
    owner: AnalyticsUser!
    ownerId: ID!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type KPIConnection {
    edges: [KPIEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type KPIEdge {
    cursor: String!
    node: KPI!
  }

  enum KPICategory {
    FINANCIAL
    OPERATIONAL
    CUSTOMER
    MARKETING
    SALES
    HUMAN_RESOURCES
    QUALITY
    EFFICIENCY
    GROWTH
    RISK
    COMPLIANCE
    SECURITY
    SUSTAINABILITY
  }

  enum KPIType {
    REVENUE
    COST
    PROFIT
    MARGIN
    CONVERSION_RATE
    ACQUISITION_COST
    LIFETIME_VALUE
    CHURN_RATE
    SATISFACTION_SCORE
    PRODUCTIVITY
    EFFICIENCY
    UTILIZATION
    QUALITY_SCORE
    COMPLIANCE_SCORE
    RISK_SCORE
    GROWTH_RATE
    MARKET_SHARE
  }

  enum KPIStatus {
    EXCELLENT
    GOOD
    WARNING
    CRITICAL
    NO_DATA
    ERROR
  }

  enum TrendDirection {
    UP
    DOWN
    FLAT
    VOLATILE
    UNKNOWN
  }

  enum TimeframeType {
    REAL_TIME
    HOURLY
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    YEARLY
    CUSTOM
  }

  # Business Intelligence Reports
  type BusinessReport implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Report Identity
    name: String!
    title: String!
    description: String!
    
    # Report Configuration
    reportType: BusinessReportType!
    category: String!
    industry: Industry
    
    # Content and Structure
    template: ReportTemplate!
    sections: [ReportSection!]!
    parameters: [ReportParameter!]!
    
    # Data and Analysis
    dataSources: [DataSource!]!
    analysisType: AnalysisType!
    timeRange: DateRange!
    
    # Generation and Delivery
    schedule: ReportSchedule
    format: ReportFormat!
    distributionList: [String!]!
    
    # Status and Lifecycle
    status: ReportStatus!
    generatedAt: DateTime
    lastRun: DateTime
    nextRun: DateTime
    
    # Content and Results
    executiveSummary: String
    keyFindings: [String!]!
    recommendations: [String!]!
    insights: [BusinessInsight!]!
    
    # Files and Exports
    fileUrl: String
    fileSize: Int
    exportFormats: [String!]!
    
    # Performance
    generationTime: Int # milliseconds
    dataPoints: Int!
    
    # Access Control
    owner: AnalyticsUser!
    ownerId: ID!
    visibility: ReportVisibility!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum BusinessReportType {
    FINANCIAL_SUMMARY
    OPERATIONAL_REVIEW
    CUSTOMER_ANALYSIS
    SALES_PERFORMANCE
    MARKETING_EFFECTIVENESS
    COMPLIANCE_AUDIT
    SECURITY_ASSESSMENT
    PREDICTIVE_FORECAST
    COMPETITIVE_ANALYSIS
    INDUSTRY_BENCHMARK
    CUSTOM_ANALYSIS
  }

  enum AnalysisType {
    DESCRIPTIVE
    DIAGNOSTIC
    PREDICTIVE
    PRESCRIPTIVE
    COMPARATIVE
    TREND_ANALYSIS
    COHORT_ANALYSIS
    SEGMENTATION
    CORRELATION
    REGRESSION
    FORECASTING
    ANOMALY_DETECTION
  }

  enum ReportFormat {
    PDF
    EXCEL
    CSV
    POWERPOINT
    HTML
    JSON
    DASHBOARD
  }

  enum ReportStatus {
    SCHEDULED
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
    ARCHIVED
  }

  enum ReportVisibility {
    PRIVATE
    TEAM
    DEPARTMENT
    ORGANIZATION
    EXTERNAL
  }

  # Data Sources and Connections
  type DataSource implements Node & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Data Source Identity
    name: String!
    description: String!
    sourceType: DataSourceType!
    
    # Connection Configuration
    connectionString: String # Encrypted
    host: String
    port: Int
    database: String
    username: String
    
    # Data Structure
    schema: String
    tables: [DataTable!]!
    views: [DataView!]!
    
    # Performance and Health
    status: DataSourceStatus!
    lastConnection: DateTime
    averageQueryTime: Float!
    
    # Security
    encryptionEnabled: Boolean!
    sslEnabled: Boolean!
    accessLevel: DataAccessLevel!
    
    # Monitoring
    queryCount: Int!
    errorCount: Int!
    uptimePercentage: Float!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum DataSourceType {
    POSTGRESQL
    MYSQL
    MONGODB
    REDIS
    ELASTICSEARCH
    SUPABASE
    REST_API
    GRAPHQL_API
    WEBSOCKET
    FILE_UPLOAD
    CLOUD_STORAGE
    THIRD_PARTY_INTEGRATION
  }

  enum DataSourceStatus {
    CONNECTED
    DISCONNECTED
    ERROR
    MAINTENANCE
    TESTING
  }

  enum DataAccessLevel {
    READ_ONLY
    READ_WRITE
    ADMIN
    RESTRICTED
  }

  # Real-time Analytics
  type RealTimeMetric implements Node & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Metric Identity
    name: String!
    description: String!
    metricType: RealTimeMetricType!
    
    # Current State
    currentValue: Float!
    previousValue: Float
    changeRate: Float
    
    # Streaming Configuration
    updateInterval: Int! # seconds
    bufferSize: Int!
    aggregationWindow: Int! # seconds
    
    # Thresholds and Alerts
    alertThresholds: [AlertThreshold!]!
    currentStatus: MetricStatus!
    
    # Data Points
    dataPoints: [RealTimeDataPoint!]!
    
    # Statistics
    min: Float
    max: Float
    average: Float
    standardDeviation: Float
    
    # Metadata
    tags: [String!]!
    lastUpdated: DateTime!
    
    createdAt: DateTime!
  }

  enum RealTimeMetricType {
    COUNTER
    GAUGE
    HISTOGRAM
    RATE
    PERCENTAGE
    DURATION
    THROUGHPUT
    LATENCY
    ERROR_RATE
    AVAILABILITY
  }

  enum MetricStatus {
    NORMAL
    WARNING
    CRITICAL
    NO_DATA
    ERROR
  }

  # Predictive Analytics
  type PredictiveModel implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Model Identity
    name: String!
    description: String!
    modelType: PredictiveModelType!
    
    # Model Configuration
    algorithm: MLAlgorithm!
    features: [String!]!
    targetVariable: String!
    
    # Training Data
    trainingDataSource: DataSource!
    trainingPeriod: DateRange!
    trainingRecords: Int!
    
    # Model Performance
    accuracy: Float!
    precision: Float!
    recall: Float!
    f1Score: Float!
    rmse: Float
    r2Score: Float
    
    # Status and Lifecycle
    status: ModelStatus!
    trainedAt: DateTime
    lastPrediction: DateTime
    
    # Predictions
    predictions: [ModelPrediction!]!
    forecasts: [ModelForecast!]!
    
    # Validation
    validationResults: ModelValidation
    crossValidationScore: Float
    
    # Deployment
    deploymentStatus: ModelDeploymentStatus!
    apiEndpoint: String
    
    # Monitoring
    driftScore: Float
    performanceDegradation: Float
    
    # Metadata
    version: String!
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PredictiveModelType {
    CLASSIFICATION
    REGRESSION
    TIME_SERIES_FORECASTING
    CLUSTERING
    ANOMALY_DETECTION
    RECOMMENDATION
    SENTIMENT_ANALYSIS
    DEMAND_FORECASTING
    CHURN_PREDICTION
    PRICE_OPTIMIZATION
  }

  enum MLAlgorithm {
    LINEAR_REGRESSION
    LOGISTIC_REGRESSION
    RANDOM_FOREST
    GRADIENT_BOOSTING
    NEURAL_NETWORK
    SVM
    NAIVE_BAYES
    K_MEANS
    ARIMA
    PROPHET
    LSTM
    TRANSFORMER
  }

  enum ModelStatus {
    TRAINING
    TRAINED
    VALIDATING
    DEPLOYED
    RETIRED
    ERROR
  }

  enum ModelDeploymentStatus {
    NOT_DEPLOYED
    STAGING
    PRODUCTION
    DEPRECATED
    MAINTENANCE
  }

  # Supporting Types
  type AnalyticsUser implements Node {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    role: AnalyticsRole!
    department: String
    permissions: [String!]!
    isActive: Boolean!
    lastLoginAt: DateTime
  }

  enum AnalyticsRole {
    ANALYST
    DATA_SCIENTIST
    BUSINESS_ANALYST
    DASHBOARD_VIEWER
    REPORT_AUTHOR
    ADMIN
    EXECUTIVE
  }

  type BusinessInsight {
    id: ID!
    title: String!
    description: String!
    insightType: InsightType!
    confidence: Float!
    impact: ImpactLevel!
    recommendation: String
    evidence: [String!]!
    createdAt: DateTime!
  }

  enum InsightType {
    TREND
    ANOMALY
    CORRELATION
    PREDICTION
    RECOMMENDATION
    ALERT
    OPPORTUNITY
    RISK
  }

  enum ImpactLevel {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type DateRange {
    startDate: DateTime!
    endDate: DateTime!
    period: String!
  }

  type ChartConfiguration {
    xAxis: String!
    yAxis: String!
    series: [String!]!
    colors: [String!]!
    legend: Boolean!
    grid: Boolean!
    animations: Boolean!
    responsive: Boolean!
  }

  type WidgetPosition {
    x: Int!
    y: Int!
    row: Int!
    column: Int!
  }

  type WidgetSize {
    width: Int!
    height: Int!
    minWidth: Int!
    minHeight: Int!
  }

  type DashboardLayout {
    columns: Int!
    rows: Int!
    gridSize: Int!
    responsive: Boolean!
  }

  # Input Types
  input AnalyticsDashboardInput {
    name: String!
    title: String!
    description: String!
    dashboardType: DashboardType!
    category: String!
    industry: Industry
    visibility: DashboardVisibility!
    layout: DashboardLayoutInput!
    theme: String
    refreshInterval: Int
    autoRefresh: Boolean
    tags: [String!]
    customFields: JSON
  }

  input DashboardLayoutInput {
    columns: Int!
    rows: Int!
    gridSize: Int!
    responsive: Boolean!
  }

  input DashboardWidgetInput {
    title: String!
    description: String
    widgetType: WidgetType!
    position: WidgetPositionInput!
    size: WidgetSizeInput!
    dataSourceId: ID!
    query: String!
    aggregation: AggregationType
    groupBy: [String!]
    visualization: VisualizationType!
    chartConfig: ChartConfigurationInput
    colorScheme: String
    drillDown: Boolean
    exportable: Boolean
    refreshInterval: Int
    realTime: Boolean
    alertThreshold: Float
    alertCondition: AlertCondition
  }

  input WidgetPositionInput {
    x: Int!
    y: Int!
    row: Int!
    column: Int!
  }

  input WidgetSizeInput {
    width: Int!
    height: Int!
    minWidth: Int!
    minHeight: Int!
  }

  input ChartConfigurationInput {
    xAxis: String!
    yAxis: String!
    series: [String!]!
    colors: [String!]!
    legend: Boolean
    grid: Boolean
    animations: Boolean
    responsive: Boolean
  }

  input KPIInput {
    name: String!
    title: String!
    description: String!
    category: KPICategory!
    industry: Industry
    kpiType: KPIType!
    unit: String!
    format: String!
    formula: String!
    dataSourceId: ID!
    aggregation: AggregationType!
    timeframe: TimeframeType!
    target: Float
    minThreshold: Float
    maxThreshold: Float
    warningThreshold: Float
    criticalThreshold: Float
    alertsEnabled: Boolean
    tags: [String!]
    customFields: JSON
  }

  input BusinessReportInput {
    name: String!
    title: String!
    description: String!
    reportType: BusinessReportType!
    category: String!
    industry: Industry
    analysisType: AnalysisType!
    timeRange: DateRangeInput!
    format: ReportFormat!
    distributionList: [String!]!
    visibility: ReportVisibility!
    tags: [String!]
    customFields: JSON
  }

  input DateRangeInput {
    startDate: DateTime!
    endDate: DateTime!
    period: String!
  }

  input DataSourceInput {
    name: String!
    description: String!
    sourceType: DataSourceType!
    connectionString: String
    host: String
    port: Int
    database: String
    username: String
    encryptionEnabled: Boolean
    sslEnabled: Boolean
    accessLevel: DataAccessLevel!
    tags: [String!]
    customFields: JSON
  }

  input PredictiveModelInput {
    name: String!
    description: String!
    modelType: PredictiveModelType!
    algorithm: MLAlgorithm!
    features: [String!]!
    targetVariable: String!
    trainingDataSourceId: ID!
    trainingPeriod: DateRangeInput!
    tags: [String!]
    customFields: JSON
  }

  # Query Extensions for Analytics & Insights
  extend type Query {
    # Dashboards
    analyticsDashboard(id: ID!): AnalyticsDashboard
    analyticsDashboards(
      dashboardType: DashboardType
      category: String
      industry: Industry
      visibility: DashboardVisibility
      status: DashboardStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): DashboardConnection!
    
    # KPIs
    kpi(id: ID!): KPI
    kpis(
      category: KPICategory
      kpiType: KPIType
      industry: Industry
      status: KPIStatus
      timeframe: TimeframeType
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): KPIConnection!
    
    # Business Reports
    businessReport(id: ID!): BusinessReport
    businessReports(
      reportType: BusinessReportType
      category: String
      industry: Industry
      status: ReportStatus
      visibility: ReportVisibility
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [BusinessReport!]!
    
    # Data Sources
    dataSource(id: ID!): DataSource
    dataSources(
      sourceType: DataSourceType
      status: DataSourceStatus
      accessLevel: DataAccessLevel
      pagination: PaginationInput
      filters: [FilterInput!]
    ): [DataSource!]!
    
    # Real-time Metrics
    realTimeMetric(id: ID!): RealTimeMetric
    realTimeMetrics(
      metricType: RealTimeMetricType
      status: MetricStatus
      pagination: PaginationInput
    ): [RealTimeMetric!]!
    
    # Predictive Models
    predictiveModel(id: ID!): PredictiveModel
    predictiveModels(
      modelType: PredictiveModelType
      algorithm: MLAlgorithm
      status: ModelStatus
      deploymentStatus: ModelDeploymentStatus
      pagination: PaginationInput
      filters: [FilterInput!]
    ): [PredictiveModel!]!
    
    # Analytics Insights
    businessInsights(
      insightType: InsightType
      impact: ImpactLevel
      timeRange: DateRangeInput
      pagination: PaginationInput
    ): [BusinessInsight!]!
    
    # Performance Analytics
    systemPerformance(
      timeRange: DateRangeInput
      granularity: TimeframeType
    ): SystemPerformanceMetrics!
    
    industryBenchmarks(
      industry: Industry!
      metrics: [String!]!
      timeRange: DateRangeInput
    ): [IndustryBenchmark!]!
  }

  # Mutation Extensions for Analytics & Insights
  extend type Mutation {
    # Dashboard Management
    createAnalyticsDashboard(input: AnalyticsDashboardInput!): AnalyticsDashboard!
    updateAnalyticsDashboard(id: ID!, input: AnalyticsDashboardInput!): AnalyticsDashboard!
    deleteAnalyticsDashboard(id: ID!): Boolean!
    cloneDashboard(id: ID!, name: String!): AnalyticsDashboard!
    
    # Widget Management
    addDashboardWidget(dashboardId: ID!, input: DashboardWidgetInput!): DashboardWidget!
    updateDashboardWidget(id: ID!, input: DashboardWidgetInput!): DashboardWidget!
    removeDashboardWidget(id: ID!): Boolean!
    
    # KPI Management
    createKPI(input: KPIInput!): KPI!
    updateKPI(id: ID!, input: KPIInput!): KPI!
    deleteKPI(id: ID!): Boolean!
    calculateKPI(id: ID!): KPI!
    
    # Report Management
    createBusinessReport(input: BusinessReportInput!): BusinessReport!
    updateBusinessReport(id: ID!, input: BusinessReportInput!): BusinessReport!
    generateReport(id: ID!): BusinessReport!
    scheduleReport(id: ID!, schedule: String!): BusinessReport!
    
    # Data Source Management
    createDataSource(input: DataSourceInput!): DataSource!
    updateDataSource(id: ID!, input: DataSourceInput!): DataSource!
    testDataSourceConnection(id: ID!): DataSourceConnectionResult!
    
    # Predictive Analytics
    createPredictiveModel(input: PredictiveModelInput!): PredictiveModel!
    trainPredictiveModel(id: ID!): PredictiveModel!
    deployPredictiveModel(id: ID!, environment: String!): PredictiveModel!
    generatePrediction(modelId: ID!, inputData: JSON!): ModelPrediction!
    
    # Real-time Analytics
    enableRealTimeMetric(metricId: ID!): RealTimeMetric!
    disableRealTimeMetric(metricId: ID!): RealTimeMetric!
    
    # Cache Management
    refreshDashboardCache(id: ID!): Boolean!
    clearAnalyticsCache(pattern: String): Boolean!
  }

  # Subscription Extensions for Analytics & Insights
  extend type Subscription {
    # Real-time Dashboard Updates
    dashboardUpdates(dashboardId: ID!): AnalyticsDashboard!
    widgetUpdates(widgetId: ID!): DashboardWidget!
    
    # Real-time Metrics
    realTimeMetricUpdates(metricId: ID!): RealTimeMetric!
    kpiUpdates(kpiId: ID!): KPI!
    
    # Alerts and Notifications
    analyticsAlerts(businessId: ID!): AnalyticsAlert!
    thresholdBreaches(businessId: ID!): ThresholdBreach!
    
    # System Performance
    systemPerformanceUpdates(businessId: ID!): SystemPerformanceMetrics!
    
    # Report Generation
    reportGenerationUpdates(reportId: ID!): BusinessReport!
  }

  # Additional Types
  type SystemPerformanceMetrics {
    cpu: Float!
    memory: Float!
    disk: Float!
    network: Float!
    responseTime: Float!
    throughput: Float!
    errorRate: Float!
    uptime: Float!
    timestamp: DateTime!
  }

  type IndustryBenchmark {
    industry: Industry!
    metric: String!
    value: Float!
    percentile: Float!
    comparison: String!
    source: String!
    updatedAt: DateTime!
  }

  type AnalyticsAlert {
    id: ID!
    type: String!
    severity: AlertSeverity!
    message: String!
    dashboardId: ID
    kpiId: ID
    metricId: ID
    timestamp: DateTime!
    acknowledged: Boolean!
  }

  type ThresholdBreach {
    id: ID!
    metricName: String!
    currentValue: Float!
    threshold: Float!
    severity: AlertSeverity!
    timestamp: DateTime!
    resolved: Boolean!
  }

  enum AlertSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type DataSourceConnectionResult {
    success: Boolean!
    message: String!
    latency: Float
    version: String
    details: JSON
  }

  type ModelPrediction {
    id: ID!
    modelId: ID!
    inputData: JSON!
    prediction: JSON!
    confidence: Float!
    timestamp: DateTime!
  }

  type ModelForecast {
    id: ID!
    modelId: ID!
    forecastData: [ForecastPoint!]!
    confidence: Float!
    generatedAt: DateTime!
  }

  type ForecastPoint {
    timestamp: DateTime!
    value: Float!
    lowerBound: Float!
    upperBound: Float!
    confidence: Float!
  }

  type ModelValidation {
    accuracy: Float!
    precision: Float!
    recall: Float!
    f1Score: Float!
    confusionMatrix: [[Int!]!]!
    validatedAt: DateTime!
  }

  # Additional Enums
  enum AlertCondition {
    GREATER_THAN
    LESS_THAN
    EQUALS
    NOT_EQUALS
    BETWEEN
    OUTSIDE_RANGE
    PERCENTAGE_CHANGE
    RATE_OF_CHANGE
  }

  # Complex Supporting Types
  type KPIDataPoint {
    timestamp: DateTime!
    value: Float!
    target: Float
    status: KPIStatus!
  }

  type KPIPeriodComparison {
    period: String!
    value: Float!
    change: Float!
    changePercentage: Float!
  }

  type KPIBenchmark {
    industry: Industry!
    percentile: Float!
    value: Float!
    source: String!
  }

  type KPINotification {
    id: ID!
    type: String!
    recipient: String!
    condition: AlertCondition!
    threshold: Float!
    enabled: Boolean!
  }

  type RealTimeDataPoint {
    timestamp: DateTime!
    value: Float!
    quality: DataQuality!
  }

  enum DataQuality {
    EXCELLENT
    GOOD
    FAIR
    POOR
    MISSING
  }

  type AlertThreshold {
    name: String!
    value: Float!
    condition: AlertCondition!
    severity: AlertSeverity!
    enabled: Boolean!
  }

  type ReportTemplate {
    id: ID!
    name: String!
    sections: [String!]!
    layout: String!
    styles: JSON
  }

  type ReportSection {
    id: ID!
    title: String!
    content: String!
    order: Int!
    type: String!
    configuration: JSON
  }

  type ReportParameter {
    name: String!
    type: String!
    required: Boolean!
    defaultValue: String
    options: [String!]
  }

  type ReportSchedule {
    frequency: String!
    interval: Int!
    time: String
    timezone: String!
    enabled: Boolean!
  }

  type DataTable {
    name: String!
    schema: String!
    columns: [DataColumn!]!
    rowCount: Int!
  }

  type DataView {
    name: String!
    definition: String!
    columns: [DataColumn!]!
  }

  type DataColumn {
    name: String!
    dataType: String!
    nullable: Boolean!
    primaryKey: Boolean!
    foreignKey: String
  }

  type DashboardFilter {
    name: String!
    field: String!
    operator: FilterOperator!
    value: String
    options: [String!]
  }

  type DashboardParameter {
    name: String!
    type: String!
    defaultValue: String
    required: Boolean!
  }

  type WidgetFilter {
    field: String!
    operator: FilterOperator!
    value: String!
  }

  type DashboardPermission {
    userId: ID!
    user: AnalyticsUser!
    permission: String!
    grantedAt: DateTime!
  }
`