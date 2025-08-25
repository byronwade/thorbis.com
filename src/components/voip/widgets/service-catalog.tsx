"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, DollarSign } from "lucide-react"
import cn from "classnames"

type CatalogItem = {
  id: string
  name: string
  price: number
  unit?: string
}

// The QuoteBuilder reads the same storageKey. Keep a shared shape.
type QuoteLine = { id: string; name: string; qty: number; price: number; unit?: string }
type QuoteData = { items: QuoteLine[]; note?: string }

export default function ServiceCatalog({ storageKey = "voip:quote:generic" }: { storageKey?: string }) {
  const [q, setQ] = useState<string>("")
  const lastSavedRef = useRef<string>("")

  // Simple, industry-agnostic catalog
  const items = useMemo<CatalogItem[]>(
    () => [
      { id: "diag", name: "Diagnostic visit", price: 149, unit: "visit" },
      { id: "labor-hr", name: "Labor (hour)", price: 120, unit: "hr" },
      { id: "priority", name: "Priority dispatch", price: 95, unit: "fee" },
      { id: "pm-plan", name: "Maintenance plan (annual)", price: 399, unit: "year" },
      { id: "relay", name: "Universal relay (part)", price: 45, unit: "each" },
      { id: "clean", name: "Clean & tune service unit", price: 89, unit: "service" },
    ],
    [],
  )

  function readQuote(): QuoteData {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return { items: [], note: "" }
      const parsed = JSON.parse(raw) as QuoteData
      return { items: parsed.items ?? [], note: parsed.note ?? "" }
    } catch {
      return { items: [], note: "" }
    }
  }

  function writeQuote(data: QuoteData) {
    try {
      const next = JSON.stringify(data)
      if (next !== lastSavedRef.current) {
        window.localStorage.setItem(storageKey, next)
        lastSavedRef.current = next
      }
    } catch {}
  }

  useEffect(() => {
    // Initialize snapshot so first write is guarded
    lastSavedRef.current = window.localStorage.getItem(storageKey) ?? ""
  }, [storageKey])

  function addToQuote(ci: CatalogItem) {
    const current = readQuote()
    const idx = current.items.findIndex((l) => l.id === ci.id)
    if (idx >= 0) {
      const next = [...current.items]
      next[idx] = { ...next[idx], qty: (next[idx].qty ?? 0) + 1 }
      writeQuote({ ...current, items: next })
    } else {
      const newLine: QuoteLine = { id: ci.id, name: ci.name, qty: 1, price: ci.price, unit: ci.unit }
      writeQuote({ ...current, items: [newLine, ...current.items] })
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter((i) => i.name.toLowerCase().includes(term))
  }, [q, items])

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 py-1 border-b border-neutral-800/50 bg-neutral-900">
        <h3 className="text-sm font-semibold text-white mb-1">Service Catalog</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services..."
            className="h-6 pl-7 text-xs border-neutral-700/50 bg-neutral-800/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between px-2 py-1 border-b border-neutral-800/30 hover:bg-neutral-800/50 transition-colors",
              index === filtered.length - 1 && "border-b-0",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white mb-0.5">{item.name}</div>
              <div className="flex items-center gap-1">
                {item.unit && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-neutral-700/50 text-neutral-300 border-neutral-600 px-1 py-0"
                  >
                    {item.unit}
                  </Badge>
                )}
                <div className="flex items-center gap-0.5 text-green-400">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs font-semibold">
                    {item.price.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => addToQuote(item)}
              className="h-5 px-2 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center px-2">
            <Search className="h-8 w-8 text-neutral-400 mb-1" />
            <p className="text-xs text-neutral-300">No services found</p>
          </div>
        )}
      </div>
    </div>
  )
}
