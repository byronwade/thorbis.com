"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdvancedCSRToolbar } from "@/components/advanced-csr-toolbar" // Import the new toolbar component
import { Button } from "@/components/ui/button"
import { Users, ClipboardList, History, Copy, X, PhoneOff, ChevronUp } from "lucide-react"
import { TB_BTN } from "@/components/toolbar-classes"
import { useToast } from "@/hooks/use-toast"
import QuickGlanceProfile from "@/components/quick-glance-profile"
import { createRealtimeClient, type RTUser, type RTMessage } from "@/lib/realtime"
import IntakeForm from "@/components/widgets/intake-form"
import ServiceCatalog from "@/components/widgets/service-catalog"
import QuoteBuilder from "@/components/widgets/quote-builder"
import DispatchHelper from "@/components/widgets/dispatch-helper"
import AccessProperty from "@/components/widgets/access-property"
import ComplianceConsent from "@/components/widgets/compliance-consent"
import VoipIncomingOverlay from "@/components/voip-incoming-overlay" // Import the new VoipIncomingOverlay component
import { SmartSuggestions } from "@/components/modern-csr-enhancements" // Import new modern UX components
import CustomerHistory from "@/components/widgets/customer-history"
import PaymentProcessing from "@/components/widgets/payment-processing"
import KnowledgeBase from "@/components/widgets/knowledge-base"
import QuickActions from "@/components/widgets/quick-actions"
import EscalationTracker from "@/components/widgets/escalation-tracker"
import AppointmentScheduler from "@/components/widgets/appointment-scheduler"
import CommunicationLog from "@/components/widgets/communication-log"
import SentimentAnalysis from "@/components/widgets/sentiment-analysis"
import SlaMonitor from "@/components/widgets/sla-monitor"
import TeamChat from "@/components/widgets/team-chat"
import WeatherForecast from "@/components/widgets/weather-forecast"
import PredictiveIntelligence from "@/components/predictive-intelligence"
import IoTIntegration from "@/components/iot-integration"
import ARAssistance from "@/components/ar-assistance"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"

// Mock caller/context (unchanged)
const caller = {
  id: "CUST-2341",
  name: "Jordan Pierce",
  number: "+1 (415) 555-0117",
  company: "ACME Field Services",
  accountId: "ACME-4421",
  rating: 4.7,
  avatarUrl: "/images/caller-jordan.png",
  tags: ["Commercial", "Net-60", "SmartGate", "Solar"],
}

function normalizePhone(p: string) {
  return (p || "").replace(/[^\d+]/g, "")
}
function isValidEmail(e: string) {
  return !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}
function truncate(s: string, n: number) {
  if (!s) return ""
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}
function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function CallPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const id = decodeURIComponent(params?.id || caller.accountId)

  // Top toolbar state
  const [muted, setMuted] = useState(false)
  const [hold, setHold] = useState(false)
  const [recording, setRecording] = useState(false)
  const [speaker, setSpeaker] = useState(true)
  const [confirmHangup, setConfirmHangup] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCallSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Contact profile persisted
  type ContactProfile = { name: string; phone: string; email: string }
  const contactKey = `voip:contact:${id}`
  const [contact, setContact] = useState<ContactProfile>(() => {
    if (typeof window === "undefined") return { name: caller.name, phone: caller.number, email: "" }
    try {
      const raw = window.localStorage.getItem(contactKey)
      return raw ? (JSON.parse(raw) as ContactProfile) : { name: caller.name, phone: caller.number, email: "" }
    } catch {
      return { name: caller.name, phone: caller.number, email: "" }
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(contactKey, JSON.stringify(contact))
    } catch {}
  }, [contactKey, contact])

  // Preferred channel
  type Channel = "sms" | "email"
  const prefKey = `voip:prefchan:${id}`
  const [prefChannel, setPrefChannel] = useState<Channel>(() => {
    if (typeof window === "undefined") return "sms"
    try {
      const raw = window.localStorage.getItem(prefKey) as Channel | null
      return raw || "sms"
    } catch {
      return "sms"
    }
  })
  const rememberPref = (ch: Channel) => {
    setPrefChannel(ch)
    try {
      window.localStorage.setItem(prefKey, ch)
    } catch {}
  }
  const emailPresent = isValidEmail(contact.email)

  // Realtime hub (SSE + fallback)
  const roomId = `call:${id}`
  const rtRef = useRef(createRealtimeClient(roomId))

  // Identity
  const [me, setMe] = useState<RTUser>(() => {
    if (typeof window === "undefined") return { id: "ssr", name: "You", role: "CSR" }
    try {
      const raw = window.localStorage.getItem("voip:user")
      if (raw) return JSON.parse(raw) as RTUser
    } catch {}
    const u: RTUser = { id: "self", name: "You", role: "CSR" }
    try {
      window.localStorage.setItem("voip:user", JSON.stringify(u))
    } catch {}
    return u
  })
  const updateIdentity = useCallback((u: RTUser) => {
    setMe(u)
    try {
      window.localStorage.setItem("voip:user", JSON.stringify(u))
    } catch {}
    const client = rtRef.current
    client.emit({ type: "presence:join", payload: { user: { ...u, id: client.selfId } } })
  }, [])

  // Presence and typing/suggestion
  const [presence, setPresence] = useState<RTUser[]>([])
  const [supTyping, setSupTyping] = useState(false)
  const [supName, setSupName] = useState("Supervisor")
  const [supSuggestion, setSupSuggestion] = useState("")
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestionClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Review + plan details for header
  const [reviewStars, setReviewStars] = useState<number | null>(null)
  const [reviewDate, setReviewDate] = useState<string | null>(null)
  const [maintenancePlan, setMaintenancePlan] = useState<string | null>("Gold Plan")
  const [planOpen, setPlanOpen] = useState(false)

  // Fetch last review
  useEffect(() => {
    async function go() {
      try {
        const res = await fetch(`/api/reviews/last?accountId=${encodeURIComponent(caller.accountId)}`)
        if (!res.ok) return
        const data = (await res.json()) as { stars: number; dateISO: string }
        setReviewStars(data.stars)
        setReviewDate(new Date(data.dateISO).toLocaleDateString())
      } catch {}
    }
    go()
  }, [])

  // Realtime subscription
  useEffect(() => {
    const client = rtRef.current
    const selfId = client.selfId

    client.emit({ type: "presence:join", payload: { user: { ...me, id: selfId } } })

    const unsub = client.on((msg: RTMessage) => {
      if (!msg?.type) return
      switch (msg.type) {
        case "presence:join": {
          const u = msg.payload.user
          setPresence((prev) => {
            const exists = prev.some((p) => p.id === u.id)
            return exists ? prev : [...prev, u]
          })
          break
        }
        case "presence:leave": {
          const idLeft = msg.payload.userId
          setPresence((prev) => prev.filter((p) => p.id !== idLeft))
          setSupTyping(false)
          setSupSuggestion("")
          break
        }
        case "typing": {
          const { user, typing } = msg.payload
          if (user.role === "Supervisor") {
            setSupName(user.name || "Supervisor")
            setSupTyping(!!typing)
            if (typingClearRef.current) clearTimeout(typingClearRef.current)
            typingClearRef.current = setTimeout(() => setSupTyping(false), 4000)
          }
          break
        }
        case "suggestion": {
          const { user, text } = msg.payload
          if (user.role === "Supervisor") {
            setSupName(user.name || "Supervisor")
            setSupSuggestion(text)
            setSupTyping(text.trim().length > 0)
            if (suggestionClearRef.current) clearTimeout(suggestionClearRef.current)
            suggestionClearRef.current = setTimeout(() => setSupTyping(false), 5000)
          }
          break
        }
        case "profile:update": {
          if ("reviewStars" in msg.payload) setReviewStars(msg.payload.reviewStars ?? null)
          if ("maintenancePlan" in msg.payload) setMaintenancePlan(msg.payload.maintenancePlan ?? null)
          if (msg.payload.reviewDateISO) setReviewDate(new Date(msg.payload.reviewDateISO).toLocaleDateString())
          break
        }
      }
    })

    return () => {
      try {
        client.emit({ type: "presence:leave", payload: { userId: selfId } })
      } catch {}
      unsub?.()
      client.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const setTyping = useCallback(
    (typing: boolean) => {
      const client = rtRef.current
      const user: RTUser = { ...me, id: client.selfId }
      client.emit({ type: "typing", payload: { user, typing } })
    },
    [me],
  )

  const broadcastProfile = useCallback((p: { reviewStars: number | null; maintenancePlan: string | null }) => {
    setReviewStars(p.reviewStars)
    setMaintenancePlan(p.maintenancePlan)
    const client = rtRef.current
    client.emit({
      type: "profile:update",
      payload: { reviewStars: p.reviewStars, maintenancePlan: p.maintenancePlan, reviewDateISO: null },
    })
  }, [])

  // Transcript demo stream
  const [transcript, setTranscript] = useState<string[]>([])
  const [streamText, setStreamText] = useState("")
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const demoLines = useMemo(
    () => [
      "Thanks for picking up — SmartGate shows error 0x2F.",
      "This is Mr. Clark — we tried rebooting from the panel but no change.",
      "No recent wiring changes; last service was last week.",
      "We need this open by 2 PM shift change. Reach me at +1 (415) 555-0117 or clark@example.com.",
      "Site A12 access code is 0407. Also Mrs. Daniela may be onsite.",
    ],
    [],
  )
  useEffect(() => {
    let i = 0,
      j = 0
    let ti: any = null,
      to: any = null
    function typeNext() {
      const text = demoLines[i % demoLines.length]
      j = 0
      setStreamText("")
      ti = setInterval(() => {
        j++
        setStreamText(text.slice(0, j))
        if (j >= text.length) {
          clearInterval(ti)
          setTranscript((p) => [...p, text])
          setStreamText("")
          i++
          to = setTimeout(typeNext, 650)
        }
      }, 24)
    }
    typeNext()
    return () => {
      ti && clearInterval(ti)
      to && clearTimeout(to)
    }
  }, [demoLines])
  useEffect(() => {
    if (transcriptRef.current) {
      const element = transcriptRef.current
      const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5

      if (isAtBottom) {
        // Use requestAnimationFrame to prevent layout thrashing
        requestAnimationFrame(() => {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: "auto", // Changed from "smooth" to prevent shake
          })
        })
      }
    }
  }, [transcript, streamText])

  // Quick comms text
  const summaryText = useMemo(
    () => (streamText ? streamText : transcript.slice(-3).join(" ") || "Following up on our call just now."),
    [transcript, streamText],
  )
  const smsBody = `Hi ${contact.name || caller.name}, quick follow‑up: ${summaryText}`
  const emailSubject = `Follow-up: ${caller.company} — ${caller.accountId}`
  const emailBody = `Hi ${contact.name || caller.name},

Summary:
${summaryText}

Best,
FieldOps`
  const smsHref = `sms:${encodeURIComponent(normalizePhone(contact.phone || caller.number))}?&body=${encodeURIComponent(smsBody)}`
  const mailHref = `mailto:${encodeURIComponent(contact.email || "")}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  const copy = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copied", description: label || text })
    } catch {}
  }

  // Reminders checklist
  type Reminder = { id: string; text: string; done: boolean }
  const remKey = `voip:reminders:${id}`
  const defaultReminders: Reminder[] = [
    { id: "cb", text: "Verify callback number", done: false },
    { id: "addr", text: "Confirm site address and access details", done: false },
    { id: "impact", text: "Clarify business impact and urgency", done: false },
    { id: "codes", text: "Ask for error codes or symptoms", done: false },
    { id: "window", text: "Confirm availability window", done: false },
    { id: "channel", text: "Confirm preferred contact channel", done: false },
    { id: "prep", text: "Offer arrival prep instructions", done: false },
  ]
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (typeof window === "undefined") return defaultReminders
    try {
      const raw = window.localStorage.getItem(remKey)
      return raw ? (JSON.parse(raw) as Reminder[]) : defaultReminders
    } catch {
      return defaultReminders
    }
  })
  const [newReminder, setNewReminder] = useState("")
  useEffect(() => {
    try {
      window.localStorage.setItem(remKey, JSON.stringify(reminders))
    } catch {}
  }, [remKey, reminders])
  function addReminder() {
    const text = newReminder.trim()
    if (!text) return
    setReminders((prev) => [{ id: `${Date.now()}-${Math.random()}`, text, done: false }, ...prev])
    setNewReminder("")
  }
  function removeReminder(rid: string) {
    setReminders((prev) => prev.filter((r) => r.id !== rid))
  }
  function toggleReminder(rid: string) {
    setReminders((prev) => prev.map((r) => (r.id === rid ? { ...r, done: !r.done } : r)))
  }
  async function copyRemaining() {
    const remaining = reminders
      .filter((r) => !r.done)
      .map((r) => `• ${r.text}`)
      .join("\n")
    if (!remaining) return
    try {
      await navigator.clipboard.writeText(remaining)
      toast({ title: "Copied", description: "Remaining reminders copied" })
    } catch {}
  }
  function resetReminders() {
    setReminders(defaultReminders)
  }

  // Photos
  type Photo = { id: string; dataUrl: string }
  const [photos, setPhotos] = useState<Photo[]>([])
  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  // Knowledge (simple demo)
  type KB = { id: string; title: string; description: string; steps: string[] }
  const kbs: KB[] = useMemo(
    () => [
      {
        id: "kb1",
        title: "SmartGate Controller Error 0x2F",
        description: "Fast triage steps",
        steps: [
          "Power cycle controller",
          "Verify limit switch wiring continuity",
          "Check firmware ≥ 2.4.1 and reflash",
          "Run diagnostic and capture event log",
        ],
      },
    ],
    [],
  )

  // Site map canvas
  const site = { lat: 37.7749, lng: -122.4194 }
  const roster = useMemo(
    () => [
      { name: "A. Rivera", lat: 37.7953, lng: -122.393 },
      { name: "K. Chen", lat: 37.7812, lng: -122.4052 },
      { name: "D. Patel", lat: 37.7684, lng: -122.4324 },
    ],
    [],
  )
  function MiniMap() {
    const ref = useRef<HTMLCanvasElement | null>(null)
    useEffect(() => {
      const canvas = ref.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const w = canvas.width,
        h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const lats = [site.lat, ...roster.map((t) => t.lat)]
      const lngs = [site.lng, ...roster.map((t) => t.lng)]
      const minLat = Math.min(...lats) - 0.01,
        maxLat = Math.max(...lats) + 0.01
      const minLng = Math.min(...lngs) - 0.01,
        maxLng = Math.max(...lngs) + 0.01
      const x = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (w - 20) + 10
      const y = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (h - 20) + 10

      ctx.strokeStyle = "rgba(0,0,0,0.06)"
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

      ctx.fillStyle = "#111"
      ctx.beginPath()
      ctx.arc(x(site.lng), y(site.lat), 5, 0, Math.PI * 2)
      ctx.fill()

      roster.forEach((t) => {
        ctx.fillStyle = "rgba(0,0,0,0.85)"
        ctx.fillRect(x(t.lng) - 4, y(t.lat) - 4, 8, 8)
      })
    }, [])
    return (
      <canvas
        ref={ref}
        width={900}
        height={220}
        className="h-56 w-full rounded-md border border-neutral-700 bg-neutral-900 supports-[backdrop-filter]:bg-neutral-900 transition-all duration-300"
      />
    )
  }

  // Payment dialog
  const [payOpen, setPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState("")
  const [payNote, setPayNote] = useState("")
  function recordPayment() {
    const amt = Number(payAmount)
    if (!amt || amt <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" as any })
      return
    }
    setPayOpen(false)
    setPayAmount("")
    setPayNote("")
    toast({ title: "Payment recorded", description: `${formatCurrency(amt)} applied to ${caller.accountId}` })
  }

  const handleSmartSearch = (query: string, filters: string[]) => {
    console.log("Searching:", query, "with filters:", filters)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "hold":
        toast({ title: "Call on hold" })
        break
      case "mute":
        toast({ title: "Microphone muted" })
        break
      case "transfer":
        toast({ title: "Transfer initiated" })
        break
      case "escalate":
        toast({ title: "Escalating to supervisor" })
        break
      case "bookmark":
        toast({ title: "Call bookmarked" })
        break
      case "focus":
        toast({ title: "Focus mode activated" })
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    navigator.clipboard?.writeText(suggestion)
    toast({ title: "Suggestion copied to clipboard" })
  }

  const [activeWidget, setActiveWidget] = useState("transcript")

  const widgetGroups = useMemo(
    () => [
      {
        id: "transcript",
        title: "Live Transcript & Intake",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Real-time conversation and customer data",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Live Transcript</h3>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-neutral-400">Streaming with instant copy</div>
                  <div className="flex items-center gap-1">
                    {supTyping && (
                      <div className="hidden items-center gap-1 text-xs text-neutral-400 sm:flex">
                        <Users className="h-3.5 w-3.5" />
                        <span>{`${supName} is typing…`}</span>
                      </div>
                    )}
                    <button
                      className={TB_BTN}
                      onClick={() =>
                        navigator.clipboard
                          ?.writeText(summaryText)
                          .then(() => toast({ title: "Copied", description: "Latest line copied" }))
                      }
                    >
                      <ClipboardList className="h-3 w-3" />
                    </button>
                    <button
                      className={TB_BTN}
                      onClick={() =>
                        navigator.clipboard
                          ?.writeText(transcript.join("\n"))
                          .then(() => toast({ title: "Copied transcript" }))
                      }
                    >
                      <History className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div
                  ref={transcriptRef}
                  className="relative h-[400px] overflow-y-auto rounded-md border border-neutral-700 bg-neutral-900 p-4 text-sm scroll-smooth"
                  aria-live="polite"
                  style={{ scrollBehavior: "auto" }}
                >
                  {supTyping && supSuggestion.trim().length > 0 && (
                    <div className="pointer-events-auto absolute bottom-1 right-1 z-10 max-w-[80%] rounded-xl border border-neutral-600 bg-neutral-800/95 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-neutral-800/80">
                      <div className="flex items-start gap-2">
                        <Users className="mt-[2px] h-4 w-4 text-neutral-300" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-neutral-100">{supName} suggests</div>
                          <div className="mt-0.5 whitespace-pre-wrap text-xs text-neutral-200">{supSuggestion}</div>
                          <div className="mt-1 flex gap-1">
                            <button
                              className={TB_BTN}
                              onClick={() =>
                                navigator.clipboard
                                  ?.writeText(supSuggestion)
                                  .then(() => toast({ title: "Copied suggestion" }))
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button className={TB_BTN} onClick={() => setSupTyping(false)}>
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {transcript.length === 0 && streamText.length === 0 ? (
                    <div className="text-neutral-400">Live transcript will appear here.</div>
                  ) : (
                    <ul className="space-y-2 text-neutral-100">
                      {transcript.map((line, i) => (
                        <li key={i} className="leading-relaxed text-sm">
                          • {line}
                        </li>
                      ))}
                      {streamText.length > 0 && (
                        <li className="leading-relaxed text-sm">
                          • {streamText}
                          <span
                            className="ml-1 inline-block h-4 w-[2px] align-baseline bg-blue-500 animate-pulse"
                            aria-hidden
                          />
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Customer Intake</h3>
                <IntakeForm
                  storageKey={`voip:intake:${id}`}
                  transcript={transcript}
                  onApplyProfile={(u) => {
                    setContact((prev) => ({
                      name: u.name || prev.name,
                      phone: u.phone || prev.phone,
                      email: u.email || prev.email,
                    }))
                    const changes = [u.name ? "name" : null, u.phone ? "phone" : null, u.email ? "email" : null]
                      .filter(Boolean)
                      .join(", ")
                    if (changes) toast({ title: "Profile updated", description: `Applied: ${changes}` })
                  }}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "services",
        title: "Services & Quotes",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Service catalog and quote building",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Service Catalog</h3>
              <ServiceCatalog storageKey={`voip:quote:${id}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quote Builder</h3>
              <QuoteBuilder
                storageKey={`voip:quote:${id}`}
                taxRate={0.085}
                phone={contact.phone || caller.number}
                email={contact.email || ""}
                accountLabel={`${caller.company} • ${caller.accountId}`}
              />
            </div>
          </div>
        ),
      },
      {
        id: "dispatch",
        title: "Dispatch & Scheduling",
        icon: <Users className="h-4 w-4" />,
        description: "Field team coordination and appointments",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Dispatch Helper</h3>
              <DispatchHelper
                site={{ lat: 37.7749, lng: -122.4194 }}
                roster={[
                  {
                    name: "A. Rivera",
                    lat: 37.7953,
                    lng: -122.393,
                    status: "On site",
                    skills: ["SmartGate", "LowVoltage"],
                  },
                  {
                    name: "K. Chen",
                    lat: 37.7812,
                    lng: -122.4052,
                    status: "En route",
                    skills: ["SmartGate", "Firmware"],
                  },
                  {
                    name: "D. Patel",
                    lat: 37.7684,
                    lng: -122.4324,
                    status: "Available",
                    skills: ["Solar", "SmartGate", "Lift"],
                  },
                ]}
                account={`${caller.accountId}`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Appointment Scheduler</h3>
              <AppointmentScheduler />
            </div>
          </div>
        ),
      },
      {
        id: "customer",
        title: "Customer Management",
        icon: <Users className="h-4 w-4" />,
        description: "History, payments, and communication",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Customer History</h3>
              <CustomerHistory customerId={caller.accountId} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Payment Processing</h3>
              <PaymentProcessing customerId={caller.accountId} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Communication Log</h3>
              <CommunicationLog customerId={caller.accountId} />
            </div>
          </div>
        ),
      },
      {
        id: "support",
        title: "Support Tools",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Knowledge base, escalation, and quick actions",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Knowledge Base</h3>
              <KnowledgeBase />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <QuickActions />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Escalation Tracker</h3>
              <EscalationTracker />
            </div>
          </div>
        ),
      },
      {
        id: "analytics",
        title: "Analytics & Monitoring",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Sentiment, SLA, and performance tracking",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
              <SentimentAnalysis />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">SLA Monitor</h3>
              <SlaMonitor />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Weather Forecast</h3>
              <WeatherForecast />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Team Chat</h3>
              <TeamChat />
            </div>
          </div>
        ),
      },
      {
        id: "advanced",
        title: "Advanced Features",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "AI, IoT, AR, and predictive tools",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">AI Assistant</h3>
                <SmartSuggestions transcript={transcript} onSuggestionClick={handleSuggestionClick} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Predictive Intelligence</h3>
                <PredictiveIntelligence customerId={caller.accountId} callContext={transcript.join(" ")} />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">IoT Device Monitor</h3>
                <IoTIntegration />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">AR Assistance</h3>
                <ARAssistance />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "compliance",
        title: "Access & Compliance",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Property access and compliance management",
        element: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Access & Property</h3>
              <AccessProperty storageKey={`voip:access:${id}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Compliance & Consent</h3>
              <ComplianceConsent storageKey={`voip:compliance:${id}`} />
            </div>
          </div>
        ),
      },
    ],
    [id, transcript, streamText, supTyping, supName, supSuggestion, contact, caller],
  )

  const activeWidgetData = widgetGroups.find((w) => w.id === activeWidget) || widgetGroups[0]

  return (
    <TooltipProvider>
      <main className="min-h-[100dvh] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
        <AdvancedCSRToolbar
          callId={id}
          caller={caller}
          callSeconds={callSeconds}
          presence={presence}
          onBack={() => router.push("/")}
          onHangup={() => setConfirmHangup(true)}
          className="border-neutral-800/50 backdrop-blur-xl bg-neutral-900/80 supports-[backdrop-filter]:bg-neutral-900/60"
        />

        <header className="border-b border-neutral-800/50 bg-gradient-to-r from-neutral-900/60 via-neutral-900/40 to-neutral-900/60 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-900/30">
          <QuickGlanceProfile
            avatarUrl={caller.avatarUrl || "/diverse-avatars.png"}
            name={contact.name || caller.name}
            company={caller.company}
            accountId={caller.accountId}
            rating={caller.rating}
            tags={caller.tags}
            presenceNames={presence.map((p) => p.name)}
            creditAvailable={3500}
            balanceDue={800}
            openEstimates={1}
            phone={contact.phone || caller.number}
            email={contact.email || ""}
            address={""}
            reviewStars={reviewStars ?? undefined}
            reviewDate={reviewDate}
            maintenancePlan={maintenancePlan}
            onMaintenanceClick={() => setPlanOpen(true)}
            prefChannel={prefChannel}
            onSetChannel={(c) => rememberPref(c)}
            onCopy={(field) => {
              if (field === "phone") copy(contact.phone || caller.number, "Phone")
              if (field === "email" && contact.email) copy(contact.email, "Email")
              if (field === "address") copy("", "Address")
            }}
            onOpenCustomer={() => {}}
          />
        </header>

        <section className="flex-1 flex flex-col lg:flex-row">
          {/* Mobile Widget Selector - Shows on mobile as horizontal scroll */}
          <div className="lg:hidden border-b border-neutral-800/50 bg-neutral-900/40 backdrop-blur-xl">
            <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
              {widgetGroups.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => setActiveWidget(widget.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeWidget === widget.id
                      ? "text-white bg-blue-500/30 border border-blue-500/50"
                      : "text-neutral-300 bg-neutral-800/50 hover:text-white hover:bg-neutral-700/50"
                  }`}
                >
                  <div className={`text-sm ${activeWidget === widget.id ? "text-blue-400" : "text-neutral-400"}`}>
                    {widget.icon}
                  </div>
                  <span>{widget.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Floating Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 flex-shrink-0 p-6">
            <nav className="space-y-2">
              {widgetGroups.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => setActiveWidget(widget.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                    activeWidget === widget.id
                      ? "text-white bg-blue-500/20 border border-blue-500/30"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`${activeWidget === widget.id ? "text-blue-400" : "text-neutral-400 group-hover:text-neutral-300"}`}
                    >
                      {widget.icon}
                    </div>
                    <span className="font-medium">{widget.title}</span>
                  </div>
                  <p className="text-xs text-neutral-400 group-hover:text-neutral-300 ml-7">{widget.description}</p>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area - Responsive padding and height */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="h-full">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">{activeWidgetData.title}</h2>
                <p className="text-sm lg:text-base text-neutral-400">{activeWidgetData.description}</p>
              </div>
              <div className="h-[calc(100vh-320px)] lg:h-[calc(100vh-280px)] overflow-y-auto">
                {activeWidgetData.element}
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Sticky bottom bar */}
        <div className="sticky bottom-0 z-30 border-t border-neutral-800/50 bg-neutral-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-900/60">
          <div className="flex items-center justify-between px-3 lg:px-6 py-2 lg:py-3">
            {/* Left side - Call info and status */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Call Duration */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs lg:text-sm font-medium text-neutral-200">{formatDuration(callSeconds)}</span>
              </div>

              {/* Mobile Details Dropdown */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors">
                      <span>Details</span>
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-neutral-800/95 backdrop-blur-xl border-neutral-700 w-64"
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-neutral-300">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Call quality: Excellent</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-300">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Recording active</span>
                      </div>
                      <div className="text-xs text-neutral-400">Company: {caller.company}</div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Status Info */}
              <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Call quality: Excellent</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-neutral-600" />
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Recording active</span>
                </div>
              </div>
            </div>

            {/* Right side - End Call Button */}
            <button
              className="group flex items-center gap-1.5 lg:gap-2 rounded-lg lg:rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-2.5 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-500 hover:to-red-600 touch-manipulation"
              onClick={() => setConfirmHangup(true)}
            >
              <PhoneOff className="h-3.5 w-3.5 lg:h-4 lg:w-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </div>

        <Dialog open={confirmHangup} onOpenChange={setConfirmHangup}>
          <DialogContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-700 supports-[backdrop-filter]:bg-neutral-900/80">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">End call?</DialogTitle>
              <DialogDescription className="text-neutral-400">
                This will end the active call with {caller.name}. Any unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmHangup(false)}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-500">
                End Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* VoipIncomingOverlay */}
        <VoipIncomingOverlay />
      </main>
    </TooltipProvider>
  )
}
