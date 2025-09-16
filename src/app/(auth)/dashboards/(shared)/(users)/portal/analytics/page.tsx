/**
 * Portal Analytics Page
 * Admin interface for viewing comprehensive portal analytics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalAnalyticsDashboard } from '@/components/portals/shared/PortalAnalyticsDashboard';
import { 
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  Database,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AdminAnalyticsData {
  totalPortals: number;
  totalCustomers: number;
  totalOrganizations: number;
  systemHealth: {
    uptime: number;
    lastIncident: string;
    activeAlerts: number;
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
}

export default function PortalAnalyticsPage() {
  const [adminData, setAdminData] = useState<AdminAnalyticsData>({
    totalPortals: 4,
    totalCustomers: 6010,
    totalOrganizations: 1250,
    systemHealth: {
      uptime: 99.94,
      lastIncident: '2024-01-15T08:30:00Z',
      activeAlerts: 2
    },
    resourceUsage: {
      cpu: 45,
      memory: 62,
      storage: 78,
      bandwidth: 34
    }
  });

  const [selectedView, setSelectedView] = useState<'overview' | 'portal-specific'>('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Portal Analytics Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Comprehensive analytics and insights across all customer portals
          </p>
          
          {/* System Status Alert */}
          {adminData.systemHealth.activeAlerts > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>System Alerts Active</AlertTitle>
              <AlertDescription>
                {adminData.systemHealth.activeAlerts} active alerts require attention. 
                Last incident: {formatDate(adminData.systemHealth.lastIncident)}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Active Portals</span>
              </div>
              <div className="text-2xl font-bold">{adminData.totalPortals}</div>
              <div className="text-xs text-muted-foreground">All industries</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Total Customers</span>
              </div>
              <div className="text-2xl font-bold">{adminData.totalCustomers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Across all portals</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-muted-foreground">Organizations</span>
              </div>
              <div className="text-2xl font-bold">{adminData.totalOrganizations.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Active accounts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">System Uptime</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {adminData.systemHealth.uptime}%
              </div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </CardContent>
          </Card>
        </div>

        {/* System Resource Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Resources
            </CardTitle>
            <CardDescription>Current resource utilization across all portal infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(adminData.resourceUsage).map(([resource, usage]) => (
                <div key={resource} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{resource}</span>
                    <span className="text-sm font-medium">{usage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                    <div 
                      className={'h-2 rounded-full transition-all duration-300 ${
                        usage < 50 ? 'bg-green-500' : 
                        usage < 80 ? 'bg-yellow-500' : 'bg-red-500`
                      }'}
                      style={{ width: '${usage}%' }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {usage < 50 ? 'Optimal' : usage < 80 ? 'Moderate' : 'High usage'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Tabs value={selectedView} onValueChange={(value: unknown) => setSelectedView(value)} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">All Portals Overview</TabsTrigger>
            <TabsTrigger value="portal-specific">By Portal Type</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Consolidated Analytics</CardTitle>
                <CardDescription>
                  Combined metrics and insights from all customer portals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortalAnalyticsDashboard
                  portalType="all"
                  organizationId="admin"
                  accessToken="admin_token"
                  showExportOptions={true}
                  refreshInterval={60000} // 1 minute for admin view
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal-specific" className="space-y-6">
            {/* Home Services Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  Home Services Portal
                </CardTitle>
                <CardDescription>
                  Analytics for residential and commercial home service providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortalAnalyticsDashboard
                  portalType="hs"
                  organizationId="admin"
                  accessToken="admin_token"
                  showExportOptions={false}
                  refreshInterval={300000} // 5 minutes
                />
              </CardContent>
            </Card>

            {/* Auto Services Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  Auto Services Portal
                </CardTitle>
                <CardDescription>
                  Analytics for automotive service and repair businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortalAnalyticsDashboard
                  portalType="auto"
                  organizationId="admin"
                  accessToken="admin_token"
                  showExportOptions={false}
                  refreshInterval={300000}
                />
              </CardContent>
            </Card>

            {/* Retail Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  Retail Portal
                </CardTitle>
                <CardDescription>
                  Analytics for retail stores and e-commerce businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortalAnalyticsDashboard
                  portalType="retail"
                  organizationId="admin"
                  accessToken="admin_token"
                  showExportOptions={false}
                  refreshInterval={300000}
                />
              </CardContent>
            </Card>

            {/* Restaurant Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  Restaurant Portal
                </CardTitle>
                <CardDescription>
                  Analytics for restaurants and food service businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortalAnalyticsDashboard
                  portalType="restaurant"
                  organizationId="admin"
                  accessToken="admin_token"
                  showExportOptions={false}
                  refreshInterval={300000}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Information */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Data encrypted and GDPR compliant
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Real-time data with 5-minute intervals
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">
                90-day data retention policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}