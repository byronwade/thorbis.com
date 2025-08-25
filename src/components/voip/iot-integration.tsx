"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Thermometer, Zap, Droplets, AlertCircle, CheckCircle, Activity } from "lucide-react"

interface IoTDevice {
  id: string
  name: string
  type: string
  status: "online" | "offline" | "warning" | "error"
  lastSeen: string
  metrics: Record<string, any>
}

export default function IoTIntegration() {
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: "hvac-001",
      name: "Main HVAC Unit",
      type: "HVAC",
      status: "warning",
      lastSeen: "2 min ago",
      metrics: { temperature: 72, efficiency: 85, filterStatus: "Replace Soon" },
    },
    {
      id: "water-001",
      name: "Water Heater",
      type: "Water",
      status: "online",
      lastSeen: "1 min ago",
      metrics: { temperature: 140, pressure: 45, efficiency: 92 },
    },
    {
      id: "elec-001",
      name: "Main Panel",
      type: "Electrical",
      status: "online",
      lastSeen: "30 sec ago",
      metrics: { load: 65, voltage: 240, frequency: 60 },
    },
  ])

  const [diagnostics, setDiagnostics] = useState({
    runningTests: false,
    results: [],
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-neutral-400" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "HVAC":
        return <Thermometer className="h-4 w-4" />
      case "Water":
        return <Droplets className="h-4 w-4" />
      case "Electrical":
        return <Zap className="h-4 w-4" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  const runDiagnostics = async (deviceId: string) => {
    setDiagnostics({ runningTests: true, results: [] })
    // Simulate diagnostic tests
    setTimeout(() => {
      setDiagnostics({
        runningTests: false,
        results: [
          "System pressure: Normal",
          "Temperature sensors: OK",
          "Network connectivity: Strong",
          "Filter status: Needs replacement",
        ],
      })
    }, 3000)
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 p-2 border-b border-neutral-700">
        <Wifi className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-100">IoT Device Monitor</h3>
      </div>

      <div className="p-2 space-y-2">
        {/* Device List */}
        <div className="space-y-2">
          {devices.map((device) => (
            <div key={device.id} className="bg-neutral-800 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device.type)}
                  <span className="text-sm font-medium text-neutral-100">{device.name}</span>
                  {getStatusIcon(device.status)}
                </div>
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-400">
                  {device.lastSeen}
                </Badge>
              </div>

              {/* Device Metrics */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                {Object.entries(device.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-neutral-400 capitalize">{key}</div>
                    <div className="text-sm font-medium text-neutral-200">{String(value)}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-700 bg-transparent text-xs"
                  onClick={() => runDiagnostics(device.id)}
                  disabled={diagnostics.runningTests}
                >
                  {diagnostics.runningTests ? "Running..." : "Run Diagnostics"}
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Remote Control
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Results */}
        {diagnostics.results.length > 0 && (
          <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-2">
            <h4 className="text-sm font-medium text-blue-300 mb-1">Diagnostic Results</h4>
            <div className="space-y-1">
              {diagnostics.results.map((result, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-neutral-300">{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-neutral-600 text-neutral-300 bg-transparent text-xs"
          >
            Schedule Maintenance
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-neutral-600 text-neutral-300 bg-transparent text-xs"
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  )
}
