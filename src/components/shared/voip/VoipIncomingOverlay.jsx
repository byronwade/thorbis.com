"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play,
  Circle,
  Users,
  Brain,
  X,
  Minimize2,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Props for the overlay component
const defaultProps = {
  open: false,
  onOpenChange: () => {}
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default function VoipIncomingOverlay({ 
  open = false, 
  onOpenChange = () => {} 
} = defaultProps) {
  const router = useRouter()

  const [controls, setControls] = useState({
    muted: false,
    speakerOn: false,
    recording: false,
    onHold: false,
    volume: 75,
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [gestureStart, setGestureStart] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [callQuality, setCallQuality] = useState(85)
  const [isMinimized, setIsMinimized] = useState(false)

  const [visible, setVisible] = useState(true)
  const [callState, setCallState] = useState("ringing")
  const [caller, setCaller] = useState({
    id: "12345",
    name: "Jordan Pierce",
    company: "ACME Field Services",
    phone: "+1 (415) 555-0117",
    avatar: "/placeholder-avatar.svg",
  })
  const [ringSeconds, setRingSeconds] = useState(0)
  const [callSeconds, setCallSeconds] = useState(0)

  // Get caller data from session storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCall = sessionStorage.getItem('voip:active-call')
      if (storedCall) {
        try {
          const callData = JSON.parse(storedCall)
          if (callData.customer) {
            setCaller({
              id: callData.customer.id,
              name: callData.customer.name,
              company: callData.customer.company,
              phone: callData.customer.phone,
              avatar: callData.customer.avatarUrl || "/placeholder-avatar.svg",
            })
          }
        } catch (error) {
          console.warn('Failed to parse stored call data:', error)
        }
      }
    }
  }, [])

  // Simulate call quality fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCallQuality((prev) => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Timer effects
  useEffect(() => {
    let interval
    if (callState === "ringing") {
      interval = setInterval(() => setRingSeconds((s) => s + 1), 1000)
    } else if (callState === "connected" || callState === "on-hold") {
      interval = setInterval(() => setCallSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callState])

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setGestureStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e) => {
    if (!gestureStart) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - gestureStart.x
    const deltaY = touch.clientY - gestureStart.y

    if (Math.abs(deltaX) > 50) {
      setDragOffset({ x: deltaX, y: deltaY })
    }
  }

  const handleTouchEnd = () => {
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0 && callState === "ringing") {
        handleAnswer()
      } else if (dragOffset.x < 0) {
        handleDecline()
      }
    }
    setGestureStart(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleAnswer = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCallState("connected")
      setIsAnimating(false)
      onOpenChange()
      // Navigate to call details or full VOIP interface
      router.push(`/call/${encodeURIComponent(caller.id)}`)
    }, 300)
  }

  const handleDecline = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCallState("ended")
      setVisible(false)
      setIsAnimating(false)
      onOpenChange()
    }, 300)
  }

  const toggleControl = (control) => {
    setControls((prev) => ({ ...prev, [control]: !prev[control] }))
    if (control === "onHold") {
      setCallState((prev) => (prev === "on-hold" ? "connected" : "on-hold"))
    }
  }

  // Don't render if not visible or call ended
  if (!visible || callState === "ended" || !open) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]"
      aria-live="polite"
      role="dialog"
      aria-label="VoIP Call Interface"
    >
      <Card
        className={cn(
          "w-[min(92vw,400px)] shadow-2xl border-2 bg-white/95 backdrop-blur-md",
          "focus-within:ring-2 focus-within:ring-blue-500/40 transition-all duration-300",
          "transform-gpu will-change-transform",
          isAnimating && "scale-105 shadow-3xl",
          dragOffset.x !== 0 && `translate-x-[${dragOffset.x}px]`,
          isMinimized && "h-16"
        )}
        style={{
          transform: dragOffset.x !== 0 ? `translateX(${dragOffset.x}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                callState === "ringing" ? "bg-green-500 animate-pulse" : "bg-blue-500"
              )} />
              <span className="font-medium text-sm">
                {callState === "ringing" ? "Incoming Call" : "Active Call"}
              </span>
              {callState !== "ringing" && (
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(callSeconds)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Call Quality Indicator */}
              {(callState === "connected" || callState === "on-hold") && (
                <div className="flex items-center gap-1 mr-2">
                  <div className="flex h-4 items-end gap-px">
                    <div className="w-1 bg-green-500" style={{ height: "3px" }} />
                    <div className="w-1 bg-green-500" style={{ height: "6px" }} />
                    <div className="w-1 bg-green-500" style={{ height: "9px" }} />
                    <div className="w-1 bg-green-500" style={{ height: "12px" }} />
                  </div>
                  <span className="text-xs text-green-600">HD</span>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDecline}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Caller Information */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                  <AvatarImage src={caller.avatar} alt={caller.name} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {caller.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {callState === "connected" && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{caller.name}</h3>
                <p className="text-sm text-gray-600 truncate">{caller.company}</p>
                <p className="text-xs text-gray-500 font-mono">{caller.phone}</p>
              </div>

              {callState === "connected" && (
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">
                  <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                  Live
                </Badge>
              )}
            </div>

            {/* Call Quality Progress (for active calls) */}
            {(callState === "connected" || callState === "on-hold") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Call Quality</span>
                  <span>{callQuality}%</span>
                </div>
                <Progress value={callQuality} className="h-1" />
              </div>
            )}

            {/* Call Controls */}
            {callState === "ringing" ? (
              // Incoming Call Actions
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleDecline}
                    variant="destructive"
                    size="lg"
                    className="flex-1 h-12 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={handleAnswer}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Answer
                  </Button>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Swipe right to answer • Swipe left to decline
                </div>
              </div>
            ) : (
              // Active Call Controls
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={controls.muted ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("muted")}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      controls.muted && "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    {controls.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{controls.muted ? "Unmute" : "Mute"}</span>
                  </Button>

                  <Button
                    variant={controls.onHold ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("onHold")}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      controls.onHold && "bg-amber-500 hover:bg-amber-600 text-white"
                    )}
                  >
                    {controls.onHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{controls.onHold ? "Resume" : "Hold"}</span>
                  </Button>

                  <Button
                    variant={controls.speakerOn ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("speakerOn")}
                    className="flex-1 transition-all duration-200"
                  >
                    {controls.speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="ml-1 text-xs">Speaker</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={controls.recording ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("recording")}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      controls.recording && "animate-pulse"
                    )}
                  >
                    <Circle className="h-4 w-4" />
                    <span className="ml-1 text-xs">{controls.recording ? "Stop Rec" : "Record"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <span className="ml-1 text-xs">Transfer</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 transition-all duration-200"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span className="ml-1 text-xs">End</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
