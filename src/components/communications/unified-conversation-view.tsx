"use client"

import * as React from "react"
import { Card, CardContent } from "@components/ui/card"
import { ScrollArea } from "@components/ui/scroll-area"
import { ChatComposer, type Attachment as ChatAttachment } from "@components/chat-composer"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { Badge } from "@components/ui/badge"
import { ChevronDown } from 'lucide-react'
import { ChannelBadge } from "./channel-badge"
import { cn } from "@lib/utils"
import type { Conversation, Message, ChannelType, AttachmentMeta } from "@lib/unified/types"

export function UnifiedConversationView({
  conversation,
  messages,
  currentUserId = "u1",
  onSent,
}: {
  conversation: Conversation
  messages: Message[]
  currentUserId?: string
  onSent?: (m: Message) => void
}) {
  const [channel, setChannel] = React.useState<ChannelType>("email")
  const viewportRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = viewportRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  async function send(payload: { text: string; attachments: ChatAttachment[] }) {
    const t = payload.text.trim()
    if (!t && payload.attachments.length === 0) return
    try {
      const attachments: AttachmentMeta[] = payload.attachments.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
      }))
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          direction: "outbound",
          authorId: currentUserId,
          text: t,
          attachments,
          external:
            channel === "email"
              ? { channel: "email", messageId: "<local_temp@mx.acme.co>", threadId: "<thread_ref_local>" }
              : channel === "sms"
              ? { channel: "sms", provider: "twilio", sid: "SM_local_send" }
              : channel === "webchat"
              ? { channel: "webchat", sessionId: "wc_local" }
              : channel === "whatsapp"
              ? { channel: "whatsapp", provider: "twilio", sid: "WA_local" }
              : channel === "teams"
              ? { channel: "teams", teamId: "T123", channelId: "C567", messageId: "M_local" }
              : { channel: "internal", noteType: "private" },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Send failed")
      onSent?.(data.message)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b p-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold">{conversation.subject}</div>
            <Badge variant="secondary" className="text-[10px]">{conversation.labels.join(" • ")}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {conversation.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)}
          </div>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <Badge variant="outline" className="text-[10px]">ID: {conversation.id}</Badge>
          <Badge variant="outline" className="text-[10px]">Updated: {formatTime(conversation.updatedAt)}</Badge>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea ref={viewportRef} className="flex-1">
        <div className="mx-auto w-full max-w-3xl p-3">
          <div className="space-y-3">
            {messages.map((m, i) => {
              const side = m.direction === "inbound" ? "left" : m.direction === "outbound" ? "right" : "center"
              return (
                <div key={m.id} className={cn("flex", side === "left" ? "justify-start" : side === "right" ? "justify-end" : "justify-center")}>
                  <Card className={cn("max-w-[92%] md:max-w-[80%] overflow-hidden", side === "center" && "w-full")}>
                    <CardContent className="p-2.5">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <ChannelBadge channel={m.channel} />
                        <span>{m.direction === "inbound" ? "From customer" : m.direction === "outbound" ? "From agent" : "Internal note"}</span>
                        <span className="ml-auto">{formatTime(m.createdAt)}</span>
                      </div>
                      {m.text && <div className="whitespace-pre-wrap text-sm">{m.text}</div>}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.attachments.map((a) => (
                            <Badge key={a.id} variant="secondary" className="max-w-[240px] truncate">📎 {a.name}</Badge>
                          ))}
                        </div>
                      )}
                      {/* Metadata strip */}
                      <Separator className="my-2" />
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <StatusPill status={m.deliveryStatus} />
                        {renderExternalMeta(m)}
                        {m.readReceipts && m.readReceipts.length > 0 && (
                          <span className="ml-auto">{m.readReceipts.length} read</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t p-2">
        <div className="mx-auto flex w-full max-w-3xl items-start gap-2">
          <div className="pt-0.5">
            <ChannelPicker value={channel} onChange={setChannel} />
          </div>
          <div className="flex-1">
            <ChatComposer
              users={conversation.participants
                .filter(p => p.role !== "system")
                .map(p => ({ id: p.id, name: p.name }))}
              placeholder="Write a reply or add an internal note…"
              onSend={send}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChannelPicker({ value, onChange }: { value: ChannelType; onChange: (v: ChannelType) => void }) {
  // Simple inline picker with a tiny dropdown-like feel (no extra deps)
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ChannelBadge channel={value} />
        <ChevronDown className="ml-1 h-4 w-4 opacity-60" />
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
          {(["email", "sms", "webchat", "whatsapp", "teams", "internal"] as ChannelType[]).map((ch) => (
            <button
              key={ch}
              onClick={() => {
                onChange(ch)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm hover:bg-muted/60",
                ch === value && "bg-muted/50"
              )}
            >
              <ChannelBadge channel={ch} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: Message["deliveryStatus"] }) {
  const cls =
    status === "failed"
      ? "border-destructive text-destructive"
      : status === "read"
      ? "border-emerald-300 text-emerald-700"
      : status === "delivered"
      ? "border-blue-300 text-blue-700"
      : status === "sent"
      ? "border-slate-300"
      : "border-muted-foreground/30"
  return <Badge variant="outline" className={cn("text-[10px]", cls)}>{status}</Badge>
}

function renderExternalMeta(m: Message) {
  switch (m.external.channel) {
    case "email":
      return <span>msg: {m.external.messageId}</span>
    case "sms":
      return <span>sid: {m.external.sid}</span>
    case "webchat":
      return <span>session: {m.external.sessionId}</span>
    case "whatsapp":
      return <span>sid: {m.external.sid}</span>
    case "teams":
      return <span>msg: {m.external.messageId}</span>
    case "internal":
      return <span>note</span>
  }
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
