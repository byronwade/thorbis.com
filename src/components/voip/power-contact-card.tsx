"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TB_BTN } from "@/components/toolbar-classes"
import PropertyPreview, { type PropertyInfo } from "./property-preview"
import { Copy, Mail, MapPin, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"

type PowerContactCardProps = {
  id: string
  defaultName?: string
  defaultPhone?: string
  defaultEmail?: string
  defaultAddress?: string
  className?: string
}

type ContactInfo = {
  name: string
  phone: string
  email: string
  address: string
}

export default function PowerContactCard({
  id,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  defaultAddress = "",
  className,
}: PowerContactCardProps) {
  const storageKey = `voip:contact:${id}`

  const [contact, setContact] = useState<ContactInfo>(() => {
    if (typeof window === "undefined") {
      return { name: defaultName, phone: defaultPhone, email: defaultEmail, address: defaultAddress }
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw) as ContactInfo
    } catch {}
    return { name: defaultName, phone: defaultPhone, email: defaultEmail, address: defaultAddress }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(contact))
    } catch {}
  }, [storageKey, contact])

  // Property lookup for address (debounced)
  const [prop, setProp] = useState<PropertyInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!contact.address || contact.address.trim().length < 6) {
      setProp(null)
      setLoading(false)
      setError(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        if (abortRef.current) abortRef.current.abort()
        const ac = new AbortController()
        abortRef.current = ac
        const url = `/api/property/lookup?address=${encodeURIComponent(contact.address)}`
        const res = await fetch(url, { signal: ac.signal })
        if (!res.ok) throw new Error(`Lookup failed: ${res.status}`)
        const data = (await res.json()) as PropertyInfo
        setProp(data)
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Lookup failed")
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [contact.address])

  const copyAll = async () => {
    const text = `${contact.name} • ${contact.phone} • ${contact.email} • ${contact.address}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <Card className={cn("rounded-xl border", className)}>
      <CardContent className="space-y-2.5 px-3 py-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12">
            <label className="mb-1 block text-xs text-muted-foreground">Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={contact.name}
                onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
                className="h-8 pl-8"
              />
            </div>
          </div>
          <div className="col-span-6">
            <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={contact.phone}
                onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 ..."
                className="h-8 pl-8"
              />
            </div>
          </div>
          <div className="col-span-6">
            <label className="mb-1 block text-xs text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={contact.email}
                onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                placeholder="name@company.com"
                className="h-8 pl-8"
              />
            </div>
          </div>
          <div className="col-span-12">
            <label className="mb-1 block text-xs text-muted-foreground">Address</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={contact.address}
                onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, City, ST 94105"
                className="h-8 pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button className={TB_BTN} onClick={copyAll} title="Copy">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <div className="text-[11px] text-muted-foreground">Auto-saved</div>
        </div>

        {/* Property details */}
        {loading && <div className="text-xs text-muted-foreground">Looking up property…</div>}
        {error && <div className="text-xs text-rose-600">Error: {error}</div>}
        {prop && !loading && <PropertyPreview info={prop} />}
      </CardContent>
    </Card>
  )
}
