/**
 * Auto Services Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Auto Services vertical. This includes industry-specific navigation items,
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
  // Auto Services specific icons
  Car,
  Wrench,
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
  Gauge,
  Fuel,
  Cog,
  // Additional header and UI icons
  Bell,
  HelpCircle,
  User,
  Share2,
  Eye,
  MoreVertical,
  Code2,
  CreditCard,
  Timer,
  RefreshCw,
  Download,
  Building2,
  Truck,
  Target,
  Search
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

export const autoNavigationConfig = {
  appName: 'Auto Services',
  industry: 'auto' as const,
  primaryColor: '#1C8BFF',
  icon: Car,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/auto',
  
  // Sidebar configuration - DEFAULT CLOSED for clean interface
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '290px',  // Standard width for auto services
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Auto pages
  header: {
    title: 'Auto Services Manager',
    subtitle: 'Vehicle repair, maintenance, and customer service',
    primaryAction: {
      label: 'Emergency Service',
      href: '/dashboards/auto/service?priority=emergency',
      icon: AlertTriangle
    },
    secondaryActions: [
      {
        label: 'New Repair Order',
        href: '/dashboards/auto/repair-orders/new',
        icon: Clipboard,
        variant: 'outline' as const
      },
      {
        label: 'Service Schedule',
        href: '/dashboards/auto/schedule',
        icon: Calendar,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'Service Phone',
        href: '/dashboards/auto/phone',
        icon: 'Phone'
      },
      {
        label: 'Customer Management',
        href: '/dashboards/auto/customers',
        icon: 'Users'
      },
      {
        label: 'Schedule',
        href: '/dashboards/auto/schedule',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Metro Auto Repair',
        value: 'metro-auto',
        icon: Building2
      },
      {
        label: 'Elite Car Care',
        value: 'elite-car',
        icon: Car
      },
      {
        label: 'Quick Lube Express',
        value: 'quick-lube',
        icon: Fuel
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Location',
        value: 'switch',
        href: '/dashboards/auto/locations',
        icon: MapPin
      },
      {
        label: 'Manage Shops',
        value: 'manage',
        href: '/dashboards/auto/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for auto services
    rightSideIcons: [
      {
        label: 'Service Alerts',
        href: '/dashboards/auto/alerts',
        icon: Bell,
        badge: 5,
        variant: 'ghost' as const
      },
      {
        label: 'Bay Status',
        href: '/dashboards/auto/bays/status',
        icon: Monitor,
        badge: '6/8',
        variant: 'ghost' as const
      },
      {
        label: 'Parts Lookup',
        href: '/dashboards/auto/parts/lookup',
        icon: Search,
        variant: 'ghost' as const
      },
      {
        label: 'Fleet Reports',
        href: '/dashboards/auto/fleet/reports',
        icon: Truck,
        variant: 'ghost' as const
      },
      {
        label: 'Auto Help',
        href: '/help/auto',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'Technician Profile',
        href: '/profile/technician',
        icon: User
      },
      {
        label: 'Shop Settings',
        href: '/settings/shop',
        icon: Settings
      },
      {
        label: 'Tool Preferences',
        href: '/preferences/tools',
        icon: Wrench
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Service Manuals',
        href: '/manuals/service',
        icon: BookOpen
      },
      {
        label: 'Technical Support',
        href: '/support/technical',
        icon: MessageSquare
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Clock Out',
        href: '/logout',
        icon: AlertTriangle,
        variant: 'destructive' as const
      }
    ]
  } as HeaderConfig,

  // Industry-specific navigation sections
  sections: [
    {
      title: 'Auto Services',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/auto', 
          icon: Home, 
          description: 'Auto services overview and metrics' 
        },
        { 
          name: 'Repair Orders', 
          href: '/dashboards/auto/repair-orders', 
          icon: Clipboard, 
          description: 'All repair orders and work tracking',
          badge: 12
        },
        { 
          name: 'Service Bays', 
          href: '/dashboards/auto/service-bays', 
          icon: Gauge, 
          description: 'Bay management and workflow',
          badge: '6/8'
        },
        { 
          name: 'Estimates', 
          href: '/dashboards/auto/estimates', 
          icon: Calculator, 
          description: 'Service quotes and estimates',
          badge: 3
        },
        { 
          name: 'Invoices', 
          href: '/dashboards/auto/invoices', 
          icon: Receipt, 
          description: 'Billing and payment processing',
          badge: 15
        },
        { 
          name: 'Customers', 
          href: '/dashboards/auto/customers', 
          icon: Users, 
          description: 'Customer database and vehicle history' 
        },
        { 
          name: 'Vehicles', 
          href: '/dashboards/auto/vehicles', 
          icon: Car, 
          description: 'Vehicle records and service history' 
        },
        { 
          name: 'Parts', 
          href: '/dashboards/auto/parts', 
          icon: Cog, 
          description: 'Parts catalog and inventory' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type AutoNavigationConfig = typeof autoNavigationConfig