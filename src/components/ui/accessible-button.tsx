'use client'

import { forwardRef, useState, useCallback } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { generateAriaProps, useScreenReaderAnnouncement } from '@/lib/accessibility'
import { Loader2 } from 'lucide-react'

// =============================================================================
// Button Variants with Enhanced Focus States
// =============================================================================

const buttonVariants = cva(
  // Base styles with enhanced accessibility
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    // Enhanced focus indicators for better accessibility
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_2px_theme(colors.blue.500)]',
    // Active state feedback
    'active:scale-[0.98] active:transition-transform active:duration-75',
    // Touch target minimum size for accessibility
    'min-h-[44px] min-w-[44px]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-blue-600 text-white shadow hover:bg-blue-700',
          'focus-visible:ring-blue-500 focus-visible:bg-blue-700',
        ],
        destructive: [
          'bg-red-600 text-white shadow-sm hover:bg-red-700',
          'focus-visible:ring-red-500 focus-visible:bg-red-700',
        ],
        outline: [
          'border border-neutral-700 bg-transparent text-neutral-300 shadow-sm',
          'hover:bg-neutral-800 hover:text-white hover:border-neutral-600',
          'focus-visible:ring-blue-500 focus-visible:bg-neutral-800 focus-visible:text-white',
        ],
        secondary: [
          'bg-neutral-800 text-neutral-300 shadow-sm hover:bg-neutral-700 hover:text-white',
          'focus-visible:ring-blue-500 focus-visible:bg-neutral-700',
        ],
        ghost: [
          'text-neutral-400 hover:bg-neutral-800 hover:text-white',
          'focus-visible:ring-blue-500 focus-visible:bg-neutral-800 focus-visible:text-white',
        ],
        link: [
          'text-blue-400 underline-offset-4 hover:underline hover:text-blue-300',
          'focus-visible:ring-blue-500 focus-visible:underline focus-visible:text-blue-300',
          'min-h-auto min-w-auto', // Override minimum touch target for link buttons
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// =============================================================================
// Accessible Button Component
// =============================================================================

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as child component (using Radix Slot)
   */
  asChild?: boolean
  
  /**
   * Loading state with accessible feedback
   */
  loading?: boolean
  
  /**
   * Success state for form submissions
   */
  success?: boolean
  
  /**
   * Loading text announced to screen readers
   */
  loadingText?: string
  
  /**
   * Success text announced to screen readers
   */
  successText?: string
  
  /**
   * Accessible description for complex buttons
   */
  description?: string
  
  /**
   * Keyboard shortcut hint
   */
  shortcut?: string
  
  /**
   * Announce action to screen readers when clicked
   */
  announceAction?: string
  
  /**
   * Custom ARIA properties
   */
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    success = false,
    loadingText = 'Loading',
    successText = 'Success',
    description,
    shortcut,
    announceAction,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    disabled,
    onClick,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const announce = useScreenReaderAnnouncement()
    const [isPressed, setIsPressed] = useState(false)

    // Enhanced click handler with accessibility feedback
    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return

      // Provide immediate feedback for screen readers
      if (announceAction) {
        announce(announceAction, 'assertive')
      }

      // Visual pressed state feedback
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 150)

      onClick?.(event)
    }, [loading, disabled, announceAction, announce, onClick])

    // Generate ARIA properties
    const ariaProps = generateAriaProps(ariaLabel, ariaLabelledBy, ariaDescribedBy)

    // Enhanced disabled state
    const isDisabled = disabled || loading

    // Button content with loading and success states
    const buttonContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">{loadingText}</span>
            {typeof children === 'string' ? loadingText : children}
          </>
        )
      }

      if (success) {
        return (
          <>
            <svg 
              className="h-4 w-4 text-green-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="sr-only">{successText}</span>
            {typeof children === 'string' ? successText : children}
          </>
        )
      }

      return children
    }

    return (
      <>
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, className }),
            // Dynamic state classes
            isPressed && 'scale-[0.96]',
            success && 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500',
            loading && 'cursor-wait'
          )}
          disabled={isDisabled}
          onClick={handleClick}
          {...ariaProps}
          aria-busy={loading}
          aria-live={loading || success ? 'polite' : undefined}
          {...props}
        >
          {buttonContent()}
          
          {/* Keyboard shortcut indicator */}
          {shortcut && (
            <span className="ml-auto text-xs opacity-60" aria-hidden="true">
              {shortcut}
            </span>
          )}
        </Comp>

        {/* Hidden description for screen readers */}
        {description && (
          <span
            id={'${props.id || 'button'}-description'}
            className="sr-only"
            aria-hidden="true"
          >
            {description}
          </span>
        )}
      </>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// =============================================================================
// Specialized Button Components
// =============================================================================

/**
 * Icon button with enhanced accessibility
 */
export interface IconButtonProps extends Omit<AccessibleButtonProps, 'children'> {
  icon: React.ReactNode
  label: string
  tooltip?: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, tooltip, className, size = 'icon', ...props }, ref) => {
    return (
      <AccessibleButton
        ref={ref}
        size={size}
        className={className}
        ariaLabel={label}
        title={tooltip || label}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </AccessibleButton>
    )
  }
)

IconButton.displayName = 'IconButton'

/**
 * Toggle button with accessible state management
 */
export interface ToggleButtonProps extends Omit<AccessibleButtonProps, 'onClick'> {
  pressed: boolean
  onToggle: (pressed: boolean) => void
  pressedLabel?: string
  unpressedLabel?: string
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ 
    pressed, 
    onToggle, 
    pressedLabel = 'Activated',
    unpressedLabel = 'Not activated',
    children,
    className,
    ...props 
  }, ref) => {
    const announce = useScreenReaderAnnouncement()

    const handleClick = () => {
      const newPressed = !pressed
      onToggle(newPressed)
      
      // Announce state change
      announce(
        '${children} ${newPressed ? pressedLabel : unpressedLabel}',
        'assertive'
      )
    }

    return (
      <AccessibleButton
        ref={ref}
        className={cn(
          className,
          pressed && 'bg-blue-600 text-white'
        )}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      >
        {children}
      </AccessibleButton>
    )
  }
)

ToggleButton.displayName = 'ToggleButton'

/**
 * Menu button with accessibility enhancements
 */
export interface MenuButtonProps extends AccessibleButtonProps {
  menuId: string
  expanded: boolean
}

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ menuId, expanded, children, ...props }, ref) => {
    return (
      <AccessibleButton
        ref={ref}
        aria-haspopup="menu"
        aria-expanded={expanded}
        aria-controls={menuId}
        {...props}
      >
        {children}
        <svg
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </AccessibleButton>
    )
  }
)

MenuButton.displayName = 'MenuButton'

export { AccessibleButton as Button, buttonVariants }