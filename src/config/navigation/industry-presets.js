/**
 * Industry Navigation Presets
 * Smart navigation configurations for different business types
 * Provides intelligent defaults while allowing customization
 */

import {
  BarChart3,
  Calendar,
  Users,
  FileText,
  Receipt,
  Package,
  MessageSquare,
  TrendingUp,
  Calculator,
  Wrench,
  MapPin,
  Clock,
  Truck,
  Settings,
  Phone,
  Shield,
  DollarSign,
  Target,
  Building2,
  ShoppingCart,
  Utensils,
  Store,
  Scissors,
  Stethoscope,
  Hammer,
  Car,
  Home,
  Briefcase,
  Sparkles,
  Zap,
  Palette,
  Database,
  Globe,
  Star,
  BookOpen
} from "lucide-react";

/**
 * Module Definitions - Core building blocks for business navigation
 * Each module represents a functional area of business management
 * Organized following best practices: 5-7 main items, clear labels, hierarchical structure
 */
export const BUSINESS_MODULES = {
  // Core Operations - Primary business functions
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard/business",
    category: "Core",
    description: "Real-time business overview with key performance metrics and insights",
    defaultRoles: ["OWNER", "MANAGER", "SUPERVISOR"],
    priority: 1,
    isCore: true,
    subnav: [
      { text: "Overview", href: "/dashboard/business", description: "Main business dashboard" },
      { text: "Performance", href: "/dashboard/shared/dashboard/real-time-insights", description: "Real-time performance metrics" },
      { text: "Updates", href: "/dashboard/shared/updates", description: "Latest business updates" },
    ]
  },

  // Operations Management - Core business operations
  schedule: {
    id: "schedule",
    label: "Operations",
    icon: Calendar,
    href: "/dashboard/business/schedule",
    category: "Operations",
    description: "Job scheduling, dispatch management, and operational workflow",
    defaultRoles: ["OWNER", "MANAGER", "DISPATCHER", "SUPERVISOR"],
    priority: 2,
    industries: ["plumbing", "hvac", "electrical", "landscaping", "construction", "pest-control", "automotive", "cleaning"],
    subnav: [
      { text: "Schedule", href: "/dashboard/business/schedule/calendar", description: "Calendar view of all jobs and appointments" },
      { text: "Dispatch", href: "/dashboard/business/schedule/dispatch", description: "Real-time dispatch board for field teams" },
      { text: "New Job", href: "/dashboard/business/schedule/new-job", description: "Create and assign new jobs" },
      { text: "Routes", href: "/dashboard/business/schedule/route-planner", description: "Optimize routes for efficiency" },
      { text: "Recurring", href: "/dashboard/business/schedule/recurring-jobs", description: "Manage recurring service schedules" },
    ]
  },

  customers: {
    id: "customers",
    label: "Customers",
    icon: Users,
    href: "/dashboard/business/customers",
    category: "Sales & Service",
    description: "Complete customer relationship management and service history",
    defaultRoles: ["OWNER", "MANAGER", "SALES", "DISPATCHER", "CSR"],
    priority: 3,
    subnav: [
      { text: "Customer List", href: "/dashboard/business/customers/list", description: "Manage all customer information and contacts" },
      { text: "Service History", href: "/dashboard/business/customers/service-history", description: "Track all past services and interactions" },
      { text: "Communications", href: "/dashboard/business/customers/messages-log", description: "Message history and customer communications" },
      { text: "Customer Portal", href: "/dashboard/business/customers/portal", description: "Customer self-service portal access" },
    ]
  },

  estimates: {
    id: "estimates",
    label: "Estimates",
    icon: FileText,
    href: "/dashboard/business/estimates",
    category: "Sales & Service",
    description: "Professional estimate creation, templates, and follow-up management",
    defaultRoles: ["OWNER", "MANAGER", "SALES", "ESTIMATOR"],
    priority: 4,
    industries: ["plumbing", "hvac", "electrical", "construction", "landscaping", "automotive", "cleaning"],
    subnav: [
      { text: "Create Estimate", href: "/dashboard/business/estimates/create", description: "Generate new professional estimates" },
      { text: "Estimate List", href: "/dashboard/business/estimates/list", description: "View and manage all estimates" },
      { text: "Templates", href: "/dashboard/business/estimates/templates", description: "Reusable estimate templates" },
      { text: "Follow-ups", href: "/dashboard/business/estimates/follow-ups", description: "Track estimate follow-ups and conversions" },
    ]
  },

  invoices: {
    id: "invoices",
    label: "Billing",
    icon: Receipt,
    href: "/dashboard/business/invoices",
    category: "Finance",
    description: "Complete invoice management, payment tracking, and accounting integration",
    defaultRoles: ["OWNER", "MANAGER", "ACCOUNTING", "BILLING"],
    priority: 5,
    subnav: [
      { text: "Create Invoice", href: "/dashboard/business/invoices/create", description: "Generate invoices from estimates or jobs" },
      { text: "Invoice List", href: "/dashboard/business/invoices/list", description: "Manage all invoices and payment status" },
      { text: "Payments", href: "/dashboard/business/invoices/payments", description: "Track payments and payment methods" },
      { text: "Accounting", href: "/dashboard/business/invoices/accounting-sync", description: "Sync with accounting software" },
    ]
  },

  inventory: {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    href: "/dashboard/shared/inventory",
    category: "Operations",
    description: "Complete inventory management, parts tracking, and vendor relationships",
    defaultRoles: ["OWNER", "MANAGER", "INVENTORY", "WAREHOUSE"],
    priority: 6,
    industries: ["plumbing", "hvac", "electrical", "automotive", "retail", "construction", "landscaping"],
    subnav: [
      { text: "Stock List", href: "/dashboard/shared/inventory/stock-list", description: "Manage all inventory items and stock levels" },
      { text: "Purchase Orders", href: "/dashboard/shared/inventory/purchase-orders", description: "Create and track purchase orders" },
      { text: "Vendors", href: "/dashboard/shared/inventory/vendors", description: "Manage vendor relationships and pricing" },
      { text: "Usage Tracking", href: "/dashboard/shared/inventory/parts-usage", description: "Track parts usage and consumption" },
    ]
  },

  employees: {
    id: "employees",
    label: "Team",
    icon: Users,
    href: "/dashboard/shared/employees",
    category: "Human Resources",
    description: "Complete team management, scheduling, and performance tracking",
    defaultRoles: ["OWNER", "MANAGER", "HR"],
    priority: 7,
    subnav: [
      { text: "Staff List", href: "/dashboard/shared/employees/staff-list", description: "Manage employee information and profiles" },
      { text: "Roles & Skills", href: "/dashboard/shared/employees/roles-skills", description: "Define roles, skills, and permissions" },
      { text: "Time & Payroll", href: "/dashboard/shared/time-payroll", description: "Track time, attendance, and payroll" },
      { text: "Vehicle Tracking", href: "/dashboard/shared/employees/vehicle-tracking", description: "Monitor fleet and vehicle usage" },
    ]
  },

  communication: {
    id: "communication",
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/business/communication",
    category: "Communication",
    description: "Customer and team communication",
    defaultRoles: ["OWNER", "MANAGER", "CSR", "DISPATCHER"],
    priority: 8,
    subnav: [
      { text: "Email Management", href: "/dashboard/business/communication" },
      { text: "Team Chat", href: "/dashboard/business/communication/team-chat" },
      { text: "Voice & Video", href: "/dashboard/business/communication/voice-video" },
      { text: "Ticketing System", href: "/dashboard/business/communication/ticketing" },
    ]
  },

  // Additional Modules
  fleet: {
    id: "fleet",
    label: "Fleet",
    icon: Truck,
    href: "/dashboard/business/fleet",
    category: "Operations",
    description: "Vehicle and fleet management",
    defaultRoles: ["OWNER", "MANAGER", "FLEET"],
    priority: 9,
    industries: ["plumbing", "hvac", "electrical", "pest-control", "delivery", "landscaping"],
    subnav: [
      { text: "Vehicle List", href: "/dashboard/business/fleet/vehicles" },
      { text: "GPS Tracking", href: "/dashboard/business/fleet/tracking" },
      { text: "Maintenance", href: "/dashboard/business/fleet/maintenance" },
      { text: "Fuel & Costs", href: "/dashboard/business/fleet/costs" },
    ]
  },

  jobs: {
    id: "jobs",
    label: "Jobs",
    icon: Wrench,
    href: "/dashboard/business/jobs",
    category: "Field Operations",
    description: "Job management and tracking",
    defaultRoles: ["OWNER", "MANAGER", "SUPERVISOR", "TECHNICIAN"],
    priority: 10,
    industries: ["plumbing", "hvac", "electrical", "construction", "landscaping", "pest-control"],
    subnav: [
      { text: "Active Jobs", href: "/dashboard/business/jobs/active" },
      { text: "Job History", href: "/dashboard/business/jobs/history" },
      { text: "Job Templates", href: "/dashboard/business/jobs/templates" },
      { text: "Job Reports", href: "/dashboard/business/jobs/reports" },
    ]
  },

  equipment: {
    id: "equipment",
    label: "Equipment",
    icon: Package,
    href: "/dashboard/business/equipment",
    category: "Operations",
    description: "Equipment and asset management",
    defaultRoles: ["OWNER", "MANAGER", "SUPERVISOR"],
    priority: 11,
    industries: ["plumbing", "hvac", "electrical", "construction", "landscaping"],
    subnav: [
      { text: "Equipment List", href: "/dashboard/business/equipment/list" },
      { text: "Maintenance Schedule", href: "/dashboard/business/equipment/maintenance" },
      { text: "Equipment Tracking", href: "/dashboard/business/equipment/tracking" },
      { text: "Warranty Management", href: "/dashboard/business/equipment/warranty" },
    ]
  },

  routes: {
    id: "routes",
    label: "Routes",
    icon: MapPin,
    href: "/dashboard/business/routes",
    category: "Field Operations",
    description: "Route planning and optimization",
    defaultRoles: ["OWNER", "MANAGER", "DISPATCHER"],
    priority: 12,
    industries: ["plumbing", "hvac", "electrical", "pest-control", "delivery", "landscaping"],
    subnav: [
      { text: "Route Planning", href: "/dashboard/business/routes/planning" },
      { text: "Route Optimization", href: "/dashboard/business/routes/optimization" },
      { text: "Route History", href: "/dashboard/business/routes/history" },
      { text: "Territory Management", href: "/dashboard/business/routes/territories" },
    ]
  },

  marketing: {
    id: "marketing",
    label: "Marketing",
    icon: TrendingUp,
    href: "/dashboard/shared/marketing",
    category: "Growth",
    description: "Marketing campaigns and analytics",
    defaultRoles: ["OWNER", "MANAGER", "MARKETING"],
    priority: 10,
    subnav: [
      { text: "Campaigns", href: "/dashboard/shared/marketing/campaigns" },
      { text: "Reviews Management", href: "/dashboard/shared/marketing/reviews" },
      { text: "Online Booking", href: "/dashboard/shared/marketing/online-booking" },
      { text: "Website Builder", href: "/dashboard/shared/marketing/website-builder" },
    ]
  },

  accounting: {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    href: "/dashboard/shared/accounting",
    category: "Finance",
    description: "Financial reporting and accounting",
    defaultRoles: ["OWNER", "ACCOUNTING", "MANAGER"],
    priority: 11,
    subnav: [
      { text: "Financial Reports", href: "/dashboard/shared/accounting/reports" },
      { text: "Tax Preparation", href: "/dashboard/shared/accounting/taxes" },
      { text: "Expense Tracking", href: "/dashboard/shared/accounting/expenses" },
      { text: "Integrations", href: "/dashboard/shared/accounting/integrations" },
    ]
  },

  // Restaurant/Hospitality Modules
  pos: {
    id: "pos",
    label: "Point of Sale",
    icon: Store,
    href: "/dashboard/business/pos",
    category: "Sales",
    description: "Point of sale system",
    defaultRoles: ["OWNER", "MANAGER", "CASHIER"],
    priority: 2,
    industries: ["restaurant", "retail", "hospitality"],
    subnav: [
      { text: "Current Orders", href: "/dashboard/business/pos/orders" },
      { text: "Menu Management", href: "/dashboard/business/pos/menu" },
      { text: "Payment Processing", href: "/dashboard/business/pos/payments" },
      { text: "Daily Reports", href: "/dashboard/business/pos/reports" },
    ]
  },

  menu: {
    id: "menu",
    label: "Menu",
    icon: Utensils,
    href: "/dashboard/business/menu",
    category: "Operations",
    description: "Menu planning and management",
    defaultRoles: ["OWNER", "MANAGER", "CHEF"],
    priority: 3,
    industries: ["restaurant", "catering", "food-truck"],
    subnav: [
      { text: "Menu Builder", href: "/dashboard/business/menu/builder" },
      { text: "Categories", href: "/dashboard/business/menu/categories" },
      { text: "Pricing", href: "/dashboard/business/menu/pricing" },
      { text: "Seasonal Items", href: "/dashboard/business/menu/seasonal" },
    ]
  },

  kitchen: {
    id: "kitchen",
    label: "Kitchen",
    icon: Utensils,
    href: "/dashboard/business/kitchen",
    category: "Operations",
    description: "Kitchen operations and order management",
    defaultRoles: ["OWNER", "MANAGER", "CHEF", "KITCHEN"],
    priority: 4,
    industries: ["restaurant", "catering", "food-truck"],
    subnav: [
      { text: "Order Queue", href: "/dashboard/business/kitchen/orders" },
      { text: "Prep List", href: "/dashboard/business/kitchen/prep" },
      { text: "Kitchen Display", href: "/dashboard/business/kitchen/display" },
      { text: "Recipe Management", href: "/dashboard/business/kitchen/recipes" },
    ]
  },

  delivery: {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    href: "/dashboard/business/delivery",
    category: "Operations",
    description: "Delivery and takeout management",
    defaultRoles: ["OWNER", "MANAGER", "DISPATCHER"],
    priority: 5,
    industries: ["restaurant", "retail", "food-delivery"],
    subnav: [
      { text: "Delivery Orders", href: "/dashboard/business/delivery/orders" },
      { text: "Driver Management", href: "/dashboard/business/delivery/drivers" },
      { text: "Route Optimization", href: "/dashboard/business/delivery/routes" },
      { text: "Delivery Zones", href: "/dashboard/business/delivery/zones" },
    ]
  },

  reservations: {
    id: "reservations",
    label: "Reservations",
    icon: Calendar,
    href: "/dashboard/business/reservations",
    category: "Operations",
    description: "Table and reservation management",
    defaultRoles: ["OWNER", "MANAGER", "HOST"],
    priority: 3,
    industries: ["restaurant", "hospitality", "events"],
    subnav: [
      { text: "Reservation Calendar", href: "/dashboard/business/reservations/calendar" },
      { text: "Table Management", href: "/dashboard/business/reservations/tables" },
      { text: "Waitlist", href: "/dashboard/business/reservations/waitlist" },
      { text: "Guest History", href: "/dashboard/business/reservations/history" },
    ]
  },

  // Settings and Admin
  settings: {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/shared/settings",
    category: "Admin",
    description: "Business configuration and settings",
    defaultRoles: ["OWNER", "MANAGER"],
    priority: 99,
    isCore: true,
    subnav: [
      { text: "Company Info", href: "/dashboard/shared/settings/company-info" },
      { text: "Users & Roles", href: "/dashboard/shared/settings/users-roles" },
      { text: "Integrations", href: "/dashboard/shared/settings" },
      { text: "Billing", href: "/dashboard/shared/settings/subscription-billing" },
    ]
  },

  // Additional Shared Modules
  analytics: {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/shared/analytics",
    category: "Insights",
    description: "Business analytics and reporting",
    defaultRoles: ["OWNER", "MANAGER"],
    priority: 12,
    subnav: [
      { text: "Dashboard", href: "/dashboard/shared/analytics/dashboard" },
      { text: "Custom Reports", href: "/dashboard/shared/analytics/custom-report-builder" },
      { text: "Performance", href: "/dashboard/shared/analytics/performance" },
    ]
  },

  automation: {
    id: "automation",
    label: "Automation",
    icon: Settings,
    href: "/dashboard/shared/automation",
    category: "Efficiency",
    description: "AI-powered workflows and automation",
    defaultRoles: ["OWNER", "MANAGER"],
    priority: 13,
    subnav: [
      { text: "Workflows", href: "/dashboard/shared/automation/workflow-automations" },
      { text: "AI Coach", href: "/dashboard/shared/automation/ai-performance-coach" },
      { text: "Auto Scheduling", href: "/dashboard/shared/automation/auto-scheduling-ai" },
    ]
  }
};

/**
 * Industry Preset Configurations
 * Defines default module sets and priorities for different industries
 */
export const INDUSTRY_PRESETS = {
  "field-service": {
    id: "field-service",
    name: "Field Service",
    description: "Plumbing, HVAC, Electrical, and other field service businesses",
    icon: Wrench,
    basePath: "/dashboard/business/field-management",
    modules: [
      "dashboard",
      "schedule", 
      "customers",
      "estimates",
      "invoices",
      "communication",
      "dispatch",
      "fleet",
      "routes",
      "equipment",
      "jobs"
    ],
    sharedModules: [
      "inventory",
      "employees", 
      "marketing",
      "accounting",
      "analytics",
      "automation",
      "settings"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      communication: 5,
      dispatch: 6
    }
  },

  plumbing: {
    id: "plumbing",
    name: "Plumbing Services",
    description: "Residential and commercial plumbing services",
    icon: Wrench,
    modules: [
      "dashboard",
      "schedule",
      "customers", 
      "estimates",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "fleet",
      "marketing",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "inventory"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      inventory: 5,
      fleet: 6
    }
  },

  hvac: {
    id: "hvac",
    name: "HVAC Services",
    description: "Heating, ventilation, and air conditioning services",
    icon: Wrench,
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates", 
      "invoices",
      "inventory",
      "employees",
      "communication",
      "fleet",
      "marketing",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "communication"],
    priorities: {
      schedule: 1,
      customers: 2, 
      estimates: 3,
      invoices: 4,
      inventory: 5,
      communication: 6
    }
  },

  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    description: "Full-service restaurants and eateries",
    icon: Utensils,
    basePath: "/dashboard/business/restaurants",
    modules: [
      "dashboard",
      "pos",
      "menu",
      "kitchen",
      "reservations",
      "delivery",
      "customers",
      "inventory",
      "staff",
      "analytics"
    ],
    sharedModules: [
      "employees",
      "marketing",
      "accounting",
      "automation",
      "invoices",
      "settings"
    ],
    pinnedModules: ["dashboard", "pos", "menu", "kitchen", "reservations", "delivery"],
    priorities: {
      pos: 1,
      menu: 2,
      kitchen: 3,
      reservations: 4,
      delivery: 5,
      customers: 6
    }
  },

  retail: {
    id: "retail",
    name: "Retail Store",
    description: "Retail and merchandise businesses",
    icon: ShoppingCart,
    modules: [
      "dashboard",
      "pos",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "pos", "inventory", "customers", "employees", "marketing"],
    priorities: {
      pos: 1,
      inventory: 2,
      customers: 3,
      employees: 4,
      marketing: 5,
      accounting: 6
    }
  },

  construction: {
    id: "construction",
    name: "Construction",
    description: "General contracting and construction services",
    icon: Hammer,
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "inventory", 
      "employees",
      "fleet",
      "communication",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "employees"],
    priorities: {
      schedule: 1,
      estimates: 2,
      customers: 3,
      invoices: 4,
      employees: 5,
      fleet: 6
    }
  },

  automotive: {
    id: "automotive",
    name: "Automotive Services",
    description: "Auto repair and maintenance services",
    icon: Car,
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "fleet",
      "marketing",
      "settings"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "inventory"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      inventory: 5,
      communication: 6
    }
  },

  real_estate: {
    id: "real_estate", 
    name: "Real Estate",
    description: "Real estate and property management",
    icon: Home,
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "marketing",
      "invoices",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "marketing", "invoices"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      marketing: 4,
      invoices: 5,
      accounting: 6
    }
  },

  professional_services: {
    id: "professional_services",
    name: "Professional Services",
    description: "Consulting, legal, accounting, and other professional services",
    icon: Briefcase,
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "invoices", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      invoices: 4,
      marketing: 5,
      employees: 6
    }
  },

  // Additional Industry Presets - Adding missing industries from BusinessSwitcher
  cafe: {
    id: "cafe",
    name: "Café",
    description: "Coffee shops, cafes, and casual dining establishments",
    icon: Utensils,
    basePath: "/dashboard/business/cafe",
    modules: [
      "dashboard",
      "pos",
      "menu",
      "kitchen",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "menu", "kitchen", "customers", "inventory"],
    priorities: {
      pos: 1,
      menu: 2,
      kitchen: 3,
      customers: 4,
      inventory: 5,
      employees: 6
    }
  },

  bar: {
    id: "bar",
    name: "Bar & Pub",
    description: "Bars, pubs, and beverage-focused establishments",
    icon: Utensils,
    basePath: "/dashboard/business/bar",
    modules: [
      "dashboard",
      "pos",
      "menu",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "menu", "customers", "inventory", "employees"],
    priorities: {
      pos: 1,
      menu: 2,
      customers: 3,
      inventory: 4,
      employees: 5,
      invoices: 6
    }
  },

  bakery: {
    id: "bakery",
    name: "Bakery",
    description: "Bakeries and pastry shops",
    icon: Utensils,
    basePath: "/dashboard/business/bakery",
    modules: [
      "dashboard",
      "pos",
      "menu",
      "kitchen",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "menu", "kitchen", "customers", "inventory"],
    priorities: {
      pos: 1,
      menu: 2,
      kitchen: 3,
      customers: 4,
      inventory: 5,
      employees: 6
    }
  },

  catering: {
    id: "catering",
    name: "Catering",
    description: "Catering services and event food preparation",
    icon: Utensils,
    basePath: "/dashboard/business/catering",
    modules: [
      "dashboard",
      "schedule",
      "menu",
      "kitchen",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "menu", "kitchen", "customers", "invoices"],
    priorities: {
      schedule: 1,
      menu: 2,
      kitchen: 3,
      customers: 4,
      invoices: 5,
      inventory: 6
    }
  },

  food_truck: {
    id: "food_truck",
    name: "Food Truck",
    description: "Mobile food service and food truck operations",
    icon: Truck,
    basePath: "/dashboard/business/food-truck",
    modules: [
      "dashboard",
      "pos",
      "menu",
      "kitchen",
      "schedule",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "menu", "kitchen", "schedule", "customers"],
    priorities: {
      pos: 1,
      menu: 2,
      kitchen: 3,
      schedule: 4,
      customers: 5,
      inventory: 6
    }
  },

  hotel: {
    id: "hotel",
    name: "Hotel & Hospitality",
    description: "Hotels, motels, and hospitality services",
    icon: Building2,
    basePath: "/dashboard/business/hotel",
    modules: [
      "dashboard",
      "reservations",
      "customers",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "reservations", "customers", "employees", "invoices", "marketing"],
    priorities: {
      reservations: 1,
      customers: 2,
      employees: 3,
      invoices: 4,
      marketing: 5,
      accounting: 6
    }
  },

  ecommerce: {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail and digital commerce",
    icon: ShoppingCart,
    basePath: "/dashboard/business/ecommerce",
    modules: [
      "dashboard",
      "customers",
      "inventory",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "inventory", "invoices", "marketing", "analytics"],
    priorities: {
      customers: 1,
      inventory: 2,
      invoices: 3,
      marketing: 4,
      analytics: 5,
      employees: 6
    }
  },

  grocery: {
    id: "grocery",
    name: "Grocery Store",
    description: "Grocery stores and supermarkets",
    icon: ShoppingCart,
    basePath: "/dashboard/business/grocery",
    modules: [
      "dashboard",
      "pos",
      "inventory",
      "customers",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "inventory", "customers", "employees", "marketing"],
    priorities: {
      pos: 1,
      inventory: 2,
      customers: 3,
      employees: 4,
      marketing: 5,
      invoices: 6
    }
  },

  jewelry: {
    id: "jewelry",
    name: "Jewelry Store",
    description: "Jewelry stores and precious goods retail",
    icon: Sparkles,
    basePath: "/dashboard/business/jewelry",
    modules: [
      "dashboard",
      "pos",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "customers", "inventory", "employees", "marketing"],
    priorities: {
      pos: 1,
      customers: 2,
      inventory: 3,
      employees: 4,
      marketing: 5,
      invoices: 6
    }
  },

  clothing: {
    id: "clothing",
    name: "Clothing Store",
    description: "Apparel and fashion retail stores",
    icon: ShoppingCart,
    basePath: "/dashboard/business/clothing",
    modules: [
      "dashboard",
      "pos",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "customers", "inventory", "employees", "marketing"],
    priorities: {
      pos: 1,
      customers: 2,
      inventory: 3,
      employees: 4,
      marketing: 5,
      invoices: 6
    }
  },

  electronics: {
    id: "electronics",
    name: "Electronics Store",
    description: "Electronics and technology retail",
    icon: Zap,
    basePath: "/dashboard/business/electronics",
    modules: [
      "dashboard",
      "pos",
      "customers",
      "inventory",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "customers", "inventory", "employees", "marketing"],
    priorities: {
      pos: 1,
      customers: 2,
      inventory: 3,
      employees: 4,
      marketing: 5,
      invoices: 6
    }
  },

  legal: {
    id: "legal",
    name: "Legal Services",
    description: "Law firms and legal service providers",
    icon: FileText,
    basePath: "/dashboard/business/legal",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "invoices", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      invoices: 4,
      marketing: 5,
      employees: 6
    }
  },

  consulting: {
    id: "consulting",
    name: "Consulting",
    description: "Business consulting and advisory services",
    icon: Briefcase,
    basePath: "/dashboard/business/consulting",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "invoices", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      invoices: 4,
      marketing: 5,
      employees: 6
    }
  },

  design: {
    id: "design",
    name: "Design Services",
    description: "Graphic design, web design, and creative services",
    icon: Palette,
    basePath: "/dashboard/business/design",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "invoices", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      invoices: 4,
      marketing: 5,
      employees: 6
    }
  },

  it_services: {
    id: "it_services",
    name: "IT Services",
    description: "Information technology and technical support services",
    icon: Database,
    basePath: "/dashboard/business/it-services",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      communication: 5,
      employees: 6
    }
  },

  architecture: {
    id: "architecture",
    name: "Architecture",
    description: "Architectural design and planning services",
    icon: Building2,
    basePath: "/dashboard/business/architecture",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "estimates",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "estimates", "invoices", "communication"],
    priorities: {
      customers: 1,
      schedule: 2,
      estimates: 3,
      invoices: 4,
      communication: 5,
      employees: 6
    }
  },

  interior_design: {
    id: "interior_design",
    name: "Interior Design",
    description: "Interior design and decoration services",
    icon: Palette,
    basePath: "/dashboard/business/interior-design",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "estimates",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "estimates", "invoices", "communication"],
    priorities: {
      customers: 1,
      schedule: 2,
      estimates: 3,
      invoices: 4,
      communication: 5,
      employees: 6
    }
  },

  property_management: {
    id: "property_management",
    name: "Property Management",
    description: "Property management and real estate services",
    icon: Building2,
    basePath: "/dashboard/business/property-management",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "communication",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "communication", "invoices", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      communication: 3,
      invoices: 4,
      marketing: 5,
      employees: 6
    }
  },

  auto_repair: {
    id: "auto_repair",
    name: "Auto Repair",
    description: "Automotive repair and maintenance services",
    icon: Wrench,
    basePath: "/dashboard/business/auto-repair",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "inventory"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      inventory: 5,
      employees: 6
    }
  },

  car_dealership: {
    id: "car_dealership",
    name: "Car Dealership",
    description: "Automotive sales and dealership services",
    icon: Car,
    basePath: "/dashboard/business/car-dealership",
    modules: [
      "dashboard",
      "customers",
      "inventory",
      "invoices",
      "employees",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "inventory", "invoices", "employees", "marketing"],
    priorities: {
      customers: 1,
      inventory: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      accounting: 6
    }
  },

  towing: {
    id: "towing",
    name: "Towing Services",
    description: "Towing and roadside assistance services",
    icon: Truck,
    basePath: "/dashboard/business/towing",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "fleet",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "fleet", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      fleet: 4,
      communication: 5,
      employees: 6
    }
  },

  dental: {
    id: "dental",
    name: "Dental Services",
    description: "Dental practices and oral healthcare services",
    icon: Stethoscope,
    basePath: "/dashboard/business/dental",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  veterinary: {
    id: "veterinary",
    name: "Veterinary Services",
    description: "Veterinary clinics and animal healthcare services",
    icon: Stethoscope,
    basePath: "/dashboard/business/veterinary",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  beauty: {
    id: "beauty",
    name: "Beauty Services",
    description: "Beauty salons and cosmetic services",
    icon: Sparkles,
    basePath: "/dashboard/business/beauty",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  salon: {
    id: "salon",
    name: "Hair Salon",
    description: "Hair salons and styling services",
    icon: Scissors,
    basePath: "/dashboard/business/salon",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  spa: {
    id: "spa",
    name: "Spa & Wellness",
    description: "Spa services and wellness treatments",
    icon: Sparkles,
    basePath: "/dashboard/business/spa",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  fitness: {
    id: "fitness",
    name: "Fitness & Gym",
    description: "Fitness centers, gyms, and personal training services",
    icon: Zap,
    basePath: "/dashboard/business/fitness",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  education: {
    id: "education",
    name: "Education",
    description: "Educational institutions and training centers",
    icon: BookOpen,
    basePath: "/dashboard/business/education",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  training: {
    id: "training",
    name: "Training Services",
    description: "Professional training and certification services",
    icon: Users,
    basePath: "/dashboard/business/training",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  tutoring: {
    id: "tutoring",
    name: "Tutoring Services",
    description: "Academic tutoring and educational support services",
    icon: Users,
    basePath: "/dashboard/business/tutoring",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "communication"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      communication: 5,
      marketing: 6
    }
  },

  entertainment: {
    id: "entertainment",
    name: "Entertainment",
    description: "Entertainment venues and event services",
    icon: Star,
    basePath: "/dashboard/business/entertainment",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "marketing"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  gaming: {
    id: "gaming",
    name: "Gaming & Arcade",
    description: "Gaming centers, arcades, and entertainment venues",
    icon: Zap,
    basePath: "/dashboard/business/gaming",
    modules: [
      "dashboard",
      "pos",
      "customers",
      "employees",
      "invoices",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "pos", "customers", "employees", "invoices", "marketing"],
    priorities: {
      pos: 1,
      customers: 2,
      employees: 3,
      invoices: 4,
      marketing: 5,
      accounting: 6
    }
  },

  events: {
    id: "events",
    name: "Event Services",
    description: "Event planning and management services",
    icon: Calendar,
    basePath: "/dashboard/business/events",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "employees", "marketing"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  technology: {
    id: "technology",
    name: "Technology",
    description: "Technology companies and software development",
    icon: Database,
    basePath: "/dashboard/business/technology",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "invoices", "employees", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  software: {
    id: "software",
    name: "Software Development",
    description: "Software development and programming services",
    icon: Database,
    basePath: "/dashboard/business/software",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "invoices", "employees", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  web_development: {
    id: "web_development",
    name: "Web Development",
    description: "Web development and digital services",
    icon: Globe,
    basePath: "/dashboard/business/web-development",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "invoices", "employees", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  mobile_apps: {
    id: "mobile_apps",
    name: "Mobile App Development",
    description: "Mobile application development services",
    icon: Zap,
    basePath: "/dashboard/business/mobile-apps",
    modules: [
      "dashboard",
      "customers",
      "schedule",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "customers", "schedule", "invoices", "employees", "marketing"],
    priorities: {
      customers: 1,
      schedule: 2,
      invoices: 3,
      employees: 4,
      marketing: 5,
      communication: 6
    }
  },

  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Manufacturing and production companies",
    icon: Wrench,
    basePath: "/dashboard/business/manufacturing",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "inventory", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      inventory: 4,
      employees: 5,
      communication: 6
    }
  },

  production: {
    id: "production",
    name: "Production Services",
    description: "Production and manufacturing services",
    icon: Package,
    basePath: "/dashboard/business/production",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "inventory", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      inventory: 4,
      employees: 5,
      communication: 6
    }
  },

  transportation: {
    id: "transportation",
    name: "Transportation",
    description: "Transportation and logistics services",
    icon: Truck,
    basePath: "/dashboard/business/transportation",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "fleet",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "fleet", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      fleet: 4,
      employees: 5,
      communication: 6
    }
  },

  logistics: {
    id: "logistics",
    name: "Logistics",
    description: "Logistics and supply chain management",
    icon: Package,
    basePath: "/dashboard/business/logistics",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "fleet",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "fleet", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      fleet: 4,
      employees: 5,
      communication: 6
    }
  },

  delivery: {
    id: "delivery",
    name: "Delivery Services",
    description: "Delivery and courier services",
    icon: Truck,
    basePath: "/dashboard/business/delivery",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "invoices",
      "fleet",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "invoices", "fleet", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      invoices: 3,
      fleet: 4,
      employees: 5,
      communication: 6
    }
  },

  cleaning: {
    id: "cleaning",
    name: "Cleaning Services",
    description: "Commercial and residential cleaning services",
    icon: Sparkles,
    basePath: "/dashboard/business/cleaning",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      employees: 5,
      communication: 6
    }
  },

  pest_control: {
    id: "pest_control",
    name: "Pest Control",
    description: "Pest control and extermination services",
    icon: Shield,
    basePath: "/dashboard/business/pest-control",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      employees: 5,
      communication: 6
    }
  },

  landscaping: {
    id: "landscaping",
    name: "Landscaping",
    description: "Landscaping and garden maintenance services",
    icon: Home,
    basePath: "/dashboard/business/landscaping",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "employees",
      "fleet",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "employees"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      employees: 5,
      fleet: 6
    }
  },

  electrical: {
    id: "electrical",
    name: "Electrical Services",
    description: "Electrical installation and repair services",
    icon: Zap,
    basePath: "/dashboard/business/electrical",
    modules: [
      "dashboard",
      "schedule",
      "customers",
      "estimates",
      "invoices",
      "inventory",
      "employees",
      "communication",
      "marketing",
      "accounting",
      "settings"
    ],
    sharedModules: [
      "analytics",
      "automation"
    ],
    pinnedModules: ["dashboard", "schedule", "customers", "estimates", "invoices", "inventory"],
    priorities: {
      schedule: 1,
      customers: 2,
      estimates: 3,
      invoices: 4,
      inventory: 5,
      employees: 6
    }
  }
};

/**
 * Role-based access control
 */
export const USER_ROLES = {
  OWNER: {
    label: "Business Owner",
    level: 100,
    canManageNavigation: true,
    canAccessAllModules: true
  },
  MANAGER: {
    label: "Manager",
    level: 80,
    canManageNavigation: true,
    canAccessAllModules: true
  },
  SUPERVISOR: {
    label: "Supervisor", 
    level: 60,
    canManageNavigation: false,
    canAccessAllModules: false
  },
  DISPATCHER: {
    label: "Dispatcher",
    level: 50,
    canManageNavigation: false,
    canAccessAllModules: false
  },
  TECHNICIAN: {
    label: "Technician",
    level: 40,
    canManageNavigation: false,
    canAccessAllModules: false
  },
  CSR: {
    label: "Customer Service Rep",
    level: 40,
    canManageNavigation: false,
    canAccessAllModules: false
  },
  SALES: {
    label: "Sales Representative",
    level: 40,
    canManageNavigation: false,
    canAccessAllModules: false
  },
  ACCOUNTING: {
    label: "Accounting",
    level: 50,
    canManageNavigation: false,
    canAccessAllModules: false
  }
};
