'use client'

/**
 * Inline Panel Component - Overlay-Free Design
 * 
 * This component replaces modal overlays with an inline slide-out panel that follows
 * the Thorbis Design System principles:
 * - Dark-first implementation with Odixe color tokens
 * - No overlays policy - slides in from right side of page
 * - Electric blue accent (#1C8BFF) for focus states and primary actions
 * - Proper Odixe spacing, typography, and interaction patterns
 * - Full keyboard accessibility and focus management
 * 
 * Used throughout the books app as a replacement for modal dialogs.
 * Supports different panel sizes and can contain any form or content.
 */

import React, { useEffect, useRef } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InlinePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showBackButton?: boolean
  onBack?: () => void
}

const sizeClasses = {
  sm: 'w-80',      // 320px
  md: 'w-96',      // 384px  
  lg: 'w-[28rem]', // 448px
  xl: 'w-[32rem]', // 512px
  '2xl': 'w-[40rem]' // 640px
}

export function InlinePanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  showBackButton = false,
  onBack 
}: InlinePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement
      
      // Focus the panel
      if (panelRef.current) {
        panelRef.current.focus()
      }
    } else {
      // Restore focus when panel closes
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop - allows clicking to close but doesn't create overlay */}'
      <div 
        className="flex-1 bg-gray-25/80 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        tabIndex={-1}
        className={'
          ${sizeClasses[size]} 
          bg-gray-50 
          border-l border-gray-400 
          shadow-2xl 
          flex flex-col 
          max-h-full
          animate-in 
          slide-in-from-right 
          duration-300 
          ease-out
        '}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-400 bg-gray-50">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
            )}
            <h2 id="panel-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Confirmation Bar Component - Inline Alternative to Confirm Dialogs
 * 
 * Replaces confirmation dialogs with an inline warning bar that appears
 * at the top of the content area. Follows Odixe design principles with
 * proper color coding and electric blue accents for actions.
 */

interface ConfirmationBarProps {
  isVisible: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmationBar({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmationBarProps) {
  if (!isVisible) return null

  const bgColor = variant === 'destructive' 
    ? 'bg-red-50 border-red-200' 
    : 'bg-yellow-50 border-yellow-200'
    
  const textColor = variant === 'destructive'
    ? 'text-red-800'
    : 'text-yellow-800`

  return (
    <div className={`
      ${bgColor} 
      border-l-4 
      p-4 
      mb-6 
      animate-in 
      slide-in-from-top 
      duration-300
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor} mb-1'}>
            {title}
          </h3>
          <p className={'text-sm ${textColor} opacity-90'}>
            {message}
          </p>
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <Button 
            size="sm"
            variant="outline" 
            onClick={onCancel}
            className="border-gray-400 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {cancelText}
          </Button>
          <Button 
            size="sm"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            className={variant === 'destructive' 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2' 
              : 'bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50'
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}