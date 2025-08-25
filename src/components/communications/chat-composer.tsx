"use client"

import * as React from "react"
import { Button } from "@components/ui/button"
import { Textarea } from "@components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { ScrollArea } from "@components/ui/scroll-area"
import { Badge } from "@components/ui/badge"
import { cn } from "@lib/utils"
import { Send, Paperclip, ImageIcon, Smile, Wand2, Bold, Italic, Code2, LinkIcon, AtSign, X, Loader2 } from 'lucide-react'

type User = { id: string; name: string }

export type Attachment = {
id: string
name: string
size: number
type: string
url: string // object URL for preview
isImage: boolean
}

export function ChatComposer({
placeholder = "Ask a follow‑up…",
users = [],
onSend,
}: {
placeholder?: string
users?: User[]
onSend: (payload: { text: string; attachments: Attachment[] }) => void
}) {
const [value, setValue] = React.useState("")
const [attachments, setAttachments] = React.useState<Attachment[]>([])
const [dragging, setDragging] = React.useState(false)
const [aiPending, setAiPending] = React.useState<null | "shorten" | "polish" | "friendly" | "autocomplete">(null)
const [hint, setHint] = React.useState<string | null>(null)

const fileInputRef = React.useRef<HTMLInputElement | null>(null)
const textRef = React.useRef<HTMLTextAreaElement | null>(null)

// Autosize textarea (min 44px, max 220px) and keep it feeling like one big editor.
React.useEffect(() => {
  const el = textRef.current
  if (!el) return
  el.style.height = "0px"
  el.style.height = Math.min(220, Math.max(44, el.scrollHeight)) + "px"
}, [value])

React.useEffect(() => {
  return () => attachments.forEach((a) => URL.revokeObjectURL(a.url))
}, [attachments])

function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).slice(0, 10)
  const mapped: Attachment[] = list.map((f) => {
    const url = URL.createObjectURL(f)
    return {
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      url,
      isImage: /^image\//.test(f.type),
    }
  })
  setAttachments((prev) => [...prev, ...mapped])
}

function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
  const files = e.clipboardData?.files
  if (files && files.length > 0) {
    e.preventDefault()
    handleFiles(files)
  }
}

function onDrop(e: React.DragEvent) {
  e.preventDefault()
  setDragging(false)
  if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
}

function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    send()
  }
  if (e.key === "Tab" && hint) {
    e.preventDefault()
    setValue((v) => v + (v.endsWith(" ") ? "" : " ") + hint)
    setHint(null)
  }
}

function send() {
  const text = value.trim()
  if (!text && attachments.length === 0) return
  onSend({ text, attachments })
  setValue("")
  setHint(null)
  setAttachments((prev) => {
    prev.forEach((a) => URL.revokeObjectURL(a.url))
    return []
  })
  requestAnimationFrame(() => textRef.current?.focus())
}

// Formatting helpers (Markdown-like in a plain textarea)
function wrap(prefix: string, suffix = prefix) {
  const el = textRef.current
  if (!el) return
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const before = value.slice(0, start)
  const sel = value.slice(start, end)
  const after = value.slice(end)
  const next = before + prefix + sel + suffix + after
  setValue(next)
  const caret = start + prefix.length + sel.length + suffix.length
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(caret, caret)
  })
}

function insertLink() {
  const url = prompt("Enter URL")
  if (!url) return
  wrap("[", `](${url})`)
}

function insertMention(u: User) {
  setValue((v) => (v.endsWith(" ") || v.length === 0 ? v : v + " ") + `@${u.name.split(" ")[0]}` + " ")
  requestAnimationFrame(() => textRef.current?.focus())
}

async function aiRewrite(style: "shorten" | "polish" | "friendly") {
  if (!value.trim()) return
  setAiPending(style)
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "rewrite", style, text: value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "AI rewrite failed")
    setValue(data.text)
  } catch {
    // graceful fallback
    setValue((t) => (style === "shorten" ? t.slice(0, Math.ceil(t.length * 0.7)) + "…" : `💬 ${t}`))
  } finally {
    setAiPending(null)
  }
}

async function aiAutocomplete() {
  if (!value.trim()) return
  setAiPending("autocomplete")
  setHint(null)
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "assistant",
        prompt: `Continue this chat message naturally and concisely. Message so far:\n"""${value}"""`,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "AI complete failed")
    const suggestion = String(data.text || "").split("\n").join(" ").trim()
    setHint(suggestion)
  } catch {
    setHint("let me know if that works for you.")
  } finally {
    setAiPending(null)
  }
}

function removeAttachment(id: string) {
  setAttachments((prev) => {
    const a = prev.find((x) => x.id === id)
    if (a) URL.revokeObjectURL(a.url)
    return prev.filter((x) => x.id !== id)
  })
}

return (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      send()
    }}
    className={cn(
      "relative rounded-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden",
      "transition-colors focus-within:border-foreground/30"
    )}
    onDragOver={(e) => {
      e.preventDefault()
      setDragging(true)
    }}
    onDragLeave={() => setDragging(false)}
    onDrop={onDrop}
  >
    {/* Attachments strip (inside the same border; collapses to 0 when empty) */}
    <div
      className={cn(
        "relative overflow-hidden border-b transition-[height,opacity,margin] duration-300",
        attachments.length ? "h-[72px] opacity-100" : "h-0 opacity-0 pointer-events-none"
      )}
    >
      <div className="from-background to-transparent pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r opacity-0 group-hover:opacity-100" />
      <div className="from-background to-transparent pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l opacity-0 group-hover:opacity-100" />
      <div className="overflow-x-auto">
        <div className="flex w-max items-center gap-2 px-3 py-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className={cn("group relative shrink-0 overflow-hidden rounded-md border", a.isImage ? "h-14 w-20" : "px-2 py-1")}
            >
              {a.isImage ? (
                <img
                  src={a.url || "/placeholder.svg?height=80&width=120&query=chat%20image%20attachment"}
                  alt={a.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center gap-2 px-2">
                  <Badge variant="secondary" className="text-[10px]">
                    File
                  </Badge>
                  <span className="max-w-[180px] truncate text-xs">{a.name}</span>
                </div>
              )}
              <button
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100"
                aria-label="Remove"
                onClick={() => removeAttachment(a.id)}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-14 w-20 shrink-0 justify-center gap-1 px-2"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-[11px]">Add</span>
          </Button>
        </div>
      </div>
    </div>

    {/* Unified editor area (textarea + send button + AI inline hint) */}
    <div className="relative pb-10">
      <Textarea
        ref={textRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        className={cn(
          "h-[44px] min-h-[44px] max-h-[220px] w-full resize-none border-0 px-3 pt-3",
          "focus-visible:ring-0 placeholder:text-muted-foreground"
        )}
      />

      {/* Inline AI hint */}
      {hint && (
        <div className="pointer-events-none absolute bottom-[44px] left-3 right-16 truncate text-sm text-muted-foreground/70">
          {value && !value.endsWith(" ") ? " " : ""}
          {hint}
        </div>
      )}

      {/* Integrated toolbar row INSIDE the same border */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex h-10 items-center gap-1 bg-background/95 px-2 rounded-b-xl">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.currentTarget.files && handleFiles(e.currentTarget.files)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          type="button"
          title="Attach files"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Emoji */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="mb-1 text-xs text-muted-foreground">Quick emoji</div>
            <div className="grid grid-cols-8 gap-1">
              {["👍","🎉","✅","🔥","🙌","😊","🤔","🚀","🙏","🧠","🛠️","💡","💬","📎","🕐","⚡"].map((e) => (
                <button
                  key={e}
                  className="rounded-md px-1 py-1 text-lg hover:bg-muted"
                  onClick={() =>
                    setValue((v) => v + (v.endsWith(" ") || v.length === 0 ? "" : " ") + e + " ")
                  }
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Formatting */}
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Bold" onClick={() => wrap("**")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Italic" onClick={() => wrap("_")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Code" onClick={() => wrap("`")}>
          <Code2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Link" onClick={insertLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Mentions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" type="button" title="Mention teammate">
              <AtSign className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            <ScrollArea className="max-h-64">
              {users.map((u) => (
                <button
                  key={u.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/50"
                  onClick={() => insertMention(u)}
                  type="button"
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {u.name}
                </button>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Spacer */}
        <div className="ml-auto" />

        {/* AI actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-7 gap-2" type="button" title="AI Assist">
              {aiPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span className="hidden sm:inline">AI</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => aiRewrite("shorten")}>Rewrite: Shorten</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => aiRewrite("polish")}>Rewrite: Polish</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => aiRewrite("friendly")}>Rewrite: Friendly</DropdownMenuItem>
            <DropdownMenuItem onSelect={aiAutocomplete}>Autocomplete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send button (inside the same border) */}
        <Button
          size="sm"
          className="ml-1 gap-2"
          type="submit"
          disabled={!value.trim() && attachments.length === 0}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>

    {/* Drag-and-drop overlay (inside same component) */}
    <div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-[inherit] border border-dashed bg-muted/80 text-foreground/80",
          "transition-opacity",
          dragging ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="px-6 text-sm font-medium">Drop files here to add as attachments</span>
      </div>
    </div>
  </form>
)
}
