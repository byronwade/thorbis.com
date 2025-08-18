"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Tag,
  Flag,
  Star,
  ChevronLeft,
  Wrench,
  Ticket,
  TimerIcon as Timeline,
  Users,
  Copy,
  FileText,
  Download,
  MessageSquare,
  CalendarDays,
  Route,
  ClipboardList,
} from "lucide-react"
import { useRef, useEffect, useState, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TB_ICON_SM } from "@/components/toolbar-classes"
import { cn } from "@/lib/utils"

type PageProps = { params: { id: string } }

const tags = ["Commercial", "Net-60", "SmartGate", "Solar"]
const flags = [
  { label: "VIP", tone: "positive" as const },
  { label: "Safety Note", tone: "warning" as const },
]
const timeline = [
  { time: "2025‑08‑03 09:42", text: "Preventive maintenance completed. Firmware 2.4.1." },
  { time: "2025‑07‑12 15:10", text: "Emergency dispatch — gate obstruction cleared." },
  { time: "2025‑06‑29 11:02", text: "Training call with facilities manager." },
]

const site = { lat: 37.563, lng: -122.322 }
const roster = [
  { name: "A. Rivera", lat: 37.55, lng: -122.3, status: "On site" as const },
  { name: "K. Chen", lat: 37.58, lng: -122.41, status: "En route" as const },
  { name: "D. Patel", lat: 37.62, lng: -122.38, status: "Available" as const },
]
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function VoipCustomerPage({ params }: PageProps) {
  const id = decodeURIComponent(params.id)

  // Fake numbers for accents
  const stats = useMemo(
    () => ({
      sla: 0.78, // 78% of window used
      csat: 4.8,
      lastVisitDays: 5,
      openTickets: 2,
    }),
    [],
  )

  return (
    <TooltipProvider>
      <main className="min-h-[100dvh] bg-white text-neutral-900">
        {/* Top header with subtle gradient wash */}
        <header className="border-b bg-gradient-to-r from-emerald-50/70 via-amber-50/60 to-transparent">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <span className="text-sm font-semibold tracking-tight">Customer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600">
                <Users className="h-4 w-4" />
                Also viewing: Sam, Riley
              </div>
              <Badge className="rounded-full bg-emerald-600 text-white">VIP</Badge>
              <Badge className="rounded-full border-amber-300 bg-amber-50 text-amber-900">SLA 2–4h</Badge>
            </div>
          </div>
        </header>

        {/* Background grid + color wash */}
        <section
          className="relative bg-gradient-to-br from-emerald-50/70 via-amber-50/40 to-white"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
            {/* Title + Quick Actions */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Account {id}</h1>
                <p className="mt-1 text-neutral-700">Full customer context with color-coded status and actions.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                  <Ticket className="mr-2 h-4 w-4" />
                  Create Ticket
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-emerald-300 bg-transparent">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                <a
                  href="sms:+14155550117?&body=Hi%20team%2C%20your%20tech%20is%20scheduled%20today.%20Please%20ensure%20gate%20access%20and%20onsite%20contact%20availability."
                  className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
                  title="Send arrival prep SMS"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Prep SMS
                </a>
                <a
                  href="mailto:jordan.pierce@example.com?subject=Service%20Summary&body=Attached%20is%20your%20recent%20service%20summary."
                  className="inline-flex h-9 items-center justify-center rounded-full border border-neutral-300 bg-white px-3 text-sm font-medium hover:bg-neutral-50"
                  title="Email report"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("San Mateo, CA")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-3 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                  title="Directions"
                >
                  <Route className="mr-2 h-4 w-4" />
                  Directions
                </a>
              </div>
            </div>

            {/* KPI Row */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill
                label="SLA Utilization"
                value={`${Math.round(stats.sla * 100)}%`}
                barPct={stats.sla}
                tone="amber"
                hint="Within 2–4h"
              />
              <StatPill
                label="CSAT"
                value={stats.csat.toFixed(1)}
                icon={<Star className="h-4 w-4 text-amber-500" />}
                tone="emerald"
              />
              <StatPill label="Last Visit" value={`${stats.lastVisitDays} days`} tone="neutral" />
              <StatPill
                label="Open Tickets"
                value={`${stats.openTickets}`}
                tone={stats.openTickets > 0 ? "amber" : "emerald"}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Overview column */}
              <div className="space-y-6">
                <Card className="border-emerald-200 shadow-[0_1px_0_0_rgba(16,185,129,0.15)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/generic-company-logo.png"
                        alt="Company logo"
                        className="h-14 w-14 rounded-lg border border-neutral-200 object-cover"
                      />
                      <div className="min-w-0">
                        <CardTitle className="truncate">ACME Field Services</CardTitle>
                        <CardDescription>Account: {id}</CardDescription>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {flags.map((f) => (
                            <span
                              key={f.label}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                                f.tone === "positive"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-amber-200 bg-amber-50 text-amber-900",
                              )}
                            >
                              <Flag className="h-3.5 w-3.5" />
                              {f.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-700" />
                      Primary: Jordan Pierce
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-700" />
                      +1 (415) 555-0117
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-700" />
                      jordan.pierce@example.com
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      <span>San Mateo, CA</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={TB_ICON_SM}
                            onClick={() => navigator.clipboard.writeText("San Mateo, CA")}
                            aria-label="Copy address"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Copy address</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      Sites: 5 • Devices: 18
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Rating: 4.7
                    </div>
                    <Separator className="bg-emerald-200" />
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full border-emerald-200 text-emerald-900">
                          <Tag className="mr-1 h-3.5 w-3.5 text-emerald-700" /> {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Technicians & Schedule card with mini map */}
                <Card className="border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Technicians &amp; Schedule</CardTitle>
                    <CardDescription>Live presence and upcoming visits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MiniMap />
                    <ul className="space-y-2">
                      {roster.map((t) => {
                        const km = Math.round(haversineKm(site.lat, site.lng, t.lat, t.lng) * 10) / 10
                        const chip =
                          t.status === "On site"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : t.status === "En route"
                              ? "border-amber-300 bg-amber-50 text-amber-900"
                              : "border-neutral-300 bg-neutral-50 text-neutral-900"
                        return (
                          <li
                            key={t.name}
                            className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2"
                          >
                            <div className="text-sm font-medium">{t.name}</div>
                            <div className="flex items-center gap-2">
                              <span className={cn("rounded-full border px-2 py-0.5 text-xs", chip)}>{t.status}</span>
                              <div className="text-sm text-neutral-600">{km} km</div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm">
                      <div>
                        <div className="font-medium">Tue, Aug 12 • 10:00–12:00</div>
                        <div className="text-neutral-600">Assigned: A. Rivera</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full border-emerald-300 bg-transparent">
                          Adjust
                        </Button>
                        <Button size="sm" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card className="border-neutral-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-700" />
                      Documents
                    </CardTitle>
                    <CardDescription>Common references and exports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <DocRow title="Controller Manual.pdf" size="2.1 MB" />
                    <DocRow title="Site Map.png" size="1.4 MB" />
                    <DocRow title="Maintenance Agreement.pdf" size="620 KB" />
                  </CardContent>
                </Card>
              </div>

              {/* Right column with tabs */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="history">
                  <TabsList className="rounded-full border border-emerald-200 bg-emerald-50 p-1">
                    <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-white">
                      History
                      <Badge variant="secondary" className="ml-2 rounded-full bg-emerald-600/10 text-emerald-900">
                        {timeline.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="rounded-full data-[state=active]:bg-white">
                      Tickets
                      <Badge variant="secondary" className="ml-2 rounded-full bg-amber-500/10 text-amber-900">
                        2
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-full data-[state=active]:bg-white">
                      Notes
                      <Badge variant="secondary" className="ml-2 rounded-full bg-neutral-500/10 text-neutral-900">
                        3
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="mt-4">
                    <Card className="border-emerald-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Timeline className="h-4 w-4 text-emerald-700" />
                          Interaction Timeline
                        </CardTitle>
                        <CardDescription>Recent calls, services, updates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4 text-sm">
                          {timeline.map((t) => (
                            <li key={t.time} className="rounded-md border-l-2 border-emerald-300 pl-3">
                              <div className="font-medium">{t.time}</div>
                              <div className="text-neutral-700">{t.text}</div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tickets" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="overflow-hidden border-emerald-200">
                        <div className="h-1 w-full bg-emerald-500" aria-hidden />
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-emerald-700" />
                            Ticket #10244
                          </CardTitle>
                          <CardDescription>Gate controller fault</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-700">Status</span>
                            <Badge className="rounded-full bg-emerald-600 text-white">In Progress</Badge>
                          </div>
                          <Separator className="bg-emerald-200" />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-full border-emerald-300 bg-transparent text-emerald-800 hover:bg-emerald-50"
                          >
                            <Wrench className="mr-2 h-4 w-4" />
                            View Work Order
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden border-amber-200">
                        <div className="h-1 w-full bg-amber-500" aria-hidden />
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-amber-700" />
                            Ticket #10245
                          </CardTitle>
                          <CardDescription>Preventive maintenance</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-700">Status</span>
                            <Badge className="rounded-full border-amber-300 bg-amber-50 text-amber-900">
                              Scheduled
                            </Badge>
                          </div>
                          <Separator className="bg-amber-200" />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-full border-amber-300 bg-transparent text-amber-900 hover:bg-amber-50"
                          >
                            <Wrench className="mr-2 h-4 w-4" />
                            View Work Order
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4">
                    <Card className="border-neutral-200">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-emerald-700" />
                          Account Notes
                        </CardTitle>
                        <CardDescription>Persistent internal notes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PersistentNotes id={id} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
    </TooltipProvider>
  )
}

/* Accent KPI Pill */
function StatPill({
  label,
  value,
  barPct,
  icon,
  hint,
  tone = "neutral",
}: {
  label: string
  value: string
  barPct?: number
  icon?: React.ReactNode
  hint?: string
  tone?: "emerald" | "amber" | "neutral"
}) {
  const t =
    tone === "emerald"
      ? {
          ring: "ring-emerald-200",
          bg: "bg-emerald-50",
          text: "text-emerald-900",
          bar: "bg-emerald-500",
        }
      : tone === "amber"
        ? {
            ring: "ring-amber-200",
            bg: "bg-amber-50",
            text: "text-amber-900",
            bar: "bg-amber-500",
          }
        : {
            ring: "ring-neutral-200",
            bg: "bg-white",
            text: "text-neutral-900",
            bar: "bg-neutral-400",
          }

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 p-3 shadow-sm ring-1",
        t.ring,
        tone !== "neutral" ? t.bg : "bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-600">{label}</div>
        {icon}
      </div>
      <div className={cn("mt-1 text-lg font-semibold", t.text)}>{value}</div>
      {hint && <div className="text-[11px] text-neutral-600">{hint}</div>}
      {typeof barPct === "number" && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200">
          <div
            className={cn("h-1.5 rounded-full", t.bar)}
            style={{ width: `${Math.min(100, Math.max(0, Math.round(barPct * 100)))}%` }}
          />
        </div>
      )}
    </div>
  )
}

/* Mini map canvas */
function MiniMap() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const lats = [site.lat, ...roster.map((t) => t.lat)]
    const lngs = [site.lng, ...roster.map((t) => t.lng)]
    const minLat = Math.min(...lats) - 0.01
    const maxLat = Math.max(...lats) + 0.01
    const minLng = Math.min(...lngs) - 0.01
    const maxLng = Math.max(...lngs) + 0.01
    const x = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (w - 20) + 10
    const y = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (h - 20) + 10

    ctx.strokeStyle = "rgba(0,0,0,0.06)"
    ctx.lineWidth = 1
    for (let gx = 20; gx < w; gx += 24) {
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, h)
      ctx.stroke()
    }
    for (let gy = 20; gy < h; gy += 24) {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(w, gy)
      ctx.stroke()
    }

    // Site marker
    ctx.fillStyle = "#047857" // emerald-700
    ctx.beginPath()
    ctx.arc(x(site.lng), y(site.lat), 5, 0, Math.PI * 2)
    ctx.fill()

    // Techs
    roster.forEach((t) => {
      ctx.fillStyle = "rgba(180,83,9,0.9)" // amber-700-ish
      ctx.fillRect(x(t.lng) - 4, y(t.lat) - 4, 8, 8)
    })
  }, [])
  return (
    <canvas ref={ref} width={560} height={160} className="h-36 w-full rounded-xl border border-emerald-200 bg-white" />
  )
}

function DocRow({ title, size }: { title: string; size: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs text-neutral-600">{size}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="rounded-full border-neutral-300 bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button size="sm" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
          <ExternalIcon />
          Open
        </Button>
      </div>
    </div>
  )
}

function ExternalIcon() {
  return (
    // Simple square arrow style using FileText + small styling for variety
    <span className="inline-flex items-center">
      <FileText className="h-4 w-4" />
    </span>
  )
}

function PersistentNotes({ id }: { id: string }) {
  const key = `voip:notes:${id}`
  const [val, setVal] = useState("")
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const v = window.localStorage.getItem(key)
      if (v) setVal(v)
    } catch {}
  }, [key])
  useEffect(() => {
    try {
      window.localStorage.setItem(key, val)
    } catch {}
  }, [key, val])
  return (
    <Textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder="Long‑form notes, agreements, codes, escalations…"
      className="min-h-[200px] resize-vertical focus-visible:ring-emerald-500"
    />
  )
}
