'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { 
  type DashboardKPIs, 
  type ChartDatasets, 
  type UserInfo, 
  type SystemStatus,
  type DashboardMetricsResponse 
} from '@/types/charts'

interface UseChartDataOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  fallbackData?: Partial<DashboardMetricsResponse>;
}

interface UseChartDataReturn {
  kpis: DashboardKPIs | null;
  charts: ChartDatasets | null;
  user: UserInfo | null;
  systemStatus: SystemStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isValidating: boolean;
}

// Fetcher function for SWR - doesn't require authentication for dashboard metrics
const fetcher = async (url: string): Promise<DashboardMetricsResponse> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('HTTP error! status: ${response.status}');
  }

  return response.json();
};

// User info fetcher
const userFetcher = async (url: string): Promise<UserInfo> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('thorbis_auth_token') : null;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': token ? 'Bearer ${token}' : ',
      'Content-Type': 'application/json`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// System status fetcher
const systemStatusFetcher = async (url: string): Promise<SystemStatus> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Custom hook for fetching and managing dashboard chart data with SWR caching
 * 
 * Provides real-time dashboard metrics including KPIs, chart datasets, user info,
 * and system status with automatic refresh and background revalidation capabilities.
 * 
 * @param options - Configuration options for data fetching behavior
 * @param options.refreshInterval - Auto-refresh interval in milliseconds (default: 30000)
 * @param options.revalidateOnFocus - Revalidate when window regains focus (default: true)
 * @param options.revalidateOnReconnect - Revalidate when network reconnects (default: true)
 * @param options.fallbackData - Initial data to show while loading
 * 
 * @returns Object containing dashboard data and state management functions
 * @returns returns.kpis - Key performance indicators (revenue, orders, etc.)
 * @returns returns.charts - Chart datasets for visualization components
 * @returns returns.user - Current user information and permissions
 * @returns returns.systemStatus - Real-time system health and performance metrics
 * @returns returns.loading - Loading state indicator
 * @returns returns.error - Error message if data fetching fails
 * @returns returns.refresh - Manual refresh function
 * @returns returns.isValidating - Background revalidation state
 * 
 * @example
 * ```typescript
 * const { kpis, charts, loading, error, refresh } = useChartData({
 *   refreshInterval: 60000, // Refresh every minute
 *   revalidateOnFocus: true
 * });
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refresh} />;
 * 
 * return <Dashboard kpis={kpis} charts={charts} />;
 * '''
 */
export function useChartData(options: UseChartDataOptions = {}): UseChartDataReturn {
  const {
    refreshInterval = 30000, // 30 seconds
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    fallbackData
  } = options;

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Fetch dashboard metrics
  const {
    data: metricsData,
    error: metricsError,
    mutate: refreshMetrics,
    isValidating: metricsValidating
  } = useSWR<DashboardMetricsResponse>(
    '/api/dashboards/hs/metrics',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      fallbackData,
      onError: (error) => {
        console.error('Dashboard metrics fetch error:', error);
      }
    }
  );

  // Fetch user info - optional, gracefully handle auth failures
  const {
    data: userData,
    error: userError,
    mutate: refreshUser,
    isValidating: userValidating
  } = useSWR<UserInfo>(
    '/api/v1/auth/user',
    userFetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false, // Don't retry on auth failures
      onError: (error) => {
        // Silently handle auth errors - dashboard works without user data
        console.debug('User authentication not available:', error.message);
      }
    }
  );

  // System status with manual updates
  const updateSystemStatus = useCallback(async () => {
    try {
      // Check online status
      const isOnline = navigator.onLine;
      
      // Check hardware status
      let hardwareStatus = { printer: false, scanner: false };
      try {
        const hardwareResponse = await fetch('/api/v1/hardware/status');
        if (hardwareResponse.ok) {
          const hardware = await hardwareResponse.json();
          hardwareStatus = {
            printer: hardware.printer?.connected || false,
            scanner: hardware.scanner?.connected || false
          };
        }
      } catch (error) {
        console.warn('Hardware status check failed:', error);
      }

      // Update system status
      const newStatus: SystemStatus = {
        isOnline,
        hardwareConnected: hardwareStatus,
        aiSafetyStatus: 'safe', // This would come from actual AI monitoring
        usageLimits: {
          apiCalls: { current: 245, limit: 1000 },
          workOrders: { current: 45, limit: 100 },
          storage: { current: 2.1, limit: 10 }
        },
        lastSync: new Date().toISOString()
      };

      setSystemStatus(newStatus);
    } catch (error) {
      console.error('System status update error:', error);
    }
  }, []);

  // Initialize and update system status
  useEffect(() => {
    updateSystemStatus();
    
    const interval = setInterval(updateSystemStatus, 60000); // Update every minute
    
    // Listen for online/offline events
    const handleOnline = () => updateSystemStatus();
    const handleOffline = () => updateSystemStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSystemStatus]);

  // Refresh all data
  const refresh = useCallback(() => {
    refreshMetrics();
    refreshUser();
    updateSystemStatus();
  }, [refreshMetrics, refreshUser, updateSystemStatus]);

  // Determine loading state
  const loading = !metricsData && !metricsError && metricsValidating;

  // Aggregate errors
  const error = metricsError?.message || userError?.message || null;

  // Determine if any request is validating
  const isValidating = metricsValidating || userValidating;

  return {
    kpis: metricsData?.data?.kpis || null,
    charts: metricsData?.data?.charts || null,
    user: userData || null,
    systemStatus,
    loading,
    error,
    refresh,
    isValidating
  };
}