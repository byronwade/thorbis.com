/**
 * Billing Dashboard Component
 * Main dashboard combining all billing components
 * Dark-first design with comprehensive billing management
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Import billing components
import BillingOverviewCard from './billing-overview-card';
import UsageAnalyticsChart from './usage-analytics-chart';
import SubscriptionManagementPanel from './subscription-management-panel';
import PaymentMethodManager from './payment-method-manager';
import InvoiceHistoryTable from './invoice-history-table';

interface BillingDashboardProps {
  organizationId: string;
  organizationName: string;
  onNavigateToUpgrade?: () => void;
  onContactSupport?: () => void;
}

// Mock data interfaces - these would come from your API
interface BillingData {
  overview: {
    currentPlan: {
      name: string;
      tier: 'basic' | 'pro' | 'enterprise';
      price: number;
      currency: string;
      billingInterval: 'monthly' | 'yearly';
    };
    subscription: {
      status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended';
      currentPeriodEnd: Date;
      trialEnd?: Date;
    };
    usage: {
      apiCalls: { current: number; quota: number; overage: number; };
      dataExports: { current: number; quota: number; };
      aiRequests: { current: number; quota: number; };
    };
    costs: {
      subscriptionFee: number;
      overageFee: number;
      totalEstimated: number;
    };
  };
  analytics: {
    data: Array<{
      date: string;
      apiCalls: number;
      dataExports: number;
      aiRequests: number;
      cost: number;
    }>;
    totalUsage: {
      apiCalls: number;
      dataExports: number;
      aiRequests: number;
      totalCost: number;
    };
    trend: {
      apiCalls: number;
      cost: number;
    };
  };
  plans: Array<{
    id: string;
    name: string;
    tier: 'basic' | 'pro' | 'enterprise';
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    apiQuota: number;
    features: string[];
    isPopular?: boolean;
    isCurrentPlan?: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'bank_account';
    brand?: string;
    last4: string;
    expMonth?: number;
    expYear?: number;
    isDefault: boolean;
    billingDetails?: any;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
    amount: number;
    currency: string;
    issueDate: Date;
    dueDate?: Date;
    paidAt?: Date;
    description?: string;
    downloadUrl?: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      amount: number;
    }>;
  }>;
}

export function BillingDashboard({
  organizationId,
  organizationName,
  onNavigateToUpgrade,
  onContactSupport,
}: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real API calls
  const [billingData] = useState<BillingData>({
    overview: {
      currentPlan: {
        name: 'Professional Monthly',
        tier: 'pro',
        price: 15000, // $150.00
        currency: 'USD',
        billingInterval: 'monthly',
      },
      subscription: {
        status: 'active',
        currentPeriodEnd: new Date('2025-02-28'),
        trialEnd: undefined,
      },
      usage: {
        apiCalls: { current: 3450, quota: 5000, overage: 0 },
        dataExports: { current: 12, quota: 100 },
        aiRequests: { current: 89, quota: 200 },
      },
      costs: {
        subscriptionFee: 15000, // $150.00
        overageFee: 0,
        totalEstimated: 15000, // $150.00
      },
    },
    analytics: {
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        apiCalls: Math.floor(Math.random() * 200) + 50,
        dataExports: Math.floor(Math.random() * 5),
        aiRequests: Math.floor(Math.random() * 10) + 2,
        cost: Math.floor(Math.random() * 100) + 50,
      })),
      totalUsage: {
        apiCalls: 3450,
        dataExports: 12,
        aiRequests: 89,
        totalCost: 15000,
      },
      trend: {
        apiCalls: 12, // 12% increase
        cost: 8, // 8% increase
      },
    },
    plans: [
      {
        id: 'basic',
        name: 'Basic Monthly',
        tier: 'basic',
        description: 'Perfect for small businesses getting started',
        monthlyPrice: 5000, // $50.00
        yearlyPrice: 48000, // $480.00 (20% discount)
        apiQuota: 1000,
        features: [
          '1,000 API calls per month',
          'Basic analytics',
          'Email support',
          'Standard integrations',
        ],
      },
      {
        id: 'pro',
        name: 'Professional Monthly',
        tier: 'pro',
        description: 'Advanced features for growing businesses',
        monthlyPrice: 15000, // $150.00
        yearlyPrice: 144000, // $1,440.00 (20% discount)
        apiQuota: 5000,
        features: [
          '5,000 API calls per month',
          'Advanced analytics & reporting',
          'Priority email & chat support',
          'All integrations',
          'Custom webhooks',
          'Team collaboration tools',
        ],
        isPopular: true,
        isCurrentPlan: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise Monthly',
        tier: 'enterprise',
        description: 'Enterprise-grade features and support',
        monthlyPrice: 50000, // $500.00
        yearlyPrice: 480000, // $4,800.00 (20% discount)
        apiQuota: 20000,
        features: [
          '20,000 API calls per month',
          'Custom analytics dashboards',
          '24/7 phone & dedicated support',
          'Custom integrations',
          'Advanced security features',
          'SLA guarantees',
          'Dedicated account manager',
        ],
      },
    ],
    paymentMethods: [
      {
        id: 'pm_1234567890',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2026,
        isDefault: true,
        billingDetails: {
          name: 'John Doe',
          email: 'billing@company.com',
          address: {
            line1: '123 Business St',
            city: 'Denver',
            state: 'CO',
            postal_code: '80202',
            country: 'US',
          },
        },
      },
    ],
    invoices: [
      {
        id: 'inv_001',
        invoiceNumber: 'INV-2025-01-001',
        status: 'paid',
        amount: 15000,
        currency: 'USD',
        issueDate: new Date('2025-01-01'),
        paidAt: new Date('2025-01-03'),
        description: 'Professional Monthly Subscription',
        downloadUrl: '/invoices/inv_001.pdf',
        lineItems: [
          {
            description: 'Professional Monthly Plan',
            quantity: 1,
            amount: 15000,
          },
        ],
      },
      {
        id: 'inv_002',
        invoiceNumber: 'INV-2024-12-001',
        status: 'paid',
        amount: 15250,
        currency: 'USD',
        issueDate: new Date('2024-12-01'),
        paidAt: new Date('2024-12-02'),
        description: 'Professional Monthly + Overage',
        downloadUrl: '/invoices/inv_002.pdf',
        lineItems: [
          {
            description: 'Professional Monthly Plan',
            quantity: 1,
            amount: 15000,
          },
          {
            description: 'API Overage (250 calls)',
            quantity: 250,
            amount: 250,
          },
        ],
      },
    ],
  });

  // Calculate usage alerts
  const usageAlerts = [];
  const { apiCalls } = billingData.overview.usage;
  
  if (apiCalls.current / apiCalls.quota > 0.8) {
    usageAlerts.push({
      type: 'warning',
      message: `You've used ${Math.round((apiCalls.current / apiCalls.quota) * 100)}% of your API quota`,
      action: 'Consider upgrading your plan',
    });
  }
  
  if (apiCalls.overage > 0) {
    usageAlerts.push({
      type: 'error',
      message: `You have ${apiCalls.overage} API calls over your quota`,
      action: 'Upgrade to avoid overage charges',
    });
  }

  return (
    <div className="space-y-6 p-6 bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100">
            Billing & Subscription
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage your subscription, usage, and billing settings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {usageAlerts.length > 0 && (
            <Button 
              variant="outline"
              onClick={onNavigateToUpgrade}
              className="border-orange-600 text-orange-400 hover:bg-orange-900/20"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Usage Alert ({usageAlerts.length})
            </Button>
          )}
          
          <Button 
            onClick={onContactSupport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Contact Support
          </Button>
        </div>
      </div>

      {/* Usage Alerts */}
      {usageAlerts.length > 0 && (
        <div className="space-y-3">
          {usageAlerts.map((alert, index) => (
            <Card key={index} className={`border ${
              alert.type === 'error' 
                ? 'border-red-600 bg-red-900/20' 
                : 'border-orange-600 bg-orange-900/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.type === 'error' ? 'text-red-400' : 'text-orange-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        alert.type === 'error' ? 'text-red-300' : 'text-orange-300'
                      }`}>
                        {alert.message}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {alert.action}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={onNavigateToUpgrade}
                    className={`${
                      alert.type === 'error' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    } text-white`}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BillingOverviewCard
            organizationName={organizationName}
            currentPlan={billingData.overview.currentPlan}
            subscription={billingData.overview.subscription}
            usage={billingData.overview.usage}
            costs={billingData.overview.costs}
            onManageSubscription={() => setActiveTab('subscription')}
            onViewUsageDetails={() => setActiveTab('usage')}
          />
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-100">
                      ${(billingData.overview.costs.totalEstimated / 100).toFixed(0)}
                    </div>
                    <div className="text-sm text-neutral-400">This Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-600">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-100">
                      {billingData.overview.usage.apiCalls.current.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-400">API Calls</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">
                      +{billingData.analytics.trend.apiCalls}%
                    </div>
                    <div className="text-sm text-neutral-400">Usage Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-600">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-100">
                      {Math.ceil((billingData.overview.subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-neutral-400">Days Left</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageAnalyticsChart
            data={billingData.analytics.data}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            currentQuota={billingData.overview.usage.apiCalls.quota}
            totalUsage={billingData.analytics.totalUsage}
            trend={billingData.analytics.trend}
          />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManagementPanel
            currentPlan={billingData.plans.find(p => p.isCurrentPlan)!}
            availablePlans={billingData.plans}
            billingInterval={billingInterval}
            onBillingIntervalChange={setBillingInterval}
            onPlanSelect={(planId) => {
              console.log('Selected plan:', planId);
              // Handle plan selection
            }}
            onManagePayment={() => setActiveTab('payments')}
            nextBillingDate={billingData.overview.subscription.currentPeriodEnd}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentMethodManager
            paymentMethods={billingData.paymentMethods}
            onAddPaymentMethod={() => {
              console.log('Add payment method');
              // Handle adding payment method
            }}
            onSetDefault={(paymentMethodId) => {
              console.log('Set default payment method:', paymentMethodId);
              // Handle setting default payment method
            }}
            onRemovePaymentMethod={(paymentMethodId) => {
              console.log('Remove payment method:', paymentMethodId);
              // Handle removing payment method
            }}
            onUpdateBilling={() => {
              console.log('Update billing information');
              // Handle updating billing info
            }}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <InvoiceHistoryTable
            invoices={billingData.invoices}
            onDownloadInvoice={(invoiceId) => {
              console.log('Download invoice:', invoiceId);
              // Handle invoice download
            }}
            onViewInvoice={(invoiceId) => {
              console.log('View invoice:', invoiceId);
              // Handle invoice view
            }}
            onPayInvoice={(invoiceId) => {
              console.log('Pay invoice:', invoiceId);
              // Handle invoice payment
            }}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BillingDashboard;