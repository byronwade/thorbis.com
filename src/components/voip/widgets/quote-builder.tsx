"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Copy, Trash2, Receipt, Send, Mail } from "lucide-react"

type Line = { id: string; name: string; qty: number; price: number; unit?: string }
type QuoteData = { items: Line[]; note?: string }

function parseNumber(s: string): number {
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export default function QuoteBuilder({
  storageKey = "voip:quote:generic",
  taxRate = 0.085,
  phone = "",
  email = "",
  accountLabel = "",
}: {
  storageKey?: string
  taxRate?: number
  phone?: string
  email?: string
  accountLabel?: string
}) {
  const [items, setItems] = useState<Line[]>([])
  const [note, setNote] = useState<string>("")
  const lastSavedRef = useRef<string>("")

  // Load once
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      lastSavedRef.current = raw ?? ""
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteData
        setItems(Array.isArray(parsed.items) ? parsed.items.map(normalizeLine) : [])
        setNote(typeof parsed.note === "string" ? parsed.note : "")
      } else {
        setItems([])
        setNote("")
      }
    } catch {
      setItems([])
      setNote("")
    }
  }, [storageKey])

  // Persist when meaningful changes occur
  useEffect(() => {
    const payload: QuoteData = { items, note }
    try {
      const next = JSON.stringify(payload)
      if (next !== lastSavedRef.current) {
        window.localStorage.setItem(storageKey, next)
        lastSavedRef.current = next
      }
    } catch {}
  }, [items, note, storageKey])

  // Respond to storage events from other tabs/windows only if changed
  const onStorage = useCallback(
    (e: StorageEvent) => {
      if (e.key !== storageKey) return
      if (e.newValue === lastSavedRef.current) return
      try {
        const parsed = e.newValue ? (JSON.parse(e.newValue) as QuoteData) : { items: [], note: "" }
        const nextItems = Array.isArray(parsed.items) ? parsed.items.map(normalizeLine) : []
        const nextNote = typeof parsed.note === "string" ? parsed.note : ""
        const current = JSON.stringify({ items, note })
        const incoming = JSON.stringify({ items: nextItems, note: nextNote })
        if (incoming !== current) {
          setItems(nextItems)
          setNote(nextNote)
        }
      } catch {
        // ignore malformed
      }
    },
    [items, note, storageKey],
  )

  useEffect(() => {
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [onStorage])

  function normalizeLine(l: Line): Line {
    return {
      id: String(l.id ?? crypto.randomUUID()),
      name: String(l.name ?? ""),
      qty: Number.isFinite(l.qty) ? l.qty : 0,
      price: Number.isFinite(l.price) ? l.price : 0,
      unit: l.unit ? String(l.unit) : undefined,
    }
  }

  function updateLine(id: string, patch: Partial<Line>) {
    setItems((prev) => prev.map((l) => (l.id === id ? normalizeLine({ ...l, ...patch }) : l)))
  }

  function removeLine(id: string) {
    setItems((prev) => prev.filter((l) => l.id !== id))
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, l) => sum + (l.qty || 0) * (l.price || 0), 0)
    const tax = Math.max(0, Math.round(subtotal * taxRate * 100) / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [items, taxRate])

  async function copySummary() {
    const lines = items.map(
      (l) => `${l.name} — ${l.qty} x ${l.price.toLocaleString(undefined, { style: "currency", currency: "USD" })}`,
    )
    const text = `Quote for ${accountLabel || "account"}:
${lines.join("\n")}

Subtotal: ${totals.subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}
Tax: ${totals.tax.toLocaleString(undefined, { style: "currency", currency: "USD" })}
Total: ${totals.total.toLocaleString(undefined, { style: "currency", currency: "USD" })}

Notes:
${note}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 mx-auto mb-4">
            <Receipt className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-neutral-300 font-medium">No items in quote</p>
          <p className="text-sm text-neutral-500 mt-1">Add services from the catalog to get started</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-neutral-800/50 border-b border-neutral-700">
                <tr>
                  <th className="p-4 text-left font-semibold text-white">Item</th>
                  <th className="w-[80px] p-4 text-right font-semibold text-white">Qty</th>
                  <th className="w-[120px] p-4 text-right font-semibold text-white">Unit Price</th>
                  <th className="w-[100px] p-4 text-right font-semibold text-white">Total</th>
                  <th className="w-[48px]" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineTotal = (item.qty || 0) * (item.price || 0)
                  return (
                    <tr
                      key={item.id}
                      className={cn("border-t border-neutral-800", index % 2 === 0 && "bg-neutral-800/20")}
                    >
                      <td className="p-4 align-top">
                        <Input
                          value={item.name || ""}
                          onChange={(e) => updateLine(item.id, { name: e.target.value })}
                          placeholder="Item name"
                          className="h-9 bg-neutral-800/50 border-neutral-700 text-white"
                        />
                        {item.unit && (
                          <Badge variant="outline" className="mt-2 text-xs border-neutral-600 text-neutral-300">
                            {item.unit}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 align-top text-right">
                        <Input
                          inputMode="numeric"
                          value={String(item.qty ?? 0)}
                          onChange={(e) => updateLine(item.id, { qty: parseNumber(e.target.value) })}
                          className="h-9 text-right bg-neutral-800/50 border-neutral-700 text-white"
                        />
                      </td>
                      <td className="p-4 align-top text-right">
                        <Input
                          inputMode="decimal"
                          value={String(item.price ?? 0)}
                          onChange={(e) => updateLine(item.id, { price: parseNumber(e.target.value) })}
                          className="h-9 text-right bg-neutral-800/50 border-neutral-700 text-white"
                        />
                      </td>
                      <td className="p-4 align-top text-right tabular-nums font-semibold text-green-400">
                        {lineTotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                      </td>
                      <td className="p-4 align-top text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(item.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">Notes</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Special terms, lead times, exclusions..."
            className="min-h-[120px] bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
          />
        </div>

        <div className="rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900 to-neutral-800 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            Quote Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="tabular-nums font-medium text-white">
                {totals.subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Tax ({Math.round(taxRate * 1000) / 10}%)</span>
              <span className="tabular-nums font-medium text-white">
                {totals.tax.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </span>
            </div>
            <div className="border-t border-neutral-700 pt-3 flex items-center justify-between font-semibold text-xl">
              <span className="text-white">Total</span>
              <span className="tabular-nums text-green-400">
                {totals.total.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copySummary}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!phone}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!email}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
