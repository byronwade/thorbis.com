'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Banknote,
  Bitcoin,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  WifiOff,
  Zap,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  QrCode,
  Camera,
  Apple
} from 'lucide-react';

import { useOfflinePayments } from '@/hooks/use-offline';
import { createStripeTerminalProcessor } from '@/lib/payment-processors/stripe-terminal';
import { createMobileWalletProcessor } from '@/lib/payment-processors/mobile-wallets';
import { createACHProcessor } from '@/lib/payment-processors/ach-processor';
import { createCryptoProcessor } from '@/lib/payment-processors/crypto-processor';
import OfflinePaymentProcessor from './offline-payment-processor';
import MobileCheckCapture from './mobile-check-capture';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'mobile_wallet' | 'bank_transfer' | 'crypto' | 'cash' | 'check';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  processingTime: string;
  limits: {
    min: number;
    max: number;
  };
  supported: boolean;
  testMode?: boolean;
}

interface UnifiedPaymentRequest {
  amount: number;
  currency: string;
  customerId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses';
}

interface PaymentState {
  method: string | null;
  amount: number;
  processing: boolean;
  result: any | null;
  error: string | null;
  stage: 'select' | 'input' | 'processing' | 'complete';
}

export default function UnifiedPaymentGateway() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    method: null,
    amount: 0,
    processing: false,
    result: null,
    error: null,
    stage: 'select'
  });

  const [selectedIndustry, setSelectedIndustry] = useState<'hs' | 'rest' | 'auto' | 'ret' | 'courses'>('hs');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [processors, setProcessors] = useState<{
    stripe?: any;
    mobile?: any;
    ach?: any;
    crypto?: any;
  }>({});

  const { processPayment, isOnline } = useOfflinePayments();

  // Initialize payment processors
  useEffect(() => {
    const initializeProcessors = async () => {
      try {
        const stripeProcessor = createStripeTerminalProcessor({
          testMode: true,
          deviceType: 'simulated_wisepos_e'
        });

        const mobileProcessor = createMobileWalletProcessor({
          applePay: {
            merchantId: 'merchant.com.thorbis.app',
            countryCode: 'US',
            currencyCode: 'USD'
          },
          googlePay: {
            environment: 'TEST',
            merchantId: 'test_merchant_id'
          }
        });

        const achProcessor = createACHProcessor({
          testMode: true,
          originatorName: 'THORBIS BUSINESS OS'
        });

        const cryptoProcessor = createCryptoProcessor({
          supportedCurrencies: ['BTC', 'ETH', 'USDC', 'LTC'],
          testMode: true
        });

        setProcessors({
          stripe: stripeProcessor,
          mobile: mobileProcessor,
          ach: achProcessor,
          crypto: cryptoProcessor
        });
      } catch (error) {
        console.error('Failed to initialize payment processors:', error);
      }
    };

    initializeProcessors();
  }, []);

  // Load payment methods based on industry
  useEffect(() => {
    loadPaymentMethods(selectedIndustry);
  }, [selectedIndustry, processors]);

  const loadPaymentMethods = (industry: string) => {
    const baseMethodConfigs = {
      hs: {
        allowedMethods: ['card', 'mobile_wallet', 'bank_transfer', 'check', 'cash'],
        preferredMethods: ['card', 'bank_transfer'],
        features: { financing: true, recurring: true }
      },
      rest: {
        allowedMethods: ['card', 'mobile_wallet', 'cash'],
        preferredMethods: ['card', 'mobile_wallet'],
        features: { tips: true, split: true }
      },
      auto: {
        allowedMethods: ['card', 'bank_transfer', 'check', 'crypto'],
        preferredMethods: ['card', 'bank_transfer'],
        features: { financing: true, insurance: true }
      },
      ret: {
        allowedMethods: ['card', 'mobile_wallet', 'crypto', 'cash'],
        preferredMethods: ['card', 'mobile_wallet'],
        features: { loyalty: true, returns: true }
      },
      courses: {
        allowedMethods: ['card', 'mobile_wallet', 'crypto'],
        preferredMethods: ['card', 'mobile_wallet'],
        features: { subscriptions: true, installments: true }
      }
    };

    const config = baseMethodConfigs[industry as keyof typeof baseMethodConfigs];
    
    const allMethods: PaymentMethod[] = [
      {
        id: 'stripe_terminal',
        name: 'Card Payment',
        type: 'card',
        icon: CreditCard,
        description: 'Credit and debit cards with EMV chip and contactless',
        fees: { percentage: 2.9, fixed: 30, currency: 'USD' },
        processingTime: 'Instant',
        limits: { min: 100, max: 999999999 },
        supported: config.allowedMethods.includes('card') && !!processors.stripe,
        testMode: true
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        type: 'mobile_wallet',
        icon: Apple,
        description: 'Secure payments with Touch ID or Face ID',
        fees: { percentage: 2.9, fixed: 30, currency: 'USD' },
        processingTime: 'Instant',
        limits: { min: 100, max: 10000000 },
        supported: config.allowedMethods.includes('mobile_wallet') && !!processors.mobile,
        testMode: true
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        type: 'mobile_wallet',
        icon: Smartphone,
        description: 'Tap to pay with Android devices',
        fees: { percentage: 2.9, fixed: 30, currency: 'USD' },
        processingTime: 'Instant',
        limits: { min: 100, max: 10000000 },
        supported: config.allowedMethods.includes('mobile_wallet') && !!processors.mobile,
        testMode: true
      },
      {
        id: 'ach_debit',
        name: 'Bank Transfer',
        type: 'bank_transfer',
        icon: Building2,
        description: 'Direct bank account transfers (ACH)',
        fees: { percentage: 0.8, fixed: 25, currency: 'USD' },
        processingTime: '1-3 business days',
        limits: { min: 100, max: 100000000 },
        supported: config.allowedMethods.includes('bank_transfer') && !!processors.ach,
        testMode: true
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        type: 'crypto',
        icon: Bitcoin,
        description: 'Cryptocurrency payments with Bitcoin',
        fees: { percentage: 1.0, fixed: 500, currency: 'USD' },
        processingTime: '10-60 minutes',
        limits: { min: 1000, max: 50000000 },
        supported: config.allowedMethods.includes('crypto') && !!processors.crypto,
        testMode: true
      },
      {
        id: 'cash',
        name: 'Cash Payment',
        type: 'cash',
        icon: Banknote,
        description: 'Physical cash transactions',
        fees: { percentage: 0, fixed: 0, currency: 'USD' },
        processingTime: 'Instant',
        limits: { min: 100, max: 1000000 },
        supported: config.allowedMethods.includes('cash'),
        testMode: false
      },
      {
        id: 'check_capture',
        name: 'Check Payment',
        type: 'check',
        icon: Camera,
        description: 'Mobile check capture and processing',
        fees: { percentage: 1.5, fixed: 100, currency: 'USD' },
        processingTime: '1-2 business days',
        limits: { min: 500, max: 25000000 },
        supported: config.allowedMethods.includes('check'),
        testMode: true
      }
    ];

    setPaymentMethods(allMethods.filter(method => method.supported));
  };

  const handleMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    setPaymentState(prev => ({
      ...prev,
      method: methodId,
      stage: 'input',
      error: null
    }));
  };

  const handleAmountChange = (amount: number) => {
    setPaymentState(prev => ({
      ...prev,
      amount,
      error: null
    }));
  };

  const calculateFees = (amount: number, method: PaymentMethod) => {
    const percentageFee = (amount * method.fees.percentage) / 100;
    const totalFee = percentageFee + method.fees.fixed;
    return {
      percentage: percentageFee,
      fixed: method.fees.fixed,
      total: totalFee
    };
  };

  const processUnifiedPayment = async () => {
    if (!paymentState.method || !paymentState.amount) return;

    const method = paymentMethods.find(m => m.id === paymentState.method);
    if (!method) return;

    setPaymentState(prev => ({ ...prev, processing: true, error: null, stage: 'processing' }));

    try {
      let result;

      switch (method.type) {
        case 'card':
          result = await processStripeTerminalPayment();
          break;
        case 'mobile_wallet':
          result = await processMobileWalletPayment();
          break;
        case 'bank_transfer':
          result = await processACHPayment();
          break;
        case 'crypto':
          result = await processCryptoPayment();
          break;
        case 'cash':
          result = await processCashPayment();
          break;
        case 'check':
          result = await processCheckPayment();
          break;
        default:
          throw new Error('Payment method ${method.type} not implemented');
      }

      setPaymentState(prev => ({
        ...prev,
        processing: false,
        result,
        stage: 'complete'
      }));
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        stage: 'input'
      }));
    }
  };

  const processStripeTerminalPayment = async () => {
    const readers = await processors.stripe.discoverReaders();
    if (readers.length === 0) {
      throw new Error('No terminal readers found');
    }

    await processors.stripe.connectReader(readers[0].id);
    
    const paymentIntent = await processors.stripe.createPaymentIntent({
      amount: paymentState.amount,
      currency: 'USD',
      paymentMethodTypes: ['card_present'],
      captureMethod: 'automatic',
      metadata: {
        organizationId: 'org_test',
        industry: selectedIndustry
      }
    });

    return await processors.stripe.collectPayment(paymentIntent.id);
  };

  const processMobileWalletPayment = async () => {
    const request = {
      amount: paymentState.amount,
      currency: 'USD',
      merchantName: 'Thorbis Business OS',
      metadata: {
        organizationId: 'org_test',
        industry: selectedIndustry
      }
    };

    return await processors.mobile.showPaymentSheet(request);
  };

  const processACHPayment = async () => {
    const bankAccount = {
      routingNumber: '123456789',
      accountNumber: '1234567890',
      accountType: 'checking' as const,
      accountHolderName: 'Test Customer',
      accountHolderType: 'individual' as const
    };

    return await processors.ach.processACHDebit({
      amount: paymentState.amount,
      currency: 'USD',
      bankAccount,
      description: 'Test payment',
      metadata: {
        organizationId: 'org_test',
        industry: selectedIndustry
      }
    });
  };

  const processCryptoPayment = async () => {
    return await processors.crypto.createCryptoPayment({
      amount: paymentState.amount,
      currency: 'USD',
      cryptocurrency: 'BTC',
      description: 'Test crypto payment',
      metadata: {
        organizationId: 'org_test',
        industry: selectedIndustry
      }
    });
  };

  const processCashPayment = async () => {
    return await processPayment({
      amount: paymentState.amount,
      currency: 'USD',
      paymentMethod: 'cash',
      organizationId: 'org_test',
      metadata: {
        industry: selectedIndustry,
        paymentType: 'cash'
      }
    });
  };

  const processCheckPayment = async () => {
    return await processPayment({
      amount: paymentState.amount,
      currency: 'USD',
      paymentMethod: 'check',
      organizationId: 'org_test',
      metadata: {
        industry: selectedIndustry,
        paymentType: 'check'
      }
    });
  };

  const resetPaymentFlow = () => {
    setPaymentState({
      method: null,
      amount: 0,
      processing: false,
      result: null,
      error: null,
      stage: 'select'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const selectedMethod = paymentMethods.find(m => m.id === paymentState.method);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Unified Payment Gateway</h1>
          <p className="text-neutral-400">Accept payments across all business verticals</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          <Select value={selectedIndustry} onValueChange={(value: unknown) => setSelectedIndustry(value)}>
            <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hs">Home Services</SelectItem>
              <SelectItem value="rest">Restaurant</SelectItem>
              <SelectItem value="auto">Auto Services</SelectItem>
              <SelectItem value="ret">Retail</SelectItem>
              <SelectItem value="courses">Courses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment Flow */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Payment Processing</CardTitle>
              <CardDescription>
                {paymentState.stage === 'select' && 'Choose your payment method'}
                {paymentState.stage === 'input' && 'Enter payment details'}
                {paymentState.stage === 'processing' && 'Processing payment...'}
                {paymentState.stage === 'complete' && 'Payment complete'}
              </CardDescription>
            </div>
            {paymentState.amount > 0 && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                {formatCurrency(paymentState.amount)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Stage 1: Method Selection */}
          {paymentState.stage === 'select' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-white">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentState.amount / 100 || ''}
                  onChange={(e) => handleAmountChange(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map(method => {
                  const fees = paymentState.amount > 0 ? calculateFees(paymentState.amount, method) : null;
                  const Icon = method.icon;

                  return (
                    <Card
                      key={method.id}
                      className="bg-neutral-800 border-neutral-700 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium text-white">{method.name}</h3>
                            <p className="text-xs text-neutral-400">{method.processingTime}</p>
                          </div>
                          {method.testMode && (
                            <Badge variant="outline" className="text-xs">Test</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-neutral-300 mb-3">{method.description}</p>
                        
                        <div className="space-y-1 text-xs text-neutral-400">
                          <div className="flex justify-between">
                            <span>Fee:</span>
                            <span>{method.fees.percentage}% + {formatCurrency(method.fees.fixed)}</span>
                          </div>
                          {fees && (
                            <div className="flex justify-between text-blue-400">
                              <span>Total fee:</span>
                              <span>{formatCurrency(fees.total)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Limits:</span>
                            <span>{formatCurrency(method.limits.min)} - {formatCurrency(method.limits.max)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage 2: Payment Input */}
          {paymentState.stage === 'input' && selectedMethod && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg">
                <selectedMethod.icon className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{selectedMethod.name}</h3>
                  <p className="text-sm text-neutral-400">{selectedMethod.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetPaymentFlow}>
                  Change
                </Button>
              </div>

              {/* Payment-specific forms would go here */}
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-400 font-medium">Ready to Process</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  Click the button below to process your {formatCurrency(paymentState.amount)} payment via {selectedMethod.name}
                </p>
              </div>

              <Button
                onClick={processUnifiedPayment}
                disabled={paymentState.processing || paymentState.amount <= 0}
                className="w-full"
                size="lg"
              >
                {paymentState.processing ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5 mr-2" />
                )}
                Process Payment
              </Button>
            </div>
          )}

          {/* Stage 3: Processing */}
          {paymentState.stage === 'processing' && (
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <selectedMethod?.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Processing Payment</h3>
                <p className="text-neutral-400">
                  Please wait while we process your {formatCurrency(paymentState.amount)} payment...
                </p>
              </div>
              <Progress value={75} className="w-full max-w-md mx-auto" />
            </div>
          )}

          {/* Stage 4: Complete */}
          {paymentState.stage === 'complete' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Payment Successful</h3>
                <p className="text-neutral-400">
                  Your {formatCurrency(paymentState.amount)} payment has been processed successfully
                </p>
              </div>
              
              {paymentState.result && (
                <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg text-left">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-neutral-400">Payment ID:</span>
                      <span className="text-white ml-2 font-mono">{paymentState.result.id}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Status:</span>
                      <span className="text-green-400 ml-2">{paymentState.result.status || 'success'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Method:</span>
                      <span className="text-white ml-2">{selectedMethod?.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Amount:</span>
                      <span className="text-white ml-2">{formatCurrency(paymentState.amount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={resetPaymentFlow} className="w-full">
                Process Another Payment
              </Button>
            </div>
          )}

          {/* Error Display */}
          {paymentState.error && (
            <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-400 font-medium">Payment Failed</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">{paymentState.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Summary */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Supported Payment Methods</CardTitle>
          <CardDescription>
            Available payment options for {selectedIndustry} industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <div key={method.id} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{method.name}</p>
                    <p className="text-xs text-neutral-400">{method.processingTime}</p>
                  </div>
                  {method.testMode && (
                    <Badge variant="outline" className="text-xs ml-auto">Test</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}