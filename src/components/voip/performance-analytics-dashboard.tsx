"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Clock,
  Star,
  AlertTriangle,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

type MetricTrend = "up" | "down" | "stable"

type KPIMetric = {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  trend: MetricTrend
  target?: number
  format: "number" | "percentage" | "duration" | "currency"
}

type ChartDataPoint = {
  name: string
  value: number
  timestamp?: string
  category?: string
}

type AnalyticsTimeframe = "1h" | "24h" | "7d" | "30d" | "90d"

type DashboardWidget = {
  id: string
  title: string
  type: "kpi" | "chart" | "table" | "alert"
  size: "small" | "medium" | "large"
  data: any
  refreshInterval?: number
}

// Mock analytics data
const generateKPIMetrics = (): KPIMetric[] => [
  {
    id: "active-calls",
    name: "Active Calls",
    value: 23,
    previousValue: 18,
    unit: "calls",
    trend: "up",
    format: "number",
  },
  {
    id: "avg-wait-time",
    name: "Avg Wait Time",
    value: 45,
    previousValue: 62,
    unit: "seconds",
    trend: "down",
    target: 30,
    format: "duration",
  },
  {
    id: "first-call-resolution",
    name: "First Call Resolution",
    value: 87.5,
    previousValue: 84.2,
    unit: "%",
    trend: "up",
    target: 90,
    format: "percentage",
  },
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction",
    value: 4.6,
    previousValue: 4.4,
    unit: "/5",
    trend: "up",
    target: 4.5,
    format: "number",
  },
  {
    id: "agent-utilization",
    name: "Agent Utilization",
    value: 78.3,
    previousValue: 82.1,
    unit: "%",
    trend: "down",
    target: 80,
    format: "percentage",
  },
  {
    id: "revenue-per-call",
    name: "Revenue per Call",
    value: 145.67,
    previousValue: 138.92,
    unit: "$",
    trend: "up",
    format: "currency",
  },
]

const generateCallVolumeData = (): ChartDataPoint[] => [
  { name: "00:00", value: 12 },
  { name: "04:00", value: 8 },
  { name: "08:00", value: 45 },
  { name: "12:00", value: 67 },
  { name: "16:00", value: 89 },
  { name: "20:00", value: 34 },
]

const generateResolutionTimeData = (): ChartDataPoint[] => [
  { name: "Mon", value: 8.5 },
  { name: "Tue", value: 7.2 },
  { name: "Wed", value: 9.1 },
  { name: "Thu", value: 6.8 },
  { name: "Fri", value: 7.9 },
  { name: "Sat", value: 5.4 },
  { name: "Sun", value: 4.2 },
]

const generateIssueDistribution = (): ChartDataPoint[] => [
  { name: "Technical", value: 45, category: "support" },
  { name: "Billing", value: 28, category: "billing" },
  { name: "Sales", value: 18, category: "sales" },
  { name: "General", value: 9, category: "general" },
]

const generateAgentPerformance = () => [
  { name: "Alex Chen", calls: 34, resolution: 92, satisfaction: 4.8, utilization: 85 },
  { name: "Sam Rivera", calls: 28, resolution: 89, satisfaction: 4.6, utilization: 78 },
  { name: "Jordan Kim", calls: 31, resolution: 87, satisfaction: 4.7, utilization: 82 },
  { name: "Casey Park", calls: 25, resolution: 85, satisfaction: 4.5, utilization: 75 },
]

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

type AnalyticsDashboardProps = {
  timeframe?: AnalyticsTimeframe
  onExport?: (data: any) => void
  className?: string
}

export default function PerformanceAnalyticsDashboard({
  timeframe = "24h",
  onExport,
  className,
}: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>(timeframe)
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([])
  const [callVolumeData, setCallVolumeData] = useState<ChartDataPoint[]>([])
  const [resolutionTimeData, setResolutionTimeData] = useState<ChartDataPoint[]>([])
  const [issueDistribution, setIssueDistribution] = useState<ChartDataPoint[]>([])
  const [agentPerformance, setAgentPerformance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load initial data
  useEffect(() => {
    refreshData()
  }, [selectedTimeframe])

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedTimeframe])

  const refreshData = async () => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setKpiMetrics(generateKPIMetrics())
    setCallVolumeData(generateCallVolumeData())
    setResolutionTimeData(generateResolutionTimeData())
    setIssueDistribution(generateIssueDistribution())
    setAgentPerformance(generateAgentPerformance())
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const formatMetricValue = (metric: KPIMetric): string => {
    switch (metric.format) {
      case "percentage":
        return `${metric.value.toFixed(1)}%`
      case "duration":
        return `${Math.floor(metric.value / 60)}:${(metric.value % 60).toString().padStart(2, "0")}`
      case "currency":
        return `$${metric.value.toFixed(2)}`
      default:
        return metric.value.toString()
    }
  }

  const getTrendIcon = (trend: MetricTrend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-400" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-400" />
      default:
        return <Activity className="h-3 w-3 text-neutral-400" />
    }
  }

  const getTrendColor = (trend: MetricTrend) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-neutral-400"
    }
  }

  const calculateTrendPercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const exportData = () => {
    const exportData = {
      timeframe: selectedTimeframe,
      kpiMetrics,
      callVolumeData,
      resolutionTimeData,
      issueDistribution,
      agentPerformance,
      generatedAt: new Date().toISOString(),
    }

    onExport?.(exportData)

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${selectedTimeframe}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Performance Analytics</CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              Live
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Select
              value={selectedTimeframe}
              onValueChange={(value: AnalyticsTimeframe) => setSelectedTimeframe(value)}
            >
              <SelectTrigger className="h-6 w-16 text-xs bg-neutral-800 border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="24h">24H</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-6 w-6 p-0"
              title="Toggle auto-refresh"
            >
              <RefreshCw className={cn("h-3 w-3", autoRefresh && "animate-spin", isLoading && "animate-spin")} />
            </Button>

            <Button size="sm" variant="ghost" onClick={exportData} className="h-6 w-6 p-0" title="Export data">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-neutral-400">Last updated: {lastUpdated.toLocaleTimeString()}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {kpiMetrics.slice(0, 4).map((metric) => (
            <div key={metric.id} className="p-2 rounded bg-neutral-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-400 truncate">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-white">{formatMetricValue(metric)}</span>
                <span className={cn("text-xs", getTrendColor(metric.trend))}>
                  {Math.abs(calculateTrendPercentage(metric.value, metric.previousValue)).toFixed(1)}%
                </span>
              </div>

              {metric.target && (
                <div className="mt-1">
                  <div className="flex justify-between text-xs text-neutral-500 mb-0.5">
                    <span>Target</span>
                    <span>{metric.format === "percentage" ? `${metric.target}%` : metric.target}</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-1">
                    <div
                      className={cn(
                        "h-1 rounded-full transition-all",
                        metric.value >= metric.target ? "bg-green-500" : "bg-orange-500",
                      )}
                      style={{
                        width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="bg-neutral-800" />

        {/* Call Volume Chart */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium text-neutral-300">Call Volume</span>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Resolution Time Trend */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3 w-3 text-green-400" />
            <span className="text-xs font-medium text-neutral-300">Avg Resolution Time (min)</span>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Issue Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3 text-yellow-400" />
              <span className="text-xs font-medium text-neutral-300">Issue Types</span>
            </div>

            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={35}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {issueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1">
            {issueDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-neutral-300">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Agent Performance */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3 w-3 text-purple-400" />
            <span className="text-xs font-medium text-neutral-300">Top Agents</span>
          </div>

          <div className="space-y-2">
            {agentPerformance.slice(0, 3).map((agent, index) => (
              <div key={agent.name} className="flex items-center justify-between p-2 rounded bg-neutral-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{agent.name}</div>
                    <div className="text-xs text-neutral-400">{agent.calls} calls</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-green-400">{agent.resolution}%</div>
                    <div className="text-neutral-500">FCR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 flex items-center gap-1">
                      <Star className="h-2 w-2 fill-current" />
                      {agent.satisfaction}
                    </div>
                    <div className="text-neutral-500">CSAT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400">{agent.utilization}%</div>
                    <div className="text-neutral-500">Util</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="mt-4 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <AlertTriangle className="h-3 w-3" />
            <span>2 agents approaching break time • Queue depth: 8 calls • Avg wait: 1:23</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
