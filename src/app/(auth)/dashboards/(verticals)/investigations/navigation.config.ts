/**
 * Investigations Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Investigations vertical. This includes industry-specific navigation items,
 * quick actions, and header configurations.
 */

import {
  // Main navigation icons
  Home,
  Calendar,
  Clipboard,
  Users,
  Calculator,
  Receipt,
  BookOpen,
  MessageSquare,
  UserPlus,
  UserCheck,
  Package,
  BarChart3,
  // Investigations specific icons
  Search,
  Shield,
  Phone,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  Settings,
  Monitor,
  Brain,
  Camera,
  Fingerprint,
  Eye,
  Database,
  Lock,
  UserX,
  Activity,
  // Additional header and UI icons
  Bell,
  HelpCircle,
  User,
  Share2,
  MoreVertical,
  Code2,
  Timer,
  RefreshCw,
  Download,
  Building2,
  Target,
  Zap,
  Microscope,
  ShieldCheck
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

export interface HeaderConfig {
  title: string
  subtitle?: string
  primaryAction?: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  secondaryActions?: Array<{
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'outline' | 'ghost'
  }>
  actions?: Array<{
    label: string
    href: string
    icon: string
  }>
  quickStats?: Array<{
    label: string
    value: string
    change?: string
    trend?: 'up' | 'down' | 'neutral'
  }>
  // Advanced header controls
  showBusinessDropdown?: boolean
  businessDropdownOptions?: Array<{
    label: string
    value: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    separator?: boolean
  }>
  rightSideIcons?: Array<{
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    variant?: 'default' | 'ghost' | 'outline'
  }>
  userDropdownOptions?: Array<{
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    separator?: boolean
    variant?: 'default' | 'destructive'
  }>
}

export interface SidebarConfig {
  defaultOpen?: boolean
  showToggleIcon?: boolean
  collapsible?: boolean
  variant?: 'sidebar' | 'floating' | 'inset'
  width?: string
  position?: 'left' | 'right'
}

export const investigationsNavigationConfig = {
  appName: 'Investigation Manager',
  industry: 'investigations' as const,
  primaryColor: '#1C8BFF',
  icon: Search,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/investigations',
  
  // Sidebar configuration - CLOSED BY DEFAULT for sensitive investigations
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '320px',  // Wider for case management
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Investigations pages
  header: {
    title: 'Investigation Manager',
    subtitle: 'Case management, evidence tracking, and forensic analysis',
    primaryAction: {
      label: 'Emergency Case',
      href: '/dashboards/investigations/cases/new?priority=emergency',
      icon: AlertTriangle
    },
    secondaryActions: [
      {
        label: 'New Case',
        href: '/dashboards/investigations/cases/new',
        icon: Clipboard,
        variant: 'outline' as const
      },
      {
        label: 'Evidence Lab',
        href: '/dashboards/investigations/evidence',
        icon: Camera,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'Dispatch',
        href: '/dashboards/investigations/dispatch',
        icon: 'Phone'
      },
      {
        label: 'Case Database',
        href: '/dashboards/investigations/cases',
        icon: 'Database'
      },
      {
        label: 'Evidence Tracking',
        href: '/dashboards/investigations/evidence',
        icon: 'Camera'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Metro Police Dept',
        value: 'metro-police',
        icon: Building2
      },
      {
        label: 'Federal Task Force',
        value: 'federal-task',
        icon: ShieldCheck
      },
      {
        label: 'Private Investigations',
        value: 'private-invest',
        icon: Search
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Department',
        value: 'switch',
        href: '/dashboards/investigations/departments',
        icon: Building2
      },
      {
        label: 'Manage Jurisdictions',
        value: 'manage',
        href: '/dashboards/investigations/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for investigations
    rightSideIcons: [
      {
        label: 'Critical Alerts',
        href: '/dashboards/investigations/alerts',
        icon: Bell,
        badge: 2,
        variant: 'ghost' as const
      },
      {
        label: 'Active Cases',
        href: '/dashboards/investigations/cases/active',
        icon: Monitor,
        badge: '5 LIVE',
        variant: 'ghost' as const
      },
      {
        label: 'Evidence Search',
        href: '/dashboards/investigations/evidence/search',
        icon: Search,
        variant: 'ghost' as const
      },
      {
        label: 'Lab Analysis',
        href: '/dashboards/investigations/lab',
        icon: Microscope,
        variant: 'ghost' as const
      },
      {
        label: 'Investigation Help',
        href: '/help/investigations',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'Detective Profile',
        href: '/profile/detective',
        icon: User
      },
      {
        label: 'Security Settings',
        href: '/settings/security',
        icon: Settings
      },
      {
        label: 'Access Permissions',
        href: '/preferences/access',
        icon: Lock
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Legal Resources',
        href: '/legal/resources',
        icon: BookOpen
      },
      {
        label: 'Investigation Support',
        href: '/support/investigation',
        icon: MessageSquare
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'End Session',
        href: '/logout',
        icon: AlertTriangle,
        variant: 'destructive' as const
      }
    ]
  } as HeaderConfig,

  // Industry-specific navigation sections
  sections: [
    {
      title: 'Investigations',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/investigations', 
          icon: Home, 
          description: 'Investigation overview and active cases' 
        },
        { 
          name: 'Cases', 
          href: '/dashboards/investigations/cases', 
          icon: Clipboard, 
          description: 'Active investigations and case management',
          badge: 5
        },
        { 
          name: 'Evidence', 
          href: '/dashboards/investigations/evidence', 
          icon: Camera, 
          description: 'Evidence vault and chain of custody' 
        },
        { 
          name: 'Forensics', 
          href: '/dashboards/investigations/forensics', 
          icon: Fingerprint, 
          description: 'Digital forensics and lab analysis' 
        },
        { 
          name: 'Intelligence', 
          href: '/dashboards/investigations/intelligence', 
          icon: Brain, 
          description: 'AI-powered insights and patterns' 
        },
        { 
          name: 'Suspects', 
          href: '/dashboards/investigations/suspects', 
          icon: UserX, 
          description: 'Person of interest database' 
        },
        { 
          name: 'Reports', 
          href: '/dashboards/investigations/reports', 
          icon: FileText, 
          description: 'Case reports and documentation' 
        },
        { 
          name: 'Compliance', 
          href: '/dashboards/investigations/compliance', 
          icon: Shield, 
          description: 'Legal compliance and audit trails' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type InvestigationsNavigationConfig = typeof investigationsNavigationConfig