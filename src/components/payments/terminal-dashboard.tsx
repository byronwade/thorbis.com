'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  Terminal,
  Smartphone,
  Monitor
} from 'lucide-react';

import { createTerminalManager, initializeDefaultTerminals } from '@/lib/payment-processors/terminal-manager';

interface TerminalStatus {
  id: string;
  name: string;
  type: string;
  status: string;
  lastUsed?: Date;
  transactionCount: number;
  errorCount: number;
  reader?: any;
}

interface TerminalMetrics {
  totalTerminals: number;
  connectedTerminals: number;
  busyTerminals: number;
  errorTerminals: number;
  totalTransactions: number;
  totalErrors: number;
  averageResponseTime?: number;
}

interface RealtimeTransaction {
  id: string;
  terminalId: string;
  amount: number;
  status: 'processing' | 'completed' | 'failed';
  timestamp: Date;
}

export default function TerminalDashboard() {
  const [terminalManager, setTerminalManager] = useState<unknown>(null);
  const [terminals, setTerminals] = useState<TerminalStatus[]>([]);
  const [metrics, setMetrics] = useState<TerminalMetrics>({
    totalTerminals: 0,
    connectedTerminals: 0,
    busyTerminals: 0,
    errorTerminals: 0,
    totalTransactions: 0,
    totalErrors: 0
  });
  const [realtimeTransactions, setRealtimeTransactions] = useState<RealtimeTransaction[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize terminal manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        const manager = await initializeDefaultTerminals();
        setTerminalManager(manager);
        
        // Initial data load
        await refreshData(manager);
      } catch (error) {
        console.error('Failed to initialize terminal manager:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeManager();
  }, []);

  // Set up periodic updates
  useEffect(() => {
    if (!terminalManager) return;

    const interval = setInterval(() => {
      refreshData(terminalManager);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [terminalManager]);

  const refreshData = async (manager: unknown) => {
    try {
      const terminalStatuses = manager.getTerminalStatuses();
      const terminalMetrics = manager.getMetrics();
      
      setTerminals(terminalStatuses);
      setMetrics(terminalMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh terminal data:', error);
    }
  };

  const handleTerminalAction = async (terminalId: string, action: 'connect' | 'disconnect' | 'restart') => {
    if (!terminalManager) return;

    try {
      switch (action) {
        case 'connect':
          await terminalManager.connectTerminal(terminalId);
          break;
        case 'disconnect':
          await terminalManager.disconnectTerminal(terminalId);
          break;
        case 'restart':
          await terminalManager.disconnectTerminal(terminalId);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          await terminalManager.connectTerminal(terminalId);
          break;
      }
      
      // Refresh data after action
      await refreshData(terminalManager);
    } catch (error) {
      console.error(`Failed to ${action} terminal:', error);
    }
  };

  const simulateTransaction = async (terminalId: string) => {
    if (!terminalManager) return;

    const transaction: RealtimeTransaction = {
      id: 'txn_${Date.now()}',
      terminalId,
      amount: Math.floor(Math.random() * 20000) + 1000, // $10-$200
      status: 'processing',
      timestamp: new Date()
    };

    setRealtimeTransactions(prev => [transaction, ...prev.slice(0, 9)]);

    try {
      const result = await terminalManager.processPayment({
        amount: transaction.amount / 100,
        currency: 'USD',
        description: 'Test transaction',
        preferredTerminal: terminalId
      });

      // Update transaction status
      setRealtimeTransactions(prev => 
        prev.map(txn => 
          txn.id === transaction.id 
            ? { ...txn, status: result.success ? 'completed' : 'failed' }
            : txn
        )
      );

      // Refresh terminal data
      await refreshData(terminalManager);
    } catch (_error) {
      setRealtimeTransactions(prev => 
        prev.map(txn => 
          txn.id === transaction.id 
            ? { ...txn, status: 'failed' }
            : txn
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-neutral-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'busy': return 'secondary';
      case 'disconnected': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getTerminalIcon = (type: string) => {
    switch (type) {
      case 'stripe_terminal':
        return <CreditCard className="h-5 w-5" />;
      case 'square_terminal':
        return <Terminal className="h-5 w-5" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const calculateSuccessRate = (transactions: number, errors: number) => {
    if (transactions === 0) return 100;
    return Math.round(((transactions - errors) / transactions) * 100);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-white">Initializing terminal management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Terminal Dashboard</h1>
          <p className="text-neutral-400">Monitor and manage payment terminals</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => terminalManager && refreshData(terminalManager)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Terminals</p>
                <p className="text-2xl font-bold text-white">{metrics.totalTerminals}</p>
              </div>
              <Terminal className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Connected</p>
                <p className="text-2xl font-bold text-green-500">{metrics.connectedTerminals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Transactions</p>
                <p className="text-2xl font-bold text-white">{metrics.totalTransactions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {calculateSuccessRate(metrics.totalTransactions, metrics.totalErrors)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Status */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Terminal Status</CardTitle>
            <CardDescription>Connected payment terminals and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {terminals.length === 0 ? (
              <div className="text-center py-8">
                <Terminal className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-400">No terminals configured</p>
              </div>
            ) : (
              terminals.map(terminal => (
                <div key={terminal.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTerminalIcon(terminal.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{terminal.name}</p>
                        {getStatusIcon(terminal.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant={getStatusColor(terminal.status) as any}>
                          {terminal.status}
                        </Badge>
                        <span className="text-xs text-neutral-400">
                          {terminal.transactionCount} transactions
                        </span>
                        {terminal.errorCount > 0 && (
                          <span className="text-xs text-red-400">
                            {terminal.errorCount} errors
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {terminal.status === 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateTransaction(terminal.id)}
                      >
                        Test
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminalAction(
                        terminal.id, 
                        terminal.status === 'connected' ? 'disconnect' : 'connect'
                      )}
                    >
                      {terminal.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    
                    {terminal.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminalAction(terminal.id, 'restart')}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Real-time Transactions */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Live Transactions</CardTitle>
            <CardDescription>Recent payment activity across all terminals</CardDescription>
          </CardHeader>
          <CardContent>
            {realtimeTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-400">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {realtimeTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={'p-2 rounded-lg ${
                        transaction.status === 'completed' ? 'bg-green-900/20' :
                        transaction.status === 'processing' ? 'bg-blue-900/20' :
                        'bg-red-900/20'
                      }'}>
                        {transaction.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {transaction.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                        {transaction.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Terminal: {terminals.find(t => t.id === transaction.terminalId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'processing' ? 'secondary' :
                        'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                      <p className="text-xs text-neutral-400 mt-1">
                        {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">System Health</CardTitle>
          <CardDescription>Overall terminal network performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Terminal Connectivity</span>
                <span className="text-white">
                  {metrics.totalTerminals > 0 ? Math.round((metrics.connectedTerminals / metrics.totalTerminals) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={metrics.totalTerminals > 0 ? (metrics.connectedTerminals / metrics.totalTerminals) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Success Rate</span>
                <span className="text-white">
                  {calculateSuccessRate(metrics.totalTransactions, metrics.totalErrors)}%
                </span>
              </div>
              <Progress 
                value={calculateSuccessRate(metrics.totalTransactions, metrics.totalErrors)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Active Terminals</span>
                <span className="text-white">
                  {metrics.connectedTerminals + metrics.busyTerminals} / {metrics.totalTerminals}
                </span>
              </div>
              <Progress 
                value={metrics.totalTerminals > 0 ? ((metrics.connectedTerminals + metrics.busyTerminals) / metrics.totalTerminals) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>

          {metrics.errorTerminals > 0 && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-400 font-medium">System Alert</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                {metrics.errorTerminals} terminal{metrics.errorTerminals !== 1 ? 's' : '} in error state. 
                Check connections and restart if necessary.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}