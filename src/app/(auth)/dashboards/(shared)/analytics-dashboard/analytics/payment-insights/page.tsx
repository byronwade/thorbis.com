/**
 * Payment Analytics & Fraud Monitoring Dashboard
 * Advanced analytics, fraud detection, and payment intelligence
 * 
 * Features: Real-time analytics, fraud monitoring, performance optimization, predictive insights
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Activity,
  Target,
  Zap,
  Eye,
  RefreshCw,
  Settings,
  Brain,
  Lock,
  Globe,
  Clock,
  Users,
  CreditCard,
  AlertCircle,
  PieChart,
  LineChart,
  Filter,
  Download,
  Bell,
  Search,
  Calendar,
  MapPin,
  Smartphone,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Info
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface PaymentAnalytics {
  payment_volume_analytics: {
    total_transactions: number;
    total_amount_cents: number;
    transaction_growth_percent: number;
    amount_growth_percent: number;
    daily_averages: {
      transactions_per_day: number;
      amount_per_day_cents: number;
      peak_day: string;
      lowest_day: string;
    };
    hourly_distribution: Array<{
      hour: number;
      transaction_count: number;
      success_rate: number;
      average_amount_cents: number;
    }>;
  };
  success_rate_analytics: {
    overall_success_rate: number;
    success_rates_by_method: Array<{
      method: string;
      success_rate: number;
      volume_percent: number;
    }>;
    failure_analysis: {
      top_failure_reasons: Array<{
        reason: string;
        count: number;
        percent: number;
      }>;
    };
  };
  fraud_detection_summary: {
    fraud_detection_rate: number;
    blocked_fraudulent_amount_cents: number;
    false_positive_rate: number;
    fraud_types_detected: Array<{
      type: string;
      cases_detected: number;
      amount_blocked_cents: number;
      accuracy_rate: number;
    }>;
  };
  alerts_and_notifications: Array<{
    alert_id: string;
    type: string;
    severity: string;
    message: string;
    created_at: string;
  }>;
}

interface FraudAlert {
  id: string;
  risk_score: number;
  transaction_id: string;
  amount_cents: number;
  customer_id: string;
  risk_factors: string[];
  status: string;
  created_at: string;
}

export default function PaymentAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30d');
  const [selectedVertical, setSelectedVertical] = useState('all');

  const verticalIcons = {
    hs: Building2,
    auto: Car,
    rest: UtensilsCrossed,
    ret: ShoppingBag
  };

  useEffect(() => {
    loadAnalytics();
    loadFraudAlerts();
  }, [dateRange, selectedVertical]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        organization_id: MOCK_ORG_ID,
        vertical: selectedVertical,
        date_range: dateRange
      });

      const response = await fetch('/api/v1/analytics/payment-insights?${params}');
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFraudAlerts = async () => {
    // Mock fraud alerts data
    const mockAlerts: FraudAlert[] = [
      {
        id: 'alert_001',
        risk_score: 89,
        transaction_id: 'txn_suspicious_001',
        amount_cents: 89500,
        customer_id: 'cust_***masked***',
        risk_factors: ['velocity_anomaly', 'geographic_mismatch'],
        status: 'under_review',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'alert_002',
        risk_score: 76,
        transaction_id: 'txn_suspicious_002',
        amount_cents: 234000,
        customer_id: 'cust_***masked***',
        risk_factors: ['behavioral_deviation', 'new_device'],
        status: 'investigating',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setFraudAlerts(mockAlerts);
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Payment Analytics & Fraud Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Advanced analytics, fraud detection, and payment intelligence across all verticals
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_24h">Last 24 Hours</SelectItem>
              <SelectItem value="last_7d">Last 7 Days</SelectItem>
              <SelectItem value="last_30d">Last 30 Days</SelectItem>
              <SelectItem value="last_90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedVertical} onValueChange={setSelectedVertical}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verticals</SelectItem>
              <SelectItem value="hs">Home Services</SelectItem>
              <SelectItem value="auto">Auto Services</SelectItem>
              <SelectItem value="rest">Restaurant</SelectItem>
              <SelectItem value="ret">Retail</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Analytics</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold">{analytics ? formatNumber(analytics.payment_volume_analytics.total_transactions) : '0'}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  {analytics && getTrendIcon(analytics.payment_volume_analytics.transaction_growth_percent)}
                  <span className={analytics ? getTrendColor(analytics.payment_volume_analytics.transaction_growth_percent) : 'text-gray-600'}>
                    {analytics?.payment_volume_analytics.transaction_growth_percent.toFixed(1)}% vs last period
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Total Volume</span>
                </div>
                <p className="text-2xl font-bold">{analytics ? formatCurrency(analytics.payment_volume_analytics.total_amount_cents) : '$0'}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  {analytics && getTrendIcon(analytics.payment_volume_analytics.amount_growth_percent)}
                  <span className={analytics ? getTrendColor(analytics.payment_volume_analytics.amount_growth_percent) : 'text-gray-600'}>
                    {analytics?.payment_volume_analytics.amount_growth_percent.toFixed(1)}% vs last period
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.success_rate_analytics.overall_success_rate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Industry leading performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  <span className="text-sm font-medium">Fraud Blocked</span>
                </div>
                <p className="text-2xl font-bold">{analytics ? formatCurrency(analytics.fraud_detection_summary.blocked_fraudulent_amount_cents) : '$0'}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics?.fraud_detection_summary.fraud_detection_rate.toFixed(1)}% detection rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {analytics?.alerts_and_notifications && analytics.alerts_and_notifications.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {analytics.alerts_and_notifications.filter(a => a.severity === 'high').length} high-priority alerts require attention
                  </span>
                  <Button size="sm" variant="outline" className="ml-4">
                    View All Alerts
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Charts and Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transaction Volume Trends
                </CardTitle>
                <CardDescription>24-hour transaction patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.payment_volume_analytics.hourly_distribution.slice(0, 6).map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{hour.hour}:00</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-16">
                          {hour.transaction_count} txns
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: '${(hour.transaction_count / 150) * 100}%' }}
                          />
                        </div>
                        <span className="text-sm w-12">{hour.success_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method Performance
                </CardTitle>
                <CardDescription>Success rates by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.success_rate_analytics.success_rates_by_method.map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {method.method.replace('_', ' `)}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-16">
                          {method.volume_percent}% vol
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${method.success_rate}%' }}
                          />
                        </div>
                        <span className="text-sm w-12">{method.success_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Fraud Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Fraud Alerts
                </CardTitle>
                <CardDescription>High-risk transactions detected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fraudAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={'p-2 rounded-lg ${getRiskScoreColor(alert.risk_score)}'}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Risk Score: {alert.risk_score}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(alert.amount_cents)} • {alert.risk_factors.length} factors
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {alert.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Fraud Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Top Failure Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Failure Reasons
                </CardTitle>
                <CardDescription>Most common transaction failures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.success_rate_analytics.failure_analysis.top_failure_reasons.slice(0, 5).map((reason) => (
                    <div key={reason.reason} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {reason.reason.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-12">
                          {reason.count}
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: '${reason.percent}%' }}
                          />
                        </div>
                        <span className="text-sm w-12">{reason.percent.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Averages</CardTitle>
                <CardDescription>Average daily transaction metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Transactions per day:</span>
                  <span className="font-semibold">{analytics?.payment_volume_analytics.daily_averages.transactions_per_day}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average daily volume:</span>
                  <span className="font-semibold">{analytics ? formatCurrency(analytics.payment_volume_analytics.daily_averages.amount_per_day_cents) : '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak day:</span>
                  <span className="font-semibold">{analytics?.payment_volume_analytics.daily_averages.peak_day}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lowest day:</span>
                  <span className="font-semibold">{analytics?.payment_volume_analytics.daily_averages.lowest_day}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Size Distribution</CardTitle>
                <CardDescription>Breakdown by transaction amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '$0 - $50', percentage: 45.2, count: 11089 },
                    { range: '$50 - $200', percentage: 32.7, count: 8025 },
                    { range: '$200 - $500', percentage: 15.8, count: 3879 },
                    { range: '$500 - $1,000', percentage: 4.6, count: 1130 },
                    { range: '$1,000+', percentage: 1.7, count: 418 }
                  ].map((bucket) => (
                    <div key={bucket.range} className="flex items-center justify-between">
                      <span className="text-sm">{bucket.range}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-16">
                          {bucket.count.toLocaleString()}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: '${bucket.percentage}%' }}
                          />
                        </div>
                        <span className="text-sm w-8">{bucket.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Times</CardTitle>
                <CardDescription>Average processing duration by method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: 'Card Payments', time_ms: 1250, status: 'excellent' },
                    { method: 'Apple Pay', time_ms: 890, status: 'excellent' },
                    { method: 'Google Pay', time_ms: 920, status: 'excellent' },
                    { method: 'ACH Transfers', time_ms: 2340, status: 'good' },
                    { method: 'Bank Transfers', time_ms: 3456, status: 'fair' }
                  ].map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <span className="text-sm">{method.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{method.time_ms}ms</span>
                        <Badge 
                          variant="outline" 
                          className={
                            method.status === 'excellent' ? 'text-green-600 border-green-200' :
                            method.status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }
                        >
                          {method.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  ML Model Performance
                </CardTitle>
                <CardDescription>Machine learning fraud detection accuracy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">94.7%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">91.2%</p>
                    <p className="text-sm text-muted-foreground">Precision</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">88.9%</p>
                    <p className="text-sm text-muted-foreground">Recall</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">0.8%</p>
                    <p className="text-sm text-muted-foreground">False Positive</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <h4 className="font-medium">Feature Importance</h4>
                  {[
                    { feature: 'Transaction Velocity', importance: 0.24 },
                    { feature: 'Amount Deviation', importance: 0.19 },
                    { feature: 'Geographic Consistency', importance: 0.17 },
                    { feature: 'Payment Method Risk', importance: 0.15 },
                    { feature: 'Customer History', importance: 0.13 },
                    { feature: 'Time Pattern', importance: 0.12 }
                  ].map((feature) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: '${feature.importance * 100}%' }}
                          />
                        </div>
                        <span className="text-sm w-8">{(feature.importance * 100).toFixed(0)}%</span>
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
                  Active Fraud Patterns
                </CardTitle>
                <CardDescription>Currently detected fraud patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    pattern: 'Velocity Attack',
                    risk: 'high',
                    instances: 23,
                    blocked_amount: 234567,
                    confidence: 94.2
                  },
                  {
                    pattern: 'Geographic Anomaly',
                    risk: 'medium',
                    instances: 12,
                    blocked_amount: 89034,
                    confidence: 87.6
                  },
                  {
                    pattern: 'Card Testing',
                    risk: 'high',
                    instances: 45,
                    blocked_amount: 4560,
                    confidence: 96.8
                  }
                ].map((pattern) => (
                  <div key={pattern.pattern} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pattern.pattern}</span>
                      <Badge className={
                        pattern.risk === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        pattern.risk === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        'bg-green-100 text-green-800 hover:bg-green-200'
                      }>
                        {pattern.risk} risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Instances</p>
                        <p className="font-semibold">{pattern.instances}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Blocked</p>
                        <p className="font-semibold">{formatCurrency(pattern.blocked_amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{pattern.confidence}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Fraud Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>High-Risk Transaction Alerts</CardTitle>
              <CardDescription>Transactions requiring manual review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={'p-3 rounded-lg ${getRiskScoreColor(alert.risk_score)}'}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Risk Score: {alert.risk_score}</p>
                        <p className="text-sm text-muted-foreground">
                          Transaction: {alert.transaction_id} • {formatCurrency(alert.amount_cents)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {alert.risk_factors.map((factor) => (
                            <Badge key={factor} variant="outline" className="text-xs">
                              {factor.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Investigate
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trends</CardTitle>
                <CardDescription>Payment success rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { period: 'This Week', rate: 96.8, change: 0.3 },
                    { period: 'Last Week', rate: 96.5, change: -0.2 },
                    { period: 'This Month', rate: 96.7, change: 0.5 },
                    { period: 'Last Month', rate: 96.2, change: 1.2 }
                  ].map((metric) => (
                    <div key={metric.period} className="flex items-center justify-between">
                      <span className="text-sm">{metric.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{metric.rate}%</span>
                        <div className={'flex items-center ${getTrendColor(metric.change)}'}>
                          {getTrendIcon(metric.change)}
                          <span className="text-xs">{Math.abs(metric.change)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
                <CardDescription>Transaction processing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Processing Time:</span>
                    <span className="font-semibold">1.24s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P95 Processing Time:</span>
                    <span className="font-semibold">3.45s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P99 Processing Time:</span>
                    <span className="font-semibold">8.92s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeout Rate:</span>
                    <span className="font-semibold">0.12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>Types of payment errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Card Declined', percentage: 45.2 },
                    { type: 'Insufficient Funds', percentage: 32.1 },
                    { type: 'Expired Card', percentage: 12.8 },
                    { type: 'Processing Error', percentage: 6.7 },
                    { type: 'Other', percentage: 3.2 }
                  ].map((error) => (
                    <div key={error.type} className="flex items-center justify-between">
                      <span className="text-sm">{error.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: '${error.percentage}%' }}
                          />
                        </div>
                        <span className="text-sm">{error.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Payment behavior segmentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      segment: 'High Value Frequent',
                      customers: 892,
                      avg_transaction: 125000,
                      frequency: 8.2,
                      churn_risk: 'low'
                    },
                    {
                      segment: 'Moderate Regular',
                      customers: 3456,
                      avg_transaction: 67500,
                      frequency: 3.1,
                      churn_risk: 'medium'
                    },
                    {
                      segment: 'Low Value Occasional',
                      customers: 4586,
                      avg_transaction: 28900,
                      frequency: 1.2,
                      churn_risk: 'high'
                    }
                  ].map((segment) => (
                    <div key={segment.segment} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{segment.segment}</span>
                        <Badge className={
                          segment.churn_risk === 'low' ? 'bg-green-100 text-green-800' :
                          segment.churn_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {segment.churn_risk} risk
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Customers</p>
                          <p className="font-semibold">{segment.customers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Transaction</p>
                          <p className="font-semibold">{formatCurrency(segment.avg_transaction)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly Frequency</p>
                          <p className="font-semibold">{segment.frequency}×</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Preferences</CardTitle>
                <CardDescription>Customer payment method preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: 'Saved Cards', usage: 58.3, satisfaction: 9.1 },
                    { method: 'Apple Pay', usage: 22.1, satisfaction: 9.4 },
                    { method: 'New Cards', usage: 15.6, satisfaction: 7.8 },
                    { method: 'Bank Transfer', usage: 4.0, satisfaction: 8.2 }
                  ].map((pref) => (
                    <div key={pref.method} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pref.method}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm">{pref.usage}%</p>
                          <p className="text-xs text-muted-foreground">usage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold">{pref.satisfaction}</p>
                          <p className="text-xs text-muted-foreground">satisfaction</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Optimization Opportunities
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to improve payment performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Implement Smart Retry Logic',
                  description: 'Advanced retry algorithms for declined transactions',
                  impact: 'Potential 1.8% improvement in success rate',
                  effort: 'Medium',
                  roi: '145%',
                  timeline: '45 days'
                },
                {
                  title: 'Optimize Payment Method Mix',
                  description: 'Route transactions to lower-cost payment methods',
                  impact: 'Save $89.5K monthly in processing fees',
                  effort: 'High',
                  roi: '2,148%',
                  timeline: '90 days'
                },
                {
                  title: 'Reduce ACH Failure Rate',
                  description: 'Improve ACH success rates through better validation',
                  impact: 'Potential $234K monthly revenue recovery',
                  effort: 'Low',
                  roi: '320%',
                  timeline: '7 days'
                }
              ].map((opportunity, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {opportunity.roi} ROI
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Impact</p>
                      <p className="font-semibold">{opportunity.impact}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Effort</p>
                      <p className="font-semibold">{opportunity.effort}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-semibold">{opportunity.timeline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Implement
                    </Button>
                    <Button size="sm" variant="outline">
                      <Info className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}