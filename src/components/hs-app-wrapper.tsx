'use client'

import React, { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/data-table'

export interface AppWrapperProps {
  children: React.ReactNode
}

interface SecurityContext {
  businessId: string | null
  userId: string | null
  role: string | null
  permissions: string[]
}

interface PWAStatus {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
}

interface HardwareStatus {
  printerConnected: boolean
  scannerConnected: boolean
  sessionId: string | null
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    businessId: null,
    userId: null,
    role: null,
    permissions: []
  })
  
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine || true,
    syncStatus: 'idle'
  })
  
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>({
    printerConnected: false,
    scannerConnected: false,
    sessionId: null
  })

  // PWA Installation and Service Worker Management
  useEffect(() => {
    // Register service worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('SW update found')
          })
        })
        .catch(registrationError => {
          console.log('SW registration failed:', registrationError)
        })
    }

    // PWA install prompt
    let deferredPrompt: unknown = null
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      setPwaStatus(prev => ({ ...prev, isInstallable: true }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaStatus(prev => ({ ...prev, isInstalled: true }))
    }

    // Online/offline status
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Security Context Management
  useEffect(() => {
    // Initialize security context from JWT token
    const initializeSecurityContext = async () => {
      try {
        const token = localStorage.getItem('thorbis_auth_token')
        if (token) {
          // Validate token and extract claims
          const response = await fetch('/api/v1/auth/user', {
            headers: { Authorization: 'Bearer ${token}' }
          })
          
          if (response.ok) {
            const claims = await response.json()
            setSecurityContext({
              businessId: claims.business_id,
              userId: claims.sub,
              role: claims.role,
              permissions: claims.permissions || []
            })
          }
        }
      } catch (error) {
        console.error('Failed to initialize security context:', error)
        // Clear invalid token
        localStorage.removeItem('thorbis_auth_token')
      }
    }

    initializeSecurityContext()
  }, [])

  // Hardware Integration Management
  useEffect(() => {
    // Initialize hardware connections
    const initializeHardware = async () => {
      try {
        // Check for available hardware
        const hardwareResponse = await fetch('/api/v1/hardware/status')
        if (hardwareResponse.ok) {
          const hardware = await hardwareResponse.json()
          setHardwareStatus({
            printerConnected: hardware.printer?.connected || false,
            scannerConnected: hardware.scanner?.connected || false,
            sessionId: hardware.session_id
          })
        }
      } catch (error) {
        console.error('Failed to initialize hardware:', error)
      }
    }

    if (securityContext.businessId) {
      initializeHardware()
    }
  }, [securityContext.businessId])

  // Background Sync Management
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Register background sync events
        ;(registration as any).sync.register('work-order-sync')
        ;(registration as any).sync.register('customer-sync')
        ;(registration as any).sync.register('billing-sync')
      })
    }
  }, [securityContext.businessId])

  // AI Safety Monitoring
  useEffect(() => {
    // Monitor for suspicious activity patterns
    const monitorActivity = () => {
      // Track user interactions for safety analysis
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      
      // AI Safety: Report unusual patterns
      if (activities.length > 100) {
        fetch('/api/security/activity-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: securityContext.businessId,
            user_id: securityContext.userId,
            activity_summary: activities.slice(-10) // Last 10 activities
          })
        }).catch(error => console.error('Activity report failed:', error))'
        
        // Keep only recent activities
        localStorage.setItem('user_activities', JSON.stringify(activities.slice(-50)))
      }
    }

    const interval = setInterval(monitorActivity, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [securityContext])

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      {/* PWA Status Indicator */}
      {!pwaStatus.isOnline && (
        <div className="bg-orange-600 text-white px-4 py-2 text-sm text-center">
          Working offline - Changes will sync when connection is restored
        </div>
      )}
      
      {/* Security Context Provider */}
      <div data-security-context={JSON.stringify(securityContext)} style={{ display: 'none' }} />
      
      {/* Hardware Status Provider */}
      <div data-hardware-status={JSON.stringify(hardwareStatus)} style={{ display: 'none' }} />
      
      {/* PWA Install Banner (removed) */}
      {false && pwaStatus.isInstallable && !pwaStatus.isInstalled && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm text-center flex items-center justify-center gap-4">
          <span>Install Thorbis HS app for better experience</span>
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
            onClick={async () => {
              // Install PWA
              const deferredPrompt = (window as any).deferredPrompt
              if (deferredPrompt) {
                deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                if (outcome === 'accepted') {
                  setPwaStatus(prev => ({ ...prev, isInstallable: false }))
                }
              }
            }}
          >
            Install
          </button>
        </div>
      )}
      
      {/* Main App Content */}
      {children}
      
      {/* Enhanced Toast System */}
      <Toaster />
      
      {/* Performance Monitoring */}
      <PerformanceMonitor />
      
      {/* Security Event Logger */}
      <SecurityEventLogger securityContext={securityContext} />
    </div>
  )
}

// Performance monitoring component
function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            // Record navigation timing
            fetch('/api/metrics/performance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'navigation',
                load_time: navEntry.loadEventEnd - navEntry.fetchStart,
                dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                first_byte: navEntry.responseStart - navEntry.fetchStart
              })
            }).catch(() => {}) // Silent fail
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation'] })
    }
  }, [])
  
  return null
}

// Security event logging component
function SecurityEventLogger({ securityContext }: { securityContext: SecurityContext }) {
  useEffect(() => {
    // Log page views for security analysis
    const logPageView = () => {
      if (securityContext.businessId) {
        fetch('/api/security/page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: securityContext.businessId,
            user_id: securityContext.userId,
            path: window.location.pathname,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}) // Silent fail
      }
    }

    logPageView()
    
    // Log page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && securityContext.businessId) {
        // User left the page - log for security analysis
        navigator.sendBeacon('/api/security/session-event', JSON.stringify({
          business_id: securityContext.businessId,
          user_id: securityContext.userId,
          event: 'page_hidden',
          timestamp: new Date().toISOString()
        }))
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [securityContext])
  
  return null
}
