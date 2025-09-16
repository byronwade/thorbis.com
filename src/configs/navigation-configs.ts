/**
 * Navigation Configurations for Industry Verticals
 * 
 * This file contains all the navigation configurations for different industry
 * verticals in the Thorbis Business OS platform. Each configuration defines
 * the navigation structure, icons, and metadata for a specific industry.
 * 
 * This centralized approach follows the REUSE FIRST, CREATE LAST principle
 * by ensuring all navigation configurations are managed in one place rather
 * than scattered across individual app files.
 * 
 * Usage:
 * - Import specific configurations in the UnifiedNavigation component
 * - Override configurations for custom navigation structures
 * - Extend configurations for new industry verticals
 */

import { UnifiedNavigationSection } from '@/components/shared/unified-navigation'
import {
  // Common icons
  Home,
  BarChart3,
  Calendar,
  FileText,
  Users,
  DollarSign,
  Package,
  // Industry icons
  Wrench,           // Home Services
  MonitorSpeaker,   // Restaurant KDS
  ChefHat,          // Restaurant
  Car,              // Auto
  Store,            // Retail
  AlertTriangle,    // Error/Warning
  Receipt,          // Receipts
  Boxes,            // Inventory
  Clock,            // Time/Payroll
  Brain,            // AI
  Building2,        // Company
  UserCheck,        // HR
  Heart,            // Benefits
  BookOpen,         // Books/Docs
  Calculator,       // Tax
  TrendingUp,       // Reports
  Sparkles,         // AI Assistant
  CreditCard,       // Payment
  Building,         // Vendors
  Wallet,           // Financial
  Shield,           // Compliance
  Trophy,           // Leaderboard
  LayoutGrid,       // Grid/Tables
  Github,           // GitHub
  Search,           // Search
  User,             // User profile
  Code2,            // API/Code
  Target,           // Marketing/Targeting
  Plug,             // Integrations
  // Navigation/routing icons
  Compass,          // Navigation/Routing 
  Clipboard,        // Lists/Tasks
  UserPlus,         // Add User
  MessageSquare,    // Communications/Inbox
  RefreshCw,        // Returns/Refresh
  ShoppingCart,     // Shopping/Orders
  Settings2,        // Settings/Configuration
  Crown,            // Executive/Crown
  Radar,            // Radar/Command Center
  Route,            // Route/Journey
  Binoculars,       // Competitive Intelligence
} from 'lucide-react'

export interface HierarchicalNavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  isNew?: boolean
}

export interface HierarchicalNavigationSection {
  title?: string
  items: HierarchicalNavigationItem[]
}

export interface SubNavigationConfig {
  title: string
  icon: React.ComponentType<{ className?: string }>
  sections: HierarchicalNavigationSection[]
}

export interface HierarchicalNavigationConfig {
  appName: string
  // Main navigation items (Dashboard, Money, Marketing, etc.)
  mainNavigation: HierarchicalNavigationItem[]
  // Sub-navigation for each main item
  subNavigation: Record<string, SubNavigationConfig>
}

export interface NavigationConfig {
  appName: string
  sections: UnifiedNavigationSection[]
  primaryColor?: string
  icon?: React.ComponentType<{ className?: string }>
}

export type Industry = 'hs' | 'rest' | 'auto' | 'ret' | 'books' | 'banking' | 'courses' | 'payroll' | 'lom' | 'investigations' | 'ai' | 'api' | 'marketing' | 'analytics'

// Main navigation items (same for all industries)
export const mainNavigationItems: HierarchicalNavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Business overview and key metrics'
  },
  {
    name: 'Money',
    href: '/money',
    icon: DollarSign,
    description: 'Financial management and reporting'
  },
  {
    name: 'Marketing',
    href: '/marketing',
    icon: Target,
    description: 'Customer acquisition and campaigns'
  },
  {
    name: 'Academy',
    href: '/academy',
    icon: BookOpen,
    description: 'Training and knowledge base'
  },
  {
    name: 'AI Chat',
    href: '/ai',
    icon: Brain,
    description: 'AI assistant and automation'
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: Plug,
    description: 'Third-party service connections and API management'
  },
  {
    name: 'Analytics',
    href: '/dashboards/analytics',
    icon: BarChart3,
    description: 'Advanced TradingView analytics and business intelligence',
    isNew: true,
    children: [
      { name: 'Overview', href: '/dashboards/analytics', icon: Home, description: 'Key metrics dashboard' },
      { name: 'QuickBooks Analytics', href: '/dashboards/analytics/quickbooks', icon: DollarSign, description: 'Financial health and P&L analysis' },
      { name: 'Banking Analytics', href: '/dashboards/analytics/banking', icon: Wallet, description: 'Transaction and cash flow analysis' },
      { name: 'Marketing Analytics', href: '/dashboards/analytics/marketing', icon: Target, description: 'Campaign ROI and attribution tracking' },
      { name: 'Home Services Analytics', href: '/dashboards/analytics/industry/home-services', icon: Wrench, description: 'Service operations performance' },
      { name: 'Advanced Charts', href: '/dashboards/analytics/advanced', icon: TrendingUp, description: 'TradingView powered charts' },
      { name: 'Multi-Pane Analysis', href: '/dashboards/analytics/multi-pane', icon: BarChart3, description: 'Synchronized chart panes' },
      { name: 'Chart Builder', href: '/dashboards/analytics/builder', icon: Settings2, description: 'Custom chart creation' },
      { name: 'Export & Reports', href: '/dashboards/analytics/reports', icon: FileText, description: 'PDF export and reporting' }
    ]
  }
]

// Sub-navigation configurations
export const subNavigationConfigs: Record<string, SubNavigationConfig> = {
  money: {
    title: 'Money',
    icon: DollarSign,
    sections: [
      {
        title: 'Revenue',
        items: [
          { name: 'Invoices', href: '/money/invoices', icon: Receipt, description: 'Billing and collections' },
          { name: 'Estimates', href: '/money/estimates', icon: Calculator, description: 'Quotes and proposals' },
          { name: 'Payments', href: '/money/payments', icon: CreditCard, description: 'Payment processing' },
          { name: 'Recurring', href: '/money/recurring', icon: RefreshCw, description: 'Subscription billing' }
        ]
      },
      {
        title: 'Expenses',
        items: [
          { name: 'Bills', href: '/money/bills', icon: FileText, description: 'Vendor bills and expenses' },
          { name: 'Purchase Orders', href: '/money/purchase-orders', icon: ShoppingCart, description: 'Ordering and procurement' },
          { name: 'Inventory Costs', href: '/money/inventory-costs', icon: Package, description: 'Material and supply costs' }
        ]
      },
      {
        title: 'Reports',
        items: [
          { name: 'P&L Statement', href: '/money/profit-loss', icon: TrendingUp, description: 'Profit and loss reports' },
          { name: 'Cash Flow', href: '/money/cash-flow', icon: DollarSign, description: 'Cash flow analysis' },
          { name: 'Tax Reports', href: '/money/tax-reports', icon: Calculator, description: 'Tax preparation reports' }
        ]
      }
    ]
  },
  marketing: {
    title: 'Marketing',
    icon: Target,
    sections: [
      {
        title: 'Campaigns',
        items: [
          { name: 'Email Campaigns', href: '/marketing/email', icon: MessageSquare, description: 'Email marketing automation' },
          { name: 'Social Media', href: '/marketing/social', icon: Users, description: 'Social media management' },
          { name: 'Advertising', href: '/marketing/ads', icon: Target, description: 'Paid advertising campaigns' }
        ]
      },
      {
        title: 'Leads & Customers',
        items: [
          { name: 'Lead Generation', href: '/marketing/leads', icon: UserPlus, description: 'Lead capture and nurturing' },
          { name: 'Customer Segments', href: '/marketing/segments', icon: Users, description: 'Customer segmentation' },
          { name: 'Referral Program', href: '/marketing/referrals', icon: Heart, description: 'Customer referral system' }
        ]
      },
      {
        title: 'Analytics',
        items: [
          { name: 'Campaign Performance', href: '/marketing/performance', icon: BarChart3, description: 'Marketing ROI and metrics' },
          { name: 'Website Analytics', href: '/marketing/website', icon: TrendingUp, description: 'Website traffic and conversions' }
        ]
      }
    ]
  },
  academy: {
    title: 'Academy',
    icon: BookOpen,
    sections: [
      {
        title: 'Training',
        items: [
          { name: 'Courses', href: '/academy/courses', icon: BookOpen, description: 'Training courses and modules' },
          { name: 'Certifications', href: '/academy/certifications', icon: Trophy, description: 'Professional certifications' },
          { name: 'Progress Tracking', href: '/academy/progress', icon: BarChart3, description: 'Learning progress and completion' }
        ]
      },
      {
        title: 'Resources',
        items: [
          { name: 'Knowledge Base', href: '/academy/knowledge', icon: BookOpen, description: 'Documentation and guides' },
          { name: 'Video Library', href: '/academy/videos', icon: FileText, description: 'Training videos and tutorials' },
          { name: 'Best Practices', href: '/academy/best-practices', icon: Trophy, description: 'Industry best practices' }
        ]
      }
    ]
  },
  integrations: {
    title: 'Integrations',
    icon: Plug,
    sections: [
      {
        title: 'Connection Management',
        items: [
          { name: 'Active Integrations', href: '/integrations/active', icon: Plug, description: 'Connected third-party services' },
          { name: 'Marketplace', href: '/integrations/marketplace', icon: Store, description: 'Browse available integrations' },
          { name: 'API Keys', href: '/integrations/api-keys', icon: Code2, description: 'Manage API keys and authentication' },
          { name: 'Webhooks', href: '/integrations/webhooks', icon: Target, description: 'Configure real-time data sync' }
        ]
      },
      {
        title: 'Monitoring & Analytics',
        items: [
          { name: 'Health Monitor', href: '/integrations/health', icon: Heart, description: 'System health and status monitoring' },
          { name: 'Usage Analytics', href: '/integrations/analytics', icon: BarChart3, description: 'Integration performance and metrics' },
          { name: 'Error Logs', href: '/integrations/errors', icon: AlertTriangle, description: 'Debug and troubleshoot issues' },
          { name: 'Sync History', href: '/integrations/history', icon: Clock, description: 'Data synchronization history' }
        ]
      }
    ]
  }
}

export const navigationConfigs: Record<Industry, NavigationConfig> = {
  hs: {
    appName: 'Home Services',
    icon: Wrench,
    primaryColor: '#1C8BFF',
    sections: [
      {
        title: 'Schedule & Dispatch',
        items: [
          { 
            name: 'Schedule', 
            href: '/schedule', 
            icon: Calendar, 
            description: 'Daily schedule and appointments' 
          },
          { 
            name: 'Dispatch Board', 
            href: '/dispatch', 
            icon: Compass, 
            description: 'Real-time job assignment and routing' 
          },
          { 
            name: 'Jobs', 
            href: '/jobs', 
            icon: Clipboard, 
            description: 'All work orders and job history' 
          }
        ]
      },
      {
        title: 'Customers & Sales',
        items: [
          { 
            name: 'Customers', 
            href: '/customers', 
            icon: Users, 
            description: 'Customer database and history' 
          },
          { 
            name: 'Estimates', 
            href: '/estimates', 
            icon: Calculator, 
            description: 'Quotes and proposals' 
          },
          { 
            name: 'Invoices', 
            href: '/invoices', 
            icon: Receipt, 
            description: 'Billing and collections' 
          },
          { 
            name: 'Price Book', 
            href: '/pricebook', 
            icon: BookOpen, 
            description: 'Services, materials, and pricing' 
          }
        ]
      },
      {
        title: 'Communications',
        items: [
          { 
            name: 'Inbox', 
            href: '/inbox', 
            icon: MessageSquare, 
            description: 'Customer and team communications' 
          },
          { 
            name: 'Leads', 
            href: '/leads', 
            icon: UserPlus, 
            description: 'New customer opportunities' 
          }
        ]
      },
      {
        title: 'Team & Operations',
        items: [
          { 
            name: 'Technicians', 
            href: '/technicians', 
            icon: UserCheck, 
            description: 'Field team management' 
          },
          { 
            name: 'Inventory', 
            href: '/inventory', 
            icon: Package, 
            description: 'Parts and materials tracking' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Business performance insights' 
          }
        ]
      }
    ]
  },

  rest: {
    appName: 'Restaurant',
    icon: ChefHat,
    primaryColor: '#E5A400',
    sections: [
      {
        title: 'Orders & Service',
        items: [
          { 
            name: 'POS Terminal', 
            href: '/pos', 
            icon: CreditCard, 
            description: 'Point of sale and order management' 
          },
          { 
            name: 'Kitchen Display', 
            href: '/kds', 
            icon: MonitorSpeaker, 
            description: 'Kitchen order queue and timing' 
          },
          { 
            name: 'Floor Plan', 
            href: '/floor', 
            icon: LayoutGrid, 
            description: 'Table management and seating' 
          },
          { 
            name: 'Reservations', 
            href: '/reservations', 
            icon: Calendar, 
            description: 'Table bookings and waitlist' 
          }
        ]
      },
      {
        title: 'Menu & Inventory',
        items: [
          { 
            name: 'Menu', 
            href: '/menu', 
            icon: BookOpen, 
            description: 'Items, pricing, and availability' 
          },
          { 
            name: 'Inventory', 
            href: '/inventory', 
            icon: Package, 
            description: 'Ingredients and supplies' 
          },
          { 
            name: 'Suppliers', 
            href: '/suppliers', 
            icon: Building, 
            description: 'Vendor management and ordering' 
          }
        ]
      },
      {
        title: 'Customers & Staff',
        items: [
          { 
            name: 'Customers', 
            href: '/customers', 
            icon: Users, 
            description: 'Customer database and loyalty' 
          },
          { 
            name: 'Staff', 
            href: '/staff', 
            icon: UserCheck, 
            description: 'Employee scheduling and management' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Sales and performance analytics' 
          }
        ]
      }
    ]
  },

  auto: {
    appName: 'Auto Services',
    icon: Car,
    primaryColor: '#DC2626',
    sections: [
      {
        title: 'Service & Bays',
        items: [
          { 
            name: 'Service Bays', 
            href: '/bays', 
            icon: Wrench, 
            description: 'Bay management and workflow' 
          },
          { 
            name: 'Work Orders', 
            href: '/work-orders', 
            icon: Clipboard, 
            description: 'Repair orders and job tracking' 
          },
          { 
            name: 'Appointments', 
            href: '/appointments', 
            icon: Calendar, 
            description: 'Service scheduling and bookings' 
          }
        ]
      },
      {
        title: 'Customers & Vehicles',
        items: [
          { 
            name: 'Customers', 
            href: '/customers', 
            icon: Users, 
            description: 'Customer and vehicle history' 
          },
          { 
            name: 'Vehicles', 
            href: '/vehicles', 
            icon: Car, 
            description: 'Vehicle database and records' 
          },
          { 
            name: 'Estimates', 
            href: '/estimates', 
            icon: Calculator, 
            description: 'Repair quotes and pricing' 
          },
          { 
            name: 'Invoices', 
            href: '/invoices', 
            icon: Receipt, 
            description: 'Billing and collections' 
          }
        ]
      },
      {
        title: 'Parts & Operations',
        items: [
          { 
            name: 'Parts Catalog', 
            href: '/parts', 
            icon: Package, 
            description: 'Parts inventory and ordering' 
          },
          { 
            name: 'Technicians', 
            href: '/technicians', 
            icon: UserCheck, 
            description: 'Service team management' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Shop performance and analytics' 
          }
        ]
      }
    ]
  },

  ret: {
    appName: 'Retail',
    icon: Store,
    primaryColor: '#E5484D',
    sections: [
      {
        title: 'Sales & Orders',
        items: [
          { 
            name: 'POS Terminal', 
            href: '/pos', 
            icon: CreditCard, 
            description: 'Point of sale system' 
          },
          { 
            name: 'Orders', 
            href: '/orders', 
            icon: Clipboard, 
            description: 'Sales orders and transactions' 
          },
          { 
            name: 'Returns', 
            href: '/returns', 
            icon: RefreshCw, 
            description: 'Returns and exchanges' 
          }
        ]
      },
      {
        title: 'Inventory & Products',
        items: [
          { 
            name: 'Products', 
            href: '/products', 
            icon: Package, 
            description: 'Product catalog and pricing' 
          },
          { 
            name: 'Stock', 
            href: '/stock', 
            icon: Boxes, 
            description: 'Inventory levels and tracking' 
          },
          { 
            name: 'Suppliers', 
            href: '/suppliers', 
            icon: Building, 
            description: 'Vendor and purchasing' 
          }
        ]
      },
      {
        title: 'Customers & Staff',
        items: [
          { 
            name: 'Customers', 
            href: '/customers', 
            icon: Users, 
            description: 'Customer database and loyalty' 
          },
          { 
            name: 'Staff', 
            href: '/staff', 
            icon: UserCheck, 
            description: 'Employee management' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Sales and performance analytics' 
          }
        ]
      }
    ]
  },

  books: {
    appName: 'Thorbis Books',
    icon: BookOpen,
    primaryColor: '#4FA2FF',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/', 
            icon: Home, 
            description: 'Financial overview and key accounting metrics' 
          }
        ]
      },
      {
        title: 'Core Accounting',
        items: [
          { 
            name: 'Transactions', 
            href: '/transactions', 
            icon: Receipt, 
            description: 'Transaction history and financial records' 
          },
          { 
            name: 'General Ledger', 
            href: '/ledger', 
            icon: BookOpen, 
            description: 'Chart of accounts and ledger management' 
          },
          { 
            name: 'Receivables', 
            href: '/receivables', 
            icon: Users, 
            description: 'Accounts receivable and customer payments' 
          },
          { 
            name: 'Payables', 
            href: '/payables', 
            icon: Building, 
            description: 'Accounts payable and vendor payments' 
          },
          { 
            name: 'Invoices', 
            href: '/invoices', 
            icon: FileText, 
            description: 'Invoice creation and management' 
          }
        ]
      },
      {
        title: 'Advanced Features',
        items: [
          { 
            name: 'Automation', 
            href: '/automation', 
            icon: Sparkles, 
            description: 'AI-powered accounting automation' 
          },
          { 
            name: 'Multi-Currency', 
            href: '/multi-currency', 
            icon: Wallet, 
            description: 'Multi-currency transaction management' 
          },
          { 
            name: 'Batch Invoicing', 
            href: '/batch-invoicing', 
            icon: Users, 
            description: 'Bulk invoice generation and processing' 
          },
          { 
            name: 'Invoice Approval', 
            href: '/invoice-approval', 
            icon: Shield, 
            description: 'Invoice approval workflow and controls' 
          },
          { 
            name: 'Bills', 
            href: '/bills', 
            icon: CreditCard, 
            description: 'Bill management and payment scheduling' 
          }
        ]
      },
      {
        title: 'Contacts & Banking',
        items: [
          { 
            name: 'Customers', 
            href: '/customers', 
            icon: Users, 
            description: 'Customer accounts and billing information' 
          },
          { 
            name: 'Vendors', 
            href: '/vendors', 
            icon: Building, 
            description: 'Vendor management and purchase tracking' 
          },
          { 
            name: 'Reconciliation', 
            href: '/banking', 
            icon: Wallet, 
            description: 'Bank reconciliation and cash management' 
          },
          { 
            name: 'Cash Flow', 
            href: '/cash-flow', 
            icon: TrendingUp, 
            description: 'Cash flow forecasting and analysis' 
          }
        ]
      },
      {
        title: 'Reporting & Compliance',
        items: [
          { 
            name: 'Chart of Accounts', 
            href: '/accounts', 
            icon: BookOpen, 
            description: 'Account structure and organization' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Financial reports and business analytics' 
          },
          { 
            name: 'Tax', 
            href: '/tax', 
            icon: Calculator, 
            description: 'Tax calculation and compliance management' 
          },
          { 
            name: 'AI Insights', 
            href: '/ai-insights', 
            icon: Brain, 
            description: 'AI-powered financial insights and recommendations' 
          }
        ]
      }
    ]
  },

  courses: {
    appName: 'Thorbis Courses',
    icon: BookOpen,
    primaryColor: '#1C8BFF',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/dashboard', 
            icon: Home, 
            description: 'Learning progress and course overview' 
          },
          { 
            name: 'Courses', 
            href: '/courses', 
            icon: BookOpen, 
            description: 'Browse and access course catalog' 
          },
          { 
            name: 'Study Groups', 
            href: '/study-groups', 
            icon: Users, 
            description: 'Collaborative learning and group discussions' 
          },
          { 
            name: 'Leaderboard', 
            href: '/leaderboard', 
            icon: Trophy, 
            description: 'Achievement rankings and progress tracking' 
          },
          { 
            name: 'Profile', 
            href: '/profile', 
            icon: User, 
            description: 'Personal learning profile and achievements' 
          }
        ]
      }
    ]
  },

  payroll: {
    appName: 'Thorbis Payroll',
    icon: Clock,
    primaryColor: '#18B26B',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/', 
            icon: Home, 
            description: 'Payroll overview and key metrics' 
          }
        ]
      },
      {
        title: 'Payroll Processing',
        items: [
          { 
            name: 'Run Payroll', 
            href: '/payroll/run', 
            icon: DollarSign, 
            description: 'Process payroll with AI automation' 
          },
          { 
            name: 'Payroll History', 
            href: '/payroll/history', 
            icon: Clock, 
            description: 'Historical payroll runs and records' 
          },
          { 
            name: 'Pay Schedules', 
            href: '/payroll/schedules', 
            icon: Calendar, 
            description: 'Pay period configuration and scheduling' 
          },
          { 
            name: 'Direct Deposit', 
            href: '/payroll/direct-deposit', 
            icon: CreditCard, 
            description: 'Bank account management and ACH setup' 
          },
          { 
            name: 'Payroll Reports', 
            href: '/payroll/reports', 
            icon: BarChart3, 
            description: 'Comprehensive payroll analytics and reporting' 
          }
        ]
      },
      {
        title: 'Employee Management',
        items: [
          { 
            name: 'Employee Directory', 
            href: '/employees/directory', 
            icon: Users, 
            description: 'Complete employee database and profiles' 
          },
          { 
            name: 'Employee Portal', 
            href: '/employees/portal', 
            icon: User, 
            description: 'Self-service employee dashboard' 
          }
        ]
      },
      {
        title: 'Time & Attendance',
        items: [
          { 
            name: 'Timesheets', 
            href: '/time/timesheets', 
            icon: Clock, 
            description: 'Time tracking and timesheet management' 
          },
          { 
            name: 'Break Management', 
            href: '/time/breaks', 
            icon: Clock, 
            description: 'Break tracking with AI optimization' 
          },
          { 
            name: 'Geolocation', 
            href: '/time/geolocation', 
            icon: Clock, 
            description: 'Location-based time tracking and verification' 
          }
        ]
      },
      {
        title: 'Benefits Administration',
        items: [
          { 
            name: 'Health Insurance', 
            href: '/benefits/health', 
            icon: Heart, 
            description: 'Health plan management and enrollment' 
          },
          { 
            name: 'Retirement Plans', 
            href: '/benefits/retirement', 
            icon: Shield, 
            description: '401(k) and retirement benefit administration' 
          },
          { 
            name: 'Benefits Enrollment', 
            href: '/benefits/enrollment', 
            icon: UserCheck, 
            description: 'Open enrollment and benefit selection' 
          }
        ]
      },
      {
        title: 'Human Resources',
        items: [
          { 
            name: 'HR Documents', 
            href: '/hr/documents', 
            icon: FileText, 
            description: 'Document management and e-signatures' 
          },
          { 
            name: 'Org Chart', 
            href: '/hr/org-chart', 
            icon: Building2, 
            description: 'Interactive organizational structure' 
          }
        ]
      },
      {
        title: 'Compliance & Reporting',
        items: [
          { 
            name: 'Tax Compliance', 
            href: '/compliance/taxes', 
            icon: Calculator, 
            description: 'Automated tax filing and compliance' 
          },
          { 
            name: 'R&D Tax Credits', 
            href: '/compliance/rd-credits', 
            icon: Shield, 
            description: 'R&D credit identification and filing' 
          }
        ]
      }
    ]
  },

  lom: {
    appName: 'LOM Documentation',
    icon: BookOpen,
    primaryColor: '#4FA2FF',
    sections: [
      {
        items: [
          { 
            name: 'Home', 
            href: '/', 
            icon: Home, 
            description: 'LOM documentation homepage' 
          },
          { 
            name: 'Schema.org', 
            href: '/schema-org', 
            icon: BookOpen, 
            description: 'Schema.org integration and mapping' 
          },
          { 
            name: 'Documentation', 
            href: '/documentation', 
            icon: FileText, 
            description: 'Comprehensive API documentation' 
          },
          { 
            name: 'Schemas', 
            href: '/schemas', 
            icon: Package, 
            description: 'Schema library and references' 
          },
          { 
            name: 'Validator', 
            href: '/validate', 
            icon: Shield, 
            description: 'Schema validation and testing tools' 
          },
          { 
            name: 'GitHub', 
            href: 'https://github.com/thorbis/lom', 
            icon: Github, 
            description: 'Source code repository' 
          }
        ]
      }
    ]
  },

  investigations: {
    appName: 'Thorbis Investigations',
    icon: Search,
    primaryColor: '#E5484D',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/', 
            icon: Home, 
            description: 'Investigation overview and case status' 
          }
        ]
      },
      {
        title: 'Case Management',
        items: [
          { 
            name: 'Cases', 
            href: '/cases', 
            icon: FileText, 
            description: 'Active and closed case management' 
          },
          { 
            name: 'Evidence', 
            href: '/evidence', 
            icon: Package, 
            description: 'Evidence collection and chain of custody' 
          },
          { 
            name: 'Timeline', 
            href: '/timeline', 
            icon: Clock, 
            description: 'Chronological event timeline construction' 
          },
          { 
            name: 'People', 
            href: '/people', 
            icon: Users, 
            description: 'Person of interest and witness management' 
          }
        ]
      },
      {
        title: 'Analysis Tools',
        items: [
          { 
            name: 'Case Graph', 
            href: '/case-graph', 
            icon: BarChart3, 
            description: 'Relationship mapping and network analysis' 
          },
          { 
            name: 'OSINT', 
            href: '/osint', 
            icon: Search, 
            description: 'Open source intelligence gathering' 
          },
          { 
            name: 'Video Analysis', 
            href: '/video-analysis', 
            icon: MonitorSpeaker, 
            description: 'Video evidence analysis and enhancement' 
          },
          { 
            name: 'AI Analysis', 
            href: '/ai-analysis', 
            icon: Brain, 
            description: 'AI-powered pattern recognition and insights' 
          }
        ]
      },
      {
        title: 'Collaboration',
        items: [
          { 
            name: 'War Room', 
            href: '/war-room', 
            icon: Users, 
            description: 'Real-time collaborative investigation workspace' 
          },
          { 
            name: 'Reports', 
            href: '/reports', 
            icon: BarChart3, 
            description: 'Investigation reports and documentation' 
          }
        ]
      }
    ]
  },

  banking: {
    appName: 'Thorbis Banking',
    icon: Wallet,
    primaryColor: '#18B26B',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/', 
            icon: Home, 
            description: 'Banking overview and account summaries' 
          }
        ]
      }
    ]
  },

  ai: {
    appName: 'Thorbis AI',
    icon: Brain,
    primaryColor: '#1C8BFF',
    sections: []
  },

  api: {
    appName: 'Thorbis API',
    icon: Code2,
    primaryColor: '#6B46C1',
    sections: [
      {
        items: [
          { 
            name: 'Documentation', 
            href: '/', 
            icon: BookOpen, 
            description: 'API documentation and reference guides' 
          }
        ]
      }
    ]
  },

  marketing: {
    appName: 'Thorbis Marketing',
    icon: Target,
    primaryColor: '#F59E0B',
    sections: [
      {
        items: [
          { 
            name: 'Dashboard', 
            href: '/', 
            icon: Home, 
            description: 'Marketing overview and campaign performance' 
          }
        ]
      }
    ]
  },

  analytics: {
    appName: 'Analytics Platform',
    icon: BarChart3,
    primaryColor: '#1C8BFF',
    sections: [
      {
        title: 'Core Analytics',
        items: [
          { 
            name: 'Overview', 
            href: '/dashboards/analytics', 
            icon: Home, 
            description: 'Business metrics and key performance indicators' 
          },
          { 
            name: 'Advanced Charts', 
            href: '/dashboards/analytics/advanced', 
            icon: TrendingUp, 
            description: 'TradingView charts with drawing tools and goal setting',
            isNew: true
          },
          { 
            name: 'Multi-Pane Analysis', 
            href: '/dashboards/analytics/multi-pane', 
            icon: BarChart3, 
            description: 'Synchronized charts for data comparison' 
          }
        ]
      },
      {
        title: 'Tools & Builders',
        items: [
          { 
            name: 'Chart Builder', 
            href: '/dashboards/analytics/builder', 
            icon: Wrench, 
            description: 'AI-powered custom chart creation',
            isNew: true
          },
          { 
            name: 'Report Builder', 
            href: '/dashboards/analytics/reports', 
            icon: FileText, 
            description: 'Professional business reports and templates' 
          },
          { 
            name: 'Controls & Settings', 
            href: '/dashboards/analytics/controls', 
            icon: Settings2, 
            description: 'Time controls, data sources, and export settings' 
          }
        ]
      },
      {
        title: 'Custom Dashboards',
        items: [
          { 
            name: 'Q4 Revenue Analysis', 
            href: '/dashboards/analytics/custom/q4-revenue', 
            icon: TrendingUp, 
            description: 'Quarterly revenue performance and forecasting' 
          },
          { 
            name: 'Customer Insights Dashboard', 
            href: '/dashboards/analytics/custom/customer-insights', 
            icon: Users, 
            description: 'Customer behavior and segmentation analysis' 
          },
          { 
            name: 'Marketing ROI Tracker', 
            href: '/dashboards/analytics/custom/marketing-roi', 
            icon: Target, 
            description: 'Campaign performance and return on investment tracking' 
          },
          { 
            name: 'Create New Dashboard', 
            href: '/dashboards/analytics/custom/create', 
            icon: Users, 
            description: 'Build custom analytics dashboards with AI assistance',
            isNew: true
          }
        ]
      },
      {
        title: 'Specialized Analytics',
        items: [
          { 
            name: 'QuickBooks Analytics', 
            href: '/dashboards/analytics/quickbooks', 
            icon: DollarSign, 
            description: 'Financial health, P&L, tax planning, and reconciliation',
            isNew: true
          },
          { 
            name: 'Banking Analytics', 
            href: '/dashboards/analytics/banking', 
            icon: Wallet, 
            description: 'Transaction analysis, cash flow, and account management',
            isNew: true
          },
          { 
            name: 'Marketing Analytics', 
            href: '/dashboards/analytics/marketing', 
            icon: Target, 
            description: 'Campaign ROI, attribution, and conversion funnel analysis',
            isNew: true
          }
        ]
      },
      {
        title: 'Industry-Specific Analytics',
        items: [
          { 
            name: 'Home Services Analytics', 
            href: '/dashboards/analytics/industry/home-services', 
            icon: Wrench, 
            description: 'Service operations, technician performance, and customer satisfaction',
            isNew: true
          },
          { 
            name: 'Restaurant Analytics', 
            href: '/dashboards/analytics/industry/restaurant', 
            icon: ChefHat, 
            description: 'Restaurant operations, menu performance, and table management',
            isNew: true
          },
          { 
            name: 'Auto Services Analytics', 
            href: '/dashboards/analytics/industry/auto', 
            icon: Car, 
            description: 'Service bays, repair orders, and parts inventory tracking',
            isNew: true
          },
          { 
            name: 'Retail Analytics', 
            href: '/dashboards/analytics/industry/retail', 
            icon: Store, 
            description: 'Sales performance, inventory turnover, and customer analytics',
            isNew: true
          }
        ]
      },
      {
        title: 'Home Services Analytics',
        items: [
          { 
            name: 'Executive Dashboard', 
            href: '/dashboards/analytics/home-services/executive', 
            icon: Crown, 
            description: 'C-suite dashboard with strategic KPIs, market position, and risk management',
            isNew: true
          },
          { 
            name: 'Field Operations Command Center', 
            href: '/dashboards/analytics/home-services/field-command', 
            icon: Radar, 
            description: 'Real-time GPS tracking, dispatch management, and field team coordination',
            isNew: true
          },
          { 
            name: 'Customer Experience Journey', 
            href: '/dashboards/analytics/home-services/customer-journey', 
            icon: Route, 
            description: 'Customer lifecycle analysis, touchpoint optimization, and experience intelligence',
            isNew: true
          },
          { 
            name: 'Service Operations Dashboard', 
            href: '/dashboards/analytics/home-services/operations', 
            icon: Wrench, 
            description: 'Real-time operations, job status, and workflow analytics'
          },
          { 
            name: 'Revenue & Financial Analytics', 
            href: '/dashboards/analytics/home-services/revenue', 
            icon: DollarSign, 
            description: 'Revenue tracking, profit margins, and financial forecasting'
          },
          { 
            name: 'Revenue Forecasting Dashboard', 
            href: '/dashboards/analytics/home-services/revenue-forecasting', 
            icon: TrendingUp, 
            description: 'AI-powered revenue predictions and scenario analysis'
          },
          { 
            name: 'Customer Service Analytics', 
            href: '/dashboards/analytics/home-services/customer-service', 
            icon: Users, 
            description: 'Customer satisfaction, retention, and lifetime value analysis'
          },
          { 
            name: 'Technician Performance', 
            href: '/dashboards/analytics/home-services/technician-performance', 
            icon: UserCheck, 
            description: 'Individual and team performance metrics and efficiency tracking'
          },
          { 
            name: 'Job Completion Analytics', 
            href: '/dashboards/analytics/home-services/job-completion', 
            icon: Clipboard, 
            description: 'Completion rates, first-time fix rates, and callback analysis'
          },
          { 
            name: 'Service Area Performance', 
            href: '/dashboards/analytics/home-services/service-areas', 
            icon: Compass, 
            description: 'Geographic performance, territory optimization, and travel analytics'
          },
          { 
            name: 'Equipment & Asset Analytics', 
            href: '/dashboards/analytics/home-services/equipment', 
            icon: Settings2, 
            description: 'Equipment utilization, maintenance costs, and asset tracking'
          },
          { 
            name: 'Inventory Management', 
            href: '/dashboards/analytics/home-services/inventory', 
            icon: Package, 
            description: 'Parts usage, stock levels, and inventory turnover analytics'
          },
          { 
            name: 'Scheduling Efficiency', 
            href: '/dashboards/analytics/home-services/scheduling', 
            icon: Calendar, 
            description: 'Schedule optimization, route planning, and time utilization'
          },
          { 
            name: 'HVAC Analytics', 
            href: '/dashboards/analytics/home-services/hvac', 
            icon: Wrench, 
            description: 'HVAC-specific metrics, seasonal trends, and maintenance analytics'
          },
          { 
            name: 'Plumbing Analytics', 
            href: '/dashboards/analytics/home-services/plumbing', 
            icon: Wrench, 
            description: 'Plumbing service metrics, emergency calls, and repair analytics'
          },
          { 
            name: 'Electrical Analytics', 
            href: '/dashboards/analytics/home-services/electrical', 
            icon: Wrench, 
            description: 'Electrical service performance, safety compliance, and job complexity'
          },
          { 
            name: 'Emergency Services Analytics', 
            href: '/dashboards/analytics/home-services/emergency', 
            icon: AlertTriangle, 
            description: 'Emergency response times, availability, and premium pricing analytics'
          },
          { 
            name: 'Seasonal Performance', 
            href: '/dashboards/analytics/home-services/seasonal', 
            icon: Calendar, 
            description: 'Seasonal demand patterns, weather impact, and capacity planning'
          },
          { 
            name: 'Marketing & Lead Analytics', 
            href: '/dashboards/analytics/home-services/marketing', 
            icon: Target, 
            description: 'Lead generation, conversion rates, and marketing ROI tracking'
          },
          { 
            name: 'Contract & Recurring Revenue', 
            href: '/dashboards/analytics/home-services/contracts', 
            icon: FileText, 
            description: 'Service contracts, recurring revenue, and maintenance agreements'
          },
          { 
            name: 'Quality Control Analytics', 
            href: '/dashboards/analytics/home-services/quality', 
            icon: Shield, 
            description: 'Quality metrics, rework rates, and customer complaint analysis'
          },
          { 
            name: 'Safety & Compliance', 
            href: '/dashboards/analytics/home-services/safety', 
            icon: Shield, 
            description: 'Safety incidents, compliance tracking, and risk management'
          },
          { 
            name: 'Cost & Profit Analysis', 
            href: '/dashboards/analytics/home-services/costs', 
            icon: Calculator, 
            description: 'Job costing, profit margins, and expense analysis by service type'
          },
          { 
            name: 'Competitive Analysis & Market Intelligence', 
            href: '/dashboards/analytics/home-services/competitive-intelligence', 
            icon: Binoculars, 
            description: 'Market positioning, competitive analysis, and strategic intelligence for data-driven decisions',
            isNew: true
          },
          { 
            name: 'Workforce Analytics', 
            href: '/dashboards/analytics/home-services/workforce', 
            icon: Users, 
            description: 'Staffing levels, overtime trends, and workforce productivity'
          },
          { 
            name: 'Training & Certification', 
            href: '/dashboards/analytics/home-services/training', 
            icon: BookOpen, 
            description: 'Training completion, certification tracking, and skill development'
          },
          { 
            name: 'Customer Journey Analytics', 
            href: '/dashboards/analytics/home-services/customer-journey', 
            icon: TrendingUp, 
            description: 'Customer lifecycle, touchpoint analysis, and retention patterns'
          },
          { 
            name: 'Service Level Agreements', 
            href: '/dashboards/analytics/home-services/sla', 
            icon: Clock, 
            description: 'SLA compliance, response times, and service quality metrics'
          },
          { 
            name: 'Warranty & Callbacks', 
            href: '/dashboards/analytics/home-services/warranty', 
            icon: RefreshCw, 
            description: 'Warranty claims, callback rates, and service guarantee tracking'
          },
          { 
            name: 'Advanced Predictive Analytics', 
            href: '/dashboards/analytics/home-services/predictive-analytics', 
            icon: Brain, 
            description: 'AI-driven forecasting and predictive business intelligence for data-driven decisions',
            isNew: true
          },
          { 
            name: 'Machine Learning Insights', 
            href: '/dashboards/analytics/home-services/ml-insights', 
            icon: Cpu, 
            description: 'Deep learning business intelligence with model performance tracking',
            isNew: true
          },
          { 
            name: 'Real-time Operations Command Center', 
            href: '/dashboards/analytics/home-services/operations-command', 
            icon: Activity, 
            description: 'Live monitoring and control interface for field operations',
            isNew: true
          },
          { 
            name: 'AI-Powered Business Intelligence Suite', 
            href: '/dashboards/analytics/home-services/ai-intelligence', 
            icon: Sparkles, 
            description: 'Unified intelligent analytics platform with cognitive AI capabilities',
            isNew: true
          },
          { 
            name: 'Advanced Data Visualization Framework', 
            href: '/dashboards/analytics/home-services/data-visualization', 
            icon: BarChart3, 
            description: 'Advanced visualization platform with AI-powered insights, custom themes, and real-time data integration',
            isNew: true
          }
        ]
      }
    ]
  }
}

/**
 * Get navigation configuration for a specific industry
 */
export function getNavigationConfig(industry: Industry): NavigationConfig {
  return navigationConfigs[industry] || navigationConfigs.hs
}

/**
 * Get all available industries
 */
export function getAvailableIndustries(): Industry[] {
  return Object.keys(navigationConfigs) as Industry[]
}

/**
 * Get navigation items for command palette integration
 */
export function getNavigationItems(industry: Industry): Array<{ name: string; href: string; description?: string; icon: React.ComponentType<{ className?: string }> }> {
  const config = getNavigationConfig(industry)
  const items: Array<{ name: string; href: string; description?: string; icon: React.ComponentType<{ className?: string }> }> = []
  
  config.sections.forEach(section => {
    section.items.forEach(item => {
      items.push({
        name: item.name,
        href: item.href,
        description: item.description,
        icon: item.icon
      })
    })
  })
  
  return items
}