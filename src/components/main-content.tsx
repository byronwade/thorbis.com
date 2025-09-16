'use client'

import React from 'react'
import { cn } from '../lib/utils'

export interface MainContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Main content area component
 * 
 * Provides consistent padding and styling for page content
 */
export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn(
      "flex-1 overflow-y-auto",
      "bg-neutral-950 text-white",
      "transition-all duration-200",
      className
    )}>
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  )
}