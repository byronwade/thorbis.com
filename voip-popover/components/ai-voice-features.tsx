"use client"

import { useState, useEffect } from "react"
import { Brain, Languages, FileText, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AIVoiceFeaturesProps {
  callId: string
  isActive: boolean
  className?: string
}

interface EmotionData {
  emotion: string
  confidence: number
  color: string
  suggestion: string
}

interface TranslationData {
  originalText: string
  translatedText: string
  language: string
  confidence: number
}

export default function AIVoiceFeatures({ callId, isActive, className }: AIVoiceFeaturesProps) {
  const [emotionData, setEmotionData] = useState<EmotionData>({
    emotion: "neutral",
    confidence: 85,
    color: "text-blue-400",
    suggestion: "Maintain professional tone",
  })

  const [translationActive, setTranslationActive] = useState(false)
  const [currentTranslation, setCurrentTranslation] = useState<TranslationData | null>(null)
  const [predictiveText, setPredictiveText] = useState("")
  const [callSummary, setCallSummary] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  // Simulate real-time emotion detection
  useEffect(() => {
    if (!isActive) return

    const emotions = [
      {
        emotion: "satisfied",
        confidence: 92,
        color: "text-green-400",
        suggestion: "Customer is happy - good time for upselling",
      },
      {
        emotion: "frustrated",
        confidence: 78,
        color: "text-red-400",
        suggestion: "Use empathetic language and offer solutions",
      },
      {
        emotion: "confused",
        confidence: 85,
        color: "text-yellow-400",
        suggestion: "Slow down and provide clear explanations",
      },
      { emotion: "neutral", confidence: 75, color: "text-blue-400", suggestion: "Maintain professional tone" },
      {
        emotion: "excited",
        confidence: 88,
        color: "text-purple-400",
        suggestion: "Match their energy level positively",
      },
    ]

    const interval = setInterval(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      setEmotionData(randomEmotion)
    }, 8000)

    return () => clearInterval(interval)
  }, [isActive])

  // Simulate live translation
  useEffect(() => {
    if (!translationActive || !isActive) return

    const translations = [
      {
        originalText: "¿Puedes ayudarme con mi cuenta?",
        translatedText: "Can you help me with my account?",
        language: "Spanish",
        confidence: 96,
      },
      { originalText: "Je ne comprends pas", translatedText: "I don't understand", language: "French", confidence: 94 },
      {
        originalText: "Mein Internet funktioniert nicht",
        translatedText: "My internet is not working",
        language: "German",
        confidence: 98,
      },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomTranslation = translations[Math.floor(Math.random() * translations.length)]
        setCurrentTranslation(randomTranslation)
        setTimeout(() => setCurrentTranslation(null), 5000)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [translationActive, isActive])

  // Simulate predictive text
  useEffect(() => {
    if (!isActive) return

    const suggestions = [
      "I understand your concern about...",
      "Let me check your account details...",
      "I can help you with that right away...",
      "Based on your service history...",
      "Would you like me to schedule...",
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setPredictiveText(suggestions[Math.floor(Math.random() * suggestions.length)])
        setTimeout(() => setPredictiveText(""), 4000)
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [isActive])

  // Simulate call summarization
  useEffect(() => {
    if (!isActive) return

    const summaryPoints = [
      "Customer reported internet connectivity issues",
      "Verified account status - service active",
      "Performed remote diagnostics on modem",
      "Scheduled technician visit for tomorrow 2-4 PM",
      "Provided reference number: #TK-2024-0156",
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.8 && callSummary.length < 5) {
        const newPoint = summaryPoints[callSummary.length]
        setCallSummary((prev) => [...prev, newPoint])
      }
    }, 12000)

    return () => clearInterval(interval)
  }, [isActive, callSummary.length])

  if (!isActive) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Voice Emotion Detection */}
      <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-200">Voice Emotion</span>
          </div>
          <Badge variant="outline" className={cn("text-xs", emotionData.color)}>
            {emotionData.emotion} ({emotionData.confidence}%)
          </Badge>
        </div>
        <div className="text-xs text-neutral-400 mb-2">{emotionData.suggestion}</div>
        <Progress value={emotionData.confidence} className="h-1" />
      </div>

      {/* Live Translation */}
      <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-neutral-200">Live Translation</span>
          </div>
          <Button
            size="sm"
            variant={translationActive ? "default" : "outline"}
            onClick={() => setTranslationActive(!translationActive)}
            className="h-6 px-2 text-xs"
          >
            {translationActive ? "ON" : "OFF"}
          </Button>
        </div>
        {currentTranslation && (
          <div className="space-y-1">
            <div className="text-xs text-neutral-400">
              {currentTranslation.language}: "{currentTranslation.originalText}"
            </div>
            <div className="text-xs text-green-300 font-medium">
              → "{currentTranslation.translatedText}" ({currentTranslation.confidence}%)
            </div>
          </div>
        )}
        {!currentTranslation && translationActive && (
          <div className="text-xs text-neutral-500">Listening for foreign languages...</div>
        )}
      </div>

      {/* Predictive Text */}
      {predictiveText && (
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Suggested Response</span>
          </div>
          <div className="text-xs text-blue-200 italic">"{predictiveText}"</div>
          <Button size="sm" variant="outline" className="mt-2 h-6 px-2 text-xs bg-transparent">
            Use Suggestion
          </Button>
        </div>
      )}

      {/* Call Summary */}
      {callSummary.length > 0 && (
        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-neutral-200">Live Summary</span>
          </div>
          <div className="space-y-1">
            {callSummary.map((point, index) => (
              <div key={index} className="text-xs text-neutral-300 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                {point}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
