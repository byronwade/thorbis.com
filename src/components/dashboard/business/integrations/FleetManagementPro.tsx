"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Phone,
  Settings,
  Wrench,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  Route,
  Eye,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Camera,
  Download,
  Volume2,
  Maximize,
} from "lucide-react"
import { AtlantaMap } from "./AtlantaMap"
import { RealTimeTracker, RealTimeAlerts } from "./fleet/RealTimeTracker"
import { RouteVisualization, MapRouteVisualization } from "./fleet/RouteVisualization"
import { Vehicle3DIcon } from "./fleet/Vehicle3DIcon"
import { VehicleDetailsModal } from "./fleet/VehicleDetailsModal"
import { VehicleFilters } from "./fleet/VehicleFilters"

interface RealTimeAlert {
  id: string
  vehicleId: number
  type: "warning" | "error" | "info" | "success"
  message: string
  timestamp: Date
}

export default function FleetTracker() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    performance: false,
    maintenance: false,
    compliance: false,
    dispatch: false,
    costs: false,
  })
  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([])

  const [videoDialog, setVideoDialog] = useState<{
    isOpen: boolean
    vehicleName: string
    cameraType: "dash" | "driver"
    videoUrl: string
  }>({
    isOpen: false,
    vehicleName: "",
    cameraType: "dash",
    videoUrl: "",
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  interface Vehicle {
    id: number
    name: string
    type: "truck" | "van" | "sedan" | "suv"
    status: "active" | "idle" | "maintenance"
    location: string
    battery: number
    speed: number
    lat: number
    lng: number
    driver: string
    route: string
    eta: string
    lastUpdate: string
    tripDistance: number
    fuelLevel: number
    engineTemp: number
    oilPressure: number
    rpm: number
    avgFuelEconomy: number
    totalMileage: number
    nextMaintenance: number
    dashCam: {
      status: "online" | "offline"
      lastFrame: string
    }
    driverCam: {
      status: "online" | "offline"
      lastFrame: string
      aiFeatures: {
        eyeTracking: "active" | "inactive"
        attentionScore: number
        drowsinessLevel: "alert" | "drowsy" | "critical"
        distractionAlerts: number
      }
    }
    securitySystem: {
      doorSensors: "secure" | "breach"
      motionDetection: "active" | "triggered"
      cargoMonitoring: "secure" | "tampered"
      alarmStatus: "armed" | "disarmed" | "triggered"
    }
    weatherConditions: {
      temperature: number
      conditions: string
      visibility: string
      roadSurface: "dry" | "wet" | "icy"
      precipitation: number
    }
    fuelCard: {
      lastTransaction: {
        amount: number
        location: string
        timestamp: string
        suspicious: boolean
      }
      monthlySpend: number
      fraudAlerts: number
    }
    diagnosticCodes?: string[]
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleNewAlert = (alert: RealTimeAlert) => {
    setRealTimeAlerts([...realTimeAlerts, alert])
  }

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle.id.toString())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary"
      case "idle":
        return "bg-accent/10 text-accent"
      case "maintenance":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-border text-foreground"
    }
  }

  const handleDismissAlert = (alertId: string) => {
    setRealTimeAlerts(realTimeAlerts.filter((alert) => alert.id !== alertId))
  }

  const handleMapVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
  }

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    setVehicles(
      vehicles.map((vehicle) => (vehicle.id.toString() === vehicleId ? { ...vehicle, status: newStatus } : vehicle)),
    )
  }

  const openVideoDialog = (vehicleName: string, cameraType: "dash" | "driver", videoUrl: string) => {
    setVideoDialog({
      isOpen: true,
      vehicleName,
      cameraType,
      videoUrl,
    })
  }

  const closeVideoDialog = () => {
    setVideoDialog({
      isOpen: false,
      vehicleName: "",
      cameraType: "dash",
      videoUrl: "",
    })
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
    }
  }

  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Create download link
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${videoDialog.vehicleName}-${videoDialog.cameraType}-${new Date().toISOString()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number.parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        name: "TIR-1512MG",
        type: "truck",
        status: "active",
        location: "Hartsfield-Jackson Airport",
        battery: 87,
        speed: 45,
        lat: 33.6407,
        lng: -84.4277,
        driver: "Mike Johnson",
        route: "ATL → Savannah",
        eta: "2:30 PM",
        lastUpdate: "2 min ago",
        tripDistance: 7.8,
        fuelLevel: 78,
        engineTemp: 195,
        oilPressure: 35,
        rpm: 1850,
        avgFuelEconomy: 19.6,
        totalMileage: 145000,
        nextMaintenance: 2500,
        dashCam: {
          status: "online",
          lastFrame: "/truck-dashboard-highway-view.png",
        },
        driverCam: {
          status: "online",
          lastFrame: "/driver-facing-camera-normal.png",
          aiFeatures: {
            eyeTracking: "active",
            attentionScore: 92,
            drowsinessLevel: "alert",
            distractionAlerts: 0,
          },
        },
        securitySystem: {
          doorSensors: "secure",
          motionDetection: "active",
          cargoMonitoring: "secure",
          alarmStatus: "armed",
        },
        weatherConditions: {
          temperature: 68,
          conditions: "Clear",
          visibility: "8 miles",
          roadSurface: "dry",
          precipitation: 0,
        },
        fuelCard: {
          lastTransaction: {
            amount: 187.45,
            location: "Shell - Exit 42",
            timestamp: "2 hours ago",
            suspicious: false,
          },
          monthlySpend: 2340,
          fraudAlerts: 0,
        },
      },
      {
        id: 2,
        name: "TIR-1513MG",
        type: "van",
        status: "idle",
        location: "Georgia Tech",
        battery: 92,
        speed: 0,
        lat: 33.7756,
        lng: -84.3963,
        driver: "Sarah Davis",
        route: "ATL → Augusta",
        eta: "4:15 PM",
        lastUpdate: "5 min ago",
        tripDistance: 4.2,
        fuelLevel: 65,
        engineTemp: 180,
        oilPressure: 32,
        rpm: 0,
        avgFuelEconomy: 22.1,
        totalMileage: 89000,
        nextMaintenance: 1200,
        dashCam: {
          status: "online",
          lastFrame: "/van-interior-camera-parked-city.png",
        },
        driverCam: {
          status: "online",
          lastFrame: "/driver-facing-camera-alert.png",
          aiFeatures: {
            eyeTracking: "active",
            attentionScore: 78,
            drowsinessLevel: "alert",
            distractionAlerts: 2,
          },
        },
        securitySystem: {
          doorSensors: "secure",
          motionDetection: "active",
          cargoMonitoring: "secure",
          alarmStatus: "armed",
        },
        weatherConditions: {
          temperature: 72,
          conditions: "Partly Cloudy",
          visibility: "6 miles",
          roadSurface: "dry",
          precipitation: 0,
        },
        fuelCard: {
          lastTransaction: {
            amount: 145.2,
            location: "BP - Downtown",
            timestamp: "4 hours ago",
            suspicious: false,
          },
          monthlySpend: 1890,
          fraudAlerts: 0,
        },
      },
      {
        id: 3,
        name: "TIR-1514MG",
        type: "truck",
        status: "maintenance",
        location: "Service Center",
        battery: 45,
        speed: 0,
        lat: 33.749,
        lng: -84.388,
        driver: "Robert Wilson",
        route: "Maintenance",
        eta: "N/A",
        lastUpdate: "1 hour ago",
        tripDistance: 0,
        fuelLevel: 23,
        engineTemp: 160,
        oilPressure: 28,
        rpm: 0,
        avgFuelEconomy: 18.3,
        totalMileage: 198000,
        nextMaintenance: 0,
        dashCam: {
          status: "offline",
          lastFrame: "/truck-maintenance-bay.png",
        },
        driverCam: {
          status: "offline",
          lastFrame: "/driver-facing-camera-drowsy.png",
          aiFeatures: {
            eyeTracking: "inactive",
            attentionScore: 0,
            drowsinessLevel: "alert",
            distractionAlerts: 0,
          },
        },
        securitySystem: {
          doorSensors: "secure",
          motionDetection: "active",
          cargoMonitoring: "secure",
          alarmStatus: "disarmed",
        },
        weatherConditions: {
          temperature: 70,
          conditions: "Indoor",
          visibility: "N/A",
          roadSurface: "dry",
          precipitation: 0,
        },
        fuelCard: {
          lastTransaction: {
            amount: 0,
            location: "Service Center",
            timestamp: "1 day ago",
            suspicious: false,
          },
          monthlySpend: 1650,
          fraudAlerts: 1,
        },
        diagnosticCodes: ["P0420", "P0301"],
      },
    ]

    setVehicles(mockVehicles)
    setFilteredVehicles(mockVehicles)
  }, [])

  useEffect(() => {
    let filtered = vehicles

    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter((vehicle) => {
        if (regionFilter === "downtown") return vehicle.lat > 33.74 && vehicle.lat < 33.76
        if (regionFilter === "midtown") return vehicle.lat > 33.76 && vehicle.lat < 33.78
        if (regionFilter === "buckhead") return vehicle.lat > 33.78
        return true
      })
    }

    setFilteredVehicles(filtered)
  }, [vehicles, searchTerm, statusFilter, regionFilter])

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
  }

  const getStatusIcon = (status: string, fuelLevel: number) => {
    if (status === "maintenance") {
      return <div className="w-3 h-3 bg-destructive rounded-full" />
    }
    if (status === "active") {
      return (
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-500" />
      )
    }
    if (fuelLevel < 30) {
      return (
        <div className="w-3 h-3 bg-purple-500 rounded-full relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
      )
    }
    return (
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-500" />
    )
  }

  const selectedVehicleData = vehicles.find((v) => v.id.toString() === selectedVehicle)

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-card">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success/40 rounded-full"></div>
            <span className="text-muted-foreground">Fleet Efficiency:</span>
            <span className="text-success font-medium">87%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
            <span className="text-muted-foreground">Active Routes:</span>
            <span className="text-primary font-medium">{vehicles.filter((v) => v.status === "active").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning/40 rounded-full"></div>
            <span className="text-muted-foreground">Alerts:</span>
            <span className="text-warning font-medium">3</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-80 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-card/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Daily Revenue</div>
                <div className="text-lg font-bold text-success">$12,450</div>
                <div className="text-xs text-success">+8.2%</div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Fuel Costs</div>
                <div className="text-lg font-bold text-destructive">$2,180</div>
                <div className="text-xs text-destructive">+3.1%</div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">On-Time Rate</div>
                <div className="text-lg font-bold text-primary">94%</div>
                <div className="text-xs text-success">+2.1%</div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Safety Score</div>
                <div className="text-lg font-bold text-success">91</div>
                <div className="text-xs text-success">+1.5</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-card/50 ${
                    selectedVehicle === vehicle.id.toString()
                      ? "bg-primary/10 border border-primary/20 shadow-lg shadow-blue-500/5"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleVehicleSelect(vehicle.id.toString())}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(vehicle.status, vehicle.fuelLevel)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white text-base">{vehicle.name}</h3>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm font-medium text-primary">{vehicle.fuelLevel}%</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{vehicle.location}</div>

                      <div className="mb-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Dash Camera */}
                          <div
                            className="relative w-full h-20 bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              openVideoDialog(vehicle.name, "dash", "/placeholder-video.mp4")
                            }}
                          >
                            {vehicle.dashCam.status === "online" ? (
                              <img
                                src={vehicle.dashCam.lastFrame || "/placeholder.svg"}
                                alt={`${vehicle.name} dash cam`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-xs text-muted-foreground">Dash Cam {vehicle.dashCam.status}</div>
                              </div>
                            )}
                            <div className="absolute top-1 right-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  vehicle.dashCam.status === "online"
                                    ? "bg-success/40"
                                    : vehicle.dashCam.status === "offline"
                                      ? "bg-muted"
                                      : "bg-destructive/40"
                                }`}
                              />
                            </div>
                            <div className="absolute bottom-1 left-1 text-xs text-white bg-black/70 px-1 rounded">
                              DASH
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          {/* Driver Camera */}
                          <div
                            className="relative w-full h-20 bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              openVideoDialog(vehicle.name, "driver", "/placeholder-video.mp4")
                            }}
                          >
                            {vehicle.driverCam.status === "online" ? (
                              <img
                                src={vehicle.driverCam.lastFrame || "/placeholder.svg"}
                                alt={`${vehicle.name} driver cam`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-xs text-muted-foreground">Driver Cam {vehicle.driverCam.status}</div>
                              </div>
                            )}
                            <div className="absolute top-1 right-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  vehicle.driverCam.status === "online"
                                    ? "bg-success/40"
                                    : vehicle.driverCam.status === "offline"
                                      ? "bg-muted"
                                      : "bg-destructive/40"
                                }`}
                              />
                            </div>
                            <div className="absolute bottom-1 left-1 text-xs text-white bg-black/70 px-1 rounded">
                              DRIVER
                            </div>
                            {/* AI Alert Indicator */}
                            {vehicle.driverCam.aiFeatures.eyeTracking === "active" && (
                              <div className="absolute top-1 left-1">
                                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* AI Monitoring Status */}
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                            <span className="text-muted-foreground">AI: {vehicle.driverCam.aiFeatures.attentionScore}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-1 h-1 rounded-full ${
                                vehicle.securitySystem.alarmStatus === "armed"
                                  ? "bg-success/40"
                                  : vehicle.securitySystem.alarmStatus === "triggered"
                                    ? "bg-destructive/40"
                                    : "bg-muted"
                              }`}
                            />
                            <span className="text-muted-foreground">Security: {vehicle.securitySystem.alarmStatus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">{vehicle.driver}</div>
                        {vehicle.status === "active" && vehicle.speed > 0 && (
                          <div className="text-xs text-success font-medium">{vehicle.speed} mph</div>
                        )}
                      </div>
                      {vehicle.status === "active" && vehicle.tripDistance > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <div className="w-1 h-1 bg-muted rounded-full" />
                          {Math.round(vehicle.tripDistance * 60)} min remaining
                        </div>
                      )}
                      {vehicle.status === "maintenance" &&
                        vehicle.diagnosticCodes &&
                        vehicle.diagnosticCodes.length > 0 && (
                          <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {vehicle.diagnosticCodes.length} diagnostic code
                            {vehicle.diagnosticCodes.length > 1 ? "s" : ""}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Status Legend */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-500" />
                <span className="text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-muted-foreground">Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="text-muted-foreground">Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <AtlantaMap vehicles={vehicles} selectedVehicle={selectedVehicle} onVehicleSelect={handleMapVehicleSelect} />
        </div>

        {/* Right Sidebar - Vehicle Details with Expandable Sections */}
        {selectedVehicleData && (
          <div className="w-80 bg-card border-l border-border flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{selectedVehicleData.name}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-card border-border">
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Diagnostic Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Engine RPM:</span>
                            <span className="font-medium text-white">{selectedVehicleData.rpm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Engine Temp:</span>
                            <span className="font-medium text-white">{selectedVehicleData.engineTemp}°F</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Oil Pressure:</span>
                            <span className="font-medium text-white">{selectedVehicleData.oilPressure} PSI</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              {/* Overview Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("overview")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="font-medium text-white">Overview</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.overview ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.overview && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Status Indicators */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-card/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="text-sm font-medium text-success">On Time</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Battery</div>
                        <div className="text-sm font-medium text-white">{selectedVehicleData.battery}%</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Distance</div>
                        <div className="text-sm font-medium text-white">
                          {Math.round(selectedVehicleData.tripDistance)} mi
                        </div>
                      </div>
                    </div>

                    {/* Live OBD Data */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Live OBD Data</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="text-white">{selectedVehicleData.speed} mph</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RPM:</span>
                          <span className="text-white">{selectedVehicleData.rpm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engine Temp:</span>
                          <span className="text-white">{selectedVehicleData.engineTemp}°F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Oil Pressure:</span>
                          <span className="text-white">{selectedVehicleData.oilPressure} PSI</span>
                        </div>
                      </div>
                    </div>

                    {/* Camera Feeds */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Camera Feeds</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className="relative cursor-pointer hover:ring-2 hover:ring-blue-500 rounded transition-all"
                          onClick={() => openVideoDialog(selectedVehicleData.name, "dash", "/placeholder-video.mp4")}
                        >
                          <img
                            src={selectedVehicleData.dashCam.lastFrame || "/placeholder.svg"}
                            alt="Dash Cam"
                            className="w-full h-16 object-cover rounded border border-border"
                          />
                          <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">Dash</div>
                          <div
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${selectedVehicleData.dashCam.status === "online" ? "bg-success/40" : "bg-destructive/40"}`}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div
                          className="relative cursor-pointer hover:ring-2 hover:ring-blue-500 rounded transition-all"
                          onClick={() => openVideoDialog(selectedVehicleData.name, "driver", "/placeholder-video.mp4")}
                        >
                          <img
                            src={selectedVehicleData.driverCam.lastFrame || "/placeholder.svg"}
                            alt="Driver Cam"
                            className="w-full h-16 object-cover rounded border border-border"
                          />
                          <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                            Driver
                          </div>
                          <div
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${selectedVehicleData.driverCam.status === "online" ? "bg-success/40" : "bg-destructive/40"}`}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("performance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-medium text-white">Performance</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.performance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.performance && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Driver Score</div>
                        <div className="text-2xl font-bold text-success">94</div>
                        <div className="text-xs text-muted-foreground">+2 this week</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Fuel Economy</div>
                        <div className="text-2xl font-bold text-primary">7.2</div>
                        <div className="text-xs text-muted-foreground">MPG avg</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">On-time Delivery:</span>
                        <span className="text-success">98%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Safety Incidents:</span>
                        <span className="text-success">0 this month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Idle Time:</span>
                        <span className="text-warning">12 min/day</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("maintenance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-warning" />
                    <span className="font-medium text-white">Maintenance</span>
                    <div className="w-2 h-2 bg-warning/40 rounded-full"></div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.maintenance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.maintenance && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-warning/10 border border-orange-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-warning">Oil Change Due</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Due in 847 miles</div>
                      <div className="text-xs text-muted-foreground">Est. Cost: $89</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tire Pressure:</span>
                        <span className="text-success">Normal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Brake Pads:</span>
                        <span className="text-warning">65% remaining</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Service:</span>
                        <span className="text-white">2,340 miles ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("compliance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium text-white">Compliance</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.compliance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.compliance && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-card/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Hours of Service</div>
                      <div className="text-sm font-medium text-white">6.5 / 11 hours</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div className="bg-primary/40 h-2 rounded-full" style={{ width: "59%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">DOT Inspection:</span>
                        <span className="text-success">Valid</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CDL Status:</span>
                        <span className="text-success">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Medical Cert:</span>
                        <span className="text-warning">Expires 3/2025</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dispatch Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("dispatch")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-white">Dispatch</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.dispatch ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.dispatch && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="text-sm font-medium text-primary mb-1">Current Job</div>
                      <div className="text-xs text-muted-foreground">Pickup: Atlanta Warehouse</div>
                      <div className="text-xs text-muted-foreground">Delivery: Birmingham, AL</div>
                      <div className="text-xs text-muted-foreground">ETA: 2:30 PM</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route Efficiency:</span>
                        <span className="text-success">96%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Job:</span>
                        <span className="text-white">4:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Jobs Today:</span>
                        <span className="text-white">3 of 5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Costs Section */}
              <div>
                <button
                  onClick={() => toggleSection("costs")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="font-medium text-white">Costs</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.costs ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.costs && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-card/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Today</div>
                        <div className="text-sm font-medium text-white">$127</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">This Week</div>
                        <div className="text-sm font-medium text-white">$892</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fuel Cost:</span>
                        <span className="text-white">$89.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Maintenance:</span>
                        <span className="text-white">$23.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Driver Pay:</span>
                        <span className="text-white">$156.00</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t border-border pt-2">
                        <span className="text-muted-foreground">Profit:</span>
                        <span className="text-success">$234.50</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={videoDialog.isOpen} onOpenChange={closeVideoDialog}>
        <DialogContent className="max-w-4xl w-full bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {videoDialog.vehicleName} - {videoDialog.cameraType === "dash" ? "Dash Camera" : "Driver Camera"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-96 object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                poster={
                  videoDialog.cameraType === "dash"
                    ? "/truck-dashboard-highway-view.png"
                    : "/driver-facing-camera-normal.png"
                }
              >
                <source src={videoDialog.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={skipBackward} className="text-white hover:bg-white/20">
                      <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button variant="ghost" size="sm" onClick={skipForward} className="text-white hover:bg-white/20">
                      <SkipForward className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 ml-4">
                      <Volume2 className="w-4 h-4 text-white" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={takeScreenshot}
                      className="text-white hover:bg-white/20"
                      title="Take Screenshot"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>

                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" title="Fullscreen">
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Live Feed: {videoDialog.cameraType === "dash" ? "Road View" : "Driver Monitoring"}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success/40 rounded-full"></div>
                  <span>Recording</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground border-border hover:bg-card bg-transparent"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}