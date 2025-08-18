"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer } from "lucide-react"

type Labor = { label: string; minutes: number }
type Part = { name: string; sku: string; qty: number; unitPrice: number }
type WorkOrderData = {
  createdAt: string
  customer: { name: string; accountId: string; company: string }
  notes?: string
  labor?: Labor[]
  parts?: Part[]
  signature?: string | null
  checkIn?: string | null
  checkOut?: string | null
}

export default function WorkOrderPrintPage() {
  const params = useParams<{ id: string }>()
  const id = decodeURIComponent(params.id || "")
  const [data, setData] = useState<WorkOrderData | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`voip:wo:${id}`)
      if (raw) setData(JSON.parse(raw))
    } catch {}
  }, [id])

  const totals = useMemo(() => {
    const laborMin = (data?.labor || []).reduce((s, l) => s + (l.minutes || 0), 0)
    const partsTotal = (data?.parts || []).reduce((s, p) => s + p.qty * p.unitPrice, 0)
    return {
      laborMin,
      partsTotal,
    }
  }, [data])

  return (
    <main className="mx-auto max-w-[800px] bg-neutral-900 px-4 py-6 text-neutral-100 print:px-0">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-100">Work Order</h1>
        <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
      <Separator className="bg-neutral-700" />

      <section className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-neutral-400">Created</div>
          <div className="font-medium text-neutral-100">{data?.createdAt || new Date().toLocaleString()}</div>
        </div>
        <div>
          <div className="text-neutral-400">Account</div>
          <div className="font-medium text-neutral-100">
            {data?.customer.company} • {data?.customer.accountId}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-neutral-100">Notes</h2>
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-neutral-200">
          {data?.notes || "—"}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Labor</h2>
          <div className="mt-2 space-y-2">
            {(data?.labor || []).map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2"
              >
                <div className="text-sm text-neutral-200">{l.label}</div>
                <div className="text-sm text-neutral-200">{l.minutes} min</div>
              </div>
            ))}
            <div className="text-sm text-neutral-400">Total: {totals.laborMin} min</div>
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Parts</h2>
          <div className="mt-2 space-y-2">
            {(data?.parts || []).map((p, i) => (
              <div key={i} className="rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-neutral-100">{p.name}</div>
                  <div className="text-neutral-200">Qty {p.qty}</div>
                </div>
                <div className="text-neutral-400">
                  SKU {p.sku} • ${p.unitPrice.toFixed(2)} ea
                </div>
              </div>
            ))}
            <div className="text-sm text-neutral-400">Parts total: ${totals.partsTotal.toFixed(2)}</div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">On‑site Timeline</h2>
          <div className="mt-2 space-y-2 text-sm">
            <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-neutral-200">
              Check‑in: {data?.checkIn || "—"}
            </div>
            <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-neutral-200">
              Check‑out: {data?.checkOut || "—"}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Customer Signature</h2>
          <div className="mt-2 rounded-xl border border-neutral-700 bg-neutral-800 p-3">
            {data?.signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.signature || "/placeholder.svg"} alt="Signature" className="h-32 w-full object-contain" />
            ) : (
              <div className="text-sm text-neutral-400">No signature captured</div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
