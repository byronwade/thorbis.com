"use client";
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Flag, Route, CheckCircle2 } from "lucide-react"
import { Vehicle3DIcon } from "./Vehicle3DIcon"
import { DotFilledIcon } from "@radix-ui/react-icons"

export function RouteVisualization({
  vehicle,
  className
}) {
  // Calculate route progress based on vehicle status and speed
  const calculateRouteProgress = () => {
    if (vehicle.status === "idle") return 0
    if (vehicle.status === "maintenance") return 100
    if (vehicle.status === "offline") return 0

    // Simulate progress based on speed and time
    const baseProgress = Math.min(85, (vehicle.speed / 60) * 100)
    return Math.max(15, baseProgress);
  }

  const routeProgress = calculateRouteProgress()

  return (
    <Card className={`p-4 ${className || ""}`}>
      <div className="space-y-4">
        {/* Route Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-semibold flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            Route Details
          </h3>
          <Badge variant="outline" className="text-xs">
            {vehicle.estimatedArrival}
          </Badge>
        </div>

        {/* Route Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(routeProgress)}%</span>
          </div>
          <Progress value={routeProgress} className="h-2 bg-secondary" />
        </div>

        {/* Route Path Visualization */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Route Path</span>
            <span className="text-xs text-muted-foreground">{vehicle.route.length} waypoints</span>
          </div>

          <div className="space-y-3">
            {vehicle.route.map((waypoint, index) => {
              const isStart = index === 0
              const isEnd = index === vehicle.route.length - 1
              const isCurrent = !isStart && !isEnd && index <= Math.floor((routeProgress / 100) * vehicle.route.length)
              const isCompleted = index < Math.floor((routeProgress / 100) * vehicle.route.length)

              return (
                <div key={index} className="flex items-center gap-3">
                  {/* Route Point Icon */}
                  <div className="flex-shrink-0">
                    {isStart ? (
                      <div
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Flag className="w-3 h-3 text-primary-foreground" />
                      </div>
                    ) : isEnd ? (
                      <div
                        className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-accent-foreground" />
                      </div>
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : isCurrent ? (
                      <div
                        className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                        <DotFilledIcon className="w-2 h-2 fill-primary text-primary" />
                      </div>
                    ) : (
                      <DotFilledIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  {/* Waypoint Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium truncate ${
                          isCompleted ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground"
                        }`}>
                        {waypoint}
                      </span>
                      {isStart && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Start
                        </Badge>
                      )}
                      {isEnd && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Destination
                        </Badge>
                      )}
                      {isCurrent && <Badge className="text-xs ml-2 bg-primary text-primary-foreground">Current</Badge>}
                    </div>
                  </div>
                  {/* Connection Line */}
                  {index < vehicle.route.length - 1 && (
                    <div
                      className="absolute left-3 mt-6 w-0.5 h-6 bg-border"
                      style={{ top: `${(index + 1) * 48}px` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-serif font-bold text-primary">{vehicle.speed}</div>
            <div className="text-xs text-muted-foreground">mph</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-serif font-bold text-accent">{vehicle.route.length}</div>
            <div className="text-xs text-muted-foreground">stops</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MapRouteVisualization({
  vehicles,
  selectedVehicle,
  onVehicleSelect
}) {
  return (
    <div className="relative w-full h-full">
      {/* Simulated Map Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-secondary/30 rounded-lg">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      {/* Route Lines and Vehicle Positions */}
      <div className="absolute inset-4">
        <svg width="100%" height="100%" className="w-full h-full">
          {vehicles.map((vehicle, vehicleIndex) => {
            const isSelected = selectedVehicle === vehicle.id
            const routeColor =
              vehicle.status === "active" ? "hsl(var(--warning))" : vehicle.status === "idle" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))"

            // Generate route path points
            const routePoints = vehicle.route.map((_, index) => ({
              x: 50 + index * 150 + vehicleIndex * 30,
              y: 100 + vehicleIndex * 80 + Math.sin(index) * 20,
            }))

            return (
              <g key={vehicle.id}>
                {/* Route Path */}
                <path
                  d={`M ${routePoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                  stroke={routeColor}
                  strokeWidth={isSelected ? "4" : "2"}
                  fill="none"
                  strokeDasharray={vehicle.status === "idle" ? "5,5" : "none"}
                  opacity={isSelected ? 1 : 0.7}
                  className="transition-all duration-300" />
                {/* Route Points */}
                {routePoints.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={index === 0 || index === routePoints.length - 1 ? "6" : "4"}
                      fill={index === 0 ? "hsl(var(--warning))" : index === routePoints.length - 1 ? "hsl(var(--muted-foreground))" : routeColor}
                      stroke="white"
                      strokeWidth="2"
                      className="transition-all duration-300" />
                    {/* Start/End Labels */}
                    {index === 0 && (
                      <text
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                        className="text-xs fill-primary font-medium">
                        START
                      </text>
                    )}
                    {index === routePoints.length - 1 && (
                      <text
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                        className="text-xs fill-accent font-medium">
                        END
                      </text>
                    )}
                  </g>
                ))}
                {/* Vehicle Position */}
                <g
                  transform={`translate(${routePoints[Math.floor(routePoints.length * 0.6)]?.x || 0}, ${routePoints[Math.floor(routePoints.length * 0.6)]?.y || 0})`}
                  className="cursor-pointer transition-transform duration-300 hover:scale-110"
                  onClick={() => onVehicleSelect?.(vehicle.id)}>
                  <circle
                    r="20"
                    fill={routeColor}
                    fillOpacity="0.2"
                    stroke={routeColor}
                    strokeWidth="2"
                    className={isSelected ? "animate-pulse" : ""} />
                  <foreignObject x="-12" y="-12" width="24" height="24">
                    <Vehicle3DIcon
                      type={vehicle.type}
                      status={vehicle.status}
                      size="sm"
                      animate={vehicle.status === "active"} />
                  </foreignObject>

                  {/* Vehicle Label */}
                  <text
                    y="35"
                    textAnchor="middle"
                    className="text-xs fill-foreground font-medium">
                    {vehicle.name.split(" ")[0]}
                  </text>
                </g>
                {/* Direction Arrows */}
                {routePoints.slice(0, -1).map((point, index) => {
                  const nextPoint = routePoints[index + 1]
                  const angle = (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180) / Math.PI
                  const midX = (point.x + nextPoint.x) / 2
                  const midY = (point.y + nextPoint.y) / 2

                  return (
                    <g
                      key={`arrow-${index}`}
                      transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
                      <polygon points="-4,-2 4,0 -4,2" fill={routeColor} opacity="0.8" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Map Legend */}
      <div
        className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <h4 className="text-sm font-serif font-semibold mb-2">Route Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Active Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-accent" style={{ strokeDasharray: "2,2" }}></div>
            <span>Idle Route</span>
          </div>
          <div className="flex items-center gap-2">
            <DotFilledIcon className="w-3 h-3 text-primary" />
            <span>Start Point</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-accent" />
            <span>Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
