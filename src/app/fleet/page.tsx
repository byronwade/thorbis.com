"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Navigation,
  Clock,
  History,
  Fuel,
  Flag,
} from "lucide-react"
import { AtlantaMap } from "@/components/fleet/atlanta-map"
import type { RealTimeAlert } from "@/types/fleet"

export default function FleetTracker() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    route: false,
    performance: false,
    maintenance: false,
    compliance: false,
    dispatch: true,
    costs: false,
    routeHistory: false,
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
    type: "sedan" | "suv" | "van" | "coupe" | "bus" | "truck"
    lat: number
    lng: number
    status: "active" | "idle" | "maintenance" | "offline"
    speed: number
    destination: string
    driver: string
    driverPhone: string
    licensePlate: string
    fuelLevel: number
    mileage: number
    lastMaintenance: string
    nextMaintenance: string
    route: string[]
    estimatedArrival: string
    batteryLevel?: number
    engineTemp: number
    alerts: string[]
    // Additional properties for the fleet tracker
    location: string
    battery: number
    destinationLat?: number
    destinationLng?: number
    destinationName?: string
    eta: string
    lastUpdate: string
    tripDistance: number
    oilPressure: number
    rpm: number
    avgFuelEconomy: number
    totalMileage: number
    nextMaintenanceMiles: number
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

  const toggleSection = (section: keyof typeof expandedSections) => {
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

  const handleMapVehicleSelect = useCallback((vehicleId: string) => {
    setSelectedVehicle(vehicleId)
  }, [])

  const handleStatusChange = (vehicleId: string, newStatus: Vehicle["status"]) => {
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
        speed: 65,
        lat: 33.6407,
        lng: -84.4277,
        destination: "Downtown Atlanta Distribution Center",
        destinationLat: 33.749,
        destinationLng: -84.388,
        destinationName: "Downtown Atlanta Distribution Center",
        driver: "Mike Johnson",
        driverPhone: "+1-555-0123",
        licensePlate: "TIR-1512",
        fuelLevel: 78,
        mileage: 145000,
        lastMaintenance: "2024-01-15",
        nextMaintenance: "2500",
        route: ["I-85 North"],
        estimatedArrival: "2:45 PM",
        eta: "2:45 PM",
        lastUpdate: "2 min ago",
        tripDistance: 12.5,
        engineTemp: 195,
        oilPressure: 45,
        rpm: 1850,
        avgFuelEconomy: 8.2,
        totalMileage: 145000,
        nextMaintenanceMiles: 2500,
        alerts: [],
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
            location: "Shell Station - I-85",
            timestamp: "1 hour ago",
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
        destination: "Buckhead Shopping District",
        destinationLat: 33.8484,
        destinationLng: -84.3781,
        destinationName: "Buckhead Shopping District",
        driver: "Sarah Davis",
        driverPhone: "+1-555-0124",
        licensePlate: "TIR-1513",
        fuelLevel: 85,
        mileage: 89000,
        lastMaintenance: "2024-01-10",
        nextMaintenance: "1200",
        route: ["Peachtree St"],
        estimatedArrival: "3:15 PM",
        eta: "3:15 PM",
        lastUpdate: "5 min ago",
        tripDistance: 8.3,
        engineTemp: 180,
        oilPressure: 42,
        rpm: 0,
        avgFuelEconomy: 12.5,
        totalMileage: 89000,
        nextMaintenanceMiles: 1200,
        alerts: [],
        dashCam: {
          status: "online",
          lastFrame: "/van-interior-camera-parked-city.png",
        },
        driverCam: {
          status: "online",
          lastFrame: "/driver-facing-camera-alert.png",
          aiFeatures: {
            eyeTracking: "active",
            attentionScore: 88,
            drowsinessLevel: "alert",
            distractionAlerts: 1,
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
          visibility: "10 miles",
          roadSurface: "dry",
          precipitation: 0,
        },
        fuelCard: {
          lastTransaction: {
            amount: 95.2,
            location: "BP Station - Midtown",
            timestamp: "3 hours ago",
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
        destination: "Marietta Warehouse",
        destinationLat: 33.9526,
        destinationLng: -84.5499,
        destinationName: "Marietta Warehouse",
        driver: "Carlos Rodriguez",
        driverPhone: "+1-555-0125",
        licensePlate: "TIR-1514",
        fuelLevel: 32,
        mileage: 203000,
        lastMaintenance: "2024-01-05",
        nextMaintenance: "500",
        route: ["I-75 North"],
        estimatedArrival: "4:30 PM",
        eta: "4:30 PM",
        lastUpdate: "15 min ago",
        tripDistance: 15.7,
        engineTemp: 210,
        oilPressure: 38,
        rpm: 0,
        avgFuelEconomy: 7.8,
        totalMileage: 203000,
        nextMaintenanceMiles: 500,
        alerts: ["Engine warning light", "Low oil pressure"],
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
          conditions: "Overcast",
          visibility: "6 miles",
          roadSurface: "wet",
          precipitation: 0.1,
        },
        fuelCard: {
          lastTransaction: {
            amount: 220.15,
            location: "Truck Stop - I-75",
            timestamp: "6 hours ago",
            suspicious: false,
          },
          monthlySpend: 2890,
          fraudAlerts: 1,
        },
        diagnosticCodes: ["P0171", "P0300"],
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
      return <div className="w-3 h-3 bg-red-500 rounded-full" />
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
      <div className="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Fleet Efficiency:</span>
            <span className="text-green-400 font-medium">87%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Active Routes:</span>
            <span className="text-blue-400 font-medium">{vehicles.filter((v) => v.status === "active").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Alerts:</span>
            <span className="text-yellow-400 font-medium">3</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-800 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Daily Revenue</div>
                <div className="text-lg font-bold text-green-400">$12,450</div>
                <div className="text-xs text-green-400">+8.2%</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Fuel Costs</div>
                <div className="text-lg font-bold text-red-400">$2,180</div>
                <div className="text-xs text-red-400">+3.1%</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">On-Time Rate</div>
                <div className="text-lg font-bold text-blue-400">94%</div>
                <div className="text-xs text-green-400">+2.1%</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Safety Score</div>
                <div className="text-lg font-bold text-green-400">91</div>
                <div className="text-xs text-green-400">+1.5</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search vehicles, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-900/50 ${
                    selectedVehicle === vehicle.id.toString()
                      ? "bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5"
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm font-medium text-blue-400">{vehicle.fuelLevel}%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">{vehicle.location}</div>

                      <div className="mb-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Dash Camera */}
                          <div
                            className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
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
                                <div className="text-xs text-gray-500">Dash Cam {vehicle.dashCam.status}</div>
                              </div>
                            )}
                            <div className="absolute top-1 right-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  vehicle.dashCam.status === "online"
                                    ? "bg-green-400"
                                    : vehicle.dashCam.status === "offline"
                                      ? "bg-gray-500"
                                      : "bg-red-400"
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
                            className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
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
                                <div className="text-xs text-gray-500">Driver Cam {vehicle.driverCam.status}</div>
                              </div>
                            )}
                            <div className="absolute top-1 right-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  vehicle.driverCam.status === "online"
                                    ? "bg-green-400"
                                    : vehicle.driverCam.status === "offline"
                                      ? "bg-gray-500"
                                      : "bg-red-400"
                                }`}
                              />
                            </div>
                            <div className="absolute bottom-1 left-1 text-xs text-white bg-black/70 px-1 rounded">
                              DRIVER
                            </div>
                            {/* AI Alert Indicator */}
                            {vehicle.driverCam.aiFeatures.eyeTracking === "active" && (
                              <div className="absolute top-1 left-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            <span className="text-gray-400">AI: {vehicle.driverCam.aiFeatures.attentionScore}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-1 h-1 rounded-full ${
                                vehicle.securitySystem.alarmStatus === "armed"
                                  ? "bg-green-400"
                                  : vehicle.securitySystem.alarmStatus === "triggered"
                                    ? "bg-red-400"
                                    : "bg-gray-500"
                              }`}
                            />
                            <span className="text-gray-400">Security: {vehicle.securitySystem.alarmStatus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{vehicle.driver}</div>
                        {vehicle.status === "active" && vehicle.speed > 0 && (
                          <div className="text-xs text-green-400 font-medium">{vehicle.speed} mph</div>
                        )}
                      </div>
                      {vehicle.status === "active" && vehicle.tripDistance > 0 && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-600 rounded-full" />
                          {Math.round(vehicle.tripDistance * 60)} min remaining
                        </div>
                      )}
                      {vehicle.status === "maintenance" &&
                        vehicle.diagnosticCodes &&
                        vehicle.diagnosticCodes.length > 0 && (
                          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
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
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-500" />
                <span className="text-gray-400">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-400">Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-400">Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-full">
          <AtlantaMap vehicles={vehicles} selectedVehicle={selectedVehicle} onVehicleSelect={handleMapVehicleSelect} />
        </div>

        {/* Right Sidebar */}
        {selectedVehicleData && (
          <div className="w-80 bg-gray-950 border-l border-gray-800 flex flex-col min-h-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{selectedVehicleData.name}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-gray-900 border-gray-700">
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Diagnostic Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Engine RPM:</span>
                            <span className="font-medium text-white">{selectedVehicleData.rpm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Engine Temp:</span>
                            <span className="font-medium text-white">{selectedVehicleData.engineTemp}°F</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Oil Pressure:</span>
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
              <div className="border-b border-gray-800">
                <button
                  onClick={() => toggleSection("overview")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">Overview</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.overview ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.overview && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Status Indicators */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Status</div>
                        <div className="text-sm font-medium text-green-400">On Time</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Battery</div>
                        <div className="text-sm font-medium text-white">{selectedVehicleData.battery}%</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Distance</div>
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
                          <span className="text-gray-400">Speed:</span>
                          <span className="text-white">{selectedVehicleData.speed} mph</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">RPM:</span>
                          <span className="text-white">{selectedVehicleData.rpm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Engine Temp:</span>
                          <span className="text-white">{selectedVehicleData.engineTemp}°F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oil Pressure:</span>
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
                            className="w-full h-16 object-cover rounded border border-gray-700"
                          />
                          <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">Dash</div>
                          <div
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${selectedVehicleData.dashCam.status === "online" ? "bg-green-400" : "bg-red-400"}`}
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
                            className="w-full h-16 object-cover rounded border border-gray-700"
                          />
                          <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                            Driver
                          </div>
                          <div
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${selectedVehicleData.driverCam.status === "online" ? "bg-green-400" : "bg-red-400"}`}
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
              <div className="border-b border-gray-800">
                <button
                  onClick={() => toggleSection("performance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-white">Performance</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.performance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.performance && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Driver Score</div>
                        <div className="text-2xl font-bold text-green-400">94</div>
                        <div className="text-xs text-gray-400">+2 this week</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Fuel Economy</div>
                        <div className="text-2xl font-bold text-blue-400">7.2</div>
                        <div className="text-xs text-gray-400">MPG avg</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">On-time Delivery:</span>
                        <span className="text-green-400">98%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Safety Incidents:</span>
                        <span className="text-green-400">0 this month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Idle Time:</span>
                        <span className="text-yellow-400">12 min/day</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Section */}
              <div className="border-b border-gray-800">
                <button
                  onClick={() => toggleSection("maintenance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-white">Maintenance</span>
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.maintenance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.maintenance && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">Oil Change Due</span>
                      </div>
                      <div className="text-xs text-gray-400">Due in 847 miles</div>
                      <div className="text-xs text-gray-400">Est. Cost: $89</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tire Pressure:</span>
                        <span className="text-green-400">Normal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Brake Pads:</span>
                        <span className="text-yellow-400">65% remaining</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Service:</span>
                        <span className="text-white">2,340 miles ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Section */}
              <div className="border-b border-gray-800">
                <button
                  onClick={() => toggleSection("compliance")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">Compliance</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.compliance ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.compliance && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Hours of Service</div>
                      <div className="text-sm font-medium text-white">6.5 / 11 hours</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: "59%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">DOT Inspection:</span>
                        <span className="text-green-400">Valid</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CDL Status:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Medical Cert:</span>
                        <span className="text-yellow-400">Expires 3/2025</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dispatch & Navigation - Timeline Design */}
              <div className="border-b border-gray-800">
                <button
                  onClick={() => setExpandedSections((prev) => ({ ...prev, dispatch: !prev.dispatch }))}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-white">Dispatch & Navigation</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.dispatch ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.dispatch && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Current Job Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-400 mb-2">Current Job</div>
                      <div className="text-xs text-gray-400">Pickup: Atlanta Warehouse</div>
                      <div className="text-xs text-gray-400">Delivery: {selectedVehicleData.destinationName}</div>
                      <div className="text-xs text-gray-400">ETA: {selectedVehicleData.eta}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Distance: {Math.round(selectedVehicleData.tripDistance)} miles
                      </div>
                    </div>

                    {/* Route Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Route Progress:</span>
                        <span className="text-white">65%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>

                    {/* Timeline - Route & Directions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-purple-400" />
                        Route Timeline
                      </h4>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-700"></div>

                        {/* Timeline items */}
                        <div className="space-y-4">
                          {/* Current Position */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Current Location</div>
                              <div className="text-xs text-gray-400">{selectedVehicleData.route}</div>
                              <div className="text-xs text-blue-400">Continue for 8.2 miles</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">Now</div>
                          </div>

                          {/* Next Direction */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              ↗
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Take Exit 249A</div>
                              <div className="text-xs text-gray-400">Toward Downtown Atlanta</div>
                              <div className="text-xs text-orange-400">In 8.2 miles</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">2:10 PM</div>
                          </div>

                          {/* Rest Stop */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              ⏸
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Rest Stop</div>
                              <div className="text-xs text-gray-400">Mile 45 - 15 min break</div>
                              <div className="text-xs text-yellow-400">Mandatory break</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">2:15 PM</div>
                          </div>

                          {/* Turn */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              ↻
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Turn Right</div>
                              <div className="text-xs text-gray-400">Onto Peachtree Street</div>
                              <div className="text-xs text-purple-400">Continue 2.1 miles</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">2:35 PM</div>
                          </div>

                          {/* Fuel Stop */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              <Fuel className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Fuel Stop</div>
                              <div className="text-xs text-gray-400">Shell Station - 10 min stop</div>
                              <div className="text-xs text-blue-400">Scheduled refuel</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">2:45 PM</div>
                          </div>

                          {/* Final Destination */}
                          <div className="flex items-start gap-3">
                            <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              <Flag className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-sm text-white font-medium">Final Destination</div>
                              <div className="text-xs text-gray-400">{selectedVehicleData.destinationName}</div>
                              <div className="text-xs text-green-400">Delivery complete</div>
                            </div>
                            <div className="text-xs text-gray-400 pt-1">{selectedVehicleData.eta}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Route Efficiency</div>
                        <div className="text-sm font-medium text-green-400">96%</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Jobs Today</div>
                        <div className="text-sm font-medium text-white">3 of 5</div>
                      </div>
                    </div>

                    {/* Next Job Info */}
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="text-sm font-medium text-purple-400 mb-1">Next Job</div>
                      <div className="text-xs text-gray-400">Scheduled: 4:00 PM</div>
                      <div className="text-xs text-gray-400">Pickup: Birmingham Distribution</div>
                      <div className="text-xs text-gray-400">Delivery: Montgomery, AL</div>
                    </div>

                    {/* Route Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Time Remaining</div>
                        <div className="text-sm font-medium text-white">1h 23m</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Miles Remaining</div>
                        <div className="text-sm font-medium text-white">8.7 mi</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Route History Section */}
              <div className="border-b border-gray-800">
                <button
                  onClick={() => setExpandedSections((prev) => ({ ...prev, routeHistory: !prev.routeHistory }))}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-white">Route History</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.routeHistory ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.routeHistory && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Recent Routes Summary */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Today</div>
                        <div className="text-sm font-medium text-white">3</div>
                        <div className="text-xs text-green-400">Routes</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">This Week</div>
                        <div className="text-sm font-medium text-white">18</div>
                        <div className="text-xs text-blue-400">Routes</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Avg Time</div>
                        <div className="text-sm font-medium text-white">2.4h</div>
                        <div className="text-xs text-purple-400">Per Route</div>
                      </div>
                    </div>

                    {/* Recent Routes List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        Recent Routes
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {/* Route 1 */}
                        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">Atlanta → Buckhead</div>
                            <div className="text-xs text-green-400">Completed</div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="text-white">12.4 miles</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="text-white">1h 45m</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Used:</span>
                              <span className="text-white">2.1 gal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="text-white">Today 11:30 AM</span>
                            </div>
                          </div>
                        </div>

                        {/* Route 2 */}
                        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">Atlanta → Marietta</div>
                            <div className="text-xs text-green-400">Completed</div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="text-white">18.7 miles</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="text-white">2h 15m</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Used:</span>
                              <span className="text-white">3.2 gal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="text-white">Today 8:45 AM</span>
                            </div>
                          </div>
                        </div>

                        {/* Route 3 */}
                        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">Atlanta → Decatur</div>
                            <div className="text-xs text-green-400">Completed</div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="text-white">8.9 miles</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="text-white">1h 20m</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Used:</span>
                              <span className="text-white">1.5 gal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="text-white">Yesterday 4:20 PM</span>
                            </div>
                          </div>
                        </div>

                        {/* Route 4 */}
                        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">Atlanta → Sandy Springs</div>
                            <div className="text-xs text-yellow-400">Delayed</div>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="text-white">15.2 miles</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="text-white">2h 45m</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Used:</span>
                              <span className="text-white">2.8 gal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="text-white">Yesterday 2:10 PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Trends */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        Performance Trends
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                          <div className="text-xs text-green-400">On-Time Rate</div>
                          <div className="text-sm font-medium text-white">94%</div>
                          <div className="text-xs text-green-400">↑ 2% vs last week</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                          <div className="text-xs text-blue-400">Avg MPG</div>
                          <div className="text-sm font-medium text-white">8.4</div>
                          <div className="text-xs text-blue-400">↑ 0.3 vs last week</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Costs Section */}
              <div>
                <button
                  onClick={() => toggleSection("costs")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-white">Costs</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.costs ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.costs && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Today</div>
                        <div className="text-sm font-medium text-white">$127</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">This Week</div>
                        <div className="text-sm font-medium text-white">$892</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Fuel Cost:</span>
                        <span className="text-white">$89.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Maintenance:</span>
                        <span className="text-white">$23.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Driver Pay:</span>
                        <span className="text-white">$156.00</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t border-gray-700 pt-2">
                        <span className="text-gray-400">Profit:</span>
                        <span className="text-green-400">$234.50</span>
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
        <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-700">
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
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
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
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
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
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>Live Feed: {videoDialog.cameraType === "dash" ? "Road View" : "Driver Monitoring"}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Recording</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-600 hover:bg-gray-800 bg-transparent"
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
