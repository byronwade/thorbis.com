"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Mail, 
  MessageSquare, 
  Search, 
  Phone, 
  Video, 
  Users, 
  ChevronDown,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  RefreshCw,
  Hash,
  Plus,
  Settings,
  Bell,
  BellOff,
  Pin,
  Edit,
  Trash2,
  UserPlus,
  Mic,
  MicOff,
  Headphones,
  HeadphonesOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Shield,
  Lock,
  Globe,
  Star,
  StarOff
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data
const USERS = [
  { id: "u1", name: "Alex Rivera", role: "Support Lead", online: true, color: "bg-emerald-500", status: "Available", lastSeen: null },
  { id: "u2", name: "Bri Chen", role: "Operations", online: true, color: "bg-sky-500", status: "In a meeting", lastSeen: null },
  { id: "u3", name: "Casey Green", role: "Customer Success", online: true, color: "bg-orange-500", status: "Available", lastSeen: null },
  { id: "u4", name: "Dee Patel", role: "Billing Manager", online: true, color: "bg-fuchsia-500", status: "Do not disturb", lastSeen: null },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500", status: "Available", lastSeen: null },
  { id: "u6", name: "Finn Ortiz", role: "Support", online: true, color: "bg-amber-500", status: "Away", lastSeen: null },
  { id: "u7", name: "Gray Kim", role: "Marketing", online: true, color: "bg-cyan-500", status: "Available", lastSeen: null },
  { id: "u8", name: "Harper Yu", role: "Infrastructure", online: true, color: "bg-lime-500", status: "Available", lastSeen: null },
  { id: "u9", name: "Indy Park", role: "Support", online: true, color: "bg-purple-500", status: "Available", lastSeen: null },
  { id: "u10", name: "Jules Fox", role: "Support", online: true, color: "bg-pink-500", status: "Available", lastSeen: null },
  { id: "u11", name: "Kai Ono", role: "Customer Success", online: false, color: "bg-gray-400", status: "Offline", lastSeen: "2 hours ago" },
]

const CHANNELS = [
  { id: "all-team", name: "all-team", displayName: "All Team", type: "public", unread: 0, pinned: true },
  { id: "support", name: "support", displayName: "Support", type: "public", unread: 3, pinned: false },
  { id: "billing", name: "billing", displayName: "Billing", type: "public", unread: 0, pinned: false },
  { id: "infrastructure", name: "infrastructure", displayName: "Infrastructure", type: "public", unread: 1, pinned: false },
  { id: "marketing", name: "marketing", displayName: "Marketing", type: "public", unread: 0, pinned: false },
  { id: "general", name: "general", displayName: "General", type: "public", unread: 0, pinned: false },
]

const INITIAL_MESSAGES = [
  { 
    id: "m1", 
    userId: "u2", 
    text: "Morning team! Standup at :15 past.", 
    ts: Date.now() - 1000 * 60 * 60,
    reactions: { "👍": ["u1", "u3"], "👋": ["u5"] },
    edited: false,
    threadCount: 0
  },
  { 
    id: "m2", 
    userId: "u1", 
    text: "On it. I'll share billing follow-ups afterward.", 
    ts: Date.now() - 1000 * 60 * 57,
    reactions: { "✅": ["u2"] },
    edited: false,
    threadCount: 0
  },
  { 
    id: "m3", 
    userId: "u8", 
    text: "Infra deployment green ✅", 
    ts: Date.now() - 1000 * 60 * 54,
    reactions: { "🎉": ["u1", "u2", "u3", "u5"], "🚀": ["u7"] },
    edited: false,
    threadCount: 0
  },
  { 
    id: "m4", 
    userId: "u3", 
    text: "Case #1048 priority — I'm on point.", 
    ts: Date.now() - 1000 * 60 * 48,
    reactions: { "👍": ["u1"] },
    edited: false,
    threadCount: 2
  },
]

export default function TeamChat() {
  const [currentUserId, setCurrentUserId] = useState(USERS[0].id)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [newMessage, setNewMessage] = useState("")
  const [activeChannel, setActiveChannel] = useState("all-team")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMembers, setShowMembers] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [callStatus, setCallStatus] = useState("none") // none, calling, in-call
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [screenShare, setScreenShare] = useState(false)
  
  const viewportRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    if (atBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => {
      const threshold = 48
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
      setAtBottom(nearBottom)
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  function onSend() {
    if (!newMessage.trim()) return
    
    const msg = {
      id: Math.random().toString(36).slice(2),
      userId: currentUserId,
      text: newMessage,
      ts: Date.now(),
      reactions: {},
      edited: false,
      threadCount: 0
    }
    setMessages((prev) => [...prev, msg])
    setNewMessage("")
    setIsTyping(false)
  }

  function scrollToBottom() {
    const el = viewportRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  function getInitials(name) {
    const parts = name.split(" ")
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    
    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  function handleTyping(e) {
    setNewMessage(e.target.value)
    setIsTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  function getStatusColor(status) {
    switch (status) {
      case "Available": return "bg-green-500"
      case "Away": return "bg-yellow-500"
      case "Do not disturb": return "bg-red-500"
      case "In a meeting": return "bg-blue-500"
      case "Offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  const currentUser = USERS.find(u => u.id === currentUserId)
  const activeChannelData = CHANNELS.find(c => c.id === activeChannel)
  const filteredMessages = messages.filter(m => 
    !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      {/* Left Sidebar - Channels */}
      <div className="w-64 border-r bg-background flex flex-col min-h-0">
        {/* Workspace Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Team Chat</span>
              <span className="truncate text-xs text-muted-foreground">Thorbis Team</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite People
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 min-h-0">
          {/* Channels Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-xs font-medium text-muted-foreground">Channels</div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <nav className="space-y-1">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    activeChannel === channel.id 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "hover:bg-muted/30"
                  )}
                >
                  <Hash className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate flex-1">{channel.displayName}</span>
                  {channel.unread > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {channel.unread}
                    </Badge>
                  )}
                  {channel.pinned && (
                    <Pin className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <Separator />

          {/* Direct Messages */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-xs font-medium text-muted-foreground">Direct Messages</div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {USERS.map((user) => (
                <button
                  key={user.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/30 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px]">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                      getStatusColor(user.status)
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="flex-shrink-0 flex w-full items-center gap-2 border-b bg-background p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">
              #{activeChannelData?.displayName}
            </div>
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {USERS.filter(u => u.online).length} online
            </Badge>
            {activeChannelData?.type === "private" && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          
          <div className="relative flex min-w-0 items-center">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-[240px] pl-8"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowMembers(!showMembers)}>
              <Users className="h-4 w-4 mr-2" />
              Members
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCallStatus(callStatus === "none" ? "calling" : "none")}
              className={cn(callStatus !== "none" && "bg-green-100 text-green-700")}
            >
              <Phone className="h-4 w-4 mr-2" />
              {callStatus === "none" ? "Call" : "End"}
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin channel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Mute channel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Channel settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative flex-1 overflow-hidden">
              <ScrollArea ref={viewportRef} className="h-full">
                <div className="p-4 space-y-4">
                  {filteredMessages.map((message) => {
                    const user = USERS.find((u) => u.id === message.userId)
                    const isMine = message.userId === currentUserId
                    
                    return (
                      <div key={message.id} className={cn("flex items-start gap-3 group", isMine && "flex-row-reverse")}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">{getInitials(user?.name ?? "User")}</AvatarFallback>
                        </Avatar>
                        
                        <div className={cn("flex-1 min-w-0", isMine && "text-right")}>
                          <div className={cn(
                            "inline-block max-w-[70%] rounded-lg p-3 text-sm",
                            isMine 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted/50 border"
                          )}>
                            <div className={cn("flex items-center gap-2 mb-1", isMine && "flex-row-reverse")}>
                              <span className="font-medium text-xs">{user?.name}</span>
                              <span className="text-xs opacity-70">{formatTime(message.ts)}</span>
                              {message.edited && (
                                <span className="text-xs opacity-70">(edited)</span>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap">{message.text}</div>
                            
                            {/* Reactions */}
                            {Object.keys(message.reactions).length > 0 && (
                              <div className={cn("flex gap-1 mt-2", isMine && "justify-end")}>
                                {Object.entries(message.reactions).map(([emoji, users]) => (
                                  <button
                                    key={emoji}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs hover:bg-background"
                                  >
                                    <span>{emoji}</span>
                                    <span>{users.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Message Actions */}
                          <div className={cn(
                            "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                            isMine && "justify-end"
                          )}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              👍
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Reply
                            </Button>
                            {isMine && (
                              <>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">{getInitials(currentUser?.name ?? "User")}</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Scroll to bottom button */}
              {!atBottom && (
                <Button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 h-8 w-8 rounded-full p-0"
                  size="sm"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Message Composer */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex items-end gap-2 rounded-lg border bg-background p-3">
                <div className="flex min-w-0 flex-1 items-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Message #general"
                      className="min-h-[20px] max-h-[120px] w-full resize-none rounded-md border-0 bg-transparent px-0 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          onSend()
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={onSend} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <div className="w-64 border-l bg-background flex flex-col">
              <div className="flex-shrink-0 p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Members</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowMembers(false)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {USERS.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                          getStatusColor(user.status)
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.role}</div>
                        {user.status !== "Available" && (
                          <div className="text-xs text-muted-foreground">{user.status}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
