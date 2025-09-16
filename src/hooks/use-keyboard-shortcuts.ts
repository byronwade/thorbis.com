/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard shortcut functionality for the application.
 * Supports common shortcuts like Cmd+K for search, Cmd+Enter for submit, etc.
 */

'use client'

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!Array.isArray(shortcuts)) return
    
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const metaMatches = !!shortcut.metaKey === (event.metaKey || event.ctrlKey)
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const altMatches = !!shortcut.altKey === event.altKey

      if (keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault()
        shortcut.callback()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { shortcuts }
}

// Common shortcut presets
export const commonShortcuts = {
  search: (callback: () => void): KeyboardShortcut => ({
    key: 'k',
    metaKey: true,
    callback,
    description: 'Open search'
  }),
  
  submit: (callback: () => void): KeyboardShortcut => ({
    key: 'Enter',
    metaKey: true,
    callback,
    description: 'Submit form'
  }),
  
  escape: (callback: () => void): KeyboardShortcut => ({
    key: 'Escape',
    callback,
    description: 'Close modal'
  }),
  
  newItem: (callback: () => void): KeyboardShortcut => ({
    key: 'n',
    metaKey: true,
    callback,
    description: 'Create new item'
  })
}