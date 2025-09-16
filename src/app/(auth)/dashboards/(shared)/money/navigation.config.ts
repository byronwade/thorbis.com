/**
 * Money Navigation Configuration
 * 
 * Defines the navigation structure for financial management and accounting.
 * This is a shared feature available across all industries.
 */

import {
  DollarSign,
  Receipt,
  TrendingUp,
  Calculator,
  PieChart,
  CreditCard,
  Banknote,
  FileText,
  Settings,
  Upload,
  Download,
  Smartphone,
  Monitor
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

export const moneyNavigationConfig = {
  appName: 'Financial Management',
  industry: 'money' as const,
  primaryColor: '#10B981',
  icon: DollarSign,
  
  // Main dashboard route for money
  dashboardHref: '/dashboards/money',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '310px',  // Wider for financial categories
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'Financial Management',
    subtitle: 'Accounting, invoicing, and financial analytics',
    actions: [
      {
        label: 'Quick Invoice',
        href: '/dashboards/money/invoices/new',
        icon: 'Receipt'
      },
      {
        label: 'Expense Entry',
        href: '/dashboards/money/expenses/new',
        icon: 'CreditCard'
      },
      {
        label: 'Financial Reports',
        href: '/dashboards/money/reports',
        icon: 'TrendingUp'
      }
    ]
  },

  // Money-specific navigation sections - standardized structure
  sections: [
    {
      title: 'Financial Overview',
      defaultExpanded: true,
      collapsible: true,
      items: [
        { 
          name: 'Money Overview', 
          href: '/dashboards/money', 
          icon: DollarSign, 
          description: 'Financial dashboard and key metrics' 
        },
        { 
          name: 'Cash Flow', 
          href: '/dashboards/money/cash-flow', 
          icon: TrendingUp, 
          description: 'Cash flow analysis and projections' 
        },
        { 
          name: 'P&L Statement', 
          href: '/dashboards/money/profit-loss', 
          icon: PieChart, 
          description: 'Profit and loss reporting' 
        }
      ]
    },
    {
      title: 'Income & Expenses',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Invoices', 
          href: '/dashboards/money/invoices', 
          icon: Receipt, 
          description: 'Customer invoicing and payments',
          badge: '12'
        },
        { 
          name: 'Expenses', 
          href: '/dashboards/money/expenses', 
          icon: CreditCard, 
          description: 'Business expense tracking' 
        },
        { 
          name: 'Payments', 
          href: '/dashboards/money/payments', 
          icon: Banknote, 
          description: 'Payment processing and history' 
        }
      ]
    },
    {
      title: 'Reports & Analytics',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Financial Reports', 
          href: '/dashboards/money/reports', 
          icon: FileText, 
          description: 'Comprehensive financial reporting' 
        },
        { 
          name: 'Tax Documents', 
          href: '/dashboards/money/tax', 
          icon: Calculator, 
          description: 'Tax preparation and filings' 
        },
        { 
          name: 'Export Data', 
          href: '/dashboards/money/export', 
          icon: Download, 
          description: 'Export financial data to accounting software' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type MoneyNavigationConfig = typeof moneyNavigationConfig