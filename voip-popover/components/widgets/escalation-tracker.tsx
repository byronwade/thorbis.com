"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, ArrowUp, MessageSquare, CheckCircle } from "lucide-react"

interface EscalationItem {
  id: string
  title: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in-progress" | "resolved"
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  description: string
  updates: Array<{
    timestamp: Date
    author: string
    message: string
  }>
}

export default function EscalationTracker() {
  const [escalations, setEscalations] = useState<EscalationItem[]>([])
  const [newEscalation, setNewEscalation] = useState({
    title: "",
    priority: "medium" as const,
    assignedTo: "",
    description: "",
  })
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null)
  const [updateMessage, setUpdateMessage] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("escalation-tracker")
    if (saved) {
      const parsed = JSON.parse(saved)
      setEscalations(
        parsed.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
          updates: e.updates.map((u: any) => ({
            ...u,
            timestamp: new Date(u.timestamp),
          })),
        })),
      )
    }
  }, [])

  const saveEscalations = (newEscalations: EscalationItem[]) => {
    localStorage.setItem("escalation-tracker", JSON.stringify(newEscalations))
    setEscalations(newEscalations)
  }

  const createEscalation = () => {
    if (!newEscalation.title.trim()) return

    const escalation: EscalationItem = {
      id: Date.now().toString(),
      ...newEscalation,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      updates: [],
    }

    saveEscalations([...escalations, escalation])
    setNewEscalation({ title: "", priority: "medium", assignedTo: "", description: "" })
  }

  const addUpdate = (escalationId: string) => {
    if (!updateMessage.trim()) return

    const updated = escalations.map((e) =>
      e.id === escalationId
        ? {
            ...e,
            updatedAt: new Date(),
            updates: [
              ...e.updates,
              {
                timestamp: new Date(),
                author: "Current User",
                message: updateMessage,
              },
            ],
          }
        : e,
    )

    saveEscalations(updated)
    setUpdateMessage("")
  }

  const updateStatus = (escalationId: string, status: EscalationItem["status"]) => {
    const updated = escalations.map((e) => (e.id === escalationId ? { ...e, status, updatedAt: new Date() } : e))
    saveEscalations(updated)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-neutral-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-red-400"
      case "in-progress":
        return "text-yellow-400"
      case "resolved":
        return "text-green-400"
      default:
        return "text-neutral-400"
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100">
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-neutral-100">Escalation Tracker</span>
        </div>
      </div>

      <div className="p-2 space-y-2">
        {/* Create New Escalation */}
        <div className="space-y-2 p-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="flex gap-2">
            <Input
              placeholder="Escalation title..."
              value={newEscalation.title}
              onChange={(e) => setNewEscalation((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
            <Select
              value={newEscalation.priority}
              onValueChange={(value: any) => setNewEscalation((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-32 bg-neutral-700 border-neutral-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Assign to..."
              value={newEscalation.assignedTo}
              onChange={(e) => setNewEscalation((prev) => ({ ...prev, assignedTo: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
            <Button onClick={createEscalation} className="bg-blue-600 hover:bg-blue-700">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="Description..."
            value={newEscalation.description}
            onChange={(e) => setNewEscalation((prev) => ({ ...prev, description: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100 resize-none"
            rows={2}
          />
        </div>

        {/* Escalation List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {escalations.map((escalation) => (
            <div key={escalation.id} className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(escalation.priority)}`} />
                  <span className="font-medium text-sm">{escalation.title}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(escalation.id, "in-progress")}
                    className="h-6 px-2 text-xs"
                  >
                    <Clock className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(escalation.id, "resolved")}
                    className="h-6 px-2 text-xs"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-neutral-400 mb-1">
                <span>
                  {escalation.assignedTo || "Unassigned"} • {escalation.createdAt.toLocaleDateString()}
                </span>
              </div>

              {escalation.description && <p className="text-xs text-neutral-300 mb-2">{escalation.description}</p>}

              {escalation.updates.length > 0 && (
                <div className="space-y-1 mb-2">
                  {escalation.updates.slice(-2).map((update, idx) => (
                    <div key={idx} className="text-xs p-2 bg-neutral-700 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-3 w-3 text-blue-400" />
                        <span className="text-neutral-400">{update.author}</span>
                        <span className="text-neutral-500">{update.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-neutral-200">{update.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add update..."
                  value={selectedEscalation === escalation.id ? updateMessage : ""}
                  onChange={(e) => {
                    setSelectedEscalation(escalation.id)
                    setUpdateMessage(e.target.value)
                  }}
                  className="bg-neutral-700 border-neutral-600 text-neutral-100 text-xs h-7"
                />
                <Button
                  size="sm"
                  onClick={() => addUpdate(escalation.id)}
                  className="h-7 px-2 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {escalations.length === 0 && (
          <div className="text-center py-6 text-neutral-400">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No escalations tracked</p>
          </div>
        )}
      </div>
    </div>
  )
}
