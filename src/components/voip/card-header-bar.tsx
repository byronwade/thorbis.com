"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

type CardHeaderBarProps = {
  title?: string
  actions?: React.ReactNode
  className?: string
}

export function CardHeaderBar({ title = "Title", actions = null, className }: CardHeaderBarProps) {
  return (
    <div className={cn("w-full border-b bg-neutral-900 px-3 py-2", className)}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-neutral-100">{title}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
    </div>
  )
}

export default CardHeaderBar
