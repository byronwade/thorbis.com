"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LinkIcon, MapPin } from 'lucide-react'
import { TB_BTN, TB_BTN_PRIMARY } from "@/components/toolbar-classes"

export type PropertyInfo = {
  address: string
  zestimate: number
  confidence: number
  beds: number
  baths: number
  sqft: number
  year: number
  lotSizeSqft: number
  lastSold: string
  lastSoldPrice: number
  image: string
  zillowUrl: string
  mapsUrl: string
}

export function PropertyPreview({ info }: { info: PropertyInfo }) {
  const fmt = (n: number) => n.toLocaleString()
  return (
    <div className="rounded-lg border p-2.5">
      <div className="flex gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={info.image || "/placeholder.svg?height=100&width=140&query=modern%20home%20exterior"}
          alt="Property"
          className="h-[84px] w-[120px] rounded-md border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{info.address}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full">Beds {info.beds}</Badge>
            <Badge variant="outline" className="rounded-full">Baths {info.baths}</Badge>
            <Badge variant="outline" className="rounded-full">{fmt(info.sqft)} sqft</Badge>
            <Badge variant="outline" className="rounded-full">Year {info.year}</Badge>
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">${fmt(info.zestimate)}</span>
            <span className="ml-2 text-xs text-muted-foreground">Confidence {Math.round(info.confidence * 100)}%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last sold {info.lastSold} • ${fmt(info.lastSoldPrice)}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <a href={info.zillowUrl} target="_blank" rel="noreferrer" className={TB_BTN_PRIMARY}>
          <LinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Open Zillow</span>
        </a>
        <a href={info.mapsUrl} target="_blank" rel="noreferrer" className={TB_BTN}>
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Open Maps</span>
        </a>
      </div>
    </div>
  )
}

export default PropertyPreview
