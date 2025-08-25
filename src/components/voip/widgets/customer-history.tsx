"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Phone, Mail, MessageSquare, CheckCircle, Search } from "lucide-react"

interface HistoryItem {
  id: string
  date: string
  type: "call" | "email" | "chat" | "service"
  summary: string
  status: "completed" | "pending" | "escalated"
  agent: string
  duration?: string
}

export default function CustomerHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  const historyItems: HistoryItem[] = [
    {
      id: "1",
      date: "2024-01-15",
      type: "call",
      summary: "HVAC repair - replaced thermostat",
      status: "completed",
      agent: "Sarah M.",
      duration: "45 min",
    },
    {
      id: "2",
      date: "2024-01-10",
      type: "email",
      summary: "Billing inquiry - payment plan setup",
      status: "completed",
      agent: "Mike R.",
    },
    {
      id: "3",
      date: "2024-01-08",
      type: "service",
      summary: "Plumbing maintenance - annual inspection",
      status: "completed",
      agent: "Tech Team",
    },
    {
      id: "4",
      date: "2024-01-05",
      type: "chat",
      summary: "Service scheduling question",
      status: "pending",
      agent: "Lisa K.",
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "service":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "escalated":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
    }
  }

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg h-full">
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-neutral-100">Customer History</span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-neutral-800 border-neutral-600 text-neutral-100 text-xs h-8"
            />
          </div>
          <div className="flex gap-1">
            {["all", "call", "email", "chat", "service"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`h-8 px-2 text-xs capitalize ${
                  selectedFilter === filter ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2">
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-2 hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="text-xs text-neutral-300 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {item.duration && <span className="text-xs text-neutral-500">({item.duration})</span>}
                  </div>
                  <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(item.status)}`}>{item.status}</Badge>
                </div>

                <p className="text-xs text-neutral-200 mb-1">{item.summary}</p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Agent: {item.agent}</span>
                  <Button variant="ghost" size="sm" className="h-5 px-2 text-xs text-blue-400 hover:text-blue-300">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
