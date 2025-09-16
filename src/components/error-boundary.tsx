'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { BaseError, errorMonitor, handleErrorBoundaryError, ErrorBoundaryState } from '@/lib/error-handling'
import { errorMonitoring } from '@/lib/error-monitoring'

// =============================================================================
// Error Boundary Props and Types
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Fallback component to render when an error occurs
   */
  fallback?: (error: Error, retry: () => void) => ReactNode
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Whether to show technical details (development only)
   */
  showDetails?: boolean
  /**
   * Custom error boundary identifier for tracking
   */
  boundaryId?: string
}

// =============================================================================
// Main Error Boundary Component
// =============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private readonly maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const state = handleErrorBoundaryError(error, errorInfo)
    this.setState(state)

    // Report to error monitoring service
    errorMonitoring.captureReactError(error as any, errorInfo)

    // Call custom onError handler
    this.props.onError?.(error, errorInfo)

    // Log additional context
    console.error('Error Boundary caught an error:', {
      boundaryId: this.props.boundaryId,
      retryCount: this.retryCount,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  private handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    } else {
      console.warn('Max retry attempts reached for error boundary')
    }
  }

  private handleReset = (): void => {
    this.retryCount = 0
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default error UI
      return <DefaultErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
        onReset={this.handleReset}
        canRetry={this.retryCount < this.maxRetries}
        retryCount={this.retryCount}
        showDetails={this.props.showDetails && process.env.NODE_ENV === 'development'}
        errorInfo={this.state.errorInfo}
      />
    }

    return this.props.children
  }
}

// =============================================================================
// Default Error Fallback Component
// =============================================================================

interface DefaultErrorFallbackProps {
  error: Error
  onRetry: () => void
  onReset: () => void
  canRetry: boolean
  retryCount: number
  showDetails?: boolean
  errorInfo?: Record<string, unknown>
}

function DefaultErrorFallback({
  error,
  onRetry,
  onReset,
  canRetry,
  retryCount,
  showDetails,
  errorInfo,
}: DefaultErrorFallbackProps) {
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                        error.message.toLowerCase().includes('fetch')

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-neutral-950">
      <Card className="max-w-md w-full bg-neutral-900 border-neutral-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <CardTitle className="text-white">Something went wrong</CardTitle>
          <CardDescription className="text-neutral-400">
            {isNetworkError 
              ? "We're having trouble connecting. Please check your internet connection."
              : "An unexpected error occurred. We've been notified and are working to fix it."
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {canRetry && (
              <Button 
                onClick={onRetry}
                variant="default"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount}/3)`}
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.href = '/dashboards'}
              variant="outline"
              className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <Button 
            onClick={onReset}
            variant="ghost"
            className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            Reset Component
          </Button>

          {/* Error Details (Development Only) */}
          {showDetails && (
            <details className="mt-6 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
              <summary className="cursor-pointer text-neutral-400 hover:text-white flex items-center">
                <Bug className="w-4 h-4 mr-2" />
                Technical Details
              </summary>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-red-400">Error:</span>
                  <div className="text-neutral-300 mt-1 p-2 bg-neutral-900 rounded">
                    {error.message}
                  </div>
                </div>
                
                {error.stack && (
                  <div>
                    <span className="text-red-400">Stack Trace:</span>
                    <pre className="text-neutral-300 mt-1 p-2 bg-neutral-900 rounded overflow-x-auto text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo && (
                  <div>
                    <span className="text-red-400">Component Stack:</span>
                    <pre className="text-neutral-300 mt-1 p-2 bg-neutral-900 rounded overflow-x-auto text-xs">
                      {JSON.stringify(errorInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Help Text */}
          <p className="text-xs text-neutral-500 text-center">
            If this problem persists, please contact support with the error details above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Specialized Error Boundaries
// =============================================================================

/**
 * Error boundary for async components and lazy-loaded modules
 */
export function AsyncErrorBoundary({ children, componentName }: { 
  children: ReactNode
  componentName?: string 
}) {
  return (
    <ErrorBoundary
      boundaryId={`async-${componentName}'}
      fallback={(error, retry) => (
        <div className="p-6 text-center bg-neutral-900 border border-neutral-800 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">Component failed to load</h3>
          <p className="text-neutral-400 text-sm mb-4">
            {componentName ? 'The ${componentName} component' : 'This component'} couldn't be loaded.
          </p>
          <Button onClick={retry} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for form components
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      boundaryId="form"
      fallback={(error, retry) => (
        <div className="p-4 border border-red-800 bg-red-950/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Form Error</span>
          </div>
          <p className="text-neutral-300 text-sm mb-3">
            There was an error with the form. Your data hasn't been saved.
          </p>
          <Button onClick={retry} size="sm" className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for route-level components
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      boundaryId="route"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Track route-level errors for analytics
        const routeError = new BaseError(
          error.message,
          'ROUTE_ERROR',
          500,
          {
            pathname: typeof window !== 'undefined' ? window.location.pathname : ',
            componentStack: errorInfo.componentStack,
          }
        )
        
        errorMonitor.reportError(routeError)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}