"use client"

import * as React from "react"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Calendar } from "@components/ui/calendar"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@components/ui/select"
import { ScrollArea } from "@components/ui/scroll-area"
import { Badge } from "@components/ui/badge"
import { CalendarIcon, Clock, Copy, Check, Send } from 'lucide-react'
import { cn } from "@lib/utils"

type Participant = { id: string; name: string }

type SchedulingPanelProps = {
mail: { subject: string; fromName: string } | null
participants: Participant[]
onPropose?: (draft: string) => void
}

const DURATIONS = [15, 30, 45, 60] as const
const WORK_START = 9 // 9 AM
const WORK_END = 17 // 5 PM (latest meeting end can be 17:59)

export function SchedulingPanel({
mail,
participants,
onPropose,
}: SchedulingPanelProps) {
const defaultTitle =
  mail?.subject ? `Call: ${mail.subject}` : "Call regarding your message"
const [title, setTitle] = React.useState(defaultTitle)
const [duration, setDuration] = React.useState<number>(30)
const [zone, setZone] = React.useState<string>(getDefaultTimeZone())
const [day, setDay] = React.useState<Date>(startOfDay(new Date()))
const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

// keep title synced when mail changes
React.useEffect(() => {
  if (mail?.subject) setTitle(`Call: ${mail.subject}`)
}, [mail?.subject])

const suggested = React.useMemo(() => {
  return findSuggestedSlots({
    participants,
    durationMinutes: duration,
    from: new Date(),
    timeZone: zone,
    maxSuggestions: 3,
  })
}, [participants, duration, zone])

const busyPreview = React.useMemo(() => {
  return participants.map((p) => ({
    p,
    busy: generateBusyForDay(p, day),
  }))
}, [participants, day])

function copyOptions() {
  const text = proposalText({ title, zone, duration, slots: suggested })
  navigator.clipboard?.writeText(text).then(() => {
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 1500)
  })
}

function copySingle(idx: number) {
  const slot = suggested[idx]
  if (!slot) return
  const text = singleSlotText({ title, zone, duration, slot })
  navigator.clipboard?.writeText(text).then(() => {
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1500)
  })
}

function proposeAll() {
  const text = proposalText({ title, zone, duration, slots: suggested })
  onPropose?.(text)
}

function proposeSingle(idx: number) {
  const slot = suggested[idx]
  if (!slot) return
  const text = singleSlotText({ title, zone, duration, slot })
  onPropose?.(text)
}

return (
  <div className="flex min-h-0 flex-1 flex-col">
    <ScrollArea className="flex-1">
      <div className="space-y-3 p-3">
        <div className="space-y-1.5">
          <Label htmlFor="sched-title">Title</Label>
          <Input
            id="sched-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select
              value={String(duration)}
              onValueChange={(v) => setDuration(parseInt(v, 10))}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Time zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Time zone" />
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {getTimeZones().map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Availability preview
          </Label>
          <div className="flex flex-col gap-2 rounded-md border p-2">
            <Calendar
              mode="single"
              selected={day}
              onSelect={(d) => d && setDay(startOfDay(d))}
              className="mx-auto"
            />
            <div className="space-y-2">
              {busyPreview.map(({ p, busy }) => (
                <ParticipantDay key={p.id} name={p.name} busy={busy} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Suggested times
          </Label>
          <div className="space-y-2">
            {suggested.length === 0 && (
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                No mutual availability found in the next two weeks within
                working hours.
              </div>
            )}
            {suggested.map((slot, i) => {
              const label = formatRange(slot, duration, zone)
              return (
                <Card key={i}>
                  <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                    <div className="text-sm">{label}</div>
                    <div className="sm:ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copySingle(i)}
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => proposeSingle(i)}
                        title="Insert into compose"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Propose
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {suggested.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={proposeAll}>
                <Send className="mr-2 h-4 w-4" />
                Propose all 3
              </Button>
              <Button variant="outline" size="sm" onClick={copyOptions}>
                {copiedIndex === -1 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy all
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  </div>
)
}

/* ---------- Availability preview row ---------- */

function ParticipantDay({
name,
busy,
}: {
name: string
busy: Array<{ start: Date; end: Date }>
}) {
const windows = toAvailabilityWindows(busy)

return (
  <div className="rounded-md border p-2">
    <div className="mb-1 flex items-center gap-2">
      <Badge variant="secondary" className="text-[10px]">
        {name}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {windows.length > 0 ? "Available windows" : "No availability in hours"}
      </span>
    </div>
    <div className="flex flex-wrap gap-1">
      {windows.map((w, idx) => (
        <span
          key={idx}
          className={cn(
            "rounded-md border bg-emerald-500/10 px-2 py-0.5 text-xs",
            "border-emerald-200 text-emerald-700"
          )}
        >
          {formatHHMM(w.start)}–{formatHHMM(w.end)}
        </span>
      ))}
      {windows.length === 0 && (
        <span className="rounded-md border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
          None 9:00–17:00
        </span>
      )}
    </div>
    {busy.length > 0 && (
      <div className="mt-1 flex flex-wrap gap-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Busy:
        </span>
        {busy.map((b, i) => (
          <span
            key={i}
            className="rounded-md border bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-700"
          >
            {formatHHMM(b.start)}–{formatHHMM(b.end)}
          </span>
        ))}
      </div>
    )}
  </div>
)
}

/* ---------- Suggestion engine (demo) ---------- */

function findSuggestedSlots({
participants,
durationMinutes,
from,
timeZone,
maxSuggestions = 3,
}: {
participants: Participant[]
durationMinutes: number
from: Date
timeZone: string
maxSuggestions?: number
}): Date[] {
const suggestions: Date[] = []
const start = new Date(from.getTime() + 5 * 60 * 1000) // +5 min
let cursor = startOfDay(start)

// search up to 14 days ahead
for (let d = 0; d < 14 && suggestions.length < maxSuggestions; d++) {
  const dayStart = setHours(cursor, WORK_START)
  const dayEnd = setHours(cursor, WORK_END)

  // generate busy for each participant for this day (deterministic-ish)
  const busyMap = new Map<string, Array<{ start: Date; end: Date }>>()
  for (const p of participants) {
    busyMap.set(p.id, generateBusyForDay(p, cursor))
  }

  // step through 30-min increments
  for (
    let t = new Date(
      Math.max(dayStart.getTime(), roundUpTo30(dayStart).getTime())
    );
    t < dayEnd && suggestions.length < maxSuggestions;
    t = new Date(t.getTime() + 30 * 60 * 1000)
  ) {
    if (d === 0 && t < start) continue // don't suggest in the past today

    const slotEnd = new Date(t.getTime() + durationMinutes * 60 * 1000)
    if (slotEnd > dayEnd) break

    let ok = true
    for (const p of participants) {
      const busy = busyMap.get(p.id) || []
      if (!isFree(busy, t, slotEnd)) {
        ok = false
        break
      }
    }
    if (ok) {
      suggestions.push(toTZ(t, timeZone))
    }
  }

  cursor = addDays(cursor, 1)
}
return suggestions.slice(0, maxSuggestions)
}

function isFree(
busy: Array<{ start: Date; end: Date }>,
start: Date,
end: Date
) {
return !busy.some((b) => overlaps(b.start, b.end, start, end))
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
return aStart < bEnd && bStart < aEnd
}

function generateBusyForDay(
p: Participant,
day: Date
): Array<{ start: Date; end: Date }> {
// deterministic pseudo-random from id + yyyymmdd
const seed = hash(`${p.id}-${fmtYYYYMMDD(day)}`)
const blocks: Array<{ start: Date; end: Date }> = []

// Two blocks: late morning, mid afternoon
const morningStartH = 9 + (seed % 3) // 9..11
const morningDur = 30 + ((seed >> 3) % 3) * 30 // 30/60/90
const afternoonStartH = 13 + ((seed >> 5) % 3) // 13..15
const afternoonDur = 30 + ((seed >> 7) % 3) * 30 // 30/60/90

const m1 = setMinutes(setHours(startOfDay(day), morningStartH), (seed % 2) * 30)
blocks.push({ start: m1, end: new Date(m1.getTime() + morningDur * 60 * 1000) })

const a1 = setMinutes(setHours(startOfDay(day), afternoonStartH), ((seed >> 2) % 2) * 30)
blocks.push({ start: a1, end: new Date(a1.getTime() + afternoonDur * 60 * 1000) })

return blocks
}

/* ---------- Formatting helpers ---------- */

function formatRange(start: Date, durationMin: number, timeZone: string) {
const end = new Date(start.getTime() + durationMin * 60 * 1000)
const d = new Intl.DateTimeFormat("en-US", {
  timeZone,
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(start)
const tStart = new Intl.DateTimeFormat("en-US", {
  timeZone,
  hour: "numeric",
  minute: "2-digit",
}).format(start)
const tEnd = new Intl.DateTimeFormat("en-US", {
  timeZone,
  hour: "numeric",
  minute: "2-digit",
}).format(end)
return `${d} · ${tStart}–${tEnd} (${timeZone})`
}

function formatHHMM(d: Date) {
return `${String(d.getHours()).padStart(2, "0")}:${String(
  d.getMinutes()
).padStart(2, "0")}`
}

function proposalText({
title,
zone,
duration,
slots,
}: {
title: string
zone: string
duration: number
slots: Date[]
}) {
const lines = slots.map((s, i) => `${i + 1}. ${formatRange(s, duration, zone)}`)
return [
  `Hi —`,
  ``,
  `I can meet for "${title}". Here are a few options (${duration} min, ${zone}):`,
  ...lines.map((l) => `• ${l}`),
  ``,
  `Let me know which works best, or suggest alternatives.`,
].join("\n")
}

function singleSlotText({
title,
zone,
duration,
slot,
}: {
title: string
zone: string
duration: number
slot: Date
}) {
return [
  `Hi —`,
  ``,
  `I can meet for "${title}" at ${formatRange(slot, duration, zone)}.`,
  ``,
  `If that doesn’t work, I can share a few more options.`,
].join("\n")
}

/* ---------- Date helpers ---------- */

function startOfDay(d: Date) {
const x = new Date(d)
x.setHours(0, 0, 0, 0)
return x
}
function addDays(d: Date, n: number) {
const x = new Date(d)
x.setDate(x.getDate() + n)
return x
}
function setHours(d: Date, h: number) {
const x = new Date(d)
x.setHours(h, 0, 0, 0)
return x
}
function setMinutes(d: Date, m: number) {
const x = new Date(d)
x.setMinutes(m, 0, 0)
return x
}
function roundUpTo30(d: Date) {
const x = new Date(d)
const mins = x.getMinutes()
const rounded = mins % 30 === 0 ? mins : mins + (30 - (mins % 30))
x.setMinutes(rounded, 0, 0)
return x
}
function toTZ(d: Date, timeZone: string) {
// We format to TZ for display; the Date remains in UTC internally.
// Keep as Date; formatting uses TZ.
return new Date(d)
}

function fmtYYYYMMDD(d: Date) {
const y = d.getFullYear()
const m = String(d.getMonth() + 1).padStart(2, "0")
const da = String(d.getDate()).padStart(2, "0")
return `${y}${m}${da}`
}

/* ---------- Availability window from busy ---------- */

function toAvailabilityWindows(busy: Array<{ start: Date; end: Date }>) {
// within 9-17
const day = startOfDay(busy[0]?.start ?? new Date())
const open = setHours(day, WORK_START)
const close = setHours(day, WORK_END)
// merge busy
const merged = mergeIntervals(
  busy
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((b) => ({ start: new Date(b.start), end: new Date(b.end) }))
)
const windows: Array<{ start: Date; end: Date }> = []
let cursor = open
for (const b of merged) {
  if (b.start > cursor) {
    windows.push({ start: cursor, end: new Date(Math.min(b.start.getTime(), close.getTime())) })
  }
  cursor = new Date(Math.max(cursor.getTime(), b.end.getTime()))
  if (cursor >= close) break
}
if (cursor < close) windows.push({ start: cursor, end: close })
return windows.filter((w) => w.end > w.start)
}

function mergeIntervals(
arr: Array<{ start: Date; end: Date }>
): Array<{ start: Date; end: Date }> {
if (arr.length <= 1) return arr
const out: Array<{ start: Date; end: Date }> = [arr[0]]
for (let i = 1; i < arr.length; i++) {
  const last = out[out.length - 1]
  const cur = arr[i]
  if (cur.start <= last.end) {
    last.end = new Date(Math.max(last.end.getTime(), cur.end.getTime()))
  } else out.push(cur)
}
return out
}

/* ---------- TZ utils ---------- */

function getDefaultTimeZone() {
try {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
} catch {
  return "UTC"
}
}

function getTimeZones() {
// Prefer supportedValuesOf where available; fall back to common list
// This runs client-side.
const fallback = ["UTC", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Warsaw", "Europe/Lisbon", "Asia/Dubai", "Asia/Singapore", "Asia/Hong_Kong", "Asia/Tokyo", "Australia/Sydney"]
// @ts-expect-error supportedValuesOf not in older TS libs
if (typeof Intl.supportedValuesOf === "function") {
  // @ts-expect-error
  const vals = Intl.supportedValuesOf("timeZone")
  return vals?.length ? vals : fallback
}
return fallback
}

/* ---------- Hash util ---------- */

function hash(s: string) {
let h = 2166136261
for (let i = 0; i < s.length; i++) {
  h ^= s.charCodeAt(i)
  h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
}
return h >>> 0
}
