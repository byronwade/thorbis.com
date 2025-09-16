'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Eye,
  MousePointer,
  Layout,
  Zap,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  LineChart,
  Calendar
} from 'lucide-react'
import { webVitalsTracking, getWebVitalsThresholds } from '@/lib/web-vitals-tracking'

interface WebVitalsData {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  trend: number
  samples: number
  percentile: {
    p50: number
    p75: number
    p90: number
    p95: number
  }
}

interface DeviceDistribution {
  mobile: number
  tablet: number
  desktop: number
}

interface ConnectionDistribution {
  '4g': number
  '3g': number
  '2g': number
  'wifi': number
  'unknown': number
}

interface WebVitalsAnalytics {
  overview: {
    totalPageLoads: number
    averageScore: number
    passRate: number
    failureRate: number
  }
  metrics: WebVitalsData[]
  deviceDistribution: DeviceDistribution
  connectionDistribution: ConnectionDistribution
  trends: {
    period: string
    improvement: boolean
    percentage: number
  }
  recentIssues: Array<{
    metric: string
    value: number
    url: string
    timestamp: number
    deviceType: string
  }>
}

export function WebVitalsDashboard() {
  const [analytics, setAnalytics] = useState<WebVitalsAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const thresholds = getWebVitalsThresholds()

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll generate sample data based on the selected period
      
      const sampleData: WebVitalsAnalytics = {
        overview: {
          totalPageLoads: 12534,
          averageScore: 87.3,
          passRate: 89.2,
          failureRate: 10.8
        },
        metrics: [
          {
            metric: 'LCP',
            value: 2180,
            rating: 'good',
            trend: -8.5,
            samples: 1234,
            percentile: { p50: 1890, p75: 2180, p90: 2650, p95: 3100 }
          },
          {
            metric: 'INP',
            value: 145,
            rating: 'good',
            trend: 2.1,
            samples: 987,
            percentile: { p50: 120, p75: 145, p90: 180, p95: 220 }
          },
          {
            metric: 'CLS',
            value: 0.08,
            rating: 'good',
            trend: -12.3,
            samples: 1456,
            percentile: { p50: 0.05, p75: 0.08, p90: 0.12, p95: 0.18 }
          },
          {
            metric: 'FCP',
            value: 1650,
            rating: 'good',
            trend: -5.7,
            samples: 1389,
            percentile: { p50: 1450, p75: 1650, p90: 1950, p95: 2300 }
          },
          {
            metric: 'TTFB',
            value: 420,
            rating: 'good',
            trend: 1.8,
            samples: 1456,
            percentile: { p50: 380, p75: 420, p90: 520, p95: 680 }
          }
        ],
        deviceDistribution: {
          mobile: 52.3,
          tablet: 18.7,
          desktop: 29.0
        },
        connectionDistribution: {
          '4g': 68.5,
          '3g': 15.2,
          '2g': 3.1,
          'wifi': 12.8,
          'unknown': 0.4
        },
        trends: {
          period: selectedPeriod,
          improvement: true,
          percentage: 15.7
        },
        recentIssues: [
          {
            metric: 'LCP',
            value: 4200,
            url: '/dashboards/restaurant',
            timestamp: Date.now() - 1800000,
            deviceType: 'mobile'
          },
          {
            metric: 'INP',
            value: 520,
            url: '/dashboards/home-services',
            timestamp: Date.now() - 3600000,
            deviceType: 'tablet'
          }
        ]
      }

      setAnalytics(sampleData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load Web Vitals analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
    
    // Refresh every 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'LCP': return <Eye className="w-4 h-4" />
      case 'INP': return <MousePointer className="w-4 h-4" />
      case 'CLS': return <Layout className="w-4 h-4" />
      case 'FCP': return <Zap className="w-4 h-4" />
      case 'TTFB': return <Wifi className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getMetricDescription = (metric: string) => {
    switch (metric) {
      case 'LCP': return 'Largest Contentful Paint'
      case 'INP': return 'Interaction to Next Paint'
      case 'CLS': return 'Cumulative Layout Shift'
      case 'FCP': return 'First Contentful Paint'
      case 'TTFB': return 'Time to First Byte'
      default: return metric
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-900 text-green-300'
      case 'needs-improvement': return 'bg-yellow-900 text-yellow-300'
      case 'poor': return 'bg-red-900 text-red-300'
      default: return 'bg-neutral-900 text-neutral-300'
    }
  }

  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'CLS') {
      return value.toFixed(3)
    }
    return Math.round(value).toString() + 'ms'
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ago'
    return '${minutes}m ago'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-neutral-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading Web Vitals analytics...
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
        <p className="text-neutral-400">Web Vitals data is not available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Web Vitals Analytics</h2>
          <p className="text-neutral-400">
            Real User Monitoring (RUM) performance metrics
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(['1h', '24h', '7d', '30d'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-400">Total Page Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.overview.totalPageLoads.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Last {selectedPeriod}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-400">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.overview.averageScore}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">
                {analytics.trends.percentage}% better
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-400">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.overview.passRate}%
              </span>
            </div>
            <Progress value={analytics.overview.passRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-400">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.recentIssues.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Recent performance issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-900">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {analytics.metrics.map((metric) => (
              <Card key={metric.metric} className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    {getMetricIcon(metric.metric)}
                    {metric.metric}
                  </CardTitle>
                  <CardDescription>
                    {getMetricDescription(metric.metric)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatMetricValue(metric.metric, metric.value)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRatingColor(metric.rating)}>
                          {metric.rating.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {metric.trend < 0 ? (
                            <TrendingDown className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-red-400" />
                          )}
                          <span className={'text-xs ${metric.trend < 0 ? 'text-green-400' : 'text-red-400'}'}>
                            {Math.abs(metric.trend)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-neutral-400">Percentiles</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">P50:</span>
                        <span className="text-white">
                          {formatMetricValue(metric.metric, metric.percentile.p50)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">P75:</span>
                        <span className="text-white">
                          {formatMetricValue(metric.metric, metric.percentile.p75)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">P90:</span>
                        <span className="text-white">
                          {formatMetricValue(metric.metric, metric.percentile.p90)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">P95:</span>
                        <span className="text-white">
                          {formatMetricValue(metric.metric, metric.percentile.p95)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 pt-1">
                      {metric.samples.toLocaleString()} samples
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Device Distribution</CardTitle>
                <CardDescription>Performance metrics by device type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.deviceDistribution).map(([device, percentage]) => {
                  const Icon = device === 'mobile' ? Smartphone : 
                              device === 'tablet` ? Tablet : Monitor
                  
                  return (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300 capitalize">{device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${percentage}%' }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Connection Types</CardTitle>
                <CardDescription>Network performance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.connectionDistribution).map(([connection, percentage]) => (
                  <div key={connection} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-300 uppercase">{connection}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: '${percentage}%' }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Trends</CardTitle>
              <CardDescription>Historical performance improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {analytics.trends.percentage}%
                    </div>
                    <div className="text-sm text-neutral-400">
                      Performance improvement over {analytics.trends.period}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-neutral-950 rounded-lg">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Trend Analysis</h3>
                  <p className="text-neutral-400 text-sm">
                    Detailed trend charts and historical analysis will be available here.
                    This includes Core Web Vitals over time, regression detection, and performance correlations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Performance Issues</CardTitle>
              <CardDescription>Latest detected performance problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentIssues.length > 0 ? (
                  analytics.recentIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border-l-4 border-red-500">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-900 text-red-300">
                            {issue.metric}
                          </Badge>
                          <span className="text-white font-medium">
                            {formatMetricValue(issue.metric, issue.value)}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm">
                          {issue.url}
                        </p>
                        <p className="text-neutral-500 text-xs">
                          {issue.deviceType} • {formatTimestamp(issue.timestamp)}
                        </p>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Issues Found</h3>
                    <p className="text-neutral-400">
                      All Web Vitals metrics are performing within acceptable thresholds.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}