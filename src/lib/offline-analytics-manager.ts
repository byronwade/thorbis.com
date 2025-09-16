// Offline analytics and reporting system with real-time data aggregation
// Provides comprehensive business intelligence across all verticals

interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'action' | 'transaction' | 'interaction' | 'performance' | 'error' | 'custom';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll';
  metadata: Record<string, unknown>;
  isOffline: boolean;
  isSynced: boolean;
  location?: {
    pathname: string;
    search: string;
    hash: string;
  };
  device?: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
    screen: {
      width: number;
      height: number;
    };
  };
  performance?: {
    loadTime: number;
    renderTime: number;
    interactionDelay: number;
  };
}

interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'unique_count';
  aggregation: 'daily' | 'weekly' | 'monthly' | 'real_time';
  formula?: string;
  filters?: Record<string, unknown>;
  dimensions?: string[];
  industry?: string[];
  isActive: boolean;
}

interface ComputedMetric {
  id: string;
  metricId: string;
  value: number;
  dimensions: Record<string, string>;
  timestamp: Date;
  period: {
    start: Date;
    end: Date;
    type: 'hour' | 'day' | 'week' | 'month';
  };
  organizationId: string;
  industry: string;
  metadata?: Record<string, unknown>;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'summary' | 'detailed' | 'export';
  industry: string[];
  metrics: string[];
  dimensions: string[];
  filters: Record<string, unknown>;
  schedule?: {
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    timezone?: string;
  };
  visualization: {
    type: 'table' | 'chart' | 'graph' | 'heatmap' | 'funnel';
    config: Record<string, unknown>;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GeneratedReport {
  id: string;
  reportId: string;
  data: ComputedMetric[];
  summary: Record<string, unknown>;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  organizationId: string;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  fileSize?: number;
  downloadUrl?: string;
}

interface AnalyticsStats {
  totalEvents: number;
  eventsToday: number;
  uniqueUsers: number;
  activeUsers: number;
  topEvents: Array<{ event: string; count: number }>;
  topPages: Array<{ page: string; views: number }>;
  performanceMetrics: {
    averageLoadTime: number;
    averageRenderTime: number;
    errorRate: number;
    bounceRate: number;
  };
  industryBreakdown: Record<string, number>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  offlineEvents: number;
  unsyncedEvents: number;
}

export class OfflineAnalyticsManager {
  private static instance: OfflineAnalyticsManager | null = null;
  
  private events: Map<string, AnalyticsEvent> = new Map();
  private metrics: Map<string, MetricDefinition> = new Map();
  private computedMetrics: Map<string, ComputedMetric> = new Map();
  private reports: Map<string, ReportDefinition> = new Map();
  private generatedReports: Map<string, GeneratedReport> = new Map();
  
  private eventListeners: Map<string, Function[]> = new Map();
  private computationTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId?: string;
  private organizationId: string;
  private currentIndustry: string;
  private initialized = false;

  private readonly STORAGE_KEYS = {
    events: 'offline_analytics_events',
    metrics: 'offline_analytics_metrics',
    computed: 'offline_analytics_computed',
    reports: 'offline_analytics_reports',
    generated: 'offline_analytics_generated',
    session: 'analytics_session_id'
  };

  private readonly DEFAULT_METRICS: MetricDefinition[] = [
    {
      id: 'page_views',
      name: 'Page Views',
      description: 'Total number of page views',
      type: 'count',
      aggregation: 'real_time',
      filters: { type: 'pageview' },
      dimensions: ['pathname', 'industry'],
      isActive: true
    },
    {
      id: 'unique_visitors',
      name: 'Unique Visitors',
      description: 'Number of unique users',
      type: 'unique_count',
      aggregation: 'daily',
      filters: { type: 'pageview' },
      dimensions: ['userId', 'industry'],
      isActive: true
    },
    {
      id: 'conversion_rate',
      name: 'Conversion Rate',
      description: 'Percentage of visitors who complete a goal',
      type: 'percentage',
      aggregation: 'daily',
      formula: 'transactions / unique_visitors * 100',
      dimensions: ['industry'],
      isActive: true
    },
    {
      id: 'revenue',
      name: 'Revenue',
      description: 'Total revenue from transactions',
      type: 'sum',
      aggregation: 'real_time',
      filters: { type: 'transaction' },
      dimensions: ['industry', 'payment_method'],
      isActive: true
    },
    {
      id: 'average_order_value',
      name: 'Average Order Value',
      description: 'Average value per transaction',
      type: 'average',
      aggregation: 'daily',
      filters: { type: 'transaction' },
      dimensions: ['industry'],
      isActive: true
    },
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      description: 'Average customer rating',
      type: 'average',
      aggregation: 'weekly',
      filters: { category: 'feedback' },
      dimensions: ['industry', 'service_type'],
      isActive: true
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      description: 'Percentage of events that resulted in errors',
      type: 'percentage',
      aggregation: 'real_time',
      filters: { type: 'error' },
      dimensions: ['pathname', 'error_type'],
      isActive: true
    },
    {
      id: 'performance_score',
      name: 'Performance Score',
      description: 'Average page load performance',
      type: 'average',
      aggregation: 'hourly',
      filters: { type: 'performance' },
      dimensions: ['pathname', 'device_type'],
      isActive: true
    }
  ];

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.organizationId = 'org_default';
    this.currentIndustry = 'hs';
    this.initialize();
  }

  static getInstance(): OfflineAnalyticsManager {
    if (!OfflineAnalyticsManager.instance) {
      OfflineAnalyticsManager.instance = new OfflineAnalyticsManager();
    }
    return OfflineAnalyticsManager.instance;
  }

  // Initialize the analytics manager
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromStorage();
      this.setupDefaultMetrics();
      this.setupAutoTracking();
      this.startComputationTimer();
      
      this.initialized = true;
      this.emit('analytics_initialized');
    } catch (error) {
      console.error('Failed to initialize analytics manager:', error);
      throw new Error('Analytics manager initialization failed');
    }
  }

  // Event tracking

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'isOffline' | 'isSynced'>): Promise<string> {
    await this.initialize();

    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      isOffline: !navigator.onLine,
      isSynced: false,
      organizationId: event.organizationId || this.organizationId,
      industry: event.industry || this.currentIndustry as any,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo(),
      ...event
    };

    this.events.set(analyticsEvent.id, analyticsEvent);
    await this.persistEvents();

    // Trigger real-time metric computation
    await this.computeRealTimeMetrics(analyticsEvent);

    this.emit('event_tracked', analyticsEvent);
    return analyticsEvent.id;
  }

  // Convenience tracking methods

  async trackPageView(pathname: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.trackEvent({
      type: 'pageview',
      category: 'navigation',
      action: 'page_view',
      label: pathname,
      metadata: {
        pathname,
        referrer: document.referrer,
        ...metadata
      },
      performance: this.getPerformanceMetrics(),
      organizationId: this.organizationId,
      industry: this.currentIndustry as any
    });
  }

  async trackTransaction(amount: number, transactionId: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.trackEvent({
      type: 'transaction',
      category: 'ecommerce',
      action: 'purchase',
      label: transactionId,
      value: amount,
      metadata: {
        transactionId,
        currency: 'USD',
        ...metadata
      },
      organizationId: this.organizationId,
      industry: this.currentIndustry as any
    });
  }

  async trackInteraction(element: string, action: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.trackEvent({
      type: 'interaction',
      category: 'ui',
      action,
      label: element,
      metadata: {
        element,
        ...metadata
      },
      organizationId: this.organizationId,
      industry: this.currentIndustry as any
    });
  }

  async trackError(error: Error, metadata?: Record<string, unknown>): Promise<string> {
    return this.trackEvent({
      type: 'error',
      category: 'system',
      action: 'error',
      label: error.name,
      metadata: {
        message: error.message,
        stack: error.stack,
        ...metadata
      },
      organizationId: this.organizationId,
      industry: this.currentIndustry as any
    });
  }

  async trackCustom(category: string, action: string, label?: string, value?: number, metadata?: Record<string, unknown>): Promise<string> {
    return this.trackEvent({
      type: 'custom',
      category,
      action,
      label,
      value,
      metadata,
      organizationId: this.organizationId,
      industry: this.currentIndustry as any
    });
  }

  // Metric management

  async defineMetric(metric: Omit<MetricDefinition, 'id'>): Promise<string> {
    await this.initialize();

    const metricDefinition: MetricDefinition = {
      id: this.generateId('metric'),
      ...metric
    };

    this.metrics.set(metricDefinition.id, metricDefinition);
    await this.persistMetrics();

    this.emit('metric_defined', metricDefinition);
    return metricDefinition.id;
  }

  async updateMetric(metricId: string, updates: Partial<MetricDefinition>): Promise<void> {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error('Metric not found');
    }

    const updatedMetric = { ...metric, ...updates };
    this.metrics.set(metricId, updatedMetric);
    await this.persistMetrics();

    this.emit('metric_updated', updatedMetric);
  }

  getMetric(metricId: string): MetricDefinition | undefined {
    return this.metrics.get(metricId);
  }

  getMetrics(filters?: { industry?: string; type?: string; active?: boolean }): MetricDefinition[] {
    let metrics = Array.from(this.metrics.values());

    if (filters) {
      if (filters.industry) {
        metrics = metrics.filter(m => !m.industry || m.industry.includes(filters.industry!));
      }
      if (filters.type) {
        metrics = metrics.filter(m => m.type === filters.type);
      }
      if (filters.active !== undefined) {
        metrics = metrics.filter(m => m.isActive === filters.active);
      }
    }

    return metrics.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Metric computation

  private async computeRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const realTimeMetrics = this.getMetrics({ active: true }).filter(m => m.aggregation === 'real_time');

    for (const metric of realTimeMetrics) {
      if (this.eventMatchesMetric(event, metric)) {
        await this.computeMetric(metric, 'real_time');
      }
    }
  }

  private async computeMetric(metric: MetricDefinition, period: 'real_time' | 'hour' | 'day' | 'week' | 'month'): Promise<ComputedMetric[]> {
    const events = this.getEventsForMetric(metric, period);
    const results: ComputedMetric[] = [];

    if (events.length === 0) return results;

    // Group events by dimensions
    const groupedEvents = this.groupEventsByDimensions(events, metric.dimensions || []);

    for (const [dimensionKey, dimensionEvents] of groupedEvents) {
      const dimensions = this.parseDimensionKey(dimensionKey, metric.dimensions || []);
      let value: number;

      switch (metric.type) {
        case 'count':
          value = dimensionEvents.length;
          break;
        case 'sum':
          value = dimensionEvents.reduce((sum, e) => sum + (e.value || 0), 0);
          break;
        case 'average':
          const sum = dimensionEvents.reduce((total, e) => total + (e.value || 0), 0);
          value = dimensionEvents.length > 0 ? sum / dimensionEvents.length : 0;
          break;
        case 'unique_count':
          const uniqueValues = new Set(dimensionEvents.map(e => e.userId || e.sessionId));
          value = uniqueValues.size;
          break;
        case 'percentage':
          // For percentage, we need a total count - simplified implementation
          const totalEvents = this.events.size;
          value = totalEvents > 0 ? (dimensionEvents.length / totalEvents) * 100 : 0;
          break;
        case 'ratio':
          // For ratios, we need two metrics - simplified implementation
          value = dimensionEvents.length;
          break;
        default:
          value = dimensionEvents.length;
      }

      const computedMetric: ComputedMetric = {
        id: this.generateId('computed'),
        metricId: metric.id,
        value,
        dimensions,
        timestamp: new Date(),
        period: this.getPeriodInfo(period),
        organizationId: events[0].organizationId,
        industry: events[0].industry
      };

      this.computedMetrics.set(computedMetric.id, computedMetric);
      results.push(computedMetric);
    }

    await this.persistComputedMetrics();
    this.emit('metrics_computed', { metricId: metric.id, results });

    return results;
  }

  private eventMatchesMetric(event: AnalyticsEvent, metric: MetricDefinition): boolean {
    if (!metric.filters) return true;

    for (const [key, expectedValue] of Object.entries(metric.filters)) {
      const eventValue = this.getEventValue(event, key);
      if (eventValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  private getEventsForMetric(metric: MetricDefinition, period: string): AnalyticsEvent[] {
    const now = new Date();
    const events = Array.from(this.events.values());

    // Filter by time period
    let filteredEvents = events.filter(event => {
      switch (period) {
        case 'real_time':
          return now.getTime() - event.timestamp.getTime() < 5 * 60 * 1000; // 5 minutes
        case 'hour':
          return now.getTime() - event.timestamp.getTime() < 60 * 60 * 1000; // 1 hour
        case 'day':
          return now.getTime() - event.timestamp.getTime() < 24 * 60 * 60 * 1000; // 1 day
        case 'week':
          return now.getTime() - event.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000; // 1 week
        case 'month':
          return now.getTime() - event.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
        default:
          return true;
      }
    });

    // Apply metric filters
    if (metric.filters) {
      filteredEvents = filteredEvents.filter(event => this.eventMatchesMetric(event, metric));
    }

    return filteredEvents;
  }

  private groupEventsByDimensions(events: AnalyticsEvent[], dimensions: string[]): Map<string, AnalyticsEvent[]> {
    const grouped = new Map<string, AnalyticsEvent[]>();

    for (const event of events) {
      const dimensionValues = dimensions.map(dim => this.getEventValue(event, dim) || 'unknown');
      const key = dimensionValues.join('|');

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    }

    return grouped;
  }

  private parseDimensionKey(key: string, dimensions: string[]): Record<string, string> {
    const values = key.split('|');
    const result: Record<string, string> = {};

    dimensions.forEach((dim, index) => {
      result[dim] = values[index] || 'unknown';
    });

    return result;
  }

  private getEventValue(event: AnalyticsEvent, key: string): unknown {
    // Handle nested properties
    const keys = key.split('.');
    let value: unknown = event;

    for (const k of keys) {
      value = value?.[k];
    }

    return value;
  }

  private getPeriodInfo(period: string): ComputedMetric['period'] {
    const now = new Date();
    
    switch (period) {
      case 'hour':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
          type: 'hour'
        };
      case 'day':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          type: 'day'
        };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd, type: 'week' };
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          type: 'month'
        };
      default:
        return {
          start: new Date(now.getTime() - 5 * 60 * 1000),
          end: now,
          type: 'hour'
        };
    }
  }

  // Report management

  async createReport(report: Omit<ReportDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.initialize();

    const reportDefinition: ReportDefinition = {
      id: this.generateId('report'),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...report
    };

    this.reports.set(reportDefinition.id, reportDefinition);
    await this.persistReports();

    this.emit('report_created', reportDefinition);
    return reportDefinition.id;
  }

  async generateReport(reportId: string, period?: { start: Date; end: Date }): Promise<string> {
    const reportDef = this.reports.get(reportId);
    if (!reportDef) {
      throw new Error('Report definition not found');
    }

    const reportPeriod = period || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    // Collect data for all metrics in the report
    const reportData: ComputedMetric[] = [];
    const summary: Record<string, unknown> = {};

    for (const metricId of reportDef.metrics) {
      const metric = this.metrics.get(metricId);
      if (!metric) continue;

      const computedMetrics = Array.from(this.computedMetrics.values())
        .filter(cm => 
          cm.metricId === metricId &&
          cm.timestamp >= reportPeriod.start &&
          cm.timestamp <= reportPeriod.end
        );

      reportData.push(...computedMetrics);

      // Add to summary
      if (computedMetrics.length > 0) {
        const latestValue = computedMetrics[computedMetrics.length - 1].value;
        const avgValue = computedMetrics.reduce((sum, cm) => sum + cm.value, 0) / computedMetrics.length;
        
        summary[metric.name] = {
          current: latestValue,
          average: avgValue,
          total: computedMetrics.length,
          trend: this.calculateTrend(computedMetrics)
        };
      }
    }

    const generatedReport: GeneratedReport = {
      id: this.generateId('generated'),
      reportId,
      data: reportData,
      summary,
      generatedAt: new Date(),
      period: reportPeriod,
      organizationId: this.organizationId,
      format: 'json'
    };

    this.generatedReports.set(generatedReport.id, generatedReport);
    await this.persistGeneratedReports();

    this.emit('report_generated', generatedReport);
    return generatedReport.id;
  }

  getReport(reportId: string): ReportDefinition | undefined {
    return this.reports.get(reportId);
  }

  getGeneratedReport(generatedReportId: string): GeneratedReport | undefined {
    return this.generatedReports.get(generatedReportId);
  }

  getReports(industry?: string): ReportDefinition[] {
    let reports = Array.from(this.reports.values());

    if (industry) {
      reports = reports.filter(r => r.industry.includes(industry));
    }

    return reports.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Statistics and insights

  async getAnalyticsStats(organizationId?: string, industry?: string): Promise<AnalyticsStats> {
    await this.initialize();

    let events = Array.from(this.events.values());
    
    if (organizationId) {
      events = events.filter(e => e.organizationId === organizationId);
    }
    if (industry) {
      events = events.filter(e => e.industry === industry);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsToday = events.filter(e => e.timestamp >= today);
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const activeUsers = new Set(
      events.filter(e => e.timestamp.getTime() > last24Hours).map(e => e.userId).filter(Boolean)
    ).size;

    // Top events
    const eventCounts = new Map<string, number>();
    events.forEach(e => {
      const key = '${e.category}:${e.action}';
      eventCounts.set(key, (eventCounts.get(key) || 0) + 1);
    });
    const topEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));

    // Top pages
    const pageCounts = new Map<string, number>();
    events.filter(e => e.type === 'pageview').forEach(e => {
      const page = e.metadata?.pathname || 'unknown';
      pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Performance metrics
    const performanceEvents = events.filter(e => e.performance);
    const averageLoadTime = performanceEvents.length > 0
      ? performanceEvents.reduce((sum, e) => sum + (e.performance?.loadTime || 0), 0) / performanceEvents.length
      : 0;
    const averageRenderTime = performanceEvents.length > 0
      ? performanceEvents.reduce((sum, e) => sum + (e.performance?.renderTime || 0), 0) / performanceEvents.length
      : 0;
    
    const errorEvents = events.filter(e => e.type === 'error');
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;

    // Simplified bounce rate calculation
    const sessions = new Map<string, AnalyticsEvent[]>();
    events.forEach(e => {
      if (!sessions.has(e.sessionId)) {
        sessions.set(e.sessionId, []);
      }
      sessions.get(e.sessionId)!.push(e);
    });

    const singlePageSessions = Array.from(sessions.values()).filter(sessionEvents => 
      sessionEvents.filter(e => e.type === 'pageview').length === 1
    ).length;
    const bounceRate = sessions.size > 0 ? (singlePageSessions / sessions.size) * 100 : 0;

    // Industry breakdown
    const industryBreakdown: Record<string, number> = {};
    events.forEach(e => {
      industryBreakdown[e.industry] = (industryBreakdown[e.industry] || 0) + 1;
    });

    // Device breakdown
    const deviceBreakdown = {
      mobile: events.filter(e => e.device?.isMobile).length,
      desktop: events.filter(e => e.device && !e.device.isMobile).length,
      tablet: 0 // Simplified - would need better device detection
    };

    const offlineEvents = events.filter(e => e.isOffline).length;
    const unsyncedEvents = events.filter(e => !e.isSynced).length;

    return {
      totalEvents: events.length,
      eventsToday: eventsToday.length,
      uniqueUsers,
      activeUsers,
      topEvents,
      topPages,
      performanceMetrics: {
        averageLoadTime,
        averageRenderTime,
        errorRate,
        bounceRate
      },
      industryBreakdown,
      deviceBreakdown,
      offlineEvents,
      unsyncedEvents
    };
  }

  getComputedMetrics(filters?: {
    metricId?: string;
    period?: { start: Date; end: Date };
    organizationId?: string;
    industry?: string;
  }): ComputedMetric[] {
    let metrics = Array.from(this.computedMetrics.values());

    if (filters) {
      if (filters.metricId) {
        metrics = metrics.filter(m => m.metricId === filters.metricId);
      }
      if (filters.period) {
        metrics = metrics.filter(m => 
          m.timestamp >= filters.period!.start &&
          m.timestamp <= filters.period!.end
        );
      }
      if (filters.organizationId) {
        metrics = metrics.filter(m => m.organizationId === filters.organizationId);
      }
      if (filters.industry) {
        metrics = metrics.filter(m => m.industry === filters.industry);
      }
    }

    return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Auto-tracking setup

  private setupAutoTracking(): void {
    // Track page views automatically
    if (typeof window !== 'undefined') {
      // Track initial page load
      window.addEventListener('load', () => {
        this.trackPageView(window.location.pathname);
      });

      // Track navigation in SPAs
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => {
          OfflineAnalyticsManager.getInstance().trackPageView(window.location.pathname);
        }, 0);
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => {
          OfflineAnalyticsManager.getInstance().trackPageView(window.location.pathname);
        }, 0);
      };

      window.addEventListener('popstate', () => {
        this.trackPageView(window.location.pathname);
      });

      // Track errors automatically
      window.addEventListener('error', (event) => {
        this.trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error('Unhandled Promise Rejection'), {
          reason: event.reason
        });
      });
    }
  }

  private startComputationTimer(): void {
    // Compute metrics every 5 minutes
    this.computationTimer = setInterval(async () => {
      const activeMetrics = this.getMetrics({ active: true });
      
      for (const metric of activeMetrics) {
        if (metric.aggregation !== 'real_time') {
          await this.computeMetric(metric, metric.aggregation);
        }
      }
    }, 5 * 60 * 1000);
  }

  private setupDefaultMetrics(): void {
    for (const metricDef of this.DEFAULT_METRICS) {
      if (!this.metrics.has(metricDef.id)) {
        this.metrics.set(metricDef.id, metricDef);
      }
    }
  }

  // Utility methods

  private calculateTrend(metrics: ComputedMetric[]): 'up' | 'down' | 'stable' {
    if (metrics.length < 2) return 'stable';

    const sorted = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const first = sorted[0].value;
    const last = sorted[sorted.length - 1].value;

    const change = ((last - first) / first) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private generateSessionId(): string {
    let sessionId = localStorage.getItem(this.STORAGE_KEYS.session);
    if (!sessionId) {
      sessionId = 'session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      localStorage.setItem(this.STORAGE_KEYS.session, sessionId);
    }
    return sessionId;
  }

  private generateId(prefix = 'analytics'): string {
    return '${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private getDeviceInfo(): AnalyticsEvent['device'] {
    if (typeof window === 'undefined') return undefined;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };
  }

  private getLocationInfo(): AnalyticsEvent['location'] {
    if (typeof window === 'undefined') return undefined;

    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    };
  }

  private getPerformanceMetrics(): AnalyticsEvent['performance'] {
    if (typeof window === 'undefined' || !window.performance) return undefined;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return undefined;

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      interactionDelay: 0 // Would need to measure actual interaction delays
    };
  }

  // Configuration

  setUser(userId: string): void {
    this.userId = userId;
  }

  setOrganization(organizationId: string): void {
    this.organizationId = organizationId;
  }

  setIndustry(industry: string): void {
    this.currentIndustry = industry;
  }

  // Storage operations

  private async persistEvents(): Promise<void> {
    try {
      const serialized = Array.from(this.events.entries()).map(([id, event]) => [
        id,
        {
          ...event,
          timestamp: event.timestamp.toISOString()
        }
      ]);

      localStorage.setItem(this.STORAGE_KEYS.events, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist events:', error);
    }
  }

  private async persistMetrics(): Promise<void> {
    try {
      const serialized = Array.from(this.metrics.entries());
      localStorage.setItem(this.STORAGE_KEYS.metrics, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  private async persistComputedMetrics(): Promise<void> {
    try {
      const serialized = Array.from(this.computedMetrics.entries()).map(([id, metric]) => [
        id,
        {
          ...metric,
          timestamp: metric.timestamp.toISOString(),
          period: {
            ...metric.period,
            start: metric.period.start.toISOString(),
            end: metric.period.end.toISOString()
          }
        }
      ]);

      localStorage.setItem(this.STORAGE_KEYS.computed, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist computed metrics:', error);
    }
  }

  private async persistReports(): Promise<void> {
    try {
      const serialized = Array.from(this.reports.entries()).map(([id, report]) => [
        id,
        {
          ...report,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString()
        }
      ]);

      localStorage.setItem(this.STORAGE_KEYS.reports, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist reports:', error);
    }
  }

  private async persistGeneratedReports(): Promise<void> {
    try {
      const serialized = Array.from(this.generatedReports.entries()).map(([id, report]) => [
        id,
        {
          ...report,
          generatedAt: report.generatedAt.toISOString(),
          period: {
            start: report.period.start.toISOString(),
            end: report.period.end.toISOString()
          }
        }
      ]);

      localStorage.setItem(this.STORAGE_KEYS.generated, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist generated reports:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Load events
      const storedEvents = localStorage.getItem(this.STORAGE_KEYS.events);
      if (storedEvents) {
        const serialized = JSON.parse(storedEvents);
        this.events = new Map(
          serialized.map(([id, event]: [string, any]) => [
            id,
            {
              ...event,
              timestamp: new Date(event.timestamp)
            }
          ])
        );
      }

      // Load metrics
      const storedMetrics = localStorage.getItem(this.STORAGE_KEYS.metrics);
      if (storedMetrics) {
        const serialized = JSON.parse(storedMetrics);
        this.metrics = new Map(serialized);
      }

      // Load computed metrics
      const storedComputed = localStorage.getItem(this.STORAGE_KEYS.computed);
      if (storedComputed) {
        const serialized = JSON.parse(storedComputed);
        this.computedMetrics = new Map(
          serialized.map(([id, metric]: [string, any]) => [
            id,
            {
              ...metric,
              timestamp: new Date(metric.timestamp),
              period: {
                ...metric.period,
                start: new Date(metric.period.start),
                end: new Date(metric.period.end)
              }
            }
          ])
        );
      }

      // Load reports
      const storedReports = localStorage.getItem(this.STORAGE_KEYS.reports);
      if (storedReports) {
        const serialized = JSON.parse(storedReports);
        this.reports = new Map(
          serialized.map(([id, report]: [string, any]) => [
            id,
            {
              ...report,
              createdAt: new Date(report.createdAt),
              updatedAt: new Date(report.updatedAt)
            }
          ])
        );
      }

      // Load generated reports
      const storedGenerated = localStorage.getItem(this.STORAGE_KEYS.generated);
      if (storedGenerated) {
        const serialized = JSON.parse(storedGenerated);
        this.generatedReports = new Map(
          serialized.map(([id, report]: [string, any]) => [
            id,
            {
              ...report,
              generatedAt: new Date(report.generatedAt),
              period: {
                start: new Date(report.period.start),
                end: new Date(report.period.end)
              }
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  // Event system

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener for ${event}:', error);
        }
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Cleanup

  public destroy(): void {
    if (this.computationTimer) {
      clearInterval(this.computationTimer);
      this.computationTimer = null;
    }

    this.eventListeners.clear();
    this.events.clear();
    this.metrics.clear();
    this.computedMetrics.clear();
    this.reports.clear();
    this.generatedReports.clear();
    this.initialized = false;
  }
}

// Factory function
export function createOfflineAnalyticsManager(): OfflineAnalyticsManager {
  return OfflineAnalyticsManager.getInstance();
}

// React hook
export function useOfflineAnalytics() {
  const manager = OfflineAnalyticsManager.getInstance();
  
  return {
    // Event tracking
    trackEvent: manager.trackEvent.bind(manager),
    trackPageView: manager.trackPageView.bind(manager),
    trackTransaction: manager.trackTransaction.bind(manager),
    trackInteraction: manager.trackInteraction.bind(manager),
    trackError: manager.trackError.bind(manager),
    trackCustom: manager.trackCustom.bind(manager),
    
    // Metrics
    defineMetric: manager.defineMetric.bind(manager),
    getMetrics: manager.getMetrics.bind(manager),
    getComputedMetrics: manager.getComputedMetrics.bind(manager),
    
    // Reports
    createReport: manager.createReport.bind(manager),
    generateReport: manager.generateReport.bind(manager),
    getReports: manager.getReports.bind(manager),
    getGeneratedReport: manager.getGeneratedReport.bind(manager),
    
    // Statistics
    getAnalyticsStats: manager.getAnalyticsStats.bind(manager),
    
    // Configuration
    setUser: manager.setUser.bind(manager),
    setOrganization: manager.setOrganization.bind(manager),
    setIndustry: manager.setIndustry.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}