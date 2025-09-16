/**
 * Payment Testing Dashboard
 * Comprehensive testing environments for all Thorbis verticals
 * 
 * Features: Multi-vertical test scenarios, Stripe test mode, real-time results
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
  TestTube,
  CreditCard,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  Shield,
  Globe,
  Smartphone,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface TestEnvironment {
  id: string;
  environment_name: string;
  vertical: string;
  status: string;
  test_scenario: string;
  test_data_size: string;
  payment_methods: string[];
  created_at: string;
  display_info: {
    vertical_name: string;
    scenario_name: string;
    status_display: string;
    data_size_display: string;
  };
  test_summary: {
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    total_amount_cents: number;
    success_rate: number;
  };
  available_actions: string[];
}

interface TestTransaction {
  amount_cents: number;
  payment_method: string;
  customer_info: {
    email: string;
    name: string;
  };
  metadata?: Record<string, string>;
  force_failure: boolean;
  failure_code?: string;
}

export default function PaymentTestingPage() {
  const [activeTab, setActiveTab] = useState('environments');
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<string>(');
  const [testResults, setTestResults] = useState<any[]>([]);

  // New environment form state
  const [newEnvironmentForm, setNewEnvironmentForm] = useState({
    environment_name: ',
    vertical: 'hs',
    test_scenario: 'basic_payments',
    test_data_size: 'medium',
    payment_methods: ['card_visa', 'card_mastercard', 'ach_debit'],
    include_failures: true,
    stripe_test_mode: true
  });

  // Test transaction form state
  const [transactionForm, setTransactionForm] = useState<TestTransaction>({
    amount_cents: 5000,
    payment_method: 'card_visa',
    customer_info: {
      email: 'test@example.com',
      name: 'Test Customer'
    },
    force_failure: false
  });

  const verticalIcons = {
    hs: Building2,
    auto: Car,
    rest: UtensilsCrossed,
    ret: ShoppingBag
  };

  useEffect(() => {
    loadTestEnvironments();
  }, [selectedVertical]);

  const loadTestEnvironments = async () => {
    try {
      const params = new URLSearchParams({
        organization_id: MOCK_ORG_ID,
        ...(selectedVertical && { vertical: selectedVertical })
      });

      const response = await fetch('/api/v1/testing/payment-environments?${params}');
      if (response.ok) {
        const result = await response.json();
        setEnvironments(result.data);
      }
    } catch (error) {
      console.error('Failed to load test environments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEnvironment = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/v1/testing/payment-environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          environment_config: newEnvironmentForm,
          payment_methods: newEnvironmentForm.payment_methods
        })
      });

      if (response.ok) {
        const result = await response.json();
        await loadTestEnvironments();
        // Reset form
        setNewEnvironmentForm({
          environment_name: ',
          vertical: 'hs',
          test_scenario: 'basic_payments',
          test_data_size: 'medium',
          payment_methods: ['card_visa', 'card_mastercard', 'ach_debit'],
          include_failures: true,
          stripe_test_mode: true
        });
      } else {
        console.error('Failed to create test environment');
      }
    } catch (error) {
      console.error('Error creating test environment:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteTransaction = async (environmentId: string) => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/v1/testing/payment-environments/transaction', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment_id: environmentId,
          transaction_data: transactionForm
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(prev => [result.data, ...prev]);
        await loadTestEnvironments(); // Refresh to update statistics
      } else {
        console.error('Failed to execute test transaction');
      }
    } catch (error) {
      console.error('Error executing test transaction:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800 hover:bg-green-200',
      initializing: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      paused: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      error: 'bg-red-100 text-red-800 hover:bg-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Payment Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test payment flows across all verticals with realistic scenarios and comprehensive data
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedVertical} onValueChange={setSelectedVertical}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Verticals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Verticals</SelectItem>
              <SelectItem value="hs">Home Services</SelectItem>
              <SelectItem value="auto">Auto Services</SelectItem>
              <SelectItem value="rest">Restaurant</SelectItem>
              <SelectItem value="ret">Retail</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <TestTube className="w-4 h-4 mr-2" />
                New Test Environment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Test Environment</DialogTitle>
                <DialogDescription>
                  Set up a new payment testing environment with realistic data for your vertical
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="environment-name">Environment Name</Label>
                    <Input
                      id="environment-name"
                      placeholder="e.g., HS Production Test"
                      value={newEnvironmentForm.environment_name}
                      onChange={(e) => setNewEnvironmentForm(prev => ({ 
                        ...prev, 
                        environment_name: e.target.value 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vertical">Vertical</Label>
                    <Select value={newEnvironmentForm.vertical} onValueChange={(value) => 
                      setNewEnvironmentForm(prev => ({ ...prev, vertical: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hs">Home Services</SelectItem>
                        <SelectItem value="auto">Auto Services</SelectItem>
                        <SelectItem value="rest">Restaurant</SelectItem>
                        <SelectItem value="ret">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test-scenario">Test Scenario</Label>
                    <Select value={newEnvironmentForm.test_scenario} onValueChange={(value) => 
                      setNewEnvironmentForm(prev => ({ ...prev, test_scenario: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic_payments">Basic Payment Processing</SelectItem>
                        <SelectItem value="subscription_billing">Subscription Billing</SelectItem>
                        <SelectItem value="marketplace_transactions">Marketplace Transactions</SelectItem>
                        <SelectItem value="high_volume_testing">High Volume Testing</SelectItem>
                        <SelectItem value="failure_testing">Failure & Edge Cases</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data-size">Test Data Size</Label>
                    <Select value={newEnvironmentForm.test_data_size} onValueChange={(value) => 
                      setNewEnvironmentForm(prev => ({ ...prev, test_data_size: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (10 customers, 50 transactions)</SelectItem>
                        <SelectItem value="medium">Medium (50 customers, 200 transactions)</SelectItem>
                        <SelectItem value="large">Large (200 customers, 1000 transactions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Payment Methods (Select multiple)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 'card_visa', label: 'Visa' },
                      { value: 'card_mastercard', label: 'Mastercard' },
                      { value: 'card_amex', label: 'American Express' },
                      { value: 'ach_debit', label: 'ACH Debit' },
                      { value: 'apple_pay', label: 'Apple Pay' },
                      { value: 'google_pay', label: 'Google Pay' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newEnvironmentForm.payment_methods.includes(method.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEnvironmentForm(prev => ({
                                ...prev,
                                payment_methods: [...prev.payment_methods, method.value]
                              }));
                            } else {
                              setNewEnvironmentForm(prev => ({
                                ...prev,
                                payment_methods: prev.payment_methods.filter(m => m !== method.value)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEnvironmentForm.include_failures}
                      onChange={(e) => setNewEnvironmentForm(prev => ({
                        ...prev,
                        include_failures: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include failure scenarios</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEnvironmentForm.stripe_test_mode}
                      onChange={(e) => setNewEnvironmentForm(prev => ({
                        ...prev,
                        stripe_test_mode: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Stripe test mode</span>
                  </label>
                </div>

                <Button 
                  onClick={handleCreateEnvironment}
                  disabled={isCreating || !newEnvironmentForm.environment_name}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Environment...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Create Test Environment
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environments">Test Environments</TabsTrigger>
          <TabsTrigger value="transactions">Execute Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="environments" className="space-y-6">
          {/* Environment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Active Environments</span>
                </div>
                <p className="text-2xl font-bold">
                  {environments.filter(env => env.status === 'active').length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready for testing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold">
                  {environments.reduce((sum, env) => sum + env.test_summary.total_transactions, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across all environments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Average Success Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {environments.length > 0 
                    ? (environments.reduce((sum, env) => sum + env.test_summary.success_rate, 0) / environments.length).toFixed(1)
                    : 0
                  }%
                </p>
                <p className="text-xs text-muted-foreground">
                  Test transaction success
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Verticals Covered</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Set(environments.map(env => env.vertical)).size}/4
                </p>
                <p className="text-xs text-muted-foreground">
                  Business verticals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Environments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading test environments...</p>
              </div>
            ) : environments.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Test Environments</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first test environment to start payment testing
                </p>
              </div>
            ) : (
              environments.map((environment) => {
                const VerticalIcon = verticalIcons[environment.vertical as keyof typeof verticalIcons];
                return (
                  <Card key={environment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <VerticalIcon className="w-5 h-5" />
                          <div>
                            <CardTitle className="text-lg">{environment.environment_name}</CardTitle>
                            <CardDescription>
                              {environment.display_info.vertical_name} • {environment.display_info.scenario_name}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(environment.status)}>
                          {environment.display_info.status_display}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-blue-600">
                            {environment.test_summary.total_transactions}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Tests</p>
                        </div>
                        <div>
                          <p className={'text-lg font-semibold ${getSuccessRateColor(environment.test_summary.success_rate)}'}>
                            {environment.test_summary.success_rate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(environment.test_summary.total_amount_cents)}
                          </p>
                          <p className="text-xs text-muted-foreground">Volume</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Payment Methods:</span>
                          <span>{environment.payment_methods.length} configured</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Data Size:</span>
                          <span className="capitalize">{environment.test_data_size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Created:</span>
                          <span>{new Date(environment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {environment.available_actions.includes('execute_transaction') && (
                          <Button 
                            size="sm" 
                            onClick={() => handleExecuteTransaction(environment.id)}
                            disabled={isExecuting}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run Test
                          </Button>
                        )}
                        {environment.available_actions.includes('view_results') && (
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Results
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execute Test Transaction</CardTitle>
              <CardDescription>
                Run individual test transactions against your payment environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-environment">Test Environment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.filter(env => env.status === 'active').map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                          {env.environment_name} ({env.display_info.vertical_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={transactionForm.payment_method} onValueChange={(value) => 
                    setTransactionForm(prev => ({ ...prev, payment_method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card_visa">Visa Test Card</SelectItem>
                      <SelectItem value="card_mastercard">Mastercard Test Card</SelectItem>
                      <SelectItem value="card_amex">Amex Test Card</SelectItem>
                      <SelectItem value="ach_debit">ACH Debit</SelectItem>
                      <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (in cents)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transactionForm.amount_cents}
                    onChange={(e) => setTransactionForm(prev => ({ 
                      ...prev, 
                      amount_cents: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <Input
                    id="customer-name"
                    value={transactionForm.customer_info.name}
                    onChange={(e) => setTransactionForm(prev => ({ 
                      ...prev, 
                      customer_info: { ...prev.customer_info, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Customer Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={transactionForm.customer_info.email}
                    onChange={(e) => setTransactionForm(prev => ({ 
                      ...prev, 
                      customer_info: { ...prev.customer_info, email: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={transactionForm.force_failure}
                    onChange={(e) => setTransactionForm(prev => ({
                      ...prev,
                      force_failure: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Force transaction failure</span>
                </label>
              </div>

              <Button 
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Test Transaction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>
                Latest payment test transaction results across all environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Test Results</h3>
                  <p className="text-muted-foreground">
                    Execute some test transactions to see results here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.status === 'succeeded' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {formatCurrency(result.amount_cents)} • {result.payment_method}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.status === 'succeeded` 
                              ? `Processed in ${result.processing_time_ms}ms'
                              : 'Failed: ${result.failure_code}'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={result.status === 'succeeded' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }>
                          {result.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {result.transaction_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Vertical</CardTitle>
                <CardDescription>Payment success rates across business verticals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['hs', 'auto', 'rest', 'ret'].map((vertical) => {
                    const verticalEnvs = environments.filter(env => env.vertical === vertical);
                    const avgSuccessRate = verticalEnvs.length > 0 
                      ? verticalEnvs.reduce((sum, env) => sum + env.test_summary.success_rate, 0) / verticalEnvs.length
                      : 0;
                    const VerticalIcon = verticalIcons[vertical as keyof typeof verticalIcons];
                    
                    return (
                      <div key={vertical} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <VerticalIcon className="w-4 h-4" />
                          <span className="capitalize">
                            {vertical === 'hs' ? 'Home Services' :
                             vertical === 'auto' ? 'Auto Services' :
                             vertical === 'rest' ? 'Restaurant' : 'Retail'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: '${avgSuccessRate}%' }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {avgSuccessRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
                <CardDescription>Success rates by payment method type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: 'card_visa', name: 'Visa Cards', rate: 96.5 },
                    { method: 'card_mastercard', name: 'Mastercard', rate: 95.8 },
                    { method: 'ach_debit', name: 'ACH Debit', rate: 89.2 },
                    { method: 'apple_pay', name: 'Apple Pay', rate: 98.1 }
                  ].map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{method.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: '${method.rate}%' }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">
                          {method.rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}