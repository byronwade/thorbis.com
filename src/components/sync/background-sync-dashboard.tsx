'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  BarChart3,
  Database,
  Users,
  ShoppingCart,
  CreditCard,
  Package,
  Calendar,
  FileText,
  TrendingUp,
  Loader2,
  RefreshCw,
  Pause,
  Play,
  Settings,
  Signal,
  Zap,
  Timer,
  Target,
  AlertCircle,
  Network,
  Gauge
} from 'lucide-react';

import { useBackgroundSync } from '@/lib/background-sync-manager';
import type { SyncStats } from '@/lib/background-sync-manager';

interface SyncDashboardState {
  statistics: SyncStats;
  loading: boolean;
  error: string | null;
  isPaused: boolean;
  realTimeUpdates: boolean;
}

export default function BackgroundSyncDashboard() {
  const [state, setState] = useState<SyncDashboardState>({
    statistics: {
      totalOperations: 0,
      completedOperations: 0,
      failedOperations: 0,
      pendingOperations: 0,
      averageLatency: 0,
      successRate: 0,
      byType: Record<string, unknown>,
      networkStatus: {
        isOnline: navigator.onLine,
        connectionQuality: 'good'
      }
    },
    loading: false,
    error: null,
    isPaused: false,
    realTimeUpdates: true
  });

  const syncManager = useBackgroundSync();

  // Load statistics
  const loadStatistics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const statistics = await syncManager.getStatistics();
      setState(prev => ({ ...prev, statistics, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load statistics',
        loading: false
      }));
    }
  }, [syncManager]);

  // Set up event listeners and real-time updates
  useEffect(() => {
    loadStatistics();

    // Set up event listeners for real-time updates
    const handleOperationCompleted = () => {
      if (state.realTimeUpdates) {
        loadStatistics();
      }
    };

    const handleOperationFailed = () => {
      if (state.realTimeUpdates) {
        loadStatistics();
      }
    };

    const handleBatchCompleted = () => {
      if (state.realTimeUpdates) {
        loadStatistics();
      }
    };

    const handleNetworkStatusChange = () => {
      loadStatistics();
    };

    syncManager.on('operation_completed', handleOperationCompleted);
    syncManager.on('operation_failed', handleOperationFailed);
    syncManager.on('batch_completed', handleBatchCompleted);
    syncManager.on('network_online', handleNetworkStatusChange);
    syncManager.on('network_offline', handleNetworkStatusChange);
    syncManager.on('connection_quality_updated', handleNetworkStatusChange);

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (state.realTimeUpdates && !state.isPaused) {
        loadStatistics();
      }
    }, 5000);

    return () => {
      syncManager.off('operation_completed', handleOperationCompleted);
      syncManager.off('operation_failed', handleOperationFailed);
      syncManager.off('batch_completed', handleBatchCompleted);
      syncManager.off('network_online', handleNetworkStatusChange);
      syncManager.off('network_offline', handleNetworkStatusChange);
      syncManager.off('connection_quality_updated', handleNetworkStatusChange);
      clearInterval(refreshInterval);
    };
  }, [loadStatistics, state.realTimeUpdates, state.isPaused, syncManager]);

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s';
  };

  const formatSuccessRate = (rate: number) => {
    return '${rate.toFixed(1)}%';
  };

  const getNetworkStatusIcon = () => {
    if (!state.statistics.networkStatus.isOnline) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }

    switch (state.statistics.networkStatus.connectionQuality) {
      case 'excellent':
        return <Signal className="h-5 w-5 text-green-500" />;
      case 'good':
        return <Wifi className="h-5 w-5 text-blue-500" />;
      case 'poor':
        return <Wifi className="h-5 w-5 text-yellow-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  const getNetworkStatusText = () => {
    if (!state.statistics.networkStatus.isOnline) {
      return 'Offline`;
    }

    const quality = state.statistics.networkStatus.connectionQuality;
    const bandwidth = state.statistics.networkStatus.bandwidth;
    
    return '${quality.charAt(0).toUpperCase() + quality.slice(1)}${bandwidth ? ' (${bandwidth} Mbps)' : '}';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return CreditCard;
      case 'inventory': return Package;
      case 'customer': return Users;
      case 'work_order': return ShoppingCart;
      case 'appointment': return Calendar;
      case 'document': return FileText;
      case 'analytics': return BarChart3;
      default: return Database;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'text-green-500';
      case 'inventory': return 'text-blue-500';
      case 'customer': return 'text-purple-500';
      case 'work_order': return 'text-orange-500';
      case 'appointment': return 'text-cyan-500';
      case 'document': return 'text-pink-500';
      case 'analytics': return 'text-yellow-500';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Background Sync Dashboard</h1>
          <p className="text-neutral-400">Monitor and manage all business operation synchronization</p>
        </div>
        <div className="flex items-center gap-2">
          {getNetworkStatusIcon()}
          <span className="text-sm text-neutral-400">{getNetworkStatusText()}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStatistics}
            disabled={state.loading}
          >
            {state.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
          >
            {state.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {state.isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Operations</p>
                <p className="text-2xl font-bold text-white">{state.statistics.totalOperations}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatSuccessRate(state.statistics.successRate)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Avg Latency</p>
                <p className="text-2xl font-bold text-white">
                  {formatLatency(state.statistics.averageLatency)}
                </p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{state.statistics.pendingOperations}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Operation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-neutral-400">Completed</span>
              </div>
              <span className="text-white font-medium">{state.statistics.completedOperations}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-neutral-400">Failed</span>
              </div>
              <span className="text-white font-medium">{state.statistics.failedOperations}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-neutral-400">Pending</span>
              </div>
              <span className="text-white font-medium">{state.statistics.pendingOperations}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Progress</span>
                <span>
                  {state.statistics.totalOperations > 0 
                    ? '${Math.round((state.statistics.completedOperations / state.statistics.totalOperations) * 100)}%'
                    : '0%'
                  }
                </span>
              </div>
              <Progress 
                value={state.statistics.totalOperations > 0 
                  ? (state.statistics.completedOperations / state.statistics.totalOperations) * 100
                  : 0
                } 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Network Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {getNetworkStatusIcon()}
              <div>
                <p className="text-white font-medium">{getNetworkStatusText()}</p>
                <p className="text-xs text-neutral-400">
                  {state.statistics.networkStatus.isOnline ? 'Connected' : 'Offline Mode'}
                </p>
              </div>
            </div>

            {state.statistics.networkStatus.bandwidth && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Bandwidth</span>
                  <span>{state.statistics.networkStatus.bandwidth} Mbps</span>
                </div>
                <Progress 
                  value={Math.min((state.statistics.networkStatus.bandwidth / 50) * 100, 100)}
                  className="h-2"
                />
              </div>
            )}

            {state.statistics.networkStatus.lastOnline && (
              <div className="text-xs text-neutral-400">
                Last online: {state.statistics.networkStatus.lastOnline.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">
                  {formatLatency(state.statistics.averageLatency)}
                </p>
                <p className="text-xs text-neutral-400">Average Response Time</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-white font-medium">
                  {formatSuccessRate(state.statistics.successRate)}
                </p>
                <p className="text-xs text-neutral-400">Success Rate</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-white font-medium">
                  {state.statistics.totalOperations}
                </p>
                <p className="text-xs text-neutral-400">Total Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations by Type */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Operations by Type</CardTitle>
          <CardDescription>Breakdown of sync operations across business areas</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(state.statistics.byType).length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400">No sync operations recorded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(state.statistics.byType).map(([type, stats]) => {
                const Icon = getTypeIcon(type);
                const colorClass = getTypeColor(type);
                const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                
                return (
                  <div
                    key={type}
                    className="p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={'h-5 w-5 ${colorClass}'} />
                      <span className="text-white font-medium capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total</span>
                        <span className="text-white">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Completed</span>
                        <span className="text-green-400">{stats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Failed</span>
                        <span className="text-red-400">{stats.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Avg Time</span>
                        <span className="text-white">{formatLatency(stats.averageTime)}</span>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                          <span>Success Rate</span>
                          <span>{formatSuccessRate(successRate)}</span>
                        </div>
                        <Progress value={successRate} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}