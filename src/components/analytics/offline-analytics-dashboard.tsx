'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Globe,
  Zap,
  Target,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Settings,
  Loader2,
  WifiOff,
  Wifi,
  PieChart,
  LineChart,
  BarChart,
  Hash,
  Percent,
  Timer,
  MousePointer,
  X
} from 'lucide-react';

import { useOfflineAnalytics } from '@/lib/offline-analytics-manager';
import type { AnalyticsStats, MetricDefinition, ComputedMetric, ReportDefinition } from '@/lib/offline-analytics-manager';

interface AnalyticsDashboardState {
  stats: AnalyticsStats;
  metrics: MetricDefinition[];
  computedMetrics: ComputedMetric[];
  reports: ReportDefinition[];
  loading: boolean;
  error: string | null;
  selectedPeriod: 'hour' | 'day' | 'week' | 'month';
  selectedIndustry: string;
  selectedMetric?: string;
  autoRefresh: boolean;
}

export default function OfflineAnalyticsDashboard() {
  const [state, setState] = useState<AnalyticsDashboardState>({
    stats: {
      totalEvents: 0,
      eventsToday: 0,
      uniqueUsers: 0,
      activeUsers: 0,
      topEvents: [],
      topPages: [],
      performanceMetrics: {
        averageLoadTime: 0,
        averageRenderTime: 0,
        errorRate: 0,
        bounceRate: 0
      },
      industryBreakdown: Record<string, unknown>,
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
      offlineEvents: 0,
      unsyncedEvents: 0
    },
    metrics: [],
    computedMetrics: [],
    reports: [],
    loading: false,
    error: null,
    selectedPeriod: 'day',
    selectedIndustry: ',
    autoRefresh: true
  });

  const analytics = useOfflineAnalytics();

  // Load all analytics data
  const loadAnalyticsData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [stats, metrics, reports] = await Promise.all([
        analytics.getAnalyticsStats(undefined, state.selectedIndustry || undefined),
        analytics.getMetrics({ industry: state.selectedIndustry || undefined }),
        analytics.getReports(state.selectedIndustry || undefined)
      ]);

      const computedMetrics = analytics.getComputedMetrics({
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
          end: new Date()
        },
        industry: state.selectedIndustry || undefined
      });

      setState(prev => ({
        ...prev,
        stats,
        metrics,
        computedMetrics,
        reports,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analytics data',
        loading: false
      }));
    }
  }, [analytics, state.selectedIndustry]);

  // Set up event listeners and auto-refresh
  useEffect(() => {
    loadAnalyticsData();

    // Set up event listeners
    const handleEventTracked = () => {
      if (state.autoRefresh) {
        loadAnalyticsData();
      }
    };

    const handleMetricsComputed = () => {
      if (state.autoRefresh) {
        loadAnalyticsData();
      }
    };

    analytics.on('event_tracked', handleEventTracked);
    analytics.on('metrics_computed', handleMetricsComputed);

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (state.autoRefresh) {
        loadAnalyticsData();
      }
    }, 30000);

    return () => {
      analytics.off('event_tracked', handleEventTracked);
      analytics.off('metrics_computed', handleMetricsComputed);
      clearInterval(refreshInterval);
    };
  }, [loadAnalyticsData, state.autoRefresh, analytics]);

  const handleGenerateReport = async () => {
    if (!state.selectedMetric) return;

    try {
      const reportId = await analytics.createReport({
        name: 'Analytics Report - ${new Date().toLocaleDateString()}',
        description: 'Auto-generated analytics report',
        type: 'summary',
        industry: state.selectedIndustry ? [state.selectedIndustry] : ['hs', 'rest', 'auto', 'ret', 'courses'],
        metrics: [state.selectedMetric],
        dimensions: ['industry', 'device_type'],
        filters: Record<string, unknown>,
        visualization: {
          type: 'chart',
          config: { chartType: 'line' }
        },
        isActive: true
      });

      await analytics.generateReport(reportId);
      await loadAnalyticsData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate report`
      }));
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms';
    return '${(ms / 1000).toFixed(2)}s';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-neutral-500" />;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'count': return Hash;
      case 'sum': return DollarSign;
      case 'average': return BarChart;
      case 'percentage': return Percent;
      case 'ratio': return PieChart;
      case 'unique_count': return Users;
      default: return BarChart3;
    }
  };

  const getIndustryColor = (industry: string) => {
    const colors = {
      hs: 'bg-blue-500',
      rest: 'bg-green-500',
      auto: 'bg-orange-500',
      ret: 'bg-purple-500',
      courses: 'bg-cyan-500',
      payroll: 'bg-pink-500'
    };
    return colors[industry as keyof typeof colors] || 'bg-neutral-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offline Analytics Dashboard</h1>
          <p className="text-neutral-400">Real-time business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {!navigator.onLine && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          {state.stats.unsyncedEvents > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {state.stats.unsyncedEvents} Unsynced
            </Badge>
          )}
          <Select value={state.selectedIndustry} onValueChange={(value) => setState(prev => ({ ...prev, selectedIndustry: value }))}>
            <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Industries</SelectItem>
              <SelectItem value="hs">Home Services</SelectItem>
              <SelectItem value="rest">Restaurant</SelectItem>
              <SelectItem value="auto">Auto Services</SelectItem>
              <SelectItem value="ret">Retail</SelectItem>
              <SelectItem value="courses">Courses</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={state.loading}
          >
            {state.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
          >
            {state.autoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{formatNumber(state.stats.totalEvents)}</p>
                <p className="text-xs text-neutral-500">+{state.stats.eventsToday} today</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(state.stats.activeUsers)}</p>
                <p className="text-xs text-neutral-500">{state.stats.uniqueUsers} total unique</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Avg Load Time</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(state.stats.performanceMetrics.averageLoadTime)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatPercentage(state.stats.performanceMetrics.errorRate)} error rate
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Bounce Rate</p>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(state.stats.performanceMetrics.bounceRate)}
                </p>
                <p className="text-xs text-neutral-500">Single page sessions</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Events */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Top Events</CardTitle>
                <CardDescription>Most tracked user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {state.stats.topEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <MousePointer className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-400">No events tracked yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {state.stats.topEvents.slice(0, 5).map((event, index) => (
                      <div key={event.event} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">#{index + 1}</span>
                          <span className="text-white">{event.event}</span>
                        </div>
                        <Badge variant="outline">{formatNumber(event.count)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Top Pages</CardTitle>
                <CardDescription>Most viewed pages</CardDescription>
              </CardHeader>
              <CardContent>
                {state.stats.topPages.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-400">No page views tracked yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {state.stats.topPages.slice(0, 5).map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">#{index + 1}</span>
                          <span className="text-white font-mono text-sm">{page.page}</span>
                        </div>
                        <Badge variant="outline">{formatNumber(page.views)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Industry Breakdown */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Industry Distribution</CardTitle>
                <CardDescription>Events by business vertical</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(state.stats.industryBreakdown).map(([industry, count]) => {
                    const percentage = state.stats.totalEvents > 0 
                      ? (count / state.stats.totalEvents) * 100 
                      : 0;
                    
                    return (
                      <div key={industry} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={'w-3 h-3 rounded ${getIndustryColor(industry)}'} />
                            <span className="text-white capitalize">{industry}</span>
                          </div>
                          <span className="text-neutral-400">{formatNumber(count)}</span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Device Distribution</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-500" />
                      <span className="text-white">Desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">{formatNumber(state.stats.deviceBreakdown.desktop)}</span>
                      <Progress 
                        value={state.stats.totalEvents > 0 ? (state.stats.deviceBreakdown.desktop / state.stats.totalEvents) * 100 : 0} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span className="text-white">Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">{formatNumber(state.stats.deviceBreakdown.mobile)}</span>
                      <Progress 
                        value={state.stats.totalEvents > 0 ? (state.stats.deviceBreakdown.mobile / state.stats.totalEvents) * 100 : 0} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4 text-purple-500" />
                      <span className="text-white">Tablet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">{formatNumber(state.stats.deviceBreakdown.tablet)}</span>
                      <Progress 
                        value={state.stats.totalEvents > 0 ? (state.stats.deviceBreakdown.tablet / state.stats.totalEvents) * 100 : 0} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Custom Metrics</h3>
              <p className="text-neutral-400">Configured analytics metrics and their computed values</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={state.selectedMetric} onValueChange={(value) => setState(prev => ({ ...prev, selectedMetric: value }))}>
                <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Select metric for report" />
                </SelectTrigger>
                <SelectContent>
                  {state.metrics.map(metric => (
                    <SelectItem key={metric.id} value={metric.id}>{metric.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateReport} disabled={!state.selectedMetric}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.metrics.map(metric => {
              const Icon = getMetricIcon(metric.type);
              const latestMetric = state.computedMetrics
                .filter(cm => cm.metricId === metric.id)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
              
              return (
                <Card key={metric.id} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 text-blue-500" />
                      <Badge variant={metric.isActive ? "default" : "secondary"}>
                        {metric.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <h4 className="text-white font-medium">{metric.name}</h4>
                    <p className="text-xs text-neutral-400 mb-3">{metric.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {latestMetric ? 
                          metric.type === 'percentage' ? formatPercentage(latestMetric.value) :
                          metric.type === 'sum' && metric.name.toLowerCase().includes('revenue') ? '$${formatNumber(latestMetric.value)}' :
                          formatNumber(latestMetric.value)
                          : '—'
                        }
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {metric.aggregation}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">User Engagement</CardTitle>
                <CardDescription>Active users and session metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Total Users</span>
                  <span className="text-white font-medium">{formatNumber(state.stats.uniqueUsers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Active Users (24h)</span>
                  <span className="text-white font-medium">{formatNumber(state.stats.activeUsers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Bounce Rate</span>
                  <span className="text-white font-medium">{formatPercentage(state.stats.performanceMetrics.bounceRate)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Session Quality</CardTitle>
                <CardDescription>Engagement and interaction metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Events per Session</span>
                  <span className="text-white font-medium">
                    {state.stats.uniqueUsers > 0 ? 
                      formatNumber(state.stats.totalEvents / state.stats.uniqueUsers) : 
                      '0'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Error Rate</span>
                  <span className="text-white font-medium">{formatPercentage(state.stats.performanceMetrics.errorRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Offline Events</span>
                  <span className="text-white font-medium">{formatNumber(state.stats.offlineEvents)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Avg Load Time</p>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(state.stats.performanceMetrics.averageLoadTime)}
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Avg Render Time</p>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(state.stats.performanceMetrics.averageRenderTime)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Error Rate</p>
                    <p className="text-2xl font-bold text-red-500">
                      {formatPercentage(state.stats.performanceMetrics.errorRate)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated Reports</h3>
              <p className="text-neutral-400">Analytics reports and exports</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={!state.selectedMetric}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {state.reports.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">No reports generated yet</p>
                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={!state.selectedMetric}
                    className="mt-4"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Your First Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.reports.map(report => (
                <Card key={report.id} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <Badge variant={report.isActive ? "default" : "secondary"}>
                        {report.type}
                      </Badge>
                    </div>
                    <h4 className="text-white font-medium">{report.name}</h4>
                    <p className="text-xs text-neutral-400 mb-3">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {report.updatedAt.toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}