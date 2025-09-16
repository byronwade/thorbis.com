import { Suspense } from 'react'
import { IntegrationHealthMonitor } from '@/components/integration-health-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

// Mock health data - replace with real API calls
const mockHealthData = {
  systemHealth: {
    status: 'healthy' as const,
    uptime: 99.9,
    totalRequests: 15420,
    successfulRequests: 15387,
    failedRequests: 33,
    averageResponseTime: 145,
    lastIncident: new Date('2025-01-29T14:30:00Z')
  },
  integrations: [
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'healthy' as const,
      uptime: 99.8,
      lastChecked: new Date('2025-01-31T11:30:00Z'),
      responseTime: 120,
      errorRate: 0.2,
      metrics: {
        requests24h: 1250,
        errors24h: 3,
        avgResponseTime: 120
      },
      incidents: []
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      status: 'degraded' as const,
      uptime: 97.5,
      lastChecked: new Date('2025-01-31T11:25:00Z'),
      responseTime: 450,
      errorRate: 2.5,
      metrics: {
        requests24h: 890,
        errors24h: 12,
        avgResponseTime: 450
      },
      incidents: [
        {
          id: 'qb-001',
          title: 'Slow Response Times',
          description: 'API responses are taking longer than usual',
          severity: 'warning' as const,
          timestamp: new Date('2025-01-31T09:15:00Z'),
          resolved: false
        }
      ]
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      status: 'error' as const,
      uptime: 85.0,
      lastChecked: new Date('2025-01-31T11:20:00Z'),
      responseTime: 0,
      errorRate: 15.0,
      metrics: {
        requests24h: 450,
        errors24h: 68,
        avgResponseTime: 0
      },
      incidents: [
        {
          id: 'gc-001',
          title: 'Authentication Failure',
          description: 'OAuth token has expired and needs renewal',
          severity: 'error' as const,
          timestamp: new Date('2025-01-31T08:30:00Z'),
          resolved: false
        }
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      status: 'healthy' as const,
      uptime: 99.9,
      lastChecked: new Date('2025-01-31T11:32:00Z'),
      responseTime: 95,
      errorRate: 0.1,
      metrics: {
        requests24h: 325,
        errors24h: 0,
        avgResponseTime: 95
      },
      incidents: []
    }
  ]
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-neutral-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'degraded':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'error':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    default:
      return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
  }
}

interface HealthPageProps {
  searchParams: { from?: string }
}

export default function HealthPage({ searchParams }: HealthPageProps) {
  const fromIndustry = searchParams.from

  const handleRefreshHealth = () => {
    console.log('Refreshing health data...')
    // Implement health refresh logic
  }

  const handleResolveIncident = (incidentId: string) => {
    console.log('Resolving incident:', incidentId)
    // Implement incident resolution logic
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Health</h1>
          <p className="text-neutral-500">
            Monitor the health and performance of all your integrations
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleRefreshHealth} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(mockHealthData.systemHealth.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getStatusColor(mockHealthData.systemHealth.status)}>
                {mockHealthData.systemHealth.status.charAt(0).toUpperCase() + mockHealthData.systemHealth.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {mockHealthData.systemHealth.uptime}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockHealthData.systemHealth.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-neutral-500">
              {mockHealthData.systemHealth.failedRequests} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockHealthData.systemHealth.averageResponseTime}ms</div>
            <p className="text-xs text-neutral-500">
              Across all integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((mockHealthData.systemHealth.successfulRequests / mockHealthData.systemHealth.totalRequests) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-neutral-500">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Integration Status</h2>
        <div className="grid gap-4">
          {mockHealthData.integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-neutral-500">
                    Last checked: {integration.lastChecked.toLocaleTimeString()}
                  </div>
                </div>
                <CardDescription>
                  Uptime: {integration.uptime}% • Response: {integration.responseTime}ms • Error Rate: {integration.errorRate}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium text-neutral-400">24h Requests</div>
                    <div className="text-2xl font-bold">{integration.metrics.requests24h.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-400">24h Errors</div>
                    <div className="text-2xl font-bold text-red-500">{integration.metrics.errors24h}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-400">Avg Response</div>
                    <div className="text-2xl font-bold">{integration.metrics.avgResponseTime}ms</div>
                  </div>
                </div>

                {/* Incidents */}
                {integration.incidents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium text-neutral-400">Active Incidents</div>
                    {integration.incidents.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-md">
                        <div className="flex items-center gap-2">
                          {incident.severity === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium">{incident.title}</div>
                            <div className="text-xs text-neutral-500">{incident.description}</div>
                            <div className="text-xs text-neutral-400 mt-1">
                              {incident.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResolveIncident(incident.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comprehensive Health Monitor Component */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Detailed Health Monitor</h2>
        <Suspense fallback={
          <div className="h-64 bg-neutral-900 rounded-lg animate-pulse"></div>
        }>
          <IntegrationHealthMonitor
            integrations={mockHealthData.integrations.map(integration => ({
              id: integration.id,
              name: integration.name,
              category: 'system',
              description: `${integration.name} integration',
              icon: '/integrations/${integration.id}.svg',
              status: integration.status === 'healthy' ? 'connected' : 
                     integration.status === 'degraded' ? 'warning' : 'disconnected',
              isConnected: integration.status !== 'error',
              lastSync: integration.lastChecked,
              health: integration.status,
              metrics: {
                apiCalls: integration.metrics.requests24h,
                successRate: 100 - integration.errorRate,
                avgResponseTime: integration.metrics.avgResponseTime
              },
              config: Record<string, unknown>
            }))}
            systemHealth={mockHealthData.systemHealth}
            onRefresh={handleRefreshHealth}
            onViewDetails={(id) => console.log('Viewing details for:', id)}
            autoRefresh={true}
            refreshInterval={30000}
            className="w-full"
          />
        </Suspense>
      </div>
    </div>
  )
}