// Comprehensive accessibility utilities for WCAG 2.1 AA compliance
// Provides keyboard navigation, screen reader support, and inclusive design patterns

import { useEffect, useRef, useCallback, useState } from 'react'

// =============================================================================
// Keyboard Navigation Utilities
// =============================================================================

export interface KeyboardNavigationOptions {
  /**
   * CSS selector for focusable elements
   */
  focusableSelector?: string
  
  /**
   * Whether to wrap focus around when reaching the end
   */
  wrap?: boolean
  
  /**
   * Whether to trap focus within the container
   */
  trapFocus?: boolean
  
  /**
   * Initial focus element index
   */
  initialFocusIndex?: number
  
  /**
   * Callback when focus changes
   */
  onFocusChange?: (element: HTMLElement, index: number) => void
  
  /**
   * Custom key handlers
   */
  keyHandlers?: Record<string, (event: KeyboardEvent) => void>
}

export const DEFAULT_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  'details:not([disabled])',
  'summary:not([disabled])',
  '[role="button"]:not([disabled])',
  '[role="link"]:not([disabled])',
  '[role="menuitem"]:not([disabled])',
  '[role="tab"]:not([disabled])',
].join(', ')

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    wrap = true,
    trapFocus = false,
    initialFocusIndex = 0,
    onFocusChange,
    keyHandlers = {},
  } = options

  const [currentFocusIndex, setCurrentFocusIndex] = useState(initialFocusIndex)
  const focusableElements = useRef<HTMLElement[]>([])

  // Update focusable elements list
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
    
    focusableElements.current = elements.filter(el => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [containerRef, focusableSelector])

  // Focus element by index
  const focusElement = useCallback((index: number) => {
    updateFocusableElements()
    const elements = focusableElements.current
    
    if (elements.length === 0) return

    let targetIndex = index
    
    if (wrap) {
      targetIndex = ((index % elements.length) + elements.length) % elements.length
    } else {
      targetIndex = Math.max(0, Math.min(index, elements.length - 1))
    }

    const element = elements[targetIndex]
    if (element) {
      element.focus()
      setCurrentFocusIndex(targetIndex)
      onFocusChange?.(element, targetIndex)
    }
  }, [updateFocusableElements, wrap, onFocusChange])

  // Navigate to next element
  const focusNext = useCallback(() => {
    focusElement(currentFocusIndex + 1)
  }, [focusElement, currentFocusIndex])

  // Navigate to previous element
  const focusPrevious = useCallback(() => {
    focusElement(currentFocusIndex - 1)
  }, [focusElement, currentFocusIndex])

  // Navigate to first element
  const focusFirst = useCallback(() => {
    focusElement(0)
  }, [focusElement])

  // Navigate to last element
  const focusLast = useCallback(() => {
    updateFocusableElements()
    focusElement(focusableElements.current.length - 1)
  }, [focusElement, updateFocusableElements])

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check for custom key handlers first
    if (keyHandlers[event.key]) {
      keyHandlers[event.key](event)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        focusNext()
        break
      
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        focusPrevious()
        break
      
      case 'Home':
        event.preventDefault()
        focusFirst()
        break
      
      case 'End':
        event.preventDefault()
        focusLast()
        break
      
      case 'Tab':
        if (trapFocus) {
          event.preventDefault()
          if (event.shiftKey) {
            focusPrevious()
          } else {
            focusNext()
          }
        }
        break
      
      case 'Escape':
        if (trapFocus && containerRef.current) {
          const firstTabbable = containerRef.current.querySelector(
            '[tabindex="0"], button, [href], input, select, textarea'
          ) as HTMLElement
          
          if (firstTabbable) {
            firstTabbable.blur()
          }
        }
        break
    }
  }, [
    keyHandlers,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    trapFocus,
    containerRef,
  ])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    
    // Update focusable elements when DOM changes
    const observer = new MutationObserver(updateFocusableElements)
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-hidden'],
    })

    // Initial setup
    updateFocusableElements()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      observer.disconnect()
    }
  }, [containerRef, handleKeyDown, updateFocusableElements])

  return {
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    currentFocusIndex,
    focusableElements: focusableElements.current,
  }
}

// =============================================================================
// Focus Management
// =============================================================================

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store previously focused element
    previousFocus.current = document.activeElement as HTMLElement

    // Focus first focusable element in container
    const firstFocusable = containerRef.current.querySelector(
      DEFAULT_FOCUSABLE_SELECTOR
    ) as HTMLElement
    
    if (firstFocusable) {
      firstFocusable.focus()
    }

    const handleFocusOut = (event: FocusEvent) => {
      const container = containerRef.current
      if (!container) return

      const { relatedTarget } = event
      
      // If focus is moving outside the container, bring it back
      if (relatedTarget && !container.contains(relatedTarget as Node)) {
        event.preventDefault()
        firstFocusable?.focus()
      }
    }

    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusout', handleFocusOut)
      
      // Restore previous focus
      if (previousFocus.current) {
        previousFocus.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}

// =============================================================================
// Screen Reader Utilities
// =============================================================================

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export function useScreenReaderAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])

  return announce
}

// =============================================================================
// Color Contrast Utilities
// =============================================================================

interface ColorContrastResult {
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  isValid: boolean
}

export function calculateContrastRatio(foreground: string, background: string): ColorContrastResult {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null
  }

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const fgRgb = hexToRgb(foreground)
  const bgRgb = hexToRgb(background)

  if (!fgRgb || !bgRgb) {
    return { ratio: 0, level: 'fail', isValid: false }
  }

  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  const ratio = (lighter + 0.05) / (darker + 0.05)

  let level: 'AA' | 'AAA' | 'fail' = 'fail'
  if (ratio >= 7) level = 'AAA'
  else if (ratio >= 4.5) level = 'AA'

  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    isValid: ratio >= 4.5,
  }
}

// =============================================================================
// ARIA Utilities
// =============================================================================

export interface AriaLabelProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export function generateAriaProps(
  label?: string,
  labelledBy?: string,
  describedBy?: string
): AriaLabelProps {
  const props: AriaLabelProps = {}
  
  if (label) props['aria-label'] = label
  if (labelledBy) props['aria-labelledby'] = labelledBy
  if (describedBy) props['aria-describedby'] = describedBy
  
  return props
}

export function useAriaLive() {
  const [liveRegion, setLiveRegion] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Create or find live region
    let region = document.getElementById('aria-live-region')
    
    if (!region) {
      region = document.createElement('div')
      region.id = 'aria-live-region'
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
    }
    
    setLiveRegion(region)

    return () => {
      // Clean up on unmount
      if (region && region.parentNode) {
        region.parentNode.removeChild(region)
      }
    }
  }, [])

  const announce = useCallback((message: string) => {
    if (liveRegion) {
      liveRegion.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = ''
        }
      }, 1000)
    }
  }, [liveRegion])

  return announce
}

// =============================================================================
// Keyboard Shortcuts
// =============================================================================

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.metaKey === event.metaKey
        )
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
        
        // Announce shortcut to screen readers
        announceToScreenReader('Keyboard shortcut activated: ${matchingShortcut.description}')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

// =============================================================================
// Accessibility Testing Utilities
// =============================================================================

export function auditAccessibility() {
  const issues: string[] = []

  // Check for missing alt text on images
  const images = document.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.alt && img.getAttribute('role') !== 'presentation') {
      issues.push('Image ${index + 1} missing alt text')
    }
  })

  // Check for missing form labels
  const inputs = document.querySelectorAll('input, textarea, select')
  inputs.forEach((input, index) => {
    const hasLabel = input.id && document.querySelector('label[for="${input.id}"]')
    const hasAriaLabel = input.getAttribute('aria-label')
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push('Form field ${index + 1} missing label')
    }
  })

  // Check for missing heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let previousLevel = 0
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1))
    if (index === 0 && currentLevel !== 1) {
      issues.push('Page should start with h1')
    }
    if (currentLevel > previousLevel + 1) {
      issues.push('Heading level ${currentLevel} skips levels after h${previousLevel}')
    }
    previousLevel = currentLevel
  })

  // Check for missing focus indicators
  const focusableElements = document.querySelectorAll(DEFAULT_FOCUSABLE_SELECTOR)
  focusableElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element, ':focus')
    if (styles.outline === 'none' && styles.boxShadow === 'none') {
      issues.push('Focusable element ${index + 1} missing focus indicator')
    }
  })

  return issues
}

// =============================================================================
// Skip Links
// =============================================================================

export function createSkipLinks(targets: Array<{ id: string; label: string }>) {
  const skipContainer = document.createElement('div')
  skipContainer.className = 'skip-links sr-only-until-focus'
  
  targets.forEach(target => {
    const skipLink = document.createElement('a')
    skipLink.href = '#${target.id}'
    skipLink.textContent = target.label
    skipLink.className = 'skip-link'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const targetElement = document.getElementById(target.id)
      if (targetElement) {
        targetElement.focus()
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    
    skipContainer.appendChild(skipLink)
  })
  
  document.body.insertBefore(skipContainer, document.body.firstChild)
}