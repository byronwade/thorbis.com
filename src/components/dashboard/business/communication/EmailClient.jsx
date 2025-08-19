"use client"

import React, { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  Forward,
  Mail,
  Reply,
  Search,
  Star,
  Trash2,
  Circle,
  UserPlus,
  Wand2,
  Loader2,
  Sparkles,
  MoreHorizontal,
  RefreshCw,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data
const USERS = [
  { id: "u1", name: "Alex Rivera", role: "Support", online: true, color: "bg-emerald-500" },
  { id: "u2", name: "Bri Chen", role: "Ops", online: true, color: "bg-sky-500" },
  { id: "u3", name: "Casey Green", role: "Success", online: true, color: "bg-warning" },
  { id: "u4", name: "Dee Patel", role: "Billing", online: true, color: "bg-fuchsia-500" },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500" },
]

const MAILS = [
  {
    id: "1",
    fromName: "Customer Support Request",
    fromEmail: "customer@example.com",
    subject: "Service inquiry - HVAC maintenance",
    preview: "Hi, I need to schedule maintenance for my HVAC system. Can someone please help?",
    date: "10:30 AM",
    labels: ["Support", "HVAC"],
    unread: true,
    assignedTo: "u1",
    viewers: ["u1", "u2"],
  },
  {
    id: "2",
    fromName: "Invoice System",
    fromEmail: "billing@company.com", 
    subject: "Payment received - Invoice #2024-001",
    preview: "Thank you for your payment. Invoice #2024-001 has been marked as paid.",
    date: "Yesterday",
    labels: ["Billing", "Payment"],
    starred: true,
    assignedTo: "u4",
    viewers: ["u4"],
  },
  {
    id: "3",
    fromName: "New Lead",
    fromEmail: "prospect@business.com",
    subject: "Interested in your plumbing services",
    preview: "We're looking for a reliable plumbing contractor for our commercial building...",
    date: "Mon",
    labels: ["Lead", "Plumbing", "Priority"],
    unread: true,
    starred: true,
    assignedTo: null,
    viewers: ["u1", "u3"],
  },
  {
    id: "4",
    fromName: "Follow-up Required",
    fromEmail: "followup@company.com",
    subject: "Customer satisfaction survey response",
    preview: "Customer feedback received for job #1041. Review required.",
    date: "Sun",
    labels: ["Follow-up", "Survey"],
    assignedTo: "u3",
    viewers: ["u3"],
  },
  {
    id: "5",
    fromName: "Marketing Team",
    fromEmail: "marketing@company.com",
    subject: "New promotional campaign materials",
    preview: "Here are the new promotional materials for our winter services campaign...",
    date: "Dec 15",
    labels: ["Marketing"],
    assignedTo: null,
    viewers: ["u2", "u5"],
  },
]

function getInitials(name) {
  const parts = name.split(" ")
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

export default function EmailClient() {
  const [scope, setScope] = useState("company")
  const [currentUserId, setCurrentUserId] = useState(USERS[0].id)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [assignFilter, setAssignFilter] = useState("all")
  const [labelFilter, setLabelFilter] = useState(null)
  const [selectedId, setSelectedId] = useState(MAILS[0]?.id ?? null)
  const [selectedIds, setSelectedIds] = useState([])
  const [density, setDensity] = useState("comfortable")
  const [viewMode, setViewMode] = useState("gmail")
  const [mailState, setMailState] = useState(MAILS)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeDraft, setComposeDraft] = useState("")

  // AI States
  const [inboxSummary, setInboxSummary] = useState(null)
  const [summarizingInbox, setSummarizingInbox] = useState(false)
  const [smartQuery, setSmartQuery] = useState("")
  const [smartMode, setSmartMode] = useState(false)

  const searchRef = useRef(null)

  // Derived data
  const filtered = useMemo(() => {
    return mailState.filter((m) => {
      const inScope = scope === "company" ? true : m.assignedTo === currentUserId
      const q = query.toLowerCase()
      const matchesQuery = !q || m.subject.toLowerCase().includes(q) || 
                          m.fromName.toLowerCase().includes(q) || 
                          m.preview.toLowerCase().includes(q)
      const matchesFilter = filter === "all" ? true : 
                           filter === "unread" ? !!m.unread : !!m.starred
      const matchesAssign = assignFilter === "all" ? true : 
                           assignFilter === "unassigned" ? !m.assignedTo : 
                           m.assignedTo === currentUserId
      const matchesLabel = labelFilter ? m.labels.includes(labelFilter) : true
      return inScope && matchesQuery && matchesFilter && matchesAssign && matchesLabel
    })
  }, [mailState, scope, currentUserId, query, filter, assignFilter, labelFilter])

  const selected = useMemo(() => 
    mailState.find((m) => m.id === selectedId) ?? null, 
    [mailState, selectedId]
  )

  const companyUnread = useMemo(() => 
    mailState.filter((m) => m.unread).length, 
    [mailState]
  )

  const personalUnread = useMemo(() => 
    mailState.filter((m) => m.unread && m.assignedTo === currentUserId).length,
    [mailState, currentUserId]
  )

  // Selection logic
  const allVisibleSelected = filtered.length > 0 && filtered.every((m) => selectedIds.includes(m.id))
  const someVisibleSelected = !allVisibleSelected && filtered.some((m) => selectedIds.includes(m.id))

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !filtered.some((m) => m.id === id))
        : [...new Set([...prev, ...filtered.map((m) => m.id)])],
    )
  }

  function handleSelect(id) {
    setSelectedId(id)
  }

  function handleAssign(mailId, userId) {
    setMailState((prev) => prev.map((m) => (m.id === mailId ? { ...m, assignedTo: userId } : m)))
  }

  function toggleUnread(mailId) {
    setMailState((prev) => prev.map((m) => (m.id === mailId ? { ...m, unread: !m.unread } : m)))
  }

  function toggleStar(mailId) {
    setMailState((prev) => prev.map((m) => (m.id === mailId ? { ...m, starred: !m.starred } : m)))
  }

  function assignToMe(mailId) {
    handleAssign(mailId, currentUserId)
  }

  function toggleLabel(mailId, label) {
    setMailState((prev) =>
      prev.map((m) =>
        m.id === mailId
          ? {
              ...m,
              labels: m.labels.includes(label) ? m.labels.filter((l) => l !== label) : [...m.labels, label],
            }
          : m,
      ),
    )
  }

  function openCompose(draft) {
    setComposeDraft(draft)
    setComposeOpen(true)
  }

  // AI Functions
  async function summarizeInboxNow() {
    setSummarizingInbox(true)
    setTimeout(() => {
      setInboxSummary(
        [
          "• 2 customer service requests requiring immediate attention",
          "• 1 new lead for plumbing services - high priority",
          "• 1 payment confirmation processed successfully",
          "• Suggested next: assign support tickets, respond to new lead, review customer feedback",
        ].join("\n"),
      )
      setSummarizingInbox(false)
    }, 700)
  }

  async function runSmartFilter() {
    if (!smartQuery.trim()) return
    const q = smartQuery.toLowerCase()
    setFilter(q.includes("unread") ? "unread" : q.includes("star") ? "starred" : "all")
    setAssignFilter(q.includes("me") ? "assignedToMe" : q.includes("unassigned") ? "unassigned" : "all")
    setLabelFilter(q.match(/support|billing|lead|marketing|priority|hvac|plumbing/i)?.[0] ?? null)
    setQuery(
      q.replace(/unread|starred|me|unassigned|support|billing|lead|marketing|priority|hvac|plumbing/gi, "").trim()
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Mail className="h-8 w-8 mr-3 text-primary" />
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer communications, support requests, and business correspondence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button size="sm" onClick={() => openCompose("")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 border-b bg-background/80 backdrop-blur p-2 md:flex-row md:items-center">
        {/* Top row - basic controls */}
        <div className="flex items-center gap-2">
          {/* Scope Switcher */}
          <Tabs value={scope} onValueChange={setScope} className="w-auto">
            <TabsList className="h-9">
              <TabsTrigger value="company" className="text-xs">
                Company Inbox
                {companyUnread > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                    {companyUnread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs">
                My Inbox
                {personalUnread > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                    {personalUnread}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search emails"
              className="h-9 w-full min-w-0 pl-8 text-sm"
            />
          </div>

          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FilterIcon className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Status</div>
              <DropdownMenuItem onSelect={() => setFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter("unread")}>Unread</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter("starred")}>Starred</DropdownMenuItem>
              <div className="my-1 h-px bg-border" />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Assignment</div>
              <DropdownMenuItem onSelect={() => setAssignFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAssignFilter("unassigned")}>Unassigned</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAssignFilter("assignedToMe")}>Assigned to me</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <LabelFilterDropdown labelFilter={labelFilter} setLabelFilter={setLabelFilter} />
        </div>

        {/* Second row - Smart Search */}
        <div className="flex items-center gap-2">
          <Button
            variant={smartMode ? "secondary" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setSmartMode((s) => !s)}
          >
            <Sparkles className="h-4 w-4" />
            Smart Search
          </Button>

          {smartMode && (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                placeholder='Try: "unread support emails" or "billing assigned to me"'
                className="h-9 flex-1"
                onKeyDown={(e) => e.key === "Enter" && runSmartFilter()}
              />
              <Button size="sm" onClick={runSmartFilter}>
                Apply
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={summarizeInboxNow} disabled={summarizingInbox}>
            <Wand2 className="h-4 w-4 mr-2" />
            {summarizingInbox ? "Analyzing..." : "AI Summary"}
          </Button>

          <Button
            variant={density === "compact" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setDensity((d) => (d === "compact" ? "comfortable" : "compact"))}
          >
            {density === "compact" ? "Compact" : "Comfortable"}
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {inboxSummary && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2">AI Inbox Summary</h4>
            <div className="text-sm whitespace-pre-wrap text-muted-foreground">
              {inboxSummary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Gmail-style Layout */}
        <div className="flex min-w-0 w-full flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <GmailListHeader
              checked={allVisibleSelected}
              indeterminate={someVisibleSelected}
              onToggleAll={toggleSelectAllVisible}
              total={filtered.length}
            />
            <ScrollArea className="flex-1">
              <GmailList
                mails={filtered}
                selectedId={selectedId}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelect={handleSelect}
                onToggleStar={toggleStar}
                density={density}
              />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Reader Sheet for Selected Email */}
      {selected && (
        <ReaderSheet
          mail={selected}
          users={USERS}
          currentUserId={currentUserId}
          onAssign={(uid) => handleAssign(selected.id, uid)}
          onOpenCompose={openCompose}
          onToggleStar={() => toggleStar(selected.id)}
          onToggleUnread={() => toggleUnread(selected.id)}
        />
      )}

      {/* Compose Modal */}
      <ComposeModal
        open={composeOpen}
        onOpenChange={setComposeOpen}
        draft={composeDraft}
        setDraft={setComposeDraft}
      />
    </div>
  )
}

// Gmail List Header Component
function GmailListHeader({ checked, indeterminate, onToggleAll, total }) {
  return (
    <div className="flex items-center justify-between border-b bg-background/60 backdrop-blur p-2 md:px-3">
      <div className="flex items-center gap-1">
        <div
          className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          role="button"
          tabIndex={0}
          onClick={onToggleAll}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleAll();
            }
          }}
        >
          <Checkbox checked={checked} className="h-4 w-4" />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>1–{Math.min(50, total)} of {total}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Gmail List Component
function GmailList({ mails, selectedId, selectedIds, onToggleSelect, onSelect, onToggleStar, density }) {
  const rowH = density === "compact" ? "py-2" : "py-3"
  
  return (
    <ul role="list" className="divide-y">
      {mails.map((m) => {
        const isSelected = selectedId === m.id
        const isChecked = selectedIds.includes(m.id)
        const unread = !!m.unread
        return (
          <li key={m.id}>
            <div className={cn(
              "group grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-3 hover:bg-muted/50",
              rowH,
              isSelected && "bg-muted/60",
            )}>
              {/* Checkbox */}
              <div className="flex items-center">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => onToggleSelect(m.id)}
                  className="h-4 w-4"
                />
              </div>

              {/* Star */}
              <button
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                onClick={() => onToggleStar(m.id)}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    m.starred ? "text-warning fill-yellow-500" : "text-muted-foreground",
                  )}
                />
              </button>

              {/* Sender + Subject */}
              <button className="min-w-0 text-left" onClick={() => onSelect(m.id)}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn(
                    "truncate text-sm",
                    unread ? "font-semibold text-foreground" : "text-foreground",
                  )}>
                    {m.fromName}
                  </span>
                  <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    <span className={cn(unread ? "font-medium text-foreground" : "")}>{m.subject}</span>
                    <span className="mx-2 text-muted-foreground/60">—</span>
                    <span className="truncate">{m.preview}</span>
                    {/* Labels */}
                    {m.labels.slice(0, 2).map((l) => (
                      <span key={l} className="ml-2 inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </button>

              {/* Date */}
              <div className="ml-auto text-right text-xs text-muted-foreground">{m.date}</div>
            </div>
          </li>
        )
      })}
      {mails.length === 0 && (
        <li className="p-6 text-sm text-muted-foreground text-center">No emails match your filters.</li>
      )}
    </ul>
  )
}

// Label Filter Dropdown
function LabelFilterDropdown({ labelFilter, setLabelFilter }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          {labelFilter ?? "All labels"}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => setLabelFilter(null)}>All labels</DropdownMenuItem>
        {["Support", "Billing", "Lead", "Marketing", "Priority", "HVAC", "Plumbing", "Follow-up"].map((l) => (
          <DropdownMenuItem key={l} onSelect={() => setLabelFilter(l)}>
            {l}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Reader Sheet Component 
function ReaderSheet({ mail, users, currentUserId, onAssign, onOpenCompose, onToggleStar, onToggleUnread }) {
  const [aiSummary, setAiSummary] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loading, setLoading] = useState({})

  const assignedUser = users.find((u) => u.id === mail.assignedTo)

  async function callAI(type) {
    setLoading((s) => ({ ...s, [type]: true }))
    setTimeout(() => {
      if (type === "summarize") {
        setAiSummary("• Customer requesting HVAC maintenance service\n• Urgent timing due to upcoming winter season\n• Suggest prompt scheduling and service quote")
      } else if (type === "suggest") {
        setAiSuggestions([
          "Thank you for reaching out! I'll connect you with our HVAC specialist right away.",
          "We can schedule your maintenance visit this week. What days work best for you?",
          "I've reviewed your request and will prepare a service quote for your HVAC system."
        ])
      }
      setLoading((s) => ({ ...s, [type]: false }))
    }, 700)
  }

  return (
    <Sheet open={true} modal={false}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-1 border-b p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleUnread()}>
              <Circle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleStar()}>
              <Star className={cn("h-4 w-4", mail.starred ? "text-warning fill-yellow-500" : "")} />
            </Button>

            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenCompose(`Re: ${mail.subject}\n\n`)}>
                <Reply className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Forward className="h-4 w-4" />
              </Button>

              {/* Assign Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <UserPlus className="h-4 w-4" />
                    {assignedUser ? assignedUser.name.split(' ')[0] : "Assign"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onAssign(null)}>Unassigned</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onAssign(currentUserId)}>Assign to me</DropdownMenuItem>
                  {users.map((u) => (
                    <DropdownMenuItem key={u.id} onSelect={() => onAssign(u.id)}>
                      {u.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AI Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-1">
                    <Wand2 className="h-4 w-4" />
                    AI
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => callAI("summarize")}>
                    {loading.summarize && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Summarize email
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => callAI("suggest")}>
                    {loading.suggest && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Suggest replies
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(mail.fromName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold">{mail.subject}</h2>
                  <div className="text-sm text-muted-foreground">
                    From: <span className="text-foreground">{mail.fromName}</span> &lt;{mail.fromEmail}&gt;
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {mail.labels.map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{mail.date}</div>
              </div>

              {/* Body */}
              <Card>
                <CardContent className="p-4 prose prose-sm max-w-none">
                  <p>{mail.preview}</p>
                  <p>Could you please let me know your available time slots for this week? I'd prefer morning appointments if possible.</p>
                  <p>Thanks for your prompt attention to this matter.</p>
                  <p>Best regards,<br />{mail.fromName}</p>
                </CardContent>
              </Card>

              {/* AI Summary */}
              {aiSummary && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                    <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {aiSummary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">Suggested Replies</h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-1 rounded border bg-muted/30 p-2 text-sm">{s}</div>
                          <Button size="sm" onClick={() => onOpenCompose(s)}>
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Simple Compose Modal
function ComposeModal({ open, onOpenChange, draft, setDraft }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <div className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Compose Reply</h2>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            placeholder="Type your reply..."
            className="w-full resize-none rounded border bg-background p-3 text-sm"
          />
          <div className="flex gap-2">
            <Button disabled>Send</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
