"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  Brain,
  Target,
  Zap,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CallerInsight = {
  type: "sentiment" | "risk" | "opportunity" | "history" | "prediction"
  level: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  confidence: number
  actionable?: boolean
}

type CallerProfile = {
  id: string
  name: string
  company: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  lifetimeValue: number
  riskScore: number
  satisfactionScore: number
  callHistory: {
    totalCalls: number
    avgDuration: number
    lastCallDate: string
    commonIssues: string[]
    resolutionRate: number
  }
  currentContext: {
    openTickets: number
    recentPurchases: string[]
    contractStatus: "active" | "expiring" | "expired"
    paymentStatus: "current" | "overdue" | "collections"
  }
  insights: CallerInsight[]
  suggestedActions: string[]
  predictedIntent: string
  sentimentTrend: "positive" | "neutral" | "negative"
}

// Mock AI-generated caller intelligence
const generateCallerProfile = (callerId: string): CallerProfile => {
  return {
    id: callerId,
    name: "Jordan Pierce",
    company: "ACME Field Services",
    tier: "gold",
    lifetimeValue: 125000,
    riskScore: 25,
    satisfactionScore: 87,
    callHistory: {
      totalCalls: 23,
      avgDuration: 8.5,
      lastCallDate: "2024-01-08",
      commonIssues: ["SmartGate errors", "Billing questions", "Service scheduling"],
      resolutionRate: 91,
    },
    currentContext: {
      openTickets: 1,
      recentPurchases: ["SmartGate Pro Controller", "Extended Warranty"],
      contractStatus: "active",
      paymentStatus: "current",
    },
    insights: [
      {
        type: "sentiment",
        level: "medium",
        title: "Caller Sentiment: Frustrated",
        description: "Recent interactions show increasing frustration with recurring SmartGate issues",
        confidence: 78,
        actionable: true,
      },
      {
        type: "opportunity",
        level: "high",
        title: "Upsell Opportunity",
        description: "Customer profile matches premium service package criteria",
        confidence: 85,
        actionable: true,
      },
      {
        type: "risk",
        level: "medium",
        title: "Churn Risk",
        description: "3 unresolved issues in past 30 days may impact retention",
        confidence: 72,
        actionable: true,
      },
      {
        type: "prediction",
        level: "high",
        title: "Likely Issue: SmartGate Error 0x2F",
        description: "Based on call patterns and recent tickets",
        confidence: 89,
      },
    ],
    suggestedActions: [
      "Offer immediate escalation to senior tech",
      "Proactively mention firmware update availability",
      "Consider complimentary service visit",
      "Review account for upgrade opportunities",
    ],
    predictedIntent: "Technical support for recurring SmartGate controller issues",
    sentimentTrend: "negative",
  }
}

type CallerIntelligenceProps = {
  callerId: string
  compact?: boolean
  className?: string
}

export default function CallerIntelligence({ callerId, compact = false, className }: CallerIntelligenceProps) {
  const [profile, setProfile] = useState<CallerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI analysis delay
    const timer = setTimeout(() => {
      setProfile(generateCallerProfile(callerId))
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [callerId])

  if (loading) {
    return (
      <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-orange-400 animate-pulse" />
            <CardTitle className="text-sm text-white">Analyzing caller...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="h-3 bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 bg-neutral-800 rounded w-3/4 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-neutral-800 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "text-purple-400 bg-purple-500/10 border-purple-500/30"
      case "gold":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
      case "silver":
        return "text-neutral-300 bg-neutral-500/10 border-neutral-500/30"
      default:
        return "text-orange-400 bg-orange-500/10 border-orange-500/30"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3 text-green-400" />
      case "negative":
        return <TrendingDown className="h-3 w-3 text-red-400" />
      default:
        return <MessageSquare className="h-3 w-3 text-neutral-400" />
    }
  }

  const getInsightIcon = (type: string, level: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className={cn("h-3 w-3", level === "high" ? "text-red-400" : "text-yellow-400")} />
      case "opportunity":
        return <Target className="h-3 w-3 text-green-400" />
      case "prediction":
        return <Zap className="h-3 w-3 text-blue-400" />
      case "sentiment":
        return getSentimentIcon(level)
      default:
        return <MessageSquare className="h-3 w-3 text-neutral-400" />
    }
  }

  if (compact) {
    return (
      <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-medium text-white">AI Insights</span>
            </div>
            <Badge className={getTierColor(profile.tier)} variant="outline">
              {profile.tier.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Predicted Intent:</span>
              <span className="text-white font-medium">Technical Support</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-neutral-400">{profile.satisfactionScore}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-red-400" />
                <span className="text-neutral-400">Risk: {profile.riskScore}%</span>
              </div>
            </div>

            {profile.insights.slice(0, 2).map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-neutral-800/70 border border-neutral-700/50"
              >
                {getInsightIcon(insight.type, insight.level)}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white truncate">{insight.title}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{insight.confidence}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Caller Intelligence</CardTitle>
          </div>
          <Badge className={getTierColor(profile.tier)} variant="outline">
            {profile.tier.toUpperCase()} TIER
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-400" />
              <span className="text-xs text-neutral-400">LTV</span>
            </div>
            <div className="text-sm font-semibold text-white">${(profile.lifetimeValue / 1000).toFixed(0)}K</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-neutral-400">CSAT</span>
            </div>
            <div className="text-sm font-semibold text-white">{profile.satisfactionScore}%</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-red-400" />
              <span className="text-xs text-neutral-400">Risk</span>
            </div>
            <div className="text-sm font-semibold text-white">{profile.riskScore}%</div>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Predicted Intent */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium text-neutral-300">Predicted Intent</span>
          </div>
          <p className="text-sm text-white">{profile.predictedIntent}</p>
        </div>

        {/* Key Insights */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-medium text-neutral-300">Key Insights</span>
          </div>
          <div className="space-y-2">
            {profile.insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-neutral-800/70 border border-neutral-700/50"
              >
                {getInsightIcon(insight.type, insight.level)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{insight.title}</span>
                    <span className="text-xs text-neutral-400">{insight.confidence}%</span>
                  </div>
                  <p className="text-xs text-neutral-400">{insight.description}</p>
                  {insight.actionable && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs bg-orange-500/10 text-orange-400 border-orange-500/20"
                    >
                      Actionable
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span className="text-xs font-medium text-neutral-300">Suggested Actions</span>
          </div>
          <div className="space-y-1">
            {profile.suggestedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span className="text-neutral-300">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call History Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3 w-3 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Call History</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-400">Total Calls:</span>
              <span className="text-white ml-1">{profile.callHistory.totalCalls}</span>
            </div>
            <div>
              <span className="text-neutral-400">Avg Duration:</span>
              <span className="text-white ml-1">{profile.callHistory.avgDuration}m</span>
            </div>
            <div>
              <span className="text-neutral-400">Resolution Rate:</span>
              <span className="text-white ml-1">{profile.callHistory.resolutionRate}%</span>
            </div>
            <div>
              <span className="text-neutral-400">Last Call:</span>
              <span className="text-white ml-1">{profile.callHistory.lastCallDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
