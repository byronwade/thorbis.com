"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Heart } from "lucide-react"
import { Circle, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, Users, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import CallerIntelligence from "./caller-intelligence"
import WorkflowAutomation from "./workflow-automation"
import RealTimeCollaboration from "./real-time-collaboration"
import ProfessionalDataCapture from "./professional-data-capture"
import AdvancedUIControls from "./advanced-ui-controls"
import PerformanceAnalyticsDashboard from "./performance-analytics-dashboard"
import AIVoiceFeatures from "./ai-voice-features"
// Added import for customer experience features
import CustomerExperienceFeatures from "./customer-experience-features"

interface OverlayProps {
  open?: boolean
  onOpenChange?: () => void
}

interface CallControls {
  muted: boolean
  speakerOn: boolean
  recording: boolean
  onHold: boolean
  volume: number
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default function VoipIncomingOverlay({ open = false, onOpenChange = () => {} }: OverlayProps = {}) {
  const router = useRouter()

  const [controls, setControls] = useState<CallControls>({
    muted: false,
    speakerOn: false,
    recording: false,
    onHold: false,
    volume: 75,
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [gestureStart, setGestureStart] = useState<{ x: number; y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [callQuality, setCallQuality] = useState(85)
  const [networkLatency, setNetworkLatency] = useState(45)
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [contextualHints, setContextualHints] = useState("")

  const [transferTarget, setTransferTarget] = useState("")
  const [conferenceParticipants, setConferenceParticipants] = useState<string[]>([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showWorkflows, setShowWorkflows] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showDataCapture, setShowDataCapture] = useState(false)
  const [showUIControls, setShowUIControls] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAIFeatures, setShowAIFeatures] = useState(false)
  // Added state for customer experience features
  const [showCustomerFeatures, setShowCustomerFeatures] = useState(false)

  const [visible, setVisible] = useState(true)
  const [callState, setCallState] = useState("ringing")
  const [caller, setCaller] = useState({
    id: "12345",
    name: "Jordan Pierce",
    company: "ACME Field Services",
    phone: "+1 (415) 555-0117",
    avatar: "/caller-avatar.png",
  })
  const [ringSeconds, setRingSeconds] = useState(0)
  const [callSeconds, setCallSeconds] = useState(0)

  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferType, setTransferType] = useState<"warm" | "cold" | "conference">("warm")
  const [transferOptions] = useState([
    { id: "dept-sales", name: "Sales Department", type: "department", available: true },
    { id: "dept-support", name: "Technical Support", type: "department", available: true },
    { id: "dept-billing", name: "Billing Department", type: "department", available: false },
    { id: "agent-john", name: "John Smith", type: "agent", status: "available", extension: "1234" },
    { id: "agent-sarah", name: "Sarah Johnson", type: "agent", status: "busy", extension: "1235" },
    { id: "agent-mike", name: "Mike Wilson", type: "agent", status: "available", extension: "1236" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setCallQuality((prev) => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)))
      setNetworkLatency((prev) => Math.max(20, Math.min(200, prev + (Math.random() - 0.5) * 20)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (callState === "connected") {
      const hints = [
        "Customer has Gold maintenance plan - offer priority scheduling",
        "Previous issue resolved with firmware update - check version",
        "High-value account - consider escalation if needed",
      ]
      setContextualHints(hints[Math.floor(Math.random() * hints.length)])
    }
  }, [callState])

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callState === "ringing") {
      interval = setInterval(() => setRingSeconds((s) => s + 1), 1000)
    } else if (callState === "connected" || callState === "on-hold") {
      interval = setInterval(() => setCallSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callState])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (controls.recording) {
      interval = setInterval(() => setRecordingDuration((s) => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [controls.recording])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setGestureStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
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

  // Enhanced keyboard shortcut handler
  useEffect(() => {
    const handleShortcut = (event: CustomEvent) => {
      const { shortcutId } = event.detail

      switch (shortcutId) {
        case "answer-call":
          if (callState === "ringing") {
            setCallState("connected")
            onOpenChange()
            router.push(`/call/${encodeURIComponent(caller.id)}`)
          }
          break
        case "end-call":
          setCallState("ended")
          setVisible(false)
          onOpenChange()
          break
        case "toggle-mute":
          if (callState === "connected") {
            setControls((prev) => ({ ...prev, muted: !prev.muted }))
          }
          break
        case "toggle-hold":
          if (callState === "connected") {
            setControls((prev) => ({ ...prev, onHold: !prev.onHold }))
            setCallState((prev) => (prev === "on-hold" ? "connected" : "on-hold"))
          }
          break
        case "open-ai-panel":
          setShowIntelligence(!showIntelligence)
          break
        case "open-data-panel":
          setShowDataCapture(!showDataCapture)
          break
        case "toggle-high-contrast":
          document.documentElement.classList.toggle("high-contrast")
          break
        case "open-analytics-panel":
          setShowAnalytics(!showAnalytics)
          break
        case "toggle-ai-features":
          setShowAIFeatures(!showAIFeatures)
          break
        // Added case for customer experience features
        case "toggle-customer-features":
          setShowCustomerFeatures(!showCustomerFeatures)
          break
      }
    }

    document.addEventListener("voip-shortcut", handleShortcut as EventListener)
    return () => document.removeEventListener("voip-shortcut", handleShortcut as EventListener)
  }, [
    callState,
    showIntelligence,
    showDataCapture,
    showAnalytics,
    showAIFeatures,
    showCustomerFeatures,
    onOpenChange,
    router,
    caller.id,
  ])

  const handleAnswer = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCallState("connected")
      setIsAnimating(false)
      onOpenChange()
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

  const toggleControl = (control: keyof CallControls) => {
    setControls((prev) => ({ ...prev, [control]: !prev[control] }))
    if (control === "onHold") {
      setCallState((prev) => (prev === "on-hold" ? "connected" : "on-hold"))
    }
  }

  if (!visible || callState === "ended") return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]"
      aria-live="polite"
      role="dialog"
      aria-label="VoIP Call Interface"
    >
      <div className="flex flex-col gap-3">
        {/* Feature Panels */}
        {showAnalytics && <PerformanceAnalyticsDashboard className="w-[min(92vw,520px)]" />}
        {showUIControls && <AdvancedUIControls className="w-[min(92vw,520px)]" />}
        {(callState === "connected" || callState === "on-hold") && showDataCapture && (
          <ProfessionalDataCapture
            callId={`call-${caller.id}`}
            callerContext={{
              name: caller.name,
              phone: caller.phone,
              email: "jordan.pierce@acme.com",
              company: caller.company,
              caller_intent: "technical_support",
            }}
            className="w-[min(92vw,520px)]"
          />
        )}
        {(callState === "connected" || callState === "on-hold") && showCollaboration && (
          <RealTimeCollaboration callId={`call-${caller.id}`} currentUserId="agent-1" className="w-[min(92vw,520px)]" />
        )}
        {(callState === "connected" || callState === "on-hold") && showWorkflows && (
          <WorkflowAutomation
            callerId={caller.id}
            callerContext={{
              caller_intent: "technical_support",
              caller_tier: "gold",
              riskScore: 25,
              openTickets: 1,
              paymentStatus: "current",
            }}
            className="w-[min(92vw,520px)]"
          />
        )}
        {(callState === "connected" || callState === "on-hold") && showIntelligence && (
          <CallerIntelligence callerId={caller.id} compact={true} className="w-[min(92vw,520px)]" />
        )}
        {(callState === "connected" || callState === "on-hold") && showAIFeatures && (
          <AIVoiceFeatures
            callId={`call-${caller.id}`}
            isActive={callState === "connected" || callState === "on-hold"}
            className="w-[min(92vw,520px)]"
          />
        )}
        {/* Added customer experience features panel */}
        {(callState === "connected" || callState === "on-hold") && showCustomerFeatures && (
          <CustomerExperienceFeatures
            callId={`call-${caller.id}`}
            customerId={caller.id}
            isActive={callState === "connected" || callState === "on-hold"}
            callDuration={callSeconds}
            className="w-[min(92vw,520px)]"
          />
        )}

        {/* Main VoIP Overlay - Enhanced with modern interactions */}
        <div
          className={cn(
            "w-[min(92vw,520px)] rounded-xl border border-neutral-700 bg-neutral-900/95 shadow-2xl",
            "backdrop-blur-md supports-[backdrop-filter]:bg-neutral-900/90",
            "focus-within:ring-2 focus-within:ring-blue-500/40 transition-all duration-300",
            "transform-gpu will-change-transform",
            isAnimating && "scale-105 shadow-3xl",
            dragOffset.x !== 0 && `translate-x-[${dragOffset.x}px]`,
          )}
          style={{
            transform: dragOffset.x !== 0 ? `translateX(${dragOffset.x}px)` : undefined,
          }}
          tabIndex={-1}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Bar - Enhanced with modern status indicators */}
          <div className="flex items-center justify-between border-b border-neutral-700/50 bg-neutral-800/30 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20">
                <Phone className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Incoming Call</h3>
                <p className="text-xs text-neutral-400">VoIP Channel 1</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Call Quality Indicator */}
              {(callState === "connected" || callState === "on-hold") && (
                <div className="flex items-center gap-1">
                  <div className="flex h-4 items-end gap-px">
                    <div className="w-1 bg-green-500 transition-opacity opacity-100" style={{ height: "3px" }} />
                    <div className="w-1 bg-green-500 transition-opacity opacity-100" style={{ height: "6px" }} />
                    <div className="w-1 bg-green-500 transition-opacity opacity-100" style={{ height: "9px" }} />
                    <div className="w-1 bg-green-500 transition-opacity opacity-100" style={{ height: "12px" }} />
                  </div>
                  <span className="text-xs text-green-400">HD</span>
                </div>
              )}

              {/* Call Duration */}
              <span className="text-xs text-neutral-400 font-mono" aria-live="polite">
                {callState === "ringing"
                  ? formatDuration(ringSeconds)
                  : callState === "connected" || callState === "on-hold"
                    ? formatDuration(callSeconds)
                    : "—"}
              </span>
            </div>
          </div>

          {contextualHints && (callState === "connected" || callState === "on-hold") && (
            <div className="mx-4 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-300">{contextualHints}</span>
              </div>
            </div>
          )}

          {/* Main Content - Enhanced caller info and controls */}
          <div className="px-4 pb-4">
            {/* Caller Information */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                  <AvatarImage src={caller.avatar || "/placeholder.svg"} alt={caller.name} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {caller.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {callState === "connected" && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-neutral-900 animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-100 truncate">{caller.name}</h3>
                <p className="text-sm text-neutral-300 truncate">{caller.company}</p>
                <p className="text-xs text-neutral-400 font-mono">{caller.phone}</p>
              </div>

              {callState === "connected" && (
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                  <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                  Live
                </Badge>
              )}
            </div>

            {(callState === "connected" || callState === "on-hold") && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Call Quality</span>
                  <span>{callQuality}%</span>
                </div>
                <Progress value={callQuality} className="h-1 bg-neutral-800" />
              </div>
            )}

            {/* Call Controls */}
            {callState === "ringing" ? (
              // Incoming Call Actions - Enhanced with gesture hints
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
                <div className="text-center text-xs text-neutral-500">
                  Swipe right to answer • Swipe left to decline
                </div>
              </div>
            ) : (
              // Active Call Controls - Enhanced with modern styling
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={controls.muted ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("muted")}
                    className={cn(
                      "flex-1 transition-all duration-200 hover:scale-105 active:scale-95",
                      controls.muted && "bg-red-500 hover:bg-red-600 text-white shadow-lg",
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
                      "flex-1 transition-all duration-200 hover:scale-105 active:scale-95",
                      controls.onHold && "bg-amber-500 hover:bg-amber-600 text-white shadow-lg",
                    )}
                  >
                    {controls.onHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{controls.onHold ? "Resume" : "Hold"}</span>
                  </Button>

                  <Button
                    variant={controls.speakerOn ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("speakerOn")}
                    className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {controls.speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="ml-1 text-xs">Speaker</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={controls.recording ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleControl("recording")}
                    className={cn(
                      "flex-1 transition-all duration-200 hover:scale-105 active:scale-95",
                      controls.recording && "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg",
                    )}
                  >
                    <Circle className="h-4 w-4" />
                    <span className="ml-1 text-xs">{controls.recording ? "Stop Rec" : "Record"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setShowTransferDialog(true)}
                  >
                    <Users className="h-4 w-4" />
                    <span className="ml-1 text-xs">Transfer</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span className="ml-1 text-xs">End</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAIFeatures(!showAIFeatures)}
                    className="h-8 px-3 bg-neutral-800 hover:bg-neutral-700 border-neutral-600"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    AI Features
                  </Button>

                  {/* Added customer experience features button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomerFeatures(!showCustomerFeatures)}
                    className="h-8 px-3 bg-neutral-800 hover:bg-neutral-700 border-neutral-600"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Customer Experience
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Transfer Dialog */}
          {showTransferDialog && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Transfer Call</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTransferDialog(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Transfer Type Selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-neutral-200 mb-2 block">Transfer Type</label>
                  <div className="flex gap-2">
                    {[
                      { value: "warm", label: "Warm", desc: "Stay on line" },
                      { value: "cold", label: "Cold", desc: "Direct transfer" },
                      { value: "conference", label: "Conference", desc: "3-way call" },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={transferType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTransferType(type.value as any)}
                        className={cn(
                          "flex-1 flex-col h-auto py-2",
                          transferType === type.value && "bg-blue-600 hover:bg-blue-700",
                        )}
                      >
                        <span className="text-xs font-medium">{type.label}</span>
                        <span className="text-xs opacity-70">{type.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Transfer Options */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-neutral-200 mb-2 block">Transfer To</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {transferOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-3 text-left hover:bg-neutral-800 bg-transparent"
                        onClick={() => {
                          setTransferTarget(option.id)
                          // Handle transfer logic here
                          setShowTransferDialog(false)
                        }}
                        disabled={option.type === "department" && !option.available}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              option.type === "department"
                                ? option.available
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                : option.status === "available"
                                  ? "bg-green-500"
                                  : "bg-amber-500",
                            )}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{option.name}</div>
                            <div className="text-xs text-neutral-400">
                              {option.type === "department"
                                ? option.available
                                  ? "Available"
                                  : "Unavailable"
                                : `${option.status} • Ext. ${option.extension}`}
                            </div>
                          </div>
                          {option.type === "agent" && (
                            <div className="text-xs text-neutral-500">{option.extension}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Manual Transfer Input */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-neutral-200 mb-2 block">Or Enter Extension/Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Extension or phone number"
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transferTarget}
                      onChange={(e) => setTransferTarget(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!transferTarget.trim()}
                      onClick={() => {
                        // Handle manual transfer
                        setShowTransferDialog(false)
                      }}
                    >
                      Transfer
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowTransferDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!transferTarget}
                    onClick={() => {
                      // Handle transfer execution
                      setShowTransferDialog(false)
                    }}
                  >
                    {transferType === "warm"
                      ? "Warm Transfer"
                      : transferType === "cold"
                        ? "Cold Transfer"
                        : "Start Conference"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
