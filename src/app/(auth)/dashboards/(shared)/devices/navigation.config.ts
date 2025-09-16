/**
 * Devices Navigation Configuration
 * 
 * Defines the navigation structure for device management and sync.
 * This is a shared feature available across all industries.
 */

import {
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  Bluetooth,
  Battery,
  Settings,
  Shield,
  RefreshCw,
  Download,
  Upload,
  AlertCircle
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

export const devicesNavigationConfig = {
  appName: 'Device Management',
  industry: 'devices' as const,
  primaryColor: '#6B7280',
  icon: Monitor,
  
  // Main dashboard route for devices
  dashboardHref: '/dashboards/devices',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '280px',  // Standard width for device management
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'Device Management',
    subtitle: 'Manage devices, sync data, and connectivity',
    actions: [
      {
        label: 'Add Device',
        href: '/dashboards/devices/add',
        icon: 'Smartphone'
      },
      {
        label: 'Sync Data',
        href: '/dashboards/devices/sync',
        icon: 'RefreshCw'
      },
      {
        label: 'Device Status',
        href: '/dashboards/devices/status',
        icon: 'Monitor'
      }
    ]
  },

  // Devices-specific navigation sections - standardized structure
  sections: [
    {
      title: 'Device Overview',
      defaultExpanded: true,
      collapsible: true,
      items: [
        { 
          name: 'Devices Overview', 
          href: '/dashboards/devices', 
          icon: Monitor, 
          description: 'All connected devices and status' 
        },
        { 
          name: 'Connectivity', 
          href: '/dashboards/devices/connectivity', 
          icon: Wifi, 
          description: 'Network and connection status' 
        },
        { 
          name: 'Sync Status', 
          href: '/dashboards/devices/sync', 
          icon: RefreshCw, 
          description: 'Data synchronization across devices' 
        }
      ]
    },
    {
      title: 'Device Types',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Mobile Devices', 
          href: '/dashboards/devices/mobile', 
          icon: Smartphone, 
          description: 'Smartphones and mobile apps',
          badge: '3'
        },
        { 
          name: 'Tablets', 
          href: '/dashboards/devices/tablets', 
          icon: Tablet, 
          description: 'Tablet devices and apps' 
        },
        { 
          name: 'Desktop/Laptop', 
          href: '/dashboards/devices/computers', 
          icon: Monitor, 
          description: 'Desktop and laptop computers' 
        }
      ]
    },
    {
      title: 'Management & Security',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Device Settings', 
          href: '/dashboards/devices/settings', 
          icon: Settings, 
          description: 'Device configuration and preferences' 
        },
        { 
          name: 'Security', 
          href: '/dashboards/devices/security', 
          icon: Shield, 
          description: 'Device security and access control' 
        },
        { 
          name: 'Alerts & Issues', 
          href: '/dashboards/devices/alerts', 
          icon: AlertCircle, 
          description: 'Device issues and notifications',
          badge: '2'
        }
      ]
    }
  ] as NavigationSection[]
}

export type DevicesNavigationConfig = typeof devicesNavigationConfig