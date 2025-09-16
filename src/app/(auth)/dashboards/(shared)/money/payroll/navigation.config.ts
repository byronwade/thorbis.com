/**
 * Payroll Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Payroll Management System. This includes employee management, payroll processing,
 * and HR features.
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
  // Payroll specific icons
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  TrendingUp,
  Shield,
  Award,
  Building,
  Briefcase,
  Heart,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Settings,
  Monitor,
  // Additional header and UI icons
  Bell,
  HelpCircle,
  User,
  Share2,
  Eye,
  MoreVertical,
  Code2,
  Timer,
  RefreshCw,
  Download,
  Building2,
  Search,
  Target,
  Phone,
  MapPin,
  UserCircle,
  Wallet,
  BadgeCheck,
  ClipboardCheck
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

export const payrollNavigationConfig = {
  appName: 'Payroll & HR',
  industry: 'payroll' as const,
  primaryColor: '#1C8BFF',
  icon: Users,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/payroll',
  
  // Sidebar configuration - DEFAULT CLOSED for clean interface
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '305px',  // Wider for HR categories
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Payroll pages
  header: {
    title: 'Payroll & HR Manager',
    subtitle: 'Employee management, payroll processing, and benefits',
    primaryAction: {
      label: 'Run Payroll',
      href: '/dashboards/payroll/run',
      icon: Calculator
    },
    secondaryActions: [
      {
        label: 'Time Clock',
        href: '/dashboards/payroll/timeclock',
        icon: Clock,
        variant: 'outline' as const
      },
      {
        label: 'New Employee',
        href: '/dashboards/payroll/employees/new',
        icon: UserPlus,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'HR Hotline',
        href: '/dashboards/payroll/hotline',
        icon: 'Phone'
      },
      {
        label: 'Employee Directory',
        href: '/dashboards/payroll/directory',
        icon: 'Users'
      },
      {
        label: 'Payroll Schedule',
        href: '/dashboards/payroll/schedule',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Wade Enterprises',
        value: 'wade-enterprises',
        icon: Building2
      },
      {
        label: 'Metro Construction',
        value: 'metro-construction',
        icon: Building
      },
      {
        label: 'Tech Solutions Inc',
        value: 'tech-solutions',
        icon: Monitor
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Company',
        value: 'switch',
        href: '/dashboards/payroll/companies',
        icon: Building
      },
      {
        label: 'Manage Entities',
        value: 'manage',
        href: '/dashboards/payroll/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for payroll
    rightSideIcons: [
      {
        label: 'Compliance Alerts',
        href: '/dashboards/payroll/compliance/alerts',
        icon: Bell,
        badge: 1,
        variant: 'ghost' as const
      },
      {
        label: 'Time Tracking',
        href: '/dashboards/payroll/time/live',
        icon: Clock,
        badge: '42 ACTIVE',
        variant: 'ghost' as const
      },
      {
        label: 'Employee Search',
        href: '/dashboards/payroll/employees/search',
        icon: Search,
        variant: 'ghost' as const
      },
      {
        label: 'Benefits Portal',
        href: '/dashboards/payroll/benefits/portal',
        icon: Heart,
        variant: 'ghost' as const
      },
      {
        label: 'Payroll Help',
        href: '/help/payroll',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'HR Profile',
        href: '/profile/hr',
        icon: User
      },
      {
        label: 'Company Settings',
        href: '/settings/company',
        icon: Settings
      },
      {
        label: 'Payroll Preferences',
        href: '/preferences/payroll',
        icon: Calculator
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Compliance Library',
        href: '/library/compliance',
        icon: BookOpen
      },
      {
        label: 'HR Support',
        href: '/support/hr',
        icon: MessageSquare
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

  // Industry-specific navigation sections
  sections: [
    {
      title: 'Payroll & HR',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/payroll', 
          icon: Home, 
          description: 'Payroll overview and HR metrics' 
        },
        { 
          name: 'Employees', 
          href: '/dashboards/payroll/employees', 
          icon: Users, 
          description: 'Employee directory and management',
          badge: 127
        },
        { 
          name: 'Payroll', 
          href: '/dashboards/payroll/payroll', 
          icon: Calculator, 
          description: 'Payroll processing and payments',
          badge: 'PENDING'
        },
        { 
          name: 'Time & Attendance', 
          href: '/dashboards/payroll/time', 
          icon: Clock, 
          description: 'Time tracking and attendance management',
          badge: 42
        },
        { 
          name: 'Benefits', 
          href: '/dashboards/payroll/benefits', 
          icon: Heart, 
          description: 'Employee benefits and enrollment' 
        },
        { 
          name: 'Compliance', 
          href: '/dashboards/payroll/compliance', 
          icon: Shield, 
          description: 'Labor law compliance and reporting',
          badge: 1
        },
        { 
          name: 'Reports', 
          href: '/dashboards/payroll/reports', 
          icon: BarChart3, 
          description: 'Payroll and HR analytics' 
        },
        { 
          name: 'Tax Forms', 
          href: '/dashboards/payroll/tax', 
          icon: FileText, 
          description: 'W-2s, 1099s, and tax documentation' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type PayrollNavigationConfig = typeof payrollNavigationConfig