"use client"

import * as React from "react"
import { Card, CardContent } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@components/ui/select"
import { Badge } from "@components/ui/badge"
import { Separator } from "@components/ui/separator"
import { cn } from "@lib/utils"
import { Sparkles, CalendarIcon, ChevronDown, ChevronUp, Check, User, Wrench, Crown, Copy, Trash2 } from "lucide-react"
import { WithClickMenu, type ClickMenuItem } from "@components/click-menu"

/* ---------- Types ---------- */

export type UpdateRole = "CSR" | "Technician" | "Owner"
export type UpdateStatus = "New" | "In progress" | "Waiting on Customer" | "Scheduled" | "Resolved" | "Blocked"

export type ThreadUpdate = {
  id: string
  threadId: string
  role: UpdateRole
  status: UpdateStatus
  summary: string
  nextSteps?: string
  dueAt?: number | null
  createdAt: number
  createdBy?: string
}

/* ---------- Storage (local-only demo) ---------- */

const STORAGE_KEY = "updates:v1"
let memUpdates: ThreadUpdate[] | null = null

function loadAll(): ThreadUpdate[] {
  if (memUpdates) return memUpdates
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    memUpdates = raw ? (JSON.parse(raw) as ThreadUpdate[]) : []
  } catch {
    memUpdates = []
  }
  return memUpdates!
}

function saveAll(list: ThreadUpdate[]) {
  memUpdates = list
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("updates:changed"))
  } catch {}
}

function listByThread(threadId: string): ThreadUpdate[] {
  return loadAll()
    .filter((u) => u.threadId === threadId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function addUpdate(u: ThreadUpdate) {
  const list = loadAll()
  list.push(u)
  saveAll(list)
}

export function removeUpdate(id: string) {
  const list = loadAll().filter((u) => u.id !== id)
  saveAll(list)
}

export function updateUpdate(id: string, patch: Partial<ThreadUpdate>) {
  const list = loadAll().map((u) => (u.id === id ? { ...u, ...patch } : u))
  saveAll(list)
}

export function useThreadUpdates(threadId: string) {
  const [items, setItems] = React.useState<ThreadUpdate[]>(() => listByThread(threadId))
  React.useEffect(() => {
    const onChange = () => setItems(listByThread(threadId))
    window.addEventListener("updates:changed", onChange as EventListener)
    return () => window.removeEventListener("updates:changed", onChange as EventListener)
  }, [threadId])
  return items
}

export function useLatestUpdate(threadId: string) {
  const updates = useThreadUpdates(threadId)
  return updates[0] ?? null
}

/* ---------- Status badge (exported) ---------- */

export function UpdateStatusBadge({ status, className }: { status: UpdateStatus; className?: string }) {
  const { cls, label } = mapStatus(status)
  return (
    <Badge variant="outline" className={cn("text-[10px]", cls, className)}>
      {label}
    </Badge>
  )
}

function mapStatus(status: UpdateStatus) {
  switch (status) {
    case "New":
      return { cls: "border-slate-300", label: "New" }
    case "In progress":
      return { cls: "border-blue-300 text-blue-700", label: "In progress" }
    case "Waiting on Customer":
      return { cls: "border-amber-300 text-amber-700", label: "Waiting on Customer" }
    case "Scheduled":
      return { cls: "border-indigo-300 text-indigo-700", label: "Scheduled" }
    case "Resolved":
      return { cls: "border-emerald-300 text-emerald-700", label: "Resolved" }
    case "Blocked":
      return { cls: "border-destructive text-destructive", label: "Blocked" }
  }
}

/* ---------- Role templates ---------- */

const ROLE_TEMPLATES: Record<UpdateRole, Array<{ label: string; text: string }>> = {
  CSR: [
    {
      label: "Ack + next step",
      text: "Acknowledged the request. Shared next steps and set expectations with the customer.",
    },
    {
      label: "Waiting on customer",
      text: "Requested additional details from the customer and awaiting their response.",
    },
    { label: "Escalated", text: "Escalated to the relevant team with context and linked the conversation." },
  ],
  Technician: [
    { label: "Diagnosing", text: "Investigating root cause; reviewing logs and recent changes." },
    { label: "Patch ready", text: "Prepared a fix; pending review and scheduled deployment." },
    { label: "On‑site set", text: "Technician visit scheduled; ETA and scope confirmed." },
  ],
  Owner: [
    { label: "Approved", text: "Approved the proposed action plan and budget." },
    { label: "Priority set", text: "Set priority and aligned stakeholders on timeline." },
    { label: "Risk noted", text: "Identified key risk and mitigation plan." },
  ],
}

/* ---------- Minimal Updates Panel + Menus ---------- */

export function UpdatesPanel({
  threadId,
  currentUserId,
  currentUserLabel,
  defaultRole = "CSR",
}: {
  threadId: string
  currentUserId?: string
  currentUserLabel?: string
  defaultRole?: UpdateRole
}) {
  const updates = useThreadUpdates(threadId)
  const latest = updates[0] ?? null

  const [role, setRole] = React.useState<UpdateRole>(defaultRole)
  const [status, setStatus] = React.useState<UpdateStatus>(latest?.status ?? "In progress")
  const [summary, setSummary] = React.useState("")
  const [nextSteps, setNextSteps] = React.useState("")
  const [dueOpen, setDueOpen] = React.useState(false)
  const [due, setDue] = React.useState<string>("") // datetime-local string
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (latest?.status) setStatus(latest.status)
  }, [latest?.status])

  async function save() {
    if (!summary.trim() && !nextSteps.trim()) return
    setSaving(true)
    const dueAt = due ? new Date(due).getTime() : null
    addUpdate({
      id: crypto.randomUUID(),
      threadId,
      role,
      status,
      summary: summary.trim(),
      nextSteps: nextSteps.trim() || undefined,
      dueAt,
      createdAt: Date.now(),
      createdBy: currentUserId,
    })
    setSummary("")
    setNextSteps("")
    setDue("")
    setDueOpen(false)
    setSaving(false)
  }

  const canSave = summary.trim().length > 0 || nextSteps.trim().length > 0

  return (
    <Card className="border-muted/40">
      <CardContent className="space-y-3 p-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium">Updates</div>
          {latest ? (
            <>
              <UpdateStatusBadge status={latest.status} />
              <span className="text-xs text-muted-foreground">Last {formatTime(latest.createdAt)}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No updates yet</span>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {currentUserLabel ? <>You: {currentUserLabel}</> : null}
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Role</Label>
            <Select value={role} onValueChange={(v: UpdateRole) => setRole(v)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSR">
                  <span className="inline-flex items-center gap-2">
                    <User className="h-4 w-4" /> CSR
                  </span>
                </SelectItem>
                <SelectItem value="Technician">
                  <span className="inline-flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> Technician
                  </span>
                </SelectItem>
                <SelectItem value="Owner">
                  <span className="inline-flex items-center gap-2">
                    <Crown className="h-4 w-4" /> Owner
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={(v: UpdateStatus) => setStatus(v)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["New", "In progress", "Waiting on Customer", "Scheduled", "Resolved", "Blocked"] as UpdateStatus[]
                ).map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="inline-flex items-center gap-2">
                      <UpdateStatusBadge status={s} />
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Due</Label>
            {dueOpen ? (
              <div className="flex items-center gap-2">
                <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className="h-8" />
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setDueOpen(false)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start gap-2 bg-transparent"
                onClick={() => setDueOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
                {due ? new Date(due).toLocaleString() : "Add due date"}
                <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Summary</Label>
          <Textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short update for the team or customer…"
          />
          <div className="flex flex-wrap gap-1.5">
            {ROLE_TEMPLATES[role].map((t, i) => (
              <Button
                key={i}
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2"
                onClick={() => {
                  setSummary((s) => (s ? s + (s.endsWith("\n") ? "" : "\n") + t.text : t.text))
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              Next steps (internal)
            </div>
          </summary>
          <div className="mt-2">
            <Textarea
              rows={3}
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Checklist or handoff notes…"
            />
          </div>
        </details>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          <Button onClick={save} disabled={saving || !canSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save update
          </Button>
          {latest?.dueAt ? (
            <Badge variant="outline" className="text-[10px]">
              Due {formatTime(latest.dueAt)}
            </Badge>
          ) : null}
        </div>

        {/* Timeline with left-click menu */}
        {updates.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium">Timeline</div>
              <ul className="space-y-1.5">
                {updates.map((u) => {
                  const items: ClickMenuItem[] = [
                    {
                      label: "Copy summary",
                      icon: <Copy className="h-4 w-4" />,
                      onSelect: () => {
                        const text = [u.summary, u.nextSteps ? `Next: ${u.nextSteps}` : ""].filter(Boolean).join("\n")
                        navigator.clipboard?.writeText(text)
                      },
                    },
                    {
                      label: "Status",
                      children: (
                        [
                          "New",
                          "In progress",
                          "Waiting on Customer",
                          "Scheduled",
                          "Resolved",
                          "Blocked",
                        ] as UpdateStatus[]
                      ).map((s) => ({
                        label: s,
                        checked: u.status === s,
                        onSelect: () => updateUpdate(u.id, { status: s }),
                      })),
                    },
                    { separator: true },
                    {
                      label: "Delete update",
                      icon: <Trash2 className="h-4 w-4" />,
                      danger: true,
                      onSelect: () => removeUpdate(u.id),
                    },
                  ]
                  return (
                    <WithClickMenu key={u.id} items={items}>
                      <li className="rounded-md border bg-muted/20 p-2">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <RoleBadge role={u.role} />
                          <UpdateStatusBadge status={u.status} />
                          {u.dueAt ? <span>• Due {formatTime(u.dueAt)}</span> : null}
                          <span className="ml-auto">{formatTime(u.createdAt)}</span>
                        </div>
                        {u.summary && <div className="text-sm">{u.summary}</div>}
                        {u.nextSteps && <div className="mt-1 text-xs text-muted-foreground">Next: {u.nextSteps}</div>}
                      </li>
                    </WithClickMenu>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- Small helpers ---------- */

function RoleBadge({ role }: { role: UpdateRole }) {
  const { Icon, cls } = mapRole(role)
  return (
    <Badge variant="secondary" className={cn("gap-1 text-[10px]", cls)}>
      <Icon className="h-3.5 w-3.5" />
      {role}
    </Badge>
  )
}

function mapRole(role: UpdateRole) {
  switch (role) {
    case "CSR":
      return { Icon: User, cls: "" }
    case "Technician":
      return { Icon: Wrench, cls: "" }
    case "Owner":
      return { Icon: Crown, cls: "" }
  }
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
