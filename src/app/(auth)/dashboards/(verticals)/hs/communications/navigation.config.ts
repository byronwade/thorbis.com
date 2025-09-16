/**
 * Communications Page Navigation Configuration
 * 
 * Page-specific navigation configuration for the communications page
 * that overrides the default HS config to have the sidebar closed by default
 * for better email client experience.
 */

import { hsNavigationConfig } from '../navigation.config'
import { MessageSquare } from 'lucide-react'

export const communicationsNavigationConfig = {
  ...hsNavigationConfig,
  
  // Override sidebar configuration for communications page
  sidebar: {
    ...hsNavigationConfig.sidebar,
    defaultOpen: false, // Keep sidebar closed for better email experience
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '280px',
    position: 'left' as const
  },
  
  // Override header for communications-specific context
  header: {
    ...hsNavigationConfig.header,
    title: 'Communications Hub',
    subtitle: 'Unified messaging and customer communications',
    primaryAction: {
      label: 'Compose Message',
      href: '/dashboards/hs/communications/compose',
      icon: MessageSquare
    }
  }
}

export type CommunicationsNavigationConfig = typeof communicationsNavigationConfig