"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
CommandDialog,
CommandEmpty,
CommandGroup,
CommandInput,
CommandItem,
CommandList,
CommandSeparator,
} from "@components/ui/command"
import { Inbox, MessageSquareText, MessagesSquare, Search, Sparkles, SlidersHorizontal, Settings2, ChevronRight, Wand2, Sun, Moon, PenSquare } from 'lucide-react'

type CommandPaletteProps = {
onComposeNew?: () => void
onOpenRules?: () => void
onToggleDensity?: () => void
onToggleSmart?: () => void
onSummarizeInbox?: () => void
onFocusSearch?: () => void
}

export function CommandPalette({
onComposeNew,
onOpenRules,
onToggleDensity,
onToggleSmart,
onSummarizeInbox,
onFocusSearch,
}: CommandPaletteProps) {
const [open, setOpen] = React.useState(false)
const router = useRouter()
const pathname = usePathname()
const { resolvedTheme, setTheme } = useTheme()

// Global hotkey: Cmd/Ctrl + K
React.useEffect(() => {
  function onKey(e: KeyboardEvent) {
    const isK = e.key.toLowerCase() === "k"
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault()
      setOpen((o) => !o)
    }
  }
  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [])

function nav(to: string) {
  if (pathname !== to) router.push(to)
  setOpen(false)
}

function act(fn?: () => void) {
  if (fn) fn()
  setOpen(false)
}

function toggleTheme() {
  setTheme(resolvedTheme === "dark" ? "light" : "dark")
  setOpen(false)
}

return (
  <>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => nav("/")}>
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
            <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
          </CommandItem>
          <CommandItem onSelect={() => nav("/conversations")}>
            <MessagesSquare className="mr-2 h-4 w-4" />
            Conversations
            <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
          </CommandItem>
          <CommandItem onSelect={() => nav("/chat")}>
            <MessageSquareText className="mr-2 h-4 w-4" />
            Instant Messages
            <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Inbox">
          <CommandItem onSelect={() => act(onComposeNew)}>
            <PenSquare className="mr-2 h-4 w-4" />
            Compose new
          </CommandItem>
          <CommandItem onSelect={() => act(onSummarizeInbox)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Summarize inbox
          </CommandItem>
          <CommandItem onSelect={() => act(onOpenRules)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Open rules
          </CommandItem>
          <CommandItem onSelect={() => act(onFocusSearch)}>
            <Search className="mr-2 h-4 w-4" />
            Focus search
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Preferences">
          <CommandItem onSelect={() => act(onToggleSmart)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Toggle Smart Search
          </CommandItem>
          <CommandItem onSelect={() => act(onToggleDensity)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Toggle density
          </CommandItem>
          <CommandItem onSelect={toggleTheme}>
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="mr-2 h-4 w-4" /> Switch to light
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" /> Switch to dark
              </>
            )}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </>
)
}
