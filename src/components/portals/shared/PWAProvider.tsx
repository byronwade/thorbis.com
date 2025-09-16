/**
 * PWA Provider
 * Manages Progressive Web App functionality for portals
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  isUpdating: boolean;
  pendingSyncCount: number;
  installApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  syncPendingRequests: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: React.ReactNode;
  enableToasts?: boolean;
  enableBackgroundSync?: boolean;
}

export function PWAProvider({ 
  children, 
  enableToasts = true,
  enableBackgroundSync = true 
}: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered');
          setServiceWorkerRegistration(registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (enableToasts) {
                    toast.info('Update available', {
                      description: 'A new version of the app is ready to install.',
                      action: {
                        label: 'Update',
                        onClick: () => updateApp()
                      }
                    });
                  }
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            const { data } = event;
            
            if (data?.type === 'SW_UPDATED') {
              if (enableToasts) {
                toast.success('App updated', {
                  description: 'The app has been updated to the latest version.'
                });
              }
            }
            
            if (data?.type === 'BACKGROUND_SYNC_SUCCESS' && data?.count > 0) {
              if (enableToasts) {
                toast.success('Synced successfully', {
                  description: '${data.count} pending actions have been synced.'
                });
              }
              setPendingSyncCount(prev => Math.max(0, prev - data.count));
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        });
    }

    // Check if app is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebApp);
    };

    checkInstallStatus();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      
      if (enableToasts) {
        toast.success('App installed', {
          description: 'The portal app has been installed successfully!'
        });
      }
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      if (enableToasts) {
        toast.success('Back online', {
          description: 'Your connection has been restored.'
        });
      }
      
      // Attempt to sync pending requests
      if (enableBackgroundSync && pendingSyncCount > 0) {
        syncPendingRequests();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (enableToasts) {
        toast.warning('You\'re offline', {
          description: 'You can still use cached features.',
          duration: 5000
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableToasts, enableBackgroundSync, pendingSyncCount]);

  // Load pending sync count from localStorage on mount
  useEffect(() => {
    const loadPendingCount = () => {
      try {
        const pending = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        setPendingSyncCount(pending.length);
      } catch (error) {
        console.error('PWA: Failed to load pending requests count:', error);
      }
    };

    loadPendingCount();

    // Update count periodically
    const interval = setInterval(loadPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('PWA: Installation failed:', error);
      throw error;
    }
  };

  const updateApp = async (): Promise<void> => {
    if (!serviceWorkerRegistration) {
      throw new Error('Service Worker not registered');
    }

    setIsUpdating(true);

    try {
      // Check for updates
      await serviceWorkerRegistration.update();
      
      // If there's a waiting worker, activate it
      const waitingWorker = serviceWorkerRegistration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new service worker to take control
        await new Promise((resolve) => {
          const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve(void 0);
          };
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        });

        // Reload the page to get the updated version
        window.location.reload();
      }
    } catch (error) {
      console.error('PWA: Update failed:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const syncPendingRequests = async (): Promise<void> => {
    if (!enableBackgroundSync || !isOnline) {
      return;
    }

    try {
      // Trigger background sync if supported
      if (serviceWorkerRegistration && 'sync' in serviceWorkerRegistration) {
        await serviceWorkerRegistration.sync.register('background-sync');
      } else {
        // Manual sync fallback
        const pending = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        const successful = [];

        for (const requestData of pending) {
          try {
            const response = await fetch(requestData.url, {
              method: requestData.method,
              headers: requestData.headers,
              body: requestData.body
            });

            if (response.ok) {
              successful.push(requestData);
            }
          } catch (error) {
            console.log('PWA: Manual sync failed for request:', requestData.url);
          }
        }

        // Remove successful requests
        const remaining = pending.filter((req: unknown) => !successful.includes(req));
        localStorage.setItem('pendingRequests', JSON.stringify(remaining));
        setPendingSyncCount(remaining.length);

        if (successful.length > 0 && enableToasts) {
          toast.success('Synced successfully', {
            description: '${successful.length} pending actions have been synced.'
          });
        }
      }
    } catch (error) {
      console.error('PWA: Background sync failed:', error);
    }
  };

  const contextValue: PWAContextType = {
    isInstalled,
    canInstall,
    isOnline,
    isUpdating,
    pendingSyncCount,
    installApp,
    updateApp,
    syncPendingRequests
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

// Utility hook for offline status
export function useOfflineStatus() {
  const { isOnline } = usePWA();
  return !isOnline;
}

// Utility hook for install status
export function useInstallStatus() {
  const { isInstalled, canInstall, installApp } = usePWA();
  return { isInstalled, canInstall, installApp };
}