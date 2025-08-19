"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Phone,
  Video,
  Users,
  ChevronDown,
  MessageSquareText,
  Send,
  Paperclip,
  Smile,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"

const USERS = [
  { id: "u1", name: "Alex Rivera", role: "Support", online: true, color: "bg-emerald-500" },
  { id: "u2", name: "Bri Chen", role: "Ops", online: true, color: "bg-sky-500" },
  { id: "u3", name: "Casey Green", role: "Success", online: true, color: "bg-warning" },
  { id: "u4", name: "Dee Patel", role: "Billing", online: true, color: "bg-fuchsia-500" },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500" },
  { id: "u6", name: "Finn Ortiz", role: "Support", online: true, color: "bg-amber-500" },
  { id: "u7", name: "Gray Kim", role: "Marketing", online: true, color: "bg-cyan-500" },
  { id: "u8", name: "Harper Yu", role: "Infra", online: true, color: "bg-lime-500" },
  { id: "u9", name: "Indy Park", role: "Support", online: true, color: "bg-purple-500" },
  { id: "u10", name: "Jules Fox", role: "Support", online: true, color: "bg-pink-500" },
]

const INITIAL_MESSAGES = [
  { id: "m1", userId: "u2", text: "Morning team! Daily standup in 15 minutes.", ts: Date.now() - 1000 * 60 * 60, channel: "general" },
  { id: "m2", userId: "u1", text: "On it. I'll share customer service updates afterward.", ts: Date.now() - 1000 * 60 * 57, channel: "general" },
  { id: "m3", userId: "u8", text: "System deployment completed successfully ✅", ts: Date.now() - 1000 * 60 * 54, channel: "general" },
  { id: "m4", userId: "u3", text: "Emergency service call #1048 - I'm handling it.", ts: Date.now() - 1000 * 60 * 48, channel: "general" },
]

const CHANNELS = [
  { id: "general", name: "General", description: "Team-wide discussions", unread: 2 },
  { id: "support", name: "Support", description: "Customer support coordination", unread: 0 },
  { id: "billing", name: "Billing", description: "Billing and payments", unread: 1 },
  { id: "field", name: "Field Team", description: "Field technicians", unread: 0 },
  { id: "management", name: "Management", description: "Leadership team", unread: 0 },
]

function getInitials(name) {
  const parts = name.split(" ")
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function TeamChat() {
  const [currentUserId, setCurrentUserId] = useState(USERS[0].id)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [newMessage, setNewMessage] = useState("")
  const [activeChannel, setActiveChannel] = useState("general")
  const [atBottom, setAtBottom] = useState(true)

  const viewportRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    // Scroll to bottom on mount and when new messages arrive
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

  function sendMessage() {
    if (!newMessage.trim()) return

    const message = {
      id: Math.random().toString(36).slice(2),
      userId: currentUserId,
      text: newMessage.trim(),
      ts: Date.now(),
      channel: activeChannel,
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  function scrollToBottom() {
    const el = viewportRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  const filteredMessages = messages.filter(m => m.channel === activeChannel)
  const currentChannel = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquareText className="h-8 w-8 mr-3 text-primary" />
            Team Chat
          </h1>
          <p className="text-muted-foreground">
            Real-time team communication and collaboration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Phone className="h-4 w-4" />
            Voice Call
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Video className="h-4 w-4" />
            Video Call
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex min-h-0 flex-1 overflow-hidden border rounded-lg">
        {/* Sidebar - Channels & DMs */}
        <div className="w-64 shrink-0 border-r flex flex-col bg-muted/20">
          {/* Sidebar Header */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                className="h-8 w-full pl-8 text-sm"
                placeholder="Search messages"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            {/* Channels Section */}
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
                Channels
              </div>
              <div className="space-y-1">
                {CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/50",
                      activeChannel === channel.id && "bg-muted border"
                    )}
                    onClick={() => setActiveChannel(channel.id)}
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{channel.name}</span>
                    {channel.unread > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 min-w-5 text-xs">
                        {channel.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Direct Messages Section */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
                Direct Messages
              </div>
              <div className="space-y-1">
                {USERS.slice(0, 6).map((user) => (
                  <button
                    key={user.id}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/50"
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px]">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 inline-block h-3 w-3 rounded-full border-2 border-background",
                          user.online ? "bg-emerald-500" : "bg-muted"
                        )}
                      />
                    </div>
                    <span className="truncate">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b bg-background/60 backdrop-blur p-3">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-semibold">{currentChannel.name}</div>
              <Badge variant="secondary" className="text-[10px]">
                {USERS.filter(u => u.online).length} online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Members
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="relative flex-1">
            <ScrollArea ref={viewportRef} className="flex-1 h-full">
              <div className="mx-auto w-full max-w-4xl px-4 pb-4">
                <div className="space-y-4 pt-4">
                  {filteredMessages.map((message) => {
                    const user = USERS.find(u => u.id === message.userId)
                    const isMyMessage = message.userId === currentUserId
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3",
                          isMyMessage ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(user?.name ?? "User")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg border p-3 text-sm",
                            isMyMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50"
                          )}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {user?.name ?? "User"}
                            </span>
                            <span className="text-[10px] opacity-60">
                              {formatTime(message.ts)}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Scroll to bottom button */}
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <Button
                type="button"
                className={cn(
                  "pointer-events-auto h-7 rounded-full border bg-background px-2 text-xs font-medium transition-opacity",
                  atBottom ? "opacity-0" : "opacity-100"
                )}
                onClick={scrollToBottom}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Message Composer */}
          <div className="border-t p-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${currentChannel.name}...`}
                    className="min-h-[44px] resize-none pr-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Team Members */}
        <div className="w-64 shrink-0 border-l bg-muted/10 hidden lg:flex flex-col">
          <div className="p-3 border-b">
            <div className="text-sm font-semibold">Team Members</div>
            <div className="text-xs text-muted-foreground">
              {USERS.filter(u => u.online).length} of {USERS.length} online
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {USERS.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  <div className="relative">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 inline-block h-3 w-3 rounded-full border-2 border-background",
                        user.online ? "bg-emerald-500" : "bg-muted"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
