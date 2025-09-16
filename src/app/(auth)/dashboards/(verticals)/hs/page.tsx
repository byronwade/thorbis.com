'use client'

import { useState } from 'react'
import { 
  Clock, 
  Users, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  TrendingUp, 
  Activity, 
  Zap, 
  Settings, 
  ArrowRight, 
  DollarSign, 
  BarChart3,
  Info
} from 'lucide-react'

// Import new Vercel-inspired minimalist components
import { VercelHeroSection } from '@/components/dashboard/VercelHeroSection'
import { VercelMetricCards } from '@/components/dashboard/VercelMetricCards'
import { VercelActivitySection } from '@/components/dashboard/VercelActivitySection'
import { VercelActionGrid } from '@/components/dashboard/VercelActionGrid'
import { useChartData } from '@/hooks/useChartData'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { AsyncErrorBoundary } from '@/components/error-boundary'
import Link from 'next/link'

// Placeholder components - these would be implemented separately
const MetricsGrid = ({ kpis, loading }: { kpis: unknown, loading: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Metrics grid content would go here */}
  </div>
)

const RevenueChart = ({ data, config, showTargetLine, targetValue, loading, error, className }: any) => (
  <div className={`bg-neutral-800 rounded p-4 ${className}`}>
    <div className="text-center text-neutral-400">Revenue Chart Placeholder</div>
  </div>
)

const VolumeChart = ({ data, config, colorScheme, loading, error, className }: any) => (
  <div className={`bg-neutral-800 rounded p-4 ${className}'}>
    <div className="text-center text-neutral-400">Volume Chart Placeholder</div>
  </div>
)

const MetricsChart = ({ data, config, metrics, compareMode, loading, error, className }: any) => (
  <div className={'bg-neutral-800 rounded p-4 ${className}'}>
    <div className="text-center text-neutral-400">Metrics Chart Placeholder</div>
  </div>
)

export default function HomePage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')
  const [isUsingSampleData] = useState(true)
  
  // Sample data
  const revenueData: unknown[] = []
  const volumeData: unknown[] = []
  const metricsData: unknown[] = []
  
  const handleTimeframeChange = (period: 'day' | 'week' | 'month') => {
    setTimeframe(period)
  }
  // Fetch real data using our custom hook
  const { kpis, charts, user, systemStatus, loading, error, refresh } = useChartData({
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const handleNewWorkOrder = () => {
    window.location.href = '/hs/work-orders/new';
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-925 border-b border-neutral-800">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                    Welcome back, {user ? user.name.split(' ')[0] : 'User'}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-base">
                  {user ? user.company : 'Home Services Dashboard'} • {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-400">
                    <Users className="w-4 h-4" />
                    <span>{systemStatus?.activeUsers || 12} active users</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                </Button>
                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                  <Link href="/dashboards/hs/dispatch" className="gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Emergency Dispatch
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboards/hs/work-orders" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    New Work Order
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* At a Glance - WordPress Style */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-750 px-6 py-4 border-b border-neutral-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    At a Glance
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {kpis?.totalRevenue ? '$${Math.round(kpis.totalRevenue / 1000)}K' : '$45K'}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">Revenue Today</div>
                      <div className="text-xs text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.3%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {kpis?.activeWorkOrders || 23}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">Active Jobs</div>
                      <div className="text-xs text-blue-400 mt-1 flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3" />
                        Live tracking
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {kpis?.completedToday || 18}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">Completed</div>
                      <div className="text-xs text-purple-400 mt-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        This week
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-400">
                        {kpis?.avgResponseTime || '35m'}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">Avg Response</div>
                      <div className="text-xs text-orange-400 mt-1 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        -13% vs last week
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Metrics Grid */}
              <MetricsGrid
                kpis={kpis}
                loading={loading}
              />

              {/* Thorbis Announcements - Enhanced */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-neutral-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      What's New at Thorbis
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All Updates
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-300 mb-1">AI-Powered Dispatch Optimization</h4>
                      <p className="text-sm text-neutral-300 mb-2">
                        New AI algorithms automatically optimize technician routing, reducing response times by 25%.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-400">2 days ago</span>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                          Learn More →
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="bg-green-600 p-2 rounded-lg flex-shrink-0">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-300 mb-1">Enhanced Mobile App</h4>
                      <p className="text-sm text-neutral-300 mb-2">
                        Updated mobile experience with offline capabilities and real-time sync.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-400">1 week ago</span>
                        <Button variant="ghost" size="sm" className="text-xs text-green-400 hover:text-green-300">
                          Download →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Quick Actions Widget */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-750 px-6 py-4 border-b border-neutral-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link 
                    href="/dashboards/hs/work-orders" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="bg-green-600/20 p-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-green-300">Create Work Order</div>
                      <div className="text-xs text-neutral-400">New service request</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-green-400" />
                  </Link>
                  
                  <Link 
                    href="/dashboards/hs/dispatch" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="bg-red-600/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-red-300">Emergency Dispatch</div>
                      <div className="text-xs text-neutral-400">Urgent assignments</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-red-400" />
                  </Link>
                  
                  <Link 
                    href="/dashboards/hs/estimates" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="bg-blue-600/20 p-2 rounded-lg">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-blue-300">New Estimate</div>
                      <div className="text-xs text-neutral-400">Create quote</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400" />
                  </Link>
                  
                  <Link 
                    href="/dashboards/hs/analytics" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="bg-purple-600/20 p-2 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-purple-300">View Analytics</div>
                      <div className="text-xs text-neutral-400">Detailed reports</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-purple-400" />
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-750 px-6 py-4 border-b border-neutral-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </h3>
                </div>
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Work Order #WO-2024-0834 completed</div>
                      <div className="text-xs text-neutral-400">Mike Johnson • Kitchen sink repair • 2 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">New estimate request received</div>
                      <div className="text-xs text-neutral-400">Sarah Wilson • HVAC installation • 8 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Technician en route</div>
                      <div className="text-xs text-neutral-400">Dave Miller • Electrical repair • 15 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Invoice #INV-2024-1205 paid</div>
                      <div className="text-xs text-neutral-400">John Davis • $245.00 • 32 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Emergency call assigned</div>
                      <div className="text-xs text-neutral-400">Lisa Brown • Water leak • 1 hour ago</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-neutral-700">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Activity
                  </Button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-750 px-6 py-4 border-b border-neutral-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Status
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-neutral-300">API Status</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-400">{systemStatus?.apiCalls || 245}/1000</div>
                      <div className="text-xs text-neutral-500">24.5% used</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-neutral-300">Active Users</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-400">{systemStatus?.activeUsers || 12}/25</div>
                      <div className="text-xs text-neutral-500">48% capacity</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-neutral-300">Uptime</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-400">99.9%</div>
                      <div className="text-xs text-neutral-500">30 days</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-neutral-700">
                    <div className="text-xs text-neutral-500 text-center">
                      Last sync: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              {/* Business Analytics Section - Enhanced */}
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-750 px-6 py-4 border-b border-neutral-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Business Analytics
                      {isUsingSampleData && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                          Demo Data
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-600 rounded-lg p-1">
                      {(['day', 'week', 'month'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => handleTimeframeChange(period)}
                          className={'px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            timeframe === period
                              ? 'bg-blue-600 text-white'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                          }'}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 mt-2">
                    Track your revenue trends, work order volumes, and key performance metrics
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-neutral-900/50 border border-neutral-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-white">Revenue Trends</h3>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-neutral-500 hover:text-neutral-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                Daily revenue tracking with target line. Monitor performance against your revenue goals.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {kpis && (
                          <div className="text-xs text-neutral-400">
                            Target: ${Math.round(kpis.weeklyRevenue / 7 * 1.2).toLocaleString()}/day
                          </div>
                        )}
                      </div>
                      <AsyncErrorBoundary componentName="Revenue Chart">
                        <RevenueChart
                          data={revenueData}
                          config={{
                            timeframe,
                            showLegend: true,
                            showCrosshair: true,
                            enableZoom: true
                          }}
                          showTargetLine={true}
                          targetValue={kpis ? Math.round(kpis.weeklyRevenue / 7 * 1.2) : 6000}
                          loading={loading && revenueData.length === 0}
                          error={null}
                          className="h-[300px]"
                        />
                      </AsyncErrorBoundary>
                    </div>

                    {/* Work Order Volume Chart */}
                    <div className="bg-neutral-900/50 border border-neutral-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-white">Work Order Volume</h3>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-neutral-500 hover:text-neutral-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                Daily work order count trends for capacity planning and resource allocation.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Daily distribution
                        </div>
                      </div>
                      <AsyncErrorBoundary componentName="Volume Chart">
                        <VolumeChart
                          data={volumeData}
                          config={{
                            timeframe,
                            showLegend: true,
                            showCrosshair: true,
                            enableZoom: true
                          }}
                          colorScheme="default"
                          loading={loading && volumeData.length === 0}
                          error={null}
                          className="h-[300px]"
                        />
                      </AsyncErrorBoundary>
                    </div>
                  </div>

                  {/* Performance Metrics Chart - Full Width */}
                  <div className="bg-neutral-900/50 border border-neutral-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-white">Performance Metrics</h3>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-neutral-500 hover:text-neutral-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm max-w-xs">
                              Compare key performance indicators and identify trends across metrics.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-neutral-400">
                        Response time, Customer satisfaction, Completion rate
                      </div>
                    </div>
                    <AsyncErrorBoundary componentName="Metrics Chart">
                      <MetricsChart
                        data={metricsData}
                        config={{
                          timeframe,
                          showLegend: true,
                          showCrosshair: true,
                          enableZoom: true
                        }}
                        metrics={['Response Time', 'Satisfaction', 'Completion Rate']}
                        compareMode={true}
                        loading={loading && metricsData.length === 0}
                        error={null}
                        className="h-[250px]"
                      />
                    </AsyncErrorBoundary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}