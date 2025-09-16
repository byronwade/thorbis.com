import { Suspense } from 'react'
import { IntegrationAnalytics } from '@/components/integration-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Clock, Activity, Download } from 'lucide-react'

// Mock analytics data - replace with real API calls
const mockAnalyticsData = {
  overview: {
    totalApiCalls: 15420,
    avgResponseTime: 145,
    successRate: 99.8,
    dataTransferred: 2.4, // GB
    costThisMonth: 127.50,
    peakHour: '14:00',
    mostActiveIntegration: 'Stripe'
  },
  trends: {
    apiCallsTrend: [
      { date: '2025-01-24', calls: 12000 },
      { date: '2025-01-25', calls: 13500 },
      { date: '2025-01-26', calls: 11800 },
      { date: '2025-01-27', calls: 14200 },
      { date: '2025-01-28', calls: 15000 },
      { date: '2025-01-29', calls: 13800 },
      { date: '2025-01-30', calls: 16500 },
      { date: '2025-01-31', calls: 15420 }
    ],
    responseTimeTrend: [
      { date: '2025-01-24', avgTime: 165 },
      { date: '2025-01-25', avgTime: 152 },
      { date: '2025-01-26', avgTime: 178 },
      { date: '2025-01-27', avgTime: 143 },
      { date: '2025-01-28', avgTime: 156 },
      { date: '2025-01-29', avgTime: 139 },
      { date: '2025-01-30', avgTime: 147 },
      { date: '2025-01-31', avgTime: 145 }
    ]
  },
  integrationBreakdown: [
    { name: 'Stripe', calls: 6200, percentage: 40.2, cost: 51.20 },
    { name: 'QuickBooks', calls: 3800, percentage: 24.6, cost: 32.50 },
    { name: 'Google Calendar', calls: 2100, percentage: 13.6, cost: 18.75 },
    { name: 'Slack', calls: 1850, percentage: 12.0, cost: 15.25 },
    { name: 'Others', calls: 1470, percentage: 9.5, cost: 9.80 }
  ],
  hourlyPattern: [
    { hour: '00:00', calls: 245 },
    { hour: '02:00', calls: 180 },
    { hour: '04:00', calls: 150 },
    { hour: '06:00', calls: 320 },
    { hour: '08:00', calls: 850 },
    { hour: '10:00', calls: 1200 },
    { hour: '12:00', calls: 1450 },
    { hour: '14:00', calls: 1680 },
    { hour: '16:00', calls: 1320 },
    { hour: '18:00', calls: 980 },
    { hour: '20:00', calls: 650 },
    { hour: '22:00', calls: 420 }
  ],
  errors: {
    totalErrors: 33,
    errorsByIntegration: [
      { name: 'Google Calendar', errors: 18, type: 'Authentication' },
      { name: 'QuickBooks', errors: 8, type: 'Rate Limit' },
      { name: 'Stripe', errors: 4, type: 'Validation' },
      { name: 'Slack', errors: 3, type: 'Network' }
    ],
    errorTrend: [
      { date: '2025-01-24', errors: 12 },
      { date: '2025-01-25', errors: 8 },
      { date: '2025-01-26', errors: 15 },
      { date: '2025-01-27', errors: 6 },
      { date: '2025-01-28', errors: 11 },
      { date: '2025-01-29', errors: 9 },
      { date: '2025-01-30', errors: 14 },
      { date: '2025-01-31', errors: 7 }
    ]
  }
}

interface AnalyticsPageProps {
  searchParams: { from?: string }
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const fromIndustry = searchParams.from

  const handleExportData = () => {
    console.log('Exporting analytics data...')
    // Implement export logic
  }

  const handleViewDetails = (integration: string) => {
    console.log('Viewing details for:', integration)
    // Navigate to detailed analytics
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Analytics</h1>
          <p className="text-neutral-500">
            Analyze usage patterns, performance metrics, and costs across all integrations
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleExportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalApiCalls.toLocaleString()}</div>
            <p className="text-xs text-neutral-500">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.avgResponseTime}ms</div>
            <p className="text-xs text-green-600">
              +12ms from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.successRate}%</div>
            <p className="text-xs text-green-600">
              +0.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalyticsData.overview.costThisMonth}</div>
            <p className="text-xs text-red-600">
              +$15.50 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Integration</CardTitle>
            <CardDescription>API calls and cost breakdown by service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.integrationBreakdown.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{integration.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {integration.percentage}%
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{integration.calls.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">${integration.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Hours</CardTitle>
            <CardDescription>API call patterns throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalyticsData.hourlyPattern
                .sort((a, b) => b.calls - a.calls)
                .slice(0, 6)
                .map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{hour.hour}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-neutral-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: '${(hour.calls / Math.max(...mockAnalyticsData.hourlyPattern.map(h => h.calls))) * 100}%' 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-neutral-500 w-16 text-right">
                        {hour.calls.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>
            {mockAnalyticsData.errors.totalErrors} total errors in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-3 text-neutral-400">Errors by Integration</h4>
              <div className="space-y-3">
                {mockAnalyticsData.errors.errorsByIntegration.map((error) => (
                  <div key={error.name} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{error.name}</div>
                      <div className="text-xs text-neutral-500">{error.type}</div>
                    </div>
                    <Badge variant="outline" className="text-red-500 border-red-500/20">
                      {error.errors} errors
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 text-neutral-400">Error Trend (Last 8 days)</h4>
              <div className="space-y-2">
                {mockAnalyticsData.errors.errorTrend.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-800 rounded-full h-1.5">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full" 
                          style={{ 
                            width: '${(day.errors / Math.max(...mockAnalyticsData.errors.errorTrend.map(e => e.errors))) * 100}%' 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-red-500 w-8 text-right">{day.errors}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Analytics Component */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
        <Suspense fallback={
          <div className="h-96 bg-neutral-900 rounded-lg animate-pulse"></div>
        }>
          <IntegrationAnalytics
            data={{
              usageMetrics: {
                totalApiCalls: mockAnalyticsData.overview.totalApiCalls,
                successfulCalls: Math.floor(mockAnalyticsData.overview.totalApiCalls * mockAnalyticsData.overview.successRate / 100),
                failedCalls: mockAnalyticsData.errors.totalErrors,
                averageResponseTime: mockAnalyticsData.overview.avgResponseTime,
                dataTransferred: mockAnalyticsData.overview.dataTransferred,
                peakUsageHour: mockAnalyticsData.overview.peakHour
              },
              costAnalysis: {
                totalCost: mockAnalyticsData.overview.costThisMonth,
                costPerCall: mockAnalyticsData.overview.costThisMonth / mockAnalyticsData.overview.totalApiCalls,
                projectedMonthlyCost: mockAnalyticsData.overview.costThisMonth * 1.15,
                costByIntegration: mockAnalyticsData.integrationBreakdown.map(item => ({
                  integration: item.name,
                  cost: item.cost,
                  percentage: item.percentage
                }))
              },
              performanceMetrics: {
                responseTimeP50: mockAnalyticsData.overview.avgResponseTime,
                responseTimeP95: mockAnalyticsData.overview.avgResponseTime * 2.1,
                responseTimeP99: mockAnalyticsData.overview.avgResponseTime * 3.2,
                uptimePercentage: mockAnalyticsData.overview.successRate,
                errorRate: (mockAnalyticsData.errors.totalErrors / mockAnalyticsData.overview.totalApiCalls) * 100
              },
              trends: {
                daily: mockAnalyticsData.trends.apiCallsTrend,
                hourly: mockAnalyticsData.hourlyPattern,
                responseTime: mockAnalyticsData.trends.responseTimeTrend,
                errors: mockAnalyticsData.errors.errorTrend
              }
            }}
            onExport={handleExportData}
            onViewDetails={handleViewDetails}
            className="w-full"
          />
        </Suspense>
      </div>
    </div>
  )
}