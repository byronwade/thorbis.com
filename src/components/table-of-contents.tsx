'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Heading } from '@/lib/mdx'

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(')'

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.1,
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="font-semibold text-sm text-foreground mb-3">
        On this page
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={'#${heading.id}'}
            className={cn(
              'block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors',
              {
                'text-primary font-medium': activeId === heading.id,
                'ml-2': heading.level === 2,
                'ml-4': heading.level === 3,
                'ml-6': heading.level === 4,
                'ml-8': heading.level >= 5,
              }
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}