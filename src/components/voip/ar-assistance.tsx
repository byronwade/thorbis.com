"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Video, Eye, Layers, MapPin, Smartphone } from "lucide-react"

export default function ARAssistance() {
  const [arSession, setArSession] = useState({
    active: false,
    mode: null as "inspection" | "guidance" | "training" | null,
    technician: null as string | null,
  })

  const [availableFeatures] = useState([
    {
      id: "remote-inspection",
      name: "Remote Property Inspection",
      description: "Guide customer through visual property assessment",
      icon: <Eye className="h-4 w-4" />,
      status: "available",
    },
    {
      id: "ar-guidance",
      name: "AR Repair Guidance",
      description: "Overlay step-by-step repair instructions",
      icon: <Layers className="h-4 w-4" />,
      status: "available",
    },
    {
      id: "virtual-presence",
      name: "Virtual Technician",
      description: "Connect with expert technician via AR",
      icon: <Video className="h-4 w-4" />,
      status: "premium",
    },
  ])

  const startARSession = (mode: "inspection" | "guidance" | "training") => {
    setArSession({ active: true, mode, technician: "Mike Johnson" })
  }

  const endARSession = () => {
    setArSession({ active: false, mode: null, technician: null })
  }

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-100">AR Assistance</h3>
      </div>

      {!arSession.active ? (
        <>
          {/* Available AR Features */}
          <div className="space-y-2">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="bg-neutral-800 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="text-xs font-medium text-neutral-100">{feature.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      feature.status === "available"
                        ? "border-green-600 text-green-400"
                        : "border-orange-600 text-orange-400"
                    }`}
                  >
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400 mb-2">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                  onClick={() => startARSession(feature.id.split("-")[0] as any)}
                >
                  Start {feature.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Customer Device Check */}
          <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="h-3 w-3 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">Device Compatibility</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Camera Access</span>
                <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">AR Support</span>
                <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                  iOS/Android
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Network</span>
                <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                  5G Ready
                </Badge>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active AR Session */}
          <div className="bg-green-950/30 border border-green-800/30 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-300">AR Session Active</span>
              </div>
              <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                {arSession.mode?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-neutral-300 mb-2">Connected with {arSession.technician} • Session: 00:03:42</p>
          </div>

          {/* AR Controls */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              className="border-neutral-600 text-neutral-300 bg-transparent text-xs h-7"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Add Marker
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-neutral-600 text-neutral-300 bg-transparent text-xs h-7"
            >
              <Layers className="h-3 w-3 mr-1" />
              Overlay Guide
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-neutral-600 text-neutral-300 bg-transparent text-xs h-7"
            >
              <Camera className="h-3 w-3 mr-1" />
              Capture
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-neutral-600 text-neutral-300 bg-transparent text-xs h-7"
            >
              <Video className="h-3 w-3 mr-1" />
              Record
            </Button>
          </div>

          {/* End Session */}
          <Button size="sm" variant="destructive" className="w-full text-xs h-7" onClick={endARSession}>
            End AR Session
          </Button>
        </>
      )}
    </div>
  )
}
