"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import VoipIncomingOverlay from "@/components/voip-incoming-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Play, Phone, Zap, Shield, Users, Clock } from "lucide-react"

export default function HomePage() {
  const [open, setOpen] = useState(false)

  // Optional: auto-open once on first visit to demonstrate the overlay
  useEffect(() => {
    const seen = typeof window !== "undefined" ? window.sessionStorage.getItem("demo:opened") : "1"
    if (!seen) {
      const t = setTimeout(() => {
        setOpen(true)
        try {
          window.sessionStorage.setItem("demo:opened", "1")
        } catch {}
      }, 800)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">FieldOps Pro</span>
            </div>
            <Badge variant="secondary" className="rounded-full hidden sm:inline bg-primary/10 text-primary">
              Demo
            </Badge>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="https://thorbis.com"
              target="_blank"
              className="hidden sm:inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Visit Thorbis
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
            <Button onClick={() => setOpen(true)} className="rounded-lg">
              <Phone className="mr-2 h-4 w-4" />
              Simulate Call
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="w-fit mb-4 rounded-full">
              <Zap className="h-3 w-3 mr-1" />
              Professional VoIP Interface
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Advanced Call Center
              <span className="text-primary block">Management</span>
            </h1>
            <p className="mt-6 max-w-prose text-lg text-muted-foreground leading-relaxed">
              Comprehensive VoIP solution with intelligent caller insights, real-time collaboration, automated
              workflows, and professional data capture. Built for field operations teams who demand excellence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={() => setOpen(true)} size="lg" className="rounded-lg">
                <Play className="mr-2 h-5 w-5" />
                Launch Demo
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-lg bg-transparent">
                <Link href="/call/ACME-4421">
                  View Call Interface
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Badge variant="secondary" className="rounded-full">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise Ready
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Users className="h-3 w-3 mr-1" />
                Team Collaboration
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Clock className="h-3 w-3 mr-1" />
                Real-time Updates
              </Badge>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl" />
              <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <img
                  src="/voip-overlay-mock.png"
                  alt="Professional VoIP interface preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Professional Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need for professional call center operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Call Controls</h3>
              <p className="text-sm text-muted-foreground">
                Professional call handling with recording, transfer, hold, and conference capabilities.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Team presence, live notes sharing, and supervisor assistance during calls.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Automation</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent workflows, automated routing, and AI-powered caller insights.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Compliance Ready</h3>
              <p className="text-sm text-muted-foreground">
                Built-in compliance tools, consent management, and audit trails.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Real-time metrics, SLA tracking, and comprehensive reporting dashboard.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">System Integration</h3>
              <p className="text-sm text-muted-foreground">
                Seamless integration with CRM, ticketing, and business systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Phone className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">FieldOps Pro</span>
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              Professional VoIP interface inspired by{" "}
              <a
                href="https://thorbis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Thorbis
              </a>{" "}
              design language
            </p>
          </div>
        </div>
      </footer>

      {/* Mount the VOIP overlay */}
      <VoipIncomingOverlay open={open} onOpenChange={() => setOpen(!open)} />
    </main>
  )
}
