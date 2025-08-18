export interface RealTimeAlert {
  id: string
  vehicleId: string
  type: "speed" | "maintenance" | "route" | "fuel" | "engine" | "geofence"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: number
  acknowledged: boolean
  location?: {
    lat: number
    lng: number
    address?: string
  }
}

export interface GeofenceEvent {
  id: string
  vehicleId: string
  type: "enter" | "exit" | "dwell"
  geofenceId: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  timestamp: number
  duration?: number // for dwell events
}

export interface TrafficData {
  id: string
  roadSegment: string
  congestionLevel: "low" | "medium" | "high"
  averageSpeed: number
  speedLimit: number
  incidents: Array<{
    type: "accident" | "construction" | "closure" | "weather"
    severity: "minor" | "major" | "severe"
    description: string
    estimatedClearTime?: number
  }>
  lastUpdated: number
}

export interface RouteSegment {
  id: string
  startPoint: {
    lat: number
    lng: number
    address?: string
  }
  endPoint: {
    lat: number
    lng: number
    address?: string
  }
  distance: number // in miles
  estimatedTime: number // in minutes
  roadType: "highway" | "arterial" | "local" | "residential"
  trafficCondition: "free" | "light" | "moderate" | "heavy" | "severe"
}

export interface VehiclePosition {
  vehicleId: string
  lat: number
  lng: number
  heading: number // degrees from north
  speed: number // mph
  timestamp: number
  accuracy: number // GPS accuracy in meters
  altitude?: number
  isMoving: boolean
}
