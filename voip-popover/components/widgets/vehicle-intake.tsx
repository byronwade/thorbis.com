"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Save, Car } from "lucide-react"

type VehicleIntake = {
  customerConcern: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vin: string
  mileage: string
  licensePlate: string
  serviceType: string
  appointmentDate: string
  appointmentTime: string
  dropOffInstructions: string
  insuranceInfo: string
  previousService: string
  notes: string
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function extractVehicleInfo(lines: string[]): Partial<VehicleIntake> {
  const text = lines.join(" ")
  const extracted: Partial<VehicleIntake> = {}

  // Extract VIN (17 characters, alphanumeric)
  const vinMatch = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i)
  if (vinMatch) extracted.vin = vinMatch[1].toUpperCase()

  // Extract mileage
  const mileageMatch = text.match(/\b(\d{1,6})\s*(?:miles?|mi|k|km)\b/i)
  if (mileageMatch) extracted.mileage = mileageMatch[1]

  // Extract license plate
  const plateMatch = text.match(/\b(?:plate|license)\s*(?:number|#)?\s*:?\s*([A-Z0-9-]{2,8})\b/i)
  if (plateMatch) extracted.licensePlate = plateMatch[1].toUpperCase()

  // Extract vehicle make/model/year
  const carBrands = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
    "Audi",
    "Nissan",
    "Hyundai",
    "Kia",
    "Subaru",
    "Mazda",
    "Volkswagen",
    "Jeep",
    "Ram",
    "GMC",
    "Cadillac",
    "Lexus",
    "Acura",
    "Infiniti",
  ]
  const makeMatch = carBrands.find((brand) => text.toLowerCase().includes(brand.toLowerCase()))
  if (makeMatch) extracted.vehicleMake = makeMatch

  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) extracted.vehicleYear = yearMatch[0]

  return extracted
}

export default function VehicleIntake({
  storageKey = "voip:intake:vehicle",
  transcript = [],
}: {
  storageKey?: string
  transcript?: string[]
}) {
  const [form, setForm] = useState<VehicleIntake>(() => {
    if (typeof window === "undefined") {
      return {
        customerConcern: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vin: "",
        mileage: "",
        licensePlate: "",
        serviceType: "",
        appointmentDate: "",
        appointmentTime: "",
        dropOffInstructions: "",
        insuranceInfo: "",
        previousService: "",
        notes: "",
      }
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? (JSON.parse(raw) as Partial<VehicleIntake>) : {}
      return {
        customerConcern: safeStr(parsed?.customerConcern),
        vehicleMake: safeStr(parsed?.vehicleMake),
        vehicleModel: safeStr(parsed?.vehicleModel),
        vehicleYear: safeStr(parsed?.vehicleYear),
        vin: safeStr(parsed?.vin),
        mileage: safeStr(parsed?.mileage),
        licensePlate: safeStr(parsed?.licensePlate),
        serviceType: safeStr(parsed?.serviceType),
        appointmentDate: safeStr(parsed?.appointmentDate),
        appointmentTime: safeStr(parsed?.appointmentTime),
        dropOffInstructions: safeStr(parsed?.dropOffInstructions),
        insuranceInfo: safeStr(parsed?.insuranceInfo),
        previousService: safeStr(parsed?.previousService),
        notes: safeStr(parsed?.notes),
      }
    } catch {
      return {
        customerConcern: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vin: "",
        mileage: "",
        licensePlate: "",
        serviceType: "",
        appointmentDate: "",
        appointmentTime: "",
        dropOffInstructions: "",
        insuranceInfo: "",
        previousService: "",
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
  const vehicleSuggestions = useMemo(() => extractVehicleInfo(lines), [lines])

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

  const hasAnySuggestion = Object.keys(vehicleSuggestions).length > 0

  function applySuggestion<K extends keyof VehicleIntake>(key: K, value: string) {
    if (!value) return
    setForm((p) => ({ ...p, [key]: value }))
  }

  function applyAllSuggestions() {
    setForm((p) => ({
      ...p,
      ...Object.entries(vehicleSuggestions).reduce(
        (acc, [key, value]) => {
          if (value && !p[key as keyof VehicleIntake]) {
            acc[key as keyof VehicleIntake] = value
          }
          return acc
        },
        {} as Partial<VehicleIntake>,
      ),
    }))
  }

  const summary = useMemo(() => {
    const linesOut: string[] = []
    if (form.customerConcern) linesOut.push(`Concern: ${form.customerConcern}`)
    if (form.vehicleMake || form.vehicleModel || form.vehicleYear) {
      linesOut.push(`Vehicle: ${form.vehicleYear} ${form.vehicleMake} ${form.vehicleModel}`.trim())
    }
    if (form.vin) linesOut.push(`VIN: ${form.vin}`)
    if (form.mileage) linesOut.push(`Mileage: ${form.mileage}`)
    if (form.serviceType) linesOut.push(`Service: ${form.serviceType}`)
    if (form.appointmentDate) linesOut.push(`Date: ${form.appointmentDate}`)
    if (form.appointmentTime) linesOut.push(`Time: ${form.appointmentTime}`)
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
        <div className="rounded-lg border border-orange-500/20 bg-neutral-900 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
                <Car className="h-3 w-3 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-white">Vehicle AI Suggestions</span>
            </div>
            <button
              className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/20"
              onClick={applyAllSuggestions}
            >
              Apply All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {vehicleSuggestions.vin && (
              <button
                className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/20"
                onClick={() => applySuggestion("vin", vehicleSuggestions.vin!)}
              >
                VIN: {vehicleSuggestions.vin}
              </button>
            )}
            {vehicleSuggestions.vehicleMake && (
              <button
                className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/20"
                onClick={() => applySuggestion("vehicleMake", vehicleSuggestions.vehicleMake!)}
              >
                Make: {vehicleSuggestions.vehicleMake}
              </button>
            )}
            {vehicleSuggestions.vehicleYear && (
              <button
                className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/20"
                onClick={() => applySuggestion("vehicleYear", vehicleSuggestions.vehicleYear!)}
              >
                Year: {vehicleSuggestions.vehicleYear}
              </button>
            )}
            {vehicleSuggestions.mileage && (
              <button
                className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/20"
                onClick={() => applySuggestion("mileage", vehicleSuggestions.mileage!)}
              >
                Mileage: {vehicleSuggestions.mileage}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Customer Concern</label>
            <Textarea
              value={form.customerConcern}
              onChange={(e) => setForm((p) => ({ ...p, customerConcern: e.target.value }))}
              placeholder="Describe the issue: strange noises, warning lights, performance problems..."
              className="min-h-[100px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Make</label>
            <Input
              value={form.vehicleMake}
              onChange={(e) => setForm((p) => ({ ...p, vehicleMake: e.target.value }))}
              placeholder="Toyota, Honda, Ford..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Model</label>
            <Input
              value={form.vehicleModel}
              onChange={(e) => setForm((p) => ({ ...p, vehicleModel: e.target.value }))}
              placeholder="Camry, Civic, F-150..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Year</label>
            <Input
              value={form.vehicleYear}
              onChange={(e) => setForm((p) => ({ ...p, vehicleYear: e.target.value }))}
              placeholder="2020"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">VIN</label>
            <Input
              value={form.vin}
              onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value.toUpperCase() }))}
              placeholder="17-character VIN"
              maxLength={17}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Mileage</label>
            <Input
              value={form.mileage}
              onChange={(e) => setForm((p) => ({ ...p, mileage: e.target.value }))}
              placeholder="85,000"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">License Plate</label>
            <Input
              value={form.licensePlate}
              onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value.toUpperCase() }))}
              placeholder="ABC123"
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Service Type</label>
            <Input
              value={form.serviceType}
              onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
              placeholder="Oil change, brake repair, diagnostic..."
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Appointment Date</label>
            <Input
              type="date"
              value={form.appointmentDate}
              onChange={(e) => setForm((p) => ({ ...p, appointmentDate: e.target.value }))}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Appointment Time</label>
            <Input
              type="time"
              value={form.appointmentTime}
              onChange={(e) => setForm((p) => ({ ...p, appointmentTime: e.target.value }))}
              className="h-10 border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-neutral-200">Drop-off Instructions</label>
            <Textarea
              value={form.dropOffInstructions}
              onChange={(e) => setForm((p) => ({ ...p, dropOffInstructions: e.target.value }))}
              placeholder="Key location, parking instructions, special requirements..."
              className="min-h-[80px] border-neutral-700/50 bg-neutral-800/50 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
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
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
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
            className="flex items-center gap-1 rounded-md bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700"
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
