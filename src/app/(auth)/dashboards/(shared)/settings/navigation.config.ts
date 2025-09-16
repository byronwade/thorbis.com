import { 
  User, Shield, CreditCard, Webhook, Users, Bell,
  Settings, Zap, Database, Key, Globe, Code,
  RefreshCw, BarChart3, Activity
} from "lucide-react"

export const settingsNavigationConfig = {
  appName: 'Settings',
  description: 'Account and application preferences',
  backContext: {
    label: 'Back to Dashboard',
    href: '/dashboards'
  },
  sections: [
    {
      title: 'Account',
      items: [
        {
          name: 'General',
          href: '/dashboards/settings/general',
          icon: User,
          description: 'Profile and account preferences'
        },
        {
          name: 'Authentication & Security',
          href: '/dashboards/settings/security',
          icon: Shield,
          description: 'Password, 2FA, and access logs'
        }
      ]
    },
    {
      title: 'Organization',
      items: [
        {
          name: 'Billing & Usage',
          href: '/dashboards/settings/billing',
          icon: CreditCard,
          description: 'Subscription, usage, and invoices'
        },
        {
          name: 'Team & Access',
          href: '/dashboards/settings/team',
          icon: Users,
          description: 'Members, roles, and permissions'
        }
      ]
    },
    {
      title: 'Configuration',
      items: [
        {
          name: 'Integrations & API',
          href: '/dashboards/settings/integrations',
          icon: Webhook,
          description: 'API keys, webhooks, and connections'
        },
        {
          name: 'Notifications',
          href: '/dashboards/settings/notifications',
          icon: Bell,
          description: 'Email, push, and alert preferences'
        }
      ]
    }
  ]
}

export type SettingsNavigationConfig = typeof settingsNavigationConfig