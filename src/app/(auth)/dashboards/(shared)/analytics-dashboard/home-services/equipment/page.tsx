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
  Settings2,
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Timer,
  Target,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Truck,
  Zap,
  Thermometer,
  Droplets,
  Battery,
  MapPin,
  Clock,
  BarChart3,
  Download,
  Zap,
  LineChart
} from 'lucide-react'

interface EquipmentMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface Asset {
  id: string
  name: string
  type: string
  assignedTo: string
  location: string
  status: 'active' | 'maintenance' | 'offline' | 'idle'
  utilization: number
  lastMaintenance: string
  nextMaintenance: string
  value: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}

interface MaintenanceCost {
  category: string
  monthly: number
  annual: number
  trend: string
  color: string
}

const equipmentMetrics: EquipmentMetric[] = [
  {
    id: 'total-assets',
    title: 'Total Assets',
    value: 47,
    change: '+3',
    trend: 'up',
    icon: Settings2,
    color: 'text-blue-400'
  },
  {
    id: 'active-equipment',
    title: 'Active Equipment',
    value: 42,
    change: '+1',
    trend: 'up',
    icon: Activity,
    color: 'text-green-400'
  },
  {
    id: 'utilization-rate',
    title: 'Avg Utilization',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: Target,
    color: 'text-purple-400'
  },
  {
    id: 'maintenance-costs',
    title: 'Monthly Maintenance',
    value: '$8,420',
    change: '-12%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-orange-400'
  },
  {
    id: 'downtime-hours',
    title: 'Downtime This Month',
    value: '24h',
    change: '-8h',
    trend: 'up',
    icon: Timer,
    color: 'text-yellow-400'
  },
  {
    id: 'asset-value',
    title: 'Total Asset Value',
    value: '$485K',
    change: '+$35K',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-emerald-400'
  }
]

const assets: Asset[] = [
  {
    id: 'truck-001',
    name: 'Service Van #1',
    type: 'Vehicle',
    assignedTo: 'Mike Rodriguez',
    location: 'Downtown Route',
    status: 'active',
    utilization: 94,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    value: 45000,
    condition: 'excellent'
  },
  {
    id: 'hvac-tools-001',
    name: 'HVAC Diagnostic Kit',
    type: 'Diagnostic Equipment',
    assignedTo: 'Sarah Chen',
    location: 'Westside Area',
    status: 'active',
    utilization: 87,
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01',
    value: 12500,
    condition: 'good'
  },
  {
    id: 'truck-003',
    name: 'Service Van #3',
    type: 'Vehicle',
    assignedTo: 'James Wilson',
    location: 'North Valley',
    status: 'maintenance',
    utilization: 0,
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-03-05',
    value: 38000,
    condition: 'fair'
  },
  {
    id: 'plumb-snake-001',
    name: 'Power Drain Snake',
    type: 'Plumbing Tool',
    assignedTo: 'Lisa Thompson',
    location: 'East District',
    status: 'active',
    utilization: 76,
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    value: 3200,
    condition: 'good'
  },
  {
    id: 'elec-meter-001',
    name: 'Digital Multimeter Pro',
    type: 'Electrical Tool',
    assignedTo: 'David Kim',
    location: 'South Region',
    status: 'active',
    utilization: 82,
    lastMaintenance: '2024-02-10',
    nextMaintenance: '2024-08-10',
    value: 850,
    condition: 'excellent'
  }
]

const maintenanceCosts: MaintenanceCost[] = [
  {
    category: 'Vehicle Maintenance',
    monthly: 4850,
    annual: 58200,
    trend: '-8%',
    color: 'bg-blue-500'
  },
  {
    category: 'Tool Calibration',
    monthly: 1680,
    annual: 20160,
    trend: '+3%',
    color: 'bg-purple-500'
  },
  {
    category: 'Equipment Repairs',
    monthly: 1230,
    annual: 14760,
    trend: '-15%',
    color: 'bg-orange-500'
  },
  {
    category: 'Software Licenses',
    monthly: 660,
    annual: 7920,
    trend: '+0%',
    color: 'bg-green-500'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'maintenance': return 'bg-orange-500'
    case 'offline': return 'bg-red-500'
    case 'idle': return 'bg-yellow-500'
    default: return 'bg-neutral-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Active'
    case 'maintenance': return 'Maintenance'
    case 'offline': return 'Offline'
    case 'idle': return 'Idle'
    default: return 'Unknown'
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent': return 'text-green-400'
    case 'good': return 'text-blue-400'
    case 'fair': return 'text-yellow-400'
    case 'poor': return 'text-red-400'
    default: return 'text-neutral-400'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

export default function EquipmentAnalyticsPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [equipmentChartData, setEquipmentChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)

  // Generate equipment utilization chart data
  useEffect(() => {
    const generateEquipmentData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      
      const baseUtilization = 85 // Starting utilization percentage
      
      for (const i = 0; i < 60; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic patterns for equipment utilization
        const weekdayFactor = [1, 2, 3, 4, 5].includes(time.getDay()) ? 1.1 : 0.6 // Higher on weekdays
        const seasonalTrend = 1 + 0.1 * Math.sin((i / 30) * Math.PI) // Monthly variation
        const randomVariation = 0.9 + Math.random() * 0.2 // ±10% variation
        
        const dailyUtilization = baseUtilization * weekdayFactor * seasonalTrend * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(60, Math.min(100, dailyUtilization)),
        })
      }
      
      return data
    }

    setEquipmentChartData(generateEquipmentData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Equipment & Asset Analytics</h1>
          <p className="text-neutral-400 mt-1">Equipment utilization, maintenance costs, and asset tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Equipment
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Equipment</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Vehicles Only</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Tools Only</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Active Only</DropdownMenuItem>
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

      {/* Key Equipment Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {equipmentMetrics.map((metric) => {
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

      {/* TradingView Equipment Utilization Chart */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Equipment Utilization Trending</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
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
        <div className="h-80">
          <TradingViewWrapper
            ref={tradingViewRef}
            data={equipmentChartData}
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
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Current Avg: {equipmentChartData[equipmentChartData.length - 1]?.value?.toFixed(1) || '0'}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.fitContent()}>
              <Zap className="h-4 w-4 mr-1" />
              Auto-fit
            </Button>
          </div>
        </div>
      </div>

      {/* Equipment Performance Trending Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Cost Trending */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-medium text-neutral-100">Maintenance Cost Trending</h3>
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
              ref={tradingViewRef}
              data={equipmentChartData.map(item => ({
                ...item,
                value: item.value * 100 // Convert to cost representation
              }))}
              type="area"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Monthly Costs</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Equipment Efficiency Trending */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Equipment Efficiency Trending</h3>
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
              data={equipmentChartData.map(item => ({
                ...item,
                value: Math.min(100, item.value + 10) // Adjust for efficiency percentage
              }))}
              type="line"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Efficiency %</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Utilization Overview - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Asset Utilization Overview</h3>
          </div>
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(asset.status))} />
                    <span className="font-medium text-neutral-200 text-sm">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">{asset.utilization}%</span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {getStatusText(asset.status)}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        asset.utilization >= 90 ? "bg-green-500" :
                        asset.utilization >= 75 ? "bg-blue-500" :
                        asset.utilization >= 50 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: '${asset.utilization}%' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{asset.type}</span>
                  <span>Assigned to {asset.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Cost Breakdown - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Maintenance Cost Breakdown</h3>
          </div>
          <div className="space-y-4">
            {maintenanceCosts.map((cost, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", cost.color)} />
                    <span className="font-medium text-neutral-200 text-sm">{cost.category}</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      cost.trend.startsWith('+') ? "bg-red-600/20 text-red-400" :
                      cost.trend.startsWith('-`) ? "bg-green-600/20 text-green-400" :
                      "bg-neutral-600/20 text-neutral-400"
                    )}
                  >
                    {cost.trend}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Monthly</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(cost.monthly)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Annual</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(cost.annual)}</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", cost.color)}
                      style={{ width: `${(cost.monthly / 5000) * 100}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Inventory Table - Data-Focused */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium text-neutral-100">Asset Inventory & Status</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Condition</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Next Maintenance</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-100">{asset.name}</div>
                      <div className="text-xs text-neutral-500">{asset.location}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{asset.type}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(asset.status))} />
                        <span className="text-neutral-300">{getStatusText(asset.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{asset.assignedTo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-300",
                              asset.utilization >= 90 ? "bg-green-500" :
                              asset.utilization >= 75 ? "bg-blue-500" :
                              asset.utilization >= 50 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: '${asset.utilization}%' }}
                          />
                        </div>
                        <span className="text-neutral-300 text-xs">{asset.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("font-medium capitalize", getConditionColor(asset.condition))}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{formatDate(asset.nextMaintenance)}</td>
                    <td className="py-3 px-4 text-neutral-300">{formatCurrency(asset.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Maintenance Alerts - Data-Focused */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Maintenance Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-400">Overdue Maintenance</div>
                  <div className="text-xs text-neutral-400 mt-1">Service Van #3 - Due 2 days ago</div>
                  <div className="text-xs text-neutral-500 mt-1">Oil change and inspection required</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-400">Maintenance Due Soon</div>
                  <div className="text-xs text-neutral-400 mt-1">HVAC Diagnostic Kit - Due in 3 days</div>
                  <div className="text-xs text-neutral-500 mt-1">Calibration and sensor check</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-400">Maintenance Completed</div>
                  <div className="text-xs text-neutral-400 mt-1">Power Drain Snake - Completed today</div>
                  <div className="text-xs text-neutral-500 mt-1">Motor servicing and blade replacement</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Asset Performance Trends</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Equipment Uptime</span>
                <span className="text-sm font-medium text-green-400">96.2%</span>
              </div>
              <Progress value={96.2} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">Target: 95% | Last month: 94.8%</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Maintenance Efficiency</span>
                <span className="text-sm font-medium text-blue-400">88.7%</span>
              </div>
              <Progress value={88.7} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">Target: 90% | Last month: 85.3%</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Asset ROI</span>
                <span className="text-sm font-medium text-purple-400">24.3%</span>
              </div>
              <Progress value={75} className="h-2 bg-neutral-800" />
              <div className="text-xs text-neutral-500">Annual target: 20% | Current: 24.3%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}