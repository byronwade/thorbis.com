'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react'
import { createErrorBoundaryHandler } from '@/lib/error-handling/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'global'
}

interface ErrorFallbackProps {
  error: Error | null
  errorId: string | null
  errorInfo: ErrorInfo | null
  resetError: () => void
  level: 'page' | 'component' | 'global'
  showDetails: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorBoundaryHandler = createErrorBoundaryHandler()

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: 'err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Use the error boundary handler
    this.errorBoundaryHandler(error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorId={this.state.errorId}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          level={this.props.level || 'component'}
          showDetails={this.props.showDetails || false}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  errorId, 
  errorInfo, 
  resetError, 
  level, 
  showDetails 
}: ErrorFallbackProps) {
  const isGlobal = level === 'global'
  const isPage = level === 'page'

  return (
    <div className={'flex items-center justify-center p-6 ${isGlobal ? 'min-h-screen' : 'min-h-96'}'}>
      <Card className={'w-full ${isGlobal ? 'max-w-lg' : 'max-w-md'}'}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            {isGlobal ? 'Application Error' : isPage ? 'Page Error' : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {isGlobal 
              ? 'The application encountered an unexpected error and needs to be restarted.'
              : isPage
              ? 'This page encountered an error and cannot be displayed.'
              : 'This component encountered an error.'
            }
          </p>

          {errorId && (
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Error ID: {errorId}</p>
              <p className="text-xs text-muted-foreground">
                Please include this ID when reporting the issue
              </p>
            </div>
          )}

          {showDetails && error && (
            <details className="rounded-md bg-muted p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Technical Details
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Error:</p>
                  <p className="text-xs font-mono text-foreground">{error.message}</p>
                </div>
                {errorInfo?.componentStack && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Component Stack:</p>
                    <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            {isGlobal && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Error details:', { error, errorInfo, errorId })}
              >
                <Bug className="mr-2 h-3 w-3" />
                Log to Console
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error fallbacks
function ComponentErrorFallback({ resetError, showDetails = false }: Partial<ErrorFallbackProps>) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-sm font-medium text-red-800">Component Error</h3>
      </div>
      <p className="mt-1 text-sm text-red-700">
        This component failed to render properly.
      </p>
      <div className="mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={resetError}
          className="text-red-800 border-red-300 hover:bg-red-100"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function PageErrorFallback({ 
  error, 
  errorId, 
  resetError, 
  showDetails = false 
}: Partial<ErrorFallbackProps>) {
  return (
    <div className="min-h-96 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Page Error</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            This page encountered an error and cannot be displayed.
          </p>

          {errorId && (
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Error ID: {errorId}</p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<ErrorBoundaryProps> = {}
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = 'withErrorBoundary(${Component.displayName || Component.name})'
  
  return WrappedComponent
}

// Specialized boundary components
export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      level="global" 
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      level="page" 
      fallback={PageErrorFallback}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      level="component" 
      fallback={ComponentErrorFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary