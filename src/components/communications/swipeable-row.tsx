"use client"

import * as React from "react"
import { cn } from "@lib/utils"

// A lightweight swipe-to-reveal container.
// - Swiping left reveals right-side actions
// - Taps outside or small swipe snaps back
// - Desktop: no transform applied; actions hidden via CSS
export function SwipeableRow({
  actionWidth = 168, // px (fits ~3 buttons at 56px each)
  threshold = 64, // px drag to open
  className,
  actions,
  children,
}: {
  actionWidth?: number
  threshold?: number
  className?: string
  actions: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const startXRef = React.useRef(0)
  const translateRef = React.useRef(0)
  const [translate, setTranslate] = React.useState(0)

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0]?.clientX ?? 0
    translateRef.current = translate
  }
  function onTouchMove(e: React.TouchEvent) {
    const x = e.touches[0]?.clientX ?? 0
    const dx = x - startXRef.current
    let next = translateRef.current + dx
    // we slide content left only (negative)
    next = Math.min(0, Math.max(-actionWidth, next))
    setTranslate(next)
  }
  function onTouchEnd() {
    // decide open/close by how far it ended
    const shouldOpen = Math.abs(translate) > threshold
    setOpen(shouldOpen)
    setTranslate(shouldOpen ? -actionWidth : 0)
  }

  // Close when clicking/tapping the row
  function onClickContainer() {
    if (open) {
      setOpen(false)
      setTranslate(0)
    }
  }

  return (
    <div className={cn("relative select-none md:select-auto", className)}>
      {/* Action rail (right) — visible under the sliding content */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 z-0 hidden items-center justify-end gap-1 px-1 md:flex"
        )}
        // Desktop: keep hidden; mobile: we will place a mobile-only rail below
      />

      {/* Mobile action rail */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 z-0 flex items-center justify-end gap-1 px-1 md:hidden"
        )}
        aria-hidden={!open}
        style={{ width: `${actionWidth}px` }}
      >
        {actions}
      </div>

      {/* Sliding content */}
      <div
        className="relative z-10 touch-pan-y md:touch-auto"
        style={{
          transform: `translate3d(${translate}px, 0, 0)`,
          transition: "transform 160ms ease",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onClickContainer}
      >
        {children}
      </div>
    </div>
  )
}
