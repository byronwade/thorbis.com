'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { 
  registerServiceWorker, 
  updateServiceWorker, 
  isPWAInstalled,
  setupInstallPrompt,
  setupNetworkStatusMonitoring,
  type ServiceWorkerState
} from '@/lib/service-worker'
import { 
  Download, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Monitor,
  X,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'

// =============================================================================
// PWA Manager Component - Handles installation, updates, and offline status
// =============================================================================

interface PWAManagerProps {
  className?: string
  showInstallPrompt?: boolean
  showUpdateNotification?: boolean
  showOfflineStatus?: boolean
}

export default function PWAManager({
  className,
  showInstallPrompt = true,
  showUpdateNotification = true, 
  showOfflineStatus = true
}: PWAManagerProps) {
  // Service Worker state
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    error: null
  })

  // PWA install state
  const [installState, setInstallState] = useState({
    canInstall: false,
    isInstalled: isPWAInstalled(),
    showPrompt: false
  })

  // Network state
  const [isOnline, setIsOnline] = useState(true)

  // Notification states
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize service worker
  useEffect(() => {
    const initServiceWorker = async () => {
      const initialState = await registerServiceWorker('/sw.js', {
        onRegistered: (registration) => {
          console.log('[PWA] Service worker registered successfully')
          setSwState(prev => ({ ...prev, isRegistered: true, registration }))
        },
        onUpdateAvailable: (registration) => {
          console.log('[PWA] Service worker update available')
          setSwState(prev => ({ ...prev, isUpdateAvailable: true }))
          if (showUpdateNotification) {
            setShowUpdateBanner(true)
          }
        },
        onUpdated: (registration) => {
          console.log('[PWA] Service worker updated successfully')
          setShowUpdateBanner(false)
          setIsUpdating(false)
        },
        onOffline: () => {
          console.log('[PWA] App went offline')
          setIsOnline(false)
          if (showOfflineStatus) {
            setShowOfflineBanner(true)
          }
        },
        onOnline: () => {
          console.log('[PWA] App back online')
          setIsOnline(true)
          setShowOfflineBanner(false)
        },
        onError: (error) => {
          console.error('[PWA] Service worker error:', error)
          setSwState(prev => ({ ...prev, error: error.message }))
        }
      })
      
      setSwState(initialState)
    }

    initServiceWorker()
  }, [showUpdateNotification, showOfflineStatus])

  // Setup install prompt
  useEffect(() => {
    const { canInstall, showInstallPrompt: showPrompt } = setupInstallPrompt()
    
    setInstallState(prev => ({
      ...prev,
      canInstall,
      showPrompt: canInstall && showInstallPrompt && !prev.isInstalled
    }))

    // Check if already installed
    setInstallState(prev => ({
      ...prev,
      isInstalled: isPWAInstalled()
    }))
  }, [showInstallPrompt])

  // Setup network monitoring
  useEffect(() => {
    const cleanup = setupNetworkStatusMonitoring({
      onOnline: () => {
        setIsOnline(true)
        setShowOfflineBanner(false)
      },
      onOffline: () => {
        setIsOnline(false)
        if (showOfflineStatus) {
          setShowOfflineBanner(true)
        }
      }
    })

    // Set initial online status
    setIsOnline(navigator.onLine)

    return cleanup
  }, [showOfflineStatus])

  // Handle service worker update
  const handleUpdate = async () => {
    if (!swState.registration) return
    
    setIsUpdating(true)
    updateServiceWorker(swState.registration)
    
    // Hide banner after a delay if update doesn't complete
    setTimeout(() => {
      setShowUpdateBanner(false)
      setIsUpdating(false)
    }, 5000)
  }

  // Handle PWA installation
  const handleInstall = async () => {
    const { showInstallPrompt } = setupInstallPrompt()
    const success = await showInstallPrompt()
    
    if (success) {
      setInstallState(prev => ({
        ...prev,
        isInstalled: true,
        showPrompt: false
      }))
    }
  }

  // Hide install prompt
  const hideInstallPrompt = () => {
    setInstallState(prev => ({ ...prev, showPrompt: false }))
  }

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-[100] pointer-events-none', className)}>
      {/* Update Available Banner */}
      {showUpdateBanner && (
        <div className="pointer-events-auto mb-4 mx-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className={cn('h-5 w-5', isUpdating && 'animate-spin')} />
                <div>
                  <h3 className="font-semibold text-sm">Update Available</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    A new version of Thorbis Business OS is ready to install
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AccessibleButton
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  ariaLabel="Update to latest version"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => setShowUpdateBanner(false)}
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20"
                  ariaLabel="Dismiss update notification"
                >
                  <X className="h-4 w-4" />
                </AccessibleButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt Banner */}
      {installState.showPrompt && (
        <div className="pointer-events-auto mb-4 mx-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <Monitor className="h-4 w-4" />
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Install Thorbis Business OS</h3>
                  <p className="text-xs text-green-100 mt-1">
                    Install our app for faster access and offline capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AccessibleButton
                  onClick={handleInstall}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  ariaLabel="Install Thorbis Business OS"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </AccessibleButton>
                <AccessibleButton
                  onClick={hideInstallPrompt}
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20"
                  ariaLabel="Dismiss install prompt"
                >
                  <X className="h-4 w-4" />
                </AccessibleButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {showOfflineBanner && (
        <div className="pointer-events-auto mb-4 mx-4">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">You're Offline</h3>
                  <p className="text-xs text-orange-100 mt-1">
                    Some features may be limited. Changes will sync when you're back online.
                  </p>
                </div>
              </div>
              <AccessibleButton
                onClick={() => setShowOfflineBanner(false)}
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20"
                ariaLabel="Dismiss offline notification"
              >
                <X className="h-4 w-4" />
              </AccessibleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// PWA Status Indicator Component
// =============================================================================

interface PWAStatusProps {
  className?: string
  showText?: boolean
}

export function PWAStatus({ className, showText = false }: PWAStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled] = useState(isPWAInstalled())

  useEffect(() => {
    const cleanup = setupNetworkStatusMonitoring({
      onOnline: () => setIsOnline(true),
      onOffline: () => setIsOnline(false)
    })

    setIsOnline(navigator.onLine)
    return cleanup
  }, [])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Network Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-orange-500" />
        )}
        {showText && (
          <span className="text-xs text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>

      {/* Install Status */}
      {isInstalled && (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-blue-500" />
          {showText && (
            <span className="text-xs text-muted-foreground">
              Installed
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// PWA Info Component
// =============================================================================

export function PWAInfo({ className }: { className?: string }) {
  const [isInstalled] = useState(isPWAInstalled())
  const [swRegistered, setSwRegistered] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setSwRegistered(!!registration)
      })
    }
  }, [])

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-foreground">PWA Status</h4>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          {swRegistered ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
          <span className="text-muted-foreground">
            Service Worker: {swRegistered ? 'Active' : 'Not Registered'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isInstalled ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Info className="h-3 w-3 text-blue-500" />
          )}
          <span className="text-muted-foreground">
            Installation: {isInstalled ? 'Installed' : 'Web Browser'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {navigator.onLine ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-orange-500" />
          )}
          <span className="text-muted-foreground">
            Network: {navigator.onLine ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}