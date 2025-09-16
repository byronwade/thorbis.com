'use client'

// Service Worker registration and management utilities for Thorbis Business OS
// Handles PWA functionality, offline capabilities, and update notifications

export interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export interface ServiceWorkerCallbacks {
  onRegistered?: (registration: ServiceWorkerRegistration) => void
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void
  onUpdated?: (registration: ServiceWorkerRegistration) => void
  onOffline?: () => void
  onOnline?: () => void
  onError?: (error: Error) => void
}

/**
 * Register service worker with enhanced error handling and update management
 */
export async function registerServiceWorker(
  swUrl: string = '/sw.js',
  callbacks: ServiceWorkerCallbacks = {}
): Promise<ServiceWorkerState> {
  const state: ServiceWorkerState = {
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    error: null
  }

  if (!state.isSupported) {
    console.warn('[SW] Service workers are not supported in this browser')
    callbacks.onError?.(new Error('Service workers not supported'))
    return state
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    })

    state.registration = registration
    state.isRegistered = true

    console.log('[SW] Service worker registered successfully:', registration.scope)
    callbacks.onRegistered?.(registration)

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing
      if (!installingWorker) return

      console.log('[SW] New service worker installing...')

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Update available
            console.log('[SW] New content available, update available')
            state.isUpdateAvailable = true
            callbacks.onUpdateAvailable?.(registration)
          } else {
            // First install
            console.log('[SW] Content cached for offline use')
            callbacks.onUpdated?.(registration)
          }
        }
      })
    })

    // Handle controller changes (when SW takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page')
      window.location.reload()
    })

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      handleServiceWorkerMessage(event.data, callbacks)
    })

    // Check for existing update
    if (registration.waiting) {
      state.isUpdateAvailable = true
      callbacks.onUpdateAvailable?.(registration)
    }

    // Set up periodic update checks (every 30 minutes)
    setInterval(() => {
      registration.update()
    }, 30 * 60 * 1000)

  } catch (error) {
    console.error('[SW] Service worker registration failed:', error)
    state.error = error instanceof Error ? error.message : 'Registration failed'
    callbacks.onError?.(error as Error)
  }

  return state
}

/**
 * Handle messages from service worker
 */
function handleServiceWorkerMessage(data: unknown, 
  callbacks: ServiceWorkerCallbacks
) {
  switch (data?.type) {
    case 'SW_UPDATED':
      console.log('[SW] Service worker updated:', data.message)
      break
    case 'CACHE_UPDATED':
      console.log('[SW] Cache updated:', data.urls)
      break
    case 'OFFLINE':
      console.log('[SW] App is offline')
      callbacks.onOffline?.()
      break
    case 'ONLINE':
      console.log('[SW] App is back online')
      callbacks.onOnline?.()
      break
    default:
      console.log('[SW] Unknown message from service worker:', data)
  }
}

/**
 * Update service worker to the latest version
 */
export function updateServiceWorker(registration: ServiceWorkerRegistration) {
  if (!registration.waiting) {
    console.warn('[SW] No waiting service worker found')
    return
  }

  console.log('[SW] Updating service worker...')
  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
}

/**
 * Unregister service worker (useful for development)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    for (const registration of registrations) {
      const unregistered = await registration.unregister()
      if (unregistered) {
        console.log('[SW] Service worker unregistered successfully')
      }
    }
    
    return true
  }
  
  return false
}

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

/**
 * Request persistent storage permission
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const granted = await navigator.storage.persist()
      console.log('[SW] Persistent storage granted:', granted)
      return granted
    } catch (error) {
      console.error('[SW] Failed to request persistent storage:', error)
      return false
    }
  }
  return false
}

/**
 * Get storage usage information
 */
export async function getStorageUsage(): Promise<{
  quota: number
  usage: number
  usagePercentage: number
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const quota = estimate.quota || 0
      const usage = estimate.usage || 0
      const usagePercentage = quota > 0 ? (usage / quota) * 100 : 0

      return {
        quota,
        usage,
        usagePercentage
      }
    } catch (error) {
      console.error('[SW] Failed to get storage usage:', error)
      return null
    }
  }
  return null
}

/**
 * Clear all caches (useful for debugging)
 */
export async function clearAllCaches(): Promise<boolean> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('[SW] All caches cleared')
      return true
    } catch (error) {
      console.error('[SW] Failed to clear caches:', error)
      return false
    }
  }
  return false
}

/**
 * Add URLs to cache
 */
export async function addToCache(urls: string[], cacheName: string = 'manual-cache'): Promise<void> {
  if ('caches' in window) {
    try {
      const cache = await caches.open(cacheName)
      await cache.addAll(urls)
      console.log('[SW] URLs added to cache:', urls)
    } catch (error) {
      console.error('[SW] Failed to add URLs to cache:', error)
      throw error
    }
  }
}

/**
 * Check network connectivity and update UI accordingly
 */
export function setupNetworkStatusMonitoring(callbacks: {
  onOnline?: () => void
  onOffline?: () => void
}): () => void {
  const handleOnline = () => {
    console.log('[SW] Network back online')
    callbacks.onOnline?.()
  }

  const handleOffline = () => {
    console.log('[SW] Network went offline')
    callbacks.onOffline?.()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Check if BeforeInstallPrompt is available and show install prompt
 */
export function setupInstallPrompt(): {
  canInstall: boolean
  showInstallPrompt: () => Promise<boolean>
  clearPrompt: () => void
} {
  let deferredPrompt: unknown = null

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    console.log('[SW] Install prompt available')
  })

  const showInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('[SW] Install prompt not available')
      return false
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('[SW] User responded to install prompt:', outcome)
      
      // Clear the prompt
      deferredPrompt = null
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('[SW] Failed to show install prompt:', error)
      return false
    }
  }

  const clearPrompt = () => {
    deferredPrompt = null
  }

  return {
    canInstall: !!deferredPrompt,
    showInstallPrompt,
    clearPrompt
  }
}

/**
 * React hook for service worker state
 */
export function useServiceWorker(
  swUrl: string = '/sw.js',
  callbacks: ServiceWorkerCallbacks = {}
) {
  const [state, setState] = React.useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    error: null
  })

  React.useEffect(() => {
    registerServiceWorker(swUrl, {
      ...callbacks,
      onRegistered: (registration) => {
        setState(prev => ({ ...prev, isRegistered: true, registration }))
        callbacks.onRegistered?.(registration)
      },
      onUpdateAvailable: (registration) => {
        setState(prev => ({ ...prev, isUpdateAvailable: true }))
        callbacks.onUpdateAvailable?.(registration)
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error: error.message }))
        callbacks.onError?.(error)
      }
    }).then(initialState => {
      setState(initialState)
    })
  }, [swUrl, callbacks])

  const update = () => {
    if (state.registration) {
      updateServiceWorker(state.registration)
    }
  }

  return {
    ...state,
    update,
    isPWA: isPWAInstalled()
  }
}

// Make React import available for the hook
declare global {
  const React: typeof import('react')
}

// Fallback for environments where React is not available
if (typeof React === 'undefined') {
  (global as any).React = {
    useState: () => [null, () => {}],
    useEffect: () => {}
  }
}