"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, Music, Phone, MessageSquare, Star, ThumbsUp, ThumbsDown, Clock, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomerExperienceFeaturesProps {
  callId: string
  customerId: string
  isActive: boolean
  callDuration: number
  onSatisfactionUpdate?: (rating: number) => void
  onScreenShareRequest?: () => void
  onCallbackScheduled?: (phoneNumber: string, preferredTime: string) => void
  className?: string
}

interface SatisfactionPulse {
  timestamp: Date
  rating: number
  feedback?: string
  context: string
}

interface ScreenShareSession {
  id: string
  active: boolean
  annotations: Array<{
    id: string
    x: number
    y: number
    text: string
    timestamp: Date
  }>
  customerCanControl: boolean
}

interface HoldMusicSettings {
  genre: string
  tempo: "calm" | "upbeat" | "neutral"
  estimatedWaitTime: number
  customerMood: "frustrated" | "neutral" | "happy"
}

interface CallbackRequest {
  id: string
  phoneNumber: string
  preferredTime: string
  reason: string
  status: "pending" | "scheduled" | "completed"
  estimatedCallback: Date
  smsUpdates: boolean
}

export default function CustomerExperienceFeatures({
  callId,
  customerId,
  isActive,
  callDuration,
  onSatisfactionUpdate,
  onScreenShareRequest,
  onCallbackScheduled,
  className,
}: CustomerExperienceFeaturesProps) {
  const [satisfactionPulses, setSatisfactionPulses] = useState<SatisfactionPulse[]>([])
  const [currentSatisfaction, setCurrentSatisfaction] = useState(3)
  const [screenShare, setScreenShare] = useState<ScreenShareSession>({
    id: `screen-${callId}`,
    active: false,
    annotations: [],
    customerCanControl: false,
  })
  const [holdMusic, setHoldMusic] = useState<HoldMusicSettings>({
    genre: "ambient",
    tempo: "calm",
    estimatedWaitTime: 0,
    customerMood: "neutral",
  })
  const [callbackRequest, setCallbackRequest] = useState<CallbackRequest | null>(null)
  const [showSatisfactionPrompt, setShowSatisfactionPrompt] = useState(false)
  const [realTimeFeedback, setRealTimeFeedback] = useState<string>("")
  const [customerEngagement, setCustomerEngagement] = useState(75)
  const [waitTimeEstimate, setWaitTimeEstimate] = useState(0)

  // Simulate real-time satisfaction monitoring
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      // Simulate satisfaction changes based on call duration and context
      const contextFactors = [
        { context: "Issue resolution attempt", impact: 0.2 },
        { context: "Wait time", impact: -0.1 },
        { context: "Agent empathy", impact: 0.3 },
        { context: "Technical difficulty", impact: -0.2 },
        { context: "Solution provided", impact: 0.4 },
      ]

      const randomContext = contextFactors[Math.floor(Math.random() * contextFactors.length)]
      const newRating = Math.max(1, Math.min(5, currentSatisfaction + randomContext.impact))

      if (Math.abs(newRating - currentSatisfaction) > 0.3) {
        setCurrentSatisfaction(newRating)
        const pulse: SatisfactionPulse = {
          timestamp: new Date(),
          rating: newRating,
          context: randomContext.context,
        }
        setSatisfactionPulses((prev) => [pulse, ...prev.slice(0, 4)])
        onSatisfactionUpdate?.(newRating)
      }

      // Update engagement based on call activity
      setCustomerEngagement((prev) => {
        const change = Math.random() * 20 - 10
        return Math.max(0, Math.min(100, prev + change))
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [isActive, currentSatisfaction, onSatisfactionUpdate])

  // Simulate periodic satisfaction prompts
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      if (callDuration > 300 && Math.random() > 0.7) {
        // After 5 minutes, 30% chance
        setShowSatisfactionPrompt(true)
        setTimeout(() => setShowSatisfactionPrompt(false), 10000) // Hide after 10 seconds
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isActive, callDuration])

  // Smart hold music adaptation
  useEffect(() => {
    if (waitTimeEstimate > 0) {
      const mood = currentSatisfaction < 2.5 ? "frustrated" : currentSatisfaction > 3.5 ? "happy" : "neutral"
      const tempo = waitTimeEstimate > 300 ? "calm" : waitTimeEstimate > 120 ? "neutral" : "upbeat"
      const genre = mood === "frustrated" ? "classical" : mood === "happy" ? "jazz" : "ambient"

      setHoldMusic({
        genre,
        tempo,
        estimatedWaitTime: waitTimeEstimate,
        customerMood: mood,
      })
    }
  }, [waitTimeEstimate, currentSatisfaction])

  const startScreenShare = () => {
    setScreenShare((prev) => ({ ...prev, active: true }))
    onScreenShareRequest?.()
  }

  const stopScreenShare = () => {
    setScreenShare((prev) => ({ ...prev, active: false, annotations: [] }))
  }

  const addScreenAnnotation = (x: number, y: number, text: string) => {
    const annotation = {
      id: `ann-${Date.now()}`,
      x,
      y,
      text,
      timestamp: new Date(),
    }
    setScreenShare((prev) => ({
      ...prev,
      annotations: [...prev.annotations, annotation],
    }))
  }

  const scheduleCallback = () => {
    const callback: CallbackRequest = {
      id: `callback-${Date.now()}`,
      phoneNumber: "+1 (415) 555-0117", // Would be customer's number
      preferredTime: "Tomorrow 2:00 PM",
      reason: "Continue troubleshooting",
      status: "scheduled",
      estimatedCallback: new Date(Date.now() + 24 * 60 * 60 * 1000),
      smsUpdates: true,
    }
    setCallbackRequest(callback)
    onCallbackScheduled?.(callback.phoneNumber, callback.preferredTime)
  }

  const submitMicroFeedback = (rating: number, feedback?: string) => {
    const pulse: SatisfactionPulse = {
      timestamp: new Date(),
      rating,
      feedback,
      context: "Direct customer feedback",
    }
    setSatisfactionPulses((prev) => [pulse, ...prev.slice(0, 4)])
    setCurrentSatisfaction(rating)
    setShowSatisfactionPrompt(false)
    onSatisfactionUpdate?.(rating)
  }

  if (!isActive) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Live Satisfaction Pulse */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" />
            <div className="text-sm font-medium text-neutral-200">Customer Satisfaction</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3 w-3",
                    star <= currentSatisfaction ? "text-yellow-400 fill-yellow-400" : "text-neutral-600",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-400">{currentSatisfaction.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Engagement Level</span>
            <span className="text-neutral-300">{Math.round(customerEngagement)}%</span>
          </div>
          <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${customerEngagement}%` }} />
          </div>
        </div>

        {satisfactionPulses.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-medium text-neutral-300">Recent Feedback:</div>
            {satisfactionPulses.slice(0, 2).map((pulse, index) => (
              <div key={index} className="text-xs text-neutral-400 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-2 w-2",
                        star <= pulse.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-600",
                      )}
                    />
                  ))}
                </div>
                <span>{pulse.context}</span>
                <span className="text-neutral-500">{pulse.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {showSatisfactionPrompt && (
          <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs font-medium text-blue-300 mb-2">Quick Feedback Request</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => submitMicroFeedback(5)}
                className="h-6 px-2 text-xs bg-green-500/10 border-green-500/20 text-green-400"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => submitMicroFeedback(2)}
                className="h-6 px-2 text-xs bg-red-500/10 border-red-500/20 text-red-400"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
              <span className="text-xs text-blue-300">How are we doing?</span>
            </div>
          </div>
        )}
      </div>

      {/* Screen Sharing with Annotations */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-400" />
            <div className="text-sm font-medium text-neutral-200">Screen Sharing</div>
          </div>
          <Button
            size="sm"
            variant={screenShare.active ? "default" : "outline"}
            onClick={screenShare.active ? stopScreenShare : startScreenShare}
            className="h-6 px-2 text-xs"
          >
            {screenShare.active ? "Stop" : "Start"} Share
          </Button>
        </div>

        {screenShare.active ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Screen sharing active with customer
            </div>

            {screenShare.annotations.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-neutral-300">Annotations:</div>
                {screenShare.annotations.slice(-3).map((annotation) => (
                  <div key={annotation.id} className="text-xs text-neutral-400 flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{annotation.text}</span>
                    <span className="text-neutral-500">
                      ({annotation.x}, {annotation.y})
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => addScreenAnnotation(150, 200, "Click here to continue")}
                className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Add Pointer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScreenShare((prev) => ({ ...prev, customerCanControl: !prev.customerCanControl }))}
                className="h-6 px-2 text-xs bg-transparent"
              >
                {screenShare.customerCanControl ? "Disable" : "Enable"} Customer Control
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            Start screen sharing to provide visual assistance and troubleshooting
          </div>
        )}
      </div>

      {/* Smart Hold Music */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-purple-400" />
            <div className="text-sm font-medium text-neutral-200">Smart Hold Experience</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWaitTimeEstimate(waitTimeEstimate > 0 ? 0 : 180)}
              className="h-6 px-2 text-xs"
            >
              {waitTimeEstimate > 0 ? "End Hold" : "Put on Hold"}
            </Button>
          </div>
        </div>

        {waitTimeEstimate > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Estimated Wait</span>
              <span className="text-purple-300">
                {Math.floor(waitTimeEstimate / 60)}:{(waitTimeEstimate % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-neutral-400">Music Selection:</div>
              <div className="flex items-center gap-2">
                <div className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded">
                  {holdMusic.genre}
                </div>
                <div className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded">
                  {holdMusic.tempo}
                </div>
                <div className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded">
                  {holdMusic.customerMood}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Volume2 className="h-3 w-3 text-purple-400" />
              <span className="text-purple-300">Adaptive music based on customer mood and wait time</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            AI-powered hold music that adapts to customer mood and estimated wait time
          </div>
        )}
      </div>

      {/* Callback Queue with SMS Updates */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-400" />
            <div className="text-sm font-medium text-neutral-200">Callback Queue</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={scheduleCallback}
            disabled={!!callbackRequest}
            className="h-6 px-2 text-xs bg-transparent"
          >
            Schedule Callback
          </Button>
        </div>

        {callbackRequest ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded">
                {callbackRequest.status.toUpperCase()}
              </div>
              <span className="text-xs text-green-300">Callback scheduled</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-green-400" />
                <span className="text-neutral-300">{callbackRequest.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                <span className="text-neutral-300">{callbackRequest.preferredTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-green-400" />
                <span className="text-neutral-300">SMS updates enabled</span>
              </div>
            </div>

            <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-green-300">
                Customer will receive SMS updates about callback status and can reschedule if needed
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500">
              Allow customers to schedule callbacks and receive SMS updates about their position in queue
            </div>
            <div className="space-y-1 text-xs text-neutral-400">
              <div>• Automatic SMS notifications</div>
              <div>• Flexible rescheduling options</div>
              <div>• Queue position updates</div>
              <div>• Estimated callback time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
