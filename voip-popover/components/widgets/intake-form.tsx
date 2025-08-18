"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Lightbulb, Save, UserCheck, Mail, Phone, Plus } from "lucide-react"

type Intake = {
  issue: string
  po: string
  onsiteContact: string
  onsitePhone: string
  onsiteEmail: string
  window: string
  accessNotes: string
  additionalNames: string // comma-separated
  notes: string
}

type ProfileUpdates = {
  name?: string
  phone?: string
  email?: string
  additionalNames?: string[]
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean))) as T[]
}

function getInitials(n: string): string {
  const parts = n.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase().slice(0, 2)
}

// Basic signal extractors from transcript

function extractPhones(lines: string[]): string[] {
  const text = " " + lines.join(" ") + " "
  const re = /(\+?\d[\d\s().-]{6,}\d)/g
  const out: string[] = []
  let m
  while ((m = re.exec(text))) {
    const raw = m[1].trim()
    // Normalize a bit (keep digits and leading +)
    const cleaned = raw.replace(/(?!^\+)[^\d]/g, "")
    // Keep formatting light for UX; show human-readable with spaces
    out.push(raw.length >= 7 ? raw : cleaned)
  }
  return uniq(out)
}

function extractEmails(lines: string[]): string[] {
  const text = lines.join(" ")
  const re = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?![^<]*>)/g
  const out: string[] = []
  let m
  while ((m = re.exec(text))) out.push(m[1].trim())
  return uniq(out)
}

const TITLE_WORDS = ["Mr\\.", "Mrs\\.", "Ms\\.", "Dr\\.", "Prof\\.", "Sr\\.", "Jr\\."]
const NAME_RE = new RegExp(
  `\\b(?:${TITLE_WORDS.join("|")})\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\b|\\b[A-Z][a-z]+\\s+[A-Z][a-z]+\\b`,
  "g",
)

function extractNames(lines: string[]): string[] {
  const text = lines.join(" ")
  const explicitLeadIns = [
    /\b(?:this is|it's|it is|i am|i'm|my name is|name's|speaking is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ]
  const found: string[] = []

  // Titles and "First Last"
  const re = NAME_RE
  let m
  while ((m = re.exec(text))) {
    found.push(m[0].trim())
  }

  // Lead-in phrases
  for (const rex of explicitLeadIns) {
    let mm
    while ((mm = rex.exec(text))) {
      found.push(mm[1].trim())
    }
  }

  // Split joined couples: "Mr. Clark & Mrs. Daniela"
  const couples = text.split(/&|and/gi)
  couples.forEach((seg) => {
    const mm = seg.match(NAME_RE)
    if (mm) mm.forEach((n) => found.push(n.trim()))
  })

  // Keep readable names: at least one capitalized word
  const filtered = found
    .map((n) => n.replace(/\s+/g, " ").trim())
    .filter((n) => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(n) || TITLE_WORDS.some((t) => new RegExp(t).test(n)))

  return uniq(filtered).slice(0, 6)
}

function extractAccessCode(lines: string[]): string | null {
  const text = lines.join(" ")
  const m = text.match(/\b(?:access\s*code|gate\s*code|code)\s*(?:is|:)?\s*([0-9]{3,8})\b/i)
  return m ? m[1] : null
}

function extractWindow(lines: string[]): string | null {
  const text = lines.join(" ")
  const byTime = text.match(/\bby\s+(\d{1,2}(?::\d{2})?\s?(?:am|pm))\b/i)
  if (byTime) return `By ${byTime[1].toUpperCase()}`
  const range = text.match(/\b(\d{1,2})\s?[-–]\s?(\d{1,2})\s?(am|pm)\b/i)
  if (range) return `${range[1]}–${range[2]} ${range[3].toUpperCase()}`
  return null
}

function extractPO(lines: string[]): string | null {
  const text = lines.join(" ")
  const m = text.match(/\b(?:po|purchase\s*order)\s*(?:#|:)?\s*([A-Za-z0-9-]{3,})\b/i)
  return m ? m[1] : null
}

export default function IntakeForm({
  storageKey = "voip:intake:generic",
  transcript = [],
  onApplyProfile,
}: {
  storageKey?: string
  transcript?: string[]
  onApplyProfile?: (u: ProfileUpdates) => void
}) {
  const [form, setForm] = useState<Intake>(() => {
    if (typeof window === "undefined")
      return {
        issue: "",
        po: "",
        onsiteContact: "",
        onsitePhone: "",
        onsiteEmail: "",
        window: "",
        accessNotes: "",
        additionalNames: "",
        notes: "",
      }
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? (JSON.parse(raw) as Partial<Intake>) : {}
      return {
        issue: safeStr(parsed?.issue),
        po: safeStr(parsed?.po),
        onsiteContact: safeStr(parsed?.onsiteContact),
        onsitePhone: safeStr(parsed?.onsitePhone),
        onsiteEmail: safeStr(parsed?.onsiteEmail),
        window: safeStr(parsed?.window),
        accessNotes: safeStr(parsed?.accessNotes),
        additionalNames: safeStr(parsed?.additionalNames),
        notes: safeStr(parsed?.notes),
      }
    } catch {
      return {
        issue: "",
        po: "",
        onsiteContact: "",
        onsitePhone: "",
        onsiteEmail: "",
        window: "",
        accessNotes: "",
        additionalNames: "",
        notes: "",
      }
    }
  })
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Persist form safely (controlled values are always defined strings)
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(form))
      setSavedAt(Date.now())
    } catch {}
  }, [storageKey, form])

  // Suggestions block from transcript
  const lines = useMemo(() => transcript.filter(Boolean), [transcript])

  const notesCapturedRef = useRef<number>(0)
  // Initialize capture pointer so we only append future lines, not historical ones on mount
  useEffect(() => {
    notesCapturedRef.current = lines.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Append newly completed transcript lines to notes
  useEffect(() => {
    const curCount = notesCapturedRef.current
    if (lines.length > curCount) {
      const newLines = lines.slice(curCount)
      // Format as bullet lines
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

  const nameSuggestions = useMemo(() => extractNames(lines), [lines])
  const phoneSuggestions = useMemo(() => extractPhones(lines), [lines])
  const emailSuggestions = useMemo(() => extractEmails(lines), [lines])

  const code = useMemo(() => extractAccessCode(lines), [lines])
  const windowSuggestion = useMemo(() => extractWindow(lines), [lines])
  const poSuggestion = useMemo(() => extractPO(lines), [lines])

  const issueSuggestion = useMemo(() => {
    const guess = lines.slice(-2).join(" ").trim()
    return guess || ""
  }, [lines])

  const hasAnySuggestion =
    !!issueSuggestion ||
    !!poSuggestion ||
    nameSuggestions.length > 0 ||
    phoneSuggestions.length > 0 ||
    emailSuggestions.length > 0 ||
    !!windowSuggestion ||
    !!code

  function applySuggestion<K extends keyof Intake>(key: K, value: string) {
    if (!value) return
    setForm((p) => ({ ...p, [key]: value }))
  }

  function addAdditionalName(n: string) {
    if (!n) return
    setForm((p) => {
      const existing = p.additionalNames
        ? p.additionalNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
      const next = uniq([...existing, n]).join(", ")
      return { ...p, additionalNames: next }
    })
  }

  function applyAll() {
    setForm((p) => ({
      ...p,
      issue: p.issue || issueSuggestion || "",
      po: p.po || poSuggestion || "",
      onsiteContact: p.onsiteContact || nameSuggestions[0] || "",
      onsitePhone: p.onsitePhone || phoneSuggestions[0] || "",
      onsiteEmail: p.onsiteEmail || emailSuggestions[0] || "",
      window: p.window || windowSuggestion || "",
      accessNotes: p.accessNotes || (code ? `Gate/access code: ${code}` : ""),
      additionalNames: p.additionalNames || nameSuggestions.slice(1).join(", "),
    }))
  }

  function applyToProfile(primaryIndex = 0) {
    const name = nameSuggestions[primaryIndex]
    const u: ProfileUpdates = {
      name: name || undefined,
      phone: phoneSuggestions[0] || undefined,
      email: emailSuggestions[0] || undefined,
      additionalNames: nameSuggestions.length > 1 ? nameSuggestions.filter((_, i) => i !== primaryIndex) : undefined,
    }
    onApplyProfile?.(u)
  }

  const summary = useMemo(() => {
    const linesOut: string[] = []
    if (form.issue) linesOut.push(`Issue: ${form.issue}`)
    if (form.po) linesOut.push(`PO: ${form.po}`)
    if (form.onsiteContact) linesOut.push(`Onsite: ${form.onsiteContact}`)
    if (form.onsitePhone) linesOut.push(`Phone: ${form.onsitePhone}`)
    if (form.onsiteEmail) linesOut.push(`Email: ${form.onsiteEmail}`)
    if (form.window) linesOut.push(`Window: ${form.window}`)
    if (form.accessNotes) linesOut.push(`Access: ${form.accessNotes}`)
    if (form.additionalNames) linesOut.push(`Additional contacts: ${form.additionalNames}`)
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
        /* Removed gradients, made more compact with Thorbis blue accents */
        <div className="rounded-lg border border-blue-500/20 bg-neutral-900 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                <Lightbulb className="h-3 w-3 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-white">AI Suggestions</span>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                onClick={applyAll}
              >
                Apply All
              </button>
              <button
                className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                onClick={() => applyToProfile(0)}
              >
                <UserCheck className="h-3 w-3 mr-1 inline" />
                To Profile
              </button>
            </div>
          </div>

          {nameSuggestions.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-blue-300">Names</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {nameSuggestions.map((n, i) => (
                  <div
                    key={n + i}
                    className="group flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 hover:border-blue-500/50"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs font-medium text-blue-300">
                      {getInitials(n)}
                    </div>
                    <span className="text-xs text-neutral-200">{n}</span>
                    <div className="flex items-center">
                      <button
                        className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-blue-300"
                        onClick={() => applySuggestion("onsiteContact", n)}
                      >
                        <UserCheck className="h-3 w-3" />
                      </button>
                      <button
                        className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-blue-300"
                        onClick={() => addAdditionalName(n)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phoneSuggestions.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-blue-300">Phones</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {phoneSuggestions.map((p, i) => (
                  <div
                    key={p + i}
                    className="group flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 hover:border-blue-500/50"
                  >
                    <Phone className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-neutral-200">{p}</span>
                    <button
                      className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-blue-300"
                      onClick={() => applySuggestion("onsitePhone", p)}
                    >
                      <UserCheck className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {emailSuggestions.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-blue-300">Emails</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {emailSuggestions.map((e, i) => (
                  <div
                    key={e + i}
                    className="group flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 hover:border-blue-500/50"
                  >
                    <Mail className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-neutral-200">{e}</span>
                    <button
                      className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-blue-300"
                      onClick={() => applySuggestion("onsiteEmail", e)}
                    >
                      <UserCheck className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {issueSuggestion && !form.issue && (
              <button
                className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                onClick={() => applySuggestion("issue", issueSuggestion)}
              >
                Use Issue
              </button>
            )}
            {poSuggestion && !form.po && (
              <button
                className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                onClick={() => applySuggestion("po", poSuggestion)}
              >
                Use PO
              </button>
            )}
            {windowSuggestion && !form.window && (
              <button
                className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                onClick={() => applySuggestion("window", windowSuggestion)}
              >
                Use Window
              </button>
            )}
            {code && !form.accessNotes && (
              <button
                className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                onClick={() => applySuggestion("accessNotes", `Gate/access code: ${code}`)}
              >
                Use Code
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Issue Description</label>
            <Textarea
              value={form.issue}
              onChange={(e) => setForm((p) => ({ ...p, issue: e.target.value }))}
              placeholder={
                issueSuggestion && !form.issue ? issueSuggestion : "Describe symptoms, error codes, business impact..."
              }
              className="min-h-[100px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Onsite Contact</label>
            <Input
              value={form.onsiteContact}
              onChange={(e) => setForm((p) => ({ ...p, onsiteContact: e.target.value }))}
              placeholder={nameSuggestions[0] && !form.onsiteContact ? nameSuggestions[0] : "Full name"}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Onsite Phone</label>
            <Input
              value={form.onsitePhone}
              onChange={(e) => setForm((p) => ({ ...p, onsitePhone: e.target.value }))}
              placeholder={phoneSuggestions[0] && !form.onsitePhone ? phoneSuggestions[0] : "+1 (555) 123-4567"}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Onsite Email</label>
            <Input
              type="email"
              value={form.onsiteEmail}
              onChange={(e) => setForm((p) => ({ ...p, onsiteEmail: e.target.value }))}
              placeholder={emailSuggestions[0] && !form.onsiteEmail ? emailSuggestions[0] : "contact@company.com"}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Preferred Time Window</label>
            <Input
              value={form.window}
              onChange={(e) => setForm((p) => ({ ...p, window: e.target.value }))}
              placeholder="e.g., Today 2–4 PM or Tomorrow morning"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Purchase Order</label>
            <Input
              value={form.po}
              onChange={(e) => setForm((p) => ({ ...p, po: e.target.value }))}
              placeholder="PO-12345 (optional)"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Access Notes</label>
            <Textarea
              value={form.accessNotes}
              onChange={(e) => setForm((p) => ({ ...p, accessNotes: e.target.value }))}
              placeholder={
                code && !form.accessNotes
                  ? `Gate/access code: ${code}`
                  : "Parking instructions, gate codes, hazards, special access requirements..."
              }
              className="min-h-[80px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">
              Live Notes
              <span className="ml-2 text-xs text-neutral-400">(Auto-captured from conversation • Editable)</span>
            </label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Live notes will appear here automatically as the conversation progresses. You can edit them at any time..."
              className="h-[140px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none overflow-y-auto"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2">
        <div className="text-xs text-neutral-400">
          {savedAt ? (
            <span className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
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
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
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
