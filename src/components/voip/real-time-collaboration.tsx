"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Mic,
  Share,
  Hand,
  Crown,
  Headphones,
  Send,
  Pin,
  AlertCircle,
  CheckCircle,
  UserCheck,
  MousePointer,
  Monitor,
  Volume2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CollaboratorRole = "agent" | "supervisor" | "specialist" | "observer" | "trainee"

type Collaborator = {
  id: string
  name: string
  role: CollaboratorRole
  avatar?: string
  status: "active" | "idle" | "away"
  permissions: {
    canSpeak: boolean
    canControl: boolean
    canView: boolean
    canAnnotate: boolean
  }
  joinedAt: Date
  lastActivity: Date
  expertiseTags?: string[]
  availableForTransfer?: boolean
  currentLoad?: number
}

type ChatMessage = {
  id: string
  senderId: string
  senderName: string
  content: string
  type: "message" | "system" | "whisper" | "annotation"
  timestamp: Date
  private?: boolean
  targetId?: string
}

type Annotation = {
  id: string
  authorId: string
  authorName: string
  content: string
  type: "note" | "warning" | "suggestion" | "decision"
  timestamp: Date
  pinned: boolean
  resolved: boolean
}

type HandoffRequest = {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  reason: string
  status: "pending" | "accepted" | "declined"
  timestamp: Date
  callPreview?: {
    customerName: string
    issue: string
    duration: number
    priority: string
    notes: string[]
  }
}

type CursorPosition = {
  userId: string
  userName: string
  x: number
  y: number
  timestamp: Date
  element?: string
}

type CoachingMessage = {
  id: string
  fromId: string
  fromName: string
  toId: string
  content: string
  type: "whisper" | "suggestion" | "warning"
  timestamp: Date
  acknowledged?: boolean
}

const mockCollaborators: Collaborator[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    role: "supervisor",
    status: "active",
    permissions: { canSpeak: true, canControl: true, canView: true, canAnnotate: true },
    joinedAt: new Date(Date.now() - 300000),
    lastActivity: new Date(),
    expertiseTags: ["Technical Support", "Escalations", "Training"],
    availableForTransfer: true,
    currentLoad: 2,
  },
  {
    id: "user-2",
    name: "Mike Wilson",
    role: "specialist",
    status: "active",
    permissions: { canSpeak: true, canControl: false, canView: true, canAnnotate: true },
    joinedAt: new Date(Date.now() - 180000),
    lastActivity: new Date(),
    expertiseTags: ["Billing", "Account Management", "Disputes"],
    availableForTransfer: true,
    currentLoad: 1,
  },
  {
    id: "user-3",
    name: "Emma Davis",
    role: "agent",
    status: "idle",
    permissions: { canSpeak: false, canControl: false, canView: true, canAnnotate: false },
    joinedAt: new Date(Date.now() - 120000),
    lastActivity: new Date(Date.now() - 60000),
    expertiseTags: ["General Support", "New Customers"],
    availableForTransfer: false,
    currentLoad: 3,
  },
  {
    id: "user-4",
    name: "Alex Chen",
    role: "trainee",
    status: "active",
    permissions: { canSpeak: false, canControl: false, canView: true, canAnnotate: false },
    joinedAt: new Date(Date.now() - 60000),
    lastActivity: new Date(),
    expertiseTags: ["Learning", "Observation"],
    availableForTransfer: false,
    currentLoad: 0,
  },
]

const getRoleIcon = (role: CollaboratorRole) => {
  switch (role) {
    case "supervisor":
      return <Crown className="h-3 w-3 text-yellow-400" />
    case "specialist":
      return <UserCheck className="h-3 w-3 text-blue-400" />
    case "agent":
      return <Headphones className="h-3 w-3 text-green-400" />
    case "trainee":
      return <Eye className="h-3 w-3 text-purple-400" />
    default:
      return <Users className="h-3 w-3 text-neutral-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "idle":
      return "bg-yellow-500"
    case "away":
      return "bg-red-500"
    default:
      return "bg-neutral-500"
  }
}

const getAnnotationIcon = (type: Annotation["type"]) => {
  switch (type) {
    case "warning":
      return <AlertCircle className="h-3 w-3 text-red-400 mt-0.5" />
    case "suggestion":
      return <CheckCircle className="h-3 w-3 text-blue-400 mt-0.5" />
    case "decision":
      return <UserCheck className="h-3 w-3 text-green-400 mt-0.5" />
    default:
      return <Pin className="h-3 w-3 text-neutral-400 mt-0.5" />
  }
}

type CollaborationProps = {
  callId: string
  currentUserId: string
  onHandoffRequest?: (request: HandoffRequest) => void
  className?: string
}

export default function RealTimeCollaboration({
  callId,
  currentUserId,
  onHandoffRequest,
  className,
}: CollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(mockCollaborators)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [handoffRequests, setHandoffRequests] = useState<HandoffRequest[]>([])

  const [newMessage, setNewMessage] = useState("")
  const [newAnnotation, setNewAnnotation] = useState("")
  const [whisperMode, setWhisperMode] = useState(false)
  const [whisperTarget, setWhisperTarget] = useState("")
  const [screenSharing, setScreenSharing] = useState(false)
  const [supervisorMode, setSupervisorMode] = useState(false)
  const [liveCursors, setLiveCursors] = useState<CursorPosition[]>([])
  const [coachingMessages, setCoachingMessages] = useState<CoachingMessage[]>([])
  const [silentCoaching, setSilentCoaching] = useState(false)
  const [callPreviewMode, setCallPreviewMode] = useState(false)
  const [screenAnnotations, setScreenAnnotations] = useState<{ x: number; y: number; text: string; id: string }[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const currentUser = collaborators.find((c) => c.id === currentUserId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  useEffect(() => {
    if (!screenSharing) return

    const interval = setInterval(() => {
      const activeSupervisors = collaborators.filter((c) => c.role === "supervisor" && c.status === "active")
      if (activeSupervisors.length > 0) {
        const supervisor = activeSupervisors[0]
        const newCursor: CursorPosition = {
          userId: supervisor.id,
          userName: supervisor.name,
          x: Math.random() * 400,
          y: Math.random() * 300,
          timestamp: new Date(),
          element: Math.random() > 0.7 ? "intake-form" : undefined,
        }
        setLiveCursors((prev) => [newCursor, ...prev.slice(0, 4)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [screenSharing, collaborators])

  useEffect(() => {
    if (!silentCoaching) return

    const coachingTips = [
      "Try using more empathetic language here",
      "Consider offering the premium service upgrade",
      "Remember to verify the customer's identity first",
      "Good job building rapport with the customer",
      "This might be a good time to schedule a follow-up",
    ]

    const interval = setInterval(() => {
      const supervisors = collaborators.filter((c) => c.role === "supervisor" && c.status === "active")
      if (supervisors.length > 0 && Math.random() > 0.7) {
        const supervisor = supervisors[0]
        const message: CoachingMessage = {
          id: `coaching-${Date.now()}`,
          fromId: supervisor.id,
          fromName: supervisor.name,
          toId: currentUserId,
          content: coachingTips[Math.floor(Math.random() * coachingTips.length)],
          type: "suggestion",
          timestamp: new Date(),
        }
        setCoachingMessages((prev) => [message, ...prev.slice(0, 2)])
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [silentCoaching, collaborators, currentUserId])

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => ({
          ...c,
          lastActivity: c.status === "active" ? new Date() : c.lastActivity,
        })),
      )
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUser?.name || "You",
      content: newMessage,
      type: whisperMode ? "whisper" : "message",
      timestamp: new Date(),
      private: whisperMode,
      targetId: whisperMode ? whisperTarget : undefined,
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const addAnnotation = (type: Annotation["type"]) => {
    if (!newAnnotation.trim()) return

    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      authorId: currentUserId,
      authorName: currentUser?.name || "You",
      content: newAnnotation,
      type,
      timestamp: new Date(),
      pinned: false,
      resolved: false,
    }

    setAnnotations((prev) => [...prev, annotation])
    setNewAnnotation("")
  }

  const requestHandoff = (targetId: string, reason: string) => {
    const target = collaborators.find((c) => c.id === targetId)
    if (!target) return

    const request: HandoffRequest = {
      id: `handoff-${Date.now()}`,
      fromId: currentUserId,
      fromName: currentUser?.name || "You",
      toId: targetId,
      toName: target.name,
      reason,
      status: "pending",
      timestamp: new Date(),
      callPreview: {
        customerName: "Jordan Pierce",
        issue: "Internet connectivity problems",
        duration: 8,
        priority: "Medium",
        notes: ["Customer has Gold plan", "Previous ticket #TK-2024-0155", "Modem reset attempted"],
      },
    }

    setHandoffRequests((prev) => [...prev, request])
    onHandoffRequest?.(request)
  }

  const togglePin = (annotationId: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? { ...a, pinned: !a.pinned } : a)))
  }

  const resolveAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? { ...a, resolved: true } : a)))
  }

  const acknowledgeCoaching = (messageId: string) => {
    setCoachingMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, acknowledged: true } : m)))
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Live Collaboration</CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              {collaborators.filter((c) => c.status === "active").length} Active
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={screenSharing ? "default" : "ghost"}
              onClick={() => setScreenSharing(!screenSharing)}
              className="h-6 w-6 p-0"
              title="Screen Share"
            >
              <Share className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant={silentCoaching ? "default" : "ghost"}
              onClick={() => setSilentCoaching(!silentCoaching)}
              className="h-6 w-6 p-0"
              title="Silent Coaching"
            >
              <Headphones className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant={callPreviewMode ? "default" : "ghost"}
              onClick={() => setCallPreviewMode(!callPreviewMode)}
              className="h-6 w-6 p-0"
              title="Call Preview"
            >
              <Monitor className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3 w-3 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Team Members</span>
          </div>

          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center gap-2 p-2 rounded bg-neutral-800/50">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                    {getRoleIcon(collaborator.role)}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-900",
                      getStatusColor(collaborator.status),
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white truncate">{collaborator.name}</span>
                    {collaborator.availableForTransfer && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        Available
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 capitalize mb-1">{collaborator.role}</div>
                  {collaborator.expertiseTags && (
                    <div className="flex flex-wrap gap-1">
                      {collaborator.expertiseTags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  {collaborator.permissions.canSpeak && <Mic className="h-3 w-3 text-green-400" />}
                  {collaborator.currentLoad !== undefined && (
                    <span className="text-xs text-neutral-500">Load: {collaborator.currentLoad}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {screenSharing && liveCursors.length > 0 && (
          <>
            <Separator className="bg-neutral-800" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-medium text-neutral-300">Live Cursors</span>
              </div>
              <div className="space-y-1">
                {liveCursors.slice(0, 3).map((cursor, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-purple-300">{cursor.userName}</span>
                    <span className="text-neutral-500">
                      pointing at {cursor.element || `(${Math.round(cursor.x)}, ${Math.round(cursor.y)})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {silentCoaching && coachingMessages.length > 0 && (
          <>
            <Separator className="bg-neutral-800" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-3 w-3 text-green-400" />
                <span className="text-xs font-medium text-neutral-300">Coaching Whispers</span>
              </div>
              <div className="space-y-2">
                {coachingMessages
                  .filter((m) => !m.acknowledged)
                  .map((message) => (
                    <div key={message.id} className="p-2 rounded bg-green-500/10 border border-green-500/20 relative">
                      <div className="flex items-start gap-2">
                        <Headphones className="h-3 w-3 text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs font-medium text-green-300 mb-1">{message.fromName}</div>
                          <div className="text-xs text-green-200">{message.content}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeCoaching(message.id)}
                          className="h-5 w-5 p-0 text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-neutral-800" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Pin className="h-3 w-3 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Live Notes</span>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {annotations
              .filter((a) => a.pinned || !a.resolved)
              .map((annotation) => (
                <div
                  key={annotation.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded text-xs",
                    annotation.resolved ? "bg-neutral-800/30 opacity-60" : "bg-neutral-800/50",
                  )}
                >
                  {getAnnotationIcon(annotation.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{annotation.authorName}</span>
                      <span className="text-neutral-500">{annotation.timestamp.toLocaleTimeString()}</span>
                      {annotation.pinned && <Pin className="h-2 w-2 text-orange-400" />}
                    </div>
                    <p className="text-neutral-300">{annotation.content}</p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePin(annotation.id)}
                      className="h-5 w-5 p-0 text-neutral-400 hover:text-orange-400"
                    >
                      <Pin className="h-2 w-2" />
                    </Button>
                    {!annotation.resolved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveAnnotation(annotation.id)}
                        className="h-5 w-5 p-0 text-neutral-400 hover:text-green-400"
                      >
                        <CheckCircle className="h-2 w-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex gap-1 mt-2">
            <Input
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              placeholder="Add note..."
              className="flex-1 h-7 text-xs bg-neutral-800 border-neutral-700"
              onKeyDown={(e) => e.key === "Enter" && addAnnotation("note")}
            />
            <Button
              size="sm"
              onClick={() => addAnnotation("note")}
              className="h-7 px-2 text-xs bg-orange-500 hover:bg-orange-600"
            >
              Add
            </Button>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-300">Team Chat</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={whisperMode ? "default" : "ghost"}
                onClick={() => setWhisperMode(!whisperMode)}
                className="h-6 px-2 text-xs"
                title="Whisper Mode"
              >
                {whisperMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto mb-2">
            {chatMessages.slice(-5).map((message) => (
              <div
                key={message.id}
                className={cn(
                  "text-xs p-1 rounded",
                  message.type === "whisper" ? "bg-purple-500/10 border border-purple-500/20" : "bg-neutral-800/30",
                )}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-medium text-white">{message.senderName}</span>
                  <span className="text-neutral-500">{message.timestamp.toLocaleTimeString()}</span>
                  {message.type === "whisper" && <EyeOff className="h-2 w-2 text-purple-400" />}
                </div>
                <p className="text-neutral-300">{message.content}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={whisperMode ? "Whisper message..." : "Team message..."}
              className="flex-1 h-7 text-xs bg-neutral-800 border-neutral-700"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button size="sm" onClick={sendMessage} className="h-7 w-7 p-0 bg-orange-500 hover:bg-orange-600">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {handoffRequests.filter((r) => r.status === "pending").length > 0 && (
          <>
            <Separator className="bg-neutral-800" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hand className="h-3 w-3 text-yellow-400" />
                <span className="text-xs font-medium text-neutral-300">Handoff Requests</span>
              </div>

              {handoffRequests
                .filter((r) => r.status === "pending")
                .map((request) => (
                  <div key={request.id} className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <div className="text-white font-medium">
                          {request.fromName} → {request.toName}
                        </div>
                        <div className="text-neutral-400">{request.reason}</div>
                      </div>

                      {request.toId === currentUserId && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700">
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs border-neutral-700 bg-transparent"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>

                    {request.callPreview && callPreviewMode && (
                      <div className="bg-neutral-800/50 rounded p-2 text-xs space-y-1">
                        <div className="font-medium text-white">Call Preview:</div>
                        <div className="text-neutral-300">Customer: {request.callPreview.customerName}</div>
                        <div className="text-neutral-300">Issue: {request.callPreview.issue}</div>
                        <div className="text-neutral-300">Duration: {request.callPreview.duration}m</div>
                        <div className="text-neutral-300">Priority: {request.callPreview.priority}</div>
                        <div className="text-neutral-300">
                          Notes: {request.callPreview.notes.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
