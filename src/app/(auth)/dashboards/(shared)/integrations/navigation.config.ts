import { 
  Plug,
  Activity,
  Settings,
  BarChart3,
  Shield,
  Key,
  Webhook,
  Database,
  Cloud,
  Zap,
  GitBranch,
  Globe,
  Code,
  RefreshCw
} from "lucide-react"

export const integrationsNavigationConfig = {
  appName: 'Integrations',
  description: 'Third-party service connections and API management',
  backContext: {
    label: 'Back to Overview',
    href: '/dashboards'
  },
  sections: [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'Overview',
          href: '/dashboards/integrations',
          icon: Plug,
          description: 'Integration management dashboard'
        },
        {
          name: 'Health Monitor',
          href: '/dashboards/integrations/health',
          icon: Activity,
          description: 'Real-time integration health and status'
        },
        {
          name: 'Analytics',
          href: '/dashboards/integrations/analytics',
          icon: BarChart3,
          description: 'Usage metrics and performance insights'
        }
      ]
    },
    {
      title: 'Configuration',
      items: [
        {
          name: 'Connections',
          href: '/dashboards/integrations/connections',
          icon: Globe,
          description: 'Manage third-party service connections'
        },
        {
          name: 'API Keys',
          href: '/dashboards/integrations/api-keys',
          icon: Key,
          description: 'Manage API keys and authentication'
        },
        {
          name: 'Webhooks',
          href: '/dashboards/integrations/webhooks',
          icon: Webhook,
          description: 'Configure webhook endpoints and events'
        },
        {
          name: 'Settings',
          href: '/dashboards/settings',
          icon: Settings,
          description: 'Integration preferences and global settings'
        }
      ]
    },
    {
      title: 'Data & Sync',
      items: [
        {
          name: 'Data Mapping',
          href: '/dashboards/integrations/data-mapping',
          icon: GitBranch,
          description: 'Configure data field mapping and transformations'
        },
        {
          name: 'Sync Jobs',
          href: '/dashboards/integrations/sync',
          icon: RefreshCw,
          description: 'Monitor and manage data synchronization'
        },
        {
          name: 'Data Sources',
          href: '/dashboards/integrations/data-sources',
          icon: Database,
          description: 'Manage external data sources and connections'
        }
      ]
    },
    {
      title: 'Automation',
      items: [
        {
          name: 'Workflows',
          href: '/dashboards/integrations/workflows',
          icon: Zap,
          description: 'Automated integration workflows and triggers'
        },
        {
          name: 'Cloud Functions',
          href: '/dashboards/integrations/functions',
          icon: Cloud,
          description: 'Serverless integration functions and logic'
        },
        {
          name: 'Custom Code',
          href: '/dashboards/integrations/custom',
          icon: Code,
          description: 'Custom integration scripts and handlers'
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          name: 'Security Center',
          href: '/dashboards/integrations/security',
          icon: Shield,
          description: 'Security monitoring and compliance'
        }
      ]
    }
  ]
}