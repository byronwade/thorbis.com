'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  Clock, 
  Globe, 
  Users, 
  Key, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Zap,
  Lock,
  Eye,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';

interface RateLimitData {
  organization_settings: {
    rate_limiting_enabled: boolean;
    strategy: string;
    configuration_version: string;
  };
  global_limits: {
    requests_per_second: number;
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
    concurrent_requests: number;
    burst_capacity: number;
  };
  endpoint_specific_limits: Array<{
    endpoint_pattern: string;
    method: string;
    requests_per_minute: number;
    priority: string;
    burst_capacity: number;
    description: string;
  }>;
  user_tier_limits: Array<{
    tier: string;
    multiplier: number;
    custom_limits: {
      requests_per_minute: number;
      requests_per_hour: number;
      concurrent_requests: number;
    };
    features: string[];
    overage_handling: string;
  }>;
  current_status: {
    system_health: string;
    total_requests_last_hour: number;
    rate_limited_requests_last_hour: number;
    average_response_time_ms: number;
    capacity_utilization_percent: number;
    anomalies_detected: number;
    blocked_ips: number;
  };
}

interface UsageAnalytics {
  overall_metrics: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    rate_limited_requests: number;
    average_response_time_ms: number;
    error_rate_percent: number;
    rate_limit_hit_rate_percent: number;
    unique_users: number;
  };
  endpoint_analytics: {
    most_used_endpoints: Array<{
      endpoint: string;
      method: string;
      requests: number;
      rate_limited: number;
      avg_response_time: number;
      success_rate: number;
    }>;
  };
  geographic_distribution: {
    requests_by_country: Array<{
      country: string;
      country_code: string;
      requests: number;
      percentage: number;
    }>;
  };
  api_key_analytics: {
    active_api_keys: number;
    total_api_keys: number;
    keys_rate_limited: number;
    top_api_keys: Array<{
      key_id: string;
      key_name: string;
      requests: number;
      rate_limited: number;
      last_used: string;
      permissions: string[];
    }>;
  };
}

interface ApiKeysData {
  api_keys_overview: {
    total_keys: number;
    active_keys: number;
    expired_keys: number;
    suspended_keys: number;
    keys_nearing_limits: number;
  };
  api_keys: Array<{
    key_id: string;
    key_name: string;
    description: string;
    status: string;
    permissions: string[];
    tier: string;
    created_at: string;
    last_used: string;
    usage_stats: {
      requests_today: number;
      requests_this_month: number;
      quota_usage_percent: number;
      rate_limit_hits_today: number;
    };
    rate_limits: {
      requests_per_minute: number;
      requests_per_hour: number;
      concurrent_requests: number;
    };
  }>;
}

export default function RateLimitingPage() {
  const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [apiKeysData, setApiKeysData] = useState<ApiKeysData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationId] = useState('550e8400-e29b-41d4-a716-446655440000');
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false);

  // New API Key form state
  const [newKeyForm, setNewKeyForm] = useState({
    key_name: ',
    description: ',
    permissions: [] as string[],
    rate_limit_tier: 'standard',
    expiry_date: '
  });

  useEffect(() => {
    fetchRateLimitData();
    fetchUsageAnalytics();
    fetchApiKeysData();
  }, []);

  const fetchRateLimitData = async () => {
    try {
      const response = await fetch('/api/v1/system/rate-limiting?organization_id=${organizationId}');
      const result = await response.json();
      
      if (response.ok) {
        setRateLimitData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch rate limiting data:', error);
    }
  };

  const fetchUsageAnalytics = async () => {
    try {
      const response = await fetch('/api/v1/system/rate-limiting?organization_id=${organizationId}&data_type=usage_analytics');
      const result = await response.json();
      
      if (response.ok) {
        setUsageAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch usage analytics:', error);
    }
  };

  const fetchApiKeysData = async () => {
    try {
      const response = await fetch('/api/v1/system/rate-limiting?organization_id=${organizationId}&data_type=api_keys');
      const result = await response.json();
      
      if (response.ok) {
        setApiKeysData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/v1/system/rate-limiting?action=manage_api_key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          api_key_config: newKeyForm
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowNewApiKeyDialog(false);
        setNewKeyForm({
          key_name: ',
          description: ',
          permissions: [],
          rate_limit_tier: 'standard',
          expiry_date: '
        });
        fetchApiKeysData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-neutral-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'outline';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return '${(num / 1000).toFixed(1)}K';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">API Rate Limiting & Analytics</h1>
          <p className="text-neutral-400">Advanced rate limiting, usage analytics, and API key management</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => fetchRateLimitData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowNewApiKeyDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className={'h-5 w-5 ${getHealthColor(rateLimitData?.current_status?.system_health || 'unknown')}'} />
              <h3 className="font-semibold text-white">System Health</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2 capitalize">
              {rateLimitData?.current_status?.system_health || 'Unknown'}
            </p>
            <p className="text-sm text-neutral-400">Rate limiting status</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-white">Requests/Hour</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {formatNumber(rateLimitData?.current_status?.total_requests_last_hour || 0)}
            </p>
            <p className="text-sm text-neutral-400">
              {formatNumber(rateLimitData?.current_status?.rate_limited_requests_last_hour || 0)} rate limited
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-white">Avg Response Time</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {rateLimitData?.current_status?.average_response_time_ms || 0}ms
            </p>
            <p className="text-sm text-neutral-400">System performance</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-white">Capacity Usage</h3>
            </div>
            <div className="mt-2">
              <Progress 
                value={rateLimitData?.current_status?.capacity_utilization_percent || 0} 
                className="w-full" 
              />
              <p className="text-sm text-neutral-400 mt-1">
                {rateLimitData?.current_status?.capacity_utilization_percent || 0}% utilized
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Rate Limiting Status</CardTitle>
                <CardDescription>Current system configuration and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Strategy</span>
                  <Badge variant="secondary">{rateLimitData?.organization_settings?.strategy}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Requests/Minute</span>
                  <span className="text-white font-medium">
                    {rateLimitData?.global_limits?.requests_per_minute?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Requests/Hour</span>
                  <span className="text-white font-medium">
                    {rateLimitData?.global_limits?.requests_per_hour?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Concurrent Requests</span>
                  <span className="text-white font-medium">
                    {rateLimitData?.global_limits?.concurrent_requests}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Burst Capacity</span>
                  <span className="text-white font-medium">
                    {rateLimitData?.global_limits?.burst_capacity}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Usage Summary</CardTitle>
                <CardDescription>Recent activity and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Total Requests</span>
                  <span className="text-white font-medium">
                    {formatNumber(usageAnalytics?.overall_metrics?.total_requests || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Success Rate</span>
                  <span className="text-green-400 font-medium">
                    {((1 - (usageAnalytics?.overall_metrics?.error_rate_percent || 0) / 100) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Rate Limited</span>
                  <span className="text-yellow-400 font-medium">
                    {usageAnalytics?.overall_metrics?.rate_limit_hit_rate_percent?.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Unique Users</span>
                  <span className="text-white font-medium">
                    {formatNumber(usageAnalytics?.overall_metrics?.unique_users || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Active API Keys</span>
                  <span className="text-blue-400 font-medium">
                    {usageAnalytics?.api_key_analytics?.active_api_keys || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Tier Limits */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">User Tier Rate Limits</CardTitle>
              <CardDescription>Rate limiting configuration by user subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rateLimitData?.user_tier_limits?.map((tier, index) => (
                  <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white capitalize">{tier.tier} Tier</h4>
                        <Badge variant="outline">x{tier.multiplier} multiplier</Badge>
                      </div>
                      <Badge variant="secondary">{tier.overage_handling.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-neutral-400">Requests/Minute</p>
                        <p className="font-medium text-white">{tier.custom_limits.requests_per_minute}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Requests/Hour</p>
                        <p className="font-medium text-white">{tier.custom_limits.requests_per_hour}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Concurrent</p>
                        <p className="font-medium text-white">{tier.custom_limits.concurrent_requests}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-neutral-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {tier.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Top Endpoints</CardTitle>
                <CardDescription>Most frequently used API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {usageAnalytics?.endpoint_analytics?.most_used_endpoints?.slice(0, 5).map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{endpoint.method}</Badge>
                        <span className="text-white font-medium text-sm">{endpoint.endpoint}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {endpoint.avg_response_time}ms avg • {endpoint.success_rate}% success
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatNumber(endpoint.requests)}</p>
                      <p className="text-xs text-yellow-400">{formatNumber(endpoint.rate_limited)} limited</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Geographic Distribution</CardTitle>
                <CardDescription>Request volume by country</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {usageAnalytics?.geographic_distribution?.requests_by_country?.slice(0, 5).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{country.country_code}</span>
                      <span className="text-sm text-neutral-300">{country.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{formatNumber(country.requests)}</p>
                        <p className="text-xs text-neutral-400">{country.percentage}%</p>
                      </div>
                      <Progress value={country.percentage} className="w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
              <CardDescription>System performance and response time analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {usageAnalytics?.overall_metrics?.average_response_time_ms}ms
                  </p>
                  <p className="text-sm text-neutral-400">Avg Response Time</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(usageAnalytics?.overall_metrics?.successful_requests || 0)}
                  </p>
                  <p className="text-sm text-neutral-400">Successful Requests</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(usageAnalytics?.overall_metrics?.failed_requests || 0)}
                  </p>
                  <p className="text-sm text-neutral-400">Failed Requests</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(usageAnalytics?.overall_metrics?.rate_limited_requests || 0)}
                  </p>
                  <p className="text-sm text-neutral-400">Rate Limited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Endpoint-Specific Rate Limits</CardTitle>
              <CardDescription>Custom rate limiting rules for specific API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateLimitData?.endpoint_specific_limits?.map((endpoint, index) => (
                <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{endpoint.method}</Badge>
                      <span className="font-medium text-white">{endpoint.endpoint_pattern}</span>
                      <Badge variant={getPriorityColor(endpoint.priority)} className="text-xs">
                        {endpoint.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-neutral-400">Requests/Minute</p>
                      <p className="font-medium text-white">{endpoint.requests_per_minute}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Burst Capacity</p>
                      <p className="font-medium text-white">{endpoint.burst_capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Priority</p>
                      <p className="font-medium text-white capitalize">{endpoint.priority}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-300">{endpoint.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">API Key Management</h2>
            <Button onClick={() => setShowNewApiKeyDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Key
            </Button>
          </div>

          {/* API Keys Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-center">
                <Key className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{apiKeysData?.api_keys_overview?.total_keys}</p>
                <p className="text-sm text-neutral-400">Total Keys</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{apiKeysData?.api_keys_overview?.active_keys}</p>
                <p className="text-sm text-neutral-400">Active</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-center">
                <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{apiKeysData?.api_keys_overview?.expired_keys}</p>
                <p className="text-sm text-neutral-400">Expired</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-center">
                <Lock className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{apiKeysData?.api_keys_overview?.suspended_keys}</p>
                <p className="text-sm text-neutral-400">Suspended</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{apiKeysData?.api_keys_overview?.keys_nearing_limits}</p>
                <p className="text-sm text-neutral-400">Near Limits</p>
              </CardContent>
            </Card>
          </div>

          {/* API Keys List */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {apiKeysData?.api_keys?.map((key) => (
                  <div key={key.key_id} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{key.key_name}</h4>
                        <p className="text-sm text-neutral-400">{key.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                            {key.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{key.tier}</Badge>
                          <span className="text-xs text-neutral-400">
                            Created: {new Date(key.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-neutral-400">Requests Today</p>
                        <p className="font-medium text-white">{formatNumber(key.usage_stats.requests_today)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Monthly Usage</p>
                        <p className="font-medium text-white">{formatNumber(key.usage_stats.requests_this_month)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Quota Usage</p>
                        <div className="flex items-center gap-2">
                          <Progress value={key.usage_stats.quota_usage_percent} className="w-12" />
                          <span className="text-white font-medium text-sm">
                            {key.usage_stats.quota_usage_percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Rate Limited Today</p>
                        <p className="font-medium text-yellow-400">{key.usage_stats.rate_limit_hits_today}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-400">
                          Rate Limits: {key.rate_limits.requests_per_minute}/min, {key.rate_limits.requests_per_hour}/hr
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">Permissions:</span>
                        {key.permissions.map((permission, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Rate Limiting Configuration</CardTitle>
              <CardDescription>Advanced rate limiting settings and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="strategy" className="text-white">Rate Limiting Strategy</Label>
                    <Select defaultValue={rateLimitData?.organization_settings?.strategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sliding_window">Sliding Window</SelectItem>
                        <SelectItem value="token_bucket">Token Bucket</SelectItem>
                        <SelectItem value="fixed_window">Fixed Window</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rps" className="text-white">Requests/Second</Label>
                      <Input 
                        id="rps" 
                        type="number" 
                        defaultValue={rateLimitData?.global_limits?.requests_per_second}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rpm" className="text-white">Requests/Minute</Label>
                      <Input 
                        id="rpm" 
                        type="number" 
                        defaultValue={rateLimitData?.global_limits?.requests_per_minute}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rph" className="text-white">Requests/Hour</Label>
                      <Input 
                        id="rph" 
                        type="number" 
                        defaultValue={rateLimitData?.global_limits?.requests_per_hour}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="concurrent" className="text-white">Concurrent Requests</Label>
                      <Input 
                        id="concurrent" 
                        type="number" 
                        defaultValue={rateLimitData?.global_limits?.concurrent_requests}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Advanced Features</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adaptive" className="text-white">Adaptive Limiting</Label>
                      <Switch id="adaptive" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anomaly" className="text-white">Anomaly Detection</Label>
                      <Switch id="anomaly" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-headers" className="text-white">Custom Headers</Label>
                      <Switch id="custom-headers" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retry-after" className="text-white">Retry-After Header</Label>
                      <Switch id="retry-after" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Apply Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}