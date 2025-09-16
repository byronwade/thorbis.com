/**
 * Accounting Integrations Dashboard
 * Manage integrations with QuickBooks, Xero, and other accounting systems
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  Link2,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  Upload,
  Zap,
  Info,
  BarChart3,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface AccountingIntegration {
  id: string;
  organization_id: string;
  provider: string;
  status: string;
  configuration: any;
  last_sync_at?: string;
  last_sync_status?: string;
  sync_statistics: any;
  created_at: string;
  display_info: {
    provider_name: string;
    status_display: string;
    last_sync_display: string;
    sync_health: 'healthy' | 'warning' | 'error';
    connection_status: 'connected' | 'disconnected' | 'expired';
  };
  sync_summary: {
    total_records_synced: number;
    successful_syncs: number;
    failed_syncs: number;
    last_error?: string;
  };
}

const SUPPORTED_PROVIDERS = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Sync customers, invoices, and payments with QuickBooks Online',
    logo: '💼', // In real app, use actual logo
    capabilities: ['customers', 'invoices', 'payments', 'expenses', 'reports'],
    pricing: 'Free integration',
    popular: true
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect with Xero for comprehensive financial data sync',
    logo: '📊',
    capabilities: ['customers', 'invoices', 'payments', 'bank_transactions', 'reports'],
    pricing: 'Free integration'
  },
  {
    id: 'sage',
    name: 'Sage Business Cloud',
    description: 'Integration with Sage for enterprise accounting needs',
    logo: '🏢',
    capabilities: ['full_accounting', 'multi_company', 'advanced_reporting'],
    pricing: 'Premium feature'
  },
  {
    id: 'wave',
    name: 'Wave Accounting',
    description: 'Simple integration for small business accounting',
    logo: '🌊',
    capabilities: ['basic_accounting', 'invoices', 'expenses'],
    pricing: 'Free integration'
  }
];

export default function AccountingIntegrationsPage() {
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/integrations/accounting?organization_id=${MOCK_ORG_ID}');
      if (response.ok) {
        const result = await response.json();
        setIntegrations(result.data || []);
      } else {
        console.error('Failed to fetch integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string, provider: string) => {
    setSyncingId(integrationId);
    try {
      const response = await fetch('/api/v1/integrations/accounting/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          provider: provider
        })
      });

      if (response.ok) {
        // Refresh integrations to show updated sync status
        setTimeout(fetchIntegrations, 2000);
      } else {
        console.error('Failed to trigger sync');
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSetupIntegration = async (provider: string) => {
    try {
      const response = await fetch('/api/v1/integrations/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          provider: provider,
          configuration: {
            oauth_settings: {
              client_id: 'demo_client_id',
              client_secret: 'demo_client_secret',
              redirect_uri: '${window.location.origin}/integrations/oauth-callback',
              scopes: ['accounting.transactions', 'accounting.contacts']
            },
            sync_settings: {
              auto_sync_enabled: true,
              sync_frequency: 'daily',
              sync_direction: 'bidirectional',
              data_types: ['customers', 'invoices', 'payments']
            }
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Open OAuth URL in new window
        window.open(result.data.oauth_authorization_url, '_blank');
        setShowSetupDialog(false);
        // Refresh integrations after a delay to show the new integration
        setTimeout(fetchIntegrations, 2000);
      } else {
        console.error('Failed to create integration');
      }
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'syncing': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'error': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'configuring': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'configuring': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getHealthColor = (health: 'healthy' | 'warning' | 'error') => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Accounting Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your accounting systems to automate financial data sync
          </p>
        </div>
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Accounting Integration</DialogTitle>
              <DialogDescription>
                Choose an accounting system to connect with your Thorbis account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {SUPPORTED_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className={'p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProvider === provider.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }'}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{provider.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{provider.name}</h3>
                        {provider.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {provider.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap.replace('_', ' ')}
                            </Badge>
                          ))}
                          {provider.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-green-600 font-medium">{provider.pricing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedProvider && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => setShowSetupDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSetupIntegration(selectedProvider)}
                    className="flex-1"
                  >
                    Connect {SUPPORTED_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Connected Integrations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {SUPPORTED_PROVIDERS.find(p => p.id === integration.provider)?.logo || '💼'}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.display_info.provider_name}</CardTitle>
                        <CardDescription>
                          Connected {new Date(integration.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {integration.display_info.status_display}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sync Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Last Sync</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.display_info.last_sync_display}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={'text-sm font-medium ${getHealthColor(integration.display_info.sync_health)}'}>
                        {integration.display_info.sync_health === 'healthy' ? 'Healthy' :
                         integration.display_info.sync_health === 'warning' ? 'Warning' : 'Error'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {integration.sync_summary.total_records_synced.toLocaleString()} records
                      </p>
                    </div>
                  </div>

                  {/* Sync Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        {integration.sync_summary.successful_syncs}
                      </p>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-red-600">
                        {integration.sync_summary.failed_syncs}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">
                        {Math.round((integration.sync_summary.successful_syncs / 
                          (integration.sync_summary.successful_syncs + integration.sync_summary.failed_syncs || 1)) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {integration.sync_summary.last_error && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Last Error:</strong> {integration.sync_summary.last_error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSync(integration.id, integration.provider)}
                      disabled={syncingId === integration.id || integration.status === 'syncing'}
                      className="flex-1"
                    >
                      {syncingId === integration.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Section */}
      {integrations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Accounting System</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Automate your financial data flow by connecting with popular accounting platforms like QuickBooks and Xero.
          </p>
          <Button onClick={() => setShowSetupDialog(true)}>
            <Link2 className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
      )}

      {/* Integration Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium">Automated Sync</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically sync customer data, invoices, and payments between systems.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h3 className="font-medium">Real-time Reports</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get up-to-date financial reports and insights across all platforms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="font-medium">Customer Sync</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep customer information synchronized across all your business tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <h3 className="font-medium">Payment Tracking</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically record payments and update invoice statuses in real-time.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Integration Support
          </CardTitle>
          <CardDescription>
            Need help setting up your accounting integration?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Documentation</h4>
                <p className="text-xs text-muted-foreground">
                  Step-by-step integration guides
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
                  View Docs <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Data Import</h4>
                <p className="text-xs text-muted-foreground">
                  Import existing data manually
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
                  Import Data <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Expert Support</h4>
                <p className="text-xs text-muted-foreground">
                  Get help from our integration specialists
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
                  Contact Support <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}