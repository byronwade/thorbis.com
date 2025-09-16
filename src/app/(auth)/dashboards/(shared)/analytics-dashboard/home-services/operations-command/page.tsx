"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { TimeFrameControls, TimeRange } from '@/components/analytics/controls/time-frame-controls'
import { cn } from '@/lib/utils'
import {
  Command,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
  Bot,
  LineChart,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Star,
  Calendar,
  Cpu,
  Radar,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Building,
  Calculator,
  Award,
  Briefcase,
  Phone,
  Mail,
  Package,
  Truck,
  Wrench,
  MapPin,
  Shield,
  Eye,
  Network,
  Database,
  Layers,
  Satellite,
  Radio,
  Rss,
  Wifi,
  Monitor,
  Server,
  HardDrive,
  Cpu as ProcessorIcon,
  MemoryStick,
  Thermometer,
  Battery,
  Power,
  Signal,
  AlertCircle,
  XCircle,
  Gauge,
  Timer,
  Navigation,
  Route,
  Car,
  Headphones,
  MessageSquare,
  Bell,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Crosshair,
  Focus
} from 'lucide-react'

interface OperationalMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  status: 'critical' | 'warning' | 'good' | 'excellent'
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  last_updated: string
  threshold: number
  current_percentage: number
}

interface LiveAlert {
  id: string
  type: 'emergency' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  location?: string
  technician?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  auto_dismiss: boolean
  actions?: string[]
}

interface TechnicianStatus {
  id: string
  name: string
  status: 'active' | 'break' | 'transit' | 'offline'
  current_job: string | null
  location: { lat: number; lng: number; address: string }
  efficiency: number
  jobs_today: number
  hours_worked: number
  next_job_eta: string | null
  last_update: string
  skills: string[]
  rating: number
}

interface SystemStatus {
  component: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: number
  response_time: number
  last_incident: string
  performance_score: number
  icon: React.ComponentType<{ className?: string }>
}

interface LiveJob {
  id: string
  customer: string
  address: string
  service_type: string
  priority: 'emergency' | 'urgent' | 'standard'
  status: 'dispatched' | 'in_progress' | 'completed' | 'delayed'
  technician: string
  start_time: string
  estimated_completion: string
  value: number
  progress: number
}

const operationalMetrics: OperationalMetric[] = [
  {
    id: 'active-jobs',
    title: 'Active Service Jobs',
    value: 47,
    change: '+12%',
    trend: 'up',
    status: 'good',
    icon: Activity,
    color: 'text-blue-400',
    description: 'Currently active service calls in progress',
    last_updated: '30 seconds ago',
    threshold: 60,
    current_percentage: 78
  },
  {
    id: 'technician-utilization',
    title: 'Technician Utilization',
    value: '87.2%',
    change: '+3.4%',
    trend: 'up',
    status: 'excellent',
    icon: Users,
    color: 'text-green-400',
    description: 'Current workforce utilization rate',
    last_updated: '1 minute ago',
    threshold: 90,
    current_percentage: 87
  },
  {
    id: 'response-time',
    title: 'Avg Response Time',
    value: '18 min',
    change: '-2 min',
    trend: 'up',
    status: 'excellent',
    icon: Clock,
    color: 'text-purple-400',
    description: 'Average emergency response time',
    last_updated: '45 seconds ago',
    threshold: 30,
    current_percentage: 40
  },
  {
    id: 'revenue-rate',
    title: 'Hourly Revenue Rate',
    value: '$3,240',
    change: '+15.7%',
    trend: 'up',
    status: 'excellent',
    icon: DollarSign,
    color: 'text-yellow-400',
    description: 'Current hourly revenue generation',
    last_updated: '2 minutes ago',
    threshold: 4000,
    current_percentage: 81
  },
  {
    id: 'customer-satisfaction',
    title: 'Real-time Satisfaction',
    value: '4.8/5.0',
    change: '+0.1',
    trend: 'up',
    status: 'excellent',
    icon: Star,
    color: 'text-orange-400',
    description: 'Live customer satisfaction score',
    last_updated: '3 minutes ago',
    threshold: 5.0,
    current_percentage: 96
  },
  {
    id: 'system-health',
    title: 'System Performance',
    value: '99.2%',
    change: '-0.1%',
    trend: 'down',
    status: 'good',
    icon: Server,
    color: 'text-cyan-400',
    description: 'Overall system health and uptime',
    last_updated: '15 seconds ago',
    threshold: 100,
    current_percentage: 99
  }
]

const liveAlerts: LiveAlert[] = [
  {
    id: 'emergency-001',
    type: 'emergency',
    title: 'Emergency Service Request',
    message: 'HVAC system failure at Mercy Hospital - Critical infrastructure',
    timestamp: '2 minutes ago',
    location: '1234 Medical Center Dr',
    technician: 'Mike Rodriguez (Level 3)',
    priority: 'critical',
    auto_dismiss: false,
    actions: ['Dispatch Additional Team', 'Escalate to Manager', 'Contact Customer']
  },
  {
    id: 'warning-002',
    type: 'warning',
    title: 'Technician Delayed',
    message: 'John Smith running 25 minutes behind schedule due to traffic',
    timestamp: '5 minutes ago',
    location: 'Route to 5678 Oak Street',
    technician: 'John Smith',
    priority: 'medium',
    auto_dismiss: true,
    actions: ['Notify Customer', 'Reassign Job', 'Optimize Route']
  },
  {
    id: 'info-003',
    type: 'info',
    title: 'High-Value Customer',
    message: 'Premium customer Sarah Johnson has requested service - Lifetime value $45K',
    timestamp: '8 minutes ago',
    location: '9012 Executive Blvd',
    priority: 'high',
    auto_dismiss: false,
    actions: ['Assign Top Technician', 'Send Courtesy Call', 'Expedite Service']
  },
  {
    id: 'success-004',
    type: 'success',
    title: 'Job Completed Early',
    message: 'HVAC installation completed 45 minutes ahead of schedule',
    timestamp: '12 minutes ago',
    technician: 'Carlos Martinez',
    priority: 'low',
    auto_dismiss: true,
    actions: ['Customer Feedback', 'Next Job Assignment']
  }
]

const technicianStatus: TechnicianStatus[] = [
  {
    id: 'tech-001',
    name: 'Mike Rodriguez',
    status: 'active',
    current_job: 'Emergency HVAC Repair - Mercy Hospital',
    location: { lat: 40.7128, lng: -74.0060, address: '1234 Medical Center Dr' },
    efficiency: 94.2,
    jobs_today: 6,
    hours_worked: 7.5,
    next_job_eta: '2:30 PM',
    last_update: '30 seconds ago',
    skills: ['HVAC', 'Emergency Response', 'Commercial'],
    rating: 4.9
  },
  {
    id: 'tech-002',
    name: 'Sarah Chen',
    status: 'transit',
    current_job: null,
    location: { lat: 40.7589, lng: -73.9851, address: 'En route to 5678 Pine St' },
    efficiency: 88.7,
    jobs_today: 4,
    hours_worked: 6.2,
    next_job_eta: '1:45 PM',
    last_update: '1 minute ago',
    skills: ['Plumbing', 'Electrical', 'Residential'],
    rating: 4.7
  },
  {
    id: 'tech-003',
    name: 'John Smith',
    status: 'active',
    current_job: 'Electrical Panel Upgrade',
    location: { lat: 40.7505, lng: -73.9934, address: '9012 Residential Ave' },
    efficiency: 92.1,
    jobs_today: 5,
    hours_worked: 7.8,
    next_job_eta: '3:15 PM',
    last_update: '45 seconds ago',
    skills: ['Electrical', 'Smart Home', 'Troubleshooting'],
    rating: 4.8
  },
  {
    id: 'tech-004',
    name: 'Emma Davis',
    status: 'break',
    current_job: null,
    location: { lat: 40.7282, lng: -73.7949, address: 'Office - Lunch Break' },
    efficiency: 91.5,
    jobs_today: 3,
    hours_worked: 4.5,
    next_job_eta: '2:00 PM',
    last_update: '3 minutes ago',
    skills: ['HVAC', 'Refrigeration', 'Maintenance'],
    rating: 4.6
  }
]

const systemStatus: SystemStatus[] = [
  {
    component: 'Dispatch System',
    status: 'operational',
    uptime: 99.8,
    response_time: 45,
    last_incident: '3 days ago',
    performance_score: 98.5,
    icon: Radio
  },
  {
    component: 'GPS Tracking',
    status: 'operational',
    uptime: 99.9,
    response_time: 12,
    last_incident: '1 week ago',
    performance_score: 99.2,
    icon: Satellite
  },
  {
    component: 'Customer Portal',
    status: 'operational',
    uptime: 99.6,
    response_time: 234,
    last_incident: '2 days ago',
    performance_score: 97.8,
    icon: Globe
  },
  {
    component: 'Payment Processing',
    status: 'degraded',
    uptime: 98.2,
    response_time: 1240,
    last_incident: '2 hours ago',
    performance_score: 94.1,
    icon: DollarSign
  }
]

const liveJobs: LiveJob[] = [
  {
    id: 'job-001',
    customer: 'Mercy Hospital',
    address: '1234 Medical Center Dr',
    service_type: 'Emergency HVAC Repair',
    priority: 'emergency',
    status: 'in_progress',
    technician: 'Mike Rodriguez',
    start_time: '11:30 AM',
    estimated_completion: '2:30 PM',
    value: 2850,
    progress: 65
  },
  {
    id: 'job-002',
    customer: 'Johnson Residence',
    address: '5678 Pine Street',
    service_type: 'Plumbing Inspection',
    priority: 'standard',
    status: 'dispatched',
    technician: 'Sarah Chen',
    start_time: '1:45 PM',
    estimated_completion: '3:15 PM',
    value: 185,
    progress: 0
  },
  {
    id: 'job-003',
    customer: 'TechCorp Office',
    address: '9012 Business Blvd',
    service_type: 'Electrical Panel Upgrade',
    priority: 'urgent',
    status: 'in_progress',
    technician: 'John Smith',
    start_time: '12:00 PM',
    estimated_completion: '4:00 PM',
    value: 1540,
    progress: 45
  },
  {
    id: 'job-004',
    customer: 'Davis Family',
    address: '3456 Oak Avenue',
    service_type: 'HVAC Maintenance',
    priority: 'standard',
    status: 'completed',
    technician: 'Emma Davis',
    start_time: '9:00 AM',
    estimated_completion: '11:00 AM',
    value: 295,
    progress: 100
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export default function OperationsCommandPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [liveMetricsChart, setLiveMetricsChart] = useState<TradingViewChartData[]>([])
  const [responseTimeChart, setResponseTimeChart] = useState<TradingViewChartData[]>([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [alertsMinimized, setAlertsMinimized] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)
  const metricsRef = useRef<TradingViewWrapperRef>(null)
  const responseRef = useRef<TradingViewWrapperRef>(null)

  // Generate real-time operations chart data
  useEffect(() => {
    const generateLiveMetricsChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const baseMetric = 85
      
      for (let i = 0; i < 1440; i += 10) { // Every 10 minutes for 24 hours
        const time = new Date(startTime.getTime() + i * 60 * 1000)
        
        // Simulate business hour patterns and real-time fluctuations
        const hour = time.getHours()
        const businessHoursFactor = hour >= 8 && hour <= 18 ? 1.2 : 0.6
        const lunchDip = hour === 12 ? 0.85 : 1.0
        const realTimeVariation = 0.95 + Math.random() * 0.1
        const demandSpike = Math.random() > 0.95 ? 1.3 : 1.0 // Random demand spikes
        
        const minuteMetric = baseMetric * businessHoursFactor * lunchDip * realTimeVariation * demandSpike
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(40, Math.min(100, minuteMetric)),
        })
      }
      
      return data
    }

    const generateResponseTimeChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const baseTime = 22 // Base response time in minutes
      
      for (let i = 0; i < 1440; i += 15) { // Every 15 minutes for 24 hours
        const time = new Date(startTime.getTime() + i * 60 * 1000)
        
        // Simulate response time patterns
        const hour = time.getHours()
        const rushHourPenalty = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.4 : 1.0
        const nightBonus = hour >= 22 || hour <= 6 ? 0.7 : 1.0
        const trafficVariation = 0.8 + Math.random() * 0.4
        const emergencyImpact = Math.random() > 0.9 ? 1.8 : 1.0 // Random emergency impacts
        
        const minuteResponseTime = baseTime * rushHourPenalty * nightBonus * trafficVariation * emergencyImpact
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(8, Math.min(45, minuteResponseTime)),
        })
      }
      
      return data
    }

    const updateCharts = () => {
      setLiveMetricsChart(generateLiveMetricsChart())
      setResponseTimeChart(generateResponseTimeChart())
    }

    updateCharts()
    
    // Update charts every 30 seconds for real-time effect
    const interval = setInterval(updateCharts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Command className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Real-time Operations Command Center</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Monitor className="h-3 w-3 mr-1" />
                Mission Critical
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Real-time monitoring and control of field operations, technicians, and system performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={isLiveMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={isLiveMode ? "bg-red-600 hover:bg-red-700" : "border-neutral-700"}
          >
            {isLiveMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLiveMode ? 'Pause Live' : 'Resume Live'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Command View
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">Operations Overview</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Technician Focus</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Emergency Response</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">System Monitoring</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Live Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {operationalMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <Icon className={cn("h-5 w-5", metric.color)} />
                <div className="flex items-center gap-1">
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
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    metric.status === 'excellent' ? "bg-green-500" :
                    metric.status === 'good' ? "bg-blue-500" :
                    metric.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                  )} />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Performance</span>
                  <span className={cn(
                    "font-medium",
                    metric.status === 'excellent' ? "text-green-400" :
                    metric.status === 'good' ? "text-blue-400" :
                    metric.status === 'warning' ? "text-yellow-400" : "text-red-400"
                  )}>{metric.current_percentage}%</span>
                </div>
                <div className="relative">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        metric.status === 'excellent' ? "bg-green-500" :
                        metric.status === 'good' ? "bg-blue-500" :
                        metric.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: '${metric.current_percentage}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">Updated: {metric.last_updated}</div>
              </div>
              {isLiveMode && (
                <div className="absolute top-2 right-2">
                  <Rss className="h-3 w-3 text-red-400 animate-pulse" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Live Alerts & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Alerts */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-medium text-neutral-100">Live Alerts & Notifications</h3>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                {liveAlerts.filter(alert => !alert.auto_dismiss).length} Active
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAlertsMinimized(!alertsMinimized)}
              className="border-neutral-700"
            >
              {alertsMinimized ? <Maximize2 className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          {!alertsMinimized && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {liveAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    "p-4 rounded-lg border flex items-start gap-3",
                    alert.type === 'emergency' ? "bg-red-600/10 border-red-600/20" :
                    alert.type === 'warning' ? "bg-orange-600/10 border-orange-600/20" :
                    alert.type === 'info' ? "bg-blue-600/10 border-blue-600/20" :
                    "bg-green-600/10 border-green-600/20"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                    alert.type === 'emergency' ? "bg-red-500 animate-pulse" :
                    alert.type === 'warning' ? "bg-orange-500" :
                    alert.type === 'info' ? "bg-blue-500" :
                    "bg-green-500"
                  )} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-neutral-200">{alert.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            alert.priority === 'critical' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                            alert.priority === 'high' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                            alert.priority === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                            "bg-green-600/20 text-green-400 border-green-600/30"
                          )}
                        >
                          {alert.priority}
                        </Badge>
                        <span className="text-xs text-neutral-500">{alert.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-400">{alert.message}</p>
                    {alert.location && (
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </div>
                    )}
                    {alert.technician && (
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {alert.technician}
                      </div>
                    )}
                    {alert.actions && (
                      <div className="flex gap-2 pt-2">
                        {alert.actions.slice(0, 2).map((action, index) => (
                          <Button key={index} variant="outline" size="sm" className="text-xs h-7 border-neutral-700">
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-neutral-100">System Status</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Operational
            </Badge>
          </div>
          <div className="space-y-4">
            {systemStatus.map((system) => {
              const Icon = system.icon
              return (
                <div key={system.component} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn(
                        "h-4 w-4",
                        system.status === 'operational' ? "text-green-400" :
                        system.status === 'degraded' ? "text-yellow-400" : "text-red-400"
                      )} />
                      <span className="font-medium text-neutral-200">{system.component}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        system.status === 'operational' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                        system.status === 'degraded' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                        "bg-red-600/20 text-red-400 border-red-600/30"
                      )}
                    >
                      {system.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Uptime:</span>
                      <span className="text-neutral-300 ml-1">{system.uptime}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Response:</span>
                      <span className="text-neutral-300 ml-1">{system.response_time}ms</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300",
                          system.status === 'operational' ? "bg-green-500" :
                          system.status === 'degraded' ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: '${system.performance_score}%' }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">
                    Last incident: {system.last_incident}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Metrics Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Live Operations Metrics</h3>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Real-time
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-80">
            <TradingViewWrapper
              ref={metricsRef}
              data={liveMetricsChart}
              type="area"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live Stream</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Update: 30s intervals</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => metricsRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-neutral-100">Response Time Tracking</h3>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Performance
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-80">
            <TradingViewWrapper
              ref={responseRef}
              data={responseTimeChart}
              type="line"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Target: <25 min</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => responseRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Technician Status & Live Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Technicians */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Active Technicians</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              {technicianStatus.filter(t => t.status === 'active').length} Active
            </Badge>
          </div>
          <div className="space-y-4">
            {technicianStatus.map((tech) => (
              <div 
                key={tech.id} 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all",
                  selectedTechnician === tech.id ? "bg-blue-600/20 border-blue-600/40" : "bg-neutral-800/30 border-neutral-700/50",
                  "hover:bg-neutral-800/50"
                )}
                onClick={() => setSelectedTechnician(selectedTechnician === tech.id ? null : tech.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      tech.status === 'active' ? "bg-green-500 animate-pulse" :
                      tech.status === 'transit' ? "bg-yellow-500" :
                      tech.status === 'break' ? "bg-orange-500" : "bg-neutral-500"
                    )} />
                    <span className="font-medium text-neutral-200">{tech.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-neutral-400">{tech.rating}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs capitalize",
                      tech.status === 'active' ? "bg-green-600/20 text-green-400" :
                      tech.status === 'transit' ? "bg-yellow-600/20 text-yellow-400" :
                      tech.status === 'break' ? "bg-orange-600/20 text-orange-400" :
                      "bg-neutral-600/20 text-neutral-400"
                    )}
                  >
                    {tech.status}
                  </Badge>
                </div>
                
                {tech.current_job && (
                  <div className="text-sm text-neutral-300 mb-2">
                    Current: {tech.current_job}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                  <div>
                    <div className="text-neutral-500">Efficiency</div>
                    <div className="font-medium text-neutral-200">{tech.efficiency}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Jobs Today</div>
                    <div className="font-medium text-neutral-200">{tech.jobs_today}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Hours</div>
                    <div className="font-medium text-neutral-200">{tech.hours_worked}h</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {tech.location.address}
                  </div>
                  <span>Updated: {tech.last_update}</span>
                </div>
                
                {selectedTechnician === tech.id && (
                  <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2">
                    <div className="text-sm">
                      <span className="text-neutral-500">Skills: </span>
                      <span className="text-neutral-300">{tech.skills.join(', ')}</span>
                    </div>
                    {tech.next_job_eta && (
                      <div className="text-sm">
                        <span className="text-neutral-500">Next Job ETA: </span>
                        <span className="text-neutral-300">{tech.next_job_eta}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="text-xs h-7 border-neutral-700">
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 border-neutral-700">
                        Reassign
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 border-neutral-700">
                        Track
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Jobs */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Live Jobs</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {liveJobs.filter(job => job.status !== 'completed').length} Active
            </Badge>
          </div>
          <div className="space-y-4">
            {liveJobs.map((job) => (
              <div key={job.id} className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      job.priority === 'emergency' ? "bg-red-500 animate-pulse" :
                      job.priority === 'urgent' ? "bg-orange-500" : "bg-blue-500"
                    )} />
                    <span className="font-medium text-neutral-200">{job.customer}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      job.status === 'completed' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                      job.status === 'in_progress' ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                      job.status === 'dispatched' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                      "bg-red-600/20 text-red-400 border-red-600/30"
                    )}
                  >
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="text-sm text-neutral-300">{job.service_type}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.address}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Technician</div>
                    <div className="font-medium text-neutral-200">{job.technician}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Value</div>
                    <div className="font-medium text-green-400">{formatCurrency(job.value)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Started</div>
                    <div className="font-medium text-neutral-200">{job.start_time}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">ETA</div>
                    <div className="font-medium text-neutral-200">{job.estimated_completion}</div>
                  </div>
                </div>
                
                {job.status !== 'completed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Progress</span>
                      <span className="text-neutral-300">{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2 bg-neutral-800" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}