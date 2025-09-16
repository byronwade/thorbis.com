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
  Shield,
  CreditCard,
  Building2,
  Smartphone,
  Bitcoin,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RefreshCw,
  BarChart3,
  Clock,
  Lock,
  Unlock,
  Star,
  Calendar,
  Hash,
  Database,
  Activity,
  X
} from 'lucide-react';

import { PaymentTokenizationService, type TokenizedPaymentMethod, type PaymentMethodData } from '@/lib/payment-tokenization';
import { PaymentValidator } from '@/lib/payment-tokenization';

interface TokenizationState {
  loading: boolean;
  tokens: TokenizedPaymentMethod[];
  statistics: {
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    usageStats: Record<string, number>;
    typeDistribution: Record<string, number>;
  };
  error: string | null;
  selectedToken: string | null;
}

interface NewPaymentMethodForm {
  type: PaymentMethodData['type'];
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  holderName?: string;
  routingNumber?: string;
  accountNumber?: string;
  accountType?: 'checking' | 'savings';
  walletType?: 'apple_pay' | 'google_pay' | 'samsung_pay';
  walletAddress?: string;
  cryptocurrency?: string;
  nickname?: string;
}

export default function PaymentTokenizationManager() {
  const [state, setState] = useState<TokenizationState>({
    loading: false,
    tokens: [],
    statistics: {
      totalTokens: 0,
      activeTokens: 0,
      expiredTokens: 0,
      usageStats: Record<string, unknown>,
      typeDistribution: Record<string, unknown>
    },
    error: null,
    selectedToken: null
  });

  const [showForm, setShowForm] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<NewPaymentMethodForm>({
    type: 'card',
    holderName: '
  });

  const [tokenizer] = useState(() => PaymentTokenizationService.getInstance({
    tokenPrefix: 'thorbis_pm_',
    expirationDays: 365,
    maxUsageCount: 1000,
    autoCleanup: true
  }));

  // Load data on component mount
  useEffect(() => {
    loadTokens();
    loadStatistics();

    // Set up event listeners
    tokenizer.on('payment_method_tokenized', loadTokens);
    tokenizer.on('token_deactivated', loadTokens);
    tokenizer.on('tokens_cleaned_up', () => {
      loadTokens();
      loadStatistics();
    });

    return () => {
      tokenizer.off('payment_method_tokenized', loadTokens);
      tokenizer.off('token_deactivated', loadTokens);
      tokenizer.off('tokens_cleaned_up', loadTokens);
    };
  }, []);

  const loadTokens = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const tokens = await tokenizer.listTokenizedPaymentMethods('org_test');
      setState(prev => ({ ...prev, tokens, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load tokens',
        loading: false
      }));
    }
  }, [tokenizer]);

  const loadStatistics = useCallback(async () => {
    try {
      const statistics = await tokenizer.getStatistics('org_test');
      setState(prev => ({ ...prev, statistics }));
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, [tokenizer]);

  const handleTokenizePaymentMethod = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Build payment method data based on type
      let paymentData: PaymentMethodData;

      switch (newPaymentMethod.type) {
        case 'card':
          if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear || !newPaymentMethod.cvv) {
            throw new Error('Please fill in all card details');
          }

          if (!PaymentValidator.validateCardNumber(newPaymentMethod.cardNumber)) {
            throw new Error('Invalid card number');
          }

          if (!PaymentValidator.validateExpiryDate(newPaymentMethod.expiryMonth, newPaymentMethod.expiryYear)) {
            throw new Error('Invalid expiry date');
          }

          if (!PaymentValidator.validateCVV(newPaymentMethod.cvv)) {
            throw new Error('Invalid CVV');
          }

          paymentData = {
            type: 'card',
            last4: newPaymentMethod.cardNumber.slice(-4),
            brand: detectCardBrand(newPaymentMethod.cardNumber),
            expiryMonth: newPaymentMethod.expiryMonth,
            expiryYear: newPaymentMethod.expiryYear,
            holderName: newPaymentMethod.holderName || '
          };
          break;

        case 'bank_account':
          if (!newPaymentMethod.routingNumber || !newPaymentMethod.accountNumber) {
            throw new Error('Please fill in all bank account details');
          }

          if (!PaymentValidator.validateRoutingNumber(newPaymentMethod.routingNumber)) {
            throw new Error('Invalid routing number');
          }

          paymentData = {
            type: 'bank_account',
            last4: newPaymentMethod.accountNumber.slice(-4),
            routingNumber: newPaymentMethod.routingNumber,
            accountType: newPaymentMethod.accountType || 'checking',
            holderName: newPaymentMethod.holderName || '
          };
          break;

        case 'mobile_wallet':
          paymentData = {
            type: 'mobile_wallet',
            walletType: newPaymentMethod.walletType || 'apple_pay',
            holderName: newPaymentMethod.holderName || '
          };
          break;

        case 'crypto_wallet':
          if (!newPaymentMethod.walletAddress || !newPaymentMethod.cryptocurrency) {
            throw new Error('Please fill in wallet details');
          }

          paymentData = {
            type: 'crypto_wallet',
            walletAddress: newPaymentMethod.walletAddress,
            cryptocurrency: newPaymentMethod.cryptocurrency
          };
          break;

        default:
          throw new Error('Invalid payment method type');
      }

      // Tokenize the payment method
      const tokenizedMethod = await tokenizer.tokenizePaymentMethod(
        paymentData,
        'org_test',
        'customer_test'
      );

      // Update nickname if provided
      if (newPaymentMethod.nickname) {
        await tokenizer.updateTokenMetadata(tokenizedMethod.token, 'org_test', {
          nickname: newPaymentMethod.nickname
        });
      }

      // Reset form
      setNewPaymentMethod({ type: 'card', holderName: ' });
      setShowForm(false);
      
      // Reload data
      await loadTokens();
      await loadStatistics();

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Tokenization failed',
        loading: false
      }));
    }
  };

  const handleDeactivateToken = async (token: string) => {
    try {
      await tokenizer.deactivateToken(token, 'org_test');
      await loadTokens();
      await loadStatistics();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to deactivate token'
      }));
    }
  };

  const handleCleanupExpired = async () => {
    try {
      const removedCount = await tokenizer.cleanupExpiredTokens();
      await loadTokens();
      await loadStatistics();
      
      if (removedCount > 0) {
        setState(prev => ({ ...prev, error: 'Cleaned up ${removedCount} expired tokens' }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cleanup failed'
      }));
    }
  };

  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/[^\w\s-]/g, '');
    
    if (number.match(/^4/)) return 'visa';
    if (number.match(/^5[1-5]/)) return 'mastercard';
    if (number.match(/^3[47]/)) return 'amex';
    if (number.match(/^6/)) return 'discover';
    
    return 'unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'bank_account': return Building2;
      case 'mobile_wallet': return Smartphone;
      case 'crypto_wallet': return Bitcoin;
      default: return CreditCard;
    }
  };

  const getPaymentMethodName = (method: TokenizedPaymentMethod) => {
    if (method.metadata.nickname) return method.metadata.nickname;
    
    switch (method.type) {
      case 'card':
        return '${method.maskedData.brand?.toUpperCase() || 'Card'} ****${method.maskedData.last4}';
      case 'bank_account':
        return '${method.maskedData.accountType?.toUpperCase() || 'Bank'} ****${method.maskedData.last4}';
      case 'mobile_wallet':
        return method.maskedData.walletType?.replace('_', ' ').toUpperCase() || 'Mobile Wallet';
      case 'crypto_wallet':
        return '${method.maskedData.cryptocurrency || 'Crypto'} Wallet';
      default:
        return 'Payment Method';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Tokenization Manager</h1>
          <p className="text-neutral-400">Securely manage tokenized payment methods with encryption</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanupExpired}
            disabled={state.loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            disabled={state.loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Tokens</p>
                <p className="text-2xl font-bold text-white">{state.statistics.totalTokens}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active</p>
                <p className="text-2xl font-bold text-green-500">{state.statistics.activeTokens}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Expired</p>
                <p className="text-2xl font-bold text-yellow-500">{state.statistics.expiredTokens}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Usage</p>
                <p className="text-2xl font-bold text-white">{state.statistics.usageStats.detokenized || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods List */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Tokenized Payment Methods</CardTitle>
              <CardDescription>Securely stored payment methods with AES-GCM encryption</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitive(!showSensitive)}
              >
                {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitive ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin mb-2" />
              <p className="text-neutral-400">Loading tokenized payment methods...</p>
            </div>
          ) : state.tokens.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400">No tokenized payment methods found</p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {state.tokens.map(token => {
                const Icon = getPaymentMethodIcon(token.type);
                const isExpired = token.expiresAt && token.expiresAt < new Date();
                
                return (
                  <div
                    key={token.token}
                    className={'flex items-center justify-between p-4 rounded-lg border ${
                      isExpired 
                        ? 'bg-red-900/20 border-red-500/20'
                        : token.isActive
                        ? 'bg-neutral-800 border-neutral-700'
                        : 'bg-neutral-800/50 border-neutral-700/50'
                    }'}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={'h-6 w-6 ${
                        isExpired ? 'text-red-500' : 'text-blue-500'
                      }'} />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {getPaymentMethodName(token)}
                          </p>
                          {token.metadata.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                          {!token.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                          <span>Created: {formatDate(token.metadata.createdAt)}</span>
                          <span>Usage: {token.metadata.usageCount}</span>
                          {showSensitive && (
                            <span className="font-mono">Token: {token.token.slice(-12)}</span>
                          )}
                          {token.expiresAt && (
                            <span>Expires: {formatDate(token.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {token.isActive ? (
                        <Lock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-red-500" />
                      )}
                      
                      {token.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateToken(token.token)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Form */}
      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Add New Payment Method</CardTitle>
            <CardDescription>Securely tokenize a new payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-white">Payment Type</Label>
                <Select
                  value={newPaymentMethod.type}
                  onValueChange={(value: unknown) => setNewPaymentMethod(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                    <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                    <SelectItem value="crypto_wallet">Crypto Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nickname" className="text-white">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  value={newPaymentMethod.nickname || ''}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="e.g., Work Card"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            {/* Card Fields */}
            {newPaymentMethod.type === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={newPaymentMethod.cardNumber || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryMonth" className="text-white">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    type="number"
                    min="1"
                    max="12"
                    value={newPaymentMethod.expiryMonth || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: parseInt(e.target.value) }))}
                    placeholder="12"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear" className="text-white">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    type="number"
                    min="2024"
                    max="2034"
                    value={newPaymentMethod.expiryYear || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: parseInt(e.target.value) }))}
                    placeholder="2028"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-white">CVV</Label>
                  <Input
                    id="cvv"
                    value={newPaymentMethod.cvv || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="holderName" className="text-white">Cardholder Name</Label>
                  <Input
                    id="holderName"
                    value={newPaymentMethod.holderName || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, holderName: e.target.value }))}
                    placeholder="John Doe"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Bank Account Fields */}
            {newPaymentMethod.type === 'bank_account' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routingNumber" className="text-white">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={newPaymentMethod.routingNumber || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-white">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={newPaymentMethod.accountNumber || ''}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="accountType" className="text-white">Account Type</Label>
                  <Select
                    value={newPaymentMethod.accountType || 'checking'}
                    onValueChange={(value: unknown) => setNewPaymentMethod(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="holderName" className="text-white">Account Holder Name</Label>
                  <Input
                    id="holderName"
                    value={newPaymentMethod.holderName || '`}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, holderName: e.target.value }))}
                    placeholder="John Doe"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleTokenizePaymentMethod}
                disabled={state.loading}
                className="flex-1"
              >
                {state.loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Tokenize Payment Method
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={state.loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Information */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-white font-medium">AES-GCM Encryption</p>
                <p className="text-neutral-400">256-bit encryption keys</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">PCI DSS Compliant</p>
                <p className="text-neutral-400">Secure tokenization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-white font-medium">Offline Storage</p>
                <p className="text-neutral-400">Local encrypted vault</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}