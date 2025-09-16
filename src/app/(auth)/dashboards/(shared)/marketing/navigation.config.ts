/**
 * Marketing Navigation Configuration
 * 
 * Defines the navigation structure for marketing and customer acquisition.
 * This is a shared feature available across all industries.
 */

import {
  Megaphone,
  Users,
  Mail,
  BarChart3,
  Target,
  Camera,
  Globe,
  Calendar,
  TrendingUp,
  Star,
  MessageSquare,
  Smartphone,
  Monitor
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  isNew?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface SidebarConfig {
  defaultOpen?: boolean
  showToggleIcon?: boolean
  collapsible?: boolean
  variant?: 'sidebar' | 'floating' | 'inset'
  width?: string
  position?: 'left' | 'right'
}

export const marketingNavigationConfig = {
  appName: 'Marketing Hub',
  industry: 'marketing' as const,
  primaryColor: '#F59E0B',
  icon: Megaphone,
  
  // Main dashboard route for marketing
  dashboardHref: '/dashboards/marketing',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '300px',  // Standard width for marketing tools
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'Marketing Hub',
    subtitle: 'Customer acquisition, campaigns, and growth',
    actions: [
      {
        label: 'New Campaign',
        href: '/dashboards/marketing/campaigns/new',
        icon: 'Target'
      },
      {
        label: 'Lead Management',
        href: '/dashboards/marketing/leads',
        icon: 'Users'
      },
      {
        label: 'Analytics',
        href: '/dashboards/marketing/analytics',
        icon: 'BarChart3'
      }
    ]
  },

  // Marketing-specific navigation sections - standardized structure
  sections: [
    {
      title: 'Marketing Overview',
      defaultExpanded: true,
      collapsible: true,
      items: [
        { 
          name: 'Marketing Overview', 
          href: '/dashboards/marketing', 
          icon: Megaphone, 
          description: 'Campaign performance and marketing metrics' 
        },
        { 
          name: 'Lead Analytics', 
          href: '/dashboards/marketing/analytics', 
          icon: TrendingUp, 
          description: 'Lead generation and conversion metrics' 
        },
        { 
          name: 'ROI Dashboard', 
          href: '/dashboards/marketing/roi', 
          icon: BarChart3, 
          description: 'Marketing return on investment tracking' 
        }
      ]
    },
    {
      title: 'Campaigns & Content',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Active Campaigns', 
          href: '/dashboards/marketing/campaigns', 
          icon: Target, 
          description: 'Manage marketing campaigns',
          badge: '4'
        },
        { 
          name: 'Email Marketing', 
          href: '/dashboards/marketing/email', 
          icon: Mail, 
          description: 'Email campaigns and automation' 
        },
        { 
          name: 'Social Media', 
          href: '/dashboards/marketing/social', 
          icon: MessageSquare, 
          description: 'Social media marketing and scheduling' 
        },
        { 
          name: 'Content Library', 
          href: '/dashboards/marketing/content', 
          icon: Camera, 
          description: 'Marketing assets and content management' 
        }
      ]
    },
    {
      title: 'Leads & Customers',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Lead Management', 
          href: '/dashboards/marketing/leads', 
          icon: Users, 
          description: 'Lead tracking and nurturing',
          badge: '23'
        },
        { 
          name: 'Customer Journey', 
          href: '/dashboards/marketing/journey', 
          icon: Globe, 
          description: 'Customer acquisition funnel analysis' 
        },
        { 
          name: 'Reviews & Reputation', 
          href: '/dashboards/marketing/reviews', 
          icon: Star, 
          description: 'Online reputation management' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type MarketingNavigationConfig = typeof marketingNavigationConfig