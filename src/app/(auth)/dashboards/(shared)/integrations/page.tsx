'use client'

import { Suspense, use } from 'react'
import { IntegrationsDashboard } from '@/components/integrations-dashboard'
import { IntegrationHealthMonitor } from '@/components/integration-health-monitor'
import { IntegrationCard } from '@/components/integration-card'

// Mock integration data - replace with real API calls
const mockIntegrations = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    description: 'Payment processing and billing',
    icon: '💳',
    status: 'connected' as const,
    isConnected: true,
    lastSync: new Date('2025-01-31T10:30:00Z'),
    health: 'healthy' as const,
    dataFlows: ['Customer Data', 'Payment History', 'Subscription Status'],
    aiFeatures: ['Fraud Detection', 'Risk Analysis', 'Revenue Forecasting'],
    webhooksEnabled: true,
    createdAt: '2025-01-01',
    syncedRecords: 1250,
    errorCount: 2,
    accuracy: 99.8,
    setupComplexity: 'Easy' as const,
    monthlyTransactions: 1250,
    incidents: [],
    metrics: {
      apiCalls: 1250,
      successRate: 99.8,
      avgResponseTime: 120
    },
    config: {
      environment: 'production',
      webhookUrl: 'https://api.thorbis.com/webhooks/stripe'
    }
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    description: 'Accounting and financial management',
    icon: '📊',
    status: 'connected' as const,
    isConnected: true,
    lastSync: new Date('2025-01-31T11:00:00Z'),
    health: 'healthy' as const,
    dataFlows: ['Financial Records', 'Expense Reports', 'Tax Documents'],
    aiFeatures: ['Expense Categorization', 'Cash Flow Prediction', 'Tax Optimization'],
    webhooksEnabled: true,
    createdAt: '2025-01-01',
    syncedRecords: 890,
    errorCount: 1,
    accuracy: 98.5,
    setupComplexity: 'Medium' as const,
    monthlyTransactions: 890,
    incidents: [],
    metrics: {
      apiCalls: 890,
      successRate: 98.5,
      avgResponseTime: 250
    },
    config: {
      companyId: 'comp_123456789',
      syncFrequency: 'hourly'
    }
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'scheduling',
    description: 'Calendar and scheduling integration',
    icon: '📅',
    status: 'warning' as const,
    isConnected: true,
    lastSync: new Date('2025-01-31T08:30:00Z'),
    health: 'degraded' as const,
    dataFlows: ['Calendar Events', 'Meeting Schedules', 'Availability Data'],
    aiFeatures: ['Smart Scheduling', 'Meeting Optimization', 'Time Analytics'],
    webhooksEnabled: true,
    createdAt: '2025-01-01',
    syncedRecords: 450,
    errorCount: 8,
    accuracy: 95.2,
    setupComplexity: 'Easy' as const,
    monthlyTransactions: 450,
    incidents: [
      {
        id: 'cal-inc-1',
        title: 'Sync Delays',
        description: 'Calendar events experiencing delayed synchronization',
        severity: 'medium',
        status: 'investigating',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        affectedIntegrations: ['google-calendar']
      }
    ],
    metrics: {
      apiCalls: 450,
      successRate: 95.2,
      avgResponseTime: 180
    },
    config: {
      calendarId: 'primary',
      syncDirection: 'bidirectional'
    }
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    description: 'Email marketing automation',
    icon: '📧',
    status: 'disconnected' as const,
    isConnected: false,
    lastSync: null,
    health: 'offline' as const,
    dataFlows: ['Email Lists', 'Campaign Analytics', 'Subscriber Data'],
    aiFeatures: ['Content Optimization', 'Send Time Prediction', 'Audience Segmentation'],
    webhooksEnabled: false,
    createdAt: '2025-01-01',
    syncedRecords: 0,
    errorCount: 0,
    accuracy: 0,
    setupComplexity: 'Medium' as const,
    monthlyTransactions: 0,
    incidents: [],
    metrics: {
      apiCalls: 0,
      successRate: 0,
      avgResponseTime: 0
    },
    config: Record<string, unknown>
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    description: 'Workflow automation platform',
    icon: '⚡',
    status: 'available' as const,
    isConnected: false,
    lastSync: null,
    health: 'unknown' as const,
    dataFlows: ['Workflow Triggers', 'Action Results', 'Process Logs'],
    aiFeatures: ['Workflow Optimization', 'Error Prediction', 'Smart Routing'],
    webhooksEnabled: false,
    createdAt: '2025-01-01',
    syncedRecords: 0,
    errorCount: 0,
    accuracy: 0,
    setupComplexity: 'Hard' as const,
    monthlyTransactions: 0,
    incidents: [],
    metrics: {
      apiCalls: 0,
      successRate: 0,
      avgResponseTime: 0
    },
    config: Record<string, unknown>
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Team communication and notifications',
    icon: '💬',
    status: 'connected' as const,
    isConnected: true,
    lastSync: new Date('2025-01-31T11:15:00Z'),
    health: 'healthy' as const,
    dataFlows: ['Messages', 'Channel Activity', 'User Status'],
    aiFeatures: ['Smart Notifications', 'Sentiment Analysis', 'Thread Summarization'],
    webhooksEnabled: true,
    createdAt: '2025-01-01',
    syncedRecords: 325,
    errorCount: 0,
    accuracy: 99.1,
    setupComplexity: 'Easy' as const,
    monthlyTransactions: 325,
    incidents: [],
    metrics: {
      apiCalls: 325,
      successRate: 99.1,
      avgResponseTime: 95
    },
    config: {
      workspace: 'thorbis-team',
      defaultChannel: '#integrations'
    }
  }
]

const mockStats = {
  totalIntegrations: mockIntegrations.length,
  connectedIntegrations: mockIntegrations.filter(i => i.isConnected).length,
  totalApiCalls: mockIntegrations.reduce((sum, i) => sum + i.metrics.apiCalls, 0),
  averageHealth: 95.2,
  activeWebhooks: 8,
  failedJobs: 2
}

const mockCategories = [
  {
    name: 'Financial Data',
    integrations: mockIntegrations.filter(i => i.category === 'payments' || i.category === 'accounting').length,
    monthlyVolume: 3140,
    accuracy: 99.2,
    description: 'Payment processing, accounting, and financial reporting data'
  },
  {
    name: 'Communication',
    integrations: mockIntegrations.filter(i => i.category === 'communication').length,
    monthlyVolume: 325,
    accuracy: 99.1,
    description: 'Team communication, notifications, and messaging systems'
  },
  {
    name: 'Scheduling',
    integrations: mockIntegrations.filter(i => i.category === 'scheduling').length,
    monthlyVolume: 450,
    accuracy: 95.2,
    description: 'Calendar integration, scheduling, and meeting management'
  },
  {
    name: 'Marketing',
    integrations: mockIntegrations.filter(i => i.category === 'marketing').length,
    monthlyVolume: 0,
    accuracy: 0,
    description: 'Email marketing, campaigns, and customer engagement tools'
  },
  {
    name: 'Automation',
    integrations: mockIntegrations.filter(i => i.category === 'automation').length,
    monthlyVolume: 0,
    accuracy: 0,
    description: 'Workflow automation, process optimization, and system integration'
  }
]

const mockInsights = [
  {
    type: 'recommendation' as const,
    title: 'High API Usage Detected',
    description: 'Stripe integration is approaching rate limits. Consider upgrading your plan.',
    severity: 'warning' as const,
    actionLabel: 'Review Usage',
    timestamp: new Date('2025-01-31T10:00:00Z')
  },
  {
    type: 'alert' as const,
    title: 'Sync Failure',
    description: 'Google Calendar sync failed due to authentication error.',
    severity: 'error' as const,
    actionLabel: 'Reconnect',
    timestamp: new Date('2025-01-31T09:30:00Z')
  },
  {
    type: 'optimization' as const,
    title: 'Integration Opportunity',
    description: 'Connect Mailchimp to automate customer email campaigns.',
    severity: 'info' as const,
    actionLabel: 'Learn More',
    timestamp: new Date('2025-01-31T08:00:00Z')
  }
]

interface IntegrationsPageProps {
  searchParams: Promise<{ from?: string }>
}

export default function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const params = use(searchParams)
  const fromIndustry = params?.from

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
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-neutral-500">
            Manage your third-party service connections and API integrations
            {fromIndustry && (
              <span className="ml-2 px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-md">
                From {fromIndustry.toUpperCase()}
              </span>
            )}
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }>
        <IntegrationsDashboard
          integrations={mockIntegrations}
          stats={mockStats}
          categories={mockCategories}
          insights={mockInsights}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onConfigure={handleConfigure}
          onSync={handleSync}
          className="w-full"
        />
      </Suspense>

      {/* Quick Health Overview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <Suspense fallback={
          <div className="h-48 bg-neutral-900 rounded-lg animate-pulse"></div>
        }>
          <IntegrationHealthMonitor
            onRefresh={() => console.log('Refreshing health data')}
            onViewDetails={(id) => console.log('Viewing details for:', id)}
            className="w-full"
          />
        </Suspense>
      </div>

      {/* Featured Integrations */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Featured Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockIntegrations
            .filter(integration => ['stripe', 'quickbooks', 'zapier'].includes(integration.id))
            .map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                variant={integration.isConnected ? 'connected' : 'available'}
                onConnect={() => handleConnect(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
                onConfigure={() => handleConfigure(integration.id)}
                onSync={() => handleSync(integration.id)}
              />
            ))}
        </div>
      </div>
    </div>
  )
}