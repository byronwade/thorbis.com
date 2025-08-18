"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Save, ShoppingBag } from "lucide-react"

type RetailIntake = {
  customerRequest: string
  productInterest: string
  budgetRange: string
  preferredBrands: string
  orderNumber: string
  returnReason: string
  exchangeItem: string
  paymentMethod: string
  deliveryAddress: string
  deliveryPreference: string
  specialRequests: string
  loyaltyNumber: string
  referralSource: string
  notes: string
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function extractRetailInfo(lines: string[]): Partial<RetailIntake> {
  const text = lines.join(" ")
  const extracted: Partial<RetailIntake> = {}

  // Extract order numbers
  const orderMatch = text.match(/\b(?:order|order number|#)\s*:?\s*([A-Z0-9-]{6,})\b/i)
  if (orderMatch) extracted.orderNumber = orderMatch[1].toUpperCase()

  // Extract budget ranges
  const budgetMatch = text.match(
    /\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\s*(?:to|-)?\s*\$?(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)?/i,
  )
  if (budgetMatch) {
    extracted.budgetRange = budgetMatch[2] ? `$${budgetMatch[1]} - $${budgetMatch[2]}` : `$${budgetMatch[1]}`
  }

  // Extract payment methods
  const paymentMethods = ["credit card", "debit card", "cash", "paypal", "apple pay", "google pay", "venmo", "zelle"]
  const paymentMatch = paymentMethods.find((method) => text.toLowerCase().includes(method))
  if (paymentMatch) extracted.paymentMethod = paymentMatch

  // Extract loyalty/membership numbers
  const loyaltyMatch = text.match(/\b(?:member|loyalty|rewards)\s*(?:number|#|id)?\s*:?\s*([A-Z0-9]{6,})\b/i)
  if (loyaltyMatch) extracted.loyaltyNumber = loyaltyMatch[1].toUpperCase()

  return extracted
}

export default function RetailIntake({
  storageKey = "voip:intake:retail",
  transcript = [],
}: {
  storageKey?: string
  transcript?: string[]
}) {
  const [form, setForm] = useState<RetailIntake>(() => {
    if (typeof window === "undefined") {
      return {
        customerRequest: "",
        productInterest: "",
        budgetRange: "",
        preferredBrands: "",
        orderNumber: "",
        returnReason: "",
        exchangeItem: "",
        paymentMethod: "",
        deliveryAddress: "",
        deliveryPreference: "",
        specialRequests: "",
        loyaltyNumber: "",
        referralSource: "",
        notes: "",
      }
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? (JSON.parse(raw) as Partial<RetailIntake>) : {}
      return {
        customerRequest: safeStr(parsed?.customerRequest),
        productInterest: safeStr(parsed?.productInterest),
        budgetRange: safeStr(parsed?.budgetRange),
        preferredBrands: safeStr(parsed?.preferredBrands),
        orderNumber: safeStr(parsed?.orderNumber),
        returnReason: safeStr(parsed?.returnReason),
        exchangeItem: safeStr(parsed?.exchangeItem),
        paymentMethod: safeStr(parsed?.paymentMethod),
        deliveryAddress: safeStr(parsed?.deliveryAddress),
        deliveryPreference: safeStr(parsed?.deliveryPreference),
        specialRequests: safeStr(parsed?.specialRequests),
        loyaltyNumber: safeStr(parsed?.loyaltyNumber),
        referralSource: safeStr(parsed?.referralSource),
        notes: safeStr(parsed?.notes),
      }
    } catch {
      return {
        customerRequest: "",
        productInterest: "",
        budgetRange: "",
        preferredBrands: "",
        orderNumber: "",
        returnReason: "",
        exchangeItem: "",
        paymentMethod: "",
        deliveryAddress: "",
        deliveryPreference: "",
        specialRequests: "",
        loyaltyNumber: "",
        referralSource: "",
        notes: "",
      }
    }
  })

  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(form))
      setSavedAt(Date.now())
    } catch {}
  }, [storageKey, form])

  const lines = useMemo(() => transcript.filter(Boolean), [transcript])
  const retailSuggestions = useMemo(() => extractRetailInfo(lines), [lines])

  const notesCapturedRef = useRef<number>(0)
  useEffect(() => {
    notesCapturedRef.current = lines.length
  }, [])

  useEffect(() => {
    const curCount = notesCapturedRef.current
    if (lines.length > curCount) {
      const newLines = lines.slice(curCount)
      const toAppend = newLines.map((l) => `• ${l}`).join("\n")
      if (toAppend.trim().length > 0) {
        setForm((p) => ({
          ...p,
          notes: p.notes ? `${p.notes}\n${toAppend}` : toAppend,
        }))
      }
      notesCapturedRef.current = lines.length
    }
  }, [lines])

  const hasAnySuggestion = Object.keys(retailSuggestions).length > 0

  function applySuggestion<K extends keyof RetailIntake>(key: K, value: string) {
    if (!value) return
    setForm((p) => ({ ...p, [key]: value }))
  }

  function applyAllSuggestions() {
    setForm((p) => ({
      ...p,
      ...Object.entries(retailSuggestions).reduce(
        (acc, [key, value]) => {
          if (value && !p[key as keyof RetailIntake]) {
            acc[key as keyof RetailIntake] = value
          }
          return acc
        },
        {} as Partial<RetailIntake>,
      ),
    }))
  }

  const summary = useMemo(() => {
    const linesOut: string[] = []
    if (form.customerRequest) linesOut.push(`Request: ${form.customerRequest}`)
    if (form.productInterest) linesOut.push(`Product Interest: ${form.productInterest}`)
    if (form.budgetRange) linesOut.push(`Budget: ${form.budgetRange}`)
    if (form.orderNumber) linesOut.push(`Order #: ${form.orderNumber}`)
    if (form.returnReason) linesOut.push(`Return Reason: ${form.returnReason}`)
    if (form.paymentMethod) linesOut.push(`Payment: ${form.paymentMethod}`)
    if (form.deliveryPreference) linesOut.push(`Delivery: ${form.deliveryPreference}`)
    if (form.notes) linesOut.push(`Notes:\n${form.notes}`)
    return linesOut.join("\n")
  }, [form])

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary)
    } catch {}
  }

  return (
    <div className="space-y-4">
      {hasAnySuggestion && (
        <div className="rounded-lg border border-green-500/20 bg-neutral-900 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10">
                <ShoppingBag className="h-3 w-3 text-green-400" />
              </div>
              <span className="text-sm font-medium text-white">Retail AI Suggestions</span>
            </div>
            <button
              className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs text-green-300 hover:bg-green-500/20"
              onClick={applyAllSuggestions}
            >
              Apply All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {retailSuggestions.orderNumber && (
              <button
                className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs text-green-300 hover:bg-green-500/20"
                onClick={() => applySuggestion("orderNumber", retailSuggestions.orderNumber!)}
              >
                Order: {retailSuggestions.orderNumber}
              </button>
            )}
            {retailSuggestions.budgetRange && (
              <button
                className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs text-green-300 hover:bg-green-500/20"
                onClick={() => applySuggestion("budgetRange", retailSuggestions.budgetRange!)}
              >
                Budget: {retailSuggestions.budgetRange}
              </button>
            )}
            {retailSuggestions.paymentMethod && (
              <button
                className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs text-green-300 hover:bg-green-500/20"
                onClick={() => applySuggestion("paymentMethod", retailSuggestions.paymentMethod!)}
              >
                Payment: {retailSuggestions.paymentMethod}
              </button>
            )}
            {retailSuggestions.loyaltyNumber && (
              <button
                className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs text-green-300 hover:bg-green-500/20"
                onClick={() => applySuggestion("loyaltyNumber", retailSuggestions.loyaltyNumber!)}
              >
                Loyalty: {retailSuggestions.loyaltyNumber}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Customer Request</label>
            <Textarea
              value={form.customerRequest}
              onChange={(e) => setForm((p) => ({ ...p, customerRequest: e.target.value }))}
              placeholder="What is the customer looking for? Purchase, return, exchange, information..."
              className="min-h-[100px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Product Interest</label>
            <Input
              value={form.productInterest}
              onChange={(e) => setForm((p) => ({ ...p, productInterest: e.target.value }))}
              placeholder="Specific products, categories, or brands"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Budget Range</label>
            <Input
              value={form.budgetRange}
              onChange={(e) => setForm((p) => ({ ...p, budgetRange: e.target.value }))}
              placeholder="$100 - $500"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Order Number</label>
            <Input
              value={form.orderNumber}
              onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value.toUpperCase() }))}
              placeholder="ORD-123456"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Loyalty/Rewards Number</label>
            <Input
              value={form.loyaltyNumber}
              onChange={(e) => setForm((p) => ({ ...p, loyaltyNumber: e.target.value.toUpperCase() }))}
              placeholder="MEMBER123456"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Return Reason</label>
            <Input
              value={form.returnReason}
              onChange={(e) => setForm((p) => ({ ...p, returnReason: e.target.value }))}
              placeholder="Defective, wrong size, changed mind..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Exchange Item</label>
            <Input
              value={form.exchangeItem}
              onChange={(e) => setForm((p) => ({ ...p, exchangeItem: e.target.value }))}
              placeholder="What they want to exchange for"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Payment Method</label>
            <Input
              value={form.paymentMethod}
              onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
              placeholder="Credit card, PayPal, cash..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Delivery Preference</label>
            <Input
              value={form.deliveryPreference}
              onChange={(e) => setForm((p) => ({ ...p, deliveryPreference: e.target.value }))}
              placeholder="Standard, express, pickup, curbside..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Delivery Address</label>
            <Textarea
              value={form.deliveryAddress}
              onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
              placeholder="Full delivery address with special instructions..."
              className="min-h-[80px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Special Requests</label>
            <Textarea
              value={form.specialRequests}
              onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
              placeholder="Gift wrapping, personalization, special handling..."
              className="min-h-[80px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">
              Live Notes
              <span className="ml-2 text-xs text-neutral-400">(Auto-captured from conversation)</span>
            </label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Live notes will appear here automatically..."
              className="h-[140px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none overflow-y-auto"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2">
        <div className="text-xs text-neutral-400">
          {savedAt ? (
            <span className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Saved {new Date(savedAt).toLocaleTimeString()}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
              Ready
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
            onClick={copySummary}
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
          <button
            className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
            onClick={() => setSavedAt(Date.now())}
          >
            <Save className="h-3 w-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
