"use client"

import type * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripHorizontal } from "lucide-react"
import { cn } from "@lib/utils"

export function SortablePanel({
  id,
  widthPct,
  title,
  children,
}: {
  id: string
  widthPct: number
  title: string
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${widthPct}%`,
  } as React.CSSProperties
  return (
    <div ref={setNodeRef} style={style} className={cn("flex min-w-0 flex-col overflow-hidden", isDragging && "z-10")}>
      <div className="flex items-center justify-between border-b bg-muted/30 px-2 py-1">
        <div className="text-xs font-medium">{title}</div>
        <button
          className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-muted"
          aria-label={"Drag to reorder " + title}
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4" />
          <span className="sr-only">Drag</span>
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
