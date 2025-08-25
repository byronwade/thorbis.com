"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@lib/utils"

export type ClickMenuItem = {
  label?: string
  icon?: React.ReactNode
  onSelect?: () => void
  checked?: boolean
  disabled?: boolean
  separator?: boolean
  children?: ClickMenuItem[]
}

type MenuState = {
  open: boolean
  x: number
  y: number
  items: ClickMenuItem[]
}

type Ctx = {
  openAt: (x: number, y: number, items: ClickMenuItem[]) => void
  close: () => void
}

const ClickMenuContext = React.createContext<Ctx | null>(null)

export function ClickMenuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<MenuState>({ open: false, x: 0, y: 0, items: [] })
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const openAt = React.useCallback((x: number, y: number, items: ClickMenuItem[]) => {
    // Constrain basic bounds so menu stays on screen
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024
    const vh = typeof window !== "undefined" ? window.innerHeight : 768
    const margin = 12
    const clampedX = Math.max(margin, Math.min(vw - margin, x))
    const clampedY = Math.max(margin, Math.min(vh - margin, y))
    setState({ open: true, x: clampedX, y: clampedY, items })
  }, [])

  const close = React.useCallback(() => {
    setState((s) => ({ ...s, open: false }))
  }, [])

  // Close on escape, click outside, resize/scroll
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    function onDown(e: MouseEvent) {
      const el = containerRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) close()
    }
    function onScrollOrResize() {
      close()
    }
    if (state.open) {
      window.addEventListener("keydown", onKey)
      window.addEventListener("mousedown", onDown)
      window.addEventListener("scroll", onScrollOrResize, true)
      window.addEventListener("resize", onScrollOrResize)
    }
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [state.open, close])

  return (
    <ClickMenuContext.Provider value={{ openAt, close }}>
      {children}
      {state.open ? (
        <ClickMenuPortal ref={containerRef} x={state.x} y={state.y} items={state.items} onClose={close} />
      ) : null}
    </ClickMenuContext.Provider>
  )
}

export function useClickMenu() {
  const ctx = React.useContext(ClickMenuContext)
  if (!ctx) throw new Error("useClickMenu must be used within ClickMenuProvider")
  return ctx
}

type PortalProps = {
  x: number
  y: number
  items: ClickMenuItem[]
  onClose: () => void
}

const ClickMenuPortal = React.forwardRef<HTMLDivElement, PortalProps>(function ClickMenuPortal(
  { x, y, items, onClose },
  ref,
) {
  const body = typeof document !== "undefined" ? document.body : null
  if (!body) return null
  return createPortal(
    <div
      ref={ref}
      className="fixed z-[1000] min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: y, left: x }}
      role="menu"
      aria-label="Quick actions"
    >
      <MenuList items={items} onClose={onClose} />
    </div>,
    body,
  )
})

function MenuList({ items, onClose }: { items: ClickMenuItem[]; onClose: () => void }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={"sep-" + i} className="my-1 h-px bg-border" />
        }
        if (item.children && item.children.length > 0) {
          return <MenuGroup key={"grp-" + (item.label ?? i)} item={item} onClose={onClose} />
        }
        return (
          <MenuRow
            key={item.label ?? i}
            label={item.label ?? ""}
            icon={item.icon}
            checked={item.checked}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.()
              onClose()
            }}
          />
        )
      })}
    </div>
  )
}

function MenuGroup({ item, onClose }: { item: ClickMenuItem; onClose: () => void }) {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div className="ml-2.5 border-l pl-2.5">
          {item.children!.map((child, i) =>
            child.separator ? (
              <div key={"sep-" + i} className="my-1 h-px bg-border" />
            ) : (
              <MenuRow
                key={child.label ?? i}
                label={child.label ?? ""}
                icon={child.icon}
                checked={child.checked}
                disabled={child.disabled}
                onClick={() => {
                  child.onSelect?.()
                  onClose()
                }}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

function MenuRow({
  label,
  icon,
  checked,
  disabled,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  checked?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
      )}
      onClick={onClick}
      role="menuitem"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">{icon ?? null}</span>
      <span className="flex-1 text-left">{label}</span>
      {checked ? <Check className="h-4 w-4 text-primary" /> : <span className="h-4 w-4" />}
    </button>
  )
}

/**
/ WithClickMenu
/ - Opens menu on right-click
/ - Opens menu on long-press (left mouse or touch), default pressMs=350
*/
export function WithClickMenu({
  items,
  pressMs = 350,
  children,
}: {
  items: ClickMenuItem[]
  pressMs?: number
  children: React.ReactNode
}) {
  const { openAt } = useClickMenu()
  const timerRef = React.useRef<number | null>(null)
  const openRef = React.useRef(false)

  function clearTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function startPress(e: React.PointerEvent) {
    // Only left mouse or touch
    if (e.pointerType === "mouse" && e.button !== 0) return
    const x = e.clientX
    const y = e.clientY
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      openRef.current = true
      openAt(x, y, items)
    }, pressMs)
  }

  function endPress() {
    clearTimer()
    // If menu just opened from long-press, prevent next click from triggering parent
    if (openRef.current) {
      openRef.current = false
    }
  }

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault()
        openAt(e.clientX, e.clientY, items)
      }}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={endPress}
    >
      {children}
    </div>
  )
}
