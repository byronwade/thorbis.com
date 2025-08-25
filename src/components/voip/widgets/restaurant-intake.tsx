"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Save, UtensilsCrossed, Users, Calendar, Clock } from "lucide-react"

type RestaurantIntake = {
  reservationRequest: string
  partySize: string
  preferredDate: string
  preferredTime: string
  alternativeDate: string
  alternativeTime: string
  specialOccasion: string
  dietaryRestrictions: string
  seatingPreference: string
  contactPhone: string
  contactEmail: string
  specialRequests: string
  loyaltyMember: string
  referralSource: string
  notes: string
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function extractRestaurantInfo(lines: string[]): Partial<RestaurantIntake> {
  const text = lines.join(" ")
  const extracted: Partial<RestaurantIntake> = {}

  // Extract party size
  const partySizeMatch = text.match(/\b(?:party of|table for|group of|for)\s*(\d{1,2})\b/i)
  if (partySizeMatch) extracted.partySize = partySizeMatch[1]

  // Extract dates
  const dateMatch = text.match(
    /\b(?:on|for)\s*((?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,2})\b/i,
  )
  if (dateMatch) extracted.preferredDate = dateMatch[1]

  // Extract times
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i)
  if (timeMatch) extracted.preferredTime = timeMatch[1]

  // Extract special occasions
  const occasions = ["birthday", "anniversary", "date night", "business", "celebration", "graduation", "engagement"]
  const occasionMatch = occasions.find((occasion) => text.toLowerCase().includes(occasion))
  if (occasionMatch) extracted.specialOccasion = occasionMatch

  // Extract dietary restrictions
  const restrictions = [
    "vegetarian",
    "vegan",
    "gluten free",
    "dairy free",
    "nut allergy",
    "shellfish allergy",
    "kosher",
    "halal",
  ]
  const restrictionMatches = restrictions.filter((restriction) => text.toLowerCase().includes(restriction))
  if (restrictionMatches.length > 0) extracted.dietaryRestrictions = restrictionMatches.join(", ")

  // Extract seating preferences
  const seatingPrefs = ["booth", "table", "bar", "patio", "window", "quiet", "private"]
  const seatingMatch = seatingPrefs.find((pref) => text.toLowerCase().includes(pref))
  if (seatingMatch) extracted.seatingPreference = seatingMatch

  return extracted
}

export default function RestaurantIntake({
  storageKey = "voip:intake:restaurant",
  transcript = [],
}: {
  storageKey?: string
  transcript?: string[]
}) {
  const [form, setForm] = useState<RestaurantIntake>(() => {
    if (typeof window === "undefined") {
      return {
        reservationRequest: "",
        partySize: "",
        preferredDate: "",
        preferredTime: "",
        alternativeDate: "",
        alternativeTime: "",
        specialOccasion: "",
        dietaryRestrictions: "",
        seatingPreference: "",
        contactPhone: "",
        contactEmail: "",
        specialRequests: "",
        loyaltyMember: "",
        referralSource: "",
        notes: "",
      }
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? (JSON.parse(raw) as Partial<RestaurantIntake>) : {}
      return {
        reservationRequest: safeStr(parsed?.reservationRequest),
        partySize: safeStr(parsed?.partySize),
        preferredDate: safeStr(parsed?.preferredDate),
        preferredTime: safeStr(parsed?.preferredTime),
        alternativeDate: safeStr(parsed?.alternativeDate),
        alternativeTime: safeStr(parsed?.alternativeTime),
        specialOccasion: safeStr(parsed?.specialOccasion),
        dietaryRestrictions: safeStr(parsed?.dietaryRestrictions),
        seatingPreference: safeStr(parsed?.seatingPreference),
        contactPhone: safeStr(parsed?.contactPhone),
        contactEmail: safeStr(parsed?.contactEmail),
        specialRequests: safeStr(parsed?.specialRequests),
        loyaltyMember: safeStr(parsed?.loyaltyMember),
        referralSource: safeStr(parsed?.referralSource),
        notes: safeStr(parsed?.notes),
      }
    } catch {
      return {
        reservationRequest: "",
        partySize: "",
        preferredDate: "",
        preferredTime: "",
        alternativeDate: "",
        alternativeTime: "",
        specialOccasion: "",
        dietaryRestrictions: "",
        seatingPreference: "",
        contactPhone: "",
        contactEmail: "",
        specialRequests: "",
        loyaltyMember: "",
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
  const restaurantSuggestions = useMemo(() => extractRestaurantInfo(lines), [lines])

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

  const hasAnySuggestion = Object.keys(restaurantSuggestions).length > 0

  function applySuggestion<K extends keyof RestaurantIntake>(key: K, value: string) {
    if (!value) return
    setForm((p) => ({ ...p, [key]: value }))
  }

  function applyAllSuggestions() {
    setForm((p) => ({
      ...p,
      ...Object.entries(restaurantSuggestions).reduce(
        (acc, [key, value]) => {
          if (value && !p[key as keyof RestaurantIntake]) {
            acc[key as keyof RestaurantIntake] = value
          }
          return acc
        },
        {} as Partial<RestaurantIntake>,
      ),
    }))
  }

  const summary = useMemo(() => {
    const linesOut: string[] = []
    if (form.reservationRequest) linesOut.push(`Request: ${form.reservationRequest}`)
    if (form.partySize) linesOut.push(`Party Size: ${form.partySize}`)
    if (form.preferredDate) linesOut.push(`Date: ${form.preferredDate}`)
    if (form.preferredTime) linesOut.push(`Time: ${form.preferredTime}`)
    if (form.specialOccasion) linesOut.push(`Occasion: ${form.specialOccasion}`)
    if (form.dietaryRestrictions) linesOut.push(`Dietary: ${form.dietaryRestrictions}`)
    if (form.seatingPreference) linesOut.push(`Seating: ${form.seatingPreference}`)
    if (form.contactPhone) linesOut.push(`Phone: ${form.contactPhone}`)
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
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                <UtensilsCrossed className="h-3 w-3 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-white">Restaurant AI Suggestions</span>
            </div>
            <button
              className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
              onClick={applyAllSuggestions}
            >
              Apply All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurantSuggestions.partySize && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("partySize", restaurantSuggestions.partySize!)}
              >
                <Users className="h-3 w-3 mr-1 inline" />
                Party of {restaurantSuggestions.partySize}
              </button>
            )}
            {restaurantSuggestions.preferredDate && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("preferredDate", restaurantSuggestions.preferredDate!)}
              >
                <Calendar className="h-3 w-3 mr-1 inline" />
                {restaurantSuggestions.preferredDate}
              </button>
            )}
            {restaurantSuggestions.preferredTime && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("preferredTime", restaurantSuggestions.preferredTime!)}
              >
                <Clock className="h-3 w-3 mr-1 inline" />
                {restaurantSuggestions.preferredTime}
              </button>
            )}
            {restaurantSuggestions.specialOccasion && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("specialOccasion", restaurantSuggestions.specialOccasion!)}
              >
                Occasion: {restaurantSuggestions.specialOccasion}
              </button>
            )}
            {restaurantSuggestions.dietaryRestrictions && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("dietaryRestrictions", restaurantSuggestions.dietaryRestrictions!)}
              >
                Dietary: {restaurantSuggestions.dietaryRestrictions}
              </button>
            )}
            {restaurantSuggestions.seatingPreference && (
              <button
                className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
                onClick={() => applySuggestion("seatingPreference", restaurantSuggestions.seatingPreference!)}
              >
                Seating: {restaurantSuggestions.seatingPreference}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Reservation Request</label>
            <Textarea
              value={form.reservationRequest}
              onChange={(e) => setForm((p) => ({ ...p, reservationRequest: e.target.value }))}
              placeholder="What type of reservation or dining experience are they looking for?"
              className="min-h-[100px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Party Size</label>
            <Input
              type="number"
              value={form.partySize}
              onChange={(e) => setForm((p) => ({ ...p, partySize: e.target.value }))}
              placeholder="2"
              min="1"
              max="20"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Preferred Date</label>
            <Input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Preferred Time</label>
            <Input
              type="time"
              value={form.preferredTime}
              onChange={(e) => setForm((p) => ({ ...p, preferredTime: e.target.value }))}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Alternative Date</label>
            <Input
              type="date"
              value={form.alternativeDate}
              onChange={(e) => setForm((p) => ({ ...p, alternativeDate: e.target.value }))}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Special Occasion</label>
            <Input
              value={form.specialOccasion}
              onChange={(e) => setForm((p) => ({ ...p, specialOccasion: e.target.value }))}
              placeholder="Birthday, anniversary, date night..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Seating Preference</label>
            <Input
              value={form.seatingPreference}
              onChange={(e) => setForm((p) => ({ ...p, seatingPreference: e.target.value }))}
              placeholder="Booth, patio, window, quiet..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Dietary Restrictions</label>
            <Input
              value={form.dietaryRestrictions}
              onChange={(e) => setForm((p) => ({ ...p, dietaryRestrictions: e.target.value }))}
              placeholder="Vegetarian, gluten-free, allergies..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Contact Phone</label>
            <Input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Contact Email</label>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              placeholder="guest@email.com"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Special Requests</label>
            <Textarea
              value={form.specialRequests}
              onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
              placeholder="High chair needed, wheelchair accessible, cake service, decorations..."
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
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
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
            className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700"
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
