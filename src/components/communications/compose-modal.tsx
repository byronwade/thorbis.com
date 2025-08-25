"use client"

import * as React from "react"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { Textarea } from "@components/ui/textarea"
import { Loader2, Wand2 } from 'lucide-react'

type RewriteStyle = "shorten" | "polish" | "friendly"

export function ComposeModal({
  open,
  onOpenChange,
  draft,
  setDraft,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: string
  setDraft: (t: string) => void
}) {
  const [isRewriting, setIsRewriting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function rewrite(style: RewriteStyle) {
    try {
      setIsRewriting(true)
      setError(null)
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rewrite",
          style,
          text: draft,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Rewrite failed")
      setDraft(data.text)
    } catch (e: any) {
      setError(e.message || "Rewrite failed")
    } finally {
      setIsRewriting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose reply</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Wand2 className="h-4 w-4" />
                AI Assist
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={() => rewrite("shorten")}>Shorten</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => rewrite("polish")}>Polish</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => rewrite("friendly")}>More friendly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isRewriting && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Rewriting with AI…
            </span>
          )}
        </div>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{error}</div>}

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          placeholder="Type your reply…"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled title="Sending not wired yet">Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
