"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Clock,
  TrendingUp,
  Star,
  Bookmark,
  Filter,
  MoreHorizontal,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Lightbulb,
  Target,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartSuggestionsProps {
  transcript: string[]
  onSuggestionClick: (suggestion: string) => void
}

export function SmartSuggestions({ transcript, onSuggestionClick }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string
      text: string
      type: "response" | "action" | "escalation"
      confidence: number
    }>
  >([])

  useEffect(() => {
    const lastLines = transcript.slice(-3).join(" ").toLowerCase()
    const newSuggestions = []

    if (lastLines.includes("refund") || lastLines.includes("money back")) {
      newSuggestions.push({
        id: "1",
        text: "I understand your concern about the refund. Let me check your account status.",
        type: "response" as const,
        confidence: 0.92,
      })
    }

    if (lastLines.includes("technical") || lastLines.includes("not working")) {
      newSuggestions.push({
        id: "2",
        text: "Transfer to Technical Support",
        type: "action" as const,
        confidence: 0.88,
      })
    }

    if (lastLines.includes("manager") || lastLines.includes("supervisor")) {
      newSuggestions.push({
        id: "3",
        text: "Escalate to Supervisor",
        type: "escalation" as const,
        confidence: 0.95,
      })
    }

    setSuggestions(newSuggestions)
  }, [transcript])

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <Lightbulb className="h-3 w-3" />
        <span>Smart Suggestions</span>
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "w-full text-left p-2 rounded-lg text-xs transition-all duration-200 hover:scale-[1.02]",
              suggestion.type === "response" && "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20",
              suggestion.type === "action" && "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20",
              suggestion.type === "escalation" && "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-200">{suggestion.text}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(suggestion.confidence * 100)}%
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface QuickActionsBarProps {
  onAction: (action: string) => void
}

export function QuickActionsBar({ onAction }: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickActions = [
    { id: "hold", label: "Hold", icon: Clock, color: "blue" },
    { id: "mute", label: "Mute", icon: EyeOff, color: "gray" },
    { id: "transfer", label: "Transfer", icon: RefreshCw, color: "green" },
    { id: "escalate", label: "Escalate", icon: TrendingUp, color: "amber" },
    { id: "bookmark", label: "Bookmark", icon: Bookmark, color: "purple" },
    { id: "focus", label: "Focus Mode", icon: Target, color: "indigo" },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/50 transition-all duration-300",
          isExpanded ? "flex-col" : "flex-row",
        )}
      >
        {(isExpanded ? quickActions : quickActions.slice(0, 3)).map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                action.color === "blue" && "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400",
                action.color === "gray" && "bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-400",
                action.color === "green" && "bg-green-500/20 hover:bg-green-500/30 text-green-400",
                action.color === "amber" && "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400",
                action.color === "purple" && "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400",
                action.color === "indigo" && "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400",
              )}
              title={action.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 transition-all duration-200"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface PerformanceMetricsProps {
  callDuration: number
  avgResponseTime: number
  customerSatisfaction: number
}

export function PerformanceMetrics({ callDuration, avgResponseTime, customerSatisfaction }: PerformanceMetricsProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-40 bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/50 rounded-lg transition-all duration-300",
        isMinimized ? "w-12 h-12" : "w-64 p-4",
      )}
    >
      <div className="flex items-center justify-between">
        {!isMinimized && (
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
            <Activity className="h-4 w-4 text-blue-400" />
            Performance
          </div>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded hover:bg-neutral-700/50 text-neutral-400"
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Call Duration</span>
            <span className="text-sm font-mono text-neutral-200">{formatTime(callDuration)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Avg Response</span>
            <span className="text-sm font-mono text-neutral-200">{avgResponseTime}s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Satisfaction</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-sm font-mono text-neutral-200">{customerSatisfaction}/5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SmartSearchProps {
  onSearch: (query: string, filters: string[]) => void
}

export function SmartSearch({ onSearch }: SmartSearchProps) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filters = [
    { id: "recent", label: "Recent", color: "blue" },
    { id: "important", label: "Important", color: "red" },
    { id: "pending", label: "Pending", color: "amber" },
    { id: "resolved", label: "Resolved", color: "green" },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]))
  }

  useEffect(() => {
    onSearch(query, activeFilters)
  }, [query, activeFilters, onSearch])

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer data, notes, history..."
            className="pl-10 bg-neutral-800/50 border-neutral-600 text-neutral-200 placeholder:text-neutral-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            showFilters ? "bg-blue-500/20 text-blue-400" : "bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50",
          )}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-lg z-50">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-all duration-200",
                  activeFilters.includes(filter.id)
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
