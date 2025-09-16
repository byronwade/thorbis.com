/**
 * Books/Accounting Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Books/Accounting Management System. This includes financial management,
 * bookkeeping, and accounting features.
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
  // Accounting specific icons
  DollarSign,
  CreditCard,
  PieChart,
  TrendingUp,
  FileText,
  Folder,
  Archive,
  Clock,
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
  Building,
  Banknote,
  Wallet,
  LineChart
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

export const booksNavigationConfig = {
  appName: 'Books & Accounting',
  industry: 'books' as const,
  primaryColor: '#1C8BFF',
  icon: BookOpen,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/books',
  
  // Sidebar configuration - DEFAULT CLOSED for clean interface
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '310px',  // Wider for accounting categories
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Books pages
  header: {
    title: 'Books & Accounting',
    subtitle: 'Financial management, bookkeeping, and reporting',
    primaryAction: {
      label: 'Quick Entry',
      href: '/dashboards/books/transactions/quick',
      icon: Calculator
    },
    secondaryActions: [
      {
        label: 'New Invoice',
        href: '/dashboards/books/invoices/new',
        icon: Receipt,
        variant: 'outline' as const
      },
      {
        label: 'Reconcile',
        href: '/dashboards/books/reconcile',
        icon: CheckCircle,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'Account Inquiry',
        href: '/dashboards/books/accounts',
        icon: 'Phone'
      },
      {
        label: 'Client Management',
        href: '/dashboards/books/customers',
        icon: 'Users'
      },
      {
        label: 'Tax Calendar',
        href: '/dashboards/books/tax/calendar',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Wade Accounting LLC',
        value: 'wade-accounting',
        icon: Building2
      },
      {
        label: 'Metro CPA Firm',
        value: 'metro-cpa',
        icon: Building
      },
      {
        label: 'QuickBooks Client',
        value: 'quickbooks-client',
        icon: BookOpen
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Client',
        value: 'switch',
        href: '/dashboards/books/clients',
        icon: Users
      },
      {
        label: 'Manage Entities',
        value: 'manage',
        href: '/dashboards/books/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for accounting
    rightSideIcons: [
      {
        label: 'Tax Alerts',
        href: '/dashboards/books/alerts',
        icon: Bell,
        badge: 2,
        variant: 'ghost' as const
      },
      {
        label: 'Bank Feeds',
        href: '/dashboards/books/banking/feeds',
        icon: Banknote,
        badge: '3 NEW',
        variant: 'ghost' as const
      },
      {
        label: 'Financial Search',
        href: '/dashboards/books/search',
        icon: Search,
        variant: 'ghost' as const
      },
      {
        label: 'Period Close',
        href: '/dashboards/books/close',
        icon: Archive,
        variant: 'ghost' as const
      },
      {
        label: 'Accounting Help',
        href: '/help/accounting',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'CPA Profile',
        href: '/profile/cpa',
        icon: User
      },
      {
        label: 'Firm Settings',
        href: '/settings/firm',
        icon: Settings
      },
      {
        label: 'Access Controls',
        href: '/preferences/access',
        icon: CheckCircle
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Tax Library',
        href: '/library/tax',
        icon: BookOpen
      },
      {
        label: 'CPA Support',
        href: '/support/cpa',
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
      title: 'Books & Accounting',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/books', 
          icon: Home, 
          description: 'Financial overview and key metrics' 
        },
        { 
          name: 'Accounts', 
          href: '/dashboards/books/accounts', 
          icon: Folder, 
          description: 'Chart of accounts and account management' 
        },
        { 
          name: 'Transactions', 
          href: '/dashboards/books/transactions', 
          icon: Receipt, 
          description: 'Journal entries and transaction history',
          badge: 45
        },
        { 
          name: 'Invoices', 
          href: '/dashboards/books/invoices', 
          icon: FileText, 
          description: 'Billing and accounts receivable',
          badge: 12
        },
        { 
          name: 'Bills', 
          href: '/dashboards/books/bills', 
          icon: CreditCard, 
          description: 'Accounts payable and vendor bills',
          badge: 8
        },
        { 
          name: 'Banking', 
          href: '/dashboards/books/banking', 
          icon: Banknote, 
          description: 'Bank reconciliation and cash management' 
        },
        { 
          name: 'Reports', 
          href: '/dashboards/books/reports', 
          icon: BarChart3, 
          description: 'Financial statements and custom reports' 
        },
        { 
          name: 'Tax', 
          href: '/dashboards/books/tax', 
          icon: Calculator, 
          description: 'Tax preparation and compliance' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type BooksNavigationConfig = typeof booksNavigationConfig