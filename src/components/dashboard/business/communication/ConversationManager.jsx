"use client"

import * as React from "react"
import { useState, useRef, useMemo } from "react"
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
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
  Smartphone,
  MessageCircle,
  ReplyIcon as Comment,
  ChevronDown,
  Plus,
  Settings,
  Filter,
  SortAsc,
  Star,
  StarOff,
  User,
  Calendar,
  Tag,
  Hash,
  MoreVertical,
  Send
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data
const USERS = [
  { id: "u1", name: "Alex Rivera", role: "Support", online: true, color: "bg-emerald-500" },
  { id: "u2", name: "Bri Chen", role: "Ops", online: true, color: "bg-sky-500" },
  { id: "u3", name: "Casey Green", role: "Success", online: true, color: "bg-orange-500" },
  { id: "u4", name: "Dee Patel", role: "Billing", online: true, color: "bg-fuchsia-500" },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500" },
]

const CONVERSATIONS = [
  {
    id: "1",
    subject: "HVAC Maintenance Request",
    customerId: "c1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@acme.com",
    status: "active",
    priority: "high",
    assignedTo: "u1",
    assignedToName: "Alex Rivera",
    channel: "email",
    lastMessage: "Hi there, I need to schedule maintenance for our HVAC system. Could you please let me know your available time slots for this week?",
    lastMessageTime: "2 hours ago",
    unreadCount: 1,
    labels: ["Support", "HVAC"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    channels: ["email"],
    participants: [
      { id: "c1", name: "Sarah Johnson", role: "customer", email: "sarah@acme.com" },
      { id: "u1", name: "Alex Rivera", role: "agent" }
    ]
  },
  {
    id: "2",
    subject: "Billing Inquiry - Invoice #12345",
    customerId: "c2",
    customerName: "Mike Chen",
    customerEmail: "mike@techcorp.com",
    status: "active",
    priority: "medium",
    assignedTo: "u4",
    assignedToName: "Dee Patel",
    channel: "email",
    lastMessage: "I have a question about the recent invoice. There seems to be a discrepancy in the charges. Can you please review and get back to me?",
    lastMessageTime: "4 hours ago",
    unreadCount: 0,
    labels: ["Billing"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    channels: ["email"],
    participants: [
      { id: "c2", name: "Mike Chen", role: "customer", email: "mike@techcorp.com" },
      { id: "u4", name: "Dee Patel", role: "agent" }
    ]
  },
  {
    id: "3",
    subject: "New Service Quote Request",
    customerId: "c3",
    customerName: "Lisa Rodriguez",
    customerEmail: "lisa@startup.io",
    status: "pending",
    priority: "high",
    assignedTo: "u2",
    assignedToName: "Bri Chen",
    channel: "webchat",
    lastMessage: "We're looking to upgrade our office systems and would like a quote for your services. What packages do you offer?",
    lastMessageTime: "1 day ago",
    unreadCount: 2,
    labels: ["Lead", "Marketing"],
    createdAt: "2024-01-14T15:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    channels: ["webchat"],
    participants: [
      { id: "c3", name: "Lisa Rodriguez", role: "customer", email: "lisa@startup.io" },
      { id: "u2", name: "Bri Chen", role: "agent" }
    ]
  },
  {
    id: "4",
    subject: "Emergency Plumbing Issue",
    customerId: "c4",
    customerName: "David Kim",
    customerEmail: "david@enterprise.com",
    status: "urgent",
    priority: "critical",
    assignedTo: "u1",
    assignedToName: "Alex Rivera",
    channel: "phone",
    lastMessage: "We have a major plumbing emergency in our building. Need immediate assistance. Please call as soon as possible.",
    lastMessageTime: "3 hours ago",
    unreadCount: 0,
    labels: ["Support", "Plumbing", "Priority"],
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T13:00:00Z",
    channels: ["phone", "email"],
    participants: [
      { id: "c4", name: "David Kim", role: "customer", email: "david@enterprise.com" },
      { id: "u1", name: "Alex Rivera", role: "agent" }
    ]
  },
  {
    id: "5",
    subject: "Follow-up on Previous Service",
    customerId: "c5",
    customerName: "Emma Wilson",
    customerEmail: "emma@retail.com",
    status: "resolved",
    priority: "low",
    assignedTo: "u3",
    assignedToName: "Casey Green",
    channel: "email",
    lastMessage: "Just wanted to follow up on the service you provided last week. Everything is working great, thank you!",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
    labels: ["Follow-up"],
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-15T16:00:00Z",
    channels: ["email"],
    participants: [
      { id: "c5", name: "Emma Wilson", role: "customer", email: "emma@retail.com" },
      { id: "u3", name: "Casey Green", role: "agent" }
    ]
  }
]

const MESSAGES = [
  {
    id: "m1",
    conversationId: "1",
    userId: "c1",
    userName: "Sarah Johnson",
    text: "Hi there, I need to schedule maintenance for our HVAC system. Could you please let me know your available time slots for this week?",
    timestamp: "2024-01-15T14:30:00Z",
    status: "read",
    channel: "email"
  },
  {
    id: "m2",
    conversationId: "1",
    userId: "u1",
    userName: "Alex Rivera",
    text: "Hi Sarah, thanks for reaching out. I can help you schedule that maintenance. What's the best time for you this week?",
    timestamp: "2024-01-15T14:45:00Z",
    status: "delivered",
    channel: "email"
  }
]

export default function ConversationManager() {
  const [selectedId, setSelectedId] = useState("1")
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState("all") // all, assigned, unassigned
  const [statusFilter, setStatusFilter] = useState("all") // all, active, pending, resolved, urgent
  const [priorityFilter, setPriorityFilter] = useState("all") // all, low, medium, high, critical
  const [channelFilter, setChannelFilter] = useState("all") // all, email, webchat, phone, sms
  const [density, setDensity] = useState("compact")
  const [channel, setChannel] = useState("email")
  const [newMessage, setNewMessage] = useState("")

  const searchRef = useRef(null)

  // Filter conversations based on current filters
  const filtered = useMemo(() => {
    let result = CONVERSATIONS

    // Filter by scope
    if (scope === "assigned") {
      result = result.filter(conv => conv.assignedTo)
    } else if (scope === "unassigned") {
      result = result.filter(conv => !conv.assignedTo)
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(conv => conv.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      result = result.filter(conv => conv.priority === priorityFilter)
    }

    // Filter by channel
    if (channelFilter !== "all") {
      result = result.filter(conv => conv.channels.includes(channelFilter))
    }

    // Filter by search query
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(conv => 
        conv.subject.toLowerCase().includes(q) ||
        conv.customerName.toLowerCase().includes(q) ||
        conv.customerEmail.toLowerCase().includes(q) ||
        conv.lastMessage.toLowerCase().includes(q)
      )
    }

    return result
  }, [CONVERSATIONS, scope, statusFilter, priorityFilter, channelFilter, query])

  const selected = selectedId ? CONVERSATIONS.find(c => c.id === selectedId) : null
  const selectedMessages = MESSAGES.filter(m => m.conversationId === selectedId)

  function getInitials(name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  function ChannelBadge({ channel, className }) {
    const { label, Icon, color } = mapChannel(channel)
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-white border border-gray-200 shadow-sm",
        "dark:bg-gray-800 dark:border-gray-700",
        color,
        className
      )}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
    )
  }

  function mapChannel(channel) {
    switch (channel) {
      case "email":
        return { label: "Email", Icon: Mail, color: "text-gray-700 dark:text-gray-300" }
      case "sms":
        return { label: "SMS", Icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400" }
      case "webchat":
        return { label: "Chat", Icon: MessageSquare, color: "text-blue-600 dark:text-blue-400" }
      case "whatsapp":
        return { label: "WhatsApp", Icon: MessageCircle, color: "text-green-600 dark:text-green-400" }
      case "teams":
        return { label: "Teams", Icon: Users, color: "text-purple-600 dark:text-purple-400" }
      case "internal":
        return { label: "Internal", Icon: Comment, color: "text-amber-600 dark:text-amber-400" }
      case "phone":
        return { label: "Phone", Icon: Phone, color: "text-indigo-600 dark:text-indigo-400" }
      default:
        return { label: "Email", Icon: Mail, color: "text-gray-700 dark:text-gray-300" }
    }
  }

  function LabelChips({ labels, max = 2 }) {
    const shown = labels.slice(0, max)
    const remaining = labels.length - shown.length
    return (
      <div className="flex flex-wrap items-center gap-1">
        {shown.map((l) => (
          <div key={l} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {l}
          </div>
        ))}
        {remaining > 0 && (
          <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            +{remaining}
          </div>
        )}
      </div>
    )
  }

  function StatusPill({ status }) {
    const statusConfig = {
      active: { label: "Active", color: "text-green-600 dark:text-green-400" },
      pending: { label: "Pending", color: "text-yellow-600 dark:text-yellow-400" },
      resolved: { label: "Resolved", color: "text-blue-600 dark:text-blue-400" },
      urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400" },
      failed: { label: "Failed", color: "text-red-600 dark:text-red-400" }
    }
    
    const config = statusConfig[status] || statusConfig.active
    return (
      <div className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        "bg-white border border-gray-200 shadow-sm",
        "dark:bg-gray-800 dark:border-gray-700",
        config.color
      )}>
        {config.label}
      </div>
    )
  }

  function PriorityBadge({ priority }) {
    const priorityConfig = {
      low: { label: "Low", color: "text-gray-600 dark:text-gray-400" },
      medium: { label: "Medium", color: "text-blue-600 dark:text-blue-400" },
      high: { label: "High", color: "text-orange-600 dark:text-orange-400" },
      critical: { label: "Critical", color: "text-red-600 dark:text-red-400" }
    }
    
    const config = priorityConfig[priority] || priorityConfig.medium
    return (
      <div className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        "bg-white border border-gray-200 shadow-sm",
        "dark:bg-gray-800 dark:border-gray-700",
        config.color
      )}>
        {config.label}
      </div>
    )
  }

  function ChannelPicker({ value, onChange }) {
    const [open, setOpen] = useState(false)
    return (
      <div className="relative">
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <ChannelBadge channel={value} />
          <ChevronDown className="ml-1 h-4 w-4 opacity-60" />
        </Button>
        {open && (
          <div className="absolute z-10 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
            {["email", "sms", "webchat", "whatsapp", "teams", "internal", "phone"].map((ch) => (
              <button
                key={ch}
                onClick={() => {
                  onChange(ch)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm hover:bg-muted/60",
                  ch === value && "bg-muted/50"
                )}
              >
                <ChannelBadge channel={ch} />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  function onSent(message) {
    // Handle new message sent
    console.log("Message sent:", message)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r bg-background flex flex-col min-h-0">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Conversations</span>
              <span className="truncate text-xs text-muted-foreground">Customer Support</span>
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
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 p-4 border-b space-y-3">
          <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
              className="h-9 pl-8"
                placeholder="Search conversations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 px-2">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <SortAsc className="h-3 w-3 mr-1" />
              Sort
            </Button>
          </div>
          </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 min-h-0">
          {filtered.map((conv) => {
            const isSelected = selected?.id === conv.id
            const isUnread = conv.unreadCount > 0
                
                return (
              <div
                key={conv.id}
                      className={cn(
                  "relative block w-full rounded-lg border text-left text-sm transition-all",
                  isSelected 
                    ? "border-primary/20 bg-primary/5 shadow-sm" 
                    : "border-border/50 bg-card hover:border-border hover:bg-muted/30",
                  isUnread && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                )}
              >
                <button
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full text-left p-3 rounded-lg transition-colors"
                  aria-label={isUnread ? "Unread conversation" : undefined}
                >
                  {/* Header with subject and time */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "truncate text-sm leading-tight",
                      isUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
                    )}>
                      {conv.subject}
                        </div>
                    <span className={cn(
                      "ml-2 text-xs shrink-0",
                      isUnread ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )}>
                      {conv.lastMessageTime}
                        </span>
                      </div>

                  {/* Customer info and status */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium text-foreground">
                        {conv.customerName}
                          </span>
                      <span className="text-muted-foreground">• Customer</span>
                        </div>
                        <div className="flex gap-1">
                      <StatusPill status={conv.status} />
                      <PriorityBadge priority={conv.priority} />
                    </div>
                  </div>

                  {/* Channels and labels */}
                  <div className="mb-2">
                    <div className="flex gap-1 mb-1">
                      {conv.channels.map((ch) => (
                            <ChannelBadge key={ch} channel={ch} />
                          ))}
                        </div>
                    <LabelChips labels={conv.labels} />
                      </div>

                  {/* Message preview */}
                    <div className={cn(
                    "line-clamp-1 text-xs leading-relaxed",
                    isUnread ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage || "No message content"}
                  </div>

                  {/* Unread indicator */}
                  {isUnread && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {conv.unreadCount} unread
                      </span>
                    </div>
                  )}
                </button>
                  </div>
                )
              })}
          
              {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          {selected ? (
            <>
            {/* Conversation Header */}
            <div className="flex-shrink-0 flex w-full items-center gap-2 border-b bg-background p-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(selected.customerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{selected.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {selected.customerName} • {selected.customerEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusPill status={selected.status} />
                <PriorityBadge priority={selected.priority} />
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Timeline */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {selectedMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                            {getInitials(message.userName)}
                              </AvatarFallback>
                            </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{message.userName}</span>
                              <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                              <ChannelBadge channel={message.channel} />
                              <StatusPill status={message.status} />
                                </div>
                            <div className="text-sm">{message.text}</div>
                              </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
                </div>

              {/* Message Composer */}
              <div className="flex-shrink-0 p-4 border-t">
                <div className="flex items-end gap-2 rounded-lg border bg-background p-3">
                  <div className="flex min-w-0 flex-1 items-end gap-2">
                    <ChannelPicker value={channel} onChange={setChannel} />
                    <div className="min-w-0 flex-1">
                      <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                        className="min-h-[20px] max-h-[120px] w-full resize-none rounded-md border-0 bg-transparent px-0 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                            onSent({ text: newMessage, channel })
                            setNewMessage("")
                        }
                      }}
                    />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => {
                    onSent({ text: newMessage, channel })
                    setNewMessage("")
                  }} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                </div>
              </div>
            </>
          ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a conversation to view details</p>
            </div>
            </div>
          )}
      </div>
    </div>
  )
}
