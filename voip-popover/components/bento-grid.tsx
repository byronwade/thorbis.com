"use client"

import type * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, RotateCcw, Wrench, Minus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const TAILWIND_SAFELIST = [
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-4",
  "col-span-5",
  "col-span-6",
  "col-span-7",
  "col-span-8",
  "col-span-9",
  "col-span-10",
  "col-span-11",
  "col-span-12",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-4",
  "md:col-span-5",
  "md:col-span-6",
  "md:col-span-7",
  "md:col-span-8",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-7",
  "lg:col-span-8",
  "lg:col-span-9",
  "lg:col-span-10",
  "lg:col-span-11",
  "lg:col-span-12",
]
void TAILWIND_SAFELIST

export type BentoSpan = {
  base: number
  md: number
  lg: number
}

export type BentoItem = {
  id: string
  title: string
  element: React.ReactNode
  icon?: React.ReactNode
  span?: Partial<BentoSpan>
  min?: number
  max?: number
  resizable?: boolean
  className?: string
  priority?: number
}

type SavedSpans = Record<string, Partial<BentoSpan>>

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function BentoGrid({
  storageKey,
  items,
  className,
  defaultLgCols = 12,
  defaultMdCols = 8,
}: {
  storageKey: string
  items: BentoItem[]
  className?: string
  defaultLgCols?: number
  defaultMdCols?: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [customize, setCustomize] = useState(false)

  // Spans (persisted)
  const [spans, setSpans] = useState<SavedSpans>(() => {
    if (typeof window === "undefined") return {}
    try {
      const raw = window.localStorage.getItem(`voip:bento:spans:${storageKey}`)
      return raw ? (JSON.parse(raw) as SavedSpans) : {}
    } catch {
      return {}
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(`voip:bento:spans:${storageKey}`, JSON.stringify(spans))
    } catch {}
  }, [spans, storageKey])

  // Track container width to decide columns (1 / 8 / 12)
  const [cols, setCols] = useState<{ base: 1 | 1; md: number; lg: number }>({
    base: 1,
    md: defaultMdCols,
    lg: defaultLgCols,
  })
  const [bp, setBp] = useState<"base" | "md" | "lg">("lg")
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        // Tailwind defaults: md >= 768, lg >= 1024
        const curBp = w >= 1024 ? "lg" : w >= 768 ? "md" : "base"
        setBp(curBp)
        setCols({ base: 1, md: defaultMdCols, lg: defaultLgCols })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [defaultLgCols, defaultMdCols])

  const gridColsClass = "grid-cols-1 md:grid-cols-8 lg:grid-cols-12"

  function getPreferred(item: BentoItem, point: "md" | "lg") {
    const saved = spans[item.id]
    const raw =
      point === "md" ? (saved?.md ?? item.span?.md ?? Math.min(4, defaultMdCols)) : (saved?.lg ?? item.span?.lg ?? 4)
    const minC = clamp(item.min ?? 2, 1, point === "md" ? defaultMdCols : defaultLgCols)
    const maxC = clamp(
      item.max ?? (point === "md" ? defaultMdCols : defaultLgCols),
      1,
      point === "md" ? defaultMdCols : defaultLgCols,
    )
    return clamp(raw, minC, maxC)
  }

  function adjust(item: BentoItem, delta: number) {
    setSpans((prev) => {
      const next = { ...prev }
      const existing = next[item.id] ?? {}
      const lg = clamp((existing.lg ?? item.span?.lg ?? 4) + delta, item.min ?? 2, item.max ?? 12)
      next[item.id] = { ...existing, lg }
      return next
    })
  }

  function resetLayout() {
    setSpans({})
  }

  // Visible items exclude minimized ones
  const visibleItems = useMemo(() => items, [items])

  // Auto filler if something is minimized
  const autoFiller = null

  // Stable index map for tiebreaker
  const indexMap = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((it, idx) => map.set(it.id, idx))
    return map
  }, [items])

  // Priority sort (live transcript first by default)
  const sortedVisible = useMemo(() => {
    const withPriority = visibleItems.map((it) => {
      let p = typeof it.priority === "number" ? it.priority : 0
      if (it.id === "transcript" && typeof it.priority !== "number") p = 100 // boost default
      return { ...it, __p: p }
    })
    withPriority.sort((a, b) => {
      if (b.__p !== a.__p) return b.__p - a.__p
      return (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0)
    })
    return withPriority
  }, [visibleItems, indexMap])

  // Merge auto filler at the end
  const renderedItems = useMemo(
    () => (autoFiller ? [...sortedVisible, autoFiller] : sortedVisible),
    [sortedVisible, autoFiller],
  )

  // Compute automatic spans (md/lg) when not customizing
  type RowItem = { id: string; span: number; min: number; max: number }
  function computeAutoSpans(list: BentoItem[], totalCols: number, point: "md" | "lg") {
    const rows: RowItem[][] = []
    let current: RowItem[] = []
    let used = 0

    function pushRow() {
      if (current.length === 0) return
      // Fill leftover by expanding the last item
      const leftover = totalCols - used
      if (leftover > 0 && current.length > 0) {
        const last = current[current.length - 1]
        const grow = Math.min(leftover, last.max - last.span)
        last.span += grow
        used += grow
      }
      rows.push(current)
    }

    for (const item of list) {
      const minC = clamp(item.min ?? 2, 1, totalCols)
      const maxC = clamp(item.max ?? totalCols, 1, totalCols)
      let pref = clamp(getPreferred(item, point), minC, maxC)

      // If it doesn't fit in current row
      const rem = totalCols - used
      if (pref > rem) {
        // Try shrink into remainder if >= min
        if (rem >= minC) {
          current.push({ id: item.id, span: rem, min: minC, max: maxC })
          used += rem
          // End of row, fill and push
          pushRow()
          // Start new row
          current = []
          used = 0
        } else {
          // Not enough room even at min — finish this row and start new
          pushRow()
          current = []
          used = 0
          // Place in next row with preferred span (clamped to total)
          pref = clamp(pref, minC, maxC)
          pref = Math.min(pref, totalCols)
          current.push({ id: item.id, span: pref, min: minC, max: maxC })
          used += pref
        }
      } else {
        // Fits — place
        current.push({ id: item.id, span: pref, min: minC, max: maxC })
        used += pref
        if (used === totalCols) {
          pushRow()
          current = []
          used = 0
        }
      }
    }
    // Flush last row
    pushRow()

    // Build map
    const map = new Map<string, number>()
    for (const row of rows) {
      for (const it of row) {
        map.set(it.id, it.span)
      }
    }
    return map
  }

  const autoMdMap = useMemo(() => {
    if (customize) return new Map<string, number>()
    return computeAutoSpans(renderedItems, defaultMdCols, "md")
  }, [renderedItems, defaultMdCols, customize, spans])

  const autoLgMap = useMemo(() => {
    if (customize) return new Map<string, number>()
    return computeAutoSpans(renderedItems, defaultLgCols, "lg")
  }, [renderedItems, defaultLgCols, customize, spans])

  function spanClassFor(item: BentoItem) {
    if (!customize) {
      const md = autoMdMap.get(item.id) ?? clamp(getPreferred(item, "md"), item.min ?? 2, item.max ?? defaultMdCols)
      const lg = autoLgMap.get(item.id) ?? clamp(getPreferred(item, "lg"), item.min ?? 2, item.max ?? defaultLgCols)
      return cn("col-span-1", `md:col-span-${md}`, `lg:col-span-${lg}`)
    }
    // Customize mode: honor saved spans
    const saved = spans[item.id]
    const base = 1
    const md = clamp(saved?.md ?? item.span?.md ?? Math.min(4, defaultMdCols), 1, defaultMdCols)
    const lg = clamp(saved?.lg ?? item.span?.lg ?? 4, item.min ?? 2, item.max ?? 12)
    return cn(`col-span-${base}`, `md:col-span-${md}`, `lg:col-span-${lg}`)
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between rounded-xl border border-neutral-800/50 bg-gradient-to-r from-neutral-900 to-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
              <Wrench className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-sm text-neutral-300">
              {customize
                ? "Drag handles to resize • Use +/- buttons for precision"
                : "Smart auto-layout active • Priority widgets shown first"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {customize && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-neutral-600 bg-transparent text-neutral-300 hover:bg-neutral-800"
                    onClick={resetLayout}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all widget sizes to their default values</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={customize ? "default" : "outline"}
                  className={cn(
                    "rounded-lg",
                    customize
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-neutral-600 bg-transparent text-neutral-300 hover:bg-neutral-800",
                  )}
                  onClick={() => setCustomize((v) => !v)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  {customize ? "Done" : "Customize"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{customize ? "Exit customization mode" : "Enter customization mode to resize widgets"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div ref={containerRef} className={cn("grid gap-4", gridColsClass)}>
          {renderedItems.map((item) => (
            <article
              key={item.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10",
                spanClassFor(item),
                item.className,
              )}
            >
              <div className="flex items-center justify-between border-b border-neutral-700/50 bg-neutral-800/30 px-4 py-3 backdrop-blur-sm">
                <div className="flex min-w-0 items-center gap-3">
                  {item.icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                      {item.icon}
                    </div>
                  )}
                  <h3 className="truncate text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {customize && item.resizable !== false && bp === "lg" && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => adjust(item, -1)}
                            className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                            disabled={spans[item.id]?.lg === (item.min ?? 2)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Make widget smaller (decrease width by 1 column)</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => adjust(item, 1)}
                            className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                            disabled={spans[item.id]?.lg === (item.max ?? 12)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Make widget larger (increase width by 1 column)</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">{item.element}</div>
            </article>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default BentoGrid
