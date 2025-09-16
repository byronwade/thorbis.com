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
  Radar,
  MapPin,
  Navigation,
  Users,
  Truck,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Battery,
  Wifi,
  Satellite,
  Activity,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Timer,
  DollarSign,
  Settings,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Brain,
  Bot,
  Shield,
  Thermometer,
  Fuel,
  Route,
  Star,
  LineChart,
  BarChart3,
  PieChart,
  RefreshCw,
  Send,
  MessageSquare,
  Eye,
  Compass,
  Calculator
} from 'lucide-react'

interface FieldMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'normal' | 'warning' | 'critical'
}

interface FieldTechnician {
  id: string
  name: string
  status: 'available' | 'en-route' | 'on-job' | 'break' | 'offline'
  location: {
    lat: number
    lng: number
    address: string
    zone: string
  }
  currentJob?: {
    id: string
    customer: string
    type: string
    priority: 'emergency' | 'urgent' | 'standard'
    eta: string
    duration: number
  }
  nextJob?: {
    id: string
    customer: string
    scheduledTime: string
    travelTime: number
  }
  vehicle: {
    id: string
    type: string
    fuelLevel: number
    batteryLevel?: number
    lastMaintenance: string
    mileage: number
  }
  performance: {
    jobsToday: number
    efficiency: number
    customerRating: number
    onTimeRate: number
  }
  equipment: string[]
  certifications: string[]
}

interface EmergencyJob {
  id: string
  customer: string
  address: string
  phone: string
  type: string
  description: string
  priority: 'critical' | 'urgent' | 'high'
  receivedAt: string
  estimatedDuration: number
  preferredTime: string
  specialRequirements?: string[]
  assignedTech?: string
  status: 'unassigned' | 'assigned' | 'dispatched' | 'in-progress'
}

interface GeofenceAlert {
  id: string
  type: 'entry' | 'exit' | 'speed' | 'idle' | 'route_deviation'
  technician: string
  location: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  details: string
}

interface RouteOptimization {
  technicianId: string
  currentRoute: {
    totalDistance: number
    totalTime: number
    fuelCost: number
    stops: number
  }
  optimizedRoute: {
    totalDistance: number
    totalTime: number
    fuelCost: number
    stops: number
    savings: {
      time: number
      distance: number
      fuel: number
    }
  }
  confidence: number
}

const fieldMetrics: FieldMetric[] = [
  {
    id: 'active-techs',
    title: 'Active Technicians',
    value: 28,
    change: '+3',
    trend: 'up',
    icon: Users,
    color: 'text-green-400',
    priority: 'high',
    status: 'normal'
  },
  {
    id: 'jobs-in-progress',
    title: 'Jobs in Progress',
    value: 34,
    change: '+8',
    trend: 'up',
    icon: Wrench,
    color: 'text-blue-400',
    priority: 'critical',
    status: 'normal'
  },
  {
    id: 'emergency-queue',
    title: 'Emergency Queue',
    value: 3,
    change: '+1',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-red-400',
    priority: 'critical',
    status: 'warning'
  },
  {
    id: 'avg-response',
    title: 'Avg Response Time',
    value: '18 min',
    change: '-5 min',
    trend: 'up',
    icon: Clock,
    color: 'text-orange-400',
    priority: 'high',
    status: 'normal'
  },
  {
    id: 'fleet-utilization',
    title: 'Fleet Utilization',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: Truck,
    color: 'text-purple-400',
    priority: 'medium',
    status: 'normal'
  },
  {
    id: 'completion-rate',
    title: 'Today\'s Completion Rate',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-emerald-400',
    priority: 'high',
    status: 'normal'
  }
]

const fieldTechnicians: FieldTechnician[] = [
  {
    id: 'tech-001',
    name: 'Mike Rodriguez',
    status: 'on-job',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, Downtown',
      zone: 'Zone A'
    },
    currentJob: {
      id: 'job-456',
      customer: 'Johnson Residence',
      type: 'HVAC Repair',
      priority: 'urgent',
      eta: '45 min remaining',
      duration: 120
    },
    nextJob: {
      id: 'job-789',
      customer: 'Smith Office',
      scheduledTime: '2:30 PM',
      travelTime: 15
    },
    vehicle: {
      id: 'van-001',
      type: 'Service Van',
      fuelLevel: 78,
      lastMaintenance: '2024-01-15',
      mileage: 45670
    },
    performance: {
      jobsToday: 4,
      efficiency: 94,
      customerRating: 4.8,
      onTimeRate: 96
    },
    equipment: ['HVAC Tools', 'Electrical Meter', 'Diagnostic Kit'],
    certifications: ['HVAC Certified', 'EPA Licensed']
  },
  {
    id: 'tech-002',
    name: 'Sarah Chen',
    status: 'en-route',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: 'En route to 456 Oak Ave',
      zone: 'Zone B'
    },
    currentJob: {
      id: 'job-234',
      customer: 'Williams Family',
      type: 'Plumbing Emergency',
      priority: 'emergency',
      eta: '12 min',
      duration: 90
    },
    vehicle: {
      id: 'van-002',
      type: 'Service Van',
      fuelLevel: 65,
      lastMaintenance: '2024-01-20',
      mileage: 38920
    },
    performance: {
      jobsToday: 5,
      efficiency: 98,
      customerRating: 4.9,
      onTimeRate: 98
    },
    equipment: ['Plumbing Tools', 'Snake Camera', 'Leak Detector'],
    certifications: ['Master Plumber', 'Backflow Certified']
  },
  {
    id: 'tech-003',
    name: 'David Kim',
    status: 'available',
    location: {
      lat: 40.6892,
      lng: -74.0445,
      address: 'Brooklyn Service Center',
      zone: 'Zone C'
    },
    vehicle: {
      id: 'van-003',
      type: 'Service Van',
      fuelLevel: 92,
      lastMaintenance: '2024-01-10',
      mileage: 52340
    },
    performance: {
      jobsToday: 3,
      efficiency: 91,
      customerRating: 4.7,
      onTimeRate: 89
    },
    equipment: ['Electrical Tools', 'Safety Equipment', 'Testing Devices'],
    certifications: ['Licensed Electrician', 'Safety Certified']
  }
]

const emergencyJobs: EmergencyJob[] = [
  {
    id: 'emg-001',
    customer: 'Metro Hospital',
    address: '789 Medical Center Dr',
    phone: '(555) 123-4567',
    type: 'HVAC Emergency',
    description: 'Complete AC failure in operating wing - critical patient areas affected',
    priority: 'critical',
    receivedAt: '2 min ago',
    estimatedDuration: 180,
    preferredTime: 'ASAP',
    specialRequirements: ['Hospital protocols', 'Sterile environment'],
    status: 'unassigned'
  },
  {
    id: 'emg-002',
    customer: 'Downtown Restaurant',
    address: '321 Business Ave',
    phone: '(555) 987-6543',
    type: 'Electrical Emergency',
    description: 'Power outage affecting kitchen equipment during lunch rush',
    priority: 'urgent',
    receivedAt: '8 min ago',
    estimatedDuration: 90,
    preferredTime: 'Within 30 min',
    assignedTech: 'tech-003',
    status: 'assigned'
  },
  {
    id: 'emg-003',
    customer: 'Senior Living Center',
    address: '555 Care Way',
    phone: '(555) 456-7890',
    type: 'Plumbing Emergency',
    description: 'Water leak in main building affecting multiple units',
    priority: 'high',
    receivedAt: '15 min ago',
    estimatedDuration: 120,
    preferredTime: 'Within 1 hour',
    assignedTech: 'tech-002',
    status: 'dispatched'
  }
]

const geofenceAlerts: GeofenceAlert[] = [
  {
    id: 'alert-001',
    type: 'speed',
    technician: 'Mike Rodriguez',
    location: 'Highway 95, Mile 23',
    timestamp: '3 min ago',
    severity: 'warning',
    details: 'Speed limit exceeded: 78 mph in 65 mph zone'
  },
  {
    id: 'alert-002',
    type: 'idle',
    technician: 'James Wilson',
    location: 'Customer Site - 456 Pine St',
    timestamp: '12 min ago',
    severity: 'info',
    details: 'Vehicle idle time: 25 minutes (extended break detected)'
  }
]

const routeOptimizations: RouteOptimization[] = [
  {
    technicianId: 'tech-001',
    currentRoute: {
      totalDistance: 85.4,
      totalTime: 180,
      fuelCost: 12.50,
      stops: 5
    },
    optimizedRoute: {
      totalDistance: 72.1,
      totalTime: 145,
      fuelCost: 10.20,
      stops: 5,
      savings: {
        time: 35,
        distance: 13.3,
        fuel: 2.30
      }
    },
    confidence: 89
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-500'
    case 'en-route': return 'bg-blue-500'
    case 'on-job': return 'bg-orange-500'
    case 'break': return 'bg-yellow-500'
    case 'offline': return 'bg-neutral-500'
    default: return 'bg-neutral-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'Available'
    case 'en-route': return 'En Route'
    case 'on-job': return 'On Job'
    case 'break': return 'On Break'
    case 'offline': return 'Offline'
    default: return 'Unknown'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-400 bg-red-600/10 border-red-600/20'
    case 'emergency': return 'text-red-400 bg-red-600/10 border-red-600/20'
    case 'urgent': return 'text-orange-400 bg-orange-600/10 border-orange-600/20'
    case 'high': return 'text-yellow-400 bg-yellow-600/10 border-yellow-600/20'
    case 'standard': return 'text-blue-400 bg-blue-600/10 border-blue-600/20'
    default: return 'text-neutral-400 bg-neutral-600/10 border-neutral-600/20'
  }
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m' : '${mins}m'
}

export default function FieldCommandCenterPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [responseTimeData, setResponseTimeData] = useState<TradingViewChartData[]>([])
  const [efficiencyData, setEfficiencyData] = useState<TradingViewChartData[]>([])
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const responseTimeRef = useRef<TradingViewWrapperRef>(null)
  const efficiencyRef = useRef<TradingViewWrapperRef>(null)

  // Generate real-time response time chart data
  useEffect(() => {
    const generateResponseTimeData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 8 * 60 * 60 * 1000) // 8 hours ago
      
      const baseResponseTime = 25 // Starting response time in minutes
      
      for (let i = 0; i < 480; i += 15) { // Every 15 minutes for 8 hours
        const time = new Date(startTime.getTime() + i * 60 * 1000)
        
        // Add realistic patterns for response time
        const hourOfDay = time.getHours()
        const rushHourFactor = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19) ? 1.3 : 1.0
        const lunchFactor = (hourOfDay >= 11 && hourOfDay <= 13) ? 1.1 : 1.0
        const randomVariation = 0.8 + Math.random() * 0.4
        
        const responseTime = baseResponseTime * rushHourFactor * lunchFactor * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(10, Math.min(45, responseTime)),
        })
      }
      
      return data
    }

    // Generate efficiency tracking data
    const generateEfficiencyData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 8 * 60 * 60 * 1000) // 8 hours ago
      
      const baseEfficiency = 85 // Starting efficiency percentage
      
      for (let i = 0; i < 480; i += 30) { // Every 30 minutes for 8 hours
        const time = new Date(startTime.getTime() + i * 60 * 1000)
        
        // Add realistic efficiency patterns
        const hourOfDay = time.getHours()
        const morningBoost = hourOfDay >= 8 && hourOfDay <= 10 ? 1.1 : 1.0
        const afternoonDip = hourOfDay >= 13 && hourOfDay <= 15 ? 0.95 : 1.0
        const endOfDayPush = hourOfDay >= 16 ? 1.05 : 1.0
        const randomVariation = 0.95 + Math.random() * 0.1
        
        const efficiency = baseEfficiency * morningBoost * afternoonDip * endOfDayPush * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(70, Math.min(100, efficiency)),
        })
      }
      
      return data
    }

    setResponseTimeData(generateResponseTimeData())
    setEfficiencyData(generateEfficiencyData())
  }, [])

  // Real-time updates every 30 seconds
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setResponseTimeData(prev => {
        const newData = [...prev]
        const lastTime = newData[newData.length - 1]?.time || 0
        const newTime = lastTime + 900 // 15 minutes later
        const newValue = 15 + Math.random() * 20
        
        newData.push({
          time: newTime as any,
          value: newValue
        })
        
        // Keep only last 8 hours of data
        return newData.slice(-32)
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Command Center Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Radar className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Field Operations Command Center</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live Tracking</span>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Satellite className="h-3 w-3 mr-1" />
              GPS Enabled
            </Badge>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Dispatch
            </Badge>
          </div>
          <p className="text-neutral-400 mt-1">Real-time field operations monitoring, dispatch management, and route optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Technicians
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Technicians</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Available Only</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Emergency Response</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Zone Filter</DropdownMenuItem>
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

      {/* Field Operations KPIs - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {fieldMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
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
                    "w-2 h-2 rounded-full",
                    metric.status === 'normal' ? "bg-green-500" :
                    metric.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                  )} />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
            </div>
          )
        })}
      </div>

      {/* Real-time Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Monitoring */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-medium text-neutral-100">Response Time Monitoring (Live)</h3>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                TradingView Powered
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-64">
            <TradingViewWrapper
              ref={responseTimeRef}
              data={responseTimeData}
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Response Times</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Avg: 18 min</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => responseTimeRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Team Efficiency Tracking */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Team Efficiency Tracking (Live)</h3>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                TradingView Powered
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-64">
            <TradingViewWrapper
              ref={efficiencyRef}
              data={efficiencyData}
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Efficiency Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Avg: 92.3%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => efficiencyRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Dispatch Queue */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-medium text-neutral-100">Emergency Dispatch Queue</h3>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              {emergencyJobs.length} Active
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Queue
          </Button>
        </div>
        <div className="space-y-3">
          {emergencyJobs.map((job) => (
            <div key={job.id} className={cn("p-4 rounded-lg border", getPriorityColor(job.priority))}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      job.priority === 'critical' ? "bg-red-500 animate-pulse" :
                      job.priority === 'urgent' ? "bg-orange-500" : "bg-yellow-500"
                    )} />
                    <span className="font-medium text-neutral-100">{job.customer}</span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {job.type}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      job.status === 'unassigned' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                      job.status === 'assigned' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                      job.status === 'dispatched' ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                      "bg-green-600/20 text-green-400 border-green-600/30"
                    )}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-300 mb-2">{job.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm text-neutral-400">
                    <div>
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {job.address}
                    </div>
                    <div>
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(job.estimatedDuration)} estimated
                    </div>
                    <div>
                      <Phone className="h-4 w-4 inline mr-1" />
                      {job.phone}
                    </div>
                  </div>
                  {job.specialRequirements && (
                    <div className="mt-2 text-xs text-orange-400">
                      Special: {job.specialRequirements.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {job.status === 'unassigned' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-xs text-neutral-500">
                Received: {job.receivedAt} • Priority: {job.priority.toUpperCase()}
                {job.assignedTech && ' • Assigned to: ${job.assignedTech}'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Technicians Status */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium text-neutral-100">Active Technicians - Live Status</h3>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            GPS Tracking
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {fieldTechnicians.map((tech) => (
            <div key={tech.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(tech.status))} />
                  <span className="font-medium text-neutral-200">{tech.name}</span>
                </div>
                <Badge variant="outline" className="text-xs border-neutral-600">
                  {getStatusText(tech.status)}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="h-4 w-4" />
                  <span>{tech.location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Compass className="h-4 w-4" />
                  <span>{tech.location.zone}</span>
                </div>
              </div>

              {tech.currentJob && (
                <div className="p-3 bg-neutral-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">Current Job</span>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      tech.currentJob.priority === 'emergency' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                      tech.currentJob.priority === 'urgent' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                      "bg-blue-600/20 text-blue-400 border-blue-600/30"
                    )}>
                      {tech.currentJob.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-neutral-300">{tech.currentJob.customer}</div>
                  <div className="text-xs text-neutral-400">{tech.currentJob.type}</div>
                  <div className="text-xs text-orange-400">{tech.currentJob.eta}</div>
                </div>
              )}

              {tech.nextJob && (
                <div className="p-3 bg-neutral-800/30 rounded-lg space-y-1">
                  <div className="text-sm font-medium text-neutral-200">Next Job</div>
                  <div className="text-sm text-neutral-300">{tech.nextJob.customer}</div>
                  <div className="text-xs text-neutral-400">
                    Scheduled: {tech.nextJob.scheduledTime} • {tech.nextJob.travelTime} min travel
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-400">Vehicle</div>
                  <div className="font-medium text-neutral-200">{tech.vehicle.id}</div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Fuel className="h-3 w-3" />
                    {tech.vehicle.fuelLevel}% fuel
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Performance</div>
                  <div className="font-medium text-neutral-200">{tech.performance.efficiency}%</div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Star className="h-3 w-3" />
                    {tech.performance.customerRating}/5.0
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-neutral-400">Today's Progress</div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: '${tech.performance.efficiency}%' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{tech.performance.jobsToday} jobs completed</span>
                  <span>{tech.performance.onTimeRate}% on-time</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Optimization & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Route Optimization */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Route className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">AI Route Optimization</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Bot className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <div className="space-y-4">
            {routeOptimizations.map((optimization, index) => (
              <div key={index} className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">Route Optimization Available</span>
                  <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                    {optimization.confidence}% confidence
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Time Savings</div>
                    <div className="font-medium text-green-400">-{optimization.optimizedRoute.savings.time} min</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Distance Savings</div>
                    <div className="font-medium text-green-400">-{optimization.optimizedRoute.savings.distance} mi</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Fuel Savings</div>
                    <div className="font-medium text-green-400">${optimization.optimizedRoute.savings.fuel}</div>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Apply Optimization
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Geofence & GPS Alerts */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Geofence & GPS Alerts</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Live Monitoring
            </Badge>
          </div>
          <div className="space-y-3">
            {geofenceAlerts.map((alert) => (
              <div key={alert.id} className={cn(
                "p-3 rounded-lg border",
                alert.severity === 'critical' ? "bg-red-600/10 border-red-600/20" :
                alert.severity === 'warning' ? "bg-orange-600/10 border-orange-600/20" :
                "bg-blue-600/10 border-blue-600/20"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        alert.severity === 'critical' ? "bg-red-400" :
                        alert.severity === 'warning' ? "bg-orange-400" : "bg-blue-400"
                      )} />
                      <span className="text-sm font-medium text-neutral-200">{alert.technician}</span>
                      <Badge variant="outline" className="text-xs border-neutral-600">
                        {alert.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-400 mb-1">{alert.location}</div>
                    <div className="text-xs text-neutral-300">{alert.details}</div>
                  </div>
                  <div className="text-xs text-neutral-500">{alert.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}