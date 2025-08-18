"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCcw, Undo, Redo, Save, Palette, Check } from "lucide-react"

type SignaturePadProps = {
  className?: string
  height?: number
  lineWidth?: number
  strokeStyle?: string
  onChange?: (dataUrl: string | null) => void
}

interface SignatureState {
  imageData: ImageData | null
  dataUrl: string | null
}

const SIGNATURE_TEMPLATES = [
  {
    name: "John Smith",
    signature:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  },
  {
    name: "Sarah Johnson",
    signature:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  },
]

const STROKE_COLORS = ["#111", "#2563eb", "#dc2626", "#059669", "#7c3aed"]

export default function SignaturePad({
  className,
  height = 160,
  lineWidth = 2,
  strokeStyle = "#111",
  onChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [currentStrokeStyle, setCurrentStrokeStyle] = useState(strokeStyle)
  const [currentLineWidth, setCurrentLineWidth] = useState(lineWidth)
  const [history, setHistory] = useState<SignatureState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showTemplates, setShowTemplates] = useState(false)
  const [savedSignatures, setSavedSignatures] = useState<Array<{ name: string; signature: string }>>([])

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  useEffect(() => {
    const saved = localStorage.getItem("saved-signatures")
    if (saved) {
      setSavedSignatures(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(height * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, rect.width, height)
    ctx.lineWidth = currentLineWidth
    ctx.strokeStyle = currentStrokeStyle
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    saveToHistory()
  }, [height, dpr, currentLineWidth, currentStrokeStyle])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/png")
    const newState = { imageData, dataUrl }

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevState = history[prevIndex]
      restoreCanvasState(prevState)
      setHistoryIndex(prevIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextState = history[nextIndex]
      restoreCanvasState(nextState)
      setHistoryIndex(nextIndex)
    }
  }

  const restoreCanvasState = (state: SignatureState) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !state.imageData) return

    ctx.putImageData(state.imageData, 0, 0)
    setHasDrawn(state.dataUrl !== null)
    onChange?.(state.dataUrl)
  }

  function coords(e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    } else {
      return { x: (e as React.PointerEvent).clientX - rect.left, y: (e as React.PointerEvent).clientY - rect.top }
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const p = coords(e)
    setIsDrawing(true)
    setHasDrawn(true)
    ctx.lineWidth = currentLineWidth
    ctx.strokeStyle = currentStrokeStyle
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const p = coords(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const onPointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setTimeout(() => saveToHistory(), 100)
      if (onChange) {
        try {
          const url = canvasRef.current?.toDataURL("image/png") || null
          onChange(url)
        } catch {
          onChange?.(null)
        }
      }
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, rect.width, height)
    setHasDrawn(false)
    onChange?.(null)
    saveToHistory()
  }

  const loadTemplate = (signature: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width / dpr, height)
      ctx.drawImage(img, 0, 0, canvas.width / dpr, height)
      setHasDrawn(true)
      onChange?.(signature)
      saveToHistory()
    }
    img.src = signature
    setShowTemplates(false)
  }

  const saveSignature = () => {
    const dataUrl = canvasRef.current?.toDataURL("image/png")
    if (!dataUrl || !hasDrawn) return

    const name = prompt("Enter a name for this signature:")
    if (!name) return

    const newSignature = { name, signature: dataUrl }
    const updated = [...savedSignatures, newSignature]
    setSavedSignatures(updated)
    localStorage.setItem("saved-signatures", JSON.stringify(updated))
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">Signature</span>
          {hasDrawn && <div className="h-2 w-2 rounded-full bg-green-400" />}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200"
          >
            <Palette className="h-3 w-3 mr-1" />
            Templates
          </Button>
          {hasDrawn && (
            <Button
              size="sm"
              variant="ghost"
              onClick={saveSignature}
              className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              <Save className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showTemplates && (
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-3 space-y-2">
          <div className="text-xs font-medium text-neutral-300 mb-2">Quick Templates</div>
          <div className="grid grid-cols-2 gap-2">
            {[...SIGNATURE_TEMPLATES, ...savedSignatures].map((template, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => loadTemplate(template.signature)}
                className="h-8 text-xs border-neutral-600 text-neutral-300 hover:bg-neutral-700"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50 border border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Color:</span>
          <div className="flex gap-1">
            {STROKE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentStrokeStyle(color)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  currentStrokeStyle === color ? "border-white scale-110" : "border-neutral-600",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Width:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((width) => (
              <button
                key={width}
                onClick={() => setCurrentLineWidth(width)}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center text-xs transition-all",
                  currentLineWidth === width
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600",
                )}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-2">
        <canvas
          ref={canvasRef}
          className="h-[160px] w-full touch-none cursor-crosshair"
          style={{ height, width: "100%" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 disabled:opacity-50"
          >
            <Undo className="h-3 w-3 mr-1" />
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 disabled:opacity-50"
          >
            <Redo className="h-3 w-3 mr-1" />
            Redo
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {hasDrawn && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Check className="h-3 w-3" />
              Captured
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs rounded-full border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent"
            onClick={clear}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
