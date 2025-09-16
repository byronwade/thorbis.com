/**
 * Portal Analytics Widget
 * Lightweight analytics component for embedding in dashboards
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Activity,
  BarChart3,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsWidgetData {
  metrics: {
    label: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    formatter?: (value: number) => string;
    icon: React.ReactNode;
  }[];
  recentActivity: {
    action: string;
    timestamp: string;
    user?: string;
  }[];
  topPages: {
    path: string;
    views: number;
  }[];
}

interface PortalAnalyticsWidgetProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  organizationId: string;
  customerId?: string;
  accessToken: string;
  variant?: 'compact' | 'standard' | 'detailed';
  showRecentActivity?: boolean;
  showTopPages?: boolean;
  onViewDetails?: () => void;
  refreshInterval?: number;
  className?: string;
}

// Mock data generator for the widget
const generateWidgetData = (portalType: string): AnalyticsWidgetData => {
  const formatNumber = (value: number) => value.toLocaleString();
  const formatDuration = (value: number) => `${value.toFixed(1)}m';
  const formatPercent = (value: number) => '${(value * 100).toFixed(1)}%';

  return {
    metrics: [
      {
        label: 'Active Users',
        value: 342 + Math.floor(Math.random() * 100),
        change: 8.2 + Math.random() * 5,
        trend: 'up',
        formatter: formatNumber,
        icon: <Users className="h-4 w-4" />
      },
      {
        label: 'Page Views',
        value: 1450 + Math.floor(Math.random() * 300),
        change: -2.1 + Math.random() * 8,
        trend: Math.random() > 0.3 ? 'up' : 'down',
        formatter: formatNumber,
        icon: <Eye className="h-4 w-4" />
      },
      {
        label: 'Avg Session',
        value: 4.2 + Math.random() * 2,
        change: 5.7 + Math.random() * 3,
        trend: 'up',
        formatter: formatDuration,
        icon: <Clock className="h-4 w-4" />
      },
      {
        label: 'Engagement',
        value: 0.68 + Math.random() * 0.2,
        change: 12.3 + Math.random() * 5,
        trend: 'up',
        formatter: formatPercent,
        icon: <Activity className="h-4 w-4" />
      }
    ],
    
    recentActivity: [
      {
        action: 'New customer registration',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user: 'john.doe@example.com'
      },
      {
        action: 'Portal theme updated',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: 'admin@company.com'
      },
      {
        action: 'Order placed via portal',
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        user: 'customer@example.com'
      },
      {
        action: 'Support ticket created',
        timestamp: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
        user: 'support@company.com'
      }
    ],
    
    topPages: [
      { path: '/portal/dashboard', views: 1250 },
      { path: '/portal/orders', views: 890 },
      { path: '/portal/account', views: 650 },
      { path: '/portal/support', views: 430 },
      { path: '/portal/billing', views: 320 }
    ]
  };
};

const MetricCard = ({ metric, compact = false }: { metric: any; compact?: boolean }) => {
  const getTrendColor = () => {
    if (metric.trend === 'stable') return 'text-neutral-500';
    return metric.trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (metric.trend === 'stable') return null;
    return metric.trend === 'up' ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  return (
    <div className={cn(
      "flex items-center justify-between",
      compact ? "py-2" : "p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
    )}>
      <div className="flex items-center gap-2">
        {metric.icon}
        <div>
          <div className="text-sm font-medium">{metric.label}</div>
          <div className={compact ? "text-lg font-bold" : "text-xl font-bold"}>
            {metric.formatter ? metric.formatter(metric.value) : metric.value}
          </div>
        </div>
      </div>
      
      {!compact && (
        <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
          {getTrendIcon()}
          {Math.abs(metric.change).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);

  if (diffInMins < 1) return 'now`;
  if (diffInMins < 60) return `${diffInMins}m ago';
  if (diffInHours < 24) return '${diffInHours}h ago';
  return date.toLocaleDateString();
};

export function PortalAnalyticsWidget({
  portalType,
  organizationId,
  customerId,
  accessToken,
  variant = 'standard`,
  showRecentActivity = true,
  showTopPages = true,
  onViewDetails,
  refreshInterval = 300000, // 5 minutes
  className
}: PortalAnalyticsWidgetProps) {
  const [data, setData] = useState<AnalyticsWidgetData>(generateWidgetData(portalType));
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh data
  useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, portalType]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation:
      // const response = await fetch('/api/v1/analytics/widget?portal=${portalType}&org=${organizationId}${customerId ? '&customer=${customerId}' : '}', {
      //   headers: { 'Authorization': 'Bearer ${accessToken}' }
      // });
      // const newData = await response.json();
      // setData(newData);

      // For demo, simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(generateWidgetData(portalType));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh widget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compact variant - just key metrics
  if (variant === 'compact') {
    return (
      <Card className={cn("p-4", className)}>
        <div className="space-y-3">
          {data.metrics.slice(0, 2).map((metric, index) => (
            <MetricCard key={index} metric={metric} compact={true} />
          ))}
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={onViewDetails}
            >
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Standard variant
  if (variant === 'standard') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Portal Analytics</CardTitle>
              <CardDescription className="capitalize">
                {portalType.replace('hs', 'Home Services')} portal metrics
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {data.metrics.slice(0, 4).map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              Reports
            </Button>
            {onViewDetails && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onViewDetails}>
                <ArrowRight className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
          </div>

          {/* Last refresh */}
          <div className="text-xs text-muted-foreground text-center">
            Updated {formatTimeAgo(lastRefresh.toISOString())}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant - full dashboard preview
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portal Analytics Overview
            </CardTitle>
            <CardDescription className="capitalize">
              Comprehensive metrics for {portalType.replace('hs', 'Home Services')} portal
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Top Pages */}
        {showTopPages && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Top Pages
            </h4>
            <div className="space-y-2">
              {data.topPages.slice(0, 3).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-5 h-5 p-0 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-mono text-xs">{page.path}</span>
                  </div>
                  <span className="font-medium">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {showRecentActivity && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              {data.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    {activity.user && (
                      <div className="text-xs text-muted-foreground">{activity.user}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        {onViewDetails && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onViewDetails}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Full Analytics Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {lastRefresh.toLocaleTimeString()} • 
          Auto-refresh: {Math.floor(refreshInterval / 60000)}m intervals
        </div>
      </CardContent>
    </Card>
  );
}