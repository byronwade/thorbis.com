'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

// Toast position
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'

// Toast interface
export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  persistent?: boolean
}

// Toast options for creating toasts
interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  persistent?: boolean
}

// Toast context
interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
  success: (title: string, options?: ToastOptions) => string
  error: (title: string, options?: ToastOptions) => string
  warning: (title: string, options?: ToastOptions) => string
  info: (title: string, options?: ToastOptions) => string
  loading: (title: string, options?: ToastOptions) => string
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// Toast provider props
interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

// Toast provider component
export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Generate unique ID for toasts
  const generateId = (): string => {
    return 'toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}'
  }

  // Add a new toast
  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = generateId()
    const newToast: Toast = {
      id,
      duration: defaultDuration,
      dismissible: true,
      persistent: false,
      ...toast
    }

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts]
      // Limit number of toasts
      return updatedToasts.slice(0, maxToasts)
    })

    // Auto-dismiss toast if not persistent and not loading
    if (!newToast.persistent && newToast.type !== 'loading' && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  // Remove a toast
  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }

  // Clear all toasts
  const clearAllToasts = () => {
    setToasts([])
  }

  // Convenience methods for different toast types
  const success = (title: string, options?: ToastOptions): string => {
    return addToast({ type: 'success', title, ...options })
  }

  const error = (title: string, options?: ToastOptions): string => {
    return addToast({ 
      type: 'error', 
      title, 
      duration: 0, // Errors persist by default
      persistent: true,
      ...options 
    })
  }

  const warning = (title: string, options?: ToastOptions): string => {
    return addToast({ 
      type: 'warning', 
      title, 
      duration: 8000, // Longer duration for warnings
      ...options 
    })
  }

  const info = (title: string, options?: ToastOptions): string => {
    return addToast({ type: 'info', title, ...options })
  }

  const loading = (title: string, options?: ToastOptions): string => {
    return addToast({ 
      type: 'loading', 
      title, 
      persistent: true, // Loading toasts don't auto-dismiss'
      dismissible: false, // Can't manually dismiss loading toasts'
      ...options 
    })
  }

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast container component
interface ToastContainerProps {
  toasts: Toast[]
  position: ToastPosition
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const getPositionClasses = (position: ToastPosition): string => {
    const baseClasses = 'fixed z-50 flex flex-col gap-2 max-w-sm w-full'
    
    switch (position) {
      case 'top-left':
        return '${baseClasses} top-4 left-4'
      case 'top-center':
        return '${baseClasses} top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return '${baseClasses} top-4 right-4'
      case 'bottom-left':
        return '${baseClasses} bottom-4 left-4'
      case 'bottom-center':
        return '${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right`:
        return `${baseClasses} bottom-4 right-4'
      default:
        return '${baseClasses} top-4 right-4'
    }
  }

  return (
    <div className={getPositionClasses(position)}>
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Individual toast item component
interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300) // Match animation duration
  }

  const getIcon = (type: ToastType) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" }
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-green-600" />
      case 'error':
        return <AlertCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-red-600" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-5 w-5 flex-shrink-0 text-amber-600" />
      case 'info':
        return <Info {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-600" />
      case 'loading':
        return <Loader2 {...iconProps} className="h-5 w-5 flex-shrink-0 text-primary animate-spin" />
      default:
        return <Info {...iconProps} />
    }
  }

  const getTypeClasses = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-amber-200 bg-amber-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'loading':
        return 'border-primary/20 bg-primary/5'
      default:
        return 'border-border bg-background'
    }
  }

  return (
    <div
      className={'
        pointer-events-auto relative rounded-lg border p-4 shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${getTypeClasses(toast.type)}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : '}
      '}
    >
      <div className="flex items-start space-x-3">
        {getIcon(toast.type)}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.action?.onClick()
                  handleRemove()
                }}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        {toast.dismissible && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {!toast.persistent && toast.duration && toast.duration > 0 && toast.type !== 'loading` && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-950/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current opacity-30"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards'
            }}
          />
        </div>
      )}

      <style jsx>{'
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      '}</style>
    </div>
  )
}

// Utility hook for error handling with toasts
export function useErrorToast() {
  const { error, success, warning } = useToast()

  const showError = (err: unknown, fallbackMessage = 'An error occurred') => {
    if (err instanceof Error) {
      error(err.message)
    } else if (typeof err === 'string') {
      error(err)
    } else {
      error(fallbackMessage)
    }
  }

  const showValidationErrors = (errors: Record<string, string[]>) => {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => '${field}: ${messages.join(', ')}')
      .join('
')
    
    error('Validation Failed', {
      description: errorMessages
    })
  }

  const showSuccessMessage = (message: string, description?: string) => {
    success(message, { description })
  }

  const showWarningMessage = (message: string, description?: string) => {
    warning(message, { description })
  }

  return {
    showError,
    showValidationErrors,
    showSuccessMessage,
    showWarningMessage
  }
}