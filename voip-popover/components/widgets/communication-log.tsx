"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Phone, Mail, Calendar, User, Clock, Plus, Search } from "lucide-react"

interface CommunicationEntry {
  id: string
  type: "call" | "email" | "sms" | "chat" | "meeting" | "note"
  direction: "inbound" | "outbound" | "internal"
  timestamp: Date
  duration?: number
  subject: string
  content: string
  customerName: string
  customerContact: string
  agent: string
  status: "completed" | "pending" | "failed"
  priority: "low" | "normal" | "high"
  tags: string[]
}

export default function CommunicationLog() {
  const [entries, setEntries] = useState<CommunicationEntry[]>([])
  const [newEntry, setNewEntry] = useState({
    type: "call" as const,
    direction: "inbound" as const,
    subject: "",
    content: "",
    customerName: "",
    customerContact: "",
    duration: 0,
    priority: "normal" as const,
    tags: [] as string[],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | CommunicationEntry["type"]>("all")
  const [filterDirection, setFilterDirection] = useState<"all" | CommunicationEntry["direction"]>("all")

  useEffect(() => {
    const saved = localStorage.getItem("communication-log")
    if (saved) {
      const parsed = JSON.parse(saved)
      setEntries(
        parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
      )
    }
  }, [])

  const saveEntries = (newEntries: CommunicationEntry[]) => {
    localStorage.setItem("communication-log", JSON.stringify(newEntries))
    setEntries(newEntries)
  }

  const addEntry = () => {
    if (!newEntry.subject.trim() || !newEntry.customerName.trim()) return

    const entry: CommunicationEntry = {
      id: Date.now().toString(),
      ...newEntry,
      timestamp: new Date(),
      agent: "Current User",
      status: "completed",
    }

    saveEntries([entry, ...entries])
    setNewEntry({
      type: "call",
      direction: "inbound",
      subject: "",
      content: "",
      customerName: "",
      customerContact: "",
      duration: 0,
      priority: "normal",
      tags: [],
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "note":
        return <User className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "call":
        return "text-green-400"
      case "email":
        return "text-blue-400"
      case "sms":
        return "text-purple-400"
      case "chat":
        return "text-yellow-400"
      case "meeting":
        return "text-orange-400"
      case "note":
        return "text-neutral-400"
      default:
        return "text-neutral-400"
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "inbound":
        return "text-green-400"
      case "outbound":
        return "text-blue-400"
      case "internal":
        return "text-yellow-400"
      default:
        return "text-neutral-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "normal":
        return "bg-blue-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-neutral-500"
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchTerm ||
      entry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || entry.type === filterType
    const matchesDirection = filterDirection === "all" || entry.direction === filterDirection

    return matchesSearch && matchesType && matchesDirection
  })

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-100">Communication Log</h3>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-neutral-400" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 bg-neutral-800 border-neutral-600 text-neutral-100 text-xs h-7"
          />
        </div>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-24 bg-neutral-800 border-neutral-600 text-xs h-7">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* New Entry Form */}
      <div className="space-y-2 p-2 bg-neutral-800 rounded-lg border border-neutral-700">
        <div className="flex gap-1">
          <Select
            value={newEntry.type}
            onValueChange={(value: any) => setNewEntry((prev) => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-20 bg-neutral-700 border-neutral-600 text-xs h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={newEntry.direction}
            onValueChange={(value: any) => setNewEntry((prev) => ({ ...prev, direction: value }))}
          >
            <SelectTrigger className="w-24 bg-neutral-700 border-neutral-600 text-xs h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Subject..."
            value={newEntry.subject}
            onChange={(e) => setNewEntry((prev) => ({ ...prev, subject: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100 text-xs h-7"
          />
        </div>

        <div className="flex gap-1">
          <Input
            placeholder="Customer name..."
            value={newEntry.customerName}
            onChange={(e) => setNewEntry((prev) => ({ ...prev, customerName: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100 text-xs h-7"
          />
          <Input
            placeholder="Contact info..."
            value={newEntry.customerContact}
            onChange={(e) => setNewEntry((prev) => ({ ...prev, customerContact: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100 text-xs h-7"
          />
          {newEntry.type === "call" && (
            <Input
              type="number"
              placeholder="Duration (min)"
              value={newEntry.duration || ""}
              onChange={(e) => setNewEntry((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 0 }))}
              className="w-24 bg-neutral-700 border-neutral-600 text-neutral-100 text-xs h-7"
            />
          )}
          <Button onClick={addEntry} className="bg-blue-600 hover:bg-blue-700 h-7 px-2">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Textarea
          placeholder="Communication details..."
          value={newEntry.content}
          onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
          className="bg-neutral-700 border-neutral-600 text-neutral-100 resize-none text-xs"
          rows={2}
        />
      </div>

      {/* Entries List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1">
                <div className={getTypeColor(entry.type)}>{getTypeIcon(entry.type)}</div>
                <span className="font-medium text-xs">{entry.subject}</span>
                <Badge variant="outline" className={`text-xs ${getDirectionColor(entry.direction)}`}>
                  {entry.direction}
                </Badge>
                {entry.priority !== "normal" && (
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(entry.priority)}`} />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Clock className="h-3 w-3" />
                {entry.timestamp.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {entry.customerName}
                </span>
                {entry.customerContact && <span>{entry.customerContact}</span>}
                {entry.duration && entry.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(entry.duration)}
                  </span>
                )}
              </div>

              {entry.content && <p className="text-neutral-300 mt-1">{entry.content}</p>}

              <div className="flex items-center justify-between mt-1">
                <span className="text-neutral-500">Agent: {entry.agent}</span>
                {entry.tags.length > 0 && (
                  <div className="flex gap-1">
                    {entry.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-4 text-neutral-400">
          <MessageSquare className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No communications found</p>
        </div>
      )}
    </div>
  )
}
