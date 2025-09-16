"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, Webhook, Key, Zap, ExternalLink, 
  Plus, Settings, Trash2, Copy, Eye, EyeOff, 
  AlertCircle, Check, Clock, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function IntegrationsSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const integrations = [
    {
      id: 1,
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      icon: '💳',
      status: 'connected',
      lastSync: '2024-01-30 14:23',
      config: { publishableKey: 'pk_live_••••••••••••1234' }
    },
    {
      id: 2,
      name: 'QuickBooks',
      description: 'Accounting and financial data synchronization',
      icon: '📊',
      status: 'connected',
      lastSync: '2024-01-30 12:15',
      config: { companyId: 'qb_••••••••••••5678' }
    },
    {
      id: 3,
      name: 'Slack',
      description: 'Team notifications and workflow updates',
      icon: '💬',
      status: 'disconnected',
      lastSync: null,
      config: null
    },
    {
      id: 4,
      name: 'Google Calendar',
      description: 'Appointment and scheduling synchronization',
      icon: '📅',
      status: 'connected',
      lastSync: '2024-01-30 16:45',
      config: { calendarId: 'primary' }
    },
  ]

  const webhooks = [
    {
      id: 1,
      name: 'Invoice Created',
      url: 'https://api.example.com/webhooks/invoice-created',
      events: ['invoice.created', 'invoice.paid'],
      status: 'active',
      lastTriggered: '2024-01-30 14:23'
    },
    {
      id: 2,
      name: 'Work Order Updates',
      url: 'https://hooks.zapier.com/hooks/catch/12345/abcd',
      events: ['work_order.created', 'work_order.completed'],
      status: 'active',
      lastTriggered: '2024-01-30 12:45'
    },
    {
      id: 3,
      name: 'Customer Notifications',
      url: 'https://api.myapp.com/webhooks/customer',
      events: ['customer.created', 'customer.updated'],
      status: 'failed',
      lastTriggered: '2024-01-29 09:15'
    }
  ]

  const apiKeys = [
    {
      id: 1,
      name: 'Production API',
      key: 'sk_live_51H••••••••••••••••••••••••••••••••••••••••••••••••1234',
      permissions: ['read', 'write'],
      created: '2024-01-15',
      lastUsed: '2024-01-30'
    },
    {
      id: 2,
      name: 'Development API',
      key: 'sk_test_51H••••••••••••••••••••••••••••••••••••••••••••••••5678',
      permissions: ['read'],
      created: '2024-01-10',
      lastUsed: '2024-01-29'
    }
  ]

  const availableIntegrations = [
    { name: 'Mailchimp', description: 'Email marketing automation', icon: '📧', category: 'Marketing' },
    { name: 'Shopify', description: 'E-commerce platform integration', icon: '🛒', category: 'E-commerce' },
    { name: 'Salesforce', description: 'CRM and customer management', icon: '☁️', category: 'CRM' },
    { name: 'HubSpot', description: 'Marketing and sales platform', icon: '🎯', category: 'Marketing' },
    { name: 'Xero', description: 'Cloud-based accounting software', icon: '💼', category: 'Accounting' },
    { name: 'Zapier', description: 'Workflow automation platform', icon: '⚡', category: 'Automation' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Integrations & API</h1>
          </div>
          <p className="text-neutral-400">Manage API keys, webhooks, and third-party connections</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-8">
          <TabsList className="bg-neutral-900/50 border border-neutral-800">
            <TabsTrigger value="integrations" className="data-[state=active]:bg-neutral-800">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-neutral-800">
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-neutral-800">
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-8">
            {/* Connected Integrations */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">Connected Integrations</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Manage your active third-party connections
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    {integrations.filter(i => i.status === 'connected').length} Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-neutral-800 rounded-lg text-2xl">
                        {integration.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{integration.name}</h4>
                          <Badge
                            variant="outline"
                            className={
                              integration.status === 'connected'
                                ? 'border-green-600 text-green-400'
                                : 'border-neutral-600 text-neutral-400'
                            }
                          >
                            {integration.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-400">{integration.description}</p>
                        {integration.lastSync && (
                          <p className="text-xs text-neutral-500">Last sync: {integration.lastSync}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                        <Settings className="w-4 h-4" />
                      </Button>
                      {integration.status === 'connected' ? (
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Available Integrations */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Available Integrations</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Connect new services to extend functionality
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableIntegrations.map((integration, index) => (
                    <div key={index} className="p-4 border border-neutral-800 rounded-lg hover:bg-neutral-900/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h4 className="text-white font-medium">{integration.name}</h4>
                          <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-400">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400 mb-3">{integration.description}</p>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">Webhooks</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Configure HTTP callbacks for real-time notifications
                      </CardDescription>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-medium">{webhook.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            webhook.status === 'active'
                              ? 'border-green-600 text-green-400'
                              : webhook.status === 'failed'
                              ? 'border-red-600 text-red-400'
                              : 'border-neutral-600 text-neutral-400'
                          }
                        >
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300 font-mono">{webhook.url}</span>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-400">Events: {webhook.events.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-400">Last triggered: {webhook.lastTriggered}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-8">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-neutral-400" />
                    <div>
                      <CardTitle className="text-white">API Keys</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Manage your API keys for programmatic access
                      </CardDescription>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{apiKey.name}</h4>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400 font-mono">{apiKey.key}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Permissions: {apiKey.permissions.join(', ')}</span>
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* API Documentation */}
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">API Documentation</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Learn how to integrate with our API
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-800 rounded-lg">
                    <h4 className="text-white font-medium mb-2">REST API Reference</h4>
                    <p className="text-sm text-neutral-400 mb-3">Complete reference for all API endpoints</p>
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      View Docs
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                  <div className="p-4 border border-neutral-800 rounded-lg">
                    <h4 className="text-white font-medium mb-2">SDKs & Libraries</h4>
                    <p className="text-sm text-neutral-400 mb-3">Official SDKs for popular languages</p>
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      Download
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                  <div className="p-4 border border-neutral-800 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Rate Limits</h4>
                    <p className="text-sm text-neutral-400 mb-3">Understanding API usage limits</p>
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      Learn More
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                  <div className="p-4 border border-neutral-800 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Webhooks Guide</h4>
                    <p className="text-sm text-neutral-400 mb-3">Set up real-time event notifications</p>
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                      Get Started
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}