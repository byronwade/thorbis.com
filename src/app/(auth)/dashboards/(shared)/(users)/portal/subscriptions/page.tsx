/**
 * Customer Subscription Management Portal
 * Comprehensive subscription management for customers across all Thorbis verticals
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  CreditCard, 
  Settings, 
  Pause, 
  Play, 
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  AlertTriangle,
  Receipt,
  Users,
  Wrench,
  Car,
  Utensils,
  ShoppingCart,
  Repeat,
  TrendingUp,
  Info
} from 'lucide-react';

// Mock data - replace with real API calls
const mockSubscriptions = [
  {
    id: '1',
    organization: { name: 'Wade\'s Plumbing Services', industry: 'hs' },
    subscription_plan: { 
      name: 'Monthly Maintenance Plan', 
      description: 'Regular plumbing maintenance and priority service',
      service_type: 'maintenance',
      service_category: 'plumbing'
    },
    status: 'active',
    billing_cycle: 'monthly',
    base_amount_cents: 9900,
    currency: 'USD',
    next_billing_date: '2024-02-20',
    current_period_start: '2024-01-20',
    current_period_end: '2024-02-20',
    trial_end: null,
    service_details: {
      service_frequency: 'Monthly inspection and maintenance',
      service_location: {
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postal_code: '12345'
      },
      special_instructions: 'Check kitchen sink disposal monthly'
    },
    contract_details: {
      auto_renewal: true,
      cancellation_policy: 'end_of_period'
    },
    display_info: {
      formatted_amount: '$99.00',
      status_display: 'Active',
      next_billing_formatted: 'Feb 20, 2024',
      days_until_renewal: 15,
      is_trial: false,
      payment_method_display: 'VISA ****1234'
    },
    metrics: {
      total_paid_cents: 29700,
      months_active: 3,
      upcoming_invoice: {
        amount_cents: 9900,
        due_date: '2024-02-20',
        formatted_amount: '$99.00'
      }
    }
  },
  {
    id: '2',
    organization: { name: 'Mike\'s Auto Repair', industry: 'auto' },
    subscription_plan: { 
      name: 'Vehicle Maintenance Package', 
      description: 'Quarterly vehicle inspections and tune-ups',
      service_type: 'maintenance',
      service_category: 'automotive'
    },
    status: 'paused',
    billing_cycle: 'quarterly',
    base_amount_cents: 24900,
    currency: 'USD',
    next_billing_date: '2024-03-15',
    current_period_start: '2024-01-15',
    current_period_end: '2024-04-15',
    trial_end: null,
    service_details: {
      service_frequency: 'Quarterly maintenance check',
      service_location: {
        address: '456 Oak Ave',
        city: 'Anytown',
        state: 'CA',
        postal_code: '12345'
      },
      special_instructions: 'Focus on brake system and oil changes'
    },
    contract_details: {
      auto_renewal: true,
      cancellation_policy: 'end_of_period'
    },
    display_info: {
      formatted_amount: '$249.00',
      status_display: 'Paused',
      next_billing_formatted: 'Mar 15, 2024',
      days_until_renewal: 45,
      is_trial: false,
      payment_method_display: 'MASTERCARD ****5678'
    },
    metrics: {
      total_paid_cents: 49800,
      months_active: 6,
      upcoming_invoice: null
    }
  }
];

const getIndustryIcon = (industry: string) => {
  switch (industry) {
    case 'hs': return <Wrench className="w-4 h-4" />;
    case 'auto': return <Car className="w-4 h-4" />;
    case 'rest': return <Utensils className="w-4 h-4" />;
    case 'ret': return <ShoppingCart className="w-4 h-4" />;
    default: return <Users className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'trialing': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'canceled': return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'past_due': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export default function CustomerSubscriptionPortal() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [selectedSubscription, setSelectedSubscription] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Subscription action handler
  const handleSubscriptionAction = async (subscriptionId: string, action: string, reason?: string) => {
    setActionInProgress(true);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update subscription status in mock data
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { 
                ...sub, 
                status: action === 'pause' ? 'paused' : 
                        action === 'resume' ? 'active' : 
                        action === 'cancel' ? 'canceled' : sub.status,
                display_info: {
                  ...sub.display_info,
                  status_display: action === 'pause' ? 'Paused' : 
                                  action === 'resume' ? 'Active' : 
                                  action === 'cancel' ? 'Canceled' : sub.display_info.status_display
                }
              }
            : sub
        )
      );
      
      if (selectedSubscription?.id === subscriptionId) {
        setSelectedSubscription((prev: unknown) => ({
          ...prev,
          status: action === 'pause' ? 'paused' : 
                  action === 'resume' ? 'active' : 
                  action === 'cancel' ? 'canceled' : prev.status
        }));
      }
      
    } catch (error) {
      console.error('Failed to update subscription:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your recurring services and billing across all Thorbis providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            {subscriptions.filter(s => s.status === 'active').length} Active
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">
                  ${subscriptions
                    .filter(s => s.status === 'active')
                    .reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.base_amount_cents / 100 : 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Renewal</p>
                <p className="text-2xl font-bold">
                  {Math.min(...subscriptions
                    .filter(s => s.status === 'active')
                    .map(s => s.display_info.days_until_renewal))}d
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">
                  ${subscriptions
                    .reduce((sum, s) => sum + s.metrics.total_paid_cents / 100, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Your Subscriptions</h2>
          
          {subscriptions.map((subscription) => (
            <Card 
              key={subscription.id}
              className={'cursor-pointer transition-all ${
                selectedSubscription?.id === subscription.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:shadow-md'
              }'}
              onClick={() => setSelectedSubscription(subscription)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIndustryIcon(subscription.organization.industry)}
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.display_info.status_display}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold">
                    {subscription.display_info.formatted_amount}
                  </span>
                </div>
                
                <h3 className="font-medium mb-1">{subscription.subscription_plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {subscription.organization.name}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Next: {subscription.display_info.next_billing_formatted}</span>
                  <span>{subscription.display_info.days_until_renewal} days</span>
                </div>
                
                {subscription.status === 'active' && subscription.display_info.days_until_renewal <= 7 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="w-3 h-3" />
                      <span>Renewal due soon</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Details */}
        <div className="lg:col-span-2">
          {selectedSubscription ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getIndustryIcon(selectedSubscription.organization.industry)}
                          {selectedSubscription.subscription_plan.name}
                        </CardTitle>
                        <CardDescription>{selectedSubscription.organization.name}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(selectedSubscription.status)}>
                        {selectedSubscription.display_info.status_display}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">Billing Amount</Label>
                        <p className="text-2xl font-bold">{selectedSubscription.display_info.formatted_amount}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedSubscription.billing_cycle.replace('_', ' ')} billing
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Next Billing Date</Label>
                        <p className="text-lg font-semibold">{selectedSubscription.display_info.next_billing_formatted}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSubscription.display_info.days_until_renewal} days away
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">Total Paid</Label>
                        <p className="text-lg font-semibold">
                          ${(selectedSubscription.metrics.total_paid_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Over {selectedSubscription.metrics.months_active} months
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <p className="text-lg font-semibold">{selectedSubscription.display_info.payment_method_display}</p>
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Update payment method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedSubscription.metrics.upcoming_invoice && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your next invoice of {selectedSubscription.metrics.upcoming_invoice.formatted_amount} will be processed on{' '}
                      {new Date(selectedSubscription.metrics.upcoming_invoice.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Manage billing preferences and view invoice history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing-cycle">Billing Cycle</Label>
                        <Select value={selectedSubscription.billing_cycle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Auto-Renewal</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch 
                            checked={selectedSubscription.contract_details.auto_renewal}
                            aria-label="Auto-renewal toggle"
                          />
                          <span className="text-sm">
                            {selectedSubscription.contract_details.auto_renewal ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Cancellation Policy</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedSubscription.contract_details.cancellation_policy === 'end_of_period' 
                          ? 'Cancel at end of billing period' 
                          : 'Immediate cancellation'}
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        View Invoice History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="service" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>Service location and frequency information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Service Location
                      </Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">{selectedSubscription.service_details.service_location.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSubscription.service_details.service_location.city}, {selectedSubscription.service_details.service_location.state} {selectedSubscription.service_details.service_location.postal_code}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Service Frequency</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedSubscription.service_details.service_frequency}
                      </p>
                    </div>

                    {selectedSubscription.service_details.special_instructions && (
                      <div>
                        <Label>Special Instructions</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedSubscription.service_details.special_instructions}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Actions</CardTitle>
                    <CardDescription>Manage your subscription status and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedSubscription.status === 'active' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Pause Subscription</h4>
                            <p className="text-sm text-muted-foreground">Temporarily pause billing and services</p>
                          </div>
                          <Button 
                            variant="outline"
                            disabled={actionInProgress}
                            onClick={() => handleSubscriptionAction(selectedSubscription.id, 'pause')}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50/50">
                          <div>
                            <h4 className="font-medium text-red-900">Cancel Subscription</h4>
                            <p className="text-sm text-red-600">Cancel at end of billing period</p>
                          </div>
                          <Button 
                            variant="destructive"
                            disabled={actionInProgress}
                            onClick={() => handleSubscriptionAction(selectedSubscription.id, 'cancel')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedSubscription.status === 'paused' && (
                      <div className="flex items-center justify-between p-4 border rounded-lg border-green-200 bg-green-50/50">
                        <div>
                          <h4 className="font-medium text-green-900">Resume Subscription</h4>
                          <p className="text-sm text-green-600">Reactivate billing and services</p>
                        </div>
                        <Button 
                          variant="default"
                          disabled={actionInProgress}
                          onClick={() => handleSubscriptionAction(selectedSubscription.id, 'resume')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    )}

                    {selectedSubscription.status === 'canceled' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This subscription has been canceled. Services will end on{' '}
                          {new Date(selectedSubscription.current_period_end).toLocaleDateString()}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {actionInProgress && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          Processing action...
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Subscription</h3>
                <p className="text-muted-foreground">
                  Choose a subscription from the list to view details and manage settings
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}