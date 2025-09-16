/**
 * Home Services Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Home Services vertical. This includes industry-specific navigation items,
 * quick actions, and header configurations.
 */

import {
  // Main navigation icons
  Home,
  Calendar,
  Compass,
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
  // Home Services specific icons
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
  // Enhanced navigation icons
  Search,
  Route,
  Activity,
  Zap,
  Globe,
  CreditCard,
  TrendingUp,
  Shield,
  Smartphone,
  History,
  Target,
  PieChart,
  Truck,
  Headphones,
  Bell,
  FileCheck,
  Timer,
  MapIcon as Map,
  Building,
  Gauge,
  // Additional header and UI icons
  User,
  HelpCircle,
  Code2
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

export const hsNavigationConfig = {
  appName: 'Home Services',
  industry: 'hs' as const,
  primaryColor: '#1C8BFF',
  icon: Wrench,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/hs',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '280px',
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for HS pages
  header: {
    title: 'Home Services Dashboard',
    subtitle: 'Dispatch, work orders, and field service management',
    primaryAction: {
      label: 'Emergency Dispatch',
      href: '/dashboards/hs/dispatch?priority=emergency',
      icon: AlertTriangle
    },
    secondaryActions: [
      {
        label: 'New Work Order',
        href: '/dashboards/hs/work-orders/new',
        icon: Clipboard,
        variant: 'outline' as const
      },
      {
        label: 'Schedule',
        href: '/dashboards/hs/schedule',
        icon: Calendar,
        variant: 'ghost' as const
      }
    ],
    // Quick access actions for header toolbar
    actions: [
      {
        label: 'CSR Phone',
        href: '/dashboards/hs/phone',
        icon: 'Phone'
      },
      {
        label: 'Customer Management',
        href: '/dashboards/hs/customers',
        icon: 'Users'
      },
      {
        label: 'Schedule',
        href: '/dashboards/hs/schedule',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Wade Plumbing Services',
        value: 'wade-plumbing',
        icon: Building
      },
      {
        label: 'Elite HVAC Solutions',
        value: 'elite-hvac',
        icon: Building
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Business',
        value: 'switch',
        href: '/businesses/switch',
        icon: Building
      },
      {
        label: 'Manage Businesses',
        value: 'manage',
        href: '/businesses/manage',
        icon: Settings
      }
    ],
    
    rightSideIcons: [
      {
        label: 'Notifications',
        href: '/notifications',
        icon: Bell,
        badge: 3,
        variant: 'ghost' as const
      },
      {
        label: 'Help & Support',
        href: '/help',
        icon: HelpCircle,
        variant: 'ghost' as const
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'Profile',
        href: '/profile',
        icon: User
      },
      {
        label: 'Account Settings',
        href: '/account',
        icon: Settings
      },
      {
        label: 'Billing',
        href: '/billing',
        icon: CreditCard
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Help Center',
        href: '/help',
        icon: HelpCircle
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Sign Out',
        href: '/logout',
        icon: AlertTriangle,
        variant: 'destructive' as const
      }
    ]
  } as HeaderConfig,

  // Industry-specific navigation sections - Enhanced based on ServiceTitan best practices
  sections: [
    {
      title: 'Home Services',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/hs', 
          icon: Home, 
          description: 'Main dashboard overview' 
        },
        { 
          name: 'Price Book', 
          href: '/dashboards/hs/pricebook', 
          icon: BookOpen, 
          description: 'Services, materials, and pricing' 
        },
        { 
          name: 'Invoices', 
          href: '/dashboards/hs/invoices', 
          icon: Receipt, 
          description: 'Billing and collections' 
        },
        { 
          name: 'Estimates', 
          href: '/dashboards/hs/estimates', 
          icon: Calculator, 
          description: 'Quotes and proposals' 
        },
        { 
          name: 'Schedule', 
          href: '/dashboards/hs/schedule', 
          icon: Calendar, 
          description: 'Daily schedule and appointments' 
        },
        { 
          name: 'Inventory', 
          href: '/dashboards/hs/inventory', 
          icon: Package, 
          description: 'Parts and materials tracking' 
        },
        { 
          name: 'Communications', 
          href: '/dashboards/hs/communications', 
          icon: MessageSquare, 
          description: 'Customer and team communications' 
        },
        { 
          name: 'Customers', 
          href: '/dashboards/hs/customers', 
          icon: Users, 
          description: 'Customer database and history' 
        },
        { 
          name: 'Developers', 
          href: '/developers', 
          icon: Code2, 
          description: 'Developer tools and API documentation' 
        },
        { 
          name: 'Settings', 
          href: '/dashboards/settings', 
          icon: Settings, 
          description: 'Application settings and preferences' 
        }
      ]
    },
    {
      title: 'Command Center',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/hs', 
          icon: Home, 
          description: 'Business overview and key metrics' 
        },
        { 
          name: 'Live Job Board', 
          href: '/dashboards/hs/job-board', 
          icon: Activity, 
          description: 'Real-time job status across all technicians',
          priority: 'high' as const,
          badge: '12',
          isNew: true
        },
        { 
          name: 'Dispatch Board', 
          href: '/dashboards/hs/dispatch', 
          icon: Compass, 
          description: 'Job assignment and route optimization',
          priority: 'high' as const
        },
        { 
          name: 'Emergency Queue', 
          href: '/dashboards/hs/emergency', 
          icon: AlertTriangle, 
          description: 'Priority and emergency calls',
          badge: '2'
        }
      ]
    },
    {
      title: 'Schedule & Operations',
      defaultExpanded: true,
      items: [
        { 
          name: 'Schedule', 
          href: '/dashboards/hs/schedule', 
          icon: Calendar, 
          description: 'Daily schedule and appointments',
          badge: '34'
        },
        { 
          name: 'Route Optimization', 
          href: '/dashboards/hs/routes', 
          icon: Route, 
          description: 'Automated route planning and optimization',
          isNew: true
        },
        { 
          name: 'Work Orders', 
          href: '/dashboards/hs/work-orders', 
          icon: Clipboard, 
          description: 'All work orders and job history',
          badge: '18'
        },
        { 
          name: 'Job Status', 
          href: '/dashboards/hs/job-status', 
          icon: Gauge, 
          description: 'Track job progress and completion'
        }
      ]
    },
    {
      title: 'Customer Journey',
      items: [
        { 
          name: 'Calls & Leads', 
          href: '/dashboards/hs/calls', 
          icon: Phone, 
          description: 'Inbound calls with customer details',
          badge: '7'
        },
        { 
          name: 'Customers', 
          href: '/dashboards/hs/customers', 
          icon: Users, 
          description: 'Customer database and profiles' 
        },
        { 
          name: 'Service History', 
          href: '/dashboards/hs/service-history', 
          icon: History, 
          description: 'Complete customer service records',
          isNew: true
        },
        { 
          name: 'Customer Portal', 
          href: '/dashboards/hs/(users)/portal', 
          icon: Globe, 
          description: '24/7 customer self-service portal',
          isNew: true
        }
      ]
    },
    {
      title: 'Financial Management',
      items: [
        { 
          name: 'Estimates', 
          href: '/dashboards/hs/estimates', 
          icon: Calculator, 
          description: 'Quotes and proposals',
          badge: '9'
        },
        { 
          name: 'Invoices', 
          href: '/dashboards/hs/invoices', 
          icon: Receipt, 
          description: 'Billing and payment processing',
          badge: '28'
        },
        { 
          name: 'Collections', 
          href: '/dashboards/hs/collections', 
          icon: CreditCard, 
          description: 'Outstanding payments and follow-ups',
          badge: '14'
        },
        { 
          name: 'Price Book', 
          href: '/dashboards/hs/pricebook', 
          icon: BookOpen, 
          description: 'Services, materials, and pricing' 
        },
        { 
          name: 'Payments', 
          href: '/dashboards/hs/payments', 
          icon: DollarSign, 
          description: 'Payment processing and reconciliation'
        }
      ]
    },
    {
      title: 'Team & Field Operations',
      items: [
        { 
          name: 'Technicians', 
          href: '/dashboards/hs/technicians', 
          icon: UserCheck, 
          description: 'Field team management and status' 
        },
        { 
          name: 'Team Performance', 
          href: '/dashboards/hs/performance', 
          icon: TrendingUp, 
          description: 'Technician metrics and KPIs',
          isNew: true
        },
        { 
          name: 'Mobile Sync', 
          href: '/dashboards/hs/mobile-sync', 
          icon: Smartphone, 
          description: 'Field app synchronization status',
          isNew: true
        },
        { 
          name: 'Inventory', 
          href: '/dashboards/hs/inventory', 
          icon: Package, 
          description: 'Parts and materials tracking' 
        },
        { 
          name: 'Vehicles', 
          href: '/dashboards/hs/vehicles', 
          icon: Truck, 
          description: 'Fleet management and tracking'
        }
      ]
    },
    {
      title: 'Communications Hub',
      items: [
        { 
          name: 'Inbox', 
          href: '/dashboards/hs/inbox', 
          icon: MessageSquare, 
          description: 'Customer and team communications',
          badge: '6'
        },
        { 
          name: 'Customer Support', 
          href: '/dashboards/hs/support', 
          icon: Headphones, 
          description: 'Customer service and support tickets',
          badge: '3'
        },
        { 
          name: 'Notifications', 
          href: '/dashboards/hs/notifications', 
          icon: Bell, 
          description: 'System alerts and updates'
        },
        { 
          name: 'Reviews & Feedback', 
          href: '/dashboards/hs/reviews', 
          icon: Star, 
          description: 'Customer reviews and service ratings'
        }
      ]
    },
    {
      title: 'Integrations & Tools',
      items: [
        { 
          name: 'QuickBooks', 
          href: '/dashboards/hs/quickbooks', 
          icon: Building, 
          description: 'Accounting system integration'
        },
        { 
          name: 'Google Maps', 
          href: '/dashboards/hs/maps', 
          icon: Map, 
          description: 'Location services and mapping'
        },
        { 
          name: 'Time Tracking', 
          href: '/dashboards/hs/time-tracking', 
          icon: Timer, 
          description: 'Job and technician time tracking'
        },
        { 
          name: 'Quality Control', 
          href: '/dashboards/hs/quality', 
          icon: Shield, 
          description: 'Service quality assurance and checks',
          isNew: true
        }
      ]
    }
  ] as NavigationSection[]
}

export type HSNavigationConfig = typeof hsNavigationConfig