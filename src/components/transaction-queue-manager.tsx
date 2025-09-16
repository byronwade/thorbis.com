'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Filter,
  Download,
  Upload,
  AlertCircle,
  Timer,
  Activity,
  Database,
  Zap
} from 'lucide-react';

import { useOfflineTransactionQueue } from '@/lib/offline-transaction-queue';

interface QueuedTransaction {
  id: string;
  type: 'payment' | 'refund' | 'void' | 'capture';
  data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    organizationId: string;
    customerId?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  estimatedSyncTime?: Date;
  lastError?: string;
  dependsOn?: string[];
  tags?: string[];
}

interface QueueMetrics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  successRate: number;
  lastSyncTime?: Date;
}

export default function TransactionQueueManager() {
  const [transactions, setTransactions] = useState<QueuedTransaction[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    averageProcessingTime: 0,
    successRate: 0
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [autoSync, setAutoSync] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const queue = useOfflineTransactionQueue();

  // Load data and set up event listeners
  useEffect(() => {
    loadData();
    setupEventListeners();

    // Update every 5 seconds
    const interval = setInterval(loadData, 5000);

    return () => {
      clearInterval(interval);
      queue.off('sync_completed', handleSyncCompleted);
      queue.off('sync_failed', handleSyncFailed);
      queue.off('transaction_completed', loadData);
      queue.off('transaction_failed', loadData);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setupEventListeners = () => {
    queue.on('sync_completed', handleSyncCompleted);
    queue.on('sync_failed', handleSyncFailed);
    queue.on('transaction_completed', loadData);
    queue.on('transaction_failed', loadData);
    queue.on('network_online', () => {
      setIsOnline(true);
      if (autoSync) {
        handleManualSync();
      }
    });
    queue.on('network_offline', () => setIsOnline(false));
  };

  const loadData = () => {
    const filterConfig = filter === 'all' ? undefined : { status: filter as any };
    const allTransactions = queue.getTransactions(filterConfig);
    const queueMetrics = queue.getMetrics();
    
    setTransactions(allTransactions);
    setMetrics(queueMetrics);
    setLastUpdate(new Date());
  };

  const handleSyncCompleted = (result: unknown) => {
    setIsProcessing(false);
    loadData();
  };

  const handleSyncFailed = (error: unknown) => {
    setIsProcessing(false);
    console.error('Sync failed:', error);
  };

  const handleManualSync = async () => {
    if (!isOnline || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await queue.processQueue();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const handleRemoveTransaction = async (id: string) => {
    await queue.removeTransaction(id);
    loadData();
  };

  const handleCleanupOld = async () => {
    const removed = await queue.cleanupOldTransactions(7);
    console.log('Cleaned up ${removed} old transactions');
    loadData();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency`,
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago';
    if (minutes > 0) return '${minutes}m ago';
    return 'Just now';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'retry': return 'text-yellow-500';
      default: return 'text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'retry':
        return <Timer className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-neutral-500';
      default: return 'bg-neutral-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Queue Manager</h1>
          <p className="text-neutral-400">Monitor and manage offline transaction processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total</p>
                <p className="text-2xl font-bold text-white">{metrics.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{metrics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Processing</p>
                <p className="text-2xl font-bold text-blue-500">{metrics.processing}</p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Completed</p>
                <p className="text-2xl font-bold text-green-500">{metrics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">{Math.round(metrics.successRate * 100)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Queue Controls</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSync(!autoSync)}
              >
                {autoSync ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Auto Sync: {autoSync ? 'On' : 'Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={!isOnline || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupOld}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Queue Progress</span>
                <span className="text-white">
                  {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Failed Items</span>
                <span className="text-white">{metrics.failed}</span>
              </div>
              <Progress 
                value={metrics.total > 0 ? (metrics.failed / metrics.total) * 100 : 0}
                className="h-2 bg-red-900"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Avg Processing</span>
                <span className="text-white">
                  {Math.round(metrics.averageProcessingTime / 1000)}s
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                Last sync: {metrics.lastSyncTime ? formatTimeAgo(metrics.lastSyncTime) : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Transaction Queue</CardTitle>
              <CardDescription>Queued transactions awaiting sync</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-neutral-800 border border-neutral-700 text-white rounded px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400">
                {filter === 'all' ? 'No transactions in queue` : `No ${filter} transactions'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <div className={'w-2 h-2 rounded-full ${getPriorityColor(transaction.priority)}'} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {formatCurrency(transaction.data.amount, transaction.data.currency)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.data.paymentMethod}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                        <span>ID: {transaction.id.slice(-8)}</span>
                        <span>{formatTimeAgo(transaction.timestamp)}</span>
                        {transaction.retryCount > 0 && (
                          <span>Retries: {transaction.retryCount}/{transaction.maxRetries}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={
                      transaction.status === 'completed' ? 'default' :
                      transaction.status === 'failed' ? 'destructive' :
                      transaction.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {transaction.status}
                    </Badge>
                    
                    {transaction.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTransaction(transaction.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      {(!isOnline || metrics.failed > 0) && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isOnline && (
              <div className="flex items-center gap-2 text-yellow-400">
                <WifiOff className="h-4 w-4" />
                <span>Offline mode: Transactions will be queued until connection is restored</span>
              </div>
            )}
            
            {metrics.failed > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{metrics.failed} transaction{metrics.failed !== 1 ? 's' : '} failed and require attention</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Queue synchronization in progress...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}