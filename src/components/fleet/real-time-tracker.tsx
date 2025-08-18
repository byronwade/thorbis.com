"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  Bell,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Radio,
} from "lucide-react"
import type { Vehicle } from "./vehicle-details-modal"

interface RealTimeTrackerProps {
  vehicles: Vehicle[]
  onVehiclesUpdate: (vehicles: Vehicle[]) => void
  onAlert: (alert: RealTimeAlert) => void
}

export interface RealTimeAlert {
  id: string
  vehicleId: number
  type: "warning" | "error" | "info" | "success"
  message: string
  timestamp: Date
}

export function RealTimeTracker({ vehicles, onVehiclesUpdate, onAlert }: RealTimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [updateInterval, setUpdateInterval] = useState(3000)
  const [dataTransferred, setDataTransferred] = useState(0)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  // Simulate more realistic vehicle movement and updates
  const updateVehicles = useCallback(() => {
    if (!isTracking) return

    setLastUpdate(new Date())
    setDataTransferred((prev) => prev + Math.random() * 50 + 10) // KB transferred

    const updatedVehicles = vehicles.map((vehicle) => {
      const prevSpeed = vehicle.speed
      const prevFuelLevel = vehicle.fuelLevel
      const prevBatteryLevel = vehicle.batteryLevel

      // More realistic movement patterns
      let newSpeed = vehicle.speed
      if (vehicle.status === "active") {
        // Simulate traffic conditions and speed variations
        const speedVariation = (Math.random() - 0.5) * 10
        newSpeed = Math.max(15, Math.min(65, vehicle.speed + speedVariation))
      } else {
        newSpeed = 0
      }

      // More realistic position updates based on speed
      const speedFactor = newSpeed / 60 // Convert to position change factor
      const newLat = vehicle.lat + (Math.random() - 0.5) * 0.001 * speedFactor
      const newLng = vehicle.lng + (Math.random() - 0.5) * 0.001 * speedFactor

      // Fuel/battery consumption based on speed and status
      let newFuelLevel = vehicle.fuelLevel
      let newBatteryLevel = vehicle.batteryLevel

      if (vehicle.status === "active") {
        const consumptionRate = (newSpeed / 100) * 0.1 + Math.random() * 0.05
        if (vehicle.type !== "truck") {
          newFuelLevel = Math.max(0, vehicle.fuelLevel - consumptionRate)
        }
        if (vehicle.batteryLevel) {
          newBatteryLevel = Math.max(0, vehicle.batteryLevel - consumptionRate * 0.8)
        }
      }

      // Engine temperature based on activity
      let newEngineTemp = vehicle.engineTemp
      if (vehicle.status === "active") {
        newEngineTemp = Math.min(240, 180 + (newSpeed / 60) * 40 + Math.random() * 10)
      } else {
        newEngineTemp = Math.max(160, vehicle.engineTemp - 2)
      }

      // Generate alerts based on conditions
      if (alertsEnabled) {
        // Low fuel alert
        if (newFuelLevel < 20 && prevFuelLevel >= 20 && vehicle.type !== "truck") {
          onAlert({
            id: `fuel-${vehicle.id}-${Date.now()}`,
            vehicleId: vehicle.id,
            type: "warning",
            message: `${vehicle.name} has low fuel (${Math.round(newFuelLevel)}%)`,
            timestamp: new Date(),
          })
        }

        // Low battery alert
        if (newBatteryLevel && newBatteryLevel < 25 && (prevBatteryLevel || 100) >= 25) {
          onAlert({
            id: `battery-${vehicle.id}-${Date.now()}`,
            vehicleId: vehicle.id,
            type: "warning",
            message: `${vehicle.name} has low battery (${Math.round(newBatteryLevel)}%)`,
            timestamp: new Date(),
          })
        }

        // High engine temperature alert
        if (newEngineTemp > 220 && vehicle.engineTemp <= 220) {
          onAlert({
            id: `temp-${vehicle.id}-${Date.now()}`,
            vehicleId: vehicle.id,
            type: "error",
            message: `${vehicle.name} engine temperature high (${Math.round(newEngineTemp)}°F)`,
            timestamp: new Date(),
          })
        }

        // Speed alerts
        if (newSpeed > 60 && prevSpeed <= 60) {
          onAlert({
            id: `speed-${vehicle.id}-${Date.now()}`,
            vehicleId: vehicle.id,
            type: "info",
            message: `${vehicle.name} exceeding speed limit (${Math.round(newSpeed)} mph)`,
            timestamp: new Date(),
          })
        }
      }

      return {
        ...vehicle,
        lat: newLat,
        lng: newLng,
        speed: Math.round(newSpeed),
        fuelLevel: Math.round(newFuelLevel * 10) / 10,
        batteryLevel: newBatteryLevel ? Math.round(newBatteryLevel * 10) / 10 : undefined,
        engineTemp: Math.round(newEngineTemp),
      }
    })

    onVehiclesUpdate(updatedVehicles)
  }, [vehicles, isTracking, alertsEnabled, onVehiclesUpdate, onAlert])

  // Real-time tracking effect
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(updateVehicles, updateInterval)
    return () => clearInterval(interval)
  }, [updateVehicles, updateInterval, isTracking])

  // Simulate connection status changes
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      const random = Math.random()
      if (random < 0.02) {
        // 2% chance of connection issues
        setConnectionStatus("connecting")
        setTimeout(() => {
          setConnectionStatus(Math.random() < 0.8 ? "connected" : "disconnected")
        }, 2000)
      }
    }, 5000)

    return () => clearInterval(connectionInterval)
  }, [])

  const handleTrackingToggle = () => {
    setIsTracking(!isTracking)
    if (!isTracking) {
      setLastUpdate(new Date())
    }
  }

  const handleRefresh = () => {
    setLastUpdate(new Date())
    updateVehicles()
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-primary" />
      case "connecting":
        return <RefreshCw className="w-4 h-4 text-accent animate-spin" />
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-destructive" />
    }
  }

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return <Badge className="bg-primary text-primary-foreground">Connected</Badge>
      case "connecting":
        return <Badge className="bg-accent text-accent-foreground">Connecting...</Badge>
      case "disconnected":
        return <Badge className="bg-destructive text-destructive-foreground">Disconnected</Badge>
    }
  }

  return (
    <div className="p-3 border-b border-border">
      {/* Streamlined Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Live Tracking</span>
          {getConnectionBadge()}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio className="w-3 h-3" />
          <div className="flex gap-1">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isTracking}
              onCheckedChange={handleTrackingToggle}
              disabled={connectionStatus === "disconnected"}
              className="scale-75"
            />
            <span className="text-xs font-medium">{isTracking ? "Active" : "Paused"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} className="scale-75" />
            <Bell className={`w-3 h-3 ${alertsEnabled ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTrackingToggle}
            disabled={connectionStatus === "disconnected"}
            className="h-7 px-2 text-xs"
          >
            {isTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={connectionStatus === "disconnected"}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {getConnectionIcon()}
          <span className="capitalize">{connectionStatus}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{lastUpdate.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{Math.round(dataTransferred)} KB</span>
        </div>
      </div>
    </div>
  )
}

interface RealTimeAlertsProps {
  alerts: RealTimeAlert[]
  onDismissAlert: (alertId: string) => void
  vehicles: Vehicle[]
}

export function RealTimeAlerts({ alerts, onDismissAlert, vehicles }: RealTimeAlertsProps) {
  const getAlertIcon = (type: RealTimeAlert["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-accent" />
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-primary" />
      case "info":
        return <Zap className="w-4 h-4 text-foreground" />
    }
  }

  const getAlertBadgeColor = (type: RealTimeAlert["type"]) => {
    switch (type) {
      case "error":
        return "bg-destructive text-destructive-foreground"
      case "warning":
        return "bg-accent text-accent-foreground"
      case "success":
        return "bg-primary text-primary-foreground"
      case "info":
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="p-3 border-b border-border">
        {/* Simplified no-alerts state */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>All systems operational</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 border-b border-border">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Alerts</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {alerts.length}
            </Badge>
          </div>
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {alerts.slice(0, 3).map((alert) => {
            const vehicle = vehicles.find((v) => v.id === alert.vehicleId)
            return (
              <div key={alert.id} className="flex items-center gap-2 p-2 bg-accent/5 rounded border border-border/50">
                <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className={`text-xs px-1 py-0 ${getAlertBadgeColor(alert.type)}`}>
                      {alert.type.charAt(0).toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-medium truncate">{alert.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismissAlert(alert.id)}
                  className="flex-shrink-0 h-5 w-5 p-0 text-xs"
                >
                  ×
                </Button>
              </div>
            )
          })}
        </div>

        {alerts.length > 3 && (
          <div className="text-center text-xs text-muted-foreground">+{alerts.length - 3} more alerts</div>
        )}
      </div>
    </div>
  )
}
