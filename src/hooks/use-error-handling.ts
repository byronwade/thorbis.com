import { useState, useCallback } from 'react'

export interface ErrorState {
  message: string
  code?: string
  timestamp: Date
}

export function useErrorHandling() {
  const [errors, setErrors] = useState<ErrorState[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addError = useCallback((message: string, code?: string) => {
    const error: ErrorState = {
      message,
      code,
      timestamp: new Date()
    }
    setErrors(prev => [...prev, error])
  }, [])

  const removeError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true)
    try {
      const result = await asyncFn()
      return result
    } catch (error) {
      const message = errorMessage || 
        (error instanceof Error ? error.message : 'An unknown error occurred')
      addError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [addError])

  const handleError = useCallback((error: unknown, defaultMessage = 'An error occurred') => {
    if (error instanceof Error) {
      addError(error.message)
    } else if (typeof error === 'string') {
      addError(error)
    } else {
      addError(defaultMessage)
    }
  }, [addError])

  return {
    errors,
    isLoading,
    addError,
    removeError,
    clearErrors,
    handleAsync,
    handleError
  }
}