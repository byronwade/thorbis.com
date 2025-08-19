"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  MessageSquare,
  Mail,
  MessageCircle,
  Users,
  RefreshCw,
  Send,
  Paperclip,
  Smartphone,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data for conversations
const SAMPLE_CONVERSATIONS = [
  {
    id: "conv-1",
    subject: "HVAC Service Inquiry",
    customerId: "cust-1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    participants: [
      { id: "cust-1", name: "John Smith", role: "customer", email: "john@example.com" },
      { id: "u1", name: "Alex Rivera", role: "agent", email: "alex@company.com" },
    ],
    labels: ["Support", "HVAC"],
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 60 * 1000,
    lastMessagePreview: "Thank you for the quick response. When can we schedule the service?",
    unreadFor: ["u1"],
    channels: ["email", "sms"],
  },
  {
    id: "conv-2", 
    subject: "Plumbing Emergency",
    customerId: "cust-2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@business.com",
    participants: [
      { id: "cust-2", name: "Sarah Johnson", role: "customer", email: "sarah@business.com" },
      { id: "u2", name: "Bri Chen", role: "agent", email: "bri@company.com" },
    ],
    labels: ["Emergency", "Plumbing"],
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 60 * 1000,
    lastMessagePreview: "The technician is on the way. ETA 15 minutes.",
    unreadFor: [],
    channels: ["email", "whatsapp"],
  },
  {
    id: "conv-3",
    subject: "Quote Request - Commercial Installation",
    customerId: "cust-3", 
    customerName: "Mike Wilson",
    customerEmail: "mike@company.org",
    participants: [
      { id: "cust-3", name: "Mike Wilson", role: "customer", email: "mike@company.org" },
      { id: "u3", name: "Casey Green", role: "agent", email: "casey@company.com" },
    ],
    labels: ["Quote", "Commercial"],
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    lastMessagePreview: "I've reviewed the specifications and will send the quote by tomorrow.",
    unreadFor: ["u3"],
    channels: ["email"],
  },
]

const SAMPLE_MESSAGES = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      channel: "email",
      direction: "inbound",
      authorId: "cust-1",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      text: "Hi, I need to schedule maintenance for my HVAC system. It's been making strange noises lately.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-1" },
    },
    {
      id: "msg-2", 
      conversationId: "conv-1",
      channel: "email",
      direction: "outbound",
      authorId: "u1",
      createdAt: Date.now() - 90 * 60 * 1000,
      text: "Thank you for reaching out! I can schedule a technician for this week. What days work best for you?",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-2" },
    },
    {
      id: "msg-3",
      conversationId: "conv-1", 
      channel: "sms",
      direction: "inbound",
      authorId: "cust-1",
      createdAt: Date.now() - 30 * 60 * 1000,
      text: "Thank you for the quick response. When can we schedule the service?",
      deliveryStatus: "delivered",
      external: { channel: "sms", provider: "twilio", sid: "SMS123" },
    },
  ],
}

function getInitials(name) {
  const parts = name.split(" ")
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function ConversationManager() {
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState("")
  const [density, setDensity] = useState("compact")
  const [currentUserId, setCurrentUserId] = useState("u1")
  const [newMessage, setNewMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("email")

  const searchRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (conversations.length > 0 && !selected) {
      loadConversation(conversations[0].id)
    }
  }, [conversations, selected])

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function loadConversation(id) {
    const conv = conversations.find(c => c.id === id)
    setSelected(conv)
    setMessages(SAMPLE_MESSAGES[id] || [])
  }

  function toggleUnread(convId) {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const list = new Set(c.unreadFor ?? [])
        if (list.has(currentUserId)) list.delete(currentUserId)
        else list.add(currentUserId)
        return { ...c, unreadFor: Array.from(list) }
      }),
    )
  }

  function sendMessage() {
    if (!newMessage.trim() || !selected) return
    
    const message = {
      id: `msg-${Date.now()}`,
      conversationId: selected.id,
      channel: selectedChannel,
      direction: "outbound",
      authorId: currentUserId,
      createdAt: Date.now(),
      text: newMessage.trim(),
      deliveryStatus: "sent",
      external: { channel: selectedChannel },
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
    
    // Update conversation preview
    setConversations(prev =>
      prev.map(c =>
        c.id === selected.id
          ? { ...c, updatedAt: message.createdAt, lastMessagePreview: message.text }
          : c
      )
    )
  }

  const filtered = conversations.filter((c) => {
    const q = query.toLowerCase()
    return !q || c.subject.toLowerCase().includes(q) || c.lastMessagePreview.toLowerCase().includes(q)
  })

  const rowPadding = density === "compact" ? "px-2 py-2" : "px-3 py-3"

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-primary" />
            Conversation Manager
          </h1>
          <p className="text-muted-foreground">
            Manage multi-channel customer conversations across email, SMS, chat, and more
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-80 shrink-0 border-r flex flex-col">
          {/* List Header */}
          <div className="flex items-center gap-2 border-b p-3">
            <div className="text-sm font-semibold">Conversations</div>
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                className="h-8 w-full pl-8 text-sm"
                placeholder="Search conversations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              variant={density === "compact" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setDensity((d) => (d === "compact" ? "comfortable" : "compact"))}
            >
              {density === "compact" ? "Compact" : "Comfortable"}
            </Button>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filtered.map((c) => {
                const isUnread = Array.isArray(c.unreadFor) && c.unreadFor.includes(currentUserId)
                const isSelected = selected?.id === c.id
                const customer = c.participants?.find(p => p.role === "customer")
                
                return (
                  <div key={c.id} className={cn(
                    "relative block w-full rounded-md text-left text-sm mb-1",
                    isSelected ? "bg-muted/50" : "",
                    isUnread ? "bg-muted/70" : "",
                  )}>
                    <button
                      onClick={() => loadConversation(c.id)}
                      className={cn(
                        "w-full text-left hover:bg-muted/40 rounded-md border border-transparent",
                        rowPadding,
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("truncate", isUnread ? "font-semibold" : "font-medium")}>
                          {c.subject}
                        </div>
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {formatTime(c.updatedAt)}
                        </span>
                      </div>

                      {customer && (
                        <div className="mt-0.5 text-xs">
                          <span className="cursor-default">
                            {customer.name}
                          </span>
                          <span className="text-muted-foreground"> • Customer</span>
                        </div>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex gap-1">
                          {c.channels.map((ch) => (
                            <ChannelBadge key={ch} channel={ch} />
                          ))}
                        </div>
                        {c.labels.length > 0 && <span>•</span>}
                        <div className="flex flex-wrap items-center gap-1">
                          {c.labels.slice(0, 2).map((l) => (
                            <Badge key={l} variant="secondary" className="text-[10px]">
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {c.lastMessagePreview || "—"}
                      </div>
                    </button>

                    {/* Mark as read/unread button */}
                    <div className={cn(
                      "absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity hover:opacity-100",
                      isSelected && "opacity-100",
                    )}>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleUnread(c.id)
                        }}
                      >
                        {isUnread ? "Mark read" : "Mark unread"}
                      </Button>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No conversations</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation View */}
        <div className="flex min-w-0 flex-1 flex-col">
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-2 border-b p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold">{selected.subject}</div>
                    <Badge variant="secondary" className="text-[10px]">{selected.labels.join(" • ")}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]">ID: {selected.id}</Badge>
                  <Badge variant="outline" className="text-[10px]">Updated: {formatTime(selected.updatedAt)}</Badge>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="mx-auto w-full max-w-3xl p-3">
                  <div className="space-y-3">
                    {messages.map((m, i) => {
                      const side = m.direction === "inbound" ? "left" : m.direction === "outbound" ? "right" : "center"
                      const participant = selected.participants.find(p => p.id === m.authorId)
                      const isSystem = m.direction === "internal"
                      
                      return (
                        <div key={m.id} className={cn(
                          "flex gap-2",
                          side === "right" ? "flex-row-reverse" : "flex-row",
                          side === "center" ? "justify-center" : ""
                        )}>
                          {!isSystem && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs">
                                {getInitials(participant?.name || "User")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <Card className={cn(
                            "max-w-[70%]",
                            side === "right" && "bg-primary text-primary-foreground",
                            isSystem && "bg-muted/50 max-w-none mx-8"
                          )}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-medium">
                                  {participant?.name || "System"}
                                </div>
                                <ChannelBadge channel={m.channel} />
                                <div className="text-[10px] opacity-60">
                                  {formatTime(m.createdAt)}
                                </div>
                                <StatusBadge status={m.deliveryStatus} />
                              </div>
                              {m.text && <div className="text-sm">{m.text}</div>}
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>

              {/* Compose Area */}
              <div className="border-t p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ChannelPicker value={selectedChannel} onChange={setSelectedChannel} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Channel Badge Component
function ChannelBadge({ channel, className }) {
  const { label, Icon, cls } = mapChannel(channel)
  return (
    <Badge variant="outline" className={cn("h-5 gap-1 px-1.5 text-[10px]", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}

function mapChannel(channel) {
  switch (channel) {
    case "email":
      return { label: "Email", Icon: Mail, cls: "border-slate-300" }
    case "sms":
      return { label: "SMS", Icon: Smartphone, cls: "border-emerald-300 text-emerald-700" }
    case "webchat":
      return { label: "Web Chat", Icon: MessageSquare, cls: "border-indigo-300 text-indigo-700" }
    case "whatsapp":
      return { label: "WhatsApp", Icon: MessageCircle, cls: "border-green-300 text-success" }
    case "teams":
      return { label: "Teams", Icon: Users, cls: "border-purple-300 text-purple-700" }
    case "internal":
      return { label: "Internal", Icon: MessageSquare, cls: "border-amber-300 text-amber-700" }
    default:
      return { label: "Unknown", Icon: MessageSquare, cls: "border-border" }
  }
}

// Channel Picker Component
function ChannelPicker({ value, onChange }) {
  const channels = [
    { value: "email", label: "Email", icon: Mail },
    { value: "sms", label: "SMS", icon: Smartphone },
    { value: "webchat", label: "Web Chat", icon: MessageSquare },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { value: "teams", label: "Teams", icon: Users },
    { value: "internal", label: "Internal", icon: MessageSquare },
  ]

  const selected = channels.find(ch => ch.value === value)

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Send via:</span>
      <div className="flex gap-1">
        {channels.map((ch) => (
          <Button
            key={ch.value}
            variant={value === ch.value ? "secondary" : "outline"}
            size="xs"
            className="h-6 px-2 gap-1"
            onClick={() => onChange(ch.value)}
          >
            <ch.icon className="h-3 w-3" />
            {ch.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusMap = {
    queued: { label: "Queued", cls: "bg-warning/10 text-warning" },
    sent: { label: "Sent", cls: "bg-primary/10 text-primary" },
    delivered: { label: "Delivered", cls: "bg-success/10 text-success" },
    read: { label: "Read", cls: "bg-purple-100 text-purple-800" },
    failed: { label: "Failed", cls: "bg-destructive/10 text-destructive" },
    none: { label: "", cls: "" },
  }

  const { label, cls } = statusMap[status] || statusMap.none
  
  if (!label) return null
  
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", cls)}>
      {label}
    </span>
  )
}
