import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Webhook,
  Plus,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Code,
  Send
} from 'lucide-react'

// Mock webhook data - replace with real API calls
const mockWebhooks = [
  {
    id: 'wh_stripe_001',
    name: 'Stripe Payment Events',
    url: 'https://api.thorbis.com/webhooks/stripe/payments',
    integration: 'Stripe',
    events: ['payment.succeeded', 'payment.failed', 'invoice.created'],
    status: 'active' as const,
    isActive: true,
    lastTriggered: new Date('2025-01-31T10:30:00Z'),
    totalDeliveries: 1250,
    successfulDeliveries: 1247,
    failedDeliveries: 3,
    createdAt: new Date('2024-12-15T00:00:00Z')
  },
  {
    id: 'wh_quickbooks_001',
    name: 'QuickBooks Invoice Updates',
    url: 'https://api.thorbis.com/webhooks/quickbooks/invoices',
    integration: 'QuickBooks',
    events: ['invoice.created', 'invoice.updated', 'invoice.deleted'],
    status: 'active' as const,
    isActive: true,
    lastTriggered: new Date('2025-01-31T09:45:00Z'),
    totalDeliveries: 890,
    successfulDeliveries: 882,
    failedDeliveries: 8,
    createdAt: new Date('2024-11-20T00:00:00Z')
  },
  {
    id: 'wh_slack_001',
    name: 'Slack Notifications',
    url: 'https://api.thorbis.com/webhooks/slack/notifications',
    integration: 'Slack',
    events: ['message.sent', 'channel.created'],
    status: 'error' as const,
    isActive: false,
    lastTriggered: new Date('2025-01-30T15:20:00Z'),
    totalDeliveries: 325,
    successfulDeliveries: 298,
    failedDeliveries: 27,
    createdAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'wh_general_001',
    name: 'General System Events',
    url: 'https://api.thorbis.com/webhooks/system/events',
    integration: 'System',
    events: ['user.created', 'integration.connected', 'sync.completed'],
    status: 'active' as const,
    isActive: true,
    lastTriggered: new Date('2025-01-31T11:00:00Z'),
    totalDeliveries: 567,
    successfulDeliveries: 567,
    failedDeliveries: 0,
    createdAt: new Date('2024-10-01T00:00:00Z')
  }
]

const mockRecentDeliveries = [
  {
    id: 'del_001',
    webhookId: 'wh_stripe_001',
    event: 'payment.succeeded',
    status: 'success' as const,
    timestamp: new Date('2025-01-31T11:30:00Z'),
    responseCode: 200,
    responseTime: 145,
    attempts: 1,
    payload: { amount: 2500, currency: 'usd', customer: 'cus_123' }
  },
  {
    id: 'del_002',
    webhookId: 'wh_quickbooks_001',
    event: 'invoice.created',
    status: 'success' as const,
    timestamp: new Date('2025-01-31T11:25:00Z'),
    responseCode: 200,
    responseTime: 89,
    attempts: 1,
    payload: { invoice_id: 'inv_456', amount: 1200 }
  },
  {
    id: 'del_003',
    webhookId: 'wh_slack_001',
    event: 'message.sent',
    status: 'failed' as const,
    timestamp: new Date('2025-01-31T11:20:00Z'),
    responseCode: 500,
    responseTime: 0,
    attempts: 3,
    payload: { channel: '#general', text: 'Test message' },
    error: 'Internal Server Error'
  },
  {
    id: 'del_004',
    webhookId: 'wh_general_001',
    event: 'sync.completed',
    status: 'success' as const,
    timestamp: new Date('2025-01-31T11:15:00Z'),
    responseCode: 200,
    responseTime: 67,
    attempts: 1,
    payload: { integration: 'stripe', records_synced: 150 }
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <Activity className="h-4 w-4 text-neutral-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'error':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    default:
      return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
  }
}

interface WebhooksPageProps {
  searchParams: { from?: string }
}

export default function WebhooksPage({ searchParams }: WebhooksPageProps) {
  const fromIndustry = searchParams.from

  const handleCreateWebhook = () => {
    console.log('Creating new webhook...')
    // Implement webhook creation
  }

  const handleEditWebhook = (webhookId: string) => {
    console.log('Editing webhook:', webhookId)
    // Implement webhook editing
  }

  const handleDeleteWebhook = (webhookId: string) => {
    console.log('Deleting webhook:', webhookId)
    // Implement webhook deletion
  }

  const handleToggleWebhook = (webhookId: string, enabled: boolean) => {
    console.log('Toggling webhook:', webhookId, enabled)
    // Implement webhook toggle
  }

  const handleTestWebhook = (webhookId: string) => {
    console.log('Testing webhook:', webhookId)
    // Implement webhook testing
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    console.log('URL copied to clipboard')
  }

  const handleViewLogs = (webhookId: string) => {
    console.log('Viewing logs for webhook:', webhookId)
    // Navigate to webhook logs
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-neutral-500">
            Configure webhook endpoints and monitor event deliveries
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleCreateWebhook}>
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWebhooks.length}</div>
            <p className="text-xs text-neutral-500">
              {mockWebhooks.filter(w => w.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Send className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0).toLocaleString()}
            </div>
            <p className="text-xs text-neutral-500">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((mockWebhooks.reduce((sum, w) => sum + w.successfulDeliveries, 0) / 
                mockWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-green-600">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {mockWebhooks.reduce((sum, w) => sum + w.failedDeliveries, 0)}
            </div>
            <p className="text-xs text-neutral-500">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="webhooks">Configured Webhooks</TabsTrigger>
          <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="mt-6">
          <div className="space-y-4">
            {mockWebhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(webhook.status)}
                      <div>
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{webhook.integration}</span>
                          <Badge className={getStatusColor(webhook.status)}>
                            {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleViewLogs(webhook.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(webhook.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditWebhook(webhook.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Label className="font-medium">URL:</Label>
                      <code className="bg-neutral-900 px-2 py-1 rounded text-xs flex-1">
                        {webhook.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(webhook.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Events:</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-400">Total Deliveries</div>
                        <div className="text-lg font-semibold">{webhook.totalDeliveries.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-400">Successful</div>
                        <div className="text-lg font-semibold text-green-500">
                          {webhook.successfulDeliveries.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-400">Failed</div>
                        <div className="text-lg font-semibold text-red-500">
                          {webhook.failedDeliveries.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-400">Last Triggered</div>
                        <div className="text-sm text-neutral-300">
                          {webhook.lastTriggered.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockWebhooks.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="h-12 w-12 text-neutral-500 mb-4" />
                <CardTitle className="text-lg mb-2">No Webhooks Configured</CardTitle>
                <CardDescription className="text-center mb-4">
                  Create your first webhook to receive real-time notifications from your integrations.
                </CardDescription>
                <Button onClick={handleCreateWebhook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Deliveries</h3>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-2">
              {mockRecentDeliveries.map((delivery) => {
                const webhook = mockWebhooks.find(w => w.id === delivery.webhookId)
                return (
                  <Card key={delivery.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {delivery.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{webhook?.name}</div>
                            <div className="text-sm text-neutral-500">
                              Event: <code className="bg-neutral-900 px-1 rounded">{delivery.event}</code>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-neutral-500">
                          <div>{delivery.timestamp.toLocaleString()}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={delivery.status === 'success' ? 'default' : 'destructive'}>
                              {delivery.responseCode}
                            </Badge>
                            <span>{delivery.responseTime}ms</span>
                            {delivery.attempts > 1 && (
                              <span>({delivery.attempts} attempts)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {delivery.error && (
                        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                          <strong>Error:</strong> {delivery.error}
                        </div>
                      )}

                      <details className="mt-3">
                        <summary className="text-sm text-neutral-400 cursor-pointer hover:text-neutral-300">
                          <Code className="inline h-3 w-3 mr-1" />
                          View Payload
                        </summary>
                        <pre className="mt-2 p-3 bg-neutral-900 rounded text-xs overflow-x-auto">
                          {JSON.stringify(delivery.payload, null, 2)}
                        </pre>
                      </details>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {mockRecentDeliveries.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-neutral-500 mb-4" />
                  <CardTitle className="text-lg mb-2">No Recent Deliveries</CardTitle>
                  <CardDescription className="text-center">
                    Webhook deliveries will appear here once events start firing.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}