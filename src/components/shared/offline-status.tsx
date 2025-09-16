'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  WifiOff, 
  Wifi, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useOffline, useNetworkStatus } from '@/hooks/use-offline';

interface OfflineStatusProps {
  showDetails?: boolean;
  variant?: 'badge' | 'banner' | 'popup';
  className?: string;
}

export function OfflineStatus({ 
  showDetails = false, 
  variant = 'badge',
  className = ''
}: OfflineStatusProps) {
  const { isOnline, pendingSync, syncing, triggerSync, hasPendingSync } = useOffline();
  const { connectionType, isSlowConnection } = useNetworkStatus();
  const [showPopup, setShowPopup] = useState(false);

  if (variant === 'badge') {
    return (
      <Badge 
        variant={isOnline ? 'default' : 'secondary'}
        className={'flex items-center gap-1 cursor-pointer ${className}'}
        onClick={() => setShowPopup(true)}
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isOnline ? 'Online' : 'Offline'}
        {pendingSync > 0 && (
          <span className="ml-1 px-1 py-0.5 bg-orange-500 text-white text-xs rounded">
            {pendingSync}
          </span>
        )}
      </Badge>
    );
  }

  if (variant === 'banner` && (!isOnline || hasPendingSync)) {
    return (
      <div className={`bg-orange-900/20 border border-orange-500/20 p-3 ${className}'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Database className="h-4 w-4 text-orange-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-500" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {isOnline 
                  ? '${pendingSync} items waiting to sync'
                  : 'Working offline'
                }
              </p>
              <p className="text-xs text-neutral-400">
                {isOnline 
                  ? 'Data will sync automatically'
                  : 'Your work is saved locally and will sync when connection is restored'
                }
              </p>
            </div>
          </div>
          
          {isOnline && hasPendingSync && (
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSync}
              disabled={syncing}
              className="text-xs"
            >
              <RefreshCw className={'h-3 w-3 mr-1 ${syncing ? 'animate-spin' : '}'} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'popup' && showPopup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="bg-neutral-900 border-neutral-800 w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-orange-500" />
                )}
                Connection Status
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Network and synchronization information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Network Status</span>
              <Badge variant={isOnline ? 'default' : 'secondary'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* Connection Type */}
            {isOnline && connectionType !== 'unknown' && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Connection Type</span>
                <Badge variant={isSlowConnection ? 'outline' : 'secondary'}>
                  {connectionType.toUpperCase()}
                  {isSlowConnection && (
                    <AlertTriangle className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              </div>
            )}

            {/* Sync Status */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Pending Sync</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{pendingSync}</span>
                {syncing && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
              </div>
            </div>

            {/* Sync Actions */}
            {isOnline && hasPendingSync && (
              <Button
                onClick={triggerSync}
                disabled={syncing}
                className="w-full"
              >
                <RefreshCw className={'h-4 w-4 mr-2 ${syncing ? 'animate-spin' : '}'} />
                {syncing ? 'Syncing Data...' : 'Sync Now'}
              </Button>
            )}

            {/* Offline Features */}
            {!isOnline && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Available Offline:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Payments
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Customer Data
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Work Orders
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Photo Capture
                  </div>
                </div>
              </div>
            )}

            {/* Connection Tips */}
            {!isOnline && (
              <div className="bg-neutral-800 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="text-xs text-neutral-300">
                    <p className="font-medium text-white mb-1">Working Offline</p>
                    <p>All your work is automatically saved and will sync when you're back online.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Compact offline indicator for headers/navbars
export function OfflineIndicator({ className = ` }: { className?: string }) {
  const { isOnline, pendingSync } = useOffline();

  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}'}>
      {!isOnline && (
        <div className="flex items-center gap-1 text-orange-400">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-medium">Offline</span>
        </div>
      )}
      
      {pendingSync > 0 && (
        <div className="flex items-center gap-1 text-blue-400">
          <Database className="h-4 w-4" />
          <span className="text-xs font-medium">{pendingSync}</span>
        </div>
      )}
    </div>
  );
}

// Global offline notification banner
export function OfflineNotificationBanner() {
  const { isOnline, pendingSync } = useOffline();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline && pendingSync === 0) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-orange-900/20 border-b border-orange-500/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Clock className="h-4 w-4 text-orange-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <p className="text-sm text-white">
            {isOnline 
              ? '${pendingSync} items pending sync'
              : 'You\'re working offline. Data will sync when connection is restored.'
            }
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-neutral-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}