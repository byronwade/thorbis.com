"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Eye } from "lucide-react"

interface PredictiveIntelligenceProps {
  customerId?: string
  callContext?: string
}

export default function PredictiveIntelligence({ customerId, callContext }: PredictiveIntelligenceProps) {
  const [predictions, setPredictions] = useState({
    resolutionLikelihood: 87,
    estimatedDuration: "8-12 min",
    churnRisk: "Low",
    upsellOpportunity: "High",
    nextBestAction: "Offer premium support package",
    customerLifetimeValue: "$2,340",
  })

  const [insights, setInsights] = useState([
    { type: "success", message: "Customer shows high satisfaction patterns", confidence: 92 },
    { type: "warning", message: "Previous escalation 30 days ago", confidence: 78 },
    { type: "info", message: "Prime candidate for service upgrade", confidence: 85 },
  ])

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-100">Predictive Intelligence</h3>
      </div>

      {/* Resolution Prediction */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">Resolution Likelihood</span>
          <span className="text-xs font-medium text-green-400">{predictions.resolutionLikelihood}%</span>
        </div>
        <Progress value={predictions.resolutionLikelihood} className="h-1" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-neutral-800 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-neutral-400">Est. Duration</span>
          </div>
          <span className="text-xs font-medium text-neutral-100">{predictions.estimatedDuration}</span>
        </div>

        <div className="bg-neutral-800 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3 text-green-400" />
            <span className="text-xs text-neutral-400">Churn Risk</span>
          </div>
          <Badge variant="outline" className="text-xs border-green-600 text-green-400">
            {predictions.churnRisk}
          </Badge>
        </div>

        <div className="bg-neutral-800 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-orange-400" />
            <span className="text-xs text-neutral-400">Upsell</span>
          </div>
          <Badge variant="outline" className="text-xs border-orange-600 text-orange-400">
            {predictions.upsellOpportunity}
          </Badge>
        </div>

        <div className="bg-neutral-800 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-purple-400" />
            <span className="text-xs text-neutral-400">CLV</span>
          </div>
          <span className="text-xs font-medium text-neutral-100">{predictions.customerLifetimeValue}</span>
        </div>
      </div>

      {/* Next Best Action */}
      <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-2">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-3 w-3 text-blue-400" />
          <span className="text-xs font-medium text-blue-300">Recommended Action</span>
        </div>
        <p className="text-xs text-neutral-300 mb-2">{predictions.nextBestAction}</p>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7">
          Execute Recommendation
        </Button>
      </div>

      {/* AI Insights */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-neutral-300">AI Insights</span>
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2 p-2 bg-neutral-800 rounded-lg">
            <div
              className={`w-2 h-2 rounded-full mt-1 ${
                insight.type === "success"
                  ? "bg-green-400"
                  : insight.type === "warning"
                    ? "bg-orange-400"
                    : "bg-blue-400"
              }`}
            />
            <div className="flex-1">
              <p className="text-xs text-neutral-300">{insight.message}</p>
              <span className="text-xs text-neutral-500">Confidence: {insight.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
