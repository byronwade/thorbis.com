"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Badge } from "@components/ui/badge"
import { ScrollArea } from "@components/ui/scroll-area"
import {
Select,
SelectTrigger,
SelectValue,
SelectContent,
SelectItem,
} from "@components/ui/select"
import { Switch } from "@components/ui/switch"
import { Card, CardContent } from "@components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { Separator } from "@components/ui/separator"
import { cn } from "@lib/utils"
import { Copy, Plus, Trash2, MoreHorizontal, Play, Check, UserPlus, Tags, Wrench } from 'lucide-react'
import { useToast } from "@hooks/use-toast"

// Mail types (mirror app/page.tsx)
type MailItem = {
id: string
fromName: string
fromEmail: string
subject: string
preview: string
date: string
labels: string[]
unread?: boolean
starred?: boolean
assignedTo?: string | null
viewers?: string[]
}
type User = { id: string; name: string; role?: string; online?: boolean; color?: string }

type ConditionField = "subject" | "from" | "body" | "labels" | "unread" | "starred" | "assignedTo"
type ConditionOp =
| "contains"
| "not_contains"
| "equals"
| "starts_with"
| "ends_with"
| "has_any"
| "has_all"
| "is"
type RuleCondition = {
id: string
field: ConditionField
op: ConditionOp
value?: string
values?: string[] // for labels
}
type RuleActions = {
addLabels: string[]
assignTo: string | null
convertToWO: boolean
}
type Rule = {
id: string
name: string
active: boolean
match: "all" | "any"
conditions: RuleCondition[]
actions: RuleActions
}

const DEFAULT_LABELS = ["Orders", "Support", "Billing", "Deployments", "Marketing", "Priority", "Infra"]

export function RulesModal({
open,
onOpenChange,
users,
mails,
}: {
open: boolean
onOpenChange: (open: boolean) => void
users: User[]
mails: MailItem[]
}) {
const { toast } = useToast()

const [rules, setRules] = useLocalRules()
const [selectedId, setSelectedId] = React.useState<string | null>(null)
const selected = rules.find((r) => r.id === selectedId) ?? rules[0]

React.useEffect(() => {
  if (open && rules.length > 0 && !selectedId) {
    setSelectedId(rules[0].id)
  }
}, [open, rules, selectedId])

function addRule() {
  const r: Rule = {
    id: crypto.randomUUID(),
    name: "New Rule",
    active: true,
    match: "all",
    conditions: [
      { id: crypto.randomUUID(), field: "subject", op: "contains", value: "invoice" },
    ],
    actions: { addLabels: ["Billing"], assignTo: null, convertToWO: false },
  }
  const next = [r, ...rules]
  setRules(next)
  setSelectedId(r.id)
}

function duplicateRule(id: string) {
  const src = rules.find((r) => r.id === id)
  if (!src) return
  const dup: Rule = {
    ...src,
    id: crypto.randomUUID(),
    name: `${src.name} (copy)`,
    conditions: src.conditions.map((c) => ({ ...c, id: crypto.randomUUID() })),
  }
  const next = [dup, ...rules]
  setRules(next)
  setSelectedId(dup.id)
}

function deleteRule(id: string) {
  const next = rules.filter((r) => r.id !== id)
  setRules(next)
  if (selectedId === id) setSelectedId(next[0]?.id ?? null)
}

function updateRule(patch: Partial<Rule>) {
  if (!selected) return
  setRules((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)))
}

function updateCondition(condId: string, patch: Partial<RuleCondition>) {
  if (!selected) return
  setRules((prev) =>
    prev.map((r) =>
      r.id === selected.id
        ? { ...r, conditions: r.conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)) }
        : r
    )
  )
}

function addCondition() {
  if (!selected) return
  const c: RuleCondition = { id: crypto.randomUUID(), field: "subject", op: "contains", value: "" }
  setRules((prev) => prev.map((r) => (r.id === selected.id ? { ...r, conditions: [...r.conditions, c] } : r)))
}

function removeCondition(condId: string) {
  if (!selected) return
  setRules((prev) =>
    prev.map((r) =>
      r.id === selected.id ? { ...r, conditions: r.conditions.filter((c) => c.id !== condId) } : r
    )
  )
}

// Live preview: which mails would match (design-only)
const previewMatches = React.useMemo(() => {
  if (!selected) return []
  return mails.filter((m) => selected.active && evalRule(selected, m))
}, [selected, mails])

function runSimulation() {
  if (!selected) return
  const count = previewMatches.length
  toast({
    title: "Simulated run",
    description: `${count} threads would be affected by "${selected.name}".`,
  })
}

function copyAsText() {
  if (!selected) return
  const text = serializeRule(selected)
  navigator.clipboard?.writeText(text).then(() => {
    toast({ title: "Copied", description: "Rule copied as text." })
  })
}

return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="p-0 overflow-hidden w-full
                 sm:max-w-[calc(100vw-4rem)]
                 md:max-w-[calc(100vw-20em)]
                 h-[calc(100vh-2rem)]
                 sm:h-[calc(100vh-4rem)]
                 md:h-[calc(100vh-6rem)]"
    >
      <DialogHeader className="border-b px-4 py-3">
        <DialogTitle>Automation Rules</DialogTitle>
      </DialogHeader>

      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Rules list */}
        <div className="flex min-h-0 flex-col border-r">
          <div className="flex items-center gap-2 p-2">
            <Button size="sm" className="gap-2" onClick={addRule}>
              <Plus className="h-4 w-4" />
              New Rule
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2">
              {rules.length === 0 && (
                <div className="rounded-md border p-3 text-xs text-muted-foreground">
                  Create your first rule to auto‑label, assign, or convert to work orders.
                </div>
              )}
              <div className="space-y-1">
                {rules.map((r) => (
                  <RuleListItem
                    key={r.id}
                    rule={r}
                    active={r.id === selected?.id}
                    onClick={() => setSelectedId(r.id)}
                    onToggle={(checked) => {
                      setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: checked } : x)))
                    }}
                    onDuplicate={() => duplicateRule(r.id)}
                    onDelete={() => deleteRule(r.id)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Editor */}
        <div className="flex min-h-0 flex-1 flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Label htmlFor="rname" className="whitespace-nowrap text-xs">Name</Label>
                  <Input
                    id="rname"
                    value={selected.name}
                    onChange={(e) => updateRule({ name: e.target.value })}
                    placeholder="Rule name"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="ractive"
                    checked={selected.active}
                    onCheckedChange={(v) => updateRule({ active: v })}
                  />
                  <Label htmlFor="ractive" className="text-xs">Active</Label>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={copyAsText}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" className="gap-2" onClick={runSimulation}>
                  <Play className="h-4 w-4" />
                  Simulate
                </Button>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-[1.2fr_1fr]">
                {/* IF */}
                <div className="flex min-h-0 flex-col border-r">
                  <div className="flex items-center gap-2 p-3">
                    <div className="text-sm font-medium">IF</div>
                    <Select
                      value={selected.match}
                      onValueChange={(v: "all" | "any") => updateRule({ match: v })}
                    >
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All conditions match</SelectItem>
                        <SelectItem value="any">Any condition matches</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" onClick={addCondition}>Add condition</Button>
                    </div>
                  </div>
                  <Separator />
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 p-3">
                      {selected.conditions.length === 0 && (
                        <div className="rounded-md border p-3 text-xs text-muted-foreground">No conditions. Add one above.</div>
                      )}
                      {selected.conditions.map((c) => (
                        <ConditionRow
                          key={c.id}
                          cond={c}
                          users={users}
                          onChange={(patch) => updateCondition(c.id, patch)}
                          onRemove={() => removeCondition(c.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* THEN */}
                <div className="flex min-h-0 flex-col">
                  <div className="flex items-center gap-2 p-3">
                    <div className="text-sm font-medium">THEN</div>
                  </div>
                  <Separator />
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 p-3">
                      {/* Add labels */}
                      <Card>
                        <CardContent className="space-y-2 p-3">
                          <div className="flex items-center gap-2">
                            <Tags className="h-4 w-4" />
                            <div className="text-sm font-medium">Add labels</div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {DEFAULT_LABELS.map((l) => {
                              const on = selected.actions.addLabels.includes(l)
                              return (
                                <button
                                  key={l}
                                  className={cn(
                                    "rounded-md border px-2 py-1 text-xs",
                                    on ? "bg-emerald-500/10 border-emerald-300 text-emerald-700" : "bg-muted/30"
                                  )}
                                  onClick={() => {
                                    const next = on
                                      ? selected.actions.addLabels.filter((x) => x !== l)
                                      : [...selected.actions.addLabels, l]
                                    updateRule({ actions: { ...selected.actions, addLabels: next } })
                                  }}
                                >
                                  {l}
                                </button>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Assign */}
                      <Card>
                        <CardContent className="space-y-2 p-3">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            <div className="text-sm font-medium">Assign</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={selected.actions.assignTo ?? "none"}
                              onValueChange={(v) =>
                                updateRule({ actions: { ...selected.actions, assignTo: v === "none" ? null : v } })
                              }
                            >
                              <SelectTrigger className="h-8 w-60">
                                <SelectValue placeholder="Choose teammate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Leave unassigned</SelectItem>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name} {u.role ? `(${u.role})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Convert to Work Order */}
                      <Card>
                        <CardContent className="space-y-2 p-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            <div className="text-sm font-medium">Convert to Work Order</div>
                            <Switch
                              checked={selected.actions.convertToWO}
                              onCheckedChange={(v) => updateRule({ actions: { ...selected.actions, convertToWO: v } })}
                              className="ml-auto"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Uses your default WO prefill (priority and SLA computed from labels/keywords).
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Preview */}
                    <div className="border-t p-3">
                      <div className="text-xs font-medium">Preview</div>
                      <div className="mt-1 rounded-md border bg-muted/30 p-2 text-xs">
                        {selected.active ? (
                          <>
                            <b>{previewMatches.length}</b> threads would match and then:
                            <ul className="mt-1 list-inside list-disc">
                              {selected.actions.addLabels.length > 0 && (
                                <li>Add labels: {selected.actions.addLabels.join(", ")}</li>
                              )}
                              {selected.actions.assignTo ? (
                                <li>
                                  Assign to{" "}
                                  {users.find((u) => u.id === selected.actions.assignTo)?.name ?? "user"}
                                </li>
                              ) : (
                                <li>Leave assignment unchanged</li>
                              )}
                              {selected.actions.convertToWO && <li>Convert to Work Order</li>}
                              {!selected.actions.convertToWO &&
                                selected.actions.addLabels.length === 0 &&
                                !selected.actions.assignTo && <li>No changes</li>}
                            </ul>
                          </>
                        ) : (
                          "Rule is inactive."
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          ) : (
            <div className="m-auto p-6 text-sm text-muted-foreground">No rule selected.</div>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 p-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        <Button onClick={() => { runSimulation(); onOpenChange(false) }}>Done</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
}

/* ---------- Subcomponents ---------- */

function RuleListItem({
rule,
active,
onClick,
onToggle,
onDuplicate,
onDelete,
}: {
rule: Rule
active: boolean
onClick: () => void
onToggle: (checked: boolean) => void
onDuplicate: () => void
onDelete: () => void
}) {
return (
  <div
    className={cn(
      "group flex items-center gap-2 rounded-md border px-2 py-2 text-sm",
      active ? "border-foreground/20 bg-muted/40" : "border-transparent hover:bg-muted/30"
    )}
    onClick={onClick}
    role="button"
  >
    <Switch checked={rule.active} onCheckedChange={onToggle} />
    <div className="min-w-0 flex-1">
      <div className="truncate font-medium">{rule.name}</div>
      <div className="truncate text-xs text-muted-foreground">
        {rule.conditions.length} condition{rule.conditions.length === 1 ? "" : "s"}
      </div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
}

function ConditionRow({
cond,
users,
onChange,
onRemove,
}: {
cond: RuleCondition
users: User[]
onChange: (patch: Partial<RuleCondition>) => void
onRemove: () => void
}) {
const field = cond.field
const isLabelField = field === "labels"
const isFlagField = field === "unread" || field === "starred"
const isAssigneeField = field === "assignedTo"

const opsForField: Array<{ value: ConditionOp; label: string }> = isLabelField
  ? [
      { value: "has_any", label: "includes any of" },
      { value: "has_all", label: "includes all of" },
    ]
  : isFlagField
  ? [{ value: "is", label: "is" }]
  : isAssigneeField
  ? [{ value: "is", label: "is" }]
  : [
      { value: "contains", label: "contains" },
      { value: "not_contains", label: "does not contain" },
      { value: "equals", label: "equals" },
      { value: "starts_with", label: "starts with" },
      { value: "ends_with", label: "ends with" },
    ]

return (
  <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
    <Select value={cond.field} onValueChange={(v: ConditionField) => onChange({ field: v, op: defaultOpFor(v), value: "", values: [] })}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="subject">Subject</SelectItem>
        <SelectItem value="from">From</SelectItem>
        <SelectItem value="body">Body</SelectItem>
        <SelectItem value="labels">Labels</SelectItem>
        <SelectItem value="unread">Unread</SelectItem>
        <SelectItem value="starred">Starred</SelectItem>
        <SelectItem value="assignedTo">Assigned to</SelectItem>
      </SelectContent>
    </Select>

    <Select value={cond.op} onValueChange={(v: ConditionOp) => onChange({ op: v })}>
      <SelectTrigger className="h-8 w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opsForField.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Value control */}
    {!isLabelField && !isFlagField && !isAssigneeField && (
      <Input
        placeholder="Value"
        className="h-8 w-[280px]"
        value={cond.value ?? ""}
        onChange={(e) => onChange({ value: e.target.value })}
      />
    )}

    {isFlagField && (
      <Select
        value={String(cond.value ?? "true")}
        onValueChange={(v) => onChange({ value: v })}
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    )}

    {isAssigneeField && (
      <Select
        value={String(cond.value ?? "any")}
        onValueChange={(v) => onChange({ value: v })}
      >
        <SelectTrigger className="h-8 w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Anyone</SelectItem>
          <SelectItem value="none">Unassigned</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name} {u.role ? `(${u.role})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}

    {isLabelField && (
      <LabelPicker
        values={cond.values ?? []}
        onChange={(vals) => onChange({ values: vals })}
      />
    )}

    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onRemove} aria-label="Remove condition">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
)
}

function LabelPicker({
values,
onChange,
}: { values: string[]; onChange: (vals: string[]) => void }) {
return (
  <div className="flex flex-wrap items-center gap-1">
    {DEFAULT_LABELS.map((l) => {
      const on = values.includes(l)
      return (
        <button
          key={l}
          className={cn(
            "rounded-md border px-2 py-1 text-xs",
            on ? "bg-emerald-500/10 border-emerald-300 text-emerald-700" : "bg-muted/30"
          )}
          onClick={() => {
            const next = on ? values.filter((x) => x !== l) : [...values, l]
            onChange(next)
          }}
        >
          {on ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
          {l}
        </button>
      )
    })}
  </div>
)
}

/* ---------- Persistence ---------- */

function useLocalRules() {
const [rules, setRules] = React.useState<Rule[]>(() => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("rules:v1")
    if (raw) return JSON.parse(raw)
  } catch {}
  // seed one example
  return [
    {
      id: crypto.randomUUID(),
      name: "Billing invoices → label + assign",
      active: true,
      match: "any",
      conditions: [
        { id: crypto.randomUUID(), field: "subject", op: "contains", value: "invoice" },
        { id: crypto.randomUUID(), field: "from", op: "contains", value: "billing@" },
      ],
      actions: { addLabels: ["Billing"], assignTo: null, convertToWO: false },
    },
    {
      id: crypto.randomUUID(),
      name: "Urgent or Priority → WO",
      active: true,
      match: "any",
      conditions: [
        { id: crypto.randomUUID(), field: "subject", op: "contains", value: "urgent" },
        { id: crypto.randomUUID(), field: "labels", op: "has_any", values: ["Priority"] },
      ],
      actions: { addLabels: ["Support"], assignTo: null, convertToWO: true },
    },
  ] as Rule[]
})

React.useEffect(() => {
  try {
    localStorage.setItem("rules:v1", JSON.stringify(rules))
  } catch {}
}, [rules])

return [rules, setRules] as const
}

/* ---------- Evaluation ---------- */

function defaultOpFor(field: ConditionField): ConditionOp {
if (field === "labels") return "has_any"
if (field === "unread" || field === "starred") return "is"
if (field === "assignedTo") return "is"
return "contains"
}

function evalRule(rule: Rule, mail: MailItem): boolean {
const evals = rule.conditions.map((c) => evalCondition(c, mail))
return rule.match === "all" ? evals.every(Boolean) : evals.some(Boolean)
}

function evalCondition(cond: RuleCondition, mail: MailItem): boolean {
const field = cond.field
const op = cond.op
const val = (cond.value ?? "").toLowerCase()
const vals = cond.values ?? []

if (field === "subject") {
  return matchText(mail.subject, op, val)
}
if (field === "from") {
  const from = `${mail.fromName} ${mail.fromEmail}`.toLowerCase()
  return matchText(from, op, val)
}
if (field === "body") {
  return matchText(mail.preview.toLowerCase(), op, val)
}
if (field === "labels") {
  const set = new Set(mail.labels)
  if (op === "has_any") return vals.some((v) => set.has(v))
  if (op === "has_all") return vals.every((v) => set.has(v))
  return false
}
if (field === "unread") {
  const b = String(cond.value ?? "true") === "true"
  return !!mail.unread === b
}
if (field === "starred") {
  const b = String(cond.value ?? "true") === "true"
  return !!mail.starred === b
}
if (field === "assignedTo") {
  const v = cond.value ?? "any"
  if (v === "any") return true
  if (v === "none") return !mail.assignedTo
  return mail.assignedTo === v
}
return false
}

function matchText(source: string, op: ConditionOp, val: string) {
const s = source.toLowerCase()
switch (op) {
  case "contains":
    return s.includes(val)
  case "not_contains":
    return !s.includes(val)
  case "equals":
    return s === val
  case "starts_with":
    return s.startsWith(val)
  case "ends_with":
    return s.endsWith(val)
  default:
    return false
}
}

function serializeRule(rule: Rule) {
const lines: string[] = []
lines.push(`Rule: ${rule.name}`)
lines.push(`Active: ${rule.active ? "yes" : "no"}`)
lines.push(`Match: ${rule.match.toUpperCase()}`)
for (const c of rule.conditions) {
  const label =
    c.field === "labels" ? `${c.op} [${(c.values ?? []).join(", ")}]` : `${c.op} "${c.value ?? ""}"`
  lines.push(`- ${c.field} ${label}`)
}
const acts: string[] = []
if (rule.actions.addLabels.length) acts.push(`Add labels: ${rule.actions.addLabels.join(", ")}`)
if (rule.actions.assignTo) acts.push(`Assign to: ${rule.actions.assignTo}`)
if (rule.actions.convertToWO) acts.push("Convert to Work Order")
if (!acts.length) acts.push("No changes")
lines.push("Then:")
for (const a of acts) lines.push(`• ${a}`)
return lines.join("\n")
}
