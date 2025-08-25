"use client"

import type React from "react"

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { WidgetSettingsPopup, type WidgetVisibility } from "./widget-settings-popup"
import { cn } from "@/lib/utils"
import { GripVertical, Move, Grid3X3 } from "lucide-react"

export type WidgetConfig = {
  id: string
  title: string
  element: React.ReactNode
  description?: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  span?: {
    base?: number
    md?: number
    lg?: number
  }
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue] as const
}

function checkCollision(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  )
}

function findNonOverlappingPosition(
  newPos: { x: number; y: number },
  size: { width: number; height: number },
  existingWidgets: Array<{ id: string; position: { x: number; y: number }; size: { width: number; height: number } }>,
  excludeId: string,
  containerBounds: { width: number; height: number },
): { x: number; y: number } {
  const newRect = { ...newPos, ...size }

  // Check bounds first
  newRect.x = Math.max(0, Math.min(newRect.x, containerBounds.width - size.width))
  newRect.y = Math.max(0, Math.min(newRect.y, containerBounds.height - size.height))

  // Check for collisions with other widgets
  const hasCollision = existingWidgets.some((widget) => {
    if (widget.id === excludeId) return false
    return checkCollision(newRect, { ...widget.position, ...widget.size })
  })

  if (!hasCollision) {
    return { x: newRect.x, y: newRect.y }
  }

  // Find alternative position by trying different offsets
  const gridSize = 20
  for (let offsetY = 0; offsetY < containerBounds.height; offsetY += gridSize) {
    for (let offsetX = 0; offsetX < containerBounds.width; offsetX += gridSize) {
      const testPos = { x: offsetX, y: offsetY }
      const testRect = { ...testPos, ...size }

      // Check bounds
      if (
        testRect.x + testRect.width > containerBounds.width ||
        testRect.y + testRect.height > containerBounds.height
      ) {
        continue
      }

      // Check collisions
      const hasTestCollision = existingWidgets.some((widget) => {
        if (widget.id === excludeId) return false
        return checkCollision(testRect, { ...widget.position, ...widget.size })
      })

      if (!hasTestCollision) {
        return testPos
      }
    }
  }

  // Fallback to original position if no alternative found
  return newPos
}

function SortableWidget({
  id,
  title,
  element,
  span,
  position,
  size,
  freeMode,
}: {
  id: string
  title: string
  element: React.ReactNode
  span?: WidgetConfig["span"]
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  freeMode: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const defaultSize = { width: 320, height: 400 }
  const widgetSize = size || defaultSize

  const style =
    freeMode && position
      ? {
          position: "absolute" as const,
          left: position.x,
          top: position.y,
          width: widgetSize.width,
          height: widgetSize.height,
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 5 : 0,
        }
      : {
          transform: CSS.Transform.toString(transform),
          transition,
        }

  const base = span?.base ?? 12
  const md = span?.md ?? 6
  const lg = span?.lg ?? 4

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(!freeMode && `col-span-${base} md:col-span-${md} lg:col-span-${lg}`, isDragging ? "z-[5]" : "z-0")}
    >
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 transition",
          freeMode && "shadow-lg resize-both min-w-[280px] min-h-[200px]",
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-700/80 bg-neutral-900 px-2 py-1">
          <div className="text-sm font-medium text-neutral-100">{title}</div>
          <div className="flex items-center">
            {freeMode && (
              <button
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                aria-label={`Move ${title}`}
                title="Drag to move"
                {...attributes}
                {...listeners}
              >
                <Move className="h-3 w-3" />
              </button>
            )}
            {!freeMode && (
              <button
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                aria-label={`Drag to reorder ${title}`}
                title="Drag to reorder"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
        <div className="p-2 overflow-auto" style={{ height: freeMode ? "calc(100% - 32px)" : "auto" }}>
          {element}
        </div>
      </div>
    </div>
  )
}

export function ReorderableWidgets({
  storageKey,
  widgets,
  className,
}: {
  storageKey: string
  widgets: WidgetConfig[]
  className?: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const defaultOrder = useMemo(() => widgets.map((w) => w.id), [widgets])
  const [order, setOrder] = useLocalStorage<string[]>(`voip:layout:${storageKey}`, defaultOrder)
  const [freeMode, setFreeMode] = useState(false)
  const [widgetPositions, setWidgetPositions] = useLocalStorage<Record<string, { x: number; y: number }>>(
    `voip:positions:${storageKey}`,
    {},
  )
  const [widgetVisibility, setWidgetVisibility] = useLocalStorage<WidgetVisibility>(
    `voip:visibility:${storageKey}`,
    widgets.reduce((acc, w) => ({ ...acc, [w.id]: true }), {}),
  )

  // Keep order stable even if widgets set changes
  const ordered = useMemo(() => {
    const map = new Map(widgets.map((w) => [w.id, w]))
    const existing = order.filter((id) => map.has(id)).map((id) => map.get(id)!)
    const missing = widgets.filter((w) => !order.includes(w.id))
    return [...existing, ...missing].filter((w) => widgetVisibility[w.id])
  }, [order, widgets, widgetVisibility])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    if (freeMode) {
      const delta = event.delta
      const currentPos = widgetPositions[String(active.id)] || { x: 0, y: 0 }
      const newPos = {
        x: currentPos.x + delta.x,
        y: currentPos.y + delta.y,
      }

      const activeWidget = widgets.find((w) => w.id === active.id)
      const widgetSize = activeWidget?.size || { width: 320, height: 400 }
      const containerElement = document.querySelector("[data-widget-container]") as HTMLElement
      const containerBounds = containerElement
        ? { width: containerElement.scrollWidth, height: containerElement.scrollHeight }
        : { width: 1200, height: 800 }

      const existingWidgets = ordered
        .filter((w) => w.id !== active.id && widgetPositions[w.id])
        .map((w) => ({
          id: w.id,
          position: widgetPositions[w.id],
          size: w.size || { width: 320, height: 400 },
        }))

      const finalPos = findNonOverlappingPosition(
        newPos,
        widgetSize,
        existingWidgets,
        String(active.id),
        containerBounds,
      )

      setWidgetPositions((prev) => ({
        ...prev,
        [String(active.id)]: finalPos,
      }))
    } else {
      // Handle grid reordering
      const oldIndex = order.indexOf(String(active.id))
      const newIndex = order.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      const next = arrayMove(order, oldIndex, newIndex)
      setOrder(next)
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-600">
          {freeMode ? "Drag widgets anywhere • Widgets snap to avoid overlaps" : "Drag and drop to reorder widgets"}
        </div>
        <div className="flex items-center gap-1">
          <WidgetSettingsPopup
            widgets={widgets.map((w) => ({ id: w.id, title: w.title, description: w.description }))}
            visibility={widgetVisibility}
            onVisibilityChange={setWidgetVisibility}
          />
          <Button
            size="sm"
            variant={freeMode ? "secondary" : "outline"}
            className="rounded-full border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            onClick={() => setFreeMode(!freeMode)}
          >
            {freeMode ? <Grid3X3 className="mr-1 h-3 w-3" /> : <Move className="mr-1 h-3 w-3" />}
            {freeMode ? "Grid Mode" : "Free Mode"}
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((w) => w.id)}>
          <div
            data-widget-container
            className={cn(
              freeMode
                ? "relative min-h-[800px] max-h-[800px] bg-neutral-950/50 rounded-lg border border-neutral-800 overflow-auto scroll-smooth"
                : "grid grid-cols-12 gap-2",
            )}
          >
            {ordered.map((w) => (
              <SortableWidget
                key={w.id}
                id={w.id}
                title={w.title}
                element={w.element}
                span={w.span}
                position={widgetPositions[w.id]}
                size={w.size}
                freeMode={freeMode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
