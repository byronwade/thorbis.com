/**
 * Industry-based header presets for the modular navigation system
 * Each preset defines navigation modules, permissions, and progressive disclosure rules
 */

import {
  BarChart3, Building2, Calendar, Calculator, CreditCard, FileText,
  Package, Receipt, Settings, Star, TrendingUp, Users, MessageSquare,
  Briefcase, User, Crown, GraduationCap, Book, Brain, Target,
  Home, MapPin, Monitor, Key, Zap, Truck, DollarSign, Clock,
  HelpCircle, Activity, Bell, Search, Phone, PhoneCall,
  Mail, Send, Inbox, Shield, Tag, Plug, Download, Cloud,
  Plus, ChevronDown, Menu, LogOut
} from "lucide-react";

export interface NavigationModule {
  id: string;
  title: string;
  icon: any;
  href: string;
  description?: string;
  category: 'core' | 'operations' | 'growth' | 'platform';
  priority: number; // Lower = higher priority
  requiresSubscription?: 'basic' | 'pro' | 'enterprise';
  roles?: string[];
  badge?: string;
  subItems?: NavigationSubItem[];
}

export interface NavigationSubItem {
  title: string;
  href: string;
  description?: string;
  roles?: string[];
}

export interface IndustryPreset {
  id: string;
  name: string;
  description: string;
  headerTitle: string;
  headerSubtitle: string;
  primaryColor: string;
  modules: NavigationModule[];
  defaultLayout: {
    topNav: string[]; // module IDs for top navigation
    moreMenu: string[]; // module IDs for "more" dropdown
    quickActions: string[]; // module IDs for quick action buttons
  };
}

// Universal modules that can be used across industries
const UNIVERSAL_MODULES: NavigationModule[] = [
  // Core Business Modules
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard/business/field-management',
    description: 'Business overview and insights',
    category: 'core',
    priority: 1,
    subItems: [
      { title: 'Overview', href: '/dashboard/business/field-management' },
      { title: 'Real-time Insights', href: '/dashboard/business/field-management/dashboard/real-time-insights' }
    ]
  },
  
  // Order & Job Management
  {
    id: 'orders',
    title: 'Orders',
    icon: FileText,
    href: '/dashboard/business/orders',
    description: 'Manage customer orders',
    category: 'operations',
    priority: 2,
    subItems: [
      { title: 'New Orders', href: '/dashboard/business/orders/new' },
      { title: 'In Progress', href: '/dashboard/business/orders/in-progress' },
      { title: 'Completed', href: '/dashboard/business/orders/completed' },
      { title: 'Online Orders', href: '/dashboard/business/orders/online' }
    ]
  },

  // Field Service Management
  {
    id: 'schedule',
    title: 'Schedule',
    icon: Calendar,
    href: '/dashboard/business/field-management/schedule',
    description: 'Job scheduling and calendar',
    category: 'operations',
    priority: 3,
    subItems: [
      { title: 'Calendar View', href: '/dashboard/business/field-management/schedule' },
      { title: 'New Job', href: '/dashboard/business/field-management/schedule/new-job' },
      { title: 'Recurring Jobs', href: '/dashboard/business/field-management/schedule/recurring-jobs' },
      { title: 'Route Planner', href: '/dashboard/business/field-management/schedule/route-planner' }
    ]
  },

  // Table & Reservation Management (Restaurants)
  {
    id: 'reservations',
    title: 'Tables & Reservations',
    icon: Calendar,
    href: '/dashboard/business/reservations',
    description: 'Manage dining reservations',
    category: 'operations',
    priority: 2,
    subItems: [
      { title: 'Table Map', href: '/dashboard/business/reservations/table-map' },
      { title: 'Waitlist', href: '/dashboard/business/reservations/waitlist' },
      { title: 'Reservations', href: '/dashboard/business/reservations' },
      { title: 'Bookings Calendar', href: '/dashboard/business/reservations/calendar' }
    ]
  },

  // Menu Management (Restaurants)
  {
    id: 'menu',
    title: 'Menu',
    icon: Book,
    href: '/dashboard/business/menu',
    description: 'Menu and pricing management',
    category: 'operations',
    priority: 3,
    subItems: [
      { title: 'Menu Editor', href: '/dashboard/business/menu' },
      { title: 'Digital Menu Boards', href: '/dashboard/business/menu/digital' },
      { title: 'Recipe & Pricing', href: '/dashboard/business/menu/recipes' },
      { title: 'Category Management', href: '/dashboard/business/menu/categories' }
    ]
  },

  // Customer Management
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    href: '/dashboard/business/field-management/customers',
    description: 'Customer relationship management',
    category: 'core',
    priority: 4,
    subItems: [
      { title: 'Customer List', href: '/dashboard/business/field-management/customers' },
      { title: 'Service History', href: '/dashboard/business/field-management/customers/history' },
      { title: 'Guest Profiles', href: '/dashboard/business/field-management/customers/profiles' },
      { title: 'Loyalty Programs', href: '/dashboard/business/field-management/customers/loyalty' }
    ]
  },

  // Inventory Management
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Package,
    href: '/dashboard/business/inventory',
    description: 'Stock and inventory management',
    category: 'operations',
    priority: 5,
    subItems: [
      { title: 'Stock Levels', href: '/dashboard/business/inventory' },
      { title: 'Reorder Alerts', href: '/dashboard/business/inventory/alerts' },
      { title: 'Recipe Costing', href: '/dashboard/business/inventory/costing' },
      { title: 'Supplier Management', href: '/dashboard/business/inventory/suppliers' }
    ]
  },

  // Team Management
  {
    id: 'team',
    title: 'Staff & Scheduling',
    icon: Users,
    href: '/dashboard/business/team',
    description: 'Employee management and scheduling',
    category: 'operations',
    priority: 6,
    subItems: [
      { title: 'Staff Roster', href: '/dashboard/business/team' },
      { title: 'Shift Scheduling', href: '/dashboard/business/team/scheduling' },
      { title: 'Time Clock', href: '/dashboard/business/team/timeclock' },
      { title: 'Roles & Permissions', href: '/dashboard/business/team/roles' }
    ]
  },

  // Communication Hub
  {
    id: 'communication',
    title: 'Inbox',
    icon: Inbox,
    href: '/dashboard/business/communication',
    description: 'Messages, calls, and notifications',
    category: 'core',
    priority: 7,
    subItems: [
      { title: 'Messages', href: '/dashboard/business/communication' },
      { title: 'Team Chat', href: '/dashboard/business/communication/team-chat' },
      { title: 'Voice & Video', href: '/dashboard/business/communication/voice-video' },
      { title: 'Call Management', href: '/dashboard/business/communication/calls' }
    ]
  },

  // Analytics & Reporting
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/business/analytics',
    description: 'Business insights and reporting',
    category: 'growth',
    priority: 8,
    subItems: [
      { title: 'Sales Reports', href: '/dashboard/business/analytics/sales' },
      { title: 'Performance Metrics', href: '/dashboard/business/analytics/performance' },
      { title: 'Custom Reports', href: '/dashboard/business/analytics/custom' },
      { title: 'KPI Dashboard', href: '/dashboard/business/analytics/kpi' }
    ]
  },

  // Marketing & Growth
  {
    id: 'marketing',
    title: 'Marketing',
    icon: TrendingUp,
    href: '/dashboard/business/marketing',
    description: 'Marketing campaigns and promotions',
    category: 'growth',
    priority: 9,
    subItems: [
      { title: 'Campaigns', href: '/dashboard/business/marketing/campaigns' },
      { title: 'Promotions', href: '/dashboard/business/marketing/promotions' },
      { title: 'Reviews', href: '/dashboard/business/marketing/reviews' },
      { title: 'Social Media', href: '/dashboard/business/marketing/social' }
    ]
  },

  // Online & Delivery
  {
    id: 'delivery',
    title: 'Online & Delivery',
    icon: Truck,
    href: '/dashboard/business/delivery',
    description: 'Online ordering and delivery management',
    category: 'operations',
    priority: 10,
    subItems: [
      { title: 'Online Orders', href: '/dashboard/business/delivery/online' },
      { title: 'Delivery Tracking', href: '/dashboard/business/delivery/tracking' },
      { title: 'Third-party Integration', href: '/dashboard/business/delivery/integrations' }
    ]
  },

  // Settings & Configuration
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    href: '/dashboard/business/settings',
    description: 'Business configuration and integrations',
    category: 'platform',
    priority: 11,
    subItems: [
      { title: 'Business Info', href: '/dashboard/business/settings' },
      { title: 'Integrations', href: '/dashboard/business/settings/integrations' },
      { title: 'Payment Settings', href: '/dashboard/business/settings/payments' },
      { title: 'API Configuration', href: '/dashboard/business/settings/api' }
    ]
  }
];

// Industry-specific presets
export const INDUSTRY_PRESETS: IndustryPreset[] = [
  // Restaurant Management System
  {
    id: 'restaurant',
    name: 'Restaurant Management',
    description: 'Complete restaurant and food service management',
    headerTitle: 'Restaurant Dashboard',
    headerSubtitle: 'Point of Sale & Operations Management',
    primaryColor: 'orange',
    modules: UNIVERSAL_MODULES.filter(m => 
      ['dashboard', 'orders', 'reservations', 'menu', 'inventory', 'team', 'communication', 'analytics', 'marketing', 'delivery', 'settings'].includes(m.id)
    ),
    defaultLayout: {
      topNav: ['dashboard', 'orders', 'reservations', 'menu', 'inventory', 'team'],
      moreMenu: ['communication', 'analytics', 'marketing', 'delivery', 'settings'],
      quickActions: ['orders', 'reservations', 'menu']
    }
  },

  // Field Service Management
  {
    id: 'field-service',
    name: 'Field Service Management', 
    description: 'Complete field service and contractor management',
    headerTitle: 'Field Service Dashboard',
    headerSubtitle: 'Job Scheduling & Customer Management',
    primaryColor: 'blue',
    modules: UNIVERSAL_MODULES.filter(m =>
      ['dashboard', 'schedule', 'customers', 'team', 'communication', 'analytics', 'marketing', 'settings'].includes(m.id)
    ).concat([
      {
        id: 'dispatch',
        title: 'Dispatch',
        icon: Truck,
        href: '/dashboard/business/field-management/dispatch',
        description: 'Dispatch and route optimization',
        category: 'operations',
        priority: 2,
        subItems: [
          { title: 'Dispatch Board', href: '/dashboard/business/field-management/dispatch' },
          { title: 'Route Optimization', href: '/dashboard/business/field-management/dispatch/routes' },
          { title: 'Unassigned Jobs', href: '/dashboard/business/field-management/dispatch/unassigned' },
          { title: 'Tech Locations', href: '/dashboard/business/field-management/dispatch/techs' }
        ]
      },
      {
        id: 'jobs',
        title: 'Jobs',
        icon: Briefcase,
        href: '/dashboard/business/field-management/jobs',
        description: 'Job management and work orders',
        category: 'operations',
        priority: 3,
        subItems: [
          { title: 'Job List', href: '/dashboard/business/field-management/jobs' },
          { title: 'Work Orders', href: '/dashboard/business/field-management/jobs/work-orders' },
          { title: 'Checklists', href: '/dashboard/business/field-management/jobs/checklists' },
          { title: 'Job Costing', href: '/dashboard/business/field-management/jobs/costing' }
        ]
      },
      {
        id: 'pricebook',
        title: 'Price Book',
        icon: Book,
        href: '/dashboard/business/field-management/pricebook',
        description: 'Services, materials, and pricing',
        category: 'operations',
        priority: 5,
        subItems: [
          { title: 'Services', href: '/dashboard/business/field-management/pricebook/services' },
          { title: 'Materials', href: '/dashboard/business/field-management/pricebook/materials' },
          { title: 'Assemblies', href: '/dashboard/business/field-management/pricebook/assemblies' },
          { title: 'Pricing Rules', href: '/dashboard/business/field-management/pricebook/rules' }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        icon: BarChart3,
        href: '/dashboard/business/field-management/reports',
        description: 'Analytics and reporting',
        category: 'intelligence',
        priority: 6,
        subItems: [
          { title: 'KPI Dashboard', href: '/dashboard/business/field-management/reports/kpi' },
          { title: 'Job Profitability', href: '/dashboard/business/field-management/reports/profitability' },
          { title: 'Revenue Trends', href: '/dashboard/business/field-management/reports/revenue' },
          { title: 'Tech Scorecards', href: '/dashboard/business/field-management/reports/techs' }
        ]
      },
      {
        id: 'estimates',
        title: 'Estimates',
        icon: FileText,
        href: '/dashboard/business/field-management/estimates',
        description: 'Create and manage job estimates',
        category: 'operations',
        priority: 3,
        subItems: [
          { title: 'Create Estimate', href: '/dashboard/business/field-management/estimates/create' },
          { title: 'Estimate List', href: '/dashboard/business/field-management/estimates' },
          { title: 'Follow-ups', href: '/dashboard/business/field-management/estimates/follow-ups' }
        ]
      },
      {
        id: 'billing',
        title: 'Billing',
        icon: Receipt,
        href: '/dashboard/business/field-management/invoices',
        description: 'Invoice management and payment processing',
        category: 'operations', 
        priority: 4,
        subItems: [
          { title: 'Create Invoice', href: '/dashboard/business/field-management/invoices/create' },
          { title: 'Invoice List', href: '/dashboard/business/field-management/invoices' },
          { title: 'Payment Tracking', href: '/dashboard/business/field-management/invoices/payments' },
          { title: 'Payment Processing', href: '/dashboard/business/field-management/invoices/processing' }
        ]
      }
    ]),
    defaultLayout: {
      topNav: ['dashboard', 'schedule', 'dispatch', 'customers', 'estimates', 'jobs', 'invoices'],
      moreMenu: ['pricebook', 'reports', 'settings'],
      quickActions: ['schedule', 'estimates', 'jobs']
    }
  },

  // General Business (Default)
  {
    id: 'general',
    name: 'General Business',
    description: 'Flexible business management for any industry',
    headerTitle: 'Business Dashboard',
    headerSubtitle: 'Comprehensive Business Management',
    primaryColor: 'blue',
    modules: UNIVERSAL_MODULES,
    defaultLayout: {
      topNav: ['dashboard', 'customers', 'team', 'communication', 'analytics', 'marketing'],
      moreMenu: ['inventory', 'delivery', 'settings'],
      quickActions: ['customers', 'communication', 'analytics']
    }
  }
];

// Role-based permission system
export const ROLE_PERMISSIONS = {
  owner: ['*'], // Access to everything
  manager: ['dashboard', 'customers', 'team', 'analytics', 'communication', 'inventory', 'settings'],
  employee: ['dashboard', 'schedule', 'customers', 'communication'],
  viewer: ['dashboard', 'analytics']
};

// Progressive disclosure rules
export const DISCLOSURE_RULES = {
  newUser: {
    // Show only essential modules for new users
    visibleModules: ['dashboard', 'customers', 'communication'],
    suggestedNext: ['team', 'analytics'],
    hiddenModules: [] as string[]
  },
  basicPlan: {
    // Basic plan limitations
    hiddenModules: ['analytics', 'marketing'],
    upgradePrompts: ['analytics', 'marketing'],
    visibleModules: [] as string[],
    suggestedNext: [] as string[]
  },
  proPlan: {
    // Pro plan gets everything except enterprise features
    hiddenModules: [] as string[],
    featuredModules: ['analytics', 'marketing', 'delivery'],
    visibleModules: [] as string[],
    suggestedNext: [] as string[]
  }
};

// Quick action presets for easy customization
export const QUICK_ACTIONS = {
  restaurantFocus: {
    name: 'Restaurant Focus',
    description: 'Optimize for restaurant operations',
    overrides: {
      jobs: false, dispatch: false, schedule: false, pipeline: false,
      pos: true, orders: true, tables: true, reservations: true, menu: true, staff: true, suppliers: true, kitchen: true, tips: true
    },
    layoutPreset: 'kitchen' as const,
    unifyHomeAndDashboard: true,
    renameInboxToComms: true
  },

  fieldOpsFocus: {
    name: 'Field Operations Focus',
    description: 'Optimize for field service operations',
    overrides: {
      jobs: true, dispatch: true, schedule: true, pipeline: true, customers: true, estimates: true, invoices: true, inventory: true, payments: true,
      pos: false, orders: false, tables: false, reservations: false, menu: false, staff: false, suppliers: false, kitchen: false, tips: false
    },
    layoutPreset: 'ops' as const,
    unifyHomeAndDashboard: false,
    renameInboxToComms: false
  },

  retailFocus: {
    name: 'Retail Focus',
    description: 'Optimize for retail operations',
    overrides: {
      pos: true, orders: true, inventory: true, loyalty: true,
      jobs: false, dispatch: false, schedule: false, pipeline: false,
      tables: false, reservations: false, menu: false, staff: false, suppliers: false, kitchen: false, tips: false
    },
    layoutPreset: 'sales' as const,
    unifyHomeAndDashboard: false,
    renameInboxToComms: false
  }
};

// Layout priority adjustments
export const LAYOUT_PRIORITIES = {
  default: {},
  ops: {
    jobs: -2, schedule: -1, dispatch: -1
  },
  sales: {
    pipeline: -2, estimates: -1, customers: -1
  },
  kitchen: {
    kitchen: -2, orders: -1, menu: -1, pos: -1
  }
};
