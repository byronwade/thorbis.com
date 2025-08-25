"use client"

import * as React from "react"

type Ctx = {
  enabled: boolean
  toggle: () => void
}

const VisualRefreshContext = React.createContext<Ctx | null>(null)

export function useVisualRefresh() {
  const ctx = React.useContext(VisualRefreshContext)
  if (!ctx) throw new Error("useVisualRefresh must be used within VisualRefreshProvider")
  return ctx
}

/**
 * VisualRefreshProvider
 * - Applies a `.modern` class on <html> to scope refreshed tokens.
 * - Tokens are defined using CSS variables, including shadcn Sidebar variables. [^2]
 * - Persists to localStorage so you can compare old/new easily.
 */
export function VisualRefreshProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(true)

  React.useEffect(() => {
    const stored = localStorage.getItem("ui:modern")
    if (stored === null) {
      setEnabled(true)
    } else {
      setEnabled(stored === "true")
    }
  }, [])

  React.useEffect(() => {
    const el = document.documentElement
    if (enabled) el.classList.add("modern")
    else el.classList.remove("modern")
    localStorage.setItem("ui:modern", String(enabled))
  }, [enabled])

  const value = React.useMemo<Ctx>(() => ({ enabled, toggle: () => setEnabled((s) => !s) }), [enabled])

  return (
    <VisualRefreshContext.Provider value={value}>
      {/* Scoped global tokens for a calm, minimal look */}
      <style jsx global>{`
        /* Base tokens */
        .modern {
          /* Softer global corner radius */
          --radius: 0.875rem;

          /* A calm neutral palette */
          --background: 0 0% 100%;
          --foreground: 240 10% 4%;

          --muted: 220 14% 97%;
          --muted-foreground: 220 9% 40%;

          --card: 0 0% 100%;
          --card-foreground: 240 10% 4%;

          --popover: 0 0% 100%;
          --popover-foreground: 240 10% 4%;

          --border: 220 13% 90%;
          --input: 220 13% 90%;
          /* neutral, not blue */
          --ring: 160 30% 40%;

          --primary: 160 36% 35%;
          --primary-foreground: 0 0% 100%;

          --secondary: 240 5% 96%;
          --secondary-foreground: 240 10% 4%;

          --accent: 240 4% 95%;
          --accent-foreground: 240 10% 4%;

          --destructive: 0 72% 52%;
          --destructive-foreground: 0 0% 98%;

          /* Sidebar theming (from shadcn sidebar) [^2] */
          --sidebar-background: 0 0% 99%;
          --sidebar-foreground: 240 5% 26%;
          --sidebar-primary: 240 6% 10%;
          --sidebar-primary-foreground: 0 0% 98%;
          --sidebar-accent: 240 5% 96%;
          --sidebar-accent-foreground: 240 6% 10%;
          --sidebar-border: 220 13% 90%;
          --sidebar-ring: 160 30% 40%;
        }

        .dark.modern {
          --background: 240 6% 8%;
          --foreground: 0 0% 98%;

          --muted: 240 4% 16%;
          --muted-foreground: 240 4% 70%;

          --card: 240 6% 10%;
          --card-foreground: 0 0% 98%;

          --popover: 240 6% 10%;
          --popover-foreground: 0 0% 98%;

          --border: 240 5% 22%;
          --input: 240 5% 22%;
          --ring: 160 42% 40%;

          --primary: 160 38% 45%;
          --primary-foreground: 0 0% 10%;

          --secondary: 240 3% 15%;
          --secondary-foreground: 0 0% 98%;

          --accent: 240 4% 14%;
          --accent-foreground: 0 0% 98%;

          --destructive: 0 72% 52%;
          --destructive-foreground: 0 0% 98%;

          --sidebar-background: 240 6% 12%;
          --sidebar-foreground: 240 5% 90%;
          --sidebar-primary: 0 0% 98%;
          --sidebar-primary-foreground: 240 6% 12%;
          --sidebar-accent: 240 3% 17%;
          --sidebar-accent-foreground: 0 0% 98%;
          --sidebar-border: 240 4% 18%;
          --sidebar-ring: 160 42% 40%;
        }

        /* Global polish */
        .modern body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Make borders calmer by default */
        .modern * {
          border-color: hsl(var(--border));
        }

        /* Softer focus rings */
        .modern :where(button, a, input, textarea, [role="button"]):focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.4);
        }

        /* Glassy headers: when you use bg-background/xx in components, keep borders calm */
        .modern .glassy-header {
          border-bottom-color: hsl(var(--border));
        }
      `}</style>
      {children}
    </VisualRefreshContext.Provider>
  )
}

/**
 * VisualRefreshToggle
 * Small on-screen toggle to turn the refreshed look on/off without removing features.
 */
export function VisualRefreshToggle() {
  const { enabled, toggle } = useVisualRefresh()
  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70"
      aria-pressed={enabled}
      title="Toggle modern UI"
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
        aria-hidden
      />
      <span>{enabled ? "Modern UI: On" : "Modern UI: Off"}</span>
    </button>
  )
}
