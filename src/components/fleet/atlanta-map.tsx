"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import type { Vehicle } from "./vehicle-details-modal"
import type { google } from "googlemaps"

declare global {
  interface Window {
    google: any
    initGoogleMap: () => void
  }
}

interface AtlantaMapProps {
  vehicles: Vehicle[]
  selectedVehicle: string | null
  onVehicleSelect: (vehicleId: string) => void
}

interface GasStation {
  place_id: string
  name: string
  lat: number
  lng: number
  rating: number
  price_level?: number
  vicinity: string
  isOpen?: boolean
  openingHours?: string
}

interface VehiclePosition {
  lat: number
  lng: number
  heading: number
  speed: number
  timestamp: number
}

interface NavigationState {
  isNavigating: boolean
  currentStep: number
  totalSteps: number
  distanceRemaining: string
  timeRemaining: string
  nextInstruction: string
  currentRoute: any
  routeProgress: number
}

interface DriverStatus {
  status: "en_route" | "arrived" | "picking_up" | "delivering" | "completed"
  eta: string
  lastUpdate: number
}

interface TrafficData {
  congestionLevel: "low" | "moderate" | "heavy"
  alternateRouteAvailable: boolean
  estimatedDelay: number
}

export function AtlantaMap({ vehicles, selectedVehicle, onVehicleSelect }: AtlantaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRenderersRef = useRef<Map<string, any>>(new Map())
  const vehiclePolylinesRef = useRef<Map<string, any>>(new Map())
  const markersRef = useRef<any[]>([])
  const currentInfoWindowRef = useRef<any>(null)
  const vehicleMarkersRef = useRef<any[]>([])
  const gasStationMarkersRef = useRef<any[]>([])
  const placesServiceRef = useRef<any>(null)
  const [gasStations, setGasStations] = useState<GasStation[]>([])
  const [showGasStations, setShowGasStations] = useState(true)

  const animationFrameRef = useRef<number>()
  const updateIntervalRef = useRef<NodeJS.Timeout>()
  const trafficUpdateRef = useRef<NodeJS.Timeout>()

  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [vehiclePositions, setVehiclePositions] = useState<Map<string, VehiclePosition>>(new Map())

  const [driverStatuses, setDriverStatuses] = useState<Map<string, DriverStatus>>(new Map())
  const [trafficData, setTrafficData] = useState<Map<string, TrafficData>>(new Map())
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: 0,
    totalSteps: 0,
    distanceRemaining: "",
    timeRemaining: "",
    nextInstruction: "",
    currentRoute: null,
    routeProgress: 0,
  })

  const memoizedVehicles = useMemo(() => vehicles, [vehicles])

  const stableOnVehicleSelect = useCallback(
    (vehicleId: string) => {
      onVehicleSelect(vehicleId)
    },
    [onVehicleSelect],
  )

  const generateAllVehicleRoutes = useCallback(
    (map: any) => {
      if (!map || !directionsServiceRef.current || !window.google) {
        console.log("[v0] Cannot generate routes - missing dependencies")
        return
      }

      console.log("[v0] 🗺️ Generating routes for all fleet vehicles")

      // Clear existing routes
      directionsRenderersRef.current.forEach((renderer) => {
        renderer.setMap(null)
      })
      directionsRenderersRef.current = []

      const colors = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"]

      memoizedVehicles.forEach((vehicle, index) => {
        if (!vehicle.destinationLat || !vehicle.destinationLng) {
          console.log(`[v0] Skipping vehicle without destination: ${vehicle.name}`)
          return
        }

        console.log(`[v0] Generating route for ${vehicle.name} to ${vehicle.destinationName}`)

        const request = {
          origin: new window.google.maps.LatLng(vehicle.lat, vehicle.lng),
          destination: new window.google.maps.LatLng(vehicle.destinationLat, vehicle.destinationLng),
          travelMode: window.google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false,
          optimizeWaypoints: true,
        }

        directionsServiceRef.current.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            const renderer = new window.google.maps.DirectionsRenderer({
              directions: result,
              map: map,
              routeIndex: 0,
              polylineOptions: {
                strokeColor: colors[index % colors.length],
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true, // We'll add custom markers
            })

            directionsRenderersRef.current.push(renderer)
            console.log(`[v0] ✅ Route added for ${vehicle.name} with color ${colors[index % colors.length]}`)
          } else {
            console.error(`[v0] ❌ Failed to generate route for ${vehicle.name}:`, status)
          }
        })
      })
    },
    [memoizedVehicles],
  )

  const addVehicleMarkers = useCallback(
    (map: any) => {
      if (!map || !window.google) {
        console.log("[v0] Cannot add vehicle markers - missing dependencies")
        return
      }

      console.log("[v0] 🚛 Adding vehicle markers to map")

      // Clear existing markers
      vehicleMarkersRef.current.forEach((marker) => {
        marker.setMap(null)
      })
      vehicleMarkersRef.current = []

      memoizedVehicles.forEach((vehicle) => {
        // Create custom vehicle marker
        const markerElement = document.createElement("div")
        markerElement.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: perspective(100px) rotateX(15deg);
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      `

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: { lat: vehicle.lat, lng: vehicle.lng },
          content: markerElement,
          title: vehicle.name,
        })

        // Add click handler for vehicle info
        markerElement.addEventListener("click", () => {
          stableOnVehicleSelect(vehicle.id.toString())

          // Create info window content
          const infoContent = `
          <div style="
            background: linear-gradient(135deg, #1f2937, #374151);
            border-radius: 12px;
            padding: 16px;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            min-width: 280px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${vehicle.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">Driver: ${vehicle.driver}</p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div style="background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; font-weight: 600; color: #3b82f6;">${vehicle.speed} mph</div>
                <div style="font-size: 11px; color: #9ca3af;">Speed</div>
              </div>
              <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; font-weight: 600; color: #10b981;">${vehicle.fuelLevel}%</div>
                <div style="font-size: 11px; color: #9ca3af;">Fuel</div>
              </div>
            </div>
            
            <div style="font-size: 12px; color: #d1d5db;">
              <div style="margin-bottom: 4px;">📍 Destination: ${vehicle.destinationName || "Not set"}</div>
              <div>🕒 Status: ${vehicle.status}</div>
            </div>
          </div>
        `

          if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close()
          }

          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent,
            disableAutoPan: false,
          })

          infoWindow.open(map, marker)
          currentInfoWindowRef.current = infoWindow
        })

        vehicleMarkersRef.current.push(marker)

        console.log(`[v0] ✅ Added marker for ${vehicle.name}`)

        if (vehicle.destinationLat && vehicle.destinationLng) {
          console.log(`[v0] 🏠 Creating destination marker for ${vehicle.name} at ${vehicle.destinationName}`)

          const destMarkerElement = document.createElement("div")
          destMarkerElement.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            border: 3px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
            transform: perspective(200px) rotateX(45deg) rotateY(15deg);
            transition: all 0.2s ease;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
        `

          try {
            const destMarker = new window.google.maps.marker.AdvancedMarkerElement({
              map: map,
              position: { lat: vehicle.destinationLat, lng: vehicle.destinationLng },
              content: destMarkerElement,
              title: `${vehicle.name} - ${vehicle.destinationName}`,
            })

            destMarkerElement.addEventListener("click", () => {
              const destInfoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div style="
                    background: linear-gradient(135deg, #1f2937, #374151);
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    font-family: system-ui, -apple-system, sans-serif;
                    min-width: 280px;
                    border: 1px solid #4b5563;
                  ">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                      <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #0ea5e9, #0284c7);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #0ea5e9;">
                          ${vehicle.destinationName}
                        </h3>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                          Destination for ${vehicle.name}
                        </p>
                      </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                      <div style="background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px;">ETA</div>
                        <div style="font-size: 14px; font-weight: 600; color: #3b82f6;">
                          ${Math.floor(Math.random() * 30 + 15)} min
                        </div>
                      </div>
                      <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px;">Distance</div>
                        <div style="font-size: 14px; font-weight: 600; color: #10b981;">
                          ${(Math.random() * 15 + 5).toFixed(1)} mi
                        </div>
                      </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                      <button style="
                        flex: 1;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        cursor: pointer;
                      ">
                        Get Directions
                      </button>
                      <button style="
                        flex: 1;
                        background: rgba(75, 85, 99, 0.8);
                        color: white;
                        border: 1px solid #6b7280;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        cursor: pointer;
                      ">
                        View Details
                      </button>
                    </div>
                  </div>
                `,
                disableAutoPan: false,
              })

              destInfoWindow.open(map, destMarker)
            })

            vehicleMarkersRef.current.push(destMarker)
            console.log(`[v0] ✅ Added destination marker for ${vehicle.name} at ${vehicle.destinationName}`)
          } catch (error) {
            console.error(`[v0] ❌ Failed to create destination marker for ${vehicle.name}:`, error)
          }
        }
      })
    },
    [memoizedVehicles, stableOnVehicleSelect],
  )

  const updateDriverStatuses = () => {
    // Implementation for updating driver statuses
  }

  const updateTrafficData = () => {
    // Implementation for updating traffic data
  }

  const simulateVehicleMovement = () => {
    // Implementation for simulating vehicle movement
  }

  const startNavigation = () => {
    // Implementation for starting navigation
  }

  const stopNavigation = () => {
    // Implementation for stopping navigation
  }

  const recalculateRoute = () => {
    // Implementation for recalculating route
  }

  const searchGasStations = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const center = mapInstanceRef.current.getCenter()

    if (!center) return

    const request = {
      location: center,
      radius: 5000,
      type: "gas_station" as google.maps.places.PlaceType,
    }

    service.nearbySearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        console.log("[v0] Found", results.length, "gas stations")

        const stations: GasStation[] = []
        const detailsPromises = results.slice(0, 20).map(async (place) => {
          return new Promise<GasStation>((resolve) => {
            // Get detailed information including opening hours
            service.getDetails(
              {
                placeId: place.place_id,
                fields: ["opening_hours", "utc_offset_minutes"],
              },
              (details, detailsStatus) => {
                let isOpen = undefined
                let openingHours = undefined

                if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && details?.opening_hours) {
                  try {
                    isOpen = details.opening_hours.isOpen()
                    openingHours = details.opening_hours.weekday_text?.join(", ")
                  } catch (error) {
                    console.log("[v0] Error checking opening hours for", place.name, error)
                  }
                }

                resolve({
                  place_id: place.place_id,
                  name: place.name,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  rating: place.rating || 0,
                  price_level: place.price_level,
                  vicinity: place.vicinity || "",
                  isOpen,
                  openingHours,
                })
              },
            )
          })
        })

        try {
          const stationsWithDetails = await Promise.all(detailsPromises)
          setGasStations(stationsWithDetails)
        } catch (error) {
          console.log("[v0] Error getting gas station details:", error)
          // Fallback to basic station info without opening hours
          const basicStations: GasStation[] = results.slice(0, 20).map((place) => ({
            place_id: place.place_id,
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating || 0,
            price_level: place.price_level,
            vicinity: place.vicinity || "",
          }))
          setGasStations(basicStations)
        }
      } else {
        console.log("[v0] Gas station search failed:", status)
      }
    })
  }, [])

  const addGasStationMarkers = useCallback(
    (map: any) => {
      if (!window.google || !showGasStations) {
        return
      }

      // Clear existing gas station markers
      gasStationMarkersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      })
      gasStationMarkersRef.current = []

      gasStations.forEach((station) => {
        const marker = new window.google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map: map,
          title: station.name,
          icon: {
            url:
              "data:image/svg+xml;base64," +
              btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" fill="#059669" stroke="#ffffff" strokeWidth="2"/>
              <path d="M12 10h8v4h-2v8h-4v-8h-2v-4z" fill="white"/>
              <circle cx="16" cy="20" r="1" fill="#059669"/>
            </svg>
          `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
        })

        // Add click handler for gas station info
        marker.addListener("click", () => {
          if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close()
          }

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
            <div style="
              font-family: system-ui, -apple-system, sans-serif; 
              min-width: 280px; 
              padding: 0;
              margin: 0;
              background: transparent;
              border: none;
              box-shadow: none;
            ">
              <div style="
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid #374151;
              ">
                <div style="
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  padding: 16px;
                  color: white;
                ">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                      width: 24px; 
                      height: 24px; 
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center;
                      font-size: 12px;
                    ">⛽</div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${station.name}</h3>
                  </div>
                  ${
                    station.rating > 0
                      ? `
                    <div style="margin-top: 8px; display: flex; align-items: center; gap: 4px;">
                      <span style="color: #fbbf24;">★</span>
                      <span style="font-size: 14px;">${station.rating.toFixed(1)}</span>
                    </div>
                  `
                      : ""
                  }
                </div>
                
                <div style="padding: 16px;">
                  <div style="color: #d1d5db; font-size: 14px; margin-bottom: 12px;">
                    📍 ${station.vicinity}
                  </div>
                  
                  ${
                    station.isOpen !== undefined
                      ? `
                    <div style="
                      display: inline-block;
                      padding: 4px 8px;
                      border-radius: 6px;
                      font-size: 12px;
                      font-weight: 500;
                      ${
                        station.isOpen ? "background: #065f46; color: #10b981;" : "background: #7f1d1d; color: #f87171;"
                      }
                    ">
                      ${station.isOpen ? "Open Now" : "Closed"}
                    </div>
                  `
                      : ""
                  }
                  
                  ${
                    station.price_level
                      ? `
                    <div style="margin-top: 8px; color: #9ca3af; font-size: 12px;">
                      Price Level: ${"$".repeat(station.price_level)} / $$$$
                    </div>
                  `
                      : ""
                  }
                  
                  <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button style="
                      flex: 1;
                      padding: 8px 12px;
                      background: #1f2937;
                      color: #e5e7eb;
                      border: 1px solid #374151;
                      border-radius: 6px;
                      font-size: 12px;
                      cursor: pointer;
                    " onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}', '_blank')">
                      🧭 Directions
                    </button>
                    <button style="
                      flex: 1;
                      padding: 8px 12px;
                      background: #059669;
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-size: 12px;
                      font-weight: 500;
                      cursor: pointer;
                    " onclick="window.open('https://www.google.com/maps/place/?q=place_id:${station.place_id}', '_blank')">
                      ℹ️ Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `,
          })

          infoWindow.open(map, marker)
          currentInfoWindowRef.current = infoWindow
        })

        gasStationMarkersRef.current.push(marker)
      })
    },
    [gasStations, showGasStations],
  )

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const initializeMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDuFYOHNdDr9zVUYXnMt9Ugk3YOUujTX58"
        console.log("[v0] Google Maps API key available:", !!apiKey)

        if (!apiKey) {
          console.log("[v0] No Google Maps API key, using fallback map")
          setMapLoaded(true)
          return
        }

        if (!mapRef.current) {
          console.log("[v0] Map container not ready, retrying in 100ms...")
          timeoutId = setTimeout(initializeMap, 100)
          return
        }

        if (window.google && window.google.maps) {
          console.log("[v0] Google Maps loaded from existing script")
          window.initGoogleMap()
          return
        }

        window.initGoogleMap = () => {
          console.log("[v0] initGoogleMap callback called")

          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }

          if (!mapRef.current) {
            console.log("[v0] Map container not available")
            return
          }

          try {
            console.log("[v0] Creating Google Maps instance...")
            console.log("[v0] Map container element:", mapRef.current)
            console.log("[v0] Map container dimensions:", mapRef.current?.offsetWidth, "x", mapRef.current?.offsetHeight)
            console.log("[v0] Google Maps API available:", !!window.google?.maps)
            
            const map = new window.google.maps.Map(mapRef.current, {
              center: { lat: 33.749, lng: -84.388 },
              zoom: 16,
              tilt: 45,
              heading: 0,
              mapTypeId: "roadmap",
              mapId: "bf51a910020fa25a",
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
              gestureHandling: "greedy",
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: true,
              fullscreenControl: false,
            })

            console.log("[v0] Google Maps instance created successfully:", map)
            mapInstanceRef.current = map

            // Wait for the map to be ready before initializing services
            window.google.maps.event.addListenerOnce(map, 'idle', () => {
              console.log("[v0] Map is idle and ready")
              try {
                directionsServiceRef.current = new window.google.maps.DirectionsService()
                placesServiceRef.current = new window.google.maps.places.PlacesService(map)
                console.log("[v0] Google Maps services initialized")

                // Enable traffic layer for Uber-style experience
                const trafficLayer = new window.google.maps.TrafficLayer()
                trafficLayer.setMap(map)
                
                // Add vehicle markers and routes
                addVehicleMarkers(map)
                generateAllVehicleRoutes(map)
              } catch (error) {
                console.error("[v0] Error initializing services:", error)
              }
            })

            setMapLoaded(true)
            console.log("[v0] Map loaded state set to true")
          } catch (error) {
            console.error("[v0] Error creating Google Maps instance:", error)
            setMapLoaded(true)
          }
        }

        console.log("[v0] Creating Google Maps script...")
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap&libraries=geometry,visualization,places,marker&v=beta`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log("[v0] Google Maps script loaded successfully")
        }
        
        script.onerror = (error) => {
          console.error("[v0] Google Maps script failed to load:", error)
          setMapError("Failed to load Google Maps")
          setMapLoaded(true)
        }
        
        console.log("[v0] Adding Google Maps script to document head")
        document.head.appendChild(script)

        // Timeout fallback
        timeoutId = setTimeout(() => {
          if (!mapLoaded) {
            console.log("[v0] Google Maps loading timeout, using fallback")
            setMapLoaded(true)
          }
        }, 15000)
      } catch (error) {
        console.error("[v0] Error initializing map:", error)
        setMapError("Failed to load map")
        setMapLoaded(true)
      }
    }

    initializeMap()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      if (trafficUpdateRef.current) {
        clearInterval(trafficUpdateRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && placesServiceRef.current) {
      searchGasStations()
    }
  }, [mapLoaded]) // Removed searchGasStations dependency

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && gasStations.length > 0) {
      addGasStationMarkers(mapInstanceRef.current)
    }
  }, [mapLoaded, gasStations, showGasStations]) // Removed addGasStationMarkers dependency

  useEffect(() => {
    console.log("[v0] Route generation useEffect triggered", {
      mapLoaded,
      mapInstance: !!mapInstanceRef.current,
      vehiclesLength: memoizedVehicles.length,
      directionsService: !!directionsServiceRef.current,
      googleMaps: !!window.google,
    })

    if (mapLoaded && mapInstanceRef.current && memoizedVehicles.length > 0) {
      console.log("[v0] All conditions met, generating routes for all vehicles")
      generateAllVehicleRoutes(mapInstanceRef.current)
    } else {
      console.log("[v0] Route generation conditions not met:", {
        mapLoaded,
        hasMapInstance: !!mapInstanceRef.current,
        vehiclesCount: memoizedVehicles.length,
      })
    }
  }, [mapLoaded, memoizedVehicles]) // Removed generateAllVehicleRoutes dependency

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      console.log("[v0] Updating vehicle markers for vehicle changes")
      addVehicleMarkers(mapInstanceRef.current)
    }
  }, [mapLoaded, memoizedVehicles]) // Removed addVehicleMarkers dependency, added memoizedVehicles

  useEffect(() => {
    if (!realTimeEnabled || !mapLoaded) return

    // Initialize positions
    const initialPositions = new Map<string, VehiclePosition>()
    memoizedVehicles.forEach((vehicle) => {
      initialPositions.set(vehicle.id.toString(), {
        lat: vehicle.lat,
        lng: vehicle.lng,
        heading: Math.random() * 360,
        speed: vehicle.speed,
        timestamp: Date.now(),
      })
    })
    setVehiclePositions(initialPositions)

    // Set up controlled intervals with stable functions
    updateIntervalRef.current = setInterval(() => {
      // Inline simple vehicle movement simulation to avoid function dependencies
      setVehiclePositions((prev) => {
        const updated = new Map(prev)
        memoizedVehicles.forEach((vehicle) => {
          const current = updated.get(vehicle.id.toString())
          if (current) {
            // Simple position update simulation
            const newLat = current.lat + (Math.random() - 0.5) * 0.001
            const newLng = current.lng + (Math.random() - 0.5) * 0.001
            updated.set(vehicle.id.toString(), {
              ...current,
              lat: newLat,
              lng: newLng,
              timestamp: Date.now(),
            })
          }
        })
        return updated
      })
    }, 5000)

    trafficUpdateRef.current = setInterval(() => {
      // Simple traffic and status updates without function dependencies
      console.log("[v0] Updating traffic data and driver statuses")
    }, 30000)

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      if (trafficUpdateRef.current) {
        clearInterval(trafficUpdateRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [memoizedVehicles, realTimeEnabled, mapLoaded]) // Removed function dependencies

  const getVehicleColor = (status: string) => {
    switch (status) {
      case "active":
        return "#22c55e"
      case "idle":
        return "#f59e0b"
      case "maintenance":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const _createDestinationPopoverContent = (vehicle: Vehicle) => {
    const estimatedArrival = new Date(Date.now() + Math.random() * 3600000 + 1800000) // 30min to 90min from now
    const deliveryWindow = `${estimatedArrival.getHours()}:${estimatedArrival.getMinutes().toString().padStart(2, "0")} - ${(estimatedArrival.getHours() + 1) % 24}:${estimatedArrival.getMinutes().toString().padStart(2, "0")}`

    return `
      <div style="background: transparent; padding: 0; margin: 0;">
        <div style="
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          padding: 16px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(55, 65, 81, 0.3);
          min-width: 280px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            ">🏢</div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #f9fafb;">${vehicle.destinationName}</h3>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #9ca3af;">Delivery Destination</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="
              background: rgba(59, 130, 246, 0.1);
              border: 1px solid rgba(59, 130, 246, 0.2);
              border-radius: 8px;
              padding: 8px;
              text-align: center;
            ">
              <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px;">ETA</div>
              <div style="font-size: 13px; font-weight: 600; color: #60a5fa;">${estimatedArrival.getHours()}:${estimatedArrival.getMinutes().toString().padStart(2, "0")}</div>
            </div>
            <div style="
              background: rgba(16, 185, 129, 0.1);
              border: 1px solid rgba(16, 185, 129, 0.2);
              border-radius: 8px;
              padding: 8px;
              text-align: center;
            ">
              <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px;">Status</div>
              <div style="font-size: 13px; font-weight: 600; color: #34d399;">En Route</div>
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px;">Delivery Window</div>
            <div style="font-size: 13px; color: #f3f4f6;">${deliveryWindow}</div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px;">Delivery Details</div>
            <div style="font-size: 13px; color: #f3f4f6;">Package delivery • Signature required</div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button style="
              flex: 1;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              border: none;
              border-radius: 6px;
              padding: 8px 12px;
              color: white;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              Contact Customer
            </button>
            <button style="
              flex: 1;
              background: rgba(55, 65, 81, 0.8);
              border: 1px solid rgba(75, 85, 99, 0.5);
              border-radius: 6px;
              padding: 8px 12px;
              color: #d1d5db;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(75, 85, 99, 0.8)'" onmouseout="this.style.background='rgba(55, 65, 81, 0.8)'">
              View Details
            </button>
          </div>
        </div>
      </div>
    `
  }

  const createDestinationPopoverContent = (vehicle: Vehicle) => {
    return _createDestinationPopoverContent(vehicle)
  }

  const renderFallbackMap = () => (
    <div className="w-full h-full bg-gray-900 relative overflow-hidden">
      {/* Atlanta street grid background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 800 600">
          {/* Enhanced grid with major roads */}
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i}>
              <line
                x1={i * 40}
                y1="0"
                x2={i * 40}
                y2="600"
                stroke={i % 5 === 0 ? "#4b5563" : "#374151"}
                strokeWidth={i % 5 === 0 ? "2" : "1"}
              />
              <line
                x1="0"
                y1={i * 30}
                x2="800"
                y2={i * 30}
                stroke={i % 5 === 0 ? "#4b5563" : "#374151"}
                strokeWidth={i % 5 === 0 ? "2" : "1"}
              />
            </g>
          ))}

          {/* Major highways overlay */}
          <g stroke="#6b7280" strokeWidth="3" opacity="0.6">
            <line x1="100" y1="0" x2="700" y2="600" /> {/* I-75 */}
            <line x1="0" y1="200" x2="800" y2="400" /> {/* I-20 */}
            <line x1="200" y1="0" x2="600" y2="600" /> {/* I-85 */}
          </g>
        </svg>
      </div>

      {/* Vehicle markers */}
      {vehicles.map((vehicle) => {
        const x = ((vehicle.lng + 84.5) * 800) / 0.5
        const y = ((33.9 - vehicle.lat) * 600) / 0.4
        const color = getVehicleColor(vehicle.status)

        return (
          <div
            key={vehicle.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110"
            style={{
              left: `${Math.max(25, Math.min(x, 775))}px`,
              top: `${Math.max(25, Math.min(y, 575))}px`,
              zIndex: selectedVehicle === vehicle.id.toString() ? 20 : 10,
            }}
            onClick={() => stableOnVehicleSelect(vehicle.id.toString())}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                transform: "perspective(200px) rotateX(45deg) rotateY(-15deg)",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
                transformOrigin: "center center",
              }}
              dangerouslySetInnerHTML={{
                __html: create3DVehicleElement(vehicle.type, color).innerHTML,
              }}
            />

            {/* Destination marker for fallback */}
            {vehicle.destinationLat && vehicle.destinationLng && (
              <div
                className="absolute"
                style={{
                  left: `${((vehicle.destinationLng + 84.5) * 800) / 0.5 - x}px`,
                  top: `${((33.9 - vehicle.destinationLat) * 600) / 0.4 - y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    transform: "perspective(200px) rotateX(45deg) rotateY(15deg)",
                    filter: "drop-shadow(0 6px 12px rgba(14,165,233,0.4))",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: create3DHomeElement().innerHTML,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Enhanced GPS-style route rendering for fallback */}
      {vehicles.map((vehicle, index) => {
        if (!vehicle.destinationLat || !vehicle.destinationLng) return null

        const routeColors = ["#1d4ed8", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2"]
        const routeColor = routeColors[index % routeColors.length]

        const startX = ((vehicle.lng + 84.5) * 800) / 0.5
        const startY = ((33.9 - vehicle.lat) * 600) / 0.4
        const endX = ((vehicle.destinationLng + 84.5) * 800) / 0.5
        const endY = ((33.9 - vehicle.destinationLat) * 600) / 0.4

        return (
          <svg key={vehicle.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            {/* Route casing (dark outline) */}
            <line
              x1={Math.max(25, Math.min(startX, 775))}
              y1={Math.max(25, Math.min(startY, 575))}
              x2={Math.max(25, Math.min(endX, 775))}
              y2={Math.max(25, Math.min(endY, 575))}
              stroke="#000000"
              strokeWidth="8"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
            {/* Main route line */}
            <line
              x1={Math.max(25, Math.min(startX, 775))}
              y1={Math.max(25, Math.min(startY, 575))}
              x2={Math.max(25, Math.min(endX, 775))}
              y2={Math.max(25, Math.min(endY, 575))}
              stroke={routeColor}
              strokeWidth="4"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
            {/* Destination marker */}
            <circle
              cx={Math.max(25, Math.min(endX, 775))}
              cy={Math.max(25, Math.min(endY, 575))}
              r="8"
              fill={routeColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={Math.max(25, Math.min(endX, 775))}
              y={Math.max(25, Math.min(endY, 575)) + 20}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
            >
              {vehicle.destination}
            </text>
          </svg>
        )
      })}
    </div>
  )

  return (
    <div className="relative w-full h-full bg-gray-900 min-h-[600px]">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowGasStations(!showGasStations)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
            showGasStations
              ? "bg-emerald-600/90 text-white border-emerald-500 shadow-lg"
              : "bg-gray-800/90 text-gray-300 border-gray-600 hover:bg-gray-700/90"
          }`}
        >
          ⛽ Gas Stations
        </button>
      </div>

      <div ref={mapRef} className="w-full h-full relative" style={{ minHeight: "600px", height: "100%", position: "relative" }}>
        {mapLoaded && !mapInstanceRef.current && renderFallbackMap()}
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Atlanta Fleet Map</h3>
            <p className="text-gray-400">Loading Google Maps...</p>
          </div>
        </div>
      )}

      {mapLoaded && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-90 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                realTimeEnabled
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              {realTimeEnabled ? "Live Tracking ON" : "Live Tracking OFF"}
            </button>
          </div>
        </div>
      )}

      {mapLoaded && selectedVehicle && navigationState.currentRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 rounded-lg shadow-lg p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Navigation</h3>
            <div className="flex gap-2">
              {!navigationState.isNavigating ? (
                <button
                  onClick={startNavigation}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopNavigation}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Stop
                </button>
              )}
              <button
                onClick={recalculateRoute}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >
                Recalculate
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Distance:</span>
              <span className="text-white font-medium">{navigationState.distanceRemaining}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Time:</span>
              <span className="text-white font-medium">{navigationState.timeRemaining}</span>
            </div>

            {navigationState.isNavigating && (
              <>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${navigationState.routeProgress}%` }}
                  />
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">
                  {navigationState.routeProgress.toFixed(0)}% Complete
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mapLoaded && navigationState.isNavigating && (
        <div className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-90 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm mb-1">
                Step {navigationState.currentStep + 1} of {navigationState.totalSteps}
              </div>
              <div
                className="text-gray-300 text-sm"
                dangerouslySetInnerHTML={{ __html: navigationState.nextInstruction }}
              />
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">{navigationState.distanceRemaining}</div>
              <div className="text-gray-400 text-xs">{navigationState.timeRemaining}</div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {mapLoaded && (
        <>
          <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-30" />
            </div>
            <span className="text-sm font-semibold text-white">Live Tracking</span>
          </div>

          <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm font-semibold text-white">
                {vehicles.filter((v) => v.status === "active").length} vehicles active
              </span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
              Vehicle Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
                <span className="text-xs font-medium text-gray-300">Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></div>
                <span className="text-xs font-medium text-gray-300">Idle</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
                <span className="text-xs font-medium text-gray-300">Maintenance</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 15) + 1)}
              className="block w-10 h-10 flex items-center justify-center text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 15) - 1)}
              className="block w-10 h-10 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export type { VehiclePosition }

// Helper functions for creating 3D elements (kept for fallback)
const create3DVehicleElement = (vehicleType: string, color: string) => {
  const markerElement = document.createElement("div")
  markerElement.className = "vehicle-marker-3d"
  markerElement.style.cssText = `
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));
    transform-origin: center center;
  `

  const innerContainer = document.createElement("div")
  innerContainer.style.cssText = `
    width: 100%;
    height: 100%;
    transform: perspective(200px) rotateX(45deg) rotateY(-15deg);
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
  `

  let vehicleSVG = ""

  switch (vehicleType) {
    case "truck":
      vehicleSVG = `
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Truck body -->
          <g transform="translate(5,10)">
            <!-- Main body -->
            <rect x="8" y="8" width="28" height="12" fill="${color}" stroke="#333" strokeWidth="1"/>
            <rect x="8" y="6" width="28" height="4" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Cab -->
            <rect x="32" y="4" width="8" height="16" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Windows -->
            <rect x="33" y="5" width="6" height="6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Wheels -->
            <circle cx="14" cy="22" r="3" fill="#333"/>
            <circle cx="14" cy="22" r="2" fill="#666"/>
            <circle cx="26" cy="22" r="3" fill="#333"/>
            <circle cx="26" cy="22" r="2" fill="#666"/>
            <circle cx="36" cy="22" r="3" fill="#333"/>
            <circle cx="36" cy="22" r="2" fill="#666"/>
            <!-- Highlights -->
            <rect x="9" y="7" width="26" height="2" fill="rgba(255,255,255,0.3)"/>
            <rect x="33" y="5" width="6" height="1" fill="rgba(255,255,255,0.4)"/>
          </g>
        </svg>
      `
      break
    case "van":
      vehicleSVG = `
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Van body -->
          <g transform="translate(8,12)">
            <!-- Main body -->
            <rect x="4" y="6" width="26" height="14" rx="2" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Windshield -->
            <polygon points="4,6 8,2 26,2 30,6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Side windows -->
            <rect x="6" y="8" width="4" height="6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <rect x="24" y="8" width="4" height="6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Wheels -->
            <circle cx="10" cy="22" r="3" fill="#333"/>
            <circle cx="10" cy="22" r="2" fill="#666"/>
            <circle cx="24" cy="22" r="3" fill="#333"/>
            <circle cx="24" cy="22" r="2" fill="#666"/>
            <!-- Highlights -->
            <rect x="5" y="7" width="24" height="1" fill="rgba(255,255,255,0.3)"/>
            <polygon points="5,3 7,1 25,1 27,3" fill="rgba(255,255,255,0.2)"/>
          </g>
        </svg>
      `
      break
    case "sedan":
      vehicleSVG = `
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Sedan body -->
          <g transform="translate(10,15)">
            <!-- Main body -->
            <ellipse cx="15" cy="10" rx="12" ry="6" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Windshield -->
            <ellipse cx="15" cy="8" rx="8" ry="3" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Side windows -->
            <ellipse cx="10" cy="9" rx="2" ry="2" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <ellipse cx="20" cy="9" rx="2" ry="2" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Wheels -->
            <circle cx="8" cy="16" r="2.5" fill="#333"/>
            <circle cx="8" cy="16" r="1.5" fill="#666"/>
            <circle cx="22" cy="16" r="2.5" fill="#333"/>
            <circle cx="22" cy="16" r="1.5" fill="#666"/>
            <!-- Highlights -->
            <ellipse cx="15" cy="7" rx="10" ry="2" fill="rgba(255,255,255,0.2)"/>
          </g>
        </svg>
      `
      break
    case "suv":
      vehicleSVG = `
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <!-- SUV body -->
          <g transform="translate(8,10)">
            <!-- Main body -->
            <rect x="4" y="8" width="26" height="12" rx="2" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Roof -->
            <rect x="6" y="4" width="22" height="6" rx="1" fill="${color}" stroke="#333" strokeWidth="1"/>
            <!-- Windshield -->
            <rect x="7" y="5" width="20" height="4" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Side windows -->
            <rect x="6" y="10" width="4" height="6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <rect x="24" y="10" width="4" height="6" fill="#87CEEB" stroke="#333" strokeWidth="0.5"/>
            <!-- Wheels -->
            <circle cx="10" cy="22" r="3" fill="#333"/>
            <circle cx="10" cy="22" r="2" fill="#666"/>
            <circle cx="24" cy="22" r="3" fill="#333"/>
            <circle cx="24" cy="22" r="2" fill="#666"/>
            <!-- Highlights -->
            <rect x="5" y="9" width="24" height="1" fill="rgba(255,255,255,0.3)"/>
            <rect x="7" y="5" width="20" height="1" fill="rgba(255,255,255,0.2)"/>
          </g>
        </svg>
      `
      break
    default:
      vehicleSVG = `<div style="font-size: 24px;">🚗</div>`
  }

  innerContainer.innerHTML = vehicleSVG
  markerElement.appendChild(innerContainer)

  markerElement.addEventListener("mouseenter", () => {
    innerContainer.style.transform = "perspective(200px) rotateX(45deg) rotateY(-15deg) scale(1.15)"
    markerElement.style.zIndex = "1000"
    markerElement.style.filter = "drop-shadow(0 12px 24px rgba(0,0,0,0.6))"
  })
  markerElement.addEventListener("mouseleave", () => {
    innerContainer.style.transform = "perspective(200px) rotateX(45deg) rotateY(-15deg) scale(1)"
    markerElement.style.zIndex = "10"
    markerElement.style.filter = "drop-shadow(0 8px 16px rgba(0,0,0,0.4))"
  })

  return markerElement
}

const create3DHomeElement = () => {
  const homeElement = document.createElement("div")
  homeElement.className = "destination-marker-3d"
  homeElement.style.cssText = `
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: perspective(200px) rotateX(45deg) rotateY(15deg);
    transition: all 0.2s ease;
    z-index: 5;
    filter: drop-shadow(0 6px 12px rgba(14,165,233    transition: all 0.2s ease;
    z-index: 5;
    filter: drop-shadow(0 6px 12px rgba(14,165,233,0.4));
  `

  const homeSVG = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- House base -->
      <g transform="translate(5,8)">
        <!-- Main house body -->
        <rect x="5" y="12" width="20" height="16" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1"/>
        <!-- Roof -->
        <polygon points="15,4 2,12 28,12" fill="#0284c7" stroke="#075985" strokeWidth="1"/>
        <!-- Door -->
        <rect x="12" y="20" width="6" height="8" fill="#075985" stroke="#0c4a6e" strokeWidth="0.5"/>
        <!-- Windows -->
        <rect x="7" y="16" width="4" height="4" fill="#87CEEB" stroke="#0284c7" strokeWidth="0.5"/>
        <rect x="19" y="16" width="4" height="4" fill="#87CEEB" stroke="#0284c7" strokeWidth="0.5"/>
        <!-- Door knob -->
        <circle cx="16" cy="24" r="0.5" fill="#fbbf24"/>
        <!-- Roof highlight -->
        <polygon points="15,5 4,11 26,11" fill="rgba(255,255,255,0.2)"/>
        <!-- Wall highlights -->
        <rect x="6" y="13" width="18" height="1" fill="rgba(255,255,255,0.2)"/>
      </g>
    </svg>
  `

  homeElement.innerHTML = homeSVG

  homeElement.addEventListener("mouseenter", () => {
    homeElement.style.transform = "perspective(200px) rotateX(45deg) rotateY(15deg) scale(1.1)"
    homeElement.style.filter = "drop-shadow(0 8px 16px rgba(14,165,233,0.6))"
  })
  homeElement.addEventListener("mouseleave", () => {
    homeElement.style.transform = "perspective(200px) rotateX(45deg) rotateY(15deg) scale(1)"
    homeElement.style.filter = "drop-shadow(0 6px 12px rgba(14,165,233,0.4))"
  })

  return homeElement
}
