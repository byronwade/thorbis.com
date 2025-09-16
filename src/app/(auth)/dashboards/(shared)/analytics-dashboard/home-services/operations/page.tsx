"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Wrench,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Timer,
  Target,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Brain,
  Radar,
  MapPin,
  Cpu,
  Wifi,
  BarChart3,
  Thermometer,
  CloudRain,
  Navigation,
  Bot
} from 'lucide-react'

interface ServiceMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface JobStatus {
  status: string
  count: number
  percentage: number
  color: string
}

interface TechnicianMetric {
  id: string
  name: string
  activeJobs: number
  completedToday: number
  efficiency: number
  location: string
  status: 'active' | 'break' | 'transit' | 'offline'
  gpsCoordinates?: [number, number]
  estimatedArrival?: string
  skillsMatch?: number
}

interface AIInsight {
  id: string
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  action?: string
  timestamp: string
}

interface WeatherImpact {
  condition: string
  temperature: number
  humidity: number
  precipitation: number
  demandIncrease: number
  affectedServices: string[]
}

interface PredictiveMetric {
  id: string
  title: string
  currentValue: number
  predictedValue: number
  timeframe: string
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

const serviceMetrics: ServiceMetric[] = [
  {
    id: 'active-jobs',
    title: 'Active Service Jobs',
    value: 34,
    change: '+8%',
    trend: 'up',
    icon: Wrench,
    color: 'text-blue-400'
  },
  {
    id: 'technicians-field',
    title: 'Technicians in Field',
    value: 28,
    change: '+3',
    trend: 'up',
    icon: Users,
    color: 'text-green-400'
  },
  {
    id: 'avg-response',
    title: 'Avg Response Time',
    value: '23 min',
    change: '-5 min',
    trend: 'up',
    icon: Clock,
    color: 'text-orange-400'
  },
  {
    id: 'completion-rate',
    title: 'First-Call Resolution',
    value: '87%',
    change: '+4%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-emerald-400'
  },
  {
    id: 'daily-revenue',
    title: 'Daily Revenue',
    value: '$18,340',
    change: '+12%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-yellow-400'
  },
  {
    id: 'emergency-calls',
    title: 'Emergency Calls',
    value: 7,
    change: '+2',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-red-400'
  }
]

const jobStatuses: JobStatus[] = [
  { status: 'In Progress', count: 24, percentage: 45, color: 'bg-blue-500' },
  { status: 'Scheduled', count: 18, percentage: 34, color: 'bg-purple-500' },
  { status: 'En Route', count: 8, percentage: 15, color: 'bg-orange-500' },
  { status: 'Completed Today', count: 3, percentage: 6, color: 'bg-green-500' }
]

const technicianMetrics: TechnicianMetric[] = [
  {
    id: 'tech-1',
    name: 'Mike Rodriguez',
    activeJobs: 3,
    completedToday: 4,
    efficiency: 94,
    location: 'Downtown District',
    status: 'active'
  },
  {
    id: 'tech-2',
    name: 'Sarah Chen',
    activeJobs: 2,
    completedToday: 5,
    efficiency: 98,
    location: 'Westside Area',
    status: 'active'
  },
  {
    id: 'tech-3',
    name: 'James Wilson',
    activeJobs: 4,
    completedToday: 3,
    efficiency: 87,
    location: 'North Valley',
    status: 'transit'
  },
  {
    id: 'tech-4',
    name: 'Lisa Thompson',
    activeJobs: 1,
    completedToday: 6,
    efficiency: 96,
    location: 'East District',
    status: 'break'
  },
  {
    id: 'tech-5',
    name: 'David Kim',
    activeJobs: 2,
    completedToday: 4,
    efficiency: 91,
    location: 'South Region',
    status: 'active'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'break': return 'bg-yellow-500'
    case 'transit': return 'bg-blue-500'
    case 'offline': return 'bg-neutral-500'
    default: return 'bg-neutral-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Active'
    case 'break': return 'On Break'
    case 'transit': return 'En Route'
    case 'offline': return 'Offline'
    default: return 'Unknown'
  }
}

// Enhanced AI Insights and Predictive Analytics Data
const aiInsights: AIInsight[] = [
  {
    id: 'demand-surge',
    type: 'prediction',
    title: 'Demand Surge Predicted',
    description: 'Weather forecast indicates 40% increase in HVAC calls over next 48 hours due to heat wave',
    confidence: 87,
    impact: 'high',
    action: 'Schedule additional technicians',
    timestamp: new Date().toISOString()
  },
  {
    id: 'route-optimization',
    type: 'optimization',
    title: 'Route Optimization Available',
    description: 'Rearranging Mike Rodriguez\'s schedule could save 45 minutes travel time',
    confidence: 92,
    impact: 'medium',
    action: 'Apply route optimization',
    timestamp: new Date().toISOString()
  },
  {
    id: 'equipment-failure',
    type: 'alert',
    title: 'Equipment Failure Risk',
    description: 'Van #3 showing early failure indicators - maintenance recommended within 24 hours',
    confidence: 78,
    impact: 'high',
    action: 'Schedule maintenance',
    timestamp: new Date().toISOString()
  }
]

const weatherImpact: WeatherImpact = {
  condition: 'Heat Wave',
  temperature: 98,
  humidity: 65,
  precipitation: 0,
  demandIncrease: 42,
  affectedServices: ['HVAC Repair', 'AC Installation', 'Emergency Cooling']
}

const predictiveMetrics: PredictiveMetric[] = [
  {
    id: 'job-volume',
    title: 'Next Hour Job Volume',
    currentValue: 12,
    predictedValue: 18,
    timeframe: '1 hour',
    confidence: 89,
    trend: 'increasing'
  },
  {
    id: 'completion-rate',
    title: 'Today\'s Completion Rate',
    currentValue: 87,
    predictedValue: 92,
    timeframe: 'End of day',
    confidence: 84,
    trend: 'increasing'
  }
]

export default function ServiceOperationsPage() {
  const [realTimeData, setRealTimeData] = useState({
    activeJobs: 34,
    availableTechs: 12,
    avgResponseTime: 45,
    customerSatisfaction: 94.2
  })
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeJobs: prev.activeJobs + Math.floor(Math.random() * 3) - 1,
        availableTechs: Math.max(8, prev.availableTechs + Math.floor(Math.random() * 3) - 1),
        avgResponseTime: Math.max(30, prev.avgResponseTime + Math.floor(Math.random() * 10) - 5),
        customerSatisfaction: Math.min(100, Math.max(90, prev.customerSatisfaction + (Math.random() - 0.5) * 2))
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-100">Service Operations Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live Data</span>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-neutral-400">Real-time operations monitoring and AI-powered insights</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <span className="text-neutral-300">{weatherImpact.temperature}°F</span>
                <span className="text-orange-400">+{weatherImpact.demandIncrease}% demand</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-green-400">All systems online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">Today</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">This Week</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">This Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {serviceMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={cn("h-5 w-5", metric.color)} />
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    metric.trend === 'up' ? "bg-green-600/20 text-green-400" :
                    metric.trend === 'down' ? "bg-red-600/20 text-red-400" :
                    "bg-neutral-600/20 text-neutral-400"
                  )}
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
            </div>
          )
        })}
      </div>

      {/* AI Insights and Predictive Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Panel */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">AI Insights & Recommendations</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Cpu className="h-3 w-3 mr-1" />
              Live Analysis
            </Badge>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={cn(
                "p-3 rounded-lg border",
                insight.impact === 'high' ? "bg-red-600/10 border-red-600/20" :
                insight.impact === 'medium' ? "bg-orange-600/10 border-orange-600/20" :
                "bg-blue-600/10 border-blue-600/20"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        insight.type === 'prediction' ? "bg-purple-400" :
                        insight.type === 'optimization' ? "bg-blue-400" :
                        insight.type === 'alert' ? "bg-red-400" : "bg-green-400"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        insight.impact === 'high' ? "text-red-400" :
                        insight.impact === 'medium' ? "text-orange-400" :
                        "text-blue-400"
                      )}>
                        {insight.title}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mb-2">{insight.description}</div>
                    {insight.action && (
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {insight.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Metrics Panel */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Radar className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Predictive Analytics</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Bot className="h-3 w-3 mr-1" />
              Forecasting
            </Badge>
          </div>
          <div className="space-y-4">
            {predictiveMetrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">{metric.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Current: {metric.currentValue}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      metric.trend === 'increasing' ? "text-green-400" :
                      metric.trend === 'decreasing' ? "text-red-400" : "text-blue-400"
                    )}>
                      → {metric.predictedValue}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        metric.trend === 'increasing' ? "bg-green-500" :
                        metric.trend === 'decreasing' ? "bg-red-500" : "bg-blue-500"
                      )}
                      style={{ width: `${metric.confidence}%' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{metric.timeframe}</span>
                  <span>{metric.confidence}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Impact Analysis */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CloudRain className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-medium text-neutral-100">Weather Impact Analysis</h3>
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            Real-time
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Current Conditions</div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-400" />
              <span className="text-lg font-medium text-neutral-100">{weatherImpact.temperature}°F</span>
              <span className="text-sm text-neutral-400">{weatherImpact.condition}</span>
            </div>
            <div className="text-sm text-neutral-400">Humidity: {weatherImpact.humidity}%</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Demand Impact</div>
            <div className="text-2xl font-bold text-orange-400">+{weatherImpact.demandIncrease}%</div>
            <div className="text-sm text-neutral-400">Expected increase in service calls</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Affected Services</div>
            <div className="space-y-1">
              {weatherImpact.affectedServices.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-sm text-neutral-300">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Status Overview */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Job Status Overview</h3>
          </div>
          <div className="space-y-4">
            {jobStatuses.map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">{status.status}</span>
                  <span className="text-sm text-neutral-400">{status.count} jobs</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", status.color)}
                      style={{ width: '${status.percentage}%' }}
                    />
                  </div>
                  <span className="absolute right-0 -top-5 text-xs text-neutral-500">
                    {status.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Alerts - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Real-time Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-400">Emergency Call</div>
                  <div className="text-xs text-neutral-400 mt-1">Water leak at 123 Main St</div>
                  <div className="text-xs text-neutral-500 mt-1">2 min ago</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-400">Delayed Service</div>
                  <div className="text-xs text-neutral-400 mt-1">Tech running 15 min behind</div>
                  <div className="text-xs text-neutral-500 mt-1">5 min ago</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-400">High Priority Job</div>
                  <div className="text-xs text-neutral-400 mt-1">HVAC repair - Commercial client</div>
                  <div className="text-xs text-neutral-500 mt-1">8 min ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Indicators - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Performance Indicators</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Service Quality Score</span>
                <span className="text-sm font-medium text-green-400">4.8/5.0</span>
              </div>
              <Progress value={96} className="h-2 bg-neutral-800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">On-Time Performance</span>
                <span className="text-sm font-medium text-blue-400">91%</span>
              </div>
              <Progress value={91} className="h-2 bg-neutral-800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Customer Satisfaction</span>
                <span className="text-sm font-medium text-purple-400">94%</span>
              </div>
              <Progress value={94} className="h-2 bg-neutral-800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Resource Utilization</span>
                <span className="text-sm font-medium text-orange-400">87%</span>
              </div>
              <Progress value={87} className="h-2 bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Technician Performance Table - Data-Focused */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium text-neutral-100">Technician Performance - Live Status</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Technician</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Active Jobs</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Completed Today</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Efficiency</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Location</th>
                </tr>
              </thead>
              <tbody>
                {technicianMetrics.map((tech) => (
                  <tr key={tech.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-100">{tech.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(tech.status))} />
                        <span className="text-neutral-300">{getStatusText(tech.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{tech.activeJobs}</td>
                    <td className="py-3 px-4 text-neutral-300">{tech.completedToday}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          tech.efficiency >= 95 ? "text-green-400" :
                          tech.efficiency >= 90 ? "text-blue-400" :
                          tech.efficiency >= 85 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {tech.efficiency}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{tech.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}