"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

/**
 * AtlantaMap - Interactive fleet tracking map for Atlanta metro area
 * Moved from old location to organized maps directory
 * Provides real-time vehicle positioning and route visualization
 */
export function AtlantaMap({ vehicles = [], selectedVehicle, onVehicleSelect }) {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [viewMode, setViewMode] = useState('satellite') // satellite, roadmap, hybrid
  
  // Mock Atlanta coordinates for demonstration
  const atlantaCenter = { lat: 33.7490, lng: -84.3880 }
  
  useEffect(() => {
    // Mock map initialization
    setMapLoaded(true)
  }, [])

  const handleVehicleClick = (vehicleId) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicleId.toString())
    }
  }

  const getVehicleMarkerColor = (vehicle) => {
    switch (vehicle.status) {
      case 'active':
        return 'text-success'
      case 'idle':
        return 'text-warning'
      case 'maintenance':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const getVehicleIcon = (vehicle) => {
    switch (vehicle.type) {
      case 'truck':
        return '🚛'
      case 'van':
        return '🚐'
      case 'sedan':
        return '🚗'
      case 'suv':
        return '🚙'
      default:
        return '🚗'
    }
  }

  return (
    <div className="w-full h-full relative bg-card overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
          Fleet Tracking - Atlanta Metro
        </div>
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none"
          >
            <option value="satellite">Satellite</option>
            <option value="roadmap">Roadmap</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-card/90 backdrop-blur-sm hover:bg-card/90"
          onClick={() => {
            // Center map on Atlanta
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-card/90 backdrop-blur-sm hover:bg-card/90"
          onClick={() => {
            // Zoom in
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-card/90 backdrop-blur-sm hover:bg-card/90"
          onClick={() => {
            // Zoom out
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </Button>
      </div>

      {/* Mock Map Background */}
      <div 
        ref={mapRef}
        className={`w-full h-full relative ${
          viewMode === 'satellite' ? 'bg-slate-800' : 
          viewMode === 'roadmap' ? 'bg-muted' : 'bg-slate-700'
        }`}
        style={{
          backgroundImage: viewMode === 'satellite' 
            ? 'radial-gradient(circle at 30% 70%, hsl(var(--muted-foreground) / 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.1) 0%, transparent 50%)'
            : viewMode === 'roadmap'
            ? 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)'
            : 'linear-gradient(135deg, hsl(var(--muted-foreground) / 0.05) 0%, hsl(var(--primary) / 0.05) 100%)',
          backgroundSize: viewMode === 'roadmap' ? '20px 20px' : 'cover'
        }}
      >
        {/* Atlanta Road Network (Mock) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: viewMode === 'roadmap' ? 0.3 : 0.1 }}>
          {/* I-75 */}
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="hsl(var(--muted-foreground) / 0.6)" strokeWidth="3" />
          {/* I-85 */}
          <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="hsl(var(--muted-foreground) / 0.6)" strokeWidth="3" />
          {/* I-20 */}
          <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="hsl(var(--muted-foreground) / 0.6)" strokeWidth="3" />
          {/* Perimeter (I-285) */}
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="2" />
        </svg>

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
              selectedVehicle === vehicle.id.toString() ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{
              left: `${45 + (vehicle.lng + 84.4) * 50}%`,
              top: `${45 + (33.8 - vehicle.lat) * 50}%`,
            }}
            onClick={() => handleVehicleClick(vehicle.id)}
          >
            {/* Vehicle Marker */}
            <div className={`relative ${selectedVehicle === vehicle.id.toString() ? 'animate-pulse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full ${
                  vehicle.status === 'active' ? 'bg-success' :
                  vehicle.status === 'idle' ? 'bg-warning' : 'bg-destructive'
                } flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white`}
              >
                {getVehicleIcon(vehicle)}
              </div>
              
              {/* Vehicle Info Popup */}
              {selectedVehicle === vehicle.id.toString() && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-card text-white p-2 rounded-lg shadow-lg min-w-max z-30">
                  <div className="text-xs font-medium">{vehicle.name}</div>
                  <div className="text-xs text-muted-foreground">{vehicle.driver}</div>
                  <div className="text-xs text-muted-foreground">{vehicle.location}</div>
                  {vehicle.status === 'active' && (
                    <div className="text-xs text-success">{vehicle.speed} mph</div>
                  )}
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px">
                    <div className="w-2 h-2 bg-card rotate-45"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Route Line (for active vehicles) */}
            {vehicle.status === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${Math.random() * 100}%`}
                    y2={`${Math.random() * 100}%`}
                    stroke="hsl(var(--muted-foreground) / 0.4)"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-xs font-medium mb-2">Vehicle Status</div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Active ({vehicles.filter(v => v.status === 'active').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Idle ({vehicles.filter(v => v.status === 'idle').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>Maintenance ({vehicles.filter(v => v.status === 'maintenance').length})</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-xs font-medium mb-2">Fleet Overview</div>
          <div className="flex flex-col gap-1 text-xs">
            <div>Total Vehicles: {vehicles.length}</div>
            <div>Active Routes: {vehicles.filter(v => v.status === 'active').length}</div>
            <div>Avg Speed: {Math.round(vehicles.filter(v => v.status === 'active').reduce((acc, v) => acc + v.speed, 0) / vehicles.filter(v => v.status === 'active').length || 0)} mph</div>
            <div>Fleet Efficiency: 87%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
