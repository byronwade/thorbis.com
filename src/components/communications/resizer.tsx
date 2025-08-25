"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"

export function Resizer({ onResize }: { onResize: (deltaX: number) => void }) {
  const draggingRef = React.useRef(false)
  const startXRef = React.useRef(0)

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return
      onResize(e.clientX - startXRef.current)
      startXRef.current = e.clientX
    }
    function onUp() {
      if (draggingRef.current) {
        draggingRef.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [onResize])

  function onDown(e: React.MouseEvent) {
    draggingRef.current = true
    startXRef.current = e.clientX
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  React.useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return
      const x = e.touches[0]?.clientX ?? 0
      onResize(x - startXRef.current)
      startXRef.current = x
    }
    function onTouchEnd() {
      if (draggingRef.current) {
        draggingRef.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd)
    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [onResize])

  return (
    <div
      onMouseDown={onDown}
      onTouchStart={(e) => {
        draggingRef.current = true
        startXRef.current = e.touches[0]?.clientX ?? 0
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
      }}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      className="relative z-[1] w-3 shrink-0 cursor-col-resize group"
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:w-[2px] group-focus-visible:w-[2px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground/60 group-hover:text-muted-foreground">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
