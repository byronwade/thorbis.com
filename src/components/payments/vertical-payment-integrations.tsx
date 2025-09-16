'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  Banknote,
  Wrench,
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Building,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Apple,
  Calendar,
  Clock,
  Users,
  Receipt,
  Zap,
  QrCode,
  Nfc,
  Wallet
} from 'lucide-react';
import { useOfflinePayments } from '@/hooks/use-offline';

// Industry-specific payment configurations
const INDUSTRY_CONFIGS = {
  hs: {
    name: 'Home Services',
    icon: Wrench,
    color: 'blue',
    allowedMethods: ['card', 'cash', 'check', 'financing', 'ach', 'mobile'],
    preferredMethods: ['card', 'financing'],
    commonAmounts: [100, 250, 500, 1000, 2500],
    features: {
      scheduling: true,
      recurring: true,
      estimates: true,
      financing: true,
      tips: false
    }
  },
  rest: {
    name: 'Restaurant',
    icon: UtensilsCrossed,
    color: 'green',
    allowedMethods: ['card', 'cash', 'mobile', 'giftcard', 'split'],
    preferredMethods: ['card', 'mobile'],
    commonAmounts: [15, 25, 45, 75, 100],
    features: {
      scheduling: false,
      recurring: false,
      estimates: false,
      financing: false,
      tips: true,
      split: true,
      tableService: true
    }
  },
  auto: {
    name: 'Auto Services',
    icon: Car,
    color: 'orange',
    allowedMethods: ['card', 'cash', 'check', 'financing', 'insurance', 'fleet'],
    preferredMethods: ['card', 'financing'],
    commonAmounts: [150, 300, 750, 1500, 3000],
    features: {
      scheduling: true,
      recurring: true,
      estimates: true,
      financing: true,
      tips: false,
      insurance: true,
      warranties: true
    }
  },
  ret: {
    name: 'Retail',
    icon: ShoppingCart,
    color: 'purple',
    allowedMethods: ['card', 'cash', 'mobile', 'giftcard', 'layaway', 'installments'],
    preferredMethods: ['card', 'mobile'],
    commonAmounts: [25, 50, 100, 200, 500],
    features: {
      scheduling: false,
      recurring: false,
      estimates: false,
      financing: false,
      tips: false,
      loyalty: true,
      returns: true,
      exchanges: true
    }
  }
} as const;

type IndustryType = keyof typeof INDUSTRY_CONFIGS;

interface PaymentIntegration {
  id: string;
  name: string;
  type: string;
  description: string;
  logo: string;
  supported: boolean;
  testMode: boolean;
  config: Record<string, unknown>;
}

interface VerticalPaymentConfig {
  industry: IndustryType;
  integrations: PaymentIntegration[];
  customSettings: Record<string, unknown>;
}

export default function VerticalPaymentIntegrations() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('hs');
  const [paymentIntegrations, setPaymentIntegrations] = useState<PaymentIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingPayment, setTestingPayment] = useState<string | null>(null);
  
  const { processPayment } = useOfflinePayments();
  const industryConfig = INDUSTRY_CONFIGS[selectedIndustry];

  // Load payment integrations for selected industry
  useEffect(() => {
    loadPaymentIntegrations(selectedIndustry);
  }, [selectedIndustry]);

  const loadPaymentIntegrations = async (industry: IndustryType) => {
    setLoading(true);
    try {
      // Simulate loading integrations for the industry
      const integrations: PaymentIntegration[] = [
        // Card Processing
        {
          id: 'stripe_terminal',
          name: 'Stripe Terminal',
          type: 'card_present',
          description: 'In-person card processing with EMV chip, contactless, and magstripe',
          logo: '/logos/stripe.svg',
          supported: true,
          testMode: true,
          config: {
            location_id: 'tml_test_123',
            connection_token: 'pst_test_456',
            device_type: 'bbpos_wisepos_e'
          }
        },
        {
          id: 'square_terminal',
          name: 'Square Terminal',
          type: 'card_present',
          description: 'All-in-one payment terminal with receipt printing',
          logo: '/logos/square.svg',
          supported: industryConfig.allowedMethods.includes('card'),
          testMode: true,
          config: {
            application_id: 'sq0idp-test',
            location_id: 'LH2A3MGNMJYAG'
          }
        },
        
        // Mobile Wallets
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          type: 'mobile_wallet',
          description: 'Contactless payments using Touch ID or Face ID',
          logo: '/logos/apple-pay.svg',
          supported: industryConfig.allowedMethods.includes('mobile'),
          testMode: true,
          config: {
            merchant_id: 'merchant.com.thorbis.app',
            country_code: 'US',
            currency_code: 'USD'
          }
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          type: 'mobile_wallet',
          description: 'Tap to pay with Android devices and Google accounts',
          logo: '/logos/google-pay.svg',
          supported: industryConfig.allowedMethods.includes('mobile'),
          testMode: true,
          config: {
            gateway_merchant_id: 'thorbis_merchant_id',
            merchant_id: '1234567890'
          }
        },
        
        // Industry-specific integrations
        ...(industry === 'hs' ? [
          {
            id: 'affirm_financing',
            name: 'Affirm',
            type: 'financing',
            description: 'Buy now, pay later financing for home improvement projects',
            logo: '/logos/affirm.svg',
            supported: true,
            testMode: true,
            config: {
              public_api_key: 'test_public_key',
              merchant_external_id: 'thorbis_hs'
            }
          },
          {
            id: 'greensky_financing',
            name: 'GreenSky',
            type: 'financing',
            description: 'Home improvement financing and promotional rates',
            logo: '/logos/greensky.svg',
            supported: true,
            testMode: true,
            config: {
              merchant_id: 'GS_TEST_123',
              program_id: 'PRG_456'
            }
          }
        ] : []),
        
        ...(industry === 'rest' ? [
          {
            id: 'toast_pos',
            name: 'Toast POS Integration',
            type: 'pos_integration',
            description: 'Native integration with Toast POS for seamless payment processing',
            logo: '/logos/toast.svg',
            supported: true,
            testMode: true,
            config: {
              client_id: 'toast_client_123',
              restaurant_guid: 'rest_guid_456'
            }
          },
          {
            id: 'grubhub_pay',
            name: 'Grubhub+ Payment',
            type: 'delivery_integration',
            description: 'Integrated payment processing for delivery orders',
            logo: '/logos/grubhub.svg',
            supported: true,
            testMode: true,
            config: {
              restaurant_id: 'grub_123',
              api_key: 'grub_api_test'
            }
          }
        ] : []),
        
        ...(industry === 'auto' ? [
          {
            id: 'insurance_direct',
            name: 'Insurance Direct Pay',
            type: 'insurance',
            description: 'Direct billing and payment processing with insurance providers',
            logo: '/logos/insurance.svg',
            supported: true,
            testMode: true,
            config: {
              provider_network: 'auto_insurance_net',
              shop_id: 'SHOP_789'
            }
          },
          {
            id: 'fleet_corporate',
            name: 'Fleet Corporate Cards',
            type: 'fleet_cards',
            description: 'Accept fleet and corporate fuel cards for commercial vehicles',
            logo: '/logos/fleet.svg',
            supported: true,
            testMode: true,
            config: {
              fleet_network: 'universal_fleet',
              merchant_category: '5541'
            }
          }
        ] : []),
        
        ...(industry === 'ret' ? [
          {
            id: 'shopify_payments',
            name: 'Shopify Payments',
            type: 'ecommerce_integration',
            description: 'Unified online and in-store payment processing',
            logo: '/logos/shopify.svg',
            supported: true,
            testMode: true,
            config: {
              shop_domain: 'thorbis-retail.myshopify.com',
              access_token: 'shpat_test_token'
            }
          },
          {
            id: 'klarna_bnpl',
            name: 'Klarna',
            type: 'buy_now_pay_later',
            description: 'Buy now, pay later options for retail purchases',
            logo: '/logos/klarna.svg',
            supported: true,
            testMode: true,
            config: {
              username: 'test_user',
              password: 'test_pass',
              environment: 'playground'
            }
          }
        ] : []),
        
        // Universal integrations
        {
          id: 'ach_payments',
          name: 'ACH Bank Transfers',
          type: 'bank_transfer',
          description: 'Direct bank account debits and credits',
          logo: '/logos/ach.svg',
          supported: industryConfig.allowedMethods.includes('ach'),
          testMode: true,
          config: {
            originator_id: 'ACH_ORIG_123',
            routing_verification: true
          }
        },
        {
          id: 'crypto_payments',
          name: 'Cryptocurrency',
          type: 'crypto',
          description: 'Accept Bitcoin, Ethereum, and other cryptocurrencies',
          logo: '/logos/crypto.svg',
          supported: true,
          testMode: true,
          config: {
            supported_currencies: ['BTC', 'ETH', 'USDC', 'LTC'],
            wallet_provider: 'coinbase_commerce'
          }
        }
      ];

      setPaymentIntegrations(integrations);
    } catch (error) {
      console.error('Failed to load payment integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentIntegration = async (integrationId: string) => {
    setTestingPayment(integrationId);
    try {
      const integration = paymentIntegrations.find(i => i.id === integrationId);
      if (!integration) return;

      // Simulate test payment
      const testAmount = industryConfig.commonAmounts[0];
      const result = await processPayment({
        amount: testAmount * 100,
        currency: 'USD',
        paymentMethod: integration.type,
        organizationId: 'org_test',
        metadata: {
          integration_id: integrationId,
          test_mode: true,
          industry: selectedIndustry
        }
      });

      console.log('Test payment result:', result);
    } catch (error) {
      console.error('Test payment failed:', error);
    } finally {
      setTestingPayment(null);
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setPaymentIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, supported: !integration.supported }
          : integration
      )
    );
  };

  const getStatusColor = (integration: PaymentIntegration) => {
    if (!integration.supported) return 'secondary';
    if (integration.testMode) return 'outline';
    return 'default';
  };

  const getStatusText = (integration: PaymentIntegration) => {
    if (!integration.supported) return 'Disabled';
    if (integration.testMode) return 'Test Mode';
    return 'Live';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Integrations</h1>
          <p className="text-neutral-400">Configure payment methods for each business vertical</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <industryConfig.icon className="h-4 w-4" />
          {industryConfig.name}
        </Badge>
      </div>

      {/* Industry Selector */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Business Vertical</CardTitle>
          <CardDescription>Select the industry to configure payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={key}
                  variant={selectedIndustry === key ? 'default' : 'outline'}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setSelectedIndustry(key as IndustryType)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{config.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Industry Configuration */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <industryConfig.icon className="h-5 w-5" />
            {industryConfig.name} Configuration
          </CardTitle>
          <CardDescription>
            Payment methods and features for {industryConfig.name.toLowerCase()} businesses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Allowed Payment Methods</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {industryConfig.allowedMethods.map(method => (
                <Badge key={method} variant="outline">
                  {method.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">Common Transaction Amounts</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {industryConfig.commonAmounts.map(amount => (
                <Badge key={amount} variant="secondary">
                  ${amount}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">Industry Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {Object.entries(industryConfig.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-neutral-500" />
                  )}
                  <span className={'text-sm ${enabled ? 'text-green-400' : 'text-neutral-500'}'}>
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Integrations */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Available Integrations</CardTitle>
          <CardDescription>
            Configure and test payment integrations for {industryConfig.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-neutral-400">Loading integrations...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentIntegrations.map(integration => (
                <Card key={integration.id} className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-neutral-900">
                            {integration.name.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-sm text-white">{integration.name}</CardTitle>
                          <p className="text-xs text-neutral-400">{integration.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(integration)}>
                        {getStatusText(integration)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-neutral-300">{integration.description}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration.supported ? "default" : "outline"}
                        onClick={() => toggleIntegration(integration.id)}
                        className="flex-1"
                      >
                        {integration.supported ? "Enabled" : "Enable"}
                      </Button>
                      
                      {integration.supported && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testPaymentIntegration(integration.id)}
                          disabled={testingPayment === integration.id}
                        >
                          {testingPayment === integration.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Zap className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>

                    {integration.supported && integration.config && (
                      <div className="text-xs text-neutral-500 space-y-1">
                        <div className="font-medium">Configuration:</div>
                        {Object.entries(integration.config).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-mono">{String(value).substring(0, 20)}...</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup for Common Scenarios */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Setup</CardTitle>
          <CardDescription>Pre-configured payment setups for common scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Setup</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Setup</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise Setup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-white">Card Payments Only</h3>
                        <p className="text-sm text-neutral-400">Stripe Terminal + Square</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Enable Card Processing
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Smartphone className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="font-medium text-white">Mobile Payments</h3>
                        <p className="text-sm text-neutral-400">Apple Pay + Google Pay</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Enable Mobile Wallets
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryConfig.features.financing && (
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="h-8 w-8 text-purple-500" />
                        <div>
                          <h3 className="font-medium text-white">Financing Options</h3>
                          <p className="text-sm text-neutral-400">Affirm + GreenSky</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Setup Financing
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {industryConfig.features.split && (
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="h-8 w-8 text-orange-500" />
                        <div>
                          <h3 className="font-medium text-white">Split Payments</h3>
                          <p className="text-sm text-neutral-400">Multi-party billing</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Enable Split Pay
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="enterprise" className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-400 font-medium">Enterprise Features</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  Advanced payment processing, custom integrations, and dedicated support
                </p>
                <Button className="mt-3" size="sm">
                  Contact Sales
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}