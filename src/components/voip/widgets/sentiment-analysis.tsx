"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Smile, Frown, Meh, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from "lucide-react"

interface SentimentData {
  overall: "positive" | "neutral" | "negative"
  confidence: number
  emotions: {
    happy: number
    frustrated: number
    confused: number
    satisfied: number
  }
  trends: Array<{
    timestamp: string
    sentiment: number
    trigger?: string
  }>
}

export default function SentimentAnalysis() {
  const [sentiment, setSentiment] = useState<SentimentData>({
    overall: "neutral",
    confidence: 75,
    emotions: {
      happy: 20,
      frustrated: 45,
      confused: 30,
      satisfied: 15,
    },
    trends: [
      { timestamp: "10:30", sentiment: 0.2, trigger: "Call started" },
      { timestamp: "10:32", sentiment: -0.3, trigger: "Issue described" },
      { timestamp: "10:35", sentiment: 0.1, trigger: "Solution offered" },
      { timestamp: "10:37", sentiment: 0.6, trigger: "Problem resolved" },
    ],
  })

  const getSentimentIcon = (overall: string) => {
    switch (overall) {
      case "positive":
        return <Smile className="h-4 w-4 text-green-500" />
      case "negative":
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (overall: string) => {
    switch (overall) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100">
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSentimentIcon(sentiment.overall)}
            <span className="text-sm font-medium text-neutral-100">Customer Sentiment</span>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-1">
            {sentiment.confidence}%
          </Badge>
        </div>
      </div>

      <div className="p-2 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Overall Mood</span>
            <span className="capitalize font-medium">{sentiment.overall}</span>
          </div>
          <Progress value={sentiment.confidence} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-400">Emotion Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Satisfied
              </span>
              <span>{sentiment.emotions.satisfied}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Smile className="h-3 w-3 text-blue-500" />
                Happy
              </span>
              <span>{sentiment.emotions.happy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                Frustrated
              </span>
              <span>{sentiment.emotions.frustrated}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Meh className="h-3 w-3 text-yellow-500" />
                Confused
              </span>
              <span>{sentiment.emotions.confused}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-400">Sentiment Timeline</h4>
          <div className="space-y-1">
            {sentiment.trends.map((trend, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500 w-12">{trend.timestamp}</span>
                <div className="flex items-center gap-1">
                  {trend.sentiment > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : trend.sentiment < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-neutral-300">{trend.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-700">
          <div className="flex gap-1">
            {sentiment.overall === "negative" && (
              <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                Escalate
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
              Add Note
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
              Survey
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
