import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  User as Users,
  Calendar,
  Clock,
  MapPin,
  Star,
  Target,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  Building,
  UserCheck,
  Timer,
  Wrench,
  FileText,
  Phone
} from 'lucide-react'


interface AnalyticsMetric {
  label: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ChartData {
  period: string
  revenue: number
  jobs: number
  customers: number
  efficiency: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      // Generate comprehensive analytics data
      const mockMetrics: AnalyticsMetric[] = [
        {
          label: 'Total Revenue',
          value: '$847,290',
          change: { value: 12.5, direction: 'up', period: '30d' },
          icon: DollarSign,
          color: 'text-green-400'
        },
        {
          label: 'Jobs Completed',
          value: '1,247',
          change: { value: 8.2, direction: 'up', period: '30d' },
          icon: CheckCircle,
          color: 'text-blue-400'
        },
        {
          label: 'Active Customers',
          value: '892',
          change: { value: 15.3, direction: 'up', period: '30d' },
          icon: Users,
          color: 'text-purple-400'
        },
        {
          label: 'Avg Response Time',
          value: '18 min',
          change: { value: 5.1, direction: 'down', period: '30d' },
          icon: Clock,
          color: 'text-orange-400'
        },
        {
          label: 'Technician Efficiency',
          value: '94.2%',
          change: { value: 3.7, direction: 'up', period: '30d' },
          icon: Activity,
          color: 'text-cyan-400'
        },
        {
          label: 'Customer Rating',
          value: '4.8/5',
          change: { value: 2.1, direction: 'up', period: '30d' },
          icon: Star,
          color: 'text-yellow-400'
        },
        {
          label: 'First-Time Fix Rate',
          value: '87.3%',
          change: { value: 4.2, direction: 'up', period: '30d' },
          icon: Target,
          color: 'text-emerald-400'
        },
        {
          label: 'Outstanding Invoices',
          value: '$142,580',
          change: { value: 8.9, direction: 'down', period: '30d' },
          icon: FileText,
          color: 'text-red-400'
        }
      ]

      // Generate chart data for the last 30 days
      const mockChartData: ChartData[] = Array.from({ length: 30 }, (_, i) => ({
        period: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 15000,
        jobs: Math.floor(Math.random() * 80) + 20,
        customers: Math.floor(Math.random() * 30) + 10,
        efficiency: Math.floor(Math.random() * 20) + 80
      }))

      setMetrics(mockMetrics)
      setChartData(mockChartData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const departmentMetrics = [
    {
      department: 'HVAC',
      revenue: '$324,580',
      jobs: 487,
      avgValue: '$667',
      efficiency: '92.1%',
      rating: 4.9,
      technicians: 8
    },
    {
      department: 'Plumbing',
      revenue: '$298,745',
      jobs: 623,
      avgValue: '$479',
      efficiency: '94.8%',
      rating: 4.7,
      technicians: 6
    },
    {
      department: 'Electrical',
      revenue: '$187,320',
      jobs: 312,
      avgValue: '$600',
      efficiency: '88.3%',
      rating: 4.8,
      technicians: 5
    },
    {
      department: 'Appliance',
      revenue: '$156,890',
      jobs: 234,
      avgValue: '$671',
      efficiency: '96.2%',
      rating: 4.6,
      technicians: 4
    }
  ]

  const topPerformers = [
    {
      name: 'Mike Rodriguez',
      department: 'HVAC',
      jobs: 87,
      revenue: '$42,580',
      rating: 4.9,
      efficiency: '97.2%'
    },
    {
      name: 'Sarah Johnson',
      department: 'Plumbing',
      jobs: 92,
      revenue: '$38,940',
      rating: 4.8,
      efficiency: '96.1%'
    },
    {
      name: 'David Chen',
      department: 'Electrical',
      jobs: 78,
      revenue: '$41,230',
      rating: 4.9,
      efficiency: '94.7%'
    },
    {
      name: 'Amy Williams',
      department: 'Appliance',
      jobs: 65,
      revenue: '$39,870',
      rating: 4.7,
      efficiency: '98.3%'
    }
  ]

  const alerts = [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'High Call Volume',
      message: 'Call volume is 40% above normal for this time period',
      priority: 'medium'
    },
    {
      id: 'alert-2',
      type: 'error',
      title: 'Low Inventory Alert',
      message: '15 items are below minimum stock levels',
      priority: 'high'
    },
    {
      id: 'alert-3',
      type: 'info',
      title: 'Seasonal Trend',
      message: 'HVAC service requests increasing by 25% week-over-week',
      priority: 'low'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Analytics & Reporting</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Executive dashboard with KPIs, performance metrics, and business intelligence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={timeframe === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('7d')}
                  className="text-xs"
                >
                  7D
                </Button>
                <Button
                  variant={timeframe === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('30d')}
                  className="text-xs"
                >
                  30D
                </Button>
                <Button
                  variant={timeframe === '90d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('90d')}
                  className="text-xs"
                >
                  90D
                </Button>
                <Button
                  variant={timeframe === '1y' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('1y')}
                  className="text-xs"
                >
                  1Y
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={'p-2 rounded-lg bg-neutral-800 ${metric.color}'}>
                  <metric.icon className="h-6 w-6" />
                </div>
                {metric.change && (
                  <div className={'flex items-center text-sm ${
                    metric.change.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }'}>'
                    {metric.change.direction === 'up' ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {metric.change.value}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                <p className="text-sm text-neutral-400">{metric.label}</p>
                {metric.change && (
                  <p className="text-xs text-neutral-500">vs {metric.change.period}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Revenue chart visualization</p>
                <p className="text-xs text-neutral-500 mt-1">
                  ${chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} total
                </p>
              </div>
            </div>
          </div>

          {/* Jobs Performance Chart Placeholder */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Job Completion Rate</h3>
              <PieChart className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Job performance breakdown</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {chartData.reduce((sum, d) => sum + d.jobs, 0)} jobs completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Department Performance</h3>
            <Building className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Department</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Jobs</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Value</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Efficiency</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Rating</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-300">Technicians</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map((dept, index) => (
                  <tr key={index} className="border-b border-neutral-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={'h-3 w-3 rounded-full mr-3 ${
                          dept.department === 'HVAC' ? 'bg-blue-500' :
                          dept.department === 'Plumbing' ? 'bg-cyan-500' :
                          dept.department === 'Electrical' ? 'bg-yellow-500' : 'bg-green-500`
              }'}></div>'
                        <span className="text-white font-medium">{dept.department}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-white">{dept.revenue}</td>
                    <td className="py-4 px-4 text-right text-neutral-300">{dept.jobs}</td>
                    <td className="py-4 px-4 text-right text-neutral-300">{dept.avgValue}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={'${
                        parseFloat(dept.efficiency) > 90 ? 'text-green-400' : 
                        parseFloat(dept.efficiency) > 80 ? 'text-yellow-400' : 'text-red-400'
              }'}>'
                        {dept.efficiency}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-white">{dept.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-neutral-300">{dept.technicians}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row: Top Performers & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Top Performers</h3>
              <UserCheck className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                      {performer.name.split(' ').map(n => n[0]).join(')}
                    </div>
                    <div>
                      <div className="text-white font-medium">{performer.name}</div>
                      <div className="text-sm text-neutral-400">{performer.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{performer.revenue}</div>
                    <div className="text-sm text-neutral-400">{performer.jobs} jobs</div>
                    <div className="text-xs text-green-400">{performer.efficiency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">System Alerts</h3>
              <AlertCircle className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={'p-4 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-900/20 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' : 'bg-blue-900/20 border-blue-500`
              }'}>'
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={'font-medium ${
                        alert.type === 'error' ? 'text-red-400' :
                        alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400`
              }'}>'
                        {alert.title}
                      </div>
                      <div className="text-sm text-neutral-300 mt-1">{alert.message}</div>
                    </div>
                    <div className={'px-2 py-1 rounded text-xs font-medium ${
                      alert.priority === 'high' ? 'bg-red-800 text-red-200' :
                      alert.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' : 'bg-blue-800 text-blue-200'
              }'}>'
                      {alert.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}