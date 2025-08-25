"use client"

import * as React from "react"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { ScrollArea } from "@components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet"
import { cn } from "@lib/utils"
import {
  Send,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Search,
  Clock,
  CheckCheck,
  AlertCircle,
  MessageSquare,
  Mail,
  PhoneCall,
} from "lucide-react"

type MessageStatus = "sent" | "delivered" | "read" | "failed"
type MessageType = "text" | "image" | "file" | "system"
type ConversationStatus = "active" | "resolved" | "pending" | "archived"

type Message = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "customer" | "agent" | "system"
  content: string
  type: MessageType
  timestamp: string
  status: MessageStatus
  attachments?: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]
}

type Conversation = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  subject: string
  status: ConversationStatus
  priority: "low" | "medium" | "high"
  assignedTo?: string
  assignedToName?: string
  channel: "chat" | "email" | "sms" | "whatsapp"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  tags: string[]
  messages: Message[]
}

// Sample data
const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    customerId: "cust1",
    customerName: "Pat Jones",
    customerEmail: "pat@example.com",
    subject: "Billing inquiry about invoice #1041",
    status: "active",
    priority: "medium",
    assignedTo: "u1",
    assignedToName: "Alex Rivera",
    channel: "chat",
    lastMessage: "Thanks for the clarification! That helps a lot.",
    lastMessageTime: "2025-01-14 15:42",
    unreadCount: 0,
    tags: ["billing", "invoice"],
    messages: [
      {
        id: "msg1",
        conversationId: "conv1",
        senderId: "cust1",
        senderName: "Pat Jones",
        senderRole: "customer",
        content: "Hi, I have a question about invoice #1041. The amount seems different from what I expected.",
        type: "text",
        timestamp: "2025-01-14 14:30",
        status: "read",
      },
      {
        id: "msg2",
        conversationId: "conv1",
        senderId: "u1",
        senderName: "Alex Rivera",
        senderRole: "agent",
        content:
          "Hi Pat! I'd be happy to help you with that. Let me pull up your invoice details. The difference might be due to the additional support hours we discussed last week.",
        type: "text",
        timestamp: "2025-01-14 14:35",
        status: "read",
      },
      {
        id: "msg3",
        conversationId: "conv1",
        senderId: "cust1",
        senderName: "Pat Jones",
        senderRole: "customer",
        content:
          "Ah yes, that makes sense now. I forgot about those extra hours. Thanks for the clarification! That helps a lot.",
        type: "text",
        timestamp: "2025-01-14 15:42",
        status: "delivered",
      },
    ],
  },
  {
    id: "conv2",
    customerId: "cust2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@techcorp.com",
    subject: "Product setup assistance needed",
    status: "pending",
    priority: "high",
    channel: "email",
    lastMessage: "I'm still having trouble with the configuration...",
    lastMessageTime: "2025-01-14 13:15",
    unreadCount: 2,
    tags: ["support", "setup", "urgent"],
    messages: [
      {
        id: "msg4",
        conversationId: "conv2",
        senderId: "cust2",
        senderName: "Sarah Johnson",
        senderRole: "customer",
        content: "I'm trying to set up the new system but I'm running into configuration issues. Can someone help?",
        type: "text",
        timestamp: "2025-01-14 12:30",
        status: "read",
      },
      {
        id: "msg5",
        conversationId: "conv2",
        senderId: "cust2",
        senderName: "Sarah Johnson",
        senderRole: "customer",
        content: "I'm still having trouble with the configuration. This is blocking our team from moving forward.",
        type: "text",
        timestamp: "2025-01-14 13:15",
        status: "delivered",
      },
    ],
  },
]

function getInitials(name: string) {
  const parts = name.split(" ")
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "chat":
      return <MessageSquare className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    case "sms":
    case "whatsapp":
      return <PhoneCall className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

function getStatusColor(status: ConversationStatus) {
  switch (status) {
    case "active":
      return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
    case "pending":
      return "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20"
    case "resolved":
      return "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
    case "archived":
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
    default:
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    case "medium":
      return "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20"
    case "low":
      return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
    default:
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

export function MessagingClient({
  open,
  onOpenChange,
  customerId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
}) {
  const [conversations, setConversations] = React.useState<Conversation[]>(SAMPLE_CONVERSATIONS)
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter conversations by customer if specified
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations

    if (customerId) {
      filtered = filtered.filter((conv) => conv.customerId === customerId)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (conv) =>
          conv.customerName.toLowerCase().includes(query) ||
          conv.subject.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query),
      )
    }

    return filtered.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
  }, [conversations, customerId, searchQuery])

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: "u1", // Current user
      senderName: "Alex Rivera",
      senderRole: "agent",
      content: newMessage.trim(),
      type: "text",
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    // Update conversation with new message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
          }
        }
        return conv
      }),
    )

    // Update selected conversation
    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, message],
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
          }
        : null,
    )

    setNewMessage("")
  }

  const markAsResolved = () => {
    if (!selectedConversation) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id ? { ...conv, status: "resolved" as ConversationStatus } : conv,
      ),
    )

    setSelectedConversation((prev) => (prev ? { ...prev, status: "resolved" as ConversationStatus } : null))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-6xl p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Messages</SheetTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer hover:bg-muted/50 mb-2 transition-colors",
                      selectedConversation?.id === conversation.id && "bg-muted",
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">{getInitials(conversation.customerName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{conversation.customerName}</span>
                          {getChannelIcon(conversation.channel)}
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-1">{conversation.subject}</div>
                        <div className="text-xs text-muted-foreground truncate mb-2">{conversation.lastMessage}</div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge className={cn("text-xs", getStatusColor(conversation.status))}>
                              {conversation.status}
                            </Badge>
                            <Badge className={cn("text-xs", getPriorityColor(conversation.priority))}>
                              {conversation.priority}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-background/60 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(selectedConversation.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedConversation.customerName}</div>
                        <div className="text-sm text-muted-foreground">{selectedConversation.customerEmail}</div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={cn("text-xs", getStatusColor(selectedConversation.status))}>
                          {selectedConversation.status}
                        </Badge>
                        <Badge className={cn("text-xs", getPriorityColor(selectedConversation.priority))}>
                          {selectedConversation.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={markAsResolved}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex gap-3", message.senderRole === "agent" ? "justify-end" : "justify-start")}
                      >
                        {message.senderRole !== "agent" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getInitials(message.senderName)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            message.senderRole === "agent" ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={cn(
                              "text-xs mt-1 flex items-center gap-1",
                              message.senderRole === "agent" ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {message.senderRole === "agent" && (
                              <>
                                <span>•</span>
                                {message.status === "sent" && <Clock className="h-3 w-3" />}
                                {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                                {message.status === "read" && <CheckCheck className="h-3 w-3 text-blue-400" />}
                                {message.status === "failed" && <AlertCircle className="h-3 w-3 text-red-400" />}
                              </>
                            )}
                          </div>
                        </div>
                        {message.senderRole === "agent" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getInitials(message.senderName)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium mb-2">Select a conversation</div>
                  <div className="text-sm">Choose a conversation from the list to start messaging</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
