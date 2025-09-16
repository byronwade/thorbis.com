'use client'

import React from 'react'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'

// =============================================================================
// Types and Interfaces
// =============================================================================

interface OptimisticButtonProps extends ButtonProps {
  isPending?: boolean
  isSuccess?: boolean
  isError?: boolean
  pendingText?: string
  successText?: string
  errorText?: string
  showIcon?: boolean
  resetOnSuccess?: number // Auto reset after milliseconds
  onReset?: () => void
}

// =============================================================================
// Optimistic Button Component
// =============================================================================

export function OptimisticButton({
  children,
  className,
  disabled,
  isPending = false,
  isSuccess = false,
  isError = false,
  pendingText,
  successText,
  errorText,
  showIcon = true,
  resetOnSuccess = 2000,
  onReset,
  ...props
}: OptimisticButtonProps) {
  const [showingSuccess, setShowingSuccess] = React.useState(false)

  // Handle success state auto-reset
  React.useEffect(() => {
    if (isSuccess && resetOnSuccess > 0) {
      setShowingSuccess(true)
      const timeout = setTimeout(() => {
        setShowingSuccess(false)
        onReset?.()
      }, resetOnSuccess)
      return () => clearTimeout(timeout)
    }
  }, [isSuccess, resetOnSuccess, onReset])

  const getCurrentState = () => {
    if (isPending) return 'pending'
    if (showingSuccess || isSuccess) return 'success' 
    if (isError) return 'error'
    return 'default'
  }

  const currentState = getCurrentState()

  const getContent = () => {
    switch (currentState) {
      case 'pending':
        return (
          <>
            {showIcon && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            {pendingText || 'Processing...'}
          </>
        )
      case 'success':
        return (
          <>
            {showIcon && <CheckCircle className="w-4 h-4 mr-2" />}
            {successText || 'Success!'}
          </>
        )
      case 'error':
        return (
          <>
            {showIcon && <AlertCircle className="w-4 h-4 mr-2" />}
            {errorText || 'Error'}
          </>
        )
      default:
        return children
    }
  }

  const getVariant = (): ButtonProps['variant'] => {
    switch (currentState) {
      case 'pending':
        return 'outline'
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return props.variant || 'default'
    }
  }

  const getClassName = () => {
    const baseClasses = 'transition-all duration-200'
    const stateClasses = {
      pending: 'opacity-75 cursor-wait',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      error: 'bg-red-600 hover:bg-red-700 text-white',
      default: '
    }
    
    return cn(
      baseClasses,
      stateClasses[currentState],
      className
    )
  }

  return (
    <Button
      {...props}
      variant={getVariant()}
      className={getClassName()}
      disabled={disabled || isPending}
    >
      {getContent()}
    </Button>
  )
}

// =============================================================================
// Like/Heart Button with Optimistic Updates
// =============================================================================

interface OptimisticLikeButtonProps {
  isLiked: boolean
  onToggle: () => Promise<void>
  isPending?: boolean
  likeCount?: number
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'heart' | 'thumbs'
  className?: string
}

export function OptimisticLikeButton({
  isLiked,
  onToggle,
  isPending = false,
  likeCount = 0,
  showCount = true,
  size = 'md',
  variant = 'heart',
  className
}: OptimisticLikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = React.useState(isLiked)
  const [optimisticCount, setOptimisticCount] = React.useState(likeCount)

  // Sync with external state
  React.useEffect(() => {
    setOptimisticLiked(isLiked)
    setOptimisticCount(likeCount)
  }, [isLiked, likeCount])

  const handleToggle = async () => {
    // Optimistic update
    const newLiked = !optimisticLiked
    setOptimisticLiked(newLiked)
    setOptimisticCount(prev => prev + (newLiked ? 1 : -1))

    try {
      await onToggle()
    } catch (error) {
      // Rollback on error
      setOptimisticLiked(!newLiked)
      setOptimisticCount(prev => prev + (newLiked ? -1 : 1))
      console.error('Failed to toggle like:', error)
    }
  }

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const getIcon = () => {
    if (variant === 'heart') {
      return optimisticLiked ? '❤️' : '🤍'
    } else {
      return optimisticLiked ? '👍' : '👎'
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 rounded-lg border transition-all duration-200',
        'hover:scale-105 active:scale-95',
        sizeClasses[size],
        optimisticLiked 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
        isPending && 'opacity-75 cursor-wait animate-pulse',
        className
      )}
    >
      <span className={iconSizes[size]}>{getIcon()}</span>
      {showCount && (
        <span className="font-medium">
          {optimisticCount.toLocaleString()}
        </span>
      )}
    </button>
  )
}

// =============================================================================
// Quantity Selector with Optimistic Updates
// =============================================================================

interface OptimisticQuantitySelectorProps {
  value: number
  onIncrement: () => Promise<void>
  onDecrement: () => Promise<void>
  onValueChange?: (value: number) => Promise<void>
  isPending?: boolean
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function OptimisticQuantitySelector({
  value,
  onIncrement,
  onDecrement,
  onValueChange,
  isPending = false,
  min = 0,
  max = 999,
  step = 1,
  size = 'md',
  disabled = false,
  className
}: OptimisticQuantitySelectorProps) {
  const [optimisticValue, setOptimisticValue] = React.useState(value)
  const [pendingAction, setPendingAction] = React.useState<'inc' | 'dec' | null>(null)

  // Sync with external value
  React.useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const handleIncrement = async () => {
    if (optimisticValue >= max || disabled || isPending) return
    
    setPendingAction('inc')
    setOptimisticValue(prev => Math.min(prev + step, max))

    try {
      await onIncrement()
    } catch (error) {
      setOptimisticValue(prev => Math.max(prev - step, min))
      console.error('Failed to increment:', error)
    } finally {
      setPendingAction(null)
    }
  }

  const handleDecrement = async () => {
    if (optimisticValue <= min || disabled || isPending) return
    
    setPendingAction('dec')
    setOptimisticValue(prev => Math.max(prev - step, min))

    try {
      await onDecrement()
    } catch (error) {
      setOptimisticValue(prev => Math.min(prev + step, max))
      console.error('Failed to decrement:', error)
    } finally {
      setPendingAction(null)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  }

  const inputSizeClasses = {
    sm: 'h-8 w-16 text-sm',
    md: 'h-10 w-20 text-base',
    lg: 'h-12 w-24 text-lg'
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || optimisticValue <= min || pendingAction === 'dec'}
        className={cn(
          sizeClasses[size],
          pendingAction === 'dec' && 'animate-pulse'
        )}
      >
        {pendingAction === 'dec' ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          '-'
        )}
      </Button>

      <div className={cn(
        'flex items-center justify-center bg-background border rounded-md font-medium',
        inputSizeClasses[size]
      )}>
        {optimisticValue}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || optimisticValue >= max || pendingAction === 'inc'}
        className={cn(
          sizeClasses[size],
          pendingAction === 'inc' && 'animate-pulse'
        )}
      >
        {pendingAction === 'inc' ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          '+'
        )}
      </Button>
    </div>
  )
}

export default OptimisticButton