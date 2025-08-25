"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Copy, Shield, Clock, CheckCircle } from "lucide-react"

type Consent = {
  consentToRecord: boolean
  marketingOptIn: boolean
  termsAccepted: boolean
  fullName: string
  capturedAtISO: string
}

export default function ComplianceConsent({
  storageKey = "voip:consent:generic",
  account = "",
  contactName = "",
}: {
  storageKey?: string
  account?: string
  contactName?: string
}) {
  const [state, setState] = useState<Consent>({
    consentToRecord: false,
    marketingOptIn: false,
    termsAccepted: false,
    fullName: "",
    capturedAtISO: "",
  })

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const p = JSON.parse(raw) as Partial<Consent>
        setState({
          consentToRecord: !!p.consentToRecord,
          marketingOptIn: !!p.marketingOptIn,
          termsAccepted: !!p.termsAccepted,
          fullName: p.fullName ?? "",
          capturedAtISO: p.capturedAtISO ?? "",
        })
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {}
  }, [state, storageKey])

  function stamp() {
    setState((p) => ({ ...p, capturedAtISO: new Date().toISOString() }))
  }

  const summary = `Consent for ${account || "account"}:
- Record consent: ${state.consentToRecord ? "Yes" : "No"}
- Marketing opt-in: ${state.marketingOptIn ? "Yes" : "No"}
- Terms accepted: ${state.termsAccepted ? "Yes" : "No"}
- Name: ${state.fullName || contactName || ""}
- Captured: ${state.capturedAtISO ? new Date(state.capturedAtISO).toLocaleString() : "—"}`

  const allConsentsGiven = state.consentToRecord && state.termsAccepted && state.fullName.trim()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Compliance & Consent</h3>
          {allConsentsGiven && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <label
            className={cn(
              "flex select-none items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              state.consentToRecord
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-background/50",
            )}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary rounded mt-0.5"
              checked={state.consentToRecord}
              onChange={(e) => setState((p) => ({ ...p, consentToRecord: e.target.checked }))}
            />
            <div>
              <div className="font-medium text-card-foreground">Consent to call recording</div>
              <div className="text-xs text-muted-foreground">Required for quality assurance and training</div>
            </div>
            {state.consentToRecord && <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-0.5" />}
          </label>

          <label
            className={cn(
              "flex select-none items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              state.marketingOptIn
                ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                : "bg-background/50",
            )}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary rounded mt-0.5"
              checked={state.marketingOptIn}
              onChange={(e) => setState((p) => ({ ...p, marketingOptIn: e.target.checked }))}
            />
            <div>
              <div className="font-medium text-card-foreground">Marketing communications</div>
              <div className="text-xs text-muted-foreground">Receive updates about services and promotions</div>
            </div>
            {state.marketingOptIn && <CheckCircle className="h-4 w-4 text-blue-500 ml-auto mt-0.5" />}
          </label>

          <label
            className={cn(
              "flex select-none items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              state.termsAccepted
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-background/50",
            )}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary rounded mt-0.5"
              checked={state.termsAccepted}
              onChange={(e) => setState((p) => ({ ...p, termsAccepted: e.target.checked }))}
            />
            <div>
              <div className="font-medium text-card-foreground">Terms and conditions accepted</div>
              <div className="text-xs text-muted-foreground">Agreement to service terms and privacy policy</div>
            </div>
            {state.termsAccepted && <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-0.5" />}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-card-foreground">Full name</label>
        <Input
          value={state.fullName}
          onChange={(e) => setState((p) => ({ ...p, fullName: e.target.value }))}
          placeholder={contactName || "Customer full name"}
          className="h-9 bg-background/50"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {state.capturedAtISO ? <>Captured: {new Date(state.capturedAtISO).toLocaleString()}</> : "Not timestamped"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={stamp}>
            <Clock className="h-4 w-4 mr-1" />
            Stamp time
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(summary)}>
            <Copy className="h-4 w-4 mr-1" />
            Copy summary
          </Button>
        </div>
      </div>
    </div>
  )
}
