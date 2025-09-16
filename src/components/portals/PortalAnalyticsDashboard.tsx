/**
 * Portal Analytics Dashboard
 * Comprehensive analytics and metrics tracking for portal usage and performance
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Activity,
  DollarSign,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart,
  Target,
  Zap,
  Globe,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  // Overview metrics
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  
  // Time-based data
  timeRange: '7d' | '30d' | '90d' | '1y';
  
  // Usage patterns
  pageViews: { path: string; views: number; uniqueViews: number }[];
  userEngagement: { date: string; sessions: number; users: number; duration: number }[];
  deviceBreakdown: { type: string; percentage: number; users: number }[];
  
  // Portal-specific metrics
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs' | 'all';
  featureUsage: { feature: string; usage: number; trend: 'up' | 'down' | 'stable' }[];
  customerSatisfaction: { score: number; responses: number; trend: 'up' | 'down' | 'stable' }[];
  
  // Performance metrics
  loadTimes: { page: string; avgTime: number; p95Time: number }[];
  errorRates: { endpoint: string; errorRate: number; trend: 'up' | 'down' | 'stable' }[];
  uptime: number;
}

interface PortalAnalyticsDashboardProps {
  portalType?: 'restaurant' | 'auto' | 'retail' | 'hs' | 'all';
  organizationId: string;
  customerId?: string; // If provided, show customer-specific analytics
  accessToken: string;
  showExportOptions?: boolean;
  refreshInterval?: number; // In milliseconds
}

// Mock analytics data generator
const generateMockAnalytics = (portalType: string): AnalyticsData => {
  const baseMetrics = {
    restaurant: { users: 1250, sessions: 3800, revenue: 45000 },
    auto: { users: 980, sessions: 2900, revenue: 78000 },
    retail: { users: 2100, sessions: 6400, revenue: 125000 },
    hs: { users: 1680, sessions: 4200, revenue: 89000 },
    all: { users: 6010, sessions: 17300, revenue: 337000 }
  };

  const base = baseMetrics[portalType as keyof typeof baseMetrics] || baseMetrics.all;

  return {
    totalUsers: base.users,
    activeUsers: Math.floor(base.users * 0.68),
    totalSessions: base.sessions,
    avgSessionDuration: 4.2 + Math.random() * 2,
    bounceRate: 0.32 + Math.random() * 0.2,
    conversionRate: 0.12 + Math.random() * 0.08,
    revenue: base.revenue,
    timeRange: '30d',
    
    pageViews: [
      { path: '/portal/dashboard', views: Math.floor(base.sessions * 0.8), uniqueViews: Math.floor(base.users * 0.7) },
      { path: '/portal/orders', views: Math.floor(base.sessions * 0.6), uniqueViews: Math.floor(base.users * 0.5) },
      { path: '/portal/account', views: Math.floor(base.sessions * 0.4), uniqueViews: Math.floor(base.users * 0.4) },
      { path: '/portal/support', views: Math.floor(base.sessions * 0.3), uniqueViews: Math.floor(base.users * 0.25) },
      { path: '/portal/billing', views: Math.floor(base.sessions * 0.25), uniqueViews: Math.floor(base.users * 0.2) },
    ],

    userEngagement: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sessions: Math.floor(base.sessions / 30 * (0.8 + Math.random() * 0.4)),
      users: Math.floor(base.users / 30 * (0.8 + Math.random() * 0.4)),
      duration: 3 + Math.random() * 4
    })),

    deviceBreakdown: [
      { type: 'Desktop', percentage: 52, users: Math.floor(base.users * 0.52) },
      { type: 'Mobile', percentage: 35, users: Math.floor(base.users * 0.35) },
      { type: 'Tablet', percentage: 13, users: Math.floor(base.users * 0.13) },
    ],

    portalType: portalType as any,
    
    featureUsage: [
      { feature: 'Dashboard View', usage: 95, trend: 'stable' },
      { feature: 'Order Management', usage: 78, trend: 'up' },
      { feature: 'Payment Processing', usage: 67, trend: 'up' },
      { feature: 'Support Tickets', usage: 45, trend: 'down' },
      { feature: 'Account Settings', usage: 34, trend: 'stable' },
      { feature: 'Notifications', usage: 56, trend: 'up' },
    ],

    customerSatisfaction: [
      { score: 4.6, responses: 234, trend: 'up' },
    ],

    loadTimes: [
      { page: 'Dashboard', avgTime: 1.2, p95Time: 2.1 },
      { page: 'Orders', avgTime: 1.8, p95Time: 3.2 },
      { page: 'Account', avgTime: 0.9, p95Time: 1.6 },
      { page: 'Support', avgTime: 2.1, p95Time: 3.8 },
    ],

    errorRates: [
      { endpoint: '/api/v1/orders', errorRate: 0.2, trend: 'down' },
      { endpoint: '/api/v1/customers', errorRate: 0.1, trend: 'stable' },
      { endpoint: '/api/v1/payments', errorRate: 0.3, trend: 'up' },
      { endpoint: '/api/v1/auth', errorRate: 0.05, trend: 'down' },
    ],

    uptime: 99.94
  };
};

const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  formatter = (v) => v.toString(),
  className 
}: {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  formatter?: (value: number) => string;
  className?: string;
}) => {
  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return <Minus className="h-3 w-3" />;
    return trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 'stable') return 'text-neutral-500';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{formatter(value)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}k`;
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%';
const formatDuration = (value: number) => '${value.toFixed(1)}m';
const formatNumber = (value: number) => value.toLocaleString();

export function PortalAnalyticsDashboard({
  portalType = 'all',
  organizationId,
  customerId,
  accessToken,
  showExportOptions = true,
  refreshInterval = 300000, // 5 minutes
}: PortalAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(generateMockAnalytics(portalType));
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedPortal, setSelectedPortal] = useState(portalType);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, selectedPortal, timeRange]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from your analytics API
      // const response = await fetch('/api/v1/analytics?portal=${selectedPortal}&timeRange=${timeRange}', {
      //   headers: { 'Authorization': 'Bearer ${accessToken}' }
      // });
      // const data = await response.json();
      // setAnalytics(data);

      // For demo, simulate network delay and generate new mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(generateMockAnalytics(selectedPortal));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'json' | 'pdf`) => {
    // In a real implementation, this would generate and download the report
    console.log(`Exporting analytics data as ${format.toUpperCase()}');
    alert('Analytics report exported as ${format.toUpperCase()}! (Demo only)');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Portal Analytics</h2>
          <p className="text-muted-foreground">
            Track usage, engagement, and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPortal} onValueChange={setSelectedPortal}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Portals</SelectItem>
              <SelectItem value="hs">Home Services</SelectItem>
              <SelectItem value="auto">Auto Services</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(value: unknown) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          {showExportOptions && (
            <Select onValueChange={(value: unknown) => exportData(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="json">Export JSON</SelectItem>
                <SelectItem value="pdf">Export PDF</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers}
          change={8.2}
          trend="up"
          icon={<Users className="h-4 w-4" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Active Users"
          value={analytics.activeUsers}
          change={12.5}
          trend="up"
          icon={<Activity className="h-4 w-4" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Sessions"
          value={analytics.totalSessions}
          change={-3.1}
          trend="down"
          icon={<Eye className="h-4 w-4" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Avg Session"
          value={analytics.avgSessionDuration}
          change={5.7}
          trend="up"
          icon={<Clock className="h-4 w-4" />}
          formatter={formatDuration}
        />
        
        <MetricCard
          title="Bounce Rate"
          value={analytics.bounceRate}
          change={-2.4}
          trend="down"
          icon={<Target className="h-4 w-4" />}
          formatter={formatPercent}
        />
        
        <MetricCard
          title="Conversion"
          value={analytics.conversionRate}
          change={15.3}
          trend="up"
          icon={<TrendingUp className="h-4 w-4" />}
          formatter={formatPercent}
        />
        
        <MetricCard
          title="Revenue"
          value={analytics.revenue}
          change={22.8}
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
          formatter={formatCurrency}
        />
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage & Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Usage & Engagement Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Pages
                </CardTitle>
                <CardDescription>Most visited portal pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.pageViews.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{page.path}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(page.views)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(page.uniqueViews)} unique
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Types
                </CardTitle>
                <CardDescription>User device distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.deviceBreakdown.map((device) => (
                    <div key={device.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.type === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.type === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.type === 'Tablet` && <PieChart className="h-4 w-4" />}
                          <span className="text-sm font-medium">{device.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{device.percentage}%</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(device.users)} users
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${device.percentage}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                User Engagement Timeline
              </CardTitle>
              <CardDescription>Daily sessions and user activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-neutral-50 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Interactive chart would display {analytics.userEngagement.length} days of engagement data
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Peak: {Math.max(...analytics.userEngagement.map(d => d.sessions))} sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Page Load Times
                </CardTitle>
                <CardDescription>Average and 95th percentile load times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.loadTimes.map((page) => (
                    <div key={page.page} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{page.page}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{page.avgTime}s avg</div>
                          <div className="text-xs text-muted-foreground">{page.p95Time}s p95</div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            page.avgTime < 1.5 ? "bg-green-500" :
                            page.avgTime < 3 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: '${Math.min((page.avgTime / 5) * 100, 100)}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Error Rates
                </CardTitle>
                <CardDescription>Error percentages by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.errorRates.map((endpoint) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium font-mono">{endpoint.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          endpoint.errorRate < 0.5 ? "text-green-600" :
                          endpoint.errorRate < 1 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {endpoint.errorRate.toFixed(2)}%
                        </span>
                        <div className={cn(
                          "flex items-center",
                          endpoint.trend === 'up' ? "text-red-500" :
                          endpoint.trend === 'down' ? "text-green-500" : "text-neutral-500"
                        )}>
                          {endpoint.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                          {endpoint.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                          {endpoint.trend === 'stable' && <Minus className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uptime and System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Overall system uptime and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.uptime}%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {analytics.loadTimes.reduce((avg, page) => avg + page.avgTime, 0) / analytics.loadTimes.length}s
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(analytics.errorRates.reduce((avg, endpoint) => avg + endpoint.errorRate, 0) / analytics.errorRates.length).toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Feature Usage
              </CardTitle>
              <CardDescription>Most and least used portal features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{feature.usage}%</span>
                        <div className={cn(
                          "flex items-center",
                          feature.trend === 'up' ? "text-green-500" :
                          feature.trend === 'down' ? "text-red-500" : "text-neutral-500"
                        )}>
                          {feature.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                          {feature.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                          {feature.trend === 'stable' && <Minus className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: '${feature.usage}%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Customer Satisfaction
              </CardTitle>
              <CardDescription>User feedback and satisfaction scores</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.customerSatisfaction.map((satisfaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{satisfaction.score}/5.0</div>
                    <div className="text-sm text-muted-foreground">
                      {satisfaction.responses} responses
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={satisfaction.score >= 4.5 ? "default" : satisfaction.score >= 3.5 ? "secondary" : "destructive"}
                    >
                      {satisfaction.score >= 4.5 ? "Excellent" : satisfaction.score >= 3.5 ? "Good" : "Needs Improvement"}
                    </Badge>
                    <div className={cn(
                      "flex items-center",
                      satisfaction.trend === 'up' ? "text-green-500" : "text-neutral-500"
                    )}>
                      <ArrowUp className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Strong Mobile Growth
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Mobile usage has increased by 23% this month. Consider optimizing mobile experiences further.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        High Conversion Rate
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your conversion rate is 34% above industry average. Great job on user experience!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                        Load Time Optimization
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Some pages are loading slower than optimal. Focus on the Support page for quick wins.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable steps to improve portal performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">Optimize Mobile Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      With 35% mobile traffic, focus on mobile-first design improvements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">Improve Support Page Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Reduce load time from 2.1s to under 1.5s for better user experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">Promote Underused Features</h4>
                    <p className="text-sm text-muted-foreground">
                      Account Settings has low usage (34%) - consider improving discoverability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">Monitor Payment API</h4>
                    <p className="text-sm text-muted-foreground">
                      Error rate trending up (0.3%) - investigate and address payment issues.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Refresh Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </span>
        <span>
          Auto-refresh: {Math.floor(refreshInterval / 60000)}m intervals
        </span>
      </div>
    </div>
  );
}