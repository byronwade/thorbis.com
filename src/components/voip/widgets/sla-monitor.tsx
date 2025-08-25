"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, CheckCircle, Timer, Bell, BellOff } from "lucide-react"

interface SLAMetric {
  id: string
  name: string
  target: number
  current: number
  unit: string
  status: "on-track" | "warning" | "breach"
  timeRemaining?: number
}

export default function SLAMonitor() {
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([
    {
      id: "response",
      name: "First Response",
      target: 5,
      current: 3.2,
      unit: "min",
      status: "on-track",
      timeRemaining: 108,
    },
    {
      id: "resolution",
      name: "Resolution Time",
      target: 30,
      current: 22,
      unit: "min",
      status: "warning",
      timeRemaining: 480,
    },
    {
      id: "escalation",
      name: "Escalation Window",
      target: 15,
      current: 14.5,
      unit: "min",
      status: "warning",
      timeRemaining: 30,
    },
  ])

  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-track":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "breach":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-neutral-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "breach":
        return "text-red-500"
      default:
        return "text-neutral-500"
    }
  }

  const getProgressValue = (metric: SLAMetric) => {
    return (metric.current / metric.target) * 100
  }

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 p-2">
      <div className="pb-2 flex items-center gap-2">
        <Timer className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">SLA Monitor</span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-6 w-6 p-0"
          onClick={() => setAlertsEnabled(!alertsEnabled)}
        >
          {alertsEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
        </Button>
      </div>

      <div className="space-y-3">
        {slaMetrics.map((metric) => (
          <div key={metric.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(metric.status)}
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400">
                  {metric.current}/{metric.target} {metric.unit}
                </div>
                {metric.timeRemaining && (
                  <div className={`text-xs font-mono ${getStatusColor(metric.status)}`}>
                    {formatTimeRemaining(metric.timeRemaining)} left
                  </div>
                )}
              </div>
            </div>
            <Progress value={getProgressValue(metric)} className="h-2" />
          </div>
        ))}

        <div className="pt-2 border-t border-neutral-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Overall SLA Status</span>
            <Badge
              variant="outline"
              className={`${getStatusColor(
                slaMetrics.find((m) => m.status === "breach")
                  ? "breach"
                  : slaMetrics.find((m) => m.status === "warning")
                    ? "warning"
                    : "on-track",
              )}`}
            >
              {slaMetrics.find((m) => m.status === "breach")
                ? "At Risk"
                : slaMetrics.find((m) => m.status === "warning")
                  ? "Warning"
                  : "On Track"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
            Extend SLA
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
            Escalate
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}
