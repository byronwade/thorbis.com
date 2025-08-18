"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, MapPin, Key } from "lucide-react"

type AccessData = {
  address1: string
  unit: string
  city: string
  state: string
  zip: string
  gateCode: string
  notes: string
}

export default function AccessProperty({ storageKey = "voip:access:generic" }: { storageKey?: string }) {
  const [data, setData] = useState<AccessData>({
    address1: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    gateCode: "",
    notes: "",
  })
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const p = JSON.parse(raw) as Partial<AccessData>
        setData({
          address1: p.address1 ?? "",
          unit: p.unit ?? "",
          city: p.city ?? "",
          state: p.state ?? "",
          zip: p.zip ?? "",
          gateCode: p.gateCode ?? "",
          notes: p.notes ?? "",
        })
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data))
    } catch {}
  }, [data, storageKey])

  const fullAddress = [data.address1, data.unit, `${data.city} ${data.state} ${data.zip}`.trim()]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            <MapPin className="inline h-4 w-4 mr-1" />
            Address
          </label>
          <Input
            value={data.address1}
            onChange={(e) => setData((p) => ({ ...p, address1: e.target.value }))}
            placeholder="123 Main St"
            className="h-9 bg-background/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">Unit</label>
          <Input
            value={data.unit}
            onChange={(e) => setData((p) => ({ ...p, unit: e.target.value }))}
            placeholder="Suite / Apt"
            className="h-9 bg-background/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">City</label>
          <Input
            value={data.city}
            onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))}
            placeholder="City"
            className="h-9 bg-background/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">State</label>
          <Input
            value={data.state}
            onChange={(e) => setData((p) => ({ ...p, state: e.target.value }))}
            placeholder="State"
            className="h-9 bg-background/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">ZIP</label>
          <Input
            value={data.zip}
            onChange={(e) => setData((p) => ({ ...p, zip: e.target.value }))}
            placeholder="ZIP"
            className="h-9 bg-background/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            <Key className="inline h-4 w-4 mr-1" />
            Gate / Access code
          </label>
          <Input
            value={data.gateCode}
            onChange={(e) => setData((p) => ({ ...p, gateCode: e.target.value }))}
            placeholder="e.g., 0407"
            className="h-9 bg-background/50 font-mono"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">Access notes</label>
          <Textarea
            value={data.notes}
            onChange={(e) => setData((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Parking, alarms, hazards, special instructions…"
            className="min-h-[80px] bg-background/50"
          />
        </div>
      </div>

      {fullAddress && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2">Property Summary</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Address:</span>
              <span className="ml-2 text-card-foreground">{fullAddress}</span>
            </div>
            {data.gateCode && (
              <div>
                <span className="text-muted-foreground">Access Code:</span>
                <span className="ml-2 font-mono text-primary">{data.gateCode}</span>
              </div>
            )}
            {data.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <span className="ml-2 text-card-foreground">{data.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() =>
            navigator.clipboard?.writeText([fullAddress, data.gateCode, data.notes].filter(Boolean).join("\n"))
          }
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy address & access
        </Button>
      </div>
    </div>
  )
}
