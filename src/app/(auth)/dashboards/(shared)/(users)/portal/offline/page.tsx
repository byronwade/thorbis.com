/**
 * Portal Offline Page
 * Displayed when the portal is accessed offline
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff,
  RefreshCw,
  Home,
  Bell,
  User,
  Calendar,
  Package,
  Wifi,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineData {
  lastSync: string;
  cachedPages: string[];
  pendingActions: number;
  availableFeatures: string[];
}

export default function PortalOfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    lastSync: new Date().toISOString(),
    cachedPages: [
      'Dashboard',
      'Account Settings', 
      'Order History',
      'Notifications'
    ],
    pendingActions: 2,
    availableFeatures: [
      'View cached orders',
      'Update account information',
      'Browse service history',
      'Access support contacts'
    ]
  });

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Simulate loading cached data
    const loadOfflineData = () => {
      // In a real implementation, this would load from IndexedDB or cache
      const lastSyncTime = localStorage.getItem('portal-last-sync');
      if (lastSyncTime) {
        setOfflineData(prev => ({
          ...prev,
          lastSync: lastSyncTime
        }));
      }
    };

    loadOfflineData();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/portal';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minutes ago';
    if (diffInHours < 24) return '${diffInHours} hours ago';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Online Status Alert */}
        {isOnline && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Connection restored! You can now access all features.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Offline Card */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-fit">
              <WifiOff className="h-12 w-12 text-neutral-600 dark:text-neutral-400" />
            </div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription className="text-lg">
              No worries! You can still access your cached content and make changes that will sync when you're back online.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Connection Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} disabled={isOnline}>
                <RefreshCw className={cn("h-4 w-4 mr-2", retryCount > 0 && "animate-spin")} />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Last Sync Info */}
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last synced {formatTimeAgo(offlineData.lastSync)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cached Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Available Offline
              </CardTitle>
              <CardDescription>
                These pages are cached and ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {offlineData.cachedPages.map((page, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{page}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Pending Sync
              </CardTitle>
              <CardDescription>
                These changes will sync when online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Pending actions</span>
                  <span className="font-medium">{offlineData.pendingActions}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Profile update saved locally</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Support request queued</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What You Can Do Offline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What you can do offline</CardTitle>
            <CardDescription>
              These features work without an internet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {offlineData.availableFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => window.location.href = '/portal/account'}
          >
            <User className="h-6 w-6" />
            <span className="text-sm">Account</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => window.location.href = '/portal/orders'}
          >
            <Package className="h-6 w-6" />
            <span className="text-sm">Orders</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => window.location.href = '/portal/schedule'}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Schedule</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => window.location.href = '/portal/notifications'}
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">Updates</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Your portal works offline with cached data.</p>
          <p>All changes will automatically sync when your connection is restored.</p>
        </div>
      </div>
    </div>
  );
}