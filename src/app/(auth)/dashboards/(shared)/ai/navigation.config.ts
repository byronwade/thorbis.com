/**
 * AI Navigation Configuration
 * 
 * Defines the navigation structure for AI assistant and automation.
 * This is a shared feature available across all industries.
 */

import {
  Brain,
  MessageSquare,
  Zap,
  BarChart3,
  Settings,
  Bot,
  Workflow,
  FileText,
  Lightbulb,
  Target,
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

export const aiNavigationConfig = {
  appName: 'AI Assistant',
  industry: 'ai' as const,
  primaryColor: '#8B5CF6',
  icon: Brain,
  
  // Main dashboard route for AI
  dashboardHref: '/dashboards/ai',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '300px',  // Standard width for AI tools
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'AI Assistant',
    subtitle: 'Intelligent automation and business insights',
    actions: [
      {
        label: 'New Chat',
        href: '/dashboards/ai/chat/new',
        icon: 'MessageSquare'
      },
      {
        label: 'Automations',
        href: '/dashboards/ai/automations',
        icon: 'Zap'
      },
      {
        label: 'AI Insights',
        href: '/dashboards/ai/insights',
        icon: 'Lightbulb'
      }
    ]
  },

  // AI-specific navigation sections - standardized structure
  sections: [
    {
      title: 'AI Overview',
      defaultExpanded: true,
      collapsible: false,
      items: [
        { 
          name: 'AI Overview', 
          href: '/dashboards/ai', 
          icon: Brain, 
          description: 'AI assistant dashboard and capabilities' 
        },
        { 
          name: 'Chat Interface', 
          href: '/dashboards/ai/chat', 
          icon: MessageSquare, 
          description: 'Interactive AI conversations and support' 
        },
        { 
          name: 'AI Insights', 
          href: '/dashboards/ai/insights', 
          icon: Lightbulb, 
          description: 'Business insights and recommendations' 
        }
      ]
    },
    {
      title: 'Automation & Workflows',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Automations', 
          href: '/dashboards/ai/automations', 
          icon: Zap, 
          description: 'AI-powered business automation',
          badge: '8'
        },
        { 
          name: 'Workflows', 
          href: '/dashboards/ai/workflows', 
          icon: Workflow, 
          description: 'Custom workflow automation' 
        },
        { 
          name: 'AI Agents', 
          href: '/dashboards/ai/agents', 
          icon: Bot, 
          description: 'Specialized AI agents for specific tasks',
          isNew: true
        }
      ]
    },
    {
      title: 'Analytics & Reports',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'AI Performance', 
          href: '/dashboards/ai/performance', 
          icon: BarChart3, 
          description: 'AI usage and performance analytics' 
        },
        { 
          name: 'Generated Reports', 
          href: '/dashboards/ai/reports', 
          icon: FileText, 
          description: 'AI-generated business reports' 
        },
        { 
          name: 'Predictive Analytics', 
          href: '/dashboards/ai/predictions', 
          icon: Target, 
          description: 'AI-powered business forecasting' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type AINavigationConfig = typeof aiNavigationConfig