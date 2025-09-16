'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/accessible-button'
import { RefreshCw, Wifi, Home, ArrowLeft, WifiOff } from 'lucide-react'

// =============================================================================
// Offline Page - Displayed when user is offline and page not cached
// =============================================================================

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine)
    updateConnectionType()
    setLastChecked(new Date())

    // Event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setLastChecked(new Date())
      // Auto-reload after a short delay to show connection restored
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setLastChecked(new Date())
    }

    const handleConnectionChange = () => {
      updateConnectionType()
      setLastChecked(new Date())
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for connection type changes (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', handleConnectionChange)
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  const updateConnectionType = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection?.effectiveType || connection?.type || 'unknown')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        
        {/* Connection Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center">
          {isOnline ? (
            <Wifi className="h-12 w-12 text-green-500" strokeWidth={1} />
          ) : (
            <WifiOff className="h-12 w-12 text-red-500" strokeWidth={1} />
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            {isOnline ? "Connection Restored!" : "You're Offline"}
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            {isOnline 
              ? "Your internet connection has been restored. Redirecting..." 
              : "It looks like you've lost your internet connection. Don't worry – we'll help you get back online."
            }
          </p>
        </div>

        {/* Status Information */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className={'w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}'} />
            Connection Status
          </h2>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Network Status:</span>
              <span className={'font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}'}>
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connection Type:</span>
              <span className="text-blue-500 font-medium capitalize">
                {connectionType}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Checked:</span>
              <span className="text-muted-foreground font-medium">
                {lastChecked.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Offline Mode:</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Troubleshooting Steps */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Try These Steps:
          </h2>
          
          <div className="text-sm text-muted-foreground space-y-2 text-left">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Check your internet connection</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Make sure Wi-Fi or cellular data is enabled</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Try refreshing the page when connection is restored</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Contact your network administrator if the problem persists</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            size="lg"
            className="w-full"
            ariaLabel="Retry connection and reload page"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="default"
              className="flex-1"
              ariaLabel="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="default"
              className="flex-1"
              ariaLabel="Return to homepage"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-4 text-xs text-muted-foreground">
          <p>
            While offline, you can still access previously visited pages and 
            some cached content. Your changes will be saved and synchronized 
            when your connection is restored.
          </p>
        </div>

        {/* Network Status Monitor */}
        <div className="pt-2">
          <div className={'inline-flex items-center gap-2 px-3 py-1 rounded-full ${
            isOnline 
              ? 'bg-green-500/10 text-green-600' 
              : 'bg-red-500/10 text-red-600'
          }'}>
            <div className={'w-2 h-2 rounded-full ${
              isOnline 
                ? 'bg-green-500' 
                : 'bg-red-500 animate-pulse'
            }'} />
            <span className="text-xs font-medium">
              {isOnline ? 'Connection Active' : 'Monitoring Connection...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}