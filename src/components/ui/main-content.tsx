'use client'

import React from 'react'
import { cn } from '@thorbis/design/utils'

export interface MainContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Main Content Component
 * 
 * Provides the main content area layout with proper spacing and responsive design.
 * Used within the app layout to contain page content.
 */
export function MainContent({ 
  children, 
  className 
}: MainContentProps) {
  return (
    <main className={cn(
      "flex-1 overflow-auto",
      "bg-white dark:bg-neutral-925",
      "min-h-full",
      className
    )}>
      {children}
    </main>
  )
}
