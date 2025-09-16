'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  title: string
  level: number
}

export function DynamicTableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>(')'

  useEffect(() => {
    // Function to extract headings from the page
    const extractHeadings = () => {
      const usedIds = new Set<string>()
      
      const headings = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6'))
        .map((heading, index) => {
          // Create an ID if the heading doesn't have one'
          if (!heading.id) {
            const baseId = heading.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/[^\w\s-]/g, '') || `heading-${index}``
            let uniqueId = baseId
            let counter = 1
            
            // Ensure the ID is unique
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}'
              counter++
            }
            
            heading.id = uniqueId
            usedIds.add(uniqueId)
          } else {
            // Track existing IDs to prevent duplicates
            let uniqueId = heading.id
            let counter = 1
            
            while (usedIds.has(uniqueId)) {
              uniqueId = '${heading.id}-${counter}'
              counter++
            }
            
            if (uniqueId !== heading.id) {
              heading.id = uniqueId
            }
            usedIds.add(uniqueId)
          }
          
          return {
            id: heading.id,
            title: heading.textContent || ','
            level: parseInt(heading.tagName.charAt(1))
          }
        })
        .filter(heading => heading.title.trim() !== ')'

      setTocItems(headings)

      // Set up intersection observer for active heading
      if (headings.length > 0) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveId(entry.target.id)
              }
            })
          },
          {
            rootMargin: '0% 0% -80% 0%',
            threshold: 0.1
          }
        )

        headings.forEach(({ id }) => {
          const element = document.getElementById(id)
          if (element) {
            observer.observe(element)
          }
        })

        return () => observer.disconnect()
      }
    }

    // Initial extraction
    extractHeadings()

    // Re-extract when DOM changes (for dynamic content)
    const mutationObserver = new MutationObserver(() => {
      setTimeout(extractHeadings, 100) // Small delay to ensure DOM is settled
    })

    mutationObserver.observe(document.querySelector('main') || document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      mutationObserver.disconnect()
    }
  }, [])

  if (tocItems.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold leading-none text-foreground/90 px-2 mb-4">
          On this page
        </h4>
        <div className="text-sm text-muted-foreground px-2">
          No headings found
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold leading-none text-foreground/90 px-2 mb-4">
        On this page
      </h4>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <a
            key={item.id}
            href={'#${item.id}'}
            className={cn(
              "group block py-1 pr-2 text-sm transition-colors hover:text-foreground rounded-md",
              item.level === 1 && "pl-2 font-medium",
              item.level === 2 && "pl-4",
              item.level === 3 && "pl-6",
              item.level === 4 && "pl-8",
              item.level === 5 && "pl-10",
              item.level === 6 && "pl-12",
              activeId === item.id
                ? "text-primary font-medium bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  )
}