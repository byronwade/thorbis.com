"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Users } from "lucide-react"

interface ChatMessage {
  id: string
  sender: string
  avatar: string
  message: string
  timestamp: string
  type: "message" | "system" | "urgent"
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  status: "online" | "busy" | "away" | "offline"
  role: string
}

export default function TeamChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Sarah M.",
      avatar: "/diverse-woman-portrait.png",
      message: "Customer on line 3 needs billing escalation",
      timestamp: "10:32",
      type: "urgent",
    },
    {
      id: "2",
      sender: "Mike R.",
      avatar: "/thoughtful-man.png",
      message: "I can take that transfer",
      timestamp: "10:33",
      type: "message",
    },
    {
      id: "3",
      sender: "System",
      avatar: "",
      message: "Queue time: 2:45 avg",
      timestamp: "10:35",
      type: "system",
    },
  ])

  const [teamMembers] = useState<TeamMember[]>([
    { id: "1", name: "Sarah M.", avatar: "/diverse-woman-portrait.png", status: "online", role: "Senior CSR" },
    { id: "2", name: "Mike R.", avatar: "/thoughtful-man.png", status: "busy", role: "Billing Specialist" },
    { id: "3", name: "Lisa K.", avatar: "/diverse-woman-portrait.png", status: "online", role: "Technical Support" },
    { id: "4", name: "Tom B.", avatar: "/diverse-group-friends.png", status: "away", role: "Supervisor" },
  ])

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "You",
        avatar: "/abstract-geometric-shapes.png",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: "message",
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-red-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-neutral-500"
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 flex flex-col h-80">
      <div className="p-2 border-b border-neutral-700">
        <div className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          Team Chat
          <Badge variant="outline" className="ml-auto text-xs">
            <Users className="h-3 w-3 mr-1" />
            {teamMembers.filter((m) => m.status === "online").length} online
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-2 space-y-2 min-h-0">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1 bg-neutral-800 rounded-full px-2 py-1 text-xs whitespace-nowrap"
            >
              <div className="relative">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-neutral-800 ${getStatusColor(member.status)}`}
                />
              </div>
              <span className="text-neutral-300">{member.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.type === "system" ? "justify-center" : ""}`}>
              {message.type !== "system" && (
                <Avatar className="h-6 w-6 mt-0.5">
                  <AvatarImage src={message.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {message.sender
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex-1 ${message.type === "system" ? "text-center" : ""}`}>
                {message.type === "system" ? (
                  <div className="text-xs text-neutral-500 bg-neutral-800 rounded px-2 py-1 inline-block">
                    {message.message}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{message.sender}</span>
                      <span className="text-xs text-neutral-500">{message.timestamp}</span>
                      {message.type === "urgent" && (
                        <Badge variant="destructive" className="text-xs h-4">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-neutral-200 bg-neutral-800 rounded px-2 py-1">{message.message}</div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-2">
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="text-xs h-6 px-2 bg-transparent">
              Need Help
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-6 px-2 bg-transparent">
              Transfer Ready
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-6 px-2 bg-transparent">
              Break
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-8 text-sm bg-neutral-800 border-neutral-600"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button size="sm" onClick={sendMessage} className="h-8 w-8 p-0">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
