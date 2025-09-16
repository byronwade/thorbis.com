/**
 * Restaurant Navigation Configuration
 * 
 * Defines the navigation structure, icons, and metadata specifically for the
 * Restaurant vertical. This includes industry-specific navigation items,
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
  // Restaurant specific icons
  ChefHat,
  UtensilsCrossed,
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
  Coffee,
  ShoppingCart,
  Building,
  // Additional restaurant and header icons
  CookingPot,
  Bell,
  HelpCircle,
  User,
  Share2,
  Eye,
  MoreVertical,
  Code2,
  CreditCard,
  Timer,
  Pizza,
  RefreshCw,
  Download,
  Building2
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

export const restNavigationConfig = {
  appName: 'Restaurant Manager',
  industry: 'rest' as const,
  primaryColor: '#1C8BFF',
  icon: ChefHat,
  
  // Main dashboard route for this industry
  dashboardHref: '/dashboards/rest',
  
  // Sidebar configuration - DEFAULT CLOSED for clean interface
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '300px',  // Wider for menu management
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration for Restaurant pages
  header: {
    title: 'Restaurant Manager',
    subtitle: 'POS, kitchen operations, and dining management',
    primaryAction: {
      label: 'New Order',
      href: '/dashboards/rest/pos/new-order',
      icon: ShoppingCart
    },
    secondaryActions: [
      {
        label: 'Kitchen Display',
        href: '/dashboards/rest/kitchen',
        icon: CookingPot,
        variant: 'outline' as const
      },
      {
        label: 'Today\'s Reservations',
        href: '/dashboards/rest/reservations/today',
        icon: Calendar,
        variant: 'ghost' as const
      }
    ],
    actions: [
      {
        label: 'Host Station',
        href: '/dashboards/rest/host',
        icon: 'Phone'
      },
      {
        label: 'Customer Management',
        href: '/dashboards/rest/customers',
        icon: 'Users'
      },
      {
        label: 'Reservations',
        href: '/dashboards/rest/reservations',
        icon: 'Calendar'
      }
    ],
    
    // Advanced header controls
    showBusinessDropdown: true,
    businessDropdownOptions: [
      {
        label: 'Bella Vista Bistro',
        value: 'bella-vista',
        icon: Building2
      },
      {
        label: 'Metro Coffee House',
        value: 'metro-coffee',
        icon: Coffee
      },
      {
        label: 'Downtown Pizza Co.',
        value: 'downtown-pizza',
        icon: Pizza
      },
      {
        label: 'separator',
        value: 'sep1',
        separator: true
      },
      {
        label: 'Switch Location',
        value: 'switch',
        href: '/dashboards/rest/locations',
        icon: MapPin
      },
      {
        label: 'Manage Locations',
        value: 'manage',
        href: '/dashboards/rest/manage',
        icon: Settings
      }
    ],
    
    // Custom right side icons for restaurants
    rightSideIcons: [
      {
        label: 'Kitchen Alerts',
        href: '/dashboards/rest/alerts',
        icon: Bell,
        badge: 3,
        variant: 'ghost' as const
      },
      {
        label: 'Live Orders',
        href: '/dashboards/rest/live-orders',
        icon: Monitor,
        badge: '12',
        variant: 'ghost' as const
      },
      {
        label: 'Share Menu',
        href: '/dashboards/rest/menu/share',
        icon: Share2,
        variant: 'ghost' as const
      },
      {
        label: 'View Reports',
        href: '/dashboards/rest/reports',
        icon: Eye,
        variant: 'ghost' as const
      },
      {
        label: 'Restaurant Help',
        href: '/help/restaurant',
        icon: HelpCircle,
        variant: 'ghost' as const
      }
    ],
    
    userDropdownOptions: [
      {
        label: 'Staff Profile',
        href: '/profile/staff',
        icon: User
      },
      {
        label: 'Restaurant Settings',
        href: '/settings/restaurant',
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
        label: 'Training Center',
        href: '/training/restaurant',
        icon: BookOpen
      },
      {
        label: 'Support Chat',
        href: '/support/chat',
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
      title: 'Restaurant',
      defaultExpanded: true,
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboards/rest', 
          icon: Home, 
          description: 'Restaurant overview and daily operations' 
        },
        { 
          name: 'POS System', 
          href: '/dashboards/rest/pos', 
          icon: CreditCard, 
          description: 'Point of sale and order processing',
          badge: 'LIVE'
        },
        { 
          name: 'Kitchen Display', 
          href: '/dashboards/rest/kitchen', 
          icon: CookingPot, 
          description: 'Kitchen order management system',
          badge: 8
        },
        { 
          name: 'Menu Management', 
          href: '/dashboards/rest/menu', 
          icon: UtensilsCrossed, 
          description: 'Menu items, pricing, and availability' 
        },
        { 
          name: 'Tables & Floor', 
          href: '/dashboards/rest/floor', 
          icon: Users, 
          description: 'Table management and floor plan' 
        },
        { 
          name: 'Reservations', 
          href: '/dashboards/rest/reservations', 
          icon: Calendar, 
          description: 'Booking and reservation management',
          badge: 15
        },
        { 
          name: 'Inventory', 
          href: '/dashboards/rest/inventory', 
          icon: Package, 
          description: 'Stock management and ordering' 
        },
        { 
          name: 'Staff & Shifts', 
          href: '/dashboards/rest/staff', 
          icon: Users, 
          description: 'Employee scheduling and management' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type RestaurantNavigationConfig = typeof restNavigationConfig