/**
 * Multi-Currency Payment Dashboard
 * Comprehensive international payment management with real-time exchange rates
 * 
 * Features: Currency conversion, risk management, compliance monitoring, settlement tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Euro,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  ArrowRightLeft,
  Target,
  Zap,
  Lock,
  Unlock,
  Calculator,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  FileText,
  AlertCircle,
  TrendingRight,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  PiggyBank,
  Scale,
  Briefcase
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  spot_rate: number;
  our_rate: number;
  markup_percent: number;
  timestamp: string;
  trend_24h: string;
  volatility_24h: number;
}

interface CurrencyConfig {
  base_currency: string;
  supported_currencies: string[];
  auto_convert: boolean;
  conversion_markup_percent: number;
  settlement_preference: string;
  risk_management: {
    hedge_threshold_percent: number;
    exposure_limit_usd: number;
    auto_hedge: boolean;
    current_exposure: {
      total_exposure_usd: number;
      currency_breakdown: Array<{
        currency: string;
        exposure_usd: number;
        percentage: number;
      }>;
    };
  };
}

interface ConversionRequest {
  from_amount: number;
  from_currency: string;
  to_currency: string;
  conversion_type: string;
  lock_rate: boolean;
}

export default function MultiCurrencyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState({ from: 'USD', to: 'EUR' });

  // Conversion calculator state
  const [conversionCalc, setConversionCalc] = useState<ConversionRequest>({
    from_amount: 1000,
    from_currency: 'USD',
    to_currency: 'EUR',
    conversion_type: 'spot',
    lock_rate: false
  });

  // Configuration form state
  const [configForm, setConfigForm] = useState({
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
    conversion_markup_percent: 2.5,
    settlement_preference: 'daily',
    auto_convert: true,
    hedge_threshold_percent: 5,
    exposure_limit_usd: 500000
  });

  const verticalIcons = {
    hs: Building2,
    auto: Car,
    rest: UtensilsCrossed,
    ret: ShoppingBag
  };

  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'Fr',
    CNY: '¥'
  };

  const currencyFlags: { [key: string]: string } = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    CHF: '🇨🇭',
    CNY: '🇨🇳'
  };

  useEffect(() => {
    loadCurrencyData();
  }, []);

  const loadCurrencyData = async () => {
    try {
      // Load currency configuration
      const configResponse = await fetch(`/api/v1/payments/multi-currency?organization_id=${MOCK_ORG_ID}');
      if (configResponse.ok) {
        const configResult = await configResponse.json();
        setCurrencyConfig(configResult.data.organization_settings);
      }

      // Load exchange rates
      const ratesResponse = await fetch('/api/v1/payments/multi-currency?organization_id=${MOCK_ORG_ID}&request_type=exchange_rates&from_currency=USD&to_currency=EUR&amount=1000');
      if (ratesResponse.ok) {
        const ratesResult = await ratesResponse.json();
        
        // Mock multiple currency pairs
        const mockRates: ExchangeRate[] = [
          {
            from_currency: 'USD',
            to_currency: 'EUR',
            spot_rate: 1.0875,
            our_rate: 1.0648,
            markup_percent: 2.5,
            timestamp: new Date().toISOString(),
            trend_24h: 'up',
            volatility_24h: 1.2
          },
          {
            from_currency: 'USD',
            to_currency: 'GBP',
            spot_rate: 0.7942,
            our_rate: 0.7744,
            markup_percent: 2.5,
            timestamp: new Date().toISOString(),
            trend_24h: 'down',
            volatility_24h: 1.8
          },
          {
            from_currency: 'USD',
            to_currency: 'CAD',
            spot_rate: 1.3456,
            our_rate: 1.3120,
            markup_percent: 2.5,
            timestamp: new Date().toISOString(),
            trend_24h: 'stable',
            volatility_24h: 0.8
          },
          {
            from_currency: 'USD',
            to_currency: 'JPY',
            spot_rate: 148.75,
            our_rate: 145.03,
            markup_percent: 2.5,
            timestamp: new Date().toISOString(),
            trend_24h: 'up',
            volatility_24h: 2.1
          }
        ];
        
        setExchangeRates(mockRates);
      }
    } catch (error) {
      console.error('Failed to load currency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyConversion = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/v1/payments/multi-currency?action=convert_currency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          conversion_request: {
            from_amount_cents: conversionCalc.from_amount * 100,
            from_currency: conversionCalc.from_currency,
            to_currency: conversionCalc.to_currency,
            conversion_type: conversionCalc.conversion_type
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Show conversion result
        console.log('Conversion completed:', result);
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currencySymbols[currency] || '$';
    return '${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingRight className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility > 2) return 'text-red-600';
    if (volatility > 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Multi-Currency Payments</h1>
          <p className="text-muted-foreground mt-2">
            Manage international transactions with real-time exchange rates and comprehensive compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCurrencyData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Rates
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Currency Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Currency Configuration</DialogTitle>
                <DialogDescription>
                  Configure currency settings and risk management parameters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Supported Currencies</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'].map((currency) => (
                      <label key={currency} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={configForm.supported_currencies.includes(currency)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfigForm(prev => ({
                                ...prev,
                                supported_currencies: [...prev.supported_currencies, currency]
                              }));
                            } else {
                              setConfigForm(prev => ({
                                ...prev,
                                supported_currencies: prev.supported_currencies.filter(c => c !== currency)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{currencyFlags[currency]} {currency}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Conversion Markup (%)</Label>
                    <Input
                      type="number"
                      value={configForm.conversion_markup_percent}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        conversion_markup_percent: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label>Settlement Preference</Label>
                    <Select value={configForm.settlement_preference} onValueChange={(value) =>
                      setConfigForm(prev => ({ ...prev, settlement_preference: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={configForm.auto_convert}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      auto_convert: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <Label>Automatically convert to base currency</Label>
                </div>
                <Button className="w-full">
                  Update Configuration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exchange-rates">Exchange Rates</TabsTrigger>
          <TabsTrigger value="converter">Currency Converter</TabsTrigger>
          <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Supported Currencies</span>
                </div>
                <p className="text-2xl font-bold">{currencyConfig?.supported_currencies?.length || 7}</p>
                <p className="text-xs text-muted-foreground">
                  Active trading pairs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowRightLeft className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">24h Volume</span>
                </div>
                <p className="text-2xl font-bold">$2.4M</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  +12.3% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">FX Exposure</span>
                </div>
                <p className="text-2xl font-bold">$125K</p>
                <p className="text-xs text-muted-foreground">
                  25% of limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Avg Spread</span>
                </div>
                <p className="text-2xl font-bold">2.5%</p>
                <p className="text-xs text-muted-foreground">
                  Below market average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions and Top Currencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent International Transactions
                </CardTitle>
                <CardDescription>
                  Latest multi-currency payment activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { amount: 5000, from: 'USD', to: 'EUR', status: 'completed', customer: 'ACME Corp UK' },
                  { amount: 2500, from: 'GBP', to: 'USD', status: 'processing', customer: 'London Services Ltd' },
                  { amount: 8750, from: 'USD', to: 'CAD', status: 'completed', customer: 'Toronto Auto Repair' },
                  { amount: 1200, from: 'EUR', to: 'USD', status: 'pending', customer: 'Berlin Restaurant GmbH' }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{currencyFlags[transaction.from]}</span>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span className="text-lg">{currencyFlags[transaction.to]}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {formatCurrency(transaction.amount, transaction.from)} → {transaction.to}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                      </div>
                    </div>
                    <Badge className={
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      transaction.status === 'processing' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                      'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Currency Distribution
                </CardTitle>
                <CardDescription>
                  Transaction volume by currency this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { currency: 'USD', percentage: 65, volume: 1560000, flag: '🇺🇸' },
                  { currency: 'EUR', percentage: 20, volume: 480000, flag: '🇪🇺' },
                  { currency: 'GBP', percentage: 10, volume: 240000, flag: '🇬🇧' },
                  { currency: 'CAD', percentage: 5, volume: 120000, flag: '🇨🇦` }
                ].map((currency) => (
                  <div key={currency.currency} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currency.flag}</span>
                      <span className="font-medium">{currency.currency}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(currency.volume / 100)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${currency.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{currency.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exchange-rates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Live Exchange Rates</h2>
              <p className="text-muted-foreground">Real-time rates with our markup included</p>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exchangeRates.map((rate, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currencyFlags[rate.from_currency]}</span>
                      <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      <span className="text-2xl">{currencyFlags[rate.to_currency]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(rate.trend_24h)}
                      <span className={`text-xs ${getTrendColor(rate.trend_24h)}'}>
                        {rate.trend_24h}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    {rate.from_currency}/{rate.to_currency}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Market Rate:</span>
                      <span className="font-mono">{rate.spot_rate.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Our Rate:</span>
                      <span className="font-mono font-semibold">{rate.our_rate.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Markup:</span>
                      <span className="text-sm">{rate.markup_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">24h Volatility:</span>
                      <span className={'text-sm ${getVolatilityColor(rate.volatility_24h)}'}>
                        {rate.volatility_24h}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Lock className="w-3 h-3 mr-1" />
                        Lock Rate
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Calculator className="w-3 h-3 mr-1" />
                        Convert
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Converter</CardTitle>
              <CardDescription>
                Convert between currencies with real-time rates and fee calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={conversionCalc.from_amount}
                    onChange={(e) => setConversionCalc(prev => ({
                      ...prev,
                      from_amount: parseFloat(e.target.value) || 0
                    }))}
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label>From Currency</Label>
                  <Select value={conversionCalc.from_currency} onValueChange={(value) =>
                    setConversionCalc(prev => ({ ...prev, from_currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currencyFlags[currency]} {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Currency</Label>
                  <Select value={conversionCalc.to_currency} onValueChange={(value) =>
                    setConversionCalc(prev => ({ ...prev, to_currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currencyFlags[currency]} {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Conversion Type</Label>
                  <Select value={conversionCalc.conversion_type} onValueChange={(value) =>
                    setConversionCalc(prev => ({ ...prev, conversion_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spot">Spot Rate (Immediate)</SelectItem>
                      <SelectItem value="forward">Forward Contract</SelectItem>
                      <SelectItem value="market_order">Market Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 h-9">
                    <input
                      type="checkbox"
                      checked={conversionCalc.lock_rate}
                      onChange={(e) => setConversionCalc(prev => ({
                        ...prev,
                        lock_rate: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Lock rate for 1 hour</span>
                  </label>
                </div>
              </div>

              {/* Conversion Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Conversion Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount to Convert:</span>
                    <span className="font-mono">
                      {formatCurrency(conversionCalc.from_amount, conversionCalc.from_currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span className="font-mono">1 {conversionCalc.from_currency} = 1.0648 {conversionCalc.to_currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Converted Amount:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(conversionCalc.from_amount * 1.0648, conversionCalc.to_currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Fee (2.5%):</span>
                    <span>{formatCurrency(conversionCalc.from_amount * 0.025, conversionCalc.from_currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee:</span>
                    <span>$1.50</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(conversionCalc.from_amount + (conversionCalc.from_amount * 0.025) + 1.50, conversionCalc.from_currency)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCurrencyConversion}
                disabled={isConverting}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing Conversion...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Execute Conversion
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  FX Exposure Summary
                </CardTitle>
                <CardDescription>Current foreign exchange risk exposure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Exposure:</span>
                    <span className="font-semibold">$125,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exposure Limit:</span>
                    <span>$500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization:</span>
                    <span className="text-orange-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <h4 className="font-medium">Exposure by Currency</h4>
                  {[
                    { currency: 'EUR', amount: 75000, percentage: 60, flag: '🇪🇺' },
                    { currency: 'GBP', amount: 35000, percentage: 28, flag: '🇬🇧' },
                    { currency: 'CAD', amount: 15000, percentage: 12, flag: '🇨🇦' }
                  ].map((exposure) => (
                    <div key={exposure.currency} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{exposure.flag}</span>
                        <span>{exposure.currency}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{formatCurrency(exposure.amount / 100)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: '${exposure.percentage}%' }}
                          />
                        </div>
                        <span className="text-sm w-8">{exposure.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Hedging Recommendations
                </CardTitle>
                <CardDescription>Risk management suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    currency: 'EUR',
                    recommendation: 'Consider Hedge',
                    reason: 'Approaching threshold (5%)',
                    amount: 25000,
                    urgency: 'medium',
                    instruments: ['Forward Contract', 'Currency Swap']
                  },
                  {
                    currency: 'GBP',
                    recommendation: 'Monitor',
                    reason: 'Stable within limits',
                    amount: 0,
                    urgency: 'low',
                    instruments: []
                  }
                ].map((rec) => (
                  <div key={rec.currency} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          rec.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {rec.currency}
                        </Badge>
                        <span className="font-medium">{rec.recommendation}</span>
                      </div>
                      <span className={'text-xs px-2 py-1 rounded ${
                        rec.urgency === 'high' ? 'bg-red-100 text-red-600' :
                        rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }'}>
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    {rec.amount > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm">Suggested hedge: {formatCurrency(rec.amount / 100)}</p>
                        <div className="flex gap-1">
                          {rec.instruments.map((instrument) => (
                            <Badge key={instrument} variant="outline" className="text-xs">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Configure Auto-Hedge
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Regulatory Compliance
                </CardTitle>
                <CardDescription>International compliance status and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    region: 'European Union',
                    regulations: ['PSD2', 'GDPR', 'AML5'],
                    status: 'Compliant',
                    last_audit: '2024-01-15'
                  },
                  {
                    region: 'United States',
                    regulations: ['BSA', 'PATRIOT Act', 'FinCEN'],
                    status: 'Compliant',
                    last_audit: '2024-01-10'
                  },
                  {
                    region: 'Canada',
                    regulations: ['FINTRAC', 'PIPEDA'],
                    status: 'Compliant',
                    last_audit: '2024-01-08'
                  }
                ].map((compliance) => (
                  <div key={compliance.region} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{compliance.region}</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {compliance.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {compliance.regulations.map((reg) => (
                        <Badge key={reg} variant="outline" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last audit: {compliance.last_audit}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tax & Reporting
                </CardTitle>
                <CardDescription>International tax compliance and reporting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-lg font-semibold">47</p>
                    <p className="text-xs text-muted-foreground">VAT Returns Filed</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-lg font-semibold">12</p>
                    <p className="text-xs text-muted-foreground">Countries Reporting</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Active Reporting</h4>
                  {[
                    { type: 'EU VAT', frequency: 'Monthly', next_due: '2024-02-15', status: 'current' },
                    { type: 'UK Sales Tax', frequency: 'Quarterly', next_due: '2024-04-30', status: 'current' },
                    { type: 'Canada GST', frequency: 'Monthly', next_due: '2024-02-20', status: 'overdue' }
                  ].map((report) => (
                    <div key={report.type} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{report.type}</p>
                        <p className="text-xs text-muted-foreground">{report.frequency}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          report.status === 'current' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          'bg-red-100 text-red-800 hover:bg-red-200'
                        }>
                          {report.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Due: {report.next_due}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Tax Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}