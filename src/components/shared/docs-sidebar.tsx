'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/" },
      { title: "Quick Start", href: "/documentation/getting-started" },
      { title: "Manifest Structure", href: "/documentation/manifest-structure" },
    ]
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Safety First", href: "/documentation/safety" },
      { title: "Discovery", href: "/documentation/discovery" },
      { title: "Authentication", href: "/documentation/auth" },
      { title: "Trust Capsules", href: "/documentation/trust-capsule" },
    ]
  },
  {
    title: "Guides",
    items: [
      { title: "Best Practices", href: "/documentation/guides/best-practices" },
      { title: "Architecture", href: "/documentation/guides/architecture-patterns" },
      { title: "Performance", href: "/documentation/guides/performance-optimization" },
    ]
  },
  {
    title: "Tools",
    items: [
      { title: "Playground", href: "/playground" },
      { title: "Validator", href: "/validator" },
      { title: "Generator", href: "/generators" },
      { title: "API Reference", href: "/api-reference" },
    ]
  },
  {
    title: "Integrations",
    items: [
      { title: "OpenAI", href: "/integrations/openai" },
      { title: "Claude", href: "/integrations/claude" },
      { title: "Copilot", href: "/integrations/copilot" },
      { title: "Gemini", href: "/integrations/gemini" },
    ]
  },
  {
    title: "More",
    items: [
      { title: "Examples", href: "/examples" },
      { title: "Community", href: "/community" },
      { title: "Changelog", href: "/changelog" },
      { title: "About", href: "/about" },
    ]
  }
]

interface DocsSidebarProps {
  className?: string
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("w-full px-4", className)}>
      <div className="space-y-6">
        {sidebarNavItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <h4 className="text-sm font-semibold leading-none text-foreground/90 px-2">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-all hover:bg-accent/50",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{item.title}</span>
                    {isActive && (
                      <ChevronRight className="h-3 w-3 opacity-60" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}