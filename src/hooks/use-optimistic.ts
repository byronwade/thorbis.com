'use client'

import { useCallback, useState, useTransition } from 'react'
import { mutate } from 'swr'
import { useAppStore } from '@/lib/store'
import { webVitalsTracking } from '@/lib/web-vitals-tracking'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface OptimisticError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface IdentifiableItem {
  id: string | number;
}

export interface OptimisticAction<T, P> {
  optimisticUpdate: (currentData: T, params: P) => T
  mutation: (params: P) => Promise<T>
  rollbackUpdate?: (currentData: T, originalData: T, error: OptimisticError) => T
  onSuccess?: (data: T, params: P) => void
  onError?: (error: OptimisticError, params: P, originalData: T) => void
  cacheKey: string
}

export interface UseOptimisticResult<T, P> {
  execute: (params: P) => Promise<T | null>
  isPending: boolean
  error: OptimisticError | null
  reset: () => void
}

export interface OptimisticListAction<T, P> {
  type: 'add' | 'update' | 'delete'
  optimisticUpdate: (currentData: T[], params: P) => T[]
  mutation: (params: P) => Promise<T | void>
  rollbackUpdate?: (currentData: T[], originalData: T[], error: OptimisticError) => T[]
  onSuccess?: (data: T | void, params: P) => void
  onError?: (error: OptimisticError, params: P, originalData: T[]) => void
  cacheKey: string
}

// =============================================================================
// Core Optimistic Hook
// =============================================================================

export function useOptimistic<T, P>(
  action: OptimisticAction<T, P>
): UseOptimisticResult<T, P> {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<OptimisticError | null>(null)
  const { addNotification } = useAppStore()

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setError(null)
      const startTime = performance.now()

      // Get current data from cache
      const currentData = mutate(action.cacheKey, undefined, { revalidate: false })

      if (!currentData) {
        const error: OptimisticError = {
          message: 'No data available for optimistic update',
          code: 'NO_DATA',
          status: 404
        }
        setError(error)
        return null
      }

      // Apply optimistic update
      const optimisticData = action.optimisticUpdate(currentData, params)
      
      // Update cache optimistically
      mutate(action.cacheKey, optimisticData, { revalidate: false })

      // Track optimistic update
      webVitalsTracking.trackCustomMetric('optimistic-update', 1, {
        cacheKey: action.cacheKey,
        type: 'apply'
      })

      // Show optimistic feedback
      addNotification({
        title: 'Processing...',
        message: 'Your changes are being applied',
        type: 'info'
      })

      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            // Execute the actual mutation
            const result = await action.mutation(params)
            
            // Update cache with real data
            mutate(action.cacheKey, result, { revalidate: false })
            
            // Track successful completion
            const duration = performance.now() - startTime
            webVitalsTracking.trackCustomMetric('optimistic-mutation-success', duration, {
              cacheKey: action.cacheKey
            })

            // Success callback
            action.onSuccess?.(result, params)
            
            // Show success notification
            addNotification({
              title: 'Success',
              message: 'Changes applied successfully',
              type: 'success'
            })

            resolve(result)
          } catch (mutationError) {
            const errorObject: OptimisticError = mutationError instanceof Error 
              ? { 
                  message: mutationError.message, 
                  code: 'MUTATION_ERROR',
                  details: { originalError: mutationError }
                }
              : { 
                  message: 'An unknown error occurred', 
                  code: 'UNKNOWN_ERROR',
                  details: { originalError: mutationError }
                }
            setError(errorObject)
            
            // Rollback optimistic update
            if (action.rollbackUpdate) {
              const rolledBackData = action.rollbackUpdate(optimisticData, currentData, errorObject)
              mutate(action.cacheKey, rolledBackData, { revalidate: false })
            } else {
              // Default rollback: restore original data
              mutate(action.cacheKey, currentData, { revalidate: false })
            }

            // Track rollback
            webVitalsTracking.trackCustomMetric('optimistic-rollback', 1, {
              cacheKey: action.cacheKey,
              error: errorObject.message
            })

            // Error callback
            action.onError?.(errorObject, params, currentData)
            
            // Show error notification
            addNotification({
              title: 'Error',
              message: errorObject.message || 'Failed to apply changes',
              type: 'error'
            })

            resolve(null)
          }
        })
      })
    },
    [action, addNotification]
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isPending,
    error,
    reset
  }
}

// =============================================================================
// List-Specific Optimistic Hook
// =============================================================================

export function useOptimisticList<T, P>(
  action: OptimisticListAction<T, P>
): UseOptimisticResult<T | void, P> {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<OptimisticError | null>(null)
  const { addNotification } = useAppStore()

  const execute = useCallback(
    async (params: P): Promise<T | void | null> => {
      setError(null)
      const startTime = performance.now()

      // Get current list data from cache
      const currentData = mutate(action.cacheKey, undefined, { revalidate: false }) as T[]

      if (!currentData) {
        const error: OptimisticError = {
          message: 'No list data available for optimistic update',
          code: 'NO_LIST_DATA',
          status: 404
        }
        setError(error)
        return null
      }

      // Apply optimistic update to list
      const optimisticData = action.optimisticUpdate(currentData, params)
      
      // Update cache optimistically
      mutate(action.cacheKey, optimisticData, { revalidate: false })

      // Track optimistic update
      webVitalsTracking.trackCustomMetric('optimistic-list-update', 1, {
        cacheKey: action.cacheKey,
        type: action.type,
        listLength: optimisticData.length
      })

      // Show optimistic feedback based on action type
      const actionMessages = {
        add: 'Adding item...',
        update: 'Updating item...',
        delete: 'Removing item...'
      }
      
      addNotification({
        title: 'Processing...',
        message: actionMessages[action.type] || 'Processing...',
        type: 'info'
      })

      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            // Execute the actual mutation
            const result = await action.mutation(params)
            
            // For deletions, we might not get data back
            // For adds/updates, we typically get the item back
            let finalData = optimisticData
            
            if (result && action.type === 'add') {
              // Replace optimistic item with real item
              finalData = currentData.concat(result as T)
            } else if (result && action.type === 'update') {
              // Update the item in the list
              finalData = optimisticData.map(item => {
                const itemWithId = item as T & IdentifiableItem
                const resultWithId = result as T & IdentifiableItem
                return itemWithId.id === resultWithId.id ? result as T : item
              })
            }
            // For delete, keep the optimistic data (item already removed)
            
            // Update cache with final data
            mutate(action.cacheKey, finalData, { revalidate: false })
            
            // Track successful completion
            const duration = performance.now() - startTime
            webVitalsTracking.trackCustomMetric('optimistic-list-mutation-success', duration, {
              cacheKey: action.cacheKey,
              type: action.type
            })

            // Success callback
            action.onSuccess?.(result, params)
            
            // Show success notification
            const successMessages = {
              add: 'Item added successfully',
              update: 'Item updated successfully',
              delete: 'Item removed successfully'
            }
            
            addNotification({
              title: 'Success',
              message: successMessages[action.type] || 'Changes applied successfully',
              type: 'success'
            })

            resolve(result)
          } catch (mutationError) {
            const errorObject: OptimisticError = mutationError instanceof Error 
              ? { 
                  message: mutationError.message, 
                  code: 'LIST_MUTATION_ERROR',
                  details: { originalError: mutationError }
                }
              : { 
                  message: 'An unknown list error occurred', 
                  code: 'UNKNOWN_LIST_ERROR',
                  details: { originalError: mutationError }
                }
            setError(errorObject)
            
            // Rollback optimistic update
            if (action.rollbackUpdate) {
              const rolledBackData = action.rollbackUpdate(optimisticData, currentData, errorObject)
              mutate(action.cacheKey, rolledBackData, { revalidate: false })
            } else {
              // Default rollback: restore original data
              mutate(action.cacheKey, currentData, { revalidate: false })
            }

            // Track rollback
            webVitalsTracking.trackCustomMetric('optimistic-list-rollback', 1, {
              cacheKey: action.cacheKey,
              type: action.type,
              error: errorObject.message
            })

            // Error callback
            action.onError?.(errorObject, params, currentData)
            
            // Show error notification
            const errorMessages = {
              add: 'Failed to add item',
              update: 'Failed to update item',
              delete: 'Failed to remove item'
            }
            
            addNotification({
              title: 'Error',
              message: errorMessages[action.type] || errorObject.message || 'Failed to apply changes',
              type: 'error'
            })

            resolve(null)
          }
        })
      })
    },
    [action, addNotification]
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isPending,
    error,
    reset
  }
}

// =============================================================================
// Specialized Optimistic Hooks
// =============================================================================

// Hook for form submissions with optimistic updates
export function useOptimisticForm<TData, TForm>(
  cacheKey: string,
  submitAction: (formData: TForm) => Promise<TData>,
  options: {
    optimisticUpdate?: (currentData: TData, formData: TForm) => TData
    onSuccess?: (data: TData, formData: TForm) => void
    onError?: (error: OptimisticError, formData: TForm) => void
    successMessage?: string
    errorMessage?: string
  } = {}
) {
  const { addNotification } = useAppStore()
  
  const action: OptimisticAction<TData, TForm> = {
    cacheKey,
    mutation: submitAction,
    optimisticUpdate: options.optimisticUpdate || ((current) => current),
    onSuccess: (data, params) => {
      options.onSuccess?.(data, params)
      if (options.successMessage) {
        addNotification({
          title: 'Success',
          message: options.successMessage,
          type: 'success'
        })
      }
    },
    onError: (error, params, original) => {
      options.onError?.(error, params)
      if (options.errorMessage) {
        addNotification({
          title: 'Error',
          message: options.errorMessage,
          type: 'error'
        })
      }
    }
  }

  return useOptimistic(action)
}

// Hook for like/favorite buttons
export function useOptimisticToggle(
  cacheKey: string,
  toggleAction: (currentState: boolean) => Promise<boolean>,
  initialState: boolean = false
) {
  const [localState, setLocalState] = useState(initialState)
  
  const action: OptimisticAction<boolean, void> = {
    cacheKey,
    mutation: async () => {
      const newState = await toggleAction(localState)
      setLocalState(newState)
      return newState
    },
    optimisticUpdate: (current) => !current,
    rollbackUpdate: (current, original) => original
  }

  const optimistic = useOptimistic(action)

  const toggle = useCallback(async () => {
    setLocalState(!localState) // Immediate UI update
    await optimistic.execute(undefined)
  }, [localState, optimistic])

  return {
    state: localState,
    toggle,
    isPending: optimistic.isPending,
    error: optimistic.error
  }
}

// Hook for counter/quantity updates
export function useOptimisticCounter(
  cacheKey: string,
  updateAction: (newValue: number) => Promise<number>,
  initialValue: number = 0,
  step: number = 1
) {
  const [localValue, setLocalValue] = useState(initialValue)

  const action: OptimisticAction<number, number> = {
    cacheKey,
    mutation: async (newValue) => {
      const result = await updateAction(newValue)
      setLocalValue(result)
      return result
    },
    optimisticUpdate: (current, newValue) => newValue,
    rollbackUpdate: (current, original) => original
  }

  const optimistic = useOptimistic(action)

  const increment = useCallback(async () => {
    const newValue = localValue + step
    setLocalValue(newValue)
    await optimistic.execute(newValue)
  }, [localValue, step, optimistic])

  const decrement = useCallback(async () => {
    const newValue = Math.max(0, localValue - step)
    setLocalValue(newValue)
    await optimistic.execute(newValue)
  }, [localValue, step, optimistic])

  const setValue = useCallback(async (value: number) => {
    setLocalValue(value)
    await optimistic.execute(value)
  }, [optimistic])

  return {
    value: localValue,
    increment,
    decrement,
    setValue,
    isPending: optimistic.isPending,
    error: optimistic.error
  }
}

// Hook for drag and drop reordering
export function useOptimisticReorder<T extends { id: string; order?: number }>(
  cacheKey: string,
  reorderAction: (items: T[]) => Promise<T[]>
) {
  const action: OptimisticListAction<T, { fromIndex: number; toIndex: number }> = {
    type: 'update',
    cacheKey,
    mutation: async ({ fromIndex, toIndex }) => {
      const currentData = mutate(cacheKey, undefined, { revalidate: false }) as T[]
      if (!currentData) throw new Error('No data available')
      
      const reorderedItems = [...currentData]
      const [movedItem] = reorderedItems.splice(fromIndex, 1)
      reorderedItems.splice(toIndex, 0, movedItem)
      
      // Update order properties if they exist
      const itemsWithOrder = reorderedItems.map((item, index) => ({
        ...item,
        order: index
      }))
      
      return await reorderAction(itemsWithOrder)
    },
    optimisticUpdate: (currentData, { fromIndex, toIndex }) => {
      const reorderedItems = [...currentData]
      const [movedItem] = reorderedItems.splice(fromIndex, 1)
      reorderedItems.splice(toIndex, 0, movedItem)
      return reorderedItems
    }
  }

  const optimistic = useOptimisticList(action)

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      return optimistic.execute({ fromIndex, toIndex })
    },
    [optimistic]
  )

  return {
    reorder,
    isPending: optimistic.isPending,
    error: optimistic.error,
    reset: optimistic.reset
  }
}

export default useOptimistic