'use client'

import * as React from 'react'
import { cn } from '@thorbis/design'
import { X, ChevronLeft } from 'lucide-react'
import { Button } from './button'

export interface InlinePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  side?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOutsideClick?: boolean
  showBackButton?: boolean
  onBack?: () => void
  className?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
}

/**
 * InlinePanel component - Replaces modal/dialog patterns with inline panels
 * Follows Thorbis no-overlay principle
 * Provides proper focus management and accessibility
 */
export function InlinePanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  width = 'md',
  closeOnOutsideClick = true,
  showBackButton = false,
  onBack,
  className,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: InlinePanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  // Handle focus management
  React.useEffect(() => {
    if (open) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the panel
      setTimeout(() => {
        panelRef.current?.focus()
      }, 100)
    } else {
      // Restore focus when closing
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Handle escape key
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Handle outside clicks
  React.useEffect(() => {
    if (!open || !closeOnOutsideClick) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    // Delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onOpenChange, closeOnOutsideClick])

  // Trap focus within panel
  React.useEffect(() => {
    if (!open) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusableElements = panelRef.current.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]

      if (focusableArray.length === 0) return

      const firstElement = focusableArray[0]
      const lastElement = focusableArray[focusableArray.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
      aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
      aria-live="polite"
      tabIndex={-1}
      className={cn(
        'fixed inset-y-0 z-50 flex flex-col bg-white dark:bg-neutral-900',
        'border-l dark:border-neutral-700',
        'shadow-xl',
        'transform transition-transform duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
        widthClasses[width],
        side === 'right' ? 'right-0' : 'left-0',
        open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-neutral-700">
        <div className="flex items-center space-x-3">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              aria-label="Go back"
              className="p-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            {title && (
              <h2 
                id={titleId}
                className="text-lg font-semibold text-neutral-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {description && (
              <p 
                id={descriptionId}
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                {description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          aria-label="Close panel"
          className="p-1"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {children}
      </div>
    </div>
  )
}

/**
 * InlinePanelTrigger - Button that opens an inline panel
 */
export function InlinePanelTrigger({
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { onClick: () => void }) {
  return (
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  )
}

/**
 * InlinePanelContent - Wrapper for panel content with proper spacing
 */
export function InlinePanelContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  )
}

/**
 * InlinePanelFooter - Footer actions for the panel
 */
export function InlinePanelFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'flex items-center justify-end space-x-2 pt-4 mt-auto',
      'border-t dark:border-neutral-700',
      className
    )}>
      {children}
    </div>
  )
}