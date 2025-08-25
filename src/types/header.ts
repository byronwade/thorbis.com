// Core Types for Thorbis Header Architecture

export type IndustryId = 'field_service' | 'restaurant' | 'retail' | 'general';
export type LayoutPreset = 'default' | 'ops' | 'sales' | 'kitchen';

export type CapabilityKey = 
  // Core capabilities
  | 'home' | 'dashboard' | 'inbox' | 'comms' | 'devices' | 'reporting' | 'business' | 'settings' | 'payroll'
  // Field service capabilities
  | 'schedule' | 'customers' | 'pipeline' | 'estimates' | 'invoices' | 'jobs' | 'dispatch' | 'inventory' | 'payments'
  // Restaurant capabilities
  | 'pos' | 'orders' | 'tables' | 'reservations' | 'menu' | 'staff' | 'suppliers' | 'kitchen' | 'tips'
  // Retail capabilities
  | 'loyalty';

export type Capabilities = Record<CapabilityKey, boolean>;

export interface Business {
  id: string;
  name: string;
  industry: IndustryId;
  layout: LayoutPreset;
  brandColor?: string;
  location?: string;
}

export interface IndustryConfig {
  id: IndustryId;
  unifyHomeAndDashboard: boolean;
  renameInboxToComms: boolean;
  labelOverrides: Record<CapabilityKey, string>;
  capabilities: Capabilities;
}

export interface HeaderPrefs {
  overrides: Partial<Capabilities>;
  renameInboxToComms: boolean | null;
  unifyHomeAndDashboard: boolean | null;
  layoutPreset: LayoutPreset | null;
  pinnedItems?: string[];
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  priority: number;
  capability: CapabilityKey;
  group: 'core' | 'field' | 'restaurant' | 'retail';
}

export interface SubNavItem {
  text: string;
  href: string;
  active?: boolean;
}

export interface RoleCapabilities {
  owner: Capabilities;
  dispatcher: Partial<Capabilities>;
  tech: Partial<Capabilities>;
  cashier: Partial<Capabilities>;
  [key: string]: Partial<Capabilities>;
}

export interface HeaderState {
  visible: NavItem[];
  overflowed: NavItem[];
  subNav?: SubNavItem[];
}

// Registry for navigation items
export const NAV_REGISTRY: Record<CapabilityKey, Omit<NavItem, 'priority'>> = {
  // Core
  home: { id: 'home', label: 'Home', href: '/dashboard/business', icon: 'Home', capability: 'home', group: 'core' },
  dashboard: { id: 'dashboard', label: 'Dashboard', href: '/dashboard/business/field-management', icon: 'BarChart3', capability: 'dashboard', group: 'core' },
  inbox: { id: 'inbox', label: 'Inbox', href: '/dashboard/business/communication', icon: 'Inbox', capability: 'inbox', group: 'core' },
  comms: { id: 'comms', label: 'Inbox', href: '/dashboard/business/communication', icon: 'Inbox', capability: 'comms', group: 'core' },
  devices: { id: 'devices', label: 'Devices', href: '/dashboard/business/devices', icon: 'Monitor', capability: 'devices', group: 'core' },
  reporting: { id: 'reporting', label: 'Reporting', href: '/dashboard/business/analytics', icon: 'BarChart3', capability: 'reporting', group: 'core' },
  business: { id: 'business', label: 'Business', href: '/dashboard/business/profile', icon: 'Building2', capability: 'business', group: 'core' },
  settings: { id: 'settings', label: 'Settings', href: '/dashboard/business/settings', icon: 'Settings', capability: 'settings', group: 'core' },
  payroll: { id: 'payroll', label: 'Payroll', href: '/dashboard/business/payroll', icon: 'DollarSign', capability: 'payroll', group: 'core' },
  
  // Field Service
  schedule: { id: 'schedule', label: 'Schedule', href: '/dashboard/business/field-management/schedule', icon: 'Calendar', capability: 'schedule', group: 'field' },
  customers: { id: 'customers', label: 'Customers', href: '/dashboard/business/field-management/customers', icon: 'Users', capability: 'customers', group: 'field' },
  pipeline: { id: 'pipeline', label: 'Pipeline', href: '/dashboard/business/pipeline', icon: 'TrendingUp', capability: 'pipeline', group: 'field' },
  estimates: { id: 'estimates', label: 'Estimates', href: '/dashboard/business/field-management/estimates', icon: 'FileText', capability: 'estimates', group: 'field' },
  billing: { id: 'billing', label: 'Invoices', href: '/dashboard/business/field-management/invoices', icon: 'Receipt', capability: 'billing', group: 'field' },
  jobs: { id: 'jobs', label: 'Jobs', href: '/dashboard/business/field-management/jobs', icon: 'Briefcase', capability: 'jobs', group: 'field' },
  dispatch: { id: 'dispatch', label: 'Dispatch', href: '/dashboard/business/field-management/dispatch', icon: 'Truck', capability: 'dispatch', group: 'field' },
  inventory: { id: 'inventory', label: 'Inventory', href: '/dashboard/business/inventory', icon: 'Package', capability: 'inventory', group: 'field' },
  payments: { id: 'payments', label: 'Payments', href: '/dashboard/business/payments', icon: 'CreditCard', capability: 'payments', group: 'field' },
  
  // Restaurant
  pos: { id: 'pos', label: 'POS', href: '/dashboard/business/pos', icon: 'CreditCard', capability: 'pos', group: 'restaurant' },
  orders: { id: 'orders', label: 'Orders', href: '/dashboard/business/orders', icon: 'ShoppingCart', capability: 'orders', group: 'restaurant' },
  tables: { id: 'tables', label: 'Tables', href: '/dashboard/business/tables', icon: 'Grid3X3', capability: 'tables', group: 'restaurant' },
  reservations: { id: 'reservations', label: 'Reservations', href: '/dashboard/business/reservations', icon: 'Calendar', capability: 'reservations', group: 'restaurant' },
  menu: { id: 'menu', label: 'Menu', href: '/dashboard/business/menu', icon: 'Book', capability: 'menu', group: 'restaurant' },
  staff: { id: 'staff', label: 'Staff', href: '/dashboard/business/staff', icon: 'Users', capability: 'staff', group: 'restaurant' },
  suppliers: { id: 'suppliers', label: 'Suppliers', href: '/dashboard/business/suppliers', icon: 'Truck', capability: 'suppliers', group: 'restaurant' },
  kitchen: { id: 'kitchen', label: 'Kitchen', href: '/dashboard/business/kitchen', icon: 'ChefHat', capability: 'kitchen', group: 'restaurant' },
  tips: { id: 'tips', label: 'Tips', href: '/dashboard/business/tips', icon: 'DollarSign', capability: 'tips', group: 'restaurant' },
  
  // Retail
  loyalty: { id: 'loyalty', label: 'Loyalty', href: '/dashboard/business/loyalty', icon: 'Star', capability: 'loyalty', group: 'retail' },
};

// Default role capabilities
export const DEFAULT_ROLE_CAPABILITIES: RoleCapabilities = {
  owner: Object.fromEntries(Object.keys(NAV_REGISTRY).map(key => [key, true])) as Capabilities,
  dispatcher: {
    jobs: true, schedule: true, dispatch: true, customers: true, invoices: true,
    home: true, dashboard: true, inbox: true, comms: true, devices: true, reporting: true, business: true, settings: true
  },
  tech: {
    jobs: true, customers: true, home: true, dashboard: true, inbox: true, comms: true, devices: true, settings: true
  },
  cashier: {
    pos: true, orders: true, home: true, dashboard: true, inbox: true, comms: true, settings: true
  }
};
