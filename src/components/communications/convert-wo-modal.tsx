"use client"

import * as React from "react"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Calendar } from "@components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select"
import { Separator } from "@components/ui/separator"
import { CalendarIcon, Link2, Copy } from 'lucide-react'
import { cn } from "@lib/utils"
import { useToast } from "@hooks/use-toast"

type Priority = "Low" | "Normal" | "High" | "Urgent"
type SlaPolicy = "Standard (8x5)" | "Premium (24x7)" | "None"

export type WorkOrderPrefill = {
  sourceThread: { id: string; subject: string }
  customer: string
  site: string
  priority: Priority
  slaPolicy: SlaPolicy
  respondBy: Date
  resolveBy: Date
  notes?: string
}

function toTimeValue(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

function applyTime(base: Date, timeValue: string) {
  const [hh, mm] = timeValue.split(":").map((v) => parseInt(v, 10))
  const d = new Date(base)
  if (!Number.isNaN(hh)) d.setHours(hh)
  if (!Number.isNaN(mm)) d.setMinutes(mm)
  d.setSeconds(0, 0)
  return d
}

export function ConvertWoModal({
  open,
  onOpenChange,
  prefill,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefill: WorkOrderPrefill
  onCreated?: (woId: string) => void
}) {
  const { toast } = useToast()

  const [customer, setCustomer] = React.useState(prefill.customer)
  const [site, setSite] = React.useState(prefill.site)
  const [priority, setPriority] = React.useState<Priority>(prefill.priority)
  const [sla, setSla] = React.useState<SlaPolicy>(prefill.slaPolicy)
  const [respondDate, setRespondDate] = React.useState<Date>(prefill.respondBy)
  const [respondTime, setRespondTime] = React.useState<string>(toTimeValue(prefill.respondBy))
  const [resolveDate, setResolveDate] = React.useState<Date>(prefill.resolveBy)
  const [resolveTime, setResolveTime] = React.useState<string>(toTimeValue(prefill.resolveBy))
  const [notes, setNotes] = React.useState<string>(prefill.notes ?? "")

  // Reset state when prefill changes or modal opens
  React.useEffect(() => {
    if (!open) return
    setCustomer(prefill.customer)
    setSite(prefill.site)
    setPriority(prefill.priority)
    setSla(prefill.slaPolicy)
    setRespondDate(prefill.respondBy)
    setRespondTime(toTimeValue(prefill.respondBy))
    setResolveDate(prefill.resolveBy)
    setResolveTime(toTimeValue(prefill.resolveBy))
    setNotes(prefill.notes ?? "")
  }, [open, prefill])

  function handleCreate() {
    // Design-only: fake WO id and toast
    const woId = `WO-${Math.floor(1000 + Math.random() * 9000)}`
    toast({
      title: "Work Order created",
      description: `${woId} linked to thread "${prefill.sourceThread.subject}".`,
    })
    onCreated?.(woId)
    onOpenChange(false)
  }

  async function copyThreadId() {
    try {
      await navigator.clipboard.writeText(prefill.sourceThread.id)
      toast({ title: "Copied thread ID", description: prefill.sourceThread.id })
    } catch {
      // noop
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>Prefilled from the selected conversation.</DialogDescription>
        </DialogHeader>

        {/* Source thread reference */}
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Source thread:</span>
            <span className="truncate text-muted-foreground" title={prefill.sourceThread.subject}>
              {prefill.sourceThread.subject}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onOpenChange(false)} title="View thread">
                <Link2 className="h-4 w-4" />
                View thread
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyThreadId} title="Copy thread ID">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customer">Customer</Label>
            <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="site">Site</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger id="site"><SelectValue placeholder="Select site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Site">Main Site</SelectItem>
                <SelectItem value="HQ">HQ</SelectItem>
                <SelectItem value="E-Comm Store">E-Comm Store</SelectItem>
                <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                <SelectItem value="Custom…">Custom…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
              <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sla">SLA Policy</Label>
            <Select value={sla} onValueChange={(v: SlaPolicy) => setSla(v)}>
              <SelectTrigger id="sla"><SelectValue placeholder="Select policy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard (8x5)">Standard (8x5)</SelectItem>
                <SelectItem value="Premium (24x7)">Premium (24x7)</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-2" />

        {/* SLA dates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Respond by</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start", !respondDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {respondDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar mode="single" selected={respondDate} onSelect={(d) => d && setRespondDate(applyTime(d, respondTime))} />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                className="w-32"
                value={respondTime}
                onChange={(e) => {
                  setRespondTime(e.target.value)
                  setRespondDate((d) => applyTime(d, e.target.value))
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Resolve by</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start", !resolveDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resolveDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar mode="single" selected={resolveDate} onSelect={(d) => d && setResolveDate(applyTime(d, resolveTime))} />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                className="w-32"
                value={resolveTime}
                onChange={(e) => {
                  setResolveTime(e.target.value)
                  setResolveDate((d) => applyTime(d, e.target.value))
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes for the job..." />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create Work Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
