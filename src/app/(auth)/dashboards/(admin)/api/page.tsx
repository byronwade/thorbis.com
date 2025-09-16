/**
 * API Dashboard - Main backend service management interface
 * 
 * This component provides an overview and management interface for all
 * API endpoints, services, and backend operations in the Thorbis platform.
 * 
 * Features:
 * - API endpoint monitoring and health checks
 * - Rate limiting and security analytics
 * - Performance metrics and response time tracking
 * - Authentication and authorization management
 * - Documentation and testing interface
 * 
 * Migrated from: apps/api/src/app/page.tsx
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  ArrowRight, 
  Activity,
  Shield,
  Zap,
  Globe,
  Database,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Server,
  Code,
  Lock,
  FileText,
  Webhook,
  BarChart3,
  Settings,
  Eye,
  Play
} from 'lucide-react'

// Mock API metrics data
const apiMetrics = [
  {
    title: 'Total Endpoints',
    value: '147',
    change: '+5',
    trend: 'up',
    icon: Globe,
    color: 'text-blue-500'
  },
  {
    title: 'Requests Today',
    value: '1.2M',
    change: '+15%',
    trend: 'up',
    icon: Activity,
    color: 'text-green-500'
  },
  {
    title: 'Avg Response Time',
    value: '89ms',
    change: '-12ms',
    trend: 'down',
    icon: Zap,
    color: 'text-yellow-500'
  },
  {
    title: 'Uptime',
    value: '99.9%',
    change: '+0.1%',
    trend: 'up',
    icon: Shield,
    color: 'text-purple-500'
  }
]

// API services and their status
const apiServices = [
  {
    name: 'AI Services API',
    endpoint: '/v1/ai/*',
    status: 'healthy',
    responseTime: '45ms',
    requests: '89.2K',
    uptime: 99.8,
    description: 'Machine learning and AI-powered services'
  },
  {
    name: 'Home Services API', 
    endpoint: '/v1/hs/*',
    status: 'healthy',
    responseTime: '67ms',
    requests: '156.4K',
    uptime: 99.9,
    description: 'Work orders, scheduling, and dispatch management'
  },
  {
    name: 'Public Business API',
    endpoint: '/v1/public/*',
    status: 'warning',
    responseTime: '234ms',
    requests: '45.1K',
    uptime: 98.7,
    description: 'Public-facing business directory endpoints'
  },
  {
    name: 'Context7 Integration',
    endpoint: '/context7/*',
    status: 'healthy',
    responseTime: '123ms',
    requests: '12.8K',
    uptime: 99.5,
    description: 'Documentation and library integration services'
  }
]

// Recent API activity
const recentActivity = [
  { type: 'deployment', message: 'New AI endpoints deployed successfully', time: '2 hours ago', status: 'success' },
  { type: 'alert', message: 'Rate limit threshold reached for public API', time: '4 hours ago', status: 'warning' },
  { type: 'security', message: 'Authentication middleware updated', time: '6 hours ago', status: 'success' },
  { type: 'performance', message: 'Database query optimization completed', time: '8 hours ago', status: 'success' },
]

const statusConfig = {
  healthy: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Healthy' },
  warning: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Warning' },
  error: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error' },
  maintenance: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Maintenance' }
}

export default function ApiDashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">API Management Dashboard</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Monitor and manage your backend services and API endpoints
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Secure
            </Badge>
          </div>
        </div>
      </section>

      {/* API Metrics */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apiMetrics.map((metric, index) => (
          <Card key={index} className="border hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">{metric.change}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <metric.icon className={'h-8 w-8 ${metric.color}'} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors duration-300">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                API Documentation
              </CardTitle>
              <CardDescription>View and manage API documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboards/api/docs">
                  View Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/15 transition-colors duration-300">
                  <Play className="h-6 w-6 text-green-500" />
                </div>
                API Testing
              </CardTitle>
              <CardDescription>Test endpoints and monitor responses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboards/api/testing">
                  Test APIs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/15 transition-colors duration-300">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
                Analytics
              </CardTitle>
              <CardDescription>View detailed API usage analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboards/api/analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors duration-300">
                  <Settings className="h-6 w-6 text-orange-500" />
                </div>
                Configuration
              </CardTitle>
              <CardDescription>Manage API settings and security</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboards/api/settings">
                  Manage Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Service Status */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Service Status</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboards/api/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {apiServices.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            statusConfig[service.status as keyof typeof statusConfig].bg,
                            statusConfig[service.status as keyof typeof statusConfig].color
                          )}
                        >
                          {statusConfig[service.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{service.endpoint}</span>
                        <span>Response: {service.responseTime}</span>
                        <span>Requests: {service.requests}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Uptime</span>
                      <Badge variant="outline">{service.uptime}%</Badge>
                    </div>
                    <Progress value={service.uptime} className="w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest API deployments and system events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", {
                  "bg-green-500": activity.status === 'success',
                  "bg-yellow-500": activity.status === 'warning',
                  "bg-red-500": activity.status === 'error'
                })}></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">34%</span>
              </div>
              <Progress value={34} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Health</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  Optimal
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Security Status</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  Secure
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alert */}
      <Alert className="border bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10 mt-1">
            <Server className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-xl mb-3">API Infrastructure Status</AlertTitle>
            <AlertDescription>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  All API services are operating normally. Recent optimizations have improved
                  response times by 15% and enhanced security protocols are active.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/dashboards/api/monitoring">
                      View Monitoring
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboards/api/docs">
                      API Documentation
                    </Link>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  )
}