'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Smartphone, 
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Settings,
  RefreshCw,
  Printer,
  Receipt,
  NfcIcon,
  Clock,
  DollarSign
} from 'lucide-react';

import { createStripeTerminalProcessor } from '@/lib/payment-processors/stripe-terminal';
import { useOfflinePayments } from '@/hooks/use-offline';

interface TerminalReader {
  id: string;
  deviceType: string;
  ipAddress: string;
  label: string;
  location: string;
  serialNumber: string;
  status: 'online' | 'offline';
  batteryLevel?: number;
  lastSeen?: Date;
}

interface PaymentProgress {
  stage: 'idle' | 'connecting' | 'waiting_for_card' | 'processing' | 'success' | 'error';
  message: string;
  progress: number;
}

interface TransactionHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  timestamp: Date;
  last4?: string;
  brand?: string;
}

export default function StripeTerminalInterface() {
  const [terminalProcessor, setTerminalProcessor] = useState<unknown>(null);
  const [availableReaders, setAvailableReaders] = useState<TerminalReader[]>([]);
  const [connectedReader, setConnectedReader] = useState<TerminalReader | null>(null);
  const [paymentProgress, setPaymentProgress] = useState<PaymentProgress>({
    stage: 'idle',
    message: 'Ready to accept payments',
    progress: 0
  });

  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState(');
  const [customerId, setCustomerId] = useState(');
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<unknown>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [receiptData, setReceiptData] = useState<string | null>(null);

  const { isOnline } = useOfflinePayments();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Stripe Terminal processor
  useEffect(() => {
    const processor = createStripeTerminalProcessor({
      testMode: true,
      deviceType: 'simulated_wisepos_e',
      locationId: 'tml_test_location'
    });

    // Set up event callbacks
    processor.onCardDetected = (method: string) => {
      setPaymentProgress({
        stage: 'processing',
        message: 'Card detected: ${method}',
        progress: 50
      });
    };

    processor.onProcessingPayment = () => {
      setPaymentProgress({
        stage: 'processing',
        message: 'Processing payment...',
        progress: 75
      });
    };

    processor.onPaymentSuccess = (paymentIntent: unknown) => {
      setPaymentProgress({
        stage: 'success',
        message: 'Payment successful!',
        progress: 100
      });
      
      handlePaymentSuccess(paymentIntent);
    };

    processor.onPaymentCanceled = () => {
      setPaymentProgress({
        stage: 'idle',
        message: 'Payment canceled',
        progress: 0
      });
    };

    setTerminalProcessor(processor);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      processor.destroy();
    };
  }, []);

  // Auto-discover readers on mount
  useEffect(() => {
    if (terminalProcessor) {
      discoverReaders();
    }
  }, [terminalProcessor]);

  // Start periodic reader status updates
  useEffect(() => {
    if (connectedReader) {
      intervalRef.current = setInterval(() => {
        updateReaderStatus();
      }, 30000); // Update every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [connectedReader]);

  const discoverReaders = async () => {
    if (!terminalProcessor) return;

    setIsDiscovering(true);
    try {
      const readers = await terminalProcessor.discoverReaders();
      setAvailableReaders(readers);
    } catch (error) {
      console.error('Failed to discover readers:', error);
      setPaymentProgress({
        stage: 'error',
        message: 'Failed to discover terminal readers',
        progress: 0
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const connectToReader = async (readerId: string) => {
    if (!terminalProcessor) return;

    setIsConnecting(true);
    try {
      const reader = await terminalProcessor.connectReader(readerId);
      setConnectedReader(reader);
      setPaymentProgress({
        stage: 'idle',
        message: 'Connected to ${reader.label}',
        progress: 0
      });
    } catch (error) {
      console.error('Failed to connect to reader:', error);
      setPaymentProgress({
        stage: 'error',
        message: 'Failed to connect to terminal',
        progress: 0
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectReader = async () => {
    if (!terminalProcessor) return;

    try {
      await terminalProcessor.disconnectReader();
      setConnectedReader(null);
      setPaymentProgress({
        stage: 'idle',
        message: 'Terminal disconnected',
        progress: 0
      });
    } catch (error) {
      console.error('Failed to disconnect reader:', error);
    }
  };

  const processPayment = async () => {
    if (!terminalProcessor || !connectedReader || amount <= 0) return;

    try {
      setPaymentProgress({
        stage: 'connecting',
        message: 'Creating payment intent...',
        progress: 25
      });

      const paymentIntent = await terminalProcessor.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        paymentMethodTypes: ['card_present'],
        captureMethod: 'automatic',
        metadata: {
          description,
          customerId: customerId || undefined,
          terminalId: connectedReader.id
        }
      });

      setCurrentPayment(paymentIntent);

      setPaymentProgress({
        stage: 'waiting_for_card',
        message: 'Please insert, swipe, or tap your card',
        progress: 25
      });

      await terminalProcessor.collectPayment(paymentIntent.id);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentProgress({
        stage: 'error',
        message: 'Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}',
        progress: 0
      });
      setCurrentPayment(null);
    }
  };

  const cancelPayment = async () => {
    if (!terminalProcessor) return;

    try {
      await terminalProcessor.cancelPayment();
      setCurrentPayment(null);
      setPaymentProgress({
        stage: 'idle',
        message: 'Payment canceled',
        progress: 0
      });
    } catch (error) {
      console.error('Failed to cancel payment:', error);
    }
  };

  const handlePaymentSuccess = (paymentIntent: unknown) => {
    const transaction: TransactionHistory = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      method: 'card_present',
      timestamp: new Date(),
      last4: paymentIntent.charges?.data[0]?.paymentMethod?.cardPresent?.last4,
      brand: paymentIntent.charges?.data[0]?.paymentMethod?.cardPresent?.brand
    };

    setTransactionHistory(prev => [transaction, ...prev.slice(0, 9)]); // Keep last 10 transactions

    // Generate receipt
    try {
      const receipt = terminalProcessor.generateReceipt(paymentIntent);
      setReceiptData(receipt);
    } catch (error) {
      console.warn('Failed to generate receipt:', error);
    }

    // Reset form
    setAmount(0);
    setDescription(');
    setCustomerId(');
    setCurrentPayment(null);

    // Reset to idle after 3 seconds
    setTimeout(() => {
      setPaymentProgress({
        stage: 'idle',
        message: 'Ready to accept payments',
        progress: 0
      });
    }, 3000);
  };

  const updateReaderStatus = async () => {
    // In a real implementation, this would ping the reader for status
    if (connectedReader) {
      setConnectedReader(prev => prev ? {
        ...prev,
        lastSeen: new Date(),
        batteryLevel: Math.max(20, Math.min(100, (prev.batteryLevel || 85) + (Math.random() - 0.5) * 10))
      } : null);
    }
  };

  const printReceipt = () => {
    if (receiptData) {
      // In a real implementation, this would send to a thermal printer
      const printWindow = window.open(', '_blank');
      if (printWindow) {
        printWindow.document.write('
          <html>
            <head><title>Receipt</title></head>
            <body style="font-family: monospace; white-space: pre-line; font-size: 12px;">
              ${receiptData}
            </body>
          </html>
        ');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      default: return 'text-neutral-400';
    }
  };

  const getProgressColor = () => {
    switch (paymentProgress.stage) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-neutral-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stripe Terminal</h1>
          <p className="text-neutral-400">In-person payment processing</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          {connectedReader && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {connectedReader.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Terminal Management */}
        <div className="space-y-6">
          {/* Reader Discovery */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Terminal Readers</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discoverReaders}
                  disabled={isDiscovering}
                >
                  {isDiscovering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>Discovered payment terminals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableReaders.length === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">No terminals found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={discoverReaders}
                    className="mt-2"
                  >
                    Discover Readers
                  </Button>
                </div>
              ) : (
                availableReaders.map(reader => (
                  <div
                    key={reader.id}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-white">{reader.label}</p>
                        <p className="text-xs text-neutral-400">
                          {reader.deviceType} • {reader.ipAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={reader.status === 'online' ? 'default' : 'secondary'}>
                        {reader.status}
                      </Badge>
                      {connectedReader?.id === reader.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={disconnectReader}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => connectToReader(reader.id)}
                          disabled={isConnecting || reader.status === 'offline'}
                        >
                          {isConnecting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Connected Reader Status */}
          {connectedReader && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Reader Status</CardTitle>
                <CardDescription>Connected terminal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-400">Device:</span>
                    <span className="text-white ml-2">{connectedReader.deviceType}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Status:</span>
                    <span className={'ml-2 ${getStatusColor(connectedReader.status)}'}>
                      {connectedReader.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Serial:</span>
                    <span className="text-white ml-2 font-mono">{connectedReader.serialNumber}</span>
                  </div>
                  {connectedReader.batteryLevel && (
                    <div>
                      <span className="text-neutral-400">Battery:</span>
                      <span className="text-white ml-2">{Math.round(connectedReader.batteryLevel)}%</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-neutral-400">Location:</span>
                    <span className="text-white ml-2">{connectedReader.location}</span>
                  </div>
                  {connectedReader.lastSeen && (
                    <div className="col-span-2">
                      <span className="text-neutral-400">Last seen:</span>
                      <span className="text-white ml-2">
                        {connectedReader.lastSeen.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center Column - Payment Processing */}
        <div className="space-y-6">
          {/* Payment Form */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Process Payment</CardTitle>
              <CardDescription>Create a new payment intent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-white">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount || '`}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-white">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Input
                  id="description"
                  placeholder="Payment description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="customer" className="text-white">Customer ID (Optional)</Label>
                <Input
                  id="customer"
                  placeholder="Customer identifier"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {/* Payment Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Status</span>
                  <span className="text-sm text-white">{paymentProgress.message}</span>
                </div>
                <Progress 
                  value={paymentProgress.progress} 
                  className={'h-2 ${getProgressColor()}'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {paymentProgress.stage === 'idle' ? (
                  <Button
                    onClick={processPayment}
                    disabled={!connectedReader || amount <= 0}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Charge {formatCurrency(Math.round(amount * 100), currency)}
                  </Button>
                ) : paymentProgress.stage === 'waiting_for_card' || paymentProgress.stage === 'processing' ? (
                  <Button
                    onClick={cancelPayment}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel Payment
                  </Button>
                ) : paymentProgress.stage === 'success' ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => setPaymentProgress({
                        stage: 'idle',
                        message: 'Ready to accept payments',
                        progress: 0
                      })}
                      className="flex-1"
                    >
                      New Payment
                    </Button>
                    {receiptData && (
                      <Button
                        onClick={printReceipt}
                        variant="outline"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => setPaymentProgress({
                      stage: 'idle',
                      message: 'Ready to accept payments',
                      progress: 0
                    })}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Payment Intent */}
          {currentPayment && (
            <Card className="bg-blue-900/20 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Active Payment Intent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment ID:</span>
                  <span className="text-white font-mono">{currentPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount:</span>
                  <span className="text-white">{formatCurrency(currentPayment.amount, currentPayment.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="text-blue-400">{currentPayment.status}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Transaction History & Receipt */}
        <div className="space-y-6">
          {/* Recent Transactions */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription>Last 10 processed payments</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionHistory.length === 0 ? (
                <div className="text-center py-6">
                  <Receipt className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-900/20 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {transaction.brand?.toUpperCase()} •••• {transaction.last4}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
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

          {/* Receipt Preview */}
          {receiptData && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Receipt</CardTitle>
                  <Button variant="outline" size="sm" onClick={printReceipt}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg">
                  <pre className="text-black text-xs font-mono whitespace-pre-line">
                    {receiptData}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}