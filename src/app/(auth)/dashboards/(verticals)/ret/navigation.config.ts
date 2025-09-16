/**
 * Retail Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Retail vertical. This includes industry-specific navigation items,
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
  // Retail specific icons
  Store,
  ShoppingCart,
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
  CreditCard,
  Tag,
  Truck,
  Building,
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
  TrendingUp
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

export const retNavigationConfig = {
  appName: 'Retail Manager',
  industry: 'ret' as const,
  primaryColor: '#1C8BFF',
  icon: Store,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/ret',
  
  // Sidebar configuration - DEFAULT CLOSED for clean interface
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '285px',  // Standard width for retail
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Retail pages
  header: {
    title: 'Retail Manager',
    subtitle: 'Point of sale, inventory, and customer management',
    primaryAction: {
      label: 'Quick Sale',
      href: '/dashboards/ret/pos?mode=quick',
      icon: ShoppingCart
    },
    secondaryActions: [
      {
        label: 'New Order',
        href: '/dashboards/ret/orders/new',
        icon: Clipboard,
        variant: 'outline' as const
      },
      {
        label: 'Inventory Check',
        href: '/dashboards/ret/inventory',
        icon: Package,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'Store Phone',
        href: '/dashboards/ret/phone',
        icon: 'Phone'
      },
      {
        label: 'Customer Database',
        href: '/dashboards/ret/customers',
        icon: 'Users'
      },
      {
        label: 'Daily Schedule',
        href: '/dashboards/ret/schedule',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Downtown Boutique',
        value: 'downtown-boutique',
        icon: Building2
      },
      {
        label: 'Mall Store #24',
        value: 'mall-store-24',
        icon: Store
      },
      {
        label: 'Outlet Center',
        value: 'outlet-center',
        icon: Tag
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Store',
        value: 'switch',
        href: '/dashboards/ret/stores',
        icon: MapPin
      },
      {
        label: 'Manage Locations',
        value: 'manage',
        href: '/dashboards/ret/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for retail
    rightSideIcons: [
      {
        label: 'Sale Alerts',
        href: '/dashboards/ret/alerts',
        icon: Bell,
        badge: 4,
        variant: 'ghost' as const
      },
      {
        label: 'Live Sales',
        href: '/dashboards/ret/live-sales',
        icon: Monitor,
        badge: '$2.4K',
        variant: 'ghost' as const
      },
      {
        label: 'Product Search',
        href: '/dashboards/ret/products/search',
        icon: Search,
        variant: 'ghost' as const
      },
      {
        label: 'Store Performance',
        href: '/dashboards/ret/performance',
        icon: TrendingUp,
        variant: 'ghost' as const
      },
      {
        label: 'Retail Help',
        href: '/help/retail',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'Associate Profile',
        href: '/profile/associate',
        icon: User
      },
      {
        label: 'Store Settings',
        href: '/settings/store',
        icon: Settings
      },
      {
        label: 'POS Preferences',
        href: '/preferences/pos',
        icon: CreditCard
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'Product Training',
        href: '/training/products',
        icon: BookOpen
      },
      {
        label: 'Store Support',
        href: '/support/store',
        icon: MessageSquare
      },
      {
        label: 'separator',
        href: ',
        separator: true
      },
      {
        label: 'End Shift',
        href: '/logout',
        icon: AlertTriangle,
        variant: 'destructive' as const
      }
    ]
  } as HeaderConfig,

  // Industry-specific navigation sections
  sections: [
    {
      title: 'Retail',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/ret', 
          icon: Home, 
          description: 'Retail store overview and daily metrics' 
        },
        { 
          name: 'POS System', 
          href: '/dashboards/ret/pos', 
          icon: ShoppingCart, 
          description: 'Point of sale and payment processing',
          badge: 'LIVE'
        },
        { 
          name: 'Orders', 
          href: '/dashboards/ret/orders', 
          icon: Clipboard, 
          description: 'Customer orders and fulfillment',
          badge: 7
        },
        { 
          name: 'Products', 
          href: '/dashboards/ret/products', 
          icon: Tag, 
          description: 'Product catalog and pricing' 
        },
        { 
          name: 'Inventory', 
          href: '/dashboards/ret/inventory', 
          icon: Package, 
          description: 'Stock levels and reorder management',
          badge: 'LOW'
        },
        { 
          name: 'Customers', 
          href: '/dashboards/ret/customers', 
          icon: Users, 
          description: 'Customer database and purchase history' 
        },
        { 
          name: 'Receipts', 
          href: '/dashboards/ret/receipts', 
          icon: Receipt, 
          description: 'Sales receipts and transaction history' 
        },
        { 
          name: 'Reports', 
          href: '/dashboards/ret/reports', 
          icon: BarChart3, 
          description: 'Sales performance and analytics' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type RetailNavigationConfig = typeof retNavigationConfig