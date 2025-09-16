/**
 * PWA Install Prompt
 * Smart prompt for installing the portal as a mobile app
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download,
  Smartphone,
  X,
  Check,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const getPortalInfo = (portalType: string) => {
  switch (portalType) {
    case 'restaurant':
      return {
        name: 'Restaurant Portal',
        description: 'Access your restaurant supplies and orders on-the-go',
        icon: '🍽️'
      };
    case 'auto':
      return {
        name: 'Auto Services Portal',
        description: 'Track your vehicle services and maintenance anywhere',
        icon: '🚗'
      };
    case 'retail':
      return {
        name: 'Retail Portal',
        description: 'Manage your shopping and orders from anywhere',
        icon: '🛍️'
      };
    case 'hs':
      return {
        name: 'Home Services Portal',
        description: 'Manage your home services and schedule appointments',
        icon: '🏠'
      };
    default:
      return {
        name: 'Customer Portal',
        description: 'Access your services anywhere',
        icon: '📱'
      };
  }
};

export function PWAInstallPrompt({
  portalType,
  onInstall,
  onDismiss,
  className
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);

  const portalInfo = getPortalInfo(portalType);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebApp);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setCanInstall(true);
      
      // Show prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setCanInstall(false);
      onInstall?.();
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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
  }, [isInstalled, onInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setIsInstalled(true);
        onInstall?.();
      } else {
        console.log('User dismissed the PWA install prompt');
      }

      setDeferredPrompt(null);
      setCanInstall(false);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed it
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Show again in 7 days
    const oneWeekFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-remind', oneWeekFromNow.toString());
  };

  // Don't show if already installed or can't install
  if (isInstalled || !canInstall || !showPrompt) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm", className)}>
      <Card className="bg-white dark:bg-neutral-900 shadow-lg border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{portalInfo.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">Install App</h3>
                <p className="text-xs text-muted-foreground">{portalInfo.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 -mt-1"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {portalInfo.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3 text-blue-500" />
              <span>App-like experience</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-purple-500" />
              <span>Auto-updates</span>
            </div>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span>{isOnline ? 'Connected' : 'Offline ready'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemindLater}
              className="flex-1"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for PWA installation status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebApp);

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for install prompt availability
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setCanInstall(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isInstalled, canInstall, isOnline };
}

// Offline status indicator
export function OfflineIndicator() {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm bg-yellow-50 border-yellow-200">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        You're currently offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
}