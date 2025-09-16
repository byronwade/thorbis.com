"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clock,
  MapPin,
  Route,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Activity,
  Timer,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Navigation,
  Truck,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Settings
} from 'lucide-react'

interface SchedulingMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface TechnicianSchedule {
  id: string
  name: string
  jobsScheduled: number
  jobsCompleted: number
  efficiency: number
  travelTime: number
  workingHours: number
  utilizationRate: number
  route: string
  status: 'on-schedule' | 'delayed' | 'ahead' | 'break'
}

interface RouteOptimization {
  route: string
  technicians: number
  totalJobs: number
  totalDistance: number
  avgTravelTime: number
  fuelCost: number
  efficiency: number
  status: 'optimal' | 'needs-optimization' | 'critical'
}

const schedulingMetrics: SchedulingMetric[] = [
  {
    id: 'schedule-efficiency',
    title: 'Schedule Efficiency',
    value: '94%',
    change: '+6%',
    trend: 'up',
    icon: Target,
    color: 'text-green-400'
  },
  {
    id: 'on-time-rate',
    title: 'On-Time Arrival Rate',
    value: '91%',
    change: '+4%',
    trend: 'up',
    icon: Clock,
    color: 'text-blue-400'
  },
  {
    id: 'avg-travel-time',
    title: 'Avg Travel Time',
    value: '18 min',
    change: '-3 min',
    trend: 'up',
    icon: Route,
    color: 'text-purple-400'
  },
  {
    id: 'utilization-rate',
    title: 'Technician Utilization',
    value: '87%',
    change: '+2%',
    trend: 'up',
    icon: Users,
    color: 'text-orange-400'
  },
  {
    id: 'route-optimization',
    title: 'Route Optimization',
    value: '92%',
    change: '+8%',
    trend: 'up',
    icon: Navigation,
    color: 'text-cyan-400'
  },
  {
    id: 'schedule-changes',
    title: 'Schedule Changes',
    value: 23,
    change: '-12',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-yellow-400'
  }
]

const technicianSchedules: TechnicianSchedule[] = [
  {
    id: 'tech-1',
    name: 'Mike Rodriguez',
    jobsScheduled: 8,
    jobsCompleted: 6,
    efficiency: 96,
    travelTime: 45,
    workingHours: 7.5,
    utilizationRate: 94,
    route: 'Downtown A',
    status: 'on-schedule'
  },
  {
    id: 'tech-2',
    name: 'Sarah Chen',
    jobsScheduled: 7,
    jobsCompleted: 7,
    efficiency: 98,
    travelTime: 32,
    workingHours: 8,
    utilizationRate: 97,
    route: 'Westside B',
    status: 'ahead'
  },
  {
    id: 'tech-3',
    name: 'James Wilson',
    jobsScheduled: 6,
    jobsCompleted: 4,
    efficiency: 78,
    travelTime: 65,
    workingHours: 7,
    utilizationRate: 81,
    route: 'North Valley',
    status: 'delayed'
  },
  {
    id: 'tech-4',
    name: 'Lisa Thompson',
    jobsScheduled: 9,
    jobsCompleted: 8,
    efficiency: 94,
    travelTime: 38,
    workingHours: 8.5,
    utilizationRate: 91,
    route: 'East District',
    status: 'on-schedule'
  },
  {
    id: 'tech-5',
    name: 'David Kim',
    jobsScheduled: 5,
    jobsCompleted: 5,
    efficiency: 89,
    travelTime: 28,
    workingHours: 6,
    utilizationRate: 88,
    route: 'South Region',
    status: 'break'
  }
]

const routeOptimizations: RouteOptimization[] = [
  {
    route: 'Downtown A',
    technicians: 3,
    totalJobs: 24,
    totalDistance: 45.2,
    avgTravelTime: 15,
    fuelCost: 68.40,
    efficiency: 94,
    status: 'optimal'
  },
  {
    route: 'Westside B',
    technicians: 2,
    totalJobs: 16,
    totalDistance: 52.8,
    avgTravelTime: 22,
    fuelCost: 79.20,
    efficiency: 87,
    status: 'optimal'
  },
  {
    route: 'North Valley',
    technicians: 2,
    totalJobs: 14,
    totalDistance: 68.3,
    avgTravelTime: 28,
    fuelCost: 102.45,
    efficiency: 74,
    status: 'needs-optimization'
  },
  {
    route: 'East District',
    technicians: 4,
    totalJobs: 32,
    totalDistance: 38.7,
    avgTravelTime: 12,
    fuelCost: 58.05,
    efficiency: 96,
    status: 'optimal'
  },
  {
    route: 'South Region',
    technicians: 2,
    totalJobs: 18,
    totalDistance: 44.1,
    avgTravelTime: 18,
    fuelCost: 66.15,
    efficiency: 91,
    status: 'optimal'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on-schedule': return 'bg-green-500'
    case 'ahead': return 'bg-blue-500'
    case 'delayed': return 'bg-red-500'
    case 'break': return 'bg-yellow-500'
    case 'optimal': return 'bg-green-500'
    case 'needs-optimization': return 'bg-orange-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-neutral-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'on-schedule': return 'On Schedule'
    case 'ahead': return 'Ahead'
    case 'delayed': return 'Delayed'
    case 'break': return 'On Break'
    case 'optimal': return 'Optimal'
    case 'needs-optimization': return 'Needs Optimization'
    case 'critical': return 'Critical'
    default: return 'Unknown'
  }
}

export default function SchedulingEfficiencyPage() {
  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Scheduling Efficiency Analytics</h1>
          <p className="text-neutral-400 mt-1">Schedule optimization, route planning, and time utilization</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Today
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

      {/* Key Scheduling Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {schedulingMetrics.map((metric) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Optimization Status - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-neutral-100">Route Optimization Status</h3>
          </div>
          <div className="space-y-4">
            {routeOptimizations.map((route, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(route.status))} />
                    <span className="font-medium text-neutral-200">{route.route}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    route.status === 'optimal' ? "border-green-600 text-green-400" :
                    route.status === 'needs-optimization' ? "border-orange-600 text-orange-400" :
                    "border-red-600 text-red-400"
                  )}>
                    {getStatusText(route.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Techs</div>
                    <div className="font-medium text-neutral-200">{route.technicians}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Jobs</div>
                    <div className="font-medium text-neutral-200">{route.totalJobs}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Distance</div>
                    <div className="font-medium text-neutral-200">{route.totalDistance}mi</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Efficiency</div>
                    <div className="font-medium text-neutral-200">{route.efficiency}%</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        route.efficiency >= 90 ? "bg-green-500" :
                        route.efficiency >= 80 ? "bg-blue-500" :
                        route.efficiency >= 70 ? "bg-orange-500" : "bg-red-500"
                      )}
                      style={{ width: `${route.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Performance Summary - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Schedule Performance Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Jobs Scheduled Today</span>
                <span className="text-sm font-medium text-neutral-200">47</span>
              </div>
              <Progress value={85} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">40 completed, 7 in progress</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">On-Time Performance</span>
                <span className="text-sm font-medium text-green-400">91%</span>
              </div>
              <Progress value={91} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">Target: 90% | Last week: 88%</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Route Optimization</span>
                <span className="text-sm font-medium text-cyan-400">94%</span>
              </div>
              <Progress value={94} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">4 routes optimal, 1 needs optimization</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Technician Utilization</span>
                <span className="text-sm font-medium text-purple-400">87%</span>
              </div>
              <Progress value={87} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">Average across all technicians</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Schedule Performance Table - Data-Focused */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-medium text-neutral-100">Technician Schedule Performance</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Technician</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Jobs Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Jobs Completed</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Efficiency</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Travel Time</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Route</th>
                </tr>
              </thead>
              <tbody>
                {technicianSchedules.map((tech) => (
                  <tr key={tech.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-100">{tech.name}</div>
                      <div className="text-xs text-neutral-500">{tech.workingHours}h working</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(tech.status))} />
                        <span className="text-neutral-300">{getStatusText(tech.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{tech.jobsScheduled}</td>
                    <td className="py-3 px-4 text-neutral-300">{tech.jobsCompleted}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "font-medium",
                        tech.efficiency >= 95 ? "text-green-400" :
                        tech.efficiency >= 90 ? "text-blue-400" :
                        tech.efficiency >= 85 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {tech.efficiency}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{tech.travelTime} min</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-300",
                              tech.utilizationRate >= 95 ? "bg-green-500" :
                              tech.utilizationRate >= 90 ? "bg-blue-500" :
                              tech.utilizationRate >= 85 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: '${tech.utilizationRate}%' }}
                          />
                        </div>
                        <span className="text-neutral-300 text-xs">{tech.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{tech.route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Insights - Data-Focused */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Schedule Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-400">Route Optimization Needed</div>
                  <div className="text-xs text-neutral-400 mt-1">North Valley route efficiency below 75%</div>
                  <div className="text-xs text-neutral-500 mt-1">Consider redistributing jobs</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-400">Schedule Conflict</div>
                  <div className="text-xs text-neutral-400 mt-1">James Wilson running 30 min behind</div>
                  <div className="text-xs text-neutral-500 mt-1">May affect next appointment</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-400">Route Optimized</div>
                  <div className="text-xs text-neutral-400 mt-1">East District route efficiency improved</div>
                  <div className="text-xs text-neutral-500 mt-1">Saved 45 minutes travel time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Time Allocation</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Active Work Time</span>
              <span className="font-medium text-blue-400">6.2h avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Travel Time</span>
              <span className="font-medium text-orange-400">1.1h avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Break Time</span>
              <span className="font-medium text-green-400">0.7h avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Idle Time</span>
              <span className="font-medium text-red-400">0.3h avg</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Optimization Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <div className="text-sm font-medium text-blue-400 mb-1">Recommendation</div>
              <div className="text-xs text-neutral-400">
                Merge two short jobs in North Valley to reduce travel time by 25 minutes
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-600/10 border border-purple-600/20">
              <div className="text-sm font-medium text-purple-400 mb-1">AI Insight</div>
              <div className="text-xs text-neutral-400">
                Peak efficiency hours: 10 AM - 2 PM. Consider scheduling complex jobs during this window
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/20">
              <div className="text-sm font-medium text-green-400 mb-1">Success</div>
              <div className="text-xs text-neutral-400">
                This week's optimization saved 4.5 hours total travel time
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}