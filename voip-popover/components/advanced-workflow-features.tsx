"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Hand, Zap, Wand2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdvancedWorkflowFeaturesProps {
  callId: string
  isActive: boolean
  onGestureDetected?: (gesture: string) => void
  onVoiceCommand?: (command: string) => void
  onContextualAction?: (action: string) => void
  className?: string
}

interface GestureData {
  type: string
  confidence: number
  action: string
  description: string
}

interface VoiceCommand {
  command: string
  action: string
  confidence: number
  timestamp: Date
}

interface SmartTemplate {
  id: string
  name: string
  description: string
  fields: Record<string, any>
  confidence: number
  source: string
}

interface ContextualShortcut {
  id: string
  label: string
  action: string
  icon: string
  keywords: string[]
  confidence: number
}

export default function AdvancedWorkflowFeatures({
  callId,
  isActive,
  onGestureDetected,
  onVoiceCommand,
  onContextualAction,
  className,
}: AdvancedWorkflowFeaturesProps) {
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false)
  const [currentGesture, setCurrentGesture] = useState<GestureData | null>(null)
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([])
  const [contextualShortcuts, setContextualShortcuts] = useState<ContextualShortcut[]>([])
  const [isListening, setIsListening] = useState(false)
  const [conversationKeywords, setConversationKeywords] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate gesture detection
  useEffect(() => {
    if (!gestureEnabled || !isActive) return

    const gestures = [
      {
        type: "wave",
        confidence: 92,
        action: "minimize_all_widgets",
        description: "Wave hand to minimize all widgets",
      },
      {
        type: "point",
        confidence: 88,
        action: "select_widget",
        description: "Point to select specific widget",
      },
      {
        type: "swipe_left",
        confidence: 85,
        action: "next_widget",
        description: "Swipe left to go to next widget",
      },
      {
        type: "swipe_right",
        confidence: 90,
        action: "previous_widget",
        description: "Swipe right to go to previous widget",
      },
      {
        type: "thumbs_up",
        confidence: 95,
        action: "approve_action",
        description: "Thumbs up to approve current action",
      },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const gesture = gestures[Math.floor(Math.random() * gestures.length)]
        setCurrentGesture(gesture)
        onGestureDetected?.(gesture.action)
        setTimeout(() => setCurrentGesture(null), 3000)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [gestureEnabled, isActive, onGestureDetected])

  // Simulate voice command recognition
  useEffect(() => {
    if (!voiceCommandsEnabled || !isActive) return

    const commands = [
      { command: "Create quote", action: "open_quote_builder", confidence: 96 },
      { command: "Transfer to billing", action: "transfer_billing", confidence: 94 },
      { command: "Add note", action: "create_note", confidence: 98 },
      { command: "Schedule callback", action: "schedule_callback", confidence: 92 },
      { command: "Send email", action: "compose_email", confidence: 89 },
      { command: "Check account", action: "view_account", confidence: 95 },
      { command: "Create ticket", action: "create_ticket", confidence: 97 },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const command = commands[Math.floor(Math.random() * commands.length)]
        const voiceCommand = { ...command, timestamp: new Date() }
        setRecentCommands((prev) => [voiceCommand, ...prev.slice(0, 4)])
        onVoiceCommand?.(command.action)
      }
    }, 12000)

    return () => clearInterval(interval)
  }, [voiceCommandsEnabled, isActive, onVoiceCommand])

  // Simulate smart template suggestions
  useEffect(() => {
    if (!isActive) return

    const templates = [
      {
        id: "tech-support-template",
        name: "Technical Support Form",
        description: "Auto-populated based on detected issue type",
        fields: {
          issueType: "Internet Connectivity",
          severity: "Medium",
          affectedServices: ["Internet", "Email"],
          troubleshootingSteps: ["Power cycle modem", "Check cables"],
        },
        confidence: 89,
        source: "AI Analysis",
      },
      {
        id: "billing-inquiry-template",
        name: "Billing Inquiry Form",
        description: "Pre-filled with account and billing context",
        fields: {
          inquiryType: "Charge Dispute",
          amount: "$45.99",
          billingPeriod: "March 2024",
          previousContacts: 2,
        },
        confidence: 92,
        source: "Call Pattern Recognition",
      },
      {
        id: "service-upgrade-template",
        name: "Service Upgrade Quote",
        description: "Suggested based on usage patterns",
        fields: {
          currentPlan: "Basic Internet",
          suggestedPlan: "Premium Internet + TV",
          monthlySavings: "$15",
          upgradeIncentive: "Free installation",
        },
        confidence: 85,
        source: "Customer Profile Analysis",
      },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const template = templates[Math.floor(Math.random() * templates.length)]
        setSmartTemplates((prev) => {
          const exists = prev.find((t) => t.id === template.id)
          if (!exists) {
            return [template, ...prev.slice(0, 2)]
          }
          return prev
        })
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [isActive])

  // Simulate contextual shortcuts based on conversation
  useEffect(() => {
    if (!isActive) return

    // Simulate conversation keyword detection
    const keywords = ["refund", "billing", "internet", "slow", "outage", "upgrade", "cancel", "technical"]
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newKeyword = keywords[Math.floor(Math.random() * keywords.length)]
        setConversationKeywords((prev) => {
          if (!prev.includes(newKeyword)) {
            return [newKeyword, ...prev.slice(0, 4)]
          }
          return prev
        })
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isActive])

  // Generate contextual shortcuts based on keywords
  useEffect(() => {
    const shortcutMap: Record<string, ContextualShortcut> = {
      refund: {
        id: "refund-shortcut",
        label: "Process Refund",
        action: "open_refund_form",
        icon: "💰",
        keywords: ["refund", "money", "charge"],
        confidence: 95,
      },
      billing: {
        id: "billing-shortcut",
        label: "View Billing",
        action: "open_billing_details",
        icon: "📄",
        keywords: ["billing", "invoice", "payment"],
        confidence: 92,
      },
      internet: {
        id: "internet-shortcut",
        label: "Internet Diagnostics",
        action: "run_internet_diagnostics",
        icon: "🌐",
        keywords: ["internet", "connection", "wifi"],
        confidence: 88,
      },
      slow: {
        id: "speed-shortcut",
        label: "Speed Test",
        action: "initiate_speed_test",
        icon: "⚡",
        keywords: ["slow", "speed", "performance"],
        confidence: 90,
      },
      outage: {
        id: "outage-shortcut",
        label: "Check Outages",
        action: "check_service_outages",
        icon: "🚨",
        keywords: ["outage", "down", "service"],
        confidence: 94,
      },
      upgrade: {
        id: "upgrade-shortcut",
        label: "Service Upgrade",
        action: "show_upgrade_options",
        icon: "⬆️",
        keywords: ["upgrade", "better", "faster"],
        confidence: 87,
      },
    }

    const newShortcuts = conversationKeywords
      .map((keyword) => shortcutMap[keyword])
      .filter(Boolean)
      .slice(0, 3)

    setContextualShortcuts(newShortcuts)
  }, [conversationKeywords])

  const startGestureDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setGestureEnabled(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopGestureDetection = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setGestureEnabled(false)
  }

  const startVoiceCommands = () => {
    setVoiceCommandsEnabled(true)
    setIsListening(true)
    // In a real implementation, this would start speech recognition
  }

  const stopVoiceCommands = () => {
    setVoiceCommandsEnabled(false)
    setIsListening(false)
  }

  const applySmartTemplate = (template: SmartTemplate) => {
    // In a real implementation, this would populate forms with template data
    console.log("Applying template:", template)
    onContextualAction?.(`apply_template_${template.id}`)
  }

  const executeContextualShortcut = (shortcut: ContextualShortcut) => {
    onContextualAction?.(shortcut.action)
  }

  if (!isActive) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Gesture Controls */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hand className="h-4 w-4 text-purple-400" />
            <div className="text-sm font-medium text-neutral-200">Gesture Controls</div>
          </div>
          <Button
            size="sm"
            variant={gestureEnabled ? "default" : "outline"}
            onClick={gestureEnabled ? stopGestureDetection : startGestureDetection}
            className="h-6 px-2 text-xs"
          >
            {gestureEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {currentGesture && (
          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-purple-300">
                Gesture Detected: {currentGesture.type.replace("_", " ")}
              </span>
              <Badge variant="outline" className="text-xs text-purple-400">
                {currentGesture.confidence}%
              </Badge>
            </div>
            <div className="text-xs text-purple-200">{currentGesture.description}</div>
          </div>
        )}
        {!currentGesture && gestureEnabled && (
          <div className="text-xs text-neutral-500">Watching for hand gestures...</div>
        )}
        {!gestureEnabled && <div className="text-xs text-neutral-500">Enable camera access for gesture controls</div>}
        <video ref={videoRef} className="hidden" autoPlay muted />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Voice Commands */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-green-400" />
            <div className="text-sm font-medium text-neutral-200">Voice Commands</div>
          </div>
          <Button
            size="sm"
            variant={voiceCommandsEnabled ? "default" : "outline"}
            onClick={voiceCommandsEnabled ? stopVoiceCommands : startVoiceCommands}
            className="h-6 px-2 text-xs"
          >
            {voiceCommandsEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 mb-2 p-2 rounded bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300">Listening for commands...</span>
          </div>
        )}
        {recentCommands.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-neutral-300 mb-1">Recent Commands:</div>
            {recentCommands.map((cmd, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">"{cmd.command}"</span>
                <Badge variant="outline" className="text-xs text-green-400">
                  {cmd.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Templates */}
      {smartTemplates.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="h-4 w-4 text-blue-400" />
            <div className="text-sm font-medium text-neutral-200">Smart Templates</div>
          </div>

          <div className="space-y-2">
            {smartTemplates.map((template) => (
              <div key={template.id} className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-300">{template.name}</span>
                  <Badge variant="outline" className="text-xs text-blue-400">
                    {template.confidence}%
                  </Badge>
                </div>
                <div className="text-xs text-blue-200 mb-2">{template.description}</div>
                <div className="text-xs text-neutral-400 mb-2">Source: {template.source}</div>
                <Button
                  size="sm"
                  onClick={() => applySmartTemplate(template)}
                  className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  Apply Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Shortcuts */}
      {contextualShortcuts.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <div className="text-sm font-medium text-neutral-200">Contextual Shortcuts</div>
          </div>

          <div className="text-xs text-neutral-400 mb-2">Based on conversation: {conversationKeywords.join(", ")}</div>
          <div className="flex flex-wrap gap-2">
            {contextualShortcuts.map((shortcut) => (
              <Button
                key={shortcut.id}
                size="sm"
                variant="outline"
                onClick={() => executeContextualShortcut(shortcut)}
                className="h-7 px-2 text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20"
              >
                <span className="mr-1">{shortcut.icon}</span>
                {shortcut.label}
                <Badge variant="outline" className="ml-1 text-xs">
                  {shortcut.confidence}%
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Keywords */}
      {conversationKeywords.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <div className="text-sm font-medium text-neutral-200">Conversation Analysis</div>
          </div>

          <div className="text-xs text-neutral-400 mb-2">Detected Keywords:</div>
          <div className="flex flex-wrap gap-1">
            {conversationKeywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
