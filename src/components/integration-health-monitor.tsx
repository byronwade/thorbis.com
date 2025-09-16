"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';

interface HealthData {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  incidents: number;
  trend: 'up' | 'down' | 'stable';
}

interface IntegrationHealthMonitorProps {
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  className?: string;
}

// Mock health data - replace with real API calls
const mockHealthData: HealthData[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.1,
    lastCheck: new Date(),
    incidents: 0,
    trend: 'stable'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    status: 'healthy',
    uptime: 98.5,
    responseTime: 250,
    errorRate: 1.5,
    lastCheck: new Date(),
    incidents: 1,
    trend: 'up'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    status: 'degraded',
    uptime: 95.2,
    responseTime: 180,
    errorRate: 4.8,
    lastCheck: new Date(),
    incidents: 3,
    trend: 'down'
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'healthy',
    uptime: 99.1,
    responseTime: 95,
    errorRate: 0.9,
    lastCheck: new Date(),
    incidents: 0,
    trend: 'stable'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    status: 'offline',
    uptime: 0,
    responseTime: 0,
    errorRate: 100,
    lastCheck: new Date(Date.now() - 3600000), // 1 hour ago
    incidents: 1,
    trend: 'down'
  }
];

export function IntegrationHealthMonitor({
  onRefresh,
  onViewDetails,
  className
}: IntegrationHealthMonitorProps) {
  const [healthData, setHealthData] = useState<HealthData[]>(mockHealthData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();
    
    // Simulate API call delay
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-500/10 text-green-500',
      degraded: 'bg-yellow-500/10 text-yellow-500',
      offline: 'bg-red-500/10 text-red-500'
    };
    
    return variants[status as keyof typeof variants] || 'bg-neutral-500/10 text-neutral-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-neutral-400" />;
    }
  };

  const overallHealth = healthData.reduce((sum, item) => sum + item.uptime, 0) / healthData.length;
  const healthyServices = healthData.filter(item => item.status === 'healthy').length;
  const totalIncidents = healthData.reduce((sum, item) => sum + item.incidents, 0);

  return (
    <div className={'space-y-6 ${className}'}>
      {/* Overall Health Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallHealth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average uptime</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyServices}/{healthData.length}</div>
            <p className="text-xs text-muted-foreground">Services operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Health Details</CardTitle>
              <CardDescription>Real-time monitoring of all integration endpoints</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthData.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge className={getStatusBadge(service.status)} variant="secondary">
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Uptime:</span> {service.uptime}%
                    </div>
                    <div>
                      <span className="font-medium">Response:</span> {service.responseTime}ms
                    </div>
                    <div>
                      <span className="font-medium">Error Rate:</span> {service.errorRate}%
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Trend:</span>
                      {getTrendIcon(service.trend)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {service.incidents > 0 && (
                    <Badge variant="outline" className="text-orange-500 border-orange-500">
                      {service.incidents} incident{service.incidents > 1 ? 's' : '}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(service.id)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>24-hour performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <p>Performance charts will be displayed here</p>
              <p className="text-sm">Integration with monitoring service required</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}