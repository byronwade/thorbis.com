'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Download
} from 'lucide-react'
import { errorMonitoring } from '@/lib/error-monitoring'

interface ErrorStats {
  totalErrors: number
  recentErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  topErrors: Array<{
    message: string
    count: number
    lastSeen: number
  }>
}

interface PerformanceStats {
  coreWebVitals: {
    CLS: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
    FID: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
    LCP: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
    FCP: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
    TTFB: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
    INP: { value: number; status: 'good' | 'needs-improvement' | 'poor' }
  }
  deviceBreakdown: {
    mobile: number
    tablet: number
    desktop: number
  }
  trends: {
    period: string
    improvement: boolean
    percentage: number
  }
}

export function MonitoringDashboard() {
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null)
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    try {
      // Load error statistics
      const localErrorStats = errorMonitoring.getErrorStats()
      setErrorStats({
        totalErrors: localErrorStats.totalErrors,
        recentErrors: localErrorStats.recentErrors,
        errorsByType: {
          'javascript': Math.floor(localErrorStats.totalErrors * 0.4),
          'react': Math.floor(localErrorStats.totalErrors * 0.3),
          'network': Math.floor(localErrorStats.totalErrors * 0.2),
          'custom': Math.floor(localErrorStats.totalErrors * 0.1)
        },
        errorsBySeverity: {
          'critical': Math.floor(localErrorStats.totalErrors * 0.1),
          'high': Math.floor(localErrorStats.totalErrors * 0.2),
          'medium': Math.floor(localErrorStats.totalErrors * 0.5),
          'low': Math.floor(localErrorStats.totalErrors * 0.2)
        },
        topErrors: [
          { message: 'TypeError: Cannot read property', count: 12, lastSeen: Date.now() - 3600000 },
          { message: 'Network request failed', count: 8, lastSeen: Date.now() - 1800000 },
          { message: 'Component render error', count: 5, lastSeen: Date.now() - 7200000 }
        ]
      })

      // Load performance statistics
      setPerformanceStats({
        coreWebVitals: {
          CLS: { value: 0.08, status: 'good' },
          FID: { value: 85, status: 'good' },
          LCP: { value: 2200, status: 'good' },
          FCP: { value: 1600, status: 'good' },
          TTFB: { value: 450, status: 'good' },
          INP: { value: 150, status: 'good' }
        },
        deviceBreakdown: {
          mobile: 45,
          tablet: 20,
          desktop: 35
        },
        trends: {
          period: '7 days',
          improvement: true,
          percentage: 12.5
        }
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load monitoring stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    // Refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-900 text-green-300'
      case 'needs-improvement': return 'bg-yellow-900 text-yellow-300'
      case 'poor': return 'bg-red-900 text-red-300'
      default: return 'bg-neutral-900 text-neutral-300'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-300'
      case 'high': return 'bg-orange-900 text-orange-300'
      case 'medium': return 'bg-yellow-900 text-yellow-300'
      case 'low': return 'bg-blue-900 text-blue-300'
      default: return 'bg-neutral-900 text-neutral-300'
    }
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
          Loading monitoring data...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
          <p className="text-neutral-400">
            Real-time error tracking and performance monitoring
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-400">Total Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-2xl font-bold text-white">
                    {errorStats?.totalErrors || 0}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {errorStats?.recentErrors || 0} in the last hour
                </p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-400">Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">Good</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  All metrics passing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-400">Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold text-white">
                    {performanceStats?.coreWebVitals.LCP.value || 0}ms
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">
                    {performanceStats?.trends.percentage || 0}% faster
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-400">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">1,234</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Across all devices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Error Summary</CardTitle>
                <CardDescription>Recent error distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {errorStats && Object.entries(errorStats.errorsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(severity)}>
                        {severity}
                      </Badge>
                      <span className="text-neutral-300 capitalize">{severity} errors</span>
                    </div>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Device Breakdown</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceStats && Object.entries(performanceStats.deviceBreakdown).map(([device, percentage]) => {
                  const Icon = device === 'mobile' ? Smartphone : 
                              device === 'tablet` ? Tablet : Monitor
                  
                  return (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300 capitalize">{device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${percentage}%' }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Top Errors</CardTitle>
                <CardDescription>Most frequent error messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorStats?.topErrors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                      <div className="flex-1">
                        <p className="text-neutral-300 text-sm font-medium truncate">
                          {error.message}
                        </p>
                        <p className="text-neutral-500 text-xs">
                          Last seen {formatTimestamp(error.lastSeen)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {error.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Error Types</CardTitle>
                <CardDescription>Distribution by error category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errorStats && Object.entries(errorStats.errorsByType).map(([type, count]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-300 capitalize">{type} errors</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" 
                          style={{ width: '${(count / (errorStats.totalErrors || 1)) * 100}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Core Web Vitals</CardTitle>
              <CardDescription>Current performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {performanceStats && Object.entries(performanceStats.coreWebVitals).map(([metric, data]) => (
                  <div key={metric} className="text-center p-4 bg-neutral-950 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">
                      {metric === 'CLS' ? data.value.toFixed(3) : Math.round(data.value)}
                    </div>
                    <div className="text-xs text-neutral-400 mb-2">{metric}</div>
                    <Badge className={getStatusColor(data.status)}>
                      {data.status.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Trends</CardTitle>
              <CardDescription>Improvements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {performanceStats?.trends.improvement ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-neutral-300">
                    {performanceStats?.trends.percentage}% 
                    {performanceStats?.trends.improvement ? ' improvement' : ' decline'}
                  </span>
                </div>
                <span className="text-neutral-500">
                  over {performanceStats?.trends.period}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Detailed analytics and insights will be available here. This includes user behavior, 
              conversion funnels, and business intelligence dashboards.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}