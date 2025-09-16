'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineManager, SyncStatus, OfflinePayment, OfflineData } from '@/lib/offline-utils';

// Hook for managing offline status and sync
export function useOffline() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
    syncing: false
  });

  useEffect(() => {
    const unsubscribe = offlineManager.onSyncStatusChange(setSyncStatus);
    setSyncStatus(offlineManager.getSyncStatus());

    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    if (syncStatus.isOnline) {
      await offlineManager.triggerSync();
    }
  }, [syncStatus.isOnline]);

  const clearOfflineData = useCallback(async () => {
    await offlineManager.clearOfflineData();
  }, []);

  return {
    isOnline: syncStatus.isOnline,
    pendingSync: syncStatus.pendingSync,
    lastSync: syncStatus.lastSync,
    syncing: syncStatus.syncing,
    triggerSync,
    clearOfflineData,
    hasPendingSync: offlineManager.hasPendingSync()
  };
}

// Hook for offline payment processing
export function useOfflinePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (payment: OfflinePayment) => {
    setLoading(true);
    setError(null);

    try {
      const result = await offlineManager.processPayment(payment);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOfflinePayments = useCallback(async () => {
    try {
      return await offlineManager.getOfflinePayments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get offline payments';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    processPayment,
    getOfflinePayments,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook for offline data management
export function useOfflineData<T extends OfflineData>(storeName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeData = useCallback(async (data: T): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await offlineManager.storeOfflineData(storeName, data);
      return result as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  const getData = useCallback(async (filters: Record<string, unknown> = {}): Promise<T[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await offlineManager.getOfflineData(storeName, filters);
      return result as T[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  const getUnsyncedData = useCallback(async (): Promise<T[]> => {
    return getData({ synced: false });
  }, [getData]);

  return {
    storeData,
    getData,
    getUnsyncedData,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook for customer management
export function useOfflineCustomers() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('customers');

  const createCustomer = useCallback(async (customer: unknown) => {
    return storeData(customer);
  }, [storeData]);

  const getCustomers = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedCustomers = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    createCustomer,
    getCustomers,
    getUnsyncedCustomers,
    loading,
    error,
    clearError
  };
}

// Hook for inventory management
export function useOfflineInventory() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('inventory');

  const updateInventory = useCallback(async (item: unknown) => {
    return storeData(item);
  }, [storeData]);

  const getInventory = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedInventory = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    updateInventory,
    getInventory,
    getUnsyncedInventory,
    loading,
    error,
    clearError
  };
}

// Hook for work order management
export function useOfflineWorkOrders() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('work-orders');

  const createWorkOrder = useCallback(async (workOrder: unknown) => {
    return storeData(workOrder);
  }, [storeData]);

  const getWorkOrders = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedWorkOrders = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    createWorkOrder,
    getWorkOrders,
    getUnsyncedWorkOrders,
    loading,
    error,
    clearError
  };
}

// Hook for document management
export function useOfflineDocuments() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('documents');

  const storeDocument = useCallback(async (document: unknown) => {
    return storeData(document);
  }, [storeData]);

  const getDocuments = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedDocuments = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    storeDocument,
    getDocuments,
    getUnsyncedDocuments,
    loading,
    error,
    clearError
  };
}

// Hook for analytics tracking
export function useOfflineAnalytics() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('analytics');

  const trackEvent = useCallback(async (event: unknown) => {
    return storeData({
      ...event,
      timestamp: Date.now(),
      sessionId: generateSessionId()
    });
  }, [storeData]);

  const getAnalytics = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedAnalytics = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    trackEvent,
    getAnalytics,
    getUnsyncedAnalytics,
    loading,
    error,
    clearError
  };
}

// Hook for photo management
export function useOfflinePhotos() {
  const { storeData, getData, getUnsyncedData, loading, error, clearError } = useOfflineData('photos');

  const storePhoto = useCallback(async (photo: unknown) => {
    // Compress image if needed
    const compressedPhoto = await compressImage(photo);
    return storeData(compressedPhoto);
  }, [storeData]);

  const getPhotos = useCallback(async (filters?: Record<string, unknown>) => {
    return getData(filters);
  }, [getData]);

  const getUnsyncedPhotos = useCallback(async () => {
    return getUnsyncedData();
  }, [getUnsyncedData]);

  return {
    storePhoto,
    getPhotos,
    getUnsyncedPhotos,
    loading,
    error,
    clearError
  };
}

// Utility functions
function generateSessionId(): string {
  return '${Date.now()}-${Math.random().toString(36).substr(2, 9)}';
}

async function compressImage(photo: unknown): Promise<unknown> {
  // Simple image compression logic
  if (photo.data && photo.data.length > 1024 * 1024) { // > 1MB
    // In a real implementation, you would use a library like browser-image-compression
    return {
      ...photo,
      compressed: true,
      originalSize: photo.data.length
    };
  }
  return photo;
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: ['slow-2g', '2g'].includes(connectionType)
  };
}