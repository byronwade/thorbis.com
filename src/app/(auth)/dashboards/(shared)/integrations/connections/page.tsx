import { Suspense } from 'react'
import { IntegrationCard } from '@/components/integration-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Filter, Globe, Zap, CreditCard, Mail, Calendar } from 'lucide-react'

// Mock connections data - replace with real API calls
const mockConnections = {
  connected: [
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      description: 'Payment processing and billing',
      icon: '/integrations/stripe.svg',
      status: 'connected' as const,
      isConnected: true,
      lastSync: new Date('2025-01-31T10:30:00Z'),
      health: 'healthy' as const,
      metrics: {
        apiCalls: 1250,
        successRate: 99.8,
        avgResponseTime: 120
      },
      config: {
        environment: 'production',
        webhookUrl: 'https://api.thorbis.com/webhooks/stripe'
      },
      features: ['Payment Processing', 'Subscriptions', 'Invoicing', 'Webhooks'],
      connectedDate: new Date('2024-12-15T00:00:00Z')
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      category: 'accounting',
      description: 'Accounting and financial management',
      icon: '/integrations/quickbooks.svg',
      status: 'connected' as const,
      isConnected: true,
      lastSync: new Date('2025-01-31T11:00:00Z'),
      health: 'healthy' as const,
      metrics: {
        apiCalls: 890,
        successRate: 98.5,
        avgResponseTime: 250
      },
      config: {
        companyId: 'comp_123456789',
        syncFrequency: 'hourly'
      },
      features: ['Accounting Sync', 'Invoice Management', 'Expense Tracking'],
      connectedDate: new Date('2024-11-20T00:00:00Z')
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication and notifications',
      icon: '/integrations/slack.svg',
      status: 'connected' as const,
      isConnected: true,
      lastSync: new Date('2025-01-31T11:15:00Z'),
      health: 'healthy' as const,
      metrics: {
        apiCalls: 325,
        successRate: 99.1,
        avgResponseTime: 95
      },
      config: {
        workspace: 'thorbis-team',
        defaultChannel: '#integrations'
      },
      features: ['Notifications', 'Team Chat', 'File Sharing'],
      connectedDate: new Date('2025-01-10T00:00:00Z')
    }
  ],
  available: [
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      description: 'Workflow automation platform',
      icon: '/integrations/zapier.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['Workflow Automation', '5000+ App Integrations', 'Triggers & Actions'],
      popularity: 'high'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'marketing',
      description: 'Email marketing automation',
      icon: '/integrations/mailchimp.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['Email Campaigns', 'Audience Management', 'Marketing Automation'],
      popularity: 'high'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'crm',
      description: 'Customer relationship management',
      icon: '/integrations/hubspot.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['CRM', 'Marketing Hub', 'Sales Pipeline', 'Contact Management'],
      popularity: 'medium'
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      category: 'productivity',
      description: 'Google productivity suite integration',
      icon: '/integrations/google-workspace.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['Gmail', 'Calendar', 'Drive', 'Docs', 'Sheets'],
      popularity: 'high'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      description: 'E-commerce platform integration',
      icon: '/integrations/shopify.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['Product Sync', 'Order Management', 'Inventory', 'Customer Data'],
      popularity: 'medium'
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      category: 'productivity',
      description: 'Microsoft productivity suite',
      icon: '/integrations/microsoft-365.svg',
      status: 'available' as const,
      isConnected: false,
      lastSync: null,
      health: 'unknown' as const,
      metrics: {
        apiCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      },
      config: Record<string, unknown>,
      features: ['Outlook', 'Teams', 'OneDrive', 'Office Apps'],
      popularity: 'high'
    }
  ]
}

const categoryIcons = {
  payments: CreditCard,
  accounting: Globe,
  communication: Mail,
  automation: Zap,
  marketing: Mail,
  crm: Globe,
  productivity: Calendar,
  ecommerce: Globe
}

const categories = [
  { id: 'all', name: 'All', count: mockConnections.connected.length + mockConnections.available.length },
  { id: 'connected', name: 'Connected', count: mockConnections.connected.length },
  { id: 'payments', name: 'Payments', count: 1 },
  { id: 'accounting', name: 'Accounting', count: 1 },
  { id: 'marketing', name: 'Marketing', count: 1 },
  { id: 'automation', name: 'Automation', count: 1 },
  { id: 'productivity', name: 'Productivity', count: 2 },
  { id: 'communication', name: 'Communication', count: 1 }
]

interface ConnectionsPageProps {
  searchParams: { from?: string }
}

export default function ConnectionsPage({ searchParams }: ConnectionsPageProps) {
  const fromIndustry = searchParams.from

  const handleConnect = async (integrationId: string) => {
    console.log('Connecting integration:', integrationId)
    // Implement connection logic
  }

  const handleDisconnect = async (integrationId: string) => {
    console.log('Disconnecting integration:', integrationId)
    // Implement disconnection logic
  }

  const handleConfigure = async (integrationId: string) => {
    console.log('Configuring integration:', integrationId)
    // Navigate to configuration page
  }

  const handleSync = async (integrationId: string) => {
    console.log('Syncing integration:', integrationId)
    // Trigger manual sync
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-neutral-500">
            Manage your third-party service connections and integrations
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons] || Globe
          return (
            <Button key={category.id} variant="outline" size="sm" className="gap-2">
              <IconComponent className="h-3 w-3" />
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Connected vs Available Tabs */}
      <Tabs defaultValue="connected" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connected">
            Connected ({mockConnections.connected.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({mockConnections.available.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="mt-6">
          {mockConnections.connected.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockConnections.connected.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  variant="connected"
                  onConnect={() => handleConnect(integration.id)}
                  onDisconnect={() => handleDisconnect(integration.id)}
                  onConfigure={() => handleConfigure(integration.id)}
                  onSync={() => handleSync(integration.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-neutral-500 mb-4" />
                <CardTitle className="text-lg mb-2">No Connected Integrations</CardTitle>
                <CardDescription className="text-center mb-4">
                  Connect your first integration to start syncing data across your business tools.
                </CardDescription>
                <Button>Browse Available Integrations</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="space-y-6">
            {/* Popular/Recommended */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Popular Integrations</h2>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Recommended</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockConnections.available
                  .filter((integration) => integration.popularity === 'high')
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      variant="available"
                      onConnect={() => handleConnect(integration.id)}
                      onDisconnect={() => handleDisconnect(integration.id)}
                      onConfigure={() => handleConfigure(integration.id)}
                      onSync={() => handleSync(integration.id)}
                    />
                  ))}
              </div>
            </div>

            {/* All Available */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Available</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockConnections.available.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    variant="available"
                    onConnect={() => handleConnect(integration.id)}
                    onDisconnect={() => handleDisconnect(integration.id)}
                    onConfigure={() => handleConfigure(integration.id)}
                    onSync={() => handleSync(integration.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Request */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Request New Integration</CardTitle>
          <CardDescription>
            Can't find the integration you need? Let us know and we'll consider adding it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="Integration name or service URL..." 
              className="flex-1"
            />
            <Button>Submit Request</Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Popular requests: Salesforce, Monday.com, Airtable, Twilio
          </p>
        </CardContent>
      </Card>
    </div>
  )
}