"use client"

import { useEffect, useRef, useState } from "react"
import { TB_BTN } from "@/components/toolbar-classes"
import { cn } from "@/lib/utils"
import type { RealtimeClient, RTUser } from "@/lib/realtime"
import {
  Activity,
  Send,
  User,
  Users,
  Keyboard,
  Star,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  client: RealtimeClient
  currentUser: RTUser
  onUserChange: (u: RTUser) => void
  onTypingToggle: (typing: boolean) => void
  typing: boolean
  reviewStars: number | null
  maintenancePlan: string | null
  onProfileUpdate: (p: { reviewStars: number | null; maintenancePlan: string | null }) => void
  className?: string
}

export default function RealtimeDebugPanel({
  client,
  currentUser,
  onUserChange,
  onTypingToggle,
  typing,
  reviewStars,
  maintenancePlan,
  onProfileUpdate,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentUser.name)
  const [role, setRole] = useState<RTUser["role"]>(currentUser.role)
  const [stars, setStars] = useState<number | null>(reviewStars ?? 5)
  const [plan, setPlan] = useState<string | null>(maintenancePlan ?? "Gold Plan")
  const [suggestion, setSuggestion] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setName(currentUser.name)
    setRole(currentUser.role)
  }, [currentUser])

  useEffect(() => {
    setStars(reviewStars ?? null)
  }, [reviewStars])

  useEffect(() => {
    setPlan(maintenancePlan ?? null)
  }, [maintenancePlan])

  // Broadcast live suggestion text
  useEffect(() => {
    if (!client) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (suggestion.trim().length === 0) return
      client.emit({
        type: "suggestion",
        payload: { user: { ...currentUser, id: client.selfId, role }, text: suggestion },
      })
      // Mark typing and auto-clear shortly after
      onTypingToggle(true)
      setTimeout(() => onTypingToggle(false), 1500)
    }, 180)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion])

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed bottom-4 left-4 z-50 w-[min(92vw,300px)] rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl",
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                TB_BTN,
                "w-full justify-between rounded-lg border-0 bg-neutral-800 text-white hover:bg-neutral-700",
              )}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="inline-flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                Realtime Debug
              </div>
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle debug panel for testing realtime features and user simulation</p>
          </TooltipContent>
        </Tooltip>

        {open && (
          <div className="space-y-2 p-3 text-sm">
            <div className="text-xs text-neutral-400">Room: {client.roomId}</div>

            <div className="grid grid-cols-3 items-center gap-2">
              <div className="col-span-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                <User className="h-3.5 w-3.5" /> Name
              </div>
              <input
                className="col-span-2 h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-sm text-white outline-none focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <div className="col-span-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                <Users className="h-3.5 w-3.5" /> Role
              </div>
              <select
                className="col-span-2 h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-sm text-white outline-none focus:border-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value as RTUser["role"])}
              >
                <option value="CSR">CSR</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(TB_BTN, "bg-blue-600 hover:bg-blue-700 text-white")}
                    onClick={() => {
                      const u: RTUser = { ...currentUser, name, role }
                      onUserChange(u)
                    }}
                  >
                    <Send className="h-4 w-4" /> Update identity
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update your user identity and broadcast changes to other connected users</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      TB_BTN,
                      typing && "bg-blue-600 text-white hover:bg-blue-700",
                      !typing && "border-neutral-600 text-neutral-200 hover:bg-neutral-800",
                    )}
                    onClick={() => onTypingToggle(!typing)}
                    title="Toggle typing"
                  >
                    <Keyboard className="h-4 w-4" /> Typing
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle typing indicator to simulate active typing for other users</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-1 grid grid-cols-3 items-center gap-2">
              <div className="col-span-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                <Star className="h-3.5 w-3.5 text-amber-500" /> Review
              </div>
              <input
                className="col-span-2 h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-sm text-white outline-none focus:border-blue-500"
                inputMode="numeric"
                placeholder="null"
                value={stars ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setStars(v === "" ? null : Number(v))
                }}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <div className="col-span-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                <Wrench className="h-3.5 w-3.5" /> Plan
              </div>
              <input
                className="col-span-2 h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-sm text-white outline-none focus:border-blue-500"
                placeholder="null"
                value={plan ?? ""}
                onChange={(e) => setPlan(e.target.value === "" ? null : e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(TB_BTN, "bg-blue-600 hover:bg-blue-700 text-white")}
                    onClick={() => onProfileUpdate({ reviewStars: stars, maintenancePlan: plan })}
                  >
                    <Send className="h-4 w-4" /> Broadcast profile
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update and broadcast customer profile information to all connected users</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-2">
              <div className="mb-1 inline-flex items-center gap-2 text-xs text-neutral-400">
                <MessageSquare className="h-3.5 w-3.5" />
                Live suggestion (Supervisor → CSR)
              </div>
              <textarea
                className="h-20 w-full rounded border border-neutral-600 bg-neutral-800 p-2 text-sm text-white outline-none focus:border-blue-500 placeholder:text-neutral-400"
                placeholder="Type guidance for CSR. Appears live on their screen."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
              />
            </div>

            <div className="text-[11px] text-neutral-500">
              Tip: Open another tab as CSR to see live typing and suggestions in sync.
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
